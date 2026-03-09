/**
 * Deduction Utilities
 * Funções utilitárias para deduções
 */

import type { Deduction } from '@/types/hr';

/**
 * Formata valor monetário em BRL
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formata data para pt-BR
 */
export function formatDate(date: string | Date | undefined): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('pt-BR');
}

/**
 * Retorna o status de aplicação da dedução
 */
export function getAppliedStatus(deduction: Deduction): 'applied' | 'pending' {
  return deduction.isApplied ? 'applied' : 'pending';
}

/**
 * Retorna o label do status de aplicação
 */
export function getAppliedLabel(deduction: Deduction): string {
  return deduction.isApplied ? 'Aplicada' : 'Pendente';
}

/**
 * Retorna a cor do badge de status de aplicação
 */
export function getAppliedColor(
  deduction: Deduction
): 'default' | 'secondary' | 'destructive' | 'outline' {
  return deduction.isApplied ? 'default' : 'secondary';
}

/**
 * Formata informações de parcelas
 * Ex: "3/12 parcelas"
 */
export function formatInstallments(deduction: Deduction): string | null {
  if (
    !deduction.isRecurring ||
    !deduction.installments ||
    !deduction.currentInstallment
  ) {
    return null;
  }
  return `${deduction.currentInstallment}/${deduction.installments} parcelas`;
}
