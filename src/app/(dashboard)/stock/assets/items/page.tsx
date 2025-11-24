/**
 * Items Listing Page
 * Página de listagem de itens usando componentes 100% genéricos
 */

'use client';

import { Box, CheckCircle, Package, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { useItems } from '@/hooks/stock/use-items';

import {
  BatchProgressDialog,
  EntityGrid,
  HelpModal,
  ImportModal,
  PageHeader,
  PageHeaderConfig,
  QuickCreateModal,
  SearchSection,
  StatsSection,
  type FAQItem,
} from '@/components/shared';
import {
  ItemGridCard,
  ItemListCard,
} from '@/components/shared/cards/entity-cards';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { SelectionProvider, useSelection } from '@/contexts/selection-context';
import { useBatchOperation } from '@/hooks/use-batch-operation-v2';

function ItemsContent() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isQuickCreateModalOpen, setIsQuickCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState<string[]>([]);
  const [itemsToDuplicate, setItemsToDuplicate] = useState<string[]>([]);
  const [activeOperation, setActiveOperation] = useState<
    'delete' | 'duplicate' | null
  >(null);

  const {
    selectedIds,
    lastSelectedId,
    selectItem,
    selectRange,
    clearSelection,
  } = useSelection();

  // API Data
  const { data: itemsResponse, isLoading } = useItems();
  const items = itemsResponse?.items || [];

  const batchDelete = useBatchOperation(
    async (id: string) => {
      // Items não possuem delete direto - apenas movimentações
      await new Promise(resolve => setTimeout(resolve, 500));
    },
    {
      batchSize: 3,
      delayBetweenItems: 500,
      delayBetweenBatches: 2000,
      maxRetries: 3,
      onComplete: results => {
        const succeeded = results.filter(r => r.status === 'success').length;
        const failed = results.filter(r => r.status === 'failed').length;
        if (failed === 0) {
          toast.success(
            succeeded === 1
              ? 'Item excluído com sucesso!'
              : `${succeeded} itens excluídos com sucesso!`
          );
        } else {
          toast.error('Erro ao excluir alguns itens');
        }
        clearSelection();
      },
    }
  );

  const batchDuplicate = useBatchOperation(
    async (id: string) => {
      await new Promise(resolve => setTimeout(resolve, 500));
    },
    {
      batchSize: 3,
      delayBetweenItems: 500,
      delayBetweenBatches: 2000,
      maxRetries: 3,
      onComplete: results => {
        const succeeded = results.filter(r => r.status === 'success').length;
        toast.success(`${succeeded} itens duplicados com sucesso!`);
        clearSelection();
      },
    }
  );

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    return items.filter(item =>
      item.uniqueCode.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleQuickCreate = async (name: string) => {
    toast.success(`Item "${name}" criado com sucesso!`);
  };

  const handleItemClick = (id: string, event: React.MouseEvent) => {
    if (event.shiftKey && lastSelectedId) {
      const allIds = filteredItems.map(i => i.id);
      selectRange(lastSelectedId, id, allIds);
    } else {
      selectItem(id, event);
    }
  };

  const handleItemDoubleClick = (id: string) => {
    router.push(`/stock/assets/items/${id}`);
  };

  const handleItemsView = (ids: string[]) => {
    if (ids.length === 1) {
      router.push(`/stock/assets/items/${ids[0]}`);
    } else {
      toast.info('Visualização múltipla em breve');
    }
  };

  const handleItemsEdit = (ids: string[]) => {
    if (ids.length === 1) {
      router.push(`/stock/assets/items/${ids[0]}/edit`);
    } else {
      toast.info('Edição múltipla não disponível');
    }
  };

  const handleItemsDuplicate = (ids: string[]) => {
    setItemsToDuplicate(ids);
    setIsDuplicateDialogOpen(true);
  };

  const handleDuplicateConfirm = async () => {
    setIsDuplicateDialogOpen(false);
    setActiveOperation('duplicate');
    await batchDuplicate.start(itemsToDuplicate);
  };

  const handleItemsDelete = (ids: string[]) => {
    setItemsToDelete(ids);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleteDialogOpen(false);
    setActiveOperation('delete');
    await batchDelete.start(itemsToDelete);
  };

  const handleSelectRange = (startId: string, endId: string) => {
    const allIds = filteredItems.map(i => i.id);
    selectRange(startId, endId, allIds);
  };

  const stats = [
    {
      label: 'Total de Itens',
      value: items.length,
      icon: <Box className="w-5 h-5" />,
      trend: 12,
    },
    {
      label: 'Disponíveis',
      value: items.filter(i => i.status === 'AVAILABLE').length,
      icon: <CheckCircle className="w-5 h-5" />,
    },
    {
      label: 'Reservados',
      value: items.filter(i => i.status === 'RESERVED').length,
      icon: <Package className="w-5 h-5" />,
    },
    {
      label: 'Vendidos',
      value: items.filter(i => i.status === 'SOLD').length,
      icon: <TrendingUp className="w-5 h-5" />,
    },
  ];

  const faqs: FAQItem[] = [
    {
      question: 'O que são itens individuais?',
      answer:
        'Itens são unidades únicas rastreadas individualmente por número de série. Cada item representa uma unidade física específica.',
    },
    {
      question: 'Como rastrear itens?',
      answer:
        'Use o número de série único para rastrear cada item. Você pode registrar localização, condição, status e histórico de movimentação.',
    },
    {
      question: 'Qual a diferença entre item e produto?',
      answer:
        'Produto é a categoria geral (ex: Notebook Dell). Item é a unidade específica com número de série próprio (ex: NB001-2025-001).',
    },
  ];

  const pageHeaderConfig: PageHeaderConfig = {
    title: 'Itens',
    description: 'Gerencie itens individuais rastreados',
    onAdd: () => router.push('/stock/assets/items/new'),
    onQuickAdd: () => setIsQuickCreateModalOpen(true),
    onImport: () => setIsImportModalOpen(true),
    onHelp: () => setIsHelpModalOpen(true),
    addLabel: 'Novo Item',
    quickAddLabel: 'Criação Rápida',
    importLabel: 'Importar',
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Carregando itens...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-col flex gap-4">
      <PageHeader config={pageHeaderConfig} />
      <SearchSection
        searchPlaceholder="Buscar itens..."
        onSearch={handleSearch}
      />
      <StatsSection stats={stats} defaultExpanded />

      <EntityGrid
        items={filteredItems}
        isSearching={!!searchQuery.trim()}
        selectedIds={selectedIds}
        onItemClick={handleItemClick}
        onItemDoubleClick={handleItemDoubleClick}
        onItemsView={handleItemsView}
        onItemsEdit={handleItemsEdit}
        onItemsDuplicate={handleItemsDuplicate}
        onItemsDelete={handleItemsDelete}
        onClearSelection={clearSelection}
        onSelectRange={handleSelectRange}
        renderGridItem={(item, isSelected) => (
          <ItemGridCard
            serialNumber={item.uniqueCode}
            condition={'new' as const}
            status={
              item.status.toLowerCase() as
                | 'available'
                | 'reserved'
                | 'sold'
                | 'in_transit'
                | 'maintenance'
            }
            location={item.locationId}
            createdAt={item.createdAt}
            updatedAt={item.updatedAt}
            isSelected={isSelected}
          />
        )}
        renderListItem={(item, isSelected) => (
          <ItemListCard
            serialNumber={item.uniqueCode}
            condition={'new' as const}
            status={
              item.status.toLowerCase() as
                | 'available'
                | 'reserved'
                | 'sold'
                | 'in_transit'
                | 'maintenance'
            }
            location={item.locationId}
            createdAt={item.createdAt}
            updatedAt={item.updatedAt}
            isSelected={isSelected}
          />
        )}
        emptyMessage="Nenhum item encontrado"
      />

      <QuickCreateModal
        isOpen={isQuickCreateModalOpen}
        onClose={() => setIsQuickCreateModalOpen(false)}
        onSubmit={handleQuickCreate}
        title="Criação Rápida de Item"
        description="Crie um item rapidamente. Adicione detalhes depois."
        inputLabel="Número de Série"
        inputPlaceholder="Digite o número de série"
        submitButtonText="Criar Item"
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={async file => console.log('Importando:', file.name)}
        title="Importar Itens"
        description="Faça upload de um arquivo CSV ou Excel com itens."
        acceptedFormats=".csv,.xlsx,.xls"
      />

      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        title="Itens"
        description="Perguntas frequentes sobre itens"
        faqs={faqs}
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              {itemsToDelete.length === 1
                ? 'Tem certeza que deseja excluir este item?'
                : `Tem certeza que deseja excluir ${itemsToDelete.length} itens?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={isDuplicateDialogOpen}
        onOpenChange={setIsDuplicateDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar duplicação</AlertDialogTitle>
            <AlertDialogDescription>
              {itemsToDuplicate.length === 1
                ? 'Tem certeza que deseja duplicar este item?'
                : `Tem certeza que deseja duplicar ${itemsToDuplicate.length} itens?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDuplicateConfirm}>
              Duplicar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BatchProgressDialog
        open={activeOperation === 'delete' && !batchDelete.isIdle}
        status={batchDelete.status}
        total={batchDelete.total}
        processed={batchDelete.processed}
        succeeded={batchDelete.succeeded}
        failed={batchDelete.failed}
        progress={batchDelete.progress}
        operationType="delete"
        itemName="itens"
        onClose={() => {
          batchDelete.reset();
          setActiveOperation(null);
        }}
        onPause={batchDelete.pause}
        onResume={batchDelete.resume}
        onCancel={batchDelete.cancel}
      />

      <BatchProgressDialog
        open={activeOperation === 'duplicate' && !batchDuplicate.isIdle}
        status={batchDuplicate.status}
        total={batchDuplicate.total}
        processed={batchDuplicate.processed}
        succeeded={batchDuplicate.succeeded}
        failed={batchDuplicate.failed}
        progress={batchDuplicate.progress}
        operationType="duplicate"
        itemName="itens"
        onClose={() => {
          batchDuplicate.reset();
          setActiveOperation(null);
        }}
        onPause={batchDuplicate.pause}
        onResume={batchDuplicate.resume}
        onCancel={batchDuplicate.cancel}
      />
    </div>
  );
}

export default function ItemsPage() {
  return (
    <SelectionProvider>
      <ItemsContent />
    </SelectionProvider>
  );
}
