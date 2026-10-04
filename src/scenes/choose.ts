/** "Who do you want to be?" — pick Harry, Ron or Hermione. */
import { sfx } from '../audio/sfx';
import { voice } from '../audio/voice';
import { characters } from '../art/characters';
import { castleNight } from '../art/scenery';
import { AVATARS, type Avatar } from '../core/curriculum';
import { PHRASES } from '../core/phrases';
import { pop, sm } from '../ui/anim';
import { frogCard } from '../ui/components';
import { h, place } from '../ui/dom';
import { Scene } from '../ui/scene';

export const AVATAR_NAMES: Record<Avatar, string> = { harry: 'Harry', ron: 'Ron', hermione: 'Hermione' };

export class ChooseScene extends Scene {
  private cards: HTMLElement[] = [];
  private chosen = false;

  build(): void {
    const r = this.root;
    r.append(h('div', { class: 'backdrop-wrap', html: castleNight('choose-castle') }));
    r.append(h('div', { class: 'dim' }));
    r.append(place(h('div', { class: 'big-title', style: 'font-size:64px' }, 'Who do you want to be?'), 0, 50));

    AVATARS.forEach((id, i) => {
      const btn = h('button', { class: 'choose-card', 'aria-label': AVATAR_NAMES[id] });
      btn.append(frogCard(characters[id](), AVATAR_NAMES[id], { w: 270 }));
      place(btn, 125 + i * 330, 190, 270, 378);
      this.tap(btn, () => void this.pick(id, btn));
      r.append(btn);
      this.cards.push(btn);
    });
  }

  async enter(): Promise<void> {
    this.cards.forEach((c, i) => void sm(c, 0.5, { startAt: { y: 200, opacity: 0, rotation: i - 1 }, y: 0, opacity: 1, rotation: (i - 1) * 3, delay: i * 0.12, ease: 'back.out(1.5)' }));
    await this.sleep(700);
    void voice.say(PHRASES.choose);
  }

  private async pick(id: Avatar, btn: HTMLElement): Promise<void> {
    if (this.chosen) return;
    this.chosen = true;
    sfx.sparkle();
    this.app.progress.avatar = id;
    this.app.save();
    this.cards.forEach((c) => c !== btn && void sm(c, 0.35, { opacity: 0.25, scale: 0.9 }));
    await sm(btn, 0.4, { scale: 1.12, rotation: 0, y: -10, ease: 'back.out(2)' }).then();
    void pop(btn, 1.05);
    await voice.say(PHRASES[id]);
    await this.sleep(300);
    void voice.say(PHRASES.letsGo);
    await this.sleep(900);
    this.app.nav.map();
  }
}
