'use client';

/**
 * Label Studio - Field Config Panel
 * Painel de configuração de campos dinâmicos
 */

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Braces, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { FieldPickerModal } from '../components/FieldPickerModal';
import { getFieldLabel } from '../elements/FieldElementRenderer';
import { useEditorStore } from '../stores/editorStore';
import type { FieldConfig, FieldElement, LabelConfig } from '../studio-types';

interface FieldConfigPanelProps {
  element: FieldElement;
  onUpdate: (updates: Partial<FieldElement>) => void;
}

/**
 * Botão trigger para abrir o FieldPickerModal
 */
function DataPathTrigger({
  value,
  onChange,
  label: selectorLabel,
  className,
}: {
  value: string;
  onChange: (path: string) => void;
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const dynamicCategories = useEditorStore(s => s.dynamicAttributeCategories);

  return (
    <div className={className}>
      {selectorLabel && <Label className="text-xs">{selectorLabel}</Label>}
      <Button
        variant="outline"
        className="w-full justify-between h-8 font-normal"
        onClick={() => setOpen(true)}
      >
        <span className="truncate text-sm">
          {value
            ? getFieldLabel(value, undefined, dynamicCategories)
            : 'Selecionar campo...'}
        </span>
        <ChevronRight className="h-3 w-3 shrink-0 text-slate-400" />
      </Button>
      {value && (
        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{value}</p>
      )}
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
 * Configuração de campo simples
 */
function SimpleFieldConfig({
  config,
  onUpdate,
}: {
  config: FieldConfig;
  onUpdate: (updates: Partial<FieldConfig>) => void;
}) {
  return (
    <DataPathTrigger
      value={config.dataPath || ''}
      onChange={path => onUpdate({ dataPath: path })}
      label="Campo de dados"
    />
  );
}

/**
 * Configuração de campo composto
 */
function CompositeFieldConfig({
  config,
  onUpdate,
}: {
  config: FieldConfig;
  onUpdate: (updates: Partial<FieldConfig>) => void;
}) {
  const [insertModalOpen, setInsertModalOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="space-y-2">
      <div>
        <Label className="text-xs">Template</Label>
        <Textarea
          ref={textareaRef}
          value={config.template || ''}
          onChange={e => onUpdate({ template: e.target.value })}
          placeholder="{product.name} - {variant.sku}"
          className="h-20 text-sm font-mono"
        />
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-slate-400">
            Use {'{campo}'} para inserir campos dinâmicos
          </p>
          <Button
            variant="outline"
            size="sm"
            className="h-6 text-xs gap-1"
            onClick={() => setInsertModalOpen(true)}
          >
            <Braces className="w-3 h-3" />
            Inserir campo
          </Button>
        </div>
      </div>

      <FieldPickerModal
        open={insertModalOpen}
        onOpenChange={setInsertModalOpen}
        onSelect={() => {}}
        insertMode
        onInsert={text => {
          const current = config.template || '';
          onUpdate({ template: current + text });
        }}
        title="Inserir Campo no Template"
      />
    </div>
  );
}

/**
 * Configuração de campo condicional
 */
function ConditionalFieldConfig({
  config,
  onUpdate,
}: {
  config: FieldConfig;
  onUpdate: (updates: Partial<FieldConfig>) => void;
}) {
  const conditions = config.conditions || { primary: '', fallbacks: [] };

  const updateConditions = (updates: Partial<typeof conditions>) => {
    onUpdate({ conditions: { ...conditions, ...updates } });
  };

  return (
    <div className="space-y-3">
      <DataPathTrigger
        value={conditions.primary}
        onChange={path => updateConditions({ primary: path })}
        label="Campo principal"
      />

      <div>
        <Label className="text-xs">Fallbacks (em ordem de prioridade)</Label>
        <div className="space-y-2 mt-1">
          {conditions.fallbacks.map((fallback, index) => (
            <div key={index} className="flex items-center gap-1">
              <span className="text-xs text-slate-400 w-4">{index + 1}.</span>
              <div className="flex-1">
                <DataPathTrigger
                  value={fallback}
                  onChange={path => {
                    const newFallbacks = [...conditions.fallbacks];
                    newFallbacks[index] = path;
                    updateConditions({ fallbacks: newFallbacks });
                  }}
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  const newFallbacks = conditions.fallbacks.filter(
                    (_, i) => i !== index
                  );
                  updateConditions({ fallbacks: newFallbacks });
                }}
                aria-label="Remover fallback"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              updateConditions({ fallbacks: [...conditions.fallbacks, ''] });
            }}
          >
            <Plus className="w-3 h-3 mr-1" />
            Adicionar Fallback
          </Button>
        </div>
      </div>

      <p className="text-xs text-slate-400">
        Se o campo principal estiver vazio, será usado o próximo fallback
        disponível.
      </p>
    </div>
  );
}

/**
 * Configuração de campo calculado
 */
function CalculatedFieldConfig({
  config,
  onUpdate,
}: {
  config: FieldConfig;
  onUpdate: (updates: Partial<FieldConfig>) => void;
}) {
  const [insertModalOpen, setInsertModalOpen] = useState(false);

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs">Fórmula</Label>
        <Textarea
          value={config.formula || ''}
          onChange={e => onUpdate({ formula: e.target.value })}
          placeholder="{variant.price} * 1.1"
          className="h-16 text-sm font-mono"
        />
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-slate-400">
            Use {'{campo}'} para referências. Operadores: + - * / ( )
          </p>
          <Button
            variant="outline"
            size="sm"
            className="h-6 text-xs gap-1"
            onClick={() => setInsertModalOpen(true)}
          >
            <Braces className="w-3 h-3" />
            Inserir campo
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">Formato</Label>
          <Select
            value={config.format || 'number'}
            onValueChange={v =>
              onUpdate({ format: v as FieldConfig['format'] })
            }
          >
            <SelectTrigger className="h-8">
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
          <Label className="text-xs">Casas decimais</Label>
          <Input
            type="number"
            value={config.decimalPlaces ?? 2}
            onChange={e =>
              onUpdate({ decimalPlaces: parseInt(e.target.value) || 0 })
            }
            className="h-8"
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
          const current = config.formula || '';
          onUpdate({ formula: current + text });
        }}
        title="Inserir Campo na Fórmula"
      />
    </div>
  );
}

