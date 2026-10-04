/** Chapter intro: the host says hello, then one big Play button. */
import { sfx } from '../audio/sfx';
import { voice } from '../audio/voice';
import { characters } from '../art/characters';
import { C } from '../art/palette';
import { nightSky } from '../art/scenery';
import { parchment } from '../art/ui';
import type { Book, Chapter } from '../core/curriculum';
import { breathe, pop, sm } from '../ui/anim';
import { personalise } from '../core/phrases';
import { banner, sealButton, speech } from '../ui/components';
import { h, place } from '../ui/dom';
import { Scene, type App } from '../ui/scene';

export class IntroScene extends Scene {
  private book: Book;
  private chapter: Chapter;
  private onPlay: () => void;
  private host!: HTMLElement;
  private bubble!: HTMLElement;
  private play!: HTMLButtonElement;
  private started = false;

  constructor(app: App, book: Book, chapter: Chapter, onPlay: () => void) {
    super(app, 'intro');
    this.book = book;
    this.chapter = chapter;
    this.onPlay = onPlay;
  }

  build(): void {
    const r = this.root;
    const c = this.chapter;
    const dark = c.kind !== 'card';
    r.append(h('div', { class: 'backdrop-wrap', html: nightSky('intro-sky-' + c.id) }));
    r.append(place(h('div', { html: parchment(1100, 560, 'intro-stage-' + c.id, dark ? C.slate : C.cream, 1.8) }), 40, 150, 1100, 560));
    r.append(place(h('div', { class: 'intro-tint', style: `background:${this.book.color}` }), 70, 180, 1040, 500));

    r.append(banner(c.title, { x: 290, y: 34, w: 600, h: 100, size: 46 }));
    r.append(place(h('div', { class: 'chapter-kicker', style: dark ? 'color:var(--parchment-300)' : '' }, `Book ${this.book.n} · Chapter ${c.n}`), 0, 196, 1180));

    const portrait = c.kind === 'battle' ? characters.voldemort() : characters[c.host]();
    this.host = place(h('button', { class: 'intro-host', 'aria-label': 'Hear again', html: portrait }), 110, 230, 400, 453);
    this.tap(this.host, () => void this.speak());
    r.append(this.host);

    this.bubble = speech(personalise(c.intro, this.app.progress.name), { x: 520, y: 250, w: 560, h: 220 });
    r.append(this.bubble);

    this.play = sealButton('play', { x: 860, y: 520, size: 170, color: C.red, aria: 'Play', name: 'intro-play' });
    this.tap(this.play, () => this.start());
    r.append(this.play);

    const back = sealButton('map', { x: 30, y: 20, size: 64, color: C.slate, aria: 'Back to the map' });
    this.tap(back, () => {
      sfx.tap();
      voice.stop();
      this.app.nav.map(this.book.n);
    });
    r.append(back);
  }

  async enter(): Promise<void> {
    if (this.chapter.kind !== 'card') sfx.ominous();
    await sm(this.host, 0.5, { startAt: { x: -300, rotation: -10 }, x: 0, rotation: 0, ease: 'back.out(1.3)' });
    void sm(this.bubble, 0.35, { startAt: { scale: 0.3, opacity: 0, transformOrigin: '0% 70%' }, scale: 1, opacity: 1, ease: 'back.out(1.8)' });
    void sm(this.play, 0.4, { startAt: { scale: 0, rotation: -30 }, scale: 1, rotation: 0, delay: 0.3, ease: 'back.out(2)' });
    this.onCleanup(breathe(this.play, 0.06, 1.6));
    await this.speak();
  }

  leave(): void {
    voice.stop();
  }

  private async speak(): Promise<void> {
    void pop(this.host, 1.03);
    await voice.say(this.chapter.intro);
  }

  private start(): void {
    if (this.started) return;
    this.started = true;
    sfx.tap();
    voice.stop();
    this.onPlay();
  }
}
