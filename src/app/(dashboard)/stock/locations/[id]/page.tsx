/**
 * Location Sublocations Page
 * Página para gerenciar sublocalizações de uma localização específica
 */

'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
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
import { Button } from '@/components/ui/button';
import { SelectionProvider, useSelection } from '@/contexts/selection-context';
import {
  useCreateLocation,
  useDeleteLocation,
  useLocation,
  useLocations,
} from '@/hooks/stock/use-stock-other';
import { useBatchOperation } from '@/hooks/use-batch-operation-v2';
import type { CreateLocationRequest } from '@/types/stock';
import { useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle,
  ChevronRight,
  Edit,
  Grid3x2,
  HelpCircle,
  MapPin,
  Package,
  Plus,
  SquareDashed,
  SquareSquare,
  SquareStack,
  Trash2,
  Warehouse,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Fragment, use, useCallback, useState } from 'react';
import { toast } from 'sonner';

// Query key para locations
const LOCATIONS_QUERY_KEY = ['locations'];

export default function LocationSublocationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <ProtectedRoute requiredRole="MANAGER">
      <SelectionProvider>
        <LocationSublocationsPageContent params={params} />
      </SelectionProvider>
    </ProtectedRoute>
  );
}

function LocationSublocationsPageContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id: locationId } = use(params);
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isQuickCreateModalOpen, setIsQuickCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
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

  // TanStack Query hooks
  const { data: location, isLoading: isLoadingLocation } =
    useLocation(locationId);
  const { data: locations = [], isLoading: isLoadingLocations } =
    useLocations();
  const createLocationMutation = useCreateLocation();
  const deleteLocationMutation = useDeleteLocation();

  const getAncestors = useCallback(
    (locs: typeof locations, currentId: string) => {
      const ancestors: typeof locations = [];
      let current: (typeof locations)[0] | undefined = locs.find(
        l => l.id === currentId
      );
      while (current && current.parentId) {
        const parent = locs.find(l => l.id === current!.parentId);
        if (parent) {
          ancestors.unshift(parent);
          current = parent;
        } else {
          break;
        }
      }
      return ancestors;
    },
    []
  );

  const getLocationIcon = (type: string) => {
    const iconMap = {
      WAREHOUSE: Warehouse,
      ZONE: SquareDashed,
      AISLE: SquareStack,
      SHELF: Grid3x2,
      BIN: SquareSquare,
      OTHER: Package,
    };
    return iconMap[type as keyof typeof iconMap] || MapPin;
  };

  const ancestors = getAncestors(locations, locationId);
  const breadcrumbItems = [...ancestors, location];

  // Filtrar apenas sublocalizações desta localização
  const sublocations = locations.filter(l => l.parentId === locationId);

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
              ? 'Sublocalização excluída com sucesso!'
              : `${succeeded} sublocalizações excluídas com sucesso!`
          );
        } else if (succeeded > 0) {
          toast.warning(
            `${succeeded} sublocalizações excluídas, mas ${failed} falharam.`
          );
        } else {
          toast.error('Erro ao excluir sublocalizações');
        }

        clearSelection();
      },
    }
  );

  // Batch duplicate operation
  const batchDuplicate = useBatchOperation(
    async (id: string) => {
      const sublocation = locations.find(l => l.id === id);
      if (!sublocation) throw new Error('Sublocalização não encontrada');

      const data: CreateLocationRequest = {
        titulo: `${sublocation.name} (cópia)`,
        type: sublocation.type,
        parentId: locationId, // Mantém a mesma localização pai
        isActive: sublocation.isActive,
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
              ? 'Sublocalização duplicada com sucesso!'
              : `${succeeded} sublocalizações duplicadas com sucesso!`
          );
        } else if (succeeded > 0) {
          toast.warning(
            `${succeeded} sublocalizações duplicadas, mas ${failed} falharam.`
          );
        } else {
          toast.error('Erro ao duplicar sublocalizações');
        }

        clearSelection();
      },
    }
  );

  // Filtrar sublocalizações com base na busca
  const filteredSublocations = searchQuery.trim()
    ? sublocations.filter(
        sublocation =>
          (sublocation.name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ??
            false) ||
          sublocation.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          sublocation.type?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sublocations;

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleQuickCreate = async (code: string, name?: string) => {
    try {
      const data: CreateLocationRequest = {
        titulo: name || code, // Usa o nome se fornecido, senão usa o código como descrição
        type: 'SHELF',
        parentId: locationId, // Define automaticamente como sublocalização
        isActive: true,
      };
      await createLocationMutation.mutateAsync(data);
      toast.success('Sublocalização criada com sucesso!');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro desconhecido';
      const errorDetails = JSON.stringify(
        {
          error: message,
          sublocationCode: code,
          sublocationName: name,
          parentLocationId: locationId,
          timestamp: new Date().toISOString(),
        },
        null,
        2
      );

      toast.error('Erro ao criar sublocalização', {
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
    setIsCreateEditModalOpen(true);
  };

  const handleEditLocation = (locationId: string) => {
    const locationToEdit = locations.find(l => l.id === locationId);
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
  };

  const handleCreateEditSuccess = () => {
    // Recarregar dados após criação/edição
    queryClient.invalidateQueries({ queryKey: LOCATIONS_QUERY_KEY });
  };

  const handleImportLocations = async (file: File) => {
    // TODO: Implementar importação de localizações
    console.log('Importando arquivo:', file.name);
  };

  const handleSublocationClick = (id: string, event: React.MouseEvent) => {
    if (event.shiftKey && lastSelectedId) {
      // Shift+Click: seleção em range
      const allIds = filteredSublocations.map(l => l.id);
      selectRange(lastSelectedId, id, allIds);
    } else {
      // Click normal ou Ctrl+Click
      selectItem(id, event);
    }
  };

  const handleSublocationDoubleClick = (id: string) => {
    router.push(`/stock/locations/${id}`);
  };

  const handleSublocationsView = (ids: string[]) => {
    if (ids.length === 1) {
      router.push(`/stock/locations/${ids[0]}`);
    } else {
      toast.info(
        `Visualização múltipla não disponível. Selecione apenas uma sublocalização.`
      );
    }
  };

  const handleSublocationsEdit = (ids: string[]) => {
    if (ids.length === 1) {
      router.push(`/stock/locations/${ids[0]}/edit`);
    } else {
      toast.info(
        `Edição múltipla não disponível. Selecione apenas uma sublocalização.`
      );
    }
  };

  const handleSublocationsDuplicate = (ids: string[]) => {
    setItemsToDuplicate(ids);
    setIsDuplicateDialogOpen(true);
  };

  const handleDuplicateConfirm = async () => {
    setIsDuplicateDialogOpen(false);
    setActiveOperation('duplicate');
    await batchDuplicate.start(itemsToDuplicate);
  };

  const handleSublocationsDelete = (ids: string[]) => {
    setItemsToDelete(ids);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleteDialogOpen(false);
    setActiveOperation('delete');
    await batchDelete.start(itemsToDelete);
  };

  const handleSelectRange = (startId: string, endId: string) => {
    const allIds = filteredSublocations.map(l => l.id);
    selectRange(startId, endId, allIds);
  };

  const stats = [
    {
      label: 'Total de Sublocalizações',
      value: sublocations.length,
      icon: <MapPin className="w-5 h-5" />,
      trend: 5,
    },
    {
      label: 'Ativas',
      value: sublocations.filter(l => l.isActive).length,
      icon: <CheckCircle className="w-5 h-5" />,
    },
    {
      label: 'Tipos Diferentes',
      value: new Set(sublocations.map(l => l.type)).size,
      icon: <Warehouse className="w-5 h-5" />,
    },
    {
      label: 'Com Sub-sublocalizações',
      value: sublocations.filter(l => {
        const subSubs = locations.filter(sub => sub.parentId === l.id);
        return subSubs.length > 0;
      }).length,
      icon: <MapPin className="w-5 h-5" />,
    },
  ];

  const faqs = [
    {
      question: 'O que são sublocalizações?',
      answer:
        'Sublocalizações são locais filhos de uma localização pai. Por exemplo, um armazém pode ter prateleiras como sublocalizações, e cada prateleira pode ter caixas como sublocalizações.',
    },
    {
      question: 'Como criar uma nova sublocalização?',
      answer:
        'Clique no botão "Nova Sublocalização". O sistema automaticamente definirá a localização atual como pai da nova sublocalização.',
    },
    {
      question: 'Posso reorganizar a hierarquia?',
      answer:
        'Sim! Ao editar uma sublocalização, você pode alterar sua localização pai para reorganizar a estrutura hierárquica do estoque.',
    },
  ];

  if (isLoadingLocation || isLoadingLocations) {
    return (
      <ProtectedRoute requiredRole="MANAGER">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Carregando sublocalizações...
            </p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!location) {
    return (
      <ProtectedRoute requiredRole="MANAGER">
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <p className="text-red-600 dark:text-red-400">
              Localização não encontrada
            </p>
            <Button onClick={() => router.push('/stock/locations')}>
              Voltar
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="MANAGER">
      <div className="flex-col flex gap-4">
        <PageHeader
          title={`${location.name || location.code}`}
          description={`${location.type} - ${location.isActive ? 'Ativa' : 'Inativa'}`}
          buttons={[
            {
              icon: Trash2,
              text: 'Excluir',
              onClick: () => {
                setItemsToDelete([locationId]);
                setIsDeleteDialogOpen(true);
              },
              variant: 'outline',
              style: { iconColor: 'text-red-600' },
            },
            {
              icon: Edit,
              text: 'Editar',
              onClick: () => handleEditLocation(locationId),
            },
          ]}
          showBackButton={false}
        />

        <SearchSection
          searchPlaceholder="Buscar sublocalizações..."
          onSearch={handleSearch}
        />

        <StatsSection stats={stats} defaultExpanded />

        {/* Breadcrumb e Ações */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
            {breadcrumbItems.map((item, index) => {
              const Icon = getLocationIcon(item!.type);
              const isLast = index === breadcrumbItems.length - 1;
              return (
                <Fragment key={item!.id || index}>
                  {index > 0 && <ChevronRight className="w-4 h-4" />}
                  {isLast ? (
                    <span className="flex items-center">
                      <Icon className="w-4 h-4 mr-1" />
                      {item!.name || item!.code}
                    </span>
                  ) : (
                    <Link
                      href={`/stock/locations/${item!.id}`}
                      className="flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <Icon className="w-4 h-4 mr-1" />
                      {item!.name || item!.code}
                    </Link>
                  )}
                </Fragment>
              );
            })}
          </nav>

          {/* Ações */}
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsHelpModalOpen(true)}
              className="h-10"
            >
              <HelpCircle className="w-4 h-4" />
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleNavigateToNew}
              className="h-10"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Sublocalização
            </Button>
          </div>
        </div>

        <ItemsGrid
          items={filteredSublocations}
          isSearching={!!searchQuery.trim()}
          selectedIds={selectedIds}
          onItemClick={handleSublocationClick}
          onItemDoubleClick={handleSublocationDoubleClick}
          onItemsView={handleSublocationsView}
          onItemsEdit={handleSublocationsEdit}
          onItemsDuplicate={handleSublocationsDuplicate}
          onItemsDelete={handleSublocationsDelete}
          onClearSelection={clearSelection}
          onSelectRange={handleSelectRange}
          renderGridItem={(sublocation, isSelected) => (
            <LocationGridCard
              code={sublocation.code}
              name={sublocation.name}
              type={sublocation.type}
              capacity={sublocation.capacity}
              currentOccupancy={sublocation.currentOccupancy}
              isActive={sublocation.isActive}
              createdAt={sublocation.createdAt}
              updatedAt={sublocation.updatedAt}
              isSelected={isSelected}
            />
          )}
          renderListItem={(sublocation, isSelected) => (
            <LocationListCard
              code={sublocation.code}
              name={sublocation.name}
              type={sublocation.type}
              capacity={sublocation.capacity}
              currentOccupancy={sublocation.currentOccupancy}
              isActive={sublocation.isActive}
              createdAt={sublocation.createdAt}
              updatedAt={sublocation.updatedAt}
              isSelected={isSelected}
            />
          )}
          emptyMessage="Nenhuma sublocalização encontrada"
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
          title="Sublocalizações"
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
                  ? 'Tem certeza que deseja excluir esta sublocalização? Esta ação não pode ser desfeita.'
                  : `Tem certeza que deseja excluir ${itemsToDelete.length} sublocalizações? Esta ação não pode ser desfeita.`}
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
                  ? 'Tem certeza que deseja duplicar esta sublocalização?'
                  : `Tem certeza que deseja duplicar ${itemsToDuplicate.length} sublocalizações? Isso criará ${itemsToDuplicate.length} novas sublocalizações.`}
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
          itemName="sublocalizações"
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
          itemName="sublocalizações"
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
          parentLocation={{
            id: locationId,
            type: location.type,
            code: location.code,
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
