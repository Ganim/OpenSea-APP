/**
 * Label Template Editor Module
 * Editor WYSIWYG para criar templates de etiquetas
 */

// Components
export { LabelEditor } from './components';
export { SimpleLabelEditor } from './components/simple-label-editor';
export { TemplateSelector } from './components/template-selector';

// Plugins
export { labelBlocksPlugin } from './plugins';

// Template Presets
export {
  LABEL_TEMPLATE_PRESETS,
  TEMPLATE_CATEGORIES,
  getTemplateById,
  getTemplatesByCategory,
} from './templates/label-templates-presets';
export type { LabelTemplatePreset } from './templates/label-templates-presets';

// Utils
export {
  compileTemplate,
  extractFromEditor,
  generatePrintableLabel,
  generatePrintablePage,
  loadProject,
  resolveFieldValue,
  serializeProject,
} from './utils';

// Constants
export {
  AVAILABLE_FONTS,
  DEFAULT_FIELD_STYLES,
  EDITOR_CANVAS_CSS,
  FIELD_CATEGORIES,
  FONT_SIZES,
  LABEL_FIELDS,
  LABEL_SIZE_PRESETS,
} from './constants';

// Types
export type {
  CreateLabelTemplateInput,
  FieldCategory,
  GrapesJsBlock,
  GrapesJsConfig,
  LabelEditorProps,
  LabelEditorSaveData,
  LabelFieldDefinition,
  LabelTemplate,
  LabelTemplateResponse,
  LabelTemplatesResponse,
  UpdateLabelTemplateInput,
} from './types';

// Simple Editor Types
export type { SimpleLabelSaveData } from './components/simple-label-editor';
