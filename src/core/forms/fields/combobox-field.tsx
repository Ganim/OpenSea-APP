/**
 * OpenSea OS - Combobox Field
 * Campo de seleção com busca e criação de novas opções
 */

'use client';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { FieldConfig } from '@/core/types';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { FormFieldWrapper } from '../components/form-field-wrapper';

export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface ComboboxFieldProps<T = unknown> {
  field: FieldConfig<T>;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  formData?: T;
}

export function ComboboxField<T = unknown>({
  field,
  value,
  onChange,
  error,
  disabled,
  formData,
}: ComboboxFieldProps<T>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [options, setOptions] = useState<ComboboxOption[]>(
    (field.options || []) as ComboboxOption[]
  );

  // Evaluate disabled if it's a function
  const isDisabled =
    disabled ||
    (typeof field.disabled === 'function'
      ? formData
        ? field.disabled(formData)
        : false
      : field.disabled);

  // Get current selected option
  const selectedOption = options.find(opt => opt.value === value);

  // Filter options based on search
  const filteredOptions = search
    ? options.filter(option =>
        option.label.toLowerCase().includes(search.toLowerCase())
      )
    : options;

  // Check if search matches an existing option
  const exactMatch = options.some(
    opt => opt.label.toLowerCase() === search.toLowerCase()
  );

  // Handle selection
  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue === value ? '' : selectedValue);
    setOpen(false);
    setSearch('');
  };

  // Handle create new option
  const handleCreate = () => {
    if (!search.trim() || exactMatch) return;

    const newOption: ComboboxOption = {
      value: search.toLowerCase().replace(/\s+/g, '-'),
      label: search,
    };

    setOptions([...options, newOption]);
    onChange(newOption.value);
    setOpen(false);
    setSearch('');
  };

  // Handle clear
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <FormFieldWrapper
      id={String(field.name)}
      label={field.label}
      required={field.required}
      description={field.description}
      error={error}
      icon={field.icon}
      colSpan={field.colSpan}
      disabled={isDisabled}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={isDisabled}
            className={cn(
              'w-full justify-between',
              !selectedOption && 'text-muted-foreground',
              error && 'border-destructive'
            )}
          >
            <span className="truncate">
              {selectedOption?.label || field.placeholder || 'Selecione...'}
            </span>
            <div className="flex items-center gap-1">
              {selectedOption && (
                <X
                  className="h-4 w-4 opacity-50 hover:opacity-100"
                  onClick={handleClear}
                />
              )}
              <ChevronsUpDown className="h-4 w-4 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder={`Buscar ${field.label?.toLowerCase()}...`}
              value={search}
              onValueChange={setSearch}
            />
            <CommandEmpty>
              {field.creatable && search ? (
                <div className="py-6 text-center text-sm">
                  <p className="text-muted-foreground mb-2">
                    Nenhum resultado encontrado.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCreate}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Criar &quot;{search}&quot;
                  </Button>
                </div>
              ) : (
                'Nenhum resultado encontrado.'
              )}
            </CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {filteredOptions.map(option => {
                const Icon = option.icon;
                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option.value)}
                    disabled={option.disabled}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === option.value ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className="flex items-center gap-2">
                      {Icon && <Icon className="h-4 w-4" />}
                      <span>{option.label}</span>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>

            {/* Create button at bottom if creatable and has search */}
            {field.creatable &&
              search &&
              !exactMatch &&
              filteredOptions.length > 0 && (
                <div className="border-t p-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCreate}
                    className="w-full gap-2 justify-start"
                  >
                    <Plus className="h-4 w-4" />
                    Criar &quot;{search}&quot;
                  </Button>
                </div>
              )}
          </Command>
        </PopoverContent>
      </Popover>
    </FormFieldWrapper>
  );
}

export default ComboboxField;
