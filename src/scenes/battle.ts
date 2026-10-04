/**
 * The Battle of Hogwarts. Same calm spelling desk, but after each word the
 * desk slides down to show the castle: a new piece of the shield lights up
 * and the Death Eaters are pushed back. At the end Voldemort appears and
 * duels the child's character (see afterAll), followed by fireworks.
 */
import { gsap } from 'gsap';
import { sfx } from '../audio/sfx';
import { voice } from '../audio/voice';
import { characters } from '../art/characters';
import { C } from '../art/palette';
import { curve, ellipse, group, piece, poly, svg, type Node, type Pt } from '../art/paper';
import { castleNight } from '../art/scenery';
import { PHRASES, VOLDEMORT } from '../core/phrases';
import { isCalm, sm, stepped } from '../ui/anim';
import { h, place, wait } from '../ui/dom';
import type { App } from '../ui/scene';
import { crop } from './map';
import { SpellScene, type SpellOptions } from './spell';

const SEGMENTS = 8;

// The duel: where the two stand (260×330 portraits), and their wand tips.
// Voldemort is mirrored so his wand points at the hero.
const HERO: Pt = [120, 330];
const VOLD: Pt = [800, 240];
const HERO_TIP: Pt = [HERO[0] + 228, HERO[1] + 188];
const VOLD_TIP: Pt = [VOLD[0] + 30, VOLD[1] + 188];
const LIGHT = '#ff7a4a';
const DARK = '#36d97a';
const DUEL_LINES = [...Object.values(VOLDEMORT), PHRASES.protego, PHRASES.expelliarmus, PHRASES.battleWin];

/** Races a voice line against a timeout so a stuck clip never stalls the duel. */
const capped = (p: Promise<void>, ms: number) => Promise.race([p, wait(ms)]);

function deathEater(name: string): string {
  return svg({ w: 120, h: 160, name, boil: true }, [
    piece(curve([[20, 160], [26, 80], [60, 20], [94, 80], [100, 160], [60, 140]]), '#15151a'),
    piece(ellipse(60, 64, 22, 26), '#c9ccd2', { edge: 'cut' }),
    piece(ellipse(52, 62, 5, 3), C.ink, { edge: 'clean', shadow: false }),
    piece(ellipse(68, 62, 5, 3), C.ink, { edge: 'clean', shadow: false }),
  ]);
}

function shieldDome(): string {
  const nodes: Node[] = [];
  for (let i = 0; i < SEGMENTS; i++) {
    const a0 = Math.PI + (i / SEGMENTS) * Math.PI;
    const a1 = Math.PI + ((i + 1) / SEGMENTS) * Math.PI;
    const cx = 640;
    const cy = 640;
    const R = 470;
    const r2 = 400;
    nodes.push(
      group({ part: `seg${i}`, className: 'seg' }, [
        piece(
          poly([
            [cx + Math.cos(a0) * r2, cy + Math.sin(a0) * r2],
            [cx + Math.cos(a0) * R, cy + Math.sin(a0) * R],
            [cx + Math.cos(a1) * R, cy + Math.sin(a1) * R],
            [cx + Math.cos(a1) * r2, cy + Math.sin(a1) * r2],
          ]),
          '#bfe3ff',
          { edge: 'cut', fibre: false, shadow: false, opacity: 0.55 },
        ),
      ]),
    );
  }
  return svg({ w: 1180, h: 820, name: 'dome', boil: false }, nodes);
}

export class BattleScene extends SpellScene {
  private battle!: HTMLElement;
  private eaters: HTMLElement[] = [];

  constructor(app: App, o: SpellOptions) {
    super(app, o);
    this.root.classList.add('battle');
  }

  protected backdrop(): string {
    return castleNight('battle-castle');
  }

  build(): void {
    super.build();
    this.battle = h('div', { class: 'battle-layer' });
    this.battle.innerHTML = `<div class="dome">${shieldDome()}</div>`;
    this.root.insertBefore(this.battle, this.panel);
    gsap.set(this.battle.querySelectorAll('.seg'), { opacity: 0.08 });

    const spots: Array<[number, number]> = [[40, 300], [150, 210], [70, 470], [1020, 300], [920, 200], [1040, 470]];
    spots.forEach(([x, y], i) => {
      const e = place(h('div', { class: 'eater', html: deathEater('eater' + i) }), x, y, 120, 160);
      this.battle.append(e);
      this.eaters.push(e);
      if (!isCalm()) gsap.to(e, { y: '+=14', duration: 1.6 + i * 0.2, yoyo: true, repeat: -1, ease: stepped(1.6, 'sine.inOut') });
    });
  }

