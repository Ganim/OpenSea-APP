/**
 * HR Module Visual & UX Audit
 * Takes full-page screenshots of every HR page for visual review.
 * Checks for UX issues: empty states, broken layouts, missing translations, etc.
 */

import { test, expect, type Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'http://localhost:3000';
const LOGIN_EMAIL = 'admin@teste.com';
const LOGIN_PASSWORD = 'Teste@123';
const SCREENSHOTS_DIR = 'tests/e2e/audit/visual-screenshots';

const HR_PAGES = [
  { path: '/hr', label: 'Dashboard HR' },
  { path: '/hr/overview', label: 'Visao Geral' },
  { path: '/hr/settings', label: 'Configuracoes' },
  { path: '/hr/employees', label: 'Funcionarios' },
  { path: '/hr/departments', label: 'Departamentos' },
  { path: '/hr/positions', label: 'Cargos' },
  { path: '/hr/work-schedules', label: 'Escalas' },
  { path: '/hr/shifts', label: 'Turnos' },
  { path: '/hr/time-control', label: 'Controle Ponto' },
  { path: '/hr/time-bank', label: 'Banco Horas' },
  { path: '/hr/overtime', label: 'Horas Extras' },
  { path: '/hr/absences', label: 'Ausencias' },
  { path: '/hr/vacations', label: 'Ferias' },
  { path: '/hr/geofence-zones', label: 'Geofence' },
  { path: '/hr/payroll', label: 'Folha Pagamento' },
  { path: '/hr/bonuses', label: 'Bonificacoes' },
  { path: '/hr/deductions', label: 'Deducoes' },
  { path: '/hr/benefits', label: 'Beneficios' },
  { path: '/hr/admissions', label: 'Admissoes' },
  { path: '/hr/onboarding', label: 'Onboarding' },
  { path: '/hr/offboarding', label: 'Offboarding' },
  { path: '/hr/terminations', label: 'Desligamentos' },
  { path: '/hr/dependants', label: 'Dependentes' },
  { path: '/hr/warnings', label: 'Advertencias' },
  { path: '/hr/requests', label: 'Solicitacoes' },
  { path: '/hr/announcements', label: 'Comunicados' },
  { path: '/hr/kudos', label: 'Reconhecimentos' },
  { path: '/hr/teams', label: 'Equipes' },
  { path: '/hr/delegations', label: 'Delegacoes' },
  { path: '/hr/trainings', label: 'Treinamentos' },
  { path: '/hr/reviews', label: 'Avaliacoes' },
  { path: '/hr/safety-programs', label: 'Seguranca' },
  { path: '/hr/workplace-risks', label: 'Riscos' },
  { path: '/hr/medical-exams', label: 'Exames Medicos' },
  { path: '/hr/medical-exams/pcmso', label: 'PCMSO Dashboard' },
  { path: '/hr/ppe', label: 'EPI' },
  { path: '/hr/cipa', label: 'CIPA' },
  { path: '/hr/esocial', label: 'eSocial' },
  { path: '/hr/my-profile', label: 'Meu Perfil' },
];

interface VisualIssue {
  type: 'error' | 'warning' | 'info';
  category: string;
  description: string;
}

async function analyzePageUX(
  page: Page,
  pageInfo: { path: string; label: string }
): Promise<VisualIssue[]> {
  const issues: VisualIssue[] = [];
  const bodyText = (await page.textContent('body')) || '';

  // 1. Check for English text that should be Portuguese
  const englishPatterns = [
    /\bNo results\b/i,
    /\bLoading\.\.\./,
    /\bDelete\b(?!d)/,
    /\bCreate\b/,
    /\bEdit\b/,
    /\bSave\b/,
    /\bCancel\b(?!ar)/,
    /\bSubmit\b/,
    /\bSearch\b/,
    /\bFilter\b/,
    /\bActions?\b/,
    /\bSettings\b/,
    /\bError\b(?! [A-Z])/,
    /\bSuccess\b/,
    /\bConfirm\b(?!ar)/,
    /\bAre you sure\b/i,
    /\bNo data\b/i,
    /\bEmpty\b/i,
  ];

  for (const pattern of englishPatterns) {
    if (pattern.test(bodyText)) {
      issues.push({
        type: 'warning',
        category: 'i18n',
        description: `Texto em inglês detectado: "${bodyText.match(pattern)?.[0]}"`,
      });
    }
  }

  // 2. Check for missing accents in common Portuguese words
  const missingAccents = [
    { wrong: /\bHorario\b/, correct: 'Horário' },
    { wrong: /\bSalario\b/, correct: 'Salário' },
    { wrong: /\bFuncionario\b/, correct: 'Funcionário' },
    { wrong: /\bAusencia\b/, correct: 'Ausência' },
    { wrong: /\bBonificacao\b/, correct: 'Bonificação' },
    { wrong: /\bAdmissao\b/, correct: 'Admissão' },
    { wrong: /\bAvaliacao\b/, correct: 'Avaliação' },
    { wrong: /\bSolicitacao\b/, correct: 'Solicitação' },
    { wrong: /\bInicio\b/, correct: 'Início' },
    { wrong: /\bTermino\b/, correct: 'Término' },
  ];

  for (const { wrong, correct } of missingAccents) {
    if (wrong.test(bodyText)) {
      issues.push({
        type: 'warning',
        category: 'i18n',
        description: `Acento faltando: "${bodyText.match(wrong)?.[0]}" deveria ser "${correct}"`,
      });
    }
  }

  // 3. Check for error boundaries / error states
  const errorPatterns = [
    /Erro ao carregar/,
    /Something went wrong/,
    /Objects are not valid/,
    /Cannot read properties/,
    /undefined is not/,
    /Query data cannot be undefined/,
  ];

  for (const pattern of errorPatterns) {
    if (pattern.test(bodyText)) {
      issues.push({
        type: 'error',
        category: 'runtime',
        description: `Erro visível na página: "${bodyText.match(pattern)?.[0]}"`,
      });
    }
  }

  // 4. Check for oversized icons (common problem)
  const largeIcons = await page
    .locator(
      'svg[class*="h-12"], svg[class*="h-16"], svg[class*="h-20"], svg[class*="h-24"]'
    )
    .count();
  // Only flag if in main content area (not in wizard/modal headers)
  const mainLargeIcons = await page
    .locator(
      'main svg[class*="h-12"], main svg[class*="h-16"], [class*="PageBody"] svg[class*="h-12"]'
    )
    .count();
  if (mainLargeIcons > 3) {
    issues.push({
      type: 'warning',
      category: 'design',
      description: `${mainLargeIcons} ícones grandes (h-12+) no conteúdo principal — verificar se estão dentro do padrão`,
    });
  }

  // 5. Check for broken images
  const brokenImages = await page.evaluate(() => {
    const imgs = document.querySelectorAll('img');
    let broken = 0;
    imgs.forEach(img => {
      if (img.naturalWidth === 0 && img.src) broken++;
    });
    return broken;
  });
  if (brokenImages > 0) {
    issues.push({
      type: 'error',
      category: 'design',
      description: `${brokenImages} imagem(ns) quebrada(s)`,
    });
  }

  // 6. Check for empty tables/grids that should have data context
  const emptyGrids = await page.locator('text=/Nenhum.*encontrad/i').count();
  if (emptyGrids > 0) {
    issues.push({
      type: 'info',
      category: 'data',
      description:
        'Empty state visível — verificar se há dados no banco para esta entidade',
    });
  }

  // 7. Check for buttons without text (icon-only without aria-label)
  const iconOnlyButtons = await page.evaluate(() => {
    const btns = document.querySelectorAll('button');
    let count = 0;
    btns.forEach(btn => {
      const text = btn.textContent?.trim();
      const ariaLabel = btn.getAttribute('aria-label');
      if (!text && !ariaLabel) count++;
    });
    return count;
  });
  if (iconOnlyButtons > 0) {
    issues.push({
      type: 'warning',
      category: 'a11y',
      description: `${iconOnlyButtons} botão(ões) sem texto ou aria-label`,
    });
  }

  // 8. Check page has breadcrumb
  const hasBreadcrumb = await page
    .locator(
      'nav[aria-label*="breadcrumb"], [class*="breadcrumb"], [class*="Breadcrumb"]'
    )
    .count();
  if (hasBreadcrumb === 0 && pageInfo.path !== '/hr') {
    issues.push({
      type: 'warning',
      category: 'navigation',
      description: 'Breadcrumb não encontrado na página',
    });
  }

  return issues;
}

test.describe('HR Visual & UX Audit', () => {
  const allIssues: Map<string, VisualIssue[]> = new Map();

  test.beforeAll(async ({ browser }) => {
    // Ensure screenshots directory
    const dir = path.resolve(SCREENSHOTS_DIR);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    // Login
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');

    const identifierInput = page.locator('input').first();
    await identifierInput.waitFor({ timeout: 10000 });
    await identifierInput.fill(LOGIN_EMAIL);
    const continueBtn = page
      .locator('button:has-text("Continuar"), button[type="submit"]')
      .first();
    await continueBtn.click();
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.waitFor({ timeout: 10000 });
    await passwordInput.fill(LOGIN_PASSWORD);
    const loginBtn = page
      .locator('button:has-text("Entrar"), button[type="submit"]')
      .first();
    await loginBtn.click();
    await page.waitForURL(url => !url.toString().includes('/login'), {
      timeout: 15000,
    });

    if (page.url().includes('select-tenant')) {
      await page.waitForTimeout(1000);
      const tenantCard = page
        .locator(
          '[data-testid="tenant-card"], .cursor-pointer, [role="button"]'
        )
        .first();
      if (await tenantCard.isVisible({ timeout: 5000 })) {
        await tenantCard.click();
        await page.waitForURL(
          url => !url.toString().includes('select-tenant'),
          { timeout: 10000 }
        );
      }
    }

    await context.storageState({
      path: 'tests/e2e/audit/.visual-auth-state.json',
    });
    await context.close();
  });

  for (const pageInfo of HR_PAGES) {
    test(`Visual: ${pageInfo.label} (${pageInfo.path})`, async ({
      browser,
    }) => {
      const context = await browser.newContext({
        storageState: 'tests/e2e/audit/.visual-auth-state.json',
        viewport: { width: 1440, height: 900 },
      });
      const page = await context.newPage();

      try {
        await page.goto(`${BASE_URL}${pageInfo.path}`, {
          waitUntil: 'domcontentloaded',
          timeout: 20000,
        });

        // Wait for content to settle
        await page.waitForTimeout(4000);

        // Take screenshot
        const screenshotName =
          pageInfo.path.replace(/\//g, '_').replace(/^_/, '') || 'hr_root';
        await page.screenshot({
          path: `${SCREENSHOTS_DIR}/${screenshotName}.png`,
          fullPage: true,
        });

        // Analyze UX
        const issues = await analyzePageUX(page, pageInfo);
        allIssues.set(pageInfo.path, issues);

        // Log issues
        const errorCount = issues.filter(i => i.type === 'error').length;
        const warnCount = issues.filter(i => i.type === 'warning').length;
        const icon = errorCount > 0 ? '❌' : warnCount > 0 ? '⚠️' : '✅';
        console.log(
          `${icon} ${pageInfo.label} (${pageInfo.path}) — ${issues.length} issue(s)`
        );
        for (const issue of issues) {
          const issueIcon =
            issue.type === 'error'
              ? '🔴'
              : issue.type === 'warning'
                ? '🟡'
                : '🔵';
          console.log(
            `   ${issueIcon} [${issue.category}] ${issue.description}`
          );
        }
      } catch (error) {
        console.log(`❌ ${pageInfo.label} (${pageInfo.path}) — FAILED TO LOAD`);
        allIssues.set(pageInfo.path, [
          {
            type: 'error',
            category: 'navigation',
            description: `Página não carregou: ${error instanceof Error ? error.message : String(error)}`,
          },
        ]);
      }

      await context.close();
    });
  }

  test.afterAll(async () => {
    console.log('\n' + '='.repeat(80));
    console.log('HR VISUAL & UX AUDIT REPORT');
    console.log('='.repeat(80));

    let totalErrors = 0;
    let totalWarnings = 0;
    let totalInfo = 0;

    for (const [pagePath, issues] of allIssues) {
      totalErrors += issues.filter(i => i.type === 'error').length;
      totalWarnings += issues.filter(i => i.type === 'warning').length;
      totalInfo += issues.filter(i => i.type === 'info').length;
    }

    console.log(`Pages audited: ${allIssues.size}`);
    console.log(`🔴 Errors: ${totalErrors}`);
    console.log(`🟡 Warnings: ${totalWarnings}`);
    console.log(`🔵 Info: ${totalInfo}`);
    console.log(`📸 Screenshots saved to: ${SCREENSHOTS_DIR}/`);

    // Group by category
    const byCategory = new Map<
      string,
      { path: string; issue: VisualIssue }[]
    >();
    for (const [pagePath, issues] of allIssues) {
      for (const issue of issues) {
        if (!byCategory.has(issue.category)) byCategory.set(issue.category, []);
        byCategory.get(issue.category)!.push({ path: pagePath, issue });
      }
    }

    if (byCategory.size > 0) {
      console.log('\n--- ISSUES BY CATEGORY ---\n');
      for (const [category, items] of byCategory) {
        console.log(`[${category.toUpperCase()}] (${items.length} issues)`);
        for (const { path: p, issue } of items) {
          const icon =
            issue.type === 'error'
              ? '🔴'
              : issue.type === 'warning'
                ? '🟡'
                : '🔵';
          console.log(`  ${icon} ${p} — ${issue.description}`);
        }
        console.log('');
      }
    }

    // Pages with no issues
    const cleanPages = [...allIssues.entries()].filter(
      ([, issues]) => issues.length === 0
    );
    console.log(`\n✅ ${cleanPages.length} páginas sem problemas detectados`);
    console.log('='.repeat(80));
  });
});
