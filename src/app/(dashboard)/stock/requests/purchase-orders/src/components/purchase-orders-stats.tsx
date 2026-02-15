import { Package, ShoppingCart, Truck } from 'lucide-react';
import { StatCard } from './stat-card';
import { formatCurrency } from '../utils';

interface PurchaseOrdersStatsProps {
  pendingCount: number;
  confirmedCount: number;
  receivedCount: number;
  totalValue: number;
}

export function PurchaseOrdersStats({
  pendingCount,
  confirmedCount,
  receivedCount,
  totalValue,
}: PurchaseOrdersStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Pendentes"
        value={pendingCount}
        icon={Package}
        className="bg-amber-50 dark:bg-amber-900/20"
        iconClass="text-amber-600"
      />
      <StatCard
        label="Confirmadas"
        value={confirmedCount}
        icon={Truck}
        className="bg-blue-50 dark:bg-blue-900/20"
        iconClass="text-blue-600"
      />
      <StatCard
        label="Recebidas"
        value={receivedCount}
        icon={Package}
        className="bg-green-50 dark:bg-green-900/20"
        iconClass="text-green-600"
      />
      <StatCard
        label="Valor Total"
        value={formatCurrency(totalValue)}
        icon={ShoppingCart}
        className="bg-muted/50"
        isMonetary
      />
    </div>
  );
}
