/**
 * Finance Module — Recurring Entries (P2-64).
 *
 * Smoke + create-flow coverage for /finance/recurring: list renders,
 * recurring config seeded via API appears, /recurring/new exposes a
 * step wizard. Cancel flow goes through a PIN modal and is left to the
 * API spec `v1-cancel-recurring.e2e.spec.ts`.
 */
import { expect, test } from '@playwright/test';
import {
  getAuthenticatedToken,
  injectAuthIntoBrowser,
} from '../helpers/auth.helper';
import {
  cancelRecurringConfigViaApi,
  createFinanceCategoryViaApi,
  createRecurringConfigViaApi,
  deleteFinanceCategoryViaApi,
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

async function seedRecurringConfig(label: string) {
  const suffix = uniqueSuffix();
  const category = await createFinanceCategoryViaApi(authToken, {
    name: `e2e-rec-cat-${suffix}`,
    slug: `e2e-rec-cat-${suffix}`,
    type: 'PAYABLE',
  });
  cleanups.push(() => deleteFinanceCategoryViaApi(authToken, category.id));

  const recurring = await createRecurringConfigViaApi(authToken, {
    type: 'PAYABLE',
    description: `e2e-rec-${label}-${suffix}`,
    categoryId: category.id,
    expectedAmount: 199.9,
    frequencyUnit: 'MONTHLY',
    startDate: new Date().toISOString().slice(0, 10),
    totalOccurrences: 6,
  });
  cleanups.push(() =>
    cancelRecurringConfigViaApi(authToken, recurring.id).catch(() => {})
  );

  return { recurringId: recurring.id, description: recurring.description };
}

test.describe('Finance — Lancamentos Recorrentes', () => {
  test('5.1 — Pagina de recurring renderiza', async ({ page }) => {
    await injectAuthIntoBrowser(page, authToken, tenantId);
    await navigateToFinancePage(page, 'recurring');
    await expectFinanceShellVisible(page);

    const heading = page
      .getByRole('heading')
      .filter({ hasText: /Recorr|Recurring/i })
      .first();
    await expect(heading).toBeVisible({ timeout: 15_000 });
  });

  test('5.2 — Recurring criado via API aparece na lista', async ({ page }) => {
    const { description } = await seedRecurringConfig('list');

    await injectAuthIntoBrowser(page, authToken, tenantId);
    await navigateToFinancePage(page, 'recurring');
    await expectFinanceShellVisible(page);

    await expect(page.getByText(description).first()).toBeVisible({
      timeout: 15_000,
    });
  });

  test('5.3 — /recurring/new renderiza wizard', async ({ page }) => {
    await injectAuthIntoBrowser(page, authToken, tenantId);
    await page.goto('/finance/recurring/new');
    await expectFinanceShellVisible(page);

    const wizard = page.locator(
      '[role="dialog"], form, [data-testid="step-wizard"]'
    );
    await expect(wizard.first()).toBeVisible({ timeout: 15_000 });
  });

  test('5.4 — Edicao expoe descricao salva', async ({ page }) => {
    const { recurringId, description } = await seedRecurringConfig('edit');

    await injectAuthIntoBrowser(page, authToken, tenantId);
    await page.goto(`/finance/recurring/${recurringId}/edit`);
    await expectFinanceShellVisible(page);

    await expect(page.getByText(description).first()).toBeVisible({
      timeout: 15_000,
    });
  });
});
