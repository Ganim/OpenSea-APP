'use client';

import type { CareCategory, CareOption } from '@/types/stock';
import { Beaker, Briefcase, Droplet, Thermometer, Wind } from 'lucide-react';
import { CareOptionCard } from './care-option-card';
import { CATEGORY_META } from './constants';

interface CareCategorySectionProps {
  category: CareCategory;
  options: CareOption[];
  selectedIds: string[];
  disabled?: boolean;
  onToggle: (code: string) => void;
}

/**
 * Seção agrupada por categoria com grid de opções
 */
export function CareCategorySection({
  category,
  options,
  selectedIds,
  disabled,
  onToggle,
}: CareCategorySectionProps) {
  const meta = CATEGORY_META[category];
  const selectedCount = options.filter(o =>
    selectedIds.includes(o.code)
  ).length;

  // Ícones por categoria
  const iconMap: Record<CareCategory, React.ReactNode> = {
    WASH: <Droplet className="w-5 h-5 text-blue-500" />,
    BLEACH: <Beaker className="w-5 h-5 text-purple-500" />,
    DRY: <Wind className="w-5 h-5 text-cyan-500" />,
    IRON: <Thermometer className="w-5 h-5 text-orange-500" />,
    PROFESSIONAL: <Briefcase className="w-5 h-5 text-indigo-500" />,
  };

  return (
    <div className="space-y-4">
      {/* Header da Categoria */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-lg dark:bg-slate-700">
            {iconMap[category]}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {meta.label}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {meta.description}
            </p>
          </div>
        </div>
        {selectedCount > 0 && (
          <span className="px-3 py-1 text-xs font-medium bg-blue-500/10 text-blue-600 rounded-full whitespace-nowrap dark:bg-blue-500/20 dark:text-blue-400">
            {selectedCount} selecionado
            {selectedCount > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Grid de Opções */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {options.map(option => (
          <CareOptionCard
            key={option.code}
            option={option}
            selected={selectedIds.includes(option.code)}
            disabled={disabled}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  );
}
