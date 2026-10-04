import { expect, test, type Page } from '@playwright/test';
import { fakeCloud, openCorner } from './cloud';
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
  // No way into the grown-ups' corner before signing in.
  await expect(page.getByRole('button', { name: 'Grown-ups' })).toBeHidden();

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

test('signing out (in the grown-ups’ corner) goes back to the password', async ({ page }) => {
  test.setTimeout(60_000);
  await fakeCloud(page);
  await open(page);
  await password(page).fill('owl');
  await password(page).press('Enter');
  await expect(page.locator('.letter')).toBeVisible({ timeout: 10_000 });

  await openCorner(page);
  await expect(page.getByText('Signed in as Jasper')).toBeVisible();
  await page.getByRole('button', { name: 'Sign out' }).click();
  await page.getByRole('button', { name: 'Tap again to sign out' }).click();
  await expect(page.getByText('What’s the password?')).toBeVisible({ timeout: 10_000 });
  expect(await page.evaluate(() => localStorage.getItem('wizard-words:auth'))).toBeNull();
});
