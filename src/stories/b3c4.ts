/**
 * b3c4 "The Lost Locket": inside the creaky, dusty Shrieking Shack at night.
 *
 * Wormtail sniggers over the locket, about to hide it in a gift box. You
 * tiptoe in over the creaky floorboards; he squeaks "Is it a cat?". You lift
 * your wand… Lumos! Light fills the room (paintings of a pond and a cliff, a
 * mask, a belt on a peg). Wormtail panics, turns into a rat with a pop,
 * flings the locket and scurries off squeaking through a hole in the wall.
 * You pick up the glowing locket.
 */
import { horcruxArt } from '../art/horcruxes';
import { C, NOTE, band, bell, circle, curve, defineStory, ellipse, group, ink, noiseBurst, now, piece, poly, rect, rng, svg, tone, type Node, type Pt } from './kit';

// ------------------------------------------------------------------ sounds

/** An old floorboard creaking underfoot (pitch varies a little per step). */
function floorCreak(pitch = 1): void {
  const t = now();
  tone(150 * pitch, t, { wave: 'sawtooth', peak: 0.05, attack: 0.06, decay: 0.42, glideTo: 112 * pitch, vibrato: [30, 12], lowpass: 800 });
  tone(290 * pitch, t + 0.05, { wave: 'triangle', peak: 0.035, attack: 0.05, decay: 0.3, glideTo: 220 * pitch, vibrato: [26, 10], lowpass: 1200 });
}

/** A little rat squeak: a quick up-and-down chirp. */
function squeak(t = now(), f = 1900): void {
  tone(f, t, { peak: 0.07, attack: 0.01, decay: 0.08, glideTo: f * 1.35 });
  tone(f * 1.3, t + 0.1, { peak: 0.06, attack: 0.01, decay: 0.09, glideTo: f });
}

/** Tiny claws scampering over floorboards, with squeaks on top. */
function scamper(seconds = 1.2): void {
  const t = now();
  for (let s = 0; s < seconds; s += 0.055) noiseBurst(t + s, { freq: 2200 + (Math.round(s / 0.055) % 2) * 500, q: 1.4, peak: 0.06, decay: 0.03 });
  for (let s = 0.1; s < seconds; s += 0.42) squeak(t + s, 1800 + Math.random() * 400);
}

/** The transformation pop: a bloop up, then a bright pop and a puff of air. */
function ratPop(): void {
  const t = now();
  tone(240, t, { wave: 'triangle', peak: 0.14, attack: 0.02, decay: 0.24, glideTo: 900, lowpass: 2500 });
  tone(1100, t + 0.24, { peak: 0.15, attack: 0.005, decay: 0.1, glideTo: 2100 });
  noiseBurst(t + 0.22, { freq: 1500, q: 0.7, peak: 0.12, attack: 0.01, decay: 0.35, sweepTo: 400 });
}

/** Lumos: a warm rising shimmer as the wand lights up. */
function lumosChime(): void {
  const t = now();
  tone(NOTE.G4, t, { wave: 'triangle', peak: 0.07, attack: 0.15, decay: 1.2, glideTo: NOTE.G5, lowpass: 2000 });
  [NOTE.C5, NOTE.G5, NOTE.C6, NOTE.E6, NOTE.G6].forEach((n, i) => bell(n, t + 0.1 + i * 0.09, 0.08, 1.2));
  noiseBurst(t + 0.2, { freq: 7000, type: 'highpass', peak: 0.03, attack: 0.3, decay: 1 });
}

/** The locket landing on the floorboards: a little tap and a clink. */
function clink(): void {
  const t = now();
  tone(140, t, { peak: 0.14, decay: 0.12, glideTo: 80 });
  bell(1760, t, 0.07, 0.4);
  bell(2350, t + 0.11, 0.045, 0.3);
}

/** The locket is found: a warm rising chime. */
function locketChime(): void {
  const t = now();
  tone(NOTE.C4, t, { peak: 0.08, attack: 0.1, decay: 1.6 });
  [NOTE.E5, NOTE.G5, NOTE.C6, NOTE.E6, NOTE.G6].forEach((n, i) => bell(n, t + i * 0.11, 0.1, 1.3));
  noiseBurst(t + 0.3, { freq: 7000, type: 'highpass', peak: 0.03, attack: 0.3, decay: 1.2 });
}

