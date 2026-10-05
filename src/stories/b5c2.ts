/**
 * Book 5, chapter 2: Luna Lovegood.
 *
 * A dreamy moonlit meadow. Luna lends the hero her rainbow spectrespecs and
 * suddenly the invisible creatures appear: floaty nargles, buzzy wrackspurts
 * and a shy crumple-horned snorkack in a bush. The cheeky nargles pinch a
 * crown and some coins, so Luna's lion hat tries to roar … but it squeaks!
 * A drip of oil fixes it, the roar sends the nargles packing, the crown lands
 * on the hero's head, and Luna dances with an owl while the cow jumps over
 * the moon.
 */
import { gsap } from 'gsap';
import { bell, C, circle, curve, defineStory, dot, ellipse, ink, noiseBurst, NOTE, now, piece, poly, rect, rng, svg, tone, type Kit, type Node, type Pt } from './kit';

// ------------------------------------------------------------------ sounds

/** One wind-chime tube: a bell with the slightly odd overtones of a metal tube. */
function chime(f: number, t: number, peak = 0.06): void {
  tone(f, t, { peak, attack: 0.004, decay: 1.8 });
  tone(f * 2.76, t, { peak: peak * 0.3, attack: 0.003, decay: 0.9 });
  tone(f * 5.4, t, { peak: peak * 0.1, attack: 0.002, decay: 0.4 });
}

/** A dreamy wind-chime tune, drifting on a soft breeze. */
function chimes(): void {
  const t = now();
  noiseBurst(t, { freq: 600, q: 3, peak: 0.05, attack: 0.8, decay: 1.6, sweepTo: 1000 });
  const notes: Array<[number, number]> = [
    [NOTE.E6, 0], [NOTE.G6, 0.24], [NOTE.D6, 0.42], [NOTE.C6, 0.66],
    [NOTE.A5, 0.86], [NOTE.D6, 1.1], [NOTE.E6, 1.38], [NOTE.G5, 1.62],
  ];
  for (const [f, dt] of notes) chime(f, t + dt);
}

/** Wrackspurts buzzing: soft, wobbly little drones darting about. */
function buzz(seconds = 1.4): void {
  const t = now();
  for (let s = 0; s < seconds; s += 0.18) {
    const f = 230 + Math.random() * 160;
    tone(f, t + s, { wave: 'sawtooth', peak: 0.03, attack: 0.04, decay: 0.2, glideTo: f * (0.8 + Math.random() * 0.5), vibrato: [32, 22], lowpass: 1300 });
  }
}

/** The nargles giggling: a few high, cheeky "tee-hee"s. */
function giggle(): void {
  const t = now();
  for (const [f, d] of [[1050, 0], [1250, 0.07], [900, 0.16]] as const) {
    for (let i = 0; i < 4; i++) {
      tone(f - i * 60, t + d + i * 0.11, { wave: 'triangle', peak: 0.035, attack: 0.01, decay: 0.07, glideTo: (f - i * 60) * 1.15, lowpass: 3000 });
    }
  }
}

/** The lion hat trying to roar with a rusty hinge: squeak-squeak. */
function squeak(): void {
  const t = now();
  tone(900, t, { wave: 'triangle', peak: 0.07, attack: 0.03, decay: 0.28, glideTo: 1500, vibrato: [16, 60], lowpass: 3500 });
  tone(1400, t + 0.34, { wave: 'triangle', peak: 0.06, attack: 0.03, decay: 0.3, glideTo: 850, vibrato: [16, 60], lowpass: 3500 });
}

/** The lion hat's big, warm, friendly roar (swells in, never sudden). */
function roar(): void {
  const t = now();
  tone(150, t, { wave: 'sawtooth', peak: 0.15, attack: 0.15, decay: 1.1, glideTo: 92, vibrato: [9, 12], lowpass: 700 });
  tone(225, t, { wave: 'sawtooth', peak: 0.06, attack: 0.18, decay: 0.9, glideTo: 140, vibrato: [11, 16], lowpass: 900 });
  noiseBurst(t, { freq: 500, type: 'lowpass', peak: 0.12, attack: 0.12, decay: 1.0, sweepTo: 220 });
}

/** A drip of oil: plip. */
function plip(): void {
  const t = now();
  tone(700, t, { peak: 0.1, attack: 0.005, decay: 0.09, glideTo: 1500 });
}

/** Coins landing in the grass. */
function clink(): void {
  const t = now();
  [0, 0.09, 0.2].forEach((d, i) => bell(2400 + i * 330, t + d, 0.045, 0.3));
}

