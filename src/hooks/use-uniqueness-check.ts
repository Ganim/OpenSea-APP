'use client';

import { useCallback, useRef } from 'react';
import type { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { t } from '@/lib/i18n';

interface UseUniquenessCheckOptions<T extends FieldValues> {
  /** The react-hook-form instance */
  form: UseFormReturn<T>;
  /** The field name to validate */
  field: Path<T>;
  /** Label of the field (used in error message) */
  fieldLabel: string;
  /**
   * Function that checks if value is available.
   * Return true if available (unique), false if taken.
   */
  checkFn: (value: string) => Promise<boolean>;
  /** Debounce delay in ms. Default: 300 */
  debounceMs?: number;
  /** Custom error message. Default: uses i18n 'validation.unique' */
  errorMessage?: string;
  /** Minimum length before checking (skip empty/short values). Default: 1 */
  minLength?: number;
}

/**
 * Hook for on-blur uniqueness validation with debounce.
 *
 * Returns an `onBlur` handler to attach to the input field and
 * an `isChecking` ref for loading indicators.
 *
 * @example
 * ```tsx
 * const { onBlur: checkCnpj, isChecking } = useUniquenessCheck({
 *   form,
 *   field: 'cnpj',
 *   fieldLabel: 'CNPJ',
 *   checkFn: async (value) => {
 *     const res = await companiesService.checkCnpj(value);
 *     return res.available;
 *   },
 * });
 *
 * <Input onBlur={checkCnpj} ... />
 * ```
 */
export function useUniquenessCheck<T extends FieldValues>({
  form,
  field,
  fieldLabel,
  checkFn,
  debounceMs = 300,
  errorMessage,
  minLength = 1,
}: UseUniquenessCheckOptions<T>) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isChecking = useRef(false);
  const lastCheckedValue = useRef<string>('');

  const onBlur = useCallback(async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const value = form.getValues(field) as string;

    if (!value || value.length < minLength) {
      return;
    }

    if (value === lastCheckedValue.current) {
      return;
    }

    timerRef.current = setTimeout(async () => {
      isChecking.current = true;
      lastCheckedValue.current = value;

      try {
        const isAvailable = await checkFn(value);

        if (!isAvailable) {
          form.setError(field, {
            type: 'uniqueness',
            message:
              errorMessage || t('validation.unique', { field: fieldLabel }),
          });
        } else {
          const currentError = form.getFieldState(field).error;
          if (currentError?.type === 'uniqueness') {
            form.clearErrors(field);
          }
        }
      } catch {
        // Network error during check — don't block the user
      } finally {
        isChecking.current = false;
      }
    }, debounceMs);
  }, [form, field, fieldLabel, checkFn, debounceMs, errorMessage, minLength]);

  const reset = useCallback(() => {
    lastCheckedValue.current = '';
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, []);

  return { onBlur, isChecking, reset };
}
