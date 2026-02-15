/**
 * VariantFormModal - Unified modal for creating and editing variants
 * Uses sidebar navigation pattern with all variant fields across 5 sections.
 * Replaces both QuickAddVariantModal and EditVariantModal.
 */

'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  MoneyInput,
} from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useTemplate } from '@/hooks/stock/use-stock-other';
import { cn } from '@/lib/utils';
import { variantsService } from '@/services/stock';
import type {
  CreateVariantRequest,
  Product,
  TemplateAttribute,
  UpdateVariantRequest,
  Variant,
} from '@/types/stock';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ChevronRight,
  DollarSign,
  FileText,
  Info,
  Loader2,
  Package,
  Plus,
  Save,
  SlidersHorizontal,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface VariantFormModalProps {
  product: Product | null;
  variant?: Variant | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SectionId = 'basic' | 'pricing' | 'stock' | 'attributes';

interface SectionItem {
  id: SectionId;
  label: string;
  icon: React.ReactNode;
  description: string;
}

interface FormData {
  name: string;
  reference: string;
  colorHex: string;
  colorPantone: string;
  imageUrl: string;
  outOfLine: boolean;
  isActive: boolean;
  // Pricing
  informedCostPrice: number;
  profitMarginPercent: number;
  definedSalePrice: number;
  // Stock
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  reorderQuantity: number;
  // Attributes
  attributes: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SECTIONS: SectionItem[] = [
  {
    id: 'basic',
    label: 'Informações',
    icon: <FileText className="w-4 h-4" />,
    description: 'Nome, cor, referência',
  },
  {
    id: 'pricing',
    label: 'Preços',
    icon: <DollarSign className="w-4 h-4" />,
    description: 'Custo, margem, venda',
  },
  {
    id: 'stock',
    label: 'Estoque',
    icon: <Package className="w-4 h-4" />,
    description: 'Mín, máx, reposição',
  },
  {
    id: 'attributes',
    label: 'Atributos',
    icon: <SlidersHorizontal className="w-4 h-4" />,
    description: 'Atributos do template',
  },
];

const INITIAL_FORM: FormData = {
  name: '',
  reference: '',
  colorHex: '',
  colorPantone: '',
  imageUrl: '',
  outOfLine: false,
  isActive: true,
  informedCostPrice: 0,
  profitMarginPercent: 0,
  definedSalePrice: 0,
  minStock: 0,
  maxStock: 0,
  reorderPoint: 0,
  reorderQuantity: 0,
  attributes: {},
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function VariantFormModal({
  product,
  variant,
  open,
  onOpenChange,
}: VariantFormModalProps) {
  const queryClient = useQueryClient();
  const isEditMode = !!variant;

  const [activeSection, setActiveSection] = useState<SectionId>('basic');
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);

  // Fetch template for dynamic attributes
  const { data: template } = useTemplate(product?.templateId || '');

  // ---------------------------------------------------------------------------
  // Populate form in edit mode
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!open) return;

    if (variant) {
      const attrs: Record<string, unknown> = {};
      if (variant.attributes && typeof variant.attributes === 'object') {
        for (const [key, value] of Object.entries(variant.attributes)) {
          attrs[key] = value;
        }
      }
      setFormData({
        name: variant.name || '',
        reference: variant.reference || '',
        colorHex: variant.colorHex || '',
        colorPantone: variant.colorPantone || '',
        imageUrl: variant.imageUrl || '',
        outOfLine: variant.outOfLine ?? false,
        isActive: variant.isActive ?? true,
        informedCostPrice: variant.costPrice || 0,
        profitMarginPercent: variant.profitMargin || 0,
        definedSalePrice: variant.price || 0,
        minStock: variant.minStock || 0,
        maxStock: variant.maxStock || 0,
        reorderPoint: variant.reorderPoint || 0,
        reorderQuantity: variant.reorderQuantity || 0,
        attributes: attrs,
      });
    } else {
      setFormData(INITIAL_FORM);
    }
    setActiveSection('basic');
  }, [variant, open]);

  // ---------------------------------------------------------------------------
  // Pricing calculations
  // ---------------------------------------------------------------------------

  const calculatedCostPrice = variant?.costPrice || 0;

  const calculatedSalePrice = useMemo(() => {
    if (formData.informedCostPrice > 0 && formData.profitMarginPercent > 0) {
      return Number(
        (
          formData.informedCostPrice *
          (1 + formData.profitMarginPercent / 100)
        ).toFixed(2)
      );
    }
    return 0;
  }, [formData.informedCostPrice, formData.profitMarginPercent]);

  const calculatedProfitMargin = useMemo(() => {
    if (formData.informedCostPrice > 0 && formData.definedSalePrice > 0) {
      return Number(
        (
          ((formData.definedSalePrice - formData.informedCostPrice) /
            formData.informedCostPrice) *
          100
        ).toFixed(2)
      );
    }
    return 0;
  }, [formData.informedCostPrice, formData.definedSalePrice]);

  // ---------------------------------------------------------------------------
  // Template attributes
  // ---------------------------------------------------------------------------

  const variantAttributes = useMemo(() => {
    if (!template?.variantAttributes) return {};
    return template.variantAttributes;
  }, [template]);

  const hasAttributes = Object.keys(variantAttributes).length > 0;

  // ---------------------------------------------------------------------------
  // Mutations
  // ---------------------------------------------------------------------------

  const invalidateQueries = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ['variants', 'by-product', product?.id],
    });
    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({
      queryKey: ['items', 'stats-by-variants', product?.id],
    });
  }, [queryClient, product?.id]);

  const createMutation = useMutation({
    mutationFn: (data: CreateVariantRequest) =>
      variantsService.createVariant(data),
    onSuccess: () => {
      invalidateQueries();
      toast.success('Variante criada com sucesso!');
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar variante: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVariantRequest }) =>
      variantsService.updateVariant(id, data),
    onSuccess: () => {
      invalidateQueries();
      toast.success('Variante atualizada com sucesso!');
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar variante: ${error.message}`);
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!product?.id || !formData.name.trim()) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }

      const salePrice =
        formData.definedSalePrice > 0
          ? formData.definedSalePrice
          : calculatedSalePrice || 0;

      const cleanData = {
        name: formData.name.trim(),
        reference: formData.reference.trim() || undefined,
        colorHex: formData.colorHex.trim() || undefined,
        colorPantone: formData.colorPantone.trim() || undefined,
        imageUrl: formData.imageUrl.trim() || undefined,
        outOfLine: formData.outOfLine,
        isActive: formData.isActive,
        price: salePrice,
        costPrice: formData.informedCostPrice || undefined,
        profitMargin: formData.profitMarginPercent || undefined,
        minStock: formData.minStock || undefined,
        maxStock: formData.maxStock || undefined,
        reorderPoint: formData.reorderPoint || undefined,
        reorderQuantity: formData.reorderQuantity || undefined,
        attributes: formData.attributes,
      };

      if (isEditMode && variant) {
        updateMutation.mutate({ id: variant.id, data: cleanData });
      } else {
        createMutation.mutate({ ...cleanData, productId: product.id });
      }
    },
    [
      product,
      variant,
      formData,
      isEditMode,
      calculatedSalePrice,
      createMutation,
      updateMutation,
    ]
  );

  const updateField = useCallback(
    <K extends keyof FormData>(key: K, value: FormData[K]) => {
      setFormData(prev => ({ ...prev, [key]: value }));
    },
    []
  );

  const updateAttribute = useCallback((key: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      attributes: { ...prev.attributes, [key]: value },
    }));
  }, []);

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-6xl p-0 gap-0 max-h-[85vh] flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle>
            {isEditMode ? 'Editar Variante' : 'Nova Variante'}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {isEditMode
              ? `Editando ${variant?.name}`
              : `Adicionar variante para ${product.name}`}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex flex-1 min-h-0">
            {/* Sidebar */}
            <nav className="w-48 shrink-0 border-r p-2 space-y-1 overflow-auto">
              {SECTIONS.map(section => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg transition-all duration-200',
                    'text-left group',
                    activeSection === section.id
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/5'
                  )}
                >
                  <div
                    className={cn(
                      'p-1.5 rounded-md transition-colors',
                      activeSection === section.id
                        ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                        : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/50 group-hover:bg-gray-200 dark:group-hover:bg-white/15'
                    )}
                  >
                    {section.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        'font-medium text-xs',
                        activeSection === section.id
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-900 dark:text-white'
                      )}
                    >
                      {section.label}
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-white/40 truncate">
                      {section.description}
                    </p>
                  </div>
                  <ChevronRight
                    className={cn(
                      'w-3.5 h-3.5 shrink-0 transition-transform',
                      activeSection === section.id
                        ? 'text-blue-500 translate-x-0'
                        : 'text-gray-400 -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
                    )}
                  />
                </button>
              ))}
            </nav>

            {/* Content Area */}
            <ScrollArea className="flex-1">
              <div className="p-6 space-y-4">
                {/* Section: Basic */}
                {activeSection === 'basic' && (
                  <BasicSection
                    formData={formData}
                    updateField={updateField}
                    isPending={isPending}
                  />
                )}

                {/* Section: Pricing */}
                {activeSection === 'pricing' && (
                  <PricingSection
                    formData={formData}
                    updateField={updateField}
                    calculatedCostPrice={calculatedCostPrice}
                    calculatedSalePrice={calculatedSalePrice}
                    calculatedProfitMargin={calculatedProfitMargin}
                    isPending={isPending}
                  />
                )}

                {/* Section: Stock */}
                {activeSection === 'stock' && (
                  <StockSection
                    formData={formData}
                    updateField={updateField}
                    isPending={isPending}
                  />
                )}

                {/* Section: Attributes */}
                {activeSection === 'attributes' && (
                  <AttributesSection
                    formData={formData}
                    variantAttributes={variantAttributes}
                    hasAttributes={hasAttributes}
                    updateAttribute={updateAttribute}
                    isPending={isPending}
                  />
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isEditMode ? 'Salvando...' : 'Criando...'}
                </>
              ) : isEditMode ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Variante
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ===========================================================================
// Section Components
// ===========================================================================

interface SectionProps {
  formData: FormData;
  updateField: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
  isPending: boolean;
}

// ---------------------------------------------------------------------------
// Basic Section
// ---------------------------------------------------------------------------

function BasicSection({ formData, updateField, isPending }: SectionProps) {
  return (
    <div className="space-y-4">
      {/* Nome + Referência */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="vfm-name">
            Nome da Variante <span className="text-red-500">*</span>
          </Label>
          <Input
            id="vfm-name"
            placeholder="Ex: Azul P, 100ml, etc."
            value={formData.name}
            onChange={e => updateField('name', e.target.value)}
            required
            autoFocus
            disabled={isPending}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="vfm-reference">Referência</Label>
          <Input
            id="vfm-reference"
            placeholder="Código de referência"
            value={formData.reference}
            onChange={e => updateField('reference', e.target.value)}
            maxLength={128}
            disabled={isPending}
          />
        </div>
      </div>

      {/* Cor e Pantone */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="vfm-colorHex">Cor de Exibição</Label>
          <div className="flex items-center gap-2">
            <input
              id="vfm-colorHex"
              type="color"
              value={formData.colorHex || '#000000'}
              onChange={e => updateField('colorHex', e.target.value)}
              className="h-9 w-12 cursor-pointer rounded border border-input bg-transparent p-0.5"
              disabled={isPending}
            />
            <Input
              value={formData.colorHex}
              onChange={e => updateField('colorHex', e.target.value)}
              placeholder="#000000"
              maxLength={7}
              className="flex-1"
              disabled={isPending}
            />
            {formData.colorHex && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={() => updateField('colorHex', '')}
              >
                Limpar
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="vfm-colorPantone">Pantone</Label>
          <Input
            id="vfm-colorPantone"
            value={formData.colorPantone}
            onChange={e => updateField('colorPantone', e.target.value)}
            placeholder="Ex: PANTONE 19-4052"
            maxLength={50}
            disabled={isPending}
          />
        </div>
      </div>

      {/* URL da Imagem */}
      <div className="space-y-1.5">
        <Label htmlFor="vfm-imageUrl">URL da Imagem</Label>
        <Input
          id="vfm-imageUrl"
          value={formData.imageUrl}
          onChange={e => updateField('imageUrl', e.target.value)}
          placeholder="https://exemplo.com/imagem.jpg"
          disabled={isPending}
        />
      </div>

      {/* Switches: Fora de Linha + Ativo */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center justify-between p-3 rounded-lg border">
          <div className="space-y-0.5">
            <Label htmlFor="vfm-outOfLine" className="text-sm font-medium">
              Fora de Linha
            </Label>
            <p className="text-xs text-muted-foreground">
              Não disponível para novos pedidos
            </p>
          </div>
          <Switch
            id="vfm-outOfLine"
            checked={formData.outOfLine}
            onCheckedChange={checked => updateField('outOfLine', checked)}
            disabled={isPending}
          />
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg border">
          <div className="space-y-0.5">
            <Label htmlFor="vfm-isActive" className="text-sm font-medium">
              Ativo
            </Label>
            <p className="text-xs text-muted-foreground">
              Disponível para venda
            </p>
          </div>
          <Switch
            id="vfm-isActive"
            checked={formData.isActive}
            onCheckedChange={checked => updateField('isActive', checked)}
            disabled={isPending}
          />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pricing Section
// ---------------------------------------------------------------------------

interface PricingSectionProps extends SectionProps {
  calculatedCostPrice: number;
  calculatedSalePrice: number;
  calculatedProfitMargin: number;
}

function PricingSection({
  formData,
  updateField,
  calculatedCostPrice,
  calculatedSalePrice,
  calculatedProfitMargin,
  isPending,
}: PricingSectionProps) {
  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Row 1: Custo Calculado, Custo Informado, Margem */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Label htmlFor="vfm-calculatedCost">Custo Calculado</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Média do custo dos itens</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <InputGroup>
              <InputGroupAddon>
                <InputGroupText>R$</InputGroupText>
              </InputGroupAddon>
              <MoneyInput
                id="vfm-calculatedCost"
                value={calculatedCostPrice}
                disabled
                className="bg-muted"
              />
            </InputGroup>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="vfm-informedCost">Custo Informado</Label>
            <InputGroup>
              <InputGroupAddon>
                <InputGroupText>R$</InputGroupText>
              </InputGroupAddon>
              <MoneyInput
                id="vfm-informedCost"
                value={formData.informedCostPrice}
                onChange={value => updateField('informedCostPrice', value)}
                placeholder="0,00"
                disabled={isPending}
              />
            </InputGroup>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="vfm-profitMargin">Margem de Lucro (%)</Label>
            <Input
              id="vfm-profitMargin"
              type="number"
              step="0.1"
              min="0"
              value={formData.profitMarginPercent || ''}
              onChange={e =>
                updateField(
                  'profitMarginPercent',
                  parseFloat(e.target.value) || 0
                )
              }
              placeholder="0.0"
              disabled={isPending}
            />
          </div>
        </div>

        {/* Row 2: Preço Calculado, Preço Definido, Margem Calculada */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Label htmlFor="vfm-calculatedSale">Venda Calculado</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Baseado na margem de lucro</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <InputGroup>
              <InputGroupAddon>
                <InputGroupText>R$</InputGroupText>
              </InputGroupAddon>
              <MoneyInput
                id="vfm-calculatedSale"
                value={calculatedSalePrice}
                disabled
                className="bg-muted"
              />
            </InputGroup>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="vfm-definedSale">Preço de Venda</Label>
            <InputGroup>
              <InputGroupAddon>
                <InputGroupText>R$</InputGroupText>
              </InputGroupAddon>
              <MoneyInput
                id="vfm-definedSale"
                value={formData.definedSalePrice}
                onChange={value => updateField('definedSalePrice', value)}
                placeholder="0,00"
                disabled={isPending}
              />
            </InputGroup>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Label htmlFor="vfm-calculatedMargin">Margem Calculada (%)</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Baseado no preço definido</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Input
              id="vfm-calculatedMargin"
              type="number"
              step="0.01"
              value={calculatedProfitMargin.toFixed(2)}
              disabled
              className="bg-muted"
            />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

// ---------------------------------------------------------------------------
// Stock Section
// ---------------------------------------------------------------------------

function StockSection({ formData, updateField, isPending }: SectionProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="vfm-minStock">Estoque Mínimo</Label>
          <Input
            id="vfm-minStock"
            type="number"
            min="0"
            value={formData.minStock || ''}
            onChange={e =>
              updateField('minStock', parseInt(e.target.value) || 0)
            }
            placeholder="0"
            disabled={isPending}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="vfm-maxStock">Estoque Máximo</Label>
          <Input
            id="vfm-maxStock"
            type="number"
            min="0"
            value={formData.maxStock || ''}
            onChange={e =>
              updateField('maxStock', parseInt(e.target.value) || 0)
            }
            placeholder="0"
            disabled={isPending}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="vfm-reorderPoint">Ponto de Reposição</Label>
          <Input
            id="vfm-reorderPoint"
            type="number"
            min="0"
            value={formData.reorderPoint || ''}
            onChange={e =>
              updateField('reorderPoint', parseInt(e.target.value) || 0)
            }
            placeholder="0"
            disabled={isPending}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="vfm-reorderQty">Quantidade de Reposição</Label>
          <Input
            id="vfm-reorderQty"
            type="number"
            min="0"
            value={formData.reorderQuantity || ''}
            onChange={e =>
              updateField('reorderQuantity', parseInt(e.target.value) || 0)
            }
            placeholder="0"
            disabled={isPending}
          />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Attributes Section
// ---------------------------------------------------------------------------

interface AttributesSectionProps {
  formData: FormData;
  variantAttributes: Record<string, TemplateAttribute>;
  hasAttributes: boolean;
  updateAttribute: (key: string, value: unknown) => void;
  isPending: boolean;
}

function AttributesSection({
  formData,
  variantAttributes,
  hasAttributes,
  updateAttribute,
  isPending,
}: AttributesSectionProps) {
  if (!hasAttributes) {
    return (
      <div className="p-8 text-center border border-dashed rounded-lg">
        <SlidersHorizontal className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">
          Nenhum atributo personalizado definido no template
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(variantAttributes).map(
          ([key, config]: [string, TemplateAttribute]) => {
            const rawValue = formData.attributes[key];
            const currentValue = String(rawValue ?? '');
            const isBooleanType =
              config.type === 'boolean' ||
              (config.type as string) === 'sim/nao';

            return (
              <div key={key} className="space-y-1.5">
                {isBooleanType ? (
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`vfm-attr-${key}`} className="text-sm">
                        {config.label || key}
                        {config.required && (
                          <span className="text-red-500"> *</span>
                        )}
                      </Label>
                      {config.description && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{config.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    <Switch
                      id={`vfm-attr-${key}`}
                      checked={
                        rawValue === true ||
                        currentValue === 'true' ||
                        currentValue === 'sim' ||
                        currentValue === '1'
                      }
                      onCheckedChange={checked => updateAttribute(key, checked)}
                      disabled={isPending}
                    />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`vfm-attr-${key}`} className="text-sm">
                        {config.label || key}
                        {config.required && (
                          <span className="text-red-500"> *</span>
                        )}
                      </Label>
                      {config.description && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{config.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>

                    {config.type === 'select' ? (
                      <Select
                        value={currentValue}
                        onValueChange={value => updateAttribute(key, value)}
                        disabled={isPending}
                      >
                        <SelectTrigger id={`vfm-attr-${key}`}>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {config.options?.map((option: string) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : config.type === 'number' ? (
                      <Input
                        id={`vfm-attr-${key}`}
                        type="number"
                        value={currentValue}
                        onChange={e =>
                          updateAttribute(key, parseFloat(e.target.value) || 0)
                        }
                        placeholder={config.placeholder || ''}
                        required={config.required}
                        disabled={isPending}
                      />
                    ) : config.type === 'date' ? (
                      <Input
                        id={`vfm-attr-${key}`}
                        type="date"
                        value={currentValue}
                        onChange={e => updateAttribute(key, e.target.value)}
                        required={config.required}
                        disabled={isPending}
                      />
                    ) : (
                      <Input
                        id={`vfm-attr-${key}`}
                        type="text"
                        value={currentValue}
                        onChange={e => updateAttribute(key, e.target.value)}
                        placeholder={config.placeholder || ''}
                        required={config.required}
                        disabled={isPending}
                      />
                    )}
                  </>
                )}
              </div>
            );
          }
        )}
      </div>
    </TooltipProvider>
  );
}
