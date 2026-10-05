/**
 * Book 6, chapter 1: Slughorn's Potions.
 *
 * The steamy potions dungeon. You stir the cauldron five times (counted) and
 * it bubbles and turns shining gold: Felix Felicis, liquid luck! A sip later a
 * cake lands on a plate and a kite floats past the window. Slughorn offers
 * crystallised pineapple.
 */
import { bell, C, circle, curve, defineStory, dot, ellipse, ink, type Kit, noiseBurst, NOTE, now, piece, poly, rect, rng, svg, tone, tune, type Node } from './kit';

// ------------------------------------------------------------------ sounds

/** A soft wooden-spoon swish through thick potion. */
function swish(): void {
  const t = now();
  noiseBurst(t, { freq: 500, q: 1.2, peak: 0.1, attack: 0.08, decay: 0.28, type: 'bandpass', sweepTo: 1400 });
  tone(180, t, { wave: 'triangle', peak: 0.04, attack: 0.05, decay: 0.2, glideTo: 240, lowpass: 600 });
}

/** A fat, gentle bubbling: a few round blips. */
function bubbling(): void {
  const t = now();
  const r = rng(61);
  for (let i = 0; i < 7; i++) {
    const f = 260 + r() * 260;
    tone(f, t + i * 0.11 + r() * 0.04, { wave: 'sine', peak: 0.07, attack: 0.005, decay: 0.09, glideTo: f * 1.8, lowpass: 1500 });
  }
}

/** A lucky, golden, rising chime. */
function luckyChime(): void {
  const t = now();
  tune([[NOTE.C6, 0], [NOTE.E6, 0.12], [NOTE.G6, 0.24], [NOTE.C7, 0.38]], 0.1, 1.2);
  bell(NOTE.G5, t + 0.5, 0.06, 1.6);
}

// --------------------------------------------------------------------- art

const STONE = '#4f5560';
const STONE_DARK = '#3e434d';

/** The steamy dungeon, as a pop-up paper scene. */
function dungeon(): string {
  const r = rng(601);
  const bricks: Node[] = [];
  for (let row = 0; row < 8; row++) {
    let x = row % 2 ? -40 : 0;
    while (x < 1200) {
      const w = 110 + r() * 50;
      bricks.push(piece(rect(x + 3, row * 62 + 8, w - 6, 52, 3), r() > 0.5 ? STONE : '#585e6a', { edge: 'cut', fibre: false, shadow: false, rough: 0.6 }));
      x += w;
    }
  }
  const jarCols = [C.green, C.purple, C.orange, C.teal, C.pink, C.yellow];
  const jars: Node[] = [];
  for (const [sx, sy] of [[60, 300], [830, 300]] as Array<[number, number]>) {
    jars.push(piece(rect(sx, sy, 270, 12, 3), C.wood, { edge: 'cut' }));
    for (let i = 0; i < 5; i++) {
      const jx = sx + 14 + i * 50;
      const jh = 44 + r() * 20;
      jars.push(piece(rect(jx, sy - jh, 34, jh, 8), jarCols[Math.floor(r() * jarCols.length)], { edge: 'cut', fibre: false, opacity: 0.9 }));
      jars.push(piece(rect(jx + 6, sy - jh - 8, 22, 10, 2), C.brownDark, { edge: 'cut', fibre: false, shadow: false }));
    }
  }
  // An arched window high on the wall, with a bit of day outside.
  const arch: Array<[number, number]> = [[450, 280]];
  for (let i = 0; i <= 14; i++) {
    const a = Math.PI + (i / 14) * Math.PI;
    arch.push([590 + Math.cos(a) * 130, 150 + Math.sin(a) * 130]);
  }
  arch.push([720, 280]);
  const inner: Array<[number, number]> = [[468, 280]];
  for (let i = 0; i <= 14; i++) {
    const a = Math.PI + (i / 14) * Math.PI;
    inner.push([590 + Math.cos(a) * 112, 150 + Math.sin(a) * 112]);
  }
  inner.push([702, 280]);
  return svg({ w: 1180, h: 820, name: 'b6c1-dungeon', boil: false, className: 'backdrop' }, [
    piece(rect(-20, -20, 1220, 860), STONE_DARK, { edge: 'clean', shadow: false }),
    ...bricks,
    piece(arch, C.brownDark, { rough: 0.8 }),
    piece(inner, C.sky, { edge: 'cut', fibre: false }),
    piece(ellipse(560, 190, 54, 16), C.white, { edge: 'cut', fibre: false, shadow: false, opacity: 0.8 }),
    piece(rect(584, 40, 8, 240), C.brownDark, { edge: 'cut', fibre: false }),
    piece(rect(440, 276, 300, 14, 3), C.wood),
    ...jars,
    // floor
    piece(curve([[-40, 860], [-40, 650], [300, 640], [590, 636], [880, 640], [1220, 650], [1220, 860]], 2), '#2f333b', { rough: 1.2 }),
    piece(ellipse(590, 700, 380, 40), '#262a31', { edge: 'cut', fibre: false, shadow: false, opacity: 0.6 }),
    // hanging cobweb corner
    ink([[0, 0], [90, 90]], { width: 2, color: C.stone }),
    ink([[0, 0], [110, 40]], { width: 2, color: C.stone }),
    ink([[40, 20], [58, 62]], { width: 1.5, color: C.stone }),
  ]);
}

