/**
 * Book 1, chapter 3: The Hogwarts Express.
 *
 * The red steam train chuffs through the hills at sunset. Inside a
 * compartment, Neville has lost Trevor again: the toad hops out of a tin,
 * into a bin, over a pin and under a lid, then rides off on a toy pig, until
 * the hero floats him gently home with a spell. The train whistles, and
 * Hogwarts appears across the lake in the window.
 */
import { gsap } from 'gsap';
import { picture } from '../art/pictures';
import {
  bell,
  C,
  circle,
  curve,
  defineStory,
  dot,
  ellipse,
  group,
  ink,
  type Kit,
  noiseBurst,
  now,
  piece,
  poly,
  raw,
  rect,
  rng,
  svg,
  tone,
  type Node,
  type Pt,
} from './kit';

// ------------------------------------------------------------------ sounds

/** Soft steam chuffs: a strong beat then a light one. */
function chuff(beats = 2, gap = 0.24): void {
  const t = now();
  for (let i = 0; i < beats; i++) {
    const strong = i % 2 === 0;
    noiseBurst(t + i * gap, { freq: strong ? 650 : 1000, q: 0.8, peak: strong ? 0.13 : 0.08, attack: 0.01, decay: 0.17, sweepTo: 280 });
  }
}

/** A warm two-blast steam whistle: woo… wooo! */
function whistle(): void {
  const t = now();
  const blast = (at: number, len: number) => {
    for (const f of [587.33, 739.99, 880]) tone(f, at, { wave: 'triangle', peak: 0.05, attack: 0.07, decay: len, vibrato: [5, 4], lowpass: 2200 });
    noiseBurst(at, { freq: 2400, q: 1.5, peak: 0.035, attack: 0.07, decay: len });
  };
  blast(t, 0.3);
  blast(t + 0.42, 0.9);
}

/** Trevor's croaky "rib-bit". */
function ribbit(): void {
  const t = now();
  tone(230, t, { wave: 'sawtooth', peak: 0.13, attack: 0.015, decay: 0.12, glideTo: 180, vibrato: [36, 30], lowpass: 850 });
  tone(200, t + 0.17, { wave: 'sawtooth', peak: 0.13, attack: 0.015, decay: 0.16, glideTo: 140, vibrato: [36, 30], lowpass: 850 });
}

/** Something rattling about inside a tin. */
function rattle(hits = 6): void {
  const t = now();
  for (let i = 0; i < hits; i++) {
    const d = i * 0.075 + Math.random() * 0.02;
    noiseBurst(t + d, { freq: 3000 + Math.random() * 900, q: 6, peak: 0.07, decay: 0.05 });
    tone(1600 + Math.random() * 700, t + d, { wave: 'triangle', peak: 0.03, decay: 0.07 });
  }
}

/** A hollow bump in the bin. */
function clang(): void {
  const t = now();
  tone(120, t, { peak: 0.2, decay: 0.2, glideTo: 70 });
  bell(415, t, 0.05, 0.5);
  bell(622, t + 0.01, 0.03, 0.35);
}

/** The pot lid clinking down. */
function clink(): void {
  const t = now();
  bell(1250, t, 0.06, 0.3);
  bell(1480, t + 0.09, 0.04, 0.25);
}

/** The pin wobbling: a tiny bright ping. */
function ping(): void {
  const t = now();
  bell(1760, t, 0.05, 0.4);
  tone(2640, t + 0.02, { wave: 'sine', peak: 0.025, decay: 0.25 });
}

/** The toy pig's squeak. */
function squeak(): void {
  const t = now();
  tone(720, t, { wave: 'triangle', peak: 0.1, attack: 0.02, decay: 0.14, glideTo: 1150 });
  tone(1100, t + 0.17, { wave: 'triangle', peak: 0.08, attack: 0.02, decay: 0.16, glideTo: 760 });
}

// -------------------------------------------------------------------- art

