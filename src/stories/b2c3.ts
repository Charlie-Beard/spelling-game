/**
 * Book 2, chapter 3: The Flying Car.
 *
 * You fly the turquoise car to Hogwarts, it sputters and bumps into the
 * Whomping Willow, which whomps it with its branches. You tumble out onto the
 * soft grass, the car honks and zooms off into the forest, and the willow is
 * still grumpy … until your wand sends a little moth to tickle its nose. One
 * enormous sneeze shakes out a wing, a king, a ring and a sink, and the
 * willow giggles and waves.
 */
import { gsap } from 'gsap';
import { characters } from '../art/characters';
import {
  C,
  band,
  circle,
  curve,
  defineStory,
  dot,
  ellipse,
  ink,
  noiseBurst,
  now,
  piece,
  poly,
  raw,
  rect,
  rng,
  svg,
  tone,
  type Kit,
  type Node,
  type Pt,
} from './kit';

// ------------------------------------------------------------------ sounds

/** The little car's engine: a soft putt-putt-putt. */
function engine(seconds: number, gap = 0.13): void {
  const t = now();
  for (let s = 0; s < seconds; s += gap) {
    const fade = 1 - (s / seconds) * 0.5;
    tone(82 + Math.random() * 8, t + s, { wave: 'triangle', peak: 0.11 * fade, attack: 0.008, decay: 0.08, glideTo: 58, lowpass: 600 });
    noiseBurst(t + s, { freq: 320, type: 'lowpass', peak: 0.05 * fade, decay: 0.05 });
  }
}

/** The engine coughing and spluttering. */
function sputter(): void {
  const t = now();
  [0, 0.15, 0.21, 0.5, 0.58, 0.9].forEach((d, i) => {
    tone(96 - i * 6, t + d, { wave: 'triangle', peak: 0.13, decay: 0.1, glideTo: 48, lowpass: 700 });
    noiseBurst(t + d, { freq: 520, q: 0.8, peak: 0.09, decay: 0.07 });
  });
  tone(420, t + 1.15, { peak: 0.1, decay: 0.1, glideTo: 900 });
}

/** A friendly old car horn: meep meep. */
function honk(times = 2): void {
  const t = now();
  for (let i = 0; i < times; i++) {
    const s = t + i * 0.34;
    tone(330, s, { wave: 'sawtooth', peak: 0.07, attack: 0.05, decay: 0.2, lowpass: 1300, vibrato: [7, 4] });
    tone(415, s, { wave: 'sawtooth', peak: 0.06, attack: 0.05, decay: 0.2, lowpass: 1300, vibrato: [7, 4] });
  }
}

/** A big branch swishing down and whomping. */
function whomp(): void {
  const t = now();
  noiseBurst(t, { freq: 1300, q: 1, peak: 0.12, attack: 0.08, decay: 0.12, sweepTo: 260 });
  tone(120, t + 0.18, { peak: 0.24, decay: 0.25, glideTo: 50 });
  noiseBurst(t + 0.18, { freq: 480, type: 'lowpass', peak: 0.14, decay: 0.15 });
  noiseBurst(t + 0.22, { freq: 3400, q: 0.7, peak: 0.05, attack: 0.02, decay: 0.35 });
}

/** Moth wings: a tiny soft flutter. */
function flutter(count = 14): void {
  const t = now();
  for (let i = 0; i < count; i++) noiseBurst(t + i * 0.055, { freq: 2300 + (i % 2) * 400, q: 1.5, peak: 0.035, decay: 0.03 });
}

/** The tree breathing in: ah… */
function inhale(): void {
  const t = now();
  noiseBurst(t, { freq: 700, q: 2, peak: 0.07, attack: 0.4, decay: 0.12, sweepTo: 1600 });
  tone(200, t, { wave: 'triangle', peak: 0.05, attack: 0.35, decay: 0.15, glideTo: 300, lowpass: 1100 });
}

/** …choo! A big, soft, woody sneeze. */
function sneeze(): void {
  const t = now();
  noiseBurst(t, { freq: 3000, q: 0.7, peak: 0.24, attack: 0.012, decay: 0.38, sweepTo: 800 });
  tone(330, t, { wave: 'triangle', peak: 0.13, attack: 0.01, decay: 0.32, glideTo: 150, lowpass: 1500 });
  tone(90, t, { peak: 0.18, decay: 0.3, glideTo: 48 });
  noiseBurst(t + 0.12, { freq: 3600, q: 0.7, peak: 0.05, attack: 0.03, decay: 0.5 });
}

