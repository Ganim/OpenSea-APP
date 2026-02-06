'use client';

/**
 * Label Studio - Snap Guides Component
 * Renderiza as guias visuais de snap no canvas
 */

import React from 'react';
import type { SnapGuide } from '../studio-types';
import { mmToPx } from '../utils/unitConverter';

interface SnapGuidesProps {
  guides: SnapGuide[];
  zoom: number;
  canvasWidth: number;
  canvasHeight: number;
}

/**
 * Cores para diferentes fontes de guia
 */
const GUIDE_COLORS: Record<SnapGuide['source'], string> = {
  canvas: '#3b82f6', // blue-500
  element: '#22c55e', // green-500
  center: '#f59e0b', // amber-500
};

/**
 * Componente de guias de snap
 */
export function SnapGuides({
  guides,
  zoom,
  canvasWidth,
  canvasHeight,
}: SnapGuidesProps) {
  if (guides.length === 0) return null;

  const canvasWidthPx = mmToPx(canvasWidth, zoom);
  const canvasHeightPx = mmToPx(canvasHeight, zoom);

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={canvasWidthPx}
      height={canvasHeightPx}
      style={{ overflow: 'visible' }}
    >
      {guides.map((guide, index) => {
        const color = GUIDE_COLORS[guide.source];
        const positionPx = mmToPx(guide.position, zoom);

        if (guide.type === 'vertical') {
          return (
            <g key={`guide-${index}`}>
              {/* Linha principal */}
              <line
                x1={positionPx}
                y1={-10}
                x2={positionPx}
                y2={canvasHeightPx + 10}
                stroke={color}
                strokeWidth={1}
                strokeDasharray="4 2"
                opacity={0.8}
              />
              {/* Indicadores nas extremidades */}
              <circle
                cx={positionPx}
                cy={-5}
                r={3}
                fill={color}
                opacity={0.8}
              />
              <circle
                cx={positionPx}
                cy={canvasHeightPx + 5}
                r={3}
                fill={color}
                opacity={0.8}
              />
            </g>
          );
        } else {
          return (
            <g key={`guide-${index}`}>
              {/* Linha principal */}
              <line
                x1={-10}
                y1={positionPx}
                x2={canvasWidthPx + 10}
                y2={positionPx}
                stroke={color}
                strokeWidth={1}
                strokeDasharray="4 2"
                opacity={0.8}
              />
              {/* Indicadores nas extremidades */}
              <circle
                cx={-5}
                cy={positionPx}
                r={3}
                fill={color}
                opacity={0.8}
              />
              <circle
                cx={canvasWidthPx + 5}
                cy={positionPx}
                r={3}
                fill={color}
                opacity={0.8}
              />
            </g>
          );
        }
      })}
    </svg>
  );
}

/**
 * Guia de centro (sempre visível quando snap ao centro está ativo)
 */
export function CenterGuides({
  show,
  zoom,
  canvasWidth,
  canvasHeight,
}: {
  show: boolean;
  zoom: number;
  canvasWidth: number;
  canvasHeight: number;
}) {
  if (!show) return null;

  const canvasWidthPx = mmToPx(canvasWidth, zoom);
  const canvasHeightPx = mmToPx(canvasHeight, zoom);
  const centerXPx = canvasWidthPx / 2;
  const centerYPx = canvasHeightPx / 2;

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={canvasWidthPx}
      height={canvasHeightPx}
    >
      {/* Linha vertical central (muito sutil) */}
      <line
        x1={centerXPx}
        y1={0}
        x2={centerXPx}
        y2={canvasHeightPx}
        stroke="#d1d5db"
        strokeWidth={1}
        strokeDasharray="2 4"
        opacity={0.3}
      />
      {/* Linha horizontal central (muito sutil) */}
      <line
        x1={0}
        y1={centerYPx}
        x2={canvasWidthPx}
        y2={centerYPx}
        stroke="#d1d5db"
        strokeWidth={1}
        strokeDasharray="2 4"
        opacity={0.3}
      />
    </svg>
  );
}

/**
 * Guias de margem (se habilitadas)
 */
export function MarginGuides({
  show,
  zoom,
  canvasWidth,
  canvasHeight,
  margins,
}: {
  show: boolean;
  zoom: number;
  canvasWidth: number;
  canvasHeight: number;
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}) {
  if (!show) return null;

  const canvasWidthPx = mmToPx(canvasWidth, zoom);
  const canvasHeightPx = mmToPx(canvasHeight, zoom);

  const topPx = mmToPx(margins.top, zoom);
  const rightPx = canvasWidthPx - mmToPx(margins.right, zoom);
  const bottomPx = canvasHeightPx - mmToPx(margins.bottom, zoom);
  const leftPx = mmToPx(margins.left, zoom);

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={canvasWidthPx}
      height={canvasHeightPx}
    >
      {/* Top margin */}
      <line
        x1={0}
        y1={topPx}
        x2={canvasWidthPx}
        y2={topPx}
        stroke="#93c5fd"
        strokeWidth={1}
        strokeDasharray="4 2"
        opacity={0.5}
      />
      {/* Right margin */}
      <line
        x1={rightPx}
        y1={0}
        x2={rightPx}
        y2={canvasHeightPx}
        stroke="#93c5fd"
        strokeWidth={1}
        strokeDasharray="4 2"
        opacity={0.5}
      />
      {/* Bottom margin */}
      <line
        x1={0}
        y1={bottomPx}
        x2={canvasWidthPx}
        y2={bottomPx}
        stroke="#93c5fd"
        strokeWidth={1}
        strokeDasharray="4 2"
        opacity={0.5}
      />
      {/* Left margin */}
      <line
        x1={leftPx}
        y1={0}
        x2={leftPx}
        y2={canvasHeightPx}
        stroke="#93c5fd"
        strokeWidth={1}
        strokeDasharray="4 2"
        opacity={0.5}
      />
    </svg>
  );
}

export default SnapGuides;
