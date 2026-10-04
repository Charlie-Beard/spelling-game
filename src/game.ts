/**
 * Game flow:
 *
 *   title → (choose character, first time) → map → intro → spell → reward
 *                                             ↑__________________________|
 *
 * plus the collection album, the break screen and the grown-ups' corner.
 */
import { BOOKS, findChapter, type Book, type Chapter } from './core/curriculum';
import type { Word } from './core/phonics';
import { segmentWord } from './core/phonics';
import { currentIndex, pickReview, recordChapter } from './core/progress';
import { ALL_CHAPTERS } from './core/curriculum';
import type { RoundResult } from './core/round';
import { AlbumScene } from './scenes/album';
import { BattleScene } from './scenes/battle';
import { BreakScene } from './scenes/break';
import { ChooseScene } from './scenes/choose';
import { CompleteScene } from './scenes/complete';
import { IntroScene } from './scenes/intro';
import { MapScene } from './scenes/map';
import { ParentScene } from './scenes/parent';
import { SpellScene } from './scenes/spell';
import { TitleScene } from './scenes/title';
import type { App, Nav } from './ui/scene';

const wordIndex = new Map<string, Word>();
for (const c of ALL_CHAPTERS) for (const w of c.words) if (!wordIndex.has(w.text)) wordIndex.set(w.text, w);

/** A pretend chapter for the grown-up's own word list. */
const PRACTICE: Chapter = {
  id: 'practice',
  n: 1,
  title: 'My Words',
  host: 'hedwig',
  intro: 'Let’s practise your words!',
  kind: 'card',
  reward: 'hedwig',
  words: [],
};

export class Game implements Nav {
  private app!: App;

  attach(app: App): void {
    this.app = app;
  }

  title(): void {
    void this.app.go(new TitleScene(this.app));
  }

  choose(): void {
    void this.app.go(new ChooseScene(this.app));
  }

  map(book?: number, justDone?: string): void {
    const n = book ?? this.currentBook().n;
    void this.app.go(new MapScene(this.app, n, justDone));
  }

  album(): void {
    void this.app.go(new AlbumScene(this.app));
  }

  parent(): void {
    void this.app.go(new ParentScene(this.app), 'fade');
  }

  chapter(id: string): void {
    const found = findChapter(id);
    if (!found) return this.map();
    const { book, chapter } = found;
    void this.app.go(new IntroScene(this.app, book, chapter, () => this.spell(book, chapter)));
  }

  practice(): void {
    const words = this.app.progress.custom.map((w) => segmentWord(w)).filter((w): w is Word => !!w);
    if (!words.length) return this.map();
    // Five at a time, starting where we left off last time.
    const start = Math.floor(Math.random() * Math.max(1, words.length - 4));
    const chunk = words.length <= 5 ? words : words.slice(start, start + 5);
    const book = this.currentBook();
    void this.app.go(
      new SpellScene(this.app, {
        book,
        chapter: { ...PRACTICE, words: chunk },
        words: chunk,
        onQuit: () => this.map(),
        onDone: () => {
          this.app.progress.gems += chunk.length;
          this.app.save();
          this.map();
        },
      }),
    );
  }

  private spell(book: Book, chapter: Chapter): void {
    const words = [...chapter.words];
    const review = chapter.kind === 'card' ? pickReview(this.app.progress, chapter) : undefined;
    const reviewWord = review ? wordIndex.get(review) : undefined;
    if (reviewWord) words.unshift(reviewWord);

    const opts = {
      book,
      chapter,
      words,
      onQuit: () => this.map(book.n),
      onDone: (results: RoundResult[]) => this.finish(book, chapter, results),
    };
    void this.app.go(chapter.kind === 'battle' ? new BattleScene(this.app, opts) : new SpellScene(this.app, opts));
  }

  private finish(book: Book, chapter: Chapter, results: RoundResult[]): void {
    const p = this.app.progress;
    const { newReward, gems } = recordChapter(p, chapter, results);
    this.app.save();
    const breakDue = p.settings.breakAfter > 0 && p.chaptersSinceBreak >= p.settings.breakAfter;
    void this.app.go(
      new CompleteScene(this.app, {
        book,
        chapter,
        gems,
        newReward,
        breakDue,
        onNext: () => this.next(chapter),
        onMap: () => this.map(book.n, chapter.id),
        onBreak: () => void this.app.go(new BreakScene(this.app)),
      }),
    );
  }

  /** After a chapter: straight into the next one (it's one tap, no choices). */
  private next(done: Chapter): void {
    const i = ALL_CHAPTERS.indexOf(done);
    const next = ALL_CHAPTERS[i + 1];
    if (!next) return this.map(BOOKS.length, done.id);
    const nextBook = findChapter(next.id)!.book;
    const doneBook = findChapter(done.id)!.book;
    // Entering a new book: show its map page first so the new world is seen.
    if (nextBook !== doneBook) return this.map(nextBook.n);
    this.map(nextBook.n, done.id);
  }

  private currentBook(): Book {
    return findChapter(ALL_CHAPTERS[currentIndex(this.app.progress)].id)!.book;
  }
}
