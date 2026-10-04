/** Book 5 — The Order of the Phoenix. ar, or, ur, ow, oi, air, ear, er. */
import { C } from '../palette';
import { band, circle, curve, dot, ellipse, ink, piece, poly, rect, svg, type Node, type Pt } from '../paper';
import { blush, eye, ground, shine, smile } from './kit';

const pic = (name: string, label: string, nodes: Parameters<typeof svg>[1]) => svg({ w: 400, h: 400, name, label }, nodes);

function starPts(cx: number, cy: number, R: number, r: number): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r : R;
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return pts;
}

/** A smiling star. */
export function star(): string {
  return pic('star', 'a star', [
    piece(poly(starPts(200, 210, 170, 72)), C.yellow),
    eye(170, 200, 10, false),
    eye(230, 200, 10, false),
    smile(200, 236, 36, C.brown, 4),
    blush(150, 232, 10),
    blush(250, 232, 10),
  ]);
}

/** The flying Ford Anglia. */
export function car(): string {
  return pic('car', 'a car', [
    ground(200, 330, 170, 20),
    piece(curve([[40, 290], [40, 230], [100, 220], [130, 150], [270, 150], [310, 220], [360, 230], [360, 290]], 2), C.sky),
    piece(poly([[140, 162], [196, 162], [196, 218], [116, 218]]), '#d6e8f5', { fibre: false }),
    piece(poly([[208, 162], [262, 162], [290, 218], [208, 218]]), '#d6e8f5', { fibre: false }),
    piece(rect(40, 250, 320, 12, 3), C.white, { fibre: false, shadow: false }),
    piece(circle(110, 296, 34), C.charcoal),
    piece(circle(290, 296, 34), C.charcoal),
    piece(circle(110, 296, 14), C.stoneLight, { edge: 'cut' }),
    piece(circle(290, 296, 14), C.stoneLight, { edge: 'cut' }),
    piece(circle(352, 246, 9), C.yellow, { edge: 'cut' }),
  ]);
}

/** A glass jar. */
export function jar(): string {
  return pic('jar', 'a jar', [
    ground(200, 350, 110),
    piece(curve([[130, 110], [270, 110], [290, 180], [290, 330], [110, 330], [110, 180]], 2), 'rgba(190,220,235,0.7)'),
    piece(rect(130, 80, 140, 40, 8), C.brownDark),
    piece(circle(170, 280, 22), C.red, { edge: 'cut' }),
    piece(circle(220, 290, 20), C.yellow, { edge: 'cut' }),
    piece(circle(200, 250, 18), C.green, { edge: 'cut' }),
    piece(circle(246, 256, 16), C.purple, { edge: 'cut' }),
    shine([[126, 170], [140, 166], [142, 310], [128, 314]], 0.5),
  ]);
}

/** A fork. */
export function fork(): string {
  return pic('fork', 'a fork', [
    piece(band([[200, 360], [200, 190]], 30), C.stoneLight),
    piece(curve([[140, 190], [200, 230], [260, 190], [260, 160], [140, 160]], 2), C.stoneLight),
    ...[150, 183, 217, 250].map((x) => piece(rect(x - 8, 40, 16, 140, 6), C.stoneLight)),
    shine([[192, 220], [200, 220], [200, 340], [192, 340]], 0.5),
  ]);
}

/** A brass horn. */
export function horn(): string {
  return pic('horn', 'a horn', [
    piece(band([[70, 210], [140, 200], [220, 170], [280, 130]], 24), C.gold),
    piece(curve([[260, 130], [320, 60], [380, 80], [370, 200], [300, 190]], 2), C.gold),
    piece(ellipse(338, 130, 28, 56, 20), '#b8862f', { fibre: false }),
    piece(rect(50, 196, 30, 30, 6), C.gold),
    ink([[150, 210], [200, 260], [250, 210]], { width: 14, color: C.gold }),
    ...[160, 190, 220].map((x) => piece(rect(x - 6, 168, 12, 30, 4), C.goldLight)),
    shine([[100, 200], [180, 186], [180, 192], [100, 206]], 0.5),
  ]);
}

