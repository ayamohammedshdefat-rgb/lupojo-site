import { expect, test } from '@playwright/test';

const overlay = '#lupo-intro';

test('first visit plays the full intro once per session and can be skipped', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator(overlay)).toHaveAttribute('data-mode', 'full');
  await expect(page.locator(overlay)).toBeVisible();
  // Tap to skip: fast-forwards to the end in ~250 ms.
  await page.waitForTimeout(300);
  await page.mouse.click(200, 200);
  await expect(page.locator(overlay)).toHaveCount(0, { timeout: 1200 });
  await expect(page.locator('#hero-logo')).toBeVisible();

  // Same session: no intro on reload.
  await page.reload();
  await expect(page.locator(overlay)).toBeHidden();
  await expect(page.locator(overlay)).toHaveCount(0, { timeout: 2000 });
});

test('the full intro ends on its own and unlocks scrolling', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator(overlay)).toHaveAttribute('data-mode', 'full');
  await expect(page.locator(overlay)).toHaveCount(0, { timeout: 4000 });
  const overflow = await page.evaluate(() => getComputedStyle(document.documentElement).overflow);
  expect(overflow).not.toBe('hidden');
});

test('later sessions get a short logo pulse', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('lupo:intro:ever', '1'));
  await page.goto('/');
  await expect(page.locator(overlay)).toHaveAttribute('data-mode', 'pulse');
  await expect(page.locator(overlay)).toHaveCount(0, { timeout: 1500 });
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('skips the intro (200 ms fade, no particles)', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator(overlay)).toHaveAttribute('data-mode', 'reduced');
    await expect(page.locator(overlay)).toHaveCount(0, { timeout: 1200 });
    await expect(page.locator('#hero-logo')).toBeVisible();
  });
});
