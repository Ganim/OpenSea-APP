import { test, expect } from '@playwright/test';
import { navigateToCentral } from '../helpers/central.helper';

test.describe('Central Dashboard', () => {
  test('should render the hero banner with stat pills', async ({ page }) => {
    await navigateToCentral(page);
    // Verify hero section exists
    await expect(page.locator('text=Olá')).toBeVisible();
    // Verify stat pills
    await expect(page.locator('text=Tenants')).toBeVisible();
    await expect(page.locator('text=Usuários')).toBeVisible();
    await expect(page.locator('text=MRR')).toBeVisible();
    await expect(page.locator('text=Tickets')).toBeVisible();
  });

  test('should render revenue chart and ticket list', async ({ page }) => {
    await navigateToCentral(page);
    await expect(page.locator('text=Receita por Módulo')).toBeVisible();
    await expect(page.locator('text=Tickets Recentes')).toBeVisible();
  });

  test('should render top tenants and growth chart', async ({ page }) => {
    await navigateToCentral(page);
    await expect(page.locator('text=Top Tenants por Receita')).toBeVisible();
    await expect(page.locator('text=Crescimento')).toBeVisible();
  });

  test('should toggle theme between light and dark', async ({ page }) => {
    await navigateToCentral(page);
    // Find and click theme toggle button (sun/moon icon)
    const themeToggle = page.locator('[data-testid="theme-toggle"]').or(
      page
        .locator('button')
        .filter({ has: page.locator('svg') })
        .nth(0)
    );
    // Check initial theme attribute
    const htmlTheme = () =>
      page.evaluate(() =>
        document.documentElement.getAttribute('data-central-theme')
      );
    const initial = await htmlTheme();
    // Click toggle
    await themeToggle.first().click();
    // Theme should change
    const after = await htmlTheme();
    expect(after).not.toBe(initial);
  });
});
