/**
 * SortableCategoryList
 * Componente de reordenação de categorias via drag-and-drop
 */

'use client';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '@/components/ui/badge';
import type { Category } from '@/types/stock';
import { GripVertical } from 'lucide-react';
import Image from 'next/image';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { PiFolderOpenDuotone } from 'react-icons/pi';

// ============================================
// SORTABLE ITEM
// ============================================

interface SortableItemProps {
  item: Category;
}

function SortableItem({ item }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : ('auto' as const),
    position: 'relative' as const,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-lg border p-3 bg-white dark:bg-slate-900 ${
        isDragging ? 'shadow-lg ring-2 ring-blue-500/50 opacity-90' : ''
      }`}
    >
      <button
        type="button"
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 to-purple-600 overflow-hidden flex-shrink-0">
        {item.iconUrl ? (
          <Image
            src={item.iconUrl}
            alt=""
            width={20}
            height={20}
            className="h-5 w-5 object-contain brightness-0 invert"
            unoptimized
            onError={e => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <PiFolderOpenDuotone className="h-5 w-5 text-white" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{item.name}</span>
          <Badge
            variant={item.isActive ? 'default' : 'secondary'}
            className="text-[10px] px-1.5 py-0"
          >
            {item.isActive ? 'Ativa' : 'Inativa'}
          </Badge>
        </div>
        {item.description && (
          <p className="text-xs text-muted-foreground truncate">
            {item.description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-shrink-0">
        <span>{item.childrenCount || 0} sub</span>
        <span>{item.productCount || 0} prod</span>
      </div>
    </div>
  );
}

// ============================================
// SORTABLE CATEGORY LIST
// ============================================

export interface SortableCategoryListRef {
  getReorderedItems: () => Array<{ id: string; displayOrder: number }>;
}

interface SortableCategoryListProps {
  items: Category[];
}

export const SortableCategoryList = forwardRef<
  SortableCategoryListRef,
  SortableCategoryListProps
>(function SortableCategoryList({ items }, ref) {
  const [localItems, setLocalItems] = useState(items);

  // Sync local state when items prop changes (e.g., initial load)
  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  // Expose method to read the current reordered state
  useImperativeHandle(ref, () => ({
    getReorderedItems: () =>
      localItems.map((item, index) => ({
        id: item.id,
        displayOrder: index,
      })),
  }));

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localItems.findIndex(item => item.id === active.id);
      const newIndex = localItems.findIndex(item => item.id === over.id);
      setLocalItems(arrayMove(localItems, oldIndex, newIndex));
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={localItems.map(item => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-2">
          {localItems.map(item => (
            <SortableItem key={item.id} item={item} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
});
