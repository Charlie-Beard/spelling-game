"""
Finds a voice for one character in the ElevenLabs Voice Library, adds it to
your account, and sets it in elevenlabs.json.

    python scripts/voice/pick-voice.py neville                # best match
    python scripts/voice/pick-voice.py neville --pick 2       # the 2nd on the list
    python scripts/voice/pick-voice.py neville --list         # just show the list

Searching costs nothing. Each candidate has a preview link to listen to first.
Needs ELEVENLABS_API_KEY.
"""
import argparse, json, os, re, sys, urllib.error, urllib.parse, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
API = "https://api.elevenlabs.io/v1"

# What each character should sound like: search terms, and words in a voice's
# description that make it a better or worse fit.
WANTED = {
    "neville": {
        "searches": ["young british boy", "british teenage boy", "shy british boy", "british teen"],
        "good": ["teen", "boy", "young", "shy", "nervous", "awkward", "gentle", "sweet", "earnest", "kind",
                 "character", "animation", "cartoon", "british", "english", "storytelling", "soft"],
        "bad": ["deep", "old", "elderly", "mature", "villain", "sexy", "seductive", "news", "corporate", "asmr",
                "american", "australian", "whisper", "girl", "female", "woman"],
    },
}


def request(method, path, key, body=None):
    req = urllib.request.Request(
        API + path, method=method,
        data=json.dumps(body).encode() if body is not None else None,
        headers={"xi-api-key": key, "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read())


def search(key, terms):
    """Male voices matching `terms`, trying strict filters first, then looser ones."""
    for params in (
        {"search": terms, "gender": "male", "age": "young", "accent": "british", "page_size": 50},
        {"search": terms, "gender": "male", "page_size": 50},
        {"search": terms, "page_size": 50},
    ):
        try:
            return request("GET", "/shared-voices?" + urllib.parse.urlencode(params), key).get("voices", [])
        except urllib.error.HTTPError:
            continue
    return []


def score(v, want):
    text = " ".join(str(v.get(k) or "") for k in ("name", "description", "descriptive", "use_case", "accent", "age", "gender")).lower()
    s = sum(2 for w in want["good"] if w in text) - sum(4 for w in want["bad"] if w in text)
    if (v.get("age") or "") == "young":
        s += 6
    if "british" in (v.get("accent") or "").lower():
        s += 6
    if (v.get("gender") or "") == "female":
        s -= 50
    # A little weight for voices many people use (usually better quality).
    s += min(6, (v.get("cloned_by_count") or 0) ** 0.25)
    return s


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser()
    ap.add_argument("character", choices=sorted(WANTED))
    ap.add_argument("--pick", type=int, default=1, help="which of the listed voices to use (1 = best)")
    ap.add_argument("--list", action="store_true", help="only list the candidates")
    args = ap.parse_args()
    key = os.environ.get("ELEVENLABS_API_KEY")
    if not key:
        sys.exit("Set ELEVENLABS_API_KEY first.")
    want = WANTED[args.character]

    found = {}
    for terms in want["searches"]:
        for v in search(key, terms):
            found.setdefault(v["voice_id"], v)
    if not found:
        sys.exit("No voices found in the library.")
    ranked = sorted(found.values(), key=lambda v: score(v, want), reverse=True)[:5]

    print(f"Best voices for {args.character}:\n")
    for i, v in enumerate(ranked, 1):
        desc = (v.get("description") or v.get("descriptive") or "").strip().replace("\n", " ")
        print(f"{i}. {v.get('name')}  ({v.get('gender')}, {v.get('age')}, {v.get('accent')})")
        print(f"   {desc[:140]}")
        print(f"   listen: {v.get('preview_url')}\n")
    if args.list:
        return

    chosen = ranked[args.pick - 1]
    added = request("POST", f"/voices/add/{chosen['public_owner_id']}/{chosen['voice_id']}", key,
                    {"new_name": f"{chosen.get('name')} ({args.character})"})
    voice_id = added.get("voice_id", chosen["voice_id"])

    # Swap just this character's voice_id, keeping the file's layout.
    path = os.path.join(HERE, "elevenlabs.json")
    text = open(path, encoding="utf-8").read()
    pattern = re.compile(r'("' + args.character + r'"\s*:\s*\{\s*"voice_id"\s*:\s*")[^"]*(")')
    if not pattern.search(text):
        sys.exit(f'No "{args.character}" entry in elevenlabs.json.')
    open(path, "w", encoding="utf-8", newline="").write(pattern.sub(lambda m: m.group(1) + voice_id + m.group(2), text, count=1))
    print(f"Chose #{args.pick}: {chosen.get('name')}. Added to your account, and set as {args.character}'s voice "
          f"in elevenlabs.json ({voice_id}).")


if __name__ == "__main__":
    main()
