/**
 * Book 1, chapter 1: Hagrid's Hut.
 *
 * A cosy evening by Hagrid's fire. His hat starts to wiggle… and out pops a
 * rat! The cat on the mat wakes up and chases it round and round the mat, a
 * bat flaps down from the rafters and knocks off Hagrid's hat, and everyone
 * tumbles into one funny heap (with the bat wearing the hat). Hagrid laughs
 * his big belly laugh and hands you your Hogwarts letter: next stop, Diagon
 * Alley (the next chapter).
 */
import { band, bell, C, circle, curve, defineStory, dot, ellipse, ink, noiseBurst, NOTE, now, piece, poly, rect, rng, svg, tone, type Kit, type Node, type Pt } from './kit';

// ------------------------------------------------------------------ sounds

/** The fire: a soft low roar with little pops and crackles. */
function crackle(seconds = 3): void {
  const t = now();
  noiseBurst(t, { freq: 500, type: 'lowpass', peak: 0.025, attack: 0.5, decay: seconds });
  const n = Math.round(seconds * 5);
  for (let i = 0; i < n; i++) {
    const dt = Math.random() * seconds;
    noiseBurst(t + dt, { freq: 2200 + Math.random() * 3000, q: 3, peak: 0.03 + Math.random() * 0.04, attack: 0.002, decay: 0.015 + Math.random() * 0.03 });
  }
}

/** A little rat's squeak (muffled when it's still inside the hat). */
function squeak(count = 1, gap = 0.16, muffled = false): void {
  const t = now();
  for (let i = 0; i < count; i++) {
    const f = 1400 + Math.random() * 400;
    tone(f, t + i * gap, { wave: 'triangle', peak: muffled ? 0.05 : 0.07, attack: 0.01, decay: 0.09, glideTo: f * 1.35, vibrato: [30, 50], lowpass: muffled ? 1300 : 3800 });
  }
}

/** A low, sleepy cat purr. */
function purr(): void {
  tone(55, now(), { wave: 'sawtooth', peak: 0.035, attack: 0.4, decay: 1.8, lowpass: 250, vibrato: [22, 6] });
}

/** A little "mrrow" as the cat wakes. */
function mrrow(): void {
  const t = now();
  tone(520, t, { wave: 'triangle', peak: 0.1, attack: 0.03, decay: 0.3, glideTo: 820, vibrato: [7, 20], lowpass: 2400 });
  tone(800, t + 0.28, { wave: 'triangle', peak: 0.1, attack: 0.03, decay: 0.3, glideTo: 480, vibrato: [7, 20], lowpass: 2400 });
}

/** Soft, leathery bat-wing flaps. */
function flaps(count = 4, gap = 0.18): void {
  const t = now();
  for (let i = 0; i < count; i++) noiseBurst(t + i * gap, { freq: 520, q: 0.8, peak: 0.09, attack: 0.03, decay: 0.1, sweepTo: 240 });
}

/** Hagrid's big, warm belly laugh: "huh-huh-ho-ho-ho". */
function bellyLaugh(): void {
  const t = now();
  [196, 188, 178, 168, 158, 148].forEach((f, i) => {
    const dt = i * 0.19;
    noiseBurst(t + dt, { freq: 800, q: 1.2, peak: 0.035, attack: 0.01, decay: 0.06 });
    tone(f, t + dt + 0.02, { wave: 'sawtooth', peak: 0.13, attack: 0.025, decay: 0.13, glideTo: f * 0.82, lowpass: 650 });
    tone(f * 2, t + dt + 0.02, { wave: 'triangle', peak: 0.04, attack: 0.025, decay: 0.1, glideTo: f * 1.6, lowpass: 1200 });
  });
}

