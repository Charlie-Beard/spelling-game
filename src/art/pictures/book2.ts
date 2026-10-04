/** Book 2 — The Chamber of Secrets. ck, ch, sh, ng, th, nk, x, j, v, z, qu. */
import { C } from '../palette';
import { band, circle, curve, dot, ellipse, group, ink, piece, poly, rect, svg, type Pt } from '../paper';
import { blush, eye, ground, shine, smile } from './kit';

const pic = (name: string, label: string, nodes: Parameters<typeof svg>[1]) => svg({ w: 400, h: 400, name, label }, nodes);

/** A striped sock (Dobby's favourite). */
export function sock(): string {
  const outline: Pt[] = [[150, 60], [250, 60], [252, 230], [300, 270], [310, 320], [270, 350], [170, 330], [140, 290], [150, 230]];
  return pic('sock', 'a sock', [
    ground(230, 352, 110),
    piece(curve(outline, 2), C.cream),
    ...[100, 150, 200].map((y) => piece(poly([[148, y], [252, y], [252, y + 22], [148, y + 22]]), C.red, { fibre: false, shadow: false })),
    piece(rect(146, 56, 108, 30, 6), C.green, { fibre: false }),
    piece(curve([[250, 280], [300, 270], [312, 322], [272, 352], [240, 330]], 2), C.green, { fibre: false }),
  ]);
}

/** A paper cone of chips. */
export function chip(): string {
  const chips = Array.from({ length: 9 }, (_, i) => {
    const x = 130 + i * 18;
    const top = 80 + ((i * 37) % 50);
    return piece(rect(x, top, 22, 170, 4), i % 2 ? C.yellow : C.goldLight, { edge: 'cut' });
  });
  return pic('chip', 'a chip', [
    ...chips,
    piece(poly([[100, 190], [300, 190], [220, 370], [180, 370]]), C.white),
    piece(poly([[100, 190], [300, 190], [292, 220], [108, 220]]), C.red, { fibre: false, shadow: false }),
    ink([[140, 250], [260, 250]], { width: 3, color: C.red, opacity: 0.5 }),
  ]);
}

/** A fluffy chick. */
export function chick(): string {
  return pic('chick', 'a chick', [
    ground(200, 340, 110),
    piece(rect(170, 300, 10, 40, 3), C.orange, { edge: 'cut' }),
    piece(rect(220, 300, 10, 40, 3), C.orange, { edge: 'cut' }),
    piece(ellipse(200, 250, 100, 86), C.yellow),
    piece(ellipse(130, 250, 30, 46, 20), C.goldLight, { fibre: false }),
    piece(ellipse(270, 250, 30, 46, -20), C.goldLight, { fibre: false }),
    piece(circle(200, 150, 66), C.yellow),
    piece(curve([[190, 90], [196, 66], [208, 82], [220, 62], [214, 94]], 2), C.yellow),
    eye(176, 140, 11, false),
    eye(224, 140, 11, false),
    piece(poly([[184, 162], [216, 162], [200, 186]]), C.orange, { edge: 'cut' }),
    blush(160, 170, 9),
    blush(240, 170, 9),
  ]);
}

/** A duck. */
export function duck(): string {
  return pic('duck', 'a duck', [
    piece(ellipse(200, 330, 170, 30), C.sky, { fibre: false }),
    piece(curve([[90, 290], [110, 210], [210, 200], [300, 220], [330, 180], [320, 260], [280, 320], [120, 320]]), C.white),
    piece(curve([[150, 250], [220, 230], [260, 260], [210, 290], [160, 280]], 2), C.cream, { fibre: false }),
    group({ part: 'head', origin: [130, 200] }, [
      piece(circle(130, 160, 54), C.white),
      piece(curve([[70, 170], [30, 172], [34, 190], [80, 192]], 2), C.orange),
      eye(120, 146, 9, false),
    ]),
    ...[[150, 330], [250, 336]].map(([x, y]) => ink([[x - 30, y], [x + 30, y]], { width: 3, color: C.white, opacity: 0.6 })),
  ]);
}

