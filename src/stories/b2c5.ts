/**
 * b2c5 "The Secret Diary": the Chamber of Secrets.
 *
 * Drip… drop… you creep into the Chamber, with its snake pillars and
 * puddles. The Basilisk slithers out wearing sunglasses (so its stare is
 * safe and silly) and a curly wig. Fawkes swoops in singing; the Basilisk
 * chases him round and round a pillar until it has tied itself in a knot,
 * gets dizzy and flops down with a bang (its wig landing on the chess
 * knight). By the quill on the old stone step, the diary is glowing.
 */
import { gsap } from 'gsap';
import { stepped } from '../ui/anim';
import { C, band, bell, circle, curve, defineStory, dot, ellipse, group, ink, noiseBurst, NOTE, now, piece, poly, rect, rng, svg, tone, type Kit, type Node, type Pt } from './kit';

// ------------------------------------------------------------------ sounds

/** One drop of water plinking into a puddle, echoing round the Chamber. */
function drip(): void {
  const t = now();
  const f = 1100 + Math.random() * 300;
  for (let i = 0; i < 4; i++) {
    const p = 0.11 * Math.pow(0.45, i);
    tone(f, t + i * 0.24, { peak: p, attack: 0.003, decay: 0.1, glideTo: f * 1.7, lowpass: 3200 - i * 600 });
  }
  noiseBurst(t, { freq: 900, q: 2, peak: 0.02, attack: 0.01, decay: 0.6 });
}

/** A long body slithering over stone: soft swaying hisses. */
function slitherSound(seconds = 1.6): void {
  const t = now();
  for (let s = 0, i = 0; s < seconds; s += 0.26, i++) {
    noiseBurst(t + s, { freq: i % 2 ? 2400 : 3200, q: 1.4, peak: 0.065, attack: 0.1, decay: 0.2, sweepTo: i % 2 ? 3600 : 1900 });
  }
  tone(70, t, { peak: 0.04, attack: 0.3, decay: seconds, lowpass: 300 });
}

/** A big, round cartoon BANG: a deep thump with a soft rattle (not too loud). */
function bigBang(): void {
  const t = now();
  tone(96, t, { peak: 0.27, attack: 0.005, decay: 0.5, glideTo: 40 });
  noiseBurst(t, { freq: 480, type: 'lowpass', peak: 0.2, attack: 0.005, decay: 0.4 });
  noiseBurst(t + 0.02, { freq: 1800, q: 0.8, peak: 0.07, decay: 0.3, sweepTo: 500 });
  // little stones rattling after
  for (let i = 0; i < 5; i++) noiseBurst(t + 0.25 + i * 0.09, { freq: 1600 + i * 260, q: 3, peak: 0.04, decay: 0.04 });
}

/** A woozy, dizzy slide down. */
function woozy(): void {
  const t = now();
  tone(560, t, { wave: 'triangle', peak: 0.08, attack: 0.1, decay: 1.5, glideTo: 250, vibrato: [4, 40], lowpass: 1600 });
  tone(700, t + 0.2, { wave: 'triangle', peak: 0.04, attack: 0.1, decay: 1.2, glideTo: 330, vibrato: [5, 50], lowpass: 1600 });
}

/** Fawkes's song: a bright, warm bell melody. */
function fawkesSong(): void {
  const t = now();
  const melody: Array<[number, number]> = [
    [NOTE.G5, 0], [NOTE.B5, 0.28], [NOTE.D6, 0.56], [NOTE.C6, 0.84], [NOTE.B5, 1.05], [NOTE.G6, 1.36],
  ];
  melody.forEach(([f, dt], i) => {
    const last = i === melody.length - 1;
    bell(f, t + dt, 0.09, last ? 1.6 : 0.9);
    tone(f, t + dt, { peak: 0.04, attack: 0.06, decay: last ? 1.2 : 0.4, vibrato: [5.5, f * 0.01] });
  });
}

/** A soft snore. */
function snore(): void {
  const t = now();
  noiseBurst(t, { freq: 300, q: 1.2, peak: 0.07, attack: 0.5, decay: 0.5, sweepTo: 180 });
  tone(110, t, { wave: 'triangle', peak: 0.04, attack: 0.5, decay: 0.5, lowpass: 400 });
  noiseBurst(t + 1.1, { freq: 2600, q: 1.2, peak: 0.03, attack: 0.3, decay: 0.4 });
}

