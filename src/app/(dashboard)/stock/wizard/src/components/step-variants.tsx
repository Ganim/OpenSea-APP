'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Template } from '@/types/stock';
import { Plus, Trash2, Wand2, X } from 'lucide-react';
import { useState } from 'react';
import type { WizardVariant } from '../hooks/use-wizard';

interface StepVariantsProps {
  template: Template;
  productName: string;
  variants: WizardVariant[];
  onAddVariant: (variant: WizardVariant) => void;
  onUpdateVariant: (index: number, variant: Partial<WizardVariant>) => void;
  onRemoveVariant: (index: number) => void;
  onGenerateVariants: (
    attributes: Array<{ name: string; values: string[] }>,
    basePrice: number
  ) => void;
  errors?: Record<string, string>;
}

export function StepVariants({
  template,
  productName,
  variants,
  onAddVariant,
  onUpdateVariant,
  onRemoveVariant,
  onGenerateVariants,
  errors,
}: StepVariantsProps) {
  const [showGenerator, setShowGenerator] = useState(false);

  // Get variant attributes from template
  const templateVariantAttributes = template.variantAttributes
    ? Object.entries(template.variantAttributes)
    : [];

  const handleAddManual = () => {
    const newVariant: WizardVariant = {
      id: `temp_${Date.now()}`,
      name: `${productName} - Variante ${variants.length + 1}`,
      price: 0,
      attributes: {},
    };
    onAddVariant(newVariant);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold">Variantes do Produto</h2>
          <p className="text-sm text-muted-foreground">
            Adicione as variações do produto (cores, tamanhos, etc.).
          </p>
        </div>

        <div className="flex gap-2">
          <Dialog open={showGenerator} onOpenChange={setShowGenerator}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Wand2 className="h-4 w-4 mr-2" />
                Gerador
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Gerador de Variantes</DialogTitle>
              </DialogHeader>
              <VariantGenerator
                templateAttributes={templateVariantAttributes}
                onGenerate={(attrs, price) => {
                  onGenerateVariants(attrs, price);
                  setShowGenerator(false);
                }}
                onCancel={() => setShowGenerator(false)}
              />
            </DialogContent>
          </Dialog>

          <Button size="sm" onClick={handleAddManual}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        </div>
      </div>

      {errors?.variants && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
          {errors.variants}
        </div>
      )}

      {/* Variants List */}
      {variants.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              Nenhuma variante adicionada
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowGenerator(true)}>
                <Wand2 className="h-4 w-4 mr-2" />
                Usar gerador
              </Button>
              <Button onClick={handleAddManual}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar manual
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[500px]">
          <div className="space-y-4 pr-4">
            {variants.map((variant, index) => (
              <VariantCard
                key={variant.id}
                variant={variant}
                index={index}
                templateAttributes={templateVariantAttributes}
                onUpdate={data => onUpdateVariant(index, data)}
                onRemove={() => onRemoveVariant(index)}
                error={
                  errors?.[`variant_${index}_name`] ||
                  errors?.[`variant_${index}_price`]
                }
              />
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Summary */}
      {variants.length > 0 && (
        <div className="p-4 rounded-lg bg-muted/50 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            <strong>{variants.length}</strong> variante
            {variants.length > 1 ? 's' : ''} • Total:{' '}
            <strong>
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(variants.reduce((sum, v) => sum + (v.price || 0), 0))}
            </strong>
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-600"
            onClick={() => variants.forEach((_, i) => onRemoveVariant(i))}
          >
            Limpar tudo
          </Button>
        </div>
      )}
    </div>
  );
}

// ============================================
// VARIANT CARD
// ============================================

interface VariantCardProps {
  variant: WizardVariant;
  index: number;
  templateAttributes: [string, unknown][];
  onUpdate: (data: Partial<WizardVariant>) => void;
  onRemove: () => void;
  error?: string;
}

function VariantCard({
  variant,
  index,
  templateAttributes,
  onUpdate,
  onRemove,
  error,
}: VariantCardProps) {
  return (
    <Card className={cn(error && 'border-red-500')}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2">
          Variante {index + 1}
          {Object.keys(variant.attributes).length > 0 && (
            <div className="flex gap-1">
              {Object.entries(variant.attributes).map(([key, value]) => (
                <Badge key={key} variant="secondary" className="text-xs">
                  {value as string}
                </Badge>
              ))}
            </div>
          )}
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-red-500 hover:text-red-600"
          onClick={onRemove}
          aria-label="Remover variante"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label className="text-xs">Nome</Label>
            <Input
              value={variant.name}
              onChange={e => onUpdate({ name: e.target.value })}
              placeholder="Nome da variante"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">SKU</Label>
            <Input
              value={variant.sku || ''}
              onChange={e => onUpdate({ sku: e.target.value })}
              placeholder="Auto-gerado"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Preço de Venda</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={variant.price || ''}
              onChange={e =>
                onUpdate({ price: parseFloat(e.target.value) || 0 })
              }
              placeholder="0,00"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Custo</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={variant.costPrice || ''}
              onChange={e =>
                onUpdate({ costPrice: parseFloat(e.target.value) || undefined })
              }
              placeholder="0,00"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Código de Barras</Label>
            <Input
              value={variant.barcode || ''}
              onChange={e => onUpdate({ barcode: e.target.value })}
              placeholder="EAN/UPC"
            />
          </div>

          {/* Template attributes */}
          {templateAttributes.map(([key, config]) => {
            const attrConfig = config as { label?: string };
            return (
              <div key={key} className="space-y-2">
                <Label className="text-xs">{attrConfig.label || key}</Label>
                <Input
                  value={(variant.attributes[key] as string) || ''}
                  onChange={e =>
                    onUpdate({
                      attributes: {
                        ...variant.attributes,
                        [key]: e.target.value,
                      },
                    })
                  }
                  placeholder={attrConfig.label || key}
                />
              </div>
            );
          })}
        </div>

        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      </CardContent>
    </Card>
  );
}

