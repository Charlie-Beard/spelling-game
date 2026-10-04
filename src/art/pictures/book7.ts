/** Book 7 — The Deathly Hallows. Two-syllable words. */
import { C } from '../palette';
import { band, circle, curve, dot, ellipse, ink, piece, poly, rect, svg, type Node, type Pt } from '../paper';
import { blush, eye, ground, shine, smile } from './kit';

const pic = (name: string, label: string, nodes: Parameters<typeof svg>[1]) => svg({ w: 400, h: 400, name, label }, nodes);

const sparkle = (x: number, y: number, r: number, color: string = C.gold): Node =>
  piece(poly([[x, y - r], [x + r * 0.25, y - r * 0.25], [x + r, y], [x + r * 0.25, y + r * 0.25], [x, y + r], [x - r * 0.25, y + r * 0.25], [x - r, y], [x - r * 0.25, y - r * 0.25]]), color, { edge: 'cut', fibre: false });

/** A rabbit. */
export function rabbit(): string {
  const fur = '#c9b49a';
  return pic('rabbit', 'a rabbit', [
    ground(200, 350, 120),
    piece(circle(290, 300, 26), C.white),
    piece(curve([[110, 340], [120, 250], [200, 220], [280, 250], [290, 340]]), fur),
    piece(ellipse(160, 80, 22, 70, -10), fur),
    piece(ellipse(240, 80, 22, 70, 10), fur),
    piece(ellipse(160, 84, 10, 50, -10), C.pink, { fibre: false }),
    piece(ellipse(240, 84, 10, 50, 10), C.pink, { fibre: false }),
    piece(circle(200, 190, 72), fur),
    eye(174, 180, 10, false),
    eye(226, 180, 10, false),
    piece(ellipse(200, 208, 10, 7), C.rose, { edge: 'cut' }),
    ink([[200, 214], [190, 226]], { width: 3 }),
    ink([[200, 214], [210, 226]], { width: 3 }),
    blush(160, 210, 10),
    blush(240, 210, 10),
    piece(rect(190, 226, 20, 14, 3), C.white, { edge: 'clean', shadow: false }),
  ]);
}

/** A wicker basket. */
export function basket(): string {
  const weave: Node[] = [];
  for (let r = 0; r < 4; r++) weave.push(ink([[80, 220 + r * 30], [320, 220 + r * 30]], { width: 4, color: C.brown }));
  for (let k = 0; k < 8; k++) weave.push(ink([[96 + k * 30, 210], [104 + k * 28, 336]], { width: 3, color: C.brownDark, opacity: 0.6 }));
  return pic('basket', 'a basket', [
    ground(200, 350, 140),
    ink([[100, 200], [120, 90], [280, 90], [300, 200]], { width: 16, color: C.wood }),
    piece(poly([[70, 200], [330, 200], [300, 340], [100, 340]]), C.tan),
    ...weave,
    piece(rect(64, 192, 272, 22, 8), C.wood),
    piece(circle(150, 186, 22), C.red, { edge: 'cut' }),
    piece(circle(190, 180, 20), C.green, { edge: 'cut' }),
  ]);
}

/** A rolled-up flying carpet. */
export function carpet(): string {
  return pic('carpet', 'a carpet', [
    piece(curve([[40, 220], [200, 190], [360, 220], [340, 300], [200, 280], [60, 310]], 2), C.red),
    piece(curve([[70, 230], [200, 206], [330, 230], [316, 286], [200, 268], [84, 292]], 2), C.blueDark, { fibre: false }),
    piece(poly([[200, 214], [240, 240], [200, 264], [160, 240]]), C.gold, { edge: 'cut', fibre: false }),
    ...Array.from({ length: 8 }, (_, i) => ink([[40 + i * 3, 222 + i * 11], [16 + i * 3, 226 + i * 11]], { width: 4, color: C.gold })),
    ...Array.from({ length: 8 }, (_, i) => ink([[360 - i * 3, 222 + i * 10], [384 - i * 3, 218 + i * 10]], { width: 4, color: C.gold })),
    sparkle(110, 160, 12),
    sparkle(300, 150, 10),
  ]);
}