/** A padlock. */
export function lock(): string {
  return pic('lock', 'a lock', [
    ground(200, 350, 110),
    ink([[140, 190], [140, 120], [170, 80], [230, 80], [260, 120], [260, 190]], { width: 26, color: C.stone }),
    ink([[140, 190], [140, 120], [170, 80], [230, 80], [260, 120], [260, 190]], { width: 14, color: C.stoneLight }),
    piece(rect(100, 180, 200, 170, 20), C.gold),
    piece(circle(200, 250, 18), C.brownDark, { edge: 'cut', fibre: false }),
    piece(poly([[192, 256], [208, 256], [214, 300], [186, 300]]), C.brownDark, { edge: 'cut', fibre: false }),
    shine([[116, 196], [130, 196], [130, 330], [116, 330]], 0.4),
  ]);
}

/** A fish. */
export function fish(): string {
  return pic('fish', 'a fish', [
    piece(poly([[300, 200], [370, 140], [360, 200], [370, 260]]), C.orange),
    piece(curve([[60, 200], [140, 120], [260, 120], [320, 200], [260, 280], [140, 280]], 2), C.orange),
    piece(poly([[180, 130], [230, 90], [250, 140]]), C.ginger),
    piece(poly([[190, 270], [230, 300], [240, 262]]), C.ginger),
    ...[200, 236, 272].map((x) => ink([[x, 150], [x - 14, 200], [x, 250]], { width: 3, color: C.ginger })),
    eye(120, 186, 14),
    smile(86, 214, 20),
    piece(circle(60, 120, 10), C.sky, { edge: 'cut', fibre: false }),
    piece(circle(76, 86, 7), C.sky, { edge: 'cut', fibre: false }),
  ]);
}

/** A sailing ship. */
export function ship(): string {
  return pic('ship', 'a ship', [
    piece(curve([[20, 330], [120, 310], [200, 330], [280, 310], [380, 330], [380, 400], [20, 400]], 2), C.blue, { fibre: false }),
    piece(poly([[70, 260], [330, 260], [290, 330], [110, 330]]), C.brownDark),
    piece(rect(90, 270, 220, 12, 3), C.gold, { fibre: false }),
    piece(band([[200, 262], [200, 60]], 10), C.brownDark),
    piece(curve([[206, 70], [300, 110], [310, 220], [206, 240]], 2), C.white),
    piece(curve([[194, 90], [120, 130], [110, 220], [194, 236]], 2), C.cream),
    piece(poly([[200, 60], [250, 74], [200, 88]]), C.red, { edge: 'cut' }),
  ]);
}

/** A seashell. */
export function shell(): string {
  const ribs = Array.from({ length: 7 }, (_, i) => {
    const a = Math.PI * (1.15 + i * 0.12);
    return ink([[200, 320], [200 + Math.cos(a) * 140, 300 + Math.sin(a) * 160]], { width: 4, color: C.rose });
  });
  return pic('shell', 'a shell', [
    ground(200, 340, 130),
    piece(curve([[60, 290], [80, 170], [200, 110], [320, 170], [340, 290], [200, 330]], 2), C.pink),
    ...ribs,
    piece(poly([[160, 310], [240, 310], [230, 350], [170, 350]]), C.rose),
    shine([[110, 220], [140, 180], [150, 190], [124, 228]], 0.45),
  ]);
}

/** A dish. */
export function dish(): string {
  return pic('dish', 'a dish', [
    ground(200, 300, 160, 26),
    piece(ellipse(200, 250, 160, 60), C.white),
    piece(ellipse(200, 244, 120, 40), C.cream, { fibre: false }),
    ...Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return dot(200 + Math.cos(a) * 140, 250 + Math.sin(a) * 50, 6, C.blue);
    }),
    piece(ellipse(170, 236, 26, 14), C.red, { fibre: false }),
    piece(ellipse(224, 240, 22, 12), C.green, { fibre: false }),
  ]);
}

/** A garden shed. */
export function shed(): string {
  return pic('shed', 'a shed', [
    piece(rect(0, 330, 400, 70), C.green, { fibre: false, shadow: false }),
    piece(rect(90, 170, 220, 170), C.wood),
    ...[130, 170, 210, 250, 290].map((x) => ink([[x, 180], [x, 336]], { width: 3, color: C.brown, opacity: 0.6 })),
    piece(poly([[70, 180], [200, 80], [330, 180]]), C.redDark),
    piece(rect(170, 240, 60, 100, 4), C.brownDark),
    piece(circle(218, 292, 5), C.gold, { edge: 'clean', shadow: false }),
    piece(rect(250, 210, 40, 34, 3), C.sky),
    ink([[270, 210], [270, 244]], { width: 3, color: C.brownDark }),
  ]);
}

