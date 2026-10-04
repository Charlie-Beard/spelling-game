/**
 * Portrait is not supported: iPadOS ignores orientation locks for web
 * apps, so we show a calm paper-cut screen asking to turn the iPad, with
 * Hedwig holding a little iPad that rotates. The game underneath simply
 * waits and carries on exactly where it was.
 */
import { hedwig } from '../art/characters/hedwig';
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
  };
  stage.onOrientation(update);
  update(stage.isPortrait);
}
