# Module: Central (Frontend)

## Overview

O módulo Central é a área administrativa exclusiva para super administradores do OpenSea. Ele oferece uma interface isolada — com tema visual próprio, layout dedicado e guarda de acesso — para gerenciar empresas (tenants), planos de assinatura, usuários e feature flags do sistema.

O módulo está organizado sob o route group `(central)` e é completamente separado do route group `(dashboard)` utilizado pelos usuários comuns. Nenhuma rota do Central é acessível sem a flag `isSuperAdmin: true` no JWT.

**Dependências com outros módulos:**

- `auth/` — `AuthContext` fornece `isSuperAdmin`, `user`, `logout`
- Backend Admin API — `/v1/admin/*` (requer `verifySuperAdmin`)
- `contexts/central-theme-context.tsx` — tema independente do tema global

---

## Route Structure

### Route Tree

```
/central                            # Dashboard administrativo com KPIs e gráficos
/central/tenants                    # Lista paginada de empresas (busca + filtro de status)
/central/tenants/new                # Wizard de 3 passos para criar nova empresa
/central/tenants/[id]               # Detalhe da empresa (abas: Informações, Usuários, Plano, Flags)
/central/plans                      # Grade de planos de assinatura
/central/plans/new                  # Formulário de criação de plano + módulos
/central/plans/[id]                 # Edição de plano (dados, limites, módulos)
```

### Layout Hierarchy

```
(central)/layout.tsx                # SuperAdminGuard + CentralThemeProvider
  ├── AnimatedBackground            # Gradiente de fundo adaptável ao tema
  ├── CentralNavbar                 # Barra superior com logo, tema, usuário
  ├── CentralSidebar                # Sidebar colapsável (Desktop) / Drawer (Mobile)
  └── <main>                        # Conteúdo da página (max-w-[1600px])
      ├── error.tsx                 # Error boundary do grupo (central)
      ├── loading.tsx               # Skeleton global de carregamento
      └── central/...               # Páginas específicas
```

Todas as páginas do módulo utilizam os componentes de glassmorphism da biblioteca interna `src/components/central/` em vez dos componentes shadcn/ui padrão, garantindo consistência visual dentro do tema Central.

---

## Page Structure

### Component Tree por Página

#### `/central` — Dashboard

```
CentralDashboardPage
  ├── PageBreadcrumb               # Breadcrumb: "Central"
  ├── StatCard (x4)                # KPIs: Total Empresas, Total Usuários, Planos Ativos, MRR
  ├── GlassCard (Crescimento Mensal)
  │   └── LineChart (Recharts)     # Crescimento mensal de empresas (monthlyGrowth[])
  ├── GlassCard (Empresas por Plano)
  │   └── BarChart (Recharts)      # Distribuição de tenants por tier
  ├── GlassCard (Status das Empresas)
  │   └── PieChart donut (Recharts) # Donut: ACTIVE / INACTIVE / SUSPENDED
  └── GlassCard (Atividade Recente)
      └── lista de RecentActivity  # Feed de até 5 eventos recentes (scroll)
```

Os dados são carregados via `useDashboardStats()` em uma única chamada (`GET /v1/admin/dashboard`). As cores de gráfico são determinadas por mapas estáticos (`TIER_COLORS`, `STATUS_COLORS`) definidos inline na página.

#### `/central/tenants` — Lista de Empresas

```
TenantsListPage
  ├── GlassInput (busca)           # Debounce 300ms; reseta para página 1
  ├── <select> (filtro de status)  # ACTIVE / INACTIVE / SUSPENDED
  ├── GlassButton "Limpar"         # Aparece quando há filtros ativos
  ├── GlassTable                   # Colunas: Empresa, Slug, Status, Criado em, Ações
  │   ├── GlassBadge (status)      # success/warning/error por status
  │   └── GlassButton (Eye)        # Navega para /central/tenants/[id]
  └── Paginação (ChevronLeft/Right) # Exibida apenas quando totalPages > 1
```

