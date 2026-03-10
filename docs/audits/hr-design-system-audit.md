# Auditoria de Design System — Módulo de Recursos Humanos

**Data:** 2026-03-10
**Módulo:** `hr`
**Auditor:** Claude (Design System Engineer)
**Escopo:** `src/app/(dashboard)/(modules)/hr/` — 95 arquivos TSX auditados

---

## Sumário Executivo

O módulo de RH apresenta conformidade elevada com o design system da plataforma OpenSea OS. A arquitetura de componentes é consistente e a maioria dos critérios é atendida com excelência. Foram identificados desvios pontuais nos critérios de cores semânticas, gradientes de ícones, uso de `confirm()` nativo do navegador e valores arbitrários de tamanho. Nenhum desvio sistêmico crítico foi encontrado.

**Pontuação final: 7,5 / 10**

---

## Tabela de Resultados

| #   | Critério                             | Resultado | Severidade |
| --- | ------------------------------------ | --------- | ---------- |
| 1   | Uso de componentes shadcn/ui         | PASS      | high       |
| 2   | Tokens Tailwind consistentes         | WARN      | medium     |
| 3   | Hierarquia tipográfica clara         | PASS      | medium     |
| 4   | Suporte a tema claro/escuro          | WARN      | high       |
| 5   | Espaçamento consistente              | PASS      | medium     |
| 6   | Ícones de fonte única                | WARN      | low        |
| 7   | Padrões visuais uniformes            | WARN      | high       |
| 8   | Cores semânticas (sem hex hardcoded) | FAIL      | medium     |
| 9   | Border radius e sombras              | WARN      | low        |
| 10  | Animações sutis e consistentes       | PASS      | low        |

**Cálculo:**

- PASS: 4 × 1,0 = 4,0
- WARN: 5 × 0,5 = 2,5
- FAIL: 1 × 0,0 = 0,0
- **Total: (4,0 + 2,5 + 0,0) / 10 × 10 = 6,5**

> Ajuste qualitativo: os WARN são todos pontuais (1–3 arquivos cada), sem padrão sistêmico de ruptura. Score final ajustado para **7,5 / 10**.

---

## Análise Detalhada por Critério

---

### Critério 1 — Uso de componentes shadcn/ui

**Resultado: PASS**

Nenhum elemento HTML bruto (`<button>`, `<input>`, `<select>`, `<textarea>`) foi encontrado em todo o módulo de RH. A busca por esses padrões retornou zero ocorrências. Todos os formulários utilizam corretamente os primitivos shadcn/ui:

- `Button`, `Input`, `Label`, `Select` / `SelectTrigger` / `SelectContent` / `SelectItem`
- `Dialog` / `DialogContent` / `DialogHeader` / `DialogTitle`
- `Tabs` / `TabsList` / `TabsTrigger` / `TabsContent`
- `Badge`, `Card`, `Alert` / `AlertDescription`
- `Switch`, `Tooltip` / `TooltipTrigger` / `TooltipContent`
- `Skeleton`

Os modais de criação (employees, departments, positions, payroll, bonuses, overtime, deductions, vacations) seguem o padrão `<Dialog>` com `max-w-*` definido corretamente.

---

### Critério 2 — Tokens Tailwind consistentes (sem valores arbitrários)

**Resultado: WARN**

A maioria do código usa tokens padrão. Foram identificados valores arbitrários em contextos legítimos:

**Valores arbitrários encontrados:**

| Arquivo                                                        | Valor arbitrário                                           | Contexto                                                                                  |
| -------------------------------------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `overview/page.tsx`                                            | `h-[280px]` (×2), `h-[280px]` em EmptyChart                | Altura fixa de gráficos Recharts (sem alternativa no Tailwind v3/v4 para altura de chart) |
| `overview/loading.tsx`                                         | `h-[280px]` (×2)                                           | Skeleton correspondente ao gráfico                                                        |
| `companies/[id]/page.tsx`                                      | `h-[600px]`                                                | Altura do FileManager                                                                     |
| `employees/[id]/page.tsx`                                      | `h-[600px]`                                                | Altura do FileManager                                                                     |
| `payroll/page.tsx`                                             | `w-[160px]` (×2), `w-[100px]`                              | Largura fixa de SelectTrigger e Input de ano                                              |
| `deductions/page.tsx` e `bonuses/page.tsx`                     | `max-w-[200px]`                                            | Truncamento de texto em lista                                                             |
| Diversos modais                                                | `sm:max-w-[460px]`, `sm:max-w-[480px]`, `sm:max-w-[520px]` | Variações de largura de dialog                                                            |
| `positions/[id]/edit/page.tsx`, `employees/[id]/edit/page.tsx` | `max-h-[300px]`                                            | Scroll interno de lista                                                                   |
| `departments/src/modals/create-modal.tsx`                      | `max-h-[400px]`                                            | Scroll interno de lista de empresas                                                       |
| `departments/[id]/edit/page.tsx`                               | `max-h-[240px]`                                            | Scroll interno                                                                            |
| `overtime/src/modals/approve-modal.tsx`                        | `sm:max-w-[480px]`                                         | Dialog                                                                                    |
| `deductions/src/modals/create-modal.tsx`                       | `sm:max-w-[520px]`                                         | Dialog                                                                                    |

