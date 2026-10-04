import { describe, expect, it } from 'vitest';
import { makeWord, parseSpec } from '../../src/core/phonics';

describe('parseSpec', () => {
  it('splits a CVC word into single-letter sounds', () => {
    expect(parseSpec('c a t')).toEqual([
      { g: 'c', ph: 'k' },
      { g: 'a', ph: 'a' },
      { g: 't', ph: 't' },
    ]);
  });

  it('keeps digraphs as one sound', () => {
    expect(parseSpec('sh i p').map((u) => u.g)).toEqual(['sh', 'i', 'p']);
    expect(parseSpec('n igh t').map((u) => u.ph)).toEqual(['n', 'igh', 't']);
  });

  it('supports phoneme overrides', () => {
    expect(parseSpec('b oo:short k')[1]).toEqual({ g: 'oo', ph: 'oo-short' });
  });

  it('links split digraphs', () => {
    const u = parseSpec('c a-e k');
    expect(u.map((x) => x.g)).toEqual(['c', 'a', 'k', 'e']);
    expect(u[1]).toMatchObject({ ph: 'ai', link: 3 });
    expect(u[3]).toMatchObject({ ph: 'ai', link: 1 });
  });

  it('marks tricky units', () => {
    expect(parseSpec('s *ai d')[1]).toEqual({ g: 'ai', ph: 'ai', tricky: true });
  });

  it('rejects unknown graphemes', () => {
    expect(() => parseSpec('c q t')).toThrow();
  });
});

describe('makeWord', () => {
  it('defaults to one letter per sound', () => {
    expect(makeWord('hat').units.map((u) => u.g)).toEqual(['h', 'a', 't']);
  });

  it('checks the spec spells the word', () => {
    expect(() => makeWord('cat', 'c a p')).toThrow();
    expect(makeWord('snake', 's n a-e k').units).toHaveLength(5);
  });
});
