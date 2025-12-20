/**
 * OpenSea OS - Custom Field
 * Wrapper para componentes de campo personalizados
 */

'use client';

import type { FieldConfig } from '@/core/types';
import { FormFieldWrapper } from '../components/form-field-wrapper';

export interface CustomFieldProps<T = unknown> {
  field: FieldConfig<T>;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
  disabled?: boolean;
  formData?: T;
}

export function CustomField<T = unknown>({
  field,
  value,
  onChange,
  error,
  disabled,
  formData,
}: CustomFieldProps<T>) {
  // Evaluate disabled if it's a function
  const isDisabled =
    disabled ||
    (typeof field.disabled === 'function'
      ? formData
        ? field.disabled(formData)
        : false
      : field.disabled);

  // Use custom render function if provided
  if (field.render) {
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
        {field.render({
          field,
          value,
          onChange,
          error,
          disabled: isDisabled,
          formData: formData as T,
        })}
      </FormFieldWrapper>
    );
  }

  // Use custom component if provided
  if (field.component) {
    const CustomComponent = field.component;
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
        <CustomComponent
          field={field}
          value={value}
          onChange={onChange}
          error={error}
          disabled={isDisabled}
          formData={formData as T}
          {...(field.componentProps || {})}
        />
      </FormFieldWrapper>
    );
  }

  // Fallback if no custom component or render function provided
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
      <div className="text-sm text-muted-foreground p-4 border-2 border-dashed rounded-md text-center">
        Campo customizado não configurado.
        <br />
        Forneça uma função <code className="text-xs">render</code> ou um{' '}
        <code className="text-xs">component</code> na configuração do campo.
      </div>
    </FormFieldWrapper>
  );
}

export default CustomField;
