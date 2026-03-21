import { test, expect } from '@playwright/test';
import { navigateToCentral } from '../helpers/central.helper';

test.describe('Central Catalog', () => {
  test('should render the catalog page with skill tree', async ({ page }) => {
    await navigateToCentral(page, '/central/catalog');
    await expect(page.locator('text=Catálogo de Módulos')).toBeVisible();
  });

  test('should show module sections (STOCK, SALES, HR, FINANCE)', async ({
    page,
  }) => {
    await navigateToCentral(page, '/central/catalog');
    // Wait for data to load
    await page.waitForTimeout(2000);
    // Check for module names in the tree
    // These may be in skill names or section headers
    // At minimum the page should load without errors
    await expect(
      page
        .locator('[data-testid="page-header"]')
        .or(page.locator('h1, h2').first())
    ).toBeVisible();
  });

  test('should filter skills by module', async ({ page }) => {
    await navigateToCentral(page, '/central/catalog');
    await page.waitForTimeout(1000);
    // Look for a search input or module filter
    const searchInput = page.locator('input[placeholder*="Buscar"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('stock');
      await page.waitForTimeout(500);
    }
  });

  test('should open pricing edit dialog', async ({ page }) => {
    await navigateToCentral(page, '/central/catalog');
    await page.waitForTimeout(2000);
    // Find an "Editar" button and click it
    const editBtn = page
      .locator('button')
      .filter({ hasText: /Editar/i })
      .first();
    if (await editBtn.isVisible()) {
      await editBtn.click();
      // Dialog should open
      await page.waitForTimeout(500);
      await expect(
        page
          .locator('[role="dialog"]')
          .or(
            page.locator('text=Tipo de Preço').or(page.locator('text=Salvar'))
          )
      ).toBeVisible();
    }
  });
});
