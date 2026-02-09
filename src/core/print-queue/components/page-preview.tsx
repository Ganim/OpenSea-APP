/**
 * Page Preview
 * Preview do layout de página com múltiplas etiquetas
 */

'use client';

import { cn } from '@/lib/utils';
import { FileText, Layers } from 'lucide-react';
import { useMemo } from 'react';
import { SYSTEM_LABEL_TEMPLATES, LABEL_AVAILABLE_FIELDS } from '../constants';
import { usePrintQueue } from '../context/print-queue-context';
import type { LabelData, LabelTemplateDefinition } from '../types';
import {
  calculateLayoutInfo,
  getPaperDimensions,
  scaleLayoutToFit,
} from '../utils/page-layout-calculator';
import { resolveLabelData } from '../utils/label-data-resolver';

interface PagePreviewProps {
  className?: string;
  containerWidth?: number;
  containerHeight?: number;
  showInfo?: boolean;
}

export function PagePreview({
  className,
  containerWidth = 300,
  containerHeight = 400,
  showInfo = true,
}: PagePreviewProps) {
  const { state, totalLabels } = usePrintQueue();
  const {
    selectedTemplateId,
    selectedTemplateDimensions,
    pageSettings,
    items,
  } = state;

  const template: LabelTemplateDefinition | undefined = useMemo(() => {
    const systemTemplate = SYSTEM_LABEL_TEMPLATES.find(
      t => t.id === selectedTemplateId
    );
    if (systemTemplate) return systemTemplate;
    if (selectedTemplateDimensions) {
      return {
        id: selectedTemplateId,
        name: '',
        dimensions: selectedTemplateDimensions,
        isSystem: false,
        availableFields: LABEL_AVAILABLE_FIELDS,
        createdAt: new Date(),
      };
    }
    return undefined;
  }, [selectedTemplateId, selectedTemplateDimensions]);

  // Calcular layout
  const layoutInfo = useMemo(() => {
    if (!template) return null;
    return calculateLayoutInfo(template, pageSettings);
  }, [template, pageSettings]);

  // Calcular escala para caber no container
  const scale = useMemo(() => {
    if (!layoutInfo) return 1;
    return scaleLayoutToFit(
      layoutInfo.paperDimensions,
      { width: containerWidth, height: containerHeight },
      20
    );
  }, [layoutInfo, containerWidth, containerHeight]);

  // Preparar dados das etiquetas para preview (primeiras N)
  const previewLabels = useMemo(() => {
    if (!layoutInfo) return [];

    const labels: Array<LabelData | null> = [];
    let labelIndex = 0;

    for (const queueItem of items) {
      for (let copy = 0; copy < queueItem.copies; copy++) {
        if (labelIndex >= layoutInfo.labelsPerPage) break;
        if (queueItem.entityType === 'employee') {
          // Placeholder LabelData for employee items
          labels.push({
            manufacturerName: '',
            stockLocation: '',
            productName: queueItem.employee.fullName,
            productCode: '',
            variantName: queueItem.employee.position?.name || '',
            variantCode: '',
            itemCode: queueItem.employee.registrationNumber,
            itemUid: queueItem.employee.id,
            itemId: queueItem.employee.id,
            itemQuantity: 0,
            itemUnitOfMeasure: '',
            productVariantName: queueItem.employee.fullName,
            referenceVariantName: queueItem.employee.registrationNumber,
            productAttributes: {},
            variantAttributes: {},
            itemAttributes: {},
            barcodeData: queueItem.employee.registrationNumber,
            qrCodeData: queueItem.employee.id,
          });
        } else {
          labels.push(
            resolveLabelData(
              queueItem.item,
              queueItem.variant,
              queueItem.product
            )
          );
        }
        labelIndex++;
      }
      if (labelIndex >= layoutInfo.labelsPerPage) break;
    }

    // Preencher posições vazias com placeholders
    while (labels.length < layoutInfo.labelsPerPage) {
      labels.push(null);
    }

    return labels;
  }, [items, layoutInfo]);

  // Calcular número de páginas
  const totalPages = useMemo(() => {
    if (!layoutInfo || totalLabels === 0) return 0;
    return Math.ceil(totalLabels / layoutInfo.labelsPerPage);
  }, [layoutInfo, totalLabels]);

  if (!template || !layoutInfo) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center bg-gray-100 dark:bg-white/5 rounded-lg gap-2',
          className
        )}
        style={{ width: containerWidth, height: containerHeight }}
      >
        <FileText className="w-8 h-8 text-gray-400" />
        <p className="text-sm text-gray-500">Selecione um template</p>
      </div>
    );
  }

  const paperDimensions = getPaperDimensions(pageSettings);

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      {/* Paper preview */}
      <div className="relative">
        {/* Shadow pages behind (if more than 1 page) */}
        {totalPages > 1 && (
          <>
            <div
              className="absolute bg-gray-200 dark:bg-gray-700 rounded-sm"
              style={{
                width: paperDimensions.width * scale,
                height: paperDimensions.height * scale,
                top: 6,
                left: 6,
                zIndex: 0,
              }}
            />
            {totalPages > 2 && (
              <div
                className="absolute bg-gray-300 dark:bg-gray-600 rounded-sm"
                style={{
                  width: paperDimensions.width * scale,
                  height: paperDimensions.height * scale,
                  top: 12,
                  left: 12,
                  zIndex: -1,
                }}
              />
            )}
          </>
        )}

        {/* Main page */}
        <div
          className="relative bg-white shadow-lg border border-gray-300 dark:border-gray-600 rounded-sm overflow-hidden"
          style={{
            width: paperDimensions.width * scale,
            height: paperDimensions.height * scale,
          }}
        >
          {/* Margin indicators (subtle) */}
          <div
            className="absolute border border-dashed border-gray-200 dark:border-gray-300/30 pointer-events-none"
            style={{
              left: pageSettings.margins.left * scale,
              top: pageSettings.margins.top * scale,
              right: pageSettings.margins.right * scale,
              bottom: pageSettings.margins.bottom * scale,
              width: `calc(100% - ${(pageSettings.margins.left + pageSettings.margins.right) * scale}px)`,
              height: `calc(100% - ${(pageSettings.margins.top + pageSettings.margins.bottom) * scale}px)`,
            }}
          />

          {/* Labels grid */}
          {layoutInfo.positions.map((position, index) => {
            const labelData = previewLabels[index];
            const hasData = labelData !== null;

            return (
              <div
                key={index}
                className={cn(
                  'absolute border transition-colors',
                  hasData
                    ? 'border-blue-400/60 bg-blue-50 dark:bg-blue-500/20'
                    : 'border-dashed border-gray-300 dark:border-white/20 bg-gray-50/50 dark:bg-white/5'
                )}
                style={{
                  left: position.x * scale,
                  top: position.y * scale,
                  width: position.width * scale,
                  height: position.height * scale,
                }}
              >
                {hasData ? (
                  <MiniLabelContent
                    data={labelData}
                    scale={scale}
                    templateWidth={template.dimensions.width}
                  />
                ) : (
                  <EmptyLabelPlaceholder scale={scale} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Info section */}
      {showInfo && (
        <div className="flex flex-col items-center gap-1 text-xs text-gray-500 dark:text-white/50">
          {/* Layout info */}
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {layoutInfo.columns} × {layoutInfo.rows}
            </span>
            <span>=</span>
            <span>{layoutInfo.labelsPerPage} etiquetas/página</span>
          </div>

          {/* Total info */}
          {totalLabels > 0 && (
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>
                {totalLabels} etiqueta{totalLabels !== 1 && 's'} em{' '}
                <span className="font-medium">{totalPages}</span> página
                {totalPages !== 1 && 's'}
              </span>
            </div>
          )}

          {/* Paper size */}
          <div className="text-gray-400 dark:text-white/30">
            {pageSettings.paperSize === 'CUSTOM'
              ? `${pageSettings.customDimensions?.width || 210}×${pageSettings.customDimensions?.height || 297}mm`
              : pageSettings.paperSize}{' '}
            {pageSettings.orientation === 'landscape'
              ? '(paisagem)'
              : '(retrato)'}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// MINI LABEL CONTENT
// ============================================

interface MiniLabelContentProps {
  data: LabelData;
  scale: number;
  templateWidth: number;
}

function MiniLabelContent({
  data,
  scale,
  templateWidth,
}: MiniLabelContentProps) {
  // Ajustar tamanho da fonte baseado no tamanho da etiqueta
  const isSmall = templateWidth <= 35;
  const isLarge = templateWidth >= 80;

  const baseFontSize = isSmall ? 3 : isLarge ? 5 : 4;
  const fontSize = Math.max(4, baseFontSize * scale);

  return (
    <div
      className="w-full h-full flex flex-col p-0.5 overflow-hidden"
      style={{ fontSize, lineHeight: 1.2 }}
    >
      {isLarge ? (
        // Large label: show more info
        <>
          <div className="truncate font-semibold text-gray-800 dark:text-gray-200">
            {data.productName}
          </div>
          <div className="truncate text-gray-600 dark:text-gray-400">
            {data.variantName}
          </div>
          <div className="flex-1" />
          <div className="flex justify-between items-end">
            <span className="text-gray-500 dark:text-gray-500 font-mono">
              {data.itemCode}
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              {data.itemQuantity}
            </span>
          </div>
        </>
      ) : isSmall ? (
        // Small label: minimal info
        <>
          <div className="truncate font-semibold text-gray-800 dark:text-gray-200 text-center">
            {data.itemCode}
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full h-1 bg-gray-300 dark:bg-gray-600" />
          </div>
        </>
      ) : (
        // Medium label: balanced info
        <>
          <div className="truncate font-semibold text-gray-800 dark:text-gray-200">
            {data.productName}
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full h-1.5 bg-gray-300 dark:bg-gray-600" />
          </div>
          <div className="truncate text-gray-500 dark:text-gray-500 font-mono text-center">
            {data.itemCode}
          </div>
        </>
      )}
    </div>
  );
}

// ============================================
// EMPTY LABEL PLACEHOLDER
// ============================================

function EmptyLabelPlaceholder({ scale }: { scale: number }) {
  const iconSize = Math.max(8, 10 * scale);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <FileText
        className="text-gray-300 dark:text-white/20"
        style={{ width: iconSize, height: iconSize }}
      />
    </div>
  );
}
