/**
 * Book 1, chapter 4: The Great Hall Feast.
 *
 * Your tummy rumbles under the starry ceiling, but the gold plates are
 * empty. Nearly Headless Nick floats up through the table to say hello,
 * bows… and his head flops sideways (he pops it back). He starts the feast:
 * a pot, a cup, a mug, a bun and a nut pop onto the plates. He tries a bun,
 * it falls right through him, and the whole table cheers for Gryffindor,
 * throwing buns in the air.
 */
import { band, bell, C, circle, curve, defineStory, dot, ellipse, ink, type Kit, noiseBurst, NOTE, now, piece, poly, rect, rng, svg, tone, type Node, type Pt } from './kit';

// ------------------------------------------------------------------ sounds

/** A friendly ghostly "woo": a wavering glide up, then down. */
function woo(): void {
  const t = now();
  tone(330, t, { peak: 0.11, attack: 0.25, decay: 0.7, glideTo: 560, vibrato: [5, 14] });
  tone(332, t, { peak: 0.05, attack: 0.25, decay: 0.7, glideTo: 566, vibrato: [5, 14], detune: 12 });
  tone(560, t + 0.8, { peak: 0.1, attack: 0.15, decay: 0.9, glideTo: 300, vibrato: [5, 14] });
  noiseBurst(t, { freq: 600, q: 3, peak: 0.05, attack: 0.5, decay: 1.3, sweepTo: 1100 });
}

/** A hungry tummy gurgle. */
function rumble(): void {
  const t = now();
  tone(95, t, { wave: 'sawtooth', peak: 0.14, attack: 0.06, decay: 0.5, glideTo: 70, vibrato: [11, 18], lowpass: 320 });
  tone(120, t + 0.45, { wave: 'sawtooth', peak: 0.12, attack: 0.04, decay: 0.45, glideTo: 80, vibrato: [14, 22], lowpass: 360 });
  tone(82, t + 0.85, { wave: 'sawtooth', peak: 0.1, attack: 0.03, decay: 0.3, glideTo: 60, vibrato: [9, 15], lowpass: 300 });
}

/** A slide-whistle drop and a soft bonk (Nick's head flopping over). */
function flop(): void {
  const t = now();
  tone(1000, t, { peak: 0.09, attack: 0.02, decay: 0.45, glideTo: 280 });
  tone(220, t + 0.45, { wave: 'triangle', peak: 0.15, decay: 0.15, glideTo: 120 });
  tone(180, t + 0.5, { wave: 'triangle', peak: 0.07, decay: 0.45, vibrato: [16, 25], lowpass: 1200 });
}

/** A cheerful cork "plonk" (the head popping back on). */
function plonk(): void {
  const t = now();
  tone(260, t, { peak: 0.16, decay: 0.1, glideTo: 720 });
  bell(NOTE.G5, t + 0.08, 0.06, 0.5);
}

/** A plate filling up: a pop and a bell, higher each time. */
function platePop(i: number): void {
  const t = now();
  const notes = [NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6, NOTE.E6];
  const f = notes[i % notes.length];
  tone(f * 0.6, t, { peak: 0.14, decay: 0.08, glideTo: f * 1.3 });
  bell(f, t + 0.04, 0.07, 0.6);
}

/** A gulp, then a slide down (the bun falling through Nick). */
function gulp(): void {
  const t = now();
  tone(420, t, { peak: 0.12, decay: 0.12, glideTo: 180 });
  tone(900, t + 0.15, { peak: 0.07, attack: 0.02, decay: 0.4, glideTo: 300 });
}

/** The whole hall cheering: a happy crowd of "hooray"s. */
function hallCheer(): void {
  const t = now();
  noiseBurst(t, { freq: 800, q: 3, peak: 0.06, attack: 0.2, decay: 2, sweepTo: 1100 });
  noiseBurst(t + 0.1, { freq: 1500, q: 4, peak: 0.04, attack: 0.2, decay: 1.8, sweepTo: 1300 });
  const r = rng(77);
  for (let i = 0; i < 8; i++) {
    const f = 240 + r() * 220;
    const d = r() * 0.5 + (i % 2) * 0.6;
    tone(f, t + d, { wave: 'triangle', peak: 0.035, attack: 0.08, decay: 0.8, glideTo: f * 1.45, vibrato: [6, 10], lowpass: 1500 });
  }
}

// --------------------------------------------------------------------- art

