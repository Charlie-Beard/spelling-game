/**
 * Synthesised sound effects. Everything is soft, short and warm: no harsh
 * buzzers, nothing sudden or loud. A "wrong" answer is a gentle, curious
 * "hmm?" rather than a failure sound.
 */
import { audio, buses } from './engine';

type Wave = OscillatorType;

let noiseBuf: AudioBuffer | null = null;
function noise(): AudioBuffer {
  const ac = audio();
  if (!noiseBuf) {
    noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  return noiseBuf;
}

function env(g: GainNode, t: number, peak: number, attack: number, decay: number): void {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
}

function tone(freq: number, t: number, o: { wave?: Wave; peak?: number; attack?: number; decay?: number; detune?: number; glideTo?: number; out?: AudioNode } = {}): void {
  const ac = audio();
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = o.wave ?? 'sine';
  osc.frequency.setValueAtTime(freq, t);
  if (o.glideTo) osc.frequency.exponentialRampToValueAtTime(o.glideTo, t + (o.attack ?? 0.01) + (o.decay ?? 0.3));
  if (o.detune) osc.detune.value = o.detune;
  env(g, t, o.peak ?? 0.3, o.attack ?? 0.01, o.decay ?? 0.3);
  osc.connect(g).connect(o.out ?? buses.sfx);
  osc.start(t);
  osc.stop(t + (o.attack ?? 0.01) + (o.decay ?? 0.3) + 0.05);
}

/** A bell / celesta note (two partials) — the game's "magic" timbre. */
function bell(freq: number, t: number, peak = 0.22, decay = 1.1): void {
  tone(freq, t, { peak, attack: 0.004, decay });
  tone(freq * 2.01, t, { peak: peak * 0.35, attack: 0.004, decay: decay * 0.5 });
  tone(freq * 3.98, t, { peak: peak * 0.12, attack: 0.002, decay: decay * 0.25 });
}

function noiseBurst(t: number, o: { freq: number; q?: number; peak?: number; decay?: number; type?: BiquadFilterType; sweepTo?: number; attack?: number }): void {
  const ac = audio();
  const src = ac.createBufferSource();
  src.buffer = noise();
  src.loop = true;
  src.playbackRate.value = 0.8 + Math.random() * 0.4;
  const f = ac.createBiquadFilter();
  f.type = o.type ?? 'bandpass';
  f.frequency.setValueAtTime(o.freq, t);
  if (o.sweepTo) f.frequency.exponentialRampToValueAtTime(o.sweepTo, t + (o.decay ?? 0.2));
  f.Q.value = o.q ?? 1;
  const g = ac.createGain();
  env(g, t, o.peak ?? 0.3, o.attack ?? 0.005, o.decay ?? 0.15);
  src.connect(f).connect(g).connect(buses.sfx);
  src.start(t, Math.random() * 0.5);
  src.stop(t + (o.attack ?? 0.005) + (o.decay ?? 0.15) + 0.05);
}

const now = () => audio().currentTime + 0.005;

// C major pentatonic, used for placing letters so a word "plays a tune".
const PENTA = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66];