/** A kitten. */
export function kitten(): string {
  return pic('kitten', 'a kitten', [
    ground(200, 350, 120),
    piece(band([[260, 330], [330, 300], [330, 240]], 20), C.stone),
    piece(curve([[120, 340], [130, 250], [200, 230], [270, 250], [280, 340]]), C.stone),
    piece(poly([[124, 150], [130, 70], [180, 120]]), C.stone),
    piece(poly([[276, 150], [270, 70], [220, 120]]), C.stone),
    piece(poly([[138, 130], [140, 92], [166, 118]]), C.pink, { fibre: false }),
    piece(poly([[262, 130], [260, 92], [234, 118]]), C.pink, { fibre: false }),
    piece(circle(200, 180, 80), C.stone),
    eye(170, 170, 16),
    eye(230, 170, 16),
    piece(poly([[190, 200], [210, 200], [200, 212]]), C.rose, { edge: 'cut' }),
    smile(200, 218, 26, C.ink, 3),
    ink([[160, 206], [110, 198]], { width: 2, color: C.white }),
    ink([[240, 206], [290, 198]], { width: 2, color: C.white }),
    piece(ellipse(170, 338, 20, 12), C.white),
    piece(ellipse(230, 338, 20, 12), C.white),
  ]);
}

/** A picnic blanket with food. */
export function picnic(): string {
  const checks: Node[] = [];
  for (let r = 0; r < 4; r++) for (let k = 0; k < 6; k++) if ((r + k) % 2) checks.push(piece(poly([[60 + k * 48 - r * 10, 230 + r * 30], [108 + k * 48 - r * 10, 230 + r * 30], [100 + k * 48 - r * 12, 260 + r * 30], [52 + k * 48 - r * 12, 260 + r * 30]]), C.red, { edge: 'clean', shadow: false }));
  return pic('picnic', 'a picnic', [
    piece(poly([[60, 230], [348, 230], [320, 350], [20, 350]]), C.white),
    ...checks,
    piece(rect(220, 150, 100, 80, 10), C.tan),
    ink([[230, 150], [250, 110], [290, 110], [310, 150]], { width: 8, color: C.wood }),
    piece(ellipse(130, 220, 40, 16), C.white),
    piece(curve([[100, 210], [130, 180], [160, 210]], 2), C.yellow),
    piece(circle(180, 250, 16), C.red, { edge: 'cut' }),
  ]);
}

/** A goblin. */
export function goblin(): string {
  const skin = '#b9b38a';
  return pic('goblin', 'a goblin', [
    ground(200, 356, 110),
    piece(curve([[130, 350], [140, 260], [200, 240], [260, 260], [270, 350]], 2), C.charcoal),
    piece(rect(150, 300, 100, 14, 3), C.gold, { fibre: false }),
    piece(poly([[140, 150], [40, 110], [140, 190]]), skin),
    piece(poly([[260, 150], [360, 110], [260, 190]]), skin),
    piece(curve([[200, 80], [270, 110], [270, 200], [230, 250], [170, 250], [130, 200], [130, 110]]), skin),
    eye(172, 160, 10, false),
    eye(228, 160, 10, false),
    ink([[154, 138], [190, 150]], { width: 5, color: C.ink }),
    ink([[246, 138], [210, 150]], { width: 5, color: C.ink }),
    piece(poly([[200, 170], [230, 210], [200, 214]]), skin, { edge: 'cut', fibre: false }),
    ink([[176, 230], [200, 226], [226, 232]], { width: 3, color: C.ink }),
  ]);
}

