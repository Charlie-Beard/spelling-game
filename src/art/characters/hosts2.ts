/** Hosts from books 3–7. */
import { C } from '../palette';
import { band, circle, curve, dot, ellipse, group, ink, piece, poly, rect, svg, type Node, type Pt } from '../paper';
import { fluff } from './heroes';
import { H, HEAD, halfMoonGlasses, person, robe, squareGlasses, W, wand } from './people';

const [cx, cy] = HEAD;
const creature = (name: string, label: string, nodes: Node[]) => svg({ w: W, h: H, name, label, className: 'portrait' }, nodes);
const floor = (rx = 120) => piece(ellipse(150, 330, rx, 14), 'rgba(40,25,10,0.16)', { edge: 'cut', fibre: false, shadow: false });

const plainRobe = (color: string, collar?: string): Node[] => [
  piece(curve([[40, 345], [52, 262], [104, 230], [150, 226], [196, 230], [248, 262], [260, 345]], 2), color),
  ...(collar ? [piece(poly([[122, 228], [150, 270], [178, 228], [168, 222], [150, 248], [132, 222]]), collar, { fibre: false })] : []),
];

// ---------------------------------------------------------------------------
// Book 3
// ---------------------------------------------------------------------------

export function crookshanks(): string {
  const fur = C.ginger;
  const tuft = (pts: Pt[]) => fluff(pts, fur, 10);
  return creature('crookshanks', 'Crookshanks the cat', [
    floor(),
    tuft([[60, 330], [70, 240], [150, 210], [230, 240], [240, 330]]),
    piece(curve([[110, 330], [120, 270], [150, 256], [180, 270], [190, 330]]), C.orange, { fibre: false }),
    group({ part: 'head', origin: [150, 220] }, [
      piece(poly([[64, 120], [70, 50], [120, 92]]), fur),
      piece(poly([[236, 120], [230, 50], [180, 92]]), fur),
      tuft([[150, 64], [210, 80], [244, 130], [240, 190], [200, 226], [100, 226], [60, 190], [56, 130], [90, 80]]),
      // squashed face
      piece(ellipse(150, 168, 50, 34), C.orange, { fibre: false }),
      piece(ellipse(110, 140, 17, 13), C.yellow, { edge: 'cut' }),
      piece(ellipse(190, 140, 17, 13), C.yellow, { edge: 'cut' }),
      piece(ellipse(110, 141, 5, 11), C.ink, { edge: 'clean', shadow: false }),
      piece(ellipse(190, 141, 5, 11), C.ink, { edge: 'clean', shadow: false }),
      ink([[92, 124], [128, 132]], { width: 5, color: '#9a4520' }),
      ink([[208, 124], [172, 132]], { width: 5, color: '#9a4520' }),
      piece(poly([[140, 160], [160, 160], [150, 170]]), C.rose, { edge: 'cut', fibre: false }),
      ink([[132, 186], [150, 180], [168, 186]], { width: 3.5 }),
      ink([[106, 170], [56, 162]], { width: 2, color: C.white }),
      ink([[194, 170], [244, 162]], { width: 2, color: C.white }),
    ]),
  ]);
}

export function lupin(): string {
  const hair = '#9a7a58';
  return person({
    name: 'lupin',
    label: 'Professor Lupin',
    skin: C.skin,
    eyes: '#8a6a3a',
    eyeStyle: 'sleepy',
    back: [piece(ellipse(cx, cy - 24, 72, 62), hair)],
    front: [
      piece(curve([[cx - 68, cy - 8], [cx - 60, cy - 66], [cx, cy - 86], [cx + 60, cy - 66], [cx + 68, cy - 8], [cx + 40, cy - 52], [cx - 10, cy - 60], [cx - 46, cy - 44]], 2), hair),
      ink([[cx - 30, cy - 70], [cx - 20, cy - 60]], { width: 3, color: C.stoneLight }),
      ink([[cx - 26, cy + 38], [cx, cy + 34], [cx + 26, cy + 38]], { width: 5, color: hair }),
      ink([[cx + 30, cy - 4], [cx + 44, cy + 16]], { width: 2.5, color: C.rose, opacity: 0.7 }),
    ],
    body: [
      ...plainRobe('#7a6a58', C.cream),
      piece(rect(70, 290, 30, 26, 4), '#6a5a48', { fibre: false }),
      piece(rect(200, 300, 26, 22, 4), '#8a7a66', { fibre: false }),
      // a bar of chocolate
      piece(rect(208, 252, 44, 60, 4), C.brownDark),
      piece(rect(208, 252, 44, 22, 3), C.purple, { fibre: false }),
    ],
    browColor: '#7a5a38',
    mouth: 'smile',
  });
}

