import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { PurchaseOrder } from '@/types/stock';
import { Loader2, ShoppingCart } from 'lucide-react';
import { PurchaseOrderRow } from './purchase-order-row';

interface PurchaseOrdersListProps {
  purchaseOrders: PurchaseOrder[];
  suppliers: Array<{ id: string; name: string }>;
  totalCount: number;
  isLoading: boolean;
  hasFilters: boolean;
  onResetFilters: () => void;
  onView: (order: PurchaseOrder) => void;
  onConfirm: (order: PurchaseOrder) => void;
  onReceive: (order: PurchaseOrder) => void;
  onCancel: (order: PurchaseOrder) => void;
}

export function PurchaseOrdersList({
  purchaseOrders,
  suppliers,
  totalCount,
  isLoading,
  hasFilters,
  onResetFilters,
  onView,
  onConfirm,
  onReceive,
  onCancel,
}: PurchaseOrdersListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Ordens de Compra
          <Badge variant="secondary" className="ml-2">
            {totalCount} ordem(s)
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : purchaseOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <ShoppingCart className="h-12 w-12 mb-4" />
            <p>Nenhuma ordem de compra encontrada</p>
            {hasFilters && (
              <Button
                variant="link"
                size="sm"
                onClick={onResetFilters}
                className="mt-2"
              >
                Limpar filtros
              </Button>
            )}
          </div>
        ) : (
          <ScrollArea className="h-[500px]">
            <div className="space-y-3 pr-4">
              {purchaseOrders.map(order => (
                <PurchaseOrderRow
                  key={order.id}
                  order={order}
                  suppliers={suppliers}
                  onView={() => onView(order)}
                  onConfirm={() => onConfirm(order)}
                  onReceive={() => onReceive(order)}
                  onCancel={() => onCancel(order)}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
