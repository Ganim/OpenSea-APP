/**
 * Loan Detail Page - Rebuilt with amortization table, deviation alerts, and renegotiation suggestion.
 */

'use client';

import { AmortizationTable } from '@/components/finance/loans/amortization-table';
import {
  DeviationAlert,
  RenegotiationSuggestion,
} from '@/components/finance/loans/deviation-alert';
import { Header } from '@/components/layout/header';
import { PageActionBar } from '@/components/layout/page-action-bar';
import {
  PageBody,
  PageHeader,
  PageLayout,
} from '@/components/layout/page-layout';
import { VerifyActionPinModal } from '@/components/modals/verify-action-pin-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { FINANCE_PERMISSIONS } from '@/config/rbac/permission-codes';
import { useDeleteLoan, useLoan, usePayLoanInstallment } from '@/hooks/finance';
import { usePermissions } from '@/hooks/use-permissions';
import { calculatePrice, calculateSAC } from '@/lib/finance/amortization';
import type { LoanInstallment, LoanStatus } from '@/types/finance';
import { LOAN_STATUS_LABELS, LOAN_TYPE_LABELS } from '@/types/finance';
import {
  ArrowLeft,
  Banknote,
  Building2,
  Calendar,
  CreditCard,
  Percent,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

// =============================================================================
// HELPERS
// =============================================================================

function formatCurrency(value: number | null | undefined): string {
  if (value == null) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

function getStatusVariant(
  status: LoanStatus
): 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'outline' {
  switch (status) {
    case 'ACTIVE':
      return 'success';
    case 'PAID_OFF':
      return 'default';
    case 'DEFAULTED':
      return 'destructive';
    case 'RENEGOTIATED':
      return 'warning';
    case 'CANCELLED':
      return 'secondary';
    default:
      return 'secondary';
  }
}

// =============================================================================
// LOADING SKELETON
// =============================================================================

function DetailSkeleton() {
  return (
    <PageLayout>
      <PageHeader>
        <div className="h-10" />
      </PageHeader>
      <PageBody>
        <Card className="p-6">
          <div className="flex gap-6 items-center">
            <Skeleton className="h-16 w-16 rounded-lg" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-32" />
            </Card>
          ))}
        </div>
        <Card className="p-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <Skeleton className="h-64 w-full" />
        </Card>
      </PageBody>
    </PageLayout>
  );
}

// =============================================================================
// PAYMENT MODAL
// =============================================================================

