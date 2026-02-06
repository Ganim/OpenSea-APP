'use client';

/**
 * Label Studio - Table Element Renderer
 * Renderiza elementos de tabela com suporte a merge de células
 */

import React from 'react';
import type { TableElement, TableCell, MergedCell, TextStyle } from '../studio-types';
import { mmToPx } from '../utils/unitConverter';

interface TableElementRendererProps {
  element: TableElement;
  zoom: number;
  previewData?: Record<string, unknown>;
}

/**
 * Verifica se uma célula está mesclada (e não é a origem do merge)
 */
function isCellHiddenByMerge(
  row: number,
  col: number,
  mergedCells: MergedCell[]
): boolean {
  for (const merge of mergedCells) {
    if (row === merge.startRow && col === merge.startCol) continue; // É a origem

    if (
      row >= merge.startRow &&
      row < merge.startRow + merge.rowSpan &&
      col >= merge.startCol &&
      col < merge.startCol + merge.colSpan
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Obtém o merge info de uma célula (se for a origem)
 */
function getMergeInfo(
  row: number,
  col: number,
  mergedCells: MergedCell[]
): MergedCell | null {
  return (
    mergedCells.find(m => m.startRow === row && m.startCol === col) || null
  );
}

/**
 * Obtém o conteúdo de uma célula
 */
function getCellContent(
  row: number,
  col: number,
  cells: TableCell[]
): TableCell | null {
  return cells.find(c => c.row === row && c.col === col) || null;
}

/**
 * Resolve um campo de dados para valor de preview
 */
function resolveFieldValue(
  dataPath: string | undefined,
  previewData?: Record<string, unknown>
): string {
  if (!dataPath) return '';
  if (!previewData) return `{${dataPath}}`;

  const value = dataPath.split('.').reduce<unknown>((obj, key) => {
    if (obj && typeof obj === 'object') {
      return (obj as Record<string, unknown>)[key];
    }
    return undefined;
  }, previewData);

  return value != null ? String(value) : `{${dataPath}}`;
}

/**
 * Calcula as larguras das colunas em pixels
 */
function calculateColumnWidths(
  widths: (number | 'auto')[],
  totalWidth: number,
  columns: number,
  zoom: number
): number[] {
  const totalWidthPx = mmToPx(totalWidth, zoom);
  const result: number[] = [];
  let autoCount = 0;
  let fixedTotal = 0;

  for (let i = 0; i < columns; i++) {
    const w = widths[i] ?? 'auto';
    if (w === 'auto') {
      autoCount++;
    } else {
      fixedTotal += mmToPx(w, zoom);
    }
  }

  const autoWidth = autoCount > 0 ? (totalWidthPx - fixedTotal) / autoCount : 0;

  for (let i = 0; i < columns; i++) {
    const w = widths[i] ?? 'auto';
    if (w === 'auto') {
      result.push(autoWidth);
    } else {
      result.push(mmToPx(w, zoom));
    }
  }

  return result;
}

/**
 * Calcula as alturas das linhas em pixels
 */
function calculateRowHeights(
  heights: (number | 'auto')[],
  totalHeight: number,
  rows: number,
  zoom: number
): number[] {
  const totalHeightPx = mmToPx(totalHeight, zoom);
  const result: number[] = [];
  let autoCount = 0;
  let fixedTotal = 0;

  for (let i = 0; i < rows; i++) {
    const h = heights[i] ?? 'auto';
    if (h === 'auto') {
      autoCount++;
    } else {
      fixedTotal += mmToPx(h, zoom);
    }
  }

  const autoHeight = autoCount > 0 ? (totalHeightPx - fixedTotal) / autoCount : 0;

  for (let i = 0; i < rows; i++) {
    const h = heights[i] ?? 'auto';
    if (h === 'auto') {
      result.push(autoHeight);
    } else {
      result.push(mmToPx(h, zoom));
    }
  }

  return result;
}

/**
 * Renderiza elemento de tabela
 */
export function TableElementRenderer({
  element,
  zoom,
  previewData,
}: TableElementRendererProps) {
  const { tableConfig, cells, width, height } = element;
  const { rows, columns, mergedCells, borders, cellPadding } = tableConfig;

  const colWidths = calculateColumnWidths(
    tableConfig.columnWidths,
    width,
    columns,
    zoom
  );
  const rowHeights = calculateRowHeights(
    tableConfig.rowHeights,
    height,
    rows,
    zoom
  );

  const paddingPx = mmToPx(cellPadding, zoom);
  const externalBorderWidthPx = borders.external
    ? mmToPx(borders.external.width, zoom)
    : 0;
  const hBorderWidthPx = borders.internalHorizontal
    ? mmToPx(borders.internalHorizontal.width, zoom)
    : 0;
  const vBorderWidthPx = borders.internalVertical
    ? mmToPx(borders.internalVertical.width, zoom)
    : 0;

  // Calcula posição acumulada para as linhas e colunas
  const colPositions: number[] = [0];
  for (let i = 0; i < columns; i++) {
    colPositions.push(colPositions[i] + colWidths[i]);
  }

  const rowPositions: number[] = [0];
  for (let i = 0; i < rows; i++) {
    rowPositions.push(rowPositions[i] + rowHeights[i]);
  }

  return (
    <div
      className="w-full h-full relative overflow-hidden"
      style={{
        border:
          borders.external && borders.external.style !== 'none'
            ? `${externalBorderWidthPx}px ${borders.external.style} ${borders.external.color}`
            : undefined,
      }}
    >
      {/* Renderiza cada célula */}
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((_, col) => {
          // Verifica se a célula está oculta por merge
          if (isCellHiddenByMerge(row, col, mergedCells)) return null;

          const mergeInfo = getMergeInfo(row, col, mergedCells);
          const cellData = getCellContent(row, col, cells);
          const rowSpan = mergeInfo?.rowSpan || 1;
          const colSpan = mergeInfo?.colSpan || 1;

          // Calcula posição e tamanho
          const x = colPositions[col];
          const y = rowPositions[row];
          let cellWidth = 0;
          for (let i = col; i < col + colSpan && i < columns; i++) {
            cellWidth += colWidths[i];
          }
          let cellHeight = 0;
          for (let i = row; i < row + rowSpan && i < rows; i++) {
            cellHeight += rowHeights[i];
          }

          // Estilo da célula
          const fontSize = cellData?.style?.fontSize
            ? mmToPx(cellData.style.fontSize, zoom)
            : mmToPx(2.5, zoom);

          const cellStyle: React.CSSProperties = {
            position: 'absolute',
            left: x,
            top: y,
            width: cellWidth,
            height: cellHeight,
            padding: paddingPx,
            display: 'flex',
            alignItems:
              cellData?.style?.verticalAlign === 'top'
                ? 'flex-start'
                : cellData?.style?.verticalAlign === 'bottom'
                  ? 'flex-end'
                  : 'center',
            justifyContent:
              cellData?.style?.textAlign === 'left'
                ? 'flex-start'
                : cellData?.style?.textAlign === 'right'
                  ? 'flex-end'
                  : 'center',
            fontFamily: cellData?.style?.fontFamily || 'Arial',
            fontSize,
            fontWeight: cellData?.style?.fontWeight || 'normal',
            color: cellData?.style?.color || '#000000',
            backgroundColor: cellData?.backgroundColor,
            overflow: 'hidden',
            boxSizing: 'border-box',
            // Bordas internas
            borderRight:
              col + colSpan < columns && borders.internalVertical?.style !== 'none'
                ? `${vBorderWidthPx}px ${borders.internalVertical?.style || 'solid'} ${borders.internalVertical?.color || '#000'}`
                : undefined,
            borderBottom:
              row + rowSpan < rows && borders.internalHorizontal?.style !== 'none'
                ? `${hBorderWidthPx}px ${borders.internalHorizontal?.style || 'solid'} ${borders.internalHorizontal?.color || '#000'}`
                : undefined,
          };

          // Conteúdo da célula
          let content = '';
          if (cellData) {
            switch (cellData.type) {
              case 'text':
                content = cellData.content || '';
                break;
              case 'field':
                content = resolveFieldValue(cellData.dataPath, previewData);
                break;
              default:
                content = cellData.content || '';
            }
          }

          return (
            <div key={`cell-${row}-${col}`} style={cellStyle}>
              <span className="truncate">{content}</span>
            </div>
          );
        })
      )}

      {/* Indicador de tabela vazia */}
      {cells.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-neutral-400 pointer-events-none">
          <span style={{ fontSize: mmToPx(2, zoom) }}>
            {rows}x{columns} Tabela
          </span>
        </div>
      )}
    </div>
  );
}

export default TableElementRenderer;
