/**
 * Everything the narrator says, apart from the words themselves and the
 * chapter intros. Pre-recorded at build time (scripts/voice), with the
 * device's speech as a fallback.
 */

export const PRAISE = [
  'Brilliant, {name}!',
  'Well done, {name}!',
  'Wicked!',
  'Great spelling, {name}!',
  'Amazing spelling!',
  'Fantastic!',
  'Super!',
  'Ten points to Gryffindor!',
  'Spell-tastic!',
  'You did it!',
  'Magic!',
];

export const PHRASES = {
  welcome: 'Welcome to Wizard Words, {name}!',
  choose: 'Who do you want to be, {name}?',
  harry: 'Harry Potter!',
  ron: 'Ron Weasley!',
  hermione: 'Hermione Granger!',
  letsGo: 'Let’s go, {name}!',
  canYouSpell: 'Can you spell…',
  listen: 'Listen…',
  tryAgain: 'Hmm, try another one.',
  listenSound: 'Listen to the sound…',
  hedwigHelp: 'Hedwig can help!',
  hedwigHere: 'Here you go!',
  chapterDone: 'You finished the chapter, {name}!',
  newCard: 'You got a new wizard card!',
  newHorcrux: 'You found a Horcrux!',
  battleStart: 'Spell each word to cast a shield!',
  battleWin: 'You did it, {name}! You saved Hogwarts!',
  protego: 'Protego!',
  expelliarmus: 'Expelliarmus!',
  turnSideways: 'Please turn the iPad sideways.',
  nextChapter: 'Ready for the next one?',
  allDone: 'Hooray! All done!',
} as const;

export type PhraseKey = keyof typeof PHRASES;

/** Voldemort's lines in the final duel (his own voice). */
export const VOLDEMORT = {
  taunt: 'Ha! You will never beat me!',
  spell: 'Stupefy!',
  lose: 'Nooooo!',
} as const;

/** Announced when he arrives in a new book. */
export const bookLine = (n: number, title: string): string => `Book ${n}: ${title}!`;

/** The player's name. Lines may contain {name}. */
export const DEFAULT_NAME = 'Jasper';

/** A line with the child's name in it. */
export function personalise(text: string, name: string): string {
  const n = name.trim();
  return n ? text.split('{name}').join(n) : generic(text);
}

/** The same line without a name ("Well done, {name}!" → "Well done!"). */
export function generic(text: string): string {
  const t = text
    .replace(/,\s*\{name\}/g, '')
    .replace(/\{name\},\s*/g, '')
    .replace(/\s*\{name\}/g, '')
    .replace(/\s+([!?.…])/g, '$1');
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/** Stable id for any spoken line, used as its audio file name. */
export function lineId(text: string): string {
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) >>> 0;
  return h.toString(36);
}
