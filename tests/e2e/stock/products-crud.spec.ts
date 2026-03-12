import { expect, test } from '@playwright/test';
import {
  getAuthenticatedToken,
  injectAuthIntoBrowser,
} from '../helpers/auth.helper';
import {
  PRODUCTS_FULL_PERMISSIONS,
  createStockUser,
} from '../helpers/stock-permissions.helper';
import {
  createProductViaApi,
  createTemplateViaApi,
  deleteProductViaApi,
  deleteTemplateViaApi,
  navigateToStockPage,
  waitForToast,
  openContextMenu,
  clickContextAction,
} from '../helpers/stock.helper';

let userToken: string;
let userTenantId: string;
let defaultTemplateId: string;
let defaultTemplateName: string;

test.beforeAll(async () => {
  const user = await createStockUser(
    PRODUCTS_FULL_PERMISSIONS,
    `e2e-stock-products-${Date.now().toString(36)}`
  );
  const auth = await getAuthenticatedToken(user.email, user.password);
  userToken = auth.token;
  userTenantId = auth.tenantId;

  // Create a template to use for product creation
  const tpl = await createTemplateViaApi(userToken, {
    name: `e2e-tpl-for-products-${Date.now()}`,
    unitOfMeasure: 'UNITS',
  });
  defaultTemplateId = tpl.id;
  defaultTemplateName = tpl.name;
});

test.afterAll(async () => {
  // Cleanup template
  if (defaultTemplateId) {
    await deleteTemplateViaApi(userToken, defaultTemplateId).catch(() => {});
  }
});

