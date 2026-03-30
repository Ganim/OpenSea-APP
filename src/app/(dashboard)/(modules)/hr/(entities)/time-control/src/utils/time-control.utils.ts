import type { TimeEntry } from '@/types/hr';

const ENTRY_TYPE_LABELS: Record<string, string> = {
  CLOCK_IN: 'Entrada',
  CLOCK_OUT: 'Saída',
  BREAK_START: 'Início Intervalo',
  BREAK_END: 'Fim Intervalo',
  OVERTIME_START: 'Início Hora Extra',
  OVERTIME_END: 'Fim Hora Extra',
};

const ENTRY_TYPE_COLORS: Record<string, string> = {
  CLOCK_IN:
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  CLOCK_OUT: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
  BREAK_START:
    'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  BREAK_END:
    'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  OVERTIME_START:
    'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  OVERTIME_END:
    'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
};

export function getEntryTypeLabel(type: string): string {
  return ENTRY_TYPE_LABELS[type] ?? type;
}

export function getEntryTypeColor(type: string): string {
  return (
    ENTRY_TYPE_COLORS[type] ??
    'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  );
}

export function isEntryType(type: string): boolean {
  return ['CLOCK_IN', 'BREAK_END', 'OVERTIME_START'].includes(type);
}

export function isExitType(type: string): boolean {
  return ['CLOCK_OUT', 'BREAK_START', 'OVERTIME_END'].includes(type);
}

export function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('pt-BR');
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatHours(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m > 0 ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
}

export function groupEntriesByDate(
  entries: TimeEntry[]
): Record<string, TimeEntry[]> {
  const grouped: Record<string, TimeEntry[]> = {};
  for (const entry of entries) {
    const dateKey = new Date(entry.timestamp).toISOString().split('T')[0];
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(entry);
  }
  return grouped;
}

export function getDateLabel(isoDate: string): string {
  const date = new Date(isoDate + 'T12:00:00');
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Hoje';
  if (date.toDateString() === yesterday.toDateString()) return 'Ontem';

  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });
}