export function buckbeak(): string {
  const feather = '#c9c4b8';
  return creature('buckbeak', 'Buckbeak the hippogriff', [
    group({ part: 'wingL', origin: [100, 220] }, [piece(curve([[110, 210], [30, 160], [10, 240], [40, 300], [100, 280]], 2), '#a9a296')]),
    group({ part: 'wingR', origin: [200, 220] }, [piece(curve([[190, 210], [270, 160], [290, 240], [260, 300], [200, 280]], 2), '#a9a296')]),
    piece(curve([[70, 345], [80, 250], [150, 210], [220, 250], [230, 345]], 2), '#8a7a6a'),
    group({ part: 'head', origin: [150, 210] }, [
      ...[-1, 1].map((s) => piece(poly([[150 + s * 40, 90], [150 + s * 76, 40], [150 + s * 60, 100]]), feather)),
      piece(curve([[90, 130], [110, 70], [150, 56], [190, 70], [210, 130], [190, 210], [110, 210]]), feather),
      piece(curve([[120, 150], [180, 150], [176, 200], [150, 250], [140, 200]], 2), C.goldLight, { edge: 'cut' }),
      ink([[124, 176], [176, 176]], { width: 3, color: '#b8862f' }),
      piece(circle(118, 124, 14), C.orange, { edge: 'cut' }),
      piece(circle(182, 124, 14), C.orange, { edge: 'cut' }),
      piece(circle(118, 125, 7), C.ink, { edge: 'clean', shadow: false }),
      piece(circle(182, 125, 7), C.ink, { edge: 'clean', shadow: false }),
      dot(114, 120, 3, C.white),
      dot(178, 120, 3, C.white),
      ink([[96, 104], [134, 112]], { width: 5, color: '#8a8478' }),
      ink([[204, 104], [166, 112]], { width: 5, color: '#8a8478' }),
    ]),
  ]);
}

export function wormtail(): string {
  return person({
    name: 'wormtail',
    label: 'Wormtail',
    skin: '#e8cfae',
    eyes: '#7a8a96',
    eyeStyle: 'narrow',
    face: [52, 62],
    back: [piece(ellipse(cx - 60, cy - 10, 18, 30), '#a99a7a'), piece(ellipse(cx + 60, cy - 10, 18, 30), '#a99a7a')],
    front: [
      piece(rect(cx - 12, cy + 38, 10, 14, 2), C.white, { edge: 'cut', fibre: false }),
      piece(rect(cx + 2, cy + 38, 10, 14, 2), C.white, { edge: 'cut', fibre: false }),
      ink([[cx - 40, cy + 30], [cx - 70, cy + 24]], { width: 2, color: '#a99a7a' }),
      ink([[cx + 40, cy + 30], [cx + 70, cy + 24]], { width: 2, color: '#a99a7a' }),
    ],
    body: plainRobe('#5a5248', '#8a8070'),
    nose: 'pointy',
    mouth: 'none',
    brows: 'raised',
    browColor: '#a99a7a',
    extra: [
      // silver hand
      piece(ellipse(236, 300, 18, 22), C.stoneLight),
      piece(band([[236, 280], [244, 252]], 7), C.stoneLight),
    ],
  });
}

// ---------------------------------------------------------------------------
// Book 4
// ---------------------------------------------------------------------------

