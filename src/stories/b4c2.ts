/**
 * Book 4, chapter 2: The Dragon Task.
 *
 * A rocky arena at night, the stands full of cheering witches and wizards
 * (and one goat in a coat). The Hungarian Horntail stomps in to guard her
 * golden egg and lights the torches with a puff of paper fire. You call
 * "Accio broom!", loop round the dragon until she is chasing her own tail,
 * swoop down and grab the egg. The Horntail huffs a smoke ring and grins,
 * and the egg opens on a clue: a boat. The next task is at the lake.
 */
import { gsap } from 'gsap';
import { stepped } from '../ui/anim';
import { band, C, circle, curve, defineStory, dot, ellipse, group, ink, type Kit, noiseBurst, NOTE, now, piece, poly, rect, rng, svg, tone, tune, type Node, type Pt } from './kit';

// ---------------------------------------------------------------------------
// Sounds made for this chapter
// ---------------------------------------------------------------------------

/** A big, friendly dragon roar: it swells up, then rolls down into a rumble. */
function roar(seconds = 1.4, peak = 0.2): void {
  const t = now();
  tone(92, t, { wave: 'sawtooth', peak: peak * 0.55, attack: 0.2, decay: 0.35, glideTo: 138, vibrato: [7, 8], lowpass: 650 });
  tone(138, t + 0.45, { wave: 'sawtooth', peak: peak * 0.6, attack: 0.08, decay: seconds, glideTo: 70, vibrato: [6, 10], lowpass: 750 });
  tone(207, t + 0.45, { wave: 'sawtooth', peak: peak * 0.18, attack: 0.1, decay: seconds * 0.8, glideTo: 104, vibrato: [6, 14], lowpass: 900 });
  noiseBurst(t, { freq: 420, q: 0.9, peak: peak * 0.5, attack: 0.3, decay: seconds + 0.3, sweepTo: 160 });
  tone(55, t + 0.2, { peak: peak * 0.6, attack: 0.25, decay: seconds, glideTo: 40 });
}

/** A soft paper-fire whoosh with a few crackles. */
function fireWhoosh(seconds = 0.9): void {
  const t = now();
  noiseBurst(t, { freq: 300, type: 'lowpass', peak: 0.14, attack: 0.12, decay: seconds, sweepTo: 1600 });
  noiseBurst(t, { freq: 900, q: 0.7, peak: 0.07, attack: 0.1, decay: seconds * 0.8, sweepTo: 2400 });
  for (let i = 0; i < 7; i++) noiseBurst(t + 0.1 + Math.random() * seconds, { freq: 2600 + Math.random() * 2000, q: 2, peak: 0.03, decay: 0.03 });
}

/** A broom zooming past, dropping in pitch as it goes by. */
function broomWhoosh(): void {
  const t = now();
  noiseBurst(t, { freq: 500, q: 1.5, peak: 0.1, attack: 0.22, decay: 0.12, sweepTo: 2600 });
  noiseBurst(t + 0.3, { freq: 2600, q: 1.5, peak: 0.09, attack: 0.01, decay: 0.42, sweepTo: 450 });
  tone(380, t, { wave: 'triangle', peak: 0.05, attack: 0.25, decay: 0.5, glideTo: 220, lowpass: 1500 });
}

/** The crowd in the stands cheering: a warm swell of voices. */
function crowdCheer(seconds = 2.4, peak = 0.1): void {
  const t = now();
  noiseBurst(t, { freq: 700, q: 0.8, peak, attack: 0.45, decay: seconds });
  noiseBurst(t, { freq: 1500, q: 1.2, peak: peak * 0.55, attack: 0.55, decay: seconds * 0.9 });
  noiseBurst(t, { freq: 260, type: 'lowpass', peak: peak * 0.8, attack: 0.4, decay: seconds });
  [220, 277, 330, 262, 196].forEach((f, i) =>
    tone(f, t + 0.15 + i * 0.07, { wave: 'sawtooth', peak: 0.022, attack: 0.35, decay: seconds * 0.8, vibrato: [5 + i, 7], lowpass: 1100, glideTo: f * 1.15 }),
  );
}

