/**
 * The narrator.
 *
 *   words     → audio/words/<word>.mp3   (pre-recorded, British voice)
 *   sounds    → a grown-up's recording on this iPad, else audio/ph/<id>.mp3
 *   lines     → audio/lines/<id>.mp3
 *
 * Anything missing (e.g. custom words typed by a parent) falls back to the
 * iPad's own British speech voice. Only one voice clip plays at a time.
 */
import { generic, lineId, personalise } from '../core/phrases';
import { PHONEME_HINTS } from '../core/phonics';
import { audio, buses } from './engine';
import { getRecording } from './recordings';

interface Manifest {
  words: string[];
  ph: string[];
  lines: string[];
}

let manifest: Manifest = { words: [], ph: [], lines: [] };
let manifestLoaded: Promise<void> | null = null;

let playerName = '';
/** The child's name, used in lines containing {name}. */
export function setPlayerName(name: string): void {
  playerName = name.trim();
}

const buffers = new Map<string, Promise<AudioBuffer | null>>();
let current: { stop: () => void } | null = null;

const base = (): string => new URL('./audio/', document.baseURI).href;

export function loadManifest(): Promise<void> {
  manifestLoaded ??= fetch(base() + 'manifest.json')
    .then((r) => (r.ok ? r.json() : manifest))
    .then((m: Manifest) => {
      manifest = m;
    })
    .catch(() => {});
  return manifestLoaded;
}

function fetchBuffer(url: string): Promise<AudioBuffer | null> {
  let p = buffers.get(url);
  if (!p) {
    p = fetch(url)
      .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))))
      .then((data) => audio().decodeAudioData(data))
      .catch(() => null);
    buffers.set(url, p);
  }
  return p;
}

function playBuffer(buf: AudioBuffer, rate = 1): Promise<void> {
  stop();
  return new Promise((resolve) => {
    const src = audio().createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = rate;
    src.connect(buses.voice);
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      if (current?.stop === stopThis) current = null;
      resolve();
    };
    const stopThis = () => {
      try {
        src.stop();
      } catch {
        /* already stopped */
      }
      finish();
    };
    src.onended = finish;
    current = { stop: stopThis };
    src.start();
  });
}

let britishVoice: SpeechSynthesisVoice | null | undefined;
function pickVoice(): SpeechSynthesisVoice | null {
  if (britishVoice !== undefined) return britishVoice;
  const voices = window.speechSynthesis?.getVoices() ?? [];
  if (!voices.length) return null;
  const gb = voices.filter((v) => v.lang.replace('_', '-').toLowerCase().startsWith('en-gb'));
  britishVoice =
    gb.find((v) => /premium|enhanced/i.test(v.name)) ?? gb.find((v) => /serena|kate|stephanie|daniel/i.test(v.name)) ?? gb[0] ?? null;
  return britishVoice;
}

function speak(text: string, rate = 0.85): Promise<void> {
  stop();
  const synth = window.speechSynthesis;
  if (!synth) return Promise.resolve();
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-GB';
    u.rate = rate;
    u.pitch = 1.05;
    const v = pickVoice();
    if (v) u.voice = v;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      resolve();
    };
    u.onend = finish;
    u.onerror = finish;
    // Safety net: Safari occasionally never fires onend.
    setTimeout(finish, 1200 + text.length * 120);
    current = {
      stop: () => {
        synth.cancel();
        finish();
      },
    };
    synth.speak(u);
  });
}

export function stop(): void {
  const c = current;
  current = null;
  c?.stop();
}

const wordUrl = (w: string) => `${base()}words/${encodeURIComponent(w)}.mp3`;
const phUrl = (p: string) => `${base()}ph/${encodeURIComponent(p)}.mp3`;
const lineUrl = (id: string) => `${base()}lines/${id}.mp3`;

export const voice = {
  async word(text: string): Promise<void> {
    await loadManifest();
    if (manifest.words.includes(text)) {
      const buf = await fetchBuffer(wordUrl(text));
      if (buf) return playBuffer(buf);
    }
    return speak(text, 0.8);
  },

  async phoneme(ph: string): Promise<void> {
    const rec = await getRecording(ph);
    if (rec) return playBuffer(rec);
    await loadManifest();
    if (manifest.ph.includes(ph)) {
      const buf = await fetchBuffer(phUrl(ph));
      if (buf) return playBuffer(buf);
    }
    const hint = PHONEME_HINTS[ph] ?? ph;
    return speak(hint.split(' (')[0], 0.7);
  },

  /**
   * Says a line. "{name}" is filled in with the child's name: the recording
   * with his name is used if there is one, else the version without a name.
   */
  async say(template: string): Promise<void> {
    await loadManifest();
    const personal = personalise(template, playerName);
    for (const text of [personal, generic(template)]) {
      const id = lineId(text);
      if (manifest.lines.includes(id)) {
        const buf = await fetchBuffer(lineUrl(id));
        if (buf) return playBuffer(buf);
      }
    }
    return speak(personal, 0.9);
  },

  /** Warms the cache so the first tap answers instantly. */
  async preload(o: { words?: string[]; ph?: string[]; lines?: string[] }): Promise<void> {
    await loadManifest();
    const jobs: Promise<unknown>[] = [];
    for (const w of o.words ?? []) if (manifest.words.includes(w)) jobs.push(fetchBuffer(wordUrl(w)));
    for (const p of o.ph ?? []) if (manifest.ph.includes(p)) jobs.push(fetchBuffer(phUrl(p)));
    for (const t of o.lines ?? []) {
      const id = [personalise(t, playerName), generic(t)].map(lineId).find((x) => manifest.lines.includes(x));
      if (id) jobs.push(fetchBuffer(lineUrl(id)));
    }
    await Promise.all(jobs);
  },

  stop,
};

// iOS loads speech voices lazily.
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    britishVoice = undefined;
  };
}
