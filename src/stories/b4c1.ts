/**
 * Book 4, chapter 1: The Quidditch World Cup.
 *
 * A huge stadium at night. Slow paper fireworks bloom over the crowd, Moody
 * arrives and his magic eye whirrs round after the zooming players. A bee, a
 * sheep and a mermaid's tail turn up where they shouldn't, the rain comes
 * down, and then the golden snitch appears: you zoom after it on your broom
 * and catch it while the crowd stamps their feet and cheers.
 */
import { band, bell, C, circle, curve, defineStory, dot, ellipse, group, ink, noiseBurst, NOTE, now, piece, poly, rect, rng, svg, tone, type Node, type Pt } from './kit';

// ---------------------------------------------------------------------------
// Sounds made for this chapter
// ---------------------------------------------------------------------------

/** The stadium crowd cheering: a warm swell of voices. */
function crowdRoar(seconds = 2.4, peak = 0.1): void {
  const t = now();
  noiseBurst(t, { freq: 700, q: 0.8, peak, attack: 0.45, decay: seconds });
  noiseBurst(t, { freq: 1500, q: 1.2, peak: peak * 0.55, attack: 0.55, decay: seconds * 0.9 });
  noiseBurst(t, { freq: 260, type: 'lowpass', peak: peak * 0.8, attack: 0.4, decay: seconds });
  // A few "hooray" voices rising underneath.
  [220, 277, 330, 262, 196].forEach((f, i) =>
    tone(f, t + 0.15 + i * 0.07, { wave: 'sawtooth', peak: 0.022, attack: 0.35, decay: seconds * 0.8, vibrato: [5 + i, 7], lowpass: 1100, glideTo: f * 1.15 }),
  );
}

/** A broom zooming past, with a little drop in pitch as it goes by. */
function broomZoom(): void {
  const t = now();
  noiseBurst(t, { freq: 500, q: 1.5, peak: 0.1, attack: 0.25, decay: 0.12, sweepTo: 2600 });
  noiseBurst(t + 0.33, { freq: 2600, q: 1.5, peak: 0.09, attack: 0.01, decay: 0.45, sweepTo: 450 });
  tone(360, t, { wave: 'triangle', peak: 0.05, attack: 0.28, decay: 0.5, glideTo: 210, lowpass: 1500 });
}

/** A firework fizzing up into the sky. */
function fireworkFizz(): void {
  const t = now();
  noiseBurst(t, { freq: 1800, q: 0.9, peak: 0.05, attack: 0.15, decay: 0.65, sweepTo: 6000 });
  tone(380, t, { wave: 'triangle', peak: 0.03, attack: 0.1, decay: 0.7, glideTo: 1300 });
}

/** The firework opening: a soft pop, then gentle crackles and a twinkle. */
function fireworkPop(): void {
  const t = now();
  tone(150, t, { peak: 0.2, decay: 0.3, glideTo: 60 });
  noiseBurst(t, { freq: 1100, q: 0.6, peak: 0.13, decay: 0.4, sweepTo: 300 });
  const r = rng(Math.floor(Math.random() * 1e6));
  for (let i = 0; i < 9; i++) noiseBurst(t + 0.15 + r() * 0.8, { freq: 3500 + r() * 2500, q: 2, peak: 0.035, decay: 0.03 });
  [NOTE.E6, NOTE.G6].forEach((n, i) => bell(n, t + 0.2 + i * 0.12, 0.04, 0.6));
}

/** Moody's magic eye whirring round in its socket, ending on a click. */
function eyeWhirr(seconds = 1.2): void {
  const t = now();
  tone(240, t, { wave: 'square', peak: 0.035, attack: 0.08, decay: seconds, glideTo: 520, vibrato: [32, 30], lowpass: 900 });
  noiseBurst(t, { freq: 1800, q: 4, peak: 0.03, attack: 0.1, decay: seconds });
  for (let s = 0; s < seconds; s += 0.09) noiseBurst(t + s, { freq: 3200, q: 3, peak: 0.035, decay: 0.02 });
  tone(1200, t + seconds + 0.05, { peak: 0.08, decay: 0.05 });
}

