/**
 * Wizard Words cloud save: a tiny Cloudflare Worker + D1 database that keeps
 * each profile's progress and settings (Jasper's, a demo one to show
 * people, any others added), so they follow from device to device. The
 * game itself stays a static site.
 *
 *   POST   /login        { password }           → { token, who }
 *   GET    /profiles                            → { profiles: [{ id, label }] }
 *   GET    /profile/:id                         → { data, rev, label, token }
 *   PUT    /profile/:id  { data, rev, label? }  → { rev }, or 409 { data, rev }
 *   DELETE /profile/:id                         → { ok } (never Jasper's)
 *
 * There is one password, Jasper's: a secret set with `wrangler secret put`,
 * never in the repo. Signing in reaches every profile; picking one is done
 * in the game, behind its grown-ups' gate.
 *
 * Saves are versioned (`rev`): a PUT only lands if nobody else saved since
 * the client last synced. Otherwise it gets the newer copy back to merge.
 */

/** Who signed in. There is one login, Jasper's household's. */
export type Who = 'jasper';
const WHO: readonly Who[] = ['jasper'];

/** Jasper's profile: always listed, never deleted. */
const JASPER = 'jasper';
const PROFILE_ID = /^[a-z0-9][a-z0-9-]{0,31}$/;
const MAX_PROFILES = 20;

// The few D1 and rate-limiter calls used here, so this file typechecks
// without the full Workers type definitions.
interface Statement {
  bind(...values: unknown[]): Statement;
  first<T>(): Promise<T | null>;
  all<T>(): Promise<{ results: T[] }>;
  run(): Promise<{ meta: { changes: number } }>;
}
export interface Database {
  prepare(sql: string): Statement;
}
interface RateLimiter {
  limit(o: { key: string }): Promise<{ success: boolean }>;
}

export interface Env {
  DB: Database;
  JASPER_PASSWORD: string;
  AUTH_SECRET: string;
  /** Comma-separated origins allowed to call the API (where the game is served). */
  ALLOWED_ORIGINS: string;
  LOGIN_LIMIT?: RateLimiter;
}

/** Tokens are refreshed on every sync, so only a long-unused device signs out. */
const TOKEN_DAYS = 400;
const MAX_BODY = 256 * 1024;

const encoder = new TextEncoder();

// ---------------------------------------------------------------------------
// Tokens: base64url(JSON { who, exp }) + "." + HMAC-SHA-256 signature
// ---------------------------------------------------------------------------

function b64url(bytes: ArrayBuffer | Uint8Array): string {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function b64urlDecode(s: string): Uint8Array<ArrayBuffer> {
  return Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));
}

function hmacKey(env: Env): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', encoder.encode(env.AUTH_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

export async function signToken(env: Env, who: Who, now = Date.now()): Promise<string> {
  const payload = b64url(encoder.encode(JSON.stringify({ who, exp: now + TOKEN_DAYS * 86_400_000 })));
  const sig = await crypto.subtle.sign('HMAC', await hmacKey(env), encoder.encode(payload));
  return `${payload}.${b64url(sig)}`;
}

