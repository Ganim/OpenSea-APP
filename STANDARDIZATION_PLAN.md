# 🏗️ OpenSea OS - Sistema Operacional Empresarial

> **Versão 4.5.0** | Última atualização: 01 de Dezembro de 2025

## 📖 Índice

1. [📋 Sumário Executivo](#-sumário-executivo)
2. [🎨 Design System - Princípios Fundamentais](#-design-system---princípios-fundamentais)
   - Filosofia do OpenSea OS
   - Padrões de Nomenclatura
   - Contratos de API Padronizados
   - Hierarquia de Componentes
   - Fluxo de Criação de Nova Entidade
   - Tokens de Design
   - Padrões de Estado e Loading
   - Quick Reference - Matriz de Consistência
   - Imports Padronizados
   - Anti-Patterns
3. [📑 Padrão de Páginas - Tipos de CRUD](#-padrão-de-páginas---tipos-de-crud)
   - Tipo 1: CRUD Simples (Single Entity)
   - Tipo 2: CRUD Hierárquico/Composto (Multi Entity)
   - Princípio Modal-First
   - Árvore de Decisão
4. [🖥️ Arquitetura do OpenSea OS](#️-arquitetura-do-opensea-os)
5. [📁 Estrutura de Pastas](#-estrutura-de-pastas-do-opensea-os)
6. [🔧 Sistemas Core](#-sistemas-core-do-opensea-os)
   - File Manager
   - Calendar System
   - Notifications
   - Requests/Workflow
   - Batch Processing
   - **Operações em Massa (View/Edit/Create/Delete)**
   - **Undo/Redo System**
   - **Audit Log System**
   - Forms System
   - Tabs System
   - CRUD System
   - Dashboard System
   - Search System
7. [📄 Sistema de Páginas Padronizado](#-sistema-de-páginas-padronizado)
8. [🏛️ Arquitetura Proposta](#️-arquitetura-proposta)
9. [📦 Componentes a Serem Criados](#-componentes-a-serem-criadosrefatorados)
10. [🚀 Plano de Migração](#-plano-de-migração-atualizado)
11. [📊 Métricas de Sucesso](#-métricas-de-sucesso)
12. [💡 Melhorias Adicionais](#-melhorias-adicionais-identificadas)
13. [📚 Referências e Recursos](#-referências-e-recursos)
14. [📋 Changelog](#-changelog)

---

## 📋 Sumário Executivo

Este documento apresenta a arquitetura completa do **OpenSea OS** - um sistema operacional empresarial **modular, robusto e à prova de falhas**, onde todas as funcionalidades são construídas sobre uma base comum, permitindo que novas interfaces sejam implementadas de forma simples e consistente.

### 🎯 Visão do Produto
> "Um sistema onde qualquer funcionalidade - seja gestão de estoque, vendas, RH ou finanças - pode ser implementada em horas, não dias, usando os mesmos blocos de construção."

### Objetivos Principais
- 🔄 **Eliminar código repetitivo** através de componentes genéricos
- 🧱 **Criar uma arquitetura sólida** baseada em SOLID e Clean Code
- 🚀 **Facilitar a criação de novas interfaces** com templates pré-definidos
- 🛡️ **Tornar o sistema à prova de falhas** com tratamento de erros robusto
- 🎨 **Manter UI/UX consistente e moderna** em todas as páginas
- 🔐 **Segurança granular** com RBAC completo
- 📁 **Gestão unificada** de arquivos, notificações, calendário e processos

---

## 🎨 DESIGN SYSTEM - PRINCÍPIOS FUNDAMENTAIS

### 🎨 CSS Token System v1.0

O OpenSea OS implementa um sistema de Design Tokens em CSS que elimina cores hardcoded e garante consistência total entre temas.

#### Arquitetura de Tokens

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           TOKEN HIERARCHY                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. PRIMITIVE TOKENS (Paleta Base)                                          │
│     └── --os-blue-500, --os-gray-200, --os-red-400                         │
│         Cores brutas, nunca usar diretamente em componentes                 │
│                                                                             │
│  2. SEMANTIC TOKENS (Significado)                                           │
│     └── --color-primary, --color-destructive, --color-border               │
│         Cores com significado, mudam entre temas                            │
│                                                                             │
│  3. COMPONENT TOKENS (Específicos)                                          │
│     └── --btn-primary-bg, --card-border, --input-focus-ring                │
│         Tokens específicos por componente                                   │
│                                                                             │
│  4. STATE TOKENS (Estados)                                                  │
│     └── --state-disabled-opacity, --state-focus-ring-width                 │
│         Estados consistentes em todos os componentes                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Tokens Implementados

**Localização:** `src/app/globals.css`

```css
/* === PRIMITIVE TOKENS === */
:root {
  /* Gray Scale */
  --os-gray-50: 249 250 251;
  --os-gray-100: 243 244 246;
  /* ... até gray-950 */
  
  /* Blue (Primary) */
  --os-blue-500: 59 130 246;
  --os-blue-600: 37 99 235;
  
  /* Red (Destructive) */
  --os-red-500: 239 68 68;
  
  /* Green (Success) */
  --os-green-500: 34 197 94;
  
  /* Orange (Warning) */
  --os-orange-500: 249 115 22;
}

/* === SEMANTIC TOKENS (Light) === */
:root {
  --color-background: var(--os-gray-50);
  --color-foreground: var(--os-slate-700);
  --color-primary: var(--os-blue-500);
  --color-destructive: var(--os-red-500);
  --color-border: var(--os-gray-200);
}

/* === SEMANTIC TOKENS (Dark) === */
.dark {
  --color-background: var(--os-slate-900);
  --color-foreground: var(--os-slate-50);
  --color-primary: var(--os-blue-500);
  --color-border: var(--os-slate-700);
}
```

#### Component Tokens Disponíveis

| Componente | Tokens | Exemplo de Uso |
|------------|--------|----------------|
| **Button** | `--btn-primary-bg`, `--btn-primary-text`, `--btn-destructive-bg`, etc. | `bg-(--btn-primary-bg)` |
| **Card** | `--card-bg`, `--card-border`, `--card-shadow`, `--card-radius` | `bg-(--card-bg)` |
| **Input** | `--input-bg`, `--input-border`, `--input-focus-border`, `--input-radius` | `border-(--input-border)` |
| **Badge** | `--badge-default-bg`, `--badge-success-bg`, `--badge-warning-bg` | `bg-(--badge-success-bg)` |
| **Progress** | `--progress-bg`, `--progress-fill`, `--progress-success` | `bg-(--progress-fill)` |
| **Tabs** | `--tabs-list-bg`, `--tabs-trigger-active-bg`, `--tabs-trigger-hover` | `bg-(--tabs-list-bg)` |
| **Modal** | `--modal-bg`, `--modal-overlay`, `--modal-border`, `--modal-shadow` | `bg-(--modal-bg)` |
| **Dropdown** | `--dropdown-bg`, `--dropdown-border`, `--dropdown-item-hover` | `bg-(--dropdown-bg)` |
| **Table** | `--table-header-bg`, `--table-row-hover`, `--table-row-selected` | `hover:bg-(--table-row-hover)` |
| **Sidebar** | `--sidebar-bg`, `--sidebar-item-hover`, `--sidebar-item-active-bg` | `bg-(--sidebar-item-active-bg)` |
| **Skeleton** | `--skeleton-bg`, `--skeleton-shimmer` | `bg-(--skeleton-bg)` |
| **Tooltip** | `--tooltip-bg`, `--tooltip-text` | `bg-(--tooltip-bg)` |
| **Scrollbar** | `--scrollbar-track`, `--scrollbar-thumb`, `--scrollbar-thumb-hover` | Via CSS `::-webkit-scrollbar` |

#### State Tokens

```css
:root {
  /* Disabled */
  --state-disabled-opacity: 0.5;
  --state-disabled-cursor: not-allowed;
  
  /* Loading */
  --state-loading-opacity: 0.7;
  
  /* Focus */
  --state-focus-ring-width: 3px;
  --state-focus-ring-color: rgb(var(--color-ring) / 0.5);
  
  /* Active */
  --state-active-scale: 0.98;
  
  /* Error */
  --state-error-ring: rgb(var(--color-destructive) / 0.2);
  
  /* Selected */
  --state-selected-bg: var(--color-primary-subtle);
  --state-selected-border: var(--color-primary);
}
```

#### Uso nos Componentes

```tsx
// ❌ ANTES (cores hardcoded)
<button className="bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-400">

// ✅ DEPOIS (tokens)
<button className="bg-(--btn-primary-bg) hover:bg-(--btn-primary-bg-hover) text-(--btn-primary-text)">
```

```tsx
// ❌ ANTES
<div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">

// ✅ DEPOIS
<div className="bg-(--card-bg) border-(--card-border)">
```

#### Criando Novos Temas

Para criar um novo tema (ex: "Ocean Blue"):

```css
/* globals.css */
.theme-ocean {
  --color-primary: var(--os-cyan-500);
  --color-primary-hover: var(--os-cyan-600);
  --btn-primary-bg: var(--color-primary);
  --btn-primary-bg-hover: var(--color-primary-hover);
  /* ... outras customizações */
}
```

```tsx
// Aplicar tema
<body className="theme-ocean">
```

#### Regras de Ouro

1. **NUNCA** use cores Tailwind diretamente (`bg-blue-500`)
2. **SEMPRE** use tokens para cores (`bg-(--btn-primary-bg)`)
3. **SEMPRE** use tokens de estado (`opacity-(--state-disabled-opacity)`)
4. **SEMPRE** use tokens de transição (`duration-(--transition-normal)`)
5. Novos componentes **DEVEM** definir seus tokens no `globals.css`

---

### Filosofia do OpenSea OS

O OpenSea OS segue uma filosofia inspirada em sistemas operacionais modernos:

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRINCÍPIOS CORE                          │
├─────────────────────────────────────────────────────────────────┤
│  1. CONFIGURAÇÃO > CÓDIGO                                       │
│     Novas entidades via JSON/TS config, não novo código         │
│                                                                 │
│  2. COMPOSIÇÃO > HERANÇA                                        │
│     Componentes pequenos que se combinam                        │
│                                                                 │
│  3. CONVENÇÃO > CONFIGURAÇÃO                                    │
│     Defaults inteligentes, customização quando necessário       │
│                                                                 │
│  4. API ÚNICA = EXPERIÊNCIA ÚNICA                               │
│     Mesma API em todos os lugares = mesmo comportamento         │
│                                                                 │
│  5. ZERO-CONFIG FIRST                                           │
│     Funciona sem config, melhora com config                     │
└─────────────────────────────────────────────────────────────────┘
```

### Padrões de Nomenclatura

```typescript
// ✅ PADRÕES OBRIGATÓRIOS

// 1. Componentes: PascalCase + Sufixo descritivo
EntityGrid              // Grid de entidades
EntityForm              // Formulário de entidade
EntityCard              // Card de entidade
EntityPageTemplate      // Template de página
CrudListPage            // Página CRUD de listagem

// 2. Hooks: camelCase + prefixo 'use'
useEntity()             // Hook de entidade
useEntityCrud()         // Hook CRUD
useEntityPage()         // Hook de página
useBatchOperation()     // Hook de operação em lote
useModal()              // Hook de modal

// 3. Configs: camelCase + sufixo 'Config'
productFormConfig       // Config de form de produto
templateGridConfig      // Config de grid de template
orderCrudConfig         // Config CRUD de pedido

// 4. Types: PascalCase + sufixo descritivo
EntityConfig            // Config de entidade
FormFieldConfig         // Config de campo de form
GridColumnConfig        // Config de coluna de grid

// 5. Arquivos: kebab-case
entity-grid.tsx         // Componente
use-entity-crud.ts      // Hook
entity.config.ts        // Configuração
entity.types.ts         // Tipos
```

### Contratos de API Padronizados

Todo componente do OpenSea OS segue contratos de API consistentes:

```typescript
// =====================================================
// CONTRATO 1: Props Base de Componentes
// =====================================================

interface BaseComponentProps {
  // Identificação
  id?: string;
  className?: string;
  
  // Estilização
  variant?: 'default' | 'secondary' | 'ghost' | 'outline' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  
  // Estado
  disabled?: boolean;
  loading?: boolean;
  
  // Acessibilidade
  'aria-label'?: string;
  'aria-describedby'?: string;
}

// =====================================================
// CONTRATO 2: Config de Entidade Universal
// =====================================================

interface EntityConfig<T extends BaseEntity = BaseEntity> {
  // Identificação obrigatória
  name: string;                      // "Product"
  namePlural: string;                // "Products"
  key: string;                       // "products"
  
  // Rotas obrigatórias
  routes: {
    list: string;                    // "/stock/products"
    detail: (id: string) => string;  // (id) => `/stock/products/${id}`
    create?: string;                 // "/stock/products/new"
    edit?: (id: string) => string;   // (id) => `/stock/products/${id}/edit`
  };
  
  // Ícone obrigatório
  icon: LucideIcon;
  
  // Configurações de exibição
  display: {
    titleField: keyof T;             // Campo usado como título
    subtitleField?: keyof T;         // Campo usado como subtítulo
    imageField?: keyof T;            // Campo de imagem
    colorField?: keyof T;            // Campo de cor/badge
  };
  
  // Grid
  grid: GridConfig<T>;
  
  // Formulário
  form: FormConfig<T>;
  
  // Filtros
  filters?: FilterConfig<T>[];
  
  // Ações
  actions: EntityActions<T>;
  
  // Permissões
  permissions: EntityPermissions;
}

// =====================================================
// CONTRATO 3: Config de Formulário Universal
// =====================================================

interface FormConfig<T = any> {
  // Layout
  layout?: 'vertical' | 'horizontal';
  columns?: 1 | 2 | 3 | 4;
  
  // Campos agrupados em seções
  sections: FormSection<T>[];
  
  // Validação
  validation?: {
    mode?: 'onBlur' | 'onChange' | 'onSubmit';
    schema?: ZodSchema<T>;
  };
  
  // Comportamento
  autoSave?: boolean | { delay: number };
  confirmBeforeLeave?: boolean;
}

interface FormSection<T = any> {
  id: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  
  // Layout da seção
  columns?: 1 | 2 | 3 | 4;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  
  // Campos
  fields: FieldConfig<T>[];
  
  // Visibilidade condicional
  visible?: (data: Partial<T>) => boolean;
}

interface FieldConfig<T = any> {
  // Obrigatórios
  name: keyof T | string;
  label: string;
  type: FieldType;
  
  // Layout
  colSpan?: 1 | 2 | 3 | 4;          // Em grid de 4 colunas
  
  // Validação inline
  required?: boolean;
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any, data: T) => string | undefined;
  };
  
  // UI
  placeholder?: string;
  description?: string;
  icon?: LucideIcon;
  
  // Comportamento
  disabled?: boolean | ((data: T) => boolean);
  visible?: boolean | ((data: T) => boolean);
  
  // Para selects/combos
  options?: FieldOption[] | ((data: T) => FieldOption[]);
  loadOptions?: (query: string) => Promise<FieldOption[]>;
  
  // Valor padrão
  defaultValue?: any;
}

// =====================================================
// CONTRATO 4: Config de Grid Universal
// =====================================================

interface GridConfig<T = any> {
  // Colunas
  columns: GridColumn<T>[];
  
  // Visualizações
  defaultView?: 'grid' | 'list' | 'table';
  availableViews?: ('grid' | 'list' | 'table')[];
  
  // Seleção
  selectable?: boolean;
  multiSelect?: boolean;
  
  // Ordenação
  sortable?: boolean;
  defaultSort?: { field: keyof T; direction: 'asc' | 'desc' };
  
  // Agrupamento
  groupable?: boolean;
  defaultGroup?: keyof T;
  
  // Paginação
  pagination?: {
    pageSize: number;
    pageSizes?: number[];
  };
  
  // Card customizado (opcional)
  cardComponent?: React.ComponentType<{ item: T; selected: boolean }>;
}

interface GridColumn<T = any> {
  // Obrigatórios
  field: keyof T | string;
  label: string;
  
  // Tipo e formatação
  type?: 'text' | 'number' | 'currency' | 'date' | 'boolean' | 'badge' | 'image' | 'progress';
  format?: {
    template?: string;             // "R$ {value}"
    decimals?: number;
    dateFormat?: string;           // "DD/MM/YYYY"
    badgeColors?: Record<string, string>;
  };
  
  // Layout
  width?: number | string;
  minWidth?: number;
  align?: 'left' | 'center' | 'right';
  
  // Comportamento
  sortable?: boolean;
  filterable?: boolean;
  visible?: boolean;
  
  // Renderização customizada
  render?: (value: any, item: T) => React.ReactNode;
}

// =====================================================
// CONTRATO 5: Config de Ações Universal
// =====================================================

interface EntityActions<T = any> {
  // Ações em lote
  batch?: {
    delete?: BatchActionConfig;
    duplicate?: BatchActionConfig;
    export?: BatchActionConfig;
    custom?: CustomBatchAction<T>[];
  };
  
  // Ações individuais (context menu)
  item?: {
    view?: boolean;
    edit?: boolean;
    duplicate?: boolean;
    delete?: boolean;
    custom?: CustomItemAction<T>[];
  };
  
  // Ações de header
  header?: {
    create?: boolean;
    import?: boolean;
    export?: boolean;
    custom?: CustomHeaderAction[];
  };
}

interface BatchActionConfig {
  enabled: boolean;
  batchSize?: number;
  delay?: number;
  confirmMessage?: string | ((count: number) => string);
}

interface CustomItemAction<T = any> {
  id: string;
  label: string;
  icon: LucideIcon;
  onClick: (item: T) => void | Promise<void>;
  visible?: (item: T) => boolean;
  disabled?: (item: T) => boolean;
  variant?: 'default' | 'destructive';
  separator?: 'before' | 'after';
}

// =====================================================
// CONTRATO 6: Config de Filtros Universal
// =====================================================

interface FilterConfig<T = any> {
  id: string;
  label: string;
  field: keyof T | string;
  type: 'text' | 'select' | 'multi-select' | 'date' | 'date-range' | 'number-range' | 'boolean';
  
  // Para selects
  options?: FilterOption[];
  loadOptions?: () => Promise<FilterOption[]>;
  
  // Comportamento
  defaultValue?: any;
  operator?: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'startsWith' | 'endsWith';
  
  // UI
  placeholder?: string;
  width?: 'sm' | 'md' | 'lg' | 'full';
}

// =====================================================
// CONTRATO 7: Config de Permissões Universal
// =====================================================

interface EntityPermissions {
  // CRUD básico
  list: string;                    // "products.list"
  view: string;                    // "products.view"
  create: string;                  // "products.create"
  update: string;                  // "products.update"
  delete: string;                  // "products.delete"
  
  // Ações especiais
  export?: string;                 // "products.export"
  import?: string;                 // "products.import"
  duplicate?: string;              // "products.duplicate"
  
  // Campos específicos (field-level permissions)
  fields?: Record<string, string>; // { "costPrice": "products.view_cost" }
}
```

### Hierarquia de Componentes

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         NÍVEL 1: PRIMITIVOS (@ui)                        │
│  Button, Input, Dialog, Card, Badge, Tooltip, Select...                 │
│  (shadcn/ui - não modificar, apenas usar)                               │
└─────────────────────────────────────────────────────────────────────────┘
                                    ▲
┌─────────────────────────────────────────────────────────────────────────┐
│                         NÍVEL 2: COMPOSTOS (@ui)                         │
│  SearchInput, DateRangePicker, MultiSelect, DataTable, FileUpload...    │
│  (Combinação de primitivos para casos comuns)                           │
└─────────────────────────────────────────────────────────────────────────┘
                                    ▲
┌─────────────────────────────────────────────────────────────────────────┐
│                         NÍVEL 3: DOMÍNIO (@core)                         │
│  EntityGrid, EntityForm, EntityCard, EntityViewer, EntityTabs...        │
│  (Componentes de negócio genéricos - configurados via props)            │
└─────────────────────────────────────────────────────────────────────────┘
                                    ▲
┌─────────────────────────────────────────────────────────────────────────┐
│                         NÍVEL 4: PÁGINAS (@core/crud)                    │
│  CrudListPage, CrudDetailPage, CrudCreatePage, CrudEditPage             │
│  (Templates de página completos - configurados via EntityConfig)        │
└─────────────────────────────────────────────────────────────────────────┘
                                    ▲
┌─────────────────────────────────────────────────────────────────────────┐
│                         NÍVEL 5: APLICAÇÃO (apps/)                       │
│  ProductsPage, OrdersPage, CustomersPage...                             │
│  (Instâncias de CrudPages com configs específicas)                      │
└─────────────────────────────────────────────────────────────────────────┘
```

### Fluxo de Criação de Nova Entidade

```typescript
// =====================================================
// EXEMPLO: Criar nova entidade "Fornecedor" em 3 passos
// =====================================================

// PASSO 1: Definir tipos (2 min)
// types/stock/supplier.types.ts

interface Supplier extends BaseEntity {
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  category: 'national' | 'international';
  rating: number;
  isActive: boolean;
}

// PASSO 2: Criar configuração (5 min)
// config/entities/suppliers.config.ts

export const supplierConfig: EntityConfig<Supplier> = {
  name: 'Fornecedor',
  namePlural: 'Fornecedores',
  key: 'suppliers',
  icon: Truck,
  
  routes: {
    list: '/stock/suppliers',
    detail: (id) => `/stock/suppliers/${id}`,
    create: '/stock/suppliers/new',
    edit: (id) => `/stock/suppliers/${id}/edit`,
  },
  
  display: {
    titleField: 'name',
    subtitleField: 'cnpj',
  },
  
  grid: {
    defaultView: 'list',
    availableViews: ['grid', 'list', 'table'],
    selectable: true,
    columns: [
      { field: 'name', label: 'Nome', sortable: true },
      { field: 'cnpj', label: 'CNPJ', format: { template: '{value}' } },
      { field: 'category', label: 'Tipo', type: 'badge', format: {
        badgeColors: { national: 'blue', international: 'green' }
      }},
      { field: 'rating', label: 'Avaliação', type: 'number', format: { template: '{value}⭐' } },
      { field: 'isActive', label: 'Ativo', type: 'boolean' },
    ],
  },
  
  form: {
    columns: 2,
    sections: [
      {
        id: 'basic',
        title: 'Informações Básicas',
        icon: Building2,
        fields: [
          { name: 'name', label: 'Nome', type: 'text', required: true, colSpan: 2 },
          { name: 'cnpj', label: 'CNPJ', type: 'text', required: true },
          { name: 'category', label: 'Tipo', type: 'select', options: [
            { label: 'Nacional', value: 'national' },
            { label: 'Internacional', value: 'international' },
          ]},
        ],
      },
      {
        id: 'contact',
        title: 'Contato',
        icon: Phone,
        fields: [
          { name: 'email', label: 'E-mail', type: 'email', required: true },
          { name: 'phone', label: 'Telefone', type: 'phone' },
        ],
      },
    ],
  },
  
  filters: [
    { id: 'category', label: 'Tipo', field: 'category', type: 'select', options: [
      { label: 'Todos', value: 'all' },
      { label: 'Nacional', value: 'national' },
      { label: 'Internacional', value: 'international' },
    ]},
    { id: 'isActive', label: 'Status', field: 'isActive', type: 'boolean' },
  ],
  
  actions: {
    batch: {
      delete: { enabled: true, confirmMessage: (n) => `Excluir ${n} fornecedores?` },
      export: { enabled: true },
    },
    item: {
      view: true,
      edit: true,
      delete: true,
    },
    header: {
      create: true,
      import: true,
      export: true,
    },
  },
  
  permissions: {
    list: 'suppliers.list',
    view: 'suppliers.view',
    create: 'suppliers.create',
    update: 'suppliers.update',
    delete: 'suppliers.delete',
    export: 'suppliers.export',
    import: 'suppliers.import',
  },
};

// PASSO 3: Criar página (30 seg)
// app/(dashboard)/stock/suppliers/page.tsx

import { CrudListPage } from '@core/crud';
import { supplierConfig } from '@/config/entities/suppliers.config';

export default function SuppliersPage() {
  return <CrudListPage config={supplierConfig} />;
}

// PRONTO! 🎉 Página completa com:
// ✅ Grid/List/Table views
// ✅ Seleção múltipla
// ✅ Filtros avançados
// ✅ Ordenação
// ✅ Paginação
// ✅ CRUD completo
// ✅ Batch operations
// ✅ Export/Import
// ✅ Permissões
// ✅ Responsivo
```

### Tokens de Design

```typescript
// config/theme.config.ts

export const designTokens = {
  // =====================================================
  // SPACING (múltiplos de 4)
  // =====================================================
  spacing: {
    xs: '4px',     // 0.25rem - padding interno mínimo
    sm: '8px',     // 0.5rem  - gaps pequenos
    md: '16px',    // 1rem    - padding padrão
    lg: '24px',    // 1.5rem  - seções
    xl: '32px',    // 2rem    - cards
    '2xl': '48px', // 3rem    - headers
    '3xl': '64px', // 4rem    - páginas
  },
  
  // =====================================================
  // RADIUS
  // =====================================================
  radius: {
    none: '0',
    sm: '4px',     // botões pequenos
    md: '8px',     // cards, inputs (PADRÃO)
    lg: '12px',    // modais
    xl: '16px',    // containers grandes
    full: '9999px', // avatars, badges
  },
  
  // =====================================================
  // SHADOWS
  // =====================================================
  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 6px rgba(0,0,0,0.07)',
    lg: '0 10px 15px rgba(0,0,0,0.1)',
    xl: '0 20px 25px rgba(0,0,0,0.15)',
  },
  
  // =====================================================
  // TYPOGRAPHY
  // =====================================================
  typography: {
    // Família
    fontFamily: {
      sans: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      mono: 'JetBrains Mono, Monaco, Consolas, monospace',
    },
    
    // Tamanhos
    fontSize: {
      xs: '0.75rem',    // 12px - labels, badges
      sm: '0.875rem',   // 14px - texto secundário
      base: '1rem',     // 16px - texto principal
      lg: '1.125rem',   // 18px - subtítulos
      xl: '1.25rem',    // 20px - títulos de card
      '2xl': '1.5rem',  // 24px - títulos de seção
      '3xl': '1.875rem',// 30px - títulos de página
      '4xl': '2.25rem', // 36px - hero
    },
    
    // Peso
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    
    // Line height
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  
  // =====================================================
  // CORES SEMÂNTICAS
  // =====================================================
  colors: {
    // Estados
    success: {
      50: '#f0fdf4',
      500: '#22c55e',
      600: '#16a34a',
    },
    warning: {
      50: '#fffbeb',
      500: '#f59e0b',
      600: '#d97706',
    },
    error: {
      50: '#fef2f2',
      500: '#ef4444',
      600: '#dc2626',
    },
    info: {
      50: '#eff6ff',
      500: '#3b82f6',
      600: '#2563eb',
    },
    
    // Entidades (cores consistentes por tipo)
    entity: {
      product: '#8b5cf6',    // violet
      order: '#06b6d4',      // cyan
      customer: '#ec4899',   // pink
      supplier: '#f97316',   // orange
      location: '#14b8a6',   // teal
      template: '#6366f1',   // indigo
      user: '#64748b',       // slate
    },
  },
  
  // =====================================================
  // BREAKPOINTS
  // =====================================================
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // =====================================================
  // TRANSIÇÕES
  // =====================================================
  transitions: {
    fast: '150ms ease',
    normal: '200ms ease',
    slow: '300ms ease',
  },
  
  // =====================================================
  // Z-INDEX
  // =====================================================
  zIndex: {
    dropdown: 50,
    sticky: 100,
    modal: 200,
    popover: 300,
    tooltip: 400,
    toast: 500,
  },
};
```

### Padrões de Estado e Loading

```typescript
// =====================================================
// ESTADOS VISUAIS PADRONIZADOS
// =====================================================

// 1. Loading States
interface LoadingStateConfig {
  variant: 'spinner' | 'skeleton' | 'shimmer' | 'pulse';
  size?: 'sm' | 'md' | 'lg' | 'full';
  text?: string;
}

// 2. Empty States
interface EmptyStateConfig {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// 3. Error States
interface ErrorStateConfig {
  type: 'network' | 'auth' | 'permission' | 'notFound' | 'generic';
  message?: string;
  retry?: () => void;
}

// Uso padronizado em TODOS os componentes:
function EntityGrid({ config, isLoading, error, items }) {
  if (isLoading) {
    return <LoadingState variant="skeleton" size="lg" />;
  }
  
  if (error) {
    return <ErrorState type="network" retry={refetch} />;
  }
  
  if (items.length === 0) {
    return (
      <EmptyState
        icon={config.icon}
        title={`Nenhum ${config.name.toLowerCase()} encontrado`}
        description={`Crie seu primeiro ${config.name.toLowerCase()} para começar`}
        action={{
          label: `Criar ${config.name}`,
          onClick: () => router.push(config.routes.create),
        }}
      />
    );
  }
  
  return (/* render grid */);
}
```

### 📋 QUICK REFERENCE - Matriz de Consistência

| Componente | Hook | Config | Tipo | Permissão |
|------------|------|--------|------|-----------|
| `EntityGrid` | `useEntityList` | `GridConfig` | `entity.types.ts` | `entity.list` |
| `EntityForm` | `useEntityForm` | `FormConfig` | `entity.types.ts` | `entity.create/update` |
| `EntityCard` | - | `CardConfig` | `entity.types.ts` | `entity.view` |
| `EntityViewer` | `useEntity` | `ViewerConfig` | `entity.types.ts` | `entity.view` |
| `EntityTabs` | `useTabs` | `TabsConfig` | `tabs.types.ts` | - |
| `CrudListPage` | `useEntityPage` | `EntityConfig` | `crud.types.ts` | `entity.*` |
| `CrudDetailPage` | `useCrudItem` | `EntityConfig` | `crud.types.ts` | `entity.view` |
| `CrudCreatePage` | `useCrudCreate` | `EntityConfig` | `crud.types.ts` | `entity.create` |
| `CrudEditPage` | `useCrudEdit` | `EntityConfig` | `crud.types.ts` | `entity.update` |
| `SearchBar` | `useSearch` | `SearchConfig` | `search.types.ts` | - |
| `Dashboard` | `useDashboard` | `DashboardConfig` | `dashboard.types.ts` | `dashboard.view` |
| `BatchProgress` | `useBatchOperation` | `BatchConfig` | `batch.types.ts` | - |
| `ImportWizard` | `useImportExport` | `ImportConfig` | `import.types.ts` | `entity.import` |
| `ReportBuilder` | `useReports` | `ReportConfig` | `reports.types.ts` | `reports.*` |

### 📦 Imports Padronizados

```typescript
// =====================================================
// IMPORTS DO KERNEL (@core)
// =====================================================

// Componentes de Entidade
import { 
  EntityGrid, 
  EntityForm, 
  EntityCard, 
  EntityViewer,
  EntityContextMenu,
  EntityPageTemplate,
} from '@core/components/entity';

// Páginas CRUD
import { 
  CrudListPage, 
  CrudDetailPage, 
  CrudCreatePage, 
  CrudEditPage,
} from '@core/crud';

// Sistema de Formulários
import { 
  EntityForm,
  FormSection,
  useEntityForm,
} from '@core/forms';

// Campos de Formulário
import { 
  TextField, 
  NumberField, 
  SelectField,
  DateField,
  CurrencyField,
  // ... todos os 20+ campos
} from '@core/forms/fields';

// Sistema de Abas
import { 
  EntityTabs,
  TabPageLayout,
  useTabs,
} from '@core/tabs';

// Sistema de Busca
import { 
  SearchBar,
  SearchFilters,
  GlobalSearch,
  useSearch,
} from '@core/search';

// Sistema de Dashboard
import { 
  Dashboard,
  DashboardGrid,
  StatCard,
  ChartLine,
  ChartBar,
} from '@core/dashboard';

// Hooks Core
import {
  useEntityPage,
  useSelection,
  useBatchOperation,
  useModals,
  usePermissions,
} from '@core/hooks';

// =====================================================
// IMPORTS DE SERVIÇOS (@services)
// =====================================================

// Sistema de Modais
import { 
  useModal,
  useConfirm,
  useAlert,
  ModalProvider,
} from '@services/modals';

// Sistema de Notificações
import { 
  useNotifications,
  NotificationCenter,
} from '@services/notifications';

// Sistema de Arquivos
import { 
  FileManager,
  useFiles,
  useFileUpload,
} from '@services/files';

// Sistema de Batch
import { 
  BatchQueue,
  BatchProgress,
  useBatchQueue,
} from '@services/batch';

// Import/Export
import { 
  ImportWizard,
  ExportWizard,
  useImportExport,
} from '@services/import-export';

// Relatórios
import { 
  ReportBuilder,
  ReportDashboard,
  useReports,
} from '@services/reports';

// =====================================================
// IMPORTS DE SEGURANÇA (@security)
// =====================================================

import {
  useAuth,
  usePermissions,
  PermissionGate,
  RoleGate,
  FeatureGate,
  AuthGuard,
} from '@security';

// =====================================================
// IMPORTS DE UI (@ui)
// =====================================================

// Primitivos (shadcn/ui)
import { 
  Button, 
  Input, 
  Dialog, 
  Card,
  Badge,
  Tooltip,
  Select,
  // ...
} from '@ui/primitives';

// Compostos
import {
  SearchInput,
  DateRangePicker,
  MultiSelect,
  DataTable,
  FileUpload,
} from '@ui/composed';
```

### 🚨 Anti-Patterns - O Que NÃO Fazer

```typescript
// ❌ ERRADO: Criar estado local para seleção
function ProductsPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  // ...
}

// ✅ CERTO: Usar hook padronizado
function ProductsPage() {
  const { selection } = useEntityPage(productConfig);
  // selection.selectedIds, selection.toggle(), etc.
}

// ❌ ERRADO: Componente de card específico por entidade
function ProductCard({ product }) { ... }
function TemplateCard({ template }) { ... }
function LocationCard({ location }) { ... }

// ✅ CERTO: Usar EntityCard com config
<EntityCard config={productConfig} item={product} />
<EntityCard config={templateConfig} item={template} />

// ❌ ERRADO: Handlers manuais para CRUD
async function handleDelete(id) {
  await api.delete(`/products/${id}`);
  toast.success('Deletado!');
  refetch();
}

// ✅ CERTO: Usar hook padronizado
const { handlers } = useEntityPage(productConfig);
<Button onClick={() => handlers.handleItemsDelete([id])}>Delete</Button>

// ❌ ERRADO: Modais com estado local
const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
const [isEditModalOpen, setIsEditModalOpen] = useState(false);
const [isImportModalOpen, setIsImportModalOpen] = useState(false);

// ✅ CERTO: Usar hook de modais
const { modals } = useEntityPage(productConfig);
modals.open('delete'); // ou modals.open('edit'), modals.open('import')

// ❌ ERRADO: Permissões inline
{user.role === 'admin' && <Button>Delete</Button>}

// ✅ CERTO: Usar PermissionGate
<PermissionGate permission="products.delete">
  <Button>Delete</Button>
</PermissionGate>

// ❌ ERRADO: Formulários manuais
<form onSubmit={handleSubmit}>
  <input name="name" value={formData.name} onChange={...} />
  <input name="price" value={formData.price} onChange={...} />
</form>

// ✅ CERTO: Usar EntityForm com config
<EntityForm config={productFormConfig} initialData={product} mode="edit" />

// ❌ ERRADO: Busca local
const filtered = items.filter(i => 
  i.name.includes(search) || i.sku.includes(search)
);

// ✅ CERTO: Usar sistema de busca
const { results, searchQuery, setSearchQuery } = useSearch(productSearchConfig);
```

---

## 📑 PADRÃO DE PÁGINAS - TIPOS DE CRUD

O OpenSea OS define dois tipos principais de páginas CRUD, cada um com comportamentos e componentes específicos.

### Visão Geral dos Tipos

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          TIPOS DE PÁGINAS CRUD                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  TIPO 1: CRUD SIMPLES (Single Entity)                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Lista → Modal Criar/Editar → Lista                                 │   │
│  │                                                                      │   │
│  │  Exemplos: Categorias, Tags, Unidades de Medida, Status             │   │
│  │                                                                      │   │
│  │  Características:                                                    │   │
│  │  • CRUD completo em modais                                          │   │
│  │  • Sem navegação para outras páginas                                │   │
│  │  • Não tem entidades filhas                                         │   │
│  │  • "Visualizar" abre modal de detalhes                              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  TIPO 2: CRUD HIERÁRQUICO/COMPOSTO (Multi Entity)                          │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Lista → Detalhe (com entidades relacionadas) → Sub-listas          │   │
│  │                                                                      │   │
│  │  Exemplos:                                                           │   │
│  │  • Localizações → Sublocalizações                                   │   │
│  │  • Produtos → Variantes → Itens                                     │   │
│  │  • Grupos de Acesso → Usuários + Permissões                         │   │
│  │  • Templates → Atributos                                            │   │
│  │                                                                      │   │
│  │  Características:                                                    │   │
│  │  • Lista principal navega para página de detalhe                    │   │
│  │  • Detalhe mostra entidades relacionadas                            │   │
│  │  • Breadcrumb para navegação hierárquica                            │   │
│  │  • CRUD das entidades filhas em modais                              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Princípio: CRUD Modal-First

> **Regra de Ouro**: O CRUD (Create/Read/Update/Delete) deve sempre ser feito em modais que renderizam componentes reutilizáveis.

```typescript
// =====================================================
// CRUD EM MODAIS - ARQUITETURA
// =====================================================

// 1. Componente de Formulário (reutilizável)
// components/forms/CategoryForm.tsx
export function CategoryForm({ 
  mode,                    // 'create' | 'edit' | 'view'
  initialData,
  onSubmit,
  onCancel,
}: CategoryFormProps) {
  // Lógica do formulário isolada
  // Pode ser usado em modal OU página standalone
}

// 2. Modal que usa o componente
// components/modals/CategoryModal.tsx
export function CategoryModal({ 
  isOpen, 
  onClose, 
  mode,
  category,
  onSuccess,
}: CategoryModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Nova Categoria' : 
             mode === 'edit' ? 'Editar Categoria' : 
             'Detalhes da Categoria'}
          </DialogTitle>
        </DialogHeader>
        
        <CategoryForm 
          mode={mode}
          initialData={category}
          onSubmit={async (data) => {
            await handleSave(data);
            onSuccess?.();
            onClose();
          }}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}

// 3. Uso na página
function CategoriesPage() {
  const { modals, handlers } = useEntityPage(categoryConfig);
  
  return (
    <>
      <EntityGrid 
        config={categoryConfig}
        onItemClick={(id) => modals.open('view', { id })}
        onItemEdit={(id) => modals.open('edit', { id })}
      />
      
      {/* Modal unificado para CRUD */}
      <CategoryModal 
        isOpen={modals.isOpen('create') || modals.isOpen('edit') || modals.isOpen('view')}
        mode={modals.currentMode}
        category={modals.currentItem}
        onClose={modals.closeAll}
        onSuccess={handlers.refresh}
      />
    </>
  );
}
```

---

### TIPO 1: CRUD Simples (Single Entity)

Para entidades puras sem relacionamentos hierárquicos.

#### Fluxo Visual

```
┌──────────────────────────────────────────────────────────────────────────┐
│ PÁGINA DE LISTAGEM                                                        │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ [← Voltar]  Categorias                              [+ Nova] [⋮]    │ │
│  │             Gerencie as categorias do sistema                       │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ 🔍 Buscar categorias...                          [Filtros] [📊 📋]  │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ [📊 8] [✅ 6] [❌ 2]                                                 │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                        │
│  │ 📁      │ │ 📁      │ │ 📁      │ │ 📁      │  ← Grid de Cards      │
│  │Eletrô...│ │ Roupas  │ │Alimentos│ │Móveis   │                        │
│  │ 12 itens│ │ 8 itens │ │ 25 itens│ │ 5 itens │                        │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘                        │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ 4 selecionados    [👁️ Ver] [✏️ Editar] [📋 Duplicar] [🗑️ Excluir] │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ (Click em "Nova" ou "Editar")
┌──────────────────────────────────────────────────────────────────────────┐
│ MODAL DE CRIAÇÃO/EDIÇÃO                                                  │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                        Nova Categoria                           [X] │ │
│  │  ─────────────────────────────────────────────────────────────────  │ │
│  │                                                                      │ │
│  │  Nome *                                                             │ │
│  │  ┌─────────────────────────────────────────────────────────────┐   │ │
│  │  │ Eletrônicos                                                  │   │ │
│  │  └─────────────────────────────────────────────────────────────┘   │ │
│  │                                                                      │ │
│  │  Descrição                                                          │ │
│  │  ┌─────────────────────────────────────────────────────────────┐   │ │
│  │  │ Produtos eletrônicos e tecnologia                           │   │ │
│  │  └─────────────────────────────────────────────────────────────┘   │ │
│  │                                                                      │ │
│  │  Cor                           Status                               │ │
│  │  ┌──────────────────────┐     ┌──────────────────────┐             │ │
│  │  │ 🔵 Azul          [▼] │     │ ✅ Ativo         [▼] │             │ │
│  │  └──────────────────────┘     └──────────────────────┘             │ │
│  │                                                                      │ │
│  │  ─────────────────────────────────────────────────────────────────  │ │
│  │                                       [Cancelar]  [💾 Salvar]       │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ (Click em "Ver" com 1 item)
┌──────────────────────────────────────────────────────────────────────────┐
│ MODAL DE VISUALIZAÇÃO                                                    │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                       Eletrônicos                              [X]  │ │
│  │  ─────────────────────────────────────────────────────────────────  │ │
│  │                                                                      │ │
│  │  ┌──────────────────────────────────────────────────────────────┐  │ │
│  │  │  🔵                                                          │  │ │
│  │  │  Eletrônicos                                      ✅ Ativo   │  │ │
│  │  │  Produtos eletrônicos e tecnologia                          │  │ │
│  │  └──────────────────────────────────────────────────────────────┘  │ │
│  │                                                                      │ │
│  │  📊 Estatísticas                                                    │ │
│  │  ┌──────────────────────────────────────────────────────────────┐  │ │
│  │  │  12 Produtos  │  R$ 45.000  │  Criado: 15/01/2025           │  │ │
│  │  └──────────────────────────────────────────────────────────────┘  │ │
│  │                                                                      │ │
│  │  ─────────────────────────────────────────────────────────────────  │ │
│  │  [📋 Duplicar]  [🗑️ Excluir]                        [✏️ Editar]   │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

#### Configuração do Tipo 1

```typescript
// config/entities/categories.config.ts

import type { SimpleEntityConfig } from '@core/types';

export const categoryConfig: SimpleEntityConfig<Category> = {
  // Identificação
  name: 'Categoria',
  namePlural: 'Categorias',
  key: 'categories',
  icon: Folder,
  
  // ⭐ Tipo de página
  pageType: 'simple',        // 'simple' = CRUD em modais
  
  // Rotas (apenas lista, sem páginas de detalhe)
  routes: {
    list: '/admin/categories',
    // Não tem detail/create/edit - tudo em modal
  },
  
  // Display
  display: {
    titleField: 'name',
    subtitleField: 'description',
    colorField: 'color',
    badgeField: 'isActive',
  },
  
  // Grid
  grid: {
    defaultView: 'grid',
    availableViews: ['grid', 'list'],
    columns: [
      { field: 'name', label: 'Nome', sortable: true },
      { field: 'description', label: 'Descrição' },
      { field: 'color', label: 'Cor', type: 'color' },
      { field: 'isActive', label: 'Status', type: 'boolean' },
      { field: 'productCount', label: 'Produtos', type: 'number' },
    ],
  },
  
  // Formulário (usado no modal)
  form: {
    columns: 2,
    sections: [
      {
        id: 'basic',
        title: 'Informações',
        fields: [
          { name: 'name', label: 'Nome', type: 'text', required: true, colSpan: 2 },
          { name: 'description', label: 'Descrição', type: 'textarea', colSpan: 2 },
          { name: 'color', label: 'Cor', type: 'color' },
          { name: 'isActive', label: 'Ativo', type: 'switch', defaultValue: true },
        ],
      },
    ],
  },
  
  // Viewer (para modal de visualização)
  viewer: {
    sections: [
      {
        id: 'header',
        type: 'header',
        fields: ['color', 'name', 'isActive', 'description'],
      },
      {
        id: 'stats',
        title: 'Estatísticas',
        type: 'stats',
        stats: [
          { field: 'productCount', label: 'Produtos', icon: Package },
          { field: 'totalValue', label: 'Valor Total', format: 'currency' },
          { field: 'createdAt', label: 'Criado em', format: 'date' },
        ],
      },
    ],
  },
  
  // Ações
  actions: {
    header: {
      create: true,             // Botão "Nova Categoria" → abre modal
    },
    item: {
      view: true,               // "Ver" → abre modal de visualização
      edit: true,               // "Editar" → abre modal de edição
      duplicate: true,
      delete: true,
    },
    batch: {
      delete: { enabled: true },
      duplicate: { enabled: true },
    },
  },
  
  // Permissões
  permissions: {
    list: 'categories.list',
    view: 'categories.view',
    create: 'categories.create',
    update: 'categories.update',
    delete: 'categories.delete',
  },
};
```

#### Componente de Página Tipo 1

```typescript
// @core/crud/pages/SimpleCrudPage.tsx

interface SimpleCrudPageProps<T extends BaseEntity> {
  config: SimpleEntityConfig<T>;
}

export function SimpleCrudPage<T extends BaseEntity>({
  config,
}: SimpleCrudPageProps<T>) {
  const { 
    items, 
    isLoading, 
    error,
    selection,
    modals,
    handlers,
    batchOperations,
  } = useEntityPage(config);
  
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  
  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <PageHeader
        title={config.namePlural}
        description={config.description}
        actions={[
          {
            label: `Novo ${config.name}`,
            icon: Plus,
            onClick: () => modals.open('create'),
            permission: config.permissions.create,
          },
        ]}
      />
      
      {/* Search */}
      <SearchSection 
        placeholder={`Buscar ${config.namePlural.toLowerCase()}...`}
        onSearch={handlers.handleSearch}
        filters={config.filters}
      />
      
      {/* Stats */}
      {config.stats && (
        <StatsSection stats={config.stats} data={items} />
      )}
      
      {/* Grid */}
      <EntityGrid
        config={config.grid}
        items={items}
        selectedIds={selection.selectedIds}
        onItemClick={handlers.handleItemClick}
        onItemDoubleClick={(id) => modals.open('view', { id })}
      />
      
      {/* Selection Toolbar */}
      {selection.hasSelection && (
        <SelectionToolbar
          count={selection.count}
          actions={config.actions.item}
          onAction={handlers.handleBulkAction}
        />
      )}
      
      {/* ⭐ MODAIS DE CRUD */}
      <EntityCrudModal
        config={config}
        mode={modals.mode}
        item={modals.currentItem}
        isOpen={modals.isOpen('create') || modals.isOpen('edit') || modals.isOpen('view')}
        onClose={modals.closeAll}
        onSuccess={handlers.refresh}
      />
      
      {/* Dialogs de confirmação */}
      <ConfirmDialog
        open={modals.isOpen('delete')}
        title="Confirmar exclusão"
        message={`Excluir ${selection.count} ${selection.count === 1 ? config.name : config.namePlural}?`}
        onConfirm={handlers.handleDeleteConfirm}
        onCancel={() => modals.close('delete')}
        variant="destructive"
      />
      
      {/* Progresso de batch */}
      <BatchProgressDialog
        operation={batchOperations.current}
        entityName={config.namePlural}
      />
    </div>
  );
}
```

---

### TIPO 2: CRUD Hierárquico/Composto (Multi Entity)

Para entidades com relacionamentos hierárquicos ou que contêm outras entidades.

#### Fluxo Visual - Exemplo: Localizações

```
┌──────────────────────────────────────────────────────────────────────────┐
│ PÁGINA DE LISTAGEM (Nível 1 - Localizações Raiz)                         │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ Localizações                                    [+ Nova Localização] │ │
│  │ Gerencie os locais físicos de armazenamento                         │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                        │
│  │ 🏭      │ │ 🏭      │ │ 🏭      │ │ 🏭      │                        │
│  │Armazém A│ │Armazém B│ │Armazém C│ │Depósito │                        │
│  │ 12 subs │ │ 8 subs  │ │ 5 subs  │ │ 3 subs  │                        │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘                        │
│                                                                           │
│  Double-click ou "Ver" →                                                  │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ PÁGINA DE DETALHE (Nível 2 - Sublocalizações)                            │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ 🏭 Armazém A                               [✏️ Editar] [🗑️ Excluir] │ │
│  │ WAREHOUSE - Ativo                                                    │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│  Localizações > Armazém A                        [+ Nova Sublocalização] │
│  ──────────────────────────────────────                                   │
│                                                                           │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                        │
│  │ 📦      │ │ 📦      │ │ 📦      │ │ 📦      │  ← Sublocalizações     │
│  │Corredor1│ │Corredor2│ │Corredor3│ │Corredor4│                        │
│  │ 8 subs  │ │ 6 subs  │ │ 10 subs │ │ 4 subs  │                        │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘                        │
│                                                                           │
│  Double-click ou "Ver" →                                                  │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ PÁGINA DE DETALHE (Nível 3 - Sub-sublocalizações)                        │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ 📦 Corredor 1                              [✏️ Editar] [🗑️ Excluir] │ │
│  │ AISLE - Ativo                                                        │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│  Localizações > Armazém A > Corredor 1           [+ Nova Sublocalização] │
│  ──────────────────────────────────────────────                           │
│                                                                           │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                        │
│  │ 🗄️      │ │ 🗄️      │ │ 🗄️      │ │ 🗄️      │  ← Prateleiras       │
│  │Prat. A1 │ │Prat. A2 │ │Prat. A3 │ │Prat. A4 │                        │
│  │ 4 bins  │ │ 6 bins  │ │ 5 bins  │ │ 3 bins  │                        │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘                        │
└──────────────────────────────────────────────────────────────────────────┘
```

#### Fluxo Visual - Exemplo: Grupos de Acesso

```
┌──────────────────────────────────────────────────────────────────────────┐
│ PÁGINA DE LISTAGEM (Grupos)                                              │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ Grupos de Acesso                                   [+ Novo Grupo]    │ │
│  │ Gerencie grupos e permissões                                         │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                        │
│  │ 👑      │ │ 👤      │ │ 📦      │ │ 💰      │                        │
│  │Admins   │ │Gerentes │ │Estoque  │ │Vendas   │                        │
│  │ 3 users │ │ 8 users │ │ 12 users│ │ 20 users│                        │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘                        │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ PÁGINA DE DETALHE (Grupo com Múltiplas Entidades)                        │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ 👑 Administradores                         [✏️ Editar] [🗑️ Excluir] │ │
│  │ Acesso total ao sistema                                              │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ [👤 Usuários (3)]  [🔐 Permissões (45)]  [📊 Auditoria]            │ │ ← Tabs
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│  ══════════════════════════════════════════════════════════════════════  │
│                                                                           │
│  👤 USUÁRIOS DO GRUPO                                   [+ Adicionar]    │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ 👤 João Silva          admin@empresa.com         [✏️] [🗑️]         │ │
│  │ 👤 Maria Santos        maria@empresa.com         [✏️] [🗑️]         │ │
│  │ 👤 Pedro Costa         pedro@empresa.com         [✏️] [🗑️]         │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Click na tab "Permissões"
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ [👤 Usuários (3)]  [🔐 Permissões (45)]  [📊 Auditoria]            │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│  ══════════════════════════════════════════════════════════════════════  │
│                                                                           │
│  🔐 PERMISSÕES DO GRUPO                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ 📦 Estoque                                                          │ │
│  │    ✅ Visualizar   ✅ Criar   ✅ Editar   ✅ Excluir   ✅ Exportar  │ │
│  ├─────────────────────────────────────────────────────────────────────┤ │
│  │ 💰 Vendas                                                           │ │
│  │    ✅ Visualizar   ✅ Criar   ✅ Editar   ✅ Excluir   ✅ Exportar  │ │
│  ├─────────────────────────────────────────────────────────────────────┤ │
│  │ 👥 Usuários                                                         │ │
│  │    ✅ Visualizar   ✅ Criar   ✅ Editar   ✅ Excluir   ❌ Exportar  │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

#### Fluxo Visual - Exemplo: Produtos → Variantes → Itens

```
┌──────────────────────────────────────────────────────────────────────────┐
│ PÁGINA DE LISTAGEM (Produtos)                                            │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ Produtos                                            [+ Novo Produto] │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                                    │
│  │ 👕      │ │ 👖      │ │ 👟      │                                    │
│  │Camiseta │ │ Calça   │ │ Tênis   │                                    │
│  │ 4 vars  │ │ 3 vars  │ │ 6 vars  │                                    │
│  └─────────┘ └─────────┘ └─────────┘                                    │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ PÁGINA DE DETALHE (Produto com Abas)                                     │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ 👕 Camiseta Básica                         [✏️ Editar] [🗑️ Excluir] │ │
│  │ SKU: CAM-001 | Categoria: Vestuário                                  │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ [📋 Geral]  [🎨 Variantes (4)]  [📦 Estoque]  [📊 Vendas]          │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│  ══════════════════════════════════════════════════════════════════════  │
│                                                                           │
│  🎨 VARIANTES                                          [+ Nova Variante] │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ 🔴 Vermelho P    SKU: CAM-001-VP    12 itens    [👁️] [✏️] [🗑️]    │ │
│  │ 🔴 Vermelho M    SKU: CAM-001-VM    8 itens     [👁️] [✏️] [🗑️]    │ │
│  │ 🔵 Azul P        SKU: CAM-001-AP    15 itens    [👁️] [✏️] [🗑️]    │ │
│  │ 🔵 Azul M        SKU: CAM-001-AM    10 itens    [👁️] [✏️] [🗑️]    │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ Click em "👁️ Ver" na variante
┌──────────────────────────────────────────────────────────────────────────┐
│ PÁGINA DE DETALHE (Variante com Itens)                                   │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ 🔴 Vermelho P                              [✏️ Editar] [🗑️ Excluir] │ │
│  │ Camiseta Básica > Vermelho P                                         │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│  Produtos > Camiseta > Vermelho P                                        │
│  ─────────────────────────────────                                        │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ [📋 Detalhes]  [📦 Itens (12)]  [🏷️ Preços]  [📊 Movimentações]    │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│  ══════════════════════════════════════════════════════════════════════  │
│                                                                           │
│  📦 ITENS EM ESTOQUE                                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ #001  NF 12345  Armazém A > Prat.1   Em estoque   [👁️] [🗑️]       │ │
│  │ #002  NF 12346  Armazém A > Prat.2   Em estoque   [👁️] [🗑️]       │ │
│  │ #003  NF 12347  Armazém B > Prat.1   Reservado    [👁️] [🗑️]       │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

#### Configuração do Tipo 2

```typescript
// config/entities/locations.config.ts

import type { HierarchicalEntityConfig } from '@core/types';

export const locationConfig: HierarchicalEntityConfig<Location> = {
  // Identificação
  name: 'Localização',
  namePlural: 'Localizações',
  key: 'locations',
  icon: Warehouse,
  
  // ⭐ Tipo de página
  pageType: 'hierarchical',    // Navegação para páginas de detalhe
  
  // Configuração hierárquica
  hierarchy: {
    parentField: 'parentId',           // Campo que define o pai
    childrenField: 'children',         // Campo com filhos (se tiver)
    
    // Níveis da hierarquia
    levels: [
      { type: 'WAREHOUSE', name: 'Armazém', icon: Warehouse },
      { type: 'ZONE', name: 'Zona', icon: SquareDashed },
      { type: 'AISLE', name: 'Corredor', icon: SquareStack },
      { type: 'SHELF', name: 'Prateleira', icon: Grid3x2 },
      { type: 'BIN', name: 'Caixa', icon: Package },
    ],
    
    // Nome do filho no contexto do pai
    childName: 'Sublocalização',
    childNamePlural: 'Sublocalizações',
  },
  
  // Rotas
  routes: {
    list: '/stock/locations',
    detail: (id) => `/stock/locations/${id}`,  // Detalhe = lista de filhos
    create: '/stock/locations/new',            // Pode ser modal ou página
    edit: (id) => `/stock/locations/${id}/edit`,
  },
  
  // Display
  display: {
    titleField: 'name',
    subtitleField: 'type',
    badgeField: 'isActive',
  },
  
  // Grid (para lista de filhos)
  grid: {
    defaultView: 'grid',
    columns: [
      { field: 'code', label: 'Código' },
      { field: 'name', label: 'Nome' },
      { field: 'type', label: 'Tipo', type: 'badge' },
      { field: 'childCount', label: 'Sublocalizações', type: 'number' },
      { field: 'isActive', label: 'Status', type: 'boolean' },
    ],
  },
  
  // Formulário (renderizado em modal)
  form: {
    sections: [
      {
        id: 'basic',
        title: 'Informações',
        fields: [
          { name: 'code', label: 'Código', type: 'text', required: true },
          { name: 'name', label: 'Nome', type: 'text', required: true },
          { name: 'type', label: 'Tipo', type: 'select', options: locationTypes },
          { name: 'capacity', label: 'Capacidade', type: 'number' },
          { name: 'isActive', label: 'Ativo', type: 'switch', defaultValue: true },
        ],
      },
    ],
  },
  
  // Breadcrumb
  breadcrumb: {
    rootLabel: 'Localizações',
    rootPath: '/stock/locations',
    getAncestors: (item, allItems) => {
      // Lógica para obter ancestrais
      const ancestors: Location[] = [];
      let current = item;
      while (current.parentId) {
        const parent = allItems.find(i => i.id === current.parentId);
        if (parent) {
          ancestors.unshift(parent);
          current = parent;
        } else break;
      }
      return ancestors;
    },
  },
  
  // Ações
  actions: {
    header: {
      create: true,                // "Nova Localização" / "Nova Sublocalização"
    },
    item: {
      view: true,                  // Navega para página de detalhe
      edit: true,                  // Abre modal de edição
      duplicate: true,
      delete: true,
    },
    detail: {
      edit: true,                  // Editar a entidade atual
      delete: true,                // Excluir a entidade atual
    },
  },
  
  // Permissões
  permissions: {
    list: 'locations.list',
    view: 'locations.view',
    create: 'locations.create',
    update: 'locations.update',
    delete: 'locations.delete',
  },
};

// =====================================================
// CONFIGURAÇÃO COM MÚLTIPLAS ENTIDADES (TABS)
// =====================================================

export const accessGroupConfig: CompositeEntityConfig<AccessGroup> = {
  name: 'Grupo de Acesso',
  namePlural: 'Grupos de Acesso',
  key: 'access-groups',
  icon: Shield,
  
  pageType: 'composite',           // Página com múltiplas entidades
  
  routes: {
    list: '/admin/access-groups',
    detail: (id) => `/admin/access-groups/${id}`,
  },
  
  // ⭐ Entidades relacionadas (exibidas em tabs)
  relatedEntities: [
    {
      key: 'users',
      name: 'Usuário',
      namePlural: 'Usuários',
      icon: Users,
      
      // Relacionamento
      relation: {
        type: 'many-to-many',
        foreignKey: 'groupId',
        through: 'user_groups',      // Tabela de junção
      },
      
      // Grid para listar dentro da tab
      grid: {
        columns: [
          { field: 'name', label: 'Nome' },
          { field: 'email', label: 'E-mail' },
          { field: 'role', label: 'Cargo' },
        ],
      },
      
      // Ações permitidas
      actions: {
        add: true,                   // Adicionar usuário ao grupo
        remove: true,                // Remover usuário do grupo
        view: true,                  // Ver detalhes (navega para /users/:id)
      },
    },
    {
      key: 'permissions',
      name: 'Permissão',
      namePlural: 'Permissões',
      icon: Lock,
      
      relation: {
        type: 'many-to-many',
        foreignKey: 'groupId',
        through: 'group_permissions',
      },
      
      // Componente customizado para permissões (matriz)
      customComponent: PermissionMatrix,
    },
    {
      key: 'audit',
      name: 'Auditoria',
      namePlural: 'Auditoria',
      icon: ClipboardList,
      
      relation: {
        type: 'one-to-many',
        foreignKey: 'groupId',
      },
      
      // Apenas visualização
      actions: {
        add: false,
        remove: false,
        view: true,
      },
    },
  ],
  
  // Tabs
  tabs: {
    defaultTab: 'users',
    persistInUrl: true,
  },
  
  // Formulário principal (para criar/editar grupo)
  form: {
    sections: [
      {
        id: 'basic',
        fields: [
          { name: 'name', label: 'Nome', type: 'text', required: true },
          { name: 'description', label: 'Descrição', type: 'textarea' },
          { name: 'isActive', label: 'Ativo', type: 'switch' },
        ],
      },
    ],
  },
};
```

#### Componente de Página Tipo 2 - Hierárquico

```typescript
// @core/crud/pages/HierarchicalCrudPage.tsx

interface HierarchicalCrudPageProps<T extends BaseEntity> {
  config: HierarchicalEntityConfig<T>;
  parentId?: string;              // ID do pai (quando é página de detalhe)
}

export function HierarchicalCrudPage<T extends BaseEntity>({
  config,
  parentId,
}: HierarchicalCrudPageProps<T>) {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // Hook principal
  const {
    items,
    parentItem,              // Dados do pai (quando em página de detalhe)
    ancestors,               // Para breadcrumb
    isLoading,
    error,
    selection,
    modals,
    handlers,
    batchOperations,
  } = useHierarchicalEntityPage(config, { parentId });
  
  // Determinar contexto
  const isRootLevel = !parentId;
  const isDetailLevel = !!parentId;
  
  // Filtrar filhos
  const childItems = isRootLevel 
    ? items.filter(i => !i[config.hierarchy.parentField])
    : items.filter(i => i[config.hierarchy.parentField] === parentId);
  
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  
  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      {isDetailLevel && parentItem ? (
        // Header de detalhe (mostra info do pai)
        <DetailHeader
          item={parentItem}
          config={config}
          onEdit={() => modals.open('edit', { id: parentId })}
          onDelete={() => modals.open('delete', { ids: [parentId!] })}
        />
      ) : (
        // Header de lista root
        <PageHeader
          title={config.namePlural}
          description={config.description}
          actions={[
            {
              label: `Nova ${config.name}`,
              icon: Plus,
              onClick: () => modals.open('create'),
            },
          ]}
        />
      )}
      
      {/* Search */}
      <SearchSection
        placeholder={`Buscar ${isDetailLevel ? config.hierarchy.childNamePlural : config.namePlural}...`}
        onSearch={handlers.handleSearch}
      />
      
      {/* Stats */}
      <StatsSection 
        stats={generateStats(childItems, config)} 
        defaultExpanded 
      />
      
      {/* Breadcrumb (apenas em níveis de detalhe) */}
      {isDetailLevel && (
        <Breadcrumb
          items={[
            { label: config.breadcrumb.rootLabel, href: config.breadcrumb.rootPath },
            ...ancestors.map(a => ({
              label: a[config.display.titleField],
              href: config.routes.detail(a.id),
            })),
            { label: parentItem?.[config.display.titleField], current: true },
          ]}
          actions={
            <Button onClick={() => modals.open('create')}>
              <Plus className="w-4 h-4 mr-2" />
              Nova {config.hierarchy.childName}
            </Button>
          }
        />
      )}
      
      {/* Grid de filhos */}
      <EntityGrid
        config={config.grid}
        items={childItems}
        selectedIds={selection.selectedIds}
        onItemClick={handlers.handleItemClick}
        onItemDoubleClick={(id) => {
          // Navega para página de detalhe do filho
          router.push(config.routes.detail(id));
        }}
      />
      
      {/* Selection Toolbar */}
      {selection.hasSelection && (
        <SelectionToolbar
          count={selection.count}
          actions={config.actions.item}
          onAction={handlers.handleBulkAction}
        />
      )}
      
      {/* ⭐ MODAL DE CRUD (Create/Edit) */}
      <EntityCrudModal
        config={config}
        mode={modals.mode}
        item={modals.currentItem}
        isOpen={modals.isOpen('create') || modals.isOpen('edit')}
        onClose={modals.closeAll}
        onSuccess={handlers.refresh}
        // Passa o pai para criar como filho
        parentId={parentId}
        parentItem={parentItem}
      />
      
      {/* Dialogs e Progress */}
      <ConfirmDialog {...deleteDialogProps} />
      <BatchProgressDialog {...batchProgressProps} />
    </div>
  );
}
```

#### Componente de Página Tipo 2 - Composto (com Tabs)

```typescript
// @core/crud/pages/CompositeCrudPage.tsx

interface CompositeCrudPageProps<T extends BaseEntity> {
  config: CompositeEntityConfig<T>;
  id: string;                     // ID da entidade principal
}

export function CompositeCrudPage<T extends BaseEntity>({
  config,
  id,
}: CompositeCrudPageProps<T>) {
  const { activeTab, setActiveTab } = useTabs({
    defaultTab: config.tabs.defaultTab,
    persistInUrl: config.tabs.persistInUrl,
  });
  
  const {
    item,                        // Dados da entidade principal
    relatedData,                 // Dados das entidades relacionadas por tab
    isLoading,
    modals,
    handlers,
  } = useCompositeEntityPage(config, id);
  
  if (isLoading) return <LoadingState />;
  if (!item) return <NotFoundState />;
  
  // Encontrar config da entidade relacionada ativa
  const activeRelation = config.relatedEntities.find(r => r.key === activeTab);
  
  return (
    <div className="flex flex-col gap-4">
      {/* Header da entidade principal */}
      <DetailHeader
        item={item}
        config={config}
        onEdit={() => modals.open('edit-main')}
        onDelete={() => modals.open('delete-main')}
      />
      
      {/* Tabs de entidades relacionadas */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {config.relatedEntities.map(relation => (
            <TabsTrigger key={relation.key} value={relation.key}>
              <relation.icon className="w-4 h-4 mr-2" />
              {relation.namePlural}
              <Badge variant="secondary" className="ml-2">
                {relatedData[relation.key]?.length || 0}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>
        
        {config.relatedEntities.map(relation => (
          <TabsContent key={relation.key} value={relation.key}>
            {/* Componente customizado ou grid padrão */}
            {relation.customComponent ? (
              <relation.customComponent
                mainEntity={item}
                data={relatedData[relation.key]}
                onUpdate={handlers.refreshRelated(relation.key)}
              />
            ) : (
              <RelatedEntitySection
                config={relation}
                items={relatedData[relation.key] || []}
                mainEntityId={id}
                onAdd={() => modals.open(`add-${relation.key}`)}
                onRemove={(ids) => handlers.removeRelated(relation.key, ids)}
                onView={(itemId) => {
                  // Navegar para página da entidade relacionada
                  router.push(relation.routes?.detail?.(itemId));
                }}
              />
            )}
          </TabsContent>
        ))}
      </Tabs>
      
      {/* Modais */}
      {/* Modal de edição da entidade principal */}
      <EntityCrudModal
        config={config}
        mode="edit"
        item={item}
        isOpen={modals.isOpen('edit-main')}
        onClose={() => modals.close('edit-main')}
        onSuccess={handlers.refresh}
      />
      
      {/* Modais de adicionar entidades relacionadas */}
      {config.relatedEntities.map(relation => (
        <AddRelatedEntityModal
          key={`add-${relation.key}`}
          config={relation}
          mainEntityId={id}
          isOpen={modals.isOpen(`add-${relation.key}`)}
          onClose={() => modals.close(`add-${relation.key}`)}
          onSuccess={() => handlers.refreshRelated(relation.key)}
        />
      ))}
    </div>
  );
}
```

---

### Resumo: Quando Usar Cada Tipo

| Característica | Tipo 1: Simples | Tipo 2: Hierárquico/Composto |
|----------------|-----------------|------------------------------|
| **Navegação** | Apenas lista | Lista → Detalhe → Sub-listas |
| **Visualizar** | Abre modal | Navega para página |
| **Criar/Editar** | Modal | Modal |
| **Entidades filhas** | Não tem | Tem (recursivo ou em tabs) |
| **Breadcrumb** | Não necessário | Essencial |
| **Exemplos** | Categorias, Tags, Status | Localizações, Produtos, Grupos |
| **Config** | `SimpleEntityConfig` | `HierarchicalEntityConfig` ou `CompositeEntityConfig` |
| **Componente** | `SimpleCrudPage` | `HierarchicalCrudPage` ou `CompositeCrudPage` |

### Árvore de Decisão

```
A entidade tem filhos ou entidades relacionadas?
│
├── NÃO → TIPO 1: SimpleCrudPage
│         • pageType: 'simple'
│         • CRUD completo em modais
│
└── SIM → Os filhos são da mesma entidade (auto-referência)?
          │
          ├── SIM → TIPO 2A: HierarchicalCrudPage
          │         • pageType: 'hierarchical'
          │         • Navegação recursiva
          │         • Breadcrumb dinâmico
          │         • Ex: Localizações → Sublocalizações
          │
          └── NÃO → Os filhos são de entidades diferentes?
                    │
                    └── SIM → TIPO 2B: CompositeCrudPage
                              • pageType: 'composite'
                              • Tabs para cada entidade
                              • Ex: Grupo → [Usuários, Permissões]
                              • Ex: Produto → [Variantes, Preços, Estoque]
```

---

## 🖥️ Arquitetura do OpenSea OS

### Camadas do Sistema

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            APLICAÇÕES (Apps)                                │
│  📦 Stock  │  💰 Sales  │  👥 HR  │  💳 Finance  │  📊 Reports  │  ⚙️ Admin │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────────────────┐
│                         SERVIÇOS DO SISTEMA (Services)                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │📁 Files  │ │📅 Calendar│ │🔔 Notify │ │📋 Requests│ │⚡ Batch  │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────────────────┐
│                          KERNEL (Core Components)                            │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐                │
│  │ EntityPage      │ │ EntityGrid      │ │ EntityModal     │                │
│  │ Template        │ │ UniversalCard   │ │ System          │                │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘                │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐                │
│  │ Selection       │ │ BatchProcessor  │ │ ErrorBoundary   │                │
│  │ Manager         │ │ System          │ │ System          │                │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘                │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────────────────┐
│                      SEGURANÇA (Security Layer)                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ 🔐 RBAC Engine  │  🔑 Auth  │  🛡️ Permissions  │  📝 Audit Log      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────────────────┐
│                           INFRAESTRUTURA (API Layer)                         │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ API Client  │  Query Cache  │  WebSocket  │  Storage  │  Workers    │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Estrutura de Pastas do OpenSea OS

```
src/
├── @core/                              # 🔧 KERNEL DO SISTEMA
│   ├── components/                     # Componentes fundamentais
│   │   ├── entity/                     # Sistema de entidades
│   │   │   ├── EntityPageTemplate.tsx
│   │   │   ├── EntityGrid.tsx
│   │   │   ├── EntityCard.tsx
│   │   │   ├── EntityForm.tsx
│   │   │   ├── EntityViewer.tsx
│   │   │   ├── EntityContextMenu.tsx
│   │   │   └── index.ts
│   │   ├── selection/                  # Sistema de seleção
│   │   │   ├── SelectionProvider.tsx
│   │   │   ├── SelectionToolbar.tsx
│   │   │   ├── SelectionCheckbox.tsx
│   │   │   └── index.ts
│   │   ├── batch/                      # Sistema de processamento em lote
│   │   │   ├── BatchProcessor.tsx
│   │   │   ├── BatchProgressDialog.tsx
│   │   │   ├── BatchQueueManager.tsx
│   │   │   └── index.ts
│   │   ├── errors/                     # Sistema de erros
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── ErrorState.tsx
│   │   │   ├── LoadingState.tsx
│   │   │   └── index.ts
│   │   └── layout/                     # Layouts base
│   │       ├── PageLayout.tsx
│   │       ├── PageHeader.tsx
│   │       ├── PageContent.tsx
│   │       └── index.ts
│   │
│   ├── forms/                          # 📝 SISTEMA DE FORMULÁRIOS
│   │   ├── components/
│   │   │   ├── EntityForm.tsx          # Formulário principal
│   │   │   ├── FormSection.tsx         # Seção colapsável
│   │   │   ├── FormActions.tsx         # Botões de ação
│   │   │   ├── FormDebug.tsx           # Debug em dev
│   │   │   └── index.ts
│   │   ├── fields/                     # Campos de formulário
│   │   │   ├── TextField.tsx
│   │   │   ├── TextareaField.tsx
│   │   │   ├── NumberField.tsx
│   │   │   ├── CurrencyField.tsx
│   │   │   ├── SelectField.tsx
│   │   │   ├── MultiSelectField.tsx
│   │   │   ├── ComboboxField.tsx
│   │   │   ├── CheckboxField.tsx
│   │   │   ├── RadioField.tsx
│   │   │   ├── SwitchField.tsx
│   │   │   ├── DateField.tsx
│   │   │   ├── DateRangeField.tsx
│   │   │   ├── TimeField.tsx
│   │   │   ├── FileField.tsx
│   │   │   ├── ImageField.tsx
│   │   │   ├── ColorField.tsx
│   │   │   ├── RichTextField.tsx
│   │   │   ├── CodeField.tsx
│   │   │   ├── JsonField.tsx
│   │   │   ├── ArrayField.tsx          # Lista de items
│   │   │   ├── ObjectField.tsx         # Sub-form
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useEntityForm.ts
│   │   │   ├── useFieldArray.ts
│   │   │   ├── useAutoSave.ts
│   │   │   ├── useFormValidation.ts
│   │   │   └── index.ts
│   │   ├── validation/
│   │   │   ├── schemas/                # Schemas Zod por entidade
│   │   │   ├── rules.ts                # Regras reutilizáveis
│   │   │   └── messages.ts             # Mensagens de erro
│   │   ├── types/
│   │   │   └── form.types.ts
│   │   └── index.ts
│   │
│   ├── tabs/                           # 📑 SISTEMA DE ABAS
│   │   ├── components/
│   │   │   ├── EntityTabs.tsx          # Componente principal
│   │   │   ├── TabList.tsx             # Lista de abas
│   │   │   ├── TabPanel.tsx            # Painel de conteúdo
│   │   │   ├── TabScrollButtons.tsx    # Scroll para muitas abas
│   │   │   └── index.ts
│   │   ├── layouts/
│   │   │   ├── TabPageLayout.tsx       # Layout de página com abas
│   │   │   ├── MasterDetailLayout.tsx  # Lista + detalhe
│   │   │   ├── VerticalTabLayout.tsx   # Abas verticais
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useTabs.ts
│   │   │   ├── useTabPersistence.ts    # Salva aba na URL
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   └── tabs.types.ts
│   │   └── index.ts
│   │
│   ├── crud/                           # 🔄 SISTEMA CRUD
│   │   ├── pages/
│   │   │   ├── CrudListPage.tsx        # Página de listagem
│   │   │   ├── CrudDetailPage.tsx      # Página de detalhe
│   │   │   ├── CrudCreatePage.tsx      # Página de criação
│   │   │   ├── CrudEditPage.tsx        # Página de edição
│   │   │   └── index.ts
│   │   ├── components/
│   │   │   ├── CrudHeader.tsx          # Header com breadcrumbs
│   │   │   ├── CrudToolbar.tsx         # Toolbar com ações
│   │   │   ├── CrudFilters.tsx         # Painel de filtros
│   │   │   ├── CrudPagination.tsx      # Paginação
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useCrud.ts              # Hook principal
│   │   │   ├── useCrudList.ts          # Lista com filtros
│   │   │   ├── useCrudItem.ts          # Item único
│   │   │   ├── useCrudMutations.ts     # Create/Update/Delete
│   │   │   └── index.ts
│   │   ├── factory/
│   │   │   ├── createCrudConfig.ts     # Factory de config
│   │   │   ├── createCrudRoutes.ts     # Gerador de rotas
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   └── crud.types.ts
│   │   └── index.ts
│   │
│   ├── dashboard/                      # 📊 SISTEMA DE DASHBOARD
│   │   ├── components/
│   │   │   ├── Dashboard.tsx           # Container principal
│   │   │   ├── DashboardGrid.tsx       # Grid responsivo
│   │   │   ├── Widget.tsx              # Wrapper de widget
│   │   │   └── index.ts
│   │   ├── widgets/
│   │   │   ├── StatCard.tsx            # Card com estatística
│   │   │   ├── ChartLine.tsx           # Gráfico de linha
│   │   │   ├── ChartBar.tsx            # Gráfico de barras
│   │   │   ├── ChartPie.tsx            # Gráfico de pizza
│   │   │   ├── ChartArea.tsx           # Gráfico de área
│   │   │   ├── DataTable.tsx           # Mini tabela
│   │   │   ├── ActivityFeed.tsx        # Feed de atividades
│   │   │   ├── ProgressWidget.tsx      # Barra de progresso
│   │   │   ├── MiniCalendar.tsx        # Calendário pequeno
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useDashboard.ts
│   │   │   ├── useWidgetData.ts
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   └── dashboard.types.ts
│   │   └── index.ts
│   │
│   ├── search/                         # 🔍 SISTEMA DE BUSCA
│   │   ├── components/
│   │   │   ├── SearchBar.tsx           # Barra de busca
│   │   │   ├── SearchFilters.tsx       # Filtros laterais
│   │   │   ├── SearchResults.tsx       # Resultados
│   │   │   ├── SearchFacets.tsx        # Facetas (contagem)
│   │   │   ├── SearchHistory.tsx       # Histórico de buscas
│   │   │   ├── GlobalSearch.tsx        # Busca global (Cmd+K)
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useSearch.ts
│   │   │   ├── useSearchHistory.ts
│   │   │   ├── useGlobalSearch.ts
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   └── search.types.ts
│   │   └── index.ts
│   │
│   ├── hooks/                          # Hooks fundamentais
│   │   ├── useEntityPage.ts
│   │   ├── useEntityCrud.ts
│   │   ├── useSelection.ts
│   │   ├── useBatchOperation.ts
│   │   ├── useModals.ts
│   │   ├── usePermissions.ts
│   │   └── index.ts
│   ├── providers/                      # Providers globais
│   │   ├── CoreProvider.tsx            # Combina todos os providers
│   │   ├── SelectionProvider.tsx
│   │   ├── BatchQueueProvider.tsx
│   │   ├── NotificationProvider.tsx
│   │   └── index.ts
│   ├── types/                          # Tipos fundamentais
│   │   ├── entity.types.ts
│   │   ├── page.types.ts
│   │   ├── selection.types.ts
│   │   ├── batch.types.ts
│   │   └── index.ts
│   └── utils/                          # Utilitários
│       ├── formatters.ts
│       ├── validators.ts
│       ├── helpers.ts
│       └── index.ts
│
├── @services/                          # 🔌 SERVIÇOS DO SISTEMA
│   ├── files/                          # 📁 Gerenciador de Arquivos
│   │   ├── components/
│   │   │   ├── FileManager.tsx
│   │   │   ├── FileBrowser.tsx
│   │   │   ├── FileGrid.tsx
│   │   │   ├── FileList.tsx
│   │   │   ├── FilePreview.tsx
│   │   │   ├── FileUploader.tsx
│   │   │   ├── FolderTree.tsx
│   │   │   ├── FileContextMenu.tsx
│   │   │   ├── FileInfoPanel.tsx
│   │   │   ├── ShareDialog.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useFiles.ts
│   │   │   ├── useFolders.ts
│   │   │   ├── useFileUpload.ts
│   │   │   ├── useFileOperations.ts
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   └── files.service.ts
│   │   ├── types/
│   │   │   └── files.types.ts
│   │   └── index.ts
│   │
│   ├── calendar/                       # 📅 Sistema de Calendário
│   │   ├── components/
│   │   │   ├── Calendar.tsx
│   │   │   ├── CalendarHeader.tsx
│   │   │   ├── CalendarGrid.tsx
│   │   │   ├── CalendarEvent.tsx
│   │   │   ├── EventModal.tsx
│   │   │   ├── EventForm.tsx
│   │   │   ├── MiniCalendar.tsx
│   │   │   ├── AgendaView.tsx
│   │   │   ├── WeekView.tsx
│   │   │   ├── MonthView.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useCalendar.ts
│   │   │   ├── useEvents.ts
│   │   │   ├── useReminders.ts
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   └── calendar.service.ts
│   │   ├── types/
│   │   │   └── calendar.types.ts
│   │   └── index.ts
│   │
│   ├── notifications/                  # 🔔 Sistema de Notificações
│   │   ├── components/
│   │   │   ├── NotificationCenter.tsx
│   │   │   ├── NotificationBell.tsx
│   │   │   ├── NotificationList.tsx
│   │   │   ├── NotificationItem.tsx
│   │   │   ├── NotificationToast.tsx
│   │   │   ├── NotificationSettings.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useNotifications.ts
│   │   │   ├── useNotificationSettings.ts
│   │   │   ├── usePushNotifications.ts
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   └── notifications.service.ts
│   │   ├── types/
│   │   │   └── notifications.types.ts
│   │   └── index.ts
│   │
│   ├── requests/                       # 📋 Sistema de Solicitações
│   │   ├── components/
│   │   │   ├── RequestCenter.tsx
│   │   │   ├── RequestList.tsx
│   │   │   ├── RequestCard.tsx
│   │   │   ├── RequestForm.tsx
│   │   │   ├── RequestTimeline.tsx
│   │   │   ├── RequestApproval.tsx
│   │   │   ├── RequestFilters.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useRequests.ts
│   │   │   ├── useRequestApproval.ts
│   │   │   ├── useRequestWorkflow.ts
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   └── requests.service.ts
│   │   ├── types/
│   │   │   └── requests.types.ts
│   │   └── index.ts
│   │
│   ├── modals/                         # 🪟 Sistema de Modais
│   │   ├── components/
│   │   │   ├── ModalProvider.tsx
│   │   │   ├── ModalContainer.tsx
│   │   │   ├── BaseModal.tsx
│   │   │   ├── ConfirmModal.tsx
│   │   │   ├── AlertModal.tsx
│   │   │   ├── FormModal.tsx
│   │   │   ├── ViewerModal.tsx
│   │   │   ├── MultiViewModal.tsx
│   │   │   ├── FullscreenModal.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useModal.ts
│   │   │   ├── useConfirm.ts
│   │   │   ├── useAlert.ts
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   └── modals.types.ts
│   │   └── index.ts
│   │
│   └── batch/                          # ⚡ Sistema de Processamento em Lote
│       ├── components/
│       │   ├── BatchQueue.tsx
│       │   ├── BatchProgress.tsx
│       │   ├── BatchJobCard.tsx
│       │   ├── BatchHistory.tsx
│       │   └── index.ts
│       ├── hooks/
│       │   ├── useBatchQueue.ts
│       │   ├── useBatchJob.ts
│       │   └── index.ts
│       ├── workers/
│       │   ├── batch.worker.ts
│       │   └── index.ts
│       ├── services/
│       │   └── batch.service.ts
│       ├── types/
│       │   └── batch.types.ts
│       └── index.ts
│
├── @security/                          # 🔐 CAMADA DE SEGURANÇA
│   ├── auth/                           # Autenticação
│   │   ├── components/
│   │   │   ├── AuthProvider.tsx
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   ├── ForgotPassword.tsx
│   │   │   ├── SessionManager.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useSession.ts
│   │   │   └── index.ts
│   │   ├── guards/
│   │   │   ├── AuthGuard.tsx
│   │   │   ├── GuestGuard.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── rbac/                           # Controle de Acesso (RBAC)
│   │   ├── components/
│   │   │   ├── RBACProvider.tsx
│   │   │   ├── PermissionGate.tsx
│   │   │   ├── RoleGate.tsx
│   │   │   ├── FeatureGate.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── usePermissions.ts
│   │   │   ├── useRoles.ts
│   │   │   ├── useFeatureFlags.ts
│   │   │   └── index.ts
│   │   ├── config/
│   │   │   ├── permissions.config.ts
│   │   │   ├── roles.config.ts
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   └── rbac.types.ts
│   │   └── index.ts
│   │
│   ├── audit/                          # Auditoria
│   │   ├── hooks/
│   │   │   ├── useAuditLog.ts
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   └── audit.service.ts
│   │   └── index.ts
│   │
│   └── index.ts
│
├── @ui/                                # 🎨 COMPONENTES DE UI
│   ├── primitives/                     # Componentes primitivos (shadcn)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   ├── ...
│   │   └── index.ts
│   ├── composed/                       # Componentes compostos
│   │   ├── SearchInput.tsx
│   │   ├── DateRangePicker.tsx
│   │   ├── MultiSelect.tsx
│   │   ├── DataTable.tsx
│   │   ├── StatsCard.tsx
│   │   └── index.ts
│   └── index.ts
│
├── apps/                               # 📱 APLICAÇÕES
│   ├── stock/                          # Módulo de Estoque
│   │   ├── config/
│   │   │   ├── templates.config.ts
│   │   │   ├── products.config.ts
│   │   │   ├── locations.config.ts
│   │   │   └── index.ts
│   │   ├── components/                 # Componentes específicos
│   │   │   └── ...
│   │   ├── pages/                      # Páginas (ou app/ no Next.js)
│   │   │   └── ...
│   │   └── index.ts
│   │
│   ├── sales/                          # Módulo de Vendas
│   │   ├── config/
│   │   ├── components/
│   │   └── index.ts
│   │
│   ├── admin/                          # Módulo de Administração
│   │   ├── users/
│   │   ├── roles/
│   │   ├── settings/
│   │   └── index.ts
│   │
│   └── shared/                         # Compartilhado entre apps
│       └── ...
│
├── config/                             # ⚙️ CONFIGURAÇÕES GLOBAIS
│   ├── api.config.ts
│   ├── app.config.ts
│   ├── theme.config.ts
│   └── index.ts
│
├── lib/                                # 📚 BIBLIOTECAS
│   ├── api-client.ts
│   ├── query-client.ts
│   ├── storage.ts
│   └── index.ts
│
└── app/                                # 🌐 NEXT.JS APP ROUTER
    ├── (auth)/
    ├── (dashboard)/
    ├── api/
    ├── layout.tsx
    └── ...
```

---

## 🔧 SISTEMAS CORE DO OPENSEA OS

### 1. 📁 Sistema de Gerenciamento de Arquivos (File Manager)

O File Manager é um sistema completo de gestão de arquivos, similar ao explorador de arquivos de um SO, mas integrado ao sistema.

#### Funcionalidades

| Funcionalidade | Descrição |
|----------------|-----------|
| 📂 Navegação | Navegar por pastas e subpastas |
| 📄 Visualização | Preview de arquivos (imagens, PDFs, documentos) |
| ⬆️ Upload | Upload único ou múltiplo com drag & drop |
| ⬇️ Download | Download individual ou em lote (ZIP) |
| ✏️ Renomear | Renomear arquivos e pastas |
| 📋 Copiar/Mover | Copiar e mover entre pastas |
| 🗑️ Excluir | Exclusão com lixeira |
| 🔗 Compartilhar | Links de compartilhamento com permissões |
| 🔍 Busca | Busca por nome, tipo, data, tags |
| 🏷️ Tags | Categorização por tags |
| ℹ️ Metadados | Informações detalhadas do arquivo |
| 📊 Versionamento | Histórico de versões |

#### Interface Principal

```typescript
// @services/files/types/files.types.ts

export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  mimeType?: string;
  size?: number;
  path: string;
  parentId?: string;
  
  // Metadados
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  
  // Versionamento
  version: number;
  versions?: FileVersion[];
  
  // Compartilhamento
  isShared: boolean;
  sharedWith?: SharePermission[];
  publicLink?: string;
  
  // Organização
  tags?: string[];
  starred: boolean;
  
  // Conteúdo (para pastas)
  children?: FileItem[];
  childCount?: number;
}

export interface FileVersion {
  id: string;
  version: number;
  size: number;
  createdAt: Date;
  createdBy: string;
  url: string;
}

export interface SharePermission {
  userId: string;
  permission: 'view' | 'edit' | 'admin';
  expiresAt?: Date;
}

export interface FileOperation {
  type: 'upload' | 'download' | 'copy' | 'move' | 'delete' | 'rename';
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  fileId: string;
  fileName: string;
  error?: string;
}
```

#### Componente Principal

```typescript
// @services/files/components/FileManager.tsx

interface FileManagerProps {
  // Modo de operação
  mode?: 'full' | 'picker' | 'uploader';
  
  // Restrições
  allowedTypes?: string[];           // ['image/*', 'application/pdf']
  maxFileSize?: number;              // Em bytes
  maxFiles?: number;                 // Para upload múltiplo
  
  // Pasta inicial
  initialPath?: string;
  rootPath?: string;                 // Limita navegação
  
  // Callbacks
  onSelect?: (files: FileItem[]) => void;
  onUpload?: (files: File[]) => void;
  
  // Permissões
  canUpload?: boolean;
  canDelete?: boolean;
  canShare?: boolean;
  canCreateFolder?: boolean;
}

export function FileManager({
  mode = 'full',
  ...props
}: FileManagerProps) {
  // Implementação completa do gerenciador
}
```

---

### 2. 📅 Sistema de Calendário (Calendar System)

Sistema completo de calendário com eventos, lembretes e integração com outras partes do sistema.

#### Funcionalidades

| Funcionalidade | Descrição |
|----------------|-----------|
| 📅 Visualizações | Dia, Semana, Mês, Ano, Agenda |
| 📌 Eventos | Criar, editar, excluir eventos |
| 🔄 Recorrência | Eventos recorrentes |
| ⏰ Lembretes | Notificações antes do evento |
| 👥 Participantes | Convidar usuários |
| 🏷️ Categorias | Categorização por cor/tipo |
| 🔗 Vinculação | Vincular a entidades (pedidos, tarefas) |
| 📤 Export/Import | iCal, Google Calendar |
| 🔍 Busca | Buscar eventos |
| 📊 Disponibilidade | Ver disponibilidade de usuários |

#### Tipos

```typescript
// @services/calendar/types/calendar.types.ts

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  
  // Tempo
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  timezone?: string;
  
  // Recorrência
  recurrence?: RecurrenceRule;
  
  // Localização
  location?: string;
  virtualMeetingUrl?: string;
  
  // Participantes
  organizer: string;
  attendees?: EventAttendee[];
  
  // Categorização
  category: EventCategory;
  color?: string;
  
  // Lembretes
  reminders?: EventReminder[];
  
  // Vinculação com entidades
  linkedEntity?: {
    type: 'order' | 'task' | 'request' | 'meeting';
    id: string;
  };
  
  // Status
  status: 'confirmed' | 'tentative' | 'cancelled';
  
  // Metadados
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;          // A cada N dias/semanas/etc
  daysOfWeek?: number[];     // 0-6 (dom-sáb)
  dayOfMonth?: number;       // 1-31
  endDate?: Date;
  occurrences?: number;      // Número de ocorrências
}

export interface EventAttendee {
  userId: string;
  email: string;
  name: string;
  status: 'pending' | 'accepted' | 'declined' | 'tentative';
  required: boolean;
}

export interface EventReminder {
  type: 'notification' | 'email';
  before: number;            // Minutos antes
}

export type EventCategory = 
  | 'meeting'
  | 'task'
  | 'deadline'
  | 'holiday'
  | 'personal'
  | 'other';
```

#### Hook Principal

```typescript
// @services/calendar/hooks/useCalendar.ts

export function useCalendar(options?: CalendarOptions) {
  return {
    // Estado
    events: CalendarEvent[],
    selectedDate: Date,
    view: 'day' | 'week' | 'month' | 'year' | 'agenda',
    
    // Navegação
    goToDate: (date: Date) => void,
    goToToday: () => void,
    goToPrev: () => void,
    goToNext: () => void,
    setView: (view: ViewType) => void,
    
    // Eventos
    createEvent: (event: CreateEventData) => Promise<CalendarEvent>,
    updateEvent: (id: string, data: UpdateEventData) => Promise<CalendarEvent>,
    deleteEvent: (id: string) => Promise<void>,
    
    // Utilidades
    getEventsForDate: (date: Date) => CalendarEvent[],
    getEventsForRange: (start: Date, end: Date) => CalendarEvent[],
    checkAvailability: (userIds: string[], start: Date, end: Date) => Availability[],
  };
}
```

---

### 3. 🔔 Sistema de Notificações (Notification System)

Sistema centralizado de notificações com suporte a múltiplos canais.

#### Tipos de Notificação

| Canal | Descrição |
|-------|-----------|
| 🔔 In-App | Notificações dentro da aplicação |
| 📧 Email | Notificações por email |
| 📱 Push | Notificações push (browser/mobile) |
| 💬 SMS | Notificações por SMS (opcional) |
| 🔗 Webhook | Integrações externas |

#### Categorias

```typescript
// @services/notifications/types/notifications.types.ts

export type NotificationCategory =
  | 'system'           // Atualizações do sistema
  | 'security'         // Alertas de segurança
  | 'stock'            // Alertas de estoque
  | 'sales'            // Notificações de vendas
  | 'request'          // Solicitações pendentes
  | 'calendar'         // Lembretes de eventos
  | 'task'             // Tarefas atribuídas
  | 'mention'          // Menções em comentários
  | 'approval';        // Aprovações necessárias

export interface Notification {
  id: string;
  
  // Conteúdo
  title: string;
  message: string;
  category: NotificationCategory;
  
  // Prioridade
  priority: 'low' | 'normal' | 'high' | 'urgent';
  
  // Ação
  action?: {
    label: string;
    url: string;
  };
  
  // Referência
  reference?: {
    type: string;        // 'order', 'request', 'product'
    id: string;
  };
  
  // Status
  read: boolean;
  readAt?: Date;
  archived: boolean;
  
  // Canais enviados
  channels: NotificationChannel[];
  
  // Metadados
  createdAt: Date;
  expiresAt?: Date;
}

export interface NotificationChannel {
  type: 'in-app' | 'email' | 'push' | 'sms' | 'webhook';
  status: 'pending' | 'sent' | 'failed';
  sentAt?: Date;
  error?: string;
}

export interface NotificationPreferences {
  userId: string;
  
  // Por categoria
  categories: Record<NotificationCategory, {
    enabled: boolean;
    channels: ('in-app' | 'email' | 'push')[];
  }>;
  
  // Horários de silêncio
  quietHours?: {
    enabled: boolean;
    start: string;      // "22:00"
    end: string;        // "08:00"
    timezone: string;
  };
  
  // Resumo por email
  digestEmail?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly';
  };
}
```

#### Hook Principal

```typescript
// @services/notifications/hooks/useNotifications.ts

export function useNotifications() {
  return {
    // Estado
    notifications: Notification[],
    unreadCount: number,
    
    // Ações
    markAsRead: (id: string) => Promise<void>,
    markAllAsRead: () => Promise<void>,
    archive: (id: string) => Promise<void>,
    delete: (id: string) => Promise<void>,
    
    // Preferências
    preferences: NotificationPreferences,
    updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>,
    
    // Real-time
    subscribe: () => void,
    unsubscribe: () => void,
  };
}
```

---

### 4. 📋 Sistema de Solicitações (Request System)

Sistema completo de workflow para solicitações com aprovações multinível.

#### Tipos de Solicitação

```typescript
// @services/requests/types/requests.types.ts

export type RequestType =
  | 'purchase'           // Solicitação de compra
  | 'leave'              // Solicitação de férias/ausência
  | 'expense'            // Reembolso de despesas
  | 'access'             // Acesso a recursos
  | 'change'             // Mudança em dados
  | 'support'            // Suporte técnico
  | 'custom';            // Customizado

export type RequestStatus =
  | 'draft'              // Rascunho
  | 'submitted'          // Enviado
  | 'pending_approval'   // Aguardando aprovação
  | 'approved'           // Aprovado
  | 'rejected'           // Rejeitado
  | 'cancelled'          // Cancelado
  | 'completed';         // Concluído

export interface Request {
  id: string;
  code: string;          // REQ-2025-0001
  
  // Tipo e template
  type: RequestType;
  templateId?: string;
  
  // Conteúdo
  title: string;
  description: string;
  data: Record<string, any>;   // Dados específicos do tipo
  attachments?: FileItem[];
  
  // Solicitante
  requesterId: string;
  requesterName: string;
  department?: string;
  
  // Status e workflow
  status: RequestStatus;
  workflow: WorkflowStep[];
  currentStep: number;
  
  // Aprovações
  approvals: Approval[];
  
  // Datas
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
  completedAt?: Date;
  dueDate?: Date;
  
  // Prioridade
  priority: 'low' | 'normal' | 'high' | 'urgent';
  
  // Comentários
  comments: RequestComment[];
  
  // Histórico
  history: RequestHistoryItem[];
}

export interface WorkflowStep {
  order: number;
  name: string;
  type: 'approval' | 'review' | 'action';
  assignees: string[];       // IDs de usuários ou roles
  requiredApprovals: number; // Quantos precisam aprovar
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
}

export interface Approval {
  stepOrder: number;
  userId: string;
  userName: string;
  decision: 'approved' | 'rejected' | 'pending';
  comment?: string;
  decidedAt?: Date;
}

export interface RequestComment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
  isInternal: boolean;       // Visível só para aprovadores
}
```

#### Workflow Engine

```typescript
// @services/requests/hooks/useRequestWorkflow.ts

export function useRequestWorkflow(requestId: string) {
  return {
    // Estado
    request: Request,
    currentStep: WorkflowStep,
    canApprove: boolean,
    canReject: boolean,
    
    // Ações
    approve: (comment?: string) => Promise<void>,
    reject: (reason: string) => Promise<void>,
    requestChanges: (changes: string) => Promise<void>,
    delegate: (toUserId: string) => Promise<void>,
    escalate: () => Promise<void>,
    
    // Comentários
    addComment: (content: string, isInternal?: boolean) => Promise<void>,
    
    // Timeline
    getTimeline: () => RequestHistoryItem[],
  };
}
```

---

### 5. 🔐 Sistema RBAC (Role-Based Access Control)

Sistema granular de controle de acesso com roles, permissões e feature flags.

#### Estrutura de Permissões

```typescript
// @security/rbac/types/rbac.types.ts

// Recursos do sistema
export type Resource =
  | 'users'
  | 'roles'
  | 'products'
  | 'variants'
  | 'items'
  | 'locations'
  | 'templates'
  | 'orders'
  | 'customers'
  | 'reports'
  | 'settings'
  | 'files'
  | 'requests';

// Ações possíveis
export type Action =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'list'
  | 'export'
  | 'import'
  | 'share'
  | 'approve'
  | 'assign';

// Permissão específica
export interface Permission {
  id: string;
  resource: Resource;
  action: Action;
  
  // Condições (opcional)
  conditions?: {
    ownOnly?: boolean;           // Só seus próprios registros
    department?: string[];       // Só do departamento
    status?: string[];           // Só com determinados status
  };
}

// Role (Papel)
export interface Role {
  id: string;
  name: string;
  description: string;
  
  // Hierarquia
  level: number;                 // 0 = Admin, 10 = Gerente, 20 = Usuário
  inherits?: string[];           // Herda de outros roles
  
  // Permissões
  permissions: Permission[];
  
  // Feature flags
  features: string[];
  
  // Limites
  limits?: {
    maxFileUpload?: number;      // MB
    maxExportRows?: number;
    maxBatchItems?: number;
  };
  
  // Metadados
  isSystem: boolean;             // Role do sistema (não editável)
  createdAt: Date;
  updatedAt: Date;
}

// Usuário com roles
export interface UserWithRoles {
  id: string;
  roles: Role[];
  
  // Permissões específicas do usuário (override)
  customPermissions?: Permission[];
  deniedPermissions?: string[];  // IDs de permissões negadas
  
  // Feature flags específicos
  enabledFeatures?: string[];
  disabledFeatures?: string[];
}
```

#### Configuração de Roles Padrão

```typescript
// @security/rbac/config/roles.config.ts

export const DEFAULT_ROLES: Role[] = [
  {
    id: 'admin',
    name: 'Administrador',
    description: 'Acesso total ao sistema',
    level: 0,
    permissions: [
      { resource: '*', action: '*' }  // Wildcard
    ],
    features: ['*'],
    isSystem: true,
  },
  {
    id: 'manager',
    name: 'Gerente',
    description: 'Gerencia equipe e operações',
    level: 10,
    inherits: ['operator'],
    permissions: [
      { resource: 'users', action: 'read' },
      { resource: 'users', action: 'list' },
      { resource: 'reports', action: '*' },
      { resource: 'requests', action: 'approve' },
      // ... mais permissões
    ],
    features: ['advanced_reports', 'bulk_operations'],
    isSystem: true,
  },
  {
    id: 'operator',
    name: 'Operador',
    description: 'Operações diárias',
    level: 20,
    inherits: ['viewer'],
    permissions: [
      { resource: 'products', action: 'create' },
      { resource: 'products', action: 'update' },
      { resource: 'items', action: '*' },
      { resource: 'locations', action: 'read' },
      // ... mais permissões
    ],
    features: ['quick_create'],
    isSystem: true,
  },
  {
    id: 'viewer',
    name: 'Visualizador',
    description: 'Apenas visualização',
    level: 30,
    permissions: [
      { resource: 'products', action: 'read' },
      { resource: 'products', action: 'list' },
      { resource: 'items', action: 'read' },
      { resource: 'items', action: 'list' },
      // ... mais permissões
    ],
    features: [],
    isSystem: true,
  },
];
```

#### Componentes de Proteção

```typescript
// @security/rbac/components/PermissionGate.tsx

interface PermissionGateProps {
  // Verificação simples
  permission?: string;           // 'products.create'
  
  // Verificação múltipla
  permissions?: string[];
  requireAll?: boolean;          // true = AND, false = OR
  
  // Por resource/action
  resource?: Resource;
  action?: Action;
  
  // Por role
  role?: string;
  roles?: string[];
  minLevel?: number;
  
  // Por feature
  feature?: string;
  
  // Fallback
  fallback?: React.ReactNode;
  
  children: React.ReactNode;
}

export function PermissionGate({
  permission,
  children,
  fallback = null,
  ...props
}: PermissionGateProps) {
  const { hasPermission } = usePermissions();
  
  if (!hasPermission(permission)) {
    return fallback;
  }
  
  return children;
}

// Uso
<PermissionGate permission="products.create">
  <Button>Criar Produto</Button>
</PermissionGate>

<PermissionGate 
  resource="orders" 
  action="approve"
  fallback={<DisabledButton />}
>
  <ApproveButton />
</PermissionGate>

<PermissionGate 
  feature="advanced_reports"
>
  <AdvancedReportsTab />
</PermissionGate>
```

#### Hook de Permissões

```typescript
// @security/rbac/hooks/usePermissions.ts

export function usePermissions() {
  const { user } = useAuth();
  
  return {
    // Verificações
    hasPermission: (permission: string) => boolean,
    hasAnyPermission: (permissions: string[]) => boolean,
    hasAllPermissions: (permissions: string[]) => boolean,
    
    hasRole: (role: string) => boolean,
    hasMinLevel: (level: number) => boolean,
    
    hasFeature: (feature: string) => boolean,
    
    // Verificação com condições
    canAccess: (resource: Resource, action: Action, record?: any) => boolean,
    
    // Lista de permissões
    permissions: Permission[],
    roles: Role[],
    features: string[],
    
    // Limites
    getLimit: (key: string) => number | undefined,
  };
}
```

---

### 6. 🪟 Sistema de Modais (Modal System)

Sistema centralizado para gerenciamento de modais com diferentes tipos e comportamentos.

#### Tipos de Modal

```typescript
// @services/modals/types/modals.types.ts

export type ModalType =
  | 'confirm'        // Confirmação com Sim/Não
  | 'alert'          // Alerta com OK
  | 'form'           // Formulário
  | 'viewer'         // Visualização de dados
  | 'multiView'      // Múltiplas entidades
  | 'fullscreen'     // Tela cheia
  | 'drawer'         // Drawer lateral
  | 'custom';        // Customizado

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalConfig {
  id: string;
  type: ModalType;
  
  // Aparência
  title?: string;
  description?: string;
  size?: ModalSize;
  
  // Comportamento
  closable?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  preventBodyScroll?: boolean;
  
  // Callbacks
  onOpen?: () => void;
  onClose?: () => void;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  
  // Conteúdo
  content?: React.ReactNode;
  data?: any;
}

export interface ConfirmModalOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger' | 'warning';
  icon?: React.ReactNode;
}

export interface AlertModalOptions {
  title: string;
  message: string;
  variant?: 'info' | 'success' | 'warning' | 'error';
  buttonText?: string;
}
```

#### Modal Provider

```typescript
// @services/modals/components/ModalProvider.tsx

interface ModalContextValue {
  // Stack de modais abertos
  modals: ModalConfig[];
  
  // Métodos genéricos
  open: (config: ModalConfig) => string;
  close: (id: string) => void;
  closeAll: () => void;
  update: (id: string, config: Partial<ModalConfig>) => void;
  
  // Métodos utilitários
  confirm: (options: ConfirmModalOptions) => Promise<boolean>;
  alert: (options: AlertModalOptions) => Promise<void>;
  
  // Form modals
  openForm: <T>(config: FormModalConfig<T>) => Promise<T | null>;
  openViewer: (config: ViewerModalConfig) => void;
}

// Uso
const { confirm, alert, open } = useModal();

// Confirmação simples
const confirmed = await confirm({
  title: 'Excluir item?',
  message: 'Esta ação não pode ser desfeita.',
  variant: 'danger',
});

if (confirmed) {
  await deleteItem(id);
}

// Alerta
await alert({
  title: 'Sucesso!',
  message: 'Item criado com sucesso.',
  variant: 'success',
});

// Modal customizado
open({
  id: 'custom-modal',
  type: 'custom',
  title: 'Configurações',
  size: 'lg',
  content: <SettingsForm />,
});
```

---

### 7. ⚡ Sistema de Processamento em Lote (Batch Processing)

Sistema robusto para operações em massa com gerenciamento de fila e throttling.

#### Arquitetura

```typescript
// @services/batch/types/batch.types.ts

export type BatchJobStatus =
  | 'queued'         // Na fila
  | 'running'        // Executando
  | 'paused'         // Pausado
  | 'completed'      // Concluído
  | 'failed'         // Falhou
  | 'cancelled';     // Cancelado

export type BatchOperationType =
  | 'create'
  | 'update'
  | 'delete'
  | 'export'
  | 'import'
  | 'sync';

export interface BatchJob<T = any> {
  id: string;
  name: string;
  
  // Operação
  type: BatchOperationType;
  entityType: string;          // 'products', 'items', etc.
  
  // Itens
  items: BatchItem<T>[];
  totalItems: number;
  
  // Progresso
  status: BatchJobStatus;
  processedItems: number;
  succeededItems: number;
  failedItems: number;
  progress: number;            // 0-100
  
  // Configuração
  config: BatchConfig;
  
  // Timing
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  estimatedTimeRemaining?: number;  // ms
  
  // Resultados
  results: BatchItemResult<T>[];
  errors: BatchError[];
  
  // Usuário
  userId: string;
}

export interface BatchItem<T = any> {
  id: string;
  data: T;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface BatchItemResult<T = any> {
  itemId: string;
  status: 'success' | 'failed';
  result?: T;
  error?: string;
}

export interface BatchConfig {
  // Throttling
  batchSize: number;           // Itens por lote
  delayBetweenItems: number;   // ms entre itens
  delayBetweenBatches: number; // ms entre lotes
  
  // Retry
  maxRetries: number;
  retryDelay: number;          // ms
  
  // Comportamento
  stopOnError: boolean;
  continueOnRateLimit: boolean;
  
  // Prioridade
  priority: 'low' | 'normal' | 'high';
  
  // Callbacks
  onItemComplete?: (result: BatchItemResult) => void;
  onProgress?: (progress: number) => void;
  onComplete?: (job: BatchJob) => void;
}
```

#### Queue Manager

```typescript
// @services/batch/hooks/useBatchQueue.ts

interface BatchQueueContextValue {
  // Estado da fila
  queue: BatchJob[];
  activeJobs: BatchJob[];
  completedJobs: BatchJob[];
  
  // Limites
  maxConcurrentJobs: number;
  
  // Adicionar jobs
  enqueue: <T>(
    name: string,
    items: T[],
    operation: (item: T) => Promise<any>,
    config?: Partial<BatchConfig>
  ) => BatchJob;
  
  // Controle de jobs
  pause: (jobId: string) => void;
  resume: (jobId: string) => void;
  cancel: (jobId: string) => void;
  retry: (jobId: string) => void;
  prioritize: (jobId: string) => void;
  
  // Limpar
  clearCompleted: () => void;
  clearAll: () => void;
  
  // Estatísticas
  stats: {
    totalQueued: number;
    totalRunning: number;
    totalCompleted: number;
    totalFailed: number;
    averageTimePerItem: number;
  };
}

// Uso
const { enqueue, activeJobs } = useBatchQueue();

// Criar job de exclusão em lote
const deleteJob = enqueue(
  'Excluindo produtos',
  productIds,
  async (id) => await deleteProduct(id),
  {
    batchSize: 5,
    delayBetweenItems: 500,
    maxRetries: 3,
    onProgress: (progress) => console.log(`${progress}%`),
  }
);
```

#### Componente de Progresso

```typescript
// @services/batch/components/BatchProgress.tsx

interface BatchProgressProps {
  // Pode mostrar um job específico ou todos
  jobId?: string;
  
  // Posicionamento
  position?: 'inline' | 'toast' | 'modal' | 'panel';
  
  // Controles
  showPauseResume?: boolean;
  showCancel?: boolean;
  showDetails?: boolean;
  
  // Callbacks
  onClose?: () => void;
}

export function BatchProgress({
  jobId,
  position = 'panel',
  ...props
}: BatchProgressProps) {
  // Mostra progresso dos jobs
}
```

---

### 7.1 📋 OPERAÇÕES EM MASSA - Especificação Completa

Sistema padronizado para todas as operações que afetam múltiplos registros simultaneamente.

#### Visão Geral das Operações em Massa

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     OPERAÇÕES EM MASSA - MATRIZ COMPLETA                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┬──────────────┬──────────────┬─────────────┬─────────────┐ │
│  │  OPERAÇÃO   │   VIA API    │ QUEUE MANAGER│ COMPONENTE  │ PERMISSÃO   │ │
│  ├─────────────┼──────────────┼──────────────┼─────────────┼─────────────┤ │
│  │ View Multi  │ GET (batch)  │     ❌       │MultiViewMdl │ entity.read │ │
│  │ Create Batch│ POST /bulk   │     ✅       │BatchProgress│entity.create│ │
│  │ Edit Multi  │ PATCH /bulk  │     ✅       │BulkEditModal│entity.update│ │
│  │ Delete Batch│ DELETE /bulk │     ✅       │BatchProgress│entity.delete│ │
│  │ Duplicate   │ POST /dup    │     ✅       │BatchProgress│entity.create│ │
│  │ Export      │ GET /export  │     ✅       │ExportDialog │entity.export│ │
│  │ Import      │ POST /import │     ✅       │ImportWizard │entity.import│ │
│  └─────────────┴──────────────┴──────────────┴─────────────┴─────────────┘ │
│                                                                             │
│  ⚠️ REGRA: Toda operação com >1 item que bate na API deve passar pelo     │
│     Queue Manager para: rate limiting, retry, progresso, cancelamento      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 7.1.1 Visualização Múltipla (Multi View)

```typescript
// @core/batch/components/MultiViewModal.tsx

interface MultiViewModalProps<T extends BaseEntity> {
  isOpen: boolean;
  onClose: () => void;
  
  // Dados
  items: T[];                        // Itens a visualizar
  currentIndex: number;              // Índice atual
  
  // Config
  config: EntityConfig<T>;           // Configuração da entidade
  viewerConfig: ViewerConfig<T>;     // Config do viewer
  
  // Features
  enableNavigation?: boolean;        // Setas prev/next
  enableComparison?: boolean;        // Modo lado a lado
  enableActions?: boolean;           // Botões Edit/Delete inline
  
  // Callbacks
  onNavigate?: (index: number) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function MultiViewModal<T extends BaseEntity>({
  isOpen,
  onClose,
  items,
  currentIndex,
  config,
  ...props
}: MultiViewModalProps<T>) {
  const [index, setIndex] = useState(currentIndex);
  const [compareMode, setCompareMode] = useState(false);
  const [compareIndex, setCompareIndex] = useState<number | null>(null);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {compareMode 
                ? 'Comparando Itens' 
                : `${config.name} ${index + 1} de ${items.length}`
              }
            </DialogTitle>
            
            {/* Controles de modo */}
            {items.length > 1 && (
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setCompareMode(!compareMode)}
                >
                  <Columns className="h-4 w-4 mr-2" />
                  {compareMode ? 'Modo Normal' : 'Comparar'}
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>
        
        {/* Conteúdo */}
        {compareMode ? (
          <ComparisonView 
            items={items}
            leftIndex={index}
            rightIndex={compareIndex ?? (index + 1) % items.length}
            config={config}
          />
        ) : (
          <EntityViewer 
            config={config.viewerConfig}
            item={items[index]}
            mode="view"
          />
        )}
        
        {/* Navegação */}
        {items.length > 1 && !compareMode && (
          <NavigationControls
            current={index}
            total={items.length}
            onPrevious={() => setIndex(i => Math.max(0, i - 1))}
            onNext={() => setIndex(i => Math.min(items.length - 1, i + 1))}
          />
        )}
        
        {/* Ações inline */}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          {props.enableActions && (
            <>
              <Button 
                variant="outline" 
                onClick={() => props.onEdit?.(items[index].id)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => props.onDelete?.(items[index].id)}
              >
                <Trash className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

#### 7.1.2 Edição em Massa (Bulk Edit)

```typescript
// @core/batch/components/BulkEditModal.tsx

interface BulkEditField<T> {
  field: keyof T;
  label: string;
  type: FieldType;
  options?: FieldOption[];          // Para select/multi-select
  
  // Comportamento em bulk
  bulkBehavior: 
    | 'replace'                      // Substitui valor
    | 'append'                       // Adiciona (para arrays)
    | 'remove'                       // Remove (para arrays)
    | 'increment'                    // Soma ao valor atual
    | 'toggle';                      // Inverte booleano
}

interface BulkEditConfig<T extends BaseEntity> {
  entityName: string;
  entityNamePlural: string;
  
  // Campos editáveis em massa
  fields: BulkEditField<T>[];
  
  // API
  endpoint: string;                  // PATCH /api/products/bulk
  
  // Validação
  validate?: (data: Partial<T>, ids: string[]) => ValidationResult;
}

interface BulkEditModalProps<T extends BaseEntity> {
  isOpen: boolean;
  onClose: () => void;
  
  // Itens selecionados
  selectedIds: string[];
  selectedItems?: T[];               // Para mostrar preview
  
  // Config
  config: BulkEditConfig<T>;
  
  // Callbacks
  onSuccess?: () => void;
}

export function BulkEditModal<T extends BaseEntity>({
  isOpen,
  onClose,
  selectedIds,
  config,
  onSuccess,
}: BulkEditModalProps<T>) {
  const [selectedFields, setSelectedFields] = useState<Set<keyof T>>(new Set());
  const [values, setValues] = useState<Partial<T>>({});
  
  // ⚠️ INTEGRAÇÃO COM QUEUE MANAGER
  const { enqueue, activeJob } = useBatchQueue();
  
  const handleSubmit = async () => {
    // Valida antes de enviar
    const validation = config.validate?.(values, selectedIds);
    if (validation?.hasErrors) {
      toast.error('Corrija os erros antes de continuar');
      return;
    }
    
    // Enfileira operação no Queue Manager
    enqueue(
      `Atualizando ${selectedIds.length} ${config.entityNamePlural}`,
      selectedIds,
      async (id) => {
        return await api.patch(`${config.endpoint}/${id}`, values);
      },
      {
        batchSize: 5,
        delayBetweenItems: 300,
        onComplete: () => {
          toast.success(`${selectedIds.length} itens atualizados!`);
          onSuccess?.();
          onClose();
        },
      }
    );
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Editar {selectedIds.length} {config.entityNamePlural}
          </DialogTitle>
          <DialogDescription>
            Selecione os campos que deseja alterar. Os valores serão aplicados 
            a todos os itens selecionados.
          </DialogDescription>
        </DialogHeader>
        
        {/* Seleção de campos */}
        <div className="space-y-4">
          {config.fields.map((field) => (
            <div key={String(field.field)} className="flex items-start gap-3">
              <Checkbox
                checked={selectedFields.has(field.field)}
                onCheckedChange={(checked) => {
                  const newSet = new Set(selectedFields);
                  if (checked) {
                    newSet.add(field.field);
                  } else {
                    newSet.delete(field.field);
                  }
                  setSelectedFields(newSet);
                }}
              />
              
              <div className="flex-1">
                <Label>{field.label}</Label>
                
                {selectedFields.has(field.field) && (
                  <div className="mt-2">
                    {/* Seletor de comportamento */}
                    {field.bulkBehavior !== 'replace' && (
                      <BehaviorSelector 
                        field={field}
                        value={values[field.field]}
                        onChange={(v) => setValues({ ...values, [field.field]: v })}
                      />
                    )}
                    
                    {/* Campo de entrada */}
                    <DynamicField
                      config={field}
                      value={values[field.field]}
                      onChange={(v) => setValues({ ...values, [field.field]: v })}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Preview do impacto */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Esta ação irá modificar {selectedIds.length} registros. 
            Campos selecionados: {selectedFields.size}
          </AlertDescription>
        </Alert>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={selectedFields.size === 0}
          >
            Aplicar a {selectedIds.length} itens
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Hook para edição em massa
export function useBulkEdit<T extends BaseEntity>(config: BulkEditConfig<T>) {
  const { enqueue, activeJobs } = useBatchQueue();
  const queryClient = useQueryClient();
  
  const bulkUpdate = async (
    ids: string[],
    data: Partial<T>,
    options?: { onItemComplete?: (id: string) => void }
  ) => {
    return enqueue(
      `Atualizando ${ids.length} ${config.entityNamePlural}`,
      ids,
      async (id) => {
        const result = await api.patch(`${config.endpoint}/${id}`, data);
        options?.onItemComplete?.(id);
        return result;
      },
      {
        batchSize: 5,
        delayBetweenItems: 300,
        onItemComplete: () => {
          // Invalida cache incrementalmente
          queryClient.invalidateQueries({ queryKey: [config.entityName] });
        },
      }
    );
  };
  
  return {
    bulkUpdate,
    isUpdating: activeJobs.some(j => j.name.includes('Atualizando')),
    activeJob: activeJobs.find(j => j.name.includes('Atualizando')),
  };
}
```

#### 7.1.3 Selection Toolbar - Barra de Ações em Massa

```typescript
// @core/selection/components/SelectionToolbar.tsx

interface SelectionAction {
  id: string;
  label: string;
  icon: React.ComponentType;
  
  // Quando habilitar
  minSelection?: number;            // Mínimo de itens (default: 1)
  maxSelection?: number;            // Máximo de itens (default: infinito)
  
  // Permissão
  permission?: string;
  
  // Visual
  variant?: 'default' | 'destructive' | 'warning';
  
  // Handler
  onClick: (selectedIds: string[]) => void;
}

interface SelectionToolbarProps {
  // Estado da seleção
  selectedIds: string[];
  totalItems: number;
  
  // Ações disponíveis
  actions: SelectionAction[];
  
  // Callbacks
  onSelectAll: () => void;
  onClearSelection: () => void;
  
  // Visual
  position?: 'top' | 'bottom' | 'floating';
  className?: string;
}

// Ações padrão por entidade
export const defaultSelectionActions: SelectionAction[] = [
  {
    id: 'view',
    label: 'Visualizar',
    icon: Eye,
    minSelection: 1,
    maxSelection: 20,             // Limite para visualização múltipla
    permission: 'entity.read',
    onClick: (ids) => modals.open('multiView', { ids }),
  },
  {
    id: 'edit',
    label: 'Editar',
    icon: Pencil,
    minSelection: 1,
    maxSelection: 1,              // Edição individual apenas
    permission: 'entity.update',
    onClick: ([id]) => modals.open('edit', { id }),
  },
  {
    id: 'bulkEdit',
    label: 'Editar em Massa',
    icon: PencilLine,
    minSelection: 2,              // Mínimo 2 para edição em massa
    permission: 'entity.update',
    onClick: (ids) => modals.open('bulkEdit', { ids }),
  },
  {
    id: 'duplicate',
    label: 'Duplicar',
    icon: Copy,
    minSelection: 1,
    permission: 'entity.create',
    variant: 'default',
    onClick: (ids) => handlers.handleDuplicate(ids),
  },
  {
    id: 'export',
    label: 'Exportar',
    icon: Download,
    minSelection: 1,
    permission: 'entity.export',
    onClick: (ids) => handlers.handleExport(ids),
  },
  {
    id: 'delete',
    label: 'Excluir',
    icon: Trash2,
    minSelection: 1,
    permission: 'entity.delete',
    variant: 'destructive',
    onClick: (ids) => modals.open('confirmDelete', { ids }),
  },
];

export function SelectionToolbar({
  selectedIds,
  totalItems,
  actions,
  onSelectAll,
  onClearSelection,
  position = 'bottom',
}: SelectionToolbarProps) {
  const { hasPermission } = usePermissions();
  
  // Filtra ações baseado na seleção e permissões
  const availableActions = actions.filter((action) => {
    const count = selectedIds.length;
    const minOk = !action.minSelection || count >= action.minSelection;
    const maxOk = !action.maxSelection || count <= action.maxSelection;
    const permOk = !action.permission || hasPermission(action.permission);
    return minOk && maxOk && permOk;
  });
  
  if (selectedIds.length === 0) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: position === 'bottom' ? 20 : -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: position === 'bottom' ? 20 : -20 }}
      className={cn(
        'fixed left-1/2 -translate-x-1/2 z-50',
        'bg-background border rounded-lg shadow-lg p-2',
        position === 'bottom' ? 'bottom-4' : 'top-4'
      )}
    >
      <div className="flex items-center gap-2">
        {/* Contador */}
        <div className="flex items-center gap-2 px-3 border-r">
          <Checkbox 
            checked={selectedIds.length === totalItems}
            onCheckedChange={(checked) => 
              checked ? onSelectAll() : onClearSelection()
            }
          />
          <span className="text-sm font-medium">
            {selectedIds.length} de {totalItems} selecionado(s)
          </span>
        </div>
        
        {/* Ações */}
        <div className="flex items-center gap-1">
          {availableActions.map((action) => (
            <Button
              key={action.id}
              variant={action.variant === 'destructive' ? 'destructive' : 'ghost'}
              size="sm"
              onClick={() => action.onClick(selectedIds)}
            >
              <action.icon className="h-4 w-4 mr-2" />
              {action.label}
            </Button>
          ))}
        </div>
        
        {/* Limpar seleção */}
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onClearSelection}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}
```

#### 7.1.4 Fluxo Completo de Integração com Queue Manager

```typescript
// =====================================================
// FLUXO: Toda operação batch → Queue Manager → API
// =====================================================

// 1. DELEÇÃO EM MASSA
function handleBatchDelete(ids: string[]) {
  const { enqueue } = useBatchQueue();
  
  // Confirma primeiro
  const confirmed = await confirm({
    title: `Excluir ${ids.length} itens?`,
    message: 'Esta ação não pode ser desfeita.',
    variant: 'destructive',
  });
  
  if (!confirmed) return;
  
  // Enfileira no Queue Manager
  enqueue(
    `Excluindo ${ids.length} ${config.namePlural}`,
    ids,
    async (id) => await api.delete(`/${config.endpoint}/${id}`),
    {
      batchSize: 3,               // 3 por vez
      delayBetweenItems: 500,     // 500ms entre cada
      maxRetries: 2,              // 2 tentativas
      onItemComplete: (result) => {
        if (result.status === 'success') {
          // Invalida cache do item específico
          queryClient.invalidateQueries({ 
            queryKey: [config.queryKey, result.id] 
          });
        }
      },
      onComplete: (job) => {
        toast.success(`${job.succeededItems} itens excluídos`);
        if (job.failedItems > 0) {
          toast.warning(`${job.failedItems} itens falharam`);
        }
        // Invalida lista
        queryClient.invalidateQueries({ queryKey: [config.queryKey] });
        clearSelection();
      },
    }
  );
}

// 2. DUPLICAÇÃO EM MASSA
function handleBatchDuplicate(ids: string[]) {
  enqueue(
    `Duplicando ${ids.length} ${config.namePlural}`,
    ids,
    async (id) => {
      const original = await api.get(`/${config.endpoint}/${id}`);
      const duplicate = config.duplicate.getData(original);
      return await api.post(`/${config.endpoint}`, duplicate);
    },
    {
      batchSize: 2,               // Duplicação é mais pesada
      delayBetweenItems: 1000,
      onComplete: (job) => {
        toast.success(`${job.succeededItems} itens duplicados`);
        queryClient.invalidateQueries({ queryKey: [config.queryKey] });
      },
    }
  );
}

// 3. EXPORT EM MASSA (Via Queue Manager para grandes volumes)
function handleBatchExport(ids: string[], format: 'csv' | 'xlsx' | 'json') {
  // Se poucos itens, export direto
  if (ids.length <= 100) {
    return directExport(ids, format);
  }
  
  // Se muitos itens, via Queue Manager
  enqueue(
    `Exportando ${ids.length} ${config.namePlural}`,
    ids,
    async (id) => await api.get(`/${config.endpoint}/${id}`),
    {
      batchSize: 50,
      delayBetweenItems: 100,
      onComplete: (job) => {
        const successItems = job.results
          .filter(r => r.status === 'success')
          .map(r => r.result);
        
        // Gera arquivo com os dados coletados
        generateExportFile(successItems, format);
      },
    }
  );
}

// 4. IMPORT EM MASSA (Sempre via Queue Manager)
function handleBatchImport(items: ParsedImportItem[]) {
  enqueue(
    `Importando ${items.length} ${config.namePlural}`,
    items,
    async (item) => {
      // Valida item
      const validation = await validateImportItem(item);
      if (validation.hasErrors) {
        throw new Error(validation.errors.join(', '));
      }
      
      // Cria ou atualiza baseado em campo único
      if (item.existingId) {
        return await api.patch(`/${config.endpoint}/${item.existingId}`, item.data);
      } else {
        return await api.post(`/${config.endpoint}`, item.data);
      }
    },
    {
      batchSize: 5,
      delayBetweenItems: 300,
      maxRetries: 1,              // Import não faz retry
      stopOnError: false,         // Continua mesmo com erros
      onProgress: (progress) => {
        updateImportProgress(progress);
      },
      onComplete: (job) => {
        showImportResults({
          total: job.totalItems,
          success: job.succeededItems,
          failed: job.failedItems,
          errors: job.errors,
        });
      },
    }
  );
}
```

#### 7.1.5 Matriz de Decisão - Qual Componente Usar

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ÁRVORE DE DECISÃO - OPERAÇÕES EM MASSA                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Quantos itens selecionados?                                                │
│  │                                                                          │
│  ├─ 0 itens → Desabilitar toolbar de ações                                  │
│  │                                                                          │
│  ├─ 1 item                                                                  │
│  │  ├─ View    → EntityViewerModal (visualização simples)                   │
│  │  ├─ Edit    → EntityFormModal (edição individual)                        │
│  │  ├─ Delete  → ConfirmDialog → API direta (sem Queue)                     │
│  │  └─ Dup     → API direta (sem Queue)                                     │
│  │                                                                          │
│  ├─ 2-20 itens                                                              │
│  │  ├─ View    → MultiViewModal (navegação entre itens)                     │
│  │  ├─ Edit    → BulkEditModal (campos em comum)                            │
│  │  ├─ Delete  → ConfirmDialog → Queue Manager → BatchProgress              │
│  │  └─ Dup     → Queue Manager → BatchProgress                              │
│  │                                                                          │
│  └─ 20+ itens                                                               │
│     ├─ View    → MultiViewModal (com paginação interna)                     │
│     ├─ Edit    → BulkEditModal (alerta de volume)                           │
│     ├─ Delete  → ConfirmDialog (alerta crítico) → Queue → BatchProgress     │
│     ├─ Dup     → Queue Manager → BatchProgress                              │
│     └─ Export  → Queue Manager → Download ao final                          │
│                                                                             │
│  ⚠️ REGRA: Se > 1 item e operação modifica dados → OBRIGATÓRIO Queue Manager│
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 7.2 ↩️ UNDO/REDO - Sistema de Reversão de Operações

Sistema para desfazer e refazer operações em massa, com suporte a rollback parcial e completo.

#### Visão Geral do Sistema

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SISTEMA UNDO/REDO - ARQUITETURA                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                   │
│  │   OPERAÇÃO  │────▶│   SNAPSHOT  │────▶│   UNDO      │                   │
│  │   ORIGINAL  │     │   SALVO     │     │   STACK     │                   │
│  └─────────────┘     └─────────────┘     └─────────────┘                   │
│         │                                       │                           │
│         │                                       ▼                           │
│         │                              ┌─────────────┐                      │
│         │                              │   REDO      │                      │
│         │                              │   STACK     │                      │
│         │                              └─────────────┘                      │
│         │                                       │                           │
│         ▼                                       ▼                           │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        OPERAÇÕES SUPORTADAS                          │   │
│  ├─────────────┬───────────────┬────────────────────────────────────────┤   │
│  │  OPERAÇÃO   │   REVERSÍVEL  │            COMO REVERTE                │   │
│  ├─────────────┼───────────────┼────────────────────────────────────────┤   │
│  │  CREATE     │      ✅       │  DELETE dos itens criados              │   │
│  │  UPDATE     │      ✅       │  UPDATE com dados anteriores           │   │
│  │  DELETE     │      ⚠️       │  CREATE com soft-delete recovery       │   │
│  │  DUPLICATE  │      ✅       │  DELETE das cópias criadas             │   │
│  │  IMPORT     │      ✅       │  DELETE dos itens importados           │   │
│  │  MOVE       │      ✅       │  MOVE para localização anterior        │   │
│  └─────────────┴───────────────┴────────────────────────────────────────┘   │
│                                                                             │
│  ⚠️ DELETE só é reversível se usar soft-delete (isDeleted flag)            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Tipos e Interfaces

```typescript
// @core/undo-redo/types/undo.types.ts

export type UndoableOperation = 
  | 'create' 
  | 'update' 
  | 'delete' 
  | 'duplicate' 
  | 'import' 
  | 'move'
  | 'bulkEdit';

export interface UndoableAction<T = any> {
  id: string;                        // ID único da ação
  type: UndoableOperation;
  entityType: string;                // 'products', 'locations', etc.
  
  // Timestamp
  timestamp: Date;
  userId: string;
  
  // Dados para undo
  affectedIds: string[];             // IDs dos itens afetados
  previousData: T[];                 // Estado anterior (para update/delete)
  newData?: T[];                     // Estado novo (para create/duplicate)
  
  // Metadados
  description: string;               // "Editou 5 produtos"
  batchJobId?: string;               // Referência ao job do Queue Manager
  
  // Estado
  status: 'pending' | 'undone' | 'redone' | 'expired';
  
  // TTL - Tempo de vida para undo
  expiresAt: Date;                   // Default: 30 minutos
}

export interface UndoRedoState {
  undoStack: UndoableAction[];       // Ações que podem ser desfeitas
  redoStack: UndoableAction[];       // Ações que podem ser refeitas
  
  // Configuração
  maxStackSize: number;              // Limite de ações (default: 50)
  defaultTTL: number;                // TTL em ms (default: 30 min)
  
  // Estado atual
  isProcessing: boolean;
  lastAction?: UndoableAction;
}

export interface UndoRedoConfig {
  // Limites
  maxStackSize?: number;
  defaultTTL?: number;               // ms
  
  // Por entidade - quais operações são reversíveis
  entities: {
    [entityType: string]: {
      operations: UndoableOperation[];
      softDelete?: boolean;          // Usa soft delete?
      snapshotFields?: string[];     // Campos a salvar no snapshot
    };
  };
  
  // Storage
  persistToStorage?: boolean;        // Persiste no localStorage?
  storageKey?: string;
}
```

#### Hook Principal - useUndoRedo

```typescript
// @core/undo-redo/hooks/useUndoRedo.ts

interface UseUndoRedoReturn {
  // Estado
  canUndo: boolean;
  canRedo: boolean;
  undoStack: UndoableAction[];
  redoStack: UndoableAction[];
  
  // Ações
  undo: () => Promise<void>;
  redo: () => Promise<void>;
  
  // Registro de ações
  recordAction: <T>(action: Omit<UndoableAction<T>, 'id' | 'timestamp' | 'status'>) => void;
  
  // Undo específico
  undoAction: (actionId: string) => Promise<void>;
  
  // Limpeza
  clearHistory: () => void;
  removeExpired: () => void;
  
  // Estado de processamento
  isUndoing: boolean;
  isRedoing: boolean;
  currentAction?: UndoableAction;
}

export function useUndoRedo(config: UndoRedoConfig): UseUndoRedoReturn {
  const [state, dispatch] = useReducer(undoRedoReducer, initialState);
  const queryClient = useQueryClient();
  const { enqueue } = useBatchQueue();
  
  // Limpa ações expiradas periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'REMOVE_EXPIRED' });
    }, 60000); // A cada minuto
    
    return () => clearInterval(interval);
  }, []);
  
  // Registrar ação reversível
  const recordAction = useCallback(<T>(
    action: Omit<UndoableAction<T>, 'id' | 'timestamp' | 'status'>
  ) => {
    const fullAction: UndoableAction<T> = {
      ...action,
      id: generateId(),
      timestamp: new Date(),
      status: 'pending',
      expiresAt: new Date(Date.now() + (config.defaultTTL || 30 * 60 * 1000)),
    };
    
    dispatch({ type: 'PUSH_UNDO', payload: fullAction });
    
    // Toast com opção de undo
    toast.success(action.description, {
      action: {
        label: 'Desfazer',
        onClick: () => undoAction(fullAction.id),
      },
      duration: 10000, // 10 segundos para clicar em Desfazer
    });
  }, [config.defaultTTL]);
  
  // Desfazer última ação
  const undo = useCallback(async () => {
    const action = state.undoStack[state.undoStack.length - 1];
    if (!action) return;
    
    await undoAction(action.id);
  }, [state.undoStack]);
  
  // Desfazer ação específica
  const undoAction = useCallback(async (actionId: string) => {
    const action = state.undoStack.find(a => a.id === actionId);
    if (!action) {
      toast.error('Ação não encontrada ou expirada');
      return;
    }
    
    dispatch({ type: 'SET_PROCESSING', payload: true });
    
    try {
      // Executa reversão baseado no tipo
      switch (action.type) {
        case 'create':
        case 'duplicate':
        case 'import':
          // Deleta os itens criados
          await enqueue(
            `Desfazendo: ${action.description}`,
            action.affectedIds,
            async (id) => await api.delete(`/${action.entityType}/${id}`),
            { batchSize: 5 }
          );
          break;
          
        case 'update':
        case 'bulkEdit':
          // Restaura dados anteriores
          await enqueue(
            `Desfazendo: ${action.description}`,
            action.previousData,
            async (item) => await api.put(`/${action.entityType}/${item.id}`, item),
            { batchSize: 5 }
          );
          break;
          
        case 'delete':
          // Recupera do soft-delete
          await enqueue(
            `Desfazendo: ${action.description}`,
            action.affectedIds,
            async (id) => await api.patch(`/${action.entityType}/${id}/restore`),
            { batchSize: 5 }
          );
          break;
          
        case 'move':
          // Move de volta para localização anterior
          await enqueue(
            `Desfazendo: ${action.description}`,
            action.previousData,
            async (item) => await api.patch(`/${action.entityType}/${item.id}`, {
              parentId: item.parentId,
              locationId: item.locationId,
            }),
            { batchSize: 5 }
          );
          break;
      }
      
      // Move para redo stack
      dispatch({ type: 'UNDO', payload: actionId });
      
      // Invalida cache
      queryClient.invalidateQueries({ queryKey: [action.entityType] });
      
      toast.success(`Desfeito: ${action.description}`);
      
    } catch (error) {
      toast.error('Erro ao desfazer operação');
      console.error('Undo failed:', error);
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  }, [state.undoStack, enqueue, queryClient]);
  
  // Refazer
  const redo = useCallback(async () => {
    const action = state.redoStack[state.redoStack.length - 1];
    if (!action) return;
    
    dispatch({ type: 'SET_PROCESSING', payload: true });
    
    try {
      // Re-executa a operação original
      switch (action.type) {
        case 'create':
        case 'duplicate':
          await enqueue(
            `Refazendo: ${action.description}`,
            action.newData!,
            async (item) => await api.post(`/${action.entityType}`, item),
            { batchSize: 5 }
          );
          break;
          
        case 'update':
        case 'bulkEdit':
          await enqueue(
            `Refazendo: ${action.description}`,
            action.newData!,
            async (item) => await api.put(`/${action.entityType}/${item.id}`, item),
            { batchSize: 5 }
          );
          break;
          
        case 'delete':
          await enqueue(
            `Refazendo: ${action.description}`,
            action.affectedIds,
            async (id) => await api.delete(`/${action.entityType}/${id}`),
            { batchSize: 5 }
          );
          break;
      }
      
      dispatch({ type: 'REDO', payload: action.id });
      queryClient.invalidateQueries({ queryKey: [action.entityType] });
      
      toast.success(`Refeito: ${action.description}`);
      
    } catch (error) {
      toast.error('Erro ao refazer operação');
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  }, [state.redoStack, enqueue, queryClient]);
  
  return {
    canUndo: state.undoStack.length > 0,
    canRedo: state.redoStack.length > 0,
    undoStack: state.undoStack,
    redoStack: state.redoStack,
    undo,
    redo,
    recordAction,
    undoAction,
    clearHistory: () => dispatch({ type: 'CLEAR' }),
    removeExpired: () => dispatch({ type: 'REMOVE_EXPIRED' }),
    isUndoing: state.isProcessing && state.currentAction?.status === 'undone',
    isRedoing: state.isProcessing && state.currentAction?.status === 'redone',
    currentAction: state.currentAction,
  };
}
```

#### Integração com Batch Operations

```typescript
// Exemplo: Integração do useBulkEdit com Undo

export function useBulkEditWithUndo<T extends BaseEntity>(
  config: BulkEditConfig<T>
) {
  const { bulkUpdate, ...rest } = useBulkEdit(config);
  const { recordAction } = useUndoRedo(undoConfig);
  const queryClient = useQueryClient();
  
  const bulkUpdateWithUndo = async (
    ids: string[],
    newData: Partial<T>,
  ) => {
    // 1. Busca dados anteriores ANTES de atualizar
    const previousData = await Promise.all(
      ids.map(id => queryClient.getQueryData<T>([config.entityName, id]))
    );
    
    // 2. Executa a atualização
    const result = await bulkUpdate(ids, newData);
    
    // 3. Registra para undo
    recordAction({
      type: 'bulkEdit',
      entityType: config.entityName,
      userId: getCurrentUserId(),
      affectedIds: ids,
      previousData: previousData.filter(Boolean) as T[],
      newData: ids.map(id => ({ id, ...newData })) as T[],
      description: `Editou ${ids.length} ${config.entityNamePlural}`,
    });
    
    return result;
  };
  
  return {
    ...rest,
    bulkUpdate: bulkUpdateWithUndo,
  };
}
```

#### Componente de UI - UndoRedoToolbar

```typescript
// @core/undo-redo/components/UndoRedoToolbar.tsx

interface UndoRedoToolbarProps {
  position?: 'top-right' | 'bottom-right' | 'floating';
  showHistory?: boolean;
}

export function UndoRedoToolbar({
  position = 'bottom-right',
  showHistory = false,
}: UndoRedoToolbarProps) {
  const {
    canUndo,
    canRedo,
    undo,
    redo,
    undoStack,
    redoStack,
    isUndoing,
    isRedoing,
  } = useUndoRedo(config);
  
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  
  return (
    <>
      {/* Toolbar flutuante */}
      <div className={cn(
        'fixed z-50 flex items-center gap-1 bg-background border rounded-lg shadow-lg p-1',
        position === 'bottom-right' && 'bottom-4 right-4',
        position === 'top-right' && 'top-4 right-4',
      )}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={undo}
              disabled={!canUndo || isUndoing}
            >
              {isUndoing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Undo2 className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {canUndo 
              ? `Desfazer: ${undoStack[undoStack.length - 1]?.description}`
              : 'Nada para desfazer'
            }
            <kbd className="ml-2">Ctrl+Z</kbd>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={redo}
              disabled={!canRedo || isRedoing}
            >
              {isRedoing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Redo2 className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {canRedo 
              ? `Refazer: ${redoStack[redoStack.length - 1]?.description}`
              : 'Nada para refazer'
            }
            <kbd className="ml-2">Ctrl+Y</kbd>
          </TooltipContent>
        </Tooltip>
        
        {showHistory && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowHistoryPanel(true)}
          >
            <History className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {/* Painel de histórico */}
      <Sheet open={showHistoryPanel} onOpenChange={setShowHistoryPanel}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Histórico de Ações</SheetTitle>
          </SheetHeader>
          <UndoHistoryList 
            undoStack={undoStack} 
            redoStack={redoStack}
            onUndoAction={undoAction}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}

// Atalhos de teclado
export function useUndoRedoKeyboard() {
  const { undo, redo, canUndo, canRedo } = useUndoRedo(config);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey && canUndo) {
          e.preventDefault();
          undo();
        } else if ((e.key === 'y' || (e.key === 'z' && e.shiftKey)) && canRedo) {
          e.preventDefault();
          redo();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, canUndo, canRedo]);
}
```

---

### 7.3 📜 AUDIT LOG - Histórico de Operações Visual

Sistema de registro e visualização de todas as operações realizadas no sistema.

#### Visão Geral

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AUDIT LOG - ARQUITETURA                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                   │
│  │   OPERAÇÃO  │────▶│   LOGGER    │────▶│   DATABASE  │                   │
│  │   QUALQUER  │     │   SERVICE   │     │  audit_logs │                   │
│  └─────────────┘     └─────────────┘     └─────────────┘                   │
│                                                  │                          │
│                                                  ▼                          │
│                      ┌──────────────────────────────────────────────┐      │
│                      │              VISUALIZAÇÃO                     │      │
│                      ├──────────────────────────────────────────────┤      │
│                      │  • Timeline global (admin)                   │      │
│                      │  • Timeline por entidade                     │      │
│                      │  • Timeline por usuário                      │      │
│                      │  • Filtros avançados                         │      │
│                      │  • Export para compliance                    │      │
│                      └──────────────────────────────────────────────┘      │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    O QUE É REGISTRADO                                │   │
│  ├──────────────┬──────────────────────────────────────────────────────┤   │
│  │  CATEGORIA   │  EVENTOS                                             │   │
│  ├──────────────┼──────────────────────────────────────────────────────┤   │
│  │  AUTH        │  login, logout, password_change, 2fa_enabled         │   │
│  │  ENTITY      │  create, update, delete, restore, duplicate          │   │
│  │  BATCH       │  batch_create, batch_update, batch_delete            │   │
│  │  FILE        │  upload, download, delete, share                     │   │
│  │  PERMISSION  │  role_assigned, permission_granted/revoked           │   │
│  │  SYSTEM      │  settings_changed, backup, restore                   │   │
│  │  EXPORT      │  report_generated, data_exported                     │   │
│  │  IMPORT      │  import_started, import_completed, import_failed     │   │
│  └──────────────┴──────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Tipos e Interfaces

```typescript
// @core/audit/types/audit.types.ts

export type AuditCategory = 
  | 'auth'
  | 'entity'
  | 'batch'
  | 'file'
  | 'permission'
  | 'system'
  | 'export'
  | 'import';

export type AuditAction =
  // Auth
  | 'login' | 'logout' | 'login_failed' | 'password_changed' 
  | '2fa_enabled' | '2fa_disabled' | 'session_expired'
  // Entity
  | 'created' | 'updated' | 'deleted' | 'restored' | 'duplicated'
  | 'viewed' | 'exported' | 'imported'
  // Batch
  | 'batch_created' | 'batch_updated' | 'batch_deleted'
  // Permission
  | 'role_assigned' | 'role_removed' | 'permission_granted' | 'permission_revoked'
  // File
  | 'file_uploaded' | 'file_downloaded' | 'file_deleted' | 'file_shared'
  // System
  | 'settings_changed' | 'backup_created' | 'system_restored';

export type AuditSeverity = 'info' | 'warning' | 'critical';

export interface AuditLogEntry {
  id: string;
  
  // Categorização
  category: AuditCategory;
  action: AuditAction;
  severity: AuditSeverity;
  
  // Entidade afetada
  entityType?: string;               // 'products', 'users', etc.
  entityId?: string;                 // ID do item
  entityName?: string;               // Nome para exibição (ex: "Produto XYZ")
  
  // Usuário
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  
  // Detalhes
  description: string;               // "Usuário criou produto 'iPhone 15'"
  changes?: ChangeSet;               // Diferenças antes/depois
  metadata?: Record<string, any>;    // Dados extras
  
  // Contexto
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  
  // Batch reference
  batchId?: string;                  // Se faz parte de operação em lote
  batchSize?: number;                // Quantos itens no lote
  
  // Timing
  timestamp: Date;
  duration?: number;                 // ms (para operações longas)
  
  // Status
  status: 'success' | 'failed' | 'partial';
  errorMessage?: string;
}

export interface ChangeSet {
  before: Record<string, any>;
  after: Record<string, any>;
  changedFields: string[];
}

export interface AuditFilter {
  // Período
  startDate?: Date;
  endDate?: Date;
  
  // Categorização
  categories?: AuditCategory[];
  actions?: AuditAction[];
  severity?: AuditSeverity[];
  
  // Entidade
  entityType?: string;
  entityId?: string;
  
  // Usuário
  userId?: string;
  userRole?: string;
  
  // Status
  status?: ('success' | 'failed' | 'partial')[];
  
  // Texto
  search?: string;                   // Busca em description
  
  // Paginação
  page?: number;
  pageSize?: number;
}
```

#### Audit Service

```typescript
// @core/audit/services/audit.service.ts

class AuditService {
  private static instance: AuditService;
  
  static getInstance() {
    if (!this.instance) {
      this.instance = new AuditService();
    }
    return this.instance;
  }
  
  // ========== REGISTRO ==========
  
  async log(entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'ipAddress' | 'userAgent' | 'sessionId'>) {
    const fullEntry: AuditLogEntry = {
      ...entry,
      id: generateId(),
      timestamp: new Date(),
      ipAddress: await getClientIP(),
      userAgent: navigator.userAgent,
      sessionId: getSessionId(),
    };
    
    // Envia para API
    await api.post('/audit/logs', fullEntry);
    
    // Também dispara evento para listeners locais
    this.emit('log', fullEntry);
    
    return fullEntry;
  }
  
  // Helpers para operações comuns
  async logEntityCreate<T extends BaseEntity>(
    entityType: string,
    entity: T,
    user: User
  ) {
    return this.log({
      category: 'entity',
      action: 'created',
      severity: 'info',
      entityType,
      entityId: entity.id,
      entityName: getEntityDisplayName(entity),
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      description: `Criou ${entityType}: "${getEntityDisplayName(entity)}"`,
      changes: {
        before: {},
        after: sanitizeForAudit(entity),
        changedFields: Object.keys(entity),
      },
      status: 'success',
    });
  }
  
  async logEntityUpdate<T extends BaseEntity>(
    entityType: string,
    oldEntity: T,
    newEntity: T,
    user: User
  ) {
    const changes = calculateChanges(oldEntity, newEntity);
    
    return this.log({
      category: 'entity',
      action: 'updated',
      severity: 'info',
      entityType,
      entityId: newEntity.id,
      entityName: getEntityDisplayName(newEntity),
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      description: `Atualizou ${entityType}: "${getEntityDisplayName(newEntity)}" (${changes.changedFields.length} campos)`,
      changes,
      status: 'success',
    });
  }
  
  async logEntityDelete(
    entityType: string,
    entityId: string,
    entityName: string,
    user: User
  ) {
    return this.log({
      category: 'entity',
      action: 'deleted',
      severity: 'warning',
      entityType,
      entityId,
      entityName,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      description: `Excluiu ${entityType}: "${entityName}"`,
      status: 'success',
    });
  }
  
  async logBatchOperation(
    action: 'batch_created' | 'batch_updated' | 'batch_deleted',
    entityType: string,
    affectedIds: string[],
    user: User,
    batchId: string,
    result: { success: number; failed: number }
  ) {
    const severity: AuditSeverity = 
      action === 'batch_deleted' ? 'warning' : 
      result.failed > 0 ? 'warning' : 'info';
    
    return this.log({
      category: 'batch',
      action,
      severity,
      entityType,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      description: `${actionLabels[action]} ${result.success} ${entityType} (${result.failed} falhas)`,
      batchId,
      batchSize: affectedIds.length,
      metadata: {
        affectedIds,
        successCount: result.success,
        failedCount: result.failed,
      },
      status: result.failed === 0 ? 'success' : result.success > 0 ? 'partial' : 'failed',
    });
  }
  
  // ========== CONSULTA ==========
  
  async query(filter: AuditFilter): Promise<{
    logs: AuditLogEntry[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    return await api.get('/audit/logs', { params: filter });
  }
  
  async getEntityHistory(entityType: string, entityId: string): Promise<AuditLogEntry[]> {
    return await api.get(`/audit/logs/entity/${entityType}/${entityId}`);
  }
  
  async getUserActivity(userId: string, days = 30): Promise<AuditLogEntry[]> {
    return await api.get(`/audit/logs/user/${userId}`, { 
      params: { days } 
    });
  }
  
  // ========== EXPORT ==========
  
  async exportLogs(filter: AuditFilter, format: 'csv' | 'xlsx' | 'json') {
    const response = await api.post('/audit/logs/export', { filter, format });
    downloadFile(response.data, `audit-logs-${Date.now()}.${format}`);
  }
}

export const auditService = AuditService.getInstance();
```

#### Hook para Consulta

```typescript
// @core/audit/hooks/useAuditLogs.ts

interface UseAuditLogsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;        // ms
  initialFilter?: AuditFilter;
}

export function useAuditLogs(options: UseAuditLogsOptions = {}) {
  const [filter, setFilter] = useState<AuditFilter>(
    options.initialFilter || {}
  );
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['audit-logs', filter],
    queryFn: () => auditService.query(filter),
    refetchInterval: options.autoRefresh ? options.refreshInterval || 30000 : false,
  });
  
  // Stats agregados
  const stats = useMemo(() => {
    if (!data?.logs) return null;
    
    return {
      total: data.total,
      byCategory: groupBy(data.logs, 'category'),
      byAction: groupBy(data.logs, 'action'),
      bySeverity: groupBy(data.logs, 'severity'),
      byStatus: groupBy(data.logs, 'status'),
      byUser: groupBy(data.logs, 'userId'),
    };
  }, [data]);
  
  return {
    logs: data?.logs || [],
    total: data?.total || 0,
    page: data?.page || 1,
    pageSize: data?.pageSize || 50,
    isLoading,
    error,
    refetch,
    
    // Filtros
    filter,
    setFilter,
    updateFilter: (updates: Partial<AuditFilter>) => 
      setFilter(prev => ({ ...prev, ...updates })),
    resetFilter: () => setFilter({}),
    
    // Stats
    stats,
  };
}

// Hook para histórico de entidade específica
export function useEntityAuditHistory(entityType: string, entityId: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['audit-logs', 'entity', entityType, entityId],
    queryFn: () => auditService.getEntityHistory(entityType, entityId),
    enabled: !!entityType && !!entityId,
  });
  
  return {
    history: data || [],
    isLoading,
    error,
  };
}
```

#### Componentes de Visualização

```typescript
// @core/audit/components/AuditTimeline.tsx

interface AuditTimelineProps {
  logs: AuditLogEntry[];
  showFilters?: boolean;
  showExport?: boolean;
  maxHeight?: string;
  emptyMessage?: string;
}

export function AuditTimeline({
  logs,
  showFilters = true,
  showExport = false,
  maxHeight = '600px',
  emptyMessage = 'Nenhuma atividade registrada',
}: AuditTimelineProps) {
  // Agrupa logs por data
  const groupedLogs = useMemo(() => {
    return groupBy(logs, log => 
      format(new Date(log.timestamp), 'yyyy-MM-dd')
    );
  }, [logs]);
  
  if (logs.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="Sem atividades"
        description={emptyMessage}
      />
    );
  }
  
  return (
    <div className="space-y-6" style={{ maxHeight, overflow: 'auto' }}>
      {Object.entries(groupedLogs).map(([date, dayLogs]) => (
        <div key={date}>
          {/* Data header */}
          <div className="sticky top-0 bg-background/95 backdrop-blur py-2 mb-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              {formatRelativeDate(date)}
            </h4>
          </div>
          
          {/* Timeline */}
          <div className="relative pl-6 border-l-2 border-muted space-y-4">
            {dayLogs.map((log) => (
              <AuditLogItem key={log.id} log={log} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Item individual da timeline
function AuditLogItem({ log }: { log: AuditLogEntry }) {
  const [expanded, setExpanded] = useState(false);
  
  const Icon = getActionIcon(log.action);
  const color = getSeverityColor(log.severity);
  
  return (
    <div className="relative">
      {/* Dot na timeline */}
      <div className={cn(
        'absolute -left-[25px] w-4 h-4 rounded-full border-2 bg-background',
        color.border
      )}>
        <Icon className={cn('h-2.5 w-2.5 m-0.5', color.text)} />
      </div>
      
      {/* Card */}
      <Card 
        className={cn(
          'cursor-pointer transition-colors hover:bg-muted/50',
          expanded && 'ring-2 ring-primary/20'
        )}
        onClick={() => setExpanded(!expanded)}
      >
        <CardContent className="p-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {log.description}
              </p>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <span>{log.userName}</span>
                <span>•</span>
                <span>{format(new Date(log.timestamp), 'HH:mm')}</span>
                {log.batchSize && log.batchSize > 1 && (
                  <>
                    <span>•</span>
                    <Badge variant="outline" className="text-xs">
                      Lote: {log.batchSize}
                    </Badge>
                  </>
                )}
              </div>
            </div>
            
            {/* Status badge */}
            <Badge variant={getStatusVariant(log.status)}>
              {log.status === 'success' && <Check className="h-3 w-3 mr-1" />}
              {log.status === 'failed' && <X className="h-3 w-3 mr-1" />}
              {log.status === 'partial' && <AlertTriangle className="h-3 w-3 mr-1" />}
              {statusLabels[log.status]}
            </Badge>
          </div>
          
          {/* Detalhes expandidos */}
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-4 pt-4 border-t space-y-3"
            >
              {/* Mudanças */}
              {log.changes && log.changes.changedFields.length > 0 && (
                <div>
                  <h5 className="text-xs font-medium mb-2">Alterações:</h5>
                  <ChangesDiff changes={log.changes} />
                </div>
              )}
              
              {/* Metadata */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">IP:</span>
                  <span className="ml-2">{log.ipAddress}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Sessão:</span>
                  <span className="ml-2 font-mono">{log.sessionId.slice(0, 8)}...</span>
                </div>
                {log.duration && (
                  <div>
                    <span className="text-muted-foreground">Duração:</span>
                    <span className="ml-2">{formatDuration(log.duration)}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Visualização de diff das mudanças
function ChangesDiff({ changes }: { changes: ChangeSet }) {
  return (
    <div className="space-y-1 text-xs font-mono bg-muted/50 rounded p-2">
      {changes.changedFields.map((field) => (
        <div key={field} className="flex items-start gap-2">
          <span className="text-muted-foreground w-24 shrink-0">{field}:</span>
          <span className="text-red-500 line-through">
            {formatValue(changes.before[field])}
          </span>
          <span className="text-muted-foreground">→</span>
          <span className="text-green-500">
            {formatValue(changes.after[field])}
          </span>
        </div>
      ))}
    </div>
  );
}
```

#### Página de Audit Log (Admin)

```typescript
// @admin/audit/pages/AuditLogsPage.tsx

export function AuditLogsPage() {
  const {
    logs,
    total,
    isLoading,
    filter,
    updateFilter,
    resetFilter,
    stats,
  } = useAuditLogs({ autoRefresh: true });
  
  return (
    <div className="container py-6 space-y-6">
      <PageHeader
        title="Histórico de Atividades"
        description="Registro completo de todas as operações do sistema"
        actions={
          <Button variant="outline" onClick={() => exportLogs()}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        }
      />
      
      {/* Stats cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatsCard
          title="Total de Registros"
          value={total}
          icon={Activity}
        />
        <StatsCard
          title="Operações Críticas"
          value={stats?.bySeverity.critical?.length || 0}
          icon={AlertTriangle}
          variant="warning"
        />
        <StatsCard
          title="Falhas"
          value={stats?.byStatus.failed?.length || 0}
          icon={XCircle}
          variant="destructive"
        />
        <StatsCard
          title="Usuários Ativos"
          value={Object.keys(stats?.byUser || {}).length}
          icon={Users}
        />
      </div>
      
      {/* Filtros */}
      <AuditFiltersBar
        filter={filter}
        onFilterChange={updateFilter}
        onReset={resetFilter}
      />
      
      {/* Timeline */}
      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <LoadingState message="Carregando histórico..." />
          ) : (
            <AuditTimeline logs={logs} showExport />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

#### EntityHistoryTab - Aba de Histórico para Entidades

```typescript
// @core/audit/components/EntityHistoryTab.tsx

interface EntityHistoryTabProps {
  entityType: string;
  entityId: string;
}

export function EntityHistoryTab({ entityType, entityId }: EntityHistoryTabProps) {
  const { history, isLoading } = useEntityAuditHistory(entityType, entityId);
  
  if (isLoading) {
    return <LoadingState />;
  }
  
  return (
    <div className="p-4">
      <AuditTimeline
        logs={history}
        showFilters={false}
        emptyMessage="Este item ainda não possui histórico de alterações"
      />
    </div>
  );
}

// Uso na configuração de tabs de detalhe
const productDetailTabs: TabsConfig = {
  tabs: [
    { id: 'overview', label: 'Visão Geral', component: ProductOverview },
    { id: 'variants', label: 'Variantes', component: ProductVariants },
    { id: 'history', label: 'Histórico', component: EntityHistoryTab, icon: History },
  ],
};
```

---

### 8. 📝 Sistema de Formulários (Form System)

Sistema padronizado para criação de formulários com validação, layouts e comportamentos consistentes.

#### Arquitetura de Formulários

```typescript
// @core/forms/types/form.types.ts

export type FieldType = 
  | 'text'
  | 'textarea'
  | 'number'
  | 'currency'
  | 'email'
  | 'phone'
  | 'password'
  | 'select'
  | 'multi-select'
  | 'combobox'
  | 'checkbox'
  | 'radio'
  | 'switch'
  | 'date'
  | 'datetime'
  | 'time'
  | 'daterange'
  | 'file'
  | 'image'
  | 'color'
  | 'rich-text'
  | 'code'
  | 'json'
  | 'array'           // Lista de items
  | 'object'          // Sub-formulário
  | 'custom';

export interface FieldConfig<T = any> {
  // Identificação
  name: keyof T | string;
  label: string;
  type: FieldType;
  
  // Aparência
  placeholder?: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
  
  // Layout
  colSpan?: 1 | 2 | 3 | 4 | 6 | 12;    // Grid de 12 colunas
  
  // Validação
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  validate?: (value: any, formData: T) => string | undefined;
  
  // Comportamento
  disabled?: boolean | ((formData: T) => boolean);
  hidden?: boolean | ((formData: T) => boolean);
  readOnly?: boolean;
  
  // Valor padrão
  defaultValue?: any;
  
  // Opções (para select, radio, checkbox)
  options?: FieldOption[] | ((formData: T) => FieldOption[]);
  
  // Async options (para combobox)
  loadOptions?: (query: string) => Promise<FieldOption[]>;
  
  // Dependências
  dependsOn?: string[];              // Campos que afetam este
  onChange?: (value: any, formData: T, setFieldValue: SetFieldValue) => void;
  
  // Para campos array/object
  fields?: FieldConfig[];            // Sub-campos
  itemTemplate?: FieldConfig[];      // Template para cada item do array
  
  // Componente customizado
  component?: React.ComponentType<FieldProps>;
}

export interface FieldOption {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  description?: string;
  disabled?: boolean;
  group?: string;                    // Para agrupamento
}

export interface FormConfig<T = any> {
  // Campos
  fields: FieldConfig<T>[];
  
  // Layout
  layout?: 'vertical' | 'horizontal' | 'inline';
  columns?: 1 | 2 | 3 | 4 | 6;       // Grid base
  gap?: 'sm' | 'md' | 'lg';
  
  // Seções (para formulários grandes)
  sections?: FormSection<T>[];
  
  // Validação
  validationSchema?: any;            // Zod, Yup, etc.
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  
  // Comportamento
  autoSave?: boolean;
  autoSaveDelay?: number;            // ms
  confirmBeforeLeave?: boolean;
  
  // Submit
  onSubmit: (data: T) => Promise<void> | void;
  onError?: (errors: Record<string, string>) => void;
}

export interface FormSection<T = any> {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  
  // Campos desta seção
  fields: FieldConfig<T>[];
  
  // Comportamento
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  hidden?: (formData: T) => boolean;
}
```

#### Componente de Formulário Universal

```typescript
// @core/forms/components/EntityForm.tsx

interface EntityFormProps<T> {
  // Configuração
  config: FormConfig<T>;
  
  // Dados
  initialData?: Partial<T>;
  
  // Modo
  mode: 'create' | 'edit' | 'view';
  
  // Ações
  onCancel?: () => void;
  onSuccess?: (data: T) => void;
  
  // Aparência
  showHeader?: boolean;
  showActions?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  
  // Loading
  isSubmitting?: boolean;
}

export function EntityForm<T extends Record<string, any>>({
  config,
  initialData,
  mode = 'create',
  ...props
}: EntityFormProps<T>) {
  // Usa react-hook-form internamente
  // Renderiza campos baseado na config
  // Gerencia validação e submit
}

// Exemplo de uso:
const productFormConfig: FormConfig<Product> = {
  columns: 2,
  sections: [
    {
      id: 'basic',
      title: 'Informações Básicas',
      icon: <Package />,
      fields: [
        { name: 'name', label: 'Nome', type: 'text', required: true, colSpan: 2 },
        { name: 'sku', label: 'SKU', type: 'text', required: true },
        { name: 'barcode', label: 'Código de Barras', type: 'text' },
        { name: 'category', label: 'Categoria', type: 'select', options: categories },
        { name: 'brand', label: 'Marca', type: 'combobox', loadOptions: searchBrands },
      ],
    },
    {
      id: 'pricing',
      title: 'Preços',
      icon: <DollarSign />,
      fields: [
        { name: 'costPrice', label: 'Preço de Custo', type: 'currency' },
        { name: 'salePrice', label: 'Preço de Venda', type: 'currency', required: true },
        { name: 'taxRate', label: 'Taxa de Imposto', type: 'number', min: 0, max: 100 },
      ],
    },
    {
      id: 'inventory',
      title: 'Estoque',
      icon: <Warehouse />,
      collapsible: true,
      fields: [
        { name: 'minStock', label: 'Estoque Mínimo', type: 'number', min: 0 },
        { name: 'maxStock', label: 'Estoque Máximo', type: 'number', min: 0 },
        { name: 'reorderPoint', label: 'Ponto de Reposição', type: 'number', min: 0 },
      ],
    },
  ],
  onSubmit: async (data) => await createProduct(data),
};

<EntityForm 
  config={productFormConfig}
  mode="create"
  onSuccess={(product) => router.push(`/products/${product.id}`)}
/>
```

#### Hook de Formulário

```typescript
// @core/forms/hooks/useEntityForm.ts

export function useEntityForm<T extends Record<string, any>>(
  config: FormConfig<T>,
  options?: UseEntityFormOptions<T>
) {
  return {
    // Estado do form
    form: UseFormReturn<T>,
    
    // Helpers
    getField: (name: keyof T) => FieldConfig<T>,
    setFieldValue: (name: keyof T, value: any) => void,
    setFieldError: (name: keyof T, error: string) => void,
    
    // Validação
    isValid: boolean,
    errors: Record<string, string>,
    validateField: (name: keyof T) => Promise<boolean>,
    
    // Estado
    isDirty: boolean,
    isSubmitting: boolean,
    
    // Ações
    handleSubmit: (e?: React.FormEvent) => Promise<void>,
    reset: () => void,
    
    // Auto-save
    lastSavedAt?: Date,
    saveStatus: 'idle' | 'saving' | 'saved' | 'error',
  };
}
```

---

### 9. 📑 Sistema de Abas (Tab System)

Sistema padronizado de navegação por abas com layouts consistentes.

#### Tipos de Abas

```typescript
// @core/tabs/types/tabs.types.ts

export type TabVariant = 
  | 'line'           // Linha inferior (padrão)
  | 'pills'          // Botões arredondados
  | 'boxed'          // Caixas com bordas
  | 'underline';     // Apenas sublinhado

export type TabOrientation = 'horizontal' | 'vertical';

export interface TabConfig {
  id: string;
  label: string;
  icon?: React.ReactNode;
  
  // Conteúdo
  content?: React.ReactNode;
  component?: React.ComponentType<any>;
  
  // Comportamento
  disabled?: boolean;
  hidden?: boolean;
  
  // Badge/Counter
  badge?: string | number;
  badgeVariant?: 'default' | 'secondary' | 'destructive';
  
  // Lazy loading
  lazy?: boolean;               // Carrega só quando ativo
  keepMounted?: boolean;        // Mantém montado após visitar
  
  // Permissões
  requiredPermission?: string;
  requiredRole?: string;
  
  // Sub-abas (para layouts complexos)
  children?: TabConfig[];
}

export interface TabsConfig {
  tabs: TabConfig[];
  
  // Aparência
  variant?: TabVariant;
  orientation?: TabOrientation;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  
  // Estado
  defaultTab?: string;
  persistState?: boolean;        // Salva aba ativa na URL
  stateKey?: string;             // Query param name
  
  // Comportamento
  onChange?: (tabId: string) => void;
  onTabClose?: (tabId: string) => void;  // Para abas fecháveis
  closable?: boolean;
  
  // Scrollable (muitas abas)
  scrollable?: boolean;
  showArrows?: boolean;
}
```

#### Componente de Abas

```typescript
// @core/tabs/components/EntityTabs.tsx

interface EntityTabsProps {
  config: TabsConfig;
  
  // Dados para passar para cada aba
  data?: any;
  
  // Layout
  contentClassName?: string;
  tabsClassName?: string;
}

export function EntityTabs({
  config,
  data,
  ...props
}: EntityTabsProps) {
  // Gerencia estado da aba ativa
  // Renderiza abas baseado na config
  // Suporta lazy loading e permissões
}

// Exemplo de uso - Página de detalhes de produto:
const productDetailTabs: TabsConfig = {
  variant: 'line',
  persistState: true,
  stateKey: 'tab',
  tabs: [
    {
      id: 'overview',
      label: 'Visão Geral',
      icon: <Info />,
      component: ProductOverviewTab,
    },
    {
      id: 'variants',
      label: 'Variantes',
      icon: <Palette />,
      badge: product.variants.length,
      component: ProductVariantsTab,
      lazy: true,
    },
    {
      id: 'inventory',
      label: 'Estoque',
      icon: <Warehouse />,
      component: ProductInventoryTab,
      lazy: true,
    },
    {
      id: 'history',
      label: 'Histórico',
      icon: <History />,
      component: ProductHistoryTab,
      lazy: true,
      requiredPermission: 'products.view_history',
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: <Settings />,
      component: ProductSettingsTab,
      requiredRole: 'admin',
    },
  ],
};

<EntityTabs config={productDetailTabs} data={product} />
```

#### Layouts de Abas Padronizados

```typescript
// @core/tabs/layouts/TabPageLayout.tsx

interface TabPageLayoutProps {
  // Header
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  
  // Abas
  tabs: TabsConfig;
  
  // Sidebar opcional
  sidebar?: React.ReactNode;
  sidebarPosition?: 'left' | 'right';
  
  // Footer opcional
  footer?: React.ReactNode;
}

export function TabPageLayout({
  title,
  tabs,
  ...props
}: TabPageLayoutProps) {
  // Layout padronizado para páginas com abas
}

// Variações:
export function MasterDetailLayout() {
  // Lista à esquerda, detalhes com abas à direita
}

export function FullWidthTabLayout() {
  // Abas ocupando largura total
}

export function VerticalTabLayout() {
  // Abas verticais na lateral
}
```

---

### 10. 🔄 Sistema CRUD Padronizado (CRUD System)

Sistema completo para operações CRUD com padrões consistentes.

#### Arquitetura CRUD

```typescript
// @core/crud/types/crud.types.ts

// ========== OPERAÇÕES ==========

export type CrudOperation = 'create' | 'read' | 'update' | 'delete' | 'list';

export interface CrudConfig<T extends BaseEntity> {
  // Identificação
  entityName: string;            // "Product"
  entityNamePlural: string;      // "Products"
  entityKey: string;             // "products"
  
  // API
  endpoints: CrudEndpoints;
  
  // Formulário
  formConfig: FormConfig<T>;
  
  // Listagem
  listConfig: ListConfig<T>;
  
  // Visualização
  viewerConfig: ViewerConfig<T>;
  
  // Abas de detalhe
  detailTabs?: TabsConfig;
  
  // Permissões
  permissions: CrudPermissions;
  
  // Mensagens
  messages: CrudMessages;
  
  // Callbacks
  hooks?: CrudHooks<T>;
}

export interface CrudEndpoints {
  list: string;                  // GET /api/products
  get: string;                   // GET /api/products/:id
  create: string;                // POST /api/products
  update: string;                // PUT /api/products/:id
  delete: string;                // DELETE /api/products/:id
  
  // Opcionais
  duplicate?: string;            // POST /api/products/:id/duplicate
  export?: string;               // GET /api/products/export
  import?: string;               // POST /api/products/import
  bulkUpdate?: string;           // PATCH /api/products/bulk
  bulkDelete?: string;           // DELETE /api/products/bulk
}

export interface CrudPermissions {
  list: string;                  // "products.list"
  view: string;                  // "products.read"
  create: string;                // "products.create"
  update: string;                // "products.update"
  delete: string;                // "products.delete"
  export?: string;               // "products.export"
  import?: string;               // "products.import"
}

export interface CrudMessages {
  createSuccess: string;
  updateSuccess: string;
  deleteSuccess: string;
  deleteConfirm: string;
  deleteBulkConfirm: (count: number) => string;
  notFound: string;
  loadError: string;
}

export interface CrudHooks<T> {
  // Antes das operações
  beforeCreate?: (data: Partial<T>) => Partial<T> | Promise<Partial<T>>;
  beforeUpdate?: (id: string, data: Partial<T>) => Partial<T> | Promise<Partial<T>>;
  beforeDelete?: (id: string) => boolean | Promise<boolean>;
  
  // Depois das operações
  afterCreate?: (entity: T) => void | Promise<void>;
  afterUpdate?: (entity: T) => void | Promise<void>;
  afterDelete?: (id: string) => void | Promise<void>;
  
  // Transformações
  transformForForm?: (entity: T) => Partial<T>;
  transformFromForm?: (data: Partial<T>) => Partial<T>;
}
```

#### Páginas CRUD Padronizadas

```typescript
// @core/crud/pages/CrudListPage.tsx

interface CrudListPageProps<T extends BaseEntity> {
  config: CrudConfig<T>;
  
  // Customização
  headerActions?: React.ReactNode;
  emptyState?: React.ReactNode;
  
  // Filtros adicionais
  filters?: FilterConfig[];
}

export function CrudListPage<T extends BaseEntity>({
  config,
  ...props
}: CrudListPageProps<T>) {
  // Página de listagem completa com:
  // - Header com título e ações
  // - Barra de busca e filtros
  // - Grid/Table com seleção
  // - Paginação
  // - Batch operations
  // - Context menu
}

// @core/crud/pages/CrudDetailPage.tsx

interface CrudDetailPageProps<T extends BaseEntity> {
  config: CrudConfig<T>;
  id: string;
  
  // Modo inicial
  defaultMode?: 'view' | 'edit';
}

export function CrudDetailPage<T extends BaseEntity>({
  config,
  id,
  defaultMode = 'view',
}: CrudDetailPageProps<T>) {
  // Página de detalhe com:
  // - Breadcrumbs
  // - Header com título e ações (edit, delete, duplicate)
  // - Abas de conteúdo
  // - Formulário em modo edit
}

// @core/crud/pages/CrudCreatePage.tsx

interface CrudCreatePageProps<T extends BaseEntity> {
  config: CrudConfig<T>;
  
  // Dados iniciais (para duplicação)
  initialData?: Partial<T>;
}

export function CrudCreatePage<T extends BaseEntity>({
  config,
  initialData,
}: CrudCreatePageProps<T>) {
  // Página de criação com:
  // - Breadcrumbs
  // - Formulário
  // - Ações (salvar, cancelar)
}
```

#### Hook CRUD Completo

```typescript
// @core/crud/hooks/useCrud.ts

export function useCrud<T extends BaseEntity>(config: CrudConfig<T>) {
  return {
    // ========== QUERIES ==========
    
    // Lista
    list: {
      data: T[],
      isLoading: boolean,
      error: Error | null,
      refetch: () => void,
    },
    
    // Item único
    item: {
      data: T | null,
      isLoading: boolean,
      error: Error | null,
    },
    
    // ========== MUTATIONS ==========
    
    create: {
      mutate: (data: Partial<T>) => Promise<T>,
      isLoading: boolean,
      error: Error | null,
    },
    
    update: {
      mutate: (id: string, data: Partial<T>) => Promise<T>,
      isLoading: boolean,
      error: Error | null,
    },
    
    delete: {
      mutate: (id: string) => Promise<void>,
      isLoading: boolean,
      error: Error | null,
    },
    
    // ========== BATCH ==========
    
    batchDelete: {
      mutate: (ids: string[]) => Promise<void>,
      progress: number,
      isLoading: boolean,
    },
    
    batchUpdate: {
      mutate: (ids: string[], data: Partial<T>) => Promise<void>,
      progress: number,
      isLoading: boolean,
    },
    
    // ========== UTILIDADES ==========
    
    duplicate: (id: string) => Promise<T>,
    export: (format: 'csv' | 'xlsx' | 'json') => Promise<Blob>,
    import: (file: File) => Promise<ImportResult>,
    
    // ========== ESTADO ==========
    
    selection: SelectionState,
    filters: FilterState,
    pagination: PaginationState,
    sorting: SortingState,
  };
}
```

#### Factory de CRUD

```typescript
// @core/crud/factory/createCrudConfig.ts

// Factory para criar configuração completa de CRUD

export function createCrudConfig<T extends BaseEntity>(
  options: CrudConfigOptions<T>
): CrudConfig<T> {
  return {
    entityName: options.entityName,
    entityNamePlural: options.entityNamePlural || `${options.entityName}s`,
    entityKey: options.entityKey || options.entityName.toLowerCase(),
    
    endpoints: {
      list: `/api/${options.entityKey}`,
      get: `/api/${options.entityKey}/:id`,
      create: `/api/${options.entityKey}`,
      update: `/api/${options.entityKey}/:id`,
      delete: `/api/${options.entityKey}/:id`,
      ...options.endpoints,
    },
    
    permissions: {
      list: `${options.entityKey}.list`,
      view: `${options.entityKey}.read`,
      create: `${options.entityKey}.create`,
      update: `${options.entityKey}.update`,
      delete: `${options.entityKey}.delete`,
      ...options.permissions,
    },
    
    messages: {
      createSuccess: `${options.entityName} criado com sucesso!`,
      updateSuccess: `${options.entityName} atualizado com sucesso!`,
      deleteSuccess: `${options.entityName} excluído com sucesso!`,
      deleteConfirm: `Deseja realmente excluir este ${options.entityName.toLowerCase()}?`,
      deleteBulkConfirm: (count) => 
        `Deseja realmente excluir ${count} ${options.entityNamePlural.toLowerCase()}?`,
      notFound: `${options.entityName} não encontrado`,
      loadError: `Erro ao carregar ${options.entityNamePlural.toLowerCase()}`,
      ...options.messages,
    },
    
    formConfig: options.formConfig,
    listConfig: options.listConfig,
    viewerConfig: options.viewerConfig,
    detailTabs: options.detailTabs,
    hooks: options.hooks,
  };
}

// Exemplo de uso:
const productCrudConfig = createCrudConfig<Product>({
  entityName: 'Produto',
  entityNamePlural: 'Produtos',
  entityKey: 'products',
  
  formConfig: productFormConfig,
  listConfig: productListConfig,
  viewerConfig: productViewerConfig,
  detailTabs: productDetailTabs,
  
  hooks: {
    beforeCreate: (data) => ({
      ...data,
      createdAt: new Date(),
    }),
    afterCreate: (product) => {
      toast.success(`Produto ${product.name} criado!`);
    },
  },
});
```

---

### 11. 📊 Sistema de Dashboards (Dashboard System)

Sistema padronizado para criação de dashboards e painéis de controle.

#### Tipos de Widgets

```typescript
// @core/dashboard/types/dashboard.types.ts

export type WidgetType =
  | 'stat-card'        // Card com estatística
  | 'chart-line'       // Gráfico de linha
  | 'chart-bar'        // Gráfico de barras
  | 'chart-pie'        // Gráfico de pizza
  | 'chart-area'       // Gráfico de área
  | 'table'            // Tabela de dados
  | 'list'             // Lista simples
  | 'calendar'         // Mini calendário
  | 'map'              // Mapa
  | 'progress'         // Barra de progresso
  | 'activity'         // Feed de atividades
  | 'custom';          // Widget customizado

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  
  // Layout
  colSpan?: 1 | 2 | 3 | 4 | 6 | 12;
  rowSpan?: 1 | 2 | 3;
  
  // Dados
  dataSource: string | (() => Promise<any>);
  refreshInterval?: number;       // ms
  
  // Aparência
  icon?: React.ReactNode;
  color?: string;
  
  // Interação
  onClick?: () => void;
  linkTo?: string;
  
  // Permissão
  requiredPermission?: string;
}

export interface DashboardConfig {
  id: string;
  title: string;
  
  // Widgets
  widgets: WidgetConfig[];
  
  // Layout
  columns?: 4 | 6 | 12;
  gap?: 'sm' | 'md' | 'lg';
  
  // Comportamento
  refreshAll?: boolean;
  refreshInterval?: number;
  
  // Filtros globais
  dateRange?: boolean;
  filters?: FilterConfig[];
}
```

---

### 12. 🔍 Sistema de Busca Avançada (Search System)

Sistema unificado de busca com filtros e facetas.

#### Configuração de Busca

```typescript
// @core/search/types/search.types.ts

export interface SearchConfig<T = any> {
  // Campos pesquisáveis
  searchableFields: (keyof T)[];
  
  // Filtros
  filters: FilterConfig<T>[];
  
  // Facetas (contagem por categoria)
  facets?: FacetConfig<T>[];
  
  // Ordenação
  sortOptions: SortOption<T>[];
  defaultSort?: SortOption<T>;
  
  // Paginação
  pageSize?: number;
  pageSizeOptions?: number[];
  
  // Comportamento
  debounceMs?: number;
  minQueryLength?: number;
  highlightMatches?: boolean;
  
  // Histórico
  saveHistory?: boolean;
  maxHistory?: number;
}

export interface FilterConfig<T = any> {
  id: string;
  label: string;
  field: keyof T;
  type: 'select' | 'multi-select' | 'date-range' | 'number-range' | 'boolean' | 'text';
  
  // Opções (para select)
  options?: FilterOption[];
  loadOptions?: () => Promise<FilterOption[]>;
  
  // Range (para number-range)
  min?: number;
  max?: number;
  step?: number;
  
  // Aparência
  icon?: React.ReactNode;
  collapsible?: boolean;
}

export interface FacetConfig<T = any> {
  field: keyof T;
  label: string;
  limit?: number;              // Quantos mostrar
  showCount?: boolean;
}
```

---

## 📄 SISTEMA DE PÁGINAS PADRONIZADO

✅ **Componentes Genéricos Iniciados**
- `EntityGrid`, `EntityForm`, `EntityViewer` já existem em `/components/shared/`
- Sistema de configuração de entidades em `/config/entities/`
- Tipos bem definidos em `/types/entity-config.ts`

✅ **Hooks Bem Estruturados**
- `useBatchOperation` para operações em lote
- `useSelection` para seleção múltipla
- Hooks de CRUD separados por entidade

✅ **Serviços Organizados**
- Separação clara em `/services/stock/`, `/services/auth/`
- API endpoints centralizados em `/config/api.ts`

### 2. Problemas Identificados

#### 🔴 **Duplicação de Código nas Páginas**

**Exemplo: Locations vs Templates Page**

Ambas as páginas têm código praticamente idêntico para:
- Estados de modal (`isQuickCreateModalOpen`, `isImportModalOpen`, etc.)
- Operações em lote (`batchDelete`, `batchDuplicate`)
- Handlers de seleção (`handleItemClick`, `handleSelectRange`)
- Dialogs de confirmação (delete, duplicate)
- Tratamento de erros e loading states

```typescript
// Código repetido em AMBAS as páginas:
const [isQuickCreateModalOpen, setIsQuickCreateModalOpen] = useState(false);
const [isImportModalOpen, setIsImportModalOpen] = useState(false);
const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
// ... mais 10+ estados idênticos

const batchDelete = useBatchOperation(...); // Mesmo código
const batchDuplicate = useBatchOperation(...); // Mesmo código
```

#### 🔴 **Cards Específicos por Entidade**

O arquivo `items-grid.tsx` tem **500+ linhas** com cards específicos:
- `TemplateGridCard`, `TemplateListCard`
- `LocationGridCard`, `LocationListCard`
- Cada novo tipo de entidade requer novos cards

#### 🔴 **Falta de Padronização de Erros**

Cada página trata erros de forma diferente:
```typescript
// Locations Page
if (error) {
  const isAuthError = error.message?.includes('401')...
  // Renderiza componente de erro específico
}

// Templates Page
// Tratamento diferente ou ausente
```

#### 🔴 **Componentes Não Genéricos**

- `PageHeader` em `/components/stock/` vs `/components/shared/layout/`
- `SearchSection` duplicado em ambos os lugares
- `ItemsGrid` vs `EntityGrid` - funcionalidades similares mas implementações diferentes

#### 🔴 **Context Menu Específico**

- `ItemContextMenu` vs `EntityContextMenu`
- Ações diferentes por componente
- Não há padronização de ações disponíveis

---

## 🏛️ Arquitetura Proposta

### Princípio Central: "Composição sobre Configuração"

O sistema deve funcionar como um **OS moderno** onde:
1. **Kernel** = Componentes core genéricos
2. **Drivers** = Adaptadores de entidade
3. **Apps** = Páginas que usam os componentes

### Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                         PÁGINAS (Apps)                          │
│   /templates  │  /locations  │  /products  │  /variants  │ ... │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                    TEMPLATE DE PÁGINA (useEntityPage)           │
│  • Estados padronizados    • Batch operations                   │
│  • Handlers genéricos      • Error handling                     │
│  • Loading/Error states    • Modal management                   │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                   COMPONENTES CORE (Kernel)                     │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │ EntityPage   │ │ EntityGrid   │ │ EntityModal  │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │ EntityCard   │ │ EntityForm   │ │ EntityViewer │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                   CONFIGURAÇÕES (Drivers)                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ /config/entities/                                        │   │
│  │  • templates.config.ts  • locations.config.ts            │   │
│  │  • products.config.ts   • variants.config.ts             │   │
│  └──────────────────────────────────────────────────────────┘   │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                     HOOKS & SERVICES (API Layer)                 │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │ useEntity    │ │ useBatch     │ │ useSelection │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ /services/ - API Clients                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📦 Componentes a Serem Criados/Refatorados

### 1. **EntityPageTemplate** - O "Kernel" das Páginas

```typescript
// src/components/shared/layout/entity-page-template.tsx

interface EntityPageConfig<T extends { id: string }> {
  // Identificação
  entityName: string;           // "Template"
  entityNamePlural: string;     // "Templates"
  entityKey: string;            // "templates" (para query keys)
  
  // URLs
  basePath: string;             // "/stock/assets/templates"
  createPath?: string;          // "/stock/assets/templates/new"
  
  // Dados
  useListHook: () => UseQueryResult<T[]>;
  useDeleteHook: () => UseMutationResult;
  useCreateHook: () => UseMutationResult;
  
  // Filtros
  filterFn?: (item: T, query: string) => boolean;
  
  // Cards
  renderGridCard: (item: T, isSelected: boolean) => ReactNode;
  renderListCard: (item: T, isSelected: boolean) => ReactNode;
  
  // Estatísticas
  stats: StatsConfig[];
  
  // FAQs
  faqs: FAQItem[];
  
  // Ações adicionais
  headerActions?: HeaderAction[];
  contextMenuActions?: ContextMenuAction[];
  
  // Features opcionais
  features?: {
    quickCreate?: boolean;
    import?: boolean;
    multiView?: boolean;
    compare?: boolean;
  };
}

export function EntityPageTemplate<T extends { id: string }>({
  config
}: { config: EntityPageConfig<T> }) {
  // Toda a lógica padronizada aqui
  // Estados, handlers, modais, erros, loading...
}
```

### 2. **UniversalCard** - Um Card para Todas as Entidades

```typescript
// src/components/shared/cards/universal-card.tsx

interface UniversalCardConfig {
  // Layout
  layout: 'grid' | 'list';
  
  // Conteúdo Principal
  icon: ReactNode;
  iconBackground?: string;       // "from-blue-500 to-purple-600"
  title: string;
  subtitle?: string;
  
  // Badges
  badges?: Array<{
    label: string;
    variant?: 'default' | 'secondary' | 'outline' | 'destructive';
    className?: string;
  }>;
  
  // Indicadores
  indicators?: {
    isNew?: boolean;
    isUpdated?: boolean;
    isActive?: boolean;
    customBadge?: ReactNode;
  };
  
  // Métricas (para cards de localização, produtos, etc.)
  metrics?: Array<{
    label: string;
    value: string | number;
    icon?: ReactNode;
    trend?: 'up' | 'down' | 'neutral';
  }>;
  
  // Progresso (para ocupação, estoque, etc.)
  progress?: {
    current: number;
    total: number;
    label?: string;
    colorThresholds?: {
      warning: number;  // ex: 70%
      danger: number;   // ex: 90%
    };
  };
  
  // Datas
  dates?: {
    created?: Date | string;
    updated?: Date | string;
  };
  
  // Estado de seleção
  isSelected?: boolean;
  
  // Eventos
  onClick?: () => void;
}

export function UniversalCard({ config }: { config: UniversalCardConfig }) {
  // Renderização inteligente baseada no layout
}
```

### 3. **useEntityPage** - Hook Orquestrador

```typescript
// src/hooks/shared/use-entity-page.ts

interface UseEntityPageConfig<T extends { id: string }> {
  // Hooks de dados
  useList: () => UseQueryResult<T[]>;
  useDelete: () => UseMutationResult;
  useCreate: () => UseMutationResult;
  
  // Query key
  queryKey: string[];
  
  // Callbacks
  onDeleteSuccess?: () => void;
  onDuplicateSuccess?: () => void;
  
  // Configuração de duplicação
  duplicateConfig?: {
    getNewName: (item: T) => string;
    getData: (item: T) => Partial<T>;
  };
}

export function useEntityPage<T extends { id: string }>(
  config: UseEntityPageConfig<T>
) {
  // Estados
  const [searchQuery, setSearchQuery] = useState('');
  const [activeOperation, setActiveOperation] = useState<'delete' | 'duplicate' | null>(null);
  
  // Modais
  const modals = useModals(); // Hook auxiliar para gerenciar modais
  
  // Seleção
  const selection = useSelection();
  
  // Batch operations
  const batchDelete = useBatchOperation(...);
  const batchDuplicate = useBatchOperation(...);
  
  // Handlers padronizados
  const handlers = {
    handleSearch: useCallback((query: string) => {...}, []),
    handleItemClick: useCallback((id: string, event: React.MouseEvent) => {...}, []),
    handleItemDoubleClick: useCallback((id: string) => {...}, []),
    handleItemsView: useCallback((ids: string[]) => {...}, []),
    handleItemsEdit: useCallback((ids: string[]) => {...}, []),
    handleItemsDuplicate: useCallback((ids: string[]) => {...}, []),
    handleItemsDelete: useCallback((ids: string[]) => {...}, []),
    handleSelectRange: useCallback((startId: string, endId: string) => {...}, []),
    handleDeleteConfirm: useCallback(async () => {...}, []),
    handleDuplicateConfirm: useCallback(async () => {...}, []),
  };
  
  return {
    // Estados
    searchQuery,
    activeOperation,
    
    // Modais
    modals,
    
    // Seleção
    selection,
    
    // Batch operations
    batchDelete,
    batchDuplicate,
    
    // Handlers
    handlers,
    
    // Helpers
    isLoading: listQuery.isLoading,
    error: listQuery.error,
    items: listQuery.data || [],
  };
}
```

### 4. **useModals** - Gerenciador de Modais

```typescript
// src/hooks/shared/use-modals.ts

type ModalType = 
  | 'quickCreate' 
  | 'import' 
  | 'help' 
  | 'delete' 
  | 'duplicate' 
  | 'multiView'
  | 'createEdit'
  | 'batchCreate';

interface UseModalsReturn {
  isOpen: (modal: ModalType) => boolean;
  open: (modal: ModalType) => void;
  close: (modal: ModalType) => void;
  toggle: (modal: ModalType) => void;
  closeAll: () => void;
  
  // Estados específicos
  editingItem: any | null;
  setEditingItem: (item: any | null) => void;
  itemsToDelete: string[];
  setItemsToDelete: (ids: string[]) => void;
  itemsToDuplicate: string[];
  setItemsToDuplicate: (ids: string[]) => void;
}

export function useModals(): UseModalsReturn {
  const [openModals, setOpenModals] = useState<Set<ModalType>>(new Set());
  const [editingItem, setEditingItem] = useState(null);
  const [itemsToDelete, setItemsToDelete] = useState<string[]>([]);
  const [itemsToDuplicate, setItemsToDuplicate] = useState<string[]>([]);
  
  // Implementação...
}
```

### 5. **ErrorBoundary & ErrorState** - Tratamento de Erros Padronizado

```typescript
// src/components/shared/errors/error-state.tsx

interface ErrorStateConfig {
  error: Error | null;
  type?: 'auth' | 'network' | 'notFound' | 'permission' | 'generic';
  onRetry?: () => void;
  onLogin?: () => void;
  onGoBack?: () => void;
}

export function ErrorState({ config }: { config: ErrorStateConfig }) {
  // Renderiza UI de erro apropriada baseada no tipo
}

// src/components/shared/errors/loading-state.tsx
export function LoadingState({ 
  message?: string;
  fullScreen?: boolean;
}) {
  // Loading padronizado
}
```

---

## 📁 Nova Estrutura de Arquivos Proposta

```
src/
├── components/
│   ├── shared/                          # Componentes genéricos (KERNEL)
│   │   ├── cards/
│   │   │   ├── universal-card.tsx       # ✨ NOVO - Card universal
│   │   │   └── index.ts
│   │   ├── context-menu/
│   │   │   ├── entity-context-menu.tsx  # Refatorar
│   │   │   └── index.ts
│   │   ├── dialogs/
│   │   │   ├── confirm-dialog.tsx       # ✨ NOVO - Dialog genérico
│   │   │   ├── batch-progress-dialog.tsx
│   │   │   └── index.ts
│   │   ├── errors/                      # ✨ NOVO
│   │   │   ├── error-state.tsx
│   │   │   ├── loading-state.tsx
│   │   │   ├── error-boundary.tsx
│   │   │   └── index.ts
│   │   ├── forms/
│   │   │   ├── entity-form.tsx
│   │   │   ├── dynamic-form-field.tsx
│   │   │   ├── attribute-manager.tsx
│   │   │   └── index.ts
│   │   ├── grid/
│   │   │   ├── entity-grid.tsx          # Refatorar para usar UniversalCard
│   │   │   └── index.ts
│   │   ├── layout/
│   │   │   ├── entity-page-template.tsx # ✨ NOVO - Template de página
│   │   │   ├── page-header.tsx
│   │   │   ├── entity-list-page.tsx
│   │   │   └── index.ts
│   │   ├── modals/
│   │   │   ├── quick-create-modal.tsx   # ✨ NOVO - Modal genérico
│   │   │   ├── import-modal.tsx
│   │   │   ├── help-modal.tsx
│   │   │   ├── multi-view-modal.tsx
│   │   │   └── index.ts
│   │   ├── search/
│   │   │   ├── search-section.tsx
│   │   │   └── index.ts
│   │   ├── stats/
│   │   │   ├── stats-section.tsx
│   │   │   └── index.ts
│   │   └── index.ts                     # Exporta tudo
│   │
│   ├── stock/                           # 🗑️ DEPRECAR - Mover para shared
│   │   └── ... (manter temporariamente para compatibilidade)
│   │
│   └── modals/                          # 🗑️ DEPRECAR - Mover para shared
│       └── ...
│
├── config/
│   ├── api.ts
│   ├── menu-items.tsx
│   └── entities/                        # Configurações por entidade
│       ├── index.ts                     # ✨ NOVO - Exporta todas configs
│       ├── base.config.ts               # ✨ NOVO - Configs base compartilhadas
│       ├── templates.config.ts          # Expandir
│       ├── locations.config.ts          # ✨ NOVO
│       ├── products.config.ts           # Expandir
│       ├── variants.config.ts           # Expandir
│       └── items.config.ts              # Expandir
│
├── hooks/
│   ├── shared/                          # Hooks genéricos
│   │   ├── use-entity-page.ts           # ✨ NOVO - Orquestrador
│   │   ├── use-modals.ts                # ✨ NOVO - Gerenciador de modais
│   │   ├── use-entity-crud.ts           # ✨ NOVO - CRUD genérico
│   │   ├── use-multi-select.ts          # ✨ NOVO - Seleção múltipla
│   │   └── index.ts
│   ├── stock/                           # Hooks específicos de stock
│   │   └── ... (manter)
│   └── ...
│
├── types/
│   ├── entity-config.ts                 # Expandir
│   ├── shared/
│   │   ├── page.types.ts                # ✨ NOVO
│   │   ├── card.types.ts                # ✨ NOVO
│   │   └── index.ts
│   └── ...
│
└── utils/                               # ✨ NOVO
    ├── error-handling.ts                # Tratamento de erros
    ├── date-formatting.ts               # Formatação de datas
    ├── string-formatting.ts             # Formatação de strings
    └── index.ts
```

---

## 📝 Exemplo de Implementação: Nova Página de Entidade

### Antes (Código Repetitivo - ~400 linhas)

```typescript
// Cada página precisa de:
// - 15+ estados useState
// - 10+ handlers
// - Configuração de batch operations
// - Lógica de seleção
// - Tratamento de erros
// - Loading states
// - Múltiplos modais
```

### Depois (Código Limpo - ~100 linhas)

```typescript
// src/app/(dashboard)/stock/assets/templates/page.tsx

import { EntityPageTemplate } from '@/components/shared';
import { templatesPageConfig } from '@/config/entities/templates.config';

export default function TemplatesPage() {
  return (
    <ProtectedRoute requiredRole="MANAGER">
      <SelectionProvider>
        <EntityPageTemplate config={templatesPageConfig} />
      </SelectionProvider>
    </ProtectedRoute>
  );
}
```

```typescript
// src/config/entities/templates.config.ts

import { EntityPageConfig } from '@/types/entity-config';
import { Template } from '@/types/stock';

export const templatesPageConfig: EntityPageConfig<Template> = {
  // Identificação
  entityName: 'Template',
  entityNamePlural: 'Templates',
  entityKey: 'templates',
  
  // URLs
  basePath: '/stock/assets/templates',
  createPath: '/stock/assets/templates/new',
  
  // Hooks
  useListHook: useTemplates,
  useDeleteHook: useDeleteTemplate,
  useCreateHook: useCreateTemplate,
  
  // Filtro
  filterFn: (template, query) => 
    template.name.toLowerCase().includes(query.toLowerCase()),
  
  // Cards
  renderGridCard: (template, isSelected) => (
    <UniversalCard config={{
      layout: 'grid',
      icon: <Grid3x3 className="w-6 h-6" />,
      iconBackground: 'from-blue-500 to-purple-600',
      title: template.name,
      badges: [
        { 
          label: `${getAttributesCount(template)} atributos`, 
          variant: 'secondary' 
        }
      ],
      indicators: {
        isNew: isNewItem(template.createdAt),
        isUpdated: isUpdatedItem(template.createdAt, template.updatedAt),
      },
      dates: {
        created: template.createdAt,
        updated: template.updatedAt,
      },
      isSelected,
    }} />
  ),
  
  renderListCard: (template, isSelected) => (
    <UniversalCard config={{
      layout: 'list',
      // ... similar
    }} />
  ),
  
  // Estatísticas
  stats: [
    {
      label: 'Total de Templates',
      getValue: (items) => items.length,
      icon: <FileText className="w-5 h-5" />,
    },
    // ...
  ],
  
  // FAQs
  faqs: [
    {
      question: 'O que são templates?',
      answer: 'Templates são modelos...',
    },
    // ...
  ],
  
  // Features
  features: {
    quickCreate: true,
    import: true,
    multiView: true,
    compare: true,
  },
  
  // Duplicação
  duplicateConfig: {
    getNewName: (template) => `${template.name} (cópia)`,
    getData: (template) => ({
      name: `${template.name} (cópia)`,
      productAttributes: template.productAttributes,
      variantAttributes: template.variantAttributes,
      itemAttributes: template.itemAttributes,
    }),
  },
};
```

---

## 🔄 Plano de Migração

### Fase 1: Infraestrutura (1 semana)

1. **Criar hooks genéricos**
   - [ ] `useEntityPage`
   - [ ] `useModals`
   - [ ] `useEntityCrud`

2. **Criar componentes base**
   - [ ] `UniversalCard`
   - [ ] `EntityPageTemplate`
   - [ ] `ErrorState` / `LoadingState`

3. **Criar tipos TypeScript**
   - [ ] `EntityPageConfig`
   - [ ] `UniversalCardConfig`
   - [ ] `StatsConfig`

### Fase 2: Migração de Templates (3 dias)

1. [ ] Criar `templates.config.ts` completo
2. [ ] Migrar página de listagem
3. [ ] Testar todas as funcionalidades
4. [ ] Validar design visual (deve ser idêntico)

### Fase 3: Migração de Locations (3 dias)

1. [ ] Criar `locations.config.ts`
2. [ ] Migrar página de listagem
3. [ ] Migrar página de detalhes
4. [ ] Testar hierarquia de localizações

### Fase 4: Migração de Products/Variants/Items (1 semana)

1. [ ] Criar configs para cada entidade
2. [ ] Migrar páginas progressivamente
3. [ ] Testar integrações entre entidades

### Fase 5: Limpeza e Documentação (3 dias)

1. [ ] Remover código duplicado
2. [ ] Deprecar componentes antigos
3. [ ] Documentar padrões
4. [ ] Criar guia de desenvolvimento

---

## 📋 Checklist de Qualidade

### Código
- [ ] Sem código duplicado entre páginas
- [ ] Todos os componentes tipados com TypeScript
- [ ] Nomes semânticos e descritivos
- [ ] Funções com responsabilidade única
- [ ] Máximo 200 linhas por arquivo
- [ ] Comentários JSDoc em interfaces públicas

### Performance
- [ ] Memoização onde necessário (useMemo, useCallback)
- [ ] Lazy loading de componentes pesados
- [ ] Otimização de re-renders
- [ ] Debounce em inputs de busca

### UX
- [ ] Loading states em todas as operações
- [ ] Mensagens de erro claras
- [ ] Feedback visual para ações
- [ ] Suporte a keyboard navigation
- [ ] Responsividade completa

### Acessibilidade
- [ ] ARIA labels apropriados
- [ ] Contraste adequado
- [ ] Navegação por teclado
- [ ] Screen reader friendly

---

## 🎯 Métricas de Sucesso

| Métrica | Antes | Depois |
|---------|-------|--------|
| Linhas de código por página | ~400 | ~100 |
| Componentes duplicados | ~15 | 0 |
| Tempo para criar nova página | 2-3 dias | 2-4 horas |
| Arquivos para modificar (bug fix) | 5-10 | 1-2 |
| Cobertura de testes | ~0% | 60%+ |

---

## 🚀 Próximos Passos

1. **Revisar e aprovar este plano**
2. **Começar pela Fase 1** - Infraestrutura
3. **Migrar Templates como piloto**
4. **Iterar e melhorar baseado em feedback**
5. **Migrar demais entidades**

---

## 📚 Referências

- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Clean Code - Robert C. Martin](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
- [React Patterns](https://reactpatterns.com/)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)

---

## 📎 Apêndice A: Tipos TypeScript Completos

```typescript
// src/types/shared/page.types.ts

import { ReactNode } from 'react';
import { UseMutationResult, UseQueryResult } from '@tanstack/react-query';

// ==================== ENTITY PAGE ====================

export interface EntityPageConfig<T extends { id: string }> {
  // Identificação
  entityName: string;
  entityNamePlural: string;
  entityKey: string;
  
  // URLs
  basePath: string;
  createPath?: string;
  detailPath?: (id: string) => string;
  editPath?: (id: string) => string;
  
  // Hooks de dados
  useListHook: () => UseQueryResult<T[]>;
  useDeleteHook: () => UseMutationResult<void, Error, string>;
  useCreateHook: () => UseMutationResult<T, Error, Partial<T>>;
  
  // Filtros
  filterFn?: (item: T, query: string) => boolean;
  
  // Cards
  renderGridCard: (item: T, isSelected: boolean) => ReactNode;
  renderListCard: (item: T, isSelected: boolean) => ReactNode;
  
  // Ícone da entidade
  entityIcon: ReactNode;
  
  // Estatísticas
  stats: StatsConfig<T>[];
  
  // FAQs para Help Modal
  faqs: FAQItem[];
  
  // Ações do header
  headerActions?: HeaderAction[];
  
  // Ações do context menu
  contextMenuActions?: ContextMenuAction<T>[];
  
  // Features opcionais
  features?: PageFeatures;
  
  // Configuração de duplicação
  duplicateConfig?: DuplicateConfig<T>;
  
  // Configuração de quick create
  quickCreateConfig?: QuickCreateConfig;
  
  // Configuração de import
  importConfig?: ImportConfig;
  
  // Permissões
  requiredRole?: string;
  
  // Callbacks customizados
  callbacks?: PageCallbacks<T>;
}

export interface StatsConfig<T> {
  label: string;
  getValue: (items: T[]) => number | string;
  icon: ReactNode;
  trend?: (items: T[]) => number;
  format?: (value: number | string) => string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface HeaderAction {
  label?: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  style?: {
    iconColor?: string;
  };
}

export interface ContextMenuAction<T> {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: (items: T[]) => void;
  variant?: 'default' | 'destructive';
  showWhen?: (items: T[]) => boolean;
  disabled?: (items: T[]) => boolean;
}

export interface PageFeatures {
  quickCreate?: boolean;
  import?: boolean;
  export?: boolean;
  multiView?: boolean;
  compare?: boolean;
  bulkEdit?: boolean;
  dragAndDrop?: boolean;
}

export interface DuplicateConfig<T> {
  getNewName: (item: T) => string;
  getData: (item: T) => Partial<T>;
}

export interface QuickCreateConfig {
  title: string;
  placeholder: string;
  fields?: Array<{
    name: string;
    label: string;
    type: 'text' | 'number' | 'select';
    required?: boolean;
    options?: Array<{ label: string; value: string }>;
  }>;
}

export interface ImportConfig {
  acceptedFormats: string[];
  templateUrl?: string;
  maxFileSize?: number;
  onImport: (file: File) => Promise<void>;
}

export interface PageCallbacks<T> {
  onItemClick?: (id: string, event: React.MouseEvent) => void;
  onItemDoubleClick?: (id: string) => void;
  afterDelete?: (ids: string[]) => void;
  afterDuplicate?: (items: T[]) => void;
  afterCreate?: (item: T) => void;
}

// ==================== UNIVERSAL CARD ====================

export interface UniversalCardConfig {
  // Layout
  layout: 'grid' | 'list';
  
  // Ícone
  icon: ReactNode;
  iconBackground?: string;
  
  // Conteúdo
  title: string;
  subtitle?: string;
  description?: string;
  
  // Badges
  badges?: BadgeConfig[];
  
  // Indicadores
  indicators?: CardIndicators;
  
  // Métricas
  metrics?: MetricConfig[];
  
  // Progresso
  progress?: ProgressConfig;
  
  // Datas
  dates?: {
    created?: Date | string;
    updated?: Date | string;
  };
  
  // Estado
  isSelected?: boolean;
  isDisabled?: boolean;
  
  // Eventos
  onClick?: () => void;
  onDoubleClick?: () => void;
}

export interface BadgeConfig {
  label: string;
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  className?: string;
  icon?: ReactNode;
}

export interface CardIndicators {
  isNew?: boolean;
  isUpdated?: boolean;
  isActive?: boolean;
  customBadge?: ReactNode;
}

export interface MetricConfig {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
}

export interface ProgressConfig {
  current: number;
  total: number;
  label?: string;
  showPercentage?: boolean;
  colorThresholds?: {
    warning: number;
    danger: number;
  };
}
```

---

## 📎 Apêndice B: Exemplo de Hook useEntityPage

```typescript
// src/hooks/shared/use-entity-page.ts

import { useCallback, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useSelection } from '@/contexts/selection-context';
import { useBatchOperation } from '@/hooks/use-batch-operation-v2';
import { useModals } from './use-modals';
import type { EntityPageConfig } from '@/types/shared/page.types';

export function useEntityPage<T extends { id: string }>(
  config: EntityPageConfig<T>
) {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // Estados
  const [searchQuery, setSearchQuery] = useState('');
  const [activeOperation, setActiveOperation] = useState<'delete' | 'duplicate' | null>(null);
  
  // Hooks
  const modals = useModals();
  const selection = useSelection();
  const listQuery = config.useListHook();
  const deleteMutation = config.useDeleteHook();
  const createMutation = config.useCreateHook();
  
  // Query key
  const queryKey = [config.entityKey];
  
  // Filtrar itens
  const filteredItems = useMemo(() => {
    const items = listQuery.data || [];
    if (!searchQuery.trim() || !config.filterFn) return items;
    return items.filter(item => config.filterFn!(item, searchQuery));
  }, [listQuery.data, searchQuery, config.filterFn]);
  
  // Batch delete
  const batchDelete = useBatchOperation(
    (id: string) => deleteMutation.mutateAsync(id),
    {
      batchSize: 3,
      delayBetweenItems: 500,
      delayBetweenBatches: 2000,
      maxRetries: 3,
      onItemComplete: (result) => {
        if (result.status === 'success') {
          queryClient.invalidateQueries({ queryKey });
        }
      },
      onComplete: (results) => {
        const succeeded = results.filter(r => r.status === 'success').length;
        const failed = results.filter(r => r.status === 'failed').length;
        
        if (failed === 0) {
          toast.success(
            succeeded === 1
              ? `${config.entityName} excluído com sucesso!`
              : `${succeeded} ${config.entityNamePlural.toLowerCase()} excluídos com sucesso!`
          );
        } else if (succeeded > 0) {
          toast.warning(
            `${succeeded} ${config.entityNamePlural.toLowerCase()} excluídos, mas ${failed} falharam.`
          );
        } else {
          toast.error(`Erro ao excluir ${config.entityNamePlural.toLowerCase()}`);
        }
        
        selection.clearSelection();
        config.callbacks?.afterDelete?.(modals.itemsToDelete);
      },
    }
  );
  
  // Batch duplicate
  const batchDuplicate = useBatchOperation(
    async (id: string) => {
      const item = filteredItems.find(i => i.id === id);
      if (!item) throw new Error(`${config.entityName} não encontrado`);
      
      if (!config.duplicateConfig) {
        throw new Error('Configuração de duplicação não definida');
      }
      
      const data = config.duplicateConfig.getData(item);
      return createMutation.mutateAsync(data);
    },
    {
      batchSize: 3,
      delayBetweenItems: 500,
      delayBetweenBatches: 2000,
      maxRetries: 3,
      onItemComplete: (result) => {
        if (result.status === 'success') {
          queryClient.invalidateQueries({ queryKey });
        }
      },
      onComplete: (results) => {
        const succeeded = results.filter(r => r.status === 'success').length;
        const failed = results.filter(r => r.status === 'failed').length;
        
        if (failed === 0) {
          toast.success(
            succeeded === 1
              ? `${config.entityName} duplicado com sucesso!`
              : `${succeeded} ${config.entityNamePlural.toLowerCase()} duplicados com sucesso!`
          );
        } else if (succeeded > 0) {
          toast.warning(
            `${succeeded} ${config.entityNamePlural.toLowerCase()} duplicados, mas ${failed} falharam.`
          );
        } else {
          toast.error(`Erro ao duplicar ${config.entityNamePlural.toLowerCase()}`);
        }
        
        selection.clearSelection();
      },
    }
  );
  
  // Handlers
  const handlers = {
    handleSearch: useCallback((query: string) => {
      setSearchQuery(query);
    }, []),
    
    handleItemClick: useCallback((id: string, event: React.MouseEvent) => {
      if (event.shiftKey && selection.lastSelectedId) {
        const allIds = filteredItems.map(i => i.id);
        selection.selectRange(selection.lastSelectedId, id, allIds);
      } else {
        selection.selectItem(id, event);
      }
      config.callbacks?.onItemClick?.(id, event);
    }, [filteredItems, selection, config.callbacks]),
    
    handleItemDoubleClick: useCallback((id: string) => {
      if (config.detailPath) {
        router.push(config.detailPath(id));
      }
      config.callbacks?.onItemDoubleClick?.(id);
    }, [router, config]),
    
    handleItemsView: useCallback((ids: string[]) => {
      if (ids.length === 1 && config.detailPath) {
        router.push(config.detailPath(ids[0]));
      } else if (ids.length > 1 && config.features?.multiView) {
        modals.open('multiView');
      } else {
        toast.info(`Selecione apenas um ${config.entityName.toLowerCase()} para visualizar.`);
      }
    }, [router, modals, config]),
    
    handleItemsEdit: useCallback((ids: string[]) => {
      if (ids.length === 1 && config.editPath) {
        router.push(config.editPath(ids[0]));
      } else {
        toast.info(`Selecione apenas um ${config.entityName.toLowerCase()} para editar.`);
      }
    }, [router, config]),
    
    handleItemsDuplicate: useCallback((ids: string[]) => {
      modals.setItemsToDuplicate(ids);
      modals.open('duplicate');
    }, [modals]),
    
    handleItemsDelete: useCallback((ids: string[]) => {
      modals.setItemsToDelete(ids);
      modals.open('delete');
    }, [modals]),
    
    handleSelectRange: useCallback((startId: string, endId: string) => {
      const allIds = filteredItems.map(i => i.id);
      selection.selectRange(startId, endId, allIds);
    }, [filteredItems, selection]),
    
    handleDeleteConfirm: useCallback(async () => {
      modals.close('delete');
      setActiveOperation('delete');
      await batchDelete.start(modals.itemsToDelete);
    }, [modals, batchDelete]),
    
    handleDuplicateConfirm: useCallback(async () => {
      modals.close('duplicate');
      setActiveOperation('duplicate');
      await batchDuplicate.start(modals.itemsToDuplicate);
    }, [modals, batchDuplicate]),
    
    handleNavigateToNew: useCallback(() => {
      if (config.createPath) {
        router.push(config.createPath);
      }
    }, [router, config]),
  };
  
  return {
    // Estados
    searchQuery,
    activeOperation,
    setActiveOperation,
    
    // Dados
    items: filteredItems,
    allItems: listQuery.data || [],
    isLoading: listQuery.isLoading,
    error: listQuery.error,
    
    // Modais
    modals,
    
    // Seleção
    selection,
    
    // Batch operations
    batchDelete,
    batchDuplicate,
    
    // Handlers
    handlers,
    
    // Config passthrough
    config,
  };
}
```

---

## 🚀 PLANO DE MIGRAÇÃO ATUALIZADO

### Cronograma Visual

```
Semana  1   2   3   4   5   6   7   8   9   10  11  12
        ├───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┤
Fase 1  ████████                                        Core + Forms
Fase 2          ████████                                Tabs + CRUD
Fase 3                  ████████                        Segurança
Fase 4                          ████████                Serviços
Fase 5                                  ████████        Migração
Fase 6                                          ████████ Testes
```

---

### Fase 1: Core + Sistema de Formulários (Semana 1-2)

#### Objetivos
- [x] Criar estrutura de pastas @core, @services, @security
- [ ] Implementar sistema de tipos base
- [ ] Criar sistema de formulários padronizado
- [ ] Criar EntityPageTemplate
- [ ] Criar UniversalCard

#### 1.1 Infraestrutura Base

| Tarefa | Prioridade | Esforço | Status |
|--------|------------|---------|--------|
| Configurar aliases (@core, @services, @security) | Alta | 1h | 🔲 |
| Criar tipos base em `@core/types/` | Alta | 3h | 🔲 |
| Migrar `SelectionContext` para `@core` | Média | 2h | 🔲 |
| Criar `CoreProvider` combinado | Média | 2h | 🔲 |

#### 1.2 Sistema de Formulários (@core/forms)

| Tarefa | Prioridade | Esforço | Status |
|--------|------------|---------|--------|
| Criar estrutura `@core/forms/` | Alta | 1h | 🔲 |
| Implementar `EntityForm` base | Alta | 6h | 🔲 |
| Criar campos básicos (Text, Number, Select) | Alta | 4h | 🔲 |
| Criar campos avançados (Date, Currency, Rich) | Alta | 6h | 🔲 |
| Implementar `useEntityForm` hook | Alta | 4h | 🔲 |
| Criar `FormSection` colapsável | Média | 2h | 🔲 |
| Integrar validação com Zod | Alta | 3h | 🔲 |
| Implementar auto-save | Baixa | 3h | 🔲 |
| Criar `ArrayField` para listas | Média | 4h | 🔲 |
| Criar `ObjectField` para sub-forms | Média | 3h | 🔲 |

#### 1.3 Componentes Entity

| Tarefa | Prioridade | Esforço | Status |
|--------|------------|---------|--------|
| Criar `EntityPageTemplate` | Alta | 6h | 🔲 |
| Criar `UniversalCard` | Alta | 4h | 🔲 |
| Criar `EntityContextMenu` | Alta | 3h | 🔲 |
| Criar `@core/hooks/useEntityPage.ts` | Alta | 6h | 🔲 |

#### Entregáveis Fase 1
1. ✅ Sistema de formulários completo
2. ✅ 20+ campos de formulário padronizados
3. ✅ `EntityForm` com seções e validação
4. ✅ `EntityPageTemplate` funcionando
5. ✅ `UniversalCard` para grid/list

---

### Fase 2: Sistema de Abas + CRUD (Semana 3-4)

#### 2.1 Sistema de Abas (@core/tabs)

| Tarefa | Prioridade | Esforço | Status |
|--------|------------|---------|--------|
| Criar estrutura `@core/tabs/` | Alta | 1h | 🔲 |
| Implementar `EntityTabs` | Alta | 4h | 🔲 |
| Criar `TabList` e `TabPanel` | Alta | 3h | 🔲 |
| Implementar `useTabs` hook | Alta | 2h | 🔲 |
| Persistência de aba na URL | Média | 2h | 🔲 |
| Lazy loading de abas | Média | 2h | 🔲 |
| `TabPageLayout` | Média | 3h | 🔲 |
| `MasterDetailLayout` | Média | 4h | 🔲 |
| `VerticalTabLayout` | Baixa | 3h | 🔲 |
| Scroll para muitas abas | Baixa | 2h | 🔲 |

#### 2.2 Sistema CRUD (@core/crud)

| Tarefa | Prioridade | Esforço | Status |
|--------|------------|---------|--------|
| Criar estrutura `@core/crud/` | Alta | 1h | 🔲 |
| Implementar `useCrud` hook principal | Alta | 6h | 🔲 |
| Criar `CrudListPage` | Alta | 6h | 🔲 |
| Criar `CrudDetailPage` | Alta | 5h | 🔲 |
| Criar `CrudCreatePage` | Alta | 4h | 🔲 |
| Criar `CrudEditPage` | Alta | 3h | 🔲 |
| Implementar `createCrudConfig` factory | Alta | 4h | 🔲 |
| Criar `CrudHeader` com breadcrumbs | Média | 2h | 🔲 |
| Criar `CrudToolbar` | Média | 2h | 🔲 |
| Criar `CrudFilters` | Média | 3h | 🔲 |
| Criar `CrudPagination` | Média | 2h | 🔲 |

#### Entregáveis Fase 2
1. ✅ Sistema de abas com 4 variantes
2. ✅ 3 layouts de abas padronizados
3. ✅ Sistema CRUD completo
4. ✅ Factory para criar CRUDs rapidamente
5. ✅ Páginas CRUD prontas para uso

---

### Fase 3: Sistema de Segurança (Semana 5-6)

#### 3.1 RBAC (@security/rbac)

| Tarefa | Prioridade | Esforço | Status |
|--------|------------|---------|--------|
| Criar estrutura `@security/rbac/` | Alta | 1h | 🔲 |
| Definir tipos de permissões | Alta | 2h | 🔲 |
| Implementar `usePermissions` hook | Alta | 4h | 🔲 |
| Criar `PermissionGate` componente | Alta | 3h | 🔲 |
| Criar `RoleGate` componente | Alta | 2h | 🔲 |
| Criar `FeatureGate` componente | Média | 2h | 🔲 |
| Definir roles padrão | Alta | 2h | 🔲 |
| Integrar com auth-context | Alta | 4h | 🔲 |
| Criar HOC `withPermission` | Média | 2h | 🔲 |
| Criar directive para rotas | Média | 3h | 🔲 |

#### 3.2 Administração de Usuários

| Tarefa | Prioridade | Esforço | Status |
|--------|------------|---------|--------|
| Página de listagem de usuários | Alta | 4h | 🔲 |
| Página de criação/edição de usuário | Alta | 4h | 🔲 |
| Página de administração de roles | Média | 6h | 🔲 |
| Matriz de permissões | Média | 4h | 🔲 |
| Logs de auditoria | Baixa | 6h | 🔲 |

#### Entregáveis Fase 3
1. ✅ Sistema RBAC completo
2. ✅ Componentes de proteção (Gate, HOC)
3. ✅ Página de administração de roles
4. ✅ Integração com autenticação
5. ✅ Logs de auditoria básicos

---

### Fase 4: Serviços do Sistema (Semana 7-8)

#### 4.1 Sistema de Modais (@services/modals)

| Tarefa | Prioridade | Esforço | Status |
|--------|------------|---------|--------|
| Criar `ModalProvider` | Alta | 4h | 🔲 |
| Criar `useModal` hook | Alta | 3h | 🔲 |
| Implementar `confirm()` | Alta | 2h | 🔲 |
| Implementar `alert()` | Alta | 1h | 🔲 |
| Suporte a Drawer | Média | 3h | 🔲 |
| Suporte a Fullscreen | Média | 2h | 🔲 |
| Stack de modais | Média | 3h | 🔲 |

#### 4.2 Sistema de Notificações (@services/notifications)

| Tarefa | Prioridade | Esforço | Status |
|--------|------------|---------|--------|
| Implementar `useNotifications` | Alta | 4h | 🔲 |
| Criar `NotificationsPanel` | Alta | 4h | 🔲 |
| Preferências de notificação | Média | 4h | 🔲 |
| WebSocket para real-time | Média | 6h | 🔲 |

#### 4.3 Sistema de Batch (@services/batch)

| Tarefa | Prioridade | Esforço | Status |
|--------|------------|---------|--------|
| Implementar `BatchQueue` | Alta | 6h | 🔲 |
| Criar `BatchProgress` | Alta | 4h | 🔲 |
| Controles pause/resume | Média | 3h | 🔲 |
| Persistência de jobs | Baixa | 4h | 🔲 |

#### 4.4 Sistema de Busca (@core/search)

| Tarefa | Prioridade | Esforço | Status |
|--------|------------|---------|--------|
| Criar `SearchBar` padronizado | Alta | 3h | 🔲 |
| Criar `SearchFilters` | Alta | 4h | 🔲 |
| Criar `SearchFacets` | Média | 3h | 🔲 |
| Implementar `GlobalSearch` (Cmd+K) | Média | 6h | 🔲 |
| Histórico de buscas | Baixa | 2h | 🔲 |

#### 4.5 Sistema de Dashboard (@core/dashboard)

| Tarefa | Prioridade | Esforço | Status |
|--------|------------|---------|--------|
| Criar `Dashboard` container | Alta | 3h | 🔲 |
| Criar `DashboardGrid` responsivo | Alta | 4h | 🔲 |
| Widget `StatCard` | Alta | 2h | 🔲 |
| Widget `ChartLine` | Alta | 3h | 🔲 |
| Widget `ChartBar` | Média | 3h | 🔲 |
| Widget `ChartPie` | Média | 2h | 🔲 |
| Widget `DataTable` | Média | 3h | 🔲 |
| Widget `ActivityFeed` | Baixa | 3h | 🔲 |

#### Entregáveis Fase 4
1. ✅ Sistema de modais unificado
2. ✅ Notificações em tempo real
3. ✅ Batch processing com queue
4. ✅ Busca global (Cmd+K)
5. ✅ Sistema de dashboard com widgets

---

### Fase 5: Migração de Páginas (Semana 9-10)

#### Ordem de Migração

```
Prioridade 1 (Semana 9):
├── Templates - Página piloto, menor risco
├── Locations - Similar a templates
└── Dashboard - Usar novos widgets

Prioridade 2 (Semana 10):
├── Products - Mais complexa, usa tabs
├── Variants - Depende de products
└── Items - Mais complexa, muitas features

Prioridade 3 (Semana 11+):
├── Orders - Sistema de vendas
├── Customers - CRM
└── Reports - Dashboards
```

#### Checklist por Página

Para cada página migrada:
- [ ] Criar config CRUD usando `createCrudConfig()`
- [ ] Usar `CrudListPage` ao invés de página manual
- [ ] Usar `CrudDetailPage` com `EntityTabs`
- [ ] Usar `CrudCreatePage` com `EntityForm`
- [ ] Usar `UniversalCard` ao invés de cards específicos
- [ ] Adicionar `PermissionGate` em ações
- [ ] Migrar modais para `useModal()`
- [ ] Testar batch operations
- [ ] Testar seleção múltipla
- [ ] Testar responsividade
- [ ] Testar permissões

#### Exemplo de Migração - Templates

**ANTES (400+ linhas):**
```typescript
// pages/templates/page.tsx
export default function TemplatesPage() {
  const [isQuickCreateModalOpen, setIsQuickCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  // ... mais 15 estados
  // ... 300+ linhas de handlers
}
```

**DEPOIS (50 linhas):**
```typescript
// pages/templates/page.tsx
import { CrudListPage } from '@core/crud';
import { templateCrudConfig } from '@/config/entities/templates.config';

export default function TemplatesPage() {
  return <CrudListPage config={templateCrudConfig} />;
}
```

---

### Fase 6: Serviços Avançados (Semana 11-12)

#### 6.1 File Manager

| Tarefa | Esforço | Status |
|--------|---------|--------|
| Implementar `FileManager` | 8h | 🔲 |
| Upload com drag & drop | 4h | 🔲 |
| Preview de arquivos | 6h | 🔲 |
| Compartilhamento | 4h | 🔲 |

#### 6.2 Sistema de Calendário

| Tarefa | Esforço | Status |
|--------|---------|--------|
| Implementar `Calendar` | 8h | 🔲 |
| Eventos recorrentes | 4h | 🔲 |
| Views (dia, semana, mês) | 6h | 🔲 |

#### 6.3 Sistema de Solicitações

| Tarefa | Esforço | Status |
|--------|---------|--------|
| Workflow engine | 8h | 🔲 |
| Aprovações multinível | 6h | 🔲 |
| Dashboard de solicitações | 4h | 🔲 |

---

## 🗺️ ROADMAP DETALHADO DE IMPLEMENTAÇÃO

Este roadmap contém instruções **step-by-step** para implementar o OpenSea OS sem dúvidas.

### 📊 Visão Geral do Roadmap

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     ROADMAP OPENSEA OS - 12 SEMANAS                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  SPRINT 1 (Sem 1-2)    SPRINT 2 (Sem 3-4)    SPRINT 3 (Sem 5-6)            │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐           │
│  │ 🏗️ FUNDAÇÃO     │   │ 📝 CRUD & FORMS │   │ 🔐 SEGURANÇA    │           │
│  │                 │   │                 │   │                 │           │
│  │ • Estrutura     │   │ • EntityForm    │   │ • RBAC          │           │
│  │ • Tipos Base    │   │ • CRUD Pages    │   │ • PermissionGate│           │
│  │ • Providers     │   │ • Tabs System   │   │ • Audit Log     │           │
│  │ • UniversalCard │   │ • Modals System │   │ • Undo/Redo     │           │
│  └─────────────────┘   └─────────────────┘   └─────────────────┘           │
│           │                     │                     │                     │
│           ▼                     ▼                     ▼                     │
│  SPRINT 4 (Sem 7-8)    SPRINT 5 (Sem 9-10)   SPRINT 6 (Sem 11-12)          │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐           │
│  │ 🔧 SERVIÇOS     │   │ 🔄 MIGRAÇÃO     │   │ ✅ FINALIZAÇÃO  │           │
│  │                 │   │                 │   │                 │           │
│  │ • Batch Queue   │   │ • Templates     │   │ • Testes E2E    │           │
│  │ • Notifications │   │ • Locations     │   │ • Storybook     │           │
│  │ • Search Global │   │ • Products      │   │ • Docs          │           │
│  │ • Dashboard     │   │ • Items         │   │ • Performance   │           │
│  └─────────────────┘   └─────────────────┘   └─────────────────┘           │
│                                                                             │
│  📈 PROGRESSO: [░░░░░░░░░░░░░░░░░░░░] 0%                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 🏗️ SPRINT 1: FUNDAÇÃO (Semana 1-2)

> **Objetivo**: Criar a infraestrutura base que todos os outros sistemas usarão.

#### ETAPA 1.1: Configuração de Aliases e Estrutura de Pastas

**⏱️ Tempo estimado**: 2 horas

##### Passo 1.1.1: Criar estrutura de pastas

```powershell
# Executar no terminal (PowerShell)
cd d:\Code\Projetos\OpenSea-APP\src

# Criar estrutura @core
mkdir -p core/types
mkdir -p core/hooks
mkdir -p core/components
mkdir -p core/utils
mkdir -p core/providers
mkdir -p core/forms/components
mkdir -p core/forms/hooks
mkdir -p core/forms/types
mkdir -p core/forms/fields
mkdir -p core/forms/validation
mkdir -p core/crud/components
mkdir -p core/crud/hooks
mkdir -p core/crud/pages
mkdir -p core/crud/types
mkdir -p core/tabs/components
mkdir -p core/tabs/hooks
mkdir -p core/tabs/types
mkdir -p core/search/components
mkdir -p core/search/hooks
mkdir -p core/selection/components
mkdir -p core/selection/hooks
mkdir -p core/selection/types
mkdir -p core/undo-redo/components
mkdir -p core/undo-redo/hooks
mkdir -p core/undo-redo/types
mkdir -p core/audit/components
mkdir -p core/audit/hooks
mkdir -p core/audit/types
mkdir -p core/audit/services

# Criar estrutura @services
mkdir -p services/modals/components
mkdir -p services/modals/hooks
mkdir -p services/modals/types
mkdir -p services/batch/components
mkdir -p services/batch/hooks
mkdir -p services/batch/types
mkdir -p services/notifications/components
mkdir -p services/notifications/hooks
mkdir -p services/notifications/types
mkdir -p services/files/components
mkdir -p services/files/hooks
mkdir -p services/files/types
mkdir -p services/calendar/components
mkdir -p services/calendar/hooks
mkdir -p services/calendar/types
mkdir -p services/dashboard/components
mkdir -p services/dashboard/widgets
mkdir -p services/dashboard/hooks
mkdir -p services/dashboard/types

# Criar estrutura @security
mkdir -p security/rbac/components
mkdir -p security/rbac/hooks
mkdir -p security/rbac/types
mkdir -p security/rbac/guards
```

##### Passo 1.1.2: Configurar aliases no tsconfig.json

```json
// tsconfig.json - Adicionar estes paths
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@core/*": ["./src/core/*"],
      "@services/*": ["./src/services/*"],
      "@security/*": ["./src/security/*"],
      "@ui/*": ["./src/components/ui/*"],
      "@config/*": ["./src/config/*"],
      "@hooks/*": ["./src/hooks/*"],
      "@types/*": ["./src/types/*"]
    }
  }
}
```

##### Passo 1.1.3: Criar arquivos index.ts para exports

```typescript
// src/core/index.ts
export * from './types';
export * from './hooks';
export * from './providers';
export * from './forms';
export * from './crud';
export * from './tabs';
export * from './search';
export * from './selection';

// src/services/index.ts
export * from './modals';
export * from './batch';
export * from './notifications';

// src/security/index.ts
export * from './rbac';
```

**✅ Checklist de validação:**
- [ ] Todas as pastas criadas
- [ ] tsconfig.json atualizado
- [ ] Imports com @ funcionando
- [ ] Sem erros de TypeScript

---

#### ETAPA 1.2: Tipos Base do Sistema

**⏱️ Tempo estimado**: 4 horas

##### Passo 1.2.1: Criar tipos fundamentais

```typescript
// src/core/types/base.types.ts

/**
 * Interface base para todas as entidades do sistema
 * Toda entidade DEVE estender BaseEntity
 */
export interface BaseEntity {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Entidade com soft delete
 */
export interface SoftDeletableEntity extends BaseEntity {
  deletedAt?: Date | string | null;
  isDeleted?: boolean;
}

/**
 * Entidade com timestamps de auditoria
 */
export interface AuditableEntity extends BaseEntity {
  createdBy?: string;
  updatedBy?: string;
}

/**
 * Entidade hierárquica (tem pai/filhos)
 */
export interface HierarchicalEntity extends BaseEntity {
  parentId?: string | null;
  path?: string;         // "/root/parent/child"
  level?: number;        // 0, 1, 2...
}

/**
 * Entidade ordenável
 */
export interface OrderableEntity extends BaseEntity {
  order: number;
  sortIndex?: number;
}

/**
 * Estado de loading padrão
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Resposta paginada da API
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * Parâmetros de query para listagem
 */
export interface QueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

/**
 * Resultado de operação em lote
 */
export interface BatchResult<T = any> {
  total: number;
  success: number;
  failed: number;
  results: {
    id: string;
    status: 'success' | 'failed';
    data?: T;
    error?: string;
  }[];
}
```

##### Passo 1.2.2: Criar tipos de configuração de entidade

```typescript
// src/core/types/entity-config.types.ts

import { LucideIcon } from 'lucide-react';
import { BaseEntity } from './base.types';

/**
 * Tipo de página para a entidade
 */
export type PageType = 'simple' | 'hierarchical' | 'chained';

/**
 * Configuração completa de uma entidade
 * Esta é a ÚNICA configuração necessária para criar CRUD completo
 */
export interface EntityConfig<T extends BaseEntity = BaseEntity> {
  // ==================== IDENTIFICAÇÃO ====================
  /** Nome singular: "Produto" */
  name: string;
  /** Nome plural: "Produtos" */
  namePlural: string;
  /** Chave única: "products" */
  key: string;
  /** Ícone da entidade */
  icon: LucideIcon;
  /** Descrição para tooltips */
  description?: string;

  // ==================== TIPO DE PÁGINA ====================
  /** Tipo de layout: simple, hierarchical, chained */
  pageType: PageType;

  // ==================== ROTAS ====================
  routes: EntityRoutes;

  // ==================== API ====================
  api: EntityApiConfig;

  // ==================== DISPLAY ====================
  display: EntityDisplayConfig<T>;

  // ==================== GRID/LISTAGEM ====================
  grid: EntityGridConfig<T>;

  // ==================== FORMULÁRIO ====================
  form: EntityFormConfig<T>;

  // ==================== VISUALIZAÇÃO ====================
  viewer: EntityViewerConfig<T>;

  // ==================== AÇÕES ====================
  actions: EntityActionsConfig;

  // ==================== PERMISSÕES ====================
  permissions: EntityPermissions;

  // ==================== BUSCA/FILTROS ====================
  search?: EntitySearchConfig<T>;

  // ==================== FEATURES OPCIONAIS ====================
  features?: EntityFeatures;

  // ==================== HOOKS DE CICLO DE VIDA ====================
  hooks?: EntityHooks<T>;
}

/**
 * Rotas da entidade
 */
export interface EntityRoutes {
  /** Listagem: "/stock/products" */
  list: string;
  /** Detalhes: "/stock/products/:id" */
  detail?: string;
  /** Criação: "/stock/products/new" */
  create?: string;
  /** Edição: "/stock/products/:id/edit" */
  edit?: string;
}

/**
 * Configuração de API
 */
export interface EntityApiConfig {
  /** URL base: "/products" */
  baseUrl: string;
  /** Query key para React Query */
  queryKey: string;
  /** Endpoints customizados */
  endpoints?: {
    list?: string;
    get?: string;
    create?: string;
    update?: string;
    delete?: string;
    duplicate?: string;
    restore?: string;
    bulkDelete?: string;
    bulkUpdate?: string;
  };
}

/**
 * Configuração de display
 */
export interface EntityDisplayConfig<T> {
  /** Campo usado como título: "name" */
  titleField: keyof T;
  /** Campo usado como subtítulo */
  subtitleField?: keyof T;
  /** Campo de descrição */
  descriptionField?: keyof T;
  /** Campo de cor/badge */
  colorField?: keyof T;
  /** Campo de status/badge */
  badgeField?: keyof T;
  /** Campo de ícone */
  iconField?: keyof T;
  /** Campo de imagem */
  imageField?: keyof T;
  /** Função para obter nome de exibição */
  getDisplayName?: (item: T) => string;
  /** Função para obter ícone */
  getIcon?: (item: T) => React.ReactNode;
}

/**
 * Configuração de grid/listagem
 */
export interface EntityGridConfig<T> {
  /** View padrão */
  defaultView: 'grid' | 'list' | 'table';
  /** Views disponíveis */
  availableViews: ('grid' | 'list' | 'table')[];
  /** Colunas (para table e list) */
  columns: GridColumn<T>[];
  /** Itens por página */
  pageSize?: number;
  /** Opções de page size */
  pageSizeOptions?: number[];
  /** Habilita seleção múltipla */
  selectable?: boolean;
  /** Habilita drag and drop */
  draggable?: boolean;
  /** Configuração do card (para grid) */
  card?: {
    /** Mostrar imagem */
    showImage?: boolean;
    /** Mostrar badges */
    showBadges?: boolean;
    /** Mostrar métricas */
    showMetrics?: boolean;
    /** Campos de métricas */
    metrics?: MetricField<T>[];
  };
}

/**
 * Coluna do grid/table
 */
export interface GridColumn<T> {
  /** Campo da entidade */
  field: keyof T | string;
  /** Label da coluna */
  label: string;
  /** Tipo de dado */
  type?: 'text' | 'number' | 'date' | 'datetime' | 'currency' | 'boolean' | 'badge' | 'image' | 'color';
  /** Largura */
  width?: number | string;
  /** Ordenável */
  sortable?: boolean;
  /** Filtrável */
  filterable?: boolean;
  /** Oculta por padrão */
  hidden?: boolean;
  /** Função de render customizada */
  render?: (value: any, item: T) => React.ReactNode;
  /** Formatação */
  format?: {
    type: 'date' | 'currency' | 'number' | 'percent';
    options?: Intl.DateTimeFormatOptions | Intl.NumberFormatOptions;
  };
}

/**
 * Métrica para exibição no card
 */
export interface MetricField<T> {
  field: keyof T | string;
  label: string;
  icon?: LucideIcon;
  format?: 'number' | 'currency' | 'percent';
}

/**
 * Configuração de ações
 */
export interface EntityActionsConfig {
  /** Ações do header */
  header?: {
    create?: boolean;
    import?: boolean;
    export?: boolean;
    bulkActions?: boolean;
  };
  /** Ações por item */
  item?: {
    view?: boolean;
    edit?: boolean;
    duplicate?: boolean;
    delete?: boolean;
    custom?: CustomAction[];
  };
  /** Ações em lote */
  batch?: {
    delete?: BatchActionConfig;
    duplicate?: BatchActionConfig;
    export?: BatchActionConfig;
    edit?: BatchActionConfig;
    custom?: CustomAction[];
  };
}

export interface BatchActionConfig {
  enabled: boolean;
  confirm?: boolean;
  confirmMessage?: string;
}

export interface CustomAction {
  id: string;
  label: string;
  icon: LucideIcon;
  onClick: (ids: string[]) => void | Promise<void>;
  permission?: string;
  variant?: 'default' | 'destructive' | 'warning';
  /** Número mínimo de itens selecionados */
  minSelection?: number;
  /** Número máximo de itens selecionados */
  maxSelection?: number;
}

/**
 * Permissões da entidade
 */
export interface EntityPermissions {
  list: string;
  view: string;
  create: string;
  update: string;
  delete: string;
  import?: string;
  export?: string;
  duplicate?: string;
}

/**
 * Features opcionais
 */
export interface EntityFeatures {
  /** Criação rápida (modal simplificado) */
  quickCreate?: boolean;
  /** Importação */
  import?: boolean;
  /** Exportação */
  export?: boolean;
  /** Visualização múltipla */
  multiView?: boolean;
  /** Comparação */
  compare?: boolean;
  /** Edição em massa */
  bulkEdit?: boolean;
  /** Undo/Redo */
  undoRedo?: boolean;
  /** Audit log */
  auditLog?: boolean;
  /** Favoritos */
  favorites?: boolean;
  /** Comentários */
  comments?: boolean;
  /** Anexos */
  attachments?: boolean;
  /** Histórico de versões */
  versioning?: boolean;
}

/**
 * Hooks de ciclo de vida
 */
export interface EntityHooks<T> {
  /** Antes de criar */
  beforeCreate?: (data: Partial<T>) => Partial<T> | Promise<Partial<T>>;
  /** Depois de criar */
  afterCreate?: (item: T) => void | Promise<void>;
  /** Antes de atualizar */
  beforeUpdate?: (id: string, data: Partial<T>) => Partial<T> | Promise<Partial<T>>;
  /** Depois de atualizar */
  afterUpdate?: (item: T) => void | Promise<void>;
  /** Antes de deletar */
  beforeDelete?: (id: string) => boolean | Promise<boolean>;
  /** Depois de deletar */
  afterDelete?: (id: string) => void | Promise<void>;
  /** Transform para formulário */
  transformForForm?: (item: T) => Partial<T>;
  /** Transform do formulário */
  transformFromForm?: (data: Partial<T>) => Partial<T>;
}
```

##### Passo 1.2.3: Criar tipos de formulário

```typescript
// src/core/forms/types/form.types.ts

/**
 * Tipos de campo disponíveis
 */
export type FieldType =
  // Básicos
  | 'text'
  | 'textarea'
  | 'number'
  | 'email'
  | 'phone'
  | 'password'
  | 'url'
  // Seleção
  | 'select'
  | 'multi-select'
  | 'combobox'
  | 'checkbox'
  | 'radio'
  | 'switch'
  // Data/Hora
  | 'date'
  | 'datetime'
  | 'time'
  | 'daterange'
  // Especiais
  | 'currency'
  | 'percent'
  | 'color'
  | 'file'
  | 'image'
  | 'rich-text'
  | 'code'
  | 'json'
  | 'markdown'
  // Complexos
  | 'array'
  | 'object'
  | 'relation'
  // Custom
  | 'custom';

/**
 * Configuração de um campo de formulário
 */
export interface FieldConfig<T = any> {
  // ==================== IDENTIFICAÇÃO ====================
  /** Nome do campo (corresponde ao campo da entidade) */
  name: keyof T | string;
  /** Label exibido */
  label: string;
  /** Tipo do campo */
  type: FieldType;

  // ==================== LAYOUT ====================
  /** Colunas ocupadas (grid de 12) */
  colSpan?: 1 | 2 | 3 | 4 | 6 | 12;
  /** Classe CSS adicional */
  className?: string;

  // ==================== APARÊNCIA ====================
  /** Placeholder */
  placeholder?: string;
  /** Descrição/ajuda */
  description?: string;
  /** Ícone */
  icon?: React.ReactNode;

  // ==================== VALIDAÇÃO ====================
  /** Campo obrigatório */
  required?: boolean;
  /** Tamanho mínimo (texto) ou valor mínimo (número) */
  min?: number;
  /** Tamanho máximo (texto) ou valor máximo (número) */
  max?: number;
  /** Padrão regex */
  pattern?: RegExp;
  /** Mensagens de erro customizadas */
  errorMessages?: {
    required?: string;
    min?: string;
    max?: string;
    pattern?: string;
    custom?: string;
  };
  /** Validação customizada */
  validate?: (value: any, formData: T) => string | undefined;

  // ==================== COMPORTAMENTO ====================
  /** Valor padrão */
  defaultValue?: any;
  /** Desabilitado */
  disabled?: boolean | ((formData: T) => boolean);
  /** Oculto */
  hidden?: boolean | ((formData: T) => boolean);
  /** Somente leitura */
  readOnly?: boolean;
  /** Auto focus */
  autoFocus?: boolean;

  // ==================== OPÇÕES (para select, radio, checkbox) ====================
  /** Opções estáticas */
  options?: FieldOption[];
  /** Opções dinâmicas baseadas em formData */
  getOptions?: (formData: T) => FieldOption[];
  /** Opções assíncronas (para combobox) */
  loadOptions?: (query: string) => Promise<FieldOption[]>;

  // ==================== RELAÇÕES ====================
  /** Configuração de relação (para type: 'relation') */
  relation?: {
    /** Entidade relacionada */
    entity: string;
    /** Campo de exibição */
    displayField: string;
    /** Campos de busca */
    searchFields: string[];
    /** Múltipla seleção */
    multiple?: boolean;
    /** Permite criar novo */
    allowCreate?: boolean;
  };

  // ==================== CAMPOS COMPOSTOS ====================
  /** Campos filhos (para type: 'object') */
  fields?: FieldConfig<any>[];
  /** Template de item (para type: 'array') */
  itemTemplate?: FieldConfig<any>[];
  /** Mínimo de itens (para array) */
  minItems?: number;
  /** Máximo de itens (para array) */
  maxItems?: number;

  // ==================== DEPENDÊNCIAS ====================
  /** Campos dos quais este depende */
  dependsOn?: (keyof T | string)[];
  /** Callback quando valor muda */
  onChange?: (value: any, formData: T, setFieldValue: SetFieldValue<T>) => void;
  /** Atualiza valor quando dependência muda */
  computeValue?: (formData: T) => any;

  // ==================== COMPONENTE CUSTOMIZADO ====================
  /** Componente customizado (para type: 'custom') */
  component?: React.ComponentType<CustomFieldProps<T>>;
}

/**
 * Opção para campos de seleção
 */
export interface FieldOption {
  label: string;
  value: string | number | boolean;
  icon?: React.ReactNode;
  description?: string;
  disabled?: boolean;
  group?: string;
}

/**
 * Seção do formulário
 */
export interface FormSection<T = any> {
  id: string;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  /** Campos da seção */
  fields: FieldConfig<T>[];
  /** Colunas do grid (1, 2, 3, 4) */
  columns?: 1 | 2 | 3 | 4;
  /** Colapsável */
  collapsible?: boolean;
  /** Colapsada por padrão */
  defaultCollapsed?: boolean;
  /** Condição para exibir seção */
  showWhen?: (formData: T) => boolean;
}

/**
 * Configuração completa do formulário
 */
export interface EntityFormConfig<T = any> {
  /** Seções do formulário */
  sections: FormSection<T>[];
  /** Colunas padrão */
  defaultColumns?: 1 | 2 | 3 | 4;
  /** Validação global com Zod */
  schema?: ZodSchema<T>;
  /** Layout: steps (wizard) ou default */
  layout?: 'default' | 'steps';
  /** Autosave */
  autoSave?: {
    enabled: boolean;
    debounceMs?: number;
  };
  /** Callbacks */
  onValidationError?: (errors: Record<string, string>) => void;
}

/**
 * Props para campo customizado
 */
export interface CustomFieldProps<T = any> {
  field: FieldConfig<T>;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  formData: T;
  disabled?: boolean;
}

/**
 * Função para setar valor de campo
 */
export type SetFieldValue<T> = (field: keyof T | string, value: any) => void;
```

##### Passo 1.2.4: Criar tipos de viewer

```typescript
// src/core/types/viewer.types.ts

/**
 * Configuração do viewer (visualização de entidade)
 */
export interface EntityViewerConfig<T = any> {
  /** Seções do viewer */
  sections: ViewerSection<T>[];
  /** Mostra timeline de histórico */
  showHistory?: boolean;
  /** Mostra ações inline */
  showActions?: boolean;
}

/**
 * Seção do viewer
 */
export interface ViewerSection<T = any> {
  id: string;
  title?: string;
  type: 'header' | 'info' | 'stats' | 'list' | 'table' | 'custom';
  /** Campos a exibir */
  fields?: (keyof T | ViewerField<T>)[];
  /** Para type: 'stats' */
  stats?: ViewerStat<T>[];
  /** Componente customizado */
  component?: React.ComponentType<{ item: T }>;
  /** Condição para exibir */
  showWhen?: (item: T) => boolean;
}

/**
 * Campo do viewer
 */
export interface ViewerField<T = any> {
  field: keyof T | string;
  label: string;
  type?: 'text' | 'date' | 'currency' | 'boolean' | 'badge' | 'link' | 'image';
  format?: (value: any, item: T) => string | React.ReactNode;
  copyable?: boolean;
}

/**
 * Estatística do viewer
 */
export interface ViewerStat<T = any> {
  field: keyof T | string;
  label: string;
  icon?: React.ReactNode;
  format?: 'number' | 'currency' | 'percent';
  color?: string;
}
```

**✅ Checklist de validação:**
- [ ] Todos os tipos criados em `@core/types/`
- [ ] Exports configurados no index.ts
- [ ] Sem erros de TypeScript
- [ ] Tipos são genéricos e reutilizáveis

---

#### ETAPA 1.3: Core Providers

**⏱️ Tempo estimado**: 4 horas

##### Passo 1.3.1: Criar SelectionContext melhorado

```typescript
// src/core/selection/types/selection.types.ts

export interface SelectionState {
  selectedIds: Set<string>;
  lastSelectedId: string | null;
  selectionMode: 'single' | 'multiple';
}

export interface SelectionContextValue {
  // Estado
  selectedIds: string[];
  selectedCount: number;
  hasSelection: boolean;
  isAllSelected: boolean;
  
  // Ações
  select: (id: string) => void;
  deselect: (id: string) => void;
  toggle: (id: string) => void;
  toggleAll: (ids: string[]) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  selectRange: (startId: string, endId: string, allIds: string[]) => void;
  
  // Verificações
  isSelected: (id: string) => boolean;
  
  // Modo
  selectionMode: 'single' | 'multiple';
  setSelectionMode: (mode: 'single' | 'multiple') => void;
}
```

```typescript
// src/core/selection/hooks/useSelection.ts

import { useState, useCallback, useMemo } from 'react';
import { SelectionContextValue } from '../types/selection.types';

export function useSelection(
  initialMode: 'single' | 'multiple' = 'multiple'
): SelectionContextValue {
  const [selectedSet, setSelectedSet] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(initialMode);
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

  const selectedIds = useMemo(() => Array.from(selectedSet), [selectedSet]);
  const selectedCount = selectedIds.length;
  const hasSelection = selectedCount > 0;

  const select = useCallback((id: string) => {
    setSelectedSet(prev => {
      if (selectionMode === 'single') {
        return new Set([id]);
      }
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setLastSelectedId(id);
  }, [selectionMode]);

  const deselect = useCallback((id: string) => {
    setSelectedSet(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const toggle = useCallback((id: string) => {
    setSelectedSet(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (selectionMode === 'single') {
          next.clear();
        }
        next.add(id);
      }
      return next;
    });
    setLastSelectedId(id);
  }, [selectionMode]);

  const toggleAll = useCallback((ids: string[]) => {
    setSelectedSet(prev => {
      const allSelected = ids.every(id => prev.has(id));
      if (allSelected) {
        return new Set();
      }
      return new Set(ids);
    });
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelectedSet(new Set(ids));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedSet(new Set());
    setLastSelectedId(null);
  }, []);

  const selectRange = useCallback((startId: string, endId: string, allIds: string[]) => {
    const startIndex = allIds.indexOf(startId);
    const endIndex = allIds.indexOf(endId);
    
    if (startIndex === -1 || endIndex === -1) return;
    
    const [from, to] = startIndex < endIndex 
      ? [startIndex, endIndex] 
      : [endIndex, startIndex];
    
    const rangeIds = allIds.slice(from, to + 1);
    
    setSelectedSet(prev => {
      const next = new Set(prev);
      rangeIds.forEach(id => next.add(id));
      return next;
    });
  }, []);

  const isSelected = useCallback((id: string) => selectedSet.has(id), [selectedSet]);

  const isAllSelected = useCallback(
    (ids: string[]) => ids.length > 0 && ids.every(id => selectedSet.has(id)),
    [selectedSet]
  );

  return {
    selectedIds,
    selectedCount,
    hasSelection,
    isAllSelected: false, // Será computado pelo componente
    select,
    deselect,
    toggle,
    toggleAll,
    selectAll,
    clearSelection,
    selectRange,
    isSelected,
    selectionMode,
    setSelectionMode,
  };
}
```

```typescript
// src/core/selection/components/SelectionProvider.tsx

import React, { createContext, useContext } from 'react';
import { useSelection } from '../hooks/useSelection';
import { SelectionContextValue } from '../types/selection.types';

const SelectionContext = createContext<SelectionContextValue | null>(null);

export function SelectionProvider({ 
  children,
  mode = 'multiple',
}: { 
  children: React.ReactNode;
  mode?: 'single' | 'multiple';
}) {
  const selection = useSelection(mode);
  
  return (
    <SelectionContext.Provider value={selection}>
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelectionContext() {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error('useSelectionContext must be used within SelectionProvider');
  }
  return context;
}

// Hook opcional que não lança erro se não estiver em provider
export function useOptionalSelection() {
  return useContext(SelectionContext);
}
```

##### Passo 1.3.2: Criar CoreProvider combinado

```typescript
// src/core/providers/CoreProvider.tsx

import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { SelectionProvider } from '@core/selection';
import { ModalProvider } from '@services/modals';
import { ToastProvider } from '@/components/ui/toast';
import { ThemeProvider } from '@/components/theme-provider';

interface CoreProviderProps {
  children: React.ReactNode;
}

/**
 * Provider principal que combina todos os providers do sistema
 * Deve ser usado no layout raiz da aplicação
 */
export function CoreProvider({ children }: CoreProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <ModalProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ModalProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

/**
 * Provider para páginas que precisam de seleção
 * Use em páginas de listagem com seleção múltipla
 */
export function PageProvider({ 
  children,
  selectionMode = 'multiple',
}: { 
  children: React.ReactNode;
  selectionMode?: 'single' | 'multiple';
}) {
  return (
    <SelectionProvider mode={selectionMode}>
      {children}
    </SelectionProvider>
  );
}
```

**✅ Checklist de validação:**
- [ ] SelectionProvider funcionando
- [ ] CoreProvider combina todos os providers
- [ ] Hooks de seleção testados
- [ ] Sem memory leaks

---

#### ETAPA 1.4: UniversalCard Component

**⏱️ Tempo estimado**: 6 horas

##### Passo 1.4.1: Criar tipos do UniversalCard

```typescript
// src/core/components/universal-card/types.ts

import { LucideIcon } from 'lucide-react';
import { BaseEntity } from '@core/types';

export type CardLayout = 'grid' | 'list';

export interface UniversalCardProps<T extends BaseEntity> {
  // Dados
  item: T;
  
  // Layout
  layout: CardLayout;
  
  // Display config (vem do EntityConfig)
  display: {
    titleField: keyof T;
    subtitleField?: keyof T;
    descriptionField?: keyof T;
    colorField?: keyof T;
    badgeField?: keyof T;
    imageField?: keyof T;
    getIcon?: (item: T) => React.ReactNode;
  };
  
  // Estado
  isSelected?: boolean;
  isDisabled?: boolean;
  
  // Handlers
  onClick?: (item: T, event: React.MouseEvent) => void;
  onDoubleClick?: (item: T) => void;
  onContextMenu?: (item: T, event: React.MouseEvent) => void;
  onSelect?: (item: T) => void;
  
  // Métricas opcionais
  metrics?: {
    field: keyof T | string;
    label: string;
    icon?: LucideIcon;
    format?: 'number' | 'currency' | 'percent';
  }[];
  
  // Badges opcionais
  badges?: {
    field: keyof T;
    variants: Record<string, { label: string; variant: string }>;
  }[];
  
  // Customização
  className?: string;
  showCheckbox?: boolean;
  showContextMenu?: boolean;
}
```

##### Passo 1.4.2: Implementar UniversalCard

```typescript
// src/core/components/universal-card/UniversalCard.tsx

import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { BaseEntity } from '@core/types';
import { UniversalCardProps } from './types';
import { formatValue } from '@core/utils/format';

export function UniversalCard<T extends BaseEntity>({
  item,
  layout,
  display,
  isSelected = false,
  isDisabled = false,
  onClick,
  onDoubleClick,
  onContextMenu,
  onSelect,
  metrics = [],
  badges = [],
  className,
  showCheckbox = true,
  showContextMenu = true,
}: UniversalCardProps<T>) {
  // Extrai valores de display
  const title = String(item[display.titleField] || '');
  const subtitle = display.subtitleField 
    ? String(item[display.subtitleField] || '') 
    : undefined;
  const description = display.descriptionField 
    ? String(item[display.descriptionField] || '') 
    : undefined;
  const color = display.colorField 
    ? String(item[display.colorField] || '') 
    : undefined;
  const imageUrl = display.imageField 
    ? String(item[display.imageField] || '') 
    : undefined;
  const icon = display.getIcon?.(item);

  // Handlers
  const handleClick = (e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      onSelect?.(item);
    } else {
      onClick?.(item, e);
    }
  };

  const handleDoubleClick = () => {
    onDoubleClick?.(item);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onContextMenu?.(item, e);
  };

  const handleCheckboxChange = (checked: boolean) => {
    onSelect?.(item);
  };

  // Layout Grid
  if (layout === 'grid') {
    return (
      <Card
        className={cn(
          'group cursor-pointer transition-all duration-200',
          'hover:shadow-md hover:border-primary/30',
          isSelected && 'ring-2 ring-primary border-primary',
          isDisabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={showContextMenu ? handleContextMenu : undefined}
      >
        <CardContent className="p-4">
          {/* Header com checkbox e ícone */}
          <div className="flex items-start gap-3">
            {showCheckbox && (
              <div 
                className={cn(
                  'opacity-0 group-hover:opacity-100 transition-opacity',
                  isSelected && 'opacity-100'
                )}
                onClick={(e) => e.stopPropagation()}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={handleCheckboxChange}
                />
              </div>
            )}
            
            {/* Ícone ou Imagem */}
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: color ? `${color}20` : 'var(--muted)' }}
            >
              {imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt={title}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : icon ? (
                <span style={{ color: color || 'var(--foreground)' }}>
                  {icon}
                </span>
              ) : (
                <span 
                  className="text-sm font-bold"
                  style={{ color: color || 'var(--foreground)' }}
                >
                  {title.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            
            {/* Conteúdo */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm truncate">{title}</h3>
              {subtitle && (
                <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
              )}
            </div>
          </div>
          
          {/* Descrição */}
          {description && (
            <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
              {description}
            </p>
          )}
          
          {/* Badges */}
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {badges.map((badgeConfig, idx) => {
                const value = item[badgeConfig.field];
                const variant = badgeConfig.variants[String(value)];
                if (!variant) return null;
                return (
                  <Badge key={idx} variant={variant.variant as any}>
                    {variant.label}
                  </Badge>
                );
              })}
            </div>
          )}
          
          {/* Métricas */}
          {metrics.length > 0 && (
            <div className="flex items-center gap-4 mt-3 pt-3 border-t">
              {metrics.map((metric, idx) => {
                const value = getNestedValue(item, String(metric.field));
                const Icon = metric.icon;
                return (
                  <div key={idx} className="flex items-center gap-1 text-xs text-muted-foreground">
                    {Icon && <Icon className="h-3 w-3" />}
                    <span>{formatValue(value, metric.format)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Layout List
  return (
    <div
      className={cn(
        'group flex items-center gap-4 p-3 rounded-lg cursor-pointer',
        'hover:bg-muted/50 transition-colors',
        isSelected && 'bg-primary/5 ring-1 ring-primary/30',
        isDisabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={showContextMenu ? handleContextMenu : undefined}
    >
      {/* Checkbox */}
      {showCheckbox && (
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={isSelected}
            onCheckedChange={handleCheckboxChange}
          />
        </div>
      )}
      
      {/* Ícone */}
      <div 
        className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
        style={{ backgroundColor: color ? `${color}20` : 'var(--muted)' }}
      >
        {icon || (
          <span 
            className="text-xs font-bold"
            style={{ color: color || 'var(--foreground)' }}
          >
            {title.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      
      {/* Conteúdo */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-sm truncate">{title}</h3>
          {badges.map((badgeConfig, idx) => {
            const value = item[badgeConfig.field];
            const variant = badgeConfig.variants[String(value)];
            if (!variant) return null;
            return (
              <Badge key={idx} variant={variant.variant as any} className="text-xs">
                {variant.label}
              </Badge>
            );
          })}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
        )}
      </div>
      
      {/* Métricas (à direita no modo lista) */}
      {metrics.length > 0 && (
        <div className="flex items-center gap-6">
          {metrics.map((metric, idx) => {
            const value = getNestedValue(item, String(metric.field));
            const Icon = metric.icon;
            return (
              <div key={idx} className="flex items-center gap-1 text-sm">
                {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                <span className="font-medium">{formatValue(value, metric.format)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Helper para acessar valores aninhados
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}
```

##### Passo 1.4.3: Criar EntityGrid que usa UniversalCard

```typescript
// src/core/components/entity-grid/EntityGrid.tsx

import React from 'react';
import { cn } from '@/lib/utils';
import { BaseEntity, EntityGridConfig, EntityDisplayConfig } from '@core/types';
import { UniversalCard } from '../universal-card';
import { useSelectionContext } from '@core/selection';
import { EmptyState } from '@/components/shared/empty-state';
import { Skeleton } from '@/components/ui/skeleton';

interface EntityGridProps<T extends BaseEntity> {
  items: T[];
  config: EntityGridConfig<T>;
  display: EntityDisplayConfig<T>;
  
  // Estado
  isLoading?: boolean;
  
  // Handlers
  onItemClick?: (item: T, event: React.MouseEvent) => void;
  onItemDoubleClick?: (item: T) => void;
  onContextMenu?: (item: T, event: React.MouseEvent) => void;
  
  // Customização
  className?: string;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
}

export function EntityGrid<T extends BaseEntity>({
  items,
  config,
  display,
  isLoading = false,
  onItemClick,
  onItemDoubleClick,
  onContextMenu,
  className,
  emptyMessage = 'Nenhum item encontrado',
  emptyIcon,
}: EntityGridProps<T>) {
  const selection = useSelectionContext();
  const [view, setView] = React.useState(config.defaultView);
  
  // Loading skeleton
  if (isLoading) {
    return (
      <div className={cn(
        'grid gap-4',
        view === 'grid' && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        view === 'list' && 'grid-cols-1',
        className
      )}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className={cn(
            view === 'grid' ? 'h-40' : 'h-16'
          )} />
        ))}
      </div>
    );
  }
  
  // Empty state
  if (items.length === 0) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyMessage}
        description="Tente ajustar seus filtros ou criar um novo item."
      />
    );
  }
  
  return (
    <div className={cn(
      'grid gap-4',
      view === 'grid' && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
      view === 'list' && 'grid-cols-1',
      className
    )}>
      {items.map((item) => (
        <UniversalCard
          key={item.id}
          item={item}
          layout={view === 'table' ? 'list' : view}
          display={display}
          isSelected={selection.isSelected(item.id)}
          onClick={onItemClick}
          onDoubleClick={onItemDoubleClick}
          onContextMenu={onContextMenu}
          onSelect={() => selection.toggle(item.id)}
          metrics={config.card?.metrics}
          showCheckbox={config.selectable}
        />
      ))}
    </div>
  );
}
```

**✅ Checklist de validação:**
- [ ] UniversalCard renderiza em modo grid
- [ ] UniversalCard renderiza em modo list
- [ ] Seleção funciona (single e multi)
- [ ] Ctrl+Click seleciona
- [ ] Double-click abre
- [ ] Context menu funciona
- [ ] Responsivo em mobile

---

#### 📋 Entregáveis do Sprint 1

Ao final do Sprint 1, você deve ter:

```
src/
├── core/
│   ├── types/
│   │   ├── base.types.ts           ✅
│   │   ├── entity-config.types.ts  ✅
│   │   ├── viewer.types.ts         ✅
│   │   └── index.ts                ✅
│   ├── forms/
│   │   └── types/
│   │       ├── form.types.ts       ✅
│   │       └── index.ts            ✅
│   ├── selection/
│   │   ├── types/
│   │   │   └── selection.types.ts  ✅
│   │   ├── hooks/
│   │   │   └── useSelection.ts     ✅
│   │   ├── components/
│   │   │   └── SelectionProvider.tsx ✅
│   │   └── index.ts                ✅
│   ├── components/
│   │   ├── universal-card/
│   │   │   ├── types.ts            ✅
│   │   │   ├── UniversalCard.tsx   ✅
│   │   │   └── index.ts            ✅
│   │   └── entity-grid/
│   │       ├── EntityGrid.tsx      ✅
│   │       └── index.ts            ✅
│   ├── providers/
│   │   ├── CoreProvider.tsx        ✅
│   │   └── index.ts                ✅
│   └── index.ts                    ✅
├── services/
│   └── index.ts                    ✅
└── security/
    └── index.ts                    ✅
```

**Teste de validação final do Sprint 1:**

```typescript
// Crie um arquivo de teste para validar
// src/core/__tests__/sprint1.test.tsx

import { render, screen } from '@testing-library/react';
import { SelectionProvider, useSelectionContext } from '@core/selection';
import { UniversalCard } from '@core/components/universal-card';
import { EntityGrid } from '@core/components/entity-grid';

// Se todos imports funcionam sem erro, Sprint 1 está completo!
console.log('✅ Sprint 1 - Fundação completa!');
```

---

### 📝 SPRINT 2: CRUD & FORMS (Semana 3-4)

> **Objetivo**: Criar sistema completo de formulários e páginas CRUD reutilizáveis.

#### ETAPA 2.1: Sistema de Formulários

**⏱️ Tempo estimado**: 16 horas

##### Passo 2.1.1: Criar campos de formulário base

```typescript
// src/core/forms/fields/TextField.tsx

import { forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { FieldConfig } from '../types/form.types';

interface TextFieldProps {
  field: FieldConfig;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ field, value, onChange, error, disabled }, ref) => {
    return (
      <div className="space-y-2">
        <Label htmlFor={String(field.name)} className={cn(field.required && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
          {field.label}
        </Label>
        <Input
          ref={ref}
          id={String(field.name)}
          type={field.type === 'email' ? 'email' : field.type === 'password' ? 'password' : 'text'}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          disabled={disabled || (typeof field.disabled === 'function' ? false : field.disabled)}
          className={cn(error && 'border-red-500')}
        />
        {field.description && !error && (
          <p className="text-xs text-muted-foreground">{field.description}</p>
        )}
        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}
      </div>
    );
  }
);
```

```typescript
// src/core/forms/fields/SelectField.tsx

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FieldConfig, FieldOption } from '../types/form.types';
import { cn } from '@/lib/utils';

interface SelectFieldProps {
  field: FieldConfig;
  value: string | number;
  onChange: (value: string | number) => void;
  error?: string;
  disabled?: boolean;
  options?: FieldOption[];
}

export function SelectField({
  field,
  value,
  onChange,
  error,
  disabled,
  options: externalOptions,
}: SelectFieldProps) {
  const options = externalOptions || field.options || [];

  return (
    <div className="space-y-2">
      <Label className={cn(field.required && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
        {field.label}
      </Label>
      <Select
        value={String(value || '')}
        onValueChange={(v) => onChange(v)}
        disabled={disabled}
      >
        <SelectTrigger className={cn(error && 'border-red-500')}>
          <SelectValue placeholder={field.placeholder || 'Selecione...'} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={String(option.value)}
              value={String(option.value)}
              disabled={option.disabled}
            >
              <div className="flex items-center gap-2">
                {option.icon}
                <span>{option.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
```

```typescript
// src/core/forms/fields/index.ts
// Criar todos os campos necessários:

export { TextField } from './TextField';
export { TextareaField } from './TextareaField';
export { NumberField } from './NumberField';
export { CurrencyField } from './CurrencyField';
export { SelectField } from './SelectField';
export { MultiSelectField } from './MultiSelectField';
export { ComboboxField } from './ComboboxField';
export { CheckboxField } from './CheckboxField';
export { SwitchField } from './SwitchField';
export { RadioField } from './RadioField';
export { DateField } from './DateField';
export { DateTimeField } from './DateTimeField';
export { DateRangeField } from './DateRangeField';
export { ColorField } from './ColorField';
export { FileField } from './FileField';
export { ImageField } from './ImageField';
export { RichTextField } from './RichTextField';
export { ArrayField } from './ArrayField';
export { ObjectField } from './ObjectField';
export { RelationField } from './RelationField';
```

##### Passo 2.1.2: Criar DynamicField (renderiza campo baseado no tipo)

```typescript
// src/core/forms/components/DynamicField.tsx

import React from 'react';
import { FieldConfig, FieldType } from '../types/form.types';
import * as Fields from '../fields';

interface DynamicFieldProps<T = any> {
  field: FieldConfig<T>;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  disabled?: boolean;
  formData: T;
}

const fieldComponents: Record<FieldType, React.ComponentType<any>> = {
  text: Fields.TextField,
  textarea: Fields.TextareaField,
  number: Fields.NumberField,
  currency: Fields.CurrencyField,
  email: Fields.TextField,
  phone: Fields.TextField,
  password: Fields.TextField,
  url: Fields.TextField,
  select: Fields.SelectField,
  'multi-select': Fields.MultiSelectField,
  combobox: Fields.ComboboxField,
  checkbox: Fields.CheckboxField,
  radio: Fields.RadioField,
  switch: Fields.SwitchField,
  date: Fields.DateField,
  datetime: Fields.DateTimeField,
  time: Fields.DateTimeField,
  daterange: Fields.DateRangeField,
  percent: Fields.NumberField,
  color: Fields.ColorField,
  file: Fields.FileField,
  image: Fields.ImageField,
  'rich-text': Fields.RichTextField,
  code: Fields.TextareaField,
  json: Fields.TextareaField,
  markdown: Fields.TextareaField,
  array: Fields.ArrayField,
  object: Fields.ObjectField,
  relation: Fields.RelationField,
  custom: () => null,
};

export function DynamicField<T = any>({
  field,
  value,
  onChange,
  error,
  disabled,
  formData,
}: DynamicFieldProps<T>) {
  // Verifica se campo está oculto
  const isHidden = typeof field.hidden === 'function'
    ? field.hidden(formData)
    : field.hidden;

  if (isHidden) return null;

  // Verifica se está desabilitado
  const isDisabled = disabled || (
    typeof field.disabled === 'function'
      ? field.disabled(formData)
      : field.disabled
  );

  // Obtém opções dinâmicas se necessário
  const options = field.getOptions
    ? field.getOptions(formData)
    : field.options;

  // Componente customizado
  if (field.type === 'custom' && field.component) {
    const CustomComponent = field.component;
    return (
      <CustomComponent
        field={field}
        value={value}
        onChange={onChange}
        error={error}
        formData={formData}
        disabled={isDisabled}
      />
    );
  }

  // Componente padrão
  const FieldComponent = fieldComponents[field.type];
  if (!FieldComponent) {
    console.warn(`Unknown field type: ${field.type}`);
    return null;
  }

  return (
    <FieldComponent
      field={field}
      value={value}
      onChange={onChange}
      error={error}
      disabled={isDisabled}
      formData={formData}
      options={options}
    />
  );
}
```

##### Passo 2.1.3: Criar EntityForm principal

```typescript
// src/core/forms/components/EntityForm.tsx

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Loader2, Save, X } from 'lucide-react';
import { EntityFormConfig, FormSection, FieldConfig } from '../types/form.types';
import { DynamicField } from './DynamicField';

interface EntityFormProps<T = any> {
  config: EntityFormConfig<T>;
  initialData?: Partial<T>;
  mode: 'create' | 'edit' | 'view';
  onSubmit: (data: T) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
}

export function EntityForm<T extends Record<string, any>>({
  config,
  initialData = {},
  mode,
  onSubmit,
  onCancel,
  isLoading = false,
  className,
}: EntityFormProps<T>) {
  const isViewMode = mode === 'view';
  
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<T>({
    defaultValues: initialData as any,
    resolver: config.schema ? zodResolver(config.schema) : undefined,
  });

  const formData = watch();

  const onFormSubmit = async (data: T) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submit error:', error);
    }
  };

  // Renderiza uma seção do formulário
  const renderSection = (section: FormSection<T>, index: number) => {
    // Verifica condição de exibição
    if (section.showWhen && !section.showWhen(formData)) {
      return null;
    }

    const sectionContent = (
      <div
        className={cn(
          'grid gap-4',
          section.columns === 1 && 'grid-cols-1',
          section.columns === 2 && 'grid-cols-1 md:grid-cols-2',
          section.columns === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
          section.columns === 4 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
          !section.columns && config.defaultColumns === 2 && 'grid-cols-1 md:grid-cols-2',
        )}
      >
        {section.fields.map((field) => renderField(field))}
      </div>
    );

    // Seção colapsável
    if (section.collapsible) {
      return (
        <Collapsible
          key={section.id}
          defaultOpen={!section.defaultCollapsed}
          className="border rounded-lg"
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50">
            <div className="flex items-center gap-2">
              {section.icon}
              <span className="font-medium">{section.title}</span>
            </div>
            <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-4 pt-0">
              {section.description && (
                <p className="text-sm text-muted-foreground mb-4">
                  {section.description}
                </p>
              )}
              {sectionContent}
            </div>
          </CollapsibleContent>
        </Collapsible>
      );
    }

    // Seção normal
    if (section.title) {
      return (
        <Card key={section.id}>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              {section.icon}
              {section.title}
            </CardTitle>
            {section.description && (
              <p className="text-sm text-muted-foreground">
                {section.description}
              </p>
            )}
          </CardHeader>
          <CardContent>{sectionContent}</CardContent>
        </Card>
      );
    }

    // Seção sem título
    return (
      <div key={section.id} className="space-y-4">
        {sectionContent}
      </div>
    );
  };

  // Renderiza um campo
  const renderField = (field: FieldConfig<T>) => {
    const colSpanClass = {
      1: 'col-span-1',
      2: 'col-span-1 md:col-span-2',
      3: 'col-span-1 md:col-span-2 lg:col-span-3',
      4: 'col-span-1 md:col-span-2 lg:col-span-4',
      6: 'col-span-1 md:col-span-3 lg:col-span-6',
      12: 'col-span-full',
    };

    return (
      <div
        key={String(field.name)}
        className={cn(
          field.colSpan ? colSpanClass[field.colSpan] : 'col-span-1',
          field.className
        )}
      >
        <Controller
          name={field.name as any}
          control={control}
          render={({ field: controllerField }) => (
            <DynamicField
              field={field}
              value={controllerField.value}
              onChange={(value) => {
                controllerField.onChange(value);
                // Callback onChange do campo
                if (field.onChange) {
                  field.onChange(value, formData, setValue as any);
                }
              }}
              error={errors[field.name as string]?.message as string}
              disabled={isViewMode}
              formData={formData}
            />
          )}
        />
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className={cn('space-y-6', className)}>
      {/* Seções */}
      {config.sections.map((section, index) => renderSection(section, index))}

      {/* Botões de ação */}
      {!isViewMode && (
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting || isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting || isLoading || (!isDirty && mode === 'edit')}
          >
            {(isSubmitting || isLoading) ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {mode === 'create' ? 'Criar' : 'Salvar'}
          </Button>
        </div>
      )}
    </form>
  );
}
```

##### Passo 2.1.4: Criar hook useEntityForm

```typescript
// src/core/forms/hooks/useEntityForm.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { BaseEntity, EntityConfig } from '@core/types';
import api from '@/lib/api-client';

interface UseEntityFormOptions<T extends BaseEntity> {
  config: EntityConfig<T>;
  mode: 'create' | 'edit';
  id?: string;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useEntityForm<T extends BaseEntity>({
  config,
  mode,
  id,
  onSuccess,
  onError,
}: UseEntityFormOptions<T>) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mutation para criar
  const createMutation = useMutation({
    mutationFn: async (data: Partial<T>) => {
      // Hook beforeCreate
      let processedData = data;
      if (config.hooks?.beforeCreate) {
        processedData = await config.hooks.beforeCreate(data);
      }
      
      const response = await api.post<T>(config.api.baseUrl, processedData);
      return response;
    },
    onSuccess: async (data) => {
      // Invalida cache da lista
      queryClient.invalidateQueries({ queryKey: [config.api.queryKey] });
      
      // Hook afterCreate
      if (config.hooks?.afterCreate) {
        await config.hooks.afterCreate(data);
      }
      
      toast.success(`${config.name} criado com sucesso!`);
      onSuccess?.(data);
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar ${config.name.toLowerCase()}`);
      onError?.(error);
    },
  });

  // Mutation para atualizar
  const updateMutation = useMutation({
    mutationFn: async (data: Partial<T>) => {
      if (!id) throw new Error('ID is required for update');
      
      // Hook beforeUpdate
      let processedData = data;
      if (config.hooks?.beforeUpdate) {
        processedData = await config.hooks.beforeUpdate(id, data);
      }
      
      const response = await api.put<T>(`${config.api.baseUrl}/${id}`, processedData);
      return response;
    },
    onSuccess: async (data) => {
      // Invalida cache
      queryClient.invalidateQueries({ queryKey: [config.api.queryKey] });
      queryClient.invalidateQueries({ queryKey: [config.api.queryKey, id] });
      
      // Hook afterUpdate
      if (config.hooks?.afterUpdate) {
        await config.hooks.afterUpdate(data);
      }
      
      toast.success(`${config.name} atualizado com sucesso!`);
      onSuccess?.(data);
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar ${config.name.toLowerCase()}`);
      onError?.(error);
    },
  });

  const submit = useCallback(async (data: Partial<T>) => {
    setIsSubmitting(true);
    try {
      if (mode === 'create') {
        await createMutation.mutateAsync(data);
      } else {
        await updateMutation.mutateAsync(data);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [mode, createMutation, updateMutation]);

  return {
    submit,
    isSubmitting: isSubmitting || createMutation.isPending || updateMutation.isPending,
    error: createMutation.error || updateMutation.error,
  };
}
```

---

#### ETAPA 2.2: Sistema CRUD

**⏱️ Tempo estimado**: 16 horas

##### Passo 2.2.1: Criar hook useCrud

```typescript
// src/core/crud/hooks/useCrud.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { BaseEntity, EntityConfig, QueryParams, PaginatedResponse } from '@core/types';
import { useSelectionContext } from '@core/selection';
import api from '@/lib/api-client';

export function useCrud<T extends BaseEntity>(config: EntityConfig<T>) {
  const queryClient = useQueryClient();
  const selection = useSelectionContext();
  
  // Estado local
  const [queryParams, setQueryParams] = useState<QueryParams>({
    page: 1,
    pageSize: config.grid?.pageSize || 20,
    search: '',
    sortBy: undefined,
    sortOrder: 'asc',
    filters: {},
  });

  // ==================== QUERIES ====================

  // Lista paginada
  const listQuery = useQuery({
    queryKey: [config.api.queryKey, 'list', queryParams],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<T>>(config.api.baseUrl, {
        params: queryParams,
      });
      return response;
    },
  });

  // Item único (quando necessário)
  const getItem = useCallback(async (id: string) => {
    return await api.get<T>(`${config.api.baseUrl}/${id}`);
  }, [config.api.baseUrl]);

  // ==================== MUTATIONS ====================

  // Criar
  const createMutation = useMutation({
    mutationFn: async (data: Partial<T>) => {
      let processedData = data;
      if (config.hooks?.beforeCreate) {
        processedData = await config.hooks.beforeCreate(data);
      }
      return await api.post<T>(config.api.baseUrl, processedData);
    },
    onSuccess: async (item) => {
      queryClient.invalidateQueries({ queryKey: [config.api.queryKey] });
      if (config.hooks?.afterCreate) await config.hooks.afterCreate(item);
      toast.success(`${config.name} criado com sucesso!`);
    },
    onError: () => toast.error(`Erro ao criar ${config.name.toLowerCase()}`),
  });

  // Atualizar
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<T> }) => {
      let processedData = data;
      if (config.hooks?.beforeUpdate) {
        processedData = await config.hooks.beforeUpdate(id, data);
      }
      return await api.put<T>(`${config.api.baseUrl}/${id}`, processedData);
    },
    onSuccess: async (item) => {
      queryClient.invalidateQueries({ queryKey: [config.api.queryKey] });
      if (config.hooks?.afterUpdate) await config.hooks.afterUpdate(item);
      toast.success(`${config.name} atualizado com sucesso!`);
    },
    onError: () => toast.error(`Erro ao atualizar ${config.name.toLowerCase()}`),
  });

  // Deletar
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (config.hooks?.beforeDelete) {
        const canDelete = await config.hooks.beforeDelete(id);
        if (!canDelete) throw new Error('Delete cancelled by hook');
      }
      await api.delete(`${config.api.baseUrl}/${id}`);
      return id;
    },
    onSuccess: async (id) => {
      queryClient.invalidateQueries({ queryKey: [config.api.queryKey] });
      if (config.hooks?.afterDelete) await config.hooks.afterDelete(id);
      toast.success(`${config.name} excluído com sucesso!`);
    },
    onError: () => toast.error(`Erro ao excluir ${config.name.toLowerCase()}`),
  });

  // Duplicar
  const duplicateMutation = useMutation({
    mutationFn: async (id: string) => {
      const endpoint = config.api.endpoints?.duplicate || `${config.api.baseUrl}/${id}/duplicate`;
      return await api.post<T>(endpoint);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [config.api.queryKey] });
      toast.success(`${config.name} duplicado com sucesso!`);
    },
    onError: () => toast.error(`Erro ao duplicar ${config.name.toLowerCase()}`),
  });

  // ==================== BATCH OPERATIONS ====================

  const batchDelete = useMutation({
    mutationFn: async (ids: string[]) => {
      const endpoint = config.api.endpoints?.bulkDelete || `${config.api.baseUrl}/bulk`;
      return await api.delete(endpoint, { data: { ids } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [config.api.queryKey] });
      selection.clearSelection();
      toast.success(`${selection.selectedCount} itens excluídos!`);
    },
  });

  const batchUpdate = useMutation({
    mutationFn: async ({ ids, data }: { ids: string[]; data: Partial<T> }) => {
      const endpoint = config.api.endpoints?.bulkUpdate || `${config.api.baseUrl}/bulk`;
      return await api.patch(endpoint, { ids, data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [config.api.queryKey] });
      selection.clearSelection();
      toast.success(`${selection.selectedCount} itens atualizados!`);
    },
  });

  // ==================== HANDLERS ====================

  const setSearch = useCallback((search: string) => {
    setQueryParams(prev => ({ ...prev, search, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setQueryParams(prev => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    setQueryParams(prev => ({ ...prev, pageSize, page: 1 }));
  }, []);

  const setSort = useCallback((sortBy: string, sortOrder: 'asc' | 'desc') => {
    setQueryParams(prev => ({ ...prev, sortBy, sortOrder }));
  }, []);

  const setFilters = useCallback((filters: Record<string, any>) => {
    setQueryParams(prev => ({ ...prev, filters, page: 1 }));
  }, []);

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [config.api.queryKey] });
  }, [queryClient, config.api.queryKey]);

  return {
    // Dados
    items: listQuery.data?.data || [],
    meta: listQuery.data?.meta,
    isLoading: listQuery.isLoading,
    error: listQuery.error,

    // Parâmetros
    queryParams,
    setSearch,
    setPage,
    setPageSize,
    setSort,
    setFilters,

    // CRUD individual
    getItem,
    create: createMutation.mutateAsync,
    update: (id: string, data: Partial<T>) => updateMutation.mutateAsync({ id, data }),
    delete: deleteMutation.mutateAsync,
    duplicate: duplicateMutation.mutateAsync,

    // Batch
    batchDelete: batchDelete.mutateAsync,
    batchUpdate: (ids: string[], data: Partial<T>) => batchUpdate.mutateAsync({ ids, data }),

    // Estados de mutação
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,

    // Selection
    selection,

    // Utilitários
    refresh,
  };
}
```

##### Passo 2.2.2: Criar SimpleCrudPage

```typescript
// src/core/crud/pages/SimpleCrudPage.tsx

import React, { useState } from 'react';
import { BaseEntity, EntityConfig } from '@core/types';
import { useCrud } from '../hooks/useCrud';
import { useModals } from '@services/modals';
import { SelectionProvider } from '@core/selection';
import { EntityGrid } from '@core/components/entity-grid';
import { SelectionToolbar } from '@core/selection/components/SelectionToolbar';
import { PageHeader } from '@/components/shared/page-header';
import { SearchSection } from '@/components/shared/search/SearchSection';
import { EntityFormModal } from '../components/EntityFormModal';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { BatchProgressDialog } from '@/components/shared/progress/batch-progress-dialog';
import { Plus } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/protected-route';

interface SimpleCrudPageProps<T extends BaseEntity> {
  config: EntityConfig<T>;
}

function SimpleCrudPageContent<T extends BaseEntity>({
  config,
}: SimpleCrudPageProps<T>) {
  const crud = useCrud(config);
  const modals = useModals();
  
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [viewingItem, setViewingItem] = useState<T | null>(null);
  const [itemsToDelete, setItemsToDelete] = useState<string[]>([]);

  // Handlers
  const handleCreate = () => {
    setEditingItem(null);
    modals.open('form');
  };

  const handleEdit = async (id: string) => {
    const item = await crud.getItem(id);
    setEditingItem(item);
    modals.open('form');
  };

  const handleView = async (id: string) => {
    const item = await crud.getItem(id);
    setViewingItem(item);
    modals.open('viewer');
  };

  const handleDelete = (ids: string[]) => {
    setItemsToDelete(ids);
    modals.open('confirmDelete');
  };

  const handleConfirmDelete = async () => {
    if (itemsToDelete.length === 1) {
      await crud.delete(itemsToDelete[0]);
    } else {
      await crud.batchDelete(itemsToDelete);
    }
    setItemsToDelete([]);
    modals.close('confirmDelete');
  };

  const handleFormSuccess = () => {
    modals.close('form');
    setEditingItem(null);
    crud.refresh();
  };

  return (
    <div className="flex flex-col gap-4 p-6">
      {/* Header */}
      <PageHeader
        title={config.namePlural}
        description={config.description}
        actions={[
          {
            label: `Novo ${config.name}`,
            icon: Plus,
            onClick: handleCreate,
            permission: config.permissions.create,
          },
        ]}
      />

      {/* Busca e Filtros */}
      <SearchSection
        placeholder={`Buscar ${config.namePlural.toLowerCase()}...`}
        onSearch={crud.setSearch}
        value={crud.queryParams.search}
      />

      {/* Grid */}
      <EntityGrid
        items={crud.items}
        config={config.grid}
        display={config.display}
        isLoading={crud.isLoading}
        onItemClick={(item) => handleView(item.id)}
        onItemDoubleClick={(item) => handleEdit(item.id)}
        onContextMenu={(item, e) => {
          // Context menu será implementado
        }}
        emptyMessage={`Nenhum ${config.name.toLowerCase()} encontrado`}
      />

      {/* Toolbar de Seleção */}
      <SelectionToolbar
        selectedIds={crud.selection.selectedIds}
        totalItems={crud.items.length}
        actions={[
          {
            id: 'edit',
            label: 'Editar',
            icon: 'Pencil',
            maxSelection: 1,
            permission: config.permissions.update,
            onClick: (ids) => handleEdit(ids[0]),
          },
          {
            id: 'delete',
            label: 'Excluir',
            icon: 'Trash2',
            permission: config.permissions.delete,
            variant: 'destructive',
            onClick: handleDelete,
          },
        ]}
        onSelectAll={() => crud.selection.selectAll(crud.items.map(i => i.id))}
        onClearSelection={crud.selection.clearSelection}
      />

      {/* Modal de Formulário */}
      <EntityFormModal
        config={config}
        isOpen={modals.isOpen('form')}
        onClose={() => modals.close('form')}
        item={editingItem}
        mode={editingItem ? 'edit' : 'create'}
        onSuccess={handleFormSuccess}
      />

      {/* Dialog de Confirmação de Exclusão */}
      <ConfirmDialog
        open={modals.isOpen('confirmDelete')}
        onOpenChange={(open) => !open && modals.close('confirmDelete')}
        title="Confirmar Exclusão"
        description={
          itemsToDelete.length === 1
            ? `Deseja realmente excluir este ${config.name.toLowerCase()}?`
            : `Deseja realmente excluir ${itemsToDelete.length} ${config.namePlural.toLowerCase()}?`
        }
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={handleConfirmDelete}
        isLoading={crud.isDeleting}
      />
    </div>
  );
}

// Wrapper com providers
export function SimpleCrudPage<T extends BaseEntity>(props: SimpleCrudPageProps<T>) {
  return (
    <ProtectedRoute requiredRoles={['ADMIN', 'MANAGER']}>
      <SelectionProvider>
        <SimpleCrudPageContent {...props} />
      </SelectionProvider>
    </ProtectedRoute>
  );
}
```

##### Passo 2.2.3: Criar ChainedEntityPage

```typescript
// src/core/crud/pages/ChainedEntityPage.tsx

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { BaseEntity, EntityConfig, HierarchicalEntity } from '@core/types';
import { useCrud } from '../hooks/useCrud';
import { useQuery } from '@tanstack/react-query';
import { SelectionProvider } from '@core/selection';
import { EntityGrid } from '@core/components/entity-grid';
import { PageHeader } from '@/components/shared/page-header';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import api from '@/lib/api-client';

interface ChainedEntityPageProps<T extends BaseEntity & HierarchicalEntity> {
  config: EntityConfig<T>;
  parentId?: string;
}

export function ChainedEntityPage<T extends BaseEntity & HierarchicalEntity>({
  config,
  parentId,
}: ChainedEntityPageProps<T>) {
  // Query para buscar ancestrais (breadcrumb)
  const ancestorsQuery = useQuery({
    queryKey: [config.api.queryKey, 'ancestors', parentId],
    queryFn: async () => {
      if (!parentId) return [];
      const response = await api.get<T[]>(`${config.api.baseUrl}/${parentId}/ancestors`);
      return response;
    },
    enabled: !!parentId,
  });

  // Query para buscar item pai atual
  const parentQuery = useQuery({
    queryKey: [config.api.queryKey, parentId],
    queryFn: async () => {
      if (!parentId) return null;
      return await api.get<T>(`${config.api.baseUrl}/${parentId}`);
    },
    enabled: !!parentId,
  });

  // CRUD com filtro de parentId
  const crud = useCrud({
    ...config,
    // Adiciona filtro de parent nos params
  });

  // Breadcrumbs
  const breadcrumbs = [
    { label: config.namePlural, href: config.routes.list },
    ...(ancestorsQuery.data?.map(ancestor => ({
      label: String(ancestor[config.display.titleField]),
      href: `${config.routes.list}/${ancestor.id}`,
    })) || []),
    ...(parentQuery.data ? [{
      label: String(parentQuery.data[config.display.titleField]),
      href: `${config.routes.list}/${parentId}`,
    }] : []),
  ];

  return (
    <SelectionProvider>
      <div className="flex flex-col gap-4 p-6">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbs} />

        {/* Header - Mostra informações do pai se existir */}
        <PageHeader
          title={parentQuery.data 
            ? String(parentQuery.data[config.display.titleField])
            : config.namePlural
          }
          description={parentQuery.data
            ? `Sub-itens de ${String(parentQuery.data[config.display.titleField])}`
            : config.description
          }
        />

        {/* Stats do pai (se aplicável) */}
        {parentQuery.data && (
          <div className="grid grid-cols-4 gap-4">
            {/* Stats específicos */}
          </div>
        )}

        {/* Grid de itens filhos */}
        <EntityGrid
          items={crud.items}
          config={config.grid}
          display={config.display}
          isLoading={crud.isLoading}
          onItemDoubleClick={(item) => {
            // Navega para o item se for hierárquico
            window.location.href = `${config.routes.list}/${item.id}`;
          }}
        />
      </div>
    </SelectionProvider>
  );
}
```

---

#### ETAPA 2.3: Sistema de Modais

**⏱️ Tempo estimado**: 8 horas

##### Passo 2.3.1: Criar ModalProvider

```typescript
// src/services/modals/components/ModalProvider.tsx

import React, { createContext, useContext, useState, useCallback } from 'react';

type ModalId = string;

interface ModalState {
  openModals: Set<ModalId>;
  data: Record<ModalId, any>;
}

interface ModalContextValue {
  isOpen: (id: ModalId) => boolean;
  open: (id: ModalId, data?: any) => void;
  close: (id: ModalId) => void;
  closeAll: () => void;
  toggle: (id: ModalId) => void;
  getData: <T = any>(id: ModalId) => T | undefined;
  
  // Utilitários
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  alert: (options: AlertOptions) => Promise<void>;
}

interface ConfirmOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

interface AlertOptions {
  title: string;
  description: string;
  variant?: 'info' | 'success' | 'warning' | 'error';
}

const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ModalState>({
    openModals: new Set(),
    data: {},
  });

  const [confirmResolver, setConfirmResolver] = useState<((value: boolean) => void) | null>(null);
  const [confirmOptions, setConfirmOptions] = useState<ConfirmOptions | null>(null);
  const [alertResolver, setAlertResolver] = useState<(() => void) | null>(null);
  const [alertOptions, setAlertOptions] = useState<AlertOptions | null>(null);

  const isOpen = useCallback((id: ModalId) => state.openModals.has(id), [state.openModals]);

  const open = useCallback((id: ModalId, data?: any) => {
    setState(prev => ({
      openModals: new Set([...prev.openModals, id]),
      data: data !== undefined ? { ...prev.data, [id]: data } : prev.data,
    }));
  }, []);

  const close = useCallback((id: ModalId) => {
    setState(prev => {
      const newModals = new Set(prev.openModals);
      newModals.delete(id);
      const { [id]: removed, ...restData } = prev.data;
      return { openModals: newModals, data: restData };
    });
  }, []);

  const closeAll = useCallback(() => {
    setState({ openModals: new Set(), data: {} });
  }, []);

  const toggle = useCallback((id: ModalId) => {
    setState(prev => {
      const newModals = new Set(prev.openModals);
      if (newModals.has(id)) {
        newModals.delete(id);
      } else {
        newModals.add(id);
      }
      return { ...prev, openModals: newModals };
    });
  }, []);

  const getData = useCallback(<T = any>(id: ModalId): T | undefined => {
    return state.data[id] as T;
  }, [state.data]);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmOptions(options);
      setConfirmResolver(() => resolve);
      open('__confirm__');
    });
  }, [open]);

  const handleConfirmResult = useCallback((result: boolean) => {
    close('__confirm__');
    confirmResolver?.(result);
    setConfirmResolver(null);
    setConfirmOptions(null);
  }, [close, confirmResolver]);

  const alert = useCallback((options: AlertOptions): Promise<void> => {
    return new Promise((resolve) => {
      setAlertOptions(options);
      setAlertResolver(() => resolve);
      open('__alert__');
    });
  }, [open]);

  const handleAlertClose = useCallback(() => {
    close('__alert__');
    alertResolver?.();
    setAlertResolver(null);
    setAlertOptions(null);
  }, [close, alertResolver]);

  return (
    <ModalContext.Provider value={{
      isOpen,
      open,
      close,
      closeAll,
      toggle,
      getData,
      confirm,
      alert,
    }}>
      {children}
      
      {/* Confirm Dialog Global */}
      {confirmOptions && (
        <ConfirmDialogGlobal
          open={isOpen('__confirm__')}
          options={confirmOptions}
          onConfirm={() => handleConfirmResult(true)}
          onCancel={() => handleConfirmResult(false)}
        />
      )}
      
      {/* Alert Dialog Global */}
      {alertOptions && (
        <AlertDialogGlobal
          open={isOpen('__alert__')}
          options={alertOptions}
          onClose={handleAlertClose}
        />
      )}
    </ModalContext.Provider>
  );
}

export function useModals() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModals must be used within ModalProvider');
  }
  return context;
}
```

---

#### 📋 Entregáveis do Sprint 2

```
src/core/
├── forms/
│   ├── fields/
│   │   ├── TextField.tsx           ✅
│   │   ├── SelectField.tsx         ✅
│   │   ├── ... (15+ campos)        ✅
│   │   └── index.ts                ✅
│   ├── components/
│   │   ├── DynamicField.tsx        ✅
│   │   ├── EntityForm.tsx          ✅
│   │   └── FormSection.tsx         ✅
│   ├── hooks/
│   │   └── useEntityForm.ts        ✅
│   └── index.ts                    ✅
├── crud/
│   ├── hooks/
│   │   └── useCrud.ts              ✅
│   ├── pages/
│   │   ├── SimpleCrudPage.tsx      ✅
│   │   └── ChainedEntityPage.tsx   ✅
│   ├── components/
│   │   ├── EntityFormModal.tsx     ✅
│   │   └── EntityViewerModal.tsx   ✅
│   └── index.ts                    ✅
└── services/
    └── modals/
        ├── components/
        │   └── ModalProvider.tsx   ✅
        ├── hooks/
        │   └── useModals.ts        ✅
        └── index.ts                ✅
```

---

### 🔐 SPRINT 3: SEGURANÇA (Semana 5-6)

> **Objetivo**: Implementar RBAC completo, gates de permissão, audit log e undo/redo.

#### ETAPA 3.1: Sistema RBAC

**⏱️ Tempo estimado**: 12 horas

##### Arquivos a criar:

```typescript
// src/security/rbac/types/rbac.types.ts
// src/security/rbac/hooks/usePermissions.ts
// src/security/rbac/hooks/useRole.ts
// src/security/rbac/components/PermissionGate.tsx
// src/security/rbac/components/RoleGate.tsx
// src/security/rbac/guards/withPermission.tsx
// src/security/rbac/config/roles.config.ts
// src/security/rbac/config/permissions.config.ts
```

##### Implementação chave:

```typescript
// src/security/rbac/hooks/usePermissions.ts

export function usePermissions() {
  const { user } = useAuth();
  
  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) return false;
    
    // Admin tem todas as permissões
    if (user.role === 'ADMIN') return true;
    
    // Verifica permissões do role
    const rolePermissions = getRolePermissions(user.role);
    return rolePermissions.includes(permission) || rolePermissions.includes('*');
  }, [user]);

  const hasAnyPermission = useCallback((permissions: string[]): boolean => {
    return permissions.some(p => hasPermission(p));
  }, [hasPermission]);

  const hasAllPermissions = useCallback((permissions: string[]): boolean => {
    return permissions.every(p => hasPermission(p));
  }, [hasPermission]);

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    role: user?.role,
    isAdmin: user?.role === 'ADMIN',
  };
}
```

```typescript
// src/security/rbac/components/PermissionGate.tsx

interface PermissionGateProps {
  permission: string | string[];
  mode?: 'any' | 'all';
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionGate({
  permission,
  mode = 'any',
  fallback = null,
  children,
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();
  
  const permissions = Array.isArray(permission) ? permission : [permission];
  
  const hasAccess = mode === 'all'
    ? hasAllPermissions(permissions)
    : hasAnyPermission(permissions);
  
  if (!hasAccess) return <>{fallback}</>;
  
  return <>{children}</>;
}
```

#### ETAPA 3.2: Audit Log e Undo/Redo

Implementar os sistemas já documentados nas seções 7.2 e 7.3.

---

### 🔧 SPRINT 4: SERVIÇOS (Semana 7-8)

> **Objetivo**: Batch Queue, Notifications, Search Global, Dashboard widgets.

*(Implementação dos sistemas já documentados nas seções anteriores)*

---

### 🔄 SPRINT 5: MIGRAÇÃO (Semana 9-10)

> **Objetivo**: Migrar páginas existentes para o novo sistema.

#### Ordem de Migração

```
1. Templates     → SimpleCrudPage (piloto)
2. Tags          → SimpleCrudPage
3. Locations     → ChainedEntityPage
4. Products      → ChainedEntityPage + Tabs
5. Variants      → ChainedEntityPage
6. Items         → ComplexCrudPage
```

#### Template de Migração

Para cada página:

```typescript
// ANTES: pages/templates/page.tsx (~400 linhas)
// DEPOIS: pages/templates/page.tsx (~15 linhas)

import { SimpleCrudPage } from '@core/crud';
import { templateConfig } from '@/config/entities/templates.config';

export default function TemplatesPage() {
  return <SimpleCrudPage config={templateConfig} />;
}

// A configuração fica em:
// config/entities/templates.config.ts
```

---

### ✅ SPRINT 6: FINALIZAÇÃO (Semana 11-12)

> **Objetivo**: Testes, documentação, performance.

#### Checklist Final

- [ ] Todos os testes E2E passando
- [ ] Storybook com todos os componentes
- [ ] Documentação atualizada
- [ ] Performance auditada
- [ ] Acessibilidade verificada
- [ ] Code review completo

---

## 📊 MÉTRICAS DE SUCESSO

### Antes vs Depois

| Métrica | Antes | Depois (Meta) |
|---------|-------|---------------|
| Linhas por página CRUD | ~400 | ~50 |
| Tempo para criar nova página CRUD | ~8h | ~30min |
| Tempo para criar formulário | ~4h | ~30min |
| Código duplicado | ~60% | ~5% |
| Componentes específicos por entidade | 30+ | 0 |
| Cobertura de testes | 10% | 80% |
| Campos de formulário customizados | 100+ | 20 reutilizáveis |
| Páginas de detalhe com código repetido | 10+ | 0 |

### KPIs de Qualidade

- ✅ Todas as páginas usando `CrudListPage` / `CrudDetailPage`
- ✅ Todos os formulários usando `EntityForm` com config
- ✅ Todas as páginas de detalhe usando `EntityTabs`
- ✅ Zero useState para modais (usar useModal)
- ✅ 100% das ações protegidas por RBAC
- ✅ Notificações em tempo real funcionando
- ✅ Batch operations com queue management
- ✅ Busca global funcional (Cmd+K)

---

## 💡 MELHORIAS ADICIONAIS IDENTIFICADAS

### 1. Sistema de Temas por Módulo

```typescript
// @core/theme/types/theme.types.ts

export interface ModuleTheme {
  primaryColor: string;
  accentColor: string;
  icon: React.ReactNode;
  gradient: string;
}

export const moduleThemes: Record<string, ModuleTheme> = {
  stock: {
    primaryColor: 'blue',
    accentColor: 'indigo',
    icon: <Package />,
    gradient: 'from-blue-500 to-indigo-600',
  },
  sales: {
    primaryColor: 'green',
    accentColor: 'emerald',
    icon: <DollarSign />,
    gradient: 'from-green-500 to-emerald-600',
  },
  hr: {
    primaryColor: 'purple',
    accentColor: 'violet',
    icon: <Users />,
    gradient: 'from-purple-500 to-violet-600',
  },
};
```

### 2. Sistema de Onboarding

```typescript
// @services/onboarding/

export interface OnboardingStep {
  id: string;
  target: string;           // CSS selector
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Tour guiado para novos usuários
// Highlights de novas features
// Dicas contextuais
```

### 3. Sistema de Atalhos de Teclado

```typescript
// @core/shortcuts/

export interface ShortcutConfig {
  key: string;              // 'cmd+k', 'ctrl+s'
  action: () => void;
  description: string;
  scope?: 'global' | 'page' | 'modal';
}

// Padrões:
// Cmd+K - Busca global
// Cmd+N - Novo item
// Cmd+S - Salvar
// Cmd+D - Duplicar
// Delete - Excluir selecionados
// Escape - Fechar modal/cancelar
// Cmd+Z - Desfazer (onde aplicável)
```

### 4. Sistema de Preferências do Usuário

```typescript
// @services/preferences/

export interface UserPreferences {
  // Visual
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  gridDensity: 'compact' | 'normal' | 'comfortable';
  
  // Comportamento
  defaultView: 'grid' | 'list' | 'table';
  itemsPerPage: number;
  confirmBeforeDelete: boolean;
  
  // Notificações
  soundEnabled: boolean;
  desktopNotifications: boolean;
  
  // Por módulo
  modulePreferences: Record<string, any>;
}

// Sincronizado com backend
// Persistência local como fallback
```

### 5. 📤 Sistema de Importação/Exportação Universal

Sistema completo para import/export com wizard intuitivo, preview e validação em tempo real.

#### Arquitetura do Sistema

```typescript
// @core/import-export/types/import-export.types.ts

export type DataFormat = 'csv' | 'xlsx' | 'json' | 'xml' | 'pdf';
export type ImportStatus = 'pending' | 'validating' | 'importing' | 'completed' | 'error' | 'cancelled';

export interface ImportExportConfig<T = any> {
  // Identificação
  entityType: string;                    // 'products', 'users', etc.
  entityName: string;                    // 'Produto', 'Usuário'
  
  // Formatos suportados
  exportFormats: DataFormat[];
  importFormats: DataFormat[];
  
  // Mapeamento de campos
  fieldMappings: FieldMapping<T>[];
  
  // Validação
  validationRules: ValidationRule<T>[];
  
  // Transformação
  transforms: DataTransform<T>[];
  
  // Limites
  maxFileSize: number;                   // MB
  maxRows: number;
  
  // Templates
  templateConfig?: TemplateConfig;
  
  // Callbacks
  hooks?: ImportExportHooks<T>;
}

export interface FieldMapping<T> {
  // Campo na entidade
  field: keyof T;
  label: string;
  type: FieldType;
  
  // Configurações de exportação
  export?: {
    header: string;
    format?: (value: any) => string;
    include: boolean;
    width?: number;                      // Para Excel
  };
  
  // Configurações de importação
  import?: {
    required: boolean;
    aliases: string[];                   // Nomes alternativos da coluna
    parse?: (value: string) => any;
    validate?: (value: any) => string | undefined;
    defaultValue?: any;
  };
  
  // Relacionamentos
  relation?: {
    entity: string;                      // 'categories'
    field: string;                       // 'name' ou 'id'
    searchBy?: string[];                 // Campos para busca
  };
}

export interface ValidationRule<T> {
  field: keyof T;
  rule: 'required' | 'unique' | 'format' | 'range' | 'custom';
  message: string;
  
  // Para rule 'format'
  pattern?: RegExp;
  
  // Para rule 'range'
  min?: number;
  max?: number;
  
  // Para rule 'custom'
  validator?: (value: any, row: T, context: ValidationContext) => boolean;
  
  // Comportamento
  severity: 'error' | 'warning';
  blockImport?: boolean;               // Se true, bloqueia import em caso de erro
}

export interface DataTransform<T> {
  field: keyof T;
  transform: (value: any, row: T, context: TransformContext) => any;
  description: string;
}

export interface ImportJob<T = any> {
  id: string;
  
  // Configuração
  config: ImportExportConfig<T>;
  
  // Arquivo
  file: {
    name: string;
    size: number;
    type: string;
    url: string;
  };
  
  // Status
  status: ImportStatus;
  progress: number;                      // 0-100
  
  // Dados processados
  totalRows: number;
  processedRows: number;
  validRows: number;
  errorRows: number;
  
  // Preview (primeiras 100 linhas)
  preview?: PreviewData<T>;
  
  // Mapeamento de colunas
  columnMapping?: Record<string, string>;
  
  // Resultados
  results?: ImportResult<T>;
  
  // Histórico
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  
  // Usuário
  userId: string;
}

export interface PreviewData<T> {
  headers: string[];
  rows: any[][];
  mappingSuggestions: Record<string, string>;  // coluna -> campo sugerido
  detectedFormat: DataFormat;
  encoding: string;
  delimiter?: string;                          // Para CSV
}

export interface ImportResult<T> {
  summary: {
    total: number;
    imported: number;
    updated: number;
    skipped: number;
    errors: number;
  };
  
  // Dados importados com sucesso
  importedItems: T[];
  
  // Erros por linha
  errors: ImportError[];
  
  // Warnings
  warnings: ImportWarning[];
  
  // Arquivo de log
  logFile?: string;
}

export interface ImportError {
  row: number;
  field?: string;
  message: string;
  value?: any;
  severity: 'error' | 'warning';
}

export interface ExportJob<T = any> {
  id: string;
  
  // Configuração
  config: ImportExportConfig<T>;
  format: DataFormat;
  
  // Filtros aplicados
  filters?: Record<string, any>;
  
  // Status
  status: 'pending' | 'exporting' | 'completed' | 'error';
  progress: number;
  
  // Resultado
  totalRows: number;
  fileUrl?: string;
  fileName: string;
  
  // Timing
  createdAt: Date;
  completedAt?: Date;
  
  // Usuário
  userId: string;
}
```

#### Componente Wizard de Importação

```typescript
// @core/import-export/components/ImportWizard.tsx

interface ImportWizardProps<T> {
  config: ImportExportConfig<T>;
  
  // Callbacks
  onComplete?: (result: ImportResult<T>) => void;
  onCancel?: () => void;
  
  // Configurações
  allowSkipValidation?: boolean;
  showPreview?: boolean;
  maxPreviewRows?: number;
}

export function ImportWizard<T>({
  config,
  onComplete,
  ...props
}: ImportWizardProps<T>) {
  // Estados do wizard
  const [currentStep, setCurrentStep] = useState(0);
  const [importJob, setImportJob] = useState<ImportJob<T>>();
  
  const steps = [
    { id: 'upload', title: 'Upload do Arquivo' },
    { id: 'mapping', title: 'Mapeamento de Colunas' },
    { id: 'validation', title: 'Validação dos Dados' },
    { id: 'import', title: 'Importação' },
    { id: 'result', title: 'Resultado' },
  ];
  
  return (
    <div className="import-wizard">
      {/* Progress Steps */}
      <WizardSteps steps={steps} currentStep={currentStep} />
      
      {/* Step Content */}
      {currentStep === 0 && (
        <FileUploadStep
          config={config}
          onFileSelect={handleFileSelect}
        />
      )}
      
      {currentStep === 1 && importJob && (
        <ColumnMappingStep
          job={importJob}
          onMappingComplete={handleMappingComplete}
        />
      )}
      
      {currentStep === 2 && importJob && (
        <ValidationStep
          job={importJob}
          onValidationComplete={handleValidationComplete}
        />
      )}
      
      {currentStep === 3 && importJob && (
        <ImportStep
          job={importJob}
          onImportComplete={handleImportComplete}
        />
      )}
      
      {currentStep === 4 && importJob?.results && (
        <ResultStep
          job={importJob}
          onComplete={onComplete}
        />
      )}
    </div>
  );
}

// Passo 1: Upload do arquivo
function FileUploadStep({ config, onFileSelect }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/json': ['.json'],
    },
    maxSize: config.maxFileSize * 1024 * 1024,
    onDrop: onFileSelect,
  });
  
  return (
    <div className="space-y-6">
      {/* Template Download */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3>📋 Template Recomendado</h3>
        <p>Baixe o template para garantir a formatação correta:</p>
        <Button onClick={() => downloadTemplate(config)}>
          Baixar Template
        </Button>
      </div>
      
      {/* Dropzone */}
      <div {...getRootProps()} className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
        isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
      )}>
        <input {...getInputProps()} />
        
        <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        
        {isDragActive ? (
          <p>Solte o arquivo aqui...</p>
        ) : (
          <div>
            <p className="text-lg mb-2">
              Arraste um arquivo ou clique para selecionar
            </p>
            <p className="text-sm text-gray-500">
              Formatos: {config.importFormats.join(', ')} 
              (máx. {config.maxFileSize}MB)
            </p>
          </div>
        )}
      </div>
      
      {/* Informações adicionais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="p-3 bg-gray-50 rounded">
          <strong>Linhas máximas:</strong> {config.maxRows.toLocaleString()}
        </div>
        <div className="p-3 bg-gray-50 rounded">
          <strong>Campos obrigatórios:</strong> {
            config.fieldMappings
              .filter(f => f.import?.required)
              .length
          }
        </div>
      </div>
    </div>
  );
}

// Passo 2: Mapeamento de colunas
function ColumnMappingStep({ job, onMappingComplete }) {
  const [mapping, setMapping] = useState(job.preview?.mappingSuggestions || {});
  
  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 p-4 rounded-lg">
        <h3>🔗 Mapeamento de Colunas</h3>
        <p>Associe as colunas do arquivo aos campos do sistema:</p>
      </div>
      
      {/* Preview da tabela */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 p-3 border-b">
          <h4>Preview dos Dados</h4>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                {job.preview?.headers.map((header, i) => (
                  <th key={i} className="p-2 text-left border-r">
                    <div className="space-y-2">
                      <div className="font-mono text-sm">{header}</div>
                      
                      {/* Select para mapeamento */}
                      <select
                        value={mapping[header] || ''}
                        onChange={(e) => setMapping(prev => ({
                          ...prev,
                          [header]: e.target.value
                        }))}
                        className="w-full text-xs p-1 border rounded"
                      >
                        <option value="">-- Não mapear --</option>
                        {job.config.fieldMappings.map(field => (
                          <option key={field.field as string} value={field.field as string}>
                            {field.label}
                            {field.import?.required && ' *'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody>
              {job.preview?.rows.slice(0, 5).map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j} className="p-2 border-r text-sm">
                      {String(cell).slice(0, 50)}
                      {String(cell).length > 50 && '...'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Campos obrigatórios não mapeados */}
      <RequiredFieldsAlert 
        config={job.config}
        mapping={mapping}
      />
      
      <div className="flex justify-between">
        <Button variant="outline">Voltar</Button>
        <Button 
          onClick={() => onMappingComplete(mapping)}
          disabled={!validateMapping(job.config, mapping)}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}

// Passo 3: Validação
function ValidationStep({ job, onValidationComplete }) {
  const [validationResults, setValidationResults] = useState<ValidationResult>();
  const [isValidating, setIsValidating] = useState(true);
  
  useEffect(() => {
    validateImportData(job).then(results => {
      setValidationResults(results);
      setIsValidating(false);
    });
  }, [job]);
  
  if (isValidating) {
    return <ValidationProgress />;
  }
  
  return (
    <div className="space-y-6">
      <ValidationSummary results={validationResults} />
      
      {validationResults?.errors.length > 0 && (
        <ErrorsList errors={validationResults.errors} />
      )}
      
      {validationResults?.warnings.length > 0 && (
        <WarningsList warnings={validationResults.warnings} />
      )}
      
      <div className="flex justify-between">
        <Button variant="outline">Voltar</Button>
        <Button 
          onClick={() => onValidationComplete(validationResults)}
          disabled={validationResults?.hasBlockingErrors}
        >
          {validationResults?.hasBlockingErrors 
            ? 'Corrigir Erros' 
            : 'Continuar Importação'
          }
        </Button>
      </div>
    </div>
  );
}
```

#### Hook de Import/Export

```typescript
// @core/import-export/hooks/useImportExport.ts

export function useImportExport<T>(config: ImportExportConfig<T>) {
  const [jobs, setJobs] = useState<ImportJob<T>[]>([]);
  
  return {
    // ========== IMPORT ==========
    
    // Criar job de importação
    createImportJob: async (file: File) => {
      const job = await createImportJob(config, file);
      setJobs(prev => [...prev, job]);
      return job;
    },
    
    // Executar validação
    validateImport: (job: ImportJob<T>) => 
      validateImportData(job),
    
    // Executar importação
    executeImport: (job: ImportJob<T>) => 
      executeImportJob(job),
    
    // ========== EXPORT ==========
    
    // Exportar dados
    exportData: (
      format: DataFormat,
      filters?: Record<string, any>
    ) => exportEntityData(config, format, filters),
    
    // Baixar template
    downloadTemplate: (format: DataFormat = 'xlsx') => 
      generateTemplate(config, format),
    
    // ========== ESTADO ==========
    
    jobs,
    
    // Job ativo (último)
    activeJob: jobs[jobs.length - 1],
    
    // Limpar jobs concluídos
    clearCompletedJobs: () => {
      setJobs(prev => prev.filter(job => 
        job.status === 'pending' || job.status === 'importing'
      ));
    },
  };
}

// Serviços
async function createImportJob<T>(
  config: ImportExportConfig<T>, 
  file: File
): Promise<ImportJob<T>> {
  // Upload do arquivo
  const uploadedFile = await uploadFile(file);
  
  // Parse inicial e preview
  const preview = await parseFilePreview(uploadedFile, config);
  
  return {
    id: generateId(),
    config,
    file: {
      name: file.name,
      size: file.size,
      type: file.type,
      url: uploadedFile.url,
    },
    status: 'pending',
    progress: 0,
    totalRows: preview.rows.length,
    processedRows: 0,
    validRows: 0,
    errorRows: 0,
    preview,
    createdAt: new Date(),
    userId: getCurrentUserId(),
  };
}
```

#### Configuração de Exemplo

```typescript
// config/entities/products.import-export.ts

export const productsImportExportConfig: ImportExportConfig<Product> = {
  entityType: 'products',
  entityName: 'Produto',
  
  exportFormats: ['csv', 'xlsx', 'json'],
  importFormats: ['csv', 'xlsx'],
  
  maxFileSize: 10, // MB
  maxRows: 10000,
  
  fieldMappings: [
    {
      field: 'name',
      label: 'Nome do Produto',
      type: 'text',
      export: {
        header: 'Nome',
        include: true,
        width: 30,
      },
      import: {
        required: true,
        aliases: ['nome', 'produto', 'title'],
        validate: (value) => {
          if (!value || value.length < 3) {
            return 'Nome deve ter pelo menos 3 caracteres';
          }
        },
      },
    },
    
    {
      field: 'sku',
      label: 'Código SKU',
      type: 'text',
      export: {
        header: 'SKU',
        include: true,
      },
      import: {
        required: true,
        aliases: ['codigo', 'code'],
        validate: (value) => {
          if (!/^[A-Z0-9-]+$/.test(value)) {
            return 'SKU deve conter apenas letras maiúsculas, números e hífens';
          }
        },
      },
    },
    
    {
      field: 'category',
      label: 'Categoria',
      type: 'relation',
      relation: {
        entity: 'categories',
        field: 'name',
        searchBy: ['name', 'slug'],
      },
      export: {
        header: 'Categoria',
        include: true,
        format: (category) => category?.name || '',
      },
      import: {
        required: false,
        aliases: ['categoria', 'cat'],
      },
    },
    
    {
      field: 'price',
      label: 'Preço',
      type: 'currency',
      export: {
        header: 'Preço (R$)',
        include: true,
        format: (value) => formatCurrency(value),
      },
      import: {
        required: true,
        aliases: ['preco', 'valor'],
        parse: (value) => parseCurrency(value),
        validate: (value) => {
          if (value <= 0) {
            return 'Preço deve ser maior que zero';
          }
        },
      },
    },
  ],
  
  validationRules: [
    {
      field: 'sku',
      rule: 'unique',
      message: 'SKU já existe no sistema',
      severity: 'error',
      blockImport: true,
    },
    
    {
      field: 'price',
      rule: 'range',
      min: 0.01,
      max: 999999.99,
      message: 'Preço deve estar entre R$ 0,01 e R$ 999.999,99',
      severity: 'warning',
    },
  ],
  
  transforms: [
    {
      field: 'name',
      transform: (value) => value.trim().toUpperCase(),
      description: 'Converte nome para maiúsculas',
    },
  ],
  
  templateConfig: {
    includeExamples: true,
    exampleRows: [
      {
        'Nome': 'Camiseta Básica Azul',
        'SKU': 'CAM-BAS-AZL-001',
        'Categoria': 'Roupas',
        'Preço (R$)': '29,90',
      },
    ],
  },
  
  hooks: {
    beforeImport: async (data) => {
      // Validações customizadas
      console.log(`Iniciando importação de ${data.length} produtos...`);
    },
    
    afterImport: async (results) => {
      // Invalidar cache, enviar notificações, etc.
      await invalidateProductCache();
      
      if (results.summary.imported > 0) {
        await sendNotification({
          title: 'Importação concluída',
          message: `${results.summary.imported} produtos importados com sucesso!`,
        });
      }
    },
  },
};
```

### 6. 📊 Sistema de Relatórios Configuráveis

Sistema completo de relatórios com agendamento, múltiplas visualizações e exportação.

#### Arquitetura do Sistema

```typescript
// @services/reports/types/reports.types.ts

export type ReportType = 'table' | 'chart' | 'dashboard' | 'pivot' | 'summary';
export type ChartType = 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'heatmap';
export type AggregationType = 'sum' | 'count' | 'avg' | 'min' | 'max' | 'distinct';
export type ScheduleFrequency = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly';

export interface ReportConfig {
  // Identificação
  id: string;
  name: string;
  description: string;
  category: string;                      // 'vendas', 'estoque', 'financeiro'
  
  // Tipo e layout
  type: ReportType;
  
  // Fonte de dados
  dataSource: DataSourceConfig;
  
  // Estrutura
  columns: ColumnConfig[];
  filters: FilterConfig[];
  
  // Agrupamento e agregação
  groupBy?: GroupByConfig[];
  aggregations?: AggregationConfig[];
  
  // Ordenação
  sortBy?: SortConfig[];
  
  // Visualização
  visualization: VisualizationConfig;
  
  // Paginação
  pagination?: {
    enabled: boolean;
    pageSize: number;
  };
  
  // Exportação
  exportOptions: ExportConfig;
  
  // Agendamento
  schedule?: ScheduleConfig;
  
  // Permissões
  permissions: ReportPermissions;
  
  // Metadados
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  tags?: string[];
}

export interface DataSourceConfig {
  // Tipo da fonte
  type: 'api' | 'sql' | 'function' | 'entity';
  
  // Para type 'api'
  endpoint?: string;
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  
  // Para type 'sql'
  query?: string;
  database?: string;
  
  // Para type 'function'
  function?: (filters: Record<string, any>) => Promise<any[]>;
  
  // Para type 'entity'
  entity?: string;                       // 'products', 'orders', etc.
  
  // Cache
  cache?: {
    enabled: boolean;
    ttl: number;                         // Segundos
    key?: string;
  };
  
  // Parâmetros dinâmicos
  parameters?: ParameterConfig[];
}

export interface ColumnConfig {
  id: string;
  field: string;                         // Campo nos dados
  label: string;
  type: ColumnType;
  
  // Formatação
  format?: FormatConfig;
  
  // Comportamento
  sortable?: boolean;
  filterable?: boolean;
  groupable?: boolean;
  
  // Agregação
  aggregation?: AggregationType;
  
  // Aparência
  width?: number;
  align?: 'left' | 'center' | 'right';
  color?: string | ((value: any, row: any) => string);
  
  // Condicional
  conditional?: ConditionalFormatting[];
  
  // Links
  link?: {
    type: 'internal' | 'external';
    url: string | ((row: any) => string);
  };
}

export type ColumnType = 
  | 'text' 
  | 'number' 
  | 'currency' 
  | 'percentage' 
  | 'date' 
  | 'datetime' 
  | 'boolean' 
  | 'image' 
  | 'link' 
  | 'badge' 
  | 'progress';

export interface FormatConfig {
  type: ColumnType;
  
  // Para numbers/currency
  decimals?: number;
  prefix?: string;
  suffix?: string;
  
  // Para dates
  dateFormat?: string;                   // 'DD/MM/YYYY', 'MM/DD/YYYY'
  
  // Para boolean
  trueLabel?: string;
  falseLabel?: string;
  
  // Para badge
  badgeVariant?: (value: any) => 'default' | 'success' | 'warning' | 'destructive';
}

export interface ConditionalFormatting {
  condition: string;                     // 'value > 100', 'row.status === "active"'
  style: {
    color?: string;
    backgroundColor?: string;
    fontWeight?: 'normal' | 'bold';
    icon?: React.ReactNode;
  };
}

export interface GroupByConfig {
  field: string;
  label: string;
  
  // Configuração de agrupamento
  dateGrouping?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  customGrouping?: (value: any) => string;
  
  // Ordenação dentro do grupo
  sortOrder?: 'asc' | 'desc';
}

export interface AggregationConfig {
  field: string;
  type: AggregationType;
  label: string;
  format?: FormatConfig;
}

export interface VisualizationConfig {
  type: ReportType;
  
  // Para charts
  chart?: {
    type: ChartType;
    xAxis: string;
    yAxis: string | string[];
    
    // Configurações específicas
    stacked?: boolean;
    showLegend?: boolean;
    showDataLabels?: boolean;
    
    // Cores
    colorScheme?: string[];
    
    // Dimensões
    width?: number;
    height?: number;
  };
  
  // Para dashboard
  dashboard?: {
    layout: 'grid' | 'masonry';
    columns: number;
    widgets: DashboardWidget[];
  };
  
  // Para summary
  summary?: {
    cards: SummaryCard[];
  };
}

export interface DashboardWidget {
  id: string;
  title: string;
  type: 'stat' | 'chart' | 'table' | 'progress';
  
  // Posição no grid
  colspan?: number;
  rowspan?: number;
  
  // Configuração específica
  config: any;
}

export interface SummaryCard {
  title: string;
  value: string | number;
  change?: number;                       // Percentual de mudança
  format?: FormatConfig;
  icon?: React.ReactNode;
}

export interface ExportConfig {
  formats: ('pdf' | 'xlsx' | 'csv' | 'json' | 'png' | 'svg')[];
  
  // PDF específico
  pdf?: {
    orientation: 'portrait' | 'landscape';
    includeCharts: boolean;
    includeFilters: boolean;
    headerText?: string;
    footerText?: string;
    logo?: string;
  };
  
  // Excel específico
  excel?: {
    includeCharts: boolean;
    sheetName?: string;
    password?: string;
  };
}

export interface ScheduleConfig {
  enabled: boolean;
  frequency: ScheduleFrequency;
  
  // Timing
  time?: string;                         // '14:30' para daily
  dayOfWeek?: number;                    // 0-6 para weekly
  dayOfMonth?: number;                   // 1-31 para monthly
  
  // Entrega
  delivery: {
    method: 'email' | 'webhook' | 'storage';
    
    // Para email
    recipients?: string[];
    subject?: string;
    body?: string;
    
    // Para webhook
    webhookUrl?: string;
    
    // Para storage
    storagePath?: string;
  };
  
  // Formato de entrega
  format: 'pdf' | 'xlsx' | 'csv';
  
  // Filtros fixos para agendamento
  filters?: Record<string, any>;
}

export interface ReportPermissions {
  view: string[];                        // Roles que podem visualizar
  edit: string[];                        // Roles que podem editar
  export: string[];                      // Roles que podem exportar
  schedule: string[];                    // Roles que podem agendar
}

export interface ReportExecution {
  id: string;
  reportId: string;
  
  // Parâmetros de execução
  filters: Record<string, any>;
  
  // Status
  status: 'running' | 'completed' | 'error' | 'cancelled';
  progress: number;
  
  // Resultado
  data?: any[];
  totalRows?: number;
  
  // Arquivos gerados
  files?: {
    format: string;
    url: string;
    size: number;
  }[];
  
  // Timing
  startedAt: Date;
  completedAt?: Date;
  duration?: number;                     // ms
  
  // Erro
  error?: string;
  
  // Usuário
  userId: string;
}
```

#### Construtor de Relatórios

```typescript
// @services/reports/components/ReportBuilder.tsx

interface ReportBuilderProps {
  config?: ReportConfig;                 // Para edição
  onSave: (config: ReportConfig) => void;
  onCancel: () => void;
}

export function ReportBuilder({
  config,
  onSave,
  onCancel,
}: ReportBuilderProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [reportConfig, setReportConfig] = useState<Partial<ReportConfig>>(
    config || {
      type: 'table',
      columns: [],
      filters: [],
      visualization: { type: 'table' },
      exportOptions: { formats: ['pdf', 'xlsx'] },
    }
  );
  
  const steps = [
    { id: 'datasource', title: 'Fonte de Dados' },
    { id: 'columns', title: 'Colunas' },
    { id: 'filters', title: 'Filtros' },
    { id: 'grouping', title: 'Agrupamento' },
    { id: 'visualization', title: 'Visualização' },
    { id: 'export', title: 'Exportação' },
    { id: 'schedule', title: 'Agendamento' },
    { id: 'preview', title: 'Preview' },
  ];
  
  return (
    <div className="h-full flex">
      {/* Sidebar com steps */}
      <div className="w-64 border-r bg-gray-50">
        <ReportBuilderSidebar 
          steps={steps}
          currentStep={currentStep}
          onStepClick={setCurrentStep}
        />
      </div>
      
      {/* Conteúdo principal */}
      <div className="flex-1 p-6 overflow-auto">
        {currentStep === 0 && (
          <DataSourceStep
            config={reportConfig.dataSource}
            onChange={(dataSource) => 
              setReportConfig(prev => ({ ...prev, dataSource }))
            }
          />
        )}
        
        {currentStep === 1 && (
          <ColumnsStep
            columns={reportConfig.columns || []}
            dataSource={reportConfig.dataSource}
            onChange={(columns) => 
              setReportConfig(prev => ({ ...prev, columns }))
            }
          />
        )}
        
        {currentStep === 2 && (
          <FiltersStep
            filters={reportConfig.filters || []}
            columns={reportConfig.columns || []}
            onChange={(filters) => 
              setReportConfig(prev => ({ ...prev, filters }))
            }
          />
        )}
        
        {/* ... outros steps */}
        
        {currentStep === 7 && (
          <PreviewStep
            config={reportConfig as ReportConfig}
          />
        )}
      </div>
    </div>
  );
}

// Passo de configuração de fonte de dados
function DataSourceStep({ config, onChange }) {
  const [sourceType, setSourceType] = useState(config?.type || 'entity');
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Fonte de Dados</h2>
        <p className="text-gray-600 mb-6">
          Selecione de onde os dados do relatório serão obtidos.
        </p>
      </div>
      
      {/* Tipo de fonte */}
      <div>
        <label className="block text-sm font-medium mb-3">
          Tipo de Fonte
        </label>
        
        <div className="grid grid-cols-2 gap-4">
          <SourceTypeCard
            type="entity"
            title="Entidades do Sistema"
            description="Produtos, Pedidos, Usuários, etc."
            icon={<Database />}
            selected={sourceType === 'entity'}
            onClick={() => setSourceType('entity')}
          />
          
          <SourceTypeCard
            type="api"
            title="API Externa"
            description="Endpoint REST personalizado"
            icon={<Globe />}
            selected={sourceType === 'api'}
            onClick={() => setSourceType('api')}
          />
          
          <SourceTypeCard
            type="sql"
            title="Consulta SQL"
            description="Query personalizada no banco"
            icon={<Code />}
            selected={sourceType === 'sql'}
            onClick={() => setSourceType('sql')}
          />
          
          <SourceTypeCard
            type="function"
            title="Função Customizada"
            description="Lógica de negócio específica"
            icon={<Zap />}
            selected={sourceType === 'function'}
            onClick={() => setSourceType('function')}
          />
        </div>
      </div>
      
      {/* Configuração específica */}
      {sourceType === 'entity' && (
        <EntitySourceConfig
          config={config}
          onChange={onChange}
        />
      )}
      
      {sourceType === 'api' && (
        <ApiSourceConfig
          config={config}
          onChange={onChange}
        />
      )}
      
      {sourceType === 'sql' && (
        <SqlSourceConfig
          config={config}
          onChange={onChange}
        />
      )}
    </div>
  );
}

// Configuração para entidades
function EntitySourceConfig({ config, onChange }) {
  const [selectedEntity, setSelectedEntity] = useState(config?.entity || '');
  
  const availableEntities = [
    { id: 'products', name: 'Produtos', count: 1250 },
    { id: 'orders', name: 'Pedidos', count: 890 },
    { id: 'customers', name: 'Clientes', count: 340 },
    { id: 'users', name: 'Usuários', count: 25 },
    { id: 'inventory', name: 'Estoque', count: 2100 },
  ];
  
  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium">
        Selecionar Entidade
      </label>
      
      <div className="grid grid-cols-1 gap-3">
        {availableEntities.map(entity => (
          <div
            key={entity.id}
            className={cn(
              "p-3 border rounded-lg cursor-pointer transition-colors",
              selectedEntity === entity.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            )}
            onClick={() => {
              setSelectedEntity(entity.id);
              onChange({
                type: 'entity',
                entity: entity.id,
              });
            }}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">{entity.name}</span>
              <span className="text-sm text-gray-500">
                {entity.count.toLocaleString()} registros
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {selectedEntity && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Cache</h4>
          <label className="flex items-center space-x-2">
            <input type="checkbox" />
            <span className="text-sm">Habilitar cache (TTL: 5 minutos)</span>
          </label>
        </div>
      )}
    </div>
  );
}
```

#### Hook de Relatórios

```typescript
// @services/reports/hooks/useReports.ts

export function useReports() {
  const [reports, setReports] = useState<ReportConfig[]>([]);
  const [executions, setExecutions] = useState<ReportExecution[]>([]);
  
  return {
    // ========== CRUD DE RELATÓRIOS ==========
    
    // Listar relatórios
    reports,
    loadReports: async (category?: string) => {
      const data = await api.get('/reports', { params: { category } });
      setReports(data);
    },
    
    // Criar/atualizar relatório
    saveReport: async (config: ReportConfig) => {
      if (config.id) {
        return await api.put(`/reports/${config.id}`, config);
      } else {
        return await api.post('/reports', config);
      }
    },
    
    // Excluir relatório
    deleteReport: async (id: string) => {
      await api.delete(`/reports/${id}`);
      setReports(prev => prev.filter(r => r.id !== id));
    },
    
    // ========== EXECUÇÃO ==========
    
    // Executar relatório
    executeReport: async (
      reportId: string, 
      filters?: Record<string, any>
    ) => {
      const execution = await api.post(`/reports/${reportId}/execute`, {
        filters,
      });
      
      setExecutions(prev => [...prev, execution]);
      return execution;
    },
    
    // Acompanhar execução
    watchExecution: (executionId: string) => {
      // WebSocket ou polling para atualizações de progresso
    },
    
    // Histórico de execuções
    executions,
    loadExecutions: async (reportId?: string) => {
      const data = await api.get('/reports/executions', { 
        params: { reportId } 
      });
      setExecutions(data);
    },
    
    // ========== AGENDAMENTO ==========
    
    // Agendar relatório
    scheduleReport: async (reportId: string, schedule: ScheduleConfig) => {
      return await api.post(`/reports/${reportId}/schedule`, schedule);
    },
    
    // Listar agendamentos
    getSchedules: async () => {
      return await api.get('/reports/schedules');
    },
    
    // ========== EXPORT ==========
    
    // Exportar relatório
    exportReport: async (
      reportId: string,
      format: string,
      filters?: Record<string, any>
    ) => {
      const response = await api.post(`/reports/${reportId}/export`, {
        format,
        filters,
      });
      
      // Download automático
      const blob = new Blob([response.data]);
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${reportId}-${Date.now()}.${format}`;
      a.click();
      
      URL.revokeObjectURL(url);
    },
    
    // ========== PREVIEW ==========
    
    // Preview dos dados
    previewReport: async (config: ReportConfig, limit = 100) => {
      return await api.post('/reports/preview', {
        config,
        limit,
      });
    },
  };
}
```

#### Configurações de Exemplo

```typescript
// config/reports/sales-reports.ts

export const salesReports: ReportConfig[] = [
  {
    id: 'sales-summary',
    name: 'Resumo de Vendas',
    description: 'Vendas por período com comparação mensal',
    category: 'vendas',
    type: 'dashboard',
    
    dataSource: {
      type: 'entity',
      entity: 'orders',
      cache: { enabled: true, ttl: 300 },
    },
    
    columns: [
      {
        id: 'date',
        field: 'createdAt',
        label: 'Data',
        type: 'date',
        format: { type: 'date', dateFormat: 'DD/MM/YYYY' },
        groupable: true,
      },
      {
        id: 'total',
        field: 'total',
        label: 'Total',
        type: 'currency',
        format: { type: 'currency', prefix: 'R$ ', decimals: 2 },
        aggregation: 'sum',
      },
      {
        id: 'items',
        field: 'items',
        label: 'Itens',
        type: 'number',
        aggregation: 'sum',
      },
    ],
    
    filters: [
      {
        id: 'dateRange',
        label: 'Período',
        field: 'createdAt',
        type: 'date-range',
        defaultValue: { start: '-30d', end: 'now' },
      },
      {
        id: 'status',
        label: 'Status',
        field: 'status',
        type: 'select',
        options: [
          { label: 'Todos', value: 'all' },
          { label: 'Concluído', value: 'completed' },
          { label: 'Cancelado', value: 'cancelled' },
        ],
      },
    ],
    
    groupBy: [
      {
        field: 'createdAt',
        label: 'Data',
        dateGrouping: 'day',
      },
    ],
    
    aggregations: [
      {
        field: 'total',
        type: 'sum',
        label: 'Total de Vendas',
        format: { type: 'currency', prefix: 'R$ ' },
      },
      {
        field: 'id',
        type: 'count',
        label: 'Número de Pedidos',
      },
    ],
    
    visualization: {
      type: 'dashboard',
      dashboard: {
        layout: 'grid',
        columns: 2,
        widgets: [
          {
            id: 'total-sales',
            title: 'Total de Vendas',
            type: 'stat',
            config: {
              field: 'total',
              aggregation: 'sum',
              format: 'currency',
              change: true,
            },
          },
          {
            id: 'orders-count',
            title: 'Número de Pedidos',
            type: 'stat',
            config: {
              field: 'id',
              aggregation: 'count',
              format: 'number',
            },
          },
          {
            id: 'sales-chart',
            title: 'Vendas por Dia',
            type: 'chart',
            colspan: 2,
            config: {
              type: 'line',
              xAxis: 'date',
              yAxis: 'total',
            },
          },
        ],
      },
    },
    
    exportOptions: {
      formats: ['pdf', 'xlsx'],
      pdf: {
        orientation: 'landscape',
        includeCharts: true,
        headerText: 'Relatório de Vendas',
      },
    },
    
    schedule: {
      enabled: true,
      frequency: 'daily',
      time: '09:00',
      delivery: {
        method: 'email',
        recipients: ['gerencia@empresa.com'],
        subject: 'Relatório Diário de Vendas',
      },
      format: 'pdf',
    },
    
    permissions: {
      view: ['manager', 'sales'],
      edit: ['manager'],
      export: ['manager', 'sales'],
      schedule: ['manager'],
    },
    
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'admin',
    tags: ['vendas', 'diário', 'resumo'],
  },
];
```

### 7. 🚀 Sistema de Cache Inteligente

Sistema avançado de cache com estratégias múltiplas, invalidação automática e prefetch preditivo.

#### Arquitetura do Sistema

```typescript
// @core/cache/types/cache.types.ts

export type CacheStrategy = 
  | 'stale-while-revalidate'   // Serve stale, revalida em background
  | 'cache-first'              // Cache primeiro, fallback para network
  | 'network-first'            // Network primeiro, fallback para cache
  | 'cache-only'               // Apenas cache (offline)
  | 'network-only'             // Apenas network (sempre fresh)
  | 'no-cache';                // Sem cache

export type InvalidationTrigger = 
  | 'time'                     // TTL expirou
  | 'mutation'                 // Dados foram alterados
  | 'dependency'               // Dependência foi invalidada
  | 'manual'                   // Invalidação manual
  | 'tag';                     // Tag foi invalidada

export interface CacheConfig {
  // Estratégias por recurso
  strategies: Record<string, ResourceCacheConfig>;
  
  // Configuração global
  global: {
    enabled: boolean;
    maxSize: number;             // MB
    defaultTTL: number;          // segundos
    compression: boolean;
    encryption: boolean;
  };
  
  // Invalidação
  invalidation: {
    rules: InvalidationRule[];
    cascading: boolean;          // Invalidação em cascata
    batch: boolean;              // Agrupa invalidações
  };
  
  // Prefetch
  prefetch: {
    enabled: boolean;
    rules: PrefetchRule[];
    maxConcurrent: number;
    priority: 'idle' | 'low' | 'normal' | 'high';
  };
  
  // Analytics
  analytics: {
    enabled: boolean;
    hitRateThreshold: number;    // % mínima de hit rate
    reportInterval: number;      // segundos
  };
}

export interface ResourceCacheConfig {
  // Estratégia base
  strategy: CacheStrategy;
  
  // TTL
  ttl: number;                   // segundos
  staleTtl?: number;            // Para stale-while-revalidate
  
  // Tamanho
  maxSize?: number;             // Número de entries
  maxAge?: number;              // Idade máxima em ms
  
  // Chaves
  keyGenerator?: (params: any) => string;
  
  // Serialização
  serialize?: (data: any) => string;
  deserialize?: (data: string) => any;
  
  // Contexto
  contextual?: {
    user: boolean;              // Cache por usuário
    role: boolean;              // Cache por role
    tenant: boolean;            // Cache por tenant
  };
  
  // Condições
  condition?: (params: any) => boolean;
  
  // Tags para invalidação
  tags?: string[] | ((data: any) => string[]);
  
  // Dependências
  dependencies?: string[];
  
  // Background refresh
  backgroundRefresh?: {
    enabled: boolean;
    interval: number;           // segundos
    condition?: () => boolean;
  };
}

export interface InvalidationRule {
  id: string;
  name: string;
  
  // Trigger
  trigger: InvalidationTrigger;
  
  // Alvo da invalidação
  target: {
    type: 'key' | 'pattern' | 'tag' | 'all';
    value?: string | RegExp | string[];
  };
  
  // Condições
  conditions?: {
    mutations?: string[];        // Tipos de mutação que triggeram
    fields?: string[];          // Campos alterados
    context?: any;              // Contexto específico
  };
  
  // Comportamento
  behavior: {
    immediate: boolean;         // Invalida imediatamente
    cascade: boolean;           // Propaga para dependências
    notify: boolean;            // Notifica outros clientes
  };
  
  // Delay para batch invalidation
  delay?: number;
}

export interface PrefetchRule {
  id: string;
  name: string;
  
  // Gatilho
  trigger: {
    type: 'page-load' | 'user-action' | 'time' | 'scroll' | 'hover';
    selector?: string;          // CSS selector para hover/scroll
    delay?: number;             // ms
  };
  
  // O que prefetchar
  targets: PrefetchTarget[];
  
  // Condições
  conditions?: {
    userAgent?: RegExp;
    connection?: 'slow' | 'fast' | 'any';
    time?: { start: string; end: string }; // Horário do dia
    probability?: number;       // 0-1, chance de executar
  };
  
  // Prioridade
  priority: 'idle' | 'low' | 'normal' | 'high';
}

export interface PrefetchTarget {
  resource: string;
  params?: any;
  
  // Preditivo baseado em padrões
  prediction?: {
    model: 'markov' | 'collaborative' | 'content-based';
    confidence: number;         // 0-1
  };
}

export interface CacheEntry<T = any> {
  key: string;
  data: T;
  
  // Metadados
  createdAt: number;
  updatedAt: number;
  accessedAt: number;
  accessCount: number;
  
  // TTL
  ttl: number;
  expiresAt: number;
  isStale: boolean;
  
  // Tamanho
  size: number;               // bytes
  
  // Tags e dependências
  tags: string[];
  dependencies: string[];
  
  // Contexto
  context?: {
    userId?: string;
    role?: string;
    tenant?: string;
  };
  
  // Status
  status: 'fresh' | 'stale' | 'expired' | 'pending';
  
  // Estatísticas
  hitCount: number;
  lastHit: number;
}

export interface CacheStats {
  // Contadores
  hits: number;
  misses: number;
  hitRate: number;            // %
  
  // Tamanho
  totalSize: number;          // bytes
  entryCount: number;
  
  // Performance
  avgResponseTime: number;    // ms
  networkTime: number;        // ms
  cacheTime: number;          // ms
  
  // Por recurso
  byResource: Record<string, {
    hits: number;
    misses: number;
    hitRate: number;
    avgSize: number;
  }>;
  
  // Período
  startTime: number;
  endTime: number;
}
```

#### Cache Manager

```typescript
// @core/cache/CacheManager.ts

export class CacheManager {
  private config: CacheConfig;
  private stores: Map<string, CacheStore>;
  private stats: CacheStats;
  private invalidationQueue: InvalidationTask[];
  private prefetchQueue: PrefetchTask[];
  
  constructor(config: CacheConfig) {
    this.config = config;
    this.stores = new Map();
    this.stats = this.initStats();
    this.invalidationQueue = [];
    this.prefetchQueue = [];
    
    this.setupStores();
    this.startBackgroundTasks();
  }
  
  // ========== CACHE OPERATIONS ==========
  
  async get<T>(
    resource: string, 
    key: string, 
    fetcher?: () => Promise<T>
  ): Promise<T | null> {
    const store = this.getStore(resource);
    const config = this.config.strategies[resource];
    
    if (!config || config.strategy === 'no-cache') {
      return fetcher ? await fetcher() : null;
    }
    
    // Gerar chave contextual
    const contextualKey = this.generateContextualKey(resource, key, config);
    
    // Verificar condições
    if (config.condition && !config.condition({ key })) {
      return fetcher ? await fetcher() : null;
    }
    
    switch (config.strategy) {
      case 'cache-first':
        return await this.cacheFirst(store, contextualKey, fetcher);
        
      case 'network-first':
        return await this.networkFirst(store, contextualKey, fetcher);
        
      case 'stale-while-revalidate':
        return await this.staleWhileRevalidate(store, contextualKey, fetcher);
        
      case 'cache-only':
        return await store.get(contextualKey);
        
      case 'network-only':
        if (!fetcher) return null;
        const data = await fetcher();
        await this.set(resource, key, data);
        return data;
        
      default:
        return fetcher ? await fetcher() : null;
    }
  }
  
  async set<T>(
    resource: string, 
    key: string, 
    data: T, 
    customTTL?: number
  ): Promise<void> {
    const store = this.getStore(resource);
    const config = this.config.strategies[resource];
    
    if (!config || config.strategy === 'no-cache') {
      return;
    }
    
    const contextualKey = this.generateContextualKey(resource, key, config);
    const ttl = customTTL || config.ttl;
    
    // Gerar tags
    const tags = typeof config.tags === 'function' 
      ? config.tags(data) 
      : config.tags || [];
    
    const entry: CacheEntry<T> = {
      key: contextualKey,
      data,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      accessedAt: Date.now(),
      accessCount: 0,
      ttl,
      expiresAt: Date.now() + (ttl * 1000),
      isStale: false,
      size: this.calculateSize(data),
      tags,
      dependencies: config.dependencies || [],
      context: this.getCurrentContext(config),
      status: 'fresh',
      hitCount: 0,
      lastHit: Date.now(),
    };
    
    await store.set(contextualKey, entry);
    
    // Atualizar índices
    this.updateIndexes(resource, entry);
    
    // Agendar background refresh se configurado
    if (config.backgroundRefresh?.enabled) {
      this.scheduleBackgroundRefresh(resource, key, config);
    }
  }
  
  async delete(resource: string, key: string): Promise<void> {
    const store = this.getStore(resource);
    const config = this.config.strategies[resource];
    const contextualKey = this.generateContextualKey(resource, key, config);
    
    await store.delete(contextualKey);
    this.stats.entryCount--;
  }
  
  async clear(resource?: string): Promise<void> {
    if (resource) {
      const store = this.getStore(resource);
      await store.clear();
    } else {
      for (const store of this.stores.values()) {
        await store.clear();
      }
      this.stats = this.initStats();
    }
  }
  
  // ========== CACHE STRATEGIES ==========
  
  private async cacheFirst<T>(
    store: CacheStore,
    key: string,
    fetcher?: () => Promise<T>
  ): Promise<T | null> {
    // Tentar cache primeiro
    const cached = await store.get(key);
    
    if (cached && !this.isExpired(cached)) {
      this.recordHit(cached);
      return cached.data;
    }
    
    // Cache miss ou expirado
    this.recordMiss();
    
    if (!fetcher) return null;
    
    try {
      const data = await fetcher();
      // Não aguarda o set para não bloquear
      this.set(this.getResourceFromKey(key), this.getBaseKey(key), data)
        .catch(console.error);
      
      return data;
    } catch (error) {
      // Se network falhou e temos cache stale, use-o
      if (cached) {
        this.recordHit(cached);
        return cached.data;
      }
      throw error;
    }
  }
  
  private async networkFirst<T>(
    store: CacheStore,
    key: string,
    fetcher?: () => Promise<T>
  ): Promise<T | null> {
    if (!fetcher) {
      return await this.cacheFirst(store, key);
    }
    
    try {
      const data = await fetcher();
      
      // Atualizar cache em background
      this.set(this.getResourceFromKey(key), this.getBaseKey(key), data)
        .catch(console.error);
      
      return data;
    } catch (error) {
      // Network falhou, tentar cache
      const cached = await store.get(key);
      
      if (cached) {
        this.recordHit(cached);
        return cached.data;
      }
      
      this.recordMiss();
      throw error;
    }
  }
  
  private async staleWhileRevalidate<T>(
    store: CacheStore,
    key: string,
    fetcher?: () => Promise<T>
  ): Promise<T | null> {
    const cached = await store.get(key);
    
    if (cached) {
      this.recordHit(cached);
      
      // Se stale, revalidar em background
      if (this.isStale(cached) && fetcher) {
        // Não aguarda para não bloquear a resposta
        fetcher().then(data => {
          this.set(this.getResourceFromKey(key), this.getBaseKey(key), data)
            .catch(console.error);
        }).catch(console.error);
      }
      
      return cached.data;
    }
    
    // Cache miss
    this.recordMiss();
    
    if (!fetcher) return null;
    
    const data = await fetcher();
    await this.set(this.getResourceFromKey(key), this.getBaseKey(key), data);
    
    return data;
  }
  
  // ========== INVALIDATION ==========
  
  async invalidate(
    target: { type: 'key' | 'pattern' | 'tag'; value: string | RegExp },
    options: { immediate?: boolean; cascade?: boolean } = {}
  ): Promise<void> {
    const task: InvalidationTask = {
      id: generateId(),
      target,
      options: {
        immediate: options.immediate ?? true,
        cascade: options.cascade ?? true,
      },
      createdAt: Date.now(),
    };
    
    if (task.options.immediate) {
      await this.executeInvalidation(task);
    } else {
      this.invalidationQueue.push(task);
    }
  }
  
  async invalidateByTag(tag: string): Promise<void> {
    await this.invalidate({ type: 'tag', value: tag });
  }
  
  async invalidateByPattern(pattern: RegExp): Promise<void> {
    await this.invalidate({ type: 'pattern', value: pattern });
  }
  
  private async executeInvalidation(task: InvalidationTask): Promise<void> {
    const keysToInvalidate: string[] = [];
    
    switch (task.target.type) {
      case 'key':
        keysToInvalidate.push(task.target.value as string);
        break;
        
      case 'pattern':
        const pattern = task.target.value as RegExp;
        for (const store of this.stores.values()) {
          const keys = await store.keys();
          keysToInvalidate.push(...keys.filter(key => pattern.test(key)));
        }
        break;
        
      case 'tag':
        const tag = task.target.value as string;
        for (const store of this.stores.values()) {
          const entries = await store.getByTag(tag);
          keysToInvalidate.push(...entries.map(e => e.key));
        }
        break;
    }
    
    // Invalidar chaves
    for (const key of keysToInvalidate) {
      const [resource] = key.split(':');
      await this.delete(resource, key);
    }
    
    // Invalidação em cascata
    if (task.options.cascade) {
      for (const key of keysToInvalidate) {
        await this.cascadeInvalidation(key);
      }
    }
  }
  
  private async cascadeInvalidation(key: string): Promise<void> {
    // Encontrar entradas que dependem desta chave
    for (const store of this.stores.values()) {
      const entries = await store.getByDependency(key);
      
      for (const entry of entries) {
        const [resource] = entry.key.split(':');
        await this.delete(resource, entry.key);
        
        // Recursão para dependências das dependências
        await this.cascadeInvalidation(entry.key);
      }
    }
  }
  
  // ========== PREFETCH ==========
  
  async prefetch(resource: string, key: string): Promise<void> {
    const config = this.config.strategies[resource];
    if (!config) return;
    
    const task: PrefetchTask = {
      id: generateId(),
      resource,
      key,
      priority: 'low',
      createdAt: Date.now(),
    };
    
    this.prefetchQueue.push(task);
    this.processPrefetchQueue();
  }
  
  private async processPrefetchQueue(): Promise<void> {
    if (this.prefetchQueue.length === 0) return;
    
    // Ordenar por prioridade
    this.prefetchQueue.sort((a, b) => {
      const priorities = { high: 0, normal: 1, low: 2, idle: 3 };
      return priorities[a.priority] - priorities[b.priority];
    });
    
    const concurrentLimit = this.config.prefetch.maxConcurrent;
    const activeTasks = this.prefetchQueue.splice(0, concurrentLimit);
    
    await Promise.all(activeTasks.map(task => this.executePrefetch(task)));
  }
  
  private async executePrefetch(task: PrefetchTask): Promise<void> {
    // Verificar se ainda é necessário
    const cached = await this.get(task.resource, task.key);
    if (cached) return; // Já está em cache
    
    try {
      // Aqui você chamaria o fetcher específico do resource
      const fetcher = this.getFetcher(task.resource);
      if (fetcher) {
        await this.get(task.resource, task.key, () => fetcher(task.key));
      }
    } catch (error) {
      console.warn(`Prefetch failed for ${task.resource}:${task.key}`, error);
    }
  }
  
  // ========== UTILITIES ==========
  
  private generateContextualKey(
    resource: string, 
    key: string, 
    config: ResourceCacheConfig
  ): string {
    let contextualKey = `${resource}:${key}`;
    
    if (config.contextual) {
      const context = this.getCurrentContext(config);
      
      if (config.contextual.user && context.userId) {
        contextualKey += `:user:${context.userId}`;
      }
      
      if (config.contextual.role && context.role) {
        contextualKey += `:role:${context.role}`;
      }
      
      if (config.contextual.tenant && context.tenant) {
        contextualKey += `:tenant:${context.tenant}`;
      }
    }
    
    return contextualKey;
  }
  
  private getCurrentContext(config: ResourceCacheConfig): any {
    return {
      userId: getCurrentUser()?.id,
      role: getCurrentUser()?.role,
      tenant: getCurrentTenant()?.id,
    };
  }
  
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() > entry.expiresAt;
  }
  
  private isStale(entry: CacheEntry): boolean {
    const config = this.config.strategies[this.getResourceFromKey(entry.key)];
    if (!config.staleTtl) return this.isExpired(entry);
    
    const staleTime = entry.createdAt + (config.staleTtl * 1000);
    return Date.now() > staleTime;
  }
  
  getStats(): CacheStats {
    return { ...this.stats };
  }
  
  // ========== BACKGROUND TASKS ==========
  
  private startBackgroundTasks(): void {
    // Cleanup de entries expiradas
    setInterval(() => this.cleanup(), 60000); // 1 minuto
    
    // Processamento da fila de invalidação
    setInterval(() => this.processInvalidationQueue(), 5000); // 5 segundos
    
    // Processamento da fila de prefetch
    setInterval(() => this.processPrefetchQueue(), 10000); // 10 segundos
    
    // Relatório de estatísticas
    if (this.config.analytics.enabled) {
      setInterval(() => this.reportStats(), this.config.analytics.reportInterval * 1000);
    }
  }
  
  private async cleanup(): Promise<void> {
    for (const [resource, store] of this.stores) {
      await store.cleanup();
    }
  }
}
```

#### Configuração de Exemplo

```typescript
// config/cache.config.ts

export const cacheConfig: CacheConfig = {
  global: {
    enabled: true,
    maxSize: 100, // MB
    defaultTTL: 300, // 5 minutos
    compression: true,
    encryption: false,
  },
  
  strategies: {
    // Produtos - cache agressivo
    'products': {
      strategy: 'stale-while-revalidate',
      ttl: 3600, // 1 hora
      staleTtl: 1800, // 30 minutos
      maxSize: 1000,
      contextual: { user: false, role: true },
      tags: (product) => [`product:${product.id}`, `category:${product.categoryId}`],
      dependencies: ['categories'],
      backgroundRefresh: {
        enabled: true,
        interval: 1800, // 30 minutos
      },
    },
    
    // Pedidos - cache contextual por usuário
    'orders': {
      strategy: 'cache-first',
      ttl: 900, // 15 minutos
      contextual: { user: true, role: true },
      tags: (order) => [`order:${order.id}`, `customer:${order.customerId}`],
    },
    
    // Usuários - network first (dados críticos)
    'users': {
      strategy: 'network-first',
      ttl: 300, // 5 minutos
      contextual: { user: false, role: true },
      condition: (params) => params.includeProfile !== true,
    },
    
    // Relatórios - cache longo
    'reports': {
      strategy: 'cache-first',
      ttl: 7200, // 2 horas
      contextual: { user: true, role: true },
      tags: ['reports'],
    },
    
    // Configurações - sem cache (sempre fresh)
    'settings': {
      strategy: 'network-only',
      ttl: 0,
    },
  },
  
  invalidation: {
    cascading: true,
    batch: true,
    rules: [
      {
        id: 'product-mutation',
        name: 'Invalidar cache de produtos quando alterados',
        trigger: 'mutation',
        target: { type: 'tag', value: 'products' },
        conditions: {
          mutations: ['createProduct', 'updateProduct', 'deleteProduct'],
        },
        behavior: {
          immediate: true,
          cascade: true,
          notify: true,
        },
      },
      
      {
        id: 'category-cascade',
        name: 'Invalidar produtos quando categoria muda',
        trigger: 'mutation',
        target: { type: 'pattern', value: /^products:.*/ },
        conditions: {
          mutations: ['updateCategory'],
        },
        behavior: {
          immediate: false,
          cascade: true,
          notify: true,
        },
        delay: 5000, // 5 segundos para batch
      },
    ],
  },
  
  prefetch: {
    enabled: true,
    maxConcurrent: 3,
    priority: 'idle',
    rules: [
      {
        id: 'product-detail-hover',
        name: 'Prefetch detalhes do produto no hover',
        trigger: {
          type: 'hover',
          selector: '[data-product-id]',
          delay: 500,
        },
        targets: [
          {
            resource: 'products',
            prediction: {
              model: 'markov',
              confidence: 0.7,
            },
          },
        ],
        conditions: {
          connection: 'fast',
          probability: 0.3, // 30% de chance
        },
        priority: 'low',
      },
      
      {
        id: 'page-navigation',
        name: 'Prefetch páginas relacionadas',
        trigger: {
          type: 'page-load',
        },
        targets: [
          {
            resource: 'navigation',
            prediction: {
              model: 'collaborative',
              confidence: 0.5,
            },
          },
        ],
        priority: 'idle',
      },
    ],
  },
  
  analytics: {
    enabled: true,
    hitRateThreshold: 80, // %
    reportInterval: 300, // 5 minutos
  },
};
```

### 8. Sistema de Logs e Analytics

```typescript
// @services/analytics/

export interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
}

// Tracking de uso
// Métricas de performance
// Erros e exceções
// Funil de conversão
```

### 9. Sistema de Comentários/Notas

```typescript
// @services/comments/

export interface Comment {
  id: string;
  entityType: string;
  entityId: string;
  
  content: string;
  mentions: string[];        // @user
  attachments?: FileItem[];
  
  isInternal: boolean;       // Só para equipe
  isPinned: boolean;
  
  createdBy: string;
  createdAt: Date;
  
  replies?: Comment[];
}

// Comentários em qualquer entidade
// Menções a usuários
// Anexos
// Histórico de atividades
```

### 10. Sistema de Favoritos/Bookmarks

```typescript
// @services/favorites/

export interface Favorite {
  id: string;
  entityType: string;
  entityId: string;
  
  label?: string;
  color?: string;
  folder?: string;
  
  createdAt: Date;
}

// Acesso rápido a entidades
// Organização em pastas
// Sincronização entre dispositivos
```

---

## 📚 REFERÊNCIAS E RECURSOS

### Padrões Utilizados

1. **Composition Pattern** - Componentes compostos via configuração
2. **Render Props** - Para customização de cards
3. **Custom Hooks** - Para lógica reutilizável
4. **Provider Pattern** - Para contextos globais
5. **Factory Pattern** - Para criação de configurações

### Bibliotecas Recomendadas

| Biblioteca | Uso |
|------------|-----|
| `@tanstack/react-query` | Cache e fetch |
| `zustand` | Estado global leve |
| `date-fns` | Manipulação de datas |
| `react-dropzone` | Upload de arquivos |
| `@fullcalendar/react` | Calendário |
| `socket.io-client` | Real-time |

---

## ✅ PRÓXIMOS PASSOS

### Imediato (Esta Semana)

1. [ ] Aprovar este plano
2. [ ] Criar branch `feat/opensea-os-core`
3. [ ] Configurar aliases de import (@core, @services, @security)
4. [ ] Criar estrutura de pastas
5. [ ] Implementar EntityPageTemplate básico

### Curto Prazo (2 Semanas)

1. [ ] Migrar página de Templates como piloto
2. [ ] Implementar RBAC básico
3. [ ] Criar sistema de modais

### Médio Prazo (1 Mês)

1. [ ] Migrar todas as páginas de stock
2. [ ] Implementar notificações em tempo real
3. [ ] Criar File Manager

### Longo Prazo (2-3 Meses)

1. [ ] Sistema completo de calendário
2. [ ] Workflow de solicitações
3. [ ] Dashboard de administração

---

## 🎯 CONCLUSÃO

O **OpenSea OS** representa uma evolução significativa na arquitetura do sistema, transformando-o de um conjunto de páginas independentes em um verdadeiro **sistema operacional empresarial modular**.

### Benefícios Esperados

1. **Produtividade** - Novas páginas em 1h ao invés de 8h
2. **Manutenibilidade** - Correções em um lugar afetam todo o sistema
3. **Consistência** - UX idêntica em todas as interfaces
4. **Segurança** - RBAC granular e auditoria completa
5. **Escalabilidade** - Fácil adicionar novos módulos

### Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Quebra de funcionalidades existentes | Média | Alto | Migração incremental, testes |
| Complexidade excessiva | Baixa | Médio | Documentação, exemplos |
| Resistência à mudança | Baixa | Baixo | Treinamento, benefícios claros |

---

#### Hook useCacheManager

```typescript
// hooks/useCacheManager.ts

export function useCacheManager() {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [isEnabled, setIsEnabled] = useState(true);
  
  const cacheManager = useMemo(() => 
    new CacheManager(cacheConfig), []);
  
  // Wrapper para operações de cache com React Query
  const getCached = useCallback(async <T>(
    resource: string,
    key: string,
    queryFn?: () => Promise<T>,
    options?: { enabled?: boolean }
  ) => {
    if (!isEnabled || options?.enabled === false) {
      return queryFn ? await queryFn() : null;
    }
    
    return await cacheManager.get(resource, key, queryFn);
  }, [cacheManager, isEnabled]);
  
  const setCached = useCallback(async <T>(
    resource: string,
    key: string,
    data: T,
    ttl?: number
  ) => {
    if (!isEnabled) return;
    
    await cacheManager.set(resource, key, data, ttl);
  }, [cacheManager, isEnabled]);
  
  const invalidateCache = useCallback(async (
    target: { type: 'key' | 'pattern' | 'tag'; value: string | RegExp }
  ) => {
    await cacheManager.invalidate(target);
  }, [cacheManager]);
  
  const clearCache = useCallback(async (resource?: string) => {
    await cacheManager.clear(resource);
  }, [cacheManager]);
  
  const prefetchResource = useCallback(async (
    resource: string,
    key: string
  ) => {
    await cacheManager.prefetch(resource, key);
  }, [cacheManager]);
  
  // Estatísticas em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(cacheManager.getStats());
    }, 5000);
    
    return () => clearInterval(interval);
  }, [cacheManager]);
  
  return {
    // Operações
    get: getCached,
    set: setCached,
    invalidate: invalidateCache,
    clear: clearCache,
    prefetch: prefetchResource,
    
    // Estado
    stats,
    isEnabled,
    setIsEnabled,
    
    // Utilitários
    manager: cacheManager,
  };
}
```

#### Integração com TanStack Query

```typescript
// providers/QueryProvider.tsx

function QueryProvider({ children }: { children: ReactNode }) {
  const { get: getCached, set: setCached } = useCacheManager();
  
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Cache personalizado
        queryFn: async ({ queryKey, meta }) => {
          const [resource, ...params] = queryKey as string[];
          const key = params.join(':');
          
          // Usar cache inteligente se configurado
          if (meta?.useSmartCache) {
            return await getCached(resource, key, meta.fetcher);
          }
          
          // Fallback para fetcher padrão
          return meta?.fetcher ? await meta.fetcher() : null;
        },
        
        // Configurações padrão
        staleTime: 5 * 60 * 1000,    // 5 minutos
        gcTime: 10 * 60 * 1000,      // 10 minutos (cache time)
        retry: 3,
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
        
        // Network mode
        networkMode: 'offlineFirst',
      },
      
      mutations: {
        // Invalidação automática em mutações
        onSuccess: (data, variables, context) => {
          // Invalidar cache relacionado baseado em tags
          if (context?.invalidateTags) {
            context.invalidateTags.forEach(tag => {
              getCached.invalidate({ type: 'tag', value: tag });
            });
          }
        },
      },
    },
  });
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

#### Cache Performance Dashboard

```typescript
// components/admin/CachePerformanceDashboard.tsx

export function CachePerformanceDashboard() {
  const { stats, manager, isEnabled, setIsEnabled } = useCacheManager();
  const [selectedResource, setSelectedResource] = useState<string>('all');
  
  if (!stats) {
    return <LoadingSpinner />;
  }
  
  const hitRateColor = stats.hitRate >= 80 ? 'green' : 
                      stats.hitRate >= 60 ? 'yellow' : 'red';
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <PageHeader
          title="Performance do Cache"
          description="Monitoramento e configuração do sistema de cache inteligente"
        />
        
        <div className="flex items-center gap-4">
          <Switch
            checked={isEnabled}
            onCheckedChange={setIsEnabled}
          />
          <Label>Cache Ativo</Label>
          
          <Button
            variant="outline"
            onClick={() => manager.clear()}
          >
            Limpar Cache
          </Button>
        </div>
      </div>
      
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Hit Rate"
          value={`${stats.hitRate.toFixed(1)}%`}
          icon={Target}
          trend={{ value: 2.3, isPositive: true }}
          color={hitRateColor}
        />
        
        <StatsCard
          title="Total de Hits"
          value={stats.hits.toLocaleString()}
          icon={CheckCircle}
        />
        
        <StatsCard
          title="Cache Size"
          value={formatBytes(stats.totalSize)}
          icon={Database}
        />
        
        <StatsCard
          title="Tempo Médio"
          value={`${stats.avgResponseTime}ms`}
          icon={Clock}
        />
      </div>
      
      {/* Gráfico de Performance */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Performance por Recurso</CardTitle>
            
            <Select value={selectedResource} onValueChange={setSelectedResource}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Recursos</SelectItem>
                {Object.keys(stats.byResource).map(resource => (
                  <SelectItem key={resource} value={resource}>
                    {resource}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent>
          <CachePerformanceChart
            data={stats.byResource}
            selectedResource={selectedResource}
          />
        </CardContent>
      </Card>
      
      {/* Configuração por Recurso */}
      <Card>
        <CardHeader>
          <CardTitle>Configuração de Cache por Recurso</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {Object.entries(cacheConfig.strategies).map(([resource, config]) => (
              <ResourceCacheConfig
                key={resource}
                resource={resource}
                config={config}
                stats={stats.byResource[resource]}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ResourceCacheConfig({ 
  resource, 
  config, 
  stats 
}: {
  resource: string;
  config: ResourceCacheConfig;
  stats?: any;
}) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="font-semibold">{resource}</h4>
          <p className="text-sm text-muted-foreground">
            Estratégia: {config.strategy} | TTL: {config.ttl}s
          </p>
        </div>
        
        {stats && (
          <div className="text-right text-sm">
            <div>Hit Rate: {stats.hitRate.toFixed(1)}%</div>
            <div>Hits: {stats.hits} | Misses: {stats.misses}</div>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Max Size:</span>
          <div>{config.maxSize || 'Unlimited'}</div>
        </div>
        
        <div>
          <span className="text-muted-foreground">Contextual:</span>
          <div>
            {config.contextual ? 
              Object.entries(config.contextual)
                .filter(([_, enabled]) => enabled)
                .map(([key]) => key)
                .join(', ') || 'None'
              : 'None'
            }
          </div>
        </div>
        
        <div>
          <span className="text-muted-foreground">Tags:</span>
          <div>{Array.isArray(config.tags) ? config.tags.join(', ') : 'Dynamic'}</div>
        </div>
        
        <div>
          <span className="text-muted-foreground">Background:</span>
          <div>{config.backgroundRefresh?.enabled ? 'Enabled' : 'Disabled'}</div>
        </div>
      </div>
    </div>
  );
}
```

---

> **Documento criado em:** Janeiro 2025  
> **Última atualização:** 01 de Dezembro de 2025  
> **Autor:** OpenSea Development Team  
> **Versão:** 4.0.0

---

## 📋 CHANGELOG

### v4.5.0 (01/12/2025)
- 🎨 **CSS TOKEN SYSTEM v1.0** - Design System baseado em tokens CSS:
  - **Primitive Tokens** - Paleta de cores base (--os-blue-500, --os-gray-200, etc.)
  - **Semantic Tokens** - Cores com significado (--color-primary, --color-destructive)
  - **Component Tokens** - Tokens específicos (--btn-primary-bg, --card-border, --input-radius)
  - **State Tokens** - Estados consistentes (--state-disabled-opacity, --state-focus-ring-width)
- 🔄 **COMPONENTES ATUALIZADOS** - Migração para tokens:
  - Button, Card, Input, Badge, Progress, Textarea, Tabs, Skeleton
  - Eliminação de cores hardcoded (bg-blue-500 → bg-(--btn-primary-bg))
- 🌙 **SUPORTE A TEMAS** - Estrutura preparada para múltiplos temas
- 📐 **SPACING & SIZING TOKENS** - --radius-*, --transition-*, --z-*
- 📜 **DOCUMENTAÇÃO** - Seção completa de CSS Token System com exemplos

### v4.4.0 (01/12/2025)
- 🗺️ **ROADMAP DETALHADO COMPLETO** - Implementação passo-a-passo:
  - **Sprint 1: Foundation** - Estrutura de pastas, tipos base, selection, UniversalCard, EntityGrid
  - **Sprint 2: CRUD & Forms** - DynamicField, EntityForm, useEntityForm, useCrud, SimpleCrudPage
  - **Sprint 3: Segurança** - RBAC, PermissionGate, Guards, Audit Log, Undo/Redo
  - **Sprint 4: Serviços** - Batch Queue, Notifications, Search Global, Dashboard
  - **Sprint 5: Migração** - Conversão de páginas existentes para novo sistema
  - **Sprint 6: Finalização** - Testes, Storybook, Documentação
- ⏱️ **TEMPO ESTIMADO** - 12 semanas total com entregas incrementais
- 📋 **CHECKLISTS** - Validação detalhada por etapa
- 💻 **CÓDIGO COMPLETO** - ~2000 linhas de implementação pronta para copiar

### v4.3.0 (01/12/2025)
- ↩️ **SISTEMA UNDO/REDO** - Seção 7.2 com reversão de operações:
  - **UndoableAction** - Registro de ações reversíveis com snapshot
  - **useUndoRedo Hook** - Gerenciamento de undo/redo stacks
  - **UndoRedoToolbar** - UI flutuante com Ctrl+Z/Ctrl+Y
  - **TTL de 30 minutos** - Ações expiram automaticamente
  - **Integração com Queue Manager** - Undo de operações em lote
- 📜 **SISTEMA AUDIT LOG** - Seção 7.3 com histórico visual:
  - **AuditLogEntry** - Registro completo de operações
  - **AuditTimeline** - Visualização cronológica com diff de mudanças
  - **EntityHistoryTab** - Aba de histórico para qualquer entidade
  - **Filtros avançados** - Por categoria, usuário, período, severidade
  - **Export para compliance** - CSV, XLSX, JSON

### v4.2.0 (01/12/2025)
- 📋 **OPERAÇÕES EM MASSA COMPLETAS** - Seção 7.1 com especificação detalhada:
  - **MultiViewModal** - Visualização de múltiplos itens com navegação e comparação
  - **BulkEditModal** - Edição em massa com seleção de campos e comportamentos
  - **SelectionToolbar** - Barra de ações com permissões e limites por quantidade
  - **Matriz de Integração** - Todas as operações (View/Create/Edit/Delete) mapeadas
- 🔄 **QUEUE MANAGER OBRIGATÓRIO** - Regra: >1 item que modifica dados = Queue Manager
- 📊 **ÁRVORE DE DECISÃO** - Diagrama completo: quantos itens → qual componente usar
- 🔗 **useBulkEdit HOOK** - Hook para edição em massa via Queue Manager
- 🎯 **FLUXO COMPLETO** - Exemplos de Delete, Duplicate, Export, Import via Queue

### v4.1.0 (01/12/2025)
- 📑 **PADRÕES DE PÁGINA** - Dois tipos de CRUD padronizados:
  - **SimpleCrudPage** - Para entidades únicas (Categorias, Marcas, Tags)
  - **ChainedEntityPage** - Para entidades hierárquicas (Localizações, Produtos→Variantes→Itens)
- 🖼️ **MODAL-FIRST PRINCIPLE** - CRUD sempre via modal renderizando componente
- 🔄 **useSimpleCrud HOOK** - Hook padronizado para CRUD simples com 14 retornos
- 🔗 **useChainedEntity HOOK** - Hook para navegação hierárquica com breadcrumbs
- 📊 **EntityViewerModal** - Componente universal para visualização/edição em modal
- 🌳 **ÁRVORE DE DECISÃO** - Diagrama para escolher qual tipo de página usar
- 📝 **EXEMPLOS COMPLETOS** - CategoryConfig e LocationConfig como referências
- 🎯 **NAVEGAÇÃO PADRONIZADA** - Padrões de drill-down e breadcrumb

### v4.0.0 (01/12/2025)
- 🎨 **DESIGN SYSTEM COMPLETO** - Seção de princípios fundamentais do OpenSea OS
- 📋 **CONTRATOS DE API PADRONIZADOS** - 7 contratos universais para consistência 100%
- 🏗️ **HIERARQUIA DE COMPONENTES** - 5 níveis claros (Primitivos → Aplicação)
- 📦 **QUICK REFERENCE** - Matriz de consistência componente/hook/config/tipo/permissão
- 🔄 **IMPORTS PADRONIZADOS** - Guia completo de imports organizados por módulo
- 🚨 **ANTI-PATTERNS** - Documentação do que NÃO fazer com exemplos
- 🎯 **DESIGN TOKENS** - Spacing, radius, shadows, typography, colors, breakpoints
- 📐 **PADRÕES DE NOMENCLATURA** - Regras obrigatórias para componentes, hooks, configs, types
- ⚡ **EXEMPLO COMPLETO** - Criar nova entidade "Fornecedor" em 3 passos (~7 min)
- 🔧 **ESTADOS PADRONIZADOS** - Loading, Empty, Error states consistentes

### v3.1.0 (26/11/2025)
- ⚡ Adicionado Sistema de Import/Export Universal com wizard e validação (`@core/import-export/`)
- 📊 Adicionado Sistema de Relatórios com builder visual e agendamento (`@services/reports/`)
- 🚀 Adicionado Sistema de Cache Inteligente com stale-while-revalidate (`@core/cache/`)
- 🔧 Implementada integração completa com TanStack Query
- 📈 Adicionado dashboard de performance de cache
- 🎯 Configurações de prefetch preditivo baseado em comportamento do usuário
- 📝 Especificações detalhadas com exemplos de código completos

### v3.0.0 (26/11/2025)
- ➕ Adicionado Sistema de Formulários padronizado (`@core/forms/`)
- ➕ Adicionado Sistema de Abas (`@core/tabs/`)
- ➕ Adicionado Sistema CRUD completo (`@core/crud/`)
- ➕ Adicionado Sistema de Dashboard (`@core/dashboard/`)
- ➕ Adicionado Sistema de Busca Avançada (`@core/search/`)
- ➕ Adicionadas 10 melhorias extras (temas, onboarding, atalhos, etc.)
- 📝 Atualizado plano de migração com cronograma detalhado
- 📝 Atualizada estrutura de pastas com novos módulos
- 📝 Adicionados mais exemplos de código

### v2.0.0 (Janeiro 2025)
- 🚀 Versão inicial do OpenSea OS
- ➕ Sistema de arquivos, calendário, notificações
- ➕ Sistema RBAC
- ➕ Sistema de batch processing
