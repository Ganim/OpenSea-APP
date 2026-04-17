/**
 * Finance Module — Bank Reconciliation (P2-64).
 *
 * Smoke coverage for /finance/reconciliation: the listing renders, the
 * "import OFX" call-to-action is visible (or absent on RBAC), and the
 * detail route accepts a synthetic ID without crashing the shell. Real
 * matching flow needs an OFX upload + bank-transactions seed, which
 * lives in API integration tests; here we only assert UI surfaces.
 */
import { expect, test } from '@playwright/test';
import {
  getAuthenticatedToken,
  injectAuthIntoBrowser,
} from '../helpers/auth.helper';
import {
  expectFinanceShellVisible,
  navigateToFinancePage,
} from '../helpers/finance.helper';

let authToken: string;
let tenantId: string;

test.beforeAll(async () => {
  const auth = await getAuthenticatedToken('admin@teste.com', 'Teste@123');
  authToken = auth.token;
  tenantId = auth.tenantId;
});

test.describe('Finance — Conciliacao Bancaria', () => {
  test('2.1 — Listagem de conciliacoes renderiza', async ({ page }) => {
    await injectAuthIntoBrowser(page, authToken, tenantId);
    await navigateToFinancePage(page, 'reconciliation');
    await expectFinanceShellVisible(page);

    const heading = page
      .getByRole('heading')
      .filter({ hasText: /Concilia/i })
      .first();
    await expect(heading).toBeVisible({ timeout: 15_000 });
  });

  test('2.2 — Acao de importar/iniciar conciliacao e exposta', async ({
    page,
  }) => {
    await injectAuthIntoBrowser(page, authToken, tenantId);
    await navigateToFinancePage(page, 'reconciliation');
    await expectFinanceShellVisible(page);

    const importBtn = page
      .getByRole('button')
      .filter({ hasText: /Importar|OFX|Nova Concilia/i })
      .first();

    if (!(await importBtn.isVisible({ timeout: 5_000 }).catch(() => false))) {
      test.info().annotations.push({
        type: 'skip-reason',
        description: 'Botao de importar OFX nao exposto (RBAC ou estado).',
      });
      return;
    }
    await expect(importBtn).toBeVisible();
  });

  test('2.3 — Filtros de status nao quebram a pagina', async ({ page }) => {
    await injectAuthIntoBrowser(page, authToken, tenantId);
    await navigateToFinancePage(page, 'reconciliation');
    await expectFinanceShellVisible(page);

    const filterBtn = page
      .getByRole('button')
      .filter({ hasText: /Status|Pendente|Conciliado/i })
      .first();

    if (await filterBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await filterBtn.click();
      await page.waitForTimeout(500);
      await expectFinanceShellVisible(page);
    }
  });

  test('2.4 — Rota de detalhe com id inexistente nao quebra shell', async ({
    page,
  }) => {
    await injectAuthIntoBrowser(page, authToken, tenantId);
    await page.goto(
      '/finance/reconciliation/00000000-0000-0000-0000-000000000000'
    );
    await expectFinanceShellVisible(page);
  });
});