// ============================================
// VARIANT GENERATOR
// ============================================

interface VariantGeneratorProps {
  templateAttributes: [string, unknown][];
  onGenerate: (
    attributes: Array<{ name: string; values: string[] }>,
    basePrice: number
  ) => void;
  onCancel: () => void;
}

function VariantGenerator({
  templateAttributes,
  onGenerate,
  onCancel,
}: VariantGeneratorProps) {
  const [attributes, setAttributes] = useState<
    Array<{ name: string; values: string[] }>
  >([{ name: 'Cor', values: [] }]);
  const [basePrice, setBasePrice] = useState<number>(0);
  const [newValue, setNewValue] = useState<Record<number, string>>({});

  const addAttribute = () => {
    setAttributes([...attributes, { name: '', values: [] }]);
  };

  const removeAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const updateAttributeName = (index: number, name: string) => {
    setAttributes(
      attributes.map((attr, i) => (i === index ? { ...attr, name } : attr))
    );
  };

  const addValue = (attrIndex: number) => {
    const value = newValue[attrIndex]?.trim();
    if (!value) return;

    setAttributes(
      attributes.map((attr, i) =>
        i === attrIndex ? { ...attr, values: [...attr.values, value] } : attr
      )
    );
    setNewValue({ ...newValue, [attrIndex]: '' });
  };

  const removeValue = (attrIndex: number, valueIndex: number) => {
    setAttributes(
      attributes.map((attr, i) =>
        i === attrIndex
          ? {
              ...attr,
              values: attr.values.filter((_, vi) => vi !== valueIndex),
            }
          : attr
      )
    );
  };

  const totalCombinations = attributes.reduce(
    (acc, attr) => acc * Math.max(attr.values.length, 1),
    1
  );

  const canGenerate =
    attributes.length > 0 &&
    attributes.every(attr => attr.name && attr.values.length > 0) &&
    basePrice > 0;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Defina os atributos e seus valores para gerar automaticamente todas as
        combinações de variantes.
      </p>

      {/* Base Price */}
      <div className="space-y-2">
        <Label>Preço Base</Label>
        <Input
          type="number"
          min="0"
          step="0.01"
          value={basePrice || ''}
          onChange={e => setBasePrice(parseFloat(e.target.value) || 0)}
          placeholder="0,00"
        />
      </div>

      {/* Attributes */}
      <div className="space-y-4">
        {attributes.map((attr, attrIndex) => (
          <Card key={attrIndex}>
            <CardContent className="pt-4 space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Nome do atributo (ex: Cor)"
                  value={attr.name}
                  onChange={e => updateAttributeName(attrIndex, e.target.value)}
                  className="flex-1"
                />
                {attributes.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAttribute(attrIndex)}
                    aria-label="Remover atributo"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Values */}
              <div className="flex flex-wrap gap-2">
                {attr.values.map((value, valueIndex) => (
                  <Badge key={valueIndex} variant="secondary" className="gap-1">
                    {value}
                    <button
                      onClick={() => removeValue(attrIndex, valueIndex)}
                      className="hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>

              {/* Add value */}
              <div className="flex gap-2">
                <Input
                  placeholder="Adicionar valor (ex: Azul)"
                  value={newValue[attrIndex] || ''}
                  onChange={e =>
                    setNewValue({ ...newValue, [attrIndex]: e.target.value })
                  }
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addValue(attrIndex);
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addValue(attrIndex)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        <Button variant="outline" onClick={addAttribute} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar atributo
        </Button>
      </div>

      {/* Preview */}
      <div className="p-3 rounded-lg bg-muted text-sm">
        <strong>{totalCombinations}</strong> variante
        {totalCombinations !== 1 ? 's' : ''} serão geradas
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          onClick={() => onGenerate(attributes, basePrice)}
          disabled={!canGenerate}
        >
          Gerar Variantes
        </Button>
      </div>
    </div>
  );
}