A busca usa debounce de 300ms. A alteração de `statusFilter` reinicia a paginação para a primeira página. Dados via `useAdminTenants(page, limit, search, status)`.

#### `/central/tenants/new` — Nova Empresa (Wizard)

```
NewTenantPage
  ├── ProgressSteps (3 etapas)     # Indicador visual de progresso com ícones
  ├── Etapa 0: Dados Básicos
  │   ├── GlassInput (Nome *)
  │   ├── GlassInput (Slug — opcional)
  │   ├── GlassInput (URL do Logo — opcional)
  │   └── GlassSelect (Status)
  ├── Etapa 1: Plano
  │   └── Grade de GlassCard clicáveis (um por plano ativo)
  │       └── Exibe: nome, tier, preço, maxUsers, maxWarehouses, maxProducts
  └── Etapa 2: Usuário Proprietário (opcional)
      ├── GlassInput (Email)
      ├── GlassInput (Username — opcional)
      └── GlassInput (Senha)
```

O fluxo de submissão executa as operações em sequência:

1. `useCreateTenant()` — cria a empresa
2. `useChangeTenantPlan()` — atribui plano se selecionado
3. `useCreateTenantUser()` — cria usuário proprietário se e-mail/senha preenchidos

Cada etapa subsequente pode ser pulada (plano e usuário são opcionais). Em caso de falha parcial (empresa criada mas plano ou usuário com erro), toasts individuais informam o que foi criado e o que falhou.

#### `/central/tenants/[id]` — Detalhe da Empresa

```
TenantDetailPage
  ├── GlassButton Voltar           # → /central/tenants
  ├── GlassButton Desativar        # Confirmação nativa; chama useDeleteTenant()
  ├── GlassButton Salvar           # Persiste name, slug, logoUrl
  ├── GlassBadge (status)          # Exibido no cabeçalho
  ├── StatCards (3)                # Total Usuários, Plano Atual, Data de Criação
  └── Tabs (shadcn/ui)
      ├── Tab "Informações"
      │   └── GlassCard com formulário: nome, slug, logoUrl, status
      ├── Tab "Usuários"
      │   ├── Dialog "Novo Usuário"  # Cria usuário via useCreateTenantUser()
      │   └── Lista de GlassCard por usuário
      │       ├── GlassBadge (owner/member)
      │       ├── GlassButton KeyRound  # Abre Dialog de chave de segurança
      │       └── GlassButton Trash2    # Remove usuário (não-owners)
      ├── Tab "Plano"
      │   └── GlassCard com Select de planos (useChangeTenantPlan)
      └── Tab "Flags"
          ├── GlassCard por categoria (core, stock, sales, hr, experimental)
          │   └── Switch por flag do sistema (useManageFeatureFlags)
          └── GlassCard "Customizadas"
              ├── Lista de flags customizadas com Switch
              └── GlassInput + GlassButton "Adicionar Flag"
```

O dialog de chave de segurança permite ao super admin definir ou remover a chave de segurança de um usuário. Quando a chave é definida, o usuário pode digitá-la na barra de busca do gerenciador de arquivos para revelar itens ocultos (funcionalidade do módulo Storage).

#### `/central/plans` — Lista de Planos

```
PlansListPage
  ├── GlassButton "Novo Plano"     # → /central/plans/new
  └── Grade de GlassCard (por plano)
      ├── GlassBadge (tier)        # FREE/STARTER/PROFESSIONAL/ENTERPRISE
      ├── Nome e Preço             # "R$ 99,90/mês" ou "Grátis"
      ├── maxUsers, maxWarehouses, maxProducts
      ├── GlassBadge Ativo/Inativo
      └── GlassButton Editar       # → /central/plans/[id]
```

Dados via `useAdminPlans()`. Estado vazio exibe card centralizado com botão de criação.

#### `/central/plans/new` — Novo Plano