/** The kitchen sink landing on the grass: clonk! */
function clonk(): void {
  const t = now();
  [523, 790, 1185].forEach((f, i) => tone(f, t, { peak: 0.09 / (i + 1), attack: 0.003, decay: 0.5 - i * 0.12 }));
  tone(110, t, { peak: 0.18, decay: 0.15, glideTo: 60 });
}

// --------------------------------------------------------------------- art

const BARK = '#6b4a32';
const TEAL = '#5aa39d';
const GLASS = '#2c4048';

/** Hogwarts grounds at dusk: the castle far off, the forest at the left. */
function grounds(): string {
  const r = rng(23);
  const stars: Node[] = [];
  for (let i = 0; i < 24; i++) stars.push(dot(r() * 1180, 20 + r() * 230, 1.4 + r() * 2, C.cream, 0.4 + r() * 0.5));
  const tower = (x: number, top: number, w: number): Node[] => [
    piece(rect(x, top, w, 560 - top), '#3d4470', { rough: 0.7 }),
    piece(poly([[x - 8, top + 4], [x + w / 2, top - w * 1.2], [x + w + 8, top + 4]]), '#4c5480', { rough: 0.7 }),
  ];
  const win = (x: number, y: number) => piece(rect(x, y, 9, 15, 4), C.candle, { edge: 'cut', fibre: false, shadow: false });
  const tree = (x: number, top: number, w: number, col: string) =>
    piece(curve([[x - w, 620], [x - w * 0.8, top + 120], [x - w * 0.4, top + 40], [x, top], [x + w * 0.4, top + 40], [x + w * 0.8, top + 120], [x + w, 620]], 2), col, { rough: 1.3 });
  const tuft = (x: number, y: number) => ink([[x - 8, y], [x - 4, y - 14], [x, y], [x + 4, y - 16], [x + 8, y]], { width: 3, color: '#3f6b4c' });
  return svg({ w: 1180, h: 820, name: 'b2c3-grounds', boil: false, className: 'backdrop' }, [
    piece(rect(-20, -20, 1220, 860), C.nightLight, { edge: 'clean', shadow: false }),
    piece(curve([[-40, 250], [300, 215], [700, 245], [1220, 205], [1220, 640], [-40, 640]], 2), '#454f7e', { rough: 2, shadow: false }),
    piece(curve([[-40, 370], [400, 340], [800, 362], [1220, 332], [1220, 640], [-40, 640]], 2), '#655f8c', { rough: 2, shadow: false }),
    piece(curve([[-40, 462], [400, 436], [800, 452], [1220, 426], [1220, 640], [-40, 640]], 2), '#b48887', { rough: 2, shadow: false }),
    ...stars,
    // crescent moon
    piece(circle(1090, 84, 32), C.cream, { rough: 0.7 }),
    piece(circle(1104, 76, 28), C.nightLight, { edge: 'cut', fibre: false, shadow: false }),
    // soft far clouds
    piece(ellipse(220, 150, 120, 22), '#7b7aa6', { rough: 1.5, shadow: false, opacity: 0.6 }),
    piece(ellipse(760, 110, 150, 20), '#7b7aa6', { rough: 1.5, shadow: false, opacity: 0.5 }),
    // the castle, far away
    ...tower(540, 360, 40),
    ...tower(600, 300, 54),
    ...tower(676, 340, 44),
    ...tower(736, 400, 36),
    piece(rect(520, 430, 270, 130), '#3d4470', { rough: 0.7 }),
    win(553, 400), win(618, 340), win(636, 380), win(690, 380), win(745, 430),
    win(545, 460), win(590, 480), win(650, 456), win(700, 486), win(760, 462),
    // far hills
    piece(curve([[-40, 640], [-40, 548], [260, 520], [560, 540], [860, 515], [1220, 535], [1220, 640]], 2), '#3e5c55', { rough: 1.4 }),
    // the Forbidden Forest
    tree(10, 340, 80, '#22392d'),
    tree(120, 380, 70, '#28433a'),
    tree(220, 420, 60, '#22392d'),
    tree(70, 430, 70, '#2c4a3a'),
    tree(170, 460, 60, '#2c4a3a'),
    tree(280, 490, 50, '#28433a'),
    // the lawn
    piece(curve([[-40, 860], [-40, 600], [300, 572], [640, 592], [900, 566], [1220, 584], [1220, 860]], 2), '#557f4a', { rough: 1.4 }),
    piece(ellipse(960, 628, 300, 46), '#4b7342', { rough: 1.2 }),
    piece(curve([[-40, 860], [-40, 702], [400, 690], [800, 706], [1220, 690], [1220, 860]], 2), '#5f8b52', { rough: 1.6, shadow: false }),
    ...[[60, 640], [250, 616], [480, 650], [700, 628], [1120, 650], [600, 676]].map(([x, y]) => tuft(x, y)),
  ]);
}

