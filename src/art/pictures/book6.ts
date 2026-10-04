/** Book 6 — The Half-Blood Prince. Split digraphs and alternative spellings. */
import { C } from '../palette';
import { band, circle, curve, dot, ellipse, ink, piece, poly, rect, svg, type Node, type Pt } from '../paper';
import { blush, eye, ground, shine, smile } from './kit';

const pic = (name: string, label: string, nodes: Parameters<typeof svg>[1]) => svg({ w: 400, h: 400, name, label }, nodes);

/** A birthday cake (with Hagrid's pink icing). */
export function cake(): string {
  return pic('cake', 'a cake', [
    ground(200, 350, 150),
    piece(ellipse(200, 334, 150, 26), C.stoneLight),
    piece(rect(70, 200, 260, 130, 20), C.pink),
    piece(curve([[70, 220], [100, 196], [200, 186], [300, 196], [330, 220], [310, 250], [280, 226], [250, 254], [220, 228], [190, 256], [160, 228], [130, 254], [100, 228], [80, 250]], 2), C.white),
    piece(ellipse(200, 196, 130, 24), C.white, { fibre: false }),
    ...[140, 200, 260].map((x) => piece(rect(x - 8, 110, 16, 80, 4), [C.sky, C.yellow, C.green][(x - 140) / 60])),
    ...[140, 200, 260].map((x) => piece(curve([[x, 80], [x + 10, 100], [x, 112], [x - 10, 100]], 2), C.orange, { edge: 'cut' })),
    ...[[110, 290], [170, 300], [230, 290], [290, 300]].map(([x, y]) => dot(x, y, 6, C.red)),
  ]);
}

/** A friendly snake. */
export function snake(): string {
  return pic('snake', 'a snake', [
    ground(200, 340, 150),
    piece(band([[60, 320], [140, 300], [200, 330], [270, 300], [320, 250], [300, 190], [240, 170], [220, 120]], 40), C.green),
    ...[[110, 312], [180, 322], [250, 312], [306, 240], [262, 182]].map(([x, y]) => piece(ellipse(x, y, 10, 6), C.greenDark, { edge: 'cut', fibre: false, shadow: false })),
    piece(ellipse(220, 104, 46, 36), C.green),
    eye(204, 96, 9),
    eye(236, 96, 9),
    smile(220, 116, 22, C.greenDeep, 3),
    ink([[220, 136], [220, 160], [210, 170]], { width: 3, color: C.red }),
    ink([[220, 160], [230, 170]], { width: 3, color: C.red }),
  ]);
}

/** A cave in the rocks. */
export function cave(): string {
  return pic('cave', 'a cave', [
    piece(curve([[20, 360], [40, 200], [120, 100], [240, 80], [340, 140], [380, 260], [380, 360]], 2), C.stone),
    piece(curve([[110, 360], [130, 250], [200, 200], [270, 250], [290, 360]], 2), C.ink),
    piece(curve([[160, 200], [180, 140], [230, 150], [210, 190]], 2), C.stoneLight, { fibre: false, shadow: false }),
    piece(rect(10, 350, 380, 30, 10), C.greyDark),
    eye(180, 300, 7, false),
    eye(220, 300, 7, false),
  ]);
}

/** A kite. */
export function kite(): string {
  return pic('kite', 'a kite', [
    piece(poly([[220, 40], [320, 150], [220, 280], [120, 150]]), C.red),
    piece(poly([[220, 40], [320, 150], [220, 150]]), C.yellow, { fibre: false }),
    piece(poly([[120, 150], [220, 150], [220, 280]]), C.yellow, { fibre: false }),
    ink([[220, 40], [220, 280]], { width: 3, color: C.brownDark }),
    ink([[120, 150], [320, 150]], { width: 3, color: C.brownDark }),
    ink([[220, 280], [190, 320], [210, 350], [170, 380]], { width: 3, color: C.ink }),
    ...[[196, 316], [204, 348], [180, 372]].map(([x, y], i) => piece(poly([[x - 12, y - 6], [x + 12, y - 6], [x, y + 8]]), i % 2 ? C.blue : C.red, { edge: 'cut', fibre: false })),
  ]);
}

