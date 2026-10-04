/**
 * Character portraits (head and shoulders), 300 × 340, built from a shared
 * template so every character sits the same way on cards and intros.
 */
import { C } from '../palette';
import { band, circle, curve, dot, ellipse, group, ink, piece, poly, rect, svg, type Node, type Pt } from '../paper';

export const W = 300;
export const H = 340;

export interface PersonOpts {
  name: string;
  label: string;
  skin: string;
  /** Behind the head (long hair, hoods, hat brims). */
  back?: Node[];
  /** Body: robes etc. Defaults to a black school robe. */
  body?: Node[];
  robe?: string;
  /** House tie colours, or null for none. */
  tie?: [string, string] | null;
  /** Over the face: fringes, beards, glasses, hats. */
  front?: Node[];
  /** Eye colour. */
  eyes?: string;
  eyeStyle?: 'round' | 'narrow' | 'big' | 'sleepy' | 'wide';
  /** Mouth style. */
  mouth?: 'smile' | 'grin' | 'smirk' | 'flat' | 'open' | 'frown' | 'none';
  brows?: 'kind' | 'cross' | 'raised' | 'none';
  browColor?: string;
  /** Face shape: rx, ry. */
  face?: [number, number];
  nose?: 'button' | 'long' | 'slits' | 'big' | 'pointy';
  ears?: boolean;
  freckles?: boolean;
  blush?: boolean;
  /** Translucent (ghosts). */
  ghost?: boolean;
  /** Head tilt in degrees (Nearly Headless Nick!). */
  tilt?: number;
  extra?: Node[];
}

const HEAD: Pt = [150, 142];

function eyes(o: PersonOpts): Node[] {
  const [cx, cy] = HEAD;
  const col = o.eyes ?? C.brownDark;
  const style = o.eyeStyle ?? 'round';
  const dx = 26;
  const y = cy + 2;
  const out: Node[] = [];
  for (const s of [-1, 1]) {
    const x = cx + s * dx;
    if (style === 'narrow') {
      out.push(piece(ellipse(x, y, 11, 6), C.white, { edge: 'cut', fibre: false, shadow: false }));
      out.push(piece(circle(x, y, 5), col, { edge: 'clean', shadow: false }));
      out.push(piece(circle(x, y, 2.4), C.ink, { edge: 'clean', shadow: false }));
    } else if (style === 'sleepy') {
      out.push(piece(ellipse(x, y + 2, 11, 8), C.white, { edge: 'cut', fibre: false, shadow: false }));
      out.push(piece(circle(x, y + 3, 6), col, { edge: 'clean', shadow: false }));
      out.push(piece(circle(x, y + 3, 3), C.ink, { edge: 'clean', shadow: false }));
      out.push(piece(poly([[x - 13, y + 1], [x + 13, y + 1], [x + 12, y - 8], [x - 12, y - 8]]), o.skin, { edge: 'cut', fibre: false, shadow: false }));
      out.push(ink([[x - 12, y + 1], [x + 12, y + 1]], { width: 2.2, color: C.ink }));
    } else {
      const r = style === 'big' ? 15 : style === 'wide' ? 13 : 11;
      out.push(piece(ellipse(x, y, r, r * 1.08), C.white, { edge: 'cut', fibre: false, shadow: false }));
      out.push(piece(circle(x, y + 1, r * 0.62), col, { edge: 'clean', shadow: false }));
      out.push(piece(circle(x, y + 1, r * 0.32), C.ink, { edge: 'clean', shadow: false }));
      out.push(dot(x - r * 0.25, y - r * 0.25, r * 0.2, C.white));
    }
  }
  return out;
}

function brows(o: PersonOpts): Node[] {
  const [cx, cy] = HEAD;
  const color = o.browColor ?? C.brownDark;
  const y = cy - 20;
  switch (o.brows ?? 'kind') {
    case 'none':
      return [];
    case 'cross':
      return [
        ink([[cx - 42, y - 6], [cx - 14, y + 4]], { width: 6, color }),
        ink([[cx + 42, y - 6], [cx + 14, y + 4]], { width: 6, color }),
      ];
    case 'raised':
      return [
        ink([[cx - 40, y - 2], [cx - 26, y - 12], [cx - 12, y - 6]], { width: 5, color }),
        ink([[cx + 40, y - 2], [cx + 26, y - 12], [cx + 12, y - 6]], { width: 5, color }),
      ];
    default:
      return [
        ink([[cx - 40, y], [cx - 26, y - 6], [cx - 12, y - 2]], { width: 5, color }),
        ink([[cx + 40, y], [cx + 26, y - 6], [cx + 12, y - 2]], { width: 5, color }),
      ];
  }
}

