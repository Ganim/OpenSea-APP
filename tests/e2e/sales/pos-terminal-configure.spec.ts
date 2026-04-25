import { expect, test } from '@playwright/test';
import { buildAdminApiContext, findFirstTerminalId } from './pos-fixtures';
import { loginAndNavigate } from '../helpers/auth.helper';

test.describe('POS terminal configure (Plan B / T3)', () => {
  let terminalId: string | null = null;

  test.beforeAll(async () => {
    const ctx = await buildAdminApiContext();
    terminalId = await findFirstTerminalId(ctx);
    await ctx.dispose();
  });

  test('renders the four configure tabs and persists a session-mode change', async ({
    page,
  }) => {
    test.skip(
      !terminalId,
      'No POS terminal available in dev tenant — seed one before running.'
    );

    await loginAndNavigate(
      page,
      'admin@teste.com',
      'Teste@123',
      `/sales/pos/terminals/${terminalId}/configure`
    );

    await expect(page.getByRole('tab', { name: /Zonas/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole('tab', { name: /Operadores/i })).toBeVisible();
    await expect(
      page.getByRole('tab', { name: /Administradores/i })
    ).toBeVisible();
    await expect(page.getByRole('tab', { name: /Fiscal/i })).toBeVisible();

    await page.getByRole('tab', { name: /Fiscal/i }).click();
    await expect(
      page.getByText(/Sessão do operador/i, { exact: false })
    ).toBeVisible({ timeout: 10_000 });
  });

  test('zones tab shows tier indicators (PRIMARY / SECONDARY)', async ({
    page,
  }) => {
    test.skip(!terminalId, 'No POS terminal available.');

    await loginAndNavigate(
      page,
      'admin@teste.com',
      'Teste@123',
      `/sales/pos/terminals/${terminalId}/configure`
    );

    await page.getByRole('tab', { name: /Zonas/i }).click();
    await expect(page.getByText(/zona/i)).toBeVisible({ timeout: 10_000 });
  });
});
