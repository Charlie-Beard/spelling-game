/**
 * The grown-ups' gear, always in the top-left corner. Tapping it asks a sum
 * (6 × 8, 50 ÷ 5) on a number pad; the right answer opens the grown-ups'
 * corner. A wrong one just gives a new sum.
 */
import { sfx } from '../audio/sfx';
import { C } from '../art/palette';
import { parchment, waxSeal } from '../art/ui';
import { makeSum, type Sum } from '../core/gate';
import { wobble } from './anim';
import { h, onTap, place } from './dom';

export function installGear(stage: HTMLElement, openCorner: () => void): void {
  const gear = place(h('button', { class: 'gear-btn', 'aria-label': 'Grown-ups', html: waxSeal('cog', C.slate, 60, 'gear') }), 14, 12, 60, 60);
  stage.append(gear);
  onTap(gear, () => {
    sfx.tap();
    askSum(stage, openCorner);
  });
}

function askSum(stage: HTMLElement, onRight: () => void): void {
  if (stage.querySelector('.gate')) return;
  let sum: Sum = makeSum();
  let typed = '';

  const veil = h('div', { class: 'gate', role: 'dialog', 'aria-label': 'Grown-ups only' });
  const card = place(h('div', { class: 'gate-card', html: parchment(500, 660, 'gate-card', C.cream, 1) }), 340, 80, 500, 660);
  const question = h('div', { class: 'gate-sum' });
  const answer = h('div', { class: 'gate-answer', 'aria-live': 'polite' });
  const note = h('p', { class: 'gate-note' });
  const keys = h('div', { class: 'gate-keys' });
  const close = h('button', { class: 'gate-close', 'aria-label': 'Close' }, '✕');
  card.append(h('h2', {}, 'Grown-ups only'), question, answer, note, keys, close);
  veil.append(card);
  stage.append(veil);

  const show = () => {
    question.textContent = `${sum.text} =`;
    answer.textContent = typed || '?';
    answer.classList.toggle('empty', !typed);
  };
  const press = (k: string) => {
    if (k === 'del') typed = typed.slice(0, -1);
    else if (k === 'ok') return check();
    else if (typed.length < 3) typed += k;
    note.textContent = '';
    show();
  };
  const check = () => {
    if (!typed) return;
    if (Number(typed) === sum.answer) {
      sfx.sparkle();
      shut();
      onRight();
      return;
    }
    sfx.wrong();
    void wobble(card);
    note.textContent = 'Not quite. Try this one.';
    sum = makeSum();
    typed = '';
    show();
  };
  const keydown = (e: KeyboardEvent) => {
    if (/^\d$/.test(e.key)) press(e.key);
    else if (e.key === 'Backspace') press('del');
    else if (e.key === 'Enter') press('ok');
    else if (e.key === 'Escape') shut();
    else return;
    e.preventDefault();
  };
  const shut = () => {
    window.removeEventListener('keydown', keydown);
    veil.remove();
  };

  for (const k of ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok']) {
    const label = k === 'del' ? '⌫' : k === 'ok' ? 'OK' : k;
    const b = h('button', { class: `gate-key${k === 'ok' ? ' ok' : ''}`, 'aria-label': k === 'del' ? 'Delete' : label }, label);
    // Plain clicks, not onTap: its double-tap guard would swallow "88".
    b.addEventListener('click', () => press(k));
    keys.append(b);
  }
  close.addEventListener('click', shut);
  veil.addEventListener('click', (e) => e.target === veil && shut());
  window.addEventListener('keydown', keydown);
  show();
}
