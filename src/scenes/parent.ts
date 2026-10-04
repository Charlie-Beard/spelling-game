/**
 * Grown-ups' corner (reached through the gear, top left, and a sum).
 *   Progress — what's been done, which words are tricky
 *   Settings — name, volume, calm mode, breaks, unlocking, reset
 *   Sounds   — record your own voice for each phonics sound
 *   Words    — custom word lists (e.g. weekly school spellings)
 */
import { setVolumes } from '../audio/engine';
import { deleteRecording, listRecordings, saveRecording } from '../audio/recordings';
import { sfx } from '../audio/sfx';
import { setPlayerName, voice } from '../audio/voice';
import { C } from '../art/palette';
import { parchment } from '../art/ui';
import { freshProgress, type SyncState } from '../cloud/profile';
import { ALL_CHAPTERS, HORCRUXES } from '../core/curriculum';
import { GRAPHEME_PHONEME, PHONEME_HINTS, segmentWord } from '../core/phonics';
import { setCalm } from '../ui/anim';
import { h, place } from '../ui/dom';
import { Scene } from '../ui/scene';

type Tab = 'progress' | 'settings' | 'sounds' | 'words';

const SYNC_TEXT: Record<SyncState, string> = {
  synced: 'Saved to the cloud ✓',
  pending: 'Saving to the cloud…',
  offline: 'Offline: saved on this iPad for now',
};

const PHONEME_ORDER = [...new Set([...Object.values(GRAPHEME_PHONEME), 'oo-short', 'schwa'])];
const EXAMPLE_GRAPHEME: Record<string, string> = Object.entries(GRAPHEME_PHONEME).reduce(
  (acc, [g, ph]) => {
    acc[ph] ??= g;
    return acc;
  },
  { 'oo-short': 'oo', schwa: 'er' } as Record<string, string>,
);

export class ParentScene extends Scene {
  readonly hidesGear = true;
  private body!: HTMLElement;
  private tabs = new Map<Tab, HTMLButtonElement>();
  private recorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;

  build(): void {
    const r = this.root;
    r.classList.add('parent');
    r.style.background = C.night;
    r.append(place(h('div', { html: parchment(1160, 800, 'parent-sheet', C.cream, 1) }), 10, 10, 1160, 800));

    const head = place(h('div', { class: 'p-head' }), 50, 34, 1080, 70);
    head.append(h('h1', {}, 'Grown-ups’ corner'));
    const status = h('small');
    const showStatus = () => (status.textContent = SYNC_TEXT[this.app.profile.state]);
    this.onCleanup(this.app.profile.onChange(showStatus));
    showStatus();
    const signOut = h('button', { class: 'p-btn' }, 'Sign out');
    let armed = false;
    signOut.addEventListener('click', () => {
      if (!armed) {
        armed = true;
        signOut.textContent = 'Tap again to sign out';
        this.later(4000, () => {
          armed = false;
          signOut.textContent = 'Sign out';
        });
        return;
      }
      signOut.textContent = 'Signing out…';
      void this.app.signOut();
    });
    const close = h('button', { class: 'p-btn primary' }, 'Back to the game');
    close.addEventListener('click', () => {
      sfx.tap();
      this.app.nav.title();
    });
    head.append(h('div', { class: 'p-account' }, [h('div', { class: 'p-signed' }, [h('strong', {}, 'Signed in as Jasper'), status]), signOut, close]));
    r.append(head);

    const tabs = place(h('div', { class: 'p-tabs' }), 50, 104, 1080, 56);
    (['progress', 'settings', 'sounds', 'words'] as Tab[]).forEach((t) => {
      const b = h('button', { class: 'p-tab' }, { progress: 'Progress', settings: 'Settings', sounds: 'Record sounds', words: 'My words' }[t]) as HTMLButtonElement;
      b.addEventListener('click', () => this.show(t));
      tabs.append(b);
      this.tabs.set(t, b);
    });
    r.append(tabs);

    this.body = place(h('div', { class: 'p-body' }), 50, 170, 1080, 610);
    r.append(this.body);
    this.show('progress');
  }

  destroy(): void {
    this.stopRecording();
    super.destroy();
  }

  private show(t: Tab): void {
    this.stopRecording();
    this.tabs.forEach((b, k) => b.classList.toggle('on', k === t));
    this.body.innerHTML = '';
    this.body.scrollTop = 0;
    ({ progress: () => this.progressTab(), settings: () => this.settingsTab(), sounds: () => void this.soundsTab(), words: () => this.wordsTab() })[t]();
  }

  // -------------------------------------------------------------------------

