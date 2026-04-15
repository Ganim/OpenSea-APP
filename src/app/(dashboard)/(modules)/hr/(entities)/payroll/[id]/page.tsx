'use client';

import { VerifyActionPinModal } from '@/components/modals/verify-action-pin-modal';
import { GridLoading } from '@/components/handlers/grid-loading';
import { PageActionBar } from '@/components/layout/page-action-bar';
import {
  PageBody,
  PageHeader,
  PageLayout,
} from '@/components/layout/page-layout';
import { InfoField } from '@/components/shared/info-field';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useEmployeeMap } from '@/hooks/use-employee-map';
import { usePermissions } from '@/hooks/use-permissions';
import { payrollService } from '@/services/hr/payroll.service';
import type { Payroll } from '@/types/hr';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Ban,
  Calculator,
  CalendarDays,
  Check,
  Clock,
  DollarSign,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  formatCurrency,
  formatDate,
  formatMonthYear,
  getStatusColor,
  getStatusLabel,
  payrollKeys,
  useApprovePayroll,
  useCalculatePayroll,
  useCancelPayroll,
  usePayPayroll,
} from '../src';
import { HR_PERMISSIONS } from '../../../_shared/constants/hr-permissions';

export default function PayrollDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const payrollId = params.id as string;
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  const { hasPermission } = usePermissions();
  const canProcess = hasPermission(HR_PERMISSIONS.PAYROLL.PROCESS);
  const canApprove = hasPermission(HR_PERMISSIONS.PAYROLL.APPROVE);
  const canManage = hasPermission(HR_PERMISSIONS.PAYROLL.MANAGE);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const { data: payroll, isLoading } = useQuery<Payroll>({
    queryKey: payrollKeys.detail(payrollId),
    queryFn: async () => {
      const response = await payrollService.get(payrollId);
      return response.payroll;
    },
  });

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  const invalidateDetail = () => {
    queryClient.invalidateQueries({ queryKey: payrollKeys.detail(payrollId) });
  };

  const calculateMutation = useCalculatePayroll({
    onSuccess: invalidateDetail,
  });

  const approveMutation = useApprovePayroll({
    onSuccess: invalidateDetail,
  });

  const payMutation = usePayPayroll({
    onSuccess: invalidateDetail,
  });

  const cancelMutation = useCancelPayroll({
    onSuccess: invalidateDetail,
  });

  const isMutating =
    calculateMutation.isPending ||
    approveMutation.isPending ||
    payMutation.isPending ||
    cancelMutation.isPending;

  const { getName } = useEmployeeMap(
    payroll
      ? [
          ...(payroll.processedBy ? [payroll.processedBy] : []),
          ...(payroll.approvedBy ? [payroll.approvedBy] : []),
          ...(payroll.paidBy ? [payroll.paidBy] : []),
        ]
      : []
  );

  // ============================================================================
  // WORKFLOW BUTTONS
  // ============================================================================

  function getWorkflowButtons() {
    if (!payroll) return [];

    const buttons: Array<{
      id: string;
      title: string;
      icon: typeof Calculator;
      onClick: () => void;
      variant?: 'default' | 'outline';
      disabled?: boolean;
    }> = [];

    const status = payroll.status;

    if (status === 'DRAFT' && canProcess) {
      buttons.push({
        id: 'calculate',
        title: 'Calcular',
        icon: Calculator,
        onClick: () => calculateMutation.mutate(payrollId),
        variant: 'default',
        disabled: isMutating,
      });
    }

    if (status === 'CALCULATED' && canApprove) {
      buttons.push({
        id: 'approve',
        title: 'Aprovar',
        icon: Check,
        onClick: () => approveMutation.mutate(payrollId),
        variant: 'default',
        disabled: isMutating,
      });
    }

    if (status === 'APPROVED' && canManage) {
      buttons.push({
        id: 'pay',
        title: 'Pagar',
        icon: DollarSign,
        onClick: () => payMutation.mutate(payrollId),
        variant: 'default',
        disabled: isMutating,
      });
    }

    if (
      (status === 'DRAFT' ||
        status === 'CALCULATED' ||
        status === 'APPROVED') &&
      canManage
    ) {
      buttons.push({
        id: 'cancel',
        title: 'Cancelar',
        icon: Ban,
        onClick: () => setIsCancelDialogOpen(true),
        variant: 'outline',
        disabled: isMutating,
      });
    }

    return buttons;
  }

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoading) {
    return (
      <PageLayout data-testid="payroll-detail-page">
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'RH', href: '/hr' },
              { label: 'Folha de Pagamento', href: '/hr/payroll' },
            ]}
          />
        </PageHeader>
        <PageBody>
          <GridLoading count={3} layout="list" size="md" />
        </PageBody>
      </PageLayout>
    );
  }

  if (!payroll) {
    return (
      <PageLayout data-testid="payroll-detail-page">
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'RH', href: '/hr' },
              { label: 'Folha de Pagamento', href: '/hr/payroll' },
            ]}
          />
        </PageHeader>
        <PageBody>
          <Card className="bg-white/5 p-12 text-center">
            <CalendarDays className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">
              Folha de pagamento não encontrada
            </h2>
            <Button onClick={() => router.push('/hr/payroll')}>
              Voltar para Folha de Pagamento
            </Button>
          </Card>
        </PageBody>
      </PageLayout>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  const hasProcessingInfo =
    payroll.processedBy ||
    payroll.processedAt ||
    payroll.approvedBy ||
    payroll.approvedAt ||
    payroll.paidBy ||
    payroll.paidAt;

  return (
    <PageLayout data-testid="payroll-detail-page">
      <PageHeader>
        <PageActionBar
          breadcrumbItems={[
            { label: 'RH', href: '/hr' },
            { label: 'Folha de Pagamento', href: '/hr/payroll' },
            {
              label: formatMonthYear(
                payroll.referenceMonth,
                payroll.referenceYear
              ),
            },
          ]}
          buttons={getWorkflowButtons()}
        />

        {/* Identity Card */}
        <Card className="bg-white/5 p-5">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl shrink-0 bg-linear-to-br from-sky-500 to-sky-600">
              <CalendarDays className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">
                  {formatMonthYear(
                    payroll.referenceMonth,
                    payroll.referenceYear
                  )}
                </h1>
                <Badge variant={getStatusColor(payroll.status)}>
                  {getStatusLabel(payroll.status)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Folha de pagamento referente a{' '}
                {formatMonthYear(payroll.referenceMonth, payroll.referenceYear)}
              </p>
            </div>
            <div className="flex flex-col gap-2 shrink-0 text-sm">
              {payroll.createdAt && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarDays className="h-4 w-4 text-sky-500" />
                  <span>Criado em {formatDate(payroll.createdAt)}</span>
                </div>
              )}
              {payroll.updatedAt && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span>Atualizado em {formatDate(payroll.updatedAt)}</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </PageHeader>

      <PageBody className="space-y-6">
        {/* Valores */}
        <Card className="bg-white dark:bg-white/5 border border-border overflow-hidden py-0">
          <div className="px-4 pt-4 pb-2 border-b border-border flex items-center gap-3">
            <DollarSign className="h-5 w-5 text-muted-foreground" />
            <div>
              <h3 className="text-base font-semibold">Valores</h3>
              <p className="text-sm text-muted-foreground">
                Resumo financeiro da folha
              </p>
            </div>
          </div>
          <div className="p-4 grid md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Bruto</p>
              <p className="text-2xl font-semibold text-green-600 dark:text-green-400">
                {formatCurrency(payroll.totalGross)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Deduções</p>
              <p className="text-2xl font-semibold text-destructive">
                {formatCurrency(payroll.totalDeductions)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Líquido</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(payroll.totalNet)}
              </p>
            </div>
          </div>
        </Card>

        {/* Processamento */}
        {hasProcessingInfo && (
          <Card className="bg-white dark:bg-white/5 border border-border overflow-hidden py-0">
            <div className="px-4 pt-4 pb-2 border-b border-border flex items-center gap-3">
              <Calculator className="h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="text-base font-semibold">Processamento</h3>
                <p className="text-sm text-muted-foreground">
                  Histórico de processamento da folha
                </p>
              </div>
            </div>
            <div className="p-4 grid md:grid-cols-2 gap-6">
              {payroll.processedBy && (
                <InfoField
                  label="Processado por"
                  value={getName(payroll.processedBy)}
                />
              )}
              {payroll.processedAt && (
                <InfoField
                  label="Processado em"
                  value={formatDate(payroll.processedAt)}
                />
              )}
              {payroll.approvedBy && (
                <InfoField
                  label="Aprovado por"
                  value={getName(payroll.approvedBy)}
                />
              )}
              {payroll.approvedAt && (
                <InfoField
                  label="Aprovado em"
                  value={formatDate(payroll.approvedAt)}
                />
              )}
              {payroll.paidBy && (
                <InfoField label="Pago por" value={getName(payroll.paidBy)} />
              )}
              {payroll.paidAt && (
                <InfoField label="Pago em" value={formatDate(payroll.paidAt)} />
              )}
            </div>
          </Card>
        )}

        {/* Metadados */}
        <Card className="bg-white dark:bg-white/5 border border-border overflow-hidden py-0">
          <div className="px-4 pt-4 pb-2 border-b border-border flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-muted-foreground" />
            <div>
              <h3 className="text-base font-semibold">Metadados</h3>
              <p className="text-sm text-muted-foreground">
                Datas de criação e atualização
              </p>
            </div>
          </div>
          <div className="p-4 grid md:grid-cols-2 gap-6">
            <InfoField
              label="Criado em"
              value={formatDate(payroll.createdAt)}
            />
            <InfoField
              label="Atualizado em"
              value={formatDate(payroll.updatedAt)}
            />
          </div>
        </Card>
      </PageBody>

      <VerifyActionPinModal
        isOpen={isCancelDialogOpen}
        onClose={() => setIsCancelDialogOpen(false)}
        onSuccess={() => cancelMutation.mutate(payrollId)}
        title="Cancelar Folha de Pagamento"
        description="Digite seu PIN de ação para cancelar esta folha de pagamento. Esta ação não pode ser desfeita."
      />
    </PageLayout>
  );
}
