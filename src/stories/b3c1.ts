/**
 * Book 3, chapter 1: Crookshanks.
 *
 * A cosy night in the Gryffindor common room. A Chocolate Frog hops out of
 * its box and Crookshanks gives chase: he pounces, misses, and lands on a
 * drum (bom!), a crab pinches his tail, and a flag flops down on his head.
 * In the end he gives up and curls up purring on the hero's lap, far too
 * sleepy to bother with the slug sliding past.
 */
import { gsap } from 'gsap';
import { audio, buses } from '../audio/engine';
import { fluff } from '../art/characters/heroes';
import { picture } from '../art/pictures';
import { stepped } from '../ui/anim';
import { band, C, circle, curve, defineStory, dot, ellipse, group, ink, noiseBurst, NOTE, now, piece, poly, rect, svg, tone, type Node, type Pt } from './kit';

// ------------------------------------------------------------------ sounds

let purrBuf: AudioBuffer | null = null;

/**
 * A cat's purr: low, breathy rumbling noise and a soft buzz, pulsed by a
 * tremolo at about 25 Hz, swelling in and out with each breath.
 */
function purr(seconds = 2.6): void {
  const ac = audio();
  const t = now();
  if (!purrBuf) {
    purrBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const d = purrBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const src = ac.createBufferSource();
  src.buffer = purrBuf;
  src.loop = true;
  const lp = ac.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 280;
  const buzz = ac.createOscillator();
  buzz.type = 'sawtooth';
  buzz.frequency.value = 26;
  const blp = ac.createBiquadFilter();
  blp.type = 'lowpass';
  blp.frequency.value = 340;
  const bg = ac.createGain();
  bg.gain.value = 0.45;
  // The tremolo: a gain that throbs between ~0.1 and 1.
  const trem = ac.createGain();
  trem.gain.value = 0.55;
  const lfo = ac.createOscillator();
  lfo.frequency.value = 25;
  const depth = ac.createGain();
  depth.gain.value = 0.45;
  lfo.connect(depth).connect(trem.gain);
  // Breathing in (louder) and out (softer).
  const env = ac.createGain();
  env.gain.setValueAtTime(0.0001, t);
  const breath = 1.15;
  let tt = t;
  while (tt < t + seconds - breath * 0.5) {
    env.gain.linearRampToValueAtTime(0.24, tt + breath * 0.35);
    env.gain.linearRampToValueAtTime(0.07, tt + breath * 0.52);
    env.gain.linearRampToValueAtTime(0.17, tt + breath * 0.78);
    env.gain.linearRampToValueAtTime(0.02, tt + breath);
    tt += breath;
  }
  env.gain.linearRampToValueAtTime(0.0001, tt + 0.1);
  src.connect(lp).connect(trem);
  buzz.connect(blp).connect(bg).connect(trem);
  trem.connect(env).connect(buses.sfx);
  const end = tt + 0.2;
  src.start(t);
  buzz.start(t);
  lfo.start(t);
  src.stop(end);
  buzz.stop(end);
  lfo.stop(end);
}

/** The drum: one deep, round "bom". */
function bom(): void {
  const t = now();
  tone(98, t, { peak: 0.26, attack: 0.005, decay: 0.6, glideTo: 60 });
  tone(196, t, { wave: 'triangle', peak: 0.08, decay: 0.2, glideTo: 120, lowpass: 900 });
  noiseBurst(t, { freq: 500, type: 'lowpass', peak: 0.12, decay: 0.08 });
}

/** A frog's "ribbit": two short, croaky, buzzy notes. */
function croak(): void {
  const t = now();
  tone(135, t, { wave: 'sawtooth', peak: 0.11, attack: 0.015, decay: 0.1, glideTo: 108, vibrato: [38, 22], lowpass: 900 });
  tone(165, t + 0.16, { wave: 'sawtooth', peak: 0.11, attack: 0.015, decay: 0.13, glideTo: 125, vibrato: [38, 22], lowpass: 900 });
}

/** A crab's claws going snip-snip. */
function pinch(): void {
  const t = now();
  for (const d of [0, 0.1]) {
    noiseBurst(t + d, { freq: 3200, q: 5, peak: 0.1, decay: 0.03 });
    tone(1500, t + d, { wave: 'triangle', peak: 0.05, decay: 0.05, glideTo: 900 });
  }
}

/** A startled cat's "mrrow!": up, then down. */
function yowl(): void {
  const t = now();
  tone(520, t, { wave: 'sawtooth', peak: 0.06, attack: 0.04, decay: 0.2, glideTo: 820, vibrato: [7, 12], lowpass: 1700 });
  tone(820, t + 0.22, { wave: 'sawtooth', peak: 0.06, attack: 0.02, decay: 0.35, glideTo: 470, vibrato: [7, 12], lowpass: 1500 });
}

/** The fire crackling softly. */
function crackle(seconds = 3): void {
  const t = now();
  for (let s = 0; s < seconds; s += 0.08 + Math.random() * 0.18) {
    noiseBurst(t + s, { freq: 2200 + Math.random() * 2400, q: 2, peak: 0.025 + Math.random() * 0.03, decay: 0.02 });
  }
}

/** A cloth flag flumping down. */
function flump(): void {
  const t = now();
  noiseBurst(t, { freq: 800, q: 0.7, peak: 0.14, attack: 0.03, decay: 0.25, sweepTo: 220 });
  tone(140, t + 0.02, { peak: 0.08, decay: 0.15, glideTo: 90 });
}

/** A slug sliding: a soft, slow, wet slither. */
function slither(seconds = 2.4): void {
  const t = now();
  noiseBurst(t, { freq: 1100, q: 4, peak: 0.04, attack: seconds * 0.4, decay: seconds * 0.6, sweepTo: 700 });
  for (let i = 0; i < 4; i++) tone(300 + i * 40, t + 0.3 + i * 0.5, { peak: 0.04, decay: 0.08, glideTo: 520 });
}

/** A sleepy, contented sigh going down. */
function sigh(): void {
  const t = now();
  noiseBurst(t, { freq: 900, q: 0.8, peak: 0.07, attack: 0.15, decay: 0.6, sweepTo: 400 });
  tone(NOTE.E5, t, { wave: 'triangle', peak: 0.05, attack: 0.1, decay: 0.6, glideTo: NOTE.G4, lowpass: 1600 });
}

// --------------------------------------------------------------------- art

const WALL = '#7a3a31';
const FUR = C.ginger;
const FUR_DARK = '#a24f22';
const STRIPE = '#9a4520';
const CHAIR = '#94382f';
const CHAIR_LIGHT = '#ad4a3b';

function archOutline(x: number, y: number, w: number, h: number): Pt[] {
  const r = w / 2;
  const pts: Pt[] = [[x, y + h]];
  for (let i = 0; i <= 12; i++) {
    const a = Math.PI + (i / 12) * Math.PI;
    pts.push([x + r + Math.cos(a) * r, y + r + Math.sin(a) * r]);
  }
  pts.push([x + w, y + h]);
  return pts;
}

/** A tall arched window onto the starry night. */
function windowArt(x: number, y: number, w: number, h: number): Node[] {
  const gx = x + 14;
  const gw = w - 28;
  return [
    piece(archOutline(x - 12, y - 12, w + 24, h + 24), '#5e554c', { rough: 0.8 }),
    piece(archOutline(x, y, w, h), C.brownDark, { edge: 'cut' }),
    piece(archOutline(gx, y + 14, gw, h - 26), C.night, { edge: 'cut', fibre: false }),
    piece(circle(x + w * 0.66, y + h * 0.3, 22), C.cream, { edge: 'cut', fibre: false }),
    piece(circle(x + w * 0.6, y + h * 0.27, 20), C.night, { edge: 'clean', shadow: false }),
    dot(x + w * 0.3, y + h * 0.28, 3, C.goldLight),
    dot(x + w * 0.45, y + h * 0.5, 2.5, C.goldLight),
    dot(x + w * 0.24, y + h * 0.62, 2.5, C.goldLight),
    dot(x + w * 0.72, y + h * 0.66, 3, C.goldLight),
    // far-off hills and the lake
    piece(curve([[gx, y + h - 70], [x + w * 0.4, y + h - 96], [x + w * 0.8, y + h - 80], [gx + gw, y + h - 92], [gx + gw, y + h - 12], [gx, y + h - 12]], 2), C.greenDeep, { fibre: false, shadow: false }),
    ink([[x + w / 2, y + 16], [x + w / 2, y + h - 12]], { width: 6, color: C.brownDark, wobble: 0.3 }),
    ink([[gx, y + h * 0.56], [gx + gw, y + h * 0.56]], { width: 6, color: C.brownDark, wobble: 0.3 }),
    piece(rect(x - 20, y + h - 4, w + 40, 18, 3), C.stoneLight, { rough: 0.8 }),
  ];
}

/** A little painting in a gold frame (Hogwarts paintings!). */
function painting(x: number, y: number, w: number, h: number): Node[] {
  return [
    piece(rect(x, y, w, h, 4), C.gold),
    piece(rect(x + 14, y + 14, w - 28, h - 28, 2), C.sky, { edge: 'cut', fibre: false }),
    piece(curve([[x + 14, y + h - 60], [x + w * 0.35, y + h - 90], [x + w * 0.7, y + h - 70], [x + w - 14, y + h - 84], [x + w - 14, y + h - 14], [x + 14, y + h - 14]], 2), C.green, { fibre: false, shadow: false }),
    piece(ellipse(x + w * 0.62, y + h * 0.42, 34, 13), C.white, { fibre: false, shadow: false, opacity: 0.9 }),
    piece(circle(x + w * 0.28, y + h * 0.3, 16), C.goldLight, { edge: 'cut', fibre: false }),
  ];
}

/** The Gryffindor common room at night, 1180 × 820. */
function commonRoom(): string {
  const stripes: Node[] = [];
  for (let x = 10; x < 1180; x += 74) stripes.push(piece(rect(x, -10, 30, 490), '#6c3029', { edge: 'cut', fibre: false, shadow: false, opacity: 0.5 }));
  const panels: Node[] = [];
  for (let x = 10; x < 1180; x += 132) panels.push(piece(rect(x, 492, 112, 98, 4), '#6b4431', { edge: 'cut', fibre: false }));
  const stones: Node[] = [];
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 4; col++) {
      const sx = 472 + col * 74 + (row % 2) * 30;
      const sy = 272 + row * 56;
      if (sx > 530 && sx < 690 && sy > 340) continue;
      stones.push(piece(rect(sx, sy, 66, 48, 6), row % 2 ? '#978d81' : '#83796e', { edge: 'cut', fibre: false, shadow: false, opacity: 0.8 }));
    }
  }
  const planks: Node[] = [];
  for (const [y, off] of [[650, 0], [705, 110], [770, 50]] as const) {
    planks.push(ink([[-10, y], [1190, y + 4]], { width: 2.5, color: C.brownDark, opacity: 0.4 }));
    for (let x = 140 + off; x < 1180; x += 280) planks.push(ink([[x, y - 46], [x, y]], { width: 2, color: C.brownDark, opacity: 0.3 }));
  }
  const buttons: Node[] = [];
  for (const [bx, by] of [[930, 360], [1000, 345], [1070, 360], [965, 420], [1035, 420]] as const) buttons.push(dot(bx, by, 5, '#6a2620'));
  const candle = (x: number): Node[] => [
    piece(rect(x - 14, 222, 28, 16, 3), C.gold, { edge: 'cut', fibre: false }),
    piece(rect(x - 8, 172, 16, 52, 3), C.cream, { edge: 'cut' }),
    piece(ellipse(x, 160, 7, 13), C.candle, { edge: 'cut', fibre: false }),
    piece(ellipse(x, 164, 3, 6), C.white, { edge: 'clean', shadow: false }),
  ];
  return svg({ w: 1180, h: 820, name: 'b3c1-common-room', boil: false, className: 'backdrop' }, [
    piece(rect(-20, -20, 1220, 660), WALL, { edge: 'clean', shadow: false }),
    ...stripes,
    // warm firelight on the wall
    piece(ellipse(620, 400, 470, 320), C.candle, { edge: 'cut', fibre: false, shadow: false, opacity: 0.13 }),
    piece(ellipse(620, 470, 260, 190), C.orange, { edge: 'cut', fibre: false, shadow: false, opacity: 0.1 }),
    ...windowArt(80, 90, 170, 290),
    ...painting(905, 70, 190, 150),
    // wooden panelling along the bottom of the wall
    piece(rect(-20, 474, 1220, 140), C.brownDark, { rough: 1 }),
    ...panels,
    piece(rect(-20, 466, 1220, 16, 3), C.wood),
    // the fireplace
    piece(rect(462, 250, 316, 360, 6), '#8f857a'),
    ...stones,
    piece(archOutline(532, 350, 176, 258), '#2a1812', { edge: 'cut' }),
    piece(ellipse(620, 560, 80, 46), C.orange, { edge: 'cut', fibre: false, shadow: false, opacity: 0.35 }),
    piece(rect(436, 234, 368, 26, 4), C.brownDark),
    piece(rect(450, 256, 340, 10, 2), '#4a2e20', { edge: 'cut', fibre: false }),
    ...candle(470),
    ...candle(770),
    // the floor
    piece(rect(-20, 612, 1220, 230), '#8d613f', { rough: 1.4 }),
    ...planks,
    piece(rect(-20, 606, 1220, 16, 3), C.brownDark, { rough: 1.2 }),
    piece(rect(448, 598, 344, 30, 4), C.stoneLight),
    // a big round rug
    piece(ellipse(520, 700, 420, 62), '#8a3a32', { rough: 1.3 }),
    piece(ellipse(520, 700, 372, 46), C.gold, { edge: 'cut', fibre: false, opacity: 0.55 }),
    piece(ellipse(520, 700, 356, 40), '#8a3a32', { edge: 'cut', fibre: false, shadow: false }),
    // the back of the big squashy armchair
    piece(curve([[846, 610], [842, 360], [880, 298], [1000, 280], [1120, 298], [1158, 360], [1154, 610]], 2), CHAIR, { rough: 1.1 }),
    piece(curve([[876, 600], [874, 380], [900, 322], [1000, 308], [1100, 322], [1126, 380], [1124, 600]], 2), CHAIR_LIGHT, { edge: 'cut', fibre: false }),
    ...buttons,
  ]);
}

