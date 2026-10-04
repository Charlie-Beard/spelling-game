# Wizard Words — a Harry Potter spelling game

The plan for a phonics spelling game for a 6-year-old who loves Harry Potter.
It is a static site hosted on GitHub Pages, built **only for an iPad (11th gen)
held in landscape**.

> This is a non-commercial fan project. All artwork is original. It uses no
> film images, no official logos and no Harry Potter typeface.

---

## 1. The player

- He is 6, autistic, with possible ADHD. He is learning phonics and can
  currently spell **cat, mat, sat, hat**.
- He loves the darker parts of the story: Voldemort, Bellatrix, Death Eaters
  and the Battle of Hogwarts.
- **These are never shown:**
  - the three Unforgivable Curses, including any green killing-curse light
  - Katie Bell and the cursed necklace
  - everything at Malfoy Manor, and Dobby's death that follows it
  - Harry as a Horcrux, because that storyline depends on the killing curse
- The device is an iPad 11th gen, in landscape, used by touch only.
- The phonics follow the UK order of **Little Wandle Letters and Sounds
  Revised**. All letters are lowercase.

## 2. Landscape only

The game is designed for one screen shape, so the layout and artwork can be
placed exactly instead of reflowing.

- **The game is drawn on one fixed 1180 × 820 stage.** That is the iPad 11th
  gen's landscape size in points (2360 × 1640 pixels). Every layout and every
  illustration is made for this stage.
- **The stage scales to fit the window while keeping its shape.**
  - When the game runs from the home screen it fills the whole screen, which
    is the intended way to play.
  - In a Safari tab the browser bar makes the window shorter, about
    1180 × 760. The stage shrinks slightly and the parchment background fills
    the gap at the sides, so nothing is cropped or moved.
  - It respects the iPad's safe areas, so nothing sits under the home bar or
    status bar.
- **Turning the iPad to portrait pauses the game.** iPadOS ignores orientation
  locks for web apps, so the game shows a calm paper-cut screen instead: Hedwig
  holding an iPad that turns sideways. It resumes exactly where he left off
  when he turns it back. Nothing is designed for portrait beyond this screen.
- **Controls are placed for how he holds the iPad,** with a hand at each side:
  - "Hear it again" sits at the left edge and Hedwig the helper at the right
    edge, both within thumb reach.
  - Letter tiles sit along the bottom, closest to his hands.
- **Touch only.** There are no hover effects, all tap targets are at least
  72pt, and the following are disabled:
  - double-tap zoom, pinch zoom and text selection
  - the long-press menu
  - pull-to-refresh and page bounce
- **Testing** uses automated browser runs at 1180 × 820 (home screen) and
  1180 × 760 (Safari tab), plus a check of the portrait pause screen.

### The spelling screen (1180 × 820)

```
┌──────────────────────────────────────────────────────────────┐
│  ★ ★ ★ ○ ○  (words in this chapter)          [hourglass gems]│
│                                                              │
│   ┌──────────────┐        ┌────┐ ┌────┐ ┌────┐               │
│   │              │        │ c  │ │ a  │ │    │   ← slots      │
│   │   picture    │        └────┘ └────┘ └────┘               │
│   │  (tap = say) │           •      •      •    ← sound buttons│
│   └──────────────┘                                           │
│ (🔊)   player avatar                             Hedwig (🦉)│
│  hear                                                helper  │
│        ┌───┐  ┌───┐  ┌───┐  ┌───┐  ← letter tiles             │
│        │ t │  │ m │  │ s │  │ p │                            │
│        └───┘  └───┘  └───┘  └───┘                            │
└──────────────────────────────────────────────────────────────┘
```

## 3. Visual style: torn-paper stop-motion

- **The look:** layered, hand-torn paper and card on a warm parchment
  background, like a pop-up book of Hogwarts at night.
- **Calm colours:** muted, flat colours with no glare or busy gradients.
- **Original artwork,** drawn in SVG (a vector format that stays sharp at any
  size). Edges are roughened and textured to look torn, and layers cast soft
  shadows.
- **Stop-motion movement:** animations step at about 10 frames per second, and
  paper edges gently "boil" (flicker slightly from frame to frame). This
  background movement pauses while he is spelling.
- **Lettering:** a clear, school-style font with the single-storey **a** and
  **g**, lowercase throughout.

## 4. Story and levels

**The story:** progress through the 7 books, hunt Horcruxes, and finish with
the Battle of Hogwarts.

| Book | Phonics focus | Example words | Finale |
|---|---|---|---|
| 1. Philosopher's Stone | 3-letter words in families (-at, -an, -ig, -op, -ug…) | cat, hat, mat, sat, rat, bat, map, cup, pot, wig | Horcrux: the ring |
| 2. Chamber of Secrets | Two letters, one sound: sh, ch, th, ck, ng | sock, ship, duck, ring, chip | Horcrux: the diary |
| 3. Prisoner of Azkaban | Consonant blends (CCVC / CVCC) | wand, frog, lamp, stop, nest | Horcrux: the locket |
| 4. Goblet of Fire | ai, ee, igh, oa, oo | toad, broom, moon, train, night | Horcrux: the cup (guarded by Bellatrix) |
| 5. Order of the Phoenix | ar, or, ur, ow, oi, er | owl, star, fork, cloak | Horcrux: the diadem |
| 6. Half-Blood Prince | Split digraphs (a-e, i-e, o-e) | cake, snake, stone, smoke | Horcrux: Nagini |
| 7. Deathly Hallows | Tricky words and 2-syllable words | magic, dragon, goblin, the, said | **The Battle of Hogwarts** |

