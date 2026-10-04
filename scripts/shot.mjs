// Usage: node scripts/shot.mjs <url-path> <out.png> [width height]
import { chromium } from 'playwright';
const [, , path = '/', out = 'shot.png', w = '1180', h = '820'] = process.argv;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1, hasTouch: true });
page.on('console', (m) => m.type() === 'error' && console.log('console:', m.text()));
page.on('pageerror', (e) => console.log('pageerror:', e.message));
await page.goto('http://localhost:5173' + path);
await page.waitForTimeout(+(process.env.WAIT ?? 800));
await page.screenshot({ path: out });
await browser.close();
