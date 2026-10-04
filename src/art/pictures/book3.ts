/** Book 3 — The Prisoner of Azkaban. Adjacent consonants (CCVC, CVCC). */
import { C } from '../palette';
import { band, circle, curve, dot, ellipse, ink, piece, poly, rect, svg, type Pt } from '../paper';
import { blush, eye, ground, shine, smile } from './kit';

const pic = (name: string, label: string, nodes: Parameters<typeof svg>[1]) => svg({ w: 400, h: 400, name, label }, nodes);

/** A frog. */
export function frog(): string {
  const g = C.green;
  return pic('frog', 'a frog', [
    ground(200, 340, 140),
    piece(ellipse(100, 300, 60, 34, -20), C.greenDark),
    piece(ellipse(300, 300, 60, 34, 20), C.greenDark),
    piece(curve([[70, 320], [80, 220], [200, 180], [320, 220], [330, 320]]), g),
    piece(curve([[130, 320], [140, 260], [200, 248], [260, 260], [270, 320]]), C.goldLight, { fibre: false }),
    piece(circle(140, 180, 40), g),
    piece(circle(260, 180, 40), g),
    eye(140, 176, 24),
    eye(260, 176, 24),
    smile(200, 236, 90, C.greenDeep, 5),
    blush(120, 246, 12),
    blush(280, 246, 12),
    piece(ellipse(130, 330, 30, 12), C.greenDark),
    piece(ellipse(270, 330, 30, 12), C.greenDark),
  ]);
}

/** A crab. */
export function crab(): string {
  const claw = (s: 1 | -1): Pt[] => [[200 + s * 110, 200], [200 + s * 160, 120], [200 + s * 190, 140], [200 + s * 170, 170], [200 + s * 196, 190], [200 + s * 150, 210]];
  return pic('crab', 'a crab', [
    ground(200, 340, 140),
    ...[-1, 1].flatMap((s) => [0, 1, 2].map((k) => ink([[200 + s * 80, 260 + k * 16], [200 + s * 140, 280 + k * 20], [200 + s * 160, 320 + k * 10]], { width: 8, color: C.redDark }))),
    piece(band([[120, 230], [90, 200]], 18), C.red),
    piece(band([[280, 230], [310, 200]], 18), C.red),
    piece(curve(claw(-1), 2), C.red),
    piece(curve(claw(1), 2), C.red),
    piece(ellipse(200, 260, 110, 70), C.red),
    ink([[170, 200], [160, 150]], { width: 5, color: C.redDark }),
    ink([[230, 200], [240, 150]], { width: 5, color: C.redDark }),
    eye(160, 146, 14),
    eye(240, 146, 14),
    smile(200, 270, 50, C.redDark, 4),
  ]);
}

/** A drum. */
export function drum(): string {
  return pic('drum', 'a drum', [
    ground(200, 350, 140),
    piece(rect(80, 170, 240, 170, 20), C.red),
    ...[0, 1, 2, 3, 4].map((k) => ink([[90 + k * 55, 180], [120 + k * 55, 330]], { width: 4, color: C.gold })),
    piece(ellipse(200, 170, 120, 30), C.cream),
    piece(rect(76, 320, 248, 22, 8), C.gold, { fibre: false }),
    piece(rect(76, 162, 248, 18, 8), C.gold, { fibre: false }),
    piece(band([[140, 120], [250, 40]], 10), C.wood),
    piece(circle(252, 40, 14), C.cream),
    piece(band([[260, 130], [320, 50]], 10), C.wood),
    piece(circle(322, 48, 14), C.cream),
  ]);
}

/** A Gryffindor flag. */
export function flag(): string {
  return pic('flag', 'a flag', [
    ground(110, 360, 60),
    piece(band([[110, 360], [110, 50]], 14), C.brownDark),
    piece(circle(110, 44, 12), C.gold),
    piece(curve([[116, 70], [220, 50], [300, 90], [340, 70], [330, 200], [250, 220], [180, 190], [116, 210]], 2), C.red),
    piece(curve([[190, 110], [240, 100], [260, 140], [240, 170], [200, 170]], 2), C.gold, { fibre: false }),
  ]);
}