/** A torn-paper hill line across a width. */
function hills(y: number, amp: number, color: string, seed: number, w = 1180, step = 90): Node {
  const r = rng(seed);
  const pts: Pt[] = [[-40, 900]];
  for (let x = -40; x <= w + 40; x += step) pts.push([x, y - r() * amp]);
  pts.push([w + 40, 900]);
  return piece(curve(pts, 2), color, { rough: 1.4 });
}

/** Sunset hills with a railway line along them. */
function hillsBackdrop(): string {
  const sleepers: Node[] = [];
  for (let x = -10; x < 1200; x += 34) sleepers.push(piece(rect(x, 604, 16, 12), C.brownDark, { edge: 'cut', fibre: false, shadow: false }));
  return svg({ w: 1180, h: 820, name: 'b1c3-hills', boil: false, className: 'backdrop' }, [
    piece(rect(-20, -20, 1220, 860), '#3d3a66', { edge: 'clean', shadow: false }),
    piece(rect(-20, 150, 1220, 300), '#6b5a8a', { rough: 2 }),
    piece(rect(-20, 280, 1220, 200), '#b9707a', { rough: 2.2 }),
    piece(rect(-20, 370, 1220, 120), '#e0a070', { rough: 2.2 }),
    piece(circle(860, 420, 74), C.goldLight, { rough: 0.8 }),
    piece(ellipse(260, 170, 110, 22), '#8a6f9a', { rough: 1.4, shadow: false }),
    piece(ellipse(330, 152, 70, 18), '#9a7faa', { rough: 1.4, shadow: false }),
    piece(ellipse(980, 230, 120, 20), '#c48a8a', { rough: 1.4, shadow: false }),
    hills(420, 70, '#5a4f7a', 11),
    hills(480, 50, C.greenDeep, 23),
    hills(545, 40, C.greenDark, 37),
    // the railway embankment and track
    piece(rect(-20, 598, 1220, 40), '#6b5040', { rough: 1.2 }),
    ...sleepers,
    piece(rect(-20, 598, 1220, 8), C.greyDark, { edge: 'cut', fibre: false }),
    hills(650, 24, C.green, 51, 1180, 120),
    hills(720, 16, '#5e8a4c', 63, 1180, 140),
  ]);
}

/** A train wheel that can spin. */
const wheel = (x: number, y: number, r: number): Node =>
  group({ className: 'b1c3-wheel' }, [
    piece(circle(x, y, r), C.ink, { edge: 'cut' }),
    piece(circle(x, y, r * 0.74), C.red, { edge: 'cut', fibre: false, shadow: false }),
    ink([[x - r * 0.7, y], [x + r * 0.7, y]], { width: 3, color: C.ink }),
    ink([[x, y - r * 0.7], [x, y + r * 0.7]], { width: 3, color: C.ink }),
    dot(x, y, r * 0.22, C.gold),
  ]);

/** A carriage: red, with warm lit windows. */
function carriage(x: number): Node[] {
  return [
    piece(rect(x + 10, 204, 250, 16, 4), C.ink, { edge: 'cut' }),
    piece(rect(x, 70, 270, 142, 14), C.red),
    piece(rect(x - 6, 54, 282, 24, 10), C.charcoal),
    ...[0, 1, 2, 3].map((i) => piece(rect(x + 20 + i * 62, 90, 44, 52, 8), C.candle, { edge: 'cut' })),
    piece(rect(x, 166, 270, 9), C.gold, { edge: 'cut', fibre: false }),
    wheel(x + 52, 230, 22),
    wheel(x + 218, 230, 22),
  ];
}