function PaymentModal({
  installment,
  loanId,
  isOpen,
  onClose,
}: {
  installment: LoanInstallment | null;
  loanId: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const payMutation = usePayLoanInstallment();
  const [amount, setAmount] = useState('');
  const [paidAt, setPaidAt] = useState(new Date().toISOString().split('T')[0]);

  const handlePay = async () => {
    if (!installment) return;
    try {
      await payMutation.mutateAsync({
        loanId,
        data: {
          paidAmount: parseFloat(amount) || installment.totalAmount,
          paidAt,
        },
      });
      toast.success(
        `Parcela ${installment.installmentNumber} paga com sucesso.`
      );
      onClose();
    } catch {
      toast.error('Erro ao registrar pagamento.');
    }
  };

  if (!installment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Pagamento</DialogTitle>
          <DialogDescription>
            Parcela {installment.installmentNumber} - Valor:{' '}
            {formatCurrency(installment.totalAmount)}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="pay-amount">Valor Pago (R$)</Label>
            <Input
              id="pay-amount"
              type="number"
              step="0.01"
              placeholder={installment.totalAmount.toFixed(2)}
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="pay-date">Data do Pagamento</Label>
            <Input
              id="pay-date"
              type="date"
              value={paidAt}
              onChange={e => setPaidAt(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handlePay} disabled={payMutation.isPending}>
            {payMutation.isPending ? 'Processando...' : 'Confirmar Pagamento'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

export default function LoanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const { data, isLoading } = useLoan(id);
  const deleteLoan = useDeleteLoan();

  const canDelete = hasPermission(FINANCE_PERMISSIONS.LOANS.REMOVE);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [paymentInstallment, setPaymentInstallment] =
    useState<LoanInstallment | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const loan = data?.loan;

  // Calculate amortization table
  const amortizationRows = useMemo(() => {
    if (!loan) return [];

    const monthlyRate = loan.interestRate / 100 / 12;

    // Determine amortization system based on loan type/interestType
    // Use Price by default (same as backend calculation)
    // SAC when interestType is 'SAC'
    if (loan.interestType === 'SAC') {
      return calculateSAC(
        loan.principalAmount,
        monthlyRate,
        loan.totalInstallments
      );
    }

    return calculatePrice(
      loan.principalAmount,
      monthlyRate,
      loan.totalInstallments
    );
  }, [loan]);

  const progressPercentage = loan
    ? loan.totalInstallments > 0
      ? Math.round((loan.paidInstallments / loan.totalInstallments) * 100)
      : 0
    : 0;

  const handleDelete = useCallback(async () => {
    if (!loan) return;
    try {
      await deleteLoan.mutateAsync(loan.id);
      toast.success('Empréstimo excluído com sucesso.');
      router.push('/finance/loans');
    } catch {
      toast.error('Erro ao excluir empréstimo.');
    }
  }, [loan, deleteLoan, router]);

  const handlePayInstallment = useCallback((inst: LoanInstallment) => {
    setPaymentInstallment(inst);
    setPaymentModalOpen(true);
  }, []);

  if (isLoading) return <DetailSkeleton />;

  if (!loan) {
    return (
      <PageLayout>
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'Financeiro', href: '/finance' },
              { label: 'Empréstimos', href: '/finance/loans' },
            ]}
          />
        </PageHeader>
        <PageBody>
          <Card className="p-12 text-center">
            <p className="text-destructive text-lg">
              Empréstimo não encontrado.
            </p>
            <Link href="/finance/loans">
              <Button variant="outline" className="mt-4">
                Voltar para empréstimos
              </Button>
            </Link>
          </Card>
        </PageBody>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader>
        <PageActionBar
          breadcrumbItems={[
            { label: 'Financeiro', href: '/finance' },
            { label: 'Empréstimos', href: '/finance/loans' },
            { label: loan.name },
          ]}
          buttons={[
            ...(canDelete
              ? [
                  {
                    id: 'delete-loan',
                    title: 'Excluir',
                    icon: Trash2,
                    onClick: () => setDeleteModalOpen(true),
                    variant: 'destructive' as const,
                  },
                ]
              : []),
          ]}
        />

        <div className="flex items-center gap-4">
          <Link href="/finance/loans">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar
            </Button>
          </Link>
        </div>
      </PageHeader>

      <PageBody>
        {/* Loan Header Card */}
        <Card className="p-4 sm:p-6">
          <div className="flex gap-4 sm:gap-6 items-center">
            <div className="flex items-center justify-center h-12 w-12 md:h-16 md:w-16 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shrink-0">
              <Building2 className="h-6 w-6 md:h-8 md:w-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl sm:text-3xl font-bold tracking-tight">
                  {loan.name}
                </h1>
                <Badge variant={getStatusVariant(loan.status)}>
                  {LOAN_STATUS_LABELS[loan.status]}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {LOAN_TYPE_LABELS[loan.type]}
                {loan.contractNumber && ` | Contrato: ${loan.contractNumber}`}
                {loan.bankAccountName && ` | ${loan.bankAccountName}`}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">
                {loan.paidInstallments} de {loan.totalInstallments} parcelas
                pagas
              </span>
              <span className="font-medium">{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Valor Principal
              </span>
            </div>
            <p className="text-xl font-bold font-mono">
              {formatCurrency(loan.principalAmount)}
            </p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Banknote className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-muted-foreground">
                Saldo Devedor
              </span>
            </div>
            <p className="text-xl font-bold font-mono text-orange-600 dark:text-orange-400">
              {formatCurrency(loan.outstandingBalance)}
            </p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Percent className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Taxa de Juros
              </span>
            </div>
            <p className="text-xl font-bold font-mono">
              {loan.interestRate}% a.a.
            </p>
            <p className="text-xs text-muted-foreground">
              {(loan.interestRate / 12).toFixed(2)}% a.m.
            </p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Início</span>
            </div>
            <p className="text-xl font-bold">{formatDate(loan.startDate)}</p>
            {loan.installmentDay && (
              <p className="text-xs text-muted-foreground">
                Dia {loan.installmentDay}
              </p>
            )}
          </Card>
        </div>

        {/* Deviation Alert (EMPR-04/06) */}
        {loan.installments && loan.installments.length > 0 && (
          <DeviationAlert
            rows={amortizationRows}
            installments={loan.installments}
          />
        )}

        {/* Renegotiation Suggestion (EMPR-07) */}
        <RenegotiationSuggestion loanRate={loan.interestRate / 12} />

        {/* Amortization Table */}
        {amortizationRows.length > 0 && (
          <AmortizationTable
            rows={amortizationRows}
            installments={loan.installments}
            title={`Tabela de Amortização (${loan.interestType === 'SAC' ? 'SAC' : 'Price'})`}
          />
        )}

        {/* Installment Actions - Register Payment */}
        {loan.installments && loan.installments.length > 0 && (
          <Card className="p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-4">Parcelas Pendentes</h2>
            <div className="space-y-2">
              {loan.installments
                .filter(inst => inst.status !== 'PAID')
                .sort((a, b) => a.installmentNumber - b.installmentNumber)
                .slice(0, 5)
                .map(inst => (
                  <div
                    key={inst.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium">
                        Parcela {inst.installmentNumber}/
                        {loan.totalInstallments}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Vencimento: {formatDate(inst.dueDate)} |{' '}
                        {formatCurrency(inst.totalAmount)}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant={
                        inst.status === 'OVERDUE' ? 'destructive' : 'default'
                      }
                      onClick={() => handlePayInstallment(inst)}
                    >
                      Registrar Pagamento
                    </Button>
                  </div>
                ))}
            </div>
          </Card>
        )}

        {/* Details Card */}
        <Card className="p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-4">Detalhes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Tipo</p>
              <p className="font-medium">{LOAN_TYPE_LABELS[loan.type]}</p>
            </div>
            {loan.contractNumber && (
              <div>
                <p className="text-sm text-muted-foreground">Contrato</p>
                <p className="font-medium font-mono">{loan.contractNumber}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">
                Sistema de Amortização
              </p>
              <p className="font-medium">
                {loan.interestType === 'SAC'
                  ? 'SAC (Amortização Constante)'
                  : 'Tabela Price (Parcela Fixa)'}
              </p>
            </div>
            {loan.costCenterName && (
              <div>
                <p className="text-sm text-muted-foreground">Centro de Custo</p>
                <p className="font-medium">{loan.costCenterName}</p>
              </div>
            )}
            {loan.bankAccountName && (
              <div>
                <p className="text-sm text-muted-foreground">Conta Bancária</p>
                <p className="font-medium">{loan.bankAccountName}</p>
              </div>
            )}
            {loan.endDate && (
              <div>
                <p className="text-sm text-muted-foreground">Data de Término</p>
                <p className="font-medium">{formatDate(loan.endDate)}</p>
              </div>
            )}
          </div>
          {loan.notes && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-1">Observações</p>
              <p className="text-sm">{loan.notes}</p>
            </div>
          )}
        </Card>
      </PageBody>

      {/* Payment Modal */}
      <PaymentModal
        installment={paymentInstallment}
        loanId={id}
        isOpen={paymentModalOpen}
        onClose={() => {
          setPaymentModalOpen(false);
          setPaymentInstallment(null);
        }}
      />

      {/* Delete Confirmation */}
      <VerifyActionPinModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onSuccess={handleDelete}
        title="Confirmar Exclusão"
        description={`Digite seu PIN de Ação para excluir o empréstimo "${loan.name}".`}
      />
    </PageLayout>
  );
}
