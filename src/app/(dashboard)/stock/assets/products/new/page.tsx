/**
 * Product Create Page
 * Página de criação de produto com wizard de 2 etapas:
 * 1. Seleção de Template
 * 2. Formulário com atributos personalizados
 */

'use client';

import { ArrowLeft, ChevronRight, Save, X } from 'lucide-react';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useTemplates } from '@/hooks/stock';
import { useCreateProduct } from '@/hooks/stock/use-products';
import type { EntityFormConfig, FormFieldConfig } from '@/types/entity-config';
import type { CreateProductRequest, Template } from '@/types/stock';

export default function ProductCreatePage() {
  const router = useRouter();
  const formRef = useRef<EntityFormRef>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<'template' | 'form'>(
    'template'
  );
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const createProductMutation = useCreateProduct();
  const { data: templates, isLoading: loadingTemplates } = useTemplates();

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setCurrentStep('form');
    setHasChanges(true);
  };

  const handleBackToTemplates = () => {
    setCurrentStep('template');
  };

  const handleSubmit = useCallback(
    async (data: Record<string, any>) => {
      if (!selectedTemplate) return;

      try {
        // Separar atributos personalizados dos campos básicos
        const {
          name,
          code,
          description,
          status,
          unitOfMeasure,
          ...customAttributes
        } = data;

        // Transformar os dados do formulário para o formato da API
        const productData: CreateProductRequest = {
          name,
          code: code || `PROD-${Date.now()}`,
          description,
          status: status || 'ACTIVE',
          unitOfMeasure: unitOfMeasure || 'UNITS',
          templateId: selectedTemplate.id,
          attributes: customAttributes,
        };

        await createProductMutation.mutateAsync(productData);
        toast.success('Produto criado com sucesso!');
        router.push('/stock/assets/products');
      } catch (error) {
        console.error('Erro ao criar produto:', error);
        toast.error('Erro ao criar produto');
      }
    },
    [createProductMutation, router, selectedTemplate]
  );

  // Gerar campos dinâmicos dos atributos personalizados do template
  const customFields: FormFieldConfig[] = useMemo(() => {
    if (!selectedTemplate?.productAttributes) return [];

    const attributes = selectedTemplate.productAttributes as Record<
      string,
      any
    >;
    return Object.entries(attributes).map(([key, config]: [string, any]) => ({
      name: key,
      label: config.label || key,
      type: (config.type || 'text') as any,
      placeholder: config.placeholder || '',
      required: config.required || false,
      helperText: config.helperText || config.description,
      options: config.options,
      defaultValue: config.defaultValue,
    }));
  }, [selectedTemplate]);

  // Configuração do formulário com campos básicos + campos personalizados
  const config: EntityFormConfig = useMemo(
    () => ({
      title: 'Produto',
      entity: 'product',
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
                  type: 'text' as const,
                  placeholder: 'Digite o nome do produto',
                  required: true,
                },
                {
                  name: 'code',
                  label: 'Código',
                  type: 'text' as const,
                  placeholder: 'Ex: PROD-001',
                  required: true,
                  helperText: 'Código único de identificação do produto',
                },
                {
                  name: 'description',
                  label: 'Descrição',
                  type: 'textarea' as const,
                  placeholder: 'Descreva o produto...',
                  rows: 4,
                },
                {
                  name: 'unitOfMeasure',
                  label: 'Unidade de Medida',
                  type: 'select' as const,
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
                  type: 'select' as const,
                  placeholder: 'Selecione o status',
                  options: [
                    { value: 'ACTIVE', label: 'Ativo' },
                    { value: 'INACTIVE', label: 'Inativo' },
                    { value: 'ARCHIVED', label: 'Arquivado' },
                  ],
                  defaultValue: 'ACTIVE',
                },
              ],
            },
            ...(customFields.length > 0
              ? [
                  {
                    id: 'custom',
                    title: 'Atributos Personalizados',
                    description: `Campos específicos do template "${selectedTemplate?.name}"`,
                    fields: customFields,
                  },
                ]
              : []),
          ],
        },
      ],
    }),
    [handleSubmit, selectedTemplate, customFields]
  );

  const handleCancel = () => {
    if (hasChanges) {
      setIsCancelDialogOpen(true);
    } else {
      router.push('/stock/assets/products');
    }
  };

  const handleCancelConfirm = () => {
    setIsCancelDialogOpen(false);
    router.push('/stock/assets/products');
  };

  const handleSave = () => {
    formRef.current?.submit();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={
              currentStep === 'form' ? handleBackToTemplates : handleCancel
            }
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {currentStep === 'template'
                ? 'Selecionar Template'
                : 'Novo Produto'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {currentStep === 'template'
                ? 'Escolha o template para o novo produto'
                : selectedTemplate
                  ? `Template: ${selectedTemplate.name}`
                  : 'Preencha os dados do novo produto'}
            </p>
          </div>
        </div>

        {currentStep === 'form' && (
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
              Criar Produto
            </Button>
          </div>
        )}
      </div>

      {/* Step 1: Template Selection */}
      {currentStep === 'template' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loadingTemplates ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Carregando templates...
                </p>
              </div>
            </div>
          ) : templates && templates.length > 0 ? (
            templates.map(template => (
              <Card
                key={template.id}
                className="cursor-pointer hover:border-blue-500 hover:shadow-md transition-all"
                onClick={() => handleTemplateSelect(template)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {template.name}
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </CardTitle>
                  {template.productAttributes && (
                    <CardDescription>
                      {
                        Object.keys(
                          template.productAttributes as Record<string, any>
                        ).length
                      }{' '}
                      atributo(s) personalizado(s)
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Clique para criar um produto com este template
                  </p>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                Nenhum template disponível. Crie um template primeiro.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Product Form */}
      {currentStep === 'form' && selectedTemplate && (
        <EntityForm ref={formRef} config={config} />
      )}

      {/* Cancel Dialog */}
      <AlertDialog
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Descartar novo produto?</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem alterações não salvas. Tem certeza que deseja descartar
              este novo produto?
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