/** A cow's long, gentle moo. */
function moo(): void {
  const t = now();
  tone(140, t, { wave: 'sawtooth', peak: 0.1, attack: 0.18, decay: 0.85, glideTo: 112, vibrato: [5, 3], lowpass: 650 });
  tone(280, t, { wave: 'triangle', peak: 0.03, attack: 0.2, decay: 0.7, glideTo: 224, lowpass: 900 });
}

/** An owl's soft hoo-hoo. */
function hoot(): void {
  const t = now();
  tone(420, t, { peak: 0.1, attack: 0.04, decay: 0.22, glideTo: 380 });
  tone(420, t + 0.36, { peak: 0.1, attack: 0.05, decay: 0.5, glideTo: 360, vibrato: [6, 6] });
}

// --------------------------------------------------------------------- art

function starPts(cx: number, cy: number, R: number, r: number, n = 5): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i < n * 2; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / n;
    const rr = i % 2 ? r : R;
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return pts;
}

/** A fluffy ring outline: alternating long and short spikes. */
function fluffy(cx: number, cy: number, R: number, r: number, n: number, sy = 1): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2;
    const rr = i % 2 ? r : R;
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * sy]);
  }
  return pts;
}

function hills(y: number, amp: number, color: string, seed: number, step = 160): Node {
  const r = rng(seed);
  const pts: Pt[] = [[-40, 900]];
  for (let x = -40; x < 1220 + step; x += step) pts.push([x, y - r() * amp]);
  pts.push([1220 + step, 900]);
  return piece(curve(pts, 3), color, { rough: 1.3 });
}

/** The moonlit meadow, 1180 × 820. */
function meadow(): string {
  const r = rng(5202);
  const stars: Node[] = [];
  for (let i = 0; i < 42; i++) {
    const x = r() * 1180;
    const y = r() * 430;
    if (Math.hypot(x - 700, y - 190) < 110) continue;
    stars.push(piece(poly(starPts(x, y, 3 + r() * 4, 1.4 + r(), 4)), r() > 0.75 ? C.goldLight : C.cream, { edge: 'cut', fibre: false, shadow: false, opacity: 0.45 + r() * 0.45 }));
  }
  const fireflies: Node[] = [];
  for (let i = 0; i < 16; i++) fireflies.push(dot(260 + r() * 880, 300 + r() * 300, 2.5 + r() * 2, C.goldLight, 0.5 + r() * 0.3));
  const flowers: Node[] = [];
  const petals = [C.cream, '#d9c3e8', C.pink, '#f3e3a8'];
  for (let i = 0; i < 26; i++) {
    const x = 20 + r() * 1140;
    const y = 632 + r() * 50;
    const s = 6 + r() * 4;
    flowers.push(piece(circle(x, y, s), petals[i % petals.length], { edge: 'cut', fibre: false }));
    flowers.push(dot(x, y, s * 0.38, C.gold));
  }
  const grass: Node[] = [];
  for (let x = -10; x < 1200; x += 34 + r() * 30) {
    const y = 640 + r() * 12;
    const hgt = 22 + r() * 22;
    grass.push(piece(poly([[x, y], [x + 5, y - hgt], [x + 10, y - 4], [x + 15, y - hgt * 0.8], [x + 22, y]]), r() > 0.5 ? '#3d6650' : C.greenDark, { edge: 'cut', fibre: false }));
  }
  const tree: Node[] = [
    piece(curve([[30, 830], [44, 600], [40, 380], [60, 220], [96, 100], [140, 96], [104, 230], [96, 420], [104, 620], [120, 830]], 2), '#3b2d2b', { rough: 1.2 }),
    piece(curve([[100, 150], [210, 112], [350, 104], [352, 120], [210, 132], [108, 176]], 2), '#3b2d2b'),
    piece(curve([[230, 120], [262, 84], [276, 88], [246, 128]], 1), '#3b2d2b'),
    piece(circle(20, 40, 100), '#22382f'),
    piece(circle(140, -10, 90), '#26402f'),
    piece(circle(-20, 170, 70), '#22382f'),
    piece(circle(250, -40, 70), '#22382f'),
    piece(circle(70, 70, 50), '#2d4a38', { fibre: false }),
  ];
  return svg({ w: 1180, h: 820, name: 'b5c2-meadow', boil: false, className: 'backdrop' }, [
    piece(rect(-20, -20, 1220, 860), '#232849', { edge: 'clean', shadow: false }),
    piece(ellipse(600, 520, 800, 300), '#33335f', { edge: 'cut', fibre: false, shadow: false, opacity: 0.8 }),
    ...stars,
    // the moon and its soft halo
    piece(circle(700, 190, 130), C.candle, { edge: 'cut', fibre: false, shadow: false, opacity: 0.08 }),
    piece(circle(700, 190, 96), C.candle, { edge: 'cut', fibre: false, shadow: false, opacity: 0.1 }),
    piece(circle(700, 190, 64), C.cream, { rough: 0.8 }),
    piece(circle(680, 172, 12), C.sand, { edge: 'cut', fibre: false, shadow: false, opacity: 0.55 }),
    piece(circle(722, 204, 9), C.sand, { edge: 'cut', fibre: false, shadow: false, opacity: 0.5 }),
    piece(circle(694, 220, 6), C.sand, { edge: 'cut', fibre: false, shadow: false, opacity: 0.5 }),
    // wispy clouds
    piece(ellipse(470, 110, 120, 15), '#4a4678', { fibre: false, opacity: 0.75 }),
    piece(ellipse(960, 250, 140, 17), '#4a4678', { fibre: false, opacity: 0.75 }),
    piece(ellipse(1040, 90, 90, 12), '#4a4678', { fibre: false, opacity: 0.6 }),
    // hills: far, middle, and the meadow in front
    hills(495, 50, '#2f3a62', 11),
    hills(560, 34, '#30524a', 17, 220),
    ...fireflies,
    hills(650, 16, '#2a4638', 23, 260),
    ...grass,
    ...tree,
    ...flowers,
    // a few pale moonbeam paths on the ground
    piece(ellipse(620, 740, 420, 40), '#335244', { edge: 'cut', fibre: false, shadow: false, opacity: 0.7 }),
  ]);
}

