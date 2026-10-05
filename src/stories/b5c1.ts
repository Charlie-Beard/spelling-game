/**
 * b5c1 "Grimmauld Place": a London street at night, then inside number 12.
 *
 * You stand between number 11 and number 13… and with a long creak the two
 * houses squeeze apart and number 12 pops out between them. Inside, a big
 * shaggy black dog bounds up, barking happily, and licks your face, then
 * pops into Sirius, laughing. All the noise wakes a grumpy old portrait,
 * which shouts until you swish its curtains shut with your wand. Sirius
 * toots a horn for dinner, and the Order sits down to a cosy meal in the
 * kitchen: Moody wants the jam jar, and the forks all clink together.
 */
import { gsap } from 'gsap';
import { fluff } from '../art/characters/heroes';
import { HEAD, person } from '../art/characters/people';
import { eye } from '../art/pictures/kit';
import { C, NOTE, band, bell, circle, curve, defineStory, dot, ellipse, group, ink, noiseBurst, now, piece, poly, raw, rect, rng, svg, tone, type Kit, type Node, type Pt } from './kit';

// ------------------------------------------------------------------ sounds

/** The two houses groaning and creaking as they shuffle apart. */
function housesCreak(): void {
  const t = now();
  tone(110, t, { wave: 'sawtooth', peak: 0.06, attack: 0.2, decay: 1.1, glideTo: 170, vibrato: [20, 12], lowpass: 750 });
  tone(190, t + 0.55, { wave: 'sawtooth', peak: 0.05, attack: 0.12, decay: 0.9, glideTo: 130, vibrato: [26, 16], lowpass: 850 });
  tone(150, t + 1.1, { wave: 'sawtooth', peak: 0.045, attack: 0.1, decay: 0.7, glideTo: 220, vibrato: [24, 14], lowpass: 800 });
  noiseBurst(t, { freq: 170, type: 'lowpass', peak: 0.1, attack: 0.4, decay: 1.5 });
}

/** One friendly "woof": a quick drop in pitch with a breathy edge. */
function bark(t: number, pitch = 1): void {
  tone(340 * pitch, t, { wave: 'triangle', peak: 0.2, attack: 0.01, decay: 0.13, glideTo: 190 * pitch, lowpass: 1600 });
  tone(170 * pitch, t, { wave: 'sawtooth', peak: 0.05, attack: 0.01, decay: 0.1, glideTo: 110 * pitch, lowpass: 700 });
  noiseBurst(t, { freq: 900, q: 1.2, peak: 0.06, decay: 0.07 });
}

/** A run of happy barks. */
function happyBarks(count = 3): void {
  const t = now();
  for (let i = 0; i < count; i++) bark(t + i * 0.24, 1 + (i % 2) * 0.09);
}

/** A big wet doggy lick. */
function slurp(): void {
  const t = now();
  noiseBurst(t, { freq: 800, q: 4, peak: 0.1, attack: 0.05, decay: 0.24, sweepTo: 2400 });
  tone(380, t, { peak: 0.05, attack: 0.03, decay: 0.2, glideTo: 820 });
}

/** Heavy velvet curtains swishing across. */
function swish(): void {
  const t = now();
  noiseBurst(t, { freq: 2600, q: 0.8, peak: 0.14, attack: 0.03, decay: 0.3, sweepTo: 700 });
  noiseBurst(t + 0.08, { freq: 1600, q: 1, peak: 0.07, attack: 0.03, decay: 0.25, sweepTo: 500 });
}

/** The cross portrait squawking and grumbling (muffled once the curtains shut). */
function grumble(count = 6, muffled = false): void {
  const t = now();
  const r = rng(count * 31 + (muffled ? 7 : 0));
  for (let i = 0; i < count; i++) {
    const f = 300 + (i % 3) * 70 + r() * 40;
    tone(f, t + i * 0.15, { wave: 'triangle', peak: muffled ? 0.045 : 0.1, attack: 0.02, decay: 0.12, glideTo: f * 0.75, vibrato: [30, 25], lowpass: muffled ? 450 : 1200 });
  }
}

/** Sirius's dinner horn: toot, toot, too-oot! */
function toot(): void {
  const t = now();
  const brass = (f: number, at: number, len: number) => {
    tone(f, t + at, { wave: 'sawtooth', peak: 0.08, attack: 0.03, decay: len, vibrato: [5, 3], lowpass: 1300 });
    tone(f, t + at, { wave: 'triangle', peak: 0.07, attack: 0.03, decay: len });
  };
  brass(NOTE.G4, 0, 0.16);
  brass(NOTE.G4, 0.24, 0.16);
  brass(NOTE.C5, 0.5, 0.55);
}

/** A little "meep meep" from the parked car. */
function meep(): void {
  const t = now();
  tone(470, t, { wave: 'square', peak: 0.04, attack: 0.01, decay: 0.09, lowpass: 1300 });
  tone(470, t + 0.16, { wave: 'square', peak: 0.04, attack: 0.01, decay: 0.12, lowpass: 1300 });
}

/** Forks clinking together. */
function clink(): void {
  const t = now();
  [2600, 3100, 2850, 3400].forEach((f, i) => bell(f, t + i * 0.045, 0.045, 0.3));
}

