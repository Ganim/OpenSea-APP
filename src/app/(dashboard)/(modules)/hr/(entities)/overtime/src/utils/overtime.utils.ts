/**
 * OpenSea OS - Overtime Utilities
 */

import type { Overtime } from '@/types/hr';

export function formatDate(date: string | Date | undefined): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('pt-BR');
}

export function formatHours(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return `${h}h`;
  return `${h}h${m.toString().padStart(2, '0')}`;
}

export function getApprovalLabel(overtime: Overtime): string {
  if (overtime.approved === null) return 'Pendente';
  return overtime.approved ? 'Aprovada' : 'Rejeitada';
}

export function getApprovalColor(
  overtime: Overtime
): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (overtime.approved === null) return 'secondary';
  return overtime.approved ? 'default' : 'destructive';
}
