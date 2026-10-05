/**
 * Book 4, chapter 3: The Black Lake.
 *
 * Gulp! The gillyweed gives you flippers and down you swim into the green
 * lake. Moaning Myrtle floats along, giggling, to show the way. A cheeky
 * grindylow tugs your flipper, so you give it an old boot, which it wears
 * as a hat. The merpeople sing, your friend is tied to a stone statue, you
 * lift the weedy rope off its hook, grab a sunken broom and zoom up to
 * splash out under the moon while everyone cheers.
 */
import { band, bell, C, circle, curve, defineStory, dot, ellipse, ink, noiseBurst, NOTE, now, piece, poly, rect, rng, svg, tone, type Kit, type Node, type Pt } from './kit';

// ------------------------------------------------------------------ sounds

/** Swallowing the gillyweed: two soft, low gulps. */
function gulp(): void {
  const t = now();
  tone(340, t, { peak: 0.18, decay: 0.13, glideTo: 150 });
  tone(300, t + 0.2, { peak: 0.14, decay: 0.12, glideTo: 130 });
}

/** Deep, round underwater bubbles: blub, blub, blub. */
function blub(count = 5): void {
  const t = now();
  noiseBurst(t, { freq: 500, type: 'lowpass', peak: 0.05, attack: 0.25, decay: 0.9 });
  for (let i = 0; i < count; i++) {
    tone(170 + Math.random() * 110, t + i * 0.15 + Math.random() * 0.05, { peak: 0.11, attack: 0.01, decay: 0.13, glideTo: 480 + Math.random() * 220, lowpass: 1400 });
  }
}

/** Myrtle's giggle that turns into a ghostly wail: hee-hee-hee… oooOOOooo. */
function giggleWail(): void {
  const t = now();
  [880, 780, 880, 740].forEach((f, i) => tone(f, t + i * 0.11, { wave: 'triangle', peak: 0.08, attack: 0.01, decay: 0.08, vibrato: [9, 14], lowpass: 2200 }));
  tone(540, t + 0.52, { peak: 0.1, attack: 0.14, decay: 0.55, glideTo: 820, vibrato: [5.5, 22] });
  tone(820, t + 1.16, { peak: 0.09, attack: 0.05, decay: 0.75, glideTo: 460, vibrato: [5.5, 22] });
}

/** The grindylow's squeaky little snigger. */
function snigger(): void {
  const t = now();
  [1250, 1100, 1250, 1100, 1300].forEach((f, i) => tone(f, t + i * 0.08, { wave: 'triangle', peak: 0.06, attack: 0.005, decay: 0.06, lowpass: 3000 }));
}

/** The merpeople's song: an eerie-pretty bell tune over a soft, wobbly hum. */
function merSong(): void {
  const t = now();
  tone(NOTE.A3, t, { peak: 0.05, attack: 0.6, decay: 3.2, vibrato: [4, 2] });
  tone(NOTE.E4, t + 0.2, { peak: 0.035, attack: 0.6, decay: 3, vibrato: [4.5, 3] });
  const melody: Array<[number, number]> = [[NOTE.E5, 0], [NOTE.A5, 0.45], [NOTE.G5, 0.9], [NOTE.E5, 1.3], [NOTE.D5, 1.75], [NOTE.E5, 2.2], [NOTE.A4, 2.75]];
  for (const [f, dt] of melody) {
    bell(f, t + dt, 0.08, 1.5);
    tone(f, t + dt, { peak: 0.035, attack: 0.1, decay: 0.5, vibrato: [5, 6] });
  }
}

/** Bursting up out of the water. */
function bigSplash(): void {
  const t = now();
  noiseBurst(t, { freq: 1800, q: 0.5, peak: 0.24, attack: 0.01, decay: 0.75, sweepTo: 380 });
  tone(150, t, { peak: 0.16, decay: 0.22, glideTo: 420 });
  [0.12, 0.2, 0.28, 0.38, 0.5].forEach((d) => tone(800 + Math.random() * 700, t + d, { peak: 0.05, decay: 0.07, glideTo: 1700 }));
}

/** A happy crowd far away on the shore. */
function cheer(): void {
  const t = now();
  noiseBurst(t, { freq: 1100, q: 0.6, peak: 0.08, attack: 0.35, decay: 1.8 });
  noiseBurst(t + 0.1, { freq: 2200, q: 1.2, peak: 0.04, attack: 0.3, decay: 1.5 });
}

