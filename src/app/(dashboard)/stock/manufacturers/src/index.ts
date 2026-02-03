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

// Modals
export * from './modals';
export { CNPJLookupModal } from './modals/cnpj-lookup-modal';
export { CreateModal } from './modals/create-modal';
export { DeleteConfirmModal } from './modals/delete-confirm-modal';
export { DuplicateConfirmModal } from './modals/duplicate-confirm-modal';
export { EditModal } from './modals/edit-modal';
export { ViewModal } from './modals/view-modal';

// Types
export {
  type ManufacturerFormData,
  type DuplicateManufacturerPayload,
} from './types/manufacturers.types';

// Utils
export * from './utils';
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