export function moody(): string {
  const hair = '#8c8678';
  return person({
    name: 'moody',
    label: 'Mad-Eye Moody',
    skin: '#d8b08a',
    eyes: C.brownDark,
    eyeStyle: 'narrow',
    face: [62, 72],
    back: [fluff([[cx - 70, cy - 50], [cx - 92, cy + 10], [cx - 84, cy + 70], [cx - 60, cy + 10], [cx + 60, cy + 10], [cx + 84, cy + 70], [cx + 92, cy + 10], [cx + 70, cy - 50], [cx, cy - 76]], hair, 12)],
    front: [
      // magical eye with strap
      ink([[cx - 62, cy - 30], [cx + 62, cy - 30]], { width: 5, color: C.brownDark }),
      piece(circle(cx + 26, cy + 2, 22), C.white, { edge: 'cut' }),
      piece(circle(cx + 26, cy + 2, 13), C.blue, { edge: 'clean', shadow: false }),
      piece(circle(cx + 26, cy + 2, 6), C.ink, { edge: 'clean', shadow: false }),
      dot(cx + 22, cy - 3, 3, C.white),
      ink([[cx - 38, cy - 34], [cx - 30, cy - 10], [cx - 40, cy + 8]], { width: 2.5, color: C.rose, opacity: 0.8 }),
    ],
    body: [
      ...plainRobe('#4a443c', C.greyDark),
      ink([[60, 300], [240, 300]], { width: 3, color: '#3a3430', opacity: 0.6 }),
    ],
    brows: 'cross',
    browColor: '#5a5448',
    nose: 'big',
    mouth: 'flat',
  });
}

export function horntail(): string {
  const hide = '#2f3238';
  const spike = (x: number, y: number, s = 1) => piece(poly([[x - 10 * s, y], [x, y - 26 * s], [x + 10 * s, y]]), C.stone, { edge: 'cut' });
  return creature('horntail', 'the Hungarian Horntail', [
    group({ part: 'wingL', origin: [90, 220] }, [piece(poly([[100, 220], [20, 120], [30, 200], [6, 230], [40, 250], [30, 290], [100, 270]]), '#3c4048')]),
    group({ part: 'wingR', origin: [210, 220] }, [piece(poly([[200, 220], [280, 120], [270, 200], [294, 230], [260, 250], [270, 290], [200, 270]]), '#3c4048')]),
    piece(curve([[80, 345], [90, 250], [150, 220], [210, 250], [220, 345]], 2), hide),
    piece(curve([[120, 345], [126, 270], [150, 256], [174, 270], [180, 345]], 2), '#8a6a3a', { fibre: false }),
    group({ part: 'head', origin: [150, 200] }, [
      spike(110, 76), spike(150, 62, 1.2), spike(190, 76),
      piece(poly([[96, 90], [70, 30], [118, 80]]), C.stone, { edge: 'cut' }),
      piece(poly([[204, 90], [230, 30], [182, 80]]), C.stone, { edge: 'cut' }),
      piece(curve([[80, 140], [100, 76], [150, 64], [200, 76], [220, 140], [210, 200], [150, 226], [90, 200]]), hide),
      piece(curve([[110, 180], [150, 170], [190, 180], [184, 212], [150, 224], [116, 212]], 2), '#454a52', { fibre: false }),
      piece(ellipse(112, 130, 18, 12, -12), C.yellow, { edge: 'cut' }),
      piece(ellipse(188, 130, 18, 12, 12), C.yellow, { edge: 'cut' }),
      piece(ellipse(112, 131, 4, 10), C.ink, { edge: 'clean', shadow: false }),
      piece(ellipse(188, 131, 4, 10), C.ink, { edge: 'clean', shadow: false }),
      ink([[92, 110], [132, 120]], { width: 6, color: '#1e2024' }),
      ink([[208, 110], [168, 120]], { width: 6, color: '#1e2024' }),
      dot(138, 190, 5, '#1e2024'),
      dot(162, 190, 5, '#1e2024'),
      piece(poly([[124, 208], [132, 208], [128, 222]]), C.white, { edge: 'cut', fibre: false }),
      piece(poly([[168, 208], [176, 208], [172, 222]]), C.white, { edge: 'cut', fibre: false }),
    ]),
    // a puff of smoke
    fluff([[230, 200], [256, 180], [282, 196], [276, 220], [244, 222]], C.stoneLight, 6),
  ]);
}

