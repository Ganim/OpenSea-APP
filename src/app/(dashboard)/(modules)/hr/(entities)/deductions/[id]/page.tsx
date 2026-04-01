'use client';

import { GridLoading } from '@/components/handlers/grid-loading';
import { PageActionBar } from '@/components/layout/page-action-bar';
import {
  PageBody,
  PageHeader,
  PageLayout,
} from '@/components/layout/page-layout';
import { InfoField } from '@/components/shared/info-field';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useEmployeeMap } from '@/hooks/use-employee-map';
import { usePermissions } from '@/hooks/use-permissions';
import { deductionsService } from '@/services/hr/deductions.service';
import type { Deduction } from '@/types/hr';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  Clock,
  Edit,
  MinusCircle,
  NotebookText,
  RefreshCw,
  CheckCircle,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import {
  deductionKeys,
  formatCurrency,
  formatDate,
  getAppliedLabel,
  getAppliedColor,
  formatInstallments,
} from '../src';
import { HR_PERMISSIONS } from '../../../_shared/constants/hr-permissions';

export default function DeductionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const deductionId = params.id as string;
  const { hasPermission } = usePermissions();

  const canEdit = hasPermission(HR_PERMISSIONS.DEDUCTIONS.UPDATE);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const { data: deduction, isLoading } = useQuery<Deduction>({
    queryKey: deductionKeys.detail(deductionId),
    queryFn: async () => {
      const response = await deductionsService.get(deductionId);
      return response.deduction;
    },
  });

  const { getName } = useEmployeeMap(deduction ? [deduction.employeeId] : []);

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoading) {
    return (
      <PageLayout>
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'RH', href: '/hr' },
              { label: 'Deduções', href: '/hr/deductions' },
            ]}
          />
        </PageHeader>
        <PageBody>
          <GridLoading count={3} layout="list" size="md" />
        </PageBody>
      </PageLayout>
    );
  }

  // ============================================================================
  // NOT FOUND STATE
  // ============================================================================

  if (!deduction) {
    return (
      <PageLayout>
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'RH', href: '/hr' },
              { label: 'Deduções', href: '/hr/deductions' },
            ]}
          />
        </PageHeader>
        <PageBody>
          <Card className="bg-white/5 p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl mx-auto mb-4 bg-linear-to-br from-rose-500 to-rose-600">
              <MinusCircle className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">
              Dedução não encontrada
            </h2>
            <p className="text-muted-foreground mb-4">
              A dedução solicitada não existe ou foi removida.
            </p>
            <button
              onClick={() => router.push('/hr/deductions')}
              className="text-primary hover:underline font-medium"
            >
              Voltar para Deduções
            </button>
          </Card>
        </PageBody>
      </PageLayout>
    );
  }

  // ============================================================================
  // COMPUTED
  // ============================================================================

  const installmentsText = formatInstallments(deduction);
  const progressPercent =
    deduction.isRecurring &&
    deduction.installments &&
    deduction.currentInstallment
      ? Math.round(
          (deduction.currentInstallment / deduction.installments) * 100
        )
      : 0;

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <PageLayout>
      <PageHeader>
        <PageActionBar
          breadcrumbItems={[
            { label: 'RH', href: '/hr' },
            { label: 'Deduções', href: '/hr/deductions' },
            { label: deduction.name },
          ]}
          buttons={
            canEdit
              ? [
                  {
                    id: 'edit',
                    title: 'Editar',
                    icon: Edit,
                    onClick: () =>
                      router.push(`/hr/deductions/${deductionId}/edit`),
                  },
                ]
              : []
          }
        />

        {/* Identity Card */}
        <Card className="bg-white/5 p-5">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl shrink-0 bg-linear-to-br from-rose-500 to-rose-600">
              <MinusCircle className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight">
                  {deduction.name}
                </h1>
                <Badge variant={getAppliedColor(deduction)}>
                  {getAppliedLabel(deduction)}
                </Badge>
                {deduction.isRecurring && (
                  <Badge variant="outline" className="gap-1">
                    <RefreshCw className="h-3 w-3" />
                    Recorrente
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {getName(deduction.employeeId)} ·{' '}
                {formatCurrency(deduction.amount)}
              </p>
            </div>
            <div className="flex flex-col gap-2 shrink-0 text-sm">
              {deduction.createdAt && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4 text-rose-500" />
                  <span>{formatDate(deduction.createdAt)}</span>
                </div>
              )}
              {deduction.updatedAt && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span>{formatDate(deduction.updatedAt)}</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </PageHeader>

      <PageBody className="space-y-6">
        {/* Dados da Dedução */}
        <Card className="bg-white dark:bg-white/5 border border-border overflow-hidden py-0">
          <div className="px-4 pt-4 pb-2 border-b border-border flex items-center gap-3">
            <NotebookText className="h-5 w-5 text-muted-foreground" />
            <div>
              <h3 className="text-base font-semibold">Dados da Dedução</h3>
              <p className="text-sm text-muted-foreground">
                Informações principais do desconto
              </p>
            </div>
          </div>
          <div className="p-4 space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <InfoField
                label="Nome"
                value={deduction.name}
                showCopyButton
                copyTooltip="Copiar nome"
              />
              <InfoField
                label="Valor"
                value={formatCurrency(deduction.amount)}
                badge={
                  <Badge variant="destructive" className="gap-1">
                    {formatCurrency(deduction.amount)}
                  </Badge>
                }
              />
              <InfoField label="Data" value={formatDate(deduction.date)} />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <InfoField
                label="Funcionário"
                value={getName(deduction.employeeId)}
                showCopyButton
                copyTooltip="Copiar nome do funcionário"
              />
              <InfoField
                label="Motivo"
                value={deduction.reason}
                showCopyButton
                copyTooltip="Copiar motivo"
              />
            </div>
          </div>
        </Card>

        {/* Recorrência (only if recurring) */}
        {deduction.isRecurring && (
          <Card className="bg-white dark:bg-white/5 border border-border overflow-hidden py-0">
            <div className="px-4 pt-4 pb-2 border-b border-border flex items-center gap-3">
              <RefreshCw className="h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="text-base font-semibold">Recorrência</h3>
                <p className="text-sm text-muted-foreground">
                  Informações de parcelamento
                </p>
              </div>
            </div>
            <div className="p-4">
              <div className="grid md:grid-cols-3 gap-6">
                <InfoField
                  label="Total de Parcelas"
                  value={
                    deduction.installments
                      ? String(deduction.installments)
                      : '-'
                  }
                />
                <InfoField
                  label="Parcela Atual"
                  value={
                    deduction.currentInstallment
                      ? String(deduction.currentInstallment)
                      : '-'
                  }
                />
                <InfoField label="Progresso" value={installmentsText ?? '-'} />
              </div>
              {deduction.installments && deduction.currentInstallment && (
                <div className="mt-6">
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                    <span>Progresso das parcelas</span>
                    <span>{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div
                      className="bg-linear-to-r from-rose-500 to-rose-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Aplicação (only if applied) */}
        {deduction.isApplied && deduction.appliedAt && (
          <Card className="bg-white dark:bg-white/5 border border-border overflow-hidden py-0">
            <div className="px-4 pt-4 pb-2 border-b border-border flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="text-base font-semibold">Aplicação</h3>
                <p className="text-sm text-muted-foreground">
                  Informações de aplicação do desconto
                </p>
              </div>
            </div>
            <div className="p-4 grid md:grid-cols-2 gap-6">
              <InfoField
                label="Data de Aplicação"
                value={formatDate(deduction.appliedAt)}
              />
            </div>
          </Card>
        )}

        {/* Metadados */}
        <Card className="bg-white dark:bg-white/5 border border-border overflow-hidden py-0">
          <div className="px-4 pt-4 pb-2 border-b border-border flex items-center gap-3">
            <Clock className="h-5 w-5 text-muted-foreground" />
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
              value={formatDate(deduction.createdAt)}
            />
            <InfoField
              label="Atualizado em"
              value={formatDate(deduction.updatedAt)}
            />
          </div>
        </Card>
      </PageBody>
    </PageLayout>
  );
}
