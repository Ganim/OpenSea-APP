'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type {
  ConsolidatedDREResponse,
  ConsolidatedDRENode,
  CompanyDRESummary,
} from '@/services/finance/finance-reports.service';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

interface DRERowProps {
  node: ConsolidatedDRENode;
  depth?: number;
}

function DRERow({ node, depth = 0 }: DRERowProps) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children.length > 0;
  const paddingLeft = 16 + depth * 24;

  return (
    <>
      <tr
        className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${
          depth === 0 ? 'font-semibold bg-muted/20' : ''
        }`}
      >
        <td
          className="py-2 px-3 text-sm"
          style={{ paddingLeft: `${paddingLeft}px` }}
        >
          <button
            type="button"
            className="flex items-center gap-1"
            onClick={() => hasChildren && setExpanded(!expanded)}
            disabled={!hasChildren}
          >
            {hasChildren ? (
              expanded ? (
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              )
            ) : (
              <span className="w-3.5" />
            )}
            <span>{node.categoryName}</span>
          </button>
        </td>
        <td className="py-2 px-3 text-sm text-right font-mono tabular-nums">
          {formatCurrency(node.amount)}
        </td>
      </tr>
      {expanded &&
        node.children.map(child => (
          <DRERow key={child.categoryId} node={child} depth={depth + 1} />
        ))}
    </>
  );
}

interface CompanyDRECardProps {
  company: CompanyDRESummary;
}

function CompanyDRECard({ company }: CompanyDRECardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="bg-white dark:bg-slate-800/60 border border-border">
      <CardHeader className="py-3 px-4">
        <button
          type="button"
          className="flex items-center justify-between w-full"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-semibold">
              {company.companyName}
            </CardTitle>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="text-right">
              <span className="text-muted-foreground mr-2">Receita:</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400">
                {formatCurrency(company.revenue)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-muted-foreground mr-2">Despesa:</span>
              <span className="font-mono text-rose-600 dark:text-rose-400">
                {formatCurrency(company.expenses)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-muted-foreground mr-2">Resultado:</span>
              <span
                className={`font-mono font-semibold ${
                  company.netResult >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {formatCurrency(company.netResult)}
              </span>
            </div>
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </button>
      </CardHeader>
      {expanded && (
        <CardContent className="px-4 pb-4 pt-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-muted-foreground py-1.5 px-3">
                  Categoria
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground py-1.5 px-3">
                  Valor
                </th>
              </tr>
            </thead>
            <tbody>
              <DRERow node={company.revenueTree} />
              <DRERow node={company.expenseTree} />
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border font-semibold">
                <td className="py-2 px-3 text-sm">Resultado Líquido</td>
                <td
                  className={`py-2 px-3 text-sm text-right font-mono tabular-nums ${
                    company.netResult >= 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {formatCurrency(company.netResult)}
                </td>
              </tr>
            </tfoot>
          </table>
        </CardContent>
      )}
    </Card>
  );
}

interface ConsolidatedDRETableProps {
  data?: ConsolidatedDREResponse;
  isLoading?: boolean;
}

export function ConsolidatedDRETable({
  data,
  isLoading,
}: ConsolidatedDRETableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Carregando DRE consolidado...</p>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            Selecione um período para visualizar o DRE consolidado.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Consolidated summary */}
      <Card className="border-violet-200 dark:border-violet-800 bg-violet-50/30 dark:bg-violet-900/10">
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Building2 className="h-5 w-5 text-violet-600" />
            Consolidado
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
              <p className="text-xs text-muted-foreground mb-1">
                Receita Total
              </p>
              <p className="text-lg font-semibold font-mono text-emerald-600 dark:text-emerald-400">
                {formatCurrency(data.consolidated.revenue)}
              </p>
            </div>
            <div className="text-center p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20">
              <p className="text-xs text-muted-foreground mb-1">
                Despesa Total
              </p>
              <p className="text-lg font-semibold font-mono text-rose-600 dark:text-rose-400">
                {formatCurrency(data.consolidated.expenses)}
              </p>
            </div>
            <div
              className={`text-center p-3 rounded-lg ${
                data.consolidated.netResult >= 0
                  ? 'bg-emerald-50 dark:bg-emerald-900/20'
                  : 'bg-rose-50 dark:bg-rose-900/20'
              }`}
            >
              <p className="text-xs text-muted-foreground mb-1">
                Resultado Líquido
              </p>
              <p
                className={`text-lg font-semibold font-mono ${
                  data.consolidated.netResult >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {formatCurrency(data.consolidated.netResult)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Per-company breakdown */}
      {data.companies.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Detalhamento por Empresa
          </h3>
          {data.companies.map(company => (
            <CompanyDRECard key={company.companyId} company={company} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              Nenhuma empresa encontrada com lançamentos no período.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
