/**
 * Book 7, chapter 2: Gringotts Bank.
 *
 * Griphook the goblin leads you into a little mine cart that rattles down twisting
 * rails under the bank. The vault opens on gold and helmets, and a big pale friendly
 * dragon rises up, bursts through the roof with you on his back and flies off over
 * London into the sunset. Nobody is hurt; the dragon is free and happy.
 */
import { gsap } from 'gsap';
import { stepped } from '../ui/anim';
import { bell, C, circle, curve, band, defineStory, dot, ellipse, group, ink, type Kit, noiseBurst, NOTE, now, piece, poly, rect, rng, svg, tone, type Node, type Pt } from './kit';

// ------------------------------------------------------------------ sounds

/** A cart rattling over rail joints: clack-clack, clack-clack, getting quicker. */
function clatter(secs: number): void {
  const t = now();
  let at = 0;
  let gap = 0.22;
  while (at < secs) {
    for (const d of [0, 0.07]) {
      noiseBurst(t + at + d, { freq: 1800, q: 5, peak: 0.1, decay: 0.035, type: 'bandpass' });
      tone(150, t + at + d, { wave: 'triangle', peak: 0.07, decay: 0.05, glideTo: 90 });
    }
    at += gap;
    gap = Math.max(0.12, gap - 0.006);
  }
  noiseBurst(t, { freq: 200, q: 0.6, peak: 0.07, attack: 0.3, decay: secs, sweepTo: 700, type: 'lowpass' });
}

/** A heavy vault door: a deep clunk, a grinding creak, and a bright little chime. */
function vaultClunk(): void {
  const t = now();
  tone(95, t, { wave: 'triangle', peak: 0.26, attack: 0.005, decay: 0.45, glideTo: 55 });
  noiseBurst(t, { freq: 400, q: 1, peak: 0.12, decay: 0.2, type: 'lowpass' });
  tone(180, t + 0.5, { wave: 'sawtooth', peak: 0.04, attack: 0.1, decay: 0.8, glideTo: 260, lowpass: 600, vibrato: [14, 10] });
  bell(NOTE.G6, t + 1.2, 0.07, 0.9);
}

/** Coins jingling in a pile. */
function coins(): void {
  const t = now();
  const r = rng(72);
  for (let i = 0; i < 14; i++) {
    const f = 2400 + r() * 2600;
    bell(f, t + i * 0.07 + r() * 0.04, 0.05, 0.35);
  }
}

/** A big, friendly dragon roar: a warm rumbly "rooaar" that ends in a happy rise. */
function roar(): void {
  const t = now();
  tone(120, t, { wave: 'sawtooth', peak: 0.16, attack: 0.15, decay: 1.1, glideTo: 80, lowpass: 500, vibrato: [18, 12] });
  tone(240, t + 0.1, { wave: 'triangle', peak: 0.08, attack: 0.2, decay: 0.9, glideTo: 180, lowpass: 800, vibrato: [14, 10] });
  noiseBurst(t, { freq: 400, q: 0.8, peak: 0.08, attack: 0.2, decay: 0.9, sweepTo: 900, type: 'lowpass' });
  tone(300, t + 1.0, { wave: 'triangle', peak: 0.07, attack: 0.05, decay: 0.45, glideTo: 520, lowpass: 1200 });
}

/** Big soft wingbeats: whump, whump. */
function wingbeats(n: number): void {
  const t = now();
  for (let i = 0; i < n; i++) {
    noiseBurst(t + i * 0.5, { freq: 260, q: 0.8, peak: 0.16, attack: 0.08, decay: 0.3, sweepTo: 120, type: 'lowpass' });
    tone(70, t + i * 0.5, { wave: 'sine', peak: 0.12, attack: 0.04, decay: 0.3, glideTo: 50 });
  }
}

// --------------------------------------------------------------------- art

const STONE = '#6a6574';
const STONE_DARK = '#4b4756';
const STONE_LIGHT = '#8a8493';
const MARBLE = '#e6dfd0';
const GOLD_DK = '#c79a26';
const DRAGON = '#d7e6dc';
const DRAGON_DK = '#b3cbbd';
const DRAGON_PINK = '#efc2c8';

