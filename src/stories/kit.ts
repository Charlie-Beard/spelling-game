/**
 * The story kit: everything a chapter's reward cutscene needs.
 *
 * A story is a short paper-puppet show (about 30 seconds) that plays after a
 * chapter is spelled. Each one lives in its own file (src/stories/b1c1.ts …)
 * and is written as a script:
 *
 *   export default defineStory({
 *     lines: {
 *       hello: { who: 'hagrid', text: 'Blimey, {name}! Look at that!' },
 *     },
 *     async play(k) {
 *       k.backdrop(myRoom());
 *       const hagrid = k.character('hagrid', { x: 700, y: 360 });
 *       await k.enter(hagrid, 'right');
 *       await k.say('hello', hagrid);
 *     },
 *   });
 *
 * Every line is listed up front so scripts/voice/export.ts can send it to be
 * recorded; until it is, the iPad's own voice reads it. `{name}` is filled in
 * with the child's name.
 *
 * Movement is stop-motion (12 fps, see ui/anim.ts) and follows calm mode:
 * motion is shortened and particles are skipped. Nothing flashes.
 */
import { gsap } from 'gsap';
import { sfx } from '../audio/sfx';
import { fx } from '../audio/synth';
import { voice } from '../audio/voice';
import { characters } from '../art/characters';
import { hedwig } from '../art/characters/hedwig';
import { horcruxArt } from '../art/horcruxes';
import { C } from '../art/palette';
import { circle, curve, piece, rng, svg, type Pt } from '../art/paper';
import { picture } from '../art/pictures';
import { star } from '../art/ui';
import type { Avatar, Book, Chapter } from '../core/curriculum';
import { personalise } from '../core/phrases';
import { isCalm, stepped } from '../ui/anim';
import { h, place, wait } from '../ui/dom';

export interface Line {
  /**
   * Who says it: 'narrator' or a character id with a voice in
   * scripts/voice/elevenlabs.json (hagrid, dobby, voldemort …).
   */
  who: string;
  /** What they say. Short and simple: a 6-year-old is listening. */
  text: string;
}

export interface StoryDef<K extends string> {
  /** Every spoken line in the story, by key. */
  lines: Record<K, Line>;
  /** Runs the show. Resolves when the story has finished. */
  play(k: Kit<K>): Promise<void>;
}

export type Story = StoryDef<string>;

export const defineStory = <K extends string>(s: StoryDef<K>): StoryDef<K> => s;

export type Side = 'left' | 'right' | 'top' | 'bottom';

export interface PlaceOpts {
  /** Top-left corner on the 1180 × 820 stage. */
  x: number;
  y: number;
  /** Size on stage. Defaults to the art's natural size (portraits 300 × 340). */
  w?: number;
  h?: number;
  /** Stacking order: higher is in front. Default 10. */
  z?: number;
  /** Mirror left-to-right (to face the other way). */
  flip?: boolean;
  /** Shows only part of the art: an SVG viewBox "x y w h". */
  crop?: string;
  /** Freezes the paper boil (for big props that shouldn't jitter). */
  still?: boolean;
}

/**
 * The stage and its tools, handed to a story's `play`.
 *
 * Actors are absolutely placed <div>s. Animate the actor itself freely
 * (x, y, rotation, scale, opacity); mirroring is done on an inner wrapper
 * so it never fights a tween.
 */
export class Kit<K extends string = string> {
  /** The 1180 × 820 story stage. */
  readonly root: HTMLElement;
  readonly book: Book;
  readonly chapter: Chapter;
  /** The child's character: 'harry', 'ron' or 'hermione'. */
  readonly hero: Avatar;
  /** The child's name ('' if none). */
  readonly name: string;
  /** Calm mode is on: keep movement small and skip particles. */
  readonly calm: boolean;
  /** Ready-made sound effects (game sounds and story sounds). */
  readonly sfx = sfx;
  readonly fx = fx;

  private lines: Record<string, Line>;
  private alive: () => boolean;
  private captionEl: HTMLElement;
  private captionText: HTMLElement;

