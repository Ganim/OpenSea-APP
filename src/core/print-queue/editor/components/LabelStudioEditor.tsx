'use client';

/**
 * Label Studio - Main Editor Component
 * Componente principal do editor de etiquetas
 */

import { cn } from '@/lib/utils';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ElementsPanel } from '../panels/ElementsPanel';
import { PropertiesPanel } from '../panels/PropertiesPanel';
import { useEditorStore } from '../stores/editorStore';
import type { LabelStudioTemplate } from '../studio-types';
import { MainToolbar } from '../toolbar/MainToolbar';
import { calculateFitZoom } from '../utils/unitConverter';
import { Canvas } from './Canvas';
import { ElementsLayer } from './ElementsLayer';
import { Rulers } from './Rulers';

const RULER_SIZE = 20; // pixels, same as in Rulers.tsx

/**
 * Dados enviados pelo editor ao salvar
 */
export interface LabelStudioSaveData {
  name: string;
  description: string;
  width: number;
  height: number;
  studioTemplate: LabelStudioTemplate;
}

interface LabelStudioEditorProps {
  /** Template para carregar (modo edição) */
  template?: LabelStudioTemplate;
  /** ID do template (se editando existente) */
  templateId?: string;
  /** Nome inicial do template */
  templateName?: string;
  /** Descrição inicial */
  templateDescription?: string;
  /** Largura inicial em mm (para novo template) */
  initialWidth?: number;
  /** Altura inicial em mm (para novo template) */
  initialHeight?: number;
  /** Callback ao salvar */
  onSave?: (data: LabelStudioSaveData) => void;
  /** Se está salvando */
  isSaving?: boolean;
  /** Callback ao cancelar */
  onCancel?: () => void;
  /** Modo somente leitura */
  readOnly?: boolean;
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * Componente principal do Label Studio Editor
 */
export function LabelStudioEditor({
  template,
  templateId,
  templateName = 'Nova Etiqueta',
  templateDescription = '',
  initialWidth = 60,
  initialHeight = 40,
  onSave,
  isSaving,
  onCancel,
  readOnly = false,
  className,
}: LabelStudioEditorProps) {
  // Store actions
  const newTemplate = useEditorStore(s => s.newTemplate);
  const loadTemplate = useEditorStore(s => s.loadTemplate);
  const reset = useEditorStore(s => s.reset);

  // Store state
  const zoom = useEditorStore(s => s.zoom);
  const selectedIds = useEditorStore(s => s.selectedIds);
  const setZoom = useEditorStore(s => s.setZoom);
  const setPanOffset = useEditorStore(s => s.setPanOffset);

  // Elements panel collapse state
  const [elementsPanelCollapsed, setElementsPanelCollapsed] = useState(false);
  const [propertiesPanelCollapsed, setPropertiesPanelCollapsed] =
    useState(false);

  // Workspace container ref and size (for Rulers + fitToScreen)
  const workspaceRef = useRef<HTMLDivElement>(null);
  const [workspaceSize, setWorkspaceSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!workspaceRef.current) return;
    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (entry) {
        setWorkspaceSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(workspaceRef.current);
    return () => observer.disconnect();
  }, []);

  // Fit to screen: calculate proper zoom to fill workspace
  const handleFitToScreen = useCallback(() => {
    const state = useEditorStore.getState();
    const availableWidth = workspaceSize.width - RULER_SIZE;
    const availableHeight = workspaceSize.height - RULER_SIZE;
    if (availableWidth <= 0 || availableHeight <= 0) return;
    const newZoom = calculateFitZoom(
      state.canvasWidth,
      state.canvasHeight,
      availableWidth,
      availableHeight
    );
    setZoom(newZoom);
    setPanOffset({ x: 0, y: 0 });
  }, [workspaceSize, setZoom, setPanOffset]);

  // Save handler
  const handleSave = useCallback(() => {
    if (!onSave) return;
    const state = useEditorStore.getState();
    onSave({
      name: state.templateName,
      description: state.templateDescription,
      width: state.canvasWidth,
      height: state.canvasHeight,
      studioTemplate: state.toJSON(),
    });
  }, [onSave]);

