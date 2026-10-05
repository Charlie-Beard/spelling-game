/**
 * Book 5, chapter 3: Dumbledore's Army.
 *
 * A blank castle wall; a door rumbles into being: the Room of Requirement,
 * all cushions and books. Neville practises Expelliarmus: his own wand flies
 * into his hair; second try works. Then everyone's Patronuses (stag, otter,
 * hare) gallop and swirl in glowing silvery blue, and Neville beams.
 */
import { bell, C, circle, curve, defineStory, dot, ellipse, ink, type Kit, noiseBurst, NOTE, now, piece, poly, rect, rng, svg, tone, tune, type Node, type Pt } from './kit';

// ------------------------------------------------------------------ sounds

/** A deep, soft stone rumble with a wooden creak on top. */
function doorRumble(): void {
  const t = now();
  noiseBurst(t, { freq: 140, q: 0.8, peak: 0.16, attack: 0.3, decay: 1.5, type: 'lowpass', sweepTo: 320 });
  tone(62, t, { peak: 0.12, attack: 0.3, decay: 1.5, glideTo: 90, lowpass: 400 });
  tone(300, t + 0.9, { wave: 'triangle', peak: 0.05, attack: 0.1, decay: 0.6, glideTo: 220, vibrato: [8, 10], lowpass: 900 });
}

/** A bright little spell zing, rising or (when it backfires) wobbling down. */
function zing(up = true): void {
  const t = now();
  tone(up ? 500 : 900, t, { wave: 'triangle', peak: 0.1, attack: 0.01, decay: 0.3, glideTo: up ? 1500 : 380, lowpass: 3500 });
  noiseBurst(t, { freq: 3000, q: 2, peak: 0.05, attack: 0.02, decay: 0.2, sweepTo: up ? 6000 : 1500 });
  bell(up ? NOTE.E6 : NOTE.A5, t + 0.2, 0.06, 0.5);
}

/** A shimmering, hopeful Patronus tune. */
function patronusTune(): void {
  tune([[NOTE.E5, 0], [NOTE.G5, 0.3], [NOTE.B5, 0.6], [NOTE.E6, 0.95], [NOTE.D6, 1.35], [NOTE.B5, 1.65], [NOTE.G5, 1.95], [NOTE.B5, 2.3], [NOTE.E6, 2.7]], 0.09, 1.6);
  const t = now();
  tone(NOTE.E3, t, { peak: 0.05, attack: 0.7, decay: 3.2 });
  tone(NOTE.B3, t + 0.8, { peak: 0.035, attack: 0.6, decay: 2.4 });
  for (let i = 0; i < 6; i++) bell(NOTE.C7 + i * 60, t + 0.2 + i * 0.4, 0.025, 0.7);
}

// --------------------------------------------------------------------- art

const STONE = '#6c6a78';
const STONE_DARK = '#57556a';
const SILVER_BLUE = '#bfe6ff';
const SILVER_EDGE = '#8cc4ee';

/** The corridor: a long, blank stretch of castle wall with a torch each side. */
function corridor(): string {
  const r = rng(503);
  const blocks: Node[] = [];
  for (let row = 0; row < 7; row++) {
    let x = -30 + (row % 2) * 60;
    while (x < 1200) {
      const w = 110 + r() * 50;
      blocks.push(piece(rect(x, row * 96 - 10, w - 6, 90, 4), r() > 0.5 ? STONE : '#726f80', { edge: 'cut', fibre: false, shadow: false }));
      x += w;
    }
  }
  const torch = (x: number): Node[] => [
    piece(rect(x - 6, 250, 12, 70, 3), C.brownDark, { edge: 'cut', fibre: false }),
    piece(curve([[x, 190], [x + 20, 232], [x, 258], [x - 20, 232]], 2), C.orange, { edge: 'cut' }),
    piece(curve([[x, 214], [x + 10, 238], [x, 252], [x - 10, 238]], 2), C.candle, { edge: 'cut', fibre: false, shadow: false }),
  ];
  return svg({ w: 1180, h: 820, name: 'b5c3-corridor', boil: false, className: 'backdrop' }, [
    piece(rect(-20, -20, 1220, 860), STONE_DARK, { edge: 'clean', shadow: false }),
    ...blocks,
    ...torch(150),
    ...torch(1030),
    piece(curve([[-40, 860], [-40, 640], [590, 628], [1220, 640], [1220, 860]], 2), '#4a4256', { rough: 1.2 }),
    piece(rect(-20, 636, 1220, 8), C.brownDark, { edge: 'cut', fibre: false, shadow: false }),
  ]);
}

