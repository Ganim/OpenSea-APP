'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ItemStatus, MovementStatus, VolumeStatus } from '@/types/stock';

// ============================================
// ITEM STATUS BADGE
// ============================================

const itemStatusConfig: Record<
  ItemStatus,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  }
> = {
  AVAILABLE: { label: 'Disponível', variant: 'default' },
  RESERVED: { label: 'Reservado', variant: 'secondary' },
  SOLD: { label: 'Vendido', variant: 'outline' },
  DAMAGED: { label: 'Danificado', variant: 'destructive' },
};

interface ItemStatusBadgeProps {
  status: ItemStatus;
  className?: string;
}

export function ItemStatusBadge({ status, className }: ItemStatusBadgeProps) {
  const config = itemStatusConfig[status];
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}

// ============================================
// MOVEMENT STATUS BADGE
// ============================================

const movementStatusConfig: Record<
  MovementStatus,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    className?: string;
  }
> = {
  PENDING_APPROVAL: {
    label: 'Pendente',
    variant: 'outline',
    className: 'border-yellow-500 text-yellow-600',
  },
  COMPLETED: {
    label: 'Concluído',
    variant: 'default',
    className: 'bg-green-500',
  },
  REJECTED: { label: 'Rejeitado', variant: 'destructive' },
  CANCELLED: { label: 'Cancelado', variant: 'secondary' },
};

interface MovementStatusBadgeProps {
  status: MovementStatus;
  className?: string;
}

export function MovementStatusBadge({
  status,
  className,
}: MovementStatusBadgeProps) {
  const config = movementStatusConfig[status];
  return (
    <Badge variant={config.variant} className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}

// ============================================
// VOLUME STATUS BADGE
// ============================================

const volumeStatusConfig: Record<
  VolumeStatus,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    className?: string;
  }
> = {
  OPEN: {
    label: 'Aberto',
    variant: 'outline',
    className: 'border-blue-500 text-blue-600',
  },
  CLOSED: { label: 'Fechado', variant: 'secondary' },
  DELIVERED: {
    label: 'Entregue',
    variant: 'default',
    className: 'bg-green-500',
  },
  RETURNED: { label: 'Devolvido', variant: 'destructive' },
};

interface VolumeStatusBadgeProps {
  status: VolumeStatus;
  className?: string;
}

export function VolumeStatusBadge({
  status,
  className,
}: VolumeStatusBadgeProps) {
  const config = volumeStatusConfig[status];
  return (
    <Badge variant={config.variant} className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}

// ============================================
// STOCK LEVEL BADGE
// ============================================

interface StockLevelBadgeProps {
  current: number;
  min?: number;
  max?: number;
  className?: string;
}

export function StockLevelBadge({
  current,
  min = 0,
  max,
  className,
}: StockLevelBadgeProps) {
  const isLow = min > 0 && current <= min;
  const isHigh = max && current >= max;
  const isZero = current === 0;

  if (isZero) {
    return (
      <Badge variant="destructive" className={className}>
        Sem estoque
      </Badge>
    );
  }

  if (isLow) {
    return (
      <Badge
        variant="outline"
        className={cn('border-orange-500 text-orange-600', className)}
      >
        Estoque baixo ({current})
      </Badge>
    );
  }

  if (isHigh) {
    return (
      <Badge
        variant="outline"
        className={cn('border-blue-500 text-blue-600', className)}
      >
        Estoque alto ({current})
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className={className}>
      {current} un.
    </Badge>
  );
}

// ============================================
// MOVEMENT TYPE BADGE
// ============================================

import type { MovementType } from '@/types/stock';

const movementTypeConfig: Record<
  MovementType,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    className?: string;
  }
> = {
  ENTRY: { label: 'Entrada', variant: 'default', className: 'bg-green-500' },
  EXIT: { label: 'Saída', variant: 'destructive' },
  TRANSFER: { label: 'Transferência', variant: 'secondary' },
  ADJUSTMENT: { label: 'Ajuste', variant: 'outline' },
};

interface MovementTypeBadgeProps {
  type: MovementType;
  className?: string;
}

export function MovementTypeBadge({ type, className }: MovementTypeBadgeProps) {
  const config = movementTypeConfig[type];
  return (
    <Badge variant={config.variant} className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
