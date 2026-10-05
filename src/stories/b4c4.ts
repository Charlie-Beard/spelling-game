/**
 * b4c4 "The Golden Cup": a treasure vault deep under the bank, piled with gold.
 *
 * You zap the chain off the vault door and creep in. Bellatrix pops up,
 * cackling: the golden cup is hers, touch it if you dare! You touch it and
 * pop, pop, pop: copies spring out everywhere and pile up. While she dances
 * about gloating, a toad hops in and squirts a bar of soap under her feet;
 * she slides right into the pile of cups (and gets the soap on her head).
 * Then only the real cup glows, and it floats into your hands.
 */
import { gsap } from 'gsap';
import { picture } from '../art/pictures';
import { C, NOTE, bell, circle, curve, defineStory, ellipse, ink, noiseBurst, now, piece, poly, raw, rect, rng, svg, tone, type Kit, type Node, type Pt } from './kit';

// ------------------------------------------------------------------ sounds

/** Gold coins tumbling: a cascade of little clinks that thins out. */
function coins(count = 16, seconds = 0.9, peak = 0.045): void {
  const t = now();
  for (let i = 0; i < count; i++) {
    const dt = seconds * Math.pow(i / count, 1.5) + Math.random() * 0.025;
    const f = 1900 + Math.random() * 1500;
    const p = peak * (1 - (i / count) * 0.55);
    bell(f, t + dt, p, 0.22);
    tone(f * 1.47, t + dt, { peak: p * 0.35, attack: 0.002, decay: 0.07 });
  }
  noiseBurst(t, { freq: 6500, type: 'highpass', peak: 0.025, attack: 0.03, decay: seconds });
}

/** Bellatrix's cackle as a tune: a wobbly "ha-ha-ha-ha" tumbling down, then a squeaky "hee!". */
function cackle(): void {
  const t = now();
  [932, 880, 831, 784, 740, 698].forEach((f, i) => {
    const at = t + i * 0.12;
    tone(f, at, { wave: 'triangle', peak: 0.1, attack: 0.01, decay: 0.09, vibrato: [16, 18], lowpass: 2400 });
    noiseBurst(at, { freq: 1800, q: 2, peak: 0.025, decay: 0.05 });
  });
  tone(660, t + 0.8, { wave: 'triangle', peak: 0.1, attack: 0.02, decay: 0.32, glideTo: 1100, vibrato: [12, 14], lowpass: 2600 });
}

/** A slide whistle: up… and wheee down (the slip on the soap). */
function slideWhistle(): void {
  const t = now();
  tone(330, t, { peak: 0.11, attack: 0.04, decay: 0.3, glideTo: 1250, vibrato: [6, 10] });
  tone(1250, t + 0.36, { peak: 0.11, attack: 0.02, decay: 0.75, glideTo: 240, vibrato: [6, 14] });
}

/** A friendly toad's two croaks. */
function croak(): void {
  const t = now();
  tone(130, t, { wave: 'sawtooth', peak: 0.08, attack: 0.02, decay: 0.16, glideTo: 96, vibrato: [30, 28], lowpass: 700 });
  tone(142, t + 0.26, { wave: 'sawtooth', peak: 0.09, attack: 0.02, decay: 0.22, glideTo: 90, vibrato: [30, 28], lowpass: 700 });
}

/** The chain rattling and clanking to the floor. */
function clank(): void {
  const t = now();
  [0, 0.07, 0.13, 0.22, 0.3].forEach((d, i) => bell(560 + (i % 2) * 330, t + d, 0.06, 0.3));
  noiseBurst(t + 0.3, { freq: 900, peak: 0.1, decay: 0.12 });
  tone(120, t + 0.3, { peak: 0.18, decay: 0.2, glideTo: 60 });
}

/** One copy of the cup springing out: a pop with a little clink, rising each time. */
function cupPop(i: number): void {
  const t = now();
  tone(480 + i * 40, t, { peak: 0.14, decay: 0.08, glideTo: 1100 + i * 60 });
  bell(1600 + i * 90, t + 0.04, 0.05, 0.3);
}

