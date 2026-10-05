/**
 * Sound-making building blocks for the story cutscenes (src/stories).
 *
 * Every sound is made in the browser from oscillators and filtered noise,
 * on the soft, capped sfx bus. Times are AudioContext seconds: start from
 * `now()` and add offsets to schedule a little sequence.
 */
import { audio, buses } from './engine';

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

/** The time to schedule a sound from, in AudioContext seconds. */
export const now = (): number => audio().currentTime + 0.005;

function env(g: GainNode, t: number, peak: number, attack: number, decay: number): void {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
}

export interface ToneOpts {
  wave?: OscillatorType;
  /** Loudness, 0..~0.35. Keep it soft. */
  peak?: number;
  attack?: number;
  decay?: number;
  detune?: number;
  /** Slides the pitch to this frequency over the sound. */
  glideTo?: number;
  /** Wobbles the pitch: [rate Hz, depth Hz]. */
  vibrato?: [number, number];
  /** Low-pass filter cutoff, to round off bright waves. */
  lowpass?: number;
  /** Where to send it (default: the sfx bus). */
  out?: AudioNode;
}

/** One note. */
export function tone(freq: number, t: number, o: ToneOpts = {}): void {
  const ac = audio();
  const attack = o.attack ?? 0.01;
  const decay = o.decay ?? 0.3;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = o.wave ?? 'sine';
  osc.frequency.setValueAtTime(freq, t);
  if (o.glideTo) osc.frequency.exponentialRampToValueAtTime(o.glideTo, t + attack + decay);
  if (o.detune) osc.detune.value = o.detune;
  let lfo: OscillatorNode | null = null;
  if (o.vibrato) {
    lfo = ac.createOscillator();
    const lg = ac.createGain();
    lfo.frequency.value = o.vibrato[0];
    lg.gain.value = o.vibrato[1];
    lfo.connect(lg).connect(osc.frequency);
    lfo.start(t);
    lfo.stop(t + attack + decay + 0.05);
  }
  env(g, t, o.peak ?? 0.2, attack, decay);
  let node: AudioNode = osc;
  if (o.lowpass) {
    const lp = ac.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = o.lowpass;
    node = osc.connect(lp);
  }
  node.connect(g).connect(o.out ?? buses.sfx);
  osc.start(t);
  osc.stop(t + attack + decay + 0.05);
}

/** A bell / celesta note: the game's "magic" sound. */
export function bell(freq: number, t: number, peak = 0.16, decay = 1.1, out?: AudioNode): void {
  tone(freq, t, { peak, attack: 0.004, decay, out });
  tone(freq * 2.01, t, { peak: peak * 0.35, attack: 0.004, decay: decay * 0.5, out });
  tone(freq * 3.98, t, { peak: peak * 0.12, attack: 0.002, decay: decay * 0.25, out });
}

export interface NoiseOpts {
  /** Filter centre / cutoff frequency. */
  freq: number;
  q?: number;
  peak?: number;
  attack?: number;
  decay?: number;
  type?: BiquadFilterType;
  /** Sweeps the filter to this frequency over the sound. */
  sweepTo?: number;
}

/** Filtered noise: whooshes, splashes, thuds, crackles, wind, rustles. */
export function noiseBurst(t: number, o: NoiseOpts): void {
  const ac = audio();
  const attack = o.attack ?? 0.005;
  const decay = o.decay ?? 0.15;
  const src = ac.createBufferSource();
  src.buffer = noise();
  src.loop = true;
  src.playbackRate.value = 0.8 + Math.random() * 0.4;
  const f = ac.createBiquadFilter();
  f.type = o.type ?? 'bandpass';
  f.frequency.setValueAtTime(o.freq, t);
  if (o.sweepTo) f.frequency.exponentialRampToValueAtTime(o.sweepTo, t + attack + decay);
  f.Q.value = o.q ?? 1;
  const g = ac.createGain();
  env(g, t, o.peak ?? 0.2, attack, decay);
  src.connect(f).connect(g).connect(buses.sfx);
  src.start(t, Math.random() * 0.5);
  src.stop(t + attack + decay + 0.05);
}

/** Notes (Hz) for writing little tunes. */
export const NOTE = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0, A3: 220.0, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.0, B5: 987.77,
  C6: 1046.5, D6: 1174.66, E6: 1318.51, G6: 1567.98, C7: 2093.0,
} as const;

/** Plays a tune of [frequency, start offset in seconds] pairs on bells. */
export function tune(notes: Array<[number, number]>, peak = 0.14, decay = 1): void {
  const t = now();
  for (const [f, dt] of notes) bell(f, t + dt, peak, decay);
}

/**
 * A ready-made library of story sounds. Stories can also make their own
 * from tone / bell / noiseBurst.
 */
