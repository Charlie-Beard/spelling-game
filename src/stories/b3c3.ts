/**
 * Book 3, chapter 3: Buckbeak.
 *
 * Hagrid's paddock by the pumpkin patch. The alarm clock rings: flying time!
 * The hero bows low, Buckbeak stares… and bows back. Up on his back, off
 * they soar over the Forbidden Forest and the shining lake at sunset, and
 * Buckbeak dips a claw in the water. They land to cheers, and Hagrid hands
 * out a plum for Buckbeak and milk for the hero.
 */
import { gsap } from 'gsap';
import { characters } from '../art/characters';
import { stepped } from '../ui/anim';
import { band, C, circle, curve, defineStory, dot, ellipse, group, ink, type Kit, noiseBurst, NOTE, now, piece, poly, raw, rect, rng, svg, tone, bell, type Node, type Pt } from './kit';

// ------------------------------------------------------------------ sounds

/** One big, soft hippogriff wingbeat: a deep whump of air. */
function wingbeat(times = 1, gap = 0.45): void {
  const t = now();
  for (let i = 0; i < times; i++) {
    const tt = t + i * gap;
    noiseBurst(tt, { freq: 380, type: 'lowpass', peak: 0.2, attack: 0.06, decay: 0.28, sweepTo: 140 });
    noiseBurst(tt + 0.02, { freq: 900, q: 0.8, peak: 0.05, attack: 0.05, decay: 0.2, sweepTo: 400 });
    tone(95, tt, { peak: 0.09, attack: 0.04, decay: 0.22, glideTo: 60 });
  }
}

/** Wind rushing past, in two soft gusts. */
function wind(seconds = 3): void {
  const t = now();
  noiseBurst(t, { freq: 420, q: 2.2, peak: 0.07, attack: seconds * 0.4, decay: seconds * 0.6, sweepTo: 950 });
  noiseBurst(t + seconds * 0.35, { freq: 700, q: 3, peak: 0.05, attack: seconds * 0.3, decay: seconds * 0.5, sweepTo: 380 });
}

/** Buckbeak's happy chirp: an eagle's trill and a pony's little nicker. */
function chirp(): void {
  const t = now();
  tone(1050, t, { wave: 'triangle', peak: 0.09, attack: 0.01, decay: 0.12, glideTo: 1650, vibrato: [28, 40], lowpass: 3600 });
  tone(1350, t + 0.16, { wave: 'triangle', peak: 0.08, attack: 0.01, decay: 0.16, glideTo: 2000, vibrato: [28, 50], lowpass: 3600 });
  tone(340, t + 0.38, { wave: 'sawtooth', peak: 0.05, attack: 0.03, decay: 0.38, glideTo: 270, vibrato: [13, 26], lowpass: 900 });
}

/** A soaring tune: a slow climb, a long held note, and a gentle fall. */
function soar(): void {
  const t = now();
  const melody: Array<[number, number, number]> = [
    [NOTE.G4, 0, 0.4], [NOTE.C5, 0.35, 0.4], [NOTE.E5, 0.7, 0.4], [NOTE.G5, 1.05, 1.0],
    [NOTE.A5, 2.0, 0.3], [NOTE.G5, 2.3, 0.3], [NOTE.E5, 2.6, 0.3], [NOTE.C6, 2.9, 1.3],
  ];
  for (const [f, d, len] of melody) {
    tone(f, t + d, { wave: 'triangle', peak: 0.075, attack: 0.06, decay: len, lowpass: 2200, vibrato: [5, 3] });
    bell(f * 2, t + d, 0.03, len * 0.8);
  }
  // a soft low drone underneath
  tone(NOTE.C3, t, { wave: 'triangle', peak: 0.05, attack: 0.6, decay: 3.4, lowpass: 600 });
}

/** The alarm clock going off, softly. */
function alarm(seconds = 0.9): void {
  const t = now();
  for (let s = 0, i = 0; s < seconds; s += 0.055, i++) tone(i % 2 ? 1600 : 1300, t + s, { wave: 'triangle', peak: 0.035, attack: 0.004, decay: 0.045, lowpass: 3000 });
}

/** Buckbeak gulps a plum. */
function gulp(): void {
  const t = now();
  tone(280, t, { peak: 0.14, attack: 0.01, decay: 0.16, glideTo: 120 });
  tone(500, t + 0.2, { peak: 0.1, decay: 0.08, glideTo: 1000 });
}

/** A happy crowd: a few cheering voices and clapping. */
function cheer(): void {
  const t = now();
  noiseBurst(t, { freq: 1100, q: 0.7, peak: 0.06, attack: 0.15, decay: 1.0 });
  for (const [f, d] of [[250, 0], [320, 0.05], [390, 0.1], [290, 0.18]] as const) {
    tone(f, t + d, { wave: 'sawtooth', peak: 0.025, attack: 0.08, decay: 0.6, glideTo: f * 1.45, lowpass: 1300 });
  }
  for (let i = 0; i < 16; i++) noiseBurst(t + 0.1 + Math.random() * 1.3, { freq: 1800 + Math.random() * 900, q: 1.4, peak: 0.05, decay: 0.03 });
}

