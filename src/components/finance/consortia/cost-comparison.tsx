/**
 * Cost Comparison Component (CONS-03)
 * Side-by-side comparison: Consortium total cost vs direct purchase vs equivalent financing.
 */

'use client';

import { Card } from '@/components/ui/card';
import { calculatePrice } from '@/lib/finance/amortization';
import type { Consortium } from '@/types/finance';
import { ArrowDown, ArrowUp, Equal, TrendingDown } from 'lucide-react';

interface CostComparisonProps {
  consortium: Consortium;
  /** Market monthly interest rate as decimal (e.g., 0.01 for 1%). Default: ~Selic equivalent */
  marketMonthlyRate?: number;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatPercent(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function CostComparison({
  consortium,
  marketMonthlyRate = 0.01,
}: CostComparisonProps) {
  // 1. Consortium total cost (all payments including admin fees)
  const consortiumTotalCost =
    consortium.totalInstallments * consortium.monthlyPayment;

  // 2. Direct purchase (cash/vista)
  const directPurchase = consortium.creditValue;

  // 3. Equivalent financing (Price system at market rate for same credit value and term)
  const priceRows = calculatePrice(
    consortium.creditValue,
    marketMonthlyRate,
    consortium.totalInstallments
  );
  const financingTotalCost = priceRows.reduce((sum, r) => sum + r.payment, 0);

  // Determine cheapest option
  const options = [
    { label: 'Consórcio', value: consortiumTotalCost },
    { label: 'Compra Direta', value: directPurchase },
    { label: 'Financiamento', value: financingTotalCost },
  ].sort((a, b) => a.value - b.value);

  const cheapest = options[0].label;

  // Calculate differences from direct purchase
  const consortiumExtra = consortiumTotalCost - directPurchase;
  const financingExtra = financingTotalCost - directPurchase;

  return (
    <Card className="overflow-hidden">
      <div className="p-4 sm:p-6 border-b">
        <div className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">
            Custo Total vs Compra Direta
          </h3>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Comparação entre as modalidades de aquisição para o mesmo bem
        </p>
      </div>

      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Consórcio */}
          <div
            className={`p-4 rounded-lg border-2 ${
              cheapest === 'Consórcio'
                ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/20'
                : 'border-transparent bg-muted/30'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">
                Consórcio
              </p>
              {cheapest === 'Consórcio' && (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full">
                  Mais Barato
                </span>
              )}
            </div>
            <p className="text-2xl font-bold font-mono">
              {formatCurrency(consortiumTotalCost)}
            </p>
            <div className="flex items-center gap-1 mt-2 text-sm">
              {consortiumExtra > 0 ? (
                <>
                  <ArrowUp className="h-3 w-3 text-red-500" />
                  <span className="text-red-600 dark:text-red-400">
                    +{formatCurrency(consortiumExtra)} sobre vista
                  </span>
                </>
              ) : consortiumExtra < 0 ? (
                <>
                  <ArrowDown className="h-3 w-3 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(consortiumExtra)} vs vista
                  </span>
                </>
              ) : (
                <>
                  <Equal className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Igual ao valor à vista
                  </span>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {consortium.totalInstallments}x de{' '}
              {formatCurrency(consortium.monthlyPayment)}
            </p>
          </div>

          {/* Compra Direta */}
          <div
            className={`p-4 rounded-lg border-2 ${
              cheapest === 'Compra Direta'
                ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/20'
                : 'border-transparent bg-muted/30'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">
                Compra Direta (à vista)
              </p>
              {cheapest === 'Compra Direta' && (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full">
                  Mais Barato
                </span>
              )}
            </div>
            <p className="text-2xl font-bold font-mono">
              {formatCurrency(directPurchase)}
            </p>
            <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
              <Equal className="h-3 w-3" />
              <span>Valor de referência</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Pagamento único
            </p>
          </div>

          {/* Financiamento Equivalente */}
          <div
            className={`p-4 rounded-lg border-2 ${
              cheapest === 'Financiamento'
                ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/20'
                : 'border-transparent bg-muted/30'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">
                Financiamento Equivalente
              </p>
              {cheapest === 'Financiamento' && (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full">
                  Mais Barato
                </span>
              )}
            </div>
            <p className="text-2xl font-bold font-mono">
              {formatCurrency(financingTotalCost)}
            </p>
            <div className="flex items-center gap-1 mt-2 text-sm">
              {financingExtra > 0 ? (
                <>
                  <ArrowUp className="h-3 w-3 text-red-500" />
                  <span className="text-red-600 dark:text-red-400">
                    +{formatCurrency(financingExtra)} sobre vista
                  </span>
                </>
              ) : (
                <>
                  <ArrowDown className="h-3 w-3 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(financingExtra)} vs vista
                  </span>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Price a {formatPercent(marketMonthlyRate)} a.m. por{' '}
              {consortium.totalInstallments} meses
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
