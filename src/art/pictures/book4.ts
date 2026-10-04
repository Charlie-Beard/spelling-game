/** Book 4 — The Goblet of Fire. ai, ee, igh, oa, oo. */
import { C } from '../palette';
import { band, circle, curve, dot, ellipse, ink, piece, poly, rect, svg, type Node, type Pt } from '../paper';
import { blush, eye, ground, shine, smile } from './kit';

const pic = (name: string, label: string, nodes: Parameters<typeof svg>[1]) => svg({ w: 400, h: 400, name, label }, nodes);

const sparkle = (x: number, y: number, r: number, color: string = C.goldLight): Node =>
  piece(poly([[x, y - r], [x + r * 0.25, y - r * 0.25], [x + r, y], [x + r * 0.25, y + r * 0.25], [x, y + r], [x - r * 0.25, y + r * 0.25], [x - r, y], [x - r * 0.25, y - r * 0.25]]), color, { edge: 'cut', fibre: false });

const cloudShape = (cx: number, cy: number, s: number, color: string): Node =>
  piece(curve([[cx - 110 * s, cy + 30 * s], [cx - 120 * s, cy - 10 * s], [cx - 70 * s, cy - 40 * s], [cx - 30 * s, cy - 80 * s], [cx + 40 * s, cy - 70 * s], [cx + 80 * s, cy - 40 * s], [cx + 120 * s, cy - 20 * s], [cx + 120 * s, cy + 30 * s]], 3), color);

/** Rain from a cloud. */
export function rain(): string {
  const drops = [[120, 250], [170, 290], [220, 250], [270, 290], [150, 340], [250, 340], [200, 320]];
  return pic('rain', 'rain', [
    cloudShape(200, 170, 1.2, C.stoneLight),
    ...drops.map(([x, y]) => piece(curve([[x, y - 24], [x + 12, y], [x, y + 10], [x - 12, y]], 2), C.blue, { edge: 'cut' })),
  ]);
}

/** A mermaid's tail (from the Black Lake). */
export function tail(): string {
  const scales = [];
  for (let r = 0; r < 4; r++) for (let k = 0; k < 3; k++) scales.push(ink([[150 + k * 30 + (r % 2) * 15, 110 + r * 34], [165 + k * 30 + (r % 2) * 15, 124 + r * 34], [180 + k * 30 + (r % 2) * 15, 110 + r * 34]], { width: 3, color: C.greenDeep, opacity: 0.6 }));
  return pic('tail', 'a tail', [
    piece(curve([[140, 80], [260, 80], [250, 200], [220, 280], [200, 300], [180, 280], [150, 200]], 2), C.teal),
    ...scales,
    piece(curve([[200, 290], [110, 310], [60, 370], [140, 350], [200, 320], [260, 350], [340, 370], [290, 310]], 2), C.teal),
    piece(rect(140, 70, 120, 20, 6), C.gold, { fibre: false }),
  ]);
}

/** A bumble bee. */
export function bee(): string {
  return pic('bee', 'a bee', [
    piece(ellipse(160, 140, 50, 70, -30), 'rgba(220,235,245,0.9)'),
    piece(ellipse(240, 140, 50, 70, 30), 'rgba(220,235,245,0.9)'),
    piece(poly([[310, 230], [350, 220], [312, 250]]), C.ink, { edge: 'cut', fibre: false }),
    piece(ellipse(220, 230, 100, 76), C.yellow),
    piece(rect(190, 158, 30, 146, 4), C.ink, { fibre: false, shadow: false }),
    piece(rect(250, 164, 28, 134, 4), C.ink, { fibre: false, shadow: false }),
    piece(circle(130, 222, 58), C.ink),
    eye(116, 210, 12),
    eye(150, 210, 12),
    smile(132, 238, 28, C.white, 3),
    ink([[110, 170], [90, 120]], { width: 4 }),
    ink([[140, 168], [150, 116]], { width: 4 }),
    dot(90, 118, 7, C.ink),
    dot(150, 114, 7, C.ink),
  ]);
}

/** Two bare feet. */
export function feet(): string {
  const foot = (x: number, flip: 1 | -1): Node[] => [
    piece(curve([[x, 130], [x + 50 * flip, 140], [x + 60 * flip, 240], [x + 40 * flip, 340], [x - 10 * flip, 340], [x - 20 * flip, 240], [x - 10 * flip, 160]], 2), C.skin),
    ...[0, 1, 2, 3, 4].map((k) => piece(circle(x - 14 * flip + k * 16 * flip, 110 + Math.abs(k - 1.5) * 6, 10 - k), C.skin, { edge: 'cut' })),
  ];
  return pic('feet', 'feet', [ground(200, 350, 150), ...foot(130, 1), ...foot(270, -1)]);
}

