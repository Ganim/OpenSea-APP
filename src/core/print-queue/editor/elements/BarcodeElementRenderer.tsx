'use client';

/**
 * Label Studio - Barcode Element Renderer
 * Renderiza elementos de código de barras usando JsBarcode
 */

import React, { useRef, useEffect, useState, useMemo } from 'react';
import type { BarcodeElement } from '../studio-types';
import { mmToPx } from '../utils/unitConverter';

interface BarcodeElementRendererProps {
  element: BarcodeElement;
  zoom: number;
  previewData?: Record<string, unknown>;
}

/**
 * Gera o valor do barcode baseado na configuração
 */
function getBarcodeValue(
  config: BarcodeElement['barcodeConfig'],
  previewData?: Record<string, unknown>
): string {
  switch (config.source) {
    case 'custom':
      return config.customValue || '123456789';

    case 'field':
      if (previewData && config.dataPath) {
        const value = config.dataPath
          .split('.')
          .reduce<unknown>((obj, key) => {
            if (obj && typeof obj === 'object') {
              return (obj as Record<string, unknown>)[key];
            }
            return undefined;
          }, previewData);
        if (value) return String(value);
      }
      return '7891234567890'; // Exemplo

    case 'composite':
      if (config.template) {
        return config.template.replace(/\{([^}]+)\}/g, (_, path: string) => {
          if (previewData) {
            const value = path.split('.').reduce(
              (obj: unknown, key: string): unknown => {
                if (obj && typeof obj === 'object') {
                  return (obj as Record<string, unknown>)[key];
                }
                return undefined;
              },
              previewData as unknown
            );
            if (value) return String(value);
          }
          return '000';
        });
      }
      return '123456789';

    default:
      return '123456789';
  }
}

/**
 * Renderiza elemento de barcode
 */
export function BarcodeElementRenderer({
  element,
  zoom,
  previewData,
}: BarcodeElementRendererProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [error, setError] = useState<string | null>(null);
  const { barcodeConfig, width, height } = element;

  const value = useMemo(
    () => getBarcodeValue(barcodeConfig, previewData),
    [barcodeConfig, previewData]
  );

  const widthPx = mmToPx(width, zoom);
  const heightPx = mmToPx(height, zoom);

  // Renderiza o barcode usando JsBarcode (lazy-loaded)
  useEffect(() => {
    if (!svgRef.current) return;

    let cancelled = false;

    import('jsbarcode')
      .then(JsBarcode => {
        if (cancelled || !svgRef.current) return;

        try {
          JsBarcode.default(svgRef.current, value, {
            format: barcodeConfig.format,
            width: Math.max(1, widthPx / 100),
            height: heightPx * (barcodeConfig.showText ? 0.75 : 0.95),
            displayValue: barcodeConfig.showText,
            fontSize: Math.max(8, mmToPx(2, zoom)),
            margin: 2,
            background: barcodeConfig.backgroundColor,
            lineColor: barcodeConfig.barColor,
          });
          setError(null);
        } catch (err) {
          setError('Valor inválido para o formato');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('JsBarcode não disponível');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [value, barcodeConfig, widthPx, heightPx, zoom]);

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-red-50 border border-red-200 text-red-500 text-xs">
        <span>{error}</span>
        <span className="text-red-400 mt-1 font-mono">{value}</span>
      </div>
    );
  }

  return (
    <div
      className="w-full h-full flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: barcodeConfig.backgroundColor }}
    >
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
}

export default BarcodeElementRenderer;
