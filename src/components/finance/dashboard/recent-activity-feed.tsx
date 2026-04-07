'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useFinanceEntries } from '@/hooks/finance';
import type { FinanceEntry } from '@/types/finance';
import { Activity } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'agora';
  if (diffMins < 60) return `há ${diffMins}min`;
  if (diffHours < 24) return `há ${diffHours}h`;
  if (diffDays === 1) return 'ontem';
  if (diffDays < 7) return `há ${diffDays} dias`;
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

interface ActivityItem {
  id: string;
  message: string;
  amount: number;
  dotColor: string;
  timestamp: string;
  href: string;
}

function entryToActivity(entry: FinanceEntry): ActivityItem {
  const name = entry.supplierName || entry.customerName || entry.description;
  const isPaid = entry.status === 'PAID' || entry.status === 'RECEIVED';
  const isOverdue = entry.status === 'OVERDUE';
  const isCancelled = entry.status === 'CANCELLED';

  let message: string;
  let dotColor: string;

  if (isPaid && entry.type === 'PAYABLE') {
    message = `Pagamento registrado para ${name}`;
    dotColor = 'bg-emerald-500';
  } else if (isPaid && entry.type === 'RECEIVABLE') {
    message = `Recebimento registrado de ${name}`;
    dotColor = 'bg-emerald-500';
  } else if (isOverdue) {
    message = `${name} venceu`;
    dotColor = 'bg-rose-500';
  } else if (isCancelled) {
    message = `Lançamento cancelado: ${name}`;
    dotColor = 'bg-slate-400';
  } else if (entry.type === 'PAYABLE') {
    message = `Nova conta a pagar: ${name}`;
    dotColor = 'bg-violet-500';
  } else {
    message = `Nova conta a receber: ${name}`;
    dotColor = 'bg-sky-500';
  }

  return {
    id: entry.id,
    message,
    amount: entry.expectedAmount,
    dotColor,
    timestamp: entry.updatedAt || entry.createdAt,
    href: `/finance/${entry.type === 'PAYABLE' ? 'payable' : 'receivable'}/${entry.id}`,
  };
}

export function RecentActivityFeed() {
  const { data, isLoading } = useFinanceEntries({
    perPage: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const activities = useMemo((): ActivityItem[] => {
    if (!data?.entries) return [];
    return data.entries.map(entryToActivity);
  }, [data?.entries]);

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-5 w-36" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-2.5 w-2.5 rounded-full mt-1.5 shrink-0" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          <CardTitle className="text-base">Atividade Recente</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <Activity className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">Nenhuma atividade recente</p>
          </div>
        ) : (
          <div className="space-y-1">
            {activities.map(item => (
              <Link key={item.id} href={item.href}>
                <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${item.dotColor}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-snug">
                      <span className="text-foreground">{item.message}</span>
                      <span className="font-semibold text-foreground">
                        {' '}
                        {formatCurrency(item.amount)}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatRelativeTime(item.timestamp)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