/** A fluffy sheep. */
export function sheep(): string {
  const wool: Pt[] = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    wool.push([210 + Math.cos(a) * 110, 220 + Math.sin(a) * 70]);
  }
  return pic('sheep', 'a sheep', [
    ground(200, 350, 140),
    ...[140, 180, 240, 280].map((x) => piece(rect(x - 10, 260, 20, 84, 6), C.charcoal)),
    ...wool.map(([x, y]) => piece(circle(x, y, 44), '#eee5d0')),
    piece(ellipse(210, 220, 110, 70), '#eee5d0', { fibre: false }),
    piece(ellipse(104, 186, 50, 58), C.charcoal),
    piece(ellipse(66, 170, 24, 12, -30), C.charcoal),
    piece(ellipse(140, 160, 24, 12, 30), C.charcoal),
    eye(92, 180, 9),
    eye(118, 180, 9),
    piece(circle(104, 140, 22), '#eee5d0'),
  ]);
}

/** Night: the moon and stars over the hills. */
export function night(): string {
  return pic('night', 'night', [
    piece(rect(20, 20, 360, 360, 40), C.night, { shadow: false }),
    piece(circle(270, 120, 54), C.cream),
    piece(circle(296, 104, 46), C.night, { edge: 'cut', fibre: false, shadow: false }),
    sparkle(110, 90, 14), sparkle(170, 160, 9), sparkle(90, 200, 8), sparkle(330, 210, 10), sparkle(220, 70, 8),
    piece(curve([[24, 300], [120, 250], [220, 290], [300, 250], [376, 280], [376, 340], [340, 376], [60, 376], [24, 340]], 2), C.nightLight),
  ]);
}

/** Light: a wand with a glowing tip (Lumos!). */
export function light(): string {
  return pic('light', 'light', [
    piece(circle(276, 124, 96), 'rgba(255,233,160,0.45)', { edge: 'cut', fibre: false, shadow: false }),
    piece(circle(276, 124, 62), 'rgba(255,236,170,0.75)', { edge: 'cut', fibre: false, shadow: false }),
    piece(band([[90, 340], [260, 140]], 16), C.brownDark),
    piece(circle(266, 132, 26), C.white, { edge: 'cut', fibre: false }),
    ...[0, 1, 2, 3, 4, 5, 6, 7].map((k) => {
      const a = (k / 8) * Math.PI * 2;
      return ink([[266 + Math.cos(a) * 40, 132 + Math.sin(a) * 40], [266 + Math.cos(a) * 64, 132 + Math.sin(a) * 64]], { width: 6, color: C.gold });
    }),
  ]);
}

/** A little Hogwarts rowing boat with a lantern. */
export function boat(): string {
  return pic('boat', 'a boat', [
    piece(curve([[20, 300], [120, 284], [200, 304], [280, 284], [380, 300], [380, 360], [20, 360]], 2), C.blue, { fibre: false }),
    piece(curve([[60, 220], [340, 220], [300, 300], [100, 300]], 2), C.wood),
    piece(rect(70, 220, 260, 16, 4), C.brownDark, { fibre: false }),
    piece(band([[300, 226], [310, 120]], 8), C.brownDark),
    piece(rect(296, 120, 34, 40, 6), C.gold),
    piece(rect(302, 126, 22, 28, 4), C.candle, { edge: 'cut', fibre: false }),
    ink([[200, 230], [140, 310]], { width: 7, color: C.brown }),
  ]);
}

/** A goat. */
export function goat(): string {
  return pic('goat', 'a goat', [
    ground(200, 350, 140),
    ...[120, 160, 250, 290].map((x) => piece(rect(x - 9, 250, 18, 94, 6), C.stoneLight)),
    piece(curve([[90, 260], [100, 190], [220, 180], [320, 200], [320, 270], [200, 290]], 2), '#d9cdb8'),
    piece(curve([[270, 200], [300, 120], [340, 100], [370, 130], [360, 190], [320, 220]], 2), '#d9cdb8'),
    piece(curve([[316, 108], [300, 50], [330, 40], [330, 100]], 2), C.tan),
    piece(curve([[346, 104], [350, 50], [376, 56], [360, 110]], 2), C.tan),
    eye(336, 140, 8, false),
    piece(curve([[340, 200], [350, 240], [330, 250]], 2), C.white),
    piece(ellipse(370, 168, 8, 6), C.rose, { edge: 'cut' }),
    piece(ellipse(84, 220, 12, 20, 30), '#d9cdb8'),
  ]);
}

