/**
 * Book 6, chapter 2: The Crystal Cave.
 *
 * Waves crash on a high cliff. Dumbledore and the hero step into a sea cave;
 * he touches the rock and a hidden arch glows open. A dark glassy lake; he pulls
 * a little glowing boat up on a chain, they glide to an island, and crystals
 * light up all around like stars. Calm, wonder-filled ending.
 */
import { bell, C, circle, curve, defineStory, dot, ellipse, ink, type Kit, noiseBurst, NOTE, now, piece, poly, rect, rng, svg, tone, type Node, type Pt } from './kit';

// ------------------------------------------------------------------ sounds

/** Slow soft waves breaking on rock. */
function waves(): void {
  const t = now();
  for (let i = 0; i < 3; i++) {
    noiseBurst(t + i * 1.4, { freq: 300, q: 0.6, peak: 0.1, attack: 0.7, decay: 1.1, sweepTo: 1400 });
    noiseBurst(t + i * 1.4 + 0.9, { freq: 1800, q: 0.5, peak: 0.04, attack: 0.1, decay: 0.8, type: 'highpass' });
  }
}

/** Echoey drips: each drip is a tiny bell followed by faint repeats. */
function drips(): void {
  const t = now();
  const notes = [1760, NOTE.E6, NOTE.C7];
  notes.forEach((f, i) => {
    for (let e = 0; e < 3; e++) tone(f, t + i * 0.55 + e * 0.17, { peak: 0.1 / (e + 1), attack: 0.003, decay: 0.12, glideTo: f * 0.85, lowpass: 5000 });
  });
}

/** A low, gentle hum as the arch wakes, rising softly. */
function archHum(): void {
  const t = now();
  tone(110, t, { peak: 0.09, attack: 0.9, decay: 2.2, glideTo: 165, vibrato: [4, 2], lowpass: 700 });
  tone(165.5, t + 0.2, { peak: 0.06, attack: 0.9, decay: 2, glideTo: 247, vibrato: [3, 2], lowpass: 900 });
  bell(NOTE.E5, t + 1.4, 0.07, 1.6);
}

/** Crystal chimes, one note per crystal. */
function chime(i: number): void {
  const scale = [NOTE.C6, NOTE.E6, NOTE.G6, 1760, NOTE.D6, NOTE.C7, NOTE.G6];
  const t = now();
  bell(scale[i % scale.length], t, 0.1, 1.4);
  bell(scale[i % scale.length] * 2, t + 0.04, 0.03, 0.9);
}

/** A chain clinking up out of the water. */
function chainClink(): void {
  const t = now();
  for (let i = 0; i < 7; i++) noiseBurst(t + i * 0.13, { freq: 3800 + (i % 2) * 900, q: 6, peak: 0.05, decay: 0.05 });
}

// --------------------------------------------------------------------- art

const ROCK = '#3b4157';
const ROCK_DARK = '#2b3045';
const ROCK_LIGHT = '#566079';
const WATER = '#1c2a45';

function crystalArt(w: number, h: number, col: string, light: string, name: string): string {
  const cx = w / 2;
  return svg({ w, h, name, boil: false }, [
    piece(ellipse(cx, h * 0.45, w * 0.55, h * 0.45), light, { edge: 'clean', shadow: false, fibre: false, opacity: 0.28 }),
    piece(poly([[cx - w * 0.3, h], [cx - w * 0.36, h * 0.3], [cx, 0], [cx + w * 0.36, h * 0.3], [cx + w * 0.3, h]]), col, { edge: 'cut', fibre: false }),
    piece(poly([[cx, 0], [cx + w * 0.36, h * 0.3], [cx + w * 0.3, h], [cx + w * 0.02, h]]), light, { edge: 'clean', fibre: false, shadow: false, opacity: 0.55 }),
    ink([[cx - w * 0.12, h * 0.25], [cx - w * 0.1, h * 0.7]], { width: 3, color: C.white }),
  ]);
}

function archArt(): string {
  const pts: Pt[] = [[0, 330]];
  for (let i = 0; i <= 14; i++) {
    const a = Math.PI + (i / 14) * Math.PI;
    pts.push([95 + Math.cos(a) * 95, 100 + Math.sin(a) * 95 + 95 * 0 + 0]);
  }
  pts.push([190, 330]);
  return svg({ w: 190, h: 330, name: 'b6c2-arch', boil: false }, [
    piece(poly(pts), C.goldLight, { edge: 'clean', shadow: false, fibre: false, opacity: 0.55 }),
    piece(poly(pts.map(([x, y]): Pt => [95 + (x - 95) * 0.8, 100 + (y - 100) * 0.9 + 22])), C.cream, { edge: 'clean', shadow: false, fibre: false, opacity: 0.7 }),
    ink(pts.slice(0, 16), { width: 6, color: C.gold }),
  ]);
}

