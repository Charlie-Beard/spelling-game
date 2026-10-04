import '@fontsource/andika/latin-400.css';
import '@fontsource/andika/latin-700.css';
import './styles/base.css';
import './styles/paper.css';
import './styles/ui.css';
import './styles/parent.css';
import { installGrain } from './art/grain';
import { parchmentDefs, uiDefs } from './art/ui';
import { setVolumes, unlock } from './audio/engine';
import { loadManifest } from './audio/voice';
import { load, save, type Progress } from './core/progress';
import { Game } from './game';
import { Stage } from './stage';
import { setCalm } from './ui/anim';
import { Director } from './ui/director';
import { h } from './ui/dom';
import type { App } from './ui/scene';
import { installRotateScreen } from './ui/rotate';

const stage = new Stage(document.getElementById('stage')!);
installRotateScreen(stage, document.getElementById('rotate')!);

installGrain();
document.body.insertAdjacentHTML('beforeend', uiDefs() + parchmentDefs());
stage.el.append(h('div', { class: 'vignette' }), h('div', { class: 'grain' }));

const director = new Director(stage.el);
const progress: Progress = load();
setCalm(progress.settings.calm);
const game = new Game();

const app: App = {
  stage,
  progress,
  nav: game,
  save: () => save(progress),
  go: (scene, t) => director.go(scene, t),
};
game.attach(app);

// Audio can only start inside a tap on iPad.
window.addEventListener(
  'pointerdown',
  () => {
    void unlock().then(() => setVolumes({ master: progress.settings.volume }));
  },
  { once: true },
);
void loadManifest();

// Dev shortcuts: ?scene=map|choose|album|parent|chapter&id=b1c1
const q = new URLSearchParams(location.search);
const scene = q.get('scene');
if (scene === 'map') game.map(Number(q.get('book')) || undefined);
else if (scene === 'choose') game.choose();
else if (scene === 'album') game.album();
else if (scene === 'parent') game.parent();
else if (scene === 'chapter') game.chapter(q.get('id') ?? 'b1c1');
else game.title();

// Offline support (production builds only).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => void navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
