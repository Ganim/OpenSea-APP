/**
 * OpenSea OS - JSON Field
 * Campo de edição de JSON com validação e formatação
 */

'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { FieldConfig } from '@/core/types';
import { cn } from '@/lib/utils';
import { Check, Wand2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FormFieldWrapper } from '../components/form-field-wrapper';

export interface JsonFieldProps<T = unknown> {
  field: FieldConfig<T>;
  value: string | object;
  onChange: (value: string | object) => void;
  error?: string;
  disabled?: boolean;
  formData?: T;
}

export function JsonField<T = unknown>({
  field,
  value,
  onChange,
  error,
  disabled,
  formData,
}: JsonFieldProps<T>) {
  const [internalValue, setInternalValue] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(true);

  // Evaluate disabled if it's a function
  const isDisabled =
    disabled ||
    (typeof field.disabled === 'function'
      ? formData
        ? field.disabled(formData)
        : false
      : field.disabled);

  // Validate JSON
  const validateJson = (jsonString: string) => {
    if (!jsonString.trim()) {
      setIsValid(true);
      setValidationError(null);
      return true;
    }

    try {
      JSON.parse(jsonString);
      setIsValid(true);
      setValidationError(null);
      return true;
    } catch (err) {
      setIsValid(false);
      setValidationError(err instanceof Error ? err.message : 'JSON inválido');
      return false;
    }
  };

  // Initialize internal value from prop
  useEffect(() => {
    if (typeof value === 'object' && value !== null) {
      const stringified = JSON.stringify(value, null, 2);
      setInternalValue(stringified);
      setIsValid(true);
      setValidationError(null);
    } else if (typeof value === 'string') {
      setInternalValue(value);
      validateJson(value);
    } else {
      setInternalValue('');
    }
  }, [value, validateJson]);

  // Handle change
  const handleChange = (newValue: string) => {
    setInternalValue(newValue);
    const valid = validateJson(newValue);

    if (valid && newValue.trim()) {
      try {
        const parsed = JSON.parse(newValue);
        onChange(parsed);
      } catch {
        // If parse fails, keep as string
        onChange(newValue);
      }
    } else {
      onChange(newValue);
    }
  };

  // Format JSON
  const handleFormat = () => {
    try {
      const parsed = JSON.parse(internalValue);
      const formatted = JSON.stringify(parsed, null, 2);
      setInternalValue(formatted);
      onChange(parsed);
      setIsValid(true);
      setValidationError(null);
    } catch (err) {
      // Already invalid, do nothing
    }
  };

  // Minify JSON
  const handleMinify = () => {
    try {
      const parsed = JSON.parse(internalValue);
      const minified = JSON.stringify(parsed);
      setInternalValue(minified);
      onChange(parsed);
    } catch (err) {
      // Already invalid, do nothing
    }
  };

  return (
    <FormFieldWrapper
      id={String(field.name)}
      label={field.label}
      required={field.required}
      description={field.description}
      error={error || validationError || undefined}
      icon={field.icon}
      colSpan={field.colSpan}
      disabled={isDisabled}
    >
      <div className="space-y-2">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-md border">
          <div className="flex items-center gap-2">
            {isValid ? (
              <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                <Check className="w-3 h-3" />
                <span>JSON válido</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs text-destructive">
                <X className="w-3 h-3" />
                <span>JSON inválido</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleFormat}
              disabled={isDisabled || !isValid}
              className="h-7 text-xs"
            >
              <Wand2 className="w-3 h-3 mr-1" />
              Formatar
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleMinify}
              disabled={isDisabled || !isValid}
              className="h-7 text-xs"
            >
              Minificar
            </Button>
          </div>
        </div>

        {/* JSON textarea */}
        <Textarea
          id={String(field.name)}
          value={internalValue}
          onChange={e => handleChange(e.target.value)}
          placeholder={field.placeholder || '{\n  "key": "value"\n}'}
          disabled={isDisabled}
          readOnly={field.readOnly}
          rows={field.rows || 10}
          className={cn(
            'font-mono text-sm resize-y min-h-[200px]',
            !isValid && 'border-destructive focus-visible:ring-destructive'
          )}
          spellCheck={false}
          aria-invalid={!!error || !isValid}
        />

        {/* Validation error */}
        {validationError && (
          <div className="text-xs text-destructive bg-destructive/10 p-2 rounded-md">
            {validationError}
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          JSON será validado em tempo real
        </p>
      </div>
    </FormFieldWrapper>
  );
}

export default JsonField;
