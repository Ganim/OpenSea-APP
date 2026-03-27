'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useAcceptSuggestion,
  useAutoSuggestionsInfinite,
  useRejectSuggestion,
} from '@/hooks/finance/use-reconciliation';
import { cn } from '@/lib/utils';
import type { ReconciliationAutoSuggestion } from '@/types/finance';
import { MATCH_REASON_LABELS } from '@/types/finance';
import {
  ArrowLeftRight,
  CheckCircle2,
  FileText,
  Loader2,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

// ============================================================================
// HELPERS
// ============================================================================

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

function getScoreColor(score: number): string {
  if (score >= 90)
    return 'border-emerald-600/25 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/8 text-emerald-700 dark:text-emerald-300';
  if (score >= 80)
    return 'border-sky-600/25 dark:border-sky-500/20 bg-sky-50 dark:bg-sky-500/8 text-sky-700 dark:text-sky-300';
  return 'border-amber-600/25 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/8 text-amber-700 dark:text-amber-300';
}

// ============================================================================
// SUGGESTION ROW
// ============================================================================

function SuggestionRow({
  suggestion,
  onAccept,
  onReject,
  isAccepting,
  isRejecting,
}: {
  suggestion: ReconciliationAutoSuggestion;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  isAccepting: boolean;
  isRejecting: boolean;
}) {
  const isPending = suggestion.status === 'PENDING';

  return (
    <div
      className={cn(
        'p-4 border-b last:border-b-0 transition-colors',
        !isPending && 'opacity-60'
      )}
    >
      <div className="flex items-start gap-4">
        {/* Transaction side */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-sky-100 dark:bg-sky-500/10 flex items-center justify-center shrink-0">
              <FileText className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
            </div>
            <p className="text-sm font-medium truncate">
              {suggestion.transactionDescription ?? 'Transação bancária'}
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {suggestion.transactionDate && (
              <span>{formatDate(suggestion.transactionDate)}</span>
            )}
            {suggestion.transactionAmount != null && (
              <span className="font-medium text-foreground">
                {formatCurrency(suggestion.transactionAmount)}
              </span>
            )}
            {suggestion.transactionType && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                {suggestion.transactionType === 'CREDIT' ? 'Crédito' : 'Débito'}
              </Badge>
            )}
          </div>
        </div>

        {/* Arrow / Score */}
        <div className="flex flex-col items-center gap-1 shrink-0 pt-1">
          <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
          <Badge
            variant="outline"
            className={cn(
              'text-[10px] px-1.5 py-0',
              getScoreColor(suggestion.score)
            )}
          >
            {suggestion.score}%
          </Badge>
        </div>

        {/* Entry side */}
        <div className="flex-1 min-w-0 space-y-1 text-right">
          <div className="flex items-center justify-end gap-2">
            <p className="text-sm font-medium truncate">
              {suggestion.entryDescription ?? 'Lançamento financeiro'}
            </p>
          </div>
          <div className="flex items-center justify-end gap-3 text-xs text-muted-foreground">
            {suggestion.entryDueDate && (
              <span>{formatDate(suggestion.entryDueDate)}</span>
            )}
            {suggestion.entryAmount != null && (
              <span className="font-medium text-foreground">
                {formatCurrency(suggestion.entryAmount)}
              </span>
            )}
            {(suggestion.supplierName || suggestion.customerName) && (
              <span className="truncate max-w-[120px]">
                {suggestion.supplierName ?? suggestion.customerName}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Match reasons + actions */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex flex-wrap gap-1.5">
          {suggestion.matchReasons.map(reason => (
            <Badge
              key={reason}
              variant="outline"
              className="text-[10px] px-1.5 py-0 border-violet-600/20 dark:border-violet-500/20 bg-violet-50 dark:bg-violet-500/8 text-violet-700 dark:text-violet-300"
            >
              {MATCH_REASON_LABELS[reason] ?? reason}
            </Badge>
          ))}
        </div>

        {isPending && (
          <div className="flex items-center gap-1.5 shrink-0 ml-3">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
              onClick={() => onReject(suggestion.id)}
              disabled={isRejecting}
            >
              {isRejecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <span className="ml-1 text-xs">Rejeitar</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
              onClick={() => onAccept(suggestion.id)}
              disabled={isAccepting}
            >
              {isAccepting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              <span className="ml-1 text-xs">Aceitar</span>
            </Button>
          </div>
        )}

        {suggestion.status === 'ACCEPTED' && (
          <Badge
            variant="outline"
            className="text-[10px] border-emerald-600/25 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/8 text-emerald-700 dark:text-emerald-300"
          >
            Aceita
          </Badge>
        )}

        {suggestion.status === 'REJECTED' && (
          <Badge
            variant="outline"
            className="text-[10px] border-rose-600/25 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/8 text-rose-700 dark:text-rose-300"
          >
            Rejeitada
          </Badge>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// LOADING SKELETON
// ============================================================================

function SuggestionSkeleton() {
  return (
    <div className="p-4 border-b last:border-b-0 space-y-3">
      <div className="flex items-start gap-4">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-6 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-44 ml-auto" />
          <Skeleton className="h-3 w-28 ml-auto" />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          <Skeleton className="h-4 w-16 rounded-full" />
          <Skeleton className="h-4 w-20 rounded-full" />
        </div>
        <div className="flex gap-1.5">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN PANEL
// ============================================================================

export function ReconciliationSuggestionsPanel() {
  const {
    suggestions,
    total,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useAutoSuggestionsInfinite({ status: 'PENDING' });

  const acceptMutation = useAcceptSuggestion();
  const rejectMutation = useRejectSuggestion();

  // Infinite scroll sentinel
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleAccept = (suggestionId: string) => {
    acceptMutation.mutate(suggestionId, {
      onSuccess: () => {
        toast.success('Sugestão aceita com sucesso');
      },
      onError: () => {
        toast.error('Erro ao aceitar sugestão');
      },
    });
  };

  const handleReject = (suggestionId: string) => {
    rejectMutation.mutate(suggestionId, {
      onSuccess: () => {
        toast.success('Sugestão rejeitada');
      },
      onError: () => {
        toast.error('Erro ao rejeitar sugestão');
      },
    });
  };

  // Do not render if no suggestions and not loading
  if (!isLoading && total === 0) {
    return null;
  }

  return (
    <Card className="overflow-hidden bg-white dark:bg-slate-800/60 border border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-violet-50/50 dark:bg-violet-500/5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          <h3 className="text-sm font-semibold">Sugestões de Conciliação</h3>
          {total > 0 && (
            <Badge
              variant="outline"
              className="text-[10px] border-violet-600/25 dark:border-violet-500/20 bg-violet-50 dark:bg-violet-500/8 text-violet-700 dark:text-violet-300"
            >
              {total}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Correspondências automáticas para revisão
        </p>
      </div>

      {/* Content */}
      {isLoading ? (
        <div>
          <SuggestionSkeleton />
          <SuggestionSkeleton />
          <SuggestionSkeleton />
        </div>
      ) : (
        <div>
          {suggestions.map(suggestion => (
            <SuggestionRow
              key={suggestion.id}
              suggestion={suggestion}
              onAccept={handleAccept}
              onReject={handleReject}
              isAccepting={
                acceptMutation.isPending &&
                acceptMutation.variables === suggestion.id
              }
              isRejecting={
                rejectMutation.isPending &&
                rejectMutation.variables === suggestion.id
              }
            />
          ))}

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="h-1" />
          {isFetchingNextPage && (
            <div className="flex justify-center py-3">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
