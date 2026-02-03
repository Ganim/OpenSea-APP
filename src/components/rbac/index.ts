/**
 * OpenSea OS - RBAC Components
 * Componentes para controle de acesso baseado em permissões
 */

export { AccessDenied } from './access-denied';

export {
  PermissionGuard,
  CanCreate,
  CanView,
  CanEdit,
  CanDelete,
  CanManage,
} from './permission-guard';

export { ProtectedPage } from './protected-page';

export type { PermissionGuardProps } from './permission-guard';
export type { ProtectedPageProps } from './protected-page';
