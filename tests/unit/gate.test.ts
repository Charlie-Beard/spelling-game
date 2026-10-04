import { describe, expect, it } from 'vitest';
import { makeSum } from '../../src/core/gate';

describe('makeSum', () => {
  it('gives times tables and divisions with whole answers', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 500; i++) {
      const s = makeSum();
      const m = s.text.match(/^(\d+) ([×÷]) (\d+)$/);
      expect(m).not.toBeNull();
      const [, x, op, y] = m!;
      seen.add(op);
      expect(op === '×' ? Number(x) * Number(y) : Number(x) / Number(y)).toBe(s.answer);
      expect(Number.isInteger(s.answer)).toBe(true);
      expect(s.answer).toBeGreaterThanOrEqual(3);
    }
    expect(seen).toEqual(new Set(['×', '÷']));
  });

  it('never uses 1, 2 or 10 as a factor', () => {
    for (let i = 0; i < 500; i++) {
      const s = makeSum();
      const [x, , y] = s.text.split(' ');
      const factors = s.text.includes('×') ? [Number(x), Number(y)] : [Number(y), s.answer];
      for (const f of factors) expect(f).toBeGreaterThanOrEqual(3);
      for (const f of factors) expect(f).toBeLessThanOrEqual(9);
    }
  });
});
