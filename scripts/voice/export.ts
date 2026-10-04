/**
 * Exports everything the narrator needs to say to scripts/voice/lines.json,
 * for generate.py to record with an offline neural voice.
 */
import { writeFileSync } from 'node:fs';
import { ALL_CHAPTERS, ALL_WORDS, BOOKS } from '../../src/core/curriculum';
import { GRAPHEME_PHONEME } from '../../src/core/phonics';
import { HOST_NAMES } from '../../src/core/names';
import { bookLine, DEFAULT_NAME, generic, lineId, personalise, PHRASES, PRAISE, VOLDEMORT } from '../../src/core/phrases';
import { HORCRUX_NAMES } from '../../src/art/horcruxes';

const lines: { id: string; text: string; speaker: string }[] = [];
const add = (template: string, speaker = 'narrator') => {
  // Lines with {name}: record a version with the child's name and one without.
  if (template.includes('{name}')) {
    push(personalise(template, DEFAULT_NAME), speaker);
    push(generic(template), speaker);
  } else push(template, speaker);
};
const push = (text: string, speaker: string) => {
  const id = lineId(text);
  if (!lines.some((l) => l.id === id)) lines.push({ id, text, speaker });
};
Object.values(PHRASES).forEach((t) => add(t));
PRAISE.forEach((t) => add(t));
Object.values(VOLDEMORT).forEach((t) => add(t, 'voldemort'));
Object.values(HOST_NAMES).forEach((t) => add(t));
Object.values(HORCRUX_NAMES).forEach((t) => add(t));
add('Hero of Hogwarts');
add('{name}, Hero of Hogwarts!');
BOOKS.forEach((b) => add(bookLine(b.n, b.title.replace('’', "'"))));
ALL_CHAPTERS.forEach((c) => {
  add(c.intro, c.host);
  add(c.title);
});

const phonemes = [...new Set(Object.values(GRAPHEME_PHONEME)), 'oo-short', 'schwa'];
// Each word's sounds, so check.py knows which vowel to listen for.
const units = Object.fromEntries(ALL_CHAPTERS.flatMap((c) => c.words.map((w) => [w.text, w.units.map((u) => u.ph)])));
writeFileSync(
  new URL('./lines.json', import.meta.url),
  JSON.stringify({ words: ALL_WORDS, phonemes, units, lines }, null, 2),
);
console.log(`${ALL_WORDS.length} words, ${phonemes.length} phonemes, ${lines.length} lines`);
