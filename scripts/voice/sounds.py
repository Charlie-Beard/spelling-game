"""
Repairs the pure phonics sounds locally, without asking ElevenLabs again.

    python scripts/voice/sounds.py            # candidates for each flagged sound → scripts/voice/takes/ph/
    python scripts/voice/sounds.py --apply    # ...and use the best one that passes the checks
    python scripts/voice/sounds.py --apply s o

Text-to-speech can't say a sound on its own: asked for "/sːː/" it says
"sss-uh", and "/ɒ/" came out nearer "ar". But the hiss is already there
before the "uh", and the narrator says every vowel cleanly inside words:

  hiss    s f sh th ch x: keep what comes before the voice starts; s f sh th
          are held for half a second with noise of the same colour.
  held    m n ng l r v z: cut where the sound opens into a vowel, and hold it.
  vowel   cut the steady middle of the vowel out of the narrator's best words
          for it: the curriculum's words, and words in the narrator's own
          lines (LINE_WORDS: "book" for oo, "words" for ur), found with
          Whisper's word timings. Lines are whole sentences, where ElevenLabs
          speaks best. Schwa is also tried as a short "er".
  glide   y: the start of a "you", run into a short "uh".

A sound is repaired if it is marked wrong in review.json, or check.py flags
it and nobody has passed it. Candidates are ranked by how close the vowel
sits to where it should; the best three stay as takes. --apply uses the best
and keeps the old clip as a take, so /review.html can switch back.
"""
import argparse, json, os, re, shutil, subprocess, sys, tempfile

import numpy as np
import parselmouth
from parselmouth.praat import call

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from check import AUDIO, HERE, SHORT_VOWELS, TAKES, Checker, Ears, Frames, bark, file_hash, path_of, stash, vowel_of  # noqa: E402
from generate import encode  # noqa: E402

HISS = {"s", "f", "sh", "th", "ch", "x"}
HELD = {"m", "n", "ng", "l", "r", "v", "z"}
# Loudness for a held hiss, as RMS dBFS. Left alone, a vowel-matched level
# would make fff and th as loud as a shout; these sit just under speech.
HISS_RMS = {"s": -22, "sh": -21, "f": -27, "th": -28}
# Consonants a vowel can be cut cleanly away from (not l r w y, which glide into it).
CLEAN_EDGE = set("pbtdkgcfsvzhjx") | {"sh", "ch", "th", "ck", "ss"}
# Words in the narrator's own lines that hold a sound the curriculum's words
# don't (or not cleanly). Lines are whole sentences, where ElevenLabs speaks best.
LINE_WORDS = {
    "o": ["hogwarts", "got"],
    "oo-short": ["book", "look"],
    "ur": ["word", "words", "work", "turn", "world", "myrtle", "hermione"],
    "schwa": ["potter", "wizard", "dragon"],
    "y": ["you"],
}
# Sounds taken from a word's last vowel rather than its stressed one.
LAST_VOWEL = {"schwa"}
# Sounds that are another sound's vowel said shorter (er and schwa are both ə).
SAME_VOWEL = {"schwa": "er"}
# Where a vowel should sit (F1, F2 Hz) when the narrator's words can't say:
# typical values for a young woman's southern British English.
TARGET = {"oo-short": (450, 1500), "ur": (600, 1650), "schwa": (650, 1550)}
# How long to hold each vowel, in seconds (others 0.28).
LENGTH = {"ur": 0.42, "oo-short": 0.24, "schwa": 0.18}


def fade(x, sr, fade_in=0.02, fade_out=0.06):
    x = x.copy()
    a, b = int(fade_in * sr), int(fade_out * sr)
    if a:
        x[:a] *= np.linspace(0, 1, a)
    if b:
        x[-b:] *= np.linspace(1, 0, b) ** 2
    return x


