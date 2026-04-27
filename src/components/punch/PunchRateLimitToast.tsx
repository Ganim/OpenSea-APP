/**
 * Punch Rate Limit Toast (Phase 9 Plan 09-03)
 *
 * Displays countdown toast for RATE_LIMIT_EXCEEDED (429) errors.
 * Shows "Aguarde XX segundos" with live countdown.
 *
 * Called from punch-error-toasts.ts when 429 detected.
 */

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

let currentToastId: string | number | undefined;

/**
 * Show countdown toast for rate limit.
 * Counts down from `retryAfterSec` to 0.
 */
export function showRateLimitToast(retryAfterSec: number): void {
  // Dismiss any existing rate limit toast
  if (currentToastId !== undefined) {
    toast.dismiss(currentToastId);
  }

  let remaining = retryAfterSec;

  const updateToast = () => {
    currentToastId = toast.error(
      `Aguarde ${remaining} segundo${remaining === 1 ? '' : 's'}`,
      {
        duration: Infinity,
        description: 'Muitas tentativas. Tente novamente mais tarde.',
      }
    );
  };

  updateToast();

  const interval = setInterval(() => {
    remaining--;
    if (remaining <= 0) {
      clearInterval(interval);
      toast.dismiss(currentToastId);
      currentToastId = undefined;
      toast.success('Pronto! Você pode tentar novamente', {
        duration: 3000,
      });
    } else {
      toast.dismiss(currentToastId);
      updateToast();
    }
  }, 1000);
}