/** A cosy fire crackling in the kitchen. */
function crackle(seconds = 2): void {
  const t = now();
  const r = rng(77);
  noiseBurst(t, { freq: 300, type: 'lowpass', peak: 0.05, attack: 0.4, decay: seconds });
  for (let i = 0; i < 12; i++) noiseBurst(t + r() * seconds, { freq: 2500 + r() * 2000, type: 'highpass', peak: 0.03, decay: 0.03 });
}

// --------------------------------------------------------------------- art

const W = 1180;
const FUR = '#2e2a30';
const FUR_DARK = '#1d1b20';
const FUR_LIGHT = '#4a4450';

function starsAt(count: number, seed: number, maxY: number): Node[] {
  const r = rng(seed);
  const out: Node[] = [];
  for (let i = 0; i < count; i++) {
    const x = r() * W;
    const y = r() * maxY;
    const s = 2 + r() * 3.5;
    const pts: Pt[] = [];
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4;
      const rr = k % 2 ? s * 0.4 : s;
      pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]);
    }
    out.push(piece(poly(pts), r() > 0.8 ? C.goldLight : C.cream, { edge: 'cut', fibre: false, shadow: false, opacity: 0.5 + r() * 0.4 }));
  }
  return out;
}

/** The London street at night: far rooftops, a lamp post, pavement and road. */
function street(): string {
  const r = rng(512);
  const roofs: Node[] = [];
  for (let x = -20; x < W + 20; x += 150) {
    const top = 250 + r() * 70;
    roofs.push(piece(rect(x, top, 146, 400), '#283050', { rough: 1.1 }));
    roofs.push(piece(rect(x + 30 + r() * 60, top - 40, 34, 46), '#283050', { rough: 1 }));
    for (let i = 0; i < 2; i++) {
      if (r() > 0.45) roofs.push(piece(rect(x + 24 + i * 64, top + 40 + r() * 80, 26, 34), '#d9b064', { edge: 'cut', fibre: false, shadow: false, opacity: 0.55 }));
    }
  }
  const slabs: Node[] = [];
  for (let x = 40; x < W; x += 110) slabs.push(ink([[x, 568], [x - 8, 638]], { width: 2, color: '#5e5852', opacity: 0.6 }));
  return svg({ w: W, h: 820, name: 'b5c1-street', boil: false, className: 'backdrop' }, [
    piece(rect(-20, -20, W + 40, 860), C.night, { edge: 'clean', shadow: false }),
    piece(ellipse(590, 560, 900, 300), C.nightLight, { edge: 'cut', fibre: false, shadow: false, opacity: 0.6 }),
    ...starsAt(36, 55, 300),
    // the moon
    piece(circle(206, 92, 36), C.cream, { rough: 0.8 }),
    piece(circle(196, 84, 7), '#e6d6b0', { edge: 'cut', fibre: false, shadow: false }),
    ...roofs,
    // pavement, kerb and road
    piece(rect(-20, 564, W + 40, 80), '#7a746c', { rough: 0.8 }),
    ...slabs,
    piece(rect(-20, 640, W + 40, 14), '#5e5a56', { edge: 'cut' }),
    piece(rect(-20, 654, W + 40, 200), '#3a3940', { rough: 0.8, shadow: false }),
    ...[80, 340, 600, 860, 1120].map((x) => piece(rect(x, 744, 120, 10), '#8c8a86', { edge: 'cut', fibre: false, shadow: false, opacity: 0.5 })),
    // the lamp post, glowing
    piece(circle(150, 236, 74), C.candle, { edge: 'cut', fibre: false, shadow: false, opacity: 0.2 }),
    piece(band([[150, 600], [150, 262]], 12), '#2a2a30'),
    piece(rect(138, 590, 24, 14), '#2a2a30', { edge: 'cut' }),
    piece(poly([[126, 222], [174, 222], [166, 266], [134, 266]]), C.candle, { edge: 'cut' }),
    piece(poly([[120, 222], [150, 198], [180, 222]]), '#2a2a30', { edge: 'cut' }),
    ink([[150, 222], [150, 266]], { width: 2.5, color: '#2a2a30' }),
  ]);
}

/** A window with a frame, panes and a sill. */
const win = (x: number, y: number, w: number, h: number, pane: string, frame: string): Node[] => [
  piece(rect(x - 6, y - 6, w + 12, h + 12), frame, { rough: 0.8 }),
  piece(rect(x, y, w, h), pane, { edge: 'cut', fibre: false, shadow: false }),
  ink([[x + w / 2, y], [x + w / 2, y + h]], { width: 3, color: frame }),
  ink([[x, y + h / 2], [x + w, y + h / 2]], { width: 3, color: frame }),
  piece(rect(x - 10, y + h + 4, w + 20, 8), frame, { edge: 'cut' }),
];

interface HouseLook {
  wall: string;
  stucco: string;
  door: string;
  /** Which of the 6 windows (and the fanlight, last) are lit. */
  lit: boolean[];
  grim?: boolean;
}

