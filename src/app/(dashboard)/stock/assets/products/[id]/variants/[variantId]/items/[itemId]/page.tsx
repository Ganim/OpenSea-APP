/**
 * Item View Page
 * Página de visualização de um item específico
 */

'use client';

import { ArrowLeft, Copy, Edit, Trash2, Warehouse } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use, useState } from 'react';
import { toast } from 'sonner';

import { EntityViewer } from '@/components/shared';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { itemViewerConfig } from '@/config/entities/items.config';
import { useItem } from '@/hooks/stock/use-items';

export default function ItemViewPage({
  params,
}: {
  params: Promise<{ id: string; variantId: string; itemId: string }>;
}) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { id: productId, variantId, itemId } = use(params);

  // API Data
  const { data: item, isLoading } = useItem(itemId);

  if (!item && !isLoading) {
    router.push(
      `/stock/assets/products/${productId}/variants/${variantId}/items`
    );
    return null;
  }

  const handleEdit = () => {
    router.push(
      `/stock/assets/products/${productId}/variants/${variantId}/items/${itemId}/edit`
    );
  };

  const handleMovements = () => {
    router.push(
      `/stock/assets/products/${productId}/variants/${variantId}/items/${itemId}/movements`
    );
  };

  const handleCopyCode = async () => {
    if (item?.item.uniqueCode) {
      await navigator.clipboard.writeText(item.item.uniqueCode);
      toast.success('Código do item copiado!');
    }
  };

  const handleDelete = async () => {
    setIsDeleteDialogOpen(false);
    // Items não possuem deleção direta - apenas movimentações
    toast.info('Use movimentações para gerenciar itens');
    router.push(
      `/stock/assets/products/${productId}/variants/${variantId}/items`
    );
  };

  const handleBack = () => {
    router.push(
      `/stock/assets/products/${productId}/variants/${variantId}/items`
    );
  };

  if (isLoading || !item) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Carregando item...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {item.item.uniqueCode}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Item ID: {item.item.id}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMovements}
            className="gap-2"
          >
            <Warehouse className="w-4 h-4" />
            Movimentações
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyCode}
            className="gap-2"
          >
            <Copy className="w-4 h-4" />
            Copiar Código
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleEdit}
            className="gap-2"
          >
            <Edit className="w-4 h-4" />
            Editar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Excluir
          </Button>
        </div>
      </div>

      <EntityViewer config={itemViewerConfig(item.item)} />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o item &quot;{item.item.uniqueCode}
              &quot;? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
