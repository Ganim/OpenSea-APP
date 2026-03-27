import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
  });

  // ─── SMART FIELD ───────────────────────────────────────────────────

  test('should show smart field with correct placeholder', async ({ page }) => {
    const identifierInput = page.getByPlaceholder('Email, CPF ou Matrícula');
    await expect(identifierInput).toBeVisible({ timeout: 10_000 });
  });

  test('should show page title and subtitle', async ({ page }) => {
    await expect(page.getByText('OpenSea')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Entre na sua conta')).toBeVisible({
      timeout: 10_000,
    });
  });

  // ─── EMAIL + PASSWORD LOGIN ────────────────────────────────────────

  test('should login with email + password', async ({ page }) => {
    // Step 1: Enter identifier
    const identifierInput = page.getByPlaceholder('Email, CPF ou Matrícula');
    await expect(identifierInput).toBeVisible({ timeout: 10_000 });
    await identifierInput.fill('admin@teste.com');

    // Click "Continuar" to advance to password step
    const continueBtn = page.getByRole('button', { name: 'Continuar' });
    await expect(continueBtn).toBeVisible({ timeout: 5_000 });
    await continueBtn.click();

    // Step 2: Enter password
    const passwordInput = page.getByPlaceholder('••••••••');
    await expect(passwordInput).toBeVisible({ timeout: 5_000 });
    await passwordInput.fill('Teste@123');

    // Click "Entrar" to submit
    const loginBtn = page.getByRole('button', { name: 'Entrar' });
    await expect(loginBtn).toBeVisible({ timeout: 5_000 });
    await loginBtn.click();

    // Should redirect away from /login (to select-tenant, dashboard, or central)
    await page.waitForURL(url => !url.pathname.includes('/login'), {
      timeout: 15_000,
    });

    expect(page.url()).not.toContain('/login');
  });

  test('should show validation error for empty identifier', async ({
    page,
  }) => {
    // Click "Continuar" without filling identifier
    const continueBtn = page.getByRole('button', { name: 'Continuar' });
    await expect(continueBtn).toBeVisible({ timeout: 10_000 });
    await continueBtn.click();

    // Should show error message
    await expect(
      page.getByText('Digite um identificador válido')
    ).toBeVisible({ timeout: 5_000 });
  });

  test('should navigate back from password step to identifier step', async ({
    page,
  }) => {
    // Step 1: Enter identifier and advance
    const identifierInput = page.getByPlaceholder('Email, CPF ou Matrícula');
    await expect(identifierInput).toBeVisible({ timeout: 10_000 });
    await identifierInput.fill('admin@teste.com');

    const continueBtn = page.getByRole('button', { name: 'Continuar' });
    await continueBtn.click();

    // Step 2: Verify password step loaded
    const passwordInput = page.getByPlaceholder('••••••••');
    await expect(passwordInput).toBeVisible({ timeout: 5_000 });

    // Click "Voltar"
    const backBtn = page.getByRole('button', { name: 'Voltar' });
    await expect(backBtn).toBeVisible({ timeout: 5_000 });
    await backBtn.click();

    // Should be back on identifier step — "Continuar" button visible again
    await expect(
      page.getByRole('button', { name: 'Continuar' })
    ).toBeVisible({ timeout: 5_000 });
  });

  // ─── MAGIC LINK ────────────────────────────────────────────────────

  test('should show magic link option', async ({ page }) => {
    const magicLinkBtn = page.getByText('Entrar com link mágico');
    await expect(magicLinkBtn).toBeVisible({ timeout: 10_000 });
  });

  test('should switch to magic link mode and request link', async ({
    page,
  }) => {
    // Click "Entrar com link mágico"
    const magicLinkBtn = page.getByText('Entrar com link mágico');
    await expect(magicLinkBtn).toBeVisible({ timeout: 10_000 });
    await magicLinkBtn.click();

    // Should show "Enviar link de acesso" button
    const sendBtn = page.getByRole('button', { name: 'Enviar link de acesso' });
    await expect(sendBtn).toBeVisible({ timeout: 5_000 });

    // Fill identifier
    const identifierInput = page.getByPlaceholder('Email, CPF ou Matrícula');
    await identifierInput.fill('admin@teste.com');

    // Submit magic link request
    await sendBtn.click();

    // Should show success message "Link enviado!"
    await expect(page.getByText('Link enviado!')).toBeVisible({
      timeout: 10_000,
    });

    // Should show "Entrar com senha" link to go back
    await expect(page.getByText('Entrar com senha')).toBeVisible({
      timeout: 5_000,
    });
  });

  // ─── LINKS ─────────────────────────────────────────────────────────

  test('should have forgot password link', async ({ page }) => {
    // Navigate to password step first
    const identifierInput = page.getByPlaceholder('Email, CPF ou Matrícula');
    await expect(identifierInput).toBeVisible({ timeout: 10_000 });
    await identifierInput.fill('admin@teste.com');

    const continueBtn = page.getByRole('button', { name: 'Continuar' });
    await continueBtn.click();

    // Wait for password step
    await expect(page.getByPlaceholder('••••••••')).toBeVisible({
      timeout: 5_000,
    });

    // Should show "Esqueceu a senha?" link
    const forgotLink = page.getByText('Esqueceu a senha?');
    await expect(forgotLink).toBeVisible({ timeout: 5_000 });
  });
});
