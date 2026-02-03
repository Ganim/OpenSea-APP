/**
 * OpenSea OS - Product Detail Page
 * Página de detalhes do produto com listagem de variantes
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { productsService, variantsService } from '@/services/stock';
import type { Product, Variant } from '@/types/stock';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Package } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { ProductViewer } from '../src/components';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const { data: product, isLoading: isLoadingProduct } = useQuery<Product>({
    queryKey: ['products', productId],
    queryFn: async () => {
      const response = await productsService.getProduct(productId);
      return response.product;
    },
    refetchOnMount: 'always', // Sempre buscar dados frescos ao montar
  });

  const { data: variants, isLoading: isLoadingVariants } = useQuery<Variant[]>({
    queryKey: ['variants', 'product', productId],
    queryFn: async () => {
      const response = await variantsService.listVariants(productId);
      return response.variants;
    },
    refetchOnMount: 'always', // Sempre buscar dados frescos ao montar
  });

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleBack = () => {
    router.push('/stock/products');
  };

  const handleDelete = () => {
    router.push('/stock/products');
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoadingProduct) {
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
          <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-2">
            Produto não encontrado
          </h2>
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
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen from-purple-50 via-gray-50 to-pink-50 dark:from-gray-900 dark:via-slate-900 dark:to-slate-800 px-6">
      {/* Content - ProductViewer */}
      <div className="max-w-8xl mx-auto space-y-6">
        <ProductViewer
          product={product}
          variants={variants || []}
          isLoadingVariants={isLoadingVariants}
          showHeader={true}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
