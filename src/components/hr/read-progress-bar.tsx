'use client';

/**
 * ReadProgressBar
 *
 * Horizontal bar showing read progress for an announcement.
 * Reference: Notion document "viewed by" footer + Slack post-receipt UI.
 *
 * - Emerald fill = readers
 * - Slate track = pending audience
 * - Caption underneath: "X% leram (X de Y)"
 */

import { cn } from '@/lib/utils';

interface ReadProgressBarProps {
  readCount: number;
  totalAudience: number;
  /** Optional className applied to the wrapper. */
  className?: string;
  /** Compact variant hides the caption. */
  compact?: boolean;
  /** Override default caption (advanced usage). */
  caption?: string;
  /** data-testid for the wrapper element. */
  testId?: string;
}

export function ReadProgressBar({
  readCount,
  totalAudience,
  className,
  compact = false,
  caption,
  testId = 'read-progress-bar',
}: ReadProgressBarProps) {
  const safeTotal = Math.max(0, totalAudience);
  const safeRead = Math.min(Math.max(0, readCount), safeTotal);
  const percentage = safeTotal === 0 ? 0 : (safeRead / safeTotal) * 100;
  const roundedPercentage = Math.round(percentage);

  const defaultCaption =
    safeTotal === 0
      ? 'Sem audiencia definida'
      : `${roundedPercentage}% leram (${safeRead} de ${safeTotal})`;

  return (
    <div
      data-testid={testId}
      className={cn('w-full flex flex-col gap-1', className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={roundedPercentage}
      aria-label={`${roundedPercentage}% dos colaboradores leram`}
    >
      <div
        className={cn(
          'relative w-full overflow-hidden rounded-full',
          compact ? 'h-1.5' : 'h-2',
          'bg-slate-200 dark:bg-slate-700/40'
        )}
      >
        <div
          className="h-full rounded-full bg-emerald-500 dark:bg-emerald-400 transition-[width] duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {!compact && (
        <p className="text-xs text-muted-foreground">
          {caption ?? defaultCaption}
        </p>
      )}
    </div>
  );
}

export default ReadProgressBar;
