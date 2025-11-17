/**
 * Items Grid Component
 * Exibição de itens em formato grid ou lista com seleção múltipla
 */

'use client';

import { ItemContextMenu } from '@/components/stock/item-context-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Grid3x3, List, RefreshCw, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

export type ViewMode = 'grid' | 'list';

interface ItemsGridProps<T> {
  items: T[];
  renderGridItem: (item: T, isSelected: boolean) => React.ReactNode;
  renderListItem: (item: T, isSelected: boolean) => React.ReactNode;
  emptyMessage?: string;
  defaultView?: ViewMode;
  isSearching?: boolean;
  selectedIds?: Set<string>;
  onItemClick?: (id: string, event: React.MouseEvent) => void;
  onItemDoubleClick?: (id: string) => void;
  onItemsView?: (ids: string[]) => void;
  onItemsEdit?: (ids: string[]) => void;
  onItemsDuplicate?: (ids: string[]) => void;
  onItemsDelete?: (ids: string[]) => void;
  onClearSelection?: () => void;
  onSelectRange?: (startId: string, endId: string) => void;
}

export function ItemsGrid<T extends { id: string }>({
  items,
  renderGridItem,
  renderListItem,
  emptyMessage = 'Nenhum item encontrado',
  defaultView = 'grid',
  isSearching = false,
  selectedIds = new Set(),
  onItemClick,
  onItemDoubleClick,
  onItemsView,
  onItemsEdit,
  onItemsDuplicate,
  onItemsDelete,
  onClearSelection,
  onSelectRange,
}: ItemsGridProps<T>) {
  const [viewMode, setViewMode] = useState<ViewMode>(defaultView);
  const [isDragging, setIsDragging] = useState(false);
  const [isDragStarted, setIsDragStarted] = useState(false);
  const [selectionBox, setSelectionBox] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const dragEndRef = useRef<{ x: number; y: number } | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const DRAG_THRESHOLD = 5; // pixels mínimos de movimento para iniciar drag

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Permite drag começando em qualquer lugar
    // Só prevenimos default se não for um card
    const target = e.target as HTMLElement;
    const clickedOnCard = target.closest('[data-item-card]');

    if (!clickedOnCard) {
      e.preventDefault();
    }

    setIsDragging(true);
    setIsDragStarted(false);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    dragEndRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging && dragStartRef.current) {
        dragEndRef.current = { x: e.clientX, y: e.clientY };

        // Verifica se moveu o suficiente para iniciar drag
        const deltaX = Math.abs(e.clientX - dragStartRef.current.x);
        const deltaY = Math.abs(e.clientY - dragStartRef.current.y);
        const movedEnough = deltaX > DRAG_THRESHOLD || deltaY > DRAG_THRESHOLD;

        if (movedEnough && !isDragStarted) {
          setIsDragStarted(true);
          // Limpa seleção quando começa o drag
          if (onClearSelection) {
            onClearSelection();
          }
        }

        if (isDragStarted) {
          // Cancelar frame anterior se existir
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
          }

          // Agendar atualização visual para o próximo frame
          animationFrameRef.current = requestAnimationFrame(() => {
            if (dragStartRef.current && dragEndRef.current) {
              const x = Math.min(dragStartRef.current.x, dragEndRef.current.x);
              const y = Math.min(dragStartRef.current.y, dragEndRef.current.y);
              const width = Math.abs(
                dragEndRef.current.x - dragStartRef.current.x
              );
              const height = Math.abs(
                dragEndRef.current.y - dragStartRef.current.y
              );

              setSelectionBox({ x, y, width, height });
            }
          });
        }
      }
    },
    [isDragging, isDragStarted, DRAG_THRESHOLD, onClearSelection]
  );

  const handleMouseUp = useCallback(() => {
    if (
      isDragging &&
      isDragStarted &&
      dragStartRef.current &&
      dragEndRef.current &&
      onSelectRange
    ) {
      // Cancelar qualquer animação pendente
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      // Calcular quais itens estão dentro da área de seleção
      const selectionRect = {
        left: Math.min(dragStartRef.current.x, dragEndRef.current.x),
        top: Math.min(dragStartRef.current.y, dragEndRef.current.y),
        right: Math.max(dragStartRef.current.x, dragEndRef.current.x),
        bottom: Math.max(dragStartRef.current.y, dragEndRef.current.y),
      };

      const selectedInDrag: string[] = [];
      itemRefs.current.forEach((element, id) => {
        const rect = element.getBoundingClientRect();

        // Define margem interna de 10px (elimina área da borda)
        const INNER_MARGIN = 10;
        const innerRect = {
          left: rect.left + INNER_MARGIN,
          right: rect.right - INNER_MARGIN,
          top: rect.top + INNER_MARGIN,
          bottom: rect.bottom - INNER_MARGIN,
        };

        // Verifica se há intersecção entre a área interna e o retângulo de seleção
        const hasIntersection =
          innerRect.left < selectionRect.right &&
          innerRect.right > selectionRect.left &&
          innerRect.top < selectionRect.bottom &&
          innerRect.bottom > selectionRect.top;

        if (hasIntersection) {
          selectedInDrag.push(id);
        }
      });

      if (selectedInDrag.length > 0) {
        onSelectRange(
          selectedInDrag[0],
          selectedInDrag[selectedInDrag.length - 1]
        );
      }
    }

    setIsDragging(false);
    setIsDragStarted(false);
    setSelectionBox(null);
    dragStartRef.current = null;
    dragEndRef.current = null;
  }, [isDragging, isDragStarted, onSelectRange]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleItemClick = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (onItemClick) {
        onItemClick(id, e);
      }
    },
    [onItemClick]
  );

  const handleItemDoubleClick = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (onItemDoubleClick) {
        onItemDoubleClick(id);
      }
    },
    [onItemDoubleClick]
  );

  const getContextMenuHandlers = useCallback(
    (id: string) => {
      const isMultiple = selectedIds.has(id) && selectedIds.size > 1;
      const ids = isMultiple ? Array.from(selectedIds) : [id];

      return {
        onView: onItemsView ? () => onItemsView(ids) : undefined,
        onEdit: onItemsEdit ? () => onItemsEdit(ids) : undefined,
        onDuplicate: onItemsDuplicate ? () => onItemsDuplicate(ids) : undefined,
        onDelete: onItemsDelete ? () => onItemsDelete(ids) : undefined,
        isMultipleSelection: isMultiple,
        selectedCount: ids.length,
      };
    },
    [selectedIds, onItemsView, onItemsEdit, onItemsDuplicate, onItemsDelete]
  );

  const setItemRef = useCallback(
    (id: string, element: HTMLDivElement | null) => {
      if (element) {
        itemRefs.current.set(id, element);
      } else {
        itemRefs.current.delete(id);
      }
    },
    []
  );

  if (items.length === 0) {
    return (
      <Card className="p-12 text-center backdrop-blur-xl bg-white/80 dark:bg-white/5 border-gray-200/50 dark:border-white/10">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
          <Grid3x3 className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-600 dark:text-white/60">{emptyMessage}</p>
      </Card>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {items.length} {items.length === 1 ? 'item' : 'itens'}
          {selectedIds.size > 0 &&
            ` · ${selectedIds.size} selecionado${selectedIds.size > 1 ? 's' : ''}`}
        </p>
        <div className="flex items-center gap-2 backdrop-blur-xl bg-white/80 dark:bg-white/5 border border-gray-200/50 dark:border-white/10 rounded-xl p-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode('grid')}
            className={`rounded-lg ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-white/10 shadow-sm'
                : 'hover:bg-gray-100 dark:hover:bg-white/5'
            }`}
          >
            <Grid3x3 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode('list')}
            className={`rounded-lg ${
              viewMode === 'list'
                ? 'bg-white dark:bg-white/10 shadow-sm'
                : 'hover:bg-gray-100 dark:hover:bg-white/5'
            }`}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        className="relative"
        style={{ userSelect: 'none' }}
      >
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((item, index) => {
              const ItemWrapper = isSearching ? 'div' : motion.div;
              const animationProps = isSearching
                ? {}
                : {
                    initial: { opacity: 0, y: 20 },
                    animate: { opacity: 1, y: 0 },
                    transition: { delay: index * 0.05 },
                  };
              const isSelected = selectedIds.has(item.id);
              const contextHandlers = getContextMenuHandlers(item.id);

              return (
                <ItemContextMenu key={item.id} {...contextHandlers}>
                  <ItemWrapper
                    data-item-card
                    ref={(el: HTMLDivElement | null) => setItemRef(item.id, el)}
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      handleItemClick(item.id, e);
                    }}
                    onDoubleClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      handleItemDoubleClick(item.id, e);
                    }}
                    {...animationProps}
                  >
                    {renderGridItem(item, isSelected)}
                  </ItemWrapper>
                </ItemContextMenu>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => {
              const ItemWrapper = isSearching ? 'div' : motion.div;
              const animationProps = isSearching
                ? {}
                : {
                    initial: { opacity: 0, x: -20 },
                    animate: { opacity: 1, x: 0 },
                    transition: { delay: index * 0.03 },
                  };
              const isSelected = selectedIds.has(item.id);
              const contextHandlers = getContextMenuHandlers(item.id);

              return (
                <ItemContextMenu key={item.id} {...contextHandlers}>
                  <ItemWrapper
                    data-item-card
                    ref={(el: HTMLDivElement | null) => setItemRef(item.id, el)}
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      handleItemClick(item.id, e);
                    }}
                    onDoubleClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      handleItemDoubleClick(item.id, e);
                    }}
                    {...animationProps}
                  >
                    {renderListItem(item, isSelected)}
                  </ItemWrapper>
                </ItemContextMenu>
              );
            })}
          </div>
        )}

        {/* Drag Selection Rectangle */}
        {isDragging &&
          isDragStarted &&
          selectionBox &&
          selectionBox.width > 0 &&
          selectionBox.height > 0 && (
            <div
              className="fixed pointer-events-none border-2 border-blue-500 bg-blue-500/10 z-50 transition-none"
              style={{
                left: selectionBox.x,
                top: selectionBox.y,
                width: selectionBox.width,
                height: selectionBox.height,
                willChange: 'transform',
              }}
            />
          )}
      </div>
    </div>
  );
}