/** The letter arrives: a warm chord with bells on top. */
function letterChime(): void {
  const t = now();
  [NOTE.C4, NOTE.E4, NOTE.G4, NOTE.C5].forEach((f, i) =>
    tone(f, t + i * 0.1, { wave: 'triangle', peak: 0.05, attack: 0.15, decay: 1.6, lowpass: 2200, vibrato: [5, 2] }),
  );
  [NOTE.E6, NOTE.G6, NOTE.C7].forEach((f, i) => bell(f, t + 0.5 + i * 0.1, 0.06, 1.2));
}

// --------------------------------------------------------------------- art

const WALL = '#5e4838';
const STONES = ['#6c5442', '#735a47', '#664e3d', '#7a604b', '#6f5644'];
const CHIMNEY = ['#8d847a', '#968c80', '#857c72', '#9a9184'];

/** A round-topped arch outline (windows, the fireplace). */
function arch(x0: number, x1: number, top: number, bottom: number): Pt[] {
  const cx = (x0 + x1) / 2;
  const rx = (x1 - x0) / 2;
  const spring = top + rx * 0.7;
  const pts: Pt[] = [[x0, bottom], [x0, spring]];
  for (let i = 1; i < 12; i++) {
    const a = Math.PI + (i / 12) * Math.PI;
    pts.push([cx + Math.cos(a) * rx, spring + Math.sin(a) * rx * 0.7]);
  }
  pts.push([x1, spring], [x1, bottom]);
  return pts;
}

/** Rows of rounded stones filling a rectangle. */
function stones(x0: number, x1: number, y0: number, y1: number, colors: string[], seed: number, rowH = 44): Node[] {
  const r = rng(seed);
  const out: Node[] = [];
  for (let row = 0, y = y0; y < y1; row++, y += rowH) {
    let x = x0 - 30 + (row % 2) * 40;
    while (x < x1) {
      const w = 60 + r() * 46;
      const l = Math.max(x, x0);
      const rr = Math.min(x + w, x1);
      if (rr - l > 20) out.push(piece(rect(l + 3, y + 3, rr - l - 6, Math.min(rowH - 6, y1 - y - 6), 13), colors[Math.floor(r() * colors.length)], { rough: 0.7, fibre: false }));
      x += w;
    }
  }
  return out;
}