function nose(o: PersonOpts): Node[] {
  const [cx, cy] = HEAD;
  const y = cy + 26;
  const shade = o.ghost ? 'rgba(80,100,130,0.5)' : 'rgba(120,60,30,0.35)';
  switch (o.nose ?? 'button') {
    case 'slits':
      return [
        piece(ellipse(cx - 6, y, 2.5, 6, 20), C.ink, { edge: 'clean', shadow: false, opacity: 0.7 }),
        piece(ellipse(cx + 6, y, 2.5, 6, -20), C.ink, { edge: 'clean', shadow: false, opacity: 0.7 }),
      ];
    case 'long':
      return [ink([[cx + 2, cy + 4], [cx - 6, y + 6], [cx + 6, y + 8]], { width: 3, color: shade })];
    case 'big':
      return [piece(ellipse(cx, y, 14, 12), o.skin, { edge: 'cut', fibre: false }), ink([[cx - 8, y + 6], [cx + 8, y + 6]], { width: 2.5, color: shade })];
    case 'pointy':
      return [piece(poly([[cx, cy + 2], [cx + 22, y + 10], [cx, y + 12]]), o.skin, { edge: 'cut', fibre: false })];
    default:
      return [ink([[cx - 6, y + 2], [cx, y + 6], [cx + 6, y + 2]], { width: 3, color: shade })];
  }
}

function mouth(o: PersonOpts): Node[] {
  const [cx, cy] = HEAD;
  const y = cy + 46;
  const col = o.ghost ? '#5a6a86' : C.redDark;
  switch (o.mouth ?? 'smile') {
    case 'none':
      return [];
    case 'grin':
      return [
        piece(curve([[cx - 24, y - 4], [cx + 24, y - 4], [cx + 14, y + 12], [cx - 14, y + 12]], 2), col, { edge: 'cut', fibre: false, shadow: false }),
        piece(rect(cx - 16, y - 4, 32, 6, 2), C.white, { edge: 'clean', shadow: false }),
      ];
    case 'smirk':
      return [ink([[cx - 16, y + 2], [cx + 4, y + 4], [cx + 18, y - 4]], { width: 3.5, color: col })];
    case 'flat':
      return [ink([[cx - 14, y + 2], [cx + 14, y + 2]], { width: 3.5, color: col })];
    case 'frown':
      return [ink([[cx - 16, y + 6], [cx, y], [cx + 16, y + 6]], { width: 3.5, color: col })];
    case 'open':
      return [piece(ellipse(cx, y + 2, 12, 10), col, { edge: 'cut', fibre: false, shadow: false })];
    default:
      return [ink([[cx - 18, y], [cx, y + 9], [cx + 18, y]], { width: 3.5, color: col })];
  }
}

/** Black school robe with a house tie. */
export function robe(color: string = C.charcoal, tie: [string, string] | null = [C.red, C.gold]): Node[] {
  const out: Node[] = [
    piece(curve([[40, 345], [52, 262], [104, 230], [150, 226], [196, 230], [248, 262], [260, 345]], 2), color),
    piece(poly([[122, 228], [150, 280], [178, 228], [168, 222], [150, 252], [132, 222]]), C.white, { fibre: false }),
  ];
  if (tie) {
    out.push(piece(poly([[142, 238], [158, 238], [164, 320], [150, 334], [136, 320]]), tie[0], { edge: 'cut', fibre: false }));
    for (const y of [258, 284, 310]) out.push(piece(poly([[138, y], [162, y - 8], [163, y - 2], [139, y + 6]]), tie[1], { edge: 'clean', shadow: false }));
    out.push(piece(poly([[140, 230], [160, 230], [156, 244], [144, 244]]), tie[0], { edge: 'cut', fibre: false }));
  }
  return out;
}

