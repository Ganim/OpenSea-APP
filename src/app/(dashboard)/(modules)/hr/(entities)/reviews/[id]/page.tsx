/**
 * OpenSea OS - Review Cycle Detail Page
 * Página de detalhes do ciclo de avaliação com gestão completa de avaliações
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
import { FilterDropdown } from '@/components/ui/filter-dropdown';
import { VerifyActionPinModal } from '@/components/modals/verify-action-pin-modal';
import { usePermissions } from '@/hooks/use-permissions';
import { HR_PERMISSIONS } from '../../../_shared/constants/hr-permissions';
import { reviewsService } from '@/services/hr/reviews.service';
import { employeesService } from '@/services/hr/employees.service';
import type {
  Employee,
  PerformanceReview,
  PerformanceReviewStatus,
  ReviewCycleStatus,
  ReviewCycleType,
} from '@/types/hr';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CalendarDays,
  CheckCircle,
  ClipboardCheck,
  Clock,
  Edit,
  Lock,
  Play,
  Star,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  PERFORMANCE_REVIEW_STATUS_COLORS,
  PERFORMANCE_REVIEW_STATUS_LABELS,
  PERFORMANCE_REVIEW_STATUS_OPTIONS,
  REVIEW_CYCLE_STATUS_COLORS,
  REVIEW_CYCLE_STATUS_LABELS,
  REVIEW_CYCLE_TYPE_COLORS,
  REVIEW_CYCLE_TYPE_LABELS,
  SCORE_LABELS,
} from '../src';
import { CreateReviewsModal } from '../src/modals/create-reviews-modal';
import { SelfAssessmentModal } from '../src/modals/self-assessment-modal';
import { ManagerReviewModal } from '../src/modals/manager-review-modal';
import { ReviewDetailModal } from '../src/modals/review-detail-modal';

export default function ReviewCycleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const cycleId = params.id as string;

  // Modal states
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isCreateReviewsOpen, setIsCreateReviewsOpen] = useState(false);
  const [isSelfAssessmentOpen, setIsSelfAssessmentOpen] = useState(false);
  const [isManagerReviewOpen, setIsManagerReviewOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedReview, setSelectedReview] =
    useState<PerformanceReview | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string[]>([]);

  // Permissions
  const canAdmin = hasPermission(HR_PERMISSIONS.REVIEWS.MANAGE);
  const canModify = hasPermission(HR_PERMISSIONS.REVIEWS.UPDATE);
  const canRegister = hasPermission(HR_PERMISSIONS.REVIEWS.CREATE);
  const canDelete = hasPermission(HR_PERMISSIONS.REVIEWS.DELETE);

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

  const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
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

  // Fetch employees for name resolution
  const employeeIds = useMemo(() => {
    const ids = new Set<string>();
    reviews.forEach(r => {
      ids.add(r.employeeId);
      ids.add(r.reviewerId);
    });
    return Array.from(ids);
  }, [reviews]);

  const { data: employeesData } = useQuery({
    queryKey: ['employees', 'for-reviews', employeeIds.sort().join(',')],
    queryFn: async () => {
      const response = await employeesService.listEmployees({
        perPage: 200,
        status: 'ACTIVE',
      });
      return response.employees;
    },
    enabled: employeeIds.length > 0,
  });

  const employeeMap = useMemo(() => {
    const map = new Map<string, Employee>();
    (employeesData ?? []).forEach(emp => map.set(emp.id, emp));
    return map;
  }, [employeesData]);

  const getEmployeeName = useCallback(
    (id: string) => {
      const emp = employeeMap.get(id);
      return emp ? emp.fullName : `ID: ${id.slice(0, 8)}...`;
    },
    [employeeMap]
  );

  // ============================================================================
  // FILTERED REVIEWS
  // ============================================================================

  const filteredReviews = useMemo(() => {
    if (statusFilter.length === 0) return reviews;
    const set = new Set(statusFilter);
    return reviews.filter(r => set.has(r.status));
  }, [reviews, statusFilter]);

  // ============================================================================
  // STATS
  // ============================================================================

  const stats = useMemo(() => {
    const totalReviews = reviews.length;
    const completedReviews = reviews.filter(
      r => r.status === 'COMPLETED'
    ).length;
    const pendingReviews = reviews.filter(
      r => r.status === 'PENDING' || r.status === 'SELF_ASSESSMENT'
    ).length;
    const inManagerReview = reviews.filter(
      r => r.status === 'MANAGER_REVIEW'
    ).length;
    const scoredReviews = reviews.filter(r => r.finalScore !== null);
    const avgFinalScore =
      scoredReviews.length > 0
        ? scoredReviews.reduce((sum, r) => sum + (r.finalScore ?? 0), 0) /
          scoredReviews.length
        : 0;
    const completionRate =
      totalReviews > 0
        ? Math.round((completedReviews / totalReviews) * 100)
        : 0;

    return {
      totalReviews,
      completedReviews,
      pendingReviews,
      inManagerReview,
      avgFinalScore,
      completionRate,
    };
  }, [reviews]);

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  const openCycleMutation = useMutation({
    mutationFn: () => reviewsService.openCycle(cycleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-cycles', cycleId] });
      queryClient.invalidateQueries({
        queryKey: ['review-cycles', 'infinite'],
      });
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
      queryClient.invalidateQueries({
        queryKey: ['review-cycles', 'infinite'],
      });
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

  const createBulkMutation = useMutation({
    mutationFn: (
      bulkData: Parameters<typeof reviewsService.createBulkReviews>[0]
    ) => reviewsService.createBulkReviews(bulkData),
    onSuccess: data => {
      queryClient.invalidateQueries({
        queryKey: ['performance-reviews', 'by-cycle', cycleId],
      });
      toast.success(
        `${data.reviews.length} avaliação(ões) criada(s) com sucesso`
      );
      setIsCreateReviewsOpen(false);
    },
    onError: () => {
      toast.error('Erro ao criar avaliações');
    },
  });

  const selfAssessmentMutation = useMutation({
    mutationFn: ({
      reviewId,
      data,
    }: {
      reviewId: string;
      data: Parameters<typeof reviewsService.submitSelfAssessment>[1];
    }) => reviewsService.submitSelfAssessment(reviewId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['performance-reviews', 'by-cycle', cycleId],
      });
      toast.success('Autoavaliação enviada com sucesso');
      setIsSelfAssessmentOpen(false);
      setSelectedReview(null);
    },
    onError: () => {
      toast.error('Erro ao enviar autoavaliação');
    },
  });

  const managerReviewMutation = useMutation({
    mutationFn: ({
      reviewId,
      data,
    }: {
      reviewId: string;
      data: Parameters<typeof reviewsService.submitManagerReview>[1];
    }) => reviewsService.submitManagerReview(reviewId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['performance-reviews', 'by-cycle', cycleId],
      });
      toast.success('Avaliação do gestor enviada com sucesso');
      setIsManagerReviewOpen(false);
      setSelectedReview(null);
    },
    onError: () => {
      toast.error('Erro ao enviar avaliação do gestor');
    },
  });

  const acknowledgeMutation = useMutation({
    mutationFn: (reviewId: string) =>
      reviewsService.acknowledgeReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['performance-reviews', 'by-cycle', cycleId],
      });
      toast.success('Avaliação reconhecida com sucesso');
      setSelectedReview(null);
    },
    onError: () => {
      toast.error('Erro ao reconhecer avaliação');
    },
  });

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleOpenDetail = useCallback(
    (review: PerformanceReview) => {
      // Navega para a pagina dedicada de detalhes (radar + competencias).
      // O modal e mantido apenas para acoes rapidas via botoes na linha.
      router.push(`/hr/reviews/${cycleId}/review/${review.id}`);
    },
    [router, cycleId]
  );

  const handleStartSelfAssessment = useCallback((review: PerformanceReview) => {
    setSelectedReview(review);
    setIsSelfAssessmentOpen(true);
  }, []);

  const handleStartManagerReview = useCallback((review: PerformanceReview) => {
    setSelectedReview(review);
    setIsManagerReviewOpen(true);
  }, []);

  const handleAcknowledge = useCallback(
    (review: PerformanceReview) => {
      acknowledgeMutation.mutate(review.id);
    },
    [acknowledgeMutation]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  if (cycleLoading) {
    return (
      <PageLayout data-testid="reviews-detail-page">
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
      <PageLayout data-testid="reviews-detail-page">
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

  const typeColors =
    REVIEW_CYCLE_TYPE_COLORS[cycleData.type as ReviewCycleType];
  const statusColors =
    REVIEW_CYCLE_STATUS_COLORS[cycleData.status as ReviewCycleStatus];
  const cycleIsOpen =
    cycleData.status !== 'CLOSED' && cycleData.status !== 'DRAFT';

  return (
    <PageLayout data-testid="reviews-detail-page">
      <PageHeader>
        <PageActionBar
          breadcrumbItems={[
            { label: 'RH', href: '/hr' },
            { label: 'Avaliações', href: '/hr/reviews' },
            { label: cycleData.name },
          ]}
          actions={
            <div className="flex items-center gap-2">
              {canRegister && cycleIsOpen && (
                <Button
                  size="sm"
                  className="h-9 px-2.5 rounded-lg text-sm shadow-sm"
                  onClick={() => setIsCreateReviewsOpen(true)}
                >
                  <UserPlus className="mr-1.5 h-4 w-4" />
                  Atribuir Avaliações
                </Button>
              )}
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
              {canAdmin &&
                cycleData.status !== 'DRAFT' &&
                cycleData.status !== 'CLOSED' && (
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
              {hasPermission(HR_PERMISSIONS.REVIEWS.UPDATE) && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 px-2.5 rounded-lg text-sm"
                  onClick={() => router.push(`/hr/reviews/${cycleId}/edit`)}
                >
                  <Edit className="mr-1.5 h-4 w-4" />
                  Editar
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
                  {REVIEW_CYCLE_TYPE_LABELS[
                    cycleData.type as ReviewCycleType
                  ] ?? cycleData.type}
                </Badge>
                <Badge
                  variant="secondary"
                  className={`text-xs ${statusColors?.bg ?? ''} ${statusColors?.text ?? ''} border-0`}
                >
                  {REVIEW_CYCLE_STATUS_LABELS[
                    cycleData.status as ReviewCycleStatus
                  ] ?? cycleData.status}
                </Badge>
                {!cycleData.isActive && (
                  <Badge
                    variant="secondary"
                    className="text-xs bg-rose-50 dark:bg-rose-500/8 text-rose-700 dark:text-rose-300 border-0"
                  >
                    Inativo
                  </Badge>
                )}
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <StatCard
            icon={<Users className="h-4 w-4" />}
            label="Total"
            value={stats.totalReviews.toString()}
          />
          <StatCard
            icon={<Clock className="h-4 w-4 text-slate-500" />}
            label="Pendentes"
            value={stats.pendingReviews.toString()}
          />
          <StatCard
            icon={<ClipboardCheck className="h-4 w-4 text-violet-500" />}
            label="Aguard. Gestor"
            value={stats.inManagerReview.toString()}
          />
          <StatCard
            icon={<CheckCircle className="h-4 w-4 text-emerald-500" />}
            label="Concluídas"
            value={`${stats.completedReviews} (${stats.completionRate}%)`}
          />
          <StatCard
            icon={<Star className="h-4 w-4 text-amber-500" />}
            label="Nota média"
            value={
              stats.avgFinalScore > 0 ? stats.avgFinalScore.toFixed(1) : '-'
            }
          />
        </div>

        {/* Reviews Section */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">
            Avaliações ({filteredReviews.length})
          </h2>
          <FilterDropdown
            label="Status"
            options={PERFORMANCE_REVIEW_STATUS_OPTIONS}
            selected={statusFilter}
            onSelectionChange={setStatusFilter}
          />
        </div>

        {reviewsLoading ? (
          <GridLoading count={3} layout="list" size="sm" />
        ) : filteredReviews.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm">
            {reviews.length === 0
              ? 'Nenhuma avaliação cadastrada neste ciclo'
              : 'Nenhuma avaliação encontrada com os filtros aplicados'}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredReviews.map(review => (
              <ReviewRow
                key={review.id}
                review={review}
                employeeName={getEmployeeName(review.employeeId)}
                reviewerName={getEmployeeName(review.reviewerId)}
                canModify={canModify}
                onClick={() => handleOpenDetail(review)}
                onSelfAssessment={() => handleStartSelfAssessment(review)}
                onManagerReview={() => handleStartManagerReview(review)}
                onAcknowledge={() => handleAcknowledge(review)}
              />
            ))}
          </div>
        )}
      </PageBody>

      {/* Modals */}
      <VerifyActionPinModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onSuccess={() => deleteMutation.mutate()}
        title="Confirmar Exclusão"
        description="Digite seu PIN de ação para excluir este ciclo de avaliação. Todas as avaliações associadas também serão removidas."
      />

      <CreateReviewsModal
        open={isCreateReviewsOpen}
        onOpenChange={setIsCreateReviewsOpen}
        onSubmit={data => createBulkMutation.mutate(data)}
        cycleId={cycleId}
        cycleName={cycleData.name}
        isLoading={createBulkMutation.isPending}
      />

      {selectedReview && (
        <>
          <ReviewDetailModal
            open={isDetailOpen}
            onOpenChange={setIsDetailOpen}
            review={selectedReview}
            employeeName={getEmployeeName(selectedReview.employeeId)}
            reviewerName={getEmployeeName(selectedReview.reviewerId)}
            canModify={canModify}
            onSubmitSelfAssessment={() =>
              handleStartSelfAssessment(selectedReview)
            }
            onSubmitManagerReview={() =>
              handleStartManagerReview(selectedReview)
            }
            onAcknowledge={() => handleAcknowledge(selectedReview)}
          />

          <SelfAssessmentModal
            open={isSelfAssessmentOpen}
            onOpenChange={setIsSelfAssessmentOpen}
            onSubmit={data =>
              selfAssessmentMutation.mutate({
                reviewId: selectedReview.id,
                data,
              })
            }
            isLoading={selfAssessmentMutation.isPending}
            employeeName={getEmployeeName(selectedReview.employeeId)}
          />

          <ManagerReviewModal
            open={isManagerReviewOpen}
            onOpenChange={setIsManagerReviewOpen}
            onSubmit={data =>
              managerReviewMutation.mutate({
                reviewId: selectedReview.id,
                data,
              })
            }
            isLoading={managerReviewMutation.isPending}
            employeeName={getEmployeeName(selectedReview.employeeId)}
            selfScore={selectedReview.selfScore}
          />
        </>
      )}
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