/** A brown owl. */
export function owl(): string {
  return pic('owl', 'an owl', [
    piece(band([[60, 330], [340, 320]], 20), C.brownDark),
    piece(curve([[200, 80], [290, 120], [300, 240], [260, 320], [140, 320], [100, 240], [110, 120]]), C.wood),
    piece(curve([[200, 180], [250, 210], [250, 290], [200, 316], [150, 290], [150, 210]]), C.sand, { fibre: false }),
    piece(poly([[120, 110], [130, 60], [170, 100]]), C.wood),
    piece(poly([[280, 110], [270, 60], [230, 100]]), C.wood),
    piece(circle(160, 150, 38), C.cream, { fibre: false }),
    piece(circle(240, 150, 38), C.cream, { fibre: false }),
    eye(160, 150, 22),
    eye(240, 150, 22),
    piece(poly([[190, 180], [210, 180], [200, 204]]), C.orange, { edge: 'cut' }),
    ...[[180, 240], [220, 250], [196, 280]].map(([x, y]) => ink([[x - 8, y], [x, y + 6], [x + 8, y]], { width: 3, color: C.brown })),
    piece(ellipse(170, 326, 14, 8), C.orange),
    piece(ellipse(230, 326, 14, 8), C.orange),
  ]);
}

/** A cow. */
export function cow(): string {
  return pic('cow', 'a cow', [
    ground(200, 350, 150),
    ...[110, 150, 250, 290].map((x) => piece(rect(x - 10, 250, 20, 94, 6), '#e6dcc6')),
    piece(curve([[70, 260], [80, 180], [200, 170], [320, 180], [330, 260], [200, 280]], 2), '#ece4d0'),
    piece(curve([[140, 190], [180, 186], [190, 230], [150, 240]], 2), C.ink, { fibre: false }),
    piece(curve([[240, 210], [290, 200], [300, 250], [250, 256]], 2), C.ink, { fibre: false }),
    piece(curve([[50, 180], [50, 120], [110, 100], [140, 140], [130, 200], [80, 210]], 2), '#ece4d0'),
    piece(ellipse(80, 196, 40, 26), C.pink),
    dot(68, 196, 5, C.rose),
    dot(92, 196, 5, C.rose),
    eye(80, 140, 8, false),
    eye(116, 144, 8, false),
    piece(poly([[60, 110], [40, 80], [76, 102]]), C.cream),
    piece(poly([[124, 112], [146, 84], [134, 120]]), C.cream),
    piece(ellipse(330, 200, 8, 30, -30), '#ece4d0'),
  ]);
}

/** A crown. */
export function crown(): string {
  return pic('crown', 'a crown', [
    ground(200, 320, 130),
    piece(poly([[80, 300], [70, 140], [130, 210], [200, 110], [270, 210], [330, 140], [320, 300]]), C.gold),
    piece(rect(76, 270, 248, 36, 6), '#b8862f', { fibre: false }),
    ...[[130, 288, C.red], [200, 288, C.sky], [270, 288, C.green]].map(([x, y, c]) => piece(circle(x as number, y as number, 12), c as string, { edge: 'cut' })),
    ...[[70, 136], [200, 104], [330, 136]].map(([x, y]) => piece(circle(x, y, 14), C.goldLight, { edge: 'cut' })),
  ]);
}

/** A gold Galleon. */
export function coin(): string {
  return pic('coin', 'a coin', [
    ground(200, 340, 120),
    piece(circle(200, 200, 140), '#b8862f'),
    piece(circle(200, 194, 132), C.gold, { fibre: false }),
    piece(circle(200, 194, 104), C.goldLight, { fibre: false, shadow: false }),
    ink([[200, 130], [230, 194], [200, 258], [170, 194], [200, 130]], { width: 6, color: '#b8862f' }),
    shine([[110, 150], [140, 110], [150, 118], [122, 160]], 0.6),
  ]);
}

/** A can of oil with a drip. */
export function oil(): string {
  return pic('oil', 'oil', [
    ground(190, 350, 120),
    piece(band([[250, 180], [330, 110]], 16), C.stone),
    piece(rect(90, 170, 180, 176, 14), C.red),
    piece(rect(140, 140, 80, 40, 10), C.redDark),
    piece(rect(120, 220, 120, 70, 8), C.goldLight, { fibre: false }),
    piece(curve([[180, 230], [196, 256], [180, 276], [164, 256]], 2), C.ink, { edge: 'cut', fibre: false }),
    piece(curve([[336, 120], [350, 150], [336, 170], [322, 150]], 2), C.ink, { edge: 'cut' }),
  ]);
}

