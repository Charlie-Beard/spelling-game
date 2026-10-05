/**
 * Book 2, chapter 4: Fawkes the Phoenix.
 *
 * Dumbledore's round office, gadgets whirring. Fawkes is old and droopy;
 * Dumbledore says to watch. Fawkes glows and bursts into warm paper flames,
 * leaving a little pile of ash, out of which pops a fluffy baby phoenix (who
 * sneezes the ash away). The five words the child spelled fly into the chick
 * one by one and it grows, until Fawkes is back, magnificent, singing.
 */
import { gsap } from 'gsap';
import { fluff } from '../art/characters/heroes';
import { stepped } from '../ui/anim';
import { bell, C, circle, curve, defineStory, dot, ellipse, ink, type Kit, noiseBurst, NOTE, now, piece, poly, rect, rng, svg, tone, type Node, type Pt } from './kit';

// ------------------------------------------------------------------ sounds

/** The phoenix song: a slow, warm bell melody with a soft flute under it. */
function phoenixSong(): void {
  const t = now();
  const melody: Array<[number, number]> = [
    [NOTE.D5, 0], [NOTE.G5, 0.38], [NOTE.B5, 0.76], [NOTE.A5, 1.14], [NOTE.G5, 1.44],
    [NOTE.D6, 1.82], [NOTE.B5, 2.4], [NOTE.C6, 2.7], [NOTE.G5, 3.0],
  ];
  melody.forEach(([f, dt], i) => {
    const last = i === melody.length - 1;
    bell(f, t + dt, 0.1, last ? 2 : 1.2);
    tone(f, t + dt, { peak: 0.05, attack: 0.07, decay: last ? 1.4 : 0.5, vibrato: [5.5, f * 0.01] });
  });
  // A soft warm hum underneath.
  tone(NOTE.G3, t, { peak: 0.05, attack: 0.8, decay: 3.4 });
  tone(NOTE.D4, t + 1.4, { peak: 0.035, attack: 0.6, decay: 2.4 });
}

/** A soft, warm whoosh of magic fire with a few gentle crackles. */
function fireWhoosh(): void {
  const t = now();
  noiseBurst(t, { freq: 300, q: 0.7, peak: 0.14, attack: 0.45, decay: 1.2, sweepTo: 1500 });
  tone(98, t, { peak: 0.07, attack: 0.4, decay: 1.1, glideTo: 150 });
  const r = rng(77);
  for (let i = 0; i < 8; i++) noiseBurst(t + 0.35 + i * 0.15 + r() * 0.06, { freq: 2400 + r() * 2200, q: 3, peak: 0.035, decay: 0.03 });
}

/** A tiny baby-bird cheep, twice. */
function cheep(): void {
  const t = now();
  tone(2100, t, { wave: 'triangle', peak: 0.09, attack: 0.005, decay: 0.08, glideTo: 2900, lowpass: 5000 });
  tone(2300, t + 0.15, { wave: 'triangle', peak: 0.09, attack: 0.005, decay: 0.09, glideTo: 3200, lowpass: 5000 });
}

/** A tiny "ah… choo!" */
function sneeze(): void {
  const t = now();
  tone(420, t, { wave: 'triangle', peak: 0.06, attack: 0.25, decay: 0.1, glideTo: 720, lowpass: 1800 });
  noiseBurst(t + 0.38, { freq: 3200, q: 0.8, peak: 0.14, attack: 0.005, decay: 0.16, sweepTo: 1200 });
  tone(900, t + 0.38, { wave: 'triangle', peak: 0.05, decay: 0.1, glideTo: 500 });
}

/** A droopy, sad little slide down. */
function droop(): void {
  const t = now();
  tone(560, t, { wave: 'triangle', peak: 0.08, attack: 0.05, decay: 0.8, glideTo: 330, lowpass: 1500, vibrato: [5, 6] });
}

