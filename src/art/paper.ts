/**
 * Torn-paper art engine.
 *
 * Every illustration in the game is composed from simple shapes that are
 * turned into hand-torn paper cut-outs:
 *
 *   - the outline is resampled and pushed in/out along its normals with
 *     low-frequency wobble (hand-torn) plus high-frequency jaggies (fibres)
 *   - a slightly larger, paler "fibre" layer peeks out from under the edge,
 *     like the white core of real torn card
 *   - a soft offset shadow sits under each piece so layers read as stacked
 *
 * Each piece is rendered in a few slightly different "boil" frames which
 * are cycled at a low frame rate in CSS, giving the gentle jitter of
 * stop-motion animation. Boiling pauses whenever the child is concentrating.
 */

export type Pt = readonly [number, number];

// ---------------------------------------------------------------------------
// Deterministic randomness
// ---------------------------------------------------------------------------

export function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function rng(seed: number): () => number {
  let a = seed >>> 0 || 1;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Shape outlines (closed point lists)
// ---------------------------------------------------------------------------

export function ellipse(cx: number, cy: number, rx: number, ry = rx, rot = 0): Pt[] {
  const n = Math.max(24, Math.round((rx + ry) * 0.6));
  const c = Math.cos((rot * Math.PI) / 180);
  const s = Math.sin((rot * Math.PI) / 180);
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const x = Math.cos(a) * rx;
    const y = Math.sin(a) * ry;
    pts.push([cx + x * c - y * s, cy + x * s + y * c]);
  }
  return pts;
}

export const circle = (cx: number, cy: number, r: number): Pt[] => ellipse(cx, cy, r, r);

export function rect(x: number, y: number, w: number, h: number, r = 0): Pt[] {
  if (r <= 0) {
    return [
      [x, y],
      [x + w, y],
      [x + w, y + h],
      [x, y + h],
    ];
  }
  r = Math.min(r, w / 2, h / 2);
  const pts: Pt[] = [];
  const corner = (cx: number, cy: number, start: number) => {
    for (let i = 0; i <= 6; i++) {
      const a = ((start + (i / 6) * 90) * Math.PI) / 180;
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
  };
  corner(x + w - r, y + r, -90);
  corner(x + w - r, y + h - r, 0);
  corner(x + r, y + h - r, 90);
  corner(x + r, y + r, 180);
  return pts;
}

/** A closed polygon with sharp corners. */
export const poly = (pts: Pt[]): Pt[] => pts.slice();

/** A closed shape smoothed through its control points (Chaikin). */
export function curve(pts: Pt[], iterations = 3): Pt[] {
  let out = pts.slice();
  for (let k = 0; k < iterations; k++) {
    const next: Pt[] = [];
    for (let i = 0; i < out.length; i++) {
      const a = out[i];
      const b = out[(i + 1) % out.length];
      next.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25]);
      next.push([a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]);
    }
    out = next;
  }
  return out;
}

/** A thick stroke (e.g. a broom handle) as a closed outline. */
export function band(points: Pt[], width: number): Pt[] {
  const smooth = points.length > 2 ? openCurve(points) : points;
  const left: Pt[] = [];
  const right: Pt[] = [];
  for (let i = 0; i < smooth.length; i++) {
    const p = smooth[i];
    const a = smooth[Math.max(0, i - 1)];
    const b = smooth[Math.min(smooth.length - 1, i + 1)];
    let dx = b[0] - a[0];
    let dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    dx /= len;
    dy /= len;
    const w = width / 2;
    left.push([p[0] - dy * w, p[1] + dx * w]);
    right.push([p[0] + dy * w, p[1] - dx * w]);
  }
  return [...left, ...right.reverse()];
}

function openCurve(pts: Pt[], iterations = 3): Pt[] {
  let out = pts.slice();
  for (let k = 0; k < iterations; k++) {
    const next: Pt[] = [out[0]];
    for (let i = 0; i < out.length - 1; i++) {
      const a = out[i];
      const b = out[i + 1];
      next.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25]);
      next.push([a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]);
    }
    next.push(out[out.length - 1]);
    out = next;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Tearing
// ---------------------------------------------------------------------------

function resample(pts: Pt[], step: number): Pt[] {
  const out: Pt[] = [];
  const n = pts.length;
  let carry = 0;
  for (let i = 0; i < n; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % n];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    let t = carry;
    while (t < len) {
      const k = t / len;
      out.push([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]);
      t += step;
    }
    carry = t - len;
  }
  return out.length >= 3 ? out : pts.slice();
}

function signedArea(pts: Pt[]): number {
  let s = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    s += a[0] * b[1] - b[0] * a[1];
  }
  return s / 2;
}

