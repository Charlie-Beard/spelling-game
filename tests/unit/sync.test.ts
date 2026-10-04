/**
 * Two devices (each with its own storage and copy of the game code) syncing
 * through the real worker code, over an in-memory database.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ALL_CHAPTERS } from '../../src/core/curriculum';
import { recordChapter } from '../../src/core/progress';
import { fetchVia, testEnv } from './fake-api';

type Api = typeof import('../../src/cloud/api');
type Profiles = typeof import('../../src/cloud/profile');

let env: ReturnType<typeof testEnv>;
let online = true;

interface Device {
  store: Map<string, string>;
  api: Api;
  profiles: Profiles;
  /** Runs `fn` on this device (its storage is the one in use until it finishes). */
  on<T>(fn: () => T | Promise<T>): Promise<T>;
}

async function device(seed: Record<string, unknown> = {}): Promise<Device> {
  vi.resetModules();
  const api = await import('../../src/cloud/api');
  const profiles = await import('../../src/cloud/profile');
  const store = new Map(Object.entries(seed).map(([k, v]) => [k, JSON.stringify(v)]));
  const storage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, String(v)),
    removeItem: (k: string) => void store.delete(k),
  };
  return {
    store,
    api,
    profiles,
    async on(fn) {
      (globalThis as { localStorage?: unknown }).localStorage = storage;
      return fn();
    },
  };
}

const playChapter = (p: import('../../src/core/progress').Progress, i: number) =>
  recordChapter(p, ALL_CHAPTERS[i], ALL_CHAPTERS[i].words.map((w) => ({ word: w.text, mistakes: 0, helped: 0, perfect: true })));

