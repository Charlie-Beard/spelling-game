/** Book 1 — The Philosopher's Stone. Three-letter words. */
import { C } from '../palette';
import { band, circle, curve, dot, ellipse, group, ink, piece, poly, rect, svg } from '../paper';
import { blush, eye, ground, shine } from './kit';

const pic = (name: string, label: string, nodes: Parameters<typeof svg>[1]) =>
  svg({ w: 400, h: 400, name, label }, nodes);

export function cat(): string {
  return pic('cat', 'a cat', [
    ground(200, 352, 120),
    piece(band([[240, 336], [318, 326], [352, 262], [334, 206]], 26), C.orange),
    piece(ellipse(334, 204, 15, 17, -10), C.cream),
    piece(curve([[200, 175], [272, 215], [290, 300], [262, 352], [138, 352], [110, 300], [128, 215]]), C.orange),
    piece(curve([[200, 230], [238, 260], [238, 330], [200, 346], [162, 330], [162, 260]]), C.cream),
    piece(ellipse(166, 346, 26, 16), C.cream),
    piece(ellipse(234, 346, 26, 16), C.cream),
    ink([[160, 340], [160, 352]], { width: 2 }),
    ink([[172, 340], [172, 352]], { width: 2 }),
    ink([[228, 340], [228, 352]], { width: 2 }),
    ink([[240, 340], [240, 352]], { width: 2 }),
    group({ part: 'head', origin: [200, 200] }, [
      piece(poly([[110, 132], [118, 34], [192, 92]]), C.orange),
      piece(poly([[290, 132], [282, 34], [208, 92]]), C.orange),
      piece(poly([[128, 112], [130, 58], [170, 92]]), C.pink, { fibre: false }),
      piece(poly([[272, 112], [270, 58], [230, 92]]), C.pink, { fibre: false }),
      piece(ellipse(200, 150, 100, 84), C.orange),
      piece(poly([[184, 70], [200, 104], [216, 70]]), C.ginger, { fibre: false, shadow: false }),
      piece(poly([[104, 140], [138, 148], [106, 162]]), C.ginger, { fibre: false, shadow: false }),
      piece(poly([[296, 140], [262, 148], [294, 162]]), C.ginger, { fibre: false, shadow: false }),
      piece(ellipse(180, 184, 28, 22), C.cream, { fibre: false }),
      piece(ellipse(220, 184, 28, 22), C.cream, { fibre: false }),
      piece(poly([[188, 164], [212, 164], [200, 178]]), C.rose, { edge: 'cut', fibre: false }),
      ink([[200, 178], [200, 190], [188, 198]], { width: 2.5 }),
      ink([[200, 190], [212, 198]], { width: 2.5 }),
      piece(ellipse(160, 138, 20, 22), C.yellow, { edge: 'cut' }),
      piece(ellipse(240, 138, 20, 22), C.yellow, { edge: 'cut' }),
      piece(ellipse(160, 140, 6, 17), C.ink, { edge: 'clean', shadow: false }),
      piece(ellipse(240, 140, 6, 17), C.ink, { edge: 'clean', shadow: false }),
      dot(155, 130, 4, C.white),
      dot(235, 130, 4, C.white),
      ink([[150, 188], [96, 178]], { width: 2, color: C.white }),
      ink([[150, 196], [98, 202]], { width: 2, color: C.white }),
      ink([[250, 188], [304, 178]], { width: 2, color: C.white }),
      ink([[250, 196], [302, 202]], { width: 2, color: C.white }),
    ]),
  ]);
}

/** A battered, patched wizard hat (a nod to the Sorting Hat). */
export function hat(): string {
  return pic('hat', 'a hat', [
    ground(200, 334, 150),
    piece(ellipse(200, 300, 160, 40), C.brownDark),
    piece(curve([[96, 300], [140, 220], [176, 120], [214, 60], [250, 40], [268, 70], [236, 96], [240, 180], [276, 250], [304, 300]], 2), C.brown),
    piece(curve([[236, 96], [268, 70], [250, 40], [292, 74], [262, 110]], 2), C.brown),
    piece(curve([[110, 290], [200, 270], [290, 290], [292, 306], [200, 290], [108, 306]], 2), C.tan),
    piece(rect(150, 196, 46, 40, 6), C.wood, { rough: 1.3 }),
    ink([[154, 200], [192, 200]], { width: 2, color: C.brownDark, opacity: 0.6 }),
    ink([[150, 214], [158, 210], [166, 218], [174, 210], [182, 218], [192, 212]], { width: 2.5, color: C.cream }),
    ink([[170, 168], [190, 156], [212, 166]], { width: 5, color: C.brownDark }),
    ink([[222, 178], [236, 170]], { width: 5, color: C.brownDark }),
    ink([[184, 252], [204, 262], [226, 252]], { width: 5, color: C.brownDark }),
  ]);
}