export const fx = {
  /** Cartoon spring jump. */
  boing(): void {
    const t = now();
    tone(180, t, { wave: 'triangle', peak: 0.16, decay: 0.35, glideTo: 520, vibrato: [18, 30] });
  },
  /** A soft bump onto the floor. */
  thud(): void {
    const t = now();
    tone(110, t, { peak: 0.26, decay: 0.22, glideTo: 50 });
    noiseBurst(t, { freq: 400, type: 'lowpass', peak: 0.16, decay: 0.12 });
  },
  /** A little "pop!" (bubbles, things appearing). */
  pop(): void {
    const t = now();
    tone(500, t, { peak: 0.16, decay: 0.08, glideTo: 1100 });
  },
  /** Something whizzes past. */
  whizz(): void {
    const t = now();
    noiseBurst(t, { freq: 800, q: 2, peak: 0.12, attack: 0.08, decay: 0.3, sweepTo: 4000 });
    tone(600, t, { wave: 'triangle', peak: 0.06, attack: 0.05, decay: 0.3, glideTo: 1400 });
  },
  /** Water splash. */
  splash(): void {
    const t = now();
    noiseBurst(t, { freq: 2500, q: 0.6, peak: 0.2, attack: 0.01, decay: 0.5, sweepTo: 600 });
    [0.08, 0.16, 0.22].forEach((d) => tone(700 + Math.random() * 600, t + d, { peak: 0.06, decay: 0.08, glideTo: 1600 }));
  },
  /** Bubbles rising. */
  bubbles(count = 6): void {
    const t = now();
    for (let i = 0; i < count; i++) tone(400 + Math.random() * 500, t + i * 0.09, { peak: 0.07, decay: 0.07, glideTo: 1300 });
  },
  /** A wooden door creaks open. */
  creak(): void {
    const t = now();
    tone(170, t, { wave: 'sawtooth', peak: 0.05, attack: 0.1, decay: 0.8, glideTo: 240, vibrato: [24, 18], lowpass: 900 });
  },
  /** A knock-knock on a door. */
  knock(times = 2): void {
    const t = now();
    for (let i = 0; i < times; i++) {
      tone(160, t + i * 0.22, { peak: 0.22, decay: 0.08, glideTo: 90 });
      noiseBurst(t + i * 0.22, { freq: 900, peak: 0.12, decay: 0.05 });
    }
  },
  /** Light footsteps or paws pattering. */
  patter(steps = 6, gap = 0.12): void {
    const t = now();
    for (let i = 0; i < steps; i++) noiseBurst(t + i * gap, { freq: 1400 + (i % 2) * 300, q: 1.2, peak: 0.09, decay: 0.04 });
  },
  /** Big, heavy stomps (giants, dragons). */
  stomp(steps = 3, gap = 0.45): void {
    const t = now();
    for (let i = 0; i < steps; i++) {
      tone(70, t + i * gap, { peak: 0.28, decay: 0.3, glideTo: 40 });
      noiseBurst(t + i * gap, { freq: 300, type: 'lowpass', peak: 0.14, decay: 0.2 });
    }
  },
  /** A puff of smoke / disappearing. */
  poof(): void {
    const t = now();
    noiseBurst(t, { freq: 1200, q: 0.5, peak: 0.18, attack: 0.02, decay: 0.45, sweepTo: 300 });
  },
  /** Soft wind blowing. */
  wind(seconds = 2): void {
    const t = now();
    noiseBurst(t, { freq: 500, q: 3, peak: 0.08, attack: seconds * 0.4, decay: seconds * 0.6, sweepTo: 900 });
  },
  /** Magic twinkle going up. */
  twinkle(): void {
    tune([[NOTE.C6, 0], [NOTE.E6, 0.06], [NOTE.G6, 0.12], [NOTE.C7, 0.18]], 0.08, 0.6);
  },
  /** Magic going down (something shrinking, a spell fizzling). */
  fizzle(): void {
    tune([[NOTE.C7, 0], [NOTE.G6, 0.07], [NOTE.E6, 0.14], [NOTE.C6, 0.21]], 0.07, 0.5);
    noiseBurst(now(), { freq: 5000, type: 'highpass', peak: 0.05, decay: 0.4 });
  },
  /** A short happy jingle to end on. */
  jingle(): void {
    tune([[NOTE.G5, 0], [NOTE.C6, 0.12], [NOTE.E6, 0.24], [NOTE.G6, 0.36], [NOTE.E6, 0.52], [NOTE.G6, 0.64]], 0.13, 1.2);
  },
  /** A cheeky "uh-oh" (villain foiled). */
  uhoh(): void {
    const t = now();
    tone(392, t, { wave: 'triangle', peak: 0.13, attack: 0.02, decay: 0.2, lowpass: 2000 });
    tone(294, t + 0.25, { wave: 'triangle', peak: 0.13, attack: 0.02, decay: 0.45, glideTo: 260, lowpass: 2000 });
  },
  /** A sneaky tiptoe tune (villains, hiding). */
  sneak(): void {
    const t = now();
    [NOTE.E4, NOTE.G4, NOTE.E4, NOTE.G4].forEach((f, i) => tone(f, t + i * 0.28, { wave: 'triangle', peak: 0.09, decay: 0.12, lowpass: 1500 }));
  },
  /** A big drum-roll build-up. */
  drumroll(seconds = 1.2): void {
    const t = now();
    for (let s = 0; s < seconds; s += 0.05) noiseBurst(t + s, { freq: 200 + s * 120, type: 'lowpass', peak: 0.05 + (s / seconds) * 0.1, decay: 0.05 });
  },
  /** A cymbal-ish crash ending a drumroll. */
  crash(): void {
    const t = now();
    noiseBurst(t, { freq: 6000, type: 'highpass', peak: 0.12, attack: 0.005, decay: 1.2 });
    tone(80, t, { peak: 0.2, decay: 0.4, glideTo: 45 });
  },
  /** A deep, friendly-spooky rumble. */
  rumble(seconds = 1.5): void {
    const t = now();
    noiseBurst(t, { freq: 160, type: 'lowpass', peak: 0.2, attack: 0.2, decay: seconds });
    tone(55, t, { peak: 0.14, attack: 0.2, decay: seconds, glideTo: 45 });
  },
  /** A magic spell shooting out of a wand. */
  spell(): void {
    const t = now();
    noiseBurst(t, { freq: 900, q: 1.2, peak: 0.14, attack: 0.02, decay: 0.3, sweepTo: 6000 });
    tone(330, t, { wave: 'triangle', peak: 0.12, attack: 0.01, decay: 0.3, glideTo: 1320 });
    [NOTE.G6, NOTE.C7].forEach((n, i) => bell(n, t + 0.08 + i * 0.05, 0.05, 0.4));
  },
};

