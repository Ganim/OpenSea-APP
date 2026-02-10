/**
 * Loan Detail Page
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLoan } from '@/hooks/finance';
import {
  FINANCE_ENTRY_STATUS_LABELS,
  LOAN_STATUS_LABELS,
  LOAN_TYPE_LABELS,
} from '@/types/finance';
import { ArrowLeft, Building2, Edit, FileText, Trash } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';

export default function LoanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading } = useLoan(id);
  const loan = data?.loan;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="space-y-4 w-full max-w-2xl">
          <div className="h-8 bg-muted animate-pulse rounded" />
          <div className="h-64 bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-destructive">Empréstimo não encontrado.</p>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm('Tem certeza que deseja excluir este empréstimo?')) {
      alert('Funcionalidade de exclusão será implementada');
    }
  };

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

  const getInstallmentStatusVariant = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'success';
      case 'PENDING':
        return 'secondary';
      case 'OVERDUE':
        return 'destructive';
      case 'PARTIALLY_PAID':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/finance/loans">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Voltar para empréstimos
            </Button>
          </Link>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="gap-2"
          >
            <Trash className="h-4 w-4 text-red-800" />
            Excluir
          </Button>

          <Link href={`/finance/loans/${id}/edit`}>
            <Button variant="outline" size="sm" className="gap-2">
              <Edit className="h-4 w-4 text-sky-500" />
              Editar
            </Button>
          </Link>
        </div>
      </div>

      {/* Loan Info Card */}
      <Card className="p-4 sm:p-6">
        <div className="flex gap-4 sm:flex-row items-center sm:gap-6">
          <div className="flex items-center justify-center h-10 w-10 md:h-16 md:w-16 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shrink-0">
            <Building2 className="md:h-8 md:w-8 text-white" />
          </div>
          <div className="flex justify-between flex-1 gap-4 flex-row items-center">
            <div>
              <h1 className="text-lg sm:text-3xl font-bold tracking-tight">
                {loan.name}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {LOAN_TYPE_LABELS[loan.type]}
                {loan.contractNumber && ` • Contrato: ${loan.contractNumber}`}
              </p>
            </div>
            <div>
              <Badge variant={getStatusVariant(loan.status)}>
                {LOAN_STATUS_LABELS[loan.status]}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Loan Summary */}
      <Card className="p-4 sm:p-6">
        <h2 className="text-lg font-semibold mb-4">Resumo Financeiro</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Valor Principal</p>
            <p className="text-2xl font-bold">
              {formatCurrency(loan.principalAmount)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              Saldo Devedor
            </p>
            <p className="text-2xl font-bold text-orange-600">
              {formatCurrency(loan.outstandingBalance)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Pago</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(loan.principalAmount - loan.outstandingBalance)}
            </p>
          </div>
        </div>
      </Card>

      {/* Loan Details */}
      <Card className="p-4 sm:p-6">
        <h2 className="text-lg font-semibold mb-4">Detalhes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Tipo</p>
            <p className="font-medium">{LOAN_TYPE_LABELS[loan.type]}</p>
          </div>
          {loan.contractNumber && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Número do Contrato
              </p>
              <p className="font-medium">{loan.contractNumber}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground mb-1">Taxa de Juros</p>
            <p className="font-medium">{loan.interestRate}% a.m.</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Tipo de Juros</p>
            <p className="font-medium">{loan.interestType}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Data de Início</p>
            <p className="font-medium">{formatDate(loan.startDate)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Data de Término</p>
            <p className="font-medium">{formatDate(loan.endDate)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              Dia de Vencimento
            </p>
            <p className="font-medium">Dia {loan.installmentDay}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Parcelas</p>
            <p className="font-medium">
              {loan.paidInstallments} / {loan.totalInstallments}
            </p>
          </div>
          {loan.bankAccountName && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Conta Bancária
              </p>
              <p className="font-medium">{loan.bankAccountName}</p>
            </div>
          )}
          {loan.costCenterName && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Centro de Custo
              </p>
              <p className="font-medium">{loan.costCenterName}</p>
            </div>
          )}
        </div>

        {loan.notes && (
          <div className="mt-6">
            <p className="text-sm text-muted-foreground mb-1">Observações</p>
            <p className="font-medium">{loan.notes}</p>
          </div>
        )}
      </Card>

      {/* Installments */}
      {loan.installments && loan.installments.length > 0 && (
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Parcelas
              <Badge variant="secondary">{loan.installments.length}</Badge>
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Nº</th>
                  <th className="text-left p-2">Vencimento</th>
                  <th className="text-right p-2">Principal</th>
                  <th className="text-right p-2">Juros</th>
                  <th className="text-right p-2">Total</th>
                  <th className="text-right p-2">Pago</th>
                  <th className="text-center p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {loan.installments.map((installment) => (
                  <tr key={installment.id} className="border-b hover:bg-muted/50">
                    <td className="p-2">{installment.installmentNumber}</td>
                    <td className="p-2">{formatDate(installment.dueDate)}</td>
                    <td className="text-right p-2">
                      {formatCurrency(installment.principalAmount)}
                    </td>
                    <td className="text-right p-2">
                      {formatCurrency(installment.interestAmount)}
                    </td>
                    <td className="text-right p-2">
                      {formatCurrency(installment.totalAmount)}
                    </td>
                    <td className="text-right p-2">
                      {formatCurrency(installment.paidAmount)}
                    </td>
                    <td className="text-center p-2">
                      <Badge
                        variant={getInstallmentStatusVariant(
                          installment.status
                        )}
                      >
                        {FINANCE_ENTRY_STATUS_LABELS[installment.status]}
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
