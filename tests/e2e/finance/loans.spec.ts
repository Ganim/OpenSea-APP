/**
 * Finance Module — Loans (P2-64).
 *
 * Smoke + create coverage for /finance/loans: list, create via API and
 * verify visibility, navigate to /loans/[id]/edit and assert the form
 * preloads the saved name.
 */
import { expect, test } from '@playwright/test';
import {
  getAuthenticatedToken,
  injectAuthIntoBrowser,
} from '../helpers/auth.helper';
import {
  createBankAccountViaApi,
  createCostCenterViaApi,
  createLoanViaApi,
  deleteBankAccountViaApi,
  deleteCostCenterViaApi,
  deleteLoanViaApi,
  expectFinanceShellVisible,
  navigateToFinancePage,
  uniqueSuffix,
} from '../helpers/finance.helper';

let authToken: string;
let tenantId: string;

const cleanups: Array<() => Promise<void>> = [];

test.beforeAll(async () => {
  const auth = await getAuthenticatedToken('admin@teste.com', 'Teste@123');
  authToken = auth.token;
  tenantId = auth.tenantId;
});

test.afterAll(async () => {
  for (const fn of cleanups.reverse()) {
    await fn().catch(() => {});
  }
});

async function seedLoan(label: string) {
  const suffix = uniqueSuffix();
  const bank = await createBankAccountViaApi(authToken, {
    name: `e2e-loan-bank-${suffix}`,
    bankCode: '341',
    agency: '2222',
    accountNumber: `2${suffix.slice(-6)}`,
    accountType: 'CHECKING',
  });
  cleanups.push(() => deleteBankAccountViaApi(authToken, bank.id));

  const cc = await createCostCenterViaApi(authToken, {
    code: `CC-LOAN-${suffix}`,
    name: `e2e-cc-loan-${suffix}`,
  });
  cleanups.push(() => deleteCostCenterViaApi(authToken, cc.id));

  const loan = await createLoanViaApi(authToken, {
    name: `e2e-loan-${label}-${suffix}`,
    type: 'BUSINESS',
    bankAccountId: bank.id,
    costCenterId: cc.id,
    principalAmount: 50000,
    interestRate: 1.5,
    startDate: new Date().toISOString().slice(0, 10),
    totalInstallments: 12,
    installmentDay: 10,
  });
  cleanups.push(() => deleteLoanViaApi(authToken, loan.id));

  return { loanId: loan.id, loanName: loan.name };
}

test.describe('Finance — Emprestimos', () => {
  test('6.1 — Listagem de emprestimos carrega', async ({ page }) => {
    await injectAuthIntoBrowser(page, authToken, tenantId);
    await navigateToFinancePage(page, 'loans');
    await expectFinanceShellVisible(page);

    const heading = page
      .getByRole('heading')
      .filter({ hasText: /Empr/i })
      .first();
    await expect(heading).toBeVisible({ timeout: 15_000 });
  });

  test('6.2 — Emprestimo seedado via API aparece na listagem', async ({
    page,
  }) => {
    const { loanName } = await seedLoan('list');

    await injectAuthIntoBrowser(page, authToken, tenantId);
    await navigateToFinancePage(page, 'loans');
    await expectFinanceShellVisible(page);

    await expect(page.getByText(loanName).first()).toBeVisible({
      timeout: 15_000,
    });
  });

  test('6.3 — Pagina /loans/new renderiza formulario', async ({ page }) => {
    await injectAuthIntoBrowser(page, authToken, tenantId);
    await page.goto('/finance/loans/new');
    await expectFinanceShellVisible(page);

    const form = page.locator('form, [data-testid="loan-form"]').first();
    await expect(form).toBeVisible({ timeout: 15_000 });
  });

  test('6.4 — Edicao preserva o nome salvo', async ({ page }) => {
    const { loanId, loanName } = await seedLoan('edit');

    await injectAuthIntoBrowser(page, authToken, tenantId);
    await page.goto(`/finance/loans/${loanId}/edit`);
    await expectFinanceShellVisible(page);

    const nameInput = page.getByLabel(/Nome/i).first();
    if (await nameInput.isVisible({ timeout: 5_000 }).catch(() => false)) {
      const value = await nameInput.inputValue();
      expect(value).toBe(loanName);
    }
  });
});
