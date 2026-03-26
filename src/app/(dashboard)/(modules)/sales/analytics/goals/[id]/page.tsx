/**
 * OpenSea OS - Goal Detail Page
 * Página de detalhes da meta de vendas
 */

'use client';

import { GridError } from '@/components/handlers/grid-error';
import { GridLoading } from '@/components/handlers/grid-loading';
import { PageActionBar } from '@/components/layout/page-action-bar';
import {
  PageBody,
  PageHeader,
  PageLayout,
} from '@/components/layout/page-layout';
import type { HeaderButton } from '@/components/layout/types/header.types';
import { Card } from '@/components/ui/card';
import { useGoalProgress } from '@/hooks/sales/use-analytics';
import { usePermissions } from '@/hooks/use-permissions';
import type { GoalStatus } from '@/types/sales';
import { cn } from '@/lib/utils';
import {
  Calendar,
  Edit,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

// ============================================================================
// CONSTANTS
// ============================================================================

const GOAL_STATUS_LABELS: Record<GoalStatus, string> = {
  ACTIVE: 'Ativa',
  ACHIEVED: 'Atingida',
  MISSED: 'Perdida',
  ARCHIVED: 'Arquivada',
};

const GOAL_STATUS_COLORS: Record<GoalStatus, string> = {
  ACTIVE:
    'border-sky-600/25 dark:border-sky-500/20 bg-sky-50 dark:bg-sky-500/8 text-sky-700 dark:text-sky-300',
  ACHIEVED:
    'border-emerald-600/25 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/8 text-emerald-700 dark:text-emerald-300',
  MISSED:
    'border-rose-600/25 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/8 text-rose-700 dark:text-rose-300',
  ARCHIVED:
    'border-gray-300 dark:border-white/[0.1] bg-gray-100 dark:bg-white/[0.04] text-gray-600 dark:text-gray-400',
};

const GOAL_ICON_COLORS: Record<GoalStatus, string> = {
  ACTIVE: 'bg-linear-to-br from-sky-500 to-blue-600',
  ACHIEVED: 'bg-linear-to-br from-emerald-500 to-teal-600',
  MISSED: 'bg-linear-to-br from-rose-500 to-pink-600',
  ARCHIVED: 'bg-linear-to-br from-gray-400 to-gray-500',
};

const GOAL_TYPE_LABELS: Record<string, string> = {
  REVENUE: 'Receita',
  QUANTITY: 'Quantidade',
  DEALS_WON: 'Negócios Ganhos',
  NEW_CUSTOMERS: 'Novos Clientes',
  TICKET_AVERAGE: 'Ticket Médio',
  CONVERSION_RATE: 'Taxa de Conversão',
  COMMISSION: 'Comissão',
  BID_WIN_RATE: 'Taxa de Vitória em Licitações',
  CUSTOM: 'Personalizada',
};

const SCOPE_LABELS: Record<string, string> = {
  INDIVIDUAL: 'Individual',
  TEAM: 'Equipe',
  TENANT: 'Empresa',
};

// ============================================================================
// INFO ROW
// ============================================================================

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | undefined | null;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  );
}

// ============================================================================
// PAGE
// ============================================================================