/** A feathered wing. */
export function wing(): string {
  const feathers = Array.from({ length: 6 }, (_, i) =>
    piece(ellipse(130 + i * 34, 250 - i * 18, 26, 70, 30 + i * 6), i % 2 ? C.tan : C.wood),
  );
  return pic('wing', 'a wing', [
    ...feathers.reverse(),
    piece(curve([[90, 180], [180, 110], [320, 90], [340, 130], [240, 170], [130, 230]], 2), C.sand),
    ink([[110, 190], [320, 110]], { width: 3, color: C.brown }),
  ]);
}

/** A king. */
export function king(): string {
  return pic('king', 'a king', [
    ground(200, 362, 110),
    piece(curve([[100, 370], [110, 260], [200, 230], [290, 260], [300, 370]], 2), C.red),
    piece(rect(100, 340, 200, 28, 6), C.white),
    piece(circle(200, 170, 62), C.skin),
    piece(curve([[150, 196], [200, 260], [250, 196], [236, 230], [200, 250], [164, 230]], 2), C.white),
    eye(178, 160, 8, false),
    eye(222, 160, 8, false),
    smile(200, 190, 26),
    piece(poly([[136, 126], [140, 70], [170, 100], [200, 60], [230, 100], [260, 70], [264, 126]]), C.gold),
    dot(200, 104, 7, C.red),
  ]);
}

/** A ring with a jewel. */
export function ring(): string {
  return pic('ring', 'a ring', [
    ground(200, 340, 110),
    ink(curve([[110, 250], [200, 190], [290, 250], [200, 330]], 3), { width: 26, color: '#b8862f', closed: true }),
    ink(curve([[110, 246], [200, 186], [290, 246], [200, 326]], 3), { width: 20, color: C.gold, closed: true }),
    piece(poly([[166, 170], [234, 170], [250, 130], [200, 90], [150, 130]]), C.sky),
    piece(poly([[166, 170], [200, 90], [234, 170]]), '#bfe3ff', { edge: 'clean', shadow: false }),
    shine([[180, 120], [190, 110], [196, 120], [186, 130]], 0.7),
  ]);
}

/** A moth. */
export function moth(): string {
  return pic('moth', 'a moth', [
    piece(curve([[200, 190], [110, 100], [50, 140], [70, 220], [190, 220]], 2), C.tan),
    piece(curve([[200, 190], [290, 100], [350, 140], [330, 220], [210, 220]], 2), C.tan),
    piece(curve([[196, 210], [110, 230], [100, 300], [180, 290]], 2), C.sand),
    piece(curve([[204, 210], [290, 230], [300, 300], [220, 290]], 2), C.sand),
    piece(circle(110, 160, 18), C.brown, { edge: 'cut', fibre: false }),
    piece(circle(290, 160, 18), C.brown, { edge: 'cut', fibre: false }),
    piece(ellipse(200, 220, 18, 70), C.brownDark),
    eye(190, 160, 7),
    eye(210, 160, 7),
    ink([[192, 150], [160, 100]], { width: 3 }),
    ink([[208, 150], [240, 100]], { width: 3 }),
  ]);
}

/** A kitchen sink with a dripping tap. */
export function sink(): string {
  return pic('sink', 'a sink', [
    piece(rect(40, 230, 320, 150), C.wood),
    piece(rect(40, 210, 320, 30, 4), C.stoneLight),
    piece(curve([[90, 216], [310, 216], [290, 290], [110, 290]], 2), C.stone, { fibre: false }),
    piece(band([[200, 216], [200, 120], [250, 110], [270, 140]], 18), C.stone),
    piece(rect(150, 140, 36, 18, 6), C.stone),
    piece(ellipse(270, 170, 8, 12), C.sky, { edge: 'cut', fibre: false }),
    ...[120, 280].map((x) => piece(rect(x - 10, 300, 20, 60, 4), C.brownDark, { fibre: false })),
  ]);
}

/** A box. */
export function box(): string {
  return pic('box', 'a box', [
    ground(200, 344, 150),
    piece(poly([[80, 180], [200, 140], [320, 180], [320, 320], [200, 360], [80, 320]]), C.tan),
    piece(poly([[80, 180], [200, 220], [200, 360], [80, 320]]), C.sand, { fibre: false }),
    piece(poly([[200, 220], [320, 180], [320, 320], [200, 360]]), C.tan, { fibre: false }),
    piece(poly([[80, 180], [40, 140], [160, 100], [200, 140]]), C.sand),
    piece(poly([[320, 180], [360, 140], [240, 100], [200, 140]]), C.tan),
    ink([[200, 220], [200, 360]], { width: 3, color: C.brown, opacity: 0.6 }),
  ]);
}

