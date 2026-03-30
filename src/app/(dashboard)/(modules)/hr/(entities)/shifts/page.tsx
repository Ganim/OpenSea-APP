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
import type { HeaderButton } from '@/components/layout/types/header.types';
import { VerifyActionPinModal } from '@/components/modals/verify-action-pin-modal';
import {
  CoreProvider,
  EntityCard,
  EntityContextMenu,
  EntityGrid,
  SelectionToolbar,
  useEntityCrud,
  useEntityPage,
} from '@/core';
import { usePermissions } from '@/hooks/use-permissions';
import type { Shift } from '@/types/hr';
import {
  Clock,
  Coffee,
  Loader2,
  Moon,
  Plus,
  Trash2,
  Timer,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { Suspense, useCallback, useMemo } from 'react';
import {
  shiftsApi,
  shiftsConfig,
  shiftKeys,
  SHIFT_TYPE_LABELS,
} from './src';

const CreateShiftModal = dynamic(
  () =>
    import('./src/modals/create-modal').then(m => ({
      default: m.CreateShiftModal,
    })),
  { ssr: false }
);

export default function ShiftsPage() {
  return (
    <Suspense
      fallback={<GridLoading count={9} layout="grid" size="md" gap="gap-4" />}
    >
      <ShiftsPageContent />
    </Suspense>
  );
}

type ActionButtonWithPermission = HeaderButton & {
  permission?: string;
};

function ShiftsPageContent() {
  const { hasPermission } = usePermissions();

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const {
    data: shiftsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: shiftKeys.list(),
    queryFn: async () => {
      const response = await shiftsApi.list();
      return response.shifts;
    },
  });

  const allShifts = shiftsData ?? [];

  // ============================================================================
  // CRUD SETUP
  // ============================================================================

  const crud = useEntityCrud<Shift>({
    entityName: 'Turno',
    entityNamePlural: 'Turnos',
    queryKey: shiftKeys.all as unknown as string[],
    baseUrl: '/api/v1/hr/shifts',
    listFn: async () => allShifts,
    getFn: async (id: string) => {
      const response = await shiftsApi.get(id);
      return response.shift;
    },
    createFn: async (data: Record<string, unknown>) =>
      shiftsApi.create(data as unknown as Parameters<typeof shiftsApi.create>[0]),
    updateFn: async (id: string, data: Record<string, unknown>) =>
      shiftsApi.update(id, data as unknown as Parameters<typeof shiftsApi.update>[1]),
    deleteFn: shiftsApi.delete,
  });

  // ============================================================================
  // PAGE SETUP
  // ============================================================================

  const page = useEntityPage<Shift>({
    entityName: 'Turno',
    entityNamePlural: 'Turnos',
    queryKey: shiftKeys.all as unknown as string[],
    crud,
    viewRoute: id => `/hr/shifts/${id}`,
    editRoute: id => `/hr/shifts/${id}/edit`,
    filterFn: (item, query) => {
      const q = query.toLowerCase();
      return Boolean(
        item.name.toLowerCase().includes(q) ||
          (item.code && item.code.toLowerCase().includes(q)) ||
          SHIFT_TYPE_LABELS[item.type]?.toLowerCase().includes(q)
      );
    },
  });

  // ============================================================================
  // HELPERS
  // ============================================================================

  function formatDuration(hours: number): string {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `${h}h${m}min` : `${h}h`;
  }

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleContextView = (ids: string[]) => {
    page.handlers.handleItemsView(ids);
  };

  const handleContextEdit = (ids: string[]) => {
    page.handlers.handleItemsEdit(ids);
  };

  const handleContextDelete = (ids: string[]) => {
    page.modals.setItemsToDelete(ids);
    page.modals.open('delete');
  };

  // ============================================================================
  // CONTEXT MENU ACTIONS
  // ============================================================================

  const contextActions = useMemo(
    () => [
      {
        id: 'delete',
        label: 'Excluir',
        icon: Trash2,
        onClick: handleContextDelete,
        separator: 'before' as const,
        variant: 'destructive' as const,
      },
    ],
    []
  );

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderGridCard = (item: Shift, isSelected: boolean) => {
    return (
      <EntityContextMenu
        itemId={item.id}
        onView={handleContextView}
        onEdit={handleContextEdit}
        actions={contextActions}
      >
        <EntityCard
          id={item.id}
          variant="grid"
          title={item.name}
          subtitle={`${item.startTime} — ${item.endTime}`}
          icon={item.isNightShift ? Moon : Clock}
          iconBgColor="bg-linear-to-br from-sky-500 to-indigo-600"
          badges={[
            {
              label: SHIFT_TYPE_LABELS[item.type] || item.type,
              variant: 'default' as const,
            },
            ...(item.isNightShift
              ? [
                  {
                    label: 'Noturno',
                    variant: 'secondary' as const,
                  },
                ]
              : []),
            ...(!item.isActive
              ? [{ label: 'Inativo', variant: 'secondary' as const }]
              : []),
          ]}
          footer={{
            type: 'split',
            left: {
              icon: Timer,
              label: formatDuration(item.durationHours),
              color: 'cyan',
            },
            right: {
              icon: Coffee,
              label: `${item.breakMinutes}min`,
              color: 'cyan',
            },
          }}
          isSelected={isSelected}
          showSelection={false}
          clickable={false}
          createdAt={item.createdAt}
          updatedAt={item.updatedAt}
          showStatusBadges={false}
        />
      </EntityContextMenu>
    );
  };

  const renderListCard = (item: Shift, isSelected: boolean) => {
    return (
      <EntityContextMenu
        itemId={item.id}
        onView={handleContextView}
        onEdit={handleContextEdit}
        actions={contextActions}
      >
        <EntityCard
          id={item.id}
          variant="list"
          title={item.name}
          subtitle={`${item.startTime} — ${item.endTime} | ${SHIFT_TYPE_LABELS[item.type]}`}
          icon={item.isNightShift ? Moon : Clock}
          iconBgColor="bg-linear-to-br from-sky-500 to-indigo-600"
          badges={[
            {
              label: SHIFT_TYPE_LABELS[item.type] || item.type,
              variant: 'default' as const,
            },
            ...(!item.isActive
              ? [{ label: 'Inativo', variant: 'secondary' as const }]
              : []),
          ]}
          footer={{
            type: 'split',
            left: {
              icon: Timer,
              label: formatDuration(item.durationHours),
              color: 'cyan',
            },
            right: {
              icon: Coffee,
              label: `${item.breakMinutes}min`,
              color: 'cyan',
            },
          }}
          isSelected={isSelected}
          showSelection={false}
          clickable={false}
          createdAt={item.createdAt}
          updatedAt={item.updatedAt}
          showStatusBadges={false}
        />
      </EntityContextMenu>
    );
  };

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const selectedIds = Array.from(page.selection?.state.selectedIds || []);
  const hasSelection = selectedIds.length > 0;
  const displayedItems = page.filteredItems || [];

  const initialIds = useMemo(
    () => displayedItems.map(i => i.id),
    [displayedItems]
  );

  // ============================================================================
  // HEADER BUTTONS
  // ============================================================================

  const handleCreate = useCallback(() => {
    page.modals.open('create');
  }, [page.modals]);

  const actionButtons = useMemo<ActionButtonWithPermission[]>(
    () => [
      {
        id: 'create-shift',
        title: 'Novo Turno',
        icon: Plus,
        onClick: handleCreate,
        variant: 'default',
        permission: shiftsConfig.permissions?.create,
      },
    ],
    [handleCreate]
  );

  const visibleActionButtons = useMemo<HeaderButton[]>(
    () =>
      actionButtons
        .filter(button =>
          button.permission ? hasPermission(button.permission) : true
        )
        .map(({ permission, ...button }) => button),
    [actionButtons, hasPermission]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <CoreProvider
      selection={{
        namespace: 'shifts',
        initialIds,
      }}
    >
      <PageLayout>
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'RH', href: '/hr' },
              { label: 'Turnos', href: '/hr/shifts' },
            ]}
            buttons={visibleActionButtons}
          />

          <Header
            title="Turnos de Trabalho"
            description="Gerencie os turnos e horários da equipe"
          />
        </PageHeader>

        <PageBody>
          <SearchBar
            placeholder={shiftsConfig.display.labels.searchPlaceholder}
            value={page.searchQuery}
            onSearch={value => page.handlers.handleSearch(value)}
            onClear={() => page.handlers.handleSearch('')}
            showClear={true}
            size="md"
          />

          {isLoading ? (
            <GridLoading count={9} layout="grid" size="md" gap="gap-4" />
          ) : error ? (
            <GridError
              type="server"
              title="Erro ao carregar turnos"
              message="Ocorreu um erro ao tentar carregar os turnos. Por favor, tente novamente."
              action={{
                label: 'Tentar Novamente',
                onClick: () => { refetch(); },
              }}
            />
          ) : (
            <EntityGrid
              config={shiftsConfig}
              items={displayedItems}
              renderGridItem={renderGridCard}
              renderListItem={renderListCard}
              isLoading={isLoading}
              isSearching={!!page.searchQuery}
              onItemClick={(item, e) => page.handlers.handleItemClick(item, e)}
              onItemDoubleClick={item =>
                page.handlers.handleItemDoubleClick(item)
              }
              showSorting={true}
              defaultSortField="name"
              defaultSortDirection="asc"
            />
          )}

          {hasSelection && (
            <SelectionToolbar
              selectedIds={selectedIds}
              totalItems={displayedItems.length}
              onClear={() => page.selection?.actions.clear()}
              onSelectAll={() => page.selection?.actions.selectAll()}
              defaultActions={{
                view: true,
                edit: true,
                delete: true,
              }}
              handlers={{
                onView: page.handlers.handleItemsView,
                onEdit: page.handlers.handleItemsEdit,
                onDelete: page.handlers.handleItemsDelete,
              }}
            />
          )}

          <CreateShiftModal
            isOpen={page.modals.isOpen('create')}
            onClose={() => page.modals.close('create')}
            onSubmit={async data => {
              await crud.create(data as unknown as Record<string, unknown>);
            }}
            isLoading={crud.isCreating}
          />

          <VerifyActionPinModal
            isOpen={page.modals.isOpen('delete')}
            onClose={() => page.modals.close('delete')}
            onSuccess={() => page.handlers.handleDeleteConfirm()}
            title="Confirmar Exclusão"
            description={
              page.modals.itemsToDelete.length === 1
                ? 'Digite seu PIN de ação para excluir este turno. Esta ação não pode ser desfeita.'
                : `Digite seu PIN de ação para excluir ${page.modals.itemsToDelete.length} turnos. Esta ação não pode ser desfeita.`
            }
          />
        </PageBody>
      </PageLayout>
    </CoreProvider>
  );
}