```
NewPlanPage
  ├── GlassCard Informações
  │   ├── GlassInput (Nome *)
  │   ├── GlassSelect (Tier)
  │   ├── GlassTextarea (Descrição)
  │   ├── GlassInput (Preço)
  │   └── Switch (Ativo)
  └── Coluna direita
      ├── GlassCard Limites
      │   ├── GlassInput (maxUsers)
      │   ├── GlassInput (maxWarehouses)
      │   └── GlassInput (maxProducts)
      └── GlassCard Módulos
          └── Checkbox por módulo (14 módulos disponíveis)
              └── NOTIFICATIONS: desabilitado com Tooltip "em breve"
```

Após criação, chama `useSetPlanModules()` automaticamente se houver módulos selecionados.

#### `/central/plans/[id]` — Editar Plano

```
EditPlanPage
  ├── GlassButton Voltar
  ├── GlassButton Desativar Plano (useDeletePlan)
  ├── GlassButton Salvar Alterações
  ├── GlassCard Informações (col-span-2)
  │   ├── GlassInput (Nome, Preço)
  │   ├── Select Tier (shadcn)
  │   ├── Textarea Descrição (shadcn)
  │   └── Switch Ativo
  ├── GlassCard Resumo (sidebar)
  │   └── Valor mensal, status, tier
  ├── GlassCard Limites
  │   ├── GlassInput (maxUsers, maxWarehouses, maxProducts)
  │   └── Quick Stats (ícones com valores)
  └── GlassCard Módulos
      └── Grid de toggles clicáveis (div + checkbox visualmente personalizado)
```

---

## Components

### Biblioteca de Glassmorphism (`src/components/central/`)

Todos os componentes do Central utilizam CSS design tokens definidos em `src/app/(central)/central.css` para adaptar automaticamente ao tema `light` ou `dark-blue`.

| Componente                                                                                                   | Props Principais                                                                                        | Responsabilidade                                                                               |
| ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `GlassCard`                                                                                                  | `variant?: 'default'\|'subtle'\|'strong'\|'gradient'`, `hover?: boolean`                                | Container com efeito glassmorphism; base de todos os cards do Central                          |
| `GlassButton`                                                                                                | `variant?: 'primary'\|'secondary'\|'ghost'\|'danger'`, `size?: 'sm'\|'md'\|'lg'`, `isLoading?: boolean` | Botão com glassmorphism; suporte a estado de carregamento com spinner                          |
| `GlassBadge`                                                                                                 | `variant?: 'success'\|'warning'\|'error'\|'info'\|'default'`                                            | Badge pill colorido; adapta cores ao tema                                                      |
| `GlassInput`                                                                                                 | `icon?: ReactNode` (slot opcional)                                                                      | Campo de texto com estilo glassmorphism                                                        |
| `GlassTextarea`                                                                                              | padrão HTML                                                                                             | Área de texto com estilo glassmorphism                                                         |
| `GlassSelect` + `GlassSelectTrigger` + `GlassSelectContent` + `GlassSelectItem` + `GlassSelectValue`         | —                                                                                                       | Select completo com glassmorphism (baseado em Radix)                                           |
| `GlassTable` + `GlassTableHeader` + `GlassTableHead` + `GlassTableBody` + `GlassTableRow` + `GlassTableCell` | —                                                                                                       | Tabela completa com glassmorphism                                                              |
| `GlassContainer`                                                                                             | `variant?: 'default'\|'strong'`                                                                         | Container genérico (usado em dropdowns e drawers)                                              |
| `GlassConfirmDialog`                                                                                         | `title, description, onConfirm, onCancel`                                                               | Dialog de confirmação com estilo glassmorphism                                                 |
| `StatCard`                                                                                                   | `label, value, icon: LucideIcon, trend?, color?, isLoading?`                                            | Card de KPI com gradiente de acento e animação hover                                           |
| `AnimatedBackground`                                                                                         | —                                                                                                       | Fundo fixo com gradientes radiais estáticos (adapta tonalidade ao tema)                        |
| `CentralNavbar`                                                                                              | —                                                                                                       | Barra superior: logo, toggle de tema, "Voltar ao app", dropdown de usuário, drawer mobile      |
| `CentralSidebar`                                                                                             | —                                                                                                       | Sidebar colapsável (desktop): Dashboard, Empresas, Planos; estado persistido em `localStorage` |

