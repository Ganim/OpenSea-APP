/**
 * Bonus Utilities
 */

import type { Bonus } from '@/types/hr';

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(date: string | Date | undefined): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('pt-BR');
}

export function getPaidLabel(bonus: Bonus): string {
  return bonus.isPaid ? 'Paga' : 'Pendente';
}

export function getPaidColor(
  bonus: Bonus
): 'default' | 'secondary' | 'destructive' | 'outline' {
  return bonus.isPaid ? 'default' : 'secondary';
}
