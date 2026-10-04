/** Hosts from books 1 and 2. */
import { C } from '../palette';
import { band, circle, curve, dot, ellipse, group, ink, piece, poly, rect, svg, type Node, type Pt } from '../paper';
import { fluff } from './heroes';
import { H, HEAD, person, W, wand } from './people';

const [cx, cy] = HEAD;
const creature = (name: string, label: string, nodes: Node[]) => svg({ w: W, h: H, name, label, className: 'portrait' }, nodes);

/** Simple robe with no tie, in any colour. */
const plainRobe = (color: string, collar?: string): Node[] => [
  piece(curve([[40, 345], [52, 262], [104, 230], [150, 226], [196, 230], [248, 262], [260, 345]], 2), color),
  ...(collar ? [piece(poly([[122, 228], [150, 270], [178, 228], [168, 222], [150, 248], [132, 222]]), collar, { fibre: false })] : []),
];

export function ollivander(): string {
  return person({
    name: 'ollivander',
    label: 'Mr Ollivander',
    skin: C.skinPale,
    eyes: '#a9b3bd',
    eyeStyle: 'wide',
    face: [56, 72],
    back: [fluff([[cx - 60, cy - 70], [cx - 92, cy - 30], [cx - 96, cy + 30], [cx - 66, cy + 40], [cx + 66, cy + 40], [cx + 96, cy + 30], [cx + 92, cy - 30], [cx + 60, cy - 70], [cx, cy - 40]], C.white, 12)],
    body: plainRobe(C.plum, C.white),
    brows: 'raised',
    browColor: C.stoneLight,
    nose: 'long',
    mouth: 'smile',
    blush: false,
    extra: [wand(232, 318, C.wood)],
  });
}

export function trevor(): string {
  const wart = (x: number, y: number, r: number) => piece(circle(x, y, r), '#7d8a4a', { edge: 'cut', fibre: false, shadow: false });
  return creature('trevor', 'Trevor the toad', [
    piece(ellipse(150, 320, 120, 18), 'rgba(40,25,10,0.16)', { edge: 'cut', fibre: false, shadow: false }),
    // back legs
    piece(ellipse(60, 290, 50, 30, -20), '#8f9a58'),
    piece(ellipse(240, 290, 50, 30, 20), '#8f9a58'),
    piece(curve([[40, 300], [60, 200], [150, 160], [240, 200], [260, 300], [150, 320]]), '#9aa65e'),
    piece(curve([[90, 300], [100, 250], [150, 236], [200, 250], [210, 300]]), '#e2d8a0', { fibre: false }),
    wart(90, 220, 7), wart(210, 214, 8), wart(70, 260, 6), wart(232, 258, 6), wart(120, 196, 5), wart(184, 192, 5),
    // eyes on top
    piece(circle(104, 168, 34), '#9aa65e'),
    piece(circle(196, 168, 34), '#9aa65e'),
    piece(circle(104, 166, 22), C.yellow, { edge: 'cut' }),
    piece(circle(196, 166, 22), C.yellow, { edge: 'cut' }),
    piece(ellipse(104, 168, 14, 8), C.ink, { edge: 'clean', shadow: false }),
    piece(ellipse(196, 168, 14, 8), C.ink, { edge: 'clean', shadow: false }),
    dot(98, 160, 4, C.white),
    dot(190, 160, 4, C.white),
    ink([[90, 232], [150, 252], [210, 232]], { width: 4, color: '#4d5a2a' }),
    // front feet
    piece(ellipse(110, 316, 26, 12), '#8f9a58'),
    piece(ellipse(190, 316, 26, 12), '#8f9a58'),
  ]);
}

