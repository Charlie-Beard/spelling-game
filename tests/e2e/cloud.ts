/**
 * A stand-in for the cloud-save API (api/), served by intercepting the
 * game's requests, so browser tests never touch the real one. Jasper's
 * password here is "owl" (any capitals).
 */
import { expect, type Page } from '@playwright/test';

export interface FakeProfile {
  label: string;
  data: any;
  rev: number;
}

export type FakeCloud = Record<string, FakeProfile>;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS',
};

/** `jasper` is Jasper's save; `others` are extra profiles (e.g. { demo: { label: 'Demo', data } }). */
export async function fakeCloud(page: Page, jasper?: object, others: Record<string, { label: string; data: object }> = {}): Promise<FakeCloud> {
  const cloud: FakeCloud = {};
  if (jasper) cloud.jasper = { label: 'Jasper', data: jasper, rev: 1 };
  for (const [id, p] of Object.entries(others)) cloud[id] = { ...p, rev: 1 };

  await page.route(/\/(login|profiles|profile\/[\w-]+)$/, async (route) => {
    const req = route.request();
    const json = (status: number, body: unknown) => route.fulfill({ status, headers: CORS, contentType: 'application/json', body: JSON.stringify(body) });
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS });
    const path = new URL(req.url()).pathname;

    if (path.endsWith('/login')) {
      const ok = String(req.postDataJSON()?.password ?? '').trim().toLowerCase() === 'owl';
      return ok ? json(200, { token: 'test-jasper', who: 'jasper' }) : json(401, { error: 'Wrong password' });
    }
    if (req.headers().authorization !== 'Bearer test-jasper') return json(401, { error: 'Please sign in' });
    if (path.endsWith('/profiles')) {
      const others = Object.entries(cloud)
        .filter(([id]) => id !== 'jasper')
        .map(([id, p]) => ({ id, label: p.label }))
        .sort((a, b) => a.label.localeCompare(b.label));
      return json(200, { profiles: [{ id: 'jasper', label: 'Jasper' }, ...others] });
    }

    const id = path.split('/').pop()!;
    const p = cloud[id];
    if (req.method() === 'GET') return json(200, { data: p?.data ?? null, rev: p?.rev ?? 0, label: p?.label ?? id, token: 'test-jasper' });
    if (req.method() === 'DELETE') {
      delete cloud[id];
      return json(200, { ok: true });
    }
    const body = req.postDataJSON();
    if (body.rev !== (p?.rev ?? 0)) return json(409, { data: p?.data ?? null, rev: p?.rev ?? 0, label: p?.label });
    cloud[id] = { label: body.label ?? p?.label ?? id, data: body.data, rev: body.rev + 1 };
    return json(200, { rev: body.rev + 1 });
  });
  return cloud;
}

/** Starts the page already signed in, as if the password was typed on an earlier visit. */
export async function signedIn(page: Page): Promise<void> {
  await page.addInitScript(() => {
    if (!localStorage.getItem('wizard-words:auth')) localStorage.setItem('wizard-words:auth', JSON.stringify({ token: 'test-jasper', who: 'jasper' }));
  });
}

/** Reads the sum on the grown-ups' gate and works out its answer. */
export async function sumAnswer(page: Page): Promise<number> {
  const text = (await page.locator('.gate-sum').innerText()).replace('=', '').trim();
  const [a, op, b] = text.split(' ');
  return op === '×' ? Number(a) * Number(b) : Number(a) / Number(b);
}

/** Taps a number on the gate's keypad, digit by digit. */
export async function key(page: Page, n: number | string): Promise<void> {
  for (const d of String(n)) await page.locator('.gate-key', { hasText: new RegExp(`^${d}$`) }).click();
}

/** Taps the gear and answers the sum, opening the grown-ups' corner. */
export async function openCorner(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Grown-ups' }).click();
  await key(page, await sumAnswer(page));
  await page.getByRole('button', { name: 'OK' }).click();
  await expect(page.getByRole('heading', { name: 'Grown-ups’ corner' })).toBeVisible({ timeout: 10_000 });
}