// --------------------------------------------------------------------- art

const W = 1180;
const FLOOR = 596;
const plank = '#5a4434';
const plankDark = '#3a2b21';

/** An empty picture frame (the painting itself is a word picture placed on top). */
const frame = (x: number, y: number, s: number, tilt: number): Node =>
  group({ transform: `rotate(${tilt} ${x + s / 2} ${y + s / 2})` }, [
    piece(rect(x - 14, y - 14, s + 28, s + 28, 3), '#8a6a3a'),
    piece(rect(x - 4, y - 4, s + 8, s + 8, 2), '#c9b896', { fibre: false }),
  ]);

/** Wispy cobwebs in a corner. */
function cobweb(x: number, y: number, dir: 1 | -1): Node[] {
  const c = { width: 1.6, color: C.white, opacity: 0.45, wobble: 0.4 };
  const out: Node[] = [];
  for (const a of [10, 35, 60, 82]) {
    const r = (a * Math.PI) / 180;
    out.push(ink([[x, y], [x + dir * Math.cos(r) * 150, y + Math.sin(r) * 150]], c));
  }
  for (const rr of [40, 80, 120]) {
    const pts: Pt[] = [10, 35, 60, 82].map((a) => {
      const r = (a * Math.PI) / 180;
      return [x + dir * Math.cos(r) * rr, y + Math.sin(r) * rr * 0.96];
    });
    out.push(ink(pts, c));
  }
  return out;
}

/** The inside of the Shrieking Shack: bare planks, a boarded window, dust everywhere. */
function shackInside(): string {
  const r = rng(304);
  const wallLines: Node[] = [];
  for (let x = 40; x < W; x += 64) wallLines.push(ink([[x + r() * 6, 40], [x + r() * 6, FLOOR - 20]], { width: 2.5, color: plankDark, opacity: 0.6 }));
  // floorboards running towards the back wall
  const vp: Pt = [590, 240];
  const floorLines: Node[] = [];
  for (let x0 = -260; x0 <= 1440; x0 += 96) {
    const xb = vp[0] + ((x0 - vp[0]) * (840 - vp[1])) / (FLOOR - vp[1]);
    floorLines.push(ink([[x0, FLOOR + 4], [xb, 840]], { width: 2.5, color: plankDark, opacity: 0.55 }));
  }
  const motes: Node[] = [];
  for (let i = 0; i < 16; i++) {
    const y = 300 + r() * 280;
    const x = 470 + (y - 300) * 0.35 + r() * 160;
    motes.push(piece(circle(x, y, 1.5 + r() * 2), C.cream, { edge: 'cut', fibre: false, shadow: false, opacity: 0.35 + r() * 0.3 }));
  }
  return svg({ w: W, h: 820, name: 'b3c4-shack', boil: false, className: 'backdrop' }, [
    // back wall of old planks, with tatty wallpaper
    piece(rect(-20, -20, W + 40, FLOOR + 30), plank, { edge: 'clean', shadow: false }),
    ...wallLines,
    piece(poly([[60, 60], [300, 60], [290, 200], [250, 170], [200, 240], [120, 190], [70, 250]]), '#6b5a62', { rough: 1.6, opacity: 0.7 }),
    piece(poly([[700, 60], [1010, 60], [990, 150], [930, 120], [860, 210], [780, 150], [720, 190]]), '#6b5a62', { rough: 1.6, opacity: 0.7 }),
    // ceiling beam
    piece(rect(-20, -20, W + 40, 64), plankDark, { rough: 1.2 }),
    piece(band([[-20, 54], [600, 66], [1200, 52]], 14), '#4a3628'),
    // the boarded-up window with moonlight peeping through
    piece(rect(420, 110, 210, 220, 4), plankDark, { rough: 1 }),
    piece(rect(436, 126, 178, 188, 2), '#26305a', { fibre: false }),
    piece(circle(560, 176, 26), C.cream, { rough: 0.8, shadow: false }),
    ...[0, 1, 2].map((i) => piece(circle(470 + i * 60, 150 + (i % 2) * 70, 2.5), C.cream, { edge: 'cut', fibre: false, shadow: false, opacity: 0.7 })),
    piece(band([[410, 160], [640, 210]], 30), '#8a6a48'),
    piece(band([[410, 268], [640, 236]], 30), '#7a5c3e'),
    piece(band([[455, 108], [470, 334]], 22), '#86664a'),
    // empty frames for the two paintings (pond and cliff)
    frame(110, 120, 170, -4),
    frame(860, 110, 160, 5),
    // the nail the mask hangs on, and the peg the belt hangs on
    piece(circle(745, 150, 5), C.stone, { edge: 'cut', fibre: false }),
    piece(rect(1104, 282, 18, 30, 3), plankDark, { edge: 'cut' }),
    // cobwebs
    ...cobweb(0, 44, 1),
    ...cobweb(W, 44, -1),
    // a broken old chair at the back on the left
    piece(rect(30, 380, 16, 220), '#4a3628', { rough: 1 }),
    piece(rect(120, 420, 14, 180), '#4a3628', { rough: 1 }),
    piece(rect(26, 470, 120, 20, 3), '#5e4636', { rough: 1 }),
    piece(band([[34, 400], [126, 440]], 12), '#5e4636'),
    // skirting board, with the rat hole on the right
    piece(rect(-20, FLOOR - 26, W + 40, 30), plankDark, { rough: 0.8 }),
    piece(curve([[1080, FLOOR + 2], [1080, 556], [1094, 540], [1116, 534], [1138, 540], [1152, 556], [1152, FLOOR + 2]], 2), '#16110d', { rough: 0.8 }),
    // the dusty floor
    piece(rect(-20, FLOOR, W + 40, 260), '#6b4e36', { edge: 'clean', shadow: false }),
    ...floorLines,
    piece(ellipse(300, 760, 260, 30), '#7a5c42', { rough: 2, shadow: false, fibre: false, opacity: 0.5 }),
    piece(ellipse(900, 700, 200, 22), '#7a5c42', { rough: 2, shadow: false, fibre: false, opacity: 0.5 }),
    // a pale moonbeam slanting down to the floor, with dust floating in it
    piece(poly([[440, 320], [620, 320], [830, 680], [570, 690]]), C.cream, { edge: 'clean', shadow: false, opacity: 0.08 }),
    ...motes,
  ]);
}

