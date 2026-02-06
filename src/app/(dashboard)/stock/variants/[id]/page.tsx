/**
 * OpenSea OS - Variant Detail Page
 * Página de detalhes da variante com listagem de itens
 */

'use client';

import { logger } from '@/lib/logger';
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
  ConfirmDialog,
  EntityCard,
  EntityGrid,
  useEntityCrud,
} from '@/core';
import { variantsService } from '@/services/stock';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Box,
  Edit,
  Loader2,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

export default function VariantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const variantId = params.id as string;

  // ============================================================================
  // STATE
  // ============================================================================

  const [searchQuery, setSearchQuery] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [isCreatingItem, setIsCreatingItem] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const {
    data: variantData,
    isLoading: isLoadingVariant,
    error: variantError,
  } = useQuery({
    queryKey: ['variants', variantId],
    queryFn: async () => {
      const response = await variantsService.getVariant(variantId);
      return response.variant;
    },
  });

  const {
    data: itemsData,
    isLoading: isLoadingItems,
    error: itemsError,
  } = useQuery({
    queryKey: ['items', 'variant', variantId],
    queryFn: async () => {
      // TODO: Implementar listagem de items por variant
      return [];
    },
  });

  // ============================================================================
  // CRUD SETUP FOR ITEMS
  // ============================================================================

  const itemCrud = useEntityCrud<any>({
    entityName: 'Item',
    entityNamePlural: 'Itens',
    queryKey: ['items', 'variant', variantId],
    baseUrl: `/api/v1/items`,
    listFn: async () => {
      // TODO: Implementar listagem de items por variant
      return [];
    },
    getFn: async (id: string) => {
      // TODO: Implementar get item
      return {} as any;
    },
    createFn: async data => {
      // TODO: Implementar create item
      return {} as any;
    },
    updateFn: async (id, data) => {
      // TODO: Implementar update item
      return {} as any;
    },
    deleteFn: async id => {
      // TODO: Implementar delete item
    },
  });

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const items = useMemo(() => itemsData || [], [itemsData]);

  const filteredItems = useMemo(() => {
    if (!items || items.length === 0) return [];
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      (item: any) =>
        item.name.toLowerCase().includes(q) ||
        (item.code?.toLowerCase().includes(q) ?? false) ||
        (item.barcode?.toLowerCase().includes(q) ?? false)
    );
  }, [items, searchQuery]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleItemDoubleClick = (item: any) => {
    router.push(`/stock/items/${item.id}`);
  };

  const handleDeleteVariant = async () => {
    try {
      await variantsService.deleteVariant(variantId);
      toast.success('Variante excluída com sucesso!');
      router.push('/stock/products');
    } catch (error) {
      logger.error(
        'Failed to delete variant',
        error instanceof Error ? error : new Error(String(error)),
        {
          variantId,
        }
      );
      toast.error('Erro ao excluir variante');
    }
  };

  const handleCreateSimpleItem = async () => {
    if (!itemName.trim()) {
      toast.error('Nome do item é obrigatório');
      return;
    }

    setIsCreatingItem(true);
    try {
      // TODO: Implementar criação de item
      toast.info('Criação de item ainda não implementada');

      // Limpar form e manter modal aberto
      setItemName('');

      // Revalidar dados dos items
      await queryClient.invalidateQueries({
        queryKey: ['items', 'variant', variantId],
      });

      // Focar novamente no input
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 0);
    } catch (error) {
      logger.error(
        'Failed to create item',
        error instanceof Error ? error : new Error(String(error)),
        {
          variantId,
        }
      );
      toast.error('Erro ao criar item');
    } finally {
      setIsCreatingItem(false);
    }
  };

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderGridCard = (item: any, isSelected: boolean) => (
    <EntityCard
      id={item.id}
      variant="grid"
      title={item.name}
      subtitle={item.code || 'Sem código'}
      icon={Box}
      iconBgColor="bg-gradient-to-br from-orange-500 to-amber-500"
      badges={[
        {
          label: item.barcode ? `${item.barcode}` : 'Sem código de barras',
          variant: 'outline' as const,
        },
        {
          label: item.status,
          variant:
            item.status === 'active'
              ? ('default' as const)
              : ('secondary' as const),
        },
      ]}
      showSelection={false}
      isSelected={isSelected}
    />
  );

  const renderListCard = (item: any, isSelected: boolean) => (
    <EntityCard
      id={item.id}
      variant="list"
      title={item.name}
      subtitle={item.code || 'Sem código'}
      icon={Box}
      iconBgColor="bg-gradient-to-br from-orange-500 to-amber-500"
      badges={[
        {
          label: item.barcode ? `${item.barcode}` : 'Sem código de barras',
          variant: 'outline' as const,
        },
        {
          label: item.status,
          variant:
            item.status === 'active'
              ? ('default' as const)
              : ('secondary' as const),
        },
      ]}
      showSelection={false}
      isSelected={isSelected}
    />
  );

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoadingVariant || isLoadingItems) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (variantError || !variantData) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-destructive">Variante não encontrada.</p>
      </div>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {variantData.name}
            </h1>
            <p className="text-muted-foreground">Itens da Variante</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Excluir Variante
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/stock/variants/${variantId}/edit`)}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            Editar Variante
          </Button>
          <Button
            size="sm"
            onClick={() => setCreateModalOpen(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Adicionar Item
          </Button>
        </div>
      </div>

      {/* Variant Metadata Card */}
      <Card className="p-6">
        <div className="flex items-start gap-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
            <Box className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                SKU
              </p>
              <p className="font-medium">{variantData.sku || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Preço
              </p>
              <p className="font-medium">
                R$ {variantData.price?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Barcode
              </p>
              <p className="font-medium">{variantData.barcode || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Itens
              </p>
              <p className="font-medium">{items.length}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar itens por nome, código ou código de barras..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Items Grid */}
      <EntityGrid
        config={itemsConfig}
        items={filteredItems || []}
        renderGridItem={renderGridCard}
        renderListItem={renderListCard}
        isLoading={isLoadingItems}
        emptyMessage="Nenhum item cadastrado ainda."
        onItemDoubleClick={handleItemDoubleClick}
      />

      {/* Create Item Dialog */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="item-name" className="text-sm font-medium">
                Nome do Item
              </label>
              <Input
                ref={nameInputRef}
                id="item-name"
                placeholder="Ex: Caixa 1, Embalagem A, etc"
                value={itemName}
                onChange={e => setItemName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    handleCreateSimpleItem();
                  }
                }}
                disabled={isCreatingItem}
                autoFocus
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateModalOpen(false)}
                disabled={isCreatingItem}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleCreateSimpleItem}
                disabled={isCreatingItem || !itemName.trim()}
              >
                {isCreatingItem && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Criar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Variant Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteVariant}
        title="Excluir Variante"
        description={`Tem certeza que deseja excluir a variante "${variantData.name}"? Esta ação não pode ser desfeita e todos os itens associados serão removidos.`}
      />
    </div>
  );
}