/** A tall London terrace house, 300 × 500, with its number on the door. */
function house(n: number, o: HouseLook): string {
  const pane = (i: number) => (o.lit[i] ? '#efc96a' : o.grim ? '#2a3033' : '#2f3550');
  const fan: Pt[] = [];
  for (let i = 0; i <= 12; i++) {
    const a = Math.PI + (i / 12) * Math.PI;
    fan.push([83 + Math.cos(a) * 37, 378 + Math.sin(a) * 37]);
  }
  const rails: Node[] = [];
  for (let x = 156; x <= 288; x += 14) rails.push(ink([[x, 436], [x, 500]], { width: 3, color: C.charcoal }));
  return svg({ w: 300, h: 500, name: `b5c1-house${n}`, boil: false }, [
    // chimney and pots
    piece(rect(196, 8, 54, 70), o.wall, { rough: 1 }),
    piece(rect(204, -8, 14, 20), C.rust, { edge: 'cut' }),
    piece(rect(228, -4, 14, 16), C.rust, { edge: 'cut' }),
    piece(rect(8, 60, 284, 440), o.wall, { rough: 1 }),
    piece(rect(0, 52, 300, 22), o.stucco, { rough: 0.8 }),
    // stucco ground floor
    piece(rect(8, 326, 284, 174), o.stucco, { rough: 0.8, shadow: false }),
    ink([[8, 380], [292, 380]], { width: 1.5, color: '#00000022' }),
    ink([[8, 430], [292, 430]], { width: 1.5, color: '#00000022' }),
    // windows
    ...win(48, 94, 64, 58, pane(0), o.stucco),
    ...win(188, 94, 64, 58, pane(1), o.stucco),
    ...win(48, 186, 64, 100, pane(2), o.stucco),
    ...win(188, 186, 64, 100, pane(3), o.stucco),
    ...win(188, 352, 64, 72, pane(4), o.stucco),
    // front door with a fanlight and number plaque
    piece(poly(fan), o.lit[5] ? '#efc96a' : '#2f3550', { edge: 'cut' }),
    ink([...fan, [83, 378]], { width: 2.5, color: o.stucco }),
    piece(rect(46, 378, 74, 112), o.door, { rough: 0.8 }),
    ink([[83, 384], [83, 486]], { width: 2, color: '#00000033' }),
    piece(rect(64, 404, 38, 30, 4), C.goldLight, { edge: 'cut' }),
    raw(`<text x="83" y="427" text-anchor="middle" font-size="22" font-weight="700" fill="${C.ink}" style="font-family:var(--font-body)">${n}</text>`),
    dot(108, 452, 4, C.gold),
    // steps and railings
    piece(rect(36, 486, 94, 10), C.stoneLight, { edge: 'cut' }),
    piece(rect(26, 494, 114, 10), C.stone, { edge: 'cut' }),
    ink([[150, 440], [294, 440]], { width: 3, color: C.charcoal }),
    ...rails,
    // number 12 is a bit shabby, with a silver snake door knocker
    ...(o.grim
      ? [
          ink([[48, 94], [70, 116], [48, 116]], { width: 1.5, color: '#c8c4bc', opacity: 0.7 }),
          ink([[252, 186], [228, 206], [252, 210]], { width: 1.5, color: '#c8c4bc', opacity: 0.7 }),
          ink([[140, 300], [150, 318], [144, 330], [156, 346]], { width: 2, color: '#2a2628', opacity: 0.6 }),
          ink([[76, 448], [88, 442], [78, 456], [90, 464], [80, 472]], { width: 3.5, color: '#d8dbe0' }),
          dot(89, 442, 3, '#d8dbe0'),
        ]
      : []),
  ]);
}

/** The gloomy-but-friendly front hall of number 12. */
function hall(): string {
  const stripes: Node[] = [];
  for (let x = 20; x < W; x += 80) stripes.push(piece(rect(x, -20, 24, 480), '#73805e', { edge: 'cut', fibre: false, shadow: false }));
  const panels: Node[] = [];
  for (let x = 20; x < W; x += 150) panels.push(ink([[x, 486], [x + 120, 486], [x + 120, 590], [x, 590]], { width: 2.5, color: '#4a3628', closed: true, opacity: 0.6 }));
  const treads: Node[] = [];
  for (let i = 0; i < 8; i++) {
    const x = 990 + i * 26;
    const y = 600 - i * 46;
    treads.push(piece(rect(x, y - 6, 60, 12), '#7a5238', { edge: 'cut' }));
    treads.push(ink([[x + 30, y - 6], [x + 30, y - 96]], { width: 3, color: '#3a2a20' }));
  }
  const lamp = (x: number): Node[] => [
    piece(circle(x, 196, 60), C.candle, { edge: 'cut', fibre: false, shadow: false, opacity: 0.22 }),
    piece(band([[x, 250], [x, 226], [x + 0, 214]], 8), '#3a2a20'),
    piece(poly([[x - 16, 176], [x + 16, 176], [x + 12, 216], [x - 12, 216]]), C.candle, { edge: 'cut' }),
    piece(ellipse(x, 198, 5, 9), C.orange, { edge: 'cut', fibre: false, shadow: false }),
    piece(rect(x - 18, 170, 36, 8), '#3a2a20', { edge: 'cut' }),
  ];
  return svg({ w: W, h: 820, name: 'b5c1-hall', boil: false, className: 'backdrop' }, [
    piece(rect(-20, -20, W + 40, 500), '#7f8a68', { edge: 'clean', shadow: false }),
    ...stripes,
    piece(rect(-20, -10, W + 40, 30), '#5a4232', { edge: 'cut' }),
    // the front door you came in by
    piece(rect(-10, 180, 130, 300), '#3a2a24', { rough: 0.8 }),
    piece(curve([[-10, 182], [55, 130], [120, 182]], 1), '#d9b064', { edge: 'cut' }),
    // wood panelling and the floor
    piece(rect(-20, 452, W + 40, 16), '#5a4232', { edge: 'cut' }),
    piece(rect(-20, 466, W + 40, 150), '#6b4c36', { rough: 0.6, shadow: false }),
    ...panels,
    piece(rect(-20, 610, W + 40, 240), '#4a3628', { rough: 0.6 }),
    ink([[-20, 664], [W + 20, 660]], { width: 2, color: '#3a2a20', opacity: 0.6 }),
    ink([[-20, 724], [W + 20, 728]], { width: 2, color: '#3a2a20', opacity: 0.6 }),
    piece(rect(130, 630, 900, 56, 8), '#7a3a3a', { rough: 0.8 }),
    piece(rect(146, 640, 868, 36, 6), '#8e4a40', { edge: 'cut', fibre: false, shadow: false }),
    // the staircase going up on the right
    piece(band([[970, 616], [1220, 236]], 30), '#5a3a28'),
    ...treads,
    piece(band([[1000, 520], [1230, 140]], 10), '#3a2a20'),
    // gas lamps and the curtain rail
    ...lamp(320),
    ...lamp(880),
    piece(band([[384, 46], [796, 46]], 10), C.gold, { edge: 'cut' }),
    piece(circle(380, 46, 10), C.gold, { edge: 'cut' }),
    piece(circle(800, 46, 10), C.gold, { edge: 'cut' }),
  ]);
}

