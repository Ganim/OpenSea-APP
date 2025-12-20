/**
 * OpenSea OS - Create Product Form
 * Formulário de 2 passos para criação rápida de produtos
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { templatesService } from '@/services/stock';
import type { CreateProductRequest, Template } from '@/types/stock';
import { useQuery } from '@tanstack/react-query';
import {
    Check,
    FileText,
    Loader2,
    Search
} from 'lucide-react';
import React, { useState } from 'react';

// =============================================================================
// TYPES
// =============================================================================

export interface CreateProductFormProps {
  /** Callback ao submeter o formulário */
  onSubmit: (data: CreateProductRequest) => Promise<void>;
  /** Callback ao cancelar */
  onCancel: () => void;
  /** Template pré-selecionado (opcional) */
  initialTemplateId?: string;
  /** Está submetendo */
  isSubmitting?: boolean;
}

interface FormData {
  templateId: string;
  name: string;
  code?: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  supplierId?: string;
  manufacturerId?: string;
  attributes?: Record<string, any>;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function CreateProductForm({
  onSubmit,
  onCancel,
  initialTemplateId,
  isSubmitting = false,
}: CreateProductFormProps) {
  // ============================================================================
  // STATE
  // ============================================================================

  const [step, setStep] = useState<'select-template' | 'fill-data'>(
    initialTemplateId ? 'fill-data' : 'select-template'
  );
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState<FormData>({
    templateId: initialTemplateId || '',
    name: '',
    code: '',
    description: '',
    status: 'ACTIVE',
    supplierId: '',
    manufacturerId: '',
    attributes: {},
  });
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // ============================================================================
  // QUERIES
  // ============================================================================

  const { data: templates = [], isLoading: isLoadingTemplates } = useQuery<
    Template[]
  >({
    queryKey: ['templates'],
    queryFn: async () => {
      const response = await templatesService.listTemplates();
      return response.templates;
    },
  });

  // ============================================================================
  // COMPUTED
  // ============================================================================

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setFormData(prev => ({
      ...prev,
      templateId: template.id,
    }));
    setStep('fill-data');
  };

  const handleBackToTemplates = () => {
    setStep('select-template');
    setSearchQuery('');
  };

  const handleFormChange = (
    field: keyof FormData,
    value: string | Record<string, any>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.templateId || !formData.name) {
      return;
    }

    try {
      await onSubmit({
        templateId: formData.templateId,
        name: formData.name,
        code: formData.code || undefined,
        description: formData.description || undefined,
        supplierId: formData.supplierId || undefined,
        manufacturerId: formData.manufacturerId || undefined,
        attributes: formData.attributes,
      });

      // Mostrar sucesso
      setSubmitSuccess(true);

      // Resetar formulário mas manter template
      setTimeout(() => {
        setFormData({
          templateId: formData.templateId,
          name: '',
          code: '',
          description: '',
          status: 'ACTIVE',
          supplierId: '',
          manufacturerId: '',
          attributes: {},
        });
        setSubmitSuccess(false);
      }, 1000);
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      templateId: '',
      name: '',
      code: '',
      description: '',
      status: 'ACTIVE',
      supplierId: '',
      manufacturerId: '',
      attributes: {},
    });
    setSelectedTemplate(null);
    setStep('select-template');
    setSubmitSuccess(false);
    onCancel();
  };

  // ============================================================================
  // RENDER - STEP 1: SELECT TEMPLATE
  // ============================================================================

  if (step === 'select-template') {
    return (
      <div className="space-y-4">
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className={cn(
            "flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold",
            "bg-primary text-primary-foreground"
          )}>
            1
          </div>
          <div className="h-0.5 w-12 bg-muted" />
          <div className={cn(
            "flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold",
            "bg-muted text-muted-foreground"
          )}>
            2
          </div>
        </div>

        {/* Title and Instructions */}
        <div className="text-center mb-4">
          <h2 className="text-xl font-semibold mb-2">
            Seleção de Template do Novo Produto
          </h2>
          <p className="text-sm text-muted-foreground">
            Primeiro, selecione o template que será usado como base para o produto.
            O template define a categoria, unidade de medida e atributos do produto.
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar template..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
            autoFocus
          />
        </div>

        {/* Templates List */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {isLoadingTemplates ? (
            <>
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </>
          ) : filteredTemplates.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                {searchQuery
                  ? 'Nenhum template encontrado'
                  : 'Nenhum template disponível'}
              </p>
            </Card>
          ) : (
            filteredTemplates.map(template => (
              <Card
                key={template.id}
                className={cn(
                  'p-3 transition-all hover:shadow-md hover:border-primary',
                  'flex items-center gap-3'
                )}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 shrink-0">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">
                    {template.name}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {template.code}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs shrink-0">
                  {template.unitOfMeasure === 'METERS'
                    ? 'Metros'
                    : template.unitOfMeasure === 'KILOGRAMS'
                      ? 'Kg'
                      : 'Unidades'}
                </Badge>
                <Button
                  size="sm"
                  onClick={() => handleTemplateSelect(template)}
                  className="shrink-0"
                >
                  Selecionar
                </Button>
              </Card>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER - STEP 2: FILL DATA
  // ============================================================================

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2">
        <div className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold",
          "bg-muted text-muted-foreground"
        )}>
          1
        </div>
        <div className="h-0.5 w-12 bg-primary" />
        <div className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold",
          "bg-primary text-primary-foreground"
        )}>
          2
        </div>
      </div>

      {/* Selected Template Card + Trocar Template Button */}
      <div className="flex items-start gap-3">
        <Card className="flex-1 p-4 flex items-start gap-4 bg-muted/50">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 shrink-0">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">
                  {selectedTemplate?.name}
                </h3>
                <p className="text-sm text-muted-foreground truncate">
                  {selectedTemplate?.code}
                </p>
              </div>
              <Badge variant="outline">
                {selectedTemplate?.unitOfMeasure === 'METERS'
                  ? 'Metros'
                  : selectedTemplate?.unitOfMeasure === 'KILOGRAMS'
                    ? 'Kg'
                    : 'Unidades'}
              </Badge>
            </div>
          </div>
        </Card>
        <Button
          type="button"
          variant="outline"
          onClick={handleBackToTemplates}
          disabled={isSubmitting}
          className="shrink-0"
        >
          Trocar Template
        </Button>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Nome (obrigatório) */}
        <div className="space-y-2">
          <Label htmlFor="name">
            Nome do Produto <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={e => handleFormChange('name', e.target.value)}
            placeholder="Ex: Tecido Azul Royal"
            required
            autoFocus
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Submit Success Message */}
      {submitSuccess && (
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
          <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
          <p className="text-sm text-green-700 dark:text-green-300">
            Produto criado com sucesso! Você pode adicionar outro.
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          Fechar
        </Button>
        <Button type="submit" disabled={isSubmitting || !formData.name}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Criar Produto
        </Button>
      </div>
    </form>
  );
}

export default CreateProductForm;