function boatArt(): string {
  return svg({ w: 320, h: 130, name: 'b6c2-boat', boil: false }, [
    piece(ellipse(160, 70, 170, 70), C.goldLight, { edge: 'clean', shadow: false, fibre: false, opacity: 0.25 }),
    piece(curve([[10, 36], [160, 52], [310, 36], [270, 108], [160, 120], [50, 108]]), C.wood, { edge: 'cut' }),
    piece(rect(24, 36, 272, 10, 4), C.brown, { edge: 'cut', fibre: false }),
    ink([[56, 70], [264, 70]], { width: 3, color: C.brownDark }),
    ink([[70, 94], [250, 94]], { width: 3, color: C.brownDark }),
    dot(160, 30, 9, C.candle),
    piece(circle(160, 30, 18), C.candle, { edge: 'clean', shadow: false, fibre: false, opacity: 0.35 }),
  ]);
}

function chainArt(): string {
  const links: Node[] = [];
  for (let y = 10; y < 590; y += 26) links.push(piece(ellipse(14, y, 8, 12), C.grey, { edge: 'cut', fibre: false, shadow: false }));
  return svg({ w: 28, h: 600, name: 'b6c2-chain', boil: false }, links);
}

function cave(): string {
  const r = rng(62);
  const drips: Node[] = [];
  // stalactites along the ceiling
  for (let x = 20; x < 1180; x += 90 + r() * 50) {
    const hh = 60 + r() * 90;
    drips.push(piece(poly([[x - 28, -10], [x + 28, -10], [x + 3, hh]]), ROCK_LIGHT, { edge: 'torn', fibre: false }));
  }
  const ripples: Node[] = [];
  for (let i = 0; i < 12; i++) {
    const x = 640 + r() * 520;
    const y = 530 + r() * 150;
    ripples.push(ink([[x, y], [x + 40 + r() * 40, y + r() * 3]], { width: 2, color: '#34496e' }));
  }
  const stars: Node[] = [];
  for (let i = 0; i < 6; i++) stars.push(dot(900 + r() * 230, 100 + r() * 90, 1.6, C.cream, 0.8));
  return svg({ w: 1180, h: 820, name: 'b6c2-cave', boil: false, className: 'backdrop' }, [
    piece(rect(-20, -20, 1220, 860), ROCK, { edge: 'clean', shadow: false }),
    // a window to the sea outside, high on the right
    piece(curve([[870, 300], [880, 90], [1040, 50], [1170, 90], [1175, 300]]), C.sky, { edge: 'cut', fibre: false }),
    piece(rect(872, 190, 306, 110, 6), C.blue, { edge: 'clean', fibre: false, shadow: false }),
    ink([[890, 230], [940, 218], [990, 232], [1040, 220]], { width: 3, color: C.white }),
    ink([[1060, 258], [1110, 246], [1160, 260]], { width: 3, color: C.white }),
    ...stars,
    piece(rect(-20, 295, 900, 400), ROCK_DARK, { edge: 'torn', rough: 1.2 }),
    ...drips,
    // the floor ledge on the left
    piece(curve([[-30, 640], [200, 628], [420, 636], [610, 650], [620, 700], [-30, 700]]), ROCK_LIGHT, { edge: 'torn' }),
    // the dark glassy lake
    piece(rect(560, 470, 700, 260, 8), WATER, { edge: 'torn', fibre: false }),
    ...ripples,
    // the far island
    piece(curve([[700, 560], [820, 500], [1000, 490], [1150, 540], [1190, 600], [1100, 640], [790, 640]]), ROCK_LIGHT, { edge: 'torn' }),
    piece(curve([[760, 600], [900, 570], [1100, 580], [1120, 620], [800, 630]]), ROCK, { edge: 'clean', fibre: false, shadow: false }),
    piece(rect(0, 700, 1180, 130), ROCK_DARK, { edge: 'clean', shadow: false }),
  ]);
}

// ------------------------------------------------------------------- story

const CRYSTALS: Array<{ x: number; y: number; w: number; h: number; col: string; light: string }> = [
  { x: 740, y: 440, w: 70, h: 130, col: C.purple, light: C.pink },
  { x: 830, y: 380, w: 90, h: 180, col: C.blue, light: C.sky },
  { x: 940, y: 430, w: 70, h: 140, col: C.teal, light: C.sky },
  { x: 1030, y: 360, w: 100, h: 200, col: C.plum, light: C.pink },
  { x: 1120, y: 440, w: 60, h: 120, col: C.blue, light: C.white },
  { x: 120, y: 90, w: 60, h: 100, col: C.purple, light: C.pink },
  { x: 700, y: 60, w: 70, h: 120, col: C.teal, light: C.sky },
];

