'use client';

import { logger } from '@/lib/logger';
import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowRightLeft,
  Box,
  Filter,
  Loader2,
  MapPin,
  Package,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Trash2,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { PermissionGate } from '@/components/auth/permission-gate';
import { BatchAddToQueueButton, usePrintQueue } from '@/core/print-queue';

import { useItemsPaginated } from '@/hooks/stock/use-items';
import { itemsService } from '@/services/stock';
import { Pagination } from '../_shared/components/pagination';
import { ItemsGrid } from './src/components/items-grid';
import { ItemGridCard, ItemListCard } from './src/components/item-card';
import { EntryModal } from './src/modals/entry-modal';
import { ExitModal } from './src/modals/exit-modal';
import { TransferModal } from './src/modals/transfer-modal';
import { ItemDetailModal } from './src/modals/item-detail-modal';
import type { ItemExtended, ItemStatus, ItemsQuery } from '@/types/stock';

const STATUS_OPTIONS: { value: ItemStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos os Status' },
  { value: 'AVAILABLE', label: 'Disponível' },
  { value: 'RESERVED', label: 'Reservado' },
  { value: 'IN_TRANSIT', label: 'Em Trânsito' },
  { value: 'DAMAGED', label: 'Danificado' },
  { value: 'EXPIRED', label: 'Expirado' },
  { value: 'DISPOSED', label: 'Descartado' },
];

const SORT_OPTIONS = [
  { value: 'entryDate:desc', label: 'Mais Recentes' },
  { value: 'entryDate:asc', label: 'Mais Antigos' },
  { value: 'uniqueCode:asc', label: 'Código (A-Z)' },
  { value: 'uniqueCode:desc', label: 'Código (Z-A)' },
  { value: 'currentQuantity:desc', label: 'Maior Quantidade' },
  { value: 'currentQuantity:asc', label: 'Menor Quantidade' },
];

