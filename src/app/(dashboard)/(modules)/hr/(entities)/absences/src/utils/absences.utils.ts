/**
 * OpenSea OS - Absences Utils (HR)
 *
 * Funções utilitárias para labels e cores de ausências.
 */

import type { AbsenceType, AbsenceStatus } from '@/types/hr';

/* ===========================================
   TYPE LABELS (PT-BR)
   =========================================== */

const TYPE_LABELS: Record<AbsenceType, string> = {
  VACATION: 'Férias',
  SICK_LEAVE: 'Atestado Médico',
  PERSONAL_LEAVE: 'Licença Pessoal',
  MATERNITY_LEAVE: 'Licença Maternidade',
  PATERNITY_LEAVE: 'Licença Paternidade',
  BEREAVEMENT_LEAVE: 'Licença Nojo',
  WEDDING_LEAVE: 'Licença Casamento',
  MEDICAL_APPOINTMENT: 'Consulta Médica',
  JURY_DUTY: 'Júri/Convocação',
  UNPAID_LEAVE: 'Licença não Remunerada',
  OTHER: 'Outro',
};

export function getTypeLabel(type: AbsenceType): string {
  return TYPE_LABELS[type] ?? type;
}

/* ===========================================
   STATUS LABELS (PT-BR)
   =========================================== */

const STATUS_LABELS: Record<AbsenceStatus, string> = {
  PENDING: 'Pendente',
  APPROVED: 'Aprovada',
  REJECTED: 'Rejeitada',
  CANCELLED: 'Cancelada',
  IN_PROGRESS: 'Em Andamento',
  COMPLETED: 'Concluída',
};

export function getStatusLabel(status: AbsenceStatus): string {
  return STATUS_LABELS[status] ?? status;
}

/* ===========================================
   STATUS COLORS
   =========================================== */

const STATUS_COLORS: Record<AbsenceStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
  APPROVED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  REJECTED: 'bg-rose-100 text-rose-800 border-rose-200',
  CANCELLED: 'bg-slate-100 text-slate-600 border-slate-200',
  IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-200',
  COMPLETED: 'bg-green-100 text-green-800 border-green-200',
};

export function getStatusColor(status: AbsenceStatus): string {
  return (
    STATUS_COLORS[status] ?? 'bg-slate-100 text-slate-600 border-slate-200'
  );
}

/* ===========================================
   TYPE COLORS
   =========================================== */

const TYPE_COLORS: Record<AbsenceType, string> = {
  VACATION: 'bg-sky-100 text-sky-800 border-sky-200',
  SICK_LEAVE: 'bg-rose-100 text-rose-800 border-rose-200',
  PERSONAL_LEAVE: 'bg-violet-100 text-violet-800 border-violet-200',
  MATERNITY_LEAVE: 'bg-pink-100 text-pink-800 border-pink-200',
  PATERNITY_LEAVE: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  BEREAVEMENT_LEAVE: 'bg-slate-100 text-slate-800 border-slate-200',
  WEDDING_LEAVE: 'bg-amber-100 text-amber-800 border-amber-200',
  MEDICAL_APPOINTMENT: 'bg-orange-100 text-orange-800 border-orange-200',
  JURY_DUTY: 'bg-teal-100 text-teal-800 border-teal-200',
  UNPAID_LEAVE: 'bg-gray-100 text-gray-800 border-gray-200',
  OTHER: 'bg-zinc-100 text-zinc-800 border-zinc-200',
};

export function getTypeColor(type: AbsenceType): string {
  return TYPE_COLORS[type] ?? 'bg-zinc-100 text-zinc-800 border-zinc-200';
}