/** The cross old lady in the portrait, shouting her head off. */
function lady(): string {
  const [cx, cy] = HEAD;
  const hair = '#2f2a2e';
  return person({
    name: 'b5c1-lady',
    label: 'a grumpy portrait',
    skin: '#ead7c4',
    eyes: '#4a4a52',
    eyeStyle: 'narrow',
    mouth: 'open',
    brows: 'cross',
    browColor: hair,
    nose: 'pointy',
    blush: false,
    back: [piece(ellipse(cx, cy - 34, 70, 56), hair), piece(circle(cx, cy - 100, 34), hair)],
    front: [
      piece(curve([[cx - 64, cy - 10], [cx - 50, cy - 70], [cx, cy - 82], [cx + 50, cy - 70], [cx + 64, cy - 10], [cx + 20, cy - 54], [cx - 20, cy - 54]], 2), hair),
      ink([[cx + 12, cy - 78], [cx + 30, cy - 60], [cx + 50, cy - 30]], { width: 6, color: '#9b9a96' }),
    ],
    body: [
      piece(curve([[40, 345], [52, 262], [104, 230], [150, 226], [196, 230], [248, 262], [260, 345]], 2), '#3a2e3a'),
      piece(curve([[110, 226], [150, 262], [190, 226], [176, 248], [150, 270], [124, 248]], 2), C.white, { fibre: false }),
      piece(circle(150, 272, 9), C.gold, { edge: 'cut' }),
    ],
  });
}

/** The lady in her gilt frame (340 × 380), with little angry shout marks. */
function portrait(): string {
  const inner = /<svg[^>]*>([\s\S]*)<\/svg>\s*$/.exec(lady())?.[1] ?? '';
  return svg({ w: 340, h: 380, name: 'b5c1-portrait', boil: true }, [
    piece(rect(0, 0, 340, 380, 8), C.gold, { rough: 1.2 }),
    piece(rect(14, 14, 312, 352, 4), '#b8862f', { edge: 'cut' }),
    piece(rect(26, 26, 288, 328), '#3e3236', { edge: 'cut', fibre: false }),
    raw(`<g transform="translate(26 30) scale(0.96)">${inner}</g>`),
    ink([[256, 196], [292, 184]], { width: 4, color: C.cream }),
    ink([[256, 214], [296, 216]], { width: 4, color: C.cream }),
    ink([[84, 196], [48, 184]], { width: 4, color: C.cream }),
    ink([[84, 214], [44, 216]], { width: 4, color: C.cream }),
  ]);
}

/** One moth-eaten velvet curtain, 200 × 410. */
function curtain(): string {
  return svg({ w: 200, h: 410, name: 'b5c1-curtain', boil: false }, [
    piece(poly([[0, 0], [200, 0], [204, 384], [150, 400], [100, 390], [50, 404], [0, 388]]), '#6e2f3c', { rough: 1.2 }),
    ...[30, 80, 130, 176].map((x) => piece(rect(x - 8, 6, 16, 380), '#58232f', { fibre: false, shadow: false, rough: 1.4 })),
    dot(60, 120, 4, '#2a1a1e'),
    dot(146, 262, 3, '#2a1a1e'),
    dot(108, 330, 5, '#2a1a1e'),
    piece(band([[0, 388], [50, 400], [100, 390], [150, 400], [204, 384]], 10), C.gold, { edge: 'cut' }),
  ]);
}

