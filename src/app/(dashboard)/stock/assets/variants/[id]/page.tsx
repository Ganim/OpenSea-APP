/**
 * OpenSea OS - Variant Detail Page
 * Página de detalhes de uma variante específica
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { variantsService } from '@/services/stock';
import type { Variant } from '@/types/stock';
import { useQuery } from '@tanstack/react-query';
import {
    ArrowLeft,
    Edit,
    Package,
    Trash,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

export default function VariantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const variantId = params.id as string;

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const { data: variant, isLoading } = useQuery<Variant>({
    queryKey: ['variants', variantId],
    queryFn: async () => {
      const response = await variantsService.getVariant(variantId);
      return response.variant;
    },
  });

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleBack = () => {
    router.push('/stock/assets/variants');
  };

  const handleEdit = () => {
    router.push(`/stock/assets/variants/${variantId}/edit`);
  };

  const handleDelete = async () => {
    if (confirm('Tem certeza que deseja excluir esta variante?')) {
      try {
        await variantsService.deleteVariant(variantId);
        router.push('/stock/assets/variants');
      } catch (error) {
        console.error('Erro ao deletar variante:', error);
      }
    }
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!variant) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-12 text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-2">Variante não encontrada</h2>
          <p className="text-muted-foreground mb-6">
            A variante que você está procurando não existe ou foi removida.
          </p>
          <Button onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Variantes
          </Button>
        </Card>
      </div>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{variant.name}</h1>
              {variant.sku && (
                <p className="text-muted-foreground">SKU: {variant.sku}</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash className="mr-2 h-4 w-4" />
            Excluir
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <Card className="lg:col-span-2 p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Informações Gerais</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Nome
                </label>
                <p className="text-lg">{variant.name}</p>
              </div>
              {variant.sku && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    SKU
                  </label>
                  <p className="text-lg font-mono">{variant.sku}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Preço
                </label>
                <p className="text-lg">R$ {variant.price?.toFixed(2) ?? '0.00'}</p>
              </div>
              {variant.costPrice && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Preço de Custo
                  </label>
                  <p className="text-lg">R$ {variant.costPrice.toFixed(2)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Attributes */}
          {variant.attributes && Object.keys(variant.attributes).length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Atributos</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(variant.attributes).map(([key, value]) => (
                  <div key={key} className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium">{key}</p>
                    <p className="text-xs text-muted-foreground">
                      {JSON.stringify(value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Sidebar */}
        <Card className="p-6 space-y-4 h-fit">
          <h2 className="text-xl font-semibold">Metadados</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Produto ID
              </label>
              <p className="text-sm font-mono">{variant.productId}</p>
            </div>
            {variant.createdAt && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Criado em
                </label>
                <p className="text-sm">
                  {new Date(variant.createdAt).toLocaleString('pt-BR')}
                </p>
              </div>
            )}
            {variant.updatedAt && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Atualizado em
                </label>
                <p className="text-sm">
                  {new Date(variant.updatedAt).toLocaleString('pt-BR')}
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