/** The real cup is found: a warm rising chime with a shimmer. */
function cupChime(): void {
  const t = now();
  tone(NOTE.C4, t, { peak: 0.08, attack: 0.1, decay: 1.6 });
  [NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6, NOTE.E6].forEach((n, i) => bell(n, t + i * 0.11, 0.11, 1.3));
  noiseBurst(t + 0.3, { freq: 7000, type: 'highpass', peak: 0.03, attack: 0.3, decay: 1.2 });
}

// --------------------------------------------------------------------- art

const W = 1180;
const FLOOR = 592;

/** A gold coin lying on a heap. */
const coin = (x: number, y: number, s = 1): Node[] => [
  piece(ellipse(x, y, 14 * s, 8 * s), C.gold, { edge: 'cut', fibre: '#9a7128' }),
  piece(ellipse(x - 1, y - 1.5, 8 * s, 4 * s), C.goldLight, { edge: 'clean', shadow: false }),
];

/** A little cut-paper jewel. */
const gem = (x: number, y: number, s: number, color: string): Node =>
  piece(poly([[x, y - s], [x + s * 0.8, y], [x, y + s * 0.8], [x - s * 0.8, y]]), color, { edge: 'cut' });

/** A heap of gold: a mound with coins and jewels scattered over it. */
function heap(cx: number, base: number, w: number, h: number, seed: number, count: number): Node[] {
  const r = rng(seed);
  const out: Node[] = [
    piece(curve([[cx - w / 2, base + 12], [cx - w * 0.36, base - h * 0.45], [cx - w * 0.12, base - h], [cx + w * 0.14, base - h * 0.96], [cx + w * 0.38, base - h * 0.42], [cx + w / 2, base + 12]], 3), '#b8862f', { rough: 1.3 }),
    piece(curve([[cx - w * 0.4, base + 6], [cx - w * 0.28, base - h * 0.42], [cx - w * 0.1, base - h * 0.84], [cx + w * 0.12, base - h * 0.8], [cx + w * 0.3, base - h * 0.38], [cx + w * 0.4, base + 6]], 3), C.gold, { shadow: false }),
  ];
  for (let i = 0; i < count; i++) {
    const u = r() * 2 - 1;
    const x = cx + u * w * 0.42;
    const top = base - h * (1 - u * u) * 0.92;
    const y = top + 10 + r() * Math.max(4, base - top - 18);
    out.push(...coin(x, y, 0.75 + r() * 0.5));
  }
  const gems = [C.red, C.blue, C.green, C.rose];
  for (let i = 0; i < Math.round(count / 6); i++) {
    const u = r() * 1.4 - 0.7;
    out.push(gem(cx + u * w * 0.4, base - h * (1 - u * u) * 0.6 + r() * 20, 9 + r() * 5, gems[i % gems.length]));
  }
  return out;
}

/** A torch on the wall with a soft warm glow around it. */
const torch = (x: number, y: number): Node[] => [
  piece(ellipse(x, y - 14, 96, 84), C.candle, { edge: 'clean', shadow: false, opacity: 0.12 }),
  piece(poly([[x - 12, y + 10], [x + 12, y + 10], [x + 6, y + 64], [x - 6, y + 64]]), C.brownDark),
  piece(rect(x - 18, y, 36, 14, 3), C.greyDark),
  piece(curve([[x - 15, y + 2], [x - 11, y - 30], [x, y - 52], [x + 10, y - 28], [x + 15, y + 2]], 2), C.orange),
  piece(curve([[x - 7, y + 2], [x - 4, y - 18], [x, y - 30], [x + 4, y - 16], [x + 7, y + 2]], 2), C.candle, { shadow: false }),
];

