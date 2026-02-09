'use client';

/**
 * Label Studio - Table Config Panel
 * Painel de configuração de tabelas com modo tabela/célula
 */

import React, { useState } from 'react';
import type {
  TableElement,
  TableConfig,
  TableCell,
  MergedCell,
  CellBorderStyle,
  CellLabelConfig,
  BorderStyle,
  TextStyle,
} from '../studio-types';
import { getFieldLabel } from '../elements/FieldElementRenderer';
import { FieldPickerModal } from '../components/FieldPickerModal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  ChevronRight,
  Braces,
} from 'lucide-react';

interface TableConfigPanelProps {
  element: TableElement;
  onUpdate: (updates: Partial<TableElement>) => void;
  selectedCell: { row: number; col: number } | null;
  onSelectCell: (cell: { row: number; col: number } | null) => void;
}

export function TableConfigPanel({
  element,
  onUpdate,
  selectedCell,
  onSelectCell,
}: TableConfigPanelProps) {
  const { tableConfig, cells } = element;

  const updateConfig = (updates: Partial<TableConfig>) => {
    onUpdate({ tableConfig: { ...tableConfig, ...updates } });
  };

  // Atualiza ou cria uma célula
  const updateCell = (
    row: number,
    col: number,
    updates: Partial<TableCell>
  ) => {
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

  const getCell = (row: number, col: number): TableCell | undefined => {
    return cells.find(c => c.row === row && c.col === col);
  };

  // ================================
  // MODO CÉLULA
  // ================================
  if (selectedCell) {
    const { row, col } = selectedCell;
    const cell = getCell(row, col);
    const cellStyle = cell?.style || {};

    const updateCellStyle = (updates: Partial<TextStyle>) => {
      updateCell(row, col, {
        style: { ...cellStyle, ...updates },
      });
    };

    const updateCellBorder = (
      side: 'top' | 'right' | 'bottom' | 'left' | 'all',
      border: BorderStyle
    ) => {
      const current = cell?.borders || {};
      if (side === 'all') {
        updateCell(row, col, {
          borders: { top: border, right: border, bottom: border, left: border },
        });
      } else {
        updateCell(row, col, {
          borders: { ...current, [side]: border },
        });
      }
    };

    return (
      <div className="space-y-3">
        {/* Header com botão voltar */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={() => onSelectCell(null)}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </Button>
          <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Célula [{row + 1}, {col + 1}]
          </h4>
        </div>

        <Separator />

        {/* Conteúdo */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Conteúdo
          </Label>
          <Select
            value={cell?.type || 'text'}
            onValueChange={v =>
              updateCell(row, col, { type: v as TableCell['type'] })
            }
          >
            <SelectTrigger className="h-7 text-xs">
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
              onChange={e => updateCell(row, col, { content: e.target.value })}
              placeholder="Texto da célula..."
              className="h-7 text-xs"
            />
          ) : (
            <CellFieldConfig
              cell={cell}
              onUpdateCell={updates => updateCell(row, col, updates)}
            />
          )}
        </div>

        {/* Label (apenas para campo) */}
        {cell?.type === 'field' && (
          <>
            <Separator />
            <CellLabelEditor
              label={cell?.label}
              dataPath={cell?.dataPath}
              onUpdate={updates => {
                const currentLabel = cell?.label || {
                  enabled: false,
                  text: '',
                  position: 'above' as const,
                };
                updateCell(row, col, {
                  label: { ...currentLabel, ...updates },
                });
              }}
            />
          </>
        )}

        <Separator />

        {/* Estilo de texto */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Estilo
          </Label>
          <Select
            value={cellStyle.fontFamily || 'Arial'}
            onValueChange={v => updateCellStyle({ fontFamily: v })}
          >
            <SelectTrigger className="h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Arial">Arial</SelectItem>
              <SelectItem value="Helvetica">Helvetica</SelectItem>
              <SelectItem value="Times New Roman">Times New Roman</SelectItem>
              <SelectItem value="Courier New">Courier New</SelectItem>
              <SelectItem value="Georgia">Georgia</SelectItem>
              <SelectItem value="Verdana">Verdana</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={cellStyle.fontSize ?? 2.5}
              onChange={e =>
                updateCellStyle({ fontSize: parseFloat(e.target.value) || 2.5 })
              }
              className="h-7 text-xs w-16"
              step={0.5}
              min={1}
            />
            <span className="text-xs text-slate-400">mm</span>
            <div className="flex items-center gap-1 ml-auto">
              <input
                type="color"
                value={cellStyle.color || '#000000'}
                onChange={e => updateCellStyle({ color: e.target.value })}
                className="w-7 h-7 rounded border border-slate-200 dark:border-slate-600 cursor-pointer"
              />
            </div>
          </div>
          {/* B/I/U/S */}
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 ${cellStyle.fontWeight === 'bold' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : ''}`}
              onClick={() =>
                updateCellStyle({
                  fontWeight:
                    cellStyle.fontWeight === 'bold' ? 'normal' : 'bold',
                })
              }
            >
              <Bold className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 ${cellStyle.fontStyle === 'italic' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : ''}`}
              onClick={() =>
                updateCellStyle({
                  fontStyle:
                    cellStyle.fontStyle === 'italic' ? 'normal' : 'italic',
                })
              }
            >
              <Italic className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 ${cellStyle.textDecoration === 'underline' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : ''}`}
              onClick={() =>
                updateCellStyle({
                  textDecoration:
                    cellStyle.textDecoration === 'underline'
                      ? 'none'
                      : 'underline',
                })
              }
            >
              <Underline className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 ${cellStyle.textDecoration === 'line-through' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : ''}`}
              onClick={() =>
                updateCellStyle({
                  textDecoration:
                    cellStyle.textDecoration === 'line-through'
                      ? 'none'
                      : 'line-through',
                })
              }
            >
              <Strikethrough className="h-3.5 w-3.5" />
            </Button>
            <div className="w-px h-4 bg-slate-200 dark:bg-slate-600 mx-1" />
            {/* Alinhamento horizontal */}
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 ${cellStyle.textAlign === 'left' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : ''}`}
              onClick={() => updateCellStyle({ textAlign: 'left' })}
            >
              <AlignLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 ${cellStyle.textAlign === 'center' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : ''}`}
              onClick={() => updateCellStyle({ textAlign: 'center' })}
            >
              <AlignCenter className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 ${cellStyle.textAlign === 'right' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : ''}`}
              onClick={() => updateCellStyle({ textAlign: 'right' })}
            >
              <AlignRight className="h-3.5 w-3.5" />
            </Button>
          </div>
          {/* Alinhamento vertical */}
          <div className="flex items-center gap-0.5">
            <span className="text-xs text-slate-400 mr-1">V:</span>
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 ${cellStyle.verticalAlign === 'top' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : ''}`}
              onClick={() => updateCellStyle({ verticalAlign: 'top' })}
            >
              <AlignVerticalJustifyStart className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 ${!cellStyle.verticalAlign || cellStyle.verticalAlign === 'middle' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : ''}`}
              onClick={() => updateCellStyle({ verticalAlign: 'middle' })}
            >
              <AlignVerticalJustifyCenter className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 ${cellStyle.verticalAlign === 'bottom' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : ''}`}
              onClick={() => updateCellStyle({ verticalAlign: 'bottom' })}
            >
              <AlignVerticalJustifyEnd className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <Separator />

        {/* Fundo */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Fundo
          </Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={cell?.backgroundColor || '#ffffff'}
              onChange={e =>
                updateCell(row, col, { backgroundColor: e.target.value })
              }
              className="w-7 h-7 rounded border border-slate-200 dark:border-slate-600 cursor-pointer"
            />
            <Input
              value={cell?.backgroundColor || ''}
              onChange={e =>
                updateCell(row, col, { backgroundColor: e.target.value })
              }
              placeholder="Transparente"
              className="h-7 text-xs flex-1"
            />
            {cell?.backgroundColor && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() =>
                  updateCell(row, col, { backgroundColor: undefined })
                }
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        <Separator />

        {/* Bordas individuais */}
        <CellBorderEditor
          borders={cell?.borders}
          onUpdate={(side, border) => updateCellBorder(side, border)}
          onClear={() => updateCell(row, col, { borders: undefined })}
        />
      </div>
    );
  }

  // ================================
  // MODO TABELA
  // ================================

  // Adiciona linha
  const addRow = () => {
    const newRows = tableConfig.rows + 1;
    const newRowHeights: (number | 'auto')[] = [
      ...tableConfig.rowHeights,
      'auto',
    ];
    updateConfig({ rows: newRows, rowHeights: newRowHeights });
  };

  const removeRow = () => {
    if (tableConfig.rows <= 1) return;
    const newRows = tableConfig.rows - 1;
    const newRowHeights = tableConfig.rowHeights.slice(0, -1);
    const newCells = cells.filter(c => c.row < newRows);
    const newMergedCells = tableConfig.mergedCells.filter(
      m => m.startRow + m.rowSpan <= newRows
    );
    updateConfig({
      rows: newRows,
      rowHeights: newRowHeights,
      mergedCells: newMergedCells,
    });
    onUpdate({ cells: newCells });
  };

  const addColumn = () => {
    const newCols = tableConfig.columns + 1;
    const newColWidths: (number | 'auto')[] = [
      ...tableConfig.columnWidths,
      'auto',
    ];
    updateConfig({ columns: newCols, columnWidths: newColWidths });
  };

  const removeColumn = () => {
    if (tableConfig.columns <= 1) return;
    const newCols = tableConfig.columns - 1;
    const newColWidths = tableConfig.columnWidths.slice(0, -1);
    const newCells = cells.filter(c => c.col < newCols);
    const newMergedCells = tableConfig.mergedCells.filter(
      m => m.startCol + m.colSpan <= newCols
    );
    updateConfig({
      columns: newCols,
      columnWidths: newColWidths,
      mergedCells: newMergedCells,
    });
    onUpdate({ cells: newCells });
  };

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        Tabela
      </h4>

      {/* Dimensões */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Linhas: {tableConfig.rows}</Label>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6"
              onClick={removeRow}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6"
              onClick={addRow}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-xs">Colunas: {tableConfig.columns}</Label>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6"
              onClick={removeColumn}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6"
              onClick={addColumn}
            >
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
          onChange={e =>
            updateConfig({ cellPadding: parseFloat(e.target.value) || 0 })
          }
          className="h-8"
          step={0.5}
          min={0}
        />
      </div>

      <Separator />

      {/* Bordas globais */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
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
                    external: {
                      ...(tableConfig.borders.external || {
                        width: 0.3,
                        style: 'solid',
                        color: '#000',
                      }),
                      color,
                    },
                    internalHorizontal: {
                      ...(tableConfig.borders.internalHorizontal || {
                        width: 0.3,
                        style: 'solid',
                        color: '#000',
                      }),
                      color,
                    },
                    internalVertical: {
                      ...(tableConfig.borders.internalVertical || {
                        width: 0.3,
                        style: 'solid',
                        color: '#000',
                      }),
                      color,
                    },
                  },
                });
              }}
              className="w-8 h-8 rounded border border-slate-200"
            />
            <Input
              type="number"
              value={tableConfig.borders.external?.width || 0.3}
              onChange={e => {
                const width = parseFloat(e.target.value) || 0.3;
                updateConfig({
                  borders: {
                    external: {
                      ...(tableConfig.borders.external || {
                        width: 0.3,
                        style: 'solid',
                        color: '#000',
                      }),
                      width,
                    },
                    internalHorizontal: {
                      ...(tableConfig.borders.internalHorizontal || {
                        width: 0.3,
                        style: 'solid',
                        color: '#000',
                      }),
                      width: width * 0.5,
                    },
                    internalVertical: {
                      ...(tableConfig.borders.internalVertical || {
                        width: 0.3,
                        style: 'solid',
                        color: '#000',
                      }),
                      width: width * 0.5,
                    },
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

      {/* Mesclagem */}
      <MergeSection tableConfig={tableConfig} updateConfig={updateConfig} />

      <Separator />

      {/* Dica */}
      <p className="text-xs text-slate-400 dark:text-slate-500 text-center italic">
        Clique em uma célula no canvas para editá-la
      </p>
    </div>
  );
}

/**
 * Seção de mesclagem de células
 */
function MergeSection({
  tableConfig,
  updateConfig,
}: {
  tableConfig: TableConfig;
  updateConfig: (updates: Partial<TableConfig>) => void;
}) {
  const [startRow, setStartRow] = useState(1);
  const [startCol, setStartCol] = useState(1);
  const [rowSpan, setRowSpan] = useState(2);
  const [colSpan, setColSpan] = useState(1);

  const addMerge = () => {
    const merge: MergedCell = {
      startRow: startRow - 1,
      startCol: startCol - 1,
      rowSpan,
      colSpan,
    };
    // Validate bounds
    if (
      merge.startRow < 0 ||
      merge.startCol < 0 ||
      merge.startRow + merge.rowSpan > tableConfig.rows ||
      merge.startCol + merge.colSpan > tableConfig.columns ||
      (merge.rowSpan <= 1 && merge.colSpan <= 1)
    )
      return;

    updateConfig({
      mergedCells: [...tableConfig.mergedCells, merge],
    });
  };

  const removeMerge = (index: number) => {
    const newMerges = tableConfig.mergedCells.filter((_, i) => i !== index);
    updateConfig({ mergedCells: newMerges });
  };

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        Mesclagem
      </h4>

      {/* Lista de merges existentes */}
      {tableConfig.mergedCells.length > 0 && (
        <div className="space-y-1">
          {tableConfig.mergedCells.map((merge, i) => (
            <div
              key={i}
              className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800 rounded px-2 py-1"
            >
              <span>
                [{merge.startRow + 1},{merge.startCol + 1}] {merge.rowSpan}x
                {merge.colSpan}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() => removeMerge(i)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Form para adicionar merge */}
      <div className="grid grid-cols-2 gap-1">
        <div>
          <Label className="text-[10px]">Linha ini</Label>
          <Input
            type="number"
            value={startRow}
            onChange={e => setStartRow(parseInt(e.target.value) || 1)}
            className="h-6 text-xs"
            min={1}
            max={tableConfig.rows}
          />
        </div>
        <div>
          <Label className="text-[10px]">Col ini</Label>
          <Input
            type="number"
            value={startCol}
            onChange={e => setStartCol(parseInt(e.target.value) || 1)}
            className="h-6 text-xs"
            min={1}
            max={tableConfig.columns}
          />
        </div>
        <div>
          <Label className="text-[10px]">Linhas</Label>
          <Input
            type="number"
            value={rowSpan}
            onChange={e => setRowSpan(parseInt(e.target.value) || 1)}
            className="h-6 text-xs"
            min={1}
            max={tableConfig.rows}
          />
        </div>
        <div>
          <Label className="text-[10px]">Colunas</Label>
          <Input
            type="number"
            value={colSpan}
            onChange={e => setColSpan(parseInt(e.target.value) || 1)}
            className="h-6 text-xs"
            min={1}
            max={tableConfig.columns}
          />
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="w-full h-7 text-xs"
        onClick={addMerge}
      >
        <Plus className="h-3 w-3 mr-1" />
        Mesclar
      </Button>
    </div>
  );
}

/**
 * Configuração de campo dentro da célula (tipo, dataPath, template, etc.)
 */
function CellFieldConfig({
  cell,
  onUpdateCell,
}: {
  cell: TableCell | undefined;
  onUpdateCell: (updates: Partial<TableCell>) => void;
}) {
  const fieldType = cell?.fieldType || 'simple';
  const [fieldPickerOpen, setFieldPickerOpen] = useState(false);
  const [insertModalOpen, setInsertModalOpen] = useState(false);

  return (
    <div className="space-y-2">
      {/* Tipo de campo */}
      <Select
        value={fieldType}
        onValueChange={v =>
          onUpdateCell({ fieldType: v as TableCell['fieldType'] })
        }
      >
        <SelectTrigger className="h-7 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="simple">Simples</SelectItem>
          <SelectItem value="composite">Composto</SelectItem>
          <SelectItem value="conditional">Condicional</SelectItem>
          <SelectItem value="calculated">Calculado</SelectItem>
        </SelectContent>
      </Select>

      {/* Simples: botão para abrir FieldPickerModal */}
      {fieldType === 'simple' && (
        <div>
          <Button
            variant="outline"
            className="w-full justify-between h-7 text-xs font-normal"
            onClick={() => setFieldPickerOpen(true)}
          >
            <span className="truncate">
              {cell?.dataPath
                ? getFieldLabel(cell.dataPath)
                : 'Selecionar campo...'}
            </span>
            <ChevronRight className="h-3 w-3 shrink-0 text-slate-400" />
          </Button>
          {cell?.dataPath && (
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              {cell.dataPath}
            </p>
          )}
          <FieldPickerModal
            open={fieldPickerOpen}
            onOpenChange={setFieldPickerOpen}
            onSelect={v => onUpdateCell({ dataPath: v })}
            currentValue={cell?.dataPath}
          />
        </div>
      )}

      {/* Composto: template */}
      {fieldType === 'composite' && (
        <div className="space-y-1">
          <Textarea
            value={cell?.template || ''}
            onChange={e => onUpdateCell({ template: e.target.value })}
            placeholder="{product.name} - {variant.sku}"
            className="h-16 text-xs font-mono"
          />
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-slate-400">
              Use {'{campo}'} para inserir campos dinâmicos
            </p>
            <Button
              variant="outline"
              size="sm"
              className="h-5 text-[10px] gap-1 px-1.5"
              onClick={() => setInsertModalOpen(true)}
            >
              <Braces className="w-2.5 h-2.5" />
              Inserir
            </Button>
          </div>
          <FieldPickerModal
            open={insertModalOpen}
            onOpenChange={setInsertModalOpen}
            onSelect={() => {}}
            insertMode
            onInsert={text => {
              const current = cell?.template || '';
              onUpdateCell({ template: current + text });
            }}
            title="Inserir Campo no Template"
          />
        </div>
      )}

      {/* Condicional: primary + fallbacks */}
      {fieldType === 'conditional' && (
        <CellConditionalConfig
          conditions={cell?.conditions}
          onUpdate={conditions => onUpdateCell({ conditions })}
        />
      )}

      {/* Calculado: fórmula + formato */}
      {fieldType === 'calculated' && (
        <CellCalculatedConfig cell={cell} onUpdateCell={onUpdateCell} />
      )}
    </div>
  );
}

/**
 * Configuração de campo calculado em célula
 */
function CellCalculatedConfig({
  cell,
  onUpdateCell,
}: {
  cell: TableCell | undefined;
  onUpdateCell: (updates: Partial<TableCell>) => void;
}) {
  const [insertModalOpen, setInsertModalOpen] = useState(false);

  return (
    <div className="space-y-2">
      <Textarea
        value={cell?.formula || ''}
        onChange={e => onUpdateCell({ formula: e.target.value })}
        placeholder="{variant.price} * 1.1"
        className="h-12 text-xs font-mono"
      />
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-slate-400">Operadores: + - * / ( )</p>
        <Button
          variant="outline"
          size="sm"
          className="h-5 text-[10px] gap-1 px-1.5"
          onClick={() => setInsertModalOpen(true)}
        >
          <Braces className="w-2.5 h-2.5" />
          Inserir
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-1">
        <div>
          <Label className="text-[10px]">Formato</Label>
          <Select
            value={cell?.format || 'number'}
            onValueChange={v =>
              onUpdateCell({ format: v as TableCell['format'] })
            }
          >
            <SelectTrigger className="h-6 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="number">Número</SelectItem>
              <SelectItem value="currency">Moeda</SelectItem>
              <SelectItem value="percentage">Percentual</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-[10px]">Decimais</Label>
          <Input
            type="number"
            value={cell?.decimalPlaces ?? 2}
            onChange={e =>
              onUpdateCell({ decimalPlaces: parseInt(e.target.value) || 0 })
            }
            className="h-6 text-xs"
            min={0}
            max={6}
          />
        </div>
      </div>
      <FieldPickerModal
        open={insertModalOpen}
        onOpenChange={setInsertModalOpen}
        onSelect={() => {}}
        insertMode
        onInsert={text => {
          const current = cell?.formula || '';
          onUpdateCell({ formula: current + text });
        }}
        title="Inserir Campo na Fórmula"
      />
    </div>
  );
}

/**
 * Configuração de campo condicional (primary + fallbacks)
 */
function CellConditionalConfig({
  conditions,
  onUpdate,
}: {
  conditions?: { primary: string; fallbacks: string[] };
  onUpdate: (conditions: { primary: string; fallbacks: string[] }) => void;
}) {
  const current = conditions || { primary: '', fallbacks: [] };
  const [primaryPickerOpen, setPrimaryPickerOpen] = useState(false);

  return (
    <div className="space-y-2">
      <div>
        <Label className="text-[10px]">Campo principal</Label>
        <Button
          variant="outline"
          className="w-full justify-between h-7 text-xs font-normal"
          onClick={() => setPrimaryPickerOpen(true)}
        >
          <span className="truncate">
            {current.primary ? getFieldLabel(current.primary) : 'Selecionar...'}
          </span>
          <ChevronRight className="h-3 w-3 shrink-0 text-slate-400" />
        </Button>
        {current.primary && (
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            {current.primary}
          </p>
        )}
        <FieldPickerModal
          open={primaryPickerOpen}
          onOpenChange={setPrimaryPickerOpen}
          onSelect={path => onUpdate({ ...current, primary: path })}
          currentValue={current.primary}
        />
      </div>
      <div>
        <Label className="text-[10px]">Fallbacks</Label>
        <div className="space-y-1">
          {current.fallbacks.map((fb, i) => (
            <CellConditionalFallback
              key={i}
              index={i}
              value={fb}
              onChange={path => {
                const newFb = [...current.fallbacks];
                newFb[i] = path;
                onUpdate({ ...current, fallbacks: newFb });
              }}
              onRemove={() => {
                const newFb = current.fallbacks.filter((_, j) => j !== i);
                onUpdate({ ...current, fallbacks: newFb });
              }}
            />
          ))}
          <Button
            variant="outline"
            size="sm"
            className="w-full h-6 text-xs"
            onClick={() =>
              onUpdate({ ...current, fallbacks: [...current.fallbacks, ''] })
            }
          >
            <Plus className="h-3 w-3 mr-1" />
            Fallback
          </Button>
        </div>
      </div>
      <p className="text-[10px] text-slate-400">
        Se o campo principal estiver vazio, usa o próximo fallback.
      </p>
    </div>
  );
}

/**
 * Item de fallback individual (para ter seu próprio state de modal)
 */
function CellConditionalFallback({
  index,
  value,
  onChange,
  onRemove,
}: {
  index: number;
  value: string;
  onChange: (path: string) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center gap-1">
      <span className="text-[10px] text-slate-400 w-3">{index + 1}.</span>
      <Button
        variant="outline"
        className="flex-1 justify-between h-6 text-xs font-normal"
        onClick={() => setOpen(true)}
      >
        <span className="truncate">
          {value ? getFieldLabel(value) : 'Selecionar...'}
        </span>
        <ChevronRight className="h-2.5 w-2.5 shrink-0 text-slate-400" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={onRemove}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
      <FieldPickerModal
        open={open}
        onOpenChange={setOpen}
        onSelect={onChange}
        currentValue={value}
      />
    </div>
  );
}

/**
 * Editor de label/rótulo de célula
 */
function CellLabelEditor({
  label,
  dataPath,
  onUpdate,
}: {
  label?: CellLabelConfig;
  dataPath?: string;
  onUpdate: (updates: Partial<CellLabelConfig>) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Rótulo (Label)
        </Label>
        <Switch
          checked={label?.enabled || false}
          onCheckedChange={enabled => onUpdate({ enabled })}
        />
      </div>
      {label?.enabled && (
        <div className="space-y-2">
          <div>
            <Label className="text-[10px]">Texto</Label>
            <Input
              value={label.text || ''}
              onChange={e => onUpdate({ text: e.target.value })}
              placeholder={getFieldLabel(dataPath || '')}
              className="h-7 text-xs"
            />
          </div>
          <div>
            <Label className="text-[10px]">Posição</Label>
            <Select
              value={label.position || 'above'}
              onValueChange={v => onUpdate({ position: v as 'above' | 'left' })}
            >
              <SelectTrigger className="h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="above">Acima</SelectItem>
                <SelectItem value="left">À esquerda</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-1">
            <div>
              <Label className="text-[10px]">Cor</Label>
              <input
                type="color"
                value={label.style?.color || '#666666'}
                onChange={e =>
                  onUpdate({
                    style: { ...label.style, color: e.target.value },
                  })
                }
                className="w-full h-7 rounded border border-slate-200 dark:border-slate-600 cursor-pointer"
              />
            </div>
            <div>
              <Label className="text-[10px]">Tam (mm)</Label>
              <Input
                type="number"
                value={label.style?.fontSize || 2}
                onChange={e =>
                  onUpdate({
                    style: {
                      ...label.style,
                      fontSize: parseFloat(e.target.value) || 2,
                    },
                  })
                }
                className="h-7 text-xs"
                step={0.5}
                min={1}
              />
            </div>
            <div>
              <Label className="text-[10px]">Espaço (mm)</Label>
              <Input
                type="number"
                value={label.spacing ?? 0.5}
                onChange={e =>
                  onUpdate({
                    spacing: parseFloat(e.target.value) || 0,
                  })
                }
                className="h-7 text-xs"
                step={0.25}
                min={0}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Editor de bordas individuais de célula
 */
function CellBorderEditor({
  borders,
  onUpdate,
  onClear,
}: {
  borders?: CellBorderStyle;
  onUpdate: (
    side: 'top' | 'right' | 'bottom' | 'left' | 'all',
    border: BorderStyle
  ) => void;
  onClear: () => void;
}) {
  const [side, setSide] = useState<'top' | 'right' | 'bottom' | 'left' | 'all'>(
    'all'
  );
  const [width, setWidth] = useState(0.3);
  const [style, setStyle] = useState<BorderStyle['style']>('solid');
  const [color, setColor] = useState('#000000');

  const applyBorder = () => {
    onUpdate(side, { width, style, color });
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        Bordas da Célula
      </Label>
      <div className="space-y-1">
        <Select value={side} onValueChange={v => setSide(v as typeof side)}>
          <SelectTrigger className="h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os lados</SelectItem>
            <SelectItem value="top">Topo</SelectItem>
            <SelectItem value="right">Direita</SelectItem>
            <SelectItem value="bottom">Baixo</SelectItem>
            <SelectItem value="left">Esquerda</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1">
          <input
            type="color"
            value={color}
            onChange={e => setColor(e.target.value)}
            className="w-7 h-7 rounded border border-slate-200 dark:border-slate-600 cursor-pointer"
          />
          <Input
            type="number"
            value={width}
            onChange={e => setWidth(parseFloat(e.target.value) || 0.3)}
            className="h-7 text-xs w-16"
            step={0.1}
            min={0}
          />
          <Select
            value={style}
            onValueChange={v => setStyle(v as BorderStyle['style'])}
          >
            <SelectTrigger className="h-7 text-xs flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solid">Sólido</SelectItem>
              <SelectItem value="dashed">Tracejado</SelectItem>
              <SelectItem value="dotted">Pontilhado</SelectItem>
              <SelectItem value="none">Nenhum</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-7 text-xs"
            onClick={applyBorder}
          >
            Aplicar
          </Button>
          {borders && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={onClear}
            >
              Limpar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default TableConfigPanel;
