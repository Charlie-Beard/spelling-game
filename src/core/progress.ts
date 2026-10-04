/**
 * Saved progress, adaptive difficulty and spaced review.
 *
 * Each player's progress is kept on the device and synced to the cloud
 * (see cloud/profile.ts).
 */
import { ALL_CHAPTERS, type Avatar, type Chapter } from './curriculum';
import { DEFAULT_NAME } from './phrases';
import type { RoundResult } from './round';

export interface Settings {
  /** Master volume 0..1. */
  volume: number;
  /** Calm mode: no boil, minimal motion. Defaults to the iPad setting. */
  calm: boolean;
  /** Suggest a break after this many chapters (0 = never). */
  breakAfter: number;
  /** Seconds of no activity before Hedwig gently repeats the word. */
  idleHintSeconds: number;
}

export interface WordStat {
  seen: number;
  perfect: number;
  mistakes: number;
  helped: number;
}

export interface ChapterRecord {
  plays: number;
  /** Completed at least once. */
  done: boolean;
}

export interface Progress {
  v: 1;
  name: string;
  avatar: Avatar | null;
  chapters: Record<string, ChapterRecord>;
  cards: string[];
  horcruxes: string[];
  gems: number;
  /** 0..3: roughly the number of extra (distractor) tiles. */
  difficulty: number;
  /** Words to bring back for another go. */
  review: string[];
  words: Record<string, WordStat>;
  /** Grown-up unlocked every chapter. */
  unlockAll: boolean;
  /** Grown-up unlocked every chapter up to this index in ALL_CHAPTERS (-1: none). */
  unlockedTo: number;
  /** Parent's custom word list (e.g. weekly school spellings). */
  custom: string[];
  chaptersSinceBreak: number;
  /** When a chapter was last finished (ms since epoch). */
  lastPlayed: number;
  settings: Settings;
}

export const MAX_DIFFICULTY = 3;
const BREAK_RESET_MS = 20 * 60 * 1000;

export function defaultProgress(prefersReducedMotion = false, name = DEFAULT_NAME): Progress {
  return {
    v: 1,
    name,
    avatar: null,
    chapters: {},
    cards: [],
    horcruxes: [],
    gems: 0,
    difficulty: 0,
    review: [],
    words: {},
    unlockAll: false,
    unlockedTo: -1,
    custom: [],
    chaptersSinceBreak: 0,
    lastPlayed: 0,
    settings: {
      volume: 0.8,
      calm: prefersReducedMotion,
      breakAfter: 3,
      idleHintSeconds: 12,
    },
  };
}

/** Adjusts difficulty after a chapter: gently up when easy, down when hard. */
export function adapt(difficulty: number, results: RoundResult[]): number {
  if (!results.length) return difficulty;
  const mistakesPerWord = results.reduce((s, r) => s + r.mistakes, 0) / results.length;
  const helped = results.reduce((s, r) => s + r.helped, 0);
  if (helped === 0 && mistakesPerWord <= 0.25) return Math.min(MAX_DIFFICULTY, difficulty + 0.5);
  if (helped >= 2 || mistakesPerWord >= 1.5) return Math.max(0, difficulty - 1);
  return difficulty;
}

/**
 * Number of extra tiles for a word. The first chapter of each new book is
 * one step easier, because it brings new sounds.
 */
export function distractorCount(difficulty: number, units: number, firstOfBook: boolean): number {
  const d = Math.floor(difficulty) - (firstOfBook ? 1 : 0);
  return Math.max(0, Math.min(d, 3, 7 - units));
}

/** Chapter index the child is up to (the first not yet done). */
export function currentIndex(p: Progress): number {
  const i = ALL_CHAPTERS.findIndex((c) => !p.chapters[c.id]?.done);
  return i === -1 ? ALL_CHAPTERS.length - 1 : i;
}

export function isUnlocked(p: Progress, chapter: Chapter): boolean {
  if (p.unlockAll) return true;
  const i = ALL_CHAPTERS.indexOf(chapter);
  return i <= Math.max(currentIndex(p), p.unlockedTo) || !!p.chapters[chapter.id]?.done;
}

