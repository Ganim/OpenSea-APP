/**
 * Edit Product Form
 * Formulário de edição de produtos com suporte a atributos dinâmicos
 */

'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { manufacturersService, templatesService } from '@/services/stock';
import type {
  Manufacturer,
  Product,
  Template,
  UpdateProductRequest,
} from '@/types/stock';
import { useQuery } from '@tanstack/react-query';
import { Factory, Loader2 } from 'lucide-react';
import React, { useState } from 'react';

export interface EditProductFormProps {
  product: Product;
  onSubmit: (data: UpdateProductRequest) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

interface FormData {
  name: string;
  fullCode?: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  manufacturerId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attributes?: Record<string, any>;
}

export function EditProductForm({
  product,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: EditProductFormProps) {
  // ============================================================================
  // STATE - Initialize with product data
  // ============================================================================

  const [formData, setFormData] = useState<FormData>(() => ({
    name: product.name,
    fullCode: product.fullCode,
    description: product.description,
    status: product.status,
    manufacturerId: product.manufacturerId,
    attributes: product.attributes || {},
  }));

  // ============================================================================
  // QUERIES
  // ============================================================================

  const { data: template, isLoading: isLoadingTemplate } = useQuery<Template>({
    queryKey: ['templates', product.templateId],
    queryFn: async () => {
      const response = await templatesService.getTemplate(product.templateId);
      return response.template;
    },
  });

  const { data: manufacturers = [], isLoading: isLoadingManufacturers } =
    useQuery<Manufacturer[]>({
      queryKey: ['manufacturers'],
      queryFn: async () => {
        const response = await manufacturersService.listManufacturers();
        return response.manufacturers;
      },
    });

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Removed useEffect that was causing cascading renders
  // Form data is initialized in useState with product data

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFormChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (isLoadingTemplate) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informações Básicas */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Informações Básicas</h3>

        {/* Nome */}
        <div className="space-y-2">
          <Label htmlFor="name">
            Nome do Produto <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={e => handleFormChange('name', e.target.value)}
            placeholder="Ex: Tecido Denim Santista"
            required
            disabled={isSubmitting}
          />
        </div>

        {/* Código */}
        <div className="space-y-2">
          <Label htmlFor="fullCode">Código</Label>
          <Input
            id="fullCode"
            value={formData.fullCode || ''}
            placeholder="Código do produto (gerado automaticamente)"
            disabled={true}
          />
        </div>

        {/* Descrição */}
        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={formData.description || ''}
            onChange={e => handleFormChange('description', e.target.value)}
            placeholder="Descrição do produto"
            disabled={isSubmitting}
            rows={3}
          />
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={value =>
              handleFormChange('status', value as FormData['status'])
            }
            disabled={isSubmitting}
          >
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">Ativo</SelectItem>
              <SelectItem value="INACTIVE">Inativo</SelectItem>
              <SelectItem value="ARCHIVED">Arquivado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Fabricante */}
        <div className="space-y-2">
          <Label htmlFor="manufacturerId">Fabricante</Label>
          <Select
            value={formData.manufacturerId || ''}
            onValueChange={value =>
              handleFormChange('manufacturerId', value === 'none' ? '' : value)
            }
            disabled={isSubmitting || isLoadingManufacturers}
          >
            <SelectTrigger id="manufacturerId" className="w-full">
              <div className="flex items-center gap-2">
                <Factory className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Selecione um fabricante (opcional)" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">
                <span className="text-muted-foreground">Nenhum fabricante</span>
              </SelectItem>
              {manufacturers.map(manufacturer => (
                <SelectItem key={manufacturer.id} value={manufacturer.id}>
                  {manufacturer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Atributos Personalizados */}
      {template?.productAttributes &&
        Object.keys(template.productAttributes).length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Atributos Personalizados</h3>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(template.productAttributes)
                .sort((a, b) => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const labelA = ((a[1] as any)?.label || a[0]).toLowerCase();
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const labelB = ((b[1] as any)?.label || b[0]).toLowerCase();
                  return labelA.localeCompare(labelB);
                })
                .map(([key, config]) => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const cfg = config as any;
                  const label = cfg?.label || key;
                  const type = cfg?.type || 'text';
                  const value = formData.attributes?.[key];

                  if (type === 'boolean' || type === 'sim/nao') {
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <Switch
                          id={`attr-${key}`}
                          checked={
                            value === true ||
                            value === 'true' ||
                            value === 'sim' ||
                            value === '1'
                          }
                          onCheckedChange={checked => {
                            setFormData(prev => ({
                              ...prev,
                              attributes: {
                                ...prev.attributes,
                                [key]: checked,
                              },
                            }));
                          }}
                          disabled={isSubmitting}
                        />
                        <Label
                          htmlFor={`attr-${key}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {label}
                          {cfg?.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </Label>
                      </div>
                    );
                  }

                  return (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={`attr-${key}`}>
                        {label}
                        {cfg?.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </Label>

                      {type === 'select' ? (
                        <Select
                          value={value || ''}
                          onValueChange={val => {
                            setFormData(prev => ({
                              ...prev,
                              attributes: {
                                ...prev.attributes,
                                [key]: val,
                              },
                            }));
                          }}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger id={`attr-${key}`}>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                            {cfg?.options?.map((option: string) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : type === 'number' ? (
                        <Input
                          id={`attr-${key}`}
                          type="number"
                          value={value || ''}
                          onChange={e => {
                            setFormData(prev => ({
                              ...prev,
                              attributes: {
                                ...prev.attributes,
                                [key]: parseFloat(e.target.value) || 0,
                              },
                            }));
                          }}
                          placeholder={cfg?.placeholder || ''}
                          required={cfg?.required}
                          disabled={isSubmitting}
                        />
                      ) : type === 'date' ? (
                        <Input
                          id={`attr-${key}`}
                          type="date"
                          value={value || ''}
                          onChange={e => {
                            setFormData(prev => ({
                              ...prev,
                              attributes: {
                                ...prev.attributes,
                                [key]: e.target.value,
                              },
                            }));
                          }}
                          required={cfg?.required}
                          disabled={isSubmitting}
                        />
                      ) : (
                        <Input
                          id={`attr-${key}`}
                          type="text"
                          value={value || ''}
                          onChange={e => {
                            setFormData(prev => ({
                              ...prev,
                              attributes: {
                                ...prev.attributes,
                                [key]: e.target.value,
                              },
                            }));
                          }}
                          placeholder={cfg?.placeholder || ''}
                          required={cfg?.required}
                          disabled={isSubmitting}
                        />
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}

      {/* Footer */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting || !formData.name}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar Alterações
        </Button>
      </div>
    </form>
  );
}