/** A goat's bleat. */
function bleat(): void {
  const t = now();
  tone(420, t, { wave: 'sawtooth', peak: 0.06, attack: 0.04, decay: 0.5, vibrato: [11, 26], lowpass: 1400, glideTo: 380 });
  tone(840, t, { wave: 'sawtooth', peak: 0.015, attack: 0.04, decay: 0.4, vibrato: [11, 40], lowpass: 2200 });
}

/** A happy dragon chuckle: three low "huh"s. */
function chuckle(): void {
  const t = now();
  [0, 0.17, 0.34].forEach((d, i) => {
    tone(150 - i * 12, t + d, { wave: 'sawtooth', peak: 0.07, attack: 0.02, decay: 0.12, glideTo: 110 - i * 8, lowpass: 600 });
    noiseBurst(t + d, { freq: 500, q: 0.8, peak: 0.04, decay: 0.1 });
  });
}

/** The golden egg opening on a little song. */
function eggSong(): void {
  tune([[NOTE.E5, 0], [NOTE.G5, 0.2], [NOTE.C6, 0.4], [NOTE.B5, 0.7], [NOTE.G5, 0.9], [NOTE.E6, 1.15]], 0.1, 1.4);
}

// ---------------------------------------------------------------------------
// Art
// ---------------------------------------------------------------------------

const HIDE = '#2f3238';
const HIDE_FAR = '#24272c';
const WING = '#3c4048';
const BELLY = '#8a6a3a';
const ROCK = ['#5f5b58', '#6e6a66', '#7d7872'];
const STANDS = ['#3e2f52', '#4a3560', '#5a3f6e', '#4f3a62'];

/** The dragon arena at night: stands full of fans, a rock wall, a sandy floor. */
function arena(): string {
  const r = rng(4202);
  const nodes: Node[] = [piece(rect(-20, -20, 1220, 860), C.night, { edge: 'clean', shadow: false })];

  // Stars.
  for (let i = 0; i < 36; i++) nodes.push(dot(r() * 1180, r() * 150, 1.4 + r() * 2, r() > 0.8 ? C.goldLight : C.cream, 0.4 + r() * 0.4));

  // The stands: a back wall and four tiers of fans.
  nodes.push(piece(curve([[-20, 160], [300, 140], [590, 134], [880, 140], [1200, 160], [1200, 380], [-20, 380]], 2), '#2c2240', { rough: 1.2 }));
  const scarves = [C.red, C.gold, C.green, C.blue, C.red, C.cream];
  const skins = [C.skin, C.skinShade, '#c69470', '#8a5a3b', C.skinPale];
  for (let i = 0; i < 4; i++) {
    const y0 = 166 + i * 42;
    nodes.push(piece(curve([[-20, y0 + 4], [590, y0 - 6], [1200, y0 + 4], [1200, y0 + 46], [-20, y0 + 46]], 2), STANDS[i], { rough: 0.7, fibre: i === 0 ? undefined : false }));
    for (let x = 8 + (i % 2) * 13; x < 1180; x += 24 + r() * 6) {
      const y = y0 + 14 - Math.sin((x / 1180) * Math.PI) * 6;
      nodes.push(dot(x, y + 8, 7, scarves[Math.floor(r() * scarves.length)]));
      nodes.push(dot(x, y - 1, 5.5, skins[Math.floor(r() * skins.length)]));
    }
  }
  // Bunting along the top of the stands.
  const flags = [C.red, C.gold, C.green, C.blue];
  for (let x = -10, i = 0; x < 1200; x += 46, i++) {
    const y = 150 - Math.sin((x / 1180) * Math.PI) * 14;
    nodes.push(piece(poly([[x, y], [x + 40, y + 2], [x + 20, y + 28]]), flags[i % 4], { edge: 'cut', fibre: false }));
  }
  nodes.push(ink(Array.from({ length: 13 }, (_, i) => [i * 100 - 10, 150 - Math.sin(((i * 100 - 10) / 1180) * Math.PI) * 14] as Pt), { width: 2.5, color: C.cream, opacity: 0.7 }));

  // The rock wall round the arena.
  const top: Pt[] = [];
  for (let x = -20; x <= 1200; x += 40) top.push([x, 336 + r() * 26 - (x % 120 === 0 ? 14 : 0)]);
  nodes.push(piece(poly([...top, [1200, 470], [-20, 470]]), ROCK[0], { rough: 1.4 }));
  for (let i = 0; i < 16; i++) {
    const x = 30 + i * 76 + r() * 30;
    nodes.push(piece(ellipse(x, 400 + r() * 40, 34 + r() * 20, 22 + r() * 12, r() * 30 - 15), ROCK[1 + (i % 2)], { fibre: false }));
  }

  // The sandy floor, with paler patches.
  nodes.push(piece(curve([[-20, 446], [300, 428], [600, 438], [900, 424], [1200, 442], [1200, 860], [-20, 860]], 2), '#9c8868'));
  nodes.push(piece(ellipse(300, 560, 260, 50), '#ab9776', { edge: 'cut', fibre: false, shadow: false, opacity: 0.7 }));
  nodes.push(piece(ellipse(860, 700, 300, 46), '#ab9776', { edge: 'cut', fibre: false, shadow: false, opacity: 0.6 }));
  nodes.push(piece(ellipse(160, 740, 200, 30), '#93805f', { edge: 'cut', fibre: false, shadow: false, opacity: 0.6 }));
  // Scattered pebbles and two corner boulders.
  for (let i = 0; i < 14; i++) nodes.push(piece(ellipse(40 + r() * 1100, 480 + r() * 300, 6 + r() * 8, 4 + r() * 5), ROCK[2], { edge: 'cut', fibre: false }));
  nodes.push(piece(curve([[-20, 690], [-10, 600], [40, 570], [100, 600], [120, 700], [-20, 720]], 2), ROCK[1]));
  nodes.push(piece(ellipse(60, 640, 26, 14, -20), ROCK[2], { fibre: false, shadow: false }));
  nodes.push(piece(curve([[1200, 730], [1190, 640], [1140, 618], [1100, 650], [1092, 740]], 2), ROCK[1]));

  // The egg's nest: a ring of rocks with straw (front rocks are a separate actor).
  nodes.push(piece(ellipse(570, 598, 110, 30), '#7a6248', { fibre: false }));
  for (let i = 0; i < 9; i++) nodes.push(ink([[490 + i * 18, 590 + (i % 3) * 4], [510 + i * 18, 582 + (i % 2) * 8]], { width: 3, color: C.goldLight, opacity: 0.8 }));
  for (const [x, y, rx] of [[470, 588, 26], [528, 574, 22], [600, 572, 24], [664, 586, 26]] as Array<[number, number, number]>) nodes.push(piece(ellipse(x, y, rx, 16), ROCK[2], { fibre: false }));

  return svg({ w: 1180, h: 820, name: 'b4c2-arena', boil: false, className: 'backdrop' }, nodes);
}