export function nick(): string {
  const ghostSkin = '#dbe3ec';
  return person({
    name: 'nick',
    label: 'Nearly Headless Nick',
    skin: ghostSkin,
    ghost: true,
    eyes: '#7a8aa6',
    tilt: -14,
    back: [fluff([[cx - 70, cy - 40], [cx - 40, cy - 80], [cx + 40, cy - 80], [cx + 70, cy - 40], [cx + 78, cy + 20], [cx + 50, cy - 20], [cx - 50, cy - 20], [cx - 78, cy + 20]], '#b9c3d2', 10)],
    body: [
      piece(curve([[40, 345], [52, 262], [104, 236], [150, 232], [196, 236], [248, 262], [260, 345]], 2), '#9aa7bd'),
      fluff([[86, 236], [150, 212], [214, 236], [210, 262], [150, 246], [90, 262]], '#eef2f7', 9),
      ink([[120, 214], [180, 210]], { width: 2.5, color: '#7a8aa6' }),
    ],
    front: [
      ink([[cx - 26, cy + 38], [cx - 8, cy + 34], [cx, cy + 38], [cx + 8, cy + 34], [cx + 26, cy + 38]], { width: 5, color: '#9aa7bd' }),
      piece(poly([[cx - 8, cy + 60], [cx + 8, cy + 60], [cx, cy + 84]]), '#9aa7bd', { edge: 'cut', fibre: false }),
    ],
    brows: 'raised',
    browColor: '#7a8aa6',
    mouth: 'smile',
  });
}

export function voldemort(): string {
  return person({
    name: 'voldemort',
    label: 'Lord Voldemort',
    skin: '#e6e4dc',
    eyes: C.red,
    eyeStyle: 'narrow',
    face: [56, 74],
    ears: false,
    body: [
      piece(curve([[30, 345], [46, 256], [104, 222], [150, 218], [196, 222], [254, 256], [270, 345]], 2), C.ink),
      piece(curve([[96, 236], [150, 210], [204, 236], [190, 300], [150, 345], [110, 300]], 2), '#1a1a20', { fibre: false }),
    ],
    nose: 'slits',
    mouth: 'smirk',
    brows: 'none',
    blush: false,
    front: [ink([[cx - 40, cy - 14], [cx - 14, cy - 8]], { width: 3, color: '#b9b6ac' }), ink([[cx + 40, cy - 14], [cx + 14, cy - 8]], { width: 3, color: '#b9b6ac' })],
    extra: [wand(234, 318, '#e9e1c9')],
  });
}

export function dobby(): string {
  const skin = '#cdbda4';
  return person({
    name: 'dobby',
    label: 'Dobby the house-elf',
    skin,
    eyes: C.green,
    eyeStyle: 'big',
    face: [56, 60],
    ears: false,
    back: [
      piece(poly([[cx - 40, cy - 10], [cx - 150, cy - 70], [cx - 128, cy - 26], [cx - 140, cy + 14], [cx - 44, cy + 30]]), skin),
      piece(poly([[cx + 40, cy - 10], [cx + 150, cy - 70], [cx + 128, cy - 26], [cx + 140, cy + 14], [cx + 44, cy + 30]]), skin),
      piece(poly([[cx - 52, cy], [cx - 124, cy - 40], [cx - 112, cy + 6], [cx - 50, cy + 20]]), C.pink, { fibre: false, shadow: false }),
      piece(poly([[cx + 52, cy], [cx + 124, cy - 40], [cx + 112, cy + 6], [cx + 50, cy + 20]]), C.pink, { fibre: false, shadow: false }),
    ],
    body: [
      piece(curve([[60, 345], [70, 262], [110, 222], [150, 216], [190, 222], [230, 262], [240, 345]], 2), C.cream, { rough: 1.6 }),
      ink([[100, 260], [130, 300]], { width: 2.5, color: C.tan }),
      ink([[200, 250], [180, 310]], { width: 2.5, color: C.tan }),
    ],
    nose: 'pointy',
    mouth: 'grin',
    brows: 'raised',
    browColor: '#9a8a70',
    extra: [
      // the sock
      group({ part: 'sock', origin: [240, 290] }, [
        piece(curve([[214, 250], [244, 244], [250, 300], [270, 318], [254, 336], [222, 316], [216, 286]], 2), C.white),
        ...[262, 282, 302].map((y) => piece(rect(214, y, 36, 8, 2), C.red, { edge: 'clean', shadow: false })),
      ]),
    ],
  });
}

