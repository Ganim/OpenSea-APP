'use client';

/**
 * Label Studio - Table Config Panel
 * Painel de configuração de tabelas
 */

import React from 'react';
import type { TableElement, TableConfig, TableCell } from '../studio-types';
import { DEFAULT_TEXT_STYLE } from '../studio-types';
import { DATA_PATHS } from '../elements/FieldElementRenderer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select';
import {
  Plus,
  Minus,
  Merge,
  Grid3x3,
} from 'lucide-react';

interface TableConfigPanelProps {
  element: TableElement;
  onUpdate: (updates: Partial<TableElement>) => void;
}

export function TableConfigPanel({ element, onUpdate }: TableConfigPanelProps) {
  const { tableConfig, cells } = element;

  const updateConfig = (updates: Partial<TableConfig>) => {
    onUpdate({ tableConfig: { ...tableConfig, ...updates } });
  };

  // Adiciona linha
  const addRow = () => {
    const newRows = tableConfig.rows + 1;
    const newRowHeights: (number | 'auto')[] = [...tableConfig.rowHeights, 'auto'];
    updateConfig({ rows: newRows, rowHeights: newRowHeights });
  };

  // Remove última linha
  const removeRow = () => {
    if (tableConfig.rows <= 1) return;
    const newRows = tableConfig.rows - 1;
    const newRowHeights = tableConfig.rowHeights.slice(0, -1);
    // Remove células da última linha
    const newCells = cells.filter(c => c.row < newRows);
    // Remove merges que envolvem a linha removida
    const newMergedCells = tableConfig.mergedCells.filter(
      m => m.startRow + m.rowSpan <= newRows
    );
    updateConfig({ rows: newRows, rowHeights: newRowHeights, mergedCells: newMergedCells });
    onUpdate({ cells: newCells });
  };

  // Adiciona coluna
  const addColumn = () => {
    const newCols = tableConfig.columns + 1;
    const newColWidths: (number | 'auto')[] = [...tableConfig.columnWidths, 'auto'];
    updateConfig({ columns: newCols, columnWidths: newColWidths });
  };

  // Remove última coluna
  const removeColumn = () => {
    if (tableConfig.columns <= 1) return;
    const newCols = tableConfig.columns - 1;
    const newColWidths = tableConfig.columnWidths.slice(0, -1);
    const newCells = cells.filter(c => c.col < newCols);
    const newMergedCells = tableConfig.mergedCells.filter(
      m => m.startCol + m.colSpan <= newCols
    );
    updateConfig({ columns: newCols, columnWidths: newColWidths, mergedCells: newMergedCells });
    onUpdate({ cells: newCells });
  };

  // Atualiza ou cria uma célula
  const updateCell = (row: number, col: number, updates: Partial<TableCell>) => {
    const existingIndex = cells.findIndex(c => c.row === row && c.col === col);
    const newCells = [...cells];

    if (existingIndex >= 0) {
      newCells[existingIndex] = { ...newCells[existingIndex], ...updates };
    } else {
      newCells.push({
        row,
        col,
        type: 'text',
        content: '',
        ...updates,
      });
    }

    onUpdate({ cells: newCells });
  };

  // Obtém o conteúdo de uma célula
  const getCell = (row: number, col: number): TableCell | undefined => {
    return cells.find(c => c.row === row && c.col === col);
  };

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
        Tabela
      </h4>

      {/* Dimensões */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Linhas: {tableConfig.rows}</Label>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-6 w-6" onClick={removeRow}>
              <Minus className="h-3 w-3" />
            </Button>
            <Button variant="outline" size="icon" className="h-6 w-6" onClick={addRow}>
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-xs">Colunas: {tableConfig.columns}</Label>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-6 w-6" onClick={removeColumn}>
              <Minus className="h-3 w-3" />
            </Button>
            <Button variant="outline" size="icon" className="h-6 w-6" onClick={addColumn}>
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Padding */}
      <div>
        <Label className="text-xs">Padding (mm)</Label>
        <Input
          type="number"
          value={tableConfig.cellPadding}
          onChange={e => updateConfig({ cellPadding: parseFloat(e.target.value) || 0 })}
          className="h-8"
          step={0.5}
          min={0}
        />
      </div>

      <Separator />

      {/* Bordas */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
          Bordas
        </h4>
        <div>
          <Label className="text-xs">Cor</Label>
          <div className="flex items-center gap-1">
            <input
              type="color"
              value={tableConfig.borders.external?.color || '#000000'}
              onChange={e => {
                const color = e.target.value;
                updateConfig({
                  borders: {
                    external: { ...(tableConfig.borders.external || { width: 0.3, style: 'solid', color: '#000' }), color },
                    internalHorizontal: { ...(tableConfig.borders.internalHorizontal || { width: 0.3, style: 'solid', color: '#000' }), color },
                    internalVertical: { ...(tableConfig.borders.internalVertical || { width: 0.3, style: 'solid', color: '#000' }), color },
                  },
                });
              }}
              className="w-8 h-8 rounded border border-neutral-200"
            />
            <Input
              type="number"
              value={tableConfig.borders.external?.width || 0.3}
              onChange={e => {
                const width = parseFloat(e.target.value) || 0.3;
                updateConfig({
                  borders: {
                    external: { ...(tableConfig.borders.external || { width: 0.3, style: 'solid', color: '#000' }), width },
                    internalHorizontal: { ...(tableConfig.borders.internalHorizontal || { width: 0.3, style: 'solid', color: '#000' }), width: width * 0.5 },
                    internalVertical: { ...(tableConfig.borders.internalVertical || { width: 0.3, style: 'solid', color: '#000' }), width: width * 0.5 },
                  },
                });
              }}
              className="h-8 w-20"
              step={0.1}
              min={0}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Conteúdo das células */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
          Conteúdo das Células
        </h4>
        <div className="max-h-48 overflow-y-auto space-y-1">
          {Array.from({ length: tableConfig.rows }).map((_, row) =>
            Array.from({ length: tableConfig.columns }).map((_, col) => {
              const cell = getCell(row, col);
              return (
                <div
                  key={`cell-config-${row}-${col}`}
                  className="flex items-center gap-1 text-xs"
                >
                  <span className="text-neutral-400 w-10 shrink-0">
                    [{row + 1},{col + 1}]
                  </span>
                  <Select
                    value={cell?.type || 'text'}
                    onValueChange={v =>
                      updateCell(row, col, { type: v as TableCell['type'] })
                    }
                  >
                    <SelectTrigger className="h-7 w-16 shrink-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Texto</SelectItem>
                      <SelectItem value="field">Campo</SelectItem>
                    </SelectContent>
                  </Select>
                  {(cell?.type || 'text') === 'text' ? (
                    <Input
                      value={cell?.content || ''}
                      onChange={e =>
                        updateCell(row, col, { content: e.target.value })
                      }
                      placeholder="texto..."
                      className="h-7 flex-1"
                    />
                  ) : (
                    <Select
                      value={cell?.dataPath || ''}
                      onValueChange={v =>
                        updateCell(row, col, { dataPath: v })
                      }
                    >
                      <SelectTrigger className="h-7 flex-1">
                        <SelectValue placeholder="Campo..." />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(DATA_PATHS).map(([key, category]) => (
                          <SelectGroup key={key}>
                            <SelectLabel>{category.label}</SelectLabel>
                            {category.fields.map(field => (
                              <SelectItem key={field.path} value={field.path}>
                                {field.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default TableConfigPanel;
