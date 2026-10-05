/**
 * Book 1, chapter 2: Diagon Alley.
 *
 * In Mr Ollivander's dusty wand shop, the first wand you try goes wild: your
 * shopping bag tips over, wand boxes tumble, the pan clangs onto the counter,
 * the fan whirls round and the cap lands on Mr Ollivander's head. The second
 * wand glows warm gold and puts everything back. The wand chooses the wizard,
 * and the map points the way to the Hogwarts Express (the next chapter).
 */
import { band, bell, C, circle, defineStory, dot, ellipse, ink, noiseBurst, NOTE, now, piece, poly, rect, rng, svg, tone, type Node, type Pt } from './kit';

// ------------------------------------------------------------------ sounds

/** Wand boxes tumbling: a run of soft, hollow wooden knocks. */
function clatter(count = 8): void {
  const t = now();
  for (let i = 0; i < count; i++) {
    const dt = i * 0.085 + Math.random() * 0.04;
    tone(240 + Math.random() * 200, t + dt, { wave: 'triangle', peak: 0.12, decay: 0.07, glideTo: 140, lowpass: 1800 });
    noiseBurst(t + dt, { freq: 1100 + Math.random() * 900, q: 2, peak: 0.06, decay: 0.05 });
  }
}

/** A frying pan landing: a warm metal clang that wobbles as it settles. */
function clang(): void {
  const t = now();
  const f = 392;
  noiseBurst(t, { freq: 3200, type: 'highpass', peak: 0.05, decay: 0.07 });
  const partials: Array<[number, number, number]> = [[1, 0.12, 1.3], [1.5, 0.04, 0.9], [2.76, 0.05, 0.8], [5.4, 0.025, 0.45]];
  for (const [m, p, d] of partials) tone(f * m, t, { peak: p, attack: 0.003, decay: d, vibrato: [7, f * m * 0.008] });
  [0.32, 0.55, 0.72].forEach((dt, i) => tone(f * 1.02, t + dt, { peak: 0.045 / (i + 1), attack: 0.003, decay: 0.22 }));
}

/** The right wand: a warm, rising chord with bells on top. */
function chosen(): void {
  const t = now();
  tone(NOTE.C3, t, { wave: 'triangle', peak: 0.06, attack: 0.4, decay: 2.2, lowpass: 900 });
  [NOTE.C4, NOTE.E4, NOTE.G4, NOTE.C5, NOTE.E5].forEach((f, i) =>
    tone(f, t + i * 0.14, { wave: 'triangle', peak: 0.05, attack: 0.18, decay: 1.8, lowpass: 2200, vibrato: [5, 2] }),
  );
  [NOTE.G5, NOTE.C6, NOTE.E6].forEach((f, i) => bell(f, t + 0.75 + i * 0.1, 0.07, 1.4));
}

/** A tiny, friendly steam-train "toot-toot" (soft breathy chord, twice). */
function toot(): void {
  const t = now();
  for (const dt of [0, 0.38]) {
    const len = dt ? 0.55 : 0.25;
    [NOTE.E5, NOTE.G5, NOTE.B5].forEach((f) =>
      tone(f, t + dt, { wave: 'triangle', peak: 0.045, attack: 0.04, decay: len, lowpass: 2400, vibrato: [6, 4] }),
    );
    noiseBurst(t + dt, { freq: 2600, q: 1.5, peak: 0.04, attack: 0.03, decay: len });
  }
}

// --------------------------------------------------------------------- art

const WALL = '#4e3a2e';
const BOX_COLORS = [C.tan, C.sand, C.stone, C.cream, C.wood, C.stoneLight, '#8a6f8f', '#6d7f86', C.brown];

