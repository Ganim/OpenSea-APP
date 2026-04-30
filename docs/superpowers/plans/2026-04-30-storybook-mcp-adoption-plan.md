# Storybook + MCP Adoption — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Instalar Storybook 10+ com MCP em `OpenSea-APP/`, catalogar 10 stories exemplares (primitivos + shared + templates de página), publicar UI + endpoint MCP no Fly.io, e estabelecer governança que mantém o catálogo vivo.

**Architecture:** Storybook co-localizado com componentes em `src/components/`, configurado em `OpenSea-APP/.storybook/`. Mocks globais (TanStack Query + next-themes + Next App Router) em `preview.tsx`. Deploy em app Fly.io dedicado (`opensea-storybook`) servindo UI estática + endpoint `/mcp`. CI gate de a11y bloqueante. Husky pre-commit warn de cobertura.

**Tech Stack:** Storybook 10+ (versão exata pinada após primeiro setup), `@storybook/nextjs-vite`, `@storybook/addon-mcp`, `@storybook/addon-vitest`, `@storybook/addon-themes`, `@storybook/addon-a11y`, Fly.io (Docker), Husky 9, Vitest 4, GitHub Actions.

**Spec de referência:** `OpenSea-APP/docs/superpowers/specs/2026-04-30-storybook-mcp-adoption-design.md`

---

## Estrutura de arquivos

### Criar

- `OpenSea-APP/.storybook/main.ts` — config principal: framework, addons, paths
- `OpenSea-APP/.storybook/preview.tsx` — decorators globais + parameters
- `OpenSea-APP/.storybook/templates/EntityListPageTemplate.stories.tsx` — story sintética
- `OpenSea-APP/docs/patterns/storybook-pattern.md` — convenções
- `OpenSea-APP/src/__fixtures__/index.ts` — barrel
- `OpenSea-APP/src/__fixtures__/products.ts` — factory de exemplo (domínio stock)
- `OpenSea-APP/src/__fixtures__/users.ts` — factory de exemplo (domínio core)
- `OpenSea-APP/src/components/ui/button.stories.tsx`
- `OpenSea-APP/src/components/ui/input-form.stories.tsx` — story conjunta Input + Form
- `OpenSea-APP/src/components/ui/card.stories.tsx`
- `OpenSea-APP/src/components/ui/dialog.stories.tsx` — Dialog primitivo + variante destrutiva
- `OpenSea-APP/src/components/layout/page-header.stories.tsx` — PageHeader + PageActionBar
- `OpenSea-APP/src/components/shared/empty-state.stories.tsx`
- `OpenSea-APP/src/components/shared/stats-card.stories.tsx`
- `OpenSea-APP/src/components/shared/grid/entity-grid.stories.tsx`
- `OpenSea-APP/src/components/shared/forms/entity-form.stories.tsx`
- `OpenSea-APP/scripts/check-storybook-coverage.mjs` — pre-commit warn
- `OpenSea-APP/Dockerfile.storybook` — container Fly
- `OpenSea-APP/fly.storybook.toml` — Fly app config
- `OpenSea-APP/.github/workflows/storybook-deploy.yml` — redeploy em push

### Modificar

- `OpenSea-APP/package.json` — adicionar deps + scripts (`storybook`, `build-storybook`)
- `OpenSea-APP/.gitignore` — adicionar `storybook-static/`
- `OpenSea-APP/tsconfig.json` — incluir `.storybook/` (se necessário)
- `OpenSea-APP/eslint.config.mjs` — relaxar regras pra `*.stories.tsx` se preciso
- `OpenSea-APP/vitest.config.ts` — adicionar project Storybook (`addon-vitest`)
- `OpenSea-APP/.husky/pre-commit` — invocar script de cobertura
- `OpenSea-APP/CLAUDE.md` — apontar pra `storybook-pattern.md` + arquivos de infra
- `OpenSea-APP/docs/guides/developer-golden-rules.md` — regra "novo componente → story"
- `OpenSea-APP/docs/patterns/frontend-patterns.md` — referência ao novo pattern
- `OpenSea-APP/.mcp.json` ou `OpenSea-APP/.claude/settings.local.json` — registrar MCP servers
- CI principal (descobrir nome durante execução, ex: `OpenSea-APP/.github/workflows/ci.yml`) — adicionar step de a11y

---

## Fase 1 — Foundation

### Task 1: Smoke check do estado atual

**Files:**

- Read: `OpenSea-APP/package.json`
- Read: `OpenSea-APP/postcss.config.mjs`
- Read: `OpenSea-APP/next.config.ts`
- Read: `OpenSea-APP/vitest.config.ts`
- Read: `OpenSea-APP/src/app/globals.css` (primeiras 30 linhas)
- Read: `OpenSea-APP/.husky/pre-commit` (se existir)

- [ ] **Step 1: Verificar versões de Next, React, Tailwind no `package.json`**

Run:

```bash
grep -E '"(next|react|tailwindcss|vitest)"' OpenSea-APP/package.json
```

Expected: confirmar `"next": "16.x"`, `"react": "19.x"`, `"tailwindcss": "^4"`, `"vitest": "^4.x"`

- [ ] **Step 2: Confirmar PostCSS minimal**

Run:

```bash
cat OpenSea-APP/postcss.config.mjs
```

Expected: ver `@tailwindcss/postcss` como única entrada. Se houver mais, anotar pra adaptar `.storybook/main.ts`.

- [ ] **Step 3: Confirmar globals.css usa diretivas Tailwind 4**

Run:

```bash
head -20 OpenSea-APP/src/app/globals.css
```

Expected: ver `@import "tailwindcss"` ou `@theme` (Tailwind 4 syntax).

- [ ] **Step 4: Confirmar vitest config não pega `*.stories.tsx`**

Run:

```bash
cat OpenSea-APP/vitest.config.ts
```

Expected: `include` patterns devem ser `.test.*` ou `.spec.*`. Anotar se for amplo (ex: `**/*.tsx`) — vai precisar excluir stories.

- [ ] **Step 5: Confirmar Husky existe**

Run:

```bash
ls -la OpenSea-APP/.husky/
```

Expected: ver `pre-commit` arquivo. Se não existir, plano precisará criar.

- [ ] **Step 6: Anotar findings no escopo do plano**

Documentar inline no `OpenSea-APP/docs/patterns/storybook-pattern.md` (criado na Task 6) o snapshot de versões e config relevante. Não commitar nada nessa task — só leitura e contexto.

---

### Task 2: Init Storybook com framework Vite

**Files:**

- Modify: `OpenSea-APP/package.json`
- Create: `OpenSea-APP/.storybook/main.ts` (gerado pelo init)
- Create: `OpenSea-APP/.storybook/preview.tsx` (gerado pelo init, vamos sobrescrever depois)
- Modify: `OpenSea-APP/.gitignore`

- [ ] **Step 1: Rodar Storybook init dentro de `OpenSea-APP/`**

Run:

```bash
cd OpenSea-APP && npx storybook@latest init --yes --type nextjs
```

Expected: instala `storybook`, `@storybook/nextjs`, `@storybook/addon-essentials`, `@storybook/addon-onboarding`, etc. Cria `.storybook/main.ts`, `.storybook/preview.ts`, e algumas stories de exemplo em `src/stories/`.

⚠️ O init usa `@storybook/nextjs` (Webpack) por padrão. Vamos trocar pra `@storybook/nextjs-vite` no próximo step.

- [ ] **Step 2: Trocar framework Webpack → Vite**

Run:

```bash
cd OpenSea-APP && npm uninstall @storybook/nextjs && npm install --save-dev @storybook/nextjs-vite
```

Expected: instala `@storybook/nextjs-vite` e remove o Webpack-based.

- [ ] **Step 3: Atualizar `.storybook/main.ts` pra usar `nextjs-vite`**

Edit: `OpenSea-APP/.storybook/main.ts`

Conteúdo final:

```ts
import type { StorybookConfig } from '@storybook/nextjs-vite';

const config: StorybookConfig = {
  stories: [
    '../src/components/**/*.stories.@(ts|tsx)',
    '../src/components/layout/**/*.stories.@(ts|tsx)',
    './templates/**/*.stories.@(ts|tsx)',
  ],
  addons: [
    '@storybook/addon-themes',
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
    '@storybook/addon-mcp',
  ],
  framework: {
    name: '@storybook/nextjs-vite',
    options: {},
  },
  staticDirs: ['../public'],
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
};

export default config;
```

- [ ] **Step 4: Remover stories de exemplo geradas pelo init**

Run:

```bash
rm -rf OpenSea-APP/src/stories
```

Expected: remove `Button.stories.tsx`, `Header.stories.tsx`, etc. — vamos escrever as nossas próprias.

- [ ] **Step 5: Adicionar `storybook-static/` ao `.gitignore`**

Edit: `OpenSea-APP/.gitignore` — adicionar linha:

```
storybook-static/
```

