/**
 * One player's saved game: kept on this device, so the game works offline,
 * and synced with the cloud, so it follows them to other devices.
 *
 * Every save is written here straight away and sent to the cloud a moment
 * later. Changes made elsewhere (another iPad, a grown-up's phone) come in
 * when the app opens, comes back to the front, or every couple of minutes.
 * If both sides changed, they are merged (core/merge.ts), so nothing is lost.
 */
import { mergeProgress, same } from '../core/merge';
import { defaultProgress, restore, type Progress } from '../core/progress';
import { fetchProfile, JASPER, SignedOut, storeProfile, type Remote } from './api';

/** The save from before sign-in existed (Jasper's). */
const LEGACY_KEY = 'wizard-words:v1';
const dataKey = (id: string) => `wizard-words:v1:${id}`;
const syncKey = (id: string) => `wizard-words:sync:${id}`;
const baseKey = (id: string) => `wizard-words:base:${id}`;

const PUSH_DELAY_MS = 1500;
const PULL_EVERY_MS = 2 * 60 * 1000;

interface SyncInfo {
  /** The cloud revision this device last agreed with (0: never synced). */
  rev: number;
  /** Changed here since then. */
  dirty: boolean;
}

/** synced: the cloud has everything · pending: changes still to send · offline: couldn't reach it */
export type SyncState = 'synced' | 'pending' | 'offline';

function read(key: string): unknown {
  try {
    return JSON.parse(localStorage.getItem(key) ?? 'null');
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked: the cloud copy still has it */
  }
}

/** A blank save. Only Jasper's starts with his name in it. */
export function freshProgress(id = JASPER): Progress {
  const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  return defaultProgress(reduce, id === JASPER ? undefined : '');
}

/** Overwrites the live copy in place, so every scene holding it sees the change. */
function replace(target: Progress, src: Progress): void {
  const { settings, ...rest } = structuredClone(src);
  Object.assign(target, rest);
  Object.assign(target.settings, settings);
}

const open = new Map<string, CloudProfile>();

/** Called when the cloud stops accepting this device's sign-in. */
let signedOut: () => void = () => {};
export function onSignedOut(fn: () => void): void {
  signedOut = fn;
}

export class CloudProfile {
  /** The profile's id (`jasper`, `demo`, …). */
  readonly id: string;
  /** This device already had a copy when the profile was opened. */
  readonly cached: boolean;
  /** The live copy the game reads and changes. */
  readonly progress: Progress;
  state: SyncState;
  private sync_: SyncInfo;
  /** The copy agreed with the cloud at `sync_.rev`, to merge against. */
  private base: Progress | null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private running: Promise<void> | null = null;
  private again = false;
  private listeners = new Set<() => void>();

  /** One instance per player, shared by everything on this device. */
  static for(id: string): CloudProfile {
    let p = open.get(id);
    if (!p) open.set(id, (p = new CloudProfile(id)));
    return p;
  }

  /** Clears a deleted profile's copy from this device. */
  static forget(id: string): void {
    open.delete(id);
    for (const key of [dataKey(id), syncKey(id), baseKey(id)]) write(key, null);
  }

  private constructor(id: string) {
    this.id = id;
    const saved = read(dataKey(id));
    const legacy = saved || id !== JASPER ? null : read(LEGACY_KEY);
    this.progress = restore(saved ?? legacy, freshProgress(id));
    this.cached = !!(saved ?? legacy);
    const info = read(syncKey(id)) as SyncInfo | null;
    this.sync_ = info && Number.isInteger(info.rev) ? info : { rev: 0, dirty: !!legacy };
    const base = read(baseKey(id));
    this.base = base ? restore(base, freshProgress(id)) : null;
    if (legacy) {
      // Move the pre-sign-in save over; it goes up to the cloud on the first sync.
      this.persist();
      write(LEGACY_KEY, null);
    }
    this.state = this.sync_.dirty ? 'pending' : 'synced';
  }

  /** Runs `fn` whenever the progress or sync state changes. */
  onChange(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  /** Saves on this device now, and to the cloud shortly. */
  save(): void {
    this.sync_.dirty = true;
    this.persist();
    this.setState('pending');
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => void this.sync(), PUSH_DELAY_MS);
  }

  /** Brings this device and the cloud up to date with each other. Never throws. */
  sync(): Promise<void> {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    if (this.running) {
      this.again = true;
      return this.running;
    }
    this.running = this.run().finally(() => {
      this.running = null;
      if (this.again) {
        this.again = false;
        void this.sync();
      }
    });
    return this.running;
  }

  private async run(): Promise<void> {
    try {
      const remote = await fetchProfile(this.id);
      if (remote.rev !== this.sync_.rev) this.absorb(remote);
      for (let tries = 0; this.sync_.dirty && tries < 4; tries++) {
        const sent = structuredClone(this.progress);
        const res = await storeProfile(this.id, sent, this.sync_.rev);
        if (res.ok) {
          this.sync_.rev = res.rev;
          this.base = sent;
          // Anything saved while it was on its way goes next time round.
          this.sync_.dirty = !same(this.progress, sent);
          this.persist(true);
        } else {
          this.absorb(res.remote);
        }
      }
      this.setState(this.sync_.dirty ? 'pending' : 'synced');
    } catch (e) {
      if (e instanceof SignedOut) signedOut();
      this.setState('offline');
    }
  }

  /** Takes in the cloud's copy, merged with anything changed here since the last sync. */
  private absorb(remote: Remote): void {
    const theirs = remote.data ? restore(remote.data, freshProgress(this.id)) : null;
    if (!theirs) {
      // Nothing in the cloud yet: this device's copy becomes the first.
      this.sync_ = { rev: remote.rev, dirty: true };
      this.base = null;
      this.persist(true);
      return;
    }
    const merged = this.sync_.dirty || !this.base ? mergeProgress(this.base ?? freshProgress(this.id), this.progress, theirs) : theirs;
    this.sync_ = { rev: remote.rev, dirty: !same(merged, theirs) };
    this.base = theirs;
    replace(this.progress, merged);
    this.persist(true);
    this.listeners.forEach((fn) => fn());
  }

  private persist(withBase = false): void {
    write(dataKey(this.id), this.progress);
    write(syncKey(this.id), this.sync_);
    if (withBase) write(baseKey(this.id), this.base);
  }

  private setState(s: SyncState): void {
    if (s === this.state) return;
    this.state = s;
    this.listeners.forEach((fn) => fn());
  }
}

/** Keeps the signed-in player's save in sync while the app is open. */
export function keepInSync(profile: CloudProfile): void {
  const sync = () => {
    if (!document.hidden) void profile.sync();
  };
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('online', sync);
  setInterval(sync, PULL_EVERY_MS);
  sync();
}