/** The vault: stone blocks, a round iron door, torches, heaps of gold and a pedestal. */
function vault(): string {
  const r = rng(4404);
  const blocks: Node[] = [];
  const shades = ['#4d453d', '#544b42', '#483f38', '#5a5047'];
  for (let row = 0; row < 10; row++) {
    const y = 30 + row * 56;
    for (let x = row % 2 ? -60 : 0; x < W; x += 120) {
      blocks.push(piece(rect(x + 4, y + 4, 112, 48, 4), shades[Math.floor(r() * shades.length)], { rough: 0.7, shadow: false, fibre: '#6a6056' }));
    }
  }
  const bolts: Node[] = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    bolts.push(piece(circle(140 + Math.cos(a) * 136, 432 + Math.sin(a) * 136, 7), '#4e4a45', { edge: 'cut', fibre: false }));
  }
  const spokes: Node[] = [0, 60, 120].map((deg) => {
    const a = (deg * Math.PI) / 180;
    return ink([[140 - Math.cos(a) * 52, 432 - Math.sin(a) * 52], [140 + Math.cos(a) * 52, 432 + Math.sin(a) * 52]], { width: 8, color: '#4e4a45' });
  });
  const flags: Node[] = [];
  for (let x = -40; x < W; x += 150) flags.push(ink([[x + 40, FLOOR + 4], [x + 20, 680]], { width: 2.5, color: '#463e37', opacity: 0.7 }));
  const floorCoins: Node[] = [[520, 640], [700, 616], [760, 660], [610, 668], [880, 640], [330, 650]].flatMap(([x, y], i) => coin(x, y, 0.7 + (i % 3) * 0.12));

  return svg({ w: W, h: 820, name: 'b4c4-vault', boil: false, className: 'backdrop' }, [
    piece(rect(-20, -20, W + 40, 860), '#3b3530', { edge: 'clean', shadow: false }),
    ...blocks,
    // the vaulted ceiling
    piece(curve([[-40, -40], [W + 40, -40], [W + 40, 110], [900, 34], [590, 16], [280, 34], [-40, 110]], 3), '#2a2521', { rough: 1.2 }),
    ...torch(640, 150),
    ...torch(1120, 200),
    // the round iron vault door
    piece(circle(140, 432, 166), '#2e2a27', { rough: 0.8 }),
    piece(circle(140, 432, 152), '#6e6a64'),
    piece(circle(140, 432, 116), '#7d7972', { shadow: false }),
    ...bolts,
    ink(Array.from({ length: 25 }, (_, i) => [140 + Math.cos((i / 24) * Math.PI * 2) * 52, 432 + Math.sin((i / 24) * Math.PI * 2) * 52] as Pt), { width: 9, color: '#4e4a45' }),
    ...spokes,
    piece(circle(140, 432, 15), C.gold, { edge: 'cut' }),
    // heaps of gold
    ...heap(1010, FLOOR, 420, 190, 7, 44),
    ...heap(420, FLOOR, 200, 70, 9, 12),
    // the floor
    piece(rect(-20, FLOOR - 12, W + 40, 18), '#3f3832', { shadow: false }),
    piece(rect(-20, FLOOR, W + 40, 260), '#5d544b', { edge: 'clean', shadow: false }),
    ink([[-20, 640], [W + 20, 636]], { width: 2.5, color: '#463e37', opacity: 0.7 }),
    ...flags,
    piece(rect(-20, 690, W + 40, 160), '#554c44', { edge: 'clean', shadow: false }),
    ...floorCoins,
    // the stone pedestal
    piece(rect(482, 484, 116, 96, 3), C.stone),
    ink([[500, 500], [500, 566]], { width: 3, color: C.greyDark, opacity: 0.5 }),
    ink([[580, 500], [580, 566]], { width: 3, color: C.greyDark, opacity: 0.5 }),
    piece(rect(462, 466, 156, 22, 4), C.stoneLight),
    piece(rect(468, 574, 144, 24, 4), C.stoneLight),
  ]);
}

/** A gold picture frame (180 × 180) with one of the chapter's word pictures painted inside. */
function painting(word: string, canvas: string): string {
  const inner = picture(word).replace('<svg ', '<svg x="20" y="20" width="140" height="140" ');
  return svg({ w: 180, h: 180, name: 'b4c4-frame-' + word }, [
    piece(rect(4, 4, 172, 172, 4), C.gold, { rough: 1.1 }),
    piece(rect(14, 14, 152, 152, 2), '#b8862f', { edge: 'cut', fibre: false, shadow: false }),
    piece(rect(18, 18, 144, 144), canvas, { edge: 'cut', fibre: false, shadow: false }),
    raw(inner),
    ...[[10, 10], [170, 10], [10, 170], [170, 170]].map(([x, y]) => piece(circle(x, y, 9), C.goldLight, { edge: 'cut' })),
  ]);
}

