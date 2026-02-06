'use client';

/**
 * Label Studio - Canvas Component
 * Área de edição principal com zoom, pan e grid
 */

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useEditorStore } from '../stores/editorStore';
import { mmToPx, pxToMm, calculateFitZoom } from '../utils/unitConverter';
import { cn } from '@/lib/utils';

interface CanvasProps {
  className?: string;
  children?: React.ReactNode;
}

/**
 * Componente Canvas do Label Studio
 */
export function Canvas({ className, children }: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Store state
  const canvasWidth = useEditorStore((s) => s.canvasWidth);
  const canvasHeight = useEditorStore((s) => s.canvasHeight);
  const canvasConfig = useEditorStore((s) => s.canvasConfig);
  const zoom = useEditorStore((s) => s.zoom);
  const panOffset = useEditorStore((s) => s.panOffset);
  const showGrid = useEditorStore((s) => s.showGrid);
  const gridSize = useEditorStore((s) => s.gridSize);
  const isPanning = useEditorStore((s) => s.isPanning);
  const selectedIds = useEditorStore((s) => s.selectedIds);

  // Store actions
  const setZoom = useEditorStore((s) => s.setZoom);
  const setPanOffset = useEditorStore((s) => s.setPanOffset);
  const setPanning = useEditorStore((s) => s.setPanning);
  const clearSelection = useEditorStore((s) => s.clearSelection);
  const fitToScreen = useEditorStore((s) => s.fitToScreen);

  // Observe container size
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Calcula dimensões do canvas em pixels
  const canvasWidthPx = mmToPx(canvasWidth, zoom);
  const canvasHeightPx = mmToPx(canvasHeight, zoom);

  // Handle wheel for zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoom(zoom + delta);
      } else if (e.shiftKey) {
        // Horizontal pan with shift
        setPanOffset({
          x: panOffset.x - e.deltaY,
          y: panOffset.y,
        });
      } else {
        // Vertical pan
        setPanOffset({
          x: panOffset.x - e.deltaX,
          y: panOffset.y - e.deltaY,
        });
      }
    },
    [zoom, panOffset, setZoom, setPanOffset]
  );

  // Handle mouse down for panning
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Middle mouse button or space+click for pan
      if (e.button === 1) {
        e.preventDefault();
        setPanning(true);
      }
    },
    [setPanning]
  );

  // Handle mouse move for panning
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) {
        setPanOffset({
          x: panOffset.x + e.movementX,
          y: panOffset.y + e.movementY,
        });
      }
    },
    [isPanning, panOffset, setPanOffset]
  );

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    if (isPanning) {
      setPanning(false);
    }
  }, [isPanning, setPanning]);

  // Click on canvas background clears selection
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && selectedIds.length > 0) {
        clearSelection();
      }
    },
    [selectedIds, clearSelection]
  );

  // Fit to screen on double click
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        const newZoom = calculateFitZoom(
          canvasWidth,
          canvasHeight,
          containerSize.width,
          containerSize.height
        );
        setZoom(newZoom);
        setPanOffset({ x: 0, y: 0 });
      }
    },
    [canvasWidth, canvasHeight, containerSize, setZoom, setPanOffset]
  );

  // Render grid pattern
  const renderGrid = () => {
    if (!showGrid) return null;

    const gridSizePx = mmToPx(gridSize, zoom);
    const patternId = `grid-pattern-${gridSize}`;

    return (
      <svg
        className="absolute inset-0 pointer-events-none"
        width="100%"
        height="100%"
      >
        <defs>
          <pattern
            id={patternId}
            width={gridSizePx}
            height={gridSizePx}
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx={gridSizePx / 2}
              cy={gridSizePx / 2}
              r={0.5}
              fill="#d1d5db"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    );
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden bg-neutral-100 dark:bg-neutral-900',
        isPanning && 'cursor-grabbing',
        className
      )}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Workspace area (panned) */}
      <div
        className="absolute"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
          left: '50%',
          top: '50%',
          marginLeft: -canvasWidthPx / 2,
          marginTop: -canvasHeightPx / 2,
        }}
      >
        {/* Canvas shadow */}
        <div
          className="absolute rounded-sm"
          style={{
            width: canvasWidthPx,
            height: canvasHeightPx,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            transform: 'translate(4px, 4px)',
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
          }}
        />

        {/* Canvas */}
        <div
          className="relative border border-neutral-300 dark:border-neutral-600"
          style={{
            width: canvasWidthPx,
            height: canvasHeightPx,
            backgroundColor: canvasConfig.backgroundColor,
          }}
          onClick={handleCanvasClick}
          onDoubleClick={handleDoubleClick}
        >
          {/* Grid */}
          {renderGrid()}

          {/* Margins (if enabled) */}
          {canvasConfig.showMargins && canvasConfig.margins && (
            <div
              className="absolute border border-dashed border-blue-300 pointer-events-none"
              style={{
                top: mmToPx(canvasConfig.margins.top, zoom),
                right: mmToPx(canvasConfig.margins.right, zoom),
                bottom: mmToPx(canvasConfig.margins.bottom, zoom),
                left: mmToPx(canvasConfig.margins.left, zoom),
              }}
            />
          )}

          {/* Elements container */}
          <div className="absolute inset-0">
            {children}
          </div>
        </div>
      </div>

      {/* Canvas info overlay */}
      <div className="absolute bottom-2 left-2 flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 bg-white/80 dark:bg-neutral-800/80 px-2 py-1 rounded">
        <span>{canvasWidth} × {canvasHeight} mm</span>
        <span className="text-neutral-300 dark:text-neutral-600">|</span>
        <span>{Math.round(zoom * 100)}%</span>
      </div>
    </div>
  );
}

export default Canvas;
