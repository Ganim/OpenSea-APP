/**
 * Protected Route Component
 * Protege rotas que requerem autenticação e/ou permissões específicas
 */

'use client';

import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { useAuth } from '@/contexts/auth-context';
import { usePermissions } from '@/hooks/use-permissions';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Permissão única necessária para acessar a rota */
  requiredPermission?: string;
  /** Múltiplas permissões (OR - precisa de pelo menos uma) */
  requiredPermissions?: string[];
  /** Se true, requer TODAS as permissões (AND) */
  requireAll?: boolean;
}

export function ProtectedRoute({
  children,
  requiredPermission,
  requiredPermissions,
  requireAll = false,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isLoading: isPermissionsLoading,
  } = usePermissions();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Usando timeout para evitar setState síncrono no effect
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // E2E bypass: se estivermos num teste E2E e o parametro `e2e=1` estiver presente,
    // permitir acesso direto aos componentes protegidos.
    const isE2EBypass = process.env.NEXT_PUBLIC_E2E_TEST_BYPASS === 'true';

    if (isE2EBypass) {
      return;
    }

    if (!isAuthLoading && !isAuthenticated) {
      router.push('/fast-login');
      return;
    }

    // Verificar permissões (se especificadas)
    if (!isAuthLoading && !isPermissionsLoading && isAuthenticated) {
      const permissionsToCheck = requiredPermission
        ? [requiredPermission]
        : requiredPermissions || [];

      if (permissionsToCheck.length > 0) {
        const hasAccess = requireAll
          ? hasAllPermissions(...permissionsToCheck)
          : hasAnyPermission(...permissionsToCheck);

        if (!hasAccess) {
          router.push('/dashboard');
        }
      }
    }
  }, [
    isAuthenticated,
    isAuthLoading,
    isPermissionsLoading,
    router,
    mounted,
    requiredPermission,
    requiredPermissions,
    requireAll,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  ]);

  // Evitar hydration mismatch
  if (!mounted || isAuthLoading || isPermissionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner className="w-16 h-16" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Verificar permissões (se especificadas)
  const permissionsToCheck = requiredPermission
    ? [requiredPermission]
    : requiredPermissions || [];

  if (permissionsToCheck.length > 0) {
    const hasAccess = requireAll
      ? hasAllPermissions(...permissionsToCheck)
      : hasAnyPermission(...permissionsToCheck);

    if (!hasAccess) {
      return null;
    }
  }

  return <>{children}</>;
}
