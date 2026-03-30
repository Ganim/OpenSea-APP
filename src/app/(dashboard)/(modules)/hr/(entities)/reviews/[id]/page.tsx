/**
 * OpenSea OS - Review Cycle Detail Page
 * Página de detalhes do ciclo de avaliação
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { VerifyActionPinModal } from '@/components/modals/verify-action-pin-modal';
import { usePermissions } from '@/hooks/use-permissions';
import { reviewsService } from '@/services/hr/reviews.service';
import type {
  PerformanceReview,
  PerformanceReviewStatus,
  ReviewCycle,
  ReviewCycleStatus,
  ReviewCycleType,
} from '@/types/hr';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CalendarDays,
  CheckCircle,
  ClipboardCheck,
  Clock,
  Lock,
  Play,
  Star,
  Trash2,
  Users,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  PERFORMANCE_REVIEW_STATUS_LABELS,
  REVIEW_CYCLE_STATUS_COLORS,
  REVIEW_CYCLE_STATUS_LABELS,
  REVIEW_CYCLE_TYPE_COLORS,
  REVIEW_CYCLE_TYPE_LABELS,
  SCORE_LABELS,
} from '../src';

export default function ReviewCycleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const cycleId = params.id as string;

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const canAdmin = hasPermission('hr.reviews.admin');
  const canDelete = hasPermission('hr.reviews.remove');

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const {
    data: cycleData,
    isLoading: cycleLoading,
    error: cycleError,
  } = useQuery({
    queryKey: ['review-cycles', cycleId],
    queryFn: async () => {
      const response = await reviewsService.getCycle(cycleId);
      return response.reviewCycle;
    },
    enabled: !!cycleId,
  });

  const {
    data: reviewsData,
    isLoading: reviewsLoading,
  } = useQuery({
    queryKey: ['performance-reviews', 'by-cycle', cycleId],
    queryFn: async () => {
      const response = await reviewsService.listReviews({
        reviewCycleId: cycleId,
        perPage: 100,
      });
      return response.reviews;
    },
    enabled: !!cycleId,
  });

  const reviews = reviewsData ?? [];

  // ============================================================================
  // STATS
  // ============================================================================

  const stats = useMemo(() => {
    const totalReviews = reviews.length;
    const completedReviews = reviews.filter(r => r.status === 'COMPLETED').length;
    const pendingReviews = reviews.filter(r => r.status === 'PENDING').length;
    const avgFinalScore =
      totalReviews > 0
        ? reviews
            .filter(r => r.finalScore !== null)
            .reduce((sum, r) => sum + (r.finalScore ?? 0), 0) /
            Math.max(reviews.filter(r => r.finalScore !== null).length, 1)
        : 0;
    const completionRate =
      totalReviews > 0 ? Math.round((completedReviews / totalReviews) * 100) : 0;

    return { totalReviews, completedReviews, pendingReviews, avgFinalScore, completionRate };
  }, [reviews]);

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  const openCycleMutation = useMutation({
    mutationFn: () => reviewsService.openCycle(cycleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-cycles', cycleId] });
      queryClient.invalidateQueries({ queryKey: ['review-cycles', 'infinite'] });
      toast.success('Ciclo de avaliação aberto com sucesso');
    },
    onError: () => {
      toast.error('Erro ao abrir ciclo de avaliação');
    },
  });

  const closeCycleMutation = useMutation({
    mutationFn: () => reviewsService.closeCycle(cycleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-cycles', cycleId] });
      queryClient.invalidateQueries({ queryKey: ['review-cycles', 'infinite'] });
      toast.success('Ciclo de avaliação fechado com sucesso');
    },
    onError: () => {
      toast.error('Erro ao fechar ciclo de avaliação');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => reviewsService.deleteCycle(cycleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-cycles'] });
      toast.success('Ciclo de avaliação excluído com sucesso');
      router.push('/hr/reviews');
    },
    onError: () => {
      toast.error('Erro ao excluir ciclo de avaliação');
    },
  });

  // ============================================================================
  // RENDER
  // ============================================================================

  if (cycleLoading) {
    return (
      <PageLayout>
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'RH', href: '/hr' },
              { label: 'Avaliações', href: '/hr/reviews' },
              { label: '...' },
            ]}
          />
        </PageHeader>
        <PageBody>
          <GridLoading count={4} layout="grid" size="md" gap="gap-4" />
        </PageBody>
      </PageLayout>
    );
  }

  if (cycleError || !cycleData) {
    return (
      <PageLayout>
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'RH', href: '/hr' },
              { label: 'Avaliações', href: '/hr/reviews' },
              { label: 'Erro' },
            ]}
          />
        </PageHeader>
        <PageBody>
          <GridError message="Ciclo de avaliação não encontrado" />
        </PageBody>
      </PageLayout>
    );
  }

  const typeColors = REVIEW_CYCLE_TYPE_COLORS[cycleData.type as ReviewCycleType];
  const statusColors = REVIEW_CYCLE_STATUS_COLORS[cycleData.status as ReviewCycleStatus];

  return (
    <PageLayout>
      <PageHeader>
        <PageActionBar
          breadcrumbItems={[
            { label: 'RH', href: '/hr' },
            { label: 'Avaliações', href: '/hr/reviews' },
            { label: cycleData.name },
          ]}
          actions={
            <div className="flex items-center gap-2">
              {canAdmin && cycleData.status === 'DRAFT' && (
                <Button
                  size="sm"
                  className="h-9 px-2.5 rounded-lg text-sm shadow-sm"
                  onClick={() => openCycleMutation.mutate()}
                  disabled={openCycleMutation.isPending}
                >
                  <Play className="mr-1.5 h-4 w-4" />
                  Abrir Ciclo
                </Button>
              )}
              {canAdmin && cycleData.status !== 'DRAFT' && cycleData.status !== 'CLOSED' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 px-2.5 rounded-lg text-sm"
                  onClick={() => closeCycleMutation.mutate()}
                  disabled={closeCycleMutation.isPending}
                >
                  <Lock className="mr-1.5 h-4 w-4" />
                  Fechar Ciclo
                </Button>
              )}
              {canDelete && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-9 px-2.5 rounded-lg text-sm text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                  onClick={() => setIsDeleteOpen(true)}
                >
                  <Trash2 className="mr-1.5 h-4 w-4" />
                  Excluir
                </Button>
              )}
            </div>
          }
        />
      </PageHeader>

      <PageBody>
        {/* Identity Card */}
        <Card className="bg-white/5 p-5 mb-4">
          <div className="flex items-start gap-4">
            <div
              className={`h-12 w-12 rounded-xl bg-gradient-to-br ${typeColors?.gradient ?? 'from-slate-500 to-slate-600'} flex items-center justify-center shrink-0`}
            >
              <ClipboardCheck className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold">{cycleData.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="secondary"
                  className={`text-xs ${typeColors?.bg ?? ''} ${typeColors?.text ?? ''} border-0`}
                >
                  {REVIEW_CYCLE_TYPE_LABELS[cycleData.type as ReviewCycleType] ?? cycleData.type}
                </Badge>
                <Badge
                  variant="secondary"
                  className={`text-xs ${statusColors?.bg ?? ''} ${statusColors?.text ?? ''} border-0`}
                >
                  {REVIEW_CYCLE_STATUS_LABELS[cycleData.status as ReviewCycleStatus] ?? cycleData.status}
                </Badge>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                <CalendarDays className="h-3.5 w-3.5" />
                <span>
                  {new Date(cycleData.startDate).toLocaleDateString('pt-BR')} -{' '}
                  {new Date(cycleData.endDate).toLocaleDateString('pt-BR')}
                </span>
              </div>
              {cycleData.description && (
                <p className="text-sm text-muted-foreground mt-2">
                  {cycleData.description}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard
            icon={<Users className="h-4 w-4" />}
            label="Total"
            value={stats.totalReviews.toString()}
          />
          <StatCard
            icon={<CheckCircle className="h-4 w-4 text-emerald-500" />}
            label="Concluídas"
            value={`${stats.completedReviews} (${stats.completionRate}%)`}
          />
          <StatCard
            icon={<Clock className="h-4 w-4 text-amber-500" />}
            label="Pendentes"
            value={stats.pendingReviews.toString()}
          />
          <StatCard
            icon={<Star className="h-4 w-4 text-violet-500" />}
            label="Nota média"
            value={stats.avgFinalScore > 0 ? stats.avgFinalScore.toFixed(1) : '-'}
          />
        </div>

        {/* Reviews List */}
        <h2 className="text-sm font-semibold mb-3">Avaliações</h2>
        {reviewsLoading ? (
          <GridLoading count={3} layout="list" size="sm" />
        ) : reviews.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm">
            Nenhuma avaliação cadastrada neste ciclo
          </div>
        ) : (
          <div className="space-y-2">
            {reviews.map(review => (
              <ReviewRow key={review.id} review={review} />
            ))}
          </div>
        )}
      </PageBody>

      {/* Delete Confirmation */}
      <VerifyActionPinModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onSuccess={() => deleteMutation.mutate()}
        title="Confirmar Exclusão"
        description="Digite seu PIN de ação para excluir este ciclo de avaliação."
      />
    </PageLayout>
  );
}

// ============================================================================
// STAT CARD
// ============================================================================

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card className="bg-white dark:bg-slate-800/60 border border-border p-3">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-lg font-semibold">{value}</p>
    </Card>
  );
}

// ============================================================================
// REVIEW ROW
// ============================================================================

function ReviewRow({ review }: { review: PerformanceReview }) {
  const statusLabel =
    PERFORMANCE_REVIEW_STATUS_LABELS[review.status as PerformanceReviewStatus] ??
    review.status;

  const scoreLabel = review.finalScore
    ? `${review.finalScore.toFixed(1)} - ${SCORE_LABELS[Math.round(review.finalScore)] ?? ''}`
    : '-';

  return (
    <Card className="bg-white dark:bg-slate-800/60 border border-border p-3 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">
            Funcionário: {review.employeeId.slice(0, 8)}...
          </span>
          <Badge
            variant="secondary"
            className="text-xs border-0"
          >
            {statusLabel}
          </Badge>
        </div>
        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
          <span>Avaliador: {review.reviewerId.slice(0, 8)}...</span>
          <span>Nota final: {scoreLabel}</span>
          {review.employeeAcknowledged && (
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Reconhecida
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