export function person(o: PersonOpts): string {
  const [cx, cy] = HEAD;
  const [rx, ry] = o.face ?? [62, 70];
  const op = o.ghost ? 0.82 : undefined;
  return svg({ w: W, h: H, name: o.name, label: o.label, className: 'portrait' }, [
    group({ part: 'figure', opacity: op }, [
      ...(o.tilt ? [] : (o.back ?? [])),
      ...(o.body ?? robe(o.robe, o.tie === undefined ? [C.red, C.gold] : o.tie)),
      piece(rect(cx - 22, cy + ry - 30, 44, 40, 8), o.skin, { fibre: false }),
      group({ part: 'head', origin: [cx, cy + ry], transform: o.tilt ? `rotate(${o.tilt} ${cx} ${cy + ry})` : undefined }, [
        ...(o.tilt ? (o.back ?? []) : []),
        ...(o.ears === false ? [] : [piece(ellipse(cx - rx + 2, cy + 6, 13, 18), o.skin), piece(ellipse(cx + rx - 2, cy + 6, 13, 18), o.skin)]),
        piece(ellipse(cx, cy, rx, ry), o.skin),
        ...(o.blush !== false && !o.ghost ? [piece(ellipse(cx - 38, cy + 30, 11, 7), C.pink, { edge: 'cut', fibre: false, shadow: false, opacity: 0.55 }), piece(ellipse(cx + 38, cy + 30, 11, 7), C.pink, { edge: 'cut', fibre: false, shadow: false, opacity: 0.55 })] : []),
        ...(o.freckles ? [[-34, 22], [-26, 28], [-40, 30], [34, 22], [26, 28], [40, 30]].map(([x, y]) => dot(cx + x, cy + y, 2.2, C.brown, 0.7)) : []),
        ...eyes(o),
        ...brows(o),
        ...nose(o),
        ...mouth(o),
        ...(o.front ?? []),
      ]),
      ...(o.extra ?? []),
    ]),
  ]);
}

// ---------------------------------------------------------------------------
// Shared props
// ---------------------------------------------------------------------------

export const roundGlasses = (frame: string = C.ink): Node[] => {
  const [cx, cy] = HEAD;
  return [
    ink(circlePts(cx - 26, cy + 2, 19), { width: 4, color: frame, closed: true }),
    ink(circlePts(cx + 26, cy + 2, 19), { width: 4, color: frame, closed: true }),
    ink([[cx - 7, cy], [cx + 7, cy]], { width: 4, color: frame }),
  ];
};

export const squareGlasses = (frame: string = C.ink): Node[] => {
  const [cx, cy] = HEAD;
  return [
    ink([[cx - 44, cy - 12], [cx - 10, cy - 12], [cx - 10, cy + 14], [cx - 44, cy + 14]], { width: 3.5, color: frame, closed: true }),
    ink([[cx + 44, cy - 12], [cx + 10, cy - 12], [cx + 10, cy + 14], [cx + 44, cy + 14]], { width: 3.5, color: frame, closed: true }),
    ink([[cx - 10, cy - 2], [cx + 10, cy - 2]], { width: 3.5, color: frame }),
  ];
};

export const halfMoonGlasses = (): Node[] => {
  const [cx, cy] = HEAD;
  return [
    ink([[cx - 44, cy + 6], [cx - 36, cy + 18], [cx - 16, cy + 18], [cx - 10, cy + 6]], { width: 3.5, color: C.gold, closed: true }),
    ink([[cx + 44, cy + 6], [cx + 36, cy + 18], [cx + 16, cy + 18], [cx + 10, cy + 6]], { width: 3.5, color: C.gold, closed: true }),
    ink([[cx - 10, cy + 8], [cx + 10, cy + 8]], { width: 3, color: C.gold }),
  ];
};

function circlePts(cx: number, cy: number, r: number): Pt[] {
  return Array.from({ length: 20 }, (_, i) => {
    const a = (i / 20) * Math.PI * 2;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r] as Pt;
  });
}

/** A wand held up at the side of the portrait. */
export const wand = (x = 250, y = 300, color: string = C.brownDark): Node =>
  group({ part: 'wand', origin: [x, y] }, [
    piece(band([[x, y], [x + 16, y - 120]], 9), color, { edge: 'cut' }),
    piece(circle(x + 1, y - 4, 10), C.skin, { edge: 'cut' }),
  ]);

export { HEAD };
