'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useFinanceEntries } from '@/hooks/finance';
import type { FinanceEntry } from '@/types/finance';
import { CalendarDays, Clock } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function getDateRange() {
  const today = new Date();
  const from = today.toISOString().split('T')[0];
  const end = new Date(today);
  end.setDate(end.getDate() + 7);
  const to = end.toISOString().split('T')[0];
  return { from, to };
}

function formatDayLabel(dateStr: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(dateStr + 'T00:00:00');
  const diffDays = Math.round(
    (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Amanhã';

  return date.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  });
}

function getStatusBadgeColor(status: string, type: string) {
  if (status === 'OVERDUE')
    return 'bg-rose-50 text-rose-700 dark:bg-rose-500/8 dark:text-rose-300 border-rose-200 dark:border-rose-800/50';
  if (status === 'PENDING' && type === 'PAYABLE')
    return 'bg-rose-50 text-rose-700 dark:bg-rose-500/8 dark:text-rose-300 border-rose-200 dark:border-rose-800/50';
  if (status === 'PENDING' && type === 'RECEIVABLE')
    return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/8 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50';
  return 'bg-slate-50 text-slate-700 dark:bg-slate-500/8 dark:text-slate-300';
}

interface GroupedEntries {
  day: string;
  label: string;
  entries: FinanceEntry[];
  total: number;
  isToday: boolean;
}

export function WeeklyObligations() {
  const range = useMemo(() => getDateRange(), []);

  const { data, isLoading } = useFinanceEntries({
    dueDateFrom: range.from,
    dueDateTo: range.to,
    status: ['PENDING', 'OVERDUE'],
    sortBy: 'dueDate',
    sortOrder: 'asc',
    perPage: 50,
  });

  const grouped = useMemo((): GroupedEntries[] => {
    if (!data?.entries) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    const groups: Record<string, FinanceEntry[]> = {};

    for (const entry of data.entries) {
      const day = entry.dueDate.split('T')[0];
      if (!groups[day]) groups[day] = [];
      groups[day].push(entry);
    }

    return Object.keys(groups)
      .sort()
      .map((day) => ({
        day,
        label: formatDayLabel(day),
        entries: groups[day],
        total: groups[day].reduce((sum, e) => sum + e.expectedAmount, 0),
        isToday: day === todayStr,
      }));
  }, [data?.entries]);

  const weekTotal = useMemo(() => {
    return grouped.reduce((sum, g) => sum + g.total, 0);
  }, [grouped]);

  const totalEntries = data?.entries?.length ?? 0;

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-5 w-48" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            <CardTitle className="text-base">
              Obrigações da Semana
            </CardTitle>
          </div>
          {totalEntries > 0 && (
            <Badge variant="secondary" className="text-xs">
              {totalEntries} {totalEntries === 1 ? 'item' : 'itens'}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        {grouped.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <Clock className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">Nenhuma obrigação esta semana</p>
            <p className="text-xs mt-1">
              Não há contas pendentes nos próximos 7 dias
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {grouped.map((group) => (
              <div key={group.day}>
                {/* Day header */}
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-xs font-semibold uppercase tracking-wide ${
                      group.isToday
                        ? 'text-violet-600 dark:text-violet-400'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {group.isToday && (
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-violet-500 mr-1.5 align-middle" />
                    )}
                    {group.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatCurrency(group.total)}
                  </span>
                </div>

                {/* Entries */}
                <div className="space-y-1.5">
                  {group.entries.slice(0, 5).map((entry) => (
                    <Link
                      key={entry.id}
                      href={`/finance/${entry.type === 'PAYABLE' ? 'payable' : 'receivable'}/${entry.id}`}
                    >
                      <div className="flex items-center gap-3 p-2.5 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                        <div
                          className={`w-1 h-8 rounded-full shrink-0 ${
                            entry.type === 'PAYABLE'
                              ? 'bg-rose-500'
                              : 'bg-emerald-500'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {entry.supplierName ||
                              entry.customerName ||
                              entry.description}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {entry.description}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p
                            className={`text-sm font-semibold ${
                              entry.type === 'PAYABLE'
                                ? 'text-rose-600 dark:text-rose-400'
                                : 'text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            {entry.type === 'PAYABLE' ? '-' : '+'}
                            {formatCurrency(entry.expectedAmount)}
                          </p>
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-1.5 py-0 ${getStatusBadgeColor(entry.status, entry.type)}`}
                          >
                            {entry.type === 'PAYABLE' ? 'Pagar' : 'Receber'}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {group.entries.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center py-1">
                      +{group.entries.length - 5} itens
                    </p>
                  )}
                </div>
              </div>
            ))}

            {/* Week total */}
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Total da semana
                </span>
                <span className="text-sm font-bold">
                  {formatCurrency(weekTotal)}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