// -------------------------------------------------------------------- art

const WATER = { top: '#6fa49a', a: '#5e968f', b: '#4e8584', c: '#41767a', far: '#386a70', deep: '#2f5d64' };
const STONE = { light: '#97a29a', mid: '#7d8a83', dark: '#606d68', moss: '#5f7d55' };
const WEED = '#3f6b4c';
const WEED_DARK = '#2c4a3a';

/** A wavy-topped layer that runs off the bottom of the stage. */
function layer(y: number, amp: number, color: string, seed: number, step = 90): Node {
  const r = rng(seed);
  const pts: Pt[] = [[-40, 900]];
  for (let x = -40; x <= 1220; x += step) pts.push([x, y - r() * amp]);
  pts.push([1220, 900]);
  return piece(curve(pts, 2), color, { rough: 1.3 });
}

/** A tall wavy strand of lake weed. */
function strand(x: number, base: number, height: number, lean: number, w: number, color: string): Node {
  const pts: Pt[] = [];
  for (let i = 0; i <= 5; i++) pts.push([x + Math.sin(i * 1.3) * 14 + (lean * i) / 5, base - (height * i) / 5]);
  return piece(band(pts, w), color, { rough: 1.1 });
}

/** A ring of a bubble (an outline with a shine). */
function bubble(x: number, y: number, r: number): Node[] {
  return [
    ink(Array.from({ length: 17 }, (_, i) => [x + Math.cos((i / 16) * Math.PI * 2) * r, y + Math.sin((i / 16) * Math.PI * 2) * r] as Pt), { width: 2.5, color: '#d8ece4', opacity: 0.6 }),
    dot(x - r * 0.35, y - r * 0.35, Math.max(1.5, r * 0.22), '#eef7f0', 0.7),
  ];
}

/** The stone merperson statue your friend is tied to. */
function statue(): Node[] {
  return [
    // rock it stands on
    piece(curve([[840, 720], [850, 580], [910, 540], [1090, 536], [1150, 590], [1160, 720]], 2), STONE.dark),
    piece(ellipse(930, 600, 46, 18), STONE.moss, { fibre: false, opacity: 0.8 }),
    piece(ellipse(1100, 580, 34, 12), STONE.moss, { fibre: false, opacity: 0.8 }),
    // the tail curling down into the rock, with a fin
    piece(band([[985, 545], [1000, 470], [975, 410], [990, 350]], 64), STONE.mid),
    piece(poly([[1005, 520], [1070, 488], [1052, 530], [1078, 566], [1010, 552]]), STONE.mid),
    // a trident
    piece(band([[1092, 110], [1092, 540]], 12), STONE.dark),
    piece(poly([[1066, 150], [1070, 96], [1080, 140], [1092, 80], [1104, 140], [1114, 96], [1118, 150]]), STONE.dark, { edge: 'cut' }),
    // body, arm and head
    piece(curve([[925, 390], [935, 280], [985, 250], [1040, 280], [1052, 390]], 2), STONE.light),
    piece(band([[1035, 290], [1070, 320], [1088, 300]], 22), STONE.light),
    piece(ellipse(990, 196, 44, 50), STONE.light),
    piece(curve([[946, 190], [952, 150], [990, 136], [1030, 150], [1036, 190], [1010, 170], [970, 170]], 2), STONE.mid),
    ink([[968, 200], [976, 196], [984, 200]], { width: 3, color: STONE.dark }),
    ink([[996, 200], [1004, 196], [1012, 200]], { width: 3, color: STONE.dark }),
    ink([[978, 222], [990, 226], [1002, 222]], { width: 3, color: STONE.dark }),
    piece(ellipse(960, 300, 14, 8), STONE.moss, { fibre: false, opacity: 0.7 }),
  ];
}