// ---------------------------------------------------------------------------
// Music beds: quiet, looping background music for the stories
// ---------------------------------------------------------------------------

/** The feel of a story's background music. */
export type Mood = 'cosy' | 'magic' | 'spooky' | 'adventure' | 'sneaky' | 'triumph' | 'dreamy';

/** MIDI note number to frequency. */
const mtof = (m: number): number => 440 * 2 ** ((m - 69) / 12);

interface MoodDef {
  bpm: number;
  /** Beats per step. */
  step: number;
  /** Plays step `i` at time `t` into `out` (`beat` = seconds per beat). */
  play(i: number, t: number, beat: number, out: AudioNode): void;
}

const pick = <T>(xs: T[], i: number): T => xs[((i % xs.length) + xs.length) % xs.length];

const MOODS: Record<Mood, MoodDef> = {
  // A music-box waltz in F: bass on the downbeat, a bell arpeggio over it.
  cosy: {
    bpm: 100,
    step: 1,
    play(i, t, beat, out) {
      const chord = pick([[53, 57, 60], [50, 53, 57], [46, 50, 53], [48, 52, 55]], Math.floor(i / 3));
      const b = i % 3;
      if (b === 0) tone(mtof(chord[0] - 12), t, { wave: 'triangle', peak: 0.05, attack: 0.02, decay: beat * 2.6, lowpass: 700, out });
      bell(mtof(chord[[2, 1, 0][b]] + 12 + (b === 2 ? 12 : 0)), t, 0.03, beat * 2, out);
    },
  },
  // Celesta arpeggios over a soft pad: wonder and sparkle.
  magic: {
    bpm: 84,
    step: 0.5,
    play(i, t, beat, out) {
      const chord = pick([[60, 64, 67, 71], [57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 64]], Math.floor(i / 8));
      const notes = [...chord, chord[0] + 12];
      bell(mtof(pick(notes, [0, 1, 2, 3, 4, 3, 2, 1][i % 8]) + 12), t, 0.026, beat * 2.2, out);
      if (i % 8 === 0) {
        tone(mtof(chord[0] - 12), t, { peak: 0.03, attack: beat * 1.5, decay: beat * 3.5, out });
        tone(mtof(chord[2] - 12), t, { peak: 0.022, attack: beat * 1.5, decay: beat * 3.5, out });
      }
    },
  },
  // A low wobbly drone and slow, sparse bells in A minor: spooky but friendly.
  spooky: {
    bpm: 64,
    step: 1,
    play(i, t, beat, out) {
      if (i % 8 === 0) {
        tone(mtof(45), t, { wave: 'triangle', peak: 0.045, attack: beat * 2, decay: beat * 6, lowpass: 500, vibrato: [3.5, 1.5], out });
        tone(mtof(52), t, { peak: 0.025, attack: beat * 2.5, decay: beat * 5.5, out });
      }
      const n = pick([69, 0, 72, 0, 0, 71, 0, 64, 69, 0, 67, 0, 0, 64, 0, 0], i);
      if (n) bell(mtof(n), t, 0.022, beat * 3, out);
    },
  },
  // A bouncy, hopping bass and a bright tune in D: off on an adventure.
  adventure: {
    bpm: 118,
    step: 0.5,
    play(i, t, beat, out) {
      const root = pick([50, 50, 55, 57], Math.floor(i / 8));
      if (i % 2 === 0) tone(mtof(root - 12 + (i % 4 === 2 ? 7 : 0)), t, { wave: 'triangle', peak: 0.055, attack: 0.01, decay: beat * 0.45, lowpass: 900, out });
      const n = pick([74, 0, 76, 78, 0, 76, 74, 0, 81, 0, 78, 76, 0, 74, 73, 0, 71, 0, 74, 76, 0, 78, 79, 0, 81, 0, 78, 0, 76, 0, 0, 0], i);
      if (n) bell(mtof(n), t, 0.026, beat, out);
    },
  },
  // Tiptoeing plucked notes in E minor: creeping about.
  sneaky: {
    bpm: 104,
    step: 0.5,
    play(i, t, beat, out) {
      const n = pick([52, 0, 55, 57, 0, 58, 57, 55, 52, 0, 55, 57, 0, 55, 52, 0], i);
      if (n) tone(mtof(n), t, { wave: 'triangle', peak: 0.05, attack: 0.005, decay: beat * 0.3, lowpass: 1300, out });
      if (i % 4 === 0) tone(mtof(40), t, { wave: 'triangle', peak: 0.05, attack: 0.005, decay: beat * 0.35, lowpass: 400, out });
    },
  },
  // A bright marching fanfare in C: victory.
  triumph: {
    bpm: 108,
    step: 1,
    play(i, t, beat, out) {
      const chord = pick([[60, 64, 67], [65, 69, 72], [67, 71, 74], [60, 64, 67]], Math.floor(i / 4));
      if (i % 4 === 0 || i % 4 === 2) for (const n of chord) tone(mtof(n - 12), t, { wave: 'sawtooth', peak: 0.014, attack: 0.02, decay: beat * 0.9, lowpass: 1500, out });
      bell(mtof(chord[i % 3] + 12), t, 0.026, beat * 1.2, out);
      tone(mtof(chord[0] - 24), t, { wave: 'triangle', peak: 0.04, attack: 0.01, decay: beat * 0.6, lowpass: 600, out });
    },
  },
  // Slow, floating notes with a gentle wobble: dreamy, underwater, moonlit.
  dreamy: {
    bpm: 70,
    step: 0.5,
    play(i, t, beat, out) {
      const n = pick([65, 69, 72, 76, 71, 76, 72, 69, 67, 71, 74, 79, 76, 74, 71, 67], i);
      tone(mtof(n + 12), t, { peak: 0.024, attack: 0.04, decay: beat * 2.5, vibrato: [5, 3], out });
      if (i % 4 === 0) bell(mtof(n), t, 0.018, beat * 3, out);
      if (i % 16 === 0) tone(mtof(53 - 12), t, { peak: 0.03, attack: beat * 3, decay: beat * 8, out });
    },
  },
};

