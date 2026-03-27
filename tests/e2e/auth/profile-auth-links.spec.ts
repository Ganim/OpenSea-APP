import { test, expect } from '@playwright/test';
import {
  getAuthenticatedToken,
  injectAuthIntoBrowser,
} from '../helpers/auth.helper';

let userToken: string;
let userTenantId: string;

test.beforeAll(async () => {
  const auth = await getAuthenticatedToken('admin@teste.com', 'Teste@123');
  userToken = auth.token;
  userTenantId = auth.tenantId;
});

test.describe('Profile - Connected Accounts', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuthIntoBrowser(page, userToken, userTenantId);
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
  });

  // ─── TAB VISIBILITY ────────────────────────────────────────────────

  test('should show connected accounts tab in profile', async ({ page }) => {
    // The profile page has a "Contas Conectadas" tab
    const tab = page.getByText('Contas Conectadas');
    await expect(tab).toBeVisible({ timeout: 10_000 });
  });

  // ─── AUTH LINKS LIST ───────────────────────────────────────────────

  test('should list EMAIL auth link after clicking tab', async ({ page }) => {
    // Click "Contas Conectadas" tab
    const tab = page.getByText('Contas Conectadas');
    await expect(tab).toBeVisible({ timeout: 10_000 });
    await tab.click();

    // Should show at least one auth link — EMAIL is always present for seeded users
    await expect(page.getByText('Email').first()).toBeVisible({
      timeout: 10_000,
    });
  });

  // ─── LINK METHOD WIZARD ────────────────────────────────────────────

  test('should open link method wizard', async ({ page }) => {
    // Click "Contas Conectadas" tab
    const tab = page.getByText('Contas Conectadas');
    await expect(tab).toBeVisible({ timeout: 10_000 });
    await tab.click();

    // Click "Vincular Método" button
    const linkBtn = page.getByRole('button', { name: /Vincular Método/i });
    await expect(linkBtn).toBeVisible({ timeout: 10_000 });
    await linkBtn.click();

    // Wizard dialog should open
    await expect(page.locator('[role="dialog"]')).toBeVisible({
      timeout: 5_000,
    });
  });

  // ─── TAB DESCRIPTION ──────────────────────────────────────────────

  test('should show tab description "Métodos de login"', async ({ page }) => {
    const description = page.getByText('Métodos de login');
    await expect(description).toBeVisible({ timeout: 10_000 });
  });
});
