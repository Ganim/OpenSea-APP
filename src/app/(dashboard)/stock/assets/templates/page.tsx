/**
 * Templates Page
 * Página de gestão de templates de estoque
 */

'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { HelpModal } from '@/components/modals/help-modal';
import { ImportTemplatesModal } from '@/components/modals/import-templates-modal';
import { QuickCreateTemplateModal } from '@/components/modals/quick-create-template-modal';
import { BatchProgressDialog } from '@/components/stock/batch-progress-dialog';
import {
  ItemsGrid,
  TemplateGridCard,
  TemplateListCard,
} from '@/components/stock/items-grid';
import { MultiViewModal } from '@/components/stock/multi-view-modal';
import { PageHeader } from '@/components/stock/page-header';
import { SearchSection } from '@/components/stock/search-section';
import { StatsSection } from '@/components/stock/stats-section';
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
import { useAuth } from '@/contexts/auth-context';
import { SelectionProvider, useSelection } from '@/contexts/selection-context';
import {
  useCreateTemplate,
  useDeleteTemplate,
  useTemplates,
} from '@/hooks/stock';
import { useBatchOperation } from '@/hooks/use-batch-operation-v2';
import type { CreateTemplateRequest } from '@/types/stock';
import { useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle,
  FileText,
  HelpCircle,
  Layers,
  Plus,
  Upload,
  Zap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

// Query key para templates
const TEMPLATES_QUERY_KEY = ['templates'];

export default function TemplatesPage() {
  return (
    <ProtectedRoute requiredRole="MANAGER">
      <SelectionProvider>
        <TemplatesPageContent />
      </SelectionProvider>
    </ProtectedRoute>
  );
}

function TemplatesPageContent() {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isQuickCreateModalOpen, setIsQuickCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);
  const [isMultiViewModalOpen, setIsMultiViewModalOpen] = useState(false);
  const [multiViewTemplateIds, setMultiViewTemplateIds] = useState<string[]>(
    []
  );
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

  // TanStack Query hooks
  const { data: templates = [], isLoading } = useTemplates();
  const createTemplateMutation = useCreateTemplate();
  const deleteTemplateMutation = useDeleteTemplate();

  // Batch delete operation
  const batchDelete = useBatchOperation(
    (id: string) => deleteTemplateMutation.mutateAsync(id),
    {
      batchSize: 3,
      delayBetweenItems: 500,
      delayBetweenBatches: 2000,
      maxRetries: 3,
      onItemComplete: result => {
        // Invalida o cache após cada item deletado com sucesso
        if (result.status === 'success') {
          queryClient.invalidateQueries({ queryKey: TEMPLATES_QUERY_KEY });
        }
      },
      onComplete: results => {
        const succeeded = results.filter(r => r.status === 'success').length;
        const failed = results.filter(r => r.status === 'failed').length;

        if (failed === 0) {
          toast.success(
            succeeded === 1
              ? 'Template excluído com sucesso!'
              : `${succeeded} templates excluídos com sucesso!`
          );
        } else if (succeeded > 0) {
          toast.warning(
            `${succeeded} templates excluídos, mas ${failed} falharam.`
          );
        } else {
          toast.error('Erro ao excluir templates');
        }

        clearSelection();
      },
    }
  );

  // Batch duplicate operation
  const batchDuplicate = useBatchOperation(
    async (id: string) => {
      const template = templates.find(t => t.id === id);
      if (!template) throw new Error('Template não encontrado');

      const data: CreateTemplateRequest = {
        name: `${template.name} (cópia)`,
        productAttributes: template.productAttributes || {},
        variantAttributes: template.variantAttributes,
        itemAttributes: template.itemAttributes,
      };
      return createTemplateMutation.mutateAsync(data);
    },
    {
      batchSize: 3,
      delayBetweenItems: 500,
      delayBetweenBatches: 2000,
      maxRetries: 3,
      onItemComplete: result => {
        // Invalida o cache após cada item duplicado com sucesso
        if (result.status === 'success') {
          queryClient.invalidateQueries({ queryKey: TEMPLATES_QUERY_KEY });
        }
      },
      onComplete: results => {
        const succeeded = results.filter(r => r.status === 'success').length;
        const failed = results.filter(r => r.status === 'failed').length;

        if (failed === 0) {
          toast.success(
            succeeded === 1
              ? 'Template duplicado com sucesso!'
              : `${succeeded} templates duplicados com sucesso!`
          );
        } else if (succeeded > 0) {
          toast.warning(
            `${succeeded} templates duplicados, mas ${failed} falharam.`
          );
        } else {
          toast.error('Erro ao duplicar templates');
        }

        clearSelection();
      },
    }
  );

  // Redirecionar usuários USER para página de requisição
  useEffect(() => {
    if (user && user.role === 'USER') {
      router.replace('/stock/assets/templates/request');
    }
  }, [user, router]);

  // Filtrar templates com base na busca
  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) return templates;
    return templates.filter(template =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [templates, searchQuery]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleQuickCreate = async (name: string) => {
    try {
      const data: CreateTemplateRequest = {
        name,
        productAttributes: {},
      };
      await createTemplateMutation.mutateAsync(data);
      toast.success('Template criado com sucesso!');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro desconhecido';
      const errorDetails = JSON.stringify(
        {
          error: message,
          templateName: name,
          timestamp: new Date().toISOString(),
        },
        null,
        2
      );

      toast.error('Erro ao criar template', {
        description: message,
        action: {
          label: 'Copiar erro',
          onClick: () => {
            navigator.clipboard.writeText(errorDetails);
            toast.success('Erro copiado para área de transferência');
          },
        },
      });
      throw error;
    }
  };

  const handleNavigateToNew = () => {
    router.push('/stock/assets/templates/new');
  };

  const handleImportTemplates = async (file: File) => {
    // TODO: Implementar importação de templates
    console.log('Importando arquivo:', file.name);
  };

  const handleTemplateClick = (id: string, event: React.MouseEvent) => {
    if (event.shiftKey && lastSelectedId) {
      // Shift+Click: seleção em range
      const allIds = filteredTemplates.map(t => t.id);
      selectRange(lastSelectedId, id, allIds);
    } else {
      // Click normal ou Ctrl+Click
      selectItem(id, event);
    }
  };

  const handleTemplateDoubleClick = (id: string) => {
    router.push(`/stock/assets/templates/${id}`);
  };

  const handleTemplatesView = (ids: string[]) => {
    if (ids.length === 1) {
      router.push(`/stock/assets/templates/${ids[0]}`);
    } else if (ids.length >= 2 && ids.length <= 5) {
      // Abre visualização múltipla
      setMultiViewTemplateIds(ids);
      setIsMultiViewModalOpen(true);
    } else if (ids.length > 5) {
      toast.info(
        `Visualização múltipla suporta até 5 templates. Você selecionou ${ids.length}.`
      );
    } else {
      toast.info(`Selecione pelo menos um template para visualizar.`);
    }
  };

  const handleTemplatesEdit = (ids: string[]) => {
    if (ids.length === 1) {
      router.push(`/stock/assets/templates/${ids[0]}/edit`);
    } else {
      toast.info(
        `Edição múltipla não disponível. Selecione apenas um template.`
      );
    }
  };

  const handleTemplatesDuplicate = (ids: string[]) => {
    setItemsToDuplicate(ids);
    setIsDuplicateDialogOpen(true);
  };

  const handleDuplicateConfirm = async () => {
    setIsDuplicateDialogOpen(false);
    setActiveOperation('duplicate');
    await batchDuplicate.start(itemsToDuplicate);
  };

  const handleTemplatesDelete = (ids: string[]) => {
    setItemsToDelete(ids);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleteDialogOpen(false);
    setActiveOperation('delete');
    await batchDelete.start(itemsToDelete);
  };

  const handleSelectRange = (startId: string, endId: string) => {
    const allIds = filteredTemplates.map(t => t.id);
    selectRange(startId, endId, allIds);
  };

  const stats = [
    {
      label: 'Total de Templates',
      value: templates.length,
      icon: <FileText className="w-5 h-5" />,
      trend: 5,
    },
    {
      label: 'Atributos Variantes',
      value: templates.reduce(
        (sum, t) => sum + (Object.keys(t.variantAttributes || {}).length || 0),
        0
      ),
      icon: <Layers className="w-5 h-5" />,
    },
    {
      label: 'Atributos Itens',
      value: templates.reduce(
        (sum, t) => sum + (Object.keys(t.itemAttributes || {}).length || 0),
        0
      ),
      icon: <Layers className="w-5 h-5" />,
    },
    {
      label: 'Templates Ativos',
      value: templates.length,
      icon: <CheckCircle className="w-5 h-5" />,
    },
  ];

  const faqs = [
    {
      question: 'O que são templates?',
      answer:
        'Templates são modelos que definem a estrutura de atributos para produtos e variantes. Eles ajudam a padronizar as informações e facilitar o cadastro em massa.',
    },
    {
      question: 'Como criar um novo template?',
      answer:
        'Clique no botão "Novo Template", defina um nome e configure os atributos necessários. Você pode adicionar atributos tanto para variantes quanto para itens individuais.',
    },
    {
      question: 'Posso importar templates em massa?',
      answer:
        'Sim! Use o botão "Importar" para fazer upload de um arquivo CSV ou Excel com múltiplos templates. Baixe nosso modelo para garantir a formatação correta.',
    },
    {
      question: 'Como editar um template existente?',
      answer:
        'Clique no template desejado na lista para acessar a página de edição. Lá você poderá modificar nome, adicionar ou remover atributos.',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Carregando templates...
          </p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRole="MANAGER">
      <div className="flex-col flex gap-4">
        <PageHeader
          title="Templates"
          description="Crie e gerencie modelos de produtos para padronizar atributos e facilitar o cadastro em massa."
          buttons={[
            {
              icon: HelpCircle,
              onClick: () => setIsHelpModalOpen(true),
              variant: 'ghost',
            },
            {
              icon: Zap,
              text: 'Rápido',
              onClick: () => setIsQuickCreateModalOpen(true),
              variant: 'outline',
              style: { iconColor: 'text-yellow-500' },
            },
            {
              icon: Upload,
              text: 'Importar',
              onClick: () => setIsImportModalOpen(true),
              variant: 'outline',
            },
            {
              icon: Plus,
              text: 'Novo Template',
              onClick: handleNavigateToNew,
              variant: 'default',
            },
          ]}
        />

        <SearchSection
          searchPlaceholder="Buscar templates..."
          onSearch={handleSearch}
        />

        <StatsSection stats={stats} defaultExpanded />

        <ItemsGrid
          items={filteredTemplates}
          isSearching={!!searchQuery.trim()}
          selectedIds={selectedIds}
          onItemClick={handleTemplateClick}
          onItemDoubleClick={handleTemplateDoubleClick}
          onItemsView={handleTemplatesView}
          onItemsEdit={handleTemplatesEdit}
          onItemsDuplicate={handleTemplatesDuplicate}
          onItemsDelete={handleTemplatesDelete}
          onClearSelection={clearSelection}
          onSelectRange={handleSelectRange}
          renderGridItem={(template, isSelected) => (
            <TemplateGridCard
              name={template.name}
              attributesCount={
                (Object.keys(template.variantAttributes || {}).length || 0) +
                (Object.keys(template.itemAttributes || {}).length || 0)
              }
              createdAt={template.createdAt}
              updatedAt={template.updatedAt}
              isSelected={isSelected}
            />
          )}
          renderListItem={(template, isSelected) => (
            <TemplateListCard
              name={template.name}
              attributesCount={
                (Object.keys(template.variantAttributes || {}).length || 0) +
                (Object.keys(template.itemAttributes || {}).length || 0)
              }
              createdAt={template.createdAt}
              updatedAt={template.updatedAt}
              isSelected={isSelected}
            />
          )}
          emptyMessage="Nenhum template encontrado"
        />

        <QuickCreateTemplateModal
          isOpen={isQuickCreateModalOpen}
          onClose={() => setIsQuickCreateModalOpen(false)}
          onSubmit={handleQuickCreate}
        />

        <ImportTemplatesModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImport={handleImportTemplates}
        />

        <HelpModal
          isOpen={isHelpModalOpen}
          onClose={() => setIsHelpModalOpen(false)}
          title="Templates"
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
                  ? 'Tem certeza que deseja excluir este template? Esta ação não pode ser desfeita.'
                  : `Tem certeza que deseja excluir ${itemsToDelete.length} templates? Esta ação não pode ser desfeita.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={deleteTemplateMutation.isPending}
                className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
              >
                {deleteTemplateMutation.isPending ? 'Excluindo...' : 'Excluir'}
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
                  ? 'Tem certeza que deseja duplicar este template?'
                  : `Tem certeza que deseja duplicar ${itemsToDuplicate.length} templates? Isso criará ${itemsToDuplicate.length} novos templates.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDuplicateConfirm}
                disabled={createTemplateMutation.isPending}
              >
                {createTemplateMutation.isPending
                  ? 'Duplicando...'
                  : 'Duplicar'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Dialog de progresso para exclusão */}
        <BatchProgressDialog
          open={activeOperation === 'delete' && !batchDelete.isIdle}
          status={batchDelete.status}
          total={batchDelete.total}
          processed={batchDelete.processed}
          succeeded={batchDelete.succeeded}
          failed={batchDelete.failed}
          progress={batchDelete.progress}
          operationType="delete"
          itemName="templates"
          onClose={() => {
            batchDelete.reset();
            setActiveOperation(null);
          }}
          onPause={batchDelete.pause}
          onResume={batchDelete.resume}
          onCancel={batchDelete.cancel}
        />

        {/* Dialog de progresso para duplicação */}
        <BatchProgressDialog
          open={activeOperation === 'duplicate' && !batchDuplicate.isIdle}
          status={batchDuplicate.status}
          total={batchDuplicate.total}
          processed={batchDuplicate.processed}
          succeeded={batchDuplicate.succeeded}
          failed={batchDuplicate.failed}
          progress={batchDuplicate.progress}
          operationType="duplicate"
          itemName="templates"
          onClose={() => {
            batchDuplicate.reset();
            setActiveOperation(null);
          }}
          onPause={batchDuplicate.pause}
          onResume={batchDuplicate.resume}
          onCancel={batchDuplicate.cancel}
        />

        {/* Modal de visualização múltipla */}
        <MultiViewModal
          isOpen={isMultiViewModalOpen}
          onClose={() => {
            setIsMultiViewModalOpen(false);
            setMultiViewTemplateIds([]);
          }}
          templates={templates.filter(t => multiViewTemplateIds.includes(t.id))}
          availableTemplates={templates}
          onAddTemplate={templateId => {
            if (multiViewTemplateIds.length < 5) {
              setMultiViewTemplateIds([...multiViewTemplateIds, templateId]);
            }
          }}
        />
      </div>
    </ProtectedRoute>
  );
}
