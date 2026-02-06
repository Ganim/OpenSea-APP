'use client';

/**
 * Label Studio - Arrow Element Renderer
 * Renderiza elementos de seta
 */

import React from 'react';
import type { ArrowElement } from '../studio-types';
import { mmToPx } from '../utils/unitConverter';

interface ArrowElementRendererProps {
  element: ArrowElement;
  zoom: number;
}

/**
 * Renderiza elemento de seta
 */
export function ArrowElementRenderer({
  element,
  zoom,
}: ArrowElementRendererProps) {
  const { arrowStyle, headStyle, strokeWidth, color, width, height } = element;

  const widthPx = mmToPx(width, zoom);
  const heightPx = mmToPx(height, zoom);
  const strokeWidthPx = mmToPx(strokeWidth, zoom);

  // Tamanho da ponta da seta proporcional à espessura
  const headSize = strokeWidthPx * 4;
  const headWidth = headSize * 0.8;

  // Pontos da linha (horizontal por padrão)
  const startX = headStyle === 'none' ? 0 : headSize;
  const endX = widthPx - headSize;
  const centerY = heightPx / 2;

  // ID único para o marcador
  const markerId = `arrow-head-${element.id}`;
  const markerStartId = `arrow-head-start-${element.id}`;

  // Renderiza ponta da seta
  const renderArrowHead = (id: string, reversed = false) => {
    if (headStyle === 'none') return null;

    const path = reversed
      ? `M ${headSize} 0 L 0 ${headWidth / 2} L ${headSize} ${headWidth}`
      : `M 0 0 L ${headSize} ${headWidth / 2} L 0 ${headWidth}`;

    return (
      <marker
        id={id}
        markerWidth={headSize}
        markerHeight={headWidth}
        refX={reversed ? 0 : headSize}
        refY={headWidth / 2}
        orient="auto"
        markerUnits="userSpaceOnUse"
      >
        <path
          d={path}
          fill={headStyle === 'filled' ? color : 'none'}
          stroke={color}
          strokeWidth={strokeWidthPx / 2}
        />
      </marker>
    );
  };

  // Renderiza linha baseada no estilo
  const renderLine = () => {
    const lineStartX = arrowStyle === 'double' && headStyle !== 'none' ? headSize : 0;
    const lineEndX = headStyle !== 'none' ? widthPx - headSize : widthPx;

    switch (arrowStyle) {
      case 'curved': {
        // Linha curva usando curva de Bézier
        const controlY = centerY - heightPx * 0.3;
        return (
          <path
            d={`M ${lineStartX} ${centerY} Q ${widthPx / 2} ${controlY} ${lineEndX} ${centerY}`}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidthPx}
            markerEnd={headStyle !== 'none' ? `url(#${markerId})` : undefined}
          />
        );
      }

      case 'thick':
        // Seta com corpo mais grosso
        return (
          <path
            d={`M ${lineStartX} ${centerY - strokeWidthPx}
                L ${lineEndX} ${centerY - strokeWidthPx}
                L ${lineEndX} ${centerY - strokeWidthPx * 2}
                L ${widthPx} ${centerY}
                L ${lineEndX} ${centerY + strokeWidthPx * 2}
                L ${lineEndX} ${centerY + strokeWidthPx}
                L ${lineStartX} ${centerY + strokeWidthPx}
                Z`}
            fill={color}
            stroke="none"
          />
        );

      case 'double':
        // Seta dupla (pontas em ambos os lados)
        return (
          <line
            x1={lineStartX}
            y1={centerY}
            x2={lineEndX}
            y2={centerY}
            stroke={color}
            strokeWidth={strokeWidthPx}
            markerEnd={headStyle !== 'none' ? `url(#${markerId})` : undefined}
            markerStart={headStyle !== 'none' ? `url(#${markerStartId})` : undefined}
          />
        );

      default:
        // Seta simples
        return (
          <line
            x1={lineStartX}
            y1={centerY}
            x2={lineEndX}
            y2={centerY}
            stroke={color}
            strokeWidth={strokeWidthPx}
            markerEnd={headStyle !== 'none' ? `url(#${markerId})` : undefined}
          />
        );
    }
  };

  return (
    <svg
      width={widthPx}
      height={heightPx}
      viewBox={`0 0 ${widthPx} ${heightPx}`}
      style={{ display: 'block', overflow: 'visible' }}
    >
      <defs>
        {renderArrowHead(markerId)}
        {arrowStyle === 'double' && renderArrowHead(markerStartId, true)}
      </defs>
      {renderLine()}
    </svg>
  );
}

export default ArrowElementRenderer;
