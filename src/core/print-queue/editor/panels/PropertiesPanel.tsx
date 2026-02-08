'use client';

/**
 * Label Studio - Properties Panel
 * Painel de propriedades unificado (sem tabs) do elemento selecionado
 */

import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronRight,
  CopyPlus,
  Italic,
  Layers,
  PanelRightClose,
  PanelRightOpen,
  Strikethrough,
  Trash2,
  Underline,
} from 'lucide-react';
import React, { useMemo } from 'react';
import { useEditorStore } from '../stores/editorStore';
import type { LabelElement, TextStyle } from '../studio-types';
import { BarcodeConfigPanel } from './BarcodeConfigPanel';
import { FieldConfigPanel } from './FieldConfigPanel';
import { QRCodeConfigPanel } from './QRCodeConfigPanel';
import { TableConfigPanel } from './TableConfigPanel';

interface PropertiesPanelProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

/**
 * Collapsible section wrapper
 */
function Section({
  icon: Icon,
  title,
  children,
  defaultOpen = true,
}: {
  icon?: React.ElementType;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <Collapsible defaultOpen={defaultOpen}>
      <CollapsibleTrigger className="flex items-center gap-1.5 w-full py-1.5 group">
        <ChevronRight className="h-3 w-3 text-slate-400 transition-transform group-data-[state=open]:rotate-90" />
        {Icon && <Icon className="h-3.5 w-3.5 text-slate-400" />}
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {title}
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="pl-1 pb-3 space-y-2">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

/**
 * Toggle button for text formatting
 */
function ToggleButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-7 w-7',
              active &&
                'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
            )}
            onClick={onClick}
          >
            <Icon className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Position fields (X, Y, W, H) - shared by all element types
 */
function PositionFields({
  element,
  onUpdate,
}: {
  element: LabelElement;
  onUpdate: (updates: Partial<LabelElement>) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div>
        <Label className="text-xs">X (mm)</Label>
        <Input
          type="number"
          value={element.x.toFixed(1)}
          onChange={e => onUpdate({ x: parseFloat(e.target.value) || 0 })}
          className="h-7 text-xs"
          step={0.5}
        />
      </div>
      <div>
        <Label className="text-xs">Y (mm)</Label>
        <Input
          type="number"
          value={element.y.toFixed(1)}
          onChange={e => onUpdate({ y: parseFloat(e.target.value) || 0 })}
          className="h-7 text-xs"
          step={0.5}
        />
      </div>
      <div>
        <Label className="text-xs">Largura (mm)</Label>
        <Input
          type="number"
          value={element.width.toFixed(1)}
          onChange={e => onUpdate({ width: parseFloat(e.target.value) || 1 })}
          className="h-7 text-xs"
          step={0.5}
          min={1}
        />
      </div>
      <div>
        <Label className="text-xs">Altura (mm)</Label>
        <Input
          type="number"
          value={element.height.toFixed(1)}
          onChange={e =>
            onUpdate({ height: parseFloat(e.target.value) || 1 })
          }
          className="h-7 text-xs"
          step={0.5}
          min={1}
        />
      </div>
    </div>
  );
}

/**
 * Text style fields (font, size, color, formatting, alignment) - used by text and field
 */
