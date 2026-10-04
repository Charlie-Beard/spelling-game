/**
 * The map: one parchment page per book. Chapter stops (the host's portrait)
 * sit along a trail of footprints. Exactly one thing glows — the next
 * chapter — with the child's character standing beside it.
 */
import { gsap } from 'gsap';
import { sfx } from '../audio/sfx';
import { voice } from '../audio/voice';
import { characters } from '../art/characters';
import { horcruxArt } from '../art/horcruxes';
import { C } from '../art/palette';
import { ellipse, hashString, ink, piece, rng, svg, type Pt } from '../art/paper';
import { parchment, waxSeal } from '../art/ui';
import { BOOKS, type Book, type Chapter } from '../core/curriculum';
import { currentIndex, isUnlocked } from '../core/progress';
import { ALL_CHAPTERS } from '../core/curriculum';
import { breathe, pop, sm, wobble } from '../ui/anim';
import { banner, holdButton, sealButton } from '../ui/components';
import { h, place } from '../ui/dom';
import { Scene, type App } from '../ui/scene';

const STOPS: Record<number, Pt[]> = {
  4: [[190, 520], [440, 330], [700, 520], [960, 340]],
  5: [[150, 540], [370, 330], [590, 540], [810, 330], [1020, 520]],
};
const R = 78;

/** Re-crops a portrait SVG to its head and shoulders. */
export function crop(svgStr: string, vb = '40 30 220 220'): string {
  return svgStr.replace(/viewBox="[^"]*"/, `viewBox="${vb}"`);
}

export class MapScene extends Scene {
  private book: Book;
  private justDone?: string;
  private token!: HTMLElement;
  private stopEls: HTMLElement[] = [];

  constructor(app: App, bookN: number, justDone?: string) {
    super(app, 'map');
    this.book = BOOKS[Math.max(0, Math.min(BOOKS.length - 1, bookN - 1))];
    this.justDone = justDone;
  }

  build(): void {
    const r = this.root;
    const p = this.app.progress;
    r.style.background = C.night;
    r.append(place(h('div', { html: parchment(1220, 860, 'map-sheet-' + this.book.n, C.sand, 2.2) }), -20, -20, 1220, 860));
    r.append(h('div', { class: 'backdrop-wrap', html: mapDoodles(this.book) }));

    r.append(banner(`Book ${this.book.n}: ${this.book.short}`, { x: 230, y: 20, w: 720, h: 96, size: 40 }));

    // Book arrows
    if (this.book.n > 1) {
      const prev = sealButton('back', { x: 130, y: 24, size: 84, color: C.slate, aria: 'Previous book' });
      this.tap(prev, () => {
        sfx.tap();
        this.app.nav.map(this.book.n - 1);
      });
      r.append(prev);
    }
    const nextBook = BOOKS[this.book.n];
    if (nextBook && isUnlocked(p, nextBook.chapters[0])) {
      const next = sealButton('next', { x: 966, y: 24, size: 84, color: C.slate, aria: 'Next book' });
      this.tap(next, () => {
        sfx.tap();
        this.app.nav.map(this.book.n + 1);
      });
      r.append(next);
    }

    // Trail
    const pts = STOPS[this.book.chapters.length];
    r.append(h('div', { class: 'backdrop-wrap trail', html: trail(pts, this.book.n) }));

    // Stops
    const cur = ALL_CHAPTERS[currentIndex(p)];
    this.book.chapters.forEach((c, i) => {
      const [x, y] = pts[i];
      const el = this.stop(c, x, y, cur);
      r.append(el);
      this.stopEls.push(el);
    });

    // Character token beside the current stop (or the last one in this book).
    const curInBook = this.book.chapters.indexOf(cur);
    const at = curInBook >= 0 ? curInBook : this.book.chapters.length - 1;
    const avatar = p.avatar ?? 'harry';
    this.token = place(h('div', { class: 'token', html: crop(characters[avatar](), '30 20 240 320') }), pts[at][0] - 55, pts[at][1] - R - 128, 110, 147);
    r.append(this.token);
    this.onCleanup(breathe(this.token, 0.04, 1.8));

    // Bottom corners
    const home = sealButton('home', { x: 34, y: 700, size: 84, color: C.slate, aria: 'Home' });
    this.tap(home, () => {
      sfx.tap();
      this.app.nav.title();
    });
    const album = sealButton('cards', { x: 1060, y: 690, size: 96, color: C.red, aria: 'My cards and Horcruxes' });
    this.tap(album, () => {
      sfx.tap();
      this.app.nav.album();
    });
    r.append(home, album);

    if (p.custom.length) {
      const prac = sealButton('again', { x: 548, y: 676, size: 84, color: C.greenDark, aria: 'Practise my words', label: 'My words' });
      this.tap(prac, () => {
        sfx.tap();
        this.app.nav.practice();
      });
      r.append(prac);
    }

    const hold = holdButton({ x: 1094, y: 30, onDone: () => this.app.nav.parent() });
    r.append(hold.el);
    this.onCleanup(hold.dispose);
  }

