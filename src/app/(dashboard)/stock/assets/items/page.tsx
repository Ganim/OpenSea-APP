/**
 * OpenSea OS - Items Page
 * Página de gerenciamento de itens usando o novo sistema OpenSea OS
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { itemsConfig } from '@/config/entities/items.config';
import {
    CoreProvider,
    EntityForm,
    EntityGrid,
    SelectionToolbar,
    UniversalCard,
    useEntityCrud,
    useEntityPage
} from '@/core';
import { itemsService } from '@/services/stock';
import type { Item } from '@/types/stock';
import { Box, Plus, Search } from 'lucide-react';
import { useMemo } from 'react';

export default function ItemsPage() {
  const crud = useEntityCrud<Item>({
    entityName: 'Item',
    entityNamePlural: 'Itens',
    queryKey: ['items'],
    baseUrl: '/api/v1/items',
    listFn: async () => {
      const response = await itemsService.listItems();
      return response.items;
    },
    getFn: (id: string) => itemsService.getItem(id).then(r => r.item),
    createFn: data => itemsService.registerEntry(data as any).then(r => r.item),
    updateFn: async () => {
      throw new Error(
        'Items não podem ser editados. Use movimentações de estoque.'
      );
    },
    deleteFn: async () => {
      throw new Error(
        'Items não podem ser excluídos. Use movimentações de estoque.'
      );
    },
  });

  const page = useEntityPage<Item>({
    entityName: 'Item',
    entityNamePlural: 'Itens',
    queryKey: ['items'],
    crud,
    viewRoute: (id) => `/stock/assets/items/${id}`,
    filterFn: (item, query) => {
      const q = query.toLowerCase();
      return (
        item.uniqueCode.toLowerCase().includes(q) ||
        (item.batchNumber?.toLowerCase().includes(q) ?? false)
      );
    },
  });

  const renderGridCard = (item: Item, isSelected: boolean) => {
    const statusLabels = {
      AVAILABLE: 'Disponível',
      RESERVED: 'Reservado',
      SOLD: 'Vendido',
      DAMAGED: 'Danificado',
    };

    return (
      <UniversalCard
        id={item.id}
        variant="grid"
        title={item.uniqueCode}
        subtitle={item.batchNumber || 'Sem lote'}
        icon={Box}
        iconBgColor="bg-gradient-to-br from-teal-500 to-cyan-600"
        badges={[
          {
            label: statusLabels[item.status] || item.status,
            variant: item.status === 'AVAILABLE' ? 'default' : 'secondary',
          },
          {
            label: `${item.currentQuantity} un`,
            variant: 'outline',
          },
        ]}
        metadata={
          <div className="flex items-center gap-4 text-xs">
            {item.entryDate && (
              <span>
                Entrada: {new Date(item.entryDate).toLocaleDateString()}
              </span>
            )}
          </div>
        }
        isSelected={isSelected}
        showSelection={true}
        onSelectionChange={checked => {
          if (page.selection) {
            if (checked) {
              page.selection.actions.select(item.id);
            } else {
              page.selection.actions.deselect(item.id);
            }
          }
        }}
        onClick={e => page.handlers.handleItemClick(item, e)}
        onDoubleClick={() => page.handlers.handleItemDoubleClick(item)}
        createdAt={item.createdAt}
        updatedAt={item.updatedAt}
        showStatusBadges={true}
      />
    );
  };

  const renderListCard = (item: Item, isSelected: boolean) => {
    const statusLabels = {
      AVAILABLE: 'Disponível',
      RESERVED: 'Reservado',
      SOLD: 'Vendido',
      DAMAGED: 'Danificado',
    };

    return (
      <UniversalCard
        id={item.id}
        variant="list"
        title={item.uniqueCode}
        subtitle={item.batchNumber || 'Sem lote'}
        icon={Box}
        iconBgColor="bg-gradient-to-br from-teal-500 to-cyan-600"
        badges={[
          {
            label: statusLabels[item.status] || item.status,
            variant: item.status === 'AVAILABLE' ? 'default' : 'secondary',
          },
        ]}
        metadata={
          <>
            <span className="text-xs">{item.currentQuantity} unidades</span>
          </>
        }
        isSelected={isSelected}
        showSelection={true}
        onSelectionChange={checked => {
          if (page.selection) {
            if (checked) {
              page.selection.actions.select(item.id);
            } else {
              page.selection.actions.deselect(item.id);
            }
          }
        }}
        onClick={e => page.handlers.handleItemClick(item, e)}
        onDoubleClick={() => page.handlers.handleItemDoubleClick(item)}
        createdAt={item.createdAt}
        updatedAt={item.updatedAt}
        showStatusBadges={true}
      />
    );
  };

  const selectedIds = Array.from(page.selection?.state.selectedIds || []);
  const hasSelection = selectedIds.length > 0;

  const initialIds = useMemo(
    () => page.filteredItems.map(i => i.id),
    [page.filteredItems]
  );

  return (
    <CoreProvider
      selection={{
        namespace: 'items',
        initialIds,
      }}
    >
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-gray-50 to-cyan-50 dark:from-gray-900 dark:via-slate-900 dark:to-slate-800 p-6">
        <div className="max-w-8xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Itens
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gerencie os itens físicos do estoque
              </p>
            </div>
            <Button
              onClick={() => page.modals.open('create')}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Novo Item
            </Button>
          </div>

          <Card className="p-4 backdrop-blur-xl bg-white/80 dark:bg-white/5 border-gray-200/50 dark:border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder={itemsConfig.display.labels.searchPlaceholder}
                value={page.searchQuery}
                onChange={e => page.handlers.handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </Card>

          {page.isLoading ? (
            <Card className="p-12 text-center backdrop-blur-xl bg-white/80 dark:bg-white/5 border-gray-200/50 dark:border-white/10">
              <p className="text-gray-600 dark:text-white/60">Carregando...</p>
            </Card>
          ) : page.error ? (
            <Card className="p-12 text-center backdrop-blur-xl bg-white/80 dark:bg-white/5 border-gray-200/50 dark:border-white/10">
              <p className="text-destructive">Erro ao carregar itens</p>
            </Card>
          ) : (
            <EntityGrid
              config={itemsConfig}
              items={page.filteredItems}
              renderGridItem={renderGridCard}
              renderListItem={renderListCard}
              isLoading={page.isLoading}
              isSearching={!!page.searchQuery}
              onItemClick={(item, e) => page.handlers.handleItemClick(item, e)}
              onItemDoubleClick={item =>
                page.handlers.handleItemDoubleClick(item)
              }
            />
          )}

          {hasSelection && (
            <SelectionToolbar
              selectedIds={selectedIds}
              totalItems={page.filteredItems.length}
              onClear={() => page.selection?.actions.clear()}
              onSelectAll={() => page.selection?.actions.selectAll()}
              defaultActions={{
                view: true,
                edit: false,
                duplicate: false,
                delete: false,
              }}
              handlers={{
                onView: page.handlers.handleItemsView,
              }}
            />
          )}

          <Dialog
            open={page.modals.isOpen('create')}
            onOpenChange={open => !open && page.modals.close('create')}
          >
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Novo Item</DialogTitle>
              </DialogHeader>
              <EntityForm
                config={itemsConfig.form!}
                mode="create"
                onSubmit={async data => {
                  await crud.create(data);
                  page.modals.close('create');
                }}
                onCancel={() => page.modals.close('create')}
                isSubmitting={crud.isCreating}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </CoreProvider>
  );
}