export default defineStory({
  lines: {
    cliff: { who: 'narrator', text: 'Waves crash on the tall, high cliff. Down below, there is a sea cave!' },
    follow: { who: 'dumbledore', text: 'Follow me, {name}. Some doors open only for a gentle touch.' },
    touch: { who: 'narrator', text: 'He touches the cold rock… and a hidden arch glows open!' },
    lake: { who: 'narrator', text: 'Beyond it, a dark lake lies still as glass. Drip… drip…' },
    boat: { who: 'dumbledore', text: 'Ah! Our little boat. Hold the rope, and up she comes!' },
    crystals: { who: 'narrator', text: 'The boat glides to an island, and crystals light up like stars!' },
    wonder: { who: 'dumbledore', text: 'Wonderful, isn’t it? Some places are just for wondering at.' },
  },
  async play(k: Kit) {
    k.backdrop(cave());
    const arch = k.add(archArt(), { x: 440, y: 190, w: 190, h: 330, z: 4 });
    k.set(arch, { opacity: 0 });
    const hero = k.character('hero', { x: 40, y: 350, w: 200, z: 20 });
    const dum = k.character('dumbledore', { x: 150, y: 330, w: 210, z: 21 });
    k.set(hero, { opacity: 0 });
    k.set(dum, { opacity: 0 });
    const pics: Record<string, HTMLElement> = {};
    const word = (w: string, x: number, y: number): HTMLElement => {
      const p = k.picture(w, { x, y, w: 120, z: 30 });
      k.set(p, { opacity: 0 });
      pics[w] = p;
      return p;
    };
    const showWord = async (w: string): Promise<void> => {
      k.fx.pop();
      await k.appear(pics[w], 0.3);
      k.float(pics[w], 6, 1.8);
    };
    word('bone', 250, 60);
    word('stone', 380, 40);
    word('rope', 700, 60);
    word('smoke', 860, 60);
    word('cube', 1010, 70);

    // Waves crash outside; the two step into the cave.
    waves();
    k.fx.wind(2);
    void k.fade(hero, 1, 0.5);
    void k.fade(dum, 1, 0.5);
    await k.say('cliff');
    drips();
    await showWord('bone');
    await k.all(k.say('follow', dum), k.walk(dum, 220, 1.8, 3), k.walk(hero, 120, 1.8, 3));

    // The hidden arch.
    await k.say('touch', dum);
    archHum();
    void k.glow(C.goldLight, 0.3, 1.6);
    await k.fade(arch, 1, 1.2);
    k.sparkle(535, 300, 14, 120);
    await showWord('stone');
    await k.wait(300);

    // The still, dark lake.
    drips();
    await k.say('lake');
    k.fx.poof();
    await k.wait(300);

    // The chain, the rope and the boat.
    const chain = k.add(chainArt(), { x: 700, y: -20, w: 28, h: 600, z: 6 });
    k.set(chain, { opacity: 0 });
    await k.appear(chain, 0.3);
    chainClink();
    const boat = k.add(boatArt(), { x: 560, y: 580, w: 320, h: 130, z: 9 });
    k.set(boat, { opacity: 0, y: 160 });
    void k.say('boat', dum);
    await k.wait(400);
    void k.fade(boat, 1, 0.6);
    await k.to(boat, 2, { y: 0, ease: 'sine.out' });
    k.fx.splash();
    await showWord('rope');
    k.sfx.sparkle();
    await k.wait(300);

    // Climb in and glide across the water.
    void k.vanish(chain, 0.4);
    await k.all(k.walk(dum, 190, 1.2, 2), k.walk(hero, 560, 2.2, 4));
    k.set(dum, { z: 21 });
    await showWord('smoke');
    const glide = 3;
    k.puff(740, 640, 140, C.white);
    void k.say('crystals');
    await k.all(
      k.to(boat, glide, { x: '+=220', ease: 'sine.inOut' }),
      k.to(hero, glide, { x: '+=220', ease: 'sine.inOut' }),
      k.to(dum, glide, { x: '+=220', ease: 'sine.inOut' }),
      k.wait(1500).then(() => k.fx.whizz()),
    );

    // The crystals wake up, one by one, like stars.
    const lamps = CRYSTALS.map((c, i) => {
      const el = k.add(crystalArt(c.w, c.h, c.col, c.light, `b6c2-crystal${i}`), { x: c.x, y: c.y, w: c.w, h: c.h, z: i < 5 ? 5 : 3 });
      k.set(el, { opacity: 0, scale: 0.4, transformOrigin: '50% 100%' });
      return el;
    });
    for (const [i, el] of lamps.entries()) {
      chime(i);
      k.sparkle(CRYSTALS[i].x + CRYSTALS[i].w / 2, CRYSTALS[i].y + 30, 6, 60);
      void k.to(el, 0.5, { opacity: 1, scale: 1, ease: 'back.out(2)' });
      k.float(el, 4, 2 + i * 0.2);
      await k.wait(250);
    }
    await showWord('cube');
    void k.glow(C.sky, 0.3, 2);
    await k.wait(500);

    // A calm, happy ending.
    await k.say('wonder', dum);
    k.fx.jingle();
    k.confetti(30);
    k.sparkle(900, 300, 18, 260);
    await k.all(k.hop(hero, 40, 2), k.hop(dum, 18, 1));
    await k.wait(500);
  },
});