- **Chapters:** each book has about 5 chapters of **5 words**, taking about
  2–3 minutes each. Each chapter is hosted by a character.
- **Horcrux chapters:** the last chapter of each book is a Horcrux chapter.
  Villains and Death Eaters appear as cheeky cartoon paper cut-outs, never
  gory.
- **The finale:** in the Battle of Hogwarts, each correct word casts a shield
  over the castle or pushes back a wave of Death Eaters. It ends with Harry
  disarming Voldemort with *Expelliarmus*, then fireworks.
- **Review:** missed words come back at the start of the next chapter.
- **Choosing a character:** at the start he chooses to play as **Harry, Ron or
  Hermione**. That character appears on screen and casts the sparkle when he
  gets a word right.

## 5. How each word plays

1. **A picture of the word** is shown. Tapping it says the word.
2. **One slot per sound, not per letter.** "sh" fills a single slot, and sound
   buttons (dots and dashes) sit under the slots, as in school.
3. **Big letter tiles.** Tapping a tile says its *sound*, and the tile flies
   into the next slot.
4. **A wrong tile** wobbles, makes a soft "hmm" and floats back. There is no
   buzzer, no lives, no timer and no way to fail.
5. **A finished word** is blended aloud ("c… a… t… cat!"), the wand sparkles
   and the picture comes alive.

### Hedwig's hints

| Trigger | What happens |
|---|---|
| A "hear it again" button | Always visible |
| 1st wrong try | The sound for that slot is replayed |
| 2nd wrong try | The right tile glows softly and one wrong tile disappears |
| 3rd wrong try | Hedwig swoops in and places the letter, then he carries on |
| About 12 seconds of no activity | A soft hoot and the word is said again |

### Difficulty

- Book 1 Chapter 1 offers only the tiles he needs.
- Extra wrong tiles are added gradually.
- If he uses lots of hints, the game removes extra tiles again. If he gets
  chapters perfect, it adds more.

## 6. Designing for ADHD and autism

- **One task on screen at a time,** in the same layout every time.
- **No movement in the background** while he is spelling.
- **One obvious next step.** The map has a single glowing "next" button.
- **Big targets,** soft sounds with a capped volume, and music off by default.
- **No flashing.** The game follows the iPad's Reduce Motion setting and also
  has its own switch.
- **An optional break screen** after a number of chapters chosen by a parent.

## 7. Rewards

- **Gems:** each finished word adds a gem to the house hourglass.
- **Cards:** each finished chapter unlocks a Chocolate Frog card for its host.
- **Horcruxes:** each book's finale adds a Horcrux to his collection.

## 8. Grown-ups' corner

Opened by holding a button for 3 seconds. It has:

- **His name,** stored on the iPad only and never in the repo.
- **Progress:** tricky words and how many hints he has used.
- **Unlocking:** unlock levels and choose where to start.
- **Custom word lists** for weekly school spellings.
- **Settings** for sound, motion and breaks.
- **A sound recorder.** A parent records the roughly 40 single phonics sounds.
  Until then a generated voice is used.

## 9. Sound and voice

- **Sound effects** are made in the browser.
- **Whole words** are pre-recorded with an offline neural voice generator
  (Piper) using a British voice.
- **Single phonics sounds** come from the parent's recordings, stored on the
  iPad.
- **iPad audio:** Safari only allows sound after a first tap, which the title
  screen provides.

## 10. Technical setup

- **Build:** Vite and TypeScript, with GSAP for animation.
- **Saving:** progress is saved in the browser on the iPad, and the game asks
  the browser to keep it permanently.
- **Home screen and offline:** the game can be added to the home screen, opens
  full-screen and works offline.
- **Publishing:** GitHub Actions builds the site and publishes it to Pages.
- **Tests:** automated tests for the game logic, plus automated browser runs in
  landscape on the iPad screen size.

## 11. Build order (each step committed separately)

| Step | What it covers |
|---|---|
| 0 | Project setup, the fixed landscape stage and scaling, the portrait pause screen, tests and the deploy pipeline |
| 1 | Visual style: paper and torn-edge effects, colours, fonts, buttons, stop-motion motion, sound effects |
| 2 | The spelling screen and hints, with **Book 1 Chapter 1 playable end to end** |
| 3 | The map, chapter intros, choosing a character, rewards and saving |
| 4 | Words and pictures, one commit per book, with Horcrux finales |
| 5 | The Battle of Hogwarts finale |
| 6 | Voice audio and the sound recorder |
| 7 | Grown-ups' corner and custom word lists |
| 8 | Home-screen install and offline support, accessibility and performance |
| 9 | A full playthrough at iPad landscape size and a polishing pass |

## 12. Setup for the parent

1. **Switch on GitHub Pages:** repo **Settings → Pages → Source: GitHub
   Actions**. The game then lives at `charlie-beard.github.io/spelling-game`.
2. **Add it to the home screen:** in Safari, Share → **Add to Home Screen**.
   Always play from that icon. It runs full-screen with the full 1180 × 820
   stage, and Safari will not delete his progress.
3. **Record sounds and play inside the home-screen app.** It keeps its own
   storage, separate from Safari.
4. **Optional: Guided Access** (Settings → Accessibility) locks the iPad to the
   game.
