/**
 * Book 5, chapter 4: The Lost Diadem.
 *
 * The Room of Hidden Things: towering piles of old junk. Two Death Eaters
 * creep about searching; you tiptoe past. They sneak round a pile from
 * opposite sides, bonk into each other and tumble into the junk. You spot the
 * diadem sparkling on an old statue's head and take it.
 */
import { bell, C, circle, curve, defineStory, dot, ink, type Kit, noiseBurst, NOTE, now, piece, rect, rng, svg, tone, tune, type Node, type Pt } from './kit';

// ------------------------------------------------------------------ sounds

/** A tiptoe tune: soft, plucky, creeping notes. */
function sneakTune(): void {
  const t = now();
  const steps: Array<[number, number]> = [
    [NOTE.E4, 0], [NOTE.G4, 0.3], [NOTE.E4, 0.6], [NOTE.A4, 0.9], [NOTE.G4, 1.2], [NOTE.D4, 1.5],
    [NOTE.E4, 1.9], [NOTE.G4, 2.2], [NOTE.E4, 2.5], [NOTE.B4, 2.8], [NOTE.A4, 3.1], [NOTE.E4, 3.4],
  ];
  steps.forEach(([f, dt]) => {
    tone(f, t + dt, { wave: 'triangle', peak: 0.09, attack: 0.01, decay: 0.14, lowpass: 1600 });
    noiseBurst(t + dt + 0.15, { freq: 1800, q: 2, peak: 0.02, decay: 0.03 });
  });
}

/** A comic hollow bonk, then a tumble of junk. */
function bonk(): void {
  const t = now();
  tone(300, t, { wave: 'triangle', peak: 0.2, attack: 0.003, decay: 0.22, glideTo: 110, lowpass: 1200 });
  noiseBurst(t, { freq: 500, q: 0.8, peak: 0.12, attack: 0.002, decay: 0.08, type: 'lowpass' });
  tone(900, t + 0.28, { wave: 'sine', peak: 0.07, attack: 0.01, decay: 0.3, glideTo: 380, vibrato: [8, 20] });
}

function clatter(): void {
  const t = now();
  const r = rng(51);
  for (let i = 0; i < 12; i++) {
    const at = t + 0.1 + i * 0.09 + r() * 0.05;
    noiseBurst(at, { freq: 700 + r() * 2200, q: 2.5, peak: 0.07, attack: 0.002, decay: 0.07, type: 'bandpass' });
    if (i % 3 === 0) tone(180 + r() * 260, at, { wave: 'triangle', peak: 0.07, decay: 0.12, lowpass: 1400 });
  }
}

/** The diadem's glittery chime. */
function glitter(): void {
  const t = now();
  [NOTE.E6, NOTE.G6, NOTE.C7, NOTE.G6, NOTE.C7, NOTE.G6].forEach((f, i) => bell(f, t + i * 0.11, 0.08, 1.1));
  tune([[NOTE.C5, 0.1], [NOTE.G5, 0.3], [NOTE.E6, 0.55]], 0.05, 1.2);
}

// --------------------------------------------------------------------- art

/** A heap of old junk: a wobbly mound of boxes, chair legs, books and lamps. */
function pile(x: number, base: number, w: number, h: number, seed: number, shades: string[]): Node[] {
  const r = rng(seed);
  const nodes: Node[] = [];
  nodes.push(piece(curve([[x, base], [x + w * 0.08, base - h * 0.5], [x + w * 0.3, base - h * 0.85], [x + w * 0.5, base - h], [x + w * 0.72, base - h * 0.8], [x + w * 0.94, base - h * 0.45], [x + w, base]], 2), shades[0], { rough: 1.4 }));
  for (let i = 0; i < 11; i++) {
    const px = x + w * (0.1 + r() * 0.7);
    const py = base - h * (0.08 + r() * 0.72);
    const bw = 40 + r() * 46;
    const bh = 18 + r() * 24;
    nodes.push(piece(rect(px, py, bw, bh, 3), shades[1 + Math.floor(r() * (shades.length - 1))], { edge: 'cut', fibre: false, rough: 0.8 }));
  }
  // an upside-down chair with legs in the air
  const cx = x + w * 0.5;
  const cy = base - h * 0.96;
  nodes.push(piece(rect(cx - 26, cy - 8, 52, 12, 2), C.wood, { edge: 'cut' }));
  for (const dx of [-22, -8, 8, 22]) nodes.push(ink([[cx + dx, cy - 8], [cx + dx * 1.3, cy - 58]], { width: 5, color: C.brownDark }));
  return nodes;
}