// --------------------------------------------------------------------- art

const FEATHER = '#c9c4b8';
const WING = '#a9a296';
const WING_FAR = '#8f897d';
const COAT = '#8a7a6a';
const COAT_FAR = '#74675a';
const TALON = '#d8b060';
const HOOF = '#3a2f28';
const WOOD = '#8f6c4a';

/** Buckbeak's viewBox, and where a rider sits on his back. */
const BW = 460;
const BH = 360;
const RIDER = { x: 185, y: 8, w: 130 };

/**
 * Buckbeak side-on, facing left (460 × 360): parts `head`, `wing`, `wingFar`,
 * `stand` / `fly` (the legs and tail for standing or flying), `shadow` and
 * `rider` (the hero on his back, hidden until they climb on).
 */
function hippogriff(heroArt: string): string {
  const talons = (x: number, y: number, dir: 1 | -1): Node[] =>
    [-8, 0, 8].map((d) => ink([[x + d, y - 4], [x + d - 6 * dir, y + 6], [x + d - 10 * dir, y + 4]], { width: 3.5, color: C.ink }));
  const hoof = (x: number, y: number, rot = 0): Node => piece(ellipse(x, y, 15, 9, rot), HOOF, { edge: 'cut' });
  const tailStand: Pt[] = [[385, 190], [415, 228], [422, 288], [408, 328]];
  const tailFly: Pt[] = [[385, 190], [420, 196], [450, 210], [470, 228]];
  const rider = heroArt.replace('<svg ', `<svg x="${RIDER.x}" y="${RIDER.y}" width="${RIDER.w}" height="${(RIDER.w * 340) / 300}" `);
  return svg({ w: BW, h: BH, name: 'b3c3-buckbeak', label: 'Buckbeak the hippogriff' }, [
    group({ part: 'shadow' }, [piece(ellipse(250, 344, 170, 11), 'rgba(40,25,10,0.18)', { edge: 'cut', fibre: false, shadow: false })]),
    group({ part: 'wingFar' }, [
      piece(curve([[215, 140], [290, 98], [370, 92], [432, 116], [400, 136], [350, 158], [280, 176], [220, 178]], 2), WING_FAR),
    ]),
    // far legs and tail
    group({ part: 'stand' }, [
      piece(band(tailStand, 30), '#6a5d4f'),
      piece(band([[330, 228], [340, 286], [334, 330]], 24), COAT_FAR),
      hoof(334, 334),
      piece(band([[178, 225], [174, 290], [178, 328]], 15), '#c09a50'),
      ...talons(178, 330, 1),
    ]),
    group({ part: 'fly', opacity: 0 }, [
      piece(band(tailFly, 30), '#6a5d4f'),
      piece(band([[330, 228], [372, 252], [418, 258]], 24), COAT_FAR),
      hoof(420, 256, 20),
      piece(band([[180, 228], [206, 256], [238, 262]], 15), '#c09a50'),
    ]),
    // the horse half
    piece(curve([[190, 160], [300, 148], [372, 162], [398, 198], [384, 240], [332, 254], [232, 252], [176, 232]], 2), COAT),
    group({ part: 'rider', opacity: 0 }, [raw(rider)]),
    // near legs
    group({ part: 'stand' }, [
      piece(band([[352, 222], [364, 284], [354, 330]], 28), COAT),
      hoof(354, 336),
      piece(band([[204, 228], [200, 292], [205, 328]], 18), TALON),
      ...talons(205, 330, 1),
    ]),
    group({ part: 'fly', opacity: 0 }, [
      piece(band([[352, 222], [400, 248], [446, 250]], 28), COAT),
      hoof(448, 248, 20),
      piece(band([[206, 230], [232, 258], [264, 266]], 18), TALON),
      ...[-6, 2, 10].map((d) => ink([[264, 266 + d - 4], [276, 266 + d], [274, 266 + d + 6]], { width: 3.5, color: C.ink })),
    ]),
    // feathered chest and leg
    piece(ellipse(206, 232, 24, 30), FEATHER, { fibre: false }),
    piece(ellipse(178, 186, 56, 60), FEATHER),
    group({ part: 'head' }, [
      piece(curve([[140, 196], [208, 176], [186, 108], [146, 66], [104, 82], [118, 140]], 2), FEATHER),
      // feather tufts at the back of the head
      piece(poly([[124, 52], [184, 30], [150, 74]]), FEATHER),
      piece(poly([[136, 74], [196, 62], [152, 92]]), WING),
      piece(ellipse(104, 82, 48, 40), FEATHER),
      // beak
      piece(curve([[74, 62], [40, 66], [16, 84], [20, 100], [32, 96], [66, 108]], 1), C.goldLight, { edge: 'cut' }),
      ink([[64, 92], [42, 92], [26, 96]], { width: 3, color: '#b8862f' }),
      // eye and brow
      piece(circle(96, 72, 12), C.orange, { edge: 'cut' }),
      piece(circle(92, 73, 6), C.ink, { edge: 'clean', shadow: false }),
      dot(89, 70, 2.5, C.white),
      ink([[78, 56], [112, 60]], { width: 5, color: '#8a8478' }),
    ]),
    group({ part: 'wing' }, [
      piece(curve([[206, 150], [282, 118], [362, 114], [430, 136], [404, 154], [432, 168], [376, 178], [400, 194], [330, 198], [262, 206], [210, 196]], 1), WING),
      piece(curve([[214, 156], [280, 132], [340, 132], [320, 160], [262, 176], [220, 178]], 2), FEATHER, { fibre: false }),
      ink([[290, 172], [376, 160]], { width: 2.5, color: '#7d776c', opacity: 0.7 }),
      ink([[280, 186], [370, 182]], { width: 2.5, color: '#7d776c', opacity: 0.7 }),
    ]),
  ]);
}

