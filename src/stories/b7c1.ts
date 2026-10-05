/**
 * Book 7, chapter 1: Kreacher’s Kitchen.
 *
 * The old basement kitchen at Grimmauld Place, spotless now. Friendly Kreacher
 * cooks with flying pans, a pie dings out of the oven and goes into the picnic
 * basket. The basket wiggles: a rabbit and a kitten pop out. Kreacher bows,
 * "happy to serve", and everyone shares a picnic on a carpet.
 */
import { gsap } from 'gsap';
import { stepped } from '../ui/anim';
import { bell, C, circle, curve, defineStory, dot, ellipse, ink, type Kit, noiseBurst, NOTE, now, piece, poly, rect, rng, svg, tone, type Node } from './kit';

// ------------------------------------------------------------------ sounds

/** A soft sizzling pan: gentle crackly hiss. */
function sizzle(): void {
  const t = now();
  noiseBurst(t, { freq: 6000, q: 0.6, peak: 0.05, attack: 0.1, decay: 1.4, type: 'highpass' });
  const r = rng(31);
  for (let i = 0; i < 14; i++) noiseBurst(t + 0.05 + i * 0.09 + r() * 0.05, { freq: 3000 + r() * 3000, q: 3, peak: 0.04, decay: 0.03 });
}

/** The oven timer: a bright double ding. */
function ding(): void {
  const t = now();
  bell(NOTE.E6, t, 0.14, 1.2);
  bell(NOTE.E6, t + 0.28, 0.14, 1.4);
}

/** A tiny kitten mew. */
function mew(): void {
  const t = now();
  tone(900, t, { wave: 'triangle', peak: 0.08, attack: 0.04, decay: 0.3, glideTo: 1500, lowpass: 3500, vibrato: [8, 20] });
  tone(1400, t + 0.2, { wave: 'triangle', peak: 0.06, attack: 0.02, decay: 0.25, glideTo: 800, lowpass: 3000 });
}

/** A rabbit’s soft double thump. */
function thump(): void {
  const t = now();
  for (const dt of [0, 0.16]) {
    tone(110, t + dt, { peak: 0.2, attack: 0.005, decay: 0.14, glideTo: 55, lowpass: 400 });
    noiseBurst(t + dt, { freq: 200, q: 0.8, peak: 0.08, decay: 0.08, type: 'lowpass' });
  }
}

// --------------------------------------------------------------------- art

const WALL = '#8a7d70';
const WALL_DARK = '#6f6358';
const IRON = '#4b4f58';
const FUR = '#b9a994';
const FUR_DARK = '#9a8a76';