### `CentralNavbar`

- **Responsabilidade:** Barra de navegação superior exclusiva do Central
- **Funcionalidades:** Logo com link para `/central`, botão de toggle de tema (Moon/Sun), link "Voltar ao app" (`/select-tenant`), dropdown de usuário (e-mail + logout), drawer mobile (Sheet do shadcn/ui) com os itens da sidebar
- **Usado em:** `(central)/layout.tsx`

### `CentralSidebar`

- **Responsabilidade:** Navegação lateral colapsável (apenas desktop — `hidden md:block`)
- **Itens:** Dashboard (`/central`), Empresas (`/central/tenants`), Planos (`/central/plans`)
- **Estado:** colapso persistido em `localStorage` com chave `central-sidebar-collapsed`
- **Item ativo:** detectado via `usePathname()` com correspondência exata para `/central` e `startsWith` para demais rotas
- **Usado em:** `(central)/layout.tsx`

### `SuperAdminGuard`

- **Localização:** `src/components/auth/super-admin-guard.tsx`
- **Responsabilidade:** Guarda de acesso — redireciona para `/fast-login` se não autenticado, para `/` se autenticado mas não for super admin
- **Usado em:** `(central)/layout.tsx` (envolve todo o conteúdo)

---

## Hooks

Todos os hooks do módulo Central estão em `src/hooks/admin/use-admin.ts`.

### Query Keys

```typescript
adminKeys.dashboard(); // ['admin', 'dashboard']
adminKeys.tenants(); // ['admin', 'tenants']
adminKeys.tenant(id); // ['admin', 'tenant', id]
adminKeys.tenantUsers(id); // ['admin', 'tenant-users', id]
adminKeys.tenantFlags(id); // ['admin', 'tenant-flags', id]
adminKeys.plans(); // ['admin', 'plans']
adminKeys.plan(id); // ['admin', 'plan', id]
```

### Hooks de Dashboard

| Hook                  | Query Key               | Endpoint                  | Notas                     |
| --------------------- | ----------------------- | ------------------------- | ------------------------- |
| `useDashboardStats()` | `adminKeys.dashboard()` | `GET /v1/admin/dashboard` | Sem staleTime configurado |

### Hooks de Empresas (Tenants)

| Hook                                             | Query Key                                     | Endpoint                                                       | Notas                                     |
| ------------------------------------------------ | --------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------- |
| `useAdminTenants(page, limit, search?, status?)` | `[...tenants(), page, limit, search, status]` | `GET /v1/admin/tenants`                                        | —                                         |
| `useAdminTenantDetails(id)`                      | `adminKeys.tenant(id)`                        | `GET /v1/admin/tenants/:id`                                    | `enabled: !!id`                           |
| `useAdminTenantUsers(id)`                        | `adminKeys.tenantUsers(id)`                   | `GET /v1/admin/tenants/:id/users`                              | `enabled: !!id`                           |
| `useAdminTenantFlags(id)`                        | `adminKeys.tenantFlags(id)`                   | `GET /v1/admin/tenants/:id/feature-flags`                      | `enabled: !!id`                           |
| `useCreateTenant()`                              | —                                             | `POST /v1/admin/tenants`                                       | Invalida `tenants()`                      |
| `useUpdateTenant()`                              | —                                             | `PUT /v1/admin/tenants/:id`                                    | Invalida `tenant(id)` e `tenants()`       |
| `useDeleteTenant()`                              | —                                             | `DELETE /v1/admin/tenants/:id`                                 | Invalida `tenants()`                      |
| `useChangeTenantStatus()`                        | —                                             | `PATCH /v1/admin/tenants/:id/status`                           | Invalida `tenant(id)` e `tenants()`       |
| `useChangeTenantPlan()`                          | —                                             | `PUT /v1/admin/tenants/:id/plan`                               | Invalida `tenant(id)` e `tenants()`       |
| `useManageFeatureFlags()`                        | —                                             | `PUT /v1/admin/tenants/:id/feature-flags`                      | Invalida `tenant(id)` e `tenantFlags(id)` |
| `useCreateTenantUser()`                          | —                                             | `POST /v1/admin/tenants/:id/users`                             | Invalida `tenantUsers(id)`                |
| `useRemoveTenantUser()`                          | —                                             | `DELETE /v1/admin/tenants/:id/users/:userId`                   | Invalida `tenantUsers(tenantId)`          |
| `useSetUserSecurityKey()`                        | —                                             | `PATCH /v1/admin/tenants/:tenantId/users/:userId/security-key` | Sem invalidação de cache                  |

