/**
 * Loans List Page
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLoans } from '@/hooks/finance';
import { LOAN_STATUS_LABELS, LOAN_TYPE_LABELS } from '@/types/finance';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function LoansPage() {
  const { data, isLoading } = useLoans();

  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'PAID':
        return 'outline';
      case 'OVERDUE':
        return 'destructive';
      case 'CANCELLED':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="h-96 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  const loans = data?.loans || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Empréstimos</h1>
        <Link href="/finance/loans/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Empréstimo
          </Button>
        </Link>
      </div>

      {/* Loans List */}
      <Card className="p-6">
        {loans.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Nenhum empréstimo cadastrado
            </p>
            <Link href="/finance/loans/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Criar primeiro empréstimo
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Nome</th>
                  <th className="text-left p-3">Tipo</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-right p-3">Valor Principal</th>
                  <th className="text-right p-3">Saldo Devedor</th>
                  <th className="text-center p-3">Taxa (%)</th>
                  <th className="text-center p-3">Parcelas</th>
                  <th className="text-left p-3">Início</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => (
                  <tr
                    key={loan.id}
                    className="border-b hover:bg-muted/50 cursor-pointer"
                    onClick={() =>
                      (window.location.href = `/finance/loans/${loan.id}`)
                    }
                  >
                    <td className="p-3 font-medium">{loan.name}</td>
                    <td className="p-3">{LOAN_TYPE_LABELS[loan.type]}</td>
                    <td className="p-3">
                      <Badge variant={getStatusVariant(loan.status)}>
                        {LOAN_STATUS_LABELS[loan.status]}
                      </Badge>
                    </td>
                    <td className="text-right p-3">
                      {formatCurrency(loan.principalAmount)}
                    </td>
                    <td className="text-right p-3 text-orange-600 font-semibold">
                      {formatCurrency(loan.outstandingBalance)}
                    </td>
                    <td className="text-center p-3">{loan.interestRate}%</td>
                    <td className="text-center p-3">
                      {loan.paidInstallments} / {loan.totalInstallments}
                    </td>
                    <td className="p-3">{formatDate(loan.startDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