/** Dumbledore's silver gadgets whirring and ticking. */
function whirr(): void {
  const t = now();
  for (let i = 0; i < 3; i++) tone(700 + i * 80, t + i * 0.25, { wave: 'sawtooth', peak: 0.025, attack: 0.05, decay: 0.25, vibrato: [30, 30], lowpass: 1400 });
  for (let i = 0; i < 8; i++) noiseBurst(t + i * 0.12, { freq: 4200, q: 4, peak: 0.03, decay: 0.02 });
  bell(NOTE.E6, t + 0.8, 0.04, 0.5);
}

// --------------------------------------------------------------------- art

const SILVER = '#c9ccd2';
const SILVER_DARK = '#9aa0aa';

/** A sleeping portrait on the wall. */
function sleeper(x: number, y: number, w: number, h: number, bg: string, robe: string, o: { hat?: string; beard?: boolean; hair?: string }): Node[] {
  const cx = x + w / 2;
  const cy = y + h * 0.5;
  const r = w * 0.22;
  return [
    piece(rect(x - 9, y - 9, w + 18, h + 18, 4), C.gold, { edge: 'cut' }),
    piece(rect(x, y, w, h), bg, { edge: 'clean', shadow: false }),
    piece(curve([[x + 6, y + h], [x + 10, y + h * 0.8], [cx, y + h * 0.7], [x + w - 10, y + h * 0.8], [x + w - 6, y + h]], 2), robe, { fibre: false, shadow: false }),
    ...(o.hair ? [piece(ellipse(cx, cy - r * 0.2, r * 1.25, r * 1.1), o.hair, { fibre: false, shadow: false })] : []),
    piece(circle(cx, cy, r), C.skin, { edge: 'cut', fibre: false }),
    ...(o.beard ? [piece(curve([[cx - r * 0.9, cy + r * 0.3], [cx, cy + r * 2.3], [cx + r * 0.9, cy + r * 0.3]], 2), '#ece8e0', { fibre: false })] : []),
    ink([[cx - r * 0.62, cy - r * 0.05], [cx - r * 0.35, cy + r * 0.15], [cx - r * 0.1, cy - r * 0.05]], { width: 2.5 }),
    ink([[cx + r * 0.1, cy - r * 0.05], [cx + r * 0.35, cy + r * 0.15], [cx + r * 0.62, cy - r * 0.05]], { width: 2.5 }),
    ...(o.beard ? [] : [ink([[cx - r * 0.2, cy + r * 0.55], [cx + r * 0.2, cy + r * 0.55]], { width: 2.5 })]),
    ...(o.hat ? [piece(poly([[cx - r * 1.3, cy - r * 0.6], [cx + r * 0.3, cy - r * 2.7], [cx + r * 1.3, cy - r * 0.6]]), o.hat, { edge: 'cut', fibre: false })] : []),
    // a sleepy "z"
    ink([[x + w - 24, y + 12], [x + w - 13, y + 12], [x + w - 24, y + 24], [x + w - 13, y + 24]], { width: 2.5, color: C.cream, wobble: 0.2 }),
  ];
}

