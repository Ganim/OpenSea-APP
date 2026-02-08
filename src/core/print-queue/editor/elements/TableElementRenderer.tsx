'use client';

/**
 * Label Studio - Table Element Renderer
 * Renderiza elementos de tabela com suporte a merge de células
 */

import React from 'react';
import type { TableElement, TableCell, MergedCell, BorderStyle } from '../studio-types';
import { mmToPx } from '../utils/unitConverter';

interface TableElementRendererProps {
  element: TableElement;
  zoom: number;
  previewData?: Record<string, unknown>;
  selectedCell?: { row: number; col: number } | null;
  onCellClick?: (row: number, col: number) => void;
}

/**
 * Resolve uma borda individual de célula com fallback para bordas globais
 */
function resolveCellBorder(
  cell: TableCell | null,
  side: 'top' | 'right' | 'bottom' | 'left',
  row: number,
  col: number,
  rows: number,
  columns: number,
  rowSpan: number,
  colSpan: number,
  globalBorders: {
    external: BorderStyle;
    internalHorizontal: BorderStyle;
    internalVertical: BorderStyle;
  },
): BorderStyle | undefined {
  // Priority 1: per-cell border
  const cellBorder = cell?.borders?.[side];
  if (cellBorder) return cellBorder;

  // Priority 2: global border fallback
  switch (side) {
    case 'top':
      return row === 0 ? globalBorders.external : globalBorders.internalHorizontal;
    case 'bottom':
      return (row + rowSpan) >= rows ? globalBorders.external : globalBorders.internalHorizontal;
    case 'left':
      return col === 0 ? globalBorders.external : globalBorders.internalVertical;
    case 'right':
      return (col + colSpan) >= columns ? globalBorders.external : globalBorders.internalVertical;
  }
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
 * Resolve um caminho em um objeto
 */
function resolvePath(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((current, key) => {
    if (current && typeof current === 'object') {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
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

  const value = resolvePath(previewData, dataPath);
  return value != null ? String(value) : `{${dataPath}}`;
}

/**
 * Resolve o conteúdo de uma célula do tipo field (suporta todos os tipos)
 */
function resolveCellFieldContent(
  cellData: TableCell,
  previewData?: Record<string, unknown>
): string {
  const fieldType = cellData.fieldType || 'simple';

  switch (fieldType) {
    case 'simple':
      return resolveFieldValue(cellData.dataPath, previewData);

    case 'composite':
      if (!cellData.template) return '{template}';
      return cellData.template.replace(/\{([^}]+)\}/g, (_match, path) => {
        if (previewData) {
          const value = resolvePath(previewData, path);
          if (value != null) return String(value);
        }
        return `{${path}}`;
      });

    case 'conditional':
      if (!cellData.conditions) return '{condicional}';
      if (previewData) {
        const primary = resolvePath(previewData, cellData.conditions.primary);
        if (primary) return String(primary);
        for (const fallback of cellData.conditions.fallbacks) {
          const value = resolvePath(previewData, fallback);
          if (value) return String(value);
        }
      }
      return `{${cellData.conditions.primary}}`;

    case 'calculated':
      if (!cellData.formula) return '= fórmula';
      return `= ${cellData.formula}`;
  }
}

/**
 * Obtém o label de um campo (para uso como placeholder)
 */
function getFieldLabel(dataPath: string): string {
  const lastPart = dataPath.split('.').pop() || 'Campo';
  return lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
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
  selectedCell,
  onCellClick,
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
    <div className="w-full h-full relative overflow-hidden">
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
            : mmToPx(4, zoom);

          // Resolve bordas per-cell com fallback para globais
          const borderTop = resolveCellBorder(cellData, 'top', row, col, rows, columns, rowSpan, colSpan, borders);
          const borderRight = resolveCellBorder(cellData, 'right', row, col, rows, columns, rowSpan, colSpan, borders);
          const borderBottom = resolveCellBorder(cellData, 'bottom', row, col, rows, columns, rowSpan, colSpan, borders);
          const borderLeft = resolveCellBorder(cellData, 'left', row, col, rows, columns, rowSpan, colSpan, borders);

          const makeBorderCss = (b: BorderStyle | undefined) => {
            if (!b || b.style === 'none') return 'none';
            return `${mmToPx(b.width, zoom)}px ${b.style} ${b.color}`;
          };

          const isSelected = selectedCell?.row === row && selectedCell?.col === col;

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
              cellData?.style?.textAlign === 'center'
                ? 'center'
                : cellData?.style?.textAlign === 'right'
                  ? 'flex-end'
                  : 'flex-start',
            fontFamily: cellData?.style?.fontFamily || 'Arial',
            fontSize,
            fontWeight: cellData?.style?.fontWeight || 'normal',
            fontStyle: cellData?.style?.fontStyle || 'normal',
            textDecoration: cellData?.style?.textDecoration || 'none',
            color: cellData?.style?.color || '#000000',
            backgroundColor: cellData?.backgroundColor,
            overflow: 'hidden',
            boxSizing: 'border-box',
            cursor: onCellClick ? 'cell' : undefined,
            // Per-cell borders
            borderTop: makeBorderCss(borderTop),
            borderRight: makeBorderCss(borderRight),
            borderBottom: makeBorderCss(borderBottom),
            borderLeft: makeBorderCss(borderLeft),
            // Selection highlight
            ...(isSelected ? {
              outline: '2px solid #3b82f6',
              outlineOffset: '-1px',
              zIndex: 1,
            } : {}),
          };

          // Conteúdo da célula
          let content = '';
          if (cellData) {
            switch (cellData.type) {
              case 'text':
                content = cellData.content || '';
                break;
              case 'field':
                content = resolveCellFieldContent(cellData, previewData);
                break;
              default:
                content = cellData.content || '';
            }
          }

          // Label da célula
          const hasLabel = cellData?.label?.enabled && cellData.type === 'field';
          const labelText = hasLabel
            ? (cellData!.label!.text || getFieldLabel(cellData!.dataPath || ''))
            : '';
          const isLabelAbove = cellData?.label?.position !== 'left';
          const labelSpacingPx = hasLabel
            ? mmToPx(cellData!.label!.spacing ?? 0.5, zoom)
            : 0;
          const labelFontSizePx = hasLabel && cellData!.label!.style?.fontSize
            ? mmToPx(cellData!.label!.style.fontSize, zoom)
            : fontSize * 0.75;

          // Se tem label, mudar layout para column ou row
          if (hasLabel) {
            cellStyle.flexDirection = isLabelAbove ? 'column' : 'row';
            cellStyle.alignItems = isLabelAbove ? undefined : 'baseline';
            cellStyle.justifyContent = undefined;
          }

          return (
            <div
              key={`cell-${row}-${col}`}
              style={cellStyle}
              onClick={onCellClick ? (e) => {
                e.stopPropagation();
                onCellClick(row, col);
              } : undefined}
            >
              {hasLabel && (
                <span
                  style={{
                    fontSize: labelFontSizePx,
                    fontWeight: cellData!.label!.style?.fontWeight || 'bold',
                    color: cellData!.label!.style?.color || '#666666',
                    fontFamily: cellData!.label!.style?.fontFamily || cellData?.style?.fontFamily || 'Arial',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    ...(isLabelAbove
                      ? { marginBottom: labelSpacingPx }
                      : { marginRight: labelSpacingPx }),
                  }}
                >
                  {labelText}
                </span>
              )}
              <span className="truncate">{content}</span>
            </div>
          );
        })
      )}

      {/* Indicador de tabela vazia */}
      {cells.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-400 pointer-events-none">
          <span style={{ fontSize: mmToPx(2, zoom) }}>
            {rows}x{columns} Tabela
          </span>
        </div>
      )}
    </div>
  );
}

export default TableElementRenderer;
