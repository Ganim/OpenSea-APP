'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ArrowDownCircle,
  ArrowRightCircle,
  ArrowUpCircle,
  Clock,
  RefreshCcw,
  RotateCcw,
  User,
} from 'lucide-react';
import { MovementStatusBadge, MovementTypeBadge } from './stock-badge';
import type {
  ItemMovementExtended,
  MovementType,
  MovementStatus,
} from '@/types/stock';

// ============================================
// MOVEMENT FEED ITEM
// ============================================

const movementTypeIcons: Record<MovementType, React.ElementType> = {
  ENTRY: ArrowDownCircle,
  EXIT: ArrowUpCircle,
  TRANSFER: ArrowRightCircle,
  ADJUSTMENT: RefreshCcw,
  ZONE_RECONFIGURE: RotateCcw,
};

const movementTypeColors: Record<MovementType, string> = {
  ENTRY: 'text-green-500',
  EXIT: 'text-red-500',
  TRANSFER: 'text-blue-500',
  ADJUSTMENT: 'text-yellow-500',
  ZONE_RECONFIGURE: 'text-purple-500',
};

interface MovementFeedItemProps {
  movement: ItemMovementExtended;
  onClick?: () => void;
}

export function MovementFeedItem({ movement, onClick }: MovementFeedItemProps) {
  const Icon = movementTypeIcons[movement.movementType];
  const iconColor = movementTypeColors[movement.movementType];

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg border bg-card transition-colors',
        onClick && 'cursor-pointer hover:bg-muted/50'
      )}
      onClick={onClick}
    >
      <div className={cn('mt-0.5', iconColor)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <MovementTypeBadge type={movement.movementType} />
          {movement.status && movement.status !== 'COMPLETED' && (
            <MovementStatusBadge status={movement.status} />
          )}
        </div>
        <p className="text-sm text-muted-foreground truncate">
          {movement.quantity} un. • Item #{movement.itemId?.slice(0, 8)}
        </p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {movement.user?.name || 'Sistema'}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDistanceToNow(new Date(movement.createdAt), {
              addSuffix: true,
              locale: ptBR,
            })}
          </span>
        </div>
        {movement.notes && (
          <p className="text-xs text-muted-foreground italic truncate">
            "{movement.notes}"
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================
// MOVEMENT FEED
// ============================================

interface MovementFeedProps {
  movements: ItemMovementExtended[];
  title?: string;
  maxHeight?: number;
  showViewAll?: boolean;
  onViewAll?: () => void;
  onItemClick?: (movement: ItemMovementExtended) => void;
  emptyMessage?: string;
  className?: string;
}

export function MovementFeed({
  movements,
  title = 'Movimentações Recentes',
  maxHeight = 400,
  showViewAll = true,
  onViewAll,
  onItemClick,
  emptyMessage = 'Nenhuma movimentação recente',
  className,
}: MovementFeedProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        {showViewAll && movements.length > 0 && (
          <button
            onClick={onViewAll}
            className="text-sm text-primary hover:underline"
          >
            Ver tudo
          </button>
        )}
      </CardHeader>
      <CardContent>
        {movements.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <ScrollArea style={{ maxHeight }} className="pr-4">
            <div className="space-y-2">
              {movements.map(movement => (
                <MovementFeedItem
                  key={movement.id}
                  movement={movement}
                  onClick={() => onItemClick?.(movement)}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// PENDING APPROVALS FEED
// ============================================

interface PendingApprovalsFeedProps {
  movements: ItemMovementExtended[];
  onApprove?: (movement: ItemMovementExtended) => void;
  onReject?: (movement: ItemMovementExtended) => void;
  onViewAll?: () => void;
  className?: string;
}

export function PendingApprovalsFeed({
  movements,
  onApprove,
  onReject,
  onViewAll,
  className,
}: PendingApprovalsFeedProps) {
  const pendingMovements = movements.filter(
    m => m.status === 'PENDING_APPROVAL'
  );

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          Pendentes de Aprovação
          {pendingMovements.length > 0 && (
            <span className="inline-flex items-center justify-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
              {pendingMovements.length}
            </span>
          )}
        </CardTitle>
        {pendingMovements.length > 0 && (
          <button
            onClick={onViewAll}
            className="text-sm text-primary hover:underline"
          >
            Ver tudo
          </button>
        )}
      </CardHeader>
      <CardContent>
        {pendingMovements.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            Nenhuma aprovação pendente
          </div>
        ) : (
          <ScrollArea style={{ maxHeight: 300 }} className="pr-4">
            <div className="space-y-2">
              {pendingMovements.slice(0, 5).map(movement => (
                <div
                  key={movement.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <MovementTypeBadge type={movement.movementType} />
                      <span className="text-sm text-muted-foreground">
                        {movement.quantity} un.
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Por {movement.user?.name || 'Sistema'} •{' '}
                      {formatDistanceToNow(new Date(movement.createdAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onApprove?.(movement)}
                      className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Aprovar
                    </button>
                    <button
                      onClick={() => onReject?.(movement)}
                      className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Rejeitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