export interface MusicBed {
  /** Fades the music out and stops it. */
  stop(): void;
  /** Turns the music down while someone is talking (true), and back up. */
  duck(on: boolean): void;
}

/** Starts a quiet looping bed of music in the given mood. */
export function musicBed(mood: Mood): MusicBed {
  const ac = audio();
  const def = MOODS[mood];
  const out = ac.createGain();
  out.gain.value = 0.0001;
  out.connect(buses.sfx);
  out.gain.setTargetAtTime(1, ac.currentTime, 0.6);
  const beat = 60 / def.bpm;
  let next = ac.currentTime + 0.15;
  let i = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  // Schedule a little ahead of time, so the beat stays steady.
  const tick = () => {
    while (next < ac.currentTime + 0.5) {
      def.play(i++, next, beat, out);
      next += beat * def.step;
    }
    timer = setTimeout(tick, 120);
  };
  tick();
  let stopped = false;
  return {
    stop() {
      if (stopped) return;
      stopped = true;
      clearTimeout(timer);
      out.gain.setTargetAtTime(0.0001, ac.currentTime, 0.35);
      setTimeout(() => out.disconnect(), 2500);
    },
    duck(on) {
      if (!stopped) out.gain.setTargetAtTime(on ? 0.4 : 1, ac.currentTime, 0.25);
    },
  };
}
