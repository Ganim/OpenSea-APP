import { test, expect } from '@playwright/test';
import { navigateToCentral } from '../helpers/central.helper';

test.describe('Central Subscriptions', () => {
  test('should render subscriptions page', async ({ page }) => {
    await navigateToCentral(page, '/central/subscriptions');
    await expect(
      page.locator('text=Assinaturas').or(page.locator('text=Billing'))
    ).toBeVisible();
  });

  test('should show summary stat cards', async ({ page }) => {
    await navigateToCentral(page, '/central/subscriptions');
    await page.waitForTimeout(2000);
    await expect(page.locator('text=MRR').first()).toBeVisible();
  });
});