/** Under the Black Lake: green-blue water, sunbeams, weed, mer-houses and the statue. */
function underwater(): string {
  const r = rng(77);
  const shafts: Node[] = [180, 470, 760, 1010].map((x, i) =>
    piece(poly([[x - 30, -20], [x + 40, -20], [x + 150 + i * 10, 620], [x - 40, 620]]), '#e9f4dc', { edge: 'cut', fibre: false, shadow: false, opacity: 0.1 }),
  );
  const hut = (x: number, y: number, s: number): Node[] => [
    piece(curve([[x - 50 * s, y], [x - 44 * s, y - 50 * s], [x, y - 70 * s], [x + 44 * s, y - 50 * s], [x + 50 * s, y]], 2), '#3b6e74'),
    piece(ellipse(x, y - 14 * s, 13 * s, 18 * s), '#24474e', { edge: 'cut', fibre: false, shadow: false }),
  ];
  const pebbles: Node[] = Array.from({ length: 12 }, () => {
    const x = 60 + r() * 1060;
    return piece(ellipse(x, 640 + r() * 40, 14 + r() * 16, 7 + r() * 6), r() > 0.5 ? STONE.dark : '#56625c', { fibre: false });
  });
  const bubbles: Node[] = [];
  for (let i = 0; i < 14; i++) bubbles.push(...bubble(40 + r() * 1100, 30 + r() * 480, 4 + r() * 8));
  return svg({ w: 1180, h: 820, name: 'b4c3-lake', boil: false, className: 'backdrop' }, [
    piece(rect(-20, -20, 1220, 860), WATER.top, { edge: 'clean', shadow: false }),
    layer(150, 30, WATER.a, 3, 120),
    layer(300, 34, WATER.b, 5, 120),
    layer(430, 30, WATER.c, 7, 120),
    // the surface far above, rippling
    piece(curve([[-40, -40], [1220, -40], [1220, 26], [900, 40], [600, 22], [300, 42], [-40, 24]], 2), '#a6cfc2', { fibre: false, opacity: 0.55 }),
    ...shafts,
    // far rocks and the merpeople's round stone houses
    layer(500, 40, WATER.far, 11, 100),
    ...hut(620, 520, 1),
    ...hut(740, 510, 0.75),
    ...hut(190, 520, 0.8),
    layer(560, 26, WATER.deep, 13, 110),
    // weed along the edges
    strand(20, 700, 520, 30, 26, WEED_DARK),
    strand(70, 700, 420, -20, 22, WEED),
    strand(1150, 700, 560, -30, 26, WEED_DARK),
    strand(800, 640, 220, 20, 18, WEED_DARK),
    strand(560, 640, 180, -16, 16, WEED_DARK),
    ...statue(),
    // the muddy lake bed
    layer(620, 22, '#55704f', 17, 100),
    ...pebbles,
    layer(668, 14, '#465f45', 19, 120),
    ...bubbles,
  ]);
}

/** A clump of weed that sways (an actor), 140 × 360. */
function weedClump(name: string, color = WEED): string {
  return svg({ w: 140, h: 360, name }, [
    strand(40, 360, 330, 20, 20, color),
    strand(80, 360, 270, -24, 18, WEED_DARK),
    strand(110, 360, 210, 16, 16, color),
  ]);
}

/** Green webbed flippers (gillyweed!), 200 × 90. */
function flippers(): string {
  const foot = (x: number, s: number): Node[] => [
    piece(poly([[x - 12 * s, 0], [x + 12 * s, 0], [x + 30 * s, 50], [x + 46 * s, 86], [x - 6 * s, 82], [x - 22 * s, 40]]), '#5f9a6a', { rough: 0.8 }),
    ink([[x, 10], [x + 4 * s, 76]], { width: 2.5, color: '#3f6b4c' }),
    ink([[x + 4 * s, 10], [x + 24 * s, 74]], { width: 2.5, color: '#3f6b4c' }),
  ];
  return svg({ w: 200, h: 90, name: 'b4c3-flippers' }, [...foot(66, -1), ...foot(134, 1)]);
}

