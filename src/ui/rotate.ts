/**
 * Portrait is not supported: iPadOS ignores orientation locks for web
 * apps, so we show a calm paper-cut screen asking to turn the iPad, with
 * Hedwig holding a little iPad that rotates. Animation and sound pause
 * and the game carries on exactly where it was when turned back.
 */
import { gsap } from 'gsap';
import { hedwig } from '../art/characters/hedwig';
import { setPaused } from '../audio/engine';
import { voice } from '../audio/voice';
import type { Stage } from '../stage';

export function installRotateScreen(stage: Stage, el: HTMLElement): void {
  el.innerHTML = `
    <div class="rotate-inner">
      <div class="rotate-owl">${hedwig('rotate-owl')}</div>
      <div class="rotate-ipad"><div class="screen"></div></div>
      <p>Turn the iPad sideways</p>
    </div>`;
  const update = (portrait: boolean) => {
    el.hidden = !portrait;
    document.body.classList.toggle('is-portrait', portrait);
    // Pause: freeze animation and sound until the iPad is turned back.
    if (portrait) {
      voice.stop();
      gsap.globalTimeline.pause();
    } else {
      gsap.globalTimeline.resume();
    }
    setPaused(portrait);
  };
  stage.onOrientation(update);
  update(stage.isPortrait);
}
