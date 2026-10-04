# Wizard Words 🦉

A Harry Potter themed phonics spelling game for iPad, in a hand-torn paper,
stop-motion style. It is built for one child (aged 6, autistic, possibly
ADHD) who loves Harry Potter, and especially the scary bits.

> Non-commercial fan project. All artwork is original: no film images, no
> official logos, no Harry Potter font.

## Playing it

**Live at:** https://charlie-beard.github.io/spelling-game/ once Pages is
switched on (see below).

1. Open the link in **Safari** on the iPad.
2. Tap **Share → Add to Home Screen**, then always play from that icon. It
   opens full-screen and works offline.
3. The first time, it asks **"What's the password?"** Type Jasper's password
   to play as Jasper, or the grown-ups' password to sign in as a grown-up.
   Capitals don't matter. Each device remembers the sign-in, so it is only
   typed once.
4. Optional: turn on **Guided Access** (Settings → Accessibility) to lock
   the iPad to the game.

The game is landscape-only. Turning the iPad upright pauses it.

### Saved in the cloud

Jasper's progress and settings (cards, chapters, tricky words, his word
list, volume, calm mode and so on) are saved on the device **and** in the
cloud, so they follow him to any device he signs in on. A grown-up has a
separate save of their own, so playing as a grown-up never changes
Jasper's progress.

- It still works offline. Changes are kept on the iPad and sent when it is
  back online.
- If two devices change things at the same time (Jasper playing on the
  iPad while you edit his words on your phone), both sets of changes are
  kept.
- Progress saved on the iPad before sign-in was added moves into Jasper's
  cloud save the first time he signs in there.

### How it works

- **Seven books, 30 chapters of 5 words.** The books follow the UK phonics
  order (Letters and Sounds / Little Wandle) and start with **cat, hat,
  mat, rat, bat**.
- **Every chapter has a host character.** Finishing it wins that host's
  **Chocolate Frog card**.
- **Books 1–6 end with a Horcrux.** **Book 7 ends with the Battle of
  Hogwarts**, where each word casts a shield and Voldemort is disarmed with
  *Expelliarmus*.
- **Tiles are placed one sound at a time, left to right.** Only the right
  tile is accepted, so a wrong word can never be built.
- **Help steps up:** first the sound is repeated, then the right tile glows,
  and on the third try **Hedwig flies over and places the letter**.
  Nobody can get stuck.
- **Difficulty adapts.** Extra "wrong" tiles are added as he gets better and
  taken away when he struggles. Missed words come back in later chapters.

### Grown-ups' corner

**Press and hold the cog** (top right of the title or map) for 3 seconds.

The top shows who is signed in, whether everything is saved to the cloud,
and a **Sign out** button (tap it twice). Signed in as a grown-up, the
corner shows **Jasper's** progress and settings, fetched from the cloud, so
you can check on him and set his words from your own phone or iPad.
**Showing: Jasper / Me** switches to your own.

- **Progress:** chapters done and the words that need practice.
- **Settings:**
  - his name (set to Jasper): it is on his Hogwarts letter, and the narrator and characters say "Jasper" out loud
  - volume
  - calm mode (less movement)
  - break reminders
  - Hedwig's idle hint
  - unlock all chapters
  - reset
- **Record sounds:** record your own voice for each phonics sound. Computer
  voices are poor at single sounds ("mmm", not "muh"), so this is well worth
  10 minutes. Recordings stay on the device they were made on (they are not
  in the cloud), so do it in the home-screen app on Jasper's iPad; Safari
  and the home-screen app keep separate storage.
- **My words:** type in this week's school spellings. They appear on the map
  as "My words".

## Switching on GitHub Pages (one time)

1. Merge this work into `main`.
2. Go to repo **Settings → Pages → Source: GitHub Actions**.
3. The **Deploy to GitHub Pages** workflow builds and publishes on every
   push to `main`.

## The cloud save (Cloudflare)

Sign-in and saves are handled by a small Cloudflare Worker with a D1
database, in [`api/`](api/). It is separate from the game, which stays on
GitHub Pages.

