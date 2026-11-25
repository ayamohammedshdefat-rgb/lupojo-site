import { expect, test } from '@playwright/test';
import { formatJD, gotoReady, restoreMenu, revalidate, updateItem, updateSection, visibleItems } from './helpers/db';

test.describe.configure({ mode: 'serial' });

test.beforeEach(async ({ page }) => {
  // Skip the intro animation in functional tests (it has its own spec).
  await page.addInitScript(() => sessionStorage.setItem('lupo:intro', 'seen'));
});

test.afterAll(async ({ request }) => {
  await restoreMenu(request);
});

test('every visible item opens its detail (modal + deep link) with the right name and prices', async ({ page }) => {
  const items = await visibleItems();
  expect(items.length).toBeGreaterThan(0);
  await gotoReady(page, '/');

  for (const item of items) {
    const card = page.locator(`[data-item-card="${item.slug}"]`);
    await card.scrollIntoViewIfNeeded();
    await card.click();
    await expect(page).toHaveURL(new RegExp(`/item/${item.slug}$`));
    const modal = page.locator('[data-item-modal]:visible');
    await expect(modal.locator('[data-item-name]:visible')).toHaveText(item.nameAr);
    for (const p of item.prices) await expect(modal).toContainText(formatJD(p.amountFils));
    await page.keyboard.press('Escape');
    await expect(page).toHaveURL(/\/$/);
    // With Cache Components the closed modal may stay mounted but hidden (React Activity).
    await expect(page.locator('[data-item-modal]:visible')).toHaveCount(0);
  }

  for (const item of items) {
    const res = await page.goto(`/item/${item.slug}`);
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1[data-item-name]')).toHaveText(item.nameAr);
  }
});

test('search filters cards with Arabic normalization and shows an empty state', async ({ page, isMobile }) => {
  await gotoReady(page, '/');
  if (isMobile) await page.getByRole('button', { name: 'ابحث في المنيو' }).click();
  const input = page.getByRole('searchbox', { name: 'ابحث في المنيو' }).last();
  await input.fill('سماش');
  await expect(page.locator('li[data-search-item]:visible')).toHaveCount(2);
  await input.fill('بطاطا كبيره');
  await expect(page.locator('li[data-search-item="big-fries"]')).toBeVisible();
  await expect(page.locator('li[data-search-item]:visible')).toHaveCount(1);
  await input.fill('jalapeno');
  await expect(page.locator('li[data-search-item="jalapeno"]')).toBeVisible();
  await input.fill('بيتزا مستحيلة');
  await expect(page.getByText('لا توجد نتائج مطابقة.').first()).toBeVisible();
});

test('hidden items and sections are never exposed', async ({ page, request }) => {
  await updateItem('crispy-chicken', { visibility: 'hidden' });
  await revalidate(request);

  await gotoReady(page, '/');
  await expect(page.locator('[data-item-card="crispy-chicken"]')).toHaveCount(0);
  expect(await page.content()).not.toContain('كرسبي تشكن');
  const res = await page.goto('/item/crispy-chicken');
  expect(res?.status()).toBe(404);

  await updateSection('sides', { visibility: 'hidden' });
  await revalidate(request);
  await gotoReady(page, '/');
  await expect(page.locator('#sides')).toHaveCount(0);
  await expect(page.locator('[data-item-card="loaded-fries"]')).toHaveCount(0);
  expect((await page.goto('/item/loaded-fries'))?.status()).toBe(404);

  await restoreMenu(request);
  await gotoReady(page, '/');
  await expect(page.locator('[data-item-card="crispy-chicken"]')).toHaveCount(1);
});

test('unavailable items stay visible with a clear state and no rating', async ({ page, request }) => {
  await updateItem('nashville-chicken', { availability: 'unavailable', unavailableNote: 'يعود قريبًا' });
  await revalidate(request, ['menu'], ['/', '/item/nashville-chicken']);

  await gotoReady(page, '/');
  const card = page.locator('[data-item-card="nashville-chicken"]');
  await expect(card).toContainText('غير متوفر حاليًا');
  await card.click();
  const modal = page.locator('[data-item-modal]:visible');
  await expect(modal).toContainText('يعود قريبًا');
  await expect(modal.getByRole('button', { name: 'قيّم هذا الصنف' })).toBeDisabled();

  await restoreMenu(request);
});

test('section navigation scrolls to the section and highlights it', async ({ page, isMobile }) => {
  await gotoReady(page, '/');
  const nav = page.getByRole('navigation', { name: 'أقسام المنيو' }).filter({ visible: true }).first();
  await nav.locator('a[href="#extras"]').click();
  await expect(page).toHaveURL(/#extras$/);
  await expect(page.locator('#extras')).toBeInViewport();
  await expect(nav.locator('a[href="#extras"]')).toHaveAttribute('aria-current', 'true');
  if (!isMobile) await expect(page.locator('aside')).toBeVisible();
});
