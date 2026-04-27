'use client';

/**
 * WebhookAutoDisabledBanner — Phase 11 D-25.
 *
 * Visível apenas quando endpoint.status === 'AUTO_DISABLED'. Mostra motivo
 * (CONSECUTIVE_DEAD ou HTTP_410_GONE) + CTA Reativar webhook (PIN gate fora
 * do banner; o banner apenas dispara o callback) + link secundário para o
 * log de entregas falhas.
 */

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type {
  WebhookEndpointAutoDisabledReason,
  WebhookEndpointDTO,
} from '@/types/system';
import { ArrowRight, RefreshCw, XOctagon } from 'lucide-react';

const REASON_LABEL: Record<WebhookEndpointAutoDisabledReason, string> = {
  CONSECUTIVE_DEAD:
    '10 entregas falharam consecutivamente — o sistema desativou o webhook automaticamente para evitar spam.',
  HTTP_410_GONE:
    'O endpoint respondeu HTTP 410 Gone — o destino sinalizou que não existe mais e parou de receber eventos.',
};

export interface WebhookAutoDisabledBannerProps {
  endpoint: WebhookEndpointDTO;
  onReactivateClick: () => void;
  onViewFailedDeliveriesClick?: () => void;
  reactivating?: boolean;
  className?: string;
}

export function WebhookAutoDisabledBanner({
  endpoint,
  onReactivateClick,
  onViewFailedDeliveriesClick,
  reactivating,
  className,
}: WebhookAutoDisabledBannerProps) {
  if (endpoint.status !== 'AUTO_DISABLED') return null;
  const reason = endpoint.autoDisabledReason
    ? REASON_LABEL[endpoint.autoDisabledReason]
    : 'O webhook foi desativado automaticamente.';

  return (
    <div
      role="alert"
      data-testid="webhook-auto-disabled-banner"
      className={cn(
        'rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-500/30 dark:bg-rose-500/10',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300">
          <XOctagon className="h-5 w-5" aria-hidden />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-rose-900 dark:text-rose-200">
            Webhook auto-desativado
          </h3>
          <p className="text-sm text-rose-800 dark:text-rose-200/90 mt-1">
            {reason}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              size="sm"
              onClick={onReactivateClick}
              disabled={reactivating}
              className="bg-amber-500 text-white hover:bg-amber-600 dark:bg-amber-500/90 dark:hover:bg-amber-500"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {reactivating ? 'Reativando...' : 'Reativar webhook'}
            </Button>
            {onViewFailedDeliveriesClick && (
              <button
                type="button"
                onClick={onViewFailedDeliveriesClick}
                className="inline-flex items-center gap-1 text-sm text-rose-700 hover:text-rose-900 dark:text-rose-300 dark:hover:text-rose-200 underline-offset-4 hover:underline"
              >
                Ver últimas entregas falhas
                <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