/** A rounded arch outline (windows). */
function arch(x: number, y: number, w: number, h: number): Pt[] {
  const r = w / 2;
  const pts: Pt[] = [[x, y + h]];
  for (let i = 0; i <= 12; i++) {
    const a = Math.PI + (i / 12) * Math.PI;
    pts.push([x + r + Math.cos(a) * r, y + r + Math.sin(a) * r]);
  }
  pts.push([x + w, y + h]);
  return pts;
}

function stars(count: number, seed: number): Node[] {
  const r = rng(seed);
  const out: Node[] = [];
  for (let i = 0; i < count; i++) {
    const x = 50 + r() * 1080;
    const y = 10 + r() * 270;
    const s = 2 + r() * 4;
    const pts: Pt[] = [];
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4 + r() * 0.2;
      pts.push([x + Math.cos(a) * (k % 2 ? s * 0.4 : s), y + Math.sin(a) * (k % 2 ? s * 0.4 : s)]);
    }
    out.push(piece(poly(pts), r() > 0.75 ? C.goldLight : C.cream, { edge: 'cut', fibre: false, shadow: false, opacity: 0.5 + r() * 0.45 }));
  }
  return out;
}

/** One small floating candle with its glow. */
function candleNodes(x: number, y: number, s = 1): Node[] {
  return [
    piece(circle(x, y - 4 * s, 22 * s), C.candle, { edge: 'clean', shadow: false, opacity: 0.16 }),
    piece(rect(x - 5 * s, y, 10 * s, 30 * s, 2), C.cream, { edge: 'cut', fibre: false }),
    piece(curve([[x, y - 18 * s], [x + 6 * s, y - 6 * s], [x, y - 1 * s], [x - 6 * s, y - 6 * s]], 2), C.candle, { edge: 'cut', fibre: false, shadow: false }),
    piece(ellipse(x, y - 5 * s, 2.5 * s, 4 * s), C.white, { edge: 'clean', shadow: false }),
  ];
}

/** A Gryffindor-coloured banner hanging from the ledge. */
function banner(cx: number, top: number, w: number, h: number): Node[] {
  const x = cx - w / 2;
  return [
    piece(poly([[x, top], [x + w, top], [x + w, top + h], [cx, top + h - w * 0.4], [x, top + h]]), C.red, { rough: 0.8 }),
    piece(poly([[x + 7, top + 8], [x + w - 7, top + 8], [x + w - 7, top + h - 14], [cx, top + h - w * 0.4 - 8], [x + 7, top + h - 14]]), C.redDark, { edge: 'cut', fibre: false, shadow: false, opacity: 0.35 }),
    piece(rect(x + 4, top + 20, w - 8, 9), C.gold, { edge: 'cut', fibre: false }),
    piece(poly([[cx, top + 44], [cx + w * 0.22, top + 44 + w * 0.3], [cx, top + 44 + w * 0.6], [cx - w * 0.22, top + 44 + w * 0.3]]), C.gold, { edge: 'cut', fibre: false }),
    piece(rect(x - 6, top - 6, w + 12, 10, 3), C.brownDark, { edge: 'cut', fibre: false }),
  ];
}