/** A friendly merperson, singing, 220 × 320. */
function merperson(name: string, hair: string, tail: string, tailDark: string): string {
  const skin = '#a9c8b4';
  return svg({ w: 220, h: 320, name, label: 'a merperson' }, [
    piece(curve([[60, 70], [110, 26], [162, 70], [176, 160], [150, 200], [70, 200], [44, 160]], 2), hair),
    piece(band([[108, 200], [110, 250], [130, 282], [168, 292]], 46), tail),
    piece(poly([[160, 268], [212, 248], [196, 290], [214, 318], [160, 308]]), tailDark),
    ...[[100, 220], [118, 240], [102, 258], [128, 268]].map(([x, y]) => ink([[x - 8, y], [x, y + 6], [x + 8, y]], { width: 2.5, color: tailDark })),
    piece(curve([[74, 205], [80, 140], [110, 126], [140, 140], [146, 205], [110, 216]], 2), skin),
    piece(band([[84, 150], [62, 186], [74, 214]], 16), skin),
    piece(band([[136, 150], [158, 186], [146, 214]], 16), skin),
    ...[0, 1, 2, 3, 4].map((i) => dot(92 + i * 9, 150 + Math.sin((i / 4) * Math.PI) * 8, 4, C.cream)),
    piece(ellipse(110, 86, 40, 46), skin),
    piece(band([[74, 90], [64, 130], [70, 172]], 18), hair),
    piece(band([[146, 90], [156, 130], [150, 172]], 18), hair),
    piece(curve([[70, 82], [80, 42], [110, 32], [144, 44], [152, 82], [130, 60], [110, 56], [88, 62]], 2), hair),
    piece(circle(95, 90, 6), C.ink, { edge: 'clean', shadow: false }),
    piece(circle(125, 90, 6), C.ink, { edge: 'clean', shadow: false }),
    dot(93, 88, 2, C.white),
    dot(123, 88, 2, C.white),
    piece(ellipse(110, 114, 7, 9), '#5a2a2a', { edge: 'clean', shadow: false }),
    piece(ellipse(84, 106, 8, 5), C.pink, { edge: 'cut', fibre: false, shadow: false, opacity: 0.5 }),
    piece(ellipse(136, 106, 8, 5), C.pink, { edge: 'cut', fibre: false, shadow: false, opacity: 0.5 }),
  ]);
}

/** A cheeky little grindylow with long spindly fingers, 200 × 220. */
function grindylow(): string {
  const body = '#6f9a5a';
  const fingers = (x: number, y: number, dir: number): Node[] =>
    [-14, 0, 14].map((a) => ink([[x, y], [x + dir * 18, y + a]], { width: 3, color: '#4f7a4a' }));
  return svg({ w: 200, h: 220, name: 'b4c3-grindylow', label: 'a grindylow' }, [
    piece(band([[80, 150], [70, 184], [80, 210]], 14), '#5a8a50'),
    piece(band([[100, 154], [100, 190], [108, 214]], 14), '#5a8a50'),
    piece(band([[120, 150], [132, 184], [124, 208]], 14), '#5a8a50'),
    piece(poly([[64, 52], [56, 14], [84, 40]]), '#4f7a4a', { edge: 'cut' }),
    piece(poly([[136, 52], [144, 14], [116, 40]]), '#4f7a4a', { edge: 'cut' }),
    ink([[56, 112], [32, 130], [16, 150]], { width: 6, color: '#5a8a50' }),
    ink([[144, 112], [170, 100], [182, 82]], { width: 6, color: '#5a8a50' }),
    ...fingers(16, 150, -1),
    ...fingers(182, 82, 1),
    piece(curve([[50, 110], [58, 54], [100, 34], [142, 54], [150, 110], [136, 162], [64, 162]], 2), body),
    piece(ellipse(100, 132, 30, 22), '#9ab87a', { fibre: false }),
    piece(circle(80, 86, 17), '#f0e6b0', { edge: 'cut' }),
    piece(circle(122, 86, 17), '#f0e6b0', { edge: 'cut' }),
    piece(circle(84, 89, 8), C.ink, { edge: 'clean', shadow: false }),
    piece(circle(118, 89, 8), C.ink, { edge: 'clean', shadow: false }),
    dot(81, 85, 2.5, C.white),
    dot(115, 85, 2.5, C.white),
    ink([[76, 116], [100, 130], [124, 116]], { width: 4 }),
    piece(poly([[90, 122], [97, 125], [93, 133]]), C.white, { edge: 'cut', fibre: false, shadow: false }),
    piece(poly([[104, 125], [111, 122], [108, 133]]), C.white, { edge: 'cut', fibre: false, shadow: false }),
  ]);
}

/** The weedy rope tying your friend to the statue, on a full-stage layer. */
function rope(): string {
  return svg({ w: 1180, h: 820, name: 'b4c3-rope' }, [
    piece(band([[850, 478], [900, 470], [950, 482], [1000, 470], [1046, 476]], 18), WEED),
    piece(band([[858, 506], [910, 500], [960, 510], [1010, 498], [1044, 502]], 16), WEED_DARK),
    piece(band([[1040, 476], [1062, 440], [1056, 404], [1050, 384]], 14), WEED),
    piece(ellipse(1050, 384, 12, 9), WEED, { fibre: false }),
  ]);
}

