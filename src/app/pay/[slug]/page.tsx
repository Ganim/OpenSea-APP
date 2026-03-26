'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { paymentLinksService } from '@/services/finance';
import type { PaymentLinkDetail } from '@/types/finance';
import {
  CheckCircle,
  Copy,
  Download,
  Loader2,
  QrCode,
  Receipt,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export default function PublicPaymentPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [paymentLink, setPaymentLink] = useState<PaymentLinkDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLink() {
      try {
        const response = await paymentLinksService.getPublic(slug);
        setPaymentLink(response.paymentLink);
      } catch {
        setError('Link de pagamento não encontrado');
      } finally {
        setIsLoading(false);
      }
    }

    fetchLink();
  }, [slug]);

  const copyPixCode = useCallback(() => {
    if (paymentLink?.pixCopiaECola) {
      navigator.clipboard.writeText(paymentLink.pixCopiaECola);
      toast.success('Código PIX copiado');
    }
  }, [paymentLink]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (error || !paymentLink) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <XCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold mb-2">Link não encontrado</h1>
          <p className="text-sm text-muted-foreground">
            Este link de pagamento não existe ou foi removido.
          </p>
        </Card>
      </div>
    );
  }

  const isPaid = paymentLink.status === 'PAID';
  const isExpired = paymentLink.status === 'EXPIRED';
  const isCancelled = paymentLink.status === 'CANCELLED';
  const isActive = paymentLink.status === 'ACTIVE';

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-violet-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">OS</span>
          </div>
          <span className="font-semibold text-lg">OpenSea</span>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 py-8">
        {/* Status banner for non-active states */}
        {isPaid && (
          <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-500/8 rounded-xl text-center">
            <CheckCircle className="h-10 w-10 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
            <p className="font-medium text-emerald-700 dark:text-emerald-300">
              Pagamento confirmado
            </p>
            {paymentLink.paidAt && (
              <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-1">
                Pago em{' '}
                {new Date(paymentLink.paidAt).toLocaleString('pt-BR')}
              </p>
            )}
          </div>
        )}

        {isExpired && (
          <div className="mb-6 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl text-center">
            <XCircle className="h-10 w-10 text-slate-400 mx-auto mb-2" />
            <p className="font-medium text-slate-600 dark:text-slate-300">
              Link expirado
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Este link de pagamento não está mais disponível.
            </p>
          </div>
        )}

        {isCancelled && (
          <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-500/8 rounded-xl text-center">
            <XCircle className="h-10 w-10 text-rose-500 mx-auto mb-2" />
            <p className="font-medium text-rose-700 dark:text-rose-300">
              Pagamento cancelado
            </p>
          </div>
        )}

        {/* Payment details card */}
        <Card className="p-6 mb-6">
          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground mb-1">
              {paymentLink.description}
            </p>
            {paymentLink.customerName && (
              <p className="text-xs text-muted-foreground mb-3">
                Para: {paymentLink.customerName}
              </p>
            )}
            <p className="text-3xl font-bold text-violet-700 dark:text-violet-400">
              {formatCurrency(paymentLink.amount)}
            </p>
          </div>

          {isActive && (
            <div className="space-y-4">
              {/* PIX Section */}
              {paymentLink.pixCopiaECola && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <QrCode className="h-4 w-4 text-violet-600" />
                    Pagar com PIX
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-2">
                      PIX Copia e Cola:
                    </p>
                    <div className="flex gap-2">
                      <code className="flex-1 text-xs bg-white dark:bg-slate-900 p-2 rounded border break-all">
                        {paymentLink.pixCopiaECola}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyPixCode}
                        className="shrink-0"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Boleto Section */}
              {paymentLink.boletoDigitableLine && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Receipt className="h-4 w-4 text-violet-600" />
                    Pagar com Boleto
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-2">
                      Linha digitável:
                    </p>
                    <div className="flex gap-2">
                      <code className="flex-1 text-xs bg-white dark:bg-slate-900 p-2 rounded border break-all">
                        {paymentLink.boletoDigitableLine}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            paymentLink.boletoDigitableLine!
                          );
                          toast.success('Linha digitável copiada');
                        }}
                        className="shrink-0"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>

                    {paymentLink.boletoPdfUrl && (
                      <Button
                        variant="outline"
                        className="w-full mt-3 gap-2"
                        onClick={() =>
                          window.open(paymentLink.boletoPdfUrl!, '_blank')
                        }
                      >
                        <Download className="h-4 w-4" />
                        Baixar Boleto PDF
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* If no payment methods available */}
              {!paymentLink.pixCopiaECola &&
                !paymentLink.boletoDigitableLine && (
                  <div className="text-center py-6 text-muted-foreground">
                    <p className="text-sm">
                      As opções de pagamento estão sendo processadas.
                    </p>
                    <p className="text-xs mt-1">
                      Tente novamente em alguns instantes.
                    </p>
                  </div>
                )}
            </div>
          )}
        </Card>

        {/* Security footer */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Pagamento seguro via OpenSea</span>
        </div>
      </main>
    </div>
  );
}
