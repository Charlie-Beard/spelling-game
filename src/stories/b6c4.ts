/**
 * Book 6, chapter 4: The Great Snake (Horcrux: Nagini).
 *
 * A gloomy throne room with paper candles and a spiky throne. Nagini slithers
 * in, swaying and hissing. Hedwig hoots a soft lullaby; Nagini yawns, curls into
 * a big coil and snores. The Horcrux glows on her and you tiptoe off. Nobody is hurt.
 */
import { gsap } from 'gsap';
import { stepped } from '../ui/anim';
import { C, circle, curve, defineStory, ellipse, ink, type Kit, noiseBurst, NOTE, now, piece, poly, rect, rng, svg, tone, tune, type Node } from './kit';

// ------------------------------------------------------------------ sounds

/** A long, soft, hissing "ssss" made of filtered noise. */
function hiss(secs = 1.2): void {
  const t = now();
  noiseBurst(t, { freq: 5200, q: 1.2, peak: 0.07, attack: 0.15, decay: secs, type: 'bandpass', sweepTo: 7200 });
  noiseBurst(t + 0.05, { freq: 3400, q: 0.8, peak: 0.04, attack: 0.2, decay: secs * 0.8, type: 'bandpass', sweepTo: 4800 });
}

/** A slow, soft, sleepy lullaby. */
function lullaby(): void {
  tune(
    [
      [NOTE.E5, 0], [NOTE.G5, 0.5], [NOTE.E5, 1.0], [NOTE.D5, 1.5], [NOTE.C5, 2.0],
      [NOTE.D5, 2.6], [NOTE.E5, 3.1], [NOTE.D5, 3.6], [NOTE.C5, 4.2], [NOTE.G4, 5.0],
    ],
    0.07,
    1.3,
  );
  const t = now();
  tone(NOTE.C3, t, { peak: 0.04, attack: 1.0, decay: 4.5 });
}

/** A big, slow, wobbly snore (breathe in, breathe out). */
function snore(): void {
  const t = now();
  noiseBurst(t, { freq: 350, q: 0.8, peak: 0.1, attack: 0.5, decay: 0.5, type: 'lowpass', sweepTo: 700 });
  tone(95, t, { wave: 'triangle', peak: 0.07, attack: 0.45, decay: 0.5, glideTo: 125, lowpass: 400, vibrato: [14, 6] });
  noiseBurst(t + 1.1, { freq: 500, q: 0.8, peak: 0.1, attack: 0.15, decay: 0.7, type: 'lowpass', sweepTo: 250 });
  tone(125, t + 1.1, { wave: 'triangle', peak: 0.07, attack: 0.1, decay: 0.7, glideTo: 80, lowpass: 400, vibrato: [14, 6] });
}

/** A great big yawn. */
function yawn(): void {
  const t = now();
  tone(300, t, { wave: 'triangle', peak: 0.08, attack: 0.5, decay: 0.9, glideTo: 170, lowpass: 900, vibrato: [5, 6] });
  noiseBurst(t, { freq: 900, q: 0.6, peak: 0.04, attack: 0.5, decay: 0.9, type: 'lowpass' });
}

// --------------------------------------------------------------------- art

const WALL = '#3c3446';
const WALL_DARK = '#2d2736';

/** A paper candle with a little flame, as backdrop nodes. */
function candle(x: number, y: number, h: number): Node[] {
  return [
    piece(rect(x - 9, y, 18, h, 3), C.cream, { edge: 'cut', fibre: false }),
    piece(ellipse(x, y + h, 16, 5), C.sand, { edge: 'cut', fibre: false, shadow: false }),
    ink([[x, y], [x, y - 6]], { width: 2, color: C.ink }),
    piece(curve([[x, y - 30], [x + 8, y - 14], [x, y - 4], [x - 8, y - 14]], 2), C.orange, { edge: 'cut', fibre: false }),
    piece(curve([[x, y - 22], [x + 4, y - 13], [x, y - 7], [x - 4, y - 13]], 2), C.yellow, { edge: 'cut', fibre: false, shadow: false }),
  ];
}

