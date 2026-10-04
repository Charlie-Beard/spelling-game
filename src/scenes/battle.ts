/**
 * The Battle of Hogwarts. Same calm spelling desk, but after each word the
 * desk slides down to show the castle: a new piece of the shield lights up
 * and the Death Eaters are pushed back. At the end Voldemort appears and
 * is disarmed with Expelliarmus — his wand spins away and he vanishes in a
 * puff of smoke, followed by fireworks.
 */
import { gsap } from 'gsap';
import { sfx } from '../audio/sfx';
import { voice } from '../audio/voice';
import { characters } from '../art/characters';
import { C } from '../art/palette';
import { curve, ellipse, group, piece, poly, svg, type Node } from '../art/paper';
import { castleNight } from '../art/scenery';
import { PHRASES } from '../core/phrases';
import { isCalm, sm, stepped } from '../ui/anim';
import { h, place } from '../ui/dom';
import type { App } from '../ui/scene';
import { crop } from './map';
import { SpellScene, type SpellOptions } from './spell';

const SEGMENTS = 8;

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

  protected async afterAll(): Promise<void> {
    // Voldemort appears…
    const vold = place(h('div', { class: 'battle-vold', html: crop(characters.voldemort(), '20 10 260 330') }), 760, 170, 260, 330);
    const avatar = this.app.progress.avatar ?? 'harry';
    const hero = place(h('div', { class: 'battle-hero', html: crop(characters[avatar](), '20 10 260 330') }), 160, 300, 260, 330);
    this.battle.append(vold, hero);
    sfx.ominous();
    await Promise.all([
      sm(vold, 0.7, { startAt: { opacity: 0, x: 80 }, opacity: 1, x: 0, ease: 'power2.out' }),
      sm(hero, 0.7, { startAt: { opacity: 0, x: -80 }, opacity: 1, x: 0, ease: 'power2.out' }),
    ]);
    await this.sleep(500);

    // …Expelliarmus!
    const beam = place(h('div', { class: 'beam' }), 400, 330, 0, 14);
    this.battle.append(beam);
    sfx.shield();
    await sm(beam, 0.35, { width: 520, ease: 'power1.in' });
    sfx.sparkle();
    const wand = vold.querySelector('[data-part="wand"]');
    if (wand) gsap.to(wand, { x: 260, y: -360, rotation: 720, duration: 1.2, ease: 'power2.out' });
    await sm(beam, 0.3, { opacity: 0 });
    await this.sleep(400);
    // He vanishes in a puff of smoke.
    const smoke = place(h('div', { class: 'smoke', html: smokePuff() }), 740, 160, 300, 300);
    this.battle.append(smoke);
    sfx.whoosh();
    void sm(smoke, 1.2, { startAt: { scale: 0.3, opacity: 1 }, scale: 1.4, opacity: 0, ease: 'power1.out' });
    await sm(vold, 0.5, { opacity: 0, scale: 0.6 });

    this.fireworks();
    sfx.fanfare();
    await voice.say(PHRASES.battleWin);
    await this.sleep(2200);
  }

  private fireworks(): void {
    const colors = [C.gold, C.red, C.sky, C.goldLight, C.green];
    for (let b = 0; b < 6; b++) {
      const cx = 200 + Math.random() * 780;
      const cy = 90 + Math.random() * 220;
      this.later(b * 420, () => {
        sfx.sparkle();
        for (let k = 0; k < 16; k++) {
          const p = place(h('div', { class: 'spark' }), cx, cy, 10, 10);
          p.style.background = colors[(b + k) % colors.length];
          this.battle.append(p);
          const a = (k / 16) * Math.PI * 2;
          gsap.to(p, {
            x: Math.cos(a) * 120,
            y: Math.sin(a) * 120 + 40,
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

function smokePuff(): string {
  return svg({ w: 300, h: 300, name: 'smoke', boil: false }, [
    piece(ellipse(150, 160, 120, 90), C.stoneLight, { rough: 2 }),
    piece(ellipse(100, 120, 70, 60), C.stone, { rough: 2 }),
    piece(ellipse(200, 120, 70, 60), C.stoneLight, { rough: 2 }),
  ]);
}
