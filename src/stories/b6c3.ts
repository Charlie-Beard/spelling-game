/**
 * Book 6, chapter 3: Quidditch Practice.
 *
 * A bright blue day over the pitch. Ginny and you zoom through the clouds on
 * brooms; Ginny throws the Quaffle through a tall hoop (horn, cheers). A cheeky
 * Bludger bounces about, then the golden Snitch flutters by and you chase it
 * zig-zag and catch it. Ginny: "Brilliant!"
 */
import { bell, C, circle, curve, defineStory, dot, ellipse, ink, type Kit, noiseBurst, now, piece, poly, rect, rng, svg, tone, type Node, type Pt } from './kit';

// ------------------------------------------------------------------ sounds

/** A broom zooming past: a soft airy swoosh with a low hum. */
function broomZoom(): void {
  const t = now();
  noiseBurst(t, { freq: 500, q: 0.8, peak: 0.12, attack: 0.3, decay: 0.8, sweepTo: 2200 });
  tone(130, t, { wave: 'triangle', peak: 0.06, attack: 0.2, decay: 0.8, glideTo: 220, lowpass: 900 });
}

/** The Snitch: a quick, tiny, buzzy flutter. */
function snitchBuzz(): void {
  const t = now();
  for (let i = 0; i < 3; i++) {
    tone(1500 + i * 120, t + i * 0.18, { wave: 'sawtooth', peak: 0.035, attack: 0.02, decay: 0.16, vibrato: [48, 70], lowpass: 3200 });
  }
  bell(2637, t + 0.5, 0.04, 0.4);
}

/** A friendly goal horn, two warm notes. */
function goalHorn(): void {
  const t = now();
  tone(262, t, { wave: 'sawtooth', peak: 0.1, attack: 0.04, decay: 0.45, lowpass: 900 });
  tone(349, t + 0.5, { wave: 'sawtooth', peak: 0.11, attack: 0.04, decay: 0.8, lowpass: 900 });
}

/** A crowd cheering: a swell of soft airy noise with a few clap flutters. */
function crowdCheer(): void {
  const t = now();
  noiseBurst(t, { freq: 1100, q: 0.5, peak: 0.13, attack: 0.35, decay: 1.6, type: 'bandpass' });
  noiseBurst(t + 0.1, { freq: 2200, q: 0.6, peak: 0.07, attack: 0.4, decay: 1.4, type: 'bandpass' });
  const r = rng(61);
  for (let i = 0; i < 10; i++) noiseBurst(t + 0.5 + i * 0.1 + r() * 0.05, { freq: 3000 + r() * 1500, q: 1.5, peak: 0.04, decay: 0.05 });
}

// --------------------------------------------------------------------- art

const SKY = '#8ec5e6';

function cloudShape(x: number, y: number, s: number): Node[] {
  return [
    piece(ellipse(x, y, 90 * s, 30 * s), C.white, { edge: 'cut', fibre: false, shadow: false, opacity: 0.92 }),
    piece(ellipse(x - 40 * s, y - 20 * s, 44 * s, 28 * s), C.white, { edge: 'cut', fibre: false, shadow: false, opacity: 0.92 }),
    piece(ellipse(x + 20 * s, y - 28 * s, 50 * s, 34 * s), C.white, { edge: 'cut', fibre: false, shadow: false, opacity: 0.92 }),
  ];
}

function hoop(x: number, top: number, r: number, col: string): Node[] {
  return [
    piece(rect(x - 6, top + r, 12, 700 - top - r), C.brown, { edge: 'cut', fibre: false }),
    piece(circle(x, top + r, r + 7), col, { edge: 'cut', fibre: false }),
    piece(circle(x, top + r, r - 5), SKY, { edge: 'clean', fibre: false, shadow: false }),
  ];
}