export interface TearOpts {
  /** Amplitude of the slow hand-torn wobble, in px. */
  wobble: number;
  /** Amplitude of the fibrous jaggies, in px. */
  jag: number;
  /** Extra outward offset, in px (used for the fibre underlay). */
  grow?: number;
  /** Spacing between outline samples, in px. */
  step?: number;
}

/** Tears an outline. Returns a new closed point list. */
export function tear(pts: Pt[], seed: number, o: TearOpts): Pt[] {
  const rand = rng(seed);
  const step = o.step ?? 5;
  const p = resample(pts, step);
  const n = p.length;
  const outward = signedArea(p) > 0 ? 1 : -1;

  // Low-frequency wobble: a few sines with integer frequencies so the
  // outline closes seamlessly.
  const waves = [1, 2, 3].map(() => ({
    f: 2 + Math.floor(rand() * Math.max(2, n / 14)),
    ph: rand() * Math.PI * 2,
    a: 0.4 + rand() * 0.6,
  }));
  const ampSum = waves.reduce((s, w) => s + w.a, 0);

  const out: Pt[] = [];
  let prevJag = 0;
  for (let i = 0; i < n; i++) {
    const a = p[(i - 1 + n) % n];
    const b = p[(i + 1) % n];
    let nx = b[1] - a[1];
    let ny = -(b[0] - a[0]);
    const len = Math.hypot(nx, ny) || 1;
    nx = (nx / len) * outward;
    ny = (ny / len) * outward;

    let w = 0;
    for (const wave of waves) w += Math.sin((i / n) * Math.PI * 2 * wave.f + wave.ph) * wave.a;
    w = (w / ampSum) * o.wobble;

    // Jaggies are lightly smoothed white noise, so fibres clump.
    const j = (rand() * 2 - 1) * o.jag;
    const jag = prevJag * 0.35 + j * 0.65;
    prevJag = jag;

    const g = o.grow ? o.grow * (0.35 + rand() * 0.9) : 0;
    const d = w + jag + g;
    out.push([p[i][0] + nx * d, p[i][1] + ny * d]);
  }
  return out;
}

export function toPath(pts: Pt[]): string {
  if (!pts.length) return '';
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) d += `L${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)}`;
  return d + 'Z';
}

// ---------------------------------------------------------------------------
// Composition
// ---------------------------------------------------------------------------

export const BOIL_FRAMES = 3;

export interface Ctx {
  /** Base seed for this illustration. */
  seed: number;
  /** Running counter so every piece gets its own seed. */
  next: () => number;
  /** Number of boil frames to render (1 = static). */
  frames: number;
}

export type Node = (ctx: Ctx) => string;

export type Edge = 'torn' | 'cut' | 'clean';

export interface PieceOpts {
  /** Edge style: torn (rough + fibres), cut (scissor-cut), clean (no jitter). */
  edge?: Edge;
  /** Multiplies the default roughness. */
  rough?: number;
  /** Fibre underlay colour, or false to hide it. */
  fibre?: string | false;
  /** Draws a soft offset shadow under the piece. */
  shadow?: boolean;
  opacity?: number;
  /** Extra attributes for the piece's wrapper group (e.g. data-part). */
  attrs?: string;
}

const EDGES: Record<Edge, { wobble: number; jag: number }> = {
  torn: { wobble: 2.2, jag: 1.25 },
  cut: { wobble: 0.9, jag: 0.25 },
  clean: { wobble: 0, jag: 0 },
};

export const FIBRE = '#fbf6ea';
const SHADOW = 'rgba(28,18,8,0.26)';

/** A single paper cut-out. */
export function piece(outline: Pt[], fill: string, o: PieceOpts = {}): Node {
  return (ctx) => {
    const edge = o.edge ?? 'torn';
    const base = EDGES[edge];
    const k = o.rough ?? 1;
    const seed = ctx.next();
    const fibre = o.fibre === undefined ? (edge === 'torn' ? FIBRE : false) : o.fibre;
    const shadow = o.shadow ?? true;
    const frames = edge === 'clean' ? 1 : ctx.frames;

    let body = '';
    for (let f = 0; f < frames; f++) {
      const fs = seed + f * 7919;
      const top =
        edge === 'clean'
          ? outline
          : tear(outline, fs, { wobble: base.wobble * k, jag: base.jag * k });
      const topD = toPath(top);
      let g = '';
      if (shadow) g += `<path d="${topD}" fill="${SHADOW}" transform="translate(1.6 2.6)"/>`;
      if (fibre) {
        const under = tear(outline, fs + 101, {
          wobble: base.wobble * k,
          jag: base.jag * k * 1.4,
          grow: 1.9 * k,
        });
        g += `<path d="${toPath(under)}" fill="${fibre}"/>`;
      }
      g += `<path d="${topD}" fill="${fill}"/>`;
      body += frames > 1 ? `<g class="f f${f}">${g}</g>` : g;
    }
    const op = o.opacity !== undefined ? ` opacity="${o.opacity}"` : '';
    return `<g class="pc"${op}${o.attrs ? ' ' + o.attrs : ''}>${body}</g>`;
  };
}

