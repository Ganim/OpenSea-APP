'use client';

/**
 * Componente Exemplo - Uso do Sistema de Impressão
 *
 * Demonstra como usar o sistema de impressão com a etiqueta de item
 */

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PrintPreview } from '@/core/printing/components/PrintPreview';
import { PRINT_TEMPLATES } from '@/core/printing/templates';
import { ItemLabelData } from '@/core/printing/types';
import { useState } from 'react';

export function PrintExample() {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Dados de exemplo baseados na imagem fornecida
  const exampleData: ItemLabelData = {
    manufacturer: 'Santista',
    stockLocation: 'FB-108-E',
    product: 'Solasol',
    code: '5.1.1.2.901.23',
    composition: '100% Algodão',
    quality: '',
    color: '901 - Caviar',
    nuance: '',
    dimensions: 'L: 1,62m',
    grammage: '260 g/m²',
    pieceId: 'AA00023-1',
    quantity: '±9 m',
    barcode: '5.1.1.2.901.23/AA00023-1',
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Exemplo: Impressão de Etiqueta de Item</CardTitle>
        <CardDescription>
          Demonstração do sistema de impressão com dados reais
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Fabricante:</strong> {exampleData.manufacturer}
          </div>
          <div>
            <strong>Localização:</strong> {exampleData.stockLocation}
          </div>
          <div>
            <strong>Produto:</strong> {exampleData.product}
          </div>
          <div>
            <strong>Código:</strong> {exampleData.code}
          </div>
          <div>
            <strong>ID da Peça:</strong> {exampleData.pieceId}
          </div>
          <div>
            <strong>Quantidade:</strong> {exampleData.quantity}
          </div>
        </div>

        <Button onClick={() => setIsPreviewOpen(true)} className="w-full">
          Visualizar e Imprimir Etiqueta
        </Button>

        <PrintPreview
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          template={PRINT_TEMPLATES.ITEM_LABEL}
          data={exampleData}
          filename={`etiqueta-${exampleData.pieceId}.pdf`}
        />
      </CardContent>
    </Card>
  );
}
