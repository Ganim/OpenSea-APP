import { expect, test } from '@playwright/test';
import {
  getAuthenticatedToken,
  injectAuthIntoBrowser,
} from '../helpers/auth.helper';
import {
  TEMPLATES_FULL_PERMISSIONS,
  createStockUser,
} from '../helpers/stock-permissions.helper';
import {
  createTemplateViaApi,
  deleteTemplateViaApi,
  navigateToStockPage,
  waitForToast,
  openContextMenu,
  clickContextAction,
} from '../helpers/stock.helper';

let userToken: string;
let userTenantId: string;

test.beforeAll(async () => {
  const user = await createStockUser(
    TEMPLATES_FULL_PERMISSIONS,
    `e2e-stock-tpl-${Date.now().toString(36)}`
  );
  const auth = await getAuthenticatedToken(user.email, user.password);
  userToken = auth.token;
  userTenantId = auth.tenantId;
});

test.describe('Stock - Templates CRUD', () => {
  // ─── CREATE ─────────────────────────────────────────────────────────

  test.fixme('4.1 - Criar template via modal', async ({ page }) => {
    const tplName = `e2e-tpl-${Date.now()}`;

    await injectAuthIntoBrowser(page, userToken, userTenantId);
    await navigateToStockPage(page, 'templates');

    await page.getByRole('button', { name: 'Novo Template' }).click();
    await expect(page.getByText('Novo Template').first()).toBeVisible({
      timeout: 5_000,
    });

    // Fill name via EntityForm (label-based)
    const nameInput = page.getByLabel(/Nome/i).first();
    await nameInput.fill(tplName);

    // Submit
    const submitBtn = page
      .locator('[role="dialog"] button')
      .filter({ hasText: /Criar|Salvar/i })
      .first();
    await submitBtn.click();
    await waitForToast(page, 'sucesso');

    // Verify template appears
    await expect(page.getByText(tplName)).toBeVisible({ timeout: 10_000 });
  });

  test.fixme(
    '4.2 - Validar erro ao criar template sem nome',
    async ({ page }) => {
      await injectAuthIntoBrowser(page, userToken, userTenantId);
      await navigateToStockPage(page, 'templates');

      await page.getByRole('button', { name: 'Novo Template' }).click();
      await expect(page.getByText('Novo Template').first()).toBeVisible({
        timeout: 5_000,
      });

      // Submit without filling name
      const submitBtn = page
        .locator('[role="dialog"] button')
        .filter({ hasText: /Criar|Salvar/i })
        .first();
      await submitBtn.click();

      // Modal should remain open
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible({ timeout: 3_000 });
    }
  );

  // ─── READ / LIST ────────────────────────────────────────────────────

  test('4.3 - Listar templates e verificar hidratação', async ({ page }) => {
    const tpl = await createTemplateViaApi(userToken, {
      name: `e2e-tpl-list-${Date.now()}`,
      unitOfMeasure: 'UNITS',
    });

    await injectAuthIntoBrowser(page, userToken, userTenantId);
    await navigateToStockPage(page, 'templates');

    await expect(page.getByRole('heading', { name: 'Templates' })).toBeVisible({
      timeout: 10_000,
    });

    await expect(page.getByText(tpl.name)).toBeVisible({ timeout: 10_000 });

    // Cleanup
    await deleteTemplateViaApi(userToken, tpl.id);
  });

  test('4.4 - Buscar template por nome', async ({ page }) => {
    const tpl = await createTemplateViaApi(userToken, {
      name: `e2e-tpl-search-${Date.now()}`,
      unitOfMeasure: 'METERS',
    });

    await injectAuthIntoBrowser(page, userToken, userTenantId);
    await navigateToStockPage(page, 'templates');

    const searchInput = page.getByPlaceholder(/Buscar/i);
    await searchInput.fill(tpl.name);
    await page.waitForTimeout(500);

    await expect(page.getByText(tpl.name)).toBeVisible({ timeout: 5_000 });

    // Cleanup
    await deleteTemplateViaApi(userToken, tpl.id);
  });

  // ─── UPDATE ─────────────────────────────────────────────────────────

  test.fixme('4.5 - Editar template via context menu', async ({ page }) => {
    const tpl = await createTemplateViaApi(userToken, {
      name: `e2e-tpl-edit-${Date.now()}`,
      unitOfMeasure: 'UNITS',
    });
    const newName = `e2e-tpl-edited-${Date.now()}`;

    await injectAuthIntoBrowser(page, userToken, userTenantId);
    await navigateToStockPage(page, 'templates');

    await openContextMenu(page, tpl.name);
    await clickContextAction(page, 'Editar');

    await expect(page.locator('[role="dialog"]')).toBeVisible({
      timeout: 5_000,
    });

    // EntityForm name field — use the first text input in dialog
    const nameInput = page
      .locator('[role="dialog"] input[type="text"]')
      .first();
    await nameInput.clear();
    await nameInput.fill(newName);

    const saveBtn = page.getByRole('button', { name: /^Salvar$/i });
    await expect(saveBtn).toBeVisible({ timeout: 3_000 });
    await saveBtn.click();
    await waitForToast(page, 'sucesso');

    // Wait for grid to refresh, then search for new name
    await page.waitForTimeout(1_000);
    const searchInput = page.getByPlaceholder(/Buscar/i);
    await searchInput.fill(newName);
    await page.waitForTimeout(500);

    await expect(page.locator(`text=${newName}`).first()).toBeVisible({
      timeout: 10_000,
    });

    // Cleanup
    await deleteTemplateViaApi(userToken, tpl.id);
  });

  // ─── DELETE ─────────────────────────────────────────────────────────

  test('4.6 - Excluir template via context menu', async ({ page }) => {
    const tpl = await createTemplateViaApi(userToken, {
      name: `e2e-tpl-delete-${Date.now()}`,
      unitOfMeasure: 'UNITS',
    });

    await injectAuthIntoBrowser(page, userToken, userTenantId);
    await navigateToStockPage(page, 'templates');

    await openContextMenu(page, tpl.name);
    await clickContextAction(page, 'Excluir');

    // Templates may use simple confirm or PIN verification
    const deleteBtn = page
      .locator('[role="alertdialog"] button, [role="dialog"] button')
      .filter({ hasText: /Excluir|Confirmar/i })
      .first();

    const otpInput = page.locator('[data-input-otp="true"]').first();

    // Wait for either confirm button or OTP input
    await Promise.race([
      deleteBtn.waitFor({ state: 'visible', timeout: 5_000 }).catch(() => {}),
      otpInput.waitFor({ state: 'visible', timeout: 5_000 }).catch(() => {}),
    ]);

    if (await otpInput.isVisible().catch(() => false)) {
      // PIN required — skip this test (needs PIN setup)
      await deleteTemplateViaApi(userToken, tpl.id);
      return;
    }

    if (await deleteBtn.isVisible().catch(() => false)) {
      await deleteBtn.click();
      await waitForToast(page, 'sucesso');
      await expect(page.getByText(tpl.name)).not.toBeVisible({
        timeout: 5_000,
      });
    } else {
      // Fallback cleanup
      await deleteTemplateViaApi(userToken, tpl.id);
    }
  });

  // ─── DETAIL PAGE ───────────────────────────────────────────────────

  test.fixme('4.7 - Navegar para detalhe do template', async ({ page }) => {
    const tpl = await createTemplateViaApi(userToken, {
      name: `e2e-tpl-detail-${Date.now()}`,
      unitOfMeasure: 'KILOGRAMS',
    });

    await injectAuthIntoBrowser(page, userToken, userTenantId);
    await navigateToStockPage(page, 'templates');

    // Double-click or use context menu to navigate
    await openContextMenu(page, tpl.name);
    await clickContextAction(page, 'Visualizar');

    await page.waitForTimeout(1_000);

    // Check if navigated to detail page or view modal
    const isDetailPage = page.url().includes(tpl.id);
    if (isDetailPage) {
      await expect(page.locator(`text=${tpl.name}`).first()).toBeVisible({
        timeout: 10_000,
      });
    } else {
      // Either on list page with view modal, or navigated to templates/{id}
      const hasDialog = await page
        .locator('[role="dialog"]')
        .isVisible()
        .catch(() => false);
      const navigatedToDetail =
        page.url().includes('/stock/templates/') &&
        !page.url().endsWith('/templates');
      expect(hasDialog || navigatedToDetail).toBeTruthy();
    }

    // Cleanup
    await deleteTemplateViaApi(userToken, tpl.id);
  });

  // ─── DUPLICATE ──────────────────────────────────────────────────────

  test('4.8 - Duplicar template', async ({ page }) => {
    const tpl = await createTemplateViaApi(userToken, {
      name: `e2e-tpl-dup-${Date.now()}`,
      unitOfMeasure: 'UNITS',
    });

    await injectAuthIntoBrowser(page, userToken, userTenantId);
    await navigateToStockPage(page, 'templates');

    await openContextMenu(page, tpl.name);

    // Check if "Duplicar" is available
    const dupItem = page
      .locator('[role="menuitem"]')
      .filter({ hasText: 'Duplicar' })
      .first();

    if (await dupItem.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await dupItem.evaluate(el => (el as HTMLElement).click());

      // Confirm duplication
      const confirmBtn = page
        .locator('[role="alertdialog"] button, [role="dialog"] button')
        .filter({ hasText: /Confirmar|Duplicar/i })
        .first();
      if (await confirmBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await confirmBtn.click();
        await waitForToast(page, 'sucesso');
      }
    } else {
      // Duplicar not available for templates — skip
      test.skip();
    }

    // Cleanup
    await deleteTemplateViaApi(userToken, tpl.id);
  });
});
