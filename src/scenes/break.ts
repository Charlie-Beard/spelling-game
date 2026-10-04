/** A calm "time for a break" screen: Hedwig asleep under the moon. */
import { gsap } from 'gsap';
import { sfx } from '../audio/sfx';
import { hedwig } from '../art/characters/hedwig';
import { C } from '../art/palette';
import { band, piece, svg } from '../art/paper';
import { nightSky } from '../art/scenery';
import { isCalm, stepped } from '../ui/anim';
import { sealButton } from '../ui/components';
import { h, place } from '../ui/dom';
import { Scene } from '../ui/scene';

export class BreakScene extends Scene {
  build(): void {
    const r = this.root;
    this.app.progress.chaptersSinceBreak = 0;
    this.app.save();
    r.append(h('div', { class: 'backdrop-wrap', html: nightSky('break-sky') }));
    r.append(place(h('div', { class: 'moon' }), 820, 90, 160, 160));
    r.append(place(h('div', { class: 'big-title', style: 'font-size:60px' }, 'Time for a little break'), 0, 300));

    const branch = svg({ w: 600, h: 120, name: 'break-branch', boil: false }, [piece(band([[0, 70], [300, 60], [600, 80]], 26), C.brownDark)]);
    r.append(place(h('div', { class: 'backdrop-wrap', html: branch }), 290, 600, 600, 120));
    const owl = place(h('div', { class: 'sleepy-owl', html: hedwig('sleepy') }), 470, 430, 240, 240);
    (owl.querySelector('[data-part="lids"]') as SVGElement | null)?.setAttribute('opacity', '1');
    r.append(owl);

    for (let i = 0; i < 3; i++) {
      const z = place(h('div', { class: 'zzz', style: `font-size:${30 + i * 10}px` }, 'z'), 680 + i * 34, 500 - i * 34);
      r.append(z);
      if (!isCalm()) gsap.fromTo(z, { opacity: 0, y: 20 }, { opacity: 1, y: -30, duration: 2.4, delay: i * 0.8, repeat: -1, ease: stepped(2.4, 'sine.out') });
    }

    const done = sealButton('tick', { x: 515, y: 690, size: 120, color: C.greenDark, aria: 'All done', name: 'break-done' });
    this.tap(done, () => {
      sfx.tap();
      this.app.nav.title();
    });
    const map = sealButton('map', { x: 1080, y: 720, size: 72, color: C.slate, aria: 'Map', name: 'break-map' });
    this.tap(map, () => {
      sfx.tap();
      this.app.nav.map();
    });
    r.append(done, map);
  }
}