/** A striped rug. */
export function mat(): string {
  const stripes = [C.red, C.gold, C.red, C.gold, C.red];
  return pic('mat', 'a mat', [
    ground(200, 300, 170, 26),
    piece(poly([[60, 196], [340, 176], [356, 296], [44, 310]]), C.redDark, { rough: 1.2 }),
    ...stripes.map((c, i) =>
      piece(poly([[74, 206 + i * 20], [328, 188 + i * 20], [330, 198 + i * 20], [72, 216 + i * 20]]), c, { fibre: false, shadow: false }),
    ),
    ...Array.from({ length: 9 }, (_, i) => ink([[48 + i * 4, 196 + i * 13], [28 + i * 4, 198 + i * 13]], { width: 3, color: C.tan })),
    ...Array.from({ length: 9 }, (_, i) => ink([[340 + i * 1.8, 176 + i * 14], [362 + i * 1.8, 174 + i * 14]], { width: 3, color: C.tan })),
  ]);
}

/** A rat (Scabbers). */
export function rat(): string {
  return pic('rat', 'a rat', [
    ground(200, 318, 140),
    piece(band([[110, 300], [70, 290], [48, 250], [62, 214]], 10), C.pink),
    piece(curve([[110, 300], [100, 240], [150, 196], [240, 190], [300, 230], [312, 296]]), C.greyDark),
    piece(curve([[140, 300], [150, 260], [210, 240], [270, 262], [280, 300]]), C.stoneLight, { fibre: false }),
    group({ part: 'head', origin: [300, 250] }, [
      piece(curve([[260, 200], [320, 196], [370, 250], [350, 268], [290, 268]]), C.greyDark),
      piece(ellipse(278, 184, 32, 30), C.greyDark),
      piece(ellipse(280, 186, 18, 17), C.pink, { fibre: false }),
      eye(318, 226, 9, false),
      piece(ellipse(366, 252, 9, 8), C.rose, { edge: 'cut' }),
      ink([[352, 254], [390, 240]], { width: 1.8, color: C.stoneLight }),
      ink([[352, 260], [392, 262]], { width: 1.8, color: C.stoneLight }),
    ]),
    piece(ellipse(160, 308, 20, 10), C.pink),
    piece(ellipse(262, 310, 20, 10), C.pink),
  ]);
}

/** A friendly bat. */
export function bat(): string {
  const wing = (s: 1 | -1) =>
    group({ part: s === 1 ? 'wingR' : 'wingL', origin: [200, 190] }, [
      piece(
        poly([
          [200, 170], [200 + s * 70, 110], [200 + s * 160, 120], [200 + s * 178, 170], [200 + s * 146, 168],
          [200 + s * 130, 214], [200 + s * 100, 196], [200 + s * 76, 240], [200 + s * 52, 214], [200, 230],
        ]),
        C.charcoal,
      ),
      ink([[200 + s * 70, 112], [200 + s * 100, 196]], { width: 2, color: C.slate }),
      ink([[200 + s * 70, 112], [200 + s * 130, 210]], { width: 2, color: C.slate }),
    ]);
  return pic('bat', 'a bat', [
    wing(-1),
    wing(1),
    piece(ellipse(200, 214, 46, 58), C.charcoal),
    piece(poly([[166, 160], [170, 110], [194, 150]]), C.charcoal),
    piece(poly([[234, 160], [230, 110], [206, 150]]), C.charcoal),
    piece(ellipse(200, 172, 44, 38), C.charcoal),
    eye(184, 168, 11),
    eye(216, 168, 11),
    piece(poly([[186, 192], [192, 204], [198, 192]]), C.white, { edge: 'cut', fibre: false, shadow: false }),
    piece(poly([[202, 192], [208, 204], [214, 192]]), C.white, { edge: 'cut', fibre: false, shadow: false }),
    blush(172, 188, 7),
    blush(228, 188, 7),
  ]);
}