/** The Quidditch pitch on a bright day. */
function pitch(): string {
  const stands: Node[] = [];
  const cols = [C.red, C.gold, C.blue, C.green];
  for (let i = 0; i < 7; i++) {
    const x = 20 + i * 90;
    const h = 90 + (i % 3) * 30;
    stands.push(piece(rect(x, 520 - h, 70, h + 80, 3), C.sand, { edge: 'cut', fibre: false }));
    stands.push(piece(poly([[x - 4, 520 - h], [x + 74, 520 - h], [x + 35, 520 - h - 44]]), cols[i % 4], { edge: 'cut', fibre: false }));
  }
  return svg({ w: 1180, h: 820, name: 'b6c3-pitch', boil: false, className: 'backdrop' }, [
    piece(rect(-20, -20, 1220, 860), SKY, { edge: 'clean', shadow: false }),
    piece(rect(-20, 380, 1220, 300), '#a9d3ec', { edge: 'clean', shadow: false, opacity: 0.7 }),
    ...cloudShape(180, 110, 1.1),
    ...cloudShape(620, 70, 0.9),
    ...cloudShape(1000, 120, 1),
    ...cloudShape(400, 340, 0.8),
    piece(curve([[-40, 640], [-40, 520], [300, 500], [700, 520], [1220, 500], [1220, 640]], 2), C.greenDark, { rough: 1.4 }),
    ...stands,
    ...hoop(860, 120, 52, C.gold),
    ...hoop(1030, 190, 62, C.gold),
    ...hoop(1130, 300, 46, C.gold),
    piece(curve([[-40, 860], [-40, 650], [300, 640], [600, 636], [900, 640], [1220, 650], [1220, 860]], 2), C.green, { rough: 1.2 }),
    piece(ellipse(590, 760, 480, 60), C.greenDark, { edge: 'cut', fibre: false, shadow: false, opacity: 0.35 }),
  ]);
}

/** A broom, 300 × 100, the twigs at the left. */
function broomArt(): string {
  return svg({ w: 300, h: 100, name: 'b6c3-broom' }, [
    piece(poly([[10, 40], [100, 52], [100, 68], [10, 82], [24, 61]]), C.tan, { edge: 'cut' }),
    ink([[26, 56], [96, 58]], { width: 2, color: C.brownDark }),
    ink([[22, 68], [96, 64]], { width: 2, color: C.brownDark }),
    piece(rect(94, 50, 14, 22, 3), C.brownDark, { edge: 'cut', fibre: false }),
    piece(curve([[100, 52], [200, 50], [284, 44], [284, 58], [200, 68], [100, 70]], 2), C.wood),
  ]);
}

/** The Quaffle: a plain red ball, 60 × 60. */
function quaffleArt(): string {
  return svg({ w: 60, h: 60, name: 'b6c3-quaffle' }, [
    piece(circle(30, 30, 27), C.red, { edge: 'cut' }),
    ink([[10, 22], [30, 18], [50, 22]], { width: 2, color: C.redDark }),
    ink([[10, 40], [30, 44], [50, 40]], { width: 2, color: C.redDark }),
  ]);
}

/** A cheeky Bludger, 110 × 110. */
function bludgerArt(): string {
  return svg({ w: 110, h: 110, name: 'b6c3-bludger', label: 'a cheeky Bludger' }, [
    piece(circle(55, 55, 50), C.night, { edge: 'cut' }),
    piece(ellipse(38, 46, 10, 12), C.cream, { fibre: false, shadow: false }),
    piece(ellipse(72, 46, 10, 12), C.cream, { fibre: false, shadow: false }),
    dot(40, 48, 4.5, C.ink),
    dot(74, 48, 4.5, C.ink),
    ink([[24, 30], [48, 38]], { width: 3.5, color: C.cream }),
    ink([[86, 30], [62, 38]], { width: 3.5, color: C.cream }),
    piece(curve([[32, 68], [55, 90], [80, 68], [55, 76]], 2), C.cream, { fibre: false, shadow: false }),
  ]);
}

/** The golden Snitch with fluttery wings, 130 × 80. */
function snitchArt(): string {
  return svg({ w: 130, h: 80, name: 'b6c3-snitch', label: 'the golden Snitch' }, [
    piece(curve([[56, 40], [20, 6], [4, 24], [10, 44], [48, 48]], 2), C.cream, { edge: 'cut', fibre: false, opacity: 0.95 }),
    piece(curve([[74, 40], [110, 6], [126, 24], [120, 44], [82, 48]], 2), C.cream, { edge: 'cut', fibre: false, opacity: 0.95 }),
    ink([[54, 38], [20, 22]], { width: 1.8, color: C.gold }),
    ink([[76, 38], [110, 22]], { width: 1.8, color: C.gold }),
    piece(circle(65, 50, 22), C.gold, { edge: 'cut' }),
    piece(ellipse(58, 43, 7, 5), C.goldLight, { fibre: false, shadow: false }),
  ]);
}