/** A warm coat. */
export function coat(): string {
  return pic('coat', 'a coat', [
    piece(curve([[110, 90], [150, 70], [200, 100], [250, 70], [290, 90], [350, 150], [320, 230], [290, 200], [300, 360], [100, 360], [110, 200], [80, 230], [50, 150]], 2), C.red),
    piece(poly([[150, 70], [200, 150], [250, 70], [230, 66], [200, 110], [170, 66]]), C.redDark, { fibre: false }),
    ink([[200, 150], [200, 360]], { width: 3, color: C.redDark }),
    ...[180, 230, 280, 330].map((y) => piece(circle(220, y, 9), C.gold, { edge: 'cut' })),
    piece(rect(130, 260, 50, 40, 6), C.redDark, { fibre: false }),
    piece(rect(230, 260, 50, 40, 6), C.redDark, { fibre: false }),
  ]);
}

/** A crescent moon. */
export function moon(): string {
  return pic('moon', 'the moon', [
    piece(curve([[260, 60], [170, 90], [130, 200], [180, 310], [280, 340], [210, 280], [200, 180], [230, 110]], 3), C.yellow),
    eye(196, 190, 9, false),
    smile(206, 240, 26, C.brown, 3),
    blush(214, 214, 9),
    sparkle(320, 120, 16, C.gold),
    sparkle(90, 140, 10, C.gold),
    sparkle(320, 280, 10, C.gold),
  ]);
}

/** A broomstick. */
export function broom(): string {
  const bristles = Array.from({ length: 9 }, (_, i) => ink([[220 + i * 3, 240 - i * 3], [314 + i * 6, 296 - i * 13]], { width: 4, color: C.brown }));
  return pic('broom', 'a broom', [
    piece(band([[20, 110], [240, 230]], 16), C.wood),
    piece(curve([[220, 210], [300, 190], [350, 250], [340, 320], [260, 280], [220, 250]], 2), C.yellow),
    ...bristles,
    piece(band([[210, 210], [232, 254]], 18), C.brownDark),
    ink([[70, 136], [90, 146]], { width: 4, color: C.gold }),
  ]);
}

/** A wellington boot. */
export function boot(): string {
  return pic('boot', 'a boot', [
    ground(200, 352, 140),
    piece(curve([[130, 80], [240, 80], [240, 250], [330, 280], [340, 350], [120, 350], [120, 250]], 2), C.green),
    piece(rect(120, 330, 222, 22, 6), C.greenDeep, { fibre: false }),
    piece(rect(124, 76, 120, 26, 6), C.greenDark, { fibre: false }),
    shine([[140, 120], [152, 120], [152, 280], [140, 280]], 0.35),
  ]);
}

/** A spell book. */
export function book(): string {
  return pic('book', 'a book', [
    ground(200, 340, 150),
    piece(poly([[70, 140], [200, 120], [330, 140], [330, 320], [200, 300], [70, 320]]), C.brownDark),
    piece(poly([[84, 130], [200, 112], [200, 290], [84, 306]]), C.cream),
    piece(poly([[316, 130], [200, 112], [200, 290], [316, 306]]), C.white),
    ...[150, 180, 210, 240].map((y) => ink([[104, y], [184, y - 10]], { width: 3, color: C.tan })),
    ...[150, 180, 210, 240].map((y) => ink([[216, y - 10], [296, y]], { width: 3, color: C.tan })),
    piece(poly([[240, 112], [262, 112], [262, 170], [251, 160], [240, 170]]), C.red, { edge: 'cut', fibre: false }),
  ]);
}

/** A coat hook. */
export function hook(): string {
  return pic('hook', 'a hook', [
    piece(rect(60, 70, 280, 50, 8), C.wood),
    piece(circle(110, 95, 7), C.brownDark, { edge: 'clean', shadow: false }),
    piece(circle(290, 95, 7), C.brownDark, { edge: 'clean', shadow: false }),
    ink([[200, 110], [200, 220], [190, 280], [150, 300], [120, 270], [130, 240]], { width: 18, color: C.stone }),
    ink([[200, 110], [200, 220], [190, 280], [150, 300], [120, 270], [130, 240]], { width: 9, color: C.stoneLight }),
    piece(circle(200, 112, 18), C.stone),
  ]);
}

