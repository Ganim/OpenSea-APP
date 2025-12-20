/**
 * OpenSea OS - EntityForm Component
 * Formulário genérico baseado em configuração para qualquer entidade
 */

'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { BaseEntity, EntityFormConfig } from '@/core/types';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
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

// =============================================================================
// TYPES
// =============================================================================

export interface EntityFormProps<T extends BaseEntity> {
  /** Configuração do formulário */
  config: EntityFormConfig<T>;
  /** Dados iniciais para edição */
  initialData?: Partial<T>;
  /** Modo do formulário */
  mode: 'create' | 'edit';
  /** Callback ao submeter */
  onSubmit: (data: Partial<T>) => Promise<void> | void;
  /** Callback ao cancelar */
  onCancel?: () => void;
  /** Está enviando */
  isSubmitting?: boolean;
  /** Texto do botão de submit customizado */
  submitLabel?: string;
  /** Texto do botão de cancelar customizado */
  cancelLabel?: string;
  /** Classes adicionais */
  className?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function EntityForm<T extends BaseEntity>({
  config,
  initialData,
  mode,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel,
  cancelLabel,
  className,
}: EntityFormProps<T>) {
  // Estado de seções colapsadas
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    new Set(
      config.sections
        ?.filter(s => s.collapsible && s.defaultCollapsed)
        .map(s => s.id) || []
    )
  );

  // Schema de validação
  // TODO: Implement Zod validation properly
  // const schema = config.schema;

  // Construir defaultValues considerando field.defaultValue
  const defaultValues = useMemo(() => {
    const values = { ...(initialData || {}) };
    const allFields = config.sections?.flatMap(s => s.fields) || [];

    for (const field of allFields) {
      if (field.defaultValue && !values.hasOwnProperty(field.name as string)) {
        (values as any)[field.name as string] = field.defaultValue;
      }
    }

    return values;
  }, [initialData, config.sections]);

  // Form hook
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    // resolver: schema ? zodResolver(schema) : undefined,
    defaultValues,
    mode: config.validateOnBlur
      ? 'onBlur'
      : config.validateOnChange
        ? 'onChange'
        : 'onSubmit',
  }) as any;

  // Watch all values para campos condicionais
  const formValues = watch();

  // Reset quando initialData mudar
  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  // Toggle seção colapsada
  const toggleSection = (sectionId: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  // Handler de submit
  const handleFormSubmit = async (data: Partial<T>) => {
    try {
      // Validação de campos obrigatórios
      const allFields = config.sections?.flatMap(s => s.fields) || [];
      const requiredErrors: Record<string, string> = {};

      for (const field of allFields) {
        if (field.required) {
          const value = data[field.name as keyof T];
          if (!value || (typeof value === 'string' && value.trim() === '')) {
            requiredErrors[field.name as string] =
              `${field.label} é obrigatório`;
          }
        }
      }

      if (Object.keys(requiredErrors).length > 0) {
        // Mostrar toast com os erros
        const errorMessages = Object.values(requiredErrors);
        toast.error(
          errorMessages.length === 1
            ? errorMessages[0]
            : `Há ${errorMessages.length} campos obrigatórios que precisam ser preenchidos`
        );
        return;
      }

      await onSubmit(data);
    } catch (error) {
      console.error('Erro ao submeter formulário:', error);
    }
  };

  // Renderizar campo baseado no tipo
  const renderField = (
    field: EntityFormConfig<T>['sections'][0]['fields'][0],
    sectionColumns: number = 1
  ) => {
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
    const colSpanClass =
      sectionColumns === 1
        ? 'col-span-1'
        : sectionColumns === 2
          ? colSpan === 2
            ? 'col-span-2'
            : 'col-span-1'
          : sectionColumns === 3
            ? colSpan === 3
              ? 'col-span-3'
              : colSpan === 2
                ? 'col-span-2'
                : 'col-span-1'
            : // 4 columns
              colSpan === 4
              ? 'col-span-4'
              : colSpan === 3
                ? 'col-span-3'
                : colSpan === 2
                  ? 'col-span-2'
                  : 'col-span-1';

    return (
      <div key={fieldName} className={cn(colSpanClass)}>
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
                    Campo tipo "{field.type}" ainda não implementado
                  </div>
                );
            }
          }}
        />
      </div>
    );
  };

  // Renderizar seção
  const renderSection = (section: EntityFormConfig<T>['sections'][0]) => {
    // Verificar visibilidade
    if (section.showWhen && !section.showWhen(formValues as Partial<T>)) {
      return null;
    }

    const isCollapsed = collapsedSections.has(section.id);
    const columns = section.columns || config.defaultColumns || 1;

    const gridClass =
      columns === 1
        ? 'grid-cols-1'
        : columns === 2
          ? 'grid-cols-1 md:grid-cols-2'
          : columns === 3
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';

    return (
      <div key={section.id} className="space-y-4">
        {/* Header da seção */}
        <div
          className={cn(
            'flex items-center justify-between',
            section.collapsible && 'cursor-pointer'
          )}
          onClick={
            section.collapsible ? () => toggleSection(section.id) : undefined
          }
        >
          <div className="flex items-center gap-3">
            {section.icon && (
              <div className="w-5 h-5 text-primary">{section.icon}</div>
            )}
            <div>
              {section.title && (
                <h3 className="font-semibold text-lg">{section.title}</h3>
              )}

              {section.description && (
                <p className="text-sm text-[rgb(var(--color-muted-foreground))]">
                  {section.description}
                </p>
              )}
            </div>
          </div>
          {section.collapsible && (
            <Button variant="ghost" size="icon">
              {isCollapsed ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronUp className="w-5 h-5" />
              )}
            </Button>
          )}
        </div>

        {/* Campos da seção */}
        {!isCollapsed && (
          <div className={cn('grid gap-4', gridClass)}>
            {section.fields.map(field => renderField(field, columns))}
          </div>
        )}
      </div>
    );
  };

  // Labels dos botões
  const finalSubmitLabel =
    submitLabel || (mode === 'create' ? 'Criar' : 'Salvar');
  const finalCancelLabel = cancelLabel || 'Cancelar';

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className={cn('space-y-6', className)}
    >
      {/* Seções do formulário */}
      {config.sections?.map(section => (
        <React.Fragment key={section.id}>
          {renderSection(section)}
        </React.Fragment>
      ))}

      {/* Botões de ação */}
      <div className="flex items-center justify-end gap-3 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {finalCancelLabel}
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {finalSubmitLabel}
        </Button>
      </div>
    </form>
  );
}

export default EntityForm;