- [ ] **Step 6: Validar boot inicial**

Run:

```bash
cd OpenSea-APP && npm run storybook
```

Expected: server sobe em `http://localhost:6006`. Pode haver erros de stories vazias (ainda não criadas) — OK. Se houver erro de framework/build, **parar e debugar** antes de seguir.

Encerrar com Ctrl+C.

- [ ] **Step 7: Pinar versões exatas no `package.json`**

Edit: `OpenSea-APP/package.json` — em `devDependencies`, remover `^` e `~` das deps Storybook recém-instaladas. Exemplo:

```jsonc
"devDependencies": {
  // antes: "@storybook/nextjs-vite": "^10.3.4"
  "@storybook/nextjs-vite": "10.3.4",
  // mesmo pra "storybook", "@storybook/addon-themes", "@storybook/addon-a11y",
  // "@storybook/addon-vitest", "@storybook/addon-mcp"
}
```

Run depois:

```bash
cd OpenSea-APP && npm install
```

Expected: lockfile atualiza pra versões exatas.

- [ ] **Step 8: Commit**

```bash
git -C OpenSea-APP add package.json package-lock.json .storybook/main.ts .gitignore
git -C OpenSea-APP commit -m "feat(storybook): init storybook 10 with @storybook/nextjs-vite framework"
```

---

### Task 3: Configurar `preview.tsx` com decorators globais

**Files:**

- Modify: `OpenSea-APP/.storybook/preview.tsx` (sobrescrever o gerado pelo init)

- [ ] **Step 1: Sobrescrever `preview.tsx` com decorators globais**

Edit: `OpenSea-APP/.storybook/preview.tsx`

Conteúdo final:

```tsx
import type { Preview } from '@storybook/react';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { withThemeByClassName } from '@storybook/addon-themes';
import React from 'react';
import '../src/app/globals.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    nextjs: {
      appDirectory: true,
    },
    a11y: {
      // Crítico: 'error' faz violações fail no Vitest/CI.
      // Sem esse flag, o addon só warn-only — quebra o gate planejado da Task 23.
      test: 'error',
      config: {
        rules: [],
      },
      options: {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa'],
        },
      },
    },
    backgrounds: { disable: true },
  },
  decorators: [
    withThemeByClassName({
      themes: { light: '', dark: 'dark' },
      defaultTheme: 'light',
    }),
    Story => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false, refetchOnWindowFocus: false },
        },
      });
      return (
        <QueryClientProvider client={queryClient}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
          >
            <Story />
          </ThemeProvider>
        </QueryClientProvider>
      );
    },
  ],
};

export default preview;
```

- [ ] **Step 2: Validar boot com globals.css importado**

Run:

```bash
cd OpenSea-APP && npm run storybook
```

Expected: server sobe sem erro de PostCSS. Página inicial do Storybook renderiza sem stories (catálogo vazio). Se houver erro de Tailwind, debug:

- Confirmar `postcss.config.mjs` na raiz do `OpenSea-APP/` tem `@tailwindcss/postcss`
- Não duplicar config no `main.ts` — Vite + nextjs-vite herda automaticamente

Encerrar com Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git -C OpenSea-APP add .storybook/preview.tsx
git -C OpenSea-APP commit -m "feat(storybook): preview.tsx with theme + query decorators + globals.css"
```

---

### Task 4: Validar gates das questões abertas

**Files:** (somente leitura + documentação no pattern doc)

Antes de escrever stories, responder as 5 questões abertas do spec:

1. `addon-mcp` em modo deployed — qual comando expõe `/mcp`?
2. `addon-mcp` lê manifests on-the-fly ou pré-gerados?
3. App Router config — global ou por story?
4. Quais dos 10 alvos são Server Components?
5. Quais versões exatas pinar?

- [ ] **Step 1: Subir Storybook e testar endpoint MCP local**

Run:

```bash
cd OpenSea-APP && npm run storybook
```

Em outro terminal:

```bash
curl -i http://localhost:6006/mcp
```

Expected: alguma resposta HTTP (200 ou 405). Se `/mcp` não responder, ler docs do `@storybook/addon-mcp` no `node_modules/@storybook/addon-mcp/README.md` ou `package.json`.

- [ ] **Step 2: Testar MCP em build estático**

Run em outro terminal (manter dev server vivo):

```bash
cd OpenSea-APP && npm run build-storybook && npx http-server storybook-static -p 6007
curl -i http://localhost:6007/mcp
```

Expected: descobrir se `/mcp` precisa do dev server ou funciona com static + http-server. **Anotar resposta** — define Dockerfile do Fly.

- [ ] **Step 3: Verificar quais componentes-alvo são Server Components**

Para cada um dos 10 alvos, verificar se tem diretiva `'use client'` no topo do arquivo:

Run:

```bash
for f in \
  OpenSea-APP/src/components/ui/button.tsx \
  OpenSea-APP/src/components/ui/input.tsx \
  OpenSea-APP/src/components/ui/form.tsx \
  OpenSea-APP/src/components/ui/card.tsx \
  OpenSea-APP/src/components/ui/dialog.tsx \
  OpenSea-APP/src/components/layout/page-header.tsx \
  OpenSea-APP/src/components/layout/page-action-bar.tsx \
  OpenSea-APP/src/components/shared/empty-state.tsx \
  OpenSea-APP/src/components/shared/stats-card.tsx \
  OpenSea-APP/src/components/shared/grid/entity-grid.tsx \
  OpenSea-APP/src/components/shared/forms/entity-form.tsx; do
  echo -n "$f: "
  head -1 "$f"
done
```

Expected: anotar quais NÃO têm `'use client'` — são candidatos a Server Component que podem precisar wrapper Client na story.

- [ ] **Step 4: Pinar versões nos `package.json`**

Confirmar Step 7 da Task 2 (versões pinadas). Se houver minor desvio (`^x.y.z`), corrigir agora.

- [ ] **Step 5: Sem commit (gate só de validação)**

Encerrar Storybook (Ctrl+C). Resultados anotados em arquivo temporário (não commitado) ou direto no `storybook-pattern.md` da Task 6.

---

### Task 5: Criar fixtures de exemplo

**Files:**

- Create: `OpenSea-APP/src/__fixtures__/index.ts`
- Create: `OpenSea-APP/src/__fixtures__/products.ts`
- Create: `OpenSea-APP/src/__fixtures__/users.ts`

- [ ] **Step 1: Criar barrel `__fixtures__/index.ts`**

Edit: `OpenSea-APP/src/__fixtures__/index.ts`

```ts
export * from './products';
export * from './users';
```

- [ ] **Step 2: Criar factory de products (placeholder mínimo)**

Edit: `OpenSea-APP/src/__fixtures__/products.ts`

```ts
export interface MockProduct {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  active: boolean;
  createdAt: string;
}

export const mockProduct = (
  overrides: Partial<MockProduct> = {}
): MockProduct => ({
  id: 'prod-1',
  name: 'Camiseta Algodão Premium',
  sku: 'CAM-001',
  price: 89.9,
  stock: 42,
  active: true,
  createdAt: '2026-04-01T10:00:00.000Z',
  ...overrides,
});

export const mockProducts = (count: number): MockProduct[] =>
  Array.from({ length: count }, (_, i) =>
    mockProduct({
      id: `prod-${i + 1}`,
      name: `Produto Demo ${i + 1}`,
      sku: `DEMO-${String(i + 1).padStart(3, '0')}`,
      price: Math.round((50 + Math.random() * 500) * 100) / 100,
      stock: Math.floor(Math.random() * 200),
    })
  );
```

- [ ] **Step 3: Criar factory de users**

Edit: `OpenSea-APP/src/__fixtures__/users.ts`

```ts
export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  avatarUrl?: string;
}

export const mockUser = (overrides: Partial<MockUser> = {}): MockUser => ({
  id: 'user-1',
  name: 'Maria Silva',
  email: 'maria@empresa.com',
  role: 'manager',
  ...overrides,
});
```

- [ ] **Step 4: Commit**

```bash
git -C OpenSea-APP add src/__fixtures__/
git -C OpenSea-APP commit -m "feat(fixtures): add mock product/user factories for storybook"
```

---

### Task 6: Documentar convenções em `storybook-pattern.md`

**Files:**

- Create: `OpenSea-APP/docs/patterns/storybook-pattern.md`
- Modify: `OpenSea-APP/docs/patterns/frontend-patterns.md`

- [ ] **Step 1: Criar `storybook-pattern.md`**

Edit: `OpenSea-APP/docs/patterns/storybook-pattern.md`

````markdown
# Storybook Pattern (OpenSea-APP)

Stack pinada (atualizar no setup):

- `storybook` — pinar versão exata
- `@storybook/nextjs-vite` — framework
- `@storybook/addon-mcp` — endpoint `/mcp`
- `@storybook/addon-vitest` — integração com Vitest
- `@storybook/addon-themes` — toggle light/dark
- `@storybook/addon-a11y` — verificação de acessibilidade

## Localização

Stories são **co-localizadas** com componentes:

- `components/ui/button.tsx` ↔ `components/ui/button.stories.tsx`
- Templates de página (sintéticos) ficam em `OpenSea-APP/.storybook/templates/`

## Convenções de título

- `UI/<Componente>` — primitivos em `components/ui/`
- `Shared/<Categoria>/<Componente>` — compostos em `components/shared/`
- `Pages/<Padrão>` — templates sintéticos
- `Modules/<Modulo>/<Componente>` — específicos de módulo (raro)

## Estrutura mínima

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { ComponenteX } from './componente-x';

const meta = {
  title: 'UI/ComponenteX',
  component: ComponenteX,
  tags: ['autodocs'],
  parameters: { layout: 'centered' }, // ou 'fullscreen'
} satisfies Meta<typeof ComponenteX>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    /* ... */
  },
};
```
````

