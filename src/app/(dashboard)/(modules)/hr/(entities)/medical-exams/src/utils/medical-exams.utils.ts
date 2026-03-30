/**
 * Medical Exams Utilities
 */

import type { MedicalExam } from '@/types/hr';

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

export const EXAM_TYPE_LABELS: Record<string, string> = {
  ADMISSIONAL: 'Admissional',
  PERIODICO: 'Periódico',
  MUDANCA_FUNCAO: 'Mudança de Função',
  RETORNO: 'Retorno ao Trabalho',
  DEMISSIONAL: 'Demissional',
};

export const EXAM_RESULT_LABELS: Record<string, string> = {
  APTO: 'Apto',
  INAPTO: 'Inapto',
  APTO_COM_RESTRICOES: 'Apto com Restrições',
};

export const APTITUDE_LABELS: Record<string, string> = {
  APTO: 'Apto',
  INAPTO: 'Inapto',
  APTO_COM_RESTRICOES: 'Apto com Restrições',
};

export function getExamTypeLabel(type: string): string {
  return EXAM_TYPE_LABELS[type] || type;
}

export function getExamResultLabel(result: string): string {
  return EXAM_RESULT_LABELS[result] || result;
}

export function getAptitudeLabel(aptitude: string): string {
  return APTITUDE_LABELS[aptitude] || aptitude;
}

export function getExamResultVariant(
  result: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (result) {
    case 'APTO':
      return 'default';
    case 'INAPTO':
      return 'destructive';
    case 'APTO_COM_RESTRICOES':
      return 'secondary';
    default:
      return 'outline';
  }
}

export function getExamTypeBadgeVariant(
  _exam: MedicalExam
): 'default' | 'secondary' | 'destructive' | 'outline' {
  return 'outline';
}

/**
 * Returns the expiration status of a medical exam.
 * - EXPIRED: past expiration date
 * - EXPIRING: within 30 days of expiration
 * - VALID: more than 30 days until expiration
 */
export type ExpirationStatus = 'VALID' | 'EXPIRING' | 'EXPIRED' | 'NO_EXPIRY';

export function getExpirationStatus(
  expirationDate: string | undefined
): ExpirationStatus {
  if (!expirationDate) return 'NO_EXPIRY';
  const now = new Date();
  const expDate = new Date(expirationDate);
  if (expDate < now) return 'EXPIRED';
  const thirtyDaysFromNow = new Date(now);
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  if (expDate <= thirtyDaysFromNow) return 'EXPIRING';
  return 'VALID';
}

export function getExpirationStatusLabel(status: ExpirationStatus): string {
  switch (status) {
    case 'VALID':
      return 'Válido';
    case 'EXPIRING':
      return 'Vencendo';
    case 'EXPIRED':
      return 'Vencido';
    case 'NO_EXPIRY':
      return 'Sem validade';
  }
}

export function getExpirationBadgeClasses(status: ExpirationStatus): string {
  switch (status) {
    case 'VALID':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/8 dark:text-emerald-300';
    case 'EXPIRING':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-500/8 dark:text-amber-300';
    case 'EXPIRED':
      return 'bg-rose-50 text-rose-700 dark:bg-rose-500/8 dark:text-rose-300';
    case 'NO_EXPIRY':
      return 'bg-slate-50 text-slate-700 dark:bg-slate-500/8 dark:text-slate-300';
  }
}

export function getDaysUntilExpiry(
  expirationDate: string | undefined
): number | null {
  if (!expirationDate) return null;
  const now = new Date();
  const expDate = new Date(expirationDate);
  return Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export const COMPLIANCE_STATUS_LABELS: Record<string, string> = {
  COMPLIANT: 'Conforme',
  EXPIRING: 'Vencendo',
  OVERDUE: 'Vencido',
  MISSING: 'Pendente',
};
