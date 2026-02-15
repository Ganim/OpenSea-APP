/**
 * Tags Module
 * Exportações centralizadas de todo o módulo de tags
 */

// Config
export { tagsConfig } from './config/tags.config';

// Modals
export { CreateModal } from './modals/create-modal';
export { DeleteConfirmModal } from './modals/delete-confirm-modal';
export { EditModal } from './modals/edit-modal';
export { ViewModal } from './modals/view-modal';

// Types
export * from './types/tags.types';

// Utils
export {
  createTag,
  deleteTag,
  getTag,
  listTags,
  updateTag,
} from './utils/tags.crud';
export * from './utils/tags.utils';