## Idioma

Textos visíveis em **PT-BR** (mesma língua da UI real). Comentários e variáveis em inglês.

## Estados obrigatórios por categoria

| Categoria           | Estados mínimos                                               |
| ------------------- | ------------------------------------------------------------- |
| Primitivos `ui/`    | Default + variants/sizes da `cva` + disabled                  |
| Inputs              | Default + Focused + Error + Disabled + WithLabel + WithHelper |
| Modais              | Open + WithLoading + WithError                                |
| Cards de dado       | Default + Loading + Error + Empty                             |
| Templates de página | Desktop + Mobile + Loading + Empty + Error + WithFilters      |

## Acessibilidade

- `addon-a11y` ativo globalmente
- CI bloqueia em violações `serious`/`critical`
- Desabilitar checks específicos só com justificativa: `parameters.a11y.disable = true` + comentário

## Mocks globais

- TanStack Query: `QueryClient` novo por story (decorator global)
- Next router: `parameters.nextjs.appDirectory: true` global
- Dados: factory functions em `src/__fixtures__/<dominio>/`
- Imagens: `public/storybook-fixtures/`

## MCP

- Local: `http://localhost:6006/mcp` quando `npm run storybook` ativo
- Deployed: Fly.io app `opensea-storybook` — fallback quando local não está up
- Smoke test: `curl -i http://localhost:6006/mcp` retorna 200/405

## Snapshot funcional (resposta às questões abertas do spec)

> Preencher após Task 4 (gate de validação):
>
> 1. Modo do MCP deployed: \_\_\_
> 2. Manifests on-the-fly vs pré-gerados: \_\_\_
> 3. App Router config: global em `preview.tsx`
> 4. Server Components nos 10 alvos: \_\_\_
> 5. Versões pinadas: \_\_\_

````

- [ ] **Step 2: Adicionar referência no `frontend-patterns.md`**

Edit: `OpenSea-APP/docs/patterns/frontend-patterns.md` — adicionar uma linha na seção que lista patterns:

```markdown
- [Storybook Pattern](./storybook-pattern.md) — convenções para stories, mocks globais, MCP setup
````

(Localizar a seção apropriada lendo o arquivo atual antes de editar.)

- [ ] **Step 3: Commit**

```bash
git -C OpenSea-APP add docs/patterns/storybook-pattern.md docs/patterns/frontend-patterns.md
git -C OpenSea-APP commit -m "docs(patterns): storybook conventions + reference in frontend-patterns"
```

---

### Task 7: Story 1 — Button (UI primitivo)

**Files:**

- Create: `OpenSea-APP/src/components/ui/button.stories.tsx`

- [ ] **Step 1: Ler o componente existente**

Run:

```bash
head -60 OpenSea-APP/src/components/ui/button.tsx
```

Expected: identificar variantes da `cva` (default, destructive, outline, secondary, ghost, link) e sizes (default, sm, lg, icon). Anotar nomes exatos.

- [ ] **Step 2: Escrever a story**

Edit: `OpenSea-APP/src/components/ui/button.stories.tsx`

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';
import { Loader2, Plus, Trash2 } from 'lucide-react';

const meta = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'destructive',
        'outline',
        'secondary',
        'ghost',
        'link',
      ],
    },
    size: { control: 'select', options: ['default', 'sm', 'lg', 'icon'] },
    disabled: { control: 'boolean' },
  },
  args: { children: 'Botão padrão' },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button variant="default">Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon">
        <Plus className="size-4" />
      </Button>
    </div>
  ),
};

export const Disabled: Story = { args: { disabled: true } };

export const Loading: Story = {
  args: {
    disabled: true,
    children: (
      <>
        <Loader2 className="size-4 animate-spin" />
        Carregando...
      </>
    ),
  },
};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Plus className="size-4" />
        Novo item
      </>
    ),
  },
};

export const DestructiveWithIcon: Story = {
  args: {
    variant: 'destructive',
    children: (
      <>
        <Trash2 className="size-4" />
        Excluir
      </>
    ),
  },
};

export const Dark: Story = {
  parameters: { theme: 'dark' },
  args: { children: 'Botão em modo escuro' },
};
```

- [ ] **Step 3: Validar story renderiza**

Run:

```bash
cd OpenSea-APP && npm run storybook
```

Abrir `http://localhost:6006`, navegar pra `UI/Button`. Validar todos os 8 stories renderizam sem erro. Toggle dark mode funciona.

Encerrar Storybook.

- [ ] **Step 4: Commit**

```bash
git -C OpenSea-APP add src/components/ui/button.stories.tsx
git -C OpenSea-APP commit -m "feat(storybook): add Button stories with all variants/sizes/states"
```

---

### Task 8: Story 2 — Input + Form (story conjunta)

**Files:**

- Create: `OpenSea-APP/src/components/ui/input-form.stories.tsx`

- [ ] **Step 1: Ler `input.tsx` e `form.tsx` para entender API**

Run:

```bash
head -40 OpenSea-APP/src/components/ui/input.tsx
head -60 OpenSea-APP/src/components/ui/form.tsx
```

Expected: confirmar API do `Input` (props HTML standard + cn) e do `Form` (wrapper de react-hook-form com `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`).

- [ ] **Step 2: Escrever a story conjunta**

Edit: `OpenSea-APP/src/components/ui/input-form.stories.tsx`

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from './input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from './form';
import { Button } from './button';

const meta = {
  title: 'UI/Input + Form',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

const schema = z.object({
  email: z.string().email('Email inválido'),
  name: z.string().min(2, 'Nome muito curto'),
});

const FormDemo = ({
  defaultValues = { email: '', name: '' },
  forceError = false,
}: {
  defaultValues?: { email: string; name: string };
  forceError?: boolean;
}) => {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onSubmit',
  });

  if (forceError) {
    form.setError('email', { message: 'Este email já está em uso' });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(data =>
          alert(JSON.stringify(data, null, 2))
        )}
        className="w-80 space-y-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome completo</FormLabel>
              <FormControl>
                <Input placeholder="Maria Silva" {...field} />
              </FormControl>
              <FormDescription>Como aparece no cadastro.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="voce@empresa.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Salvar
        </Button>
      </form>
    </Form>
  );
};

export const InputDefault: Story = {
  render: () => <Input placeholder="Digite aqui..." className="w-80" />,
};

export const InputDisabled: Story = {
  render: () => <Input placeholder="Bloqueado" disabled className="w-80" />,
};

export const InputWithLabel: Story = {
  render: () => (
    <div className="w-80 space-y-2">
      <label className="text-sm font-medium">Documento (CPF)</label>
      <Input type="text" inputMode="numeric" placeholder="000.000.000-00" />
    </div>
  ),
};

export const FormDefault: Story = { render: () => <FormDemo /> };

export const FormWithError: Story = {
  render: () => (
    <FormDemo
      defaultValues={{ email: 'duplicado@empresa.com', name: 'Maria' }}
      forceError
    />
  ),
};

