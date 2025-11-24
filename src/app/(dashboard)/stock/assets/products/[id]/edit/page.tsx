/**
 * Product Edit Page
 * Página de edição de produto usando EntityForm genérico
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
import { useTemplates } from '@/hooks/stock';
import { useProduct, useUpdateProduct } from '@/hooks/stock/use-products';
import type { EntityFormConfig } from '@/types/entity-config';
import type { UpdateProductRequest } from '@/types/stock';

export default function ProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: productId } = use(params);
  const router = useRouter();
  const formRef = useRef<EntityFormRef>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  // API Data
  const { data: product, isLoading } = useProduct(productId);
  const updateProductMutation = useUpdateProduct();
  const { data: templates, isLoading: loadingTemplates } = useTemplates();

  const handleSubmit = useCallback(
    async (data: Record<string, any>) => {
      try {
        // Transformar os dados do formulário para o formato da API
        const productData: UpdateProductRequest = {
          name: data.name,
          code: data.code,
          description: data.description,
          status: data.status,
          unitOfMeasure: data.unitOfMeasure,
          templateId: data.templateId,
          supplierId: data.supplierId,
          manufacturerId: data.manufacturerId,
          attributes: data.attributes,
        };

        await updateProductMutation.mutateAsync({
          productId,
          data: productData,
        });
        toast.success('Produto atualizado com sucesso!');
        router.push(`/stock/assets/products/${productId}`);
      } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        toast.error('Erro ao atualizar produto');
      }
    },
    [updateProductMutation, productId, router]
  );

  const handleCancel = () => {
    if (hasChanges) {
      setIsCancelDialogOpen(true);
    } else {
      router.push(`/stock/assets/products/${productId}`);
    }
  };

  const handleCancelConfirm = () => {
    setIsCancelDialogOpen(false);
    router.push(`/stock/assets/products/${productId}`);
  };

  const handleSave = () => {
    formRef.current?.submit();
  };

  // Configuração do formulário com campos obrigatórios da API
  const config: EntityFormConfig = useMemo(
    () => ({
      title: 'Produto',
      entity: 'product',
      defaultValues: product?.product,
      onSubmit: handleSubmit,
      tabs: [
        {
          id: 'basic',
          label: 'Informações Básicas',
          sections: [
            {
              id: 'general',
              title: 'Informações Gerais',
              description: 'Dados básicos do produto',
              fields: [
                {
                  name: 'name',
                  label: 'Nome do Produto',
                  type: 'text',
                  placeholder: 'Digite o nome do produto',
                  required: true,
                },
                {
                  name: 'code',
                  label: 'Código',
                  type: 'text',
                  placeholder: 'Ex: PROD-001',
                  required: true,
                  helperText: 'Código único de identificação do produto',
                },
                {
                  name: 'description',
                  label: 'Descrição',
                  type: 'textarea',
                  placeholder: 'Descreva o produto...',
                  rows: 4,
                },
                {
                  name: 'templateId',
                  label: 'Template',
                  type: 'select',
                  placeholder: loadingTemplates
                    ? 'Carregando...'
                    : 'Selecione um template',
                  required: true,
                  options:
                    templates?.map(t => ({
                      value: t.id,
                      label: t.name,
                    })) || [],
                  disabled: loadingTemplates,
                },
                {
                  name: 'unitOfMeasure',
                  label: 'Unidade de Medida',
                  type: 'select',
                  placeholder: 'Selecione a unidade',
                  required: true,
                  options: [
                    { value: 'UNITS', label: 'Unidades' },
                    { value: 'KILOGRAMS', label: 'Quilogramas' },
                    { value: 'METERS', label: 'Metros' },
                  ],
                },
                {
                  name: 'status',
                  label: 'Status',
                  type: 'select',
                  placeholder: 'Selecione o status',
                  options: [
                    { value: 'ACTIVE', label: 'Ativo' },
                    { value: 'INACTIVE', label: 'Inativo' },
                    { value: 'ARCHIVED', label: 'Arquivado' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    }),
    [handleSubmit, product, templates, loadingTemplates]
  );

  if (isLoading || !product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Carregando produto...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
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
              Editar Produto
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {product.product.name}
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

      {/* Entity Form */}
      <EntityForm ref={formRef} config={config} />

      {/* Cancel Dialog */}
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