/** A friendly green dragon. */
export function dragon(): string {
  return pic('dragon', 'a dragon', [
    ground(200, 352, 150),
    piece(band([[270, 320], [330, 330], [370, 290], [360, 250]], 26), C.green),
    piece(poly([[360, 250], [380, 220], [344, 236]]), C.greenDark, { edge: 'cut' }),
    piece(poly([[160, 200], [80, 110], [120, 190], [60, 180], [140, 240]]), C.greenDark),
    piece(curve([[120, 340], [130, 240], [220, 210], [290, 250], [300, 340]]), C.green),
    piece(curve([[170, 340], [180, 270], [220, 256], [250, 280], [256, 340]], 2), C.goldLight, { fibre: false }),
    piece(curve([[190, 220], [170, 140], [210, 90], [280, 100], [300, 150], [270, 190], [230, 200]]), C.green),
    piece(poly([[220, 96], [214, 56], [240, 92]]), C.goldLight, { edge: 'cut' }),
    piece(poly([[262, 98], [270, 58], [284, 104]]), C.goldLight, { edge: 'cut' }),
    eye(240, 132, 13),
    dot(290, 160, 4, C.greenDeep),
    smile(266, 170, 30, C.greenDeep, 4),
    ...[[140, 234], [180, 214], [214, 210]].map(([x, y]) => piece(poly([[x - 10, y + 6], [x, y - 14], [x + 10, y + 6]]), C.goldLight, { edge: 'cut' })),
    ink([[310, 150], [340, 140], [360, 150]], { width: 4, color: C.stoneLight }),
  ]);
}

/** A knight's helmet. */
export function helmet(): string {
  return pic('helmet', 'a helmet', [
    ground(200, 344, 120),
    piece(curve([[110, 330], [100, 180], [140, 110], [200, 90], [260, 110], [300, 180], [290, 330]], 2), C.stoneLight),
    piece(rect(130, 180, 140, 26, 6), C.greyDark, { fibre: false }),
    ...[150, 180, 210, 240].map((x) => piece(rect(x, 230, 10, 50, 3), C.greyDark, { edge: 'clean', shadow: false })),
    piece(curve([[200, 92], [180, 40], [230, 20], [260, 50], [220, 90]], 2), C.red),
    shine([[126, 170], [140, 140], [150, 150], [138, 300]], 0.35),
  ]);
}

/** A pocket with a wand peeking out. */
export function pocket(): string {
  return pic('pocket', 'a pocket', [
    piece(rect(40, 40, 320, 340, 20), C.blueDark),
    piece(band([[230, 260], [290, 70]], 12), C.brownDark),
    piece(curve([[100, 170], [300, 170], [300, 310], [200, 350], [100, 310]], 2), C.blue),
    ink([[110, 180], [290, 180], [290, 300], [200, 338], [110, 300], [110, 180]], { width: 3, color: C.goldLight, opacity: 0.8, wobble: 1 }),
    piece(poly([[100, 160], [300, 160], [300, 200], [200, 220], [100, 200]]), C.blue),
    piece(circle(200, 196, 10), C.gold, { edge: 'cut' }),
  ]);
}

/** Magic: a wand with a burst of sparkles. */
export function magic(): string {
  return pic('magic', 'magic', [
    piece(band([[80, 340], [240, 170]], 16), C.charcoal),
    piece(band([[230, 180], [250, 160]], 16), C.white),
    sparkle(280, 120, 36),
    sparkle(200, 90, 16, C.goldLight),
    sparkle(340, 180, 18, C.goldLight),
    sparkle(330, 80, 12, C.sky),
    sparkle(240, 40, 10, C.pink),
    sparkle(360, 250, 10, C.sky),
    ink([[256, 150], [290, 100], [320, 120], [340, 80]], { width: 3, color: C.gold, opacity: 0.6 }),
  ]);
}

/** A pumpkin. */
export function pumpkin(): string {
  return pic('pumpkin', 'a pumpkin', [
    ground(200, 340, 150),
    piece(ellipse(130, 240, 70, 96), C.ginger),
    piece(ellipse(270, 240, 70, 96), C.ginger),
    piece(ellipse(200, 240, 80, 104), C.orange),
    ink([[200, 140], [200, 340]], { width: 4, color: C.ginger }),
    piece(band([[200, 146], [214, 100]], 16), C.greenDark),
    piece(ellipse(244, 116, 30, 14, -20), C.green),
    shine([[160, 180], [172, 170], [176, 260], [164, 266]], 0.35),
  ]);
}