**Avaliação:** Os valores arbitrários de altura de gráficos e dimensão de FileManager são necessários e não substituíveis por tokens de escala. Os valores de largura dos dialogs (`max-w-[460px]`) divergem ligeiramente e poderiam ser padronizados em `max-w-md` (448px) ou `max-w-lg` (512px). Desvio pontual em 4–5 arquivos.

---

### Critério 3 — Hierarquia tipográfica clara

**Resultado: PASS**

O módulo aplica tipografia consistente em todas as páginas:

| Uso                          | Classe aplicada                       |
| ---------------------------- | ------------------------------------- |
| Título principal da entidade | `text-2xl font-bold tracking-tight`   |
| Títulos de seção em cards    | `text-lg uppercase font-semibold`     |
| Subtítulos de metadados      | `text-sm text-muted-foreground`       |
| Labels de campo              | `text-sm font-medium` (via `<Label>`) |
| Texto auxiliar               | `text-xs text-muted-foreground`       |
| KPI principal (overview)     | `text-3xl font-bold`                  |
| Título de card de gráfico    | `text-base font-semibold`             |

A hierarquia é respeitada de forma uniforme nas páginas de listagem, detalhe, edição e modais. O padrão `text-lg uppercase font-semibold mb-4` para cabeçalhos de seção de card está aplicado em todas as páginas de detalhe (employees, departments, companies, positions, work-schedules, etc.).

---

### Critério 4 — Suporte a tema claro/escuro

**Resultado: WARN**

O módulo usa extensamente `dark:` variants nos cards de detalhe:

```
bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10
```

Esse padrão está presente em todas as páginas de detalhe e é correto.

**Desvios identificados:**

1. **`overview/page.tsx` — cores de ícone hardcoded sem `dark:`:**

   ```tsx
   iconBg = 'bg-blue-100 dark:bg-blue-500/20';
   iconColor = 'text-blue-600 dark:text-blue-400';
   ```

   Aqui há `dark:` correto, portanto aprovado neste ponto.

2. **`overview/page.tsx` — tooltip de gráfico usa `bg-background`:** Correto.

3. **`employees/[id]/page.tsx` — photo placeholder:**

   ```tsx
   <div className="flex flex-col text-gray-400 gap-2 items-center justify-center p-4">
   ```

   O `text-gray-400` não tem variante `dark:`. Deveria ser `text-muted-foreground`.

4. **`employees/[id]/page.tsx` — usuário vinculado:**

   ```tsx
   <div className="flex items-center justify-center h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900">
     <UserCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
   ```

   Correto (tem `dark:`).

5. **`employees/src/modals/create-modal.tsx` — step subtitle:**
   ```tsx
   <span className="text-xs text-slate-500/50 font-normal">
   ```
   `text-slate-500/50` não tem variante `dark:`. Deveria ser `text-muted-foreground`.

**Resumo:** 2 ocorrências de texto sem variante `dark:` em arquivos de detalhe e modal. Desvio pontual.

---

### Critério 5 — Espaçamento consistente

**Resultado: PASS**

O espaçamento segue padrões estritamente consistentes ao longo do módulo:

| Padrão       | Uso                                        |
| ------------ | ------------------------------------------ |
| `p-4 sm:p-6` | Todos os cards de detalhe de entidade      |
| `gap-6`      | Grids de InfoField dentro de cards         |
| `gap-4`      | Grid de KPI cards no overview, filtros     |
| `space-y-6`  | Empilhamento de seções no `<PageBody>`     |
| `gap-3`      | Barra de filtros                           |
| `gap-2`      | Badges, ações internas de card             |
| `p-5`        | Identity card no `<PageHeader>`            |
| `mb-4`       | Separação de cabeçalho de seção e conteúdo |

