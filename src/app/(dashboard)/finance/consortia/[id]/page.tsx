/**
 * Consortium Detail Page
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useConsortium } from '@/hooks/finance';
import {
  FINANCE_ENTRY_STATUS_LABELS,
  CONSORTIUM_STATUS_LABELS,
} from '@/types/finance';
import { ArrowLeft, Building2, Edit, FileText, Trash } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';

export default function ConsortiumDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading } = useConsortium(id);
  const consortium = data?.consortium;

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

  if (!consortium) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-destructive">Consórcio não encontrado.</p>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm('Tem certeza que deseja excluir este consórcio?')) {
      alert('Funcionalidade de exclusão será implementada');
    }
  };

  const handleMarkAsContemplated = () => {
    if (
      confirm('Tem certeza que deseja marcar este consórcio como contemplado?')
    ) {
      alert('Funcionalidade de contemplação será implementada');
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
      case 'CONTEMPLATED':
        return 'outline';
      case 'CANCELLED':
        return 'destructive';
      case 'COMPLETED':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getPaymentStatusVariant = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'success';
      case 'PENDING':
        return 'secondary';
      case 'OVERDUE':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/finance/consortia">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Voltar para consórcios
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

          <Link href={`/finance/consortia/${id}/edit`}>
            <Button variant="outline" size="sm" className="gap-2">
              <Edit className="h-4 w-4 text-sky-500" />
              Editar
            </Button>
          </Link>
        </div>
      </div>

      {/* Consortium Info Card */}
      <Card className="p-4 sm:p-6">
        <div className="flex gap-4 sm:flex-row items-center sm:gap-6">
          <div className="flex items-center justify-center h-10 w-10 md:h-16 md:w-16 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shrink-0">
            <Building2 className="md:h-8 md:w-8 text-white" />
          </div>
          <div className="flex justify-between flex-1 gap-4 flex-row items-center">
            <div>
              <h1 className="text-lg sm:text-3xl font-bold tracking-tight">
                {consortium.name}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Administradora: {consortium.administrator}
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant={getStatusVariant(consortium.status)}>
                {CONSORTIUM_STATUS_LABELS[consortium.status]}
              </Badge>
              {consortium.isContemplated && (
                <Badge variant="success">Contemplado</Badge>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Financial Summary */}
      <Card className="p-4 sm:p-6">
        <h2 className="text-lg font-semibold mb-4">Resumo Financeiro</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Valor da Carta</p>
            <p className="text-2xl font-bold">
              {formatCurrency(consortium.creditValue)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Parcela Mensal</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(consortium.monthlyPayment)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Pago</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(
                consortium.paidInstallments * consortium.monthlyPayment
              )}
            </p>
          </div>
        </div>
      </Card>

      {/* Consortium Details */}
      <Card className="p-4 sm:p-6">
        <h2 className="text-lg font-semibold mb-4">Detalhes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Administradora</p>
            <p className="font-medium">{consortium.administrator}</p>
          </div>
          {consortium.groupNumber && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Código do Grupo
              </p>
              <p className="font-medium">{consortium.groupNumber}</p>
            </div>
          )}
          {consortium.quotaNumber && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Número da Cota
              </p>
              <p className="font-medium">{consortium.quotaNumber}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground mb-1">Data de Início</p>
            <p className="font-medium">{formatDate(consortium.startDate)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Parcelas</p>
            <p className="font-medium">
              {consortium.paidInstallments} / {consortium.totalInstallments}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              Dia de Vencimento
            </p>
            <p className="font-medium">Dia {consortium.paymentDay}</p>
          </div>
          {consortium.bankAccountName && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Conta Bancária
              </p>
              <p className="font-medium">{consortium.bankAccountName}</p>
            </div>
          )}
          {consortium.costCenterName && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Centro de Custo
              </p>
              <p className="font-medium">{consortium.costCenterName}</p>
            </div>
          )}
        </div>

        {consortium.notes && (
          <div className="mt-6">
            <p className="text-sm text-muted-foreground mb-1">Observações</p>
            <p className="font-medium">{consortium.notes}</p>
          </div>
        )}
      </Card>

      {/* Contemplation Details */}
      {consortium.isContemplated && (
        <Card className="p-4 sm:p-6 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
          <h2 className="text-lg font-semibold mb-4 text-green-800 dark:text-green-400">
            Dados da Contemplação
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Data de Contemplação
              </p>
              <p className="font-medium">
                {formatDate(consortium.contemplatedAt)}
              </p>
            </div>
            {consortium.contemplationType && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Tipo de Contemplação
                </p>
                <p className="font-medium">{consortium.contemplationType}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Payments */}
      {consortium.payments && consortium.payments.length > 0 && (
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Pagamentos
              <Badge variant="secondary">{consortium.payments.length}</Badge>
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Nº</th>
                  <th className="text-left p-2">Vencimento</th>
                  <th className="text-right p-2">Valor</th>
                  <th className="text-left p-2">Data Pgto</th>
                  <th className="text-center p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {consortium.payments.map(payment => (
                  <tr key={payment.id} className="border-b hover:bg-muted/50">
                    <td className="p-2">{payment.installmentNumber}</td>
                    <td className="p-2">{formatDate(payment.dueDate)}</td>
                    <td className="text-right p-2">
                      {formatCurrency(payment.expectedAmount)}
                    </td>
                    <td className="p-2">
                      {payment.paidAt ? formatDate(payment.paidAt) : '—'}
                    </td>
                    <td className="text-center p-2">
                      <Badge variant={getPaymentStatusVariant(payment.status)}>
                        {FINANCE_ENTRY_STATUS_LABELS[payment.status]}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Mark as Contemplated Button */}
      {!consortium.isContemplated && consortium.status === 'ACTIVE' && (
        <Card className="p-4 sm:p-6">
          <Button onClick={handleMarkAsContemplated} className="w-full">
            Marcar como Contemplado
          </Button>
        </Card>
      )}
    </div>
  );
}
