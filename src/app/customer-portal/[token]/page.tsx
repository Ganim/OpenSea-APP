/**
 * Portal do Cliente — Visualizacao publica (autenticada via token na URL)
 *
 * Permite que o cliente veja suas faturas pendentes e pagas,
 * e realize pagamentos via PIX ou Boleto.
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  CheckCircle,
  Clock,
  Copy,
  CreditCard,
  Download,
  FileText,
  Loader2,
  QrCode,
  Receipt,
  ShieldAlert,
  ShieldCheck,
  User,
  XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { customerPortalPublicService } from '@/services/finance/customer-portal.service';
import type {
  PortalInvoice,
  GeneratePortalPaymentResponse,
} from '@/types/finance';
import { toast } from 'sonner';

// =============================================================================
// HELPERS
// =============================================================================

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

function isOverdue(dueDate: string, status: string): boolean {
  if (status === 'RECEIVED' || status === 'PAID') return false;
  return new Date(dueDate) < new Date();
}

function getStatusLabel(status: string): string {
  const statusMap: Record<string, string> = {
    PENDING: 'Pendente',
    OVERDUE: 'Atrasado',
    PAID: 'Pago',
    RECEIVED: 'Recebido',
    PARTIALLY_PAID: 'Parcialmente Pago',
    CANCELLED: 'Cancelado',
    SCHEDULED: 'Agendado',
  };
  return statusMap[status] ?? status;
}

function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    PENDING:
      'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
    OVERDUE: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
    PAID: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
    RECEIVED:
      'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
    PARTIALLY_PAID:
      'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400',
    CANCELLED:
      'bg-slate-50 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400',
    SCHEDULED:
      'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400',
  };
  return colorMap[status] ?? '';
}

// =============================================================================
// INVOICE CARD
// =============================================================================

function InvoiceCard({
  invoice,
  onPay,
}: {
  invoice: PortalInvoice;
  onPay: (invoice: PortalInvoice) => void;
}) {
  const overdue = isOverdue(invoice.dueDate, invoice.status);
  const isPaid = invoice.status === 'RECEIVED' || invoice.status === 'PAID';
  const canPay = !isPaid && invoice.status !== 'CANCELLED';

  return (
    <Card
      className={`transition-colors ${overdue && canPay ? 'border-rose-200 dark:border-rose-800' : ''}`}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-muted-foreground">
                {invoice.code}
              </span>
              <Badge
                className={getStatusColor(invoice.status)}
                variant="secondary"
              >
                {getStatusLabel(invoice.status)}
              </Badge>
            </div>
            <p className="text-sm font-medium truncate">
              {invoice.description}
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Vencimento: {formatDate(invoice.dueDate)}
              </span>
              {invoice.paymentDate && (
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-emerald-500" />
                  Pago em: {formatDate(invoice.paymentDate)}
                </span>
              )}
            </div>
          </div>

          <div className="text-right shrink-0">
            <p
              className={`text-lg font-bold ${isPaid ? 'text-emerald-600 dark:text-emerald-400' : overdue ? 'text-rose-600 dark:text-rose-400' : ''}`}
            >
              {formatCurrency(invoice.expectedAmount)}
            </p>
            {canPay && (
              <Button
                size="sm"
                className="mt-2 gap-1.5"
                onClick={() => onPay(invoice)}
              >
                <CreditCard className="h-3.5 w-3.5" />
                Pagar
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// PAYMENT MODAL
// =============================================================================

function PaymentModal({
  isOpen,
  onClose,
  token,
  invoice,
}: {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  invoice: PortalInvoice | null;
}) {
  const [paymentData, setPaymentData] =
    useState<GeneratePortalPaymentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'PIX' | 'BOLETO'>('PIX');

  const generatePayment = useCallback(
    async (method: 'PIX' | 'BOLETO') => {
      if (!invoice) return;
      setIsLoading(true);
      setSelectedMethod(method);
      try {
        const result = await customerPortalPublicService.generatePayment(
          token,
          invoice.id,
          { method }
        );
        setPaymentData(result);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Erro ao gerar pagamento.';
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [token, invoice]
  );

  // Auto-generate PIX on open
  useEffect(() => {
    if (isOpen && invoice) {
      setPaymentData(null);
      generatePayment('PIX');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, invoice?.id]);

  const copyToClipboard = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado para a area de transferencia`);
  }, []);

  if (!invoice) return null;

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pagamento</DialogTitle>
          <DialogDescription>
            {invoice.description} -{' '}
            <strong>{formatCurrency(invoice.expectedAmount)}</strong>
          </DialogDescription>
        </DialogHeader>

        {/* Method selector */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={selectedMethod === 'PIX' ? 'default' : 'outline'}
            size="sm"
            className="flex-1 gap-2"
            onClick={() => generatePayment('PIX')}
            disabled={isLoading}
          >
            <QrCode className="h-4 w-4" />
            PIX
          </Button>
          <Button
            variant={selectedMethod === 'BOLETO' ? 'default' : 'outline'}
            size="sm"
            className="flex-1 gap-2"
            onClick={() => generatePayment('BOLETO')}
            disabled={isLoading}
          >
            <Receipt className="h-4 w-4" />
            Boleto
          </Button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
          </div>
        )}

        {/* PIX Data */}
        {!isLoading && paymentData && selectedMethod === 'PIX' && (
          <div className="space-y-4">
            {paymentData.pixCopiaECola ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <QrCode className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  PIX Copia e Cola
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <code className="text-xs break-all block mb-3">
                    {paymentData.pixCopiaECola}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                    onClick={() =>
                      copyToClipboard(paymentData.pixCopiaECola!, 'Codigo PIX')
                    }
                  >
                    <Copy className="h-4 w-4" />
                    Copiar Codigo PIX
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <QrCode className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">
                  Chave PIX nao disponivel para esta fatura.
                </p>
                <p className="text-xs mt-1">
                  Entre em contato com o emissor para mais informacoes.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Boleto Data */}
        {!isLoading && paymentData && selectedMethod === 'BOLETO' && (
          <div className="space-y-4">
            {paymentData.boletoDigitableLine ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Receipt className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  Linha Digitavel
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <code className="text-xs break-all block mb-3">
                    {paymentData.boletoDigitableLine}
                  </code>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() =>
                        copyToClipboard(
                          paymentData.boletoDigitableLine!,
                          'Linha digitavel'
                        )
                      }
                    >
                      <Copy className="h-4 w-4" />
                      Copiar
                    </Button>
                    {paymentData.boletoPdfUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-2"
                        onClick={() =>
                          window.open(paymentData.boletoPdfUrl!, '_blank')
                        }
                      >
                        <Download className="h-4 w-4" />
                        Baixar PDF
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Receipt className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">
                  Boleto nao disponivel para esta fatura.
                </p>
                <p className="text-xs mt-1">
                  Entre em contato com o emissor para mais informacoes.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 pt-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Pagamento seguro via OpenSea</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// =============================================================================
// ERROR STATE
// =============================================================================

function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="py-12 text-center">
          <ShieldAlert className="h-12 w-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Acesso Negado</h2>
          <p className="text-sm text-muted-foreground">{message}</p>
        </CardContent>
      </Card>
    </div>
  );
}

// =============================================================================
// EMPTY STATE
// =============================================================================

function EmptyInvoiceState({ label }: { label: string }) {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// PAGE
// =============================================================================

export default function CustomerPortalPage() {
  const params = useParams();
  const token = params.token as string;

  const [customerName, setCustomerName] = useState<string>('');
  const [pendingInvoices, setPendingInvoices] = useState<PortalInvoice[]>([]);
  const [paidInvoices, setPaidInvoices] = useState<PortalInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [payingInvoice, setPayingInvoice] = useState<PortalInvoice | null>(
    null
  );
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  // Load portal data
  useEffect(() => {
    let cancelled = false;

    async function loadPortalData() {
      setIsLoading(true);
      setError(null);

      try {
        // Validate token first
        await customerPortalPublicService.validate(token);

        // Load both pending and paid invoices in parallel
        const [pendingResponse, paidResponse] = await Promise.all([
          customerPortalPublicService.listInvoices(token, {
            status: 'pending',
            limit: 50,
          }),
          customerPortalPublicService.listInvoices(token, {
            status: 'paid',
            limit: 50,
          }),
        ]);

        if (cancelled) return;

        setCustomerName(
          pendingResponse.customerName || paidResponse.customerName
        );
        setPendingInvoices(pendingResponse.invoices);
        setPaidInvoices(paidResponse.invoices);
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : 'Token invalido ou expirado.'
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadPortalData();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handlePayClick = useCallback((invoice: PortalInvoice) => {
    setPayingInvoice(invoice);
    setPaymentModalOpen(true);
  }, []);

  const handlePaymentModalClose = useCallback(() => {
    setPaymentModalOpen(false);
    setPayingInvoice(null);
  }, []);

  if (error) {
    return <ErrorState message={error} />;
  }

  const pendingTotal = pendingInvoices.reduce(
    (sum, inv) => sum + inv.expectedAmount,
    0
  );

  return (
    <>
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-500/10">
              <User className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-tight">
                Portal do Cliente
              </h1>
              {customerName && (
                <p className="text-xs text-muted-foreground">{customerName}</p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
          </div>
        ) : (
          <>
            {/* Summary card */}
            {pendingInvoices.length > 0 && (
              <Card className="bg-teal-50/50 dark:bg-teal-500/5 border-teal-200 dark:border-teal-800">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Total em Aberto
                      </p>
                      <p className="text-2xl font-bold text-teal-700 dark:text-teal-400">
                        {formatCurrency(pendingTotal)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {pendingInvoices.length}{' '}
                        {pendingInvoices.length === 1
                          ? 'fatura pendente'
                          : 'faturas pendentes'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tabs */}
            <Tabs defaultValue="pending">
              <TabsList className="grid w-full grid-cols-2 h-12 mb-4">
                <TabsTrigger value="pending" className="gap-2">
                  <Clock className="h-4 w-4" />
                  Faturas Pendentes
                  {pendingInvoices.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-1 bg-teal-100 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400"
                    >
                      {pendingInvoices.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="history" className="gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Historico
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending">
                {pendingInvoices.length === 0 ? (
                  <EmptyInvoiceState label="Nenhuma fatura pendente. Tudo em dia!" />
                ) : (
                  <div className="space-y-3">
                    {pendingInvoices.map(invoice => (
                      <InvoiceCard
                        key={invoice.id}
                        invoice={invoice}
                        onPay={handlePayClick}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="history">
                {paidInvoices.length === 0 ? (
                  <EmptyInvoiceState label="Nenhuma fatura paga encontrada." />
                ) : (
                  <div className="space-y-3">
                    {paidInvoices.map(invoice => (
                      <InvoiceCard
                        key={invoice.id}
                        invoice={invoice}
                        onPay={handlePayClick}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={handlePaymentModalClose}
        token={token}
        invoice={payingInvoice}
      />
    </>
  );
}