  async enter(): Promise<void> {
    // Show the battlefield first, then bring the desk up.
    gsap.set(this.panel, { y: 820 });
    void voice.preload({ lines: DUEL_LINES });
    sfx.ominous();
    await this.sleep(600);
    await voice.say(PHRASES.battleStart);
    await sm(this.panel, 0.6, { y: 0, ease: 'power2.out' });
    await super.enter();
  }

  protected async afterWord(i: number): Promise<void> {
    await sm(this.panel, 0.5, { y: 820, ease: 'power2.in' });
    sfx.shield();
    const seg = this.battle.querySelectorAll('.seg')[Math.min(SEGMENTS - 1, i)];
    await sm(seg, 0.5, { opacity: 1, ease: 'power2.out' });
    // Push back the nearest Death Eater.
    const e = this.eaters[i % this.eaters.length];
    const left = parseFloat(e.style.left) < 590;
    sfx.whoosh();
    await sm(e, 0.6, { x: left ? -260 : 260, rotation: left ? -30 : 30, opacity: 0, ease: 'power2.in' });
    await this.sleep(250);
    if (i + 1 < this.o.words.length) await sm(this.panel, 0.5, { y: 0, ease: 'power2.out' });
  }

  /**
   * The duel. Voldemort arrives in a thunderclap and taunts; his Stupefy
   * bounces off the hero's Protego; the hero's sparks are swatted away;
   * then both cast at once and the beams lock, pushing back and forth,
   * until Expelliarmus wins: his wand spins off and he's gone in a puff of
   * smoke. Calm mode skips the back-and-forth.
   */
  protected async afterAll(): Promise<void> {
    const calm = isCalm();
    const avatar = this.app.progress.avatar ?? 'harry';
    const vold = place(h('div', { class: 'battle-vold', html: crop(characters.voldemort(), '20 10 260 330') }), VOLD[0], VOLD[1], 260, 330);
    const hero = place(h('div', { class: 'battle-hero', html: crop(characters[avatar](), '20 10 260 330') }), HERO[0], HERO[1], 260, 330);
    const dark = h('div', { class: 'duel-dark' });
    this.fxSvg = h('div', { html: `<svg class="duel-fx" viewBox="0 0 1180 820"></svg>` }).firstElementChild as SVGSVGElement;
    this.battle.prepend(dark);
    this.battle.append(vold, hero, this.fxSvg);
    const voldWand = vold.querySelector('[data-part="wand"]');
    const heroWand = hero.querySelector('[data-part="wand"]');
    // Wands pivot in the hand (people.ts draws them from about here).
    gsap.set([voldWand, heroWand].filter(Boolean), { svgOrigin: '233 318' });

    // Night falls; thunder; Voldemort rises.
    void sm(dark, 0.6, { opacity: 0.6 });
    sfx.thunder();
    if (!calm) this.flash('#e8f0ff', 0.7);
    await this.sleep(250);
    sfx.ominous();
    await Promise.all([
      sm(vold, 0.8, { startAt: { opacity: 0, y: 60, scale: 0.85 }, opacity: 1, y: 0, scale: 1, ease: 'back.out(1.4)' }),
      sm(hero, 0.7, { startAt: { opacity: 0, x: -100 }, opacity: 1, x: 0, ease: 'power2.out', delay: 0.2 }),
    ]);
    if (!calm) gsap.to(vold, { rotation: 3, duration: 0.25, yoyo: true, repeat: 5, ease: stepped(0.25, 'sine.inOut') });
    await capped(voice.say(VOLDEMORT.taunt), 3200);
    gsap.set(vold, { rotation: 0 });

    if (!calm) {
      // Stupefy! … Protego!
      await capped(voice.say(VOLDEMORT.spell), 1500);
      this.flick(voldWand, 40);
      sfx.darkZap();
      const shot = this.bolt(VOLD_TIP, [HERO_TIP[0] + 90, HERO_TIP[1] - 70], DARK, 0.6);
      void voice.say(PHRASES.protego);
      this.flick(heroWand, -35);
      const shield = place(h('div', { class: 'protego' }), HERO[0] - 50, HERO[1] - 40, 360, 360);
      this.battle.append(shield);
      void sm(shield, 0.3, { startAt: { scale: 0.3, opacity: 0 }, scale: 1, opacity: 1, ease: 'back.out(2)' });
      await shot;
      sfx.block();
      this.burst(HERO_TIP[0] + 90, HERO_TIP[1] - 70, [DARK, '#bfe3ff', C.white], 14, 110);
      this.shake(8);
      await sm(shield, 0.2, { scale: 1.08, ease: 'power1.out' });
      await sm(shield, 0.2, { scale: 1, ease: 'power1.in' });
      void sm(shield, 0.5, { opacity: 0, scale: 1.2, delay: 0.3 });
      await this.sleep(400);

      // The hero fires back; he swats the sparks away into the sky.
      for (let k = 0; k < 3; k++) {
        this.flick(heroWand, -30);
        sfx.zap();
        const hit: Pt = [VOLD_TIP[0] - 30 + k * 10, VOLD_TIP[1] - 40 + k * 30];
        void this.bolt(HERO_TIP, hit, LIGHT, 0.45).then(() => {
          this.flick(voldWand, k % 2 ? -50 : 50);
          sfx.block();
          this.burst(hit[0], hit[1], [LIGHT, C.goldLight], 10, 70);
          void this.bolt(hit, [hit[0] - 200 + k * 220, 40 + k * 30], LIGHT, 0.5).then(([x, y]) => {
            sfx.sparkle();
            this.burst(x, y, [C.gold, C.red, C.goldLight], 16, 100);
          });
        });
        await this.sleep(380);
      }
      await this.sleep(1000);
    }

    // Both cast at once: the beams meet and lock.
    this.flick(voldWand, 45);
    this.flick(heroWand, -40);
    sfx.darkZap();
    sfx.zap();
    void voice.say(PHRASES.expelliarmus);
    const lock = { t: 0.5, reach: 0 };
    const clash = place(h('div', { class: 'clash' }), 0, 0, 110, 110);
    this.battle.append(clash);
    gsap.set(clash, { opacity: 0 });
    const stopBeams = this.beams(lock, clash, hero, vold);
    await sm(lock, 0.3, { reach: 1, ease: 'power1.in' });
    gsap.set(clash, { opacity: 1 });
    this.burst(...this.clashPoint(lock.t), [C.white, C.goldLight, DARK], 16, 90);
    sfx.boom();
    if (!calm) {
      const secs = 3.6;
      sfx.crackle(secs);
      // He pushes, the hero pushes back, he pushes again… then the hero wins.
      await gsap
        .timeline()
        .to(lock, { t: 0.28, duration: 1.2, ease: stepped(1.2, 'sine.inOut') })
        .to(lock, { t: 0.58, duration: 0.9, ease: stepped(0.9, 'sine.inOut') })
        .to(lock, { t: 0.44, duration: 0.6, ease: stepped(0.6, 'sine.inOut') })
        .to(lock, { t: 1, duration: 0.9, ease: stepped(0.9, 'power2.in') });
    } else {
      await sm(lock, 0.6, { t: 1, ease: 'power1.in' });
    }

    // Hit! His wand flies away and he vanishes.
    stopBeams();
    clash.remove();
    sfx.triumph();
    this.flash(C.white, calm ? 0.4 : 0.95);
    if (!calm) this.shake(18);
    this.burst(VOLD_TIP[0] + 40, VOLD_TIP[1] - 60, [C.white, C.gold, C.red, C.goldLight], 26, 220);
    if (voldWand) gsap.to(voldWand, { x: -300, y: -420, rotation: 900, opacity: 0, duration: 1.4, ease: 'power2.out' });
    void voice.say(VOLDEMORT.lose);
    await sm(vold, 0.5, { x: 60, rotation: 12, ease: 'power2.out' });
    const smoke = place(h('div', { class: 'smoke', html: smokePuff() }), VOLD[0] - 20, VOLD[1] - 20, 300, 300);
    this.battle.append(smoke);
    sfx.whoosh();
    void sm(smoke, 1.4, { startAt: { scale: 0.3, opacity: 1 }, scale: 1.6, opacity: 0, ease: 'power1.out' });
    await sm(vold, 0.6, { opacity: 0, scale: 0.2, rotation: 360, ease: 'power2.in' });

    // Hooray!
    void sm(dark, 1.2, { opacity: 0 });
    this.fireworks(calm ? 6 : 10);
    sfx.fanfare();
    if (!calm) gsap.to(hero, { y: -50, duration: 0.3, yoyo: true, repeat: 5, ease: stepped(0.3, 'power1.out') });
    await this.sleep(400);
    await voice.say(PHRASES.battleWin);
    await this.sleep(2200);
  }