/** A pumpkin with a stem. */
const pumpkin = (x: number, y: number, r: number): Node[] => [
  piece(ellipse(x, y, r * 1.25, r), C.orange, { rough: 0.8 }),
  ink([[x, y - r + 4], [x - 2, y + r - 4]], { width: 2.5, color: C.ginger, opacity: 0.8 }),
  ink([[x - r * 0.6, y - r + 8], [x - r * 0.7, y + r - 8]], { width: 2, color: C.ginger, opacity: 0.6 }),
  ink([[x + r * 0.6, y - r + 8], [x + r * 0.7, y + r - 8]], { width: 2, color: C.ginger, opacity: 0.6 }),
  piece(band([[x, y - r + 2], [x + 4, y - r - 10]], 6), C.greenDark, { edge: 'cut', fibre: false }),
];

/** Hagrid's paddock at sunset, with his hut, the pumpkins and the forest (1180 × 820). */
function paddock(): string {
  const r = rng(303);
  const crowns: Node[] = [];
  for (let x = -30; x < 1220; x += 38) {
    const y = 392 - r() * 34;
    crowns.push(piece(circle(x, y, 32 + r() * 12), r() > 0.5 ? '#3d5f4c' : '#34544a', { rough: 1.2, shadow: false }));
  }
  const tower = (x: number, top: number, w: number): Node[] => [
    piece(rect(x, top, w, 400 - top), '#8a88a6', { rough: 0.6, shadow: false }),
    piece(poly([[x - 5, top + 2], [x + w / 2, top - w * 1.3], [x + w + 5, top + 2]]), '#76739a', { rough: 0.6, shadow: false }),
  ];
  const posts: Node[] = [];
  for (let x = 20; x < 1200; x += 150) posts.push(piece(rect(x, 462, 22, 96, 3), WOOD, { edge: 'cut' }));
  const tufts: Node[] = [];
  for (let i = 0; i < 18; i++) {
    const x = 20 + r() * 1140;
    const y = 580 + r() * 70;
    tufts.push(ink([[x - 8, y], [x - 4, y - 14]], { width: 2.5, color: C.greenDark, opacity: 0.6 }));
    tufts.push(ink([[x, y], [x + 2, y - 18]], { width: 2.5, color: C.greenDark, opacity: 0.6 }));
    tufts.push(ink([[x + 8, y], [x + 10, y - 12]], { width: 2.5, color: C.greenDark, opacity: 0.6 }));
  }
  return svg({ w: 1180, h: 820, name: 'b3c3-paddock', boil: false, className: 'backdrop' }, [
    // sunset sky
    piece(rect(-20, -20, 1220, 860), '#a3aec6', { edge: 'clean', shadow: false }),
    piece(rect(-20, 150, 1220, 300), '#d6b0a2', { rough: 2, shadow: false }),
    piece(rect(-20, 270, 1220, 200), '#ecc38f', { rough: 2, shadow: false }),
    piece(circle(240, 250, 90), C.candle, { edge: 'cut', fibre: false, shadow: false, opacity: 0.35 }),
    piece(circle(240, 250, 54), C.goldLight, { rough: 0.6 }),
    piece(ellipse(520, 120, 90, 24), C.cream, { shadow: false, opacity: 0.75 }),
    piece(ellipse(590, 104, 60, 20), C.cream, { shadow: false, opacity: 0.75 }),
    piece(ellipse(880, 160, 80, 20), '#f2d9c0', { shadow: false, opacity: 0.7 }),
    // the castle far away, then the Forbidden Forest
    ...tower(560, 300, 22),
    ...tower(596, 262, 28),
    ...tower(636, 290, 22),
    piece(rect(550, 320, 120, 80), '#8a88a6', { rough: 0.6, shadow: false }),
    ...crowns,
    piece(rect(-20, 392, 1220, 70), '#34544a', { rough: 1, shadow: false }),
    // the meadow
    piece(curve([[-40, 452], [300, 436], [700, 446], [1220, 436], [1220, 860], [-40, 860]], 2), '#9ab06e', { rough: 1.3 }),
    // Hagrid's hut
    piece(rect(930, 300, 210, 170, 24), '#a89a84', { rough: 1 }),
    ...[[950, 330], [1010, 318], [1070, 336], [960, 400], [1100, 392], [1040, 430]].map(([x, y]) => piece(ellipse(x, y, 22, 13), '#958772', { edge: 'cut', fibre: false, shadow: false })),
    piece(rect(1090, 196, 30, 90), '#958772', { rough: 0.8 }),
    piece(circle(1108, 168, 18), C.stoneLight, { shadow: false, opacity: 0.7 }),
    piece(circle(1124, 136, 14), C.stoneLight, { shadow: false, opacity: 0.55 }),
    piece(poly([[904, 318], [1036, 206], [1166, 318]]), '#7a5a3a', { rough: 1.2 }),
    ...[960, 1000, 1040, 1080, 1120].map((x) => ink([[1036, 214], [x, 312]], { width: 2, color: '#5a3e26', opacity: 0.5 })),
    piece(rect(1006, 380, 54, 90, 26), C.brownDark, { edge: 'cut' }),
    piece(circle(966, 360, 16), C.candle, { edge: 'cut' }),
    // pumpkins by the fence
    ink([[330, 478], [420, 486], [520, 474]], { width: 3, color: C.greenDark, opacity: 0.7 }),
    ...pumpkin(360, 470, 22),
    ...pumpkin(430, 484, 17),
    ...pumpkin(690, 462, 26),
    ...pumpkin(860, 474, 20),
    ...pumpkin(910, 482, 16),
    // the paddock fence
    piece(band([[-20, 488], [1200, 484]], 14), WOOD, { rough: 0.8 }),
    piece(band([[-20, 528], [1200, 524]], 14), WOOD, { rough: 0.8 }),
    ...posts,
    // the tall post the clock sits on
    piece(rect(334, 410, 26, 150, 3), WOOD, { edge: 'cut' }),
    // nearer grass, calm at the bottom for the captions
    piece(curve([[-40, 566], [400, 556], [800, 566], [1220, 552], [1220, 860], [-40, 860]], 2), '#86a35f', { rough: 1.3 }),
    ...tufts,
  ]);
}

