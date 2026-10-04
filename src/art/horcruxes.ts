/** The six Horcruxes, 300 × 300, collected at the end of books 1–6. */
import { C } from './palette';
import { band, circle, curve, ellipse, group, ink, piece, poly, rect, svg, type Node } from './paper';

const art = (name: string, label: string, nodes: Node[]) => svg({ w: 300, h: 300, name: 'hx-' + name, label, className: 'horcrux' }, nodes);
const glint = (x: number, y: number, s = 1): Node =>
  piece(
    poly([[x, y - 14 * s], [x + 3 * s, y - 3 * s], [x + 14 * s, y], [x + 3 * s, y + 3 * s], [x, y + 14 * s], [x - 3 * s, y + 3 * s], [x - 14 * s, y], [x - 3 * s, y - 3 * s]]),
    C.white,
    { edge: 'cut', fibre: false, shadow: false, opacity: 0.85 },
  );

export function ring(): string {
  return art('ring', 'the ring', [
    ink(ellipse(150, 190, 82, 58), { width: 26, color: '#b8862f', closed: true }),
    ink(ellipse(150, 186, 82, 58), { width: 22, color: C.gold, closed: true }),
    piece(curve([[110, 120], [150, 90], [190, 120], [176, 140], [124, 140]], 2), '#b8862f'),
    piece(curve([[118, 104], [150, 64], [182, 104], [150, 128]], 2), C.charcoal),
    ink([[136, 92], [164, 92], [150, 116], [136, 92]], { width: 2.5, color: '#8a8e96' }),
    ink([[150, 92], [150, 116]], { width: 2.5, color: '#8a8e96' }),
    glint(206, 150, 0.8),
  ]);
}

export function diary(): string {
  return art('diary', 'the diary', [
    piece(rect(70, 60, 160, 200, 8), '#1e1b22'),
    piece(rect(220, 66, 14, 188, 4), C.cream, { fibre: false }),
    ink([[84, 70], [84, 250]], { width: 3, color: '#3a3640' }),
    piece(rect(112, 110, 90, 30, 4), '#3a3640', { fibre: false }),
    ink([[124, 125], [190, 125]], { width: 3, color: C.goldLight }),
    piece(circle(156, 200, 16), '#fffaf0', { edge: 'torn' }),
    glint(208, 86, 0.6),
  ]);
}

export function locket(): string {
  return art('locket', 'the locket', [
    ink([[100, 40], [150, 110], [200, 40]], { width: 4, color: C.gold }),
    piece(circle(150, 116, 12), C.gold, { edge: 'cut' }),
    piece(ellipse(150, 190, 72, 82), C.gold),
    piece(ellipse(150, 190, 56, 66), '#e8b84c', { fibre: false }),
    // the serpentine S, in green stones
    ink([[176, 148], [134, 148], [124, 172], [150, 188], [176, 206], [166, 232], [122, 232]], { width: 12, color: C.greenDark }),
    ...[[176, 148], [124, 172], [176, 206], [122, 232]].map(([x, y]) => piece(circle(x, y, 6), C.green, { edge: 'cut', fibre: false })),
    glint(208, 140, 0.8),
  ]);
}

export function cup(): string {
  return art('cup', 'the golden cup', [
    piece(ellipse(150, 266, 70, 16), '#b8862f'),
    piece(band([[150, 250], [150, 196]], 26), C.gold),
    piece(curve([[86, 70], [214, 70], [210, 150], [176, 200], [124, 200], [90, 150]]), C.gold),
    ink([[94, 96], [56, 96], [52, 140], [96, 152]], { width: 14, color: C.gold }),
    ink([[206, 96], [244, 96], [248, 140], [204, 152]], { width: 14, color: C.gold }),
    piece(ellipse(150, 72, 64, 12), '#b8862f', { fibre: false }),
    // a little badger
    group({}, [
      piece(ellipse(150, 136, 26, 22), C.charcoal, { edge: 'cut' }),
      piece(poly([[150, 116], [140, 150], [160, 150]]), C.white, { edge: 'cut', fibre: false, shadow: false }),
    ]),
    glint(196, 96, 0.8),
  ]);
}

export function diadem(): string {
  return art('diadem', 'the diadem', [
    piece(curve([[40, 200], [80, 150], [150, 136], [220, 150], [260, 200], [240, 210], [150, 172], [60, 210]], 2), '#c9ccd2'),
    piece(poly([[110, 160], [150, 70], [190, 160], [150, 150]]), '#c9ccd2'),
    piece(poly([[70, 180], [92, 120], [116, 166]]), '#c9ccd2'),
    piece(poly([[230, 180], [208, 120], [184, 166]]), '#c9ccd2'),
    piece(poly([[150, 96], [170, 130], [150, 156], [130, 130]]), C.blue, { edge: 'cut' }),
    piece(circle(92, 150, 8), C.sky, { edge: 'cut' }),
    piece(circle(208, 150, 8), C.sky, { edge: 'cut' }),
    // the eagle wings
    ink([[118, 176], [92, 192], [70, 188]], { width: 4, color: '#8a8e96' }),
    ink([[182, 176], [208, 192], [230, 188]], { width: 4, color: '#8a8e96' }),
    glint(178, 100, 0.8),
  ]);
}

export function nagini(): string {
  return art('nagini', 'Nagini', [
    piece(ellipse(150, 230, 110, 40), '#4a5a30'),
    piece(ellipse(150, 222, 84, 24), '#5a6a3a', { fibre: false }),
    piece(band([[190, 226], [220, 160], [180, 110], [150, 90]], 40), '#5a6a3a'),
    piece(curve([[110, 90], [130, 56], [176, 52], [204, 76], [196, 108], [150, 120], [116, 110]]), '#5a6a3a'),
    piece(ellipse(140, 80, 10, 8), C.yellow, { edge: 'cut' }),
    piece(ellipse(176, 76, 10, 8), C.yellow, { edge: 'cut' }),
    piece(ellipse(140, 80, 2.5, 7), C.ink, { edge: 'clean', shadow: false }),
    piece(ellipse(176, 76, 2.5, 7), C.ink, { edge: 'clean', shadow: false }),
    ...[[120, 226], [160, 230], [200, 222], [214, 170], [196, 128]].map(([x, y]) => piece(ellipse(x, y, 10, 6), '#3a4824', { edge: 'cut', fibre: false, shadow: false })),
  ]);
}

export const horcruxArt: Record<string, () => string> = { ring, diary, locket, cup, diadem, nagini };

export const HORCRUX_NAMES: Record<string, string> = {
  ring: 'The Ring',
  diary: 'The Diary',
  locket: 'The Locket',
  cup: 'The Golden Cup',
  diadem: 'The Diadem',
  nagini: 'Nagini',
};
