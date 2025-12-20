/**
 * Users Module Index
 * Exportações centralizadas de todo o módulo de usuários
 */

// Components
export { UserGridCard, UserListCard } from './components';

// Constants
export {
  getRoleBadgeVariant,
  getRoleLabel,
  ROLE_BADGE_VARIANTS,
  ROLE_LABELS,
  ROLE_OPTIONS,
} from './constants';

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
  type RoleBadgeVariantMap,
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
  updateUserRole,
} from './utils';
