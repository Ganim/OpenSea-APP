/**
 * Deviation Alert Component
 * Compares actual charged interest with calculated interest from amortization table.
 * Alerts when deviations exceed threshold (EMPR-04/06).
 */

'use client';

import { Card } from '@/components/ui/card';
import type { AmortizationRow } from '@/lib/finance/amortization';
import type { LoanInstallment } from '@/types/finance';
import { AlertTriangle, TrendingDown } from 'lucide-react';

interface DeviationAlertProps {
  rows: AmortizationRow[];
  installments: LoanInstallment[];
  /** Deviation threshold as fraction (default: 0.01 = 1%) */
  threshold?: number;
}

interface Deviation {
  installmentNumber: number;
  chargedInterest: number;
  calculatedInterest: number;
  deviationPercent: number;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function DeviationAlert({
  rows,
  installments,
  threshold = 0.01,
}: DeviationAlertProps) {
  const deviations: Deviation[] = [];

  // Build lookup of calculated interest by installment number
  const calculatedMap = new Map<number, number>();
  for (const row of rows) {
    calculatedMap.set(row.installment, row.interest);
  }

  // Compare paid installments' charged interest vs calculated
  for (const inst of installments) {
    if (inst.status !== 'PAID') continue;

    const calculated = calculatedMap.get(inst.installmentNumber);
    if (calculated === undefined || calculated === 0) continue;

    const charged = inst.interestAmount;
    const deviation = Math.abs(charged - calculated) / calculated;

    if (deviation > threshold) {
      deviations.push({
        installmentNumber: inst.installmentNumber,
        chargedInterest: charged,
        calculatedInterest: calculated,
        deviationPercent: deviation * 100,
      });
    }
  }

  if (deviations.length === 0) return null;

  return (
    <Card className="border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/20">
      <div className="p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200">
            Desvio Detectado
          </h3>
        </div>
        <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">
          Foram identificadas diferenças entre os juros cobrados e os juros
          calculados pela tabela de amortização contratual:
        </p>
        <div className="space-y-3">
          {deviations.map(d => (
            <div
              key={d.installmentNumber}
              className="flex items-start gap-3 p-3 rounded-lg bg-amber-100/50 dark:bg-amber-900/20"
            >
              <TrendingDown className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  Parcela {d.installmentNumber}
                </p>
                <p className="text-amber-700 dark:text-amber-300">
                  Cobrado: {formatCurrency(d.chargedInterest)} | Calculado:{' '}
                  {formatCurrency(d.calculatedInterest)} | Desvio:{' '}
                  {d.deviationPercent.toFixed(1)}%
                </p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-amber-600 dark:text-amber-400 mt-4">
          Recomendamos verificar junto ao banco se houve alteração nas condições
          contratuais.
        </p>
      </div>
    </Card>
  );
}

/**
 * Renegotiation Suggestion Component
 * Shows when market rate is significantly lower than loan rate (EMPR-07).
 */
export function RenegotiationSuggestion({
  loanRate,
  marketRate = 1.0, // Default to ~12% annual Selic equivalent monthly
}: {
  loanRate: number; // Monthly rate in %
  marketRate?: number; // Monthly rate in %
}) {
  // Only show if loan rate is at least 30% higher than market rate
  if (loanRate <= marketRate * 1.3) return null;

  return (
    <Card className="border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/20">
      <div className="p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-2">
          <TrendingDown className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-base font-semibold text-blue-800 dark:text-blue-200">
            Sugestão de Renegociação
          </h3>
        </div>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          A taxa atual do mercado ({marketRate.toFixed(2)}% a.m.) é menor que
          sua taxa contratada ({loanRate.toFixed(2)}% a.m.). Considere
          renegociar as condições do empréstimo com a instituição financeira
          para reduzir o custo total.
        </p>
      </div>
    </Card>
  );
}
