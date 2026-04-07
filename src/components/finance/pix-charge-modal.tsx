'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, QrCode, Clock, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { financeEntriesService } from '@/services/finance';
import type { CreatePixChargeResponse } from '@/types/finance';

interface PixChargeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pixCharge: CreatePixChargeResponse | null;
  entryDescription?: string;
  entryId?: string;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function getTimeRemaining(expiresAt: string): {
  expired: boolean;
  text: string;
} {
  const now = Date.now();
  const expiry = new Date(expiresAt).getTime();
  const diff = expiry - now;

  if (diff <= 0) {
    return { expired: true, text: 'Expirado' };
  }

  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  if (minutes > 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return {
      expired: false,
      text: `${hours}h ${remainingMinutes.toString().padStart(2, '0')}min`,
    };
  }

  return {
    expired: false,
    text: `${minutes}:${seconds.toString().padStart(2, '0')}`,
  };
}

type PixChargeStatus = 'ACTIVE' | 'PAID' | 'EXPIRED';

function getStatusBadge(status: PixChargeStatus) {
  switch (status) {
    case 'ACTIVE':
      return (
        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300 border-0">
          Ativa
        </Badge>
      );
    case 'PAID':
      return (
        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 border-0">
          Pago
        </Badge>
      );
    case 'EXPIRED':
      return (
        <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400 border-0">
          Expirado
        </Badge>
      );
  }
}

const MAX_POLLS = 60; // 5 minutes at 5s intervals

export function PixChargeModal({
  open,
  onOpenChange,
  pixCharge,
  entryDescription,
  entryId,
}: PixChargeModalProps) {
  const queryClient = useQueryClient();
  const [timeRemaining, setTimeRemaining] = useState<{
    expired: boolean;
    text: string;
  }>({ expired: false, text: '' });

  // Payment polling state
  const [pollCount, setPollCount] = useState(0);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const toastShownRef = useRef(false);

  // Poll for payment status after charge is generated
  const { data: entryStatus } = useQuery({
    queryKey: ['finance-entry-pix-status', entryId],
    queryFn: async () => {
      const response = await financeEntriesService.get(entryId!);
      return response.entry;
    },
    enabled: open && !!entryId && !!pixCharge && !paymentConfirmed,
    refetchInterval:
      open && !!pixCharge && !paymentConfirmed && pollCount < MAX_POLLS
        ? 5000
        : false,
    refetchIntervalInBackground: false,
  });

  // Increment poll counter
  useEffect(() => {
    if (!open || !pixCharge || paymentConfirmed || pollCount >= MAX_POLLS)
      return;

    const timer = setInterval(() => {
      setPollCount(c => c + 1);
    }, 5000);

    return () => clearInterval(timer);
  }, [open, pixCharge, paymentConfirmed, pollCount]);

  // Detect payment confirmation
  useEffect(() => {
    if (
      entryStatus &&
      (entryStatus.status === 'PAID' || entryStatus.status === 'RECEIVED') &&
      !toastShownRef.current
    ) {
      toastShownRef.current = true;
      setPaymentConfirmed(true);
      toast.success('Pagamento PIX recebido com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['finance-entries'] });
      queryClient.invalidateQueries({ queryKey: ['finance-entry'] });
    }
  }, [entryStatus?.status, queryClient]);

  // Reset state when modal closes or charge changes
  useEffect(() => {
    if (!open) {
      setPollCount(0);
      setPaymentConfirmed(false);
      toastShownRef.current = false;
    }
  }, [open]);

  useEffect(() => {
    if (!pixCharge?.expiresAt || !open) return;

    const update = () => {
      setTimeRemaining(getTimeRemaining(pixCharge.expiresAt));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [pixCharge?.expiresAt, open]);

  if (!pixCharge) return null;

  const status: PixChargeStatus = paymentConfirmed
    ? 'PAID'
    : timeRemaining.expired
      ? 'EXPIRED'
      : 'ACTIVE';

  const handleCopyPixCode = async () => {
    try {
      await navigator.clipboard.writeText(pixCharge.pixCopiaECola);
      toast.success('Copiado!');
    } catch {
      toast.error('Erro ao copiar para a área de transferência.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-violet-100 dark:bg-violet-500/10">
              <QrCode className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <DialogTitle className="text-lg">Cobrança PIX</DialogTitle>
              <DialogDescription>
                {entryDescription || 'Cobrança PIX gerada com sucesso'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Amount */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Valor</p>
            <p className="text-3xl font-bold text-violet-600 dark:text-violet-400">
              {formatCurrency(pixCharge.amount)}
            </p>
          </div>

          {/* Status + Expiration */}
          <div className="flex items-center justify-center gap-4">
            {getStatusBadge(status)}
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{timeRemaining.text}</span>
            </div>
          </div>

          {/* Payment Status Feedback */}
          {status === 'ACTIVE' && !paymentConfirmed && (
            <div className="flex items-center gap-2 rounded-lg bg-amber-50 dark:bg-amber-500/8 border border-amber-600/25 dark:border-amber-500/20 p-3 text-sm text-amber-700 dark:text-amber-300">
              <Loader2 className="h-4 w-4 animate-spin shrink-0" />
              <span>Aguardando pagamento PIX...</span>
            </div>
          )}

          {paymentConfirmed && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/8 border border-emerald-600/25 dark:border-emerald-500/20 p-3 text-sm text-emerald-700 dark:text-emerald-300">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>Pagamento confirmado!</span>
            </div>
          )}

          {pollCount >= MAX_POLLS &&
            !paymentConfirmed &&
            !timeRemaining.expired && (
              <p className="text-sm text-muted-foreground text-center">
                Tempo de espera expirado. Verifique o status manualmente.
              </p>
            )}

          {/* QR Code */}
          {(pixCharge.pixCopiaECola || pixCharge.qrCodeUrl) && (
            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-xl border flex justify-center">
                {pixCharge.pixCopiaECola ? (
                  <QRCodeSVG
                    value={pixCharge.pixCopiaECola}
                    size={192}
                    bgColor="#ffffff"
                    fgColor="#0f172a"
                    level="M"
                    includeMargin={false}
                  />
                ) : (
                  <img
                    src={pixCharge.qrCodeUrl}
                    alt="QR Code PIX"
                    className="w-48 h-48 object-contain"
                  />
                )}
              </div>
            </div>
          )}

          {/* Copia e Cola */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              PIX Copia e Cola
            </p>
            <div className="bg-violet-50 dark:bg-violet-500/8 rounded-lg p-3">
              <p className="font-mono text-xs tracking-wide break-all text-violet-700 dark:text-violet-300 line-clamp-4">
                {pixCharge.pixCopiaECola}
              </p>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Identificador</p>
              <Badge variant="outline" className="font-mono text-xs">
                {pixCharge.txId.slice(0, 16)}...
              </Badge>
            </div>
            <div>
              <p className="text-muted-foreground">Expiração</p>
              <p className="font-medium">
                {new Date(pixCharge.expiresAt).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-2">
            <Button
              variant="default"
              className="w-full gap-2"
              onClick={handleCopyPixCode}
              disabled={timeRemaining.expired || paymentConfirmed}
            >
              <Copy className="h-4 w-4" />
              Copiar Código PIX
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => onOpenChange(false)}
            >
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