/** The number five, with five stars. */
export function five(): string {
  const st = (x: number, y: number) => {
    const pts: Pt[] = [];
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      pts.push([x + Math.cos(a) * (i % 2 ? 9 : 22), y + Math.sin(a) * (i % 2 ? 9 : 22)]);
    }
    return piece(poly(pts), C.gold, { edge: 'cut' });
  };
  return pic('five', 'five', [
    ink([[250, 70], [150, 70], [140, 180], [200, 170], [250, 200], [256, 260], [220, 310], [160, 310], [126, 280]], { width: 40, color: C.blue }),
    ink([[250, 70], [150, 70], [140, 180], [200, 170], [250, 200], [256, 260], [220, 310], [160, 310], [126, 280]], { width: 26, color: C.sky }),
    st(70, 360), st(135, 360), st(200, 360), st(265, 360), st(330, 360),
  ]);
}

/** A dog's bone. */
export function bone(): string {
  return pic('bone', 'a bone', [
    ground(200, 300, 150, 18),
    piece(rect(100, 180, 200, 50, 20), '#e8dcbf'),
    piece(circle(96, 176, 32), '#e8dcbf'),
    piece(circle(96, 236, 32), '#e8dcbf'),
    piece(circle(304, 176, 32), '#e8dcbf'),
    piece(circle(304, 236, 32), '#e8dcbf'),
    shine([[130, 190], [270, 190], [270, 196], [130, 196]], 0.6),
  ]);
}

/** The Philosopher's Stone: a glowing red stone. */
export function stone(): string {
  return pic('stone', 'a stone', [
    ground(200, 320, 120),
    piece(circle(200, 220, 120), 'rgba(255,190,170,0.35)', { edge: 'cut', fibre: false, shadow: false }),
    piece(poly([[140, 180], [200, 130], [270, 170], [280, 260], [210, 310], [130, 270]]), C.red),
    piece(poly([[140, 180], [200, 130], [210, 210], [130, 270]]), '#c25a50', { fibre: false, shadow: false }),
    piece(poly([[200, 130], [270, 170], [210, 210]]), '#d77a70', { fibre: false, shadow: false }),
    shine([[176, 160], [196, 146], [200, 156], [182, 170]], 0.7),
  ]);
}

/** A coil of rope. */
export function rope(): string {
  const loops: Node[] = [];
  for (let i = 0; i < 4; i++) loops.push(ink(ellipse(200, 250 - i * 26, 130 - i * 8, 40), { width: 22, color: i % 2 ? C.tan : C.wood, closed: true }));
  return pic('rope', 'a rope', [
    ground(200, 300, 150, 24),
    ...loops,
    ink([[300, 160], [340, 110], [320, 70]], { width: 22, color: C.wood }),
  ]);
}

/** A puff of smoke from a chimney. */
export function smoke(): string {
  const puff = (x: number, y: number, r: number, c: string) => piece(circle(x, y, r), c, { rough: 1.6 });
  return pic('smoke', 'smoke', [
    piece(rect(60, 300, 280, 80, 6), C.red),
    ...[320, 350].flatMap((y) => [80, 140, 200, 260, 320].map((x) => ink([[x - 30 + (y % 2) * 30, y], [x + (y % 2) * 30, y]], { width: 2, color: C.redDark }))),
    piece(rect(150, 240, 80, 70, 4), C.redDark),
    piece(rect(140, 230, 100, 20, 4), C.charcoal),
    puff(200, 190, 40, C.stoneLight),
    puff(240, 140, 50, C.stone),
    puff(200, 90, 44, C.stoneLight),
    puff(270, 70, 34, C.stone),
  ]);
}

/** A cube (a magic dice). */
export function cube(): string {
  return pic('cube', 'a cube', [
    ground(200, 340, 140),
    piece(poly([[200, 80], [330, 140], [200, 200], [70, 140]]), C.sky),
    piece(poly([[70, 140], [200, 200], [200, 340], [70, 280]]), C.blue),
    piece(poly([[200, 200], [330, 140], [330, 280], [200, 340]]), C.blueDark),
    dot(200, 140, 12, C.white),
    ...[[110, 210], [160, 270]].map(([x, y]) => dot(x, y, 11, C.white)),
    ...[[240, 210], [290, 200], [240, 270], [290, 260]].map(([x, y]) => dot(x, y, 10, C.white)),
  ]);
}

