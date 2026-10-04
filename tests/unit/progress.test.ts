import { describe, expect, it } from 'vitest';
import { ALL_CHAPTERS } from '../../src/core/curriculum';
import {
  adapt,
  currentIndex,
  defaultProgress,
  distractorCount,
  isUnlocked,
  pickReview,
  recordChapter,
} from '../../src/core/progress';
import type { RoundResult } from '../../src/core/round';

const res = (word: string, mistakes = 0, helped = 0): RoundResult => ({
  word,
  mistakes,
  helped,
  perfect: mistakes === 0 && helped === 0,
});

describe('adapt', () => {
  it('goes up gently after an easy chapter', () => {
    expect(adapt(0, [res('a'), res('b'), res('c'), res('d'), res('e')])).toBe(0.5);
  });
  it('goes down after a hard chapter', () => {
    expect(adapt(2, [res('a', 3, 1), res('b', 3, 1), res('c')])).toBe(1);
  });
  it('stays put for a normal chapter', () => {
    expect(adapt(1, [res('a', 1), res('b'), res('c', 1)])).toBe(1);
  });
  it('is clamped', () => {
    expect(adapt(3, [res('a')])).toBe(3);
    expect(adapt(0, [res('a', 5, 2)])).toBe(0);
  });
});

describe('distractorCount', () => {
  it('starts with no extra tiles', () => {
    expect(distractorCount(0, 3, false)).toBe(0);
  });
  it('is one easier at the start of a book', () => {
    expect(distractorCount(2, 3, true)).toBe(1);
  });
  it('never overflows the tray', () => {
    expect(distractorCount(3, 6, false)).toBe(1);
  });
});

describe('recordChapter', () => {
  it('unlocks the next chapter, awards the card and gems', () => {
    const p = defaultProgress();
    const c = ALL_CHAPTERS[0];
    expect(isUnlocked(p, ALL_CHAPTERS[1])).toBe(false);
    const out = recordChapter(p, c, c.words.map((w) => res(w.text)));
    expect(out).toEqual({ newReward: true, gems: 5 });
    expect(p.cards).toEqual(['hagrid']);
    expect(currentIndex(p)).toBe(1);
    expect(isUnlocked(p, ALL_CHAPTERS[1])).toBe(true);
    expect(recordChapter(p, c, []).newReward).toBe(false);
  });

  it('awards horcruxes from finales', () => {
    const p = defaultProgress();
    const finale = ALL_CHAPTERS.find((c) => c.reward === 'ring')!;
    recordChapter(p, finale, []);
    expect(p.horcruxes).toEqual(['ring']);
  });

  it('queues tricky words for review and clears them when perfect', () => {
    const p = defaultProgress();
    recordChapter(p, ALL_CHAPTERS[0], [res('cat', 3, 1), res('hat')]);
    expect(p.review).toEqual(['cat']);
    expect(pickReview(p, ALL_CHAPTERS[1])).toBe('cat');
    expect(pickReview(p, ALL_CHAPTERS[0])).toBeUndefined();
    recordChapter(p, ALL_CHAPTERS[1], [res('cat')]);
    expect(p.review).toEqual([]);
  });
});
