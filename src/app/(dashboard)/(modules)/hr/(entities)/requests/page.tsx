/**
 * HR Requests Management Page (Manager View)
 * Gestão de solicitações dos colaboradores
 */

'use client';

import { GridLoading } from '@/components/handlers/grid-loading';
import { GridError } from '@/components/handlers/grid-error';
import { Header } from '@/components/layout/header';
import { PageActionBar } from '@/components/layout/page-action-bar';
import {
  PageBody,
  PageHeader,
  PageLayout,
} from '@/components/layout/page-layout';
import { SearchBar } from '@/components/layout/search-bar';
import { Button } from '@/components/ui/button';
import { FilterDropdown } from '@/components/ui/filter-dropdown';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CoreProvider,
  EntityCard,
  EntityContextMenu,
  EntityGrid,
} from '@/core';
import { HR_PERMISSIONS } from '@/app/(dashboard)/(modules)/hr/_shared/constants/hr-permissions';
import { usePermissions } from '@/hooks/use-permissions';
import { portalService } from '@/services/hr';
import type { EmployeeRequest, RequestType, RequestStatus } from '@/types/hr';
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import type { LucideIcon } from 'lucide-react';
import {
  Calendar,
  Check,
  CheckCircle2,
  ClipboardList,
  FileText,
  Loader2,
  PalmtreeIcon,
  Send,
  UserCog,
  X,
  XCircle,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { toast } from 'sonner';

// ============================================================================
// CONSTANTS
// ============================================================================

const REQUEST_TYPE_LABELS: Record<RequestType, string> = {
  VACATION: 'Férias',
  ABSENCE: 'Ausência',
  ADVANCE: 'Adiantamento',
  DATA_CHANGE: 'Alteração de Dados',
  SUPPORT: 'Suporte',
};

const REQUEST_TYPE_ICONS: Record<RequestType, LucideIcon> = {
  VACATION: PalmtreeIcon,
  ABSENCE: Calendar,
  ADVANCE: FileText,
  DATA_CHANGE: UserCog,
  SUPPORT: Send,
};

const REQUEST_TYPE_GRADIENTS: Record<RequestType, string> = {
  VACATION: 'from-green-500 to-green-600',
  ABSENCE: 'from-rose-500 to-rose-600',
  ADVANCE: 'from-amber-500 to-amber-600',
  DATA_CHANGE: 'from-blue-500 to-blue-600',
  SUPPORT: 'from-violet-500 to-violet-600',
};

const STATUS_CONFIG: Record<
  RequestStatus,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  }
> = {
  PENDING: { label: 'Pendente', variant: 'outline' },
  APPROVED: { label: 'Aprovada', variant: 'default' },
  REJECTED: { label: 'Rejeitada', variant: 'destructive' },
  CANCELLED: { label: 'Cancelada', variant: 'secondary' },
};

const TYPE_FILTER_OPTIONS = [
  { id: 'VACATION', label: 'Férias' },
  { id: 'ABSENCE', label: 'Ausência' },
  { id: 'ADVANCE', label: 'Adiantamento' },
  { id: 'DATA_CHANGE', label: 'Alteração de Dados' },
  { id: 'SUPPORT', label: 'Suporte' },
];

const STATUS_FILTER_OPTIONS = [
  { id: 'PENDING', label: 'Pendente' },
  { id: 'APPROVED', label: 'Aprovada' },
  { id: 'REJECTED', label: 'Rejeitada' },
  { id: 'CANCELLED', label: 'Cancelada' },
];

export default function RequestsPage() {
  return (
    <Suspense
      fallback={<GridLoading count={6} layout="grid" size="md" gap="gap-4" />}
    >
      <RequestsPageContent />
    </Suspense>
  );
}

function RequestsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();

  const canApprove = hasPermission(HR_PERMISSIONS.EMPLOYEES.MANAGE);

  // ============================================================================
  // STATE
  // ============================================================================

  const [searchQuery, setSearchQuery] = useState('');
  const [actionTarget, setActionTarget] = useState<{
    request: EmployeeRequest;
    action: 'approve' | 'reject';
  } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // ============================================================================
  // URL-BASED FILTERS
  // ============================================================================

  const typeFilter = useMemo(() => {
    const raw = searchParams.get('type');
    return raw ? raw.split(',').filter(Boolean) : [];
  }, [searchParams]);

  const statusFilter = useMemo(() => {
    const raw = searchParams.get('status');
    return raw ? raw.split(',').filter(Boolean) : [];
  }, [searchParams]);

  const buildFilterUrl = useCallback(
    (params: { type?: string[]; status?: string[] }) => {
      const types = params.type !== undefined ? params.type : typeFilter;
      const statuses =
        params.status !== undefined ? params.status : statusFilter;
      const parts: string[] = [];
      if (types.length > 0) parts.push(`type=${types.join(',')}`);
      if (statuses.length > 0) parts.push(`status=${statuses.join(',')}`);
      return parts.length > 0
        ? `/hr/requests?${parts.join('&')}`
        : '/hr/requests';
    },
    [typeFilter, statusFilter]
  );

  const setTypeFilter = useCallback(
    (ids: string[]) => {
      router.push(buildFilterUrl({ type: ids }));
    },
    [router, buildFilterUrl]
  );

  const setStatusFilter = useCallback(
    (ids: string[]) => {
      router.push(buildFilterUrl({ status: ids }));
    },
    [router, buildFilterUrl]
  );

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const PAGE_SIZE = 20;

  const {
    data: infiniteData,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['hr-pending-requests'],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await portalService.listPendingApprovals({
        page: pageParam,
        perPage: PAGE_SIZE,
      });
      return response;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.meta?.page ?? 1;
      const totalPages = lastPage.meta?.totalPages ?? 1;
      if (currentPage < totalPages) {
        return currentPage + 1;
      }
      return undefined;
    },
  });

  const requestsData =
    infiniteData?.pages.flatMap(p => p.requests) ?? [];

  // ============================================================================
  // INFINITE SCROLL SENTINEL
  // ============================================================================

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '300px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  const approveMutation = useMutation({
    mutationFn: (id: string) => portalService.approveRequest(id),
    onSuccess: () => {
      toast.success('Solicitação aprovada com sucesso');
      queryClient.invalidateQueries({ queryKey: ['hr-pending-requests'] });
      setActionTarget(null);
    },
    onError: () => {
      toast.error('Erro ao aprovar solicitação');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      portalService.rejectRequest(id, reason),
    onSuccess: () => {
      toast.success('Solicitação rejeitada');
      queryClient.invalidateQueries({ queryKey: ['hr-pending-requests'] });
      setActionTarget(null);
      setRejectionReason('');
    },
    onError: () => {
      toast.error('Erro ao rejeitar solicitação');
    },
  });

  // ============================================================================
  // FILTERED ITEMS
  // ============================================================================

  const filteredItems = useMemo(() => {
    let items = requestsData;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        item =>
          (item.employee?.fullName &&
            item.employee.fullName.toLowerCase().includes(q)) ||
          REQUEST_TYPE_LABELS[item.type]?.toLowerCase().includes(q) ||
          STATUS_CONFIG[item.status]?.label.toLowerCase().includes(q)
      );
    }

    if (typeFilter.length > 0) {
      const set = new Set(typeFilter);
      items = items.filter(item => set.has(item.type));
    }

    if (statusFilter.length > 0) {
      const set = new Set(statusFilter);
      items = items.filter(item => set.has(item.status));
    }

    return items;
  }, [requestsData, searchQuery, typeFilter, statusFilter]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleAction = useCallback(() => {
    if (!actionTarget) return;

    if (actionTarget.action === 'approve') {
      approveMutation.mutate(actionTarget.request.id);
    } else {
      if (!rejectionReason.trim()) {
        toast.error('Informe o motivo da rejeição');
        return;
      }
      rejectMutation.mutate({
        id: actionTarget.request.id,
        reason: rejectionReason.trim(),
      });
    }
  }, [actionTarget, rejectionReason, approveMutation, rejectMutation]);

  const handleView = (ids: string[]) => {
    if (ids.length === 1) {
      router.push(`/hr/requests/${ids[0]}`);
    }
  };

  // ============================================================================
  // RENDER CARDS
  // ============================================================================

  const renderGridCard = (item: EmployeeRequest, isSelected: boolean) => {
    const typeLabel = REQUEST_TYPE_LABELS[item.type];
    const TypeIcon = REQUEST_TYPE_ICONS[item.type];
    const gradient = REQUEST_TYPE_GRADIENTS[item.type];
    const statusConfig = STATUS_CONFIG[item.status];

    return (
      <EntityContextMenu
        itemId={item.id}
        onView={handleView}
        actions={[
          ...(canApprove && item.status === 'PENDING'
            ? [
                {
                  id: 'approve',
                  label: 'Aprovar',
                  icon: Check,
                  onClick: () =>
                    setActionTarget({ request: item, action: 'approve' }),
                },
                {
                  id: 'reject',
                  label: 'Rejeitar',
                  icon: X,
                  separator: 'before' as const,
                  onClick: () =>
                    setActionTarget({ request: item, action: 'reject' }),
                },
              ]
            : []),
        ]}
      >
        <EntityCard
          id={item.id}
          variant="grid"
          title={item.employee?.fullName || 'Colaborador'}
          subtitle={
            item.employee?.department
              ? `${typeLabel} - ${item.employee.department.name}`
              : typeLabel
          }
          icon={TypeIcon}
          iconBgColor={`bg-linear-to-br ${gradient}`}
          badges={[
            {
              label: typeLabel,
              variant: 'outline',
            },
            {
              label: statusConfig.label,
              variant: statusConfig.variant,
            },
          ]}
          footer={{
            type: 'single',
            button: {
              icon: Calendar,
              label: new Date(item.createdAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              }),
              color: 'blue',
            },
          }}
          isSelected={isSelected}
          showSelection={false}
          clickable={false}
          createdAt={item.createdAt}
          showStatusBadges={false}
        />
      </EntityContextMenu>
    );
  };

  const renderListCard = (item: EmployeeRequest, isSelected: boolean) => {
    const typeLabel = REQUEST_TYPE_LABELS[item.type];
    const TypeIcon = REQUEST_TYPE_ICONS[item.type];
    const gradient = REQUEST_TYPE_GRADIENTS[item.type];
    const statusConfig = STATUS_CONFIG[item.status];

    return (
      <EntityContextMenu
        itemId={item.id}
        onView={handleView}
        actions={[
          ...(canApprove && item.status === 'PENDING'
            ? [
                {
                  id: 'approve',
                  label: 'Aprovar',
                  icon: Check,
                  onClick: () =>
                    setActionTarget({ request: item, action: 'approve' }),
                },
                {
                  id: 'reject',
                  label: 'Rejeitar',
                  icon: X,
                  separator: 'before' as const,
                  onClick: () =>
                    setActionTarget({ request: item, action: 'reject' }),
                },
              ]
            : []),
        ]}
      >
        <EntityCard
          id={item.id}
          variant="list"
          title={item.employee?.fullName || 'Colaborador'}
          subtitle={
            item.employee?.department
              ? `${typeLabel} - ${item.employee.department.name}`
              : typeLabel
          }
          icon={TypeIcon}
          iconBgColor={`bg-linear-to-br ${gradient}`}
          badges={[
            {
              label: typeLabel,
              variant: 'outline',
            },
            {
              label: statusConfig.label,
              variant: statusConfig.variant,
            },
          ]}
          footer={{
            type: 'single',
            button: {
              icon: Calendar,
              label: new Date(item.createdAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              }),
              color: 'blue',
            },
          }}
          isSelected={isSelected}
          showSelection={false}
          clickable={false}
          createdAt={item.createdAt}
          showStatusBadges={false}
        />
      </EntityContextMenu>
    );
  };

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const initialIds = useMemo(
    () => filteredItems.map(i => i.id),
    [filteredItems]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <CoreProvider
      selection={{
        namespace: 'requests',
        initialIds,
      }}
    >
      <PageLayout>
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'RH', href: '/hr' },
              { label: 'Solicitações', href: '/hr/requests' },
            ]}
          />

          <Header
            title="Solicitações"
            description="Gerencie solicitações dos colaboradores"
          />
        </PageHeader>

        <PageBody>
          <SearchBar
            placeholder="Buscar solicitações..."
            value={searchQuery}
            onSearch={value => setSearchQuery(value)}
            onClear={() => setSearchQuery('')}
            showClear={true}
            size="md"
          />

          {isLoading ? (
            <GridLoading count={6} layout="grid" size="md" gap="gap-4" />
          ) : error ? (
            <GridError
              type="server"
              title="Erro ao carregar solicitações"
              message="Ocorreu um erro ao tentar carregar as solicitações. Por favor, tente novamente."
              action={{
                label: 'Tentar Novamente',
                onClick: () => {
                  refetch();
                },
              }}
            />
          ) : (
            <EntityGrid
              config={{
                name: 'Request',
                namePlural: 'Requests',
                slug: 'requests',
                icon: ClipboardList,
                api: {
                  baseUrl: '/api/v1/hr/approvals',
                  queryKey: 'hr-pending-requests',
                  queryKeys: {
                    list: ['hr-pending-requests'],
                    detail: (id: string) => ['hr-pending-requests', id],
                  },
                  endpoints: {
                    list: '/v1/hr/approvals/pending',
                    get: '/v1/hr/approvals/:id',
                  },
                },
                routes: {
                  list: '/hr/requests',
                  detail: '/hr/requests/:id',
                },
                permissions: {
                  view: HR_PERMISSIONS.EMPLOYEES.MANAGE,
                  create: HR_PERMISSIONS.EMPLOYEES.MANAGE,
                  delete: HR_PERMISSIONS.EMPLOYEES.MANAGE,
                },
                display: {
                  icon: ClipboardList,
                  color: 'blue',
                  gradient: 'from-blue-500 to-blue-600',
                  titleField: 'type',
                  labels: {
                    singular: 'Solicitação',
                    plural: 'Solicitações',
                    emptyState: 'Nenhuma solicitação encontrada',
                    searchPlaceholder: 'Buscar solicitações...',
                  },
                },
                grid: {
                  defaultView: 'grid',
                  columns: { sm: 1, md: 2, lg: 3, xl: 4 },
                  showViewToggle: true,
                  enableDragSelection: false,
                  selectable: false,
                  searchableFields: ['type'],
                  defaultSort: { field: 'createdAt', direction: 'desc' },
                  pageSize: 20,
                },
              }}
              items={filteredItems}
              toolbarStart={
                <>
                  <FilterDropdown
                    label="Tipo"
                    icon={ClipboardList}
                    options={TYPE_FILTER_OPTIONS}
                    selected={typeFilter}
                    onSelectionChange={setTypeFilter}
                    activeColor="blue"
                    searchPlaceholder="Buscar tipo..."
                    emptyText="Nenhum tipo encontrado."
                  />
                  <FilterDropdown
                    label="Status"
                    options={STATUS_FILTER_OPTIONS}
                    selected={statusFilter}
                    onSelectionChange={setStatusFilter}
                    activeColor="emerald"
                  />
                </>
              }
              renderGridItem={renderGridCard}
              renderListItem={renderListCard}
              isLoading={isLoading}
              isSearching={!!searchQuery}
              onItemClick={item => handleView([item.id])}
              onItemDoubleClick={item => handleView([item.id])}
              showSorting={true}
              defaultSortField="createdAt"
              defaultSortDirection="desc"
            />
          )}

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="h-1" />
          {isFetchingNextPage && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Approve/Reject Dialog */}
          <Dialog
            open={!!actionTarget}
            onOpenChange={v => {
              if (!v) {
                setActionTarget(null);
                setRejectionReason('');
              }
            }}
          >
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {actionTarget?.action === 'approve'
                    ? 'Aprovar Solicitação'
                    : 'Rejeitar Solicitação'}
                </DialogTitle>
                <DialogDescription>
                  {actionTarget?.action === 'approve'
                    ? `Confirma a aprovação da solicitação de ${REQUEST_TYPE_LABELS[actionTarget?.request.type || 'SUPPORT']}?`
                    : 'Informe o motivo da rejeição.'}
                </DialogDescription>
              </DialogHeader>

              {actionTarget?.action === 'reject' && (
                <div className="space-y-2 py-2">
                  <Label>Motivo da Rejeição</Label>
                  <Textarea
                    value={rejectionReason}
                    onChange={e => setRejectionReason(e.target.value)}
                    placeholder="Descreva o motivo da rejeição..."
                    rows={3}
                  />
                </div>
              )}

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setActionTarget(null);
                    setRejectionReason('');
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  variant={
                    actionTarget?.action === 'approve'
                      ? 'default'
                      : 'destructive'
                  }
                  onClick={handleAction}
                  disabled={
                    approveMutation.isPending || rejectMutation.isPending
                  }
                >
                  {(approveMutation.isPending || rejectMutation.isPending) && (
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  )}
                  {actionTarget?.action === 'approve' ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-1.5" />
                      Confirmar Aprovação
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-1.5" />
                      Confirmar Rejeição
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </PageBody>
      </PageLayout>
    </CoreProvider>
  );
}