/** The diary is found: a warm rising chime with a soft shimmer. */
function diaryChime(): void {
  const t = now();
  tone(NOTE.G3, t, { peak: 0.07, attack: 0.1, decay: 1.8 });
  [NOTE.G5, NOTE.B5, NOTE.D6, NOTE.G6].forEach((n, i) => bell(n, t + i * 0.12, 0.11, 1.4));
  noiseBurst(t + 0.3, { freq: 7000, type: 'highpass', peak: 0.03, attack: 0.3, decay: 1.2 });
}

// --------------------------------------------------------------------- art

const STONE = '#56645c';
const STONE_DARK = '#46534c';
const SCALE = '#3f6b4c';
const SCALE_DARK = '#2f5238';
const BELLY = '#a8b87a';
const WATER = '#4a646b';
const WATER_LIGHT = '#7f9fa6';

/** A carved stone pillar with a snake winding up it. */
function pillarNodes(x: number, top: number, bottom: number, w: number, color: string, carve: string): Node[] {
  const out: Node[] = [
    piece(rect(x, top + 30, w, bottom - top - 50), color, { rough: 0.8 }),
  ];
  // the carved snake, winding round
  for (let y = top + 60; y < bottom - 50; y += 74) {
    out.push(piece(band([[x + 2, y + 34], [x + w * 0.5, y + 14], [x + w - 2, y - 6]], w * 0.24), carve, { edge: 'cut', fibre: false, shadow: false }));
  }
  out.push(piece(ellipse(x + w * 0.62, top + 46, w * 0.2, w * 0.13), carve, { edge: 'cut', fibre: false, shadow: false }));
  out.push(dot(x + w * 0.66, top + 42, 2.5, '#c9d48f', 0.8));
  out.push(piece(rect(x - 10, top, w + 20, 34, 3), STONE_DARK, { rough: 0.8 }));
  out.push(piece(rect(x - 12, bottom - 26, w + 24, 30, 3), STONE_DARK, { rough: 0.8 }));
  return out;
}

/** A puddle with a ripple. */
const puddle = (x: number, y: number, rx: number): Node[] => [
  piece(ellipse(x, y, rx, rx * 0.24), WATER, { edge: 'cut', fibre: false }),
  piece(ellipse(x - rx * 0.25, y - rx * 0.05, rx * 0.45, rx * 0.07), WATER_LIGHT, { edge: 'cut', fibre: false, shadow: false, opacity: 0.6 }),
  ink(ellipse(x + rx * 0.2, y + 2, rx * 0.32, rx * 0.08), { width: 1.5, color: WATER_LIGHT, closed: true, opacity: 0.6 }),
];

/** The round, snake-carved door at the back of the Chamber. */
function door(cx: number, cy: number): Node[] {
  const snakes: Node[] = [];
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 - Math.PI / 2;
    const pts: Pt[] = [];
    for (let s = 0; s <= 4; s++) {
      const r = 34 + s * 24;
      const wob = (s % 2 ? 1 : -1) * 0.14;
      pts.push([cx + Math.cos(a + wob) * r, cy + Math.sin(a + wob) * r]);
    }
    snakes.push(piece(band(pts, 13), '#4b7656', { edge: 'cut', fibre: false, shadow: false }));
    const [hx, hy] = pts[pts.length - 1];
    snakes.push(piece(circle(hx, hy, 10), '#4b7656', { edge: 'cut', fibre: false, shadow: false }));
  }
  return [
    piece(circle(cx, cy, 176), STONE_DARK, { rough: 1.2 }),
    piece(circle(cx, cy, 156), '#3b4842', { edge: 'cut', fibre: false }),
    ...snakes,
    piece(circle(cx, cy, 30), STONE, { edge: 'cut' }),
    piece(circle(cx, cy, 11), '#5f8f6a', { edge: 'cut', fibre: false }),
  ];
}