/** A slug. */
export function slug(): string {
  return pic('slug', 'a slug', [
    piece(curve([[40, 330], [120, 320], [200, 334], [280, 324], [370, 334], [370, 350], [40, 350]], 2), 'rgba(160,190,200,0.5)', { edge: 'cut', fibre: false, shadow: false }),
    piece(curve([[60, 330], [100, 270], [200, 250], [290, 220], [330, 160], [360, 200], [350, 290], [300, 330]], 2), C.tan),
    piece(curve([[120, 300], [200, 270], [290, 250], [320, 290], [260, 320]], 2), C.sand, { fibre: false }),
    ink([[320, 170], [300, 100]], { width: 5, color: C.brown }),
    ink([[340, 170], [356, 104]], { width: 5, color: C.brown }),
    piece(circle(300, 96, 10), C.ink, { edge: 'cut' }),
    piece(circle(358, 100, 10), C.ink, { edge: 'cut' }),
    smile(334, 220, 26, C.brownDark, 3),
  ]);
}

/** A magic wand with sparkles. */
export function wand(): string {
  return pic('wand', 'a wand', [
    piece(band([[90, 330], [300, 100]], 18), C.brownDark),
    piece(band([[90, 330], [140, 276]], 26), C.wood),
    ...[0, 1, 2].map((k) => ink([[104 + k * 12, 300 - k * 13], [118 + k * 12, 312 - k * 13]], { width: 3, color: C.gold })),
    ...([[318, 76, 22], [276, 54, 12], [350, 120, 12], [340, 46, 9]] as const).map(([x, y, r]) =>
      piece(poly([[x, y - r], [x + r * 0.25, y - r * 0.25], [x + r, y], [x + r * 0.25, y + r * 0.25], [x, y + r], [x - r * 0.25, y + r * 0.25], [x - r, y], [x - r * 0.25, y - r * 0.25]]), C.gold, { edge: 'cut', fibre: false }),
    ),
  ]);
}

/** An oil lamp. */
export function lamp(): string {
  return pic('lamp', 'a lamp', [
    ground(200, 344, 120),
    piece(ellipse(200, 330, 90, 18), C.brownDark),
    piece(rect(186, 250, 28, 80, 6), C.gold),
    piece(curve([[130, 250], [200, 220], [270, 250], [250, 270], [150, 270]], 2), C.gold),
    piece(curve([[150, 250], [140, 170], [200, 120], [260, 170], [250, 250]], 2), 'rgba(255,240,200,0.7)'),
    piece(curve([[200, 230], [180, 200], [200, 150], [220, 200]], 2), C.orange, { edge: 'cut', fibre: false }),
    piece(curve([[200, 224], [190, 204], [200, 176], [210, 204]], 2), C.yellow, { edge: 'cut', fibre: false, shadow: false }),
    piece(rect(170, 104, 60, 22, 6), C.gold),
  ]);
}

/** A school desk. */
export function desk(): string {
  return pic('desk', 'a desk', [
    ground(200, 350, 170, 20),
    piece(poly([[60, 190], [340, 170], [356, 200], [44, 220]]), C.wood),
    piece(rect(70, 214, 20, 130, 4), C.brownDark),
    piece(rect(310, 196, 20, 140, 4), C.brownDark),
    piece(rect(84, 220, 230, 60, 6), C.brown),
    piece(rect(150, 140, 90, 50, 4), C.cream),
    ink([[160, 155], [228, 152]], { width: 2.5, color: C.tan }),
    ink([[160, 170], [220, 167]], { width: 2.5, color: C.tan }),
    piece(rect(260, 150, 26, 34, 4), C.charcoal),
    piece(band([[272, 150], [300, 90]], 4), C.white),
  ]);
}

/** A tent. */
export function tent(): string {
  return pic('tent', 'a tent', [
    piece(rect(0, 330, 400, 70), C.green, { fibre: false, shadow: false }),
    piece(poly([[40, 340], [200, 80], [360, 340]]), C.orange),
    piece(poly([[200, 80], [360, 340], [270, 340]]), C.ginger, { fibre: false }),
    piece(poly([[150, 340], [200, 220], [250, 340]]), C.brownDark),
    ink([[200, 80], [200, 50]], { width: 4, color: C.brownDark }),
    piece(poly([[200, 50], [240, 60], [200, 72]]), C.red, { edge: 'cut' }),
  ]);
}

