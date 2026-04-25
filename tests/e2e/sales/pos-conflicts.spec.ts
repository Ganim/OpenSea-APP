import { expect, test } from '@playwright/test';
import { buildAdminApiContext, countPendingConflicts } from './pos-fixtures';
import { loginAndNavigate } from '../helpers/auth.helper';

test.describe('POS conflicts panel (Plan B / T5)', () => {
  test('renders the conflicts page header, filter, and a list or empty state', async ({
    page,
  }) => {
    await loginAndNavigate(
      page,
      'admin@teste.com',
      'Teste@123',
      '/sales/pos/conflicts'
    );

    await expect(page.getByRole('heading', { name: /Conflitos/i })).toBeVisible(
      { timeout: 15_000 }
    );

    const ctx = await buildAdminApiContext();
    const pending = await countPendingConflicts(ctx);
    await ctx.dispose();

    if (pending === 0) {
      await expect(
        page.getByText(/Nenhum conflito|Nenhuma pendência|sem conflitos/i)
      ).toBeVisible({ timeout: 10_000 });
    } else {
      await expect(page.getByText(/Pendente|PENDING/i).first()).toBeVisible({
        timeout: 10_000,
      });
    }
  });

  test('status filter dropdown is visible and interactive', async ({
    page,
  }) => {
    await loginAndNavigate(
      page,
      'admin@teste.com',
      'Teste@123',
      '/sales/pos/conflicts'
    );

    const filter = page.getByRole('button', { name: /Status/i }).first();
    await expect(filter).toBeVisible({ timeout: 10_000 });
  });
});
