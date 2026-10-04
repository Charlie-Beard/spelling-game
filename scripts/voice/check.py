"""
Listens to the recorded clips and flags the ones that are probably wrong, so a
person only has to judge the suspects (in /review.html) and ElevenLabs only
re-records what is actually broken.

    pip install faster-whisper praat-parselmouth numpy
    python scripts/voice/check.py                      # everything → scripts/voice/qa.json
    python scripts/voice/check.py --only words,ph --no-whisper

Writes, per clip (and per alternative take in scripts/voice/takes/), "flags"
that count against it and "hints" that are only worth a listen:

  whispered  A word whose vowel is barely voiced. ElevenLabs whispers or
             breathes some one-word prompts (hat had no voicing at all).
  vowel      The vowel's formants (F1, F2) sit nearer another vowel in the
             narrator's own vowel space (cap measured nearer "cup"). The
             narrator's own words are the yardstick, so a British accent
             doesn't count as wrong.
  tail       A sound that must be pure (sss, fff, shh) ends in "uh".
  heard      Whisper transcribed something else. Whisper is American-trained
             and hears British vowels as other words (nut → "not"), so this
             is a flag only when it is also unsure, otherwise a hint.
  misread    A line whose transcript differs a lot from its text.
"""
import argparse, datetime, difflib, hashlib, json, os, re, shutil, subprocess, sys

import numpy as np
import parselmouth

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
AUDIO = os.path.join(ROOT, "public", "audio")
HERE = os.path.join(ROOT, "scripts", "voice")
TAKES = os.path.join(HERE, "takes")

# Vowels the check measures, with a word to name each by.
VOWEL_WORD = {"a": "cat", "e": "net", "i": "pin", "o": "rock", "u": "mug", "ar": "car", "ee": "bee", "or": "fork", "oo-long": "moon"}
SHORT_VOWELS = {"a", "e", "i", "o", "u"}
# Words whose vowel isn't the phonics one in southern British English.
VOWEL_EXCEPTIONS = {"mask": "ar", "wand": "o"}
# Sounds held with no voice at all, and voiced ones held with no vowel after.
UNVOICED = {"s", "f", "sh", "th", "ch", "x"}
VOICED_PURE = {"m", "n", "ng", "l", "r", "v", "z"}
WHISPERED_MS = 90


def file_hash(path):
    return hashlib.sha1(open(path, "rb").read()).hexdigest()[:10]


def bark(f):
    return 26.81 * f / (1960 + f) - 0.53


class Frames:
    """Pitch, loudness and formants every 5 ms."""

    def __init__(self, path):
        snd = parselmouth.Sound(path)
        self.duration = snd.duration
        pitch = snd.to_pitch_ac(time_step=0.005, pitch_floor=75, pitch_ceiling=600, voicing_threshold=0.45)
        inten = snd.to_intensity(minimum_pitch=100, time_step=0.005)
        form = snd.to_formant_burg(time_step=0.005, max_number_of_formants=5, maximum_formant=5500)
        self.t = np.arange(0.01, max(0.011, snd.duration - 0.01), 0.005)
        self.f0 = np.nan_to_num(np.array([pitch.get_value_at_time(t) for t in self.t]))
        self.db = np.nan_to_num(np.array([inten.get_value(t) for t in self.t]), nan=-100)
        self.F1 = np.array([form.get_value_at_time(1, t) for t in self.t])
        self.F2 = np.array([form.get_value_at_time(2, t) for t in self.t])

    @property
    def voiced_ms(self):
        return int((self.f0 > 0).sum() * 5)

    def vowel(self):
        """F1, F2 of the vowel: the most open part of the loud voiced stretch."""
        v = (self.f0 > 0) & ~np.isnan(self.F1) & ~np.isnan(self.F2)
        if v.sum() < 4:
            return None
        loud = v & (self.db >= self.db[v].max() - 8)
        keep = loud & (self.F1 >= np.percentile(self.F1[loud], 50))
        return float(np.median(self.F1[keep])), float(np.median(self.F2[keep]))

    def vowel_pitch(self):
        """Median pitch of the vowel, in semitones from 200 Hz."""
        k = (self.f0 > 0) & (self.db >= self.db.max() - 8) & (np.nan_to_num(self.F1) > 300)
        return float(np.median(12 * np.log2(self.f0[k] / 200))) if k.sum() >= 4 else None

    def opens_at(self):
        """When a held voiced sound (mmm, zzz) gets suddenly louder: it has opened into a vowel."""
        v = np.where(self.f0 > 0)[0]
        if len(v) < 20:
            return None
        # The first third of the voicing is the sound itself (an "uh" is shorter
        # than that, or it would be the sound); its median skips the fade-in.
        third = v[0] + (v[-1] - v[0]) // 3
        base = np.median(self.db[v[0]:third])
        for i in range(v[0] + 6, len(self.db) - 3):
            if (self.db[i:i + 3] >= base + 3.5).all() and (self.f0[i:i + 3] > 0).all():
                return float(self.t[i])
        return None

    def vowel_tail_ms(self):
        """How long a held voiced sound goes on after opening into a vowel."""
        at = self.opens_at()
        return int((self.t[np.where(self.f0 > 0)[0][-1]] - at) * 1000) if at is not None else 0


