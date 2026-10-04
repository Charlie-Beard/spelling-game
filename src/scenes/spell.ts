/**
 * The spelling screen: one word at a time.
 *
 *   picture (tap to hear)      slots, one per sound
 *   [hear]        letter tiles along the bottom          [Hedwig]
 *
 * Only the right tile is accepted; help steps up on repeated tries, and
 * Hedwig places the tile after the third try. Background motion is frozen
 * (.still) while the child is concentrating.
 */
import { gsap } from 'gsap';
import { sfx } from '../audio/sfx';
import { voice } from '../audio/voice';
import { hedwig } from '../art/characters/hedwig';
import { C } from '../art/palette';
import { hashString, rng } from '../art/paper';
import { picture } from '../art/pictures';
import { nightSky } from '../art/scenery';
import { gem, glowBlob, parchment, slotHole, star, tileCard, waxSeal } from '../art/ui';
import type { Book, Chapter } from '../core/curriculum';
import type { Word } from '../core/phonics';
import { PHRASES, PRAISE } from '../core/phrases';
import { distractorCount } from '../core/progress';
import { pickDistractors, Round, type RoundResult, type Tile } from '../core/round';
import { isCalm, pop, sm, stepped, wobble } from '../ui/anim';
import { h, place, wait } from '../ui/dom';
import { Scene, type App } from '../ui/scene';

export interface SpellOptions {
  book: Book;
  chapter: Chapter;
  words: Word[];
  onDone: (results: RoundResult[]) => void;
  onQuit: () => void;
}

// Layout (stage coordinates)
const PANEL = { x: 24, y: 96, w: 1132, h: 700 };
const PIC = { x: 78, y: 128, s: 360 };
const SLOTS = { cx: 800, cy: 300, maxW: 600, gap: 16 };
const TRAY = { cx: 585, cy: 638, maxW: 770, gap: 22 };
const MAX_U = 124;

const widthFactor = (g: string) => 1 + 0.4 * (g.length - 1);

interface TileView {
  tile: Tile;
  el: HTMLButtonElement;
  x: number;
  y: number;
  w: number;
}

/** Races a promise against a timeout so a stuck clip never stalls play. */
const capped = (p: Promise<void>, ms: number) => Promise.race([p, wait(ms)]);

export class SpellScene extends Scene {
  private o: SpellOptions;
  private layer!: HTMLElement;
  private card!: HTMLButtonElement;
  private cardArt!: HTMLElement;
  private owl!: HTMLButtonElement;
  private hearBtn!: HTMLButtonElement;
  private starsEl!: HTMLElement;
  private gemsEl!: HTMLElement;
  private gemCount!: HTMLElement;

  private index = 0;
  private round!: Round;
  private tiles: TileView[] = [];
  private slotEls: HTMLElement[] = [];
  private soundBtns: HTMLElement[][] = [];
  private arcs: HTMLElement[] = [];
  private u = MAX_U;
  private busy = true;
  private results: RoundResult[] = [];
  private idleTimer: ReturnType<typeof setTimeout> | null = null;
  private idleCount = 0;
  private praiseBag: string[] = [];
  private seed = Date.now();

  constructor(app: App, o: SpellOptions) {
    super(app, 'spell still');
    this.o = o;
  }