/** A wooden chair. */
export function chair(): string {
  return pic('chair', 'a chair', [
    ground(200, 356, 140),
    piece(rect(130, 60, 140, 160, 12), C.wood),
    piece(rect(150, 80, 100, 120, 8), C.brown, { fibre: false }),
    piece(poly([[100, 220], [300, 220], [320, 260], [80, 260]]), C.wood),
    piece(rect(96, 256, 20, 100, 4), C.brownDark),
    piece(rect(284, 256, 20, 100, 4), C.brownDark),
    piece(rect(130, 250, 16, 80, 4), C.brownDark),
    piece(rect(254, 250, 16, 80, 4), C.brownDark),
    piece(rect(150, 210, 100, 18, 6), C.red, { fibre: false }),
  ]);
}

/** Lovely long hair (seen from behind, with a bow). */
export function hair(): string {
  return pic('hair', 'hair', [
    piece(curve([[60, 400], [80, 320], [200, 300], [320, 320], [340, 400]], 2), C.blue),
    piece(curve([[120, 110], [200, 60], [280, 110], [310, 230], [300, 360], [250, 340], [200, 370], [150, 340], [100, 360], [90, 230]], 2), C.orange),
    ...[140, 175, 210, 245, 270].map((x, i) => ink([[x, 110 + i * 3], [x - 10 + i * 5, 250], [x + (i - 2) * 6, 340]], { width: 4, color: C.ginger })),
    piece(curve([[160, 130], [200, 150], [240, 130], [250, 170], [200, 160], [150, 170]], 2), C.blue),
    piece(circle(200, 152, 12), C.blueDark),
  ]);
}

/** A staircase. */
export function stairs(): string {
  const steps: Node[] = [];
  for (let i = 0; i < 6; i++) {
    steps.push(piece(rect(60 + i * 46, 300 - i * 42, 300 - i * 46, 44, 3), i % 2 ? C.stone : C.stoneLight));
  }
  return pic('stairs', 'stairs', [
    ...steps,
    piece(band([[70, 260], [330, 30]], 8), C.brownDark),
    ...[0, 1, 2, 3, 4].map((k) => piece(band([[90 + k * 50, 280 - k * 44], [90 + k * 50, 244 - k * 44]], 6), C.brownDark)),
  ]);
}

/** A long white beard. */
export function beard(): string {
  const face: Pt[] = [[130, 120], [200, 90], [270, 120], [276, 190], [200, 210], [124, 190]];
  return pic('beard', 'a beard', [
    piece(curve(face, 2), C.skin),
    eye(170, 140, 9, false),
    eye(230, 140, 9, false),
    piece(curve([[110, 170], [150, 200], [200, 190], [250, 200], [290, 170], [300, 260], [260, 340], [200, 380], [140, 340], [100, 260]], 2), '#ddd6ca'),
    ink([[160, 196], [200, 186], [240, 196]], { width: 6, color: C.stoneLight }),
    ...[150, 200, 250].map((x) => ink([[x, 230], [x + (x - 200) * 0.1, 320]], { width: 3, color: C.stoneLight })),
    piece(ellipse(200, 168, 12, 10), C.skinShade, { edge: 'cut', fibre: false }),
    piece(curve([[120, 110], [200, 70], [280, 110], [270, 90], [200, 56], [130, 90]], 2), '#ddd6ca'),
  ]);
}

/** A Hogwarts letter. */
export function letter(): string {
  return pic('letter', 'a letter', [
    ground(200, 320, 170, 22),
    piece(poly([[50, 110], [350, 100], [356, 300], [44, 306]]), C.cream),
    piece(poly([[50, 110], [200, 220], [350, 100]]), C.sand),
    ink([[44, 304], [200, 200], [356, 298]], { width: 3, color: C.sand }),
    piece(circle(200, 214, 34), C.red),
    ink([[188, 200], [194, 226], [200, 210], [206, 226], [212, 200]], { width: 4, color: '#f6e3c6' }),
  ]);
}