/** Hagrid's hut: stone walls, rafters, a night window and a big warm fireplace. */
function hut(): string {
  const r = rng(1101);
  const nodes: Node[] = [
    piece(rect(-20, -20, 1220, 600), WALL, { edge: 'clean', shadow: false }),
    ...stones(-20, 1200, 96, 552, STONES, 11),
    // Ceiling and the big rafter beam.
    piece(rect(-20, -20, 1220, 70), '#3a2a1f', { edge: 'clean', shadow: false }),
    ...[90, 330, 760, 1000].map((x) => piece(rect(x, -10, 26, 64), '#4a3426', { edge: 'cut' })),
    piece(rect(-20, 50, 1220, 38), C.brownDark, { rough: 0.8 }),
  ];

  // The window: a starry night over the Forbidden Forest.
  nodes.push(
    piece(arch(60, 260, 136, 322), C.wood, { rough: 0.8 }),
    piece(arch(76, 244, 152, 306), C.night, { edge: 'cut', fibre: false, shadow: false }),
  );
  for (let i = 0; i < 9; i++) nodes.push(dot(90 + r() * 140, 170 + r() * 60, 1.5 + r() * 1.5, C.cream, 0.8));
  nodes.push(
    piece(circle(206, 190, 16), C.cream, { edge: 'cut', fibre: false }),
    piece(circle(198, 184, 14), C.night, { edge: 'clean', shadow: false }),
  );
  for (let x = 80; x < 240; x += 22) {
    const top = 246 + r() * 26;
    nodes.push(piece(poly([[x - 4, 306], [x + 11, top], [x + 26, 306]]), r() > 0.5 ? C.greenDeep : '#24402f', { edge: 'cut', fibre: false, shadow: false }));
  }
  nodes.push(
    piece(rect(155, 150, 10, 158), C.wood, { edge: 'cut' }),
    piece(rect(76, 228, 168, 9), C.wood, { edge: 'cut' }),
    piece(rect(50, 314, 220, 16, 3), C.brownDark, { rough: 0.8 }),
  );

  // Things hanging from the rafter: onions, herbs, copper pans and a ham.
  nodes.push(ink([[132, 88], [134, 180]], { width: 2, color: C.ink, opacity: 0.7 }));
  [[128, 108], [140, 126], [128, 146], [140, 164], [132, 182]].forEach(([x, y], i) =>
    nodes.push(piece(circle(x, y, 11), i % 2 ? C.tan : C.sand, { edge: 'cut' })),
  );
  nodes.push(ink([[290, 88], [290, 104]], { width: 2, color: C.ink, opacity: 0.7 }));
  [[-22, 160], [-8, 170], [6, 166], [20, 156]].forEach(([dx, y], i) =>
    nodes.push(piece(band([[290, 102], [290 + dx, y]], 9), i % 2 ? C.green : C.greenDark, { edge: 'cut', fibre: false })),
  );
  nodes.push(piece(rect(282, 98, 16, 10, 3), C.red, { edge: 'cut', fibre: false }));
  nodes.push(
    piece(rect(690, 186, 110, 8, 2), C.brownDark, { edge: 'cut' }),
    piece(band([[722, 192], [722, 222]], 6), C.brownDark, { edge: 'cut', fibre: false }),
    piece(circle(722, 248, 27), C.rust, { edge: 'cut' }),
    piece(circle(714, 240, 8), C.orange, { edge: 'clean', shadow: false, opacity: 0.5 }),
    piece(band([[770, 192], [770, 268]], 6), C.stoneLight, { edge: 'cut', fibre: false }),
    piece(ellipse(770, 274, 13, 9), C.stoneLight, { edge: 'cut' }),
    ink([[1132, 88], [1132, 108]], { width: 2, color: C.ink, opacity: 0.7 }),
    piece(curve([[1132, 108], [1160, 140], [1152, 194], [1112, 194], [1104, 140]]), C.rose, { rough: 0.8 }),
    piece(curve([[1132, 150], [1146, 170], [1132, 186], [1118, 170]]), C.pink, { fibre: false, shadow: false }),
    piece(circle(1132, 110, 8), C.cream, { edge: 'cut' }),
  );

  // The fireplace, glowing warm.
  nodes.push(
    piece(circle(520, 450, 260), C.candle, { edge: 'clean', shadow: false, opacity: 0.1 }),
    piece(rect(370, 86, 300, 470), '#7d746a', { rough: 0.8 }),
    ...stones(370, 670, 96, 300, CHIMNEY, 23, 40),
    piece(rect(345, 288, 350, 26, 4), C.wood, { rough: 0.8 }),
    piece(rect(362, 312, 316, 10), C.brownDark, { edge: 'cut' }),
    ...stones(370, 670, 322, 552, CHIMNEY, 29, 40),
    piece(arch(402, 638, 312, 540), C.stoneLight, { rough: 0.8 }),
    piece(arch(420, 620, 330, 540), '#22160e', { rough: 0.8 }),
    piece(ellipse(520, 500, 90, 46), C.orange, { edge: 'clean', shadow: false, opacity: 0.25 }),
    // On the mantelpiece: jars, a candle and a big blue teapot.
    piece(rect(380, 246, 30, 42, 6), C.teal, { edge: 'cut' }),
    piece(rect(420, 256, 26, 32, 6), C.sand, { edge: 'cut' }),
    piece(rect(417, 250, 32, 8, 2), C.brownDark, { edge: 'cut', fibre: false }),
    piece(rect(500, 240, 14, 48, 3), C.cream, { edge: 'cut' }),
    piece(ellipse(507, 230, 6, 10), C.candle, { edge: 'cut', fibre: false, shadow: false }),
    piece(band([[630, 268], [656, 246]], 8), C.blue, { edge: 'cut', fibre: false }),
    piece(ellipse(606, 266, 32, 23), C.blue, { edge: 'cut' }),
    piece(circle(606, 242, 8), C.blueDark, { edge: 'cut', fibre: false }),
    ink([[576, 258], [566, 266], [576, 276]], { width: 4, color: C.blueDark }),
  );

  // The floor.
  nodes.push(
    piece(rect(-20, 552, 1220, 300), '#7b5538', { rough: 0.8, shadow: false }),
    piece(rect(-20, 544, 1220, 14), '#4e3424', { edge: 'cut' }),
    ...[600, 646].map((y) => ink([[-10, y], [1190, y + 2]], { width: 2.5, color: '#4e3424', opacity: 0.45 })),
    ...[[160, 558, 600], [880, 558, 600], [300, 602, 646], [1000, 602, 646]].map(([x, a, b]) =>
      ink([[x, a], [x + 2, b]], { width: 2.5, color: '#4e3424', opacity: 0.45 }),
    ),
    piece(rect(384, 528, 272, 30, 4), C.stoneLight, { rough: 0.8 }),
    piece(ellipse(520, 610, 300, 60), C.candle, { edge: 'clean', shadow: false, opacity: 0.1 }),
  );

  return svg({ w: 1180, h: 820, name: 'b1c1-hut', boil: false, className: 'backdrop' }, nodes);
}