  build(): void {
    const r = this.root;
    r.append(h('div', { class: 'bg', html: nightSky('spell-sky') }));
    r.append(place(h('div', { html: parchment(PANEL.w, PANEL.h, 'spell-desk', C.cream) }), PANEL.x, PANEL.y, PANEL.w, PANEL.h));

    // Top bar
    const mapBtn = place(h('button', { class: 'seal-btn', 'aria-label': 'Back to the map', html: waxSeal('map', C.slate, 64) }), 30, 20, 64, 64);
    this.tap(mapBtn as HTMLElement, () => {
      sfx.tap();
      this.stopIdle();
      voice.stop();
      this.o.onQuit();
    });
    r.append(mapBtn);

    this.starsEl = h('div', { class: 'progress-stars' });
    const n = this.o.words.length;
    for (let i = 0; i < n; i++) this.starsEl.append(h('div', { class: 's', html: star(false, `p${i}`) }));
    place(this.starsEl, 590 - (n * 54 + (n - 1) * 10) / 2, 22);
    r.append(this.starsEl);

    this.gemsEl = place(h('div', { class: 'gem-counter' }), 1040, 28);
    this.gemCount = h('span', {}, String(this.app.progress.gems));
    this.gemsEl.append(h('div', { class: 'g', html: gem('counter', C.red) }), this.gemCount);
    r.append(this.gemsEl);

    // Picture card
    this.card = h('button', { class: 'picture-card', 'aria-label': 'Hear the word' });
    place(this.card, PIC.x, PIC.y, PIC.s, PIC.s);
    this.cardArt = h('div', { class: 'art' });
    this.card.append(
      h('div', { html: tileCard(PIC.s, PIC.s, 77, C.white) }).firstElementChild as Element,
      this.cardArt,
      h('div', { class: 'ear', html: waxSeal('speaker', C.red, 70, 'card-ear') }),
    );
    this.tap(this.card, () => this.hear());
    r.append(this.card);

    // Hear button (left thumb)
    this.hearBtn = place(
      h('button', { class: 'seal-btn', 'aria-label': 'Hear the word again', html: waxSeal('speaker', C.red, 120, 'hear') }),
      44,
      574,
      120,
      120,
    ) as HTMLButtonElement;
    this.tap(this.hearBtn, () => this.hear());
    r.append(this.hearBtn);

    // Hedwig (right thumb)
    this.owl = place(h('button', { class: 'hedwig-btn', 'aria-label': 'Ask Hedwig for help', html: hedwig() }), 984, 548, 180, 180) as HTMLButtonElement;
    this.tap(this.owl, () => this.askHedwig());
    r.append(this.owl);

    this.layer = h('div', { class: 'word-layer' });
    r.append(this.layer);
    this.startBlinking();
  }

  async enter(): Promise<void> {
    void voice.preload({
      words: this.o.words.map((w) => w.text),
      ph: [...new Set(this.o.words.flatMap((w) => w.units.map((u) => u.ph)))],
      lines: [PHRASES.canYouSpell, ...PRAISE],
    });
    await this.startWord(0);
  }

  leave(): void {
    this.stopIdle();
    voice.stop();
  }

  // -------------------------------------------------------------------------
  // Word lifecycle
  // -------------------------------------------------------------------------

  private async startWord(i: number): Promise<void> {
    this.index = i;
    const word = this.o.words[i];
    const p = this.app.progress;
    const firstOfBook = this.o.chapter.n === 1;
    const count = distractorCount(p.difficulty, word.units.length, firstOfBook);
    const rand = rng(this.seed + i * 999);
    const distractors = pickDistractors(word, this.o.book.pool, count, rand, p.difficulty < 2);
    this.round = new Round(word, distractors, rand);
    this.busy = true;

    // New picture: flip the card.
    if (i > 0) await sm(this.card, 0.2, { scaleX: 0, ease: 'power1.in' });
    this.cardArt.innerHTML = picture(word.text);
    if (i > 0) await sm(this.card, 0.25, { scaleX: 1, ease: 'back.out(2)' });
    else {
      gsap.set(this.card, { transformOrigin: '50% 50%' });
      await sm(this.card, 0.4, { startAt: { scale: 0.6, rotation: -6, opacity: 0 }, scale: 1, rotation: 0, opacity: 1, ease: 'back.out(1.7)' });
    }

    this.layoutWord();

    // Slots and tiles arrive.
    this.slotEls.forEach((el, k) => void sm(el, 0.3, { startAt: { opacity: 0, y: -16 }, opacity: 1, y: 0, delay: k * 0.05 }));
    await Promise.all(
      this.tiles.map((t, k) => sm(t.el, 0.35, { startAt: { y: 120, opacity: 0, rotation: (k % 2 ? 6 : -6) }, y: 0, opacity: 1, rotation: 0, delay: 0.1 + k * 0.06, ease: 'back.out(1.6)' })),
    );
    if (!this.alive) return;

    if (i === 0) await capped(voice.say(PHRASES.canYouSpell), 2500);
    if (!this.alive) return;
    this.busy = false;
    this.updateTarget();
    await this.hear(false);
    this.resetIdle();
  }