beforeEach(() => {
  env = testEnv();
  online = true;
  vi.stubGlobal('fetch', fetchVia(env, () => online));
  // Saves are pushed after a short delay; these tests sync by hand instead.
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('cloud sync', () => {
  it('signs in with the password and remembers who it is', async () => {
    const ipad = await device();
    expect(await ipad.on(() => ipad.api.signIn('nope'))).toEqual({ ok: false, reason: 'wrong' });
    expect(await ipad.on(() => ipad.api.getAuth())).toBeNull();
    expect(await ipad.on(() => ipad.api.signIn('OWL'))).toEqual({ ok: true, who: 'jasper' });
    expect(await ipad.on(() => ipad.api.getAuth()?.who)).toBe('jasper');
    online = false;
    expect(await ipad.on(() => ipad.api.signIn('owl'))).toEqual({ ok: false, reason: 'offline' });
  });

  it('moves the save from before sign-in into Jasper’s cloud profile', async () => {
    const legacy = { v: 1, name: 'Jasper', avatar: 'ron', cards: ['hagrid'], gems: 5, chapters: { b1c1: { plays: 1, done: true } } };
    const ipad = await device({ 'wizard-words:v1': legacy });
    await ipad.on(() => ipad.api.signIn('owl'));
    const jasper = await ipad.on(() => ipad.profiles.CloudProfile.for('jasper'));
    expect(jasper.progress.cards).toEqual(['hagrid']);
    expect(ipad.store.has('wizard-words:v1')).toBe(false);
    await ipad.on(() => jasper.sync());
    expect(jasper.state).toBe('synced');
    const saved = JSON.parse(env.DB.rows.get('jasper')!.data);
    expect(saved).toMatchObject({ avatar: 'ron', cards: ['hagrid'], gems: 5 });
  });

  it('forgets a grown-up sign-in from before there was one login', async () => {
    const ipad = await device({ 'wizard-words:auth': { token: 'old', who: 'parent' } });
    expect(await ipad.on(() => ipad.api.getAuth())).toBeNull();
  });

  it('merges Jasper’s offline play with a grown-up’s changes from another device', async () => {
    const ipad = await device();
    await ipad.on(() => ipad.api.signIn('owl'));
    const onIpad = await ipad.on(() => ipad.profiles.CloudProfile.for('jasper'));
    await ipad.on(() => {
      playChapter(onIpad.progress, 0);
      onIpad.save();
      return onIpad.sync();
    });
    expect(env.DB.rows.get('jasper')!.rev).toBe(1);

    // A grown-up, on a phone signed in as Jasper, sees his progress and sets this week's words.
    const phone = await device();
    await phone.on(() => phone.api.signIn('owl'));
    const onPhone = await phone.on(() => phone.profiles.CloudProfile.for('jasper'));
    await phone.on(() => onPhone.sync());
    expect(onPhone.progress.cards).toEqual(onIpad.progress.cards);
    await phone.on(() => {
      onPhone.progress.custom = ['ship', 'shop'];
      onPhone.progress.settings.breakAfter = 5;
      onPhone.save();
      return onPhone.sync();
    });

    // Meanwhile the iPad was offline, and Jasper played another chapter.
    online = false;
    await ipad.on(() => {
      playChapter(onIpad.progress, 1);
      onIpad.save();
      return onIpad.sync();
    });
    expect(onIpad.state).toBe('offline');
    online = true;
    const changed = vi.fn();
    onIpad.onChange(changed);
    await ipad.on(() => onIpad.sync());

    expect(onIpad.state).toBe('synced');
    expect(changed).toHaveBeenCalled();
    expect(onIpad.progress.custom).toEqual(['ship', 'shop']);
    expect(onIpad.progress.settings.breakAfter).toBe(5);
    expect(onIpad.progress.chapters[ALL_CHAPTERS[1].id]?.done).toBe(true);
    expect(onIpad.progress.cards).toHaveLength(2);

    // And the phone catches up.
    await phone.on(() => onPhone.sync());
    expect(onPhone.progress.cards).toHaveLength(2);
    expect(onPhone.progress.gems).toBe(onIpad.progress.gems);
  });

  it('keeps the same settings object, so open screens keep editing the live copy', async () => {
    const a = await device();
    await a.on(() => a.api.signIn('owl'));
    const pa = await a.on(() => a.profiles.CloudProfile.for('jasper'));
    const settings = pa.progress.settings;
    const b = await device();
    await b.on(() => b.api.signIn('owl'));
    const pb = await b.on(() => b.profiles.CloudProfile.for('jasper'));
    await b.on(() => {
      pb.progress.settings.volume = 0.2;
      pb.save();
      return pb.sync();
    });
    await a.on(() => pa.sync());
    expect(pa.progress.settings).toBe(settings);
    expect(settings.volume).toBe(0.2);
  });

  it('keeps unsent progress on the device when the sign-in stops working', async () => {
    const ipad = await device();
    await ipad.on(() => ipad.api.signIn('owl'));
    const signedOut = vi.fn();
    ipad.profiles.onSignedOut(signedOut);
    const p = await ipad.on(() => ipad.profiles.CloudProfile.for('jasper'));
    env.AUTH_SECRET = 'rotated';
    await ipad.on(() => {
      playChapter(p.progress, 0);
      p.save();
      return p.sync();
    });
    expect(signedOut).toHaveBeenCalled();
    expect(JSON.parse(ipad.store.get('wizard-words:v1:jasper')!).cards).toEqual(p.progress.cards);
    expect(JSON.parse(ipad.store.get('wizard-words:sync:jasper')!).dirty).toBe(true);
  });

  it('picks up where it left off after the app is reopened', async () => {
    const ipad = await device();
    await ipad.on(() => ipad.api.signIn('owl'));
    const first = await ipad.on(() => ipad.profiles.CloudProfile.for('jasper'));
    await ipad.on(() => {
      playChapter(first.progress, 0);
      first.save();
      return first.sync();
    });
    // Reopen: same storage, fresh copy of the code.
    vi.resetModules();
    const profiles: Profiles = await import('../../src/cloud/profile');
    const again = await ipad.on(() => profiles.CloudProfile.for('jasper'));
    expect(again.progress.cards).toEqual(first.progress.cards);
    await ipad.on(() => again.sync());
    expect(again.state).toBe('synced');
    expect(env.DB.rows.get('jasper')!.rev).toBe(1);
  });
});
