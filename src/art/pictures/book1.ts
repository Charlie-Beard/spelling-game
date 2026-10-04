import { C } from '../palette';
import { band, curve, dot, ellipse, group, ink, piece, poly, svg, type Node } from '../paper';

/** A soft ground shadow that anchors an object. */
export const ground = (cx: number, cy: number, rx: number, ry = rx * 0.18): Node =>
  piece(ellipse(cx, cy, rx, ry), 'rgba(40,25,10,0.18)', { edge: 'cut', fibre: false, shadow: false });

export function cat(): string {
  return svg({ w: 400, h: 400, name: 'cat', label: 'a cat' }, [
    ground(200, 352, 120),
    // tail
    piece(band([[240, 336], [318, 326], [352, 262], [334, 206]], 26), C.orange),
    piece(ellipse(334, 204, 15, 17, -10), C.cream),
    // body
    piece(curve([[200, 175], [272, 215], [290, 300], [262, 352], [138, 352], [110, 300], [128, 215]]), C.orange),
    piece(curve([[200, 230], [238, 260], [238, 330], [200, 346], [162, 330], [162, 260]]), C.cream),
    // paws
    piece(ellipse(166, 346, 26, 16), C.cream),
    piece(ellipse(234, 346, 26, 16), C.cream),
    ink([[160, 340], [160, 352]], { width: 2 }),
    ink([[172, 340], [172, 352]], { width: 2 }),
    ink([[228, 340], [228, 352]], { width: 2 }),
    ink([[240, 340], [240, 352]], { width: 2 }),
    group({ part: 'head', origin: [200, 200] }, [
      // ears
      piece(poly([[110, 132], [118, 34], [192, 92]]), C.orange),
      piece(poly([[290, 132], [282, 34], [208, 92]]), C.orange),
      piece(poly([[128, 112], [130, 58], [170, 92]]), C.pink, { fibre: false }),
      piece(poly([[272, 112], [270, 58], [230, 92]]), C.pink, { fibre: false }),
      // head
      piece(ellipse(200, 150, 100, 84), C.orange),
      // stripes
      piece(poly([[184, 70], [200, 104], [216, 70]]), C.ginger, { fibre: false, shadow: false }),
      piece(poly([[104, 140], [138, 148], [106, 162]]), C.ginger, { fibre: false, shadow: false }),
      piece(poly([[296, 140], [262, 148], [294, 162]]), C.ginger, { fibre: false, shadow: false }),
      // muzzle
      piece(ellipse(180, 184, 28, 22), C.cream, { fibre: false }),
      piece(ellipse(220, 184, 28, 22), C.cream, { fibre: false }),
      piece(poly([[188, 164], [212, 164], [200, 178]]), C.rose, { edge: 'cut', fibre: false }),
      ink([[200, 178], [200, 190], [188, 198]], { width: 2.5 }),
      ink([[200, 190], [212, 198]], { width: 2.5 }),
      // eyes
      group({ part: 'eyes', origin: [200, 140] }, [
        piece(ellipse(160, 138, 20, 22), C.yellow, { edge: 'cut' }),
        piece(ellipse(240, 138, 20, 22), C.yellow, { edge: 'cut' }),
        piece(ellipse(160, 140, 6, 17), C.ink, { edge: 'clean', shadow: false }),
        piece(ellipse(240, 140, 6, 17), C.ink, { edge: 'clean', shadow: false }),
        dot(155, 130, 4, C.white),
        dot(235, 130, 4, C.white),
      ]),
      // whiskers
      ink([[150, 188], [96, 178]], { width: 2, color: C.white }),
      ink([[150, 196], [98, 202]], { width: 2, color: C.white }),
      ink([[250, 188], [304, 178]], { width: 2, color: C.white }),
      ink([[250, 196], [302, 202]], { width: 2, color: C.white }),
    ]),
  ]);
}

export const book1Pictures: Record<string, () => string> = { cat };
