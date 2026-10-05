/**
 * Book 7, chapter 3: Back to Hogwarts.
 *
 * The courtyard at sunset, thunder rolling. McGonagall raises her wand and
 * stone knights creak awake and march out to guard the castle. She is
 * delighted. A shimmering shield rises over the towers as the lanterns glow.
 */
import { bell, C, circle, curve, defineStory, dot, ellipse, ink, type Kit, noiseBurst, NOTE, now, piece, poly, rect, rng, svg, tone, type Node } from './kit';

// ------------------------------------------------------------------ sounds

/** Heavy stone grinding and cracking awake. */
function stoneGrind(): void {
  const t = now();
  noiseBurst(t, { freq: 220, q: 1.2, peak: 0.12, attack: 0.2, decay: 1.3, sweepTo: 420 });
  tone(70, t, { wave: 'triangle', peak: 0.1, attack: 0.3, decay: 1.2, glideTo: 55, lowpass: 400 });
  const r = rng(31);
  for (let i = 0; i < 6; i++) noiseBurst(t + 0.2 + i * 0.17 + r() * 0.05, { freq: 900 + r() * 700, q: 2, peak: 0.04, decay: 0.07 });
}

/** Armour clanking in march rhythm: left, right, left, right. */
function armourMarch(steps: number, gap = 0.5): void {
  const t = now();
  for (let i = 0; i < steps; i++) {
    const at = t + i * gap;
    tone(i % 2 ? 130 : 105, at, { wave: 'triangle', peak: 0.14, attack: 0.005, decay: 0.16, glideTo: 70, lowpass: 600 });
    noiseBurst(at, { freq: 3400, q: 5, peak: 0.05, attack: 0.002, decay: 0.07, type: 'bandpass' });
    bell(i % 2 ? NOTE.G5 : NOTE.E5, at + 0.02, 0.025, 0.25);
  }
}

/** A soft, shimmering rising chime as the shield spreads. */
function shieldShimmer(): void {
  const t = now();
  const notes = [NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6, NOTE.E6, NOTE.G6, NOTE.C7];
  notes.forEach((f, i) => bell(f, t + i * 0.16, 0.08, 1.4));
  tone(NOTE.C4, t, { peak: 0.05, attack: 0.9, decay: 2, vibrato: [4, 3] });
  noiseBurst(t, { freq: 2500, q: 0.6, peak: 0.05, attack: 0.9, decay: 1.2, sweepTo: 6000, type: 'highpass' });
}

// --------------------------------------------------------------------- art

const STONE = '#8c8f98';
const STONE_DARK = '#6c6f7a';

/** A stone knight in armour, with a little spear. */
function knightArt(): string {
  return svg({ w: 140, h: 260, name: 'b7c3-knight', boil: false }, [
    // spear
    ink([[112, 30], [112, 250]], { width: 5, color: C.brownDark }),
    piece(poly([[112, 0], [104, 34], [120, 34]]), C.grey, { edge: 'cut', fibre: false }),
    // legs
    piece(rect(44, 170, 22, 80, 4), STONE_DARK, { edge: 'cut', fibre: false }),
    piece(rect(74, 170, 22, 80, 4), STONE_DARK, { edge: 'cut', fibre: false }),
    piece(rect(38, 240, 32, 14, 4), STONE, { edge: 'cut', fibre: false, shadow: false }),
    piece(rect(70, 240, 32, 14, 4), STONE, { edge: 'cut', fibre: false, shadow: false }),
    // body
    piece(rect(32, 84, 76, 96, 14), STONE, { edge: 'cut' }),
    piece(rect(48, 112, 44, 10, 3), STONE_DARK, { edge: 'clean', fibre: false, shadow: false }),
    piece(circle(26, 98, 17), STONE_DARK, { edge: 'cut', fibre: false }),
    piece(circle(114, 98, 17), STONE_DARK, { edge: 'cut', fibre: false }),
    // helmet
    piece(rect(44, 20, 52, 66, 20), STONE, { edge: 'cut' }),
    piece(rect(52, 44, 36, 10, 3), C.ink, { edge: 'clean', fibre: false, shadow: false }),
    piece(curve([[70, 4], [58, 18], [82, 18]]), C.red, { edge: 'cut', fibre: false }),
    dot(62, 49, 2.5, C.goldLight),
    dot(78, 49, 2.5, C.goldLight),
  ]);
}

