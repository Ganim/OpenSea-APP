/**
 * OpenSea OS - Form Types
 * Tipos para configuração de formulários
 */

import { ComponentType, ReactNode } from 'react';
import { ZodSchema } from 'zod';
import { BaseEntity } from './base.types';

// =============================================================================
// FIELD TYPES
// =============================================================================

/**
 * Tipos de campos de formulário suportados
 */
export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'currency'
  | 'email'
  | 'phone'
  | 'password'
  | 'url'
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
  | 'percent'
  | 'color'
  | 'slider'
  | 'tags'
  | 'file'
  | 'image'
  | 'rich-text'
  | 'code'
  | 'json'
  | 'markdown'
  | 'array'
  | 'object'
  | 'key-value'
  | 'relation'
  | 'custom';

// =============================================================================
// FIELD CONFIG
// =============================================================================

/**
 * Opção de campo (select, radio, etc)
 */
export interface FieldOption {
  label: string;
  value: string | number | boolean;
  disabled?: boolean;
  icon?: ReactNode;
  description?: string;
}

/**
 * Configuração de um campo de formulário
 */
export interface FieldConfig<T = unknown> {
  // ======================== IDENTIFICAÇÃO ========================
  /** Nome do campo (chave no objeto) */
  name: keyof T | string;
  /** Label do campo */
  label: string;
  /** Tipo do campo */
  type: FieldType;

  // ======================== VALIDAÇÃO ========================
  /** Campo obrigatório */
  required?: boolean;
  /** Valor mínimo (number) ou tamanho mínimo (text) */
  min?: number;
  /** Valor máximo (number) ou tamanho máximo (text) */
  max?: number;
  /** Passo/incremento para campos numéricos */
  step?: number | string;
  /** Padrão regex para validação */
  pattern?: RegExp;
  /** Mensagem de erro customizada */
  errorMessage?: string;

  // ======================== MÁSCARAS ========================
  /**
   * Máscara de entrada para o campo
   * Máscaras predefinidas: 'cnpj', 'cpf', 'phone', 'cep', 'date'
   * Ou máscara customizada usando:
   * - '9' para dígitos
   * - 'A' para letras
   * - '*' para alfanumérico
   * Exemplo: '99.999.999/9999-99' para CNPJ
   */
  mask?: 'cnpj' | 'cpf' | 'phone' | 'cep' | 'date' | string;

  // ======================== UI ========================
  /** Placeholder */
  placeholder?: string;
  /** Descrição/help text */
  description?: string;
  /** Ícone do campo */
  icon?: ComponentType<{ className?: string }>;
  /** Classe CSS customizada */
  className?: string;
  /** Colspan no grid (1-12) */
  colSpan?: 1 | 2 | 3 | 4 | 6 | 12;
  /** Número de linhas (textarea) */
  rows?: number;
  /** Label do checkbox (type: 'checkbox') */
  checkboxLabel?: string;
  /** Label do switch (type: 'switch') */
  switchLabel?: string;
  /** Orientação dos radio buttons (type: 'radio') */
  radioOrientation?: 'horizontal' | 'vertical';

  // ======================== ESTADO ========================
  /** Campo desabilitado */
  disabled?: boolean | ((formData: T) => boolean);
  /** Campo somente leitura */
  readOnly?: boolean;
  /** Campo oculto */
  hidden?: boolean | ((formData: T) => boolean);
  /** Auto focus ao carregar */
  autoFocus?: boolean;
  /** Valor padrão */
  defaultValue?: unknown;

  // ======================== OPÇÕES ========================
  /** Opções para select/radio/checkbox */
  options?: FieldOption[];
  /** Função para obter opções dinamicamente */
  getOptions?: (formData: T) => FieldOption[] | Promise<FieldOption[]>;
  /** Permite múltipla seleção */
  multiple?: boolean;
  /** Permite pesquisa nas opções */
  searchable?: boolean;
  /** Permite criar novas opções */
  creatable?: boolean;

  // ======================== RELAÇÃO ========================
  /** Entidade relacionada (para type: 'relation') */
  relationEntity?: string;
  /** Campo de exibição da relação */
  relationDisplayField?: string;
  /** Filtros para a relação */
  relationFilters?: Record<string, unknown>;
  /** Opções de relação (para type: 'relation') */
  relationOptions?: Array<{
    value: string;
    label: string;
    description?: string;
    icon?: ComponentType<{ className?: string }>;
  }>;

  // ======================== ARRAY/OBJECT ========================
  /** Schema dos itens (para type: 'array' ou 'object') */
  itemSchema?: FieldConfig<unknown>[];
  /** Mínimo de itens */
  minItems?: number;
  /** Máximo de itens */
  maxItems?: number;

  // ======================== KEY-VALUE ========================
  /** Label para chave (type: 'key-value') */
  keyLabel?: string;
  /** Label para valor (type: 'key-value') */
  valueLabel?: string;
  /** Placeholder para chave */
  keyPlaceholder?: string;
  /** Placeholder para valor */
  valuePlaceholder?: string;