/** A wicker basket (170 × 100) to hold the plum and the milk. */
function basket(): string {
  return svg({ w: 170, h: 100, name: 'b3c3-basket', label: 'a basket' }, [
    piece(poly([[6, 20], [164, 20], [146, 96], [24, 96]]), C.tan),
    ...[38, 58, 78].map((y) => ink([[12 + (y - 20) * 0.2, y], [158 - (y - 20) * 0.2, y]], { width: 2.5, color: C.brown, opacity: 0.7 })),
    ...[40, 70, 100, 130].map((x) => ink([[x, 22], [x + (x < 85 ? 4 : -4), 94]], { width: 2, color: C.brown, opacity: 0.5 })),
    piece(rect(0, 12, 170, 16, 6), C.wood, { edge: 'cut' }),
  ]);
}

/** The sunset sky for the flight (1180 × 820): the landscape scrolls in front of it. */
function sky(): string {
  return svg({ w: 1180, h: 820, name: 'b3c3-sky', boil: false, className: 'backdrop' }, [
    piece(rect(-20, -20, 1220, 860), '#7d82a6', { edge: 'clean', shadow: false }),
    piece(rect(-20, 120, 1220, 300), '#b78fa0', { rough: 2.2, shadow: false }),
    piece(rect(-20, 250, 1220, 260), '#e0a487', { rough: 2.2, shadow: false }),
    piece(rect(-20, 350, 1220, 200), '#f0c98a', { rough: 2.2, shadow: false }),
    piece(circle(930, 400, 120), C.candle, { edge: 'cut', fibre: false, shadow: false, opacity: 0.35 }),
    piece(circle(930, 400, 78), C.goldLight, { rough: 0.6 }),
    piece(ellipse(220, 140, 110, 26), '#e9c6c0', { shadow: false, opacity: 0.8 }),
    piece(ellipse(300, 124, 70, 22), '#e9c6c0', { shadow: false, opacity: 0.8 }),
    piece(ellipse(760, 220, 120, 22), '#f2d2b8', { shadow: false, opacity: 0.75 }),
    piece(ellipse(1060, 120, 90, 20), '#d8b4c0', { shadow: false, opacity: 0.75 }),
    ...[[560, 90], [600, 110], [1000, 250]].map(([x, y]) => ink([[x - 12, y - 6], [x, y], [x + 12, y - 6]], { width: 2.5, color: C.charcoal, opacity: 0.55 })),
  ]);
}

