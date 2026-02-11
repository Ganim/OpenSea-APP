'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useFinanceEntries } from '@/hooks/finance';
import { FINANCE_ENTRY_STATUS_LABELS } from '@/types/finance';
import { ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ReceivablePage() {
  const router = useRouter();
  const { data, isLoading, error } = useFinanceEntries({ type: 'RECEIVABLE' });
  const entries = data?.entries;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'PAID':
      case 'RECEIVED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'PARTIALLY_PAID':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'CANCELLED':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Contas a Receber</h1>
            <p className="text-muted-foreground">
              Gerencie os recebimentos de clientes
            </p>
          </div>
        </div>
        <Link href="/finance/receivable/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Conta a Receber
          </Button>
        </Link>
      </div>

      {/* Content */}
      <Card>
        {isLoading ? (
          <div className="p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-muted rounded" />
              <div className="h-10 bg-muted rounded" />
              <div className="h-10 bg-muted rounded" />
            </div>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-muted-foreground">
            Erro ao carregar contas a receber
          </div>
        ) : !entries || entries.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Nenhum registro encontrado
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-semibold">Código</th>
                  <th className="text-left p-4 font-semibold">Descrição</th>
                  <th className="text-left p-4 font-semibold">Categoria</th>
                  <th className="text-left p-4 font-semibold">
                    Centro de Custo
                  </th>
                  <th className="text-left p-4 font-semibold">Cliente</th>
                  <th className="text-right p-4 font-semibold">
                    Valor Esperado
                  </th>
                  <th className="text-left p-4 font-semibold">Vencimento</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {entries.map(entry => (
                  <tr
                    key={entry.id}
                    className="hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() =>
                      router.push(`/finance/receivable/${entry.id}`)
                    }
                  >
                    <td className="p-4 font-mono text-sm">{entry.code}</td>
                    <td className="p-4">
                      <div className="font-medium">{entry.description}</div>
                      {entry.notes && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {entry.notes}
                        </p>
                      )}
                    </td>
                    <td className="p-4 text-sm">{entry.categoryName || '—'}</td>
                    <td className="p-4 text-sm">
                      {entry.costCenterName || '—'}
                    </td>
                    <td className="p-4 text-sm">{entry.customerName || '—'}</td>
                    <td className="p-4 text-right font-mono text-sm">
                      {formatCurrency(entry.expectedAmount)}
                    </td>
                    <td className="p-4 text-sm">{formatDate(entry.dueDate)}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(entry.status)}`}
                      >
                        {FINANCE_ENTRY_STATUS_LABELS[entry.status]}
                      </span>
                    </td>
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
