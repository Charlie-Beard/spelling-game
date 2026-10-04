/** The three playable heroes, plus Hagrid. */
import { C } from '../palette';
import { circle, curve, ellipse, ink, piece, poly, rect, type Node, type Pt } from '../paper';
import { HEAD, person, roundGlasses, wand } from './people';

const [cx, cy] = HEAD;

/** A cloud of overlapping circles (bushy hair, beards). */
export function cloud(points: Array<[number, number, number]>, color: string): Node[] {
  return points.map(([x, y, r]) => piece(circle(x, y, r), color, { rough: 1.3 }));
}

/**
 * One fluffy, scalloped shape (bushy hair, beards, clouds): an outline
 * through `pts` with a bump between every pair of points.
 */
export function fluff(pts: Pt[], color: string, bump = 14, o: { fibre?: boolean } = {}): Node {
  const out: Pt[] = [];
  let sx = 0;
  let sy = 0;
  pts.forEach(([x, y]) => {
    sx += x;
    sy += y;
  });
  const c: Pt = [sx / pts.length, sy / pts.length];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    const mx = (a[0] + b[0]) / 2;
    const my = (a[1] + b[1]) / 2;
    const dx = mx - c[0];
    const dy = my - c[1];
    const len = Math.hypot(dx, dy) || 1;
    out.push(a, [mx + (dx / len) * bump, my + (dy / len) * bump]);
  }
  return piece(curve(out, 3), color, { rough: 1.2, ...(o.fibre === false ? { fibre: false } : {}) });
}

const HAIR_BLACK = '#24212a';
const HAIR_GINGER = '#c85a28';
const HAIR_BROWN = '#6e4528';

export function harry(): string {
  return person({
    name: 'harry',
    label: 'Harry Potter',
    skin: C.skin,
    eyes: C.green,
    back: [piece(ellipse(cx, cy - 26, 76, 64), HAIR_BLACK)],
    front: [
      // messy fringe
      piece(
        poly([
          [cx - 74, cy - 6], [cx - 70, cy - 60], [cx - 30, cy - 86], [cx + 20, cy - 90], [cx + 66, cy - 66], [cx + 76, cy - 10],
          [cx + 58, cy - 34], [cx + 50, cy - 18], [cx + 36, cy - 44], [cx + 22, cy - 28], [cx + 10, cy - 48],
          [cx - 8, cy - 30], [cx - 22, cy - 50], [cx - 36, cy - 30], [cx - 50, cy - 46], [cx - 60, cy - 20],
        ]),
        HAIR_BLACK,
      ),
      // lightning scar
      ink([[cx + 12, cy - 46], [cx + 4, cy - 36], [cx + 14, cy - 34], [cx + 6, cy - 22]], { width: 3.5, color: C.rose }),
      ...roundGlasses(C.ink),
    ],
    brows: 'none',
    tie: [C.red, C.gold],
    extra: [wand(232, 318)],
  });
}

export function ron(): string {
  const jumper: Node[] = [
    piece(curve([[40, 345], [52, 262], [104, 230], [150, 226], [196, 230], [248, 262], [260, 345]], 2), C.redDark),
    piece(curve([[118, 230], [150, 246], [182, 230], [178, 222], [150, 236], [122, 222]], 2), C.red, { fibre: false }),
    // the famous initial
    ink([[136, 330], [136, 284], [156, 284], [162, 296], [156, 306], [136, 306], [162, 330]], { width: 7, color: C.gold }),
  ];
  return person({
    name: 'ron',
    label: 'Ron Weasley',
    skin: C.skin,
    eyes: C.blue,
    freckles: true,
    face: [60, 74],
    back: [piece(ellipse(cx, cy - 22, 74, 66), HAIR_GINGER), piece(ellipse(cx - 62, cy + 6, 16, 34), HAIR_GINGER), piece(ellipse(cx + 62, cy + 6, 16, 34), HAIR_GINGER)],
    front: [
      piece(curve([[cx - 70, cy - 10], [cx - 66, cy - 66], [cx - 10, cy - 92], [cx + 54, cy - 80], [cx + 72, cy - 24], [cx + 40, cy - 46], [cx - 20, cy - 52], [cx - 50, cy - 34]], 2), HAIR_GINGER),
    ],
    browColor: '#a8461e',
    mouth: 'grin',
    body: jumper,
  });
}

