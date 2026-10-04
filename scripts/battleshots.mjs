// Plays the Battle of Hogwarts and screenshots key moments.
import { chromium } from 'playwright';
const out = process.argv[2] ?? '.';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1180, height: 820 }, hasTouch: true });
await ctx.addInitScript(() => {
  localStorage.setItem('wizard-words:v1', JSON.stringify({ v: 1, name: '', avatar: 'hermione', chapters: {}, cards: [], horcruxes: [], gems: 0, difficulty: 1, review: [], words: {}, unlockAll: true, custom: [], chaptersSinceBreak: 0, lastPlayed: 0, settings: { volume: 0.8, calm: false, breakAfter: 0, idleHintSeconds: 0 } }));
});
const page = await ctx.newPage();
page.on('pageerror', (e) => console.log('pageerror:', e.message));
await page.goto('http://localhost:5173/?scene=chapter&id=b7c4');
await page.waitForTimeout(1500);
await page.screenshot({ path: `${out}/battle-intro.png` });
await page.getByRole('button', { name: 'Play' }).click();
await page.waitForTimeout(1600);
await page.screenshot({ path: `${out}/battle-field.png` });
for (let w = 0; w < 8; w++) {
  await page.locator('.slot.target').waitFor({ timeout: 30000 });
  for (;;) {
    const t = page.locator('.slot.target');
    if ((await t.count()) === 0) break;
    const want = await t.getAttribute('data-want');
    await page.locator(`.tile:not(.placed)[data-g="${want}"]`).first().click();
    await page.waitForTimeout(450);
  }
  if (w === 2) {
    await page.waitForTimeout(7200);
    await page.screenshot({ path: `${out}/battle-shield.png` });
  }
}
await page.waitForTimeout(9500);
await page.screenshot({ path: `${out}/battle-victory.png` });
await page.waitForTimeout(3500);
await page.screenshot({ path: `${out}/battle-victory2.png` });
await page.locator('.card-reward').waitFor({ timeout: 30000 });
await page.waitForTimeout(4000);
await page.screenshot({ path: `${out}/battle-complete.png` });
await browser.close();
