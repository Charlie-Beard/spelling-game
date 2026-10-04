/**
 * One word being spelt. Pure game logic, no DOM.
 *
 * Slots fill strictly left to right. Only the right tile is accepted, so
 * the child can never build a wrong word: a wrong tile simply floats back
 * and the help steps up.
 *
 *   1st wrong try on a slot → replay that slot's sound
 *   2nd wrong try           → the right tile glows, one wrong tile leaves
 *   3rd wrong try           → Hedwig places the tile for him
 */
import { CONFUSABLE, type Unit, type Word } from './phonics';

export interface Tile {
  id: number;
  g: string;
  ph: string;
  /** In the tray, placed in a slot, or removed as a distractor. */
  state: 'tray' | 'placed' | 'gone';
  distractor: boolean;
}

export type HintLevel = 0 | 1 | 2 | 3;

export type TapResult =
  | { kind: 'placed'; tile: Tile; slot: number; complete: boolean; byHelper: boolean }
  | { kind: 'wrong'; tile: Tile; slot: number; hint: HintLevel; removed: Tile | null }
  | { kind: 'ignored' };

export interface RoundResult {
  word: string;
  mistakes: number;
  helped: number;
  perfect: boolean;
}

export function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Picks distractor graphemes from a pool, never ones in the word. Early on
 * (gentle = true) letters that look or sound alike (b/d, m/n, c/k) are
 * avoided so a mistake is a phonics mistake, not a reversal.
 */
export function pickDistractors(
  word: Word,
  pool: string[],
  count: number,
  rand: () => number,
  gentle = true,
): string[] {
  if (count <= 0) return [];
  const inWord = new Set(word.units.map((u) => u.g));
  const confusing = new Set<string>();
  if (gentle) {
    for (const u of word.units) for (const c of CONFUSABLE[u.g] ?? []) confusing.add(c);
  }
  const candidates = shuffle(
    [...new Set(pool)].filter((g) => !inWord.has(g)),
    rand,
  );
  const preferred = candidates.filter((g) => !confusing.has(g));
  const rest = candidates.filter((g) => confusing.has(g));
  return [...preferred, ...rest].slice(0, count);
}

export class Round {
  readonly word: Word;
  readonly tiles: Tile[];
  /** Tile id in each slot, or null. */
  readonly slots: (number | null)[];
  next = 0;
  mistakes = 0;
  helped = 0;
  wrongOnSlot = 0;
  /** Tile currently glowing as a hint, if any. */
  glowing: number | null = null;

  constructor(word: Word, distractors: string[], rand: () => number) {
    this.word = word;
    const unitTiles: Tile[] = word.units.map((u, i) => ({
      id: i,
      g: u.g,
      ph: u.ph,
      state: 'tray',
      distractor: false,
    }));
    const extra: Tile[] = distractors.map((g, i) => ({
      id: word.units.length + i,
      g,
      ph: g,
      state: 'tray',
      distractor: true,
    }));
    this.tiles = shuffle([...unitTiles, ...extra], rand);
    // Never present the tiles already in the right order.
    const unitPos = this.tiles.map((t, i) => (t.distractor ? -1 : i)).filter((i) => i >= 0);
    const inOrder = unitPos.map((p) => this.tiles[p].g).join('') === word.units.map((u) => u.g).join('');
    if (inOrder) {
      // Swap the first two unit tiles that show different letters.
      const a = unitPos[0];
      const b = unitPos.find((p) => this.tiles[p].g !== this.tiles[a].g);
      if (b !== undefined) [this.tiles[a], this.tiles[b]] = [this.tiles[b], this.tiles[a]];
    }
    this.slots = word.units.map(() => null);
  }

  get complete(): boolean {
    return this.next >= this.word.units.length;
  }

  get target(): Unit | undefined {
    return this.word.units[this.next];
  }

  tile(id: number): Tile {
    const t = this.tiles.find((x) => x.id === id);
    if (!t) throw new Error(`No tile ${id}`);
    return t;
  }

  /** The tray tile that fits the current slot. */
  rightTile(): Tile | undefined {
    const target = this.target;
    if (!target) return undefined;
    return this.tiles.find((t) => t.state === 'tray' && t.g === target.g);
  }

  tap(id: number): TapResult {
    if (this.complete) return { kind: 'ignored' };
    const tile = this.tile(id);
    if (tile.state !== 'tray') return { kind: 'ignored' };

    if (tile.g === this.target!.g) return this.place(tile, false);

    this.mistakes++;
    this.wrongOnSlot++;
    const hint = Math.min(3, this.wrongOnSlot) as HintLevel;
    let removed: Tile | null = null;
    if (hint === 2) {
      this.glowing = this.rightTile()?.id ?? null;
      removed = this.removeDistractor(tile.id);
    }
    return { kind: 'wrong', tile, slot: this.next, hint, removed };
  }

  /**
   * The child asked Hedwig for help (or a 3rd mistake happened):
   * first a glow, then Hedwig places the tile.
   */
  askHelp(): { level: 2; glow: Tile; removed: Tile | null } | { level: 3; result: TapResult } | null {
    if (this.complete) return null;
    const right = this.rightTile();
    if (!right) return null;
    if (this.glowing !== right.id) {
      this.glowing = right.id;
      this.wrongOnSlot = Math.max(this.wrongOnSlot, 2);
      return { level: 2, glow: right, removed: this.removeDistractor() };
    }
    return { level: 3, result: this.helperPlace() };
  }

  /** Hedwig places the right tile. */
  helperPlace(): TapResult {
    const right = this.rightTile();
    if (!right) return { kind: 'ignored' };
    this.helped++;
    return this.place(right, true);
  }

  result(): RoundResult {
    return {
      word: this.word.text,
      mistakes: this.mistakes,
      helped: this.helped,
      perfect: this.mistakes === 0 && this.helped === 0,
    };
  }

  private place(tile: Tile, byHelper: boolean): TapResult {
    const slot = this.next;
    tile.state = 'placed';
    this.slots[slot] = tile.id;
    this.next++;
    this.wrongOnSlot = 0;
    this.glowing = null;
    return { kind: 'placed', tile, slot, complete: this.complete, byHelper };
  }

  private removeDistractor(prefer?: number): Tile | null {
    const tray = this.tiles.filter((t) => t.state === 'tray' && t.distractor);
    if (!tray.length) return null;
    const t = tray.find((x) => x.id === prefer) ?? tray[0];
    t.state = 'gone';
    return t;
  }
}