export function myrtle(): string {
  return person({
    name: 'myrtle',
    label: 'Moaning Myrtle',
    skin: '#dfe8e8',
    ghost: true,
    eyes: '#6a8a8a',
    eyeStyle: 'wide',
    face: [56, 66],
    back: [
      piece(ellipse(cx, cy - 24, 70, 56), '#a9bcbc'),
      piece(band([[cx - 64, cy - 10], [cx - 84, cy + 50], [cx - 74, cy + 90]], 24), '#a9bcbc'),
      piece(band([[cx + 64, cy - 10], [cx + 84, cy + 50], [cx + 74, cy + 90]], 24), '#a9bcbc'),
    ],
    front: [
      piece(curve([[cx - 64, cy - 14], [cx - 50, cy - 60], [cx, cy - 74], [cx + 50, cy - 60], [cx + 64, cy - 14], [cx, cy - 46]], 2), '#a9bcbc'),
      ink(Array.from({ length: 21 }, (_, i) => [cx - 26 + Math.cos((i / 20) * Math.PI * 2) * 20, cy + 2 + Math.sin((i / 20) * Math.PI * 2) * 20] as Pt), { width: 4, color: '#6a7a8a' }),
      ink(Array.from({ length: 21 }, (_, i) => [cx + 26 + Math.cos((i / 20) * Math.PI * 2) * 20, cy + 2 + Math.sin((i / 20) * Math.PI * 2) * 20] as Pt), { width: 4, color: '#6a7a8a' }),
      ink([[cx - 6, cy], [cx + 6, cy]], { width: 4, color: '#6a7a8a' }),
      piece(ellipse(cx - 30, cy + 30, 4, 7), C.sky, { edge: 'clean', shadow: false }),
    ],
    body: robe('#9aaab0', ['#7a9a9a', '#c4d4d4']),
    brows: 'raised',
    browColor: '#7a8a96',
    mouth: 'frown',
  });
}

export function bellatrix(): string {
  const hair = '#1e1b22';
  return person({
    name: 'bellatrix',
    label: 'Bellatrix Lestrange',
    skin: '#ece2d8',
    eyes: '#3a3040',
    eyeStyle: 'sleepy',
    face: [54, 68],
    back: [
      fluff(
        [[cx, cy - 116], [cx + 70, cy - 104], [cx + 116, cy - 50], [cx + 130, cy + 20], [cx + 124, cy + 100], [cx + 96, cy + 150],
          [cx + 50, cy + 110], [cx - 50, cy + 110], [cx - 96, cy + 150], [cx - 124, cy + 100], [cx - 130, cy + 20], [cx - 116, cy - 50], [cx - 70, cy - 104]],
        hair,
        20,
      ),
    ],
    front: [
      fluff([[cx - 62, cy - 4], [cx - 56, cy - 62], [cx, cy - 80], [cx + 56, cy - 62], [cx + 62, cy - 4], [cx + 30, cy - 48], [cx - 30, cy - 48]], hair, 9),
    ],
    body: [
      piece(curve([[40, 345], [52, 262], [104, 228], [150, 224], [196, 228], [248, 262], [260, 345]], 2), '#2a2530'),
      piece(poly([[110, 240], [150, 300], [190, 240], [180, 236], [150, 280], [120, 236]]), '#4a3a50', { fibre: false }),
    ],
    brows: 'raised',
    browColor: hair,
    mouth: 'grin',
    blush: false,
    nose: 'long',
    extra: [wand(236, 318, '#3a3030')],
  });
}

// ---------------------------------------------------------------------------
// Book 5
// ---------------------------------------------------------------------------

export function sirius(): string {
  const hair = '#2a2428';
  return person({
    name: 'sirius',
    label: 'Sirius Black',
    skin: '#e6c4a0',
    eyes: '#6a7480',
    back: [
      piece(ellipse(cx, cy - 26, 74, 62), hair),
      piece(band([[cx - 66, cy - 20], [cx - 76, cy + 60], [cx - 64, cy + 110]], 30), hair),
      piece(band([[cx + 66, cy - 20], [cx + 76, cy + 60], [cx + 64, cy + 110]], 30), hair),
    ],
    front: [
      piece(curve([[cx - 66, cy - 6], [cx - 58, cy - 66], [cx, cy - 84], [cx + 58, cy - 66], [cx + 66, cy - 6], [cx + 20, cy - 56], [cx - 20, cy - 56]], 2), hair),
      ink([[cx - 22, cy + 38], [cx, cy + 34], [cx + 22, cy + 38]], { width: 5, color: hair }),
      piece(curve([[cx - 14, cy + 56], [cx + 14, cy + 56], [cx, cy + 74]], 2), hair, { fibre: false }),
    ],
    body: [
      ...plainRobe('#3a3438'),
      piece(poly([[112, 232], [150, 300], [188, 232], [176, 228], [150, 280], [124, 228]]), '#6a3a3a', { fibre: false }),
    ],
    browColor: hair,
    mouth: 'smirk',
  });
}