/** Dumbledore's round office at night, as a pop-up paper scene. */
function office(): string {
  const wall = '#4d4262';
  const wallDark = '#3d3452';
  const r = rng(424);
  const bookCols = [C.red, C.blueDark, C.greenDark, C.gold, C.plum, C.rust, C.teal, C.brown, C.sand];
  const books: Node[] = [];
  for (const sy of [300, 395, 490, 585]) {
    let x = 54;
    while (x < 262) {
      const w = Math.min(14 + r() * 12, 266 - x);
      const bh = 54 + r() * 26;
      books.push(piece(rect(x, sy - bh, w, bh, 2), bookCols[Math.floor(r() * bookCols.length)], { edge: 'cut', fibre: false }));
      x += w + 3;
    }
  }
  // The arched window behind Fawkes.
  const arch = (x0: number, x1: number, top: number, bottom: number): Pt[] => {
    const cx = (x0 + x1) / 2;
    const rr = (x1 - x0) / 2;
    const pts: Pt[] = [[x0, bottom]];
    for (let i = 0; i <= 16; i++) {
      const a = Math.PI + (i / 16) * Math.PI;
      pts.push([cx + Math.cos(a) * rr, top + rr + Math.sin(a) * rr]);
    }
    pts.push([x1, bottom]);
    return pts;
  };
  const stars: Node[] = [];
  for (let i = 0; i < 14; i++) stars.push(dot(486 + r() * 208, 110 + r() * 340, 1.5 + r() * 2, C.cream, 0.6 + r() * 0.4));
  return svg({ w: 1180, h: 820, name: 'b2c4-office', boil: false, className: 'backdrop' }, [
    piece(rect(-20, -20, 1220, 860), wall, { edge: 'clean', shadow: false }),
    // curved-wall pillars and a ceiling band
    piece(rect(306, -10, 34, 620), wallDark, { rough: 0.8 }),
    piece(rect(842, -10, 34, 620), wallDark, { rough: 0.8 }),
    piece(rect(-20, -20, 1220, 42), wallDark, { rough: 0.8 }),
    piece(rect(-20, 18, 1220, 6), C.gold, { edge: 'cut', fibre: false, shadow: false }),
    // window
    piece(arch(452, 728, 62, 488), C.brownDark, { rough: 0.8 }),
    piece(arch(468, 712, 78, 476), C.night, { edge: 'cut', fibre: false }),
    ...stars,
    piece(circle(652, 150, 26), C.cream, { edge: 'cut', fibre: false }),
    piece(circle(664, 142, 22), C.night, { edge: 'clean', shadow: false }),
    piece(rect(585, 78, 10, 400), C.brownDark, { edge: 'cut', fibre: false }),
    piece(rect(468, 300, 244, 8), C.brownDark, { edge: 'cut', fibre: false }),
    piece(rect(444, 474, 292, 18, 3), C.wood),
    // bookshelf
    piece(rect(36, 196, 250, 420, 4), C.brownDark),
    piece(rect(50, 212, 222, 392), '#33241c', { edge: 'cut', fibre: false, shadow: false }),
    ...books,
    ...[300, 395, 490, 585].map((y) => piece(rect(44, y, 234, 10, 2), C.wood, { edge: 'cut' })),
    // sleeping portraits
    ...sleeper(56, 52, 104, 120, C.greenDeep, C.blueDark, { hat: C.blueDark, beard: true }),
    ...sleeper(192, 62, 92, 108, C.redDark, C.plum, { hair: C.stoneLight }),
    ...sleeper(748, 96, 76, 96, C.blueDark, C.brownDark, { hair: C.brownDark }),
    ...sleeper(1012, 40, 104, 116, C.plum, C.greenDark, { hat: C.greenDark, beard: true }),
    // the gadget shelf (the whirring parts are actors)
    piece(rect(882, 280, 272, 14, 3), C.wood),
    ...[900, 1130].map((x) => piece(poly([[x - 6, 294], [x + 6, 294], [x, 320]]), C.wood, { edge: 'cut', fibre: false })),
    piece(rect(926, 226, 8, 56), SILVER_DARK, { edge: 'cut', fibre: false }),
    piece(ellipse(930, 278, 26, 7), SILVER, { edge: 'cut' }),
    piece(ellipse(1030, 252, 24, 28), SILVER),
    piece(rect(1024, 206, 12, 28), SILVER_DARK, { edge: 'cut', fibre: false }),
    piece(poly([[1016, 196], [1044, 196], [1036, 210], [1024, 210]]), SILVER, { edge: 'cut' }),
    ink([[1012, 252], [1048, 252]], { width: 2, color: SILVER_DARK }),
    piece(rect(1106, 216, 6, 64), SILVER_DARK, { edge: 'cut', fibre: false }),
    piece(ellipse(1109, 278, 18, 5), SILVER, { edge: 'cut' }),
    // floor and round rug
    piece(curve([[-40, 860], [-40, 612], [300, 598], [590, 594], [880, 598], [1220, 612], [1220, 860]], 2), '#6b4a36', { rough: 1.2 }),
    piece(ellipse(590, 712, 440, 74), C.gold, { rough: 1.2 }),
    piece(ellipse(590, 712, 418, 64), C.redDark, { edge: 'cut', fibre: false }),
    piece(ellipse(590, 712, 300, 40), '#8a3a32', { edge: 'cut', fibre: false, shadow: false }),
    // Fawkes's golden perch (the bar matches the one in his portrait)
    piece(ellipse(590, 650, 66, 14), C.gold),
    piece(rect(583, 470, 14, 182, 4), C.gold),
    piece(rect(480, 462, 220, 14, 6), C.wood),
  ]);
}