/** The Great Hall: starry ceiling, stone wall, windows, banners and candles. */
function greatHall(): string {
  const r = rng(404);
  const blocks: Node[] = [];
  for (let row = 0; row < 8; row++) {
    const y = 330 + row * 42;
    for (let x = -60 + (row % 2) * 48; x < 1200; x += 96) {
      const shade = ['#67647a', '#56536a', '#615e75', '#5b586f'][Math.floor(r() * 4)];
      blocks.push(piece(rect(x + 3, y + 3, 90, 36, 3), shade, { edge: 'cut', fibre: false, shadow: false, opacity: 0.8 }));
    }
  }
  const win = (cx: number): Node[] => [
    piece(arch(cx - 42, 352, 84, 170), '#3c3a4c', { rough: 0.8 }),
    piece(arch(cx - 32, 362, 64, 160), '#33406e', { edge: 'cut', fibre: false }),
    ink([[cx, 366], [cx, 520]], { width: 3, color: '#26283a' }),
    ink([[cx - 32, 430], [cx + 32, 430]], { width: 3, color: '#26283a' }),
    dot(cx - 14, 400, 2.5, C.cream, 0.8),
    dot(cx + 16, 466, 2, C.cream, 0.7),
  ];
  const pillar = (x: number): Node[] => [
    piece(rect(x, -20, 64, 760), '#4a4759', { rough: 0.8 }),
    piece(rect(x + 10, -20, 12, 760), '#57546a', { edge: 'cut', fibre: false, shadow: false }),
    piece(rect(x - 10, 290, 84, 30, 4), '#3c3a4c', { edge: 'cut', fibre: false }),
  ];
  const candles: Node[] = [];
  const cr = rng(9);
  for (let i = 0; i < 16; i++) {
    const x = 90 + (i / 16) * 1000 + cr() * 50;
    const y = 70 + cr() * 190;
    candles.push(...candleNodes(x, y, 0.7 + cr() * 0.4));
  }
  return svg({ w: 1180, h: 820, name: 'b1c4-hall', boil: false, className: 'backdrop' }, [
    // The enchanted ceiling.
    piece(rect(-20, -20, 1220, 860), C.night, { edge: 'clean', shadow: false }),
    piece(curve([[100, 120], [300, 70], [520, 110], [420, 160], [180, 170]], 2), '#2c3560', { shadow: false, fibre: false, opacity: 0.8 }),
    piece(curve([[680, 200], [900, 150], [1100, 190], [980, 240], [760, 245]], 2), '#2c3560', { shadow: false, fibre: false, opacity: 0.8 }),
    ...stars(60, 12),
    piece(circle(980, 92, 40), C.cream, { rough: 0.8 }),
    piece(circle(998, 82, 34), C.night, { edge: 'cut', fibre: false, shadow: false }),
    // The stone wall.
    piece(rect(-20, 312, 1220, 420), '#504d62', { rough: 0.6 }),
    ...blocks,
    piece(rect(-20, 292, 1220, 32), '#3c3a4c', { rough: 0.8 }),
    piece(rect(-20, 318, 1220, 6), C.gold, { edge: 'cut', fibre: false, shadow: false, opacity: 0.6 }),
    ...win(450),
    ...win(730),
    ...banner(330, 324, 62, 150),
    ...banner(590, 324, 84, 190),
    ...banner(850, 324, 62, 150),
    ...pillar(-30),
    ...pillar(1146),
    ...candles,
    // The floor.
    piece(rect(-20, 640, 1220, 200), '#2f2c3a', { rough: 0.6 }),
    ink([[-20, 740], [1200, 736]], { width: 2, color: '#252330', opacity: 0.6 }),
  ]);
}

const PLATES = [310, 450, 590, 730, 870];
const TABLE_Y = 505;
/** Where Nick's mouth is on stage (the bun flies here). */
const NICK = { x: 890, y: 235 };
const MOUTH = { x: NICK.x + 130, y: NICK.y + 162 };
const PLATE_Y = 80; // in the table's own drawing

/** The long wooden house table with five empty gold plates (an actor, in front of the people). */
function table(): string {
  return svg({ w: 1180, h: 240, name: 'b1c4-table', boil: false }, [
    piece(rect(-20, 10, 1220, 112, 6), C.wood, { rough: 0.8 }),
    piece(rect(-20, 8, 1220, 10), C.tan, { edge: 'cut', fibre: false }),
    ink([[-20, 46], [400, 48], [820, 45], [1200, 47]], { width: 2, color: C.brownDark, opacity: 0.3 }),
    ink([[-20, 104], [500, 102], [1200, 105]], { width: 2, color: C.brownDark, opacity: 0.3 }),
    piece(rect(-20, 116, 1220, 62), C.brown, { rough: 0.8 }),
    piece(rect(-20, 116, 1220, 8), C.brownDark, { edge: 'cut', fibre: false, shadow: false }),
    piece(rect(-20, 176, 1220, 40), 'rgba(10,8,20,0.35)', { edge: 'cut', fibre: false, shadow: false }),
    ...PLATES.flatMap((x) => [
      piece(ellipse(x, PLATE_Y, 64, 17), C.gold),
      piece(ellipse(x, PLATE_Y - 2, 46, 11), C.goldLight, { edge: 'cut', fibre: false, shadow: false }),
    ]),
    // Two little gold goblets at the ends.
    ...[160, 1125].flatMap((x) => [
      piece(poly([[x - 16, 30], [x + 16, 30], [x + 10, 58], [x - 10, 58]]), C.gold, { edge: 'cut' }),
      piece(rect(x - 3, 56, 6, 16), C.gold, { edge: 'cut', fibre: false }),
      piece(ellipse(x, 74, 13, 5), C.gold, { edge: 'cut' }),
    ]),
  ]);
}

