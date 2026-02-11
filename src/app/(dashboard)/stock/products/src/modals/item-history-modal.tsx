/**
 * ItemHistoryModal - Modal showing item movement history
 * Shows proper action labels, icons, colors per movement type/reason
 */

'use client';

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
import type { Item, ItemMovementExtended } from '@/types/stock';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowDownRight,
  ArrowRightLeft,
  ArrowUpRight,
  Bookmark,
  Building,
  Clock,
  History,
  MapPin,
  Package,
  ShieldAlert,
  ShoppingCart,
  Undo2,
} from 'lucide-react';
import {
  PiCalendarBlankDuotone,
  PiHashStraightDuotone,
  PiMapPinDuotone,
  PiUserDuotone,
} from 'react-icons/pi';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface ItemHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: Item | null;
}

/** Action config resolved from movementType + reasonCode */
interface ActionConfig {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeClass: string;
  iconColor: string;
  quantityPrefix: '+' | '-' | '';
}

/**
 * Resolve the display action from backend movementType and reasonCode.
 *
 * Backend movementType values:
 *  - INVENTORY_ADJUSTMENT (entry uses reasonCode='ENTRY')
 *  - SALE, LOSS, PRODUCTION, SAMPLE (exit types)
 *  - TRANSFER
 *  - ZONE_RECONFIGURE
 *
 * reasonCode values (from ExitType):
 *  - ENTRY, SALE, LOSS, INTERNAL_USE, SUPPLIER_RETURN, TRANSFER, RESERVATION
 */
