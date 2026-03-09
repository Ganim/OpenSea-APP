/**
 * OpenSea OS - Vacations Utils (HR)
 *
 * Funções utilitárias para labels e cores de férias.
 */

import type { VacationStatus } from '@/types/hr';

/* ===========================================
   DATE FORMATTING
   =========================================== */

export function formatDate(date: string | Date | undefined | null): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('pt-BR');
}

/* ===========================================
   STATUS LABELS (PT-BR)
   =========================================== */

export function getStatusLabel(status: VacationStatus): string {
  const map: Record<VacationStatus, string> = {
    PENDING: 'Pendente',
    AVAILABLE: 'Disponível',
    SCHEDULED: 'Agendada',
    IN_PROGRESS: 'Em Andamento',
    COMPLETED: 'Concluída',
    EXPIRED: 'Expirada',
    SOLD: 'Vendida',
  };
  return map[status] ?? status;
}

/* ===========================================
   STATUS COLORS
   =========================================== */

export function getStatusColor(
  status: VacationStatus
): 'default' | 'secondary' | 'destructive' | 'outline' {
  const map: Record<
    VacationStatus,
    'default' | 'secondary' | 'destructive' | 'outline'
  > = {
    PENDING: 'secondary',
    AVAILABLE: 'outline',
    SCHEDULED: 'default',
    IN_PROGRESS: 'default',
    COMPLETED: 'secondary',
    EXPIRED: 'destructive',
    SOLD: 'outline',
  };
  return map[status] ?? 'secondary';
}

/* ===========================================
   DAYS INFO
   =========================================== */

export function formatDaysInfo(
  totalDays: number,
  usedDays: number,
  soldDays: number,
  remainingDays: number
): string {
  return `${remainingDays}/${totalDays} dias restantes`;
}
