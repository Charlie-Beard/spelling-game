import '@fontsource/andika/latin-400.css';
import '@fontsource/andika/latin-700.css';
import './styles/base.css';
import './styles/paper.css';
import './styles/ui.css';
import './styles/parent.css';
import { installGrain } from './art/grain';
import { parchmentDefs, uiDefs } from './art/ui';
import { setVolumes, unlock } from './audio/engine';
import { loadManifest, setPlayerName } from './audio/voice';
import { getAuth, setAuth, type Who } from './cloud/api';
import { CloudProfile, keepInSync, onSignedOut } from './cloud/profile';
import { startSession } from './core/progress';
import { Game } from './game';
import { LoginScene } from './scenes/login';
import { Stage } from './stage';
import { setCalm } from './ui/anim';
import { Director } from './ui/director';
import { h, wait } from './ui/dom';
import type { App } from './ui/scene';
import { installRotateScreen } from './ui/rotate';

const stage = new Stage(document.getElementById('stage')!);
installRotateScreen(stage, document.getElementById('rotate')!);

installGrain();
document.body.insertAdjacentHTML('beforeend', uiDefs() + parchmentDefs());
stage.el.append(h('div', { class: 'vignette' }), h('div', { class: 'grain' }));

const director = new Director(stage.el);
const game = new Game();
let profile: CloudProfile | null = null;

const app: App = {
  stage,
  get profile() {
    if (!profile) throw new Error('Not signed in yet');
    return profile;
  },
  get progress() {
    return app.profile.progress;
  },
  nav: game,
  save: () => profile?.save(),
  signOut: async () => {
    if (profile) await Promise.race([profile.sync(), wait(4000)]);
    setAuth(null);
    location.reload();
  },
  go: (scene, t) => director.go(scene, t),
};
game.attach(app);

// Audio can only start inside a tap on iPad.
let audioOn = false;
window.addEventListener(
  'pointerdown',
  () => {
    void unlock().then(() => {
      audioOn = true;
      applySettings();
    });
  },
  { once: true },
);
void loadManifest();

/** Puts the player's settings into effect (also when they change on another device). */
function applySettings(): void {
  if (!profile) return;
  const p = profile.progress;
  setCalm(p.settings.calm);
  setPlayerName(p.name);
  if (audioOn) setVolumes({ master: p.settings.volume });
}

function start(who: Who): void {
  profile = CloudProfile.for(who);
  startSession(profile.progress);
  applySettings();
  profile.onChange(applySettings);
  keepInSync(profile);

  // Dev shortcuts: ?scene=map|choose|album|parent|chapter&id=b1c1
  const q = new URLSearchParams(location.search);
  const scene = q.get('scene');
  if (scene === 'map') game.map(Number(q.get('book')) || undefined);
  else if (scene === 'choose') game.choose();
  else if (scene === 'album') game.album();
  else if (scene === 'parent') game.parent();
  else if (scene === 'chapter') game.chapter(q.get('id') ?? 'b1c1');
  else game.title();
}

// If the cloud stops accepting this device's sign-in, ask for the password
// next time the app opens (not mid-game: play carries on and is kept here).
onSignedOut(() => setAuth(null));

const auth = getAuth();
if (auth) start(auth.who);
else void director.go(new LoginScene(app, start));

// Offline support (production builds only).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => void navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