/** The Hogwarts Express (900 × 260), heading right. Chimney top at (810, 36). */
function train(): string {
  return svg({ w: 900, h: 260, name: 'b1c3-train' }, [
    ...carriage(20),
    piece(rect(286, 150, 30, 12), C.ink, { edge: 'cut', fibre: false }),
    ...carriage(312),
    piece(rect(578, 150, 30, 12), C.ink, { edge: 'cut', fibre: false }),
    // engine
    piece(rect(600, 196, 280, 24, 4), C.ink, { edge: 'cut' }),
    piece(rect(700, 104, 168, 96, 22), C.red),
    piece(rect(742, 104, 10, 96), C.gold, { edge: 'cut', fibre: false, shadow: false }),
    piece(rect(806, 104, 10, 96), C.gold, { edge: 'cut', fibre: false, shadow: false }),
    piece(ellipse(770, 104, 18, 14), C.gold),
    piece(poly([[798, 108], [794, 52], [782, 36], [838, 36], [826, 52], [822, 108]]), C.ink),
    piece(rect(856, 98, 28, 108, 10), C.charcoal),
    piece(circle(872, 126, 9), C.goldLight, { edge: 'cut' }),
    piece(rect(604, 60, 110, 142, 6), C.redDark),
    piece(rect(592, 46, 134, 22, 6), C.ink),
    piece(rect(624, 82, 64, 50, 8), C.candle, { edge: 'cut' }),
    piece(poly([[876, 200], [898, 240], [858, 240]]), C.charcoal, { edge: 'cut' }),
    piece(rect(652, 214, 104, 8, 4), C.gold, { edge: 'cut', fibre: false }),
    wheel(662, 222, 32),
    wheel(746, 222, 32),
    wheel(834, 230, 22),
  ]);
}

/** Inside a compartment: wood panels, red seats, a table under the window. */
function compartment(): string {
  const panel = (x: number) => piece(rect(x, 96, 280, 190, 12), '#7d5236', { edge: 'cut', rough: 1.2 });
  const seatBack = (x: number) => [
    piece(rect(x, 286, 350, 320, 30), C.red),
    ...[0, 1, 2].flatMap((i) => [0, 1].map((j) => dot(x + 70 + i * 105, 360 + j * 90, 6, C.redDark))),
  ];
  return svg({ w: 1180, h: 820, name: 'b1c3-compartment', boil: false, className: 'backdrop' }, [
    piece(rect(-20, -20, 1220, 700), C.brown, { edge: 'clean', shadow: false }),
    piece(rect(-20, -20, 1220, 96), C.brownDark, { rough: 1.4 }),
    panel(36),
    panel(864),
    // luggage rack with a trunk and a bag
    piece(rect(100, 14, 180, 52, 6), C.redDark),
    piece(rect(130, 14, 12, 52), C.gold, { edge: 'cut', fibre: false, shadow: false }),
    piece(rect(238, 14, 12, 52), C.gold, { edge: 'cut', fibre: false, shadow: false }),
    piece(rect(890, 24, 150, 42, 14), C.tan),
    piece(rect(942, 12, 46, 16, 8), C.brownDark, { edge: 'cut' }),
    piece(rect(-20, 64, 1220, 10, 4), C.gold, { edge: 'cut' }),
    // little wall lamps
    piece(ellipse(335, 160, 30, 30), C.candle, { edge: 'clean', shadow: false, opacity: 0.25 }),
    piece(rect(325, 146, 20, 30, 6), C.goldLight, { edge: 'cut' }),
    piece(ellipse(845, 160, 30, 30), C.candle, { edge: 'clean', shadow: false, opacity: 0.25 }),
    piece(rect(835, 146, 20, 30, 6), C.goldLight, { edge: 'cut' }),
    ...seatBack(-30),
    ...seatBack(860),
    // the table under the window
    piece(rect(588, 452, 24, 200, 6), C.brownDark),
    piece(ellipse(600, 650, 60, 10), C.brownDark, { edge: 'cut' }),
    piece(rect(396, 436, 408, 22, 6), C.wood),
    piece(rect(396, 452, 408, 8, 3), C.brownDark, { edge: 'cut', fibre: false, shadow: false }),
    // floor and runner
    piece(rect(-20, 640, 1220, 200), '#4a3326', { rough: 1.2 }),
    piece(poly([[330, 646], [850, 646], [960, 840], [220, 840]]), '#6b2e2a', { rough: 1.2 }),
    ink([[352, 656], [828, 656]], { width: 3, color: C.gold, opacity: 0.6 }),
  ]);
}