/** Far hills and Hogwarts (2400 × 200), drifting slowly behind. */
function farStrip(): string {
  const ridge = (y: number, a: number, f: number, ph: number): Pt[] => {
    const pts: Pt[] = [[-30, 220]];
    for (let x = -30; x <= 2430; x += 30) pts.push([x, y - a * (0.5 + 0.5 * Math.sin((x * f * Math.PI * 2) / 2400 + ph))]);
    pts.push([2430, 220]);
    return pts;
  };
  const tower = (x: number, top: number, w: number): Node[] => [
    piece(rect(x, top, w, 160 - top), '#6f6c90', { rough: 0.6, shadow: false }),
    piece(poly([[x - 5, top + 2], [x + w / 2, top - w * 1.3], [x + w + 5, top + 2]]), '#5f5c82', { rough: 0.6, shadow: false }),
    piece(rect(x + w / 2 - 3, top + 14, 6, 9, 3), C.candle, { edge: 'cut', fibre: false, shadow: false }),
  ];
  return svg({ w: 2400, h: 200, name: 'b3c3-far', boil: false }, [
    piece(poly(ridge(110, 60, 5, 0.3)), '#8c86a6', { rough: 1.2, shadow: false }),
    ...tower(380, 70, 26),
    ...tower(420, 30, 34),
    ...tower(470, 58, 28),
    ...tower(512, 84, 22),
    piece(rect(372, 96, 170, 70), '#6f6c90', { rough: 0.6, shadow: false }),
    piece(poly(ridge(150, 34, 9, 2)), '#6d7f8e', { rough: 1.2, shadow: false }),
  ]);
}

/** Where the lake ends and the forest starts on the near strip. */
const SHORE = 2300;

/** The shining lake, then the Forbidden Forest (3800 × 440), scrolling past below. */
function nearStrip(): string {
  const r = rng(909);
  const glints: Node[] = [];
  for (let i = 0; i < 46; i++) {
    const x = r() * (SHORE - 60);
    const y = 100 + r() * 190;
    const w = 20 + r() * 50;
    glints.push(piece(rect(x, y, w, 6, 3), r() > 0.4 ? C.goldLight : '#f6e0b0', { edge: 'cut', fibre: false, shadow: false, opacity: 0.8 }));
  }
  const ripples: Node[] = [];
  for (let i = 0; i < 26; i++) {
    const x = r() * (SHORE - 80);
    const y = 110 + r() * 200;
    ripples.push(ink([[x, y], [x + 30, y - 3], [x + 60, y]], { width: 2, color: '#b8cde0', opacity: 0.55 }));
  }
  const trees: Node[] = [];
  for (let x = SHORE - 40; x < 3840; x += 46) {
    const top = 6 + r() * 50;
    if (r() > 0.45) {
      trees.push(piece(poly([[x - 40, 150], [x, top], [x + 40, 150]]), r() > 0.5 ? C.greenDeep : '#2f5444', { rough: 1.1 }));
    } else {
      trees.push(piece(circle(x, top + 46, 44), r() > 0.5 ? C.greenDark : '#3a5f48', { rough: 1.3 }));
    }
  }
  return svg({ w: 3800, h: 440, name: 'b3c3-near', boil: false }, [
    // the lake
    piece(rect(-20, 76, SHORE + 40, 380), '#6e88ae', { rough: 1, shadow: false }),
    piece(rect(-20, 150, SHORE + 40, 300), '#5f789e', { rough: 1.6, shadow: false }),
    piece(rect(-20, 70, SHORE + 40, 12, 4), '#3e5a4c', { rough: 1.2 }),
    ...ripples,
    ...glints,
    // reeds along the near edge of the far shore
    ...[120, 560, 980, 1500, 1900].map((x) => ink([[x, 80], [x + 4, 60]], { width: 3, color: '#3e5a4c' })),
    // the forest, with a dark floor that stays calm under the captions
    piece(curve([[SHORE - 80, 460], [SHORE - 70, 100], [SHORE + 40, 40], [3840, 40], [3840, 460]], 1), '#2c4a3a', { rough: 1.2 }),
    ...trees,
    piece(rect(SHORE - 30, 140, 1560, 320), '#264232', { rough: 1.2, shadow: false }),
  ]);
}