// -------------------------------------------------------------------- story

/** Munching: three soft crunches. */
function munch(): void {
  const t = now();
  for (let i = 0; i < 3; i++) noiseBurst(t + i * 0.12, { freq: 1800, q: 1.2, peak: 0.08, decay: 0.07, type: 'bandpass' });
}

/** The crowd: rows of little heads on top of each stand, 1180 × 820. */
function crowdArt(): string {
  const heads: Node[] = [];
  const cols = [C.red, C.gold, C.blue, C.green, C.cream];
  let n = 0;
  for (let i = 0; i < 7; i++) {
    const x = 20 + i * 90;
    const top = 520 - (90 + (i % 3) * 30);
    for (let row = 0; row < 3; row++) {
      for (let j = 0; j < 4; j++) {
        heads.push(dot(x + 12 + j * 16 + (row % 2) * 6, top + 16 + row * 20, 9, cols[n++ % 5]));
      }
    }
  }
  return svg({ w: 1180, h: 820, name: 'b6c3-crowd', boil: false }, heads);
}

// -------------------------------------------------------------------- story

const HERO0: Pt = [520, 170];
const BROOM_DY = 232;

export default defineStory({
  lines: {
    zoom: { who: 'narrator', text: 'Whoosh! You zoom up on your broom, right through a fluffy cloud!' },
    score: { who: 'ginny', text: 'Ready? Watch this… here goes the Quaffle!' },
    goal: { who: 'ginny', text: 'Yes! Right through the hoop! Listen to that crowd!' },
    bludger: { who: 'narrator', text: 'Uh-oh! A cheeky Bludger bounces about. Boing! Boing! Duck!' },
    snitch: { who: 'ginny', text: 'Look, a flash of gold! The Snitch! Catch it, {name}!' },
    catch: { who: 'narrator', text: 'You zig! You zag! Up, down… and got it!' },
    words: { who: 'ginny', text: 'Brilliant! A pie on a tray for the winner… open wide!' },
  },

  async play(k: Kit) {
    k.backdrop(pitch());
    k.music('adventure');
    const crowd = k.add(crowdArt(), { x: 0, y: 0, w: 1180, h: 820, z: 3 });

    const hero = k.character('hero', { x: HERO0[0], y: HERO0[1], z: 20 });
    const broom = k.add(broomArt(), { x: HERO0[0] - 20, y: HERO0[1] + BROOM_DY, w: 300, z: 19 });
    const gBroom = k.add(broomArt(), { x: 90, y: 385, w: 300, z: 17 });
    const ginny = k.character('ginny', { x: 120, y: 150, w: 240, z: 18 });
    k.set([hero, broom, gBroom, ginny], { opacity: 0 });

    const rig = [hero, broom];
    const flyTo = (x: number, y: number, secs: number, ease = 'sine.inOut') =>
      k.all(...rig.map((e) => k.to(e, secs, { x: x - HERO0[0], y: y - HERO0[1], ease })));

    // Everyone zooms in, the hero bursting through a cloud.
    const cloud = k.picture('cloud', { x: 560, y: 90, w: 220, z: 21 });
    broomZoom();
    k.sfx.whoosh();
    await k.all(k.enter(ginny, 'left', 0.9), k.enter(gBroom, 'left', 0.9), k.enter(hero, 'left', 1.1), k.enter(broom, 'left', 1.1));
    for (const e of [hero, broom, ginny, gBroom]) {
      void k.to(e, 1.3, { rotation: 3, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    }
    k.puff(660, 190, 90, C.white);
    k.sfx.whoosh();
    k.vanish(cloud, 0.3);
    const cloud2 = k.picture('cloud', { x: 40, y: 30, w: 160, z: 8 });
    k.set(cloud2, { opacity: 0 });
    void k.appear(cloud2, 0.4);
    await k.say('zoom');

    // Ginny winds back and throws the Quaffle through the hoop.
    void k.say('score', ginny);
    await k.to(ginny, 0.3, { rotation: -10 });
    const q = k.add(quaffleArt(), { x: 330, y: 260, w: 54, z: 25 });
    await k.to(ginny, 0.15, { rotation: 6 });
    k.fx.whizz();
    void k.camera({ zoom: 1.4, x: 950, y: 300 }, 1);
    await k.all(
      k.to(q, 1.4, { x: 1003 - 330, ease: 'none' }),
      k.to(q, 1.4, { y: 223 - 260, ease: 'power1.out' }),
    );
    goalHorn();
    crowdCheer();
    void k.hop(crowd, 10, 2);
    k.sparkle(1030, 252, 20, 140);
    void k.to(q, 0.6, { y: 460, ease: 'power2.in' }).then(() => k.vanish(q, 0.2));
    void k.hop(hero, 30, 1);
    await k.say('goal', ginny);
    await k.camera({}, 1);

    // A cheeky Bludger bounces about; a leaf drifts down.
    const leaf = k.picture('leaf', { x: 1180, y: 200, w: 90, z: 8 });
    void k.to(leaf, 4, { x: 140 - 1180, y: 400, rotation: 540, ease: 'sine.inOut' });
    const bl = k.add(bludgerArt(), { x: 560, y: 80, w: 110, z: 26 });
    k.set(bl, { opacity: 0 });
    await k.appear(bl, 0.2);
    k.fx.uhoh();
    void k.say('bludger');
    await k.pop(bl, 1.2);
    for (const [x, y] of [[250, 380], [600, 170], [880, 400], [420, 260]] as Pt[]) {
      k.fx.boing();
      await k.all(k.to(bl, 0.45, { x: x - 560, y: y - 80, rotation: x, ease: 'power1.inOut' }), k.wait(100));
      k.puff(x + 55, y + 100, 40, C.white);
      if (x === 880) {
        await k.to(hero, 0.15, { rotation: -12 });
        void k.to(hero, 0.3, { rotation: 0 });
      }
    }
    await k.wait(900);
    k.fx.pop();
    await k.to(bl, 0.5, { x: 1300, y: -200, ease: 'power2.in' });
    k.remove(bl);

    // The Snitch flutters by and you chase it, zig-zag.
    const S: Pt[] = [[800, 230], [560, 170], [820, 330], [520, 250], [700, 300]];
    const sn = k.add(snitchArt(), { x: 1100, y: 110, w: 120, z: 22 });
    k.set(sn, { opacity: 0 });
    snitchBuzz();
    await k.appear(sn, 0.3);
    k.float(sn, 5, 0.5);
    void k.hop(ginny, 20, 1);
    await k.say('snitch', ginny);

    void k.say('catch');
    void k.camera({ zoom: 1.3, x: 640, y: 300 }, 1.2);
    broomZoom();
    for (const [i, [sx, sy]] of S.entries()) {
      if (i % 2 === 0) snitchBuzz();
      await k.all(
        k.to(sn, 0.7, { x: sx - 1100, y: sy - 110, ease: 'power1.inOut' }),
        k.wait(180).then(() => flyTo(sx - 200, sy - 110, 0.62)),
      );
    }
    // Got it!
    k.music('triumph');
    k.fx.pop();
    k.fx.twinkle();
    await k.to(sn, 0.25, { scale: 0.7, ease: 'back.out(2)' });
    k.sparkle(S[4][0] + 60, S[4][1] + 40, 14, 110);
    await k.hop(hero, 34, 2);

    // The tableau: a pie on a tray, open wide!
    void k.camera({}, 1.4);
    crowdCheer();
    void k.hop(crowd, 10, 2);
    k.confetti(32);
    const tray = k.picture('tray', { x: 440, y: 600, w: 170, z: 30 });
    const pie = k.picture('pie', { x: 470, y: 560, w: 120, z: 31 });
    const mouth = k.picture('mouth', { x: 590, y: 380, w: 110, z: 30 });
    k.set([tray, pie, mouth], { opacity: 0 });
    void k.say('words', ginny);
    k.fx.pop();
    void k.appear(tray, 0.3);
    await k.appear(pie, 0.3);
    await k.all(k.to(tray, 0.8, { y: 430 - 600, ease: 'power2.out' }), k.to(pie, 0.8, { y: 360 - 560, ease: 'power2.out' }));
    k.fx.pop();
    await k.appear(mouth, 0.25);
    for (let i = 0; i < 2; i++) {
      await k.to(mouth, 0.15, { scaleY: 0.6 });
      await k.to(mouth, 0.15, { scaleY: 1 });
    }
    munch();
    k.vanish(pie, 0.2);
    k.fx.jingle();
    void k.hop(ginny, 40, 2);
    k.sparkle(600, 250, 16, 240);
    await k.wait(1500);
  },
});
