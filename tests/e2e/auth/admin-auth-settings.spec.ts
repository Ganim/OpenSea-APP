import { test, expect } from '@playwright/test';
import {
  getAuthenticatedToken,
  injectAuthIntoBrowser,
} from '../helpers/auth.helper';

let adminToken: string;
let adminTenantId: string;

test.beforeAll(async () => {
  const auth = await getAuthenticatedToken('admin@teste.com', 'Teste@123');
  adminToken = auth.token;
  adminTenantId = auth.tenantId;
});

test.describe('Admin - Authentication Settings', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuthIntoBrowser(page, adminToken, adminTenantId);
    await page.goto('/admin/settings/auth');
    await page.waitForLoadState('networkidle');
  });

  // ─── PAGE LOAD ─────────────────────────────────────────────────────

  test('should access auth settings page', async ({ page }) => {
    // Page should load with the auth settings title
    await expect(page.getByText('Autenticação').first()).toBeVisible({
      timeout: 10_000,
    });
  });

  // ─── PROVIDER TOGGLES ─────────────────────────────────────────────

  test('should show provider toggles for EMAIL and CPF', async ({ page }) => {
    // EMAIL provider toggle
    await expect(page.getByText('Login por Email')).toBeVisible({
      timeout: 10_000,
    });

    // CPF provider toggle
    await expect(page.getByText('Login por CPF')).toBeVisible({
      timeout: 10_000,
    });

    // Enrollment provider toggle
    await expect(page.getByText('Login por Matrícula')).toBeVisible({
      timeout: 10_000,
    });

    // Switches should be present on the page
    const switches = page.locator('button[role="switch"]');
    const count = await switches.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  // ─── MAGIC LINK TOGGLE ────────────────────────────────────────────

  test('should show magic link configuration', async ({ page }) => {
    await expect(page.getByText(/Link Mágico|Magic Link/i)).toBeVisible({
      timeout: 10_000,
    });
  });

  // ─── SAVE CONFIGURATION ───────────────────────────────────────────

  test('should enable save button after toggling a setting', async ({
    page,
  }) => {
    // Wait for page to load
    await expect(page.getByText('Login por Email')).toBeVisible({
      timeout: 10_000,
    });

    // Find a switch and toggle it to make the form dirty
    const switches = page.locator('button[role="switch"]');
    const firstSwitch = switches.first();
    await expect(firstSwitch).toBeVisible({ timeout: 5_000 });

    // Get initial state
    const initialState = await firstSwitch.getAttribute('data-state');

    // Toggle it
    await firstSwitch.click();
    await page.waitForTimeout(500);

    // The save button text should change to "Salvar Alterações"
    await expect(page.getByText('Salvar Alterações')).toBeVisible({
      timeout: 5_000,
    });

    // Toggle back to restore original state
    await firstSwitch.click();
  });
});
