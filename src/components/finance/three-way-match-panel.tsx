'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { financeAnalyticsService } from '@/services/finance';
import type { ThreeWayMatchResponse } from '@/types/finance';
import { useMutation } from '@tanstack/react-query';
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Package,
  ShoppingCart,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

const STATUS_CONFIG = {
  FULL_MATCH: {
    label: 'Correspondencia Completa',
    icon: CheckCircle2,
    color: 'text-emerald-600 dark:text-emerald-400',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  },
  PARTIAL_MATCH: {
    label: 'Correspondencia Parcial',
    icon: AlertTriangle,
    color: 'text-amber-600 dark:text-amber-400',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  },
  NO_MATCH: {
    label: 'Sem Correspondencia',
    icon: XCircle,
    color: 'text-rose-600 dark:text-rose-400',
    badge: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  },
} as const;

interface ThreeWayMatchPanelProps {
  entryId: string;
}

export function ThreeWayMatchPanel({ entryId }: ThreeWayMatchPanelProps) {
  const [result, setResult] = useState<ThreeWayMatchResponse | null>(null);

  const matchMutation = useMutation({
    mutationFn: () => financeAnalyticsService.threeWayMatch(entryId),
    onSuccess: (data) => setResult(data),
  });

  if (!result) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Verificacao Tripla (Three-Way Matching)
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => matchMutation.mutate()}
              disabled={matchMutation.isPending}
            >
              {matchMutation.isPending ? (
                <>
                  <Skeleton className="h-4 w-4 rounded-full mr-2" />
                  Verificando...
                </>
              ) : (
                'Verificar Correspondencia'
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Clique para verificar a correspondencia entre nota fiscal, pedido de compra e recebimento de mercadoria.
          </p>
        </CardContent>
      </Card>
    );
  }

  const statusConfig = STATUS_CONFIG[result.matchStatus];
  const StatusIcon = statusConfig.icon;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Verificacao Tripla (Three-Way Matching)
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={`${statusConfig.badge} border-0`}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusConfig.label}
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => matchMutation.mutate()}
              disabled={matchMutation.isPending}
            >
              Reverificar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Three documents */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Invoice */}
          <div
            className={`p-3 rounded-lg border ${
              result.invoice
                ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-500/8'
                : 'border-dashed border-muted-foreground/30 bg-muted/30'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Nota Fiscal</span>
            </div>
            {result.invoice ? (
              <div className="text-xs text-muted-foreground space-y-0.5">
                <p>N.o {result.invoice.number}</p>
                <p className="font-mono">{formatCurrency(result.invoice.amount)}</p>
                <p>{result.invoice.date}</p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground/60">Nao encontrada</p>
            )}
          </div>

          {/* Purchase Order */}
          <div
            className={`p-3 rounded-lg border ${
              result.purchaseOrder
                ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-500/8'
                : 'border-dashed border-muted-foreground/30 bg-muted/30'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Pedido de Compra</span>
            </div>
            {result.purchaseOrder ? (
              <div className="text-xs text-muted-foreground space-y-0.5">
                <p>{result.purchaseOrder.code}</p>
                <p className="font-mono">
                  {formatCurrency(result.purchaseOrder.amount)}
                </p>
                <p>{result.purchaseOrder.date}</p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground/60">Nao encontrado</p>
            )}
          </div>

          {/* Goods Receipt */}
          <div
            className={`p-3 rounded-lg border ${
              result.goodsReceipt
                ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-500/8'
                : 'border-dashed border-muted-foreground/30 bg-muted/30'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Recebimento</span>
            </div>
            {result.goodsReceipt ? (
              <div className="text-xs text-muted-foreground space-y-0.5">
                <p>{result.goodsReceipt.code}</p>
                <p>{result.goodsReceipt.items} item(ns)</p>
                <p>{result.goodsReceipt.date}</p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground/60">Nao encontrado</p>
            )}
          </div>
        </div>

        {/* Discrepancies */}
        {result.discrepancies.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
              Divergencias encontradas:
            </p>
            {result.discrepancies.map((d, i) => (
              <div
                key={i}
                className="flex items-center gap-3 text-xs bg-amber-50 dark:bg-amber-500/8 rounded-md p-2"
              >
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span>
                  <strong className="capitalize">{d.field}</strong>: esperado{' '}
                  {d.expected}, encontrado {d.actual} (tolerancia: {d.tolerance})
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Recommendation */}
        <div className="text-sm text-muted-foreground bg-muted/50 rounded-md p-3">
          {result.recommendation}
        </div>
      </CardContent>
    </Card>
  );
}