/** A hovering candle for the foreground (bobs gently). */
function candle(): string {
  return svg({ w: 60, h: 110, name: 'b1c4-candle', boil: false }, candleNodes(30, 40, 1.5));
}

/** A crowd of dark student silhouettes filling the hall behind the table. */
function crowd(): string {
  const col = '#3a3850';
  const nodes: Node[] = [];
  for (let i = 0; i < 16; i++) {
    const x = 300 + (i / 15) * 580;
    const y = 40 + (i % 3) * 3;
    nodes.push(piece(ellipse(x, y + 46, 26, 22), col, { edge: 'cut', fibre: false, shadow: false }));
    nodes.push(piece(circle(x, y, 17), col, { edge: 'cut', fibre: false, shadow: false }));
    if (i % 3 === 0) nodes.push(piece(poly([[x - 17, y - 8], [x + 17, y - 8], [x + 3, y - 52]]), col, { edge: 'cut', fibre: false, shadow: false }));
  }
  return svg({ w: 1180, h: 120, name: 'b1c4-crowd', boil: false }, nodes);
}

/** A cheering Gryffindor student, arms up (pops up from behind the table). */
function student(i: number): string {
  const skins = [C.skin, C.skinShade, '#b98260', C.skin, '#8a5a3b', C.skinShade];
  const hairs = ['#24212a', '#c85a28', '#6e4528', '#e0c070', '#24212a', '#6e4528'];
  const skin = skins[i % skins.length];
  const hair = hairs[i % hairs.length];
  return svg({ w: 100, h: 170, name: 'b1c4-student' + i, className: 'portrait' }, [
    piece(band([[28, 100], [14, 60], [10, 30]], 14), C.charcoal, { edge: 'cut' }),
    piece(band([[72, 100], [86, 60], [90, 30]], 14), C.charcoal, { edge: 'cut' }),
    piece(circle(10, 26, 9), skin, { edge: 'cut' }),
    piece(circle(90, 26, 9), skin, { edge: 'cut' }),
    piece(curve([[14, 175], [20, 104], [50, 90], [80, 104], [86, 175]], 2), C.charcoal),
    piece(band([[30, 98], [50, 104], [70, 98]], 12), C.red, { edge: 'cut', fibre: false }),
    piece(rect(44, 100, 12, 34, 3), C.red, { edge: 'cut', fibre: false }),
    piece(rect(44, 112, 12, 6), C.gold, { edge: 'clean', shadow: false }),
    piece(ellipse(50, 62, 26, 29), skin),
    piece(curve([[24, 60], [26, 34], [50, 28], [74, 34], [76, 60], [66, 46], [50, 42], [34, 46]], 2), hair, { fibre: false }),
    dot(41, 62, 3.2, C.ink),
    dot(59, 62, 3.2, C.ink),
    piece(ellipse(50, 77, 7, 6), C.redDark, { edge: 'cut', fibre: false, shadow: false }),
  ]);
}

// ------------------------------------------------------------------- story