def hold_noise(x, sr, target):
    """Extends a hiss with fresh noise of the same spectrum, so it doesn't buzz."""
    n = int(target * sr)
    if len(x) >= n:
        return x
    frames = [x[i:i + 1024] * np.hanning(1024) for i in range(0, len(x) - 1024, 256)]
    mag = np.mean([np.abs(np.fft.rfft(f)) for f in frames], axis=0)
    noise = np.random.default_rng(0).standard_normal(n + 2048)
    spec = np.fft.rfft(noise)
    spec *= np.interp(np.linspace(0, 1, len(spec)), np.linspace(0, 1, len(mag)), mag)
    noise = np.fft.irfft(spec, len(noise))[:n]
    steady = x[len(x) // 4: -len(x) // 4]
    noise *= np.sqrt(np.mean(steady ** 2)) / (np.sqrt(np.mean(noise ** 2)) + 1e-12)
    xf = int(0.04 * sr)
    out = noise.copy()
    out[:len(x) - xf] = x[:len(x) - xf]
    ramp = np.linspace(1, 0, xf)
    out[len(x) - xf:len(x)] = x[-xf:] * ramp + noise[len(x) - xf:len(x)] * (1 - ramp)
    return out


def set_rms(x, db):
    gain = 10 ** (db / 20) / (np.sqrt(np.mean(x ** 2)) + 1e-12)
    gain = min(gain, 10 ** (-2 / 20) / (np.abs(x).max() + 1e-12))
    return x * gain


def lengthen(snd, target):
    if snd.duration >= target:
        return snd
    return call(snd, "Lengthen (overlap-add)", max(75, int(3.5 / snd.duration) + 1), 600, target / snd.duration)


def hiss(ph, src):
    """The sound before the voice starts."""
    snd = parselmouth.Sound(src)
    f = Frames(src)
    loud = np.where(f.db > f.db.max() - 30)[0]
    voiced = np.where(f.f0 > 0)[0]
    start = max(0.0, f.t[loud[0]] - 0.01)
    end = f.t[voiced[0]] - 0.015 if len(voiced) else f.t[loud[-1]] + 0.01
    if end - start < 0.06:
        return None
    sr = snd.sampling_frequency
    x = snd.values[0][int(start * sr):int(end * sr)]
    if ph in HISS_RMS:
        x = set_rms(hold_noise(x, sr, 0.5), HISS_RMS[ph])
    return fade(x, sr, 0.03, 0.08), sr


def held(ph, src):
    """A voiced sound, up to where it opens into a vowel."""
    snd = parselmouth.Sound(src)
    f = Frames(src)
    v = np.where(f.f0 > 0)[0]
    if not len(v):
        return None
    at = f.opens_at()
    end = at - 0.015 if at is not None else f.t[v[-1]]
    start = max(0.0, f.t[v[0]] - 0.02)
    if end - start < 0.08:
        return None
    part = lengthen(snd.extract_part(from_time=start, to_time=end, preserve_times=False), 0.45)
    return fade(part.values[0], part.sampling_frequency, 0.02, 0.08), part.sampling_frequency


def vowel_part(src, window=None, last=False):
    """The steady middle of a vowel in a clip: the loudest (stressed) one, or the last.

    window limits it to (start, end) seconds, for one word inside a line.
    """
    snd = parselmouth.Sound(src)
    f = Frames(src)
    inside = np.ones(len(f.t), bool)
    if window is not None:
        # Whisper's word ends are early; an unstressed last vowel needs more room.
        inside = (f.t >= window[0] - 0.03) & (f.t <= window[1] + (0.08 if last else 0.03))
    voiced = f.f0 > 0
    # Bridge one- or two-frame drop-outs in the pitch track.
    for i in range(1, len(voiced) - 2):
        if not voiced[i] and voiced[i - 1] and (voiced[i + 1] or voiced[i + 2]):
            voiced[i] = True
    v = inside & voiced
    if v.sum() < 4:
        return None
    # An unstressed vowel can be 15 dB under the stressed one.
    k = v & (f.db >= f.db[v].max() - (20 if last else 10)) & (np.nan_to_num(f.F1) > 300)
    runs, i = [], 0
    while i < len(k):
        if k[i]:
            j = i
            while j + 1 < len(k) and k[j + 1]:
                j += 1
            runs.append((i, j))
            i = j + 1
        else:
            i += 1
    runs = [r for r in runs if r[1] - r[0] >= 5]
    if not runs:
        return None
    lo, hi = runs[-1] if last else max(runs, key=lambda r: f.db[r[0]:r[1] + 1].max())
    # Leave out the glides into and out of the neighbouring consonants.
    trim = min(0.025, (hi - lo) * 0.005 * 0.15)
    a, b = f.t[lo] + trim, f.t[hi] - trim
    if b - a < 0.03:
        return None
    return snd.extract_part(from_time=a, to_time=b, preserve_times=False)


def vowel(src, window=None, last=False, length=0.28):
    """A vowel cut out of a word and held (or cut down) to `length` seconds."""
    part = vowel_part(src, window, last)
    if part is None:
        return None
    if part.duration > length:
        mid = part.duration / 2
        part = part.extract_part(from_time=mid - length / 2, to_time=mid + length / 2, preserve_times=False)
    part = lengthen(part, length)
    return fade(part.values[0], part.sampling_frequency, 0.015, 0.05), part.sampling_frequency


def glide(src, window, uh_src):
    """The y at the start of a "you", run into a short "uh" at the same pitch."""
    snd = parselmouth.Sound(src)
    f = Frames(src)
    v = np.where((f.t >= window[0] - 0.05) & (f.t <= window[1] + 0.05) & (f.f0 > 0))[0]
    uh = vowel_part(uh_src)
    if len(v) < 8 or uh is None:
        return None
    t0 = f.t[v[0]]
    y = snd.extract_part(from_time=max(0.0, t0 - 0.015), to_time=t0 + 0.075, preserve_times=False)
    pitch = float(f.f0[v[min(14, len(v) - 1)]])
    uh = call(lengthen(uh, 0.13), "Change gender", 75, 600, 1.0, pitch, 1.0, 1.0)
    sr = y.sampling_frequency
    uh = call(uh, "Resample", sr, 50).values[0][:int(0.13 * sr)]
    x, n = y.values[0], int(0.025 * sr)
    ramp = np.linspace(1, 0, n)
    out = np.concatenate([x[:-n], x[-n:] * ramp + uh[:n] * (1 - ramp), uh[n:]])
    return fade(out, sr, 0.01, 0.05), sr


def source_words(check, ph):
    """The curriculum words holding a vowel: no flags, clean edges, nearest where it should be."""
    found = []
    for w, phs in check.units.items():
        if ph not in phs or len(phs) > 4 or vowel_of(w, phs) != ph:
            continue
        if check("words", w, path_of("words", w))[0]:
            continue
        d = distance(check, ph, path_of("words", w))
        # A vowel next to l, r or w glides; prefer one between clean edges.
        i = phs.index(ph)
        d += 0.5 * sum(p not in CLEAN_EDGE for p in (phs[i - 1] if i else "", phs[i + 1] if i + 1 < len(phs) else "") if p)
        found.append((d, w))
    return [w for _, w in sorted(found)]


def write(x, sr, dst, normalise):
    with tempfile.TemporaryDirectory() as td:
        wav = os.path.join(td, "x.wav")
        parselmouth.Sound(x, sr).save(wav, "WAV")
        if normalise:
            encode(wav, dst)
        else:
            subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", wav, "-af", "apad=pad_dur=0.06", "-ac", "1",
                            "-ar", "44100", "-codec:a", "libmp3lame", "-b:a", "64k", dst], check=True)


