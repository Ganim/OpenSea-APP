/**
 * Locations Page
 * Página de gestão de localizações de estoque
 */

'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { BatchCreateLocationModal } from '@/components/modals/batch-create-location-modal';
import { CreateEditLocationModal } from '@/components/modals/create-edit-location-modal';
import { HelpModal } from '@/components/modals/help-modal';
import { ImportLocationsModal } from '@/components/modals/import-locations-modal';
import { QuickCreateLocationModal } from '@/components/modals/quick-create-location-modal';
import { BatchProgressDialog } from '@/components/stock/batch-progress-dialog';
import {
  ItemsGrid,
  LocationGridCard,
  LocationListCard,
} from '@/components/stock/items-grid';
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
  useCreateLocation,
  useDeleteLocation,
  useLocations,
} from '@/hooks/stock/use-stock-other';
import { useBatchOperation } from '@/hooks/use-batch-operation-v2';
import type { CreateLocationRequest } from '@/types/stock';
import { useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  MapPin,
  Plus,
  Upload,
  Warehouse,
  Zap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

// Query key para locations
const LOCATIONS_QUERY_KEY = ['locations'];

export default function LocationsPage() {
  return (
    <ProtectedRoute requiredRole="MANAGER">
      <SelectionProvider>
        <LocationsPageContent />
      </SelectionProvider>
    </ProtectedRoute>
  );
}

function LocationsPageContent() {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isQuickCreateModalOpen, setIsQuickCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isBatchCreateModalOpen, setIsBatchCreateModalOpen] = useState(false);
  const [isCreateEditModalOpen, setIsCreateEditModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<{
    id: string;
    name: string;
    code: string;
    type: string;
    parentId?: string;
    isActive: boolean;
  } | null>(null);
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

  const {
    data: locations = [],
    isLoading,
    error,
  } = useLocations({ type: 'WAREHOUSE' });
  const createLocationMutation = useCreateLocation();
  const deleteLocationMutation = useDeleteLocation();

  // Filtrar apenas locations que não têm parent (locations raiz)
  const rootLocations = useMemo(() => {
    return locations.filter(location => !location.parentId);
  }, [locations]);

  // Batch delete operation
  const batchDelete = useBatchOperation(
    (id: string) => deleteLocationMutation.mutateAsync(id),
    {
      batchSize: 3,
      delayBetweenItems: 500,
      delayBetweenBatches: 2000,
      maxRetries: 3,
      onItemComplete: result => {
        // Invalida o cache após cada item deletado com sucesso
        if (result.status === 'success') {
          queryClient.invalidateQueries({ queryKey: LOCATIONS_QUERY_KEY });
        }
      },
      onComplete: results => {
        const succeeded = results.filter(r => r.status === 'success').length;
        const failed = results.filter(r => r.status === 'failed').length;

        if (failed === 0) {
          toast.success(
            succeeded === 1
              ? 'Localização excluída com sucesso!'
              : `${succeeded} localizações excluídas com sucesso!`
          );
        } else if (succeeded > 0) {
          toast.warning(
            `${succeeded} localizações excluídas, mas ${failed} falharam.`
          );
        } else {
          toast.error('Erro ao excluir localizações');
        }

        clearSelection();
      },
    }
  );

  // Batch duplicate operation
  const batchDuplicate = useBatchOperation(
    async (id: string) => {
      const location = locations.find(l => l.id === id);
      if (!location) throw new Error('Localização não encontrada');

      const data: CreateLocationRequest = {
        titulo: `${location.name} (cópia)`,
        type: location.type,
        isActive: location.isActive,
      };
      return createLocationMutation.mutateAsync(data);
    },
    {
      batchSize: 3,
      delayBetweenItems: 500,
      delayBetweenBatches: 2000,
      maxRetries: 3,
      onItemComplete: result => {
        // Invalida o cache após cada item duplicado com sucesso
        if (result.status === 'success') {
          queryClient.invalidateQueries({ queryKey: LOCATIONS_QUERY_KEY });
        }
      },
      onComplete: results => {
        const succeeded = results.filter(r => r.status === 'success').length;
        const failed = results.filter(r => r.status === 'failed').length;

        if (failed === 0) {
          toast.success(
            succeeded === 1
              ? 'Localização duplicada com sucesso!'
              : `${succeeded} localizações duplicadas com sucesso!`
          );
        } else if (succeeded > 0) {
          toast.warning(
            `${succeeded} localizações duplicadas, mas ${failed} falharam.`
          );
        } else {
          toast.error('Erro ao duplicar localizações');
        }

        clearSelection();
      },
    }
  );

  // Filtrar locations com base na busca
  const filteredLocations = useMemo(() => {
    if (!searchQuery.trim()) return rootLocations;
    return rootLocations.filter(
      location =>
        (location.name?.toLowerCase().includes(searchQuery.toLowerCase()) ??
          false) ||
        location.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.type?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [rootLocations, searchQuery]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleQuickCreate = async (code: string, name?: string) => {
    try {
      const data: CreateLocationRequest = {
        titulo: name || code, // Usa o nome se fornecido, senão usa o código como descrição
        type: 'WAREHOUSE',
        isActive: true,
      };
      await createLocationMutation.mutateAsync(data);
      toast.success('Localização criada com sucesso!');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro desconhecido';
      const errorDetails = JSON.stringify(
        {
          error: message,
          locationCode: code,
          locationName: name,
          timestamp: new Date().toISOString(),
        },
        null,
        2
      );

      toast.error('Erro ao criar localização', {
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
    setIsBatchCreateModalOpen(true);
  };

  const handleImportLocations = async (file: File) => {
    // TODO: Implementar importação de localizações
    console.log('Importando arquivo:', file.name);
  };

  const handleLocationClick = (id: string, event: React.MouseEvent) => {
    if (event.shiftKey && lastSelectedId) {
      // Shift+Click: seleção em range
      const allIds = filteredLocations.map(l => l.id);
      selectRange(lastSelectedId, id, allIds);
    } else {
      // Click normal ou Ctrl+Click
      selectItem(id, event);
    }
  };

  const handleLocationDoubleClick = (id: string) => {
    router.push(`/stock/locations/${id}`);
  };

  const handleLocationsView = (ids: string[]) => {
    if (ids.length === 1) {
      router.push(`/stock/locations/${ids[0]}`);
    } else {
      toast.info(
        `Visualização múltipla não disponível. Selecione apenas uma localização.`
      );
    }
  };

  const handleLocationsEdit = (ids: string[]) => {
    if (ids.length === 1) {
      const locationToEdit = locations.find(l => l.id === ids[0]);
      if (locationToEdit) {
        setEditingLocation({
          id: locationToEdit.id,
          name: locationToEdit.name || '',
          code: locationToEdit.code,
          type: locationToEdit.type,
          parentId: locationToEdit.parentId,
          isActive: locationToEdit.isActive,
        });
        setIsCreateEditModalOpen(true);
      }
    } else {
      toast.info(
        `Edição múltipla não disponível. Selecione apenas uma localização.`
      );
    }
  };

  const handleCreateEditSuccess = () => {
    // Recarregar dados após criação/edição
    queryClient.invalidateQueries({ queryKey: LOCATIONS_QUERY_KEY });
  };

  const handleLocationsDuplicate = (ids: string[]) => {
    setItemsToDuplicate(ids);
    setIsDuplicateDialogOpen(true);
  };

  const handleDuplicateConfirm = async () => {
    setIsDuplicateDialogOpen(false);
    setActiveOperation('duplicate');
    await batchDuplicate.start(itemsToDuplicate);
  };

  const handleLocationsDelete = (ids: string[]) => {
    setItemsToDelete(ids);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleteDialogOpen(false);
    setActiveOperation('delete');
    await batchDelete.start(itemsToDelete);
  };

  const handleSelectRange = (startId: string, endId: string) => {
    const allIds = filteredLocations.map(l => l.id);
    selectRange(startId, endId, allIds);
  };

  const stats = [
    {
      label: 'Total de Localizações',
      value: rootLocations.length,
      icon: <Warehouse className="w-5 h-5" />,
      trend: 5,
    },
    {
      label: 'Ativas',
      value: rootLocations.filter(l => l.isActive).length,
      icon: <CheckCircle className="w-5 h-5" />,
    },
    {
      label: 'Com Sublocalizações',
      value: rootLocations.filter(l => {
        const sublocations = locations.filter(sub => sub.parentId === l.id);
        return sublocations.length > 0;
      }).length,
      icon: <MapPin className="w-5 h-5" />,
    },
    {
      label: 'Tipos Diferentes',
      value: new Set(rootLocations.map(l => l.type)).size,
      icon: <Warehouse className="w-5 h-5" />,
    },
  ];

  const faqs = [
    {
      question: 'O que são localizações?',
      answer:
        'Localizações são os lugares físicos onde os itens do estoque são armazenados. Elas podem ser organizadas hierarquicamente, com localizações principais e sublocalizações.',
    },
    {
      question: 'Como criar uma nova localização?',
      answer:
        'Clique no botão "Nova Localização", defina um nome e código único. Você pode especificar o tipo (armazém, prateleira, etc.) e adicionar notas descritivas.',
    },
    {
      question: 'Posso importar localizações em massa?',
      answer:
        'Sim! Use o botão "Importar" para fazer upload de um arquivo CSV ou Excel com múltiplas localizações. Baixe nosso modelo para garantir a formatação correta.',
    },
    {
      question: 'Como organizar localizações hierarquicamente?',
      answer:
        'Ao editar uma localização, você pode definir uma localização pai. Isso cria uma estrutura hierárquica onde uma localização principal pode ter múltiplas sublocalizações.',
    },
  ];

  if (isLoading) {
    return (
      <ProtectedRoute requiredRole="MANAGER">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Carregando localizações...
            </p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    const isAuthError =
      error.message?.includes('401') ||
      error.message?.includes('Unauthorized') ||
      error.message?.includes('autenticação');
    return (
      <ProtectedRoute requiredRole="MANAGER">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {isAuthError
                ? 'Autenticação Necessária'
                : 'Erro ao Carregar Localizações'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {isAuthError
                ? 'Você precisa estar logado para acessar as localizações. Faça login e tente novamente.'
                : 'Ocorreu um erro ao carregar as localizações. Tente recarregar a página ou entre em contato com o suporte se o problema persistir.'}
            </p>
            {isAuthError ? (
              <button
                onClick={() => router.push('/auth/login')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Fazer Login
              </button>
            ) : (
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Recarregar Página
              </button>
            )}
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="MANAGER">
      <div className="flex-col flex gap-4">
        <PageHeader
          title="Localizações"
          description="Gerencie os locais físicos de armazenamento do seu estoque."
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
              text: 'Nova Localização',
              onClick: handleNavigateToNew,
              variant: 'default',
            },
          ]}
        />

        <SearchSection
          searchPlaceholder="Buscar localizações..."
          onSearch={handleSearch}
        />

        <StatsSection stats={stats} defaultExpanded />

        <ItemsGrid
          items={filteredLocations}
          isSearching={!!searchQuery.trim()}
          selectedIds={selectedIds}
          onItemClick={handleLocationClick}
          onItemDoubleClick={handleLocationDoubleClick}
          onItemsView={handleLocationsView}
          onItemsEdit={handleLocationsEdit}
          onItemsDuplicate={handleLocationsDuplicate}
          onItemsDelete={handleLocationsDelete}
          onClearSelection={clearSelection}
          onSelectRange={handleSelectRange}
          renderGridItem={(location, isSelected) => (
            <LocationGridCard
              code={location.code}
              name={location.name}
              type={location.type}
              capacity={location.capacity}
              currentOccupancy={location.currentOccupancy}
              isActive={location.isActive}
              createdAt={location.createdAt}
              updatedAt={location.updatedAt}
              isSelected={isSelected}
            />
          )}
          renderListItem={(location, isSelected) => (
            <LocationListCard
              code={location.code}
              name={location.name}
              type={location.type}
              capacity={location.capacity}
              currentOccupancy={location.currentOccupancy}
              isActive={location.isActive}
              createdAt={location.createdAt}
              updatedAt={location.updatedAt}
              isSelected={isSelected}
            />
          )}
          emptyMessage="Nenhuma localização encontrada"
        />

        <QuickCreateLocationModal
          isOpen={isQuickCreateModalOpen}
          onClose={() => setIsQuickCreateModalOpen(false)}
          onSubmit={handleQuickCreate}
        />

        <ImportLocationsModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImport={handleImportLocations}
        />

        <HelpModal
          isOpen={isHelpModalOpen}
          onClose={() => setIsHelpModalOpen(false)}
          title="Localizações"
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
                  ? 'Tem certeza que deseja excluir esta localização? Esta ação não pode ser desfeita.'
                  : `Tem certeza que deseja excluir ${itemsToDelete.length} localizações? Esta ação não pode ser desfeita.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={deleteLocationMutation.isPending}
                className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
              >
                {deleteLocationMutation.isPending ? 'Excluindo...' : 'Excluir'}
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
                  ? 'Tem certeza que deseja duplicar esta localização?'
                  : `Tem certeza que deseja duplicar ${itemsToDuplicate.length} localizações? Isso criará ${itemsToDuplicate.length} novas localizações.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDuplicateConfirm}
                disabled={createLocationMutation.isPending}
              >
                {createLocationMutation.isPending
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
          itemName="localizações"
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
          itemName="localizações"
          onClose={() => {
            batchDuplicate.reset();
            setActiveOperation(null);
          }}
          onPause={batchDuplicate.pause}
          onResume={batchDuplicate.resume}
          onCancel={batchDuplicate.cancel}
        />

        <CreateEditLocationModal
          isOpen={isCreateEditModalOpen}
          onClose={() => {
            setIsCreateEditModalOpen(false);
            setEditingLocation(null);
          }}
          onSuccess={handleCreateEditSuccess}
          editLocation={editingLocation || undefined}
        />

        <BatchCreateLocationModal
          isOpen={isBatchCreateModalOpen}
          onClose={() => setIsBatchCreateModalOpen(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: LOCATIONS_QUERY_KEY });
            setIsBatchCreateModalOpen(false);
          }}
        />

        {/* Modal de visualização múltipla - TODO: Implementar */}
        {/* <MultiViewModal
          isOpen={isMultiViewModalOpen}
          onClose={() => {
            setIsMultiViewModalOpen(false);
            setMultiViewLocationIds([]);
          }}
          locations={locations.filter(l => multiViewLocationIds.includes(l.id))}
          availableLocations={locations}
          onAddLocation={locationId => {
            if (multiViewLocationIds.length < 5) {
              setMultiViewLocationIds([...multiViewLocationIds, locationId]);
            }
          }}
        /> */}
      </div>
    </ProtectedRoute>
  );
}