function room(): string {
  const wall = '#4a4258';
  const wallDark = '#38314a';
  const r = rng(54);
  const shelves: Node[] = [];
  for (let i = 0; i < 6; i++) {
    shelves.push(piece(rect(60 + i * 190, 40, 150, 10, 2), wallDark, { edge: 'cut', fibre: false, shadow: false }));
    shelves.push(piece(rect(70 + i * 190 + r() * 30, 20 + r() * 8, 26 + r() * 20, 22, 2), [C.redDark, C.blueDark, C.greenDark, C.plum][i % 4], { edge: 'cut', fibre: false, shadow: false }));
  }
  const dust: Node[] = [];
  for (let i = 0; i < 14; i++) dust.push(dot(60 + r() * 1060, 70 + r() * 360, 1.5 + r() * 2, C.cream, 0.25 + r() * 0.3));
  return svg({ w: 1180, h: 820, name: 'b5c4-room', boil: false, className: 'backdrop' }, [
    piece(rect(-20, -20, 1220, 860), wall, { edge: 'clean', shadow: false }),
    // far wall of tall, dim junk
    piece(curve([[-20, 600], [-20, 300], [140, 230], [330, 270], [520, 200], [760, 250], [960, 190], [1200, 280], [1200, 600]], 2), wallDark, { rough: 1.4 }),
    ...shelves,
    ...dust,
    // a high round window of dim light
    piece(circle(590, 120, 56), C.brownDark, { edge: 'cut' }),
    piece(circle(590, 120, 44), '#6d6a8a', { edge: 'cut', fibre: false, shadow: false }),
    ink([[590, 76], [590, 164]], { width: 4, color: C.brownDark }),
    ink([[546, 120], [634, 120]], { width: 4, color: C.brownDark }),
    // floor
    piece(curve([[-40, 860], [-40, 612], [300, 600], [590, 596], [880, 600], [1220, 612], [1220, 860]], 2), '#6a5642', { rough: 1.2 }),
    // junk piles
    ...pile(-30, 620, 400, 400, 11, [C.brownDark, C.wood, C.blueDark, C.redDark, C.tan, C.greenDark]),
    ...pile(420, 610, 270, 250, 23, [C.brownDark, C.wood, C.plum, C.sand, C.teal]),
    ...pile(1020, 620, 220, 330, 37, [C.brownDark, C.wood, C.redDark, C.blueDark, C.tan]),
  ]);
}

/** An old stone statue on a plinth, 200 × 420; the head is at about (100, 96). */
function statueArt(): string {
  return svg({ w: 200, h: 420, name: 'b5c4-statue', label: 'an old statue' }, [
    piece(rect(30, 360, 140, 56, 4), C.stone),
    piece(rect(44, 350, 112, 20, 3), C.slate, { edge: 'cut' }),
    piece(curve([[56, 354], [50, 240], [76, 160], [124, 160], [150, 240], [144, 354]], 2), C.stone),
    piece(curve([[56, 200], [30, 250], [40, 300], [60, 270]], 2), C.slate, { fibre: false }),
    piece(curve([[144, 200], [170, 250], [160, 300], [140, 270]], 2), C.slate, { fibre: false }),
    piece(rect(88, 138, 24, 30), C.stone, { edge: 'cut', fibre: false }),
    piece(curve([[68, 100], [72, 62], [100, 50], [128, 62], [132, 100], [120, 140], [80, 140]], 2), C.stone),
    ...[85, 115].map((x) => ink([[x - 7, 96], [x + 7, 96]], { width: 3.5, color: C.slate })),
    ink([[90, 120], [110, 120]], { width: 3, color: C.slate }),
    // wavy stone hair
    piece(curve([[66, 90], [70, 52], [100, 40], [130, 52], [134, 90], [120, 66], [100, 60], [80, 66]], 2), C.grey, { fibre: false }),
  ]);
}

/** A small soft glow behind the diadem, 240 × 240. */
function haloArt(): string {
  return svg({ w: 240, h: 240, name: 'b5c4-halo', boil: false }, [
    piece(circle(120, 120, 116), C.goldLight, { edge: 'cut', fibre: false, shadow: false, opacity: 0.2 }),
    piece(circle(120, 120, 78), C.candle, { edge: 'cut', fibre: false, shadow: false, opacity: 0.3 }),
  ]);
}

// -------------------------------------------------------------------- story

const STATUE = { x: 860, y: 215, w: 200 };
/** Where the diadem sits on the statue's head (top-left of its box). */
const DIADEM = { x: 910, y: 245, w: 100 };
const DIADEM_C: Pt = [960, 295];

