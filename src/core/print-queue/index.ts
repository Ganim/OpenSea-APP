/**
 * Print Queue Module
 * Sistema de fila de impressão de etiquetas
 */

// Context & Provider
export {
  PrintQueueProvider,
  usePrintQueue,
} from './context/print-queue-context';

// Hooks
export { useQueuePrinting } from './hooks/use-queue-printing';

// Components
export {
  AddEmployeeToQueueButton,
  AddToQueueButton,
  BatchAddToQueueButton,
  LabelPreview,
  PagePreview,
  PageSettingsPanel,
  PrintQueueModal,
  PrintQueuePanel,
  QueueItemCard,
  QueueItemList,
  TemplateSelector,
} from './components';

// Utils
export {
  calculateLayout,
  calculateLayoutInfo,
  getSampleLabelData,
  resolveLabelData,
  resolveMultipleLabelData,
} from './utils';

// Types
export type {
  AddEmployeeInput,
  AddStockItemInput,
  AddToQueueInput,
  CalculatedLayout,
  LabelData,
  LabelField,
  LabelFieldSource,
  LabelFieldType,
  LabelPosition,
  LabelTemplateDefinition,
  PageLayout,
  PageSettings,
  PrintGenerationResult,
  PrintGenerationStatus,
  PrintOptions,
  PrintQueueActions,
  PrintQueueContextValue,
  PrintQueueEmployeeItem,
  PrintQueueEntityType,
  PrintQueueItem,
  PrintQueueState,
  PrintQueueStockItem,
} from './types';

// Constants
export {
  DEFAULT_PAGE_SETTINGS,
  DEFAULT_TEMPLATE_ID,
  LABEL_AVAILABLE_FIELDS,
  LABEL_SIZES,
  MAX_COPIES_PER_ITEM,
  MAX_QUEUE_ITEMS,
  MIN_COPIES,
  PAPER_SIZES,
  PRINT_QUEUE_STORAGE_KEY,
  SYSTEM_LABEL_TEMPLATES,
  UNIT_OF_MEASURE_LABELS,
} from './constants';
