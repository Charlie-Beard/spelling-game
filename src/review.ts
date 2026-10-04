/**
 * Development-only voice review (/review.html): listen to every recorded
 * clip, mark the wrong ones with a note on what's wrong, and switch a clip
 * to one of its alternative takes. Served by scripts/voice/review-server.ts;
 * verdicts are saved to scripts/voice/review.json.
 */
import '@fontsource/andika/latin-700.css';
import { PHONEME_HINTS } from './core/phonics';

type Kind = 'ph' | 'words' | 'lines';
interface Take {
  label: string;
  hash: string;
}
interface Clip {
  id: string;
  hash: string;
  takes: Take[];
}
interface Qa {
  hash: string;
  flags: string[];
  hints: string[];
}
interface Verdict {
  verdict: 'ok' | 'bad';
  note?: string;
  hash: string;
  at: string;
}
interface State {
  clips: Record<Kind, Clip[]>;
  order: Record<Kind, string[]>;
  units: Record<string, string[]>;
  lines: Record<string, { text: string; speaker: string }>;
  qa: Record<string, Qa>;
  review: Record<string, Verdict>;
}

const TABS: [Kind, string][] = [
  ['ph', 'Sounds'],
  ['words', 'Words'],
  ['lines', 'Lines'],
];

let state: State;
let kind: Kind = (sessionStorage.getItem('review-kind') as Kind) || 'ph';
let rows: Clip[] = [];
let sel = 0;
let playing: HTMLAudioElement | null = null;

const $ = <T extends HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector(sel) as T;
const list = $<HTMLOListElement>('#list');
const filter = $<HTMLSelectElement>('#filter');
const autoplay = $<HTMLInputElement>('#autoplay');
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
const key = (c: Clip) => `${kind}/${c.id}`;

async function api<T>(path: string, body?: unknown): Promise<T> {
  const r = await fetch(`/__voice/${path}`, body ? { method: 'POST', body: JSON.stringify(body) } : {});
  if (!r.ok) throw new Error(`${path}: ${r.status} ${await r.text()}`);
  return r.json();
}

/** The verdict, if it was given for the clip as it is now. */
const verdictOf = (c: Clip): Verdict | undefined => {
  const v = state.review[key(c)];
  return v && v.hash === c.hash ? v : undefined;
};
const qaOf = (k: string, hash: string): Qa | undefined => {
  const q = state.qa[k];
  return q && q.hash === hash ? q : undefined;
};

function play(c: Clip, take?: Take) {
  playing?.pause();
  const url = `/__voice/audio/${kind}/${c.id}${take ? `/${take.label}` : ''}.mp3?h=${take?.hash ?? c.hash}`;
  playing = new Audio(url);
  void playing.play();
}

function describe(c: Clip): { name: string; sub: string } {
  if (kind === 'ph') return { name: c.id, sub: PHONEME_HINTS[c.id] ?? '' };
  if (kind === 'words') return { name: c.id, sub: (state.units[c.id] ?? []).join(' · ') };
  const l = state.lines[c.id];
  return { name: l?.text ?? c.id, sub: l ? l.speaker : '' };
}

function rowHtml(c: Clip, i: number): string {
  const { name, sub } = describe(c);
  const v = verdictOf(c);
  const old = state.review[key(c)];
  const q = qaOf(key(c), c.hash);
  const chips = [
    ...(q?.flags ?? []).map((f) => `<span class="chip flag">${esc(f)}</span>`),
    ...(q?.hints ?? []).map((h) => `<span class="chip">${esc(h)}</span>`),
  ];
  const takes = c.takes.map((t, n) => {
    const tq = qaOf(`${key(c)}#${t.label}`, t.hash);
    const warn = tq?.flags.length ? ` <span class="warn" title="${esc(tq.flags.join('\n'))}">⚑${tq.flags.length}</span>` : '';
    const same = t.hash === c.hash ? ' (in use)' : '';
    return `<span class="take"><button data-act="take" data-n="${n}">▶ ${n + 1} ${esc(t.label)}${same}${warn}</button>${
      same ? '' : `<button data-act="use" data-n="${n}" title="Use this take instead">Use</button>`
    }</span>`;
  });
  return `<li class="row ${i === sel ? 'sel' : ''} ${v?.verdict ?? ''}" data-i="${i}">
    <button class="play" data-act="play" title="Play (Space)">▶</button>
    <div>
      <div class="name">${esc(name)}</div>
      ${sub ? `<div class="sub">${esc(sub)}</div>` : ''}
      ${chips.length ? `<div class="chips">${chips.join('')}</div>` : ''}
      ${takes.length ? `<div class="takes">Other takes: ${takes.join('')}</div>` : ''}
    </div>
    <div class="judge">
      <button class="ok" data-act="ok" aria-pressed="${v?.verdict === 'ok'}">✓ Right</button>
      <button class="bad" data-act="bad" aria-pressed="${v?.verdict === 'bad'}">✗ Wrong</button>
      <input class="note" placeholder="What's wrong? e.g. sounds like “cup”" value="${esc(v?.note ?? '')}" />
      ${old && !v ? `<div class="stale">Changed since you marked it ${old.verdict === 'ok' ? 'right' : 'wrong'}${old.note ? ` (“${esc(old.note)}”)` : ''}. Listen again.</div>` : ''}
    </div>
  </li>`;
}

