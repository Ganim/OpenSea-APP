import type {
  PPECategory,
  PPECondition,
  PPEAssignmentStatus,
} from '@/types/hr';

export const PPE_CATEGORY_LABELS: Record<PPECategory, string> = {
  HEAD: 'Cabeça',
  EYES: 'Olhos',
  EARS: 'Ouvidos',
  RESPIRATORY: 'Respiratório',
  HANDS: 'Mãos',
  FEET: 'Pés',
  BODY: 'Corpo',
  FALL_PROTECTION: 'Proteção contra Queda',
};

export const PPE_CONDITION_LABELS: Record<PPECondition, string> = {
  NEW: 'Novo',
  GOOD: 'Bom',
  WORN: 'Desgastado',
  DAMAGED: 'Danificado',
};

export const PPE_STATUS_LABELS: Record<PPEAssignmentStatus, string> = {
  ACTIVE: 'Ativo',
  RETURNED: 'Devolvido',
  EXPIRED: 'Expirado',
  LOST: 'Perdido',
};

export function getCategoryLabel(category: PPECategory): string {
  return PPE_CATEGORY_LABELS[category] ?? category;
}

export function getConditionLabel(condition: PPECondition): string {
  return PPE_CONDITION_LABELS[condition] ?? condition;
}

export function getStatusLabel(status: PPEAssignmentStatus): string {
  return PPE_STATUS_LABELS[status] ?? status;
}

export function getStatusVariant(
  status: PPEAssignmentStatus
): 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' {
  switch (status) {
    case 'ACTIVE':
      return 'success';
    case 'RETURNED':
      return 'secondary';
    case 'EXPIRED':
      return 'warning';
    case 'LOST':
      return 'destructive';
    default:
      return 'outline';
  }
}

export function getStockVariant(
  isLowStock: boolean,
  currentStock: number
): 'default' | 'destructive' | 'secondary' {
  if (currentStock <= 0) return 'destructive';
  if (isLowStock) return 'secondary';
  return 'default';
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

export const PPE_CATEGORIES: PPECategory[] = [
  'HEAD',
  'EYES',
  'EARS',
  'RESPIRATORY',
  'HANDS',
  'FEET',
  'BODY',
  'FALL_PROTECTION',
];

export const PPE_CATEGORY_COLORS: Record<PPECategory, string> = {
  HEAD: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/8 dark:text-sky-300 dark:border-sky-500/20',
  EYES: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/8 dark:text-violet-300 dark:border-violet-500/20',
  EARS: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/8 dark:text-teal-300 dark:border-teal-500/20',
  RESPIRATORY:
    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/8 dark:text-emerald-300 dark:border-emerald-500/20',
  HANDS:
    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/8 dark:text-amber-300 dark:border-amber-500/20',
  FEET: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/8 dark:text-rose-300 dark:border-rose-500/20',
  BODY: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-500/8 dark:text-slate-300 dark:border-slate-500/20',
  FALL_PROTECTION:
    'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/8 dark:text-rose-300 dark:border-rose-500/20',
};