  // ======================== VALIDATION (extended) ========================
  /** Validação customizada */
  validation?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (value: unknown, formData: T) => string | boolean;
  };

  // ======================== UPLOAD ========================
  /** Tipos de arquivo aceitos */
  accept?: string;
  /** Tamanho máximo em bytes */
  maxSize?: number;
  /** Tamanho máximo de arquivo (alias para maxSize) */
  maxFileSize?: number;
  /** Múltiplos arquivos */
  multipleFiles?: boolean;

  // ======================== CUSTOMIZAÇÃO ========================
  /** Componente customizado */
  component?: ComponentType<FieldComponentProps<T>>;
  /** Props adicionais para o componente */
  componentProps?: Record<string, unknown>;
  /** Função de renderização customizada */
  render?: (props: FieldComponentProps<T>) => ReactNode;

  // ======================== CALLBACKS ========================
  /** Callback ao mudar valor */
  onChange?: (
    value: unknown,
    formData: T,
    setValue: (field: keyof T, value: unknown) => void
  ) => void;
  /** Callback ao perder foco */
  onBlur?: (value: unknown, formData: T) => void;

  // ======================== CONDICIONAIS ========================
  /** Mostrar campo apenas quando condição for verdadeira */
  showWhen?: (formData: T) => boolean;
  /** Tornar obrigatório quando condição for verdadeira */
  requiredWhen?: (formData: T) => boolean;
}

/**
 * Props passadas para componentes de campo customizados
 */
export interface FieldComponentProps<T = unknown> {
  field: FieldConfig<T>;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
  disabled?: boolean;
  formData: T;
}

// =============================================================================
// FORM SECTION
// =============================================================================

/**
 * Seção de formulário (agrupa campos)
 */
export interface FormSection<T = unknown> {
  /** ID único da seção */
  id: string;
  /** Título da seção */
  title?: string;
  /** Descrição da seção */
  description?: string;
  /** Ícone da seção */
  icon?: ReactNode;
  /** Campos da seção */
  fields: FieldConfig<T>[];
  /** Número de colunas */
  columns?: 1 | 2 | 3 | 4;
  /** Seção colapsável */
  collapsible?: boolean;
  /** Iniciar colapsada */
  defaultCollapsed?: boolean;
  /** Condição para exibir seção */
  showWhen?: (formData: Partial<T>) => boolean;
}

// =============================================================================
// FORM CONFIG
// =============================================================================

/**
 * Configuração completa de formulário para uma entidade
 */
export interface EntityFormConfig<T extends BaseEntity = BaseEntity> {
  /** Seções do formulário */
  sections: FormSection<T>[];
  /** Schema Zod para validação */
  schema?: ZodSchema<Partial<T>>;
  /** Número de colunas padrão */
  defaultColumns?: 1 | 2 | 3 | 4;
  /** Mostrar indicador de campo obrigatório */
  showRequiredIndicator?: boolean;
  /** Mostrar erros inline */
  showInlineErrors?: boolean;
  /** Validar ao digitar */
  validateOnChange?: boolean;
  /** Validar ao perder foco */
  validateOnBlur?: boolean;
  /** Auto-save (debounced) */
  autoSave?: boolean;
  /** Delay do auto-save em ms */
  autoSaveDelay?: number;
  /** Transformar dados antes de enviar */
  transformBeforeSubmit?: (data: Partial<T>) => Partial<T>;
  /** Transformar dados ao receber */
  transformOnReceive?: (data: T) => Partial<T>;
  /** Label do botão submit */
  submitLabel?: string;
  /** Label do botão cancelar */
  cancelLabel?: string;
}

// =============================================================================
// FORM STATE
// =============================================================================

/**
 * Estado do formulário
 */
export interface FormState<T = unknown> {
  /** Dados do formulário */
  data: Partial<T>;
  /** Erros por campo */
  errors: Record<string, string>;
  /** Campos tocados */
  touched: Record<string, boolean>;
  /** Campos sujos (modificados) */
  dirty: Record<string, boolean>;
  /** Formulário válido */
  isValid: boolean;
  /** Formulário foi modificado */
  isDirty: boolean;
  /** Formulário está enviando */
  isSubmitting: boolean;
  /** Formulário está validando */
  isValidating: boolean;
}

// =============================================================================
// FORM ACTIONS
// =============================================================================

/**
 * Ações disponíveis no formulário
 */
export interface FormActions<T = unknown> {
  /** Definir valor de um campo */
  setValue: (field: keyof T, value: unknown) => void;
  /** Definir múltiplos valores */
  setValues: (values: Partial<T>) => void;
  /** Definir erro de um campo */
  setError: (field: keyof T, error: string) => void;
  /** Limpar erro de um campo */
  clearError: (field: keyof T) => void;
  /** Limpar todos os erros */
  clearErrors: () => void;
  /** Marcar campo como tocado */
  setTouched: (field: keyof T, touched?: boolean) => void;
  /** Resetar formulário */
  reset: (values?: Partial<T>) => void;
  /** Validar formulário */
  validate: () => Promise<boolean>;
  /** Validar um campo */
  validateField: (field: keyof T) => Promise<boolean>;
  /** Submeter formulário */
  submit: () => Promise<void>;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Helper para criar configuração de campo
 */
export function defineField<T>(config: FieldConfig<T>): FieldConfig<T> {
  return config;
}

/**
 * Helper para criar seção de formulário
 */
export function defineSection<T>(config: FormSection<T>): FormSection<T> {
  return config;
}

/**
 * Helper para criar configuração de formulário
 */
export function defineFormConfig<T extends BaseEntity>(
  config: EntityFormConfig<T>
): EntityFormConfig<T> {
  return {
    defaultColumns: 2,
    showRequiredIndicator: true,
    showInlineErrors: true,
    validateOnBlur: true,
    ...config,
  };
}
