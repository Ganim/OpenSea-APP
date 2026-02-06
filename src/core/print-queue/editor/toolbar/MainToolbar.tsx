'use client';

/**
 * Label Studio - Main Toolbar
 * Barra de ferramentas superior do editor
 */

import React from 'react';
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize,
  Grid3X3,
  Ruler,
  Magnet,
  Save,
  Eye,
  Copy,
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
} from 'lucide-react';
import { useEditorStore, editorSelectors } from '../stores/editorStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface MainToolbarProps {
  onSave?: () => void;
  onPreview?: () => void;
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
              active && 'bg-neutral-200 dark:bg-neutral-700'
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
              <span className="ml-2 text-neutral-400">{shortcut}</span>
            )}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Componente principal da Toolbar
 */
export function MainToolbar({ onSave, onPreview, className }: MainToolbarProps) {
  // Store state
  const templateName = useEditorStore((s) => s.templateName);
  const canvasWidth = useEditorStore((s) => s.canvasWidth);
  const canvasHeight = useEditorStore((s) => s.canvasHeight);
  const zoom = useEditorStore((s) => s.zoom);
  const showGrid = useEditorStore((s) => s.showGrid);
  const showRulers = useEditorStore((s) => s.showRulers);
  const snapEnabled = useEditorStore((s) => s.snapEnabled);
  const canUndo = useEditorStore(editorSelectors.canUndo);
  const canRedo = useEditorStore(editorSelectors.canRedo);
  const hasSelection = useEditorStore(editorSelectors.hasSelection);
  const selectedIds = useEditorStore((s) => s.selectedIds);

  // Store actions
  const setTemplateName = useEditorStore((s) => s.setTemplateName);
  const setCanvasSize = useEditorStore((s) => s.setCanvasSize);
  const setZoom = useEditorStore((s) => s.setZoom);
  const zoomIn = useEditorStore((s) => s.zoomIn);
  const zoomOut = useEditorStore((s) => s.zoomOut);
  const toggleGrid = useEditorStore((s) => s.toggleGrid);
  const toggleRulers = useEditorStore((s) => s.toggleRulers);
  const toggleSnap = useEditorStore((s) => s.toggleSnap);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const copy = useEditorStore((s) => s.copy);
  const deleteElements = useEditorStore((s) => s.deleteElements);
  const alignElements = useEditorStore((s) => s.alignElements);

  // Handlers
  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 10 && value <= 300) {
      setCanvasSize(value, canvasHeight);
    }
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 10 && value <= 300) {
      setCanvasSize(canvasWidth, value);
    }
  };

  const handleDelete = () => {
    if (selectedIds.length > 0) {
      deleteElements(selectedIds);
    }
  };

  return (
    <div
      className={cn(
        'flex items-center gap-1 px-2 py-1 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700',
        className
      )}
    >
      {/* Nome do template */}
      <Input
        value={templateName}
        onChange={(e) => setTemplateName(e.target.value)}
        className="w-48 h-8 text-sm"
        placeholder="Nome do template"
      />

      <Separator orientation="vertical" className="h-6 mx-2" />

      {/* Tamanho do canvas */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-neutral-500">Tamanho:</span>
        <Input
          type="number"
          value={canvasWidth}
          onChange={handleWidthChange}
          className="w-14 h-8 text-sm text-center"
          min={10}
          max={300}
        />
        <span className="text-xs text-neutral-500">×</span>
        <Input
          type="number"
          value={canvasHeight}
          onChange={handleHeightChange}
          className="w-14 h-8 text-sm text-center"
          min={10}
          max={300}
        />
        <span className="text-xs text-neutral-500">mm</span>
      </div>

      <Separator orientation="vertical" className="h-6 mx-2" />

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

      <Separator orientation="vertical" className="h-6 mx-2" />

      {/* Clipboard e Delete */}
      <div className="flex items-center">
        <ToolbarButton
          icon={Copy}
          label="Copiar"
          shortcut="Ctrl+C"
          onClick={copy}
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

      <Separator orientation="vertical" className="h-6 mx-2" />

      {/* Alinhamento */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8"
            disabled={selectedIds.length < 2}
          >
            <AlignLeft className="h-4 w-4 mr-1" />
            Alinhar
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

      {/* Spacer */}
      <div className="flex-1" />

      {/* Zoom */}
      <div className="flex items-center gap-1">
        <ToolbarButton
          icon={ZoomOut}
          label="Reduzir zoom"
          shortcut="Ctrl+-"
          onClick={zoomOut}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-16">
              {Math.round(zoom * 100)}%
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            {[50, 75, 100, 125, 150, 200, 300].map((level) => (
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
          icon={Maximize}
          label="Ajustar à tela"
          shortcut="Ctrl+0"
          onClick={() => setZoom(1)}
        />
      </div>

      <Separator orientation="vertical" className="h-6 mx-2" />

      {/* View toggles */}
      <div className="flex items-center">
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
      </div>

      <Separator orientation="vertical" className="h-6 mx-2" />

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" className="h-8" onClick={onPreview}>
          <Eye className="h-4 w-4 mr-1" />
          Preview
        </Button>
        <Button size="sm" className="h-8" onClick={onSave}>
          <Save className="h-4 w-4 mr-1" />
          Salvar
        </Button>
      </div>
    </div>
  );
}

export default MainToolbar;
