'use client';

/**
 * Componente para Impressão em Lote de Etiquetas
 * Permite selecionar múltiplos itens e imprimir em um único PDF
 */

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBatchPrint } from '@/core/printing/hooks/useBatchPrint';
import { PRINT_TEMPLATES } from '@/core/printing/templates';
import { ItemLabelTemplate } from '@/core/printing/templates/ItemLabelTemplate';
import { PrintOutputType } from '@/core/printing/types';
import { convertToItemLabelData } from '@/core/printing/utils/item-converters';
import type { Item, Product, Variant } from '@/types/stock';
import { Printer, X } from 'lucide-react';
import { useState } from 'react';

interface ItemWithData {
  item: Item;
  variant?: Variant;
  product?: Product;
  copies?: number;
}

interface BatchPrintItemLabelsProps {
  items: ItemWithData[];
  onClose?: () => void;
}

export function BatchPrintItemLabels({
  items,
  onClose,
}: BatchPrintItemLabelsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [copiesMap, setCopiesMap] = useState<Record<string, number>>({});

  const { batchPrint, registerBatchRef, isProcessing } = useBatchPrint();

  const handleToggleItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
      if (!copiesMap[itemId]) {
        setCopiesMap(prev => ({ ...prev, [itemId]: 1 }));
      }
    }
    setSelectedItems(newSelected);
  };

  const handleCopiesChange = (itemId: string, copies: number) => {
    setCopiesMap(prev => ({ ...prev, [itemId]: Math.max(1, copies) }));
  };

  const handlePrint = async () => {
    const selectedItemsData = items
      .filter(({ item }) => selectedItems.has(item.id))
      .map(({ item, variant, product }) => ({
        id: item.id,
        data: convertToItemLabelData(item, variant, product),
        copies: copiesMap[item.id] || 1,
      }));

    await batchPrint(
      {
        template: PRINT_TEMPLATES.ITEM_LABEL,
        items: selectedItemsData,
        outputType: PrintOutputType.PDF,
      },
      `etiquetas-lote-${new Date().getTime()}.pdf`
    );

    setIsOpen(false);
    onClose?.();
  };

  const totalLabels = Array.from(selectedItems).reduce(
    (sum, id) => sum + (copiesMap[id] || 1),
    0
  );

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <Printer className="mr-2 h-4 w-4" />
        Impressão em Lote ({items.length} itens)
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Impressão em Lote de Etiquetas</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
            <DialogDescription>
              Selecione os itens e defina o número de cópias para cada um
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Lista de Itens */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto border rounded-md p-4">
              {items.map(({ item, variant, product }) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-2 hover:bg-muted rounded-md"
                >
                  <Checkbox
                    checked={selectedItems.has(item.id)}
                    onCheckedChange={() => handleToggleItem(item.id)}
                  />
                  <div className="flex-1">
                    <div className="font-medium">
                      {product?.name || variant?.name || 'Item'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ID: {item.uniqueCode} | Qtd: {item.currentQuantity}
                    </div>
                  </div>
                  {selectedItems.has(item.id) && (
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`copies-${item.id}`} className="text-sm">
                        Cópias:
                      </Label>
                      <Input
                        id={`copies-${item.id}`}
                        type="number"
                        min="1"
                        value={copiesMap[item.id] || 1}
                        onChange={e =>
                          handleCopiesChange(item.id, parseInt(e.target.value))
                        }
                        className="w-20"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Resumo */}
            <div className="flex items-center justify-between p-4 bg-muted rounded-md">
              <div>
                <strong>{selectedItems.size}</strong> itens selecionados
              </div>
              <div>
                Total: <strong>{totalLabels}</strong> etiquetas
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-2">
              <Button
                onClick={handlePrint}
                disabled={selectedItems.size === 0 || isProcessing}
                className="flex-1"
              >
                <Printer className="mr-2 h-4 w-4" />
                {isProcessing
                  ? 'Gerando PDF...'
                  : `Imprimir ${totalLabels} Etiquetas`}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isProcessing}
              >
                Cancelar
              </Button>
            </div>
          </div>

          {/* Templates ocultos para impressão */}
          <div style={{ display: 'none' }}>
            {items.map(({ item, variant, product }) => (
              <div key={item.id} ref={el => registerBatchRef(item.id, el)}>
                <ItemLabelTemplate
                  data={convertToItemLabelData(item, variant, product)}
                />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
