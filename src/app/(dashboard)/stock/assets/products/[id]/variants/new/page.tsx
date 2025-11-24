/**
 * Variant Create Page (Product Context)
 * Página de criação de variante no contexto de um produto
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
import { useCreateVariant } from '@/hooks/stock/use-variants';
import type { FormFieldConfig } from '@/types/entity-config';
import type { CreateVariantRequest } from '@/types/stock';

export default function VariantCreatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: productId } = use(params);
  const router = useRouter();
  const formRef = useRef<EntityFormRef>(null);
  const [hasChanges] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const createVariantMutation = useCreateVariant();

  // Carregar dados do produto para contexto
  const { data: product, isLoading: loadingProduct } = useProduct(productId);

  // Carregar template do produto para obter variantAttributes
  const { data: templateData, isLoading: loadingTemplate } = useTemplate(
    product?.product?.templateId || ''
  );

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

        // Transformar os dados do formulário para o formato da API
        const variantData: CreateVariantRequest = {
          productId,
          sku: sku || `VAR-${Date.now()}`,
          name,
          price: Number(price) || 0,
          imageUrl,
          attributes: customAttributes,
          costPrice: costPrice ? Number(costPrice) : undefined,
          barcode,
          qrCode,
          eanCode,
          upcCode,
          minStock: minStock ? Number(minStock) : undefined,
          maxStock: maxStock ? Number(maxStock) : undefined,
          reorderPoint: reorderPoint ? Number(reorderPoint) : undefined,
          reorderQuantity: reorderQuantity
            ? Number(reorderQuantity)
            : undefined,
        };

        await createVariantMutation.mutateAsync(variantData);
        toast.success('Variante criada com sucesso!');
        router.push(`/stock/assets/products/${productId}/variants`);
      } catch (error) {
        console.error('Erro ao criar variante:', error);
        toast.error('Erro ao criar variante');
      }
    },
    [createVariantMutation, router, productId]
  );

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

  // Configuração do formulário com campos básicos + campos personalizados
  const config = useMemo(
    () => ({
      title: 'Variante',
      entity: 'variant' as const,
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
    [handleSubmit, templateData, customFields]
  );

  const handleCancel = () => {
    if (hasChanges) {
      setIsCancelDialogOpen(true);
    } else {
      router.push(`/stock/assets/products/${productId}/variants`);
    }
  };

  const handleCancelConfirm = () => {
    setIsCancelDialogOpen(false);
    router.push(`/stock/assets/products/${productId}/variants`);
  };

  const handleSave = () => {
    formRef.current?.submit();
  };

  const isLoading = loadingProduct || loadingTemplate;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Carregando dados...
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
              Nova Variante
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Produto: {product?.product.name || 'Carregando...'}
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
