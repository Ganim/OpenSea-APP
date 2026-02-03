/**
 * VariantRow - Simplified variant display for two-column modal
 * Exibe: Cor | Nome + Referência | Atributos Visíveis | Preço | Itens | Quantidade | Arrow
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatQuantity } from '@/helpers/formatters';
import { cn, formatCurrency } from '@/lib/utils';
import type { TemplateAttribute, Variant } from '@/types/stock';
import { ChevronRight, Palette, Slash } from 'lucide-react';
import { useMemo } from 'react';

interface VariantRowProps {
  variant: Variant;
  itemsCount?: number;
  totalQuantity?: number;
  unitLabel?: string;
  isSelected?: boolean;
  onClick: () => void;
  /** Atributos de variante do template (para exibir os visíveis) */
  variantAttributes?: Record<string, TemplateAttribute>;
}

export function VariantRow({
  variant,
  itemsCount = 0,
  totalQuantity = 0,
  unitLabel = 'un',
  isSelected = false,
  onClick,
  variantAttributes,
}: VariantRowProps) {
  // Filtrar atributos visíveis (enableView = true)
  const visibleAttributes = useMemo(() => {
    if (!variantAttributes) return [];
    return Object.entries(variantAttributes)
      .filter(([, attr]) => attr.enableView === true)
      .map(([key, attr]) => ({
        key,
        label: attr.label || key,
        unitOfMeasure: attr.unitOfMeasure,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value: (variant.attributes as any)?.[key],
      }));
  }, [variantAttributes, variant.attributes]);

  // Formatar valor do atributo
  const formatValue = (value: unknown, unitOfMeasure?: string): string => {
    if (value === null || value === undefined || value === '') return '—';
    if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
    const strValue = String(value);
    return unitOfMeasure ? `${strValue} ${unitOfMeasure}` : strValue;
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
        isSelected
          ? 'bg-sky-500/20 border-emerald-500'
          : 'bg-card hover:bg-muted/50 border-border'
      )}
      onClick={onClick}
    >
      {/* Column 1: Cor */}
      <div className="shrink-0">
        {variant.colorHex ? (
          <div
            className="h-8 w-12 rounded border border-gray-200 dark:border-slate-700"
            style={{ backgroundColor: variant.colorHex }}
            title={variant.colorHex}
          />
        ) : (
          <div
            className="flex items-center gap-1 text-muted-foreground h-8 w-12 justify-center"
            title="Cor não definida"
          >
            <Palette className="h-4 w-4" />
            <Slash className="h-3 w-3" />
          </div>
        )}
      </div>

      {/* Column 2: Nome + Referência */}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{variant.name}</p>
        <p className="text-xs text-muted-foreground truncate">
          {variant.reference
            ? variant.reference
            : variant.sku || variant.barcode || `ID: ${variant.id.slice(0, 8)}`}
        </p>
      </div>

      {/* Colunas dinâmicas: Atributos Visíveis (label + valor em duas linhas) */}
      {visibleAttributes.length > 0 && (
        <TooltipProvider>
          <div className="flex items-center gap-3 shrink-0">
            {visibleAttributes.slice(0, 3).map(attr => (
              <div key={attr.key} className="text-center min-w-[60px]">
                <p className="text-[10px] text-muted-foreground truncate">
                  {attr.label}
                  {attr.unitOfMeasure && ` (${attr.unitOfMeasure})`}
                </p>
                <p className="text-xs font-medium truncate max-w-[80px]">
                  {formatValue(attr.value)}
                </p>
              </div>
            ))}
            {visibleAttributes.length > 3 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="secondary"
                    className="text-xs cursor-pointer hover:bg-muted"
                  >
                    +{visibleAttributes.length - 3}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="p-3">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {visibleAttributes.slice(3).map(attr => (
                      <div key={attr.key} className="text-left">
                        <p className="text-[10px] text-muted-foreground">
                          {attr.label}
                          {attr.unitOfMeasure && ` (${attr.unitOfMeasure})`}
                        </p>
                        <p className="text-xs font-medium">
                          {formatValue(attr.value)}
                        </p>
                      </div>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </TooltipProvider>
      )}

      {/* Column 3: Items Count (número de registros) */}
      <div className="shrink-0 w-14 text-right">
        <span
          className={cn(
            'text-sm font-medium',
            itemsCount === 0 ? 'text-muted-foreground' : 'text-foreground'
          )}
        >
          {itemsCount}
        </span>
        <p className="text-xs text-muted-foreground">itens</p>
      </div>

      {/* Column 4: Total Quantity (soma das quantidades) */}
      <div className="shrink-0 w-20 text-right">
        <span
          className={cn(
            'text-sm font-medium',
            totalQuantity === 0 ? 'text-muted-foreground' : 'text-foreground'
          )}
        >
          {formatQuantity(totalQuantity)}
        </span>
        <p className="text-xs text-muted-foreground">{unitLabel}</p>
      </div>

      {/* Column 5: Price */}
      <div className="shrink-0">
        <Badge variant="secondary" className="font-mono">
          {formatCurrency(variant.price)}
        </Badge>
      </div>

      {/* Column 6: Arrow */}
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 h-8 w-8"
        onClick={e => {
          e.stopPropagation();
          onClick();
        }}
      >
        <ChevronRight
          className={cn(
            'h-4 w-4 transition-transform',
            isSelected && 'text-primary'
          )}
        />
      </Button>
    </div>
  );
}