/** A heap of gold coins, with a few bright ones on top. */
function goldPile(cx: number, cy: number, w: number, h: number, seed: number): Node[] {
  const r = rng(seed);
  const coinsOn: Node[] = [];
  for (let i = 0; i < 9; i++) {
    const px = cx + (r() - 0.5) * w * 0.7;
    const py = cy - r() * h * 0.7 + h * 0.1;
    coinsOn.push(piece(ellipse(px, py, 10, 5), r() > 0.5 ? C.goldLight : C.yellow, { edge: 'cut', fibre: false, shadow: false }));
  }
  return [
    piece(curve([[cx - w / 2, cy + h / 2], [cx - w * 0.3, cy - h * 0.1], [cx, cy - h / 2], [cx + w * 0.3, cy - h * 0.1], [cx + w / 2, cy + h / 2]], 2), GOLD_DK),
    piece(curve([[cx - w * 0.38, cy + h * 0.4], [cx - w * 0.15, cy - h * 0.1], [cx + w * 0.1, cy - h * 0.3], [cx + w * 0.35, cy + h * 0.4]], 2), C.gold, { fibre: false }),
    ...coinsOn,
  ];
}

/** A silver helmet on a shelf. */
function helmetShape(cx: number, cy: number, s: number): Node[] {
  return [
    piece(curve([[cx - 24 * s, cy], [cx - 22 * s, cy - 20 * s], [cx, cy - 32 * s], [cx + 22 * s, cy - 20 * s], [cx + 24 * s, cy]], 2), '#b9bec8'),
    piece(rect(cx - 27 * s, cy - 2 * s, 54 * s, 8 * s, 2), '#8d93a0', { edge: 'cut', fibre: false }),
    piece(poly([[cx - 2 * s, cy - 32 * s], [cx + 2 * s, cy - 32 * s], [cx, cy - 44 * s]]), C.red, { edge: 'cut', fibre: false }),
  ];
}

/** The marble banking hall. */
function bankHall(): string {
  const r = rng(702);
  const tiles: Node[] = [];
  for (let i = 0; i < 9; i++) tiles.push(piece(poly([[i * 140 - 60, 700], [i * 140 + 10, 700], [i * 140 - 10, 820], [i * 140 - 120, 820]]), i % 2 ? '#c9c0ad' : '#ddd3bf', { edge: 'cut', fibre: false, shadow: false }));
  const columns = [90, 330, 850, 1090].map((x) => [
    piece(rect(x - 36, 110, 72, 520, 4), MARBLE, { rough: 0.8 }),
    piece(rect(x - 48, 96, 96, 26, 3), C.sand, { edge: 'cut' }),
    piece(rect(x - 48, 620, 96, 26, 3), C.sand, { edge: 'cut' }),
    ink([[x - 12, 140], [x - 12, 610]], { width: 2, color: C.sand }),
    ink([[x + 12, 140], [x + 12, 610]], { width: 2, color: C.sand }),
  ]).flat();
  const lamps: Node[] = [];
  for (const x of [200, 590, 980]) {
    lamps.push(ink([[x, 40], [x, 130]], { width: 3, color: C.brownDark }));
    lamps.push(piece(ellipse(x, 150, 28, 22), C.candle, { edge: 'cut', fibre: false }));
    lamps.push(piece(rect(x - 20, 126, 40, 10, 3), C.gold, { edge: 'cut', fibre: false }));
  }
  const stars: Node[] = [];
  for (let i = 0; i < 10; i++) stars.push(dot(130 + r() * 920, 200 + r() * 260, 2 + r() * 2, C.goldLight, 0.4 + r() * 0.3));
  return svg({ w: 1180, h: 820, name: 'b7c2-hall', boil: false, className: 'backdrop' }, [
    piece(rect(-20, -20, 1220, 860), '#bfb49c', { edge: 'clean', shadow: false }),
    piece(rect(-20, -20, 1220, 70), C.brownDark, { edge: 'clean', shadow: false }),
    // the great doors in the back wall
    piece(curve([[440, 650], [440, 330], [520, 250], [590, 232], [660, 250], [740, 330], [740, 650]], 2), C.brownDark),
    piece(curve([[462, 650], [462, 342], [530, 268], [590, 252], [650, 268], [718, 342], [718, 650]], 2), C.wood, { edge: 'cut', fibre: false }),
    ink([[590, 252], [590, 650]], { width: 4, color: C.brownDark }),
    piece(circle(572, 470, 9), C.gold, { edge: 'cut', fibre: false }),
    piece(circle(608, 470, 9), C.gold, { edge: 'cut', fibre: false }),
    ...columns,
    ...lamps,
    ...stars,
    // a long counter with brass scales
    piece(rect(150, 520, 880, 150, 6), C.brownDark),
    piece(rect(130, 500, 920, 30, 6), C.wood),
    ...[250, 930].flatMap((x) => [
      ink([[x, 500], [x, 430]], { width: 4, color: GOLD_DK }),
      ink([[x - 40, 440], [x + 40, 440]], { width: 4, color: GOLD_DK }),
      piece(ellipse(x - 40, 462, 20, 8), C.gold, { edge: 'cut' }),
      piece(ellipse(x + 40, 450, 20, 8), C.gold, { edge: 'cut' }),
    ]),
    piece(rect(-40, 660, 1260, 200), '#d8cdb6', { edge: 'clean', shadow: false }),
    ...tiles,
  ]);
}