/**
 * The turquoise flying car, facing right (360 × 224). With `head`, the
 * child's character peeks out of the front window.
 */
function carArt(head: string | null): string {
  const rear: Pt[] = [[120, 50], [176, 50], [176, 120], [100, 120]];
  const front: Pt[] = [[188, 50], [242, 50], [272, 120], [188, 120]];
  const s = 0.44;
  const nodes: Node[] = [
    piece(curve([[16, 186], [14, 130], [80, 120], [108, 36], [250, 36], [288, 120], [344, 128], [348, 186]], 2), TEAL),
    piece(poly(rear), GLASS, { edge: 'cut', fibre: false }),
    piece(poly(front), GLASS, { edge: 'cut', fibre: false }),
  ];
  if (head) {
    nodes.push(
      raw(
        `<defs><clipPath id="b2c3-win"><polygon points="${front.map((p) => p.join(',')).join(' ')}"/></clipPath></defs>` +
          `<g clip-path="url(#b2c3-win)"><g transform="translate(${222 - 150 * s} ${90 - 142 * s}) scale(${s})">${head}</g></g>`,
      ),
    );
  }
  nodes.push(
    piece(poly(rear), '#d6e8f5', { edge: 'cut', fibre: false, shadow: false, opacity: 0.2 }),
    piece(poly(front), '#d6e8f5', { edge: 'cut', fibre: false, shadow: false, opacity: 0.2 }),
    piece(poly([[128, 56], [138, 56], [118, 112], [108, 112]]), C.white, { edge: 'clean', shadow: false, opacity: 0.35 }),
    piece(rect(16, 142, 332, 9, 3), C.white, { fibre: false, shadow: false }),
    ink([[182, 124], [182, 182]], { width: 2.5, color: '#3f7f7a' }),
    piece(rect(192, 130, 18, 6, 3), C.stoneLight, { edge: 'cut', fibre: false, shadow: false }),
    piece(rect(334, 162, 26, 12, 4), C.stoneLight, { fibre: false }),
    piece(rect(2, 162, 24, 12, 4), C.stoneLight, { fibre: false }),
    piece(circle(343, 140, 9), C.yellow, { edge: 'cut' }),
    piece(rect(14, 130, 8, 12, 2), C.red, { edge: 'cut', fibre: false }),
    piece(rect(0, 178, 22, 7, 3), C.greyDark, { fibre: false }),
    piece(circle(84, 188, 30), C.charcoal),
    piece(circle(282, 188, 30), C.charcoal),
    piece(circle(84, 188, 12), C.stoneLight, { edge: 'cut' }),
    piece(circle(282, 188, 12), C.stoneLight, { edge: 'cut' }),
  );
  return svg({ w: 360, h: 224, name: head ? 'b2c3-car-full' : 'b2c3-car', label: 'the flying car' }, nodes);
}

/** A soft, wide paper cloud (320 × 130) to fly over. */
function cloudArt(name: string, col: string): string {
  return svg({ w: 320, h: 130, name, boil: false }, [
    piece(curve([[10, 112], [22, 80], [66, 66], [100, 32], [158, 20], [204, 46], [252, 38], [298, 70], [312, 112]], 2), col, { rough: 1.3 }),
    piece(ellipse(150, 52, 44, 16, -8), C.white, { edge: 'cut', fibre: false, shadow: false, opacity: 0.35 }),
  ]);
}

/**
 * The willow's happy face, drawn over its grumpy one (300 × 340, same frame
 * as the portrait): bark patches hide the scowl, then smiley eyes and a grin.
 */
