/**
 * OpenSea OS - Candidates Listing Page
 * Página de listagem de candidatos
 */

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
import { SearchBar } from '@/components/layout/search-bar';
import { FilterDropdown } from '@/components/ui/filter-dropdown';
import { VerifyActionPinModal } from '@/components/modals/verify-action-pin-modal';
import {
  CoreProvider,
  EntityCard,
  EntityContextMenu,
  EntityGrid,
  SelectionToolbar,
  useEntityPage,
} from '@/core';
import { HR_PERMISSIONS } from '@/config/rbac/permission-codes';
import { usePermissions } from '@/hooks/use-permissions';
import { recruitmentService } from '@/services/hr/recruitment.service';
import type { Candidate } from '@/types/hr';
import { Briefcase, Loader2, Mail, Plus, Tag, User } from 'lucide-react';
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  CANDIDATE_SOURCE_LABELS,
  CANDIDATE_SOURCE_OPTIONS,
  candidatesConfig,
} from '../src';

const CreateCandidateModal = dynamic(
  () =>
    import('../src/modals/create-candidate-modal').then(m => ({
      default: m.CreateCandidateModal,
    })),
  { ssr: false }
);

export default function CandidatesPage() {
  return (
    <Suspense
      fallback={<GridLoading count={9} layout="grid" size="md" gap="gap-4" />}
    >
      <CandidatesContent />
    </Suspense>
  );
}

function CandidatesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();

  const canView = hasPermission(HR_PERMISSIONS.RECRUITMENT.ACCESS);
  const canCreate = hasPermission(HR_PERMISSIONS.RECRUITMENT.REGISTER);
  const canModify = hasPermission(HR_PERMISSIONS.RECRUITMENT.MODIFY);
  const canDelete = hasPermission(HR_PERMISSIONS.RECRUITMENT.REMOVE);

  const sourceFilter = searchParams.get('source') ?? '';

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const PAGE_SIZE = 20;
  const {
    data: infiniteData,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['candidates', 'infinite', sourceFilter, searchQuery],
    queryFn: async ({ pageParam = 1 }) => {
      return recruitmentService.listCandidates({
        page: pageParam,
        perPage: PAGE_SIZE,
        source: sourceFilter || undefined,
        search: searchQuery || undefined,
      });
    },
    initialPageParam: 1,
    getNextPageParam: lastPage => {
      const currentPage = lastPage.meta?.page ?? lastPage.page ?? 1;
      const total = lastPage.meta?.totalPages ?? lastPage.totalPages ?? 1;
      return currentPage < total ? currentPage + 1 : undefined;
    },
  });

  const allItems = useMemo(
    () => infiniteData?.pages.flatMap(p => p.candidates ?? []) ?? [],
    [infiniteData]
  );

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

  const createMutation = useMutation({
    mutationFn: recruitmentService.createCandidate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      import('sonner').then(({ toast }) =>
        toast.success('Candidato criado com sucesso')
      );
    },
    onError: () => {
      import('sonner').then(({ toast }) =>
        toast.error('Erro ao criar candidato')
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: recruitmentService.deleteCandidate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      import('sonner').then(({ toast }) =>
        toast.success('Candidato excluído com sucesso')
      );
    },
    onError: () => {
      import('sonner').then(({ toast }) =>
        toast.error('Erro ao excluir candidato')
      );
    },
  });

  const page = useEntityPage<Candidate>({
    entityName: 'Candidato',
    entityNamePlural: 'Candidatos',
    queryKey: ['candidates'],
    crud: {
      items: allItems,
      isLoading,
      error: error as Error | null,
      refetch: () =>
        queryClient.invalidateQueries({ queryKey: ['candidates'] }),
      isCreating: createMutation.isPending,
      isUpdating: false,
      isDuplicating: false,
      isDeleting: deleteMutation.isPending,
      create: async () => ({}) as Candidate,
      update: async () => ({}) as Candidate,
      delete: async (id: string) => {
        await deleteMutation.mutateAsync(id);
      },
    } as never,
    viewRoute: id => `/hr/recruitment/candidates/${id}`,
    editRoute: id => `/hr/recruitment/candidates/${id}/edit`,
    filterFn: (item, query) => {
      const q = query.toLowerCase();
      return Boolean(
        item.fullName.toLowerCase().includes(q) ||
          item.email.toLowerCase().includes(q)
      );
    },
  });

  const selectedIds = Array.from(page.selection?.state.selectedIds || []);
  const hasSelection = selectedIds.length > 0;
  const initialIds = useMemo(() => allItems.map(i => i.id), [allItems]);

  const getActions = useCallback(
    (item: Candidate) => {
      const actions: Array<{
        id: string;
        label: string;
        onClick: () => void;
        variant?: 'destructive';
        separator?: 'before';
      }> = [];

      if (canDelete) {
        actions.push({
          id: 'delete',
          label: 'Excluir',
          variant: 'destructive',
          separator: 'before',
          onClick: () => {
            setDeleteId(item.id);
            setIsDeleteOpen(true);
          },
        });
      }

      return actions;
    },
    [canDelete]
  );

  const renderGridCard = (item: Candidate, isSelected: boolean) => {
    const appCount = item._count?.applications ?? 0;

    return (
      <EntityContextMenu
        itemId={item.id}
        onView={canView ? ids => page.handlers.handleItemsView(ids) : undefined}
        onEdit={
          canModify ? ids => page.handlers.handleItemsEdit(ids) : undefined
        }
        actions={getActions(item)}
      >
        <EntityCard
          id={item.id}
          variant="grid"
          title={item.fullName}
          subtitle={item.email}
          icon={User}
          iconBgColor="bg-linear-to-br from-teal-500 to-teal-600"
          badges={[
            {
              label: CANDIDATE_SOURCE_LABELS[item.source],
              variant: 'outline',
            },
            ...(item.tags?.length
              ? [
                  {
                    label: `${item.tags.length} tag${item.tags.length > 1 ? 's' : ''}`,
                    variant: 'secondary' as const,
                  },
                ]
              : []),
          ]}
          footer={{
            type: 'split',
            left: {
              icon: Mail,
              label: item.email,
              color: 'cyan',
            },
            right: {
              icon: Briefcase,
              label: `${appCount} candidatura${appCount !== 1 ? 's' : ''}`,
              color: 'violet',
            },
          }}
          isSelected={isSelected}
          showSelection={false}
          clickable={false}
          createdAt={item.createdAt}
          updatedAt={item.updatedAt}
          showStatusBadges={true}
        />
      </EntityContextMenu>
    );
  };

  const renderListCard = (item: Candidate, isSelected: boolean) => {
    const appCount = item._count?.applications ?? 0;

    return (
      <EntityContextMenu
        itemId={item.id}
        onView={canView ? ids => page.handlers.handleItemsView(ids) : undefined}
        onEdit={
          canModify ? ids => page.handlers.handleItemsEdit(ids) : undefined
        }
        actions={getActions(item)}
      >
        <EntityCard
          id={item.id}
          variant="list"
          title={item.fullName}
          subtitle={item.email}
          icon={User}
          iconBgColor="bg-linear-to-br from-teal-500 to-teal-600"
          badges={[
            {
              label: CANDIDATE_SOURCE_LABELS[item.source],
              variant: 'outline',
            },
          ]}
          footer={{
            type: 'split',
            left: {
              icon: Mail,
              label: item.email,
              color: 'cyan',
            },
            right: {
              icon: Briefcase,
              label: `${appCount} candidatura${appCount !== 1 ? 's' : ''}`,
              color: 'violet',
            },
          }}
          isSelected={isSelected}
          showSelection={false}
          clickable={false}
          createdAt={item.createdAt}
          updatedAt={item.updatedAt}
          showStatusBadges={true}
        />
      </EntityContextMenu>
    );
  };

  return (
    <CoreProvider
      selection={{
        namespace: 'candidates',
        initialIds,
      }}
    >
      <PageLayout>
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'RH', href: '/hr' },
              { label: 'Recrutamento', href: '/hr/recruitment' },
              { label: 'Candidatos', href: '/hr/recruitment/candidates' },
            ]}
            buttons={[
              ...(canCreate
                ? [
                    {
                      id: 'create',
                      title: 'Novo Candidato',
                      icon: Plus,
                      onClick: () => setIsCreateOpen(true),
                      variant: 'default' as const,
                    },
                  ]
                : []),
            ]}
          />

          <Header
            title="Candidatos"
            description="Gerencie os candidatos do banco de talentos"
          />
        </PageHeader>

        <PageBody>
          <SearchBar
            placeholder="Buscar candidatos..."
            value={searchQuery}
            onSearch={setSearchQuery}
            onClear={() => setSearchQuery('')}
            showClear={true}
            size="md"
          />

          {isLoading ? (
            <GridLoading count={9} layout="grid" size="md" gap="gap-4" />
          ) : error ? (
            <GridError
              type="server"
              title="Erro ao carregar candidatos"
              message="Ocorreu um erro ao tentar carregar os candidatos."
              action={{
                label: 'Tentar Novamente',
                onClick: () =>
                  queryClient.invalidateQueries({
                    queryKey: ['candidates'],
                  }),
              }}
            />
          ) : (
            <EntityGrid
              config={candidatesConfig}
              items={allItems}
              toolbarStart={
                <FilterDropdown
                  label="Origem"
                  icon={Tag}
                  options={CANDIDATE_SOURCE_OPTIONS.map(o => ({
                    id: o.value,
                    label: o.label,
                  }))}
                  selected={sourceFilter ? [sourceFilter] : []}
                  onSelectionChange={ids => {
                    const val = ids[0] ?? '';
                    router.push(
                      val
                        ? `/hr/recruitment/candidates?source=${val}`
                        : '/hr/recruitment/candidates'
                    );
                  }}
                  activeColor="cyan"
                  searchPlaceholder="Buscar origem..."
                  emptyText="Nenhuma origem encontrada."
                />
              }
              renderGridItem={renderGridCard}
              renderListItem={renderListCard}
              isLoading={isLoading}
              isSearching={!!searchQuery}
              onItemClick={(item, e) => page.handlers.handleItemClick(item, e)}
              onItemDoubleClick={item =>
                page.handlers.handleItemDoubleClick(item)
              }
              showSorting={true}
              defaultSortField="name"
              defaultSortDirection="asc"
            />
          )}

          <div ref={sentinelRef} className="h-1" />
          {isFetchingNextPage && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {hasSelection && (
            <SelectionToolbar
              selectedIds={selectedIds}
              totalItems={allItems.length}
              onClear={() => page.selection?.actions.clear()}
              onSelectAll={() => page.selection?.actions.selectAll()}
              defaultActions={{
                view: canView,
                edit: canModify,
                delete: canDelete,
              }}
              handlers={{
                onView: page.handlers.handleItemsView,
                onEdit: page.handlers.handleItemsEdit,
                onDelete: ids => {
                  setDeleteId(ids[0]);
                  setIsDeleteOpen(true);
                },
              }}
            />
          )}

          <CreateCandidateModal
            isOpen={isCreateOpen}
            onClose={() => setIsCreateOpen(false)}
            isSubmitting={createMutation.isPending}
            onSubmit={async data => {
              await createMutation.mutateAsync(data);
            }}
          />

          <VerifyActionPinModal
            isOpen={isDeleteOpen}
            onClose={() => {
              setIsDeleteOpen(false);
              setDeleteId(null);
            }}
            onSuccess={() => {
              if (deleteId) deleteMutation.mutate(deleteId);
              setIsDeleteOpen(false);
              setDeleteId(null);
            }}
            title="Excluir Candidato"
            description="Digite seu PIN de ação para excluir este candidato. Esta ação não pode ser desfeita."
          />
        </PageBody>
      </PageLayout>
    </CoreProvider>
  );
}
