/**
 * A stand-in for the cloud-save API (api/), served by intercepting the
 * game's requests, so browser tests never touch the real one. Jasper's
 * password here is "owl" (any capitals).
 */
import { expect, type Page } from '@playwright/test';

export interface FakeCloud {
  jasper: { data: any; rev: number };
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Access-Control-Allow-Methods': 'GET, PUT, POST, OPTIONS',
};

export async function fakeCloud(page: Page, seed?: object): Promise<FakeCloud> {
  const cloud: FakeCloud = { jasper: { data: seed ?? null, rev: seed ? 1 : 0 } };
  await page.route(/\/(login|profile\/\w+)$/, async (route) => {
    const req = route.request();
    const json = (status: number, body: unknown) => route.fulfill({ status, headers: CORS, contentType: 'application/json', body: JSON.stringify(body) });
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS });
    const path = new URL(req.url()).pathname;

    if (path.endsWith('/login')) {
      const ok = String(req.postDataJSON()?.password ?? '').trim().toLowerCase() === 'owl';
      return ok ? json(200, { token: 'test-jasper', who: 'jasper' }) : json(401, { error: 'Wrong password' });
    }
    if (!path.endsWith('/profile/jasper')) return json(404, { error: 'Not found' });
    if (req.headers().authorization !== 'Bearer test-jasper') return json(401, { error: 'Please sign in' });
    const p = cloud.jasper;
    if (req.method() === 'GET') return json(200, { ...p, token: 'test-jasper' });
    const body = req.postDataJSON();
    if (body.rev !== p.rev) return json(409, p);
    p.data = body.data;
    p.rev++;
    return json(200, { rev: p.rev });
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
