'use client';

import { GridError } from '@/components/handlers/grid-error';
import { GridLoading } from '@/components/handlers/grid-loading';
import { PageActionBar } from '@/components/layout/page-action-bar';
import {
  PageBody,
  PageHeader,
  PageLayout,
} from '@/components/layout/page-layout';
import { VerifyActionPinModal } from '@/components/modals/verify-action-pin-modal';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { KeyResultRow } from '@/components/hr/key-result-row';
import { OkrProgressBar } from '@/components/hr/okr-progress-bar';
import { usePermissions } from '@/hooks/use-permissions';
import { okrsService } from '@/services/hr/okrs.service';
import {
  calculateDaysToDeadline,
  calculateExpectedProgress,
  calculateRollupProgress,
  calculateTotalDays,
  calculateWeightedKrProgress,
  getHealthBadgeClass,
  getHealthLabel,
  getOKRStatus,
} from '@/lib/hr/okr-rollup';
import type { OKRKeyResult } from '@/types/hr';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Link2,
  Pencil,
  Target,
  Trash2,
  TrendingUp,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { useDeleteObjective, okrKeys } from '../src/api';
import {
  formatDate,
  formatPeriodLabel,
  getObjectiveLevelBadgeClass,
  getObjectiveLevelLabel,
  getObjectiveStatusBadgeClass,
  getObjectiveStatusLabel,
} from '../src/utils';
import { HR_PERMISSIONS } from '../../../_shared/constants/hr-permissions';

