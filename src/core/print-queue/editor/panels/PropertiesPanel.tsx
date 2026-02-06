'use client';

/**
 * Label Studio - Properties Panel
 * Painel de propriedades do elemento selecionado
 */

import React from 'react';
import { useEditorStore, editorSelectors } from '../stores/editorStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { FieldConfigPanel } from './FieldConfigPanel';
import { BarcodeConfigPanel } from './BarcodeConfigPanel';
import { QRCodeConfigPanel } from './QRCodeConfigPanel';
import {
  Lock,
  Unlock,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Trash2,
  Copy,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LabelElement, TextStyle } from '../studio-types';

interface PropertiesPanelProps {
  className?: string;
}

/**
 * Seção de posição e tamanho
 */
function PositionSection({
  element,
  onUpdate,
}: {
  element: LabelElement;
  onUpdate: (updates: Partial<LabelElement>) => void;
}) {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
        Posição e Tamanho
      </h4>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">X (mm)</Label>
          <Input
            type="number"
            value={element.x.toFixed(1)}
            onChange={e => onUpdate({ x: parseFloat(e.target.value) || 0 })}
            className="h-8"
            step={0.5}
          />
        </div>
        <div>
          <Label className="text-xs">Y (mm)</Label>
          <Input
            type="number"
            value={element.y.toFixed(1)}
            onChange={e => onUpdate({ y: parseFloat(e.target.value) || 0 })}
            className="h-8"
            step={0.5}
          />
        </div>
        <div>
          <Label className="text-xs">Largura (mm)</Label>
          <Input
            type="number"
            value={element.width.toFixed(1)}
            onChange={e => onUpdate({ width: parseFloat(e.target.value) || 1 })}
            className="h-8"
            step={0.5}
            min={1}
          />
        </div>
        <div>
          <Label className="text-xs">Altura (mm)</Label>
          <Input
            type="number"
            value={element.height.toFixed(1)}
            onChange={e => onUpdate({ height: parseFloat(e.target.value) || 1 })}
            className="h-8"
            step={0.5}
            min={1}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">Rotação (°)</Label>
          <Input
            type="number"
            value={element.rotation}
            onChange={e => onUpdate({ rotation: parseFloat(e.target.value) || 0 })}
            className="h-8"
            step={15}
          />
        </div>
        <div>
          <Label className="text-xs">Opacidade</Label>
          <div className="flex items-center gap-2">
            <Slider
              value={[element.opacity * 100]}
              onValueChange={([value]) => onUpdate({ opacity: value / 100 })}
              max={100}
              step={5}
              className="flex-1"
            />
            <span className="text-xs w-8 text-right">{Math.round(element.opacity * 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Seção de texto (para elementos text)
 */
function TextStyleSection({
  style,
  onUpdate,
}: {
  style: TextStyle;
  onUpdate: (updates: Partial<TextStyle>) => void;
}) {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
        Estilo do Texto
      </h4>
      <div className="space-y-2">
        <div>
          <Label className="text-xs">Fonte</Label>
          <Select value={style.fontFamily} onValueChange={v => onUpdate({ fontFamily: v })}>
            <SelectTrigger className="h-8">
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
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">Tamanho (mm)</Label>
            <Input
              type="number"
              value={style.fontSize}
              onChange={e => onUpdate({ fontSize: parseFloat(e.target.value) || 3 })}
              className="h-8"
              step={0.5}
              min={1}
            />
          </div>
          <div>
            <Label className="text-xs">Peso</Label>
            <Select
              value={style.fontWeight}
              onValueChange={v => onUpdate({ fontWeight: v as TextStyle['fontWeight'] })}
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="bold">Negrito</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">Cor</Label>
            <div className="flex items-center gap-1">
              <input
                type="color"
                value={style.color}
                onChange={e => onUpdate({ color: e.target.value })}
                className="w-8 h-8 rounded border border-neutral-200"
              />
              <Input
                value={style.color}
                onChange={e => onUpdate({ color: e.target.value })}
                className="h-8 flex-1"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">Alinhamento</Label>
            <Select
              value={style.textAlign}
              onValueChange={v => onUpdate({ textAlign: v as TextStyle['textAlign'] })}
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Esquerda</SelectItem>
                <SelectItem value="center">Centro</SelectItem>
                <SelectItem value="right">Direita</SelectItem>
                <SelectItem value="justify">Justificado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Painel de propriedades principal
 */
export function PropertiesPanel({ className }: PropertiesPanelProps) {
  const selectedElements = useEditorStore(editorSelectors.selectedElements);
  const updateElement = useEditorStore(s => s.updateElement);
  const deleteElements = useEditorStore(s => s.deleteElements);
  const duplicateElements = useEditorStore(s => s.duplicateElements);
  const bringToFront = useEditorStore(s => s.bringToFront);
  const sendToBack = useEditorStore(s => s.sendToBack);

  // Se nenhum elemento selecionado
  if (selectedElements.length === 0) {
    return (
      <div className={cn('p-4 text-center', className)}>
        <div className="py-8">
          <Layers className="h-8 w-8 mx-auto text-neutral-300 dark:text-neutral-600 mb-2" />
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Nenhum elemento selecionado
          </p>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
            Selecione um elemento no canvas para editar suas propriedades
          </p>
        </div>
      </div>
    );
  }

  // Se múltiplos elementos selecionados
  if (selectedElements.length > 1) {
    return (
      <div className={cn('p-4', className)}>
        <div className="py-4 text-center">
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            {selectedElements.length} elementos selecionados
          </p>
        </div>
        <Separator className="my-4" />
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => duplicateElements(selectedElements.map(e => e.id))}
          >
            <Copy className="h-4 w-4 mr-1" />
            Duplicar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="flex-1"
            onClick={() => deleteElements(selectedElements.map(e => e.id))}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Excluir
          </Button>
        </div>
      </div>
    );
  }

  // Elemento único selecionado
  const element = selectedElements[0];

  const handleUpdate = (updates: Partial<LabelElement>) => {
    updateElement(element.id, updates);
  };

  return (
    <div className={cn('p-4 space-y-4', className)}>
      {/* Nome e tipo */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">
            {element.type}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => handleUpdate({ locked: !element.locked })}
              title={element.locked ? 'Desbloquear' : 'Bloquear'}
            >
              {element.locked ? (
                <Lock className="h-3 w-3" />
              ) : (
                <Unlock className="h-3 w-3" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => handleUpdate({ visible: !element.visible })}
              title={element.visible ? 'Ocultar' : 'Mostrar'}
            >
              {element.visible ? (
                <Eye className="h-3 w-3" />
              ) : (
                <EyeOff className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
        <Input
          value={element.name || ''}
          onChange={e => handleUpdate({ name: e.target.value })}
          placeholder="Nome do elemento"
          className="h-8"
        />
      </div>

      <Separator />

      {/* Posição e tamanho */}
      <PositionSection element={element} onUpdate={handleUpdate} />

      <Separator />

      {/* Propriedades específicas por tipo */}
      {element.type === 'text' && (
        <TextStyleSection
          style={element.style}
          onUpdate={styleUpdates =>
            handleUpdate({ style: { ...element.style, ...styleUpdates } })
          }
        />
      )}

      {element.type === 'field' && (
        <>
          <FieldConfigPanel element={element} onUpdate={handleUpdate} />
          <Separator />
          <TextStyleSection
            style={element.valueStyle}
            onUpdate={styleUpdates =>
              handleUpdate({
                valueStyle: { ...element.valueStyle, ...styleUpdates },
              })
            }
          />
        </>
      )}

      {element.type === 'shape' && (
        <div className="space-y-3">
          <h4 className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
            Aparência
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Preenchimento</Label>
              <div className="flex items-center gap-1">
                <input
                  type="color"
                  value={element.fill}
                  onChange={e => handleUpdate({ fill: e.target.value })}
                  className="w-8 h-8 rounded border border-neutral-200"
                />
                <Input
                  value={element.fill}
                  onChange={e => handleUpdate({ fill: e.target.value })}
                  className="h-8 flex-1"
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
                    handleUpdate({
                      stroke: { ...element.stroke, color: e.target.value },
                    })
                  }
                  className="w-8 h-8 rounded border border-neutral-200"
                />
                <Input
                  type="number"
                  value={element.stroke.width}
                  onChange={e =>
                    handleUpdate({
                      stroke: {
                        ...element.stroke,
                        width: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  className="h-8 w-16"
                  step={0.1}
                  min={0}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {element.type === 'line' && (
        <div className="space-y-3">
          <h4 className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
            Aparência
          </h4>
          <div className="space-y-2">
            <div>
              <Label className="text-xs">Cor</Label>
              <div className="flex items-center gap-1">
                <input
                  type="color"
                  value={element.color}
                  onChange={e => handleUpdate({ color: e.target.value })}
                  className="w-8 h-8 rounded border border-neutral-200"
                />
                <Input
                  value={element.color}
                  onChange={e => handleUpdate({ color: e.target.value })}
                  className="h-8 flex-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Espessura (mm)</Label>
                <Input
                  type="number"
                  value={element.strokeWidth}
                  onChange={e =>
                    handleUpdate({ strokeWidth: parseFloat(e.target.value) || 0.3 })
                  }
                  className="h-8"
                  step={0.1}
                  min={0.1}
                />
              </div>
              <div>
                <Label className="text-xs">Estilo</Label>
                <Select
                  value={element.strokeStyle}
                  onValueChange={v =>
                    handleUpdate({ strokeStyle: v as typeof element.strokeStyle })
                  }
                >
                  <SelectTrigger className="h-8">
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
          </div>
        </div>
      )}

      {element.type === 'icon' && (
        <div className="space-y-3">
          <h4 className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
            Aparência
          </h4>
          <div>
            <Label className="text-xs">Cor</Label>
            <div className="flex items-center gap-1">
              <input
                type="color"
                value={element.color}
                onChange={e => handleUpdate({ color: e.target.value })}
                className="w-8 h-8 rounded border border-neutral-200"
              />
              <Input
                value={element.color}
                onChange={e => handleUpdate({ color: e.target.value })}
                className="h-8 flex-1"
              />
            </div>
          </div>
        </div>
      )}

      {element.type === 'barcode' && (
        <BarcodeConfigPanel element={element} onUpdate={handleUpdate} />
      )}

      {element.type === 'qrcode' && (
        <QRCodeConfigPanel element={element} onUpdate={handleUpdate} />
      )}

      <Separator />

      {/* Ações de camada */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
          Camada
        </h4>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => bringToFront(element.id)}
          >
            <ArrowUp className="h-4 w-4 mr-1" />
            Trazer para frente
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => sendToBack(element.id)}
          >
            <ArrowDown className="h-4 w-4 mr-1" />
            Enviar para trás
          </Button>
        </div>
      </div>

      <Separator />

      {/* Ações */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => duplicateElements([element.id])}
        >
          <Copy className="h-4 w-4 mr-1" />
          Duplicar
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className="flex-1"
          onClick={() => deleteElements([element.id])}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Excluir
        </Button>
      </div>
    </div>
  );
}

export default PropertiesPanel;