  private progressTab(): void {
    const p = this.app.profile.progress;
    const done = ALL_CHAPTERS.filter((c) => p.chapters[c.id]?.done).length;
    const cards = ALL_CHAPTERS.filter((c) => c.kind === 'card').length;
    const tiles = Math.floor(p.difficulty);
    const stats = h('div', { class: 'p-stats' });
    for (const [label, value] of [
      ['Chapters finished', `${done} of ${ALL_CHAPTERS.length}`],
      ['Wizard cards', `${p.cards.length} of ${cards}`],
      ['Horcruxes', `${p.horcruxes.length} of ${HORCRUXES.length}`],
      ['Gems', String(p.gems)],
      ['Extra letter tiles', tiles === 0 ? 'None yet (only the letters needed)' : `${tiles} (adjusts automatically)`],
    ]) {
      stats.append(h('div', { class: 'p-stat' }, [h('span', {}, label), h('strong', {}, value)]));
    }
    this.body.append(h('h2', {}, 'How it’s going'), stats);

    const tricky = Object.entries(p.words)
      .map(([w, s]) => ({ w, score: s.mistakes + s.helped * 2, s }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 16);
    this.body.append(h('h2', {}, 'Words to practise'));
    if (!tricky.length) {
      this.body.append(h('p', {}, 'Nothing tricky yet. Words that need lots of help will show up here and come back in later chapters.'));
    } else {
      const list = h('div', { class: 'p-words' });
      for (const t of tricky) {
        list.append(h('div', { class: 'p-word' }, [h('strong', {}, t.w), h('span', {}, `tries ${t.s.seen} · slips ${t.s.mistakes} · Hedwig helped ${t.s.helped}`)]));
      }
      this.body.append(list);
    }
    this.body.append(
      h('p', { class: 'p-note' }, 'Hedwig helps after three tries on the same letter, so there is never a way to fail. Missed words come back at the start of the next chapter.'),
    );
  }

  // -------------------------------------------------------------------------

  private settingsTab(): void {
    const target = this.app.profile;
    const p = target.progress;
    const s = p.settings;
    const save = () => target.save();

    const row = (label: string, control: HTMLElement, hint?: string) =>
      h('label', { class: 'p-row' }, [h('div', {}, [h('strong', {}, label), ...(hint ? [h('small', {}, hint)] : [])]), control]);

    const name = h('input', { type: 'text', value: p.name, placeholder: 'e.g. Sam', maxlength: 20, autocomplete: 'off' }) as HTMLInputElement;
    name.addEventListener('input', () => {
      p.name = name.value;
      setPlayerName(p.name);
      save();
    });

    const vol = h('input', { type: 'range', min: 0, max: 100, value: Math.round(s.volume * 100) }) as HTMLInputElement;
    vol.addEventListener('input', () => {
      s.volume = Number(vol.value) / 100;
      setVolumes({ master: s.volume });
      save();
    });
    vol.addEventListener('change', () => sfx.success());

    const calm = toggle(s.calm, (v) => {
      s.calm = v;
      setCalm(v);
      save();
    });

    const brk = select(
      [['0', 'Never'], ['2', 'After 2 chapters'], ['3', 'After 3 chapters'], ['4', 'After 4 chapters'], ['5', 'After 5 chapters']],
      String(s.breakAfter),
      (v) => {
        s.breakAfter = Number(v);
        save();
      },
    );

    const idle = select(
      [['0', 'Off'], ['8', 'After 8 seconds'], ['12', 'After 12 seconds'], ['20', 'After 20 seconds']],
      String(s.idleHintSeconds),
      (v) => {
        s.idleHintSeconds = Number(v);
        save();
      },
    );

    const unlock = toggle(p.unlockAll, (v) => {
      p.unlockAll = v;
      save();
    });

    const resetBtn = h('button', { class: 'p-btn danger' }, 'Reset all progress');
    let armed = false;
    resetBtn.addEventListener('click', () => {
      if (!armed) {
        armed = true;
        resetBtn.textContent = 'Tap again to really reset';
        setTimeout(() => {
          armed = false;
          resetBtn.textContent = 'Reset all progress';
        }, 4000);
        return;
      }
      Object.assign(p, freshProgress());
      setPlayerName(p.name);
      save();
      this.show('settings');
    });

    this.body.append(
      row('Child’s name', name, 'Shown on his Hogwarts letter. The narrator and characters say “Jasper” out loud; other names are shown but not spoken.'),
      row('Volume', vol),
      row('Calm mode', calm, 'Less movement: no paper jitter, shorter animations, no confetti.'),
      row('Break reminder', brk, 'A gentle “time for a break” screen.'),
      row('Hedwig repeats the word', idle, 'If nothing is tapped for a while.'),
      row('Unlock every chapter', unlock, 'Let him jump to any chapter on the map.'),
      row('Start again', resetBtn, 'Clears cards, Horcruxes and progress (not your recorded sounds).'),
    );
  }

  // -------------------------------------------------------------------------

  private async soundsTab(): Promise<void> {
    const have = await listRecordings();
    this.body.append(
      h('p', { class: 'p-note' }, 'The built-in voice says whole words well, but single sounds are hard for any computer voice. Record your own: say each pure sound (“mmm”, not “muh”), the way school teaches it. Tap ● to start, tap again to stop. Recordings stay on this iPad and are used whoever is playing.'),
    );
    const grid = h('div', { class: 'p-sounds' });
    for (const ph of PHONEME_ORDER) {
      const rowEl = h('div', { class: `p-sound${have.has(ph) ? ' recorded' : ''}` });
      const label = h('div', { class: 'p-sound-label' }, [h('strong', {}, EXAMPLE_GRAPHEME[ph] ?? ph), h('span', {}, PHONEME_HINTS[ph] ?? '')]);
      const play = h('button', { class: 'p-icon', 'aria-label': 'Play' }, '▶');
      play.addEventListener('click', () => void voice.phoneme(ph));
      const rec = h('button', { class: 'p-icon rec', 'aria-label': 'Record' }, '●');
      rec.addEventListener('click', () => void this.toggleRecord(ph, rec, rowEl));
      const del = h('button', { class: 'p-icon del', 'aria-label': 'Delete recording' }, '✕');
      del.addEventListener('click', async () => {
        await deleteRecording(ph);
        rowEl.classList.remove('recorded');
      });
      rowEl.append(label, play, rec, del);
      grid.append(rowEl);
    }
    this.body.append(grid);
  }

  private async toggleRecord(ph: string, btn: HTMLElement, rowEl: HTMLElement): Promise<void> {
    if (this.recorder) {
      this.stopRecording();
      return;
    }
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    } catch {
      alert('Microphone permission is needed to record sounds.');
      return;
    }
    const mime = ['audio/mp4', 'audio/webm', 'audio/ogg'].find((m) => MediaRecorder.isTypeSupported?.(m));
    const rec = new MediaRecorder(this.stream, mime ? { mimeType: mime } : undefined);
    const chunks: Blob[] = [];
    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    rec.onstop = async () => {
      btn.classList.remove('live');
      const blob = new Blob(chunks, { type: rec.mimeType });
      if (blob.size > 0) {
        await saveRecording(ph, blob);
        rowEl.classList.add('recorded');
        void voice.phoneme(ph);
      }
    };
    rec.start();
    btn.classList.add('live');
    this.recorder = rec;
    // Sounds are short: stop automatically after 2.5 seconds.
    this.later(2500, () => this.stopRecording());
  }