  // Undo/Redo actions
  const undo = useEditorStore(s => s.undo);
  const redo = useEditorStore(s => s.redo);
  const copy = useEditorStore(s => s.copy);
  const paste = useEditorStore(s => s.paste);
  const cut = useEditorStore(s => s.cut);
  const selectAll = useEditorStore(s => s.selectAll);
  const deleteElements = useEditorStore(s => s.deleteElements);
  const duplicateElements = useEditorStore(s => s.duplicateElements);

  // Initialize editor on mount
  useEffect(() => {
    if (template) {
      loadTemplate(template, templateId, templateName, templateDescription);
    } else {
      newTemplate(initialWidth, initialHeight);
    }

    // Cleanup on unmount
    return () => {
      reset();
    };
  }, []); // Only run on mount

  // Sync readOnly prop to store
  useEffect(() => {
    useEditorStore.getState().setReadOnly(readOnly);
  }, [readOnly]);

  // Keyboard shortcuts
  useEffect(() => {
    if (readOnly) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      const target = e.target as HTMLElement;

      // Ignore if typing in input/textarea
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // Save: Ctrl+S
      if (isCtrl && e.key === 's') {
        e.preventDefault();
        handleSave();
        return;
      }

      // Undo: Ctrl+Z
      if (isCtrl && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      // Redo: Ctrl+Y or Ctrl+Shift+Z
      if (
        (isCtrl && e.key === 'y') ||
        (isCtrl && e.shiftKey && e.key === 'z')
      ) {
        e.preventDefault();
        redo();
        return;
      }

      // Copy: Ctrl+C
      if (isCtrl && e.key === 'c') {
        e.preventDefault();
        copy();
        return;
      }

      // Paste: Ctrl+V
      if (isCtrl && e.key === 'v') {
        e.preventDefault();
        paste();
        return;
      }

      // Cut: Ctrl+X
      if (isCtrl && e.key === 'x') {
        e.preventDefault();
        cut();
        return;
      }

      // Select All: Ctrl+A
      if (isCtrl && e.key === 'a') {
        e.preventDefault();
        selectAll();
        return;
      }

      // Duplicate: Ctrl+D
      if (isCtrl && e.key === 'd') {
        e.preventDefault();
        if (selectedIds.length > 0) {
          duplicateElements(selectedIds);
        }
        return;
      }

      // Delete: Delete or Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedIds.length > 0) {
          e.preventDefault();
          deleteElements(selectedIds);
        }
        return;
      }

      // Escape: clear selectedCell first, then exit inline editing, then clear selection
      if (e.key === 'Escape') {
        const state = useEditorStore.getState();
        if (state.selectedCell) {
          state.setSelectedCell(null);
        } else if (state.editingId) {
          state.setEditingId(null);
        } else {
          state.clearSelection();
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    readOnly,
    selectedIds,
    undo,
    redo,
    copy,
    paste,
    cut,
    selectAll,
    deleteElements,
    duplicateElements,
    handleSave,
  ]);

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Toolbar */}
      {!readOnly && <MainToolbar onFitToScreen={handleFitToScreen} />}

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel - Elements (hidden in readOnly) */}
        {!readOnly && (
          <ElementsPanel
            collapsed={elementsPanelCollapsed}
            onToggleCollapse={() =>
              setElementsPanelCollapsed(!elementsPanelCollapsed)
            }
          />
        )}

        {/* Center - Canvas with rulers */}
        <div ref={workspaceRef} className="flex-1 relative">
          {!readOnly && (
            <Rulers
              containerWidth={workspaceSize.width}
              containerHeight={workspaceSize.height}
            />
          )}
          <Canvas className={cn('absolute inset-0', !readOnly && 'pt-5 pl-5')}>
            <ElementsLayer zoom={zoom} />
          </Canvas>
        </div>

        {/* Right panel - Properties (hidden in readOnly) */}
        {!readOnly && (
          <PropertiesPanel
            collapsed={propertiesPanelCollapsed}
            onToggleCollapse={() =>
              setPropertiesPanelCollapsed(!propertiesPanelCollapsed)
            }
          />
        )}
      </div>
    </div>
  );
}

export default LabelStudioEditor;
