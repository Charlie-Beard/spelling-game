/** Development-only art lab: renders illustrations on the stage for review. */
import '@fontsource/andika/400.css';
import '@fontsource/andika/700.css';
import './styles/base.css';
import './styles/paper.css';
import { installGrain } from './art/grain';
import { book1Pictures } from './art/pictures/book1';
import { hedwig } from './art/characters/hedwig';

const gallery: Record<string, () => string> = { ...book1Pictures, hedwig: () => hedwig() };

installGrain();
const stage = document.getElementById('stage')!;
const params = new URLSearchParams(location.search);
const only = params.get('p');
const names = Object.keys(gallery).filter((n) => !only || n === only);
stage.style.background = 'var(--parchment-200)';
stage.innerHTML = `<div style="display:flex;flex-wrap:wrap;gap:20px;padding:30px">${names
  .map((n) => `<figure style="margin:0;width:${only ? 700 : 260}px">${gallery[n]()}<figcaption style="text-align:center;font:700 28px Andika">${n}</figcaption></figure>`)
  .join('')}</div><div class="grain"></div>`;
if (params.has('still')) stage.classList.add('still');