  private fxSvg!: SVGSVGElement;

  /** Where the locked beams meet, `t` of the way from the hero's wand to his. */
  private clashPoint(t: number): Pt {
    return [HERO_TIP[0] + (VOLD_TIP[0] - HERO_TIP[0]) * t, HERO_TIP[1] + (VOLD_TIP[1] - HERO_TIP[1]) * t];
  }

  /**
   * Draws the two locked beams as crackling lightning, redrawn at the
   * stop-motion frame rate. Both duellers lean with the struggle.
   */
  private beams(lock: { t: number; reach: number }, clash: HTMLElement, hero: HTMLElement, vold: HTMLElement): () => void {
    const ns = 'http://www.w3.org/2000/svg';
    const mk = (stroke: string, width: number, opacity: number) => {
      const p = document.createElementNS(ns, 'polyline');
      p.setAttribute('fill', 'none');
      p.setAttribute('stroke', stroke);
      p.setAttribute('stroke-width', String(width));
      p.setAttribute('stroke-linecap', 'round');
      p.setAttribute('stroke-linejoin', 'round');
      p.setAttribute('opacity', String(opacity));
      this.fxSvg.append(p);
      return p;
    };
    const lines: Array<[Pt, SVGPolylineElement[]]> = [
      [HERO_TIP, [mk(LIGHT, 26, 0.35), mk('#ffd27a', 10, 0.9), mk(C.white, 3.5, 1)]],
      [VOLD_TIP, [mk(DARK, 26, 0.35), mk('#7cf0a8', 10, 0.9), mk(C.white, 3.5, 1)]],
    ];
    let on = true;
    let frame = 0;
    const draw = () => {
      if (!on) return;
      const half = lock.reach;
      const meet = this.clashPoint(lock.t);
      for (const [from, polys] of lines) {
        const to: Pt = [from[0] + (meet[0] - from[0]) * half, from[1] + (meet[1] - from[1]) * half];
        const pts = zigzag(from, to, 9, 14);
        polys.forEach((p) => p.setAttribute('points', pts));
      }
      if (half >= 1) {
        gsap.set(clash, { left: meet[0] - 55, top: meet[1] - 55, scale: 0.8 + Math.random() * 0.5, rotation: Math.random() * 90 });
        if (frame++ % 2 === 0) this.burst(meet[0], meet[1], [C.white, C.goldLight, '#7cf0a8', '#ffd27a'], 3, 70);
      }
      const lean = (lock.t - 0.5) * 60;
      gsap.set(hero, { x: lean });
      gsap.set(vold, { x: lean });
      this.later(1000 / 12, draw);
    };
    draw();
    return () => {
      on = false;
      this.fxSvg.innerHTML = '';
    };
  }