class Narrator:
    """The narrator's own vowels and pitch, measured from the recorded words."""

    def __init__(self, units, frames):
        pts, pitch = {}, []
        for w, phs in units.items():
            f = frames.get(w)
            if not f or f.voiced_ms < WHISPERED_MS:
                continue
            if (v := vowel_of(w, phs)) and (m := f.vowel()):
                pts.setdefault(v, []).append((bark(m[0]), bark(m[1])))
            if (p := f.vowel_pitch()) is not None:
                pitch.append(p)
        self.centre = {v: tuple(np.median(np.array(p), axis=0)) for v, p in pts.items() if len(p) >= 3}
        self.pitch = float(np.median(pitch)) if pitch else 0.0

    def judge(self, expected, m):
        """Returns a flag if a short vowel is clearly nearer another vowel than its own.

        Only the five short vowels are judged: the narrator says each of them
        in a dozen words, so their centres are reliable, and vowels next to
        l, r and w drift enough that the margin has to be generous.
        """
        if expected not in SHORT_VOWELS or expected not in self.centre or not m:
            return None
        z = (bark(m[0]), bark(m[1]))
        d = {v: float(np.hypot(z[0] - c[0], z[1] - c[1])) for v, c in self.centre.items()}
        near = min(d, key=d.get)
        if near != expected and d[expected] > 1.3 and d[expected] - d[near] > 0.4:
            return f"Vowel sounds nearer “{near}” ({VOWEL_WORD.get(near, near)}) than “{expected}” ({VOWEL_WORD[expected]})"
        return None

    def squeak(self, f):
        p = f.vowel_pitch()
        if p is not None and p - self.pitch > 10:
            return f"Squeaky: about {round(p - self.pitch)} semitones above the narrator's usual pitch"
        return None


def vowel_of(word, phs):
    if word in VOWEL_EXCEPTIONS:
        return VOWEL_EXCEPTIONS[word]
    vs = {p for p in phs if p in VOWEL_WORD or p in {"ai", "igh", "oa", "oo-short", "ur", "ow", "oi", "air", "ear", "er", "schwa"}}
    return next(iter(vs)) if len(vs) == 1 and next(iter(vs)) in VOWEL_WORD else None


class Ears:
    """Whisper, fed through ffmpeg (faster-whisper's own decoder is fussy about PyAV versions)."""

    def __init__(self):
        from faster_whisper import WhisperModel
        self.m = WhisperModel("small.en", device="cpu", compute_type="int8")

    def _segments(self, path):
        raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", "1", "-ar", "16000", "-"],
                             capture_output=True, check=True).stdout
        segs, _ = self.m.transcribe(np.frombuffer(raw, dtype=np.float32), beam_size=5, language="en",
                                    word_timestamps=True, condition_on_previous_text=False)
        return list(segs)

    def __call__(self, path):
        segs = self._segments(path)
        probs = [w.probability for s in segs for w in (s.words or [])]
        return " ".join(s.text.strip() for s in segs), (min(probs) if probs else 0.0)

    def words(self, path):
        """Each word heard, with its start and end in seconds."""
        return [(re.sub(r"[^a-z']", "", w.word.lower()), w.start, w.end)
                for s in self._segments(path) for w in (s.words or [])]


def norm(text):
    return re.sub(r"[^a-z' ]", "", text.lower().replace("’", "'").replace("-", " ")).split()


def check_word(word, phs, path, voice, ears, own_voice=True):
    f = Frames(path)
    flags, hints = [], []
    if f.voiced_ms < WHISPERED_MS:
        flags.append(f"Whispered or breathy: only {f.voiced_ms} ms of it is voiced")
    if own_voice and (msg := voice.squeak(f)):
        flags.append(msg)
    if own_voice and (v := vowel_of(word, phs)) and (msg := voice.judge(v, f.vowel())):
        flags.append(msg)
    if ears:
        heard, p = ears(path)
        if "".join(norm(heard)) != word:
            (flags if p < 0.3 else hints).append(f"Whisper heard “{heard}”" + (" (unsure)" if p < 0.3 else ""))
    return flags, hints, f


def check_ph(ph, path, voice, own_voice=True):
    f = Frames(path)
    flags = []
    if ph in UNVOICED and f.voiced_ms > 25:
        flags.append(f"Has a vowel on the end (“{ph}uh”, not a pure {ph}): {f.voiced_ms} ms voiced")
    if ph in VOICED_PURE and f.vowel_tail_ms() > 80:
        flags.append(f"Opens into a vowel (“{ph}uh”) for {f.vowel_tail_ms()} ms")
    if own_voice and (msg := voice.judge(ph, f.vowel())):
        flags.append(msg)
    return flags, [], f


