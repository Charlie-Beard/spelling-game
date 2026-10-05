import { describe, expect, it } from 'vitest';
import { ALL_CHAPTERS } from '../../src/core/curriculum';
import { generic } from '../../src/core/phrases';
import { STORIES } from '../../src/stories';
import elevenlabs from '../../scripts/voice/elevenlabs.json';

const voices = Object.keys(elevenlabs.speakers);

describe('reward stories', () => {
  it('has a story for every chapter but the battle', () => {
    const want = ALL_CHAPTERS.filter((c) => c.kind !== 'battle').map((c) => c.id);
    expect(Object.keys(STORIES).sort()).toEqual(want.sort());
  });

  for (const [id, load] of Object.entries(STORIES)) {
    it(`${id}: every line can be recorded`, async () => {
      const { lines } = (await load()).default;
      const all = Object.values(lines);
      for (const l of all) {
        // Only characters with a voice speak; the narrator talks to the hero.
        expect(voices, `${id}: "${l.text}"`).toContain(l.who);
        expect(l.text.trim().length).toBeGreaterThan(0);
        expect(l.text.split(/\s+/).length, `${id}: "${l.text}" is too long`).toBeLessThanOrEqual(20);
        expect(generic(l.text)).not.toContain('{');
      }
      // Lines with the child's name are recorded twice: keep them rare.
      expect(all.filter((l) => l.text.includes('{name}')).length).toBeLessThanOrEqual(1);
    });
  }
});