/** The Chamber of Secrets, as a pop-up paper scene. */
function chamber(): string {
  const r = rng(225);
  const blocks: Node[] = [];
  for (let y = 70; y < 520; y += 58) {
    blocks.push(ink([[-10, y], [1190, y + (r() - 0.5) * 6]], { width: 2, color: '#24302c', opacity: 0.6 }));
    for (let x = ((y / 58) % 2) * 60 + 20; x < 1180; x += 120) blocks.push(ink([[x, y], [x, y + 58]], { width: 2, color: '#24302c', opacity: 0.5 }));
  }
  const flags: Node[] = [];
  for (const [y, n] of [[580, 7], [650, 6]] as const) {
    for (let i = 0; i <= n; i++) flags.push(ink([[(i / n) * 1180 + (r() - 0.5) * 40, y - 30], [(i / n) * 1180 + (r() - 0.5) * 60, y + 40]], { width: 2, color: '#26302c', opacity: 0.45 }));
  }
  const stalactites: Node[] = [];
  for (let x = 10; x < 1180; x += 46 + r() * 40) {
    const hh = 20 + r() * 34;
    stalactites.push(piece(poly([[x - 16, 30], [x + 16, 30], [x + 2, 30 + hh]]), '#1a2320', { edge: 'cut', fibre: false, shadow: false }));
  }
  return svg({ w: 1180, h: 820, name: 'b2c5-chamber', boil: false, className: 'backdrop' }, [
    piece(rect(-20, -20, 1220, 860), '#1d2724', { edge: 'clean', shadow: false }),
    piece(rect(-20, 30, 1220, 520), '#2c3a35', { edge: 'clean', shadow: false }),
    ...blocks,
    // soft light falling from above
    piece(poly([[440, 30], [560, 30], [700, 560], [380, 560]]), '#b8d0b8', { edge: 'clean', shadow: false, opacity: 0.06 }),
    piece(poly([[900, 30], [960, 30], [1030, 560], [860, 560]]), '#b8d0b8', { edge: 'clean', shadow: false, opacity: 0.05 }),
    ...door(590, 250),
    // back row of snake pillars
    ...pillarNodes(90, 40, 540, 74, STONE, '#41594b'),
    ...pillarNodes(300, 60, 530, 64, '#4d5a53', '#3c5245'),
    ...pillarNodes(1030, 40, 540, 74, STONE, '#41594b'),
    // ceiling and drips
    piece(rect(-20, -20, 1220, 52), '#151c1a', { rough: 1.3 }),
    ...stalactites,
    // floor
    piece(curve([[-40, 860], [-40, 540], [300, 528], [700, 536], [1220, 526], [1220, 860]], 2), '#38453f', { rough: 1.2 }),
    ...flags,
    piece(curve([[-40, 860], [-40, 650], [400, 640], [800, 648], [1220, 638], [1220, 860]], 2), '#323e39', { rough: 1, shadow: false }),
    // the old stone step where the diary lies
    piece(rect(462, 486, 240, 44, 4), STONE_DARK, { rough: 0.9 }),
    piece(rect(470, 482, 224, 12, 3), STONE, { edge: 'cut', fibre: false }),
    // puddles
    ...puddle(345, 642, 70),
    ...puddle(150, 735, 90),
    ...puddle(760, 710, 110),
    ...puddle(1060, 660, 80),
    ...puddle(560, 600, 46),
  ]);
}

/** The foreground pillar the Basilisk gets tangled round, 110 × 540. */
function pillarArt(): string {
  return svg({ w: 110, h: 540, name: 'b2c5-pillar', boil: false }, pillarNodes(12, 0, 540, 86, '#62716a', '#44604f'));
}

/** The Basilisk's head (sunglasses, curly wig, tongue), facing right, around (650, 110). */
function headNodes(): Node[] {
  const curls: Pt[] = [[580, 98], [588, 72], [608, 52], [636, 40], [666, 38], [694, 46], [716, 64]];
  return [
    piece(ellipse(648, 114, 80, 58), SCALE),
    piece(ellipse(712, 130, 44, 34), SCALE),
    piece(curve([[596, 150], [650, 168], [740, 156], [748, 140], [700, 176], [620, 178]], 2), BELLY, { fibre: false }),
    ...[[612, 150], [660, 160], [700, 160]].map(([x, y]) => piece(ellipse(x, y, 10, 5), SCALE_DARK, { edge: 'cut', fibre: false, shadow: false })),
    dot(744, 120, 3.5, C.ink),
    dot(734, 116, 3, C.ink),
    ink([[684, 150], [712, 160], [740, 148]], { width: 3.5, color: SCALE_DARK }),
    // cool sunglasses
    ink([[612, 98], [578, 92]], { width: 5, color: C.ink }),
    piece(rect(606, 86, 54, 36, 13), C.ink, { edge: 'cut', fibre: false }),
    piece(rect(672, 90, 48, 32, 12), C.ink, { edge: 'cut', fibre: false }),
    ink([[660, 100], [672, 102]], { width: 5, color: C.ink }),
    ink([[618, 96], [630, 92]], { width: 3, color: '#8a93a6' }),
    ink([[682, 98], [692, 95]], { width: 3, color: '#8a93a6' }),
    // the curly wig
    group({ part: 'wig' }, [
      ...curls.map(([x, y]) => piece(circle(x, y, 21), C.yellow, { rough: 1.2 })),
      ...[[610, 74], [638, 62], [666, 60], [692, 68]].map(([x, y]) => piece(circle(x, y, 16), C.goldLight, { rough: 1.2 })),
    ]),
    // the flicking tongue
    group({ part: 'tongue' }, [ink([[750, 142], [774, 144]], { width: 3.5, color: C.red }), ink([[774, 144], [786, 136]], { width: 3, color: C.red }), ink([[774, 144], [786, 152]], { width: 3, color: C.red })]),
  ];
}

