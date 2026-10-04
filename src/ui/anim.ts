/**
 * Animation helpers. Movement is quantised to 12 frames per second — the
 * "on twos" timing of stop-motion — while press feedback stays instant.
 * In calm mode, movement is shortened and simplified.
 */
import { gsap } from 'gsap';

export const STOP_MOTION_FPS = 12;

let calm = false;
export function setCalm(v: boolean): void {
  calm = v;
  document.documentElement.classList.toggle('calm', v);
}
export const isCalm = (): boolean => calm;

/**
 * Wraps an ease so time advances in held frames, like stop-motion.
 * `duration` is needed to know how many frames there are.
 */
export function stepped(duration: number, ease: string | ((t: number) => number) = 'power2.inOut'): (t: number) => number {
  const base = typeof ease === 'function' ? ease : gsap.parseEase(ease);
  const frames = Math.max(2, Math.round(duration * STOP_MOTION_FPS));
  return (t: number) => (t >= 1 ? 1 : base(Math.floor(t * frames) / frames));
}

type Vars = gsap.TweenVars;

/** A stop-motion tween. */
export function sm(target: gsap.TweenTarget, duration: number, vars: Vars & { ease?: string }): gsap.core.Tween {
  const d = calm ? Math.min(duration, 0.25) : duration;
  return gsap.to(target, { ...vars, duration: d, ease: stepped(d, vars.ease ?? 'power2.inOut') });
}

export function smFrom(target: gsap.TweenTarget, duration: number, vars: Vars & { ease?: string }): gsap.core.Tween {
  const d = calm ? Math.min(duration, 0.25) : duration;
  return gsap.from(target, { ...vars, duration: d, ease: stepped(d, vars.ease ?? 'power2.out') });
}

/** Gentle "no, not that one" wobble. */
export function wobble(el: Element): Promise<void> {
  return new Promise((resolve) => {
    if (calm) {
      gsap.fromTo(el, { x: -4 }, { x: 0, duration: 0.2, onComplete: resolve });
      return;
    }
    gsap
      .timeline({ onComplete: resolve })
      .to(el, { rotation: -7, x: -8, duration: 0.08, ease: 'none' })
      .to(el, { rotation: 6, x: 7, duration: 0.08, ease: 'none' })
      .to(el, { rotation: -4, x: -4, duration: 0.08, ease: 'none' })
      .to(el, { rotation: 0, x: 0, duration: 0.08, ease: 'none' });
  });
}

/** Quick squash-and-stretch pop, used when something lands. */
export function pop(el: Element, amount = 1.12): gsap.core.Timeline {
  return gsap
    .timeline()
    .to(el, { scale: amount, duration: 0.08, ease: stepped(0.08, 'power1.out') })
    .to(el, { scale: 1, duration: 0.25, ease: stepped(0.25, 'back.out(3)') });
}

/** A paper "breathing" idle loop (stepped), returns a stopper. */
export function breathe(el: Element, amount = 0.03, period = 2.4): () => void {
  if (calm) return () => {};
  const tw = gsap.to(el, {
    scale: 1 + amount,
    duration: period / 2,
    yoyo: true,
    repeat: -1,
    ease: stepped(period / 2, 'sine.inOut'),
  });
  return () => tw.kill();
}

export { gsap };