/** A folded magical map with footprints. */
export function map(): string {
  return pic('map', 'a map', [
    ground(200, 330, 160),
    piece(poly([[50, 110], [150, 86], [250, 110], [350, 86], [350, 300], [250, 324], [150, 300], [50, 324]]), C.sand),
    piece(poly([[150, 86], [250, 110], [250, 324], [150, 300]]), C.cream, { fibre: false }),
    ink([[80, 150], [120, 150], [120, 200], [200, 200], [200, 260], [300, 260]], { width: 3, color: C.brown, opacity: 0.7 }),
    ink([[260, 140], [320, 140], [320, 230]], { width: 3, color: C.brown, opacity: 0.7 }),
    ...[[96, 176], [110, 190], [150, 214], [172, 228], [214, 238], [236, 252], [270, 240], [290, 252]].map(([x, y], i) =>
      piece(ellipse(x, y, 5, 8, i % 2 ? 20 : -20), C.ink, { edge: 'cut', fibre: false, shadow: false }),
    ),
    piece(circle(300, 270, 12), C.red, { edge: 'cut' }),
  ]);
}

/** A school satchel. */
export function bag(): string {
  return pic('bag', 'a bag', [
    ground(200, 340, 140),
    piece(band([[120, 180], [130, 70], [270, 70], [280, 180]], 18), C.brownDark),
    piece(rect(80, 150, 240, 190, 28), C.wood),
    piece(curve([[80, 160], [200, 140], [320, 160], [318, 250], [200, 266], [82, 250]], 2), C.brown),
    piece(rect(184, 236, 32, 40, 6), C.gold, { edge: 'cut' }),
    piece(rect(194, 248, 12, 16, 3), C.brownDark, { edge: 'clean', shadow: false }),
    ink([[96, 300], [304, 300]], { width: 2.5, color: C.brownDark, opacity: 0.5 }),
  ]);
}

/** A cap. */
export function cap(): string {
  return pic('cap', 'a cap', [
    ground(200, 300, 150),
    piece(curve([[210, 270], [300, 250], [370, 270], [350, 296], [250, 300]], 2), C.redDark),
    piece(curve([[70, 270], [80, 170], [200, 110], [300, 170], [310, 270]], 2), C.red),
    ink([[200, 112], [196, 270]], { width: 3, color: C.redDark }),
    ink([[130, 140], [150, 266]], { width: 3, color: C.redDark }),
    ink([[262, 140], [252, 266]], { width: 3, color: C.redDark }),
    piece(circle(200, 112, 12), C.gold, { edge: 'cut' }),
    piece(rect(70, 256, 240, 22, 6), C.gold, { rough: 1 }),
  ]);
}

/** A frying pan. */
export function pan(): string {
  return pic('pan', 'a pan', [
    ground(170, 320, 150),
    piece(band([[250, 210], [330, 160], [372, 130]], 26), C.brownDark),
    piece(ellipse(160, 230, 130, 74), C.charcoal),
    piece(ellipse(160, 222, 110, 56), C.slate, { fibre: false }),
    shine([[90, 214], [130, 192], [140, 200], [100, 222]], 0.35),
    piece(circle(352, 142, 8), C.stone, { edge: 'cut', fibre: false }),
  ]);
}

/** A folding hand fan. */
export function fan(): string {
  const n = 9;
  const ribs = Array.from({ length: n }, (_, i) => {
    const a0 = Math.PI * (1.12 + (i / n) * 0.76);
    const a1 = Math.PI * (1.12 + ((i + 1) / n) * 0.76);
    const R = 170;
    return piece(
      poly([[200, 320], [200 + Math.cos(a0) * R, 320 + Math.sin(a0) * R], [200 + Math.cos(a1) * R, 320 + Math.sin(a1) * R]]),
      i % 2 ? C.purple : C.plum,
      { fibre: false, edge: 'cut' },
    );
  });
  return pic('fan', 'a fan', [
    ...ribs,
    piece(curve([[60, 230], [200, 150], [340, 230], [330, 250], [200, 174], [70, 250]], 2), C.gold, { edge: 'cut', fibre: false }),
    piece(circle(200, 320, 16), C.gold, { edge: 'cut' }),
    piece(band([[200, 330], [200, 372]], 16), C.brownDark),
  ]);
}

