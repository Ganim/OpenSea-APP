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