/** The Room of Requirement, full stage: shelves, books, cushions, warm lamps. */
function roomArt(): string {
  const r = rng(77);
  const cols = [C.red, C.blueDark, C.greenDark, C.gold, C.plum, C.teal, C.brown];
  const books: Node[] = [];
  for (const sx of [30, 880]) {
    for (const sy of [250, 360, 470]) {
      let x = sx + 12;
      while (x < sx + 250) {
        const w = 14 + r() * 12;
        const h = 56 + r() * 26;
        books.push(piece(rect(x, sy - h, w, h, 2), cols[Math.floor(r() * cols.length)], { edge: 'cut', fibre: false }));
        x += w + 3;
      }
      books.push(piece(rect(sx, sy, 270, 10, 2), C.wood, { edge: 'cut' }));
    }
  }
  const cushion = (x: number, y: number, c: string): Node[] => [
    piece(ellipse(x, y, 62, 24), c),
    piece(ellipse(x, y - 6, 38, 10), C.cream, { edge: 'cut', fibre: false, shadow: false, opacity: 0.35 }),
  ];
  const lamp = (x: number): Node[] => [
    piece(rect(x - 2, 120, 4, 40, 1), C.gold, { edge: 'cut', fibre: false, shadow: false }),
    piece(ellipse(x, 182, 20, 26), C.goldLight, { edge: 'cut' }),
    piece(ellipse(x, 182, 10, 14), C.candle, { edge: 'cut', fibre: false, shadow: false }),
  ];
  return svg({ w: 1180, h: 820, name: 'b5c3-room', boil: false }, [
    piece(rect(-20, -20, 1220, 860), '#5a3f55', { edge: 'clean', shadow: false }),
    piece(rect(-20, -20, 1220, 44), '#43304a', { rough: 0.8 }),
    piece(rect(300, 40, 580, 540, 6), '#6b4a62', { edge: 'cut', fibre: false, shadow: false }),
    piece(poly([[330, 70], [590, 40], [850, 70], [850, 140], [330, 140]]), C.wood, { edge: 'cut', fibre: false, shadow: false, opacity: 0.0 }),
    ...lamp(340), ...lamp(840), ...lamp(590),
    piece(rect(36, 238, 258, 250, 4), '#33241c', { edge: 'cut', fibre: false, shadow: false, opacity: 0.0 }),
    ...books,
    piece(curve([[-40, 860], [-40, 620], [590, 606], [1220, 620], [1220, 860]], 2), '#7a5238', { rough: 1.2 }),
    piece(ellipse(590, 700, 420, 56), C.redDark, { edge: 'cut', fibre: false }),
    ...cushion(250, 640, C.blueDark),
    ...cushion(940, 646, C.greenDark),
    ...cushion(430, 676, C.gold),
    ...cushion(760, 672, C.plum),
  ]);
}

/** A wooden arched door, 260 × 420. */
function doorArt(): string {
  const arch: Pt[] = [[10, 416]];
  for (let i = 0; i <= 16; i++) {
    const a = Math.PI + (i / 16) * Math.PI;
    arch.push([130 + Math.cos(a) * 120, 130 + Math.sin(a) * 120]);
  }
  arch.push([250, 416]);
  return svg({ w: 260, h: 420, name: 'b5c3-door', label: 'a door' }, [
    piece(poly(arch), C.brownDark),
    piece(rect(34, 140, 192, 270, 4), C.wood, { edge: 'cut', fibre: false }),
    ink([[130, 20], [130, 412]], { width: 4, color: C.brownDark }),
    ...[110, 210, 310].map((y) => ink([[40, y], [220, y]], { width: 5, color: C.gold })),
    piece(circle(104, 250, 9), C.goldLight, { edge: 'cut', fibre: false }),
    piece(circle(156, 250, 9), C.goldLight, { edge: 'cut', fibre: false }),
  ]);
}

/** A wand, 110 × 24. */
function wandArt(col: string): string {
  return svg({ w: 110, h: 24, name: 'b5c3-wand-' + col.slice(1), boil: false }, [
    piece(poly([[4, 14], [100, 6], [104, 12], [6, 21]]), col, { edge: 'cut', fibre: false }),
    piece(poly([[4, 13], [24, 11], [26, 19], [6, 21]]), C.brownDark, { edge: 'cut', fibre: false, shadow: false }),
  ]);
}

