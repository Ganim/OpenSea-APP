/**
 * OpenSea OS - Edit Variant Page
 * Página de edição de variante
 */

'use client';

import { logger } from '@/lib/logger';
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
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { variantsService } from '@/services/stock';
import type { Variant } from '@/types/stock';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function EditVariantPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const variantId = params.id as string;

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const { data: variant, isLoading: isLoadingVariant } = useQuery<Variant>({
    queryKey: ['variants', variantId],
    queryFn: async () => {
      const response = await variantsService.getVariant(variantId);
      return response.variant;
    },
  });

  // ============================================================================
  // STATE
  // ============================================================================

  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('0');
  const [description, setDescription] = useState('');

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    if (variant) {
      setName(variant.name || '');
      setSku(variant.sku || '');
      setPrice(variant.price?.toString() || '0');
      setDescription(
        (variant as unknown as { description?: string }).description || ''
      );
    }
  }, [variant]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    try {
      setIsLoading(true);
      await variantsService.updateVariant(variantId, {
        name: name.trim(),
        sku: sku.trim() || undefined,
        price: parseFloat(price) || 0,
        description: description.trim() || undefined,
      } as Parameters<typeof variantsService.updateVariant>[1]);

      toast.success('Variante atualizada com sucesso!');
      await queryClient.invalidateQueries({
        queryKey: ['variants', variantId],
      });
      router.push(`/stock/variants/${variantId}`);
    } catch (error) {
      logger.error('Failed to update variant', error instanceof Error ? error : new Error(String(error)), {
        variantId
      });
      const message =
        error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error('Erro ao atualizar variante', { description: message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      await variantsService.deleteVariant(variantId);
      toast.success('Variante excluída com sucesso!');
      router.push('/stock/variants');
    } catch (error) {
      logger.error('Failed to delete variant', error instanceof Error ? error : new Error(String(error)), {
        variantId
      });
      const message =
        error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error('Erro ao deletar variante', { description: message });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoadingVariant) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8">
          <div className="flex items-center justify-center">
            <p className="text-muted-foreground">Carregando variante...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!variant) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8">
          <div className="flex items-center justify-center">
            <p className="text-red-500">Variante não encontrada</p>
          </div>
        </Card>
      </div>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Editar Variante</h1>
        <p className="text-muted-foreground">
          Atualize as informações da variante
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Nome <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Nome da variante"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={sku}
                onChange={e => setSku(e.target.value)}
                placeholder="SKU da variante"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="price">Preço</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Descrição da variante"
                rows={4}
              />
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading || isDeleting}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Cancelar
              </Button>

              <Button
                type="submit"
                disabled={isLoading || isDeleting || !name.trim()}
              >
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>

            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteClick}
              disabled={isLoading || isDeleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir Variante
            </Button>
          </div>
        </form>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a variante &quot;
              {variant.name}&quot;? Esta ação não pode ser desfeita e todos os
              itens associados serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
