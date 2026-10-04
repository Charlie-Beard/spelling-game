"""
Records the narrator, either offline with Kokoro or with ElevenLabs.

    python3 scripts/voice/generate.py --model DIR                  # Kokoro
    ELEVENLABS_API_KEY=... python3 scripts/voice/generate.py --provider elevenlabs

Reads scripts/voice/lines.json (from export.ts) and writes trimmed,
loudness-matched mono MP3s to public/audio/{words,ph,lines}/ plus
public/audio/manifest.json. Existing files are kept unless --force.

To fix clips rather than record everything, mark them wrong in /review.html
and re-record just those, after checking what would be sent:

    python3 scripts/voice/generate.py --provider elevenlabs --redo --dry-run
    python3 scripts/voice/generate.py --provider elevenlabs --redo

Words are recorded as several takes (--takes, default 3; a word costs ~5
characters) and check.py's checks pick the best; the rest stay in
scripts/voice/takes/ to choose from in /review.html.

ElevenLabs voices live in scripts/voice/elevenlabs.json. It skips the pure
phonics sounds (ph/), unless --phonemes asks it to try them via Eleven v4's
IPA support; sounds.py repairs those locally instead.
"""
import argparse, hashlib, json, os, shutil, subprocess, sys, tempfile, time, urllib.error, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, "public", "audio")
HERE = os.path.join(ROOT, "scripts", "voice")
TAKES = os.path.join(HERE, "takes")
NARRATOR = "bf_emma"

# A bare one-word prompt is a whole utterance, and speakers whisper, creak or
# squeak the end of an utterance: hat came back with no voice at all, bun
# squeaky, cap sounding like "cup". ElevenLabs reads this context without
# saying it, so the word is said mid-sentence, the way a teacher dictates it.
WORD_CONTEXT = ("The next word is", "Now, can you spell it?")

# Character voices for chapter intros: (voice, speed)
SPEAKERS = {
    "narrator": (NARRATOR, 0.92),
    "hagrid": ("bm_george", 0.86), "ollivander": ("bm_lewis", 0.88), "trevor": ("bf_lily", 0.98),
    "nick": ("bm_fable", 0.92), "voldemort": ("bm_daniel", 0.82), "dobby": ("bm_fable", 1.0),
    "gnome": ("bm_lewis", 1.0), "willow": ("bm_george", 0.85), "fawkes": (NARRATOR, 0.9),
    "basilisk": ("bm_daniel", 0.8), "crookshanks": ("bf_alice", 0.9), "lupin": ("bm_lewis", 0.9),
    "buckbeak": (NARRATOR, 0.9), "wormtail": ("bm_fable", 1.0), "moody": ("bm_george", 0.9),
    "horntail": ("bm_daniel", 0.85), "myrtle": ("bf_lily", 0.95), "bellatrix": ("bf_isabella", 0.95),
    "sirius": ("bm_lewis", 0.92), "luna": ("bf_alice", 0.85), "neville": ("bm_fable", 0.92),
    "deatheater": ("bm_daniel", 0.85), "slughorn": ("bm_george", 0.9), "dumbledore": ("bm_daniel", 0.86),
    "ginny": ("bf_lily", 0.95), "nagini": ("bf_isabella", 0.82), "kreacher": ("bm_fable", 0.88),
    "griphook": ("bm_lewis", 0.88), "mcgonagall": ("bf_isabella", 0.9),
}

# Pure sounds, written in IPA. Continuants are held; stops get the
# shortest possible neutral vowel, as phonics teachers model them.
PHONEME_IPA = {
    "s": "sːː", "a": "æ", "t": "tə", "p": "pə", "i": "ɪ", "n": "nːː", "m": "mːː", "d": "də",
    "g": "ɡə", "o": "ɒ", "k": "kə", "e": "ɛ", "u": "ʌ", "r": "ɹːː", "h": "hə", "b": "bə",
    "f": "fːː", "l": "lːː", "j": "ʤə", "v": "vːː", "w": "wə", "x": "ks", "y": "jə", "z": "zːː",
    "qu": "kwə", "ch": "ʧ", "sh": "ʃːː", "th": "θːː", "ng": "ŋːː", "nk": "ŋk", "ai": "eɪ",
    "ee": "iː", "igh": "aɪ", "oa": "əʊ", "oo-long": "uː", "oo-short": "ʊ", "ar": "ɑː",
    "or": "ɔː", "ur": "ɜː", "ow": "aʊ", "oi": "ɔɪ", "ear": "ɪə", "air": "eə", "er": "ə",
    "schwa": "ə",
}


