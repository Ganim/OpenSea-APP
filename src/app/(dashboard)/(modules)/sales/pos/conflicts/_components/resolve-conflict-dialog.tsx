'use client';

import { useMemo, useState } from 'react';
import { Loader2, Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useItemsPaginated } from '@/hooks/stock/use-items';
import { useResolveConflict } from '@/hooks/sales/use-pos-conflicts';
import type { Item } from '@/types/stock';
import type { ResolveConflictAction } from '@/types/sales';

const ACTION_LABELS: Record<ResolveConflictAction, string> = {
  CANCEL_AND_REFUND: 'Cancelar venda e estornar',
  FORCE_ADJUSTMENT: 'Forçar ajuste com discrepância',
  SUBSTITUTE_ITEM: 'Substituir manualmente',
};

const ACTION_DESCRIPTIONS: Record<ResolveConflictAction, string> = {
  CANCEL_AND_REFUND:
    'Cancela o pedido associado e estorna o pagamento. Use quando não há solução possível.',
  FORCE_ADJUSTMENT:
    'Confirma a baixa de estoque mesmo com discrepância. O sistema registra a divergência para conferência posterior.',
  SUBSTITUTE_ITEM:
    'Permite informar IDs de itens alternativos. A venda é registrada com os itens substitutos.',
};

interface ResolveConflictDialogProps {
  conflictId: string;
  action: ResolveConflictAction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResolved?: () => void;
}

export function ResolveConflictDialog({
  conflictId,
  action,
  open,
  onOpenChange,
  onResolved,
}: ResolveConflictDialogProps) {
  const [notes, setNotes] = useState('');
  const [search, setSearch] = useState('');
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const resolve = useResolveConflict();

  // Search Stock items only when the SUBSTITUTE_ITEM action is in scope to
  // avoid unnecessary requests on the cancel/force flows. Search runs against
  // the standard items endpoint (item code, variant name, address). 20 hits
  // is enough for picker UX; the user will narrow by typing.
  const itemsQuery = useItemsPaginated(
    action === 'SUBSTITUTE_ITEM'
      ? { search: search.trim() || undefined, page: 1, limit: 20 }
      : undefined
  );

  const selectedIds = useMemo(
    () => new Set(selectedItems.map(i => i.id)),
    [selectedItems]
  );

  const searchResults = useMemo(() => {
    if (!itemsQuery.data?.items) return [];
    return itemsQuery.data.items.filter(item => !selectedIds.has(item.id));
  }, [itemsQuery.data, selectedIds]);

  const handleAddItem = (item: Item) => {
    setSelectedItems(prev => [...prev, item]);
  };

  const handleRemoveItem = (id: string) => {
    setSelectedItems(prev => prev.filter(i => i.id !== id));
  };

  const handleSubmit = () => {
    const substituteItemIds =
      action === 'SUBSTITUTE_ITEM' ? selectedItems.map(i => i.id) : undefined;

    resolve.mutate(
      {
        id: conflictId,
        payload: {
          action,
          notes: notes.trim() || undefined,
          substituteItemIds,
        },
      },
      {
        onSuccess: () => {
          setNotes('');
          setSearch('');
          setSelectedItems([]);
          onOpenChange(false);
          onResolved?.();
        },
      }
    );
  };

  const isInvalid = action === 'SUBSTITUTE_ITEM' && selectedItems.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-lg"
        data-testid="resolve-conflict-dialog"
      >
        <DialogHeader>
          <DialogTitle>{ACTION_LABELS[action]}</DialogTitle>
          <DialogDescription>{ACTION_DESCRIPTIONS[action]}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {action === 'SUBSTITUTE_ITEM' && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="substitute-items-search">
                  Buscar itens substitutos
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="substitute-items-search"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Nome do produto, código, endereço…"
                    className="pl-9"
                    data-testid="resolve-substitute-search"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Selecione um ou mais itens. Eles devem pertencer à mesma zona
                  do terminal e ter quantidade disponível.
                </p>
              </div>

              {selectedItems.length > 0 && (
                <div
                  className="flex flex-wrap gap-2"
                  data-testid="resolve-selected-items"
                >
                  {selectedItems.map(item => (
                    <Badge
                      key={item.id}
                      variant="secondary"
                      className="gap-1.5 px-2 py-1"
                    >
                      <span className="text-xs">
                        {item.variantName} ·{' '}
                        <span className="font-mono">
                          {item.uniqueCode ?? item.id.slice(0, 6)}
                        </span>{' '}
                        · {item.currentQuantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="hover:opacity-70"
                        aria-label="Remover item"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              <div className="max-h-64 overflow-y-auto rounded-md border border-border">
                {itemsQuery.isLoading ? (
                  <div className="flex items-center justify-center py-6 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                    {search.trim()
                      ? 'Nenhum item encontrado para essa busca.'
                      : 'Comece a digitar para buscar itens.'}
                  </div>
                ) : (
                  <ul
                    className="divide-y divide-border"
                    data-testid="resolve-substitute-results"
                  >
                    {searchResults.map(item => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between gap-2 px-3 py-2 hover:bg-muted/40"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {item.variantName}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            <span className="font-mono">
                              {item.uniqueCode ?? item.fullCode ?? '—'}
                            </span>
                            {item.resolvedAddress && (
                              <>
                                <span className="mx-1.5">·</span>
                                {item.resolvedAddress}
                              </>
                            )}
                            <span className="mx-1.5">·</span>
                            disp. {item.currentQuantity}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddItem(item)}
                          disabled={item.currentQuantity <= 0}
                        >
                          Adicionar
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="resolve-notes">
              Observações (opcional, registradas em auditoria)
            </Label>
            <Textarea
              id="resolve-notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ex.: cliente concordou com substituição."
              rows={3}
              maxLength={2000}
              data-testid="resolve-notes"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={resolve.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={resolve.isPending || isInvalid}
            data-testid="resolve-conflict-confirm"
          >
            {resolve.isPending ? 'Resolvendo…' : 'Confirmar resolução'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
