'use client';

/**
 * WebhookSecretReveal — Phase 11 D-08 visible-once secret display.
 *
 * Card amber com secret cleartext (UMA vez) + botão Copiar + aviso explícito
 * que após sair, secret só pode ser regenerado.
 *
 * Threat T-11-03: secret nunca persistido em localStorage; vive apenas no
 * React state da prop. Ao desmontar, sai da memória.
 */

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export interface WebhookSecretRevealProps {
  secret: string;
  className?: string;
  /** Optional caption rendered above the secret (e.g. "Webhook criado") */
  caption?: string;
}

export function WebhookSecretReveal({
  secret,
  className,
  caption,
}: WebhookSecretRevealProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      toast.success('Secret copiado para a área de transferência.');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(
        'Não foi possível copiar automaticamente. Selecione e copie o texto manualmente.'
      );
    }
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10',
        className
      )}
      data-testid="webhook-secret-reveal"
    >
      {caption && (
        <p className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-2">
          {caption}
        </p>
      )}
      <div className="flex items-start gap-2">
        <code
          className="flex-1 font-mono text-sm text-amber-900 dark:text-amber-100 break-all select-all"
          aria-label="Secret do webhook"
        >
          {secret}
        </code>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleCopy}
          className="shrink-0 border-amber-300 text-amber-800 hover:bg-amber-100 dark:border-amber-500/40 dark:text-amber-200 dark:hover:bg-amber-500/20"
        >
          {copied ? (
            <>
              <Check className="mr-1 h-4 w-4" />
              Copiado
            </>
          ) : (
            <>
              <Copy className="mr-1 h-4 w-4" />
              Copiar secret
            </>
          )}
        </Button>
      </div>
      <p className="mt-3 text-xs text-amber-700 dark:text-amber-300">
        Após sair desta tela, o secret só poderá ser regenerado, nunca
        recuperado. Guarde-o em local seguro (gerenciador de credenciais ou
        cofre interno).
      </p>
    </div>
  );
}
