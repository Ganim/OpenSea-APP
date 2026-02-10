'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCostCenters } from '@/hooks/finance';
import { ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CostCentersPage() {
  const router = useRouter();
  const { data, isLoading, error } = useCostCenters();
  const costCenters = data?.costCenters;

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '—';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Centros de Custo</h1>
            <p className="text-muted-foreground">
              Gerencie os centros de custo da empresa
            </p>
          </div>
        </div>
        <Link href="/finance/cost-centers/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Centro de Custo
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
            Erro ao carregar centros de custo
          </div>
        ) : !costCenters || costCenters.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Nenhum registro encontrado
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-semibold">Código</th>
                  <th className="text-left p-4 font-semibold">Nome</th>
                  <th className="text-left p-4 font-semibold">Empresa</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                  <th className="text-right p-4 font-semibold">Orçamento Mensal</th>
                  <th className="text-right p-4 font-semibold">Orçamento Anual</th>
                  <th className="text-left p-4 font-semibold">Criado em</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {costCenters.map((costCenter) => (
                  <tr
                    key={costCenter.id}
                    className="hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/finance/cost-centers/${costCenter.id}`)}
                  >
                    <td className="p-4 font-mono text-sm">{costCenter.code}</td>
                    <td className="p-4">{costCenter.name}</td>
                    <td className="p-4">{costCenter.companyName || '—'}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          costCenter.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {costCenter.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="p-4 text-right font-mono text-sm">
                      {formatCurrency(costCenter.monthlyBudget)}
                    </td>
                    <td className="p-4 text-right font-mono text-sm">
                      {formatCurrency(costCenter.annualBudget)}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {formatDate(costCenter.createdAt)}
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
