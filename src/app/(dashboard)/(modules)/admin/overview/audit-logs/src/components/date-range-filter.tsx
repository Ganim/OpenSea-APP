'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { format, subHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import type { DateRange } from 'react-day-picker';

type PresetKey = '24h' | '48h' | '72h' | 'custom';

interface DatePreset {
  key: PresetKey;
  label: string;
}

const PRESETS: DatePreset[] = [
  { key: '24h', label: 'Últimas 24 horas' },
  { key: '48h', label: 'Últimas 48 horas' },
  { key: '72h', label: 'Últimas 72 horas' },
];

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}) => {
  const [open, setOpen] = useState(false);
  const [activePreset, setActivePreset] = useState<PresetKey | null>(null);

  const dateRange: DateRange | undefined = useMemo(() => {
    if (!startDate && !endDate) return undefined;
    return {
      from: startDate ? new Date(`${startDate}T00:00:00`) : undefined,
      to: endDate ? new Date(`${endDate}T23:59:59`) : undefined,
    };
  }, [startDate, endDate]);

  const hasValue = !!startDate || !!endDate;

  const triggerLabel = useMemo(() => {
    if (activePreset && activePreset !== 'custom') {
      return PRESETS.find(p => p.key === activePreset)?.label ?? 'Período';
    }
    if (startDate && endDate) {
      const from = format(new Date(`${startDate}T00:00:00`), 'dd/MM', {
        locale: ptBR,
      });
      const to = format(new Date(`${endDate}T23:59:59`), 'dd/MM', {
        locale: ptBR,
      });
      return `${from} — ${to}`;
    }
    if (startDate) {
      return `A partir de ${format(new Date(`${startDate}T00:00:00`), 'dd/MM', { locale: ptBR })}`;
    }
    if (endDate) {
      return `Até ${format(new Date(`${endDate}T23:59:59`), 'dd/MM', { locale: ptBR })}`;
    }
    return 'Período';
  }, [startDate, endDate, activePreset]);

  const handlePreset = useCallback(
    (preset: PresetKey) => {
      const now = new Date();
      const hoursMap: Record<string, number> = {
        '24h': 24,
        '48h': 48,
        '72h': 72,
      };
      const hours = hoursMap[preset];
      if (!hours) return;

      const from = subHours(now, hours);
      onStartDateChange(format(from, 'yyyy-MM-dd'));
      onEndDateChange(format(now, 'yyyy-MM-dd'));
      setActivePreset(preset);
      setOpen(false);
    },
    [onStartDateChange, onEndDateChange]
  );

  const handleRangeSelect = useCallback(
    (range: DateRange | undefined) => {
      if (!range) {
        onStartDateChange('');
        onEndDateChange('');
        setActivePreset(null);
        return;
      }
      if (range.from) {
        onStartDateChange(format(range.from, 'yyyy-MM-dd'));
      }
      if (range.to) {
        onEndDateChange(format(range.to, 'yyyy-MM-dd'));
        setActivePreset('custom');
        // Fecha o popover quando os dois limites estão selecionados
        if (range.from) {
          setOpen(false);
        }
      }
    },
    [onStartDateChange, onEndDateChange]
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onStartDateChange('');
      onEndDateChange('');
      setActivePreset(null);
    },
    [onStartDateChange, onEndDateChange]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'h-9 gap-1.5 text-sm font-normal',
            hasValue &&
              'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-200 dark:hover:bg-blue-950/50'
          )}
        >
          <CalendarIcon className="w-3.5 h-3.5" />
          {triggerLabel}
          {hasValue && (
            <X
              className="w-3 h-3 ml-0.5 opacity-60 hover:opacity-100"
              onClick={handleClear}
            />
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="end">
        {/* Presets */}
        <div className="p-2 space-y-0.5">
          {PRESETS.map(preset => (
            <button
              key={preset.key}
              type="button"
              onClick={() => handlePreset(preset.key)}
              className={cn(
                'w-full text-left text-sm px-3 py-1.5 rounded-md transition-colors',
                activePreset === preset.key
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-200'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10'
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <Separator className="w-[96%]! mx-auto" />

        {/* Calendário */}
        <div className="p-2">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 px-1 mb-2">
            Intervalo personalizado
          </p>
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={handleRangeSelect}
            numberOfMonths={2}
            locale={ptBR}
          />
        </div>

        {/* Limpar - só aparece quando tem valor */}
        {hasValue && (
          <>
            <Separator className="w-[96%]! mx-auto" />
            <div className="p-2">
              <button
                type="button"
                onClick={() => {
                  onStartDateChange('');
                  onEndDateChange('');
                  setActivePreset(null);
                  setOpen(false);
                }}
                className="w-full text-center cursor-pointer text-sm px-3 py-1.5 rounded-md transition-colors text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
              >
                Limpar período
              </button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
};