/** A seat cushion in front of the sitters, so they sit in the seat (360 × 90). */
function cushion(name: string): string {
  return svg({ w: 360, h: 90, name, boil: false }, [
    piece(rect(10, 46, 340, 40, 6), C.brownDark),
    piece(rect(0, 8, 360, 56, 22), C.redDark),
  ]);
}

/** The window frame and tied-back curtains (560 × 340). Glass is x 80–480, y 40–310. */
function windowFrame(): string {
  const curtain = (flip: boolean): Node[] => {
    const m = (p: Pt): Pt => (flip ? [560 - p[0], p[1]] : p);
    const drape: Pt[] = [[24, 6], [104, 6], [98, 110], [80, 190], [94, 300], [40, 326], [20, 200]];
    const fold: Pt[] = [[56, 20], [52, 120], [50, 190]];
    return [
      piece(curve(drape.map(m), 2), C.red),
      ink(fold.map(m), { width: 3, color: C.redDark, opacity: 0.7 }),
      piece(ellipse(...m([78, 196]), 20, 12), C.gold, { edge: 'cut' }),
    ];
  };
  return svg({ w: 560, h: 340, name: 'b1c3-window', boil: false }, [
    piece(rect(60, 18, 440, 30, 4), C.wood),
    piece(rect(60, 30, 28, 290, 4), C.wood),
    piece(rect(472, 30, 28, 290, 4), C.wood),
    piece(rect(48, 300, 464, 30, 6), C.wood),
    ...curtain(false),
    ...curtain(true),
  ]);
}

/** One 400-wide tile of hills and telegraph poles, repeated so it can scroll. */
function viewTile(ox: number): Node[] {
  // Heights repeat every 400 px so the scroll loops without a seam.
  const ridge = (y: number, a: number, f: number, ph: number): Pt[] => {
    const pts: Pt[] = [[ox - 30, 300]];
    for (let x = -30; x <= 430; x += 20) pts.push([ox + x, y - a * (0.5 + 0.5 * Math.sin(((x * f) / 400) * Math.PI * 2 + ph))]);
    pts.push([ox + 430, 300]);
    return pts;
  };
  return [
    piece(poly(ridge(170, 40, 2, 0.5)), '#5a4f7a', { rough: 1.2, shadow: false }),
    piece(poly(ridge(212, 30, 3, 2)), C.greenDeep, { rough: 1.2 }),
    piece(poly(ridge(246, 12, 4, 1)), C.greenDark, { rough: 1.2 }),
    piece(rect(ox + 120, 120, 7, 150), C.brownDark, { edge: 'cut' }),
    piece(rect(ox + 104, 128, 40, 6), C.brownDark, { edge: 'cut', fibre: false }),
    ink([[ox + 124, 132], [ox + 324, 140], [ox + 524, 132]], { width: 1.5, color: C.ink, opacity: 0.5 }),
    piece(rect(ox + 320, 120, 7, 150), C.brownDark, { edge: 'cut' }),
    piece(rect(ox + 304, 128, 40, 6), C.brownDark, { edge: 'cut', fibre: false }),
  ];
}

