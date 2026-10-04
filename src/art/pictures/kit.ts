/** Shared bits for word pictures. All pictures are 400 × 400. */
import { C } from '../palette';
import { curve, dot, ellipse, group, ink, piece, type Node, type Pt } from '../paper';

/** A soft ground shadow that anchors an object. */
export const ground = (cx: number, cy: number, rx: number, ry = rx * 0.18): Node =>
  piece(ellipse(cx, cy, rx, ry), 'rgba(40,25,10,0.16)', { edge: 'cut', fibre: false, shadow: false });

/** A white highlight streak, for shiny things. */
export const shine = (pts: Pt[], opacity = 0.5): Node =>
  piece(curve(pts, 2), C.white, { edge: 'cut', fibre: false, shadow: false, opacity });

/** A friendly cartoon eye with a highlight. */
export const eye = (x: number, y: number, r: number, white = true): Node =>
  group({ part: 'eye' }, [
    ...(white ? [piece(ellipse(x, y, r, r * 1.1), C.white, { edge: 'cut', fibre: false })] : []),
    piece(ellipse(x, y + (white ? r * 0.15 : 0), r * (white ? 0.55 : 1), r * (white ? 0.62 : 1.1)), C.ink, { edge: 'clean', shadow: false }),
    dot(x - r * 0.2, y - r * 0.2, Math.max(1.5, r * 0.22), C.white),
  ]);

/** A small smile. */
export const smile = (x: number, y: number, w: number, color: string = C.ink, width = 3): Node =>
  ink([[x - w / 2, y], [x, y + w * 0.35], [x + w / 2, y]], { width, color });

/** Cheek blush. */
export const blush = (x: number, y: number, r = 9): Node =>
  piece(ellipse(x, y, r, r * 0.7), C.pink, { edge: 'cut', fibre: false, shadow: false, opacity: 0.7 });
