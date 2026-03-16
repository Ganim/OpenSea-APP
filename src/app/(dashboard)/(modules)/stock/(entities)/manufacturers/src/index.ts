/**
 * OpenSea OS - Manufacturers Module
 * Exportações centralizadas de todo o módulo de fabricantes.
 */

// API
export * from './api';

// Config
export { manufacturersConfig } from './config/manufacturers.config';

// Constants
export * from './constants';

// Modals (only those still used)
export { CreateManufacturerWizard } from './modals/create-manufacturer-wizard';
export { DuplicateConfirmModal } from './modals/duplicate-confirm-modal';
export { RenameModal } from './modals/rename-modal';

// Types
export {
  type ManufacturerFormData,
  type DuplicateManufacturerPayload,
} from './types/manufacturers.types';

// Utils
export {
  createManufacturer,
  deleteManufacturer,
  duplicateManufacturer,
  updateManufacturer,
} from './utils/manufacturers.crud';
export {
  formatManufacturerInfo,
  hasCompleteContact,
} from './utils/manufacturers.utils';
