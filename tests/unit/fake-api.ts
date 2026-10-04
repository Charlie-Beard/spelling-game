/**
 * The cloud-save worker running in-process, over an in-memory stand-in for
 * its D1 table (it understands just the statements the worker uses).
 */
import worker, { type Database, type Env } from '../../api/src/index';

interface Row {
  data: string;
  rev: number;
  label: string;
}

export function fakeDb(): Database & { rows: Map<string, Row> } {
  const rows = new Map<string, Row>();
  return {
    rows,
    prepare(sql: string) {
      let args: unknown[] = [];
      const stmt = {
        bind(...a: unknown[]) {
          args = a;
          return stmt;
        },
        async first<T>(): Promise<T | null> {
          if (sql.startsWith('SELECT COUNT')) return { n: rows.size } as T;
          if (!sql.startsWith('SELECT data')) throw new Error(`fake D1: unexpected ${sql}`);
          const row = rows.get(args[0] as string);
          return (row ? { ...row } : null) as T | null;
        },
        async all<T>(): Promise<{ results: T[] }> {
          if (!sql.startsWith('SELECT who AS id')) throw new Error(`fake D1: unexpected ${sql}`);
          const results = [...rows].map(([id, r]) => ({ id, label: r.label })).sort((a, b) => a.label.localeCompare(b.label));
          return { results: results as T[] };
        },
        async run() {
          if (sql.startsWith('INSERT')) {
            const [who, label, data] = args as [string, string, string];
            if (rows.has(who)) return { meta: { changes: 0 } };
            rows.set(who, { data, rev: 1, label });
            return { meta: { changes: 1 } };
          }
          if (sql.startsWith('UPDATE')) {
            const [data, label, , who, rev] = args as [string, string | null, string, string, number];
            const row = rows.get(who);
            if (!row || row.rev !== rev) return { meta: { changes: 0 } };
            rows.set(who, { data, rev: rev + 1, label: label ?? row.label });
            return { meta: { changes: 1 } };
          }
          if (sql.startsWith('DELETE')) {
            return { meta: { changes: rows.delete(args[0] as string) ? 1 : 0 } };
          }
          throw new Error(`fake D1: unexpected ${sql}`);
        },
      };
      return stmt;
    },
  };
}

export const ORIGIN = 'https://game.test';

export function testEnv(over: Partial<Env> = {}): Env & { DB: ReturnType<typeof fakeDb> } {
  return {
    DB: fakeDb(),
    JASPER_PASSWORD: 'Owl',
    AUTH_SECRET: 'test-secret',
    ALLOWED_ORIGINS: `${ORIGIN},http://localhost:5173`,
    ...over,
  } as Env & { DB: ReturnType<typeof fakeDb> };
}

/** Calls the worker; returns status, JSON body and headers. */
export async function callApi(env: Env, method: string, path: string, o: { body?: unknown; token?: string; origin?: string } = {}) {
  const headers: Record<string, string> = {};
  if (o.token) headers.Authorization = `Bearer ${o.token}`;
  if (o.origin) headers.Origin = o.origin;
  const res = await worker.fetch(
    new Request(`https://api.test${path}`, { method, headers, body: o.body === undefined ? undefined : JSON.stringify(o.body) }),
    env,
  );
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : null, headers: res.headers };
}

/** A `fetch` that sends every request to the worker, or fails as if offline. */
export function fetchVia(env: Env, isOnline: () => boolean = () => true): typeof fetch {
  return async (input, init) => {
    if (!isOnline()) throw new TypeError('Failed to fetch');
    return worker.fetch(new Request(input, init), env);
  };
}