/** Old, droopy Fawkes on his perch (lined up with his 300 × 340 portrait). */
function oldFawkes(): string {
  const body = '#8d5a50';
  const wing = '#6e4440';
  const dull = '#b39a6a';
  return svg({ w: 300, h: 340, name: 'b2c4-old-fawkes', label: 'Fawkes, old and droopy' }, [
    // droopy tail
    ...[[-14, '#9a8a6a'], [0, '#a07a58'], [14, '#9a8a6a']].map(([dx, col]) =>
      piece(curve([[146, 236], [150 + (dx as number) * 0.4, 300], [148 + (dx as number), 338], [158 + (dx as number), 338], [158, 238]], 2), col as string),
    ),
    // wings hanging down
    piece(curve([[118, 150], [72, 172], [60, 250], [82, 304], [98, 262], [122, 232]], 2), wing),
    piece(curve([[182, 150], [228, 172], [240, 250], [218, 304], [202, 262], [178, 232]], 2), wing),
    piece(curve([[150, 140], [196, 166], [196, 236], [150, 258], [104, 236], [104, 166]]), body),
    piece(curve([[150, 184], [172, 198], [168, 240], [150, 250], [132, 240], [128, 198]]), '#a88466', { fibre: false }),
    // head, hanging low, its crest flopped over to one side
    piece(circle(150, 144, 36), body),
    ...([[[138, 112], [204, 120], [150, 122]], [[146, 110], [210, 138], [156, 124]], [[154, 112], [198, 154], [162, 128]]] as Pt[][]).map((pts) =>
      piece(poly(pts), dull, { edge: 'cut' }),
    ),
    ink([[124, 138], [134, 144], [144, 138]], { width: 3.5 }),
    ink([[156, 138], [166, 144], [176, 138]], { width: 3.5 }),
    ink([[122, 128], [142, 132]], { width: 2.5, color: '#5a3a34' }),
    ink([[178, 128], [158, 132]], { width: 2.5, color: '#5a3a34' }),
    piece(curve([[141, 152], [159, 152], [150, 184]], 1), dull, { edge: 'cut' }),
    ...[130, 170].map((x) => piece(ellipse(x, 258, 12, 8), dull, { edge: 'cut' })),
  ]);
}

/** A loose, droopy feather. */
function featherArt(): string {
  return svg({ w: 60, h: 120, name: 'b2c4-feather' }, [
    piece(curve([[30, 6], [48, 40], [44, 90], [30, 116], [16, 90], [12, 40]], 2), '#8d5a50'),
    ink([[30, 12], [30, 114]], { width: 2, color: '#5a3a34' }),
  ]);
}

/** One paper flame, 120 × 200. */
function flameArt(name: string, outer: string, mid: string): string {
  return svg({ w: 120, h: 200, name: 'b2c4-flame-' + name }, [
    piece(curve([[60, 4], [80, 50], [108, 110], [104, 170], [60, 196], [16, 170], [12, 110], [40, 60]], 2), outer, { rough: 1.4 }),
    piece(curve([[62, 50], [82, 110], [86, 160], [60, 186], [34, 160], [38, 110]], 2), mid, { fibre: false }),
    piece(curve([[60, 112], [74, 152], [60, 182], [46, 152]], 2), C.candle, { fibre: false, shadow: false }),
  ]);
}

