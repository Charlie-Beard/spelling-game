import { describe, expect, it } from 'vitest';
import { characters } from '../../src/art/characters';
import { horcruxArt } from '../../src/art/horcruxes';
import { hasPicture, picture } from '../../src/art/pictures';
import { ALL_CHAPTERS, ALL_WORDS, HORCRUXES } from '../../src/core/curriculum';

describe('art coverage', () => {
  it('has a picture for every word in the curriculum', () => {
    const missing = ALL_WORDS.filter((w) => !hasPicture(w));
    expect(missing).toEqual([]);
  });

  it('renders every picture as a labelled SVG', () => {
    for (const w of ALL_WORDS) {
      const s = picture(w);
      expect(s.startsWith('<svg')).toBe(true);
      expect(s).toContain('role="img"');
      expect(s).not.toContain('NaN');
    }
  });

  it('has a portrait for every chapter host and avatar', () => {
    const ids = new Set([...ALL_CHAPTERS.map((c) => c.host), 'harry', 'ron', 'hermione', 'hedwig']);
    for (const id of ids) {
      expect(characters[id], id).toBeTypeOf('function');
      expect(characters[id]()).not.toContain('NaN');
    }
  });

  it('has art for every horcrux', () => {
    for (const h of HORCRUXES) expect(horcruxArt[h]()).toContain('<svg');
  });
});
