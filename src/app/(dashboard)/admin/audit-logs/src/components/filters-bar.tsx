'use client';

import type { FilterOption } from '@/components/ui/filter-dropdown';
import { FilterDropdown } from '@/components/ui/filter-dropdown';
import { Layers, Zap, Box } from 'lucide-react';
import { DateRangeFilter } from './date-range-filter';

interface FiltersBarProps {
  moduleOptions: FilterOption[];
  modules: string[];
  onModulesChange: (ids: string[]) => void;
  entityOptions: FilterOption[];
  entities: string[];
  onEntitiesChange: (ids: string[]) => void;
  actionOptions: FilterOption[];
  actions: string[];
  onActionsChange: (ids: string[]) => void;
  startDate: string;
  onStartDateChange: (date: string) => void;
  endDate: string;
  onEndDateChange: (date: string) => void;
}

export const FiltersBar: React.FC<FiltersBarProps> = ({
  moduleOptions,
  modules,
  onModulesChange,
  entityOptions,
  entities,
  onEntitiesChange,
  actionOptions,
  actions,
  onActionsChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
}) => {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <FilterDropdown
        label="Módulo"
        icon={Layers}
        options={moduleOptions}
        selected={modules}
        onSelectionChange={onModulesChange}
        activeColor="blue"
        searchPlaceholder="Buscar módulo..."
        emptyText="Nenhum módulo encontrado."
      />

      <FilterDropdown
        label="Entidade"
        icon={Box}
        options={entityOptions}
        selected={entities}
        onSelectionChange={onEntitiesChange}
        activeColor="emerald"
        searchPlaceholder="Buscar entidade..."
        emptyText="Nenhuma entidade encontrada."
      />

      <FilterDropdown
        label="Ação"
        icon={Zap}
        options={actionOptions}
        selected={actions}
        onSelectionChange={onActionsChange}
        activeColor="violet"
        searchPlaceholder="Buscar ação..."
        emptyText="Nenhuma ação encontrada."
      />

      {/* Filtro de período com presets e calendário */}
      <div className="ml-auto">
        <DateRangeFilter
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={onStartDateChange}
          onEndDateChange={onEndDateChange}
        />
      </div>
    </div>
  );
};