/** A little floating music note, 40 × 56. */
function note(): string {
  return svg({ w: 40, h: 56, name: 'b4c3-note' }, [
    piece(ellipse(14, 44, 10, 8, -20), C.cream, { fibre: false }),
    ink([[23, 42], [23, 8], [36, 16]], { width: 4, color: C.cream }),
  ]);
}

/** Above the lake at night: stars, the castle, a cheering stand and the moonlit water. */
function surface(): string {
  const r = rng(91);
  const stars: Node[] = Array.from({ length: 40 }, () => {
    const x = r() * 1180;
    const y = r() * 360;
    const s = 2 + r() * 4;
    const pts: Pt[] = Array.from({ length: 8 }, (_, k) => {
      const a = (k * Math.PI) / 4;
      const rr = k % 2 ? s * 0.4 : s;
      return [x + Math.cos(a) * rr, y + Math.sin(a) * rr] as Pt;
    });
    return piece(poly(pts), r() > 0.8 ? C.goldLight : C.cream, { edge: 'cut', fibre: false, shadow: false, opacity: 0.5 + r() * 0.4 });
  });
  const tower = (x: number, top: number, w: number): Node[] => [
    piece(rect(x, top, w, 470 - top), C.nightLight, { rough: 0.8 }),
    piece(poly([[x - 8, top + 4], [x + w / 2, top - w * 1.2], [x + w + 8, top + 4]]), C.slate, { rough: 0.8 }),
  ];
  const win = (x: number, y: number) => piece(rect(x, y, 10, 16, 5), C.candle, { edge: 'cut', fibre: false, shadow: false });
  const heads: Node[] = [];
  const colors = [C.skin, C.skinShade, '#c8956a', C.skin, '#a8754e'];
  const scarves = [C.red, C.gold, C.green, C.blue, C.yellow];
  for (let row = 0; row < 3; row++) {
    for (let i = 0; i < 9; i++) {
      const x = 935 + i * 24 + (row % 2) * 12;
      const y = 392 + row * 26;
      heads.push(piece(rect(x - 9, y + 6, 18, 12, 4), scarves[(i + row) % 5], { edge: 'cut', fibre: false, shadow: false }));
      heads.push(piece(circle(x, y, 8), colors[(i * 3 + row) % 5], { edge: 'cut', fibre: false, shadow: false }));
    }
  }
  return svg({ w: 1180, h: 820, name: 'b4c3-surface', boil: false, className: 'backdrop' }, [
    piece(rect(-20, -20, 1220, 860), C.night, { edge: 'clean', shadow: false }),
    ...stars,
    layer(400, 50, '#2a3157', 21, 100),
    ...tower(560, 300, 50),
    ...tower(630, 240, 64),
    ...tower(720, 290, 52),
    piece(rect(540, 340, 250, 130), C.nightLight, { rough: 0.8 }),
    win(578, 360), win(655, 290), win(675, 330), win(738, 340), win(600, 400), win(700, 410), win(750, 390),
    // a wooden stand full of cheering people on the far shore
    piece(rect(910, 370, 250, 100, 4), C.brownDark),
    ...heads,
    piece(rect(906, 448, 258, 24, 3), C.wood),
    ...[[930, C.red], [990, C.gold], [1050, C.green], [1110, C.blue]].map(([x, c]) =>
      piece(poly([[+x, 330], [+x + 30, 342], [+x, 354]]), c as string, { edge: 'cut', fibre: false }),
    ),
    ...[930, 990, 1050, 1110].map((x) => ink([[x, 330], [x, 372]], { width: 3, color: C.brownDark })),
    layer(470, 26, '#2a3d5c', 23, 140),
    // the far lake
    piece(rect(-20, 466, 1220, 400), '#24405a', { edge: 'clean', shadow: false }),
    ...[[400, 500], [700, 520], [980, 495], [560, 560], [880, 580]].map(([x, y]) => ink([[x - 40, y], [x - 14, y - 5], [x + 14, y], [x + 40, y - 5]], { width: 3, color: '#3d6480' })),
  ]);
}

