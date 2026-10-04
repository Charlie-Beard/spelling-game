import '@fontsource/andika/400.css';
import '@fontsource/andika/700.css';
import './styles/base.css';
import './styles/paper.css';
import './styles/ui.css';
import { installGrain } from './art/grain';
import { parchmentDefs, uiDefs } from './art/ui';
import { unlock } from './audio/engine';
import { BOOKS } from './core/curriculum';
import { load, save, type Progress } from './core/progress';
import { SpellScene } from './scenes/spell';
import { Stage } from './stage';
import { setCalm } from './ui/anim';
import { Director } from './ui/director';
import { h } from './ui/dom';
import type { App } from './ui/scene';

const stage = new Stage(document.getElementById('stage')!);
const rotate = document.getElementById('rotate')!;
stage.onOrientation((portrait) => (rotate.hidden = !portrait));
rotate.hidden = !stage.isPortrait;
rotate.textContent = 'Please turn the iPad sideways';

installGrain();
document.body.insertAdjacentHTML('beforeend', uiDefs() + parchmentDefs());
stage.el.append(h('div', { class: 'vignette' }), h('div', { class: 'grain' }));

const director = new Director(stage.el);
const progress: Progress = load();
setCalm(progress.settings.calm);

const app: App = {
  stage,
  progress,
  save: () => save(progress),
  go: (scene, t) => director.go(scene, t),
};

window.addEventListener('pointerdown', () => void unlock(), { once: true });

const book = BOOKS[0];
const chapter = book.chapters[0];
void app.go(
  new SpellScene(app, {
    book,
    chapter,
    words: chapter.words,
    onDone: () => {},
    onQuit: () => {},
  }),
);