function sortRows(): Clip[] {
  const order = state.order[kind];
  const pos = (c: Clip) => {
    const i = order.indexOf(c.id);
    return i < 0 ? order.length : i;
  };
  const byOrder = [...state.clips[kind]].sort((a, b) => pos(a) - pos(b) || a.id.localeCompare(b.id));
  const f = filter.value;
  if (f === 'todo') return byOrder.filter((c) => !verdictOf(c));
  if (f === 'bad') return byOrder.filter((c) => verdictOf(c)?.verdict === 'bad');
  if (f === 'order') return byOrder;
  // Suspects first: flagged and unchecked, then unchecked, then marked wrong, then right.
  const rank = (c: Clip) => {
    const v = verdictOf(c);
    if (v) return v.verdict === 'bad' ? 2 : 3;
    return qaOf(key(c), c.hash)?.flags.length ? 0 : 1;
  };
  return byOrder.sort((a, b) => rank(a) - rank(b));
}

function renderTabs() {
  $('.tabs').innerHTML = TABS.map(([k, label]) => {
    const all = state.clips[k];
    const done = all.filter((c) => {
      const v = state.review[`${k}/${c.id}`];
      return v && v.hash === c.hash;
    }).length;
    const bad = all.filter((c) => {
      const v = state.review[`${k}/${c.id}`];
      return v && v.hash === c.hash && v.verdict === 'bad';
    }).length;
    return `<button role="tab" data-kind="${k}" aria-selected="${k === kind}">${label} <small>${done}/${all.length} checked${bad ? `, ${bad} wrong` : ''}</small></button>`;
  }).join('');
}

/** Re-sorts and redraws everything; keeps the same clip selected if it's still shown. */
function render() {
  const keep = rows[sel]?.id;
  rows = sortRows();
  const i = rows.findIndex((c) => c.id === keep);
  sel = i >= 0 ? i : Math.min(sel, Math.max(0, rows.length - 1));
  list.className = kind;
  list.innerHTML = rows.length ? rows.map(rowHtml).join('') : '<li class="empty">Nothing here.</li>';
  renderTabs();
}

/** Redraws one row in place, so the list doesn't jump while you work through it. */
function redraw(i: number) {
  const el = list.children[i];
  if (!el || !rows[i]) return;
  el.outerHTML = rowHtml(rows[i], i);
  renderTabs();
}

function select(i: number, scroll = true) {
  if (i < 0 || i >= rows.length) return;
  const prev = sel;
  sel = i;
  list.children[prev]?.classList.remove('sel');
  list.children[sel]?.classList.add('sel');
  if (scroll) list.children[sel]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  if (autoplay.checked && prev !== sel) play(rows[sel]);
}

async function judge(i: number, verdict: 'ok' | 'bad' | null) {
  const c = rows[i];
  const note = $<HTMLInputElement>('.note', list.children[i]).value;
  const v = await api<Verdict | null>('review', { key: key(c), verdict, note });
  if (v) state.review[key(c)] = v;
  else delete state.review[key(c)];
  redraw(i);
}

async function useTake(i: number, n: number) {
  const c = rows[i];
  state = await api<State>('use', { key: key(c), take: c.takes[n].label });
  render();
  const j = rows.findIndex((r) => r.id === c.id);
  if (j >= 0) {
    select(j, false);
    play(rows[j]);
  }
}

list.addEventListener('click', (e) => {
  const t = e.target as HTMLElement;
  const row = t.closest<HTMLElement>('.row');
  if (!row) return;
  const i = Number(row.dataset.i);
  const act = t.closest<HTMLElement>('[data-act]')?.dataset;
  if (i !== sel) select(i, false);
  if (!act) return;
  const c = rows[i];
  if (act.act === 'play') play(c);
  else if (act.act === 'take') play(c, c.takes[Number(act.n)]);
  else if (act.act === 'use') void useTake(i, Number(act.n));
  else if (act.act === 'ok' || act.act === 'bad') {
    const current = verdictOf(c)?.verdict;
    void judge(i, current === act.act ? null : act.act).then(() => {
      if (act.act === 'bad' && current !== 'bad') $<HTMLInputElement>('.note', list.children[i]).focus();
    });
  }
});

// A note is saved when you leave the box or press Enter.
list.addEventListener('change', (e) => {
  const t = e.target as HTMLElement;
  if (!t.classList.contains('note')) return;
  const i = Number(t.closest<HTMLElement>('.row')!.dataset.i);
  void judge(i, verdictOf(rows[i])?.verdict ?? 'bad');
});

$('.tabs').addEventListener('click', (e) => {
  const k = (e.target as HTMLElement).closest<HTMLElement>('[data-kind]')?.dataset.kind as Kind | undefined;
  if (!k || k === kind) return;
  kind = k;
  sessionStorage.setItem('review-kind', k);
  sel = 0;
  rows = [];
  render();
  window.scrollTo({ top: 0 });
});
filter.addEventListener('change', () => {
  sel = 0;
  rows = [];
  render();
});

document.addEventListener('keydown', (e) => {
  const inNote = (e.target as HTMLElement).classList?.contains('note');
  if (inNote) {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
      select(sel + 1);
    } else if (e.key === 'Escape') (e.target as HTMLInputElement).blur();
    return;
  }
  if (e.target instanceof HTMLSelectElement || e.metaKey || e.ctrlKey || e.altKey) return;
  const c = rows[sel];
  if (e.key === 'ArrowDown' || e.key === 'j') select(sel + 1);
  else if (e.key === 'ArrowUp' || e.key === 'k') select(sel - 1);
  else if ((e.key === ' ' || e.key === 'Enter') && c) play(c);
  else if (e.key === 'y' && c) void judge(sel, 'ok').then(() => select(sel + 1));
  else if (e.key === 'n' && c) {
    void judge(sel, 'bad').then(() => $<HTMLInputElement>('.note', list.children[sel]).focus());
  } else if (/^[1-9]$/.test(e.key) && c?.takes[Number(e.key) - 1]) play(c, c.takes[Number(e.key) - 1]);
  else return;
  e.preventDefault();
});

api<State>('state').then((s) => {
  state = s;
  render();
});