/** A night-time gloom laid over the room until the wand lights it up. */
const gloom = (): string =>
  svg({ w: W, h: 820, name: 'b3c4-gloom', boil: false }, [piece(rect(-20, -20, W + 40, 860), '#141830', { edge: 'clean', shadow: false })]);

/** The glowing tip of a wand, drawn over a 300 × 340 hero portrait. */
const wandLight = (): string =>
  svg({ w: 300, h: 340, name: 'b3c4-lumos', boil: true }, [
    piece(circle(249, 196, 46), C.candle, { edge: 'cut', fibre: false, shadow: false, opacity: 0.3 }),
    piece(circle(249, 196, 28), C.goldLight, { edge: 'cut', fibre: false, shadow: false, opacity: 0.6 }),
    piece(circle(249, 196, 13), C.white, { edge: 'cut', fibre: false, shadow: false }),
  ]);

/** A wand for heroes whose portrait doesn't hold one (same place as the others). */
const heroWand = (): string =>
  svg({ w: 300, h: 340, name: 'b3c4-wand', boil: true }, [
    piece(band([[232, 318], [248, 198]], 9), C.brownDark, { edge: 'cut' }),
    piece(circle(233, 314, 10), C.skin, { edge: 'cut' }),
  ]);

/** Wormtail as a rat, side on, facing right (one silver paw). 250 × 150. */
const RAT_FUR = '#8a7f72';
function rat(): string {
  return svg({ w: 250, h: 150, name: 'b3c4-rat', boil: true }, [
    piece(band([[70, 112], [36, 122], [12, 104], [8, 70], [20, 50]], 7), C.pink, { fibre: false }),
    piece(ellipse(80, 138, 12, 6), C.rose, { edge: 'cut', fibre: false }),
    piece(ellipse(108, 100, 64, 40), RAT_FUR),
    piece(ellipse(118, 118, 42, 16), '#b5a998', { fibre: false }),
    piece(curve([[146, 72], [196, 76], [230, 98], [200, 116], [150, 120]], 2), RAT_FUR),
    piece(circle(160, 64, 17), RAT_FUR),
    piece(circle(160, 64, 9), C.pink, { edge: 'cut', fibre: false, shadow: false }),
    piece(circle(186, 88, 5.5), C.ink, { edge: 'clean', shadow: false }),
    group({}, [piece(circle(184, 86, 1.8), C.white, { edge: 'clean', shadow: false })]),
    piece(circle(229, 98, 5.5), C.rose, { edge: 'cut', fibre: false }),
    ink([[216, 100], [246, 90]], { width: 1.5, color: C.ink, opacity: 0.7 }),
    ink([[216, 103], [247, 106]], { width: 1.5, color: C.ink, opacity: 0.7 }),
    // two front teeth
    piece(rect(214, 108, 5, 8, 1), C.white, { edge: 'cut', fibre: false }),
    // his silver paw
    piece(ellipse(160, 136, 10, 6), C.stoneLight, { edge: 'cut' }),
  ]);
}
/** Just the rat's head, for peeking out of the hole. */
const RAT_HEAD = '140 42 110 86';

