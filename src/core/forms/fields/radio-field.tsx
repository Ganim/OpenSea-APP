/**
 * OpenSea OS - Radio Field
 * Campo de seleção radio button
 */

'use client';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { FieldConfig } from '@/core/types';
import { FormFieldWrapper } from '../components/form-field-wrapper';
import type { SelectOption } from './select-field';

export interface RadioFieldProps<T = unknown> {
  field: FieldConfig<T>;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  formData?: T;
}

export function RadioField<T = unknown>({
  field,
  value,
  onChange,
  error,
  disabled,
  formData,
}: RadioFieldProps<T>) {
  // Evaluate disabled if it's a function
  const isDisabled =
    disabled ||
    (typeof field.disabled === 'function'
      ? formData
        ? field.disabled(formData)
        : false
      : field.disabled);

  // Get options from field config
  const options = (field.options || []) as SelectOption[];

  // Determine orientation
  const orientation = field.radioOrientation || 'vertical';
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
      <RadioGroup
        value={value || ''}
        onValueChange={onChange}
        disabled={isDisabled}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        className={
          orientation === 'horizontal'
            ? 'flex flex-row gap-4'
            : 'flex flex-col gap-3'
        }
      >
        {options.map(option => (
          <div key={option.value} className="flex items-center space-x-2">
            <RadioGroupItem
              value={option.value}
              id={`${String(field.name)}-${option.value}`}
              disabled={option.disabled || isDisabled}
              aria-invalid={!!error}
            />
            <Label
              htmlFor={`${String(field.name)}-${option.value}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              {option.icon && (
                <option.icon className="w-4 h-4 inline-block mr-2" />
              )}
              {option.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </FormFieldWrapper>
  );
}

export default RadioField;