/** Ollivander's shop: a Diagon Alley window, and wand boxes up to the ceiling. */
function shop(): string {
  const r = rng(1902);
  const nodes: Node[] = [
    piece(rect(-20, -20, 1220, 600), WALL, { edge: 'clean', shadow: false }),
  ];

  // The shop window, with Diagon Alley outside.
  nodes.push(piece(rect(50, 70, 380, 330), C.wood, { rough: 0.8 }));
  nodes.push(piece(rect(66, 86, 348, 298), '#d7e0e2', { edge: 'clean', shadow: false }));
  const shops: Array<[number, number, number, string]> = [
    [60, 84, 172, C.rose],
    [140, 76, 148, C.teal],
    [214, 90, 188, C.sand],
    [302, 62, 140, '#8a6f8f'],
    [362, 60, 176, C.green],
  ];
  for (const [x, w, top, col] of shops) {
    const lean = (r() - 0.5) * 14;
    nodes.push(piece(poly([[x, 390], [x, top + 10], [x + w / 2 + lean, top - 34], [x + w, top + 10], [x + w, 390]]), col, { rough: 0.7 }));
    nodes.push(piece(rect(x + w / 2 - 12, top + 26, 24, 30, 4), C.candle, { edge: 'cut', fibre: false, shadow: false }));
    nodes.push(piece(rect(x + 10, top + 76, w - 20, 26, 3), r() > 0.5 ? C.goldLight : C.cream, { edge: 'cut', fibre: false, shadow: false, opacity: 0.85 }));
  }
  // Bunting across the street.
  nodes.push(ink([[66, 120], [160, 140], [250, 122], [340, 142], [414, 124]], { width: 2, color: C.brownDark, opacity: 0.6 }));
  [[96, 128], [130, 136], [190, 136], [222, 128], [282, 130], [314, 138], [372, 134]].forEach(([x, y], i) =>
    nodes.push(piece(poly([[x - 9, y], [x + 9, y], [x, y + 16]]), [C.red, C.gold, C.blue][i % 3], { edge: 'cut', fibre: false, shadow: false })),
  );
  // Frame bars and the cross of the window.
  nodes.push(
    piece(rect(50, 70, 380, 18), C.wood, { edge: 'cut' }),
    piece(rect(50, 382, 380, 18), C.wood, { edge: 'cut' }),
    piece(rect(50, 70, 18, 330), C.wood, { edge: 'cut' }),
    piece(rect(412, 70, 18, 330), C.wood, { edge: 'cut' }),
    piece(rect(233, 84, 14, 300), C.wood, { edge: 'cut' }),
    piece(rect(66, 228, 348, 12), C.wood, { edge: 'cut' }),
    // The single wand on its faded purple cushion.
    piece(ellipse(240, 374, 70, 16), '#7d6890', { rough: 0.8 }),
    piece(band([[192, 368], [286, 360]], 6), C.brownDark, { edge: 'cut', fibre: false }),
    piece(rect(36, 394, 410, 20, 3), C.brown, { rough: 0.8 }),
  );

  // A hanging lamp.
  nodes.push(
    piece(circle(470, 140, 70), C.candle, { edge: 'clean', shadow: false, opacity: 0.12 }),
    ink([[470, 20], [470, 104]], { width: 3, color: C.ink, opacity: 0.7 }),
    piece(poly([[446, 104], [494, 104], [484, 150], [456, 150]]), C.brownDark, { edge: 'cut' }),
    piece(rect(458, 112, 24, 30, 3), C.candle, { edge: 'cut', fibre: false, shadow: false }),
  );

  // Wall-to-ceiling shelves of thin wand boxes.
  nodes.push(piece(rect(508, 30, 18, 540), C.brownDark, { edge: 'cut' }));
  for (let y = 36; y < 520; y += 56) {
    let x = 530;
    while (x < 1190) {
      const w = 15 + r() * 12;
      const hh = 36 + r() * 10;
      const col = BOX_COLORS[Math.floor(r() * BOX_COLORS.length)];
      nodes.push(piece(rect(x, y + 46 - hh, w, hh, 2), col, { edge: 'cut', fibre: false }));
      if (r() > 0.55) nodes.push(dot(x + w / 2, y + 46 - hh * 0.55, 3, C.cream, 0.8));
      x += w + 2 + r() * 3;
    }
    nodes.push(piece(rect(512, y + 46, 700, 9), C.brownDark, { edge: 'cut' }));
  }

  // The floor.
  nodes.push(
    piece(rect(-20, 560, 1220, 300), C.wood, { rough: 0.8, shadow: false }),
    piece(rect(-20, 548, 1220, 16), C.brownDark, { edge: 'cut' }),
    ...[598, 640].map((y) => ink([[-10, y], [1190, y + 2]], { width: 2.5, color: C.brownDark, opacity: 0.45 })),
    ...[[180, 564, 598], [520, 564, 598], [860, 564, 598], [340, 600, 640], [700, 600, 640], [1040, 600, 640]].map(([x, a, b]) =>
      ink([[x, a], [x + 2, b]], { width: 2.5, color: C.brownDark, opacity: 0.45 }),
    ),
  );
  // Dust floating in the lamplight.
  for (let i = 0; i < 14; i++) nodes.push(dot(380 + r() * 220, 120 + r() * 340, 1.5 + r() * 2, C.cream, 0.35));

  return svg({ w: 1180, h: 820, name: 'b1c2-shop', boil: false, className: 'backdrop' }, nodes);
}

