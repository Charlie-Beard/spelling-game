// Screenshots the spelling screen for given chapters at a given difficulty.
// Usage: node scripts/spellshots.mjs <outdir> <difficulty> <chapter...>
import { chromium } from 'playwright';
import { asJasper } from './signed-in.mjs';
const [, , out = '.', diff = '0', ...chapters] = process.argv;
const browser = await chromium.launch();
for (const id of chapters) {
  const ctx = await browser.newContext({ viewport: { width: 1180, height: 820 }, hasTouch: true });
  await asJasper(ctx);
  await ctx.addInitScript((d) => {
    localStorage.setItem('wizard-words:v1:jasper', JSON.stringify({ v: 1, name: '', avatar: 'ron', chapters: {}, cards: [], horcruxes: [], gems: 3, difficulty: d, review: [], words: {}, unlockAll: true, custom: [], lastPlayed: 0, settings: { volume: 0.8, calm: false, idleHintSeconds: 12 } }));
  }, Number(diff));
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('pageerror:', e.message));
  await page.goto(`http://localhost:5173/?scene=chapter&id=${id}`);
  await page.getByRole('button', { name: 'Play' }).click();
  await page.locator('.slot.target').waitFor({ timeout: 20000 });
  await page.waitForTimeout(600);
  // place the first sound so a filled slot shows too
  const want = await page.locator('.slot.target').getAttribute('data-want');
  await page.locator(`.tile:not(.placed)[data-g="${want}"]`).first().click();
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${out}/spell-${id}-d${diff}.png` });
  await ctx.close();
}
await browser.close();