### Hooks de Planos

| Hook                  | Query Key            | Endpoint                          | Notas                           |
| --------------------- | -------------------- | --------------------------------- | ------------------------------- |
| `useAdminPlans()`     | `adminKeys.plans()`  | `GET /v1/admin/plans`             | —                               |
| `useAdminPlan(id)`    | `adminKeys.plan(id)` | `GET /v1/admin/plans/:id`         | `enabled: !!id`                 |
| `useCreatePlan()`     | —                    | `POST /v1/admin/plans`            | Invalida `plans()`              |
| `useUpdatePlan()`     | —                    | `PUT /v1/admin/plans/:id`         | Invalida `plan(id)` e `plans()` |
| `useDeletePlan()`     | —                    | `DELETE /v1/admin/plans/:id`      | Invalida `plans()`              |
| `useSetPlanModules()` | —                    | `PUT /v1/admin/plans/:id/modules` | Invalida `plan(id)`             |

---

## Types

Os tipos do módulo Central estão distribuídos em dois locais:

### `src/types/admin/` — Tipos de domínio

| Arquivo              | Interface/Type              | Descrição                                             |
| -------------------- | --------------------------- | ----------------------------------------------------- |
| `tenant.types.ts`    | `UserTenant`                | Tenant com papel do usuário (para seleção de empresa) |
| `tenant.types.ts`    | `SelectTenantResponse`      | Resposta de seleção de tenant: `{ token, tenant }`    |
| `dashboard.types.ts` | `Module` / `SearchResult`   | Tipos frontend-only do dashboard principal            |
| `dashboard.types.ts` | `Notification` (deprecated) | Legado; substituir por `BackendNotification`          |
| `dashboard.types.ts` | `BackendNotification`       | Notificação alinhada com o backend                    |

### `src/schemas/admin.schemas.ts` — Schemas Zod (validação runtime)

| Schema / Type              | Campos Principais                                                                                                           |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------- |
| `AdminTenant`              | `id, name, slug, logoUrl, status (ACTIVE/INACTIVE/SUSPENDED), settings, createdAt, updatedAt`                               |
| `TenantDetail`             | `{ tenant: AdminTenant, currentPlanId: string                                                                               | null }` |
| `AdminTenantsListResponse` | `{ tenants: AdminTenant[], meta: { total, page, perPage, totalPages } }`                                                    |
| `AdminPlan`                | `id, name, tier (FREE/STARTER/PROFESSIONAL/ENTERPRISE), description, price, isActive, maxUsers, maxWarehouses, maxProducts` |
| `AdminPlanDetail`          | `{ plan: AdminPlan, modules: AdminPlanModule[] }`                                                                           |
| `AdminPlanModule`          | `id, planId, module (enum de 14 valores)`                                                                                   |
| `AdminTenantUser`          | `id, tenantId, userId, role, joinedAt, user?: { id, email, username }`                                                      |
| `AdminFeatureFlag`         | `id, tenantId, flag, enabled, metadata`                                                                                     |
| `SystemFeatureFlag`        | `flag, label, description, category`                                                                                        |
| `FeatureFlagsListResponse` | `{ featureFlags: AdminFeatureFlag[], systemFlags: SystemFeatureFlag[] }`                                                    |
| `DashboardStats`           | `totalTenants, totalPlans, activePlans, tenantsByStatus, tenantsByTier, monthlyGrowth[], recentActivity[], totalUsers, mrr` |
| `RecentActivity`           | `id, action, entity, description, createdAt`                                                                                |

