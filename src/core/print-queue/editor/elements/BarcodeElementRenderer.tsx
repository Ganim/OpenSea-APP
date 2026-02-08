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
 * Resolve um caminho em um objeto
 */
function resolvePath(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((current, key) => {
    if (current && typeof current === 'object') {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

/**
 * Gera o valor do barcode baseado na configuração
 * Sem previewData: retorna placeholder genérico
 * Com previewData: resolve valores reais
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
        const value = resolvePath(previewData, config.dataPath);
        if (value) return String(value);
      }
      // Sem previewData: valor genérico para renderizar um barcode válido
      return '0000000000000';

    case 'composite':
      if (config.template) {
        return config.template.replace(/\{([^}]+)\}/g, (_, path: string) => {
          if (previewData) {
            const value = resolvePath(previewData, path);
            if (value) return String(value);
          }
          return '000';
        });
      }
      return '0000000000000';

    default:
      return '0000000000000';
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

  // Clear error when format changes to allow re-render attempt
  const prevFormatRef = useRef(barcodeConfig.format);
  useEffect(() => {
    if (prevFormatRef.current !== barcodeConfig.format) {
      setError(null);
      prevFormatRef.current = barcodeConfig.format;
    }
  }, [barcodeConfig.format]);

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
