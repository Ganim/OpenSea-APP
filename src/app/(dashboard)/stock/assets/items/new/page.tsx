/**
 * Item Create Page
 * Página de criação de item usando EntityForm genérico
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
import { itemFormConfig } from '@/config/entities/items.config';
import { useRegisterItemEntry } from '@/hooks/stock/use-items';
import type { RegisterItemEntryRequest } from '@/types/stock';

export default function ItemCreatePage() {
  const router = useRouter();
  const formRef = useRef<EntityFormRef>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const registerItemEntryMutation = useRegisterItemEntry();

  const handleSubmit = useCallback(
    async (data: RegisterItemEntryRequest) => {
      try {
        await registerItemEntryMutation.mutateAsync(data);
        toast.success('Item registrado com sucesso!');
        router.push('/stock/assets/items');
      } catch {
        toast.error('Erro ao registrar item');
      }
    },
    [registerItemEntryMutation, router]
  );

  const config = useMemo(
    () => ({ ...itemFormConfig, onSubmit: handleSubmit }),
    [handleSubmit]
  );

  const handleCancel = () => {
    if (hasChanges) {
      setIsCancelDialogOpen(true);
    } else {
      router.push('/stock/assets/items');
    }
  };

  const handleCancelConfirm = () => {
    setIsCancelDialogOpen(false);
    router.push('/stock/assets/items');
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
              Novo Item
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Preencha os dados do novo item
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
            Criar Item
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
            <AlertDialogTitle>Descartar novo item?</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem alterações não salvas. Tem certeza que deseja descartar
              este novo item?
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
