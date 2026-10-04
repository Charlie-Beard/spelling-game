import { describe, expect, it } from 'vitest';
import { ALL_CHAPTERS } from '../../src/core/curriculum';
import { generic, personalise, PHRASES, PRAISE } from '../../src/core/phrases';

describe('personalised lines', () => {
  it('puts the name in', () => {
    expect(personalise('Well done, {name}!', 'Jasper')).toBe('Well done, Jasper!');
    expect(personalise('Hello there, {name}! I’m Hagrid.', 'Jasper')).toBe('Hello there, Jasper! I’m Hagrid.');
  });

  it('reads naturally without a name', () => {
    expect(generic('Well done, {name}!')).toBe('Well done!');
    expect(generic('Hello, {name}, I’m Professor Lupin.')).toBe('Hello, I’m Professor Lupin.');
    expect(generic('Dobby has come to help {name}!')).toBe('Dobby has come to help!');
    expect(personalise('Oi, {name}! A gnome.', '  ')).toBe('Oi! A gnome.');
  });

  it('leaves no stray placeholders or dangling words in any line', () => {
    const all = [...Object.values(PHRASES), ...PRAISE, ...ALL_CHAPTERS.map((c) => c.intro)];
    for (const t of all) {
      const g = generic(t);
      expect(g).not.toContain('{');
      expect(g).not.toMatch(/\b(for|to|help Master)[.!?,]/);
      expect(g).not.toMatch(/ ,|\s[!?.]/);
    }
  });
});
