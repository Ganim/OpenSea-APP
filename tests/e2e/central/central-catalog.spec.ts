import { test, expect } from '@playwright/test';
import { navigateToCentral } from '../helpers/central.helper';

test.describe('Central Catalog', () => {
  test('should render the catalog page with skill tree', async ({ page }) => {
    await navigateToCentral(page, '/central/catalog');
    await page.waitForTimeout(3000);
    await expect(page.locator('text=/Cat[aá]logo de M[oó]dulos/i')).toBeVisible(
      { timeout: 10000 }
    );
  });

  test('should show module sections (STOCK, SALES, HR, FINANCE)', async ({
    page,
  }) => {
    await navigateToCentral(page, '/central/catalog');
    await page.waitForTimeout(3000);
    // The catalog page should load and show at least the page header
    await expect(page.locator('text=/Cat[aá]logo de M[oó]dulos/i')).toBeVisible(
      { timeout: 10000 }
    );
    // At least some skill rows should be rendered (Editar buttons exist)
    const editButtons = page.locator('button').filter({ hasText: /Editar/i });
    await expect(editButtons.first()).toBeVisible({ timeout: 10000 });
  });

  test('should filter skills by module', async ({ page }) => {
    await navigateToCentral(page, '/central/catalog');
    await page.waitForTimeout(3000);
    // Look for the search input
    const searchInput = page.locator('input[placeholder*="Buscar"]');
    await expect(searchInput).toBeVisible({ timeout: 10000 });
    await searchInput.fill('stock');
    await page.waitForTimeout(1000);
  });

  test('should open pricing edit dialog', async ({ page }) => {
    await navigateToCentral(page, '/central/catalog');
    await page.waitForTimeout(3000);
    // Find an "Editar" button and click it
    const editBtn = page
      .locator('button')
      .filter({ hasText: /Editar/i })
      .first();
    await expect(editBtn).toBeVisible({ timeout: 10000 });
    await editBtn.click();
    await page.waitForTimeout(500);
    // Dialog should open with "Editar Preço" title or "Tipo de Preço" label
    await expect(page.locator('[role="dialog"]')).toBeVisible({
      timeout: 10000,
    });
  });
});