function happyFace(): string {
  const dark = '#2b1d14';
  const patch = { edge: 'cut', fibre: false, shadow: false } as const;
  return svg({ w: 300, h: 340, name: 'b2c3-willow-happy', boil: false }, [
    piece(ellipse(127, 153, 24, 11, 20), BARK, patch),
    piece(ellipse(173, 153, 24, 11, -20), BARK, patch),
    piece(ellipse(150, 222, 34, 20), BARK, patch),
    // eyes, a little brighter
    piece(ellipse(130, 170, 14, 12), dark, { edge: 'cut', fibre: false }),
    piece(ellipse(172, 170, 14, 12), dark, { edge: 'cut', fibre: false }),
    piece(circle(132, 168, 6), C.yellow, { edge: 'clean', shadow: false }),
    piece(circle(170, 168, 6), C.yellow, { edge: 'clean', shadow: false }),
    // raised, friendly brows
    ink([[112, 150], [126, 140], [142, 146]], { width: 6, color: '#4f3422' }),
    ink([[188, 150], [174, 140], [158, 146]], { width: 6, color: '#4f3422' }),
    // rosy cheeks and a big grin
    piece(circle(112, 198, 9), C.pink, { edge: 'clean', fibre: false, shadow: false, opacity: 0.45 }),
    piece(circle(190, 198, 9), C.pink, { edge: 'clean', fibre: false, shadow: false, opacity: 0.45 }),
    piece(curve([[122, 210], [150, 218], [178, 210], [170, 230], [150, 238], [130, 230]], 2), dark, { edge: 'cut', fibre: false }),
  ]);
}

/** The child's portrait without its outer <svg>, to tuck into the car. */
function headOf(hero: string): string {
  const art = characters[hero]?.() ?? '';
  return art.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
}

/** One of the willow's big whomping branches (340 × 240), pivot at its base (320, 220). */
function branchArt(name: string): string {
  const leaf = (x: number, y: number, rot: number, col: string) => piece(ellipse(x, y, 17, 10, rot), col, { edge: 'cut' });
  const frond = (pts: Pt[]) => piece(band(pts, 5), '#557a4a', { fibre: false });
  return svg({ w: 340, h: 240, name }, [
    frond([[160, 96], [150, 140], [156, 180]]),
    frond([[96, 76], [86, 120], [92, 158]]),
    frond([[230, 140], [222, 180], [228, 210]]),
    piece(band([[322, 224], [250, 150], [150, 92], [36, 72]], 24), BARK),
    piece(band([[206, 122], [176, 52], [126, 24]], 12), BARK),
    piece(band([[104, 82], [62, 118], [44, 150]], 10), BARK),
    ink([[260, 160], [200, 118]], { width: 2.5, color: '#4f3422' }),
    leaf(30, 66, 10, C.greenDark),
    leaf(56, 86, -20, C.green),
    leaf(122, 22, 30, C.greenDark),
    leaf(150, 40, -10, C.green),
    leaf(42, 150, 60, C.greenDark),
    leaf(110, 96, 20, C.green),
    leaf(196, 60, 40, C.greenDark),
    leaf(240, 140, -30, C.green),
  ]);
}

// ------------------------------------------------------------------- story

