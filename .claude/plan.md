# Plano de Padronização: Módulos HR do OpenSea OS

## Visão Geral

Este plano detalha a refatoração e padronização dos módulos HR (Companies, Departments, Positions, Employees) do OpenSea OS, abordando:

1. **Componentização** - Componentes reutilizáveis e bem organizados
2. **Estrutura de Páginas** - Templates padronizados para diferentes tipos de página
3. **API Layer** - Queries organizadas com TanStack Query e caching
4. **Sistema de Permissões** - Controle de acesso granular baseado em RBAC
5. **Error Handling** - Tratamento robusto de erros
6. **Design System** - Temas e tokens de estilo organizados
7. **Limpeza** - Remoção de código não utilizado

---

## FASE 1: ESTRUTURA DE DIRETÓRIOS

### 1.1 Nova Estrutura de Módulo HR

```
src/app/(dashboard)/hr/
├── _shared/                           # Componentes compartilhados do módulo HR
│   ├── components/
│   │   ├── hr-filter-bar.tsx         # Filtros específicos de HR
│   │   ├── hr-stats-card.tsx         # Card de estatísticas HR
│   │   └── index.ts
│   ├── hooks/
│   │   ├── use-hr-filters.ts         # Hook de filtros HR
│   │   └── index.ts
│   └── constants/
│       ├── hr-permissions.ts         # Constantes de permissões HR
│       └── index.ts
│
├── companies/
│   ├── page.tsx                      # Página de listagem (usa template)
│   ├── [id]/
│   │   ├── page.tsx                  # Página de detalhes (usa template)
│   │   └── edit/
│   │       └── page.tsx              # Página de edição (usa template)
│   └── src/
│       ├── api/                      # Queries organizadas
│       │   ├── list-companies.query.ts
│       │   ├── get-company.query.ts
│       │   ├── create-company.mutation.ts
│       │   ├── update-company.mutation.ts
│       │   ├── delete-company.mutation.ts
│       │   ├── list-addresses.query.ts
│       │   ├── list-cnaes.query.ts
│       │   ├── list-stakeholders.query.ts
│       │   ├── get-fiscal-settings.query.ts
│       │   ├── keys.ts               # Query keys centralizadas
│       │   └── index.ts
│       ├── components/               # Componentes locais
│       │   ├── company-card.tsx
│       │   ├── company-detail-header.tsx
│       │   ├── company-info-section.tsx
│       │   ├── tabs/
│       │   │   ├── general-tab.tsx
│       │   │   ├── team-tab.tsx
│       │   │   ├── cnaes-tab.tsx
│       │   │   ├── fiscal-tab.tsx
│       │   │   └── index.ts
│       │   └── index.ts
│       ├── modals/
│       │   ├── create-modal.tsx
│       │   ├── edit-modal.tsx
│       │   ├── view-modal.tsx
│       │   ├── delete-confirm-modal.tsx
│       │   ├── cnpj-lookup-modal.tsx
│       │   └── index.ts
│       ├── schemas/                  # Validação com Zod
│       │   ├── company.schema.ts
│       │   └── index.ts
│       ├── config/
│       │   └── companies.config.ts
│       ├── types/
│       │   └── index.ts
│       └── index.ts
│
├── departments/                      # Mesma estrutura
├── positions/                        # Mesma estrutura
└── employees/                        # Mesma estrutura
```

### 1.2 Nova Estrutura de Componentes Globais

