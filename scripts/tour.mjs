// Screenshot tour of every scene. Usage: node scripts/tour.mjs <outdir>
import { chromium } from 'playwright';
import { asJasper } from './signed-in.mjs';
const out = process.argv[2] ?? '.';
const base = 'http://localhost:5173/';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1180, height: 820 }, hasTouch: true });
await asJasper(ctx);
const page = await ctx.newPage();
page.on('pageerror', (e) => console.log('pageerror:', e.message));
page.on('console', (m) => m.type() === 'error' && console.log('console:', m.text()));
const seed = async (progress) => {
  await ctx.addInitScript((p) => {
    if (!sessionStorage.getItem('seeded')) {
      localStorage.setItem('wizard-words:v1:jasper', JSON.stringify(p));
      sessionStorage.setItem('seeded', '1');
    }
  }, progress);
};
const shot = async (q, name, wait = 2500) => {
  await page.goto(base + q);
  await page.waitForTimeout(wait);
  await page.screenshot({ path: `${out}/tour-${name}.png` });
};
const prog = {
  v: 1, name: 'Sam', avatar: 'harry', chapters: { b1c1: { plays: 1, done: true }, b1c2: { plays: 1, done: true } },
  cards: ['hagrid', 'ollivander', 'dobby'], horcruxes: ['ring'], gems: 12, difficulty: 1, review: [], words: { cat: { seen: 2, perfect: 1, mistakes: 3, helped: 1 } },
  unlockAll: false, custom: ['dog', 'frog'],
  lastPlayed: 0, settings: { volume: 0.8, calm: false, idleHintSeconds: 12 },
};
await seed(prog);
await shot('', 'title', 1800);
await shot('?scene=choose', 'choose', 2200);
await shot('?scene=map', 'map', 2600);
await shot('?scene=map&book=2', 'map2', 2000);
await shot('?scene=chapter&id=b1c3', 'intro', 2400);
await shot('?scene=chapter&id=b1c5', 'intro-horcrux', 2400);
await shot('?scene=album', 'album', 2000);
await shot('?scene=parent', 'parent', 1200);
await browser.close();