/** The front edge of the floor, in front of everyone (hides the portraits' cut edges). */
function floorFront(): string {
  const r = rng(77);
  const top: Pt[] = [];
  for (let x = -20; x <= 1200; x += 80) top.push([x, 8 + r() * 10]);
  return svg({ w: 1180, h: 160, name: 'b1c2-front', boil: false }, [
    piece(poly([...top, [1200, 200], [-20, 200]]), '#6b4630', { rough: 1.4 }),
    ink([[-10, 44], [1190, 48]], { width: 2.5, color: C.brownDark, opacity: 0.4 }),
  ]);
}

/** The shop counter (500 × 300); its top edge is at y 40. */
function counter(): string {
  return svg({ w: 500, h: 300, name: 'b1c2-counter', boil: false }, [
    piece(rect(14, 56, 486, 250), C.brown, { rough: 0.8 }),
    ...[40, 196, 352].map((x) => piece(rect(x, 92, 128, 150, 4), '#7a4c32', { edge: 'cut', fibre: false })),
    piece(rect(0, 40, 500, 26, 4), C.wood, { rough: 0.8 }),
    // A little brass shop bell.
    piece(poly([[452, 40], [458, 18], [474, 14], [490, 18], [496, 40]]), C.gold, { edge: 'cut' }),
    piece(circle(474, 10, 5), C.gold, { edge: 'cut', fibre: false }),
  ]);
}

/** One long, thin wand box seen from the side (110 × 30). */
function wandBox(i: number): string {
  const col = BOX_COLORS[(i * 4 + 1) % BOX_COLORS.length];
  return svg({ w: 110, h: 30, name: 'b1c2-box' + i, boil: false }, [
    piece(rect(4, 4, 102, 22, 3), col, { edge: 'cut' }),
    piece(rect(4, 4, 22, 22, 3), 'rgba(40,25,10,0.25)', { edge: 'cut', fibre: false, shadow: false }),
    piece(rect(44, 10, 40, 10, 2), C.cream, { edge: 'cut', fibre: false, shadow: false }),
  ]);
}

/** A wand held in a hand (60 × 240; the hand is at 30, 222). */
function wandArt(good: boolean): string {
  const nodes: Node[] = good
    ? [
        piece(band([[30, 168], [31, 96], [32, 20]], 9), C.sand, { edge: 'cut' }),
        piece(band([[30, 216], [30, 160]], 14), C.brownDark, { edge: 'cut' }),
        piece(band([[30, 166], [30, 158]], 16), C.gold, { edge: 'cut', fibre: false }),
        piece(circle(32, 20, 6), C.goldLight, { edge: 'cut', fibre: false }),
      ]
    : [
        piece(band([[30, 168], [22, 128], [36, 86], [24, 50], [32, 18]], 9), '#6b5a4a', { edge: 'cut' }),
        piece(band([[30, 216], [30, 160]], 14), C.charcoal, { edge: 'cut' }),
        piece(circle(25, 112, 6), '#6b5a4a', { edge: 'cut', fibre: false }),
      ];
  return svg({ w: 60, h: 240, name: good ? 'b1c2-wand-good' : 'b1c2-wand-wild', boil: false }, [
    ...nodes,
    piece(circle(30, 214, 13), C.skin, { edge: 'cut' }),
  ]);
}

/** A little paper steam engine (120 × 80), stuck on the map. */
function engine(): string {
  return svg({ w: 120, h: 80, name: 'b1c2-engine', boil: false }, [
    piece(circle(34, 8, 9), C.white, { rough: 0.8, shadow: false }),
    piece(rect(26, 12, 14, 24, 2), C.charcoal, { edge: 'cut' }),
    piece(rect(14, 30, 64, 30, 6), C.red, { edge: 'cut' }),
    piece(rect(70, 14, 38, 46, 4), C.redDark, { edge: 'cut' }),
    piece(rect(78, 22, 20, 14, 3), C.candle, { edge: 'cut', fibre: false, shadow: false }),
    piece(rect(8, 52, 104, 8, 2), C.gold, { edge: 'cut', fibre: false }),
    ...[[30, 66, 10], [56, 66, 10], [90, 64, 13]].map(([x, y, rr]) => piece(circle(x, y, rr), C.charcoal, { edge: 'cut' })),
  ]);
}

// ------------------------------------------------------------------- story

/** Where the bag's mouth is: things go in and come out here. */
const MOUTH: Pt = [490, 530];

