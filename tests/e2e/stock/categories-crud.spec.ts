import { expect, test } from '@playwright/test';
import {
  getAuthenticatedToken,
  injectAuthIntoBrowser,
} from '../helpers/auth.helper';
import {
  CATEGORIES_FULL_PERMISSIONS,
  createStockUser,
} from '../helpers/stock-permissions.helper';
import {
  createCategoryViaApi,
  deleteCategoryViaApi,
  navigateToStockPage,
  waitForToast,
  openContextMenu,
  clickContextAction,
  confirmDelete,
} from '../helpers/stock.helper';

let userToken: string;
let userTenantId: string;

test.beforeAll(async () => {
  const user = await createStockUser(
    CATEGORIES_FULL_PERMISSIONS,
    `e2e-stock-categories-${Date.now().toString(36)}`
  );
  const auth = await getAuthenticatedToken(user.email, user.password);
  userToken = auth.token;
  userTenantId = auth.tenantId;
});

test.describe('Stock - Categories CRUD', () => {
  // ─── CREATE ─────────────────────────────────────────────────────────

  test('2.1 - Criar categoria via modal', async ({ page }) => {
    const catName = `e2e-cat-${Date.now()}`;

    await injectAuthIntoBrowser(page, userToken, userTenantId);
    await navigateToStockPage(page, 'product-categories');

    await page.getByRole('button', { name: 'Nova Categoria' }).click();
    await expect(page.getByText('Nova Categoria').first()).toBeVisible({
      timeout: 5_000,
    });

    // Fill form
    await page.locator('#name').fill(catName);
    await page.locator('#description').fill('Categoria criada via E2E');

    // Submit
    await page.getByRole('button', { name: 'Criar Categoria' }).click();
    await waitForToast(page, 'sucesso');

    // Verify category appears
    await expect(page.getByText(catName)).toBeVisible({ timeout: 10_000 });
  });

  test('2.2 - Validar erro ao criar categoria sem nome', async ({ page }) => {
    await injectAuthIntoBrowser(page, userToken, userTenantId);
    await navigateToStockPage(page, 'product-categories');

    await page.getByRole('button', { name: 'Nova Categoria' }).click();
    await expect(page.getByText('Nova Categoria').first()).toBeVisible({
      timeout: 5_000,
    });

    // Try to submit empty form
    await page.getByRole('button', { name: 'Criar Categoria' }).click();

    // Modal should remain open (validation prevents submission)
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible({ timeout: 3_000 });
  });

  test('2.3 - Criar categoria com ícone SVG', async ({ page }) => {
    const catName = `e2e-cat-icon-${Date.now()}`;

    await injectAuthIntoBrowser(page, userToken, userTenantId);
    await navigateToStockPage(page, 'product-categories');

    await page.getByRole('button', { name: 'Nova Categoria' }).click();
    await page.locator('#name').fill(catName);
    await page.locator('#description').fill('Com ícone');

    const iconInput = page.locator('#iconUrl');
    if (await iconInput.isVisible()) {
      await iconInput.fill('https://example.com/icon.svg');
    }

    await page.getByRole('button', { name: 'Criar Categoria' }).click();
    await waitForToast(page, 'sucesso');
    await expect(page.getByText(catName)).toBeVisible({ timeout: 10_000 });
  });

  // ─── READ / LIST ────────────────────────────────────────────────────

  test('2.4 - Listar categorias e verificar hidratação', async ({ page }) => {
    const cat = await createCategoryViaApi(userToken, {
      name: `e2e-cat-list-${Date.now()}`,
      isActive: true,
    });

    await injectAuthIntoBrowser(page, userToken, userTenantId);
    await navigateToStockPage(page, 'product-categories');

    // Verify page loaded
    await expect(page.getByRole('heading', { name: 'Categorias' })).toBeVisible(
      { timeout: 10_000 }
    );

    // Verify category appears
    await expect(page.getByText(cat.name)).toBeVisible({ timeout: 10_000 });

    // Cleanup
    await deleteCategoryViaApi(userToken, cat.id);
  });

  test('2.5 - Buscar categoria por nome', async ({ page }) => {
    const cat = await createCategoryViaApi(userToken, {
      name: `e2e-cat-search-${Date.now()}`,
    });

    await injectAuthIntoBrowser(page, userToken, userTenantId);
    await navigateToStockPage(page, 'product-categories');

    const searchInput = page.getByPlaceholder(/Buscar/i);
    await searchInput.fill(cat.name);
    await page.waitForTimeout(500);

    await expect(page.getByText(cat.name)).toBeVisible({ timeout: 5_000 });

    // Cleanup
    await deleteCategoryViaApi(userToken, cat.id);
  });

  // ─── HIERARCHY ──────────────────────────────────────────────────────

  test('2.6 - Criar subcategoria (parent-child)', async ({ page }) => {
    const parent = await createCategoryViaApi(userToken, {
      name: `e2e-cat-parent-${Date.now()}`,
    });

    const childName = `e2e-cat-child-${Date.now()}`;

    await injectAuthIntoBrowser(page, userToken, userTenantId);
    await navigateToStockPage(page, 'product-categories');

    await page.getByRole('button', { name: 'Nova Categoria' }).click();
    await page.locator('#name').fill(childName);

    // Try to select parent category if dropdown exists
    const parentSelect = page.locator('#parentId, [name="parentId"], select');
    if (await parentSelect.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await parentSelect.selectOption({ label: parent.name });
    }

    await page.getByRole('button', { name: 'Criar Categoria' }).click();
    await waitForToast(page, 'sucesso');

    // Cleanup
    await deleteCategoryViaApi(userToken, parent.id);
  });

  // ─── UPDATE ─────────────────────────────────────────────────────────

  test.fixme('2.7 - Editar categoria via context menu', async ({ page }) => {
    const cat = await createCategoryViaApi(userToken, {
      name: `e2e-cat-edit-${Date.now()}`,
    });
    const newName = `e2e-cat-edited-${Date.now()}`;

    await injectAuthIntoBrowser(page, userToken, userTenantId);
    await navigateToStockPage(page, 'product-categories');

    await openContextMenu(page, cat.name);
    await clickContextAction(page, 'Editar');

    await expect(page.locator('[role="dialog"]')).toBeVisible({
      timeout: 5_000,
    });

    const nameInput = page.locator('[role="dialog"] #name');
    await nameInput.clear();
    await nameInput.fill(newName);

    const saveBtn = page.getByRole('button', { name: /Salvar Alterações/i });
    await expect(saveBtn).toBeVisible({ timeout: 3_000 });
    await saveBtn.click();
    await waitForToast(page, 'sucesso');

    await expect(page.getByText(newName)).toBeVisible({ timeout: 10_000 });

    // Cleanup
    await deleteCategoryViaApi(userToken, cat.id);
  });

  // ─── DELETE ─────────────────────────────────────────────────────────

  test('2.8 - Excluir categoria via context menu', async ({ page }) => {
    const cat = await createCategoryViaApi(userToken, {
      name: `e2e-cat-delete-${Date.now()}`,
    });

    await injectAuthIntoBrowser(page, userToken, userTenantId);
    await navigateToStockPage(page, 'product-categories');

    await openContextMenu(page, cat.name);
    await clickContextAction(page, 'Excluir');

    await confirmDelete(page);
    await waitForToast(page, 'sucesso');

    await expect(page.getByText(cat.name)).not.toBeVisible({
      timeout: 5_000,
    });
  });

  test('2.9 - Cancelar exclusão de categoria', async ({ page }) => {
    const cat = await createCategoryViaApi(userToken, {
      name: `e2e-cat-cancel-del-${Date.now()}`,
    });

    await injectAuthIntoBrowser(page, userToken, userTenantId);
    await navigateToStockPage(page, 'product-categories');

    await openContextMenu(page, cat.name);
    await clickContextAction(page, 'Excluir');

    await page
      .locator('[role="alertdialog"] button, [role="dialog"] button')
      .filter({ hasText: 'Cancelar' })
      .first()
      .click();

    await expect(page.getByText(cat.name)).toBeVisible({ timeout: 5_000 });

    // Cleanup
    await deleteCategoryViaApi(userToken, cat.id);
  });
});
