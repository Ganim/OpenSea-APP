/**
 * OpenSea OS - Viewer Types
 * Tipos para configuração de visualização de entidades
 */

import { ComponentType, ReactNode } from 'react';
import { BaseEntity } from './base.types';

// =============================================================================
// VIEWER CONFIG
// =============================================================================

/**
 * Configuração do visualizador de entidade
 */
export interface EntityViewerConfig<T extends BaseEntity = BaseEntity> {
  /** Seções do viewer */
  sections: ViewerSection<T>[];
  /** Mostrar header com título/subtitle */
  showHeader?: boolean;
  /** Mostrar breadcrumb */
  showBreadcrumb?: boolean;
  /** Mostrar botões de ação no header */
  showActions?: boolean;
  /** Layout padrão */
  layout?: 'default' | 'sidebar' | 'tabs';
  /** Sidebar position (se layout = 'sidebar') */
  sidebarPosition?: 'left' | 'right';
  /** Largura da sidebar */
  sidebarWidth?: string;
  /** Permitir edição */
  allowEdit?: boolean;
  /** Permitir exclusão */
  allowDelete?: boolean;
  /** Mostrar log de auditoria */
  showAuditLog?: boolean;
}

// =============================================================================
// VIEWER SECTION
// =============================================================================

/**
 * Seção do viewer
 */
export interface ViewerSection<T = unknown> {
  /** ID único da seção */
  id: string;
  /** Título da seção */
  title?: string;
  /** Descrição da seção */
  description?: string;
  /** Ícone da seção */
  icon?: ComponentType<{ className?: string }>;
  /** Tipo da seção */
  type: ViewerSectionType;
  /** Campos a exibir */
  fields?: ViewerField<T>[];
  /** Componente customizado */
  component?: ComponentType<ViewerSectionProps<T>>;
  /** Condição para exibir seção */
  showWhen?: (item: T) => boolean;
  /** Número de colunas para campos */
  columns?: 1 | 2 | 3 | 4;
  /** Seção colapsável */
  collapsible?: boolean;
  /** Iniciar colapsada */
  defaultCollapsed?: boolean;
  /** Props adicionais para componente customizado */
  componentProps?: Record<string, unknown>;
}

export type ViewerSectionType =
  | 'fields' // Lista de campos key-value
  | 'table' // Tabela de dados
  | 'timeline' // Timeline de eventos
  | 'gallery' // Galeria de imagens
  | 'stats' // Cards de estatísticas
  | 'chart' // Gráficos
  | 'relations' // Entidades relacionadas
  | 'audit' // Log de auditoria
  | 'custom'; // Componente customizado

// =============================================================================
// VIEWER FIELD
// =============================================================================

/**
 * Campo do viewer
 */
export interface ViewerField<T = unknown> {
  /** Campo do objeto */
  field: keyof T | string;
  /** Label do campo */
  label: string;
  /** Ícone do campo */
  icon?: ComponentType<{ className?: string }>;
  /** Formato de exibição */
  format?: ViewerFieldFormat;
  /** Colspan */
  colSpan?: 1 | 2 | 3 | 4;
  /** Função de renderização customizada */
  render?: (value: unknown, item: T) => ReactNode;
  /** Esconder se valor vazio */
  hideEmpty?: boolean;
  /** Valor padrão se vazio */
  emptyValue?: string;
  /** Copiar para clipboard */
  copyable?: boolean;
  /** Link externo */
  link?: boolean | ((value: unknown, item: T) => string);
}

export type ViewerFieldFormat =
  | 'text'
  | 'number'
  | 'currency'
  | 'percent'
  | 'date'
  | 'datetime'
  | 'time'
  | 'boolean'
  | 'badge'
  | 'tags'
  | 'email'
  | 'phone'
  | 'url'
  | 'code'
  | 'json'
  | 'markdown'
  | 'html'
  | 'image'
  | 'file'
  | 'color'
  | 'rating';

// =============================================================================
// VIEWER PROPS
// =============================================================================

/**
 * Props passadas para seções customizadas
 */
export interface ViewerSectionProps<T = unknown> {
  item: T;
  section: ViewerSection<T>;
}

// =============================================================================
// TAB CONFIG (para viewer com tabs)
// =============================================================================

/**
 * Configuração de tab no viewer
 */
export interface ViewerTab<T = unknown> {
  /** ID único da tab */
  id: string;
  /** Label da tab */
  label: string;
  /** Ícone da tab */
  icon?: ComponentType<{ className?: string }>;
  /** Seções da tab */
  sections: ViewerSection<T>[];
  /** Condição para exibir tab */
  showWhen?: (item: T) => boolean;
  /** Badge/contador na tab */
  badge?: (item: T) => string | number | null;
  /** Tab desabilitada */
  disabled?: boolean | ((item: T) => boolean);
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Helper para criar campo do viewer
 */
export function defineViewerField<T>(config: ViewerField<T>): ViewerField<T> {
  return {
    hideEmpty: true,
    ...config,
  };
}

/**
 * Helper para criar seção do viewer
 */
export function defineViewerSection<T>(
  config: ViewerSection<T>
): ViewerSection<T> {
  return {
    columns: 2,
    collapsible: false,
    ...config,
  };
}

/**
 * Helper para criar configuração do viewer
 */
export function defineViewerConfig<T extends BaseEntity>(
  config: EntityViewerConfig<T>
): EntityViewerConfig<T> {
  return {
    showHeader: true,
    showBreadcrumb: true,
    showActions: true,
    layout: 'default',
    ...config,
  };
}