export default function ItemsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { actions } = usePrintQueue();

  // Query state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState<ItemStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState('entryDate:desc');

  // Modal state
  const [selectedItem, setSelectedItem] = useState<ItemExtended | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Parse sort
  const [sortField, sortOrder] = sortBy.split(':') as [string, 'asc' | 'desc'];

  // Build query
  const query: ItemsQuery = useMemo(
    () => ({
      page,
      limit,
      search: debouncedSearch || undefined,
      status: status !== 'all' ? status : undefined,
      sortBy: sortField,
      sortOrder,
    }),
    [page, limit, debouncedSearch, status, sortField, sortOrder]
  );

  // Fetch items
  const { data, isLoading, error, refetch } = useItemsPaginated(query);

  const items = data?.items || [];
  const pagination = data?.pagination;

  // Search debounce
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, []);

  // Selection handlers
  const handleItemClick = useCallback(
    (id: string, event: React.MouseEvent) => {
      if (event.ctrlKey || event.metaKey) {
        // Toggle selection
        setSelectedIds(prev => {
          const next = new Set(prev);
          if (next.has(id)) {
            next.delete(id);
          } else {
            next.add(id);
          }
          return next;
        });
      } else if (event.shiftKey && selectedIds.size > 0) {
        // Range selection
        const itemIds = items.map(i => i.id);
        const lastSelectedIndex = itemIds.findIndex(i => selectedIds.has(i));
        const currentIndex = itemIds.indexOf(id);
        const [start, end] = [lastSelectedIndex, currentIndex].sort(
          (a, b) => a - b
        );
        const rangeIds = itemIds.slice(start, end + 1);
        setSelectedIds(new Set(rangeIds));
      } else {
        // Single selection
        setSelectedIds(new Set([id]));
      }
    },
    [items, selectedIds]
  );

  const handleItemDoubleClick = useCallback(
    (id: string) => {
      const item = items.find(i => i.id === id);
      if (item) {
        setSelectedItem(item);
        setIsDetailModalOpen(true);
      }
    },
    [items]
  );

  const handleClearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // Action handlers
  const handleRefresh = useCallback(() => {
    refetch();
    toast.success('Lista atualizada');
  }, [refetch]);

  const handleView = useCallback(
    (ids: string[]) => {
      if (ids.length === 1) {
        const item = items.find(i => i.id === ids[0]);
        if (item) {
          setSelectedItem(item);
          setIsDetailModalOpen(true);
        }
      }
    },
    [items]
  );

  const handleDelete = useCallback(
    async (ids: string[]) => {
      if (!confirm(`Tem certeza que deseja excluir ${ids.length} item(s)?`)) {
        return;
      }

      try {
        await Promise.all(ids.map(id => itemsService.deleteItem(id)));
        toast.success(`${ids.length} item(s) excluído(s)`);
        setSelectedIds(new Set());
        queryClient.invalidateQueries({ queryKey: ['items'] });
      } catch (error) {
        toast.error('Erro ao excluir itens');
        logger.error(
          'Erro ao excluir itens',
          error instanceof Error ? error : undefined
        );
      }
    },
    [queryClient]
  );

  const handleTransferSelected = useCallback(() => {
    if (selectedIds.size === 0) {
      toast.warning('Selecione pelo menos um item');
      return;
    }
    setIsTransferModalOpen(true);
  }, [selectedIds]);

  const handleExitSelected = useCallback(() => {
    if (selectedIds.size === 0) {
      toast.warning('Selecione pelo menos um item');
      return;
    }
    setIsExitModalOpen(true);
  }, [selectedIds]);

  // Print handler - adds items to print queue via context menu
  const handlePrint = useCallback(
    (ids: string[]) => {
      const itemsToPrint = items.filter(i => ids.includes(i.id));
      if (itemsToPrint.length === 0) return;

      actions.addToQueue(itemsToPrint.map(item => ({ item })));
      toast.success(
        `${itemsToPrint.length} item(s) adicionado(s) à fila de impressão`
      );
    },
    [items, actions]
  );

  // Filter reset
  const hasFilters = status !== 'all' || debouncedSearch;
  const handleResetFilters = useCallback(() => {
    setSearch('');
    setDebouncedSearch('');
    setStatus('all');
    setSortBy('entryDate:desc');
    setPage(1);
  }, []);

  // Selected items for batch operations
  const selectedItems = useMemo(
    () => items.filter(i => selectedIds.has(i.id)),
    [items, selectedIds]
  );

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-destructive mb-4">Erro ao carregar itens</div>
        <Button onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Box className="h-6 w-6" />
            Itens em Estoque
          </h1>
          <p className="text-muted-foreground">
            Gerencie os itens físicos do estoque
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>

          <PermissionGate permission="items.create">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Movimentação
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEntryModalOpen(true)}>
                  <ArrowDownToLine className="h-4 w-4 mr-2 text-green-600" />
                  Entrada de Estoque
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsExitModalOpen(true)}>
                  <ArrowUpFromLine className="h-4 w-4 mr-2 text-red-600" />
                  Saída de Estoque
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsTransferModalOpen(true)}>
                  <ArrowRightLeft className="h-4 w-4 mr-2 text-blue-600" />
                  Transferência
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </PermissionGate>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por código, lote..."
                value={search}
                onChange={e => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select
              value={status}
              onValueChange={v => {
                setStatus(v as ItemStatus | 'all');
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Reset Filters */}
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="shrink-0"
              >
                <X className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Selection Toolbar */}
      {selectedIds.size > 0 && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {selectedIds.size} selecionado(s)
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSelection}
                >
                  Limpar seleção
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <PermissionGate permission="items.update">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTransferSelected}
                  >
                    <ArrowRightLeft className="h-4 w-4 mr-1" />
                    Transferir
                  </Button>
                </PermissionGate>

                <PermissionGate permission="items.update">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExitSelected}
                  >
                    <ArrowUpFromLine className="h-4 w-4 mr-1" />
                    Saída
                  </Button>
                </PermissionGate>

                <BatchAddToQueueButton
                  items={selectedItems.map(item => ({ item }))}
                  showLabel
                  onAdded={() => {
                    // Opcional: limpar seleção após adicionar
                  }}
                />

                <PermissionGate permission="items.delete">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(Array.from(selectedIds))}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Excluir
                  </Button>
                </PermissionGate>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Items Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <ItemsGrid
          items={items}
          selectedIds={selectedIds}
          onItemClick={handleItemClick}
          onItemDoubleClick={handleItemDoubleClick}
          onItemsView={handleView}
          onItemsPrint={handlePrint}
          onItemsDelete={handleDelete}
          onClearSelection={handleClearSelection}
          renderGridItem={(item, isSelected) => (
            <ItemGridCard item={item} isSelected={isSelected} />
          )}
          renderListItem={(item, isSelected) => (
            <ItemListCard item={item} isSelected={isSelected} />
          )}
          emptyMessage={
            hasFilters
              ? 'Nenhum item encontrado com os filtros aplicados'
              : 'Nenhum item cadastrado'
          }
        />
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <Pagination
          pagination={pagination}
          onPageChange={setPage}
          onLimitChange={(size: number) => {
            setLimit(size);
            setPage(1);
          }}
        />
      )}

      {/* Modals */}
      <EntryModal
        open={isEntryModalOpen}
        onOpenChange={setIsEntryModalOpen}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['items'] });
        }}
      />

      <ExitModal
        open={isExitModalOpen}
        onOpenChange={setIsExitModalOpen}
        selectedItems={selectedItems}
        onSuccess={() => {
          setSelectedIds(new Set());
          queryClient.invalidateQueries({ queryKey: ['items'] });
        }}
      />

      <TransferModal
        open={isTransferModalOpen}
        onOpenChange={setIsTransferModalOpen}
        selectedItems={selectedItems}
        onSuccess={() => {
          setSelectedIds(new Set());
          queryClient.invalidateQueries({ queryKey: ['items'] });
        }}
      />

      <ItemDetailModal
        item={selectedItem}
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
      />
    </div>
  );
}