/** A glowing silver-blue Patronus, 220 × 170, facing right. */
function patronus(kind: 'stag' | 'otter' | 'hare'): string {
  const o = { fibre: false, shadow: false, opacity: 0.88 } as const;
  const f = (outline: ReturnType<typeof ellipse>, extra = {}) => piece(outline, SILVER_BLUE, { edge: 'cut', ...o, ...extra });
  const glow = piece(ellipse(110, 90, 100, 66), '#e9f6ff', { edge: 'cut', fibre: false, shadow: false, opacity: 0.25 });
  let body: Node[];
  if (kind === 'stag') {
    body = [
      ...[60, 80, 140, 160].map((x) => piece(poly([[x - 5, 110], [x + 5, 110], [x + 3, 162], [x - 3, 162]]), SILVER_EDGE, { edge: 'cut', ...o })),
      f(ellipse(105, 100, 60, 28)),
      piece(poly([[140, 90], [166, 40], [186, 52], [160, 110]]), SILVER_BLUE, { edge: 'cut', ...o }),
      f(ellipse(182, 42, 22, 13, -20)),
      ink([[176, 30], [172, 6], [160, 0]], { width: 3, color: '#e9f6ff' }),
      ink([[172, 18], [184, 6]], { width: 3, color: '#e9f6ff' }),
      ink([[168, 28], [150, 22], [142, 10]], { width: 3, color: '#e9f6ff' }),
      dot(190, 40, 2.5, C.ink),
    ];
  } else if (kind === 'otter') {
    body = [
      piece(curve([[20, 130], [48, 108], [80, 100], [120, 98], [146, 110], [140, 124], [90, 122], [50, 138]], 2), SILVER_BLUE, { edge: 'cut', ...o }),
      piece(curve([[8, 134], [30, 144], [54, 138], [30, 122]], 2), SILVER_EDGE, { edge: 'cut', ...o }),
      ...[96, 130].map((x) => piece(ellipse(x, 126, 9, 16), SILVER_EDGE, { edge: 'cut', ...o })),
      f(circle(160, 90, 24)),
      f(circle(150, 68, 8)),
      piece(ellipse(178, 98, 10, 7), '#e9f6ff', { edge: 'cut', ...o }),
      dot(166, 84, 2.5, C.ink),
      dot(184, 96, 2.5, C.ink),
    ];
  } else {
    body = [
      f(ellipse(100, 108, 52, 32, -8)),
      ...[70, 130].map((x) => piece(ellipse(x, 146, 22, 8), SILVER_EDGE, { edge: 'cut', ...o })),
      piece(circle(44, 104, 11), '#e9f6ff', { edge: 'cut', ...o }),
      f(circle(154, 82, 22)),
      f(ellipse(150, 30, 9, 30, 8)),
      f(ellipse(166, 32, 9, 30, 20)),
      dot(162, 80, 2.5, C.ink),
    ];
  }
  return svg({ w: 220, h: 170, name: 'b5c3-' + kind, boil: false, label: 'a Patronus' }, [glow, ...body]);
}

// -------------------------------------------------------------------- story

const WORDS: Array<[string, number, number]> = [
  ['chair', 90, 120],
  ['hair', 290, 40],
  ['stairs', 515, 0],
  ['beard', 740, 40],
  ['letter', 940, 120],
];

