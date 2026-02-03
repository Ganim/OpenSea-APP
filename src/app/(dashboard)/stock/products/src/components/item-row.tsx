/**
 * ItemRow - Item display with selection support
 * Exibe: Code | Location (link) | Atributos Visíveis | Qty
 * Suporta seleção com click, ctrl+click, shift+click
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
import { cn } from '@/lib/utils';
import type { Item, TemplateAttribute } from '@/types/stock';
import { Copy, MapPin, Printer } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import { toast } from 'sonner';

export interface ItemRowProps {
  item: Item;
  unitLabel?: string;
  /** Atributos de item do template (para exibir os visíveis) */
  itemAttributes?: Record<string, TemplateAttribute>;
  /** Se o item está selecionado */
  isSelected?: boolean;
  /** Callback ao clicar no item */
  onClick?: (e: React.MouseEvent) => void;
  /** Callback ao dar double-click no item */
  onDoubleClick?: () => void;
  /** Callback ao clicar no botão de impressão */
  onPrint?: (item: Item) => void;
}

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  }
> = {
  AVAILABLE: { label: 'Disponível', variant: 'default' },
  RESERVED: { label: 'Reservado', variant: 'secondary' },
  SOLD: { label: 'Vendido', variant: 'outline' },
  DAMAGED: { label: 'Danificado', variant: 'destructive' },
};

export function ItemRow({
  item,
  unitLabel = 'un',
  itemAttributes,
  isSelected = false,
  onClick,
  onDoubleClick,
  onPrint,
}: ItemRowProps) {
  // Resolver endereço da localização: bin.address > resolvedAddress > binId > locationId
  const locationAddress =
    item.bin?.address || item.resolvedAddress || item.binId || item.locationId;

  // Resolver código do item: uniqueCode > fullCode > id (primeiros 8 chars)
  const itemCode = item.uniqueCode || item.fullCode || item.id.substring(0, 8);

  const statusConfig = STATUS_CONFIG[item.status] || STATUS_CONFIG.AVAILABLE;
  const showStatusBadge = item.status !== 'AVAILABLE';

  // Construir URL da localização
  const locationUrl = useMemo(() => {
    if (
      item.bin?.id &&
      item.bin?.zone?.id &&
      item.bin?.zone?.warehouseId &&
      typeof item.bin.zone.warehouseId === 'string' &&
      item.bin.zone.warehouseId.length === 36
    ) {
      const { warehouseId, id: zoneId } = item.bin.zone;
      const binId = item.bin.id;
      return `/stock/locations/${warehouseId}/zones/${zoneId}?highlight=${binId}`;
    }
    return null;
  }, [item.bin]);

  // Filtrar atributos visíveis (enableView = true)
  const visibleAttributes = useMemo(() => {
    if (!itemAttributes) return [];
    return Object.entries(itemAttributes)
      .filter(([, attr]) => attr.enableView === true)
      .map(([key, attr]) => ({
        key,
        label: attr.label || key,
        unitOfMeasure: attr.unitOfMeasure,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value: (item.attributes as any)?.[key],
      }));
  }, [itemAttributes, item.attributes]);

  // Formatar valor do atributo
  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined || value === '') return '—';
    if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
    return String(value);
  };

  const handleCopyCode = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(itemCode);
      toast.success('Código copiado!');
    } catch {
      toast.error('Erro ao copiar código');
    }
  };

  const handleLocationClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Não propagar para o onClick do row
  };

  const handlePrintClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPrint?.(item);
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer select-none',
        isSelected
          ? 'bg-sky-500/20 border-sky-500'
          : 'bg-card hover:bg-muted/50 border-border'
      )}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      {/* Column 1: Code + Status (only if not AVAILABLE) */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="font-mono text-sm truncate">{itemCode}</p>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 h-6 w-6 opacity-50 hover:opacity-100"
            onClick={handleCopyCode}
            title="Copiar código"
          >
            <Copy className="h-3 w-3" />
          </Button>
          {onPrint && (
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 h-6 w-6 opacity-50 hover:opacity-100 text-blue-600 hover:text-blue-700"
              onClick={handlePrintClick}
              title="Imprimir etiqueta"
            >
              <Printer className="h-3 w-3" />
            </Button>
          )}
        </div>
        {showStatusBadge && (
          <Badge variant={statusConfig.variant} className="text-xs mt-1">
            {statusConfig.label}
          </Badge>
        )}
      </div>

      {/* Column 2: Location (clicável como link) */}
      <div className="shrink-0 flex items-center gap-1.5 text-sm">
        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
        {locationUrl ? (
          <Link
            href={locationUrl}
            target="_blank"
            onClick={handleLocationClick}
            className={cn(
              'font-mono transition-colors',
              'text-muted-foreground hover:text-blue-500',
              'border-b border-dashed border-muted-foreground/50 hover:border-blue-500'
            )}
          >
            {locationAddress || '—'}
          </Link>
        ) : (
          <span className="font-mono text-muted-foreground">
            {locationAddress || '—'}
          </span>
        )}
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

      {/* Column 3: Quantity */}
      <div className="shrink-0 w-20 text-right">
        <span
          className={cn(
            'text-sm font-medium',
            item.currentQuantity === 0
              ? 'text-muted-foreground'
              : 'text-foreground'
          )}
        >
          {formatQuantity(item.currentQuantity)}
        </span>
        <p className="text-xs text-muted-foreground">{unitLabel}</p>
      </div>
    </div>
  );
}
