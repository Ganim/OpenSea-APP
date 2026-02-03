/**
 * Permission Groups Module Index
 * Exportações centralizadas de todo o módulo de grupos de permissões
 */

// API (queries, mutations, keys)
export * from './api';

// Config
export { permissionGroupsConfig } from './config/permission-groups.config';

// Modals
export { CreateModal } from './modals/create-modal';
export { DetailModal } from './modals/detail-modal';

// Types
export type {
  CreateModalProps,
  DetailModalProps,
  EditModalProps,
  NewPermissionGroupData,
  PermissionGroupCardProps,
  UpdatePermissionGroupData,
} from './types';

// Utils
export {
  createPermissionGroup,
  deletePermissionGroup,
  getPermissionGroup,
  getStatusBadgeVariant,
  getStatusLabel,
  getTypeBadgeVariant,
  getTypeLabel,
  listPermissionGroups,
  updatePermissionGroup,
} from './utils/permission-groups.utils';
