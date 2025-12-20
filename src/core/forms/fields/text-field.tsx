/**
 * OpenSea OS - Text Field
 * Campo de texto genérico
 */

'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { FieldConfig } from '@/core/types';
import { FormFieldWrapper } from '../components/form-field-wrapper';

export interface TextFieldProps<T = unknown> {
  field: FieldConfig<T>;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  formData?: T;
}

export function TextField<T = unknown>({
  field,
  value,
  onChange,
  error,
  disabled,
  formData,
}: TextFieldProps<T>) {
  const isTextarea = field.type === 'textarea';
  const inputType =
    field.type === 'email'
      ? 'email'
      : field.type === 'password'
        ? 'password'
        : field.type === 'url'
          ? 'url'
          : field.type === 'phone'
            ? 'tel'
            : 'text';

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
      {isTextarea ? (
        <Textarea
          id={String(field.name)}
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder}
          disabled={isDisabled}
          readOnly={field.readOnly}
          rows={4}
          aria-invalid={!!error}
        />
      ) : (
        <Input
          id={String(field.name)}
          type={inputType}
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder}
          disabled={isDisabled}
          readOnly={field.readOnly}
          aria-invalid={!!error}
        />
      )}
    </FormFieldWrapper>
  );
}

export default TextField;