  constructor(o: { root: HTMLElement; book: Book; chapter: Chapter; hero: Avatar; name: string; lines: Record<string, Line>; alive: () => boolean }) {
    this.root = o.root;
    this.book = o.book;
    this.chapter = o.chapter;
    this.hero = o.hero;
    this.name = o.name;
    this.lines = o.lines;
    this.alive = o.alive;
    this.calm = isCalm();
    this.captionEl = place(h('div', { class: 'story-caption', 'aria-live': 'polite' }), 150, 690, 880, 110);
    this.captionText = h('div', { class: 'story-caption-text' });
    this.captionEl.append(this.captionText);
    this.root.append(this.captionEl);
  }

  // ---------------------------------------------------------------- building

  /** Sets the full-stage background (an SVG string, 1180 × 820). Replaces any previous one. */
  backdrop(art: string): HTMLElement {
    this.root.querySelector(':scope > .story-backdrop')?.remove();
    const el = h('div', { class: 'story-backdrop', html: art });
    this.root.prepend(el);
    return el;
  }

  /** Puts any art (an SVG or HTML string) on stage as an actor. */
  add(art: string, o: PlaceOpts): HTMLElement {
    const html = o.crop ? art.replace(/viewBox="[^"]*"/, `viewBox="${o.crop}"`) : art;
    const natural = /viewBox="[\d.-]+ [\d.-]+ ([\d.]+) ([\d.]+)"/.exec(html);
    const w = o.w ?? (natural ? +natural[1] : 300);
    const hh = o.h ?? (natural ? (+natural[2] / +natural[1]) * w : 300);
    const el = place(h('div', { class: `story-actor${o.still ? ' still' : ''}` }), o.x, o.y, w, hh);
    el.style.zIndex = String(o.z ?? 10);
    const inner = h('div', { class: 'story-flip', html });
    if (o.flip) inner.style.transform = 'scaleX(-1)';
    el.append(inner);
    this.root.insertBefore(el, this.captionEl);
    return el;
  }

  /**
   * A character portrait (300 × 340, head and shoulders) by id: any key of
   * art/characters (hagrid, dobby, voldemort …), 'hero' for the child's
   * character, or 'hedwig'.
   */
  character(id: string, o: PlaceOpts): HTMLElement {
    const art = id === 'hero' ? characters[this.hero]() : id === 'hedwig' ? hedwig('story-hedwig') : characters[id]?.();
    if (!art) throw new Error(`No character "${id}"`);
    const el = this.add(art, { w: 260, ...o });
    el.dataset.who = id === 'hero' ? this.hero : id;
    return el;
  }

  /** A word's picture (400 × 400): any word in the game, e.g. this chapter's words. */
  picture(word: string, o: PlaceOpts): HTMLElement {
    return this.add(picture(word), { w: 200, ...o });
  }

  /** A Horcrux (300 × 300): ring, diary, locket, cup, diadem, nagini. */
  horcrux(id: string, o: PlaceOpts): HTMLElement {
    return this.add(horcruxArt[id](), { w: 200, ...o });
  }

  /** Changes an actor's mirroring. */
  face(el: HTMLElement, flip: boolean): void {
    const inner = el.querySelector<HTMLElement>(':scope > .story-flip');
    if (inner) inner.style.transform = flip ? 'scaleX(-1)' : '';
  }

  /** Removes an actor. */
  remove(el: HTMLElement): void {
    gsap.killTweensOf(el);
    el.remove();
  }

  // ------------------------------------------------------------------- time

  /** Waits. If the story is skipped, never resolves (the script just stops). */
  wait(ms: number): Promise<void> {
    if (!this.alive()) return never();
    return wait(ms).then(() => (this.alive() ? undefined : never()));
  }

  /** Runs things at the same time and waits for all of them. */
  all(...steps: Promise<unknown>[]): Promise<void> {
    return Promise.all(steps).then(() => (this.alive() ? undefined : never()));
  }

  // ----------------------------------------------------------------- speech

