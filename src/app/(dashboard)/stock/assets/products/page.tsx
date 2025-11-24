/**
 * Products Listing Page
 * Página de listagem de produtos usando componentes 100% genéricos
 * Template para outras entidades (Variants, Items)
 */

'use client';

import { AlertCircle, CheckCircle, Package, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

// Componentes genéricos
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

// Cards específicos
import {
  ProductGridCard,
  ProductListCard,
} from '@/components/shared/cards/entity-cards';

// Dialogs
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

// Context e hooks
import { SelectionProvider, useSelection } from '@/contexts/selection-context';
import { useDeleteProduct, useProducts } from '@/hooks/stock/use-products';
import { useBatchOperation } from '@/hooks/use-batch-operation-v2';
import { useQueryClient } from '@tanstack/react-query';

// Tipos mock (você deve usar os tipos reais de @/types/stock)
interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  cost?: number;
  quantity?: number;
  category?: string;
  createdAt: Date;
  updatedAt?: Date;
}

const PRODUCTS_QUERY_KEY = ['products'];

function ProductsContent() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // State
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

  // Selection context
  const {
    selectedIds,
    lastSelectedId,
    selectItem,
    selectRange,
    clearSelection,
  } = useSelection();

  // API Data
  const { data: productsResponse, isLoading } = useProducts();
  const products = productsResponse?.products || [];
  const deleteProductMutation = useDeleteProduct();

  // Batch operations
  const batchDelete = useBatchOperation(
    async (id: string) => {
      await deleteProductMutation.mutateAsync(id);
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
              ? 'Produto excluído com sucesso!'
              : `${succeeded} produtos excluídos com sucesso!`
          );
        } else {
          toast.error('Erro ao excluir alguns produtos');
        }
        clearSelection();
      },
    }
  );

  const batchDuplicate = useBatchOperation(
    async (id: string) => {
      const product = products.find(p => p.id === id);
      if (!product) throw new Error('Produto não encontrado');
      // await createProductMutation.mutateAsync({ ...product, name: `${product.name} (cópia)` });
      await new Promise(resolve => setTimeout(resolve, 500));
    },
    {
      batchSize: 3,
      delayBetweenItems: 500,
      delayBetweenBatches: 2000,
      maxRetries: 3,
      onComplete: results => {
        const succeeded = results.filter(r => r.status === 'success').length;
        toast.success(`${succeeded} produtos duplicados com sucesso!`);
        clearSelection();
      },
    }
  );

  // Filtered products
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    return products.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  // Handlers
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleQuickCreate = async (name: string) => {
    toast.success(`Produto "${name}" criado com sucesso!`);
    // Implemente createProductMutation.mutateAsync({ name, ... })
  };

  const handleProductClick = (id: string, event: React.MouseEvent) => {
    if (event.shiftKey && lastSelectedId) {
      const allIds = filteredProducts.map(p => p.id);
      selectRange(lastSelectedId, id, allIds);
    } else {
      selectItem(id, event);
    }
  };

  const handleProductDoubleClick = (id: string) => {
    router.push(`/stock/assets/products/${id}`);
  };

  const handleProductsView = (ids: string[]) => {
    if (ids.length === 1) {
      router.push(`/stock/assets/products/${ids[0]}`);
    } else {
      toast.info('Visualização múltipla em breve');
    }
  };

  const handleProductsEdit = (ids: string[]) => {
    if (ids.length === 1) {
      router.push(`/stock/assets/products/${ids[0]}/edit`);
    } else {
      toast.info('Edição múltipla não disponível');
    }
  };

  const handleProductsDuplicate = (ids: string[]) => {
    setItemsToDuplicate(ids);
    setIsDuplicateDialogOpen(true);
  };

  const handleDuplicateConfirm = async () => {
    setIsDuplicateDialogOpen(false);
    setActiveOperation('duplicate');
    await batchDuplicate.start(itemsToDuplicate);
  };

  const handleProductsDelete = (ids: string[]) => {
    setItemsToDelete(ids);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleteDialogOpen(false);
    setActiveOperation('delete');
    await batchDelete.start(itemsToDelete);
  };

  const handleSelectRange = (startId: string, endId: string) => {
    const allIds = filteredProducts.map(p => p.id);
    selectRange(startId, endId, allIds);
  };

  // Stats
  const stats = [
    {
      label: 'Total de Produtos',
      value: products.length,
      icon: <Package className="w-5 h-5" />,
      trend: 5,
    },
    {
      label: 'Ativos',
      value: products.filter(p => p.status === 'ACTIVE').length,
      icon: <CheckCircle className="w-5 h-5" />,
    },
    {
      label: 'Inativos',
      value: products.filter(p => p.status === 'INACTIVE').length,
      icon: <AlertCircle className="w-5 h-5" />,
    },
    {
      label: 'Arquivados',
      value: products.filter(p => p.status === 'ARCHIVED').length,
      icon: <TrendingUp className="w-5 h-5" />,
    },
  ];

  // FAQs
  const faqs: FAQItem[] = [
    {
      question: 'Como adicionar um novo produto?',
      answer:
        'Clique no botão "Novo Produto" para abrir o formulário completo, ou use "Criação Rápida" para adicionar apenas o nome e completar depois.',
    },
    {
      question: 'Como controlar o estoque?',
      answer:
        'Ative a opção "Rastrear Estoque" nas configurações do produto e defina a quantidade disponível. O sistema alertará quando o estoque estiver baixo.',
    },
    {
      question: 'Posso importar produtos em massa?',
      answer:
        'Sim! Use o botão "Importar" para fazer upload de um arquivo CSV ou Excel. Baixe nosso modelo para garantir a formatação correta.',
    },
  ];

  // Page Header Config
  const pageHeaderConfig: PageHeaderConfig = {
    title: 'Produtos',
    description: 'Gerencie seu catálogo de produtos',
    onAdd: () => router.push('/stock/assets/products/new'),
    onQuickAdd: () => setIsQuickCreateModalOpen(true),
    onImport: () => setIsImportModalOpen(true),
    onHelp: () => setIsHelpModalOpen(true),
    addLabel: 'Novo Produto',
    quickAddLabel: 'Criação Rápida',
    importLabel: 'Importar',
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Carregando produtos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-col flex gap-4">
      <PageHeader config={pageHeaderConfig} />

      <SearchSection
        searchPlaceholder="Buscar produtos..."
        onSearch={handleSearch}
      />

      <StatsSection stats={stats} defaultExpanded />

      <EntityGrid
        items={filteredProducts}
        isSearching={!!searchQuery.trim()}
        selectedIds={selectedIds}
        onItemClick={handleProductClick}
        onItemDoubleClick={handleProductDoubleClick}
        onItemsView={handleProductsView}
        onItemsEdit={handleProductsEdit}
        onItemsDuplicate={handleProductsDuplicate}
        onItemsDelete={handleProductsDelete}
        onClearSelection={clearSelection}
        onSelectRange={handleSelectRange}
        renderGridItem={(product, isSelected) => (
          <ProductGridCard
            name={product.name}
            sku={product.code}
            price={0}
            quantity={0}
            createdAt={product.createdAt}
            updatedAt={product.updatedAt}
            isSelected={isSelected}
          />
        )}
        renderListItem={(product, isSelected) => (
          <ProductListCard
            name={product.name}
            sku={product.code}
            price={0}
            quantity={0}
            createdAt={product.createdAt}
            updatedAt={product.updatedAt}
            isSelected={isSelected}
          />
        )}
        emptyMessage="Nenhum produto encontrado"
      />

      {/* Modals Genéricos */}
      <QuickCreateModal
        isOpen={isQuickCreateModalOpen}
        onClose={() => setIsQuickCreateModalOpen(false)}
        onSubmit={handleQuickCreate}
        title="Criação Rápida de Produto"
        description="Crie um produto rapidamente. Adicione detalhes depois."
        inputLabel="Nome do Produto"
        inputPlaceholder="Digite o nome do produto"
        submitButtonText="Criar Produto"
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={async file => console.log('Importando:', file.name)}
        title="Importar Produtos"
        description="Faça upload de um arquivo CSV ou Excel com produtos."
        acceptedFormats=".csv,.xlsx,.xls"
      />

      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        title="Produtos"
        description="Perguntas frequentes sobre produtos"
        faqs={faqs}
      />

      {/* Alert Dialogs */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              {itemsToDelete.length === 1
                ? 'Tem certeza que deseja excluir este produto?'
                : `Tem certeza que deseja excluir ${itemsToDelete.length} produtos?`}
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
                ? 'Tem certeza que deseja duplicar este produto?'
                : `Tem certeza que deseja duplicar ${itemsToDuplicate.length} produtos?`}
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

      {/* Batch Progress Dialogs */}
      <BatchProgressDialog
        open={activeOperation === 'delete' && !batchDelete.isIdle}
        status={batchDelete.status}
        total={batchDelete.total}
        processed={batchDelete.processed}
        succeeded={batchDelete.succeeded}
        failed={batchDelete.failed}
        progress={batchDelete.progress}
        operationType="delete"
        itemName="produtos"
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
        itemName="produtos"
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

export default function ProductsPage() {
  return (
    <SelectionProvider>
      <ProductsContent />
    </SelectionProvider>
  );
}