def line_tokens(check, ph):
    """Where a line in the narrator's voice says one of LINE_WORDS[ph]: (line id, word, start, end).

    Word timings come from Whisper, cached in takes/align.json by the line's hash.
    """
    words = set(LINE_WORDS.get(ph, ()))
    if not words:
        return []
    cfg = json.load(open(os.path.join(HERE, "elevenlabs.json"), encoding="utf-8"))
    voice = cfg["speakers"]["narrator"]["voice_id"]
    same = {s for s, v in cfg["speakers"].items() if v["voice_id"] == voice}
    cache_path = os.path.join(TAKES, "align.json")
    cache = json.load(open(cache_path, encoding="utf-8")) if os.path.exists(cache_path) else {}
    found = []
    for lid, line in check.lines.items():
        path = path_of("lines", lid)
        if line["speaker"] not in same or not words & set(re.findall(r"[a-z']+", line["text"].lower())) or not os.path.exists(path):
            continue
        h = file_hash(path)
        if cache.get(lid, {}).get("hash") != h:
            check.ears = check.ears or Ears()
            cache[lid] = {"hash": h, "words": [[w, round(a, 3), round(b, 3)] for w, a, b in check.ears.words(path)]}
        found += [(lid, w, a, b) for w, a, b in cache[lid]["words"] if w in words]
    os.makedirs(TAKES, exist_ok=True)
    json.dump(cache, open(cache_path, "w", encoding="utf-8"))
    return found