/** A big, shaggy, happy black dog (400 × 300), facing left. */
function dogArt(): string {
  const head: Pt[] = [];
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    head.push([92 + Math.cos(a) * 54, 104 + Math.sin(a) * 50]);
  }
  return svg({ w: 400, h: 300, name: 'b5c1-dog', label: 'a big black dog' }, [
    piece(ellipse(210, 290, 160, 12), 'rgba(40,25,10,0.18)', { edge: 'cut', fibre: false, shadow: false }),
    // wagging tail
    group({ part: 'tail' }, [piece(band([[330, 150], [362, 122], [380, 84], [374, 46]], 28), FUR), fluff([[364, 40], [388, 50], [384, 80], [362, 70]], FUR, 8)]),
    // far legs
    piece(band([[300, 200], [306, 286]], 32), FUR_DARK),
    piece(band([[124, 200], [120, 286]], 30), FUR_DARK),
    // body
    fluff([[100, 120], [180, 104], [270, 108], [340, 130], [352, 190], [320, 230], [220, 236], [130, 232], [94, 190]], FUR, 12),
    piece(ellipse(220, 150, 80, 22), FUR_LIGHT, { edge: 'cut', fibre: false, shadow: false, opacity: 0.6 }),
    // near legs and paws
    piece(band([[320, 200], [330, 284]], 36), FUR),
    piece(band([[146, 204], [152, 284]], 32), FUR),
    piece(ellipse(334, 288, 24, 11), FUR_LIGHT),
    piece(ellipse(154, 288, 22, 11), FUR_LIGHT),
    // head, snout, nose
    fluff(head, FUR, 10),
    piece(ellipse(42, 126, 42, 26), FUR),
    piece(curve([[14, 140], [60, 138], [56, 156], [24, 154]], 2), '#8a3a40', { edge: 'cut', fibre: false }),
    group({ part: 'tongue', opacity: 0 }, [
      piece(curve([[22, 146], [50, 146], [52, 190], [36, 202], [20, 188]], 2), C.rose, { edge: 'cut' }),
      ink([[36, 152], [36, 186]], { width: 2.5, color: '#9a4a50' }),
    ]),
    piece(ellipse(10, 118, 14, 11), C.ink, { edge: 'cut' }),
    dot(6, 113, 3, C.white, 0.8),
    eye(76, 92, 11),
    ink([[62, 74], [90, 72]], { width: 5, color: FUR_LIGHT }),
    // floppy ear
    piece(curve([[110, 66], [144, 76], [150, 140], [128, 162], [106, 120]], 2), FUR_DARK),
  ]);
}

/** The basement kitchen: stone walls, a crackling fire, copper pans. */
function kitchen(): string {
  const blocks: Node[] = [];
  for (let row = 0; row < 10; row++) {
    const y = 60 + row * 58;
    blocks.push(ink([[-20, y], [W + 20, y]], { width: 2, color: '#7c6a56', opacity: 0.6 }));
    for (let x = (row % 2) * 60; x < W; x += 120) blocks.push(ink([[x, y], [x, y + 58]], { width: 2, color: '#7c6a56', opacity: 0.6 }));
  }
  const pan = (x: number, y: number, r: number): Node[] => [
    ink([[x, 24], [x, y - r]], { width: 2, color: '#3a2a20' }),
    piece(circle(x, y, r), C.rust),
    piece(circle(x - r * 0.25, y - r * 0.25, r * 0.4), '#d98a63', { edge: 'cut', fibre: false, shadow: false, opacity: 0.6 }),
    piece(band([[x, y + r - 4], [x, y + r + 40]], 9), '#7a3a26', { edge: 'cut' }),
  ];
  return svg({ w: W, h: 820, name: 'b5c1-kitchen', boil: false, className: 'backdrop' }, [
    piece(rect(-20, -20, W + 40, 640), '#9a8670', { edge: 'clean', shadow: false }),
    ...blocks,
    piece(rect(-20, -20, W + 40, 46), '#4a3628', { rough: 0.8 }),
    // shelf with plates and jars on the left
    piece(band([[40, 206], [420, 206]], 14), C.wood),
    ...[80, 140, 200].map((x) => piece(circle(x, 172, 28), C.cream, { edge: 'cut' })),
    ...[80, 140, 200].map((x) => piece(circle(x, 172, 16), '#e6d6b0', { edge: 'cut', fibre: false, shadow: false })),
    piece(rect(250, 158, 40, 42, 6), '#8fb4c8', { edge: 'cut' }),
    piece(rect(306, 150, 46, 50, 6), '#c4706c', { edge: 'cut' }),
    piece(rect(366, 166, 36, 34, 6), '#b8a36a', { edge: 'cut' }),
    // copper pans hanging on the right
    ...pan(860, 150, 30),
    ...pan(940, 130, 36),
    ...pan(1030, 160, 28),
    ...pan(1110, 136, 32),
    // the fireplace, with a cosy fire
    piece(circle(590, 470, 170), C.candle, { edge: 'cut', fibre: false, shadow: false, opacity: 0.22 }),
    piece(rect(450, 250, 280, 360), '#7a6a5a', { rough: 1 }),
    piece(rect(426, 236, 328, 26), '#5a4232', { edge: 'cut' }),
    piece(curve([[492, 610], [492, 340], [590, 296], [688, 340], [688, 610]], 2), '#2a1e1a', { rough: 0.8 }),
    piece(curve([[500, 570], [530, 470], [556, 520], [584, 430], [612, 510], [640, 460], [676, 570]], 2), C.orange),
    piece(curve([[530, 570], [560, 500], [588, 470], [616, 520], [646, 570]], 2), C.yellow, { fibre: false }),
    piece(band([[510, 576], [670, 566]], 18), C.brownDark),
    // a lantern hanging from the beam
    ink([[590, 24], [590, 92]], { width: 3, color: '#3a2a20' }),
    piece(circle(590, 124, 46), C.candle, { edge: 'cut', fibre: false, shadow: false, opacity: 0.3 }),
    piece(rect(570, 92, 40, 54, 6), C.gold, { edge: 'cut' }),
    piece(rect(578, 100, 24, 38, 4), C.candle, { edge: 'cut', fibre: false }),
    // flagstone floor
    piece(rect(-20, 600, W + 40, 240), '#5e5246', { rough: 0.6 }),
  ]);
}

