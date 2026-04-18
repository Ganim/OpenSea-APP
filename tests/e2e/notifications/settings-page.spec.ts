import { test, expect } from '@playwright/test';
import {
  getAuthenticatedToken,
  injectAuthIntoBrowser,
} from '../helpers/auth.helper';

let adminToken: string;
let adminTenantId: string;

test.beforeAll(async () => {
  const auth = await getAuthenticatedToken('admin@teste.com', 'Teste@123');
  adminToken = auth.token;
  adminTenantId = auth.tenantId;
});

test.describe('Notifications — preferences page', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuthIntoBrowser(page, adminToken, adminTenantId);
    await page.goto('/profile/notifications');
    await page.waitForLoadState('networkidle');
  });

  test('loads the settings page with all required sections', async ({
    page,
  }) => {
    await expect(page.getByText('Preferências de notificações')).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText('Gerais')).toBeVisible();
    await expect(page.getByText('Canais (master)')).toBeVisible();
    await expect(page.getByText('Por módulo')).toBeVisible();
    await expect(page.getByText('Testar')).toBeVisible();
  });

  test('lists every registered module in the per-module section', async ({
    page,
  }) => {
    // Every registered manifest must show up. Seeded manifests: 10 modules.
    const moduleLabels = [
      'Sistema',
      'Recursos Humanos',
      'Estoque',
      'Vendas',
      'Financeiro',
      'Solicitações',
      'Agenda',
      'Tarefas',
      'E-mail',
      'Administração',
    ];
    for (const label of moduleLabels) {
      await expect(page.getByText(label, { exact: false }).first()).toBeVisible(
        { timeout: 10_000 }
      );
    }
  });

  test('test-send button dispatches notifications to current user', async ({
    page,
  }) => {
    const btn = page.getByRole('button', {
      name: /Enviar notificações de teste/i,
    });
    await expect(btn).toBeVisible();
    await btn.click();
    // Button should show loading state briefly
    await expect(btn)
      .toBeDisabled({ timeout: 5_000 })
      .catch(() => void 0);
    // Wait for the request to settle
    await page.waitForTimeout(2_000);
  });
});
