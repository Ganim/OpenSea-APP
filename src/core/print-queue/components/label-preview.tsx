/**
 * Label Preview
 * Preview de uma etiqueta individual com renderização realista
 */

'use client';

import { cn } from '@/lib/utils';
import JsBarcode from 'jsbarcode';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useRef } from 'react';
import { SYSTEM_LABEL_TEMPLATES } from '../constants';
import type { LabelData, LabelTemplateDefinition } from '../types';
import { getSampleLabelData } from '../utils/label-data-resolver';

interface LabelPreviewProps {
  templateId: string;
  data?: LabelData;
  scale?: number;
  className?: string;
  showBorder?: boolean;
}

export function LabelPreview({
  templateId,
  data,
  scale = 2,
  className,
  showBorder = true,
}: LabelPreviewProps) {
  const template = SYSTEM_LABEL_TEMPLATES.find(t => t.id === templateId);
  const labelData = data || getSampleLabelData();

  if (!template) {
    return (
      <div className={cn('flex items-center justify-center p-4', className)}>
        <p className="text-sm text-gray-500">Template não encontrado</p>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center justify-center p-4', className)}>
      <div
        className={cn(
          'bg-white overflow-hidden',
          showBorder && 'border border-gray-300 shadow-md rounded-sm'
        )}
        style={{
          width: `${template.dimensions.width * scale}px`,
          height: `${template.dimensions.height * scale}px`,
        }}
      >
        <LabelContent template={template} data={labelData} scale={scale} />
      </div>
    </div>
  );
}

// ============================================
// LABEL CONTENT
// ============================================

interface LabelContentProps {
  template: LabelTemplateDefinition;
  data: LabelData;
  scale: number;
}

function LabelContent({ template, data, scale }: LabelContentProps) {
  // Selecionar layout baseado no tamanho do template
  const isSmall = template.dimensions.width <= 35;
  const isLarge = template.dimensions.width >= 80;

  if (isSmall) {
    return <SmallLabelLayout data={data} scale={scale} />;
  }

  if (isLarge) {
    return <LargeLabelLayout data={data} scale={scale} />;
  }

  return <MediumLabelLayout data={data} scale={scale} />;
}

// ============================================
// SMALL LABEL LAYOUT (25x15mm, 30x20mm)
// ============================================

function SmallLabelLayout({ data, scale }: { data: LabelData; scale: number }) {
  const baseFontSize = 5 * scale;

  return (
    <div
      className="h-full flex flex-col justify-between"
      style={{
        padding: `${2 * scale}px`,
        fontSize: `${baseFontSize}px`,
        lineHeight: 1.2,
      }}
    >
      {/* Item code */}
      <div
        className="font-bold text-gray-900 truncate"
        style={{ fontSize: `${baseFontSize * 1.1}px` }}
      >
        {data.itemCode}
      </div>

      {/* Location */}
      <div
        className="text-gray-600 truncate"
        style={{ fontSize: `${baseFontSize * 0.9}px` }}
      >
        {data.stockLocation}
      </div>

      {/* Barcode */}
      <div className="flex justify-center mt-auto">
        <BarcodeImage
          value={data.barcodeData}
          height={Math.max(8, 10 * scale)}
          width={1}
        />
      </div>
    </div>
  );
}

// ============================================
// MEDIUM LABEL LAYOUT (50x30mm, 60x40mm)
// ============================================

function MediumLabelLayout({
  data,
  scale,
}: {
  data: LabelData;
  scale: number;
}) {
  const baseFontSize = 6 * scale;

  return (
    <div
      className="h-full flex flex-col"
      style={{
        padding: `${3 * scale}px`,
        fontSize: `${baseFontSize}px`,
        lineHeight: 1.3,
      }}
    >
      {/* Header: Product name + Location */}
      <div className="flex justify-between items-start gap-1">
        <div
          className="font-bold text-gray-900 truncate flex-1"
          style={{ fontSize: `${baseFontSize * 1.15}px` }}
        >
          {data.productName}
        </div>
        <div
          className="text-gray-500 shrink-0 font-mono"
          style={{ fontSize: `${baseFontSize * 0.85}px` }}
        >
          {data.stockLocation}
        </div>
      </div>

      {/* Variant */}
      <div
        className="text-gray-600 truncate"
        style={{
          fontSize: `${baseFontSize}px`,
          marginTop: `${1 * scale}px`,
        }}
      >
        {data.variantName}
      </div>

      {/* Barcode - centered */}
      <div
        className="flex-1 flex items-center justify-center"
        style={{ marginTop: `${2 * scale}px`, marginBottom: `${2 * scale}px` }}
      >
        <BarcodeImage
          value={data.barcodeData}
          height={Math.max(12, 15 * scale)}
          width={1}
        />
      </div>

      {/* Footer: Item code + Quantity */}
      <div className="flex justify-between items-end">
        <div
          className="font-mono text-gray-700 font-medium"
          style={{ fontSize: `${baseFontSize * 0.9}px` }}
        >
          {data.itemCode}
        </div>
        <div
          className="text-gray-600 font-medium"
          style={{ fontSize: `${baseFontSize * 0.9}px` }}
        >
          {data.itemQuantity} {data.itemUnitOfMeasure}
        </div>
      </div>
    </div>
  );
}

// ============================================
// LARGE LABEL LAYOUT (100x50mm, 100x60mm, 100x70mm)
// ============================================

function LargeLabelLayout({ data, scale }: { data: LabelData; scale: number }) {
  const baseFontSize = 7 * scale;
  const qrSize = Math.max(30, 35 * scale);

  return (
    <div
      className="h-full flex"
      style={{
        padding: `${4 * scale}px`,
        fontSize: `${baseFontSize}px`,
        lineHeight: 1.3,
        gap: `${4 * scale}px`,
      }}
    >
      {/* Left side - Info */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Manufacturer */}
        {data.manufacturerName && (
          <div
            className="text-gray-500 truncate"
            style={{ fontSize: `${baseFontSize * 0.85}px` }}
          >
            {data.manufacturerName}
          </div>
        )}

        {/* Product name */}
        <div
          className="font-bold text-gray-900 truncate"
          style={{
            fontSize: `${baseFontSize * 1.3}px`,
            marginTop: `${1 * scale}px`,
          }}
        >
          {data.productName}
        </div>

        {/* Variant */}
        <div
          className="text-gray-700 truncate"
          style={{
            fontSize: `${baseFontSize * 1.1}px`,
            marginTop: `${1 * scale}px`,
          }}
        >
          {data.variantName}
        </div>

        {/* Reference */}
        {data.variantReference && (
          <div
            className="text-gray-500 truncate"
            style={{
              fontSize: `${baseFontSize * 0.9}px`,
              marginTop: `${1 * scale}px`,
            }}
          >
            Ref: {data.variantReference}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Location & Quantity */}
        <div className="flex justify-between items-end">
          <div
            className="font-mono text-gray-600"
            style={{ fontSize: `${baseFontSize * 0.9}px` }}
          >
            {data.stockLocation}
          </div>
          <div
            className="font-bold text-gray-900"
            style={{ fontSize: `${baseFontSize * 1.1}px` }}
          >
            {data.itemQuantity} {data.itemUnitOfMeasure}
          </div>
        </div>
      </div>

      {/* Right side - Codes */}
      <div
        className="flex flex-col items-end justify-between shrink-0"
        style={{ width: `${qrSize + 10 * scale}px` }}
      >
        {/* QR Code */}
        <div className="bg-white p-0.5 border border-gray-200 rounded-sm">
          <QRCodeSVG
            value={data.qrCodeData}
            size={qrSize}
            level="M"
            includeMargin={false}
          />
        </div>

        {/* Item code */}
        <div
          className="font-mono font-bold text-gray-800 text-right"
          style={{ fontSize: `${baseFontSize * 0.95}px` }}
        >
          {data.itemCode}
        </div>
      </div>
    </div>
  );
}

// ============================================
// BARCODE IMAGE (SVG)
// ============================================

interface BarcodeImageProps {
  value: string;
  height?: number;
  width?: number;
}

function BarcodeImage({ value, height = 30, width = 1 }: BarcodeImageProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format: 'CODE128',
          width,
          height,
          displayValue: false,
          margin: 0,
          background: 'transparent',
        });
      } catch (error) {
        console.error('Erro ao gerar barcode:', error);
      }
    }
  }, [value, height, width]);

  return <svg ref={svgRef} className="max-w-full" />;
}
