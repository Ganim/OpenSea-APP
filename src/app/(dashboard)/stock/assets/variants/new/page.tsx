/**
 * Variant Create Page
 * Página de criação de variante usando EntityForm genérico
 */

'use client';

import { ArrowLeft, Save, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useRef, useState } from 'react';
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
import { useCreateVariant } from '@/hooks/stock/use-variants';
import type { CreateVariantRequest } from '@/types/stock';

export default function VariantCreatePage() {
  const router = useRouter();
  const formRef = useRef<EntityFormRef>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const createVariantMutation = useCreateVariant();

  const handleSubmit = useCallback(
    async (data: CreateVariantRequest) => {
      try {
        await createVariantMutation.mutateAsync(data);
        toast.success('Variante criada com sucesso!');
        router.push('/stock/assets/variants');
      } catch {
        toast.error('Erro ao criar variante');
      }
    },
    [createVariantMutation, router]
  );

  const config = useMemo(
    () => ({ ...variantFormConfig, onSubmit: handleSubmit }),
    [handleSubmit]
  );

  const handleCancel = () => {
    if (hasChanges) {
      setIsCancelDialogOpen(true);
    } else {
      router.push('/stock/assets/variants');
    }
  };

  const handleCancelConfirm = () => {
    setIsCancelDialogOpen(false);
    router.push('/stock/assets/variants');
  };

  const handleSave = () => {
    formRef.current?.submit();
  };

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
              Nova Variante
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Preencha os dados da nova variante
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
            Criar Variante
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
            <AlertDialogTitle>Descartar nova variante?</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem alterações não salvas. Tem certeza que deseja descartar
              esta nova variante?
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