/** One frame of the long wavy body (tail at the left, neck at the right). */
function bodyFrame(part: string, ys: number[]): Node {
  const xs = [30, 130, 230, 330, 430, 530, 600];
  const pts: Pt[] = xs.map((x, i) => [x, ys[i]]);
  const spine = pts.slice(1);
  const spots: Node[] = [];
  for (let i = 1; i < pts.length - 1; i++) {
    const [x, y] = pts[i];
    spots.push(piece(ellipse(x + 30, (y + pts[i + 1][1]) / 2 - 12, 13, 7), SCALE_DARK, { edge: 'cut', fibre: false, shadow: false }));
  }
  return group({ part }, [
    piece(band([[8, ys[0] + 10], pts[0], [130, ys[1]]], 30), SCALE),
    piece(band(spine, 60), SCALE),
    piece(band(spine.map(([x, y]) => [x, y + 20] as Pt), 16), BELLY, { edge: 'cut', fibre: false, shadow: false }),
    ...spots,
  ]);
}

/** The whole Basilisk, 800 × 240, facing right. Two body frames for slithering. */
function basiliskArt(): string {
  return svg({ w: 800, h: 240, name: 'b2c5-basilisk', label: 'the Basilisk, in sunglasses and a curly wig' }, [
    bodyFrame('bodyA', [206, 188, 210, 178, 206, 176, 150]),
    bodyFrame('bodyB', [190, 210, 182, 210, 180, 204, 150]),
    group({ part: 'head' }, headNodes()),
  ]);
}

/** Points round a tilted ring around the pillar, from angle a0 to a1 (radians). */
function ringArc(cx: number, cy: number, a0: number, a1: number): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i <= 10; i++) {
    const a = a0 + ((a1 - a0) * i) / 10;
    pts.push([cx + Math.cos(a) * 118, cy + Math.sin(a) * 34 - Math.cos(a) * 16]);
  }
  return pts;
}

const RINGS = [200, 282, 364];

/** The back halves of the coils (they go behind the pillar), 420 × 560. */
function coilsBackArt(): string {
  return svg({ w: 420, h: 560, name: 'b2c5-coils-back' }, [
    // the tail dangling down on the left
    piece(band([[96, 380], [74, 420], [90, 450], [70, 480]], 30), SCALE),
    ...RINGS.map((y) => piece(band(ringArc(210, y, Math.PI, Math.PI * 2), 50), '#355c41')),
  ]);
}

/** The front halves of the coils, the dizzy head and the wig, 420 × 560. */
function coilsFrontArt(): string {
  return svg({ w: 420, h: 560, name: 'b2c5-coils-front', label: 'the Basilisk, tied in a knot' }, [
    ...RINGS.map((y) => piece(band(ringArc(210, y, 0, Math.PI), 50), SCALE)),
    ...RINGS.map((y) => piece(band(ringArc(210, y + 16, 0.5, Math.PI - 0.5), 12), BELLY, { edge: 'cut', fibre: false, shadow: false })),
    // neck up from the top ring to the head
    piece(band([[328, 196], [340, 160], [322, 128]], 46), SCALE),
    group({ part: 'head' }, [group({ transform: 'translate(318 104) rotate(-12) scale(0.66) translate(-650 -112)' }, headNodes())]),
  ]);
}

