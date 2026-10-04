/** The collection: Chocolate Frog cards and the Horcrux shelf. */
import { gsap } from 'gsap';
import { sfx } from '../audio/sfx';
import { voice } from '../audio/voice';
import { characters } from '../art/characters';
import { HORCRUX_NAMES, horcruxArt } from '../art/horcruxes';
import { C } from '../art/palette';
import { parchment } from '../art/ui';
import { ALL_CHAPTERS, HORCRUXES } from '../core/curriculum';
import { pop, sm } from '../ui/anim';
import { banner, frogCard, sealButton } from '../ui/components';
import { h, place } from '../ui/dom';
import { Scene } from '../ui/scene';
import { HOST_NAMES } from './complete';

export class AlbumScene extends Scene {
  private zoom: HTMLElement | null = null;

  build(): void {
    const r = this.root;
    const p = this.app.progress;
    r.style.background = C.night;
    r.append(place(h('div', { html: parchment(1220, 860, 'album-sheet', C.sand, 2) }), -20, -20, 1220, 860));
    r.append(banner('My Collection', { x: 340, y: 18, w: 500, h: 90, size: 42 }));

    const back = sealButton('map', { x: 34, y: 22, size: 72, color: C.slate, aria: 'Back to the map' });
    this.tap(back, () => {
      sfx.tap();
      this.app.nav.map();
    });
    r.append(back);

    // Cards: 8 per row.
    const cards = ALL_CHAPTERS.filter((c) => c.kind === 'card').map((c) => c.reward);
    const cw = 100;
    const gapX = 26;
    const perRow = 8;
    const startX = (1180 - (perRow * cw + (perRow - 1) * gapX)) / 2;
    cards.forEach((id, i) => {
      const have = p.cards.includes(id);
      const name = HOST_NAMES[id] ?? id;
      const btn = h('button', { class: 'album-card', 'aria-label': have ? name : 'Not found yet' });
      btn.append(frogCard(have ? characters[id]() : '', name, { w: cw, locked: !have }));
      const row = Math.floor(i / perRow);
      place(btn, startX + (i % perRow) * (cw + gapX), 128 + row * 160, cw, cw * 1.4);
      this.tap(btn, () => (have ? this.show(id, name, characters[id]()) : this.nope(btn)));
      r.append(btn);
    });

    // Horcrux shelf
    r.append(place(h('div', { class: 'shelf-label' }, 'Horcruxes'), 0, 610, 1180));
    r.append(place(h('div', { class: 'shelf' }), 150, 760, 880, 18));
    HORCRUXES.forEach((id, i) => {
      const have = p.horcruxes.includes(id);
      const btn = h('button', { class: `album-hx${have ? '' : ' missing'}`, 'aria-label': have ? HORCRUX_NAMES[id] : 'Not found yet', html: horcruxArt[id]() });
      place(btn, 170 + i * 142, 640, 130, 130);
      this.tap(btn, () => (have ? this.show(id, HORCRUX_NAMES[id], horcruxArt[id](), true) : this.nope(btn)));
      r.append(btn);
    });
  }

  private nope(el: HTMLElement): void {
    sfx.wrong();
    void pop(el, 0.94);
  }

  private show(id: string, name: string, art: string, horcrux = false): void {
    if (this.zoom) return;
    sfx.reveal();
    void voice.say(name);
    const veil = h('div', { class: 'veil' });
    const big = horcrux ? h('div', { class: 'zoom-hx', html: art }) : frogCard(art, name, { w: 320, seed: id.length });
    const holder = place(h('div', { class: 'zoom' }), horcrux ? 440 : 430, horcrux ? 220 : 120, horcrux ? 300 : 320, horcrux ? 300 : 448);
    holder.append(big);
    veil.append(holder);
    this.root.append(veil);
    this.zoom = veil;
    gsap.fromTo(veil, { opacity: 0 }, { opacity: 1, duration: 0.2 });
    void sm(holder, 0.4, { startAt: { scale: 0.3, rotation: -10 }, scale: 1, rotation: 0, ease: 'back.out(1.7)' });
    this.tap(veil, () => {
      sfx.tap();
      veil.remove();
      this.zoom = null;
    });
  }
}