/** A tray with cups. */
export function tray(): string {
  return pic('tray', 'a tray', [
    ground(200, 300, 170, 22),
    piece(curve([[40, 240], [360, 240], [340, 290], [60, 290]], 2), C.wood),
    piece(rect(50, 230, 300, 20, 6), C.brown, { fibre: false }),
    piece(rect(110, 160, 60, 70, 10), C.white),
    piece(rect(230, 170, 56, 60, 10), C.sky),
    ink([[170, 176], [190, 190], [170, 212]], { width: 7, color: C.white }),
    ink([[286, 184], [304, 196], [286, 216]], { width: 7, color: C.sky }),
    piece(ellipse(200, 216, 24, 14), C.yellow),
  ]);
}

/** A big smiling mouth. */
export function mouth(): string {
  return pic('mouth', 'a mouth', [
    piece(curve([[60, 170], [200, 140], [340, 170], [300, 280], [200, 320], [100, 280]], 2), C.rose),
    piece(curve([[90, 190], [200, 176], [310, 190], [280, 260], [200, 290], [120, 260]], 2), C.redDark, { fibre: false }),
    piece(rect(120, 184, 160, 30, 8), C.white, { fibre: false }),
    ink([[160, 186], [160, 212]], { width: 2, color: C.stoneLight }),
    ink([[200, 184], [200, 212]], { width: 2, color: C.stoneLight }),
    ink([[240, 186], [240, 212]], { width: 2, color: C.stoneLight }),
    piece(ellipse(200, 262, 50, 24), C.pink, { fibre: false }),
  ]);
}

/** A fluffy cloud. */
export function cloud(): string {
  return pic('cloud', 'a cloud', [
    piece(circle(200, 210, 176), C.sky, { shadow: false }),
    piece(curve([[60, 260], [50, 200], [110, 170], [150, 110], [240, 110], [280, 160], [340, 170], [360, 250], [320, 280], [80, 280]], 3), C.white),
    piece(curve([[90, 270], [100, 240], [320, 240], [330, 270]], 2), '#e6eef4', { fibre: false, shadow: false }),
    eye(170, 200, 9, false),
    eye(230, 200, 9, false),
    smile(200, 226, 30, C.slate, 3),
    blush(150, 222, 9),
    blush(250, 222, 9),
  ]);
}

/** A pie. */
export function pie(): string {
  return pic('pie', 'a pie', [
    ground(200, 320, 160, 26),
    piece(curve([[50, 250], [80, 200], [200, 180], [320, 200], [350, 250], [330, 300], [70, 300]], 2), C.tan),
    piece(ellipse(200, 220, 140, 40), C.gold, { fibre: false }),
    ...[150, 200, 250].map((x) => ink([[x, 196], [x - 30, 244]], { width: 10, color: C.tan })),
    ...[150, 200, 250].map((x) => ink([[x - 30, 196], [x, 244]], { width: 10, color: C.tan })),
    ...Array.from({ length: 10 }, (_, i) => piece(circle(70 + i * 29, 290, 14), C.tan, { edge: 'cut' })),
    ink([[180, 160], [176, 130], [184, 106]], { width: 5, color: C.stoneLight }),
    ink([[220, 160], [226, 126], [218, 100]], { width: 5, color: C.stoneLight }),
  ]);
}

/** An autumn leaf. */
export function leaf(): string {
  return pic('leaf', 'a leaf', [
    piece(curve([[200, 50], [280, 110], [320, 200], [260, 300], [200, 330], [140, 300], [80, 200], [120, 110]], 2), C.orange),
    ink([[200, 70], [200, 360]], { width: 5, color: C.brown }),
    ...[0, 1, 2, 3].map((k) => ink([[200, 120 + k * 50], [262 - k * 6, 90 + k * 50]], { width: 3, color: C.brown })),
    ...[0, 1, 2, 3].map((k) => ink([[200, 120 + k * 50], [138 + k * 6, 90 + k * 50]], { width: 3, color: C.brown })),
  ]);
}

