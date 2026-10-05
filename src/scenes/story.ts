/**
 * A chapter's reward story: a short paper-puppet show between the last word
 * and the reward card. Paper curtains in the book's colour open on the
 * chapter title, the story plays (see src/stories), the curtains close, and
 * one big Next button appears. A small skip button is always there.
 */
import { gsap } from 'gsap';
import { sfx } from '../audio/sfx';
import { voice } from '../audio/voice';
import { C } from '../art/palette';
import { piece, rect, svg } from '../art/paper';
import type { Book, Chapter } from '../core/curriculum';
import { Kit, type Story } from '../stories/kit';
import { STORIES } from '../stories';
import { breathe, sm } from '../ui/anim';
import { banner, sealButton } from '../ui/components';
import { h, place } from '../ui/dom';
import { Scene, type App } from '../ui/scene';

export interface StoryOptions {
  book: Book;
  chapter: Chapter;
  onDone: () => void;
}

/** Whether a chapter has a story to show. */
export const hasStory = (chapterId: string): boolean => chapterId in STORIES;

/** One torn curtain, 640 × 840, with gathered folds. */
function curtain(color: string, side: 'l' | 'r'): string {
  const folds = [0, 1, 2, 3, 4].map((i) =>
    piece(rect(20 + i * 124, -20, 70, 880), 'rgba(0,0,0,0.12)', { edge: 'torn', fibre: false, shadow: false, rough: 2 }),
  );
  return svg({ w: 640, h: 840, name: 'curtain-' + side + color, boil: false }, [
    piece(rect(-10, -20, 660, 880), color, { rough: 2.4 }),
    ...folds,
    piece(rect(-10, -20, 660, 70), C.gold, { edge: 'cut', fibre: false }),
  ]);
}

export class StoryScene extends Scene {
  private o: StoryOptions;
  private stage!: HTMLElement;
  private left!: HTMLElement;
  private right!: HTMLElement;
  private title!: HTMLElement;
  private skip!: HTMLButtonElement;
  private finished = false;
  private story: Promise<Story | null>;

  constructor(app: App, o: StoryOptions) {
    super(app, 'story');
    this.o = o;
    const load = STORIES[o.chapter.id];
    this.story = load ? load().then((m) => m.default, () => null) : Promise.resolve(null);
  }

  build(): void {
    const r = this.root;
    r.style.background = C.night;
    this.stage = h('div', { class: 'story-stage' });
    r.append(this.stage);

    this.left = place(h('div', { class: 'story-curtain', html: curtain(this.o.book.color, 'l') }), -20, -10, 640, 840);
    this.right = place(h('div', { class: 'story-curtain', html: curtain(this.o.book.color, 'r') }), 560, -10, 640, 840);
    this.right.style.transform = 'scaleX(-1)';
    r.append(this.left, this.right);
    this.title = banner(this.o.chapter.title, { x: 290, y: 330, w: 600, h: 120, size: 50 });
    this.title.classList.add('story-title');
    r.append(this.title);

    this.skip = sealButton('next', { x: 1090, y: 14, size: 72, color: C.slate, aria: 'Skip the story', name: 'story-skip' });
    this.tap(this.skip, () => {
      sfx.tap();
      this.done();
    });
    r.append(this.skip);
  }

  async enter(): Promise<void> {
    const story = await this.story;
    if (!this.alive) return;
    if (!story || !Object.keys(story.lines).length) return this.done();

    const kit = new Kit({
      root: this.stage,
      book: this.o.book,
      chapter: this.o.chapter,
      hero: this.app.progress.avatar ?? 'harry',
      name: this.app.progress.name,
      lines: story.lines,
      alive: () => this.alive && !this.finished,
    });
    void voice.preload({ lines: Object.values(story.lines).map((l) => l.text) });

    // Curtain up.
    sfx.fanfare();
    await sm(this.title, 0.4, { startAt: { scale: 0.4, rotation: -6, opacity: 0 }, scale: 1, rotation: 0, opacity: 1, ease: 'back.out(1.8)' });
    await this.sleep(1300);
    sfx.whoosh();
    void sm(this.title, 0.3, { opacity: 0, y: -40 });
    // Start the show just behind the opening curtains.
    const show = story.play(kit);
    await Promise.all([sm(this.left, 0.9, { x: -640, ease: 'power2.inOut' }), sm(this.right, 0.9, { x: 640, ease: 'power2.inOut' })]);

    // A story that never finishes (a script bug) still ends, after 75 s.
    await Promise.race([show, this.sleep(75_000)]);
    if (!this.alive || this.finished) return;
    await this.sleep(600);
    kit.caption('');

    // Curtain down, then one big Next.
    sfx.whoosh();
    await Promise.all([sm(this.left, 0.8, { x: 0, ease: 'power2.inOut' }), sm(this.right, 0.8, { x: 0, ease: 'power2.inOut' })]);
    this.skip.style.display = 'none';
    const next = sealButton('next', { x: 515, y: 335, size: 150, color: C.red, aria: 'Next', name: 'story-next' });
    this.tap(next, () => {
      sfx.tap();
      this.done();
    });
    this.root.append(next);
    void sm(next, 0.35, { startAt: { scale: 0 }, scale: 1, ease: 'back.out(2)' });
    this.onCleanup(breathe(next, 0.06, 1.6));
  }

  leave(): void {
    voice.stop();
  }

  destroy(): void {
    gsap.killTweensOf(this.stage.querySelectorAll('*'));
    super.destroy();
  }

  private done(): void {
    if (this.finished) return;
    this.finished = true;
    voice.stop();
    this.o.onDone();
  }
}
