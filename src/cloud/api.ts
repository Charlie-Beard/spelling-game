/**
 * The cloud-save API (api/ in this repo: a Cloudflare Worker + D1).
 *
 * The password says who is playing: Jasper or a grown-up. Signing in gives
 * a token that is kept on this device, so it is only typed once.
 */

export type Who = 'jasper' | 'parent';

export const API_URL: string = import.meta.env.VITE_API_URL ?? 'https://wizard-words-api.charlesjohnbeard.workers.dev';

const AUTH_KEY = 'wizard-words:auth';

export interface Auth {
  token: string;
  who: Who;
}

const isWho = (w: unknown): w is Who => w === 'jasper' || w === 'parent';

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

export async function fetchProfile(who: Who): Promise<Remote> {
  const sent = token();
  const { status, data } = await call('GET', `/profile/${who}`, undefined, sent);
  if (status === 401) throw new SignedOut();
  if (status !== 200) throw new Error(`Couldn't load ${who}'s profile (${status})`);
  // Each sync hands back a fresh token, so a device in use never signs out.
  const auth = getAuth();
  if (auth?.token === sent && typeof data.token === 'string') setAuth({ ...auth, token: data.token });
  return { data: data.data, rev: data.rev };
}

/** Saves over revision `rev`. If someone else saved since, returns their copy instead. */
export async function storeProfile(who: Who, progress: unknown, rev: number): Promise<{ ok: true; rev: number } | { ok: false; remote: Remote }> {
  const { status, data } = await call('PUT', `/profile/${who}`, { data: progress, rev }, token());
  if (status === 401) throw new SignedOut();
  if (status === 200) return { ok: true, rev: data.rev };
  if (status === 409) return { ok: false, remote: { data: data.data, rev: data.rev } };
  throw new Error(`Couldn't save ${who}'s profile (${status})`);
}