export const sfx = {
  /** Soft paper "tock" for any button press. */
  tap(): void {
    const t = now();
    noiseBurst(t, { freq: 1800, q: 0.8, peak: 0.18, decay: 0.05 });
    tone(220, t, { peak: 0.12, decay: 0.07, glideTo: 140 });
  },

  /** A letter tile lifts off. */
  lift(): void {
    const t = now();
    noiseBurst(t, { freq: 2400, q: 0.7, peak: 0.1, decay: 0.08, type: 'highpass' });
  },

  /** A letter lands in its slot — each slot is the next note of a tune. */
  place(slot: number): void {
    const t = now();
    noiseBurst(t, { freq: 900, q: 0.9, peak: 0.22, decay: 0.06 });
    bell(PENTA[slot % PENTA.length], t + 0.01, 0.16, 0.6);
  },

  /** Gentle, curious "hmm?" — never a buzzer. */
  wrong(): void {
    const t = now();
    tone(330, t, { wave: 'triangle', peak: 0.11, attack: 0.03, decay: 0.16 });
    tone(294, t + 0.15, { wave: 'triangle', peak: 0.1, attack: 0.03, decay: 0.22 });
  },

  /** Paper rustle as a tile floats back to the tray. */
  rustle(): void {
    const t = now();
    noiseBurst(t, { freq: 3000, q: 0.5, peak: 0.07, decay: 0.18, attack: 0.04 });
  },

  /** Wand sparkle: a quick shimmer of high bell notes. */
  sparkle(): void {
    const t = now();
    const notes = [1567.98, 2093.0, 2349.32, 2637.02, 3135.96];
    notes.forEach((n, i) => bell(n, t + i * 0.055, 0.07, 0.5));
    noiseBurst(t, { freq: 6000, q: 0.4, peak: 0.05, decay: 0.4, type: 'highpass' });
  },

  /** Word complete: a warm rising arpeggio. */
  success(): void {
    const t = now();
    [523.25, 659.25, 783.99, 1046.5].forEach((n, i) => bell(n, t + i * 0.09, 0.2, 1.2));
    tone(261.63, t, { wave: 'triangle', peak: 0.08, attack: 0.05, decay: 1.2 });
  },

  /** Chapter complete: a short celesta melody. */
  fanfare(): void {
    const t = now();
    const tune: Array<[number, number]> = [
      [783.99, 0], [1046.5, 0.16], [987.77, 0.32], [1046.5, 0.48], [1318.51, 0.7], [1567.98, 0.95],
    ];
    tune.forEach(([n, dt]) => bell(n, t + dt, 0.18, 1.3));
    [261.63, 329.63, 392.0].forEach((n) => tone(n, t + 0.7, { wave: 'triangle', peak: 0.05, attack: 0.1, decay: 1.6 }));
  },

  /** Hedwig's soft hoot. */
  hoot(): void {
    const t = now();
    const hoo = (start: number, len: number, f: number) => {
      const ac = audio();
      const o = ac.createOscillator();
      const lfo = ac.createOscillator();
      const lg = ac.createGain();
      const g = ac.createGain();
      const lp = ac.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 900;
      o.type = 'sine';
      o.frequency.setValueAtTime(f * 0.92, start);
      o.frequency.linearRampToValueAtTime(f, start + 0.06);
      o.frequency.linearRampToValueAtTime(f * 0.94, start + len);
      lfo.frequency.value = 7;
      lg.gain.value = 6;
      lfo.connect(lg).connect(o.frequency);
      g.gain.setValueAtTime(0.0001, start);
      g.gain.exponentialRampToValueAtTime(0.22, start + 0.07);
      g.gain.setValueAtTime(0.22, start + len - 0.08);
      g.gain.exponentialRampToValueAtTime(0.0001, start + len);
      o.connect(lp).connect(g).connect(buses.sfx);
      o.start(start);
      lfo.start(start);
      o.stop(start + len + 0.05);
      lfo.stop(start + len + 0.05);
    };
    hoo(t, 0.22, 420);
    hoo(t + 0.34, 0.42, 400);
  },

  /** Wings / swoosh (Hedwig flying in, transitions). */
  whoosh(): void {
    const t = now();
    noiseBurst(t, { freq: 400, q: 0.7, peak: 0.16, attack: 0.12, decay: 0.35, sweepTo: 2200 });
  },

  /** Page turn / paper slide (scene transitions). */
  page(): void {
    const t = now();
    noiseBurst(t, { freq: 1200, q: 0.6, peak: 0.12, attack: 0.06, decay: 0.28, sweepTo: 4000 });
    noiseBurst(t + 0.25, { freq: 600, q: 0.8, peak: 0.12, decay: 0.08 });
  },

  /** Gem drops into the hourglass. */
  gem(): void {
    const t = now();
    bell(2093.0, t, 0.12, 0.4);
    bell(2637.02, t + 0.07, 0.1, 0.5);
  },

  /** Unlock / reveal (cards, horcruxes, new chapter). */
  reveal(): void {
    const t = now();
    noiseBurst(t, { freq: 300, q: 0.6, peak: 0.12, attack: 0.3, decay: 0.5, sweepTo: 3000 });
    [392.0, 523.25, 659.25, 783.99, 1046.5].forEach((n, i) => bell(n, t + 0.35 + i * 0.07, 0.14, 1.4));
  },

  /** A deep, slightly spooky-but-friendly swell for villains/horcrux chapters. */
  ominous(): void {
    const t = now();
    tone(98, t, { wave: 'triangle', peak: 0.12, attack: 0.4, decay: 1.4 });
    tone(116.54, t + 0.1, { wave: 'triangle', peak: 0.08, attack: 0.4, decay: 1.4 });
    tone(146.83, t + 0.2, { wave: 'sine', peak: 0.06, attack: 0.5, decay: 1.2 });
  },

  /** Shield spell (battle): a bright, protective shimmer. */
  shield(): void {
    const t = now();
    tone(392, t, { wave: 'sine', peak: 0.12, attack: 0.05, decay: 0.9, glideTo: 784 });
    [1046.5, 1318.51, 1567.98].forEach((n, i) => bell(n, t + 0.15 + i * 0.05, 0.1, 0.9));
  },

  // --- The duel with Voldemort (exciting, but still round and warm) ---

  /** Rolling thunder as Voldemort arrives. */
  thunder(): void {
    const t = now();
    noiseBurst(t, { freq: 700, q: 0.5, peak: 0.28, attack: 0.04, decay: 1.9, type: 'lowpass', sweepTo: 90 });
    noiseBurst(t + 0.35, { freq: 400, q: 0.5, peak: 0.18, attack: 0.1, decay: 1.4, type: 'lowpass', sweepTo: 70 });
    tone(55, t, { wave: 'sine', peak: 0.2, attack: 0.05, decay: 1.8, glideTo: 38 });
  },

  /** The hero's spell flies: a bright rising "fwee-ip!". */
  zap(): void {
    const t = now();
    noiseBurst(t, { freq: 900, q: 1.2, peak: 0.16, attack: 0.02, decay: 0.3, sweepTo: 6000 });
    tone(330, t, { wave: 'triangle', peak: 0.14, attack: 0.01, decay: 0.3, glideTo: 1320 });
    [1567.98, 2093.0, 2637.02].forEach((n, i) => bell(n, t + 0.08 + i * 0.04, 0.06, 0.4));
  },

  /** Voldemort's spell: a low, falling "vwoom". */
  darkZap(): void {
    const t = now();
    noiseBurst(t, { freq: 2600, q: 1.4, peak: 0.16, attack: 0.02, decay: 0.42, sweepTo: 260 });
    tone(520, t, { wave: 'triangle', peak: 0.13, attack: 0.01, decay: 0.42, glideTo: 110 });
    tone(523, t, { wave: 'sine', peak: 0.08, attack: 0.01, decay: 0.42, glideTo: 104, detune: 30 });
  },

  /** A spell bounces off a shield: a ringing magical "ting-clang". */
  block(): void {
    const t = now();
    noiseBurst(t, { freq: 2400, q: 0.8, peak: 0.2, decay: 0.12 });
    bell(659.25, t, 0.16, 1.1);
    bell(987.77, t + 0.01, 0.12, 0.9);
    bell(1396.91, t + 0.02, 0.08, 0.7);
  },

  /** A spell hits something: a soft, deep "boomf". */
  boom(): void {
    const t = now();
    tone(140, t, { wave: 'sine', peak: 0.3, attack: 0.01, decay: 0.7, glideTo: 40 });
    noiseBurst(t, { freq: 1200, q: 0.5, peak: 0.24, attack: 0.01, decay: 0.6, type: 'lowpass', sweepTo: 120 });
  },

  /** Two spells locked together: crackling and humming, rising in pitch. */
  crackle(seconds: number): void {
    const t = now();
    const ac = audio();
    [[110, 0], [110, 14], [165, -9]].forEach(([f, det]) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = 'triangle';
      o.frequency.setValueAtTime(f, t);
      o.frequency.exponentialRampToValueAtTime(f * 2.6, t + seconds);
      o.detune.value = det;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.06, t + 0.3);
      g.gain.setValueAtTime(0.06, t + seconds - 0.15);
      g.gain.exponentialRampToValueAtTime(0.0001, t + seconds);
      o.connect(g).connect(buses.sfx);
      o.start(t);
      o.stop(t + seconds + 0.05);
    });
    // Sparky crackles, getting busier.
    for (let s = 0; s < seconds; ) {
      noiseBurst(t + s, { freq: 2500 + Math.random() * 4000, q: 2, peak: 0.05 + Math.random() * 0.08, decay: 0.03 + Math.random() * 0.05 });
      s += 0.03 + Math.random() * 0.12 * (1 - s / seconds / 1.5);
    }
  },

  /** The final hit: a big bright burst. */
  triumph(): void {
    const t = now();
    tone(98, t, { wave: 'sine', peak: 0.32, attack: 0.01, decay: 1.2, glideTo: 36 });
    noiseBurst(t, { freq: 3000, q: 0.4, peak: 0.26, attack: 0.01, decay: 1.4, type: 'lowpass', sweepTo: 150 });
    [523.25, 783.99, 1046.5, 1567.98, 2093.0].forEach((n, i) => bell(n, t + 0.05 + i * 0.03, 0.14, 1.6));
  },
};

export type SfxName = keyof typeof sfx;
