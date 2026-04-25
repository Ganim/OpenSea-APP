import { expect, test } from '@playwright/test';
import { loginAndNavigate } from '../helpers/auth.helper';

test.describe('POS fiscal configuration (Plan B / T7)', () => {
  test('renders the fiscal config form with all four document types', async ({
    page,
  }) => {
    await loginAndNavigate(
      page,
      'admin@teste.com',
      'Teste@123',
      '/sales/pos/fiscal'
    );

    await expect(
      page.getByRole('heading', { name: /Configuração fiscal/i })
    ).toBeVisible({ timeout: 15_000 });

    for (const docType of ['NFE', 'NFC_E', 'SAT_CFE', 'MFE']) {
      await expect(page.getByTestId(`fiscal-enabled-${docType}`)).toBeVisible();
    }
  });

  test('emission mode shows OFFLINE_CONTINGENCY disabled in Fase 1', async ({
    page,
  }) => {
    await loginAndNavigate(
      page,
      'admin@teste.com',
      'Teste@123',
      '/sales/pos/fiscal'
    );

    const offlineRadio = page.getByTestId('fiscal-mode-OFFLINE_CONTINGENCY');
    await expect(offlineRadio).toBeVisible({ timeout: 10_000 });
    await expect(offlineRadio).toBeDisabled();

    await expect(page.getByText(/Disponível na Fase 2/i).first()).toBeVisible();
  });

  test('NFC-e numbering inputs appear when NFC_E is enabled', async ({
    page,
  }) => {
    await loginAndNavigate(
      page,
      'admin@teste.com',
      'Teste@123',
      '/sales/pos/fiscal'
    );

    const nfceCheckbox = page.getByTestId('fiscal-enabled-NFC_E');
    await expect(nfceCheckbox).toBeVisible({ timeout: 10_000 });

    const isChecked = await nfceCheckbox.isChecked();
    if (!isChecked) {
      await nfceCheckbox.click();
    }

    await expect(page.getByTestId('fiscal-nfce-series')).toBeVisible();
    await expect(page.getByTestId('fiscal-nfce-next-number')).toBeVisible();
  });
});