```
src/components/
├── layout/                           # Componentes de layout
│   ├── page-layout.tsx              # Layout base de página
│   ├── header.tsx                   # Cabeçalho de página
│   ├── search-bar.tsx               # Barra de busca
│   └── types/
│
├── templates/                        # Templates de página (NOVO)
│   ├── list-page-template.tsx       # Template para páginas de listagem
│   ├── detail-page-template.tsx     # Template para páginas de detalhes
│   ├── edit-page-template.tsx       # Template para páginas de edição
│   ├── cascading-detail-template.tsx # Template para detalhes em cascata
│   └── index.ts
│
├── handlers/                         # Handlers de estado
│   ├── grid-error.tsx
│   ├── grid-loading.tsx
│   ├── grid-empty.tsx
│   └── types/
│
├── shared/                           # Componentes compartilhados
│   ├── cards/
│   ├── filters/
│   ├── modals/
│   └── timeline/
│
├── errors/                           # Sistema de erros (NOVO)
│   ├── error-boundary.tsx           # Error Boundary global
│   ├── api-error-handler.tsx        # Handler de erros de API
│   ├── form-error-display.tsx       # Display de erros em formulários
│   └── types/
│
└── ui/                              # Componentes UI (shadcn)
```

---

## FASE 2: SISTEMA DE API COM TANSTACK QUERY

### 2.1 Estrutura de Query Keys

```typescript
// src/app/(dashboard)/hr/companies/src/api/keys.ts

/**
 * Query keys para o módulo Companies
 * Seguindo o padrão de factory functions para type-safety
 */
export const companyKeys = {
  /** Todas as queries de companies */
  all: ['companies'] as const,

  /** Lista de companies com filtros opcionais */
  lists: () => [...companyKeys.all, 'list'] as const,
  list: (filters?: CompanyFilters) => [...companyKeys.lists(), filters] as const,

  /** Company específica por ID */
  details: () => [...companyKeys.all, 'detail'] as const,
  detail: (id: string) => [...companyKeys.details(), id] as const,

  /** Sub-recursos de uma company */
  addresses: (companyId: string) => [...companyKeys.detail(companyId), 'addresses'] as const,
  cnaes: (companyId: string) => [...companyKeys.detail(companyId), 'cnaes'] as const,
  stakeholders: (companyId: string) => [...companyKeys.detail(companyId), 'stakeholders'] as const,
  fiscalSettings: (companyId: string) => [...companyKeys.detail(companyId), 'fiscal-settings'] as const,
} as const;
```

### 2.2 Padrão de Query

```typescript
// src/app/(dashboard)/hr/companies/src/api/list-companies.query.ts

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { companiesService } from '@/services/hr/companies.service';
import type { Company } from '@/types/hr';
import { companyKeys } from './keys';

/**
 * Parâmetros para listar empresas
 */
export interface ListCompaniesParams {
  page?: number;
  perPage?: number;
  search?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  includeDeleted?: boolean;
}

/**
 * Resposta da listagem de empresas
 */
export interface ListCompaniesResponse {
  companies: Company[];
  total: number;
  page: number;
  perPage: number;
}

/**
 * Hook para listar empresas
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useListCompanies({
 *   search: 'acme',
 *   status: 'ACTIVE'
 * });
 * ```
 */
export function useListCompanies(
  params?: ListCompaniesParams,
  options?: Omit<UseQueryOptions<ListCompaniesResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: companyKeys.list(params),
    queryFn: async () => {
      const response = await companiesService.listCompanies(params);

      // Normalizar resposta
      const companies = Array.isArray(response)
        ? response
        : response.companies || [];

      return {
        companies: companies.filter((c: Company) => !c.deletedAt),
        total: companies.length,
        page: params?.page || 1,
        perPage: params?.perPage || 100,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    ...options,
  });
}
```

### 2.3 Padrão de Mutation

```typescript
// src/app/(dashboard)/hr/companies/src/api/create-company.mutation.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { companiesService } from '@/services/hr/companies.service';
import type { CreateCompanyData, Company } from '@/types/hr';
import { companyKeys } from './keys';
import { toast } from 'sonner';
import { translateError } from '@/lib/error-messages';

/**
 * Opções para a mutation de criação de empresa
 */
export interface CreateCompanyOptions {
  /** Callback executado após sucesso */
  onSuccess?: (company: Company) => void;
  /** Callback executado após erro */
  onError?: (error: Error) => void;
  /** Se deve mostrar toast de sucesso */
  showSuccessToast?: boolean;
  /** Se deve mostrar toast de erro */
  showErrorToast?: boolean;
}

