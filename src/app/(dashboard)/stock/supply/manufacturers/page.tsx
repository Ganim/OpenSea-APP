/**
 * Manufacturers Listing Page
 * Página de listagem de fabricantes usando componentes genéricos
 */

'use client';

import { Building2, Globe, Mail, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { useManufacturers } from '@/hooks/stock';

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
  ManufacturerGridCard,
  ManufacturerListCard,
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

function ManufacturersContent() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isQuickCreateModalOpen, setIsQuickCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);
  const [manufacturersToDelete, setManufacturersToDelete] = useState<string[]>(
    []
  );
  const [manufacturersToDuplicate, setManufacturersToDuplicate] = useState<
    string[]
  >([]);
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
  const { data: manufacturersResponse, isLoading } = useManufacturers();
  const manufacturers = manufacturersResponse?.manufacturers || [];

  const batchDelete = useBatchOperation(
    async (id: string) => {
      // Manufacturers não possuem delete direto - apenas desativação
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
              ? 'Fabricante excluído com sucesso!'
              : `${succeeded} fabricantes excluídos com sucesso!`
          );
        } else {
          toast.error('Erro ao excluir alguns fabricantes');
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
        toast.success(`${succeeded} fabricantes duplicados com sucesso!`);
        clearSelection();
      },
    }
  );

  const filteredManufacturers = useMemo(() => {
    if (!searchQuery.trim()) return manufacturers;
    return manufacturers.filter(
      manufacturer =>
        manufacturer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        manufacturer.country.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [manufacturers, searchQuery]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleQuickCreate = async (name: string) => {
    toast.success(`Fabricante "${name}" criado com sucesso!`);
  };

  const handleManufacturerClick = (id: string, event: React.MouseEvent) => {
    if (event.shiftKey && lastSelectedId) {
      const allIds = filteredManufacturers.map(m => m.id);
      selectRange(lastSelectedId, id, allIds);
    } else {
      selectItem(id, event);
    }
  };

  const handleManufacturerDoubleClick = (id: string) => {
    router.push(`/stock/supply/manufacturers/${id}`);
  };

  const handleManufacturersView = (ids: string[]) => {
    if (ids.length === 1) {
      router.push(`/stock/supply/manufacturers/${ids[0]}`);
    } else {
      toast.info('Visualização múltipla em breve');
    }
  };

  const handleManufacturersEdit = (ids: string[]) => {
    if (ids.length === 1) {
      router.push(`/stock/supply/manufacturers/${ids[0]}/edit`);
    } else {
      toast.info('Edição múltipla não disponível');
    }
  };

  const handleManufacturersDuplicate = (ids: string[]) => {
    setManufacturersToDuplicate(ids);
    setIsDuplicateDialogOpen(true);
  };

  const handleDuplicateConfirm = async () => {
    setIsDuplicateDialogOpen(false);
    setActiveOperation('duplicate');
    await batchDuplicate.start(manufacturersToDuplicate);
  };

  const handleManufacturersDelete = (ids: string[]) => {
    setManufacturersToDelete(ids);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleteDialogOpen(false);
    setActiveOperation('delete');
    await batchDelete.start(manufacturersToDelete);
  };

  const handleSelectRange = (startId: string, endId: string) => {
    const allIds = filteredManufacturers.map(m => m.id);
    selectRange(startId, endId, allIds);
  };

  const stats = [
    {
      label: 'Total de Fabricantes',
      value: manufacturers.length,
      icon: <Building2 className="w-5 h-5" />,
      trend: 8,
    },
    {
      label: 'Ativos',
      value: manufacturers.filter(m => m.isActive).length,
      icon: <Star className="w-5 h-5" />,
    },
    {
      label: 'Com Website',
      value: manufacturers.filter(m => m.website).length,
      icon: <Globe className="w-5 h-5" />,
    },
    {
      label: 'Com Contato',
      value: manufacturers.filter(m => m.email || m.phone).length,
      icon: <Mail className="w-5 h-5" />,
    },
  ];

  const faqs: FAQItem[] = [
    {
      question: 'O que são fabricantes?',
      answer:
        'Fabricantes são as empresas que produzem os produtos. Cada produto pode ter um fabricante associado para rastreamento de origem.',
    },
    {
      question: 'Como cadastrar um fabricante?',
      answer:
        'Você pode cadastrar um fabricante através do botão "Novo Fabricante" ou importando uma lista. Informe nome, país e dados de contato.',
    },
    {
      question: 'Posso desativar um fabricante?',
      answer:
        'Sim, fabricantes podem ser desativados mas não excluídos, preservando o histórico de produtos associados.',
    },
  ];

  const pageHeaderConfig = {
    title: 'Fabricantes',
    description: 'Gerencie os fabricantes dos seus produtos',
    onAdd: () => router.push('/stock/supply/manufacturers/new'),
    onQuickAdd: () => setIsQuickCreateModalOpen(true),
    onImport: () => setIsImportModalOpen(true),
    onHelp: () => setIsHelpModalOpen(true),
    addLabel: 'Novo Fabricante',
    quickAddLabel: 'Criação Rápida',
    importLabel: 'Importar',
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Carregando fabricantes...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-col flex gap-4">
      <PageHeader config={pageHeaderConfig} />
      <SearchSection
        searchPlaceholder="Buscar fabricantes..."
        onSearch={handleSearch}
      />
      <StatsSection stats={stats} defaultExpanded />

      <EntityGrid
        items={filteredManufacturers}
        isSearching={!!searchQuery.trim()}
        selectedIds={selectedIds}
        onItemClick={handleManufacturerClick}
        onItemDoubleClick={handleManufacturerDoubleClick}
        onItemsView={handleManufacturersView}
        onItemsEdit={handleManufacturersEdit}
        onItemsDuplicate={handleManufacturersDuplicate}
        onItemsDelete={handleManufacturersDelete}
        onClearSelection={clearSelection}
        onSelectRange={handleSelectRange}
        renderGridItem={(manufacturer, isSelected) => (
          <ManufacturerGridCard
            name={manufacturer.name}
            country={manufacturer.country}
            email={manufacturer.email}
            phone={manufacturer.phone}
            website={manufacturer.website}
            rating={manufacturer.rating}
            isActive={manufacturer.isActive}
            isSelected={isSelected}
          />
        )}
        renderListItem={(manufacturer, isSelected) => (
          <ManufacturerListCard
            name={manufacturer.name}
            country={manufacturer.country}
            email={manufacturer.email}
            phone={manufacturer.phone}
            website={manufacturer.website}
            rating={manufacturer.rating}
            isActive={manufacturer.isActive}
            isSelected={isSelected}
          />
        )}
        emptyMessage="Nenhum fabricante encontrado"
      />

      <QuickCreateModal
        isOpen={isQuickCreateModalOpen}
        onClose={() => setIsQuickCreateModalOpen(false)}
        onSubmit={handleQuickCreate}
        title="Criação Rápida de Fabricante"
        description="Crie um fabricante rapidamente. Adicione detalhes depois."
        inputLabel="Nome do Fabricante"
        inputPlaceholder="Digite o nome do fabricante"
        submitButtonText="Criar Fabricante"
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={async file => console.log('Importando:', file.name)}
        title="Importar Fabricantes"
        description="Faça upload de um arquivo CSV ou Excel com fabricantes."
        acceptedFormats=".csv,.xlsx,.xls"
      />

      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        title="Fabricantes"
        description="Perguntas frequentes sobre fabricantes"
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
              {manufacturersToDelete.length === 1
                ? 'Tem certeza que deseja excluir este fabricante?'
                : `Tem certeza que deseja excluir ${manufacturersToDelete.length} fabricantes?`}
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
              {manufacturersToDuplicate.length === 1
                ? 'Tem certeza que deseja duplicar este fabricante?'
                : `Tem certeza que deseja duplicar ${manufacturersToDuplicate.length} fabricantes?`}
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
        itemName="fabricantes"
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
        itemName="fabricantes"
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

export default function ManufacturersPage() {
  return (
    <SelectionProvider>
      <ManufacturersContent />
    </SelectionProvider>
  );
}