/** Wind chimes hanging from the tree, 140 × 230. Sways from the top. */
function windChimes(): string {
  const tubes: Array<[number, number, string]> = [
    [30, 90, '#cfd6e6'],
    [48, 120, C.goldLight],
    [66, 140, '#c9b6e0'],
    [84, 110, '#b8dcd8'],
    [102, 80, '#e8c7cf'],
  ];
  return svg({ w: 140, h: 230, name: 'b5c2-chimes', label: 'wind chimes' }, [
    ink([[70, 0], [70, 26]], { width: 2.5, color: C.cream }),
    ...tubes.map(([x]) => ink([[x + 5, 32], [x + 5, 48]], { width: 1.5, color: C.cream })),
    ...tubes.map(([x, len, c]) => piece(rect(x, 48, 10, len, 4), c, { edge: 'cut' })),
    ink([[70, 32], [70, 170]], { width: 1.5, color: C.cream }),
    piece(poly(starPts(70, 186, 18, 8)), C.goldLight, { edge: 'cut' }),
    piece(ellipse(70, 30, 46, 8), C.brown, { edge: 'cut' }),
  ]);
}

/** Luna's lion hat, 240 × 200, with a mouth (and chin) that open to roar. */
function lionHatArt(): string {
  const cx = 120;
  const mouth = (nodes: Node[]): Node => (ctx) => `<g data-part="mouth">${nodes.map((n) => n(ctx)).join('')}</g>`;
  const jaw = (nodes: Node[]): Node => (ctx) => `<g data-part="jaw">${nodes.map((n) => n(ctx)).join('')}</g>`;
  return svg({ w: 240, h: 200, name: 'b5c2-lionhat', label: 'a lion hat' }, [
    piece(curve(fluffy(cx, 100, 100, 80, 13, 0.92), 1), '#c06a2c'),
    piece(curve(fluffy(cx, 102, 82, 68, 12, 0.9), 1), C.gold, { fibre: false }),
    piece(circle(60, 40, 20), C.goldLight),
    piece(circle(60, 42, 10), C.pink, { edge: 'cut', fibre: false }),
    piece(circle(180, 40, 20), C.goldLight),
    piece(circle(180, 42, 10), C.pink, { edge: 'cut', fibre: false }),
    piece(ellipse(cx, 106, 58, 52), C.goldLight, { fibre: false }),
    mouth([
      piece(ellipse(cx, 146, 24, 18), '#5a2a2a', { edge: 'cut', fibre: false }),
      piece(ellipse(cx, 154, 13, 7), C.rose, { edge: 'cut', fibre: false, shadow: false }),
    ]),
    jaw([piece(ellipse(cx, 150, 20, 9), C.cream, { edge: 'cut', fibre: false })]),
    piece(ellipse(105, 128, 18, 13), C.cream, { edge: 'cut', fibre: false }),
    piece(ellipse(135, 128, 18, 13), C.cream, { edge: 'cut', fibre: false }),
    ...[[96, 126], [104, 132], [136, 126], [144, 132]].map(([x, y]) => dot(x, y, 1.8, C.brown)),
    piece(curve([[106, 112], [134, 112], [120, 126]], 1), C.brownDark, { edge: 'cut', fibre: false }),
    ink([[92, 130], [66, 124]], { width: 1.8, color: C.cream }),
    ink([[92, 134], [66, 138]], { width: 1.8, color: C.cream }),
    ink([[148, 130], [174, 124]], { width: 1.8, color: C.cream }),
    ink([[148, 134], [174, 138]], { width: 1.8, color: C.cream }),
    piece(ellipse(98, 92, 12, 13), C.white, { edge: 'cut', fibre: false }),
    piece(circle(99, 94, 7), C.ink, { edge: 'clean', shadow: false }),
    dot(96, 91, 2.4, C.white),
    piece(ellipse(142, 92, 12, 13), C.white, { edge: 'cut', fibre: false }),
    piece(circle(141, 94, 7), C.ink, { edge: 'clean', shadow: false }),
    dot(138, 91, 2.4, C.white),
    ink([[84, 74], [98, 70], [110, 76]], { width: 3.5, color: '#a0662a' }),
    ink([[156, 74], [142, 70], [130, 76]], { width: 3.5, color: '#a0662a' }),
  ]);
}

