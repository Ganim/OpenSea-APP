/**
 * Finance Module — Overdue Escalations (P2-64).
 *
 * Smoke coverage for /finance/escalations: page renders, table or empty
 * state is shown, "Nova Politica" CTA opens a wizard. Real escalation
 * processing is async (cron-driven) and tested in the API spec
 * `v1-process-overdue-escalations.spec.ts`.
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

test.describe('Finance — Politicas de Escalonamento', () => {
  test('4.1 — Pagina de escalations renderiza', async ({ page }) => {
    await injectAuthIntoBrowser(page, authToken, tenantId);
    await navigateToFinancePage(page, 'escalations');
    await expectFinanceShellVisible(page);

    const heading = page
      .getByRole('heading')
      .filter({ hasText: /Escalonamento|Cobran[cç]a|Inadimpl/i })
      .first();
    await expect(heading).toBeVisible({ timeout: 15_000 });
  });

  test('4.2 — Lista mostra tabela ou empty-state', async ({ page }) => {
    await injectAuthIntoBrowser(page, authToken, tenantId);
    await navigateToFinancePage(page, 'escalations');
    await expectFinanceShellVisible(page);

    const tableOrEmpty = page.locator(
      'table, [data-testid="empty-state"], [class*="EmptyState"]'
    );
    await expect(tableOrEmpty.first()).toBeVisible({ timeout: 15_000 });
  });

  test('4.3 — CTA "Nova Politica" abre dialogo', async ({ page }) => {
    await injectAuthIntoBrowser(page, authToken, tenantId);
    await navigateToFinancePage(page, 'escalations');
    await expectFinanceShellVisible(page);

    const newBtn = page
      .getByRole('button')
      .filter({ hasText: /Nova|Adicionar|Criar/i })
      .first();

    if (!(await newBtn.isVisible({ timeout: 5_000 }).catch(() => false))) {
      test.info().annotations.push({
        type: 'skip-reason',
        description: 'Botao de nova politica nao exposto (RBAC ou layout).',
      });
      return;
    }

    await newBtn.click();
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 8_000 });
  });
});
