/**
 * Book 3, chapter 2: Professor Lupin.
 *
 * Lupin's classroom. The wardrobe rattles: a boggart! Lupin teaches the
 * hero "Riddikulus!". Out pops a big googly-eyed spider; the spell puts it
 * on roller skates, it wibbles and wobbles across the room and crashes into
 * a tent, the class laughs and the boggart puffs away. Chocolate for all.
 */
import { C, circle, curve, defineStory, dot, ellipse, group, ink, noiseBurst, NOTE, now, piece, poly, rect, svg, tone, type Node, type Pt } from './kit';

// ------------------------------------------------------------------ sounds

/** The wardrobe rattling: wooden knocks with a little latch jingle. */
function rattle(times = 9): void {
  const t = now();
  let dt = 0;
  for (let i = 0; i < times; i++) {
    const f = 120 + Math.random() * 60;
    tone(f, t + dt, { wave: 'triangle', peak: 0.16, decay: 0.07, glideTo: f * 0.6, lowpass: 900 });
    noiseBurst(t + dt, { freq: 700 + Math.random() * 500, q: 2, peak: 0.08, decay: 0.05 });
    dt += 0.06 + Math.random() * 0.06;
  }
  tone(1760, t + dt, { peak: 0.035, decay: 0.12 });
  tone(2350, t + dt + 0.05, { peak: 0.025, decay: 0.1 });
}

/** Roller-skate wheels rolling over floorboards. */
function skates(seconds = 2): void {
  const t = now();
  for (let s = 0; s < seconds; s += 0.09) {
    noiseBurst(t + s, { freq: 320, type: 'lowpass', peak: 0.07, attack: 0.03, decay: 0.1 });
    // the clack of the board joins
    if (Math.round(s / 0.09) % 3 === 0) noiseBurst(t + s, { freq: 1900, q: 3, peak: 0.04, decay: 0.03 });
  }
}

/** A swanee-whistle wobble, up then down. */
function wobbleWhistle(): void {
  const t = now();
  tone(NOTE.C5, t, { wave: 'triangle', peak: 0.08, attack: 0.04, decay: 0.4, glideTo: NOTE.C6, vibrato: [7, 10], lowpass: 2500 });
  tone(NOTE.C6, t + 0.45, { wave: 'triangle', peak: 0.08, attack: 0.04, decay: 0.45, glideTo: NOTE.E4, vibrato: [7, 10], lowpass: 2500 });
}

/** The whole class giggling: a few small voices going "ha-ha-ha". */
function laugh(): void {
  const t = now();
  const voices: Array<[number, number]> = [[300, 0], [390, 0.1], [240, 0.22], [460, 0.06], [340, 0.3]];
  for (const [f, d] of voices) {
    const n = 5 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++) {
      const tt = t + d + i * (0.14 + Math.random() * 0.03);
      const p = f * (1 - i * 0.035);
      tone(p, tt, { wave: 'sawtooth', peak: 0.03, attack: 0.015, decay: 0.09, glideTo: p * 0.8, lowpass: 1400 });
      noiseBurst(tt, { freq: 1500, q: 1, peak: 0.018, attack: 0.01, decay: 0.07 });
    }
  }
}

/** A little bird cheep. */
function cheep(): void {
  const t = now();
  [0, 0.16].forEach((d) => tone(2300, t + d, { peak: 0.05, attack: 0.005, decay: 0.07, glideTo: 3300 }));
}

// --------------------------------------------------------------------- art

const STONE = '#867b6d';

function archOutline(x: number, y: number, w: number, h: number): Pt[] {
  const r = w / 2;
  const pts: Pt[] = [[x, y + h]];
  for (let i = 0; i <= 12; i++) {
    const a = Math.PI + (i / 12) * Math.PI;
    pts.push([x + r + Math.cos(a) * r, y + r + Math.sin(a) * r]);
  }
  pts.push([x + w, y + h]);
  return pts;
}

