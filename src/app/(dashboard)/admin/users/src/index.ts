/**
 * Users Module Index
 * Exportações centralizadas de todo o módulo de usuários
 */

// API (queries, mutations, keys)
export * from './api';

// Components
export { UserGridCard, UserListCard } from './components';

// Constants
export { USER_STATUS, USER_STATUS_LABELS } from './constants';

// Config
export { usersConfig } from './config/users.config';

// Modals
export { CreateModal, DetailModal, ManageGroupsModal } from './modals';

// Types
export {
  type CreateModalProps,
  type DetailModalProps,
  type ManageGroupsModalProps,
  type NewUserData,
  type UserGridCardProps,
  type UserListCardProps,
} from './types';

// Utils
export {
  createUser,
  deleteUser,
  formatLastLogin,
  formatLastLoginDateTime,
  formatUserInfo,
  getFullName,
  getUser,
  hasLastLogin,
  isNewUserValid,
  isValidEmail,
  isValidPassword,
  isValidUsername,
  listUsers,
} from './utils';