/** The gloomy throne room, with a tall spiky throne. */
function throneRoom(): string {
  const r = rng(64);
  const bricks: Node[] = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 9; col++) {
      const bx = col * 140 - (row % 2 ? 70 : 0);
      bricks.push(piece(rect(bx + 4, row * 70 + 4, 132, 62, 3), r() > 0.5 ? WALL : '#40384a', { edge: 'cut', fibre: false, shadow: false }));
    }
  }
  const spikes: Node[] = [];
  for (let i = 0; i < 7; i++) {
    const sx = 770 + i * 40;
    const sh = i === 3 ? 150 : 90 + (i % 2) * 28;
    spikes.push(piece(poly([[sx - 17, 250], [sx, 250 - sh], [sx + 17, 250]]), C.greenDeep, { edge: 'cut' }));
  }
  return svg({ w: 1180, h: 820, name: 'b6c4-room', boil: false, className: 'backdrop' }, [
    piece(rect(-20, -20, 1220, 860), WALL_DARK, { edge: 'clean', shadow: false }),
    ...bricks,
    // tall pillars
    piece(rect(40, -10, 70, 650), C.slate, { rough: 0.8 }),
    piece(rect(1070, -10, 70, 650), C.slate, { rough: 0.8 }),
    piece(rect(30, 600, 90, 36, 4), C.stone, { edge: 'cut' }),
    piece(rect(1060, 600, 90, 36, 4), C.stone, { edge: 'cut' }),
    // two long banners
    piece(poly([[210, 40], [300, 40], [300, 330], [255, 290], [210, 330]]), C.greenDark, { edge: 'cut' }),
    piece(poly([[880, 40], [970, 40], [970, 330], [925, 290], [880, 330]]), C.greenDark, { edge: 'cut' }),
    piece(circle(255, 120, 22), C.grey, { edge: 'cut', fibre: false, shadow: false }),
    piece(circle(925, 120, 22), C.grey, { edge: 'cut', fibre: false, shadow: false }),
    // floor
    piece(curve([[-40, 860], [-40, 600], [300, 590], [590, 586], [880, 590], [1220, 600], [1220, 860]], 2), '#524a5a', { rough: 1.2 }),
    piece(rect(-20, 600, 1220, 8), C.slate, { edge: 'cut', fibre: false, shadow: false }),
    // dark green carpet runner
    piece(poly([[470, 586], [860, 586], [980, 830], [350, 830]]), C.greenDeep, { rough: 0.8 }),
    // the spiky throne
    piece(rect(760, 250, 290, 320, 8), C.brownDark),
    ...spikes,
    piece(rect(790, 290, 230, 220, 6), C.plum, { edge: 'cut' }),
    piece(rect(740, 470, 330, 40, 6), C.brown),
    piece(rect(740, 510, 330, 80, 4), C.brownDark),
    piece(rect(710, 590, 390, 24, 4), C.stone, { edge: 'cut' }),
    // candles on the floor and ledges
    ...candle(150, 540, 60),
    ...candle(190, 556, 44),
    ...candle(1010, 596, 44),
    ...candle(1105, 560, 40),
  ]);
}

/** A big coil of sleeping green snake, 300 × 160. */
function coilArt(): string {
  const bands: Node[] = [];
  const rings: Array<[number, number, number, number]> = [
    [150, 126, 140, 30], [150, 98, 118, 28], [150, 70, 92, 26], [150, 44, 64, 22],
  ];
  rings.forEach(([cx, cy, rx, ry], i) => {
    bands.push(piece(ellipse(cx, cy, rx, ry), i % 2 ? C.green : C.greenDark));
    bands.push(ink([[cx - rx * 0.6, cy - 4], [cx - rx * 0.2, cy + 2], [cx + rx * 0.2, cy - 3], [cx + rx * 0.6, cy + 2]], { width: 3, color: C.greenDeep }));
  });
  return svg({ w: 300, h: 160, name: 'b6c4-coil', label: 'a big coil of snake' }, bands);
}

/** A sleepy snake head with closed eyes, 120 × 80. */
function sleepyHeadArt(): string {
  return svg({ w: 120, h: 80, name: 'b6c4-head', label: 'a sleeping snake head' }, [
    piece(ellipse(60, 44, 54, 32), C.green),
    ink([[32, 38], [42, 44], [52, 38]], { width: 3, color: C.ink }),
    ink([[68, 38], [78, 44], [88, 38]], { width: 3, color: C.ink }),
    ink([[46, 58], [60, 64], [74, 58]], { width: 3, color: C.ink }),
  ]);
}