export const FormPrefilled: Story = {
  render: () => (
    <FormDemo
      defaultValues={{ email: 'maria@empresa.com', name: 'Maria Silva' }}
    />
  ),
};
```

- [ ] **Step 3: Validar render**

Run:

```bash
cd OpenSea-APP && npm run storybook
```

Navegar pra `UI/Input + Form`. Validar:

- 6 stories renderizam
- Form de validação mostra erro ao submeter vazio
- Form com `forceError` mostra mensagem "Este email já está em uso"

Encerrar.

- [ ] **Step 4: Commit**

```bash
git -C OpenSea-APP add src/components/ui/input-form.stories.tsx
git -C OpenSea-APP commit -m "feat(storybook): add Input + Form stories with validation states"
```

---

### Task 9: Story 3 — Card

**Files:**

- Create: `OpenSea-APP/src/components/ui/card.stories.tsx`

- [ ] **Step 1: Ler `card.tsx`**

Run:

```bash
cat OpenSea-APP/src/components/ui/card.tsx
```

Expected: confirmar exports `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`, `CardAction` (se existir).

- [ ] **Step 2: Escrever a story**

Edit: `OpenSea-APP/src/components/ui/card.stories.tsx`

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './card';
import { Button } from './button';

const meta = {
  title: 'UI/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Pedido #4521</CardTitle>
        <CardDescription>Cliente: Maria Silva</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          3 itens • R$ 289,90 • Aguardando pagamento
        </p>
      </CardContent>
    </Card>
  ),
};

export const WithFooterActions: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Aprovar férias</CardTitle>
        <CardDescription>Solicitação de João Pedro</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">15/06/2026 a 30/06/2026 (15 dias)</p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" size="sm">
          Recusar
        </Button>
        <Button size="sm">Aprovar</Button>
      </CardFooter>
    </Card>
  ),
};

export const Minimal: Story = {
  render: () => (
    <Card className="w-80 p-5">
      <p className="text-sm">Card minimalista, sem header/footer.</p>
    </Card>
  ),
};

export const InGrid: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 w-[640px]">
      {[1, 2, 3, 4].map(n => (
        <Card key={n}>
          <CardHeader>
            <CardTitle>Card #{n}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Conteúdo de exemplo.
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  ),
};
```

- [ ] **Step 3: Validar e commitar**

Run:

```bash
cd OpenSea-APP && npm run storybook
```

Validar `UI/Card` com 4 stories. Encerrar.

```bash
git -C OpenSea-APP add src/components/ui/card.stories.tsx
git -C OpenSea-APP commit -m "feat(storybook): add Card stories (default, footer actions, minimal, grid)"
```

---

### Task 10: Story 4 — Dialog + variante destrutiva

**Files:**

- Create: `OpenSea-APP/src/components/ui/dialog.stories.tsx`

- [ ] **Step 1: Ler `dialog.tsx` e localizar VerifyActionPinModal**

Run:

```bash
cat OpenSea-APP/src/components/ui/dialog.tsx | head -30
grep -r "export.*VerifyActionPinModal" OpenSea-APP/src/ | head -3
```

Expected: confirmar API de `Dialog` (Radix wrapper) e o path exato do `VerifyActionPinModal`.

- [ ] **Step 2: Escrever a story**

Edit: `OpenSea-APP/src/components/ui/dialog.stories.tsx`

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';
import { Button } from './button';
import { Trash2 } from 'lucide-react';

const meta = {
  title: 'UI/Dialog',
  component: Dialog,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Abrir diálogo</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar perfil</DialogTitle>
          <DialogDescription>
            Atualize suas informações cadastrais. Pressione Salvar quando
            terminar.
          </DialogDescription>
        </DialogHeader>
        <div className="text-sm">Conteúdo do formulário aqui.</div>
        <DialogFooter>
          <Button variant="outline">Cancelar</Button>
          <Button>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const DestructiveConfirmation: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Padrão obrigatório (CLAUDE.md §7): toda ação destrutiva usa VerifyActionPinModal. Aqui mostramos o invólucro de Dialog com a estética destrutiva (rose) — para o uso real, ver o componente VerifyActionPinModal em components/modals/.',
      },
    },
  },
  render: () => (
    <Dialog defaultOpen>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-rose-600 dark:text-rose-400">
            Excluir 3 produtos?
          </DialogTitle>
          <DialogDescription>
            Esta ação não pode ser desfeita. Os produtos selecionados serão
            removidos permanentemente, junto com suas variantes e histórico de
            movimentação.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
          ⚠️ Use sempre <code>VerifyActionPinModal</code> em produção (PIN
          obrigatório).
        </div>
        <DialogFooter>
          <Button variant="outline">Cancelar</Button>
          <Button variant="destructive">
            <Trash2 className="size-4" />
            Excluir definitivamente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const WithLoading: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Salvando alterações...</DialogTitle>
            <DialogDescription>
              Aguarde enquanto sincronizamos com o servidor.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-6">
            <div className="size-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </div>
        </DialogContent>
      </Dialog>
    );
  },
};
```

- [ ] **Step 3: Validar e commitar**

Run:

```bash
cd OpenSea-APP && npm run storybook
```

Validar `UI/Dialog`. Encerrar.

```bash
git -C OpenSea-APP add src/components/ui/dialog.stories.tsx
git -C OpenSea-APP commit -m "feat(storybook): add Dialog stories incl. destructive variant pattern"
```

---

### Task 11: Story 5 — PageHeader + PageActionBar

**Files:**

- Create: `OpenSea-APP/src/components/layout/page-header.stories.tsx`

- [ ] **Step 1: Ler ambos os componentes**

Run:

```bash
cat OpenSea-APP/src/components/layout/page-header.tsx
cat OpenSea-APP/src/components/layout/page-action-bar.tsx
```

Expected: anotar API exata (props, slots).

- [ ] **Step 2: Escrever a story**

Edit: `OpenSea-APP/src/components/layout/page-header.stories.tsx`

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { PageHeader } from './page-header';
import { PageActionBar } from './page-action-bar';
import { Button } from '@/components/ui/button';
import { Plus, Download, Upload } from 'lucide-react';

const meta = {
  title: 'Shared/Layout/PageHeader',
  component: PageHeader,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

const wrap = (children: React.ReactNode) => (
  <div className="bg-background min-h-[300px] p-6">{children}</div>
);

export const Default: Story = {
  render: () =>
    wrap(
      <PageHeader
        config={{
          title: 'Produtos',
          description: 'Catálogo completo de produtos da empresa.',
        }}
      />
    ),
};

export const WithActionBar: Story = {
  render: () =>
    wrap(
      <div className="space-y-4">
        <PageActionBar>
          <Button size="sm" variant="outline">
            <Upload className="size-4" /> Importar
          </Button>
          <Button size="sm" variant="outline">
            <Download className="size-4" /> Exportar
          </Button>
          <Button size="sm">
            <Plus className="size-4" /> Novo produto
          </Button>
        </PageActionBar>
        <PageHeader
          config={{
            title: 'Produtos',
            description: 'Catálogo completo de produtos da empresa.',
          }}
        />
      </div>
    ),
};

export const Mobile: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  render: () =>
    wrap(
      <PageHeader
        config={{
          title: 'Produtos',
          description: 'Catálogo completo.',
        }}
      />
    ),
};

export const Dark: Story = {
  parameters: { theme: 'dark' },
  render: () =>
    wrap(
      <PageHeader
        config={{
          title: 'Produtos',
          description: 'Catálogo em modo escuro.',
        }}
      />
    ),
};
```

⚠️ Se `PageHeader` real exigir props diferentes do exemplo (visto na leitura do step 1), **ajustar a story pra refletir a API real** antes de commitar.

- [ ] **Step 3: Validar e commitar**

```bash
cd OpenSea-APP && npm run storybook
# verificar render, encerrar
git -C OpenSea-APP add src/components/layout/page-header.stories.tsx
git -C OpenSea-APP commit -m "feat(storybook): add PageHeader + PageActionBar stories"
```

---

### Task 12: Story 6 — EmptyState

**Files:**

- Create: `OpenSea-APP/src/components/shared/empty-state.stories.tsx`

- [ ] **Step 1: Ler `empty-state.tsx`**

```bash
cat OpenSea-APP/src/components/shared/empty-state.tsx
```

- [ ] **Step 2: Escrever story refletindo API real**

Edit: `OpenSea-APP/src/components/shared/empty-state.stories.tsx`

Template (adaptar à API real lida no step 1):

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { EmptyState } from './empty-state';
import { Button } from '@/components/ui/button';
import { Plus, Package } from 'lucide-react';

const meta = {
  title: 'Shared/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <EmptyState
      icon={<Package className="size-10" />}
      title="Nenhum produto cadastrado"
      description="Comece criando seu primeiro produto para vê-lo listado aqui."
    />
  ),
};

export const WithAction: Story = {
  render: () => (
    <EmptyState
      icon={<Package className="size-10" />}
      title="Nenhum produto cadastrado"
      description="Comece criando seu primeiro produto para vê-lo listado aqui."
      action={
        <Button>
          <Plus className="size-4" /> Criar primeiro produto
        </Button>
      }
    />
  ),
};