/** Ripple rings where the claw touches the water (200 × 80). */
function ripple(): string {
  return svg({ w: 200, h: 80, name: 'b3c3-ripple' }, [
    piece(ellipse(100, 40, 92, 30), '#b8cde0', { edge: 'cut', fibre: false, shadow: false, opacity: 0.45 }),
    ink(ellipse(100, 40, 66, 20), { width: 3, color: C.white, closed: true, opacity: 0.85 }),
    ink(ellipse(100, 40, 34, 10), { width: 3, color: C.white, closed: true, opacity: 0.9 }),
  ]);
}

/** A full-stage sunset-coloured cover for changing scenes. */
const cover = `<div style="width:100%;height:100%;background:#e8b48c"></div>`;

// ---------------------------------------------------------------- helpers

/** Where an actor really is now (its placed corner plus its tween offset). */
function at(el: HTMLElement): [number, number] {
  return [(parseFloat(el.style.left) || 0) + Number(gsap.getProperty(el, 'x')), (parseFloat(el.style.top) || 0) + Number(gsap.getProperty(el, 'y'))];
}

/** A hop along an arc to an absolute stage spot (the actor's top-left). */
function jump(k: Kit, el: HTMLElement, x: number, y: number, height: number, seconds: number, extra: { scale?: number } = {}): Promise<void> {
  const bx = parseFloat(el.style.left) || 0;
  const by = parseFloat(el.style.top) || 0;
  const peak = Math.min(at(el)[1], y) - height;
  return k.all(
    k.to(el, seconds, { x: x - bx, ease: 'none', ...extra }),
    k.to(el, seconds / 2, { y: peak - by, ease: 'power2.out' }).then(() => k.to(el, seconds / 2, { y: y - by, ease: 'power2.in' })),
  );
}

/** Where Buckbeak stands in the paddock, and how big. */
const BB = { x: 440, y: 286, w: 440 };
const S = BB.w / BW;
/** Where the hero stands. */
const HERO = { x: 40, y: 345, w: 250 };

// ------------------------------------------------------------------- story