function windowArt(x: number, y: number, w: number, h: number): Node[] {
  const glassX = x + 12;
  const glassW = w - 24;
  return [
    piece(archOutline(x - 10, y - 10, w + 20, h + 22), C.greyDark, { rough: 0.8 }),
    piece(archOutline(x, y, w, h), C.brownDark, { edge: 'cut' }),
    piece(archOutline(glassX, y + 12, glassW, h - 22), C.sky, { edge: 'cut', fibre: false }),
    piece(ellipse(x + w * 0.35, y + h * 0.45, 34, 14), C.white, { fibre: false, shadow: false, opacity: 0.85 }),
    piece(ellipse(x + w * 0.6, y + h * 0.42, 26, 12), C.white, { fibre: false, shadow: false, opacity: 0.85 }),
    piece(curve([[glassX, y + h - 40], [x + w * 0.4, y + h - 74], [x + w * 0.75, y + h - 60], [glassX + glassW, y + h - 80], [glassX + glassW, y + h - 10], [glassX, y + h - 10]], 2), C.green, { fibre: false, shadow: false }),
    ink([[x + w / 2, y + 14], [x + w / 2, y + h - 10]], { width: 6, color: C.brownDark, wobble: 0.3 }),
    ink([[glassX, y + h * 0.55], [glassX + glassW, y + h * 0.55]], { width: 6, color: C.brownDark, wobble: 0.3 }),
    piece(rect(x - 18, y + h - 4, w + 36, 18, 3), C.stoneLight, { rough: 0.8 }),
  ];
}

/** Lupin's Defence Against the Dark Arts classroom, 1180 × 820. */
function classroom(): string {
  const blocks: Node[] = [];
  for (let row = 0; row < 10; row++) {
    const y = row * 62;
    for (let col = -1; col < 11; col++) {
      const x = col * 124 + (row % 2) * 62;
      const shade = (row * 7 + col * 3) % 3;
      blocks.push(piece(rect(x + 4, y + 4, 116, 54, 4), shade === 0 ? '#93887a' : shade === 1 ? '#7c7164' : '#8a7f71', { edge: 'cut', fibre: false, shadow: false, opacity: 0.55 }));
    }
  }
  const book = (x: number, w: number, hgt: number, color: string): Node => piece(rect(x, 262 - hgt, w, hgt, 2), color, { edge: 'cut', fibre: false });
  const planks: Node[] = [];
  for (const [y, off] of [[650, 0], [700, 90], [760, 40]] as const) {
    planks.push(ink([[-10, y], [1190, y + 4]], { width: 2.5, color: C.brownDark, opacity: 0.45 }));
    for (let x = 120 + off; x < 1180; x += 260) planks.push(ink([[x, y - 46], [x, y]], { width: 2, color: C.brownDark, opacity: 0.35 }));
  }
  return svg({ w: 1180, h: 820, name: 'b3c2-classroom', boil: false, className: 'backdrop' }, [
    piece(rect(-20, -20, 1220, 660), STONE, { edge: 'clean', shadow: false }),
    ...blocks,
    // a soft warm light on the back wall
    piece(ellipse(615, 330, 520, 280), C.candle, { edge: 'cut', fibre: false, shadow: false, opacity: 0.12 }),
    ...windowArt(130, 70, 170, 260),
    ...windowArt(880, 70, 170, 230),
    // a shelf of books and a jar beside the wardrobe
    piece(rect(330, 262, 150, 14, 3), C.brownDark),
    book(342, 18, 56, C.red),
    book(362, 14, 48, C.blueDark),
    book(378, 20, 62, C.greenDark),
    piece(poly([[400, 262], [404, 206], [420, 208], [432, 262]]), C.purple, { edge: 'cut', fibre: false }),
    piece(rect(440, 222, 30, 40, 8), 'rgba(170,200,190,0.75)', { edge: 'cut' }),
    piece(rect(436, 214, 38, 10, 3), C.brown, { edge: 'cut', fibre: false }),
    // a hanging pennant
    ink([[808, 120], [808, 150]], { width: 3, color: C.brownDark }),
    piece(poly([[780, 150], [836, 150], [808, 230]]), C.redDark),
    piece(poly([[796, 160], [820, 160], [808, 196]]), C.gold, { edge: 'cut', fibre: false }),
    // floor
    piece(rect(-20, 600, 1220, 240), '#9a6c46', { rough: 1.4 }),
    ...planks,
    piece(rect(-20, 592, 1220, 18), C.brownDark, { rough: 1.2 }),
    // a round rug in the middle
    piece(ellipse(600, 668, 360, 52), '#8a4a42', { rough: 1.3 }),
    piece(ellipse(600, 668, 316, 38), C.gold, { edge: 'cut', fibre: false, opacity: 0.55 }),
    piece(ellipse(600, 668, 300, 32), '#8a4a42', { edge: 'cut', fibre: false, shadow: false }),
  ]);
}