/** The cleaned-up basement kitchen. */
function kitchen(): string {
  const r = rng(71);
  const bricks: Node[] = [];
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 9; col++) {
      if (r() < 0.45) bricks.push(piece(rect(col * 140 + (row % 2) * 60 - 20, 80 + row * 70, 120, 56, 3), r() < 0.5 ? WALL_DARK : '#7e7266', { edge: 'cut', fibre: false, shadow: false, opacity: 0.45 }));
    }
  }
  const pots: Node[] = [];
  [[70, C.brown], [150, '#a8794a'], [226, IRON]].forEach(([x, col], i) => {
    pots.push(piece(rect(x as number, 232 - i * 8, 62, 46 + i * 8, 6), col as string, { edge: 'cut' }));
    pots.push(piece(rect((x as number) - 4, 228 - i * 8, 70, 8, 3), C.brownDark, { edge: 'cut', fibre: false }));
  });
  return svg({ w: 1180, h: 820, name: 'b7c1-kitchen', boil: false, className: 'backdrop' }, [
    piece(rect(-20, -20, 1220, 860), WALL, { edge: 'clean', shadow: false }),
    ...bricks,
    // little high window with a bright sky
    piece(rect(470, 70, 190, 130, 6), C.brownDark),
    piece(rect(482, 82, 166, 106), C.sky, { edge: 'cut', fibre: false }),
    piece(rect(561, 82, 8, 106), C.brownDark, { edge: 'cut', fibre: false }),
    piece(ellipse(520, 120, 26, 9), C.white, { edge: 'cut', fibre: false, shadow: false, opacity: 0.8 }),
    // shelf with pots
    piece(rect(50, 276, 270, 14, 3), C.wood),
    ...pots,
    ...[100, 270].map((x) => piece(poly([[x - 6, 290], [x + 6, 290], [x, 318]]), C.wood, { edge: 'cut', fibre: false })),
    // hanging copper pans on the wall
    ...[[380, C.orange], [430, C.gold]].map(([x, col]) => group3(x as number, col as string)),
    // oven (right)
    piece(rect(950, 250, 220, 330, 10), IRON),
    piece(rect(970, 300, 180, 180, 10), C.night, { edge: 'cut' }),
    piece(curve([[990, 470], [990, 380], [1060, 330], [1130, 380], [1130, 470]], 2), '#2a1d16', { edge: 'cut', fibre: false }),
    piece(curve([[1004, 466], [1004, 388], [1060, 346], [1116, 388], [1116, 466]], 2), C.orange, { edge: 'cut', fibre: false, shadow: false, opacity: 0.55 }),
    ...[995, 1060, 1125].map((x) => piece(circle(x, 275, 9), C.stone, { edge: 'cut', fibre: false })),
    piece(rect(940, 238, 240, 16, 4), C.wood),
    piece(rect(980, 575, 30, 16), IRON, { edge: 'cut' }),
    piece(rect(1110, 575, 30, 16), IRON, { edge: 'cut' }),
    // floor: flagstones
    piece(curve([[-40, 860], [-40, 590], [300, 580], [590, 576], [880, 580], [1220, 590], [1220, 860]], 2), '#9c8f80', { rough: 1.2 }),
    ...[0, 1, 2].flatMap((row) => [0, 1, 2, 3, 4, 5].map((col) => piece(rect(col * 210 - 30 + (row % 2) * 100, 600 + row * 62, 190, 50, 4), '#a89c8d', { edge: 'cut', fibre: false, shadow: false, opacity: 0.55 }))),
    // the scrubbed kitchen table
    piece(rect(560, 478, 340, 24, 4), C.wood),
    piece(rect(580, 500, 22, 100), C.brownDark, { edge: 'cut', fibre: false }),
    piece(rect(858, 500, 22, 100), C.brownDark, { edge: 'cut', fibre: false }),
  ]);
}

/** A hanging pan, drawn into the backdrop. */
function group3(x: number, col: string): Node {
  return piece(circle(x, 170, 26), col, { edge: 'cut' });
}

/** A frying pan, 200 × 110. */
function panArt(col: string): string {
  return svg({ w: 200, h: 110, name: 'b7c1-pan-' + col.replace('#', ''), label: 'a flying pan' }, [
    piece(rect(120, 44, 76, 14, 6), C.brownDark, { edge: 'cut', fibre: false }),
    piece(ellipse(66, 56, 62, 40), IRON),
    piece(ellipse(66, 52, 50, 28), col, { edge: 'cut', fibre: false, shadow: false }),
    piece(ellipse(50, 46, 14, 7, -15), C.cream, { edge: 'cut', fibre: false, shadow: false, opacity: 0.35 }),
  ]);
}

/** A golden pie, 200 × 120. */
function pieArt(): string {
  const slits: Node[] = [-40, 0, 40].map((dx) => ink([[100 + dx - 10, 40], [100 + dx + 10, 50]], { width: 4, color: C.brownDark }));
  return svg({ w: 200, h: 120, name: 'b7c1-pie', label: 'a pie' }, [
    piece(ellipse(100, 92, 90, 20), C.tan),
    piece(curve([[14, 88], [26, 52], [100, 24], [174, 52], [186, 88], [100, 108]], 2), C.gold),
    piece(curve([[40, 80], [60, 56], [100, 40], [140, 56], [160, 80], [100, 92]], 2), C.goldLight, { fibre: false, shadow: false, opacity: 0.6 }),
    ...slits,
    // steam
    ink([[70, 20], [64, 8], [72, -2]], { width: 3, color: C.white }),
    ink([[130, 20], [136, 8], [128, -2]], { width: 3, color: C.white }),
  ]);
}

/** The back half of the picnic basket (its handle and dark inside), 240 × 200. */
function basketBack(): string {
  return svg({ w: 240, h: 200, name: 'b7c1-basket-back', label: 'a picnic basket' }, [
    piece(curve([[40, 70], [50, 8], [120, -4], [190, 8], [200, 70], [182, 70], [172, 22], [120, 12], [68, 22], [58, 70]], 2), C.brown, { edge: 'cut', fibre: false }),
    piece(ellipse(120, 78, 100, 20), '#2a1d16', { edge: 'cut', fibre: false }),
  ]);
}