/** The near water that hides you up to your shoulders, 1180 × 360. */
function frontWater(): string {
  // The bottom corners sit well off stage, so the curve's rounding never shows.
  const pts: Pt[] = [[-140, 560]];
  for (let x = -140; x <= 1320; x += 70) pts.push([x, 40 + Math.sin(x / 55) * 9]);
  pts.push([1320, 560]);
  return svg({ w: 1180, h: 360, name: 'b4c3-water', boil: false }, [
    piece(curve(pts, 2), '#2a4d68', { rough: 1.2 }),
    // the moon's golden path on the water, right below it
    ...[0, 1, 2, 3, 4].map((i) => piece(ellipse(170 + (i % 2 ? 14 : -10), 74 + i * 30, 64 - i * 9, 6), C.goldLight, { edge: 'cut', fibre: false, shadow: false, opacity: 0.5 - i * 0.06 })),
    ...[[200, 90], [520, 110], [860, 86], [380, 160], [720, 170], [1040, 150]].map(([x, y]) => ink([[x - 50, y], [x - 18, y - 6], [x + 18, y], [x + 50, y - 6]], { width: 3, color: '#45708e' })),
  ]);
}

// ---------------------------------------------------------------- helpers

/** Sways a weed clump gently from its root (skipped in calm mode). */
function sway(k: Kit<string>, el: HTMLElement, deg: number, seconds: number): void {
  if (k.calm) return;
  k.set(el, { transformOrigin: '50% 100%', rotation: -deg / 2 });
  void k.to(el, seconds, { rotation: deg / 2, yoyo: true, repeat: -1, ease: 'sine.inOut' });
}

/** A few music notes drifting up from a singer (particles: skipped in calm mode). */
function notes(k: Kit<string>, x: number, y: number, count = 3): void {
  if (k.calm) return;
  for (let i = 0; i < count; i++) {
    const n = k.add(note(), { x: x + i * 26 - 20, y, w: 30, z: 45 });
    k.set(n, { opacity: 0 });
    void k.wait(i * 450).then(async () => {
      k.set(n, { opacity: 1 });
      await k.to(n, 1.8, { y: -110, x: (i % 2 ? 1 : -1) * 30, rotation: (i % 2 ? 1 : -1) * 20, opacity: 0, ease: 'sine.out' });
      n.remove();
    });
  }
}

/** Your best friend: the one of the other two who isn't you. */
const FRIEND = { harry: 'ron', ron: 'hermione', hermione: 'harry' } as const;

// ------------------------------------------------------------------ story

