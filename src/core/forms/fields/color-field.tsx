/**
 * OpenSea OS - Color Field
 * Campo de seleção de cor
 */

'use client';

import { Input } from '@/components/ui/input';
import type { FieldConfig } from '@/core/types';
import { FormFieldWrapper } from '../components/form-field-wrapper';

export interface ColorFieldProps<T = unknown> {
  field: FieldConfig<T>;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  formData?: T;
}

export function ColorField<T = unknown>({
  field,
  value,
  onChange,
  error,
  disabled,
  formData,
}: ColorFieldProps<T>) {
  // Evaluate disabled if it's a function
  const isDisabled =
    disabled ||
    (typeof field.disabled === 'function'
      ? formData
        ? field.disabled(formData)
        : false
      : field.disabled);

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
      <div className="flex items-center gap-3">
        {/* Color preview */}
        <div
          className="w-12 h-9 rounded-md border-2 border-gray-200 dark:border-gray-700 shadow-sm"
          style={{ backgroundColor: value || '#000000' }}
        />

        {/* Color picker input */}
        <Input
          id={String(field.name)}
          type="color"
          value={value || '#000000'}
          onChange={e => onChange(e.target.value)}
          disabled={isDisabled}
          className="w-20 h-9 p-1 cursor-pointer"
          aria-invalid={!!error}
        />

        {/* Hex input */}
        <Input
          type="text"
          value={value || '#000000'}
          onChange={e => onChange(e.target.value)}
          placeholder="#000000"
          disabled={isDisabled}
          className="flex-1 font-mono"
          pattern="^#[0-9A-Fa-f]{6}$"
          aria-invalid={!!error}
        />
      </div>
    </FormFieldWrapper>
  );
}

export default ColorField;
