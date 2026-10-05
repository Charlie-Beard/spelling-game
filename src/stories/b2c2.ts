/**
 * Book 2, chapter 2: The Burrow.
 *
 * The Weasleys' wonky tall house and its overgrown garden. The dishes wash
 * themselves in the kitchen window, and a cheeky gnome pops up on the hedge.
 * You spin him round and round (dizzy, never hurt) and let go: he sails
 * over the hedge, bonks off the shed roof and lands in the fish pond with a
 * splash, then pops up wearing a shell for a hat, cheeky as ever.
 */
import { gsap } from 'gsap';
import { bell, C, circle, curve, defineStory, ellipse, ink, type Kit, noiseBurst, now, piece, poly, rect, rng, svg, tone, type Node, type Pt } from './kit';

// ------------------------------------------------------------------ sounds

/** A dizzy whirr: swooshes that come faster and faster as he goes round. */
function whirr(seconds: number, turns: number): void {
  const t = now();
  const halves = turns * 2;
  for (let i = 0; i < halves; i++) {
    // Matches a 'power1.in' spin: half-turn i is reached at s·sqrt(i/halves).
    const at = seconds * Math.sqrt(i / halves);
    noiseBurst(t + at, { freq: 500 + i * 60, q: 1.4, peak: 0.07 + i * 0.006, attack: 0.04, decay: 0.14, sweepTo: 1500 + i * 80 });
  }
  tone(220, t, { wave: 'triangle', peak: 0.05, attack: 0.3, decay: seconds, glideTo: 620, vibrato: [7, 30], lowpass: 1400 });
}

/** A squeaky little "hee-hee-hee". */
function giggle(): void {
  const t = now();
  [1180, 1080, 990, 1120].forEach((f, i) => {
    tone(f, t + i * 0.11, { wave: 'triangle', peak: 0.08, attack: 0.012, decay: 0.07, glideTo: f * 1.3, lowpass: 3200 });
  });
}

/** A hollow wooden bonk on the shed roof. */
function bonk(): void {
  const t = now();
  tone(420, t, { wave: 'triangle', peak: 0.2, decay: 0.2, glideTo: 210, lowpass: 2200 });
  tone(640, t, { peak: 0.08, decay: 0.1, glideTo: 380 });
  noiseBurst(t, { freq: 1600, q: 2, peak: 0.08, decay: 0.05 });
}

/** A big, round garden-pond sploosh with drips after it. */
function sploosh(): void {
  const t = now();
  tone(190, t, { peak: 0.16, attack: 0.005, decay: 0.22, glideTo: 80 });
  noiseBurst(t, { freq: 1800, type: 'lowpass', peak: 0.22, attack: 0.01, decay: 0.65, sweepTo: 350 });
  noiseBurst(t + 0.03, { freq: 3000, q: 0.7, peak: 0.08, attack: 0.02, decay: 0.4, sweepTo: 900 });
  [0.22, 0.34, 0.47, 0.6, 0.78].forEach((d, i) => tone(820 + ((i * 290) % 700), t + d, { peak: 0.05, decay: 0.07, glideTo: 1700 }));
}

/** Two plates clinking together in the sink. */
function clink(): void {
  const t = now();
  bell(2350, t, 0.045, 0.35);
  bell(2790, t + 0.13, 0.04, 0.3);
}

// --------------------------------------------------------------------- art

const HOUSE: Array<[string, Pt[]]> = [
  ['#c49a74', [[60, 410], [330, 402], [334, 568], [56, 570]]],
  ['#b5886a', [[78, 300], [318, 306], [326, 410], [70, 410]]],
  ['#cfae88', [[100, 210], [300, 202], [306, 304], [94, 306]]],
  ['#bd9372', [[126, 130], [282, 136], [290, 206], [120, 212]]],
  ['#c9a684', [[150, 64], [252, 58], [258, 134], [146, 136]]],
];

/** The strips of roof between the floors. */
const EAVES: Pt[][] = [
  [[54, 402], [338, 396], [338, 412], [54, 416]],
  [[70, 298], [326, 302], [326, 314], [70, 310]],
  [[92, 202], [308, 196], [308, 208], [92, 214]],
  [[118, 128], [290, 132], [290, 142], [118, 140]],
];

