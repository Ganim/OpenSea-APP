/**
 * OpenSea OS - Time Bank Utilities
 */

import type { TimeBank } from '@/types/hr';

/**
 * Formata o saldo em horas com sinal (+/-).
 * Ex: 12.5 → "+12,5h", -3 → "-3h", 0 → "0h"
 */
export function formatBalance(balance: number): string {
  if (balance === 0) return '0h';
  const sign = balance > 0 ? '+' : '';
  const formatted =
    balance % 1 === 0 ? String(balance) : balance.toFixed(1).replace('.', ',');
  return `${sign}${formatted}h`;
}

/**
 * Retorna o status do saldo: 'positive', 'negative' ou 'zero'.
 */
export function getBalanceStatus(
  timeBank: TimeBank
): 'positive' | 'negative' | 'zero' {
  if (timeBank.balance > 0) return 'positive';
  if (timeBank.balance < 0) return 'negative';
  return 'zero';
}

/**
 * Retorna classes CSS de cor baseado no saldo.
 */
export function getBalanceColor(balance: number): string {
  if (balance > 0) return 'text-emerald-600 dark:text-emerald-400';
  if (balance < 0) return 'text-red-600 dark:text-red-400';
  return 'text-muted-foreground';
}

/**
 * Formata o ano para exibição.
 */
export function formatYear(year: number): string {
  return String(year);
}
