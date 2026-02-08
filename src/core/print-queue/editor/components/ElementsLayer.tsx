'use client';

/**
 * Label Studio - Elements Layer
 * Camada que renderiza todos os elementos do canvas
 */

import React from 'react';
import { useEditorStore } from '../stores/editorStore';
import { ElementWrapper } from './ElementWrapper';
import { ElementRenderer } from '../elements';
import { MultiSelectionBox } from './SelectionBox';

interface ElementsLayerProps {
  zoom: number;
}

/**
 * Camada de elementos
 */
export function ElementsLayer({ zoom }: ElementsLayerProps) {
  // Store state
  const elements = useEditorStore(s => s.elements);
  const selectedIds = useEditorStore(s => s.selectedIds);
  const selectedCell = useEditorStore(s => s.selectedCell);
  const setSelectedCell = useEditorStore(s => s.setSelectedCell);
  const previewData = useEditorStore(s => s.previewData);

  // Ordena elementos por zIndex
  const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);

  // Elementos selecionados para multi-selection box
  const selectedElements = elements.filter(el => selectedIds.includes(el.id));

  return (
    <>
      {/* Elementos */}
      {sortedElements.map(element => (
        <ElementWrapper key={element.id} element={element} zoom={zoom}>
          <ElementRenderer
            element={element}
            zoom={zoom}
            previewData={previewData ?? undefined}
            selectedCell={
              selectedIds.length === 1 && selectedIds[0] === element.id && element.type === 'table'
                ? selectedCell
                : undefined
            }
            onCellClick={
              selectedIds.length === 1 && selectedIds[0] === element.id && element.type === 'table'
                ? (row, col) => setSelectedCell({ row, col })
                : undefined
            }
          />
        </ElementWrapper>
      ))}

      {/* Multi-selection box */}
      {selectedElements.length > 1 && (
        <MultiSelectionBox elements={selectedElements} zoom={zoom} />
      )}
    </>
  );
}

export default ElementsLayer;
