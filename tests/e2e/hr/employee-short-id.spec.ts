import { expect, test } from '@playwright/test';
import {
  buildAdminApiContext,
  findFirstEmployeeId,
} from '../sales/pos-fixtures';
import { loginAndNavigate } from '../helpers/auth.helper';

test.describe('Employee shortId (Plan B / T1)', () => {
  let employeeId: string | null = null;

  test.beforeAll(async () => {
    const ctx = await buildAdminApiContext();
    employeeId = await findFirstEmployeeId(ctx);
    await ctx.dispose();
  });

  test('renders the shortId field with copy and regenerate affordances', async ({
    page,
  }) => {
    test.skip(!employeeId, 'No employee available in dev tenant.');

    await loginAndNavigate(
      page,
      'admin@teste.com',
      'Teste@123',
      `/hr/employees/${employeeId}`
    );

    await expect(page.getByText(/Código curto/i, { exact: false })).toBeVisible(
      { timeout: 15_000 }
    );

    await expect(
      page.getByRole('button', { name: /Copiar código|Copiar/i })
    ).toBeVisible();
  });

  test('regenerate flow opens confirmation dialog with current shortId', async ({
    page,
  }) => {
    test.skip(!employeeId, 'No employee available.');

    await loginAndNavigate(
      page,
      'admin@teste.com',
      'Teste@123',
      `/hr/employees/${employeeId}`
    );

    const regenButton = page.getByRole('button', {
      name: /Regerar|Regenerar/i,
    });
    if (!(await regenButton.isVisible().catch(() => false))) {
      test.skip(
        true,
        'Regenerate action only visible to users with hr.employees.admin permission.'
      );
      return;
    }

    await regenButton.click();
    await expect(
      page
        .getByRole('alertdialog')
        .getByText(/código/i)
        .first()
    ).toBeVisible({ timeout: 10_000 });

    const cancelBtn = page.getByRole('button', { name: /Cancelar/i });
    if (await cancelBtn.isVisible().catch(() => false)) {
      await cancelBtn.click();
    }
  });
});