/** A pig with a curly tail. */
export function pig(): string {
  return pic('pig', 'a pig', [
    ground(200, 330, 140),
    ink([[318, 220], [344, 206], [340, 190], [326, 198], [336, 214], [356, 210]], { width: 5, color: C.rose }),
    piece(rect(118, 270, 28, 60, 8), C.rose),
    piece(rect(254, 270, 28, 60, 8), C.rose),
    piece(ellipse(220, 236, 110, 76), C.pink),
    piece(rect(150, 280, 28, 54, 8), C.rose),
    piece(rect(226, 280, 28, 54, 8), C.rose),
    group({ part: 'head', origin: [130, 210] }, [
      piece(poly([[92, 152], [86, 108], [126, 140]]), C.rose),
      piece(poly([[158, 146], [174, 106], [184, 150]]), C.rose),
      piece(ellipse(128, 196, 70, 60), C.pink),
      piece(ellipse(104, 214, 30, 24), C.rose),
      piece(ellipse(94, 214, 5, 8), C.redDark, { edge: 'clean', shadow: false }),
      piece(ellipse(114, 214, 5, 8), C.redDark, { edge: 'clean', shadow: false }),
      eye(118, 172, 9, false),
      eye(156, 176, 9, false),
      blush(164, 210, 10),
    ]),
  ]);
}

/** A big sewing pin. */
export function pin(): string {
  return pic('pin', 'a pin', [
    ground(200, 340, 90, 14),
    piece(band([[248, 140], [154, 330]], 12), C.stoneLight, { edge: 'cut' }),
    piece(poly([[150, 326], [160, 332], [140, 360]]), C.stoneLight, { edge: 'cut', fibre: false }),
    piece(circle(258, 124, 52), C.red),
    shine([[226, 104], [242, 88], [254, 92], [236, 112]], 0.55),
  ]);
}

/** A dustbin. */
export function bin(): string {
  return pic('bin', 'a bin', [
    ground(200, 350, 120),
    piece(poly([[110, 140], [290, 140], [270, 346], [130, 346]]), C.stone),
    ...[150, 200, 250].map((x) => ink([[x, 160], [x - (x - 200) * 0.1, 330]], { width: 4, color: C.greyDark, opacity: 0.6 })),
    piece(ellipse(200, 132, 104, 22), C.greyDark),
    piece(rect(176, 92, 48, 30, 12), C.greyDark),
    shine([[124, 156], [138, 156], [146, 320], [138, 320]], 0.35),
  ]);
}

/** A tin can (of sweets). */
export function tin(): string {
  return pic('tin', 'a tin', [
    ground(200, 340, 110),
    piece(rect(110, 110, 180, 230, 18), C.stoneLight),
    piece(ellipse(200, 112, 90, 22), C.stone),
    piece(rect(110, 170, 180, 110, 4), C.blue, { fibre: false }),
    piece(circle(200, 225, 34), C.gold, { edge: 'cut', fibre: false }),
    piece(poly([[200, 200], [208, 220], [228, 222], [212, 234], [218, 254], [200, 242], [182, 254], [188, 234], [172, 222], [192, 220]]), C.white, { edge: 'cut', fibre: false, shadow: false }),
    shine([[122, 120], [134, 120], [134, 330], [122, 330]], 0.4),
  ]);
}

/** A lid lifting off a pot. */
export function lid(): string {
  return pic('lid', 'a lid', [
    ground(200, 350, 120),
    piece(rect(100, 250, 200, 100, 20), C.stone, { rough: 0.8 }),
    piece(ellipse(200, 250, 100, 18), C.greyDark, { fibre: false }),
    group({ part: 'lid', origin: [200, 180] }, [
      piece(ellipse(200, 178, 120, 30, -10), C.red),
      piece(curve([[90, 186], [200, 120], [310, 160], [308, 170], [200, 140], [92, 200]], 2), C.redDark, { fibre: false, shadow: false }),
      piece(ellipse(196, 140, 26, 14, -10), C.gold),
    ]),
    ink([[160, 226], [150, 210]], { width: 3, color: C.white, opacity: 0.7 }),
    ink([[240, 222], [252, 206]], { width: 3, color: C.white, opacity: 0.7 }),
  ]);
}

/** A bubbling cauldron pot. */
export function pot(): string {
  return pic('pot', 'a pot', [
    ground(200, 350, 130),
    piece(curve([[80, 170], [320, 170], [330, 270], [280, 340], [120, 340], [70, 270]]), C.charcoal),
    piece(ellipse(200, 170, 128, 30), C.ink),
    piece(ellipse(200, 168, 112, 22), C.green, { fibre: false }),
    piece(circle(160, 160, 14), C.green),
    piece(circle(232, 154, 10), C.green),
    piece(circle(260, 166, 7), C.green),
    shine([[100, 210], [114, 204], [120, 290], [106, 296]], 0.25),
    piece(rect(116, 330, 24, 26, 6), C.ink),
    piece(rect(260, 330, 24, 26, 6), C.ink),
  ]);
}

