/**
 * OpenSea OS - Form Field Wrapper
 * Wrapper comum para todos os campos de formulário
 *
 * Erros são exibidos via ícone + tooltip (sem empurrar layout).
 * O campo recebe data-error para estilização via CSS (borda rose).
 */

'use client';

import { FormErrorIcon } from '@/components/ui/form-error-icon';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import React, { ReactNode } from 'react';

export interface FormFieldWrapperProps {
  /** ID do campo */
  id: string;
  /** Label do campo */
  label: string;
  /** Campo obrigatório */
  required?: boolean;
  /** Descrição/help text */
  description?: string;
  /** Mensagem de erro */
  error?: string;
  /** Ícone do campo */
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  /** Colspan (1-12) */
  colSpan?: 1 | 2 | 3 | 4 | 6 | 12;
  /** Campo desabilitado */
  disabled?: boolean;
  /** Classe customizada */
  className?: string;
  /** Conteúdo do campo */
  children: ReactNode;
}

const colSpanClasses = {
  1: 'col-span-1',
  2: 'col-span-2',
  3: 'col-span-3',
  4: 'col-span-4',
  6: 'col-span-6',
  12: 'col-span-12',
};

export function FormFieldWrapper({
  id,
  label,
  required,
  description,
  error,
  icon: Icon,
  colSpan = 12,
  disabled,
  className,
  children,
}: FormFieldWrapperProps) {
  const descriptionId = `${id}-description`;
  return (
    <div
      className={cn(
        'form-field-wrapper',
        colSpanClasses[colSpan],
        disabled && 'opacity-60 pointer-events-none',
        className
      )}
      data-disabled={disabled || undefined}
      data-field-id={id}
    >
      <div className="space-y-2">
        {/* Label */}
        <Label htmlFor={id} className="flex items-center gap-2">
          {Icon && (
            <Icon className="w-4 h-4 text-[rgb(var(--color-foreground-subtle))]" />
          )}
          <span>{label}</span>
          {required && (
            <span className="text-[rgb(var(--color-destructive))]">*</span>
          )}
        </Label>

        {/* Campo + ícone de erro (sem empurrar layout) */}
        <div className="relative">
          {children}
          {error && <FormErrorIcon message={error} />}
        </div>

        {/* Descrição (visível apenas quando não há erro) */}
        {description && !error && (
          <p
            id={descriptionId}
            className="text-xs text-[rgb(var(--color-foreground-subtle))] px-2"
          >
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

export default FormFieldWrapper;