/** A sheep's baa. */
function baa(): void {
  const t = now();
  tone(330, t, { wave: 'sawtooth', peak: 0.07, attack: 0.05, decay: 0.6, vibrato: [8, 18], lowpass: 1300, glideTo: 300 });
  tone(660, t, { wave: 'sawtooth', peak: 0.018, attack: 0.05, decay: 0.5, vibrato: [8, 30], lowpass: 2000, glideTo: 600 });
}

/** A bee buzzing about. */
function buzz(seconds = 1.6): void {
  const t = now();
  tone(190, t, { wave: 'sawtooth', peak: 0.045, attack: 0.1, decay: seconds, vibrato: [11, 22], lowpass: 800 });
  tone(380, t, { wave: 'sawtooth', peak: 0.015, attack: 0.1, decay: seconds, vibrato: [11, 40], lowpass: 1400 });
}

/** Rain pattering down. */
function rainPatter(seconds = 3): void {
  const t = now();
  noiseBurst(t, { freq: 5000, type: 'highpass', peak: 0.03, attack: 0.6, decay: seconds });
  for (let i = 0; i < 45; i++) noiseBurst(t + Math.random() * seconds, { freq: 2200 + Math.random() * 2200, q: 2, peak: 0.025 + Math.random() * 0.03, decay: 0.03 });
}

// ---------------------------------------------------------------------------
// Art
// ---------------------------------------------------------------------------

const PITCH = '#5c8550';
const STANDS = ['#3e2f52', '#5a3f6e', '#4a3560', '#6b4f86', '#553a62', '#6e5585'];

/** Point on the top arc of an ellipse at a given x. */
const arcY = (x: number, cx: number, cy: number, rx: number, ry: number): number => cy - ry * Math.sqrt(Math.max(0, 1 - ((x - cx) / rx) ** 2));