/** The fire's flames and logs (180 × 150), so they can flicker in their own paper boil. */
function fire(): string {
  return svg({ w: 180, h: 150, name: 'b3c1-fire', label: 'a crackling fire' }, [
    piece(curve([[20, 140], [14, 90], [40, 40], [56, 76], [74, 10], [96, 62], [118, 24], [136, 74], [160, 50], [166, 140]], 2), C.orange, { rough: 1.3 }),
    piece(curve([[44, 140], [42, 100], [64, 64], [80, 92], [96, 50], [112, 96], [132, 80], [140, 140]], 2), C.yellow, { fibre: false }),
    piece(curve([[70, 140], [72, 112], [90, 88], [106, 112], [110, 140]], 2), C.candle, { fibre: false, shadow: false }),
    piece(band([[22, 136], [158, 126]], 20), C.brown),
    piece(band([[30, 124], [150, 142]], 18), C.brownDark),
    piece(circle(156, 126, 9), C.tan, { edge: 'cut', fibre: false }),
  ]);
}

/** The front of the armchair (350 × 170): its two arms and the seat cushion. */
function chairFront(): string {
  return svg({ w: 350, h: 170, name: 'b3c1-chair-front', boil: false, label: 'a squashy armchair' }, [
    piece(rect(20, 150, 26, 18, 3), C.brownDark),
    piece(rect(304, 150, 26, 18, 3), C.brownDark),
    piece(rect(64, 84, 222, 76, 14), CHAIR),
    piece(rect(70, 76, 210, 34, 14), CHAIR_LIGHT, { fibre: false }),
    ink([[84, 118], [266, 118]], { width: 3, color: C.gold, opacity: 0.6 }),
    piece(rect(4, 18, 82, 140, 26), CHAIR),
    piece(ellipse(45, 20, 44, 18), CHAIR_LIGHT),
    piece(rect(264, 18, 82, 140, 26), CHAIR),
    piece(ellipse(305, 20, 44, 18), CHAIR_LIGHT),
    ink([[45, 46], [45, 140]], { width: 3, color: C.gold, opacity: 0.5 }),
    ink([[305, 46], [305, 140]], { width: 3, color: C.gold, opacity: 0.5 }),
  ]);
}

