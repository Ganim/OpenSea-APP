'use client';

import { useRouter } from 'next/navigation';
import {
  Package,
  PackagePlus,
  PackageMinus,
  ArrowRightLeft,
  ScanLine,
  ClipboardList,
  BarChart3,
  Boxes,
  AlertTriangle,
  Clock,
} from 'lucide-react';

import { useStockDashboard, usePendingApprovals } from '@/hooks/stock';
import { PermissionGate } from '@/components/auth/permission-gate';
import { STOCK_PERMISSIONS } from '../_shared/constants';
import {
  KpiCard,
  KpiGrid,
  QuickActionButton,
  QuickActionsGrid,
  MovementFeed,
  PendingApprovalsFeed,
  LowStockAlerts,
} from '../_shared/components';

export default function CommandCenterPage() {
  const router = useRouter();
  const { data: dashboard, isLoading: dashboardLoading } = useStockDashboard();
  const { data: pendingApprovals } = usePendingApprovals();

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Central de Estoque
        </h1>
        <p className="text-muted-foreground">
          Visão geral e ações rápidas para gestão de estoque
        </p>
      </div>

      {/* KPIs */}
      <KpiGrid columns={4}>
        <KpiCard
          title="Total de Itens"
          value={
            dashboard?.stockSummary?.totalItems?.toLocaleString('pt-BR') || '0'
          }
          subtitle="un."
          icon={Package}
          variant="info"
          onClick={() => router.push('/stock/items')}
        />
        <KpiCard
          title="Estoque Baixo"
          value={dashboard?.stockSummary?.lowStockAlerts?.length || 0}
          subtitle="alertas"
          icon={AlertTriangle}
          variant={
            (dashboard?.stockSummary?.lowStockAlerts?.length || 0) > 0
              ? 'warning'
              : 'default'
          }
          onClick={() => router.push('/stock/items?filter=low-stock')}
        />
        <PermissionGate permission={STOCK_PERMISSIONS.MOVEMENTS.APPROVE}>
          <KpiCard
            title="Pendentes Aprovação"
            value={pendingApprovals?.total || 0}
            subtitle="saídas"
            icon={Clock}
            variant={(pendingApprovals?.total || 0) > 0 ? 'danger' : 'default'}
            onClick={() => router.push('/stock/movements/pending')}
          />
        </PermissionGate>
        <KpiCard
          title="Valor em Estoque"
          value={formatCurrency(dashboard?.stockSummary?.totalValue || 0)}
          icon={BarChart3}
          variant="success"
          onClick={() => router.push('/stock/analytics')}
        />
      </KpiGrid>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Ações Rápidas</h2>
        <QuickActionsGrid columns={6}>
          <PermissionGate permission={STOCK_PERMISSIONS.ITEMS.ENTRY}>
            <QuickActionButton
              label="Entrada"
              icon={PackagePlus}
              variant="entry"
              href="/stock/items?action=entry"
            />
          </PermissionGate>
          <PermissionGate permission={STOCK_PERMISSIONS.ITEMS.EXIT}>
            <QuickActionButton
              label="Saída"
              icon={PackageMinus}
              variant="exit"
              href="/stock/items?action=exit"
            />
          </PermissionGate>
          <PermissionGate permission={STOCK_PERMISSIONS.ITEMS.TRANSFER}>
            <QuickActionButton
              label="Transferir"
              icon={ArrowRightLeft}
              variant="transfer"
              href="/stock/items?action=transfer"
            />
          </PermissionGate>
          <QuickActionButton
            label="Escanear"
            icon={ScanLine}
            variant="scan"
            href="/stock/quick-scan"
          />
          <PermissionGate permission={STOCK_PERMISSIONS.ITEMS.CREATE}>
            <QuickActionButton
              label="Cadastrar"
              icon={Boxes}
              href="/stock/wizard"
            />
          </PermissionGate>
          <QuickActionButton
            label="Inventário"
            icon={ClipboardList}
            variant="inventory"
            href="/stock/inventory"
          />
        </QuickActionsGrid>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Recent Movements */}
          <MovementFeed
            movements={dashboard?.recentMovements || []}
            title="Movimentações Recentes"
            maxHeight={350}
            onViewAll={() => router.push('/stock/movements')}
            onItemClick={movement =>
              router.push(`/stock/movements?id=${movement.id}`)
            }
            emptyMessage="Nenhuma movimentação nas últimas 24h"
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Pending Approvals */}
          <PermissionGate permission={STOCK_PERMISSIONS.MOVEMENTS.APPROVE}>
            <PendingApprovalsFeed
              movements={pendingApprovals?.movements || []}
              onViewAll={() => router.push('/stock/movements/pending')}
              onApprove={movement => {
                // TODO: Open approval modal
                console.log('Approve', movement.id);
              }}
              onReject={movement => {
                // TODO: Open rejection modal
                console.log('Reject', movement.id);
              }}
            />
          </PermissionGate>

          {/* Low Stock Alerts */}
          <LowStockAlerts
            items={dashboard?.stockSummary?.lowStockAlerts || []}
            onItemClick={item =>
              router.push(`/stock/variants/${item.variantId}`)
            }
          />
        </div>
      </div>

      {/* Distribution by Warehouse */}
      {dashboard?.stockSummary?.byWarehouse &&
        dashboard.stockSummary.byWarehouse.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Distribuição por Armazém</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {dashboard.stockSummary.byWarehouse.map(warehouse => (
                <div
                  key={warehouse.warehouseId}
                  className="p-4 rounded-lg border bg-card cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() =>
                    router.push(`/stock/locations/${warehouse.warehouseId}`)
                  }
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{warehouse.warehouseName}</p>
                      <p className="text-sm text-muted-foreground">
                        {warehouse.itemCount.toLocaleString('pt-BR')} itens
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        {formatCurrency(warehouse.value)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  );
}
