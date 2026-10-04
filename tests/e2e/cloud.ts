/**
 * A stand-in for the cloud-save API (api/), served by intercepting the
 * game's requests, so browser tests never touch the real one. Passwords:
 * "owl" for Jasper, "toad" for a grown-up (any capitals).
 */
import type { Page } from '@playwright/test';

export type Who = 'jasper' | 'parent';

export interface FakeCloud {
  profiles: Record<Who, { data: any; rev: number }>;
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Access-Control-Allow-Methods': 'GET, PUT, POST, OPTIONS',
};

export async function fakeCloud(page: Page, seed: Partial<Record<Who, object>> = {}): Promise<FakeCloud> {
  const cloud: FakeCloud = {
    profiles: {
      jasper: { data: seed.jasper ?? null, rev: seed.jasper ? 1 : 0 },
      parent: { data: seed.parent ?? null, rev: seed.parent ? 1 : 0 },
    },
  };
  await page.route(/\/(login|profile\/\w+)$/, async (route) => {
    const req = route.request();
    const json = (status: number, body: unknown) => route.fulfill({ status, headers: CORS, contentType: 'application/json', body: JSON.stringify(body) });
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS });
    const path = new URL(req.url()).pathname;

    if (path.endsWith('/login')) {
      const pw = String(req.postDataJSON()?.password ?? '').trim().toLowerCase();
      const who = pw === 'owl' ? 'jasper' : pw === 'toad' ? 'parent' : null;
      return who ? json(200, { token: `test-${who}`, who }) : json(401, { error: 'Wrong password' });
    }

    const target = path.split('/').pop() as Who;
    const me = (req.headers().authorization ?? '').replace('Bearer test-', '');
    if (me !== 'jasper' && me !== 'parent') return json(401, { error: 'Please sign in' });
    if (me !== 'parent' && me !== target) return json(403, { error: 'Not yours' });
    const p = cloud.profiles[target];
    if (req.method() === 'GET') return json(200, { ...p, token: `test-${me}` });
    const body = req.postDataJSON();
    if (body.rev !== p.rev) return json(409, p);
    p.data = body.data;
    p.rev++;
    return json(200, { rev: p.rev });
  });
  return cloud;
}

/** Starts the page already signed in, as if the password was typed on an earlier visit. */
export async function signedInAs(page: Page, who: Who): Promise<void> {
  await page.addInitScript((w) => {
    if (!localStorage.getItem('wizard-words:auth')) localStorage.setItem('wizard-words:auth', JSON.stringify({ token: `test-${w}`, who: w }));
  }, who);
}

/** Presses and holds the grown-ups' cog until the corner opens. */
export async function holdCog(page: Page): Promise<void> {
  const box = (await page.getByRole('button', { name: 'Grown-ups: press and hold' }).boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(3300);
  await page.mouse.up();
}
