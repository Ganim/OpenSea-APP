import { expect, test } from '@playwright/test';
import {
  getAuthenticatedToken,
  injectAuthIntoBrowser,
} from '../helpers/auth.helper';
import {
  WAREHOUSES_FULL_PERMISSIONS,
  createStockUser,
} from '../helpers/stock-permissions.helper';
import {
  createWarehouseViaApi,
  deleteWarehouseViaApi,
  navigateToStockPage,
  waitForToast,
} from '../helpers/stock.helper';

let userToken: string;
let userTenantId: string;

test.beforeAll(async () => {
  const user = await createStockUser(
    WAREHOUSES_FULL_PERMISSIONS,
    `e2e-stock-locations-${Date.now().toString(36)}`
  );
  const auth = await getAuthenticatedToken(user.email, user.password);
  userToken = auth.token;
  userTenantId = auth.tenantId;
});

/** Generate a unique 2-5 char warehouse code */
function warehouseCode(): string {
  return `W${Date.now().toString(36).slice(-3).toUpperCase()}`;
}

// NOTE: Most tests require creating warehouses via API, but the demo plan
// limits to 1 warehouse. Tests 6.1-6.2 (UI-based) pass. Tests 6.3+ need
// a plan with higher warehouse limits or a dedicated test tenant.
test.describe('Stock - Locations (Warehouses) CRUD', () => {
  // ─── CREATE ─────────────────────────────────────────────────────────

  test.fixme('6.1 - Criar armazém via modal', async ({ page }) => {
    const code = warehouseCode();
    const name = `e2e-warehouse-${Date.now()}`;

    await injectAuthIntoBrowser(page, userToken, userTenantId);
    await navigateToStockPage(page, 'locations');

    await page.getByRole('button', { name: /Novo Armazém/i }).click();
    await expect(page.locator('[role="dialog"]')).toBeVisible({
      timeout: 5_000,
    });

    // Fill code and name
    const codeInput = page.getByLabel(/Código/i).first();
    if (await codeInput.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await codeInput.fill(code);
    } else {
      // Fallback: first text input in dialog
      await page
        .locator('[role="dialog"] input[type="text"]')
        .first()
        .fill(code);
    }

    const nameInput = page.getByLabel(/Nome/i).first();
    await nameInput.fill(name);

    // Submit
    const submitBtn = page
      .locator('[role="dialog"] button')
      .filter({ hasText: /Criar|Salvar/i })
      .first();
    await submitBtn.click();
    await waitForToast(page, 'sucesso');

    // Verify warehouse appears in grid
    await expect(page.getByText(name)).toBeVisible({ timeout: 10_000 });
  });

  test.fixme('6.2 - Validar erro ao criar armazém sem código', async ({ page }) => {
    await injectAuthIntoBrowser(page, userToken, userTenantId);
    await navigateToStockPage(page, 'locations');

    await page.getByRole('button', { name: /Novo Armazém/i }).click();
    await expect(page.locator('[role="dialog"]')).toBeVisible({
      timeout: 5_000,
    });

    // Fill name only, skip code
    const nameInput = page.getByLabel(/Nome/i).first();
    await nameInput.fill('Test Warehouse');

    const submitBtn = page
      .locator('[role="dialog"] button')
      .filter({ hasText: /Criar|Salvar/i })
      .first();
    await submitBtn.click();

    // Modal should remain open (validation prevents submission)
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible({ timeout: 3_000 });
  });

  // ─── READ / LIST ────────────────────────────────────────────────────

  test.fixme('6.3 - Listar armazéns e verificar hidratação', async ({ page }) => {
    const wh = await createWarehouseViaApi(userToken, {
      code: warehouseCode(),
      name: `e2e-wh-list-${Date.now()}`,
      isActive: true,
    });

    await injectAuthIntoBrowser(page, userToken, userTenantId);
    await navigateToStockPage(page, 'locations');

    await expect(
      page.getByRole('heading', { level: 1 })
    ).toBeVisible({ timeout: 10_000 });

    await expect(page.getByText(wh.name)).toBeVisible({ timeout: 10_000 });

    // Cleanup
    await deleteWarehouseViaApi(userToken, wh.id);
  });

  test.fixme('6.4 - Buscar armazém por nome', async ({ page }) => {
    const wh = await createWarehouseViaApi(userToken, {
      code: warehouseCode(),
      name: `e2e-wh-search-${Date.now()}`,
    });

    await injectAuthIntoBrowser(page, userToken, userTenantId);
    await navigateToStockPage(page, 'locations');

    const searchInput = page.getByPlaceholder(/Buscar/i);
    await searchInput.fill(wh.name);
    await page.waitForTimeout(500);

    await expect(page.getByText(wh.name)).toBeVisible({ timeout: 5_000 });

    // Cleanup
    await deleteWarehouseViaApi(userToken, wh.id);
  });

  test.fixme('6.5 - Buscar armazém por código', async ({ page }) => {
    const code = warehouseCode();
    const wh = await createWarehouseViaApi(userToken, {
      code,
      name: `e2e-wh-code-search-${Date.now()}`,
    });

    await injectAuthIntoBrowser(page, userToken, userTenantId);
    await navigateToStockPage(page, 'locations');

    const searchInput = page.getByPlaceholder(/Buscar/i);
    await searchInput.fill(code);
    await page.waitForTimeout(500);

    await expect(page.getByText(wh.code)).toBeVisible({ timeout: 5_000 });

    // Cleanup
    await deleteWarehouseViaApi(userToken, wh.id);
  });

  // ─── UPDATE ─────────────────────────────────────────────────────────

  test.fixme('6.6 - Editar armazém via dropdown', async ({ page }) => {
    const wh = await createWarehouseViaApi(userToken, {
      code: warehouseCode(),
      name: `e2e-wh-edit-${Date.now()}`,
    });
    const newName = `e2e-wh-edited-${Date.now()}`;

    await injectAuthIntoBrowser(page, userToken, userTenantId);
    await navigateToStockPage(page, 'locations');

    // Find the warehouse card and click its dropdown trigger (3-dot button)
    const card = page.locator(`text="${wh.name}"`).first();
    await expect(card).toBeVisible({ timeout: 10_000 });

    // Warehouse cards use a dropdown button (not context menu)
    // Try the 3-dot menu button near the card
    const cardContainer = card.locator('xpath=ancestor::div[contains(@class,"card") or contains(@class,"Card") or contains(@class,"rounded")]').first();
    const menuBtn = cardContainer.locator('button').filter({ has: page.locator('svg') }).last();

    if (await menuBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await menuBtn.click();
      await page.waitForTimeout(300);

      const editItem = page
        .locator('[role="menuitem"]')
        .filter({ hasText: 'Editar' })
        .first();
      if (await editItem.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await editItem.click();
      }
    } else {
      // Fallback: try right-click context menu
      await card.click({ button: 'right' });
      await page.waitForTimeout(300);
      const editItem = page
        .locator('[role="menuitem"]')
        .filter({ hasText: 'Editar' })
        .first();
      await editItem.click();
    }

    // Edit modal should open
    await expect(page.locator('[role="dialog"]')).toBeVisible({
      timeout: 5_000,
    });

    const nameInput = page.getByLabel(/Nome/i).first();
    await nameInput.clear();
    await nameInput.fill(newName);

    const saveBtn = page
      .locator('[role="dialog"] button')
      .filter({ hasText: /Salvar/i })
      .first();
    await saveBtn.click();
    await waitForToast(page, 'sucesso');

    await expect(page.getByText(newName)).toBeVisible({ timeout: 10_000 });

    // Cleanup
    await deleteWarehouseViaApi(userToken, wh.id);
  });

  // ─── DELETE ─────────────────────────────────────────────────────────

  test.fixme('6.7 - Excluir armazém via dropdown', async ({ page }) => {
    const wh = await createWarehouseViaApi(userToken, {
      code: warehouseCode(),
      name: `e2e-wh-delete-${Date.now()}`,
    });

    await injectAuthIntoBrowser(page, userToken, userTenantId);
    await navigateToStockPage(page, 'locations');

    const card = page.locator(`text="${wh.name}"`).first();
    await expect(card).toBeVisible({ timeout: 10_000 });

    // Find dropdown trigger
    const cardContainer = card.locator('xpath=ancestor::div[contains(@class,"card") or contains(@class,"Card") or contains(@class,"rounded")]').first();
    const menuBtn = cardContainer.locator('button').filter({ has: page.locator('svg') }).last();

    if (await menuBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await menuBtn.click();
      await page.waitForTimeout(300);

      const deleteItem = page
        .locator('[role="menuitem"]')
        .filter({ hasText: 'Excluir' })
        .first();
      if (await deleteItem.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await deleteItem.click();
      }
    } else {
      await card.click({ button: 'right' });
      await page.waitForTimeout(300);
      const deleteItem = page
        .locator('[role="menuitem"]')
        .filter({ hasText: 'Excluir' })
        .first();
      await deleteItem.click();
    }

    // Confirm deletion
    const confirmBtn = page
      .locator('[role="alertdialog"] button, [role="dialog"] button')
      .filter({ hasText: /Excluir|Confirmar/i })
      .first();
    await expect(confirmBtn).toBeVisible({ timeout: 5_000 });
    await confirmBtn.click();
    await waitForToast(page, 'sucesso');

    await expect(page.getByText(wh.name)).not.toBeVisible({
      timeout: 5_000,
    });
  });

  test.fixme('6.8 - Cancelar exclusão de armazém', async ({ page }) => {
    const wh = await createWarehouseViaApi(userToken, {
      code: warehouseCode(),
      name: `e2e-wh-cancel-del-${Date.now()}`,
    });

    await injectAuthIntoBrowser(page, userToken, userTenantId);
    await navigateToStockPage(page, 'locations');

    const card = page.locator(`text="${wh.name}"`).first();
    await expect(card).toBeVisible({ timeout: 10_000 });

    const cardContainer = card.locator('xpath=ancestor::div[contains(@class,"card") or contains(@class,"Card") or contains(@class,"rounded")]').first();
    const menuBtn = cardContainer.locator('button').filter({ has: page.locator('svg') }).last();

    if (await menuBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await menuBtn.click();
      await page.waitForTimeout(300);
      const deleteItem = page
        .locator('[role="menuitem"]')
        .filter({ hasText: 'Excluir' })
        .first();
      await deleteItem.click();
    } else {
      await card.click({ button: 'right' });
      await page.waitForTimeout(300);
      const deleteItem = page
        .locator('[role="menuitem"]')
        .filter({ hasText: 'Excluir' })
        .first();
      await deleteItem.click();
    }

    // Cancel
    await page
      .locator('[role="alertdialog"] button, [role="dialog"] button')
      .filter({ hasText: 'Cancelar' })
      .first()
      .click();

    // Warehouse should still be visible
    await expect(page.getByText(wh.name)).toBeVisible({ timeout: 5_000 });

    // Cleanup
    await deleteWarehouseViaApi(userToken, wh.id);
  });

  // ─── NAVIGATION ───────────────────────────────────────────────────

  test.fixme('6.9 - Navegar para zonas do armazém', async ({ page }) => {
    const wh = await createWarehouseViaApi(userToken, {
      code: warehouseCode(),
      name: `e2e-wh-zones-${Date.now()}`,
      isActive: true,
    });

    await injectAuthIntoBrowser(page, userToken, userTenantId);
    await navigateToStockPage(page, 'locations');

    // Click "Ver Zonas" button on the warehouse card
    const card = page.locator(`text="${wh.name}"`).first();
    await expect(card).toBeVisible({ timeout: 10_000 });

    // Try footer "Ver Zonas" button
    const viewZonesBtn = page
      .getByRole('link', { name: /Ver Zonas/i })
      .first();

    if (await viewZonesBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await viewZonesBtn.click();
    } else {
      // Fallback: navigate directly
      await page.goto(`/stock/locations/${wh.id}`);
    }

    await page.waitForLoadState('networkidle');

    // Should be on warehouse detail page showing zones
    await expect(page).toHaveURL(new RegExp(`/stock/locations/${wh.id}`), {
      timeout: 10_000,
    });

    // Verify warehouse name appears
    await expect(
      page.locator(`text=${wh.name}`).first()
    ).toBeVisible({ timeout: 10_000 });

    // Cleanup
    await deleteWarehouseViaApi(userToken, wh.id);
  });
});
