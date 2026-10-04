/** Development-only art lab: renders illustrations for review. */
import '@fontsource/andika/400.css';
import '@fontsource/andika/700.css';
import './styles/base.css';
import './styles/paper.css';
import { installGrain } from './art/grain';
import { picture, pictureNames } from './art/pictures';
import { characters } from './art/characters';

installGrain();
const params = new URLSearchParams(location.search);
const set = params.get('set') ?? 'words';
const only = params.get('p')?.split(',');
const size = Number(params.get('size') ?? 210);
const all: Record<string, () => string> =
  set === 'chars'
    ? characters
    : Object.fromEntries(pictureNames().map((n) => [n, () => picture(n)]));
const names = Object.keys(all).filter((n) => !only || only.includes(n));
document.body.style.cssText = 'position:static;overflow:auto;background:#e9d9b4;touch-action:auto';
document.body.innerHTML = `<div style="display:flex;flex-wrap:wrap;gap:14px;padding:16px">${names
  .map(
    (n) =>
      `<figure style="margin:0;width:${size}px;background:#fffaf0;border-radius:8px;padding:6px">${all[n]()}<figcaption style="text-align:center;font:700 22px Andika">${n}</figcaption></figure>`,
  )
  .join('')}</div>`;
document.body.classList.add('still');
