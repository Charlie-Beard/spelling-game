/**
 * Paper UI pieces: wax-seal buttons, letter tiles, parchment panels, stars.
 */
import { C } from './palette';
import { curve, hashString, piece, poly, rect, rng, svg, tear, toPath, type Pt } from './paper';

// ---------------------------------------------------------------------------
// Icons (drawn as simple shapes, embossed onto wax seals)
// ---------------------------------------------------------------------------

export type IconName = 'speaker' | 'map' | 'play' | 'next' | 'back' | 'again' | 'cards' | 'cog' | 'tick' | 'home' | 'close' | 'horcrux';

const ICONS: Record<IconName, string> = {
  speaker:
    '<path d="M-26 -10h12l16-14v48l-16-14h-12z"/><path d="M10 -14q10 14 0 28" fill="none" stroke-width="6" stroke-linecap="round"/><path d="M18 -24q20 24 0 48" fill="none" stroke-width="6" stroke-linecap="round"/>',
  map: '<path d="M-28 -20l18-6 20 6 18-6v46l-18 6-20-6-18 6z" fill="none" stroke-width="5" stroke-linejoin="round"/><path d="M-10 -26v46M10 -20v46" fill="none" stroke-width="4"/>',
  play: '<path d="M-12 -24l32 24-32 24z" stroke-linejoin="round" stroke-width="6"/>',
  next: '<path d="M-20 0h34M2 -16l16 16-16 16" fill="none" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>',
  back: '<path d="M20 0h-34M-2 -16l-16 16 16 16" fill="none" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>',
  again:
    '<path d="M16 -14a22 22 0 1 0 6 16" fill="none" stroke-width="7" stroke-linecap="round"/><path d="M8 -26l12 12-16 4z" stroke-width="3" stroke-linejoin="round"/>',
  cards: '<rect x="-24" y="-20" width="30" height="40" rx="4" fill="none" stroke-width="5" transform="rotate(-12)"/><rect x="-4" y="-22" width="30" height="40" rx="4" fill="none" stroke-width="5" transform="rotate(10)"/>',
  cog: '<circle r="12" fill="none" stroke-width="6"/><path d="M0 -26v8M0 18v8M-26 0h8M18 0h8M-18 -18l6 6M12 12l6 6M18 -18l-6 6M-12 12l-6 6" stroke-width="6" stroke-linecap="round"/>',
  tick: '<path d="M-22 2l14 14 28-30" fill="none" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>',
  home: '<path d="M-24 2l24-22 24 22M-16 -4v24h32v-24" fill="none" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>',
  close: '<path d="M-16 -16l32 32M16 -16l-32 32" stroke-width="8" stroke-linecap="round"/>',
  horcrux: '<path d="M0 -24l20 24-20 24-20-24z" fill="none" stroke-width="6" stroke-linejoin="round"/>',
};

function waxOutline(r: number, seed: number): Pt[] {
  const rand = rng(seed);
  const pts: Pt[] = [];
  const n = 18;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr = r * (0.93 + rand() * 0.1);
    pts.push([Math.cos(a) * rr, Math.sin(a) * rr]);
  }
  return curve(pts, 3);
}

/** A round wax seal with an embossed icon. viewBox centred on 0,0. */
export function waxSeal(icon: IconName, color: string = C.red, size = 120, name: string = icon): string {
  const r = size / 2 - 8;
  const seed = hashString('wax' + name);
  const outer = toPath(waxOutline(r, seed));
  const inner = toPath(tear(waxOutline(r * 0.72, seed + 3), seed + 9, { wobble: 0.8, jag: 0.2 }));
  return `<svg class="seal" viewBox="${-size / 2} ${-size / 2} ${size} ${size}" aria-hidden="true">
    <path d="${outer}" fill="rgba(20,10,5,0.35)" transform="translate(2 4)"/>
    <path d="${outer}" fill="${color}"/>
    <path d="${outer}" fill="url(#waxShine)" opacity="0.5"/>
    <path d="${inner}" fill="none" stroke="rgba(0,0,0,0.22)" stroke-width="3"/>
    <path d="${inner}" fill="none" stroke="rgba(255,240,220,0.25)" stroke-width="2" transform="translate(-1 -1.5)"/>
    <g transform="scale(${size / 120})">
      <g fill="rgba(0,0,0,0.25)" stroke="rgba(0,0,0,0.25)" transform="translate(1.5 2)">${ICONS[icon]}</g>
      <g fill="#f6e3c6" stroke="#f6e3c6">${ICONS[icon]}</g>
    </g>
  </svg>`;
}