/** A little window: wooden frame, glass and a cross of glazing bars. */
function win(x: number, y: number, w: number, hh: number, glass: string): Node[] {
  return [
    piece(rect(x - 5, y - 5, w + 10, hh + 10, 3), C.wood, { edge: 'cut' }),
    piece(rect(x, y, w, hh, 2), glass, { edge: 'cut', fibre: false, shadow: false }),
    ink([[x + w / 2, y + 2], [x + w / 2, y + hh - 2]], { width: 3, color: C.brownDark }),
    ink([[x + 2, y + hh / 2], [x + w - 2, y + hh / 2]], { width: 3, color: C.brownDark }),
  ];
}

/** A flower: stalk and a little torn-paper head. */
const flower = (x: number, y: number, color: string, r = 9): Node[] => [
  ink([[x, y + 30], [x + 2, y + 14], [x, y]], { width: 3, color: C.greenDark }),
  piece(circle(x, y, r), color, { edge: 'cut' }),
  piece(circle(x, y, r * 0.38), C.goldLight, { edge: 'clean', shadow: false }),
];

/** The Burrow and its overgrown garden on a soft summer day (1180 × 820). */
function burrow(): string {
  const r = rng(22);
  const glass = '#d7e4ea';
  // Rolling ground: pale far hills, then the big garden lawn.
  const hill = (y: number, amp: number, color: string, seed: number): Node => {
    const rr = rng(seed);
    const pts: Pt[] = [[-40, 900]];
    for (let x = -40; x <= 1220; x += 110) pts.push([x, y - rr() * amp]);
    pts.push([1220, 900]);
    return piece(curve(pts, 2), color, { rough: 1.3 });
  };
  const weeds: Node[] = [];
  for (let i = 0; i < 14; i++) {
    const x = 350 + r() * 300;
    const y = 520 + r() * 60;
    weeds.push(ink([[x, y + 40], [x + (r() - 0.5) * 20, y]], { width: 4, color: i % 2 ? C.greenDark : '#55804a' }));
  }
  return svg({ w: 1180, h: 820, name: 'b2c2-burrow', boil: false, className: 'backdrop' }, [
    piece(rect(-20, -20, 1220, 860), C.sky, { edge: 'clean', shadow: false }),
    // soft clouds
    ...[[760, 110, 1], [1010, 70, 0.8], [560, 60, 0.6]].flatMap(([x, y, s]) => [
      piece(ellipse(x, y, 90 * s, 26 * s), C.white, { rough: 1.2, shadow: false, opacity: 0.85 }),
      piece(ellipse(x - 30 * s, y - 16 * s, 44 * s, 26 * s), C.white, { rough: 1.2, shadow: false, opacity: 0.85 }),
      piece(ellipse(x + 26 * s, y - 20 * s, 50 * s, 30 * s), C.white, { rough: 1.2, shadow: false, opacity: 0.85 }),
    ]),
    hill(372, 44, '#bccdb4', 3),
    hill(410, 50, '#9cb685', 5),
    hill(470, 30, C.green, 9),
    // a winding path from the door
    piece(curve([[262, 570], [312, 568], [360, 640], [420, 760], [420, 860], [250, 860], [280, 720], [256, 620]], 2), C.sand, { rough: 1.2 }),

    // ---- the Burrow: rooms stacked any old how
    piece(curve([[214, 52], [196, 30], [214, 8], [236, 20], [246, 0], [268, 18], [262, 46]], 2), C.white, { shadow: false, opacity: 0.7 }),
    piece(rect(228, 30, 22, 46), C.brown, { rough: 0.8 }),
    piece(rect(112, 98, 18, 44), C.stone, { rough: 0.8 }),
    piece(rect(350, 268, 16, 40), C.brown, { rough: 0.8 }),
    piece(poly([[318, 320], [374, 316], [378, 394], [318, 398]]), '#c7a383', { rough: 0.8 }),
    piece(poly([[310, 326], [346, 292], [386, 322]]), C.redDark, { rough: 0.8 }),
    piece(poly([[22, 252], [104, 246], [104, 330], [26, 334]]), '#a98468', { rough: 0.8 }),
    piece(poly([[12, 258], [60, 214], [114, 252]]), C.redDark, { rough: 0.8 }),
    ...HOUSE.map(([c, pts]) => piece(poly(pts), c, { rough: 0.8 })),
    // eaves between the floors
    ...EAVES.map((pts) => piece(poly(pts), C.rust, { edge: 'cut', fibre: false })),
    piece(poly([[132, 72], [206, 6], [274, 64]]), C.rust, { rough: 0.8 }),
    // windows (the big kitchen one glows warm)
    ...win(104, 429, 132, 82, C.candle),
    ...win(108, 330, 48, 48, glass),
    ...win(232, 334, 46, 46, glass),
    ...win(138, 232, 42, 44, glass),
    ...win(238, 226, 38, 44, glass),
    ...win(182, 152, 40, 38, glass),
    ...win(188, 82, 28, 32, glass),
    ...win(46, 272, 34, 34, glass),
    ...win(334, 340, 26, 30, glass),
    // the back door
    piece(rect(262, 468, 52, 102, 10), C.brownDark, { rough: 0.8 }),
    piece(circle(302, 522, 5), C.gold, { edge: 'clean', shadow: false }),
    // the garden: weeds and flowers growing everywhere
    ...weeds,
    ...flower(48, 548, C.pink),
    ...flower(84, 560, C.yellow, 8),
    ...flower(380, 540, C.rose),
    ...flower(560, 520, C.yellow),
    ...flower(1120, 470, C.pink, 8),

    // ---- the fish pond (its front half is an actor, so things can sit in it)
    ...[[818, 590], [850, 556], [905, 540], [970, 534], [1035, 538], [1095, 552], [1142, 584]].map(([x, y], i) =>
      piece(ellipse(x, y, 22, 13, i * 17), i % 2 ? C.stoneLight : C.stone, { rough: 0.8 }),
    ),
    piece(ellipse(980, 600, 175, 58), C.blue, { rough: 0.7 }),
    piece(ellipse(860, 580, 22, 9), C.greenDark, { edge: 'cut', fibre: false }),
    piece(ellipse(1100, 592, 18, 7), C.greenDark, { edge: 'cut', fibre: false }),
  ]);
}

