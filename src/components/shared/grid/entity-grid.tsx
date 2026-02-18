/**
 * Entity Grid Component (Generic)
 * Exibição de itens em formato grid ou lista com seleção múltipla
 * Componente 100% genérico que funciona com qualquer entidade
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import { Grid3x3, List } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { EntityContextMenu } from '../context-menu/entity-context-menu';

export type ViewMode = 'grid' | 'list';

interface EntityGridProps<T> {
  items: T[];
  renderGridItem: (item: T, isSelected: boolean) => React.ReactNode;
  renderListItem: (item: T, isSelected: boolean) => React.ReactNode;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  defaultView?: ViewMode;
  isSearching?: boolean;
  selectedIds?: Set<string>;
  onItemClick?: (id: string, event: React.MouseEvent) => void;
  onItemDoubleClick?: (id: string) => void;
  onItemsView?: (ids: string[]) => void;
  onItemsEdit?: (ids: string[]) => void;
  onItemsDuplicate?: (ids: string[]) => void;
  onItemsStockMovement?: (ids: string[]) => void;
  onItemsCopyCode?: (ids: string[]) => void;
  onItemsDelete?: (ids: string[]) => void;
  onClearSelection?: () => void;
  onSelectRange?: (startId: string, endId: string) => void;
}

export function EntityGrid<T extends { id: string }>({
  items,
  renderGridItem,
  renderListItem,
  emptyMessage = 'Nenhum item encontrado',
  emptyIcon,
  defaultView = 'grid',
  isSearching = false,
  selectedIds = new Set(),
  onItemClick,
  onItemDoubleClick,
  onItemsView,
  onItemsEdit,
  onItemsDuplicate,
  onItemsStockMovement,
  onItemsCopyCode,
  onItemsDelete,
  onClearSelection,
  onSelectRange,
}: EntityGridProps<T>) {
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
  const DRAG_THRESHOLD = 5;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
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

        const deltaX = Math.abs(e.clientX - dragStartRef.current.x);
        const deltaY = Math.abs(e.clientY - dragStartRef.current.y);
        const movedEnough = deltaX > DRAG_THRESHOLD || deltaY > DRAG_THRESHOLD;

        if (movedEnough && !isDragStarted) {
          setIsDragStarted(true);
          if (onClearSelection) {
            onClearSelection();
          }
        }

        if (isDragStarted) {
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
          }

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
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      const selectionRect = {
        left: Math.min(dragStartRef.current.x, dragEndRef.current.x),
        top: Math.min(dragStartRef.current.y, dragEndRef.current.y),
        right: Math.max(dragStartRef.current.x, dragEndRef.current.x),
        bottom: Math.max(dragStartRef.current.y, dragEndRef.current.y),
      };

      const selectedInDrag: string[] = [];
      itemRefs.current.forEach((element, id) => {
        const rect = element.getBoundingClientRect();

        const INNER_MARGIN = 10;
        const innerRect = {
          left: rect.left + INNER_MARGIN,
          right: rect.right - INNER_MARGIN,
          top: rect.top + INNER_MARGIN,
          bottom: rect.bottom - INNER_MARGIN,
        };

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
        onStockMovement: onItemsStockMovement
          ? () => onItemsStockMovement(ids)
          : undefined,
        onCopyCode: onItemsCopyCode ? () => onItemsCopyCode(ids) : undefined,
        onDelete: onItemsDelete ? () => onItemsDelete(ids) : undefined,
        isMultipleSelection: isMultiple,
        selectedCount: ids.length,
      };
    },
    [
      selectedIds,
      onItemsView,
      onItemsEdit,
      onItemsDuplicate,
      onItemsStockMovement,
      onItemsCopyCode,
      onItemsDelete,
    ]
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
      <Card className="p-12 text-center bg-white/90 dark:bg-white/5 border-gray-200/50 dark:border-white/10">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
          {emptyIcon || <Grid3x3 className="w-8 h-8 text-gray-400" />}
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
        <div className="flex items-center gap-2 bg-white/90 dark:bg-white/5 border border-gray-200/50 dark:border-white/10 rounded-xl p-1">
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
            {items.map(item => {
              const isSelected = selectedIds.has(item.id);
              const contextHandlers = getContextMenuHandlers(item.id);

              return (
                <EntityContextMenu key={item.id} {...contextHandlers}>
                  <div
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
                  >
                    {renderGridItem(item, isSelected)}
                  </div>
                </EntityContextMenu>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(item => {
              const isSelected = selectedIds.has(item.id);
              const contextHandlers = getContextMenuHandlers(item.id);

              return (
                <EntityContextMenu key={item.id} {...contextHandlers}>
                  <div
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
                  >
                    {renderListItem(item, isSelected)}
                  </div>
                </EntityContextMenu>
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