/** The heap of gold Bellatrix lands in (320 × 160), put in front of her. */
function coinMound(): string {
  return svg({ w: 320, h: 160, name: 'b4c4-mound', boil: false }, [...heap(160, 150, 300, 110, 31, 26)]);
}

/** A soft golden halo (200 × 200) that sits behind the real cup. */
function halo(): string {
  return svg({ w: 200, h: 200, name: 'b4c4-halo', boil: false }, [
    piece(circle(100, 100, 96), C.candle, { edge: 'clean', shadow: false, opacity: 0.35 }),
    piece(circle(100, 100, 70), C.goldLight, { edge: 'clean', shadow: false, opacity: 0.5 }),
  ]);
}

// ----------------------------------------------------------------- helpers

/** The placed centre of an actor on the stage (ignoring its transform). */
const centre = (el: HTMLElement): Pt => [parseFloat(el.style.left) + parseFloat(el.style.width) / 2, parseFloat(el.style.top) + parseFloat(el.style.height) / 2];

/** The x/y transform that puts an actor's centre at (cx, cy). */
function offsetTo(el: HTMLElement, cx: number, cy: number): { x: number; y: number } {
  const [x0, y0] = centre(el);
  return { x: cx - x0, y: cy - y0 };
}

/** Throws a cup copy out of `from` along an arc to where it was placed. */
async function toss(k: Kit, el: HTMLElement, from: Pt, rot: number): Promise<void> {
  const { x, y } = offsetTo(el, from[0], from[1]);
  k.set(el, { x: -x, y: -y, scale: 0.2, opacity: 1, rotation: 0 });
  await k.to(el, 0.24, { x: -x * 0.5, y: -y * 0.5 - 110, scale: 0.75, rotation: rot * 2, ease: 'power1.out' });
  await k.to(el, 0.24, { x: 0, y: 0, scale: 1, rotation: rot, ease: 'power1.in' });
}

/** Bounces an actor up into the air and down onto a new spot. */
async function flyTo(k: Kit, el: HTMLElement, cx: number, cy: number, rot: number): Promise<void> {
  await k.to(el, 0.3, { y: '-=140', rotation: '+=200', ease: 'power1.out' });
  await k.to(el, 0.36, { ...offsetTo(el, cx, cy), rotation: rot, ease: 'power1.in' });
}

/** Where the copies land when they pop out of the cup: x, y, width, tilt, depth. */
const COPIES: Array<[number, number, number, number, number]> = [
  [380, 5, 80, 8, 4], // on the tree painting
  [820, 4, 80, -8, 4], // on the sail painting
  [396, 518, 86, -14, 12], // on the floor
  [950, 500, 100, -8, 9], // the pile…
  [1045, 505, 100, 10, 9],
  [470, 334, 140, 0, 9], // on the pedestal, where the real one was
  [1080, 440, 90, -14, 9],
  [905, 455, 85, 18, 9],
  [1035, 380, 85, -5, 9],
];
/** Copies in the pile that get thrown about when Bellatrix crashes in, with where they land. */
const SCATTER: Array<[number, number, number, number]> = [
  [3, 925, 552, -20],
  [4, 995, 508, 14],
  [6, 1064, 566, -8],
  [7, 870, 612, 24],
  [8, 1140, 600, 10],
];

// ------------------------------------------------------------------- story

