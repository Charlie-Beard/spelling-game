import { C } from '../palette';
import { curve, ink, piece, rect, svg } from '../paper';
import { book1Pictures } from './book1';
import { book2Pictures } from './book2';
import { book3Pictures } from './book3';
import { book4Pictures } from './book4';

const registry: Record<string, () => string> = {
  ...book1Pictures,
  ...book2Pictures,
  ...book3Pictures,
  ...book4Pictures,
};

const cache = new Map<string, string>();

export function hasPicture(word: string): boolean {
  return word in registry;
}

/** The illustration for a word, or a "listen" scroll for custom words. */
export function picture(word: string): string {
  let s = cache.get(word);
  if (!s) {
    s = registry[word]?.() ?? mysteryScroll(word);
    cache.set(word, s);
  }
  return s;
}

export const pictureNames = (): string[] => Object.keys(registry);

function mysteryScroll(word: string): string {
  return svg({ w: 400, h: 400, name: 'scroll-' + word, label: 'listen to the word' }, [
    piece(rect(90, 80, 220, 250, 10), C.cream),
    piece(curve([[70, 70], [330, 70], [340, 100], [60, 100]]), C.sand),
    piece(curve([[70, 312], [330, 312], [340, 342], [60, 342]]), C.sand),
    ink([[130, 150], [270, 150]], { width: 6, color: C.tan }),
    ink([[130, 190], [250, 190]], { width: 6, color: C.tan }),
    ink([[130, 230], [262, 230]], { width: 6, color: C.tan }),
    ink([[130, 270], [220, 270]], { width: 6, color: C.tan }),
  ]);
}