### Sincronização com Backend

| Schema Frontend          | Schema Backend                 | Sincronizado? |
| ------------------------ | ------------------------------ | ------------- |
| `AdminTenantSchema`      | `tenant.schema.ts`             | Sim           |
| `AdminPlanSchema`        | `plan.schema.ts`               | Sim           |
| `AdminTenantUserSchema`  | `tenant-user.schema.ts`        | Sim           |
| `AdminFeatureFlagSchema` | `feature-flag.schema.ts`       | Sim           |
| `DashboardStatsSchema`   | endpoint `/v1/admin/dashboard` | Sim           |

---

## State Management

- **Contextos:**
  - `CentralThemeContext` — gerencia o tema visual do Central (`light` / `dark-blue`) separadamente do tema global; persiste em `localStorage` com chave `central-theme`; aplica classes CSS no `document.documentElement`
  - `AuthContext` — fornece `isSuperAdmin`, `user.email`, `logout` (consumidos pela navbar)

- **URL State:** Nenhum estado é armazenado na URL. Filtros da lista de tenants (busca, status) e paginação são gerenciados via `useState` local.

- **localStorage:**
  - `central-theme` — tema do Central (`'light'` ou `'dark-blue'`, padrão `'dark-blue'`)
  - `central-sidebar-collapsed` — estado de colapso da sidebar (`'true'` ou `'false'`)

- **React Query Keys:** Todos os query keys do módulo seguem o padrão `adminKeys.*` definido em `use-admin.ts`, com prefixo `['admin']`.

---

## Theme System

O módulo Central possui um sistema de tema independente do restante da aplicação.

### Temas Disponíveis

| Tema        | Classe CSS   | Background                    | Texto                    | Primary               |
| ----------- | ------------ | ----------------------------- | ------------------------ | --------------------- |
| `dark-blue` | `.dark-blue` | `#0d1426` (azul muito escuro) | `#f1f5f9` (branco frio)  | `#3b82f6` (azul vivo) |
| `light`     | `.light`     | Gradiente de cinzas claros    | `#1e293b` (cinza escuro) | `#3b82f6`             |

### Design Tokens CSS

Os tokens são definidos em `src/app/(central)/central.css` e usados por todos os componentes da biblioteca de glassmorphism:

- `--glass-bg` / `--glass-bg-opacity` — cor e opacidade do fundo glass
- `--glass-border` / `--glass-border-opacity` — cor e opacidade da borda glass
- `--central-border` — cor base para bordas
- `--color-primary` / `--color-primary-hover` / `--color-primary-foreground`
- `--color-success` / `--color-warning` / `--color-destructive`
- `--os-blue-500` / `--os-purple-500` / `--os-pink-500` / `--os-amber-500` — cores de acento por módulo

### Classes Utilitárias