  /**
   * Says a line (by key) with a caption, and makes the speaker bob while
   * talking. Resolves when it has been said.
   */
  async say(key: K, speaker?: HTMLElement): Promise<void> {
    if (!this.alive()) return never();
    const line = this.lines[key];
    if (!line) throw new Error(`No line "${key}"`);
    const text = personalise(line.text, this.name);
    this.caption(text);
    const stopBob = speaker ? this.talk(speaker) : () => {};
    // A stuck clip must never stall the show.
    await Promise.race([voice.say(line.text), wait(1500 + text.length * 110)]);
    stopBob();
    await this.wait(250);
  }

  /** Shows a caption without speech ('' hides it). */
  caption(text: string): void {
    if (!text) {
      this.captionEl.classList.remove('on');
      return;
    }
    this.captionText.textContent = text;
    this.captionEl.classList.add('on');
  }

  /** Makes an actor bob as if talking, until the returned stopper is called. */
  talk(el: HTMLElement): () => void {
    if (this.calm) return () => {};
    const tw = gsap.to(el, { y: '-=6', rotation: '+=2', duration: 0.17, yoyo: true, repeat: -1, ease: 'steps(1)' });
    return () => {
      tw.progress(0).kill();
    };
  }

  // ----------------------------------------------------------------- motion

  /** A stop-motion tween (12 fps). Resolves when it ends. */
  to(el: gsap.TweenTarget, seconds: number, vars: gsap.TweenVars & { ease?: string }): Promise<void> {
    if (!this.alive()) return never();
    const d = this.calm ? Math.min(seconds, 0.3) : seconds;
    return new Promise((resolve) => {
      // Also carry on if the tween is killed early (its actor removed, or overwritten).
      const done = () => this.alive() && resolve();
      gsap.to(el, { ...vars, duration: d, ease: stepped(d, vars.ease ?? 'power2.inOut'), onComplete: done, onInterrupt: done });
    });
  }

  /** Sets properties instantly. */
  set(el: gsap.TweenTarget, vars: gsap.TweenVars): void {
    gsap.set(el, vars);
  }

  /** Slides an actor in from off stage to where it was placed. */
  enter(el: HTMLElement, from: Side, seconds = 0.7): Promise<void> {
    this.set(el, { ...offstage(el, from), opacity: 1 });
    return this.to(el, seconds, { x: 0, y: 0, ease: 'back.out(1.2)' });
  }

  /** Slides an actor off stage. */
  exit(el: HTMLElement, to: Side, seconds = 0.6): Promise<void> {
    return this.to(el, seconds, { ...offstage(el, to), ease: 'power2.in' });
  }

  /** Moves an actor (relative to where it was placed) along a little hopping path. */
  async walk(el: HTMLElement, dx: number, seconds = 1, hops = 4): Promise<void> {
    if (this.calm) return this.to(el, seconds, { x: `+=${dx}` });
    const each = seconds / hops;
    for (let i = 0; i < hops; i++) {
      await this.all(
        this.to(el, each, { x: `+=${dx / hops}`, ease: 'none' }),
        this.to(el, each / 2, { y: '-=14', ease: 'power1.out' }).then(() => this.to(el, each / 2, { y: '+=14', ease: 'power1.in' })),
      );
    }
  }

  /** A happy jump (or several). */
  async hop(el: HTMLElement, height = 50, times = 1): Promise<void> {
    if (this.calm) height = Math.min(height, 12);
    for (let i = 0; i < times; i++) {
      await this.to(el, 0.22, { y: `-=${height}`, ease: 'power2.out' });
      await this.to(el, 0.22, { y: `+=${height}`, ease: 'power2.in' });
    }
  }

  /** A quick wobble from side to side (surprise, fear, laughing). */
  async shake(el: HTMLElement, amount = 10, times = 3): Promise<void> {
    if (this.calm) amount = Math.min(amount, 3);
    for (let i = 0; i < times; i++) {
      await this.to(el, 0.08, { x: `+=${amount}`, rotation: '+=3', ease: 'none' });
      await this.to(el, 0.08, { x: `-=${amount * 2}`, rotation: '-=6', ease: 'none' });
      await this.to(el, 0.08, { x: `+=${amount}`, rotation: '+=3', ease: 'none' });
    }
  }

