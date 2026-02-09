'use client';

/**
 * Label Studio - Selection Box Component
 * Mostra a caixa de seleção e handles de redimensionamento
 */

import React, { useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { mmToPx, pxToMm } from '../utils/unitConverter';

interface SelectionBoxProps {
  x: number; // em mm
  y: number; // em mm
  width: number; // em mm
  height: number; // em mm
  zoom: number;
  rotation?: number;
  locked?: boolean;
  isMultiple?: boolean;
  onResizeStart?: (anchor: string, e: React.MouseEvent) => void;
  onRotateStart?: (corner: string, e: React.MouseEvent) => void;
}

/**
 * Handles de redimensionamento
 */
const RESIZE_HANDLES = [
  { id: 'nw', cursor: 'nwse-resize', position: { top: -4, left: -4 } },
  {
    id: 'n',
    cursor: 'ns-resize',
    position: { top: -4, left: '50%', transform: 'translateX(-50%)' },
  },
  { id: 'ne', cursor: 'nesw-resize', position: { top: -4, right: -4 } },
  {
    id: 'e',
    cursor: 'ew-resize',
    position: { top: '50%', right: -4, transform: 'translateY(-50%)' },
  },
  { id: 'se', cursor: 'nwse-resize', position: { bottom: -4, right: -4 } },
  {
    id: 's',
    cursor: 'ns-resize',
    position: { bottom: -4, left: '50%', transform: 'translateX(-50%)' },
  },
  { id: 'sw', cursor: 'nesw-resize', position: { bottom: -4, left: -4 } },
  {
    id: 'w',
    cursor: 'ew-resize',
    position: { top: '50%', left: -4, transform: 'translateY(-50%)' },
  },
] as const;

/**
 * Componente de caixa de seleção
 */
export function SelectionBox({
  x,
  y,
  width,
  height,
  zoom,
  rotation = 0,
  locked = false,
  isMultiple = false,
  onResizeStart,
  onRotateStart,
}: SelectionBoxProps) {
  const boxRef = useRef<HTMLDivElement>(null);

  // Converte para pixels
  const xPx = mmToPx(x, zoom);
  const yPx = mmToPx(y, zoom);
  const widthPx = mmToPx(width, zoom);
  const heightPx = mmToPx(height, zoom);

  const handleResizeMouseDown = useCallback(
    (anchor: string, e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (!locked && onResizeStart) {
        onResizeStart(anchor, e);
      }
    },
    [locked, onResizeStart]
  );

  return (
    <div
      ref={boxRef}
      className="absolute pointer-events-none"
      style={{
        left: xPx,
        top: yPx,
        width: widthPx,
        height: heightPx,
        transform: rotation ? `rotate(${rotation}deg)` : undefined,
        transformOrigin: 'center center',
      }}
    >
      {/* Borda de seleção */}
      <div
        className={cn(
          'absolute inset-0 border-2',
          locked
            ? 'border-slate-400 border-dashed'
            : isMultiple
              ? 'border-purple-500'
              : 'border-blue-600 shadow-[0_0_0_1px_rgba(37,99,235,0.2)]'
        )}
      />

      {/* Handles de redimensionamento (não mostrar se locked ou seleção múltipla) */}
      {!locked && !isMultiple && (
        <>
          {RESIZE_HANDLES.map(handle => (
            <div
              key={handle.id}
              className="absolute w-2 h-2 bg-white border-2 border-blue-600 rounded-sm pointer-events-auto shadow-[0_0_0_1px_rgba(0,0,0,0.15)]"
              style={{
                ...handle.position,
                cursor: handle.cursor,
              }}
              onMouseDown={e => handleResizeMouseDown(handle.id, e)}
            />
          ))}

          {/* Rotation zones at corners (invisible, outside resize handles) */}
          {onRotateStart && (
            <>
              {(['nw', 'ne', 'se', 'sw'] as const).map(corner => {
                const posStyle: React.CSSProperties = {
                  width: 16,
                  height: 16,
                  position: 'absolute',
                  cursor: 'alias',
                };
                if (corner.includes('n')) posStyle.top = -22;
                if (corner.includes('s')) posStyle.bottom = -22;
                if (corner.includes('w')) posStyle.left = -22;
                if (corner.includes('e')) posStyle.right = -22;

                return (
                  <div
                    key={`rotate-${corner}`}
                    className="pointer-events-auto"
                    style={posStyle}
                    onMouseDown={e => {
                      e.stopPropagation();
                      e.preventDefault();
                      onRotateStart(corner, e);
                    }}
                  />
                );
              })}
            </>
          )}
        </>
      )}

      {/* Indicador de bloqueio */}
      {locked && (
        <div
          className="absolute top-1 right-1 w-4 h-4 bg-slate-500 rounded-sm flex items-center justify-center"
          title="Elemento bloqueado"
        >
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

/**
 * Caixa de seleção múltipla (bounding box de vários elementos)
 */
export function MultiSelectionBox({
  elements,
  zoom,
}: {
  elements: Array<{ x: number; y: number; width: number; height: number }>;
  zoom: number;
}) {
  if (elements.length < 2) return null;

  // Calcula bounding box de todos os elementos
  const bounds = elements.reduce(
    (acc, el) => ({
      minX: Math.min(acc.minX, el.x),
      minY: Math.min(acc.minY, el.y),
      maxX: Math.max(acc.maxX, el.x + el.width),
      maxY: Math.max(acc.maxY, el.y + el.height),
    }),
    {
      minX: Infinity,
      minY: Infinity,
      maxX: -Infinity,
      maxY: -Infinity,
    }
  );

  const padding = 2; // mm de padding visual
  const xPx = mmToPx(bounds.minX - padding, zoom);
  const yPx = mmToPx(bounds.minY - padding, zoom);
  const widthPx = mmToPx(bounds.maxX - bounds.minX + padding * 2, zoom);
  const heightPx = mmToPx(bounds.maxY - bounds.minY + padding * 2, zoom);

  return (
    <div
      className="absolute pointer-events-none border-2 border-dashed border-purple-400"
      style={{
        left: xPx,
        top: yPx,
        width: widthPx,
        height: heightPx,
      }}
    />
  );
}

export default SelectionBox;