/** A teacup on a saucer. */
export function cup(): string {
  return pic('cup', 'a cup', [
    ground(200, 320, 150),
    piece(ellipse(200, 300, 150, 30), C.sky),
    piece(curve([[280, 180], [340, 176], [344, 240], [290, 262]], 2), C.cream),
    piece(curve([[300, 196], [326, 196], [324, 232], [294, 244]], 2), C.white, { fibre: false, shadow: false }),
    piece(curve([[100, 160], [300, 160], [290, 250], [250, 300], [150, 300], [110, 250]]), C.cream),
    piece(ellipse(200, 162, 100, 20), C.brown, { fibre: false }),
    piece(curve([[110, 210], [290, 210], [286, 236], [114, 236]], 2), C.sky, { fibre: false, shadow: false }),
    ...[130, 170, 210, 250].map((x) => dot(x + 10, 223, 5, C.blue)),
  ]);
}

/** A mug of frothy butterbeer. */
export function mug(): string {
  return pic('mug', 'a mug', [
    ground(190, 346, 130),
    piece(curve([[260, 170], [340, 170], [344, 290], [264, 300]], 2), C.wood),
    piece(curve([[268, 196], [316, 196], [318, 270], [268, 276]], 2), C.cream, { fibre: false }),
    piece(rect(90, 140, 190, 206, 20), C.wood),
    ...[150, 200].map((y) => piece(rect(86, y + 40, 198, 16, 4), C.brownDark, { fibre: false })),
    piece(curve([[80, 150], [110, 100], [160, 116], [200, 92], [250, 110], [290, 150], [250, 170], [130, 170]]), '#efe0bd'),
    shine([[104, 200], [116, 196], [118, 320], [106, 324]], 0.3),
  ]);
}

/** An iced bun with a cherry. */
export function bun(): string {
  return pic('bun', 'a bun', [
    ground(200, 330, 140),
    piece(curve([[70, 300], [80, 200], [200, 150], [320, 200], [330, 300]]), C.tan),
    piece(curve([[80, 240], [110, 186], [200, 160], [290, 186], [320, 240], [290, 246], [270, 270], [240, 244], [200, 270], [160, 244], [130, 268], [110, 244]]), C.white),
    piece(circle(200, 150, 24), C.red),
    shine([[190, 138], [200, 134], [202, 142], [192, 146]], 0.6),
    ink([[200, 128], [212, 98]], { width: 4, color: C.greenDark }),
    ...[[150, 210], [230, 200], [262, 226], [180, 232]].map(([x, y], i) =>
      piece(rect(x, y, 14, 5, 2), [C.pink, C.sky, C.yellow, C.green][i], { edge: 'clean', shadow: false }),
    ),
  ]);
}

/** A hazelnut. */
export function nut(): string {
  return pic('nut', 'a nut', [
    ground(200, 340, 110),
    piece(curve([[200, 120], [290, 180], [300, 280], [200, 340], [100, 280], [110, 180]]), C.wood),
    ink([[160, 200], [150, 290]], { width: 3, color: C.brown, opacity: 0.6 }),
    ink([[240, 200], [250, 290]], { width: 3, color: C.brown, opacity: 0.6 }),
    piece(curve([[110, 170], [140, 100], [200, 80], [260, 100], [290, 170], [200, 190]]), C.brownDark),
    ...[130, 165, 200, 235, 270].map((x) => ink([[x, 120], [x + 4, 176]], { width: 2, color: C.brown })),
    piece(rect(194, 56, 12, 30, 4), C.brownDark),
    shine([[130, 220], [142, 214], [146, 280], [134, 282]], 0.3),
  ]);
}

/** A ladybird. */
export function bug(): string {
  return pic('bug', 'a bug', [
    ground(200, 320, 130),
    ...[-1, 1].flatMap((s) => [
      ink([[200 + s * 80, 220], [200 + s * 130, 200]], { width: 6, color: C.ink }),
      ink([[200 + s * 86, 260], [200 + s * 136, 270]], { width: 6, color: C.ink }),
      ink([[200 + s * 70, 300], [200 + s * 110, 330]], { width: 6, color: C.ink }),
    ]),
    piece(ellipse(200, 250, 104, 92), C.red),
    ink([[200, 162], [200, 340]], { width: 4, color: C.ink }),
    ...[[150, 220, 18], [250, 220, 18], [140, 284, 15], [260, 284, 15], [190, 310, 10], [210, 190, 9]].map(([x, y, r]) =>
      piece(circle(x, y, r), C.ink, { edge: 'cut', fibre: false, shadow: false }),
    ),
    piece(ellipse(200, 160, 56, 40), C.ink),
    eye(182, 152, 10),
    eye(218, 152, 10),
    ink([[180, 126], [164, 96]], { width: 4 }),
    ink([[220, 126], [236, 96]], { width: 4 }),
    shine([[140, 190], [160, 176], [166, 184], [146, 198]], 0.4),
  ]);
}