  /** Spins an actor a number of whole turns. */
  spin(el: HTMLElement, turns = 1, seconds = 0.8): Promise<void> {
    return this.to(el, seconds, { rotation: `+=${360 * turns}`, ease: 'power1.inOut' });
  }

  /** A squash-and-stretch pop (something lands or appears). */
  async pop(el: HTMLElement, amount = 1.15): Promise<void> {
    await this.to(el, 0.1, { scale: amount, ease: 'power1.out' });
    await this.to(el, 0.25, { scale: 1, ease: 'back.out(3)' });
  }

  /** Grows an actor in from nothing. */
  appear(el: HTMLElement, seconds = 0.4): Promise<void> {
    this.set(el, { scale: 0, opacity: 1 });
    return this.to(el, seconds, { scale: 1, ease: 'back.out(1.8)' });
  }

  /** Shrinks an actor to nothing and removes it. */
  async vanish(el: HTMLElement, seconds = 0.35): Promise<void> {
    await this.to(el, seconds, { scale: 0, opacity: 0, ease: 'back.in(1.6)' });
    el.remove();
  }

  /** Fades an actor in or out. */
  fade(el: HTMLElement, to: number, seconds = 0.5): Promise<void> {
    return this.to(el, seconds, { opacity: to, ease: 'none' });
  }

  /** Floats an actor gently up and down until the story ends (idle life). */
  float(el: HTMLElement, amount = 8, period = 2): void {
    if (this.calm) return;
    gsap.to(el, { y: `-=${amount}`, duration: period / 2, yoyo: true, repeat: -1, ease: stepped(period / 2, 'sine.inOut') });
  }

  /** Shakes the whole stage (a big stomp or crash). Gentle and short. */
  async quake(amount = 8): Promise<void> {
    if (this.calm) return;
    const els = [...this.root.children].filter((c) => c !== this.captionEl);
    for (const dx of [amount, -amount, amount * 0.6, -amount * 0.6, 0]) await this.to(els, 0.06, { x: `+=${dx}`, ease: 'none' });
  }

  // -------------------------------------------------------------- particles

  /** A burst of paper stars at a point. */
  sparkle(x: number, y: number, count = 14, spread = 160): void {
    if (this.calm || !this.alive()) return;
    for (let i = 0; i < count; i++) {
      const p = place(h('div', { class: 'particle', html: star(true, `story${i % 3}`) }), x, y);
      p.style.zIndex = '50';
      this.root.insertBefore(p, this.captionEl);
      const a = Math.random() * Math.PI * 2;
      const r = spread * (0.4 + Math.random() * 0.6);
      gsap.to(p, {
        x: Math.cos(a) * r,
        y: Math.sin(a) * r + 40,
        rotation: Math.random() * 360,
        scale: 0.4,
        opacity: 0,
        duration: 0.9 + Math.random() * 0.5,
        ease: stepped(1.2, 'power2.out'),
        onComplete: () => p.remove(),
      });
    }
  }

  /** A puff of paper smoke at a point (appearing, disappearing, crashes). */
  puff(x: number, y: number, size = 160, color: string = C.stoneLight): void {
    if (!this.alive()) return;
    const el = this.add(cloud(color), { x: x - size / 2, y: y - size / 2, w: size, h: size, z: 40 });
    gsap.set(el, { scale: 0.3, opacity: 0.95 });
    const d = this.calm ? 0.3 : 0.9;
    gsap.to(el, { scale: 1.3, opacity: 0, rotation: 20, duration: d, ease: stepped(d, 'power2.out'), onComplete: () => el.remove() });
  }