function ReviewRow({
  review,
  employeeName,
  reviewerName,
  canModify,
  onClick,
  onSelfAssessment,
  onManagerReview,
  onAcknowledge,
}: {
  review: PerformanceReview;
  employeeName: string;
  reviewerName: string;
  canModify: boolean;
  onClick: () => void;
  onSelfAssessment: () => void;
  onManagerReview: () => void;
  onAcknowledge: () => void;
}) {
  const statusColors =
    PERFORMANCE_REVIEW_STATUS_COLORS[review.status as PerformanceReviewStatus];
  const statusLabel =
    PERFORMANCE_REVIEW_STATUS_LABELS[
      review.status as PerformanceReviewStatus
    ] ?? review.status;

  const scoreLabel = review.finalScore
    ? `${review.finalScore.toFixed(1)} - ${SCORE_LABELS[Math.round(review.finalScore)] ?? ''}`
    : null;

  const showSelfBtn =
    canModify &&
    (review.status === 'PENDING' || review.status === 'SELF_ASSESSMENT');
  const showMgrBtn = canModify && review.status === 'MANAGER_REVIEW';
  const showAckBtn =
    canModify && review.status === 'COMPLETED' && !review.employeeAcknowledged;

  return (
    <Card
      className="bg-white dark:bg-slate-800/60 border border-border p-3 cursor-pointer hover:shadow-sm transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        {/* Status dot */}
        <div
          className={`h-2.5 w-2.5 rounded-full shrink-0 ${statusColors?.dot ?? 'bg-slate-400'}`}
        />

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate">{employeeName}</span>
            <Badge
              variant="secondary"
              className={`text-[10px] shrink-0 ${statusColors?.bg ?? ''} ${statusColors?.text ?? ''} border-0`}
            >
              {statusLabel}
            </Badge>
            {review.employeeAcknowledged && (
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-4 mt-0.5 text-xs text-muted-foreground">
            <span>Avaliador: {reviewerName}</span>
            {scoreLabel && (
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                {scoreLabel}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div
          className="flex items-center gap-1.5 shrink-0"
          onClick={e => e.stopPropagation()}
        >
          {showSelfBtn && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-[10px] rounded"
              onClick={onSelfAssessment}
            >
              Autoavaliação
            </Button>
          )}
          {showMgrBtn && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-[10px] rounded"
              onClick={onManagerReview}
            >
              Avaliar
            </Button>
          )}
          {showAckBtn && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-[10px] rounded"
              onClick={onAcknowledge}
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Reconhecer
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
