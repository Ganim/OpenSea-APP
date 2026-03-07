/**
 * OpenSea OS - Finance Categories Page
 * Página de gerenciamento de categorias financeiras usando o sistema OpenSea OS
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
import type { HeaderButton } from '@/components/layout/types/header.types';
import { VerifyActionPinModal } from '@/components/modals/verify-action-pin-modal';
import { FINANCE_PERMISSIONS } from '@/config/rbac/permission-codes';
import {
  CoreProvider,
  EntityCard,
  EntityContextMenu,
  EntityGrid,
} from '@/core';
import {
  useCreateFinanceCategory,
  useDeleteFinanceCategory,
  useFinanceCategories,
} from '@/hooks/finance';
import { usePermissions } from '@/hooks/use-permissions';
import type { FinanceCategory } from '@/types/finance';
import { FINANCE_CATEGORY_TYPE_LABELS } from '@/types/finance';
import { ArrowDownAZ, Calendar, Layers, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { CreateCategoryModal, financeCategoriesConfig } from './src';

export default function FinanceCategoriesPage() {
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const { data, isLoading, error, refetch } = useFinanceCategories();
  const createMutation = useCreateFinanceCategory();
  const deleteMutation = useDeleteFinanceCategory();

  // ============================================================================
  // PERMISSIONS
  // ============================================================================

  const canCreate = hasPermission(FINANCE_PERMISSIONS.CATEGORIES.CREATE);
  const canView = hasPermission(FINANCE_PERMISSIONS.CATEGORIES.READ);
  const canEdit = hasPermission(FINANCE_PERMISSIONS.CATEGORIES.UPDATE);
  const canDelete = hasPermission(FINANCE_PERMISSIONS.CATEGORIES.DELETE);

  // ============================================================================
  // STATE
  // ============================================================================

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isPinOpen, setIsPinOpen] = useState(false);

  // ============================================================================
  // DATA
  // ============================================================================

  const categories = data?.categories ?? [];

  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories;
    const q = searchQuery.toLowerCase();
    return categories.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        FINANCE_CATEGORY_TYPE_LABELS[c.type].toLowerCase().includes(q)
    );
  }, [categories, searchQuery]);

  const nextDisplayOrder = useMemo(() => {
    if (categories.length === 0) return 1;
    return Math.max(...categories.map(c => c.displayOrder)) + 1;
  }, [categories]);

  const initialIds = useMemo(
    () => filteredCategories.map(c => c.id),
    [filteredCategories]
  );

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleCreate = useCallback(
    async (formData: {
      name: string;
      type: FinanceCategory['type'];
      description?: string;
      displayOrder?: number;
    }) => {
      try {
        await createMutation.mutateAsync(formData);
        toast.success('Categoria criada com sucesso!');
        setIsCreateOpen(false);
      } catch {
        toast.error('Erro ao criar categoria.');
      }
    },
    [createMutation]
  );

  const handleDeleteRequest = useCallback((id: string) => {
    setDeleteTarget(id);
    setIsPinOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget);
      toast.success('Categoria excluída com sucesso!');
      setDeleteTarget(null);
    } catch {
      toast.error('Erro ao excluir categoria.');
    }
  }, [deleteTarget, deleteMutation]);

  const handleView = useCallback(
    (ids: string[]) => {
      router.push(`/finance/categories/${ids[0]}`);
    },
    [router]
  );

  const handleEdit = useCallback(
    (ids: string[]) => {
      router.push(`/finance/categories/${ids[0]}`);
    },
    [router]
  );

  const handleContextDelete = useCallback(
    (ids: string[]) => {
      handleDeleteRequest(ids[0]);
    },
    [handleDeleteRequest]
  );

  // ============================================================================
  // SORT OPTIONS
  // ============================================================================

  const sortOptions = useMemo(
    () => [
      {
        field: 'custom' as const,
        direction: 'asc' as const,
        label: 'Nome (A-Z)',
        icon: ArrowDownAZ,
      },
      {
        field: 'custom' as const,
        direction: 'desc' as const,
        label: 'Nome (Z-A)',
        icon: ArrowDownAZ,
      },
      {
        field: 'createdAt' as const,
        direction: 'desc' as const,
        label: 'Mais recentes',
        icon: Calendar,
      },
      {
        field: 'createdAt' as const,
        direction: 'asc' as const,
        label: 'Mais antigos',
        icon: Calendar,
      },
    ],
    []
  );

  // ============================================================================
  // HELPERS
  // ============================================================================

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'EXPENSE':
        return 'destructive' as const;
      case 'REVENUE':
        return 'default' as const;
      case 'BOTH':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  const getIconGradient = (type: string) => {
    switch (type) {
      case 'EXPENSE':
        return 'bg-linear-to-br from-red-500 to-rose-600';
      case 'REVENUE':
        return 'bg-linear-to-br from-green-500 to-emerald-600';
      case 'BOTH':
        return 'bg-linear-to-br from-blue-500 to-indigo-600';
      default:
        return 'bg-linear-to-br from-gray-500 to-gray-600';
    }
  };

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderGridCard = (item: FinanceCategory, isSelected: boolean) => (
    <EntityContextMenu
      itemId={item.id}
      {...(canView ? { onView: handleView } : {})}
      {...(canEdit ? { onEdit: handleEdit } : {})}
      {...(canDelete ? { onDelete: handleContextDelete } : {})}
    >
      <EntityCard
        id={item.id}
        variant="grid"
        title={item.name}
        subtitle={FINANCE_CATEGORY_TYPE_LABELS[item.type]}
        icon={Layers}
        iconBgColor={getIconGradient(item.type)}
        badges={[
          {
            label: FINANCE_CATEGORY_TYPE_LABELS[item.type],
            variant: getTypeBadgeVariant(item.type),
          },
          {
            label: item.isActive ? 'Ativo' : 'Inativo',
            variant: item.isActive ? 'default' : 'secondary',
          },
          ...(item.isSystem
            ? [{ label: 'Sistema', variant: 'outline' as const }]
            : []),
        ]}
        isSelected={isSelected}
        showSelection={false}
        clickable={false}
        createdAt={item.createdAt}
        updatedAt={item.updatedAt}
      >
        {item.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {item.description}
          </p>
        )}
      </EntityCard>
    </EntityContextMenu>
  );

  const renderListCard = (item: FinanceCategory, isSelected: boolean) => (
    <EntityContextMenu
      itemId={item.id}
      {...(canView ? { onView: handleView } : {})}
      {...(canEdit ? { onEdit: handleEdit } : {})}
      {...(canDelete ? { onDelete: handleContextDelete } : {})}
    >
      <EntityCard
        id={item.id}
        variant="list"
        title={item.name}
        subtitle={FINANCE_CATEGORY_TYPE_LABELS[item.type]}
        icon={Layers}
        iconBgColor={getIconGradient(item.type)}
        badges={[
          {
            label: FINANCE_CATEGORY_TYPE_LABELS[item.type],
            variant: getTypeBadgeVariant(item.type),
          },
          {
            label: item.isActive ? 'Ativo' : 'Inativo',
            variant: item.isActive ? 'default' : 'secondary',
          },
          ...(item.isSystem
            ? [{ label: 'Sistema', variant: 'outline' as const }]
            : []),
        ]}
        isSelected={isSelected}
        showSelection={false}
        clickable={false}
        createdAt={item.createdAt}
        updatedAt={item.updatedAt}
      >
        {item.description && (
          <p className="text-sm text-muted-foreground line-clamp-1">
            {item.description}
          </p>
        )}
      </EntityCard>
    </EntityContextMenu>
  );

  // ============================================================================
  // HEADER BUTTONS
  // ============================================================================

  const actionButtons = useMemo<HeaderButton[]>(() => {
    const buttons: HeaderButton[] = [];
    if (canCreate) {
      buttons.push({
        id: 'create-category',
        title: 'Nova Categoria',
        icon: Plus,
        onClick: () => setIsCreateOpen(true),
        variant: 'default',
      });
    }
    return buttons;
  }, [canCreate]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <CoreProvider
      selection={{
        namespace: 'finance-categories',
        initialIds,
      }}
    >
      <PageLayout>
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'Financeiro', href: '/finance' },
              { label: 'Categorias', href: '/finance/categories' },
            ]}
            buttons={actionButtons}
          />

          <Header
            title="Categorias Financeiras"
            description="Gerencie as categorias de receitas e despesas"
          />
        </PageHeader>

        <PageBody>
          {/* Search Bar */}
          <SearchBar
            placeholder="Buscar por nome, descrição ou tipo..."
            value={searchQuery}
            onSearch={setSearchQuery}
            onClear={() => setSearchQuery('')}
            showClear
            size="md"
          />

          {/* Grid */}
          {isLoading ? (
            <GridLoading count={9} layout="grid" size="md" gap="gap-4" />
          ) : error ? (
            <GridError
              type="server"
              title="Erro ao carregar categorias"
              message="Ocorreu um erro ao tentar carregar as categorias. Por favor, tente novamente."
              action={{
                label: 'Tentar Novamente',
                onClick: () => { refetch() },
              }}
            />
          ) : (
            <EntityGrid
              config={financeCategoriesConfig}
              items={filteredCategories}
              renderGridItem={renderGridCard}
              renderListItem={renderListCard}
              isLoading={isLoading}
              isSearching={!!searchQuery}
              showSorting
              defaultSortField="custom"
              defaultSortDirection="asc"
              customSortOptions={sortOptions}
              customSortFn={(a, b, direction) => {
                const multiplier = direction === 'asc' ? 1 : -1;
                return a.name.localeCompare(b.name, 'pt-BR') * multiplier;
              }}
            />
          )}

          {/* Create Modal */}
          <CreateCategoryModal
            isOpen={isCreateOpen}
            onClose={() => setIsCreateOpen(false)}
            onSubmit={handleCreate}
            isSubmitting={createMutation.isPending}
            nextDisplayOrder={nextDisplayOrder}
          />

          {/* Delete PIN Verification */}
          <VerifyActionPinModal
            isOpen={isPinOpen}
            onClose={() => {
              setIsPinOpen(false);
              setDeleteTarget(null);
            }}
            onSuccess={handleDeleteConfirm}
            title="Excluir Categoria"
            description="Digite seu PIN de Ação para confirmar a exclusão desta categoria."
          />
        </PageBody>
      </PageLayout>
    </CoreProvider>
  );
}
