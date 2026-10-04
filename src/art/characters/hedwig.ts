import { C } from '../palette';
import { curve, dot, ellipse, group, ink, piece, poly, svg } from '../paper';

const speck = (x: number, y: number, s = 1) =>
  piece(curve([[x - 7 * s, y], [x, y - 3 * s], [x + 7 * s, y], [x, y + 3 * s]], 2), C.charcoal, {
    edge: 'cut',
    fibre: false,
    shadow: false,
  });

/**
 * Hedwig, the helper. Parts: wingL, wingR, head, eyes (blink), body.
 * 300 × 300, perched and facing the child.
 */
export function hedwig(name = 'hedwig'): string {
  return svg({ w: 300, h: 300, name, label: 'Hedwig the owl', className: 'hedwig' }, [
    // feet
    group({ part: 'feet' }, [
      piece(curve([[118, 262], [132, 254], [146, 262], [140, 276], [124, 276]]), C.yellow, { edge: 'cut' }),
      piece(curve([[154, 262], [168, 254], [182, 262], [176, 276], [160, 276]]), C.yellow, { edge: 'cut' }),
    ]),
    // wings behind body
    group({ part: 'wingL', origin: [100, 140] }, [
      piece(curve([[104, 128], [64, 160], [52, 222], [74, 262], [112, 246]]), C.white),
      speck(78, 190), speck(72, 214), speck(86, 236), speck(94, 168),
    ]),
    group({ part: 'wingR', origin: [200, 140] }, [
      piece(curve([[196, 128], [236, 160], [248, 222], [226, 262], [188, 246]]), C.white),
      speck(222, 190), speck(228, 214), speck(214, 236), speck(206, 168),
    ]),
    // body
    group({ part: 'body', origin: [150, 260] }, [
      piece(curve([[150, 100], [212, 130], [222, 210], [196, 266], [104, 266], [78, 210], [88, 130]]), C.white),
      piece(curve([[150, 150], [190, 176], [192, 236], [150, 258], [108, 236], [110, 176]]), '#fffdf6', { fibre: false, shadow: false }),
      speck(132, 196, 0.8), speck(166, 206, 0.8), speck(146, 226, 0.8), speck(176, 236, 0.7), speck(122, 238, 0.7),
    ]),
    // head
    group({ part: 'head', origin: [150, 140] }, [
      piece(ellipse(150, 98, 70, 62), C.white),
      // facial disc
      piece(ellipse(124, 100, 34, 32), '#fffdf6', { fibre: false }),
      piece(ellipse(176, 100, 34, 32), '#fffdf6', { fibre: false }),
      speck(118, 52, 0.7), speck(150, 44, 0.7), speck(182, 52, 0.7),
      group({ part: 'eyes', origin: [150, 96] }, [
        piece(ellipse(124, 96, 19, 19), C.yellow, { edge: 'cut' }),
        piece(ellipse(176, 96, 19, 19), C.yellow, { edge: 'cut' }),
        piece(ellipse(125, 97, 9, 10), C.ink, { edge: 'clean', shadow: false }),
        piece(ellipse(175, 97, 9, 10), C.ink, { edge: 'clean', shadow: false }),
        dot(121, 92, 3.5, C.white),
        dot(171, 92, 3.5, C.white),
      ]),
      // eyelids (hidden until blink)
      group({ part: 'lids', opacity: 0 }, [
        piece(ellipse(124, 96, 21, 21), C.white, { edge: 'cut', fibre: false }),
        piece(ellipse(176, 96, 21, 21), C.white, { edge: 'cut', fibre: false }),
        ink([[106, 98], [124, 104], [142, 98]], { width: 2.5, color: C.charcoal }),
        ink([[158, 98], [176, 104], [194, 98]], { width: 2.5, color: C.charcoal }),
      ]),
      // beak
      piece(poly([[140, 114], [160, 114], [150, 136]]), C.charcoal, { edge: 'cut', fibre: false }),
    ]),
  ]);
}