export const WithDocsLink: Story = {
  render: () => (
    <EmptyState
      icon={<Package className="size-10" />}
      title="Nenhum produto cadastrado"
      description={
        <>
          Comece criando seu primeiro produto.{' '}
          <a href="#" className="text-primary underline">
            Saiba mais sobre cadastro de produtos
          </a>
          .
        </>
      }
      action={
        <Button>
          <Plus className="size-4" /> Criar primeiro produto
        </Button>
      }
    />
  ),
};
```

- [ ] **Step 3: Validar e commitar**

```bash
cd OpenSea-APP && npm run storybook
# validar, encerrar
git -C OpenSea-APP add src/components/shared/empty-state.stories.tsx
git -C OpenSea-APP commit -m "feat(storybook): add EmptyState stories"
```

---

### Task 13: Story 7 — StatsCard

**Files:**

- Create: `OpenSea-APP/src/components/shared/stats-card.stories.tsx`

- [ ] **Step 1: Ler `stats-card.tsx`**

```bash
cat OpenSea-APP/src/components/shared/stats-card.tsx
```

- [ ] **Step 2: Escrever story**

Edit: `OpenSea-APP/src/components/shared/stats-card.stories.tsx`

(Template — adaptar à API real:)

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { StatsCard } from './stats-card';
import { TrendingUp, TrendingDown, Users, DollarSign } from 'lucide-react';

const meta = {
  title: 'Shared/StatsCard',
  component: StatsCard,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof StatsCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-80">
      <StatsCard
        title="Receita do mês"
        value="R$ 142.890,00"
        icon={<DollarSign className="size-5" />}
      />
    </div>
  ),
};

export const WithTrendUp: Story = {
  render: () => (
    <div className="w-80">
      <StatsCard
        title="Receita do mês"
        value="R$ 142.890,00"
        trend={{ value: 12.4, direction: 'up' }}
        icon={<TrendingUp className="size-5" />}
      />
    </div>
  ),
};

export const WithTrendDown: Story = {
  render: () => (
    <div className="w-80">
      <StatsCard
        title="Cancelamentos"
        value="34"
        trend={{ value: 8.2, direction: 'down' }}
        icon={<TrendingDown className="size-5" />}
      />
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <div className="w-80">
      <StatsCard
        title="Funcionários ativos"
        value={null}
        loading
        icon={<Users className="size-5" />}
      />
    </div>
  ),
};

export const InGrid: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="grid grid-cols-3 gap-4 p-6">
      <StatsCard
        title="Receita"
        value="R$ 142.890"
        icon={<DollarSign className="size-5" />}
      />
      <StatsCard
        title="Funcionários"
        value="48"
        icon={<Users className="size-5" />}
      />
      <StatsCard
        title="Crescimento"
        value="+12,4%"
        trend={{ value: 12.4, direction: 'up' }}
        icon={<TrendingUp className="size-5" />}
      />
    </div>
  ),
};
```

⚠️ Adaptar props ao componente real lido no step 1.

- [ ] **Step 3: Validar e commitar**

```bash
cd OpenSea-APP && npm run storybook
# validar, encerrar
git -C OpenSea-APP add src/components/shared/stats-card.stories.tsx
git -C OpenSea-APP commit -m "feat(storybook): add StatsCard stories with trends/loading/grid"
```

---

### Task 14: Story 8 — EntityGrid

**Files:**

- Create: `OpenSea-APP/src/components/shared/grid/entity-grid.stories.tsx`

- [ ] **Step 1: Ler `entity-grid.tsx` e identificar props**

```bash
head -100 OpenSea-APP/src/components/shared/grid/entity-grid.tsx
```

Expected: identificar props (`items`, `loading`, `error`, `onRowClick`, `toolbarStart`, `searchValue`, `onSearchChange`, etc.) — ajustar story à API real.

- [ ] **Step 2: Escrever story**

Edit: `OpenSea-APP/src/components/shared/grid/entity-grid.stories.tsx`

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { EntityGrid } from './entity-grid';
import { mockProducts } from '@/__fixtures__';
import { Button } from '@/components/ui/button';
import { Filter, Plus } from 'lucide-react';

const meta = {
  title: 'Shared/Grid/EntityGrid',
  component: EntityGrid,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof EntityGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

const wrap = (children: React.ReactNode) => (
  <div className="bg-background min-h-screen p-6">{children}</div>
);

export const Default: Story = {
  render: () =>
    wrap(
      <EntityGrid
        items={mockProducts(12)}
        // adaptar props demais conforme API real
      />
    ),
};

export const Loading: Story = {
  render: () => wrap(<EntityGrid items={[]} loading />),
};

export const Empty: Story = {
  render: () => wrap(<EntityGrid items={[]} />),
};

export const Error: Story = {
  render: () =>
    wrap(
      <EntityGrid items={[]} error={new Error('Falha ao carregar produtos')} />
    ),
};

export const WithFilters: Story = {
  render: () =>
    wrap(
      <EntityGrid
        items={mockProducts(8)}
        toolbarStart={
          <>
            <Button variant="outline" size="sm">
              <Filter className="size-4" /> Status
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="size-4" /> Categoria
            </Button>
          </>
        }
      />
    ),
};
```

⚠️ A API exata do EntityGrid pode diferir significativamente — adaptar para refletir o componente real. Stories que não rodam não vão pro repo.

- [ ] **Step 3: Validar e commitar**

```bash
cd OpenSea-APP && npm run storybook
# validar todos 5 estados (default/loading/empty/error/with filters)
git -C OpenSea-APP add src/components/shared/grid/entity-grid.stories.tsx
git -C OpenSea-APP commit -m "feat(storybook): add EntityGrid stories with all states"
```

---

### Task 15: Story 9 — EntityForm

**Files:**

- Create: `OpenSea-APP/src/components/shared/forms/entity-form.stories.tsx`

- [ ] **Step 1: Ler `entity-form.tsx`**

```bash
head -150 OpenSea-APP/src/components/shared/forms/entity-form.tsx
```

Expected: identificar props (campos config, validação, submit handler).

- [ ] **Step 2: Escrever story adaptada à API real**

Edit: `OpenSea-APP/src/components/shared/forms/entity-form.stories.tsx`

Stories esperadas:

- `Default` — form vazio
- `Editing` — form pré-preenchido com `mockProduct()`
- `WithValidationError` — força um erro de validação
- `Submitting` — estado loading
- `WithServerError` — mostra erro vindo do servidor

(Esqueleto — preencher conforme API descoberta no step 1):

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { EntityForm } from './entity-form';
import { mockProduct } from '@/__fixtures__';

const meta = {
  title: 'Shared/Forms/EntityForm',
  component: EntityForm,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof EntityForm>;

export default meta;
type Story = StoryObj<typeof meta>;

// Stories: Default, Editing, WithValidationError, Submitting, WithServerError
// Preencher conforme API real do EntityForm
```

- [ ] **Step 3: Validar e commitar**

```bash
cd OpenSea-APP && npm run storybook
git -C OpenSea-APP add src/components/shared/forms/entity-form.stories.tsx
git -C OpenSea-APP commit -m "feat(storybook): add EntityForm stories (default/editing/errors/submitting)"
```

---

### Task 16: Story 10 — EntityListPageTemplate (sintética)

**Files:**

- Create: `OpenSea-APP/.storybook/templates/EntityListPageTemplate.stories.tsx`

Esta é uma story sintética — não tem componente correspondente. Demonstra a composição completa do padrão `entity-list-layout-pattern.md`: PageLayout → PageHeader → PageActionBar → SearchBar → filters → EntityGrid → SelectionToolbar mockado.

- [ ] **Step 1: Criar pasta `templates/` se não existir**

Run:

```bash
mkdir -p OpenSea-APP/.storybook/templates
```

- [ ] **Step 2: Escrever a story**

Edit: `OpenSea-APP/.storybook/templates/EntityListPageTemplate.stories.tsx`

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { PageLayout } from '@/components/layout/page-layout';
import { PageHeader } from '@/components/layout/page-header';
import { PageActionBar } from '@/components/layout/page-action-bar';
import { SearchBar } from '@/components/layout/search-bar';
import { EntityGrid } from '@/components/shared/grid/entity-grid';
import { Button } from '@/components/ui/button';
import { mockProducts } from '@/__fixtures__';
import { Plus, Filter, Trash2 } from 'lucide-react';

const meta = {
  title: 'Pages/EntityListPageTemplate',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Template sintético — demonstra a composição canônica do padrão entity-list-layout-pattern.md. Use como referência ao criar páginas de listagem de novos módulos. Cada story representa um estado real da página.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

const Template = ({
  state = 'default',
  selectionCount = 0,
}: {
  state?: 'default' | 'loading' | 'empty' | 'error' | 'with-filters';
  selectionCount?: number;
}) => {
  const [search, setSearch] = useState('');
  const items =
    state === 'default' || state === 'with-filters' ? mockProducts(12) : [];

  return (
    <PageLayout>
      <PageActionBar>
        <Button size="sm" variant="outline">
          <Filter className="size-4" /> Filtros
        </Button>
        <Button size="sm">
          <Plus className="size-4" /> Novo produto
        </Button>
      </PageActionBar>
      <PageHeader
        config={{ title: 'Produtos', description: 'Catálogo da empresa.' }}
      />
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Buscar produtos..."
      />
      <EntityGrid
        items={items}
        loading={state === 'loading'}
        error={state === 'error' ? new Error('Falha ao carregar') : undefined}
        toolbarStart={
          state === 'with-filters' ? (
            <>
              <Button variant="outline" size="sm">
                Status: Ativos
              </Button>
              <Button variant="outline" size="sm">
                Categoria: Roupas
              </Button>
            </>
          ) : null
        }
      />
      {selectionCount > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 rounded-lg border bg-card p-3 shadow-lg flex items-center gap-3">
          <span className="text-sm">{selectionCount} selecionado(s)</span>
          <Button size="sm" variant="destructive">
            <Trash2 className="size-4" /> Excluir
          </Button>
        </div>
      )}
    </PageLayout>
  );
};

export const Default: Story = { render: () => <Template state="default" /> };
export const Loading: Story = { render: () => <Template state="loading" /> };
export const Empty: Story = { render: () => <Template state="empty" /> };
export const Error: Story = { render: () => <Template state="error" /> };
export const WithFilters: Story = {
  render: () => <Template state="with-filters" />,
};
export const WithSelection: Story = {
  render: () => <Template state="default" selectionCount={3} />,
};
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: () => <Template state="default" />,
};
export const Dark: Story = {
  parameters: { theme: 'dark' },
  render: () => <Template state="default" />,
};
```

⚠️ Componentes `PageLayout`, `SearchBar` e props do `EntityGrid` podem ter API diferente do template — ler o código real antes de finalizar a story (já feito implicitamente via Tasks 14 e 11). Se algum import falhar, **adaptar ao real**.

- [ ] **Step 3: Validar e commitar**

```bash
cd OpenSea-APP && npm run storybook
# navegar pra Pages/EntityListPageTemplate, validar 8 stories
git -C OpenSea-APP add .storybook/templates/EntityListPageTemplate.stories.tsx
git -C OpenSea-APP commit -m "feat(storybook): add EntityListPageTemplate synthetic page story"
```

---

### Task 17: Smoke test do MCP local

**Files:** N/A (validação)

- [ ] **Step 1: Subir Storybook**

```bash
cd OpenSea-APP && npm run storybook
```

- [ ] **Step 2: Testar endpoint MCP responde**

Em outro terminal:

```bash
curl -s http://localhost:6006/mcp -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

