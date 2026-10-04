/**
 * The cloud-save API (api/ in this repo: a Cloudflare Worker + D1).
 *
 * One password, Jasper's. Signing in gives a token that is kept on this
 * device, so it is only typed once. The cloud keeps a save per profile:
 * Jasper's, a demo one, and any a grown-up adds.
 */

/** Who signed in: there is one login. */
export type Who = 'jasper';

/** A profile: its own progress and settings. */
export interface ProfileInfo {
  id: string;
  label: string;
}

/** Jasper's profile, the one everything starts on. */
export const JASPER = 'jasper';

export const API_URL: string = import.meta.env.VITE_API_URL ?? 'https://wizard-words-api.charlesjohnbeard.workers.dev';

const AUTH_KEY = 'wizard-words:auth';

export interface Auth {
  token: string;
  who: Who;
}

const isWho = (w: unknown): w is Who => w === 'jasper';

export function getAuth(): Auth | null {
  try {
    const a = JSON.parse(localStorage.getItem(AUTH_KEY) ?? 'null');
    return a && typeof a.token === 'string' && isWho(a.who) ? a : null;
  } catch {
    return null;
  }
}

export function setAuth(a: Auth | null): void {
  try {
    if (a) localStorage.setItem(AUTH_KEY, JSON.stringify(a));
    else localStorage.removeItem(AUTH_KEY);
  } catch {
    /* storage blocked: sign-in just won't be remembered */
  }
}

/** The cloud no longer accepts this device's sign-in. */
export class SignedOut extends Error {}

async function call(method: string, path: string, body?: unknown, token?: string): Promise<{ status: number; data: any }> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(API_URL + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  return { status: res.status, data: await res.json().catch(() => null) };
}

export type SignIn = { ok: true; who: Who } | { ok: false; reason: 'wrong' | 'busy' | 'offline' };

export async function signIn(password: string): Promise<SignIn> {
  try {
    const { status, data } = await call('POST', '/login', { password });
    if (status === 200 && typeof data?.token === 'string' && isWho(data.who)) {
      setAuth({ token: data.token, who: data.who });
      return { ok: true, who: data.who };
    }
    return { ok: false, reason: status === 401 ? 'wrong' : status === 429 ? 'busy' : 'offline' };
  } catch {
    return { ok: false, reason: 'offline' };
  }
}

/** The cloud's copy of a profile: `data` is null if nothing has been saved yet. */
export interface Remote {
  data: unknown;
  rev: number;
}

function token(): string {
  const auth = getAuth();
  if (!auth) throw new SignedOut();
  return auth.token;
}

export async function fetchProfile(id: string): Promise<Remote> {
  const sent = token();
  const { status, data } = await call('GET', `/profile/${id}`, undefined, sent);
  if (status === 401) throw new SignedOut();
  if (status !== 200) throw new Error(`Couldn't load profile ${id} (${status})`);
  // Each sync hands back a fresh token, so a device in use never signs out.
  const auth = getAuth();
  if (auth?.token === sent && typeof data.token === 'string') setAuth({ ...auth, token: data.token });
  return { data: data.data, rev: data.rev };
}

/** Saves over revision `rev`. If someone else saved since, returns their copy instead. */
export async function storeProfile(
  id: string,
  progress: unknown,
  rev: number,
  label?: string,
): Promise<{ ok: true; rev: number } | { ok: false; remote: Remote }> {
  const { status, data } = await call('PUT', `/profile/${id}`, { data: progress, rev, label }, token());
  if (status === 401) throw new SignedOut();
  if (status === 200) return { ok: true, rev: data.rev };
  if (status === 409) return { ok: false, remote: { data: data.data, rev: data.rev } };
  throw new Error(`Couldn't save profile ${id} (${status})`);
}

/** Every profile, Jasper's first. */
export async function listProfiles(): Promise<ProfileInfo[]> {
  const { status, data } = await call('GET', '/profiles', undefined, token());
  if (status === 401) throw new SignedOut();
  if (status !== 200) throw new Error(`Couldn't list profiles (${status})`);
  return data.profiles;
}

/**
 * Makes a new profile called `label`, starting from `progress`. Returns its
 * id, made from the name (and a number if that is taken).
 */
export async function createProfile(label: string, progress: unknown): Promise<string> {
  const base = label.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 24) || 'profile';
  for (let n = 1; n < 50; n++) {
    const id = n === 1 ? base : `${base}-${n}`;
    const res = await storeProfile(id, progress, 0, label);
    if (res.ok) return id;
  }
  throw new Error('No free name for the profile');
}

export async function deleteProfile(id: string): Promise<void> {
  const { status } = await call('DELETE', `/profile/${id}`, undefined, token());
  if (status === 401) throw new SignedOut();
  if (status !== 200) throw new Error(`Couldn't delete profile ${id} (${status})`);
}

const ACTIVE_KEY = 'wizard-words:active';

/** The profile this device plays as (Jasper's unless a grown-up switched). */
export function activeProfile(): ProfileInfo {
  try {
    const a = JSON.parse(localStorage.getItem(ACTIVE_KEY) ?? 'null');
    if (a && typeof a.id === 'string' && typeof a.label === 'string') return a;
  } catch {
    /* fall through */
  }
  return { id: JASPER, label: 'Jasper' };
}

export function setActiveProfile(p: ProfileInfo): void {
  try {
    localStorage.setItem(ACTIVE_KEY, JSON.stringify(p));
  } catch {
    /* storage blocked: stays on Jasper */
  }
}