/** A Chocolate Frog box (120 × 100) with a lid that flips open. */
function frogBox(): string {
  return svg({ w: 120, h: 100, name: 'b3c1-frog-box', label: 'a chocolate frog box' }, [
    piece(poly([[14, 44], [106, 44], [112, 96], [8, 96]]), C.purple),
    piece(rect(10, 62, 100, 14, 2), C.gold, { edge: 'cut', fibre: false }),
    piece(poly([[60, 50], [65, 60], [76, 60], [67, 67], [71, 78], [60, 71], [49, 78], [53, 67], [44, 60], [55, 60]]), C.goldLight, { edge: 'cut', fibre: false }),
    group({ part: 'lid' }, [piece(rect(6, 30, 108, 18, 4), C.plum)]),
  ]);
}

/** A Chocolate Frog: the game's frog picture, made of chocolate. */
function chocFrog(): string {
  const swaps: Array<[string, string]> = [
    [C.greenDeep, '#3a2216'],
    [C.greenDark, '#5a3420'],
    [C.green, '#7a4a2c'],
    [C.goldLight, '#a8774c'],
  ];
  let art = picture('frog');
  for (const [from, to] of swaps) art = art.split(from).join(to);
  return art;
}

/** Crookshanks's squashed face, in portrait coordinates (centred near 150, 145). */
function catHead(sleepy: boolean): Node[] {
  const eyes: Node[] = sleepy
    ? [
        ink([[94, 142], [110, 150], [126, 142]], { width: 4.5 }),
        ink([[174, 142], [190, 150], [206, 142]], { width: 4.5 }),
      ]
    : [
        piece(ellipse(110, 140, 17, 13), C.yellow, { edge: 'cut' }),
        piece(ellipse(190, 140, 17, 13), C.yellow, { edge: 'cut' }),
        piece(ellipse(110, 141, 5, 11), C.ink, { edge: 'clean', shadow: false }),
        piece(ellipse(190, 141, 5, 11), C.ink, { edge: 'clean', shadow: false }),
        dot(107, 135, 2.5, C.white),
        dot(187, 135, 2.5, C.white),
        ink([[92, 124], [128, 132]], { width: 5, color: STRIPE }),
        ink([[208, 124], [172, 132]], { width: 5, color: STRIPE }),
      ];
  return [
    piece(poly([[64, 120], [70, 50], [120, 92]]), FUR),
    piece(poly([[236, 120], [230, 50], [180, 92]]), FUR),
    piece(poly([[76, 106], [78, 70], [104, 94]]), C.pink, { edge: 'cut', fibre: false, shadow: false }),
    piece(poly([[224, 106], [222, 70], [196, 94]]), C.pink, { edge: 'cut', fibre: false, shadow: false }),
    fluff([[150, 64], [210, 80], [244, 130], [240, 190], [200, 226], [100, 226], [60, 190], [56, 130], [90, 80]], FUR, 10),
    ink([[150, 78], [150, 100]], { width: 5, color: STRIPE }),
    ink([[132, 82], [136, 102]], { width: 4, color: STRIPE }),
    ink([[168, 82], [164, 102]], { width: 4, color: STRIPE }),
    piece(ellipse(150, 168, 50, 34), C.orange, { fibre: false }),
    ...eyes,
    piece(poly([[140, 160], [160, 160], [150, 170]]), C.rose, { edge: 'cut', fibre: false }),
    ink(sleepy ? [[136, 184], [150, 180], [164, 184]] : [[132, 186], [150, 180], [168, 186]], { width: 3.5 }),
    ink([[106, 170], [56, 162]], { width: 2, color: C.white }),
    ink([[106, 178], [60, 182]], { width: 2, color: C.white }),
    ink([[194, 170], [244, 162]], { width: 2, color: C.white }),
    ink([[194, 178], [240, 182]], { width: 2, color: C.white }),
  ];
}