/** The twisty tunnel with its rails, drawn through the cart's wheel points. */
function tunnel(rails: Pt[]): string {
  const r = rng(703);
  const rocks: Node[] = [];
  for (let i = 0; i < 16; i++) {
    const x = r() * 1180;
    const y = r() * 700;
    rocks.push(piece(ellipse(x, y, 40 + r() * 70, 24 + r() * 40, r() * 90), r() > 0.5 ? STONE_DARK : '#3f3b4a', { edge: 'cut', fibre: false, shadow: false, opacity: 0.8 }));
  }
  const lanterns: Node[] = [];
  for (const [x, y] of [[90, 120], [560, 150], [1000, 130], [760, 360], [260, 440]] as Pt[]) {
    lanterns.push(ink([[x, y - 60], [x, y - 12]], { width: 3, color: C.brownDark }));
    lanterns.push(piece(circle(x, y, 26), C.candle, { edge: 'cut', fibre: false, opacity: 0.35, shadow: false }));
    lanterns.push(piece(rect(x - 10, y - 14, 20, 28, 4), C.candle, { edge: 'cut', fibre: false }));
    lanterns.push(piece(rect(x - 12, y - 18, 24, 6, 2), C.brownDark, { edge: 'cut', fibre: false, shadow: false }));
  }
  const sleepers: Node[] = [];
  for (let i = 0; i < rails.length - 1; i++) {
    const [ax, ay] = rails[i];
    const [bx, by] = rails[i + 1];
    for (let j = 0; j < 6; j++) {
      const f = j / 6;
      const x = ax + (bx - ax) * f;
      const y = ay + (by - ay) * f;
      sleepers.push(ink([[x, y + 6], [x, y + 22]], { width: 5, color: C.brown }));
    }
  }
  return svg({ w: 1180, h: 820, name: 'b7c2-tunnel', boil: false, className: 'backdrop' }, [
    piece(rect(-20, -20, 1220, 860), STONE, { edge: 'clean', shadow: false }),
    ...rocks,
    piece(curve([[-40, 760], [300, 720], [700, 740], [1220, 710], [1220, 860], [-40, 860]], 2), STONE_DARK, { rough: 1.2 }),
    ...sleepers,
    piece(band(rails.map(([x, y]) => [x, y + 4] as Pt), 9), C.grey, { edge: 'cut', fibre: false }),
    ...lanterns,
  ]);
}

