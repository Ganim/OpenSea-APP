/**
 * Users Module Utilities
 * Funções puras para manipulação de dados de usuários
 */

import type { User } from '@/types/auth';

/**
 * Obter nome completo do usuário
 */
export function getFullName(user: User | null | undefined): string | null {
  if (!user?.profile?.name) return null;
  const { name, surname } = user.profile;
  return surname ? `${name} ${surname}`.trim() : name;
}

/**
 * Formatar informações do usuário
 */
export function formatUserInfo(user: User): {
  displayName: string;
  email: string;
  fullName: string | null;
} {
  return {
    displayName: user.username,
    email: user.email,
    fullName: getFullName(user),
  };
}

/**
 * Verificar se usuário tem login anterior
 */
export function hasLastLogin(user: User): boolean {
  return !!user.lastLoginAt;
}

/**
 * Obter data de último acesso formatada
 */
export function formatLastLogin(date: string | Date | null): string {
  if (!date) return 'Nunca';
  return new Date(date).toLocaleDateString('pt-BR');
}

/**
 * Obter data e hora de último acesso formatada
 */
export function formatLastLoginDateTime(date: string | Date | null): string {
  if (!date) return 'Nunca';
  return new Date(date).toLocaleString('pt-BR');
}

/**
 * Validar dados do novo usuário
 */
export function isNewUserValid(userData: {
  username?: string;
  email?: string;
  password?: string;
}): boolean {
  return !!(userData.username && userData.email && userData.password);
}

/**
 * Validar email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validar username
 */
export function isValidUsername(username: string): boolean {
  return username.length >= 3 && username.length <= 50;
}

/**
 * Validar senha
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}
