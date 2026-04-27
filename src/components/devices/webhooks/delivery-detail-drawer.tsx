'use client';

/**
 * DeliveryDetailDrawer — Drawer 480px com 8 D-29 fields + responseBody
 * truncado (1KB pelo backend) + 2 CTAs (Reenviar entrega / Copiar payload).
 *
 * LGPD T-11-14: signature NÃO é exposta pelo backend (não persistida em
 * WebhookDelivery); o cabeçalho da requisição mostra um placeholder estático
 * `t=<unix>,v1=<hex>` apenas para documentar o shape. O response body do
 * customer é truncado a ~1KB pelo backend (`responseBodyTruncated`).
 */

import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import type { WebhookDeliveryDTO } from '@/types/system';
import { Copy, Send } from 'lucide-react';
import { toast } from 'sonner';
import { DeliveryStatusBadge } from './delivery-status-badge';

const ERROR_LABEL: Record<string, string> = {
  TIMEOUT: 'Timeout (10s)',
  NETWORK: 'Erro de rede',
  TLS: 'Erro TLS',
  HTTP_4XX: 'HTTP 4xx',
  HTTP_5XX: 'HTTP 5xx',
  REDIRECT_BLOCKED: 'Redirect bloqueado',
  SSRF_BLOCKED: 'Anti-SSRF bloqueou',
  DNS_FAIL: 'Falha de DNS',
};

export interface DeliveryDetailDrawerProps {
  delivery: WebhookDeliveryDTO | null;
  isOpen: boolean;
  onClose: () => void;
  onReprocess: () => void;
  reprocessing?: boolean;
  reprocessDisabled?: boolean;
  reprocessDisabledReason?: string;
}

export function DeliveryDetailDrawer({
  delivery,
  isOpen,
  onClose,
  onReprocess,
  reprocessing,
  reprocessDisabled,
  reprocessDisabledReason,
}: DeliveryDetailDrawerProps) {
  if (!delivery) return null;

  async function handleCopyPayloadId() {
    if (!delivery) return;
    try {
      await navigator.clipboard.writeText(delivery.eventId);
      toast.success('Event ID copiado.');
    } catch {
      toast.error('Não foi possível copiar.');
    }
  }

  return (
    <Drawer open={isOpen} onOpenChange={o => !o && onClose()} direction="right">
      <DrawerContent
        className="ml-auto h-full w-full sm:max-w-[480px] data-[vaul-drawer-direction=right]:rounded-l-2xl"
        data-testid="delivery-detail-drawer"
      >
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            Detalhes da entrega
            <DeliveryStatusBadge status={delivery.status} />
          </DrawerTitle>
          <DrawerDescription className="font-mono text-xs break-all">
            {delivery.eventId}
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-6 pb-4 space-y-4 overflow-y-auto">
          <Field label="Tipo do evento">
            <span className="font-mono text-sm">{delivery.eventType}</span>
          </Field>

          <Field label="Tentativa">
            <span className="text-sm">
              {delivery.attemptCount} de 5
              {delivery.attemptCount >= 5 && (
                <span className="ml-2 inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-xs text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
                  Última
                </span>
              )}
            </span>
          </Field>

          <Field label="Iniciada em">
            <span className="font-mono text-xs">
              {delivery.lastAttemptAt ?? delivery.createdAt}
            </span>
          </Field>

          <Field label="Duração">
            <span className="text-sm">
              {delivery.lastDurationMs !== null
                ? `${delivery.lastDurationMs} ms`
                : '—'}
            </span>
          </Field>

          <Field label="HTTP status">
            <span
              className={cn(
                'font-mono text-sm',
                delivery.lastHttpStatus &&
                  delivery.lastHttpStatus >= 500 &&
                  'text-rose-700 dark:text-rose-300',
                delivery.lastHttpStatus &&
                  delivery.lastHttpStatus >= 400 &&
                  delivery.lastHttpStatus < 500 &&
                  'text-amber-700 dark:text-amber-300',
                delivery.lastHttpStatus &&
                  delivery.lastHttpStatus >= 200 &&
                  delivery.lastHttpStatus < 300 &&
                  'text-emerald-700 dark:text-emerald-300'
              )}
            >
              {delivery.lastHttpStatus ?? '—'}
            </span>
          </Field>

          <Field label="Classe do erro">
            <span className="text-sm">
              {delivery.lastErrorClass
                ? (ERROR_LABEL[delivery.lastErrorClass] ??
                  delivery.lastErrorClass)
                : '—'}
            </span>
          </Field>

          <Field label="Mensagem">
            <span className="text-sm text-muted-foreground">
              {delivery.lastErrorMessage ?? '—'}
            </span>
          </Field>

          <Field label="Retry-After">
            <span className="text-sm">
              {delivery.lastRetryAfterSeconds !== null
                ? `${delivery.lastRetryAfterSeconds}s`
                : '—'}
            </span>
          </Field>

          <Field label="Reenvios manuais">
            <span className="text-sm">
              {delivery.manualReprocessCount} de 3
            </span>
          </Field>

          {/* Backend não retorna signature mascarada (por segurança); placeholder é puramente ilustrativo do shape do header. */}
          <Field label="Cabeçalhos da requisição">
            <pre className="font-mono text-xs leading-relaxed bg-slate-50 dark:bg-slate-900/60 rounded-md p-2 overflow-x-auto">
              {`X-OpenSea-Signature: t=<unix>,v1=<hex>\nX-OpenSea-Webhook-ID: ${delivery.endpointId}\nX-OpenSea-Event-ID: ${delivery.eventId}`}
            </pre>
          </Field>

          <Field label="Corpo da resposta (truncado a 1KB)">
            <pre className="font-mono text-xs leading-relaxed bg-slate-50 dark:bg-slate-900/60 rounded-md p-2 overflow-x-auto max-h-48 overflow-y-auto">
              {delivery.responseBodyTruncated ?? '(vazio)'}
            </pre>
          </Field>
        </div>

        <DrawerFooter className="border-t border-border">
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyPayloadId}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copiar Event ID
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={onReprocess}
              disabled={reprocessing || reprocessDisabled}
              title={reprocessDisabledReason}
            >
              <Send className="mr-2 h-4 w-4" />
              {reprocessing ? 'Reenviando...' : 'Reenviar entrega'}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold mb-1">
        {label}
      </p>
      {children}
    </div>
  );
}
