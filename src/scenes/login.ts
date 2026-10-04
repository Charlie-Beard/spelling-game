/**
 * "What's the password?" The way in. The password says who is playing
 * (Jasper or a grown-up), and the device remembers it after that.
 */
import { unlock } from '../audio/engine';
import { sfx } from '../audio/sfx';
import { hedwig } from '../art/characters/hedwig';
import { C } from '../art/palette';
import { castleNight } from '../art/scenery';
import { parchment } from '../art/ui';
import { signIn, type Who } from '../cloud/api';
import { breathe, sm, wobble } from '../ui/anim';
import { sealButton } from '../ui/components';
import { h, place } from '../ui/dom';
import { Scene, type App } from '../ui/scene';

const TRY_AGAIN = {
  wrong: 'That’s not the password. Try again!',
  busy: 'Too many tries. Wait a minute, then try again.',
  offline: 'Can’t reach Hogwarts. Check the internet, then try again.',
};

export class LoginScene extends Scene {
  private card!: HTMLElement;
  private input!: HTMLInputElement;
  private message!: HTMLElement;
  private busy = false;
  readonly hidesGear = true;

  constructor(
    app: App,
    private readonly onSignedIn: (who: Who) => void,
  ) {
    super(app, 'login');
  }

  build(): void {
    const r = this.root;
    r.append(h('div', { class: 'backdrop-wrap', html: castleNight('login-castle') }), h('div', { class: 'dim' }));
    r.append(place(h('div', { class: 'big-title', style: 'font-size:104px' }, 'Wizard Words'), 0, 46));

    // Kept in the top half: the iPad keyboard covers the bottom.
    this.card = place(h('div', { class: 'login-card', html: parchment(660, 320, 'login-card', C.cream, 1) }), 300, 196, 660, 320);
    const form = h('form', { class: 'login-form', autocomplete: 'off' });
    this.input = h('input', {
      type: 'text',
      name: 'password',
      'aria-label': 'Password',
      autocomplete: 'off',
      autocapitalize: 'none',
      autocorrect: 'off',
      spellcheck: 'false',
      enterkeyhint: 'go',
      maxlength: 40,
    });
    const go = sealButton('tick', { x: 520, y: 128, size: 100, color: C.greenDark, aria: 'Go in', name: 'login-go' });
    form.append(h('h2', {}, 'What’s the password?'), this.input);
    this.message = h('p', { class: 'login-message', role: 'status' });
    this.card.append(form, go, this.message);
    r.append(this.card);

    const owl = place(h('div', { class: 'login-owl', html: hedwig('login-owl') }), 90, 330, 200, 200);
    r.append(owl);
    this.onCleanup(breathe(owl, 0.03, 3));

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      void this.submit();
    });
    this.tap(go, () => void this.submit());
  }

  enter(): void {
    sm(this.card, 0.5, { startAt: { y: 260, rotation: -4 }, y: 0, rotation: 0, ease: 'back.out(1.4)' });
  }

  private async submit(): Promise<void> {
    if (this.busy) return;
    if (!this.input.value.trim()) {
      this.input.focus();
      return;
    }
    this.busy = true;
    this.card.classList.add('busy');
    this.message.textContent = '';
    void unlock();
    const res = await signIn(this.input.value);
    this.busy = false;
    this.card.classList.remove('busy');
    if (!this.alive) return;
    if (res.ok) {
      this.input.blur();
      sfx.sparkle();
      await sm(this.card, 0.35, { scale: 1.06, opacity: 0, ease: 'power2.in' });
      this.onSignedIn(res.who);
      return;
    }
    sfx.wrong();
    void wobble(this.card);
    this.message.textContent = TRY_AGAIN[res.reason];
    if (res.reason === 'wrong') this.input.select();
  }
}
