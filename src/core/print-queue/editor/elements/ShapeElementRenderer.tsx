'use client';

/**
 * Label Studio - Shape Element Renderer
 * Renderiza elementos de forma (retângulo, círculo, etc)
 */

import React from 'react';
import type { ShapeElement } from '../studio-types';
import { mmToPx } from '../utils/unitConverter';

interface ShapeElementRendererProps {
  element: ShapeElement;
  zoom: number;
}

/**
 * Renderiza elemento de forma
 */
export function ShapeElementRenderer({
  element,
  zoom,
}: ShapeElementRendererProps) {
  const { shapeType, fill, stroke, borderRadius, width, height } = element;

  const widthPx = mmToPx(width, zoom);
  const heightPx = mmToPx(height, zoom);
  const strokeWidthPx = mmToPx(stroke.width, zoom);
  const borderRadiusPx = borderRadius ? mmToPx(borderRadius, zoom) : 0;

  // Estilo base
  const baseStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
  };

  // Renderiza baseado no tipo
  switch (shapeType) {
    case 'rectangle':
      return (
        <div
          style={{
            ...baseStyle,
            backgroundColor: fill,
            border:
              stroke.style !== 'none'
                ? `${strokeWidthPx}px ${stroke.style} ${stroke.color}`
                : undefined,
            borderRadius: borderRadiusPx,
          }}
        />
      );

    case 'circle':
      return (
        <div
          style={{
            ...baseStyle,
            backgroundColor: fill,
            border:
              stroke.style !== 'none'
                ? `${strokeWidthPx}px ${stroke.style} ${stroke.color}`
                : undefined,
            borderRadius: '50%',
          }}
        />
      );

    case 'ellipse':
      return (
        <div
          style={{
            ...baseStyle,
            backgroundColor: fill,
            border:
              stroke.style !== 'none'
                ? `${strokeWidthPx}px ${stroke.style} ${stroke.color}`
                : undefined,
            borderRadius: '50%',
          }}
        />
      );

    case 'triangle':
      // SVG para triângulo
      return (
        <svg
          width={widthPx}
          height={heightPx}
          viewBox={`0 0 ${widthPx} ${heightPx}`}
          style={{ display: 'block' }}
        >
          <polygon
            points={`${widthPx / 2},0 ${widthPx},${heightPx} 0,${heightPx}`}
            fill={fill}
            stroke={stroke.style !== 'none' ? stroke.color : 'none'}
            strokeWidth={strokeWidthPx}
            strokeDasharray={
              stroke.style === 'dashed'
                ? '8,4'
                : stroke.style === 'dotted'
                  ? '2,2'
                  : undefined
            }
          />
        </svg>
      );

    case 'diamond':
      // SVG para losango
      return (
        <svg
          width={widthPx}
          height={heightPx}
          viewBox={`0 0 ${widthPx} ${heightPx}`}
          style={{ display: 'block' }}
        >
          <polygon
            points={`${widthPx / 2},0 ${widthPx},${heightPx / 2} ${widthPx / 2},${heightPx} 0,${heightPx / 2}`}
            fill={fill}
            stroke={stroke.style !== 'none' ? stroke.color : 'none'}
            strokeWidth={strokeWidthPx}
            strokeDasharray={
              stroke.style === 'dashed'
                ? '8,4'
                : stroke.style === 'dotted'
                  ? '2,2'
                  : undefined
            }
          />
        </svg>
      );

    default:
      return null;
  }
}

export default ShapeElementRenderer;