/** The front half of the pond, in front of whatever is in the water (380 × 100). */
function pondFront(): string {
  const pts: Pt[] = [];
  for (let i = 0; i <= 30; i++) {
    const a = (i / 30) * Math.PI;
    pts.push([190 + Math.cos(a) * 175, 10 + Math.sin(a) * 58]);
  }
  // A gently wavy waterline along the top.
  for (let x = 15; x < 365; x += 35) pts.push([x, 10 + (x % 70 ? -3 : 3)]);
  return svg({ w: 380, h: 100, name: 'b2c2-pond', boil: false }, [
    piece(pts, C.blue, { rough: 0.6, fibre: '#cfe0ee', shadow: false }),
    ink([[70, 24], [130, 22], [170, 26]], { width: 3, color: C.sky }),
    ink([[220, 34], [270, 31], [300, 35]], { width: 3, color: C.sky }),
    ink([[120, 44], [180, 46]], { width: 3, color: C.sky, opacity: 0.7 }),
    ...[[36, 54], [90, 74], [160, 84], [232, 82], [300, 70], [350, 48]].map(([x, y], i) =>
      piece(ellipse(x, y, 26, 14, i * 23), i % 2 ? C.stone : C.stoneLight, { rough: 0.8 }),
    ),
  ]);
}

