'use client';

import { useState } from 'react';
import { Check, Copy, KeyRound, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { VerifyActionPinModal } from '@/components/modals/verify-action-pin-modal';
import { useRegenerateEmployeeShortId } from '@/hooks/hr/use-regenerate-employee-short-id';

interface ShortIdDisplayProps {
  employeeId: string;
  shortId: string | null | undefined;
  canRegenerate: boolean;
}

/**
 * Displays the Employee public POS `shortId` (Emporion Fase 1) inline with the
 * other identification fields (Nome, Matrícula, CPF). Offers copy-to-clipboard
 * for everyone with view access and a confirm-dialog regenerate action gated
 * by the `hr.employees.admin` permission.
 */
export function ShortIdDisplay({
  employeeId,
  shortId,
  canRegenerate,
}: ShortIdDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const regenerate = useRegenerateEmployeeShortId(employeeId);

  const handleCopy = async () => {
    if (!shortId) return;
    try {
      await navigator.clipboard.writeText(shortId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard write may fail in insecure contexts — fail silently and let
      // the user select the value manually.
    }
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <KeyRound className="h-4 w-4" />
        <span>Código curto (POS)</span>
      </div>
      <div className="flex items-center gap-2">
        <div
          data-testid="employee-short-id-value"
          className="inline-flex h-9 items-center rounded-md border border-border bg-white px-3 font-mono text-base tracking-[0.3em] dark:bg-white/[0.03]"
        >
          {shortId ?? '—'}
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              disabled={!shortId}
              aria-label="Copiar código curto"
              data-testid="employee-short-id-copy"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {copied ? 'Copiado!' : 'Copiar código curto'}
          </TooltipContent>
        </Tooltip>

        {canRegenerate && (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={regenerate.isPending}
              onClick={() => setPinModalOpen(true)}
              data-testid="employee-short-id-regenerate"
            >
              <RefreshCw
                className={`h-4 w-4 ${regenerate.isPending ? 'animate-spin' : ''}`}
              />
              <span className="hidden md:inline">Regenerar</span>
            </Button>
            <VerifyActionPinModal
              isOpen={pinModalOpen}
              onClose={() => setPinModalOpen(false)}
              onSuccess={() => regenerate.mutate()}
              title="Regenerar código curto"
              description={`Digite seu PIN de Ação para regenerar o código atual ${shortId ?? '—'}. O funcionário precisará usar o novo código para acessar terminais POS.`}
            />
          </>
        )}
      </div>
    </div>
  );
}