/** A fox. */
export function fox(): string {
  return pic('fox', 'a fox', [
    ground(200, 352, 130),
    piece(curve([[260, 330], [340, 320], [370, 240], [330, 200], [320, 270], [270, 290]], 2), C.orange),
    piece(curve([[330, 220], [370, 238], [360, 210]], 2), C.white, { fibre: false }),
    piece(curve([[130, 350], [140, 250], [200, 220], [260, 250], [270, 350]]), C.orange),
    piece(curve([[170, 350], [180, 280], [200, 270], [220, 280], [230, 350]]), C.white, { fibre: false }),
    group({ part: 'head', origin: [200, 200] }, [
      piece(poly([[124, 150], [130, 60], [180, 120]]), C.orange),
      piece(poly([[276, 150], [270, 60], [220, 120]]), C.orange),
      piece(poly([[136, 132], [140, 86], [166, 118]]), C.brownDark, { fibre: false }),
      piece(poly([[264, 132], [260, 86], [234, 118]]), C.brownDark, { fibre: false }),
      piece(curve([[110, 150], [200, 100], [290, 150], [240, 220], [200, 250], [160, 220]], 2), C.orange),
      piece(curve([[140, 176], [200, 196], [260, 176], [230, 224], [200, 248], [170, 224]], 2), C.white, { fibre: false }),
      piece(circle(200, 236, 12), C.ink, { edge: 'cut' }),
      eye(168, 160, 9, false),
      eye(232, 160, 9, false),
    ]),
  ]);
}

/** A jar of jam. */
export function jam(): string {
  return pic('jam', 'jam', [
    ground(200, 346, 110),
    piece(rect(110, 130, 180, 214, 30), C.redDark),
    piece(rect(110, 150, 180, 30, 4), 'rgba(255,255,255,0.25)', { edge: 'clean', shadow: false }),
    piece(rect(130, 210, 140, 80, 6), C.cream, { fibre: false }),
    piece(circle(200, 250, 22), C.red, { edge: 'cut', fibre: false }),
    piece(ellipse(200, 228, 10, 6, -30), C.green, { edge: 'cut', fibre: false }),
    piece(curve([[100, 120], [200, 90], [300, 120], [300, 140], [100, 140]], 2), C.white),
    ...[120, 160, 200, 240, 280].map((x) => piece(poly([[x - 12, 136], [x + 12, 136], [x, 156]]), C.white, { fibre: false })),
    ink([[100, 140], [300, 140]], { width: 4, color: C.red }),
    shine([[122, 200], [134, 196], [136, 320], [124, 324]], 0.3),
  ]);
}

/** A van. */
export function van(): string {
  return pic('van', 'a van', [
    ground(200, 330, 170, 20),
    piece(curve([[40, 300], [40, 160], [70, 130], [270, 130], [340, 200], [360, 220], [360, 300]], 2), C.teal),
    piece(poly([[270, 150], [326, 206], [270, 206]]), C.sky, { fibre: false }),
    piece(rect(80, 150, 70, 50, 6), C.sky, { fibre: false }),
    piece(rect(170, 150, 70, 50, 6), C.sky, { fibre: false }),
    piece(rect(40, 236, 320, 14, 3), C.white, { fibre: false, shadow: false }),
    piece(circle(110, 302, 34), C.charcoal),
    piece(circle(290, 302, 34), C.charcoal),
    piece(circle(110, 302, 14), C.stoneLight, { edge: 'cut' }),
    piece(circle(290, 302, 14), C.stoneLight, { edge: 'cut' }),
    piece(circle(352, 240, 8), C.yellow, { edge: 'cut' }),
  ]);
}

/** A zip on a pencil case. */
export function zip(): string {
  const teeth = Array.from({ length: 12 }, (_, i) =>
    piece(rect(70 + i * 22, 180 + (i % 2 ? 0 : 10), 14, 14, 2), C.stoneLight, { edge: 'clean', shadow: false }),
  );
  return pic('zip', 'a zip', [
    ground(200, 320, 170, 24),
    piece(curve([[40, 150], [360, 150], [370, 290], [30, 290]], 2), C.blue),
    piece(rect(40, 184, 320, 24, 6), C.blueDark, { fibre: false }),
    ...teeth,
    piece(rect(310, 170, 34, 48, 8), C.stone),
    piece(rect(318, 210, 18, 50, 8), C.stoneLight),
  ]);
}