export default defineStory({
  lines: {
    hall: { who: 'narrator', text: 'The Great Hall! Your tummy rumbles… but the gold plates are empty.' },
    hello: { who: 'nick', text: 'Good evening, {name}! Welcome… to Hogwarts!' },
    wobbly: { who: 'nick', text: 'Whoops! My head’s gone all floppy… hold on!' },
    feast: { who: 'nick', text: 'There we are! Now then… let the feast begin!' },
    food: { who: 'narrator', text: 'Pop, pop, pop! A pot, a cup, a mug, a bun… and a nut!' },
    through: { who: 'nick', text: 'Ha ha! Ghosts can’t eat buns… they go right through me!' },
    cheer: { who: 'nick', text: 'Hip, hip, hooray for Gryffindor!' },
  },

  async play(k) {
    k.backdrop(greatHall());
    k.music('dreamy');
    k.dim(0.22);
    k.ambient('stars', { area: [0, 0, 1180, 290], count: 24, z: 2 });

    // Floating candles that bob in front of the wall.
    for (const [x, y, p] of [[150, 150, 2.2], [420, 90, 2.6], [760, 120, 2.4], [310, 210, 2]] as const) {
      const c = k.add(candle(), { x, y, w: 50, z: 3, still: true });
      k.float(c, 10, p);
      k.light(x + 25, y + 20, 80, { flicker: true, strength: 0.5 });
    }
    const feastLight = k.light(590, 600, 480, { color: C.candle, strength: 0 });
    const crowdEl = k.add(crowd(), { x: 0, y: 430, w: 1180, h: 120, z: 4, still: true });

    // Cheering students hide behind the table until the end.
    const students = [380, 470, 560, 650, 740].map((x, i) => {
      const s = k.add(student(i), { x: x - 40 + (i % 2) * 10, y: 385 + (i % 2) * 10, w: 84, z: 5 });
      k.set(s, { y: 150, opacity: 0 });
      return s;
    });

    const hero = k.character('hero', { x: 20, y: 232, z: 10 });
    k.add(table(), { x: 0, y: TABLE_Y, w: 1180, z: 20, still: true });
    const nick = k.character('nick', { x: NICK.x, y: NICK.y, z: 12 });
    k.set(nick, { opacity: 0 });
    const head = nick.querySelector('[data-part="head"]');

    // The food, hidden until the feast begins.
    const foods = (['pot', 'cup', 'mug', 'bun', 'nut'] as const).map((word, i) => {
      const w = word === 'pot' ? 140 : 128;
      const ground = { pot: 0.875, cup: 0.82, mug: 0.865, bun: 0.825, nut: 0.85 }[word];
      const el = k.picture(word, { x: PLATES[i] - w / 2, y: TABLE_Y + PLATE_Y + 6 - ground * w, w, z: 30 });
      k.set(el, { scale: 0, opacity: 0 });
      return el;
    });
    const bun = foods[3];

    await k.camera({ zoom: 1.35, x: 590, y: 180 }, 0);
    await k.wait(700);

    // Empty plates and a rumbling tummy; the shot tilts down from the ceiling.
    rumble();
    void k.shake(hero, 4, 2);
    await k.all(k.say('hall'), k.camera({}, 2.4));

    // Nick floats up through the table.
    woo();
    k.sfx.whoosh();
    k.puff(1020, 520, 160, C.white);
    k.set(nick, { y: 220 });
    await k.all(k.to(nick, 1.4, { y: 0, opacity: 1, ease: 'power1.out' }));
    k.float(nick, 6, 2.4);
    k.light(1020, 400, 170, { color: C.sky, strength: 0.25 });
    k.sparkle(MOUTH.x, MOUTH.y, 8, 120);
    void k.camera({ zoom: 1.4, x: 960, y: 380 }, 0.9);
    await k.say('hello', nick);

    // A polite bow… and his head flops right over.
    await k.to(nick, 0.35, { rotation: 14, ease: 'power1.inOut' });
    await k.wait(150);
    if (head) {
      flop();
      await k.to(head, 0.45, { rotation: -100, svgOrigin: '150 212', ease: 'power2.in' });
      await k.to(head, 0.18, { rotation: -86, ease: 'power1.out' });
      await k.to(head, 0.18, { rotation: -96, ease: 'power1.inOut' });
    }
    await k.to(nick, 0.3, { rotation: 0, ease: 'power1.inOut' });
    void k.shake(hero, 6, 1);
    await k.say('wobbly', nick);

    // He pops it back on.
    if (head) {
      plonk();
      await k.to(head, 0.35, { rotation: -14, ease: 'back.out(3)' });
    }
    void k.pop(nick, 1.06);
    k.sparkle(MOUTH.x, MOUTH.y - 40, 8, 100);
    k.music('magic');
    await k.all(k.say('feast', nick), k.camera({}, 1.2));

    // The plates fill, one by one.
    k.sfx.sparkle();
    k.sfx.reveal();
    void k.fade(feastLight, 0.4, 0.9);
    void k.to(hero, 0.4, { rotation: 4, transformOrigin: '50% 100%' });
    for (let i = 0; i < foods.length; i++) {
      platePop(i);
      k.puff(PLATES[i], TABLE_Y + PLATE_Y - 40, 120, C.goldLight);
      await k.appear(foods[i], 0.35);
      k.sparkle(PLATES[i], TABLE_Y + PLATE_Y - 60, 6, 80);
      await k.wait(220);
    }
    void k.to(hero, 0.3, { rotation: 0 });
    void k.hop(hero, 30, 1);
    k.fx.boing();
    await k.say('food');

    // Nick tries a bun. It hops up to his mouth… and falls straight through him.
    // (The bun's middle lines up with his mouth; it then drops through his
    // see-through chest, behind him, and lands on the table in front.)
    const bunMid = TABLE_Y + PLATE_Y + 6 - 0.825 * 128 + 64;
    const toMouth = { dx: MOUTH.x - PLATES[3], dy: MOUTH.y - bunMid };
    const chest = -toMouth.dy - 80; // the part of the fall seen through Nick, above the table
    k.fx.boing();
    await k.all(
      k.to(bun, 0.8, { x: `+=${toMouth.dx}`, ease: 'none' }),
      k.to(bun, 0.4, { y: `-=${-toMouth.dy + 70}`, ease: 'power2.out' }).then(() => k.to(bun, 0.4, { y: '+=70', ease: 'power2.in' })),
    );
    gulp();
    await k.to(nick, 0.15, { scaleY: 1.04, ease: 'power1.out' });
    k.set(bun, { zIndex: 11 });
    await k.all(k.fade(nick, 0.55, 0.2), k.to(nick, 0.2, { scaleY: 1, ease: 'power1.in' }));
    await k.to(bun, 0.7, { y: `+=${chest}`, ease: 'power1.in' });
    k.set(bun, { zIndex: 30 });
    void k.fade(nick, 1, 0.4);
    await k.to(bun, 0.25, { y: `+=${-toMouth.dy - chest}`, ease: 'power2.in' });
    k.fx.thud();
    await k.to(bun, 0.1, { scaleY: 0.8, scaleX: 1.2 });
    void k.to(bun, 0.15, { scaleX: 1, scaleY: 1, ease: 'back.out(3)' });
    await k.shake(nick, 6, 2);
    await k.say('through', nick);

    // The bun bounces home.
    k.fx.boing();
    await k.all(
      k.to(bun, 0.6, { x: `-=${toMouth.dx}`, ease: 'none' }),
      k.to(bun, 0.3, { y: '-=110', ease: 'power2.out' }).then(() => k.to(bun, 0.3, { y: '+=110', ease: 'power2.in' })),
    );
    void k.pop(bun, 1.15);

    // Everyone cheers for Gryffindor!
    hallCheer();
    k.music('triumph');
    void k.hop(crowdEl, 10, 2);
    await k.all(...students.map((s, i) => k.wait(i * 90).then(() => { k.fx.pop(); return k.to(s, 0.5, { y: 0, opacity: 1, ease: 'back.out(1.6)' }); })));
    const cheering = k.say('cheer', nick);
    k.fx.jingle();
    k.confetti(36);
    await k.all(
      cheering,
      k.hop(hero, 40, 2),
      k.spin(nick, 1, 1),
      ...students.map((s, i) => k.wait(i * 80).then(() => k.hop(s, 28, 2))),
      ...foods.map((f, i) => k.wait(200 + i * 120).then(() => bounce(k, f, i === 3 ? 60 : 30))),
    );
    // Everyone throws a bun in the air.
    hallCheer();
    void k.hop(crowdEl, 10, 2);
    k.fx.boing();
    k.sparkle(590, 420, 16, 220);
    await k.all(
      ...students.map((s, i) => k.wait(i * 110).then(() => tossBun(k, s))),
      ...foods.map((f, i) => k.wait(i * 100).then(() => bounce(k, f, i === 3 ? 50 : 24))),
    );
    await k.wait(1500);
  },
});

/** A student throws a little bun up high; it tumbles down behind the table. */
async function tossBun(k: Kit<string>, student: HTMLElement): Promise<void> {
  const left = parseFloat(student.style.left) || 0;
  const top = parseFloat(student.style.top) || 0;
  const bun = k.picture('bun', { x: left + 10, y: top - 40, w: 64, z: 6 });
  await k.appear(bun, 0.2);
  await k.to(bun, 0.45, { y: '-=150', rotation: 180, ease: 'power2.out' });
  await k.to(bun, 0.55, { y: '+=330', rotation: 360, ease: 'power2.in' });
  k.remove(bun);
}

/** A food item bouncing on its plate, with a little boing for the bun. */
async function bounce(k: Kit<string>, el: HTMLElement, height: number): Promise<void> {
  if (height > 40) k.fx.boing();
  await k.hop(el, height, 1);
  await k.pop(el, 1.1);
}