export function luna(): string {
  const hair = '#e8d6a0';
  return person({
    name: 'luna',
    label: 'Luna Lovegood',
    skin: C.skinPale,
    eyes: C.sky,
    eyeStyle: 'big',
    back: [
      piece(ellipse(cx, cy - 24, 72, 62), hair),
      piece(curve([[cx - 72, cy - 20], [cx - 96, cy + 100], [cx - 80, cy + 180], [cx - 50, cy + 100], [cx - 54, cy]], 2), hair),
      piece(curve([[cx + 72, cy - 20], [cx + 96, cy + 100], [cx + 80, cy + 180], [cx + 50, cy + 100], [cx + 54, cy]], 2), hair),
    ],
    front: [
      piece(curve([[cx - 64, cy - 6], [cx - 56, cy - 64], [cx, cy - 80], [cx + 56, cy - 64], [cx + 64, cy - 6], [cx + 10, cy - 60], [cx - 30, cy - 50]], 2), hair),
      // radish earrings
      piece(circle(cx - 66, cy + 40, 9), C.orange, { edge: 'cut' }),
      piece(poly([[cx - 72, cy + 30], [cx - 66, cy + 18], [cx - 60, cy + 30]]), C.green, { edge: 'cut', fibre: false }),
      piece(circle(cx + 66, cy + 40, 9), C.orange, { edge: 'cut' }),
      piece(poly([[cx + 60, cy + 30], [cx + 66, cy + 18], [cx + 72, cy + 30]]), C.green, { edge: 'cut', fibre: false }),
    ],
    body: [
      ...robe(C.charcoal, [C.blueDark, '#b8a36a']),
      // cork necklace
      ink([[112, 236], [150, 262], [188, 236]], { width: 2, color: C.tan }),
      piece(rect(144, 258, 12, 16, 3), C.tan, { edge: 'cut', fibre: false }),
    ],
    brows: 'raised',
    browColor: '#c8b480',
    mouth: 'smile',
  });
}

export function neville(): string {
  const hair = '#5a4030';
  return person({
    name: 'neville',
    label: 'Neville Longbottom',
    skin: C.skin,
    eyes: C.brown,
    face: [64, 70],
    back: [piece(ellipse(cx, cy - 28, 72, 58), hair)],
    front: [piece(curve([[cx - 68, cy - 10], [cx - 60, cy - 66], [cx, cy - 82], [cx + 60, cy - 66], [cx + 68, cy - 10], [cx + 30, cy - 50], [cx - 30, cy - 52]], 2), hair)],
    browColor: '#4a3020',
    mouth: 'smile',
    extra: [
      // a plant in a pot (Herbology!)
      piece(poly([[206, 300], [262, 300], [254, 340], [214, 340]]), C.rust),
      piece(band([[234, 300], [232, 252]], 6), C.greenDark),
      piece(ellipse(218, 262, 16, 8, -30), C.green, { edge: 'cut' }),
      piece(ellipse(248, 250, 16, 8, 30), C.green, { edge: 'cut' }),
      piece(circle(232, 240, 10), C.pink, { edge: 'cut' }),
    ],
  });
}

