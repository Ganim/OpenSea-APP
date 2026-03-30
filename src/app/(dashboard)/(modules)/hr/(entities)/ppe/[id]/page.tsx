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
import { HR_PERMISSIONS } from '@/app/(dashboard)/(modules)/hr/_shared/constants/hr-permissions';
import { ppeService } from '@/services/hr/ppe.service';
import type { PPEItem, PPEAssignment } from '@/types/hr';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Edit,
  HardHat,
  Loader2,
  Package,
  Plus,
  RotateCcw,
  Trash2,
  User,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ppeKeys,
  useDeletePPEItem,
  getCategoryLabel,
  getConditionLabel,
  getStatusLabel,
  getStatusVariant,
  getStockVariant,
  formatDate,
} from '../src';

const AssignPPEModal = dynamic(
  () =>
    import('../src/modals/assign-ppe-modal').then((m) => ({
      default: m.AssignPPEModal,
    })),
  { ssr: false },
);

const ReturnPPEModal = dynamic(
  () =>
    import('../src/modals/return-ppe-modal').then((m) => ({
      default: m.ReturnPPEModal,
    })),
  { ssr: false },
);

const PAGE_SIZE = 20;

export default function PPEDetailPage() {
  const router = useRouter();
  const params = useParams();
  const ppeItemId = params.id as string;

  const { hasPermission } = usePermissions();
  const canEdit = hasPermission(HR_PERMISSIONS.PPE.UPDATE);
  const canDelete = hasPermission(HR_PERMISSIONS.PPE.DELETE);
  const canAssign = hasPermission(HR_PERMISSIONS.PPE.CREATE);

  // ============================================================================
  // DATA
  // ============================================================================

  const {
    data: ppeItemData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ppeKeys.itemDetail(ppeItemId),
    queryFn: async () => {
      const response = await ppeService.getItem(ppeItemId);
      return response.ppeItem;
    },
  });

  const ppeItem = ppeItemData as PPEItem | undefined;

  const {
    data: assignmentsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ppeKeys.assignmentList({ ppeItemId }),
    queryFn: async ({ pageParam }) => {
      const page = pageParam as number;
      const response = await ppeService.listAssignments({
        ppeItemId,
        page,
        perPage: PAGE_SIZE,
      });
      return {
        ...response,
        page,
        hasMore: response.assignments.length >= PAGE_SIZE,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    enabled: !!ppeItemId,
  });

  const assignments = useMemo(
    () => assignmentsData?.pages.flatMap((p) => p.assignments ?? []) ?? [],
    [assignmentsData],
  );

  // Infinite scroll sentinel
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '300px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // ============================================================================
  // STATE
  // ============================================================================

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [returnTarget, setReturnTarget] = useState<PPEAssignment | null>(null);

  const deleteMutation = useDeletePPEItem({
    onSuccess: () => router.push('/hr/ppe'),
  });

  const handleDeleteConfirm = useCallback(async () => {
    await deleteMutation.mutateAsync(ppeItemId);
    setIsDeleteOpen(false);
  }, [deleteMutation, ppeItemId]);

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
              { label: 'EPI', href: '/hr/ppe' },
              { label: 'Carregando...' },
            ]}
          />
        </PageHeader>
        <PageBody>
          <GridLoading count={1} layout="list" size="lg" />
        </PageBody>
      </PageLayout>
    );
  }

  if (error || !ppeItem) {
    return (
      <PageLayout>
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'RH', href: '/hr' },
              { label: 'EPI', href: '/hr/ppe' },
              { label: 'Erro' },
            ]}
          />
        </PageHeader>
        <PageBody>
          <GridError
            type="not-found"
            title="EPI não encontrado"
            message="O equipamento de proteção solicitado não foi encontrado."
            action={{
              label: 'Voltar',
              onClick: () => router.push('/hr/ppe'),
            }}
          />
        </PageBody>
      </PageLayout>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  const stockVariant = getStockVariant(ppeItem.isLowStock, ppeItem.currentStock);

  return (
    <PageLayout>
      <PageHeader>
        <PageActionBar
          breadcrumbItems={[
            { label: 'RH', href: '/hr' },
            { label: 'EPI', href: '/hr/ppe' },
            { label: ppeItem.name },
          ]}
          buttons={[
            ...(canDelete
              ? [
                  {
                    id: 'delete' as const,
                    title: 'Excluir',
                    icon: Trash2,
                    onClick: () => setIsDeleteOpen(true),
                    variant: 'destructive' as const,
                  },
                ]
              : []),
            ...(canEdit
              ? [
                  {
                    id: 'edit' as const,
                    title: 'Editar',
                    icon: Edit,
                    onClick: () => router.push(`/hr/ppe/${ppeItemId}/edit`),
                    variant: 'default' as const,
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
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-sky-500 to-sky-600">
              <HardHat className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold">{ppeItem.name}</h2>
              <p className="text-sm text-muted-foreground">
                {getCategoryLabel(ppeItem.category)}
                {ppeItem.caNumber && ` · CA ${ppeItem.caNumber}`}
                {ppeItem.manufacturer && ` · ${ppeItem.manufacturer}`}
                {ppeItem.model && ` · ${ppeItem.model}`}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant={ppeItem.isActive ? 'default' : 'secondary'}>
                  {ppeItem.isActive ? 'Ativo' : 'Inativo'}
                </Badge>
                <Badge variant={stockVariant}>
                  {ppeItem.currentStock <= 0 ? (
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Sem estoque
                    </span>
                  ) : ppeItem.isLowStock ? (
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Estoque baixo: {ppeItem.currentStock}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      Estoque: {ppeItem.currentStock}
                    </span>
                  )}
                </Badge>
                {ppeItem.expirationMonths && (
                  <Badge variant="outline">
                    Validade: {ppeItem.expirationMonths} meses
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Details grid */}
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">Estoque Mínimo</p>
              <p className="text-sm font-medium">{ppeItem.minStock}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Estoque Atual</p>
              <p className="text-sm font-medium">{ppeItem.currentStock}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Fabricante</p>
              <p className="text-sm font-medium">
                {ppeItem.manufacturer || '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Modelo</p>
              <p className="text-sm font-medium">{ppeItem.model || '—'}</p>
            </div>
          </div>

          {ppeItem.notes && (
            <div className="mt-4">
              <p className="text-xs text-muted-foreground">Observações</p>
              <p className="text-sm">{ppeItem.notes}</p>
            </div>
          )}
        </Card>

        {/* Assignments Section */}
        <div className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Histórico de Atribuições</h3>
            {canAssign && ppeItem.currentStock > 0 && ppeItem.isActive && (
              <Button
                size="sm"
                onClick={() => setIsAssignOpen(true)}
                className="h-9 px-2.5"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Atribuir
              </Button>
            )}
          </div>

          {assignments.length === 0 ? (
            <Card className="bg-white/5 p-8 text-center">
              <User className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                Nenhuma atribuição registrada
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {assignments.map((assignment) => (
                <Card
                  key={assignment.id}
                  className="bg-white dark:bg-slate-800/60 border border-border p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          Colaborador: {assignment.employeeId.slice(0, 8)}...
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(assignment.assignedAt)}
                          {assignment.expiresAt && (
                            <>
                              {' — Expira: '}
                              {formatDate(assignment.expiresAt)}
                            </>
                          )}
                          <span>· Qtd: {assignment.quantity}</span>
                          <span>
                            · {getConditionLabel(assignment.condition)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant={getStatusVariant(assignment.status)}
                      >
                        {getStatusLabel(assignment.status)}
                      </Badge>
                      {assignment.status === 'ACTIVE' && canEdit && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2"
                          onClick={() => setReturnTarget(assignment)}
                        >
                          <RotateCcw className="mr-1 h-3.5 w-3.5" />
                          Devolver
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
              <div ref={sentinelRef} className="h-1" />
              {isFetchingNextPage && (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modals */}
        {ppeItem && (
          <AssignPPEModal
            isOpen={isAssignOpen}
            onClose={() => setIsAssignOpen(false)}
            ppeItem={ppeItem}
          />
        )}

        <ReturnPPEModal
          isOpen={!!returnTarget}
          onClose={() => setReturnTarget(null)}
          assignment={returnTarget}
        />

        <VerifyActionPinModal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onSuccess={handleDeleteConfirm}
          title="Excluir EPI"
          description="Digite seu PIN de ação para excluir este equipamento de proteção. Esta ação não pode ser desfeita."
        />
      </PageBody>
    </PageLayout>
  );
}
