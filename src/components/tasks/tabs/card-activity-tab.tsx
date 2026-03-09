'use client';

import { useMemo, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Plus,
  Minus,
  Tag,
  User,
  MessageSquare,
  CheckSquare,
  Pencil,
  FileText,
  Activity,
} from 'lucide-react';
import { useCardActivityInfinite } from '@/hooks/tasks/use-activity';
import { formatRelativeTime } from '@/components/tasks/tabs/_utils';
import type { CardActivityType } from '@/types/tasks';

interface CardActivityTabProps {
  boardId: string;
  cardId: string;
}

const ACTIVITY_ICON: Record<CardActivityType, React.ReactNode> = {
  CARD_CREATED: <Plus className="h-3.5 w-3.5 text-green-500" />,
  CARD_UPDATED: <Pencil className="h-3.5 w-3.5 text-blue-500" />,
  CARD_MOVED: <ArrowRight className="h-3.5 w-3.5 text-purple-500" />,
  CARD_ARCHIVED: <FileText className="h-3.5 w-3.5 text-amber-500" />,
  MEMBER_ASSIGNED: <User className="h-3.5 w-3.5 text-cyan-500" />,
  MEMBER_UNASSIGNED: <User className="h-3.5 w-3.5 text-gray-400" />,
  LABEL_ADDED: <Tag className="h-3.5 w-3.5 text-emerald-500" />,
  LABEL_REMOVED: <Tag className="h-3.5 w-3.5 text-gray-400" />,
  COMMENT_ADDED: <MessageSquare className="h-3.5 w-3.5 text-blue-400" />,
  FIELD_CHANGED: <Pencil className="h-3.5 w-3.5 text-orange-500" />,
  SUBTASK_ADDED: <Plus className="h-3.5 w-3.5 text-green-400" />,
  SUBTASK_UPDATED: <Pencil className="h-3.5 w-3.5 text-blue-400" />,
  SUBTASK_REMOVED: <Minus className="h-3.5 w-3.5 text-red-400" />,
  SUBTASK_REOPENED: <CheckSquare className="h-3.5 w-3.5 text-amber-400" />,
  CHECKLIST_ITEM_COMPLETED: (
    <CheckSquare className="h-3.5 w-3.5 text-green-500" />
  ),
  CHECKLIST_ITEM_UNCOMPLETED: (
    <CheckSquare className="h-3.5 w-3.5 text-gray-400" />
  ),
};

const PAGE_SIZE = 20;

export function CardActivityTab({ boardId, cardId }: CardActivityTabProps) {
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useCardActivityInfinite(boardId, cardId, PAGE_SIZE);

  const activities = useMemo(
    () => data?.pages.flatMap(p => p.activities) ?? [],
    [data]
  );

  // Intersection observer for auto-load
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) observerRef.current.disconnect();
      if (!node || !hasNextPage || isFetchingNextPage) return;

      observerRef.current = new IntersectionObserver(
        entries => {
          if (entries[0].isIntersecting) {
            fetchNextPage();
          }
        },
        { threshold: 0.1 }
      );
      observerRef.current.observe(node);
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 w-full">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground w-full">
        <Activity className="h-8 w-8 mb-2 opacity-50" />
        <p className="text-sm">Nenhuma atividade registrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-1 flex-col w-full">
      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-3 bottom-3 w-px bg-border" />

        <div className="space-y-0">
          {activities.map(item => (
            <div key={item.id} className="flex items-start gap-3 py-2 relative">
              {/* Icon circle */}
              <div className="relative z-10 flex items-center justify-center h-8 w-8 rounded-full bg-background border border-border shrink-0">
                {ACTIVITY_ICON[item.type] ?? (
                  <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-1">
                <p className="text-sm">
                  <span className="font-medium">
                    {item.userName ?? 'Usuário'}
                  </span>{' '}
                  <span className="text-muted-foreground">
                    {item.description}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatRelativeTime(item.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Auto-load sentinel + manual fallback button */}
      {hasNextPage && (
        <div ref={loadMoreRef} className="flex justify-center pt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? 'Carregando...' : 'Carregar mais'}
          </Button>
        </div>
      )}
    </div>
  );
}
