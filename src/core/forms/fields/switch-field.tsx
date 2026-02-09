/**
 * OpenSea OS - Switch Field
 * Campo de switch toggle
 */

'use client';

import { Switch } from '@/components/ui/switch';
import type { FieldConfig } from '@/core/types';
import { FormFieldWrapper } from '../components/form-field-wrapper';

export interface SwitchFieldProps<T = unknown> {
  field: FieldConfig<T>;
  value: boolean;
  onChange: (value: boolean) => void;
  error?: string;
  disabled?: boolean;
  formData?: T;
}

export function SwitchField<T = unknown>({
  field,
  value,
  onChange,
  error,
  disabled,
  formData,
}: SwitchFieldProps<T>) {
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
        <Switch
          id={String(field.name)}
          checked={value || false}
          onCheckedChange={onChange}
          disabled={isDisabled}
          aria-invalid={!!error}
          aria-describedby={describedBy}
        />
        {field.switchLabel && (
          <label
            htmlFor={String(field.name)}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            {field.switchLabel}
          </label>
        )}
      </div>
    </FormFieldWrapper>
  );
}

export default SwitchField;
