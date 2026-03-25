'use client';

import { useCallback } from 'react';
import type { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { ApiError } from '@/lib/errors/api-error';
import { translateError } from '@/lib/error-messages';
import { toast } from 'sonner';

/**
 * Map from API error message patterns to form field names.
 * Keys are substring patterns matched against the error message.
 * Values are the form field name to set the error on.
 */
type FieldErrorMap<T extends FieldValues> = Record<string, Path<T>>;

interface UseFormErrorHandlerOptions<T extends FieldValues> {
  /** The react-hook-form instance */
  form: UseFormReturn<T>;
  /**
   * Fallback mapping: substring pattern on error message → field name.
   * Used when backend doesn't include `field` in the error response.
   * @example { 'CNPJ already exists': 'cnpj', 'Email already': 'email' }
   */
  fieldMap?: FieldErrorMap<T>;
  /** Custom handler for errors that can't be mapped to a field. Default: toast.error */
  onUnmappedError?: (error: ApiError) => void;
}

/**
 * Hook that processes API errors and maps them to form fields.
 *
 * Priority:
 * 1. ApiError.fieldErrors (structured field errors from backend)
 * 2. ApiError.details.field (single field from backend response)
 * 3. fieldMap pattern matching (frontend fallback)
 * 4. onUnmappedError / toast (last resort)
 *
 * @example
 * ```tsx
 * const { handleError } = useFormErrorHandler({
 *   form,
 *   fieldMap: { 'CNPJ already exists': 'cnpj' },
 * });
 *
 * const mutation = useMutation({
 *   mutationFn: createCompany,
 *   onError: handleError,
 * });
 * ```
 */
export function useFormErrorHandler<T extends FieldValues>({
  form,
  fieldMap,
  onUnmappedError,
}: UseFormErrorHandlerOptions<T>) {
  const handleError = useCallback(
    (error: unknown) => {
      const apiError =
        error instanceof ApiError ? error : ApiError.from(error);

      // 1. Try structured fieldErrors from backend
      if (apiError.fieldErrors && apiError.fieldErrors.length > 0) {
        let mappedAny = false;
        for (const fe of apiError.fieldErrors) {
          try {
            form.setError(fe.field as Path<T>, {
              type: 'server',
              message: translateError(fe.message),
            });
            mappedAny = true;
          } catch {
            // Field doesn't exist in form, skip
          }
        }
        if (mappedAny) return;
      }

      // 2. Try single field from backend response (details.field)
      const fieldFromBackend = apiError.details?.field as string | undefined;
      if (fieldFromBackend) {
        try {
          form.setError(fieldFromBackend as Path<T>, {
            type: 'server',
            message: translateError(apiError.message),
          });
          return;
        } catch {
          // Field doesn't exist in form, continue
        }
      }

      // 3. Try fieldMap pattern matching
      if (fieldMap) {
        const errorMessage = apiError.message;
        for (const [pattern, fieldName] of Object.entries(fieldMap)) {
          if (errorMessage.includes(pattern)) {
            form.setError(fieldName, {
              type: 'server',
              message: translateError(errorMessage),
            });
            return;
          }
        }
      }

      // 4. Unmapped error → toast or custom handler
      if (onUnmappedError) {
        onUnmappedError(apiError);
      } else {
        toast.error(translateError(apiError.message));
      }
    },
    [form, fieldMap, onUnmappedError],
  );

  return { handleError };
}