Expected: resposta JSON listando tools do MCP (ex: `listComponents`, `getComponent`, etc.).

Se retornar 404 ou erro, ler `node_modules/@storybook/addon-mcp/README.md` pra descobrir o endpoint/protocolo correto.

- [ ] **Step 3: Listar componentes via MCP**

```bash
curl -s http://localhost:6006/mcp -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"listComponents"}}'
```

Expected: resposta inclui os 10 componentes/templates: Button, Input + Form, Card, Dialog, PageHeader, EmptyState, StatsCard, EntityGrid, EntityForm, EntityListPageTemplate.

- [ ] **Step 4: Registrar MCP no settings local do Claude**

Edit (criar ou modificar): `OpenSea-APP/.mcp.json`

```jsonc
{
  "mcpServers": {
    "storybook-local": {
      "url": "http://localhost:6006/mcp",
    },
  },
}
```

- [ ] **Step 5: Smoke test em sessão Claude limpa**

Abrir nova sessão Claude Code dentro de `OpenSea-APP/`. Pedir: "liste os componentes que estão no Storybook via MCP".

Expected: agente responde com a lista dos 10. Se não, debug a config MCP.

- [ ] **Step 6: Commit do `.mcp.json`**

```bash
git -C OpenSea-APP add .mcp.json
git -C OpenSea-APP commit -m "feat(storybook): register local MCP server for Claude Code"
```

---

## Fase 2 — Deploy + Governança

### Task 18: Criar app Fly.io

**Files:** N/A (apenas chamadas Fly MCP)

- [ ] **Step 1: Verificar org Fly disponível**

Use Fly MCP: `mcp__flyctl__fly-orgs-list`.

Expected: identificar org pessoal (ex: `personal`).

- [ ] **Step 2: Criar app `opensea-storybook`**

Use Fly MCP: `mcp__flyctl__fly-apps-create` com:

- nome: `opensea-storybook`
- org: <da step 1>

Expected: app criado, hostname `opensea-storybook.fly.dev` reservado.

Se nome estiver tomado, tentar `opensea-storybook-${user-id}` ou similar.

- [ ] **Step 3: Anotar app name e URL no `storybook-pattern.md`**

Edit: `OpenSea-APP/docs/patterns/storybook-pattern.md` — atualizar seção MCP com URL real.

```bash
git -C OpenSea-APP add docs/patterns/storybook-pattern.md
git -C OpenSea-APP commit -m "docs(storybook): record Fly app name and URL"
```

---

### Task 19: Criar `Dockerfile.storybook` e `fly.storybook.toml`

**Files:**

- Create: `OpenSea-APP/Dockerfile.storybook`
- Create: `OpenSea-APP/fly.storybook.toml`
- Create: `OpenSea-APP/.dockerignore` (se não existir)

- [ ] **Step 1: Decidir estratégia de runtime baseado nos achados da Task 4**

Codex review identificou: **`storybook serve` não existe como comando**, e `storybook dev` é dev server (não recomendado pra produção). As duas estratégias possíveis:

- **Estratégia A — Static + serve (preferida):** se Task 4 confirmar que `addon-mcp` consegue expor `/mcp` lendo manifests pré-gerados, rodar `storybook build` + servir `storybook-static/` via `serve` (npm package `serve@latest`) ou nginx. Endpoint MCP precisa rodar como sidecar/middleware (ler docs do `addon-mcp` sobre modo standalone).
- **Estratégia B — Dev server em produção (fallback):** se MCP exige Vite middleware do dev server, aceitar rodar `storybook dev --ci --no-open` em container. Não-ideal mas viável; aumentar VM memory pra 1GB.

**Não escrever o Dockerfile antes de decidir** — depende do output da Task 4.

- [ ] **Step 2: Criar `Dockerfile.storybook` — Estratégia A (preferida)**

Edit: `OpenSea-APP/Dockerfile.storybook`

```dockerfile
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build-storybook -- -o /app/storybook-static

FROM node:22-alpine AS runner
WORKDIR /app
RUN npm install -g serve@latest
COPY --from=build /app/storybook-static ./storybook-static

EXPOSE 6006

# Estratégia A: serve static + addon-mcp em modo standalone (verificar README do addon
# pra confirmar suporte). Se /mcp não responder após deploy, mudar pra Estratégia B.
CMD ["serve", "-l", "6006", "-s", "storybook-static"]
```

- [ ] **Step 2-alt: Dockerfile — Estratégia B (fallback se /mcp exigir dev server)**

Apenas se Task 4 mostrar que `/mcp` só existe com dev server:

```dockerfile
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS runner
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Pré-aquecer build pra reduzir startup time
RUN npm run build-storybook -- -o /app/storybook-static || true

EXPOSE 6006

CMD ["npx", "storybook", "dev", "-p", "6006", "--ci", "--no-open"]
```

Memory pra Estratégia B: bumpar `fly.storybook.toml` pra `memory = "1024mb"`.

- [ ] **Step 3: Criar `fly.storybook.toml`**

Edit: `OpenSea-APP/fly.storybook.toml`

```toml
app = "opensea-storybook"
primary_region = "gru"

[build]
  dockerfile = "Dockerfile.storybook"

[http_service]
  internal_port = 6006
  force_https = true
  auto_stop_machines = "stop"
  auto_start_machines = true
  min_machines_running = 0

[[vm]]
  size = "shared-cpu-1x"
  memory = "512mb"
```

⚠️ Memory inicial em 512mb (mais folga pra dev server). Reduzir pra 256mb depois se observação confirmar uso baixo.

- [ ] **Step 4: Garantir `.dockerignore` com node_modules**

Edit: `OpenSea-APP/.dockerignore` (criar se não existir):

```
node_modules
.next
storybook-static
test-results
playwright-report
coverage
.git
```

- [ ] **Step 5: Commit**

```bash
git -C OpenSea-APP add Dockerfile.storybook fly.storybook.toml .dockerignore
git -C OpenSea-APP commit -m "feat(storybook): Dockerfile and Fly.io config for deployed MCP"
```

---

### Task 20: Deploy inicial via Fly MCP

**Files:** N/A (apenas chamadas Fly MCP)

- [ ] **Step 1: Deploy via `flyctl deploy` (não `machine run`)**

Codex review: `fly machine run` cria machines orfãs que não respeitam app lifecycle (releases, redeploys, scaling). Usar `flyctl deploy` mantém a app gerenciada normalmente.

Como a regra do projeto proíbe CLI `fly` em sessão interativa, executar via Bash com `flyctl deploy` apenas se o usuário explicitamente autorizar (one-off boot do app), OU usar via MCP se houver tool equivalente (`mcp__flyctl__fly-deploy` se existir; caso contrário, este step depende de autorização humana).

Comando de referência (se autorizado):

```bash
cd OpenSea-APP && flyctl deploy --config fly.storybook.toml --remote-only
```

Após este boot inicial, todos os redeploys subsequentes vão pela GitHub Action (Task 21), que usa `flyctl deploy` no CI sem violar a regra de sessão interativa.