  /** Confetti falling from the top (the big happy ending). */
  confetti(count = 30): void {
    if (this.calm || !this.alive()) return;
    const colors = [C.gold, C.red, C.blue, C.green, C.goldLight, C.pink];
    for (let i = 0; i < count; i++) {
      const c = colors[i % colors.length];
      const p = place(h('div', { class: 'story-confetti', style: `background:${c}` }), 100 + Math.random() * 980, -30);
      p.style.zIndex = '55';
      this.root.insertBefore(p, this.captionEl);
      const d = 2.2 + Math.random() * 1.2;
      gsap.to(p, {
        y: 900,
        x: (Math.random() - 0.5) * 260,
        rotation: Math.random() * 720,
        duration: d,
        delay: Math.random() * 0.8,
        ease: stepped(d, 'power1.in'),
        onComplete: () => p.remove(),
      });
    }
  }

  /**
   * A soft wash of colour over the whole stage that fades in and out (a
   * spell's light, a door opening). Never a strobe.
   */
  async glow(color: string = C.candle, strength = 0.5, seconds = 0.8): Promise<void> {
    const el = place(h('div', { class: 'story-wash', style: `background:${color}` }), 0, 0, 1180, 820);
    this.root.insertBefore(el, this.captionEl);
    gsap.set(el, { opacity: 0 });
    await this.to(el, seconds / 2, { opacity: this.calm ? strength / 2 : strength, ease: 'sine.out' });
    await this.to(el, seconds / 2, { opacity: 0, ease: 'sine.in' });
    el.remove();
  }

  /** A magic beam from one point to another (a spell being cast). */
  async beam(from: Pt, to: Pt, color: string = C.goldLight, seconds = 0.35): Promise<void> {
    const len = Math.hypot(to[0] - from[0], to[1] - from[1]);
    const ang = (Math.atan2(to[1] - from[1], to[0] - from[0]) * 180) / Math.PI;
    const el = place(h('div', { class: 'story-beam', style: `background:${color};box-shadow:0 0 18px ${color}` }), from[0], from[1] - 7, len, 14);
    el.style.zIndex = '45';
    this.root.insertBefore(el, this.captionEl);
    gsap.set(el, { rotation: ang, transformOrigin: '0% 50%', scaleX: 0 });
    await this.to(el, seconds, { scaleX: 1, ease: 'power2.out' });
    this.sparkle(to[0], to[1], 10, 90);
    await this.to(el, 0.25, { opacity: 0, ease: 'none' });
    el.remove();
  }
}

/** A promise that never settles: a skipped story's script stops here. */
const never = (): Promise<never> => new Promise(() => {});

/** Where an actor goes to be just off one side of the stage, as x/y offsets. */
function offstage(el: HTMLElement, side: Side): { x?: number; y?: number } {
  const left = parseFloat(el.style.left) || 0;
  const top = parseFloat(el.style.top) || 0;
  const w = el.offsetWidth || parseFloat(el.style.width) || 300;
  const hh = el.offsetHeight || parseFloat(el.style.height) || 300;
  if (side === 'left') return { x: -(left + w + 40), y: 0 };
  if (side === 'right') return { x: 1180 - left + 40, y: 0 };
  if (side === 'top') return { y: -(top + hh + 40), x: 0 };
  return { y: 820 - top + 40, x: 0 };
}

/** A lumpy paper cloud (smoke puffs). */
export function cloud(color: string, seed = 'puff'): string {
  const r = rng(seed.length * 977);
  const pts: Pt[] = [];
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const rr = 34 + r() * 14;
    pts.push([100 + Math.cos(a) * rr, 100 + Math.sin(a) * rr]);
  }
  return svg({ w: 200, h: 200, name: 'cloud-' + seed + color, boil: false }, [
    piece(curve(pts, 2), color, { rough: 1.5 }),
    piece(circle(78, 88, 30), color, { shadow: false }),
    piece(circle(124, 84, 34), color, { shadow: false }),
    piece(circle(100, 118, 32), color, { shadow: false }),
  ]);
}

/** Re-exports so stories can draw their own scenery and props. */
export { C } from '../art/palette';
export { band, circle, curve, dot, ellipse, group, ink, piece, poly, raw, rect, rng, svg, type Node, type Pt } from '../art/paper';
export { bell, noiseBurst, NOTE, now, tone, tune } from '../audio/synth';
