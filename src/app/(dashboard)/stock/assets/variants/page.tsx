/**
 * Variants Listing Page
 * Página de listagem de variantes usando componentes 100% genéricos
 */

'use client';

import { AlertCircle, CheckCircle, Layers, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { useDeleteVariant, useVariants } from '@/hooks/stock/use-variants';

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
  VariantGridCard,
  VariantListCard,
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

function VariantsContent() {
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
  const { data: variantsResponse, isLoading } = useVariants();
  const variants = variantsResponse?.variants || [];
  const deleteVariantMutation = useDeleteVariant();

  const batchDelete = useBatchOperation(
    async (id: string) => {
      await deleteVariantMutation.mutateAsync(id);
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
              ? 'Variante excluída com sucesso!'
              : `${succeeded} variantes excluídas com sucesso!`
          );
        } else {
          toast.error('Erro ao excluir algumas variantes');
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
        toast.success(`${succeeded} variantes duplicadas com sucesso!`);
        clearSelection();
      },
    }
  );

  const filteredVariants = useMemo(() => {
    if (!searchQuery.trim()) return variants;
    return variants.filter(variant =>
      variant.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [variants, searchQuery]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleQuickCreate = async (name: string) => {
    toast.success(`Variante "${name}" criada com sucesso!`);
  };

  const handleVariantClick = (id: string, event: React.MouseEvent) => {
    if (event.shiftKey && lastSelectedId) {
      const allIds = filteredVariants.map(v => v.id);
      selectRange(lastSelectedId, id, allIds);
    } else {
      selectItem(id, event);
    }
  };

  const handleVariantDoubleClick = (id: string) => {
    router.push(`/stock/assets/variants/${id}`);
  };

  const handleVariantsView = (ids: string[]) => {
    if (ids.length === 1) {
      router.push(`/stock/assets/variants/${ids[0]}`);
    } else {
      toast.info('Visualização múltipla em breve');
    }
  };

  const handleVariantsEdit = (ids: string[]) => {
    if (ids.length === 1) {
      router.push(`/stock/assets/variants/${ids[0]}/edit`);
    } else {
      toast.info('Edição múltipla não disponível');
    }
  };

  const handleVariantsDuplicate = (ids: string[]) => {
    setItemsToDuplicate(ids);
    setIsDuplicateDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleteDialogOpen(false);
    setActiveOperation('delete');
    await batchDelete.start(itemsToDelete);
  };

  const handleDuplicateConfirm = async () => {
    setIsDuplicateDialogOpen(false);
    setActiveOperation('duplicate');
    await batchDuplicate.start(itemsToDuplicate);
  };

  const handleVariantsDelete = (ids: string[]) => {
    setItemsToDelete(ids);
    setIsDeleteDialogOpen(true);
  };

  const handleVariantsStockMovement = (ids: string[]) => {
    if (ids.length === 1) {
      toast.info('Funcionalidade de movimentação em desenvolvimento');
    } else {
      toast.info('Movimentação múltipla não disponível');
    }
  };

  const handleVariantsCopyCode = async (ids: string[]) => {
    if (ids.length === 1) {
      const variant = variants.find(v => v.id === ids[0]);
      if (variant?.sku) {
        await navigator.clipboard.writeText(variant.sku);
        toast.success('Código SKU copiado!');
      }
    } else {
      toast.info('Copiar código disponível apenas para uma variante');
    }
  };

  const handleSelectRange = (startId: string, endId: string) => {
    const allIds = filteredVariants.map(v => v.id);
    selectRange(startId, endId, allIds);
  };

  const stats = [
    {
      label: 'Total de Variantes',
      value: variants.length,
      icon: <Layers className="w-5 h-5" />,
      trend: 3,
    },
    {
      label: 'Com Preço',
      value: variants.filter(v => v.price > 0).length,
      icon: <CheckCircle className="w-5 h-5" />,
    },
    {
      label: 'Com Custo',
      value: variants.filter(v => v.costPrice).length,
      icon: <TrendingUp className="w-5 h-5" />,
    },
    {
      label: 'Com Estoque Mín.',
      value: variants.filter(v => v.minStock).length,
      icon: <AlertCircle className="w-5 h-5" />,
    },
  ];

  const faqs: FAQItem[] = [
    {
      question: 'O que são variantes?',
      answer:
        'Variantes são versões diferentes de um mesmo produto. Por exemplo: um produto pode ter variantes de cor, tamanho, ou material.',
    },
    {
      question: 'Como criar variantes?',
      answer:
        'Clique em "Nova Variante" e associe a um produto existente. Defina as opções (cor, tamanho, etc.) e o ajuste de preço se necessário.',
    },
    {
      question: 'Variantes herdam dados do produto?',
      answer:
        'Sim! Variantes herdam informações base do produto, mas podem ter SKU, preço, e estoque próprios.',
    },
  ];

  const pageHeaderConfig: PageHeaderConfig = {
    title: 'Variantes',
    description: 'Gerencie variações de produtos',
    onAdd: () => router.push('/stock/assets/variants/new'),
    onQuickAdd: () => setIsQuickCreateModalOpen(true),
    onImport: () => setIsImportModalOpen(true),
    onHelp: () => setIsHelpModalOpen(true),
    addLabel: 'Nova Variante',
    quickAddLabel: 'Criação Rápida',
    importLabel: 'Importar',
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Carregando variantes...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-col flex gap-4">
      <PageHeader config={pageHeaderConfig} />
      <SearchSection
        searchPlaceholder="Buscar variantes..."
        onSearch={handleSearch}
      />
      <StatsSection stats={stats} defaultExpanded />

      <EntityGrid
        items={filteredVariants}
        isSearching={!!searchQuery.trim()}
        selectedIds={selectedIds}
        onItemClick={handleVariantClick}
        onItemDoubleClick={handleVariantDoubleClick}
        onItemsView={handleVariantsView}
        onItemsEdit={handleVariantsEdit}
        onItemsDuplicate={handleVariantsDuplicate}
        onItemsDelete={handleVariantsDelete}
        onItemsStockMovement={handleVariantsStockMovement}
        onItemsCopyCode={handleVariantsCopyCode}
        onClearSelection={clearSelection}
        onSelectRange={handleSelectRange}
        renderGridItem={(variant, isSelected) => (
          <VariantGridCard
            name={variant.name}
            sku={variant.sku}
            options={[]}
            quantity={0}
            createdAt={variant.createdAt}
            updatedAt={variant.updatedAt}
            isSelected={isSelected}
          />
        )}
        renderListItem={(variant, isSelected) => (
          <VariantListCard
            name={variant.name}
            sku={variant.sku}
            options={[]}
            quantity={0}
            createdAt={variant.createdAt}
            updatedAt={variant.updatedAt}
            isSelected={isSelected}
          />
        )}
        emptyMessage="Nenhuma variante encontrada"
      />

      <QuickCreateModal
        isOpen={isQuickCreateModalOpen}
        onClose={() => setIsQuickCreateModalOpen(false)}
        onSubmit={handleQuickCreate}
        title="Criação Rápida de Variante"
        description="Crie uma variante rapidamente. Adicione detalhes depois."
        inputLabel="Nome da Variante"
        inputPlaceholder="Digite o nome da variante"
        submitButtonText="Criar Variante"
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={async file => console.log('Importando:', file.name)}
        title="Importar Variantes"
        description="Faça upload de um arquivo CSV ou Excel com variantes."
        acceptedFormats=".csv,.xlsx,.xls"
      />

      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        title="Variantes"
        description="Perguntas frequentes sobre variantes"
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
                ? 'Tem certeza que deseja excluir esta variante?'
                : `Tem certeza que deseja excluir ${itemsToDelete.length} variantes?`}
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
                ? 'Tem certeza que deseja duplicar esta variante?'
                : `Tem certeza que deseja duplicar ${itemsToDuplicate.length} variantes?`}
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
        itemName="variantes"
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
        itemName="variantes"
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

export default function VariantsPage() {
  return (
    <SelectionProvider>
      <VariantsContent />
    </SelectionProvider>
  );
}
