# UX Rules — Regras de Interface

**Status:** Vivo. Regras consolidadas a partir de feedback direto do usuário entre 2026-02 e 2026-04.

Complementa `frontend-patterns.md` (regras gerais de código e arquitetura). Este arquivo foca em **decisões de UX e visual** que o usuário considera inegociáveis.

---

## 1. Destructive Actions — PIN obrigatório

Toda ação destrutiva (delete, remove, purge) **deve** usar `VerifyActionPinModal` (`@/components/modals/verify-action-pin-modal`).

- Nunca usar `ConfirmDialog` simples, `window.confirm()`, ou deleção direta.
- Fluxo: user clica Delete → abre `VerifyActionPinModal` → digita PIN de 4 dígitos → `onSuccess` dispara a deleção real.
- Aplica a **todos** os módulos (admin, stock, finance, calendar, HR, sales, etc).
- Para deleções em lote, usar wrapper como `DeleteConfirmModal` que delega pra `VerifyActionPinModal`.

---

## 2. Wizard Modals obrigatórios para entrada de dados

Toda tela de criação/edição **deve** usar modal wizard:

- `StepWizardDialog` — fluxo linear (2-3 steps).
- `NavigationWizardDialog` — fluxo com navegação por seções.

**Nunca** criar páginas standalone `/entity/new` para entrada de dados. Se existir uma `/new`, deve ser convertida pra wizard modal e a página deletada.

**Por quê:** consistência de UX em todo o app. Páginas standalone quebram o padrão e criam inconsistência de navegação.

---

## 3. Hero Banner Pattern para páginas-overview de módulo

Páginas overview/consulta de módulo usam o padrão **hero banner + search strip**, como as páginas de tools (email, calendar, storage).

- Card com decorative gradient blobs + icon badge + título + descrição.
- Strip clara (`bg-muted/30 dark:bg-white/5`) logo abaixo do título com: input de search + botões de ícone (Print, Refresh) com `cursor-pointer` e Tooltip.
- Action bar: só navegação (ex: "Ver Movimentações", "Verificar Saídas").
- Filtros + item count vão dentro do `EntityGrid toolbarStart` (padrão).
- Cor por módulo: violet/indigo (stock list), rose/slate (exits), sky/blue (movements), etc.

**Nunca** usar `Header + SearchBar` separados para overview de módulo.

---

## 4. Badges e Icons — estilo definido

### Icon backgrounds

Usar gradient escuro:

```
bg-linear-to-br from-{color}-500 to-{color}-700
dark:from-{color}-600 dark:to-{color}-800
```

Ícone branco por cima.

### Badges (type labels)

Estilo **outline**:

- `border-2 border-{color}-500`
- Texto neutro: `text-slate-700 dark:text-slate-200`
- **Sem** preenchimento de fundo.

### Nunca usar

- `bg-{color}-500/10` com fundo transparente para badges de ação (só aceitável para status sutil em dual-theme).
- Cores flat sólidas (muito duras, especialmente em dark mode).

### Dados de texto

- Nomes de fabricantes e entidades: sempre `toTitleCase()` — dados geralmente vêm em UPPERCASE do DB.

---

## 5. Spacing — só números inteiros

Nunca usar valores fracionados do Tailwind: `pt-2.5`, `pb-3.5`, `gap-1.5`, etc.

Apenas inteiros: `pt-2`, `pt-3`, `pt-4`, `gap-1`, `gap-2`, etc.

Se um valor parece pequeno demais, pule para o próximo inteiro — **nunca** use decimal.

**Por quê:** o usuário foi explícito: "não trabalhamos com números quebrados". Valores fracionados tornam o design system inconsistente e difícil de manter.

---

## 6. Notifications — gating de permissão

Notifications com `entityType` específico de módulo (`finance_entry`, `hr_employee`, `stock_item`, etc.) **devem sempre** ser gated por permissão RBAC antes da criação E do display.

### Backend