/** The front rocks of the nest, in front of the egg. */
const nestFront = (): string =>
  svg({ w: 260, h: 80, name: 'b4c2-nest', boil: false }, [
    piece(ellipse(40, 46, 34, 22), ROCK[1]),
    piece(ellipse(100, 54, 36, 22), ROCK[2]),
    piece(ellipse(164, 54, 36, 22), ROCK[1]),
    piece(ellipse(222, 46, 32, 22), ROCK[2]),
    ink([[70, 34], [92, 26]], { width: 3, color: C.goldLight }),
    ink([[190, 30], [210, 22]], { width: 3, color: C.goldLight }),
  ]);

/** The golden egg, in two halves: the top half lifts off. */
function goldenEgg(): string {
  const cx = 60;
  const cy = 88;
  const rx = 44;
  const ry = 58;
  const zig: Pt[] = [[16, 80], [30, 70], [44, 84], [58, 70], [72, 84], [86, 70], [104, 80]];
  const a0 = Math.asin(-8 / ry);
  const arc = (from: number, to: number): Pt[] => Array.from({ length: 21 }, (_, i) => {
    const a = from + ((to - from) * i) / 20;
    return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry] as Pt;
  });
  const lower = [...zig, ...arc(a0, Math.PI - a0)];
  const upper = [...zig, ...arc(Math.PI * 2 + a0, Math.PI - a0)];
  return svg({ w: 120, h: 150, name: 'b4c2-egg', boil: false, label: 'the golden egg' }, [
    piece(lower, C.gold, { edge: 'cut' }),
    ink([[30, 112], [60, 120], [90, 112]], { width: 2.5, color: '#9a6f20', opacity: 0.7 }),
    group({ part: 'lid' }, [
      piece(upper, C.gold, { edge: 'cut' }),
      piece(ellipse(42, 52, 9, 16, 20), C.goldLight, { edge: 'cut', fibre: false, shadow: false }),
      ink([[34, 74], [60, 62], [86, 74]], { width: 2.5, color: '#9a6f20', opacity: 0.7 }),
    ]),
    dot(78, 104, 4, C.goldLight),
  ]);
}

