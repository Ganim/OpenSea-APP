/**
 * OpenSea OS - Item Detail Page
 * Página de detalhes de um item específico
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { itemsService } from '@/services/stock';
import type { Item } from '@/types/stock';
import { useQuery } from '@tanstack/react-query';
import {
    ArrowLeft,
    Barcode,
    Edit,
    Trash,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = params.id as string;

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const { data: item, isLoading } = useQuery<Item>({
    queryKey: ['items', itemId],
    queryFn: async () => {
      const response = await itemsService.getItem(itemId);
      return response.item;
    },
  });

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleBack = () => {
    router.push('/stock/assets/items');
  };

  const handleEdit = () => {
    router.push(`/stock/assets/items/${itemId}/edit`);
  };

  const handleDelete = async () => {
    if (confirm('Tem certeza que deseja excluir este item?')) {
      try {
        await itemsService.deleteItem(itemId);
        router.push('/stock/assets/items');
      } catch (error) {
        console.error('Erro ao deletar item:', error);
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

  if (!item) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-12 text-center">
          <Barcode className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-2">Item não encontrado</h2>
          <p className="text-muted-foreground mb-6">
            O item que você está procurando não existe ou foi removido.
          </p>
          <Button onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Itens
          </Button>
        </Card>
      </div>
    );
  }

  // ============================================================================
  // COMPUTED
  // ============================================================================

  const statusColors: Record<string, string> = {
    AVAILABLE: 'bg-green-500',
    RESERVED: 'bg-yellow-500',
    SOLD: 'bg-blue-500',
    DAMAGED: 'bg-red-500',
  };

  const statusLabels: Record<string, string> = {
    AVAILABLE: 'Disponível',
    RESERVED: 'Reservado',
    SOLD: 'Vendido',
    DAMAGED: 'Danificado',
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
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
              <Barcode className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{item.uniqueCode}</h1>
              {item.batchNumber && (
                <p className="text-muted-foreground">Lote: {item.batchNumber}</p>
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
                  Código Único
                </label>
                <p className="text-lg">{item.uniqueCode}</p>
              </div>
              {item.batchNumber && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Número do Lote
                  </label>
                  <p className="text-lg">{item.batchNumber}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Status
                </label>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${statusColors[item.status]}`} />
                  <span>{statusLabels[item.status]}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Quantidade Atual
                </label>
                <p className="text-lg">{item.currentQuantity}</p>
              </div>
              {item.locationId && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Localização ID
                  </label>
                  <p className="text-sm font-mono">{item.locationId}</p>
                </div>
              )}
            </div>
          </div>

          {/* Attributes */}
          {item.attributes && Object.keys(item.attributes).length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Atributos</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(item.attributes).map(([key, value]) => (
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
                Variante ID
              </label>
              <p className="text-sm font-mono">{item.variantId}</p>
            </div>
            {item.createdAt && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Criado em
                </label>
                <p className="text-sm">
                  {new Date(item.createdAt).toLocaleString('pt-BR')}
                </p>
              </div>
            )}
            {item.updatedAt && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Atualizado em
                </label>
                <p className="text-sm">
                  {new Date(item.updatedAt).toLocaleString('pt-BR')}
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
