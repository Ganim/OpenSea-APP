'use client';

/**
 * Label Studio - Main Toolbar
 * Barra de ferramentas superior do editor
 */

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  AlignCenter,
  AlignCenterVertical,
  AlignEndVertical,
  AlignLeft,
  AlignRight,
  AlignStartVertical,
  ArrowLeftRight,
  ChevronDown,
  CopyPlus,
  Crosshair,
  Eye,
  EyeOff,
  Grid3X3,
  GripVertical,
  Layers,
  Lock,
  Magnet,
  Redo2,
  Ruler,
  Trash2,
  Undo2,
  Unlock,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BiChevronDown,
  BiChevronsDown,
  BiChevronsUp,
  BiChevronUp,
} from 'react-icons/bi';
import { RxAngle, RxTransparencyGrid } from 'react-icons/rx';
import { buildSamplePreviewData } from '../elements/FieldElementRenderer';
import { editorSelectors, useEditorStore } from '../stores/editorStore';
import type { LabelElement } from '../studio-types';

const SIZE_PRESETS = [
  { label: '100 × 150 mm', width: 100, height: 150 },
  { label: '100 × 100 mm', width: 100, height: 100 },
  { label: '60 × 40 mm', width: 60, height: 40 },
  { label: '40 × 25 mm', width: 40, height: 25 },
  { label: '30 × 50 mm', width: 30, height: 50 },
  { label: '30 × 40 mm', width: 30, height: 40 },
];

interface MainToolbarProps {
  onFitToScreen?: () => void;
  className?: string;
}

/**
 * Botão de ação com tooltip
 */
function ToolbarButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  active,
  shortcut,
}: {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  shortcut?: string;
}) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-8 w-8',
              active &&
                'bg-slate-100 dark:bg-gray-800/80 text-blue-600 dark:text-blue-400'
            )}
            onClick={onClick}
            disabled={disabled}
          >
            <Icon className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>
            {label}
            {shortcut && (
              <span className="ml-2 text-slate-400">{shortcut}</span>
            )}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Mapa de nomes amigáveis por tipo de elemento
 */
const ELEMENT_TYPE_LABELS: Record<string, string> = {
  text: 'Texto',
  field: 'Campo',
  image: 'Imagem',
  icon: 'Ícone',
  shape: 'Forma',
  line: 'Linha',
  arrow: 'Seta',
  barcode: 'Código de Barras',
  qrcode: 'QR Code',
  table: 'Tabela',
};

/**
 * Layers popover - painel de camadas estilo Photoshop
 */
