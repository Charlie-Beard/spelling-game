import { gsap } from 'gsap';
import type { ProfileInfo } from '../cloud/api';
import type { CloudProfile } from '../cloud/profile';
import type { Progress } from '../core/progress';
import type { Stage } from '../stage';
import { h, onTap } from './dom';

/** Where scenes can go next. */
export interface Nav {
  title(): void;
  choose(): void;
  map(book?: number): void;
  chapter(id: string): void;
  practice(): void;
  album(): void;
  parent(): void;
}

export interface App {
  stage: Stage;
  /** The signed-in player's save (set once signed in). */
  readonly profile: CloudProfile;
  /** Their progress: shorthand for `profile.progress`. */
  readonly progress: Progress;
  nav: Nav;
  save(): void;
  /** Sends any unsaved progress to the cloud, then back to the password screen. */
  signOut(): Promise<void>;
  /** Sends any unsaved progress to the cloud, then starts again as `to`. */
  switchProfile(to: ProfileInfo): Promise<void>;
  go(scene: Scene, transition?: 'page' | 'fade' | 'none'): Promise<void>;
}

/**
 * A full-stage screen. Subclasses build DOM in `build()` and clean up
 * automatically: taps registered with `tap()`, timers via `later()`.
 */
export abstract class Scene {
  readonly root: HTMLElement;
  protected readonly app: App;
  private cleanups: (() => void)[] = [];
  private timers = new Set<ReturnType<typeof setTimeout>>();
  protected alive = true;
  /** Hides the grown-ups' gear (on the password screen and in the corner itself). */
  readonly hidesGear: boolean = false;

  constructor(app: App, className = '') {
    this.app = app;
    this.root = h('div', { class: `scene ${className}` });
  }

  /** Builds the DOM. Called once before the scene is shown. */
  abstract build(): void;

  /** Called after the transition has revealed the scene. */
  enter(): void | Promise<void> {}

  /** Called before the scene is removed. */
  leave(): void {}

  destroy(): void {
    this.alive = false;
    this.cleanups.forEach((fn) => fn());
    this.cleanups = [];
    this.timers.forEach(clearTimeout);
    this.timers.clear();
    gsap.killTweensOf(this.root.querySelectorAll('*'));
    this.root.remove();
  }

  protected tap(el: HTMLElement, fn: (e: PointerEvent) => void): void {
    this.cleanups.push(onTap(el, fn));
  }

  protected onCleanup(fn: () => void): void {
    this.cleanups.push(fn);
  }

  protected later(ms: number, fn: () => void): void {
    const t = setTimeout(() => {
      this.timers.delete(t);
      if (this.alive) fn();
    }, ms);
    this.timers.add(t);
  }

  protected clearTimers(): void {
    this.timers.forEach(clearTimeout);
    this.timers.clear();
  }

  /** Resolves after `ms`, or never if the scene was destroyed meanwhile. */
  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => this.later(ms, resolve));
  }
}
