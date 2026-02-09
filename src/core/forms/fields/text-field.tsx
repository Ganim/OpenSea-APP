/**
 * OpenSea OS - Text Field
 * Campo de texto genérico com suporte a máscaras
 */

'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { FieldConfig } from '@/core/types';
import { useCallback } from 'react';
import { FormFieldWrapper } from '../components/form-field-wrapper';
import { applySmartMask, getMaskMaxLength } from '../utils/masks';

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

  // Handler com suporte a máscara
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      let newValue = e.target.value;

      // Aplica máscara se configurada
      if (field.mask && !isTextarea) {
        newValue = applySmartMask(newValue, field.mask);
      }

      onChange(newValue);
    },
    [field.mask, isTextarea, onChange]
  );

  // Valor formatado (aplica máscara no valor inicial se necessário)
  const displayValue = useCallback(() => {
    if (!value) return '';
    if (field.mask && !isTextarea) {
      return applySmartMask(value, field.mask);
    }
    return value;
  }, [value, field.mask, isTextarea]);

  // Comprimento máximo baseado na máscara
  const maxLength = field.mask ? getMaskMaxLength(field.mask) : undefined;
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
      {isTextarea ? (
        <Textarea
          id={String(field.name)}
          value={value || ''}
          onChange={handleChange}
          placeholder={field.placeholder}
          disabled={isDisabled}
          readOnly={field.readOnly}
          rows={4}
          aria-invalid={!!error}
          aria-describedby={describedBy}
        />
      ) : (
        <Input
          id={String(field.name)}
          type={inputType}
          value={displayValue()}
          onChange={handleChange}
          placeholder={field.placeholder}
          disabled={isDisabled}
          readOnly={field.readOnly}
          maxLength={maxLength}
          aria-invalid={!!error}
          aria-describedby={describedBy}
        />
      )}
    </FormFieldWrapper>
  );
}

export default TextField;
