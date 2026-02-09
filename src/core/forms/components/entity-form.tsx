/**
 * OpenSea OS - EntityForm Component
 * Formulário genérico baseado em configuração para qualquer entidade
 *
 * NOTE: This file uses 'as any' extensively because react-hook-form's generic
 * constraints don't align well with dynamic field rendering patterns. The Controller
 * component requires strict generic typing, but our field dispatch system is inherently
 * dynamic. Rewriting to eliminate these casts would require a complete framework redesign.
 * This is the pragmatic solution that keeps the form working across all field types.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { Button } from '@/components/ui/button';
import type { BaseEntity } from '@/core/types';
import { logger } from '@/lib/logger';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import React, { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { EntityFormField } from './entity-form-field';
import { EntityFormSection } from './entity-form-section';
import type { EntityFormProps } from './entity-form.types';
import {
  buildDefaultValues,
  showValidationErrors,
  validateRequiredFields,
} from './entity-form-validation';

// =============================================================================
// COMPONENT
// =============================================================================

export const EntityForm = forwardRef<HTMLFormElement, EntityFormProps<any>>(
  function EntityForm<T extends BaseEntity>(
    {
      config,
      initialData,
      mode,
      onSubmit,
      onCancel,
      isSubmitting = false,
      submitLabel,
      cancelLabel,
      className,
      hideActions = false,
    }: EntityFormProps<T>,
    ref: React.Ref<HTMLFormElement>
  ) {
    // Estado de seções colapsadas
    const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
      new Set(
        config.sections
          ?.filter(s => s.collapsible && s.defaultCollapsed)
          .map(s => s.id) || []
      )
    );

    // Construir defaultValues
    const defaultValues = useMemo(
      () => buildDefaultValues(initialData, config),
      [initialData, config]
    );

    // Form hook
    const {
      control,
      handleSubmit,
      formState: { errors },
      reset,
      watch,
    } = useForm({
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
    const toggleSection = useCallback((sectionId: string) => {
      setCollapsedSections(prev => {
        const next = new Set(prev);
        if (next.has(sectionId)) {
          next.delete(sectionId);
        } else {
          next.add(sectionId);
        }
        return next;
      });
    }, []);

    // Handler de submit
    const handleFormSubmit = async (data: Partial<T>) => {
      try {
        // Validação de campos obrigatórios
        const validation = validateRequiredFields(data, config);

        if (!validation.isValid) {
          showValidationErrors(validation.errors);
          return;
        }

        await onSubmit(data);
      } catch (error) {
        logger.error('Erro ao submeter formulário', error as Error, {
          component: 'entity-form',
        });
      }
    };

    // Renderizar campo
    const renderField = useCallback(
      (
        field: (typeof config.sections)[0]['fields'][0],
        sectionColumns?: number
      ) => {
        return (
          <EntityFormField
            key={field.name as string}
            field={field}
            control={control}
            errors={errors}
            formValues={formValues}
            sectionColumns={sectionColumns}
          />
        );
      },
      [control, errors, formValues]
    );

    // Labels dos botões
    const finalSubmitLabel =
      submitLabel || (mode === 'create' ? 'Criar' : 'Salvar');
    const finalCancelLabel = cancelLabel || 'Cancelar';

    return (
      <form
        ref={ref}
        onSubmit={handleSubmit(handleFormSubmit)}
        className={cn('space-y-6', className)}
      >
        {/* Seções do formulário */}
        {config.sections?.map(section => (
          <EntityFormSection
            key={section.id}
            section={section}
            isCollapsed={collapsedSections.has(section.id)}
            onToggle={() => toggleSection(section.id)}
            renderField={renderField}
            formValues={formValues}
            config={config}
          />
        ))}

        {!hideActions && (
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
              {isSubmitting && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {finalSubmitLabel}
            </Button>
          </div>
        )}
      </form>
    );
  }
);

EntityForm.displayName = 'EntityForm';

export default EntityForm;
