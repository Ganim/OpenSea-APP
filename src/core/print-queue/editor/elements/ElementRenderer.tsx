'use client';

/**
 * Label Studio - Element Renderer
 * Componente principal que renderiza qualquer tipo de elemento
 */

import React from 'react';
import type { LabelElement } from '../studio-types';
import { TextElementRenderer } from './TextElementRenderer';
import { ShapeElementRenderer } from './ShapeElementRenderer';
import { LineElementRenderer } from './LineElementRenderer';
import { ArrowElementRenderer } from './ArrowElementRenderer';
import { ImageElementRenderer } from './ImageElementRenderer';
import { IconElementRenderer } from './IconElementRenderer';
import { FieldElementRenderer } from './FieldElementRenderer';
import { BarcodeElementRenderer } from './BarcodeElementRenderer';
import { QRCodeElementRenderer } from './QRCodeElementRenderer';
import { TableElementRenderer } from './TableElementRenderer';

interface ElementRendererProps {
  element: LabelElement;
  zoom: number;
  isEditing?: boolean;
  onContentChange?: (content: string) => void;
  selectedCell?: { row: number; col: number } | null;
  onCellClick?: (row: number, col: number) => void;
  previewData?: Record<string, unknown>;
}

/**
 * Renderiza um elemento baseado no seu tipo
 */
export function ElementRenderer({
  element,
  zoom,
  isEditing = false,
  onContentChange,
  selectedCell,
  onCellClick,
  previewData,
}: ElementRendererProps) {
  switch (element.type) {
    case 'text':
      return (
        <TextElementRenderer
          element={element}
          zoom={zoom}
          isEditing={isEditing}
          onContentChange={onContentChange}
        />
      );

    case 'shape':
      return <ShapeElementRenderer element={element} zoom={zoom} />;

    case 'line':
      return <LineElementRenderer element={element} zoom={zoom} />;

    case 'arrow':
      return <ArrowElementRenderer element={element} zoom={zoom} />;

    case 'image':
      return <ImageElementRenderer element={element} zoom={zoom} />;

    case 'icon':
      return <IconElementRenderer element={element} zoom={zoom} />;

    case 'field':
      return (
        <FieldElementRenderer
          element={element}
          zoom={zoom}
          previewData={previewData}
        />
      );

    case 'barcode':
      return (
        <BarcodeElementRenderer
          element={element}
          zoom={zoom}
          previewData={previewData}
        />
      );

    case 'qrcode':
      return (
        <QRCodeElementRenderer
          element={element}
          zoom={zoom}
          previewData={previewData}
        />
      );

    case 'table':
      return (
        <TableElementRenderer
          element={element}
          zoom={zoom}
          previewData={previewData}
          selectedCell={selectedCell}
          onCellClick={onCellClick}
        />
      );

    default:
      return (
        <div className="w-full h-full flex items-center justify-center bg-red-50 border border-red-200 text-red-600 text-xs">
          Tipo desconhecido
        </div>
      );
  }
}

export default ElementRenderer;