/** A cobweb in a corner. */
export function cobweb(): string {
  const ends: Pt[] = [[60, 20], [100, 160], [200, 260], [300, 340], [380, 360]];
  const threads = ends.map(([x, y]) => ink([[380, 20], [x, y]], { width: 3, color: C.greyDark }));
  const rings = [0.3, 0.55, 0.8].map((t) =>
    ink(ends.map(([x, y]) => [380 + (x - 380) * t, 20 + (y - 20) * t] as Pt), { width: 3, color: C.greyDark }),
  );
  return pic('cobweb', 'a cobweb', [
    piece(poly([[40, 20], [380, 20], [380, 380]]), C.stoneLight, { shadow: false }),
    ...threads,
    ...rings,
    piece(circle(240, 180, 16), C.charcoal),
    ...[-1, 1].flatMap((s) => [0, 1].map((k) => ink([[240, 180], [240 + s * 24, 170 + k * 16]], { width: 3, color: C.charcoal }))),
    eye(234, 176, 4),
    eye(246, 176, 4),
  ]);
}

/** A lantern. */
export function lantern(): string {
  return pic('lantern', 'a lantern', [
    ground(200, 350, 100),
    ink([[160, 90], [200, 50], [240, 90]], { width: 8, color: C.charcoal }),
    piece(rect(140, 90, 120, 30, 8), C.charcoal),
    piece(rect(150, 116, 100, 180, 10), 'rgba(255,225,150,0.85)'),
    piece(curve([[200, 250], [176, 210], [200, 160], [224, 210]], 2), C.orange, { edge: 'cut', fibre: false }),
    piece(curve([[200, 244], [188, 216], [200, 186], [212, 216]], 2), C.yellow, { edge: 'cut', fibre: false, shadow: false }),
    ...[150, 250].map((x) => piece(rect(x - 6, 116, 12, 180, 3), C.charcoal, { edge: 'cut' })),
    piece(rect(134, 290, 132, 40, 8), C.charcoal),
  ]);
}

/** Thunder: a dark cloud with a big lightning bolt. */
export function thunder(): string {
  return pic('thunder', 'thunder', [
    piece(curve([[50, 180], [50, 120], [110, 100], [150, 50], [240, 50], [290, 90], [350, 100], [360, 180]], 3), C.charcoal),
    piece(poly([[200, 150], [140, 270], [190, 270], [150, 380], [280, 230], [226, 230], [270, 150]]), C.yellow),
    ink([[90, 210], [70, 250]], { width: 5, color: C.goldLight }),
    ink([[320, 210], [340, 250]], { width: 5, color: C.goldLight }),
  ]);
}

/** A sunset over the sea. */
export function sunset(): string {
  return pic('sunset', 'a sunset', [
    piece(rect(20, 20, 360, 360, 40), C.orange, { shadow: false }),
    piece(rect(20, 20, 360, 120, 40), C.rose, { edge: 'cut', fibre: false, shadow: false }),
    piece(circle(200, 240, 80), C.yellow),
    piece(curve([[24, 250], [120, 236], [200, 252], [280, 236], [376, 250], [376, 340], [340, 376], [60, 376], [24, 340]], 2), C.blueDark),
    ...[280, 310, 340].map((y, i) => ink([[150 + i * 10, y], [250 - i * 10, y]], { width: 5, color: C.goldLight, opacity: 0.8 })),
    ink([[80, 110], [96, 100], [112, 110]], { width: 3, color: C.ink }),
    ink([[130, 90], [144, 82], [158, 90]], { width: 3, color: C.ink }),
  ]);
}

export const book7Pictures: Record<string, () => string> = {
  rabbit, basket, carpet, kitten, picnic, goblin, dragon, helmet, pocket, magic, pumpkin, cobweb, lantern, thunder, sunset,
};