/** The tall, untidy hedge the gnome lives in (200 × 400). */
function hedge(): string {
  const r = rng(77);
  const lumps: Node[] = [];
  for (let i = 0; i < 9; i++) {
    lumps.push(piece(ellipse(30 + r() * 140, 40 + r() * 260, 26 + r() * 14, 20 + r() * 12), i % 2 ? '#4f7d4f' : '#5b8a55', { edge: 'cut', fibre: false, shadow: false }));
  }
  return svg({ w: 200, h: 400, name: 'b2c2-hedge', boil: false }, [
    piece(curve([[0, 400], [-4, 60], [24, 24], [62, 30], [96, 6], [134, 24], [172, 14], [204, 50], [204, 400]], 2), C.greenDark, { rough: 1.6 }),
    ...lumps,
    ...[[40, 90], [120, 150], [80, 230], [150, 290]].map(([x, y]) => piece(circle(x, y, 5), C.pink, { edge: 'cut', fibre: false })),
  ]);
}

/**
 * Long grass along the front of the garden (1240 × 200), so the hero and the
 * hedge stand in it rather than ending in a hard edge.
 */
function longGrass(): string {
  const r = rng(31);
  const top: Pt[] = [[0, 200]];
  for (let x = 0; x <= 1240; x += 24) top.push([x, 26 + r() * 22 - (x % 48 ? 12 : 0)]);
  top.push([1240, 200]);
  const blades: Node[] = [];
  for (let i = 0; i < 22; i++) {
    const x = 20 + i * 56 + r() * 20;
    blades.push(ink([[x, 70], [x + (r() - 0.5) * 30, 10 + r() * 16]], { width: 4, color: '#4c7845' }));
  }
  return svg({ w: 1240, h: 200, name: 'b2c2-grass', boil: false }, [
    ...blades,
    piece(curve(top, 1), '#5f8a4e', { rough: 1.4 }),
    ...flower(90, 40, C.yellow, 8),
    ...flower(560, 46, C.pink, 8),
    ...flower(760, 42, C.yellow, 7),
  ]);
}

/** A yellow sponge that scrubs by itself. */
const sponge = (): string =>
  svg({ w: 60, h: 40, name: 'b2c2-sponge' }, [
    piece(rect(4, 6, 52, 30, 6), C.yellow, { edge: 'cut' }),
    ...[[16, 16], [32, 24], [44, 14]].map(([x, y]) => piece(circle(x, y, 3), C.gold, { edge: 'clean', shadow: false })),
  ]);

/** One soap bubble or water drop. */
const bubble = (color: string, name: string): string =>
  svg({ w: 40, h: 40, name, boil: false }, [
    piece(circle(20, 20, 15), color, { edge: 'cut', fibre: false, opacity: 0.8 }),
    piece(circle(14, 14, 4), C.white, { edge: 'clean', shadow: false, opacity: 0.8 }),
  ]);

/** Three little stars that circle a dizzy head (100 × 100). */
function dizzyStars(): string {
  const star = (cx: number, cy: number): Node => {
    const pts: Pt[] = [];
    for (let k = 0; k < 10; k++) {
      const a = (k * Math.PI) / 5 - Math.PI / 2;
      const rr = k % 2 ? 5 : 12;
      pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
    }
    return piece(poly(pts), C.goldLight, { edge: 'cut' });
  };
  return svg({ w: 100, h: 100, name: 'b2c2-dizzy', boil: false }, [star(50, 12), star(88, 70), star(12, 70)]);
}

// ------------------------------------------------------------------- helpers

/** Flies an actor along an arc to (x, y), as offsets from where it was placed. */
function arc(k: Kit, el: HTMLElement, x: number, y: number, lift: number, seconds: number, spin = 0): Promise<void> {
  const top = Math.min(Number(gsap.getProperty(el, 'y')), y) - lift;
  return k.all(
    k.to(el, seconds, { x, ease: 'none' }),
    k.to(el, seconds / 2, { y: top, ease: 'power2.out' }).then(() => k.to(el, seconds / 2, { y, ease: 'power2.in' })),
    spin && !k.calm ? k.to(el, seconds, { rotation: `+=${spin}`, ease: 'none' }) : Promise.resolve(),
  );
}

