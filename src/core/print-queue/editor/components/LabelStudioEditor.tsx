'use client';

/**
 * Label Studio - Main Editor Component
 * Componente principal do editor de etiquetas
 */

import React, { useEffect, useCallback } from 'react';
import { useEditorStore } from '../stores/editorStore';
import { Canvas } from './Canvas';
import { Rulers } from './Rulers';
import { MainToolbar } from '../toolbar/MainToolbar';
import type { LabelStudioTemplate } from '../studio-types';
import { cn } from '@/lib/utils';

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
  onSave?: (template: LabelStudioTemplate, name: string, description: string) => void;
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
  onCancel,
  readOnly = false,
  className,
}: LabelStudioEditorProps) {
  // Store actions
  const newTemplate = useEditorStore((s) => s.newTemplate);
  const loadTemplate = useEditorStore((s) => s.loadTemplate);
  const toJSON = useEditorStore((s) => s.toJSON);
  const getName = useEditorStore((s) => s.templateName);
  const getDescription = useEditorStore((s) => s.templateDescription);
  const reset = useEditorStore((s) => s.reset);

  // Undo/Redo actions
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const copy = useEditorStore((s) => s.copy);
  const paste = useEditorStore((s) => s.paste);
  const cut = useEditorStore((s) => s.cut);
  const selectAll = useEditorStore((s) => s.selectAll);
  const deleteElements = useEditorStore((s) => s.deleteElements);
  const selectedIds = useEditorStore((s) => s.selectedIds);
  const duplicateElements = useEditorStore((s) => s.duplicateElements);

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

      // Undo: Ctrl+Z
      if (isCtrl && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      // Redo: Ctrl+Y or Ctrl+Shift+Z
      if ((isCtrl && e.key === 'y') || (isCtrl && e.shiftKey && e.key === 'z')) {
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

      // Escape: Clear selection
      if (e.key === 'Escape') {
        useEditorStore.getState().clearSelection();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [readOnly, selectedIds, undo, redo, copy, paste, cut, selectAll, deleteElements, duplicateElements]);

  // Handle save
  const handleSave = useCallback(() => {
    if (onSave) {
      const templateData = toJSON();
      onSave(templateData, getName, getDescription);
    }
  }, [onSave, toJSON, getName, getDescription]);

  // Handle preview (placeholder for now)
  const handlePreview = useCallback(() => {
    // TODO: Implement preview modal
    console.log('Preview:', toJSON());
  }, [toJSON]);

  return (
    <div className={cn('flex flex-col h-full bg-neutral-50 dark:bg-neutral-900', className)}>
      {/* Toolbar */}
      {!readOnly && (
        <MainToolbar
          onSave={handleSave}
          onPreview={handlePreview}
        />
      )}

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel - Elements (placeholder) */}
        <div className="w-64 border-r border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
              Elementos
            </h3>
            <p className="text-xs text-neutral-500">
              Arraste elementos para o canvas para criar sua etiqueta.
            </p>
            {/* TODO: ElementsPanel component */}
            <div className="mt-4 space-y-2">
              <div className="p-2 border border-dashed border-neutral-300 dark:border-neutral-600 rounded text-xs text-center text-neutral-500">
                Campos de Dados
              </div>
              <div className="p-2 border border-dashed border-neutral-300 dark:border-neutral-600 rounded text-xs text-center text-neutral-500">
                Texto
              </div>
              <div className="p-2 border border-dashed border-neutral-300 dark:border-neutral-600 rounded text-xs text-center text-neutral-500">
                Imagem
              </div>
              <div className="p-2 border border-dashed border-neutral-300 dark:border-neutral-600 rounded text-xs text-center text-neutral-500">
                Código de Barras
              </div>
              <div className="p-2 border border-dashed border-neutral-300 dark:border-neutral-600 rounded text-xs text-center text-neutral-500">
                QR Code
              </div>
              <div className="p-2 border border-dashed border-neutral-300 dark:border-neutral-600 rounded text-xs text-center text-neutral-500">
                Tabela
              </div>
            </div>
          </div>
        </div>

        {/* Center - Canvas with rulers */}
        <div className="flex-1 relative">
          <Rulers />
          <Canvas className="absolute inset-0 pt-5 pl-5">
            {/* Elements will be rendered here */}
          </Canvas>
        </div>

        {/* Right panel - Properties (placeholder) */}
        <div className="w-72 border-l border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
              Propriedades
            </h3>
            <p className="text-xs text-neutral-500">
              Selecione um elemento para editar suas propriedades.
            </p>
            {/* TODO: PropertiesPanel component */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LabelStudioEditor;
