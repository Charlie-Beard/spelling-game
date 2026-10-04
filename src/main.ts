import '@fontsource/andika/400.css';
import '@fontsource/andika/700.css';
import './styles/base.css';
import { Stage } from './stage';

const stage = new Stage(document.getElementById('stage')!);
const rotate = document.getElementById('rotate')!;

stage.onOrientation((portrait) => {
  rotate.hidden = !portrait;
});
rotate.hidden = !stage.isPortrait;
rotate.textContent = 'Please turn the iPad sideways';

stage.el.innerHTML = '<div class="scene" style="display:grid;place-items:center;color:#f6ecd4;font-size:64px">Wizard Words</div>';