  private layoutWord(): void {
    this.layer.innerHTML = '';
    this.tiles = [];
    this.slotEls = [];
    this.soundBtns = [];
    this.arcs = [];
    const units = this.round.word.units;
    const tiles = this.round.tiles;

    const slotFactor = units.reduce((s, u) => s + widthFactor(u.g), 0);
    const trayFactor = tiles.reduce((s, t) => s + widthFactor(t.g), 0);
    this.u = Math.floor(
      Math.min(
        MAX_U,
        (SLOTS.maxW - SLOTS.gap * (units.length - 1)) / slotFactor,
        (TRAY.maxW - TRAY.gap * (tiles.length - 1)) / trayFactor,
      ),
    );
    const u = this.u;
    const th = Math.round(u * 1.08);
    const font = Math.round(u * 0.62);

    // Slots
    const slotW = units.map((x) => Math.round(u * widthFactor(x.g)));
    const slotsTotal = slotW.reduce((a, b) => a + b, 0) + SLOTS.gap * (units.length - 1);
    let x = SLOTS.cx - slotsTotal / 2;
    const slotTop = SLOTS.cy - th / 2;
    units.forEach((unit, k) => {
      const w = slotW[k];
      const el = place(h('div', { class: 'slot', html: slotHole(w, th, hashString(unit.g) + k) }), x, slotTop, w, th);
      el.dataset.x = String(x);
      this.layer.append(el);
      this.slotEls.push(el);

      // Sound buttons: a dot per single letter, a dash per digraph.
      const btnW = unit.g.length > 1 ? Math.min(w * 0.7, 80) : 16;
      const btn = place(h('div', { class: 'sound-btn' }), x + w / 2 - btnW / 2, slotTop + th + 30, btnW, 14);
      if (unit.link !== undefined) btn.style.width = '16px';
      this.layer.append(btn);
      this.soundBtns.push([btn]);
      x += w + SLOTS.gap;
    });

    // Split digraph arcs
    units.forEach((unit, k) => {
      if (unit.link === undefined || unit.link < k) return;
      const a = this.slotEls[k];
      const b = this.slotEls[unit.link];
      const ax = parseFloat(a.dataset.x!) + parseFloat(a.style.width) / 2;
      const bx = parseFloat(b.dataset.x!) + parseFloat(b.style.width) / 2;
      const y = slotTop + th + 44;
      const arc = place(
        h('div', {
          class: 'split-arc',
          html: `<svg width="${bx - ax + 20}" height="40" viewBox="${-10} 0 ${bx - ax + 20} 40"><path d="M0 2 Q ${(bx - ax) / 2} 46 ${bx - ax} 2" fill="none" stroke="rgba(74,54,38,0.45)" stroke-width="6" stroke-linecap="round"/></svg>`,
        }),
        ax - 10,
        y - 6,
      );
      this.layer.append(arc);
      this.arcs[k] = arc;
      this.arcs[unit.link] = arc;
    });

    // Tray
    const tileW = tiles.map((t) => Math.round(u * widthFactor(t.g)));
    const trayTotal = tileW.reduce((a, b) => a + b, 0) + TRAY.gap * (tiles.length - 1);
    x = TRAY.cx - trayTotal / 2;
    const trayTop = TRAY.cy - th / 2;
    tiles.forEach((tile, k) => {
      const w = tileW[k];
      const el = h('button', { class: 'tile', 'aria-label': `letters ${tile.g}` }) as HTMLButtonElement;
      el.innerHTML = `<div class="glow">${glowBlob()}</div>${tileCard(w, th, hashString(tile.g) * 31 + k * 7 + this.index, '#fffaf0')}<span class="glyph" style="font-size:${font}px">${tile.g}</span>`;
      place(el, x, trayTop, w, th);
      // Tiles sit at slightly different angles, like cards dropped on a desk.
      gsap.set(el, { rotation: ((hashString(tile.g + k) % 7) - 3) * 0.8 });
      const view: TileView = { tile, el, x, y: trayTop, w };
      this.tap(el, () => void this.onTile(view));
      this.layer.append(el);
      this.tiles.push(view);
      x += w + TRAY.gap;
    });
  }