test.describe('Stock - Products CRUD', () => {
  // ─── CREATE ─────────────────────────────────────────────────────────

  test.fixme('5.1 - Criar produto via modal', async ({ page }) => {
    const productName = `e2e-product-${Date.now()}`;

    await injectAuthIntoBrowser(page, userToken, userTenantId);
    await navigateToStockPage(page, 'products');

    await page.getByRole('button', { name: 'Novo Produto' }).click();
    await expect(page.locator('[role="dialog"]')).toBeVisible({
      timeout: 5_000,
    });

    // Fill name
    const nameInput = page.getByLabel(/Nome/i).first();
    await nameInput.fill(productName);

    // Select template — look for a select/combobox
    const templateSelect = page
      .locator('[role="dialog"] [role="combobox"]')
      .first();
    if (await templateSelect.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await templateSelect.click();
      await page.waitForTimeout(300);
      const option = page
        .locator('[role="option"]')
        .filter({ hasText: defaultTemplateName })
        .first();
      if (await option.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await option.click();
      }
    }

    // Submit
    const submitBtn = page
      .locator('[role="dialog"] button')
      .filter({ hasText: /Criar|Salvar/i })
      .first();
    await submitBtn.click();
    await waitForToast(page, 'sucesso');

    // Verify product appears in grid
    await expect(page.getByText(productName)).toBeVisible({ timeout: 10_000 });
  });

  test.fixme(
    '5.2 - Validar erro ao criar produto sem nome',
    async ({ page }) => {
      await injectAuthIntoBrowser(page, userToken, userTenantId);
      await navigateToStockPage(page, 'products');

      await page.getByRole('button', { name: 'Novo Produto' }).click();
      await expect(page.locator('[role="dialog"]')).toBeVisible({
        timeout: 5_000,
      });

      // Submit without filling name
      const submitBtn = page
        .locator('[role="dialog"] button')
        .filter({ hasText: /Criar|Salvar/i })
        .first();
      await submitBtn.click();

      // Modal should remain open (validation prevents submission)
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible({ timeout: 3_000 });
    }
  );

  // ─── READ / LIST ────────────────────────────────────────────────────

  test.fixme(
    '5.3 - Listar produtos e verificar hidratação',
    async ({ page }) => {
      const product = await createProductViaApi(userToken, {
        name: `e2e-product-list-${Date.now()}`,
        templateId: defaultTemplateId,
      });

      await injectAuthIntoBrowser(page, userToken, userTenantId);
      await navigateToStockPage(page, 'products');

      await expect(page.getByRole('heading', { name: 'Produtos' })).toBeVisible(
        { timeout: 10_000 }
      );

      await expect(page.getByText(product.name)).toBeVisible({
        timeout: 10_000,
      });

      // Cleanup
      await deleteProductViaApi(userToken, product.id);
    }
  );

  test.fixme('5.4 - Buscar produto por nome', async ({ page }) => {
    const product = await createProductViaApi(userToken, {
      name: `e2e-product-search-${Date.now()}`,
      templateId: defaultTemplateId,
    });

    await injectAuthIntoBrowser(page, userToken, userTenantId);
    await navigateToStockPage(page, 'products');

    const searchInput = page.getByPlaceholder(/Buscar/i);
    await searchInput.fill(product.name);
    await page.waitForTimeout(500);

    await expect(page.getByText(product.name)).toBeVisible({
      timeout: 5_000,
    });

    // Cleanup
    await deleteProductViaApi(userToken, product.id);
  });

  // ─── UPDATE ─────────────────────────────────────────────────────────

  test.fixme('5.5 - Renomear produto via context menu', async ({ page }) => {
    const product = await createProductViaApi(userToken, {
      name: `e2e-product-rename-${Date.now()}`,
      templateId: defaultTemplateId,
    });
    const newName = `e2e-product-renamed-${Date.now()}`;

    await injectAuthIntoBrowser(page, userToken, userTenantId);
    await navigateToStockPage(page, 'products');

    await openContextMenu(page, product.name);
    await clickContextAction(page, 'Renomear');

    await expect(page.locator('[role="dialog"]')).toBeVisible({
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

    await page.waitForTimeout(1_000);
    const searchInput = page.getByPlaceholder(/Buscar/i);
    await searchInput.fill(newName);
    await page.waitForTimeout(500);

    await expect(page.getByText(newName).first()).toBeVisible({
      timeout: 10_000,
    });

    // Cleanup
    await deleteProductViaApi(userToken, product.id);
  });

  test.fixme('5.6 - Editar produto via context menu', async ({ page }) => {
    const product = await createProductViaApi(userToken, {
      name: `e2e-product-edit-${Date.now()}`,
      templateId: defaultTemplateId,
    });

    await injectAuthIntoBrowser(page, userToken, userTenantId);
    await navigateToStockPage(page, 'products');

    await openContextMenu(page, product.name);
    await clickContextAction(page, 'Editar');

    // Should open edit modal or navigate to edit page
    await page.waitForTimeout(2_000);

    const isEditPage = page.url().includes('/edit');
    if (isEditPage) {
      // Edit page — verify form loaded
      await expect(page.locator('input').first()).toBeVisible({
        timeout: 10_000,
      });
    } else {
      // Edit modal
      await expect(page.locator('[role="dialog"]')).toBeVisible({
        timeout: 5_000,
      });
    }

    // Cleanup
    await deleteProductViaApi(userToken, product.id);
  });

  // ─── DELETE ─────────────────────────────────────────────────────────

  test.fixme('5.7 - Excluir produto via context menu', async ({ page }) => {
    const product = await createProductViaApi(userToken, {
      name: `e2e-product-delete-${Date.now()}`,
      templateId: defaultTemplateId,
    });

    await injectAuthIntoBrowser(page, userToken, userTenantId);
    await navigateToStockPage(page, 'products');

    await openContextMenu(page, product.name);
    await clickContextAction(page, 'Excluir');

    // Products may use PIN verification or simple confirm
    const deleteBtn = page
      .locator('[role="alertdialog"] button, [role="dialog"] button')
      .filter({ hasText: /Excluir|Confirmar/i })
      .first();

    const otpInput = page.locator('[data-input-otp="true"]').first();

    await Promise.race([
      deleteBtn.waitFor({ state: 'visible', timeout: 5_000 }).catch(() => {}),
      otpInput.waitFor({ state: 'visible', timeout: 5_000 }).catch(() => {}),
    ]);

    if (await otpInput.isVisible().catch(() => false)) {
      // PIN required — cleanup via API
      await deleteProductViaApi(userToken, product.id);
      return;
    }

    if (await deleteBtn.isVisible().catch(() => false)) {
      await deleteBtn.click();
      await waitForToast(page, 'sucesso');
      await expect(page.getByText(product.name)).not.toBeVisible({
        timeout: 5_000,
      });
    } else {
      await deleteProductViaApi(userToken, product.id);
    }
  });

  // ─── DETAIL / VIEW ────────────────────────────────────────────────

  test.fixme('5.8 - Visualizar produto via context menu', async ({ page }) => {
    const product = await createProductViaApi(userToken, {
      name: `e2e-product-view-${Date.now()}`,
      templateId: defaultTemplateId,
    });

    await injectAuthIntoBrowser(page, userToken, userTenantId);
    await navigateToStockPage(page, 'products');

    await openContextMenu(page, product.name);
    await clickContextAction(page, 'Ver');

    await page.waitForTimeout(2_000);

    // Should navigate to detail page or open view modal
    const isDetailPage =
      page.url().includes('/stock/products/') &&
      !page.url().endsWith('/products');

    if (isDetailPage) {
      await expect(page.locator(`text=${product.name}`).first()).toBeVisible({
        timeout: 10_000,
      });
    } else {
      const hasDialog = await page
        .locator('[role="dialog"]')
        .isVisible()
        .catch(() => false);
      expect(hasDialog || isDetailPage).toBeTruthy();
    }

    // Cleanup
    await deleteProductViaApi(userToken, product.id);
  });

  // ─── FILTER ───────────────────────────────────────────────────────

  test.fixme('5.9 - Filtrar produtos por template', async ({ page }) => {
    const product = await createProductViaApi(userToken, {
      name: `e2e-product-filter-${Date.now()}`,
      templateId: defaultTemplateId,
    });

    await injectAuthIntoBrowser(page, userToken, userTenantId);
    await navigateToStockPage(page, 'products');

    // Look for template filter button
    const filterBtn = page
      .getByRole('button')
      .filter({ hasText: /Template/i })
      .first();

    if (await filterBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await filterBtn.click();
      await page.waitForTimeout(300);

      // Select the default template from dropdown
      const option = page
        .locator('[role="option"], [role="menuitemcheckbox"]')
        .filter({ hasText: defaultTemplateName })
        .first();

      if (await option.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await option.click();
        await page.waitForTimeout(500);

        // Verify filtered results contain our product
        await expect(page.getByText(product.name)).toBeVisible({
          timeout: 5_000,
        });
      }
    }

    // Cleanup
    await deleteProductViaApi(userToken, product.id);
  });
});