/** Little things that fly out from a point and fade (soap bubbles, splashes). */
function scatter(k: Kit, art: string, x: number, y: number, n: number, up: number, spread: number): void {
  if (k.calm) return;
  for (let i = 0; i < n; i++) {
    const s = 14 + Math.random() * 14;
    const el = k.add(art, { x: x - s / 2, y: y - s / 2, w: s, h: s, z: 45 });
    const d = 0.9 + Math.random() * 0.6;
    gsap.to(el, { x: (Math.random() - 0.5) * spread, y: -up * (0.5 + Math.random() * 0.6), opacity: 0, duration: d, ease: 'steps(10)', onComplete: () => el.remove() });
  }
}

/** Moves an actor inside another, so it rides along with it. */
function attach(parent: HTMLElement, child: HTMLElement, x: number, y: number): void {
  parent.append(child);
  child.style.left = `${x}px`;
  child.style.top = `${y}px`;
}

// --------------------------------------------------------------------- story

/** Where the gnome is placed: just above the hero's head, ready to be spun. */
const GNOME = { x: 382, y: 206, w: 160 };

export default defineStory({
  lines: {
    intro: { who: 'narrator', text: 'This is the Burrow, the Weasleys’ wonky house. Even the dishes wash themselves!' },
    oi: { who: 'gnome', text: 'Oi! This is my garden! Bet you can’t catch me!' },
    spin: { who: 'narrator', text: 'Time to de-gnome the garden! Grab him… and spin him round and round!' },
    splash: { who: 'narrator', text: 'Bonk, off the shed roof… and splash! Right into the fish pond!' },
    hat: { who: 'gnome', text: 'Ooh, I’m all dizzy! But look, a shell hat! Do it again, {name}!' },
    end: { who: 'narrator', text: 'What a throw! The garden is gnome-free… well, nearly!' },
  },

  async play(k) {
    k.backdrop(burrow());

    // The kitchen window: two dishes and a sponge, washing themselves.
    const dishA = k.picture('dish', { x: 106, y: 418, w: 74, z: 4, still: true });
    const dishB = k.picture('dish', { x: 162, y: 428, w: 70, z: 4, still: true });
    const spongeEl = k.add(sponge(), { x: 150, y: 436, w: 40, z: 5 });

    const shed = k.picture('shed', { x: 880, y: 262, w: 220, z: 5, still: true });
    const ship = k.picture('ship', { x: 1000, y: 512, w: 110, z: 25 });
    const fish = k.picture('fish', { x: 790, y: 520, w: 84, z: 26 });
    k.set(fish, { opacity: 0 });
    k.add(pondFront(), { x: 790, y: 590, w: 380, z: 30, still: true });

    const hero = k.character('hero', { x: 330, y: 410, w: 265, z: 10 });
    k.set(hero, { opacity: 0 });
    const gnome = k.character('gnome', { ...GNOME, z: 12 });
    const hedgeEl = k.add(hedge(), { x: 640, y: 420, w: 200, z: 15, still: true });
    k.add(longGrass(), { x: -30, y: 615, w: 1240, z: 18, still: true });
    // The gnome starts hidden in the hedge.
    k.set(gnome, { x: 278, y: 280 });

    // Life in the background: the ship bobs on the pond.
    if (!k.calm) {
      gsap.to(ship, { rotation: 4, y: -4, duration: 1.2, yoyo: true, repeat: -1, ease: 'steps(6)' });
    }

    // ---- 1. The Burrow, and its magic washing-up.
    await k.wait(500);
    k.sfx.whoosh();
    await k.enter(hero, 'left', 0.8);
    if (!k.calm) {
      gsap.to(dishA, { rotation: -8, y: -6, duration: 0.42, yoyo: true, repeat: -1, ease: 'steps(3)' });
      gsap.to(dishB, { rotation: 9, y: -5, duration: 0.5, yoyo: true, repeat: -1, ease: 'steps(3)' });
      gsap.to(spongeEl, { x: -40, rotation: -10, duration: 0.45, yoyo: true, repeat: -1, ease: 'steps(3)' });
    }
    clink();
    k.fx.bubbles(5);
    scatter(k, bubble('#e6f0f6', 'b2c2-soap'), 170, 450, 6, 120, 120);
    const said = k.say('intro');
    await k.wait(1400);
    clink();
    scatter(k, bubble('#e6f0f6', 'b2c2-soap'), 150, 450, 5, 110, 100);
    await said;

    // ---- 2. A cheeky gnome pops up out of the hedge.
    k.sfx.rustle();
    await k.shake(hedgeEl, 5, 2);
    k.fx.boing();
    await k.to(gnome, 0.4, { y: 58, ease: 'back.out(1.6)' });
    giggle();
    await k.say('oi', gnome);
    k.fx.boing();
    await k.hop(gnome, 36);
    giggle();

    // ---- 3. Grab him, and spin him round and round!
    const told = k.say('spin');
    await k.wait(1200);
    gnome.style.zIndex = '20';
    k.fx.whizz();
    await arc(k, gnome, 0, 0, 90, 0.6);
    k.fx.pop();
    await k.pop(hero, 1.05);
    await told;

    const turns = k.calm ? 1 : 3;
    // Round and round above your head, held by the ankles.
    k.set(gnome, { transformOrigin: '50% 118%' });
    whirr(2.1, turns);
    await k.all(k.to(gnome, 2.1, { rotation: 360 * turns, ease: 'power1.in' }), k.shake(hero, 4, 4));
    k.set(gnome, { transformOrigin: '50% 50%', rotation: 0 });

    // ---- 4. Let go! Over the hedge, bonk off the shed, splash in the pond.
    k.fx.whizz();
    await arc(k, gnome, 528, -76, 110, 1.0, 720);
    bonk();
    void k.shake(shed, 5, 2);
    await k.pop(gnome, 1.12);
    k.fx.whizz();
    await arc(k, gnome, 478, 270, 70, 0.8, 360);
    sploosh();
    k.set(gnome, { opacity: 0, rotation: 0 });
    k.puff(940, 590, 200, '#cfe0ee');
    scatter(k, bubble(C.sky, 'b2c2-drop'), 940, 580, 9, 200, 320);
    void k.quake(4);
    // The fish leaps out to see what fell in.
    k.set(fish, { opacity: 1, y: 40, rotation: 30 });
    k.fx.boing();
    await k.to(fish, 0.4, { y: -90, rotation: -20, ease: 'power2.out' });
    await k.to(fish, 0.4, { y: 40, rotation: -70, ease: 'power2.in' });
    k.fx.bubbles(4);
    k.set(fish, { opacity: 0, rotation: 0 });
    await k.say('splash');

    // ---- 5. Up he pops, with a shell for a hat.
    const shell = k.picture('shell', { x: 0, y: 0, w: 84, crop: '50 100 300 255', z: 1 });
    attach(gnome, shell, 38, -36);
    k.set(shell, { rotation: -12 });
    const stars = k.add(dizzyStars(), { x: 0, y: 0, w: 120, z: 2 });
    attach(gnome, stars, 20, -78);
    k.set(gnome, { y: 310, opacity: 1 });
    k.fx.pop();
    await k.to(gnome, 0.4, { y: 244, ease: 'back.out(2)' });
    k.fx.twinkle();
    giggle();
    if (!k.calm) gsap.to(stars, { rotation: 360, duration: 1.6, repeat: 2, ease: 'steps(16)', onComplete: () => void k.fade(stars, 0, 0.4) });
    else stars.remove();
    // A dizzy wobble.
    for (const r of [-10, 8, -6, 0]) await k.to(gnome, 0.22, { rotation: r, ease: 'sine.inOut' });
    await k.say('hat', gnome);

    // ---- 6. Hooray!
    k.fx.jingle();
    k.confetti(36);
    k.sparkle(940, 470, 14, 150);
    const cheer = k.say('end');
    k.set(fish, { opacity: 1, y: 40, rotation: 30 });
    await k.all(
      k.hop(hero, 40, 2),
      k.to(fish, 0.4, { y: -100, rotation: -20, ease: 'power2.out' }).then(() => k.to(fish, 0.4, { y: 40, rotation: -70, ease: 'power2.in' })),
    );
    k.set(fish, { opacity: 0 });
    k.fx.boing();
    giggle();
    await k.hop(gnome, 26);
    await cheer;
    await k.wait(600);
  },
});