Validar:

- Use Fly MCP `mcp__flyctl__fly-status` (não `fly-machine-status` solto) — confirma que app tem release.
- Use Fly MCP `mcp__flyctl__fly-apps-releases` — confirma release v1.

- [ ] **Step 2: Aguardar deploy + smoke test**

Use Fly MCP `mcp__flyctl__fly-machine-status` ou `fly-status` pra confirmar healthy.

Run:

```bash
curl -i https://opensea-storybook.fly.dev/
curl -s -X POST https://opensea-storybook.fly.dev/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

Expected:

- `/` retorna HTML do Storybook
- `/mcp` retorna lista de tools

Se falhar, debugar via `mcp__flyctl__fly-logs`.

- [ ] **Step 3: Validar auto-stop**

Esperar 5min sem requests. Use Fly MCP `mcp__flyctl__fly-machine-status` — máquina deve estar em `stopped`. Fazer request — máquina sobe automaticamente.

- [ ] **Step 4: Atualizar `.mcp.json` com URL deployed**

Edit: `OpenSea-APP/.mcp.json`

```jsonc
{
  "mcpServers": {
    "storybook-local": {
      "url": "http://localhost:6006/mcp",
    },
    "storybook-deployed": {
      "url": "https://opensea-storybook.fly.dev/mcp",
    },
  },
}
```

- [ ] **Step 5: Commit**

```bash
git -C OpenSea-APP add .mcp.json
git -C OpenSea-APP commit -m "feat(storybook): register deployed MCP server (Fly.io fallback)"
```

---

### Task 21: GitHub Action de redeploy

**Files:**

- Create: `OpenSea-APP/.github/workflows/storybook-deploy.yml`

- [ ] **Step 1: Criar workflow**

Edit: `OpenSea-APP/.github/workflows/storybook-deploy.yml`

```yaml
name: Storybook Deploy

on:
  push:
    branches: [main]
    paths:
      - 'OpenSea-APP/src/components/**'
      - 'OpenSea-APP/.storybook/**'
      - 'OpenSea-APP/Dockerfile.storybook'
      - 'OpenSea-APP/fly.storybook.toml'
      - 'OpenSea-APP/package.json'
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: OpenSea-APP
    steps:
      - uses: actions/checkout@v4
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --config fly.storybook.toml --remote-only
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

- [ ] **Step 2: Configurar secret `FLY_API_TOKEN`**

Manual: usuário precisa rodar `flyctl auth token` localmente e copiar o token. Adicionar como secret no repo (GitHub Settings → Secrets → Actions). **Esta etapa requer ação humana** — documentar no commit message.

- [ ] **Step 3: Commit do workflow**

```bash
git -C OpenSea-APP add .github/workflows/storybook-deploy.yml
git -C OpenSea-APP commit -m "ci(storybook): redeploy on push to main with paths matching"
```

- [ ] **Step 4: Trigger manual + validar**

Após FLY_API_TOKEN configurado: rodar `workflow_dispatch` no GitHub UI. Confirmar deploy passa e Fly.io recebe nova versão.

---

### Task 22: Pre-commit lint warn de cobertura

**Files:**

- Create: `OpenSea-APP/scripts/check-storybook-coverage.mjs`
- Modify: `OpenSea-APP/.husky/pre-commit`
- Modify: `OpenSea-APP/package.json` (adicionar script)

- [ ] **Step 1: Criar script de check**

Edit: `OpenSea-APP/scripts/check-storybook-coverage.mjs`

```js
#!/usr/bin/env node
/**
 * Pre-commit warn: avisa em dois casos (warn-only, não bloqueia commit):
 *   1. Componente NOVO (added) em ui/shared/layout sem .stories.tsx novo no mesmo commit
 *   2. Componente MODIFICADO (modified) cuja .stories.tsx existe mas não foi atualizada
 *      no mesmo commit (sinal de drift entre componente e catálogo)
 */
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

// AM = Added or Modified — pega ambos os casos
const stagedFiles = execSync('git diff --cached --name-only --diff-filter=AM', {
  encoding: 'utf-8',
})
  .split('\n')
  .filter(Boolean);

const watchedPaths = [
  'src/components/ui/',
  'src/components/shared/',
  'src/components/layout/',
];

const candidates = stagedFiles.filter(f => {
  if (!f.endsWith('.tsx')) return false;
  if (f.endsWith('.stories.tsx')) return false;
  if (f.endsWith('.test.tsx')) return false;
  if (f.endsWith('.spec.tsx')) return false;
  return watchedPaths.some(p => f.startsWith(p));
});

const missingNew = []; // componente novo sem story
const staleStory = []; // componente modificado, story existe mas não staged

for (const f of candidates) {
  const storyPath = f.replace(/\.tsx$/, '.stories.tsx');
  const storyExistsOnDisk = existsSync(path.resolve(process.cwd(), storyPath));
  const storyStaged = stagedFiles.includes(storyPath);

  if (!storyExistsOnDisk && !storyStaged) {
    missingNew.push(f);
  } else if (storyExistsOnDisk && !storyStaged) {
    // Componente modificado mas story não atualizada — possível drift
    staleStory.push({ component: f, story: storyPath });
  }
}

if (missingNew.length > 0 || staleStory.length > 0) {
  console.log('');
  console.log('⚠️  Storybook coverage warning:');

  if (missingNew.length > 0) {
    console.log('   Componentes novos sem story correspondente:');
    for (const f of missingNew) console.log(`     - ${f}`);
    console.log('');
  }

  if (staleStory.length > 0) {
    console.log(
      '   Componentes modificados cuja story existe mas não foi atualizada (possível drift):'
    );
    for (const { component, story } of staleStory) {
      console.log(`     - ${component} (story: ${story})`);
    }
    console.log('');
  }

  console.log(
    '   Regra D do projeto: todo componente em ui/, shared/ ou layout/ tem story'
  );
  console.log(
    '   junto, e modificações no componente exigem revisar a story no mesmo PR.'
  );
  console.log('   (Aviso warn-only — commit prossegue.)');
  console.log('');
}

process.exit(0);
```

- [ ] **Step 2: Marcar script como executável e adicionar entry no Husky**

Run:

```bash
chmod +x OpenSea-APP/scripts/check-storybook-coverage.mjs
```

Edit: `OpenSea-APP/.husky/pre-commit` — adicionar linha (antes de `lint-staged`):

```sh
node scripts/check-storybook-coverage.mjs
```

- [ ] **Step 3: Adicionar npm script (conveniência)**

Edit: `OpenSea-APP/package.json` — adicionar em `scripts`:

```jsonc
{
  "scripts": {
    "storybook:coverage": "node scripts/check-storybook-coverage.mjs",
  },
}
```

- [ ] **Step 4: Smoke test**

Criar um arquivo dummy `OpenSea-APP/src/components/ui/dummy.tsx` (export const) e rodar `git add` + tentar commit. Confirmar warning aparece. Reverter:

```bash
rm OpenSea-APP/src/components/ui/dummy.tsx
git -C OpenSea-APP reset
```

- [ ] **Step 5: Commit**

```bash
git -C OpenSea-APP add scripts/check-storybook-coverage.mjs .husky/pre-commit package.json
git -C OpenSea-APP commit -m "feat(storybook): pre-commit warn for new components without stories"
```

---

### Task 23: A11y CI gate bloqueante

**Files:**

- Modify: `OpenSea-APP/vitest.config.ts`
- Modify: principal CI workflow (descobrir nome lendo `OpenSea-APP/.github/workflows/`)

- [ ] **Step 1: Localizar CI principal**

Run:

```bash
ls OpenSea-APP/.github/workflows/
```

Expected: identificar o workflow que roda Vitest/lint hoje (provavelmente algo como `ci.yml` ou `test.yml`).

- [ ] **Step 2: Adicionar Storybook como project no Vitest**

Edit: `OpenSea-APP/vitest.config.ts` — adicionar workspace ou referenciar o config gerado pelo `addon-vitest`:

(O `@storybook/addon-vitest` cria `vitest.shims.d.ts` e injeta config automaticamente; verificar README do addon. Comando típico de install:)

```bash
cd OpenSea-APP && npx storybook add @storybook/addon-vitest
```

Expected: addon adiciona um project no `vitest.config.ts` ou cria `vitest.workspace.ts`.

- [ ] **Step 3: Validar localmente**

```bash
cd OpenSea-APP && npx vitest run --project=storybook
```

Expected: roda os 10 stories como testes, valida render + a11y. Falha se houver violações `serious`/`critical`.

- [ ] **Step 4: Adicionar step ao CI principal**

Edit: `OpenSea-APP/.github/workflows/<ci-principal>.yml` — adicionar step após o teste regular:

```yaml
- name: Storybook a11y tests
  working-directory: OpenSea-APP
  run: npx vitest run --project=storybook
```

- [ ] **Step 5: Smoke test**