export default function GoalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const goalId = params.id as string;

  const { data: progressData, isLoading, error } = useGoalProgress(goalId);

  const goal = progressData?.goal;

  const breadcrumbItems = [
    { label: 'Vendas', href: '/sales' },
    { label: 'Metas', href: '/sales/analytics/goals' },
    { label: goal?.name || '...' },
  ];

  const actionButtons: HeaderButton[] = [
    {
      id: 'edit',
      title: 'Editar Meta',
      icon: Edit,
      onClick: () => router.push(`/sales/analytics/goals/${goalId}/edit`),
      variant: 'default' as const,
    },
  ];

  if (isLoading) {
    return (
      <PageLayout>
        <PageHeader>
          <PageActionBar breadcrumbItems={breadcrumbItems} />
        </PageHeader>
        <PageBody>
          <GridLoading count={3} layout="list" size="md" />
        </PageBody>
      </PageLayout>
    );
  }

  if (error || !goal) {
    return (
      <PageLayout>
        <PageHeader>
          <PageActionBar breadcrumbItems={breadcrumbItems} />
        </PageHeader>
        <PageBody>
          <GridError
            type="not-found"
            title="Meta não encontrada"
            message="A meta que você está procurando não existe ou foi removida."
            action={{
              label: 'Voltar para Metas',
              onClick: () => router.push('/sales/analytics/goals'),
            }}
          />
        </PageBody>
      </PageLayout>
    );
  }

  const progressPercent = Math.min(100, goal.progressPercentage ?? 0);
  const daysRemaining = progressData?.daysRemaining ?? 0;
  const daysElapsed = progressData?.daysElapsed ?? 0;
  const totalDays = progressData?.totalDays ?? 0;
  const onTrack = progressData?.onTrack ?? false;

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

  return (
    <PageLayout>
      <PageHeader>
        <PageActionBar
          breadcrumbItems={breadcrumbItems}
          buttons={actionButtons}
        />
      </PageHeader>
      <PageBody>
        {/* Identity Card */}
        <Card className="bg-white/5 p-5">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                'flex h-14 w-14 shrink-0 items-center justify-center rounded-xl shadow-lg',
                GOAL_ICON_COLORS[goal.status]
              )}
            >
              <Target className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">
                {GOAL_TYPE_LABELS[goal.type] ?? goal.type}
              </p>
              <h1 className="text-xl font-bold truncate">{goal.name}</h1>
              <p className="text-sm text-muted-foreground">
                {SCOPE_LABELS[goal.scope] ?? goal.scope}
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-3 shrink-0">
              <div
                className={cn(
                  'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border',
                  GOAL_STATUS_COLORS[goal.status]
                )}
              >
                {GOAL_STATUS_LABELS[goal.status]}
              </div>
            </div>
          </div>
        </Card>

        {/* Progress Card */}
        <Card className="bg-white/5 py-2 overflow-hidden">
          <div className="px-6 py-4 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-foreground" />
                <div>
                  <h3 className="text-base font-semibold">Progresso</h3>
                  <p className="text-sm text-muted-foreground">
                    Acompanhamento do desempenho atual
                  </p>
                </div>
              </div>
              <div className="border-b border-border" />
            </div>

            <div className="w-full rounded-xl border border-border bg-white p-6 dark:bg-slate-800/60">
              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold tabular-nums">
                    {goal.currentValue}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    de {goal.targetValue} {goal.unit || ''}
                  </span>
                </div>
                <div className="h-3 w-full rounded-full bg-gray-100 dark:bg-white/[0.06]">
                  <div
                    className={cn(
                      'h-3 rounded-full transition-all',
                      progressPercent >= 100
                        ? 'bg-emerald-500'
                        : progressPercent >= 50
                          ? 'bg-sky-500'
                          : progressPercent >= 25
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                    )}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-semibold">
                    {progressPercent.toFixed(1)}% concluído
                  </span>
                  <span
                    className={cn(
                      'text-xs font-medium px-2 py-0.5 rounded-full',
                      onTrack
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/8 dark:text-emerald-300'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-500/8 dark:text-amber-300'
                    )}
                  >
                    {onTrack ? 'No ritmo' : 'Abaixo do esperado'}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    Dias restantes
                  </p>
                  <p className="text-lg font-bold tabular-nums">
                    {daysRemaining}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    Dias decorridos
                  </p>
                  <p className="text-lg font-bold tabular-nums">
                    {daysElapsed}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Total de dias</p>
                  <p className="text-lg font-bold tabular-nums">{totalDays}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Details Card */}
        <Card className="bg-white/5 py-2 overflow-hidden">
          <div className="px-6 py-4 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-foreground" />
                <div>
                  <h3 className="text-base font-semibold">Detalhes da Meta</h3>
                  <p className="text-sm text-muted-foreground">
                    Informações e configuração da meta
                  </p>
                </div>
              </div>
              <div className="border-b border-border" />
            </div>

            <div className="w-full rounded-xl border border-border bg-white p-6 dark:bg-slate-800/60">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow
                  icon={Target}
                  label="Tipo"
                  value={GOAL_TYPE_LABELS[goal.type] ?? goal.type}
                />
                <InfoRow
                  icon={Users}
                  label="Escopo"
                  value={SCOPE_LABELS[goal.scope] ?? goal.scope}
                />
                <InfoRow
                  icon={Calendar}
                  label="Início"
                  value={formatDate(goal.startDate)}
                />
                <InfoRow
                  icon={Calendar}
                  label="Término"
                  value={formatDate(goal.endDate)}
                />
                <InfoRow
                  icon={TrendingUp}
                  label="Valor alvo"
                  value={`${goal.targetValue} ${goal.unit || ''}`}
                />
                <InfoRow
                  icon={TrendingUp}
                  label="Valor atual"
                  value={`${goal.currentValue} ${goal.unit || ''}`}
                />
              </div>

              {goal.achievedAt && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-1">
                    Atingida em
                  </p>
                  <p className="text-sm font-medium">
                    {formatDate(goal.achievedAt)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </PageBody>
    </PageLayout>
  );
}
