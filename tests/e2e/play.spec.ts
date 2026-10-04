import { expect, test, type Page } from '@playwright/test';

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
  test.setTimeout(180_000);
  await page.goto('/');
  await page.locator('.letter').click();
  // First time: choose a character.
  await page.getByRole('button', { name: 'Harry' }).click();
  // Map: the first chapter is the current one.
  const stop = page.locator('.stop.current');
  await expect(stop).toBeVisible({ timeout: 10_000 });
  await expect(stop).toContainText('Hagrid');
  await stop.click();
  // Intro → play
  await page.getByRole('button', { name: 'Play' }).click();
  for (let w = 0; w < 5; w++) {
    await expect(page.locator('.slot.target')).toBeVisible({ timeout: 20_000 });
    await spellWord(page);
  }
  // Reward
  await expect(page.locator('.card-reward')).toBeVisible({ timeout: 30_000 });
  await expect(page.locator('.card-reward')).toContainText('Hagrid');
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('wizard-words:v1')!));
  expect(saved.cards).toEqual(['hagrid']);
  expect(saved.chapters.b1c1.done).toBe(true);
  expect(saved.gems).toBe(5);
  // Next → back to the map with chapter 2 current.
  const next = page.getByRole('button', { name: 'Next chapter' });
  await expect(next).toHaveCSS('opacity', '1', { timeout: 15_000 });
  await next.click();
  await expect(page.locator('.stop.current')).toContainText('Diagon Alley', { timeout: 10_000 });
});

test('wrong tiles step up to Hedwig placing the letter', async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto('/?scene=chapter&id=b1c1');
  await page.getByRole('button', { name: 'Play' }).click();
  await expect(page.locator('.slot.target')).toBeVisible({ timeout: 20_000 });
  const want = await page.locator('.slot.target').getAttribute('data-want');
  const wrong = page.locator(`.tile:not(.placed):not([data-g="${want}"])`).first();
  await wrong.click();
  await page.waitForTimeout(1800);
  await wrong.click();
  await expect(page.locator('.tile.glowing')).toHaveAttribute('data-g', want!, { timeout: 5000 });
  await page.waitForTimeout(1800);
  await page.locator(`.tile:not(.placed):not([data-g="${want}"])`).first().click();
  // Hedwig places it: the first slot is no longer the target.
  await expect(page.locator('.slot').first()).toHaveClass(/done/, { timeout: 8000 });
});
