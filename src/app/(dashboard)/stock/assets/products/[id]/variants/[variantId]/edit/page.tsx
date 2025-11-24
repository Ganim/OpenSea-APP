/**
 * Variant Edit Page (Product Context)
 * Página de edição de variante no contexto de um produto
 * Carrega automaticamente os atributos personalizados do template do produto
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
import { useTemplate } from '@/hooks/stock';
import { useProduct } from '@/hooks/stock/use-products';
import { useUpdateVariant, useVariant } from '@/hooks/stock/use-variants';
import type { FormFieldConfig } from '@/types/entity-config';
import type { UpdateVariantRequest } from '@/types/stock';

export default function VariantEditPage({
  params,
}: {
  params: Promise<{ id: string; variantId: string }>;
}) {
  const { id: productId, variantId } = use(params);
  const router = useRouter();
  const formRef = useRef<EntityFormRef>(null);
  const [hasChanges] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  // API Data
  const { data: variant, isLoading: loadingVariant } = useVariant(variantId);
  const { data: product, isLoading: loadingProduct } = useProduct(productId);
  const { data: templateData, isLoading: loadingTemplate } = useTemplate(
    product?.product?.templateId || ''
  );
  const updateVariantMutation = useUpdateVariant();

  const handleSubmit = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (data: any) => {
      try {
        // Separar atributos personalizados dos campos básicos
        const {
          name,
          sku,
          price,
          costPrice,
          barcode,
          qrCode,
          eanCode,
          upcCode,
          imageUrl,
          minStock,
          maxStock,
          reorderPoint,
          reorderQuantity,
          ...customAttributes
        } = data;

        const variantData: UpdateVariantRequest = {
          name,
          sku,
          price: price ? Number(price) : undefined,
          costPrice: costPrice ? Number(costPrice) : undefined,
          barcode,
          qrCode,
          eanCode,
          upcCode,
          imageUrl,
          attributes: customAttributes,
          minStock: minStock ? Number(minStock) : undefined,
          maxStock: maxStock ? Number(maxStock) : undefined,
          reorderPoint: reorderPoint ? Number(reorderPoint) : undefined,
          reorderQuantity: reorderQuantity
            ? Number(reorderQuantity)
            : undefined,
        };

        await updateVariantMutation.mutateAsync({
          id: variantId,
          data: variantData,
        });
        toast.success('Variante atualizada com sucesso!');
        router.push(
          `/stock/assets/products/${productId}/variants/${variantId}`
        );
      } catch (error) {
        console.error('Erro ao atualizar variante:', error);
        toast.error('Erro ao atualizar variante');
      }
    },
    [updateVariantMutation, productId, variantId, router]
  );

  const handleCancel = () => {
    if (hasChanges) {
      setIsCancelDialogOpen(true);
    } else {
      router.push(`/stock/assets/products/${productId}/variants/${variantId}`);
    }
  };

  const handleCancelConfirm = () => {
    setIsCancelDialogOpen(false);
    router.push(`/stock/assets/products/${productId}/variants/${variantId}`);
  };

  // Gerar campos dinâmicos dos atributos personalizados do template
  const customFields: FormFieldConfig[] = useMemo(() => {
    if (!templateData?.variantAttributes) return [];

    const attributes = templateData.variantAttributes as Record<
      string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      any
    >;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Object.entries(attributes).map(([key, config]: [string, any]) => ({
      name: key,
      label: config.label || key,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type: (config.type || 'text') as any,
      placeholder: config.placeholder || '',
      required: config.required || false,
      helperText: config.helperText || config.description,
      options: config.options,
      defaultValue: config.defaultValue,
    }));
  }, [templateData]);

  const config = useMemo(
    () => ({
      title: 'Variante',
      entity: 'variant' as const,
      defaultValues: variant?.variant,
      onSubmit: handleSubmit,
      tabs: [
        {
          id: 'basic',
          label: 'Informações Básicas',
          sections: [
            {
              id: 'general',
              title: 'Informações Gerais',
              description: 'Dados básicos da variante',
              fields: [
                {
                  name: 'name',
                  label: 'Nome da Variante',
                  type: 'text' as const,
                  placeholder: 'Ex: Tamanho M, Cor Azul',
                  required: true,
                },
                {
                  name: 'sku',
                  label: 'SKU',
                  type: 'text' as const,
                  placeholder: 'Ex: VAR-001',
                  required: true,
                  helperText: 'Código único de identificação da variante',
                },
                {
                  name: 'price',
                  label: 'Preço',
                  type: 'number' as const,
                  placeholder: '0.00',
                  required: true,
                },
                {
                  name: 'costPrice',
                  label: 'Custo',
                  type: 'number' as const,
                  placeholder: '0.00',
                },
                {
                  name: 'barcode',
                  label: 'Código de Barras',
                  type: 'text' as const,
                  placeholder: 'Código de barras',
                },
              ],
            },
            ...(customFields.length > 0
              ? [
                  {
                    id: 'custom',
                    title: 'Atributos Personalizados',
                    description: `Campos específicos do template "${templateData?.name || 'do produto'}"`,
                    fields: customFields,
                  },
                ]
              : []),
            {
              id: 'stock',
              title: 'Controle de Estoque',
              description: 'Configurações de estoque',
              fields: [
                {
                  name: 'minStock',
                  label: 'Estoque Mínimo',
                  type: 'number' as const,
                  placeholder: '0',
                },
                {
                  name: 'maxStock',
                  label: 'Estoque Máximo',
                  type: 'number' as const,
                  placeholder: '0',
                },
                {
                  name: 'reorderPoint',
                  label: 'Ponto de Reposição',
                  type: 'number' as const,
                  placeholder: '0',
                },
                {
                  name: 'reorderQuantity',
                  label: 'Quantidade de Reposição',
                  type: 'number' as const,
                  placeholder: '0',
                },
              ],
            },
          ],
        },
      ],
    }),
    [variant, handleSubmit, templateData, customFields]
  );

  const handleSave = () => {
    formRef.current?.submit();
  };

  const isLoading = loadingVariant || loadingProduct || loadingTemplate;

  if (!variant && !isLoading) {
    router.push(`/stock/assets/products/${productId}/variants`);
    return null;
  }

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
              {product && (
                <span className="text-gray-400">
                  {' '}
                  • Produto: {product.product.name}
                </span>
              )}
              {templateData && (
                <span className="text-gray-400">
                  {' '}
                  • Template: {templateData.name}
                </span>
              )}
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