/** A big black cauldron on little legs, 300 × 260. */
function cauldronArt(name: string, liquid: string, liquidLight: string): string {
  return svg({ w: 300, h: 260, name: 'b6c1-cauldron-' + name, label: 'a cauldron' }, [
    ...[70, 230].map((x) => piece(poly([[x - 12, 220], [x + 12, 220], [x + 16, 256], [x - 16, 256]]), C.ink, { edge: 'cut', fibre: false })),
    piece(curve([[24, 70], [10, 150], [60, 226], [150, 236], [240, 226], [290, 150], [276, 70]], 2), '#2a2d34'),
    piece(curve([[60, 120], [50, 170], [90, 206], [130, 214]], 2), '#454a55', { fibre: false, shadow: false, opacity: 0.8 }),
    piece(ellipse(150, 72, 134, 30), C.ink),
    piece(ellipse(150, 72, 118, 22), liquid, { edge: 'cut', fibre: false }),
    piece(ellipse(130, 68, 52, 9), liquidLight, { edge: 'cut', fibre: false, shadow: false, opacity: 0.8 }),
    dot(200, 70, 8, liquidLight, 0.9),
    dot(96, 76, 6, liquidLight, 0.9),
    piece(rect(120, 150, 60, 36, 4), C.cream, { edge: 'cut', fibre: false, shadow: false }),
    ink([[130, 164], [170, 164]], { width: 3, color: C.brownDark }),
    ink([[134, 176], [166, 176]], { width: 3, color: C.brownDark }),
  ]);
}

/** A long wooden ladle, 60 × 260 (the bowl is at the bottom). */
function ladleArt(): string {
  return svg({ w: 60, h: 260, name: 'b6c1-ladle', label: 'a stirring spoon' }, [
    piece(rect(26, 6, 10, 200, 4), C.wood, { edge: 'cut' }),
    piece(ellipse(31, 226, 24, 28), C.brownDark),
    piece(ellipse(31, 226, 16, 20), C.wood, { edge: 'cut', fibre: false, shadow: false }),
  ]);
}

/** A little round plate with a gold rim, 160 × 50. */
function plateArt(): string {
  return svg({ w: 160, h: 50, name: 'b6c1-plate' }, [
    piece(ellipse(80, 30, 76, 16), C.white),
    piece(ellipse(80, 28, 56, 10), C.cream, { edge: 'cut', fibre: false, shadow: false }),
    ink([[10, 32], [150, 32]], { width: 2, color: C.gold }),
  ]);
}

