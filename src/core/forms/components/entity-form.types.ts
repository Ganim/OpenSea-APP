/**
 * OpenSea OS - EntityForm Types
 * Tipos e interfaces para o sistema de formulários genéricos
 */

import type { BaseEntity, EntityFormConfig } from '@/core/types';

// =============================================================================
// FORM PROPS
// =============================================================================

export interface EntityFormProps<T extends BaseEntity> {
  /** Configuração do formulário */
  config: EntityFormConfig<T>;
  /** Dados iniciais para edição */
  initialData?: Partial<T>;
  /** Modo do formulário */
  mode: 'create' | 'edit';
  /** Callback ao submeter */
  onSubmit: (data: Partial<T>) => Promise<void> | void;
  /** Callback ao cancelar */
  onCancel?: () => void;
  /** Está enviando */
  isSubmitting?: boolean;
  /** Texto do botão de submit customizado */
  submitLabel?: string;
  /** Texto do botão de cancelar customizado */
  cancelLabel?: string;
  /** Classes adicionais */
  className?: string;
  /** Esconder botões de ação (usar controle externo) */
  hideActions?: boolean;
}

// =============================================================================
// FIELD RENDERING
// =============================================================================

export interface RenderFieldProps<T extends BaseEntity> {
  field: EntityFormConfig<T>['sections'][0]['fields'][0];
  control: any; // react-hook-form Control
  errors: any; // react-hook-form FieldErrors
  formValues: Partial<T>;
  sectionColumns?: number;
}

// =============================================================================
// SECTION RENDERING
// =============================================================================

export interface RenderSectionProps<T extends BaseEntity> {
  section: EntityFormConfig<T>['sections'][0];
  isCollapsed: boolean;
  onToggle: () => void;
  renderField: (
    field: EntityFormConfig<T>['sections'][0]['fields'][0],
    sectionColumns?: number
  ) => React.ReactNode;
  formValues: Partial<T>;
  config: EntityFormConfig<T>;
}

// =============================================================================
// VALIDATION
// =============================================================================

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// =============================================================================
// COLUMN SPAN UTILITIES
// =============================================================================

export type GridColumns = 1 | 2 | 3 | 4;
export type ColSpan = 1 | 2 | 3 | 4;