/** The vault: a round steel door ajar, shelves of helmets, heaps of gold. Roof is an actor. */
function vault(): string {
  const shelves: Node[] = [];
  for (const [y, xs] of [[300, [60, 150, 240, 330]], [440, [90, 190, 290]]] as Array<[number, number[]]>) {
    shelves.push(piece(rect(30, y, 340, 12, 3), C.brownDark, { edge: 'cut' }));
    xs.forEach((x, i) => shelves.push(...helmetShape(x, y - 2, 1.05 + (i % 2) * 0.1)));
  }
  return svg({ w: 1180, h: 820, name: 'b7c2-vault', boil: false, className: 'backdrop' }, [
    piece(rect(-20, -20, 1220, 860), STONE_DARK, { edge: 'clean', shadow: false }),
    piece(rect(-20, 120, 1220, 540), STONE, { edge: 'clean', shadow: false }),
    ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => ink([[i * 170 - 20, 120], [i * 170 - 20, 660]], { width: 3, color: STONE_DARK })),
    ...[220, 340, 460, 580].map((y) => ink([[-20, y], [1220, y]], { width: 3, color: STONE_DARK })),
    // the round door, swung open at the far left
    piece(circle(120, 520, 0.1), STONE_DARK, { shadow: false, opacity: 0 }),
    ...shelves,
    ...goldPile(880, 600, 340, 150, 11),
    ...goldPile(1060, 620, 260, 130, 12),
    ...goldPile(700, 640, 220, 100, 13),
    piece(rect(400, 560, 150, 90, 6), C.brownDark),
    piece(rect(400, 560, 150, 24, 6), C.wood, { edge: 'cut' }),
    ...goldPile(475, 566, 120, 40, 14),
    piece(rect(-40, 650, 1260, 220), '#5a5566', { edge: 'clean', shadow: false }),
    ...[0, 1, 2, 3, 4, 5].map((i) => ink([[i * 240, 650], [i * 240 - 80, 820]], { width: 3, color: STONE_DARK })),
  ]);
}

/** London at sunset: sky bands, a low sun, a tower, a dome, the river and a bridge. */
function london(): string {
  const bands: Node[] = [];
  const cols = ['#4d4a7a', '#7c5a8a', '#b8688a', '#e8887a', '#f4b07a', '#f8d08a'];
  cols.forEach((c, i) => bands.push(piece(rect(-20, i * 100, 1220, 120), c, { edge: 'clean', shadow: false, fibre: false })));
  const skyline: Node[] = [
    piece(rect(150, 520, 110, 160), '#3a3350', { edge: 'cut', fibre: false }),
    piece(rect(300, 470, 54, 210), '#3a3350', { edge: 'cut', fibre: false }),
    piece(poly([[290, 470], [327, 400], [364, 470]]), '#2e2842', { edge: 'cut', fibre: false }),
    piece(circle(327, 506, 15), C.cream, { edge: 'cut', fibre: false }),
    piece(rect(420, 540, 90, 140), '#3a3350', { edge: 'cut', fibre: false }),
    piece(curve([[560, 680], [560, 560], [620, 500], [680, 560], [680, 680]], 2), '#2e2842'),
    piece(rect(740, 520, 60, 160), '#3a3350', { edge: 'cut', fibre: false }),
    piece(rect(840, 560, 130, 120), '#3a3350', { edge: 'cut', fibre: false }),
    piece(rect(1010, 500, 80, 180), '#3a3350', { edge: 'cut', fibre: false }),
    piece(rect(-20, 676, 1220, 160), '#4a4468', { edge: 'clean', shadow: false }),
    ink([[-20, 700], [1220, 700]], { width: 3, color: '#6a6490' }),
  ];
  return svg({ w: 1180, h: 820, name: 'b7c2-london', boil: false, className: 'backdrop' }, [
    ...bands,
    piece(circle(840, 430, 82), C.goldLight, { edge: 'cut', fibre: false, shadow: false, opacity: 0.85 }),
    piece(circle(840, 430, 56), C.yellow, { edge: 'cut', fibre: false, shadow: false, opacity: 0.9 }),
    ...[[160, 90], [390, 160], [980, 70], [690, 110]].map(([x, y]) => piece(ellipse(x, y, 90, 20), '#f0a8a0', { edge: 'cut', fibre: false, shadow: false, opacity: 0.6 })),
    ...skyline,
  ]);
}

