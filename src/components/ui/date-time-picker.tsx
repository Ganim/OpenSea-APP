'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DateTimePickerProps {
  value?: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

const QUICK_TIMES = [
  { label: '08:00', hours: 8, minutes: 0 },
  { label: '09:00', hours: 9, minutes: 0 },
  { label: '12:00', hours: 12, minutes: 0 },
  { label: '14:00', hours: 14, minutes: 0 },
  { label: '18:00', hours: 18, minutes: 0 },
  { label: '23:59', hours: 23, minutes: 59 },
] as const;

function DateTimePicker({
  value,
  onChange,
  placeholder = 'Selecionar data e hora',
  disabled = false,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    value ?? undefined
  );
  const [hours, setHours] = React.useState<number>(value ? value.getHours() : 0);
  const [minutes, setMinutes] = React.useState<number>(
    value ? value.getMinutes() : 0
  );

  // Sync internal state when value prop changes
  React.useEffect(() => {
    if (value) {
      setSelectedDate(value);
      setHours(value.getHours());
      setMinutes(value.getMinutes());
    } else {
      setSelectedDate(undefined);
      setHours(0);
      setMinutes(0);
    }
  }, [value]);

  function handleConfirm() {
    if (!selectedDate) {
      onChange(null);
      setOpen(false);
      return;
    }

    const result = new Date(selectedDate);
    result.setHours(hours);
    result.setMinutes(minutes);
    result.setSeconds(0);
    result.setMilliseconds(0);
    onChange(result);
    setOpen(false);
  }

  function handleClear() {
    setSelectedDate(undefined);
    setHours(0);
    setMinutes(0);
    onChange(null);
    setOpen(false);
  }

  function handleHoursChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 0 && val <= 23) {
      setHours(val);
    }
  }

  function handleMinutesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 0 && val <= 59) {
      setMinutes(val);
    }
  }

  function handleQuickTime(h: number, m: number) {
    setHours(h);
    setMinutes(m);
  }

  const isQuickTimeSelected = (h: number, m: number) =>
    hours === h && minutes === m;

  const displayValue = value
    ? format(value, "dd MMM yyyy HH:mm", { locale: ptBR })
    : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 size-4" />
          {displayValue ?? placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          locale={ptBR}
        />

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Time section */}
        <div className="px-3 py-3">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Horário
          </span>

          <div className="mt-2 flex items-center gap-1">
            <input
              type="number"
              min={0}
              max={23}
              value={hours.toString().padStart(2, '0')}
              onChange={handleHoursChange}
              className="h-9 w-14 rounded-md border border-border bg-transparent px-2 text-center text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <span className="text-sm font-medium text-muted-foreground">:</span>
            <input
              type="number"
              min={0}
              max={59}
              value={minutes.toString().padStart(2, '0')}
              onChange={handleMinutesChange}
              className="h-9 w-14 rounded-md border border-border bg-transparent px-2 text-center text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Quick time chips */}
          <div className="mt-2 flex flex-wrap gap-1">
            {QUICK_TIMES.map((qt) => (
              <button
                key={qt.label}
                type="button"
                onClick={() => handleQuickTime(qt.hours, qt.minutes)}
                className={cn(
                  'rounded-md border px-2 py-1 text-xs font-medium transition-colors',
                  isQuickTimeSelected(qt.hours, qt.minutes)
                    ? 'border-primary bg-primary/15 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                )}
              >
                {qt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Footer */}
        <div className="flex items-center justify-between px-3 py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="text-destructive hover:text-destructive"
          >
            Limpar
          </Button>
          <Button variant="default" size="sm" onClick={handleConfirm}>
            Confirmar
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { DateTimePicker };
export type { DateTimePickerProps };