/** The front of the basket: woven body with a gingham cloth, 240 × 200. */
function basketFront(): string {
  const weave: Node[] = [];
  for (let i = 0; i < 6; i++) weave.push(ink([[26 + i * 8, 100 + i * 18], [214 - i * 8, 100 + i * 18]], { width: 3, color: C.brownDark }));
  for (let i = 0; i < 7; i++) weave.push(ink([[40 + i * 27, 90], [48 + i * 24, 196]], { width: 3, color: C.brownDark }));
  return svg({ w: 240, h: 200, name: 'b7c1-basket-front' }, [
    piece(curve([[14, 84], [120, 100], [226, 84], [200, 190], [120, 198], [40, 190]], 2), '#c58f52'),
    ...weave,
    piece(curve([[8, 82], [40, 108], [80, 84], [120, 110], [160, 84], [200, 108], [232, 82], [226, 94], [120, 120], [14, 94]], 1), C.red, { edge: 'cut', fibre: false }),
  ]);
}

/** A grey-brown rabbit, 160 × 200. */
function rabbitArt(): string {
  return svg({ w: 160, h: 200, name: 'b7c1-rabbit', label: 'a rabbit' }, [
    piece(ellipse(56, 56, 14, 48, -10), FUR),
    piece(ellipse(104, 56, 14, 48, 10), FUR),
    piece(ellipse(56, 58, 7, 36, -10), C.pink, { edge: 'cut', fibre: false, shadow: false }),
    piece(ellipse(104, 58, 7, 36, 10), C.pink, { edge: 'cut', fibre: false, shadow: false }),
    piece(ellipse(80, 150, 56, 44), FUR),
    piece(circle(138, 170, 14), C.white, { edge: 'cut' }),
    piece(ellipse(80, 168, 34, 22), C.cream, { fibre: false, shadow: false }),
    piece(circle(80, 112, 38), FUR),
    piece(ellipse(80, 126, 22, 16), C.cream, { fibre: false, shadow: false }),
    dot(66, 106, 4.5, C.ink), dot(94, 106, 4.5, C.ink),
    piece(ellipse(80, 118, 6, 4), C.pink, { edge: 'cut', fibre: false, shadow: false }),
    ink([[80, 122], [80, 130]], { width: 2 }),
    ink([[80, 130], [72, 134]], { width: 2 }),
    ink([[80, 130], [88, 134]], { width: 2 }),
    piece(ellipse(52, 186, 22, 10), FUR_DARK, { fibre: false }),
    piece(ellipse(108, 186, 22, 10), FUR_DARK, { fibre: false }),
  ]);
}

/** A stripy ginger kitten, 160 × 160. */
function kittenArt(): string {
  const ginger = '#e0a060';
  return svg({ w: 160, h: 160, name: 'b7c1-kitten', label: 'a kitten' }, [
    piece(curve([[118, 130], [152, 116], [150, 70], [140, 74], [142, 108], [114, 116]], 2), ginger),
    piece(ellipse(80, 114, 44, 36), ginger),
    ink([[56, 90], [60, 102]], { width: 4, color: '#b87838' }),
    ink([[80, 86], [80, 100]], { width: 4, color: '#b87838' }),
    ink([[104, 90], [100, 102]], { width: 4, color: '#b87838' }),
    piece(ellipse(60, 146, 14, 8), C.cream, { fibre: false }),
    piece(ellipse(100, 146, 14, 8), C.cream, { fibre: false }),
    piece(poly([[40, 56], [44, 20], [68, 44]]), ginger, { edge: 'cut' }),
    piece(poly([[120, 56], [116, 20], [92, 44]]), ginger, { edge: 'cut' }),
    piece(poly([[46, 50], [48, 30], [60, 44]]), C.pink, { edge: 'cut', fibre: false, shadow: false }),
    piece(poly([[114, 50], [112, 30], [100, 44]]), C.pink, { edge: 'cut', fibre: false, shadow: false }),
    piece(circle(80, 70, 40), ginger),
    piece(ellipse(80, 84, 20, 14), C.cream, { fibre: false, shadow: false }),
    dot(64, 66, 6, C.greenDark), dot(96, 66, 6, C.greenDark),
    dot(64, 66, 3, C.ink), dot(96, 66, 3, C.ink),
    piece(poly([[75, 76], [85, 76], [80, 82]]), C.pink, { edge: 'cut', fibre: false, shadow: false }),
    ink([[48, 80], [26, 76]], { width: 1.8, color: C.cream }), ink([[48, 86], [26, 90]], { width: 1.8, color: C.cream }),
    ink([[112, 80], [134, 76]], { width: 1.8, color: C.cream }), ink([[112, 86], [134, 90]], { width: 1.8, color: C.cream }),
  ]);
}