export default defineStory({
  lines: {
    fly: { who: 'narrator', text: 'Look! You’re flying a magic car all the way to Hogwarts!' },
    wobble: { who: 'narrator', text: 'Uh-oh… the engine’s coughing! Look out for that tree!' },
    ouch: { who: 'willow', text: 'Ouch! Who bumped into me? Shoo! Shoo! Off my branches!' },
    honk: { who: 'narrator', text: 'Honk, honk! The car shakes itself off… and zooms away!' },
    moth: { who: 'narrator', text: 'You wave your wand… and a little moth tickles the willow’s nose.' },
    sneeze: { who: 'willow', text: 'Achoo! Oh my… a wing, a king, a ring… and a sink?' },
    thanks: { who: 'willow', text: 'Hee hee! That tickled! I feel much better now. Thank you, {name}!' },
  },

  async play(k) {
    k.backdrop(grounds());
    k.music('adventure');
    const dark = k.dim(0.22);
    k.light(650, 430, 190, { color: C.candle, strength: 0.35, flicker: true });
    k.light(1090, 84, 150, { color: '#dfe4ff', strength: 0.3 });
    k.ambient('fireflies', { count: 12, z: 5, area: [0, 470, 1180, 200] });

    // The Whomping Willow, with two big branches tucked behind its trunk.
    const willow = k.character('willow', { x: 760, y: 200, w: 380, z: 14 });
    const branchL = limb(willow, branchArt('b2c3-branch-l'), 139 - 320, 165 - 220, '320px 220px', false);
    const branchR = limb(willow, branchArt('b2c3-branch-r'), 241 - 20, 165 - 220, '20px 220px', true);
    const sway = (el: HTMLElement, deg: number) => k.to(el, 0.5, { rotation: deg, ease: 'sine.inOut' });

    // The willow's happy face, hidden until the very end.
    const happy = overlay(willow, happyFace());
    k.set(happy, { opacity: 0 });

    // Fluffy clouds under the car, drifting by.
    const clouds = [
      k.add(cloudArt('b2c3-cloud-a', '#d9d4e8'), { x: 30, y: 225, w: 300, z: 11 }),
      k.add(cloudArt('b2c3-cloud-b', '#c9c3dc'), { x: 430, y: 245, w: 260, z: 11 }),
      k.add(cloudArt('b2c3-cloud-c', '#cfc9e0'), { x: 640, y: 180, w: 220, z: 11 }),
      k.add(cloudArt('b2c3-cloud-d', '#e4e0ef'), { x: 150, y: 290, w: 340, z: 13 }),
    ];

    // You, flying the car: it swoops in over the clouds.
    const car = k.add(carArt(headOf(k.hero)), { x: 250, y: 90, w: 300, z: 12 });
    k.set(car, { x: -640, y: -110, rotation: 8, opacity: 1 });

    await k.wait(400);
    engine(4.6);
    k.sfx.whoosh();
    void k.all(...clouds.map((c, i) => k.to(c, 7, { x: `-=${140 + i * 40}`, ease: 'none' })));
    await k.all(
      k.to(car, 1.5, { x: 0, ease: 'power1.out' }),
      k.to(car, 0.85, { y: 70, rotation: -6, ease: 'sine.in' }).then(() => k.to(car, 0.65, { y: 0, rotation: 0, ease: 'sine.out' })),
    );
    honk(1);
    await k.all(k.say('fly'), bob(k, car, 3));

    // Sputter, wobble … bump!
    sputter();
    void k.camera({ zoom: 1.3, x: 700, y: 300 }, 2.2);
    // A little grey puff from the exhaust pipe at the back of the car.
    const exhaust = (): void => {
      const x = 250 + Number(gsap.getProperty(car, 'x'));
      const y = 90 + Number(gsap.getProperty(car, 'y'));
      k.puff(x + 6, y + 160, 70, C.stone);
    };
    await k.all(
      k.say('wobble'),
      (async () => {
        for (let i = 0; i < 3; i++) {
          exhaust();
          await k.to(car, 0.22, { rotation: -9, y: '+=10' });
          await k.to(car, 0.22, { rotation: 7, y: '-=4' });
        }
        await k.to(car, 0.2, { rotation: 0 });
      })(),
    );
    void k.all(...clouds.map((c) => k.fade(c, 0, 0.6)));
    k.sfx.whoosh();
    await k.to(car, 0.7, { x: '+=290', y: '+=150', rotation: 12, ease: 'power2.in' });
    k.fx.thud();
    k.fx.boing();
    void k.to(car, 0.1, { scaleX: 0.88, scaleY: 1.1 }).then(() => k.to(car, 0.25, { scaleX: 1, scaleY: 1, ease: 'back.out(3)' }));
    k.puff(840, 360, 150, C.green);
    void k.quake(6);
    await k.all(k.to(car, 0.3, { x: '-=40', rotation: -4, ease: 'power2.out' }), k.shake(willow, 8, 2));

    // The willow is NOT happy.
    await k.all(k.say('ouch', willow), (async () => {
      await sway(branchL, 8);
      await sway(branchL, -6);
      await sway(branchL, 0);
    })());

    // Whomp! Whomp!
    for (const [dx, dy, rot] of [[-80, 50, -16], [-70, -20, 10]] as const) {
      whomp();
      await k.to(branchL, 0.18, { rotation: -32, ease: 'power2.in' });
      await k.all(
        k.to(branchL, 0.4, { rotation: 0, ease: 'back.out(2)' }),
        k.to(car, 0.32, { x: `+=${dx}`, y: `+=${dy}`, rotation: rot, ease: 'power2.out' }),
      );
      k.fx.boing();
      await k.wait(150);
    }

    // You tumble out onto the soft grass.
    await k.camera({}, 0.8);
    const hero = k.character('hero', { x: 300, y: 380, w: 250, z: 20 });
    const carBox = car.getBoundingClientRect();
    const stageBox = k.root.getBoundingClientRect();
    const sx = stageBox.width / 1180 || 1;
    const cx = (carBox.left - stageBox.left + carBox.width / 2) / sx;
    const cy = (carBox.top - stageBox.top + carBox.height / 2) / sx;
    swapArt(car, carArt(null));
    k.fx.pop();
    k.puff(cx, cy - 20, 110, C.cream);
    k.set(hero, { x: cx - 425, y: cy - 521, scale: 0.4, rotation: -360, opacity: 1 });
    await k.to(hero, 0.8, { x: 0, y: 0, scale: 1, rotation: 0, ease: 'power1.in' });
    k.fx.thud();
    k.set(hero, { transformOrigin: '50% 100%' });
    void k.to(hero, 0.1, { scaleY: 0.88, scaleX: 1.1 });
    await k.wait(100);
    await k.to(hero, 0.3, { scaleY: 1, scaleX: 1, ease: 'back.out(3)' });

    // The car shakes itself off, honks and zooms away into the forest.
    await k.to(car, 0.3, { rotation: 0 });
    await k.shake(car, 8, 2);
    honk();
    k.face(car, true);
    engine(1.6, 0.1);
    await k.all(
      k.say('honk'),
      (async () => {
        k.fx.whizz();
        await k.to(car, 1.6, { x: -480 + 250 - 250, y: 270, scale: 0.2, rotation: -6, ease: 'power1.in' });
        await k.fade(car, 0, 0.3);
      })(),
    );
    k.remove(car);

    // Still grumpy: the branches thrash about.
    void (async () => {
      await sway(branchR, -10);
      await sway(branchR, 6);
      await sway(branchR, 0);
    })();
    await k.shake(willow, 6, 1);

    // Your wand sends a moth to tickle its nose.
    // (It ends up on the willow's nose, between its eyes and mouth.)
    const moth = k.picture('moth', { x: 539, y: 535, w: 90, z: 30 });
    k.set(moth, { opacity: 0 });
    await k.all(
      k.say('moth', hero),
      (async () => {
        k.fx.spell();
        await k.hop(hero, 30);
        k.fx.twinkle();
        k.sparkle(584, 580, 10, 90);
        await k.appear(moth, 0.35);
        flutter(30);
        const path: Array<[number, number]> = [[80, -70], [70, 10], [80, -60], [70, -20], [66, 10]];
        for (const [dx, dy] of path) await k.to(moth, 0.32, { x: `+=${dx}`, y: `+=${dy}`, rotation: dy < 0 ? -12 : 10, ease: 'sine.inOut' });
        await k.to(moth, 0.2, { rotation: 0 });
      })(),
    );

    // Ah … ah … ACHOO!
    k.music('magic');
    void k.camera({ zoom: 1.4, x: 880, y: 330 }, 0.9);
    for (let i = 0; i < 2; i++) {
      inhale();
      await k.to(willow, 0.45, { scale: 1.04 + i * 0.03, y: '-=6', ease: 'sine.out' });
      await k.to(willow, 0.15, { scale: 1, y: '+=6', ease: 'sine.in' });
    }
    await k.wait(200);
    sneeze();
    void k.camera({}, 0.6);
    k.puff(950, 410, 180, C.cream);
    void k.quake(7);
    void k.all(
      k.to(branchL, 0.15, { rotation: 18 }).then(() => k.to(branchL, 0.5, { rotation: 0, ease: 'back.out(2)' })),
      k.to(branchR, 0.15, { rotation: -18 }).then(() => k.to(branchR, 0.5, { rotation: 0, ease: 'back.out(2)' })),
    );
    void k.to(moth, 1.2, { x: '+=320', y: '-=420', rotation: 540, ease: 'power1.out' });
    await k.pop(willow, 1.1);

    // Everything stuck in its branches pops out!
    const wing = k.picture('wing', { x: 420, y: 110, w: 150, z: 22 });
    const king = k.picture('king', { x: 70, y: 450, w: 190, z: 22 });
    const ring = k.picture('ring', { x: 190, y: 540, w: 140, z: 24 });
    const sink = k.picture('sink', { x: 580, y: 500, w: 160, z: 22 });
    const fling = async (el: HTMLElement, from: Pt, to: Pt, delay: number, land: () => void) => {
      k.set(el, { x: from[0] - to[0], y: from[1] - to[1], scale: 0.3, opacity: 1, rotation: -200 });
      await k.wait(delay);
      k.fx.pop();
      const t = 0.9;
      await k.all(
        k.to(el, t, { x: 0, scale: 1, rotation: 0, ease: 'none' }),
        k.to(el, t * 0.4, { y: `-=${120}`, ease: 'power2.out' }).then(() => k.to(el, t * 0.6, { y: 0, ease: 'power2.in' })),
      );
      land();
    };
    await k.all(
      k.say('sneeze', willow),
      fling(wing, [880, 240], [420, 110], 0, () => {
        flutter(10);
        k.float(wing, 10, 1.6);
      }),
      fling(king, [860, 300], [70, 450], 350, () => {
        k.fx.thud();
        void k.hop(king, 30);
      }),
      fling(ring, [1040, 300], [190, 540], 700, () => {
        k.sfx.gem();
        k.sparkle(255, 600, 8, 70);
        k.float(ring, 5, 1.8);
      }),
      fling(sink, [960, 220], [580, 500], 1150, () => {
        clonk();
        k.float(sink, 3, 2.2);
        void k.pop(sink, 1.12);
        void k.shake(hero, 6, 1);
      }),
    );

    // Calm at last. The willow smiles, giggles and waves a branch.
    k.music('triumph');
    k.sfx.reveal();
    void k.fade(dark, 0.1, 1);
    await k.fade(happy, 1, 0.5);
    await k.all(
      k.say('thanks', willow),
      (async () => {
        for (let i = 0; i < 3; i++) {
          await k.to(branchR, 0.35, { rotation: -16, ease: 'sine.inOut' });
          await k.to(branchR, 0.35, { rotation: 4, ease: 'sine.inOut' });
        }
        await k.to(branchR, 0.3, { rotation: 0 });
      })(),
    );
    k.fx.jingle();
    k.confetti(34);
    k.sparkle(425, 470, 14, 160);
    await k.all(k.hop(hero, 50, 2), k.hop(king, 30, 2), sway(branchL, 10).then(() => sway(branchL, 0)));
    await k.wait(1400);
  },
});

