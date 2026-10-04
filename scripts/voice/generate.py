"""
Records the narrator with Kokoro (an offline neural TTS) in British voices.

    python3 scripts/voice/generate.py --model DIR

Reads scripts/voice/lines.json (from export.ts) and writes trimmed,
loudness-matched mono MP3s to public/audio/{words,ph,lines}/ plus
public/audio/manifest.json. Existing files are kept unless --force.
"""
import argparse, json, os, subprocess, tempfile
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, "public", "audio")
NARRATOR = "bf_emma"

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


def encode(samples, sr, path, tail_ms=60):
    """Trims silence, matches loudness and writes a mono MP3."""
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
        sf.write(f.name, samples, sr)
        tmp = f.name
    filt = (
        "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.02,"
        "areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.02,areverse,"
        f"apad=pad_dur={tail_ms / 1000},loudnorm=I=-18:TP=-2:LRA=7"
    )
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", tmp, "-af", filt, "-ac", "1", "-ar", "44100",
         "-codec:a", "libmp3lame", "-b:a", "64k", path],
        check=True,
    )
    os.unlink(tmp)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", required=True, help="dir with kokoro-v1.0.onnx and voices-v1.0.bin")
    ap.add_argument("--force", action="store_true")
    args = ap.parse_args()

    k = Kokoro(os.path.join(args.model, "kokoro-v1.0.onnx"), os.path.join(args.model, "voices-v1.0.bin"))
    data = json.load(open(os.path.join(ROOT, "scripts", "voice", "lines.json")))
    for d in ("words", "ph", "lines"):
        os.makedirs(os.path.join(OUT, d), exist_ok=True)

    def make(path, fn):
        if os.path.exists(path) and not args.force:
            return
        s, sr = fn()
        encode(np.asarray(s, dtype=np.float32), sr, path)
        print("wrote", os.path.relpath(path, ROOT), flush=True)

    for w in data["words"]:
        make(os.path.join(OUT, "words", f"{w}.mp3"),
             lambda w=w: k.create(f"{w}.", voice=NARRATOR, speed=0.82, lang="en-gb"))

    for ph in data["phonemes"]:
        ipa = PHONEME_IPA[ph]
        make(os.path.join(OUT, "ph", f"{ph}.mp3"),
             lambda ipa=ipa: k.create(ipa, voice=NARRATOR, speed=0.9, lang="en-gb", is_phonemes=True))

    for line in data["lines"]:
        voice, speed = SPEAKERS.get(line["speaker"], SPEAKERS["narrator"])
        make(os.path.join(OUT, "lines", f"{line['id']}.mp3"),
             lambda t=line["text"], v=voice, s=speed: k.create(t.replace("’", "'"), voice=v, speed=s, lang="en-gb"))

    manifest = {
        "words": sorted(f[:-4] for f in os.listdir(os.path.join(OUT, "words")) if f.endswith(".mp3")),
        "ph": sorted(f[:-4] for f in os.listdir(os.path.join(OUT, "ph")) if f.endswith(".mp3")),
        "lines": sorted(f[:-4] for f in os.listdir(os.path.join(OUT, "lines")) if f.endswith(".mp3")),
    }
    json.dump(manifest, open(os.path.join(OUT, "manifest.json"), "w"))
    print("manifest:", {k2: len(v) for k2, v in manifest.items()})


if __name__ == "__main__":
    main()
