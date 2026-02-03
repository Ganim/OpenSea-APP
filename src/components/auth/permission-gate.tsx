/**
 * OpenSea OS - Permission Gate Component
 *
 * Componente que renderiza children apenas se o usuário tem as permissões necessárias.
 * Útil para ocultar botões, ações e seções baseado em RBAC.
 *
 * @example
 * ```tsx
 * // Permissão única
 * <PermissionGate permission="hr.companies.create">
 *   <CreateCompanyButton />
 * </PermissionGate>
 *
 * // Múltiplas permissões (qualquer uma)
 * <PermissionGate permission={['hr.companies.update', 'hr.companies.delete']}>
 *   <EditMenu />
 * </PermissionGate>
 *
 * // Múltiplas permissões (todas necessárias)
 * <PermissionGate
 *   permission={['hr.companies.view', 'hr.companies.update']}
 *   requireAll
 * >
 *   <FullAccessButton />
 * </PermissionGate>
 *
 * // Com fallback
 * <PermissionGate
 *   permission="hr.companies.create"
 *   fallback={<DisabledButton />}
 * >
 *   <CreateButton />
 * </PermissionGate>
 * ```
 */

'use client';

import { type ReactNode } from 'react';
import { usePermissions } from '@/hooks/use-permissions';

/* ===========================================
   TYPES
   =========================================== */

export interface PermissionGateProps {
  /**
   * Permissão necessária (string única ou array)
   * - String: verifica uma única permissão
   * - Array: verifica múltiplas (comportamento depende de requireAll)
   */
  permission: string | string[];

  /**
   * Se true, requer TODAS as permissões do array
   * Se false (default), requer pelo menos UMA
   */
  requireAll?: boolean;

  /**
   * Conteúdo a ser renderizado quando o usuário TEM permissão
   */
  children: ReactNode;

  /**
   * Conteúdo a ser renderizado quando o usuário NÃO TEM permissão (opcional)
   * Por padrão, não renderiza nada
   */
  fallback?: ReactNode;

  /**
   * Se true, mostra um skeleton/loading enquanto verifica permissões
   * Por padrão, não renderiza nada durante loading
   */
  showLoadingState?: boolean;

  /**
   * Componente customizado para exibir durante loading
   */
  loadingComponent?: ReactNode;
}

/* ===========================================
   COMPONENT
   =========================================== */

/**
 * Componente que controla renderização baseada em permissões RBAC
 *
 * Características:
 * - Suporte a permissão única ou múltiplas
 * - Modo OR (pelo menos uma) ou AND (todas)
 * - Fallback customizável
 * - Estado de loading configurável
 * - Integração com hook usePermissions
 */
export function PermissionGate({
  permission,
  requireAll = false,
  children,
  fallback = null,
  showLoadingState = false,
  loadingComponent = null,
}: PermissionGateProps): ReactNode {
  const { hasPermission, hasAllPermissions, hasAnyPermission, isLoading } =
    usePermissions();

  // Durante carregamento
  if (isLoading) {
    if (showLoadingState && loadingComponent) {
      return loadingComponent;
    }
    // Por segurança, não renderiza nada durante loading
    return null;
  }

  // Normaliza para array
  const permissions = Array.isArray(permission) ? permission : [permission];

  // Verifica se tem acesso
  let hasAccess: boolean;

  if (permissions.length === 1) {
    // Permissão única
    hasAccess = hasPermission(permissions[0]);
  } else if (requireAll) {
    // Todas as permissões são necessárias (AND)
    hasAccess = hasAllPermissions(...permissions);
  } else {
    // Pelo menos uma permissão (OR)
    hasAccess = hasAnyPermission(...permissions);
  }

  // Renderiza baseado no acesso
  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/* ===========================================
   CONVENIENCE COMPONENTS
   =========================================== */

/**
 * Gate específico para ação de criar
 */
export function CanCreate({
  entity,
  children,
  fallback,
}: {
  entity: string;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <PermissionGate permission={`${entity}.create`} fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

/**
 * Gate específico para ação de editar/atualizar
 */
export function CanUpdate({
  entity,
  children,
  fallback,
}: {
  entity: string;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <PermissionGate permission={`${entity}.update`} fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

/**
 * Gate específico para ação de deletar
 */
export function CanDelete({
  entity,
  children,
  fallback,
}: {
  entity: string;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <PermissionGate permission={`${entity}.delete`} fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

/**
 * Gate específico para ação de visualizar
 */
export function CanView({
  entity,
  children,
  fallback,
}: {
  entity: string;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <PermissionGate permission={`${entity}.view`} fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

export default PermissionGate;