/** The view out of the window (400 × 270): sunset hills, then Hogwarts at night. */
function windowView(): string {
  const r = rng(77);
  const stars: Node[] = [];
  for (let i = 0; i < 22; i++) stars.push(dot(r() * 400, r() * 110, 1.5 + r() * 1.5, r() > 0.7 ? C.goldLight : C.cream, 0.6 + r() * 0.4));
  const tower = (x: number, top: number, w: number): Node[] => [
    piece(rect(x, top, w, 190 - top), C.nightLight, { rough: 0.6 }),
    piece(poly([[x - 6, top + 2], [x + w / 2, top - w * 1.2], [x + w + 6, top + 2]]), C.slate, { rough: 0.6 }),
  ];
  const win = (x: number, y: number) => piece(rect(x, y, 6, 10, 3), C.candle, { edge: 'cut', fibre: false, shadow: false });
  return svg({ w: 400, h: 270, name: 'b1c3-view', boil: false }, [
    group({ part: 'day' }, [
      piece(rect(-10, -10, 420, 290), '#6b5a8a', { edge: 'clean', shadow: false }),
      piece(rect(-10, 90, 420, 120), '#c88078', { rough: 1.6, shadow: false }),
      piece(circle(300, 150, 38), C.goldLight, { rough: 0.6 }),
      group({ part: 'scroll' }, [...viewTile(0), ...viewTile(400), ...viewTile(800)]),
    ]),
    group({ part: 'night', opacity: 0 }, [
      piece(rect(-10, -10, 420, 290), C.night, { edge: 'clean', shadow: false }),
      ...stars,
      piece(circle(340, 46, 20), C.cream, { rough: 0.6 }),
      piece(circle(350, 40, 17), C.night, { edge: 'cut', fibre: false, shadow: false }),
      piece(poly([[-10, 200], [60, 170], [140, 150], [240, 150], [330, 175], [410, 196], [410, 220], [-10, 220]]), '#2a3157', { rough: 1 }),
      ...tower(110, 110, 26),
      ...tower(160, 72, 32),
      ...tower(214, 96, 28),
      ...tower(262, 124, 24),
      piece(rect(96, 136, 210, 56), C.nightLight, { rough: 0.6 }),
      win(118, 124), win(170, 92), win(172, 120), win(222, 112), win(268, 140),
      win(112, 156), win(140, 164), win(176, 152), win(206, 166), win(236, 154), win(270, 166),
      // the lake, with the windows shining in it
      piece(rect(-10, 196, 420, 90), '#2a3a6a', { rough: 0.8 }),
      ...[118, 172, 206, 236, 270].map((x, i) => ink([[x - 8, 212 + (i % 2) * 10], [x + 10, 212 + (i % 2) * 10]], { width: 3, color: C.goldLight, opacity: 0.55 })),
      ink([[20, 236], [80, 236]], { width: 2, color: C.sky, opacity: 0.4 }),
      ink([[300, 246], [370, 246]], { width: 2, color: C.sky, opacity: 0.4 }),
      piece(poly([[-10, 256], [120, 248], [260, 254], [410, 246], [410, 290], [-10, 290]]), '#161b33', { rough: 1 }),
    ]),
  ]);
}

/** The chapter's pig as a pull-along toy on little wheels (400 × 400). */
function toyPig(): string {
  const pig = picture('pig').replace('<svg ', '<svg x="0" y="-20" width="400" height="400" ');
  return svg({ w: 400, h: 400, name: 'b1c3-toypig' }, [
    piece(ellipse(205, 382, 150, 12), 'rgba(40,25,10,0.18)', { edge: 'cut', fibre: false, shadow: false }),
    ink([[70, 200], [36, 270], [30, 340], [46, 372]], { width: 4, color: C.cream }),
    piece(rect(108, 314, 200, 20, 8), C.wood, { edge: 'cut' }),
    raw(pig),
    ...[140, 276].map((x) =>
      group({ className: 'b1c3-wheel' }, [
        piece(circle(x, 350, 28), C.blue, { edge: 'cut' }),
        ink([[x - 18, 350], [x + 18, 350]], { width: 3, color: C.blueDark }),
        dot(x, 350, 7, C.gold),
      ]),
    ),
  ]);
}

/** A full-stage dark cover for changing scenes. */
const cover = `<div style="width:100%;height:100%;background:${C.night}"></div>`;

// ---------------------------------------------------------------- helpers