  /** A ball of spell-light flying from one point to another; resolves where it lands. */
  private bolt(from: Pt, to: Pt, color: string, seconds: number): Promise<Pt> {
    const b = place(h('div', { class: 'bolt' }), from[0] - 30, from[1] - 30, 60, 60);
    b.style.setProperty('--c', color);
    this.battle.append(b);
    let last = -1;
    return new Promise((resolve) => {
      gsap.to(b, {
        x: to[0] - from[0],
        y: to[1] - from[1],
        duration: seconds,
        ease: stepped(seconds, 'power1.in'),
        onUpdate: () => {
          const x = gsap.getProperty(b, 'x') as number;
          if (x === last) return;
          last = x;
          this.burst(from[0] + x, from[1] + (gsap.getProperty(b, 'y') as number), [color, C.white], 2, 30);
        },
        onComplete: () => {
          b.remove();
          resolve(to);
        },
      });
    });
  }

  /** Sparks flying out from a point. */
  private burst(x: number, y: number, colors: string[], n: number, dist: number): void {
    for (let k = 0; k < n; k++) {
      const s = 6 + Math.random() * 10;
      const p = place(h('div', { class: 'spark' }), x - s / 2, y - s / 2, s, s);
      p.style.background = colors[k % colors.length];
      this.battle.append(p);
      const a = (k / n) * Math.PI * 2 + Math.random() * 0.6;
      const d = dist * (0.5 + Math.random() * 0.7);
      gsap.to(p, {
        x: Math.cos(a) * d,
        y: Math.sin(a) * d + dist * 0.25,
        opacity: 0,
        duration: 0.7,
        ease: stepped(0.7, 'power2.out'),
        onComplete: () => p.remove(),
      });
    }
  }

