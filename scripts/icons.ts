/**
 * Renders the app icons (Hedwig on a night-blue, torn-paper tile) to PNG.
 *   npx tsx scripts/icons.ts
 */
import { chromium } from 'playwright';
import { hedwig } from '../src/art/characters/hedwig';
import { C } from '../src/art/palette';
import { rect, tear, toPath } from '../src/art/paper';

const owl = hedwig('icon-owl').replace(/<g class="f f[12]">[\s\S]*?<\/g><\/g>/g, '</g>');
const tile = toPath(tear(rect(40, 40, 432, 432, 70), 7, { wobble: 3, jag: 1.4, step: 8 }));

function html(size: number, maskable: boolean): string {
  const bg = maskable ? `<rect width="512" height="512" fill="${C.night}"/>` : '';
  return `<html><body style="margin:0;background:transparent">
  <svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    ${bg}
    ${maskable ? '' : `<path d="${tile}" fill="${C.night}"/>`}
    <circle cx="256" cy="250" r="${maskable ? 150 : 170}" fill="#2f3860"/>
    <g transform="translate(${maskable ? 126 : 106} ${maskable ? 116 : 96}) scale(${maskable ? 0.87 : 1})">${owl.replace('<svg', '<svg width="300" height="300"')}</g>
  </svg></body></html>`;
}

const browser = await chromium.launch();
const page = await browser.newPage();
const out = new URL('../public/icons/', import.meta.url).pathname;
for (const [name, size, maskable] of [
  ['icon-192.png', 192, false],
  ['icon-512.png', 512, false],
  ['maskable-512.png', 512, true],
  ['apple-touch-icon.png', 180, true],
] as const) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(html(size, maskable));
  await page.screenshot({ path: out + name, omitBackground: !maskable, clip: { x: 0, y: 0, width: size, height: size } });
  console.log('wrote', name);
}
await browser.close();
