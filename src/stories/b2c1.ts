/**
 * Book 2, chapter 1: Dobby’s Warning.
 *
 * Night in your little bedroom at Privet Drive. Crack! Dobby the house-elf
 * pops up on your bed, meant to bring a warning but far too busy bouncing,
 * ears flapping. You click open the lock on your school trunk and throw him
 * a sock, which lands on his head like a hat. Dobby is free! He clicks his
 * fingers, a chick and a duck pop out to join a happy dance on the bed, and
 * there are chips for everyone.
 */
import { gsap } from 'gsap';
import { band, bell, C, circle, curve, defineStory, dot, ellipse, ink, type Kit, noiseBurst, NOTE, now, piece, poly, rect, rng, svg, tone, type Node, type Pt } from './kit';

// ------------------------------------------------------------------ sounds

/** A house-elf’s crack: a quick snap with a little magic shimmer after it. */
function crack(): void {
  const t = now();
  noiseBurst(t, { freq: 3200, type: 'highpass', peak: 0.2, attack: 0.002, decay: 0.06 });
  noiseBurst(t, { freq: 1200, q: 0.8, peak: 0.14, attack: 0.002, decay: 0.14, sweepTo: 380 });
  tone(170, t, { peak: 0.2, decay: 0.18, glideTo: 60 });
  tone(1400, t + 0.02, { wave: 'triangle', peak: 0.05, decay: 0.2, glideTo: 2600 });
  bell(NOTE.G6, t + 0.12, 0.05, 0.5);
}

/** Old bed springs: a wobbly boyoyoing with a little squeak. */
function springs(): void {
  const t = now();
  tone(90, t, { peak: 0.12, decay: 0.12, glideTo: 60 });
  tone(210, t, { wave: 'triangle', peak: 0.12, attack: 0.005, decay: 0.42, glideTo: 330, vibrato: [22, 40], lowpass: 1800 });
  tone(950, t + 0.03, { wave: 'triangle', peak: 0.035, decay: 0.12, glideTo: 1350, lowpass: 3000 });
}

/** A jaunty little jig for the happy dance (about 2.9 s), with an oom-pah bass. */
function danceTune(): void {
  const t = now();
  const b = 0.18;
  const melody = [
    NOTE.C5, NOTE.E5, NOTE.G5, NOTE.E5,
    NOTE.F5, NOTE.A5, NOTE.G5, NOTE.E5,
    NOTE.D5, NOTE.F5, NOTE.E5, NOTE.C5,
    NOTE.G5, NOTE.E5, NOTE.D5, NOTE.C6,
  ];
  melody.forEach((f, i) => tone(f, t + i * b, { wave: 'triangle', peak: 0.09, attack: 0.01, decay: i === 15 ? 0.6 : 0.16, lowpass: 2600 }));
  const bass = [NOTE.C3, NOTE.G3, NOTE.F3, NOTE.A3, NOTE.G3, NOTE.D3, NOTE.G3, NOTE.C3];
  bass.forEach((f, i) => tone(f, t + i * b * 2, { wave: 'triangle', peak: 0.1, attack: 0.01, decay: 0.25, lowpass: 800 }));
  bell(NOTE.C6, t + 15 * b, 0.07, 0.9);
  bell(NOTE.E6, t + 15 * b + 0.06, 0.05, 0.8);
}

/** A tiny chick’s cheep-cheep. */
function cheep(): void {
  const t = now();
  [0, 0.13].forEach((d) => tone(2100, t + d, { wave: 'triangle', peak: 0.06, attack: 0.006, decay: 0.07, glideTo: 2900, lowpass: 4500 }));
}

/** A soft, friendly quack-quack. */
function quack(): void {
  const t = now();
  [0, 0.24].forEach((d) => {
    tone(340, t + d, { wave: 'sawtooth', peak: 0.06, attack: 0.012, decay: 0.15, glideTo: 230, lowpass: 1300 });
    tone(680, t + d, { wave: 'sawtooth', peak: 0.025, attack: 0.012, decay: 0.12, glideTo: 470, lowpass: 1700 });
  });
}

