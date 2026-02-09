'use client';

/**
 * Label Studio - Line Element Renderer
 * Renderiza elementos de linha
 */

import React from 'react';
import type { LineElement } from '../studio-types';
import { mmToPx } from '../utils/unitConverter';

interface LineElementRendererProps {
  element: LineElement;
  zoom: number;
}

/**
 * Converte strokeStyle para dasharray SVG
 */
function getStrokeDasharray(
  style: LineElement['strokeStyle']
): string | undefined {
  switch (style) {
    case 'dashed':
      return '8,4';
    case 'dotted':
      return '2,2';
    case 'double':
      return undefined; // Double é tratado diferente
    default:
      return undefined;
  }
}

/**
 * Renderiza elemento de linha
 */
export function LineElementRenderer({
  element,
  zoom,
}: LineElementRendererProps) {
  const { orientation, strokeWidth, strokeStyle, color, width, height } =
    element;

  const widthPx = mmToPx(width, zoom);
  const heightPx = mmToPx(height, zoom);
  const strokeWidthPx = mmToPx(strokeWidth, zoom);

  // Calcula pontos da linha baseado na orientação
  let x1 = 0,
    y1 = 0,
    x2 = widthPx,
    y2 = heightPx;

  switch (orientation) {
    case 'horizontal':
      x1 = 0;
      y1 = heightPx / 2;
      x2 = widthPx;
      y2 = heightPx / 2;
      break;
    case 'vertical':
      x1 = widthPx / 2;
      y1 = 0;
      x2 = widthPx / 2;
      y2 = heightPx;
      break;
    case 'diagonal':
      // Diagonal padrão: canto superior esquerdo ao inferior direito
      x1 = 0;
      y1 = 0;
      x2 = widthPx;
      y2 = heightPx;
      break;
  }

  // Linha dupla
  if (strokeStyle === 'double') {
    const offset = strokeWidthPx * 1.5;
    return (
      <svg
        width={widthPx}
        height={heightPx}
        viewBox={`0 0 ${widthPx} ${heightPx}`}
        style={{ display: 'block', overflow: 'visible' }}
      >
        <line
          x1={x1}
          y1={y1 - offset / 2}
          x2={x2}
          y2={y2 - offset / 2}
          stroke={color}
          strokeWidth={strokeWidthPx / 2}
        />
        <line
          x1={x1}
          y1={y1 + offset / 2}
          x2={x2}
          y2={y2 + offset / 2}
          stroke={color}
          strokeWidth={strokeWidthPx / 2}
        />
      </svg>
    );
  }

  return (
    <svg
      width={widthPx}
      height={heightPx}
      viewBox={`0 0 ${widthPx} ${heightPx}`}
      style={{ display: 'block', overflow: 'visible' }}
    >
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={strokeWidthPx}
        strokeDasharray={getStrokeDasharray(strokeStyle)}
        strokeLinecap="round"
      />
    </svg>
  );
}

export default LineElementRenderer;