Push para branch de teste, validar PR fica vermelho se a11y violation. Voltar.

- [ ] **Step 6: Commit**

```bash
git -C OpenSea-APP add vitest.config.ts vitest.workspace.ts package.json package-lock.json .github/workflows/<ci-principal>.yml
git -C OpenSea-APP commit -m "ci(storybook): block PRs on a11y violations via addon-vitest"
```

---

### Task 24: Documentar governança

**Files:**

- Modify: `OpenSea-APP/CLAUDE.md`
- Modify: `OpenSea-APP/docs/guides/developer-golden-rules.md`

- [ ] **Step 1: Atualizar `CLAUDE.md` com referência ao Storybook**

Edit: `OpenSea-APP/CLAUDE.md` — encontrar seção apropriada (ex: "Frontend Patterns" ou "Key Files") e adicionar:

```markdown
### Storybook (Catálogo de componentes)

- **Local:** `npm run storybook` → http://localhost:6006 (UI + MCP em /mcp)
- **Deployed:** https://opensea-storybook.fly.dev (auto-stop quando ocioso)
- **Convenções:** [docs/patterns/storybook-pattern.md](./docs/patterns/storybook-pattern.md)
- **Regra:** todo componente novo em `components/ui/`, `components/shared/` ou `components/layout/` precisa de `.stories.tsx` no mesmo PR. Hook pre-commit avisa se faltar.
- **Infra:** `.storybook/`, `Dockerfile.storybook`, `fly.storybook.toml`, `.github/workflows/storybook-deploy.yml`
```

- [ ] **Step 2: Atualizar `developer-golden-rules.md`**

Edit: `OpenSea-APP/docs/guides/developer-golden-rules.md` — adicionar regra:

```markdown
## Storybook coverage

Todo componente novo (ou modificado significativamente) em `components/ui/`, `components/shared/` ou `components/layout/` precisa ter um `.stories.tsx` co-localizado no mesmo PR. Componentes específicos de módulo (`components/<modulo>/...`) não exigem story por default — só catalogar quando o padrão se repete em 3+ módulos.

Por quê: o Storybook é o catálogo vivo do "design system" do app. Sem story, agentes (Claude) não conseguem consultar componente via MCP, e o padrão acaba sendo replicado errado em outras páginas.

Verificar via: `npm run storybook:coverage` (também roda como pre-commit warn).
```

- [ ] **Step 3: Commit**

```bash
git -C OpenSea-APP add CLAUDE.md docs/guides/developer-golden-rules.md
git -C OpenSea-APP commit -m "docs(storybook): governance rules in CLAUDE.md and developer-golden-rules"
```

---

## Fase 3 — Validação final + handoff

### Task 25: Smoke E2E completo

**Files:** N/A

- [ ] **Step 1: Subir Storybook local**

```bash
cd OpenSea-APP && npm run storybook
```

- [ ] **Step 2: Smoke test agente — lookup**

Em sessão Claude Code limpa, dentro de `OpenSea-APP/`:

- Pedir: "consulte o MCP do Storybook e me liste todos os componentes catalogados"
- Validar: agente retorna 10 componentes/templates

- [ ] **Step 3: Smoke test agente — uso na criação**

Pedir ao agente: "preciso criar a página de listagem de fornecedores em `src/app/(dashboard)/(modules)/stock/suppliers/page.tsx`. Use o template `EntityListPageTemplate` como referência via MCP."

Validar:

- Agente consulta o MCP
- Cria página seguindo o template
- Resultado é consistente com `entity-list-layout-pattern.md`

- [ ] **Step 4: Smoke test deployed**

Parar Storybook local. Em outra sessão Claude:

- Pedir: "consulte o MCP do Storybook deployed e me mostre as variantes do Button"
- Validar: agente acessa Fly.io, retorna lista

(Cold start de até 5s aceitável.)

- [ ] **Step 5: Marcar Fase 1+2 completa**

Sem commit (validação). Reportar resultado ao usuário.

---

### Task 26: Atualizar memory + spec com observações finais

**Files:**

- Modify: `C:\Users\guilh\.claude\projects\D--Code-Projetos-OpenSea\memory\MEMORY.md`
- Create: `C:\Users\guilh\.claude\projects\D--Code-Projetos-OpenSea\memory\project_storybook_mcp.md`

- [ ] **Step 1: Criar memory file de projeto**

Edit: `memory/project_storybook_mcp.md`

```markdown
---
name: Storybook + MCP adoção
description: Storybook 10+ instalado em OpenSea-APP como pseudo design system, com MCP exposto via Fly.io
type: project
---

Storybook + MCP foi adotado em OpenSea-APP em 2026-04-30. Catálogo vivo de componentes ui/shared/layout exposto via MCP pra agentes consultarem antes de criar páginas.

## Why

Inconsistência da IA ao replicar padrões existentes (botões, formulários, listagens). Storybook expõe o "vocabulário visual" via endpoint queryável.

## How to apply

- Sempre que for criar nova página/componente em `components/ui/`, `components/shared/` ou `components/layout/`, **consultar primeiro** o MCP Storybook (local ou deployed) pra ver o que já existe.
- Toda story nova vai junto com o componente no mesmo PR.
- A11y é gate bloqueante — PR vermelho se violação serious/critical.

## State

- Local: `npm run storybook` em OpenSea-APP/ → http://localhost:6006/mcp
- Deployed: https://opensea-storybook.fly.dev/mcp
- Stories iniciais (10): Button, Input+Form, Card, Dialog, PageHeader+PageActionBar, EmptyState, StatsCard, EntityGrid, EntityForm, EntityListPageTemplate
- Spec: `OpenSea-APP/docs/superpowers/specs/2026-04-30-storybook-mcp-adoption-design.md`
- Plan: `OpenSea-APP/docs/superpowers/plans/2026-04-30-storybook-mcp-adoption-plan.md`
```

- [ ] **Step 2: Adicionar pointer no MEMORY.md**

Edit: `memory/MEMORY.md` — adicionar linha em "🚀 Ativo agora":

```markdown
- **Storybook + MCP adotado 2026-04-30** → [project_storybook_mcp.md](project_storybook_mcp.md) — Storybook 10+ catalogando 10 componentes-template (ui+shared+layout+page templates). MCP exposto local + Fly.io. A11y CI gate bloqueante. Rule D: novo componente em ui/shared/layout precisa story no mesmo PR.
```

- [ ] **Step 3: Sem commit no repo OpenSea-APP**

Memory files vivem fora do repo (em `~/.claude/projects/`). Não há commit aqui.

---

## Self-review

(executado pela Claude após escrever o plano)

**1. Spec coverage:**

- ✅ Foundation (Storybook + MCP + 10 stories) — Tasks 1–17
- ✅ Deploy Fly.io — Tasks 18–20
- ✅ GitHub Action — Task 21
- ✅ Lint warn de cobertura — Task 22
- ✅ A11y CI gate bloqueante — Task 23
- ✅ Governança documentada — Task 24
- ✅ Smoke E2E — Task 25
- ✅ Memory + handoff — Task 26
- ✅ 5 questões abertas — Task 4 (gate antes de stories)
- ✅ Achado deprecated EntityListPage — registrado no spec; não vira story

**2. Placeholder scan:** Stories 8, 9, 11, 12, 13 têm `⚠️ Adaptar à API real` — isso é intencional e não placeholder: a API exata só é conhecida lendo o código no momento da execução, e cada Task tem step explícito de leitura antes da escrita. Step 1 de cada uma dessas tasks já dá o comando exato.

**3. Type consistency:** Mock factories `mockProduct`/`mockProducts` consistentes entre Tasks 5, 14, 15, 16. Imports de `@/__fixtures__` consistentes.

**4. Comandos unix shell vs Windows:** Plano usa Unix shell (regra do environment do Claude Code). Usuário/agente em Windows pode precisar adaptar `mkdir -p`, `chmod +x` — anotar.

---

## Execution handoff

Plan complete. **Stack envolve mudanças de infra (Fly.io, GitHub Actions) e configuração de tooling crítico (Vitest config, Husky)** — não é refactor pequeno. Recomendação:

- **Fase 1 (Tasks 1–17):** executar **inline** (`superpowers:executing-plans`) com checkpoint humano após Task 4 (gate de questões abertas) e após Task 17 (smoke MCP local). Inline é melhor aqui porque cada story exige leitura do componente real e adaptação fina — subagents fresh perderiam contexto entre stories.

- **Fase 2 (Tasks 18–24):** pode ser **subagent-driven** (`superpowers:subagent-driven-development`) — cada task é independente (Fly app, Dockerfile, GitHub Action, Husky, a11y gate, docs), produz PR atômico, e o agente principal revisa cada um.

- **Fase 3 (Tasks 25–26):** validação manual + memory update (inline rápido).

**Tempo total estimado:** 5-7 dias (Fase 1: 3-4 dias; Fase 2: 1-2 dias; Fase 3: < 1 dia).
