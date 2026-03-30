import type { PPECategory, PPECondition, PPEAssignmentStatus } from '@/types/hr';

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
  status: PPEAssignmentStatus,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'ACTIVE':
      return 'default';
    case 'RETURNED':
      return 'secondary';
    case 'EXPIRED':
      return 'destructive';
    case 'LOST':
      return 'destructive';
    default:
      return 'outline';
  }
}

export function getStockVariant(
  isLowStock: boolean,
  currentStock: number,
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