/** The front edge of the floor, in front of everyone (hides the portraits' cut edges). */
function floorFront(): string {
  const r = rng(41);
  const top: Pt[] = [];
  for (let x = -20; x <= 1200; x += 80) top.push([x, 8 + r() * 10]);
  return svg({ w: 1180, h: 160, name: 'b1c1-front', boil: false }, [
    piece(poly([...top, [1200, 200], [-20, 200]]), '#5e3e2a', { rough: 1.4 }),
    ink([[-10, 46], [1190, 50]], { width: 2.5, color: '#3e2818', opacity: 0.4 }),
  ]);
}

/** Crackling flames on two logs (180 × 150). Boils, so it flickers by itself. */
function fireArt(): string {
  return svg({ w: 180, h: 150, name: 'b1c1-fire' }, [
    piece(poly([[18, 140], [24, 96], [44, 70], [50, 100], [64, 40], [80, 74], [90, 6], [104, 64], [120, 34], [128, 84], [148, 60], [158, 104], [162, 140]]), C.orange, { fibre: false, shadow: false }),
    piece(poly([[38, 140], [44, 104], [60, 90], [70, 58], [84, 96], [94, 40], [106, 92], [120, 70], [128, 108], [142, 140]]), C.gold, { fibre: false, shadow: false }),
    piece(poly([[60, 140], [66, 112], [80, 100], [90, 72], [100, 104], [114, 94], [120, 140]]), C.candle, { fibre: false, shadow: false }),
    piece(band([[20, 126], [160, 144]], 16), C.brownDark, { rough: 0.8 }),
    piece(band([[22, 144], [158, 128]], 16), C.brown, { rough: 0.8 }),
    piece(circle(158, 128, 7), C.tan, { edge: 'cut', fibre: false }),
    dot(60, 138, 3, C.orange),
    dot(118, 134, 3, C.gold),
    dot(90, 141, 2.5, C.orange),
  ]);
}

/** Closed sleepy eyelids for the cat (100 × 40). */
function lidsArt(): string {
  return svg({ w: 100, h: 40, name: 'b1c1-lids', boil: false }, [
    piece(ellipse(20, 20, 19, 20), C.orange, { edge: 'cut', fibre: false, shadow: false }),
    piece(ellipse(80, 20, 19, 20), C.orange, { edge: 'cut', fibre: false, shadow: false }),
    ink([[6, 20], [20, 28], [34, 20]], { width: 3 }),
    ink([[66, 20], [80, 28], [94, 20]], { width: 3 }),
  ]);
}

