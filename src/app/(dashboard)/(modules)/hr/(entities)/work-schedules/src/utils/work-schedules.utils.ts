/**
 * Work Schedule Utilities
 * Funções utilitárias para escalas de trabalho
 */

import type { WorkSchedule } from '@/types/hr';

const DAYS_PT = {
  monday: 'Segunda',
  tuesday: 'Terça',
  wednesday: 'Quarta',
  thursday: 'Quinta',
  friday: 'Sexta',
  saturday: 'Sábado',
  sunday: 'Domingo',
} as const;

type DayKey = keyof typeof DAYS_PT;

export function formatDate(date: string | Date | undefined): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('pt-BR');
}

export function isActive(schedule: WorkSchedule): boolean {
  return schedule.isActive;
}

export function getStatus(schedule: WorkSchedule): 'active' | 'inactive' {
  return isActive(schedule) ? 'active' : 'inactive';
}

export function getStatusLabel(schedule: WorkSchedule): string {
  return isActive(schedule) ? 'Ativo' : 'Inativo';
}

export function formatWeeklyHours(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m > 0 ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
}

export function getDayLabel(day: DayKey): string {
  return DAYS_PT[day];
}

export function getDaySchedule(
  schedule: WorkSchedule,
  day: DayKey
): { start: string | null; end: string | null } {
  const startKey = `${day}Start` as keyof WorkSchedule;
  const endKey = `${day}End` as keyof WorkSchedule;
  return {
    start: (schedule[startKey] as string | null) ?? null,
    end: (schedule[endKey] as string | null) ?? null,
  };
}

export function formatDayRange(start: string | null, end: string | null): string {
  if (!start || !end) return 'Folga';
  return `${start} - ${end}`;
}

export const WEEK_DAYS: DayKey[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];
