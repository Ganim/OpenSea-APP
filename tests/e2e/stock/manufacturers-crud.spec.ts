import { expect, test } from '@playwright/test';
import {
  getAuthenticatedToken,
  injectAuthIntoBrowser,
} from '../helpers/auth.helper';
import {
  MANUFACTURERS_FULL_PERMISSIONS,
  createStockUser,
} from '../helpers/stock-permissions.helper';
import {
  createManufacturerViaApi,
  deleteManufacturerViaApi,
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
    MANUFACTURERS_FULL_PERMISSIONS,
    `e2e-stock-mfr-${Date.now().toString(36)}`
  );
  const auth = await getAuthenticatedToken(user.email, user.password);
  userToken = auth.token;
  userTenantId = auth.tenantId;
});

test.describe('Stock - Manufacturers CRUD', () => {
  // ─── CREATE ─────────────────────────────────────────────────────────

  test('3.1 - Criar fabricante via CNPJ modal → criação manual', async ({
    page,
  }) => {
    const mfrName = `e2e-mfr-${Date.now()}`;

    await injectAuthIntoBrowser(page, userToken, userTenantId);
    await navigateToStockPage(page, 'manufacturers');

    // Click "Novo Fabricante" → opens CNPJ lookup modal
    await page.getByRole('button', { name: 'Novo Fabricante' }).click();

    // Click "Criar Manualmente" to skip CNPJ lookup
    const manualBtn = page.getByRole('button', { name: /Criar Manualmente/i });
    await expect(manualBtn).toBeVisible({ timeout: 5_000 });
    await manualBtn.click();

    // Create modal should open
    await expect(page.getByText('Novo Fabricante').first()).toBeVisible({
      timeout: 5_000,
    });

    // Fill required fields via EntityForm
    // EntityForm uses label-based inputs
    const nameInput = page.getByLabel(/Nome/i).first();
    await nameInput.fill(mfrName);

    const countryInput = page.getByLabel(/País/i).first();
    if (await countryInput.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await countryInput.clear();
      await countryInput.fill('Brasil');
    }

    // Submit
    const submitBtn = page
      .locator('[role="dialog"] button')
      .filter({ hasText: /Criar|Salvar/i })
      .first();
    await submitBtn.click();
    await waitForToast(page, 'sucesso');

    // Verify manufacturer appears in grid (name is uppercased in UI)
    await expect(page.getByText(mfrName.toUpperCase())).toBeVisible({
      timeout: 10_000,
    });
  });

  test('3.2 - Criar fabricante via API e verificar listagem', async ({
    page,
  }) => {
    const mfr = await createManufacturerViaApi(userToken, {
      name: `e2e-mfr-api-${Date.now()}`,
      country: 'Brasil',
      isActive: true,
    });

    await injectAuthIntoBrowser(page, userToken, userTenantId);
    await navigateToStockPage(page, 'manufacturers');

    // Verify page loaded
    await expect(
      page.getByRole('heading', { name: 'Fabricantes' })
    ).toBeVisible({ timeout: 10_000 });

    // Verify manufacturer appears (uppercased in UI)
    await expect(page.getByText(mfr.name.toUpperCase())).toBeVisible({
      timeout: 10_000,
    });

    // Cleanup
    await deleteManufacturerViaApi(userToken, mfr.id);
  });

  // ─── READ / SEARCH ─────────────────────────────────────────────────

  test('3.3 - Buscar fabricante por nome', async ({ page }) => {
    const mfr = await createManufacturerViaApi(userToken, {
      name: `e2e-mfr-search-${Date.now()}`,
      country: 'Brasil',
    });

    await injectAuthIntoBrowser(page, userToken, userTenantId);
    await navigateToStockPage(page, 'manufacturers');

    const searchInput = page.getByPlaceholder(/Buscar/i);
    await searchInput.fill(mfr.name);
    await page.waitForTimeout(500);

    await expect(page.getByText(mfr.name.toUpperCase())).toBeVisible({
      timeout: 5_000,
    });

    // Cleanup
    await deleteManufacturerViaApi(userToken, mfr.id);
  });

  test('3.4 - Visualizar fabricante via context menu', async ({ page }) => {
    const mfr = await createManufacturerViaApi(userToken, {
      name: `e2e-mfr-view-${Date.now()}`,
      country: 'Brasil',
      email: 'test@example.com',
    });

    await injectAuthIntoBrowser(page, userToken, userTenantId);
    await navigateToStockPage(page, 'manufacturers');

    // Wait for grid cards to render
    await expect(
      page.locator(`text=${mfr.name.toUpperCase()}`).first()
    ).toBeVisible({ timeout: 10_000 });

    await openContextMenu(page, mfr.name.toUpperCase());
    await clickContextAction(page, 'Visualizar');

    // Should navigate to detail page or open view modal
    await page.waitForTimeout(2_000);

    // Check if we navigated to detail page or view modal opened
    const isDetailPage = page.url().includes('/stock/manufacturers/');
    if (isDetailPage) {
      await expect(
        page.getByRole('heading').filter({ hasText: mfr.name }).first()
      ).toBeVisible({ timeout: 10_000 });
    } else {
      await expect(page.locator('[role="dialog"]')).toBeVisible({
        timeout: 5_000,
      });
    }

    // Cleanup
    await deleteManufacturerViaApi(userToken, mfr.id);
  });

  // ─── UPDATE (RENAME) ───────────────────────────────────────────────

  test.fixme('3.5 - Renomear fabricante via context menu', async ({ page }) => {
    const mfr = await createManufacturerViaApi(userToken, {
      name: `e2e-mfr-rename-${Date.now()}`,
      country: 'Brasil',
    });
    const newName = `e2e-mfr-renamed-${Date.now()}`;

    await injectAuthIntoBrowser(page, userToken, userTenantId);
    await navigateToStockPage(page, 'manufacturers');

    // Wait for grid cards
    await expect(
      page.locator(`text=${mfr.name.toUpperCase()}`).first()
    ).toBeVisible({ timeout: 10_000 });

    await openContextMenu(page, mfr.name.toUpperCase());
    await clickContextAction(page, 'Renomear');

    // Rename modal — title: "Renomear Fabricante", field: "Nome do Fabricante"
    await expect(page.getByText('Renomear Fabricante')).toBeVisible({
      timeout: 5_000,
    });

    const nameInput = page
      .locator('[role="dialog"] input[type="text"]')
      .first();
    await nameInput.clear();
    await nameInput.fill(newName);

    const saveBtn = page.getByRole('button', { name: /^Salvar$/ });
    await expect(saveBtn).toBeVisible({ timeout: 3_000 });
    await saveBtn.click();
    await waitForToast(page, 'sucesso');

    await expect(page.getByText(newName.toUpperCase())).toBeVisible({
      timeout: 10_000,
    });

    // Cleanup
    await deleteManufacturerViaApi(userToken, mfr.id);
  });

  // ─── DUPLICATE ──────────────────────────────────────────────────────

  test('3.6 - Duplicar fabricante', async ({ page }) => {
    const mfr = await createManufacturerViaApi(userToken, {
      name: `e2e-mfr-dup-${Date.now()}`,
      country: 'Brasil',
    });

    await injectAuthIntoBrowser(page, userToken, userTenantId);
    await navigateToStockPage(page, 'manufacturers');

    await openContextMenu(page, mfr.name.toUpperCase());
    await clickContextAction(page, 'Duplicar');

    // Confirm duplication
    const confirmBtn = page
      .locator('[role="alertdialog"] button, [role="dialog"] button')
      .filter({ hasText: /Confirmar|Duplicar/i })
      .first();
    await expect(confirmBtn).toBeVisible({ timeout: 5_000 });
    await confirmBtn.click();
    await waitForToast(page, 'sucesso');

    // Verify copy exists (name + " (Cópia)")
    const copyName = `${mfr.name} (Cópia)`.toUpperCase();
    await expect(page.getByText(copyName)).toBeVisible({ timeout: 10_000 });

    // Cleanup
    await deleteManufacturerViaApi(userToken, mfr.id);
  });

  // ─── DELETE ─────────────────────────────────────────────────────────

  test('3.7 - Excluir fabricante via context menu', async ({ page }) => {
    const mfr = await createManufacturerViaApi(userToken, {
      name: `e2e-mfr-delete-${Date.now()}`,
      country: 'Brasil',
    });

    await injectAuthIntoBrowser(page, userToken, userTenantId);
    await navigateToStockPage(page, 'manufacturers');

    await openContextMenu(page, mfr.name.toUpperCase());
    await clickContextAction(page, 'Excluir');

    await confirmDelete(page);
    await waitForToast(page, 'sucesso');

    await expect(page.getByText(mfr.name.toUpperCase())).not.toBeVisible({
      timeout: 5_000,
    });
  });

  // ─── DETAIL PAGE ───────────────────────────────────────────────────

  test('3.8 - Navegar para página de detalhe', async ({ page }) => {
    const mfr = await createManufacturerViaApi(userToken, {
      name: `e2e-mfr-detail-${Date.now()}`,
      country: 'Brasil',
      email: 'detail@test.com',
      phone: '11999990000',
    });

    await injectAuthIntoBrowser(page, userToken, userTenantId);
    await page.goto(`/stock/manufacturers/${mfr.id}`);
    await page.waitForLoadState('networkidle');

    // Verify detail page loaded — name appears in heading area
    await expect(page.locator(`text=${mfr.name}`).first()).toBeVisible({
      timeout: 15_000,
    });

    // Check tabs exist (Geral, Histórico de Pedidos, Documentos)
    await expect(page.getByText('Geral')).toBeVisible({ timeout: 5_000 });

    // Cleanup
    await deleteManufacturerViaApi(userToken, mfr.id);
  });

  // ─── EDIT PAGE ─────────────────────────────────────────────────────

  test('3.9 - Editar fabricante via página de edição', async ({ page }) => {
    const mfr = await createManufacturerViaApi(userToken, {
      name: `e2e-mfr-editpage-${Date.now()}`,
      country: 'Brasil',
    });

    await injectAuthIntoBrowser(page, userToken, userTenantId);
    await page.goto(`/stock/manufacturers/${mfr.id}/edit`);
    await page.waitForLoadState('networkidle');

    // Wait for "Identificação" section heading — confirms form loaded
    await expect(page.getByText('Identificação')).toBeVisible({
      timeout: 15_000,
    });

    // Verify name field has current value
    const nameInput = page.locator('input').first();
    await expect(nameInput).toHaveValue(mfr.name, { timeout: 5_000 });

    // Update name
    const newName = `e2e-mfr-updated-${Date.now()}`;
    await nameInput.clear();
    await nameInput.fill(newName);

    // Submit — "Salvar" button in the page header
    await page
      .getByRole('button')
      .filter({ hasText: 'Salvar' })
      .first()
      .click();
    await waitForToast(page, 'sucesso');

    // Should redirect to detail page
    await expect(page).toHaveURL(/\/stock\/manufacturers\//, {
      timeout: 10_000,
    });

    // Cleanup
    await deleteManufacturerViaApi(userToken, mfr.id);
  });
});
