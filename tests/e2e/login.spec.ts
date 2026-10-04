import { expect, test, type Page } from '@playwright/test';
import { fakeCloud, holdCog } from './cloud';
import { settled } from './wait';

const password = (page: Page) => page.getByRole('textbox', { name: 'Password' });

/** Opens the game at the password screen, once its card has slid into place. */
async function open(page: Page) {
  await page.goto('/');
  await expect(page.getByText('What’s the password?')).toBeVisible();
  await settled(page.locator('.login-card'));
}

test('asks for the password, turns a wrong one away, and lets Jasper in', async ({ page }) => {
  await fakeCloud(page);
  await open(page);
  await expect(page.locator('.letter')).toHaveCount(0);

  await password(page).fill('frog');
  await page.getByRole('button', { name: 'Go in' }).click();
  await expect(page.getByRole('status')).toHaveText('That’s not the password. Try again!');

  await password(page).fill('  OWL');
  await password(page).press('Enter');
  await expect(page.locator('.letter')).toContainText('To Jasper', { timeout: 10_000 });

  // Remembered: no password next time.
  await page.reload();
  await expect(page.locator('.letter')).toContainText('To Jasper', { timeout: 10_000 });
  await expect(page.getByText('What’s the password?')).toHaveCount(0);
});

test('a grown-up sees Jasper’s progress and sets his words from their own device', async ({ page }) => {
  test.setTimeout(60_000);
  const cloud = await fakeCloud(page, {
    jasper: { v: 1, name: 'Jasper', avatar: 'ron', cards: ['hagrid'], gems: 5, chapters: { b1c1: { plays: 1, done: true } } },
  });
  await open(page);
  await password(page).fill('toad');
  await password(page).press('Enter');
  // Their own game: no name on the letter yet.
  await expect(page.locator('.letter')).toContainText('To the Young Wizard', { timeout: 10_000 });

  await holdCog(page);
  await expect(page.getByRole('heading', { name: 'Grown-ups’ corner' })).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText('Signed in as a grown-up')).toBeVisible();
  // Jasper's progress, fetched from the cloud.
  await expect(page.locator('.p-stat', { hasText: 'Chapters finished' })).toContainText('1 of');
  await expect(page.locator('.p-stat', { hasText: 'Gems' })).toContainText('5');

  await page.getByRole('button', { name: 'My words' }).click();
  await page.locator('textarea').fill('ship\nshop');
  await expect.poll(() => cloud.profiles.jasper.data?.custom, { timeout: 10_000 }).toEqual(['ship', 'shop']);
  expect(cloud.profiles.jasper.data.cards).toEqual(['hagrid']);
  await expect(page.getByText('Saved to the cloud ✓')).toBeVisible();

  // Switch to their own progress.
  await page.getByRole('button', { name: 'Me', exact: true }).click();
  await page.getByRole('button', { name: 'Progress' }).click();
  await expect(page.locator('.p-stat', { hasText: 'Chapters finished' })).toContainText('0 of');
});

test('Jasper’s corner has no switch, and signing out goes back to the password', async ({ page }) => {
  test.setTimeout(60_000);
  await fakeCloud(page);
  await open(page);
  await password(page).fill('owl');
  await password(page).press('Enter');
  await expect(page.locator('.letter')).toBeVisible({ timeout: 10_000 });

  await holdCog(page);
  await expect(page.getByText('Signed in as Jasper')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText('Showing:')).toHaveCount(0);

  const signOut = page.getByRole('button', { name: 'Sign out' });
  await signOut.click();
  await page.getByRole('button', { name: 'Tap again to sign out' }).click();
  await expect(page.getByText('What’s the password?')).toBeVisible({ timeout: 10_000 });
  expect(await page.evaluate(() => localStorage.getItem('wizard-words:auth'))).toBeNull();
});
