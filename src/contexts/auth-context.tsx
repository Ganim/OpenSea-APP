'use client';

import { authConfig } from '@/config/api';
import { useLogin, useLogout, useMe, useRegister } from '@/hooks';
import { saveAccount } from '@/lib/saved-accounts';
import type { LoginCredentials, RegisterData, User } from '@/types';
import { useRouter } from 'next/navigation';
import React, { createContext, useContext } from 'react';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // Hooks de autenticação
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();

  // Hook para buscar dados do usuário
  // Sempre habilitado se houver token
  const hasToken =
    typeof window !== 'undefined' &&
    !!localStorage.getItem(authConfig.tokenKey);
  const {
    data: userData,
    isLoading: isLoadingUser,
    refetch: refetchUser,
    error: userError,
  } = useMe(hasToken);

  // Se houve erro ao buscar usuário (token inválido/expirado), limpa os tokens
  React.useEffect(() => {
    if (userError && hasToken) {
      console.log('🔑 Token inválido ou usuário não encontrado, limpando...');
      localStorage.removeItem(authConfig.tokenKey);
      localStorage.removeItem(authConfig.refreshTokenKey);
    }
  }, [userError, hasToken]);

  const user = userData?.user || null;
  const isAuthenticated = !!user && hasToken && !userError;

  // Login
  const login = async (credentials: LoginCredentials) => {
    try {
      console.log('🔐 Iniciando login...');
      const response = await loginMutation.mutateAsync(credentials);
      console.log('✅ Login bem-sucedido:', response);

      // Salva os tokens usando as chaves corretas
      localStorage.setItem(authConfig.tokenKey, response.token);
      localStorage.setItem(authConfig.refreshTokenKey, response.refreshToken);
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

      // Redireciona para o dashboard
      console.log('🚀 Redirecionando para /');
      router.push('/');
    } catch (error) {
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

      // Redireciona para login
      router.push('/fast-login');
    }
  };

  const value: AuthContextType = {
    user,
    isLoading: isLoadingUser,
    isAuthenticated,
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