// ------------------------------------------------------------------- story

export default defineStory({
  lines: {
    snigger: { who: 'wormtail', text: 'Hee hee! The shiny locket is all mine. I’ll hide it in this gift box!' },
    tiptoe: { who: 'narrator', text: 'Creak… creak… You tiptoe into the dark, dusty Shrieking Shack.' },
    who: { who: 'wormtail', text: 'Who’s there? Is it a cat? I don’t like cats!' },
    lumos: { who: 'narrator', text: 'You lift your wand and say Lumos! Bright light fills every dusty corner!' },
    eek: { who: 'wormtail', text: 'Eek! Too bright! Too bright! I’m off!' },
    bye: { who: 'wormtail', text: 'Squeak! Squeak! Bye-bye, shiny locket!' },
    cheer: { who: 'narrator', text: 'Hooray, {name}! You found the lost locket!' },
  },

  async play(k) {
    k.backdrop(shackInside());

    // The room's things: two paintings, a mask, a belt, and the gift box.
    const pond = k.picture('pond', { x: 110, y: 120, w: 170, z: 5, still: true });
    const cliff = k.picture('cliff', { x: 860, y: 110, w: 160, z: 5, still: true });
    k.set(pond, { rotation: -4 });
    k.set(cliff, { rotation: 5 });
    const mask = k.picture('mask', { x: 680, y: 128, w: 130, z: 5 });
    k.set(mask, { rotation: -6, transformOrigin: '50% 10%' });
    const belt = k.picture('belt', { x: 1030, y: 296, w: 170, z: 5 });
    k.set(belt, { rotation: 82, transformOrigin: '50% 50%' });

    const dark = k.add(gloom(), { x: 0, y: 0, w: W, h: 820, z: 8, still: true });
    k.set(dark, { opacity: 0.62 });

    const gift = k.picture('gift', { x: 520, y: 470, w: 150, z: 9 });

    // Wormtail, hugging the locket to his chest.
    const worm = k.character('wormtail', { x: 690, y: 320, z: 10 });
    k.set(worm, { opacity: 0 });
    const held = document.createElement('div');
    held.style.cssText = 'position:absolute;left:132px;top:150px;width:100px;height:100px';
    held.innerHTML = horcruxArt.locket();
    worm.append(held);

    // You, waiting off stage on the left.
    const hero = k.character('hero', { x: 180, y: 335, z: 12 });
    if (k.hero === 'ron') {
      const w = document.createElement('div');
      w.style.cssText = 'position:absolute;inset:0';
      w.innerHTML = heroWand();
      hero.append(w);
    }
    const light = document.createElement('div');
    light.style.cssText = 'position:absolute;inset:0;opacity:0';
    light.innerHTML = wandLight();
    hero.append(light);
    k.set(hero, { x: -480 });

    // A creaky, dusty old shack…
    floorCreak(0.9);
    await k.wait(900);
    floorCreak(1.1);
    await k.wait(700);

    // Wormtail creeps in with his prize.
    k.fx.sneak();
    await k.all(k.fade(worm, 1, 0.3), k.enter(worm, 'right', 0.9));
    k.sparkle(822, 420, 6, 60);
    await k.all(
      k.say('snigger', worm),
      k.wait(2600).then(() => k.pop(gift, 1.08)),
    );

    // You tiptoe in over the creaky floorboards.
    await k.all(
      k.say('tiptoe'),
      (async () => {
        for (let i = 0; i < 4; i++) {
          floorCreak(0.85 + (i % 2) * 0.3);
          await k.walk(hero, 120, 0.8, 1);
          await k.wait(200);
        }
      })(),
    );

    // He hears the creaks and freezes.
    k.fx.uhoh();
    await k.all(k.say('who', worm), k.shake(worm, 8, 2));

    // Lumos!
    lumosChime();
    await k.to(hero, 0.2, { y: -12 });
    await k.all(k.to(light, 0.4, { opacity: 1 }), k.to(hero, 0.2, { y: 0 }));
    void k.glow(C.candle, 0.45, 1.4);
    await k.all(k.fade(dark, 0, 1.1), k.say('lumos'));
    k.float(light, 5, 1.6);

    // Too bright for Wormtail!
    await k.all(k.say('eek', worm), k.shake(worm, 12, 3));

    // POP! He turns into a rat and the locket goes flying.
    held.remove();
    const locket = k.horcrux('locket', { x: 822, y: 470, w: 100, z: 14 });
    const rat0 = k.add(rat(), { x: 740, y: 512, w: 170, z: 13 });
    k.set(rat0, { opacity: 0 });
    ratPop();
    k.puff(820, 470, 300, C.stoneLight);
    await k.all(
      k.vanish(worm, 0.25),
      k.wait(150).then(() => k.appear(rat0, 0.3)),
      k.to(locket, 0.35, { y: -150, rotation: 200, ease: 'power2.out' }),
    );
    squeak();
    await k.to(locket, 0.35, { y: 106, rotation: 380, ease: 'power2.in' });
    clink();
    await k.to(locket, 0.15, { y: 86, ease: 'power1.out' });
    await k.to(locket, 0.15, { y: 106, rotation: 360, ease: 'power1.in' });
    clink();

    // The rat scurries round in a panic and dives through the hole.
    scamper(1.6);
    k.face(rat0, true);
    await k.to(rat0, 0.35, { x: -60, ease: 'none' });
    k.face(rat0, false);
    await k.to(rat0, 0.55, { x: 290, ease: 'power1.in' });
    await k.to(rat0, 0.12, { opacity: 0, scale: 0.6 });
    k.remove(rat0);

    // His nose peeks back out of the hole.
    const peek = k.add(rat(), { x: 1084, y: 536, w: 70, crop: RAT_HEAD, flip: true, z: 13 });
    k.set(peek, { opacity: 0 });
    await k.wait(300);
    squeak(now(), 2100);
    await k.appear(peek, 0.3);
    await k.say('bye', peek);
    squeak(now(), 2300);
    await k.vanish(peek, 0.25);

    // You pick up the locket, and it glows.
    await k.walk(hero, 300, 1.2, 3);
    locketChime();
    k.sparkle(872, 600, 18, 170);
    void k.glow(C.goldLight, 0.35, 1.4);
    await k.to(locket, 0.9, { x: 30, y: -170, rotation: 720, scale: 1.6, ease: 'sine.out' });
    k.float(locket, 6, 2.4);

    // Hooray!
    k.fx.jingle();
    k.confetti(36);
    void k.pop(gift, 1.12);
    void k.to(mask, 0.3, { rotation: 6 }).then(() => k.to(mask, 0.4, { rotation: -6 }));
    await k.all(k.say('cheer'), k.hop(hero, 50, 2));
    await k.wait(1200);
  },
});