/** The Horntail's body, side on and facing left (her head is her portrait, added on top). */
function dragonBody(): string {
  const spike = (x: number, y: number, s = 1, lean = 0): Node => piece(poly([[x - 10 * s, y + 4], [x + lean, y - 24 * s], [x + 10 * s, y + 4]]), C.stone, { edge: 'cut' });
  const toes = (x: number, y: number): Node[] => [0, 1, 2].map((i) => piece(poly([[x - 22 + i * 16, y], [x - 30 + i * 16, y + 12], [x - 14 + i * 16, y + 4]]), C.stoneLight, { edge: 'cut', fibre: false }));
  return svg({ w: 560, h: 440, name: 'b4c2-dragon', boil: false, label: 'the Hungarian Horntail' }, [
    piece(ellipse(320, 428, 230, 13), 'rgba(40,25,10,0.22)', { edge: 'cut', fibre: false, shadow: false }),
    // Tail, curling up behind, with its spiky end.
    group({ part: 'tail' }, [
      piece(band([[400, 330], [470, 352], [516, 330]], 50), HIDE),
      piece(band([[506, 338], [540, 296], [532, 254], [502, 236]], 32), HIDE),
      spike(470, 330, 0.7, 4), spike(522, 298, 0.6, 8), spike(530, 262, 0.55, 6),
      piece(poly([[512, 230], [470, 210], [486, 238], [470, 266], [510, 248]]), C.stone, { edge: 'cut' }),
    ]),
    // Far wing and far legs.
    piece(poly([[300, 240], [372, 70], [410, 128], [452, 96], [446, 210], [380, 262]]), HIDE_FAR),
    piece(band([[250, 350], [246, 414]], 40), HIDE_FAR),
    piece(band([[396, 350], [402, 414]], 40), HIDE_FAR),
    // Body and belly.
    piece(ellipse(320, 312, 142, 80), HIDE),
    piece(ellipse(300, 346, 104, 40), BELLY, { fibre: false }),
    ...[250, 290, 330].map((x) => ink([[x, 318], [x + 6, 382]], { width: 2.5, color: '#6a4f2a', opacity: 0.6 })),
    // Spikes along the back.
    spike(250, 246, 0.9), spike(296, 234, 1), spike(344, 234, 1), spike(392, 246, 0.9), spike(432, 270, 0.75),
    // Neck, with its pale front.
    piece(band([[270, 300], [214, 236], [178, 172]], 82), HIDE),
    piece(band([[236, 334], [194, 260], [168, 200]], 30), BELLY, { fibre: false }),
    spike(226, 210, 0.7, -4), spike(200, 174, 0.6, -4),
    // Near legs.
    piece(band([[236, 362], [228, 418]], 48), HIDE),
    ...toes(232, 416),
    piece(band([[412, 360], [420, 418]], 52), HIDE),
    ...toes(420, 416),
    // Near wing (flaps).
    group({ part: 'wing' }, [
      piece(poly([[318, 256], [352, 34], [402, 106], [452, 66], [474, 160], [528, 170], [446, 250], [380, 276]]), WING),
      ink([[330, 254], [352, 40]], { width: 4, color: HIDE_FAR }),
      ink([[330, 254], [452, 72]], { width: 3, color: HIDE_FAR }),
      ink([[330, 254], [522, 172]], { width: 3, color: HIDE_FAR }),
    ]),
  ]);
}