export function gnome(): string {
  const skin = '#b5926a';
  return creature('gnome', 'a garden gnome', [
    piece(ellipse(150, 330, 110, 14), 'rgba(40,25,10,0.16)', { edge: 'cut', fibre: false, shadow: false }),
    piece(curve([[80, 330], [86, 240], [150, 216], [214, 240], [220, 330]]), '#9a7650'),
    piece(ellipse(110, 280, 18, 34, 20), skin),
    piece(ellipse(190, 280, 18, 34, -20), skin),
    group({ part: 'head', origin: [150, 230] }, [
      piece(poly([[60, 150], [10, 110], [70, 120]]), skin),
      piece(poly([[240, 150], [290, 110], [230, 120]]), skin),
      piece(curve([[70, 140], [90, 70], [150, 50], [210, 70], [230, 140], [200, 210], [100, 210]]), skin),
      piece(circle(118, 82, 9), '#a07d58', { edge: 'cut', fibre: false, shadow: false }),
      piece(circle(186, 96, 7), '#a07d58', { edge: 'cut', fibre: false, shadow: false }),
      piece(circle(122, 132, 12), C.white, { edge: 'cut', fibre: false }),
      piece(circle(178, 132, 12), C.white, { edge: 'cut', fibre: false }),
      piece(circle(124, 134, 6), C.ink, { edge: 'clean', shadow: false }),
      piece(circle(176, 134, 6), C.ink, { edge: 'clean', shadow: false }),
      ink([[106, 112], [136, 118]], { width: 5, color: C.brownDark }),
      ink([[194, 112], [164, 118]], { width: 5, color: C.brownDark }),
      piece(ellipse(150, 160, 22, 18), '#a07d58'),
      ink([[120, 188], [150, 196], [180, 186]], { width: 4, color: C.brownDark }),
      piece(poly([[136, 190], [144, 190], [140, 200]]), C.white, { edge: 'clean', shadow: false }),
    ]),
  ]);
}

export function willow(): string {
  const bark = '#6b4a32';
  const branch = (pts: Pt[], w: number) => piece(band(pts, w), bark);
  return creature('willow', 'the Whomping Willow', [
    piece(ellipse(150, 330, 130, 16), 'rgba(40,25,10,0.16)', { edge: 'cut', fibre: false, shadow: false }),
    group({ part: 'branchL', origin: [110, 120] }, [branch([[110, 130], [60, 90], [20, 100]], 18), branch([[70, 96], [50, 50]], 10)]),
    group({ part: 'branchR', origin: [190, 120] }, [branch([[190, 130], [244, 80], [286, 96]], 18), branch([[236, 86], [256, 40]], 10)]),
    ...[[40, 60], [26, 96], [60, 40], [256, 30], [284, 90], [270, 56]].map(([x, y]) => piece(ellipse(x, y, 14, 9, 30), C.greenDark, { edge: 'cut' })),
    piece(curve([[80, 340], [100, 250], [96, 150], [120, 90], [180, 90], [204, 150], [200, 250], [220, 340]], 2), bark),
    ink([[120, 120], [116, 200]], { width: 3, color: '#4f3422' }),
    ink([[186, 130], [190, 220]], { width: 3, color: '#4f3422' }),
    // face
    piece(ellipse(130, 170, 14, 12), '#2b1d14', { edge: 'cut', fibre: false }),
    piece(ellipse(172, 170, 14, 12), '#2b1d14', { edge: 'cut', fibre: false }),
    piece(circle(132, 172, 5), C.yellow, { edge: 'clean', shadow: false }),
    piece(circle(170, 172, 5), C.yellow, { edge: 'clean', shadow: false }),
    ink([[110, 148], [144, 160]], { width: 7, color: '#4f3422' }),
    ink([[192, 148], [158, 160]], { width: 7, color: '#4f3422' }),
    piece(curve([[124, 220], [150, 206], [178, 220], [166, 236], [134, 236]], 2), '#2b1d14', { edge: 'cut', fibre: false }),
    ...[60, 240].map((x) => piece(curve([[x - 30, 340], [x, 300], [x + 30, 340]], 2), bark)),
  ]);
}

