'use client';

import { Badge } from '@/components/ui/badge';
import type { RecurringStatus } from '@/types/finance';
import { RECURRING_STATUS_LABELS } from '@/types/finance';

const STATUS_VARIANT: Record<
  RecurringStatus,
  'success' | 'warning' | 'secondary'
> = {
  ACTIVE: 'success',
  PAUSED: 'warning',
  CANCELLED: 'secondary',
};

interface RecurringStatusBadgeProps {
  status: RecurringStatus;
  className?: string;
}

export function RecurringStatusBadge({
  status,
  className,
}: RecurringStatusBadgeProps) {
  return (
    <Badge variant={STATUS_VARIANT[status]} className={className}>
      {RECURRING_STATUS_LABELS[status]}
    </Badge>
  );
}
