/**
 * Workplace Risks Utilities
 */

import type { WorkplaceRiskCategory, WorkplaceRiskSeverity } from '@/types/hr';

export const RISK_CATEGORY_LABELS: Record<string, string> = {
  FISICO: 'Físico',
  QUIMICO: 'Químico',
  BIOLOGICO: 'Biológico',
  ERGONOMICO: 'Ergonômico',
  ACIDENTE: 'Acidente',
};

export const RISK_SEVERITY_LABELS: Record<string, string> = {
  BAIXO: 'Baixo',
  MEDIO: 'Médio',
  ALTO: 'Alto',
  CRITICO: 'Crítico',
};

export const RISK_CATEGORY_OPTIONS: {
  value: WorkplaceRiskCategory;
  label: string;
}[] = [
  { value: 'FISICO', label: 'Físico' },
  { value: 'QUIMICO', label: 'Químico' },
  { value: 'BIOLOGICO', label: 'Biológico' },
  { value: 'ERGONOMICO', label: 'Ergonômico' },
  { value: 'ACIDENTE', label: 'Acidente' },
];

export const RISK_SEVERITY_OPTIONS: {
  value: WorkplaceRiskSeverity;
  label: string;
}[] = [
  { value: 'BAIXO', label: 'Baixo' },
  { value: 'MEDIO', label: 'Médio' },
  { value: 'ALTO', label: 'Alto' },
  { value: 'CRITICO', label: 'Crítico' },
];

export function getRiskCategoryLabel(category: string): string {
  return RISK_CATEGORY_LABELS[category] || category;
}

export function getRiskSeverityLabel(severity: string): string {
  return RISK_SEVERITY_LABELS[severity] || severity;
}

export function getRiskCategoryVariant(
  category: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (category) {
    case 'FISICO':
      return 'default';
    case 'QUIMICO':
      return 'destructive';
    case 'BIOLOGICO':
      return 'destructive';
    case 'ERGONOMICO':
      return 'secondary';
    case 'ACIDENTE':
      return 'destructive';
    default:
      return 'outline';
  }
}

export function getRiskSeverityVariant(
  severity: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (severity) {
    case 'BAIXO':
      return 'default';
    case 'MEDIO':
      return 'secondary';
    case 'ALTO':
      return 'destructive';
    case 'CRITICO':
      return 'destructive';
    default:
      return 'outline';
  }
}

export function getRiskSeverityColor(severity: string): string {
  switch (severity) {
    case 'BAIXO':
      return 'bg-emerald-500';
    case 'MEDIO':
      return 'bg-amber-500';
    case 'ALTO':
      return 'bg-orange-500';
    case 'CRITICO':
      return 'bg-rose-500';
    default:
      return 'bg-slate-500';
  }
}

export function getRiskCategoryIcon(category: string): string {
  switch (category) {
    case 'FISICO':
      return 'Zap';
    case 'QUIMICO':
      return 'FlaskConical';
    case 'BIOLOGICO':
      return 'Bug';
    case 'ERGONOMICO':
      return 'Armchair';
    case 'ACIDENTE':
      return 'AlertTriangle';
    default:
      return 'HelpCircle';
  }
}

export function formatDate(date: string | Date | undefined): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('pt-BR');
}
