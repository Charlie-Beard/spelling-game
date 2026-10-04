import { describe, expect, it } from 'vitest';
import { makeWord } from '../../src/core/phonics';
import { pickDistractors, Round } from '../../src/core/round';
import { rng } from '../../src/art/paper';

const cat = makeWord('cat');
const byG = (r: Round, g: string) => r.tiles.find((t) => t.g === g && t.state === 'tray')!;

describe('Round', () => {
  it('accepts the right tiles in order and completes', () => {
    const r = new Round(cat, [], rng(1));
    expect(r.tap(byG(r, 'c').id)).toMatchObject({ kind: 'placed', slot: 0, complete: false });
    expect(r.tap(byG(r, 'a').id)).toMatchObject({ kind: 'placed', slot: 1 });
    expect(r.tap(byG(r, 't').id)).toMatchObject({ kind: 'placed', slot: 2, complete: true });
    expect(r.result()).toEqual({ word: 'cat', mistakes: 0, helped: 0, perfect: true });
  });

  it('never presents the tiles already in order', () => {
    for (let s = 1; s < 50; s++) {
      const r = new Round(cat, [], rng(s));
      expect(r.tiles.map((t) => t.g).join('')).not.toBe('cat');
    }
  });

  it('steps up the help on repeated wrong tries', () => {
    const r = new Round(cat, ['m', 's'], rng(2));
    const m = byG(r, 'm');
    const first = r.tap(m.id);
    expect(first).toMatchObject({ kind: 'wrong', hint: 1, slot: 0 });
    const second = r.tap(m.id);
    expect(second).toMatchObject({ kind: 'wrong', hint: 2 });
    expect(r.glowing).toBe(byG(r, 'c').id);
    // the tapped wrong tile is the one removed
    expect(second.kind === 'wrong' && second.removed?.g).toBe('m');
    const third = r.tap(byG(r, 's').id);
    expect(third).toMatchObject({ kind: 'wrong', hint: 3 });
    expect(r.helperPlace()).toMatchObject({ kind: 'placed', slot: 0, byHelper: true });
    expect(r.wrongOnSlot).toBe(0);
    expect(r.result()).toMatchObject({ mistakes: 3, helped: 1, perfect: false });
  });

  it('asking for help glows first, then places', () => {
    const r = new Round(cat, ['m'], rng(3));
    const a = r.askHelp();
    expect(a).toMatchObject({ level: 2 });
    expect(r.tiles.find((t) => t.g === 'm')!.state).toBe('gone');
    const b = r.askHelp();
    expect(b).toMatchObject({ level: 3 });
    expect(r.next).toBe(1);
  });

  it('handles repeated letters and split digraphs', () => {
    const r = new Round(makeWord('cake', 'c a-e k'), [], rng(4));
    for (const g of ['c', 'a', 'k', 'e']) expect(r.tap(byG(r, g).id).kind).toBe('placed');
    expect(r.complete).toBe(true);
    const p = new Round(makeWord('pop'), [], rng(5));
    for (const g of ['p', 'o', 'p']) expect(p.tap(byG(p, g).id).kind).toBe('placed');
  });

  it('ignores taps on placed tiles', () => {
    const r = new Round(cat, [], rng(6));
    const c = byG(r, 'c');
    r.tap(c.id);
    expect(r.tap(c.id)).toEqual({ kind: 'ignored' });
  });
});

describe('pickDistractors', () => {
  it('never picks letters in the word, and avoids confusable ones when gentle', () => {
    const word = makeWord('bat');
    for (let s = 1; s < 30; s++) {
      const d = pickDistractors(word, ['b', 'd', 'p', 's', 'm', 'n', 'g'], 3, rng(s));
      expect(d).toHaveLength(3);
      expect(d).not.toContain('b');
      expect(d).not.toContain('d');
      expect(d).not.toContain('p');
    }
  });
});
