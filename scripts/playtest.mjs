// Child-like playtest of the first chapters with timings and screenshots.
// Usage: node scripts/playtest.mjs <outdir>
import { chromium } from 'playwright';
import { asJasper } from './signed-in.mjs';

const out = process.argv[2] ?? '.';
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const ctx = await browser.newContext({ viewport: { width: 1180, height: 820 }, hasTouch: true });
await asJasper(ctx);
const page = await ctx.newPage();
const t0 = Date.now();
const log = (...a) => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s]`, ...a);
page.on('pageerror', (e) => log('PAGEERROR', e.message));
page.on('console', (m) => m.type() === 'error' && log('CONSOLE', m.text()));
let shot = 0;
const snap = async (name) => page.screenshot({ path: `${out}/pt-${String(++shot).padStart(2, '0')}-${name}.png` });

const ready = () => page.waitForFunction(() => {
  const s = document.querySelector('.scene.spell');
  return s && !s.hasAttribute('data-busy') && document.querySelector('.slot.target');
}, null, { timeout: 30000 }).catch(async (e) => {
  await snap('STUCK');
  log('STUCK state:', await page.evaluate(() => ({ busy: document.querySelector('.scene.spell')?.hasAttribute('data-busy'), slots: [...document.querySelectorAll('.slot')].map((s) => s.className + ':' + s.dataset.want), tiles: [...document.querySelectorAll('.tile')].map((t) => t.dataset.g + (t.classList.contains('placed') ? '*' : '')) })));
  throw e;
});
const target = async () => page.locator('.slot.target').first().getAttribute('data-want', { timeout: 2000 }).catch(() => null);
const settle = () => page.waitForFunction(() => { const s = document.querySelector('.scene.spell'); return !s || !s.hasAttribute('data-busy'); }, null, { timeout: 30000 });
/** Spells the rest of the current word, then returns as soon as it's complete. */
const finishWord = async (gap = 60) => {
  for (;;) {
    const want = await target();
    if (!want) return;
    await tapTile(want);
    await page.waitForTimeout(gap);
    const done = await page.evaluate(() => {
      const slots = document.querySelectorAll('.slot').length;
      return slots > 0 && document.querySelectorAll('.tile.placed').length >= slots;
    });
    if (done) return;
    await settle();
  }
};
const tapTile = async (g) => page.locator(`.tile:not(.placed)[data-g="${g}"]`).first().click({ timeout: 3000 }).catch((e) => log('  (tile not clickable)', g, e.message.split('\n').slice(0, 6).join(' | ')));

await page.goto('http://localhost:5173/');
await page.waitForTimeout(1200);
await snap('title');
let t = Date.now();
await page.locator('.letter').click({ force: true });
await page.getByRole('button', { name: 'Harry' }).waitFor();
log('letter → choose screen', Date.now() - t, 'ms');
await page.waitForTimeout(400);
await snap('choose-early');
t = Date.now();
await page.getByRole('button', { name: 'Harry' }).click();
await page.locator('.stop.current').waitFor();
log('choose → map', Date.now() - t, 'ms');
await page.waitForTimeout(300);
await snap('map-arrive');

// Tap a locked chapter like a curious child.
await page.locator('.stop.locked').first().click();
await page.waitForTimeout(500);
t = Date.now();
await page.locator('.stop.current').click({ force: true });
await page.getByRole('button', { name: 'Play' }).waitFor();
log('map → intro', Date.now() - t, 'ms');
await page.waitForTimeout(500);
await snap('intro');
// Tap Play immediately (impatient).
t = Date.now();
await page.getByRole('button', { name: 'Play' }).click({ force: true });
await page.locator('.scene.spell').waitFor();
// Tap tiles while the first word is still arriving.
await page.waitForTimeout(700);
await snap('word1-arriving');
const early = await page.locator('.tile').first().getAttribute('data-g');
await page.locator('.tile').first().click().catch(() => {});
log('tapped a tile during arrival:', early, '(busy =', await page.locator('.scene.spell').getAttribute('data-busy'), ')');
await ready();
log('Play → first word ready', Date.now() - t, 'ms');
await snap('word1-ready');

// Word 1: one double-tap on the right tile, then a wrong tile, then finish.
let g = await target();
await page.locator(`.tile:not(.placed)[data-g="${g}"]`).first().dblclick().catch(() => {});
await page.waitForTimeout(600);
const placed = await page.locator('.tile.placed').count();
log('double-tapped right tile → placed tiles:', placed);
g = await target();
const wrong = page.locator(`.tile:not(.placed):not([data-g="${g}"])`).first();
if (await wrong.count()) {
  t = Date.now();
  await wrong.click();
  await page.waitForTimeout(200);
  await snap('word1-wrong');
  await ready();
  log('wrong tap → can tap again', Date.now() - t, 'ms');
}
// Hear button spam
for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'Hear the word again' }).click();
await finishWord();
t = Date.now();
await page.waitForTimeout(1500);
await snap('word1-celebrate');
await ready();
log('word complete → next word ready', Date.now() - t, 'ms');

// Word 2: idle to see Hedwig's nudge.
log('idling 14s…');
await page.waitForTimeout(13500);
await snap('word2-idle');
await finishWord();
// Words 3-5 quickly, tapping very fast.
for (let w = 3; w <= 5; w++) {
  await ready();
  t = Date.now();
  await finishWord();
  log(`word ${w} spelt in`, Date.now() - t, 'ms');
}
t = Date.now();
await page.locator('.card-reward').waitFor({ timeout: 40000 });
log('last word → reward screen', Date.now() - t, 'ms');
await page.waitForTimeout(1500);
await snap('reward-early');
t = Date.now();
await page.getByRole('button', { name: 'Next chapter' }).waitFor({ state: 'visible' });
await page.waitForFunction(() => getComputedStyle(document.querySelector('[aria-label="Next chapter"]')).opacity === '1', null, { timeout: 20000 });
log('reward → next button visible', Date.now() - t + 1500, 'ms');
await snap('reward-ready');
await page.getByRole('button', { name: 'Next chapter' }).click({ force: true });
await page.waitForTimeout(2500);
await snap('map-after');

// Chapter 2: quit halfway through via the map button.
await page.locator('.stop.current').click({ force: true });
await page.getByRole('button', { name: 'Play' }).click({ force: true });
await ready();
await snap('ch2-word1');
await page.getByRole('button', { name: 'Back to the map' }).click();
await page.waitForTimeout(1500);
await snap('ch2-quit-map');

// Album
await page.getByRole('button', { name: 'My cards and Horcruxes' }).click();
await page.waitForTimeout(1500);
await page.locator('.album-card').first().click();
await page.waitForTimeout(900);
await snap('album-zoom');
log('done');
await browser.close();
