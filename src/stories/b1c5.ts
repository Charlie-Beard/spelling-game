/**
 * b1c5 "The Hidden Ring": an old tumbledown shack in the woods at night.
 *
 * Voldemort boasts that his ring is under a rock and that his sticky web
 * (with a bell on it) will catch anyone who comes near. You tiptoe in with
 * your bug net; a ladybird scuttles out from under the rock, Voldemort
 * shrieks, leaps backwards… straight into his own web, where he dangles
 * while his own bell jingles. You lift the rock with your wand and the ring
 * glows. Hedwig watches from a branch.
 */
import { C, NOTE, band, bell, circle, curve, defineStory, ellipse, group, ink, noiseBurst, now, piece, poly, rect, rng, svg, tone, type Node, type Pt } from './kit';

// ------------------------------------------------------------------ sounds

/** A soft night wind with a friendly owl's "hoo… hoo" on top. */
function nightAir(): void {
  const t = now();
  noiseBurst(t, { freq: 420, q: 2.5, peak: 0.07, attack: 1.2, decay: 2.2, sweepTo: 760 });
  hoot(t + 0.7);
}

/** An owl's two-note hoot, low and rounded. */
function hoot(t = now()): void {
  tone(400, t, { peak: 0.12, attack: 0.05, decay: 0.22, glideTo: 360, lowpass: 900 });
  tone(380, t + 0.42, { peak: 0.14, attack: 0.07, decay: 0.55, glideTo: 320, vibrato: [5, 6], lowpass: 900 });
}

/** A stretchy, twangy web: it sags out… and springs back. */
function webBoing(): void {
  const t = now();
  tone(110, t, { wave: 'triangle', peak: 0.16, attack: 0.03, decay: 0.42, glideTo: 330, vibrato: [9, 22], lowpass: 1800 });
  tone(330, t + 0.42, { wave: 'triangle', peak: 0.12, attack: 0.01, decay: 0.5, glideTo: 130, vibrato: [15, 28], lowpass: 1500 });
}

/** A little bell jingling (Voldemort's alarm bell). */
function jingle(count = 6): void {
  const t = now();
  for (let i = 0; i < count; i++) bell(i % 2 ? 1568 : 1760, t + i * 0.085, 0.05, 0.35);
}

/** The ring is found: a warm rising chime with a soft shimmer. */
function ringChime(): void {
  const t = now();
  tone(NOTE.C4, t, { peak: 0.08, attack: 0.1, decay: 1.6 });
  [NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6, NOTE.E6].forEach((n, i) => bell(n, t + i * 0.11, 0.11, 1.3));
  noiseBurst(t + 0.3, { freq: 7000, type: 'highpass', peak: 0.03, attack: 0.3, decay: 1.2 });
}

/** The rock floating up: a gentle rising hum. */
function levitate(): void {
  const t = now();
  tone(220, t, { wave: 'triangle', peak: 0.08, attack: 0.15, decay: 0.9, glideTo: 520, vibrato: [6, 8], lowpass: 1600 });
}

// --------------------------------------------------------------------- art

const W = 1180;

/** A torn-paper fir tree silhouette. */
const fir = (x: number, base: number, h: number, w: number, color: string): Node =>
  piece(
    poly([
      [x, base - h],
      [x + w * 0.22, base - h * 0.7],
      [x + w * 0.12, base - h * 0.7],
      [x + w * 0.38, base - h * 0.38],
      [x + w * 0.22, base - h * 0.38],
      [x + w * 0.5, base],
      [x - w * 0.5, base],
      [x - w * 0.22, base - h * 0.38],
      [x - w * 0.38, base - h * 0.38],
      [x - w * 0.12, base - h * 0.7],
      [x - w * 0.22, base - h * 0.7],
    ]),
    color,
    { rough: 1.3 },
  );

function starsAt(count: number, seed: number): Node[] {
  const r = rng(seed);
  const out: Node[] = [];
  for (let i = 0; i < count; i++) {
    const x = r() * W;
    const y = r() * 330;
    const s = 2 + r() * 3.5;
    const pts: Pt[] = [];
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4;
      const rr = k % 2 ? s * 0.4 : s;
      pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]);
    }
    out.push(piece(poly(pts), r() > 0.8 ? C.goldLight : C.cream, { edge: 'cut', fibre: false, shadow: false, opacity: 0.5 + r() * 0.4 }));
  }
  return out;
}

