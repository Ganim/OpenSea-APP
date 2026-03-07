import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { PurchaseOrder } from '@/types/stock';
import {
  Calendar,
  ChevronDown,
  Eye,
  Package,
  Truck,
  XCircle,
} from 'lucide-react';
import { STATUS_CONFIG } from '../constants';
import { formatCurrency, formatDate } from '../utils';

interface PurchaseOrderRowProps {
  order: PurchaseOrder;
  suppliers: Array<{ id: string; name: string }>;
  onView: () => void;
  onConfirm: () => void;
  onReceive: () => void;
  onCancel: () => void;
}

export function PurchaseOrderRow({
  order,
  suppliers,
  onView,
  onConfirm,
  onReceive,
  onCancel,
}: PurchaseOrderRowProps) {
  const statusConfig = STATUS_CONFIG[order.status];
  const supplier = suppliers.find(s => s.id === order.supplierId);

  return (
    <div
      className={cn(
        'flex items-center gap-4 p-4 rounded-lg border cursor-pointer hover:shadow-sm transition-shadow',
        statusConfig.bgClass
      )}
      onClick={onView}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium">{order.orderNumber}</span>
          <Badge variant="outline" className={statusConfig.className}>
            {statusConfig.label}
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          {supplier?.name || 'Fornecedor não identificado'}
        </div>
        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(order.createdAt)}
          </span>
          <span className="flex items-center gap-1">
            <Package className="h-3 w-3" />
            {order.items?.length || 0} item(s)
          </span>
        </div>
      </div>

      <div className="text-right">
        <div className="font-bold text-lg">
          {formatCurrency(order.totalCost || 0)}
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            aria-label="Ações da ordem"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={e => {
              e.stopPropagation();
              onView();
            }}
          >
            <Eye className="h-4 w-4 mr-2" />
            Visualizar
          </DropdownMenuItem>
          {order.status === 'PENDING' && (
            <DropdownMenuItem
              onClick={e => {
                e.stopPropagation();
                onConfirm();
              }}
            >
              <Truck className="h-4 w-4 mr-2" />
              Confirmar
            </DropdownMenuItem>
          )}
          {order.status === 'CONFIRMED' && (
            <DropdownMenuItem
              onClick={e => {
                e.stopPropagation();
                onReceive();
              }}
            >
              <Package className="h-4 w-4 mr-2" />
              Receber
            </DropdownMenuItem>
          )}
          {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
            <DropdownMenuItem
              onClick={e => {
                e.stopPropagation();
                onCancel();
              }}
              className="text-destructive"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancelar
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