function TextStyleFields({
  textStyle,
  updateTextStyle,
}: {
  textStyle: TextStyle;
  updateTextStyle: (updates: Partial<TextStyle>) => void;
}) {
  return (
    <>
      <Section title="Fonte">
        <div className="space-y-2">
          <Select
            value={textStyle.fontFamily}
            onValueChange={v => updateTextStyle({ fontFamily: v })}
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
          {/* Font size + Color on same line */}
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={textStyle.fontSize}
              onChange={e =>
                updateTextStyle({
                  fontSize: parseFloat(e.target.value) || 3,
                })
              }
              className="h-7 text-xs w-16"
              step={0.5}
              min={1}
            />
            <span className="text-xs text-slate-400">mm</span>
            <div className="flex items-center gap-1 ml-auto">
              <input
                type="color"
                value={textStyle.color}
                onChange={e => updateTextStyle({ color: e.target.value })}
                className="w-7 h-7 rounded border border-slate-200 dark:border-slate-600 cursor-pointer"
              />
              <Input
                value={textStyle.color}
                onChange={e => updateTextStyle({ color: e.target.value })}
                className="h-7 text-xs w-20"
              />
            </div>
          </div>
        </div>
      </Section>

      {/* Formatting + Alignment */}
      <div className="pl-1 pb-2 space-y-2">
        <div className="flex items-center gap-0.5">
          <ToggleButton
            icon={Bold}
            label="Negrito"
            active={textStyle.fontWeight === 'bold'}
            onClick={() =>
              updateTextStyle({
                fontWeight:
                  textStyle.fontWeight === 'bold' ? 'normal' : 'bold',
              })
            }
          />
          <ToggleButton
            icon={Italic}
            label="Itálico"
            active={textStyle.fontStyle === 'italic'}
            onClick={() =>
              updateTextStyle({
                fontStyle:
                  textStyle.fontStyle === 'italic' ? 'normal' : 'italic',
              })
            }
          />
          <ToggleButton
            icon={Underline}
            label="Sublinhado"
            active={textStyle.textDecoration === 'underline'}
            onClick={() =>
              updateTextStyle({
                textDecoration:
                  textStyle.textDecoration === 'underline'
                    ? 'none'
                    : 'underline',
              })
            }
          />
          <ToggleButton
            icon={Strikethrough}
            label="Tachado"
            active={textStyle.textDecoration === 'line-through'}
            onClick={() =>
              updateTextStyle({
                textDecoration:
                  textStyle.textDecoration === 'line-through'
                    ? 'none'
                    : 'line-through',
              })
            }
          />
          <div className="w-px h-4 bg-slate-200 dark:bg-slate-600 mx-1" />
          <ToggleButton
            icon={AlignLeft}
            label="Esquerda"
            active={textStyle.textAlign === 'left'}
            onClick={() => updateTextStyle({ textAlign: 'left' })}
          />
          <ToggleButton
            icon={AlignCenter}
            label="Centro"
            active={textStyle.textAlign === 'center'}
            onClick={() => updateTextStyle({ textAlign: 'center' })}
          />
          <ToggleButton
            icon={AlignRight}
            label="Direita"
            active={textStyle.textAlign === 'right'}
            onClick={() => updateTextStyle({ textAlign: 'right' })}
          />
          <ToggleButton
            icon={AlignJustify}
            label="Justificado"
            active={textStyle.textAlign === 'justify'}
            onClick={() => updateTextStyle({ textAlign: 'justify' })}
          />
        </div>
      </div>
    </>
  );
}

/**
 * Render properties based on element type (unified, no tabs)
 */