/** A Hogwarts letter: thick parchment, emerald ink and a red wax seal (200 × 140). */
function letterArt(): string {
  return svg({ w: 200, h: 140, name: 'b1c1-letter', boil: false }, [
    piece(rect(8, 10, 184, 122, 4), '#efdcae', { edge: 'cut' }),
    ink([[10, 14], [100, 74], [190, 14]], { width: 2.5, color: C.tan }),
    ink([[26, 100], [40, 96], [54, 102], [68, 96], [80, 100]], { width: 3, color: C.greenDark }),
    ink([[26, 114], [42, 110], [58, 116], [74, 111], [92, 114], [104, 110]], { width: 3, color: C.greenDark }),
    piece(circle(100, 74, 17), C.red, { rough: 0.6 }),
    piece(circle(100, 74, 9), C.redDark, { edge: 'cut', fibre: false, shadow: false }),
  ]);
}

// ------------------------------------------------------------------- story

type Vars = Parameters<Kit['to']>[2];

/** An actor plus the point it "stands" on (its anchor), so it can be moved by that point. */
interface Prop {
  el: HTMLElement;
  /** Placed box. */
  L: number;
  T: number;
  W: number;
  H: number;
  /** Anchor, as fractions of the box. */
  fx: number;
  fy: number;
  /** Where the anchor is now. */
  X: number;
  Y: number;
}

/** The loop round the mat that the cat chases the rat along. */
const LOOP = (a: number): Pt => [600 + 180 * Math.cos(a), 614 + 32 * Math.sin(a)];
/** Where everyone ends up in a heap. */
const HEAP = { cat: [610, 642], rat: [614, 548], bat: [606, 488], hat: [618, 452] } as const;