export interface InkOpts {
  width?: number;
  color?: string;
  /** Wobble of the hand-drawn line, in px. */
  wobble?: number;
  closed?: boolean;
  fill?: string;
  opacity?: number;
}

/** A hand-drawn ink or pencil line (whiskers, stitches, smiles). */
export function ink(points: Pt[], o: InkOpts = {}): Node {
  return (ctx) => {
    const seed = ctx.next();
    const color = o.color ?? '#2b1f16';
    const width = o.width ?? 3;
    const wob = o.wobble ?? 0.6;
    const smooth = points.length > 2 && !o.closed ? openCurve(points, 2) : points;
    let body = '';
    for (let f = 0; f < ctx.frames; f++) {
      const r = rng(seed + f * 31);
      const pts = smooth.map(([x, y]) => [x + (r() * 2 - 1) * wob, y + (r() * 2 - 1) * wob] as Pt);
      let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
      for (let i = 1; i < pts.length; i++) d += `L${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)}`;
      if (o.closed) d += 'Z';
      const p = `<path d="${d}" fill="${o.fill ?? 'none'}" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
      body += ctx.frames > 1 ? `<g class="f f${f}">${p}</g>` : p;
    }
    const op = o.opacity !== undefined ? ` opacity="${o.opacity}"` : '';
    return `<g class="pc"${op}>${body}</g>`;
  };
}

/** A small clean dot (eye highlights, freckles, stars). */
export function dot(cx: number, cy: number, r: number, fill: string, opacity?: number): Node {
  return () =>
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"${opacity !== undefined ? ` opacity="${opacity}"` : ''}/>`;
}

export interface GroupOpts {
  /** data-part name so animations can target it. */
  part?: string;
  /** Transform origin for animations, in local units. */
  origin?: Pt;
  transform?: string;
  opacity?: number;
  className?: string;
}

/** Groups nodes so they can be moved or animated as one part. */
export function group(o: GroupOpts, children: Node[]): Node {
  return (ctx) => {
    const attrs: string[] = [];
    if (o.part) attrs.push(`data-part="${o.part}"`);
    if (o.className) attrs.push(`class="${o.className}"`);
    if (o.transform) attrs.push(`transform="${o.transform}"`);
    if (o.opacity !== undefined) attrs.push(`opacity="${o.opacity}"`);
    if (o.origin) {
      attrs.push(`style="transform-origin:${o.origin[0]}px ${o.origin[1]}px;transform-box:view-box"`);
    }
    return `<g ${attrs.join(' ')}>${children.map((c) => c(ctx)).join('')}</g>`;
  };
}

/** Raw SVG markup for the rare thing the primitives can't express. */
export const raw =
  (markup: string): Node =>
  () =>
    markup;

export interface SvgOpts {
  /** viewBox width/height. */
  w: number;
  h: number;
  /** Name, used to seed the randomness (stable across builds). */
  name: string;
  /** Render boil frames (default true). */
  boil?: boolean;
  className?: string;
  /** Accessible label; omitted = decorative. */
  label?: string;
}

/** Renders a composition to an SVG string. */
export function svg(o: SvgOpts, children: Node[]): string {
  const seed = hashString(o.name);
  let counter = 0;
  const ctx: Ctx = {
    seed,
    next: () => (seed + ++counter * 104729) >>> 0,
    frames: o.boil === false ? 1 : BOIL_FRAMES,
  };
  const a11y = o.label ? `role="img" aria-label="${o.label}"` : 'aria-hidden="true"';
  return `<svg class="paper ${o.className ?? ''}" viewBox="0 0 ${o.w} ${o.h}" ${a11y} xmlns="http://www.w3.org/2000/svg">${children
    .map((c) => c(ctx))
    .join('')}</svg>`;
}

/** Torn rectangle background for HTML elements (tiles, cards, panels). */
export function tornRectPath(w: number, h: number, seed: number, rough = 1, inset = 4): string {
  return toPath(
    tear(rect(inset, inset, w - inset * 2, h - inset * 2, 6), seed, {
      wobble: EDGES.torn.wobble * rough,
      jag: EDGES.torn.jag * rough,
    }),
  );
}
