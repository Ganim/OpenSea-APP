/**
 * Costing Page — Custos de Produção
 * Acompanhamento de custos planejados e realizados por ordem de produção.
 */

'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  DollarSign,
  Search,
  Calculator,
  TrendingUp,
  TrendingDown,
  Loader2,
  ArrowUpDown,
} from 'lucide-react';

import { PageActionBar } from '@/components/layout/page-action-bar';
import { PageHeroBanner } from '@/components/layout/page-hero-banner';
import { usePermissions } from '@/hooks/use-permissions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

import { PRODUCTION_PERMISSIONS } from '@/config/rbac/permission-codes';
import { costingService } from '@/services/production';
import type { OrderCostSummary, ProductionCost } from '@/services/production/costing.service';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function varianceBadgeClass(variance: number): string {
  if (variance > 0) {
    return 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/8 dark:text-rose-300';
  }
  if (variance < 0) {
    return 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/8 dark:text-emerald-300';
  }
  return 'border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-500/20 dark:bg-slate-500/8 dark:text-slate-300';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CostingPage() {
  const { hasPermission } = usePermissions();
  const [orderId, setOrderId] = useState('');
  const [searchedOrderId, setSearchedOrderId] = useState('');

  const canAccess = hasPermission(PRODUCTION_PERMISSIONS.COSTING.ACCESS);

  // ---- Data query -----------------------------------------------------------

  const {
    data: costsData,
    isLoading: isLoadingCosts,
    error: costsError,
  } = useQuery({
    queryKey: ['production', 'costs', searchedOrderId],
    queryFn: async () => {
      const res = await costingService.list(searchedOrderId);
      return res.costs;
    },
    enabled: !!searchedOrderId,
  });

  // ---- Calculate mutation ---------------------------------------------------

  const calculateMutation = useMutation({
    mutationFn: (id: string) => costingService.calculateOrderCost(id),
    onSuccess: () => {
      toast.success('Custo total calculado com sucesso');
    },
    onError: () => toast.error('Erro ao calcular custo total'),
  });

  const summary: OrderCostSummary | null = calculateMutation.data ?? null;

  // ---- Handlers -------------------------------------------------------------

  function handleSearch() {
    const trimmed = orderId.trim();
    if (!trimmed) {
      toast.error('Informe o ID da ordem de produção');
      return;
    }
    setSearchedOrderId(trimmed);
    calculateMutation.reset();
  }

  function handleCalculate() {
    if (!searchedOrderId) {
      toast.error('Busque uma ordem de produção primeiro');
      return;
    }
    calculateMutation.mutate(searchedOrderId);
  }

  // ---- Stats cards ----------------------------------------------------------

  const statsCards = summary
    ? [
        {
          label: 'Planejado',
          value: formatCurrency(summary.totalPlanned),
          icon: TrendingUp,
          from: 'from-sky-500',
          to: 'to-sky-600',
        },
        {
          label: 'Realizado',
          value: formatCurrency(summary.totalActual),
          icon: DollarSign,
          from: 'from-emerald-500',
          to: 'to-emerald-600',
        },
        {
          label: 'Variação',
          value: formatCurrency(summary.totalVariance),
          icon: summary.totalVariance > 0 ? TrendingDown : ArrowUpDown,
          from: summary.totalVariance > 0 ? 'from-rose-500' : 'from-violet-500',
          to: summary.totalVariance > 0 ? 'to-rose-600' : 'to-violet-600',
        },
      ]
    : [];

  const costs: ProductionCost[] = costsData ?? [];

  // ---- Render ---------------------------------------------------------------

  if (!canAccess) return null;

  return (
    <div className="space-y-6" data-testid="production-costing-page">
      <PageActionBar
        breadcrumbItems={[
          { label: 'Produção', href: '/production' },
          { label: 'Custos', href: '/production/costing' },
        ]}
      />

      <PageHeroBanner
        title="Custos de Produção"
        description="Acompanhe custos planejados e realizados por ordem de produção"
        icon={DollarSign}
        iconGradient="from-emerald-500 to-emerald-600"
        buttons={[]}
        hasPermission={hasPermission}
      />

      {/* Search bar */}
      <Card className="p-4 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="ID da Ordem de Produção"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
              data-testid="costing-order-input"
            />
          </div>
          <Button
            size="sm"
            className="h-9 px-2.5 gap-1"
            onClick={handleSearch}
          >
            <Search className="h-4 w-4" />
            Buscar
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-9 px-2.5 gap-1"
            onClick={handleCalculate}
            disabled={!searchedOrderId || calculateMutation.isPending}
          >
            {calculateMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Calculator className="h-4 w-4" />
            )}
            Calcular Custo Total
          </Button>
        </div>
      </Card>

      {/* Summary stats */}
      {statsCards.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {statsCards.map((s) => (
            <Card
              key={s.label}
              className="p-4 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl bg-linear-to-br ${s.from} ${s.to} flex items-center justify-center`}
                >
                  <s.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-white/60">
                    {s.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {s.value}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Cost breakdown table */}
      {isLoadingCosts && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      )}

      {costsError && (
        <Card className="p-6 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
          <p className="text-sm text-rose-600 dark:text-rose-400">
            Erro ao carregar custos da ordem.
          </p>
        </Card>
      )}

      {searchedOrderId && !isLoadingCosts && !costsError && costs.length === 0 && (
        <Card className="p-6 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
          <p className="text-sm text-gray-500 dark:text-white/60">
            Nenhum custo registrado para esta ordem de produção.
          </p>
        </Card>
      )}

      {costs.length > 0 && (
        <Card className="bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-white/10">
                  <th className="text-left p-4 font-medium text-gray-500 dark:text-white/60">
                    Tipo
                  </th>
                  <th className="text-left p-4 font-medium text-gray-500 dark:text-white/60">
                    Descrição
                  </th>
                  <th className="text-right p-4 font-medium text-gray-500 dark:text-white/60">
                    Planejado
                  </th>
                  <th className="text-right p-4 font-medium text-gray-500 dark:text-white/60">
                    Realizado
                  </th>
                  <th className="text-right p-4 font-medium text-gray-500 dark:text-white/60">
                    Variação
                  </th>
                </tr>
              </thead>
              <tbody>
                {costs.map((cost) => (
                  <tr
                    key={cost.id}
                    className="border-b border-gray-100 dark:border-white/5 last:border-0"
                  >
                    <td className="p-4 font-medium text-gray-900 dark:text-white">
                      {cost.costType}
                    </td>
                    <td className="p-4 text-gray-500 dark:text-white/60">
                      {cost.description ?? '—'}
                    </td>
                    <td className="p-4 text-right text-gray-900 dark:text-white">
                      {formatCurrency(cost.plannedAmount)}
                    </td>
                    <td className="p-4 text-right text-gray-900 dark:text-white">
                      {formatCurrency(cost.actualAmount)}
                    </td>
                    <td className="p-4 text-right">
                      <Badge
                        variant="outline"
                        className={varianceBadgeClass(cost.variance)}
                      >
                        {formatCurrency(cost.variance)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
