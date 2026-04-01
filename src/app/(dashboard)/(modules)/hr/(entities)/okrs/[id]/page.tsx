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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { usePermissions } from '@/hooks/use-permissions';
import { okrsService } from '@/services/hr/okrs.service';
import type { OKRKeyResult } from '@/types/hr';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  Calendar,
  ChevronDown,
  ChevronUp,
  Pencil,
  PlayCircle,
  Target,
  Trash2,
  User,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useDeleteObjective, okrKeys } from '../src/api';
import {
  getObjectiveLevelLabel,
  getObjectiveLevelBadgeClass,
  getObjectiveStatusLabel,
  getObjectiveStatusBadgeClass,
  getKeyResultStatusLabel,
  getKeyResultStatusBadgeClass,
  getKeyResultTypeLabel,
  getProgressBarClass,
  getConfidenceLabel,
  getConfidenceBadgeClass,
  formatPeriodLabel,
  formatDate,
  formatDateTime,
} from '../src/utils';
import { HR_PERMISSIONS } from '../../../_shared/constants/hr-permissions';

const CheckInModal = dynamic(
  () =>
    import('../src/modals/checkin-modal').then(m => ({
      default: m.CheckInModal,
    })),
  { ssr: false }
);

export default function OKRDetailPage() {
  const params = useParams();
  const router = useRouter();
  const objectiveId = params.id as string;
  const { hasPermission } = usePermissions();

  const canUpdate = hasPermission(HR_PERMISSIONS.OKRS.UPDATE);
  const canDelete = hasPermission(HR_PERMISSIONS.OKRS.DELETE);

  const [showDeletePin, setShowDeletePin] = useState(false);
  const [checkInKR, setCheckInKR] = useState<OKRKeyResult | null>(null);
  const [expandedKRs, setExpandedKRs] = useState<Set<string>>(new Set());

  const deleteObjective = useDeleteObjective();

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

  const handleDeleteConfirm = () => {
    deleteObjective.mutate(objectiveId, {
      onSuccess: () => {
        router.push('/hr/okrs');
      },
    });
    setShowDeletePin(false);
  };

  const toggleKrExpand = (krId: string) => {
    setExpandedKRs(prev => {
      const next = new Set(prev);
      if (next.has(krId)) next.delete(krId);
      else next.add(krId);
      return next;
    });
  };

  // ============================================================================
  // LOADING / ERROR
  // ============================================================================

  if (isLoading) {
    return (
      <PageLayout>
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
      <PageLayout>
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

  const keyResults = objective.keyResults ?? [];

  return (
    <PageLayout>
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
              <p className="text-sm text-muted-foreground">
                Criado em {formatDate(objective.createdAt)}
              </p>
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
              </div>
            </div>
            {/* Progress circle */}
            <div className="flex flex-col items-center shrink-0">
              <div className="relative h-16 w-16">
                <svg className="h-16 w-16 -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-slate-200 dark:text-slate-700"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    strokeWidth="3"
                    strokeDasharray={`${objective.progress}, 100`}
                    className={
                      objective.progress >= 70
                        ? 'stroke-emerald-500'
                        : objective.progress >= 40
                          ? 'stroke-amber-500'
                          : 'stroke-rose-500'
                    }
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold">
                    {objective.progress}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Details Card */}
        <Card className="bg-white/5 py-2 overflow-hidden">
          <div className="divide-y">
            {/* Info */}
            <div className="px-5 py-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Informações
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Responsável</p>
                    <p className="text-sm font-medium">
                      {objective.owner?.fullName ?? 'Sem responsável'}
                    </p>
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
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground mb-1">
                    Descrição
                  </p>
                  <p className="text-sm whitespace-pre-wrap">
                    {objective.description}
                  </p>
                </div>
              )}
            </div>

            {/* Key Results */}
            <div className="px-5 py-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Resultados-Chave ({keyResults.length})
              </h3>

              {keyResults.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum resultado-chave cadastrado.
                </p>
              ) : (
                <div className="space-y-3">
                  {keyResults.map(kr => (
                    <div
                      key={kr.id}
                      className="rounded-lg border bg-white dark:bg-slate-800/60 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <BarChart3 className="h-4 w-4 text-muted-foreground shrink-0" />
                            <h4 className="text-sm font-medium truncate">
                              {kr.title}
                            </h4>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-2">
                            <Badge
                              variant="outline"
                              className={getKeyResultStatusBadgeClass(
                                kr.status
                              )}
                            >
                              {getKeyResultStatusLabel(kr.status)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {getKeyResultTypeLabel(kr.type)} | Peso:{' '}
                              {kr.weight}
                            </span>
                          </div>
                          {/* Progress */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">
                                {kr.currentValue}
                                {kr.unit ? ` ${kr.unit}` : ''} /{' '}
                                {kr.targetValue}
                                {kr.unit ? ` ${kr.unit}` : ''}
                              </span>
                              <span className="font-medium">
                                {kr.progressPercentage}%
                              </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700">
                              <div
                                className={`h-full rounded-full transition-all ${getProgressBarClass(kr.progressPercentage)}`}
                                style={{
                                  width: `${Math.min(100, kr.progressPercentage)}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {canUpdate && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-9 px-2.5"
                              onClick={() => setCheckInKR(kr)}
                            >
                              <PlayCircle className="h-4 w-4 mr-1" />
                              Check-in
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0"
                            onClick={() => toggleKrExpand(kr.id)}
                          >
                            {expandedKRs.has(kr.id) ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Check-in History (collapsible) */}
                      {expandedKRs.has(kr.id) && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs font-medium text-muted-foreground mb-2">
                            Histórico de Check-ins
                          </p>
                          {!kr.checkIns || kr.checkIns.length === 0 ? (
                            <p className="text-xs text-muted-foreground">
                              Nenhum check-in registrado.
                            </p>
                          ) : (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {kr.checkIns.map(ci => (
                                <div
                                  key={ci.id}
                                  className="flex items-start gap-3 rounded-md bg-slate-50 dark:bg-slate-900/40 p-2 text-xs"
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">
                                        {ci.previousValue} &rarr; {ci.newValue}
                                        {kr.unit ? ` ${kr.unit}` : ''}
                                      </span>
                                      <Badge
                                        variant="outline"
                                        className={`text-[10px] py-0 ${getConfidenceBadgeClass(ci.confidence)}`}
                                      >
                                        {getConfidenceLabel(ci.confidence)}
                                      </Badge>
                                    </div>
                                    {ci.note && (
                                      <p className="text-muted-foreground mt-1">
                                        {ci.note}
                                      </p>
                                    )}
                                    <p className="text-muted-foreground mt-1">
                                      {ci.employee?.fullName ?? 'Desconhecido'}{' '}
                                      &middot; {formatDateTime(ci.createdAt)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>

        <CheckInModal
          isOpen={!!checkInKR}
          onClose={() => setCheckInKR(null)}
          keyResult={checkInKR}
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