/** A soft golden halo, 300 × 300. */
function haloArt(): string {
  return svg({ w: 300, h: 300, name: 'b2c4-halo', boil: false }, [
    piece(circle(150, 150, 146), C.goldLight, { edge: 'cut', fibre: false, shadow: false, opacity: 0.22 }),
    piece(circle(150, 150, 112), C.candle, { edge: 'cut', fibre: false, shadow: false, opacity: 0.28 }),
    piece(circle(150, 150, 74), C.candle, { edge: 'cut', fibre: false, shadow: false, opacity: 0.32 }),
  ]);
}

/** A little heap of ash with a few warm embers, 160 × 70. */
function ashArt(): string {
  return svg({ w: 160, h: 70, name: 'b2c4-ash' }, [
    piece(curve([[8, 68], [34, 34], [80, 14], [126, 32], [152, 68]], 2), '#7d7a76'),
    piece(curve([[50, 40], [80, 24], [110, 38], [80, 46]], 2), '#a19d96', { fibre: false, shadow: false }),
    piece(circle(56, 54, 4), C.orange, { edge: 'cut', fibre: false, shadow: false }),
    piece(circle(98, 48, 3.5), C.gold, { edge: 'cut', fibre: false, shadow: false }),
    piece(circle(120, 58, 3), C.orange, { edge: 'cut', fibre: false, shadow: false }),
  ]);
}

/** A fluffy baby phoenix, 200 × 200 (feet at y ≈ 186). */
function chickArt(): string {
  const fuzz = '#e39a6e';
  const round: Pt[] = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    round.push([100 + Math.cos(a) * 58, 124 + Math.sin(a) * 54]);
  }
  return svg({ w: 200, h: 200, name: 'b2c4-chick', label: 'a baby phoenix' }, [
    ...[84, 116].map((x) => piece(poly([[x - 4, 168], [x + 4, 168], [x + 4, 182], [x + 12, 188], [x - 12, 188], [x - 4, 182]]), C.orange, { edge: 'cut', fibre: false })),
    // tuft of tiny flame feathers
    piece(poly([[92, 82], [80, 50], [102, 74]]), C.orange, { edge: 'cut' }),
    piece(poly([[96, 78], [102, 40], [110, 76]]), C.gold, { edge: 'cut' }),
    piece(poly([[106, 82], [122, 52], [114, 82]]), C.orange, { edge: 'cut' }),
    piece(ellipse(46, 132, 14, 24, 25), '#d0805a'),
    piece(ellipse(154, 132, 14, 24, -25), '#d0805a'),
    fluff(round, fuzz, 9),
    piece(ellipse(100, 148, 34, 28), C.goldLight, { fibre: false }),
    // soot smudge from the ash
    piece(ellipse(130, 94, 14, 8, -20), C.stone, { edge: 'cut', fibre: false, shadow: false, opacity: 0.7 }),
    ...[82, 118].flatMap((x) => [
      piece(circle(x, 112, 13), C.white, { edge: 'cut', fibre: false }),
      piece(circle(x + 1, 114, 7.5), C.ink, { edge: 'clean', shadow: false }),
      dot(x - 2, 110, 3, C.white),
    ]),
    piece(poly([[91, 126], [109, 126], [100, 141]]), C.gold, { edge: 'cut' }),
    dot(66, 132, 7, C.pink, 0.7),
    dot(134, 132, 7, C.pink, 0.7),
  ]);
}

/** The orrery's spinning rings, 120 × 120. */
function orreryArt(): string {
  const ring = (rr: number): Pt[] => {
    const pts: Pt[] = [];
    for (let i = 0; i < 24; i++) pts.push([60 + Math.cos((i / 24) * Math.PI * 2) * rr, 60 + Math.sin((i / 24) * Math.PI * 2) * rr]);
    return pts;
  };
  const at = (rr: number, deg: number): [number, number] => [60 + Math.cos((deg * Math.PI) / 180) * rr, 60 + Math.sin((deg * Math.PI) / 180) * rr];
  return svg({ w: 120, h: 120, name: 'b2c4-orrery', boil: false }, [
    ink(ring(50), { width: 3, color: SILVER, closed: true, wobble: 0.3 }),
    ink(ring(30), { width: 2.5, color: SILVER_DARK, closed: true, wobble: 0.3 }),
    piece(circle(60, 60, 12), C.gold, { edge: 'cut' }),
    piece(circle(...at(50, 20), 8), C.blue, { edge: 'cut' }),
    piece(circle(...at(50, 160), 6), C.rust, { edge: 'cut' }),
    piece(circle(...at(50, 260), 7), C.goldLight, { edge: 'cut' }),
    piece(circle(...at(30, 300), 5), C.green, { edge: 'cut' }),
  ]);
}

