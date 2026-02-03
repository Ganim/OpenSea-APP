'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type {
  CreateProductRequest,
  Template,
  Manufacturer,
  Supplier,
} from '@/types/stock';

const productSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  manufacturerId: z.string().optional(),
  supplierId: z.string().optional(),
  attributes: z.record(z.string(), z.unknown()).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface StepProductProps {
  template: Template;
  initialData: CreateProductRequest | null;
  onChange: (data: CreateProductRequest | null) => void;
  manufacturers?: Manufacturer[];
  suppliers?: Supplier[];
  errors?: Record<string, string>;
}

export function StepProduct({
  template,
  initialData,
  onChange,
  manufacturers = [],
  suppliers = [],
  errors: externalErrors,
}: StepProductProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      manufacturerId: initialData?.manufacturerId || '',
      supplierId: initialData?.supplierId || '',
      attributes: initialData?.attributes || {},
    },
  });

  // Watch form changes and update parent
  const formValues = watch();
  useEffect(() => {
    const data: CreateProductRequest = {
      ...formValues,
      templateId: template.id,
    };
    onChange(data);
  }, [formValues, template.id, onChange]);

  // Get product attributes from template
  const templateAttributes = template.productAttributes
    ? Object.entries(template.productAttributes)
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Dados do Produto</h2>
        <p className="text-sm text-muted-foreground">
          Preencha as informações básicas do produto.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Nome do Produto <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Ex: Camiseta Básica"
                {...register('name')}
              />
              {(errors.name || externalErrors?.name) && (
                <p className="text-sm text-red-500">
                  {errors.name?.message || externalErrors?.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descrição detalhada do produto..."
                rows={3}
                {...register('description')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Suppliers and Manufacturers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Origem</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="manufacturerId">Fabricante</Label>
              <Select
                value={formValues.manufacturerId || ''}
                onValueChange={value => setValue('manufacturerId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum</SelectItem>
                  {manufacturers.map(manufacturer => (
                    <SelectItem key={manufacturer.id} value={manufacturer.id}>
                      {manufacturer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplierId">Fornecedor</Label>
              <Select
                value={formValues.supplierId || ''}
                onValueChange={value => setValue('supplierId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum</SelectItem>
                  {suppliers.map(supplier => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Template Attributes */}
      {templateAttributes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Atributos do Template ({template.name})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {templateAttributes.map(([key, config]) => {
                const attrConfig = config as {
                  type?: string;
                  label?: string;
                  options?: string[];
                  required?: boolean;
                };
                const label = attrConfig.label || key;
                const isRequired = attrConfig.required;

                return (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={`attr_${key}`}>
                      {label}
                      {isRequired && <span className="text-red-500">*</span>}
                    </Label>

                    {attrConfig.type === 'select' && attrConfig.options ? (
                      <Select
                        value={(formValues.attributes?.[key] as string) || ''}
                        onValueChange={value =>
                          setValue(`attributes.${key}`, value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {attrConfig.options.map((option: string) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id={`attr_${key}`}
                        placeholder={label}
                        value={(formValues.attributes?.[key] as string) || ''}
                        onChange={e =>
                          setValue(`attributes.${key}`, e.target.value)
                        }
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Template Info */}
      <div className="p-4 rounded-lg bg-muted/50">
        <p className="text-sm text-muted-foreground">
          <strong>Template:</strong> {template.name} • <strong>Unidade:</strong>{' '}
          {template.unitOfMeasure}
        </p>
      </div>
    </div>
  );
}