/** Rainbow spectrespecs, 220 × 100. */
function spectrespecs(): string {
  const lens = (x: number): Node[] => [
    piece(circle(x, 50, 38), '#d97aa6', { edge: 'cut' }),
    piece(circle(x, 50, 32), C.goldLight, { edge: 'cut', fibre: false, shadow: false }),
    piece(circle(x, 50, 27), '#8fc7c4', { edge: 'cut', fibre: false, shadow: false }),
    piece(circle(x, 50, 22), '#c7b4ea', { edge: 'cut', fibre: false, shadow: false, opacity: 0.9 }),
    ink([[x - 12, 42], [x - 4, 36]], { width: 3, color: C.white, opacity: 0.8 }),
  ];
  return svg({ w: 220, h: 100, name: 'b5c2-specs', label: 'spectrespecs' }, [
    piece(curve([[34, 44], [4, 30], [8, 24], [36, 36]], 1), '#d97aa6', { edge: 'cut' }),
    piece(curve([[186, 44], [216, 30], [212, 24], [184, 36]], 1), '#d97aa6', { edge: 'cut' }),
    piece(rect(98, 40, 24, 9, 4), '#d97aa6', { edge: 'cut' }),
    ...lens(70),
    ...lens(150),
  ]);
}

/** A nargle: a cheeky, fluffy floating puff, 120 × 120. */
function nargle(color: string, belly: string, seed: string): string {
  return svg({ w: 120, h: 120, name: 'b5c2-nargle-' + seed, label: 'a nargle' }, [
    ink([[52, 34], [44, 12]], { width: 2.5, color }),
    ink([[70, 34], [80, 12]], { width: 2.5, color }),
    piece(circle(44, 10, 5), C.goldLight, { edge: 'cut', fibre: false }),
    piece(circle(80, 10, 5), C.goldLight, { edge: 'cut', fibre: false }),
    piece(curve(fluffy(60, 68, 46, 38, 11), 1), color),
    piece(ellipse(60, 80, 26, 20), belly, { edge: 'cut', fibre: false, shadow: false }),
    piece(circle(47, 60, 12), C.white, { edge: 'cut', fibre: false }),
    piece(circle(73, 60, 12), C.white, { edge: 'cut', fibre: false }),
    piece(circle(49, 62, 6), C.ink, { edge: 'clean', shadow: false }),
    piece(circle(75, 62, 6), C.ink, { edge: 'clean', shadow: false }),
    dot(47, 59, 2, C.white),
    dot(73, 59, 2, C.white),
    ink([[48, 80], [60, 88], [74, 78]], { width: 3, color: C.ink }),
    piece(poly([[60, 86], [66, 85], [63, 91]]), C.white, { edge: 'cut', fibre: false, shadow: false }),
  ]);
}

/** A wrackspurt: a tiny glowing buzzy bug with a curly tail, 70 × 50. */
function wrackspurt(seed: string): string {
  return svg({ w: 70, h: 50, name: 'b5c2-wrack-' + seed, label: 'a wrackspurt' }, [
    ink([[32, 30], [20, 36], [12, 28], [18, 20], [26, 26]], { width: 2, color: '#cfe8a8', opacity: 0.8 }),
    piece(ellipse(34, 14, 10, 6, -30), C.white, { edge: 'cut', fibre: false, shadow: false, opacity: 0.6 }),
    piece(ellipse(48, 14, 10, 6, 30), C.white, { edge: 'cut', fibre: false, shadow: false, opacity: 0.6 }),
    piece(ellipse(42, 28, 12, 8), '#cfe8a8', { edge: 'cut' }),
    dot(48, 26, 2.2, C.ink),
  ]);
}