/** A cartoon skull (spooky but friendly). */
export function skull(): string {
  return pic('skull', 'a skull', [
    ground(200, 350, 110),
    piece(curve([[200, 70], [300, 110], [310, 220], [270, 260], [260, 330], [140, 330], [130, 260], [90, 220], [100, 110]]), C.cream),
    piece(ellipse(158, 190, 32, 36), C.ink, { edge: 'cut', fibre: false }),
    piece(ellipse(242, 190, 32, 36), C.ink, { edge: 'cut', fibre: false }),
    piece(poly([[190, 236], [210, 236], [200, 260]]), C.ink, { edge: 'cut', fibre: false }),
    ...[160, 186, 214, 240].map((x) => piece(rect(x - 10, 290, 20, 34, 4), C.white, { edge: 'cut' })),
    shine([[130, 120], [160, 96], [170, 104], [140, 130]], 0.6),
  ]);
}

/** A crow. */
export function crow(): string {
  return pic('crow', 'a crow', [
    piece(band([[40, 320], [360, 310]], 18), C.brownDark),
    piece(poly([[110, 260], [40, 300], [60, 250]]), C.charcoal),
    piece(curve([[100, 260], [130, 180], [220, 160], [270, 200], [260, 270], [180, 300]], 2), C.charcoal),
    piece(curve([[140, 230], [200, 200], [250, 230], [200, 270]], 2), '#4a4a54', { fibre: false }),
    piece(circle(260, 160, 48), C.charcoal),
    piece(poly([[296, 150], [360, 166], [296, 180]]), C.gold, { edge: 'cut' }),
    eye(270, 150, 10),
    ...[180, 220].map((x) => ink([[x, 296], [x, 318]], { width: 5, color: C.gold })),
  ]);
}

/** A flame. */
export function flame(): string {
  return pic('flame', 'a flame', [
    piece(curve([[200, 40], [290, 160], [300, 260], [250, 340], [150, 340], [100, 260], [120, 170], [160, 200]], 2), C.orange),
    piece(curve([[200, 120], [256, 210], [250, 290], [200, 330], [150, 290], [150, 220]], 2), C.yellow, { fibre: false }),
    piece(curve([[200, 220], [226, 270], [214, 316], [186, 316], [176, 270]], 2), C.white, { fibre: false, shadow: false }),
  ]);
}

/** A grand throne. */
export function throne(): string {
  return pic('throne', 'a throne', [
    ground(200, 356, 150),
    piece(curve([[110, 260], [100, 110], [140, 60], [200, 40], [260, 60], [300, 110], [290, 260]], 2), C.gold),
    piece(curve([[140, 250], [134, 120], [200, 80], [266, 120], [260, 250]], 2), C.red, { fibre: false }),
    piece(rect(80, 240, 240, 50, 10), C.gold),
    piece(rect(90, 284, 30, 70, 6), '#b8862f'),
    piece(rect(280, 284, 30, 70, 6), '#b8862f'),
    piece(rect(120, 230, 160, 30, 10), C.redDark, { fibre: false }),
    piece(circle(200, 66, 14), C.green, { edge: 'cut' }),
  ]);
}

/** Dragon-back spikes. */
export function spike(): string {
  return pic('spike', 'a spike', [
    piece(curve([[20, 340], [200, 300], [380, 340], [380, 380], [20, 380]], 2), C.greenDark),
    piece(poly([[60, 330], [100, 200], [140, 320]]), C.stone),
    piece(poly([[140, 316], [200, 60], [260, 316]]), C.stoneLight),
    piece(poly([[260, 320], [300, 200], [340, 330]]), C.stone),
    ink([[200, 80], [200, 300]], { width: 3, color: C.grey }),
  ]);
}

export const book6Pictures: Record<string, () => string> = {
  cake, snake, cave, kite, five, bone, stone, rope, smoke, cube, tray, mouth, cloud, pie, leaf, skull, crow, flame, throne, spike,
};
