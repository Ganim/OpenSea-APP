/**
 * Receivable Entry Detail Page
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useFinanceEntry } from '@/hooks/finance';
import {
  FINANCE_ENTRY_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  RECURRENCE_TYPE_LABELS,
} from '@/types/finance';
import { ArrowLeft, DollarSign, Edit, FileText, Trash } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';

export default function ReceivableDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading } = useFinanceEntry(id);
  const entry = data?.entry;

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

  if (!entry) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-destructive">Lançamento não encontrado.</p>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm('Tem certeza que deseja excluir este lançamento?')) {
      alert('Funcionalidade de exclusão será implementada');
    }
  };

  const handleRegisterPayment = () => {
    alert('Funcionalidade de registro de recebimento será implementada');
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

  const totalAmount =
    (entry.expectedAmount || 0) -
    (entry.discount || 0) +
    (entry.interest || 0) +
    (entry.penalty || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/finance/receivable">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Voltar para contas a receber
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

          <Link href={`/finance/receivable/${id}/edit`}>
            <Button variant="outline" size="sm" className="gap-2">
              <Edit className="h-4 w-4 text-sky-500" />
              Editar
            </Button>
          </Link>
        </div>
      </div>

      {/* Entry Info Card */}
      <Card className="p-4 sm:p-6">
        <div className="flex gap-4 sm:flex-row items-center sm:gap-6">
          <div className="flex items-center justify-center h-10 w-10 md:h-16 md:w-16 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 shrink-0">
            <DollarSign className="md:h-8 md:w-8 text-white" />
          </div>
          <div className="flex justify-between flex-1 gap-4 flex-row items-center">
            <div>
              <h1 className="text-lg sm:text-3xl font-bold tracking-tight">
                {entry.description}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Cliente: {entry.customerName || 'Não informado'}
              </p>
            </div>
            <div>
              <Badge variant={getStatusVariant(entry.status)}>
                {FINANCE_ENTRY_STATUS_LABELS[entry.status]}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Financial Details */}
      <Card className="p-4 sm:p-6">
        <h2 className="text-lg font-semibold mb-4">Valores</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Valor Esperado</p>
            <p className="text-xl font-bold">
              {formatCurrency(entry.expectedAmount)}
            </p>
          </div>
          {entry.discount && entry.discount > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Desconto</p>
              <p className="text-xl font-bold text-red-600">
                -{formatCurrency(entry.discount)}
              </p>
            </div>
          )}
          {entry.interest && entry.interest > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Juros</p>
              <p className="text-xl font-bold text-green-600">
                +{formatCurrency(entry.interest)}
              </p>
            </div>
          )}
          {entry.penalty && entry.penalty > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Multa</p>
              <p className="text-xl font-bold text-green-600">
                +{formatCurrency(entry.penalty)}
              </p>
            </div>
          )}
          <div className="md:col-span-2">
            <p className="text-sm text-muted-foreground mb-1">Valor Total</p>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(totalAmount)}
            </p>
          </div>
          {entry.totalDue - entry.remainingBalance > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Valor Recebido
              </p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(entry.totalDue - entry.remainingBalance)}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Entry Information */}
      <Card className="p-4 sm:p-6">
        <h2 className="text-lg font-semibold mb-4">Informações</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              Data de Emissão
            </p>
            <p className="font-medium">{formatDate(entry.issueDate)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              Data de Vencimento
            </p>
            <p className="font-medium">{formatDate(entry.dueDate)}</p>
          </div>
          {entry.paymentDate && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Data de Recebimento
              </p>
              <p className="font-medium">{formatDate(entry.paymentDate)}</p>
            </div>
          )}
          {entry.categoryName && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Categoria</p>
              <p className="font-medium">{entry.categoryName}</p>
            </div>
          )}
          {entry.costCenterName && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Centro de Custo
              </p>
              <p className="font-medium">{entry.costCenterName}</p>
            </div>
          )}
          {entry.bankAccountName && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Conta Bancária
              </p>
              <p className="font-medium">{entry.bankAccountName}</p>
            </div>
          )}
          {entry.recurrenceType && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Recorrência</p>
              <p className="font-medium">
                {RECURRENCE_TYPE_LABELS[entry.recurrenceType]}
              </p>
            </div>
          )}
        </div>

        {entry.notes && (
          <div className="mt-6">
            <p className="text-sm text-muted-foreground mb-1">Observações</p>
            <p className="font-medium">{entry.notes}</p>
          </div>
        )}

        {entry.tags && entry.tags.length > 0 && (
          <div className="mt-6">
            <p className="text-sm text-muted-foreground mb-2">Tags</p>
            <div className="flex flex-wrap gap-2">
              {entry.tags.map((tag, index) => (
                <Badge key={index} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Payments Section */}
      {entry.payments && entry.payments.length > 0 && (
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recebimentos
              <Badge variant="secondary">{entry.payments.length}</Badge>
            </h2>
          </div>
          <div className="space-y-3">
            {entry.payments.map(payment => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div>
                  <p className="font-medium">
                    {formatCurrency(payment.amount)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(payment.paidAt)} •{' '}
                    {payment.method
                      ? (PAYMENT_METHOD_LABELS[
                          payment.method as keyof typeof PAYMENT_METHOD_LABELS
                        ] ?? payment.method)
                      : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Register Payment Button */}
      {entry.status !== 'PAID' && (
        <Card className="p-4 sm:p-6">
          <Button onClick={handleRegisterPayment} className="w-full">
            <DollarSign className="h-4 w-4 mr-2" />
            Registrar Recebimento
          </Button>
        </Card>
      )}
    </div>
  );
}
