/**
 * Merging two copies of the same player's progress.
 *
 * A device keeps the copy it last agreed with the cloud (`base`). When its
 * own copy (`local`) and the cloud's (`remote`) have both moved on since —
 * say Jasper played offline while a grown-up changed his word list on a
 * phone — each side's changes are kept:
 *
 *   - counts (gems, plays, word stats) add up both sides' gains
 *   - collections (cards, Horcruxes) keep what either side won, and drop
 *     what one side removed (a reset)
 *   - everything else (name, settings, word list…) takes whichever side
 *     changed it, and this device's change if both did
 */
import type { ChapterRecord, Progress, Settings, WordStat } from './progress';

/** JSON with object keys sorted, so equal data always gives the same text. */
export function canonical(v: unknown): string {
  return JSON.stringify(v, (_k, x: unknown) =>
    x && typeof x === 'object' && !Array.isArray(x) ? Object.fromEntries(Object.entries(x).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) : x,
  );
}

export const same = (a: unknown, b: unknown): boolean => canonical(a) === canonical(b);

/** Whichever side changed the value; this device's if both did. */
const pick = <T>(base: T, local: T, remote: T): T => (same(local, base) ? remote : local);

/** Adds this device's gain (or loss, after a reset) on top of the cloud's value. */
const add = (base: number, local: number, remote: number): number => Math.max(0, remote + local - base);

/** The cloud's set, plus what this device added, minus what this device removed. */
function union(base: string[], local: string[], remote: string[]): string[] {
  const removed = base.filter((x) => !local.includes(x));
  const added = local.filter((x) => !base.includes(x));
  const out = remote.filter((x) => !removed.includes(x));
  for (const x of added) if (!out.includes(x)) out.push(x);
  return out;
}

function keys(...objs: object[]): string[] {
  return [...new Set(objs.flatMap((o) => Object.keys(o)))];
}

const NO_CHAPTER: ChapterRecord = { plays: 0, done: false };
const NO_STAT: WordStat = { seen: 0, perfect: 0, mistakes: 0, helped: 0 };

export function mergeProgress(base: Progress, local: Progress, remote: Progress): Progress {
  const chapters: Record<string, ChapterRecord> = {};
  for (const id of keys(base.chapters, local.chapters, remote.chapters)) {
    const [b, l, r] = [base, local, remote].map((p) => p.chapters[id] ?? NO_CHAPTER);
    const rec = { plays: add(b.plays, l.plays, r.plays), done: pick(b.done, l.done, r.done) };
    if (rec.plays || rec.done) chapters[id] = rec;
  }

  const words: Record<string, WordStat> = {};
  for (const w of keys(base.words, local.words, remote.words)) {
    const [b, l, r] = [base, local, remote].map((p) => p.words[w] ?? NO_STAT);
    const stat: WordStat = {
      seen: add(b.seen, l.seen, r.seen),
      perfect: add(b.perfect, l.perfect, r.perfect),
      mistakes: add(b.mistakes, l.mistakes, r.mistakes),
      helped: add(b.helped, l.helped, r.helped),
    };
    if (stat.seen) words[w] = stat;
  }

  const settings = {} as Settings;
  for (const k of keys(base.settings, local.settings, remote.settings) as (keyof Settings)[]) {
    (settings as unknown as Record<string, unknown>)[k] = pick(base.settings[k], local.settings[k], remote.settings[k]);
  }

  return {
    v: 1,
    name: pick(base.name, local.name, remote.name),
    avatar: pick(base.avatar, local.avatar, remote.avatar),
    chapters,
    cards: union(base.cards, local.cards, remote.cards),
    horcruxes: union(base.horcruxes, local.horcruxes, remote.horcruxes),
    gems: add(base.gems, local.gems, remote.gems),
    difficulty: pick(base.difficulty, local.difficulty, remote.difficulty),
    review: pick(base.review, local.review, remote.review),
    words,
    unlockAll: pick(base.unlockAll, local.unlockAll, remote.unlockAll),
    custom: pick(base.custom, local.custom, remote.custom),
    chaptersSinceBreak: pick(base.chaptersSinceBreak, local.chaptersSinceBreak, remote.chaptersSinceBreak),
    lastPlayed: Math.max(local.lastPlayed, remote.lastPlayed),
    settings,
  };
}