/** The trunk’s padlock clicking open. */
function lockClick(): void {
  const t = now();
  [0, 0.1].forEach((d) => {
    noiseBurst(t + d, { freq: 4000, q: 3, peak: 0.12, decay: 0.025 });
    tone(1800, t + d, { peak: 0.05, decay: 0.04, glideTo: 1400 });
  });
  bell(NOTE.E6, t + 0.16, 0.05, 0.4);
}

/** A finger click. */
function snap(): void {
  noiseBurst(now(), { freq: 2600, q: 1.5, peak: 0.18, attack: 0.001, decay: 0.04 });
}

// --------------------------------------------------------------------- art

/** Your little bedroom at Privet Drive, at night by lamplight (1180 × 820). */
function bedroom(): string {
  const r = rng(201);
  const wall = '#c6b38d';
  const stripes: Node[] = [];
  for (let x = 30; x < 1180; x += 72) stripes.push(piece(rect(x, -10, 18, 610), '#b9a580', { edge: 'cut', fibre: false, shadow: false, opacity: 0.8 }));
  const sprigs: Node[] = [];
  for (let x = 66; x < 1180; x += 72) for (let y = 60; y < 580; y += 110) sprigs.push(dot(x, y + (x % 144 ? 55 : 0), 4, '#a98f6a', 0.7));
  const stars: Node[] = [];
  for (let i = 0; i < 9; i++) stars.push(dot(890 + r() * 190, 100 + r() * 190, 1.5 + r() * 2, C.goldLight, 0.9));
  const boards: Node[] = [];
  for (const y of [636, 680, 732, 792]) boards.push(ink([[-10, y], [1190, y + 2]], { width: 2.5, color: C.brownDark, opacity: 0.45 }));
  for (let i = 0; i < 12; i++) {
    const y = [606, 636, 680, 732][i % 4];
    const x = 60 + ((i * 397) % 1100);
    const h2 = [30, 44, 52, 60][i % 4];
    boards.push(ink([[x, y + 2], [x + 2, y + h2 - 2]], { width: 2, color: C.brownDark, opacity: 0.35 }));
  }
  const books: Node[] = [];
  const bookCols = [C.red, C.greenDark, C.blue, C.gold, C.plum, C.rust];
  let bx = 440;
  for (let i = 0; i < 6; i++) {
    const w = 18 + (i % 3) * 5;
    const hh = 52 + ((i * 13) % 20);
    books.push(piece(rect(bx, 262 - hh, w, hh, 2), bookCols[i], { edge: 'cut' }));
    bx += w + 3;
  }
  return svg({ w: 1180, h: 820, name: 'b2c1-bedroom', boil: false, className: 'backdrop' }, [
    piece(rect(-20, -20, 1220, 640), wall, { edge: 'clean', shadow: false }),
    ...stripes,
    ...sprigs,
    // a warm pool of lamplight on the wall
    piece(ellipse(600, 250, 420, 260), C.candle, { edge: 'clean', shadow: false, opacity: 0.18 }),
    piece(ellipse(600, 220, 240, 160), C.candle, { edge: 'clean', shadow: false, opacity: 0.16 }),

    // ---- the window: a starry night and a big moon
    piece(rect(862, 72, 236, 252, 4), C.wood, { edge: 'cut' }),
    piece(rect(876, 86, 208, 224, 2), C.night, { edge: 'cut', fibre: false, shadow: false }),
    piece(rect(876, 210, 208, 100), C.nightLight, { edge: 'clean', shadow: false, opacity: 0.6 }),
    // rooftops of Privet Drive
    piece(poly([[876, 310], [876, 262], [930, 236], [984, 262], [984, 250], [1040, 226], [1084, 252], [1084, 310]]), C.charcoal, { edge: 'cut', fibre: false, shadow: false }),
    piece(rect(906, 266, 14, 14), C.candle, { edge: 'clean', shadow: false, opacity: 0.8 }),
    piece(rect(1030, 260, 14, 14), C.candle, { edge: 'clean', shadow: false, opacity: 0.8 }),
    ...stars,
    piece(circle(1032, 136, 30), C.cream, { edge: 'cut' }),
    piece(circle(1022, 128, 6), '#e2d4b0', { edge: 'clean', shadow: false }),
    piece(circle(1040, 146, 4), '#e2d4b0', { edge: 'clean', shadow: false }),
    ink([[980, 88], [980, 308]], { width: 6, color: C.wood }),
    ink([[878, 198], [1082, 198]], { width: 6, color: C.wood }),
    // sill
    piece(rect(842, 316, 276, 24, 4), C.tan, { edge: 'cut' }),
    // curtains and rail
    piece(curve([[820, 60], [880, 60], [872, 200], [890, 330], [880, 380], [826, 384], [834, 220]], 2), '#8d5a5c', { rough: 1.1 }),
    piece(curve([[1080, 60], [1140, 60], [1132, 220], [1140, 384], [1086, 380], [1074, 330], [1090, 200]], 2), '#8d5a5c', { rough: 1.1 }),
    ink([[846, 80], [850, 370]], { width: 2.5, color: '#6f4246', opacity: 0.6 }),
    ink([[1114, 80], [1110, 370]], { width: 2.5, color: '#6f4246', opacity: 0.6 }),
    piece(band([[806, 58], [1154, 58]], 9), C.brownDark, { edge: 'cut', fibre: false }),

    // ---- a lamp hanging from the ceiling
    ink([[600, -10], [600, 70]], { width: 3, color: C.charcoal }),
    piece(poly([[556, 112], [574, 66], [626, 66], [644, 112]]), '#d9a86a', { edge: 'cut' }),
    piece(ellipse(600, 116, 20, 8), C.candle, { edge: 'clean', shadow: false }),

    // ---- a wonky shelf of school books
    ...books,
    piece(rect(560, 226, 30, 36, 4), C.brown, { edge: 'cut' }),
    piece(rect(424, 262, 210, 12, 3), C.wood, { edge: 'cut' }),
    piece(poly([[440, 274], [452, 274], [452, 292]]), C.brownDark, { edge: 'cut', fibre: false }),
    piece(poly([[606, 274], [618, 274], [606, 292]]), C.brownDark, { edge: 'cut', fibre: false }),

    // ---- skirting board and floorboards
    piece(rect(-20, 586, 1220, 22), C.cream, { edge: 'cut' }),
    piece(rect(-20, 606, 1220, 240), '#946845', { edge: 'clean', shadow: false }),
    ...boards,
    // a soft round rug
    piece(ellipse(620, 752, 420, 58), '#7f6a86', { rough: 1.2 }),
    piece(ellipse(620, 752, 360, 42), '#8f7b94', { edge: 'cut', fibre: false, shadow: false }),
  ]);
}

