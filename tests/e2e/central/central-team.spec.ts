import { test, expect } from '@playwright/test';
import { navigateToCentral } from '../helpers/central.helper';

test.describe('Central Team', () => {
  test('should render team management page', async ({ page }) => {
    await navigateToCentral(page, '/central/team');
    await expect(page.locator('text=Equipe Central')).toBeVisible();
  });

  test('should show at least one team member (the super admin)', async ({
    page,
  }) => {
    await navigateToCentral(page, '/central/team');
    await page.waitForTimeout(2000);
    // The seeded super admin should appear as OWNER
    await expect(
      page.locator('text=OWNER').or(page.locator('text=Owner'))
    ).toBeVisible();
  });

  test('should have invite button', async ({ page }) => {
    await navigateToCentral(page, '/central/team');
    await page.waitForTimeout(1000);
    const inviteBtn = page.locator('button').filter({ hasText: /Convidar/i });
    await expect(inviteBtn).toBeVisible();
  });

  test('should open invite dialog', async ({ page }) => {
    await navigateToCentral(page, '/central/team');
    await page.waitForTimeout(1000);
    const inviteBtn = page.locator('button').filter({ hasText: /Convidar/i });
    await inviteBtn.click();
    await page.waitForTimeout(500);
    await expect(page.locator('[role="dialog"]')).toBeVisible();
  });
});