/** Shared SVG defs (gradients) used by UI pieces. Inserted once. */
export function uiDefs(): string {
  return `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
    <radialGradient id="waxShine" cx="35%" cy="30%" r="70%">
      <stop offset="0" stop-color="#fff" stop-opacity="0.55"/>
      <stop offset="0.45" stop-color="#fff" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.35"/>
    </radialGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#fff3c4" stop-opacity="0.95"/>
      <stop offset="0.5" stop-color="#ffd977" stop-opacity="0.45"/>
      <stop offset="1" stop-color="#ffd977" stop-opacity="0"/>
    </radialGradient>
  </defs></svg>`;
}

// ---------------------------------------------------------------------------
// Tiles, slots, panels
// ---------------------------------------------------------------------------

/** Torn card behind a letter tile. */
export function tileCard(w: number, h: number, seed: number, fill: string = C.cream): string {
  const base = rect(6, 6, w - 12, h - 12, 10);
  const top = toPath(tear(base, seed, { wobble: 1.5, jag: 0.9 }));
  const fibre = toPath(tear(base, seed + 5, { wobble: 1.5, jag: 1.3, grow: 2.2 }));
  return `<svg class="card-bg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">
    <path class="card-shadow" d="${top}" fill="rgba(60,38,14,0.38)" transform="translate(3 7)"/>
    <path d="${fibre}" fill="${C.white}"/>
    <path class="card-face" d="${top}" fill="${fill}"/>
  </svg>`;
}

/** The empty "cut-out window" where a letter goes. */
export function slotHole(w: number, h: number, seed: number): string {
  const base = rect(8, 8, w - 16, h - 16, 12);
  const d = toPath(tear(base, seed, { wobble: 1, jag: 0.5 }));
  return `<svg class="slot-bg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">
    <path d="${d}" fill="rgba(90,62,30,0.16)"/>
    <path d="${d}" fill="none" stroke="rgba(90,62,30,0.45)" stroke-width="3" stroke-dasharray="10 9" stroke-linecap="round"/>
  </svg>`;
}

/** A big torn parchment sheet (panels, the spelling desk). */
export function parchment(w: number, h: number, name: string, fill: string = C.cream, rough = 1.6): string {
  const seed = hashString(name);
  const base = rect(10, 10, w - 20, h - 20, 4);
  const opts = { wobble: 3.2 * rough, jag: 1.6 * rough, step: 7 };
  const top = toPath(tear(base, seed, opts));
  const fibre = toPath(tear(base, seed + 1, { ...opts, grow: 3.4 }));
  return `<svg class="parchment" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">
    <path d="${top}" fill="rgba(8,6,20,0.45)" transform="translate(4 9)"/>
    <path d="${fibre}" fill="${C.white}"/>
    <path d="${top}" fill="${fill}"/>
    <path d="${top}" fill="url(#parchShade)"/>
  </svg>`;
}

export function parchmentDefs(): string {
  return `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
    <radialGradient id="parchShade" cx="50%" cy="45%" r="75%">
      <stop offset="0.55" stop-color="#7a5528" stop-opacity="0"/>
      <stop offset="1" stop-color="#7a5528" stop-opacity="0.28"/>
    </radialGradient>
  </defs></svg>`;
}

/** Five-pointed paper star (progress, rewards). */
export function star(filled: boolean, name: string): string {
  const pts: Pt[] = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 ? 19 : 44;
    pts.push([50 + Math.cos(a) * r, 52 + Math.sin(a) * r]);
  }
  return svg({ w: 100, h: 100, name: 'star' + name, boil: false }, [
    filled
      ? piece(poly(pts), C.gold, { edge: 'cut' })
      : piece(poly(pts), 'rgba(246,236,212,0.18)', { edge: 'cut', fibre: false, shadow: false }),
  ]);
}

/** A cut-paper gem for the hourglass counter. */
export function gem(name = 'gem', color: string = C.red): string {
  return svg({ w: 60, h: 60, name, boil: false }, [
    piece(poly([[30, 6], [52, 22], [30, 56], [8, 22]]), color, { edge: 'cut' }),
    piece(poly([[30, 6], [52, 22], [30, 26], [8, 22]]), 'rgba(255,255,255,0.28)', { edge: 'clean', shadow: false }),
  ]);
}

/** Simple ellipse glow blob for hints. */
export const glowBlob = (): string =>
  `<svg viewBox="0 0 100 100" aria-hidden="true"><ellipse cx="50" cy="50" rx="50" ry="50" fill="url(#glow)"/></svg>`;