export function deatheater(): string {
  return creature('deatheater', 'a Death Eater', [
    piece(curve([[30, 345], [46, 250], [100, 200], [150, 190], [200, 200], [254, 250], [270, 345]], 2), C.ink),
    // hood
    piece(curve([[60, 250], [62, 120], [100, 50], [150, 34], [200, 50], [238, 120], [240, 250], [150, 230]]), '#1c1c22'),
    piece(curve([[86, 230], [92, 120], [150, 76], [208, 120], [214, 230]]), '#0e0e12', { fibre: false }),
    // silver mask
    group({ part: 'mask', origin: [150, 160] }, [
      piece(curve([[100, 120], [150, 92], [200, 120], [204, 180], [176, 222], [124, 222], [96, 180]]), '#c9ccd2'),
      ink([[110, 120], [130, 150], [116, 180]], { width: 2.5, color: '#8a8e96' }),
      ink([[190, 120], [170, 150], [184, 180]], { width: 2.5, color: '#8a8e96' }),
      ink([[150, 96], [150, 132]], { width: 2.5, color: '#8a8e96' }),
      piece(ellipse(126, 150, 14, 9, 10), C.ink, { edge: 'cut', fibre: false, shadow: false }),
      piece(ellipse(174, 150, 14, 9, -10), C.ink, { edge: 'cut', fibre: false, shadow: false }),
      ink([[132, 200], [150, 196], [168, 200]], { width: 3, color: '#5a5e66' }),
    ]),
    piece(band([[236, 330], [256, 214]], 8), '#3a3030'),
  ]);
}

// ---------------------------------------------------------------------------
// Book 6
// ---------------------------------------------------------------------------

export function slughorn(): string {
  const tache = '#c9b894';
  return person({
    name: 'slughorn',
    label: 'Professor Slughorn',
    skin: '#eccaa6',
    eyes: '#6a8a6a',
    face: [72, 74],
    ears: true,
    back: [piece(ellipse(cx - 70, cy - 4, 14, 22), tache), piece(ellipse(cx + 70, cy - 4, 14, 22), tache)],
    front: [
      piece(curve([[cx - 70, cy + 36], [cx - 30, cy + 22], [cx, cy + 32], [cx + 30, cy + 22], [cx + 70, cy + 36], [cx + 40, cy + 50], [cx, cy + 42], [cx - 40, cy + 50]], 2), tache),
    ],
    body: [
      piece(curve([[20, 345], [34, 250], [100, 214], [150, 210], [200, 214], [266, 250], [280, 345]], 2), C.greenDark),
      piece(curve([[96, 226], [150, 216], [204, 226], [214, 345], [86, 345]], 2), C.green, { fibre: false }),
      ...[260, 290, 320].map((y) => piece(circle(150, y, 7), C.gold, { edge: 'cut' })),
    ],
    nose: 'big',
    mouth: 'none',
    brows: 'raised',
    browColor: tache,
  });
}

export function dumbledore(): string {
  const white = '#ece8e0';
  const beard: Pt[] = [
    [cx - 60, cy + 14], [cx - 30, cy + 40], [cx, cy + 34], [cx + 30, cy + 40], [cx + 60, cy + 14], [cx + 66, cy + 90],
    [cx + 40, cy + 170], [cx, cy + 200], [cx - 40, cy + 170], [cx - 66, cy + 90],
  ];
  return person({
    name: 'dumbledore',
    label: 'Professor Dumbledore',
    skin: '#ecd0b0',
    eyes: C.blue,
    face: [58, 72],
    back: [fluff([[cx - 64, cy - 30], [cx - 84, cy + 40], [cx - 70, cy + 120], [cx + 70, cy + 120], [cx + 84, cy + 40], [cx + 64, cy - 30]], white, 12)],
    body: [
      piece(curve([[30, 345], [46, 256], [104, 222], [150, 218], [196, 222], [254, 256], [270, 345]], 2), C.purple),
      ...[[70, 290], [230, 310], [90, 330], [210, 270]].map(([x, y]) => piece(poly([[x, y - 9], [x + 3, y - 3], [x + 9, y], [x + 3, y + 3], [x, y + 9], [x - 3, y + 3], [x - 9, y], [x - 3, y - 3]]), C.goldLight, { edge: 'cut', fibre: false })),
    ],
    front: [
      fluff(beard, white, 8),
      ink([[cx - 24, cy + 40], [cx - 10, cy + 34], [cx, cy + 40], [cx + 10, cy + 34], [cx + 24, cy + 40]], { width: 6, color: '#d8d2c6' }),
      ...halfMoonGlasses(),
      // pointed hat
      piece(curve([[cx - 80, cy - 40], [cx - 30, cy - 96], [cx + 14, cy - 138], [cx + 40, cy - 110], [cx + 80, cy - 40]], 1), C.purple),
      piece(curve([[cx - 92, cy - 40], [cx, cy - 58], [cx + 92, cy - 40], [cx + 88, cy - 26], [cx, cy - 40], [cx - 88, cy - 26]], 2), C.plum),
      ...[[cx - 22, cy - 74], [cx + 24, cy - 88], [cx + 6, cy - 110]].map(([x, y]) => piece(poly([[x, y - 8], [x + 3, y - 3], [x + 8, y], [x + 3, y + 3], [x, y + 8], [x - 3, y + 3], [x - 8, y], [x - 3, y - 3]]), C.goldLight, { edge: 'cut', fibre: false })),
    ],
    nose: 'long',
    mouth: 'none',
    brows: 'kind',
    browColor: '#c8c2b6',
  });
}