/** The World Cup stadium at night, like a pop-up book. */
function stadium(): string {
  const r = rng(404);
  const nodes: Node[] = [piece(rect(-20, -20, 1220, 860), C.night, { edge: 'clean', shadow: false })];

  // Stars.
  for (let i = 0; i < 40; i++) {
    const x = r() * 1180;
    const y = r() * 220;
    nodes.push(dot(x, y, 1.4 + r() * 2, r() > 0.8 ? C.goldLight : C.cream, 0.4 + r() * 0.4));
  }

  // Floodlight towers at the edges, with soft halos (below the corner buttons).
  for (const x of [56, 1124]) {
    nodes.push(piece(ellipse(x, 140, 90, 56), C.candle, { edge: 'clean', shadow: false, opacity: 0.12 }));
    nodes.push(piece(band([[x, 150], [x, 420]], 12), C.charcoal, { edge: 'cut' }));
    nodes.push(piece(rect(x - 34, 118, 68, 34, 4), C.slate, { edge: 'cut' }));
    for (let k = 0; k < 3; k++) nodes.push(piece(circle(x - 20 + k * 20, 135, 8), C.cream, { edge: 'cut', fibre: false, shadow: false }));
  }

  // The stands: tiers of seats, outer wall first.
  const cx = 590;
  const cy = 660;
  nodes.push(piece(ellipse(cx, cy, 800, 440), '#2c2240', { rough: 1.2 }));
  const tiers = 6;
  for (let i = 0; i < tiers; i++) {
    const rx = 780 - i * 18;
    const ry = 418 - i * 34;
    nodes.push(piece(ellipse(cx, cy, rx, ry), STANDS[i], { rough: 0.8, fibre: i === 0 ? undefined : false }));
  }
  // The crowd: little heads and scarves along each tier.
  const scarves = [C.red, C.green, C.gold, C.red, C.green, C.cream];
  const skins = [C.skin, C.skinShade, '#c69470', '#8a5a3b', C.skinPale];
  for (let i = 0; i < tiers; i++) {
    const rx = 780 - i * 18;
    const ry = 418 - i * 34;
    const n = 70 - i * 4;
    for (let k = 0; k < n; k++) {
      const a = Math.PI * (0.02 + (0.96 * (k + r() * 0.4)) / n);
      const x = cx + Math.cos(a) * (rx - 8);
      const y = cy - Math.sin(a) * (ry - 8) + 16;
      if (x < -10 || x > 1190) continue;
      nodes.push(dot(x, y + 7, 7, scarves[(k + i) % scarves.length]));
      nodes.push(dot(x, y - 2, 5, skins[Math.floor(r() * skins.length)]));
    }
  }

  // Flags on the rim of the stands.
  const flagCols = [C.red, C.green, C.gold, C.blue, C.green, C.red, C.gold];
  [110, 270, 440, 600, 760, 920, 1075].forEach((x, i) => {
    const y = arcY(x, cx, cy, 800, 440) + 6;
    nodes.push(ink([[x, y], [x, y - 70]], { width: 4, color: C.brownDark }));
    const f = i % 2 ? 1 : -1;
    nodes.push(piece(poly([[x, y - 70], [x + 52 * f, y - 58], [x + 6 * f, y - 44]]), flagCols[i], { edge: 'cut' }));
  });

  // The pitch.
  nodes.push(piece(ellipse(cx, 712, 740, 222), '#4a6e42', { rough: 1.2 }));
  nodes.push(piece(ellipse(cx, 716, 716, 206), PITCH, { fibre: false }));
  nodes.push(piece(ellipse(cx, 736, 560, 150), '#668f58', { edge: 'cut', fibre: false, shadow: false, opacity: 0.6 }));
  nodes.push(ink(ellipse(cx, 610, 110, 30), { closed: true, width: 3, color: C.white, opacity: 0.45 }));

  // Goal hoops at each end.
  const hoop = (x: number, top: number): Node[] => [
    piece(band([[x, top + 26], [x, 600]], 9), C.goldLight, { edge: 'cut', fibre: false }),
    ink(ellipse(x, top, 22, 27), { closed: true, width: 8, color: C.gold }),
  ];
  for (const [x, top] of [[120, 380], [178, 330], [236, 380], [944, 380], [1002, 330], [1060, 380]] as Pt[]) nodes.push(...hoop(x, top));

  return svg({ w: 1180, h: 820, name: 'b4c1-stadium', boil: false, className: 'backdrop' }, nodes);
}

/** A firework: rays of paper opening from the middle. */
function burst(color: string, tip: string, name: string): string {
  const c = 120;
  const nodes: Node[] = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const p = (rr: number, da = 0): Pt => [c + Math.cos(a + da) * rr, c + Math.sin(a + da) * rr];
    nodes.push(piece(poly([p(16, -0.12), p(94), p(16, 0.12)]), color, { edge: 'cut', fibre: false, shadow: false }));
    const [sx, sy] = p(106);
    const s = 9;
    nodes.push(piece(poly([[sx, sy - s], [sx + s * 0.3, sy - s * 0.3], [sx + s, sy], [sx + s * 0.3, sy + s * 0.3], [sx, sy + s], [sx - s * 0.3, sy + s * 0.3], [sx - s, sy], [sx - s * 0.3, sy - s * 0.3]]), tip, { edge: 'cut', fibre: false, shadow: false }));
  }
  nodes.push(piece(circle(c, c, 14), C.cream, { edge: 'cut', fibre: false }));
  return svg({ w: 240, h: 240, name, boil: false }, nodes);
}

