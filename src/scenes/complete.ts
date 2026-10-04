/**
 * Chapter complete: a calm, predictable reward. A Chocolate Frog card
 * flips over (or a Horcrux rises out of the dark), gems are counted, and
 * there is one obvious next step.
 */
import { gsap } from 'gsap';
import { sfx } from '../audio/sfx';
import { voice } from '../audio/voice';
import { characters } from '../art/characters';
import { HORCRUX_NAMES, horcruxArt } from '../art/horcruxes';
import { C } from '../art/palette';
import { nightSky } from '../art/scenery';
import { gem, glowBlob, star } from '../art/ui';
import type { Book, Chapter } from '../core/curriculum';
import { PHRASES } from '../core/phrases';
import { breathe, isCalm, pop, sm, stepped } from '../ui/anim';
import { frogCard, sealButton } from '../ui/components';
import { h, place } from '../ui/dom';
import { Scene, type App } from '../ui/scene';
import { AVATAR_NAMES } from './choose';
import { crop } from './map';

export const HOST_NAMES: Record<string, string> = {
  hagrid: 'Hagrid', ollivander: 'Mr Ollivander', trevor: 'Trevor', nick: 'Nearly Headless Nick', voldemort: 'Voldemort',
  dobby: 'Dobby', gnome: 'Garden Gnome', willow: 'Whomping Willow', fawkes: 'Fawkes', basilisk: 'The Basilisk',
  crookshanks: 'Crookshanks', lupin: 'Professor Lupin', buckbeak: 'Buckbeak', wormtail: 'Wormtail', moody: 'Mad-Eye Moody',
  horntail: 'Horntail', myrtle: 'Moaning Myrtle', bellatrix: 'Bellatrix', sirius: 'Sirius Black', luna: 'Luna Lovegood',
  neville: 'Neville', deatheater: 'Death Eater', slughorn: 'Professor Slughorn', dumbledore: 'Dumbledore', ginny: 'Ginny Weasley',
  nagini: 'Nagini', kreacher: 'Kreacher', griphook: 'Griphook', mcgonagall: 'Professor McGonagall',
  harry: 'Harry Potter', ron: 'Ron Weasley', hermione: 'Hermione Granger', hedwig: 'Hedwig',
};

export interface CompleteOptions {
  book: Book;
  chapter: Chapter;
  gems: number;
  newReward: boolean;
  breakDue: boolean;
  onNext: () => void;
  onMap: () => void;
  onBreak: () => void;
}

export class CompleteScene extends Scene {
  private o: CompleteOptions;
  private reward!: HTMLElement;
  private glow!: HTMLElement;
  private buttons: HTMLElement[] = [];

  constructor(app: App, o: CompleteOptions) {
    super(app, 'complete');
    this.o = o;
  }

