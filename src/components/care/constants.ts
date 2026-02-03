import type { CareCategory } from '@/types/stock';

export const CATEGORY_META: Record<
  CareCategory,
  {
    key: CareCategory;
    label: string;
    icon: string;
    description: string;
  }
> = {
  WASH: {
    key: 'WASH',
    label: 'Lavagem',
    icon: 'droplet',
    description: 'Instruções de lavagem à máquina ou à mão',
  },
  BLEACH: {
    key: 'BLEACH',
    label: 'Alvejante',
    icon: 'flask',
    description: 'Uso de alvejantes e branqueadores',
  },
  DRY: {
    key: 'DRY',
    label: 'Secagem',
    icon: 'wind',
    description: 'Métodos de secagem recomendados',
  },
  IRON: {
    key: 'IRON',
    label: 'Passar Ferro',
    icon: 'thermometer',
    description: 'Temperaturas e restrições de ferro',
  },
  PROFESSIONAL: {
    key: 'PROFESSIONAL',
    label: 'Limpeza Profissional',
    icon: 'briefcase',
    description: 'Lavagem a seco e limpeza especializada',
  },
};

export const CARE_CATEGORIES: CareCategory[] = [
  'WASH',
  'BLEACH',
  'DRY',
  'IRON',
  'PROFESSIONAL',
];

export const MAX_CARE_INSTRUCTIONS = 20;