/** A little silver pinwheel, 70 × 70. */
function pinwheelArt(): string {
  const blade = (deg: number, col: string) => {
    const a = (deg * Math.PI) / 180;
    const p = (rr: number, da: number): Pt => [35 + Math.cos(a + da) * rr, 35 + Math.sin(a + da) * rr];
    return piece(poly([[35, 35], p(32, -0.15), p(26, 0.55)]), col, { edge: 'cut' });
  };
  return svg({ w: 70, h: 70, name: 'b2c4-pinwheel', boil: false }, [
    blade(0, SILVER), blade(90, C.goldLight), blade(180, SILVER), blade(270, C.goldLight),
    piece(circle(35, 35, 5), SILVER_DARK, { edge: 'cut', fibre: false }),
  ]);
}

// ------------------------------------------------------------------ helpers

/** Keeps a gadget spinning (not in calm mode). */
function whirl(k: Kit, el: HTMLElement, seconds: number, dir = 1): void {
  if (k.calm) return;
  gsap.to(el, { rotation: 360 * dir, duration: seconds, repeat: -1, ease: stepped(seconds, 'none') });
}

/** A gentle, slow flicker of a paper flame (shape only, never brightness). */
function flicker(k: Kit, el: HTMLElement, i: number): void {
  if (k.calm) return;
  const d = 0.45 + (i % 3) * 0.08;
  gsap.to(el, { scaleY: 1.1, scaleX: 0.92, rotation: i % 2 ? 4 : -4, duration: d, yoyo: true, repeat: -1, ease: stepped(d, 'sine.inOut') });
}

/** Fawkes spreads and beats his wings a few times. */
function flap(k: Kit, fawkes: HTMLElement, beats: number): Promise<void> {
  const l = fawkes.querySelector('[data-part="wingL"]');
  const r = fawkes.querySelector('[data-part="wingR"]');
  const head = fawkes.querySelector('[data-part="head"]');
  if (!l || !r || k.calm) return k.wait(beats * 500);
  gsap.set(l, { svgOrigin: '120 150' });
  gsap.set(r, { svgOrigin: '180 150' });
  if (head) gsap.set(head, { svgOrigin: '150 140' });
  const step = stepped(0.25, 'sine.inOut');
  return new Promise<void>((resolve) => {
    const tl = gsap.timeline({ onComplete: () => resolve() });
    for (let i = 0; i < beats; i++) {
      tl.to(l, { rotation: 34, duration: 0.25, ease: step }).to(r, { rotation: -34, duration: 0.25, ease: step }, '<');
      if (head) tl.to(head, { rotation: i % 2 ? 6 : -6, duration: 0.25, ease: step }, '<');
      tl.to(l, { rotation: 0, duration: 0.25, ease: step }).to(r, { rotation: 0, duration: 0.25, ease: step }, '<');
    }
    if (head) tl.to(head, { rotation: 0, duration: 0.2, ease: step });
  }).then(() => k.wait(0));
}

// -------------------------------------------------------------------- story

/** Where Fawkes and his perch stand. */
const PERCH = { x: 440, y: 200, w: 300 };
/** Where the chick sits on the perch, and its centre. */
const CHICK = { x: 535, y: 360, w: 110 };
const CHICK_C: Pt = [590, 415];

/** The five word pictures, in an arc over the perch (top-left corners). */
const PIC_W = 150;
const WORDS: Array<[string, number, number]> = [
  ['box', 120, 140],
  ['fox', 300, 46],
  ['jam', 515, 0],
  ['van', 730, 46],
  ['zip', 910, 140],
];
const GROW_NOTES = [NOTE.G5, NOTE.A5, NOTE.B5, NOTE.D6, NOTE.G6];