/**
 * Hook para criar uma nova empresa
 *
 * @example
 * ```tsx
 * const { mutate: createCompany, isPending } = useCreateCompany({
 *   onSuccess: (company) => router.push(`/hr/companies/${company.id}`),
 * });
 *
 * createCompany({ legalName: 'Acme Corp', cnpj: '12345678000100' });
 * ```
 */
export function useCreateCompany(options: CreateCompanyOptions = {}) {
  const queryClient = useQueryClient();
  const {
    onSuccess,
    onError,
    showSuccessToast = true,
    showErrorToast = true,
  } = options;

  return useMutation({
    mutationFn: (data: CreateCompanyData) => companiesService.createCompany(data),
    onSuccess: (company) => {
      // Invalidar cache de listagem
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });

      if (showSuccessToast) {
        toast.success(`Empresa "${company.legalName}" criada com sucesso!`);
      }

      onSuccess?.(company);
    },
    onError: (error: Error) => {
      if (showErrorToast) {
        toast.error(translateError(error));
      }

      onError?.(error);
    },
  });
}
```

---

## FASE 3: TEMPLATES DE PÁGINA

### 3.1 Template de Página de Listagem

```typescript
// src/components/templates/list-page-template.tsx

import { ReactNode, useMemo } from 'react';
import { PageLayout } from '@/components/layout/page-layout';
import { Header, type HeaderButton } from '@/components/layout/header';
import { SearchBar } from '@/components/layout/search-bar';
import { GridError } from '@/components/handlers/grid-error';
import { GridLoading } from '@/components/handlers/grid-loading';
import { GridEmpty } from '@/components/handlers/grid-empty';
import {
  CoreProvider,
  EntityGrid,
  SelectionToolbar,
} from '@/core';
import type { EntityConfig } from '@/core/types';
import { usePermissions } from '@/hooks/use-permissions';

/**
 * Props do template de página de listagem
 */
export interface ListPageTemplateProps<T extends { id: string }> {
  /** Título da página */
  title: string;
  /** Descrição da página */
  description?: string;
  /** Configuração da entidade */
  config: EntityConfig<T>;
  /** Itens a serem exibidos */
  items: T[];
  /** Estado de carregamento */
  isLoading: boolean;
  /** Erro, se houver */
  error?: Error | null;
  /** Query de busca atual */
  searchQuery: string;
  /** Callback para mudança na busca */
  onSearchChange: (query: string) => void;
  /** Callback para recarregar dados */
  onRefetch: () => void;

  // Permissões
  /** Permissão necessária para criar */
  createPermission?: string;
  /** Permissão necessária para editar */
  editPermission?: string;
  /** Permissão necessária para excluir */
  deletePermission?: string;

  // Callbacks de ação
  /** Callback para criar novo item */
  onCreate?: () => void;
  /** Callback para visualizar item */
  onView?: (item: T) => void;
  /** Callback para editar item */
  onEdit?: (item: T) => void;
  /** Callback para excluir itens */
  onDelete?: (ids: string[]) => void;

  // Renderização customizada
  /** Função para renderizar card em modo grid */
  renderGridCard: (item: T, isSelected: boolean) => ReactNode;
  /** Função para renderizar card em modo lista */
  renderListCard: (item: T, isSelected: boolean) => ReactNode;
  /** Botões adicionais no header */
  headerButtons?: HeaderButton[];
  /** Componentes adicionais (filtros, etc) */
  children?: ReactNode;
}

/**
 * Template para páginas de listagem de entidades
 *
 * @example
 * ```tsx
 * <ListPageTemplate
 *   title="Empresas"
 *   description="Gerencie as empresas cadastradas"
 *   config={companiesConfig}
 *   items={companies}
 *   isLoading={isLoading}
 *   createPermission="hr.companies.create"
 *   onCreate={() => setIsCreateModalOpen(true)}
 *   renderGridCard={(company, isSelected) => (
 *     <CompanyCard company={company} isSelected={isSelected} />
 *   )}
 * />
 * ```
 */
