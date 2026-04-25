'use client';

/**
 * PunchCellDetailDrawer — side drawer (Sheet right) opened when the user
 * clicks a heatmap cell. Shows the day's vertical timeline of punches +
 * active approval status + active employee requests + quick actions.
 * Phase 7 / Plan 07-06 / Task 2.
 *
 * Uses `usePunchCellDetail(employeeId, date)` — single round-trip per
 * Warning #9. NO silent fallbacks — errors render via <GridError/>.
 *
 * data-testid: punch-cell-detail-drawer (root).
 */

import { useMemo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { GridError } from '@/components/handlers/grid-error';
import { usePunchCellDetail } from '@/hooks/hr/use-punch-cell-detail';
import type { HeatmapCell } from '@/components/ui/heatmap/employee-day-heatmap';
import {
  Clock,
  ClipboardList,
  ShieldAlert,
  CalendarDays,
  ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';

interface PunchCellPayload {
  employeeId?: string;
  date?: string;
  timeEntryIds?: string[];
}

interface PunchCellDetailDrawerProps {
  cell: HeatmapCell;
  onClose: () => void;
}

const TYPE_LABEL: Record<string, string> = {
  CLOCK_IN: 'Entrada',
  CLOCK_OUT: 'Saída',
  BREAK_START: 'Início pausa',
  BREAK_END: 'Fim pausa',
  OVERTIME_START: 'Início HE',
  OVERTIME_END: 'Fim HE',
};

const APPROVAL_BADGE: Record<string, string> = {
  PENDING:
    'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
  APPROVED:
    'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
  REJECTED:
    'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300',
  CANCELLED:
    'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-500/30 dark:bg-slate-500/10 dark:text-slate-300',
};

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '--:--';
  }
}

function formatDateBR(iso: string | undefined): string {
  if (!iso) return '';
  try {
    return new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR');
  } catch {
    return iso;
  }
}

export function PunchCellDetailDrawer({
  cell,
  onClose,
}: PunchCellDetailDrawerProps) {
  const payload = (cell.payload ?? {}) as PunchCellPayload;
  const employeeId = payload.employeeId;
  const date = payload.date ?? cell.colId;

  const open = Boolean(employeeId && date);

  const { data, isLoading, isError, error, refetch } = usePunchCellDetail(
    employeeId,
    date
  );

  const sortedEntries = useMemo(() => {
    if (!data?.timeEntries) return [];
    return [...data.timeEntries].sort(
      (a, b) =>
        new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime()
    );
  }, [data]);

  return (
    <Sheet open={open} onOpenChange={o => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto sm:max-w-md"
        data-testid="punch-cell-detail-drawer"
      >
        <SheetHeader>
          <SheetTitle>Detalhe do dia</SheetTitle>
          <SheetDescription>
            {cell.tooltip ?? `Funcionário · ${formatDateBR(date)}`}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-4 pb-6">
          <div className="flex flex-wrap items-center gap-1">
            {cell.statuses.map(status => (
              <Badge
                key={status}
                variant="outline"
                className="text-[11px] uppercase"
              >
                {status}
              </Badge>
            ))}
          </div>

          <Separator />

          {isLoading && (
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              {[0, 1, 2].map(i => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          )}

          {isError && (
            <GridError
              type="server"
              message={error?.message ?? 'Falha ao carregar detalhe do dia'}
              action={{
                label: 'Tentar novamente',
                onClick: () => {
                  void refetch();
                },
              }}
            />
          )}

          {data && (
            <>
              <section
                aria-label="Batidas do dia"
                data-testid="punch-cell-detail-timeline"
              >
                <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Batidas do dia
                </h4>
                {sortedEntries.length === 0 ? (
                  <p className="rounded-md border border-dashed bg-muted/40 px-3 py-3 text-center text-xs text-muted-foreground">
                    Sem batidas registradas neste dia.
                  </p>
                ) : (
                  <ol className="space-y-2 border-l border-muted-foreground/20 pl-4">
                    {sortedEntries.map(entry => (
                      <li
                        key={entry.id}
                        data-testid={`punch-cell-detail-entry-${entry.id}`}
                        className="relative -ml-[7px] flex items-center gap-3 rounded-md bg-card py-1 text-sm"
                      >
                        <span
                          aria-hidden
                          className="h-3 w-3 flex-shrink-0 rounded-full border-2 border-primary bg-background"
                        />
                        <span className="font-mono text-xs text-muted-foreground">
                          {formatTime(entry.occurredAt)}
                        </span>
                        <Badge variant="secondary" className="font-normal">
                          {TYPE_LABEL[entry.type] ?? entry.type}
                        </Badge>
                      </li>
                    ))}
                  </ol>
                )}
              </section>

              <Separator />

              <section
                aria-label="Aprovação ativa"
                data-testid="punch-cell-detail-approval"
              >
                <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                  <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                  Exceção em aberto
                </h4>
                {!data.activeApproval ? (
                  <p className="rounded-md border border-dashed bg-muted/40 px-3 py-3 text-center text-xs text-muted-foreground">
                    Nenhuma exceção pendente para este dia.
                  </p>
                ) : (
                  <div className="space-y-2 rounded-md border bg-card p-3 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <Badge
                        variant="outline"
                        className={
                          APPROVAL_BADGE[data.activeApproval.status] ??
                          'text-muted-foreground'
                        }
                      >
                        {data.activeApproval.status}
                      </Badge>
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                      >
                        <Link
                          href={`/hr/punch/approvals?id=${data.activeApproval.id}`}
                        >
                          Abrir exceção
                          <ArrowUpRight className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                    {data.activeApproval.reason && (
                      <p className="text-xs text-muted-foreground">
                        {data.activeApproval.reason}
                      </p>
                    )}
                  </div>
                )}
              </section>

              {data.activeRequests.length > 0 && (
                <>
                  <Separator />
                  <section
                    aria-label="Solicitações ativas"
                    data-testid="punch-cell-detail-requests"
                  >
                    <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                      <ClipboardList className="h-4 w-4 text-muted-foreground" />
                      Solicitações ativas
                    </h4>
                    <ul className="space-y-1">
                      {data.activeRequests.map(req => (
                        <li
                          key={req.id}
                          data-testid={`punch-cell-detail-request-${req.id}`}
                          className="flex items-center justify-between gap-2 rounded-md border bg-card px-3 py-2 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="font-medium">{req.type}</span>
                            {(req.startDate || req.endDate) && (
                              <span className="text-muted-foreground">
                                {formatDateBR(req.startDate ?? undefined)}
                                {req.endDate
                                  ? ` → ${formatDateBR(req.endDate)}`
                                  : ''}
                              </span>
                            )}
                          </div>
                          <Badge variant="secondary" className="font-normal">
                            {req.status}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  </section>
                </>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
