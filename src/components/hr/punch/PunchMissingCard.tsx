'use client';

/**
 * PunchMissingCard — compact card with today's missing-punch count +
 * top 3-5 employees + link to /hr/punch/missing.
 * Phase 7 / Plan 07-06 / Task 2.
 *
 * Powered by `usePunchMissing()` (useInfiniteQuery — first page only here).
 * NO silent fallbacks — errors render via <GridError/>.
 *
 * data-testid: punch-missing-card (root), punch-missing-card-item-{id}.
 */

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GridError } from '@/components/handlers/grid-error';
import { usePunchMissing } from '@/hooks/hr/use-punch-missing';
import {
  ArrowRight,
  AlarmClockOff,
  UserMinus,
  CheckCircle2,
} from 'lucide-react';

const TOP_PREVIEW_COUNT = 5;

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function PunchMissingCard() {
  const date = todayIso();
  const { data, isLoading, isError, error, refetch } = usePunchMissing({
    date,
  });

  if (isLoading) {
    return (
      <Card data-testid="punch-missing-card" className="p-4">
        <Skeleton className="mb-3 h-5 w-40" />
        <div className="space-y-2">
          {[0, 1, 2].map(i => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  if (isError) {
    return (
      <div data-testid="punch-missing-card">
        <GridError
          type="server"
          message={error?.message ?? 'Falha ao carregar batidas faltantes'}
          action={{
            label: 'Tentar novamente',
            onClick: () => {
              void refetch();
            },
          }}
        />
      </div>
    );
  }

  if (!data) return null;

  const firstPage = data.pages[0];
  const total = firstPage?.total ?? 0;
  const items = (firstPage?.items ?? []).slice(0, TOP_PREVIEW_COUNT);

  return (
    <Card data-testid="punch-missing-card" className="overflow-hidden">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-2">
          <AlarmClockOff className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Faltantes hoje</h3>
        </div>
        <Badge
          variant="outline"
          className={
            total > 0
              ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300'
              : 'text-muted-foreground'
          }
        >
          <span data-testid="punch-missing-card-count">{total}</span>
        </Badge>
      </div>

      <div className="p-3">
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-1 py-4 text-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-500/60" />
            <p className="text-sm text-muted-foreground">
              Nenhum funcionário com batida faltante hoje.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map(item => (
              <li
                key={item.id}
                data-testid={`punch-missing-card-item-${item.id}`}
                className="flex items-center justify-between gap-3 rounded-md border bg-card px-3 py-2 text-sm hover:bg-accent/30"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <UserMinus className="h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                  <div className="min-w-0">
                    <div className="truncate font-medium">
                      {item.employeeName}
                    </div>
                    {(item.departmentName || item.shiftLabel) && (
                      <div className="truncate text-xs text-muted-foreground">
                        {[item.departmentName, item.shiftLabel]
                          .filter(Boolean)
                          .join(' · ')}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t bg-muted/40 px-4 py-2">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          data-testid="punch-missing-card-link"
        >
          <Link href="/hr/punch/missing">
            Ver todos os faltantes
            <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}
