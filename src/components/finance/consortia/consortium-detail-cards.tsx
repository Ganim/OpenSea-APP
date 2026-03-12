/**
 * Consortium Detail Cards
 * Summary cards for consortium detail page.
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { Consortium } from '@/types/finance';
import {
  Banknote,
  Building2,
  Calendar,
  CreditCard,
  Star,
  TrendingUp,
} from 'lucide-react';

interface ConsortiumDetailCardsProps {
  consortium: Consortium;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function ConsortiumDetailCards({
  consortium,
}: ConsortiumDetailCardsProps) {
  const totalPaid = consortium.paidInstallments * consortium.monthlyPayment;
  const totalCost = consortium.totalInstallments * consortium.monthlyPayment;
  const remaining = totalCost - totalPaid;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Administradora</span>
        </div>
        <p className="text-sm font-semibold truncate">
          {consortium.administrator}
        </p>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Crédito</span>
        </div>
        <p className="text-lg font-bold font-mono">
          {formatCurrency(consortium.creditValue)}
        </p>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Banknote className="h-4 w-4 text-blue-500" />
          <span className="text-xs text-muted-foreground">Parcela Mensal</span>
        </div>
        <p className="text-lg font-bold font-mono text-blue-600 dark:text-blue-400">
          {formatCurrency(consortium.monthlyPayment)}
        </p>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-4 w-4 text-emerald-500" />
          <span className="text-xs text-muted-foreground">Total Pago</span>
        </div>
        <p className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
          {formatCurrency(totalPaid)}
        </p>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="h-4 w-4 text-orange-500" />
          <span className="text-xs text-muted-foreground">Restante</span>
        </div>
        <p className="text-lg font-bold font-mono text-orange-600 dark:text-orange-400">
          {formatCurrency(remaining)}
        </p>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Star className="h-4 w-4 text-amber-500" />
          <span className="text-xs text-muted-foreground">Contemplação</span>
        </div>
        {consortium.isContemplated ? (
          <Badge variant="success" className="mt-1">
            Contemplado
          </Badge>
        ) : (
          <Badge variant="outline" className="mt-1">
            Aguardando
          </Badge>
        )}
      </Card>
    </div>
  );
}