/** A toad (warty, brown). */
export function toad(): string {
  const wart = (x: number, y: number, r = 6) => piece(circle(x, y, r), '#6d5a3a', { edge: 'cut', fibre: false, shadow: false });
  return pic('toad', 'a toad', [
    ground(200, 340, 140),
    piece(ellipse(100, 300, 56, 32, -20), '#8a7650'),
    piece(ellipse(300, 300, 56, 32, 20), '#8a7650'),
    piece(curve([[70, 320], [80, 220], [200, 190], [320, 220], [330, 320]]), '#9a8660'),
    wart(130, 240), wart(270, 236), wart(110, 280, 5), wart(296, 276, 5), wart(200, 220, 7),
    piece(circle(150, 200, 30), '#9a8660'),
    piece(circle(250, 200, 30), '#9a8660'),
    piece(circle(150, 198, 18), C.orange, { edge: 'cut' }),
    piece(circle(250, 198, 18), C.orange, { edge: 'cut' }),
    piece(ellipse(150, 199, 11, 6), C.ink, { edge: 'clean', shadow: false }),
    piece(ellipse(250, 199, 11, 6), C.ink, { edge: 'clean', shadow: false }),
    ink([[130, 262], [200, 276], [270, 262]], { width: 5, color: '#5a4a2a' }),
  ]);
}

/** A chain. */
export function chain(): string {
  const links: Node[] = [];
  for (let i = 0; i < 6; i++) {
    const x = 60 + i * 56;
    const y = 200 + Math.sin(i * 0.9) * 16;
    const shape: Pt[] = i % 2 === 0 ? [[x - 40, y], [x, y - 30], [x + 40, y], [x, y + 30]] : [[x - 40, y], [x, y - 12], [x + 40, y], [x, y + 12]];
    links.push(ink(curve(shape, 3), { width: 18, color: C.greyDark, closed: true }));
    links.push(ink(curve(shape, 3), { width: 9, color: C.stoneLight, closed: true }));
  }
  return pic('chain', 'a chain', [ground(200, 320, 170, 16), ...links]);
}

/** A tree. */
export function tree(): string {
  return pic('tree', 'a tree', [
    ground(200, 356, 120),
    piece(curve([[170, 360], [180, 260], [176, 200], [224, 200], [220, 260], [230, 360]], 2), C.brown),
    piece(circle(200, 150, 100), C.green),
    piece(circle(130, 190, 60), C.greenDark),
    piece(circle(270, 190, 60), C.greenDark),
    piece(circle(200, 110, 70), C.green, { fibre: false }),
    ...[[150, 130], [250, 150], [200, 200], [170, 90]].map(([x, y]) => piece(circle(x, y, 10), C.red, { edge: 'cut' })),
  ]);
}

/** A bar of soap with bubbles. */
export function soap(): string {
  return pic('soap', 'soap', [
    ground(200, 330, 140),
    piece(rect(80, 220, 240, 110, 40), C.pink),
    piece(rect(110, 236, 180, 40, 20), '#e7b4b0', { fibre: false, shadow: false }),
    ...([[140, 170, 36], [220, 140, 28], [280, 180, 22], [180, 100, 18], [300, 110, 14]] as const).flatMap(([x, y, r]) => [
      ink(curve([[x - r, y], [x, y - r], [x + r, y], [x, y + r]], 3), { width: 4, color: C.sky, closed: true }),
      shine([[x - r * 0.5, y - r * 0.4], [x - r * 0.2, y - r * 0.6], [x - r * 0.1, y - r * 0.5], [x - r * 0.4, y - r * 0.3]], 0.8),
    ]),
  ]);
}

/** A big sail on a mast. */
export function sail(): string {
  return pic('sail', 'a sail', [
    piece(curve([[20, 330], [120, 314], [200, 334], [280, 314], [380, 330], [380, 380], [20, 380]], 2), C.blue, { fibre: false }),
    piece(curve([[120, 290], [300, 290], [280, 334], [140, 334]], 2), C.brownDark),
    piece(band([[200, 300], [200, 40]], 12), C.wood),
    piece(curve([[210, 50], [330, 140], [340, 250], [210, 270]], 2), C.white),
    piece(curve([[190, 70], [100, 160], [90, 260], [190, 270]], 2), C.cream),
    ink([[260, 120], [270, 240]], { width: 3, color: C.stoneLight }),
    piece(poly([[200, 40], [246, 52], [200, 64]]), C.red, { edge: 'cut' }),
  ]);
}

export const book4Pictures: Record<string, () => string> = {
  rain, tail, bee, feet, sheep, night, light, boat, goat, coat, moon, broom, boot, book, hook, toad, chain, tree, soap, sail,
};