/** The woods at night with the crooked old shack in the middle. */
function shackNight(): string {
  const plank = '#5e4330';
  const plankDark = '#4a3426';
  const planks: Node[] = [];
  for (let x = 268; x < 700; x += 34) planks.push(ink([[x, 318 - (x - 260) * 0.05], [x + 2, 612]], { width: 2.5, color: '#3a281c', opacity: 0.7 }));
  return svg({ w: W, h: 820, name: 'b1c5-shack', boil: false, className: 'backdrop' }, [
    piece(rect(-20, -20, W + 40, 860), C.night, { edge: 'clean', shadow: false }),
    ...starsAt(40, 51),
    // the moon, peeping over the roof
    piece(circle(600, 100, 54), C.cream, { rough: 0.8 }),
    piece(circle(586, 92, 9), '#e6d6b0', { edge: 'cut', fibre: false, shadow: false }),
    piece(circle(616, 116, 6), '#e6d6b0', { edge: 'cut', fibre: false, shadow: false }),
    // far woods
    ...[60, 170, 300, 420, 760, 880, 990, 1110].map((x, i) => fir(x, 470, 190 + (i % 3) * 40, 130, '#26304f')),
    piece(curve([[-40, 900], [-40, 450], [300, 430], [700, 445], [1220, 430], [1220, 900]], 2), '#252e4c', { rough: 1.4 }),
    // the right-hand tree the web hangs from
    piece(curve([[1040, 640], [1052, 360], [1060, 120], [1064, -30], [1120, -30], [1118, 200], [1124, 420], [1136, 640]], 2), '#3b2e2a', { rough: 1.2 }),
    piece(band([[1070, 210], [1000, 160], [960, 150]], 22), '#3b2e2a'),
    piece(ellipse(1130, 40, 120, 90), C.greenDeep, { rough: 1.6 }),
    piece(ellipse(990, 70, 90, 60), '#2f4a3c', { rough: 1.6 }),
    // the left-hand tree with Hedwig's branch
    piece(curve([[10, 640], [24, 380], [30, 120], [36, -30], [96, -30], [92, 160], [100, 400], [112, 640]], 2), '#3b2e2a', { rough: 1.2 }),
    piece(band([[80, 282], [160, 270], [230, 262]], 20), '#3b2e2a'),
    piece(ellipse(40, 30, 140, 90), C.greenDeep, { rough: 1.6 }),
    // ground
    piece(curve([[-40, 900], [-40, 600], [300, 586], [700, 596], [1220, 584], [1220, 900]], 2), '#2e3b30', { rough: 1.3 }),
    piece(curve([[-40, 900], [-40, 680], [400, 668], [800, 676], [1220, 664], [1220, 900]], 2), '#26322a', { rough: 1, shadow: false }),
    // the shack: wonky walls, saggy roof, leaning chimney
    piece(rect(560, 150, 46, 120), '#6b5a4c', { rough: 1.2 }),
    piece(rect(552, 140, 62, 18), '#57493e', { rough: 1 }),
    piece(poly([[262, 316], [700, 290], [706, 612], [256, 618]]), plank, { rough: 1.2 }),
    ...planks,
    piece(poly([[226, 336], [452, 176], [500, 200], [738, 300], [720, 318], [480, 226], [246, 352]]), '#3d4a3a', { rough: 1.5 }),
    piece(poly([[236, 330], [452, 186], [496, 208], [728, 304], [690, 300], [250, 332]]), '#4a5a44', { rough: 1.4, shadow: false }),
    piece(rect(380, 230, 60, 40), '#5a6a4e', { rough: 1.6, shadow: false }),
    // boarded-up window with a little warm light behind
    piece(rect(296, 380, 90, 70, 6), '#e2b45e', { rough: 1 }),
    piece(rect(296, 380, 90, 70, 6), plankDark, { rough: 1, opacity: 0.35, shadow: false, fibre: false }),
    piece(band([[288, 392], [394, 440]], 14), C.wood),
    piece(band([[288, 440], [394, 388]], 14), C.wood),
    // the crooked door, a little bit open
    piece(poly([[440, 428], [532, 424], [534, 612], [438, 614]]), '#1c1a1e', { rough: 0.8 }),
    piece(poly([[440, 428], [498, 432], [500, 612], [438, 614]]), plankDark, { rough: 0.9 }),
    piece(circle(488, 520, 5), C.gold, { edge: 'cut', fibre: false }),
    // small round window on the right
    piece(circle(630, 400, 30), '#2a2630', { rough: 1 }),
    ink([[600, 400], [660, 400]], { width: 4, color: C.wood }),
    ink([[630, 370], [630, 430]], { width: 4, color: C.wood }),
    // the porch post the web is tied to
    piece(rect(692, 300, 22, 316), C.wood, { rough: 1 }),
    // moss and grass tufts
    ...[[270, 612], [600, 610], [760, 600], [180, 604], [960, 598]].map(([x, y]) =>
      piece(curve([[x - 30, y + 8], [x - 18, y - 14], [x, y - 4], [x + 14, y - 18], [x + 30, y + 8]], 2), '#4f6b48', { rough: 1.2 }),
    ),
  ]);
}