export default defineStory({
  lines: {
    gulp: { who: 'narrator', text: 'Gulp! You eat the gillyweed… and grow flippers! Down into the Black Lake!' },
    hello: { who: 'myrtle', text: 'Oooh, a visitor! Hee hee! Your friend is down here. Follow me!' },
    tug: { who: 'narrator', text: 'Uh-oh! A cheeky grindylow tugs your flipper! Here… have a boot and a book!' },
    song: { who: 'myrtle', text: 'Listen! The merpeople are singing. And look… your friend is tied to that statue!' },
    free: { who: 'narrator', text: 'You lift the weedy rope off the hook. Your friend is free!' },
    zoom: { who: 'narrator', text: 'Grab the broom… and zoom up to the moon!' },
    cheer: { who: 'myrtle', text: 'Oooh, you did it, {name}! Everyone’s cheering… even me!' },
  },

  async play(k) {
    // ---- Under the lake.
    k.backdrop(underwater());

    const friend = k.character(FRIEND[k.hero], { x: 850, y: 300, w: 200, z: 20 });
    const hook = k.picture('hook', { x: 1006, y: 300, w: 120, z: 22, still: true });
    const ropeEl = k.add(rope(), { x: 0, y: 0, w: 1180, h: 820, z: 25 });

    const book = k.picture('book', { x: 20, y: 548, w: 150, z: 14 });
    const boot = k.picture('boot', { x: 160, y: 540, w: 120, z: 15 });
    const broom = k.picture('broom', { x: 250, y: 520, w: 200, z: 13 });
    k.set(broom, { rotation: -8 });

    const weeds = [
      k.add(weedClump('b4c3-weed1'), { x: 360, y: 400, w: 120, z: 18 }),
      k.add(weedClump('b4c3-weed2', WEED_DARK), { x: 700, y: 430, w: 110, z: 12 }),
      k.add(weedClump('b4c3-weed3'), { x: -30, y: 380, w: 130, z: 19 }),
    ];
    weeds.forEach((w, i) => sway(k, w, 8 - i, 1.6 + i * 0.4));

    const grindy = k.add(grindylow(), { x: 300, y: 440, w: 150, z: 22 });
    k.set(grindy, { opacity: 0 });
    const mer1 = k.add(merperson('b4c3-mer1', '#2c4a3a', C.teal, '#2f6a6a'), { x: 560, y: 40, w: 140, z: 16 });
    const mer2 = k.add(merperson('b4c3-mer2', '#6a4a30', '#7a6a9a', C.plum), { x: 730, y: 70, w: 130, z: 16, flip: true });
    k.set([mer1, mer2], { opacity: 0 });

    const myrtle = k.character('myrtle', { x: 400, y: 120, w: 190, z: 24 });
    k.set(myrtle, { opacity: 0 });

    const hero = k.character('hero', { x: 140, y: 190, w: 220, z: 21 });
    const fl = k.add(flippers(), { x: 0, y: 0, w: 180, h: 81, z: 1 });
    Object.assign(fl.style, { left: '20px', top: '224px' });
    k.set(fl, { scale: 0, transformOrigin: '50% 0%' });
    hero.prepend(fl);

    // Splash in from above.
    blub(6);
    await k.enter(hero, 'top', 1.2);
    k.float(hero, 8, 2.4);
    gulp();
    await k.all(
      k.say('gulp', hero),
      k.wait(1900).then(async () => {
        k.fx.twinkle();
        k.sparkle(250, 450, 10, 100);
        await k.to(fl, 0.4, { scale: 1, ease: 'back.out(2)' });
        if (!k.calm) void k.to(fl, 0.35, { rotation: 6, yoyo: true, repeat: 7, ease: 'sine.inOut' });
      }),
    );

    // Myrtle floats in, giggling.
    giggleWail();
    k.set(myrtle, { y: 60 });
    await k.all(k.fade(myrtle, 1, 0.8), k.to(myrtle, 0.9, { y: 0, ease: 'sine.out' }));
    k.float(myrtle, 12, 2);
    await k.say('hello', myrtle);
    void k.spin(myrtle, 1, 0.9);

    // The grindylow and its sunken treasure.
    k.fx.boing();
    await k.appear(grindy, 0.35);
    snigger();
    await k.all(
      k.say('tug', hero),
      (async () => {
        // Tug, tug!
        k.fx.boing();
        await k.all(k.shake(grindy, 8, 2), k.shake(hero, 6, 2));
        await k.wait(100);
        // A boot for a hat…
        k.fx.spell();
        await k.beam([318, 335], [220, 590], C.goldLight);
        k.set(boot, { zIndex: 23 });
        k.fx.whizz();
        await k.to(boot, 0.7, { x: 155, y: -158, rotation: -15, scale: 0.75, ease: 'power2.out' });
        k.fx.pop();
        void k.pop(boot, 1.1);
        // … and a book to read.
        k.fx.spell();
        await k.beam([318, 335], [95, 620], C.goldLight);
        k.set(book, { zIndex: 23 });
        k.fx.whizz();
        await k.to(book, 0.7, { x: 378, y: -96, rotation: 12, scale: 0.55, ease: 'power2.out' });
        k.fx.pop();
        void k.pop(book, 1.1);
      })(),
    );
    snigger();
    void k.hop(grindy, 24, 2);
    void k.shake(myrtle, 6, 3);
    k.fx.whizz();
    blub(3);
    await k.all(...[grindy, boot, book].map((el) => k.to(el, 0.9, { x: '-=640', ease: 'power2.in' })));
    [grindy, boot, book].forEach((el) => k.remove(el));

    // The merpeople sing.
    merSong();
    k.set([mer1, mer2], { y: 120 });
    void k.all(
      k.fade(mer1, 1, 0.7),
      k.to(mer1, 1, { y: 0, ease: 'sine.out' }),
      k.wait(300).then(() => k.all(k.fade(mer2, 1, 0.7), k.to(mer2, 1, { y: 0, ease: 'sine.out' }))),
    );
    k.float(mer1, 6, 2.2);
    k.float(mer2, 6, 2.6);
    notes(k, 630, 60);
    notes(k, 790, 90);
    await k.say('song', myrtle);

    // Swim over and set your friend free.
    blub(4);
    await k.all(
      k.to(hero, 1, { x: 400, y: 70, ease: 'sine.inOut' }),
      k.to(myrtle, 1, { x: -120, y: 40, ease: 'sine.inOut' }),
    );
    await k.all(
      k.say('free', hero),
      (async () => {
        k.fx.spell();
        await k.beam([700, 470], [1050, 390], C.goldLight);
        // Lift the loop up off the hook, and the rope floats away.
        k.fx.twinkle();
        void k.pop(hook, 1.3);
        await k.to(ropeEl, 0.5, { y: -36, ease: 'power2.out' });
        await k.all(k.fade(ropeEl, 0, 0.6), k.to(ropeEl, 0.6, { y: -90, x: 30, ease: 'sine.in' }));
        k.remove(ropeEl);
        k.sparkle(950, 420, 16, 160);
        await k.hop(friend, 40, 2);
      })(),
    );

    // Here comes the broom!
    k.fx.whizz();
    k.set(broom, { zIndex: 26 });
    await k.to(broom, 0.7, { x: 310, y: -80, rotation: -4, scale: 1.25, ease: 'power2.inOut' });
    k.fx.boing();
    await k.hop(hero, 16);
    await k.say('zoom', hero);
    k.fx.whizz();
    blub(6);
    await k.all(
      k.to([hero, friend, broom], 1, { y: '-=900', ease: 'power2.in' }),
      k.wait(250).then(() => k.to(myrtle, 0.9, { y: '-=800', ease: 'power2.in' })),
    );

    // ---- Up into the moonlight.
    const cover = k.add(svg({ w: 10, h: 10, name: 'b4c3-cover', boil: false }, [piece(rect(-5, -5, 20, 20), '#2a4d68', { edge: 'clean', shadow: false })]), { x: 0, y: 0, w: 1180, h: 820, z: 60 });
    k.set(cover, { opacity: 0 });
    await k.fade(cover, 1, 0.35);
    for (const el of [...k.root.querySelectorAll<HTMLElement>(':scope > .story-actor')]) if (el !== cover) k.remove(el);
    k.backdrop(surface());

    const moon = k.picture('moon', { x: 60, y: 20, w: 220, z: 5 });
    k.add(frontWater(), { x: 0, y: 470, w: 1180, h: 360, z: 30 });
    const hero2 = k.character('hero', { x: 290, y: 300, w: 220, z: 20 });
    const friend2 = k.character(FRIEND[k.hero], { x: 540, y: 300, w: 220, z: 20 });
    const broom2 = k.picture('broom', { x: 760, y: 420, w: 190, z: 32 });
    const merL = k.add(merperson('b4c3-mer1', '#2c4a3a', C.teal, '#2f6a6a'), { x: 30, y: 400, w: 130, z: 28 });
    const merR = k.add(merperson('b4c3-mer2', '#6a4a30', '#7a6a9a', C.plum), { x: 1000, y: 420, w: 120, z: 28, flip: true });
    const myrtle2 = k.character('myrtle', { x: 790, y: 90, w: 180, z: 24 });
    k.set([hero2, friend2, merL, merR, broom2], { y: 300 });
    k.set(myrtle2, { opacity: 0 });
    await k.fade(cover, 0, 0.4);
    cover.remove();

    // Splash!
    bigSplash();
    k.puff(400, 500, 200, '#cfe6e8');
    k.puff(650, 500, 200, '#cfe6e8');
    await k.all(
      k.to(hero2, 0.6, { y: 0, ease: 'back.out(1.6)' }),
      k.wait(120).then(() => k.to(friend2, 0.6, { y: 0, ease: 'back.out(1.6)' })),
      k.wait(250).then(() => k.to(broom2, 0.6, { y: 0, rotation: -6, ease: 'back.out(1.4)' })),
    );
    k.float(broom2, 5, 1.8);
    k.fx.twinkle();
    void k.pop(moon, 1.12);
    k.fx.bubbles(4);
    await k.all(
      k.to(merL, 0.7, { y: 0, ease: 'back.out(1.4)' }),
      k.wait(200).then(() => k.to(merR, 0.7, { y: 0, ease: 'back.out(1.4)' })),
      k.wait(300).then(() => {
        giggleWail();
        return k.fade(myrtle2, 1, 0.8);
      }),
    );
    k.float(myrtle2, 12, 2);

    // Everyone cheers.
    cheer();
    k.fx.jingle();
    k.confetti(36);
    k.sparkle(400, 360, 14, 180);
    void k.hop(hero2, 40, 2).then(() => k.float(hero2, 6, 2.2));
    void k.wait(200).then(() => k.hop(friend2, 40, 2)).then(() => k.float(friend2, 6, 2.6));
    await k.say('cheer', myrtle2);
    giggleWail();
    k.sparkle(880, 200, 12, 140);
    void k.spin(myrtle2, 1, 1);
    await k.wait(900);
  },
});