/** A feather quill. */
export function quill(): string {
  return pic('quill', 'a quill', [
    piece(rect(70, 290, 110, 80, 10), C.charcoal),
    piece(ellipse(125, 292, 55, 14), C.ink, { fibre: false }),
    piece(curve([[110, 300], [170, 200], [270, 90], [330, 40], [320, 100], [240, 200], [130, 300]], 2), C.white),
    ink([[116, 300], [320, 52]], { width: 3, color: C.stoneLight }),
    ...[0, 1, 2, 3].map((k) => ink([[180 + k * 34, 210 - k * 40], [214 + k * 34, 214 - k * 40]], { width: 2, color: C.stoneLight })),
    piece(poly([[104, 296], [120, 290], [100, 330]]), C.ink, { edge: 'cut', fibre: false }),
  ]);
}

/** A chess knight. */
export function chess(): string {
  return pic('chess', 'a chess piece', [
    ground(200, 350, 110),
    piece(rect(110, 300, 180, 50, 12), C.charcoal),
    piece(rect(140, 270, 120, 40, 8), C.charcoal),
    piece(curve([[150, 280], [150, 200], [120, 170], [130, 110], [200, 70], [280, 110], [280, 170], [250, 200], [260, 280]]), C.charcoal),
    piece(curve([[130, 150], [100, 170], [110, 200], [150, 190]], 2), C.charcoal),
    piece(poly([[210, 74], [226, 40], [240, 84]]), C.charcoal),
    eye(220, 130, 9),
    ink([[180, 90], [160, 140], [176, 200]], { width: 3, color: C.slate }),
  ]);
}

/** A jug. */
export function jug(): string {
  return pic('jug', 'a jug', [
    ground(190, 350, 120),
    ink([[262, 150], [326, 164], [324, 254], [270, 284]], { width: 20, color: C.blue }),
    piece(curve([[110, 120], [100, 90], [280, 100], [270, 140], [290, 250], [250, 350], [130, 350], [90, 250], [110, 140]], 2), C.blue),
    piece(poly([[100, 92], [60, 90], [104, 120]]), C.blue),
    piece(rect(96, 200, 196, 30, 4), C.white, { fibre: false, shadow: false }),
    shine([[120, 150], [134, 146], [136, 300], [124, 304]], 0.3),
  ]);
}

/** BANG! A firework burst. */
export function bang(): string {
  const pts: Pt[] = [];
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const r = i % 2 ? 90 : 170;
    pts.push([200 + Math.cos(a) * r, 200 + Math.sin(a) * r]);
  }
  const inner: Pt[] = pts.map(([x, y]) => [200 + (x - 200) * 0.6, 200 + (y - 200) * 0.6]);
  return pic('bang', 'bang', [
    piece(poly(pts), C.orange),
    piece(poly(inner), C.yellow, { fibre: false }),
    piece(circle(200, 200, 40), C.white, { fibre: false }),
    ...[[60, 60], [340, 70], [330, 340], [70, 330]].map(([x, y]) => piece(circle(x, y, 10), C.gold, { edge: 'cut', fibre: false })),
  ]);
}

/** A curly wig. */
export function wig(): string {
  const curls: Pt[] = [];
  for (let i = 0; i < 14; i++) {
    const a = Math.PI * (0.95 + (i / 13) * 1.1);
    curls.push([200 + Math.cos(a) * 130, 230 + Math.sin(a) * 140]);
  }
  return pic('wig', 'a wig', [
    piece(ellipse(200, 330, 90, 30), C.stone),
    piece(rect(170, 290, 60, 50, 6), C.stoneLight),
    piece(ellipse(200, 210, 110, 110), C.stoneLight),
    ...curls.map(([x, y]) => piece(circle(x, y, 34), C.yellow, { rough: 1.2 })),
    ...curls.slice(2, 12).map(([x, y]) => piece(circle(x * 0.7 + 60, y * 0.7 + 50, 30), C.goldLight, { rough: 1.2 })),
    piece(ellipse(200, 190, 40, 30), C.yellow),
  ]);
}

export const book2Pictures: Record<string, () => string> = {
  sock, chip, chick, duck, lock, fish, ship, shell, dish, shed, wing, king, ring, moth, sink, box, fox, jam, van, zip, quill, chess, jug, bang, wig,
};
