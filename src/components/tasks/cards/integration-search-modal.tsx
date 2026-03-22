'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { IntegrationType } from '@/types/tasks';
import type { FinanceEntry, FinanceEntryType } from '@/types/finance';
import {
  FINANCE_ENTRY_STATUS_LABELS,
  FINANCE_ENTRY_TYPE_LABELS,
} from '@/types/finance';
import { financeEntriesService } from '@/services/finance/finance-entries.service';

interface IntegrationSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: IntegrationType;
  onSelect: (entityId: string, entityLabel: string) => void;
}

type TypeFilter = 'ALL' | FinanceEntryType;

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  } catch {
    return dateStr;
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value / 100);
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'PAID':
    case 'RECEIVED':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/8 dark:text-emerald-300';
    case 'PENDING':
    case 'SCHEDULED':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-500/8 dark:text-amber-300';
    case 'OVERDUE':
      return 'bg-rose-50 text-rose-700 dark:bg-rose-500/8 dark:text-rose-300';
    case 'PARTIALLY_PAID':
      return 'bg-blue-50 text-blue-700 dark:bg-blue-500/8 dark:text-blue-300';
    case 'CANCELLED':
      return 'bg-slate-50 text-slate-700 dark:bg-slate-500/8 dark:text-slate-300';
    default:
      return 'bg-slate-50 text-slate-700 dark:bg-slate-500/8 dark:text-slate-300';
  }
}

export function IntegrationSearchModal({
  open,
  onOpenChange,
  type,
  onSelect,
}: IntegrationSearchModalProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');
  const [results, setResults] = useState<FinanceEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      setSearch('');
      setTypeFilter('ALL');
      setResults([]);
      // Initial fetch
      fetchEntries('', 'ALL');
      // Focus search input
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchEntries = useCallback(
    async (searchTerm: string, entryType: TypeFilter) => {
      if (type !== 'FINANCE_ENTRY') return;

      setIsLoading(true);
      try {
        const response = await financeEntriesService.list({
          search: searchTerm || undefined,
          type: entryType === 'ALL' ? undefined : entryType,
          perPage: 15,
        });
        setResults(response.entries);
      } catch {
        toast.error('Erro ao buscar entradas financeiras.');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [type]
  );

  // Debounced search
  useEffect(() => {
    if (!open) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchEntries(search, typeFilter);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [search, typeFilter, open, fetchEntries]);

  function handleSelect(entry: FinanceEntry) {
    onSelect(entry.id, entry.description);
    onOpenChange(false);
  }

  // Modal config per type
  const modalConfig: Record<
    string,
    { title: string } | undefined
  > = {
    FINANCE_ENTRY: { title: 'Vincular Entrada Financeira' },
  };

  const config = modalConfig[type];
  if (!config) return null;

  const typeFilters: { value: TypeFilter; label: string }[] = [
    { value: 'ALL', label: 'Todos' },
    { value: 'PAYABLE', label: 'A Pagar' },
    { value: 'RECEIVABLE', label: 'A Receber' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{config.title}</DialogTitle>
        </DialogHeader>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por descrição, fornecedor ou cliente..."
            className="pl-9"
          />
        </div>

        {/* Type filter tabs */}
        <div className="flex gap-1">
          {typeFilters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setTypeFilter(filter.value)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                typeFilter === filter.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto space-y-1 -mx-1 px-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : results.length > 0 ? (
            results.map((entry) => (
              <button
                key={entry.id}
                type="button"
                className="w-full flex flex-col gap-1 rounded-lg px-3 py-2.5 text-left hover:bg-muted transition-colors border border-transparent hover:border-border"
                onClick={() => handleSelect(entry)}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium truncate flex-1">
                    {entry.description}
                  </span>
                  <Badge
                    variant="secondary"
                    className={cn(
                      'text-[10px] shrink-0 border-0',
                      getStatusColor(entry.status)
                    )}
                  >
                    {FINANCE_ENTRY_STATUS_LABELS[entry.status]}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span
                    className={cn(
                      'font-medium',
                      entry.type === 'PAYABLE'
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                    )}
                  >
                    {FINANCE_ENTRY_TYPE_LABELS[entry.type]}
                  </span>
                  {(entry.supplierName || entry.customerName) && (
                    <>
                      <span className="text-muted-foreground/50">·</span>
                      <span className="truncate">
                        {entry.supplierName || entry.customerName}
                      </span>
                    </>
                  )}
                  <span className="text-muted-foreground/50">·</span>
                  <span className="shrink-0">
                    Venc. {formatDate(entry.dueDate)}
                  </span>
                  <span className="text-muted-foreground/50">·</span>
                  <span className="shrink-0 font-medium">
                    {formatCurrency(entry.expectedAmount)}
                  </span>
                </div>
              </button>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhuma entrada encontrada
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
