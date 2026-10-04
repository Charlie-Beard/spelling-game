import { describe, expect, it } from 'vitest';
import { ALL_CHAPTERS } from '../../src/core/curriculum';
import { canonical, mergeProgress } from '../../src/core/merge';
import { defaultProgress, recordChapter, type Progress } from '../../src/core/progress';
import type { RoundResult } from '../../src/core/round';

const play = (p: Progress, chapterIndex: number, mistakes = 0): Progress => {
  const c = ALL_CHAPTERS[chapterIndex];
  const results: RoundResult[] = c.words.map((w) => ({ word: w.text, mistakes, helped: 0, perfect: mistakes === 0 }));
  recordChapter(p, c, results);
  return p;
};
const copy = (p: Progress): Progress => structuredClone(p);

describe('mergeProgress', () => {
  it('changes nothing when neither side changed', () => {
    const base = play(defaultProgress(), 0);
    expect(canonical(mergeProgress(base, copy(base), copy(base)))).toBe(canonical(base));
  });

  it('takes the only side that changed', () => {
    const base = play(defaultProgress(), 0);
    const local = play(copy(base), 1);
    expect(canonical(mergeProgress(base, local, copy(base)))).toBe(canonical(local));
    const remote = copy(base);
    remote.custom = ['dog', 'frog'];
    expect(mergeProgress(base, copy(base), remote).custom).toEqual(['dog', 'frog']);
  });

  it('keeps play on this device and a grown-up’s edits made elsewhere', () => {
    const base = play(defaultProgress(), 0);
    const local = play(copy(base), 1); // Jasper plays chapter 2 offline
    const remote = copy(base);
    remote.custom = ['ship', 'shop']; // a grown-up sets his words on a phone
    remote.settings.idleHintSeconds = 20;

    const m = mergeProgress(base, local, remote);
    expect(m.chapters[ALL_CHAPTERS[1].id]).toEqual({ plays: 1, done: true });
    expect(m.cards).toEqual(local.cards);
    expect(m.gems).toBe(local.gems);
    expect(m.custom).toEqual(['ship', 'shop']);
    expect(m.settings.idleHintSeconds).toBe(20);
    expect(m.settings.volume).toBe(base.settings.volume);
  });

  it('adds up play from both sides', () => {
    const base = play(defaultProgress(), 0);
    const local = play(copy(base), 1);
    const remote = play(copy(base), 2);
    remote.chapters[ALL_CHAPTERS[0].id].plays++;

    const m = mergeProgress(base, local, remote);
    expect(m.gems).toBe(base.gems + (local.gems - base.gems) + (remote.gems - base.gems));
    expect(m.chapters[ALL_CHAPTERS[0].id].plays).toBe(2);
    expect(m.chapters[ALL_CHAPTERS[1].id].done).toBe(true);
    expect(m.chapters[ALL_CHAPTERS[2].id].done).toBe(true);
    expect(new Set(m.cards)).toEqual(new Set([...local.cards, ...remote.cards]));
    const word = ALL_CHAPTERS[0].words[0].text;
    expect(m.words[word].seen).toBe(1);
  });

  it('adds word stats from both sides', () => {
    const base = play(defaultProgress(), 0);
    const local = play(copy(base), 0, 1);
    const remote = play(copy(base), 0, 2);
    const word = ALL_CHAPTERS[0].words[0].text;
    const m = mergeProgress(base, local, remote);
    expect(m.words[word]).toEqual({ seen: 3, perfect: 1, mistakes: 3, helped: 0 });
  });

  it('lets a reset on this device win over unchanged progress elsewhere', () => {
    const base = play(play(defaultProgress(), 0), 1);
    const local = defaultProgress(); // "Start again"
    const m = mergeProgress(base, local, copy(base));
    expect(m.cards).toEqual([]);
    expect(m.gems).toBe(0);
    expect(m.chapters).toEqual({});
    expect(m.words).toEqual({});
  });

  it('prefers this device when both changed the same setting', () => {
    const base = defaultProgress();
    const local = copy(base);
    local.settings.volume = 0.3;
    const remote = copy(base);
    remote.settings.volume = 0.6;
    remote.settings.calm = true;
    const m = mergeProgress(base, local, remote);
    expect(m.settings.volume).toBe(0.3);
    expect(m.settings.calm).toBe(true);
  });

  it('joins two separate histories against an empty base', () => {
    // e.g. progress saved on an iPad before sign-in existed, meeting the cloud copy.
    const empty = defaultProgress();
    const local = play(defaultProgress(), 0);
    const remote = play(defaultProgress(), 0);
    const m = mergeProgress(empty, local, remote);
    expect(m.chapters[ALL_CHAPTERS[0].id].plays).toBe(2);
    expect(m.cards).toEqual(local.cards);
    expect(m.gems).toBe(local.gems + remote.gems);
    expect(m.lastPlayed).toBe(Math.max(local.lastPlayed, remote.lastPlayed));
  });
});