/** The boggart's wardrobe, 240 × 470, with doors that swing open. */
function wardrobe(): string {
  const door = (x: number, part: string, knobX: number): Node =>
    group({ part }, [
      piece(rect(x, 58, 98, 372, 4), C.wood, { edge: 'cut' }),
      piece(rect(x + 14, 78, 70, 140, 6), '#b07c50', { edge: 'cut', fibre: false }),
      piece(rect(x + 14, 250, 70, 156, 6), '#b07c50', { edge: 'cut', fibre: false }),
      piece(circle(knobX, 240, 8), C.gold, { edge: 'cut' }),
    ]);
  return svg({ w: 240, h: 470, name: 'b3c2-wardrobe', boil: false, label: 'a rattling wardrobe' }, [
    piece(rect(6, 440, 26, 30, 3), C.brownDark),
    piece(rect(208, 440, 26, 30, 3), C.brownDark),
    piece(rect(12, 34, 216, 412, 6), C.brown),
    piece(rect(20, 56, 200, 376, 3), '#241a22', { edge: 'cut', fibre: false, shadow: false }),
    door(21, 'dl', 106),
    door(121, 'dr', 134),
    piece(curve([[0, 40], [30, 12], [120, 0], [210, 12], [240, 40], [240, 50], [0, 50]], 2), C.brownDark),
  ]);
}

function googlyEye(x: number, y: number, r: number, lookX: number, lookY: number): Node[] {
  return [
    piece(circle(x, y, r), C.white, { edge: 'cut' }),
    piece(circle(x + lookX, y + lookY, r * 0.48), C.ink, { edge: 'clean', shadow: false }),
    dot(x + lookX - r * 0.15, y + lookY - r * 0.18, Math.max(2, r * 0.14), C.white),
  ];
}

