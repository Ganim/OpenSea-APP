/**
 * OpenSea OS - Base Types
 * Tipos fundamentais do sistema
 */

// =============================================================================
// BASE ENTITY
// =============================================================================

/**
 * Interface base para todas as entidades do sistema
 * Toda entidade DEVE implementar esta interface
 */
export interface BaseEntity {
  id: string;
  createdAt: Date | string;
  updatedAt?: Date | string | null;
}

/**
 * Entidade com suporte a soft delete
 */
export interface SoftDeletableEntity extends BaseEntity {
  deletedAt?: Date | string | null;
}

/**
 * Entidade com suporte a hierarquia (parent/children)
 */
export interface HierarchicalEntity extends BaseEntity {
  parentId?: string | null;
}

/**
 * Entidade com suporte a ordenação
 */
export interface OrderableEntity extends BaseEntity {
  displayOrder?: number;
}

/**
 * Entidade com status ativo/inativo
 */
export interface ActivatableEntity extends BaseEntity {
  isActive: boolean;
}

/**
 * Entidade auditável (rastreia quem criou/atualizou)
 */
export interface AuditableEntity extends BaseEntity {
  createdBy?: string;
  updatedBy?: string;
}

// =============================================================================
// PAGINATION & QUERY
// =============================================================================

/**
 * Parâmetros de query para listagem
 */
export interface QueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, unknown>;
}

/**
 * Metadados de paginação
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Resposta paginada genérica
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// =============================================================================
// API RESPONSES
// =============================================================================

/**
 * Resposta de sucesso da API
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

/**
 * Resposta de erro da API
 */
export interface ApiError {
  message: string;
  code?: string;
  field?: string;
  details?: Record<string, unknown>;
}

/**
 * Resposta de erro completa
 */
export interface ApiErrorResponse {
  error: ApiError;
  errors?: ApiError[];
  success: false;
}

// =============================================================================
// BATCH OPERATIONS
// =============================================================================

/**
 * Resultado de operação individual em batch
 */
export interface BatchItemResult<T = unknown> {
  id: string;
  success: boolean;
  data?: T;
  error?: ApiError;
}

/**
 * Resultado completo de operação batch
 */
export interface BatchOperationResult<T = unknown> {
  total: number;
  successful: number;
  failed: number;
  results: BatchItemResult<T>[];
}

/**
 * Progresso de operação batch
 */
export interface BatchProgress {
  current: number;
  total: number;
  percentage: number;
  currentItemId?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  startedAt?: Date;
  estimatedEndAt?: Date;
}

// =============================================================================
// UI STATES
// =============================================================================

/**
 * Estados de loading para diferentes operações
 */
export interface LoadingStates {
  initial: boolean;
  fetching: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  batch: boolean;
}

/**
 * Estado de erro com contexto
 */
export interface ErrorState {
  message: string;
  code?: string;
  retryable?: boolean;
  action?: () => void;
}

// =============================================================================
// COMMON TYPES
// =============================================================================

/**
 * Opção genérica para selects/dropdowns
 */
export interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
  icon?: React.ReactNode;
  description?: string;
  group?: string;
}

/**
 * Breadcrumb item
 */
export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  current?: boolean;
}

/**
 * Action button configuration
 */
export interface ActionConfig {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  permission?: string;
  tooltip?: string;
  shortcut?: string;
}

/**
 * Context menu item
 */
export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
  separator?: boolean;
  shortcut?: string;
  permission?: string;
  children?: ContextMenuItem[];
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
}