/**
 * Calcula se um item é novo ou foi atualizado nas últimas 24 horas
 */
function getItemBadge(
  createdAt: Date,
  updatedAt?: Date
): { isNew: boolean; isUpdated: boolean } {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const created = new Date(createdAt);
  const updated = updatedAt ? new Date(updatedAt) : null;

  // Verifica se foi criado nas últimas 24h
  const isNew = created > oneDayAgo;

  // Verifica se foi atualizado nas últimas 24h (e não é no momento da criação)
  const isUpdated =
    updated && updated > oneDayAgo && updated > created ? true : false;

  return { isNew, isUpdated };
}

// Template Card para Grid View
export function TemplateGridCard({
  name,
  attributesCount,
  createdAt,
  updatedAt,
  onClick,
  isSelected = false,
}: {
  name: string;
  attributesCount: number;
  createdAt: Date;
  updatedAt?: Date;
  onClick?: () => void;
  isSelected?: boolean;
}) {
  const { isNew, isUpdated } = getItemBadge(createdAt, updatedAt);

  return (
    <Card
      onClick={onClick}
      className={`p-6 backdrop-blur-xl border-gray-200/50 dark:border-white/10 hover:shadow-lg transition-all duration-200 cursor-pointer group ${
        isSelected
          ? 'bg-blue-500/20 dark:bg-blue-500/20 border-blue-500 ring-2 ring-blue-500'
          : 'bg-white/80 dark:bg-white/5 hover:bg-white/90 dark:hover:bg-white/10'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${
            isSelected
              ? 'bg-blue-600'
              : 'bg-linear-to-br from-blue-500 to-purple-600'
          }`}
        >
          <Grid3x3 className="w-6 h-6" />
        </div>
        <div className="flex gap-1">
          {/* Badge Novo */}
          {isNew && (
            <Badge
              variant="default"
              className="bg-cyan-400 dark:bg-cyan-500/70 text-white dark:text-white shadow-md shadow-cyan-400/50 dark:shadow-cyan-500/20"
            >
              <Sparkles className="w-3 h-3" />
              {/* Se foi atualizado, mostra só o ícone, senão mostra com texto */}
              {!isUpdated && <span className="ml-1">Novo</span>}
            </Badge>
          )}
          {/* Badge Atualizado */}
          {isUpdated && (
            <Badge
              variant="secondary"
              className="bg-amber-400 dark:bg-amber-500/70 text-white dark:text-white flex items-center gap-1 shadow-md shadow-amber-400/50 dark:shadow-amber-500/20"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Atualizado</span>
            </Badge>
          )}
        </div>
      </div>
      <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2 truncate">
        {name}
      </h3>
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-xs">
          {attributesCount} atributos
        </Badge>
      </div>
    </Card>
  );
}

