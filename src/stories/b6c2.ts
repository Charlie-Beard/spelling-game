/**
 * Book 6, chapter 2: The Crystal Cave.
 *
 * Waves crash on a high cliff. Dumbledore and the hero step into a sea cave;
 * he touches the rock and a hidden arch glows open. A dark glassy lake; he pulls
 * a little glowing boat up on a chain, they glide to an island, and crystals
 * light up all around like stars. Calm, wonder-filled ending.
 */
import { band, bell, C, circle, curve, defineStory, dot, ellipse, ink, type Kit, noiseBurst, NOTE, now, piece, poly, rect, rng, svg, tone, type Node, type Pt } from './kit';

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
  const pts: Pt[] = [[14, 5], [8, 150], [20, 300], [8, 450], [14, 595]];
  return svg({ w: 28, h: 600, name: 'b6c2-chain', boil: false }, [
    piece(band(pts, 9), C.brown, { edge: 'cut', fibre: false, shadow: false }),
    ink([[14, 5], [8, 150], [20, 300], [8, 450], [14, 595]], { width: 2, color: C.brownDark }),
  ]);
}

function cliffs(): string {
  const r = rng(61);
  const stars: Node[] = [];
  for (let i = 0; i < 14; i++) stars.push(dot(r() * 1180, r() * 260, 1.8, C.cream, 0.8));
  const waveInk: Node[] = [];
  for (let i = 0; i < 10; i++) {
    const x = 560 + r() * 560;
    const y = 540 + r() * 150;
    waveInk.push(ink([[x, y], [x + 30, y - 8], [x + 70, y]], { width: 3, color: C.white }));
  }
  return svg({ w: 1180, h: 820, name: 'b6c2-cliffs', boil: false, className: 'backdrop' }, [
    piece(rect(-20, -20, 1220, 860), C.night, { edge: 'clean', shadow: false }),
    ...stars,
    piece(circle(980, 120, 40), C.cream, { edge: 'clean', shadow: false, fibre: false }),
    piece(rect(-20, 520, 1220, 320), C.blueDark, { edge: 'torn', fibre: false }),
    ...waveInk,
    piece(poly([[-20, 220], [200, 200], [400, 230], [520, 330], [540, 520], [500, 700], [-20, 700]]), ROCK, { edge: 'torn', rough: 1.4 }),
    piece(ellipse(380, 600, 90, 110), ROCK_DARK, { edge: 'clean', shadow: false }),
    piece(rect(0, 700, 1180, 130), C.blueDark, { edge: 'clean', shadow: false }),
  ]);
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
  return svg({ w: 1180, h: 820, name: 'b6c2-cave', boil: false, className: 'backdrop' }, [
    piece(rect(-20, -20, 1220, 860), ROCK, { edge: 'clean', shadow: false }),
    piece(rect(-20, 295, 900, 400), ROCK_DARK, { edge: 'torn', rough: 1.2 }),
    ...drips,
    // the floor ledge on the left
    piece(curve([[-30, 640], [200, 628], [420, 636], [610, 650], [620, 700], [-30, 700]]), ROCK_LIGHT, { edge: 'torn' }),
    // the dark glassy lake
    piece(rect(560, 470, 700, 260, 8), WATER, { edge: 'torn', fibre: false }),
    ...ripples,
    // the far island
    piece(curve([[700, 560], [820, 500], [1000, 490], [1150, 540], [1190, 600], [1100, 640], [790, 640]]), ROCK_LIGHT, { edge: 'torn' }),
    piece(curve([[760, 600], [900, 570], [1100, 580], [1120, 620], [800, 630]]), ROCK_DARK, { edge: 'clean', fibre: false, shadow: false, opacity: 0.6 }),
    ink([[800, 655], [900, 662], [1000, 656], [1100, 660]], { width: 3, color: C.sky }),
    piece(rect(0, 700, 1180, 130), ROCK_DARK, { edge: 'clean', shadow: false }),
  ]);
}

// ------------------------------------------------------------------- story

const CRYSTALS: Array<{ x: number; y: number; w: number; h: number; col: string; light: string }> = [
  { x: 600, y: 120, w: 70, h: 130, col: C.purple, light: C.pink },
  { x: 720, y: 60, w: 90, h: 180, col: C.blue, light: C.sky },
  { x: 860, y: 140, w: 70, h: 140, col: C.teal, light: C.sky },
  { x: 960, y: 70, w: 90, h: 190, col: C.plum, light: C.pink },
  { x: 1060, y: 180, w: 70, h: 140, col: C.blue, light: C.white },
  { x: 90, y: 110, w: 60, h: 110, col: C.purple, light: C.pink },
  { x: 300, y: 60, w: 60, h: 100, col: C.teal, light: C.sky },
];