const KeyResultCheckinModal = dynamic(
  () =>
    import('@/components/hr/key-result-checkin-modal').then(m => ({
      default: m.KeyResultCheckinModal,
    })),
  { ssr: false }
);

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function OKRDetailPage() {
  const params = useParams();
  const router = useRouter();
  const objectiveId = params.id as string;
  const { hasPermission } = usePermissions();

  const canUpdate = hasPermission(HR_PERMISSIONS.OKRS.UPDATE);
  const canDelete = hasPermission(HR_PERMISSIONS.OKRS.DELETE);

  const [showDeletePin, setShowDeletePin] = useState(false);
  const [checkInTargetKr, setCheckInTargetKr] = useState<OKRKeyResult | null>(
    null
  );

  const deleteObjective = useDeleteObjective();

  // ============================================================================
  // QUERIES
  // ============================================================================

  const {
    data: objectiveData,
    isLoading,
    error,
  } = useQuery({
    queryKey: okrKeys.detail(objectiveId),
    queryFn: () => okrsService.getObjective(objectiveId),
    enabled: !!objectiveId,
  });

  const objective = objectiveData?.objective;

  // Filhos: lista compactada de OKRs alinhados (children)
  const { data: childrenData } = useQuery({
    queryKey: ['okrs', 'children', objectiveId],
    queryFn: () =>
      okrsService.listObjectives({ parentId: objectiveId, perPage: 100 }),
    enabled: !!objectiveId,
  });

  const childObjectives = useMemo(
    () => childrenData?.objectives ?? [],
    [childrenData]
  );

  // ============================================================================
  // COMPUTED
  // ============================================================================

  const keyResults = useMemo<OKRKeyResult[]>(
    () => objective?.keyResults ?? [],
    [objective]
  );

  const ownProgress = useMemo(() => {
    if (!objective) return 0;
    if (keyResults.length === 0) return objective.progress ?? 0;
    return calculateWeightedKrProgress(keyResults);
  }, [keyResults, objective]);

  const rollupProgress = useMemo(() => {
    if (!objective) return 0;
    if (childObjectives.length === 0) return ownProgress;
    return calculateRollupProgress(objective, [objective, ...childObjectives]);
  }, [objective, childObjectives, ownProgress]);

  const totalDays = useMemo(() => {
    if (!objective?.startDate || !objective?.endDate) return 0;
    return calculateTotalDays(objective.startDate, objective.endDate);
  }, [objective]);

  const daysToDeadline = useMemo(() => {
    if (!objective?.endDate) return 0;
    return calculateDaysToDeadline(objective.endDate);
  }, [objective]);

  const expectedProgress = useMemo(() => {
    if (!objective?.startDate || !objective?.endDate) return 0;
    return calculateExpectedProgress(objective.startDate, objective.endDate);
  }, [objective]);

  const health = useMemo(() => {
    if (!objective) return 'NOT_STARTED' as const;
    return getOKRStatus(
      rollupProgress,
      daysToDeadline,
      totalDays,
      objective.status
    );
  }, [rollupProgress, daysToDeadline, totalDays, objective]);

  // Tendência: compara o progresso atual com o último check-in do KR mais
  // recentemente atualizado (estimativa simples para o card de Progresso).
  const lastTrend = useMemo(() => {
    let mostRecentDelta = 0;
    let hasData = false;
    for (const keyResult of keyResults) {
      const checkIns = keyResult.checkIns ?? [];
      if (checkIns.length < 2) continue;
      const sorted = [...checkIns].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      const delta = sorted[0].newValue - sorted[1].newValue;
      const range = keyResult.targetValue - keyResult.startValue || 1;
      mostRecentDelta += (delta / range) * 100;
      hasData = true;
    }
    if (!hasData) return null;
    return Math.round(mostRecentDelta / Math.max(1, keyResults.length));
  }, [keyResults]);

  const handleDeleteConfirm = () => {
    deleteObjective.mutate(objectiveId, {
      onSuccess: () => {
        router.push('/hr/okrs');
      },
    });
    setShowDeletePin(false);
  };

  // ============================================================================
  // LOADING / ERROR
  // ============================================================================

  if (isLoading) {
    return (
      <PageLayout data-testid="okr-detail-page">
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'RH', href: '/hr' },
              { label: 'OKRs', href: '/hr/okrs' },
              { label: 'Carregando...' },
            ]}
          />
        </PageHeader>
        <PageBody>
          <GridLoading count={3} layout="list" size="md" gap="gap-4" />
        </PageBody>
      </PageLayout>
    );
  }

  if (error || !objective) {
    return (
      <PageLayout data-testid="okr-detail-page">
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'RH', href: '/hr' },
              { label: 'OKRs', href: '/hr/okrs' },
              { label: 'Erro' },
            ]}
          />
        </PageHeader>
        <PageBody>
          <GridError
            type="not-found"
            title="Objetivo não encontrado"
            message="O objetivo solicitado não foi encontrado."
            action={{
              label: 'Voltar',
              onClick: () => router.push('/hr/okrs'),
            }}
          />
        </PageBody>
      </PageLayout>
    );
  }

  const ownerName = objective.owner?.fullName ?? 'Sem responsável';
  const trendIsPositive = lastTrend != null && lastTrend > 0;
  const trendIsNegative = lastTrend != null && lastTrend < 0;

  return (
    <PageLayout data-testid="okr-detail-page">
      <PageHeader>
        <PageActionBar
          breadcrumbItems={[
            { label: 'RH', href: '/hr' },
            { label: 'OKRs', href: '/hr/okrs' },
            { label: objective.title },
          ]}
          buttons={[
            ...(canUpdate
              ? [
                  {
                    id: 'edit-objective',
                    title: 'Editar',
                    icon: Pencil,
                    onClick: () => router.push(`/hr/okrs/${objectiveId}/edit`),
                    variant: 'outline' as const,
                  },
                ]
              : []),
            ...(canDelete
              ? [
                  {
                    id: 'delete-objective',
                    title: 'Excluir',
                    icon: Trash2,
                    onClick: () => setShowDeletePin(true),
                    variant: 'destructive' as const,
                  },
                ]
              : []),
          ]}
        />
      </PageHeader>

      <PageBody>
        {/* Identity Card */}
        <Card className="bg-white/5 p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-violet-500 to-violet-600 text-white shrink-0">
              <Target className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold">{objective.title}</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Avatar className="size-5">
                  <AvatarFallback className="text-[9px] bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                    {getInitials(ownerName)}
                  </AvatarFallback>
                </Avatar>
                <span>{ownerName}</span>
                <span>&middot;</span>
                <span>{formatPeriodLabel(objective.period)}</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge
                  variant="outline"
                  className={getObjectiveLevelBadgeClass(objective.level)}
                >
                  {getObjectiveLevelLabel(objective.level)}
                </Badge>
                <Badge
                  variant="outline"
                  className={getObjectiveStatusBadgeClass(objective.status)}
                >
                  {getObjectiveStatusLabel(objective.status)}
                </Badge>
                <Badge
                  variant="outline"
                  className={getHealthBadgeClass(health)}
                >
                  {getHealthLabel(health)}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Progresso Card (big number + bar + trend) */}
        <Card className="bg-white/5 p-5" data-testid="okr-progress-card">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                Progresso geral (rollup)
              </p>
              <div className="flex items-end gap-3 mt-1">
                <span className="text-4xl font-bold tracking-tight">
                  {rollupProgress}%
                </span>
                {lastTrend != null && lastTrend !== 0 && (
                  <span
                    className={
                      trendIsPositive
                        ? 'flex items-center text-sm font-medium text-emerald-600 dark:text-emerald-400'
                        : trendIsNegative
                          ? 'flex items-center text-sm font-medium text-rose-600 dark:text-rose-400'
                          : ''
                    }
                  >
                    {trendIsPositive ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    {lastTrend > 0 ? '+' : ''}
                    {lastTrend} pp vs check-in anterior
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Próprio: {ownProgress}% &middot; Esperado: {expectedProgress}%
                &middot;{' '}
                {daysToDeadline > 0
                  ? `${daysToDeadline} dia(s) até o prazo`
                  : daysToDeadline === 0
                    ? 'Prazo é hoje'
                    : `${Math.abs(daysToDeadline)} dia(s) atrasado`}
              </p>
            </div>
            <div className="w-full sm:w-72">
              <OkrProgressBar
                progress={rollupProgress}
                health={health}
                expectedProgress={expectedProgress}
                daysToDeadline={daysToDeadline}
                size="lg"
                showLabel
              />
            </div>
          </div>
        </Card>

        {/* Detalhes (info + descrição) */}
        <Card className="bg-white/5 p-5">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Informações
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Responsável</p>
                <p className="text-sm font-medium">{ownerName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Período</p>
                <p className="text-sm font-medium">
                  {formatPeriodLabel(objective.period)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Início</p>
                <p className="text-sm font-medium">
                  {formatDate(objective.startDate)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Término</p>
                <p className="text-sm font-medium">
                  {formatDate(objective.endDate)}
                </p>
              </div>
            </div>
          </div>
          {objective.description && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-muted-foreground mb-1">Descrição</p>
              <p className="text-sm whitespace-pre-wrap">
                {objective.description}
              </p>
            </div>
          )}
        </Card>

        {/* Parent OKR */}
        {objective.parent && (
          <Card className="bg-white/5 p-4" data-testid="okr-parent-card">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Link2 className="h-4 w-4 text-violet-500 shrink-0" />
                <span className="text-sm text-muted-foreground shrink-0">
                  Alinhado com:
                </span>
                <Link
                  href={`/hr/okrs/${objective.parent.id}`}
                  className="text-sm font-medium text-violet-600 dark:text-violet-400 hover:underline truncate"
                >
                  {objective.parent.title}
                </Link>
              </div>
              <Link href={`/hr/okrs/${objective.parent.id}`}>
                <Button variant="ghost" size="sm" className="h-9 px-2.5">
                  Abrir <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Key Results */}
        <Card className="bg-white/5 p-5" data-testid="key-results-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              Resultados-Chave ({keyResults.length})
            </h3>
          </div>

          {keyResults.length === 0 ? (
            <div className="rounded-lg border border-dashed py-8 text-center">
              <p className="text-sm text-muted-foreground">
                Nenhum resultado-chave cadastrado.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {keyResults.map(keyResult => (
                <KeyResultRow
                  key={keyResult.id}
                  keyResult={keyResult}
                  daysToDeadline={daysToDeadline}
                  totalDays={totalDays}
                  canCheckIn={canUpdate}
                  onCheckIn={kr => setCheckInTargetKr(kr)}
                />
              ))}
            </div>
          )}
        </Card>

        {/* Aligned OKRs (children) */}
        {childObjectives.length > 0 && (
          <Card className="bg-white/5 p-5" data-testid="okr-children-card">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              OKRs Alinhados ({childObjectives.length})
            </h3>
            <div className="space-y-2">
              {childObjectives.map(child => (
                <Link
                  key={child.id}
                  href={`/hr/okrs/${child.id}`}
                  className="block"
                >
                  <div className="flex items-center justify-between gap-3 rounded-lg border bg-white dark:bg-slate-800/60 p-3 hover:border-violet-300 dark:hover:border-violet-700 transition-colors">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Avatar className="size-7 shrink-0">
                        <AvatarFallback className="text-[10px] bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                          {getInitials(
                            child.owner?.fullName ?? 'Sem responsável'
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium truncate">
                            {child.title}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-[10px] py-0 ${getObjectiveLevelBadgeClass(child.level)}`}
                          >
                            {getObjectiveLevelLabel(child.level)}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {child.owner?.fullName ?? 'Sem responsável'} &middot;{' '}
                          {formatPeriodLabel(child.period)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-semibold">
                        {child.progress}%
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        )}

        <KeyResultCheckinModal
          isOpen={!!checkInTargetKr}
          onClose={() => setCheckInTargetKr(null)}
          keyResult={checkInTargetKr}
        />

        <VerifyActionPinModal
          isOpen={showDeletePin}
          onClose={() => setShowDeletePin(false)}
          onSuccess={handleDeleteConfirm}
          title="Confirmar Exclusão"
          description="Digite seu PIN de ação para excluir este objetivo. Apenas objetivos em rascunho ou cancelados podem ser excluídos."
        />
      </PageBody>
    </PageLayout>
  );
}
