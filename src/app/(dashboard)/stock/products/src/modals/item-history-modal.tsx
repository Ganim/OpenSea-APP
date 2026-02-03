/**
 * ItemHistoryModal - Modal showing item movement history
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { movementsService } from '@/services/stock';
import type { Item, ItemMovementExtended, MovementType } from '@/types/stock';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowDownRight,
  ArrowRightLeft,
  ArrowUpRight,
  Box,
  Calendar,
  Clock,
  MapPin,
  Package,
  User,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface ItemHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: Item | null;
}

// Simplified movement categories
type MovementCategory = 'ENTRADA' | 'MOVIMENTO' | 'SAIDA';

const getMovementCategory = (type: MovementType): MovementCategory => {
  if (type === 'ENTRY') return 'ENTRADA';
  if (type === 'EXIT') return 'SAIDA';
  return 'MOVIMENTO'; // TRANSFER, ADJUSTMENT
};

const MOVEMENT_CATEGORY_CONFIG: Record<
  MovementCategory,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badgeClass: string;
    iconColor: string;
  }
> = {
  ENTRADA: {
    label: 'ENTRADA NO ESTOQUE',
    icon: ArrowDownRight,
    badgeClass:
      'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30',
    iconColor: 'text-green-500 border-green-500',
  },
  MOVIMENTO: {
    label: 'MOVIMENTO DE ESTOQUE',
    icon: ArrowRightLeft,
    badgeClass:
      'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30',
    iconColor: 'text-yellow-500 border-yellow-500',
  },
  SAIDA: {
    label: 'SAÍDA DO ESTOQUE',
    icon: ArrowUpRight,
    badgeClass:
      'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30',
    iconColor: 'text-red-500 border-red-500',
  },
};

export function ItemHistoryModal({
  open,
  onOpenChange,
  item,
}: ItemHistoryModalProps) {
  const { data: historyData, isLoading } = useQuery({
    queryKey: ['item-history', item?.id],
    queryFn: async () => {
      if (!item?.id) return { movements: [] };
      return movementsService.listMovements({ itemId: item.id, limit: 50 });
    },
    enabled: open && !!item?.id,
  });

  const movements = historyData?.movements || [];
  const itemCode =
    item?.uniqueCode || item?.fullCode || item?.id.substring(0, 8);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Box className="h-5 w-5" />
            Histórico do Item
          </DialogTitle>
          {item && (
            <DialogDescription className="flex items-center gap-2">
              <span className="font-mono">{itemCode}</span>
              {item.bin?.address && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {item.bin.address}
                  </span>
                </>
              )}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-auto -mx-6 px-6">
          {isLoading ? (
            <div className="space-y-3 py-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : movements.length === 0 ? (
            <div className="py-12 text-center">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-1">Nenhum histórico</h3>
              <p className="text-sm text-muted-foreground">
                Este item ainda não possui movimentações registradas.
              </p>
            </div>
          ) : (
            <div className="py-4 space-y-1">
              {movements.map((movement, index) => (
                <MovementItem
                  key={movement.id}
                  movement={movement}
                  isLast={index === movements.length - 1}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MovementItem({
  movement,
  isLast,
}: {
  movement: ItemMovementExtended;
  isLast: boolean;
}) {
  const category = getMovementCategory(movement.movementType);
  const config = MOVEMENT_CATEGORY_CONFIG[category];
  const Icon = config.icon;

  const formatDate = (date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return format(dateObj, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return String(date);
    }
  };

  return (
    <div className="flex gap-3">
      {/* Timeline indicator */}
      <div className="flex flex-col items-center">
        <div
          className={cn(
            'flex items-center justify-center h-9 w-9 rounded-full border-2',
            config.iconColor,
            'bg-background'
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        {!isLast && <div className="flex-1 w-0.5 bg-border my-1" />}
      </div>

      {/* Content */}
      <div className={cn('flex-1 pb-4', isLast && 'pb-0')}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'px-2.5 py-0.5 rounded-full text-xs font-semibold border',
                  config.badgeClass
                )}
              >
                {config.label}
              </span>
            </div>

            <div className="mt-2 text-sm text-muted-foreground space-y-0.5">
              {movement.quantity !== undefined && (
                <p>
                  Quantidade: {movement.quantity > 0 ? '+' : ''}
                  {movement.quantity}
                </p>
              )}

              {movement.reasonCode && <p>Motivo: {movement.reasonCode}</p>}

              {movement.destinationRef && (
                <p className="flex items-center gap-1">
                  <ArrowRightLeft className="h-3 w-3" />
                  <span>Ref: {movement.destinationRef}</span>
                </p>
              )}

              {movement.notes && (
                <p className="italic">&ldquo;{movement.notes}&rdquo;</p>
              )}
            </div>
          </div>

          <div className="text-right shrink-0">
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {formatDate(movement.createdAt)}
            </p>
            {movement.user && (
              <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <User className="h-3 w-3" />
                {movement.user.name || 'Sistema'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