export default defineStory({
  lines: {
    droopy: { who: 'narrator', text: 'You visit Dumbledore’s office. Oh dear… Fawkes looks old and droopy.' },
    watch: { who: 'dumbledore', text: 'Don’t worry. Fawkes is a phoenix. Just watch…' },
    flames: { who: 'narrator', text: 'Fawkes glows gold… and bursts into warm, magic flames!' },
    chick: { who: 'narrator', text: 'Out of the ash pops a tiny, fluffy baby phoenix!' },
    words: { who: 'narrator', text: 'Your magic words will help him grow. Box, fox, jam, van, zip!' },
    thanks: { who: 'fawkes', text: 'I feel brand new! Thank you, {name}!' },
    diary: { who: 'dumbledore', text: 'Splendid! Now Fawkes can help you find the secret diary.' },
  },

  async play(k) {
    k.backdrop(office());
    const orrery = k.add(orreryArt(), { x: 870, y: 155, w: 120, z: 5, still: true });
    const pin = k.add(pinwheelArt(), { x: 1074, y: 180, w: 70, z: 5, still: true });
    whirl(k, orrery, 7);
    whirl(k, pin, 2.4, -1);

    const halo = k.add(haloArt(), { x: 420, y: 210, w: 340, z: 8 });
    k.set(halo, { opacity: 0 });
    const old = k.add(oldFawkes(), { ...PERCH, z: 10 });
    k.set(old, { transformOrigin: '50% 80%' });
    if (!k.calm) gsap.to(old, { rotation: 2, duration: 1.4, yoyo: true, repeat: -1, ease: stepped(1.4, 'sine.inOut') });

    const hero = k.character('hero', { x: 70, y: 345, z: 20 });
    const dumbledore = k.character('dumbledore', { x: 870, y: 335, z: 20 });
    k.set([hero, dumbledore], { opacity: 0 });

    // The gadgets whirr and puff as the curtains open.
    await k.wait(700);
    whirr();
    k.puff(1030, 186, 70, C.white);

    // You arrive; a tired feather drifts off Fawkes.
    k.sfx.whoosh();
    await k.enter(hero, 'left');
    const feather = k.add(featherArt(), { x: 520, y: 410, w: 30, z: 9 });
    droop();
    void k.to(feather, 1.8, { x: -40, y: 200, rotation: -70, ease: 'sine.inOut' }).then(() => k.fade(feather, 0, 0.4));
    await k.say('droopy');

    // Dumbledore steps in.
    k.sfx.whoosh();
    await k.enter(dumbledore, 'right');
    k.puff(1030, 186, 60, C.white);
    await k.say('watch', dumbledore);

    // Fawkes glows… and bursts into soft paper flames.
    void k.fade(halo, 1, 1.2);
    await k.wait(700);
    fireWhoosh();
    const flames = [
      k.add(flameArt('l', C.orange, C.gold), { x: 452, y: 268, w: 132, z: 11 }),
      k.add(flameArt('r', C.orange, C.gold), { x: 596, y: 268, w: 132, z: 11 }),
      k.add(flameArt('c', C.red, C.orange), { x: 490, y: 142, w: 200, z: 12 }),
      k.add(flameArt('sl', C.gold, C.yellow), { x: 498, y: 340, w: 90, z: 13 }),
      k.add(flameArt('sr', C.gold, C.yellow), { x: 592, y: 340, w: 90, z: 13 }),
    ];
    flames.forEach((f) => k.set(f, { opacity: 0, transformOrigin: '50% 100%' }));
    void k.glow(C.orange, 0.3, 1.8);
    void k.fade(old, 0, 0.9);
    await k.all(...flames.map((f, i) => k.wait(i * 130).then(() => k.appear(f, 0.5))));
    flames.forEach((f, i) => flicker(k, f, i));
    void k.shake(hero, 6, 2);
    await k.say('flames');

    // The flames die down to a little pile of ash.
    const ash = k.add(ashArt(), { x: 510, y: 398, w: 160, z: 12 });
    k.set(ash, { opacity: 0 });
    k.fx.poof();
    await k.all(
      ...flames.map((f) => {
        gsap.killTweensOf(f);
        return k.to(f, 0.7, { scale: 0, opacity: 0, ease: 'power2.in' });
      }),
      k.fade(halo, 0, 0.8),
      k.wait(300).then(() => k.fade(ash, 1, 0.4)),
    );
    flames.forEach((f) => k.remove(f));
    k.remove(old);
    await k.wait(600);

    // Something wriggles in the ash… a baby phoenix!
    await k.shake(ash, 4, 2);
    cheep();
    const chick = k.add(chickArt(), { ...CHICK, z: 13 });
    k.set(chick, { transformOrigin: '50% 94%' });
    await k.appear(chick, 0.45);
    k.sparkle(CHICK_C[0], CHICK_C[1] - 20, 10, 110);
    await k.say('chick');

    // Ah… choo! The sneeze blows the ash away.
    sneeze();
    await k.to(chick, 0.35, { scaleY: 1.1, scaleX: 0.94, rotation: -6, ease: 'sine.out' });
    k.puff(CHICK_C[0], CHICK_C[1] + 20, 150, C.stoneLight);
    void k.vanish(ash, 0.3);
    await k.to(chick, 0.2, { scaleY: 1, scaleX: 1, rotation: 0, ease: 'back.out(2)' });
    k.fx.boing();
    await k.all(k.hop(chick, 24), k.hop(hero, 36, 2));

    // Your five words fly in and the chick grows with each one.
    const pics = WORDS.map(([w, x, y]) => {
      const p = k.picture(w, { x, y, w: PIC_W, z: 30 });
      k.set(p, { opacity: 0 });
      return p;
    });
    const popWords = async () => {
      await k.wait(1900);
      for (const [i, p] of pics.entries()) {
        k.fx.pop();
        await k.appear(p, 0.3);
        k.float(p, 6, 1.6 + i * 0.15);
        await k.wait(220);
      }
    };
    await k.all(k.say('words'), popWords());
    let size = 1;
    for (let i = 0; i < pics.length; i++) {
      const [, x, y] = WORDS[i];
      gsap.killTweensOf(pics[i]);
      k.fx.whizz();
      await k.to(pics[i], 0.35, { x: CHICK_C[0] - (x + PIC_W / 2), y: CHICK_C[1] - 30 * size - (y + PIC_W / 2), scale: 0.2, ease: 'power2.in' });
      k.remove(pics[i]);
      bell(GROW_NOTES[i], now(), 0.12, 0.9);
      size += 0.2;
      k.sparkle(CHICK_C[0], CHICK_C[1] - 30 * size, 8, 90);
      await k.to(chick, 0.3, { scale: size, ease: 'back.out(2)' });
      await k.wait(60);
    }

    // Fawkes is back!
    k.fx.twinkle();
    void k.fade(halo, 0.9, 0.8);
    void k.glow(C.goldLight, 0.45, 1.4);
    await k.wait(550);
    k.puff(CHICK_C[0], CHICK_C[1] - 60, 300, C.goldLight);
    k.remove(chick);
    const fawkes = k.character('fawkes', { ...PERCH, z: 12 });
    await k.appear(fawkes, 0.5);
    k.sparkle(590, 300, 18, 240);
    phoenixSong();
    void k.hop(hero, 40, 1);
    await flap(k, fawkes, 4);
    await k.wait(300);

    await k.all(k.say('thanks'), flap(k, fawkes, 3));
    await k.say('diary', dumbledore);

    // A happy ending.
    k.fx.jingle();
    k.confetti(36);
    k.sparkle(590, 300, 14, 200);
    await k.all(k.hop(hero, 50, 2), flap(k, fawkes, 2), k.hop(dumbledore, 20, 1));
    await k.wait(1000);
  },
});
