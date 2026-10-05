// Films a chapter's reward story onto ONE contact sheet, to check it by eye.
//
//   node scripts/storyshots.mjs b1c1 [out.png] [everyMs] [avatar]
//
// Starts its own dev server without live reload (so files saved meanwhile
// can't restart the story), plays the story with speech timed like the
// recorded voices, grabs a small frame every `everyMs` (default 1500) until
// the Next button appears, and writes them as a labelled grid to out.png
// (default test-results/<id>.png). Prints the length, the captions and any
// errors. One image to look at instead of dozens of screenshots.
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { chromium } from 'playwright';
import { createServer } from 'vite';
import { asJasper } from './signed-in.mjs';

const [, , id = 'b1c1', out = `test-results/${id}.png`, every = '1500', avatar = 'harry'] = process.argv;
mkdirSync(dirname(out), { recursive: true });
const server = await createServer({ server: { port: 0, strictPort: false, hmr: false, watch: null }, logLevel: 'error', clearScreen: false });
await server.listen();
const origin = server.resolvedUrls.local[0].replace(/\/$/, '');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1180, height: 820 }, deviceScaleFactor: 1, hasTouch: true });
await asJasper(page);
await page.addInitScript((avatar) => {
  // A saved player who has chosen a character, so the story can show them.
  const key = 'wizard-words:v1:jasper';
  let p = {};
  try {
    p = JSON.parse(localStorage.getItem(key) ?? '{}') ?? {};
  } catch {}
  localStorage.setItem(key, JSON.stringify({ ...p, v: 1, name: 'Jasper', avatar }));
  // Speech that takes as long as a recorded line would (~15 characters a second).
  const synth = {
    getVoices: () => [],
    cancel() {},
    speak(u) {
      setTimeout(() => u.onend?.(), 400 + u.text.length * 65);
    },
  };
  Object.defineProperty(window, 'speechSynthesis', { value: synth });
  // When the story's Next button appears, by the page's own clock.
  new MutationObserver((_, obs) => {
    if (document.querySelector('[aria-label="Next"]')) {
      window.__storyEnd = performance.now();
      obs.disconnect();
    }
  }).observe(document, { childList: true, subtree: true });
}, avatar);
const errors = [];
// Unrecorded voice lines 404 and fall back to speech: not an error.
page.on('console', (m) => m.type() === 'error' && !m.text().startsWith('Failed to load resource') && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(e.message));
await page.goto(`${origin}/?scene=story&id=${id}`);

const frames = [];
const captions = [];
const start = Date.now();
while (Date.now() - start < 120_000) {
  await page.waitForTimeout(+every);
  const cap = (await page.locator('.story-caption.on .story-caption-text > span:last-child').textContent().catch(() => null)) ?? '';
  if (cap && captions.at(-1) !== cap) captions.push(cap);
  const shot = await page.screenshot({ type: 'jpeg', quality: 55 });
  frames.push({ t: ((Date.now() - start) / 1000).toFixed(0), cap, src: 'data:image/jpeg;base64,' + shot.toString('base64') });
  if (await page.locator('[aria-label="Next"]').count()) break;
}
const secs = ((await page.evaluate(() => window.__storyEnd ?? performance.now()))) / 1000;

// Lay the frames out 4 across, each a quarter size, labelled with time and caption.
const sheet = await browser.newPage({ viewport: { width: 1200, height: 400 } });
await sheet.setContent(`<body style="margin:0;background:#222;font:12px sans-serif;color:#eee;display:grid;grid-template-columns:repeat(4,295px);gap:5px;padding:5px">${frames
  .map((f, i) => `<div><img src="${f.src}" style="width:295px;display:block"><div style="height:30px;overflow:hidden">#${i} ${f.t}s ${f.cap.replace(/</g, '')}</div></div>`)
  .join('')}</body>`);
await sheet.screenshot({ path: out, fullPage: true });

console.log(`${id}: story lasts ${secs.toFixed(0)} s (incl. ~5 s of curtains and title), ${frames.length} frames → ${out}`);
for (const c of captions) console.log('  “' + c + '”');
if (errors.length) console.log('ERRORS:\n  ' + [...new Set(errors)].join('\n  '));
await browser.close();
await server.close();
