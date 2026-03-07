/**
 * Edit Product Form
 * Formulário de edição rápida de produtos (modal)
 */

'use client';

import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useCategories } from '@/hooks/stock/use-categories';
import { useManufacturers } from '@/hooks/stock/use-stock-other';
import type { Category, Product, UpdateProductRequest } from '@/types/stock';
import { Loader2 } from 'lucide-react';
import React, { useMemo, useState } from 'react';

export interface EditProductFormProps {
  product: Product;
  onSubmit: (data: UpdateProductRequest) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function EditProductForm({
  product,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: EditProductFormProps) {
  // ============================================================================
  // STATE
  // ============================================================================

  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description || '');
  const [manufacturerId, setManufacturerId] = useState(
    product.manufacturerId || ''
  );
  const [categoryId, setCategoryId] = useState(
    product.productCategories?.[0]?.id || ''
  );
  const [outOfLine, setOutOfLine] = useState(product.outOfLine ?? false);

  // ============================================================================
  // QUERIES
  // ============================================================================

  const { data: manufacturersData } = useManufacturers();
  const manufacturers = manufacturersData?.manufacturers ?? [];

  const { data: categoriesData } = useCategories();

  const categoryOptions = useMemo(() => {
    const categories = (
      categoriesData as { categories: Category[] } | undefined
    )?.categories;
    if (!categories) return [];
    return categories
      .filter(c => c.isActive)
      .map(c => ({ value: c.id, label: c.name }));
  }, [categoriesData]);

  const manufacturerOptions = useMemo(
    () =>
      manufacturers
        .filter(m => m.isActive)
        .map(m => ({ value: m.id, label: m.name })),
    [manufacturers]
  );

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      manufacturerId: manufacturerId || undefined,
      categoryIds: categoryId ? [categoryId] : [],
      outOfLine,
    });
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Nome */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Nome do Produto <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Ex: Tecido Denim Santista"
          required
          disabled={isSubmitting}
          autoFocus
        />
      </div>

      {/* Fabricante */}
      <div className="space-y-2">
        <Label>Fabricante</Label>
        <Combobox
          options={[
            { value: '', label: 'Nenhum fabricante' },
            ...manufacturerOptions,
          ]}
          value={manufacturerId}
          onValueChange={setManufacturerId}
          placeholder="Selecione um fabricante..."
          searchPlaceholder="Buscar fabricante..."
          emptyText="Nenhum fabricante encontrado."
          disabled={isSubmitting}
        />
      </div>

      {/* Categoria */}
      <div className="space-y-2">
        <Label>Categoria</Label>
        <Combobox
          options={[
            { value: '', label: 'Nenhuma categoria' },
            ...categoryOptions,
          ]}
          value={categoryId}
          onValueChange={setCategoryId}
          placeholder="Selecione uma categoria..."
          searchPlaceholder="Buscar categoria..."
          emptyText="Nenhuma categoria encontrada."
          disabled={isSubmitting}
        />
      </div>

      {/* Descrição */}
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Descrição do produto"
          disabled={isSubmitting}
          rows={3}
        />
      </div>

      {/* Fora de Linha */}
      <div className="flex items-center justify-between p-3 rounded-lg border">
        <div className="space-y-0.5">
          <Label htmlFor="outOfLine" className="text-sm font-medium">
            Fora de Linha
          </Label>
          <p className="text-xs text-muted-foreground">
            Produto não disponível para novos pedidos
          </p>
        </div>
        <Switch
          id="outOfLine"
          checked={outOfLine}
          onCheckedChange={setOutOfLine}
          disabled={isSubmitting}
        />
      </div>

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
        <Button type="submit" disabled={isSubmitting || !name.trim()}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar Alterações
        </Button>
      </div>
    </form>
  );
}