export async function verifyToken(env: Env, token: string): Promise<Who | null> {
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  try {
    const ok = await crypto.subtle.verify('HMAC', await hmacKey(env), b64urlDecode(sig), encoder.encode(payload));
    if (!ok) return null;
    const { who, exp } = JSON.parse(new TextDecoder().decode(b64urlDecode(payload)));
    return WHO.includes(who) && typeof exp === 'number' && exp > Date.now() ? who : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Passwords: forgiving of case and stray spaces (a six-year-old types one)
// ---------------------------------------------------------------------------

const normalise = (s: string): string => s.trim().toLowerCase();

/** Compares SHA-256 digests, so the comparison time says nothing about the password. */
async function same(a: string, b: string): Promise<boolean> {
  const [x, y] = await Promise.all([a, b].map((s) => crypto.subtle.digest('SHA-256', encoder.encode(s))));
  const xv = new Uint8Array(x);
  const yv = new Uint8Array(y);
  let diff = 0;
  for (let i = 0; i < xv.length; i++) diff |= xv[i] ^ yv[i];
  return diff === 0;
}

export async function whosePassword(env: Env, password: unknown): Promise<Who | null> {
  if (typeof password !== 'string' || !normalise(password) || !env.JASPER_PASSWORD) return null;
  return (await same(normalise(password), normalise(env.JASPER_PASSWORD))) ? 'jasper' : null;
}

// ---------------------------------------------------------------------------
// HTTP
// ---------------------------------------------------------------------------

function cors(env: Env, request: Request): Record<string, string> {
  const origin = request.headers.get('Origin') ?? '';
  const allowed = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim());
  if (!allowed.includes(origin)) return {};
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  const text = await request.text();
  if (text.length > MAX_BODY) return null;
  try {
    const body = JSON.parse(text);
    return body && typeof body === 'object' ? body : null;
  } catch {
    return null;
  }
}

interface Row {
  data: string;
  rev: number;
  label: string;
}

async function current(env: Env, id: string): Promise<{ data: unknown; rev: number; label: string }> {
  const row = await env.DB.prepare('SELECT data, rev, label FROM profiles WHERE who = ?').bind(id).first<Row>();
  return row ? { data: JSON.parse(row.data), rev: row.rev, label: row.label } : { data: null, rev: 0, label: id === JASPER ? 'Jasper' : id };
}

const cleanLabel = (l: unknown): string | null => (typeof l === 'string' && l.trim() ? l.trim().slice(0, 30) : null);

async function route(env: Env, request: Request): Promise<{ status: number; body: unknown }> {
  const path = new URL(request.url).pathname.split('/').filter(Boolean);

  if (path[0] === 'login' && path.length === 1 && request.method === 'POST') {
    const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
    if (env.LOGIN_LIMIT && !(await env.LOGIN_LIMIT.limit({ key: ip })).success) {
      return { status: 429, body: { error: 'Too many tries. Wait a minute.' } };
    }
    const body = await readJson(request);
    const who = await whosePassword(env, body?.password);
    if (!who) return { status: 401, body: { error: 'Wrong password' } };
    return { status: 200, body: { token: await signToken(env, who), who } };
  }

  // Everything below needs a sign-in.
  const auth = request.headers.get('Authorization') ?? '';
  const who = auth.startsWith('Bearer ') ? await verifyToken(env, auth.slice(7)) : null;
  if ((path[0] === 'profiles' || path[0] === 'profile') && !who) return { status: 401, body: { error: 'Please sign in' } };

  if (path[0] === 'profiles' && path.length === 1 && request.method === 'GET') {
    const { results } = await env.DB.prepare('SELECT who AS id, label FROM profiles ORDER BY label').all<{ id: string; label: string }>();
    const others = results.filter((p) => p.id !== JASPER);
    return { status: 200, body: { profiles: [{ id: JASPER, label: results.find((p) => p.id === JASPER)?.label ?? 'Jasper' }, ...others] } };
  }

  if (path[0] === 'profile' && path.length === 2) {
    const id = path[1];
    if (!PROFILE_ID.test(id)) return { status: 404, body: { error: 'Not found' } };

    if (request.method === 'GET') {
      return { status: 200, body: { ...(await current(env, id)), token: await signToken(env, who!) } };
    }

    if (request.method === 'DELETE') {
      if (id === JASPER) return { status: 400, body: { error: 'Jasper’s profile can’t be deleted' } };
      await env.DB.prepare('DELETE FROM profiles WHERE who = ?').bind(id).run();
      return { status: 200, body: { ok: true } };
    }

    if (request.method === 'PUT') {
      const body = await readJson(request);
      const data = body?.data as { v?: unknown } | undefined;
      const rev = body?.rev;
      if (!data || typeof data !== 'object' || data.v !== 1 || !Number.isInteger(rev) || (rev as number) < 0) {
        return { status: 400, body: { error: 'Expected { data, rev }' } };
      }
      const label = cleanLabel(body?.label);
      const json = JSON.stringify(data);
      const now = new Date().toISOString();
      if (rev === 0 && id !== JASPER) {
        const count = await env.DB.prepare('SELECT COUNT(*) AS n FROM profiles').first<{ n: number }>();
        if ((count?.n ?? 0) >= MAX_PROFILES) return { status: 400, body: { error: 'Too many profiles' } };
      }
      const result =
        rev === 0
          ? await env.DB.prepare('INSERT INTO profiles (who, label, data, rev, updated_at) VALUES (?, ?, ?, 1, ?) ON CONFLICT (who) DO NOTHING')
              .bind(id, label ?? (id === JASPER ? 'Jasper' : id), json, now)
              .run()
          : await env.DB.prepare('UPDATE profiles SET data = ?, label = COALESCE(?, label), rev = rev + 1, updated_at = ? WHERE who = ? AND rev = ?')
              .bind(json, label, now, id, rev)
              .run();
      if (result.meta.changes === 1) return { status: 200, body: { rev: (rev as number) + 1 } };
      // Someone else saved first (or the name is taken): hand back their copy.
      return { status: 409, body: await current(env, id) };
    }
  }

  return { status: 404, body: { error: 'Not found' } };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const headers = cors(env, request);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    let status = 500;
    let body: unknown = { error: 'Something went wrong' };
    try {
      ({ status, body } = await route(env, request));
    } catch (e) {
      console.error(e);
    }
    return new Response(JSON.stringify(body), {
      status,
      headers: { ...headers, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  },
};