def check_line(path, text, ears):
    heard, _ = ears(path)
    a, b = norm(text), norm(heard)
    if "".join(a) == "".join(b):  # "Horn tail" for "Horntail"
        return [], [], None
    sm = difflib.SequenceMatcher(None, a, b)
    wer = 1 - sum(m.size for m in sm.get_matching_blocks()) / max(1, len(a))
    # Whisper doesn't know the names ("Kreacher" → "Creature"), so a short line is only a hint.
    if wer > 0.5 and len(a) >= 3:
        return [f"Whisper heard “{heard}”"], [], None
    return [], ([f"Whisper heard “{heard}”"] if wer > 0.15 else []), None


def path_of(kind, cid, take=None):
    return os.path.join(TAKES, kind, cid, take + ".mp3") if take else os.path.join(AUDIO, kind, cid + ".mp3")


def takes_of(kind, cid):
    d = os.path.join(TAKES, kind, cid)
    return sorted(f[:-4] for f in os.listdir(d) if f.endswith(".mp3")) if os.path.isdir(d) else []


def stash(kind, cid, label="previous"):
    """Keeps the current clip as a take before it is replaced, unless an identical take exists."""
    cur = path_of(kind, cid)
    if not os.path.exists(cur):
        return
    h = file_hash(cur)
    if any(file_hash(path_of(kind, cid, t)) == h for t in takes_of(kind, cid)):
        return
    os.makedirs(os.path.join(TAKES, kind, cid), exist_ok=True)
    dst = path_of(kind, cid, label)
    shutil.copyfile(cur, dst if not os.path.exists(dst) else path_of(kind, cid, f"{label}-{h[:6]}"))


class Checker:
    """All the checks, with the narrator measured once. generate.py uses this to pick takes."""

    def __init__(self, whisper=True):
        data = json.load(open(os.path.join(HERE, "lines.json"), encoding="utf-8"))
        self.units = data.get("units")
        if not self.units:
            sys.exit("lines.json has no word units: run `npx tsx scripts/voice/export.ts` first.")
        self.lines = {l["id"]: l for l in data["lines"]}
        words = json.load(open(os.path.join(AUDIO, "manifest.json"), encoding="utf-8"))["words"]
        self.voice = Narrator(self.units, {w: Frames(path_of("words", w)) for w in words})
        self.ears = Ears() if whisper else None

    def __call__(self, kind, cid, path, take=None):
        """(flags, hints, frames) for one clip or take."""
        # Kokoro takes are a different speaker, so the narrator's vowels and pitch don't apply.
        own = not take or not take.startswith("kokoro")
        if kind == "words":
            return check_word(cid, self.units.get(cid, []), path, self.voice, self.ears, own)
        if kind == "ph":
            return check_ph(cid, path, self.voice, own)
        if self.ears and cid in self.lines:
            return check_line(path, self.lines[cid]["text"], self.ears)
        return [], [], None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", default="words,ph,lines")
    ap.add_argument("--no-whisper", action="store_true", help="skip transcription (fast, but misses garbled words)")
    ap.add_argument("--no-takes", action="store_true", help="don't check the alternative takes")
    args = ap.parse_args()
    only = [k for k in ("words", "ph", "lines") if k in args.only.split(",")]

    check = Checker(whisper=not args.no_whisper)
    manifest = json.load(open(os.path.join(AUDIO, "manifest.json"), encoding="utf-8"))
    out_path = os.path.join(HERE, "qa.json")
    out = json.load(open(out_path, encoding="utf-8")) if os.path.exists(out_path) else {"clips": {}}
    clips = out["clips"]

    for kind in only:
        if kind == "lines" and not check.ears:
            continue
        for cid in manifest[kind]:
            for take in [None] + ([] if args.no_takes or kind == "lines" else takes_of(kind, cid)):
                path = path_of(kind, cid, take)
                flags, hints, f = check(kind, cid, path, take)
                key = f"{kind}/{cid}" + (f"#{take}" if take else "")
                clips[key] = {"hash": file_hash(path), "flags": flags, "hints": hints}
                print(f"{'FLAG' if flags else '    '} {key:28} {'; '.join(flags + hints)}", flush=True)

    # Drop entries for clips and takes that no longer exist.
    for key in list(clips):
        kind, rest = key.split("/", 1)
        cid, _, take = rest.partition("#")
        if not os.path.exists(path_of(kind, cid, take or None)):
            del clips[key]

    out["checked"] = datetime.date.today().isoformat()
    json.dump(out, open(out_path, "w", encoding="utf-8"), ensure_ascii=False, indent=1, sort_keys=True)
    n = sum(1 for k, c in clips.items() if c["flags"] and "#" not in k)
    print(f"\n{n} clips flagged → {os.path.relpath(out_path, ROOT)}")


if __name__ == "__main__":
    main()