export default defineStory({
  lines: {
    zap: { who: 'narrator', text: 'Zap! The chain drops off the vault door… and in you creep.' },
    welcome: { who: 'bellatrix', text: 'Ha ha! The golden cup is mine! Touch it… if you dare!' },
    which: { who: 'narrator', text: 'Pop, pop, pop! Cups everywhere! Which one is the real one?' },
    gloat: { who: 'bellatrix', text: 'Ha! You’ll never find it. Never, ever, ever!' },
    oof: { who: 'bellatrix', text: 'Oof! Who left a bar of soap on my floor?' },
    glow: { who: 'narrator', text: 'Thank you, toad! Look… only the real cup is glowing!' },
    cheer: { who: 'narrator', text: 'Hooray, {name}! You found the golden cup!' },
  },

  async play(k) {
    k.backdrop(vault());

    // The magic paintings on the wall.
    const tree = k.add(painting('tree', '#e8dcb8'), { x: 330, y: 80, w: 180, z: 3 });
    const sail = k.add(painting('sail', '#cfe0ea'), { x: 770, y: 79, w: 180, z: 3 });
    k.set([tree, sail], { transformOrigin: '50% 0%' });

    // The chain across the door, the cup on its pedestal, and the copies-to-be.
    const chain = k.picture('chain', { x: 0, y: 290, w: 290, z: 6 });
    const real = k.horcrux('cup', { x: 470, y: 334, w: 140, z: 9 });
    const copies = COPIES.map(([x, y, w, , z]) => k.horcrux('cup', { x, y, w, z }));
    k.set(copies, { opacity: 0 });

    // Actors who arrive later.
    const bel = k.character('bellatrix', { x: 690, y: 300, z: 10 });
    k.set(bel, { opacity: 0 });
    const hero = k.character('hero', { x: 150, y: 305, z: 11 });
    k.set(hero, { opacity: 0 });
    const toad = k.picture('toad', { x: 250, y: 518, w: 110, z: 22 });
    const soap = k.picture('soap', { x: 360, y: 540, w: 80, z: 21 });
    k.set([toad, soap], { opacity: 0 });
    const mound = k.add(coinMound(), { x: 870, y: 488, w: 320, z: 13, still: true });
    k.set(mound, { opacity: 0 });

    // A quiet vault… a few coins trickle down the heap.
    coins(8, 1.2, 0.035);
    await k.wait(1300);

    // Zap! The chain clanks off the door, and in you creep.
    await k.all(
      k.say('zap'),
      (async () => {
        k.fx.spell();
        await k.beam([0, 436], [150, 436]);
        clank();
        await k.to(chain, 0.45, { y: 150, rotation: 7, ease: 'power2.in' });
        k.fx.sneak();
        await k.enter(hero, 'left', 1.1);
      })(),
    );

    // Bellatrix pops up in a puff of smoke, cackling.
    k.fx.poof();
    k.puff(820, 440, 260, '#3d3640');
    await k.appear(bel, 0.35);
    cackle();
    await k.say('welcome', bel);

    // You reach out and touch the cup…
    await k.walk(hero, 110, 0.9, 3);
    await k.to(hero, 0.15, { rotation: 6 });
    await k.to(hero, 0.2, { rotation: 0 });

    // …and pop, pop, pop! Copies spring out everywhere.
    const from: Pt = [540, 404];
    const order = [0, 3, 2, 4, 1, 7, 6, 8];
    const flights: Promise<void>[] = [];
    for (let i = 0; i < order.length; i++) {
      const n = order[i];
      cupPop(i);
      flights.push(toss(k, copies[n], from, COPIES[n][3]).then(() => bell(2600 + Math.random() * 600, now(), 0.04, 0.25)));
      if (n === 0) void k.to(tree, 0.2, { rotation: 4 }).then(() => k.to(tree, 0.4, { rotation: 0, ease: 'back.out(3)' }));
      if (n === 1) void k.to(sail, 0.2, { rotation: -4 }).then(() => k.to(sail, 0.4, { rotation: 0, ease: 'back.out(3)' }));
      await k.wait(200);
    }
    // The real one springs into the pile, and one last copy takes its place.
    cupPop(order.length);
    k.fx.whizz();
    const realAt = offsetTo(real, 1042, 486);
    flights.push(
      k.to(real, 0.25, { x: realAt.x * 0.5, y: realAt.y * 0.5 - 140, scale: 0.8, rotation: -40, ease: 'power1.out' }).then(() =>
        k.to(real, 0.3, { ...realAt, scale: 0.68, rotation: 4, ease: 'power1.in' }),
      ),
    );
    k.set(copies[5], { opacity: 1 });
    flights.push(k.appear(copies[5], 0.4));
    await k.all(...flights, k.shake(hero, 8, 2));
    coins(10, 0.6, 0.04);
    await k.walk(hero, -60, 0.6, 2);

    await k.say('which');

    // Bellatrix dances about, gloating.
    cackle();
    await k.all(
      k.say('gloat'),
      (async () => {
        k.face(bel, true);
        await k.walk(bel, -100, 1.5, 3);
        k.face(bel, false);
        await k.hop(bel, 30, 2);
      })(),
    );

    // A toad hops in, pushing a bar of soap…
    k.set([toad, soap], { x: -420, opacity: 1 });
    k.fx.boing();
    await k.all(k.walk(toad, 420, 1.2, 3), k.to(soap, 1.2, { x: 0, ease: 'power1.out' }));
    croak();
    await k.to(toad, 0.18, { y: -36, ease: 'power2.out' });
    // …and squirts it right under Bellatrix's feet!
    k.fx.whizz();
    await k.all(k.to(toad, 0.18, { y: 0, ease: 'power2.in' }), k.to(soap, 0.6, { x: 322, rotation: 360, ease: 'power2.out' }));
    k.set(soap, { rotation: 0 });

    // She steps on it… wobble, wobble… wheee!
    await k.to(bel, 0.2, { y: -26, ease: 'power2.out' });
    await k.to(bel, 0.2, { y: 0, ease: 'power2.in' });
    k.fx.uhoh();
    await k.shake(bel, 10, 2);
    slideWhistle();
    await k.all(
      k.to(bel, 1.0, { x: 230, rotation: -20, ease: 'power2.in' }),
      k.to(soap, 1.0, { x: 652, ease: 'power2.in' }),
    );

    // Crash! Right into the pile of cups.
    k.fx.thud();
    coins(22, 1.2, 0.05);
    k.sparkle(1020, 480, 16, 170);
    for (const [n] of SCATTER) copies[n].style.zIndex = '14';
    real.style.zIndex = '15';
    k.set(mound, { opacity: 1 });
    void k.quake(6);
    void k.to(tree, 0.4, { rotation: 7, ease: 'back.out(2)' });
    void k.to(sail, 0.4, { rotation: -6, ease: 'back.out(2)' });
    await k.all(
      k.appear(mound, 0.35),
      ...SCATTER.map(([n, x, y, r]) => flyTo(k, copies[n], x, y, r)),
      flyTo(k, real, 1102, 548, 8),
      k.to(soap, 0.35, { x: 612, y: -300, rotation: 400, ease: 'power1.out' }).then(() => k.to(soap, 0.3, { y: -250, rotation: 360, ease: 'power1.in' })),
    );
    k.fx.pop();

    await k.all(k.say('oof', bel), k.shake(bel, 6, 2));
    croak();
    await k.hop(toad, 30, 2);

    // Only the real cup glows!
    cupChime();
    const glowEl = document.createElement('div');
    glowEl.style.cssText = 'position:absolute;inset:-35%;opacity:0;z-index:-1';
    glowEl.innerHTML = halo();
    real.prepend(glowEl);
    k.sparkle(1102, 548, 14, 130);
    await k.all(
      k.say('glow'),
      k.glow(C.goldLight, 0.3, 1.4),
      k.to(glowEl, 0.6, { opacity: 1, ease: 'sine.out' }),
      (async () => {
        await k.pop(real, 1.25);
        await k.wait(500);
        k.fx.fizzle();
        for (const c of copies) {
          const [cx, cy] = centre(c);
          k.puff(cx + Number(gsap.getProperty(c, 'x')), cy + Number(gsap.getProperty(c, 'y')), 110, C.goldLight);
          void k.vanish(c, 0.3);
          await k.wait(110);
        }
      })(),
    );

    // It floats over into your hands.
    k.fx.twinkle();
    await k.to(real, 1.1, { ...offsetTo(real, 470, 360), scale: 1.05, rotation: 0, ease: 'sine.inOut' });
    k.float(real, 6, 2.4);

    // Hooray!
    k.fx.jingle();
    coins(12, 0.8, 0.035);
    k.confetti(36);
    k.sparkle(470, 360, 14, 150);
    void k.shake(bel, 5, 2);
    void k.hop(toad, 30, 2).then(croak);
    await k.all(k.say('cheer'), k.hop(hero, 50, 2));
    await k.wait(1200);
  },
});