  private updateTarget(): void {
    this.slotEls.forEach((el, k) => {
      el.classList.toggle('target', k === this.round.next);
      el.classList.toggle('done', k < this.round.next);
    });
  }

  // -------------------------------------------------------------------------
  // Interaction
  // -------------------------------------------------------------------------

  private async hear(tapped = true): Promise<void> {
    if (tapped) {
      sfx.tap();
      this.resetIdle();
    }
    void pop(this.card, 1.04);
    await capped(voice.word(this.round.word.text), 3000);
  }

  private async onTile(view: TileView): Promise<void> {
    if (this.busy || view.tile.state !== 'tray') return;
    this.resetIdle();
    const res = this.round.tap(view.tile.id);
    if (res.kind === 'ignored') return;

    sfx.lift();
    void voice.phoneme(view.tile.ph);

    if (res.kind === 'placed') {
      this.busy = true;
      await this.flyToSlot(view, res.slot);
      this.busy = false;
      if (res.complete) await this.celebrate();
      return;
    }

    // Wrong: a gentle wobble, then help steps up.
    this.busy = true;
    await wobble(view.el);
    sfx.wrong();
    await this.sleep(350);
    const target = this.round.target!;
    if (res.removed) await this.removeTile(res.removed);
    if (res.hint === 1 || res.hint === 2) {
      if (res.hint === 2) this.markGlow();
      void pop(this.slotEls[this.round.next], 1.08);
      await capped(voice.phoneme(target.ph), 1500);
      this.busy = false;
    } else if (res.hint === 3) {
      await this.hedwigPlaces();
    }
  }

  private async askHedwig(): Promise<void> {
    if (this.busy || this.round.complete) return;
    this.resetIdle();
    sfx.hoot();
    void this.bobOwl();
    const help = this.round.askHelp();
    if (!help) return;
    this.busy = true;
    if (help.level === 2) {
      if (help.removed) await this.removeTile(help.removed);
      this.markGlow();
      await capped(voice.phoneme(help.glow.ph), 1500);
      this.busy = false;
    } else {
      // askHelp already placed the tile in the model; animate it.
      const res = help.result;
      if (res.kind === 'placed') await this.animateHedwigPlace(res.tile, res.slot, res.complete);
    }
  }

  /** Third wrong try: Hedwig flies over and places the right tile. */
  private async hedwigPlaces(): Promise<void> {
    const res = this.round.helperPlace();
    if (res.kind !== 'placed') {
      this.busy = false;
      return;
    }
    await this.animateHedwigPlace(res.tile, res.slot, res.complete);
  }