export function ginny(): string {
  const hair = '#c24a22';
  return person({
    name: 'ginny',
    label: 'Ginny Weasley',
    skin: C.skin,
    eyes: C.brown,
    freckles: true,
    back: [
      piece(ellipse(cx, cy - 24, 72, 62), hair),
      piece(curve([[cx - 72, cy - 20], [cx - 92, cy + 90], [cx - 70, cy + 150], [cx - 46, cy + 80], [cx - 54, cy]], 2), hair),
      piece(curve([[cx + 72, cy - 20], [cx + 92, cy + 90], [cx + 70, cy + 150], [cx + 46, cy + 80], [cx + 54, cy]], 2), hair),
    ],
    front: [piece(curve([[cx - 64, cy - 6], [cx - 56, cy - 64], [cx, cy - 80], [cx + 56, cy - 64], [cx + 64, cy - 6], [cx + 30, cy - 50], [cx - 40, cy - 44]], 2), hair)],
    body: [
      piece(curve([[40, 345], [52, 262], [104, 230], [150, 226], [196, 230], [248, 262], [260, 345]], 2), C.red),
      piece(rect(40, 290, 220, 18, 4), C.gold, { fibre: false }),
      piece(rect(126, 230, 48, 14, 6), C.gold, { fibre: false }),
    ],
    browColor: '#a03818',
    mouth: 'grin',
  });
}

export function nagini(): string {
  const scale = '#5a6a3a';
  return creature('nagini', 'Nagini the snake', [
    floor(130),
    piece(ellipse(150, 300, 130, 40), '#4a5a30'),
    piece(ellipse(150, 290, 100, 26), scale, { fibre: false }),
    ...[90, 130, 170, 210].map((x) => piece(ellipse(x, 296, 12, 6), '#3a4824', { edge: 'cut', fibre: false, shadow: false })),
    piece(band([[200, 290], [230, 220], [190, 160], [160, 120]], 46), scale),
    ...[[218, 230], [206, 188], [182, 152]].map(([x, y]) => piece(ellipse(x, y, 10, 6), '#3a4824', { edge: 'cut', fibre: false, shadow: false })),
    group({ part: 'head', origin: [150, 110] }, [
      piece(curve([[100, 110], [120, 70], [170, 64], [204, 90], [196, 130], [150, 146], [110, 136]]), scale),
      piece(ellipse(132, 98, 12, 10), C.yellow, { edge: 'cut' }),
      piece(ellipse(174, 94, 12, 10), C.yellow, { edge: 'cut' }),
      piece(ellipse(132, 98, 3, 8), C.ink, { edge: 'clean', shadow: false }),
      piece(ellipse(174, 94, 3, 8), C.ink, { edge: 'clean', shadow: false }),
      ink([[120, 132], [96, 150], [90, 140]], { width: 3, color: C.red }),
      ink([[96, 150], [86, 158]], { width: 3, color: C.red }),
    ]),
  ]);
}

// ---------------------------------------------------------------------------
// Book 7
// ---------------------------------------------------------------------------

