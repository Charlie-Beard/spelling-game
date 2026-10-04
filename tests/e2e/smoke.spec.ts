import { expect, test } from '@playwright/test';

test('stage fills the iPad landscape viewport', async ({ page }) => {
  await page.goto('/');
  const box = await page.locator('#stage').boundingBox();
  const vp = page.viewportSize()!;
  expect(box).not.toBeNull();
  // Letterboxed: full height used, aspect ratio preserved.
  expect(Math.round(box!.height)).toBe(vp.height);
  expect(box!.width / box!.height).toBeCloseTo(1180 / 820, 2);
  await expect(page.locator('#rotate')).toBeHidden();
});

test('portrait shows the turn-sideways screen', async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 1180 });
  await page.goto('/');
  await expect(page.locator('#rotate')).toBeVisible();
});