  private async animateHedwigPlace(tile: Tile, slot: number, complete: boolean): Promise<void> {
    this.busy = true;
    const view = this.tiles.find((t) => t.tile.id === tile.id)!;
    this.markGlow();
    sfx.whoosh();
    void capped(voice.say(PHRASES.hedwigHere), 1500);

    const flap = this.flap();
    gsap.set(this.owl, { zIndex: 70 });
    // Fly to the tile...
    await sm(this.owl, 0.6, { x: view.x + view.w / 2 - 984 - 90, y: view.y - 548 - 120, scale: 0.75, ease: 'power2.inOut' });
    // ...carry it to the slot...
    const slotEl = this.slotEls[slot];
    const sx = parseFloat(slotEl.style.left);
    const sy = parseFloat(slotEl.style.top);
    void sm(this.owl, 0.55, { x: sx + view.w / 2 - 984 - 90, y: sy - 548 - 120, ease: 'power2.inOut' });
    await this.flyToSlot(view, slot, 0.55);
    // ...and home.
    await sm(this.owl, 0.5, { x: 0, y: 0, scale: 1, ease: 'power2.inOut' });
    flap();
    gsap.set(this.owl, { zIndex: 30 });
    this.busy = false;
    if (complete) await this.celebrate();
  }

  private async flyToSlot(view: TileView, slot: number, duration = 0.36): Promise<void> {
    const slotEl = this.slotEls[slot];
    const sx = parseFloat(slotEl.style.left);
    const sy = parseFloat(slotEl.style.top);
    view.el.classList.remove('glowing');
    view.el.classList.add('flying', 'placed');
    await sm(view.el, duration, { x: sx - view.x, y: sy - view.y, rotation: 0, ease: 'power2.inOut' });
    view.el.classList.remove('flying');
    sfx.place(slot);
    void pop(view.el, 1.1);
    this.updateTarget();
  }

  private markGlow(): void {
    const id = this.round.glowing;
    this.tiles.forEach((t) => t.el.classList.toggle('glowing', t.tile.id === id));
  }

  private async removeTile(tile: Tile): Promise<void> {
    const view = this.tiles.find((t) => t.tile.id === tile.id);
    if (!view) return;
    sfx.rustle();
    view.el.style.pointerEvents = 'none';
    await sm(view.el, 0.45, { y: 160, rotation: 25, opacity: 0, ease: 'power2.in' });
  }

  // -------------------------------------------------------------------------
  // Success
  // -------------------------------------------------------------------------

  private async celebrate(): Promise<void> {
    this.busy = true;
    this.stopIdle();
    this.updateTarget();
    await this.sleep(250);

    // Blend: say each sound, lighting its sound button, then the word.
    const units = this.round.word.units;
    for (let k = 0; k < units.length; k++) {
      if (!this.alive) return;
      const unit = units[k];
      if (unit.link !== undefined && unit.link < k) continue;
      this.soundBtns[k][0].classList.add('lit');
      if (unit.link !== undefined) {
        this.soundBtns[unit.link][0].classList.add('lit');
        this.arcs[k]?.classList.add('lit');
      }
      const tileEl = this.tiles.find((t) => t.tile.id === this.round.slots[k])?.el;
      if (tileEl) void pop(tileEl, 1.12);
      await capped(voice.phoneme(unit.ph), 900);
      await this.sleep(140);
    }

    // The whole word, with the picture coming alive.
    this.root.classList.remove('still');
    this.soundBtns.forEach(([b]) => b.classList.add('lit'));
    void pop(this.card, 1.08);
    await capped(voice.word(this.round.word.text), 2500);
    if (!this.alive) return;

    sfx.success();
    this.sparkles();
    this.fillStar(this.index);
    this.results.push(this.round.result());
    await this.sleep(500);
    sfx.gem();
    this.gemCount.textContent = String(this.app.progress.gems + this.results.length);
    void pop(this.gemsEl, 1.2);
    await capped(voice.say(this.nextPraise()), 2200);
    await this.sleep(400);
    if (!this.alive) return;
    this.root.classList.add('still');

    // Clear away and move on.
    await Promise.all([
      ...this.tiles.map((t, k) => sm(t.el, 0.3, { opacity: 0, y: '-=30', delay: k * 0.03 })),
      ...this.slotEls.map((el) => sm(el, 0.3, { opacity: 0 })),
      sm(this.layer.querySelectorAll('.sound-btn, .split-arc'), 0.3, { opacity: 0 }),
    ]);
    if (!this.alive) return;

    if (this.index + 1 < this.o.words.length) await this.startWord(this.index + 1);
    else this.o.onDone(this.results);
  }

