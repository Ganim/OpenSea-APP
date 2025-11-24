/**
 * Suppliers Listing Page
 * Página de listagem de fornecedores usando componentes genéricos
 */

'use client';

import { Building2, Globe, Mail, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { useSuppliers } from '@/hooks/stock';

import {
  BatchProgressDialog,
  EntityGrid,
  HelpModal,
  ImportModal,
  PageHeader,
  QuickCreateModal,
  SearchSection,
  StatsSection,
  type FAQItem,
} from '@/components/shared';
import {
  SupplierGridCard,
  SupplierListCard,
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

function SuppliersContent() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isQuickCreateModalOpen, setIsQuickCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);
  const [suppliersToDelete, setSuppliersToDelete] = useState<string[]>([]);
  const [suppliersToDuplicate, setSuppliersToDuplicate] = useState<string[]>(
    []
  );
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
  const { data: suppliersResponse, isLoading } = useSuppliers();
  const suppliers = suppliersResponse?.suppliers || [];

  const batchDelete = useBatchOperation(
    async (id: string) => {
      // Suppliers não possuem delete direto - apenas desativação
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
              ? 'Fornecedor excluído com sucesso!'
              : `${succeeded} fornecedores excluídos com sucesso!`
          );
        } else {
          toast.error('Erro ao excluir alguns fornecedores');
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
        toast.success(`${succeeded} fornecedores duplicados com sucesso!`);
        clearSelection();
      },
    }
  );

  const filteredSuppliers = useMemo(() => {
    if (!searchQuery.trim()) return suppliers;
    return suppliers.filter(
      supplier =>
        supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplier.country?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [suppliers, searchQuery]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleQuickCreate = async (name: string) => {
    toast.success(`Fornecedor "${name}" criado com sucesso!`);
  };

  const handleSupplierClick = (id: string, event: React.MouseEvent) => {
    if (event.shiftKey && lastSelectedId) {
      const allIds = filteredSuppliers.map(s => s.id);
      selectRange(lastSelectedId, id, allIds);
    } else {
      selectItem(id, event);
    }
  };

  const handleSupplierDoubleClick = (id: string) => {
    router.push(`/stock/supply/suppliers/${id}`);
  };

  const handleSuppliersView = (ids: string[]) => {
    if (ids.length === 1) {
      router.push(`/stock/supply/suppliers/${ids[0]}`);
    } else {
      toast.info('Visualização múltipla em breve');
    }
  };

  const handleSuppliersEdit = (ids: string[]) => {
    if (ids.length === 1) {
      router.push(`/stock/supply/suppliers/${ids[0]}/edit`);
    } else {
      toast.info('Edição múltipla não disponível');
    }
  };

  const handleSuppliersDuplicate = (ids: string[]) => {
    setSuppliersToDuplicate(ids);
    setIsDuplicateDialogOpen(true);
  };

  const handleDuplicateConfirm = async () => {
    setIsDuplicateDialogOpen(false);
    setActiveOperation('duplicate');
    await batchDuplicate.start(suppliersToDuplicate);
  };

  const handleSuppliersDelete = (ids: string[]) => {
    setSuppliersToDelete(ids);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleteDialogOpen(false);
    setActiveOperation('delete');
    await batchDelete.start(suppliersToDelete);
  };

  const handleSelectRange = (startId: string, endId: string) => {
    const allIds = filteredSuppliers.map(s => s.id);
    selectRange(startId, endId, allIds);
  };

  const stats = [
    {
      label: 'Total de Fornecedores',
      value: suppliers.length,
      icon: <Building2 className="w-5 h-5" />,
      trend: 5,
    },
    {
      label: 'Ativos',
      value: suppliers.filter(s => s.isActive).length,
      icon: <Star className="w-5 h-5" />,
    },
    {
      label: 'Com Website',
      value: suppliers.filter(s => s.website).length,
      icon: <Globe className="w-5 h-5" />,
    },
    {
      label: 'Com Contato',
      value: suppliers.filter(s => s.email || s.phone).length,
      icon: <Mail className="w-5 h-5" />,
    },
  ];

  const faqs: FAQItem[] = [
    {
      question: 'O que são fornecedores?',
      answer:
        'Fornecedores são as empresas que fornecem produtos para o seu negócio. Cada produto pode ter um fornecedor associado.',
    },
    {
      question: 'Como cadastrar um fornecedor?',
      answer:
        'Você pode cadastrar um fornecedor através do botão "Novo Fornecedor" ou importando uma lista. Informe nome, CNPJ, dados de contato e endereço.',
    },
    {
      question: 'Posso desativar um fornecedor?',
      answer:
        'Sim, fornecedores podem ser desativados mas não excluídos, preservando o histórico de produtos associados.',
    },
  ];

  const pageHeaderConfig = {
    title: 'Fornecedores',
    description: 'Gerencie os fornecedores dos seus produtos',
    onAdd: () => router.push('/stock/supply/suppliers/new'),
    onQuickAdd: () => setIsQuickCreateModalOpen(true),
    onImport: () => setIsImportModalOpen(true),
    onHelp: () => setIsHelpModalOpen(true),
    addLabel: 'Novo Fornecedor',
    quickAddLabel: 'Criação Rápida',
    importLabel: 'Importar',
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Carregando fornecedores...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-col flex gap-4">
      <PageHeader config={pageHeaderConfig} />
      <SearchSection
        searchPlaceholder="Buscar fornecedores..."
        onSearch={handleSearch}
      />
      <StatsSection stats={stats} defaultExpanded />

      <EntityGrid
        items={filteredSuppliers}
        isSearching={!!searchQuery.trim()}
        selectedIds={selectedIds}
        onItemClick={handleSupplierClick}
        onItemDoubleClick={handleSupplierDoubleClick}
        onItemsView={handleSuppliersView}
        onItemsEdit={handleSuppliersEdit}
        onItemsDuplicate={handleSuppliersDuplicate}
        onItemsDelete={handleSuppliersDelete}
        onClearSelection={clearSelection}
        onSelectRange={handleSelectRange}
        renderGridItem={(supplier, isSelected) => (
          <SupplierGridCard
            name={supplier.name}
            country={supplier.country}
            cnpj={supplier.cnpj}
            email={supplier.email}
            phone={supplier.phone}
            website={supplier.website}
            rating={supplier.rating}
            isActive={supplier.isActive}
            isSelected={isSelected}
          />
        )}
        renderListItem={(supplier, isSelected) => (
          <SupplierListCard
            name={supplier.name}
            country={supplier.country}
            cnpj={supplier.cnpj}
            email={supplier.email}
            phone={supplier.phone}
            website={supplier.website}
            rating={supplier.rating}
            isActive={supplier.isActive}
            isSelected={isSelected}
          />
        )}
        emptyMessage="Nenhum fornecedor encontrado"
      />

      <QuickCreateModal
        isOpen={isQuickCreateModalOpen}
        onClose={() => setIsQuickCreateModalOpen(false)}
        onSubmit={handleQuickCreate}
        title="Criação Rápida de Fornecedor"
        description="Crie um fornecedor rapidamente. Adicione detalhes depois."
        inputLabel="Nome do Fornecedor"
        inputPlaceholder="Digite o nome do fornecedor"
        submitButtonText="Criar Fornecedor"
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={async file => console.log('Importando:', file.name)}
        title="Importar Fornecedores"
        description="Faça upload de um arquivo CSV ou Excel com fornecedores."
        acceptedFormats=".csv,.xlsx,.xls"
      />

      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        title="Fornecedores"
        description="Perguntas frequentes sobre fornecedores"
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
              {suppliersToDelete.length === 1
                ? 'Tem certeza que deseja excluir este fornecedor?'
                : `Tem certeza que deseja excluir ${suppliersToDelete.length} fornecedores?`}
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
              {suppliersToDuplicate.length === 1
                ? 'Tem certeza que deseja duplicar este fornecedor?'
                : `Tem certeza que deseja duplicar ${suppliersToDuplicate.length} fornecedores?`}
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
        itemName="fornecedores"
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
        itemName="fornecedores"
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

export default function SuppliersPage() {
  return (
    <SelectionProvider>
      <SuppliersContent />
    </SelectionProvider>
  );
}