/** The long kitchen table (1140 × 170), plates laid. */
function table(plates: number[]): string {
  return svg({ w: 1140, h: 170, name: 'b5c1-table', boil: false }, [
    piece(rect(36, 64, 36, 88), '#6a4330'),
    piece(rect(1068, 64, 36, 88), '#6a4330'),
    piece(rect(16, 28, 1108, 44), '#7a4e33', { rough: 0.8 }),
    piece(rect(0, 0, 1140, 34, 4), '#a06d43', { rough: 0.8 }),
    ink([[10, 8], [1130, 8]], { width: 2, color: '#c49a6c', opacity: 0.7 }),
    ...plates.flatMap((x) => [piece(ellipse(x, 14, 58, 11), C.cream, { edge: 'cut' }), piece(ellipse(x, 14, 38, 6), '#e6d6b0', { edge: 'clean', shadow: false })]),
    // a bowl of potatoes
    piece(ellipse(690, -4, 30, 14), C.tan, { edge: 'cut' }),
    piece(ellipse(670, 2, 16, 10), C.sand, { edge: 'cut' }),
    piece(ellipse(706, 0, 15, 10), C.sand, { edge: 'cut' }),
    piece(curve([[646, 0], [734, 0], [720, 22], [660, 22]], 2), C.blue),
  ]);
}

// ---------------------------------------------------------------- helpers

/** Bounds along in big doggy leaps, with a crouch first and a squash on every landing. */
async function bound(k: Kit, el: HTMLElement, dx: number, hops: number, height = 40, each = 0.3): Promise<void> {
  if (k.calm) return k.to(el, each * hops, { x: `+=${dx}` });
  await k.to(el, 0.1, { scaleY: 0.92, transformOrigin: '50% 100%' });
  for (let i = 0; i < hops; i++) {
    await k.all(
      k.to(el, each, { x: `+=${dx / hops}`, ease: 'none' }),
      k.to(el, each / 2, { y: `-=${height}`, scaleY: 1, scaleX: 1, rotation: dx < 0 ? 4 : -4, ease: 'power1.out' }).then(() => k.to(el, each / 2, { y: `+=${height}`, rotation: 0, ease: 'power1.in' })),
    );
    k.fx.thud();
    await k.to(el, 0.08, { scaleY: 0.9, scaleX: 1.08, transformOrigin: '50% 100%' });
    await k.to(el, 0.15, { scaleY: 1, scaleX: 1, ease: 'back.out(3)' });
  }
}

// ------------------------------------------------------------------- story