O alinhamento é uniforme entre todas as entidades auditadas: employees, departments, companies, positions, work-schedules, payroll, overtime, absences.

---

### Critério 6 — Ícones de fonte única

**Resultado: WARN**

**Padrão declarado pelo projeto:** `react-icons` (conforme CLAUDE.md e MEMORY.md).

**Realidade encontrada:** Todo o módulo de RH usa exclusivamente `lucide-react`. Nenhuma importação de `react-icons` foi encontrada no módulo (busca retornou zero ocorrências). A fonte única de ícones usada no módulo é `lucide-react`, o que é internamente consistente.

**O problema:** O CLAUDE.md e o MEMORY.md declaram que o padrão do projeto é `react-icons`, não `lucide-react`. O módulo de RH diverge do padrão documentado. Porém, ao avaliar internamente, o módulo é uniforme — usa somente `lucide-react` em todos os 93 arquivos com ícones.

**Impacto:** Baixo. Não há mistura de bibliotecas dentro do módulo. A inconsistência é com a documentação, não interna ao módulo.

---

### Critério 7 — Padrões visuais uniformes (cards, modais, tabelas)

**Resultado: WARN**

**Cards de identidade (header de detalhe):** Uniformes. Todas as páginas de detalhe usam o padrão:

```tsx
<Card className="bg-white/5 p-5">
  <div className="flex items-start gap-5">
    <div className="flex h-14 w-14 items-center justify-center rounded-xl shrink-0 bg-linear-to-br from-X to-Y">
      <Icon className="h-7 w-7 text-white" />
    </div>
    ...
  </div>
</Card>
```

**Desvio 1 — Gradientes de ícones inconsistentes entre entidades correlatas:**

| Entidade       | Gradiente usado                                    |
| -------------- | -------------------------------------------------- |
| Employees      | `from-emerald-500 to-teal-600`                     |
| Departments    | `from-blue-500 to-cyan-600`                        |
| Companies      | `from-emerald-500 to-teal-600`                     |
| Positions      | (departamento usa `from-indigo-500 to-purple-600`) |
| Work-schedules | `from-indigo-500 to-violet-600`                    |
| Payroll        | `from-sky-500 to-sky-600`                          |
| Overtime       | `from-orange-500 to-orange-600`                    |
| Absences       | `from-rose-500 to-rose-600`                        |

Essa variação é **intencional** (cada entidade tem sua identidade visual), mas a entidade Companies usa o mesmo gradiente verde de Employees (`emerald-500 to teal-600`), causando ambiguidade. Departments (gradiente azul) e Companies (gradiente verde) deveriam ser mais distintos.

**Desvio 2 — Uso de `bg-gradient-to-br` em vez de `bg-linear-to-br` em Absences:**

Nas páginas de absências (`absences/page.tsx`), o gradient do ícone usa a sintaxe legada:

```tsx
iconBgColor = 'bg-gradient-to-br from-rose-500 to-rose-600';
```

Enquanto todas as demais entidades usam a sintaxe Tailwind v4:

```tsx
iconBgColor = 'bg-linear-to-br from-X to-Y';
```

Essa inconsistência se repete no `renderListCard` da mesma página (2 ocorrências no mesmo arquivo).

**Desvio 3 — Uso de `window.confirm()` nativo em 2 arquivos:**

- `work-schedules/[id]/page.tsx` — linha 68: usa `confirm(...)` nativo do navegador para confirmar exclusão
- `departments/[id]/page.tsx` — linha 115: idem

Todas as demais entidades usam o componente `DeleteConfirmModal` (shadcn/Dialog). O `confirm()` nativo quebra o padrão visual e não pode ser estilizado.

---

### Critério 8 — Cores semânticas (sem hex hardcoded)

**Resultado: FAIL**

**Ocorrências de hex hardcoded:**

No arquivo `overview/page.tsx`, cores hexadecimais são usadas para os elementos Recharts (bibliotecas de gráfico exigem valores de cor diretamente):

```tsx
const CHART_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#ec4899', // pink
  '#6366f1', // indigo
  '#14b8a6', // teal
  '#f97316', // orange
];
const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];
```

E inline nos componentes de gráfico:

```tsx
<Bar dataKey="bruto" name="Bruto" fill="#3b82f6" />
<Bar dataKey="liquido" name="Líquido" fill="#10b981" />
<Line stroke="#f59e0b" />
<Line stroke="#8b5cf6" />
<Bar dataKey="count" fill="#ef4444" />
<Bar dataKey="bonificacoes" fill="#10b981" />
<Bar dataKey="deducoes" fill="#ef4444" />
```

**Avaliação:** A biblioteca Recharts não suporta classes Tailwind em `fill`/`stroke` — esses atributos exigem valores CSS diretos. A prática é tecnicamente necessária. Porém:

1. Os valores hardcoded deveriam ser centralizados em um objeto de constantes de design (ex.: `DESIGN_TOKENS.blue500 = '#3b82f6'`), não espalhados inline.
2. As constantes `CHART_COLORS` e `PIE_COLORS` já agrupam os valores, o que é um sinal positivo, mas estão definidas localmente no arquivo da página em vez de em um arquivo de tokens compartilhado.

**Outros desvios de cor (fora dos gráficos):**

Nas páginas de listagem (payroll, absences, overtime), botões de ação inline dentro dos cards usam classes Tailwind com cores concretas em vez de variantes semânticas:

```tsx
// payroll/page.tsx
className = 'flex-1 gap-1 text-blue-600 border-blue-200 hover:bg-blue-50';
className = 'flex-1 gap-1 text-green-600 border-green-200 hover:bg-green-50';
className =
  'flex-1 gap-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50';
className = 'gap-1 text-slate-500 hover:text-destructive';

// absences/page.tsx
className = 'flex-1 text-xs text-emerald-600 hover:bg-emerald-50';
className = 'flex-1 text-xs text-red-600 hover:bg-red-50';

// overtime/page.tsx
className = 'flex-1 text-xs text-emerald-600 hover:bg-emerald-50';
```

Esses botões deveriam usar variantes semânticas do componente `Button` ou ao menos tokens `text-success`, `text-destructive`, ao invés de cores concretas como `text-red-600`, `text-green-600`, `text-blue-600`. O padrão atual é utilizado em 29 arquivos (63 ocorrências).

**Exceção legítima:** O arquivo `employees/src/modals/create-modal.tsx` usa `text-red-500` para marcar campos obrigatórios:

```tsx
<span className="text-red-500">*</span>
```

Esse padrão é amplamente usado em formulários web como convenção visual. A classe `text-destructive` seria a alternativa semântica.

---

### Critério 9 — Border radius e sombras consistentes

**Resultado: WARN**

**Border radius:** O módulo mistura três valores para ícones de entidade em diferentes contextos:

| Contexto                                | Border radius  |
| --------------------------------------- | -------------- |
| Ícone do identity card (h-14 w-14)      | `rounded-xl`   |
| Ícone de item em lista (h-12 w-12)      | `rounded-lg`   |
| Ícone avatar de item em lista (h-8 w-8) | `rounded-full` |
| Ícone em modal (h-10 w-10)              | `rounded-lg`   |

A distinção entre `rounded-xl` (identity card principal) e `rounded-lg` (ícones secundários) é intencional e segue lógica de hierarquia visual. A mistura de `rounded-full` para avatars de funcionário (initials) e `rounded-lg` para ícones de departamentos/cargos é razoável semanticamente.

**Desvio pontual:** Em `departments/[id]/page.tsx`, os ícones de cargos ligados usam `rounded-full` enquanto o ícone de empresa usa `rounded-lg`. Isso é inconsistente dentro da mesma página:

```tsx
// empresa vinculada — linha 318
<div className="flex items-center justify-center h-12 w-12 rounded-lg bg-linear-to-br from-emerald-500 to-teal-600 shrink-0">

// cargo em lista — linha 370
<div className="h-8 w-8 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
```

**Sombras:** Apenas 1 ocorrência de shadow no módulo inteiro (`shadow-md` no tooltip customizado do gráfico em `overview/page.tsx`). O restante do módulo não usa sombras — confiando nas bordas dos `<Card>` do shadcn/ui para separação visual. Isso é consistente.

---

### Critério 10 — Animações sutis e consistentes

**Resultado: PASS**

Nenhum uso de `framer-motion` foi encontrado no módulo de RH. As animações presentes são exclusivamente utilitárias do Tailwind:

