/** Title: Hogwarts at night and a Hogwarts letter to open. */
import { gsap } from 'gsap';
import { unlock } from '../audio/engine';
import { sfx } from '../audio/sfx';
import { voice } from '../audio/voice';
import { hedwig } from '../art/characters/hedwig';
import { C } from '../art/palette';
import { castleNight } from '../art/scenery';
import { waxSeal } from '../art/ui';
import { PHRASES } from '../core/phrases';
import { requestPersistence } from '../core/progress';
import { breathe, isCalm, sm, stepped } from '../ui/anim';
import { h, place } from '../ui/dom';
import { Scene } from '../ui/scene';

export class TitleScene extends Scene {
  private letter!: HTMLElement;
  private opening = false;

  build(): void {
    const r = this.root;
    r.classList.add('title');
    r.append(h('div', { class: 'backdrop-wrap', html: castleNight('title-castle') }));

    const title = place(h('div', { class: 'big-title', style: 'font-size:104px' }, 'Wizard Words'), 0, 46);
    const sub = place(h('div', { class: 'big-title', style: 'font-size:32px;color:var(--parchment-200);text-shadow:0 2px 0 rgba(0,0,0,.5)' }, 'a spelling adventure'), 0, 168);
    r.append(title, sub);

    // Hedwig gliding across the sky now and then.
    const owl = place(h('div', { class: 'title-owl', html: hedwig('title-owl') }), -200, 220, 120, 120);
    r.append(owl);
    const glide = () => {
      if (isCalm()) return;
      gsap.fromTo(owl, { x: 0, y: 0 }, { x: 1500, y: -120, duration: 9, ease: stepped(9, 'none') });
      this.later(16000, glide);
    };
    this.later(1500, glide);

    // The letter.
    const name = this.app.progress.name.trim();
    this.letter = h('button', { class: 'letter', 'aria-label': 'Open your Hogwarts letter' });
    this.letter.innerHTML = `
      <svg class="envelope" viewBox="0 0 420 280" aria-hidden="true">
        <path d="M14 30 L406 22 L412 262 L8 270 Z" fill="rgba(10,6,20,.45)" transform="translate(6 12)"/>
        <path d="M14 30 L406 22 L412 262 L8 270 Z" fill="${C.cream}"/>
        <path d="M8 268 L210 130 L412 262" fill="none" stroke="${C.sand}" stroke-width="4"/>
        <path class="flap" d="M14 30 L210 170 L406 22 Z" fill="${C.sand}"/>
      </svg>
      <div class="address">${name ? `To ${escapeHtml(name)}` : 'To the Young Wizard'}<br><span>The Spelling Desk, Hogwarts</span></div>
      <div class="letter-seal">${waxSeal('play', C.red, 120, 'letter-seal')}</div>`;
    place(this.letter, 380, 470, 420, 280);
    this.tap(this.letter, () => void this.open());
    r.append(this.letter);
    this.onCleanup(breathe(this.letter, 0.025, 2.6));
  }

  enter(): void {
    sm(this.letter, 0.6, { startAt: { y: 300, rotation: -8 }, y: 0, rotation: 0, ease: 'back.out(1.4)' });
  }

  private async open(): Promise<void> {
    if (this.opening) return;
    this.opening = true;
    await unlock();
    requestPersistence();
    sfx.reveal();
    gsap.killTweensOf(this.letter);
    const flap = this.letter.querySelector('.flap');
    await sm(flap, 0.35, { scaleY: -1, transformOrigin: '50% 0%', ease: 'power2.inOut' });
    void voice.say(PHRASES.welcome);
    await sm(this.letter, 0.4, { scale: 1.15, ease: 'power2.out' });
    await this.sleep(900);
    if (!this.app.progress.avatar) this.app.nav.choose();
    else this.app.nav.map();
  }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}