/** A little mine cart, 260 × 160 (wheels touch the rail at y ≈ 158). */
function cartArt(): string {
  return svg({ w: 260, h: 160, name: 'b7c2-cart', label: 'a little mine cart' }, [
    piece(poly([[6, 40], [254, 40], [232, 138], [28, 138]]), '#7a6a58'),
    piece(rect(0, 34, 260, 20, 4), '#9a8a74', { edge: 'cut' }),
    ...[40, 100, 160, 220].map((x) => dot(x, 46, 4, C.brownDark)),
    ink([[40, 70], [220, 70]], { width: 3, color: C.brownDark }),
    ...[64, 196].flatMap((x) => [
      piece(circle(x, 138, 21), C.stone, { edge: 'cut' }),
      piece(circle(x, 138, 8), C.brownDark, { edge: 'cut', fibre: false, shadow: false }),
    ]),
  ]);
}

/** A friendly, big, pale dragon, 420 × 300. The back is at about (190, 125). */
function dragonArt(): string {
  return svg({ w: 420, h: 300, name: 'b7c2-dragon', label: 'a big pale dragon' }, [
    // tail
    piece(curve([[110, 200], [60, 215], [30, 190], [12, 150], [40, 160], [70, 185], [120, 170]], 2), DRAGON),
    piece(poly([[6, 140], [34, 156], [14, 176]]), DRAGON_PINK, { edge: 'cut' }),
    // the wing behind
    group({ part: 'wing' }, [
      piece(curve([[150, 130], [120, 30], [200, 4], [260, 40], [300, 120]], 2), DRAGON_PINK),
      ink([[160, 128], [160, 40]], { width: 2.5, color: DRAGON_DK }),
      ink([[200, 126], [205, 20]], { width: 2.5, color: DRAGON_DK }),
      ink([[250, 126], [252, 44]], { width: 2.5, color: DRAGON_DK }),
    ]),
    // back legs and front legs
    ...[150, 276].map((x) => piece(ellipse(x, 258, 24, 34), DRAGON_DK)),
    piece(ellipse(210, 190, 124, 68), DRAGON),
    piece(ellipse(220, 218, 96, 40), C.cream, { fibre: false }),
    // little pink back spikes
    ...[130, 160, 190, 220, 250].map((x, i) => piece(poly([[x - 12, 134 - (i % 2) * 2], [x, 108 - (i % 2) * 6], [x + 12, 134 - (i % 2) * 2]]), DRAGON_PINK, { edge: 'cut', fibre: false })),
    // neck and head
    piece(curve([[290, 160], [330, 110], [352, 74], [392, 86], [376, 140], [326, 206]], 2), DRAGON),
    piece(ellipse(372, 84, 46, 38), DRAGON),
    piece(ellipse(404, 98, 30, 22), DRAGON),
    piece(poly([[346, 56], [340, 24], [362, 50]]), C.goldLight, { edge: 'cut' }),
    piece(poly([[372, 50], [378, 20], [390, 50]]), C.goldLight, { edge: 'cut' }),
    piece(circle(382, 74, 11), C.white, { edge: 'cut', fibre: false }),
    piece(circle(385, 76, 6), C.ink, { edge: 'clean', shadow: false }),
    dot(383, 73, 2, C.white),
    ink([[392, 108], [412, 112], [424, 104]], { width: 3 }),
    dot(420, 92, 3, DRAGON_DK),
    dot(362, 102, 8, C.pink, 0.6),
  ]);
}

/** A slab of roof, a rough chunk of stone. */
function slabArt(left: boolean): string {
  const pts: Pt[] = left ? [[0, 0], [380, 0], [340, 150], [230, 200], [120, 150], [0, 190]] : [[0, 0], [380, 0], [380, 190], [260, 150], [150, 200], [40, 150]];
  return svg({ w: 380, h: 200, name: 'b7c2-slab' + (left ? 'l' : 'r') }, [
    piece(poly(pts), STONE_LIGHT, { rough: 1.4 }),
    ink([[60, 40], [200, 60], [300, 30]], { width: 3, color: STONE }),
  ]);
}

/** A little falling rock. */
function rockArt(): string {
  return svg({ w: 50, h: 40, name: 'b7c2-rock' }, [piece(poly([[4, 30], [14, 6], [38, 4], [46, 28], [24, 38]]), STONE_LIGHT, { edge: 'cut' })]);
}

