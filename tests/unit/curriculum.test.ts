import { describe, expect, it } from 'vitest';
import { ALL_CHAPTERS, BOOKS, findChapter } from '../../src/core/curriculum';

describe('curriculum', () => {
  it('has seven books', () => {
    expect(BOOKS.map((b) => b.n)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('starts with the words he already knows', () => {
    expect(BOOKS[0].chapters[0].words.map((w) => w.text)).toEqual(['cat', 'hat', 'mat', 'rat', 'bat']);
  });

  it('keeps chapters short: 5 words (the battle has 8)', () => {
    for (const c of ALL_CHAPTERS) expect(c.words.length).toBe(c.kind === 'battle' ? 8 : 5);
  });

  it('ends books 1-6 with a horcrux and book 7 with the battle', () => {
    const finales = BOOKS.map((b) => b.chapters[b.chapters.length - 1]);
    expect(finales.map((c) => c.reward)).toEqual(['ring', 'diary', 'locket', 'cup', 'diadem', 'nagini', 'victory']);
    expect(finales[6].kind).toBe('battle');
  });

  it('gives every card chapter a unique host card', () => {
    const cards = ALL_CHAPTERS.filter((c) => c.kind === 'card').map((c) => c.reward);
    expect(new Set(cards).size).toBe(cards.length);
  });

  it('never repeats a word within a chapter', () => {
    for (const c of ALL_CHAPTERS) {
      const t = c.words.map((w) => w.text);
      expect(new Set(t).size).toBe(t.length);
    }
  });

  it('fits the tile tray (at most 7 sounds per word)', () => {
    for (const c of ALL_CHAPTERS) for (const w of c.words) expect(w.units.length).toBeLessThanOrEqual(7);
  });

  it('finds chapters by id', () => {
    expect(findChapter('b1c1')?.chapter.title).toBe('Hagrid’s Hut');
    expect(findChapter('b7c4')?.chapter.kind).toBe('battle');
  });
});
