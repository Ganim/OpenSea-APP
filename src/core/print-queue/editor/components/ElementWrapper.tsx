'use client';

/**
 * Label Studio - Element Wrapper Component
 * Wrapper para elementos que adiciona interatividade (drag, resize, select)
 */

import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useEditorStore } from '../stores/editorStore';
import { mmToPx, pxToMm } from '../utils/unitConverter';
import { calculateSnap, calculateResizeSnap, DEFAULT_SNAP_CONFIG } from '../utils/snapCalculator';
import { SelectionBox } from './SelectionBox';
import { cn } from '@/lib/utils';
import type { LabelElement, SnapResult } from '../studio-types';

interface ElementWrapperProps {
  element: LabelElement;
  zoom: number;
  children: React.ReactNode;
}

/**
 * Wrapper interativo para elementos
 */
export function ElementWrapper({ element, zoom, children }: ElementWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [localPosition, setLocalPosition] = useState({ x: element.x, y: element.y });
  const [localSize, setLocalSize] = useState({ width: element.width, height: element.height });
  const [isDraggingLocal, setIsDraggingLocal] = useState(false);
  const [isResizingLocal, setIsResizingLocal] = useState(false);
  const [resizeAnchor, setResizeAnchor] = useState<string | null>(null);

  // Store state
  const selectedIds = useEditorStore(s => s.selectedIds);
  const hoveredId = useEditorStore(s => s.hoveredId);
  const elements = useEditorStore(s => s.elements);
  const canvasWidth = useEditorStore(s => s.canvasWidth);
  const canvasHeight = useEditorStore(s => s.canvasHeight);
  const snapEnabled = useEditorStore(s => s.snapEnabled);
  const snapThreshold = useEditorStore(s => s.snapThreshold);
  const gridSize = useEditorStore(s => s.gridSize);

  // Store actions
  const selectElements = useEditorStore(s => s.selectElements);
  const setHoveredId = useEditorStore(s => s.setHoveredId);
  const updateElement = useEditorStore(s => s.updateElement);
  const setDragging = useEditorStore(s => s.setDragging);
  const setResizing = useEditorStore(s => s.setResizing);
  const setSnapGuides = useEditorStore(s => s.setSnapGuides);

  const isSelected = selectedIds.includes(element.id);
  const isHovered = hoveredId === element.id;
  const isMultiSelect = selectedIds.length > 1 && isSelected;

  // Sync local state with element props
  useEffect(() => {
    if (!isDraggingLocal && !isResizingLocal) {
      setLocalPosition({ x: element.x, y: element.y });
      setLocalSize({ width: element.width, height: element.height });
    }
  }, [element.x, element.y, element.width, element.height, isDraggingLocal, isResizingLocal]);

  // Referência para posição inicial do drag
  const dragStartRef = useRef<{
    mouseX: number;
    mouseY: number;
    elementX: number;
    elementY: number;
  } | null>(null);

  // Referência para resize
  const resizeStartRef = useRef<{
    mouseX: number;
    mouseY: number;
    elementX: number;
    elementY: number;
    elementWidth: number;
    elementHeight: number;
  } | null>(null);

  // === DRAG HANDLERS ===
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (element.locked) return;
      if (e.button !== 0) return; // Só botão esquerdo

      e.stopPropagation();

      // Seleciona o elemento
      if (e.shiftKey || e.ctrlKey || e.metaKey) {
        selectElements([element.id], true);
      } else if (!isSelected) {
        selectElements([element.id]);
      }

      // Inicia drag
      dragStartRef.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        elementX: element.x,
        elementY: element.y,
      };
      setIsDraggingLocal(true);
      setDragging(true);
    },
    [element.id, element.x, element.y, element.locked, isSelected, selectElements, setDragging]
  );

  // === RESIZE HANDLERS ===
  const handleResizeStart = useCallback(
    (anchor: string, e: React.MouseEvent) => {
      if (element.locked) return;

      resizeStartRef.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        elementX: element.x,
        elementY: element.y,
        elementWidth: element.width,
        elementHeight: element.height,
      };
      setResizeAnchor(anchor);
      setIsResizingLocal(true);
      setResizing(true);
    },
    [element.x, element.y, element.width, element.height, element.locked, setResizing]
  );

  // === GLOBAL MOUSE HANDLERS ===
  useEffect(() => {
    if (!isDraggingLocal && !isResizingLocal) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDraggingLocal && dragStartRef.current) {
        const deltaXPx = e.clientX - dragStartRef.current.mouseX;
        const deltaYPx = e.clientY - dragStartRef.current.mouseY;
        const deltaXMm = pxToMm(deltaXPx, zoom);
        const deltaYMm = pxToMm(deltaYPx, zoom);

        let newX = dragStartRef.current.elementX + deltaXMm;
        let newY = dragStartRef.current.elementY + deltaYMm;

        // Aplica snap
        if (snapEnabled) {
          const snapConfig = {
            ...DEFAULT_SNAP_CONFIG,
            enabled: snapEnabled,
            threshold: snapThreshold,
            gridSize,
          };

          const snapResult = calculateSnap(
            { x: newX, y: newY, width: element.width, height: element.height },
            elements,
            canvasWidth,
            canvasHeight,
            snapConfig,
            [element.id]
          );

          newX = snapResult.snappedX;
          newY = snapResult.snappedY;
          setSnapGuides(snapResult.guides);
        }

        // Clamp para dentro do canvas
        newX = Math.max(0, Math.min(canvasWidth - element.width, newX));
        newY = Math.max(0, Math.min(canvasHeight - element.height, newY));

        setLocalPosition({ x: newX, y: newY });
      }

      if (isResizingLocal && resizeStartRef.current && resizeAnchor) {
        const deltaXPx = e.clientX - resizeStartRef.current.mouseX;
        const deltaYPx = e.clientY - resizeStartRef.current.mouseY;
        const deltaXMm = pxToMm(deltaXPx, zoom);
        const deltaYMm = pxToMm(deltaYPx, zoom);

        let newX = resizeStartRef.current.elementX;
        let newY = resizeStartRef.current.elementY;
        let newWidth = resizeStartRef.current.elementWidth;
        let newHeight = resizeStartRef.current.elementHeight;

        // Aplica delta baseado no anchor
        if (resizeAnchor.includes('e')) {
          newWidth = Math.max(5, resizeStartRef.current.elementWidth + deltaXMm);
        }
        if (resizeAnchor.includes('w')) {
          const widthDelta = Math.min(deltaXMm, resizeStartRef.current.elementWidth - 5);
          newWidth = resizeStartRef.current.elementWidth - widthDelta;
          newX = resizeStartRef.current.elementX + widthDelta;
        }
        if (resizeAnchor.includes('s')) {
          newHeight = Math.max(5, resizeStartRef.current.elementHeight + deltaYMm);
        }
        if (resizeAnchor.includes('n')) {
          const heightDelta = Math.min(deltaYMm, resizeStartRef.current.elementHeight - 5);
          newHeight = resizeStartRef.current.elementHeight - heightDelta;
          newY = resizeStartRef.current.elementY + heightDelta;
        }

        // Aplica snap ao resize
        if (snapEnabled) {
          const snapConfig = {
            ...DEFAULT_SNAP_CONFIG,
            enabled: snapEnabled,
            threshold: snapThreshold,
            gridSize,
          };

          const snapResult = calculateResizeSnap(
            { x: newX, y: newY, width: newWidth, height: newHeight },
            resizeAnchor,
            elements,
            canvasWidth,
            canvasHeight,
            snapConfig,
            [element.id]
          );

          // Aplica snap apenas às bordas relevantes
          if (resizeAnchor.includes('w')) {
            newX = snapResult.snappedX;
            newWidth = resizeStartRef.current.elementX + resizeStartRef.current.elementWidth - newX;
          }
          if (resizeAnchor.includes('n')) {
            newY = snapResult.snappedY;
            newHeight = resizeStartRef.current.elementY + resizeStartRef.current.elementHeight - newY;
          }

          setSnapGuides(snapResult.guides);
        }

        // Clamp para dentro do canvas
        newX = Math.max(0, newX);
        newY = Math.max(0, newY);
        newWidth = Math.min(canvasWidth - newX, newWidth);
        newHeight = Math.min(canvasHeight - newY, newHeight);

        setLocalPosition({ x: newX, y: newY });
        setLocalSize({ width: newWidth, height: newHeight });
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDraggingLocal) {
        // Aplica a posição final
        updateElement(element.id, {
          x: localPosition.x,
          y: localPosition.y,
        });
        setIsDraggingLocal(false);
        setDragging(false);
        setSnapGuides([]);
        dragStartRef.current = null;
      }

      if (isResizingLocal) {
        // Aplica o tamanho final
        updateElement(element.id, {
          x: localPosition.x,
          y: localPosition.y,
          width: localSize.width,
          height: localSize.height,
        });
        setIsResizingLocal(false);
        setResizing(false);
        setResizeAnchor(null);
        setSnapGuides([]);
        resizeStartRef.current = null;
      }
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [
    isDraggingLocal,
    isResizingLocal,
    resizeAnchor,
    localPosition,
    localSize,
    element.id,
    element.width,
    element.height,
    elements,
    canvasWidth,
    canvasHeight,
    snapEnabled,
    snapThreshold,
    gridSize,
    zoom,
    updateElement,
    setDragging,
    setResizing,
    setSnapGuides,
  ]);

  // Calcula posição e tamanho em pixels
  const xPx = mmToPx(localPosition.x, zoom);
  const yPx = mmToPx(localPosition.y, zoom);
  const widthPx = mmToPx(localSize.width, zoom);
  const heightPx = mmToPx(localSize.height, zoom);

  // Não renderiza se não visível
  if (!element.visible) return null;

  return (
    <>
      {/* Elemento */}
      <div
        ref={containerRef}
        className={cn(
          'absolute',
          !element.locked && 'cursor-move',
          element.locked && 'cursor-not-allowed',
          isDraggingLocal && 'opacity-80'
        )}
        style={{
          left: xPx,
          top: yPx,
          width: widthPx,
          height: heightPx,
          transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
          transformOrigin: 'center center',
          opacity: element.opacity,
          zIndex: element.zIndex,
        }}
        onMouseDown={handleMouseDown}
        onMouseEnter={() => setHoveredId(element.id)}
        onMouseLeave={() => setHoveredId(null)}
      >
        {/* Conteúdo do elemento */}
        <div className="w-full h-full overflow-hidden">{children}</div>

        {/* Borda de hover (quando não selecionado) */}
        {isHovered && !isSelected && !element.locked && (
          <div className="absolute inset-0 border border-blue-300 pointer-events-none" />
        )}
      </div>

      {/* Caixa de seleção */}
      {isSelected && (
        <SelectionBox
          x={localPosition.x}
          y={localPosition.y}
          width={localSize.width}
          height={localSize.height}
          zoom={zoom}
          rotation={element.rotation}
          locked={element.locked}
          isMultiple={isMultiSelect}
          onResizeStart={handleResizeStart}
        />
      )}
    </>
  );
}

export default ElementWrapper;