/**
 * Crookshanks standing, side on with his face to us (320 × 230), facing
 * right. His bottle-brush tail is the part "tail" (pivot 58 140).
 */
function catStanding(): string {
  const s = 0.58;
  const legs = (x: number, color: string): Node[] => [
    piece(rect(x, 160, 26, 52, 11), color, { fibre: false }),
    piece(ellipse(x + 13, 212, 17, 8), color),
  ];
  return svg({ w: 320, h: 230, name: 'b3c1-cat', label: 'Crookshanks the cat' }, [
    piece(ellipse(150, 218, 120, 8), 'rgba(40,25,10,0.18)', { edge: 'cut', fibre: false, shadow: false }),
    group({ part: 'tail' }, [
      piece(band([[60, 146], [30, 118], [20, 70], [34, 26]], 34), FUR, { rough: 1.8 }),
      piece(circle(35, 28, 16), FUR_DARK, { rough: 1.6 }),
      ink([[16, 96], [40, 92]], { width: 5, color: STRIPE }),
      ink([[14, 66], [38, 64]], { width: 5, color: STRIPE }),
    ]),
    // far legs, a shade darker
    ...legs(84, FUR_DARK),
    ...legs(214, FUR_DARK),
    fluff([[60, 140], [100, 108], [160, 102], [222, 112], [250, 150], [228, 192], [160, 200], [90, 194], [56, 172]], FUR, 9),
    piece(ellipse(84, 162, 40, 40), FUR, { fibre: false }),
    piece(ellipse(160, 182, 70, 16), C.orange, { fibre: false, shadow: false }),
    ink([[110, 110], [116, 136]], { width: 5, color: STRIPE }),
    ink([[140, 106], [144, 134]], { width: 5, color: STRIPE }),
    ink([[170, 106], [172, 132]], { width: 5, color: STRIPE }),
    ink([[70, 140], [92, 150]], { width: 5, color: STRIPE }),
    // near legs
    ...legs(64, FUR),
    ...legs(196, FUR),
    group({ part: 'head', transform: `translate(${250 - 150 * s} ${92 - 145 * s}) scale(${s})` }, catHead(false)),
  ]);
}

