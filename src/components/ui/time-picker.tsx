'use client';

import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

// =============================================================================
// TYPES
// =============================================================================

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Interval in minutes between preset options (default: 15) */
  interval?: number;
}

// =============================================================================
// HELPERS
// =============================================================================

function generatePresets(interval: number): string[] {
  const presets: string[] = [];
  for (let m = 0; m < 24 * 60; m += interval) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    presets.push(
      `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`
    );
  }
  return presets;
}

// Common work start/end times highlighted
const POPULAR_TIMES = new Set([
  '06:00',
  '07:00',
  '08:00',
  '09:00',
  '12:00',
  '13:00',
  '17:00',
  '18:00',
  '19:00',
  '22:00',
]);

function formatTimeInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

function isValidTime(time: string): boolean {
  if (!/^\d{2}:\d{2}$/.test(time)) return false;
  const [h, m] = time.split(':').map(Number);
  return h >= 0 && h <= 23 && m >= 0 && m <= 59;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function TimePicker({
  value,
  onChange,
  placeholder = '00:00',
  disabled = false,
  className,
  interval = 15,
}: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const selectedRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const presets = generatePresets(interval);

  // Sync inputValue when value changes externally
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleSelect = useCallback(
    (time: string) => {
      onChange(time);
      setInputValue(time);
      setOpen(false);
    },
    [onChange]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatTimeInput(e.target.value);
      setInputValue(formatted);

      if (isValidTime(formatted)) {
        onChange(formatted);
      }
    },
    [onChange]
  );

  const handleInputBlur = useCallback(() => {
    // On blur, revert to last valid value if current is invalid
    if (!isValidTime(inputValue)) {
      setInputValue(value);
    }
  }, [inputValue, value]);

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (isValidTime(inputValue)) {
          onChange(inputValue);
          setOpen(false);
        }
      }
      if (e.key === 'Escape') {
        setInputValue(value);
        setOpen(false);
      }
    },
    [inputValue, value, onChange]
  );

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild disabled={disabled}>
        <button
          type="button"
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-2.5 h-8 text-sm',
            'hover:bg-accent/50 transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
            'disabled:opacity-50 disabled:pointer-events-none',
            !value && 'text-muted-foreground',
            className
          )}
        >
          <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="tabular-nums">{value || placeholder}</span>
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-[260px] p-0"
        onOpenAutoFocus={e => {
          e.preventDefault();
          // Focus the input field
          setTimeout(() => inputRef.current?.select(), 0);
        }}
      >
        {/* Editable input */}
        <div className="px-3 pt-3 pb-2">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyDown={handleInputKeyDown}
              placeholder={placeholder}
              maxLength={5}
              className={cn(
                'w-full rounded-md border border-input bg-background px-3 py-2 text-center text-lg tabular-nums font-medium',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
              )}
            />
          </div>
        </div>

        {/* Preset grid */}
        <div
          className="px-2 pb-2 max-h-[200px] overflow-y-auto"
          onWheel={e => e.stopPropagation()}
        >
          <div className="grid grid-cols-4 gap-0.5">
            {presets.map(time => {
              const isSelected = value === time;
              const isPopular = POPULAR_TIMES.has(time);
              const isFullHour = time.endsWith(':00');

              return (
                <button
                  key={time}
                  ref={isSelected ? selectedRef : undefined}
                  type="button"
                  onClick={() => handleSelect(time)}
                  className={cn(
                    'rounded-md px-1 py-1.5 text-xs tabular-nums transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                    isSelected &&
                      'bg-primary text-primary-foreground hover:bg-primary/90',
                    !isSelected && isPopular && isFullHour && 'font-medium',
                    !isSelected && !isFullHour && 'text-muted-foreground'
                  )}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