export function ListPageTemplate<T extends { id: string }>({
  title,
  description,
  config,
  items,
  isLoading,
  error,
  searchQuery,
  onSearchChange,
  onRefetch,
  createPermission,
  editPermission,
  deletePermission,
  onCreate,
  onView,
  onEdit,
  onDelete,
  renderGridCard,
  renderListCard,
  headerButtons: additionalButtons = [],
  children,
}: ListPageTemplateProps<T>) {
  const { hasPermission } = usePermissions();

  // Verificar permissões
  const canCreate = createPermission ? hasPermission(createPermission) : true;
  const canEdit = editPermission ? hasPermission(editPermission) : true;
  const canDelete = deletePermission ? hasPermission(deletePermission) : true;

  // Montar botões do header
  const headerButtons = useMemo(() => {
    const buttons: HeaderButton[] = [...additionalButtons];

    if (canCreate && onCreate) {
      buttons.unshift({
        id: 'create',
        title: `Novo ${config.display.name.singular}`,
        icon: Plus,
        onClick: onCreate,
        variant: 'default',
      });
    }

    return buttons;
  }, [additionalButtons, canCreate, onCreate, config]);

  const itemIds = useMemo(() => items.map(i => i.id), [items]);

  // Render de estados
  if (isLoading) {
    return (
      <PageLayout>
        <Header title={title} description={description} />
        <GridLoading count={9} layout="grid" />
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <Header title={title} description={description} />
        <GridError
          type="server"
          title={`Erro ao carregar ${config.display.name.plural.toLowerCase()}`}
          action={{ label: 'Tentar Novamente', onClick: onRefetch }}
        />
      </PageLayout>
    );
  }

  return (
    <CoreProvider selection={{ namespace: config.api.basePath, initialIds: itemIds }}>
      <PageLayout>
        <Header title={title} description={description} buttons={headerButtons} />

        <SearchBar
          placeholder={config.display.labels.searchPlaceholder}
          value={searchQuery}
          onSearch={onSearchChange}
        />

        {children}

        {items.length === 0 ? (
          <GridEmpty
            title={`Nenhum ${config.display.name.singular.toLowerCase()} encontrado`}
            description={searchQuery
              ? 'Tente ajustar os filtros de busca'
              : `Crie seu primeiro ${config.display.name.singular.toLowerCase()}`
            }
            action={canCreate && onCreate ? {
              label: `Criar ${config.display.name.singular}`,
              onClick: onCreate,
            } : undefined}
          />
        ) : (
          <EntityGrid
            config={config}
            items={items}
            renderGridItem={renderGridCard}
            renderListItem={renderListCard}
          />
        )}

        <SelectionToolbar
          selectedIds={[]}
          totalItems={items.length}
          defaultActions={{
            view: !!onView,
            edit: canEdit && !!onEdit,
            delete: canDelete && !!onDelete,
          }}
        />
      </PageLayout>
    </CoreProvider>
  );
}
```

### 3.2 Template de Página de Detalhes

```typescript
// src/components/templates/detail-page-template.tsx

/**
 * Template para páginas de detalhes de entidade
 * Suporta tabs, seções colapsáveis, e dados relacionados
 */
export interface DetailPageTemplateProps<T> {
  /** Entidade sendo visualizada */
  entity: T | null;
  /** Estado de carregamento */
  isLoading: boolean;
  /** Erro, se houver */
  error?: Error | null;
  /** Configuração de tabs */
  tabs?: TabConfig[];
  /** Callback para voltar */
  onBack: () => void;
  /** Callback para editar */
  onEdit?: () => void;
  /** Callback para excluir */
  onDelete?: () => void;
  /** Permissão para editar */
  editPermission?: string;
  /** Permissão para excluir */
  deletePermission?: string;
  /** Componente de header customizado */
  headerComponent?: ReactNode;
  /** Children são renderizados no conteúdo principal */
  children?: ReactNode;
}
```

---

## FASE 4: ERROR HANDLING ROBUSTO

### 4.1 Error Boundary Global

```typescript
// src/components/errors/error-boundary.tsx