/** The boggart as a big, round, googly-eyed spider (340 × 280), skates hidden. */
function spider(): string {
  const cx = 170;
  const legColor = '#3a3244';
  const legs: Node[] = [];
  const feet: number[] = [];
  for (const s of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const hip: Pt = [cx + s * (25 + 12 * i), 160 - 14 * i];
      const knee: Pt = [cx + s * (62 + 28 * i), 110 - 12 * i];
      const foot: Pt = [cx + s * (48 + 30 * i), 238];
      feet.push(foot[0]);
      legs.push(ink([hip, knee, foot], { width: 11, color: legColor, wobble: 0.8 }));
    }
  }
  const fur: Pt[] = [];
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2;
    const r = i % 2 ? 72 : 84;
    fur.push([cx + Math.cos(a) * r * 1.05, 128 + Math.sin(a) * r * 0.92]);
  }
  const skates = feet.map((x) =>
    group({}, [
      piece(rect(x - 8, 216, 16, 18, 4), C.red, { edge: 'cut' }),
      piece(rect(x - 12, 230, 24, 14, 5), C.red, { edge: 'cut' }),
      piece(rect(x - 12, 239, 24, 5, 2), C.white, { edge: 'cut', fibre: false, shadow: false }),
      piece(circle(x - 6, 250, 6), C.gold, { edge: 'cut', fibre: false }),
      piece(circle(x + 6, 250, 6), C.gold, { edge: 'cut', fibre: false }),
    ]),
  );
  return svg({ w: 340, h: 280, name: 'b3c2-spider', label: 'a boggart spider' }, [
    piece(ellipse(cx, 262, 150, 12), 'rgba(40,25,10,0.18)', { edge: 'cut', fibre: false, shadow: false }),
    ...legs,
    piece(curve(fur, 1), '#5b4f6b', { rough: 1.3 }),
    piece(ellipse(cx - 20, 92, 36, 22, -20), '#7a6e8a', { edge: 'cut', fibre: false, shadow: false }),
    ...googlyEye(cx - 30, 116, 26, 7, 8),
    ...googlyEye(cx + 30, 112, 24, -6, -6),
    ...googlyEye(cx - 12, 72, 9, 2, 2),
    ...googlyEye(cx + 14, 70, 9, -2, 3),
    ink([[cx - 30, 166], [cx, 178], [cx + 30, 166]], { width: 5, color: C.ink }),
    piece(poly([[cx - 14, 170], [cx - 6, 172], [cx - 10, 184]]), C.cream, { edge: 'cut', fibre: false, shadow: false }),
    piece(poly([[cx + 6, 172], [cx + 14, 170], [cx + 10, 184]]), C.cream, { edge: 'cut', fibre: false, shadow: false }),
    group({ part: 'skates', opacity: 0 }, skates),
  ]);
}

/** A bar of chocolate in a purple wrapper, 120 × 70. */
function chocolate(seed: string): string {
  return svg({ w: 120, h: 70, name: 'b3c2-choc-' + seed, label: 'chocolate' }, [
    piece(rect(8, 10, 104, 50, 5), C.brownDark),
    ink([[40, 12], [40, 58]], { width: 2.5, color: '#3a2418' }),
    ink([[10, 35], [44, 35]], { width: 2.5, color: '#3a2418' }),
    piece(rect(50, 6, 64, 58, 4), C.purple, { edge: 'cut' }),
    piece(rect(64, 26, 36, 18, 3), C.gold, { edge: 'cut', fibre: false }),
  ]);
}

// ------------------------------------------------------------------- story