export default defineStory({
  lines: {
    hello: { who: 'ollivander', text: 'Welcome, {name}! Let’s find your wand.' },
    tryOne: { who: 'ollivander', text: 'Try this one. Give it a wave!' },
    oops: { who: 'narrator', text: 'Oh no! Boxes tumble, the pan clangs, and a cap lands on Mr Ollivander!' },
    notThat: { who: 'ollivander', text: 'Hmm… not that one. Try this!' },
    glow: { who: 'narrator', text: 'A warm golden glow! Your map, cap, pan and fan hop back in the bag.' },
    chooses: { who: 'ollivander', text: 'Curious! The wand chooses the wizard!' },
    end: { who: 'narrator', text: 'Your bag is packed. Follow the map… to the Hogwarts Express!' },
  },

  async play(k) {
    k.backdrop(shop());
    k.add(floorFront(), { x: 0, y: 660, w: 1180, h: 160, z: 30, still: true });
    k.add(counter(), { x: 690, y: 390, w: 500, h: 300, z: 20, still: true });

    // A stack of wand boxes on the end of the counter.
    const boxes = Array.from({ length: 6 }, (_, i) => {
      const el = k.add(wandBox(i), { x: 700 + ((i * 7) % 13) - 6, y: 430 - 24 * (i + 1), w: 110, h: 30, z: 22, still: true });
      k.set(el, { rotation: ((i * 5) % 7) - 3 });
      return el;
    });
    const boxRot = boxes.map((_, i) => ((i * 5) % 7) - 3);

    const olli = k.character('ollivander', { x: 800, y: 150, w: 280, z: 10 });
    const hero = k.character('hero', { x: 110, y: 360, w: 280, z: 15 });
    // Every young wizard needs a wand: the hero's own is hidden until one chooses them.
    const ownWand = hero.querySelector<SVGElement>('[data-part="wand"]');
    if (ownWand) ownWand.style.display = 'none';
    k.set([olli, hero], { opacity: 0 });

    const bag = k.picture('bag', { x: 400, y: 450, w: 180, z: 24 });
    k.set(bag, { transformOrigin: '50% 80%' });

    // The shopping, tucked inside the bag (behind its front).
    const item = (word: string, w: number) => {
      const el = k.picture(word, { x: MOUTH[0] - w / 2, y: MOUTH[1] - w / 2, w, z: 23 });
      k.set(el, { scale: 0.3, opacity: 0 });
      return el;
    };
    const map = item('map', 130);
    const cap = item('cap', 130);
    const pan = item('pan', 140);
    const fan = item('fan', 130);

    /** Throws something out of the bag in an arc to (cx, cy), its new centre. */
    const fling = async (el: HTMLElement, cx: number, cy: number, rot: number, seconds = 0.8): Promise<void> => {
      const dx = cx - MOUTH[0];
      const dy = cy - MOUTH[1];
      k.set(el, { opacity: 1 });
      await k.to(el, seconds / 2, { x: dx * 0.5, y: Math.min(dy, 0) - 120, scale: 1, rotation: rot * 0.5 - 30, ease: 'power2.out' });
      await k.to(el, seconds / 2, { x: dx, y: dy, rotation: rot, ease: 'power2.in' });
    };

    /** A wand flies from the top of the box stack into the hero's hand. */
    const WAND = { x: 302, y: 468, w: 50, h: 200, z: 16 };
    const giveWand = async (good: boolean, box: HTMLElement): Promise<HTMLElement> => {
      k.fx.pop();
      await k.pop(box, 1.25);
      const wand = k.add(wandArt(good), WAND);
      k.set(wand, { transformOrigin: '50% 92.5%', x: 430, y: -270, rotation: -60, scale: 0.6, opacity: 0 });
      k.fx.twinkle();
      await k.to(wand, 0.2, { opacity: 1 });
      k.fx.whizz();
      await k.to(wand, 0.8, { x: 0, y: 0, rotation: 18, scale: 1, ease: 'power2.inOut' });
      return wand;
    };
    const TIP: Pt = [384, 495];

    // ---- Into the shop.
    k.fx.creak();
    await k.all(k.enter(olli, 'right', 0.8), k.wait(200).then(() => k.enter(hero, 'left', 0.8)));
    k.fx.patter(4);
    await k.hop(hero, 30);
    await k.say('hello', olli);

    // ---- The first wand.
    const wild = await giveWand(false, boxes[5]);
    await k.say('tryOne', olli);

    // A wild wave!
    k.fx.spell();
    for (const rot of [-14, 46, -6, 34, 18]) await k.to(wild, 0.12, { rotation: rot, ease: 'none' });
    await k.beam(TIP, [MOUTH[0], MOUTH[1] - 10], C.orange, 0.3);
    await k.shake(bag, 8, 1);
    k.fx.poof();
    k.puff(MOUTH[0], MOUTH[1], 150);
    await k.all(
      k.to(bag, 0.3, { rotation: -24, x: -14, ease: 'back.out(2)' }),
      // Boxes topple off the counter, top first.
      ...boxes.map((b, j) =>
        k.wait((5 - j) * 90).then(() =>
          k.to(b, 0.7, { x: -90 - j * 22 + ((j * 13) % 30), y: 640 - (430 - 24 * (j + 1)) - ((j * 11) % 34), rotation: (j % 2 ? 1 : -1) * (100 + j * 25), ease: 'bounce.out' }),
        ),
      ),
      k.wait(250).then(() => clatter(9)),
      k.wait(500).then(() => k.quake(5)),
      // The shopping flies everywhere.
      (async () => {
        k.fx.whizz();
        await fling(map, 232, 216, -12);
        k.fx.pop();
      })(),
      k.wait(200).then(async () => {
        await fling(fan, 640, 236, 0, 0.7);
        k.fx.wind(1.4);
        await k.spin(fan, 2, 1.1);
        await k.to(fan, 0.3, { rotation: 15, ease: 'back.out(2)' });
      }),
      k.wait(450).then(async () => {
        await fling(pan, 1104, 392, -8, 1);
        clang();
        for (const r of [6, -5, 3, -1]) await k.to(pan, 0.1, { rotation: -8 + r, ease: 'none' });
      }),
      k.wait(800).then(async () => {
        k.fx.whizz();
        await fling(cap, 943, 212, -10, 1);
        k.fx.boing();
        await k.pop(cap, 1.12);
      }),
    );
    await k.shake(hero, 8, 2);
    await k.say('oops');
    // Mr Ollivander talks with the cap still on his head.
    const stopCap = k.talk(cap);
    await k.say('notThat', olli);
    stopCap();

    // ---- The second wand.
    k.fx.fizzle();
    k.puff(TIP[0] - 30, TIP[1] + 60, 130);
    await k.vanish(wild, 0.4);
    const good = await giveWand(true, boxes[4]);
    await k.wait(300);

    // It chooses you: a slow, warm wave.
    chosen();
    void k.glow(C.goldLight, 0.4, 1.8);
    await k.to(good, 0.6, { rotation: -4, ease: 'sine.inOut' });
    k.sparkle(TIP[0] - 50, TIP[1] - 20, 18, 200);
    await k.to(good, 0.4, { rotation: 18, ease: 'sine.inOut' });
    k.sparkle(MOUTH[0], MOUTH[1] - 40, 14, 160);

    // Everything flies home: the shopping peeks out of the bag, the boxes restack.
    k.fx.twinkle();
    await k.all(
      k.to(bag, 0.5, { rotation: 0, x: 0, ease: 'back.out(2)' }),
      ...boxes.map((b, j) => k.wait(j * 70).then(() => k.to(b, 0.8, { x: 0, y: 0, rotation: boxRot[j], ease: 'power2.inOut' }))),
      ...([
        [map, -46, -34, -20],
        [fan, -12, -52, -8],
        [pan, 40, -30, 28],
        [cap, 58, -12, 14],
      ] as Array<[HTMLElement, number, number, number]>).map(([el, x, y, rotation], j) =>
        k.wait(j * 140).then(() => k.to(el, 0.9, { x, y, rotation, scale: 0.55, ease: 'power2.inOut' })),
      ),
    );
    k.fx.pop();
    await k.pop(bag, 1.1);
    await k.say('glow');

    k.fx.boing();
    await k.all(k.hop(hero, 40), k.pop(olli, 1.06));
    await k.say('chooses', olli);

    // ---- The map shows the way.
    map.style.zIndex = '60';
    k.fx.whizz();
    // Centred in the gap between the hero and the box stack (centre x 540).
    await k.to(map, 0.8, { x: 540 - MOUTH[0], y: 300 - MOUTH[1], scale: 2.2, rotation: 0, ease: 'back.out(1.4)' });
    const train = k.add(engine(), { x: 570, y: 306, w: 84, h: 56, z: 61 });
    toot();
    await k.appear(train, 0.35);
    k.puff(602, 300, 70, C.white);
    await k.say('end');

    // ---- Hooray!
    k.fx.jingle();
    k.confetti(36);
    k.sparkle(540, 300, 16, 220);
    void k.walk(train, 24, 0.6, 2);
    await k.all(k.hop(hero, 50, 2), k.pop(olli, 1.08));
    await k.wait(700);
  },
});
