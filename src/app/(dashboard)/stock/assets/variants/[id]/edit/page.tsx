/**
 * Variant Edit Page
 * Página de edição de variante usando EntityForm genérico
 */

'use client';

import { ArrowLeft, Save, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use, useCallback, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { EntityForm, type EntityFormRef } from '@/components/shared';
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
import { variantFormConfig } from '@/config/entities/variants.config';
import { useUpdateVariant, useVariant } from '@/hooks/stock/use-variants';

export default function VariantEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const formRef = useRef<EntityFormRef>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  const { id: variantId } = use(params);

  // API Data
  const { data: variant, isLoading } = useVariant(variantId);
  const updateVariantMutation = useUpdateVariant();

  if (!variant && !isLoading) {
    router.push('/stock/assets/variants');
    return null;
  }

  const handleSubmit = useCallback(
    async (data: Record<string, unknown>) => {
      try {
        await updateVariantMutation.mutateAsync({ id: variantId, data });
        toast.success('Variante atualizada com sucesso!');
        router.push(`/stock/assets/variants/${variantId}`);
      } catch {
        toast.error('Erro ao atualizar variante');
      }
    },
    [updateVariantMutation, variantId, router]
  );

  const handleCancel = () => {
    if (hasChanges) {
      setIsCancelDialogOpen(true);
    } else {
      router.push(`/stock/assets/variants/${variantId}`);
    }
  };

  const handleCancelConfirm = () => {
    setIsCancelDialogOpen(false);
    router.push(`/stock/assets/variants/${variantId}`);
  };

  const handleSave = () => {
    formRef.current?.submit();
  };

  const config = useMemo(
    () => ({
      ...variantFormConfig,
      defaultValues: variant?.variant,
      onSubmit: handleSubmit,
    }),
    [variant, handleSubmit]
  );

  if (isLoading || !variant) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Carregando variante...
          </p>
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
            onClick={handleCancel}
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Editar Variante
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {variant.variant.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            className="gap-2"
          >
            <X className="w-4 h-4" />
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4" />
            Salvar
          </Button>
        </div>
      </div>

      <EntityForm ref={formRef} config={config} />

      <AlertDialog
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Descartar alterações?</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem alterações não salvas. Tem certeza que deseja descartar
              essas alterações?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar editando</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Descartar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
