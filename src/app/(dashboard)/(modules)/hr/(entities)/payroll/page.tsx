'use client';

import { GridError } from '@/components/handlers/grid-error';
import { GridLoading } from '@/components/handlers/grid-loading';
import { Header } from '@/components/layout/header';
import { PageActionBar } from '@/components/layout/page-action-bar';
import {
  PageBody,
  PageHeader,
  PageLayout,
} from '@/components/layout/page-layout';
import type { HeaderButton } from '@/components/layout/types/header.types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePermissions } from '@/hooks/use-permissions';
import type { Payroll, PayrollStatus } from '@/types/hr';
import {
  Ban,
  Calculator,
  CalendarDays,
  Check,
  DollarSign,
  Eye,
  Plus,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import {
  useListPayrolls,
  useCreatePayroll,
  useCalculatePayroll,
  useApprovePayroll,
  usePayPayroll,
  useCancelPayroll,
  CreateModal,
  ViewModal,
  formatCurrency,
  formatMonthYear,
  getStatusLabel,
  getStatusColor,
  type PayrollFilters,
} from './src';
import { HR_PERMISSIONS } from '@/app/(dashboard)/(modules)/hr/_shared/constants/hr-permissions';

const MONTHS = [
  { value: '1', label: 'Janeiro' },
  { value: '2', label: 'Fevereiro' },
  { value: '3', label: 'Março' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Maio' },
  { value: '6', label: 'Junho' },
  { value: '7', label: 'Julho' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' },
];

const STATUS_OPTIONS: { value: PayrollStatus; label: string }[] = [
  { value: 'DRAFT', label: 'Rascunho' },
  { value: 'PROCESSING', label: 'Processando' },
  { value: 'CALCULATED', label: 'Calculada' },
  { value: 'APPROVED', label: 'Aprovada' },
  { value: 'PAID', label: 'Paga' },
  { value: 'CANCELLED', label: 'Cancelada' },
];

export default function PayrollPage() {
  const { hasPermission, isLoading: isLoadingPermissions } = usePermissions();

  // Permissions
  const canView = hasPermission(HR_PERMISSIONS.PAYROLL.VIEW);
  const canCreate = hasPermission(HR_PERMISSIONS.PAYROLL.CREATE);
  const canProcess = hasPermission(HR_PERMISSIONS.PAYROLL.PROCESS);
  const canApprove = hasPermission(HR_PERMISSIONS.PAYROLL.APPROVE);

  // ============================================================================
  // FILTERS
  // ============================================================================

  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const queryParams = useMemo<PayrollFilters>(() => {
    const params: PayrollFilters = {};
    if (filterMonth) params.referenceMonth = parseInt(filterMonth, 10);
    if (filterYear) {
      const y = parseInt(filterYear, 10);
      if (!isNaN(y)) params.referenceYear = y;
    }
    if (filterStatus) params.status = filterStatus;
    return params;
  }, [filterMonth, filterYear, filterStatus]);

  // ============================================================================
  // DATA
  // ============================================================================

  const { data, isLoading, error, refetch } = useListPayrolls(queryParams);
  const createMutation = useCreatePayroll();
  const calculateMutation = useCalculatePayroll();
  const approveMutation = useApprovePayroll();
  const payMutation = usePayPayroll();
  const cancelMutation = useCancelPayroll();

  const payrolls = data?.payrolls ?? [];

  // ============================================================================
  // STATE
  // ============================================================================

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewTarget, setViewTarget] = useState<Payroll | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleCreate = useCallback(
    async (data: Parameters<typeof createMutation.mutateAsync>[0]) => {
      try {
        await createMutation.mutateAsync(data);
        setIsCreateOpen(false);
      } catch {
        // Toast handled by mutation
      }
    },
    [createMutation]
  );

  const handleCalculate = useCallback(
    async (id: string) => {
      try {
        await calculateMutation.mutateAsync(id);
      } catch {
        // Toast handled by mutation
      }
    },
    [calculateMutation]
  );

  const handleApprove = useCallback(
    async (id: string) => {
      try {
        await approveMutation.mutateAsync(id);
      } catch {
        // Toast handled by mutation
      }
    },
    [approveMutation]
  );

  const handlePay = useCallback(
    async (id: string) => {
      try {
        await payMutation.mutateAsync(id);
      } catch {
        // Toast handled by mutation
      }
    },
    [payMutation]
  );

  const handleCancel = useCallback(
    async (id: string) => {
      try {
        await cancelMutation.mutateAsync(id);
      } catch {
        // Toast handled by mutation
      }
    },
    [cancelMutation]
  );

  const handleView = useCallback(
    (payroll: Payroll) => {
      if (canView) {
        setViewTarget(payroll);
        setIsViewOpen(true);
      }
    },
    [canView]
  );

  // ============================================================================
  // HEADER BUTTONS
  // ============================================================================

  const handleOpenCreate = useCallback(() => {
    setIsCreateOpen(true);
  }, []);

  const actionButtons: HeaderButton[] = useMemo(
    () =>
      canCreate
        ? [
            {
              id: 'create-payroll',
              title: 'Nova Folha',
              icon: Plus,
              onClick: handleOpenCreate,
              variant: 'default',
            },
          ]
        : [],
    [canCreate, handleOpenCreate]
  );

  // ============================================================================
  // FILTERS UI
  // ============================================================================

  const hasActiveFilters = filterMonth || filterYear || filterStatus;

  const clearFilters = useCallback(() => {
    setFilterMonth('');
    setFilterYear('');
    setFilterStatus('');
  }, []);

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoadingPermissions) {
    return (
      <PageLayout>
        <GridLoading count={9} layout="grid" size="md" gap="gap-4" />
      </PageLayout>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <PageLayout>
      <PageHeader>
        <PageActionBar
          breadcrumbItems={[
            { label: 'RH', href: '/hr' },
            { label: 'Folha de Pagamento', href: '/hr/payroll' },
          ]}
          buttons={actionButtons}
        />

        <Header
          title="Folha de Pagamento"
          description="Geração, cálculo e pagamento de folhas"
        />
      </PageHeader>

      <PageBody>
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <Select value={filterMonth} onValueChange={setFilterMonth}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map(m => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="number"
            placeholder="Ano"
            value={filterYear}
            onChange={e => setFilterYear(e.target.value)}
            className="w-[100px]"
            min={2000}
            max={2100}
          />

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map(s => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Badge
              variant="secondary"
              className="cursor-pointer hover:bg-destructive/10"
              onClick={clearFilters}
            >
              Limpar filtros
            </Badge>
          )}
        </div>

        {/* Grid */}
        {isLoading ? (
          <GridLoading count={9} layout="grid" size="md" gap="gap-4" />
        ) : error ? (
          <GridError
            type="server"
            title="Erro ao carregar folhas de pagamento"
            message="Ocorreu um erro ao tentar carregar as folhas. Por favor, tente novamente."
            action={{
              label: 'Tentar Novamente',
              onClick: () => {
                refetch();
              },
            }}
          />
        ) : payrolls.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <CalendarDays className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground">
              Nenhuma folha de pagamento encontrada
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Crie uma nova folha para começar.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {payrolls.map(payroll => (
              <Card
                key={payroll.id}
                className="relative flex flex-col gap-3 p-4 transition-shadow hover:shadow-md"
              >
                {/* Header: icon + title */}
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center text-white shrink-0 bg-linear-to-br from-sky-500 to-sky-600 p-2 rounded-lg">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">
                      {formatMonthYear(
                        payroll.referenceMonth,
                        payroll.referenceYear
                      )}
                    </h3>
                    <Badge
                      variant={getStatusColor(payroll.status)}
                      className="mt-1"
                    >
                      {getStatusLabel(payroll.status)}
                    </Badge>
                  </div>
                  {canView && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => handleView(payroll)}
                      title="Visualizar"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Values */}
                <div className="flex flex-col gap-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Bruto</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(payroll.totalGross)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Deduções</span>
                    <span className="font-medium text-red-600">
                      {formatCurrency(payroll.totalDeductions)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Líquido</span>
                    <span className="font-bold text-blue-600">
                      {formatCurrency(payroll.totalNet)}
                    </span>
                  </div>
                </div>

                {/* Workflow action buttons */}
                {payroll.status !== 'PAID' &&
                  payroll.status !== 'CANCELLED' && (
                    <div className="flex items-center gap-2 pt-1 border-t">
                      {payroll.status === 'DRAFT' && canProcess && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                          onClick={() => handleCalculate(payroll.id)}
                          disabled={calculateMutation.isPending}
                        >
                          <Calculator className="h-3.5 w-3.5" />
                          Calcular
                        </Button>
                      )}

                      {payroll.status === 'CALCULATED' && canApprove && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-1 text-green-600 border-green-200 hover:bg-green-50"
                          onClick={() => handleApprove(payroll.id)}
                          disabled={approveMutation.isPending}
                        >
                          <Check className="h-3.5 w-3.5" />
                          Aprovar
                        </Button>
                      )}

                      {payroll.status === 'APPROVED' && canProcess && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                          onClick={() => handlePay(payroll.id)}
                          disabled={payMutation.isPending}
                        >
                          <DollarSign className="h-3.5 w-3.5" />
                          Pagar
                        </Button>
                      )}

                      {(payroll.status === 'DRAFT' ||
                        payroll.status === 'CALCULATED' ||
                        payroll.status === 'APPROVED') &&
                        canProcess && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 text-slate-500 hover:text-destructive"
                            onClick={() => handleCancel(payroll.id)}
                            disabled={cancelMutation.isPending}
                          >
                            <Ban className="h-3.5 w-3.5" />
                            Cancelar
                          </Button>
                        )}
                    </div>
                  )}
              </Card>
            ))}
          </div>
        )}

        {/* Create Modal */}
        <CreateModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={handleCreate}
          isSubmitting={createMutation.isPending}
        />

        {/* View Modal */}
        <ViewModal
          isOpen={isViewOpen}
          onClose={() => {
            setIsViewOpen(false);
            setViewTarget(null);
          }}
          payroll={viewTarget}
        />
      </PageBody>
    </PageLayout>
  );
}