/** Grown-up control: every chapter up to and including `index` can be played. */
export function unlockTo(p: Progress, index: number): void {
  p.unlockedTo = Math.max(p.unlockedTo, index);
}

/**
 * Grown-up control: locks every chapter after `index` again, so the next one
 * to play is no further on than `index + 1`. Cards and Horcruxes already
 * won are kept; the chapters just count as not done.
 */
export function relockAfter(p: Progress, index: number): void {
  p.unlockAll = false;
  p.unlockedTo = Math.min(p.unlockedTo, index);
  for (const c of ALL_CHAPTERS.slice(index + 1)) {
    const rec = p.chapters[c.id];
    if (rec) rec.done = false;
  }
}

/** Records one chapter's results. Returns what was newly earned. */
export function recordChapter(
  p: Progress,
  chapter: Chapter,
  results: RoundResult[],
): { newReward: boolean; gems: number } {
  const rec = (p.chapters[chapter.id] ??= { plays: 0, done: false });
  rec.plays++;
  rec.done = true;

  for (const r of results) {
    const s = (p.words[r.word] ??= { seen: 0, perfect: 0, mistakes: 0, helped: 0 });
    s.seen++;
    s.mistakes += r.mistakes;
    s.helped += r.helped;
    if (r.perfect) {
      s.perfect++;
      p.review = p.review.filter((w) => w !== r.word);
    } else if (r.helped > 0 || r.mistakes >= 2) {
      if (!p.review.includes(r.word)) p.review.push(r.word);
    }
  }
  p.review = p.review.slice(-8);

  let newReward = false;
  if (chapter.kind === 'card' && !p.cards.includes(chapter.reward)) {
    p.cards.push(chapter.reward);
    newReward = true;
  } else if (chapter.kind === 'horcrux' && !p.horcruxes.includes(chapter.reward)) {
    p.horcruxes.push(chapter.reward);
    newReward = true;
  } else if (chapter.kind === 'battle' && rec.plays === 1) {
    newReward = true;
  }

  const gems = results.length;
  p.gems += gems;
  p.difficulty = adapt(p.difficulty, results);
  p.chaptersSinceBreak++;
  p.lastPlayed = Date.now();
  return { newReward, gems };
}

/** Chooses one earlier word to revisit at the start of a chapter. */
export function pickReview(p: Progress, chapter: Chapter): string | undefined {
  const inChapter = new Set(chapter.words.map((w) => w.text));
  return p.review.find((w) => !inChapter.has(w));
}

// ---------------------------------------------------------------------------
// Saved copies
// ---------------------------------------------------------------------------

/**
 * Reads a saved copy (from this device or the cloud), filling in anything
 * missing from `fresh`. Anything unreadable gives `fresh`.
 */
export function restore(data: unknown, fresh: Progress): Progress {
  if (!data || typeof data !== 'object' || (data as Partial<Progress>).v !== 1) return fresh;
  const d = data as Partial<Progress>;
  return { ...fresh, ...d, settings: { ...fresh.settings, ...d.settings } };
}

/** A new session (20+ minutes since the last chapter) starts the break count afresh. */
export function startSession(p: Progress, now = Date.now()): void {
  if (now - p.lastPlayed > BREAK_RESET_MS) p.chaptersSinceBreak = 0;
}

/** Asks Safari to keep our storage (home-screen apps are never evicted). */
export function requestPersistence(): void {
  void navigator.storage?.persist?.().catch(() => {});
}

/**
 * "Start again": clears what was played (chapters, cards, Horcruxes, gems,
 * word history, character) but keeps the name, settings, word list and the
 * grown-up's level controls, so a demo stays unlocked after a reset.
 */
export function startAgain(p: Progress, fresh: Progress): Progress {
  return {
    ...fresh,
    name: p.name,
    settings: { ...p.settings },
    custom: [...p.custom],
    unlockAll: p.unlockAll,
    unlockedTo: p.unlockedTo,
  };
}
