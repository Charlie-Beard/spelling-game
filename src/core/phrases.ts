/**
 * Everything the narrator says, apart from the words themselves and the
 * chapter intros. Pre-recorded at build time (scripts/voice), with the
 * device's speech as a fallback.
 */

export const PRAISE = [
  'Brilliant!',
  'Well done!',
  'Wicked!',
  'Amazing spelling!',
  'Fantastic!',
  'Super!',
  'Ten points to Gryffindor!',
  'Spell-tastic!',
  'You did it!',
  'Magic!',
];

export const PHRASES = {
  welcome: 'Welcome to Wizard Words!',
  choose: 'Who do you want to be?',
  harry: 'Harry Potter!',
  ron: 'Ron Weasley!',
  hermione: 'Hermione Granger!',
  letsGo: 'Let’s go!',
  canYouSpell: 'Can you spell…',
  listen: 'Listen…',
  tryAgain: 'Hmm, try another one.',
  listenSound: 'Listen to the sound…',
  hedwigHelp: 'Hedwig can help!',
  hedwigHere: 'Here you go!',
  chapterDone: 'You finished the chapter!',
  newCard: 'You got a new wizard card!',
  newHorcrux: 'You found a Horcrux!',
  battleStart: 'Spell each word to cast a shield!',
  battleWin: 'You saved Hogwarts! Expelliarmus!',
  breakTime: 'Great work! Time for a little break.',
  turnSideways: 'Please turn the iPad sideways.',
  nextChapter: 'Ready for the next one?',
  allDone: 'Hooray! All done!',
} as const;

export type PhraseKey = keyof typeof PHRASES;

/** Announced when he arrives in a new book. */
export const bookLine = (n: number, title: string): string => `Book ${n}: ${title}!`;

/** Stable id for any spoken line, used as its audio file name. */
export function lineId(text: string): string {
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) >>> 0;
  return h.toString(36);
}
