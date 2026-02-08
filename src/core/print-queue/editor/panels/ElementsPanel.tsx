'use client';

/**
 * Label Studio - Elements Panel
 * Painel lateral com elementos disponíveis para adicionar ao canvas
 */

import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  ArrowRight,
  Barcode,
  ChevronRight,
  Circle,
  FileText,
  Image,
  Minus,
  PanelLeftClose,
  PanelLeftOpen,
  QrCode,
  Square,
  Star,
  Table2,
  Type,
} from 'lucide-react';
import { useEditorStore } from '../stores/editorStore';
import type {
  ArrowElement,
  BarcodeElement,
  FieldElement,
  IconElement,
  ImageElement,
  LabelElement,
  LineElement,
  QRCodeElement,
  ShapeElement,
  TableElement,
  TextElement,
} from '../studio-types';
import { DEFAULT_BORDER_STYLE, DEFAULT_TEXT_STYLE } from '../studio-types';

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
        name: 'Dados',
        icon: FileText,
        description: 'Dados dinâmicos vinculados',
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
  const defaultX = canvasWidth / 2 - 10;
  const defaultY = canvasHeight / 2 - 5;

  const baseProps = {
    id: '',
    rotation: 0,
    opacity: 1,
    zIndex: 0,
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
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

/**
 * Painel de elementos com glassmorphism e grupos colapsáveis
 */
export function ElementsPanel({
  collapsed,
  onToggleCollapse,
  className,
}: ElementsPanelProps) {
  const addElement = useEditorStore(s => s.addElement);
  const canvasWidth = useEditorStore(s => s.canvasWidth);
  const canvasHeight = useEditorStore(s => s.canvasHeight);

  const handleAddElement = (elementId: string) => {
    const newElement = createNewElement(elementId, canvasWidth, canvasHeight);
    if (newElement) {
      addElement(newElement);
    }
  };

  // Collapsed view - icon strip
  if (collapsed) {
    return (
      <div
        className={cn(
          'w-12 flex flex-col items-center py-2 gap-1 bg-white/80 dark:bg-slate-800/40 backdrop-blur-sm border-r border-slate-200/50 dark:border-slate-700/50',
          className
        )}
      >
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="link"
                size="icon"
                className="h-8 w-8 mb-2"
                onClick={onToggleCollapse}
              >
                <PanelLeftOpen className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Expandir painel</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {ELEMENT_CATEGORIES.flatMap(cat =>
          cat.elements.map(element => {
            const Icon = element.icon;
            return (
              <TooltipProvider key={element.id} delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleAddElement(element.id)}
                    >
                      <Icon className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">{element.name}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'w-64 flex flex-col bg-white/80 dark:bg-slate-800/40 backdrop-blur-sm border-r border-slate-200/50 dark:border-slate-700/50 overflow-y-auto',
        className
      )}
    >
      {/* Panel header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-200/50 dark:border-slate-700/50">
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Elementos
        </h3>
        <Button
          variant="link"
          size="icon"
          className="h-7 w-7"
          onClick={onToggleCollapse}
        >
          <PanelLeftClose className="h-4 w-4" />
        </Button>
      </div>

      {/* Collapsible categories */}
      <div className="p-3 space-y-2">
        {ELEMENT_CATEGORIES.map(category => (
          <Collapsible key={category.id} defaultOpen>
            <CollapsibleTrigger className="flex items-center gap-1.5 w-full py-1.5 group">
              <ChevronRight className="h-3 w-3 text-slate-400 transition-transform group-data-[state=open]:rotate-90" />
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {category.name}
              </span>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid grid-cols-2 gap-1.5 pt-1.5 pb-2">
                {category.elements.map(element => {
                  const Icon = element.icon;
                  return (
                    <button
                      key={element.id}
                      className={cn(
                        'flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg',
                        'bg-linear-to-br from-slate-100/80 to-slate-50/60 dark:from-slate-600/60 dark:to-slate-700/40',
                        'border border-slate-200/50 dark:border-slate-600/30',
                        'hover:from-blue-100/80 hover:to-purple-100/60 dark:hover:from-blue-900/30 dark:hover:to-purple-700/40',
                        'hover:border-blue-300/50 dark:hover:border-blue-600/30',
                        'backdrop-blur-lg transition-all duration-200',
                        'cursor-pointer'
                      )}
                      onClick={() => handleAddElement(element.id)}
                      title={element.description}
                    >
                      <Icon className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                      <span className="text-xs text-slate-600 dark:text-slate-300">
                        {element.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>

      {/* Tip */}
      <div className="mt-auto p-3 border-t border-slate-200/50 dark:border-slate-700/50">
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Clique em um elemento para adicioná-lo ao canvas.
        </p>
      </div>
    </div>
  );
}

export default ElementsPanel;
