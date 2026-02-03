/**
 * Print Queue Utils - Exports
 */

// Storage
export {
  clearStorage,
  DEFAULT_PRINT_QUEUE_STATE,
  hasStoredData,
  isBrowser,
  loadFromStorage,
  saveToStorage,
} from './storage';

// Label Data Resolver
export {
  resolveLabelData,
  resolveMultipleLabelData,
  getSampleLabelData,
} from './label-data-resolver';

// Page Layout Calculator
export {
  calculateLayout,
  calculateLayoutInfo,
  calculateLabelPosition,
  calculateLabelsPerPage,
  getPaperDimensions,
  getUsableArea,
  mmToPixels,
  pixelsToMm,
  scaleLayoutToFit,
} from './page-layout-calculator';
