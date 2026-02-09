/**
 * Label Preview
 * Preview de uma etiqueta individual
 * Usa o StudioLabelRenderer para templates do Label Studio (v2)
 * ou layouts hardcoded como fallback.
 */

'use client';

import { logger } from '@/lib/logger';
import { cn } from '@/lib/utils';
import { useLabelTemplate } from '@/hooks/stock/use-label-templates';
import JsBarcode from 'jsbarcode';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useMemo, useRef } from 'react';
import { SYSTEM_LABEL_TEMPLATES } from '../constants';
import type { LabelData, LabelTemplateDefinition } from '../types';
import {
  getSampleLabelData,
  labelDataToPreviewData,
} from '../utils/label-data-resolver';
import {
  StudioLabelRenderer,
  parseStudioTemplate,
} from './studio-label-renderer';
import { buildSamplePreviewData } from '@/core/print-queue/editor';

interface LabelPreviewProps {
  templateId: string;
  /** Fallback dimensions for API templates not in SYSTEM_LABEL_TEMPLATES */
  dimensions?: { width: number; height: number } | null;
  data?: LabelData;
  scale?: number;
  /** Max width in pixels - when set, auto-calculates scale to fit */
  maxWidth?: number;
  /** Max height in pixels - when set, auto-calculates scale to fit */
  maxHeight?: number;
  className?: string;
  showBorder?: boolean;
}

export function LabelPreview({
  templateId,
  dimensions,
  data,
  scale = 2,
  maxWidth,
  maxHeight,
  className,
  showBorder = true,
}: LabelPreviewProps) {
  const systemTemplate = SYSTEM_LABEL_TEMPLATES.find(t => t.id === templateId);
  const isSystemTemplate = !!systemTemplate;

  // Fetch template detail from API (only for non-system templates)
  const { data: apiTemplateResponse, isLoading } = useLabelTemplate(
    isSystemTemplate ? null : templateId
  );
  const apiTemplate = apiTemplateResponse?.template;

  // Try to parse Studio template (v2) from grapesJsData
  const studioTemplate = useMemo(() => {
    if (!apiTemplate) return null;
    return parseStudioTemplate(apiTemplate.grapesJsData);
  }, [apiTemplate]);

  // Resolve preview data
  const previewData = useMemo(() => {
    if (data) {
      return labelDataToPreviewData(data);
    }
    return buildSamplePreviewData();
  }, [data]);

  // Use system template dimensions, API template dimensions, or fallback
  const templateDimensions =
    systemTemplate?.dimensions ??
    (apiTemplate
      ? { width: apiTemplate.width, height: apiTemplate.height }
      : null) ??
    dimensions;

  // Auto-calculate scale to fit within maxWidth/maxHeight constraints
  const MM_TO_PX = 96 / 25.4; // ~3.78 px/mm
  const effectiveScale = useMemo(() => {
    const dims = studioTemplate
      ? { width: studioTemplate.width, height: studioTemplate.height }
      : templateDimensions;
    if (!dims || (!maxWidth && !maxHeight)) return scale;

    const widthPxAtScale1 = dims.width * MM_TO_PX;
    const heightPxAtScale1 = dims.height * MM_TO_PX;

    let fitScale = scale;
    if (maxWidth) {
      fitScale = Math.min(fitScale, maxWidth / widthPxAtScale1);
    }
    if (maxHeight) {
      fitScale = Math.min(fitScale, maxHeight / heightPxAtScale1);
    }
    return Math.max(0.2, fitScale);
  }, [scale, maxWidth, maxHeight, studioTemplate, templateDimensions]);

  // Loading state
  if (!isSystemTemplate && isLoading) {
    return (
      <div className={cn('flex items-center justify-center p-4', className)}>
        <div
          className="animate-pulse bg-gray-200 dark:bg-white/10 rounded"
          style={{ width: 150, height: 100 }}
        />
      </div>
    );
  }

  // Studio template v2 - render with StudioLabelRenderer
  if (studioTemplate) {
    return (
      <div className={cn('flex items-center justify-center p-4', className)}>
        <StudioLabelRenderer
          template={studioTemplate}
          previewData={previewData}
          scale={effectiveScale}
          showBorder={showBorder}
        />
      </div>
    );
  }

  // Fallback: system template or legacy rendering
  if (!templateDimensions) {
    return (
      <div className={cn('flex items-center justify-center p-4', className)}>
        <p className="text-sm text-gray-500">Template nao encontrado</p>
      </div>
    );
  }

  // Build a virtual LabelTemplateDefinition for legacy rendering
  const template: LabelTemplateDefinition = systemTemplate ?? {
    id: templateId,
    name: '',
    dimensions: templateDimensions,
    isSystem: false,
    availableFields: [],
    createdAt: new Date(),
  };

  const labelData = data || getSampleLabelData();

  return (
    <div className={cn('flex items-center justify-center p-4', className)}>
      <div
        className={cn(
          'bg-white overflow-hidden',
          showBorder && 'border border-gray-300 shadow-md rounded-sm'
        )}
        style={{
          width: `${template.dimensions.width * effectiveScale}px`,
          height: `${template.dimensions.height * effectiveScale}px`,
        }}
      >
        <LabelContent
          template={template}
          data={labelData}
          scale={effectiveScale}
        />
      </div>
    </div>
  );
}

// ============================================
// LABEL CONTENT (legacy fallback)
// ============================================

interface LabelContentProps {
  template: LabelTemplateDefinition;
  data: LabelData;
  scale: number;
}

function LabelContent({ template, data, scale }: LabelContentProps) {
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
      <div
        className="font-bold text-gray-900 truncate"
        style={{ fontSize: `${baseFontSize * 1.1}px` }}
      >
        {data.itemCode}
      </div>
      <div
        className="text-gray-600 truncate"
        style={{ fontSize: `${baseFontSize * 0.9}px` }}
      >
        {data.stockLocation}
      </div>
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
      <div
        className="text-gray-600 truncate"
        style={{
          fontSize: `${baseFontSize}px`,
          marginTop: `${1 * scale}px`,
        }}
      >
        {data.variantName}
      </div>
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
      <div className="flex-1 flex flex-col min-w-0">
        {data.manufacturerName && (
          <div
            className="text-gray-500 truncate"
            style={{ fontSize: `${baseFontSize * 0.85}px` }}
          >
            {data.manufacturerName}
          </div>
        )}
        <div
          className="font-bold text-gray-900 truncate"
          style={{
            fontSize: `${baseFontSize * 1.3}px`,
            marginTop: `${1 * scale}px`,
          }}
        >
          {data.productName}
        </div>
        <div
          className="text-gray-700 truncate"
          style={{
            fontSize: `${baseFontSize * 1.1}px`,
            marginTop: `${1 * scale}px`,
          }}
        >
          {data.variantName}
        </div>
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
        <div className="flex-1" />
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
      <div
        className="flex flex-col items-end justify-between shrink-0"
        style={{ width: `${qrSize + 10 * scale}px` }}
      >
        <div className="bg-white p-0.5 border border-gray-200 rounded-sm">
          <QRCodeSVG
            value={data.qrCodeData}
            size={qrSize}
            level="M"
            includeMargin={false}
          />
        </div>
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
        logger.error('Erro ao gerar barcode', error as Error, {
          component: 'label-preview',
          value: value.substring(0, 10) + '...',
        });
      }
    }
  }, [value, height, width]);

  return <svg ref={svgRef} className="max-w-full" />;
}