/** A sleepy "z". */
function zArt(): string {
  return svg({ w: 60, h: 60, name: 'b6c4-z', boil: false }, [
    ink([[10, 10], [48, 10], [10, 50], [50, 50]], { width: 7, color: C.cream }),
  ]);
}

/** A little hanging tune: a music note. */
function noteArt(): string {
  return svg({ w: 50, h: 70, name: 'b6c4-note' }, [
    piece(ellipse(18, 56, 14, 10, -20), C.goldLight, { edge: 'cut', fibre: false }),
    piece(rect(28, 8, 6, 48, 2), C.goldLight, { edge: 'cut', fibre: false, shadow: false }),
    piece(poly([[34, 8], [48, 24], [34, 28]]), C.goldLight, { edge: 'cut', fibre: false, shadow: false }),
  ]);
}

// ------------------------------------------------------------------ helpers

/** Nagini sways side to side until told to stop. */
function sway(k: Kit, el: HTMLElement, amount: number, period: number): void {
  if (k.calm) return;
  gsap.set(el, { transformOrigin: '50% 100%' });
  gsap.fromTo(el, { rotation: -amount }, { rotation: amount, duration: period, yoyo: true, repeat: -1, ease: stepped(period, 'sine.inOut') });
}

// -------------------------------------------------------------------- story

const NAG = { x: 480, y: 300, w: 300 };
const WORDS: Array<[string, number, number, number]> = [
  ['skull', 390, 545, 90],
  ['crow', 870, -10, 110],
  ['flame', 340, 170, 90],
  ['throne', 640, 30, 120],
  ['spike', 800, 40, 120],
];