// ---------------------------------------------------------------- helpers

/** Adds a branch behind the willow's trunk, inside its actor, pivoting at its base. */
function limb(tree: HTMLElement, art: string, left: number, top: number, origin: string, flip: boolean): HTMLElement {
  const el = document.createElement('div');
  el.style.cssText = `position:absolute;left:${left}px;top:${top}px;width:340px;height:240px;z-index:-1;transform-origin:${origin}`;
  const inner = document.createElement('div');
  inner.className = 'story-flip';
  inner.innerHTML = art;
  if (flip) inner.style.transform = 'scaleX(-1)';
  el.append(inner);
  tree.prepend(el);
  return el;
}

/** Lays extra art exactly over an actor's own art (e.g. a new face). */
function overlay(actor: HTMLElement, art: string): HTMLElement {
  const el = document.createElement('div');
  el.className = 'story-flip';
  el.style.cssText = 'position:absolute;left:0;top:0';
  el.innerHTML = art;
  actor.append(el);
  return el;
}

/** Swaps an actor's art in place (keeps its position and motion). */
function swapArt(el: HTMLElement, art: string): void {
  const inner = el.querySelector<HTMLElement>(':scope > .story-flip');
  if (inner) inner.innerHTML = art;
}

/** A few gentle bobs (flying). */
async function bob(k: Kit<string>, el: HTMLElement, times: number): Promise<void> {
  for (let i = 0; i < times; i++) {
    await k.to(el, 0.5, { y: '-=12', rotation: -2, ease: 'sine.inOut' });
    await k.to(el, 0.5, { y: '+=12', rotation: 1, ease: 'sine.inOut' });
  }
}