/** Fawkes in flight, 280 × 220, facing right (wings can flap). */
function flyingFawkes(): string {
  return svg({ w: 280, h: 220, name: 'b2c5-fawkes', label: 'Fawkes the phoenix, flying' }, [
    ...[[C.gold, 0], [C.orange, 18], [C.gold, 34]].map(([col, dy]) =>
      piece(curve([[120, 118], [70, 140 + (dy as number) * 0.5], [20, 168 + (dy as number)], [8, 182 + (dy as number)], [40, 170 + (dy as number)], [110, 136]], 2), col as string),
    ),
    group({ part: 'wingF' }, [piece(curve([[130, 104], [118, 40], [80, 8], [96, 50], [70, 44], [104, 108]], 2), '#6e2622')]),
    piece(ellipse(152, 116, 60, 34, -12), C.red),
    piece(ellipse(176, 126, 30, 20, -12), C.orange, { fibre: false }),
    group({ part: 'wingN' }, [
      piece(curve([[140, 108], [150, 30], [196, 0], [184, 40], [214, 30], [176, 112]], 2), C.redDark),
      piece(poly([[184, 12], [198, 2], [192, 22]]), C.gold, { edge: 'cut', fibre: false }),
    ]),
    piece(poly([[198, 72], [190, 40], [208, 66], [214, 34], [222, 66]]), C.gold, { edge: 'cut' }),
    piece(circle(212, 90, 28), C.red),
    piece(circle(222, 84, 8), C.gold, { edge: 'cut', fibre: false }),
    piece(circle(224, 84, 4.5), C.ink, { edge: 'clean', shadow: false }),
    piece(poly([[234, 92], [262, 102], [234, 108]]), C.gold, { edge: 'cut' }),
  ]);
}

/** A ring of little dizzy stars, 140 × 140 (squashed into an orbit on stage). */
function dizzyStars(): string {
  const star = (cx: number, cy: number, s: number): Node => {
    const pts: Pt[] = [];
    for (let i = 0; i < 10; i++) {
      const a = (i * Math.PI) / 5 - Math.PI / 2;
      const rr = i % 2 ? s * 0.45 : s;
      pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
    }
    return piece(poly(pts), C.goldLight, { edge: 'cut' });
  };
  return svg({ w: 140, h: 140, name: 'b2c5-dizzy' }, [0, 1, 2, 3].map((i) => star(70 + Math.cos((i * Math.PI) / 2) * 52, 70 + Math.sin((i * Math.PI) / 2) * 52, 15)));
}

/** A falling drop of water, 20 × 30. */
function dropArt(): string {
  return svg({ w: 20, h: 30, name: 'b2c5-drop', boil: false }, [piece(curve([[10, 1], [17, 18], [10, 29], [3, 18]], 2), WATER_LIGHT, { edge: 'cut', fibre: false })]);
}

/** A sleepy "z", 40 × 40. */
function zzz(): string {
  return svg({ w: 40, h: 40, name: 'b2c5-z', boil: false }, [ink([[8, 8], [32, 8], [8, 32], [32, 32]], { width: 5, color: C.cream, wobble: 0.3 })]);
}

/** A soft golden halo, 300 × 300. */
function haloArt(): string {
  return svg({ w: 300, h: 300, name: 'b2c5-halo', boil: false }, [
    piece(circle(150, 150, 146), C.goldLight, { edge: 'cut', fibre: false, shadow: false, opacity: 0.2 }),
    piece(circle(150, 150, 108), C.candle, { edge: 'cut', fibre: false, shadow: false, opacity: 0.26 }),
    piece(circle(150, 150, 70), C.candle, { edge: 'cut', fibre: false, shadow: false, opacity: 0.32 }),
  ]);
}

// ------------------------------------------------------------------ helpers

/** Swaps the body frames back and forth (a stop-motion slither) until stopped. */
function wriggle(el: HTMLElement): () => void {
  const a = el.querySelector<SVGElement>('[data-part="bodyA"]');
  const b = el.querySelector<SVGElement>('[data-part="bodyB"]');
  let on = false;
  const id = setInterval(() => {
    if (!el.isConnected) return clearInterval(id);
    on = !on;
    if (a) a.style.visibility = on ? 'hidden' : 'visible';
    if (b) b.style.visibility = on ? 'visible' : 'hidden';
  }, 140);
  return () => clearInterval(id);
}

/** Slithers the Basilisk by dx over some seconds, with sound. */
async function slither(k: Kit, el: HTMLElement, dx: number, seconds: number, ease = 'none'): Promise<void> {
  const stop = wriggle(el);
  slitherSound(seconds);
  await k.to(el, seconds, { x: `+=${dx}`, ease });
  stop();
}

/** A quick tongue flick. */
async function flick(k: Kit, el: HTMLElement): Promise<void> {
  const t = el.querySelector('[data-part="tongue"]');
  if (!t) return;
  k.set(t, { svgOrigin: '750 142' });
  noiseBurst(now(), { freq: 4200, q: 2, peak: 0.04, attack: 0.02, decay: 0.12 });
  for (let i = 0; i < 1; i++) {
    await k.to(t, 0.1, { scaleX: 0.2, ease: 'none' });
    await k.to(t, 0.1, { scaleX: 1, ease: 'none' });
  }
}

