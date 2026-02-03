/**
 * Queue Item List
 * Lista de itens na fila com suporte a drag-and-drop
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Printer } from 'lucide-react';
import { usePrintQueue } from '../context/print-queue-context';
import type { PrintQueueItem } from '../types';
import { QueueItemCard } from './queue-item-card';

// ============================================
// SORTABLE ITEM WRAPPER
// ============================================

interface SortableItemProps {
  item: PrintQueueItem;
  onUpdateCopies: (queueId: string, copies: number) => void;
  onRemove: (queueId: string) => void;
}

function SortableItem({ item, onUpdateCopies, onRemove }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.queueId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    position: 'relative' as const,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <QueueItemCard
        item={item}
        onUpdateCopies={copies => onUpdateCopies(item.queueId, copies)}
        onRemove={() => onRemove(item.queueId)}
        dragHandleProps={{ ...attributes, ...listeners }}
        isDragging={isDragging}
      />
    </div>
  );
}

// ============================================
// QUEUE ITEM LIST
// ============================================

export function QueueItemList() {
  const { state, hasItems, actions } = usePrintQueue();

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
      const oldIndex = state.items.findIndex(
        item => item.queueId === active.id
      );
      const newIndex = state.items.findIndex(item => item.queueId === over.id);

      const newOrder = arrayMove(state.items, oldIndex, newIndex).map(
        item => item.queueId
      );

      actions.reorderQueue(newOrder);
    }
  };

  if (!hasItems) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4">
          <Printer className="w-10 h-10 text-gray-400" />
        </div>
        <p className="text-base font-medium text-gray-900 dark:text-white mb-2">
          Fila de impressao vazia
        </p>
        <p className="text-sm text-gray-600 dark:text-white/60 text-center max-w-xs">
          Adicione itens a fila de impressao a partir da listagem de items no
          estoque.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={state.items.map(item => item.queueId)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2 p-4">
            {state.items.map(item => (
              <SortableItem
                key={item.queueId}
                item={item}
                onUpdateCopies={actions.updateCopies}
                onRemove={actions.removeFromQueue}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </ScrollArea>
  );
}