export function kreacher(): string {
  const skin = '#bcae96';
  return person({
    name: 'kreacher',
    label: 'Kreacher the house-elf',
    skin,
    eyes: '#7a8a96',
    eyeStyle: 'sleepy',
    face: [54, 58],
    ears: false,
    back: [
      piece(poly([[cx - 40, cy - 4], [cx - 136, cy + 30], [cx - 118, cy + 50], [cx - 46, cy + 30]]), skin),
      piece(poly([[cx + 40, cy - 4], [cx + 136, cy + 30], [cx + 118, cy + 50], [cx + 46, cy + 30]]), skin),
      fluff([[cx - 120, cy + 34], [cx - 140, cy + 50], [cx - 116, cy + 60]], C.white, 5),
      fluff([[cx + 120, cy + 34], [cx + 140, cy + 50], [cx + 116, cy + 60]], C.white, 5),
    ],
    body: [
      piece(curve([[70, 345], [78, 262], [112, 224], [150, 218], [188, 224], [222, 262], [230, 345]], 2), C.stoneLight, { rough: 1.6 }),
      ink([[110, 250], [190, 250]], { width: 3, color: C.greyDark, opacity: 0.6 }),
      // the locket chain
      ink([[118, 228], [150, 270], [182, 228]], { width: 2, color: C.gold }),
    ],
    nose: 'pointy',
    mouth: 'frown',
    brows: 'cross',
    browColor: C.white,
  });
}

export function griphook(): string {
  const skin = '#c8c0a0';
  return person({
    name: 'griphook',
    label: 'Griphook the goblin',
    skin,
    eyes: C.ink,
    eyeStyle: 'narrow',
    face: [56, 66],
    ears: false,
    back: [
      piece(poly([[cx - 48, cy - 10], [cx - 120, cy - 44], [cx - 52, cy + 26]]), skin),
      piece(poly([[cx + 48, cy - 10], [cx + 120, cy - 44], [cx + 52, cy + 26]]), skin),
      piece(ellipse(cx - 58, cy + 20, 14, 24), '#2a2428'),
      piece(ellipse(cx + 58, cy + 20, 14, 24), '#2a2428'),
    ],
    body: [
      piece(curve([[40, 345], [52, 262], [104, 230], [150, 226], [196, 230], [248, 262], [260, 345]], 2), '#2a2a34'),
      piece(poly([[122, 228], [150, 280], [178, 228], [168, 222], [150, 250], [132, 222]]), C.white, { fibre: false }),
      piece(rect(140, 236, 20, 10, 3), C.redDark, { fibre: false }),
      piece(circle(206, 290, 12), C.gold, { edge: 'cut' }),
    ],
    nose: 'pointy',
    mouth: 'smirk',
    brows: 'cross',
    browColor: '#2a2428',
    blush: false,
  });
}

export function mcgonagall(): string {
  const hair = '#4a3a34';
  return person({
    name: 'mcgonagall',
    label: 'Professor McGonagall',
    skin: '#ecd4bc',
    eyes: C.greenDark,
    face: [56, 70],
    back: [piece(ellipse(cx, cy - 30, 66, 50), hair)],
    front: [
      piece(curve([[cx - 62, cy - 10], [cx - 54, cy - 62], [cx, cy - 74], [cx + 54, cy - 62], [cx + 62, cy - 10], [cx, cy - 50]], 2), hair),
      ...squareGlasses(C.ink),
      // tall witch's hat
      piece(curve([[cx - 76, cy - 52], [cx - 28, cy - 100], [cx - 6, cy - 138], [cx + 18, cy - 134], [cx + 28, cy - 100], [cx + 76, cy - 52]], 1), C.greenDark),
      piece(curve([[cx - 100, cy - 50], [cx, cy - 66], [cx + 100, cy - 50], [cx + 96, cy - 36], [cx, cy - 50], [cx - 96, cy - 36]], 2), C.greenDeep),
    ],
    body: [
      piece(curve([[40, 345], [52, 262], [104, 230], [150, 226], [196, 230], [248, 262], [260, 345]], 2), C.greenDark),
      piece(rect(132, 228, 36, 20, 6), C.greenDeep, { fibre: false }),
      piece(circle(150, 254, 9), C.gold, { edge: 'cut' }),
    ],
    brows: 'raised',
    browColor: hair,
    mouth: 'smile',
    blush: false,
    extra: [wand(234, 318, C.brownDark)],
  });
}

export const hosts2: Record<string, () => string> = {
  crookshanks, lupin, buckbeak, wormtail, moody, horntail, myrtle, bellatrix,
  sirius, luna, neville, deatheater, slughorn, dumbledore, ginny, nagini, kreacher, griphook, mcgonagall,
};