export default defineStory({
  lines: {
    enter: { who: 'narrator', text: 'Shh… You creep past a skull, a crow and a flame. Tiptoe, tiptoe…' },
    hiss: { who: 'nagini', text: 'Sssso! A little visitor… who dares creep into my throne room?' },
    lull: { who: 'narrator', text: 'Hedwig hoots a soft, soft lullaby… and Nagini’s eyes go droopy.' },
    sleepy: { who: 'nagini', text: 'Oh… sssso sleepy… sssso cosy… just a little nap… ahh…' },
    snore: { who: 'narrator', text: 'She curls up in a big coil. Fast asleep, and not a bit hurt.' },
    found: { who: 'narrator', text: 'Look! The Horcrux glows gold. Shh, {name}… tiptoe away, quiet as a mouse!' },
  },

  async play(k) {
    k.backdrop(throneRoom());
    k.music('sneaky');
    k.ambient('dust', { count: 10 });
    const dim = k.dim(0.4);
    k.light(150, 520, 90, { color: C.candle, flicker: true });
    k.light(1010, 580, 90, { color: C.candle, flicker: true });
    k.light(385, 215, 130, { color: C.orange, flicker: true });
    void k.camera({ zoom: 1.35, x: 330, y: 400 }, 0);
    const hero = k.character('hero', { x: 80, y: 345, z: 20 });
    const hedwig = k.character('hedwig', { x: 230, y: 110, w: 150, z: 22 });
    const nagini = k.character('nagini', { ...NAG, z: 12 });
    k.set([hero, hedwig, nagini], { opacity: 0 });
    k.set(nagini, { x: 400 });
    k.float(hedwig, 8, 1.8);

    // The five words hang over the room.
    const pics = WORDS.slice(0, 3).map(([w, x, y, pw]) => {
      const p = k.picture(w, { x, y, w: pw, z: 30 });
      k.set(p, { opacity: 0 });
      return p;
    });
    const lateWords = WORDS.slice(3).map(([w, x, y, pw]) => {
      const p = k.picture(w, { x, y, w: pw, z: 30 });
      k.set(p, { opacity: 0 });
      return p;
    });
    const popWords = async () => {
      await k.wait(500);
      for (const [i, p] of pics.entries()) {
        k.fx.pop();
        await k.appear(p, 0.3);
        k.float(p, 6, 1.6 + i * 0.15);
        await k.wait(260);
      }
    };

    // You creep in.
    await k.wait(300);
    k.sfx.ominous();
    k.fx.sneak();
    k.fx.patter(4, 0.25);
    await k.enter(hero, 'left', 1.2);
    await k.all(k.say('enter'), popWords());

    // Nagini slithers out, swaying and hissing.
    hiss(1.4);
    void k.camera({}, 1.6);
    k.set(nagini, { opacity: 1 });
    await k.to(nagini, 1.4, { x: 0, ease: 'sine.out' });
    sway(k, nagini, 5, 0.7);
    void k.shake(hero, 4, 3);
    await k.say('hiss', nagini);

    // Hedwig hoots a lullaby; notes float from her.
    k.sfx.hoot();
    k.light(300, 170, 120, { color: C.cream, strength: 0.3 });
    await k.enter(hedwig, 'top', 0.8);
    lullaby();
    k.music('dreamy');
    void k.wait(2000).then(() => k.sfx.hoot());
    const notes: HTMLElement[] = [];
    const lines = k.say('lull', hedwig);
    for (let i = 0; i < 4; i++) {
      const n = k.add(noteArt(), { x: 300 + i * 20, y: 210, w: 38, z: 25 });
      notes.push(n);
      void k.to(n, 2.4, { x: 220 + i * 50, y: -40 + i * 30, rotation: i % 2 ? 14 : -14, ease: 'sine.inOut' });
      void k.fade(n, 0, 2.6);
      await k.wait(500);
    }
    await lines;
    notes.forEach((n) => k.remove(n));

    // Nagini yawns and gets sleepy.
    gsap.killTweensOf(nagini);
    yawn();
    void k.camera({ zoom: 1.4, x: 620, y: 420 }, 1.2);
    await k.all(
      k.to(nagini, 1.2, { rotation: 6, scaleY: 0.92, ease: 'sine.inOut' }),
      k.say('sleepy', nagini),
    );

    // She curls into a big coil.
    k.fx.poof();
    const coil = k.add(coilArt(), { x: 480, y: 470, w: 330, z: 13 });
    k.set(coil, { opacity: 0 });
    const head = k.add(sleepyHeadArt(), { x: 560, y: 450, w: 110, z: 14 });
    k.set(head, { opacity: 0 });
    await k.all(k.fade(nagini, 0, 0.8), k.appear(coil, 0.6), k.appear(head, 0.6));
    k.float(head, 3, 2.4);
    k.puff(640, 560, 120, C.stoneLight);

    // Snore!
    const zs: HTMLElement[] = [];
    const sayP = k.say('snore');
    for (let i = 0; i < 3; i++) {
      snore();
      const z = k.add(zArt(), { x: 650 + i * 40, y: 280 - i * 20, w: 40 + i * 12, z: 25 });
      zs.push(z);
      void k.to(z, 1.8, { y: -100, x: 30, ease: 'sine.out' });
      void k.fade(z, 0, 1.8);
      await k.wait(1250);
    }
    await sayP;
    zs.forEach((z) => k.remove(z));

    // The Horcrux glows on her coil.
    k.music('magic');
    k.sfx.reveal();
    k.sfx.shield();
    void k.glow(C.goldLight, 0.4, 1.6);
    k.light(600, 480, 240, { color: C.goldLight, strength: 0.55 });
    void k.fade(dim, 0.25, 1.2);
    const horcrux = k.horcrux('nagini', { x: 545, y: 330, w: 180, z: 28 });
    k.set(horcrux, { opacity: 0 });
    void k.to(horcrux, 0.8, { y: 230, ease: 'sine.out' });
    await k.appear(horcrux, 0.8);
    k.float(horcrux, 8, 1.5);
    k.sparkle(635, 320, 16, 160);
    k.sfx.gem();
    void k.camera({}, 1.5);
    await k.say('found');

    // Tiptoe off, happy ending.
    k.fx.sneak();
    k.fx.jingle();
    k.confetti(30);
    k.sparkle(670, 400, 14, 200);
    for (const p of lateWords) {
      k.fx.pop();
      await k.appear(p, 0.3);
      k.float(p, 6, 1.8);
    }
    await k.all(k.pop(horcrux, 1.15), k.walk(hero, -120, 1.4, 4));
    await k.hop(hero, 30, 1);
    await k.wait(1500);
  },
});