/** A little round lantern on a post. */
function lanternPost(): string {
  return svg({ w: 80, h: 240, name: 'b7c3-lamppost', boil: false }, [
    piece(rect(36, 60, 8, 180, 2), C.brownDark, { edge: 'cut', fibre: false }),
    piece(rect(20, 22, 40, 44, 6), C.gold, { edge: 'cut', fibre: false }),
    piece(rect(26, 28, 28, 32, 4), C.candle, { edge: 'clean', fibre: false, shadow: false }),
    piece(poly([[16, 24], [40, 4], [64, 24]]), C.brownDark, { edge: 'cut', fibre: false }),
  ]);
}

/** The shield over the castle: a big translucent dome with a few paper stars. */
function shieldArt(): string {
  const r = rng(907);
  const stars: Node[] = [];
  for (let i = 0; i < 16; i++) {
    const a = Math.PI + r() * Math.PI;
    const d = 0.25 + r() * 0.7;
    stars.push(dot(500 + Math.cos(a) * 460 * d, 400 + Math.sin(a) * 380 * d, 2 + r() * 3, C.white, 0.7));
  }
  return svg({ w: 1000, h: 420, name: 'b7c3-shield', boil: false }, [
    piece(ellipse(500, 420, 490, 410), C.sky, { edge: 'clean', fibre: false, shadow: false, opacity: 0.08 }),
    piece(ellipse(500, 420, 440, 360), C.white, { edge: 'clean', fibre: false, shadow: false, opacity: 0.05 }),
    ink(Array.from({ length: 24 }, (_, i): [number, number] => { const a = Math.PI + (i / 23) * Math.PI; return [500 + Math.cos(a) * 490, 420 + Math.sin(a) * 410]; }), { width: 6, color: C.sky, opacity: 0.6 }),
    ...stars,
  ]);
}

/** The courtyard at sunset, as a pop-up paper scene. */
function courtyard(): string {
  const r = rng(703);
  const tower = (x: number, w: number, top: number, col: string): Node[] => [
    piece(rect(x, top, w, 520 - top), col, { edge: 'cut', fibre: false }),
    piece(poly([[x - 8, top + 2], [x + w / 2, top - w * 0.9], [x + w + 8, top + 2]]), C.plum, { edge: 'cut', fibre: false }),
    piece(rect(x + w / 2 - 6, top + 40, 12, 26, 6), C.candle, { edge: 'clean', fibre: false, shadow: false }),
  ];
  const stars: Node[] = [];
  for (let i = 0; i < 14; i++) stars.push(dot(30 + r() * 1120, 20 + r() * 160, 1.4 + r() * 1.8, C.cream, 0.5 + r() * 0.4));
  const cobbles: Node[] = [];
  for (let row = 0; row < 4; row++) {
    for (let c = 0; c < 12; c++) {
      cobbles.push(piece(rect(c * 100 + (row % 2) * 50 - 20, 560 + row * 34, 92, 28, 6), row % 2 ? STONE : STONE_DARK, { edge: 'cut', fibre: false, shadow: false, opacity: 0.55 }));
    }
  }
  return svg({ w: 1180, h: 820, name: 'b7c3-courtyard', boil: false, className: 'backdrop' }, [
    piece(rect(-20, -20, 1220, 860), '#4a3f6b', { edge: 'clean', shadow: false }),
    piece(rect(-20, 200, 1220, 160), '#8a557a', { edge: 'clean', shadow: false, opacity: 0.8 }),
    piece(rect(-20, 340, 1220, 200), '#c9795a', { edge: 'clean', shadow: false, opacity: 0.85 }),
    ...stars,
    // castle behind
    ...tower(340, 90, 250, '#3c3550'),
    ...tower(520, 120, 170, '#443b5a'),
    ...tower(720, 80, 260, '#3c3550'),
    ...tower(870, 70, 300, '#443b5a'),
    piece(rect(300, 360, 600, 170), '#3c3550', { edge: 'cut', fibre: false }),
    ...[380, 470, 560, 650, 740, 820].map((x) => piece(rect(x, 400, 16, 30, 7), C.candle, { edge: 'clean', fibre: false, shadow: false, opacity: 0.8 })),
    // dark clouds
    piece(curve([[-20, 20], [120, 70], [300, 50], [420, 90], [200, 120], [-20, 110]]), '#2f2a42', { edge: 'torn', fibre: false, opacity: 0.85 }),
    piece(curve([[800, 30], [980, 60], [1200, 40], [1200, 130], [1000, 140], [840, 100]]), '#2f2a42', { edge: 'torn', fibre: false, opacity: 0.85 }),
    // courtyard wall and ground
    piece(rect(-20, 500, 1220, 340), '#5c5668', { edge: 'clean', shadow: false }),
    piece(rect(-20, 500, 1220, 14), C.stone, { edge: 'cut', fibre: false }),
    ...cobbles,
    // empty plinths
    ...[270, 450, 640, 820].map((x) => piece(rect(x, 540, 90, 36, 5), STONE_DARK, { edge: 'cut', fibre: false })),
  ]);
}