/** Sticky web strands draped over a 300 × 340 portrait. */
function tangle(): string {
  const strand = (pts: Pt[]) => ink(pts, { width: 3.5, color: C.white, opacity: 0.85, wobble: 0.8 });
  const blob = (x: number, y: number) => piece(circle(x, y, 5), C.white, { edge: 'cut', fibre: false, shadow: false, opacity: 0.8 });
  return svg({ w: 300, h: 340, name: 'b1c5-tangle', boil: true }, [
    group({}, [
      strand([[10, 70], [120, 120], [290, 96]]),
      strand([[30, 250], [150, 196], [280, 260]]),
      strand([[40, 20], [110, 150], [170, 330]]),
      strand([[270, 30], [200, 170], [120, 330]]),
      strand([[0, 170], [80, 210], [150, 250], [300, 200]]),
      blob(120, 120), blob(150, 196), blob(200, 170), blob(110, 150), blob(80, 210),
    ]),
  ]);
}

// ------------------------------------------------------------------- story

export default defineStory({
  lines: {
    gloat: { who: 'voldemort', text: 'Ha ha! My ring is hidden under that rock… nobody will ever find it!' },
    trap: { who: 'voldemort', text: 'And if anyone comes near, my web will catch them… and ring my bell!' },
    tiptoe: { who: 'narrator', text: 'Shh… you tiptoe up to the old shack, as quiet as a mouse…' },
    eek: { who: 'voldemort', text: 'Eeek! A bug! A bug! Get it off! Get it off!' },
    lift: { who: 'narrator', text: 'Ha! He’s stuck in his own web! Quick, wave your wand… up goes the rock!' },
    cross: { who: 'voldemort', text: 'No, no, no! I’m stuck… and my silly bell won’t stop jingling!' },
    cheer: { who: 'narrator', text: 'Hooray, {name}! You found the hidden ring!' },
  },

  async play(k) {
    k.backdrop(shackNight());
    k.dim(0.3);
    k.light(600, 100, 170, { color: C.cream, strength: 0.35 });
    k.light(340, 415, 100, { color: C.candle, strength: 0.45, flicker: true });
    const ringLight = k.light(517, 520, 200, { color: C.goldLight, strength: 0 });
    k.ambient('fireflies', { area: [0, 240, 1180, 380], count: 12, z: 34 });
    k.music('sneaky');

    // Props that are there from the start.
    const web = k.picture('web', { x: 680, y: 110, w: 380, z: 6, still: true });
    // The alarm bell hangs on a silk thread from the web, in front of where
    // Voldemort will end up, so it stays in view while he wriggles. It swings
    // from the top of the thread like a pendulum.
    const bellEl = k.picture('bell', { x: 968, y: 392, w: 84, z: 16 });
    const thread = document.createElement('div');
    thread.style.cssText = 'position:absolute;left:41px;top:-62px;width:3px;height:74px;background:#f4ecd8;opacity:.8;border-radius:2px';
    bellEl.prepend(thread);
    k.set(bellEl, { transformOrigin: '50% -62px' });
    const ring = k.horcrux('ring', { x: 452, y: 520, w: 130, z: 13 });
    k.set(ring, { opacity: 0 });
    const rock = k.picture('rock', { x: 420, y: 470, w: 190, z: 14, still: true });
    const owl = k.character('hedwig', { x: 108, y: 150, w: 130, z: 5 });
    k.float(owl, 4, 3);

    // Actors that arrive later.
    const vold = k.character('voldemort', { x: 600, y: 300, z: 10 });
    k.set(vold, { opacity: 0 });
    const hero = k.character('hero', { x: 110, y: 330, z: 11 });
    const net = k.picture('net', { x: 280, y: 390, w: 170, z: 12 });
    k.set([hero, net], { x: -460 });
    const bug = k.picture('bug', { x: 548, y: 556, w: 100, z: 20 });
    k.set(bug, { opacity: 0 });

    // A quiet night… hoo, hoo.
    nightAir();
    await k.wait(700);

    // Voldemort pops up beside his rock.
    k.fx.poof();
    k.puff(730, 450, 240, C.stone);
    await k.appear(vold, 0.35);
    await k.say('gloat', vold);
    void k.pop(rock, 1.06);

    // He shows off his web trap; the bell gives a tiny jingle.
    k.face(vold, true);
    await k.all(
      k.say('trap', vold),
      (async () => {
        await k.wait(1400);
        jingle(3);
        await k.to(bellEl, 0.25, { rotation: 12 });
        await k.to(bellEl, 0.35, { rotation: -8 });
        await k.to(bellEl, 0.3, { rotation: 0 });
      })(),
    );

    // You tiptoe in with your bug net, while he admires his web.
    hoot();
    k.fx.sneak();
    await k.all(
      k.say('tiptoe'),
      k.walk(hero, 460, 2.6, 7),
      k.walk(net, 460, 2.6, 7),
      k.camera({ zoom: 1.15, x: 500, y: 430 }, 2.6),
      k.wait(1300).then(() => k.fx.sneak()),
    );

    // A ladybird scuttles out from under the rock…
    await k.camera({ zoom: 1.4, x: 660, y: 470 }, 0.8);
    k.fx.pop();
    await k.appear(bug, 0.3);
    for (let i = 0; i < 3; i++) {
      k.fx.patter(3, 0.06);
      await k.to(bug, 0.2, { x: '+=40', rotation: 90, ease: 'none' });
    }
    await k.pop(bug, 1.15);
    k.face(vold, false);
    await k.all(k.say('eek', vold), k.shake(vold, 12, 3));

    // …and he leaps backwards, right into his own sticky web!
    await k.to(vold, 0.15, { scaleY: 0.9, transformOrigin: '50% 100%' });
    k.fx.boing();
    await k.to(vold, 0.4, { x: 150, y: -54, rotation: -7, scaleY: 1, ease: 'power2.out' });
    webBoing();
    const strands = document.createElement('div');
    strands.style.cssText = 'position:absolute;inset:0;opacity:0';
    strands.innerHTML = tangle();
    vold.append(strands);
    jingle(8);
    await k.all(
      k.to(strands, 0.3, { opacity: 1 }),
      k.to(web, 0.25, { scaleX: 1.08, scaleY: 0.93 }).then(() => k.to(web, 0.45, { scaleX: 1, scaleY: 1, ease: 'back.out(3)' })),
      k.to(bellEl, 0.2, { rotation: 18 }).then(() => k.to(bellEl, 0.3, { rotation: -14 })).then(() => k.to(bellEl, 0.3, { rotation: 0 })),
      k.shake(vold, 6, 2),
    );

    let stuck = true;
    void (async () => {
      while (stuck) {
        await k.to(vold, 0.6, { rotation: -4, ease: 'sine.inOut' });
        if (!stuck) break;
        await k.to(vold, 0.6, { rotation: -10, ease: 'sine.inOut' });
      }
    })();

    // The ladybird hurries home into your net.
    k.fx.patter(8, 0.06);
    await k.to(bug, 0.2, { rotation: -70 });
    await k.to(bug, 0.7, { x: -215, y: -130, ease: 'none' });
    await k.to(net, 0.15, { rotation: -10 });
    k.fx.pop();
    await k.all(k.to(bug, 0.25, { scale: 0.55, x: -225, y: -140 }), k.to(net, 0.25, { rotation: 0, ease: 'back.out(2)' }));
    k.fx.twinkle();

    // You lift the rock with your wand.
    await k.say('lift');
    k.fx.spell();
    await k.beam([380, 560], [515, 560], C.goldLight);
    levitate();
    await k.to(rock, 0.9, { y: -170, rotation: 8, ease: 'sine.inOut' });
    await k.to(rock, 0.7, { x: 140, y: -40, rotation: -4, ease: 'sine.inOut' });
    await k.to(rock, 0.35, { y: 0, rotation: 0, ease: 'power2.in' });
    k.fx.thud();

    // There it is: the ring, glowing!
    k.music('triumph');
    ringChime();
    k.sparkle(515, 590, 18, 170);
    await k.all(k.appear(ring, 0.5), k.fade(ringLight, 0.7, 0.8));
    await k.to(ring, 0.8, { y: -90, scale: 1.4, ease: 'sine.out' });
    k.sfx.gem();
    k.sparkle(517, 470, 10, 120);
    k.float(ring, 6, 2.4);

    // Voldemort wriggles; his bell just keeps on jingling.
    await k.all(
      k.say('cross', vold),
      (async () => {
        for (let i = 0; i < 2; i++) {
          webBoing();
          jingle(6);
          await k.all(
            k.shake(vold, 8, 2),
            k.to(bellEl, 0.2, { rotation: 16 }).then(() => k.to(bellEl, 0.3, { rotation: -12 })).then(() => k.to(bellEl, 0.25, { rotation: 0 })),
          );
          await k.wait(600);
        }
      })(),
    );

    // Hooray!
    stuck = false;
    await k.camera({}, 1.3);
    k.fx.jingle();
    k.confetti(36);
    k.sparkle(515, 500, 14, 140);
    hoot(now() + 0.6);
    void k.hop(owl, 24, 2);
    await k.all(k.say('cheer'), k.hop(hero, 50, 2), k.hop(net, 50, 2));
    await k.wait(1500);
  },
});