/** The crumple-horned snorkack peeking from a bush, 180 × 190. */
function snorkack(): string {
  const fur = '#8f86c4';
  return svg({ w: 180, h: 190, name: 'b5c2-snorkack', label: 'a crumple-horned snorkack' }, [
    piece(circle(38, 76, 16), fur),
    piece(circle(142, 76, 16), fur),
    piece(circle(38, 78, 8), C.pink, { edge: 'cut', fibre: false }),
    piece(circle(142, 78, 8), C.pink, { edge: 'cut', fibre: false }),
    piece(curve(fluffy(90, 120, 66, 56, 13), 1), fur),
    // the crumpled horn
    piece(poly([[80, 64], [74, 44], [90, 34], [80, 18], [94, 4], [100, 6], [92, 20], [104, 34], [92, 48], [100, 64]]), C.goldLight, { edge: 'cut' }),
    ink([[78, 50], [96, 46]], { width: 2.5, color: C.gold }),
    ink([[84, 28], [98, 24]], { width: 2.5, color: C.gold }),
    piece(ellipse(90, 132, 42, 34), '#b9b0dd', { fibre: false }),
    piece(ellipse(70, 104, 15, 16), C.white, { edge: 'cut', fibre: false }),
    piece(ellipse(110, 104, 15, 16), C.white, { edge: 'cut', fibre: false }),
    piece(circle(64, 106, 8), C.ink, { edge: 'clean', shadow: false }),
    piece(circle(104, 106, 8), C.ink, { edge: 'clean', shadow: false }),
    dot(61, 102, 2.6, C.white),
    dot(101, 102, 2.6, C.white),
    piece(ellipse(90, 128, 7, 5), C.rose, { edge: 'cut', fibre: false }),
    ink([[78, 142], [90, 148], [102, 142]], { width: 3, color: C.ink }),
  ]);
}

/** A round night-time bush, 280 × 180. */
function bush(): string {
  return svg({ w: 280, h: 180, name: 'b5c2-bush', label: 'a bush' }, [
    piece(rect(18, 90, 244, 90, 30), C.greenDeep),
    piece(circle(60, 96, 52), C.greenDeep),
    piece(circle(140, 66, 56), '#2f5040'),
    piece(circle(220, 94, 52), C.greenDeep),
    piece(circle(100, 120, 50), C.greenDark, { fibre: false }),
    piece(circle(184, 122, 50), C.greenDark, { fibre: false }),
    piece(ellipse(140, 86, 30, 18), '#4a7a5e', { edge: 'cut', fibre: false, shadow: false, opacity: 0.5 }),
    ...[[56, 74], [120, 52], [176, 78], [232, 92], [96, 140], [200, 150], [146, 126]].map(([x, y], i) =>
      piece(circle(x, y, 6), i % 2 ? C.cream : '#d9c3e8', { edge: 'cut', fibre: false }),
    ),
  ]);
}

/** A falling drop of oil, 20 × 28. */
function drop(): string {
  return svg({ w: 20, h: 28, name: 'b5c2-drop', label: 'a drop of oil' }, [piece(curve([[10, 2], [17, 18], [10, 26], [3, 18]], 2), C.ink, { edge: 'cut' })]);
}

// --------------------------------------------------------------- helpers

/** The x/y offsets that put an actor's top-left corner at a stage point. */
function at(el: HTMLElement, x: number, y: number): { x: number; y: number } {
  return { x: x - (parseFloat(el.style.left) || 0), y: y - (parseFloat(el.style.top) || 0) };
}

/** Moves an actor inside another (so it rides along), at a local position. */
function attach(el: HTMLElement, parent: HTMLElement, x: number, y: number): void {
  gsap.killTweensOf(el);
  parent.append(el);
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  gsap.set(el, { x: 0, y: 0, rotation: 0, scale: 1 });
}

/** Buzzes a wrackspurt about its spot until `on()` turns false. */
async function buzzAbout(k: Kit<string>, el: HTMLElement, on: () => boolean): Promise<void> {
  while (on()) {
    await k.to(el, 0.22 + Math.random() * 0.12, { x: (Math.random() - 0.5) * 60, y: (Math.random() - 0.5) * 40, rotation: (Math.random() - 0.5) * 30, ease: 'sine.inOut' });
  }
}

// ------------------------------------------------------------------- story