  build(): void {
    const r = this.root;
    const c = this.o.chapter;
    r.append(h('div', { class: 'backdrop-wrap', html: nightSky('complete-sky') }));
    r.append(place(h('div', { class: 'big-title', style: 'font-size:72px' }, 'Well done!'), 0, 36));

    this.glow = place(h('div', { class: 'reward-glow', html: glowBlob() }), 340, 120, 500, 560);
    r.append(this.glow);

    if (c.kind === 'horcrux') {
      this.reward = place(h('div', { class: 'horcrux-reward', html: horcruxArt[c.reward]() }), 440, 170, 300, 300);
      r.append(this.reward);
      r.append(place(h('div', { class: 'reward-name' }, `You found ${HORCRUX_NAMES[c.reward].replace(/^The /, 'the ')}!`), 0, 500, 1180));
    } else if (c.kind === 'battle') {
      const me = this.app.progress.avatar ?? 'harry';
      const card = frogCard(characters[me](), 'Hero of Hogwarts', { w: 290 });
      this.reward = place(h('div', { class: 'card-reward' }), 445, 140, 290, 406);
      this.reward.append(card);
      r.append(this.reward);
    } else {
      const card = frogCard(characters[c.host](), HOST_NAMES[c.host] ?? c.host, { w: 290 });
      this.reward = place(h('div', { class: 'card-reward' }), 445, 140, 290, 406);
      this.reward.append(card);
      r.append(this.reward);
    }

    // The child's character cheering at the side.
    const avatar = this.app.progress.avatar ?? 'harry';
    const me = place(h('div', { class: 'cheer', html: crop(characters[avatar](), '20 10 260 330') }), 70, 400, 260, 330);
    me.setAttribute('aria-label', AVATAR_NAMES[avatar]);
    r.append(me);
    this.onCleanup(breathe(me, 0.03, 1.4));

    // Gems
    const tally = place(h('div', { class: 'gem-tally' }), 860, 450, 260, 80);
    tally.innerHTML = `<div class="g">${gem('tally', C.red)}</div><span>+${this.o.gems}</span>`;
    r.append(tally);

    // Next steps: one big, one small.
    const next = this.o.breakDue
      ? sealButton('tick', { x: 900, y: 600, size: 150, color: C.greenDark, aria: 'Done', name: 'done-btn' })
      : sealButton('next', { x: 900, y: 600, size: 150, color: C.red, aria: 'Next chapter', name: 'next-btn' });
    this.tap(next, () => {
      sfx.tap();
      if (this.o.breakDue) this.o.onBreak();
      else this.o.onNext();
    });
    const map = sealButton('map', { x: 760, y: 650, size: 96, color: C.slate, aria: 'Map', name: 'map-btn' });
    this.tap(map, () => {
      sfx.tap();
      this.o.onMap();
    });
    r.append(next, map);
    this.buttons = [next, map];
    this.buttons.forEach((b) => (b.style.opacity = '0'));
  }

  async enter(): Promise<void> {
    sfx.fanfare();
    void voice.say(PHRASES.chapterDone);
    this.confetti();
    const c = this.o.chapter;

    if (c.kind === 'horcrux') {
      gsap.set(this.reward, { scale: 0.2, opacity: 0, y: 120 });
      await this.sleep(900);
      sfx.ominous();
      await sm(this.reward, 1.2, { scale: 1, opacity: 1, y: 0, rotation: 360, ease: 'power2.out' });
      sfx.reveal();
    } else {
      gsap.set(this.reward, { rotationY: 180, scale: 0.6, opacity: 0 });
      await this.sleep(700);
      sfx.whoosh();
      await sm(this.reward, 0.9, { rotationY: 0, scale: 1, opacity: 1, ease: 'back.out(1.4)' });
      sfx.reveal();
    }
    void pop(this.reward, 1.06);
    this.onCleanup(breathe(this.glow, 0.06, 2.2));
    await this.sleep(400);
    if (this.o.newReward) await voice.say(c.kind === 'horcrux' ? PHRASES.newHorcrux : PHRASES.newCard);
    sfx.gem();
    for (const b of this.buttons) void sm(b, 0.35, { startAt: { scale: 0 }, opacity: 1, scale: 1, ease: 'back.out(2)' });
    if (!this.o.breakDue) this.onCleanup(breathe(this.buttons[0], 0.06, 1.6));
    if (this.o.breakDue) {
      await this.sleep(600);
      void voice.say(PHRASES.breakTime);
    }
  }

  private confetti(): void {
    if (isCalm()) return;
    for (let k = 0; k < 26; k++) {
      const p = place(h('div', { class: 'particle', html: star(true, `c${k % 3}`) }), 590 + (Math.random() - 0.5) * 300, -30);
      this.root.append(p);
      gsap.to(p, {
        y: 700 + Math.random() * 200,
        x: (Math.random() - 0.5) * 900,
        rotation: Math.random() * 720,
        duration: 2.4 + Math.random(),
        delay: Math.random() * 0.6,
        ease: stepped(3, 'power1.in'),
        onComplete: () => p.remove(),
      });
    }
  }
}
