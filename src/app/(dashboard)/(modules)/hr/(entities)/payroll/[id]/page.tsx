'use client';

/**
 * Payroll Detail Page — Gusto-style payslip visualization
 *
 * Layout:
 *  - PageActionBar (breadcrumbs + workflow buttons + Pré-visualizar Holerite)
 *  - Identity Card (mês/ano + status + datas)
 *  - Visual Payslip Card (max-w-3xl, centered): empresa, identity row,
 *    tabela vencimentos (emerald), descontos (rose), líquido (indigo)
 *  - Processamento e metadados
 *  - PayrollPDFPreviewModal (preview PDF do holerite individual)
 */

import { GridLoading } from '@/components/handlers/grid-loading';
import { PageActionBar } from '@/components/layout/page-action-bar';
import {
  PageBody,
  PageHeader,
  PageLayout,
} from '@/components/layout/page-layout';
import { VerifyActionPinModal } from '@/components/modals/verify-action-pin-modal';
import { InfoField } from '@/components/shared/info-field';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEmployeeMap } from '@/hooks/use-employee-map';
import { usePermissions } from '@/hooks/use-permissions';
import { employeesService } from '@/services/hr/employees.service';
import { payrollService } from '@/services/hr/payroll.service';
import type { Employee, Payroll } from '@/types/hr';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Ban,
  Building2,
  Calculator,
  CalendarDays,
  Check,
  Clock,
  DollarSign,
  Eye,
  FileText,
  Receipt,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
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

const PayrollPDFPreviewModal = dynamic(
  () =>
    import('@/components/hr/payroll-pdf-preview-modal').then(
      m => m.PayrollPDFPreviewModal
    ),
  { ssr: false }
);

interface PreviewTarget {
  employeeId: string;
  employeeName: string;
}