def encode(src, path, tail_ms=60):
    """Trims silence, matches loudness and writes a mono MP3."""
    filt = (
        "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.02,"
        "areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.02,areverse,"
        f"apad=pad_dur={tail_ms / 1000},loudnorm=I=-18:TP=-2:LRA=7"
    )
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", src, "-af", filt, "-ac", "1", "-ar", "44100",
         "-codec:a", "libmp3lame", "-b:a", "64k", path],
        check=True,
    )


class KokoroVoice:
    can_phonemes = True

    def __init__(self, model_dir):
        global np, sf
        import numpy as np
        import soundfile as sf
        from kokoro_onnx import Kokoro
        self.k = Kokoro(os.path.join(model_dir, "kokoro-v1.0.onnx"), os.path.join(model_dir, "voices-v1.0.bin"))

    def _render(self, tmp, **kw):
        s, sr = self.k.create(lang="en-gb", **kw)
        sf.write(tmp, np.asarray(s, dtype=np.float32), sr)

    def word(self, w, tmp, seed=None):
        self._render(tmp, text=f"{w}.", voice=NARRATOR, speed=0.82)

    def phoneme(self, ph, tmp):
        self._render(tmp, text=PHONEME_IPA[ph], voice=NARRATOR, speed=0.9, is_phonemes=True)

    def line(self, text, speaker, tmp):
        voice, speed = SPEAKERS.get(speaker, SPEAKERS["narrator"])
        self._render(tmp, text=text, voice=voice, speed=speed)