/** A piece of sugary crystallised pineapple, 90 × 90. */
function pineappleArt(): string {
  return svg({ w: 90, h: 90, name: 'b6c1-pineapple', label: 'crystallised pineapple' }, [
    piece(curve([[10, 50], [30, 14], [70, 12], [82, 50], [60, 80], [24, 78]], 2), C.yellow),
    piece(curve([[24, 50], [38, 28], [62, 28], [66, 52], [48, 66]], 2), C.goldLight, { edge: 'cut', fibre: false, shadow: false }),
    ...[[28, 30], [58, 22], [72, 52], [40, 70], [22, 56], [52, 48]].map(([x, y]) => dot(x, y, 3, C.white, 0.9)),
  ]);
}

/** A soft golden halo, 300 × 300. */
function haloArt(): string {
  return svg({ w: 300, h: 300, name: 'b6c1-halo', boil: false }, [
    piece(circle(150, 150, 146), C.goldLight, { edge: 'cut', fibre: false, shadow: false, opacity: 0.22 }),
    piece(circle(150, 150, 100), C.candle, { edge: 'cut', fibre: false, shadow: false, opacity: 0.3 }),
  ]);
}

// ------------------------------------------------------------------ helpers

const POT = { x: 390, y: 420, w: 300 };
const POT_C: [number, number] = [540, 470];

/** One swirl of the ladle: swish, swing across, swing back. */
async function stir(k: Kit, ladle: HTMLElement, hero: HTMLElement): Promise<void> {
  swish();
  await k.all(
    k.to(ladle, 0.28, { rotation: -16, x: -40, ease: 'sine.inOut' }),
    k.to(hero, 0.28, { rotation: -4, ease: 'sine.inOut' }),
  );
  swish();
  await k.all(
    k.to(ladle, 0.28, { rotation: 16, x: 40, ease: 'sine.inOut' }),
    k.to(hero, 0.28, { rotation: 4, ease: 'sine.inOut' }),
  );
}

/** Three happy chomps. */
function munch(): void {
  const t = now();
  for (let i = 0; i < 3; i++) {
    noiseBurst(t + i * 0.12, { freq: 1800, q: 2, peak: 0.08, attack: 0.005, decay: 0.07, type: 'bandpass' });
  }
}

// -------------------------------------------------------------------- story