export default function PayrollDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const payrollId = params.id as string;
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [previewTarget, setPreviewTarget] = useState<PreviewTarget | null>(
    null
  );

  const { hasPermission } = usePermissions();
  const canProcess = hasPermission(HR_PERMISSIONS.PAYROLL.PROCESS);
  const canApprove = hasPermission(HR_PERMISSIONS.PAYROLL.APPROVE);
  const canManage = hasPermission(HR_PERMISSIONS.PAYROLL.MANAGE);
  const canPrintPayslips = hasPermission(HR_PERMISSIONS.PAYROLL.PRINT_PAYSLIPS);

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

  const { data: employeesList = [] } = useQuery<Employee[]>({
    queryKey: ['employees', 'for-payroll-preview'],
    queryFn: async () => {
      const response = await employeesService.listEmployees({
        perPage: 200,
      });
      return response.employees;
    },
    enabled: !!payroll && canPrintPayslips,
    staleTime: 5 * 60 * 1000,
  });

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  const invalidateDetail = () => {
    queryClient.invalidateQueries({ queryKey: payrollKeys.detail(payrollId) });
  };

  const calculateMutation = useCalculatePayroll({ onSuccess: invalidateDetail });
  const approveMutation = useApprovePayroll({ onSuccess: invalidateDetail });
  const payMutation = usePayPayroll({ onSuccess: invalidateDetail });
  const cancelMutation = useCancelPayroll({ onSuccess: invalidateDetail });

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

    if (canPrintPayslips && status !== 'DRAFT') {
      buttons.push({
        id: 'preview-payslip',
        title: 'Pré-visualizar Holerite',
        icon: Eye,
        onClick: () => {
          if (selectedEmployeeId) {
            const employee = employeesList.find(
              emp => emp.id === selectedEmployeeId
            );
            if (employee) {
              setPreviewTarget({
                employeeId: selectedEmployeeId,
                employeeName: employee.fullName,
              });
            }
          }
        },
        variant: 'outline',
        disabled: !selectedEmployeeId,
      });
    }

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

  const periodLabel = useMemo(
    () =>
      payroll
        ? formatMonthYear(payroll.referenceMonth, payroll.referenceYear)
        : '',
    [payroll]
  );

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

  const isPayslipReady =
    payroll.status === 'CALCULATED' ||
    payroll.status === 'APPROVED' ||
    payroll.status === 'PAID';

  return (
    <PageLayout data-testid="payroll-detail-page">
      <PageHeader>
        <PageActionBar
          breadcrumbItems={[
            { label: 'RH', href: '/hr' },
            { label: 'Folha de Pagamento', href: '/hr/payroll' },
            { label: periodLabel },
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
                  {periodLabel}
                </h1>
                <Badge variant={getStatusColor(payroll.status)}>
                  {getStatusLabel(payroll.status)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Folha de pagamento referente a {periodLabel}
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
        {/* ===== Visual Payslip Summary Card (Gusto-style) ===== */}
        <Card
          data-testid="payroll-card"
          className="bg-white dark:bg-slate-900/60 border border-border overflow-hidden py-0 max-w-3xl mx-auto w-full"
        >
          {/* Header faixa empresa */}
          <div className="bg-linear-to-r from-indigo-600 to-violet-600 px-6 py-5 text-white">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 shrink-0">
                  <Receipt className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider opacity-80">
                    Resumo da Folha
                  </p>
                  <h2 className="text-lg font-semibold">{periodLabel}</h2>
                </div>
              </div>
              <Badge
                variant="secondary"
                className="bg-white/20 text-white border-white/30 hover:bg-white/30"
              >
                {getStatusLabel(payroll.status)}
              </Badge>
            </div>
          </div>

          {/* Vencimentos / Descontos */}
          <div className="p-6 grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/8 border border-emerald-200/60 dark:border-emerald-500/20 p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
                <span className="text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-300 font-semibold">
                  Total de Vencimentos
                </span>
              </div>
              <p
                data-testid="payroll-total-gross"
                className="text-2xl font-bold text-emerald-700 dark:text-emerald-300"
              >
                {formatCurrency(payroll.totalGross)}
              </p>
              <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80 mt-1">
                Salários, horas extras, adicionais e benefícios
              </p>
            </div>

            <div className="rounded-xl bg-rose-50 dark:bg-rose-500/8 border border-rose-200/60 dark:border-rose-500/20 p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-rose-700 dark:text-rose-300" />
                <span className="text-xs uppercase tracking-wider text-rose-700 dark:text-rose-300 font-semibold">
                  Total de Descontos
                </span>
              </div>
              <p
                data-testid="payroll-total-deductions"
                className="text-2xl font-bold text-rose-700 dark:text-rose-300"
              >
                {formatCurrency(payroll.totalDeductions)}
              </p>
              <p className="text-xs text-rose-700/80 dark:text-rose-300/80 mt-1">
                INSS, IRRF, vales e outros descontos legais
              </p>
            </div>
          </div>

          {/* Faixa Líquido — destaque indigo gradient */}
          <div className="px-6 pb-6">
            <div className="rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 px-5 py-4 text-white shadow-sm">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-xs uppercase tracking-wider opacity-80">
                    Líquido a Pagar
                  </p>
                  <p
                    data-testid="payroll-total-net"
                    className="text-3xl font-bold mt-1"
                  >
                    {formatCurrency(payroll.totalNet)}
                  </p>
                </div>
                <div className="text-right text-xs opacity-80">
                  <p>Competência</p>
                  <p className="font-semibold text-sm">{periodLabel}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* ===== Pré-visualizar Holerite Individual ===== */}
        {canPrintPayslips && (
          <Card
            data-testid="payroll-payslip-preview-card"
            className="bg-white dark:bg-white/5 border border-border overflow-hidden py-0 max-w-3xl mx-auto w-full"
          >
            <div className="px-4 pt-4 pb-2 border-b border-border flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="text-base font-semibold">
                  Pré-visualizar Holerite Individual
                </h3>
                <p className="text-sm text-muted-foreground">
                  Selecione um funcionário e gere o recibo de pagamento em PDF
                  (Art. 464 da CLT).
                </p>
              </div>
            </div>
            <div className="p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
              <div className="flex-1 min-w-0">
                <label
                  htmlFor="employee-select"
                  className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1.5 flex items-center gap-1.5"
                >
                  <Users className="h-3.5 w-3.5" />
                  Funcionário
                </label>
                <Select
                  value={selectedEmployeeId}
                  onValueChange={setSelectedEmployeeId}
                  disabled={!isPayslipReady || employeesList.length === 0}
                >
                  <SelectTrigger
                    id="employee-select"
                    data-testid="payroll-employee-select"
                  >
                    <SelectValue placeholder="Escolha um funcionário..." />
                  </SelectTrigger>
                  <SelectContent>
                    {employeesList.map(employee => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.fullName}
                        {employee.registrationNumber
                          ? ` — Mat. ${employee.registrationNumber}`
                          : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="default"
                size="sm"
                disabled={!selectedEmployeeId || !isPayslipReady}
                onClick={() => {
                  const employee = employeesList.find(
                    emp => emp.id === selectedEmployeeId
                  );
                  if (employee) {
                    setPreviewTarget({
                      employeeId: selectedEmployeeId,
                      employeeName: employee.fullName,
                    });
                  }
                }}
                data-testid="payroll-preview-payslip-button"
                className="shrink-0"
              >
                <Eye className="h-4 w-4" />
                Pré-visualizar
              </Button>
            </div>
            {!isPayslipReady && (
              <div className="px-4 pb-4 -mt-1">
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  O holerite só fica disponível após o cálculo da folha.
                </p>
              </div>
            )}
          </Card>
        )}

        {/* ===== Processamento ===== */}
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

        {/* ===== Metadados ===== */}
        <Card className="bg-white dark:bg-white/5 border border-border overflow-hidden py-0">
          <div className="px-4 pt-4 pb-2 border-b border-border flex items-center gap-3">
            <Building2 className="h-5 w-5 text-muted-foreground" />
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

      {/* PIN Modal — cancel payroll */}
      <VerifyActionPinModal
        isOpen={isCancelDialogOpen}
        onClose={() => setIsCancelDialogOpen(false)}
        onSuccess={() => cancelMutation.mutate(payrollId)}
        title="Cancelar Folha de Pagamento"
        description="Digite seu PIN de ação para cancelar esta folha de pagamento. Esta ação não pode ser desfeita."
      />

      {/* Payslip preview modal */}
      {previewTarget && (
        <PayrollPDFPreviewModal
          isOpen={!!previewTarget}
          onClose={() => setPreviewTarget(null)}
          payrollId={payrollId}
          employeeId={previewTarget.employeeId}
          employeeName={previewTarget.employeeName}
          referenceMonth={payroll.referenceMonth}
          referenceYear={payroll.referenceYear}
        />
      )}
    </PageLayout>
  );
}
