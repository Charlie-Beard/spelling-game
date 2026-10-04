import { expect, type Locator } from '@playwright/test';

/**
 * Waits until an element has finished moving into place: its centre stays
 * put (it may still "breathe" in size). Stop-motion animations hold still
 * between frames, which Playwright alone can mistake for having stopped.
 */
export async function settled(locator: Locator): Promise<void> {
  await expect(async () => {
    const a = await locator.boundingBox();
    await locator.page().waitForTimeout(300);
    const b = await locator.boundingBox();
    const moved = !a || !b ? Infinity : Math.hypot(a.x + a.width / 2 - (b.x + b.width / 2), a.y + a.height / 2 - (b.y + b.height / 2));
    expect(moved).toBeLessThan(2);
  }).toPass({ timeout: 15_000 });
}