def distance(check, ph, path):
    """How far a vowel is from where it should be, in Bark: the narrator's own if known, else TARGET."""
    goal = check.voice.centre.get(ph) if ph in SHORT_VOWELS else None
    if goal is None and ph in TARGET:
        goal = tuple(bark(x) for x in TARGET[ph])
    m = Frames(path).vowel()
    if goal is None or not m:
        return 0.0 if goal is None else 9.0
    return float(np.hypot(bark(m[0]) - goal[0], bark(m[1]) - goal[1]))


def candidates(check, ph):
    """(label, samples, rate, normalise) for every way of making this sound."""
    src = path_of("ph", ph)
    out = []
    if ph in HISS and (r := hiss(ph, src)):
        out.append(("trimmed", *r, False))
    if ph in HELD and (r := held(ph, src)):
        out.append(("trimmed", *r, False))
    length = LENGTH.get(ph, 0.28)
    if ph in SAME_VOWEL:
        if r := vowel(path_of("ph", SAME_VOWEL[ph]), length=length):
            out.append((f"short-{SAME_VOWEL[ph]}", *r, True))
    if ph in SHORT_VOWELS or ph in TARGET:
        made = 0
        # Many words' vowels are too short to cut; keep going down the list.
        for w in source_words(check, ph):
            if r := vowel(path_of("words", w), length=length):
                out.append((f"from-{w}", *r, True))
                made += 1
                if made == 3:
                    break
    if ph == "y":
        uh = path_of("ph", "er")
        for n, (lid, w, a, b) in enumerate(line_tokens(check, ph)):
            if r := glide(path_of("lines", lid), (a, b), uh):
                out.append((f"from-{w}-{lid}", *r, True))
    else:
        for lid, w, a, b in line_tokens(check, ph):
            if r := vowel(path_of("lines", lid), (a, b), last=ph in LAST_VOWEL, length=length):
                out.append((f"from-{w}-{lid}", *r, True))
    return out


def repair(check, ph, apply=False, was="previous", keep=3):
    """Makes candidates for one sound as takes, best first; with apply, uses the best."""
    cands = candidates(check, ph)
    if not cands:
        print(f"{ph:4} nothing to make it from: needs a re-record or a grown-up's recording")
        return None

    os.makedirs(os.path.join(TAKES, "ph", ph), exist_ok=True)
    scored = []
    for label, x, sr, normalise in cands:
        dst = path_of("ph", ph, label)
        write(x, sr, dst, normalise)
        flags = check("ph", ph, dst, label)[0]
        scored.append((len(flags), round(distance(check, ph, dst), 2), label, flags))
    scored.sort()
    for i, (_, d, label, flags) in enumerate(scored):
        if i >= keep:
            os.remove(path_of("ph", ph, label))
            continue
        print(f"{ph:9} {label:24} {'; '.join(flags) or 'passes'}" + (f"  (vowel off by {d})" if d else ""))
    best = scored[0][2] if not scored[0][0] else None
    if apply and best:
        stash("ph", ph, was)
        shutil.copyfile(path_of("ph", ph, best), path_of("ph", ph))
        print(f"{ph:9} now uses {best}")
    return best


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("sounds", nargs="*", help="only these sounds (default: flagged or marked wrong)")
    ap.add_argument("--apply", action="store_true", help="use the best candidate as the clip")
    args = ap.parse_args()

    check = Checker(whisper=False)
    review_path = os.path.join(HERE, "review.json")
    review = json.load(open(review_path, encoding="utf-8")) if os.path.exists(review_path) else {}
    manifest = json.load(open(os.path.join(AUDIO, "manifest.json"), encoding="utf-8"))

    def verdict(ph):
        v = review.get(f"ph/{ph}", {})
        return v.get("verdict") if v.get("hash") == file_hash(path_of("ph", ph)) else None

    # A grown-up's verdict beats the checks: what they passed is left alone.
    for ph in args.sounds or [ph for ph in manifest["ph"]
                              if verdict(ph) == "bad" or (verdict(ph) != "ok" and check("ph", ph, path_of("ph", ph))[0])]:
        repair(check, ph, args.apply)


if __name__ == "__main__":
    main()