/** The spark that rises before a firework opens. */
const spark = (): string =>
  svg({ w: 20, h: 60, name: 'b4c1-spark', boil: false }, [
    piece(poly([[7, 12], [13, 12], [11, 58], [9, 58]]), C.goldLight, { edge: 'cut', fibre: false, shadow: false, opacity: 0.5 }),
    piece(circle(10, 10, 8), C.candle, { edge: 'cut', fibre: false }),
  ]);

/** A little Quidditch player zooming along on a broom (facing right). */
function player(robe: string, cape: string, hair: string, name: string): string {
  return svg({ w: 220, h: 140, name, boil: false }, [
    piece(poly([[44, 94], [2, 74], [-6, 98], [4, 124], [46, 108]]), C.tan, { edge: 'cut' }),
    ink([[40, 98], [6, 84]], { width: 2, color: C.brown }),
    ink([[40, 104], [4, 110]], { width: 2, color: C.brown }),
    piece(band([[30, 102], [214, 92]], 9), C.wood, { edge: 'cut' }),
    piece(curve([[124, 44], [70, 40], [36, 70], [96, 84], [140, 70]], 2), cape),
    piece(curve([[100, 98], [104, 52], [128, 38], [152, 52], [158, 98]], 2), robe),
    piece(band([[122, 94], [140, 122]], 13), robe, { edge: 'cut' }),
    piece(band([[142, 60], [180, 88]], 12), robe, { edge: 'cut' }),
    piece(circle(182, 90, 7), C.skin, { edge: 'cut', fibre: false }),
    piece(circle(134, 28, 18), C.skin),
    piece(curve([[115, 26], [118, 9], [136, 4], [153, 12], [152, 22], [134, 16]], 2), hair, { fibre: false }),
    dot(143, 28, 2.6, C.ink),
    ink([[138, 37], [146, 37]], { width: 2 }),
  ]);
}

/** The hero's broom (the hero's portrait sits on it). */
const broom = (): string =>
  svg({ w: 300, h: 260, name: 'b4c1-broom', boil: false }, [
    piece(poly([[72, 222], [6, 196], [-6, 232], [8, 262], [74, 240]]), C.tan, { edge: 'cut' }),
    ink([[66, 226], [10, 212]], { width: 2.5, color: C.brown }),
    ink([[66, 232], [4, 236]], { width: 2.5, color: C.brown }),
    ink([[66, 238], [14, 254]], { width: 2.5, color: C.brown }),
    piece(band([[54, 236], [298, 214]], 13), C.wood, { edge: 'cut' }),
    piece(rect(68, 222, 12, 26, 3), C.brownDark, { edge: 'cut', fibre: false }),
    piece(circle(226, 220, 12), C.skin, { edge: 'cut' }),
  ]);

/** The golden snitch, with wings that can flutter. */
const snitch = (): string =>
  svg({ w: 140, h: 70, name: 'b4c1-snitch', boil: false, label: 'the golden snitch' }, [
    group({ className: 'wing', origin: [58, 36] }, [
      piece(curve([[58, 36], [30, 10], [2, 16], [10, 34], [40, 42]], 2), C.white, { edge: 'cut' }),
      ink([[54, 34], [16, 22]], { width: 1.5, color: C.stoneLight }),
    ]),
    group({ className: 'wing', origin: [82, 36] }, [
      piece(curve([[82, 36], [110, 10], [138, 16], [130, 34], [100, 42]], 2), C.white, { edge: 'cut' }),
      ink([[86, 34], [124, 22]], { width: 1.5, color: C.stoneLight }),
    ]),
    piece(circle(70, 40, 17), C.gold, { edge: 'cut' }),
    ink([[56, 34], [70, 44], [84, 34]], { width: 1.5, color: '#9a6f20' }),
    dot(64, 34, 4, C.goldLight),
  ]);

