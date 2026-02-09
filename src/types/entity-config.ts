import { ReactNode } from 'react';

// ==================== FORM TYPES ====================

/**
 * Configuração de campo de formulário
 */
export interface FormFieldConfig {
  name: string;
  label: string;
  type:
    | 'text'
    | 'number'
    | 'textarea'
    | 'date'
    | 'select'
    | 'switch'
    | 'checkbox'
    | 'file'
    | 'color';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: Array<{ label: string; value: string | number }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (value: unknown) => boolean | string;
  };
  description?: string;
  defaultValue?: unknown;
  className?: string;
}

/**
 * Configuração de gerenciador de atributos
 */
export interface AttributeConfig {
  singular: string; // "Atributo"
  plural: string; // "Atributos"
  keyLabel: string; // "Chave"
  valueLabel: string; // "Valor"
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  maxAttributes?: number;
  allowDuplicateKeys?: boolean;
}

/**
 * Seção de formulário com campos
 */
export interface FormSection<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  title?: string;
  description?: string;
  fields: FormFieldConfig[];
}

/**
 * Tab de formulário com seções ou atributos
 */
export interface FormTab {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  sections: FormSection[];
  attributes?: AttributeConfig; // Para seções com atributos dinâmicos
}

/**
 * Configuração completa do formulário de entidade
 */
export interface EntityFormConfig<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  entity: string; // "Template", "Produto", etc.
  tabs?: FormTab[]; // Se usar abas
  sections?: FormSection<T>[]; // Se não usar abas
  onSubmit: (data: T) => Promise<void>;
  defaultValues?: T;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  loading?: boolean;
}

/**
 * Referência exposta pelo EntityForm
 */
export interface EntityFormRef {
  submit: () => Promise<void>;
  getData: () => Record<string, unknown>;
  reset: () => void;
  setFieldValue: (name: string, value: unknown) => void;
}

// ==================== VIEWER TYPES ====================

/**
 * Configuração de campo de visualização
 */
export interface ViewFieldConfig {
  label: string;
  value: unknown;
  type?: 'text' | 'date' | 'badge' | 'list' | 'custom';
  render?: (value: unknown) => ReactNode;
  className?: string;
}

/**
 * Seção de visualização com campos
 */
export interface ViewSection {
  title?: string;
  fields: ViewFieldConfig[];
}

/**
 * Tab de visualização com seções
 */
export interface ViewTab {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  sections: ViewSection[];
}

/**
 * Configuração completa do visualizador de entidade
 */
export interface EntityViewerConfig {
  entity: string;
  data: Record<string, unknown>;
  tabs?: ViewTab[];
  sections?: ViewSection[];
  layout?: 'card' | 'list' | 'grid';
  onEdit?: () => void;
  editLabel?: string;
  allowEdit?: boolean;
}

// ==================== MODAL TYPES ====================

/**
 * Configuração do modal multi-visualização
 */
export interface MultiViewModalConfig<T = unknown> {
  entity: string; // "Template", "Produto", etc.
  entityPlural: string; // "Templates", "Produtos", etc.
  items: T[]; // Entidades abertas
  activeId: string | null; // ID da entidade ativa
  onActiveChange: (id: string) => void;
  onClose: (id: string) => void;
  onCloseAll: () => void;

  // Configuração de visualização
  viewerConfig: (item: T) => EntityViewerConfig;
  formConfig: (item: T) => EntityFormConfig;

  // Modo de comparação
  compareEnabled?: boolean;
  compareConfig?: {
    maxItems?: number;
    fields?: string[]; // Campos a comparar
  };

  // Busca
  searchEnabled?: boolean;
  searchConfig?: {
    onSearch: (query: string) => Promise<T[]>;
    onSelect: (item: T) => void;
    placeholder?: string;
    renderResult?: (item: T) => ReactNode;
  };

  // Callbacks
  onSave?: (id: string, data: Record<string, unknown>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

// ==================== PAGE COMPONENT TYPES ====================

/**
 * Configuração de card de entidade
 */
export interface EntityCardConfig<T = unknown> {
  entity: T;
  title: string;
  subtitle?: string;
  description?: string;
  badges?: Array<{ label: string; variant?: string }>;
  actions?: Array<{
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: (entity: T) => void;
    variant?: 'default' | 'destructive' | 'outline' | 'ghost';
  }>;
  onSelect?: (entity: T) => void;
  selected?: boolean;
  renderFooter?: (entity: T) => ReactNode;
}

/**
 * Configuração de grid de entidades
 */
export interface EntityGridConfig<T = unknown> {
  entities: T[];
  loading?: boolean;
  error?: string;
  renderCard: (entity: T) => ReactNode;
  emptyState?: {
    title: string;
    description?: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
  onLoadMore?: () => void;
  hasMore?: boolean;
}

/**
 * Configuração de cabeçalho de página
 */
export interface PageHeaderConfig {
  title: string;
  description?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  actions?: Array<{
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: () => void;
    variant?: 'default' | 'outline';
  }>;
  filters?: ReactNode;
}

/**
 * Configuração de seção de busca
 */
export interface SearchSectionConfig {
  placeholder: string;
  onSearch: (query: string) => void;
  filters?: Array<{
    name: string;
    label: string;
    type: 'select' | 'checkbox' | 'date-range';
    options?: Array<{ label: string; value: string }>;
  }>;
  onFilterChange?: (filters: Record<string, unknown>) => void;
  showAdvanced?: boolean;
}