class ElevenLabsVoice:
    API = "https://api.elevenlabs.io/v1"

    def __init__(self, phonemes=False, dry_run=False):
        self.dry_run = dry_run
        self.key = os.environ.get("ELEVENLABS_API_KEY")
        if not self.key and not dry_run:
            sys.exit("Set ELEVENLABS_API_KEY (from elevenlabs.io → Profile → API keys).")
        cfg = json.load(open(os.path.join(HERE, "elevenlabs.json"), encoding="utf-8"))
        self.model = cfg["model_id"]
        self.phoneme_model = cfg.get("phoneme_model", "eleven_v4")
        self.can_phonemes = phonemes
        self.word_speed = cfg.get("word_speed", 0.85)
        self.word_stability = cfg.get("word_stability", 0.75)
        self.speakers = cfg["speakers"]
        self.billed = 0

    def _request(self, method, path, body=None):
        req = urllib.request.Request(
            self.API + path, method=method,
            data=json.dumps(body).encode() if body is not None else None,
            headers={"xi-api-key": self.key, "Content-Type": "application/json"},
        )
        for attempt in range(5):
            try:
                with urllib.request.urlopen(req, timeout=120) as r:
                    return r.read()
            except urllib.error.HTTPError as e:
                if e.code in (429, 500, 502, 503) and attempt < 4:
                    time.sleep(2 ** (attempt + 1))
                    continue
                sys.exit(f"ElevenLabs {e.code}: {e.read().decode(errors='replace')}")

    def list_voices(self):
        for v in json.loads(self._request("GET", "/voices"))["voices"]:
            labels = ", ".join(f"{k}={x}" for k, x in (v.get("labels") or {}).items())
            print(f"{v['voice_id']}  {v['name']:<24} {labels}")

    def _render(self, text, spec, tmp, speed=None, model=None, stability=None, seed=None, context=None):
        body = {
            "text": text,
            "model_id": model or self.model,
            "language_code": "en",
            "voice_settings": {
                "stability": stability or spec.get("stability", 0.5),
                "similarity_boost": spec.get("similarity_boost", 0.75),
                "style": spec.get("style", 0),
                "speed": speed or spec.get("speed", 1.0),
            },
        }
        if seed is not None:
            body["seed"] = seed
        if context:
            body["previous_text"], body["next_text"] = context
        self.billed += len(text)
        if self.dry_run:
            said = f"[{context[0]}] {text} [{context[1]}]" if context else text
            print(f"  would send {len(text):>3} chars: {said}  (seed {seed})" if seed is not None else f"  would send {len(text):>3} chars: {said}")
            return False
        audio = self._request("POST", f"/text-to-speech/{spec['voice_id']}?output_format=mp3_44100_128", body)
        with open(tmp, "wb") as f:
            f.write(audio)
        return True

    def word(self, w, tmp, seed=None):
        return self._render(f"{w}.", self.speakers["narrator"], tmp, speed=self.word_speed,
                            stability=self.word_stability, seed=seed, context=WORD_CONTEXT)

    def phoneme(self, ph, tmp):
        # Experimental: Eleven v4 reads IPA between slashes, but adds "uh" to
        # held sounds; make() trims it off with sounds.py. Listen before keeping.
        return self._render(f"/{PHONEME_IPA[ph]}/", self.speakers["narrator"], tmp, speed=0.9, model=self.phoneme_model)

    def line(self, text, speaker, tmp):
        return self._render(text, self.speakers.get(speaker, self.speakers["narrator"]), tmp)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--provider", choices=("kokoro", "elevenlabs"), default="kokoro")
    ap.add_argument("--model", help="Kokoro only: dir with kokoro-v1.0.onnx and voices-v1.0.bin")
    ap.add_argument("--only", default="words,ph,lines", help="comma list of words,ph,lines")
    ap.add_argument("--speaker", help="only lines spoken by this speaker (e.g. hagrid)")
    ap.add_argument("--limit", type=int, help="at most N clips of each kind, for auditioning voices")
    ap.add_argument("--force", action="store_true", help="redo clips that already exist")
    ap.add_argument("--list-voices", action="store_true", help="ElevenLabs only: print your voice IDs")
    ap.add_argument("--phonemes", action="store_true",
                    help="ElevenLabs only, experimental: also record pure sounds (ph/) via Eleven v4 IPA")
    ap.add_argument("--redo", action="store_true", help="only the clips marked wrong in /review.html")
    ap.add_argument("--clips", help="only these clips, e.g. words/cap,lines/1001tlp")
    ap.add_argument("--takes", type=int, default=3, help="ElevenLabs takes per word; the checks keep the best")
    ap.add_argument("--dry-run", action="store_true", help="print what would be sent and its cost; send nothing")
    args = ap.parse_args()

    if args.provider == "elevenlabs":
        v = ElevenLabsVoice(args.phonemes, args.dry_run)
        if args.list_voices:
            return v.list_voices()
    else:
        if not args.model:
            ap.error("--model is required for kokoro")
        v = KokoroVoice(args.model)

    only = set(args.only.split(","))
    # utf-8 explicitly: Windows would otherwise read ’ as "â€™" and the voice reads that out.
    data = json.load(open(os.path.join(HERE, "lines.json"), encoding="utf-8"))
    for d in ("words", "ph", "lines"):
        os.makedirs(os.path.join(OUT, d), exist_ok=True)

    sys.path.insert(0, HERE)
    from check import file_hash, stash

    # Which clips to record: the ones asked for, else the missing ones (or all with --force).
    chosen = None
    if args.redo or args.clips:
        chosen = set(args.clips.split(",")) if args.clips else set()
        review_path = os.path.join(HERE, "review.json")
        review = json.load(open(review_path, encoding="utf-8")) if os.path.exists(review_path) else {}
        for key, r in review.items():
            kind, cid = key.split("/", 1)
            path = os.path.join(OUT, kind, f"{cid}.mp3")
            # A verdict on an older recording of the clip doesn't count.
            if args.redo and r["verdict"] == "bad" and os.path.exists(path) and file_hash(path) == r["hash"]:
                chosen.add(key)
                print(f"redo {key}" + (f"  (“{r['note']}”)" if r.get("note") else ""))
        if not chosen:
            return print("Nothing marked wrong in /review.html.")

    def wanted(kind, cid):
        if chosen is not None:
            return f"{kind}/{cid}" in chosen
        return args.force or not os.path.exists(os.path.join(OUT, kind, f"{cid}.mp3"))

    def make(kind, cid, fn):
        path = os.path.join(OUT, kind, f"{cid}.mp3")
        with tempfile.TemporaryDirectory() as td:
            tmp = os.path.join(td, "raw.mp3" if args.provider == "elevenlabs" else "raw.wav")
            if fn(tmp) is False:
                return False
            stash(kind, cid)
            encode(tmp, path)
        print("wrote", os.path.relpath(path, ROOT), flush=True)
        return True

    checker = None

    def make_word(w):
        """Several takes; the checks keep the best one and the others stay as takes."""
        nonlocal checker
        if args.provider != "elevenlabs" or args.takes <= 1:
            return make("words", w, lambda tmp: v.word(w, tmp))
        takes = []
        for _ in range(args.takes):
            seed = int.from_bytes(os.urandom(4), "big")
            label = f"el-{seed}"
            dst = os.path.join(TAKES, "words", w, f"{label}.mp3")
            with tempfile.TemporaryDirectory() as td:
                tmp = os.path.join(td, "raw.mp3")
                if v.word(w, tmp, seed) is False:
                    continue
                os.makedirs(os.path.dirname(dst), exist_ok=True)
                encode(tmp, dst)
            takes.append((label, dst))
        if not takes:
            return
        if checker is None:
            from check import Checker
            checker = Checker()
        scored = []
        for label, dst in takes:
            flags, hints, _ = checker("words", w, dst, label)
            scored.append((len(flags), len(hints), label, dst, flags + hints))
            print(f"  {w} {label}: {'; '.join(flags + hints) or 'passes'}")
        scored.sort()
        stash("words", w)
        shutil.copyfile(scored[0][3], os.path.join(OUT, "words", f"{w}.mp3"))
        print(f"wrote public/audio/words/{w}.mp3 ← {scored[0][2]}", flush=True)

    take = lambda xs: xs[: args.limit] if args.limit else xs

    if "words" in only and not args.speaker:
        for w in take([w for w in data["words"] if wanted("words", w)]):
            make_word(w)

    if "ph" in only and not args.speaker:
        if v.can_phonemes:
            for ph in take([p for p in data["phonemes"] if wanted("ph", p)]):
                if make("ph", ph, lambda tmp, ph=ph: v.phoneme(ph, tmp)) and args.provider == "elevenlabs":
                    if checker is None:
                        from check import Checker
                        checker = Checker(whisper=False)
                    # Eleven v4 says "sss-uh"; keep just the "sss".
                    if checker("ph", ph, os.path.join(OUT, "ph", f"{ph}.mp3"))[0]:
                        from sounds import repair
                        repair(checker, ph, apply=True, was="raw")
        elif chosen is None or any(k.startswith("ph/") for k in chosen):
            print("skipping ph/: run sounds.py to repair them, or pass --phonemes to try Eleven v4 IPA")

    if "lines" in only:
        lines = [l for l in data["lines"] if (not args.speaker or l["speaker"] == args.speaker) and wanted("lines", l["id"])]
        for line in take(lines):
            make("lines", line["id"],
                 lambda tmp, l=line: v.line(l["text"].replace("’", "'").replace("…", "..."), l["speaker"], tmp))

    if args.dry_run:
        return print(f"\nWould send {v.billed:,} characters. Nothing was sent.")
    if args.provider == "elevenlabs":
        print(f"\nSent {v.billed:,} characters.")

    manifest = {
        "words": sorted(f[:-4] for f in os.listdir(os.path.join(OUT, "words")) if f.endswith(".mp3")),
        "ph": sorted(f[:-4] for f in os.listdir(os.path.join(OUT, "ph")) if f.endswith(".mp3")),
        "lines": sorted(f[:-4] for f in os.listdir(os.path.join(OUT, "lines")) if f.endswith(".mp3")),
    }
    json.dump(manifest, open(os.path.join(OUT, "manifest.json"), "w", encoding="utf-8"))
    print("manifest:", {k2: len(v2) for k2, v2 in manifest.items()})


if __name__ == "__main__":
    main()
