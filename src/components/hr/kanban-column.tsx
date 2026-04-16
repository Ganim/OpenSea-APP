/**
 * Kanban Column (Recruitment)
 *
 * Coluna droppable do board de recrutamento. Renderiza header com
 * título, contador e barra de gradiente, e a área de cards (Draggables).
 *
 * Inspiração: Trello/Linear/Gupy — gradiente sutil por coluna,
 * estado de hover quando arrastando.
 */

'use client';

import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, UserPlus2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { CandidateCard } from './candidate-card';
import type {
  KanbanCandidateCard,
  KanbanColumnAccent,
  KanbanColumnDefinition,
} from '@/types/hr';

interface KanbanColumnProps {
  column: KanbanColumnDefinition;
  cards: KanbanCandidateCard[];
  isLoading: boolean;
  onCardClick: (card: KanbanCandidateCard) => void;
  onAddCandidate?: () => void;
}

/**
 * Mapeamento estático de cor → classes (Tailwind precisa de strings literais).
 */
const ACCENT_STYLES: Record<
  KanbanColumnAccent,
  {
    headerGradient: string;
    border: string;
    columnBg: string;
    countBg: string;
    countText: string;
    dragOverRing: string;
  }
> = {
  slate: {
    headerGradient:
      'from-slate-100 to-slate-50 dark:from-slate-500/15 dark:to-slate-500/5',
    border: 'border-slate-200 dark:border-slate-500/20',
    columnBg: 'bg-slate-50/40 dark:bg-slate-500/[0.03]',
    countBg: 'bg-slate-100 dark:bg-slate-500/15',
    countText: 'text-slate-700 dark:text-slate-300',
    dragOverRing: 'ring-slate-300 dark:ring-slate-500/40',
  },
  sky: {
    headerGradient:
      'from-sky-100 to-sky-50 dark:from-sky-500/15 dark:to-sky-500/5',
    border: 'border-sky-200 dark:border-sky-500/20',
    columnBg: 'bg-sky-50/40 dark:bg-sky-500/[0.03]',
    countBg: 'bg-sky-100 dark:bg-sky-500/15',
    countText: 'text-sky-700 dark:text-sky-300',
    dragOverRing: 'ring-sky-300 dark:ring-sky-500/40',
  },
  violet: {
    headerGradient:
      'from-violet-100 to-violet-50 dark:from-violet-500/15 dark:to-violet-500/5',
    border: 'border-violet-200 dark:border-violet-500/20',
    columnBg: 'bg-violet-50/40 dark:bg-violet-500/[0.03]',
    countBg: 'bg-violet-100 dark:bg-violet-500/15',
    countText: 'text-violet-700 dark:text-violet-300',
    dragOverRing: 'ring-violet-300 dark:ring-violet-500/40',
  },
  amber: {
    headerGradient:
      'from-amber-100 to-amber-50 dark:from-amber-500/15 dark:to-amber-500/5',
    border: 'border-amber-200 dark:border-amber-500/20',
    columnBg: 'bg-amber-50/40 dark:bg-amber-500/[0.03]',
    countBg: 'bg-amber-100 dark:bg-amber-500/15',
    countText: 'text-amber-700 dark:text-amber-300',
    dragOverRing: 'ring-amber-300 dark:ring-amber-500/40',
  },
  teal: {
    headerGradient:
      'from-teal-100 to-teal-50 dark:from-teal-500/15 dark:to-teal-500/5',
    border: 'border-teal-200 dark:border-teal-500/20',
    columnBg: 'bg-teal-50/40 dark:bg-teal-500/[0.03]',
    countBg: 'bg-teal-100 dark:bg-teal-500/15',
    countText: 'text-teal-700 dark:text-teal-300',
    dragOverRing: 'ring-teal-300 dark:ring-teal-500/40',
  },
  emerald: {
    headerGradient:
      'from-emerald-100 to-emerald-50 dark:from-emerald-500/15 dark:to-emerald-500/5',
    border: 'border-emerald-200 dark:border-emerald-500/20',
    columnBg: 'bg-emerald-50/40 dark:bg-emerald-500/[0.03]',
    countBg: 'bg-emerald-100 dark:bg-emerald-500/15',
    countText: 'text-emerald-700 dark:text-emerald-300',
    dragOverRing: 'ring-emerald-300 dark:ring-emerald-500/40',
  },
  rose: {
    headerGradient:
      'from-rose-100 to-rose-50 dark:from-rose-500/15 dark:to-rose-500/5',
    border: 'border-rose-200 dark:border-rose-500/20',
    columnBg: 'bg-rose-50/40 dark:bg-rose-500/[0.03]',
    countBg: 'bg-rose-100 dark:bg-rose-500/15',
    countText: 'text-rose-700 dark:text-rose-300',
    dragOverRing: 'ring-rose-300 dark:ring-rose-500/40',
  },
};

export function KanbanColumn({
  column,
  cards,
  isLoading,
  onCardClick,
  onAddCandidate,
}: KanbanColumnProps) {
  const style = ACCENT_STYLES[column.accentColor];

  return (
    <div
      className="flex w-full shrink-0 flex-col sm:w-[300px]"
      data-testid={`kanban-column-${column.id}`}
    >
      {/* Header */}
      <div
        className={cn(
          'flex items-center gap-2 rounded-t-xl border border-b-0 bg-gradient-to-br px-3 py-2.5',
          style.headerGradient,
          style.border
        )}
      >
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-white">
            {column.title}
          </h3>
          {column.subtitle && (
            <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
              {column.subtitle}
            </p>
          )}
        </div>
        <span
          className={cn(
            'shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums',
            style.countBg,
            style.countText
          )}
          data-testid={`kanban-column-${column.id}-count`}
        >
          {cards.length}
        </span>
      </div>

      {/* Droppable */}
      <Droppable droppableId={column.id} type="CANDIDATE">
        {(dropProvided, dropSnapshot) => (
          <div
            ref={dropProvided.innerRef}
            {...dropProvided.droppableProps}
            className={cn(
              'flex-1 space-y-2 rounded-b-xl border p-2 transition-all',
              'min-h-[120px]',
              style.columnBg,
              style.border,
              dropSnapshot.isDraggingOver &&
                cn('ring-2 ring-inset', style.dragOverRing)
            )}
          >
            {/* Loading skeletons */}
            {isLoading && cards.length === 0 && (
              <div className="space-y-2">
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
              </div>
            )}

            {/* Empty state */}
            {!isLoading && cards.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
                <div className="rounded-full bg-white/60 p-2 dark:bg-white/5">
                  <UserPlus2 className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Nenhum candidato neste estágio
                </p>
              </div>
            )}

            {/* Cards */}
            {cards.map((card, cardIndex) => (
              <Draggable
                key={card.applicationId}
                draggableId={card.applicationId}
                index={cardIndex}
              >
                {(dragProvided, dragSnapshot) => (
                  <CandidateCard
                    card={card}
                    provided={dragProvided}
                    isDragging={dragSnapshot.isDragging}
                    onClick={() => onCardClick(card)}
                  />
                )}
              </Draggable>
            ))}
            {dropProvided.placeholder}

            {/* Add candidate footer */}
            {onAddCandidate && (
              <button
                type="button"
                onClick={onAddCandidate}
                className={cn(
                  'flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed py-2 text-xs transition-colors',
                  'border-slate-200 text-slate-500 hover:bg-white/60',
                  'dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5'
                )}
                data-testid={`kanban-column-${column.id}-add`}
              >
                <Plus className="h-3 w-3" />
                Adicionar candidato
              </button>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
