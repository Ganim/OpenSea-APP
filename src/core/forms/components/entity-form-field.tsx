/**
 * OpenSea OS - EntityFormField Component
 * Renderiza um campo individual do formulário
 */

'use client';

import { Input } from '@/components/ui/input';
import type { BaseEntity } from '@/core/types';
import { cn } from '@/lib/utils';
import React from 'react';
import { Controller } from 'react-hook-form';
import { ArrayField } from '../fields/array-field';
import { CheckboxField } from '../fields/checkbox-field';
import { CodeField } from '../fields/code-field';
import { ColorField } from '../fields/color-field';
import { ComboboxField } from '../fields/combobox-field';
import { CustomField } from '../fields/custom-field';
import { DateRangeField } from '../fields/daterange-field';
import { FileField } from '../fields/file-field';
import { ImageField } from '../fields/image-field';
import { JsonField } from '../fields/json-field';
import { MultiSelectField } from '../fields/multi-select-field';
import { ObjectField } from '../fields/object-field';
import { RadioField } from '../fields/radio-field';
import { RelationField } from '../fields/relation-field';
import { RichTextField } from '../fields/rich-text-field';
import { SelectField } from '../fields/select-field';
import { SliderField } from '../fields/slider-field';
import { SwitchField } from '../fields/switch-field';
import { TagsField } from '../fields/tags-field';
import { TextField } from '../fields/text-field';
import type { RenderFieldProps } from './entity-form.types';

// =============================================================================
// COLUMN SPAN UTILITY
// =============================================================================

function getColSpanClass(
  colSpan: number = 1,
  sectionColumns: number = 1
): string {
  if (sectionColumns === 1) {
    return 'col-span-1';
  }

  if (sectionColumns === 2) {
    return colSpan === 2 ? 'col-span-2' : 'col-span-1';
  }

  if (sectionColumns === 3) {
    return colSpan === 3
      ? 'col-span-3'
      : colSpan === 2
        ? 'col-span-2'
        : 'col-span-1';
  }

  // 4 columns
  return colSpan === 4
    ? 'col-span-4'
    : colSpan === 3
      ? 'col-span-3'
      : colSpan === 2
        ? 'col-span-2'
        : 'col-span-1';
}

// =============================================================================
// COMPONENT
// =============================================================================

