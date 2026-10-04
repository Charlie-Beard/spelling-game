/**
 * Switches scenes with a stop-motion page wipe: a torn parchment sheet
 * slides across, the scene changes underneath, and the sheet slides away.
 */
import { gsap } from 'gsap';
import { sfx } from '../audio/sfx';
import { parchment } from '../art/ui';
import { C } from '../art/palette';
import { isCalm, stepped } from './anim';
import { h } from './dom';
import type { Scene } from './scene';

export class Director {
  private stage: HTMLElement;
  private current: Scene | null = null;
  private sheet: HTMLElement;
  private busy = false;
  private pending: { scene: Scene; transition: 'page' | 'fade' | 'none' } | null = null;

  constructor(stage: HTMLElement) {
    this.stage = stage;
    this.sheet = h('div', {
      class: 'wipe',
      html: parchment(1500, 1000, 'wipe-sheet', C.sand, 3),
    });
    this.stage.append(this.sheet);
  }

  get scene(): Scene | null {
    return this.current;
  }

  async go(next: Scene, transition: 'page' | 'fade' | 'none' = 'page'): Promise<void> {
    if (this.busy) {
      // Keep only the latest request; it runs when the current change ends.
      this.pending = { scene: next, transition };
      return;
    }
    this.busy = true;
    this.stage.classList.toggle('no-gear', next.hidesGear);
    try {
      next.build();
      const prev = this.current;
      prev?.leave();

      if (!prev || transition === 'none') {
        this.stage.insertBefore(next.root, this.sheet);
        prev?.destroy();
      } else if (transition === 'fade' || isCalm()) {
        next.root.style.opacity = '0';
        this.stage.insertBefore(next.root, this.sheet);
        await gsap.to(next.root, { opacity: 1, duration: 0.35, ease: 'none' });
        prev.destroy();
      } else {
        sfx.page();
        gsap.set(this.sheet, { display: 'block', x: 1240, rotation: 3 });
        await gsap.to(this.sheet, { x: -160, rotation: -1, duration: 0.42, ease: stepped(0.42, 'power2.in') });
        prev.destroy();
        this.stage.insertBefore(next.root, this.sheet);
        await gsap.to(this.sheet, { x: -1700, rotation: -4, duration: 0.42, ease: stepped(0.42, 'power2.out') });
        gsap.set(this.sheet, { display: 'none' });
      }
      this.current = next;
    } finally {
      this.busy = false;
    }
    if (this.pending) {
      const p = this.pending;
      this.pending = null;
      return this.go(p.scene, p.transition);
    }
    // Scenes may run long sequences in enter(); don't block navigation on it.
    void next.enter();
  }
}