/** Fawkes beats his wings a few times. */
function flap(k: Kit, el: HTMLElement, beats: number): Promise<void> {
  const n = el.querySelector('[data-part="wingN"]');
  const f = el.querySelector('[data-part="wingF"]');
  if (!n || !f || k.calm) return k.wait(beats * 400);
  gsap.set(n, { svgOrigin: '160 108' });
  gsap.set(f, { svgOrigin: '118 106' });
  const step = stepped(0.2, 'sine.inOut');
  return new Promise<void>((resolve) => {
    const tl = gsap.timeline({ onComplete: () => resolve() });
    for (let i = 0; i < beats; i++) {
      tl.to(n, { scaleY: -0.5, duration: 0.2, ease: step }).to(f, { scaleY: -0.4, duration: 0.2, ease: step }, '<');
      tl.to(n, { scaleY: 1, duration: 0.2, ease: step }).to(f, { scaleY: 1, duration: 0.2, ease: step }, '<');
    }
  }).then(() => k.wait(0));
}

/** One drop falls from the ceiling and plinks into the puddle. */
async function dropFalls(k: Kit, x: number, fromY: number, toY: number): Promise<void> {
  const d = k.add(dropArt(), { x: x - 8, y: fromY, w: 16, z: 6 });
  await k.to(d, 0.55, { y: toY - fromY, ease: 'power2.in' });
  drip();
  k.remove(d);
}

// -------------------------------------------------------------------- story

/** Where the Basilisk rests when it first slithers in. */
const SNAKE = { x: 340, y: 412, w: 800 };
/** The foreground pillar, and the coils that tie round it. */
const PILLAR = { x: 760, y: 110, w: 110 };
const COILS = { x: PILLAR.x - 155, y: PILLAR.y - 20, w: 420 };
/** Fawkes's starting spot (he swoops in from the top left). */
const BIRD = { x: 470, y: 70, w: 230 };