export default defineStory({
  lines: {
    hello: { who: 'lupin', text: 'Shh… hear that rattle? There’s a boggart hiding in my wardrobe!' },
    teach: { who: 'lupin', text: 'Boggarts hate being laughed at. Point your wand and say… Riddikulus!' },
    spider: { who: 'narrator', text: 'Creak! Out pops a big, googly-eyed spider! You hold up your wand…' },
    cast: { who: 'narrator', text: 'Riddikulus! Pop! Now the spider is wearing roller skates!' },
    wobble: { who: 'lupin', text: 'Wibble, wobble… whoops! Oh dear, it can’t stop!' },
    praise: { who: 'lupin', text: 'Ha ha! Brilliant, {name}! Laughing beats a boggart every time.' },
    choc: { who: 'lupin', text: 'Now… chocolate for everyone! Even the birds in the nest!' },
  },

  async play(k) {
    k.backdrop(classroom());

    // The room: wardrobe (with a nest on top), Lupin's desk and lamp, a tent.
    const ward = k.add(wardrobe(), { x: 500, y: 180, w: 230, z: 6 });
    const doorL = ward.querySelector<SVGGElement>('[data-part="dl"]');
    const doorR = ward.querySelector<SVGGElement>('[data-part="dr"]');
    const nest = k.picture('nest', { x: 545, y: 80, w: 140, z: 7 });
    const tent = k.picture('tent', { x: 270, y: 470, w: 210, z: 8, crop: '30 40 340 292', still: true });
    const lupin = k.character('lupin', { x: 900, y: 290, z: 9 });
    k.picture('desk', { x: 885, y: 440, w: 260, z: 12 });
    const lamp = k.picture('lamp', { x: 905, y: 466, w: 100, z: 13 });
    const hero = k.character('hero', { x: 10, y: 350, z: 9 });
    k.set([lupin, hero], { opacity: 0 });
    k.music('sneaky');
    k.ambient('dust', { count: 14, z: 5 });
    const gloom = k.dim(0.18);
    k.light(955, 500, 90, { color: C.candle, flicker: true });

    const rattleAll = async (amount = 6, times = 3): Promise<void> => {
      rattle(times * 3);
      await k.all(k.shake(ward, amount, times), k.shake(nest, amount * 1.4, times), k.shake(lamp, amount * 0.5, times));
    };

    await k.wait(200);
    k.sfx.whoosh();
    await k.all(rattleAll(5, 2), k.enter(lupin, 'right'));
    k.fx.patter(5);
    await k.enter(hero, 'left');
    void rattleAll(4, 2);
    await k.say('hello', lupin);

    // The lesson: the hero's wand.
    const wand = k.picture('wand', { x: 200, y: 370, w: 130, z: 20 });
    k.set(wand, { rotation: -20 });
    k.fx.twinkle();
    await k.appear(wand);
    k.sparkle(310, 360, 8, 80);
    void k.camera({ zoom: 1.25, x: 330, y: 420 }, 1.2);
    await k.say('teach', lupin);

    // Out pops the boggart!
    void k.camera({ zoom: 1.35, x: 610, y: 430 }, 0.9);
    await rattleAll(9, 3);
    k.fx.creak();
    k.fx.poof();
    if (doorL && doorR) {
      void k.to(doorL, 0.3, { scaleX: 0.18, svgOrigin: '21 0', ease: 'back.out(2)' });
      void k.to(doorR, 0.3, { scaleX: 0.18, svgOrigin: '219 0', ease: 'back.out(2)' });
    }
    k.puff(615, 430, 260, C.stoneLight);
    const spiderEl = k.add(spider(), { x: 470, y: 400, w: 290, z: 14 });
    k.fx.pop();
    await k.all(k.appear(spiderEl, 0.45), k.hop(nest, 30), k.shake(hero, 10, 2));
    k.fx.sneak();
    await k.to(spiderEl, 0.35, { y: '+=60', ease: 'power2.out' });
    await k.to(spiderEl, 0.1, { scaleY: 0.9 });
    await k.to(spiderEl, 0.1, { scaleY: 1 });
    await k.say('spider', hero);

    // Riddikulus!
    k.music('magic');
    k.fx.spell();
    await k.to(wand, 0.25, { rotation: -35, ease: 'back.out(2)' });
    await k.beam([315, 385], [615, 500], C.goldLight);
    void k.glow(C.goldLight, 0.35, 0.8);
    void k.fade(gloom, 0, 0.8);
    k.fx.twinkle();
    k.fx.twinkle();
    k.fx.pop();
    spiderEl.querySelector('[data-part="skates"]')?.setAttribute('opacity', '1');
    k.puff(615, 610, 160, C.goldLight);
    await k.all(k.pop(spiderEl, 1.12), k.to(wand, 0.3, { rotation: -20 }));
    await k.say('cast', spiderEl);

    // Wibble, wobble … crash!
    // It rolls to and fro for as long as the line lasts (at least once round).
    let rolling = true;
    const skate = async (): Promise<void> => {
      const swerves: Array<[number, number]> = [[130, 14], [-100, -16], [90, 10], [-50, -8]];
      for (let i = 0; rolling || i < swerves.length; i++) {
        const [x, rotation] = swerves[i % swerves.length];
        skates(0.8);
        if (i % 2 === 0) wobbleWhistle();
        await k.to(spiderEl, 0.85, { x, rotation, ease: 'sine.inOut' });
      }
    };
    void k.camera({ zoom: 1.12, x: 500, y: 450 }, 1.2);
    const rolled = skate();
    await k.say('wobble', lupin);
    rolling = false;
    await rolled;
    // Off it rolls, straight into the tent.
    await k.to(spiderEl, 0.2, { x: '+=30', rotation: 12 });
    skates(0.9);
    k.fx.whizz();
    await k.to(spiderEl, 0.7, { x: -190, y: '+=10', rotation: -30, scale: 0.6, ease: 'power2.in' });
    k.fx.thud();
    k.fx.boing();
    await k.fade(spiderEl, 0, 0.15);
    k.remove(spiderEl);
    await k.to(tent, 0.12, { scaleY: 0.85, transformOrigin: '50% 100%' });
    void k.to(tent, 0.4, { scaleY: 1, ease: 'back.out(3)' });
    await k.shake(tent, 12, 3);
    laugh();
    void k.shake(lupin, 6, 3);
    void k.shake(hero, 6, 3);
    await k.wait(300);
    k.fx.poof();
    k.puff(375, 470, 200, C.stoneLight);
    k.fx.fizzle();
    await k.pop(tent, 1.08);
    // The wardrobe is empty now: its doors swing shut.
    if (doorL && doorR) {
      k.fx.creak();
      await k.all(
        k.to(doorL, 0.4, { scaleX: 1, svgOrigin: '21 0', ease: 'power2.in' }),
        k.to(doorR, 0.4, { scaleX: 1, svgOrigin: '219 0', ease: 'power2.in' }),
      );
      k.fx.knock(1);
      void k.hop(nest, 10);
    }
    k.music('triumph');
    await k.camera({}, 1.4);
    void k.shake(nest, 3, 2);
    setTimeout(cheep, 1800);
    await k.say('praise', lupin);

    // Chocolate for everyone!
    // Lupin keeps one bar and tosses the others: one to you, one to the nest.
    const LUPIN_HAND: Pt = [1000, 440];
    const lupinBar = k.add(chocolate('a'), { x: LUPIN_HAND[0], y: LUPIN_HAND[1], w: 110, z: 22 });
    const heroBar = k.add(chocolate('b'), { x: 140, y: 540, w: 110, z: 22 });
    const nestBar = k.add(chocolate('c'), { x: 588, y: 112, w: 60, z: 22 });
    k.set([lupinBar, heroBar, nestBar], { opacity: 0 });
    const toss = async (bar: HTMLElement, rotation: number): Promise<void> => {
      const dx = LUPIN_HAND[0] - (parseFloat(bar.style.left) || 0);
      const dy = LUPIN_HAND[1] - (parseFloat(bar.style.top) || 0);
      k.set(bar, { x: dx, y: dy, opacity: 1 });
      k.sfx.whoosh();
      await k.all(
        k.to(bar, 0.7, { x: 0, rotation, ease: 'none' }),
        k.to(bar, 0.35, { y: dy - 140, ease: 'power1.out' }).then(() => k.to(bar, 0.35, { y: 0, ease: 'power1.in' })),
      );
      k.fx.pop();
    };
    const handOut = async (): Promise<void> => {
      k.fx.pop();
      await k.appear(lupinBar, 0.3);
      await toss(heroBar, -12);
      await k.all(k.pop(heroBar, 1.12), k.hop(hero, 20));
      await toss(nestBar, 8);
      cheep();
      await k.hop(nest, 18);
    };
    await k.all(k.say('choc', lupin), handOut());
    k.fx.jingle();
    k.confetti(34);
    k.sparkle(600, 330, 14, 180);
    await k.all(k.hop(hero, 50, 2), k.hop(heroBar, 50, 2), k.hop(lupin, 24, 1), k.hop(lupinBar, 24, 1));
    cheep();
    await k.all(k.hop(nest, 22, 2), k.hop(nestBar, 22, 2), k.wait(1600));
  },
});

