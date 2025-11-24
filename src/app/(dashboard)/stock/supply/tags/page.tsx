'use client';

import { Tag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { useTags } from '@/hooks/stock/use-stock-other';

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
  TagGridCard,
  TagListCard,
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

function TagsContent() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isQuickCreateModalOpen, setIsQuickCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);
  const [tagsToDelete, setTagsToDelete] = useState<string[]>([]);
  const [tagsToDuplicate, setTagsToDuplicate] = useState<string[]>([]);
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
  const { data: tagsResponse } = useTags();
  const tags = useMemo(() => tagsResponse?.tags || [], [tagsResponse]);

  const batchDelete = useBatchOperation(
    async () => {
      // Tags não possuem delete direto - apenas desativação
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
              ? 'Tag excluída com sucesso!'
              : `${succeeded} tags excluídas com sucesso!`
          );
        } else {
          toast.error('Erro ao excluir algumas tags');
        }
        clearSelection();
      },
    }
  );

  const batchDuplicate = useBatchOperation(
    async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
    },
    {
      batchSize: 3,
      delayBetweenItems: 500,
      delayBetweenBatches: 2000,
      maxRetries: 3,
      onComplete: results => {
        const succeeded = results.filter(r => r.status === 'success').length;
        toast.success(`${succeeded} tags duplicadas com sucesso!`);
        clearSelection();
      },
    }
  );

  const filteredTags = useMemo(() => {
    if (!searchQuery.trim()) return tags;
    return tags.filter(
      tag =>
        tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tag.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tag.color?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tags, searchQuery]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleQuickCreate = async (name: string) => {
    toast.success(`Tag "${name}" criada com sucesso!`);
  };

  const handleTagClick = (id: string, event: React.MouseEvent) => {
    if (event.shiftKey && lastSelectedId) {
      const allIds = filteredTags.map(t => t.id);
      selectRange(lastSelectedId, id, allIds);
    } else {
      selectItem(id, event);
    }
  };

  const handleTagDoubleClick = (id: string) => {
    router.push(`/stock/supply/tags/${id}`);
  };

  const handleTagsView = (ids: string[]) => {
    if (ids.length === 1) {
      router.push(`/stock/supply/tags/${ids[0]}`);
    } else {
      toast.info('Visualização múltipla em breve');
    }
  };

  const handleTagsEdit = (ids: string[]) => {
    if (ids.length === 1) {
      router.push(`/stock/supply/tags/${ids[0]}/edit`);
    } else {
      toast.info('Edição múltipla não disponível');
    }
  };

  const handleTagsDuplicate = (ids: string[]) => {
    setTagsToDuplicate(ids);
    setIsDuplicateDialogOpen(true);
  };

  const handleDuplicateConfirm = async () => {
    setIsDuplicateDialogOpen(false);
    setActiveOperation('duplicate');
    await batchDuplicate.start(tagsToDuplicate);
  };

  const handleTagsDelete = (ids: string[]) => {
    setTagsToDelete(ids);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleteDialogOpen(false);
    setActiveOperation('delete');
    await batchDelete.start(tagsToDelete);
  };

  const handleSelectRange = (startId: string, endId: string) => {
    const allIds = filteredTags.map(t => t.id);
    selectRange(startId, endId, allIds);
  };

  const stats = [
    {
      label: 'Total de Tags',
      value: tags.length,
      icon: <Tag className="w-5 h-5" />,
      trend: 8,
    },
    {
      label: 'Com Descrição',
      value: tags.filter(t => t.description).length,
      icon: <Tag className="w-5 h-5" />,
    },
    {
      label: 'Com Cor',
      value: tags.filter(t => t.color).length,
      icon: <Tag className="w-5 h-5" />,
    },
    {
      label: 'Ativas',
      value: tags.filter(t => !t.deletedAt).length,
      icon: <Tag className="w-5 h-5" />,
    },
  ];

  const faqs: FAQItem[] = [
    {
      question: 'O que são tags?',
      answer:
        'Tags são etiquetas usadas para categorizar e organizar seus produtos de forma flexível, permitindo filtros avançados e relatórios personalizados.',
    },
    {
      question: 'Como criar uma tag?',
      answer:
        'Você pode criar uma tag através do botão "Nova Tag" ou importando uma lista. Informe nome, descrição e cor opcional.',
    },
    {
      question: 'Posso desativar uma tag?',
      answer:
        'Sim, tags podem ser desativadas mas não excluídas, preservando o histórico de produtos associados.',
    },
  ];

  const pageHeaderConfig = {
    title: 'Tags',
    description: 'Gerencie as etiquetas para categorizar seus produtos',
    onAdd: () => router.push('/stock/supply/tags/new'),
    onQuickAdd: () => setIsQuickCreateModalOpen(true),
    onImport: () => setIsImportModalOpen(true),
    onHelp: () => setIsHelpModalOpen(true),
    addLabel: 'Nova Tag',
    quickAddLabel: 'Criação Rápida',
    importLabel: 'Importar',
  };

  return (
    <div className="flex-col flex gap-4">
      <PageHeader config={pageHeaderConfig} />
      <SearchSection
        searchPlaceholder="Buscar tags..."
        onSearch={handleSearch}
      />
      <StatsSection stats={stats} defaultExpanded />

      <EntityGrid
        items={filteredTags}
        isSearching={!!searchQuery.trim()}
        selectedIds={selectedIds}
        onItemClick={handleTagClick}
        onItemDoubleClick={handleTagDoubleClick}
        onItemsView={handleTagsView}
        onItemsEdit={handleTagsEdit}
        onItemsDuplicate={handleTagsDuplicate}
        onItemsDelete={handleTagsDelete}
        onClearSelection={clearSelection}
        onSelectRange={handleSelectRange}
        renderGridItem={(tag, isSelected) => (
          <TagGridCard
            name={tag.name}
            description={tag.description}
            color={tag.color}
            category={undefined}
            isActive={!tag.deletedAt}
            isSelected={isSelected}
          />
        )}
        renderListItem={(tag, isSelected) => (
          <TagListCard
            name={tag.name}
            description={tag.description}
            color={tag.color}
            category={undefined}
            isActive={!tag.deletedAt}
            isSelected={isSelected}
          />
        )}
        emptyMessage="Nenhuma tag encontrada"
      />

      <QuickCreateModal
        isOpen={isQuickCreateModalOpen}
        onClose={() => setIsQuickCreateModalOpen(false)}
        onSubmit={handleQuickCreate}
        title="Criação Rápida de Tag"
        description="Crie uma tag rapidamente. Adicione detalhes depois."
        inputLabel="Nome da Tag"
        inputPlaceholder="Digite o nome da tag"
        submitButtonText="Criar Tag"
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={async file => console.log('Importando:', file.name)}
        title="Importar Tags"
        description="Faça upload de um arquivo CSV ou Excel com tags."
        acceptedFormats=".csv,.xlsx,.xls"
      />

      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        title="Tags"
        description="Perguntas frequentes sobre tags"
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
              {tagsToDelete.length === 1
                ? 'Tem certeza que deseja excluir esta tag?'
                : `Tem certeza que deseja excluir ${tagsToDelete.length} tags?`}
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
              {tagsToDuplicate.length === 1
                ? 'Tem certeza que deseja duplicar esta tag?'
                : `Tem certeza que deseja duplicar ${tagsToDuplicate.length} tags?`}
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
        itemName="tags"
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
        itemName="tags"
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

export default function TagsPage() {
  return (
    <SelectionProvider>
      <TagsContent />
    </SelectionProvider>
  );
}
