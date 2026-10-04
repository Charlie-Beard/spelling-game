/**
 * Saved progress, adaptive difficulty and spaced review.
 *
 * Everything lives in localStorage on the iPad. The child's name is only
 * ever stored here, never in the repository.
 */
import { ALL_CHAPTERS, type Avatar, type Chapter } from './curriculum';
import type { RoundResult } from './round';

export interface Settings {
  /** Master volume 0..1. */
  volume: number;
  /** Background music (off by default — less to filter out). */
  music: boolean;
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
  /** Parent unlocked every chapter. */
  unlockAll: boolean;
  /** Parent's custom word list (e.g. weekly school spellings). */
  custom: string[];
  chaptersSinceBreak: number;
  settings: Settings;
}

export const MAX_DIFFICULTY = 3;
const KEY = 'wizard-words:v1';

export function defaultProgress(prefersReducedMotion = false): Progress {
  return {
    v: 1,
    name: '',
    avatar: null,
    chapters: {},
    cards: [],
    horcruxes: [],
    gems: 0,
    difficulty: 0,
    review: [],
    words: {},
    unlockAll: false,
    custom: [],
    chaptersSinceBreak: 0,
    settings: {
      volume: 0.8,
      music: false,
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
  return i <= currentIndex(p) || !!p.chapters[chapter.id]?.done;
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
  return { newReward, gems };
}

/** Chooses one earlier word to revisit at the start of a chapter. */
export function pickReview(p: Progress, chapter: Chapter): string | undefined {
  const inChapter = new Set(chapter.words.map((w) => w.text));
  return p.review.find((w) => !inChapter.has(w));
}

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------

export function load(): Progress {
  const reduce =
    typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fresh = defaultProgress(reduce);
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fresh;
    const data = JSON.parse(raw) as Partial<Progress>;
    if (data.v !== 1) return fresh;
    return { ...fresh, ...data, settings: { ...fresh.settings, ...data.settings } };
  } catch {
    return fresh;
  }
}

export function save(p: Progress): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* storage full or blocked: progress just won't persist */
  }
}

export function reset(): Progress {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  return load();
}

/** Asks Safari to keep our storage (home-screen apps are never evicted). */
export function requestPersistence(): void {
  void navigator.storage?.persist?.().catch(() => {});
}