/** A big friendly grin to lay over the Horntail's portrait (same coordinates). */
const grin = (): string =>
  svg({ w: 300, h: 340, name: 'b4c2-grin', boil: false }, [
    piece(curve([[108, 194], [150, 204], [192, 194], [180, 214], [150, 224], [120, 214]], 2), '#1e2024', { edge: 'cut', fibre: false, shadow: false }),
    piece(curve([[128, 214], [150, 210], [172, 214], [150, 222]], 2), C.rose, { edge: 'cut', fibre: false, shadow: false }),
    piece(poly([[122, 199], [132, 201], [127, 212]]), C.white, { edge: 'cut', fibre: false, shadow: false }),
    piece(poly([[168, 201], [178, 199], [173, 212]]), C.white, { edge: 'cut', fibre: false, shadow: false }),
    ink([[100, 186], [109, 195]], { width: 4, color: '#1e2024' }),
    ink([[200, 186], [191, 195]], { width: 4, color: '#1e2024' }),
  ]);

/** A soft paper flame, pointing left from its right-hand end. */
const flame = (): string =>
  svg({ w: 240, h: 140, name: 'b4c2-flame', boil: false }, [
    piece(curve([[240, 52], [180, 26], [120, 6], [70, 26], [4, 70], [70, 108], [120, 132], [180, 112], [240, 88]], 2), C.rust, { edge: 'cut', fibre: false }),
    piece(curve([[240, 56], [176, 36], [128, 24], [56, 70], [128, 114], [176, 104], [240, 84]], 2), C.orange, { edge: 'cut', fibre: false }),
    piece(curve([[240, 60], [180, 48], [116, 70], [180, 94], [240, 80]], 2), C.yellow, { edge: 'cut', fibre: false }),
    piece(curve([[240, 64], [200, 62], [176, 70], [200, 80], [240, 76]], 2), C.cream, { edge: 'cut', fibre: false, shadow: false }),
  ]);

/** A ring of smoke. */
const smokeRing = (): string =>
  svg({ w: 120, h: 90, name: 'b4c2-ring', boil: false }, [
    ink(ellipse(60, 45, 42, 26), { closed: true, width: 14, color: C.stoneLight, opacity: 0.9 }),
    ink(ellipse(60, 45, 42, 26), { closed: true, width: 4, color: C.white, opacity: 0.6 }),
  ]);

/** A broom, with or without the rider's hand on it. */
const broom = (hand: boolean): string =>
  svg({ w: 300, h: 260, name: `b4c2-broom-${hand}`, boil: false }, [
    piece(poly([[72, 222], [6, 196], [-6, 232], [8, 262], [74, 240]]), C.tan, { edge: 'cut' }),
    ink([[66, 226], [10, 212]], { width: 2.5, color: C.brown }),
    ink([[66, 232], [4, 236]], { width: 2.5, color: C.brown }),
    ink([[66, 238], [14, 254]], { width: 2.5, color: C.brown }),
    piece(band([[54, 236], [298, 214]], 13), C.wood, { edge: 'cut' }),
    piece(rect(68, 222, 12, 26, 3), C.brownDark, { edge: 'cut', fibre: false }),
    ...(hand ? [piece(circle(226, 220, 12), C.skin, { edge: 'cut' })] : []),
  ]);

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

/** The dragon on stage, and her parts in her own pixels. */
const DRAGON = { x: 640, y: 250, w: 520 };
/** The head portrait crop (portrait units) and its size in the dragon. */
const HEAD_CROP = '64 26 172 204';
const HEAD = { x: 73, y: 0, w: 170 };
const HS = HEAD.w / 172;
/** Her mouth on stage (portrait 150, 212). */
const MOUTH: Pt = [DRAGON.x + HEAD.x + (150 - 64) * HS, DRAGON.y + HEAD.y + (212 - 26) * HS];
/** The egg in its nest. */
const EGG = { x: 515, y: 456, w: 110 };
/** Torches (the word "light": a wand with a glowing tip, stood upright). */
const TORCHES = [70, 300, 470, 1110];
/** Where the rider's hand is on the broom (rider is 300 wide). */
const HAND: Pt = [226, 220];

/** Puts an actor inside another, at x/y in the parent's own pixels. */
function nest(parent: HTMLElement, child: HTMLElement, x: number, y: number): HTMLElement {
  child.style.left = `${x}px`;
  child.style.top = `${y}px`;
  parent.append(child);
  return child;
}

