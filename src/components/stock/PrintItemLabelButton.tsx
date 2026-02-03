'use client';

/**
 * Componente de Impressão de Etiqueta de Item
 * Integrado com dados reais do estoque
 */

import { Button } from '@/components/ui/button';
import { PrintPreview } from '@/core/printing/components/PrintPreview';
import { PRINT_TEMPLATES } from '@/core/printing/templates';
import { convertToItemLabelData } from '@/core/printing/utils/item-converters';
import type { Item, Product, Variant } from '@/types/stock';
import { Printer } from 'lucide-react';
import { useState } from 'react';

interface PrintItemLabelButtonProps {
  item: Item;
  variant?: Variant;
  product?: Product;
  additionalData?: {
    manufacturer?: string;
    stockLocation?: string;
    composition?: string;
    dimensions?: string;
    grammage?: string;
  };
  className?: string;
}

export function PrintItemLabelButton({
  item,
  variant,
  product,
  additionalData,
  className,
}: PrintItemLabelButtonProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const labelData = convertToItemLabelData(
    item,
    variant,
    product,
    additionalData
  );

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsPreviewOpen(true)}
        className={className}
      >
        <Printer className="mr-2 h-4 w-4" />
        Imprimir Etiqueta
      </Button>

      <PrintPreview
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        template={PRINT_TEMPLATES.ITEM_LABEL}
        data={labelData}
        filename={`etiqueta-${item.uniqueCode}.pdf`}
      />
    </>
  );
}
