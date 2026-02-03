'use client';

import { authConfig } from '@/config/api';
import { useLogin, useLogout, useMe, useRegister } from '@/hooks';
import { saveAccount } from '@/lib/saved-accounts';
import type { LoginCredentials, RegisterData, User } from '@/types';
import { useRouter, usePathname } from 'next/navigation';
import React, { createContext, useContext, useState, useEffect } from 'react';

interface LoginResult {
  redirected: boolean;
  isSuperAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  login: (credentials: LoginCredentials) => Promise<LoginResult>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  // Estado reativo para controlar se temos token
  // Isso permite detectar quando tokens são removidos
  const [hasToken, setHasToken] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem(authConfig.tokenKey);
  });

  // Monitora mudanças no localStorage (inclui mudanças de outras abas)
  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem(authConfig.tokenKey);
      setHasToken(!!token);
    };

    // Verifica a cada navegação
    checkToken();

    // Listener para mudanças em outras abas
    const handleStorageChange = (e: StorageEvent) => {
      if (
        e.key === authConfig.tokenKey ||
        e.key === authConfig.refreshTokenKey
      ) {
        checkToken();
      }
    };

    // Listener para mudanças na mesma aba (custom event)
    const handleTokenChange = () => {
      checkToken();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-token-change', handleTokenChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-token-change', handleTokenChange);
    };
  }, [pathname]); // Re-verifica a cada mudança de rota

  // Hooks de autenticação
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();

  // Hook para buscar dados do usuário
  const {
    data: userData,
    isLoading: isLoadingUser,
    refetch: refetchUser,
    error: userError,
  } = useMe(hasToken);

  // E2E bypass: when running E2E tests, we may want to short-circuit auth
  // and provide a fake authenticated user to avoid flaky login flows.
  const isE2EBypass =
    typeof window !== 'undefined' &&
    process.env.NEXT_PUBLIC_E2E_TEST_BYPASS === 'true';

  // If bypass is active, ensure localStorage has a token so other code paths
  // that rely on its presence don't redirect; use a stable test token.
  if (isE2EBypass && typeof window !== 'undefined') {
    try {
      localStorage.setItem(authConfig.tokenKey, 'e2e-test-token');
    } catch (_) {}
  }

  // Lista de rotas públicas (que não requerem autenticação)
  const publicRoutes = [
    '/login',
    '/fast-login',
    '/register',
    '/reset-password',
    '/',
    '/select-tenant',
  ];

  // Verifica se a rota atual é pública
  const isPublicRoute = publicRoutes.some(
    route => pathname === route || pathname?.startsWith('/reset-password')
  );

  // Se houve erro ao buscar usuário (token inválido/expirado), limpa os tokens
  useEffect(() => {
    if (!userError || !hasToken) return;

    const status = (userError as Error & { status?: number }).status;
    const message = (userError.message || '').toLowerCase();

    const isAuthError =
      status === 401 ||
      status === 403 ||
      message.includes('unauthorized') ||
      message.includes('forbidden') ||
      message.includes('invalid token') ||
      message.includes('token inválido');

    if (isAuthError) {
      console.log('🔑 Token inválido ou usuário não encontrado, limpando...');
      localStorage.removeItem(authConfig.tokenKey);
      localStorage.removeItem(authConfig.refreshTokenKey);
      setHasToken(false);

      // Redireciona para login se não estiver em rota pública
      if (!isPublicRoute) {
        console.log('🔄 Redirecionando para login...');
        router.push('/fast-login?session=expired');
      }
    } else {
      console.warn('⚠️ Erro não-autorização em /me, tokens preservados', {
        status,
        message,
      });
    }
  }, [userError, hasToken, isPublicRoute, router]);

  // Redireciona para login se não tem token e está em rota protegida
  useEffect(() => {
    if (!hasToken && !isPublicRoute && !isLoadingUser) {
      console.log('🔒 Sem token em rota protegida, redirecionando...');
      router.push('/fast-login?session=expired');
    }
  }, [hasToken, isPublicRoute, isLoadingUser, router]);

  const user = userData?.user || null;
  // If E2E bypass is active, force authenticated state with a simple fake user
  const fakeUser: User | null = isE2EBypass
    ? {
        id: 'e2e-u1',
        username: 'e2e-test',
        email: 'test@example.com',
        createdAt: new Date(),
        lastLoginAt: new Date(),
        isSuperAdmin: false,
      }
    : null;

  const finalUser = isE2EBypass ? fakeUser : user;
  const isAuthenticated = isE2EBypass
    ? true
    : !!finalUser && hasToken && !userError;

  // Login
  const login = async (credentials: LoginCredentials): Promise<LoginResult> => {
    try {
      console.log('🔐 Iniciando login...');
      const response = await loginMutation.mutateAsync(credentials);
      console.log('✅ Login bem-sucedido:', response);

      // Salva os tokens usando as chaves corretas
      localStorage.setItem(authConfig.tokenKey, response.token);
      localStorage.setItem(authConfig.refreshTokenKey, response.refreshToken);
      if (response.sessionId) {
        localStorage.setItem('session_id', response.sessionId);
      }
      setHasToken(true);
      console.log('💾 Tokens salvos no localStorage');

      // Aguarda os dados do usuário serem carregados
      console.log('🔄 Buscando dados do usuário...');
      const userResult = await refetchUser();
      console.log('✅ Dados do usuário carregados');

      // Salva a conta para Fast Login
      if (userResult.data?.user) {
        const u = userResult.data.user;
        saveAccount({
          id: u.id,
          identifier: credentials.email, // Salva o que o usuário digitou (email ou username)
          displayName: u.profile?.name
            ? `${u.profile.name}${u.profile.surname ? ` ${u.profile.surname}` : ''}`
            : u.username,
          avatarUrl: u.profile?.avatarUrl,
        });
        console.log('💾 Conta salva para Fast Login');
      }

      // Fluxo padrão segue para o caller decidir o redirecionamento
      return {
        redirected: false,
        isSuperAdmin: userResult.data?.user?.isSuperAdmin ?? false,
      };
    } catch (error) {
      const err = error as Error & {
        status?: number;
        data?: { code?: string; resetToken?: string; reason?: string };
        code?: string;
      };

      const code = err?.code || err?.data?.code;
      if (code === 'PASSWORD_RESET_REQUIRED') {
        const resetToken = err?.data?.resetToken;
        const reason = err?.data?.reason;

        if (resetToken) {
          const search = new URLSearchParams({
            token: resetToken,
            forced: 'true',
          });
          if (reason) search.set('reason', reason);
          router.push(`/reset-password?${search.toString()}`);
          // Não propaga o erro para evitar overlay/vermelho antes do redirect
          return { redirected: true };
        }
      }

      console.error('❌ Erro no login:', error);
      throw error;
    }
  };

  // Register
  const register = async (data: RegisterData) => {
    try {
      // Cria o usuário via endpoint de autenticação
      await registerMutation.mutateAsync(data);

      // Após registro, faz login automático
      await login({
        email: data.email,
        password: data.password,
      });
    } catch (error) {
      console.error('Erro no registro:', error);
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      // Limpa os tokens independentemente do resultado
      localStorage.removeItem(authConfig.tokenKey);
      localStorage.removeItem(authConfig.refreshTokenKey);
      localStorage.removeItem('session_id');
      setHasToken(false);

      // Redireciona para login
      router.push('/fast-login');
    }
  };

  const value: AuthContextType = {
    user,
    isLoading: isLoadingUser,
    isAuthenticated,
    isSuperAdmin: finalUser?.isSuperAdmin ?? false,
    login,
    register,
    logout,
    refetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
