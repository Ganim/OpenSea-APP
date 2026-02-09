/**
 * OpenSea OS - ProtectedPage Component
 * Componente para proteger páginas inteiras baseado em permissões
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/auth-context';
import { logger } from '@/lib/logger';
import { usePermissions } from '@/hooks/use-permissions';
import { ArrowLeft, Home, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

// =============================================================================
// TYPES
// =============================================================================

export interface ProtectedPageProps {
  /** Código da permissão necessária (ex: 'stock.products.view') */
  permission?: string;
  /** Lista de permissões (pelo menos uma necessária) */
  anyPermission?: string[];
  /** Lista de permissões (todas necessárias) */
  allPermissions?: string[];
  /** Conteúdo da página */
  children: React.ReactNode;
  /** Rota para redirecionar se não tiver permissão */
  redirectTo?: string;
  /** Mostrar página de acesso negado ao invés de redirecionar */
  showDeniedPage?: boolean;
  /** Mensagem customizada de acesso negado */
  deniedMessage?: string;
  /** Título customizado da página de acesso negado */
  deniedTitle?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Componente para proteger páginas inteiras baseado em permissões
 *
 * @example
 * ```tsx
 * // Em uma página
 * export default function ProductsPage() {
 *   return (
 *     <ProtectedPage permission="stock.products.view">
 *       <div>Conteúdo da página de produtos</div>
 *     </ProtectedPage>
 *   );
 * }
 *
 * // Com redirecionamento
 * <ProtectedPage
 *   permission="admin.settings.view"
 *   redirectTo="/dashboard"
 * >
 *   <SettingsPage />
 * </ProtectedPage>
 *
 * // Com página de acesso negado
 * <ProtectedPage
 *   permission="admin.users.manage"
 *   showDeniedPage
 *   deniedTitle="Área Restrita"
 *   deniedMessage="Apenas administradores podem acessar esta página."
 * >
 *   <AdminPanel />
 * </ProtectedPage>
 * ```
 */
export function ProtectedPage({
  permission,
  anyPermission,
  allPermissions,
  children,
  redirectTo,
  showDeniedPage = true,
  deniedMessage,
  deniedTitle,
}: ProtectedPageProps) {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isLoading: permissionsLoading,
  } = usePermissions();

  // Validação: pelo menos um tipo de permissão deve ser fornecido
  if (!permission && !anyPermission && !allPermissions) {
    logger.warn(
      'ProtectedPage: Nenhuma permissão especificada. Use permission, anyPermission ou allPermissions.'
    );
    return <>{children}</>;
  }

  // Loading state
  const isLoading = authLoading || permissionsLoading;

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col gap-6 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-full w-full rounded-lg" />
      </div>
    );
  }

  // Não autenticado - redirecionar para login
  if (!user) {
    if (typeof window !== 'undefined') {
      router.push('/fast-login');
    }
    return null;
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
    // Redirecionar
    if (redirectTo && !showDeniedPage) {
      if (typeof window !== 'undefined') {
        router.push(redirectTo);
      }
      return null;
    }

    // Mostrar página de acesso negado
    return (
      <div className="flex h-screen items-center justify-center p-6">
        <Card className="w-full max-w-md p-8">
          <div className="flex flex-col items-center gap-6 text-center">
            {/* Ícone */}
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
              <ShieldAlert className="h-10 w-10 text-destructive" />
            </div>

            {/* Título */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">
                {deniedTitle || 'Acesso Negado'}
              </h1>
              <p className="text-muted-foreground">
                {deniedMessage ||
                  'Você não tem permissão para acessar esta página. Entre em contato com o administrador do sistema se você acredita que isso é um erro.'}
              </p>
            </div>

            {/* Informações de permissão */}
            {(permission || anyPermission || allPermissions) && (
              <div className="w-full rounded-md bg-muted p-4 text-left">
                <p className="mb-2 text-sm font-medium">
                  Permissão necessária:
                </p>
                {permission && (
                  <code className="text-xs font-mono">{permission}</code>
                )}
                {anyPermission && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Pelo menos uma de:
                    </p>
                    {anyPermission.map(perm => (
                      <code key={perm} className="block text-xs font-mono">
                        {perm}
                      </code>
                    ))}
                  </div>
                )}
                {allPermissions && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Todas:</p>
                    {allPermissions.map(perm => (
                      <code key={perm} className="block text-xs font-mono">
                        {perm}
                      </code>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Ações */}
            <div className="flex w-full flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.back()}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
              <Button className="flex-1" onClick={() => router.push('/')}>
                <Home className="mr-2 h-4 w-4" />
                Ir para Início
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Usuário tem permissão - renderizar conteúdo
  return <>{children}</>;
}

// =============================================================================
// EXPORTS
// =============================================================================

export default ProtectedPage;