function LayersPopover({
  elements,
  selectedIds,
  onSelect,
  onUpdate,
  onMoveForward,
  onMoveBackward,
  onBringToFront,
  onSendToBack,
  onDelete,
}: {
  elements: LabelElement[];
  selectedIds: string[];
  onSelect: (ids: string[], addToSelection?: boolean) => void;
  onUpdate: (id: string, updates: Partial<LabelElement>) => void;
  onMoveForward: (id: string) => void;
  onMoveBackward: (id: string) => void;
  onBringToFront: (id: string) => void;
  onSendToBack: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [editingNameId, setEditingNameId] = useState<string | null>(null);

  // Sort by zIndex descending (top layer first, like Photoshop)
  const sortedElements = useMemo(
    () => [...elements].sort((a, b) => b.zIndex - a.zIndex),
    [elements]
  );

  const getDisplayName = (el: LabelElement) =>
    el.name || ELEMENT_TYPE_LABELS[el.type] || el.type;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div>
          <ToolbarButton icon={Layers} label="Camadas" />
        </div>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-72 p-0 max-h-80 overflow-hidden flex flex-col"
      >
        <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
            Camadas ({elements.length})
          </span>
        </div>
        <div className="overflow-y-auto flex-1">
          {sortedElements.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-xs text-slate-400">Nenhum elemento</p>
            </div>
          ) : (
            sortedElements.map(el => {
              const isSelected = selectedIds.includes(el.id);
              return (
                <div
                  key={el.id}
                  className={cn(
                    'flex items-center gap-1 px-2 py-1.5 border-b border-slate-100 dark:border-slate-700/50 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors',
                    isSelected && 'bg-blue-50 dark:bg-blue-900/20'
                  )}
                  onClick={() => onSelect([el.id])}
                >
                  {/* Drag handle indicator */}
                  <GripVertical className="h-3 w-3 text-slate-300 dark:text-slate-600 shrink-0" />

                  {/* Element name */}
                  <div className="flex-1 min-w-0">
                    {editingNameId === el.id ? (
                      <input
                        autoFocus
                        defaultValue={el.name || ''}
                        placeholder={ELEMENT_TYPE_LABELS[el.type] || el.type}
                        className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-1.5 py-0.5 outline-none focus:border-blue-500"
                        onBlur={e => {
                          onUpdate(el.id, {
                            name: e.target.value || undefined,
                          });
                          setEditingNameId(null);
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            onUpdate(el.id, {
                              name:
                                (e.target as HTMLInputElement).value ||
                                undefined,
                            });
                            setEditingNameId(null);
                          }
                          if (e.key === 'Escape') setEditingNameId(null);
                        }}
                        onClick={e => e.stopPropagation()}
                      />
                    ) : (
                      <span
                        className={cn(
                          'text-xs truncate block',
                          isSelected
                            ? 'text-blue-700 dark:text-blue-300 font-medium'
                            : 'text-slate-600 dark:text-slate-300'
                        )}
                        onDoubleClick={e => {
                          e.stopPropagation();
                          setEditingNameId(el.id);
                        }}
                      >
                        {getDisplayName(el)}
                      </span>
                    )}
                  </div>

                  {/* Layer type badge */}
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase shrink-0">
                    {el.type}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={e => {
                        e.stopPropagation();
                        onUpdate(el.id, { visible: !el.visible });
                      }}
                    >
                      {el.visible ? (
                        <Eye className="h-3 w-3 text-slate-400" />
                      ) : (
                        <EyeOff className="h-3 w-3 text-slate-300" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={e => {
                        e.stopPropagation();
                        onUpdate(el.id, { locked: !el.locked });
                      }}
                    >
                      {el.locked ? (
                        <Lock className="h-3 w-3 text-amber-500" />
                      ) : (
                        <Unlock className="h-3 w-3 text-slate-300" />
                      )}
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
        {/* Layer order actions for selected element */}
        {selectedIds.length === 1 && (
          <div className="px-2 py-1.5 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-0.5">
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => onBringToFront(selectedIds[0])}
                    >
                      <BiChevronsUp className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Trazer para frente</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => onMoveForward(selectedIds[0])}
                    >
                      <BiChevronUp className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Avançar camada</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => onMoveBackward(selectedIds[0])}
                    >
                      <BiChevronDown className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Recuar camada</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => onSendToBack(selectedIds[0])}
                    >
                      <BiChevronsDown className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Enviar para trás</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={() => onDelete(selectedIds[0])}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Excluir</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

/**
 * Componente principal da Toolbar
 */
export function MainToolbar({ onFitToScreen, className }: MainToolbarProps) {
  // Store state
  const canvasWidth = useEditorStore(s => s.canvasWidth);
  const canvasHeight = useEditorStore(s => s.canvasHeight);
  const zoom = useEditorStore(s => s.zoom);
  const showGrid = useEditorStore(s => s.showGrid);
  const showRulers = useEditorStore(s => s.showRulers);
  const snapEnabled = useEditorStore(s => s.snapEnabled);
  const canUndo = useEditorStore(editorSelectors.canUndo);
  const canRedo = useEditorStore(editorSelectors.canRedo);
  const hasSelection = useEditorStore(editorSelectors.hasSelection);
  const selectedIds = useEditorStore(s => s.selectedIds);
  const previewData = useEditorStore(s => s.previewData);
  const setPreviewData = useEditorStore(s => s.setPreviewData);

  // Store actions
  const setCanvasSize = useEditorStore(s => s.setCanvasSize);
  const setZoom = useEditorStore(s => s.setZoom);
  const zoomIn = useEditorStore(s => s.zoomIn);
  const zoomOut = useEditorStore(s => s.zoomOut);
  const scrollLocked = useEditorStore(s => s.scrollLocked);
  const toggleGrid = useEditorStore(s => s.toggleGrid);
  const toggleRulers = useEditorStore(s => s.toggleRulers);
  const toggleSnap = useEditorStore(s => s.toggleSnap);
  const toggleScrollLock = useEditorStore(s => s.toggleScrollLock);
  const undo = useEditorStore(s => s.undo);
  const redo = useEditorStore(s => s.redo);
  const duplicateElements = useEditorStore(s => s.duplicateElements);
  const deleteElements = useEditorStore(s => s.deleteElements);
  const alignElements = useEditorStore(s => s.alignElements);
  const elements = useEditorStore(s => s.elements);
  const updateElement = useEditorStore(s => s.updateElement);
  const selectElements = useEditorStore(s => s.selectElements);
  const bringToFront = useEditorStore(s => s.bringToFront);
  const sendToBack = useEditorStore(s => s.sendToBack);
  const moveForward = useEditorStore(s => s.moveForward);
  const moveBackward = useEditorStore(s => s.moveBackward);

  // Local state for size inputs
  const [localWidth, setLocalWidth] = useState(String(canvasWidth));
  const [localHeight, setLocalHeight] = useState(String(canvasHeight));

  useEffect(() => {
    setLocalWidth(String(canvasWidth));
  }, [canvasWidth]);

  useEffect(() => {
    setLocalHeight(String(canvasHeight));
  }, [canvasHeight]);

  const commitWidth = useCallback(() => {
    const value = parseInt(localWidth, 10);
    if (!isNaN(value) && value >= 10 && value <= 300) {
      setCanvasSize(value, canvasHeight);
    } else {
      setLocalWidth(String(canvasWidth));
    }
  }, [localWidth, canvasWidth, canvasHeight, setCanvasSize]);

  const commitHeight = useCallback(() => {
    const value = parseInt(localHeight, 10);
    if (!isNaN(value) && value >= 10 && value <= 300) {
      setCanvasSize(canvasWidth, value);
    } else {
      setLocalHeight(String(canvasHeight));
    }
  }, [localHeight, canvasWidth, canvasHeight, setCanvasSize]);

  const handleSwapDimensions = useCallback(() => {
    setCanvasSize(canvasHeight, canvasWidth);
  }, [canvasWidth, canvasHeight, setCanvasSize]);

  const handlePresetSelect = useCallback(
    (width: number, height: number) => {
      setCanvasSize(width, height);
    },
    [setCanvasSize]
  );

  const handleDelete = () => {
    if (selectedIds.length > 0) {
      deleteElements(selectedIds);
    }
  };

  const isPreviewActive = previewData != null;

  const handleTogglePreview = useCallback(() => {
    if (isPreviewActive) {
      setPreviewData(null);
    } else {
      setPreviewData(buildSamplePreviewData());
    }
  }, [isPreviewActive, setPreviewData]);

  return (
    <div
      className={cn(
        'flex items-center gap-1 px-2 py-2 bg-white dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-700',
        className
      )}
    >
      {/* Undo/Redo */}
      <div className="flex items-center">
        <ToolbarButton
          icon={Undo2}
          label="Desfazer"
          shortcut="Ctrl+Z"
          onClick={undo}
          disabled={!canUndo}
        />
        <ToolbarButton
          icon={Redo2}
          label="Refazer"
          shortcut="Ctrl+Y"
          onClick={redo}
          disabled={!canRedo}
        />
      </div>

      <Separator orientation="vertical" className="h-4 mx-1 border" />

      {/* Canvas size */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-slate-400 mr-1">Tamanho</span>
        <Input
          type="number"
          value={localWidth}
          onChange={e => setLocalWidth(e.target.value)}
          onBlur={commitWidth}
          onKeyDown={e => e.key === 'Enter' && commitWidth()}
          className="w-14 h-7 text-xs text-center px-1"
          min={10}
          max={300}
        />
        {/* Swap dimensions */}
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleSwapDimensions}
              >
                <ArrowLeftRight className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Trocar largura ↔ altura</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Input
          type="number"
          value={localHeight}
          onChange={e => setLocalHeight(e.target.value)}
          onBlur={commitHeight}
          onKeyDown={e => e.key === 'Enter' && commitHeight()}
          className="w-14 h-7 text-xs text-center px-1"
          min={10}
          max={300}
        />
        <span className="text-xs text-slate-400">mm</span>
        {/* Presets dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-1.5 text-xs gap-0.5"
            >
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {SIZE_PRESETS.map(preset => (
              <DropdownMenuItem
                key={preset.label}
                onClick={() => handlePresetSelect(preset.width, preset.height)}
              >
                <span className="text-xs">{preset.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Separator orientation="vertical" className="h-4 mx-1 border" />

      {/* Alignment + Copy + Delete */}
      <div className="flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              disabled={selectedIds.length < 2}
            >
              <AlignLeft className="h-4 w-4 mr-1" />
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => alignElements('left')}>
              <AlignLeft className="h-4 w-4 mr-2" />
              Alinhar à esquerda
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => alignElements('center-h')}>
              <AlignCenter className="h-4 w-4 mr-2" />
              Centralizar horizontalmente
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => alignElements('right')}>
              <AlignRight className="h-4 w-4 mr-2" />
              Alinhar à direita
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => alignElements('top')}>
              <AlignStartVertical className="h-4 w-4 mr-2" />
              Alinhar ao topo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => alignElements('center-v')}>
              <AlignCenterVertical className="h-4 w-4 mr-2" />
              Centralizar verticalmente
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => alignElements('bottom')}>
              <AlignEndVertical className="h-4 w-4 mr-2" />
              Alinhar à base
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Separator orientation="vertical" className="h-4 mx-1 border" />

      {/* Rotation + Opacity */}
      <div className="flex items-center gap-1">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-0.5">
                <RxAngle className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <Input
                  type="number"
                  value={
                    hasSelection && selectedIds.length === 1
                      ? Math.round(
                          elements.find(el => el.id === selectedIds[0])
                            ?.rotation ?? 0
                        )
                      : ''
                  }
                  onChange={e => {
                    if (selectedIds.length === 1) {
                      const val = parseFloat(e.target.value) || 0;
                      updateElement(selectedIds[0], { rotation: val });
                    }
                  }}
                  className="w-14 h-7 text-xs text-center px-1"
                  step={15}
                  disabled={!hasSelection || selectedIds.length !== 1}
                  placeholder="0°"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">Rotação (°)</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-0.5">
                <RxTransparencyGrid className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <Input
                  type="number"
                  value={
                    hasSelection && selectedIds.length === 1
                      ? Math.round(
                          (elements.find(el => el.id === selectedIds[0])
                            ?.opacity ?? 1) * 100
                        )
                      : ''
                  }
                  onChange={e => {
                    if (selectedIds.length === 1) {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) {
                        updateElement(selectedIds[0], {
                          opacity: Math.max(0, Math.min(100, val)) / 100,
                        });
                      }
                    }
                  }}
                  className="w-14 h-7 text-xs text-center px-1"
                  step={5}
                  min={0}
                  max={100}
                  disabled={!hasSelection || selectedIds.length !== 1}
                  placeholder="100%"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">Opacidade (%)</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Separator orientation="vertical" className="h-4 mx-1 border" />

      <div className="flex items-center">
        <ToolbarButton
          icon={CopyPlus}
          label="Duplicar"
          shortcut="Ctrl+D"
          onClick={() =>
            selectedIds.length > 0 && duplicateElements(selectedIds)
          }
          disabled={!hasSelection}
        />
        <ToolbarButton
          icon={Trash2}
          label="Excluir"
          shortcut="Del"
          onClick={handleDelete}
          disabled={!hasSelection}
        />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* View toggles */}
      <div className="flex items-center gap-1">
        <ToolbarButton
          icon={Grid3X3}
          label="Grade"
          onClick={toggleGrid}
          active={showGrid}
        />
        <ToolbarButton
          icon={Ruler}
          label="Réguas"
          onClick={toggleRulers}
          active={showRulers}
        />
        <ToolbarButton
          icon={Magnet}
          label="Snap"
          onClick={toggleSnap}
          active={snapEnabled}
        />
        <ToolbarButton
          icon={scrollLocked ? Lock : Unlock}
          label={scrollLocked ? 'Liberar scroll' : 'Travar scroll'}
          onClick={toggleScrollLock}
          active={scrollLocked}
        />
      </div>
      <Separator orientation="vertical" className="h-6 mx-1 border" />

      <div className="flex items-center gap-0.5">
        {/* Layers */}
        <LayersPopover
          elements={elements}
          selectedIds={selectedIds}
          onSelect={selectElements}
          onUpdate={updateElement}
          onMoveForward={moveForward}
          onMoveBackward={moveBackward}
          onBringToFront={bringToFront}
          onSendToBack={sendToBack}
          onDelete={id => deleteElements([id])}
        />
      </div>

      <Separator orientation="vertical" className="h-6 mx-1 border" />

      {/* Preview toggle */}
      <ToolbarButton
        icon={isPreviewActive ? EyeOff : Eye}
        label={isPreviewActive ? 'Desativar preview' : 'Preview com dados'}
        onClick={handleTogglePreview}
        active={isPreviewActive}
      />

      <Separator orientation="vertical" className="h-6 mx-1 border" />

      {/* Zoom */}
      <div className="flex items-center gap-0.5">
        <ToolbarButton
          icon={ZoomOut}
          label="Reduzir zoom"
          shortcut="Ctrl+-"
          onClick={zoomOut}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-14 text-xs">
              {Math.round(zoom * 100)}%
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            {[50, 75, 100, 125, 150, 200, 300].map(level => (
              <DropdownMenuItem
                key={level}
                onClick={() => setZoom(level / 100)}
              >
                {level}%
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <ToolbarButton
          icon={ZoomIn}
          label="Aumentar zoom"
          shortcut="Ctrl++"
          onClick={zoomIn}
        />
        <ToolbarButton
          icon={Crosshair}
          label="Ajustar à tela"
          shortcut="Ctrl+0"
          onClick={onFitToScreen ?? (() => setZoom(1))}
        />
      </div>
    </div>
  );
}

export default MainToolbar;
