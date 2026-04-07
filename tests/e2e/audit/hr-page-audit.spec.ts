/**
 * HR Module Page Audit
 * Navega por TODAS as páginas do módulo HR e verifica:
 * 1. Página carrega sem erros no console
 * 2. Sem crashes de React (Objects are not valid as React child, etc.)
 * 3. Sem erros de query (Query data cannot be undefined, etc.)
 * 4. Conteúdo renderiza (não fica em loading infinito)
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const LOGIN_EMAIL = 'admin@teste.com';
const LOGIN_PASSWORD = 'Teste@123';

// All HR pages to audit
const HR_PAGES = [
  // Dashboard & Overview
  { path: '/hr', label: 'HR Dashboard' },
  { path: '/hr/overview', label: 'Visão Geral' },
  { path: '/hr/settings', label: 'Configurações' },

  // Core entities
  { path: '/hr/employees', label: 'Funcionários' },
  { path: '/hr/departments', label: 'Departamentos' },
  { path: '/hr/positions', label: 'Cargos' },

  // Time & Attendance
  { path: '/hr/work-schedules', label: 'Escalas de Trabalho' },
  { path: '/hr/shifts', label: 'Turnos' },
  { path: '/hr/time-control', label: 'Controle de Ponto' },
  { path: '/hr/time-bank', label: 'Banco de Horas' },
  { path: '/hr/overtime', label: 'Horas Extras' },
  { path: '/hr/absences', label: 'Ausências' },
  { path: '/hr/vacations', label: 'Férias' },
  { path: '/hr/geofence-zones', label: 'Zonas de Geofence' },

  // Payroll & Compensation
  { path: '/hr/payroll', label: 'Folha de Pagamento' },
  { path: '/hr/bonuses', label: 'Bonificações' },
  { path: '/hr/deductions', label: 'Deduções' },
  { path: '/hr/benefits', label: 'Benefícios' },

  // Lifecycle
  { path: '/hr/admissions', label: 'Admissões' },
  { path: '/hr/onboarding', label: 'Onboarding' },
  { path: '/hr/offboarding', label: 'Offboarding' },
  { path: '/hr/terminations', label: 'Desligamentos' },

  // People Management
  { path: '/hr/dependants', label: 'Dependentes' },
  { path: '/hr/warnings', label: 'Advertências' },
  { path: '/hr/requests', label: 'Solicitações' },
  { path: '/hr/announcements', label: 'Comunicados' },
  { path: '/hr/kudos', label: 'Reconhecimentos' },
  { path: '/hr/teams', label: 'Equipes' },
  { path: '/hr/delegations', label: 'Delegações' },

  // Training & Performance
  { path: '/hr/trainings', label: 'Treinamentos' },
  { path: '/hr/reviews', label: 'Avaliações' },

  // Safety & Health
  { path: '/hr/safety-programs', label: 'Programas de Segurança' },
  { path: '/hr/workplace-risks', label: 'Riscos Ocupacionais' },
  { path: '/hr/medical-exams', label: 'Exames Médicos' },
  { path: '/hr/ppe', label: 'EPI' },
  { path: '/hr/cipa', label: 'CIPA' },

  // Compliance
  { path: '/hr/esocial', label: 'eSocial' },

  // Self-service
  { path: '/hr/my-profile', label: 'Meu Perfil' },
];

interface PageAuditResult {
  path: string;
  label: string;
  status: 'OK' | 'ERROR' | 'WARNING' | 'TIMEOUT';
  consoleErrors: string[];
  consoleWarnings: string[];
  loadTimeMs: number;
  hasContent: boolean;
  hasLoadingStuck: boolean;
  screenshot?: string;
}

test.describe('HR Module Page Audit', () => {
  const results: PageAuditResult[] = [];

  test.beforeAll(async ({ browser }) => {
    // Login once and save state
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');

    // Step 1: Fill identifier (email/cpf) and click Continue
    const identifierInput = page.locator('input').first();
    await identifierInput.waitFor({ timeout: 10000 });
    await identifierInput.fill(LOGIN_EMAIL);

    // Click "Continuar" button
    const continueBtn = page
      .locator('button:has-text("Continuar"), button[type="submit"]')
      .first();
    await continueBtn.click();

    // Step 2: Wait for password field and fill it
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.waitFor({ timeout: 10000 });
    await passwordInput.fill(LOGIN_PASSWORD);

    // Click login button
    const loginBtn = page
      .locator('button:has-text("Entrar"), button[type="submit"]')
      .first();
    await loginBtn.click();

    // Wait for redirect after login
    // Wait for redirect — could be /, /select-tenant, /dashboard, /hr, /home
    await page.waitForURL(url => !url.toString().includes('/login'), {
      timeout: 15000,
    });

    // If we need to select tenant
    if (page.url().includes('select-tenant')) {
      await page.waitForTimeout(1000);
      const tenantCard = page
        .locator(
          '[data-testid="tenant-card"], .cursor-pointer, [role="button"]'
        )
        .first();
      if (await tenantCard.isVisible({ timeout: 5000 })) {
        await tenantCard.click();
        await page.waitForURL(/\/(dashboard|hr|home)/, { timeout: 10000 });
      }
    }

    await context.storageState({ path: 'tests/e2e/audit/.auth-state.json' });
    await context.close();
  });

  for (const pageInfo of HR_PAGES) {
    test(`Audit: ${pageInfo.label} (${pageInfo.path})`, async ({ browser }) => {
      const context = await browser.newContext({
        storageState: 'tests/e2e/audit/.auth-state.json',
      });
      const page = await context.newPage();

      const consoleErrors: string[] = [];
      const consoleWarnings: string[] = [];

      // Capture console errors
      page.on('console', msg => {
        const text = msg.text();
        if (msg.type() === 'error') {
          // Filter out noise
          if (
            !text.includes('favicon') &&
            !text.includes(
              'Failed to load resource: the server responded with a status of 404'
            ) &&
            !text.includes('Download the React DevTools')
          ) {
            consoleErrors.push(text.substring(0, 300));
          }
        }
        if (
          msg.type() === 'warning' &&
          text.includes('Query data cannot be undefined')
        ) {
          consoleErrors.push(`[QUERY ERROR] ${text.substring(0, 300)}`);
        }
      });

      // Capture page errors (uncaught exceptions)
      page.on('pageerror', error => {
        consoleErrors.push(`[PAGE CRASH] ${error.message.substring(0, 300)}`);
      });

      const startTime = Date.now();
      let hasContent = false;
      let hasLoadingStuck = false;
      let status: PageAuditResult['status'] = 'OK';

      try {
        await page.goto(`${BASE_URL}${pageInfo.path}`, {
          waitUntil: 'domcontentloaded',
          timeout: 20000,
        });

        // Wait for initial render
        await page.waitForTimeout(3000);

        // Check if page is stuck on loading
        const loadingIndicators = await page
          .locator('.animate-spin, .animate-pulse, [data-loading="true"]')
          .count();
        const mainContent = await page
          .locator('main, [role="main"], .page-body, [class*="PageBody"]')
          .first();

        // Check for React error boundaries
        const errorBoundary = await page
          .locator('text=/Something went wrong|Error|Erro ao carregar/i')
          .count();
        if (errorBoundary > 0) {
          consoleErrors.push(
            '[UI] Error boundary or error message visible on page'
          );
        }

        // Check for "Objects are not valid as React child" in page content
        const bodyText = (await page.textContent('body')) || '';
        if (bodyText.includes('Objects are not valid as a React child')) {
          consoleErrors.push(
            '[REACT] Objects are not valid as a React child - rendering error'
          );
        }

        // Check for content (not just a loading spinner)
        const textContent = (await page.textContent('body')) || '';
        hasContent = textContent.length > 200;

        // Check if still showing loading after 5 seconds
        await page.waitForTimeout(2000);
        const stillLoading = await page.locator('.animate-spin').count();
        if (stillLoading > 2) {
          hasLoadingStuck = true;
          consoleWarnings.push('[UX] Page may be stuck in loading state');
        }

        // Take screenshot if errors found
        if (consoleErrors.length > 0) {
          const screenshotName = pageInfo.path
            .replace(/\//g, '_')
            .replace(/^_/, '');
          await page.screenshot({
            path: `tests/e2e/audit/screenshots/${screenshotName}.png`,
            fullPage: false,
          });
          status = 'ERROR';
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        if (msg.includes('timeout') || msg.includes('Timeout')) {
          status = 'TIMEOUT';
          consoleErrors.push(`[TIMEOUT] Page did not load within timeout`);
        } else {
          status = 'ERROR';
          consoleErrors.push(`[NAVIGATION] ${msg.substring(0, 200)}`);
        }
      }

      const loadTimeMs = Date.now() - startTime;

      const result: PageAuditResult = {
        path: pageInfo.path,
        label: pageInfo.label,
        status: consoleErrors.length > 0 ? 'ERROR' : status,
        consoleErrors,
        consoleWarnings,
        loadTimeMs,
        hasContent,
        hasLoadingStuck,
      };

      results.push(result);

      // Log immediately
      const icon =
        result.status === 'OK'
          ? '✅'
          : result.status === 'WARNING'
            ? '⚠️'
            : '❌';
      console.log(
        `${icon} ${result.label} (${result.path}) — ${result.loadTimeMs}ms${result.consoleErrors.length > 0 ? ` — ${result.consoleErrors.length} error(s)` : ''}`
      );
      for (const err of result.consoleErrors) {
        console.log(`   ↳ ${err}`);
      }

      // Assert no critical errors
      if (
        consoleErrors.some(
          e => e.includes('[REACT]') || e.includes('[PAGE CRASH]')
        )
      ) {
        expect(
          consoleErrors,
          `Critical errors on ${pageInfo.path}`
        ).toHaveLength(0);
      }

      await context.close();
    });
  }

  test.afterAll(async () => {
    // Generate summary report
    const errors = results.filter(r => r.status === 'ERROR');
    const warnings = results.filter(r => r.status === 'WARNING');
    const ok = results.filter(r => r.status === 'OK');
    const timeouts = results.filter(r => r.status === 'TIMEOUT');

    console.log('\n' + '='.repeat(80));
    console.log('HR MODULE AUDIT REPORT');
    console.log('='.repeat(80));
    console.log(`Total pages: ${results.length}`);
    console.log(`✅ OK: ${ok.length}`);
    console.log(`❌ Errors: ${errors.length}`);
    console.log(`⚠️ Warnings: ${warnings.length}`);
    console.log(`⏱ Timeouts: ${timeouts.length}`);
    console.log('');

    if (errors.length > 0) {
      console.log('--- ERRORS ---');
      for (const r of errors) {
        console.log(`\n❌ ${r.label} (${r.path})`);
        for (const err of r.consoleErrors) {
          console.log(`   ${err}`);
        }
      }
    }

    if (timeouts.length > 0) {
      console.log('\n--- TIMEOUTS ---');
      for (const r of timeouts) {
        console.log(`⏱ ${r.label} (${r.path})`);
      }
    }

    // Slow pages
    const slowPages = results.filter(r => r.loadTimeMs > 8000);
    if (slowPages.length > 0) {
      console.log('\n--- SLOW PAGES (>8s) ---');
      for (const r of slowPages) {
        console.log(`🐌 ${r.label} (${r.path}) — ${r.loadTimeMs}ms`);
      }
    }

    console.log('\n' + '='.repeat(80));
  });
});
