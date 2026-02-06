/**
 * Editor Utils - Exports
 */

// Template compiler (legado - GrapesJS)
export {
  compileTemplate,
  extractFromEditor,
  generatePrintableLabel,
  generatePrintablePage,
  loadProject,
  resolveFieldValue,
  serializeProject,
} from './template-compiler';

// Label Studio utils (novo)
export {
  mmToPx,
  pxToMm,
  roundTo,
  mmToPxRounded,
  pxToMmRounded,
  getPageSizeInPx,
  PAPER_SIZES,
  ZOOM_LEVELS,
  getNextZoomLevel,
  calculateFitZoom,
  snapToGrid,
} from './unitConverter';

export {
  calculateSnap,
  calculateResizeSnap,
  calculateDistributionGuides,
  DEFAULT_SNAP_CONFIG,
  type SnapConfig,
} from './snapCalculator';

export {
  validateTemplate,
  serializeTemplate,
  deserializeTemplate,
  createEmptyTemplate,
  exportTemplateAsFile,
  importTemplateFromFile,
  LABEL_TEMPLATE_PRESETS_V2,
  CURRENT_TEMPLATE_VERSION,
} from './templateSerializer';

export {
  generatePrintHTML,
  resolveFieldValue as resolveFieldValueV2,
  mmToPrintPx,
  PRINT_DPI,
} from './printRenderer';