  /** A quick flick of a wand (rotation in degrees). */
  private flick(wand: Element | null, deg: number): void {
    if (!wand) return;
    gsap.timeline().to(wand, { rotation: deg, duration: 0.1, ease: stepped(0.1) }).to(wand, { rotation: 0, duration: 0.3, ease: stepped(0.3) });
  }

  /** The whole screen lights up for a moment. */
  private flash(color: string, peak: number): void {
    const f = h('div', { class: 'duel-flash' });
    f.style.background = color;
    this.battle.append(f);
    gsap
      .timeline({ onComplete: () => f.remove() })
      .set(f, { opacity: peak })
      .to(f, { opacity: 0, duration: 0.5, ease: stepped(0.5, 'power1.in') }, 1 / 12);
  }

  /** The battlefield jolts. */
  private shake(px: number): void {
    const tl = gsap.timeline();
    for (let k = 0; k < 5; k++) {
      const a = px * (1 - k / 5);
      tl.set(this.battle, { x: (Math.random() - 0.5) * 2 * a, y: (Math.random() - 0.5) * 2 * a }, k / 12);
    }
    tl.set(this.battle, { x: 0, y: 0 }, 5 / 12);
  }

  private fireworks(count: number): void {
    const colors = [C.gold, C.red, C.sky, C.goldLight, C.green];
    for (let b = 0; b < count; b++) {
      const cx = 160 + Math.random() * 860;
      const cy = 80 + Math.random() * 240;
      this.later(b * 360, () => {
        sfx.sparkle();
        for (let k = 0; k < 18; k++) {
          const p = place(h('div', { class: 'spark' }), cx, cy, 10, 10);
          p.style.background = colors[(b + k) % colors.length];
          this.battle.append(p);
          const a = (k / 18) * Math.PI * 2;
          gsap.to(p, {
            x: Math.cos(a) * 130,
            y: Math.sin(a) * 130 + 40,
            opacity: 0,
            duration: 1.3,
            ease: stepped(1.3, 'power2.out'),
            onComplete: () => p.remove(),
          });
        }
      });
    }
  }
}

/** A jagged line from a to b, as SVG points: lightning. */
function zigzag(a: Pt, b: Pt, segments: number, jitter: number): string {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const [nx, ny] = [-dy / len, dx / len];
  const pts: string[] = [];
  for (let i = 0; i <= segments; i++) {
    const f = i / segments;
    const j = i === 0 || i === segments ? 0 : (Math.random() - 0.5) * 2 * jitter;
    pts.push(`${(a[0] + dx * f + nx * j).toFixed(1)},${(a[1] + dy * f + ny * j).toFixed(1)}`);
  }
  return pts.join(' ');
}

function smokePuff(): string {
  return svg({ w: 300, h: 300, name: 'smoke', boil: false }, [
    piece(ellipse(150, 160, 120, 90), C.stoneLight, { rough: 2 }),
    piece(ellipse(100, 120, 70, 60), C.stone, { rough: 2 }),
    piece(ellipse(200, 120, 70, 60), C.stoneLight, { rough: 2 }),
  ]);
}