export default defineStory({
  lines: {
    cliff: { who: 'narrator', text: 'Whoosh… waves crash on a tall, dark cliff. Down below… a secret sea cave!' },
    follow: { who: 'dumbledore', text: 'Follow me, {name}. Some doors open only for a gentle touch.' },
    touch: { who: 'dumbledore', text: 'Just a gentle tap… there! Do you see? The rock is waking up!' },
    lake: { who: 'narrator', text: 'Beyond the arch, a dark lake lies still as glass. Drip… drip…' },
    boat: { who: 'dumbledore', text: 'Ah! Our little boat. Pull the rope, and up she comes!' },
    crystals: { who: 'narrator', text: 'The boat glides to an island… and crystals light up like stars!' },
    wonder: { who: 'dumbledore', text: 'Wonderful, isn’t it? Some places are just for wondering at.' },
  },
  async play(k: Kit) {
    // Scene 1: the cliff above the sea.
    k.music('magic');
    k.backdrop(cliffs());
    k.ambient('stars', { count: 20, area: [0, 0, 1180, 300] });
    const h0 = k.character('hero', { x: 150, y: 60, w: 150, z: 20 });
    const d0 = k.character('dumbledore', { x: 300, y: 55, w: 160, z: 21 });
    waves();
    k.fx.wind(2);
    k.puff(560, 560, 140, C.white);
    void k.camera({ zoom: 1.4, x: 380, y: 560 }, 1.6);
    await k.say('cliff');
    k.remove(h0);
    k.remove(d0);
    let sc!: Scene;
    await k.cut(() => {
      sc = buildCave(k);
    });
    await rest(k, sc);
  },
});

interface Scene {
  dim: HTMLElement;
  arch: HTMLElement;
  hero: HTMLElement;
  dum: HTMLElement;
  showWord: (w: string) => Promise<void>;
}

function buildCave(k: Kit): Scene {
  {
    k.backdrop(cave());
    const spur = k.add(
      svg({ w: 260, h: 230, name: 'b6c2-spur', boil: false }, [
        piece(curve([[0, 230], [10, 60], [110, 10], [220, 90], [260, 230]]), ROCK_DARK, { edge: 'torn' }),
      ]),
      { x: -20, y: 600, w: 260, h: 230, z: 25 },
    );
    void spur;
    const dim = k.dim(0.45);
    k.ambient('dust', { count: 10 });
    const arch = k.add(archArt(), { x: 440, y: 190, w: 190, h: 330, z: 4 });
    k.set(arch, { opacity: 0 });
    const hero = k.character('hero', { x: 60, y: 350, w: 200, z: 20 });
    const dum = k.character('dumbledore', { x: 250, y: 330, w: 210, z: 21 });
    const pics: Record<string, HTMLElement> = {};
    const word = (w: string, x: number, y: number, size: number): HTMLElement => {
      const p = k.picture(w, { x, y, w: size, z: 12 });
      k.set(p, { opacity: 0 });
      pics[w] = p;
      return p;
    };
    const showWord = async (w: string): Promise<void> => {
      k.fx.pop();
      void k.appear(pics[w], 0.3);
      k.float(pics[w], 6, 1.8);
    };
    word('bone', 330, 595, 90);
    word('stone', 560, 470, 100);
    word('rope', 470, 595, 100);
    word('smoke', 470, 130, 110);
    word('cube', 1000, 470, 110);
    return { dim, arch, hero, dum, showWord };
  }
}

