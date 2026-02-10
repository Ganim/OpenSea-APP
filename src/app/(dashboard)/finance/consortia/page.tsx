/**
 * Consortia List Page
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useConsortia } from '@/hooks/finance';
import { CONSORTIUM_STATUS_LABELS } from '@/types/finance';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function ConsortiaPage() {
  const { data, isLoading } = useConsortia();

  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="h-96 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  const consortia = data?.consortia || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Consórcios</h1>
        <Link href="/finance/consortia/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Consórcio
          </Button>
        </Link>
      </div>

      {/* Consortia List */}
      <Card className="p-6">
        {consortia.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Nenhum consórcio cadastrado
            </p>
            <Link href="/finance/consortia/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Criar primeiro consórcio
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Nome</th>
                  <th className="text-left p-3">Administradora</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-right p-3">Valor da Carta</th>
                  <th className="text-right p-3">Parcela Mensal</th>
                  <th className="text-center p-3">Parcelas</th>
                  <th className="text-center p-3">Contemplado</th>
                </tr>
              </thead>
              <tbody>
                {consortia.map((consortium) => (
                  <tr
                    key={consortium.id}
                    className="border-b hover:bg-muted/50 cursor-pointer"
                    onClick={() =>
                      (window.location.href = `/finance/consortia/${consortium.id}`)
                    }
                  >
                    <td className="p-3 font-medium">{consortium.name}</td>
                    <td className="p-3">{consortium.administrator}</td>
                    <td className="p-3">
                      <Badge variant={getStatusVariant(consortium.status)}>
                        {CONSORTIUM_STATUS_LABELS[consortium.status]}
                      </Badge>
                    </td>
                    <td className="text-right p-3">
                      {formatCurrency(consortium.creditValue)}
                    </td>
                    <td className="text-right p-3 text-blue-600 font-semibold">
                      {formatCurrency(consortium.monthlyPayment)}
                    </td>
                    <td className="text-center p-3">
                      {consortium.paidInstallments} /{' '}
                      {consortium.totalInstallments}
                    </td>
                    <td className="text-center p-3">
                      {consortium.isContemplated ? (
                        <Badge variant="success">Sim</Badge>
                      ) : (
                        <Badge variant="outline">Não</Badge>
                      )}
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