  private stopRecording(): void {
    if (this.recorder && this.recorder.state !== 'inactive') this.recorder.stop();
    this.recorder = null;
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
  }

  // -------------------------------------------------------------------------

  private wordsTab(): void {
    const target = this.app.profile;
    const p = target.progress;
    this.body.append(
      h('p', { class: 'p-note' }, 'Type words to practise, one per line (for example this week’s school spellings). They appear on the map as “My words”. Use hyphens to control how a word splits into sounds, e.g. “c-a-t” or “sh-i-p”.'),
    );
    const area = h('textarea', { rows: 8, placeholder: 'dog\nfrog\nship' }) as HTMLTextAreaElement;
    area.value = p.custom.join('\n');
    const preview = h('div', { class: 'p-preview' });
    const render = () => {
      preview.innerHTML = '';
      for (const line of area.value.split(/[\n,]+/).map((x) => x.trim()).filter(Boolean)) {
        const w = segmentWord(line);
        preview.append(h('span', { class: w ? 'ok' : 'bad' }, w ? `${w.text}: ${w.units.map((u) => u.g).join(' · ')}` : `${line}: too long or unknown letters`));
      }
    };
    area.addEventListener('input', () => {
      render();
      p.custom = area.value.split(/[\n,]+/).map((x) => x.trim()).filter((x) => segmentWord(x));
      target.save();
    });
    render();
    this.body.append(area, preview);
  }
}

function toggle(on: boolean, fn: (v: boolean) => void): HTMLElement {
  const b = h('button', { class: `p-toggle${on ? ' on' : ''}`, role: 'switch', 'aria-checked': String(on) });
  b.addEventListener('click', (e) => {
    e.preventDefault();
    on = !on;
    b.classList.toggle('on', on);
    b.setAttribute('aria-checked', String(on));
    fn(on);
  });
  return b;
}

function select(options: [string, string][], value: string, fn: (v: string) => void): HTMLElement {
  const s = h('select') as HTMLSelectElement;
  for (const [v, label] of options) s.append(h('option', { value: v, selected: v === value }, label));
  s.addEventListener('change', () => fn(s.value));
  return s;
}