/** A paper version of Moody's magic eye, to lay over the portrait and spin. */
const magicEye = (): string =>
  svg({ w: 60, h: 60, name: 'b4c1-magic-eye', boil: false }, [
    piece(circle(30, 30, 25), C.white, { edge: 'cut' }),
    piece(circle(37, 25, 12), C.blue, { edge: 'clean', shadow: false }),
    piece(circle(38, 24, 5.5), C.ink, { edge: 'clean', shadow: false }),
    dot(35, 21, 2.4, C.white),
  ]);

/** A little water tank in the stands for a mermaid fan. */
const tank = (): string =>
  svg({ w: 170, h: 90, name: 'b4c1-tank', boil: false }, [
    piece(rect(6, 8, 158, 78, 10), C.teal),
    piece(curve([[10, 22], [50, 14], [90, 24], [130, 14], [160, 22], [160, 30], [10, 30]], 2), C.sky, { edge: 'cut', fibre: false }),
    piece(rect(14, 40, 30, 8, 4), C.sky, { edge: 'cut', fibre: false, shadow: false, opacity: 0.6 }),
    piece(rect(0, 0, 170, 12, 4), C.brown, { edge: 'cut' }),
  ]);

/** A raindrop. */
const drop = (): string =>
  svg({ w: 24, h: 40, name: 'b4c1-drop', boil: false }, [piece(curve([[12, 2], [22, 26], [12, 36], [2, 26]], 2), C.sky, { edge: 'cut', fibre: false })]);

// ---------------------------------------------------------------------------
// The show
// ---------------------------------------------------------------------------