| Classe                                             | Uso                                                   |
| -------------------------------------------------- | ----------------------------------------------------- |
| `central-glass`                                    | Glassmorphism padrão (fundo + border + backdrop-blur) |
| `central-glass-subtle`                             | Glassmorphism com menor opacidade                     |
| `central-glass-strong`                             | Glassmorphism com maior opacidade                     |
| `central-text`                                     | Cor primária de texto (adapta ao tema)                |
| `central-text-muted`                               | Texto secundário                                      |
| `central-text-subtle`                              | Texto terciário (placeholders, captions)              |
| `central-accent-blue/purple/amber/green/cyan/pink` | Acento colorido para gradientes                       |
| `central-accent-gradient`                          | Gradiente de fundo do acento ativo                    |
| `central-accent-text`                              | Texto sobre fundo de acento                           |
| `central-transition`                               | Transição suave padrão                                |
| `central-glass-hover`                              | Hover state para cards interativos                    |
| `central-divider`                                  | Linha divisória com cor de borda                      |

---

## API Integration

Toda a comunicação com o backend é feita via `adminApi` em `src/services/admin/admin-api.ts`, que:

- Utiliza `apiClient` de `src/lib/api-client.ts` para as chamadas HTTP
- Valida as respostas via schemas Zod (`src/schemas/admin.schemas.ts`) antes de retornar
- Exporta os tipos inferidos dos schemas para uso nos hooks e componentes

| Função                                                | Método   | Endpoint                                                 |
| ----------------------------------------------------- | -------- | -------------------------------------------------------- |
| `adminApi.getDashboardStats()`                        | `GET`    | `/v1/admin/dashboard`                                    |
| `adminApi.listTenants(page, limit, search?, status?)` | `GET`    | `/v1/admin/tenants`                                      |
| `adminApi.getTenantDetails(id)`                       | `GET`    | `/v1/admin/tenants/:id`                                  |
| `adminApi.createTenant(data)`                         | `POST`   | `/v1/admin/tenants`                                      |
| `adminApi.updateTenant(id, data)`                     | `PUT`    | `/v1/admin/tenants/:id`                                  |
| `adminApi.deleteTenant(id)`                           | `DELETE` | `/v1/admin/tenants/:id`                                  |
| `adminApi.changeTenantStatus(id, status)`             | `PATCH`  | `/v1/admin/tenants/:id/status`                           |
| `adminApi.changeTenantPlan(id, planId)`               | `PUT`    | `/v1/admin/tenants/:id/plan`                             |
| `adminApi.listTenantUsers(id)`                        | `GET`    | `/v1/admin/tenants/:id/users`                            |
| `adminApi.createTenantUser(id, data)`                 | `POST`   | `/v1/admin/tenants/:id/users`                            |
| `adminApi.removeTenantUser(id, userId)`               | `DELETE` | `/v1/admin/tenants/:id/users/:userId`                    |
| `adminApi.setUserSecurityKey(tenantId, userId, key)`  | `PATCH`  | `/v1/admin/tenants/:tenantId/users/:userId/security-key` |
| `adminApi.listFeatureFlags(id)`                       | `GET`    | `/v1/admin/tenants/:id/feature-flags`                    |
| `adminApi.manageFeatureFlags(id, flag, enabled)`      | `PUT`    | `/v1/admin/tenants/:id/feature-flags`                    |
| `adminApi.listPlans()`                                | `GET`    | `/v1/admin/plans`                                        |
| `adminApi.getPlan(id)`                                | `GET`    | `/v1/admin/plans/:id`                                    |
| `adminApi.createPlan(data)`                           | `POST`   | `/v1/admin/plans`                                        |
| `adminApi.updatePlan(id, data)`                       | `PUT`    | `/v1/admin/plans/:id`                                    |
| `adminApi.deletePlan(id)`                             | `DELETE` | `/v1/admin/plans/:id`                                    |
| `adminApi.setPlanModules(id, modules)`                | `PUT`    | `/v1/admin/plans/:id/modules`                            |

---

## User Flows

### Flow 1: Acessar o Central como Super Admin

1. Usuário autentica em `/fast-login` com credenciais de super admin
2. `AuthContext` recebe JWT com `isSuperAdmin: true`
3. Usuário navega para `/central`
4. `SuperAdminGuard` verifica `isSuperAdmin`; se falso, redireciona para `/`
5. `CentralThemeProvider` aplica o tema `dark-blue` (ou o salvo no `localStorage`)
6. Dashboard carrega métricas via `useDashboardStats()`
7. Gráficos de crescimento, distribuição por tier e status são renderizados com Recharts

