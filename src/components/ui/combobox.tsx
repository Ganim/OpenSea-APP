'use client';

import { Check, ChevronsUpDown } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  emptyText?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = 'Selecionar...',
  emptyText = 'Nenhuma opção encontrada.',
  searchPlaceholder = 'Buscar...',
  disabled = false,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const selectedLabel = value
    ? options.find(option => option.value === value)?.label || placeholder
    : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'h-12 w-full rounded-(--input-radius) px-4 py-3 text-base justify-between',
            'backdrop-blur-(--glass-blur) bg-(--input-bg)',
            'border border-[rgb(var(--color-border))]',
            'text-[rgb(var(--color-foreground))] ',
            'placeholder:text-[rgb(var(--color-foreground-subtle))]',
            'transition-all duration-(--transition-normal)',
            'focus:outline-none focus:border-[rgb(var(--color-border-focus))]',
            'focus:ring-[3px] focus:ring-[rgb(var(--color-ring)/0.5)]',
            'disabled:pointer-events-none disabled:opacity-(--state-disabled-opacity) disabled:bg-[rgb(var(--color-background-muted))]',
            'aria-invalid:border-[rgb(var(--color-border-error))] aria-invalid:ring-[rgb(var(--color-destructive)/0.2)]',
            'file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium'
          )}
          disabled={disabled}
        >
          <span className="truncate">{selectedLabel}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} className="h-9" />
          <CommandEmpty>{emptyText}</CommandEmpty>
          <CommandList>
            <CommandGroup>
              {options.map(option => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  className="cursor-pointer h-10"
                  onSelect={() => {
                    onValueChange?.(option.value === value ? '' : option.value);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === option.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