/** A spider web with a little spider. */
export function web(): string {
  const cx = 200;
  const cy = 190;
  const spokes = Array.from({ length: 8 }, (_, i) => (i / 8) * Math.PI * 2);
  const rings = [36, 76, 116, 156].map((r) =>
    ink(
      spokes.map((a) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r] as const).concat([[cx + r, cy]]),
      { width: 3, color: C.white },
    ),
  );
  return pic('web', 'a web', [
    piece(circle(cx, cy, 182), C.nightLight),
    ...spokes.map((a) => ink([[cx, cy], [cx + Math.cos(a) * 176, cy + Math.sin(a) * 176]], { width: 3, color: C.white })),
    ...rings,
    ink([[280, 40], [280, 236]], { width: 2, color: C.white }),
    group({ part: 'spider', origin: [280, 260] }, [
      ...[-1, 1].flatMap((s) => [0, 1, 2].map((k) => ink([[280, 256 + k * 6], [280 + s * 26, 244 + k * 12], [280 + s * 34, 262 + k * 12]], { width: 3, color: C.charcoal }))),
      piece(circle(280, 262, 18), C.charcoal),
      eye(274, 258, 5),
      eye(286, 258, 5),
    ]),
  ]);
}

/** A golden bell. */
export function bell(): string {
  return pic('bell', 'a bell', [
    ground(200, 340, 120),
    piece(band([[200, 80], [200, 60]], 26), C.redDark),
    piece(circle(200, 90, 18), C.gold, { edge: 'cut' }),
    piece(curve([[200, 96], [270, 120], [282, 240], [330, 300], [70, 300], [118, 240], [130, 120]]), C.gold),
    piece(curve([[70, 296], [200, 280], [330, 296], [320, 312], [200, 300], [80, 312]], 2), '#b8862f', { fibre: false }),
    piece(circle(200, 318, 20), '#b8862f'),
    shine([[146, 140], [162, 130], [158, 250], [140, 260]], 0.45),
  ]);
}

/** A grey rock. */
export function rock(): string {
  return pic('rock', 'a rock', [
    ground(200, 320, 160),
    piece(curve([[60, 320], [70, 240], [130, 170], [220, 150], [300, 190], [340, 260], [330, 320]], 2), C.stone),
    piece(curve([[120, 200], [180, 170], [230, 176], [190, 210], [140, 230]], 2), C.stoneLight, { fibre: false, shadow: false }),
    piece(curve([[240, 260], [300, 240], [320, 300], [260, 310]], 2), C.grey, { fibre: false, shadow: false }),
    ink([[200, 220], [220, 260], [210, 300]], { width: 3, color: C.greyDark, opacity: 0.6 }),
    piece(curve([[90, 320], [100, 290], [140, 300], [150, 322]], 2), C.green, { edge: 'cut' }),
  ]);
}

/** A butterfly net. */
export function net(): string {
  const grid = [];
  for (let k = 0; k < 6; k++) {
    grid.push(ink([[150 + k * 22, 70], [180 + k * 8, 250]], { width: 2.5, color: C.grey }));
    grid.push(ink([[140 + k * 4, 90 + k * 26], [290 - k * 10, 90 + k * 26]], { width: 2.5, color: C.grey }));
  }
  return pic('net', 'a net', [
    piece(curve([[130, 80], [200, 50], [290, 80], [270, 180], [210, 260], [160, 180]]), C.cream, { fibre: false }),
    ...grid,
    piece(band([[130, 84], [200, 52], [292, 84]], 12), C.wood, { edge: 'cut' }),
    piece(band([[292, 84], [130, 84]], 10), C.wood, { edge: 'cut' }),
    piece(band([[130, 84], [60, 360]], 16), C.brownDark),
  ]);
}

export const book1Pictures: Record<string, () => string> = {
  cat, hat, mat, rat, bat, map, bag, cap, pan, fan, pig, pin, bin, tin, lid, pot, cup, mug, bun, nut, bug, web, bell, rock, net,
};