export function fawkes(): string {
  return creature('fawkes', 'Fawkes the phoenix', [
    // tail
    ...[[-30, C.gold], [0, C.orange], [30, C.gold]].map(([dx, col]) =>
      piece(curve([[150, 230], [150 + (dx as number) * 0.6, 290], [150 + (dx as number), 340], [160 + (dx as number), 344], [160, 236]], 2), col as string),
    ),
    // wings
    group({ part: 'wingL', origin: [120, 160] }, [piece(curve([[120, 140], [40, 150], [20, 230], [70, 220], [60, 260], [120, 230]], 2), C.redDark)]),
    group({ part: 'wingR', origin: [180, 160] }, [piece(curve([[180, 140], [260, 150], [280, 230], [230, 220], [240, 260], [180, 230]], 2), C.redDark)]),
    piece(curve([[150, 110], [200, 140], [200, 220], [150, 250], [100, 220], [100, 140]]), C.red),
    piece(curve([[150, 160], [180, 180], [176, 230], [150, 240], [124, 230], [120, 180]]), C.orange, { fibre: false }),
    group({ part: 'head', origin: [150, 120] }, [
      ...[[-24, -70], [0, -84], [24, -70]].map(([dx, dy]) => piece(poly([[150 + dx * 0.4, 90], [150 + dx, 90 + dy * 0.6], [158 + dx * 0.4, 92]]), C.gold, { edge: 'cut' })),
      piece(circle(150, 104, 40), C.red),
      piece(circle(134, 98, 9), C.gold, { edge: 'cut', fibre: false }),
      piece(circle(166, 98, 9), C.gold, { edge: 'cut', fibre: false }),
      piece(circle(134, 99, 5), C.ink, { edge: 'clean', shadow: false }),
      piece(circle(166, 99, 5), C.ink, { edge: 'clean', shadow: false }),
      piece(curve([[140, 112], [160, 112], [150, 140]], 1), C.gold, { edge: 'cut' }),
    ]),
    piece(rect(40, 262, 220, 14, 6), C.wood),
    ...[130, 170].map((x) => piece(ellipse(x, 258, 12, 8), C.gold, { edge: 'cut' })),
  ]);
}

export function basilisk(): string {
  const scale = '#3f6b4c';
  return creature('basilisk', 'the Basilisk', [
    // coils
    piece(ellipse(150, 300, 140, 46), '#355c41'),
    piece(ellipse(150, 290, 110, 30), scale, { fibre: false }),
    piece(band([[150, 300], [130, 240], [150, 190]], 70), scale),
    group({ part: 'head', origin: [150, 150] }, [
      piece(curve([[60, 150], [80, 80], [150, 60], [220, 80], [240, 150], [200, 200], [100, 200]]), scale),
      piece(curve([[90, 170], [150, 150], [210, 170], [190, 196], [110, 196]], 2), '#a8b87a', { fibre: false }),
      ...[[110, 90], [150, 80], [190, 90], [130, 110], [170, 110]].map(([x, y]) => piece(ellipse(x, y, 10, 6), '#2f5238', { edge: 'cut', fibre: false, shadow: false })),
      piece(ellipse(104, 128, 22, 16, -10), C.yellow, { edge: 'cut' }),
      piece(ellipse(196, 128, 22, 16, 10), C.yellow, { edge: 'cut' }),
      piece(ellipse(104, 128, 4, 13), C.ink, { edge: 'clean', shadow: false }),
      piece(ellipse(196, 128, 4, 13), C.ink, { edge: 'clean', shadow: false }),
      ink([[78, 108], [124, 116]], { width: 6, color: '#2f5238' }),
      ink([[222, 108], [176, 116]], { width: 6, color: '#2f5238' }),
      piece(poly([[124, 192], [134, 192], [129, 216]]), C.white, { edge: 'cut', fibre: false }),
      piece(poly([[166, 192], [176, 192], [171, 216]]), C.white, { edge: 'cut', fibre: false }),
      ink([[150, 196], [150, 228], [140, 240]], { width: 3.5, color: C.red }),
      ink([[150, 228], [160, 240]], { width: 3.5, color: C.red }),
    ]),
  ]);
}

export const hosts1: Record<string, () => string> = { ollivander, trevor, nick, voldemort, dobby, gnome, willow, fawkes, basilisk };
