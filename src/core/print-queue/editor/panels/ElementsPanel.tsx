'use client';

/**
 * Label Studio - Elements Panel
 * Painel lateral com elementos disponíveis para adicionar ao canvas
 */

import React from 'react';
import {
  Type,
  Image,
  Square,
  Circle,
  Minus,
  ArrowRight,
  Barcode,
  QrCode,
  Table2,
  FileText,
  Star,
} from 'lucide-react';
import { useEditorStore } from '../stores/editorStore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type {
  LabelElement,
  TextElement,
  ShapeElement,
  LineElement,
  ArrowElement,
  ImageElement,
  IconElement,
  FieldElement,
  BarcodeElement,
  QRCodeElement,
  TableElement,
} from '../studio-types';
import { DEFAULT_TEXT_STYLE, DEFAULT_BORDER_STYLE } from '../studio-types';

/**
 * Categorias de elementos
 */
const ELEMENT_CATEGORIES = [
  {
    id: 'data',
    name: 'Campos de Dados',
    elements: [
      {
        id: 'field',
        name: 'Campo',
        icon: FileText,
        description: 'Campo dinâmico vinculado a dados',
      },
    ],
  },
  {
    id: 'basic',
    name: 'Básicos',
    elements: [
      {
        id: 'text',
        name: 'Texto',
        icon: Type,
        description: 'Texto estático livre',
      },
      {
        id: 'image',
        name: 'Imagem',
        icon: Image,
        description: 'Imagem ou logo',
      },
      {
        id: 'icon',
        name: 'Ícone',
        icon: Star,
        description: 'Ícone vetorial',
      },
    ],
  },
  {
    id: 'shapes',
    name: 'Formas',
    elements: [
      {
        id: 'rectangle',
        name: 'Retângulo',
        icon: Square,
        description: 'Forma retangular',
      },
      {
        id: 'circle',
        name: 'Círculo',
        icon: Circle,
        description: 'Forma circular',
      },
      {
        id: 'line',
        name: 'Linha',
        icon: Minus,
        description: 'Linha horizontal/vertical',
      },
      {
        id: 'arrow',
        name: 'Seta',
        icon: ArrowRight,
        description: 'Seta direcional',
      },
    ],
  },
  {
    id: 'codes',
    name: 'Códigos',
    elements: [
      {
        id: 'barcode',
        name: 'Código de Barras',
        icon: Barcode,
        description: 'Código de barras (CODE128, EAN, etc)',
      },
      {
        id: 'qrcode',
        name: 'QR Code',
        icon: QrCode,
        description: 'Código QR',
      },
    ],
  },
  {
    id: 'tables',
    name: 'Tabelas',
    elements: [
      {
        id: 'table',
        name: 'Tabela',
        icon: Table2,
        description: 'Tabela com células',
      },
    ],
  },
] as const;

/**
 * Cria um novo elemento baseado no tipo
 */
