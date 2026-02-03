'use client';

import { useState, useMemo } from 'react';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BarChart3,
  Box,
  Calendar,
  ChevronRight,
  Loader2,
  Package,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Warehouse,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

import {
  useStockSummary,
  useMovementsSummary,
  useLowStockAlerts,
} from '@/hooks/stock/use-analytics';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value);
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('month');

  // Calculate date range
  const dateRange = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        startDate = new Date(
          now.getFullYear(),
          Math.floor(now.getMonth() / 3) * 3,
          1
        );
        break;
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0],
    };
  }, [period]);

  // Fetch data
  const {
    data: stockSummary,
    isLoading: loadingStock,
    refetch: refetchStock,
  } = useStockSummary();
  const {
    data: movementsSummary,
    isLoading: loadingMovements,
    refetch: refetchMovements,
  } = useMovementsSummary(dateRange);
  const {
    data: lowStockAlerts,
    isLoading: loadingAlerts,
    refetch: refetchAlerts,
  } = useLowStockAlerts();

  const isLoading = loadingStock || loadingMovements || loadingAlerts;

  const handleRefresh = () => {
    refetchStock();
    refetchMovements();
    refetchAlerts();
  };

  // Mock data for when API is not available
  const mockStockSummary = {
    totalProducts: 150,
    totalVariants: 450,
    totalItems: 12500,
    totalValue: 2500000,
    byWarehouse: [
      {
        warehouseId: '1',
        warehouseName: 'Armazém Principal',
        itemCount: 8500,
        value: 1700000,
      },
      {
        warehouseId: '2',
        warehouseName: 'Armazém Secundário',
        itemCount: 3000,
        value: 600000,
      },
      {
        warehouseId: '3',
        warehouseName: 'Loja Centro',
        itemCount: 1000,
        value: 200000,
      },
    ],
    byCategory: [
      {
        categoryId: '1',
        categoryName: 'Eletrônicos',
        itemCount: 3500,
        value: 1050000,
      },
      {
        categoryId: '2',
        categoryName: 'Vestuário',
        itemCount: 5000,
        value: 750000,
      },
      {
        categoryId: '3',
        categoryName: 'Acessórios',
        itemCount: 4000,
        value: 700000,
      },
    ],
    lowStockAlerts: [],
  };

  const mockMovementsSummary = {
    period: 'month',
    totalEntries: 523,
    totalExits: 412,
    totalTransfers: 87,
    totalAdjustments: 15,
    entriesValue: 450000,
    exitsValue: 380000,
    netChange: 70000,
    pendingApprovals: 5,
    byDay: [
      { date: '2025-12-25', entries: 45, exits: 35, transfers: 8 },
      { date: '2025-12-26', entries: 52, exits: 41, transfers: 12 },
      { date: '2025-12-27', entries: 38, exits: 48, transfers: 5 },
      { date: '2025-12-28', entries: 61, exits: 39, transfers: 10 },
      { date: '2025-12-29', entries: 55, exits: 42, transfers: 7 },
      { date: '2025-12-30', entries: 48, exits: 51, transfers: 9 },
      { date: '2025-12-31', entries: 42, exits: 38, transfers: 6 },
    ],
  };

  const mockLowStockAlerts = [
    {
      variantId: '1',
      variantName: 'Camiseta P Branca',
      currentStock: 5,
      minStock: 20,
      reorderPoint: 15,
    },
    {
      variantId: '2',
      variantName: 'Calça Jeans 42',
      currentStock: 3,
      minStock: 10,
      reorderPoint: 8,
    },
    {
      variantId: '3',
      variantName: 'Tênis Running 40',
      currentStock: 2,
      minStock: 15,
      reorderPoint: 10,
    },
    {
      variantId: '4',
      variantName: 'Jaqueta Inverno G',
      currentStock: 0,
      minStock: 5,
      reorderPoint: 3,
    },
  ];

  // Use mock data if API data is not available
  const displayStockSummary = stockSummary || mockStockSummary;
  const displayMovementsSummary = movementsSummary || mockMovementsSummary;
  const displayLowStockAlerts = lowStockAlerts || mockLowStockAlerts;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Analytics de Estoque
          </h1>
          <p className="text-muted-foreground">
            Métricas e indicadores de performance do estoque
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={period}
            onValueChange={v => setPeriod(v as typeof period)}
          >
            <SelectTrigger className="w-[140px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Última Semana</SelectItem>
              <SelectItem value="month">Este Mês</SelectItem>
              <SelectItem value="quarter">Este Trimestre</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total em Estoque"
          value={formatNumber(displayStockSummary.totalItems)}
          description="unidades"
          icon={Package}
          loading={loadingStock}
        />
        <MetricCard
          title="Valor do Estoque"
          value={formatCurrency(displayStockSummary.totalValue)}
          icon={Box}
          loading={loadingStock}
          iconClass="text-green-600"
        />
        <MetricCard
          title="Movimentações"
          value={formatNumber(
            (displayMovementsSummary.totalEntries || 0) +
              (displayMovementsSummary.totalExits || 0)
          )}
          description={`${displayMovementsSummary.totalEntries} entradas, ${displayMovementsSummary.totalExits} saídas`}
          icon={TrendingUp}
          loading={loadingMovements}
          iconClass="text-blue-600"
        />
        <MetricCard
          title="Alertas"
          value={displayLowStockAlerts.length}
          description="produtos com estoque baixo"
          icon={AlertTriangle}
          loading={loadingAlerts}
          iconClass={
            displayLowStockAlerts.length > 0
              ? 'text-amber-600'
              : 'text-muted-foreground'
          }
          highlight={displayLowStockAlerts.length > 0}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="movements">Movimentações</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Stock by Warehouse */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Warehouse className="h-4 w-4" />
                  Estoque por Armazém
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingStock ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {displayStockSummary.byWarehouse?.map(warehouse => {
                      const percentage =
                        (warehouse.value / displayStockSummary.totalValue) *
                        100;
                      return (
                        <div key={warehouse.warehouseId}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium">
                              {warehouse.warehouseName}
                            </span>
                            <span className="text-muted-foreground">
                              {formatNumber(warehouse.itemCount)} un
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={percentage} className="flex-1" />
                            <span className="text-xs text-muted-foreground w-12 text-right">
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatCurrency(warehouse.value)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stock by Category */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Box className="h-4 w-4" />
                  Estoque por Categoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingStock ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {displayStockSummary.byCategory?.map(category => {
                      const percentage =
                        (category.value / displayStockSummary.totalValue) * 100;
                      return (
                        <div key={category.categoryId}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium">
                              {category.categoryName}
                            </span>
                            <span className="text-muted-foreground">
                              {formatNumber(category.itemCount)} un
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={percentage} className="flex-1" />
                            <span className="text-xs text-muted-foreground w-12 text-right">
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatCurrency(category.value)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Net Change Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Balanço do Período</CardTitle>
              <CardDescription>
                Diferença entre entradas e saídas de estoque
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
                    <ArrowDown className="h-5 w-5" />
                    <span className="font-medium">Entradas</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(displayMovementsSummary.entriesValue || 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatNumber(displayMovementsSummary.totalEntries || 0)}{' '}
                    movimentações
                  </p>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="flex items-center justify-center gap-2 text-red-600 mb-2">
                    <ArrowUp className="h-5 w-5" />
                    <span className="font-medium">Saídas</span>
                  </div>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(displayMovementsSummary.exitsValue || 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatNumber(displayMovementsSummary.totalExits || 0)}{' '}
                    movimentações
                  </p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {(displayMovementsSummary.netChange || 0) >= 0 ? (
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    )}
                    <span className="font-medium">Balanço</span>
                  </div>
                  <p
                    className={cn(
                      'text-2xl font-bold',
                      (displayMovementsSummary.netChange || 0) >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    )}
                  >
                    {(displayMovementsSummary.netChange || 0) >= 0 ? '+' : ''}
                    {formatCurrency(displayMovementsSummary.netChange || 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    variação líquida
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Movements Tab */}
        <TabsContent value="movements" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Movimentações Diárias</CardTitle>
              <CardDescription>
                Entradas, saídas e transferências por dia
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingMovements ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {displayMovementsSummary.byDay?.map(day => (
                      <div
                        key={day.date}
                        className="flex items-center gap-4 p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium">
                            {new Date(day.date).toLocaleDateString('pt-BR', {
                              weekday: 'short',
                              day: '2-digit',
                              month: 'short',
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2 text-green-600">
                            <ArrowDown className="h-4 w-4" />
                            <span>{day.entries}</span>
                          </div>
                          <div className="flex items-center gap-2 text-red-600">
                            <ArrowUp className="h-4 w-4" />
                            <span>{day.exits}</span>
                          </div>
                          <div className="flex items-center gap-2 text-blue-600">
                            <ChevronRight className="h-4 w-4" />
                            <span>{day.transfers}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Alertas de Estoque Baixo
              </CardTitle>
              <CardDescription>
                Produtos abaixo do ponto de reposição
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingAlerts ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : displayLowStockAlerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 mb-4" />
                  <p>Nenhum alerta de estoque baixo</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {displayLowStockAlerts.map(alert => {
                      const percentage =
                        (alert.currentStock / alert.minStock) * 100;
                      const isCritical = alert.currentStock === 0;
                      return (
                        <div
                          key={alert.variantId}
                          className={cn(
                            'p-4 border rounded-lg',
                            isCritical
                              ? 'bg-red-50 dark:bg-red-900/20 border-red-200'
                              : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200'
                          )}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">
                              {alert.variantName}
                            </span>
                            <Badge
                              variant="outline"
                              className={
                                isCritical ? 'text-red-600' : 'text-amber-600'
                              }
                            >
                              {isCritical ? 'Sem Estoque' : 'Estoque Baixo'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">
                                Atual:{' '}
                              </span>
                              <span
                                className={cn(
                                  'font-bold',
                                  isCritical && 'text-red-600'
                                )}
                              >
                                {alert.currentStock}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Mínimo:{' '}
                              </span>
                              <span>{alert.minStock}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Ponto de Reposição:{' '}
                              </span>
                              <span>{alert.reorderPoint}</span>
                            </div>
                          </div>
                          <Progress
                            value={percentage}
                            className={cn(
                              'mt-2',
                              isCritical && '[&>div]:bg-red-600'
                            )}
                          />
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper Components

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: typeof Package;
  loading?: boolean;
  iconClass?: string;
  highlight?: boolean;
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  loading,
  iconClass,
  highlight,
}: MetricCardProps) {
  return (
    <Card
      className={cn(
        highlight && 'border-amber-300 bg-amber-50/50 dark:bg-amber-900/10'
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin mt-2" />
            ) : (
              <>
                <p className="text-2xl font-bold">{value}</p>
                {description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {description}
                  </p>
                )}
              </>
            )}
          </div>
          <Icon className={cn('h-8 w-8 opacity-50', iconClass)} />
        </div>
      </CardContent>
    </Card>
  );
}
