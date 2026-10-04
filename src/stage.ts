/**
 * The game is authored on one fixed landscape stage: 1180 × 820 points,
 * the iPad (11th gen) landscape viewport. The stage is letterboxed to fit
 * whatever window it is given while keeping its aspect ratio, so every
 * layout and illustration can be placed exactly.
 */

export const STAGE_W = 1180;
export const STAGE_H = 820;

export function fitScale(winW: number, winH: number): number {
  if (winW <= 0 || winH <= 0) return 1;
  return Math.min(winW / STAGE_W, winH / STAGE_H);
}

export function isPortrait(winW: number, winH: number): boolean {
  return winH > winW;
}

type OrientationListener = (portrait: boolean) => void;

export class Stage {
  readonly el: HTMLElement;
  private scale = 1;
  private portrait = false;
  private listeners = new Set<OrientationListener>();

  constructor(el: HTMLElement) {
    this.el = el;
    const update = () => this.update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', () => {
      // iOS reports the new size a beat after the event fires.
      update();
      setTimeout(update, 250);
    });
    window.visualViewport?.addEventListener('resize', update);
    this.update();
  }

  get currentScale(): number {
    return this.scale;
  }

  get isPortrait(): boolean {
    return this.portrait;
  }

  onOrientation(fn: OrientationListener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  /** Converts an element's on-screen box into stage coordinates. */
  rectOf(target: Element): { x: number; y: number; w: number; h: number; cx: number; cy: number } {
    const s = this.el.getBoundingClientRect();
    const r = target.getBoundingClientRect();
    const k = s.width / STAGE_W || 1;
    const x = (r.left - s.left) / k;
    const y = (r.top - s.top) / k;
    const w = r.width / k;
    const h = r.height / k;
    return { x, y, w, h, cx: x + w / 2, cy: y + h / 2 };
  }

  private update(): void {
    const vv = window.visualViewport;
    const w = vv?.width ?? window.innerWidth;
    const h = vv?.height ?? window.innerHeight;
    this.scale = fitScale(w, h);
    document.documentElement.style.setProperty('--scale', String(this.scale));

    const portrait = isPortrait(w, h);
    if (portrait !== this.portrait) {
      this.portrait = portrait;
      this.listeners.forEach((fn) => fn(portrait));
    }
  }
}
