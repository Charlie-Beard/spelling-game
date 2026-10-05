import '@fontsource/andika/latin-400.css';
import '@fontsource/andika/latin-700.css';
import './styles/base.css';
import './styles/paper.css';
import './styles/ui.css';
import './styles/parent.css';
import './styles/story.css';
import { installGrain } from './art/grain';
import { parchmentDefs, uiDefs } from './art/ui';
import { setVolumes, unlock } from './audio/engine';
import { loadManifest, setPlayerName } from './audio/voice';
import { activeProfile, getAuth, JASPER, setActiveProfile, setAuth } from './cloud/api';
import { CloudProfile, keepInSync, onSignedOut } from './cloud/profile';
import { Game } from './game';
import { LoginScene } from './scenes/login';
import { Stage } from './stage';
import { setCalm } from './ui/anim';
import { Director } from './ui/director';
import { h, place, wait } from './ui/dom';
import { installGear } from './ui/gear';
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
  switchProfile: async (to) => {
    // Send this profile's changes, and fetch the other's, so it opens as itself.
    await Promise.race([Promise.all([profile?.sync(), CloudProfile.for(to.id).sync()]), wait(5000)]);
    setActiveProfile(to);
    // Start afresh on the new profile, at the title screen.
    location.href = location.pathname;
  },
  go: (scene, t) => director.go(scene, t),
};
game.attach(app);
installGear(stage.el, () => game.parent());

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

async function start(): Promise<void> {
  const active = activeProfile();
  profile = CloudProfile.for(active.id);
  // A profile new to this device: fetch it before showing anything.
  if (!profile.cached && active.id !== JASPER) await Promise.race([profile.sync(), wait(5000)]);
  // Anyone but Jasper gets a name badge, so a demo is never mistaken for his game.
  if (active.id !== JASPER) stage.el.append(place(h('div', { class: 'profile-badge' }, active.label), 12, 80));
  applySettings();
  profile.onChange(applySettings);
  keepInSync(profile);

  // Dev shortcuts: ?scene=map|choose|album|parent|chapter|story&id=b1c1
  const q = new URLSearchParams(location.search);
  const scene = q.get('scene');
  if (scene === 'map') game.map(Number(q.get('book')) || undefined);
  else if (scene === 'choose') game.choose();
  else if (scene === 'album') game.album();
  else if (scene === 'parent') game.parent();
  else if (scene === 'chapter') game.chapter(q.get('id') ?? 'b1c1');
  else if (scene === 'story') game.story(q.get('id') ?? 'b1c1', () => game.map());
  else game.title();
}

// If the cloud stops accepting this device's sign-in, ask for the password
// next time the app opens (not mid-game: play carries on and is kept here).
onSignedOut(() => setAuth(null));

const auth = getAuth();
if (auth) void start();
else void director.go(new LoginScene(app, () => void start()));

// Offline support (production builds only).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => void navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