// Template Card para List View
export function TemplateListCard({
  name,
  attributesCount,
  createdAt,
  updatedAt,
  onClick,
  isSelected = false,
}: {
  name: string;
  attributesCount: number;
  createdAt: Date | string;
  updatedAt?: Date | string;
  onClick?: () => void;
  isSelected?: boolean;
}) {
  const createdDate =
    typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
  const updatedDate = updatedAt
    ? typeof updatedAt === 'string'
      ? new Date(updatedAt)
      : updatedAt
    : undefined;
  const { isNew, isUpdated } = getItemBadge(createdDate, updatedDate);

  return (
    <Card
      onClick={onClick}
      className={`p-4 backdrop-blur-xl border-gray-200/50 dark:border-white/10 transition-all duration-200 cursor-pointer group ${
        isSelected
          ? 'bg-blue-500/20 dark:bg-blue-500/20 border-blue-500 ring-2 ring-blue-500'
          : 'bg-white/80 dark:bg-white/5 hover:bg-white/90 dark:hover:bg-white/10'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${
              isSelected
                ? 'bg-blue-600'
                : 'bg-linear-to-br from-blue-500 to-purple-600'
            }`}
          >
            <Grid3x3 className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              {name}
            </h3>
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <span>{attributesCount} atributos</span>
              <span>•</span>
              <span>
                {typeof createdAt === 'string'
                  ? createdAt
                  : createdDate.toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-1 ml-2">
          {/* Badge Novo */}
          {isNew && (
            <Badge
              variant="default"
              className="bg-cyan-400 dark:bg-cyan-500/70 text-white dark:text-white flex items-center shadow-md shadow-cyan-400/50 dark:shadow-cyan-500/20"
            >
              <Sparkles className="w-3 h-3" />
              {/* Se foi atualizado, mostra só o ícone, senão mostra com texto */}
              {!isUpdated && <span className="ml-1">Novo</span>}
            </Badge>
          )}
          {/* Badge Atualizado */}
          {isUpdated && (
            <Badge
              variant="secondary"
              className="bg-amber-400 dark:bg-amber-500/70 text-white dark:text-white flex items-center gap-1 shadow-md shadow-amber-400/50 dark:shadow-amber-500/20"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Atualizado</span>
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}