export default defineStory({
  lines: {
    welcome: { who: 'moody', text: 'Welcome to the Quidditch World Cup! Keep your eyes open. Constant vigilance!' },
    eye: { who: 'moody', text: 'My magic eye spins all the way round. It sees everything!' },
    spot: { who: 'moody', text: 'A bee! A sheep! And… a mermaid’s tail? What a muddle!' },
    rain: { who: 'narrator', text: 'Then down comes the rain… but look! The golden snitch!' },
    catch: { who: 'narrator', text: 'You zoom after it… and catch it! The crowd stamps their feet!' },
    end: { who: 'moody', text: 'Brilliant flying, {name}! Even my magic eye couldn’t keep up!' },
  },

  async play(k) {
    k.backdrop(stadium());

    /** A slow paper firework: a spark rises, then the rays open and fade. */
    const firework = async (x: number, y: number, color: string, tip: string): Promise<void> => {
      const s = k.add(spark(), { x: x - 10, y: 300, w: 20, z: 3 });
      fireworkFizz();
      await k.to(s, 0.8, { y: y - 300, ease: 'power1.out' });
      k.remove(s);
      const b = k.add(burst(color, tip, `b4c1-burst-${color}`), { x: x - 110, y: y - 110, w: 220, z: 3 });
      k.set(b, { scale: 0.15, opacity: 1 });
      fireworkPop();
      await k.to(b, 1, { scale: 1, rotation: 12, ease: 'power2.out' });
      await k.to(b, 1.3, { opacity: 0, scale: 1.08, ease: 'power1.in' });
      k.remove(b);
    };

    // Curtains up on the stadium: the crowd cheers and fireworks bloom.
    crowdRoar(2.6, 0.08);
    await k.wait(500);
    void firework(250, 130, C.gold, C.cream);
    await k.wait(700);
    void firework(930, 110, C.rose, C.goldLight);
    await k.wait(900);

    // Mad-Eye Moody stumps in.
    const moody = k.character('moody', { x: 0, y: 360, w: 290, z: 20 });
    const sc = 290 / 300;
    const eye = k.add(magicEye(), { x: 0, y: 0, w: 60 * sc, still: true });
    eye.style.left = `${176 * sc - 30 * sc}px`;
    eye.style.top = `${144 * sc - 30 * sc}px`;
    moody.append(eye);
    k.fx.stomp(2, 0.35);
    await k.enter(moody, 'left', 0.8);
    await k.say('welcome', moody);

    // Players zoom past, and the magic eye spins after them.
    const green = k.add(player(C.green, C.greenDark, C.brownDark, 'b4c1-green'), { x: 0, y: 0, w: 180, z: 6, flip: true });
    const red = k.add(player(C.red, C.redDark, C.ginger, 'b4c1-red'), { x: 0, y: 0, w: 180, z: 6 });
    k.set(green, { x: 1220, y: 70, rotation: 4 });
    k.set(red, { x: -220, y: 190, rotation: -4 });
    broomZoom();
    eyeWhirr(1.3);
    void k.spin(eye, 2, 1.3);
    await k.to(green, 1.2, { x: -240, y: 40, ease: 'power1.inOut' });
    broomZoom();
    void k.to(red, 1.2, { x: 1240, y: 150, ease: 'power1.inOut' });
    await k.all(k.say('eye', moody), k.spin(eye, -1, 1));
    k.remove(green);
    k.remove(red);

    // Something odd at every corner: a bee, a sheep and a mermaid's tail.
    const bee = k.picture('bee', { x: 0, y: 0, w: 90, z: 25 });
    const sheep = k.picture('sheep', { x: 640, y: 500, w: 180, z: 12 });
    const tankEl = k.add(tank(), { x: 500, y: 410, w: 150, z: 9 });
    const tail = k.picture('tail', { x: 515, y: 335, w: 120, z: 8 });
    k.set(bee, { x: 1200, y: 260 });
    k.set(sheep, { opacity: 0 });
    k.set(tankEl, { opacity: 0 });
    k.set(tail, { opacity: 0, rotation: 180, transformOrigin: '50% 50%' });

    const odd = async (): Promise<void> => {
      // The bee buzzes round Moody's head.
      buzz(2.2);
      eyeWhirr(0.8);
      void k.spin(eye, 1, 0.8);
      await k.to(bee, 0.8, { x: 330, y: 330, ease: 'power1.inOut' });
      await k.to(bee, 0.45, { x: 220, y: 300, ease: 'none' });
      void k.shake(moody, 8, 2);
      await k.to(bee, 0.45, { x: 260, y: 400, ease: 'none' });
      await k.to(bee, 0.4, { x: 380, y: 360, ease: 'none' });
      // A sheep trots onto the pitch.
      k.set(sheep, { x: 560, opacity: 1 });
      k.fx.patter(8, 0.13);
      await k.walk(sheep, -560, 1.1, 4);
      baa();
      // A mermaid's tail pops up out of a tank in the stands.
      k.fx.splash();
      void k.appear(tankEl, 0.3);
      await k.appear(tail, 0.4);
      k.set(tail, { rotation: 180 });
      for (let i = 0; i < 2; i++) {
        await k.to(tail, 0.25, { rotation: 168, ease: 'sine.inOut' });
        await k.to(tail, 0.25, { rotation: 192, ease: 'sine.inOut' });
      }
      await k.to(tail, 0.2, { rotation: 180 });
    };
    await k.all(k.say('spot', moody), odd());
    // The bee buzzes off.
    buzz(0.9);
    void k.to(bee, 0.9, { x: 1220, y: 120, ease: 'power1.in' });
    baa();
    await k.hop(sheep, 24, 1);

    // The rain comes down.
    const clouds = [k.picture('rain', { x: 120, y: -30, w: 260, z: 7 }), k.picture('rain', { x: 520, y: -50, w: 280, z: 7 }), k.picture('rain', { x: 880, y: -20, w: 240, z: 7 })];
    rainPatter(4);
    await k.all(...clouds.map((c, i) => k.enter(c, 'top', 0.8 + i * 0.15)));
    if (!k.calm) {
      for (let i = 0; i < 14; i++) {
        const d = k.add(drop(), { x: 80 + ((i * 383) % 1020), y: 120, w: 18, z: 7 });
        void k.to(d, 1.1, { y: 380 + (i % 3) * 60, opacity: 0, delay: (i % 7) * 0.18, ease: 'power1.in' }).then(() => k.remove(d));
      }
    }

    // The golden snitch!
    const sn = k.add(snitch(), { x: 0, y: 0, w: 100, z: 30 });
    const wings = sn.querySelectorAll('.wing');
    k.set(wings[0], { svgOrigin: '58 36' });
    k.set(wings[1], { svgOrigin: '82 36' });
    if (!k.calm) void k.to(wings, 0.12, { scaleY: 0.35, repeat: -1, yoyo: true, ease: 'none' });
    k.set(sn, { x: 980, y: 200, scale: 0, opacity: 1 });
    void k.to(sn, 0.4, { scale: 1, ease: 'back.out(2)' });
    k.fx.twinkle();
    const snitchDance = async (): Promise<void> => {
      await k.to(sn, 0.7, { x: 780, y: 140 });
      await k.to(sn, 0.7, { x: 880, y: 250 });
      await k.to(sn, 0.6, { x: 760, y: 200 });
    };
    await k.all(k.say('rain'), snitchDance());

    // You zoom in on your broom and chase it.
    const rider = k.add(broom(), { x: 340, y: 90, w: 300, z: 28 });
    const hero = k.character('hero', { x: 62, y: 18, w: 180 });
    rider.insertBefore(hero, rider.firstChild);
    k.set(rider, { rotation: -6 });
    broomZoom();
    await k.enter(rider, 'left', 0.8);
    const chase = async (): Promise<void> => {
      broomZoom();
      void k.to(sn, 0.6, { x: 900, y: 110 });
      await k.to(rider, 0.7, { x: 260, y: -40, rotation: 4 });
      void k.to(sn, 0.6, { x: 820, y: 240 });
      await k.to(rider, 0.6, { x: 330, y: 50, rotation: -4 });
      // Got it! The snitch flies into your hand.
      broomZoom();
      await k.to(rider, 0.5, { x: 420, y: 20, rotation: 0 });
      await k.to(sn, 0.35, { x: 340 + 420 + 226 - 50, y: 90 + 20 + 220 - 40, scale: 0.8, ease: 'power2.in' });
      // Now it's in your hand: it flies wherever the broom goes.
      rider.append(sn);
      k.set(sn, { x: 226 - 50, y: 220 - 40 });
      k.fx.pop();
      k.sparkle(340 + 420 + 226, 90 + 20 + 220, 16, 140);
      await k.pop(rider, 1.1);
    };
    await k.all(k.say('catch'), chase());

    // The crowd goes wild: stamping feet, fireworks, confetti.
    crowdRoar(3, 0.12);
    k.fx.stomp(4, 0.3);
    // The front row's feet, stamping on the edge of the pitch.
    const feet = [k.picture('feet', { x: 285, y: 432, w: 90, z: 5 }), k.picture('feet', { x: 400, y: 424, w: 90, z: 5 }), k.picture('feet', { x: 690, y: 424, w: 90, z: 5 }), k.picture('feet', { x: 805, y: 432, w: 90, z: 5 })];
    for (const f of feet) void k.appear(f, 0.3).then(() => k.hop(f, 26, 3));
    void Promise.all(clouds.map((c) => k.exit(c, 'top', 0.9)));
    void k.glow(C.goldLight, 0.3, 1.2);
    k.confetti(36);
    void firework(600, 110, C.gold, C.cream);
    await k.wait(500);
    void firework(220, 150, C.sky, C.goldLight);
    void firework(980, 140, C.green, C.cream);
    await k.hop(rider, 40, 2);

    // Moody's verdict.
    eyeWhirr(1);
    void k.spin(eye, 2, 1);
    await k.say('end', moody);
    k.fx.jingle();
    k.sparkle(760, 300, 18, 200);
    await k.all(k.hop(rider, 36, 1), k.hop(moody, 14, 1), k.hop(sheep, 20, 1));
    await k.wait(1200);
  },
});
