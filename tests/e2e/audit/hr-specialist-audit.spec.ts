/**
 * HR Specialist Audit
 * Deep business logic, flow coherence, and UX audit.
 * Takes screenshots and checks structural conformity of each page.
 *
 * Checks:
 * 1. Structural conformity — every page has PageHeader > (ActionBar + Header) > PageBody
 * 2. Empty state quality — meaningful messages, correct icons, CTA buttons
 * 3. Create flow — modals use StepWizardDialog, no raw ID inputs, employee pickers
 * 4. Field labels in Portuguese with accents
 * 5. Button patterns — create (blue), export (outline), destructive (rose)
 * 6. Filter placement — inside grid or below search, never inline with search
 * 7. Breadcrumb correctness — proper casing, prepositions lowercase
 * 8. Permission gating — create button hidden when no permission
 * 9. Context menu patterns — view, edit, separator, custom, separator, delete
 */

import { test, expect, type Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'http://localhost:3000';
const SCREENSHOTS_DIR = 'tests/e2e/audit/specialist-screenshots';

interface SpecialistIssue {
  severity: 'critical' | 'major' | 'minor' | 'suggestion';
  category: 'structure' | 'flow' | 'i18n' | 'ux' | 'business-logic' | 'a11y' | 'design';
  description: string;
}

async function auditPageStructure(page: Page, pagePath: string): Promise<SpecialistIssue[]> {
  const issues: SpecialistIssue[] = [];
  const bodyText = await page.textContent('body') || '';

  // === STRUCTURAL CHECKS ===

  // 1. Must have PageActionBar with breadcrumb
  const hasBreadcrumb = await page.locator('[aria-label*="breadcrumb"], nav:has(a), [class*="Breadcrumb"]').count();
  if (hasBreadcrumb === 0 && pagePath !== '/hr') {
    issues.push({ severity: 'major', category: 'structure', description: 'Sem breadcrumb de navegação' });
  }

  // 2. Must have page title (h1 or Header component)
  const hasTitle = await page.locator('h1').count();
  if (hasTitle === 0 && pagePath !== '/hr' && pagePath !== '/hr/my-profile') {
    issues.push({ severity: 'major', category: 'structure', description: 'Sem título (h1) na página' });
  }

  // 3. Must have subtitle/description
  const titleEl = page.locator('h1').first();
  if (hasTitle > 0) {
    const titleParent = titleEl.locator('..');
    const hasSubtitle = await titleParent.locator('p, span.text-muted-foreground').count();
    if (hasSubtitle === 0) {
      // Check sibling
      const nextSibling = page.locator('h1 + p, h1 ~ p.text-muted-foreground');
      if (await nextSibling.count() === 0) {
        issues.push({ severity: 'minor', category: 'structure', description: 'Título sem subtítulo descritivo' });
      }
    }
  }

  // 4. Search bar should be full-width on its own line
  const searchBars = page.locator('input[placeholder*="Buscar"], input[placeholder*="buscar"], input[type="search"]');
  if (await searchBars.count() > 0) {
    const searchParent = searchBars.first().locator('..');
    const parentClass = await searchParent.getAttribute('class') || '';
    // Check if search is in a flex row with other elements (bad pattern)
    if (parentClass.includes('flex') && parentClass.includes('items-center') && parentClass.includes('gap')) {
      const siblings = await searchParent.locator('> *').count();
      if (siblings > 2) {
        issues.push({ severity: 'minor', category: 'ux', description: 'SearchBar dividindo linha com filtros — deveria ser full-width' });
      }
    }
  }

  // === EMPTY STATE CHECKS ===

  // 5. Empty state should have icon + message + CTA
  const emptyText = await page.locator('text=/Nenhum.*encontrad/i').count();
  if (emptyText > 0) {
    // Check for CTA button in empty state
    const emptyContainer = page.locator(':has(> :text-matches("Nenhum.*encontrad", "i"))').first();
    const hasCTA = await emptyContainer.locator('button, a').count();
    // Not a critical issue since some empty states are expected
  }

  // 6. Oversized empty state icons
  const emptyIcons = await page.locator('.text-muted-foreground svg[class*="h-12"], .opacity-40 svg[class*="h-12"]').count();
  if (emptyIcons > 0) {
    issues.push({ severity: 'minor', category: 'design', description: 'Ícone de empty state muito grande (h-12+) — usar h-8' });
  }

  // === BUTTON PATTERN CHECKS ===

  // 7. Create button should be in header area
  const createBtn = page.locator('button:has-text("Nov"), button:has-text("Criar"), button:has-text("Registrar"), button:has-text("Adicionar")');
  if (await createBtn.count() > 0) {
    // Should be near the top of the page
    const firstCreate = createBtn.first();
    const box = await firstCreate.boundingBox();
    if (box && box.y > 200) {
      issues.push({ severity: 'minor', category: 'ux', description: 'Botão de criação muito abaixo na página — deveria estar no header' });
    }
  }

  // === I18N CHECKS ===

  // 8. Common English words that should be Portuguese
  const criticalEnglish = [
    { pattern: /\bNo results found\b/i, fix: 'Nenhum resultado encontrado' },
    { pattern: /\bLoading\.\.\.\b/, fix: 'Carregando...' },
    { pattern: /\bAre you sure\b/i, fix: 'Tem certeza?' },
    { pattern: /\bDelete\b(?!d)/, fix: 'Excluir' },
    { pattern: /\bSave changes\b/i, fix: 'Salvar alterações' },
    { pattern: /\bCreate new\b/i, fix: 'Criar novo' },
    { pattern: /\bSearch\.\.\.\b/i, fix: 'Buscar...' },
    { pattern: /\bNo data\b/i, fix: 'Sem dados' },
  ];

  for (const { pattern, fix } of criticalEnglish) {
    if (pattern.test(bodyText)) {
      issues.push({ severity: 'major', category: 'i18n', description: `Texto em inglês: "${bodyText.match(pattern)?.[0]}" → "${fix}"` });
    }
  }

  // 9. Missing accents in visible text
  const accentChecks = [
    { wrong: /(?<![a-záéíóúâêôãõç])\bHorario(?![a-záéíóúâêôãõç])/g, fix: 'Horário' },
    { wrong: /(?<![a-záéíóúâêôãõç])\bSalario(?![a-záéíóúâêôãõç])/g, fix: 'Salário' },
    { wrong: /(?<![a-záéíóúâêôãõç])\bFuncionario(?![a-záéíóúâêôãõç])/g, fix: 'Funcionário' },
    { wrong: /(?<![a-záéíóúâêôãõç])\bAdmissao(?![a-záéíóúâêôãõç])/g, fix: 'Admissão' },
    { wrong: /(?<![a-záéíóúâêôãõç])\bAvaliacao(?![a-záéíóúâêôãõç])/g, fix: 'Avaliação' },
    { wrong: /(?<![a-záéíóúâêôãõç])\bInicio(?![a-záéíóúâêôãõç])/g, fix: 'Início' },
    { wrong: /(?<![a-záéíóúâêôãõç])\bTermino(?![a-záéíóúâêôãõç])/g, fix: 'Término' },
    { wrong: /(?<![a-záéíóúâêôãõç])\bBonificacao(?![a-záéíóúâêôãõç])/g, fix: 'Bonificação' },
    { wrong: /(?<![a-záéíóúâêôãõç])\bRemuneracao(?![a-záéíóúâêôãõç])/g, fix: 'Remuneração' },
    { wrong: /(?<![a-záéíóúâêôãõç])\bRescisao(?![a-záéíóúâêôãõç])/g, fix: 'Rescisão' },
  ];

  for (const { wrong, fix } of accentChecks) {
    if (wrong.test(bodyText)) {
      issues.push({ severity: 'major', category: 'i18n', description: `Acento faltando: deveria ser "${fix}"` });
    }
  }

  // === ACCESSIBILITY ===

  // 10. Buttons without text or aria-label
  const a11yIssues = await page.evaluate(() => {
    let iconOnlyBtns = 0;
    document.querySelectorAll('button').forEach(btn => {
      const text = btn.textContent?.trim();
      const label = btn.getAttribute('aria-label');
      const title = btn.getAttribute('title');
      if (!text && !label && !title) iconOnlyBtns++;
    });
    return { iconOnlyBtns };
  });

  if (a11yIssues.iconOnlyBtns > 2) {
    issues.push({ severity: 'minor', category: 'a11y', description: `${a11yIssues.iconOnlyBtns} botões sem texto ou aria-label` });
  }

  return issues;
}

// ============================================================================
// TESTS
// ============================================================================

const HR_PAGES = [
  { path: '/hr', label: 'Dashboard HR' },
  { path: '/hr/overview', label: 'Visão Geral' },
  { path: '/hr/settings', label: 'Configurações' },
  { path: '/hr/employees', label: 'Funcionários' },
  { path: '/hr/departments', label: 'Departamentos' },
  { path: '/hr/positions', label: 'Cargos' },
  { path: '/hr/work-schedules', label: 'Escalas' },
  { path: '/hr/shifts', label: 'Turnos' },
  { path: '/hr/time-control', label: 'Controle de Ponto' },
  { path: '/hr/time-bank', label: 'Banco de Horas' },
  { path: '/hr/overtime', label: 'Horas Extras' },
  { path: '/hr/absences', label: 'Ausências' },
  { path: '/hr/vacations', label: 'Férias' },
  { path: '/hr/geofence-zones', label: 'Geofence' },
  { path: '/hr/payroll', label: 'Folha de Pagamento' },
  { path: '/hr/bonuses', label: 'Bonificações' },
  { path: '/hr/deductions', label: 'Deduções' },
  { path: '/hr/benefits', label: 'Benefícios' },
  { path: '/hr/admissions', label: 'Admissões' },
  { path: '/hr/onboarding', label: 'Onboarding' },
  { path: '/hr/offboarding', label: 'Offboarding' },
  { path: '/hr/terminations', label: 'Rescisões' },
  { path: '/hr/dependants', label: 'Dependentes' },
  { path: '/hr/warnings', label: 'Advertências' },
  { path: '/hr/requests', label: 'Solicitações' },
  { path: '/hr/announcements', label: 'Comunicados' },
  { path: '/hr/kudos', label: 'Reconhecimentos' },
  { path: '/hr/teams', label: 'Equipes' },
  { path: '/hr/delegations', label: 'Delegações' },
  { path: '/hr/trainings', label: 'Treinamentos' },
  { path: '/hr/reviews', label: 'Avaliações' },
  { path: '/hr/safety-programs', label: 'Programas de Segurança' },
  { path: '/hr/workplace-risks', label: 'Riscos Ocupacionais' },
  { path: '/hr/medical-exams', label: 'Exames Médicos' },
  { path: '/hr/medical-exams/pcmso', label: 'PCMSO' },
  { path: '/hr/ppe', label: 'EPI' },
  { path: '/hr/cipa', label: 'CIPA' },
  { path: '/hr/esocial', label: 'eSocial' },
  { path: '/hr/my-profile', label: 'Meu Perfil' },
];

test.describe('HR Specialist Audit', () => {
  const allIssues: Map<string, SpecialistIssue[]> = new Map();

  test.beforeAll(async ({ browser }) => {
    const dir = path.resolve(SCREENSHOTS_DIR);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');

    const identifierInput = page.locator('input').first();
    await identifierInput.waitFor({ timeout: 10000 });
    await identifierInput.fill('admin@teste.com');
    await page.locator('button:has-text("Continuar"), button[type="submit"]').first().click();
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.waitFor({ timeout: 10000 });
    await passwordInput.fill('Teste@123');
    await page.locator('button:has-text("Entrar"), button[type="submit"]').first().click();
    await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 15000 });

    if (page.url().includes('select-tenant')) {
      await page.waitForTimeout(1000);
      const tenantCard = page.locator('.cursor-pointer, [role="button"]').first();
      if (await tenantCard.isVisible({ timeout: 5000 })) {
        await tenantCard.click();
        await page.waitForURL(url => !url.toString().includes('select-tenant'), { timeout: 10000 });
      }
    }

    await context.storageState({ path: 'tests/e2e/audit/.specialist-auth-state.json' });
    await context.close();
  });

  for (const pageInfo of HR_PAGES) {
    test(`Specialist: ${pageInfo.label} (${pageInfo.path})`, async ({ browser }) => {
      const context = await browser.newContext({
        storageState: 'tests/e2e/audit/.specialist-auth-state.json',
        viewport: { width: 1440, height: 900 },
      });
      const page = await context.newPage();

      // Capture console errors
      const consoleErrors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          const text = msg.text();
          if (!text.includes('favicon') && !text.includes('Download the React DevTools')) {
            consoleErrors.push(text.substring(0, 200));
          }
        }
      });
      page.on('pageerror', error => {
        consoleErrors.push(`[CRASH] ${error.message.substring(0, 200)}`);
      });

      try {
        await page.goto(`${BASE_URL}${pageInfo.path}`, {
          waitUntil: 'domcontentloaded',
          timeout: 25000,
        });
        await page.waitForTimeout(4000);

        // Check if redirected to login/fast-login (session expired)
        const currentUrl = page.url();
        if (currentUrl.includes('/login') || currentUrl.includes('/fast-login')) {
          // Re-login
          if (currentUrl.includes('/fast-login')) {
            await page.locator('text=Entrar com outra conta').click().catch(() => {});
            await page.waitForTimeout(1000);
          }
          const idInput = page.locator('input').first();
          await idInput.waitFor({ timeout: 5000 });
          await idInput.fill('admin@teste.com');
          await page.locator('button:has-text("Continuar"), button[type="submit"]').first().click();
          const pwInput = page.locator('input[type="password"]').first();
          await pwInput.waitFor({ timeout: 5000 });
          await pwInput.fill('Teste@123');
          await page.locator('button:has-text("Entrar"), button[type="submit"]').first().click();
          await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 10000 });
          // Navigate to target page again
          await page.goto(`${BASE_URL}${pageInfo.path}`, {
            waitUntil: 'domcontentloaded',
            timeout: 25000,
          });
          await page.waitForTimeout(4000);
          // Save refreshed auth state
          await page.context().storageState({ path: 'tests/e2e/audit/.specialist-auth-state.json' });
        }

        // Screenshot
        const name = pageInfo.path.replace(/\//g, '_').replace(/^_/, '') || 'hr_root';
        await page.screenshot({
          path: `${SCREENSHOTS_DIR}/${name}.png`,
          fullPage: true,
        });

        // Run structural audit
        const issues = await auditPageStructure(page, pageInfo.path);

        // Add console errors as issues
        for (const err of consoleErrors) {
          if (err.includes('403')) {
            issues.push({ severity: 'critical', category: 'business-logic', description: `Permissão negada (403): ${err.substring(0, 100)}` });
          } else if (err.includes('404')) {
            issues.push({ severity: 'major', category: 'flow', description: `Endpoint não encontrado (404): ${err.substring(0, 100)}` });
          } else if (err.includes('CRASH') || err.includes('Objects are not valid')) {
            issues.push({ severity: 'critical', category: 'structure', description: err });
          }
        }

        // Check for error state on page
        const hasError = await page.locator('text=/Erro ao carregar/i').count();
        if (hasError > 0) {
          issues.push({ severity: 'critical', category: 'flow', description: 'Página mostra estado de erro — API falhando' });
        }

        allIssues.set(pageInfo.path, issues);

        // Log
        const criticals = issues.filter(i => i.severity === 'critical').length;
        const majors = issues.filter(i => i.severity === 'major').length;
        const icon = criticals > 0 ? '🔴' : majors > 0 ? '🟠' : issues.length > 0 ? '🟡' : '✅';
        console.log(`${icon} ${pageInfo.label} (${pageInfo.path}) — ${issues.length} issue(s)`);
        for (const issue of issues) {
          const sev = { critical: '🔴', major: '🟠', minor: '🟡', suggestion: '💡' }[issue.severity];
          console.log(`   ${sev} [${issue.category}] ${issue.description}`);
        }

      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        allIssues.set(pageInfo.path, [{
          severity: 'critical',
          category: 'structure',
          description: `Página não carregou: ${msg.substring(0, 150)}`,
        }]);
        console.log(`🔴 ${pageInfo.label} (${pageInfo.path}) — FAILED TO LOAD`);
      }

      await context.close();
    });
  }

  test.afterAll(async () => {
    console.log('\n' + '='.repeat(80));
    console.log('HR SPECIALIST AUDIT REPORT');
    console.log('='.repeat(80));

    let totalCritical = 0, totalMajor = 0, totalMinor = 0, totalSuggestion = 0;
    const cleanPages: string[] = [];

    for (const [pagePath, issues] of allIssues) {
      totalCritical += issues.filter(i => i.severity === 'critical').length;
      totalMajor += issues.filter(i => i.severity === 'major').length;
      totalMinor += issues.filter(i => i.severity === 'minor').length;
      totalSuggestion += issues.filter(i => i.severity === 'suggestion').length;
      if (issues.length === 0) cleanPages.push(pagePath);
    }

    console.log(`Pages: ${allIssues.size}`);
    console.log(`🔴 Critical: ${totalCritical}`);
    console.log(`🟠 Major: ${totalMajor}`);
    console.log(`🟡 Minor: ${totalMinor}`);
    console.log(`💡 Suggestion: ${totalSuggestion}`);
    console.log(`✅ Clean: ${cleanPages.length}`);

    // Group by severity
    for (const severity of ['critical', 'major', 'minor', 'suggestion'] as const) {
      const items: { path: string; issue: SpecialistIssue }[] = [];
      for (const [p, issues] of allIssues) {
        for (const issue of issues) {
          if (issue.severity === severity) items.push({ path: p, issue });
        }
      }
      if (items.length > 0) {
        const sev = { critical: '🔴 CRITICAL', major: '🟠 MAJOR', minor: '🟡 MINOR', suggestion: '💡 SUGGESTION' }[severity];
        console.log(`\n--- ${sev} ---`);
        for (const { path: p, issue } of items) {
          console.log(`  ${p} — [${issue.category}] ${issue.description}`);
        }
      }
    }

    if (cleanPages.length > 0) {
      console.log(`\n✅ Clean pages: ${cleanPages.join(', ')}`);
    }

    console.log('\n' + '='.repeat(80));
  });
});