/** The bed: headboard, footboard, pillow and a patchwork duvet (560 × 300). */
function bed(): string {
  const patches: Node[] = [];
  const cols = ['#8197b6', '#9a7c9c', '#8aa08a', '#c9a96a'];
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 2; j++) {
      if ((i + j) % 2) continue;
      patches.push(piece(rect(60 + i * 76, 132 + j * 46, 60, 36, 3), cols[(i + j * 3) % 4], { edge: 'cut', fibre: false, shadow: false, opacity: 0.9 }));
    }
  }
  return svg({ w: 560, h: 300, name: 'b2c1-bed', boil: false }, [
    // legs
    piece(rect(66, 240, 22, 50, 3), C.brownDark, { edge: 'cut' }),
    piece(rect(466, 240, 22, 50, 3), C.brownDark, { edge: 'cut' }),
    // headboard
    piece(rect(4, 6, 50, 284, 10), C.brown, { rough: 0.8 }),
    piece(circle(29, 14, 14), C.wood, { edge: 'cut' }),
    // mattress and duvet
    piece(rect(36, 102, 482, 140, 10), C.white),
    piece(curve([[40, 96], [280, 88], [522, 96], [528, 232], [280, 240], [34, 232]], 2), '#6f86a8', { rough: 1.1 }),
    ...patches,
    ink([[60, 176], [500, 174]], { width: 2, color: '#4d6488', opacity: 0.5 }),
    // turned-down sheet
    piece(curve([[40, 92], [280, 86], [522, 92], [522, 116], [280, 112], [40, 118]], 1), C.cream, { edge: 'cut' }),
    // pillow
    piece(ellipse(118, 82, 74, 26, -3), C.white),
    ink([[70, 84], [100, 90]], { width: 2, color: C.stoneLight }),
    // footboard
    piece(rect(506, 70, 46, 220, 10), C.brown, { rough: 0.8 }),
    piece(circle(529, 76, 13), C.wood, { edge: 'cut' }),
  ]);
}

