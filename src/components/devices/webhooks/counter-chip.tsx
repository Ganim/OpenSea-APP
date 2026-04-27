'use client';

/**
 * WebhookCounterChip — Phase 11 D-34
 *
 * Visualiza o contador `N de MAX webhooks` com cor dinâmica:
 *  - count < amberThreshold (45): slate (neutro)
 *  - amberThreshold <= count < max (45..49): amber (aviso)
 *  - count === max (50): rose (rejeição/limite)
 */

import { cn } from '@/lib/utils';
import { WEBHOOK_TENANT_LIMIT } from '@/types/system';

export interface WebhookCounterChipProps {
  count: number;
  max?: number;
  amberThreshold?: number;
  className?: string;
  /** Suffix exibido após o número. Default: "webhooks". */
  unit?: string;
}

export function getCounterTone(
  count: number,
  max: number,
  amberThreshold: number
): 'slate' | 'amber' | 'rose' {
  if (count >= max) return 'rose';
  if (count >= amberThreshold) return 'amber';
  return 'slate';
}

const TONE_CLASSES: Record<'slate' | 'amber' | 'rose', string> = {
  slate:
    'bg-slate-100 text-slate-700 dark:bg-slate-700/60 dark:text-slate-200 border border-slate-200 dark:border-slate-600/40',
  amber:
    'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30',
  rose: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30',
};

export function WebhookCounterChip({
  count,
  max = WEBHOOK_TENANT_LIMIT,
  amberThreshold = 45,
  className,
  unit = 'webhooks',
}: WebhookCounterChipProps) {
  const tone = getCounterTone(count, max, amberThreshold);
  return (
    <span
      data-testid="webhook-counter-chip"
      data-tone={tone}
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium',
        TONE_CLASSES[tone],
        className
      )}
    >
      {count} de {max} {unit}
    </span>
  );
}