/** A bird's nest with eggs. */
export function nest(): string {
  const twigs = Array.from({ length: 10 }, (_, i) => ink([[70 + i * 4, 250 + (i % 3) * 14], [330 - i * 4, 240 + ((i + 1) % 3) * 16]], { width: 4, color: i % 2 ? C.brown : C.brownDark }));
  return pic('nest', 'a nest', [
    ground(200, 330, 140),
    piece(curve([[60, 230], [340, 230], [320, 300], [200, 330], [80, 300]], 2), C.wood),
    piece(circle(160, 220, 30), C.sky),
    piece(circle(210, 210, 30), C.sky),
    piece(circle(250, 226, 28), C.sky),
    ...twigs,
    dot(150, 210, 4, C.blueDark, 0.6),
    dot(216, 200, 4, C.blueDark, 0.6),
  ]);
}

/** A twig with leaves. */
export function twig(): string {
  return pic('twig', 'a twig', [
    piece(band([[60, 300], [180, 220], [340, 120]], 12), C.brown),
    piece(band([[180, 220], [240, 270]], 8), C.brown),
    piece(band([[260, 170], [270, 100]], 7), C.brown),
    piece(ellipse(250, 290, 30, 16, 30), C.green, { edge: 'cut' }),
    piece(ellipse(272, 86, 28, 14, -60), C.green, { edge: 'cut' }),
    piece(ellipse(350, 110, 30, 15, -20), C.greenDark, { edge: 'cut' }),
    piece(ellipse(120, 240, 26, 13, -40), C.green, { edge: 'cut' }),
  ]);
}

/** A long, straight stick. */
export function stick(): string {
  return pic('stick', 'a stick', [
    ground(200, 320, 160, 18),
    piece(band([[40, 320], [360, 140]], 30), C.wood),
    piece(band([[230, 214], [250, 150]], 14), C.wood),
    ...[110, 190, 280].map((x) => ink([[x, 290 - (x - 40) * 0.56], [x + 24, 280 - (x - 40) * 0.56]], { width: 3, color: C.brownDark, opacity: 0.6 })),
    piece(ellipse(362, 140, 14, 16), C.tan, { edge: 'cut', fibre: false }),
  ]);
}

/** An alarm clock. */
export function clock(): string {
  return pic('clock', 'a clock', [
    ground(200, 350, 120),
    piece(band([[130, 320], [110, 350]], 14), C.brownDark),
    piece(band([[270, 320], [290, 350]], 14), C.brownDark),
    piece(circle(126, 110, 40), C.red),
    piece(circle(274, 110, 40), C.red),
    piece(circle(200, 220, 120), C.red),
    piece(circle(200, 220, 96), C.cream, { fibre: false }),
    ...Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return dot(200 + Math.cos(a) * 80, 220 + Math.sin(a) * 80, i % 3 ? 4 : 7, C.ink);
    }),
    ink([[200, 220], [200, 160]], { width: 7 }),
    ink([[200, 220], [244, 240]], { width: 6 }),
    piece(circle(200, 220, 9), C.gold, { edge: 'cut' }),
  ]);
}

/** A plum. */
export function plum(): string {
  return pic('plum', 'a plum', [
    ground(200, 340, 110),
    piece(curve([[200, 120], [300, 150], [310, 270], [230, 340], [170, 340], [90, 270], [100, 150]]), C.purple),
    ink([[200, 130], [190, 220], [200, 320]], { width: 4, color: C.plum }),
    shine([[130, 180], [150, 160], [160, 172], [140, 196]], 0.45),
    piece(band([[200, 130], [210, 80]], 9), C.brownDark),
    piece(ellipse(244, 92, 36, 16, -20), C.green),
  ]);
}

/** A bottle of milk. */
export function milk(): string {
  return pic('milk', 'milk', [
    ground(200, 350, 100),
    piece(curve([[150, 110], [250, 110], [250, 160], [280, 220], [280, 340], [120, 340], [120, 220], [150, 160]], 2), C.white),
    piece(rect(146, 80, 108, 36, 8), C.blue),
    piece(rect(140, 230, 120, 70, 8), C.sky, { fibre: false }),
    piece(circle(200, 265, 22), C.white, { fibre: false }),
    shine([[136, 230], [148, 226], [150, 320], [138, 324]], 0.4),
  ]);
}

