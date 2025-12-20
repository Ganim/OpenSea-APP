/**
 * Template Module Types
 * Tipos específicos para o módulo de templates
 */

import type { Template } from '@/types/stock';

/**
 * Props para o componente TemplateForm
 */
export interface TemplateFormProps {
  template?: Template;
  onSave?: (data: TemplateFormData) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  showEditButton?: boolean;
}

/**
 * Dados do formulário de template
 */
export interface TemplateFormData {
  name: string;
  unitOfMeasure: string;
  productAttributes?: Record<string, unknown>;
  variantAttributes?: Record<string, unknown>;
  itemAttributes?: Record<string, unknown>;
  careInstructions?: Record<string, unknown>;
}

/**
 * Props para o componente TemplateViewer
 */
export interface TemplateViewerProps {
  template: Template;
  showHeader?: boolean;
  showEditButton?: boolean;
  onSave?: (data: TemplateFormData) => Promise<void>;
}

/**
 * Props para o MultiViewModal
 */
export interface MultiViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: Template[];
  availableTemplates: Template[];
}

/**
 * Props para o contexto de seleção de templates
 */
export interface TemplateSelectionContext {
  selectedIds: Set<string>;
  isMultiSelect: boolean;
}