/** Stops a cropped actor showing art outside its crop. */
function clip(el: HTMLElement): HTMLElement {
  const s = el.querySelector('svg');
  if (s) s.style.overflow = 'hidden';
  return el;
}

/** The dragon breathes a soft paper flame (no flashing: it grows, wavers and fades). */
async function breathe(k: Kit, tilt: number, seconds = 1.1): Promise<void> {
  const f = k.add(flame(), { x: MOUTH[0] - 240, y: MOUTH[1] - 70, w: 240, z: 18 });
  k.set(f, { transformOrigin: '100% 50%', rotation: tilt, scaleX: 0.1, scaleY: 0.5, opacity: 1 });
  fireWhoosh(seconds);
  await k.to(f, 0.35, { scaleX: 1, scaleY: 1, ease: 'power2.out' });
  await k.to(f, seconds * 0.3, { scaleY: 0.86, scaleX: 1.05, ease: 'sine.inOut' });
  await k.to(f, seconds * 0.3, { scaleY: 1.05, scaleX: 0.96, ease: 'sine.inOut' });
  await k.to(f, 0.4, { opacity: 0, scaleX: 1.15, ease: 'power1.in' });
  k.remove(f);
}

// ---------------------------------------------------------------------------
// The show
// ---------------------------------------------------------------------------

