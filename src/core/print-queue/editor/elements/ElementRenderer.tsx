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

interface ElementRendererProps {
  element: LabelElement;
  zoom: number;
  isEditing?: boolean;
  onContentChange?: (content: string) => void;
}

/**
 * Renderiza um elemento baseado no seu tipo
 */
export function ElementRenderer({
  element,
  zoom,
  isEditing = false,
  onContentChange,
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
      return <FieldElementRenderer element={element} zoom={zoom} />;

    case 'barcode':
      return <BarcodeElementRenderer element={element} zoom={zoom} />;

    case 'qrcode':
      return <QRCodeElementRenderer element={element} zoom={zoom} />;

    case 'table':
      // Table será implementado na Fase 6
      return (
        <div className="w-full h-full flex items-center justify-center bg-neutral-50 border border-neutral-300">
          <div className="text-neutral-400 text-xs">Tabela</div>
        </div>
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