### Flow 2: Criar Nova Empresa com Plano e Usuário

1. Super admin clica em "Nova Empresa" na lista de tenants
2. Wizard exibe 3 etapas com indicador de progresso
3. Etapa 0: preenche nome (obrigatório), slug (opcional), logo e status
4. Etapa 1: clica em um card de plano para selecioná-lo (clique duplo remove a seleção)
5. Etapa 2: preenche e-mail e senha do usuário proprietário (ou deixa em branco para pular)
6. Clica em "Criar Empresa":
   - `useCreateTenant()` cria a empresa → retorna `{ id }`
   - Se plano selecionado: `useChangeTenantPlan()` atribui o plano
   - Se e-mail/senha preenchidos: `useCreateTenantUser()` cria o usuário com `role: 'owner'`
7. Toast de sucesso; navegação automática para `/central/tenants/[id]`

### Flow 3: Gerenciar Feature Flags de uma Empresa

1. Super admin acessa `/central/tenants/[id]`
2. Clica na aba "Flags"
3. `useAdminTenantFlags(id)` carrega `{ featureFlags, systemFlags }`
4. Flags do sistema são agrupadas por categoria (core, stock, sales, hr, experimental)
5. Toggle de cada Switch chama `useManageFeatureFlags({ id, flag, enabled })`
6. Toast de sucesso; React Query invalida `tenantFlags(id)` e `tenant(id)`
7. Para adicionar flag customizada: digita o nome em `GlassInput` (somente maiúsculas/números/underscore) e clica em "Adicionar Flag"

### Flow 4: Criar Novo Plano de Assinatura

1. Super admin clica em "Novo Plano" na lista de planos
2. Preenche informações: nome, tier, preço, descrição, status
3. Define limites: maxUsers, maxWarehouses, maxProducts (999999 para ilimitado)
4. Seleciona módulos via checkboxes (CORE já vem selecionado por padrão)
5. NOTIFICATIONS está desabilitado com tooltip "em breve"
6. Clica em "Criar Plano":
   - `useCreatePlan()` cria o plano → retorna `{ id }`
   - `useSetPlanModules()` define os módulos em seguida
7. Toast de sucesso; navegação para `/central/plans`

### Flow 5: Definir Chave de Segurança para Usuário

1. Super admin abre o detalhe de uma empresa e vai para a aba "Usuários"
2. Clica no ícone de chave (`KeyRound`) no card do usuário desejado
3. Dialog abre com campo de senha para a chave
4. Preenchendo e confirmando: `useSetUserSecurityKey()` chama `PATCH .../security-key`
5. Deixando em branco: remove a chave existente
6. Toast informa se a chave foi definida ou removida

---

## Modules Enum

Os módulos disponíveis para seleção em planos são:

| Módulo          | Status                        |
| --------------- | ----------------------------- |
| `CORE`          | Disponível                    |
| `STOCK`         | Disponível                    |
| `SALES`         | Disponível                    |
| `HR`            | Disponível                    |
| `PAYROLL`       | Disponível                    |
| `REPORTS`       | Disponível                    |
| `AUDIT`         | Disponível                    |
| `REQUESTS`      | Disponível                    |
| `NOTIFICATIONS` | Em breve (desabilitado na UI) |
| `FINANCE`       | Disponível                    |
| `CALENDAR`      | Disponível                    |
| `STORAGE`       | Disponível                    |
| `EMAIL`         | Disponível                    |
| `TASKS`         | Disponível                    |

---

## Audit History

| Data       | Dimensão             | Score | Relatório                                                     |
| ---------- | -------------------- | ----- | ------------------------------------------------------------- |
| 2026-03-10 | Documentação inicial | —     | Criação da documentação completa do módulo Central (frontend) |