function ElementProperties({
  element,
  onUpdate,
  selectedCell,
  onSelectCell,
}: {
  element: LabelElement;
  onUpdate: (updates: Partial<LabelElement>) => void;
  selectedCell: { row: number; col: number } | null;
  onSelectCell: (cell: { row: number; col: number } | null) => void;
}) {
  // Text style helpers
  const getTextStyle = (): TextStyle | undefined => {
    if (element.type === 'text') return element.style;
    if (element.type === 'field') return element.valueStyle;
    return undefined;
  };

  const updateTextStyle = (updates: Partial<TextStyle>) => {
    if (element.type === 'text') {
      onUpdate({ style: { ...element.style, ...updates } });
    } else if (element.type === 'field') {
      onUpdate({ valueStyle: { ...element.valueStyle, ...updates } });
    }
  };

  const textStyle = getTextStyle();

  return (
    <div className="space-y-2 p-3">
      {/* Position fields - always shown */}
      <PositionFields element={element} onUpdate={onUpdate} />

      {/* === TEXT === */}
      {element.type === 'text' && (
        <>
          <Section title="Conteúdo">
            <Input
              value={element.content}
              onChange={e => onUpdate({ content: e.target.value })}
              placeholder="Texto..."
              className="h-7 text-xs"
            />
          </Section>
          {textStyle && (
            <TextStyleFields
              textStyle={textStyle}
              updateTextStyle={updateTextStyle}
            />
          )}
        </>
      )}

      {/* === FIELD === */}
      {element.type === 'field' && (
        <>
          <FieldConfigPanel element={element} onUpdate={onUpdate} />
          {textStyle && (
            <>
              <div className="border-t border-slate-200/50 dark:border-slate-700/50 my-2" />
              <TextStyleFields
                textStyle={textStyle}
                updateTextStyle={updateTextStyle}
              />
            </>
          )}
        </>
      )}

      {/* === IMAGE === */}
      {element.type === 'image' && (
        <Section title="Imagem">
          <div className="space-y-2">
            <div>
              <Label className="text-xs">URL</Label>
              <Input
                value={element.src}
                onChange={e => onUpdate({ src: e.target.value })}
                placeholder="https://..."
                className="h-7 text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Ajuste</Label>
                <Select
                  value={element.objectFit}
                  onValueChange={v =>
                    onUpdate({
                      objectFit: v as 'contain' | 'cover' | 'fill' | 'none',
                    })
                  }
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contain">Conter</SelectItem>
                    <SelectItem value="cover">Cobrir</SelectItem>
                    <SelectItem value="fill">Preencher</SelectItem>
                    <SelectItem value="none">Nenhum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Borda (mm)</Label>
                <Input
                  type="number"
                  value={element.borderRadius ?? 0}
                  onChange={e =>
                    onUpdate({
                      borderRadius: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="h-7 text-xs"
                  step={0.5}
                  min={0}
                />
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* === ICON === */}
      {element.type === 'icon' && (
        <Section title="Ícone">
          <div className="flex items-center gap-1">
            <input
              type="color"
              value={element.color}
              onChange={e => onUpdate({ color: e.target.value })}
              className="w-7 h-7 rounded border border-slate-200 dark:border-slate-600 cursor-pointer"
            />
            <Input
              value={element.color}
              onChange={e => onUpdate({ color: e.target.value })}
              className="h-7 text-xs flex-1"
            />
          </div>
        </Section>
      )}

      {/* === SHAPE === */}
      {element.type === 'shape' && (
        <Section title="Aparência">
          <div className="space-y-2">
            <div>
              <Label className="text-xs">Preenchimento</Label>
              <div className="flex items-center gap-1">
                <input
                  type="color"
                  value={element.fill}
                  onChange={e => onUpdate({ fill: e.target.value })}
                  className="w-7 h-7 rounded border border-slate-200 dark:border-slate-600 cursor-pointer"
                />
                <Input
                  value={element.fill}
                  onChange={e => onUpdate({ fill: e.target.value })}
                  className="h-7 text-xs flex-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">Borda</Label>
              <div className="flex items-center gap-1">
                <input
                  type="color"
                  value={element.stroke.color}
                  onChange={e =>
                    onUpdate({
                      stroke: { ...element.stroke, color: e.target.value },
                    })
                  }
                  className="w-7 h-7 rounded border border-slate-200 dark:border-slate-600 cursor-pointer"
                />
                <Input
                  type="number"
                  value={element.stroke.width}
                  onChange={e =>
                    onUpdate({
                      stroke: {
                        ...element.stroke,
                        width: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  className="h-7 text-xs w-16"
                  step={0.1}
                  min={0}
                />
                <Select
                  value={element.stroke.style}
                  onValueChange={v =>
                    onUpdate({
                      stroke: {
                        ...element.stroke,
                        style: v as 'solid' | 'dashed' | 'dotted' | 'double' | 'none',
                      },
                    })
                  }
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
            </div>
            {element.shapeType === 'rectangle' && (
              <div>
                <Label className="text-xs">Raio da borda (mm)</Label>
                <Input
                  type="number"
                  value={element.borderRadius ?? 0}
                  onChange={e =>
                    onUpdate({
                      borderRadius: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="h-7 text-xs"
                  step={0.5}
                  min={0}
                />
              </div>
            )}
          </div>
        </Section>
      )}

      {/* === LINE === */}
      {element.type === 'line' && (
        <Section title="Traço">
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <input
                type="color"
                value={element.color}
                onChange={e => onUpdate({ color: e.target.value })}
                className="w-7 h-7 rounded border border-slate-200 dark:border-slate-600 cursor-pointer"
              />
              <Input
                value={element.color}
                onChange={e => onUpdate({ color: e.target.value })}
                className="h-7 text-xs flex-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Espessura</Label>
                <Input
                  type="number"
                  value={element.strokeWidth}
                  onChange={e =>
                    onUpdate({
                      strokeWidth: parseFloat(e.target.value) || 0.3,
                    })
                  }
                  className="h-7 text-xs"
                  step={0.1}
                  min={0.1}
                />
              </div>
              <div>
                <Label className="text-xs">Estilo</Label>
                <Select
                  value={element.strokeStyle}
                  onValueChange={v =>
                    onUpdate({
                      strokeStyle: v as typeof element.strokeStyle,
                    })
                  }
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solid">Sólido</SelectItem>
                    <SelectItem value="dashed">Tracejado</SelectItem>
                    <SelectItem value="dotted">Pontilhado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs">Orientação</Label>
              <Select
                value={element.orientation}
                onValueChange={v =>
                  onUpdate({
                    orientation: v as typeof element.orientation,
                  })
                }
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="horizontal">Horizontal</SelectItem>
                  <SelectItem value="vertical">Vertical</SelectItem>
                  <SelectItem value="diagonal">Diagonal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Section>
      )}

      {/* === ARROW === */}
      {element.type === 'arrow' && (
        <Section title="Seta">
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <input
                type="color"
                value={element.color}
                onChange={e => onUpdate({ color: e.target.value })}
                className="w-7 h-7 rounded border border-slate-200 dark:border-slate-600 cursor-pointer"
              />
              <Input
                value={element.color}
                onChange={e => onUpdate({ color: e.target.value })}
                className="h-7 text-xs flex-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Espessura</Label>
                <Input
                  type="number"
                  value={element.strokeWidth}
                  onChange={e =>
                    onUpdate({
                      strokeWidth: parseFloat(e.target.value) || 0.5,
                    })
                  }
                  className="h-7 text-xs"
                  step={0.1}
                  min={0.1}
                />
              </div>
              <div>
                <Label className="text-xs">Estilo</Label>
                <Select
                  value={element.arrowStyle}
                  onValueChange={v =>
                    onUpdate({
                      arrowStyle: v as typeof element.arrowStyle,
                    })
                  }
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simple">Simples</SelectItem>
                    <SelectItem value="double">Dupla</SelectItem>
                    <SelectItem value="curved">Curva</SelectItem>
                    <SelectItem value="thick">Grossa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs">Ponta</Label>
              <Select
                value={element.headStyle}
                onValueChange={v =>
                  onUpdate({
                    headStyle: v as typeof element.headStyle,
                  })
                }
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="filled">Preenchida</SelectItem>
                  <SelectItem value="outline">Contorno</SelectItem>
                  <SelectItem value="none">Nenhuma</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Section>
      )}

      {/* === BARCODE === */}
      {element.type === 'barcode' && (
        <BarcodeConfigPanel element={element} onUpdate={onUpdate} />
      )}

      {/* === QRCODE === */}
      {element.type === 'qrcode' && (
        <QRCodeConfigPanel element={element} onUpdate={onUpdate} />
      )}

      {/* === TABLE === */}
      {element.type === 'table' && (
        <TableConfigPanel
          element={element}
          onUpdate={onUpdate}
          selectedCell={selectedCell}
          onSelectCell={onSelectCell}
        />
      )}
    </div>
  );
}

/**
 * Painel de propriedades unificado (sem tabs)
 */
export function PropertiesPanel({
  collapsed,
  onToggleCollapse,
  className,
}: PropertiesPanelProps) {
  const elements = useEditorStore(s => s.elements);
  const selectedIds = useEditorStore(s => s.selectedIds);
  const updateElement = useEditorStore(s => s.updateElement);
  const deleteElements = useEditorStore(s => s.deleteElements);
  const duplicateElements = useEditorStore(s => s.duplicateElements);
  const selectedCell = useEditorStore(s => s.selectedCell);
  const setSelectedCell = useEditorStore(s => s.setSelectedCell);

  const selectedElements = useMemo(
    () => elements.filter(el => selectedIds.includes(el.id)),
    [elements, selectedIds]
  );

  // Collapsed view
  if (collapsed) {
    return (
      <div
        className={cn(
          'w-12 flex flex-col items-center py-2 bg-white/80 dark:bg-slate-800/40 backdrop-blur-sm border-l border-slate-200/50 dark:border-slate-700/50',
          className
        )}
      >
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="link"
                size="icon"
                className="h-8 w-8"
                onClick={onToggleCollapse}
              >
                <PanelRightOpen className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">Expandir propriedades</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  // Panel content
  const panelContent = (() => {
    // No selection
    if (selectedElements.length === 0) {
      return (
        <div className="p-4 text-center flex-1 flex flex-col justify-center">
          <Layers className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Nenhum elemento selecionado
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Selecione um elemento no canvas para editar
          </p>
        </div>
      );
    }

    // Multiple selection
    if (selectedElements.length > 1) {
      return (
        <div className="p-4">
          <div className="py-4 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {selectedElements.length} elementos selecionados
            </p>
          </div>
          <div className="flex gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-7 text-xs"
              onClick={() =>
                duplicateElements(selectedElements.map(e => e.id))
              }
            >
              <CopyPlus className="h-3.5 w-3.5 mr-1" />
              Duplicar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="flex-1 h-7 text-xs"
              onClick={() =>
                deleteElements(selectedElements.map(e => e.id))
              }
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Excluir
            </Button>
          </div>
        </div>
      );
    }

    // Single element selected
    const element = selectedElements[0];
    const handleUpdate = (updates: Partial<LabelElement>) => {
      updateElement(element.id, updates);
    };

    return (
      <>
        {/* Element type badge */}
        <div className="px-3 pt-3 pb-1">
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            {element.type}
          </span>
        </div>

        {/* Unified properties */}
        <div className="flex-1 overflow-y-auto">
          <ElementProperties
            element={element}
            onUpdate={handleUpdate}
            selectedCell={selectedCell}
            onSelectCell={setSelectedCell}
          />
        </div>
      </>
    );
  })();

  return (
    <div
      className={cn(
        'w-72 flex flex-col bg-white/80 dark:bg-slate-800/40 backdrop-blur-sm border-l border-slate-200/50 dark:border-slate-700/50 overflow-hidden',
        className
      )}
    >
      {/* Panel header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-200/50 dark:border-slate-700/50 shrink-0">
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Propriedades
        </h3>
        <Button
          variant="link"
          size="icon"
          className="h-7 w-7"
          onClick={onToggleCollapse}
        >
          <PanelRightClose className="h-4 w-4" />
        </Button>
      </div>

      {panelContent}
    </div>
  );
}

export default PropertiesPanel;