  private nextPraise(): string {
    if (!this.praiseBag.length) this.praiseBag = [...PRAISE].sort(() => Math.random() - 0.5);
    return this.praiseBag.pop()!;
  }

  private fillStar(i: number): void {
    const s = this.starsEl.children[i] as HTMLElement | undefined;
    if (!s) return;
    s.innerHTML = star(true, `p${i}f`);
    void pop(s, 1.4);
  }

  private sparkles(): void {
    if (isCalm()) return;
    const cx = PIC.x + PIC.s / 2;
    const cy = PIC.y + PIC.s / 2;
    for (let k = 0; k < 14; k++) {
      const p = place(h('div', { class: 'particle', html: star(true, `spark${k % 3}`) }), cx, cy);
      this.root.append(p);
      const a = (k / 14) * Math.PI * 2;
      const d = 150 + Math.random() * 110;
      gsap.fromTo(
        p,
        { scale: 0.2, opacity: 1, rotation: 0 },
        {
          x: Math.cos(a) * d,
          y: Math.sin(a) * d,
          scale: 0.6 + Math.random() * 0.8,
          rotation: 180,
          opacity: 0,
          duration: 0.9,
          ease: stepped(0.9, 'power2.out'),
          onComplete: () => p.remove(),
        },
      );
    }
  }

  // -------------------------------------------------------------------------
  // Hedwig life & idle help
  // -------------------------------------------------------------------------

  private startBlinking(): void {
    const blink = () => {
      const lids = this.owl.querySelector('[data-part="lids"]');
      if (lids && !isCalm()) gsap.timeline().set(lids, { opacity: 1 }).set(lids, { opacity: 0 }, 0.16);
      this.later(4000 + Math.random() * 5000, blink);
    };
    this.later(3000, blink);
  }

  private flap(): () => void {
    const l = this.owl.querySelector('[data-part="wingL"]');
    const r = this.owl.querySelector('[data-part="wingR"]');
    const tl = gsap.timeline({ repeat: -1 });
    tl.to(l, { rotation: 50, duration: 0.12, ease: 'none' }, 0)
      .to(r, { rotation: -50, duration: 0.12, ease: 'none' }, 0)
      .to(l, { rotation: -10, duration: 0.12, ease: 'none' }, 0.17)
      .to(r, { rotation: 10, duration: 0.12, ease: 'none' }, 0.17);
    return () => {
      tl.kill();
      gsap.set([l, r], { rotation: 0 });
    };
  }

  private async bobOwl(): Promise<void> {
    const head = this.owl.querySelector('[data-part="head"]');
    await gsap
      .timeline()
      .to(head, { rotation: -14, duration: 0.25, ease: stepped(0.25) })
      .to(head, { rotation: 0, duration: 0.3, ease: stepped(0.3) });
  }

  private resetIdle(): void {
    this.stopIdle();
    const secs = this.app.progress.settings.idleHintSeconds;
    if (!secs) return;
    this.idleTimer = setTimeout(() => void this.onIdle(), secs * 1000 * (1 + this.idleCount * 0.5));
  }

  private stopIdle(): void {
    if (this.idleTimer) clearTimeout(this.idleTimer);
    this.idleTimer = null;
  }

  private async onIdle(): Promise<void> {
    if (!this.alive || this.busy || this.round.complete) return;
    this.idleCount++;
    sfx.hoot();
    await this.bobOwl();
    await this.hear(false);
    if (this.alive && !this.round.complete) {
      void pop(this.slotEls[this.round.next], 1.1);
      this.resetIdle();
    }
  }
}
