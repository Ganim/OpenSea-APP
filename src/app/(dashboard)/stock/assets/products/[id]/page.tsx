/**
 * OpenSea OS - Product Detail Page
 * Página de detalhes de um produto específico
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { productsService } from '@/services/stock';
import type { Product } from '@/types/stock';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Box,
  Edit,
  Trash,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ['products', productId],
    queryFn: async () => {
      const response = await productsService.getProduct(productId);
      return response.product;
    },
  });

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleBack = () => {
    router.push('/stock/assets/products');
  };

  const handleEdit = () => {
    router.push(`/stock/assets/products/${productId}/edit`);
  };

  const handleDelete = async () => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await productsService.deleteProduct(productId);
        router.push('/stock/assets/products');
      } catch (error) {
        console.error('Erro ao deletar produto:', error);
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

  if (!product) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-12 text-center">
          <Box className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-2">Produto não encontrado</h2>
          <p className="text-muted-foreground mb-6">
            O produto que você está procurando não existe ou foi removido.
          </p>
          <Button onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Produtos
          </Button>
        </Card>
      </div>
    );
  }

  // ============================================================================
  // COMPUTED
  // ============================================================================

  const statusColors = {
    ACTIVE: 'bg-green-500',
    INACTIVE: 'bg-gray-500',
    ARCHIVED: 'bg-red-500',
  };

  const statusLabels = {
    ACTIVE: 'Ativo',
    INACTIVE: 'Inativo',
    ARCHIVED: 'Arquivado',
  };

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
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600">
              <Box className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <p className="text-muted-foreground">{product.code}</p>
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
                <p className="text-lg">{product.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Código
                </label>
                <p className="text-lg">{product.code}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Status
                </label>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${statusColors[product.status]}`} />
                  <span>{statusLabels[product.status]}</span>
                </div>
              </div>
              {product.description && (
                <div className="col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Descrição
                  </label>
                  <p className="text-sm mt-1">{product.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Attributes */}
          {product.attributes && Object.keys(product.attributes).length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Atributos</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(product.attributes).map(([key, value]) => (
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
                Template ID
              </label>
              <p className="text-sm font-mono">{product.templateId}</p>
            </div>
            {product.supplierId && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Fornecedor ID
                </label>
                <p className="text-sm font-mono">{product.supplierId}</p>
              </div>
            )}
            {product.manufacturerId && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Fabricante ID
                </label>
                <p className="text-sm font-mono">{product.manufacturerId}</p>
              </div>
            )}
            {product.createdAt && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Criado em
                </label>
                <p className="text-sm">
                  {new Date(product.createdAt).toLocaleString('pt-BR')}
                </p>
              </div>
            )}
            {product.updatedAt && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Atualizado em
                </label>
                <p className="text-sm">
                  {new Date(product.updatedAt).toLocaleString('pt-BR')}
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