const getActionConfig = (
  movementType: string,
  reasonCode?: string | null
): ActionConfig => {
  // 1. Check reasonCode first — it has the most specific info
  if (reasonCode === 'ENTRY') {
    return {
      label: 'Entrada',
      icon: ArrowDownRight,
      badgeClass:
        'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30',
      iconColor: 'text-green-500 border-green-500',
      quantityPrefix: '+',
    };
  }

  if (reasonCode === 'SALE') {
    return {
      label: 'Venda',
      icon: ShoppingCart,
      badgeClass:
        'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
      iconColor: 'text-emerald-500 border-emerald-500',
      quantityPrefix: '-',
    };
  }

  if (reasonCode === 'SUPPLIER_RETURN') {
    return {
      label: 'Devolução',
      icon: Undo2,
      badgeClass:
        'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30',
      iconColor: 'text-blue-500 border-blue-500',
      quantityPrefix: '-',
    };
  }

  if (reasonCode === 'INTERNAL_USE') {
    return {
      label: 'Utilização',
      icon: Building,
      badgeClass:
        'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30',
      iconColor: 'text-yellow-500 border-yellow-500',
      quantityPrefix: '-',
    };
  }

  if (reasonCode === 'LOSS') {
    return {
      label: 'Perda',
      icon: ShieldAlert,
      badgeClass:
        'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30',
      iconColor: 'text-red-500 border-red-500',
      quantityPrefix: '-',
    };
  }

  if (reasonCode === 'RESERVATION') {
    return {
      label: 'Reserva',
      icon: Bookmark,
      badgeClass:
        'bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border-indigo-500/30',
      iconColor: 'text-indigo-500 border-indigo-500',
      quantityPrefix: '-',
    };
  }

  // 2. Then by movementType
  if (movementType === 'TRANSFER') {
    return {
      label: 'Transferência',
      icon: ArrowRightLeft,
      badgeClass:
        'bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/30',
      iconColor: 'text-orange-500 border-orange-500',
      quantityPrefix: '',
    };
  }

  if (movementType === 'ZONE_RECONFIGURE') {
    return {
      label: 'Reconfiguração',
      icon: ArrowRightLeft,
      badgeClass:
        'bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-500/30',
      iconColor: 'text-purple-500 border-purple-500',
      quantityPrefix: '',
    };
  }

  // Exit movementTypes without specific reasonCode
  if (movementType === 'SALE') {
    return {
      label: 'Venda',
      icon: ShoppingCart,
      badgeClass:
        'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
      iconColor: 'text-emerald-500 border-emerald-500',
      quantityPrefix: '-',
    };
  }

  if (movementType === 'LOSS') {
    return {
      label: 'Perda',
      icon: ShieldAlert,
      badgeClass:
        'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30',
      iconColor: 'text-red-500 border-red-500',
      quantityPrefix: '-',
    };
  }

  if (movementType === 'PRODUCTION') {
    return {
      label: 'Utilização',
      icon: Building,
      badgeClass:
        'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30',
      iconColor: 'text-yellow-500 border-yellow-500',
      quantityPrefix: '-',
    };
  }

  if (movementType === 'SAMPLE') {
    return {
      label: 'Amostra',
      icon: ArrowUpRight,
      badgeClass:
        'bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-500/30',
      iconColor: 'text-purple-500 border-purple-500',
      quantityPrefix: '-',
    };
  }

  if (movementType === 'INVENTORY_ADJUSTMENT') {
    return {
      label: 'Ajuste',
      icon: Package,
      badgeClass:
        'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30',
      iconColor: 'text-yellow-500 border-yellow-500',
      quantityPrefix: '',
    };
  }

  // Fallback
  return {
    label: 'Movimento',
    icon: ArrowRightLeft,
    badgeClass:
      'bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-500/30',
    iconColor: 'text-gray-500 border-gray-500',
    quantityPrefix: '',
  };
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
    item?.fullCode || item?.uniqueCode || item?.id.substring(0, 8);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico do Item
          </DialogTitle>
          {item && (
            <DialogDescription className="flex items-center gap-2">
              <Package className="h-3.5 w-3.5" />
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
  const config = getActionConfig(movement.movementType, movement.reasonCode);
  const Icon = config.icon;

  const formatDate = (date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return format(dateObj, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return String(date);
    }
  };

  // Format quantity with proper sign
  const formatMovementQuantity = () => {
    if (movement.quantity === undefined || movement.quantity === null)
      return null;
    const absQty = Math.abs(movement.quantity);
    if (config.quantityPrefix === '-') return `-${absQty}`;
    if (config.quantityPrefix === '+') return `+${absQty}`;
    return String(movement.quantity);
  };

  const quantityDisplay = formatMovementQuantity();

  // Extract location from destinationRef (format: "Bin: ADDRESS")
  const locationDisplay = movement.destinationRef?.startsWith('Bin: ')
    ? movement.destinationRef.slice(5)
    : movement.destinationRef || null;

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
            <span
              className={cn(
                'px-2.5 py-0.5 rounded-full text-xs font-semibold border',
                config.badgeClass
              )}
            >
              {config.label}
            </span>

            <div className="mt-2 text-sm text-muted-foreground space-y-0.5">
              {quantityDisplay && (
                <p className="flex items-center gap-1">
                  <PiHashStraightDuotone className="h-3.5 w-3.5 shrink-0" />
                  <span className="font-semibold">Quantidade:</span>
                  <span
                    className={cn(
                      'font-mono font-semibold',
                      config.quantityPrefix === '-'
                        ? 'text-red-600 dark:text-red-400'
                        : config.quantityPrefix === '+'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-foreground'
                    )}
                  >
                    {quantityDisplay}
                  </span>
                </p>
              )}

              {movement.originRef && locationDisplay ? (
                <p className="flex items-center gap-1">
                  <PiMapPinDuotone className="h-3.5 w-3.5 shrink-0" />
                  <span className="font-semibold">Localização:</span>
                  {movement.originRef.startsWith('Bin: ')
                    ? movement.originRef.slice(5)
                    : movement.originRef}
                  <ArrowRightLeft className="h-3 w-3 shrink-0 mx-0.5" />
                  {locationDisplay}
                </p>
              ) : locationDisplay ? (
                <p className="flex items-center gap-1">
                  <PiMapPinDuotone className="h-3.5 w-3.5 shrink-0" />
                  <span className="font-semibold">Localização:</span>
                  {locationDisplay}
                </p>
              ) : movement.originRef ? (
                <p className="flex items-center gap-1">
                  <PiMapPinDuotone className="h-3.5 w-3.5 shrink-0" />
                  <span className="font-semibold">Localização:</span>
                  {movement.originRef.startsWith('Bin: ')
                    ? movement.originRef.slice(5)
                    : movement.originRef}
                </p>
              ) : null}

              {movement.notes && (
                <p className="italic">&ldquo;{movement.notes}&rdquo;</p>
              )}
            </div>
          </div>

          <div className="text-right shrink-0">
            <p className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
              <PiCalendarBlankDuotone className="h-3.5 w-3.5" />
              {formatDate(movement.createdAt)}
            </p>
            {movement.user && (
              <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5 justify-end">
                <PiUserDuotone className="h-3.5 w-3.5" />
                {movement.user.name || 'Sistema'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
