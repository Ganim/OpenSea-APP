/**
 * OpenSea OS - Slider Field
 * Campo de slider range
 */

'use client';

import { Slider } from '@/components/ui/slider';
import type { FieldConfig } from '@/core/types';
import { FormFieldWrapper } from '../components/form-field-wrapper';

export interface SliderFieldProps<T = unknown> {
  field: FieldConfig<T>;
  value: number;
  onChange: (value: number) => void;
  error?: string;
  disabled?: boolean;
  formData?: T;
}

export function SliderField<T = unknown>({
  field,
  value,
  onChange,
  error,
  disabled,
  formData,
}: SliderFieldProps<T>) {
  // Evaluate disabled if it's a function
  const isDisabled =
    disabled ||
    (typeof field.disabled === 'function'
      ? formData
        ? field.disabled(formData)
        : false
      : field.disabled);

  const min = field.min ?? 0;
  const max = field.max ?? 100;
  const step =
    typeof field.step === 'string' ? parseFloat(field.step) : (field.step ?? 1);
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
      <div className="space-y-3">
        <Slider
          id={String(field.name)}
          value={[value ?? min]}
          onValueChange={([newValue]) => onChange(newValue)}
          min={min}
          max={max}
          step={step}
          disabled={isDisabled}
          aria-invalid={!!error}
          aria-describedby={describedBy}
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{min}</span>
          <span className="font-medium text-foreground">{value ?? min}</span>
          <span>{max}</span>
        </div>
      </div>
    </FormFieldWrapper>
  );
}

export default SliderField;