/** Where an actor really is now (its placed corner plus its tween offset). */
function at(el: HTMLElement): [number, number] {
  return [(parseFloat(el.style.left) || 0) + Number(gsap.getProperty(el, 'x')), (parseFloat(el.style.top) || 0) + Number(gsap.getProperty(el, 'y'))];
}

/** A hop along an arc to an absolute stage spot (the actor's top-left). */
function jump(k: Kit, el: HTMLElement, x: number, y: number, height: number, seconds: number): Promise<void> {
  const bx = parseFloat(el.style.left) || 0;
  const by = parseFloat(el.style.top) || 0;
  const peak = Math.min(at(el)[1], y) - height;
  return k.all(
    k.to(el, seconds, { x: x - bx, ease: 'none' }),
    k.to(el, seconds / 2, { y: peak - by, ease: 'power2.out' }).then(() => k.to(el, seconds / 2, { y: y - by, ease: 'power2.in' })),
  );
}

/** Spins every wheel inside an actor, until the story ends (not in calm mode). */
function spinWheels(k: Kit, el: HTMLElement, seconds = 0.5): gsap.core.Tween | null {
  if (k.calm) return null;
  return gsap.to(el.querySelectorAll('.b1c3-wheel'), { rotation: '+=360', transformOrigin: '50% 50%', duration: seconds, repeat: -1, ease: 'steps(6)' });
}

const z = (el: HTMLElement, n: number) => (el.style.zIndex = String(n));

/**
 * Lets an actor sit *inside* a tin, bin or pot: while a rim line is set,
 * everything of the actor below it is clipped away, every frame, wherever
 * the actor moves. Returns a setter (null = no clipping).
 */
function rimClip(el: HTMLElement): (rimY: number | null) => void {
  let rim: number | null = null;
  const tick = () => {
    if (!el.isConnected) return gsap.ticker.remove(tick);
    if (rim === null) {
      el.style.clipPath = '';
      return;
    }
    const h = el.offsetHeight || parseFloat(el.style.height) || 0;
    const hide = Math.max(0, Math.min(h, h - (rim - at(el)[1])));
    el.style.clipPath = hide > 0 ? `inset(0px 0px ${hide}px 0px)` : '';
  };
  gsap.ticker.add(tick);
  return (rimY) => {
    rim = rimY;
    tick();
  };
}

// ------------------------------------------------------------------ story

