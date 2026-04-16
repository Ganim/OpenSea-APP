/**
 * Candidate Card (Kanban draggable)
 *
 * Cartão arrastável usado no board de recrutamento.
 * Contém avatar com iniciais, nome, cargo desejado, badge de origem,
 * estrelas de avaliação e tags. Click navega para o detalhe.
 *
 * Inspiração: Gupy (cards do pipeline) — densidade alta, foco em
 * informações decisivas para triagem rápida.
 */

'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';
import {
  getAvatarColorFromName,
  getInitialsFromName,
  getSourceBadgeStyle,
} from '@/hooks/hr/use-recruitment-kanban';
import type { KanbanCandidateCard } from '@/types/hr';
import { Mail, Star } from 'lucide-react';
import type { DraggableProvided } from '@hello-pangea/dnd';

interface CandidateCardProps {
  card: KanbanCandidateCard;
  provided: DraggableProvided;
  isDragging: boolean;
  onClick: () => void;
}

function CandidateCardComponent({
  card,
  provided,
  isDragging,
  onClick,
}: CandidateCardProps) {
  const sourceStyle = getSourceBadgeStyle(card.source);
  const avatarColor = getAvatarColorFromName(card.candidateName);
  const initials = getInitialsFromName(card.candidateName);
  const ratingValue = card.rating ?? 0;
  const visibleTags = card.tags.slice(0, 2);
  const hiddenTagsCount = Math.max(0, card.tags.length - visibleTags.length);

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      onClick={onClick}
      data-testid={`candidate-card-${card.applicationId}`}
      className={cn(
        'group select-none rounded-xl border bg-white p-3 shadow-sm transition-all',
        'dark:bg-slate-800/80 dark:border-white/10',
        'hover:border-violet-300 hover:shadow-md',
        'dark:hover:border-violet-500/40',
        'cursor-grab active:cursor-grabbing',
        isDragging && 'rotate-1 shadow-xl ring-2 ring-violet-400/40'
      )}
    >
      {/* Topo: avatar + nome + email */}
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white shadow-sm',
            avatarColor
          )}
          aria-hidden
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="truncate text-sm font-semibold text-slate-900 dark:text-white">
            {card.candidateName}
          </h4>
          {card.candidateEmail && (
            <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <Mail className="h-3 w-3 shrink-0" />
              <span className="truncate">{card.candidateEmail}</span>
            </div>
          )}
        </div>
      </div>

      {/* Badge de origem + rating */}
      <div className="mt-3 flex items-center justify-between gap-2">
        <span
          className={cn(
            'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium',
            sourceStyle.light,
            sourceStyle.dark
          )}
        >
          {card.source}
        </span>

        {ratingValue > 0 ? (
          <div
            className="flex items-center gap-0.5"
            aria-label={`Avaliação ${ratingValue} de 5`}
          >
            {Array.from({ length: 5 }).map((_, starIndex) => (
              <Star
                key={starIndex}
                className={cn(
                  'h-3 w-3',
                  starIndex < ratingValue
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-300 dark:text-slate-600'
                )}
              />
            ))}
          </div>
        ) : (
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            Sem avaliação
          </span>
        )}
      </div>

      {/* Tags */}
      {visibleTags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {visibleTags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-700 dark:border-white/10 dark:bg-slate-700/40 dark:text-slate-300"
            >
              {tag}
            </span>
          ))}
          {hiddenTagsCount > 0 && (
            <span className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">
              +{hiddenTagsCount}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export const CandidateCard = memo(CandidateCardComponent);
