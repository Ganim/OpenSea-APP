/**
 * OpenSea OS - PermissionGuard Component
 * Componente para proteger conteúdo baseado em permissões
 */

'use client';

import React from 'react';
import { usePermissions } from '@/hooks/use-permissions';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

export interface PermissionGuardProps {
  /** Código da permissão necessária (ex: 'stock.products.create') */
  permission?: string;
  /** Lista de permissões (pelo menos uma necessária) */
  anyPermission?: string[];
  /** Lista de permissões (todas necessárias) */
  allPermissions?: string[];
  /** Conteúdo a ser renderizado se o usuário tiver permissão */
  children: React.ReactNode;
  /** Conteúdo a ser renderizado se o usuário NÃO tiver permissão */
  fallback?: React.ReactNode;
  /** Mostrar mensagem de acesso negado padrão */
  showDeniedMessage?: boolean;
  /** Mensagem customizada de acesso negado */
  deniedMessage?: string;
  /** Mostrar skeleton durante carregamento */
  showLoadingSkeleton?: boolean;
  /** Altura do skeleton de carregamento */
  skeletonHeight?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Componente para proteger conteúdo baseado em permissões do usuário
 *
 * @example
 * ```tsx
 * // Permissão única
 * <PermissionGuard permission="stock.products.create">
 *   <CreateProductButton />
 * </PermissionGuard>
 *
 * // Pelo menos uma permissão (OR)
 * <PermissionGuard anyPermission={['stock.products.create', 'stock.products.update']}>
 *   <ProductForm />
 * </PermissionGuard>
 *
 * // Todas as permissões (AND)
 * <PermissionGuard allPermissions={['stock.products.view', 'stock.products.delete']}>
 *   <DeleteButton />
 * </PermissionGuard>
 *
 * // Com fallback customizado
 * <PermissionGuard
 *   permission="stock.products.create"
 *   fallback={<p>Você não pode criar produtos</p>}
 * >
 *   <CreateProductButton />
 * </PermissionGuard>
 * ```
 */
export function PermissionGuard({
  permission,
  anyPermission,
  allPermissions,
  children,
  fallback,
  showDeniedMessage = false,
  deniedMessage,
  showLoadingSkeleton = true,
  skeletonHeight = '40px',
}: PermissionGuardProps) {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isLoading,
  } = usePermissions();

  // Validação: pelo menos um tipo de permissão deve ser fornecido
  if (!permission && !anyPermission && !allPermissions) {
    console.warn(
      'PermissionGuard: Nenhuma permissão especificada. Use permission, anyPermission ou allPermissions.'
    );
    return <>{children}</>;
  }

  // Loading state
  if (isLoading) {
    if (!showLoadingSkeleton) return null;

    return (
      <div className="w-full">
        <Skeleton style={{ height: skeletonHeight }} className="w-full" />
      </div>
    );
  }

  // Verificar permissões
  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (anyPermission && anyPermission.length > 0) {
    hasAccess = hasAnyPermission(...anyPermission);
  } else if (allPermissions && allPermissions.length > 0) {
    hasAccess = hasAllPermissions(...allPermissions);
  }

  // Usuário não tem permissão
  if (!hasAccess) {
    // Retornar fallback customizado
    if (fallback !== undefined) {
      return <>{fallback}</>;
    }

    // Retornar mensagem de acesso negado
    if (showDeniedMessage) {
      return (
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Acesso Negado</AlertTitle>
          <AlertDescription>
            {deniedMessage ||
              'Você não tem permissão para acessar este conteúdo.'}
          </AlertDescription>
        </Alert>
      );
    }

    // Não renderizar nada por padrão
    return null;
  }

  // Usuário tem permissão
  return <>{children}</>;
}

// =============================================================================
// SPECIALIZED GUARDS
// =============================================================================

/**
 * Guard para proteger ações de criação
 */
export function CanCreate({
  resource,
  children,
  ...props
}: Omit<PermissionGuardProps, 'permission'> & { resource: string }) {
  return (
    <PermissionGuard permission={`${resource}.create`} {...props}>
      {children}
    </PermissionGuard>
  );
}

/**
 * Guard para proteger ações de leitura/visualização
 */
export function CanView({
  resource,
  children,
  ...props
}: Omit<PermissionGuardProps, 'permission'> & { resource: string }) {
  return (
    <PermissionGuard permission={`${resource}.read`} {...props}>
      {children}
    </PermissionGuard>
  );
}

/**
 * Guard para proteger ações de atualização
 */
export function CanEdit({
  resource,
  children,
  ...props
}: Omit<PermissionGuardProps, 'permission'> & { resource: string }) {
  return (
    <PermissionGuard permission={`${resource}.update`} {...props}>
      {children}
    </PermissionGuard>
  );
}

/**
 * Guard para proteger ações de exclusão
 */
export function CanDelete({
  resource,
  children,
  ...props
}: Omit<PermissionGuardProps, 'permission'> & { resource: string }) {
  return (
    <PermissionGuard permission={`${resource}.delete`} {...props}>
      {children}
    </PermissionGuard>
  );
}

/**
 * Guard para proteger ações de gerenciamento completo
 */
export function CanManage({
  resource,
  children,
  ...props
}: Omit<PermissionGuardProps, 'permission'> & { resource: string }) {
  return (
    <PermissionGuard permission={`${resource}.manage`} {...props}>
      {children}
    </PermissionGuard>
  );
}

// =============================================================================
// EXPORTS
// =============================================================================

export default PermissionGuard;