export default defineStory({
  lines: {
    train: { who: 'narrator', text: 'All aboard! The red train chuffs over the hills… all the way to Hogwarts.' },
    lost: { who: 'neville', text: 'Oh no… has anyone seen my toad? Trevor’s gone again!' },
    catch: { who: 'trevor', text: 'Ribbit! Catch me if you can!' },
    chase: { who: 'narrator', text: 'Out of the tin… into the bin… over the pin… under the lid!' },
    pig: { who: 'narrator', text: 'Wheee! Now he’s riding a toy pig! You wave your wand…' },
    thanks: { who: 'neville', text: 'Trevor! You found him, {name}! Thank you!' },
    hogwarts: { who: 'trevor', text: 'Ribbit! Look out of the window… it’s Hogwarts!' },
  },

  async play(k) {
    // ---- Outside: the train chuffs through the sunset hills.
    k.backdrop(hillsBackdrop());
    const engine = k.add(train(), { x: 140, y: 348, w: 900, h: 260, z: 20 });
    k.set(engine, { x: -1080 });
    const wheels = spinWheels(k, engine, 0.45);
    let steaming = true;
    void (async () => {
      while (steaming) {
        const [x] = at(engine);
        if (x + 810 > -60 && x + 810 < 1240) k.puff(x + 812, 360, 110, '#ece6d8');
        chuff(2, 0.24);
        await k.wait(500);
      }
    })();
    await k.to(engine, 1.6, { x: 0, ease: 'power1.out' });
    whistle();
    await k.all(k.say('train'), k.to(engine, 3, { x: 90, ease: 'none' }));
    await k.to(engine, 0.9, { x: 1400, ease: 'power1.in' });
    steaming = false;

    // ---- Change scene behind a quick dark cover.
    const curtain = k.add(cover, { x: 0, y: 0, w: 1180, h: 820, z: 60 });
    k.set(curtain, { opacity: 0 });
    await k.fade(curtain, 1, 0.4);
    wheels?.kill();
    k.remove(engine);
    k.caption('');
    k.backdrop(compartment());

    const view = k.add(windowView(), { x: 390, y: 110, w: 400, h: 270, z: 2, still: true });
    view.style.overflow = 'hidden';
    const scroll = view.querySelector<SVGGElement>('[data-part="scroll"]');
    const night = view.querySelector<SVGGElement>('[data-part="night"]');
    if (scroll && !k.calm) gsap.to(scroll, { x: -400, duration: 3, repeat: -1, ease: 'steps(36)' });
    k.add(windowFrame(), { x: 310, y: 70, w: 560, h: 340, z: 3 });

    const neville = k.character('neville', { x: 40, y: 318, z: 20 });
    const hero = k.character('hero', { x: 890, y: 318, z: 20, flip: true });
    k.set(hero, { opacity: 0 });
    k.add(cushion('b1c3-seat-l'), { x: -30, y: 586, z: 25 });
    k.add(cushion('b1c3-seat-r'), { x: 860, y: 586, z: 25 });

    // The five words, around the compartment. Rim lines (stage y) are where
    // Trevor disappears into the tin, the bin and the pot.
    const tin = k.picture('tin', { x: 430, y: 330, w: 130, z: 14 });
    const TIN_RIM = 370;
    const lid = k.picture('lid', { x: 590, y: 262, w: 200, z: 14 });
    const POT_RIM = 390;
    const lidTop = lid.querySelector<SVGGElement>('[data-part="lid"]');
    // The picture shows the lid lifted; it starts shut on the pot.
    const LID_SHUT = { y: 66, rotation: 10 };
    if (lidTop) k.set(lidTop, { ...LID_SHUT, transformOrigin: '50% 50%' });
    const bin = k.picture('bin', { x: 300, y: 486, w: 190, z: 14 });
    const BIN_RIM = 552;
    const pin = k.picture('pin', { x: 470, y: 560, w: 110, z: 13 });
    const pig = k.add(toyPig(), { x: 690, y: 509, w: 160, z: 15 });
    const lidTo = (seconds: number, vars: gsap.TweenVars & { ease?: string }) => (lidTop ? k.to(lidTop, seconds, vars) : Promise.resolve());

    // Trevor starts hidden in the tin.
    const trevor = k.character('trevor', { x: 445, y: 330, w: 100, z: 12 });
    const sinkBelow = rimClip(trevor);
    sinkBelow(TIN_RIM);
    k.set(trevor, { opacity: 0 });

    chuff(4, 0.3);
    await k.fade(curtain, 0, 0.5);
    k.remove(curtain);
    k.fx.whizz();
    await k.enter(hero, 'right');

    // ---- Something rattles in the tin…
    rattle();
    await k.shake(tin, 5, 2);
    await k.shake(neville, 6, 1);
    await k.say('lost', neville);
    rattle(8);
    await k.shake(tin, 6, 2);
    // …and two eyes peek out over the top!
    k.set(trevor, { opacity: 1 });
    ribbit();
    await k.to(trevor, 0.35, { y: -28, ease: 'back.out(2)' });
    await k.say('catch', trevor);

    // ---- The chase: tin, bin, pin, lid.
    const chase = async () => {
      // Out of the tin…
      k.fx.boing();
      await jump(k, trevor, 445, 220, 0, 0.45);
      await k.wait(250);
      sinkBelow(BIN_RIM);
      // …into the bin…
      await jump(k, trevor, 345, 520, 70, 0.9);
      clang();
      await k.shake(bin, 5, 2);
      // (peeking out of the bin)
      await k.to(trevor, 0.25, { y: BIN_RIM - 68 - 330, ease: 'back.out(2)' });
      await k.wait(350);
      // …over the pin…
      k.fx.boing();
      await k.to(trevor, 0.3, { y: '-=110', ease: 'power2.out' });
      sinkBelow(null);
      z(trevor, 30);
      void k.shake(pin, 4, 2);
      ping();
      await jump(k, trevor, 570, 545, 60, 0.8);
      k.fx.thud();
      await k.wait(300);
      // …under the lid!
      k.fx.boing();
      void lidTo(0.35, { y: -70, rotation: -20, ease: 'power2.out' });
      await jump(k, trevor, 640, 220, 0, 0.5);
      z(trevor, 13);
      sinkBelow(POT_RIM);
      await jump(k, trevor, 640, 410, 0, 0.35);
      await lidTo(0.2, { ...LID_SHUT, ease: 'power2.in' });
      clink();
    };
    await k.all(k.say('chase'), chase());

    // Peeking out from under the lid, giggling.
    await lidTo(0.15, { y: -10, rotation: -6, ease: 'power2.out' });
    await k.to(trevor, 0.2, { y: POT_RIM - 68 - 330, ease: 'back.out(2)' });
    ribbit();
    await k.wait(250);

    // ---- Off he springs, onto the toy pig, and away!
    void lidTo(0.3, { y: -110, rotation: 25, ease: 'power2.out' }).then(() => lidTo(0.4, { ...LID_SHUT, ease: 'bounce.out' }).then(clink));
    k.fx.boing();
    await k.to(trevor, 0.25, { y: '-=90', ease: 'power2.out' });
    sinkBelow(null);
    z(trevor, 30);
    await jump(k, trevor, 738, 478, 60, 0.6);
    squeak();
    await k.pop(pig, 1.08);
    const pigWheels = spinWheels(k, pig, 0.4);
    k.fx.patter(12, 0.13);
    const ride = async () => {
      // Zoom left (stopping short of the pin), then turn and zoom back.
      await k.all(k.to(pig, 1.3, { x: -150, ease: 'sine.inOut' }), k.to(trevor, 1.3, { x: '-=150', ease: 'sine.inOut' }));
      squeak();
      k.face(pig, true);
      k.set(trevor, { x: '-=16' });
      await k.all(k.to(pig, 1.1, { x: -40, ease: 'sine.inOut' }), k.to(trevor, 1.1, { x: '+=110', ease: 'sine.inOut' }));
    };
    await k.all(k.say('pig'), ride());
    pigWheels?.kill();

    // ---- The spell: Trevor floats gently home to Neville.
    const [hx, hy] = at(hero);
    const [tx, ty] = at(trevor);
    k.fx.spell();
    await k.beam([hx + 45, hy + 172], [tx + 50, ty + 50], C.goldLight, 0.45);
    k.fx.twinkle();
    k.sparkle(tx + 50, ty + 40, 12, 110);
    await k.to(trevor, 1.0, { y: '-=150', rotation: -10, ease: 'sine.inOut' });
    await jump(k, trevor, 170, 470, 20, 1.4);
    k.set(trevor, { rotation: 0 });
    ribbit();
    await k.all(k.hop(neville, 20, 2), k.hop(trevor, 20, 2));
    await k.say('thanks', neville);

    // ---- The whistle blows: Hogwarts across the lake!
    whistle();
    if (night) void k.to(night, 1.6, { opacity: 1, ease: 'sine.inOut' });
    void k.glow(C.candle, 0.25, 1.6);
    await k.wait(500);
    await k.say('hogwarts', trevor);

    k.fx.jingle();
    k.confetti(36);
    k.sparkle(590, 240, 16, 220);
    // Seated puppets only bounce a little, so the seat still hides their edge.
    await k.all(k.hop(hero, 20, 2), k.hop(neville, 20, 2), k.hop(trevor, 40, 2));
    ribbit();
    await k.wait(700);
  },
});