export default defineStory({
  lines: {
    creep: { who: 'narrator', text: 'Drip… drop… You tiptoe into the Chamber of Secrets. Who lives down here?' },
    hello: { who: 'basilisk', text: 'Hello! Don’t worry, my sunglasses keep my stare safe. Do you like my wig?' },
    bird: { who: 'basilisk', text: 'Oi! A bird! Come back here, you noisy feather duster!' },
    knot: { who: 'narrator', text: 'Round and round the pillar… oh no! He’s tied himself in a knot!' },
    dizzy: { who: 'basilisk', text: 'Ooh… everything’s spinning… I feel all wibbly-wobbly…' },
    found: { who: 'narrator', text: 'Bang! Down he flops. And look, by the quill… the diary is glowing!' },
    cheer: { who: 'fawkes', text: 'Hooray, {name}! You found the secret diary! You were so brave!' },
  },

  async play(k) {
    k.backdrop(chamber());

    // Props that are there from the start.
    k.music('sneaky');
    k.ambient('dust', { count: 10, area: [380, 40, 320, 500], z: 30 });
    k.dim(0.3, '#0b1a14');
    k.light(560, 180, 260, { color: '#cfe3cf', strength: 0.25 });
    const dl = k.light(545, 430, 220, { color: C.goldLight, strength: 0.5 });
    k.set(dl, { opacity: 0 });
    const halo = k.add(haloArt(), { x: 435, y: 330, w: 220, z: 7 });
    k.set(halo, { opacity: 0 });
    const diary = k.horcrux('diary', { x: 495, y: 400, w: 100, z: 8 });
    const quill = k.picture('quill', { x: 588, y: 416, w: 80, z: 8 });
    k.set(quill, { transformOrigin: '30% 90%' });
    const jug = k.picture('jug', { x: 292, y: 528, w: 106, z: 12 });
    const chess = k.picture('chess', { x: 1006, y: 468, w: 150, z: 22 });
    k.add(pillarArt(), { ...PILLAR, z: 30, still: true });

    const hero = k.character('hero', { x: 20, y: 362, w: 250, z: 40 });
    k.set(hero, { opacity: 0 });
    const snake = k.add(basiliskArt(), { ...SNAKE, z: 20, flip: true });
    k.set(snake, { opacity: 0 });
    const fawkes = k.add(flyingFawkes(), { ...BIRD, z: 45 });
    k.set(fawkes, { opacity: 0 });

    // Drip… drop…
    let dripping = true;
    void (async () => {
      const spots: Array<[number, number, number]> = [[345, 40, 560], [760, 40, 690], [150, 40, 720]];
      for (let i = 0; dripping; i++) {
        const [x, y0, y1] = spots[i % spots.length];
        await dropFalls(k, x, y0, y1);
        await k.wait(1300 + (i % 2) * 700);
      }
    })();
    await k.wait(400);

    // You creep in.
    k.fx.sneak();
    await k.all(k.enter(hero, 'left', 0.9), k.say('creep'));

    // The Basilisk slithers out… in sunglasses!
    k.set(snake, { opacity: 1, x: 900 });
    await slither(k, snake, -900, 1.6, 'power1.out');
    await flick(k, snake);
    void k.shake(hero, 6, 2);
    void k.camera({ zoom: 1.4, x: 440, y: 470 }, 1.2);
    await k.all(k.say('hello', snake), flick(k, snake).then(() => k.wait(900)).then(() => flick(k, snake)));
    k.fx.boing();
    await k.hop(snake, 20, 1);

    // Fawkes swoops in, singing.
    dripping = false;
    k.music('adventure');
    void k.camera({}, 0.8);
    k.set(fawkes, { opacity: 1, x: -760, y: -200, rotation: 12 });
    k.fx.whizz();
    await k.to(fawkes, 1.1, { x: 0, y: 0, rotation: 0, ease: 'power2.out' });
    fawkesSong();
    const head = snake.querySelector('[data-part="head"]');
    if (head) k.set(head, { svgOrigin: '600 150' });
    await k.all(flap(k, fawkes, 4), head ? k.to(head, 0.4, { rotation: -14 }) : k.wait(0), k.say('bird', snake), flick(k, snake));

    // The chase: round and round the pillar!
    // 1. Away to the left, behind you.
    k.face(fawkes, true);
    k.fx.whizz();
    await k.all(
      k.to(fawkes, 0.9, { x: -900, y: 60, ease: 'power1.in' }),
      k.wait(250).then(() => slither(k, snake, -1240, 1.1)),
      k.wait(500).then(() => k.hop(hero, 40, 1)),
    );
    if (head) k.set(head, { rotation: 0 });
    // 2. Back to the right, behind the pillar.
    k.face(fawkes, false);
    k.face(snake, false);
    snake.style.zIndex = '25';
    k.fx.whizz();
    await k.all(
      k.to(fawkes, 1.1, { x: 900, y: -20, ease: 'none' }),
      k.wait(150).then(() => slither(k, snake, 2200, 1.1)),
    );
    // 3. And left again, in front of it… and round once more.
    k.face(fawkes, true);
    k.face(snake, true);
    snake.style.zIndex = '35';
    const chase = async () => {
      k.fx.whizz();
      await k.all(
        k.to(fawkes, 1.1, { x: -900, y: 40, ease: 'none' }),
        k.wait(150).then(() => slither(k, snake, -2200, 1.1)),
      );
      k.face(fawkes, false);
      k.face(snake, false);
      snake.style.zIndex = '25';
      k.fx.whizz();
      await k.all(
        k.to(fawkes, 1.0, { x: -40, y: -20, ease: 'power1.out' }),
        k.wait(150).then(() => slither(k, snake, 1240, 1.1, 'power1.out')),
      );
    };
    const back = k.add(coilsBackArt(), { ...COILS, z: 28 });
    const front = k.add(coilsFrontArt(), { ...COILS, z: 32 });
    k.set([back, front], { opacity: 0 });
    const tie = async () => {
      await chase();
      // …tangle! A puff, and he's in a knot.
      k.fx.poof();
      k.puff(PILLAR.x + 55, 300, 280, C.stoneLight);
      k.puff(PILLAR.x + 55, 420, 240, C.stoneLight);
      k.remove(snake);
      k.set([back, front], { opacity: 1 });
      k.fx.boing();
      await k.pop(front, 1.06);
      void flap(k, fawkes, 3);
    };
    await k.all(k.say('knot'), tie());
    void k.camera({ zoom: 1.3, x: 820, y: 300 }, 1.0);

    // Dizzy…
    const stars = k.add(dizzyStars(), { x: COILS.x + 248, y: COILS.y + 4, w: 140, h: 140, z: 34 });
    const orbit = stars.querySelector<HTMLElement>(':scope > .story-flip');
    if (orbit) orbit.style.transform = 'scaleY(0.32)';
    const starSvg = stars.querySelector('svg');
    if (!k.calm && starSvg) gsap.to(starSvg, { rotation: 360, duration: 1.8, repeat: -1, ease: stepped(1.8, 'none') });
    woozy();
    const sway = async () => {
      k.set([back, front], { transformOrigin: '50% 60%' });
      for (let i = 0; i < 1; i++) {
        await k.all(k.to(back, 0.5, { rotation: -3, ease: 'sine.inOut' }), k.to(front, 0.5, { rotation: -3, ease: 'sine.inOut' }));
        await k.all(k.to(back, 0.5, { rotation: 3, ease: 'sine.inOut' }), k.to(front, 0.5, { rotation: 3, ease: 'sine.inOut' }));
      }
      await k.all(k.to(back, 0.3, { rotation: 0 }), k.to(front, 0.3, { rotation: 0 }));
    };
    await k.all(k.say('dizzy', front), sway());

    // …and FLOP! Bang!
    void k.vanish(stars, 0.3);
    const fhead = front.querySelector('[data-part="head"]');
    if (fhead) k.set(fhead, { svgOrigin: '330 170' });
    k.fx.whizz();
    await k.all(
      k.to(back, 0.45, { y: 130, ease: 'power2.in' }),
      k.to(front, 0.45, { y: 130, ease: 'power2.in' }),
      fhead ? k.to(fhead, 0.45, { rotation: 38, ease: 'power2.in' }) : k.wait(0),
    );
    bigBang();
    const bang = k.picture('bang', { x: 700, y: 400, w: 240, z: 50 });
    void k.appear(bang, 0.25);
    void k.quake(6);
    void k.hop(jug, 22, 1);
    void k.shake(hero, 6, 2);
    // The wig flies off… and lands on the chess knight!
    const wigPart = front.querySelector<SVGElement>('[data-part="wig"]');
    if (wigPart) wigPart.style.visibility = 'hidden';
    const wig = k.picture('wig', { x: 920, y: 260, w: 120, z: 46, crop: '50 40 300 200' });
    k.fx.boing();
    await k.to(wig, 0.45, { x: 45, y: -100, rotation: 160, ease: 'power1.out' });
    await k.to(wig, 0.5, { x: 103, y: 180, rotation: 360, ease: 'power1.in' });
    k.fx.pop();
    void k.pop(chess, 1.08);
    void k.vanish(bang, 0.4);
    if (!k.calm) {
      k.set([back, front], { transformOrigin: '50% 100%' });
      gsap.to([back, front], { scaleY: 1.03, duration: 1.2, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    }

    // Zzz… and the diary glows.
    snore();
    const z = k.add(zzz(), { x: 960, y: 370, w: 34, z: 47 });
    void k.to(z, 2.2, { y: -90, x: 30, opacity: 0, ease: 'sine.out' });
    diaryChime();
    k.music('triumph');
    void k.fade(halo, 1, 0.8);
    void k.fade(dl, 1, 0.8);
    void k.glow(C.goldLight, 0.3, 1.4);
    k.sparkle(545, 440, 14, 140);
    const writing = async () => {
      for (let i = 0; i < 3; i++) {
        await k.to(quill, 0.18, { rotation: -10 });
        await k.to(quill, 0.18, { rotation: 8 });
      }
      await k.to(quill, 0.2, { rotation: 0 });
    };
    void k.camera({}, 1.3);
    k.fx.patter(4, 0.3);
    await k.all(
      k.say('found'),
      k.walk(hero, 170, 1.4, 4),
      k.wait(500).then(() => k.to(diary, 0.9, { y: -60, scale: 1.35, ease: 'sine.out' })).then(() => { k.sfx.gem(); k.float(diary, 6, 2.4); }),
      k.wait(800).then(writing),
      k.wait(400).then(() => k.to(halo, 0.9, { y: -60, ease: 'sine.out' })),
    );

    // Fawkes flies down to cheer.
    k.face(fawkes, true);
    k.fx.whizz();
    await k.to(fawkes, 0.9, { x: -200, y: 60, ease: 'power2.out' });
    fawkesSong();
    k.fx.jingle();
    k.confetti(36);
    k.sparkle(545, 380, 14, 180);
    await k.all(k.say('cheer', fawkes), flap(k, fawkes, 4), k.hop(hero, 50, 2));
    snore();
    await k.wait(1500);
  },
});
