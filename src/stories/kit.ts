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
import { fx, musicBed, type Mood, type MusicBed } from '../audio/synth';
import { voice } from '../audio/voice';
import { characters } from '../art/characters';
import { hedwig } from '../art/characters/hedwig';
import { horcruxArt } from '../art/horcruxes';
import { C } from '../art/palette';
import { circle, curve, piece, rng, svg, type Pt } from '../art/paper';
import { picture } from '../art/pictures';
import { parchment, star } from '../art/ui';
import { HOST_NAMES } from '../core/names';
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
  /**
   * The story's world: the 1180 × 820 layer the backdrop and actors live in.
   * The camera moves and zooms it; captions and the scene-cut sheet sit
   * above it, on the stage.
   */
  readonly root: HTMLElement;
  /** The outer stage (captions, overlays). */
  readonly stage: HTMLElement;
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
  private captionLine: HTMLElement;
  private tag: HTMLElement;
  private bed: MusicBed | null = null;

  constructor(o: { root: HTMLElement; book: Book; chapter: Chapter; hero: Avatar; name: string; lines: Record<string, Line>; alive: () => boolean }) {
    this.stage = o.root;
    this.root = h('div', { class: 'story-world' });
    this.stage.append(this.root);
    this.book = o.book;
    this.chapter = o.chapter;
    this.hero = o.hero;
    this.name = o.name;
    this.lines = o.lines;
    this.alive = o.alive;
    this.calm = isCalm();
    this.captionEl = place(h('div', { class: 'story-caption', 'aria-live': 'polite' }), 150, 690, 880, 110);
    const box = h('div', { class: 'story-caption-text' });
    this.tag = h('div', { class: 'story-tag', style: `background:${o.book.color}` });
    this.captionLine = h('span');
    box.append(this.tag, this.captionLine);
    this.captionEl.append(box);
    this.stage.append(this.captionEl);
  }

  /** Stops the music. Called by the story scene when the show ends. */
  dispose(): void {
    this.bed?.stop();
    this.bed = null;
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
    this.root.append(el);
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
    this.caption(text, line.who);
    const stopBob = speaker ? this.talk(speaker) : () => {};
    this.bed?.duck(true);
    // A stuck clip must never stall the show.
    await Promise.race([voice.say(line.text), wait(1500 + text.length * 110)]);
    this.bed?.duck(false);
    stopBob();
    await this.wait(250);
  }

  /**
   * Shows a caption without speech ('' hides it). With `who` (a character
   * id), a name tag with their little portrait sits on the caption.
   */
  caption(text: string, who?: string): void {
    if (!text) {
      this.captionEl.classList.remove('on');
      return;
    }
    this.captionLine.textContent = text;
    const id = who === 'hero' ? this.hero : who;
    const name = id && id !== 'narrator' ? HOST_NAMES[id] : undefined;
    this.tag.hidden = !name;
    if (name && this.tag.dataset.who !== id) {
      this.tag.dataset.who = id;
      const art = characters[id!]?.() ?? '';
      // Just the face, in a little round frame.
      this.tag.innerHTML = `<span class="story-chip">${art.replace(/viewBox="[^"]*"/, 'viewBox="78 62 144 144"')}</span><span>${name}</span>`;
    }
    this.captionEl.classList.toggle('narrator', !name);
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
    for (const dx of [amount, -amount, amount * 0.6, -amount * 0.6]) await this.to(this.root, 0.06, { x: `+=${dx}`, ease: 'none' });
  }

  // -------------------------------------------------------------- particles

  /** A burst of paper stars at a point. */
  sparkle(x: number, y: number, count = 14, spread = 160): void {
    if (this.calm || !this.alive()) return;
    for (let i = 0; i < count; i++) {
      const p = place(h('div', { class: 'particle', html: star(true, `story${i % 3}`) }), x, y);
      p.style.zIndex = '50';
      this.root.append(p);
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
      this.root.append(p);
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
    this.stage.insertBefore(el, this.captionEl);
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
    this.root.append(el);
    gsap.set(el, { rotation: ang, transformOrigin: '0% 50%', scaleX: 0 });
    await this.to(el, seconds, { scaleX: 1, ease: 'power2.out' });
    this.sparkle(to[0], to[1], 10, 90);
    await this.to(el, 0.25, { opacity: 0, ease: 'none' });
    el.remove();
  }

  // ------------------------------------------------------------- atmosphere

  /**
   * Starts quiet background music in a mood (replacing any already
   * playing). It dips under every spoken line and fades out at the end.
   */
  music(mood: Mood): void {
    if (!this.alive()) return;
    this.bed?.stop();
    this.bed = musicBed(mood);
  }

  /** Stops the background music (it fades). */
  silence(): void {
    this.bed?.stop();
    this.bed = null;
  }

  /**
   * Fills the scene with slow, looping atmosphere: floating dust motes,
   * fireflies, snow, rain, bubbles, rising embers or twinkling stars.
   * In front of the actors unless `z` says otherwise. Skipped in calm mode.
   */
  ambient(kind: 'dust' | 'fireflies' | 'snow' | 'rain' | 'bubbles' | 'embers' | 'stars', o: { count?: number; z?: number; area?: [number, number, number, number] } = {}): void {
    if (this.calm || !this.alive()) return;
    const [ax, ay, aw, ah] = o.area ?? [0, 0, 1180, 690];
    const look = {
      dust: { size: [3, 6], color: C.goldLight, glow: 6, opacity: 0.55 },
      fireflies: { size: [5, 8], color: '#e9f59a', glow: 14, opacity: 0.9 },
      snow: { size: [4, 9], color: C.white, glow: 0, opacity: 0.85 },
      rain: { size: [2, 2], color: '#b9cde6', glow: 0, opacity: 0.4 },
      bubbles: { size: [7, 16], color: 'transparent', glow: 0, opacity: 0.7 },
      embers: { size: [3, 6], color: C.orange, glow: 10, opacity: 0.85 },
      stars: { size: [3, 6], color: C.cream, glow: 8, opacity: 0.8 },
    }[kind];
    const n = o.count ?? { dust: 26, fireflies: 14, snow: 40, rain: 60, bubbles: 18, embers: 22, stars: 30 }[kind];
    const d = (lo: number, hi: number) => lo + Math.random() * (hi - lo);
    for (let i = 0; i < n; i++) {
      const sz = d(look.size[0], look.size[1]);
      const x = ax + Math.random() * aw;
      const y = ay + Math.random() * ah;
      const style =
        kind === 'rain'
          ? `width:2px;height:24px;background:${look.color};transform:rotate(12deg)`
          : kind === 'bubbles'
            ? `width:${sz}px;height:${sz}px;border:2px solid rgba(255,255,255,0.75);border-radius:50%`
            : `width:${sz}px;height:${sz}px;border-radius:50%;background:${look.color};box-shadow:0 0 ${look.glow}px ${look.color}`;
      const p = place(h('div', { class: 'story-mote', style }), x, y);
      p.style.zIndex = String(o.z ?? 30);
      p.style.opacity = String(look.opacity * d(0.5, 1));
      this.root.append(p);
      if (kind === 'dust') {
        gsap.to(p, { x: d(-60, 60), y: d(-120, -40), duration: d(6, 11), yoyo: true, repeat: -1, ease: stepped(8, 'sine.inOut'), delay: -d(0, 8) });
      } else if (kind === 'fireflies') {
        gsap.to(p, { x: d(-90, 90), y: d(-70, 70), duration: d(4, 7), yoyo: true, repeat: -1, ease: stepped(6, 'sine.inOut') });
        gsap.to(p, { opacity: 0.15, duration: d(1.2, 2.2), yoyo: true, repeat: -1, ease: 'sine.inOut', delay: d(0, 2) });
      } else if (kind === 'stars') {
        gsap.to(p, { opacity: 0.15, scale: 0.6, duration: d(1.5, 3), yoyo: true, repeat: -1, ease: 'sine.inOut', delay: d(0, 3) });
      } else {
        // Falling or rising things wrap round from one edge of the area to the other.
        const up = kind === 'bubbles' || kind === 'embers';
        const dur = kind === 'rain' ? d(0.6, 0.9) : kind === 'snow' ? d(7, 12) : d(5, 9);
        const startY = up ? ay + ah - y + 20 : ay - y - 30;
        const endY = up ? ay - y - 30 : ay + ah - y + 20;
        gsap.fromTo(
          p,
          { y: startY, x: 0 },
          { y: endY, x: kind === 'rain' ? -40 : d(-50, 50), duration: dur, repeat: -1, ease: stepped(dur, 'none'), delay: -d(0, dur) },
        );
        if (kind === 'embers') gsap.to(p, { opacity: 0, duration: dur, repeat: -1, ease: 'none', delay: -d(0, dur) });
      }
    }
  }

  /**
   * A soft pool of light (a candle, a lamp, the moon, a glowing Horcrux).
   * `flicker` makes it breathe gently, never flash. Returns the light.
   */
  light(x: number, y: number, radius: number, o: { color?: string; strength?: number; flicker?: boolean; z?: number } = {}): HTMLElement {
    const color = o.color ?? C.candle;
    const strength = o.strength ?? 0.45;
    const el = place(
      h('div', { class: 'story-light', style: `background:radial-gradient(circle, ${color} 0%, transparent 70%)` }),
      x - radius,
      y - radius,
      radius * 2,
      radius * 2,
    );
    el.style.zIndex = String(o.z ?? 35);
    el.style.opacity = String(strength);
    this.root.append(el);
    if (o.flicker && !this.calm) {
      gsap.to(el, { opacity: strength * 0.7, scale: 0.96, duration: 0.9 + Math.random() * 0.6, yoyo: true, repeat: -1, ease: stepped(1, 'sine.inOut') });
    }
    return el;
  }

  /**
   * Darkens the scene for night or a gloomy place: a tinted veil over the
   * backdrop and actors, under any lights. Returns it (fade it to change the mood).
   */
  dim(amount = 0.35, color = '#0b1030'): HTMLElement {
    const el = place(h('div', { class: 'story-dim', style: `background:${color}` }), 0, 0, 1180, 820);
    el.style.zIndex = '33';
    el.style.opacity = String(amount);
    this.root.append(el);
    return el;
  }

  // ----------------------------------------------------------------- camera

  /**
   * Moves the camera: zooms in on a point of the world (zoom 1 = the whole
   * stage, 1.4 = a close-up), as a slow stop-motion push-in or pan. Edges
   * never show. `camera({})` goes back to the wide shot.
   */
  camera(o: { zoom?: number; x?: number; y?: number }, seconds = 1.4): Promise<void> {
    const z = Math.max(1, o.zoom ?? 1);
    const tx = Math.min(0, Math.max(1180 - 1180 * z, 590 - (o.x ?? 590) * z));
    const ty = Math.min(0, Math.max(820 - 820 * z, 410 - (o.y ?? 410) * z));
    const to = { x: tx, y: ty, scale: z, transformOrigin: '0 0' };
    if (this.calm) {
      this.set(this.root, to);
      return Promise.resolve();
    }
    return this.to(this.root, seconds, { ...to, ease: 'sine.inOut' });
  }

  // ------------------------------------------------------------------- cuts

  /** Removes every actor, light and particle and the backdrop, and resets the camera. */
  clear(): void {
    gsap.killTweensOf(this.root.querySelectorAll('*'));
    this.root.replaceChildren();
    this.set(this.root, { x: 0, y: 0, scale: 1 });
  }

  /**
   * Cuts to a new scene: a torn paper sheet sweeps across, the world is
   * cleared, `build` sets up the new scene underneath, and the sheet sweeps away.
   */
  async cut(build: () => void | Promise<void>): Promise<void> {
    if (!this.alive()) return never();
    this.caption('');
    const sheet = h('div', { class: 'story-wipe', html: parchment(1500, 1000, 'story-wipe', C.sand, 3) });
    this.stage.insertBefore(sheet, this.captionEl);
    sfx.page();
    this.set(sheet, { x: 1240, rotation: 3 });
    await this.to(sheet, 0.42, { x: -160, rotation: -1, ease: 'power2.in' });
    this.clear();
    await build();
    await this.to(sheet, 0.42, { x: -1700, rotation: -4, ease: 'power2.out' });
    sheet.remove();
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
