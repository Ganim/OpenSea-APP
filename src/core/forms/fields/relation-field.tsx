/**
 * OpenSea OS - Relation Field
 * Campo de seleção de relacionamento (autocomplete)
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
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { useState } from 'react';
import { FormFieldWrapper } from '../components/form-field-wrapper';

export interface RelationOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface RelationFieldProps<T = unknown> {
  field: FieldConfig<T>;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  error?: string;
  disabled?: boolean;
  formData?: T;
}

export function RelationField<T = unknown>({
  field,
  value,
  onChange,
  error,
  disabled,
  formData,
}: RelationFieldProps<T>) {
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
  const options = (field.relationOptions || []) as RelationOption[];

  // Check if multi-select
  const isMultiple = field.multiple || false;

  // Get current value(s)
  const currentValue = isMultiple
    ? Array.isArray(value)
      ? value
      : []
    : typeof value === 'string'
      ? value
      : '';

  // Get selected option labels
  const getSelectedLabels = () => {
    if (isMultiple && Array.isArray(currentValue)) {
      return currentValue
        .map(v => options.find(opt => opt.value === v)?.label)
        .filter(Boolean);
    }
    if (!isMultiple && typeof currentValue === 'string') {
      return options.find(opt => opt.value === currentValue)?.label;
    }
    return null;
  };

  const selectedLabels = getSelectedLabels();

  // Handle selection
  const handleSelect = (selectedValue: string) => {
    if (isMultiple && Array.isArray(currentValue)) {
      const newValue = currentValue.includes(selectedValue)
        ? currentValue.filter(v => v !== selectedValue)
        : [...currentValue, selectedValue];
      onChange(newValue);
    } else {
      onChange(selectedValue === currentValue ? '' : selectedValue);
      setOpen(false);
    }
  };

  // Handle clear
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(isMultiple ? [] : '');
  };

  // Check if option is selected
  const isSelected = (optionValue: string) => {
    if (isMultiple && Array.isArray(currentValue)) {
      return currentValue.includes(optionValue);
    }
    return currentValue === optionValue;
  };

  // Filter options based on search
  const filteredOptions = search
    ? options.filter(
        option =>
          option.label.toLowerCase().includes(search.toLowerCase()) ||
          option.description?.toLowerCase().includes(search.toLowerCase())
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
              !selectedLabels && 'text-muted-foreground',
              error && 'border-destructive'
            )}
          >
            <span className="truncate">
              {isMultiple &&
              Array.isArray(selectedLabels) &&
              selectedLabels.length > 0
                ? `${selectedLabels.length} selecionado(s)`
                : !isMultiple && selectedLabels
                  ? selectedLabels
                  : field.placeholder || 'Selecione...'}
            </span>
            <div className="flex items-center gap-1">
              {(selectedLabels ||
                (Array.isArray(selectedLabels) &&
                  selectedLabels.length > 0)) && (
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
            <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {filteredOptions.map(option => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleSelect(option.value)}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      isSelected(option.value) ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {option.icon && <option.icon className="h-4 w-4" />}
                      <span>{option.label}</span>
                    </div>
                    {option.description && (
                      <p className="text-xs text-muted-foreground">
                        {option.description}
                      </p>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Show selected items for multi-select */}
      {isMultiple && Array.isArray(currentValue) && currentValue.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {currentValue.map(val => {
            const option = options.find(opt => opt.value === val);
            if (!option) return null;
            return (
              <div
                key={val}
                className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-sm"
              >
                {option.icon && <option.icon className="h-3 w-3" />}
                <span>{option.label}</span>
                <button
                  type="button"
                  onClick={() => handleSelect(val)}
                  disabled={isDisabled}
                  aria-label={`Remover ${option.label}`}
                  className="rounded-full p-0.5 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </FormFieldWrapper>
  );
}

export default RelationField;
