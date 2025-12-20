/**
 * OpenSea OS - Enterprises Page
 * Página de gerenciamento de empresas usando o novo sistema OpenSea OS
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  CoreProvider,
  EntityContextMenu,
  EntityGrid,
  SelectionToolbar,
  UniversalCard,
  useEntityCrud,
  useEntityPage,
} from '@/core';
import { enterprisesService } from '@/services/hr';
import type { Enterprise } from '@/types/hr';
import {
  Building2,
  Calendar,
  Plus,
  RefreshCcwDot,
  Search,
} from 'lucide-react';
import { useMemo } from 'react';
import {
  CreateModal,
  createEnterprise,
  DeleteConfirmModal,
  deleteEnterprise,
  DuplicateConfirmModal,
  duplicateEnterprise,
  EditModal,
  enterprisesConfig,
  formatCnpj,
  updateEnterprise,
  ViewModal,
} from './src';

export default function EnterprisesPage() {
  // ============================================================================
  // CRUD SETUP
  // ============================================================================

  const crud = useEntityCrud<Enterprise>({
    entityName: 'Empresa',
    entityNamePlural: 'Empresas',
    queryKey: ['enterprises'],
    baseUrl: '/api/v1/hr/enterprises',
    listFn: async () => {
      const response = await enterprisesService.listEnterprises(1, 100);
      return response.enterprises;
    },
    getFn: (id: string) =>
      enterprisesService.getEnterprise(id).then(r => r.enterprise),
    createFn: createEnterprise,
    updateFn: updateEnterprise,
    deleteFn: deleteEnterprise,
    duplicateFn: duplicateEnterprise,
  });

  // ============================================================================
  // PAGE SETUP
  // ============================================================================

  const page = useEntityPage<Enterprise>({
    entityName: 'Empresa',
    entityNamePlural: 'Empresas',
    queryKey: ['enterprises'],
    crud,
    viewRoute: id => `/hr/enterprises/${id}`,
    filterFn: (item, query) => {
      const q = query.toLowerCase();
      return (
        item.legalName.toLowerCase().includes(q) ||
        item.cnpj.toLowerCase().includes(q) ||
        (item.city?.toLowerCase().includes(q) ?? false)
      );
    },
    duplicateConfig: {
      getNewName: item => `${item.legalName} (cópia)`,
      getData: item => ({
        legalName: `${item.legalName} (cópia)`,
        cnpj: item.cnpj,
        taxRegime: item.taxRegime,
        phone: item.phone,
        address: item.address,
        addressNumber: item.addressNumber,
        complement: item.complement,
        neighborhood: item.neighborhood,
        city: item.city,
        state: item.state,
        zipCode: item.zipCode,
        country: item.country,
        logoUrl: item.logoUrl,
      }),
    },
  });

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleContextView = (ids: string[]) => {
    page.handlers.handleItemsView(ids);
  };

  const handleContextEdit = (ids: string[]) => {
    page.handlers.handleItemsEdit(ids);
  };

  const handleContextDuplicate = (ids: string[]) => {
    page.handlers.handleItemsDuplicate(ids);
  };

  const handleContextDelete = (ids: string[]) => {
    page.modals.setItemsToDelete(ids);
    page.modals.open('delete');
  };

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const calculatePendencies = (enterprise: Enterprise): number => {
    let count = 0;
    if (!enterprise.legalName) count++;
    if (!enterprise.cnpj) count++;
    if (!enterprise.taxRegime) count++;
    if (!enterprise.address) count++;
    if (!enterprise.city) count++;
    if (!enterprise.state) count++;
    return count;
  };

  const renderGridCard = (item: Enterprise, isSelected: boolean) => {
    const pendencies = calculatePendencies(item);

    return (
      <EntityContextMenu
        itemId={item.id}
        onView={handleContextView}
        onEdit={handleContextEdit}
        onDuplicate={handleContextDuplicate}
        onDelete={handleContextDelete}
      >
        <UniversalCard
          id={item.id}
          variant="grid"
          title={item.legalName}
          subtitle={formatCnpj(item.cnpj)}
          icon={Building2}
          iconBgColor="bg-linear-to-br from-blue-500 to-cyan-600"
          badges={[
            ...(pendencies > 0
              ? [
                  {
                    label: `${pendencies} pendência${pendencies > 1 ? 's' : ''}`,
                    variant: 'destructive' as const,
                  },
                ]
              : []),
            ...(item.taxRegime
              ? [
                  {
                    label: item.taxRegime,
                    variant: 'secondary' as const,
                  },
                ]
              : []),
          ]}
          metadata={
            <div className="flex items-center gap-4 text-xs">
              {item.createdAt && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-blue-500" />
                  Criado em{' '}
                  {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                </span>
              )}
              {item.updatedAt && item.updatedAt !== item.createdAt && (
                <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                  <RefreshCcwDot className="h-3 w-3" />
                  Atualizado em{' '}
                  {new Date(item.updatedAt).toLocaleDateString('pt-BR')}
                </span>
              )}
            </div>
          }
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

  const renderListCard = (item: Enterprise, isSelected: boolean) => {
    const pendencies = calculatePendencies(item);

    return (
      <EntityContextMenu
        itemId={item.id}
        onView={handleContextView}
        onEdit={handleContextEdit}
        onDuplicate={handleContextDuplicate}
        onDelete={handleContextDelete}
      >
        <UniversalCard
          id={item.id}
          variant="list"
          title={item.legalName}
          subtitle={formatCnpj(item.cnpj)}
          icon={Building2}
          iconBgColor="bg-linear-to-br from-blue-500 to-cyan-600"
          badges={[
            ...(pendencies > 0
              ? [
                  {
                    label: `${pendencies} pendência${pendencies > 1 ? 's' : ''}`,
                    variant: 'destructive' as const,
                  },
                ]
              : []),
            ...(item.taxRegime
              ? [
                  {
                    label: item.taxRegime,
                    variant: 'secondary' as const,
                  },
                ]
              : []),
          ]}
          metadata={
            <div className="flex items-center gap-4 text-xs">
              {item.city && <span>{item.city}</span>}
              {item.createdAt && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-blue-500" />
                  Criado em{' '}
                  {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                </span>
              )}
            </div>
          }
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

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const selectedIds = Array.from(page.selection?.state.selectedIds || []);
  const hasSelection = selectedIds.length > 0;

  const initialIds = useMemo(
    () => page.filteredItems.map(i => i.id),
    [page.filteredItems]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <CoreProvider
      selection={{
        namespace: 'enterprises',
        initialIds,
      }}
    >
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-gray-50 to-cyan-50 dark:from-gray-900 dark:via-slate-900 dark:to-slate-800 px-6">
        <div className="max-w-8xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Empresas
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gerencie o cadastro de empresas do sistema
              </p>
            </div>
            <Button
              onClick={() => page.modals.open('create')}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Nova Empresa
            </Button>
          </div>

          {/* Search Bar */}
          <Card className="p-4 backdrop-blur-xl bg-white/40 dark:bg-white/5 border-gray-200/50 dark:border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
              <Input
                type="text"
                placeholder={enterprisesConfig.display.labels.searchPlaceholder}
                value={page.searchQuery}
                onChange={e => page.handlers.handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </Card>

          {/* Grid */}
          {page.isLoading ? (
            <Card className="p-12 text-center backdrop-blur-xl bg-white/80 dark:bg-white/5 border-gray-200/50 dark:border-white/10">
              <p className="text-gray-600 dark:text-white/60">Carregando...</p>
            </Card>
          ) : page.error ? (
            <Card className="p-12 text-center backdrop-blur-xl bg-white/80 dark:bg-white/5 border-gray-200/50 dark:border-white/10">
              <p className="text-destructive">Erro ao carregar empresas</p>
            </Card>
          ) : (
            <EntityGrid
              config={enterprisesConfig}
              items={page.filteredItems}
              renderGridItem={renderGridCard}
              renderListItem={renderListCard}
              isLoading={page.isLoading}
              isSearching={!!page.searchQuery}
              onItemClick={(item, e) =>
                page.handlers.handleItemClick(item, e)
              }
              onItemDoubleClick={item =>
                page.handlers.handleItemDoubleClick(item)
              }
            />
          )}

          {/* Selection Toolbar */}
          {hasSelection && (
            <SelectionToolbar
              selectedIds={selectedIds}
              totalItems={page.filteredItems.length}
              onClear={() => page.selection?.actions.clear()}
              onSelectAll={() => page.selection?.actions.selectAll()}
              defaultActions={{
                view: true,
                edit: true,
                duplicate: true,
                delete: true,
              }}
              handlers={{
                onView: page.handlers.handleItemsView,
                onEdit: page.handlers.handleItemsEdit,
                onDuplicate: page.handlers.handleItemsDuplicate,
                onDelete: page.handlers.handleItemsDelete,
              }}
            />
          )}

          {/* View Modal */}
          <ViewModal
            isOpen={page.modals.isOpen('view')}
            onClose={() => page.modals.close('view')}
            enterprise={page.modals.viewingItem}
          />

          {/* Create Modal */}
          <CreateModal
            isOpen={page.modals.isOpen('create')}
            onClose={() => page.modals.close('create')}
            isSubmitting={crud.isCreating}
            onSubmit={async data => {
              await crud.create(data);
            }}
          />

          {/* Edit Modal */}
          <EditModal
            isOpen={page.modals.isOpen('edit')}
            onClose={() => page.modals.close('edit')}
            enterprise={page.modals.editingItem}
            isSubmitting={crud.isUpdating}
            onSubmit={async (id, data) => {
              await crud.update(id, data);
            }}
          />

          {/* Delete Confirmation */}
          <DeleteConfirmModal
            isOpen={page.modals.isOpen('delete')}
            onClose={() => page.modals.close('delete')}
            itemCount={page.modals.itemsToDelete.length}
            onConfirm={page.handlers.handleDeleteConfirm}
            isLoading={crud.isDeleting}
          />

          {/* Duplicate Confirmation */}
          <DuplicateConfirmModal
            isOpen={page.modals.isOpen('duplicate')}
            onClose={() => page.modals.close('duplicate')}
            itemCount={page.modals.itemsToDuplicate.length}
            onConfirm={page.handlers.handleDuplicateConfirm}
            isLoading={crud.isDuplicating}
          />
        </div>
      </div>
    </CoreProvider>
  );
}