1. Antes de criar notification module-específica, verificar se o destinatário tem a permissão correspondente.
2. O endpoint de listagem usa `excludeEntityTypes` no query level para filtrar por permissão.
3. Schedulers/cron jobs que enviam notifications **devem** resolver destinatários autorizados via `PermissionService.hasPermission`, nunca broadcast pra todos users do tenant.

### Frontend

`NotificationsPanel` tem filtro secundário como defense-in-depth.

### Configuração

`ENTITY_TYPE_PERMISSION_MAP` no notifications controller mapeia `entityType → required permission code`. **Estender** esse mapa quando adicionar novos tipos de notification.

**Por quê:** bug crítico encontrado onde **todos** os funcionários recebiam notifications de relatórios financeiros (valores vencidos, nomes de clientes, códigos de entries) porque o `routine-check` criava notifications para cada user logado, sem checar permissão.

---

## 7. "Imprimir" vs "Gerar Etiqueta"

São ações **completamente diferentes**. Não confundir.

| Ação               | Ícone     | Callback                                              | Comportamento                                                            |
| ------------------ | --------- | ----------------------------------------------------- | ------------------------------------------------------------------------ |
| **Imprimir**       | `Printer` | `printListing()` de `helpers/print-listing.ts`        | Abre nova janela com tabela HTML formatada                               |
| **Gerar Etiqueta** | `Tag`     | `printQueueActions.addToQueue()` de `usePrintQueue()` | Adiciona itens à fila de impressão de etiquetas com toast de confirmação |

Ambos podem coexistir: "Gerar Etiqueta" em context menu + bulk toolbar, "Imprimir" como icon button no hero strip.

---

## 8. Central — Visual Design System

### Paleta de cores

- **NÃO** usar: yellow, amber, red, blue padrão
- **Teal** (#14b8a6) no lugar de yellow/amber
- **Rose** (#f43f5e / #fb7185) no lugar de red
- **Sky** (#0ea5e9 / #38bdf8) ou **Indigo** (#6366f1 / #818cf8) no lugar de blue
- **Primary accent**: violet (#8b5cf6 / #a78bfa)
- **Success**: emerald (#10b981 / #34d399)
- **Warning/medium**: orange (#f97316 / #fb923c)
- **Destructive**: rose (#e11d48 / #fb7185)

### Light theme

- Hero banner: gradient escuro (indigo #1e1b4b → #312e81) com stat pills
- Content area: bg #f4f4f5
- Cards: white com box-shadow (sem heavy borders)
- Sidebar: white, clean, logo dark

### Dark theme

- Base: violet escuro (#0c0a1e) — **não** preto puro
- Todos os tons secundários usam undertones roxos (#6d5cae, #5b4a8a)
- Sidebar: violet profundo (#0e0b24) com purple-tinted borders
- Hero: gradient violet mais profundo (#1a0f3e → #251652)
  - **Mesmo** border-radius do light (`0 0 16px 16px`)
  - **Mesma** direção de gradient (135deg)
- Cards: `rgba(139,92,246,0.03)` bg com violet-tinted borders

### Consistência entre temas

**Crítico:** ambos os temas devem ser **visualmente consistentes** — mesmo layout, mesmo border-radius, mesma direção de gradient. **Apenas** as cores mudam.

### Regras gerais

- Evitar gradients excessivos — usar apenas em elementos pequenos (icons, bar charts).
- Sem círculos decorativos ou blobs.
- Badges usam backgrounds coloridos: `ede9fe` (violet), `ffe4e6` (rose), `e0f2fe` (sky).
- Avatars são circulares com backgrounds Tailwind color.

---

## Referências

- `frontend-patterns.md` — padrões gerais de código e arquitetura frontend
- `page-layout-pattern.md`, `entity-list-layout-pattern.md`, etc. — padrões específicos
- `guides/developer-golden-rules.md` — regras universais (cross-cutting)
- `guides/navigation-map.md` — navegação e rota single-button per module
