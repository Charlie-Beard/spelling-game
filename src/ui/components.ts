/** Reusable paper UI widgets built from the art kit. */
import { C } from '../art/palette';
import { hashString, rect, tear, toPath } from '../art/paper';
import { parchment, waxSeal, type IconName } from '../art/ui';
import { h, place } from './dom';

export function sealButton(
  icon: IconName,
  o: { x: number; y: number; size?: number; color?: string; label?: string; aria: string; name?: string },
): HTMLButtonElement {
  const size = o.size ?? 120;
  const btn = h('button', {
    class: 'seal-btn',
    'aria-label': o.aria,
    html: waxSeal(icon, o.color ?? C.red, size, o.name ?? `${icon}-${o.x}-${o.y}`),
  }) as HTMLButtonElement;
  if (o.label) btn.append(h('span', { class: 'label' }, o.label));
  place(btn, o.x, o.y, size, size);
  return btn;
}

/** A torn parchment banner with a title. */
export function banner(text: string, o: { x: number; y: number; w: number; h?: number; size?: number; fill?: string }): HTMLElement {
  const hh = o.h ?? 92;
  const el = h('div', { class: 'banner', html: parchment(o.w, hh, 'banner-' + text, o.fill ?? C.cream, 0.8) });
  el.append(h('div', { class: 'banner-text', style: `font-size:${o.size ?? 40}px` }, text));
  place(el, o.x, o.y, o.w, hh);
  return el;
}

/** A torn-paper speech bubble with a tail pointing left. */
export function speech(text: string, o: { x: number; y: number; w: number; h: number; tail?: 'left' | 'down' }): HTMLElement {
  const seed = hashString(text);
  const body = rect(30, 10, o.w - 40, o.h - 20, 24);
  const d = toPath(tear(body, seed, { wobble: 2, jag: 1 }));
  const tail = o.tail === 'down' ? `M${o.w * 0.3} ${o.h - 14} L${o.w * 0.24} ${o.h + 26} L${o.w * 0.42} ${o.h - 14}Z` : `M34 ${o.h * 0.55} L0 ${o.h * 0.72} L34 ${o.h * 0.75}Z`;
  const el = h('div', {
    class: 'speech',
    html: `<svg viewBox="0 0 ${o.w} ${o.h + 30}" width="${o.w}" height="${o.h + 30}" aria-hidden="true">
      <path d="${d}" fill="rgba(20,12,4,0.3)" transform="translate(3 6)"/>
      <path d="${tail}" fill="${C.white}"/>
      <path d="${d}" fill="${C.white}"/>
    </svg>`,
  });
  el.append(h('div', { class: 'speech-text', style: `left:52px;top:22px;width:${o.w - 84}px;height:${o.h - 44}px` }, text));
  place(el, o.x, o.y, o.w, o.h + 30);
  return el;
}

/** A Chocolate Frog card: portrait in an ornate frame with a name plate. */
export function frogCard(portrait: string, name: string, o: { w: number; locked?: boolean; seed?: number }): HTMLElement {
  const w = o.w;
  const hgt = Math.round(w * 1.4);
  const seed = o.seed ?? hashString(name);
  const outer = toPath(tear(rect(4, 4, w - 8, hgt - 8, 14), seed, { wobble: 1.4, jag: 0.6 }));
  const inner = toPath(tear(rect(w * 0.08, w * 0.08, w * 0.84, hgt * 0.72, 10), seed + 1, { wobble: 1, jag: 0.4 }));
  const el = h('div', { class: `frog-card${o.locked ? ' locked' : ''}`, style: `width:${w}px;height:${hgt}px` });
  el.innerHTML = `<svg class="frame" viewBox="0 0 ${w} ${hgt}" aria-hidden="true">
      <path d="${outer}" fill="rgba(20,12,4,0.35)" transform="translate(3 7)"/>
      <path d="${outer}" fill="${o.locked ? C.slate : C.gold}"/>
      <path d="${inner}" fill="${o.locked ? C.night : C.nightLight}"/>
    </svg>
    <div class="frog-portrait" style="left:${w * 0.1}px;top:${w * 0.09}px;width:${w * 0.8}px;height:${hgt * 0.7}px">${o.locked ? '<span class="q">?</span>' : portrait}</div>
    <div class="frog-name" style="top:${hgt * 0.79}px;font-size:${Math.max(14, w * 0.11)}px">${o.locked ? '' : name}</div>`;
  return el;
}