export default defineStory({
  lines: {
    intro: { who: 'narrator', text: 'Welcome to Professor Slughorn’s steamy potions dungeon. Let’s stir the cauldron!' },
    stir: { who: 'slughorn', text: 'Five stirs, my dear… gently now! Round and round she goes!' },
    gold: { who: 'slughorn', text: 'Oh my! Golden and shining! That’s Felix Felicis… liquid luck!' },
    sip: { who: 'narrator', text: 'You take one tiny sip… and feel wonderfully, brilliantly lucky!' },
    luck: { who: 'slughorn', text: 'Ho ho! A cake, plop, on the plate! And look… a kite!' },
    treat: { who: 'slughorn', text: 'Splendid, {name}! Crystallised pineapple? My very favourite!' },
    end: { who: 'narrator', text: 'Five stirs, one golden potion… and a very lucky day!' },
  },

  async play(k) {
    k.backdrop(dungeon());
    const halo = k.add(haloArt(), { x: 340, y: 340, w: 400, z: 6 });
    k.set(halo, { opacity: 0 });
    const plain = k.add(cauldronArt('green', C.green, C.greenDark), { ...POT, z: 10 });
    const gold = k.add(cauldronArt('gold', C.gold, C.yellow), { ...POT, z: 11 });
    k.set(gold, { opacity: 0 });
    const ladle = k.add(ladleArt(), { x: 510, y: 300, w: 60, z: 12 });
    k.set(ladle, { transformOrigin: '50% 90%' });
    k.add(plateArt(), { x: 712, y: 612, w: 150, z: 9 });
    const hero = k.character('hero', { x: 170, y: 340, z: 20 });
    const slug = k.character('slughorn', { x: 850, y: 320, z: 20 });
    k.set([hero, slug], { opacity: 0 });

    k.music('cosy');
    k.ambient('dust', { count: 14 });
    const dim = k.dim(0.3);
    const potLight = k.light(540, 470, 200, { color: C.green, strength: 0.35, flicker: true });
    k.light(590, 170, 160, { color: C.sky, strength: 0.3 });

    // Steam and bubbles as the curtains open.
    await k.wait(300);
    bubbling();
    k.puff(540, 380, 120, C.white);
    k.sfx.whoosh();
    await k.all(k.enter(hero, 'left'), k.enter(slug, 'right'));
    void k.float(slug, 4, 2.2);
    await k.say('intro');

    // Five stirs, counted out loud on the caption.
    await k.say('stir', slug);
    void k.camera({ zoom: 1.35, x: 520, y: 470 }, 1.2);
    const counts = ['One!', 'Two!', 'Three!', 'Four!', 'Five!'];
    for (let i = 0; i < counts.length; i++) {
      k.caption(counts[i]);
      k.fx.bubbles(2 + i);
      k.puff(POT_C[0] + (i % 2 ? 40 : -40), 395, 70 + i * 12, C.white);
      await stir(k, ladle, hero);
    }
    k.set(hero, { rotation: 0 });

    // It turns shining gold.
    k.music('magic');
    k.fx.rumble(0.6);
    await k.shake(plain, 4, 3);
    luckyChime();
    k.fx.twinkle();
    void k.fade(potLight, 0, 0.8);
    k.light(540, 470, 260, { color: C.goldLight, strength: 0.55, flicker: true });
    void k.fade(dim, 0.15, 1);
    void k.fade(halo, 1, 0.8);
    void k.glow(C.goldLight, 0.4, 1.4);
    await k.fade(gold, 1, 0.8);
    k.sparkle(POT_C[0], 400, 20, 150);
    await k.all(k.say('gold', slug), k.pop(slug, 1.06));

    // A sip of luck.
    k.fx.pop();
    await k.hop(hero, 30, 1);
    await k.say('sip');

    // Lucky things: a cake lands on the plate; a kite floats past the window.
    void k.camera({}, 1);
    const kite = k.picture('kite', { x: 1180, y: 100, w: 170, z: 15 });
    const cake = k.picture('cake', { x: 696, y: -180, w: 170, z: 14 });
    k.sfx.sparkle();
    void k.to(kite, 3.4, { x: -760, y: 80, rotation: -10, ease: 'sine.inOut' });
    const say = k.say('luck', slug);
    await k.wait(900);
    k.fx.whizz();
    await k.to(cake, 0.7, { y: 640, ease: 'power2.in' });
    k.fx.thud();
    await k.to(cake, 0.25, { scaleY: 0.9, scaleX: 1.06, ease: 'sine.out' });
    await k.to(cake, 0.2, { scaleY: 1, scaleX: 1, ease: 'back.out(2)' });
    luckyChime();
    k.sparkle(780, 560, 14, 100);
    await say;
    k.remove(kite);

    // Slughorn offers a treat.
    await k.camera({ zoom: 1.3, x: 760, y: 440 }, 1);
    const pine = k.add(pineappleArt(), { x: 780, y: 440, w: 90, z: 22 });
    await k.appear(pine, 0.3);
    await k.all(k.say('treat', slug), k.pop(slug, 1.06));
    await k.to(pine, 0.7, { x: -480, y: -10, rotation: 360, ease: 'sine.inOut' });
    munch();
    void k.vanish(pine, 0.2);
    await k.hop(hero, 26, 1);

    // The rest of the words rise from the potion for a big finish.
    k.music('triumph');
    void k.camera({}, 1.4);
    const rest: Array<[string, number]> = [['snake', 70], ['cave', 280], ['five', 880]];
    const pics = rest.map(([w]) => {
      const p = k.picture(w, { x: 470, y: 380, w: 150, z: 30 });
      k.set(p, { opacity: 0, scale: 0.3 });
      return p;
    });
    k.fx.jingle();
    k.confetti(40);
    k.sparkle(540, 300, 16, 220);
    for (let i = 0; i < pics.length; i++) {
      k.fx.pop();
      bubbling();
      void k.to(pics[i], 0.6, { x: rest[i][1] - 470, y: -340, scale: 1, opacity: 1, ease: 'back.out(1.6)' });
      await k.wait(250);
    }
    for (const p of pics) void k.float(p, 6, 2.4);
    await k.all(k.say('end'), k.hop(hero, 44, 2));
    await k.wait(1500);
  },
});
