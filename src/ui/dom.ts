/** Tiny DOM helpers. */

type Attrs = Record<string, string | number | boolean | undefined>;

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Attrs = {},
  children: (Node | string)[] | string = [],
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === false) continue;
    if (k === 'class') el.className = String(v);
    else if (k === 'html') el.innerHTML = String(v);
    else if (k === 'style') el.style.cssText = String(v);
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  if (typeof children === 'string') el.textContent = children;
  else for (const c of children) el.append(c);
  return el;
}

/** Places an element at stage coordinates (top-left origin). */
export function place(el: HTMLElement, x: number, y: number, w?: number, h?: number): HTMLElement {
  el.style.position = 'absolute';
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  if (w !== undefined) el.style.width = `${w}px`;
  if (h !== undefined) el.style.height = `${h}px`;
  return el;
}

export const wait = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/**
 * Fast, reliable tap handling for iPad: fires on pointerup inside the
 * element, ignores multi-touch and drags, and debounces double taps.
 */
export function onTap(el: HTMLElement, fn: (e: PointerEvent) => void): () => void {
  let downId: number | null = null;
  let last = -Infinity;
  const down = (e: PointerEvent) => {
    if (downId !== null) return;
    downId = e.pointerId;
    el.classList.add('is-pressed');
  };
  const up = (e: PointerEvent) => {
    if (e.pointerId !== downId) return;
    downId = null;
    el.classList.remove('is-pressed');
    const r = el.getBoundingClientRect();
    const inside = e.clientX >= r.left - 12 && e.clientX <= r.right + 12 && e.clientY >= r.top - 12 && e.clientY <= r.bottom + 12;
    const now = performance.now();
    if (!inside || now - last < 250 || el.hasAttribute('disabled')) return;
    last = now;
    fn(e);
  };
  const cancel = (e: PointerEvent) => {
    if (e.pointerId !== downId) return;
    downId = null;
    el.classList.remove('is-pressed');
  };
  // Keyboard / switch access fallback.
  const key = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fn(new PointerEvent('pointerup'));
    }
  };
  el.addEventListener('pointerdown', down);
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', cancel);
  el.addEventListener('keydown', key);
  return () => {
    el.removeEventListener('pointerdown', down);
    window.removeEventListener('pointerup', up);
    window.removeEventListener('pointercancel', cancel);
    el.removeEventListener('keydown', key);
  };
}