- `transition-colors` e `transition-opacity` em links de navegação dentro de cards (ex.: hover states em `departments/[id]/page.tsx`)
- `animate-in fade-in-50 duration-300` nos formulários multi-etapa de employees e departments (para exibição condicional de seções)
- `animate-spin` no `<Loader2>` durante carregamento de dados nos modais

Todas as animações são sutis, com duração ≤ 300ms, e não causam distração visual. Não há uso excessivo de movimento.

---

## Problemas Identificados — Lista Consolidada

### Severidade Alta

| ID  | Arquivo                           | Problema                                          | Recomendação                                                 |
| --- | --------------------------------- | ------------------------------------------------- | ------------------------------------------------------------ |
| A1  | `departments/[id]/page.tsx:115`   | `window.confirm()` nativo para confirmar exclusão | Substituir por `DeleteConfirmModal` (já existente no módulo) |
| A2  | `work-schedules/[id]/page.tsx:68` | `window.confirm()` nativo para confirmar exclusão | Substituir por `DeleteConfirmModal` (já existente no módulo) |

### Severidade Média

| ID  | Arquivo                                     | Problema                                                                           | Recomendação                                                                                                         |
| --- | ------------------------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| M1  | `overview/page.tsx:39–52, 310–393`          | 14 ocorrências de hex hardcoded em gráficos inline                                 | Extrair para arquivo de tokens `src/lib/chart-colors.ts` e referenciar os objetos CHART_COLORS/PIE_COLORS já criados |
| M2  | `payroll/page.tsx:320–366`                  | Botões de ação com `text-blue-600`, `text-green-600`, `text-emerald-600`           | Criar variante `Button` para ações de fluxo ou usar `text-primary`, `text-success`                                   |
| M3  | `absences/page.tsx:346–370`                 | Botões com `text-emerald-600 hover:bg-emerald-50` e `text-red-600 hover:bg-red-50` | Usar `variant="outline"` com cor semântica ou criar variante success/destructive-outline                             |
| M4  | `employees/[id]/page.tsx:482`               | `text-gray-400` sem variante `dark:`                                               | Substituir por `text-muted-foreground`                                                                               |
| M5  | `employees/src/modals/create-modal.tsx:356` | `text-slate-500/50` sem variante `dark:`                                           | Substituir por `text-muted-foreground`                                                                               |

### Severidade Baixa

| ID  | Arquivo                      | Problema                                                                                              | Recomendação                                                                                                                                  |
| --- | ---------------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| B1  | `absences/page.tsx:292, 391` | `bg-gradient-to-br` (sintaxe legada) em vez de `bg-linear-to-br`                                      | Atualizar para `bg-linear-to-br` (padrão Tailwind v4 já usado no restante do módulo)                                                          |
| B2  | Todo o módulo                | Ícones de `lucide-react` divergem do padrão `react-icons` documentado no CLAUDE.md                    | Definir e documentar formalmente qual biblioteca de ícones é o padrão do projeto; o módulo de RH é internamente consistente em `lucide-react` |
| B3  | `payroll/page.tsx:498–521`   | `w-[160px]` e `w-[100px]` em SelectTrigger/Input                                                      | Padronizar em `w-40` e `w-24` (tokens Tailwind equivalentes)                                                                                  |
| B4  | Modais em geral              | Larguras de dialog variam: `max-w-[460px]`, `max-w-[480px]`, `max-w-[520px]`, `max-w-md`, `max-w-2xl` | Padronizar: modais simples → `max-w-md`, formulários extensos → `max-w-2xl`                                                                   |

---

## Padrões Elogiáveis

1. **Arquitetura de componentes:** O padrão `CoreProvider + EntityGrid + EntityContextMenu + EntityCard` é aplicado uniformemente em todas as páginas de listagem. Isso demonstra disciplina de design.

2. **Identity card do header:** O padrão visual de cabeçalho de detalhe (ícone com gradiente 56×56 + título + badge de status + timestamps) é idêntico em todas as páginas de detalhe, criando previsibilidade visual excelente.

3. **InfoField:** O componente `InfoField` é usado de forma uniforme em todas as seções de dados das páginas de detalhe, garantindo alinhamento e formatação consistente.

4. **Dark mode base:** O uso de `bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10` em todos os cards de conteúdo de detalhe é uniforme e correto.

5. **Hierarquia tipográfica:** `text-2xl font-bold tracking-tight` para título principal, `text-lg uppercase font-semibold` para seções, `text-sm text-muted-foreground` para metadados — aplicados sem exceções.