/** A shark. */
export function shark(): string {
  return pic('shark', 'a shark', [
    piece(curve([[20, 320], [120, 306], [200, 324], [280, 306], [380, 320], [380, 380], [20, 380]], 2), C.blue, { fibre: false }),
    piece(poly([[300, 180], [380, 120], [360, 200], [380, 270]]), C.slate),
    piece(curve([[40, 200], [120, 140], [260, 140], [320, 200], [260, 250], [120, 250]], 2), C.slate),
    piece(curve([[60, 210], [140, 236], [260, 230], [300, 210], [260, 246], [120, 248]], 2), C.white, { fibre: false }),
    piece(poly([[170, 150], [210, 70], [230, 150]]), C.slate),
    eye(100, 188, 10, false),
    ink([[70, 214], [90, 220], [110, 214], [130, 220]], { width: 3, color: C.ink }),
    ...[0, 1, 2].map((k) => ink([[150 + k * 14, 180], [146 + k * 14, 206]], { width: 3, color: C.charcoal })),
  ]);
}

/** A storm cloud with rain and lightning. */
export function storm(): string {
  return pic('storm', 'a storm', [
    piece(curve([[60, 210], [60, 160], [120, 140], [150, 90], [230, 90], [270, 130], [340, 140], [350, 210]], 3), C.slate),
    piece(poly([[210, 200], [170, 280], [205, 280], [180, 360], [260, 260], [222, 260], [250, 200]]), C.yellow, { edge: 'cut' }),
    ...[[100, 260], [130, 300], [300, 250], [320, 300], [90, 330]].map(([x, y]) => ink([[x, y], [x - 12, y + 30]], { width: 5, color: C.blue })),
  ]);
}

/** A hammer. */
export function hammer(): string {
  return pic('hammer', 'a hammer', [
    ground(200, 340, 140, 16),
    piece(band([[110, 320], [250, 150]], 26), C.wood),
    piece(poly([[200, 70], [330, 170], [300, 206], [170, 106]]), C.stone),
    piece(poly([[300, 130], [340, 160], [316, 190], [280, 162]]), C.greyDark, { fibre: false }),
    shine([[200, 82], [290, 150], [284, 156], [196, 90]], 0.5),
  ]);
}

/** A corn on the cob. */
export function corn(): string {
  const kernels: Node[] = [];
  for (let r = 0; r < 8; r++) for (let k = 0; k < 4; k++) kernels.push(piece(ellipse(170 + k * 20, 90 + r * 28, 9, 12), C.goldLight, { edge: 'cut', fibre: false, shadow: false }));
  return pic('corn', 'corn', [
    piece(curve([[200, 60], [260, 100], [260, 300], [200, 350], [140, 300], [140, 100]], 2), C.yellow),
    ...kernels,
    piece(curve([[140, 220], [80, 260], [100, 360], [190, 350]], 2), C.green),
    piece(curve([[260, 220], [320, 260], [300, 360], [210, 350]], 2), C.greenDark),
  ]);
}

/** A kettle boiling, with steam. */
export function boil(): string {
  return pic('boil', 'boil', [
    ground(200, 350, 130),
    ink([[150, 150], [200, 110], [250, 150]], { width: 12, color: C.charcoal }),
    piece(band([[280, 260], [340, 200], [360, 190]], 22), C.red),
    piece(curve([[100, 340], [110, 200], [200, 160], [290, 200], [300, 340]]), C.red),
    piece(ellipse(200, 168, 50, 14), C.redDark, { fibre: false }),
    piece(rect(96, 320, 208, 24, 8), C.redDark, { fibre: false }),
    shine([[126, 220], [140, 212], [146, 310], [132, 314]], 0.35),
    ...[0, 1, 2].map((k) => ink([[360 + k * 4, 170 - k * 30], [340 + k * 4, 140 - k * 30], [360 + k * 4, 110 - k * 30]], { width: 6, color: C.stoneLight, opacity: 0.9 })),
  ]);
}

export const book5Pictures: Record<string, () => string> = {
  star, car, jar, fork, horn, owl, cow, crown, coin, oil, chair, hair, stairs, beard, letter, shark, storm, hammer, corn, boil,
};