export default defineStory({
  lines: {
    wall: { who: 'narrator', text: 'A blank, boring wall… then a door rumbles out of nowhere!' },
    room: { who: 'neville', text: 'The Room of Requirement! Cushions, books, and a chair!' },
    oops: { who: 'narrator', text: '“Expelliarmus!” Whoops! Neville’s own wand flies up!' },
    again: { who: 'neville', text: 'It’s stuck in my hair! Let me try again!' },
    works: { who: 'narrator', text: 'Zing! This time it works! Everyone cheers!' },
    patronus: { who: 'narrator', text: 'Now Patronuses! A silver stag, otter and hare gallop round!' },
    words: { who: 'narrator', text: 'Chair, hair, stairs, beard, letter: your words dance too!' },
    beam: { who: 'neville', text: 'We did it, {name}! Dumbledore would be so proud!' },
  },

  async play(k: Kit) {
    k.backdrop(corridor());
    const room = k.add(roomArt(), { x: 0, y: 0, w: 1180, z: 4 });
    k.set(room, { opacity: 0 });

    const hero = k.character('hero', { x: 140, y: 330, z: 20 });
    const neville = k.character('neville', { x: 600, y: 310, w: 270, z: 20 });
    k.set([hero, neville], { opacity: 0 });

    // A blank wall… then a door.
    await k.wait(600);
    k.sfx.whoosh();
    await k.enter(hero, 'left');
    const door = k.add(doorArt(), { x: 460, y: 230, w: 260, z: 8 });
    k.set(door, { opacity: 0, transformOrigin: '50% 100%' });
    doorRumble();
    void k.quake(4);
    void k.appear(door, 1.2);
    await k.say('wall');

    // The door swings open on the room.
    k.fx.creak();
    void k.fade(room, 1, 1);
    void k.glow(C.goldLight, 0.3, 1.2);
    await k.fade(door, 0, 0.9);
    k.remove(door);
    k.sfx.whoosh();
    await k.enter(neville, 'right');
    k.sparkle(590, 330, 10, 220);
    await k.say('room', neville);

    // First try: the wand flies backwards into his hair.
    const wand = k.add(wandArt(C.wood), { x: 560, y: 450, w: 110, z: 25 });
    k.set(wand, { rotation: -20 });
    const wand2 = k.add(wandArt(C.brown), { x: 330, y: 440, w: 110, z: 25 });
    k.appear(wand2, 0.3);
    await k.appear(wand, 0.3);
    zing(false);
    await k.shake(neville, 5, 2);
    void k.to(wand, 0.9, { x: 120, y: -330, rotation: 500, ease: 'power1.out' });
    await k.say('oops', neville);
    await k.wait(100);
    k.fx.boing();
    await k.to(wand, 0.5, { x: 150, y: -105, rotation: 560 + 40, ease: 'bounce.out' });
    k.sparkle(700, 350, 6, 60);
    await k.say('again', neville);

    // Second try: perfect.
    zing(true);
    await k.beam([600, 450], [450, 470], '#ff9a9a', 0.5);
    void k.spin(wand2, 2, 0.8);
    await k.to(wand2, 0.8, { x: -230, y: -190, ease: 'power1.out' });
    void k.fx.twinkle();
    k.puff(220, 360, 80, C.white);
    k.remove(wand2);
    void k.hop(neville, 40, 2);
    await k.all(k.say('works'), k.hop(hero, 40, 2));

    // Patronuses.
    patronusTune();
    void k.glow('#9fd8ff', 0.3, 2.5);
    const animals = (['stag', 'otter', 'hare'] as const).map((kind, i) => {
      const a = k.add(patronus(kind), { x: [180, 440, 860][i], y: [430, 480, 450][i], w: [240, 230, 190][i], z: 15 });
      k.set(a, { opacity: 0 });
      return a;
    });
    animals.forEach((a, i) => {
      void k.fade(a, 1, 0.6);
      k.float(a, 12, 1.1 + i * 0.2);
    });
    k.sparkle(300, 480, 12, 160);
    const gallop = async (a: HTMLElement, path: Array<[number, number]>) => {
      for (const [x, y] of path) await k.to(a, 0.8, { x, y, ease: 'sine.inOut' });
    };
    await k.all(
      k.say('patronus'),
      gallop(animals[0], [[260, -120], [120, -50], [380, -150], [200, -60]]),
      gallop(animals[1], [[-220, -170], [180, -60], [-120, -150], [120, -50]]),
      gallop(animals[2], [[-300, -150], [-120, -60], [-380, -130], [-240, -50]]),
    );

    // The words dance in.
    const pics = WORDS.map(([w, x, y]) => {
      const p = k.picture(w, { x, y, w: 150, z: 30 });
      k.set(p, { opacity: 0 });
      return p;
    });
    const popWords = async () => {
      await k.wait(1200);
      for (const [i, p] of pics.entries()) {
        k.fx.pop();
        await k.appear(p, 0.3);
        k.float(p, 6, 1.6 + i * 0.15);
        k.sparkle(WORDS[i][1] + 75, WORDS[i][2] + 75, 5, 70);
        await k.wait(220);
      }
    };
    await k.all(k.say('words'), popWords());

    // Neville beams.
    await k.all(k.say('beam', neville), k.hop(neville, 50, 3));
    k.fx.jingle();
    k.confetti(36);
    k.sparkle(590, 300, 16, 260);
    await k.all(k.hop(hero, 50, 2), k.hop(neville, 30, 2));
    await k.wait(900);
  },
});
