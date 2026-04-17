/**
 * Finance Module — Payment Orders + Approval (P2-64).
 *
 * Smoke coverage for /finance/payment-orders: page renders, list responds,
 * approval action opens PIN modal. The full approval flow needs a real
 * second user with the approver permission and a PIN — those tests are
 * marked test.fixme() and require manual seed beyond the default tenant.
 */
import { expect, test } from '@playwright/test';
import {
  getAuthenticatedToken,
  injectAuthIntoBrowser,
} from '../helpers/auth.helper';
import {
  createBankAccountViaApi,
  createFinanceCategoryViaApi,
  createFinanceEntryViaApi,
  createPaymentOrderViaApi,
  deleteBankAccountViaApi,
  deleteFinanceCategoryViaApi,
  deleteFinanceEntryViaApi,
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

async function seedPayableEntry() {
  const suffix = uniqueSuffix();
  const bank = await createBankAccountViaApi(authToken, {
    name: `e2e-po-bank-${suffix}`,
    bankCode: '001',
    agency: '1111',
    accountNumber: `1${suffix.slice(-6)}`,
    accountType: 'CHECKING',
  });
  cleanups.push(() => deleteBankAccountViaApi(authToken, bank.id));

  const category = await createFinanceCategoryViaApi(authToken, {
    name: `e2e-po-cat-${suffix}`,
    slug: `e2e-po-cat-${suffix}`,
    type: 'PAYABLE',
  });
  cleanups.push(() => deleteFinanceCategoryViaApi(authToken, category.id));

  const today = new Date().toISOString().slice(0, 10);
  const entry = await createFinanceEntryViaApi(authToken, {
    type: 'PAYABLE',
    code: `PO-E2E-${suffix}`,
    description: `Despesa para ordem ${suffix}`,
    categoryId: category.id,
    expectedAmount: 250,
    issueDate: today,
    dueDate: today,
    bankAccountId: bank.id,
  });
  cleanups.push(() => deleteFinanceEntryViaApi(authToken, entry.id));

  return { bankId: bank.id, entryId: entry.id, suffix };
}

test.describe('Finance — Ordens de Pagamento', () => {
  test('3.1 — Pagina de payment-orders renderiza', async ({ page }) => {
    await injectAuthIntoBrowser(page, authToken, tenantId);
    await navigateToFinancePage(page, 'payment-orders');
    await expectFinanceShellVisible(page);

    const heading = page
      .getByRole('heading')
      .filter({ hasText: /Ordens de Pagamento|Pagamentos/i })
      .first();
    await expect(heading).toBeVisible({ timeout: 15_000 });
  });

  test('3.2 — PO criada via API aparece na lista', async ({ page }) => {
    const { bankId, entryId, suffix } = await seedPayableEntry();
    const po = await createPaymentOrderViaApi(authToken, {
      entryId,
      bankAccountId: bankId,
      method: 'PIX',
      amount: 250,
      recipientData: {
        pixKey: `e2e-${suffix}@teste.com`,
        pixKeyType: 'EMAIL',
      },
    });

    await injectAuthIntoBrowser(page, authToken, tenantId);
    await navigateToFinancePage(page, 'payment-orders');
    await expectFinanceShellVisible(page);

    // PO IDs are not user-visible, but the underlying entry description is.
    const entryRef = page.getByText(`Despesa para ordem ${suffix}`).first();
    await expect(entryRef).toBeVisible({ timeout: 15_000 });
    expect(po.id).toBeTruthy();
  });

  test.fixme('3.3 — Aprovacao da PO abre modal de PIN', async ({ page }) => {
    // Requires a second user with approver permission; default seed has
    // only super-admin which auto-approves. Implement when seed exposes
    // a dedicated approver fixture.
    await page.goto('/finance/payment-orders');
  });
});