/** A patch of evening sky showing through the hole. */
function skyArt(): string {
  return svg({ w: 560, h: 300, name: 'b7c2-sky', boil: false }, [
    piece(curve([[20, 150], [60, 40], [170, 14], [290, 40], [400, 6], [510, 50], [540, 160], [450, 270], [260, 290], [110, 262]], 1.5), '#6c5a8c', { edge: 'torn', fibre: false }),
    piece(curve([[70, 150], [110, 70], [230, 50], [350, 66], [470, 90], [492, 170], [400, 244], [250, 250], [120, 226]], 2), '#e8887a', { edge: 'cut', fibre: false, shadow: false }),
    piece(curve([[130, 180], [170, 120], [300, 100], [420, 130], [440, 200], [330, 230], [190, 226]], 2), '#f4b07a', { edge: 'cut', fibre: false, shadow: false }),
    piece(circle(300, 190, 40), C.goldLight, { edge: 'cut', fibre: false, shadow: false, opacity: 0.85 }),
  ]);
}

// ------------------------------------------------------------------ helpers

/** Tween several actors the same way at once. */
function together(k: Kit, els: HTMLElement[], secs: number, vars: Parameters<Kit["to"]>[2]): Promise<void> {
  return k.all(...els.map((e) => k.to(e, secs, vars))).then(() => undefined);
}

/** Keeps the dragon's wing flapping (not in calm mode). */
function flapWing(k: Kit, dragon: HTMLElement): void {
  const wing = dragon.querySelector('[data-part="wing"]');
  if (!wing || k.calm) return;
  gsap.set(wing, { svgOrigin: '200 130' });
  gsap.to(wing, { rotation: -18, duration: 0.5, yoyo: true, repeat: -1, ease: stepped(0.5, 'sine.inOut') });
}

// -------------------------------------------------------------------- story

/** The cart's wheel points along the rails, a twisty roller-coaster. */
const RAILS: Pt[] = [[130, 250], [430, 340], [700, 270], [930, 430], [700, 540], [420, 520], [230, 610], [540, 630], [900, 600], [1090, 520], [1330, 440]];
const PICS: Array<[string, number, number]> = [['goblin', 70, 40], ['helmet', 250, 24], ['pocket', 430, 40]];