/** Crookshanks curled up asleep (300 × 170), tail wrapped round. */
function catCurled(): string {
  const s = 0.5;
  return svg({ w: 300, h: 170, name: 'b3c1-cat-curled', label: 'Crookshanks, curled up and purring' }, [
    piece(ellipse(150, 160, 130, 9), 'rgba(40,25,10,0.18)', { edge: 'cut', fibre: false, shadow: false }),
    fluff([[30, 120], [50, 70], [110, 48], [180, 50], [236, 80], [256, 126], [220, 158], [140, 162], [60, 158]], FUR, 10),
    ink([[90, 60], [96, 88]], { width: 5, color: STRIPE }),
    ink([[122, 52], [126, 82]], { width: 5, color: STRIPE }),
    ink([[154, 52], [154, 82]], { width: 5, color: STRIPE }),
    ink([[56, 90], [80, 102]], { width: 5, color: STRIPE }),
    // the tail wrapped round the front
    piece(band([[34, 120], [60, 150], [140, 158], [200, 146]], 30), FUR, { rough: 1.6 }),
    piece(circle(204, 144, 15), FUR_DARK, { rough: 1.5 }),
    ink([[100, 140], [104, 168]], { width: 4, color: STRIPE }),
    ink([[150, 138], [150, 166]], { width: 4, color: STRIPE }),
    group({ part: 'head', transform: `translate(${222 - 150 * s} ${92 - 145 * s}) rotate(-8 150 145) scale(${s})` }, catHead(true)),
  ]);
}

