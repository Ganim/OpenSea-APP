/**
 * Position Utilities
 * Funções utilitárias para cargos
 */

import type { Position } from '@/types/hr';

/**
 * Formata a data de criação/atualização
 */
export function formatDate(date: string | Date | undefined): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('pt-BR');
}

/**
 * Verifica se o cargo está ativo
 */
export function isActive(position: Position): boolean {
  return position.isActive && !position.deletedAt;
}

/**
 * Obtém o status do cargo
 */
export function getStatus(position: Position): 'active' | 'inactive' {
  return isActive(position) ? 'active' : 'inactive';
}

/**
 * Obtém o label do status
 */
export function getStatusLabel(position: Position): string {
  return isActive(position) ? 'Ativo' : 'Inativo';
}

/**
 * Formata o nível do cargo
 */
export function formatLevel(level: number): string {
  const levels: Record<number, string> = {
    1: 'Júnior',
    2: 'Pleno',
    3: 'Sênior',
    4: 'Especialista',
    5: 'Gerente',
    6: 'Diretor',
    7: 'Executivo',
  };
  return levels[level] || `Nível ${level}`;
}

/**
 * Formata salário
 */
export function formatSalary(salary: number | null | undefined): string {
  if (!salary) return '-';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(salary);
}

/**
 * Obtém a faixa salarial formatada
 */
export function getSalaryRange(position: Position): string {
  if (!position.minSalary && !position.maxSalary) return 'Não definida';
  if (position.minSalary && !position.maxSalary) {
    return `A partir de ${formatSalary(position.minSalary)}`;
  }
  if (!position.minSalary && position.maxSalary) {
    return `Até ${formatSalary(position.maxSalary)}`;
  }
  return `${formatSalary(position.minSalary)} - ${formatSalary(position.maxSalary)}`;
}
