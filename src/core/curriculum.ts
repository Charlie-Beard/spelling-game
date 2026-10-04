/**
 * The adventure: seven books, each a world on the map, following the UK
 * phonics order (Letters and Sounds / Little Wandle).
 *
 * Every chapter is 5 words (2–3 minutes), hosted by a character from that
 * book. Ordinary chapters award the host's Chocolate Frog card. The last
 * chapter of books 1–6 reveals a Horcrux; book 7 ends with the Battle of
 * Hogwarts.
 *
 * Content rules (agreed with the family): no Unforgivable Curses, nothing
 * from the Katie Bell necklace scene, nothing at Malfoy Manor (or Dobby's
 * death), and Harry is never a Horcrux.
 */
import { makeWord, type Word } from './phonics';

export type ChapterKind = 'card' | 'horcrux' | 'battle';

export interface Chapter {
  id: string;
  /** 1-based number within the book. */
  n: number;
  title: string;
  host: string;
  /** What the host says to introduce the chapter. */
  intro: string;
  kind: ChapterKind;
  /** Card id (= host) or horcrux id awarded. */
  reward: string;
  words: Word[];
}

export interface Book {
  id: string;
  n: number;
  title: string;
  /** Short name for the map. */
  short: string;
  /** Grown-up description of the phonics focus. */
  focus: string;
  /** Accent colour for this world. */
  color: string;
  /** Graphemes used for distractor tiles in this book. */
  pool: string[];
  chapters: Chapter[];
}

type WordSpec = string | [string, string];

const words = (list: WordSpec[]): Word[] =>
  list.map((w) => (typeof w === 'string' ? makeWord(w) : makeWord(w[0], w[1])));

const PHASE2 = 's a t p i n m d g o c k e u r h b f l'.split(' ');
const PHASE3_CONS = 'j v w x y z qu ch sh th ng nk ck ll ss'.split(' ');
const PHASE3_VOW = 'ai ee igh oa oo ar or ur ow oi er'.split(' ');
const PHASE5 = 'ay ou ie ea oy ir ue aw ew'.split(' ');

interface ChapterDef {
  title: string;
  host: string;
  intro: string;
  kind?: ChapterKind;
  reward?: string;
  words: WordSpec[];
}

function book(
  n: number,
  title: string,
  short: string,
  focus: string,
  color: string,
  pool: string[],
  defs: ChapterDef[],
): Book {
  const id = `b${n}`;
  return {
    id,
    n,
    title,
    short,
    focus,
    color,
    pool,
    chapters: defs.map((d, i) => ({
      id: `${id}c${i + 1}`,
      n: i + 1,
      title: d.title,
      host: d.host,
      intro: d.intro,
      kind: d.kind ?? 'card',
      reward: d.reward ?? d.host,
      words: words(d.words),
    })),
  };
}

