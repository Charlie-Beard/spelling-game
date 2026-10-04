// Playtest of the less-travelled paths. Usage: node scripts/playtest2.mjs <outdir>
import { chromium } from 'playwright';
import { asJasper } from './signed-in.mjs';

const out = process.argv[2] ?? '.';
const browser = await chromium.launch();
const t0 = Date.now();
const log = (...a) => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s]`, ...a);
const base = (over = {}) => ({
  v: 1, name: 'Sam', avatar: 'ron', chapters: {}, cards: [], horcruxes: [], gems: 10, difficulty: 2, review: [], words: {},
  unlockAll: false, custom: [], chaptersSinceBreak: 0, lastPlayed: Date.now(),
  settings: { volume: 0.8, calm: false, breakAfter: 3, idleHintSeconds: 12 }, ...over,
});
const done = (ids) => Object.fromEntries(ids.map((id) => [id, { plays: 1, done: true }]));

async function session(progress) {
  const ctx = await browser.newContext({ viewport: { width: 1180, height: 820 }, hasTouch: true });
  await asJasper(ctx);
  await ctx.addInitScript((p) => {
    if (!sessionStorage.getItem('seeded')) {
      localStorage.setItem('wizard-words:v1:jasper', JSON.stringify(p));
      sessionStorage.setItem('seeded', '1');
    }
  }, progress);
  const page = await ctx.newPage();
  page.on('pageerror', (e) => log('PAGEERROR', e.message));
  page.on('console', (m) => m.type() === 'error' && log('CONSOLE', m.text()));
  return { ctx, page };
}
const ready = (page) => page.waitForFunction(() => {
  const s = document.querySelector('.scene.spell');
  return s && !s.hasAttribute('data-busy') && document.querySelector('.slot.target');
}, null, { timeout: 30000 });
const settle = (page) => page.waitForFunction(() => { const s = document.querySelector('.scene.spell'); return !s || !s.hasAttribute('data-busy'); }, null, { timeout: 30000 });
async function finishWord(page) {
  for (;;) {
    const want = await page.locator('.slot.target').first().getAttribute('data-want', { timeout: 2000 }).catch(() => null);
    if (!want) return;
    await page.locator(`.tile:not(.placed)[data-g="${want}"]`).first().click({ timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(60);
    const full = await page.evaluate(() => { const n = document.querySelectorAll('.slot').length; return n > 0 && document.querySelectorAll('.tile.placed').length >= n; });
    if (full) return;
    await settle(page);
  }
}
async function playChapter(page, n) {
  for (let w = 0; w < n; w++) {
    await ready(page);
    await finishWord(page);
  }
}

// 1. Hedwig help button + review word + break screen (third chapter in a row).
{
  const { ctx, page } = await session(base({ chapters: done(['b1c1', 'b1c2']), cards: ['hagrid', 'ollivander'], review: ['cat'], chaptersSinceBreak: 2 }));
  await page.goto('http://localhost:5173/?scene=map');
  await page.waitForTimeout(1500);
  await page.locator('.stop.current').click({ force: true });
  await page.getByRole('button', { name: 'Play' }).click({ force: true });
  await ready(page);
  const stars = await page.locator('.progress-stars .s').count();
  log('chapter 3 stars (5 words + review?):', stars, 'first word slots:', await page.locator('.slot').evaluateAll((s) => s.map((x) => x.dataset.want).join('')));
  await page.screenshot({ path: `${out}/p2-01-review-word.png` });
  await page.getByRole('button', { name: 'Ask Hedwig for help' }).click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${out}/p2-02-hedwig-glow.png` });
  await settle(page);
  await page.getByRole('button', { name: 'Ask Hedwig for help' }).click();
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${out}/p2-03-hedwig-flying.png` });
  await settle(page);
  await finishWord(page);
  await playChapter(page, stars - 1);
  await page.locator('.scene.complete').waitFor({ timeout: 40000 });
  await page.waitForTimeout(6000);
  await page.screenshot({ path: `${out}/p2-04-break-due.png` });
  const doneBtn = page.getByRole('button', { name: 'Done' });
  log('break due → Done button present:', await doneBtn.count());
  await doneBtn.click({ force: true });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${out}/p2-05-break.png` });
  await ctx.close();
}

// 2. Finishing book 1 (horcrux) → next → book 2 map.
{
  const { ctx, page } = await session(base({ chapters: done(['b1c1', 'b1c2', 'b1c3', 'b1c4']), cards: ['hagrid', 'ollivander', 'trevor', 'nick'] }));
  await page.goto('http://localhost:5173/?scene=chapter&id=b1c5');
  await page.waitForTimeout(800);
  await page.getByRole('button', { name: 'Play' }).click({ force: true });
  await playChapter(page, 5);
  await page.locator('.horcrux-reward').waitFor({ timeout: 40000 });
  await page.waitForFunction(() => getComputedStyle(document.querySelector('[aria-label="Next chapter"]')).opacity === '1', null, { timeout: 20000 });
  await page.getByRole('button', { name: 'Next chapter' }).click({ force: true });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${out}/p2-06-book2-map.png` });
  log('after horcrux, map banner:', await page.locator('.banner-text').first().textContent());
  await ctx.close();
}

// 3. My words practice (custom words, no pictures, device speech).
{
  const { ctx, page } = await session(base({ custom: ['dog', 'ship', 'night'] }));
  await page.goto('http://localhost:5173/?scene=map');
  await page.waitForTimeout(1500);
  await page.getByRole('button', { name: 'Practise my words' }).click({ force: true });
  await ready(page);
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${out}/p2-07-my-words.png` });
  await ctx.close();
}

// 4. Calm mode on the spelling screen.
{
  const { ctx, page } = await session(base({ settings: { volume: 0.8, calm: true, breakAfter: 0, idleHintSeconds: 12 } }));
  await page.goto('http://localhost:5173/?scene=chapter&id=b1c1');
  await page.waitForTimeout(800);
  const t = Date.now();
  await page.getByRole('button', { name: 'Play' }).click({ force: true });
  await ready(page);
  log('calm: Play → ready', Date.now() - t, 'ms');
  await finishWord(page);
  const t2 = Date.now();
  await ready(page);
  log('calm: word → next word ready', Date.now() - t2, 'ms');
  await ctx.close();
}

// 5. Grown-ups' corner tabs.
{
  const { ctx, page } = await session(base({ words: { cat: { seen: 3, perfect: 1, mistakes: 4, helped: 1 }, ship: { seen: 1, perfect: 0, mistakes: 2, helped: 0 } } }));
  await page.goto('http://localhost:5173/?scene=parent');
  await page.waitForTimeout(800);
  for (const tab of ['Settings', 'Record sounds', 'My words']) {
    await page.getByRole('button', { name: tab }).click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${out}/p2-08-parent-${tab.replace(/ /g, '-')}.png` });
  }
  await ctx.close();
}
log('done');
await browser.close();
