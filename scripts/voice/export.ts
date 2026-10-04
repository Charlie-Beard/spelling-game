/**
 * Exports everything the narrator needs to say to scripts/voice/lines.json,
 * for generate.py to record with an offline neural voice.
 */
import { writeFileSync } from 'node:fs';
import { ALL_CHAPTERS, ALL_WORDS } from '../../src/core/curriculum';
import { GRAPHEME_PHONEME } from '../../src/core/phonics';
import { HOST_NAMES } from '../../src/core/names';
import { lineId, PHRASES, PRAISE } from '../../src/core/phrases';
import { HORCRUX_NAMES } from '../../src/art/horcruxes';

const lines: { id: string; text: string; speaker: string }[] = [];
const add = (text: string, speaker = 'narrator') => {
  const id = lineId(text);
  if (!lines.some((l) => l.id === id)) lines.push({ id, text, speaker });
};
Object.values(PHRASES).forEach((t) => add(t));
PRAISE.forEach((t) => add(t));
Object.values(HOST_NAMES).forEach((t) => add(t));
Object.values(HORCRUX_NAMES).forEach((t) => add(t));
add('Hero of Hogwarts');
ALL_CHAPTERS.forEach((c) => {
  add(c.intro, c.host);
  add(c.title);
});

const phonemes = [...new Set(Object.values(GRAPHEME_PHONEME)), 'oo-short', 'schwa'];
writeFileSync(
  new URL('./lines.json', import.meta.url),
  JSON.stringify({ words: ALL_WORDS, phonemes, lines }, null, 2),
);
console.log(`${ALL_WORDS.length} words, ${phonemes.length} phonemes, ${lines.length} lines`);