export default defineStory({
  lines: {
    night: { who: 'narrator', text: 'It’s night at the dragon task… and listen! The crowd is cheering for you!' },
    egg: { who: 'horntail', text: 'Rooaar! Ahh, that’s better… a bit of light. Now, nobody touches my golden egg!' },
    accio: { who: 'narrator', text: 'You lift your wand and call out, ‘Accio broom!’ Whoosh!' },
    tail: { who: 'horntail', text: 'Hold still! Where did you go? Ooh… is that my own tail?' },
    grab: { who: 'narrator', text: 'Round and round she spins… and you swoop down and grab the egg!' },
    win: { who: 'horntail', text: 'Ha ha! You win, {name}! Even the goat in a coat is cheering!' },
    clue: { who: 'horntail', text: 'Ooh, look! The egg opens… a boat! Your next task is at the lake.' },
  },

  async play(k) {
    k.backdrop(arena());
    k.music('adventure');
    const night = k.dim(0.5);

    // ---- The set: the moon, the torches (unlit), the egg in its nest.
    const moon = clip(k.picture('night', { x: 120, y: 6, w: 130, crop: '205 50 140 140', z: 1, still: true }));
    k.set(moon, { opacity: 0 });
    const torches = TORCHES.map((x) => {
      const t = k.picture('light', { x: x - 75, y: 258, w: 150, z: 3 });
      k.set(t, { rotation: -40, opacity: 0 });
      return t;
    });
    const egg = k.add(goldenEgg(), { ...EGG, z: 12 });
    k.add(nestFront(), { x: 440, y: 560, w: 260, z: 13 });
    k.light(570, 520, 120, { color: C.goldLight, strength: 0.4 });
    k.light(185, 70, 110, { color: C.cream, strength: 0.3 });

    // ---- The Horntail stomps in to guard her egg, 2 s into the narration.
    const dragon = k.add(dragonBody(), { ...DRAGON, z: 15 });
    const head = clip(k.character('horntail', { x: 0, y: 0, w: HEAD.w, crop: HEAD_CROP }));
    nest(dragon, head, HEAD.x, HEAD.y);
    k.set(dragon, { opacity: 0 });
    const wing = dragon.querySelector('[data-part="wing"]');
    const tailPart = dragon.querySelector('[data-part="tail"]');
    const enterDragon = async (): Promise<void> => {
      k.set(dragon, { opacity: 1 });
      k.fx.stomp(3, 0.4);
      await k.enter(dragon, 'right', 1.3);
      void k.quake(5);
      if (!k.calm && wing) {
        gsap.set(wing, { svgOrigin: '330 254' });
        gsap.to(wing, { rotation: -7, duration: 0.9, yoyo: true, repeat: -1, ease: stepped(0.9, 'sine.inOut') });
      }
      if (!k.calm && tailPart) {
        gsap.set(tailPart, { svgOrigin: '410 330' });
        gsap.to(tailPart, { rotation: 5, duration: 0.7, yoyo: true, repeat: -1, ease: stepped(0.7, 'sine.inOut') });
      }
    };

    // ---- Curtains up: night falls and the crowd cheers.
    crowdCheer(2.6, 0.08);
    void k.fade(moon, 1, 1.2);
    k.fx.twinkle();
    await k.all(
      k.say('night'),
      k.to(egg, 0.6, { rotation: 4, yoyo: true, repeat: 3, ease: 'sine.inOut' }),
      k.wait(2000).then(enterDragon),
    );

    // She roars and lights the torches with a puff of fire.
    roar(1.3, 0.18);
    await k.to(head, 0.3, { rotation: -6, y: -8 });
    void k.to(head, 0.4, { rotation: 0, y: 0 });
    void breathe(k, 32, 1.1);
    await k.wait(500);
    for (const t of torches) {
      void k.appear(t, 0.35);
      fireWhoosh(0.3);
      k.light(t.offsetLeft + 75, 300, 140, { color: C.candle, strength: 0.6, flicker: true });
      await k.wait(200);
    }
    k.ambient('embers', { count: 12, area: [0, 220, 1180, 260], z: 4 });
    void k.to(night, 0.8, { opacity: 0.2 });
    k.fx.twinkle();
    void k.camera({ zoom: 1.4, x: 820, y: 360 }, 1);
    await k.say('egg', head);
    void k.camera({}, 0.8);

    // ---- You run in and summon your broom.
    const hero = k.character('hero', { x: 40, y: 340, w: 210, z: 20 });
    k.fx.patter(6, 0.12);
    await k.enter(hero, 'left', 0.8);
    const sayAccio = k.say('accio', hero);
    await k.wait(900);
    k.fx.spell();
    await k.beam([210, 470], [330, 190], C.goldLight, 0.35);
    const loose = k.add(broom(false), { x: 10, y: 380, w: 260, z: 21 });
    k.set(loose, { x: -340, y: -460, rotation: -20 });
    broomWhoosh();
    await k.to(loose, 0.9, { x: 0, y: 0, rotation: 0, ease: 'back.out(1.1)' });
    await sayAccio;

    // Hop on!
    k.fx.boing();
    await k.hop(hero, 40);
    const rider = k.add(broom(true), { x: 0, y: 330, w: 300, z: 22 });
    nest(rider, k.character('hero', { x: 0, y: 0, w: 180 }), 62, 18);
    const prize = nest(rider, k.add(goldenEgg(), { x: 0, y: 0, w: 56 }), 200, 150);
    k.set(prize, { opacity: 0 });
    k.puff(170, 560, 170);
    k.remove(hero);
    k.remove(loose);
    await k.pop(rider, 1.1);

    // ---- Loop round the dragon: up, behind her, round the front and away.
    const loop = async (): Promise<void> => {
      broomWhoosh();
      await k.to(rider, 0.7, { x: 160, y: -260, rotation: -10 });
      rider.style.zIndex = '8';
      void k.to(dragon, 0.4, { scaleX: -1, ease: 'power1.inOut' });
      await k.to(rider, 0.8, { x: 780, y: -150, rotation: 8, ease: 'none' });
      broomWhoosh();
      await k.to(rider, 0.5, { x: 800, y: 110, rotation: 14 });
      rider.style.zIndex = '30';
      void k.to(dragon, 0.4, { scaleX: 1, ease: 'power1.inOut' });
      await k.to(rider, 0.8, { x: 620, y: 90, rotation: -4, ease: 'none' });
      broomWhoosh();
      await k.to(rider, 0.6, { x: 220, y: -80, rotation: -12 });
      // She roars after you, and her flame misses by a mile.
      roar(1, 0.15);
      crowdCheer(1.2, 0.06);
      await breathe(k, 18, 0.9);
      await k.to(rider, 0.4, { x: 120, y: -290, rotation: -4 });
    };
    await loop();

    // ---- She spins round and round, chasing her own tail.
    const chase = async (): Promise<void> => {
      for (let i = 0; i < 2; i++) {
        k.fx.stomp(1);
        await k.all(k.to(dragon, 0.35, { scaleX: -1, x: 20, ease: 'sine.inOut' }), k.hop(dragon, 14));
        await k.all(k.to(dragon, 0.35, { scaleX: 1, x: 0, ease: 'sine.inOut' }), k.hop(dragon, 14));
      }
      // Dizzy!
      k.sparkle(MOUTH[0], DRAGON.y + 20, 8, 80);
      await k.to(dragon, 0.3, { rotation: -4 });
      await k.to(dragon, 0.3, { rotation: 4 });
      await k.to(dragon, 0.3, { rotation: 0 });
    };
    await k.all(k.say('tail', head), chase());

    // ---- Swoop down and grab the egg!
    const swoop = async (): Promise<void> => {
      await k.wait(200);
      broomWhoosh();
      const sx = EGG.x + EGG.w / 2 - HAND[0];
      const sy = EGG.y + 60 - HAND[1] - 330;
      await k.to(rider, 0.8, { x: sx, y: sy, rotation: 6, ease: 'power2.in' });
      k.fx.pop();
      k.sparkle(EGG.x + EGG.w / 2, EGG.y + 60, 14, 120);
      k.set(egg, { opacity: 0 });
      k.set(prize, { opacity: 1 });
      k.sfx.gem();
      k.music('triumph');
      void k.pop(prize, 1.3);
      broomWhoosh();
      await k.to(rider, 0.8, { x: 150, y: -170, rotation: -8, ease: 'power2.out' });
    };
    await k.all(k.say('grab'), swoop());

    // ---- The crowd goes wild, and a goat in a coat pops up in the stands.
    crowdCheer(3, 0.12);
    k.fx.twinkle();
    k.confetti(34);
    const goat = k.picture('goat', { x: 930, y: 175, w: 130, z: 4 });
    nest(goat, k.picture('coat', { x: 0, y: 0, w: 68 }), 32, 40);
    k.light(995, 240, 90, { color: C.candle, strength: 0.4 });
    await k.appear(goat, 0.35);
    bleat();
    void k.hop(goat, 22, 3);
    void k.hop(rider, 30, 2);

    // The Horntail huffs a smoke ring… and grins.
    const ring = k.add(smokeRing(), { x: MOUTH[0] - 60, y: MOUTH[1] - 50, w: 110, z: 19 });
    k.set(ring, { scale: 0.3, opacity: 1 });
    k.fx.poof();
    void k.to(ring, 1.8, { y: -230, x: -40, scale: 1.6, opacity: 0, ease: 'power1.out' }).then(() => k.remove(ring));
    await k.wait(400);
    const smile = clip(k.add(grin(), { x: 0, y: 0, w: HEAD.w, crop: HEAD_CROP }));
    nest(head, smile, 0, 0);
    k.set(smile, { opacity: 0 });
    void k.fade(smile, 1, 0.3);
    chuckle();
    await k.say('win', head);

    // ---- The egg opens on a clue: a boat. Next stop, the lake!
    const at: Pt = [rider.offsetLeft + Number(gsap.getProperty(rider, 'x')) + 200, rider.offsetTop + Number(gsap.getProperty(rider, 'y')) + 150];
    k.set(prize, { opacity: 0 });
    const big = k.add(goldenEgg(), { x: at[0], y: at[1], w: 56, z: 32 });
    await k.to(big, 0.7, { x: 560 - (at[0] + 28), y: 330 - (at[1] + 35), scale: 2.3, ease: 'power2.inOut' });
    const lid = big.querySelector('[data-part="lid"]');
    const boat = k.picture('boat', { x: 450, y: 260, w: 220, z: 31 });
    k.set(boat, { scale: 0, opacity: 1 });
    void k.camera({ zoom: 1.35, x: 560, y: 300 }, 0.9);
    eggSong();
    if (lid) await k.to(lid, 0.4, { y: -40, rotation: -24, svgOrigin: '20 80', ease: 'back.out(2)' });
    k.fx.splash();
    k.sfx.reveal();
    void k.to(boat, 0.6, { scale: 1, y: -170, ease: 'back.out(1.6)' }).then(() => { void k.float(boat, 6, 2); });
    k.sparkle(560, 160, 16, 180);
    void k.glow(C.goldLight, 0.25, 1.2);
    await k.say('clue', head);
    void k.camera({}, 1.2);
    void k.float(rider, 5, 2.2);
    void k.hop(goat, 18, 1);
    k.fx.jingle();
    await k.wait(1500);
  },
});
