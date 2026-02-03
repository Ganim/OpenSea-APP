/**
 * Variants Module
 * Exportações centralizadas de todo o módulo de variantes
 */

// Config
export { variantsConfig } from './config/variants.config';

// Modals
export { VariantDetailModal } from './modals/variant-detail-modal';

// Types
export * from './types/variants.types';

// Utils
export {
  createVariant,
  deleteVariant,
  getVariant,
  listVariants,
  updateVariant,
} from './utils/variants.crud';
export * from './utils/variants.utils';
