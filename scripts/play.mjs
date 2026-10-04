// Scripted play-through of the first word(s) with screenshots.
import { chromium } from 'playwright';
const out = process.argv[2] ?? '.';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1180, height: 820 }, hasTouch: true });
page.on('pageerror', (e) => console.log('pageerror:', e.message));
page.on('console', (m) => m.type() === 'error' && console.log('console:', m.text()));
await page.goto('http://localhost:5173/' + (process.argv[3] ?? ''));
await page.waitForTimeout(3500);
const tapGlyph = async (g) => {
  const t = page.locator('.tile:not(.placed)', { has: page.locator(`.glyph:text-is("${g}")`) }).first();
  await t.click();
};
await tapGlyph('c');
await page.waitForTimeout(700);
await page.screenshot({ path: `${out}/play-1.png` });
await tapGlyph('t'); // wrong
await page.waitForTimeout(250);
await page.screenshot({ path: `${out}/play-2-wrong.png` });
await page.waitForTimeout(1500);
await tapGlyph('t'); // wrong again → glow
await page.waitForTimeout(1500);
await page.screenshot({ path: `${out}/play-3-glow.png` });
await tapGlyph('t'); // third → Hedwig
await page.waitForTimeout(900);
await page.screenshot({ path: `${out}/play-4-hedwig.png` });
await page.waitForTimeout(2000);
await tapGlyph('t');
await page.waitForTimeout(1600);
await page.screenshot({ path: `${out}/play-5-blend.png` });
await page.waitForTimeout(3000);
await page.screenshot({ path: `${out}/play-6-done.png` });
await page.waitForTimeout(4000);
await page.screenshot({ path: `${out}/play-7-next.png` });
await browser.close();
