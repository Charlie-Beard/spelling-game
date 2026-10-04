/**
 * Shared Web Audio context with a gentle master chain:
 *   sources → (sfx | voice) buses → master gain → limiter → speakers
 *
 * iPad Safari only allows audio after a user gesture, so `unlock()` must be
 * called from the first tap (the title screen's Play button does this).
 */

let ctx: AudioContext | null = null;
let master: GainNode;
let sfxBus: GainNode;
let voiceBus: GainNode;
let musicBus: GainNode;

export function audio(): AudioContext {
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC({ latencyHint: 'interactive' });

    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -12;
    limiter.knee.value = 8;
    limiter.ratio.value = 12;
    limiter.attack.value = 0.003;
    limiter.release.value = 0.2;
    limiter.connect(ctx.destination);

    master = ctx.createGain();
    master.gain.value = 0.8;
    master.connect(limiter);

    sfxBus = ctx.createGain();
    sfxBus.gain.value = 0.55;
    sfxBus.connect(master);

    voiceBus = ctx.createGain();
    voiceBus.gain.value = 1;
    voiceBus.connect(master);

    musicBus = ctx.createGain();
    musicBus.gain.value = 0;
    musicBus.connect(master);
  }
  return ctx;
}

export const buses = {
  get sfx(): GainNode {
    audio();
    return sfxBus;
  },
  get voice(): GainNode {
    audio();
    return voiceBus;
  },
  get music(): GainNode {
    audio();
    return musicBus;
  },
  get master(): GainNode {
    audio();
    return master;
  },
};

/** Resumes audio inside a user gesture (required on iOS). */
export async function unlock(): Promise<void> {
  const ac = audio();
  if (ac.state !== 'running') {
    try {
      await ac.resume();
    } catch {
      /* ignore */
    }
  }
  // Play one silent sample: older iOS needs a buffer started in the gesture.
  const b = ac.createBuffer(1, 1, 22050);
  const s = ac.createBufferSource();
  s.buffer = b;
  s.connect(ac.destination);
  s.start(0);
}

export function setVolumes(v: { master?: number; sfx?: number; voice?: number; music?: number }): void {
  audio();
  const t = ctx!.currentTime;
  if (v.master !== undefined) master.gain.setTargetAtTime(v.master, t, 0.05);
  if (v.sfx !== undefined) sfxBus.gain.setTargetAtTime(v.sfx, t, 0.05);
  if (v.voice !== undefined) voiceBus.gain.setTargetAtTime(v.voice, t, 0.05);
  if (v.music !== undefined) musicBus.gain.setTargetAtTime(v.music, t, 0.3);
}

// iOS suspends audio when the app is backgrounded; resume on return.
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && ctx && ctx.state !== 'running' && !document.body.classList.contains('is-portrait')) void ctx.resume().catch(() => {});
  });
}

/** Pauses all sound (portrait mode) or resumes it. */
export function setPaused(paused: boolean): void {
  if (!ctx) return;
  if (paused) void ctx.suspend().catch(() => {});
  else void ctx.resume().catch(() => {});
}

/** iOS can leave audio "interrupted" after a call or backgrounding; any tap revives it. */
if (typeof window !== 'undefined') {
  window.addEventListener(
    'pointerdown',
    () => {
      if (ctx && ctx.state !== 'running' && !document.body.classList.contains('is-portrait')) void ctx.resume().catch(() => {});
    },
    { capture: true },
  );
}
