import { expect, test } from '@playwright/test';
import {
  getAuthenticatedToken,
  injectAuthIntoBrowser,
} from '../helpers/auth.helper';
import {
  TAGS_FULL_PERMISSIONS,
  createStockUser,
} from '../helpers/stock-permissions.helper';
import {
  createTagViaApi,
  deleteTagViaApi,
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
    TAGS_FULL_PERMISSIONS,
    `e2e-stock-tags-${Date.now().toString(36)}`
  );
  const auth = await getAuthenticatedToken(user.email, user.password);
  userToken = auth.token;
  userTenantId = auth.tenantId;
});

test.describe('Stock - Tags CRUD', () => {
  // ─── CREATE ─────────────────────────────────────────────────────────

  test('1.1 - Criar tag via modal', async ({ page }) => {
    const tagName = `e2e-tag-${Date.now()}`;

    await injectAuthIntoBrowser(page, userToken, userTenantId);
    await navigateToStockPage(page, 'tags');

    // Click "Nova Tag"
    await page.getByRole('button', { name: 'Nova Tag' }).click();
    await expect(page.getByText('Nova Tag').first()).toBeVisible({
      timeout: 5_000,
    });

    // Fill form
    await page.locator('#name').fill(tagName);
    await page.locator('#description').fill('Tag criada via E2E');

    // Submit
    await page.getByRole('button', { name: 'Criar Tag' }).click();
    await waitForToast(page, 'sucesso');

    // Verify tag appears in grid
    await expect(page.getByText(tagName)).toBeVisible({ timeout: 10_000 });
  });

  test('1.2 - Validar erro ao criar tag sem nome', async ({ page }) => {
    await injectAuthIntoBrowser(page, userToken, userTenantId);
    await navigateToStockPage(page, 'tags');

    await page.getByRole('button', { name: 'Nova Tag' }).click();
    await expect(page.getByText('Nova Tag').first()).toBeVisible({
      timeout: 5_000,
    });

    // Try to submit empty form
    await page.getByRole('button', { name: 'Criar Tag' }).click();

    // Should show validation error or not close modal
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible({ timeout: 3_000 });
  });

  test('1.3 - Criar tag com cor personalizada', async ({ page }) => {
    const tagName = `e2e-tag-color-${Date.now()}`;

    await injectAuthIntoBrowser(page, userToken, userTenantId);
    await navigateToStockPage(page, 'tags');

    await page.getByRole('button', { name: 'Nova Tag' }).click();
    await page.locator('#name').fill(tagName);

    // Change hex color in text input next to color picker
    const hexInput = page.locator('[role="dialog"] input[type="text"]').last();
    if (await hexInput.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await hexInput.clear();
      await hexInput.fill('#FF5733');
    }

    await page.getByRole('button', { name: 'Criar Tag' }).click();
    await waitForToast(page, 'sucesso');
    await expect(page.getByText(tagName)).toBeVisible({ timeout: 10_000 });
  });

  // ─── READ / LIST ────────────────────────────────────────────────────

  test('1.4 - Listar tags e verificar hidratação', async ({ page }) => {
    // Create a tag via API to ensure at least one exists
    const tag = await createTagViaApi(userToken, {
      name: `e2e-tag-list-${Date.now()}`,
      color: '#3b82f6',
    });

    await injectAuthIntoBrowser(page, userToken, userTenantId);
    await navigateToStockPage(page, 'tags');

    // Verify page loaded without hydration errors
    await expect(page.getByRole('heading', { name: 'Tags' })).toBeVisible({
      timeout: 10_000,
    });

    // Verify the tag appears
    await expect(page.getByText(tag.name)).toBeVisible({ timeout: 10_000 });

    // Cleanup
    await deleteTagViaApi(userToken, tag.id);
  });

  test('1.5 - Buscar tag por nome', async ({ page }) => {
    const tag = await createTagViaApi(userToken, {
      name: `e2e-tag-search-${Date.now()}`,
    });

    await injectAuthIntoBrowser(page, userToken, userTenantId);
    await navigateToStockPage(page, 'tags');

    // Use search bar
    const searchInput = page.getByPlaceholder(/Buscar/i);
    await searchInput.fill(tag.name);
    await page.waitForTimeout(500);

    // Verify filtered result
    await expect(page.getByText(tag.name)).toBeVisible({ timeout: 5_000 });

    // Cleanup
    await deleteTagViaApi(userToken, tag.id);
  });

  // ─── UPDATE ─────────────────────────────────────────────────────────

  test.fixme('1.6 - Editar tag via context menu', async ({ page }) => {
    const tag = await createTagViaApi(userToken, {
      name: `e2e-tag-edit-${Date.now()}`,
    });
    const newName = `e2e-tag-edited-${Date.now()}`;

    await injectAuthIntoBrowser(page, userToken, userTenantId);
    await navigateToStockPage(page, 'tags');

    await openContextMenu(page, tag.name);
    await clickContextAction(page, 'Editar');

    // Edit modal opens
    await expect(page.locator('[role="dialog"]')).toBeVisible({
      timeout: 5_000,
    });

    const nameInput = page.locator('[role="dialog"] #name');
    await nameInput.click({ clickCount: 3 });
    await page.keyboard.type(newName);

    // Submit via button
    const saveBtn = page.getByRole('button', { name: /Salvar Alterações/i });
    await expect(saveBtn).toBeVisible({ timeout: 3_000 });
    await saveBtn.click();

    await waitForToast(page, 'sucesso');

    // Wait for modal to close and grid to refresh with new name
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({
      timeout: 5_000,
    });

    // Wait for the new name to appear in the grid (refetch may take a moment)
    await expect(page.getByText(newName).first()).toBeVisible({ timeout: 15_000 });

    // Cleanup
    await deleteTagViaApi(userToken, tag.id);
  });

  // ─── DELETE ─────────────────────────────────────────────────────────

  test('1.7 - Excluir tag via context menu', async ({ page }) => {
    const tag = await createTagViaApi(userToken, {
      name: `e2e-tag-delete-${Date.now()}`,
    });

    await injectAuthIntoBrowser(page, userToken, userTenantId);
    await navigateToStockPage(page, 'tags');

    // Right-click to open context menu
    await openContextMenu(page, tag.name);
    await clickContextAction(page, 'Excluir');

    // Confirm deletion
    await confirmDelete(page);
    await waitForToast(page, 'sucesso');

    // Verify tag removed from grid
    await expect(page.getByText(tag.name)).not.toBeVisible({ timeout: 5_000 });
  });

  test('1.8 - Cancelar exclusão de tag', async ({ page }) => {
    const tag = await createTagViaApi(userToken, {
      name: `e2e-tag-cancel-del-${Date.now()}`,
    });

    await injectAuthIntoBrowser(page, userToken, userTenantId);
    await navigateToStockPage(page, 'tags');

    await openContextMenu(page, tag.name);
    await clickContextAction(page, 'Excluir');

    // Cancel
    await page
      .locator('[role="alertdialog"] button, [role="dialog"] button')
      .filter({ hasText: 'Cancelar' })
      .first()
      .click();

    // Tag should still be visible
    await expect(page.getByText(tag.name)).toBeVisible({ timeout: 5_000 });

    // Cleanup
    await deleteTagViaApi(userToken, tag.id);
  });
});
