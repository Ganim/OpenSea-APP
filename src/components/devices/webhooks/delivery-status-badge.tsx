'use client';

/**
 * DeliveryStatusBadge — chip semântico de status de entrega de webhook
 * (UI-SPEC §Status semantic palette).
 */

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { WebhookDeliveryStatus } from '@/types/system';
import { AlertTriangle, CheckCircle2, Clock, XOctagon } from 'lucide-react';

const STATUS_CONFIG: Record<
  WebhookDeliveryStatus,
  { label: string; cls: string; Icon: React.ElementType }
> = {
  DELIVERED: {
    label: 'Entregue',
    cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30',
    Icon: CheckCircle2,
  },
  PENDING: {
    label: 'Pendente',
    cls: 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300 border border-sky-200 dark:border-sky-500/30',
    Icon: Clock,
  },
  FAILED: {
    label: 'Em retry',
    cls: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30',
    Icon: AlertTriangle,
  },
  DEAD: {
    label: 'Morta',
    cls: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30',
    Icon: XOctagon,
  },
};

export function DeliveryStatusBadge({
  status,
  className,
}: {
  status: WebhookDeliveryStatus;
  className?: string;
}) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.Icon;
  return (
    <Badge
      className={cn(
        'inline-flex items-center gap-1 border-0 px-2 py-0.5 text-xs font-medium',
        cfg.cls,
        className
      )}
    >
      <Icon className="h-3 w-3" aria-hidden />
      {cfg.label}
    </Badge>
  );
}
