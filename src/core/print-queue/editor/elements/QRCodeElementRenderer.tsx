'use client';

/**
 * Label Studio - QR Code Element Renderer
 * Renderiza elementos de QR Code
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { QRCodeElement } from '../studio-types';
import { mmToPx } from '../utils/unitConverter';

interface QRCodeElementRendererProps {
  element: QRCodeElement;
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
 * Gera o conteúdo do QR Code baseado na configuração
 */
function getQRContent(
  config: QRCodeElement['qrConfig'],
  previewData?: Record<string, unknown>
): string {
  switch (config.contentType) {
    case 'field':
      if (previewData && config.dataPath) {
        const value = resolvePath(previewData, config.dataPath);
        if (value) return String(value);
      }
      return 'ITM-2024-001'; // Exemplo

    case 'composite':
      if (config.template) {
        return config.template.replace(/\{([^}]+)\}/g, (_, path) => {
          if (previewData) {
            const value = resolvePath(previewData, path);
            if (value) return String(value);
          }
          return 'exemplo';
        });
      }
      return 'composição exemplo';

    case 'url':
      if (config.urlBase) {
        const param = config.urlParam && previewData
          ? String(resolvePath(previewData, config.urlParam) || 'ITM-001')
          : 'ITM-001';
        return `${config.urlBase}${param}`;
      }
      return 'https://example.com/item/ITM-001';

    case 'vcard':
      if (config.vcard) {
        const { name, phone, email } = config.vcard;
        return [
          'BEGIN:VCARD',
          'VERSION:3.0',
          name ? `FN:${name}` : 'FN:Nome',
          phone ? `TEL:${phone}` : '',
          email ? `EMAIL:${email}` : '',
          'END:VCARD',
        ]
          .filter(Boolean)
          .join('\n');
      }
      return 'BEGIN:VCARD\nVERSION:3.0\nFN:Exemplo\nEND:VCARD';

    case 'custom':
      return config.template || 'QR Code';

    default:
      return 'QR Code';
  }
}

/**
 * Renderiza elemento de QR Code
 */
export function QRCodeElementRenderer({
  element,
  zoom,
  previewData,
}: QRCodeElementRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const { qrConfig, width, height } = element;

  const content = useMemo(
    () => getQRContent(qrConfig, previewData),
    [qrConfig, previewData]
  );

  const sizePx = Math.min(mmToPx(width, zoom), mmToPx(height, zoom));

  // Renderiza o QR Code usando qrcode (lazy-loaded)
  useEffect(() => {
    if (!canvasRef.current) return;

    let cancelled = false;

    import('qrcode')
      .then(QRCode => {
        if (cancelled || !canvasRef.current) return;

        QRCode.toCanvas(
          canvasRef.current,
          content,
          {
            width: sizePx,
            margin: 1,
            errorCorrectionLevel: qrConfig.errorCorrectionLevel,
            color: {
              dark: qrConfig.moduleColor,
              light: qrConfig.backgroundColor,
            },
          },
          (err: Error | null | undefined) => {
            if (!cancelled) {
              setError(err ? 'Erro ao gerar QR Code' : null);
            }
          }
        );
      })
      .catch(() => {
        if (!cancelled) {
          setError('qrcode não disponível');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [content, qrConfig, sizePx]);

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-red-50 border border-red-200 text-red-500 text-xs">
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div
      className="w-full h-full flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: qrConfig.backgroundColor }}
    >
      <canvas
        ref={canvasRef}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
}

export default QRCodeElementRenderer;
