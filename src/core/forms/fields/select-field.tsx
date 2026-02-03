/**
 * OpenSea OS - Select Field
 * Campo de seleção dropdown
 */

'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { FieldConfig } from '@/core/types';
import { FormFieldWrapper } from '../components/form-field-wrapper';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface SelectFieldProps<T = unknown> {
  field: FieldConfig<T>;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  formData?: T;
}

export function SelectField<T = unknown>({
  field,
  value,
  onChange,
  error,
  disabled,
  formData,
}: SelectFieldProps<T>) {
  // Evaluate disabled if it's a function
  const isDisabled =
    disabled ||
    (typeof field.disabled === 'function'
      ? formData
        ? field.disabled(formData)
        : false
      : field.disabled);

  // Get options from field config
  const options = field.options || [];

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
      <Select
        value={value || ''}
        onValueChange={onChange}
        disabled={isDisabled}
      >
        <SelectTrigger
          id={String(field.name)}
          aria-invalid={!!error}
          className="w-full"
        >
          <SelectValue placeholder={field.placeholder || 'Selecione...'} />
        </SelectTrigger>
        <SelectContent>
          {options.map(option => (
            <SelectItem
              key={String(option.value)}
              value={String(option.value)}
              disabled={option.disabled}
            >
              <div className="flex items-center gap-2">
                {option.icon && typeof option.icon !== 'string' && (
                  <span className="w-4 h-4">{option.icon}</span>
                )}
                <span>{option.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormFieldWrapper>
  );
}

export default SelectField;