- Live at `https://wizard-words-api.charlesjohnbeard.workers.dev`
- D1 database `wizard-words`, with one row per player (`jasper`, `parent`)
  holding their whole save as JSON
- The two passwords are Worker **secrets**. They are never in this
  (public) repo. Jasper's sign-in can reach only his own save; a grown-up's
  can reach both.

Unlike the game, the Worker doesn't deploy on push. Run these from `api/`:

```bash
cd api && npm install
npx wrangler login                          # once per computer
npm run deploy                              # after changing api/src
npm run migrate:remote                      # after adding a migration

npx wrangler secret put JASPER_PASSWORD     # change Jasper's password
npx wrangler secret put PARENT_PASSWORD     # change the grown-ups' password
npx wrangler secret put AUTH_SECRET         # any long random string; changing it signs every device out
```

Changing a password doesn't sign anyone out. Devices that are already
signed in stay signed in.

If the game moves to a different address, add it to `ALLOWED_ORIGINS` in
[`api/wrangler.jsonc`](api/wrangler.jsonc) and redeploy.

For local development, copy `api/.dev.vars.example` to `api/.dev.vars`,
then run `npm run migrate:local && npm run dev` in `api/`, and start the
game with `VITE_API_URL=http://localhost:8787 npm run dev`.

## Development

```bash
npm install
npm run dev          # http://localhost:5173 (add ?scene=map, ?scene=chapter&id=b3c2 …)
npm test             # unit tests (game logic, curriculum, art coverage)
npm run test:e2e     # Playwright: full chapter play-through at iPad sizes
npm run build        # production build to dist/ (with offline service worker)
```

`/lab.html` (dev only) is an art gallery. Use `?set=chars` for characters,
`?set=horcrux` for the Horcruxes, and `?p=cat,hat` to show particular words.

| Where | What |
|---|---|
| `src/core/` | Phonics model, curriculum, round logic, progress, merging saves (pure, tested) |
| `src/cloud/` | Sign-in, and each player's save kept on the device and synced to the cloud |
| `api/` | The cloud-save Worker (Cloudflare Worker + D1) |
| `src/art/paper.ts` | The torn-paper engine: tearing, fibre edges, shadows, stop-motion boil |
| `src/art/pictures/` | 145 word illustrations, one file per book |
| `src/art/characters/` | 33 character portraits |
| `src/scenes/` | Title, choose, map, intro, spell, battle, complete, album, break, grown-ups |
| `src/audio/` | Web Audio engine, synthesised sound effects, narrator, recordings |
| `scripts/voice/` | Regenerates narration with Kokoro (offline neural TTS) or ElevenLabs |
| `scripts/icons.ts` | Renders the app icons from the game's own art |

### Regenerating the voice

```bash
pip install kokoro-onnx soundfile
# download kokoro-v1.0.onnx and voices-v1.0.bin from the kokoro-onnx GitHub releases into DIR
npx tsx scripts/voice/export.ts
python3 scripts/voice/generate.py --model DIR   # add --force to redo existing clips
```

For more natural, characterful voices, render words and lines with
[ElevenLabs](https://elevenlabs.io) instead (pure phonics sounds stay on Kokoro or
your own recordings, since no cloud voice says them cleanly). The API key stays on
your machine; the game only ships the resulting MP3s.

```bash
export ELEVENLABS_API_KEY=...                   # elevenlabs.io → Profile → API keys
python3 scripts/voice/generate.py --provider elevenlabs --list-voices          # your voice IDs
python3 scripts/voice/generate.py --provider elevenlabs --speaker hagrid --force   # audition one character
python3 scripts/voice/generate.py --provider elevenlabs --limit 3 --force         # a few of everything
python3 scripts/voice/generate.py --provider elevenlabs --force                   # the lot (~4,300 characters)
```

Pick voices per character in `scripts/voice/elevenlabs.json`. Its defaults are
ElevenLabs' stock British voices; for distinct characters, add voices from the
Voice Library or create them with Voice Design and paste their IDs in.

See [`docs/PLAN.md`](docs/PLAN.md) for the full design.
