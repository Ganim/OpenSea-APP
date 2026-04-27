'use client';

/**
 * DeliveryLogRow — linha do log com 3 ações inline (Reenviar / Detalhes /
 * Checkbox bulk). Cooldown 30s pós-click no Reenviar (D-21) + counter
 * `{N}/3 reenvios manuais` (D-21). Backend é a fonte de verdade — tooltips
 * apenas refletem o estado conhecido localmente.
 */

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { WebhookDeliveryDTO } from '@/types/system';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronRight, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DeliveryStatusBadge } from './delivery-status-badge';

const COOLDOWN_SECONDS = 30; // D-21
const MAX_MANUAL_REPROCESS = 3; // D-21

function formatRelative(iso: string | null | undefined) {
  if (!iso) return '—';
  try {
    return formatDistanceToNow(new Date(iso), {
      addSuffix: true,
      locale: ptBR,
    });
  } catch {
    return '—';
  }
}

function formatHttpClass(status: number | null): string {
  if (status === null) return 'text-slate-500';
  if (status >= 200 && status < 300)
    return 'text-emerald-700 dark:text-emerald-300';
  if (status >= 400 && status < 500)
    return 'text-amber-700 dark:text-amber-300';
  if (status >= 500) return 'text-rose-700 dark:text-rose-300';
  return 'text-slate-500';
}

export interface DeliveryLogRowProps {
  delivery: WebhookDeliveryDTO;
  selected: boolean;
  onSelect: (next: boolean) => void;
  onReprocess: () => void;
  onOpenDetails: () => void;
  reprocessing?: boolean;
  /** Se já houve um reprocess local recente, segura o cooldown localmente. */
  recentReprocessAt?: string | null;
}

export function DeliveryLogRow({
  delivery,
  selected,
  onSelect,
  onReprocess,
  onOpenDetails,
  reprocessing,
  recentReprocessAt,
}: DeliveryLogRowProps) {
  const [, forceTick] = useState(0);

  const lastReprocessAt = recentReprocessAt ?? delivery.lastManualReprocessAt;
  const remaining = computeCooldownRemaining(lastReprocessAt);

  useEffect(() => {
    if (remaining <= 0) return;
    const t = setInterval(() => forceTick(n => n + 1), 1000);
    return () => clearInterval(t);
  }, [remaining]);

  const inCooldown = remaining > 0;
  const atCap = delivery.manualReprocessCount >= MAX_MANUAL_REPROCESS;
  const reprocessDisabled = inCooldown || atCap || reprocessing;

  return (
    <tr
      data-testid="delivery-log-row"
      data-delivery-id={delivery.id}
      className="border-b border-border hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
    >
      <td className="py-2 pl-3 pr-1 align-top">
        <Checkbox
          checked={selected}
          onCheckedChange={v => onSelect(v === true)}
          aria-label="Selecionar entrega"
        />
      </td>
      <td className="py-2 px-2 align-top">
        <DeliveryStatusBadge status={delivery.status} />
      </td>
      <td className="py-2 px-2 align-top">
        <p className="text-sm font-medium">{delivery.eventType}</p>
        <p className="font-mono text-[10px] text-muted-foreground truncate max-w-[200px]">
          {delivery.eventId}
        </p>
      </td>
      <td className="py-2 px-2 align-top text-sm">{delivery.attemptCount}/5</td>
      <td
        className={cn(
          'py-2 px-2 align-top font-mono text-sm',
          formatHttpClass(delivery.lastHttpStatus)
        )}
      >
        {delivery.lastHttpStatus ?? '—'}
      </td>
      <td className="py-2 px-2 align-top text-sm">
        {delivery.lastDurationMs !== null
          ? `${delivery.lastDurationMs} ms`
          : '—'}
      </td>
      <td className="py-2 px-2 align-top text-sm text-muted-foreground">
        {formatRelative(delivery.lastAttemptAt ?? delivery.createdAt)}
      </td>
      <td className="py-2 px-2 align-top">
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    disabled={reprocessDisabled}
                    onClick={onReprocess}
                    aria-label="Reenviar entrega"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                {atCap
                  ? 'Limite de 3 reenvios manuais atingido. Aguarde retries automáticos ou crie nova entrega.'
                  : inCooldown
                    ? `Aguarde 30s entre reenvios. Tempo restante: ${remaining}s.`
                    : `Reenviar entrega (${delivery.manualReprocessCount}/3)`}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={onOpenDetails}
            aria-label="Ver detalhes"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

function computeCooldownRemaining(lastReprocessAtIso: string | null): number {
  if (!lastReprocessAtIso) return 0;
  const last = new Date(lastReprocessAtIso).getTime();
  if (Number.isNaN(last)) return 0;
  const diffSec = Math.floor((Date.now() - last) / 1000);
  return Math.max(0, COOLDOWN_SECONDS - diffSec);
}
