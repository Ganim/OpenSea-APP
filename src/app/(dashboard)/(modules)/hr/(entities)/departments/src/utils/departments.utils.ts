/**
 * Department Utilities
 * Funções utilitárias para departamentos
 */

import type { Department } from '@/types/hr';

/**
 * Formata a data de criação/atualização
 */
export function formatDate(date: string | Date | undefined): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('pt-BR');
}

/**
 * Verifica se o departamento está ativo
 */
export function isActive(department: Department): boolean {
  return department.isActive && !department.deletedAt;
}

/**
 * Obtém o status do departamento
 */
export function getStatus(department: Department): 'active' | 'inactive' {
  return isActive(department) ? 'active' : 'inactive';
}

/**
 * Obtém o label do status
 */
export function getStatusLabel(department: Department): string {
  return isActive(department) ? 'Ativo' : 'Inativo';
}