/** A wrapped present. */
export function gift(): string {
  return pic('gift', 'a gift', [
    ground(200, 350, 150),
    piece(rect(80, 180, 240, 170, 8), C.purple),
    piece(rect(66, 150, 268, 50, 8), C.plum),
    piece(rect(182, 150, 36, 200, 2), C.gold, { fibre: false }),
    piece(curve([[200, 150], [130, 90], [150, 70], [200, 140]], 2), C.gold),
    piece(curve([[200, 150], [270, 90], [250, 70], [200, 140]], 2), C.gold),
    piece(circle(200, 148, 16), C.goldLight, { edge: 'cut' }),
  ]);
}

/** A belt. */
export function belt(): string {
  return pic('belt', 'a belt', [
    ground(200, 320, 160, 20),
    piece(curve([[40, 200], [200, 170], [360, 200], [360, 250], [200, 220], [40, 250]], 2), C.brownDark),
    ...[90, 130, 270, 310].map((x) => piece(circle(x, x < 200 ? 218 : 218, 5), C.ink, { edge: 'clean', shadow: false })),
    piece(rect(160, 170, 80, 80, 10), C.gold),
    piece(rect(176, 186, 48, 48, 6), C.brownDark, { fibre: false }),
    piece(rect(196, 180, 8, 60, 3), C.goldLight, { edge: 'cut', fibre: false }),
  ]);
}

/** A pond with a lily pad. */
export function pond(): string {
  return pic('pond', 'a pond', [
    piece(rect(20, 170, 360, 210, 40), C.green, { shadow: false }),
    piece(curve([[40, 280], [100, 200], [300, 196], [370, 270], [300, 350], [100, 352]], 2), C.blue),
    piece(curve([[80, 280], [130, 230], [280, 226], [330, 276], [280, 326], [120, 330]], 2), C.sky, { fibre: false }),
    piece(curve([[140, 280], [200, 250], [240, 280], [200, 300], [190, 280]], 2), C.greenDark),
    piece(circle(210, 266, 12), C.pink, { edge: 'cut' }),
    ...[[90, 190], [120, 180], [310, 186]].map(([x, y]) => piece(band([[x, y + 20], [x, y - 40]], 6), C.greenDeep)),
    ...[[90, 150], [310, 146]].map(([x, y]) => piece(ellipse(x, y, 8, 22), C.brown)),
  ]);
}

/** A cliff by the sea. */
export function cliff(): string {
  return pic('cliff', 'a cliff', [
    piece(rect(20, 20, 360, 360, 40), C.sky, { shadow: false }),
    piece(curve([[24, 300], [100, 290], [200, 310], [300, 290], [376, 300], [376, 340], [340, 376], [60, 376], [24, 340]], 2), C.blue, { fibre: false }),
    piece(poly([[24, 120], [180, 110], [210, 160], [240, 260], [256, 376], [60, 376], [24, 340]]), C.stone),
    piece(poly([[24, 110], [180, 100], [190, 130], [24, 140]]), C.green),
    ink([[120, 160], [150, 220], [140, 300]], { width: 3, color: C.greyDark, opacity: 0.5 }),
    piece(curve([[260, 330], [300, 320], [340, 330], [320, 340]], 2), C.white, { fibre: false }),
    ink([[300, 70], [314, 62], [328, 70]], { width: 3, color: C.ink }),
  ]);
}

/** A masquerade mask. */
export function mask(): string {
  return pic('mask', 'a mask', [
    piece(band([[330, 200], [370, 330]], 10), C.brownDark),
    piece(curve([[50, 190], [110, 150], [200, 180], [290, 150], [350, 190], [320, 260], [240, 260], [200, 230], [160, 260], [80, 260]], 2), C.purple),
    piece(ellipse(130, 212, 32, 18), C.ink, { edge: 'cut', fibre: false }),
    piece(ellipse(270, 212, 32, 18), C.ink, { edge: 'cut', fibre: false }),
    ...[[90, 170], [200, 190], [310, 170]].map(([x, y]) => dot(x, y, 6, C.gold)),
    piece(curve([[60, 180], [20, 120], [60, 100], [90, 160]], 2), C.pink),
    piece(curve([[340, 180], [380, 120], [340, 100], [310, 160]], 2), C.pink),
  ]);
}

export const book3Pictures: Record<string, () => string> = {
  frog, crab, drum, flag, slug, wand, lamp, desk, tent, nest, twig, stick, clock, plum, milk, gift, belt, pond, cliff, mask,
};