  async enter(): Promise<void> {
    this.stopEls.forEach((el, i) => void sm(el, 0.4, { startAt: { scale: 0.4, opacity: 0 }, scale: 1, opacity: 1, delay: i * 0.08, ease: 'back.out(1.7)' }));
    if (this.justDone) {
      const doneIdx = this.book.chapters.findIndex((c) => c.id === this.justDone);
      const curEl = this.root.querySelector('.stop.current') as HTMLElement | null;
      if (doneIdx >= 0 && curEl) {
        // Hop the token from the finished stop to the new one.
        const pts = STOPS[this.book.chapters.length];
        const [fx, fy] = pts[doneIdx];
        const tx = parseFloat(this.token.style.left);
        const ty = parseFloat(this.token.style.top);
        gsap.set(this.token, { x: fx - 55 - tx, y: fy - R - 128 - ty });
        await this.sleep(700);
        sfx.whoosh();
        await sm(this.token, 0.7, { x: 0, y: 0, ease: 'power1.inOut' });
        sfx.reveal();
        void pop(curEl, 1.15);
      }
    }
  }

  private stop(c: Chapter, x: number, y: number, cur: Chapter): HTMLElement {
    const p = this.app.progress;
    const done = !!p.chapters[c.id]?.done;
    const unlocked = isUnlocked(p, c);
    const isCur = c === cur;
    const state = isCur ? 'current' : done ? 'done' : unlocked ? 'open' : 'locked';
    const el = h('button', { class: `stop ${state} kind-${c.kind}`, 'aria-label': `${c.title}${state === 'locked' ? ' (locked)' : ''}` });
    place(el, x - R, y - R, R * 2, R * 2);

    let inner: string;
    if (c.kind === 'horcrux') {
      inner = done ? horcruxArt[c.reward]() : crop(characters[c.host]());
    } else if (c.kind === 'battle') {
      inner = crop(characters.voldemort());
    } else {
      inner = crop(characters[c.host]());
    }
    el.innerHTML = `<div class="halo"></div><div class="medal" style="--book:${this.book.color}"><div class="face">${inner}</div></div>
      ${isCur ? `<div class="go">${waxSeal('play', C.red, 76, 'go-' + c.id)}</div>` : ''}
      ${done ? '<div class="badge tick">✓</div>' : ''}${state === 'locked' ? '<div class="badge lock"></div>' : ''}
      <div class="stop-label">${c.title}</div>`;

    this.tap(el, () => {
      if (state === 'locked') {
        sfx.wrong();
        void wobble(el);
        return;
      }
      sfx.tap();
      void voice.say(c.title);
      this.app.nav.chapter(c.id);
    });
    if (isCur) this.onCleanup(breathe(el.querySelector('.medal')!, 0.05, 1.6));
    return el;
  }
}

function trail(pts: Pt[], seed: number): string {
  const steps: ReturnType<typeof piece>[] = [];
  const r = rng(seed * 77);
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, ay] = pts[i];
    const [bx, by] = pts[i + 1];
    const n = 9;
    for (let k = 1; k < n; k++) {
      const t = k / n;
      const x = ax + (bx - ax) * t;
      const y = ay + (by - ay) * t + Math.sin(t * Math.PI) * (i % 2 ? 40 : -40);
      const ang = (Math.atan2(by - ay, bx - ax) * 180) / Math.PI + 90;
      const side = k % 2 ? 7 : -7;
      steps.push(piece(ellipse(x + side, y, 5, 9, ang + (r() - 0.5) * 10), C.ink, { edge: 'cut', fibre: false, shadow: false, opacity: 0.55 }));
    }
  }
  return svg({ w: 1180, h: 820, name: 'trail' + seed, boil: false }, steps);
}

/** Faint ink doodles that make the page feel like a magical map. */
function mapDoodles(book: Book): string {
  const s = hashString(book.id);
  const r = rng(s);
  const nodes = [];
  // compass rose
  nodes.push(ink([[1060, 210], [1060, 330]], { width: 2, color: C.brown, opacity: 0.35 }));
  nodes.push(ink([[1000, 270], [1120, 270]], { width: 2, color: C.brown, opacity: 0.35 }));
  nodes.push(ink([[1060, 200], [1072, 270], [1060, 340], [1048, 270], [1060, 200]], { width: 2, color: C.brown, opacity: 0.35 }));
  // corridors
  for (let i = 0; i < 6; i++) {
    const x = 60 + r() * 1000;
    const y = 140 + r() * 600;
    const w = 80 + r() * 160;
    nodes.push(ink([[x, y], [x + w, y], [x + w, y + 60]], { width: 2, color: C.brown, opacity: 0.18 }));
  }
  return svg({ w: 1180, h: 820, name: 'doodle' + book.id, boil: false }, nodes);
}