// -------------------------------------------------------------------- story

/** Knight start positions (left x) along the courtyard, and where they march to. */
const KNIGHTS = [
  { x: 250, to: 0 },
  { x: 430, to: 0 },
  { x: 620, to: 0 },
  { x: 800, to: 0 },
];

/** Flashes the lantern glows on, gently. */
async function lightLanterns(k: Kit, glows: HTMLElement[]): Promise<void> {
  await k.all(...glows.map((g, i) => k.wait(i * 250).then(() => k.fade(g, 1, 0.8))));
}

export default defineStory({
  lines: {
    thunder: { who: 'mcgonagall', text: 'Ah, {name}, you’re back! Quickly now… a storm is coming to Hogwarts.' },
    spell: { who: 'mcgonagall', text: 'Piertotum… Locomotor!' },
    wake: { who: 'narrator', text: 'Creak! The stone knights wake up… stomp, stomp! They line up to guard the castle.' },
    love: { who: 'mcgonagall', text: 'Oh! I’ve always wanted to use that spell!' },
    shield: { who: 'narrator', text: 'You wave your wand… a shimmering shield rises, and every lantern glows!' },
    ready: { who: 'mcgonagall', text: 'Stand tall, everyone! The great battle is coming… and we are ready!' },
  },

  async play(k) {
    k.backdrop(courtyard());

    k.music('spooky');
    k.ambient('stars', { z: 5, area: [0, 0, 1180, 330] });
    const dim = k.dim(0.3);
    k.light(590, 410, 260, { color: C.candle, strength: 0.25 });

    // Lanterns on posts, glowing later.
    const lampXs = [60, 1040];
    lampXs.forEach((x) => k.add(lanternPost(), { x, y: 330, w: 80, z: 6, still: true }));
    const glows = [100, 1080].map((x) => {
      const g = k.light(x, 374, 150, { color: C.candle, flicker: true });
      k.set(g, { opacity: 0 });
      return g;
    });

    // The knights stand still as statues.
    const knights = KNIGHTS.map((kn) => k.add(knightArt(), { x: kn.x, y: 300, w: 130, z: 8 }));
    knights.forEach((el, i) => k.set(el, { transformOrigin: '50% 100%', y: 0, rotation: i % 2 ? 1 : -1 }));

    const hero = k.character('hero', { x: 0, y: 410, w: 220, z: 20 });
    const mcg = k.character('mcgonagall', { x: 960, y: 410, w: 220, z: 20, flip: true });
    k.set([hero, mcg], { opacity: 0 });

    // The five words, as scenery props.
    const props: Array<[string, number, number, number, number]> = [
      ['thunder', 470, 14, 170, 4],
      ['sunset', 965, 215, 120, 4],
      ['cobweb', -10, -10, 160, 4],
      ['lantern', 250, 560, 100, 22],
      ['pumpkin', 820, 570, 110, 22],
    ];
    const propEls: HTMLElement[] = [];

    // Thunder rolls as the curtains open.
    k.fx.rumble(2.2);
    void k.quake(4);
    await k.wait(500);
    k.sfx.whoosh();
    await k.all(k.enter(hero, 'left'), k.enter(mcg, 'right'));
    for (const [w, x, y, pw, z] of props) {
      const p = k.picture(w, { x, y, w: pw, z });
      k.set(p, { opacity: 0 });
      propEls.push(p);
    }
    const popProps = async () => {
      for (const p of propEls) {
        k.fx.pop();
        await k.appear(p, 0.25);
        k.float(p, 5, 1.8);
        await k.wait(180);
      }
    };
    await k.all(k.say('thunder', mcg), popProps());

    // McGonagall raises her wand.
    k.sfx.whoosh();
    await k.camera({ zoom: 1.35, x: 900, y: 480 }, 1.0);
    k.music('adventure');
    await k.to(mcg, 0.2, { scale: 0.96 });
    await k.to(mcg, 0.4, { scale: 1.06, ease: 'sine.out' });
    await k.say('spell', mcg);
    k.fx.spell();
    await k.beam([930, 500], [560, 420], C.goldLight, 0.7);
    void k.camera({ zoom: 1.2, x: 590, y: 420 }, 0.8);
    void k.to(mcg, 0.4, { scale: 1 });
    k.sparkle(560, 420, 16, 360);

    // The stone knights wake: grinding and creaking.
    stoneGrind();
    k.fx.creak();
    void k.quake(5);
    knights.forEach((_el, i) => k.puff(KNIGHTS[i].x + 65, 560, 90, C.stoneLight));
    await k.all(...knights.map((el, i) => k.wait(i * 160).then(() => k.shake(el, 5, 3))));
    await k.all(...knights.map((el, i) => k.wait(i * 80).then(() => k.pop(el, 1.15))));
    await k.all(k.say('wake'), (async () => {
      await k.wait(1500);
      // They march forward, stomping in rhythm, then halt in a line.
      armourMarch(4, 0.5);
      k.fx.stomp(4, 0.5);
      await k.all(...knights.map((el) => k.to(el, 2, { y: 34, scale: 1.1, ease: 'steps(4)' })));
      k.fx.thud();
      void k.quake(3);
      await k.all(...knights.map((el, i) => {
        if (i < 2) k.face(el, true);
        void k.to(el, 0.3, { rotation: i % 2 ? 6 : -6 });
        return k.hop(el, 10, 1);
      }));
    })());

    // McGonagall, delighted.
    k.fx.twinkle();
    k.sparkle(mcg.offsetLeft + 120, 420, 12, 140);
    void k.hop(mcg, 40, 2);
    await k.say('love', mcg);

    // The shield rises, the lanterns glow.
    k.fx.spell();
    void k.hop(hero, 20, 1);
    await k.camera({}, 1.4);
    await k.beam([190, 560], [590, 160], C.sky, 0.8);
    shieldShimmer();
    k.sfx.shield();
    const shield = k.add(shieldArt(), { x: 90, y: 90, w: 1000, z: 7, still: true });
    k.set(shield, { opacity: 0, transformOrigin: '50% 100%', scale: 0.6 });
    void k.fade(dim, 0.15, 1.6);
    k.ambient('fireflies', { count: 14, area: [100, 250, 980, 300] });
    void k.to(shield, 1.6, { scale: 1, opacity: 1, ease: 'sine.out' });
    void lightLanterns(k, glows);
    k.sparkle(590, 220, 18, 380);
    await k.say('shield');

    // Thunder one more time, then the warning.
    k.fx.rumble(1.4);
    void k.camera({ zoom: 1.15, x: 590, y: 380 }, 3);
    void k.shake(hero, 4, 2);
    await k.say('ready', mcg);

    // Happy ending.
    k.fx.jingle();
    k.confetti(30);
    k.sparkle(590, 300, 16, 300);
    await k.all(k.hop(hero, 46, 2), k.hop(mcg, 26, 1));
    await k.wait(1600);
  },
});