export default defineStory({
  lines: {
    hello: { who: 'hagrid', text: 'Come in, come in! Sit by the fire… and mind the cat on the mat!' },
    wiggle: { who: 'hagrid', text: 'Eh? What’s that? My hat’s gone all… wiggly!' },
    rat: { who: 'narrator', text: 'Pop! A rat jumps out of Hagrid’s hat… and the cat wakes up!' },
    chase: { who: 'narrator', text: 'Round and round the mat… the cat chases the rat!' },
    heap: { who: 'hagrid', text: 'Ho ho! A cat, a rat, a bat… and my hat! What a heap!' },
    letter: { who: 'hagrid', text: 'Now then… this is for you. Your very own Hogwarts letter!' },
    end: { who: 'hagrid', text: 'You’re a wizard, {name}! Tomorrow, we’re off to Diagon Alley!' },
  },

  async play(k) {
    let done = false;

    k.backdrop(hut());
    k.add(floorFront(), { x: 0, y: 660, w: 1180, h: 160, z: 30, still: true });
    k.music('cosy');
    k.dim(0.2);
    k.light(520, 470, 380, { color: C.candle, strength: 0.5, flicker: true });
    k.light(160, 230, 130, { color: C.sky, strength: 0.25 });
    k.ambient('embers', { area: [400, 300, 240, 260], count: 12, z: 36 });
    const fire = k.add(fireArt(), { x: 430, y: 390, w: 180, h: 150, z: 4 });
    k.set(fire, { transformOrigin: '50% 100%' });
    k.picture('mat', { x: 400, y: 350, w: 400, z: 6, still: true });

    const prop = (el: HTMLElement, L: number, T: number, W: number, fx: number, fy: number): Prop => ({ el, L, T, W, H: W, fx, fy, X: L + W * fx, Y: T + W * fy });
    /** The x/y offsets that put a prop's anchor at (X, Y) when scaled by s. */
    const off = (p: Prop, X: number, Y: number, s = 1) => ({
      x: X - p.L - p.W / 2 - (p.fx - 0.5) * p.W * s,
      y: Y - p.T - p.H / 2 - (p.fy - 0.5) * p.H * s,
    });
    const go = (p: Prop, X: number, Y: number, seconds: number, vars: Vars = {}, scale?: number): Promise<void> => {
      p.X = X;
      p.Y = Y;
      return k.to(p.el, seconds, { ...vars, ...off(p, X, Y, scale ?? 1), ...(scale !== undefined ? { scale } : {}) });
    };
    /** A leap in an arc. */
    const arc = async (p: Prop, X: number, Y: number, seconds: number, lift: number, vars: Vars = {}, scale?: number): Promise<void> => {
      await go(p, (p.X + X) / 2, Math.min(p.Y, Y) - lift, seconds / 2, { ease: 'power1.out' });
      await go(p, X, Y, seconds / 2, { ease: 'power1.in', ...vars }, scale);
    };

    // The cat, dozing on the mat by the fire.
    const catEl = k.picture('cat', { x: 425, y: 483, w: 150, z: 20 });
    const cat = prop(catEl, 425, 483, 150, 0.5, 0.88);
    const lids = k.add(lidsArt(), { x: 475, y: 525, w: 50, h: 20, z: 21, still: true });
    // A bat asleep upside down in the rafters.
    const batEl = k.picture('bat', { x: 540, y: 35, w: 140, z: 9 });
    const bat = prop(batEl, 540, 35, 140, 0.5, 0.5);
    k.set(batEl, { rotation: 180 });
    const wingL = batEl.querySelector<SVGElement>('[data-part="wingL"]');
    const wingR = batEl.querySelector<SVGElement>('[data-part="wingR"]');
    const wings = (l: number, s: number) =>
      wingL && wingR ? k.all(k.to(wingL, s, { rotation: l, svgOrigin: '200 190' }), k.to(wingR, s, { rotation: -l, svgOrigin: '200 190' })) : k.wait(s * 1000);
    const flap = async (times: number) => {
      flaps(times, 0.2);
      for (let i = 0; i < times; i++) {
        await wings(24, 0.1);
        await wings(-12, 0.1);
      }
      await wings(0, 0.08);
    };

    const hagrid = k.character('hagrid', { x: 790, y: 250, w: 380, z: 10 });
    const hero = k.character('hero', { x: 30, y: 350, w: 300, z: 15 });
    // The rat hides on Hagrid's head, under his hat.
    const ratEl = k.picture('rat', { x: 930, y: 232, w: 110, z: 11 });
    const rat = prop(ratEl, 930, 232, 110, 0.5, 0.78);
    const hatEl = k.picture('hat', { x: 815, y: 72, w: 330, z: 12 });
    const hat = prop(hatEl, 815, 72, 330, 0.5, 0.75);
    // While it's on his head, the hat turns about Hagrid's middle so it bobs with him.
    const ON_HEAD = '165px 393px';
    k.set(hatEl, { transformOrigin: ON_HEAD });
    k.set([hagrid, hatEl, hero, ratEl], { opacity: 0 });

    let hatOn = true;
    const hagridSays = async (key: 'hello' | 'wiggle' | 'heap' | 'letter' | 'end'): Promise<void> => {
      const stop = hatOn ? k.talk(hatEl) : () => {};
      await k.say(key, hagrid);
      stop();
    };

    // The fire crackles and flickers all the way through.
    void (async () => {
      while (!done) {
        crackle(3);
        await k.wait(3000);
      }
    })();
    if (!k.calm) {
      void (async () => {
        while (!done) {
          await k.to(fire, 0.5, { scaleY: 1.07, scaleX: 0.97, ease: 'sine.inOut' });
          await k.to(fire, 0.5, { scaleY: 0.95, scaleX: 1.02, ease: 'sine.inOut' });
        }
      })();
    }
    // Asleep: the cat breathes and purrs, the bat sways.
    let asleep = true;
    void (async () => {
      while (asleep) {
        await k.to(catEl, 1.1, { scaleY: 1.03, transformOrigin: '50% 88%', ease: 'sine.inOut' });
        if (!asleep) break;
        await k.to(catEl, 1.1, { scaleY: 1, ease: 'sine.inOut' });
      }
    })();
    void (async () => {
      while (asleep) {
        purr();
        await k.wait(2200);
      }
    })();
    if (!k.calm) {
      void (async () => {
        while (asleep) {
          await k.to(batEl, 1.4, { rotation: 176, ease: 'sine.inOut' });
          if (!asleep) break;
          await k.to(batEl, 1.4, { rotation: 184, ease: 'sine.inOut' });
        }
      })();
    }
    await k.wait(400);

    // ---- Hagrid stomps in, hat and all; you come in from the cold.
    k.fx.stomp(3, 0.3);
    k.set([hagrid, hatEl], { x: 520, opacity: 1 });
    await k.all(
      k.to([hagrid, hatEl], 1, { x: 0, ease: 'power2.out' }),
      k.wait(400).then(() => {
        k.fx.creak();
        return k.enter(hero, 'left', 0.8);
      }),
    );
    k.fx.boing();
    await k.hop(hero, 30);
    await hagridSays('hello');

    // ---- Something is wriggling under the hat…
    void k.camera({ zoom: 1.4, x: 920, y: 300 }, 1.0);
    k.set(hatEl, { transformOrigin: '50% 75%' });
    squeak(2, 0.3, true);
    for (const [rot, dy] of [[7, -8], [-6, 0], [6, -10], [-5, 0], [0, 0]]) await k.to(hatEl, 0.12, { rotation: rot, y: dy, ease: 'none' });
    k.set(hatEl, { transformOrigin: ON_HEAD });
    await hagridSays('wiggle');

    // ---- Out pops a rat!
    k.set(hatEl, { transformOrigin: '50% 75%' });
    k.set(ratEl, { opacity: 1, y: 34 });
    k.fx.pop();
    squeak(2);
    await k.all(k.to(hatEl, 0.3, { y: -60, rotation: -14, ease: 'back.out(2)' }), k.to(ratEl, 0.3, { y: 0, ease: 'back.out(2)' }));
    await k.pop(ratEl, 1.15);

    await k.all(
      k.say('rat'),
      (async () => {
        await k.wait(900);
        // The rat leaps down onto the mat, and the hat drops back on.
        k.face(ratEl, true);
        k.fx.whizz();
        k.music('adventure');
        void k.camera({ zoom: 1.25, x: 620, y: 560 }, 0.9);
        ratEl.style.zIndex = '22';
        await k.all(arc(rat, LOOP(0)[0], LOOP(0)[1], 0.7, 120), k.wait(250).then(() => k.to(hatEl, 0.35, { y: 0, rotation: 0, ease: 'bounce.out' })));
        k.fx.thud();
        k.set(hatEl, { transformOrigin: ON_HEAD });
        await k.wait(300);
        // The cat wakes up with a start.
        asleep = false;
        k.remove(lids);
        mrrow();
        k.fx.boing();
        await k.all(k.pop(catEl, 1.18), k.hop(catEl, 30));
      })(),
    );

    // ---- Round and round the mat!
    await k.all(
      k.say('chase'),
      (async () => {
        k.fx.whizz();
        await k.to(catEl, 0.12, { scaleY: 0.85, scaleX: 1.1, transformOrigin: '50% 88%' });
        void k.to(catEl, 0.15, { scaleX: 1, scaleY: 1 });
        await arc(cat, LOOP(-1.3)[0], LOOP(-1.3)[1], 0.4, 40, { rotation: 10 });
        const STEP = Math.PI / 6;
        for (let i = 1; i <= 15; i++) {
          const ra = i * STEP;
          const ca = ra - 1.3;
          const [rx, ry] = LOOP(ra);
          const [cx, cy] = LOOP(ca);
          k.face(ratEl, rx < rat.X);
          const catLeft = cx < cat.X;
          // Whoever is nearer the front of the mat is in front.
          ratEl.style.zIndex = Math.sin(ra) > Math.sin(ca) ? '22' : '19';
          if (i % 3 === 1) squeak(2, 0.12);
          if (i % 2) k.fx.patter(3, 0.06);
          const bounce = i % 2 ? -10 : 0;
          await k.all(go(rat, rx, ry + bounce, 0.2, { ease: 'none' }), go(cat, cx, cy + bounce, 0.2, { ease: 'none', rotation: catLeft ? -10 : 10 }));
        }
        await k.to(catEl, 0.15, { rotation: 0 });
      })(),
    );

    // ---- The bat wakes up and flaps down from the rafters…
    void k.camera({}, 0.8);
    await k.to(batEl, 0.1, { rotation: 180 });
    await k.shake(batEl, 4, 1);
    batEl.style.zIndex = '24';
    await k.all(flap(5), go(bat, 640, 250, 0.8, { rotation: 360, ease: 'power1.inOut' }));
    // … swoops at Hagrid's head…
    await k.all(flap(3), go(bat, 900, 210, 0.6, { rotation: 380, ease: 'power2.in' }));
    // … and knocks off his hat!
    hatOn = false;
    k.set(hatEl, { transformOrigin: '50% 50%' });
    hatEl.style.zIndex = '25';
    k.fx.boing();
    squeak(2);
    await k.all(go(hat, 840, 300, 0.5, { rotation: -200, ease: 'power2.out' }), k.shake(hagrid, 6, 1), go(bat, 820, 300, 0.5, { rotation: 330 }));

    // Everyone tumbles into one big heap.
    k.fx.whizz();
    ratEl.style.zIndex = '21';
    k.face(ratEl, false);
    await k.all(
      arc(cat, HEAP.cat[0], HEAP.cat[1], 0.5, 60, { rotation: -8 }),
      k.wait(250).then(() => arc(rat, HEAP.rat[0], HEAP.rat[1], 0.55, 120, { rotation: 10 })),
      k.wait(450).then(() => go(bat, HEAP.bat[0], HEAP.bat[1], 0.5, { rotation: 348, ease: 'power2.in' })),
      k.wait(700).then(() => go(hat, HEAP.hat[0], HEAP.hat[1], 0.6, { rotation: -374, ease: 'power2.in' }, 0.62)),
    );
    k.fx.thud();
    void k.to(catEl, 0.12, { scaleY: 0.85, scaleX: 1.12, transformOrigin: '50% 88%' }).then(() => k.to(catEl, 0.15, { scaleX: 1, scaleY: 1, ease: 'back.out(3)' }));
    k.puff(620, 600, 230);
    void wings(-18, 0.2);
    await k.quake(5);
    k.sparkle(614, 420, 10, 110);
    await k.wait(250);

    // ---- Hagrid laughs and laughs.
    bellyLaugh();
    await k.all(k.shake(hagrid, 7, 4), k.wait(300).then(() => k.pop(hatEl, 1.08)));
    await hagridSays('heap');

    // ---- Your Hogwarts letter!
    const letter = k.add(letterArt(), { x: 860, y: 520, w: 150, h: 105, z: 40, still: true });
    k.music('magic');
    k.fx.twinkle();
    await k.appear(letter, 0.45);
    await hagridSays('letter');
    await k.hop(letter, 20);
    k.sfx.whoosh();
    await k.to(letter, 0.45, { x: -340, y: -130, rotation: -20, ease: 'power2.out' });
    await k.to(letter, 0.45, { x: -680, y: 0, rotation: -6, scale: 1.25, ease: 'power2.in' });
    letterChime();
    k.sparkle(255, 572, 18, 180);
    await k.all(k.glow(C.candle, 0.35, 1.4), k.all(k.hop(hero, 40), k.hop(letter, 40)));
    await hagridSays('end');

    // ---- Hooray!
    k.fx.jingle();
    k.confetti(36);
    void k.pop(hatEl, 1.12);
    await k.all(k.all(k.hop(hero, 50, 2), k.hop(letter, 50, 2)), k.pop(hagrid, 1.06));
    await k.wait(1600);
    done = true;
  },
});