'use client';

import { Component, type ReactNode, type ErrorInfo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary para capturar erros de renderização
 *
 * @example
 * ```tsx
 * <ErrorBoundary onError={(err) => logError(err)}>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <Card className="max-w-md w-full p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
            </div>

            <h2 className="text-xl font-bold mb-2">Algo deu errado</h2>
            <p className="text-muted-foreground mb-6">
              Ocorreu um erro inesperado. Por favor, tente novamente.
            </p>

            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => window.location.href = '/'}>
                <Home className="w-4 h-4 mr-2" />
                Início
              </Button>
              <Button onClick={this.handleRetry}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar Novamente
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 4.2 API Error Handler

```typescript
// src/lib/errors/api-error.ts

/**
 * Tipos de erro de API
 */
export type ApiErrorType =
  | 'VALIDATION'
  | 'AUTHENTICATION'
  | 'AUTHORIZATION'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMIT'
  | 'SERVER'
  | 'NETWORK'
  | 'TIMEOUT'
  | 'UNKNOWN';

/**
 * Classe de erro de API tipada
 */
export class ApiError extends Error {
  readonly type: ApiErrorType;
  readonly status: number;
  readonly code?: string;
  readonly details?: Record<string, unknown>;
  readonly originalError?: Error;

  constructor(options: {
    message: string;
    type: ApiErrorType;
    status: number;
    code?: string;
    details?: Record<string, unknown>;
    originalError?: Error;
  }) {
    super(options.message);
    this.name = 'ApiError';
    this.type = options.type;
    this.status = options.status;
    this.code = options.code;
    this.details = options.details;
    this.originalError = options.originalError;
  }

  /**
   * Cria um ApiError a partir de uma resposta HTTP
   */
  static fromResponse(response: Response, data?: unknown): ApiError {
    const errorData = data as Record<string, unknown> | undefined;

    const type = ApiError.getTypeFromStatus(response.status);
    const message =
      (errorData?.message as string) ||
      (errorData?.error as string) ||
      response.statusText ||
      'Ocorreu um erro inesperado';

    return new ApiError({
      message,
      type,
      status: response.status,
      code: errorData?.code as string,
      details: errorData,
    });
  }

  /**
   * Determina o tipo de erro baseado no status HTTP
   */
  static getTypeFromStatus(status: number): ApiErrorType {
    if (status === 400) return 'VALIDATION';
    if (status === 401) return 'AUTHENTICATION';
    if (status === 403) return 'AUTHORIZATION';
    if (status === 404) return 'NOT_FOUND';
    if (status === 409) return 'CONFLICT';
    if (status === 429) return 'RATE_LIMIT';
    if (status >= 500) return 'SERVER';
    return 'UNKNOWN';
  }

  /**
   * Verifica se é um erro de rede
   */
  static isNetworkError(error: unknown): boolean {
    if (error instanceof Error) {
      return error.message === 'Failed to fetch' ||
             error.name === 'AbortError';
    }
    return false;
  }
}

/**
 * Hook para traduzir erros de API para mensagens amigáveis
 */
export function useApiErrorMessage() {
  return (error: unknown): string => {
    if (error instanceof ApiError) {
      switch (error.type) {
        case 'VALIDATION':
          return error.message || 'Dados inválidos. Verifique os campos.';
        case 'AUTHENTICATION':
          return 'Sessão expirada. Faça login novamente.';
        case 'AUTHORIZATION':
          return 'Você não tem permissão para esta ação.';
        case 'NOT_FOUND':
          return 'Recurso não encontrado.';
        case 'CONFLICT':
          return error.message || 'Este registro já existe.';
        case 'RATE_LIMIT':
          return 'Muitas requisições. Aguarde um momento.';
        case 'SERVER':
          return 'Erro no servidor. Tente novamente mais tarde.';
        case 'NETWORK':
          return 'Erro de conexão. Verifique sua internet.';
        case 'TIMEOUT':
          return 'A requisição demorou muito. Tente novamente.';
        default:
          return error.message || 'Ocorreu um erro inesperado.';
      }
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Ocorreu um erro inesperado.';
  };
}
```

### 4.3 Validação com Zod

```typescript
// src/app/(dashboard)/hr/companies/src/schemas/company.schema.ts

import { z } from 'zod';

/**
 * Schema de validação para CNPJ
 */
const cnpjSchema = z.string()
  .min(14, 'CNPJ deve ter 14 dígitos')
  .max(18, 'CNPJ inválido')
  .refine((val) => {
    const cleaned = val.replace(/\D/g, '');
    return cleaned.length === 14;
  }, 'CNPJ inválido');

/**
 * Schema de validação para criação de empresa
 */
export const createCompanySchema = z.object({
  legalName: z.string()
    .min(3, 'Razão social deve ter no mínimo 3 caracteres')
    .max(255, 'Razão social muito longa'),
  tradeName: z.string()
    .max(255, 'Nome fantasia muito longo')
    .optional()
    .nullable(),
  cnpj: cnpjSchema,
  stateRegistration: z.string().optional().nullable(),
  municipalRegistration: z.string().optional().nullable(),
  legalNature: z.string().optional().nullable(),
  taxRegime: z.enum(['SIMPLES', 'LUCRO_PRESUMIDO', 'LUCRO_REAL', 'IMUNE_ISENTA', 'OUTROS']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).default('ACTIVE'),
  email: z.string().email('E-mail inválido').optional().nullable(),
  phoneMain: z.string().optional().nullable(),
  phoneAlt: z.string().optional().nullable(),
  logoUrl: z.string().url('URL inválida').optional().nullable(),
});

/**
 * Schema de validação para atualização de empresa
 */
export const updateCompanySchema = createCompanySchema.partial();

/**
 * Tipos inferidos dos schemas
 */
export type CreateCompanyFormData = z.infer<typeof createCompanySchema>;
export type UpdateCompanyFormData = z.infer<typeof updateCompanySchema>;
```

---

## FASE 5: SISTEMA DE PERMISSÕES

### 5.1 Constantes de Permissões HR

```typescript
// src/app/(dashboard)/hr/_shared/constants/hr-permissions.ts

/**
 * Constantes de permissões do módulo HR
 * Formato: {module}.{entity}.{action}
 */
export const HR_PERMISSIONS = {
  COMPANIES: {
    LIST: 'hr.companies.list',
    VIEW: 'hr.companies.view',
    CREATE: 'hr.companies.create',
    UPDATE: 'hr.companies.update',
    DELETE: 'hr.companies.delete',
    EXPORT: 'hr.companies.export',
    IMPORT: 'hr.companies.import',
  },
  DEPARTMENTS: {
    LIST: 'hr.departments.list',
    VIEW: 'hr.departments.view',
    CREATE: 'hr.departments.create',
    UPDATE: 'hr.departments.update',
    DELETE: 'hr.departments.delete',
    EXPORT: 'hr.departments.export',
  },
  POSITIONS: {
    LIST: 'hr.positions.list',
    VIEW: 'hr.positions.view',
    CREATE: 'hr.positions.create',
    UPDATE: 'hr.positions.update',
    DELETE: 'hr.positions.delete',
    EXPORT: 'hr.positions.export',
  },
  EMPLOYEES: {
    LIST: 'hr.employees.list',
    VIEW: 'hr.employees.view',
    CREATE: 'hr.employees.create',
    UPDATE: 'hr.employees.update',
    DELETE: 'hr.employees.delete',
    EXPORT: 'hr.employees.export',
    TERMINATE: 'hr.employees.terminate',
    LINK_USER: 'hr.employees.link-user',
  },
} as const;

/**
 * Verifica se o usuário tem alguma permissão no módulo HR
 */
export function hasAnyHRPermission(hasPermission: (code: string) => boolean): boolean {
  return Object.values(HR_PERMISSIONS).some(entity =>
    Object.values(entity).some(permission => hasPermission(permission))
  );
}
```

### 5.2 Componente de Proteção por Permissão

```typescript
// src/components/auth/permission-gate.tsx

import { type ReactNode } from 'react';
import { usePermissions } from '@/hooks/use-permissions';

interface PermissionGateProps {
  /** Permissão necessária (ou array de permissões) */
  permission: string | string[];
  /** Se true, requer TODAS as permissões. Se false, apenas UMA */
  requireAll?: boolean;
  /** Conteúdo a exibir quando permitido */
  children: ReactNode;
  /** Conteúdo a exibir quando negado (opcional) */
  fallback?: ReactNode;
}

/**
 * Componente que renderiza children apenas se o usuário tem a permissão
 *
 * @example
 * ```tsx
 * // Permissão única
 * <PermissionGate permission="hr.companies.create">
 *   <CreateButton />
 * </PermissionGate>
 *
 * // Múltiplas permissões (OR)
 * <PermissionGate permission={['hr.companies.update', 'hr.companies.delete']}>
 *   <EditMenu />
 * </PermissionGate>
 *
 * // Múltiplas permissões (AND)
 * <PermissionGate permission={['hr.companies.view', 'hr.companies.update']} requireAll>
 *   <EditButton />
 * </PermissionGate>
 * ```
 */
export function PermissionGate({
  permission,
  requireAll = false,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { hasPermission, hasAllPermissions, hasAnyPermission, isLoading } = usePermissions();

  // Durante carregamento, não renderiza nada
  if (isLoading) {
    return null;
  }

  const permissions = Array.isArray(permission) ? permission : [permission];

  const hasAccess = requireAll
    ? hasAllPermissions(...permissions)
    : hasAnyPermission(...permissions);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
```

---

## FASE 6: DESIGN SYSTEM

### 6.1 Estrutura de Temas

```
src/styles/
├── tokens/
│   ├── colors.css              # Paleta de cores primitivas
│   ├── semantic.css            # Tokens semânticos (light/dark)
│   ├── components.css          # Tokens de componentes
│   ├── spacing.css             # Espaçamentos e tamanhos
│   └── index.css               # Exporta todos os tokens
│
├── themes/
│   ├── light.css               # Overrides para tema light
│   ├── dark.css                # Overrides para tema dark
│   └── index.css               # Exporta temas
│
└── globals.css                 # Importa tokens + temas + utilities
```

### 6.2 Design Tokens

```css
/* src/styles/tokens/colors.css */

:root {
  /* ===========================================
     PRIMITIVE TOKENS - Cores Base
     Usando paleta Tailwind como referência
     =========================================== */

  /* Neutros - Slate (tom azulado para elegância) */
  --color-slate-50: 248 250 252;
  --color-slate-100: 241 245 249;
  --color-slate-200: 226 232 240;
  --color-slate-300: 203 213 225;
  --color-slate-400: 148 163 184;
  --color-slate-500: 100 116 139;
  --color-slate-600: 71 85 105;
  --color-slate-700: 51 65 85;
  --color-slate-800: 30 41 59;
  --color-slate-900: 15 23 42;
  --color-slate-950: 2 6 23;

  /* Neutros - Gray (tom neutro puro) */
  --color-gray-50: 249 250 251;
  --color-gray-100: 243 244 246;
  --color-gray-200: 229 231 235;
  --color-gray-300: 209 213 219;
  --color-gray-400: 156 163 175;
  --color-gray-500: 107 114 128;
  --color-gray-600: 75 85 99;
  --color-gray-700: 55 65 81;
  --color-gray-800: 31 41 55;
  --color-gray-900: 17 24 39;
  --color-gray-950: 3 7 18;

  /* Primary - Blue */
  --color-blue-50: 239 246 255;
  --color-blue-100: 219 234 254;
  --color-blue-200: 191 219 254;
  --color-blue-300: 147 197 253;
  --color-blue-400: 96 165 250;
  --color-blue-500: 59 130 246;
  --color-blue-600: 37 99 235;
  --color-blue-700: 29 78 216;
  --color-blue-800: 30 64 175;
  --color-blue-900: 30 58 138;

  /* Destructive - Red */
  --color-red-50: 254 242 242;
  --color-red-100: 254 226 226;
  --color-red-200: 254 202 202;
  --color-red-300: 252 165 165;
  --color-red-400: 248 113 113;
  --color-red-500: 239 68 68;
  --color-red-600: 220 38 38;
  --color-red-700: 185 28 28;
  --color-red-800: 153 27 27;
  --color-red-900: 127 29 29;

  /* Success - Green */
  --color-green-50: 240 253 244;
  --color-green-100: 220 252 231;
  --color-green-200: 187 247 208;
  --color-green-300: 134 239 172;
  --color-green-400: 74 222 128;
  --color-green-500: 34 197 94;
  --color-green-600: 22 163 74;
  --color-green-700: 21 128 61;
  --color-green-800: 22 101 52;
  --color-green-900: 20 83 45;

  /* Warning - Amber/Orange */
  --color-amber-50: 255 251 235;
  --color-amber-100: 254 243 199;
  --color-amber-200: 253 230 138;
  --color-amber-300: 252 211 77;
  --color-amber-400: 251 191 36;
  --color-amber-500: 245 158 11;
  --color-amber-600: 217 119 6;
  --color-amber-700: 180 83 9;
  --color-amber-800: 146 64 14;
  --color-amber-900: 120 53 15;
}
```

---

## FASE 7: ORDEM DE EXECUÇÃO

### Etapa 1: Infraestrutura Base
1. [ ] Criar estrutura de pastas `src/styles/tokens/`
2. [ ] Migrar CSS do `globals.css` para arquivos de tokens
3. [ ] Criar componente `ErrorBoundary`
4. [ ] Criar classe `ApiError` e hook `useApiErrorMessage`

### Etapa 2: Sistema de API
5. [ ] Criar pasta `hr/_shared/` com constantes de permissões
6. [ ] Criar `keys.ts` para query keys do módulo companies
7. [ ] Criar queries: `list-companies.query.ts`, `get-company.query.ts`
8. [ ] Criar mutations: `create-company.mutation.ts`, etc.

### Etapa 3: Templates de Página
9. [ ] Criar `src/components/templates/list-page-template.tsx`
10. [ ] Criar `src/components/templates/detail-page-template.tsx`
11. [ ] Criar `PermissionGate` component

### Etapa 4: Refatorar Companies
12. [ ] Refatorar `companies/page.tsx` usando o template
13. [ ] Refatorar `companies/[id]/page.tsx` usando o template
14. [ ] Criar schemas Zod para companies
15. [ ] Adicionar validação nos formulários

### Etapa 5: Refatorar Outros Módulos
16. [ ] Aplicar padrão em `departments/`
17. [ ] Aplicar padrão em `positions/`
18. [ ] Aplicar padrão em `employees/`

### Etapa 6: Limpeza
19. [ ] Remover arquivos não utilizados
20. [ ] Remover services duplicados
21. [ ] Verificar e corrigir erros de lint
22. [ ] Verificar e corrigir erros de TypeScript

---

## VALIDAÇÃO FINAL

- [ ] `npm run lint` passa sem erros
- [ ] `npm run type-check` passa sem erros
- [ ] Todas as páginas HR carregam corretamente
- [ ] Permissões funcionam (botões somem quando não há permissão)
- [ ] Erros de API são tratados e exibidos corretamente
- [ ] Formulários validam dados antes de enviar
- [ ] Dark mode funciona corretamente
