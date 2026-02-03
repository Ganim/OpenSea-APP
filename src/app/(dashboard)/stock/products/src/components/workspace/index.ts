/**
 * Product Workspace Components
 * Unified product management workspace
 */

// Main components
export { ProductWorkspace } from './product-workspace';
export { HierarchyTree } from './hierarchy-tree';
export { DetailPanel } from './detail-panel';

// Creation components
export { QuickAddModal } from './quick-add-modal';
export {
  InlineVariantCreator,
  AddVariantButton,
} from './inline-variant-creator';
export { BatchVariantCreator } from './batch-variant-creator';
export { QuickStockEntry, QuickStockButton } from './quick-stock-entry';

// Hooks
export {
  useKeyboardShortcuts,
  ShortcutHint,
  SHORTCUTS,
} from './use-keyboard-shortcuts';

// Types
export * from './types';