export default defineStory({
  lines: {
    room: { who: 'narrator', text: 'The Room of Hidden Things! Junk is piled up high. Look, a toy shark and a hammer!' },
    hush: { who: 'deatheater', text: 'Shh… search quietly. That lost diadem must be in here somewhere…' },
    tiptoe: { who: 'narrator', text: 'Two Death Eaters are searching! Tiptoe past them, nice and quietly…' },
    round: { who: 'narrator', text: 'Uh-oh! They creep round the big pile from opposite sides…' },
    ow: { who: 'deatheater', text: 'Oof! Ow! Watch where you’re going, you big lump!' },
    storm: { who: 'narrator', text: 'Bonk! They tumble into the junk, and a storm of old chairs falls down!' },
    found: { who: 'narrator', text: 'Look! The lost diadem sparkles on the statue’s head. Hooray, {name}!' },
  },

  async play(k: Kit) {
    k.backdrop(room());

    // The five words, as bits of junk in the piles.
    const junk = [
      k.picture('shark', { x: 70, y: 255, w: 130, z: 6 }),
      k.picture('corn', { x: 230, y: 400, w: 105, z: 6 }),
      k.picture('hammer', { x: 500, y: 330, w: 115, z: 6 }),
      k.picture('boil', { x: 1040, y: 330, w: 110, z: 6 }),
      k.picture('storm', { x: 1050, y: 470, w: 90, z: 6 }),
    ];

    k.add(statueArt(), { ...STATUE, z: 7, still: true });
    const halo = k.add(haloArt(), { x: DIADEM.x - 70, y: DIADEM.y - 60, w: 240, z: 8 });
    k.set(halo, { opacity: 0 });
    const diadem = k.horcrux('diadem', { ...DIADEM, z: 9 });
    k.set(diadem, { opacity: 0 });

    const hero = k.character('hero', { x: 40, y: 420, w: 230, z: 20 });
    const de1 = k.character('deatheater', { x: 170, y: 330, w: 190, z: 8 });
    const de2 = k.character('deatheater', { x: 700, y: 330, w: 190, z: 8, flip: true });
    k.set([hero, de1, de2], { opacity: 0 });

    await k.wait(700);
    k.fx.creak();
    await k.say('room');

    // The Death Eaters creep in.
    k.fx.sneak();
    await k.all(k.appear(de1, 0.5), k.appear(de2, 0.5));
    await k.all(k.say('hush', de1), k.walk(de1, 40, 2, 4), k.walk(de2, -40, 2, 4));

    // You tiptoe past.
    k.fx.whizz();
    await k.appear(hero, 0.4);
    sneakTune();
    await k.all(k.say('tiptoe'), k.walk(hero, 640, 3.4, 12));
    await k.wait(200);

    // They sneak round the pile from both sides.
    k.fx.sneak();
    const round = k.say('round');
    await k.all(round, k.walk(de1, 190, 2.2, 8), k.walk(de2, -150, 2.2, 8));

    // Bonk!
    bonk();
    k.quake(5);
    k.puff(520, 400, 130, C.white);
    k.sparkle(520, 380, 8, 90);
    await k.all(k.shake(de1, 10, 3), k.shake(de2, 10, 3));
    clatter();
    k.fx.crash();
    const tumbles = [
      k.to(de1, 0.7, { x: '-=70', y: '+=110', rotation: -78, ease: 'power2.in' }),
      k.to(de2, 0.7, { x: '+=40', y: '+=110', rotation: 78, ease: 'power2.in' }),
      ...junk.slice(0, 3).map((j, i) => k.to(j, 0.9, { y: '+=80', rotation: i % 2 ? 160 : -160, ease: 'bounce.out' })),
    ];
    await k.all(k.say('ow', de1), ...tumbles);
    k.fx.thud();
    k.puff(450, 560, 200, C.grey);
    await k.say('storm');
    await k.hop(hero, 30, 2);

    // The diadem sparkles on the statue.
    await k.walk(hero, 60, 0.8, 3);
    glitter();
    k.sfx.reveal();
    k.set(diadem, { opacity: 0 });
    await k.all(k.appear(diadem, 0.5), k.fade(halo, 1, 0.8));
    k.float(diadem, 6, 1.6);
    k.sparkle(DIADEM_C[0], DIADEM_C[1], 16, 130);
    await k.say('found');

    // You take it, and a big happy finish.
    k.sfx.gem();
    await k.all(
      k.to(diadem, 0.9, { x: '-=170', y: '+=220', scale: 0.8, ease: 'power2.inOut' }),
      k.fade(halo, 0, 0.9),
    );
    k.fx.jingle();
    k.confetti(36);
    k.sparkle(800, 520, 14, 160);
    await k.all(k.hop(hero, 50, 2), k.shake(de1, 4, 2));
    await k.wait(500);
  },
});
