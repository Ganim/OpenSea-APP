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
  const [localRotation, setLocalRotation] = useState(element.rotation);
  const [isDraggingLocal, setIsDraggingLocal] = useState(false);
  const [isResizingLocal, setIsResizingLocal] = useState(false);
  const [isRotatingLocal, setIsRotatingLocal] = useState(false);
  const [resizeAnchor, setResizeAnchor] = useState<string | null>(null);

  // Store state
  const readOnly = useEditorStore(s => s.readOnly);
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
  const editingId = useEditorStore(s => s.editingId);
  const setEditingId = useEditorStore(s => s.setEditingId);

  const isSelected = selectedIds.includes(element.id);
  const isHovered = hoveredId === element.id;
  const isMultiSelect = selectedIds.length > 1 && isSelected;
  const isEditing = editingId === element.id;

  // Sync local state with element props
  useEffect(() => {
    if (!isDraggingLocal && !isResizingLocal) {
      setLocalPosition({ x: element.x, y: element.y });
      setLocalSize({ width: element.width, height: element.height });
    }
  }, [element.x, element.y, element.width, element.height, isDraggingLocal, isResizingLocal]);

  useEffect(() => {
    if (!isRotatingLocal) {
      setLocalRotation(element.rotation);
    }
  }, [element.rotation, isRotatingLocal]);

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

  // Referência para rotação
  const rotateStartRef = useRef<{
    centerX: number;
    centerY: number;
    startAngle: number;
    initialRotation: number;
  } | null>(null);

  // === DRAG HANDLERS ===
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (readOnly) return;
      if (element.locked) return;
      if (e.button !== 0) return; // Só botão esquerdo

      e.stopPropagation();

      // Seleciona o elemento
      if (e.shiftKey || e.ctrlKey || e.metaKey) {
        selectElements([element.id], true);
      } else if (!isSelected) {
        selectElements([element.id]);
      }

      // Skip drag if editing inline
      if (isEditing) return;

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
    [readOnly, element.id, element.x, element.y, element.locked, isSelected, isEditing, selectElements, setDragging]
  );

  // === DOUBLE-CLICK HANDLER ===
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (readOnly) return;
      if (element.locked) return;
      if (element.type === 'text') {
        e.stopPropagation();
        setEditingId(element.id);
      }
    },
    [readOnly, element.id, element.type, element.locked, setEditingId]
  );

  // === RESIZE HANDLERS ===
  const handleResizeStart = useCallback(
    (anchor: string, e: React.MouseEvent) => {
      if (readOnly) return;
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
    [readOnly, element.x, element.y, element.width, element.height, element.locked, setResizing]
  );

  // === ROTATION HANDLERS ===
  const handleRotateStart = useCallback(
    (_corner: string, e: React.MouseEvent) => {
      if (readOnly) return;
      if (element.locked) return;
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);

      rotateStartRef.current = {
        centerX,
        centerY,
        startAngle,
        initialRotation: element.rotation,
      };
      setIsRotatingLocal(true);
    },
    [readOnly, element.locked, element.rotation]
  );

  // === GLOBAL MOUSE HANDLERS ===
  useEffect(() => {
    if (!isDraggingLocal && !isResizingLocal && !isRotatingLocal) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      // Rotation handling
      if (isRotatingLocal && rotateStartRef.current) {
        const { centerX, centerY, startAngle, initialRotation } = rotateStartRef.current;
        const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        let newRotation = initialRotation + (currentAngle - startAngle) * (180 / Math.PI);
        // Normalize to 0-360
        newRotation = ((newRotation % 360) + 360) % 360;
        // Shift snap to 15° increments
        if (e.shiftKey) {
          newRotation = Math.round(newRotation / 15) * 15;
        }
        setLocalRotation(newRotation);
        return;
      }

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
      if (isRotatingLocal) {
        updateElement(element.id, { rotation: localRotation });
        setIsRotatingLocal(false);
        rotateStartRef.current = null;
        // Save to history
        useEditorStore.getState().saveToHistory();
        return;
      }

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
    isRotatingLocal,
    resizeAnchor,
    localPosition,
    localSize,
    localRotation,
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
          readOnly && 'cursor-default',
          !readOnly && !element.locked && 'cursor-move',
          !readOnly && element.locked && 'cursor-not-allowed',
          isDraggingLocal && 'opacity-80'
        )}
        style={{
          left: xPx,
          top: yPx,
          width: widthPx,
          height: heightPx,
          transform: localRotation ? `rotate(${localRotation}deg)` : undefined,
          transformOrigin: 'center center',
          opacity: element.opacity,
          zIndex: element.zIndex,
        }}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        onMouseEnter={() => setHoveredId(element.id)}
        onMouseLeave={() => setHoveredId(null)}
      >
        {/* Conteúdo do elemento */}
        <div className="w-full h-full overflow-hidden">
          {React.Children.map(children, child => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child as React.ReactElement<{ isEditing?: boolean; onContentChange?: (content: string) => void }>, {
                isEditing,
                onContentChange: isEditing
                  ? (content: string) => updateElement(element.id, { content } as Partial<LabelElement>)
                  : undefined,
              });
            }
            return child;
          })}
        </div>

        {/* Borda de hover (quando não selecionado) */}
        {isHovered && !isSelected && !element.locked && !readOnly && (
          <div className="absolute inset-0 border border-blue-300 pointer-events-none" />
        )}
      </div>

      {/* Caixa de seleção */}
      {isSelected && !readOnly && (
        <SelectionBox
          x={localPosition.x}
          y={localPosition.y}
          width={localSize.width}
          height={localSize.height}
          zoom={zoom}
          rotation={localRotation}
          locked={element.locked}
          isMultiple={isMultiSelect}
          onResizeStart={handleResizeStart}
          onRotateStart={handleRotateStart}
        />
      )}
    </>
  );
}

export default ElementWrapper;