/** A red and cream picnic carpet, 560 × 130. */
function carpetArt(): string {
  const stripes: Node[] = [];
  for (let i = 0; i < 6; i++) stripes.push(piece(rect(60 + i * 76, 28, 38, 74, 2), C.cream, { edge: 'cut', fibre: false, shadow: false, opacity: 0.5 }));
  return svg({ w: 560, h: 130, name: 'b7c1-carpet', label: 'a carpet' }, [
    piece(poly([[40, 10], [520, 10], [552, 118], [8, 118]]), C.redDark),
    piece(poly([[58, 22], [502, 22], [526, 106], [34, 106]]), C.red, { edge: 'cut', fibre: false, shadow: false }),
    ...stripes,
    piece(poly([[58, 22], [502, 22], [526, 106], [34, 106]]), C.gold, { edge: 'cut', fibre: false, shadow: false, opacity: 0.12 }),
    ...[0, 1, 2, 3, 4, 5, 6].map((i) => dot(80 + i * 66, 64, 9, C.gold, 0.9)),
  ]);
}

// ------------------------------------------------------------------ helpers

/** Keeps a pan swinging side to side (not in calm mode). */
function swing(k: Kit, el: HTMLElement, i: number): void {
  if (k.calm) return;
  const d = 0.7 + i * 0.12;
  gsap.to(el, { rotation: i % 2 ? 14 : -14, y: '+=22', duration: d, yoyo: true, repeat: -1, ease: stepped(d, 'sine.inOut') });
}

// -------------------------------------------------------------------- story

const BASKET = { x: 650, y: 330, w: 200 };

const WORDS: Array<[string, number, number]> = [
  ['rabbit', 60, 40],
  ['basket', 260, 110],
  ['carpet', 515, 20],
  ['kitten', 730, 110],
  ['picnic', 930, 40],
];
const PIC_W = 150;

