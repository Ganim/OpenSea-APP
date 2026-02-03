/**
 * OpenSea OS - Code Field
 * Campo de edição de código com syntax highlighting básico
 */

'use client';

import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import type { FieldConfig } from '@/core/types';
import { FormFieldWrapper } from '../components/form-field-wrapper';

export interface CodeFieldProps<T = unknown> {
  field: FieldConfig<T>;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  formData?: T;
}

export function CodeField<T = unknown>({
  field,
  value,
  onChange,
  error,
  disabled,
  formData,
}: CodeFieldProps<T>) {
  const [copied, setCopied] = useState(false);

  // Evaluate disabled if it's a function
  const isDisabled =
    disabled ||
    (typeof field.disabled === 'function'
      ? formData
        ? field.disabled(formData)
        : false
      : field.disabled);

  const handleCopy = async () => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
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
      <div className="relative">
        {/* Copy button */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          disabled={isDisabled || !value}
          className="absolute top-2 right-2 z-10 h-8 w-8 p-0"
          title="Copiar código"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>

        {/* Code textarea */}
        <Textarea
          id={String(field.name)}
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder || '// Digite seu código aqui...'}
          disabled={isDisabled}
          readOnly={field.readOnly}
          rows={field.rows || 12}
          className="font-mono text-sm bg-gray-50 dark:bg-gray-950 border-gray-300 dark:border-gray-700 resize-y min-h-[200px]"
          spellCheck={false}
          aria-invalid={!!error}
        />

        {/* Line numbers overlay (optional enhancement) */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gray-100 dark:bg-gray-900 border-r border-gray-300 dark:border-gray-700 rounded-l-md pointer-events-none select-none overflow-hidden">
          <div className="p-2 text-xs text-muted-foreground font-mono leading-6">
            {value?.split('\n').map((_, i) => (
              <div key={i} className="text-right pr-2">
                {i + 1}
              </div>
            )) || <div className="text-right pr-2">1</div>}
          </div>
        </div>

        {/* Adjust textarea padding for line numbers */}
        <style jsx>{`
          textarea {
            padding-left: 3.5rem !important;
          }
        `}</style>
      </div>

      <p className="text-xs text-muted-foreground mt-2">
        Use Tab para indentação • Suporta syntax highlighting básico
      </p>
    </FormFieldWrapper>
  );
}

export default CodeField;