export default defineStory({
  lines: {
    hello: { who: 'hagrid', text: 'Blimey, flying time! Now remember… always bow to Buckbeak first!' },
    bow: { who: 'narrator', text: 'You bow low… Buckbeak stares… and stares… and bows back!' },
    ride: { who: 'hagrid', text: 'He likes you, {name}! Climb up… and hold on tight!' },
    fly: { who: 'buckbeak', text: 'Up we go! Over the forest… and the shining lake!' },
    dip: { who: 'narrator', text: 'Swoop! Buckbeak dips one claw in the water. Splish!' },
    land: { who: 'hagrid', text: 'What a flier! A plum for Buckbeak… and milk for you!' },
  },

  async play(k) {
    k.backdrop(paddock());

    // ---- The paddock: Buckbeak, Hagrid, and the five words.
    const bb = k.add(hippogriff(characters[k.hero]()), { x: BB.x, y: BB.y, w: BB.w, z: 10 });
    const part = (name: string) => [...bb.querySelectorAll<SVGGElement>(`[data-part="${name}"]`)];
    const [head] = part('head');
    const [wing] = part('wing');
    const [wingFar] = part('wingFar');
    const [rider] = part('rider');
    const [shadow] = part('shadow');
    if (head) gsap.set(head, { svgOrigin: '176 178' });
    if (wing) gsap.set(wing, { svgOrigin: '214 160' });
    if (wingFar) gsap.set(wingFar, { svgOrigin: '224 150' });
    const pose = (flying: boolean): void => {
      for (const p of part('stand')) p.setAttribute('opacity', flying ? '0' : '1');
      for (const p of part('fly')) p.setAttribute('opacity', flying ? '1' : '0');
      shadow?.setAttribute('opacity', flying ? '0' : '1');
    };
    /** Flaps the wings until stopped (still in calm mode). */
    const flapping = (beat = 0.5): (() => void) => {
      if (k.calm || !wing || !wingFar) return () => {};
      const tl = gsap.timeline({ repeat: -1 });
      tl.to([wing, wingFar], { rotation: -38, duration: beat / 2, ease: stepped(beat / 2, 'sine.out') });
      tl.to([wing, wingFar], { rotation: 14, duration: beat / 2, ease: stepped(beat / 2, 'sine.in') });
      return () => {
        tl.kill();
        gsap.to([wing, wingFar], { rotation: 0, duration: 0.2, ease: stepped(0.2, 'sine.out') });
      };
    };

    const clock = k.picture('clock', { x: 297, y: 322, w: 100, z: 6 });
    const stick = k.picture('stick', { x: 420, y: 556, w: 150, z: 14 });
    const twig = k.picture('twig', { x: 560, y: 580, w: 120, z: 15 });
    const hagrid = k.character('hagrid', { x: 915, y: 330, w: 250, z: 8 });
    const plum = k.picture('plum', { x: 985, y: 532, w: 86, z: 15 });
    const milk = k.picture('milk', { x: 1058, y: 512, w: 92, z: 15 });
    const bask = k.add(basket(), { x: 975, y: 590, w: 170, z: 16 });
    const hero = k.character('hero', { ...HERO, z: 12 });
    k.set([hagrid, hero], { opacity: 0 });
    const paddockProps = [clock, stick, twig, hagrid, plum, milk, bask];

    // ---- The clock rings: flying time!
    await k.wait(600);
    alarm();
    await k.shake(clock, 4, 4);
    if (head) void k.to(head, 0.3, { rotation: 8 }).then(() => k.to(head, 0.3, { rotation: 0 }));
    chirp();
    k.sfx.whoosh();
    await k.enter(hagrid, 'right');
    await k.say('hello', hagrid);

    // ---- The bow.
    k.fx.patter(5);
    await k.enter(hero, 'left');
    const bowScene = async (): Promise<void> => {
      await k.to(hero, 0.5, { rotation: 10, y: 22, scaleY: 0.94, transformOrigin: '50% 100%', ease: 'power2.out' });
      await k.wait(500);
      // Buckbeak stares…
      if (head) {
        await k.to(head, 0.3, { rotation: 6 });
        await k.wait(500);
        await k.to(head, 0.3, { rotation: -4 });
        await k.wait(300);
      }
      // …and bows back!
      await k.all(
        head ? k.to(head, 0.6, { rotation: -34, ease: 'power2.inOut' }) : k.wait(0),
        k.to(bb, 0.6, { rotation: -4, transformOrigin: '40% 100%', ease: 'power2.inOut' }),
      );
      k.fx.twinkle();
      await k.wait(500);
    };
    await k.all(k.say('bow'), bowScene());
    chirp();
    k.sparkle(560, 360, 14, 170);
    await k.all(
      k.to(hero, 0.4, { rotation: 0, y: 0, scaleY: 1, ease: 'back.out(2)' }),
      head ? k.to(head, 0.4, { rotation: 0, ease: 'back.out(2)' }) : k.wait(0),
      k.to(bb, 0.4, { rotation: 0, ease: 'back.out(2)' }),
      k.hop(hagrid, 30, 1),
    );
    await k.say('ride', hagrid);

    // ---- Up onto his back.
    const rw = RIDER.w * S;
    const rh = (rw * 340) / 300;
    const heroH = (HERO.w * 340) / 300;
    const seat = (): [number, number] => {
      const [bx, by] = at(bb);
      return [bx + RIDER.x * S + rw / 2 - HERO.w / 2, by + RIDER.y * S + rh / 2 - heroH / 2];
    };
    k.fx.boing();
    k.set(hero, { transformOrigin: '50% 50%' });
    const [sx, sy] = seat();
    await jump(k, hero, sx, sy, 140, 0.7, { scale: rw / HERO.w });
    rider?.setAttribute('opacity', '1');
    k.set(hero, { opacity: 0 });
    k.fx.thud();
    await k.pop(bb, 1.04);
    chirp();

    // ---- Take off!
    let stopFlap = flapping(0.55);
    wingbeat(4, 0.5);
    wind(2.5);
    void k.shake(twig, 6, 3);
    void k.hop(hagrid, 24, 2);
    await k.to(bb, 0.5, { y: 12, ease: 'power2.out' });
    pose(true);
    await k.to(bb, 1.4, { x: -760, y: -820, rotation: 12, ease: 'power2.in' });

    // ---- Change to the sky, behind a sunset-coloured cover.
    const curtain = k.add(cover, { x: 0, y: 0, w: 1180, h: 820, z: 60 });
    k.set(curtain, { opacity: 0 });
    await k.fade(curtain, 1, 0.35);
    k.caption('');
    k.set(paddockProps, { opacity: 0 });
    k.backdrop(sky());
    const far = k.add(farStrip(), { x: 0, y: 360, w: 2400, h: 200, z: 2, still: true });
    const near = k.add(nearStrip(), { x: 0, y: 400, w: 3800, h: 440, z: 4, still: true });
    k.set(far, { x: -1220 });
    k.set(near, { x: -2620 });
    k.set(bb, { x: 820, y: -160, rotation: 0 });
    await k.fade(curtain, 0, 0.4);
    k.remove(curtain);

    // Soar in from the right as the land rolls by below.
    const FLY = { x: -70, y: -150 };
    soar();
    wind(4);
    const scroll = k.all(k.to(far, 8.5, { x: 0, ease: 'sine.inOut' }), k.to(near, 8.5, { x: 0, ease: 'sine.inOut' }));
    wingbeat(2, 0.55);
    await k.to(bb, 1.3, { x: FLY.x, y: FLY.y, ease: 'power2.out' });
    stopFlap();
    const glide = !k.calm ? gsap.to(bb, { y: `+=${12}`, duration: 0.9, yoyo: true, repeat: -1, ease: stepped(0.9, 'sine.inOut') }) : null;
    await k.say('fly', bb);

    // Dip a claw in the shining lake.
    glide?.kill();
    await k.wait(400);
    const dip = async (): Promise<void> => {
      await k.to(bb, 0.9, { x: FLY.x - 30, y: FLY.y + 186, rotation: -8, ease: 'power2.in' });
      const [bx, by] = at(bb);
      const cx = bx + 270 * S;
      const cy = by + 270 * S;
      k.fx.splash();
      const ring = k.add(ripple(), { x: cx - 100, y: cy - 34, w: 200, h: 80, z: 6 });
      k.set(ring, { scale: 0.3, opacity: 1 });
      void k.to(ring, 1.2, { scale: 1.4, opacity: 0, ease: 'power1.out' }).then(() => k.remove(ring));
      k.sparkle(cx, cy - 20, 10, 90);
      stopFlap = flapping(0.5);
      wingbeat(3, 0.45);
      await k.to(bb, 1.0, { x: FLY.x - 10, y: FLY.y, rotation: 4, ease: 'power2.out' });
      await k.to(bb, 0.4, { rotation: 0 });
    };
    await k.all(k.say('dip'), dip());
    chirp();
    await scroll;

    // ---- Home again: off to the left, and back to the paddock.
    wind(2);
    wingbeat(2, 0.5);
    await k.to(bb, 1.0, { x: -900, y: -260, rotation: -6, ease: 'power2.in' });
    const curtain2 = k.add(cover, { x: 0, y: 0, w: 1180, h: 820, z: 60 });
    k.set(curtain2, { opacity: 0 });
    await k.fade(curtain2, 1, 0.35);
    k.caption('');
    k.remove(far);
    k.remove(near);
    k.backdrop(paddock());
    k.set(paddockProps, { opacity: 1 });
    k.set(bb, { x: 800, y: -520, rotation: -10 });
    await k.fade(curtain2, 0, 0.4);
    k.remove(curtain2);

    // Down he glides… and lands!
    wingbeat(3, 0.5);
    await k.to(bb, 1.5, { x: 0, y: -30, rotation: 0, ease: 'power2.out' });
    stopFlap();
    pose(false);
    await k.to(bb, 0.25, { y: 0, ease: 'power2.in' });
    k.fx.thud();
    void k.quake(4);
    void k.hop(twig, 30, 1);
    void k.hop(stick, 20, 1);
    void k.hop(clock, 16, 1);
    cheer();
    k.confetti(30);
    await k.all(k.hop(hagrid, 40, 2), k.pop(bb, 1.05));

    // The hero hops back down.
    const [rx, ry] = seat();
    k.set(hero, { x: rx - HERO.x, y: ry - HERO.y, scale: rw / HERO.w, rotation: 0, opacity: 1 });
    rider?.setAttribute('opacity', '0');
    k.fx.boing();
    await jump(k, hero, HERO.x, HERO.y, 120, 0.7, { scale: 1 });
    k.fx.thud();

    // ---- Treats: a plum for Buckbeak and milk for the hero.
    const treats = async (): Promise<void> => {
      await k.wait(500);
      k.fx.whizz();
      await jump(k, plum, BB.x + 4, BB.y + 46, 160, 0.8);
      gulp();
      await k.vanish(plum, 0.2);
      if (head) await k.to(head, 0.2, { rotation: -10 }).then(() => k.to(head, 0.25, { rotation: 0, ease: 'back.out(2)' }));
      chirp();
      await k.wait(300);
      k.fx.boing();
      await jump(k, milk, 272, 520, 180, 0.8);
      k.fx.pop();
      await k.pop(milk, 1.1);
    };
    await k.all(k.say('land', hagrid), treats());

    // ---- One more bow each, and a happy cheer.
    soar();
    k.confetti(34);
    k.sparkle(560, 340, 16, 220);
    await k.all(
      head ? k.to(head, 0.5, { rotation: -30 }) : k.wait(0),
      k.to(hero, 0.5, { rotation: 10, y: 22, scaleY: 0.94, transformOrigin: '50% 100%' }),
    );
    chirp();
    await k.wait(400);
    await k.all(
      head ? k.to(head, 0.4, { rotation: 0, ease: 'back.out(2)' }) : k.wait(0),
      k.to(hero, 0.4, { rotation: 0, y: 0, scaleY: 1, ease: 'back.out(2)' }),
    );
    k.fx.jingle();
    await k.all(k.hop(hero, 40, 2), k.hop(hagrid, 30, 2), k.hop(milk, 20, 2));
    await k.wait(600);
  },
});
