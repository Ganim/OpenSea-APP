'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { financeAnalyticsService } from '@/services/finance';
import type { PaymentTimingSuggestion } from '@/types/finance';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Clock, TrendingDown, TrendingUp } from 'lucide-react';
import Link from 'next/link';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR');
}

const PRIORITY_STYLES = {
  HIGH: {
    border: 'border-l-rose-500',
    bg: 'bg-rose-50 dark:bg-rose-500/8',
    badge: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
    icon: TrendingUp,
  },
  MEDIUM: {
    border: 'border-l-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-500/8',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    icon: TrendingDown,
  },
  LOW: {
    border: 'border-l-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-500/8',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    icon: Clock,
  },
} as const;

const TYPE_LABELS = {
  EARLY_DISCOUNT: 'Desconto Antecipado',
  DELAY_SAFE: 'Atraso Seguro',
  PENALTY_RISK: 'Risco de Multa',
} as const;

function SuggestionItem({ suggestion }: { suggestion: PaymentTimingSuggestion }) {
  const style = PRIORITY_STYLES[suggestion.priority];
  const Icon = style.icon;

  return (
    <Link href={`/finance/payable/${suggestion.entryId}`}>
      <div
        className={`p-3 rounded-lg border border-l-4 ${style.border} ${style.bg} hover:opacity-90 transition-opacity cursor-pointer`}
      >
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="text-sm font-medium truncate">
              {suggestion.supplierName}
            </span>
          </div>
          <Badge className={`text-xs shrink-0 ${style.badge} border-0`}>
            {TYPE_LABELS[suggestion.type]}
          </Badge>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatCurrency(suggestion.amount)}</span>
          <div className="flex items-center gap-1">
            <span>{formatDate(suggestion.currentDueDate)}</span>
            <ArrowRight className="h-3 w-3" />
            <span className="font-medium text-foreground">
              {formatDate(suggestion.suggestedPayDate)}
            </span>
          </div>
        </div>

        <div className="mt-1.5 flex items-center justify-between">
          <p className="text-xs text-muted-foreground line-clamp-1 flex-1 mr-2">
            {suggestion.reason}
          </p>
          <Badge
            variant="outline"
            className="text-xs text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 shrink-0"
          >
            {formatCurrency(suggestion.savingsAmount)}
          </Badge>
        </div>
      </div>
    </Link>
  );
}

export function PaymentTimingWidget() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['finance', 'payment-timing'],
    queryFn: async () => {
      const response = await financeAnalyticsService.getPaymentTiming(30);
      return response;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  if (error) return null;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            <CardTitle className="text-base">Otimizacao de Pagamentos</CardTitle>
          </div>
          {data && data.totalPotentialSavings > 0 && (
            <Badge
              variant="outline"
              className="text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
            >
              Economia: {formatCurrency(data.totalPotentialSavings)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto space-y-2">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        ) : !data || data.suggestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Clock className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">
              Nenhuma otimizacao disponivel
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Todos os pagamentos estao no prazo ideal
            </p>
          </div>
        ) : (
          data.suggestions.slice(0, 5).map((suggestion) => (
            <SuggestionItem key={suggestion.entryId} suggestion={suggestion} />
          ))
        )}
      </CardContent>
    </Card>
  );
}
