'use client';

/**
 * OpenSea OS - Enrollment Photo Slot
 *
 * 64×64 thumbnail that renders a SILHOUETTE ONLY after a descriptor has
 * been captured — never the raw video frame. UI-SPEC §Explicitly Forbids:
 *
 * > Showing the captured selfie raw image anywhere after enrollment
 * > completes (silhouette only).
 *
 * Visual states:
 * - `empty`    → dashed outline + User silhouette icon, slot number "N"
 * - `captured` → filled card + green CheckCircle2 + "Foto N" label
 * - `active`   → highlighted accent ring (current capture step)
 */

import { cn } from '@/lib/utils';
import { CheckCircle2, User } from 'lucide-react';

export type EnrollmentSlotState = 'empty' | 'captured' | 'active';

interface EnrollmentPhotoSlotProps {
  /** 1-indexed slot number (`Foto 1`, `Foto 2`, ...). */
  index: number;
  state: EnrollmentSlotState;
  className?: string;
}

export function EnrollmentPhotoSlot({
  index,
  state,
  className,
}: EnrollmentPhotoSlotProps) {
  return (
    <div
      className={cn(
        'flex h-16 w-16 flex-col items-center justify-center rounded-lg border text-xs font-medium transition-colors',
        state === 'empty' &&
          'border-dashed border-border bg-muted/30 text-muted-foreground',
        state === 'active' &&
          'border-primary ring-2 ring-primary/40 bg-primary/5 text-primary',
        state === 'captured' &&
          'border-green-200 bg-green-50 text-green-700 dark:border-green-700/40 dark:bg-green-500/10 dark:text-green-300',
        className
      )}
      aria-label={
        state === 'captured' ? `Foto ${index} capturada` : `Foto ${index}`
      }
      data-testid={`enrollment-slot-${index}`}
      data-state={state}
    >
      {state === 'captured' ? (
        <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
      ) : (
        <User className="h-5 w-5 opacity-60" aria-hidden="true" />
      )}
      <span className="mt-1">Foto {index}</span>
    </div>
  );
}
