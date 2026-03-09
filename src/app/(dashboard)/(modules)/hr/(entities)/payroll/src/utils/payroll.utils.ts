import type { PayrollStatus } from '@/types/hr';

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(date: string | Date | undefined | null): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('pt-BR');
}

export function getStatusLabel(status: PayrollStatus): string {
  const map: Record<PayrollStatus, string> = {
    DRAFT: 'Rascunho',
    PROCESSING: 'Processando',
    CALCULATED: 'Calculada',
    APPROVED: 'Aprovada',
    PAID: 'Paga',
    CANCELLED: 'Cancelada',
  };
  return map[status] ?? status;
}

export function getStatusColor(
  status: PayrollStatus
): 'default' | 'secondary' | 'destructive' | 'outline' {
  const map: Record<
    PayrollStatus,
    'default' | 'secondary' | 'destructive' | 'outline'
  > = {
    DRAFT: 'secondary',
    PROCESSING: 'outline',
    CALCULATED: 'outline',
    APPROVED: 'default',
    PAID: 'default',
    CANCELLED: 'destructive',
  };
  return map[status] ?? 'secondary';
}

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export function formatMonthYear(month: number, year: number): string {
  return `${MONTH_NAMES[month - 1] ?? month}/${year}`;
}
