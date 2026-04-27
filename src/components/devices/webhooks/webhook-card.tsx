'use client';

/**
 * WebhookCard — Phase 11 listing card.
 *
 * Status chip do endpoint (ACTIVE/PAUSED/AUTO_DISABLED) + URL truncada com
 * tooltip nativo + metadata (eventos count + última entrega relativa).
 *
 * Pattern visual: pos-terminals/page.tsx (p-5, dual-theme badges, hover).
 */

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { WebhookEndpointDTO, WebhookEndpointStatus } from '@/types/system';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PauseCircle, Wifi, XOctagon, type LucideIcon } from 'lucide-react';

const STATUS_CONFIG: Record<
  WebhookEndpointStatus,
  {
    label: string;
    cls: string;
    border: string;
    Icon: LucideIcon;
  }
> = {
  ACTIVE: {
    label: 'Ativo',
    cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-500/30',
    Icon: Wifi,
  },
  PAUSED: {
    label: 'Pausado',
    cls: 'bg-slate-100 text-slate-600 dark:bg-slate-700/60 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-600/40',
    Icon: PauseCircle,
  },
  AUTO_DISABLED: {
    label: 'Auto-desativado',
    cls: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-500/30',
    Icon: XOctagon,
  },
};

function formatRelative(iso: string | null | undefined, fallback: string) {
  if (!iso) return fallback;
  try {
    return formatDistanceToNow(new Date(iso), {
      addSuffix: true,
      locale: ptBR,
    });
  } catch {
    return fallback;
  }
}

export interface WebhookCardProps {
  webhook: WebhookEndpointDTO;
  onClick?: () => void;
  className?: string;
}

export function WebhookCard({ webhook, onClick, className }: WebhookCardProps) {
  const cfg = STATUS_CONFIG[webhook.status];
  const Icon = cfg.Icon;
  const eventCount = webhook.subscribedEvents.length;
  const title = webhook.description?.trim() || webhook.url;

  return (
    <Card
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={e => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        'group relative overflow-hidden border bg-white dark:bg-slate-800/60 p-5 transition-all hover:shadow-md cursor-pointer',
        cfg.border,
        webhook.status === 'AUTO_DISABLED' &&
          'ring-2 ring-rose-200 dark:ring-rose-500/30',
        className
      )}
      data-testid="webhook-card"
      data-webhook-id={webhook.id}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl',
            cfg.cls
          )}
        >
          <Icon className="h-6 w-6" aria-hidden />
        </div>
      </div>

      <h3 className="font-semibold text-lg mb-1 truncate" title={title}>
        {title}
      </h3>

      <p
        className="font-mono text-xs text-muted-foreground truncate mb-3"
        title={webhook.url}
      >
        {webhook.url}
      </p>

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <Badge className={cn('border-0', cfg.cls)}>{cfg.label}</Badge>
        <Badge className="border-0 bg-slate-100 text-slate-700 dark:bg-slate-700/60 dark:text-slate-300">
          {eventCount} {eventCount === 1 ? 'evento' : 'eventos'}
        </Badge>
      </div>

      <p className="text-xs text-muted-foreground">
        Última entrega:{' '}
        {formatRelative(webhook.lastDeliveryAt, 'Nunca entregou')}
      </p>

      <p
        className="font-mono text-[10px] text-muted-foreground/70 mt-2 truncate"
        title={`Secret: ${webhook.secretMasked}`}
      >
        {webhook.secretMasked}
      </p>
    </Card>
  );
}
