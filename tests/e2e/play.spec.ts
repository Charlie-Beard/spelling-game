import { expect, test, type Page } from '@playwright/test';
import { fakeCloud, signedIn, type FakeCloud } from './cloud';
import { settled } from './wait';

let cloud: FakeCloud;
test.beforeEach(async ({ page }) => {
  cloud = await fakeCloud(page);
  await signedIn(page);
});

/** Waits until the spelling screen accepts taps. */
const idle = (page: Page) =>
  page.waitForFunction(() => {
    const s = document.querySelector('.scene.spell');
    return s && !s.hasAttribute('data-busy') && document.querySelector('.slot.target');
  }, null, { timeout: 30_000 });

/** Taps Play once it has popped in (it starts at zero size). */
async function play(page: Page) {
  const btn = page.getByRole('button', { name: 'Play' });
  await expect(async () => {
    const box = await btn.boundingBox();
    expect(box && box.width > 100).toBeTruthy();
  }).toPass({ timeout: 10_000 });
  await settled(btn);
  await btn.click({ force: true });
}

/** Spells whatever word is on screen, tapping the right tile for each slot. */
async function spellWord(page: Page) {
  for (;;) {
    const target = page.locator('.slot.target');
    if ((await target.count()) === 0) return;
    const want = await target.getAttribute('data-want');
    await page.locator(`.tile:not(.placed)[data-g="${want}"]`).first().click();
    await page.waitForTimeout(500);
  }
}

test('plays the first chapter from the title screen to the reward', async ({ page }) => {
  test.setTimeout(300_000);
  await page.goto('/');
  await settled(page.locator('.letter'));
  await page.locator('.letter').click({ force: true });
  // First time: choose a character.
  await page.getByRole('button', { name: 'Harry' }).click();
  // Map: the first chapter is the current one.
  const stop = page.locator('.stop.current');
  await expect(stop).toBeVisible({ timeout: 10_000 });
  await expect(stop).toContainText('Hagrid');
  await stop.click({ force: true });
  // Intro → play
  await play(page);
  for (let w = 0; w < 5; w++) {
    await expect(page.locator('.slot.target')).toBeVisible({ timeout: 20_000 });
    await spellWord(page);
  }
  // The reward story plays to the end, then Next leads to the card.
  await expect(page.locator('.scene.story')).toBeVisible({ timeout: 30_000 });
  const done = page.getByRole('button', { name: 'Next', exact: true });
  await expect(done).toBeVisible({ timeout: 120_000 });
  await settled(done);
  await done.click({ force: true });
  // Reward
  await expect(page.locator('.card-reward')).toBeVisible({ timeout: 30_000 });
  await expect(page.locator('.card-reward')).toContainText('Hagrid');
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('wizard-words:v1:jasper')!));
  expect(saved.cards).toEqual(['hagrid']);
  expect(saved.chapters.b1c1.done).toBe(true);
  expect(saved.gems).toBe(5);
  // …and in the cloud.
  await expect.poll(() => cloud.jasper?.data?.cards, { timeout: 10_000 }).toEqual(['hagrid']);
  expect(cloud.jasper!.data.avatar).toBe('harry');
  // Next → back to the map with chapter 2 current.
  const next = page.getByRole('button', { name: 'Next chapter' });
  await expect(next).toHaveCSS('opacity', '1', { timeout: 15_000 });
  await next.click({ force: true });
  await expect(page.locator('.stop.current')).toContainText('Diagon Alley', { timeout: 10_000 });
});

test('wrong tiles step up to Hedwig placing the letter', async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto('/?scene=chapter&id=b1c1');
  await play(page);
  await idle(page);
  const want = await page.locator('.slot.target').getAttribute('data-want');
  const wrong = page.locator(`.tile:not(.placed):not([data-g="${want}"])`).first();
  await wrong.click();
  await page.waitForTimeout(100);
  await idle(page);
  await wrong.click();
  await expect(page.locator('.tile.glowing')).toHaveAttribute('data-g', want!, { timeout: 5000 });
  await idle(page);
  await page.locator(`.tile:not(.placed):not([data-g="${want}"])`).first().click();
  // Hedwig places it: the first slot is no longer the target.
  await expect(page.locator('.slot').first()).toHaveClass(/done/, { timeout: 8000 });
});

test('a fast second tap while a letter is flying is not lost', async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto('/?scene=chapter&id=b1c1');
  await play(page);
  await page.waitForFunction(() => {
    const s = document.querySelector('.scene.spell');
    return s && !s.hasAttribute('data-busy') && document.querySelector('.slot.target');
  });
  const wants = await page.locator('.slot').evaluateAll((s) => s.map((x) => (x as HTMLElement).dataset.want!));
  await page.locator(`.tile[data-g="${wants[0]}"]`).first().click();
  // Tap the second letter immediately, while the first is still in the air.
  await page.locator(`.tile:not(.placed)[data-g="${wants[1]}"]`).first().click({ force: true });
  await expect(page.locator('.tile.placed')).toHaveCount(2, { timeout: 3000 });
});

test('the reward story can be skipped', async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto('/?scene=story&id=b1c1');
  await expect(page.locator('.scene.story')).toBeVisible({ timeout: 10_000 });
  await page.getByRole('button', { name: 'Skip the story' }).click({ force: true });
  await expect(page.locator('.scene.map')).toBeVisible({ timeout: 10_000 });
});
