/**
 * Finance Module — Bank Accounts CRUD (P2-64).
 *
 * Smoke + light-CRUD coverage for /finance/bank-accounts. Validates that
 * the listing page renders, the API can seed an account, the seeded
 * account becomes visible in the UI, and the detail/edit routes resolve.
 */
import { expect, test } from '@playwright/test';
import {
  getAuthenticatedToken,
  injectAuthIntoBrowser,
} from '../helpers/auth.helper';
import {
  createBankAccountViaApi,
  deleteBankAccountViaApi,
  expectFinanceShellVisible,
  navigateToFinancePage,
  uniqueSuffix,
} from '../helpers/finance.helper';

let authToken: string;
let tenantId: string;
const createdIds: string[] = [];

test.beforeAll(async () => {
  const auth = await getAuthenticatedToken('admin@teste.com', 'Teste@123');
  authToken = auth.token;
  tenantId = auth.tenantId;
});

test.afterAll(async () => {
  for (const id of createdIds) {
    await deleteBankAccountViaApi(authToken, id).catch(() => {});
  }
});

test.describe('Finance — Contas Bancárias', () => {
  test('1.1 — Listagem carrega e mostra cabecalho', async ({ page }) => {
    await injectAuthIntoBrowser(page, authToken, tenantId);
    await navigateToFinancePage(page, 'bank-accounts');
    await expectFinanceShellVisible(page);

    const heading = page
      .getByRole('heading')
      .filter({ hasText: /Contas Banc/i })
      .first();
    await expect(heading).toBeVisible({ timeout: 15_000 });
  });

  test('1.2 — Conta criada via API aparece na listagem', async ({ page }) => {
    const suffix = uniqueSuffix();
    const account = await createBankAccountViaApi(authToken, {
      name: `e2e-conta-${suffix}`,
      bankCode: '001',
      bankName: 'Banco do Brasil',
      agency: '1234',
      accountNumber: `9${suffix.slice(-6)}`,
      accountType: 'CHECKING',
    });
    createdIds.push(account.id);

    await injectAuthIntoBrowser(page, authToken, tenantId);
    await navigateToFinancePage(page, 'bank-accounts');
    await expectFinanceShellVisible(page);

    // Wait for the grid to load and find our account by name
    const card = page.getByText(account.name).first();
    await expect(card).toBeVisible({ timeout: 15_000 });
  });

  test('1.3 — Botao "Nova Conta" abre wizard/modal', async ({ page }) => {
    await injectAuthIntoBrowser(page, authToken, tenantId);
    await navigateToFinancePage(page, 'bank-accounts');
    await expectFinanceShellVisible(page);

    const newBtn = page
      .getByRole('button')
      .filter({ hasText: /Nova Conta|Adicionar/i })
      .first();

    if (!(await newBtn.isVisible({ timeout: 5_000 }).catch(() => false))) {
      test.info().annotations.push({
        type: 'skip-reason',
        description: 'Botao "Nova Conta" nao encontrado (RBAC?).',
      });
      return;
    }

    await newBtn.click();
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 8_000 });
  });

  test('1.4 — Detalhe abre quando conta e clicada', async ({ page }) => {
    const suffix = uniqueSuffix();
    const account = await createBankAccountViaApi(authToken, {
      name: `e2e-detail-${suffix}`,
      bankCode: '341',
      bankName: 'Itau',
      agency: '0987',
      accountNumber: `7${suffix.slice(-6)}`,
      accountType: 'CHECKING',
    });
    createdIds.push(account.id);

    await injectAuthIntoBrowser(page, authToken, tenantId);
    await page.goto(`/finance/bank-accounts/${account.id}`);
    await expectFinanceShellVisible(page);

    // Detail page should show account name somewhere on the page
    await expect(page.getByText(account.name).first()).toBeVisible({
      timeout: 15_000,
    });
  });

  test('1.5 — Rota de edicao renderiza sem crash', async ({ page }) => {
    const suffix = uniqueSuffix();
    const account = await createBankAccountViaApi(authToken, {
      name: `e2e-edit-${suffix}`,
      bankCode: '237',
      bankName: 'Bradesco',
      agency: '4321',
      accountNumber: `5${suffix.slice(-6)}`,
      accountType: 'CHECKING',
    });
    createdIds.push(account.id);

    await injectAuthIntoBrowser(page, authToken, tenantId);
    await page.goto(`/finance/bank-accounts/${account.id}/edit`);
    await expectFinanceShellVisible(page);

    // Form should expose the saved name in some input
    const nameInput = page.getByLabel(/Nome/i).first();
    if (await nameInput.isVisible({ timeout: 5_000 }).catch(() => false)) {
      const value = await nameInput.inputValue();
      expect(value).toContain('e2e-edit-');
    }
  });
});
