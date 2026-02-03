'use client';

/**
 * Página de Demonstração do Sistema de Impressão
 * Acessível via: /printing-demo
 */

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PrintPreview } from '@/core/printing/components/PrintPreview';
import { PRINT_TEMPLATES } from '@/core/printing/templates';
import { ClothingLabelData, ItemLabelData } from '@/core/printing/types';
import { FileText, Printer, Tag } from 'lucide-react';
import { useState } from 'react';

export default function PrintingDemoPage() {
  const [itemPreviewOpen, setItemPreviewOpen] = useState(false);
  const [clothingPreviewOpen, setClothingPreviewOpen] = useState(false);

  // Dados de exemplo - Etiqueta de Item
  const itemLabelData: ItemLabelData = {
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

  // Dados de exemplo - Etiqueta de Roupa
  const clothingLabelData: ClothingLabelData = {
    brand: 'SUA MARCA AQUI',
    reference: '00.000.000/0001-00',
    composition: '96% VISCOSE\n4% ELASTANO',
    careInstructions: [
      '40',
      'no-bleach',
      'no-dryer',
      'iron-low',
      'no-dry-clean',
    ],
    size: 'P',
    madeIn: 'FEITO NO BRASIL',
    barcode: '00.000.000/0001-00',
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Sistema de Impressão</h1>
        <p className="text-muted-foreground">
          Demonstração dos templates de etiquetas e relatórios disponíveis
        </p>
      </div>

      <Tabs defaultValue="item" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="item">
            <Tag className="mr-2 h-4 w-4" />
            Etiqueta de Item
          </TabsTrigger>
          <TabsTrigger value="clothing">
            <Printer className="mr-2 h-4 w-4" />
            Etiqueta de Roupa
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileText className="mr-2 h-4 w-4" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        {/* Tab: Etiqueta de Item */}
        <TabsContent value="item">
          <Card>
            <CardHeader>
              <CardTitle>Etiqueta de Item - 100x100mm</CardTitle>
              <CardDescription>
                Etiqueta padrão para identificação de produtos no estoque
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Fabricante:</strong> {itemLabelData.manufacturer}
                </div>
                <div>
                  <strong>Localização:</strong> {itemLabelData.stockLocation}
                </div>
                <div>
                  <strong>Produto:</strong> {itemLabelData.product}
                </div>
                <div>
                  <strong>Código:</strong> {itemLabelData.code}
                </div>
                <div>
                  <strong>Composição:</strong> {itemLabelData.composition}
                </div>
                <div>
                  <strong>Cor:</strong> {itemLabelData.color}
                </div>
                <div>
                  <strong>ID da Peça:</strong> {itemLabelData.pieceId}
                </div>
                <div>
                  <strong>Quantidade:</strong> {itemLabelData.quantity}
                </div>
              </div>

              <Button
                onClick={() => setItemPreviewOpen(true)}
                className="w-full"
              >
                <Printer className="mr-2 h-4 w-4" />
                Visualizar e Imprimir Etiqueta de Item
              </Button>

              <PrintPreview
                isOpen={itemPreviewOpen}
                onClose={() => setItemPreviewOpen(false)}
                template={PRINT_TEMPLATES.ITEM_LABEL}
                data={itemLabelData}
                filename={`etiqueta-item-${itemLabelData.pieceId}.pdf`}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Etiqueta de Roupa */}
        <TabsContent value="clothing">
          <Card>
            <CardHeader>
              <CardTitle>Etiqueta de Roupa - 33x55mm</CardTitle>
              <CardDescription>
                Etiqueta para roupas com instruções de cuidado (3 etiquetas por
                linha)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Marca:</strong> {clothingLabelData.brand}
                </div>
                <div>
                  <strong>Referência:</strong> {clothingLabelData.reference}
                </div>
                <div>
                  <strong>Tamanho:</strong> {clothingLabelData.size}
                </div>
                <div>
                  <strong>Origem:</strong> {clothingLabelData.madeIn}
                </div>
                <div className="col-span-2">
                  <strong>Composição:</strong>
                  <pre className="mt-1 text-xs">
                    {clothingLabelData.composition}
                  </pre>
                </div>
              </div>

              <Button
                onClick={() => setClothingPreviewOpen(true)}
                className="w-full"
              >
                <Tag className="mr-2 h-4 w-4" />
                Visualizar e Imprimir Etiqueta de Roupa
              </Button>

              <PrintPreview
                isOpen={clothingPreviewOpen}
                onClose={() => setClothingPreviewOpen(false)}
                template={PRINT_TEMPLATES.CLOTHING_LABEL}
                data={clothingLabelData}
                filename={`etiqueta-roupa-${clothingLabelData.size}.pdf`}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Relatórios */}
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios - A4</CardTitle>
              <CardDescription>
                Templates genéricos de relatórios personalizáveis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Em breve: Templates de relatórios de estoque, vendas e
                inventário.
              </p>
              <Button disabled className="w-full">
                <FileText className="mr-2 h-4 w-4" />
                Em Desenvolvimento
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
