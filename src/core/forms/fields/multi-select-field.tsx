/**
 * OpenSea OS - MultiSelect Field
 * Campo de seleção múltipla com tags
 */

'use client';

import { Badge } from '@/components/ui/badge';
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
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { useState } from 'react';
import { FormFieldWrapper } from '../components/form-field-wrapper';

export interface MultiSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface MultiSelectFieldProps<T = unknown> {
  field: FieldConfig<T>;
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
  disabled?: boolean;
  formData?: T;
}

export function MultiSelectField<T = unknown>({
  field,
  value,
  onChange,
  error,
  disabled,
  formData,
}: MultiSelectFieldProps<T>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Evaluate disabled if it's a function
  const isDisabled =
    disabled ||
    (typeof field.disabled === 'function'
      ? formData
        ? field.disabled(formData)
        : false
      : field.disabled);
  const descriptionId = `${String(field.name)}-description`;
  const errorId = `${String(field.name)}-error`;
  const describedBy = error
    ? `${field.description ? `${descriptionId} ` : ''}${errorId}`
    : field.description
      ? descriptionId
      : undefined;

  // Get options from field config
  const options = (field.options || []) as MultiSelectOption[];

  // Current selected values
  const selectedValues = value || [];

  // Get selected option labels
  const selectedOptions = selectedValues
    .map(val => options.find(opt => opt.value === String(val)))
    .filter(Boolean) as MultiSelectOption[];

  // Handle selection toggle
  const handleToggle = (selectedValue: string) => {
    const newValues = selectedValues.includes(selectedValue)
      ? selectedValues.filter(v => v !== selectedValue)
      : [...selectedValues, selectedValue];
    onChange(newValues);
  };

  // Handle remove
  const handleRemove = (valueToRemove: string) => {
    onChange(selectedValues.filter(v => v !== valueToRemove));
  };

  // Handle clear all
  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  // Check if option is selected
  const isSelected = (optionValue: string) => {
    return selectedValues.includes(optionValue);
  };

  // Filter options based on search
  const filteredOptions = search
    ? options.filter(option =>
        option.label.toLowerCase().includes(search.toLowerCase())
      )
    : options;

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
      <div className="space-y-2">
        {/* Popover trigger */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              aria-invalid={!!error}
              aria-describedby={describedBy}
              disabled={isDisabled}
              className={cn(
                'w-full justify-between',
                !selectedValues.length && 'text-muted-foreground',
                error && 'border-destructive'
              )}
            >
              <span className="truncate">
                {selectedValues.length > 0
                  ? `${selectedValues.length} selecionado(s)`
                  : field.placeholder || 'Selecione...'}
              </span>
              <div className="flex items-center gap-1">
                {selectedValues.length > 0 && (
                  <X
                    className="h-4 w-4 opacity-50 hover:opacity-100"
                    onClick={handleClearAll}
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
              <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto">
                {filteredOptions.map(option => {
                  const Icon = option.icon;
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => handleToggle(option.value)}
                      disabled={option.disabled}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          isSelected(option.value) ? 'opacity-100' : 'opacity-0'
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
            </Command>
          </PopoverContent>
        </Popover>

        {/* Selected tags */}
        {selectedOptions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedOptions.map(option => {
              const Icon = option.icon;
              return (
                <Badge
                  key={option.value}
                  variant="secondary"
                  className="gap-1 pr-1"
                >
                  {Icon && <Icon className="h-3 w-3" />}
                  <span>{option.label}</span>
                  <button
                    type="button"
                    onClick={() => handleRemove(option.value)}
                    disabled={isDisabled}
                    aria-label={`Remover ${option.label}`}
                    className="rounded-full p-0.5 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
        )}
      </div>
    </FormFieldWrapper>
  );
}

export default MultiSelectField;
