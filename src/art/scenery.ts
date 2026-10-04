/** Backdrops. Static (no boil) so they never compete for attention. */
import { C } from './palette';
import { curve, ellipse, group, piece, poly, rect, rng, svg, type Node, type Pt } from './paper';

function stars(count: number, seed: number, w: number, maxY: number): Node[] {
  const r = rng(seed);
  const out: Node[] = [];
  for (let i = 0; i < count; i++) {
    const x = r() * w;
    const y = r() * maxY;
    const s = 2 + r() * 4;
    const pts: Pt[] = [];
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4 + r() * 0.2;
      const rr = k % 2 ? s * 0.4 : s;
      pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]);
    }
    out.push(piece(poly(pts), r() > 0.8 ? C.goldLight : C.cream, { edge: 'cut', fibre: false, shadow: false, opacity: 0.5 + r() * 0.4 }));
  }
  return out;
}

/** Quiet night sky for the spelling desk. */
export function nightSky(name = 'sky'): string {
  return svg({ w: 1180, h: 820, name, boil: false, className: 'backdrop' }, [
    piece(rect(-20, -20, 1220, 860), C.night, { edge: 'clean', shadow: false }),
    ...stars(46, 7, 1180, 820),
  ]);
}

/** Torn-paper hills layer. */
function hills(y: number, amp: number, color: string, seed: number, w = 1180): Node {
  const r = rng(seed);
  const pts: Pt[] = [[-40, 900]];
  for (let x = -40; x <= w + 40; x += 90) pts.push([x, y - r() * amp]);
  pts.push([w + 40, 900]);
  return piece(curve(pts, 2), color, { rough: 1.4 });
}

/** Hogwarts on its hill at night (title and map). */
export function castleNight(name = 'castle'): string {
  const tower = (x: number, top: number, w: number, roof: string): Node[] => [
    piece(rect(x, top, w, 640 - top), C.nightLight, { rough: 0.8 }),
    piece(poly([[x - 10, top + 4], [x + w / 2, top - w * 1.25], [x + w + 10, top + 4]]), roof, { rough: 0.8 }),
  ];
  const win = (x: number, y: number) =>
    piece(rect(x, y, 12, 20, 6), C.candle, { edge: 'cut', fibre: false, shadow: false });
  return svg({ w: 1180, h: 820, name, boil: false, className: 'backdrop' }, [
    piece(rect(-20, -20, 1220, 860), C.night, { edge: 'clean', shadow: false }),
    ...stars(70, 3, 1180, 520),
    piece(ellipse(1040, 290, 50), C.cream, { rough: 0.8 }),
    piece(ellipse(1060, 278, 43), C.night, { edge: 'cut', fibre: false, shadow: false }),
    hills(560, 50, '#2a3157', 21),
    group({}, [
      ...tower(470, 330, 60, C.slate),
      ...tower(560, 250, 74, C.slate),
      ...tower(660, 300, 64, C.slate),
      ...tower(760, 380, 54, C.slate),
      piece(rect(430, 420, 420, 220), C.nightLight, { rough: 0.8 }),
      piece(rect(400, 470, 50, 170), C.nightLight, { rough: 0.8 }),
      piece(poly([[392, 474], [425, 420], [458, 474]]), C.slate, { rough: 0.8 }),
      win(487, 380), win(590, 300), win(612, 340), win(690, 350), win(775, 420),
      win(470, 470), win(520, 500), win(600, 470), win(660, 510), win(740, 470), win(800, 520),
    ]),
    hills(640, 40, '#232a4a', 33),
    hills(720, 34, '#1b2140', 45),
    piece(ellipse(590, 760, 700, 90), '#161b33', { rough: 1.2, shadow: false }),
  ]);
}