async function rest(k: Kit, sc: Scene): Promise<void> {
  {
    const { dim, arch, hero, dum, showWord } = sc;
    // They step into the cave.
    drips();
    await showWord('bone');
    await k.all(k.say('follow', dum), k.walk(dum, 100, 1.8, 3), k.walk(hero, 80, 1.8, 3));

    // The hidden arch.
    void k.camera({ zoom: 1.35, x: 450, y: 400 }, 1.2);
    archHum();
    void k.say('touch', dum);
    await showWord('stone');
    const archLight = k.light(535, 340, 170, { color: C.goldLight, strength: 0.5 });
    k.set(archLight, { opacity: 0 });
    void k.fade(archLight, 1, 1.2);
    void k.glow(C.goldLight, 0.3, 1.6);
    await k.fade(arch, 1, 1.2);
    k.sparkle(535, 300, 14, 120);
    await showWord('smoke');
    k.puff(535, 250, 90, C.white);
    await k.wait(600);

    // The still, dark lake, with a drip that makes a ripple.
    await k.camera({}, 1.2);
    const lakeP = k.say('lake');
    const drop = k.add(svg({ w: 14, h: 22, name: 'b6c2-drop', boil: false }, [piece(ellipse(7, 12, 5, 9), C.sky, { edge: 'clean', shadow: false, fibre: false })]), { x: 900, y: 100, w: 14, h: 22, z: 7 });
    await k.to(drop, 1.2, { y: 600, ease: 'power2.in' });
    k.remove(drop);
    k.fx.splash();
    const ripple = k.add(svg({ w: 120, h: 30, name: 'b6c2-ripple', boil: false }, [ink([[6, 15], [30, 8], [60, 6], [90, 8], [114, 15], [90, 22], [60, 24], [30, 22], [6, 15]], { width: 3, color: C.sky })]), { x: 840, y: 610, w: 120, h: 30, z: 7 });
    k.set(ripple, { scale: 0.3 });
    void k.to(ripple, 1.4, { scale: 1.6, opacity: 0 });
    await lakeP;

    // The rope pulls up the boat.
    const chain = k.add(chainArt(), { x: 700, y: -20, w: 28, h: 600, z: 6 });
    k.set(chain, { opacity: 0 });
    void k.appear(chain, 0.3);
    k.fx.patter(5, 0.12);
    void showWord('rope');
    const boat = k.add(boatArt(), { x: 560, y: 580, w: 320, h: 130, z: 9 });
    k.set(boat, { opacity: 0, y: 160 });
    void k.say('boat', dum);
    await k.wait(300);
    void k.fade(boat, 1, 0.6);
    k.fx.creak();
    await k.to(boat, 2, { y: 0, ease: 'sine.out' });
    k.fx.splash();
    k.sfx.sparkle();

    // Climb in and glide across the water.
    void k.vanish(chain, 0.4);
    await k.all(k.walk(dum, 350, 1.4, 2), k.walk(hero, 700, 2.2, 4));
    k.set(dum, { z: 21 });
    const glide = 3;
    k.puff(740, 640, 140, C.white);
    const lantern = k.light(720, 610, 90, { color: C.candle, strength: 0.4, flicker: true });
    void lantern;
    void k.camera({ zoom: 1.25, x: 860, y: 420 }, glide);
    void k.say('crystals');
    await k.all(
      k.to(boat, glide, { x: '+=220', ease: 'sine.inOut' }),
      k.to(hero, glide, { x: '+=220', ease: 'sine.inOut' }),
      k.to(dum, glide, { x: '+=220', ease: 'sine.inOut' }),
      k.wait(1500).then(() => k.fx.whizz()),
    );

    // The crystals wake up, one by one, like stars.
    k.music('dreamy');
    k.ambient('fireflies', { count: 14, area: [540, 40, 640, 420] });
    const lamps = CRYSTALS.map((c, i) => {
      const el = k.add(crystalArt(c.w, c.h, c.col, c.light, `b6c2-crystal${i}`), { x: c.x, y: c.y, w: c.w, h: c.h, z: 5 });
      k.set(el, { opacity: 0, scale: 0.4, transformOrigin: '50% 100%' });
      return el;
    });
    for (const [i, el] of lamps.entries()) {
      const c = CRYSTALS[i];
      chime(i);
      k.sparkle(c.x + c.w / 2, c.y + 30, 6, 60);
      k.light(c.x + c.w / 2, c.y + c.h / 2, 90, { color: c.light, strength: 0.3 });
      void k.to(el, 0.5, { opacity: 1, scale: 1, ease: 'back.out(2)' });
      k.float(el, 4, 2 + i * 0.2);
      await k.wait(220);
    }
    k.light(1055, 520, 120, { color: C.sky, strength: 0.4 });
    await showWord('cube');
    void k.glow(C.sky, 0.3, 2);

    // A calm, happy ending.
    void k.fade(dim, 0.25, 2);
    void k.camera({}, 2);
    await k.say('wonder', dum);
    k.fx.jingle();
    k.confetti(30);
    k.sparkle(900, 300, 18, 260);
    await k.all(k.hop(hero, 40, 2), k.hop(dum, 18, 1));
    await k.wait(1500);
  }
}