function createNewElement(
  elementId: string,
  canvasWidth: number,
  canvasHeight: number
): LabelElement | null {
  // Posição central padrão
  const defaultX = canvasWidth / 2 - 10;
  const defaultY = canvasHeight / 2 - 5;

  const baseProps = {
    id: '', // Será gerado pelo store
    rotation: 0,
    opacity: 1,
    zIndex: 0, // Será calculado pelo store
    locked: false,
    visible: true,
  };

  switch (elementId) {
    case 'text':
      return {
        ...baseProps,
        type: 'text',
        x: defaultX,
        y: defaultY,
        width: 20,
        height: 8,
        content: 'Texto',
        style: { ...DEFAULT_TEXT_STYLE },
      } as TextElement;

    case 'field':
      return {
        ...baseProps,
        type: 'field',
        x: defaultX,
        y: defaultY,
        width: 25,
        height: 8,
        fieldConfig: {
          type: 'simple',
          dataPath: '',
        },
        valueStyle: { ...DEFAULT_TEXT_STYLE },
      } as FieldElement;

    case 'image':
      return {
        ...baseProps,
        type: 'image',
        x: defaultX,
        y: defaultY,
        width: 15,
        height: 15,
        src: '',
        objectFit: 'contain',
      } as ImageElement;

    case 'icon':
      return {
        ...baseProps,
        type: 'icon',
        x: defaultX,
        y: defaultY,
        width: 8,
        height: 8,
        iconId: 'Star',
        category: 'general',
        color: '#000000',
      } as IconElement;

    case 'rectangle':
      return {
        ...baseProps,
        type: 'shape',
        x: defaultX,
        y: defaultY,
        width: 20,
        height: 10,
        shapeType: 'rectangle',
        fill: '#ffffff',
        stroke: { ...DEFAULT_BORDER_STYLE },
        borderRadius: 0,
      } as ShapeElement;

    case 'circle':
      return {
        ...baseProps,
        type: 'shape',
        x: defaultX,
        y: defaultY,
        width: 10,
        height: 10,
        shapeType: 'circle',
        fill: '#ffffff',
        stroke: { ...DEFAULT_BORDER_STYLE },
      } as ShapeElement;

    case 'line':
      return {
        ...baseProps,
        type: 'line',
        x: defaultX,
        y: defaultY,
        width: 20,
        height: 2,
        orientation: 'horizontal',
        strokeWidth: 0.3,
        strokeStyle: 'solid',
        color: '#000000',
      } as LineElement;

    case 'arrow':
      return {
        ...baseProps,
        type: 'arrow',
        x: defaultX,
        y: defaultY,
        width: 20,
        height: 6,
        arrowStyle: 'simple',
        headStyle: 'filled',
        strokeWidth: 0.5,
        color: '#000000',
      } as ArrowElement;

    case 'barcode':
      return {
        ...baseProps,
        type: 'barcode',
        x: defaultX - 10,
        y: defaultY,
        width: 30,
        height: 10,
        barcodeConfig: {
          source: 'field',
          dataPath: '',
          format: 'CODE128',
          showText: true,
          barColor: '#000000',
          backgroundColor: '#ffffff',
        },
      } as BarcodeElement;

    case 'qrcode':
      return {
        ...baseProps,
        type: 'qrcode',
        x: defaultX,
        y: defaultY,
        width: 15,
        height: 15,
        qrConfig: {
          contentType: 'field',
          dataPath: '',
          errorCorrectionLevel: 'M',
          moduleColor: '#000000',
          backgroundColor: '#ffffff',
        },
      } as QRCodeElement;

    case 'table':
      return {
        ...baseProps,
        type: 'table',
        x: defaultX - 15,
        y: defaultY - 5,
        width: 40,
        height: 20,
        tableConfig: {
          rows: 3,
          columns: 3,
          columnWidths: ['auto', 'auto', 'auto'],
          rowHeights: ['auto', 'auto', 'auto'],
          mergedCells: [],
          borders: {
            external: { ...DEFAULT_BORDER_STYLE },
            internalHorizontal: { ...DEFAULT_BORDER_STYLE, width: 0.5 },
            internalVertical: { ...DEFAULT_BORDER_STYLE, width: 0.5 },
          },
          cellPadding: 1,
        },
        cells: [],
      } as TableElement;

    default:
      return null;
  }
}

interface ElementsPanelProps {
  className?: string;
}

/**
 * Painel de elementos
 */
export function ElementsPanel({ className }: ElementsPanelProps) {
  const addElement = useEditorStore(s => s.addElement);
  const canvasWidth = useEditorStore(s => s.canvasWidth);
  const canvasHeight = useEditorStore(s => s.canvasHeight);

  const handleAddElement = (elementId: string) => {
    const newElement = createNewElement(elementId, canvasWidth, canvasHeight);
    if (newElement) {
      addElement(newElement);
    }
  };

  return (
    <div className={cn('p-4 space-y-4', className)}>
      {ELEMENT_CATEGORIES.map(category => (
        <div key={category.id}>
          <h4 className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
            {category.name}
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {category.elements.map(element => {
              const Icon = element.icon;
              return (
                <Button
                  key={element.id}
                  variant="outline"
                  size="sm"
                  className="h-auto py-2 px-2 flex flex-col items-center gap-1 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  onClick={() => handleAddElement(element.id)}
                  title={element.description}
                >
                  <Icon className="h-5 w-5 text-neutral-600 dark:text-neutral-300" />
                  <span className="text-xs text-neutral-600 dark:text-neutral-300">
                    {element.name}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Dica */}
      <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Clique em um elemento para adicioná-lo ao canvas. Depois, arraste para
          posicioná-lo.
        </p>
      </div>
    </div>
  );
}

export default ElementsPanel;