export function hermione(): string {
  const bush: Pt[] = [
    [cx, cy - 128], [cx + 62, cy - 112], [cx + 108, cy - 66], [cx + 128, cy - 6], [cx + 130, cy + 60], [cx + 118, cy + 120],
    [cx + 84, cy + 156], [cx + 40, cy + 120], [cx - 40, cy + 120], [cx - 84, cy + 156], [cx - 118, cy + 120],
    [cx - 130, cy + 60], [cx - 128, cy - 6], [cx - 108, cy - 66], [cx - 62, cy - 112],
  ];
  return person({
    name: 'hermione',
    label: 'Hermione Granger',
    skin: C.skin,
    eyes: C.brown,
    face: [58, 68],
    back: [fluff(bush, HAIR_BROWN, 16)],
    front: [
      piece(curve([[cx - 64, cy - 4], [cx - 58, cy - 64], [cx, cy - 80], [cx + 58, cy - 64], [cx + 64, cy - 4], [cx + 30, cy - 50], [cx + 4, cy - 58], [cx - 4, cy - 58], [cx - 30, cy - 50]], 2), HAIR_BROWN),
    ],
    browColor: '#5a3820',
    mouth: 'smile',
    extra: [wand(234, 318, '#7a4a2a')],
  });
}

export function hagrid(): string {
  const beard: Pt[] = [
    [cx - 78, cy - 6], [cx - 60, cy + 30], [cx - 30, cy + 34], [cx, cy + 32], [cx + 30, cy + 34], [cx + 60, cy + 30], [cx + 78, cy - 6],
    [cx + 92, cy + 60], [cx + 70, cy + 120], [cx + 30, cy + 160], [cx - 30, cy + 160], [cx - 70, cy + 120], [cx - 92, cy + 60],
  ];
  const hair: Pt[] = [
    [cx, cy - 120], [cx + 60, cy - 108], [cx + 100, cy - 64], [cx + 116, cy], [cx + 112, cy + 60], [cx + 70, cy + 40],
    [cx - 70, cy + 40], [cx - 112, cy + 60], [cx - 116, cy], [cx - 100, cy - 64], [cx - 60, cy - 108],
  ];
  const coat: Node[] = [
    piece(curve([[10, 345], [24, 250], [90, 214], [150, 210], [210, 214], [276, 250], [290, 345]], 2), C.brown),
    piece(poly([[110, 226], [150, 345], [190, 226], [180, 220], [150, 300], [120, 220]]), C.brownDark, { fibre: false }),
    ...[60, 240].map((x) => piece(rect(x - 16, 280, 32, 30, 6), C.wood, { fibre: false })),
  ];
  return person({
    name: 'hagrid',
    label: 'Hagrid',
    skin: C.skinShade,
    eyes: C.ink,
    eyeStyle: 'round',
    face: [66, 72],
    back: [fluff(hair, '#3a2a20', 16)],
    body: coat,
    front: [
      fluff(beard, '#3a2a20', 12),
      piece(curve([[cx - 22, cy + 46], [cx, cy + 40], [cx + 22, cy + 46], [cx, cy + 58]], 2), C.rose, { fibre: false }),
      fluff([[cx - 66, cy - 26], [cx - 40, cy - 66], [cx, cy - 74], [cx + 40, cy - 66], [cx + 66, cy - 26], [cx + 30, cy - 44], [cx - 30, cy - 44]], '#3a2a20', 8),
      piece(ellipse(cx, cy + 22, 14, 12), C.skinShade, { edge: 'cut', fibre: false }),
    ],
    nose: 'button',
    mouth: 'none',
    brows: 'kind',
    browColor: '#2a1d15',
  });
}

export const heroes: Record<string, () => string> = { harry, ron, hermione, hagrid };
