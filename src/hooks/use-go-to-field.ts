'use client';

import { useCallback } from 'react';

/**
 * Hook that provides a function to scroll to a form field and
 * briefly highlight it with a pulse animation.
 *
 * Uses `data-field-id` attribute to find the field wrapper element.
 *
 * @example
 * ```tsx
 * const goToField = useGoToField();
 *
 * <FormErrorReportModal
 *   onGoToField={goToField}
 *   ...
 * />
 * ```
 */
export function useGoToField() {
  return useCallback((fieldName: string) => {
    const el =
      document.querySelector(`[data-field-id="${fieldName}"]`) ||
      document.querySelector(`[name="${fieldName}"]`);

    if (!el) return;

    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Pulse animation on the field wrapper
    el.classList.add('animate-error-highlight');
    setTimeout(() => {
      el.classList.remove('animate-error-highlight');
    }, 2000);

    // Try to focus the input inside
    const input = el.querySelector<HTMLElement>(
      'input, select, textarea, [role="combobox"]',
    );
    if (input) {
      setTimeout(() => input.focus(), 300);
    }
  }, []);
}