export default defineStory({
  lines: {
    peek: { who: 'narrator', text: 'You peek into the old basement kitchen. It’s sparkling clean now!' },
    cook: { who: 'kreacher', text: 'Kreacher has been cooking all morning! Mind the flying pans!' },
    pie: { who: 'narrator', text: 'Sizzle, sizzle… ding! A golden pie pops out of the oven.' },
    pack: { who: 'kreacher', text: 'A pie for the picnic basket. Kreacher is very proud!' },
    pop: { who: 'narrator', text: 'Wait… the basket is wiggling! A rabbit and a kitten pop out!' },
    serve: { who: 'kreacher', text: 'Kreacher is happy to serve.' },
    picnic: { who: 'narrator', text: 'You spread the carpet and share a yummy picnic. Hooray!' },
  },

  async play(k) {
    k.backdrop(kitchen());

    const hero = k.character('hero', { x: 60, y: 330, z: 20 });
    const kreacher = k.character('kreacher', { x: 380, y: 322, w: 270, z: 20 });
    k.set([hero, kreacher], { opacity: 0 });

    await k.wait(600);
    k.sfx.whoosh();
    await k.enter(hero, 'left');
    await k.say('peek');

    // Kreacher bustles in; the pans fly up and swing about.
    k.sfx.whoosh();
    await k.enter(kreacher, 'bottom');
    const pans = [
      k.add(panArt(C.gold), { x: 240, y: 70, w: 160, z: 15 }),
      k.add(panArt(C.orange), { x: 560, y: 40, w: 170, z: 15, flip: true }),
      k.add(panArt(C.goldLight), { x: 800, y: 90, w: 150, z: 15 }),
    ];
    pans.forEach((p) => k.set(p, { opacity: 0 }));
    sizzle();
    await k.all(...pans.map((p, i) => k.wait(i * 160).then(() => { k.fx.pop(); return k.appear(p, 0.3); })));
    pans.forEach((p, i) => swing(k, p, i));
    k.sparkle(640, 140, 8, 280);
    await k.all(k.say('cook', kreacher), k.hop(hero, 20, 2));

    // The oven dings and out comes a pie.
    ding();
    void k.glow(C.orange, 0.2, 1.2);
    const pie = k.add(pieArt(), { x: 1010, y: 360, w: 130, z: 18 });
    k.set(pie, { opacity: 0, transformOrigin: '50% 100%' });
    await k.appear(pie, 0.3);
    k.fx.pop();
    k.puff(1060, 360, 90, C.white);
    const pieDone = k.say('pie');
    await k.wait(900);
    await k.to(pie, 1.2, { x: -325, y: -30, rotation: -8, ease: 'sine.inOut' });
    await pieDone;

    // The basket appears; the pie is packed in.
    const back = k.add(basketBack(), { ...BASKET, z: 12 });
    const front = k.add(basketFront(), { ...BASKET, z: 16 });
    k.set([back, front], { opacity: 0 });
    k.fx.pop();
    await k.all(k.appear(back, 0.3), k.appear(front, 0.3));
    pans.forEach((p) => gsap.killTweensOf(p));
    await k.all(k.say('pack', kreacher), k.wait(200).then(async () => {
      await k.to(pie, 0.7, { x: -325, y: 30, scale: 0.6, ease: 'power2.in' });
      k.remove(pie);
      k.fx.thud();
    }));
    await k.wait(300);

    // The basket wiggles. A rabbit and a kitten pop out!
    const popped = k.say('pop');
    await k.shake(front, 8, 3);
    mew();
    const kit = k.add(kittenArt(), { x: 690, y: 330, w: 100, z: 14 });
    const rab = k.add(rabbitArt(), { x: 760, y: 280, w: 100, z: 14 });
    k.set([kit, rab], { opacity: 0 });
    await k.appear(kit, 0.2);
    await k.to(kit, 0.4, { y: -70, rotation: -10, ease: 'back.out(2)' });
    k.fx.boing();
    thump();
    await k.appear(rab, 0.2);
    await k.to(rab, 0.4, { y: -50, rotation: 8, ease: 'back.out(2)' });
    k.sparkle(750, 290, 10, 120);
    void k.hop(hero, 36, 2);
    await popped;

    // Kreacher smiles and bows.
    await k.to(kreacher, 0.5, { rotation: 14, y: 20, transformOrigin: '50% 100%', ease: 'sine.inOut' });
    await k.all(k.say('serve', kreacher), k.wait(0));
    await k.to(kreacher, 0.4, { rotation: 0, y: 0, ease: 'sine.inOut' });
    k.sfx.sparkle();
    k.sparkle(480, 400, 10, 100);

    // The picnic on the carpet.
    const carpet = k.add(carpetArt(), { x: 40, y: 560, w: 600, z: 8 });
    k.set(carpet, { opacity: 0, x: -400 });
    k.sfx.whoosh();
    await k.to(carpet, 0.7, { opacity: 1, x: 0, ease: 'power2.out' });
    const sayPicnic = k.say('picnic');
    k.fx.whizz();
    k.puff(750, 330, 120, C.white);
    k.remove(kit);
    k.remove(rab);
    const kit2 = k.add(kittenArt(), { x: 290, y: 570, w: 90, z: 25 });
    const rab2 = k.add(rabbitArt(), { x: 630, y: 515, w: 100, z: 25 });
    k.set([kit2, rab2], { opacity: 0 });
    mew();
    await k.all(k.appear(kit2, 0.3), k.appear(rab2, 0.3));
    thump();
    void k.hop(kit2, 24, 2);
    await k.hop(rab2, 30, 2);
    const pics = WORDS.map(([w, x, y]) => {
      const p = k.picture(w, { x, y, w: PIC_W, z: 30 });
      k.set(p, { opacity: 0 });
      return p;
    });
    for (const [i, p] of pics.entries()) {
      k.fx.pop();
      await k.appear(p, 0.3);
      k.float(p, 6, 1.6 + i * 0.15);
      await k.wait(160);
    }
    await sayPicnic;

    // Happy ending.
    k.fx.jingle();
    k.confetti(36);
    k.sparkle(300, 560, 14, 260);
    await k.all(k.hop(hero, 50, 2), k.hop(kreacher, 24, 2), k.hop(kit2, 30, 2), k.hop(rab2, 30, 2));
    await k.wait(900);
  },
});
