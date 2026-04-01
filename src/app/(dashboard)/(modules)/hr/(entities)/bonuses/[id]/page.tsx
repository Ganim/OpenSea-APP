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
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useEmployeeMap } from '@/hooks/use-employee-map';
import { usePermissions } from '@/hooks/use-permissions';
import type { Bonus } from '@/types/hr';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  Clock,
  Edit,
  FileText,
  NotebookText,
  PlusCircle,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import {
  bonusesApi,
  bonusKeys,
  formatCurrency,
  formatDate,
  getPaidLabel,
  getPaidColor,
} from '../src';
import { HR_PERMISSIONS } from '../../../_shared/constants/hr-permissions';

export default function BonusDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bonusId = params.id as string;
  const { hasPermission } = usePermissions();

  const canEdit = hasPermission(HR_PERMISSIONS.BONUSES.UPDATE);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const { data: bonus, isLoading } = useQuery<Bonus>({
    queryKey: bonusKeys.detail(bonusId),
    queryFn: () => bonusesApi.get(bonusId),
  });

  const { getName } = useEmployeeMap(bonus ? [bonus.employeeId] : []);

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
              { label: 'Bonificações', href: '/hr/bonuses' },
            ]}
          />
        </PageHeader>
        <PageBody>
          <GridLoading count={3} layout="list" size="md" />
        </PageBody>
      </PageLayout>
    );
  }

  if (!bonus) {
    return (
      <PageLayout>
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'RH', href: '/hr' },
              { label: 'Bonificações', href: '/hr/bonuses' },
            ]}
          />
        </PageHeader>
        <PageBody>
          <Card className="bg-white/5 p-12 text-center">
            <PlusCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">
              Bonificação não encontrada
            </h2>
            <Button onClick={() => router.push('/hr/bonuses')}>
              Voltar para Bonificações
            </Button>
          </Card>
        </PageBody>
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
            { label: 'Bonificações', href: '/hr/bonuses' },
            { label: bonus.name },
          ]}
          buttons={
            canEdit
              ? [
                  {
                    id: 'edit',
                    title: 'Editar',
                    icon: Edit,
                    onClick: () => router.push(`/hr/bonuses/${bonusId}/edit`),
                  },
                ]
              : []
          }
        />

        {/* Identity Card */}
        <Card className="bg-white/5 p-5">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl shrink-0 bg-linear-to-br from-lime-500 to-lime-600">
              <PlusCircle className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">
                  {bonus.name}
                </h1>
                <Badge variant={getPaidColor(bonus)}>
                  {getPaidLabel(bonus)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {getName(bonus.employeeId)} · {formatCurrency(bonus.amount)}
              </p>
            </div>
            <div className="flex flex-col gap-2 shrink-0 text-sm">
              {bonus.createdAt && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4 text-lime-500" />
                  <span>{formatDate(bonus.createdAt)}</span>
                </div>
              )}
              {bonus.updatedAt && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span>{formatDate(bonus.updatedAt)}</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </PageHeader>

      <PageBody className="space-y-6">
        {/* Dados da Bonificação */}
        <Card className="bg-white dark:bg-white/5 border border-border overflow-hidden py-0">
          <div className="px-4 pt-4 pb-2 border-b border-border flex items-center gap-3">
            <NotebookText className="h-5 w-5 text-muted-foreground" />
            <div>
              <h3 className="text-base font-semibold">Dados da Bonificação</h3>
              <p className="text-sm text-muted-foreground">
                Informações principais da bonificação
              </p>
            </div>
          </div>
          <div className="p-4 grid md:grid-cols-2 gap-6">
            <InfoField
              label="Nome"
              value={bonus.name}
              showCopyButton
              copyTooltip="Copiar nome"
            />
            <InfoField
              label="Valor"
              value={formatCurrency(bonus.amount)}
              className="text-green-600 dark:text-green-400"
              showCopyButton
              copyTooltip="Copiar valor"
            />
            <InfoField label="Data" value={formatDate(bonus.date)} />
            <InfoField
              label="Funcionário"
              value={getName(bonus.employeeId)}
              showCopyButton
              copyTooltip="Copiar nome do funcionário"
            />
          </div>
        </Card>

        {/* Motivo */}
        <Card className="bg-white dark:bg-white/5 border border-border overflow-hidden py-0">
          <div className="px-4 pt-4 pb-2 border-b border-border flex items-center gap-3">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <div>
              <h3 className="text-base font-semibold">Motivo</h3>
              <p className="text-sm text-muted-foreground">
                Justificativa da bonificação
              </p>
            </div>
          </div>
          <div className="p-4">
            <p className="text-sm text-foreground whitespace-pre-wrap">
              {bonus.reason}
            </p>
          </div>
        </Card>

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
            <InfoField label="Criado em" value={formatDate(bonus.createdAt)} />
            <InfoField
              label="Atualizado em"
              value={formatDate(bonus.updatedAt)}
            />
          </div>
        </Card>
      </PageBody>
    </PageLayout>
  );
}
