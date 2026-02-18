# OpenSea-APP Frontend - Plano de Melhoria

## Resultado da Auditoria: B+ (7.5/10)

| Aspecto               | Nota | Status | Arquivo do Plano                 |
| --------------------- | ---- | ------ | -------------------------------- |
| Testes                | D    |        | `01-CRITICAL-testing.md`         |
| Console.log / Logging | A+   | DONE   | `01-CRITICAL-logging.md`         |
| ESLint / TypeScript   | A    | DONE   | `02-HIGH-eslint-typescript.md`   |
| Componentes Grandes   | A-   | DONE   | `02-HIGH-component-splitting.md` |
| Type Generation       | A-   | DONE   | `02-HIGH-type-generation.md`     |
| Performance           | A-   | DONE   | `03-MEDIUM-performance.md`       |
| Acessibilidade        | A-   | DONE   | `03-MEDIUM-accessibility.md`     |
| CSS Organization      | B+   |        | `03-MEDIUM-css-organization.md`  |
| Extras                | -    |        | `04-LOW-extras.md`               |

## Progresso

```
Concluido:
  [x] Fix CI (ESLint/Prettier)
  [x] Remover console.log de producao (246 statements em 89 arquivos)
  [x] Configurar logger (no-console ESLint rule ativa)
  [x] Fragmentar types monoliticos em modulos (stock 1721L -> 16 files, hr, auth, sales, rbac, common, admin)
  [x] Auto-gerar types do Swagger (pipeline pronta, limitada por schemas inline)
  [x] Eliminar `any` types (171 -> 0 warnings)
  [x] Habilitar no-explicit-any: warn
  [x] Documentacao de types (README.md + CLAUDE.md)
  [x] ARIA attributes em form fields (aria-describedby, aria-invalid - 20+ field types)
  [x] Skip links em layouts (dashboard + central)
  [x] aria-label em ~65 botoes icon-only criticos (nav, forms, print-queue, stock, hr, admin, central)
  [x] EntityGrid keyboard navigation (arrow keys, space, enter, home, end, escape)
  [x] jsx-a11y/alt-text ESLint rule habilitada (warn)
  [x] Alt text em imagens (Avatar + imagens decorativas)
  [x] Color contrast audit (design system WCAG AA compliant)
  [x] entity-form.tsx refatorado (663→196 linhas, 5 arquivos modulares)
  [x] api-client.ts refatorado (479→220 linhas, 4 arquivos modulares)
  [x] Hook factory CRUD criado (createCrudHooks + 3 hooks exemplo)
  [x] Dynamic imports (LabelGenerator @react-pdf, LabelStudioEditor GrapesJS ~700KB lazy-loaded)
  [x] Bundle analyzer configurado (npm run analyze)
  [x] EntityForm + EntityFormField memoizados (React.memo)
  [x] Token cache implementado (1s TTL, reduz acessos localStorage)

Pendente - Alta prioridade:
  [ ] Iniciar testes do api-client e auth-context
  [ ] Continuar testes (hooks, forms)

Pendente - Media prioridade:
  [ ] Organizar CSS (Tailwind utilities, componentes reutilizáveis)

Pendente - Baixa prioridade:
  [ ] Storage constants
  [ ] Extras (Storybook, PWA, etc.)
  [ ] ~90 botões icon-only restantes (componentes shadcn/ui)

Pendente - Types (não bloqueante):
  [x] Sincronizar enums com backend (ProductStatus, UnitOfMeasure divergem) - DOCUMENTADO em DIVERGENCIAS-ENUMS.md
  [ ] Normalizar datas (alguns types usam Date, backend retorna string ISO)
  [ ] Facades Swagger (quando backend migrar para $ref schemas)
  [x] Promover no-explicit-any de warn para error
  [x] Pre-commit hook (husky + lint-staged)
```

## Estimativa Restante

| Prioridade         | Esforco      | Timeline         |
| ------------------ | ------------ | ---------------- |
| ~~Critica~~        | ~~30h~~ DONE | -                |
| Alta               | ~14h         | 1 semana         |
| Media              | ~10h         | 1 semana         |
| Baixa              | ~20h         | quando possivel  |
| **Total restante** | **~44h**     | **~2-3 semanas** |
