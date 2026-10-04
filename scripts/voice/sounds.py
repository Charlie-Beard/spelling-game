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
  vowel   a e i o u: cut the steady middle of the vowel out of the narrator's
          best word for it, and hold it.

A sound is repaired if check.py flags it or it is marked wrong in
review.json. --apply keeps the old clip as a take, so /review.html can
switch back.
"""
import argparse, json, os, shutil, subprocess, sys, tempfile

import numpy as np
import parselmouth
from parselmouth.praat import call

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from check import AUDIO, HERE, SHORT_VOWELS, TAKES, Checker, Frames, bark, file_hash, path_of, stash, vowel_of  # noqa: E402
from generate import encode  # noqa: E402

HISS = {"s", "f", "sh", "th", "ch", "x"}
HELD = {"m", "n", "ng", "l", "r", "v", "z"}
# Loudness for a held hiss, as RMS dBFS. Left alone, a vowel-matched level
# would make fff and th as loud as a shout; these sit just under speech.
HISS_RMS = {"s": -22, "sh": -21, "f": -27, "th": -28}
# Consonants a vowel can be cut cleanly away from (not l r w y, which glide into it).
CLEAN_EDGE = set("pbtdkgcfsvzhjx") | {"sh", "ch", "th", "ck", "ss"}


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


def vowel(word):
    """The steady middle of the vowel in one of the narrator's words."""
    src = path_of("words", word)
    snd = parselmouth.Sound(src)
    f = Frames(src)
    k = (f.f0 > 0) & (f.db >= f.db.max() - 8) & (np.nan_to_num(f.F1) > 350)
    if k.sum() < 4:
        return None
    pk = int(np.argmax(np.where(k, f.db, -200)))
    lo = hi = pk
    while lo > 0 and k[lo - 1]:
        lo -= 1
    while hi < len(k) - 1 and k[hi + 1]:
        hi += 1
    a, b = f.t[lo] + 0.025, f.t[hi] - 0.03
    if b - a < 0.06:
        return None
    part = lengthen(snd.extract_part(from_time=a, to_time=b, preserve_times=False), 0.3)
    return fade(part.values[0], part.sampling_frequency, 0.015, 0.05), part.sampling_frequency


def source_words(check, ph):
    """The narrator's cleanest words for a vowel: no flags, clean edges, nearest the vowel's centre."""
    centre = check.voice.centre.get(ph)
    found = []
    for w, phs in check.units.items():
        if vowel_of(w, phs) != ph or len(phs) > 4 or not centre:
            continue
        flags, _, f = check("words", w, path_of("words", w))
        m = f.vowel()
        if flags or not m:
            continue
        d = float(np.hypot(bark(m[0]) - centre[0], bark(m[1]) - centre[1]))
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


def repair(check, ph, apply=False, was="previous"):
    """Makes candidates for one sound as takes; with apply, uses the first that passes."""
    src = path_of("ph", ph)
    cands = []
    if ph in HISS and (r := hiss(ph, src)):
        cands.append(("trimmed", *r, False))
    if ph in HELD and (r := held(ph, src)):
        cands.append(("trimmed", *r, False))
    if ph in SHORT_VOWELS:
        # Many words' vowels are too short to cut; keep going down the list.
        for w in source_words(check, ph):
            if r := vowel(w):
                cands.append((f"from-{w}", *r, True))
                if len(cands) == 3:
                    break
    if not cands:
        print(f"{ph:4} nothing to make it from: needs a re-record or a grown-up's recording")
        return None

    os.makedirs(os.path.join(TAKES, "ph", ph), exist_ok=True)
    best = None
    for label, x, sr, normalise in cands:
        dst = path_of("ph", ph, label)
        write(x, sr, dst, normalise)
        flags = check("ph", ph, dst, label)[0]
        print(f"{ph:4} {label:14} {'; '.join(flags) or 'passes'}")
        if not flags and best is None:
            best = label
    if apply and best:
        stash("ph", ph, was)
        shutil.copyfile(path_of("ph", ph, best), src)
        print(f"{ph:4} now uses {best}")
    return best


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("sounds", nargs="*", help="only these sounds (default: flagged or marked wrong)")
    ap.add_argument("--apply", action="store_true", help="use the best passing candidate as the clip")
    args = ap.parse_args()

    check = Checker(whisper=False)
    review_path = os.path.join(HERE, "review.json")
    review = json.load(open(review_path, encoding="utf-8")) if os.path.exists(review_path) else {}
    manifest = json.load(open(os.path.join(AUDIO, "manifest.json"), encoding="utf-8"))

    def marked_wrong(ph):
        v = review.get(f"ph/{ph}", {})
        return v.get("verdict") == "bad" and v.get("hash") == file_hash(path_of("ph", ph))

    for ph in args.sounds or [ph for ph in manifest["ph"] if check("ph", ph, path_of("ph", ph))[0] or marked_wrong(ph)]:
        repair(check, ph, args.apply)


if __name__ == "__main__":
    main()
