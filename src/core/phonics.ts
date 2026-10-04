/**
 * Phonics model, following the UK Letters and Sounds order used by
 * Little Wandle Letters and Sounds Revised.
 *
 * A word is spelt one *sound* at a time. Each unit is a grapheme (the
 * letters on a tile) plus the phoneme it makes in this word (the sound the
 * tile says). Split digraphs (a-e in "cake") are two linked units.
 */

/** Phoneme ids. Audio clips are named after these. */
export type Phoneme = string;

export interface Unit {
  /** Letters shown on the tile, e.g. "sh". */
  g: string;
  /** Sound it makes in this word, e.g. "sh", "oo-long", "a-e". */
  ph: Phoneme;
  /** Index of the partner unit for a split digraph. */
  link?: number;
  /** Part of a tricky (common exception) word. */
  tricky?: boolean;
}

export interface Word {
  /** The written word. */
  text: string;
  units: Unit[];
}

/** Default phoneme for each grapheme. */
export const GRAPHEME_PHONEME: Record<string, Phoneme> = {
  // Phase 2
  s: 's', a: 'a', t: 't', p: 'p', i: 'i', n: 'n', m: 'm', d: 'd', g: 'g', o: 'o',
  c: 'k', k: 'k', ck: 'k', e: 'e', u: 'u', r: 'r', h: 'h', b: 'b', f: 'f', ff: 'f',
  l: 'l', ll: 'l', ss: 's',
  // Phase 3
  j: 'j', v: 'v', w: 'w', x: 'x', y: 'y', z: 'z', zz: 'z', qu: 'qu',
  ch: 'ch', sh: 'sh', th: 'th', ng: 'ng', nk: 'nk',
  ai: 'ai', ee: 'ee', igh: 'igh', oa: 'oa', oo: 'oo-long', ar: 'ar', or: 'or',
  ur: 'ur', ow: 'ow', oi: 'oi', ear: 'ear', air: 'air', er: 'er',
  // Phase 4 doubles that appear in CVCC words
  gg: 'g', dd: 'd', tt: 't', pp: 'p', bb: 'b', nn: 'n', mm: 'm', rr: 'r',
  // Phase 5
  ay: 'ai', ou: 'ow', ie: 'igh', ea: 'ee', oy: 'oi', ir: 'ur', ue: 'oo-long',
  aw: 'or', wh: 'w', ph: 'f', ew: 'oo-long', oe: 'oa', au: 'or', ey: 'ee',
  'a-e': 'ai', 'e-e': 'ee', 'i-e': 'igh', 'o-e': 'oa', 'u-e': 'oo-long',
};

/** Phoneme overrides usable in a spec, e.g. "b oo:short k". */
const PHONEME_ALIASES: Record<string, Phoneme> = {
  'oo:short': 'oo-short',
  'oo:long': 'oo-long',
  'ow:oa': 'oa',
  'y:ee': 'ee',
  'y:igh': 'igh',
  'a:ar': 'ar',
  'e:ee': 'ee',
  'o:u': 'u',
  's:z': 'z',
  'er:schwa': 'schwa',
  'a:schwa': 'schwa',
  'o:schwa': 'schwa',
  'i:schwa': 'schwa',
};

/** How each phoneme is described to a grown-up (and the TTS fallback). */
export const PHONEME_HINTS: Record<Phoneme, string> = {
  s: 'sss (snake)', a: 'a (apple)', t: 't (tiger)', p: 'p (pan)', i: 'i (insect)',
  n: 'nnn (net)', m: 'mmm (mouse)', d: 'd (dog)', g: 'g (goat)', o: 'o (octopus)',
  k: 'c / k (cat)', e: 'e (egg)', u: 'u (umbrella)', r: 'rrr (rat)', h: 'h (hat)',
  b: 'b (bat)', f: 'fff (fish)', l: 'lll (leg)', j: 'j (jam)', v: 'vvv (van)',
  w: 'w (wand)', x: 'ks (fox)', y: 'y (yak)', z: 'zzz (zip)', qu: 'kw (queen)',
  ch: 'ch (chip)', sh: 'shh (ship)', th: 'th (thumb)', ng: 'ng (ring)', nk: 'nk (pink)',
  ai: 'ai (rain)', ee: 'ee (tree)', igh: 'igh (night)', oa: 'oa (boat)',
  'oo-long': 'oo (moon)', 'oo-short': 'oo (book)', ar: 'ar (star)', or: 'or (fork)',
  ur: 'ur (fur)', ow: 'ow (owl)', oi: 'oi (coin)', ear: 'ear (hear)', air: 'air (chair)',
  er: 'er (letter)', schwa: 'uh (the end of "dragon")',
};

/**
 * Parses a spelling spec into units.
 *
 *   "c a t"       → c·a·t
 *   "sh i p"      → sh·i·p
 *   "b oo:short k" → oo says its short sound
 *   "c a-e k"     → c·a·k·e with a and e linked (split digraph)
 *   "s *ai d"     → a leading * marks a tricky unit
 */
export function parseSpec(spec: string): Unit[] {
  const tokens = spec.trim().split(/\s+/);
  const units: Unit[] = [];
  let pendingE: { partner: number; ph: Phoneme; tricky: boolean } | null = null;
  let afterNext = false;

  for (const raw of tokens) {
    const tricky = raw.startsWith('*');
    const tok = tricky ? raw.slice(1) : raw;
    let g = tok;
    let ph: Phoneme | undefined;

    if (tok.includes(':')) {
      g = tok.split(':')[0];
      ph = PHONEME_ALIASES[tok];
      if (!ph) throw new Error(`Unknown phoneme override "${tok}"`);
    }

    if (/^[aeiou]-e$/.test(g)) {
      const vowel = g[0];
      const idx = units.length;
      units.push({ g: vowel, ph: ph ?? GRAPHEME_PHONEME[g], ...(tricky ? { tricky } : {}) });
      pendingE = { partner: idx, ph: ph ?? GRAPHEME_PHONEME[g], tricky };
      afterNext = true;
      continue;
    }

    ph = ph ?? GRAPHEME_PHONEME[g];
    if (!ph) throw new Error(`Unknown grapheme "${g}" in "${spec}"`);
    units.push({ g, ph, ...(tricky ? { tricky } : {}) });

    if (pendingE && afterNext) {
      afterNext = false;
      const eIdx = units.length;
      units.push({ g: 'e', ph: pendingE.ph, link: pendingE.partner, ...(pendingE.tricky ? { tricky: true } : {}) });
      units[pendingE.partner].link = eIdx;
      pendingE = null;
    }
  }
  if (pendingE) throw new Error(`Split digraph in "${spec}" needs a consonant after it`);
  return units;
}

export function makeWord(text: string, spec?: string): Word {
  const units = parseSpec(spec ?? text.split('').join(' '));
  const spelled = units.map((u) => u.g).join('');
  if (spelled !== text) throw new Error(`Spec "${spec}" spells "${spelled}", not "${text}"`);
  return { text, units };
}

/** Graphemes that are easy to confuse; avoided as distractors early on. */
export const CONFUSABLE: Record<string, string[]> = {
  b: ['d', 'p'], d: ['b', 'p'], p: ['b', 'q', 'd'], q: ['p'], m: ['n', 'w'], n: ['m', 'u'],
  u: ['n'], w: ['m'], i: ['l', 'j'], l: ['i'], c: ['k'], k: ['c', 'ck'], ck: ['k', 'c'],
  e: ['a'], a: ['e', 'o'], o: ['a'],
};
