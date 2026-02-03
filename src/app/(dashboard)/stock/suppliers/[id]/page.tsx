/**
 * OpenSea OS - Supplier Detail Page
 * Página de detalhes de um fornecedor específico
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Supplier } from '@/types/stock';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Truck } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

export default function SupplierDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supplierId = params.id as string;

  const { data: supplier, isLoading } = useQuery<Supplier>({
    queryKey: ['suppliers', supplierId],
    queryFn: async () => {
      const response = await fetch(`/api/v1/suppliers/${supplierId}`);
      const data = await response.json();
      return data.supplier;
    },
  });

  const handleBack = () => {
    router.push('/stock/suppliers');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-12 text-center">
          <Truck className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-2">
            Fornecedor não encontrado
          </h2>
          <p className="text-muted-foreground mb-6">
            O fornecedor que você está procurando não existe ou foi removido.
          </p>
          <Button onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Fornecedores
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen from-purple-50 via-gray-50 to-pink-50 dark:from-gray-900 dark:via-slate-900 dark:to-slate-800 px-6">
      <div className="max-w-8xl flex items-center gap-4 mb-2">
        <Button variant="ghost" size={'sm'} onClick={handleBack}>
          <ArrowLeft className="h-5 w-5" />
          Voltar para Fornecedores
        </Button>
      </div>

      <div className="max-w-8xl mx-auto space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-linear-to-br from-green-500 to-teal-600">
              <Truck className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight">
                {supplier.name}
              </h1>
              {supplier.cnpj && (
                <p className="text-muted-foreground text-sm">
                  CNPJ: {supplier.cnpj}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Status
                </h3>
                <p className="mt-1 text-sm">
                  {supplier.isActive ? 'Ativo' : 'Inativo'}
                </p>
              </div>

              {supplier.email && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    E-mail
                  </h3>
                  <p className="mt-1 text-sm">{supplier.email}</p>
                </div>
              )}

              {supplier.phone && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Telefone
                  </h3>
                  <p className="mt-1 text-sm">{supplier.phone}</p>
                </div>
              )}

              {supplier.website && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Website
                  </h3>
                  <p className="mt-1 text-sm">{supplier.website}</p>
                </div>
              )}
            </div>

            {supplier.notes && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Observações
                </h3>
                <p className="mt-1 text-sm">{supplier.notes}</p>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => router.push(`/stock/suppliers/${supplierId}`)}
              >
                Editar Fornecedor
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
