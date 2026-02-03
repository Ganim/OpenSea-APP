/**
 * OpenSea OS - Suppliers Module
 * Exportacoes centralizadas de todo o modulo de fornecedores
 */

// Config
export { suppliersConfig } from './config/suppliers.config';

// Modals
export { CNPJLookupModal } from './modals/cnpj-lookup-modal';
export { CreateModal } from './modals/create-modal';
export { DeleteConfirmModal } from './modals/delete-confirm-modal';
export { DuplicateConfirmModal } from './modals/duplicate-confirm-modal';
export { EditModal } from './modals/edit-modal';
export { ViewModal } from './modals/view-modal';

// Types
export * from './types/suppliers.types';

// API
export { suppliersApi } from './api/supplier.api';

// Utils
export {
  createSupplier,
  deleteSupplier,
  duplicateSupplier,
  updateSupplier,
} from './utils/suppliers.crud';
export * from './utils/suppliers.utils';
