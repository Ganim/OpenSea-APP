/**
 * Protected Route Component
 * Protege rotas que requerem autenticação
 */

'use client';

import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'USER' | 'MANAGER' | 'ADMIN';
}

export function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Usando timeout para evitar setState síncrono no effect
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!isLoading && !isAuthenticated) {
      console.log('🔒 Usuário não autenticado, redirecionando para /login');
      router.push('/fast-login');
      return;
    }

    // Verificar permissões de role
    if (!isLoading && isAuthenticated && requiredRole && user) {
      const roleHierarchy = { USER: 0, MANAGER: 1, ADMIN: 2 };
      const userRoleLevel = roleHierarchy[user.role];
      const requiredRoleLevel = roleHierarchy[requiredRole];

      if (userRoleLevel < requiredRoleLevel) {
        console.log('🔒 Usuário sem permissão, redirecionando para dashboard');
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, router, mounted, requiredRole, user]);

  // Evitar hydration mismatch
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner className="w-16 h-16" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Verificar role
  if (requiredRole && user) {
    const roleHierarchy = { USER: 0, MANAGER: 1, ADMIN: 2 };
    const userRoleLevel = roleHierarchy[user.role];
    const requiredRoleLevel = roleHierarchy[requiredRole];

    if (userRoleLevel < requiredRoleLevel) {
      return null;
    }
  }

  return <>{children}</>;
}
