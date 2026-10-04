import { expect, test, type Page } from '@playwright/test';
import { fakeCloud, openCorner, signedIn } from './cloud';

const JASPER = { v: 1, name: 'Jasper', avatar: 'ron', cards: ['hagrid'], gems: 5, chapters: { b1c1: { plays: 1, done: true } } };
const DEMO = { demo: { label: 'Demo', data: { v: 1, name: '', unlockAll: true } } };

const tab = (page: Page, name: string) => page.locator('.p-tab', { hasText: name }).click();

test.beforeEach(async ({ page }) => {
  await signedIn(page);
});

test('switches to the demo and back without touching Jasper’s save', async ({ page }) => {
  test.setTimeout(90_000);
  const cloud = await fakeCloud(page, JASPER, DEMO);
  await page.goto('/');
  await expect(page.locator('.letter')).toContainText('To Jasper', { timeout: 10_000 });
  await expect(page.locator('.profile-badge')).toHaveCount(0);

  await openCorner(page);
  await tab(page, 'Profiles');
  const jasperRow = page.locator('.p-profile', { hasText: 'Jasper' });
  await expect(jasperRow).toContainText('Playing now');
  await page.locator('.p-profile', { hasText: 'Demo' }).getByRole('button', { name: 'Play as this' }).click();

  // The demo: its own letter, a badge, every chapter open.
  await expect(page.locator('.letter')).toContainText('To the Young Wizard', { timeout: 15_000 });
  await expect(page.locator('.profile-badge')).toHaveText('Demo');
  await page.goto('/?scene=map');
  await expect(page.locator('.stop').first()).toBeVisible({ timeout: 10_000 });
  await expect(page.locator('.stop.locked')).toHaveCount(0);
  await expect(page.locator('.profile-badge')).toHaveText('Demo');

  // Jasper's save was never written to.
  expect(cloud.jasper.rev).toBe(1);
  expect(cloud.jasper.data).toEqual(JASPER);

  // Back to Jasper from the picker at the top of the corner.
  await page.goto('/');
  await openCorner(page);
  await expect(page.getByRole('combobox', { name: 'Profile' })).toHaveValue('demo');
  await page.getByRole('combobox', { name: 'Profile' }).selectOption('jasper');
  await expect(page.locator('.letter')).toContainText('To Jasper', { timeout: 15_000 });
  await expect(page.locator('.profile-badge')).toHaveCount(0);
});

test('adds a profile and deletes it again', async ({ page }) => {
  test.setTimeout(60_000);
  const cloud = await fakeCloud(page, JASPER, DEMO);
  await page.goto('/');
  await expect(page.locator('.letter')).toBeVisible({ timeout: 10_000 });
  await openCorner(page);
  await tab(page, 'Profiles');
  await page.getByRole('textbox', { name: 'New profile name' }).fill('Grandma');
  await page.getByRole('button', { name: 'Add profile' }).click();
  const row = page.locator('.p-profile', { hasText: 'Grandma' });
  await expect(row).toBeVisible({ timeout: 10_000 });
  expect(cloud.grandma).toMatchObject({ label: 'Grandma', data: { name: 'Grandma', unlockAll: true } });
  // Jasper's can't be deleted.
  await expect(page.locator('.p-profile', { hasText: 'Jasper' }).getByRole('button', { name: 'Delete' })).toHaveCount(0);

  await row.getByRole('button', { name: 'Delete' }).click();
  await row.getByRole('button', { name: 'Tap again to delete' }).click();
  await expect(page.locator('.p-profile', { hasText: 'Grandma' })).toHaveCount(0, { timeout: 10_000 });
  expect(cloud.grandma).toBeUndefined();
});

test('unlocks chapters up to one, and locks them again', async ({ page }) => {
  test.setTimeout(60_000);
  const cloud = await fakeCloud(page, JASPER);
  await page.goto('/');
  await expect(page.locator('.letter')).toBeVisible({ timeout: 10_000 });
  await openCorner(page);
  await tab(page, 'Levels');

  const level = (title: string) => page.locator('.p-level', { hasText: title });
  await expect(level('Hagrid')).toContainText('Done ✓');
  await expect(level('Diagon Alley')).toContainText('Open');
  await expect(level('The Hogwarts Express')).toContainText('Locked');
  await level('The Great Hall Feast').getByRole('button', { name: 'Unlock up to here' }).click();
  await expect(level('The Hogwarts Express')).toContainText('Open');
  await expect(level('The Great Hall Feast')).toContainText('Open');
  await expect(level('The Hidden Ring')).toContainText('Locked');
  await expect.poll(() => cloud.jasper.data.unlockedTo, { timeout: 10_000 }).toBe(3);

  // Relock everything after the first chapter.
  const first = level('Hagrid');
  await first.getByRole('button', { name: 'Lock the ones after' }).click();
  await first.getByRole('button', { name: 'Tap again to lock' }).click();
  await expect(level('The Hogwarts Express')).toContainText('Locked');
  await expect(level('Diagon Alley')).toContainText('Open');
  await expect(level('Hagrid')).toContainText('Done ✓');

  // Unlock every chapter.
  await page.locator('.p-row', { hasText: 'Unlock every chapter' }).locator('.p-toggle').click();
  await expect(page.locator('.p-level.locked')).toHaveCount(0);
  await expect.poll(() => cloud.jasper.data.unlockAll, { timeout: 10_000 }).toBe(true);
});