/** Your Hogwarts trunk, the box part (320 × 150). */
function trunk(): string {
  return svg({ w: 320, h: 150, name: 'b2c1-trunk', boil: false }, [
    piece(rect(4, 4, 312, 142, 8), '#7a4a2e', { rough: 0.8 }),
    piece(rect(54, 4, 26, 142), C.brownDark, { edge: 'cut', fibre: false }),
    piece(rect(240, 4, 26, 142), C.brownDark, { edge: 'cut', fibre: false }),
    ...[[4, 4], [292, 4], [4, 122], [292, 122]].map(([x, y]) => piece(rect(x, y, 24, 24, 3), C.gold, { edge: 'cut' })),
    ink([[20, 80], [300, 80]], { width: 2, color: C.brownDark, opacity: 0.5 }),
  ]);
}

/** The trunk’s lid (330 × 52). */
function lid(): string {
  return svg({ w: 330, h: 52, name: 'b2c1-lid', boil: false }, [
    piece(curve([[4, 46], [10, 12], [165, 2], [320, 12], [326, 46]], 1), '#6b4028', { rough: 0.8 }),
    piece(rect(56, 6, 26, 42), C.brownDark, { edge: 'cut', fibre: false }),
    piece(rect(246, 6, 26, 42), C.brownDark, { edge: 'cut', fibre: false }),
    piece(rect(2, 38, 326, 12, 3), C.gold, { edge: 'cut' }),
  ]);
}

// ------------------------------------------------------------------- helpers

/** Moves an actor inside another, so it rides along with it. */
function attach(parent: HTMLElement, child: HTMLElement, x: number, y: number): void {
  parent.append(child);
  child.style.left = `${x}px`;
  child.style.top = `${y}px`;
}

/** Flies an actor along an arc to (x, y), as offsets from where it was placed. */
function arc(k: Kit, el: HTMLElement, x: number, y: number, lift: number, seconds: number, spin = 0): Promise<void> {
  const top = Math.min(Number(gsap.getProperty(el, 'y')), y) - lift;
  return k.all(
    k.to(el, seconds, { x, ease: 'none' }),
    k.to(el, seconds / 2, { y: top, ease: 'power2.out' }).then(() => k.to(el, seconds / 2, { y, ease: 'power2.in' })),
    spin && !k.calm ? k.to(el, seconds, { rotation: `+=${spin}`, ease: 'none' }) : Promise.resolve(),
  );
}

/**
 * One big bounce on the bed: the mattress squashes, the springs boing, and
 * Dobby stretches tall on the way up and squashes on landing, so his big
 * ears seem to flap.
 */
async function bounce(k: Kit, dobby: HTMLElement, bedEl: HTMLElement, height: number, tilt: number): Promise<void> {
  const hh = k.calm ? Math.min(height, 12) : height;
  springs();
  await k.all(k.to(bedEl, 0.1, { scaleY: 0.96, ease: 'power1.out' }), k.to(dobby, 0.1, { scaleY: 0.9, scaleX: 1.1, ease: 'power1.out' }));
  void k.to(bedEl, 0.25, { scaleY: 1, ease: 'back.out(3)' });
  await k.to(dobby, 0.28, { y: -hh, scaleY: 1.08, scaleX: 0.9, rotation: tilt, ease: 'power2.out' });
  await k.to(dobby, 0.1, { scaleX: 1.08, scaleY: 0.94, ease: 'none' });
  await k.to(dobby, 0.24, { y: 0, scaleX: 1, scaleY: 1, rotation: 0, ease: 'power2.in' });
}

