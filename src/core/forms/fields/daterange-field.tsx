/**
 * OpenSea OS - DateRange Field
 * Campo de seleção de intervalo de datas
 */

'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { FieldConfig } from '@/core/types';
import { Calendar } from 'lucide-react';
import { FormFieldWrapper } from '../components/form-field-wrapper';

export interface DateRange {
  start: string;
  end: string;
}

export interface DateRangeFieldProps<T = unknown> {
  field: FieldConfig<T>;
  value: DateRange;
  onChange: (value: DateRange) => void;
  error?: string;
  disabled?: boolean;
  formData?: T;
}

export function DateRangeField<T = unknown>({
  field,
  value,
  onChange,
  error,
  disabled,
  formData,
}: DateRangeFieldProps<T>) {
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

  const dateRange = value || { start: '', end: '' };

  const handleStartChange = (newStart: string) => {
    onChange({ ...dateRange, start: newStart });
  };

  const handleEndChange = (newEnd: string) => {
    onChange({ ...dateRange, end: newEnd });
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
      <div className="grid grid-cols-2 gap-3">
        {/* Start date */}
        <div className="space-y-2">
          <Label
            htmlFor={`${String(field.name)}-start`}
            className="text-xs text-muted-foreground"
          >
            Data Início
          </Label>
          <div className="relative">
            <Input
              id={`${String(field.name)}-start`}
              type="date"
              value={dateRange.start || ''}
              onChange={e => handleStartChange(e.target.value)}
              disabled={isDisabled}
              className="pr-10"
              aria-invalid={!!error}
              aria-describedby={describedBy}
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* End date */}
        <div className="space-y-2">
          <Label
            htmlFor={`${String(field.name)}-end`}
            className="text-xs text-muted-foreground"
          >
            Data Fim
          </Label>
          <div className="relative">
            <Input
              id={`${String(field.name)}-end`}
              type="date"
              value={dateRange.end || ''}
              onChange={e => handleEndChange(e.target.value)}
              disabled={isDisabled}
              min={dateRange.start || undefined}
              className="pr-10"
              aria-invalid={!!error}
              aria-describedby={describedBy}
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>
    </FormFieldWrapper>
  );
}

export default DateRangeField;
