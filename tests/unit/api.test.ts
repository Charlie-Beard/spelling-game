import { describe, expect, it } from 'vitest';
import { signToken } from '../../api/src/index';
import { callApi, ORIGIN, testEnv } from './fake-api';

async function tokenFor(env: ReturnType<typeof testEnv>, password: string): Promise<string> {
  return (await callApi(env, 'POST', '/login', { body: { password } })).body.token;
}

describe('POST /login', () => {
  it('knows who you are from the password', async () => {
    const env = testEnv();
    expect((await callApi(env, 'POST', '/login', { body: { password: 'Owl' } })).body.who).toBe('jasper');
    expect((await callApi(env, 'POST', '/login', { body: { password: 'Toad' } })).body.who).toBe('parent');
  });

  it('forgives capitals and stray spaces', async () => {
    const env = testEnv();
    const res = await callApi(env, 'POST', '/login', { body: { password: '  oWL ' } });
    expect(res.status).toBe(200);
    expect(res.body.who).toBe('jasper');
  });

  it('turns away a wrong, empty or missing password', async () => {
    const env = testEnv();
    for (const body of [{ password: 'owls' }, { password: '' }, { password: '   ' }, {}, { password: 42 }]) {
      expect((await callApi(env, 'POST', '/login', { body })).status).toBe(401);
    }
  });

  it('slows down guessing', async () => {
    const env = testEnv({ LOGIN_LIMIT: { limit: async () => ({ success: false }) } });
    expect((await callApi(env, 'POST', '/login', { body: { password: 'Owl' } })).status).toBe(429);
  });
});

describe('/profile', () => {
  it('needs a valid, unexpired token', async () => {
    const env = testEnv();
    expect((await callApi(env, 'GET', '/profile/jasper')).status).toBe(401);
    const token = await tokenFor(env, 'owl');
    expect((await callApi(env, 'GET', '/profile/jasper', { token: token.slice(0, -2) + 'xx' })).status).toBe(401);
    expect((await callApi(env, 'GET', '/profile/jasper', { token: 'nonsense' })).status).toBe(401);
    const old = await signToken(env, 'jasper', Date.now() - 500 * 86_400_000);
    expect((await callApi(env, 'GET', '/profile/jasper', { token: old })).status).toBe(401);
    const otherSecret = await signToken({ ...env, AUTH_SECRET: 'other' }, 'parent');
    expect((await callApi(env, 'GET', '/profile/jasper', { token: otherSecret })).status).toBe(401);
  });

  it('lets Jasper reach only his own profile, and a grown-up both', async () => {
    const env = testEnv();
    const jasper = await tokenFor(env, 'owl');
    const parent = await tokenFor(env, 'toad');
    expect((await callApi(env, 'GET', '/profile/jasper', { token: jasper })).status).toBe(200);
    expect((await callApi(env, 'GET', '/profile/parent', { token: jasper })).status).toBe(403);
    expect((await callApi(env, 'PUT', '/profile/parent', { token: jasper, body: { data: { v: 1 }, rev: 0 } })).status).toBe(403);
    expect((await callApi(env, 'GET', '/profile/jasper', { token: parent })).status).toBe(200);
    expect((await callApi(env, 'GET', '/profile/parent', { token: parent })).status).toBe(200);
    expect((await callApi(env, 'GET', '/profile/someone', { token: parent })).status).toBe(404);
    expect(env.DB.rows.size).toBe(0);
  });

  it('starts empty and hands back a fresh token', async () => {
    const env = testEnv();
    const res = await callApi(env, 'GET', '/profile/jasper', { token: await tokenFor(env, 'owl') });
    expect(res.body).toMatchObject({ data: null, rev: 0 });
    expect(typeof res.body.token).toBe('string');
  });

  it('saves only over the revision the device last saw', async () => {
    const env = testEnv();
    const token = await tokenFor(env, 'owl');
    const put = (data: object, rev: number) => callApi(env, 'PUT', '/profile/jasper', { token, body: { data: { v: 1, ...data }, rev } });

    expect((await put({ gems: 1 }, 0)).body).toEqual({ rev: 1 });
    // A second device that also thought it was first gets the saved copy back.
    const clash = await put({ gems: 9 }, 0);
    expect(clash.status).toBe(409);
    expect(clash.body).toEqual({ data: { v: 1, gems: 1 }, rev: 1 });

    expect((await put({ gems: 2 }, 1)).body).toEqual({ rev: 2 });
    const stale = await put({ gems: 5 }, 1);
    expect(stale.status).toBe(409);
    expect(stale.body).toEqual({ data: { v: 1, gems: 2 }, rev: 2 });

    const got = await callApi(env, 'GET', '/profile/jasper', { token });
    expect(got.body).toMatchObject({ data: { v: 1, gems: 2 }, rev: 2 });
  });

  it('rejects malformed saves', async () => {
    const env = testEnv();
    const token = await tokenFor(env, 'owl');
    for (const body of [{ data: { v: 2 }, rev: 0 }, { data: { v: 1 }, rev: -1 }, { data: { v: 1 }, rev: 1.5 }, { data: 'x', rev: 0 }, { rev: 0 }]) {
      expect((await callApi(env, 'PUT', '/profile/jasper', { token, body })).status).toBe(400);
    }
    const huge = { v: 1, junk: 'x'.repeat(300 * 1024) };
    expect((await callApi(env, 'PUT', '/profile/jasper', { token, body: { data: huge, rev: 0 } })).status).toBe(400);
  });
});

describe('CORS', () => {
  it('lets the game’s own site call the API, and no other', async () => {
    const env = testEnv();
    const ok = await callApi(env, 'OPTIONS', '/profile/jasper', { origin: ORIGIN });
    expect(ok.status).toBe(204);
    expect(ok.headers.get('Access-Control-Allow-Origin')).toBe(ORIGIN);
    expect(ok.headers.get('Access-Control-Allow-Headers')).toContain('Authorization');
    const other = await callApi(env, 'POST', '/login', { origin: 'https://elsewhere.test', body: { password: 'owl' } });
    expect(other.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });
});