/** A small creature’s happy hop, tipping side to side. */
async function jig(k: Kit, el: HTMLElement, height: number, times: number, sound?: () => void): Promise<void> {
  for (let i = 0; i < times; i++) {
    if (sound && i % 2 === 0) sound();
    await k.to(el, 0.2, { y: -(k.calm ? 8 : height), rotation: i % 2 ? 10 : -10, ease: 'power2.out' });
    await k.to(el, 0.2, { y: 0, rotation: 0, ease: 'power2.in' });
  }
}

// --------------------------------------------------------------------- story

/** Dobby on the bed, sunk to his middle in the duvet (bounces stay under ~64 px so his hem never shows). */
const DOBBY = { x: 196, y: 290, w: 236 };
/** Where the sock sits on Dobby’s head, inside his actor. */
const HAT: Pt = [92, -38];
/** Where the sock starts, hidden inside the trunk. */
const SOCK = { x: 724, y: 470, w: 70 };

export default defineStory({
  lines: {
    night: { who: 'narrator', text: 'Night-time at Privet Drive. Your little room is very quiet… until…' },
    hello: { who: 'dobby', text: 'Dobby has come to warn {name}! But first… a bouncy bed!' },
    boing: { who: 'narrator', text: 'Boing! Boing! Dobby’s big ears flap up and down!' },
    sock: { who: 'narrator', text: 'You click open the lock on your trunk… and pull out a sock!' },
    free: { who: 'dobby', text: 'A sock! Master has given Dobby a sock… Dobby is free!' },
    dance: { who: 'narrator', text: 'Dobby clicks his fingers. Pop! A chick and a duck join the happy dance!' },
    end: { who: 'dobby', text: 'And chips for everyone! Dobby will never forget you!' },
  },

  async play(k) {
    k.backdrop(bedroom());

    const hedwig = k.character('hedwig', { x: 932, y: 210, w: 120, z: 8 });
    const hero = k.character('hero', { x: 640, y: 268, w: 270, z: 10 });

    // Dobby (hidden until the crack), and his creature friends on the bed.
    const dobby = k.character('dobby', { ...DOBBY, z: 15 });
    // He has no sock yet: you give him one.
    dobby.querySelectorAll<SVGElement>('[data-part="sock"]').forEach((g) => (g.style.opacity = '0'));
    k.set(dobby, { opacity: 0, transformOrigin: '50% 100%' });
    const chick = k.picture('chick', { x: 74, y: 382, w: 128, z: 16 });
    const duck = k.picture('duck', { x: 432, y: 408, w: 140, z: 16, crop: '20 90 340 250' });
    k.set([chick, duck], { opacity: 0, transformOrigin: '50% 100%' });

    const bedEl = k.add(bed(), { x: 40, y: 400, w: 560, z: 20, still: true });
    k.set(bedEl, { transformOrigin: '50% 100%' });

    // The trunk in front of you, with its lock, and the sock hidden inside.
    const sock = k.picture('sock', { ...SOCK, crop: '130 50 190 310', z: 21 });
    k.set(sock, { opacity: 0, y: 90 });
    k.add(trunk(), { x: 610, y: 540, w: 320, z: 22, still: true });
    const lidEl = k.add(lid(), { x: 605, y: 500, w: 330, z: 23, still: true });
    const lock = k.picture('lock', { x: 740, y: 506, w: 60, crop: '90 60 220 300', z: 24 });
    const chips = k.picture('chip', { x: 858, y: 394, w: 82, crop: '90 70 220 310', z: 25 });
    k.set(chips, { opacity: 0 });

    // ---- 1. A quiet night…
    await k.wait(400);
    k.sfx.hoot();
    void k.hop(hedwig, 14);
    await k.say('night');

    // ---- 2. Crack! Dobby appears on the bed.
    crack();
    k.puff(314, 400, 240, C.stoneLight);
    k.set(dobby, { opacity: 1, scale: 0.6 });
    await k.to(dobby, 0.25, { scale: 1, ease: 'back.out(2.4)' });
    void k.shake(hero, 8, 2);
    void k.shake(hedwig, 6, 2);
    k.sparkle(314, 420, 10, 130);
    await k.wait(300);
    await k.say('hello', dobby);

    // ---- 3. Boing! Boing! Bouncing on the bed, ears flapping.
    const told = k.say('boing');
    for (let i = 0; i < 4; i++) await bounce(k, dobby, bedEl, 64, i % 2 ? 7 : -7);
    await told;
    await bounce(k, dobby, bedEl, 46, -5);

    // ---- 4. Click! Open the trunk and pull out a sock.
    const said = k.say('sock');
    await k.wait(1100);
    lockClick();
    await k.shake(lock, 4, 2);
    k.fx.pop();
    // The lock falls open and drops away.
    void k.to(lock, 0.5, { y: 170, rotation: 50, opacity: 0, ease: 'power2.in' });
    k.fx.creak();
    await k.to(lidEl, 0.4, { y: -46, rotation: -6, ease: 'back.out(1.6)' });
    k.set(sock, { opacity: 1 });
    k.fx.twinkle();
    await k.to(sock, 0.5, { y: -70, ease: 'back.out(1.8)' });
    k.sparkle(SOCK.x + 35, SOCK.y - 20, 8, 90);
    await said;

    // Up it flies… and lands on Dobby’s head like a hat.
    sock.style.zIndex = '30';
    k.fx.whizz();
    await arc(k, sock, DOBBY.x + HAT[0] - SOCK.x, DOBBY.y + HAT[1] - SOCK.y, 120, 0.9, 340);
    attach(dobby, sock, HAT[0], HAT[1]);
    k.set(sock, { x: 0, y: 0, rotation: -18 });
    k.fx.pop();
    await k.pop(dobby, 1.08);
    void k.to(lidEl, 0.3, { y: 0, rotation: 0, ease: 'power2.in' }).then(() => k.fx.thud());

    // ---- 5. Dobby is free!
    await k.shake(dobby, 6, 2);
    await k.say('free', dobby);
    k.fx.twinkle();
    k.sparkle(314, 420, 18, 180);
    // A twirl on the spot (a flat paper turn, so he never tips over the duvet).
    await k.all(
      k.glow(C.goldLight, 0.35, 1.2),
      (async () => {
        for (let i = 0; i < 2; i++) {
          await k.to(dobby, 0.18, { scaleX: -1, ease: 'sine.inOut' });
          await k.to(dobby, 0.18, { scaleX: 1, ease: 'sine.inOut' });
        }
      })(),
    );

    // ---- 6. Snap! A chick and a duck join the happy dance.
    const danced = k.say('dance', dobby);
    await k.wait(900);
    snap();
    await k.wait(500);
    k.fx.pop();
    k.puff(138, 446, 130, C.goldLight);
    await k.appear(chick, 0.35);
    cheep();
    await k.wait(250);
    k.fx.pop();
    k.puff(502, 456, 130, C.goldLight);
    await k.appear(duck, 0.35);
    quack();
    await danced;

    danceTune();
    await k.all(
      (async () => {
        for (let i = 0; i < 4; i++) await bounce(k, dobby, bedEl, 58, i % 2 ? 8 : -8);
      })(),
      jig(k, chick, 34, 7, cheep),
      jig(k, duck, 26, 7, quack),
      k.hop(hedwig, 16, 3),
      k.hop(hero, 24, 3),
    );

    // ---- 7. Chips for everyone, and a big hooray.
    k.fx.pop();
    k.puff(899, 450, 120, C.goldLight);
    await k.appear(chips, 0.35);
    k.fx.jingle();
    k.confetti(36);
    k.sparkle(314, 400, 16, 170);
    const thanks = k.say('end', dobby);
    await k.all(k.hop(dobby, 36, 2), jig(k, chick, 24, 3), jig(k, duck, 20, 3), k.hop(hero, 30, 2));
    k.sfx.hoot();
    await thanks;
    await k.wait(700);
  },
});