// ------------------------------------------------------------------- story

export default defineStory({
  lines: {
    intro: { who: 'narrator', text: 'A cosy night by the common room fire… crackle, crackle. Who’s that?' },
    spot: { who: 'crookshanks', text: 'Mrrow! A chocolate frog! Sneaky, sneaky… I’m going to catch it!' },
    drum: { who: 'narrator', text: 'Pounce! He misses the frog… and lands on the drum. Bom!' },
    crab: { who: 'crookshanks', text: 'Yeowch! Who pinched my tail? Oh… a crab!' },
    flag: { who: 'crookshanks', text: 'Hey! Who turned out the lights? Get off, silly flag!' },
    lap: { who: 'crookshanks', text: 'Phew! Chasing is tiring. Your lap is the comfiest spot, {name}.' },
    slug: { who: 'narrator', text: 'A slug slides by… but Crookshanks is far too sleepy to chase it.' },
  },

  async play(k) {
    k.backdrop(commonRoom());

    // ---- the room
    const flames = k.add(fire(), { x: 530, y: 455, w: 180, z: 3 });
    const flag = k.picture('flag', { x: 590, y: 102, w: 150, z: 4 });
    const drum = k.picture('drum', { x: 70, y: 470, w: 170, z: 8 });
    const box = k.add(frogBox(), { x: 700, y: 560, w: 100, z: 9 });
    const lid = box.querySelector<SVGGElement>('[data-part="lid"]');
    const hero = k.character('hero', { x: 865, y: 330, z: 9 });
    k.add(chairFront(), { x: 826, y: 512, w: 350, z: 15 });
    const frog = k.add(chocFrog(), { x: 690, y: 450, w: 140, z: 16 });
    k.dim(0.22);
    k.light(620, 520, 300, { color: C.candle, strength: 0.5, flicker: true });
    k.light(470, 160, 60, { color: C.candle });
    k.light(770, 160, 60, { color: C.candle });
    k.ambient('embers', { count: 10, z: 5, area: [540, 360, 160, 220] });
    k.music('cosy');
    /** Frog landing: a squash, a pop and a few sparkles. */
    const land = (x: number, y: number): void => {
      k.sparkle(x + 70, y + 60, 5, 40);
      k.fx.pop();
      void k.to(frog, 0.1, { scaleY: 0.85, scaleX: 1.1, transformOrigin: '50% 100%' }).then(() => k.to(frog, 0.15, { scaleY: 1, scaleX: 1 }));
    };
    const cat = k.add(catStanding(), { x: 300, y: 465, w: 240, z: 12 });
    const tail = cat.querySelector<SVGGElement>('[data-part="tail"]');
    k.set([frog, cat], { opacity: 0 });

    /** Leaps an actor along an arc so its top-left lands at (x, y) on stage. */
    const leapTo = (el: HTMLElement, x: number, y: number, height: number, secs: number): Promise<void> => {
      const left = parseFloat(el.style.left);
      const top = parseFloat(el.style.top);
      const cy = top + Number(gsap.getProperty(el, 'y'));
      const peak = Math.min(cy, y) - height;
      return k.all(
        k.to(el, secs, { x: x - left, ease: 'none' }),
        k.to(el, secs / 2, { y: peak - top, ease: 'power2.out' }).then(() => k.to(el, secs / 2, { y: y - top, ease: 'power2.in' })),
      );
    };
    /** A lazy tail swish. */
    const swish = (): void => {
      if (k.calm || !tail) return;
      gsap.to(tail, { rotation: 10, svgOrigin: '58 146', duration: 0.6, yoyo: true, repeat: 3, ease: stepped(0.6, 'sine.inOut') });
    };
    if (!k.calm) k.float(flames, 3, 1.4);

    // ---- a cosy night; in pads Crookshanks
    crackle(4.5);
    await k.say('intro');
    k.fx.patter(7, 0.1);
    await k.enter(cat, 'left', 0.9);
    swish();

    // ---- the Chocolate Frog jumps out of its box
    k.music('sneaky');
    void k.camera({ zoom: 1.3, x: 430, y: 470 }, 1.4);
    k.fx.pop();
    if (lid) void k.to(lid, 0.3, { rotation: -50, svgOrigin: '6 48', ease: 'back.out(2)' });
    await k.pop(box, 1.1);
    k.set(frog, { opacity: 1 });
    croak();
    await k.appear(frog, 0.35);
    k.fx.boing();
    await leapTo(frog, 780, 520, 70, 0.5);
    land(780, 520);
    await k.say('spot', cat);

    // ---- it hops right over him, onto the drum…
    croak();
    k.fx.boing();
    await leapTo(frog, 100, 452, 220, 0.9);
    land(100, 452);
    k.face(cat, true);
    // …he crouches, wiggles…
    await k.to(cat, 0.25, { scaleY: 0.88, scaleX: 1.06, transformOrigin: '50% 95%', ease: 'power1.out' });
    // …and pounces, just as the frog hops away.
    k.fx.whizz();
    void k.wait(300).then(() => {
      croak();
      return leapTo(frog, 780, 520, 240, 0.9).then(() => land(780, 520));
    });
    await k.all(leapTo(cat, 30, 384, 120, 0.7), k.to(cat, 0.25, { scaleY: 1, scaleX: 1 }));
    bom();
    k.sparkle(160, 560, 8, 80);
    await k.all(k.pop(drum, 1.12), k.to(cat, 0.1, { scaleY: 0.85, ease: 'power1.out' }));
    k.fx.boing();
    await k.all(leapTo(cat, 210, 465, 130, 0.7), k.to(cat, 0.2, { scaleY: 1 }));
    k.face(cat, false);
    swish();
    await k.all(k.shake(cat, 5, 2), k.say('drum'));

    // ---- after the frog again! (Something is hiding by the rug…)
    k.fx.patter(6, 0.1);
    await k.walk(cat, 240, 0.9, 3);
    croak();
    void k.hop(frog, 30);
    const crab = k.picture('crab', { x: 360, y: 548, w: 110, z: 13 });
    k.fx.pop();
    await k.appear(crab, 0.3);
    pinch();
    await k.pop(crab, 1.15);
    // He shoots straight up with his tail all fluffed out.
    yowl();
    if (tail) k.set(tail, { scale: 1.3, svgOrigin: '58 146' });
    void k.shake(flag, 6, 3);
    await k.hop(cat, 130);
    k.fx.thud();
    k.face(cat, true);
    await k.say('crab', cat);
    if (tail) void k.to(tail, 0.3, { scale: 1, svgOrigin: '58 146' });
    k.fx.patter(5, 0.08);
    await k.exit(crab, 'left', 0.6);
    k.remove(crab);

    // ---- the flag topples off the mantelpiece onto his head
    k.face(cat, false);
    void k.camera({ zoom: 1.2, x: 470, y: 400 }, 1.0);
    k.fx.creak();
    await k.shake(flag, 5, 2);
    flag.style.zIndex = '14';
    k.fx.whizz();
    await k.to(flag, 0.5, { x: -17, y: 320, rotation: 180, ease: 'power2.in' });
    flump();
    await k.all(k.pop(cat, 1.06), k.wait(200));
    const wobble = async (): Promise<void> => {
      await k.all(k.shake(cat, 8, 3), k.shake(flag, 8, 3));
    };
    await k.all(k.say('flag', cat), wobble());
    // Shake it off!
    k.fx.poof();
    await k.to(flag, 0.5, { x: '+=90', y: '+=90', rotation: '+=70', opacity: 0, ease: 'power2.in' });
    k.remove(flag);
    swish();

    // ---- the frog hops up onto your armchair; Crookshanks gives up
    k.music('dreamy');
    void k.camera({ zoom: 1.35, x: 920, y: 470 }, 1.4);
    croak();
    k.fx.boing();
    await leapTo(frog, 815, 420, 130, 0.6);
    land(815, 420);
    void k.hop(hero, 14);
    k.fx.twinkle();
    k.sparkle(870, 470, 8, 70);
    sigh();
    k.fx.patter(4, 0.1);
    await k.walk(cat, 160, 0.6, 2);
    await k.to(cat, 0.2, { scaleY: 0.88, scaleX: 1.06, transformOrigin: '50% 95%', ease: 'power1.out' });
    k.fx.boing();
    await k.all(leapTo(cat, 875, 420, 110, 0.6), k.to(cat, 0.2, { scaleY: 1, scaleX: 1 }));
    k.fx.thud();
    await k.to(cat, 0.1, { scaleY: 0.9, transformOrigin: '50% 95%' });
    // He curls up on your lap.
    const curled = k.add(catCurled(), { x: 905, y: 512, w: 200, z: 12 });
    k.set(curled, { opacity: 0 });
    k.fx.pop();
    await k.all(k.fade(cat, 0, 0.2), k.fade(curled, 1, 0.25));
    k.remove(cat);
    await k.pop(curled, 1.06);
    if (!k.calm) gsap.to(curled, { scaleY: 1.03, transformOrigin: '50% 100%', duration: 1.15, yoyo: true, repeat: -1, ease: stepped(1.15, 'sine.inOut') });
    purr(3);
    k.sparkle(1005, 540, 8, 90);
    await k.say('lap', curled);

    // ---- a slug slides by; nobody chases it
    const slug = k.picture('slug', { x: 240, y: 548, w: 130, z: 13 });
    slither(2.6);
    purr(3.6);
    await k.all(k.enter(slug, 'left', 1.8), k.say('slug'));

    // ---- a happy, cosy ending
    await k.camera({}, 1.5);
    k.fx.jingle();
    crackle(2);
    void k.glow(C.candle, 0.25, 1.4);
    k.sparkle(1005, 520, 14, 160);
    k.confetti(24);
    croak();
    await k.all(k.hop(frog, 26), k.hop(slug, 10));
    purr(2.4);
    await k.wait(1500);
  },
});