export default defineStory({
  lines: {
    cart: { who: 'griphook', text: 'Welcome to Gringotts! Your cart is waiting… climb in, quickly now!' },
    hold: { who: 'griphook', text: 'Hold on tight, {name}! This cart goes very, very fast!' },
    zoom: { who: 'narrator', text: 'Wheee! Down, down, down you zoom, round the twisty bends!' },
    vault: { who: 'griphook', text: 'Here we are! Gold and helmets everywhere… and a coin for your pocket!' },
    dragon: { who: 'griphook', text: 'Look… a dragon! Don’t worry, he’s friendly. He just wants to be free!' },
    burst: { who: 'narrator', text: 'You climb onto his back… and whoosh! Up through the roof!' },
    fly: { who: 'narrator', text: 'Over London you soar into the sunset. What a magic ride!' },
  },

  async play(k) {
    // ------------------------------------------------ scene 1: the bank hall
    k.music('sneaky');
    k.backdrop(bankHall());
    const griphook = k.character('griphook', { x: 120, y: 330, w: 240, z: 20 });
    const hero = k.character('hero', { x: 350, y: 345, w: 240, z: 20 });
    k.set([griphook, hero], { opacity: 0 });
    const cart = k.add(cartArt(), { x: 780, y: 450, w: 300, z: 22 });
    k.set(cart, { opacity: 0 });

    await k.wait(500);
    k.sfx.whoosh();
    await k.all(k.enter(griphook, 'left'), k.enter(hero, 'left'));
    k.fx.patter(6, 0.1);
    clatter(0.8);
    void k.enter(cart, 'right', 0.7);
    await k.say('cart', griphook);
    await k.say('hold', griphook);

    const squash = async (): Promise<void> => {
      k.fx.thud();
      await k.to(cart, 0.1, { scaleY: 0.92 });
      await k.to(cart, 0.1, { scaleY: 1 });
    };
    await k.to(hero, 0.35, { x: 250, y: -130, ease: 'power2.out' });
    await k.to(hero, 0.3, { x: 500, y: -40, ease: 'power2.in' });
    await squash();
    await k.to(griphook, 0.35, { x: 330, y: -130, ease: 'power2.out' });
    await k.to(griphook, 0.3, { x: 580, y: -40, ease: 'power2.in' });
    await squash();
    await k.camera({ zoom: 1.3, x: 880, y: 450 }, 0.8);
    clatter(0.6);
    await together(k, [hero, griphook, cart], 0.6, { x: '+=420', ease: 'power2.in' });

    // ------------------------------------------------ scene 2: the ride
    k.fx.whizz();
    let crew1!: HTMLElement;
    let crew2!: HTMLElement;
    let cart2!: HTMLElement;
    const [sx, sy] = RAILS[0];
    await k.cut(() => {
      k.backdrop(tunnel(RAILS));
      k.dim(0.4);
      k.ambient('dust', { count: 14, z: 5 });
      for (const [x, y] of [[90, 120], [560, 150], [1000, 130], [760, 360], [260, 440]] as Pt[]) k.light(x, y, 110, { color: C.candle, flicker: true });
      crew1 = k.character('griphook', { x: sx - 135, y: sy - 190, w: 150, z: 20 });
      crew2 = k.character('hero', { x: sx - 15, y: sy - 190, w: 150, z: 20 });
      cart2 = k.add(cartArt(), { x: sx - 150, y: sy - 185, w: 300, z: 25 });
      k.set([crew1, crew2, cart2], { opacity: 0 });
    });
    const all = [crew1, crew2, cart2];
    k.music('adventure');
    await k.camera({ zoom: 1.3, x: sx, y: sy - 70 }, 0.4);
    await k.all(...all.map((e) => k.appear(e, 0.3)));
    clatter(8);
    const zoom = k.say('zoom');
    for (let i = 1; i < RAILS.length; i++) {
      const [px, py] = RAILS[i - 1];
      const [nx, ny] = RAILS[i];
      const angle = Math.max(-20, Math.min(20, (Math.atan2(ny - py, nx - px) * 180) / Math.PI));
      const dx = nx - sx;
      const dy = ny - sy;
      if (ny - py > 70) {
        k.fx.whizz();
        k.quake(4);
      }
      void k.camera({ zoom: 1.3, x: nx, y: ny - 70 }, 0.7);
      await k.all(
        k.to(cart2, 0.7, { x: dx, y: dy, rotation: angle, ease: 'sine.inOut' }),
        k.to(crew1, 0.7, { x: dx, y: dy, rotation: angle * 0.6, ease: 'sine.inOut' }),
        k.to(crew2, 0.7, { x: dx, y: dy, rotation: angle * 0.6, ease: 'sine.inOut' }),
      );
      if (i % 3 === 0) k.sparkle(nx, ny + 10, 6, 50);
    }
    await zoom;

    // ------------------------------------------------ scene 3: the vault
    let sky!: HTMLElement;
    let slabL!: HTMLElement;
    let slabR!: HTMLElement;
    let g2!: HTMLElement;
    let h2!: HTMLElement;
    let vdim!: HTMLElement;
    await k.cut(() => {
      k.backdrop(vault());
      k.ambient('dust', { count: 14, z: 5 });
      vdim = k.dim(0.3);
      k.light(880, 580, 280, { color: C.gold, strength: 0.4 });
      sky = k.add(skyArt(), { x: 480, y: -10, w: 600, z: 3 });
      slabL = k.add(slabArt(true), { x: 420, y: -30, w: 380, z: 4 });
      slabR = k.add(slabArt(false), { x: 780, y: -30, w: 380, z: 4 });
      k.set(sky, { opacity: 0 });
      g2 = k.character('griphook', { x: 60, y: 340, w: 240, z: 20 });
      h2 = k.character('hero', { x: 300, y: 355, w: 240, z: 20 });
      k.set([g2, h2], { opacity: 0 });
    });
    vaultClunk();
    await k.wait(600);
    k.fx.creak();
    await k.all(k.appear(g2, 0.4), k.appear(h2, 0.4));
    coins();
    k.sparkle(900, 540, 14, 200);
    void k.say('vault', g2);
    const pics = PICS.map(([w, x, y]) => {
      const p = k.picture(w, { x, y, w: 150, z: 30 });
      k.set(p, { opacity: 0 });
      return p;
    });
    await k.wait(1200);
    k.sfx.gem();
    k.sparkle(450, 560, 8, 40);
    for (const [i, p] of pics.entries()) {
      k.fx.pop();
      await k.appear(p, 0.3);
      k.float(p, 6, 1.6 + i * 0.2);
      await k.wait(260);
    }
    await k.all(...pics.map((p) => k.vanish(p, 0.3)));

    // The dragon pops up behind the gold.
    k.fx.rumble(1.5);
    k.quake(5);
    const dragon = k.add(dragonArt(), { x: 560, y: 330, w: 420, z: 8 });
    flapWing(k, dragon);
    await k.enter(dragon, 'bottom', 0.9);
    roar();
    void k.camera({ zoom: 1.3, x: 760, y: 440 }, 0.9);
    void k.shake(dragon, 5, 3);
    await k.all(k.say('dragon', g2), k.hop(h2, 30, 2));

    // You climb on, and up through the roof you go!
    void k.camera({}, 0.8);
    k.fx.boing();
    await k.to(h2, 0.35, { x: 340, y: -150, ease: 'power2.out' });
    await k.to(h2, 0.3, { x: 385, y: -42, ease: 'power2.in' });
    const rider = [dragon, h2];
    void k.say('burst', g2);
    await k.wait(800);
    k.fx.rumble(1.5);
    k.quake(8);
    void k.fade(vdim, 0, 0.8);
    k.light(780, 120, 320, { color: '#f4b07a', strength: 0.5 });
    void k.fade(sky, 1, 0.5);
    // rocks fall well clear of everyone
    const rocks = [330, 400, 460, 1010, 1070, 1120].map((x) => k.add(rockArt(), { x, y: 100, w: 50, z: 12 }));
    await k.all(
      k.to(slabL, 0.7, { x: -420, y: -260, rotation: -40, ease: 'power2.in' }),
      k.to(slabR, 0.7, { x: 420, y: -260, rotation: 40, ease: 'power2.in' }),
      ...rocks.map((r, i) => k.to(r, 0.9, { y: 500 + (i % 2) * 90, rotation: 200, ease: 'power1.in' })),
    );
    k.fx.crash();
    k.puff(700, 160, 200, C.stone);
    k.puff(900, 180, 160, C.stone);
    roar();
    await together(k, rider, 1.1, { y: '-=640', ease: 'power2.in' });
    await k.wait(300);

    // ------------------------------------------------ scene 4: over London
    let d2!: HTMLElement;
    let h3!: HTMLElement;
    await k.cut(() => {
      k.backdrop(london());
      d2 = k.add(dragonArt(), { x: -460, y: 200, w: 420, z: 10 });
      h3 = k.character('hero', { x: -460 + 125, y: 190, w: 130, z: 20 });
    });
    k.music('triumph');
    flapWing(k, d2);
    const both = [d2, h3];
    void k.say('fly');
    wingbeats(8);
    void k.camera({ zoom: 1.2, x: 650, y: 330 }, 3.6);
    await together(k, both, 1.8, { x: 480, y: -40, ease: 'sine.inOut' });
    k.sparkle(700, 240, 10, 200);
    await together(k, both, 1.8, { x: 900, y: 40, ease: 'sine.inOut' });
    // Your five word friends wave from the sky.
    const dp = k.picture('dragon', { x: 330, y: 40, w: 140, z: 30 });
    const mp = k.picture('magic', { x: 700, y: 30, w: 140, z: 30 });
    k.set([dp, mp], { opacity: 0 });
    k.fx.pop();
    void k.appear(dp, 0.3);
    void k.appear(mp, 0.3);
    k.float(dp, 6, 1.7);
    k.float(mp, 6, 1.9);
    void k.camera({}, 1.4);
    k.fx.jingle();
    k.confetti(36);
    wingbeats(3);
    await together(k, both, 0.9, { y: '-=24', ease: 'sine.inOut' });
    await together(k, both, 0.9, { y: '+=24', ease: 'sine.inOut' });
    await k.wait(1600);
  },
});
