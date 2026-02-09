/**
 * OpenSea OS - Checkbox Field
 * Campo de checkbox simples
 */

'use client';

import { Checkbox } from '@/components/ui/checkbox';
import type { FieldConfig } from '@/core/types';
import { FormFieldWrapper } from '../components/form-field-wrapper';

export interface CheckboxFieldProps<T = unknown> {
  field: FieldConfig<T>;
  value: boolean;
  onChange: (value: boolean) => void;
  error?: string;
  disabled?: boolean;
  formData?: T;
}

export function CheckboxField<T = unknown>({
  field,
  value,
  onChange,
  error,
  disabled,
  formData,
}: CheckboxFieldProps<T>) {
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
      <div className="flex items-center space-x-2">
        <Checkbox
          id={String(field.name)}
          checked={value || false}
          onCheckedChange={onChange}
          disabled={isDisabled}
          aria-invalid={!!error}
          aria-describedby={describedBy}
        />
        {field.checkboxLabel && (
          <label
            htmlFor={String(field.name)}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            {field.checkboxLabel}
          </label>
        )}
      </div>
    </FormFieldWrapper>
  );
}

export default CheckboxField;