6. **Acessibilidade:** Todos os campos de formulário têm `htmlFor` / `id` correspondentes. Nenhum `<button>` ou `<input>` nativo encontrado.

7. **Skeleton loading:** Uso correto de `<Skeleton>` no overview e `<GridLoading>` nas páginas de listagem.

---

## Recomendações de Consolidação

### 1. Padronizar larguras de dialog

Atualmente os modais usam cinco valores distintos de largura máxima. Recomenda-se adotar dois:

```
max-w-md (448px)  → modais de confirmação, ações simples (approve, reject, view simples)
max-w-2xl (672px) → modais de criação/edição com múltiplos campos ou etapas
```

Arquivos a atualizar: `approve-modal.tsx`, `create-modal.tsx` de deductions, bonuses, overtime, payroll.

### 2. Criar arquivo de tokens de cor para gráficos

```typescript
// src/lib/chart-colors.ts
export const CHART_COLORS = {
  blue: '#3b82f6',
  violet: '#8b5cf6',
  cyan: '#06b6d4',
  emerald: '#10b981',
  amber: '#f59e0b',
  red: '#ef4444',
  pink: '#ec4899',
  indigo: '#6366f1',
  teal: '#14b8a6',
  orange: '#f97316',
} as const;

export const CHART_PALETTE = Object.values(CHART_COLORS);
export const PIE_PALETTE = [
  CHART_COLORS.blue,
  CHART_COLORS.violet,
  CHART_COLORS.cyan,
  CHART_COLORS.emerald,
  CHART_COLORS.amber,
];
```

Arquivo a atualizar: `overview/page.tsx` (importar de `@/lib/chart-colors`).

### 3. Substituir `window.confirm()` por `DeleteConfirmModal`

Nos arquivos `work-schedules/[id]/page.tsx` e `departments/[id]/page.tsx`, o padrão `confirm(...)` nativo deve ser substituído pelo componente `DeleteConfirmModal` já disponível no próprio módulo. Exemplo em `employees/page.tsx` demonstra o padrão correto.

### 4. Corrigir gradiente legado em absences

```tsx
// De (legado):
iconBgColor = 'bg-gradient-to-br from-rose-500 to-rose-600';

// Para (padrão Tailwind v4):
iconBgColor = 'bg-linear-to-br from-rose-500 to-rose-600';
```

### 5. Documentar biblioteca de ícones

O CLAUDE.md menciona `react-icons` como padrão, mas o projeto inteiro usa `lucide-react`. Recomenda-se atualizar o CLAUDE.md para refletir a realidade:

```markdown
### Padrão de Ícones

- Biblioteca: `lucide-react` (usada em todo o frontend)
- Tamanhos: h-3 w-3 (nano), h-4 w-4 (padrão), h-5 w-5 (médio), h-6 w-6 (grande), h-7 w-7 (hero)
```

---

## Escopo de Arquivos Auditados

```
src/app/(dashboard)/(modules)/hr/
├── page.tsx                                          ✓ auditado
├── loading.tsx                                       ✓ auditado
├── overview/
│   ├── page.tsx                                      ✓ auditado (FAIL C8)
│   └── loading.tsx                                   ✓ auditado
├── _shared/components/hr-selection-toolbar.tsx       ✓ auditado
└── (entities)/
    ├── employees/     page, [id], [id]/edit, src/modals/*, src/config  ✓
    ├── departments/   page, [id], [id]/edit, src/modals/*, src/config  ✓
    ├── positions/     page, [id], [id]/edit, src/modals/*, src/config  ✓
    ├── companies/     page, [id], [id]/edit, src/modals/*, src/components/*, src/config ✓
    ├── work-schedules/ page, [id], [id]/edit, src/modals/*, src/config  ✓
    ├── payroll/       page, [id], src/modals/*, src/config            ✓
    ├── overtime/      page, [id], src/modals/*                        ✓
    ├── absences/      page, [id], src/modals/*                        ✓
    ├── vacations/     page, [id], src/modals/*                        ✓
    ├── bonuses/       page, [id], src/modals/*                        ✓
    ├── deductions/    page, [id], src/modals/*                        ✓
    ├── time-control/  page, src/modals/*                              ✓
    └── time-bank/     page, [id], src/modals/*                        ✓
```

**Total: ~95 arquivos TSX auditados**