export function EntityFormField<T extends BaseEntity>({
  field,
  control,
  errors,
  formValues,
  sectionColumns = 1,
}: RenderFieldProps<T>) {
  const fieldName = field.name as string;
  const error = errors[fieldName as keyof typeof errors];

  // Verificar visibilidade
  if (field.hidden) {
    if (typeof field.hidden === 'function') {
      if (field.hidden(formValues as T)) return null;
    } else {
      return null;
    }
  }

  // Verificar disabled
  const isDisabled =
    typeof field.disabled === 'function'
      ? field.disabled(formValues as T)
      : field.disabled;

  // Col span
  const colSpan = field.colSpan || 1;
  const colSpanClass = getColSpanClass(colSpan, sectionColumns);

  return (
    <div className={cn(colSpanClass)}>
      <Controller
        name={fieldName as any}
        control={control}
        render={({ field: controllerField }) => {
          switch (field.type) {
            case 'text':
            case 'email':
            case 'url':
            case 'phone':
            case 'password':
            case 'textarea':
            case 'number':
            case 'currency':
            case 'percent':
              return (
                <TextField
                  field={field as any}
                  value={controllerField.value as string}
                  onChange={controllerField.onChange}
                  error={error ? (error as any).message : undefined}
                  disabled={isDisabled}
                  formData={formValues as T}
                />
              );

            case 'date':
            case 'datetime':
            case 'time':
              return (
                <Input
                  {...controllerField}
                  id={fieldName}
                  type={
                    field.type === 'datetime' ? 'datetime-local' : field.type
                  }
                  disabled={isDisabled}
                  readOnly={field.readOnly}
                  autoFocus={field.autoFocus}
                  className={cn(error && 'border-destructive')}
                />
              );

            case 'select':
              return (
                <SelectField
                  field={field as any}
                  value={controllerField.value as string}
                  onChange={controllerField.onChange}
                  error={error ? (error as any).message : undefined}
                  disabled={isDisabled}
                  formData={formValues as T}
                />
              );

            case 'checkbox':
              return (
                <CheckboxField
                  field={field as any}
                  value={controllerField.value as boolean}
                  onChange={controllerField.onChange}
                  error={error ? (error as any).message : undefined}
                  disabled={isDisabled}
                  formData={formValues as T}
                />
              );

            case 'switch':
              return (
                <SwitchField
                  field={field as any}
                  value={controllerField.value as boolean}
                  onChange={controllerField.onChange}
                  error={error ? (error as any).message : undefined}
                  disabled={isDisabled}
                  formData={formValues as T}
                />
              );

            case 'radio':
              return (
                <RadioField
                  field={field as any}
                  value={controllerField.value as string}
                  onChange={controllerField.onChange}
                  error={error ? (error as any).message : undefined}
                  disabled={isDisabled}
                  formData={formValues as T}
                />
              );

            case 'slider':
              return (
                <SliderField
                  field={field as any}
                  value={controllerField.value as number}
                  onChange={controllerField.onChange}
                  error={error ? (error as any).message : undefined}
                  disabled={isDisabled}
                  formData={formValues as T}
                />
              );

            case 'color':
              return (
                <ColorField
                  field={field as any}
                  value={controllerField.value as string}
                  onChange={controllerField.onChange}
                  error={error ? (error as any).message : undefined}
                  disabled={isDisabled}
                  formData={formValues as T}
                />
              );

            case 'tags':
              return (
                <TagsField
                  field={field as any}
                  value={controllerField.value as string[]}
                  onChange={controllerField.onChange}
                  error={error ? (error as any).message : undefined}
                  disabled={isDisabled}
                  formData={formValues as T}
                />
              );

            case 'file':
              return (
                <FileField
                  field={field as any}
                  value={controllerField.value as File | string | null}
                  onChange={controllerField.onChange}
                  error={error ? (error as any).message : undefined}
                  disabled={isDisabled}
                  formData={formValues as T}
                />
              );

            case 'image':
              return (
                <ImageField
                  field={field as any}
                  value={controllerField.value as File | string | null}
                  onChange={controllerField.onChange}
                  error={error ? (error as any).message : undefined}
                  disabled={isDisabled}
                  formData={formValues as T}
                />
              );

            case 'relation':
              return (
                <RelationField
                  field={field as any}
                  value={controllerField.value as string | string[]}
                  onChange={controllerField.onChange}
                  error={error ? (error as any).message : undefined}
                  disabled={isDisabled}
                  formData={formValues as T}
                />
              );

            case 'rich-text':
            case 'markdown':
              return (
                <RichTextField
                  field={field as any}
                  value={controllerField.value as string}
                  onChange={controllerField.onChange}
                  error={error ? (error as any).message : undefined}
                  disabled={isDisabled}
                  formData={formValues as T}
                />
              );

            case 'multi-select':
              return (
                <MultiSelectField
                  field={field as any}
                  value={controllerField.value as string[]}
                  onChange={controllerField.onChange}
                  error={error ? (error as any).message : undefined}
                  disabled={isDisabled}
                  formData={formValues as T}
                />
              );

            case 'combobox':
              return (
                <ComboboxField
                  field={field as any}
                  value={controllerField.value as string}
                  onChange={controllerField.onChange}
                  error={error ? (error as any).message : undefined}
                  disabled={isDisabled}
                  formData={formValues as T}
                />
              );

            case 'daterange':
              return (
                <DateRangeField
                  field={field as any}
                  value={controllerField.value as any}
                  onChange={controllerField.onChange}
                  error={error ? (error as any).message : undefined}
                  disabled={isDisabled}
                  formData={formValues as T}
                />
              );

            case 'code':
              return (
                <CodeField
                  field={field as any}
                  value={controllerField.value as string}
                  onChange={controllerField.onChange}
                  error={error ? (error as any).message : undefined}
                  disabled={isDisabled}
                  formData={formValues as T}
                />
              );

            case 'json':
              return (
                <JsonField
                  field={field as any}
                  value={controllerField.value as string | object}
                  onChange={controllerField.onChange}
                  error={error ? (error as any).message : undefined}
                  disabled={isDisabled}
                  formData={formValues as T}
                />
              );

            case 'array':
              return (
                <ArrayField
                  field={field as any}
                  value={controllerField.value as unknown[]}
                  onChange={controllerField.onChange}
                  error={error ? (error as any).message : undefined}
                  disabled={isDisabled}
                  formData={formValues as T}
                />
              );

            case 'object':
            case 'key-value':
              return (
                <ObjectField
                  field={field as any}
                  value={controllerField.value as Record<string, unknown>}
                  onChange={controllerField.onChange}
                  error={error ? (error as any).message : undefined}
                  disabled={isDisabled}
                  formData={formValues as T}
                />
              );

            case 'custom':
              return (
                <CustomField
                  field={field as any}
                  value={controllerField.value}
                  onChange={controllerField.onChange}
                  error={error ? (error as any).message : undefined}
                  disabled={isDisabled}
                  formData={formValues as T}
                />
              );

            default:
              return (
                <div className="text-muted-foreground text-sm">
                  Campo tipo &quot;{field.type}&quot; ainda não implementado
                </div>
              );
          }
        }}
      />
    </div>
  );
}
