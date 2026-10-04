import { expect, test, type Page } from '@playwright/test';
import { fakeCloud, key, openCorner, signedIn, sumAnswer } from './cloud';

const gear = (page: Page) => page.getByRole('button', { name: 'Grown-ups' });

/** The gear sits in the top-left corner of the (letterboxed) stage. */
async function expectTopLeft(page: Page) {
  await expect(gear(page)).toBeVisible();
  const g = (await gear(page).boundingBox())!;
  const s = (await page.locator('#stage').boundingBox())!;
  expect(g.x - s.x).toBeLessThan(s.width * 0.08);
  expect(g.y - s.y).toBeLessThan(s.height * 0.1);
}

test.beforeEach(async ({ page }) => {
  await signedIn(page);
});

test('the gear stays in the top left on every screen', async ({ page }) => {
  await fakeCloud(page, { v: 1, name: 'Jasper', avatar: 'ron' });
  await page.goto('/');
  await expect(page.locator('.letter')).toBeVisible({ timeout: 10_000 });
  await expectTopLeft(page);
  await page.goto('/?scene=map');
  await expect(page.locator('.stop.current')).toBeVisible({ timeout: 10_000 });
  await expectTopLeft(page);
  await page.goto('/?scene=chapter&id=b1c1');
  await expect(page.getByRole('button', { name: 'Play' })).toBeVisible({ timeout: 10_000 });
  await expectTopLeft(page);
  // It doesn't cover the back-to-map button.
  const g = (await gear(page).boundingBox())!;
  const back = (await page.getByRole('button', { name: 'Back to the map' }).boundingBox())!;
  expect(back.x).toBeGreaterThan(g.x + g.width);
});

test('a wrong answer gives a new sum; the right one opens the settings', async ({ page }) => {
  test.setTimeout(60_000);
  await fakeCloud(page);
  await page.goto('/');
  await expect(page.locator('.letter')).toBeVisible({ timeout: 10_000 });

  await gear(page).click();
  await expect(page.getByRole('dialog', { name: 'Grown-ups only' })).toBeVisible();
  const first = await page.locator('.gate-sum').innerText();
  expect(first).toMatch(/^\d+ [×÷] \d+ =$/);
  await key(page, (await sumAnswer(page)) + 1);
  await page.getByRole('button', { name: 'OK' }).click();
  await expect(page.locator('.gate-note')).toHaveText('Not quite. Try this one.');
  await expect(page.locator('.gate-answer')).toHaveText('?');
  await expect(page.getByRole('heading', { name: 'Grown-ups’ corner' })).toHaveCount(0);

  // Typing can be fixed with delete.
  await key(page, 9);
  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(page.locator('.gate-answer')).toHaveText('?');

  // Closing leaves the game as it was.
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('.letter')).toBeVisible();

  await openCorner(page);
  // The gear hides inside the corner.
  await expect(gear(page)).toBeHidden();
  await page.getByRole('button', { name: 'Back to the game' }).click();
  await expect(page.locator('.letter')).toBeVisible({ timeout: 10_000 });
  await expect(gear(page)).toBeVisible();
});

test('settings changed in the corner are saved to the cloud', async ({ page }) => {
  test.setTimeout(60_000);
  const cloud = await fakeCloud(page, { v: 1, name: 'Jasper', avatar: 'ron', cards: ['hagrid'], gems: 5, chapters: { b1c1: { plays: 1, done: true } } });
  await page.goto('/');
  await expect(page.locator('.letter')).toBeVisible({ timeout: 10_000 });
  await openCorner(page);
  await expect(page.locator('.p-stat', { hasText: 'Chapters finished' })).toContainText('1 of', { timeout: 10_000 });
  await expect(page.locator('.p-stat', { hasText: 'Gems' })).toContainText('5');

  await page.getByRole('button', { name: 'My words' }).click();
  await page.locator('textarea').fill('ship\nshop');
  await expect.poll(() => cloud.jasper?.data?.custom, { timeout: 10_000 }).toEqual(['ship', 'shop']);
  expect(cloud.jasper!.data.cards).toEqual(['hagrid']);
  await expect(page.getByText('Saved to the cloud ✓')).toBeVisible();
});
