/**
 * OpenSea OS - Admin Permissions Constants
 *
 * Constantes de permissões para o módulo admin.
 * Usar com PermissionGate para controle de acesso em componentes.
 *
 * @example
 * ```tsx
 * import { ADMIN_PERMISSIONS } from '@/app/(dashboard)/admin/_shared/constants';
 *
 * // Uso com hook
 * const { hasPermission } = usePermissions();
 * if (hasPermission(ADMIN_PERMISSIONS.USERS.CREATE)) {
 *   // Pode criar usuários
 * }
 *
 * // Uso com componente
 * <PermissionGate permission={ADMIN_PERMISSIONS.USERS.DELETE}>
 *   <DeleteButton />
 * </PermissionGate>
 * ```
 */

import {
  AUDIT_PERMISSIONS,
  CORE_PERMISSIONS,
  RBAC_PERMISSIONS,
} from '@/config/rbac/permission-codes';

export const ADMIN_PERMISSIONS = {
  /**
   * Permissões de Usuários
   */
  USERS: {
    /** Listar usuários */
    LIST: CORE_PERMISSIONS.USERS.LIST,
    /** Visualizar detalhes de usuário */
    VIEW: CORE_PERMISSIONS.USERS.READ,
    /** Criar novo usuário */
    CREATE: CORE_PERMISSIONS.USERS.CREATE,
    /** Atualizar usuário existente */
    UPDATE: CORE_PERMISSIONS.USERS.UPDATE,
    /** Excluir usuário */
    DELETE: CORE_PERMISSIONS.USERS.DELETE,
    /** Gerenciar grupos do usuário */
    MANAGE_GROUPS: RBAC_PERMISSIONS.USER_GROUPS.MANAGE,
    /** Forçar reset de senha */
    FORCE_PASSWORD_RESET: CORE_PERMISSIONS.USERS.MANAGE,
    /** Gerenciamento completo */
    MANAGE: CORE_PERMISSIONS.USERS.MANAGE,
  },

  /**
   * Permissões de Grupos de Permissões
   */
  PERMISSION_GROUPS: {
    /** Listar grupos */
    LIST: RBAC_PERMISSIONS.GROUPS.LIST,
    /** Visualizar detalhes de grupo */
    VIEW: RBAC_PERMISSIONS.GROUPS.READ,
    /** Criar novo grupo */
    CREATE: RBAC_PERMISSIONS.GROUPS.CREATE,
    /** Atualizar grupo existente */
    UPDATE: RBAC_PERMISSIONS.GROUPS.UPDATE,
    /** Excluir grupo */
    DELETE: RBAC_PERMISSIONS.GROUPS.DELETE,
    /** Gerenciar permissões do grupo */
    MANAGE_PERMISSIONS: RBAC_PERMISSIONS.ASSOCIATIONS.MANAGE,
    /** Atribuir usuários ao grupo */
    ASSIGN_USERS: RBAC_PERMISSIONS.GROUPS.ASSIGN,
    /** Gerenciamento completo */
    MANAGE: RBAC_PERMISSIONS.GROUPS.MANAGE,
  },

  /**
   * Permissões de Permissões
   */
  PERMISSIONS: {
    /** Listar permissões */
    LIST: RBAC_PERMISSIONS.PERMISSIONS.LIST,
    /** Visualizar detalhes de permissão */
    VIEW: RBAC_PERMISSIONS.PERMISSIONS.READ,
    /** Criar nova permissão */
    CREATE: RBAC_PERMISSIONS.PERMISSIONS.CREATE,
    /** Atualizar permissão existente */
    UPDATE: RBAC_PERMISSIONS.PERMISSIONS.UPDATE,
    /** Excluir permissão */
    DELETE: RBAC_PERMISSIONS.PERMISSIONS.DELETE,
  },

  /**
   * Permissões de Logs de Auditoria
   */
  AUDIT_LOGS: {
    /** Listar logs */
    LIST: AUDIT_PERMISSIONS.LOGS.VIEW,
    /** Visualizar detalhes de log */
    VIEW: AUDIT_PERMISSIONS.LOGS.VIEW,
    /** Pesquisar logs */
    SEARCH: AUDIT_PERMISSIONS.LOGS.SEARCH,
    /** Ver histórico */
    HISTORY: AUDIT_PERMISSIONS.HISTORY.VIEW,
    /** Preview de rollback */
    ROLLBACK_PREVIEW: AUDIT_PERMISSIONS.ROLLBACK.PREVIEW,
    /** Executar rollback */
    ROLLBACK_EXECUTE: AUDIT_PERMISSIONS.ROLLBACK.EXECUTE,
  },

  /**
   * Permissões de Sessões
   */
  SESSIONS: {
    /** Listar sessões */
    LIST: CORE_PERMISSIONS.SESSIONS.LIST,
    /** Visualizar sessão */
    VIEW: CORE_PERMISSIONS.SESSIONS.READ,
    /** Revogar sessão específica */
    REVOKE: CORE_PERMISSIONS.SESSIONS.REVOKE,
    /** Revogar todas as sessões */
    REVOKE_ALL: CORE_PERMISSIONS.SESSIONS.REVOKE_ALL,
  },
} as const;

// Type exports
export type AdminUsersPermission =
  (typeof ADMIN_PERMISSIONS.USERS)[keyof typeof ADMIN_PERMISSIONS.USERS];

export type AdminPermissionGroupsPermission =
  (typeof ADMIN_PERMISSIONS.PERMISSION_GROUPS)[keyof typeof ADMIN_PERMISSIONS.PERMISSION_GROUPS];

export type AdminPermissionsPermission =
  (typeof ADMIN_PERMISSIONS.PERMISSIONS)[keyof typeof ADMIN_PERMISSIONS.PERMISSIONS];

export type AdminAuditLogsPermission =
  (typeof ADMIN_PERMISSIONS.AUDIT_LOGS)[keyof typeof ADMIN_PERMISSIONS.AUDIT_LOGS];

export type AdminSessionsPermission =
  (typeof ADMIN_PERMISSIONS.SESSIONS)[keyof typeof ADMIN_PERMISSIONS.SESSIONS];

export type AdminPermission =
  | AdminUsersPermission
  | AdminPermissionGroupsPermission
  | AdminPermissionsPermission
  | AdminAuditLogsPermission
  | AdminSessionsPermission;

export default ADMIN_PERMISSIONS;