export const BOOKS: Book[] = [
  book(1, 'The Philosopher’s Stone', 'Philosopher’s Stone', 'Three-letter words (CVC) with the first sounds: s a t p i n m d g o c k e u r h b f l', '#a9413a', PHASE2, [
    {
      title: 'Hagrid’s Hut',
      host: 'hagrid',
      intro: 'Hello there! I’m Hagrid. Can you help me tidy up my hut?',
      words: ['cat', 'hat', 'mat', 'rat', 'bat'],
    },
    {
      title: 'Diagon Alley',
      host: 'ollivander',
      intro: 'Welcome to Diagon Alley! Let’s find everything you need for school.',
      words: ['map', 'bag', 'cap', 'pan', 'fan'],
    },
    {
      title: 'The Hogwarts Express',
      host: 'trevor',
      intro: 'Ribbit! I’m Trevor the toad. I hopped all over the train. Help me find these!',
      words: ['pig', 'pin', 'bin', 'tin', 'lid'],
    },
    {
      title: 'The Great Hall Feast',
      host: 'nick',
      intro: 'Good evening! I’m Nearly Headless Nick. Let’s spell the feast!',
      words: ['pot', 'cup', 'mug', 'bun', 'nut'],
    },
    {
      title: 'The Hidden Ring',
      host: 'voldemort',
      intro: 'I have hidden a ring. You will never find it… unless you can spell!',
      kind: 'horcrux',
      reward: 'ring',
      words: ['bug', ['web', 'w e b'], ['bell', 'b e ll'], ['rock', 'r o ck'], 'net'],
    },
  ]),

  book(2, 'The Chamber of Secrets', 'Chamber of Secrets', 'Two letters, one sound (ck, ch, sh, ng, th) and the letters j v w x y z qu', '#3f6b4c', [...PHASE2, ...PHASE3_CONS], [
    {
      title: 'Dobby’s Warning',
      host: 'dobby',
      intro: 'Dobby has come to help! Dobby likes socks very much.',
      words: [['sock', 's o ck'], ['chip', 'ch i p'], ['chick', 'ch i ck'], ['duck', 'd u ck'], ['lock', 'l o ck']],
    },
    {
      title: 'The Burrow',
      host: 'gnome',
      intro: 'Oi! A garden gnome, that’s me. Let’s spell things at the Burrow.',
      words: [['fish', 'f i sh'], ['ship', 'sh i p'], ['shell', 'sh e ll'], ['dish', 'd i sh'], ['shed', 'sh e d']],
    },
    {
      title: 'The Flying Car',
      host: 'willow',
      intro: 'Who crashed a car into ME? Spell these words and I’ll calm down.',
      words: [['wing', 'w i ng'], ['king', 'k i ng'], ['ring', 'r i ng'], ['moth', 'm o th'], ['sink', 's i nk']],
    },
    {
      title: 'Fawkes the Phoenix',
      host: 'fawkes',
      intro: 'Fawkes the phoenix sings a song. Spell these words to make him glow!',
      words: [['box', 'b o x'], ['fox', 'f o x'], ['jam', 'j a m'], ['van', 'v a n'], ['zip', 'z i p']],
    },
    {
      title: 'The Secret Diary',
      host: 'basilisk',
      intro: 'Hissss… The diary is down in the Chamber. Spell bravely to find it.',
      kind: 'horcrux',
      reward: 'diary',
      words: [['quill', 'qu i ll'], ['chess', 'ch e ss'], ['jug', 'j u g'], ['bang', 'b a ng'], ['wig', 'w i g']],
    },
  ]),

  book(3, 'The Prisoner of Azkaban', 'Prisoner of Azkaban', 'Words with two consonants together (frog, wand, lamp)', '#4f78a8', [...PHASE2, ...PHASE3_CONS], [
    {
      title: 'Crookshanks',
      host: 'crookshanks',
      intro: 'Mrrow. I am Crookshanks. I like chasing things. Spell what I chase!',
      words: [['frog', 'f r o g'], ['crab', 'c r a b'], ['drum', 'd r u m'], ['flag', 'f l a g'], ['slug', 's l u g']],
    },
    {
      title: 'Professor Lupin',
      host: 'lupin',
      intro: 'Hello, I’m Professor Lupin. Have some chocolate, then let’s spell!',
      words: [['wand', 'w a n d'], ['lamp', 'l a m p'], ['desk', 'd e s k'], ['tent', 't e n t'], ['nest', 'n e s t']],
    },
    {
      title: 'Buckbeak',
      host: 'buckbeak',
      intro: 'Bow to Buckbeak the hippogriff… he bows back! Now spell these.',
      words: [['twig', 't w i g'], ['stick', 's t i ck'], ['clock', 'c l o ck'], ['plum', 'p l u m'], ['milk', 'm i l k']],
    },
    {
      title: 'The Lost Locket',
      host: 'wormtail',
      intro: 'Squeak! I know where the locket is. But you’ll have to spell for it!',
      kind: 'horcrux',
      reward: 'locket',
      words: [['gift', 'g i f t'], ['belt', 'b e l t'], ['pond', 'p o n d'], ['cliff', 'c l i ff'], ['mask', 'm a s k']],
    },
  ]),

  book(4, 'The Goblet of Fire', 'Goblet of Fire', 'Vowel sounds made with two or three letters: ai ee igh oa oo', '#c8622e', [...PHASE2, ...PHASE3_CONS, ...PHASE3_VOW], [
    {
      title: 'The Quidditch World Cup',
      host: 'moody',
      intro: 'Constant vigilance! I’m Mad-Eye Moody. Keep your eyes on these words.',
      words: [['rain', 'r ai n'], ['tail', 't ai l'], ['bee', 'b ee'], ['feet', 'f ee t'], ['sheep', 'sh ee p']],
    },
    {
      title: 'The Dragon Task',
      host: 'horntail',
      intro: 'ROAR! I’m the Hungarian Horntail. Spell these and I’ll guard my golden egg.',
      words: [['night', 'n igh t'], ['light', 'l igh t'], ['boat', 'b oa t'], ['goat', 'g oa t'], ['coat', 'c oa t']],
    },
    {
      title: 'The Black Lake',
      host: 'myrtle',
      intro: 'Oooh, a visitor! I’m Moaning Myrtle. Help me with these words.',
      words: [['moon', 'm oo n'], ['broom', 'b r oo m'], ['boot', 'b oo t'], ['book', 'b oo:short k'], ['hook', 'h oo:short k']],
    },
    {
      title: 'The Golden Cup',
      host: 'bellatrix',
      intro: 'Ha ha! The golden cup is MINE. Spell well if you want to take it.',
      kind: 'horcrux',
      reward: 'cup',
      words: [['toad', 't oa d'], ['chain', 'ch ai n'], ['tree', 't r ee'], ['soap', 's oa p'], ['sail', 's ai l']],
    },
  ]),

  book(5, 'The Order of the Phoenix', 'Order of the Phoenix', 'More vowel sounds: ar or ur ow oi air ear er', '#6b4f86', [...PHASE2, ...PHASE3_CONS, ...PHASE3_VOW], [
    {
      title: 'Grimmauld Place',
      host: 'sirius',
      intro: 'Welcome to my house! I’m Sirius, Harry’s godfather. Let’s spell!',
      words: [['star', 's t ar'], ['car', 'c ar'], ['jar', 'j ar'], ['fork', 'f or k'], ['horn', 'h or n']],
    },
    {
      title: 'Luna Lovegood',
      host: 'luna',
      intro: 'Hello. I’m Luna. I can see lovely creatures. Can you spell them?',
      words: [['owl', 'ow l'], ['cow', 'c ow'], ['crown', 'c r ow n'], ['coin', 'c oi n'], ['oil', 'oi l']],
    },
    {
      title: 'Dumbledore’s Army',
      host: 'neville',
      intro: 'I’m Neville. We practise spells in secret. Let’s practise spelling too!',
      words: [['chair', 'ch air'], ['hair', 'h air'], ['stairs', 's t air s'], ['beard', 'b ear d'], ['letter', 'l e tt er']],
    },
    {
      title: 'The Lost Diadem',
      host: 'deatheater',
      intro: 'The Death Eaters are hiding the diadem. Spell to sneak past them!',
      kind: 'horcrux',
      reward: 'diadem',
      words: [['shark', 'sh ar k'], ['storm', 's t or m'], ['hammer', 'h a mm er'], ['corn', 'c or n'], ['boil', 'b oi l']],
    },
  ]),

  book(6, 'The Half-Blood Prince', 'Half-Blood Prince', 'Split vowel sounds (a-e, i-e, o-e, u-e) and new ways to spell sounds', '#2f5d47', [...PHASE2, ...PHASE3_CONS, ...PHASE3_VOW, ...PHASE5], [
    {
      title: 'Slughorn’s Potions',
      host: 'slughorn',
      intro: 'Ah, a new student! I’m Professor Slughorn. Let’s brew some spelling!',
      words: [['cake', 'c a-e k'], ['snake', 's n a-e k'], ['cave', 'c a-e v'], ['kite', 'k i-e t'], ['five', 'f i-e v']],
    },
    {
      title: 'The Crystal Cave',
      host: 'dumbledore',
      intro: 'Hello, I am Professor Dumbledore. Come with me to the cave, and spell.',
      words: [['bone', 'b o-e n'], ['stone', 's t o-e n'], ['rope', 'r o-e p'], ['smoke', 's m o-e k'], ['cube', 'c u-e b']],
    },
    {
      title: 'Quidditch Practice',
      host: 'ginny',
      intro: 'Hi! I’m Ginny, the best flyer in Gryffindor. Ready for practice?',
      words: [['tray', 't r ay'], ['mouth', 'm ou th'], ['cloud', 'c l ou d'], ['pie', 'p ie'], ['leaf', 'l ea f']],
    },
    {
      title: 'The Great Snake',
      host: 'nagini',
      intro: 'Sssss. I am Nagini. Spell very carefully… if you dare.',
      kind: 'horcrux',
      reward: 'nagini',
      words: [['skull', 's k u ll'], ['crow', 'c r ow:oa'], ['flame', 'f l a-e m'], ['throne', 'th r o-e n'], ['spike', 's p i-e k']],
    },
  ]),

  book(7, 'The Deathly Hallows', 'Deathly Hallows', 'Longer words with two beats (rab-bit, gob-lin, drag-on)', '#46507c', [...PHASE2, ...PHASE3_CONS, ...PHASE3_VOW], [
    {
      title: 'Kreacher’s Kitchen',
      host: 'kreacher',
      intro: 'Kreacher will help Master. Kreacher has packed a picnic.',
      words: [['rabbit', 'r a bb i t'], ['basket', 'b a s k e t'], ['carpet', 'c ar p e t'], ['kitten', 'k i tt e n'], ['picnic', 'p i c n i c']],
    },
    {
      title: 'Gringotts Bank',
      host: 'griphook',
      intro: 'I am Griphook the goblin. Spell well and I’ll open the vault.',
      words: [['goblin', 'g o b l i n'], ['dragon', 'd r a g o:schwa n'], ['helmet', 'h e l m e t'], ['pocket', 'p o ck e t'], ['magic', 'm a g i c']],
    },
    {
      title: 'Back to Hogwarts',
      host: 'mcgonagall',
      intro: 'I am Professor McGonagall. Hogwarts needs you. Let’s get ready!',
      words: [['pumpkin', 'p u m p k i n'], ['cobweb', 'c o b w e b'], ['lantern', 'l a n t er n'], ['thunder', 'th u n d er'], ['sunset', 's u n s e t']],
    },
    {
      title: 'The Battle of Hogwarts',
      host: 'voldemort',
      intro: 'The Death Eaters are coming! Spell each word to cast a shield over the castle.',
      kind: 'battle',
      reward: 'victory',
      words: [['wand', 'w a n d'], ['broom', 'b r oo m'], ['owl', 'ow l'], ['star', 's t ar'], ['light', 'l igh t'], ['stone', 's t o-e n'], ['dragon', 'd r a g o:schwa n'], ['magic', 'm a g i c']],
    },
  ]),
];

export const ALL_CHAPTERS: Chapter[] = BOOKS.flatMap((b) => b.chapters);

export function findChapter(id: string): { book: Book; chapter: Chapter; index: number } | undefined {
  for (const book of BOOKS) {
    const chapter = book.chapters.find((c) => c.id === id);
    if (chapter) return { book, chapter, index: ALL_CHAPTERS.indexOf(chapter) };
  }
  return undefined;
}

/** Every distinct word with a picture, in curriculum order. */
export const ALL_WORDS: string[] = [...new Set(ALL_CHAPTERS.flatMap((c) => c.words.map((w) => w.text)))];

export const HORCRUXES = ['ring', 'diary', 'locket', 'cup', 'diadem', 'nagini'] as const;

export const AVATARS = ['harry', 'ron', 'hermione'] as const;
export type Avatar = (typeof AVATARS)[number];