export default defineStory({
  lines: {
    hello: { who: 'luna', text: 'Hello. The meadow’s full of invisible creatures tonight. Try my spectrespecs!' },
    look: { who: 'luna', text: 'Ooh… floaty nargles, buzzy wrackspurts… and a crumple-horned snorkack! He’s shy.' },
    pinch: { who: 'luna', text: 'Oh dear. Those cheeky nargles have pinched the crown and the coins!' },
    ready: { who: 'luna', text: 'Don’t worry. My lion hat will scare them off. Ready?' },
    oil: { who: 'narrator', text: 'Squeak! The hat’s gone rusty! You drip on a little oil…' },
    crown: { who: 'narrator', text: 'What a roar! Off zoom the nargles… and the crown lands on your head!' },
    thanks: { who: 'luna', text: 'Thank you, {name}. You’re very good at seeing things. Shall we dance?' },
  },

  async play(k) {
    k.backdrop(meadow());

    // ------------------------------------------------------------ the set
    const chimeEl = k.add(windChimes(), { x: 256, y: 110, w: 110, z: 5 });
    k.set(chimeEl, { transformOrigin: '50% 0%' });
    const owl = k.picture('owl', { x: 160, y: 16, w: 110, z: 6 });
    const cow = k.picture('cow', { x: 360, y: 420, w: 140, z: 3 });
    k.add(bush(), { x: 500, y: 470, w: 260, z: 9, still: true });
    const snork = k.add(snorkack(), { x: 560, y: 492, w: 140, z: 8 });
    const crown = k.picture('crown', { x: 330, y: 568, w: 100, z: 12, crop: '60 90 280 230' });
    const coins = [
      k.picture('coin', { x: 440, y: 612, w: 52, z: 12, crop: '50 50 300 300' }),
      k.picture('coin', { x: 478, y: 628, w: 46, z: 12, crop: '50 50 300 300' }),
    ];

    const hero = k.character('hero', { x: 40, y: 370, z: 10 });
    const luna = k.character('luna', { x: 860, y: 360, z: 10 });
    const hat = k.add(lionHatArt(), { x: 0, y: 0, w: 190 });
    attach(hat, luna, 35, -58);
    const mouth = hat.querySelector<SVGGElement>('[data-part="mouth"]');
    const jaw = hat.querySelector<SVGGElement>('[data-part="jaw"]');
    if (mouth) k.set(mouth, { scaleY: 0.1, svgOrigin: '120 136' });
    k.set([hero, luna], { opacity: 0 });

    // The invisible creatures, hidden until the spectrespecs go on.
    const nargles = [
      k.add(nargle('#c7a7d8', '#e3d2ee', 'a'), { x: 440, y: 250, w: 84, z: 20 }),
      k.add(nargle('#e6b3c8', '#f3d8e2', 'b'), { x: 590, y: 300, w: 78, z: 20 }),
      k.add(nargle('#a8d0d8', '#d6ecef', 'c'), { x: 830, y: 210, w: 80, z: 20 }),
    ];
    const wracks = [
      k.add(wrackspurt('a'), { x: 40, y: 440, w: 62, z: 22 }),
      k.add(wrackspurt('b'), { x: 250, y: 425, w: 58, z: 22 }),
      k.add(wrackspurt('c'), { x: 115, y: 365, w: 60, z: 22, flip: true }),
      k.add(wrackspurt('d'), { x: 235, y: 530, w: 56, z: 22, flip: true }),
    ];
    k.set([...nargles, ...wracks, snork], { opacity: 0 });

    const sway = async (times = 2, amount = 6): Promise<void> => {
      for (let i = 0; i < times; i++) {
        await k.to(chimeEl, 0.6, { rotation: amount, ease: 'sine.inOut' });
        await k.to(chimeEl, 0.6, { rotation: -amount, ease: 'sine.inOut' });
      }
      await k.to(chimeEl, 0.4, { rotation: 0, ease: 'sine.inOut' });
    };

    // ------------------------------------------------- a dreamy beginning
    k.music('dreamy');
    k.ambient('fireflies', { count: 14, area: [200, 320, 900, 320], z: 5 });
    k.dim(0.22);
    k.light(700, 190, 180, { color: C.cream, strength: 0.35 });
    const hatGlow = k.light(960, 330, 170, { color: C.gold, strength: 0.45 });
    k.set(hatGlow, { opacity: 0 });
    await k.wait(150);
    chimes();
    void sway(2);
    k.float(owl, 4, 2.4);
    await k.wait(250);
    hoot();
    k.fx.whizz();
    k.fx.patter(5);
    await k.all(k.enter(luna, 'right', 0.9), k.enter(hero, 'left'));
    k.float(luna, 3, 2.8);
    moo();
    await k.shake(cow, 3, 1);
    const helloSaid = k.say('hello', luna);

    // ------------------------------------------- on go the spectrespecs
    await k.wait(1800);
    const specs = k.add(spectrespecs(), { x: 900, y: 520, w: 124, z: 30 });
    k.fx.twinkle();
    await k.appear(specs);
    k.fx.whizz();
    const land = at(specs, 40 + 68, 370 + 97);
    await k.to(specs, 0.4, { x: land.x / 2, y: land.y / 2 - 170, rotation: -200, ease: 'power1.out' });
    await k.to(specs, 0.4, { x: land.x, y: land.y, rotation: -360, ease: 'power1.in' });
    attach(specs, hero, 68, 97);
    k.float(hero, 3, 2.6);
    await helloSaid;
    k.fx.pop();
    void k.pop(hero, 1.06);
    k.sparkle(170, 470, 12, 140);
    chimes();
    void k.glow('#c9a6e8', 0.35, 1.2);
    await k.wait(200);

    // The creatures appear!
    for (const n of nargles) {
      k.fx.pop();
      await k.appear(n, 0.25);
      k.float(n, 10, 2 + Math.random());
    }
    giggle();
    let buzzing = true;
    buzz(1.6);
    await k.all(...wracks.map((w) => k.fade(w, 1, 0.3)));
    const buzzers = k.calm ? [] : wracks.map((w) => buzzAbout(k, w, () => buzzing));
    k.set(snork, { opacity: 1 });
    k.fx.boing();
    await k.to(snork, 0.5, { y: -110, ease: 'back.out(1.6)' });
    buzz(1.2);
    void k.camera({ zoom: 1.4, x: 640, y: 470 }, 1.1);
    await k.say('look', luna);
    await k.shake(snork, 3, 1);
    k.fx.fizzle();
    await k.to(snork, 0.35, { y: 0, ease: 'back.in(1.4)' });

    // ------------------------------------------ the nargles pinch things
    const treasure: Array<[HTMLElement, HTMLElement]> = [
      [nargles[0], crown],
      [nargles[1], coins[0]],
      [nargles[2], coins[1]],
    ];
    const pinch = async (): Promise<void> => {
      for (const [n] of treasure) gsap.killTweensOf(n);
      k.fx.whizz();
      await k.all(
        ...treasure.map(([n, t]) => {
          const tx = (parseFloat(t.style.left) || 0) + t.offsetWidth / 2 - n.offsetWidth / 2;
          const ty = (parseFloat(t.style.top) || 0) - n.offsetHeight + 16;
          return k.to(n, 0.5, { ...at(n, tx, ty), ease: 'power2.inOut' });
        }),
      );
      k.fx.pop();
      giggle();
      const away: Array<[number, number]> = [[-30, -200], [70, -250], [190, -175]];
      await k.all(
        ...treasure.flatMap(([n, t], i) => {
          const v = { x: `+=${away[i][0]}`, y: `+=${away[i][1]}`, ease: 'sine.inOut' };
          return [k.to(n, 0.6, v), k.to(t, 0.6, v)];
        }),
      );
      // a cheeky wiggle, treasure and all
      await k.all(...treasure.flatMap(([n, t]) => [k.shake(n, 6, 1), k.shake(t, 6, 1)]));
    };
    k.music('sneaky');
    void k.camera({}, 1);
    await k.all(k.say('pinch', luna), pinch());

    // -------------------------------------------- the lion hat … squeaks
    void k.camera({ zoom: 1.4, x: 900, y: 400 }, 0.9);
    await k.say('ready', luna);
    squeak();
    setTimeout(squeak, 500);
    await k.all(mouth ? k.to(mouth, 0.15, { scaleY: 0.35 }) : k.wait(150), jaw ? k.to(jaw, 0.15, { y: 4 }) : k.wait(150));
    await k.shake(hat, 4, 2);
    await k.all(mouth ? k.to(mouth, 0.15, { scaleY: 0.1 }) : k.wait(150), jaw ? k.to(jaw, 0.15, { y: 0 }) : k.wait(150));
    giggle();

    // A little oil does the trick.
    const can = k.picture('oil', { x: 620, y: 430, w: 90, z: 32 });
    const fixHat = async (): Promise<void> => {
      k.fx.twinkle();
      await k.appear(can, 0.35);
      k.fx.whizz();
      await k.to(can, 0.8, { ...at(can, 830, 320), ease: 'sine.inOut' });
      await k.to(can, 0.35, { rotation: 35, ease: 'back.out(1.6)' });
      for (let i = 0; i < 1; i++) {
        const d = k.add(drop(), { x: 906, y: 360, w: 14, z: 33 });
        plip();
        await k.to(d, 0.35, { y: 34, x: 10, ease: 'power2.in' });
        k.remove(d);
      }
      k.sparkle(950, 400, 8, 80);
      k.fx.twinkle();
      await k.to(can, 0.3, { rotation: 0 });
      await k.vanish(can);
    };
    await k.all(k.say('oil'), fixHat());

    // ROAR! (after a breath in)
    if (mouth) void k.to(mouth, 0.25, { scaleY: 0.3 });
    await k.to(hat, 0.25, { scaleY: 0.9, transformOrigin: '50% 100%' });
    k.music('triumph');
    roar();
    void k.quake(4);
    void k.to(hatGlow, 0.5, { opacity: 0.45 }).then(() => k.to(hatGlow, 0.7, { opacity: 0 }));
    void k.to(hat, 0.4, { scaleY: 1, ease: 'back.out(2)' });
    await k.all(
      mouth ? k.to(mouth, 0.3, { scaleY: 1, ease: 'back.out(1.6)' }) : k.wait(300),
      jaw ? k.to(jaw, 0.3, { y: 14, ease: 'back.out(1.6)' }) : k.wait(300),
      k.pop(hat, 1.18),
      ...nargles.map((n) => k.shake(n, 8, 3)),
    );
    buzzing = false;
    await k.all(...buzzers);

    // Everyone flees; the treasure drops.
    k.fx.whizz();
    giggle();
    const flee = k.all(
      ...nargles.map((n, i) => k.to(n, 1.1, { x: `+=${(i - 1) * 160}`, y: '-=560', rotation: (i - 1) * 40, ease: 'power2.in' })),
      ...wracks.map((w, i) => k.to(w, 0.9, { x: `+=${i % 2 ? 300 : -300}`, y: '-=520', opacity: 0, ease: 'power2.in' })),
    );
    const heroHead = { x: 40 + 80, y: 370 - 22 };
    const crownFall = (async (): Promise<void> => {
      void k.camera({}, 0.8);
      const end = at(crown, heroHead.x, heroHead.y);
      const cy = parseFloat(crown.style.top) || 0;
      await k.to(crown, 0.5, { x: end.x / 2, y: heroHead.y - cy - 120, rotation: -180, ease: 'power1.out' });
      await k.to(crown, 0.5, { x: end.x, y: end.y, rotation: -360, ease: 'power1.in' });
      attach(crown, hero, 80, -22);
      k.sfx.sparkle();
      await k.to(crown, 0.08, { scaleY: 0.85 });
      void k.to(crown, 0.3, { scaleY: 1, ease: 'back.out(3)' });
      k.fx.twinkle();
      k.sparkle(170, 360, 14, 140);
      await k.pop(hero, 1.08);
    })();
    const coinFall = (async (): Promise<void> => {
      await k.all(...coins.map((c) => k.to(c, 0.7, { x: 0, y: 0, rotation: 0, ease: 'bounce.out' })));
      clink();
    })();
    await k.all(k.say('crown'), flee, crownFall, coinFall, mouth ? k.to(mouth, 0.4, { scaleY: 0.1, delay: 0.6 }) : k.wait(0), jaw ? k.to(jaw, 0.4, { y: 0 }) : k.wait(0));
    nargles.forEach((n) => k.remove(n));
    wracks.forEach((w) => k.remove(w));

    // ---------------------------------------------- a dreamy happy ending
    gsap.killTweensOf(owl);
    const owlFlies = async (): Promise<void> => {
      await k.wait(250);
      hoot();
      k.fx.whizz();
      await k.to(owl, 1.2, { ...at(owl, 740, 330), rotation: 0, ease: 'sine.inOut' });
    };
    await k.all(k.say('thanks', luna), owlFlies());
    chimes();
    k.fx.jingle();
    k.confetti(34);
    k.sparkle(900, 420, 14, 180);
    gsap.killTweensOf(luna, 'y');
    gsap.killTweensOf(hero, 'y');
    const lunaDance = async (): Promise<void> => {
      for (let i = 0; i < 1; i++) {
        await k.to(luna, 0.55, { rotation: 7, y: -12, ease: 'sine.inOut' });
        await k.to(luna, 0.55, { rotation: -7, y: 0, ease: 'sine.inOut' });
      }
      await k.to(luna, 0.4, { rotation: 0 });
    };
    const owlDance = async (): Promise<void> => {
      for (let i = 0; i < 1; i++) {
        await k.to(owl, 0.55, { y: '-=50', rotation: -12, ease: 'sine.inOut' });
        await k.to(owl, 0.55, { y: '+=50', rotation: 12, ease: 'sine.inOut' });
      }
      hoot();
      await k.to(owl, 0.3, { rotation: 0 });
    };
    const cowOverMoon = async (): Promise<void> => {
      await k.wait(250);
      moo();
      k.fx.boing();
      await k.to(cow, 0.8, { x: 290, y: -445, rotation: -15, ease: 'power1.out' });
      await k.to(cow, 0.8, { x: 860, y: -150, rotation: 20, ease: 'power1.in' });
      k.remove(cow);
    };
    const snorkWave = async (): Promise<void> => {
      await k.wait(900);
      k.fx.boing();
      await k.to(snork, 0.45, { y: -110, ease: 'back.out(1.6)' });
      await k.hop(snork, 20, 2);
    };
    await k.all(lunaDance(), owlDance(), cowOverMoon(), snorkWave(), k.hop(hero, 40, 2), sway(1, 8));
    k.fx.twinkle();
    await k.wait(1500);
  },
});