/**
 * Painel de configuração de campo
 */
export function FieldConfigPanel({ element, onUpdate }: FieldConfigPanelProps) {
  const { fieldConfig, label } = element;
  const [isLabelOpen, setIsLabelOpen] = useState(!!label?.enabled);
  const dynamicCategories = useEditorStore(s => s.dynamicAttributeCategories);

  const updateFieldConfig = (updates: Partial<FieldConfig>) => {
    onUpdate({
      fieldConfig: { ...fieldConfig, ...updates },
    });
  };

  const updateLabel = (updates: Partial<LabelConfig>) => {
    const currentLabel = label || {
      enabled: false,
      text: '',
      position: 'above' as const,
      style: {},
    };
    onUpdate({
      label: { ...currentLabel, ...updates },
    });
  };

  return (
    <div className="space-y-4">
      {/* Tipo de campo */}
      <div>
        <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
          Configuração do Campo
        </h4>
        <div>
          <Label className="text-xs">Tipo</Label>
          <Select
            value={fieldConfig.type}
            onValueChange={v =>
              updateFieldConfig({ type: v as FieldConfig['type'] })
            }
          >
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="simple">Simples</SelectItem>
              <SelectItem value="composite">Composto</SelectItem>
              <SelectItem value="conditional">Condicional</SelectItem>
              <SelectItem value="calculated">Calculado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Configuração específica por tipo */}
      {fieldConfig.type === 'simple' && (
        <SimpleFieldConfig config={fieldConfig} onUpdate={updateFieldConfig} />
      )}
      {fieldConfig.type === 'composite' && (
        <CompositeFieldConfig
          config={fieldConfig}
          onUpdate={updateFieldConfig}
        />
      )}
      {fieldConfig.type === 'conditional' && (
        <ConditionalFieldConfig
          config={fieldConfig}
          onUpdate={updateFieldConfig}
        />
      )}
      {fieldConfig.type === 'calculated' && (
        <CalculatedFieldConfig
          config={fieldConfig}
          onUpdate={updateFieldConfig}
        />
      )}

      <Separator />

      {/* Configuração de label */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Rótulo (Label)
          </Label>
          <Switch
            checked={label?.enabled || false}
            onCheckedChange={enabled => {
              updateLabel({ enabled });
              setIsLabelOpen(enabled);
            }}
          />
        </div>
        {label?.enabled && (
          <div className="space-y-2">
            <div>
              <Label className="text-xs">Texto</Label>
              <Input
                value={label.text || ''}
                onChange={e => updateLabel({ text: e.target.value })}
                placeholder={getFieldLabel(
                  fieldConfig.dataPath || '',
                  undefined,
                  dynamicCategories
                )}
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs">Posição</Label>
              <Select
                value={label.position}
                onValueChange={v =>
                  updateLabel({ position: v as LabelConfig['position'] })
                }
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="above">Acima</SelectItem>
                  <SelectItem value="left">À esquerda</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Cor</Label>
                <div className="flex items-center gap-1">
                  <input
                    type="color"
                    value={label.style?.color || '#666666'}
                    onChange={e =>
                      updateLabel({
                        style: { ...label.style, color: e.target.value },
                      })
                    }
                    className="w-8 h-8 rounded border border-slate-200"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs">Tamanho (mm)</Label>
                <Input
                  type="number"
                  value={label.style?.fontSize || 2}
                  onChange={e =>
                    updateLabel({
                      style: {
                        ...label.style,
                        fontSize: parseFloat(e.target.value) || 2,
                      },
                    })
                  }
                  className="h-8"
                  step={0.5}
                  min={1}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FieldConfigPanel;