export default defineStory({
  lines: {
    intro: { who: 'narrator', text: 'Number eleven… number thirteen… but where’s number twelve?' },
    lick: { who: 'narrator', text: 'Woof! A big shaggy dog bounds up… and licks your face! Slurp!' },
    fooled: { who: 'sirius', text: 'Ha ha! Fooled you! It’s only me, Sirius. Welcome to my house!' },
    portrait: { who: 'sirius', text: 'Oh no, we’ve woken the grumpy old portrait! Quick, {name}, shut the curtains!' },
    dinner: { who: 'sirius', text: 'Phew! Thank you. Now… who’s hungry? Dinner time!' },
    jam: { who: 'moody', text: 'Constant vigilance! Mmm… and pass the jam, please!' },
    end: { who: 'sirius', text: 'Cheers, everyone! Welcome to the Order of the Phoenix!' },
  },

  async play(k) {
    // ---- Outside: a quiet London street at night.
    k.music('magic');
    k.backdrop(street());
    k.ambient('stars', { count: 20, area: [0, 0, 1180, 260], z: 5 });
    k.dim(0.3);
    const star = k.picture('star', { x: 960, y: 120, w: 110, z: 3 });
    k.float(star, 6, 2.6);
    const h12 = k.add(house(12, { wall: '#4e4846', stucco: '#8a837a', door: '#1e1e22', lit: [false, false, false, true, false, true], grim: true }), { x: 440, y: 80, w: 300, z: 4, still: true });
    k.set(h12, { scaleX: 0.02, scaleY: 0.85, transformOrigin: '50% 100%', opacity: 0 });
    const h11 = k.add(house(11, { wall: '#7a5444', stucco: '#d8cdb6', door: C.blueDark, lit: [true, false, true, false, true, false] }), { x: 290, y: 80, w: 300, z: 5, still: true });
    const h13 = k.add(house(13, { wall: '#6a5a4e', stucco: '#cfc6b2', door: C.red, lit: [false, true, false, true, false, true] }), { x: 590, y: 80, w: 300, z: 5, still: true });
    for (const el of [h11, h13]) k.set(el, { transformOrigin: '50% 100%' });
    const car = k.picture('car', { x: 880, y: 420, w: 280, z: 12 });
    const hero = k.character('hero', { x: 20, y: 345, z: 20 });
    k.set(hero, { x: -320 });

    k.fx.wind(2);
    k.fx.patter(5, 0.12);
    await k.walk(hero, 320, 0.7, 3);
    k.fx.twinkle();
    void k.pop(star, 1.2);
    await k.say('intro');

    // Creak… the houses shuffle apart, and number 12 squeezes out between them!
    housesCreak();
    void k.camera({ zoom: 1.3, x: 590, y: 380 }, 1.6);
    k.set(h12, { opacity: 1 });
    await k.all(
      k.to(h11, 1.8, { x: -150, ease: 'power1.inOut' }),
      k.to(h13, 1.8, { x: 150, ease: 'power1.inOut' }),
      k.to(h11, 0.45, { rotation: -2.5 }).then(() => k.to(h11, 0.6, { rotation: 1.5 })).then(() => k.to(h11, 0.6, { rotation: 0 })),
      k.to(h13, 0.45, { rotation: 2.5 }).then(() => k.to(h13, 0.6, { rotation: -1.5 })).then(() => k.to(h13, 0.6, { rotation: 0 })),
      k.wait(400).then(() => k.to(h12, 1.4, { scaleX: 1, scaleY: 1, ease: 'back.out(1.3)' })),
      k.wait(900).then(() => {
        meep();
        return k.hop(car, 18, 1);
      }),
      k.shake(hero, 8, 2),
    );
    k.sfx.reveal();
    k.fx.pop();
    k.puff(590, 560, 200, C.stone);
    k.sparkle(590, 300, 16, 200);
    k.fx.twinkle();
    k.light(150, 236, 120, { color: C.candle, flicker: true });
    k.light(590, 440, 140, { color: '#efc96a', strength: 0.3 });
    await k.hop(hero, 40, 1);

    // Up to the door of number 12…
    void k.camera({}, 1);
    k.fx.patter(6, 0.12);
    await k.walk(hero, 260, 0.8, 3);
    k.fx.knock(3);
    await k.wait(300);
    k.fx.creak();
    await k.wait(100);

    // ---- Inside the front hall.
    let dog!: HTMLElement;
    let sirius!: HTMLElement;
    let horn!: HTMLElement;
    let hero2!: HTMLElement;
    let portraitEl!: HTMLElement;
    let curtL!: HTMLElement;
    let curtR!: HTMLElement;
    await k.cut(() => {
      k.backdrop(hall());
      k.ambient('dust', { z: 30 });
      k.dim(0.2);
      k.light(320, 196, 110, { color: C.candle, flicker: true });
      k.light(880, 196, 110, { color: C.candle, flicker: true });
      portraitEl = k.add(portrait(), { x: 420, y: 58, w: 340, z: 6 });
      curtL = k.add(curtain(), { x: 396, y: 40, w: 200, z: 7, still: true });
      curtR = k.add(curtain(), { x: 584, y: 40, w: 200, z: 7, still: true, flip: true });
      k.set(curtL, { transformOrigin: '0% 0%' });
      k.set(curtR, { transformOrigin: '100% 0%' });
      hero2 = k.character('hero', { x: 60, y: 340, z: 20 });
      sirius = k.character('sirius', { x: 760, y: 340, z: 22 });
      k.set(sirius, { opacity: 0 });
      horn = k.picture('horn', { x: 860, y: 400, w: 200, z: 23 });
      k.set(horn, { opacity: 0 });
      dog = k.add(dogArt(), { x: 720, y: 365, w: 380, z: 24 });
      k.set(dog, { x: 560 });
    });
    const tail = dog.querySelector<SVGGElement>('[data-part="tail"]');
    const tongue = dog.querySelector<SVGGElement>('[data-part="tongue"]');
    const wag = tail && !k.calm ? gsap.to(tail, { rotation: 22, svgOrigin: '330 150', duration: 0.16, yoyo: true, repeat: -1, ease: 'steps(1)' }) : null;

    // A big shaggy dog bounds in, barking happily, right up to you…
    happyBarks(3);
    await bound(k, dog, -950, 3, 46, 0.25);

    // …and gives you a great big lick!
    void k.camera({ zoom: 1.4, x: 300, y: 480 }, 0.6);
    await k.all(
      k.say('lick'),
      (async () => {
        await k.wait(500);
        tongue?.setAttribute('opacity', '1');
        for (let i = 0; i < 3; i++) {
          slurp();
          await k.all(k.to(dog, 0.18, { rotation: 6, y: '-=10' }).then(() => k.to(dog, 0.18, { rotation: 0, y: '+=10' })), k.shake(hero2, 5, 1));
        }
        tongue?.setAttribute('opacity', '0');
      })(),
    );
    await bound(k, dog, 520, 1, 30);

    // Pop! The dog turns into Sirius, laughing.
    void k.camera({}, 0.9);
    k.fx.poof();
    k.puff(900, 520, 300, '#3a3438');
    wag?.kill();
    await k.vanish(dog, 0.3);
    k.fx.twinkle();
    await k.appear(sirius, 0.4);
    await k.all(k.say('fooled', sirius), k.wait(300).then(() => k.shake(sirius, 6, 2)), k.hop(hero2, 30, 1));

    // All that noise wakes the cross old portrait!
    swish();
    void k.camera({ zoom: 1.3, x: 590, y: 320 }, 0.7);
    await k.all(k.to(curtL, 0.35, { scaleX: 0.2, ease: 'power2.out' }), k.to(curtR, 0.35, { scaleX: 0.2, ease: 'power2.out' }));
    grumble(7);
    await k.all(k.shake(portraitEl, 5, 2), k.shake(hero2, 8, 1), k.shake(sirius, 8, 1));
    await k.all(
      k.say('portrait', sirius),
      (async () => {
        await k.wait(900);
        grumble(5);
        await k.shake(portraitEl, 4, 3);
      })(),
    );

    // You wave your wand… swish! The curtains snap shut.
    k.fx.spell();
    await k.beam([275, 512], [590, 250]);
    swish();
    await k.all(k.to(curtL, 0.25, { scaleX: 1, ease: 'back.out(1.6)' }), k.to(curtR, 0.25, { scaleX: 1, ease: 'back.out(1.6)' }));
    void k.camera({}, 0.9);
    grumble(4, true);
    await k.wait(100);
    k.fx.twinkle();
    await k.all(k.hop(hero2, 40, 1), k.hop(sirius, 30, 1));

    // Dinner time! Sirius toots his horn just before he finishes speaking.
    await k.all(
      k.say('dinner', sirius),
      k.wait(2400).then(async () => {
        k.fx.pop();
        await k.appear(horn, 0.3);
        toot();
        await k.all(k.to(horn, 0.2, { scale: 1.15, rotation: -6 }).then(() => k.to(horn, 0.2, { scale: 1, rotation: 0 })).then(() => k.pop(horn, 1.15)), k.hop(sirius, 20, 2));
      }),
    );

    // ---- Down in the kitchen: a cosy Order dinner.
    const at = { hero: 40, sirius: 290, lupin: 660, moody: 910 };
    const forks: HTMLElement[] = [];
    let jar!: HTMLElement;
    let moody!: HTMLElement;
    let sirius3!: HTMLElement;
    const crew: HTMLElement[] = [];
    await k.cut(() => {
      k.music('cosy');
      k.backdrop(kitchen());
      k.ambient('embers', { area: [480, 300, 220, 300], z: 5 });
      k.dim(0.15);
      k.light(590, 500, 260, { color: C.orange, flicker: true });
      k.light(590, 124, 90, { color: C.candle });
      const char = (id: string, x: number) => k.character(id, { x, y: 290, w: 230, z: 20 });
      crew.push(char('hero', at.hero));
      sirius3 = char('sirius', at.sirius);
      crew.push(sirius3, char('lupin', at.lupin));
      moody = char('moody', at.moody);
      crew.push(moody);
      const centres = Object.values(at).map((x) => x + 115);
      k.add(table(centres.map((x) => x - 20)), { x: 20, y: 528, w: 1140, z: 30, still: true });
      for (const x of centres) {
        const f = k.picture('fork', { x: x + 15, y: 452, w: 90, z: 32 });
        k.set(f, { transformOrigin: '50% 90%' });
        forks.push(f);
      }
      jar = k.picture('jar', { x: 530, y: 425, w: 130, z: 33 });
    });
    crackle(2.5);
    k.float(crew[0], 3, 2.4);
    k.float(crew[2], 3, 2.4);
    clink();

    // Moody wants the jam… Lupin sends it flying down the table.
    await k.say('jam', moody);
    k.fx.spell();
    await k.beam([775, 442], [595, 480]);
    k.fx.whizz();
    void k.camera({ zoom: 1.35, x: 800, y: 440 }, 1);
    await k.all(
      k.to(jar, 0.5, { x: 820, ease: 'power2.out' }),
      k.to(jar, 0.25, { y: '-=40', ease: 'power1.out' }).then(() => k.to(jar, 0.25, { y: '+=40', ease: 'power1.in' })),
    );
    k.fx.pop();
    await k.all(k.pop(jar, 1.15), k.hop(moody, 30, 1));

    // Forks clink, everyone cheers!
    const clinkForks = async () => {
      await k.all(
        ...forks.map((f, i) =>
          k.wait(i * 60).then(() => {
            clink();
            return k.to(f, 0.18, { rotation: i < 2 ? 22 : -22 }).then(() => k.to(f, 0.25, { rotation: 0, ease: 'back.out(2)' }));
          }),
        ),
      );
    };
    void k.camera({}, 1.2);
    k.fx.jingle();
    k.confetti(36);
    k.sparkle(590, 420, 16, 200);
    await k.all(
      k.say('end', sirius3),
      (async () => {
        await clinkForks();
        await k.hop(sirius3, 30, 1);
      })(),
    );
    crackle(1.5);
    await k.wait(1500);
  },
});
