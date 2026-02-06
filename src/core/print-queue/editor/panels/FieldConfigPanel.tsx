'use client';

/**
 * Label Studio - Field Config Panel
 * Painel de configuração de campos dinâmicos
 */

import React, { useState } from 'react';
import type { FieldElement, FieldConfig, LabelConfig } from '../studio-types';
import { DATA_PATHS, getFieldLabel } from '../elements/FieldElementRenderer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  ChevronDown,
  Plus,
  Trash2,
  Info,
} from 'lucide-react';

interface FieldConfigPanelProps {
  element: FieldElement;
  onUpdate: (updates: Partial<FieldElement>) => void;
}

/**
 * Seletor de DataPath com categorias
 */
function DataPathSelector({
  value,
  onChange,
  label: selectorLabel,
}: {
  value: string;
  onChange: (path: string) => void;
  label?: string;
}) {
  return (
    <div>
      {selectorLabel && <Label className="text-xs">{selectorLabel}</Label>}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-8">
          <SelectValue placeholder="Selecione um campo" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(DATA_PATHS).map(([key, category]) => (
            <SelectGroup key={key}>
              <SelectLabel>{category.label}</SelectLabel>
              {category.fields.map(field => (
                <SelectItem key={field.path} value={field.path}>
                  <span className="flex items-center gap-2">
                    <span>{field.label}</span>
                    <span className="text-xs text-neutral-400">{field.path}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
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
    <DataPathSelector
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
  return (
    <div className="space-y-2">
      <div>
        <Label className="text-xs">Template</Label>
        <Textarea
          value={config.template || ''}
          onChange={e => onUpdate({ template: e.target.value })}
          placeholder="{product.name} - {variant.sku}"
          className="h-20 text-sm font-mono"
        />
        <p className="text-xs text-neutral-400 mt-1">
          Use {'{campo}'} para inserir campos dinâmicos
        </p>
      </div>

      {/* Preview dos campos disponíveis */}
      <Collapsible>
        <CollapsibleTrigger className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600">
          <Info className="w-3 h-3" />
          Campos disponíveis
          <ChevronDown className="w-3 h-3" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
            {Object.entries(DATA_PATHS).map(([key, category]) => (
              <div key={key}>
                <p className="text-xs font-medium text-neutral-500">{category.label}</p>
                {category.fields.map(field => (
                  <button
                    key={field.path}
                    className="text-xs text-blue-500 hover:underline block pl-2"
                    onClick={() => {
                      const current = config.template || '';
                      onUpdate({ template: current + `{${field.path}}` });
                    }}
                  >
                    {`{${field.path}}`}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
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
      <DataPathSelector
        value={conditions.primary}
        onChange={path => updateConditions({ primary: path })}
        label="Campo principal"
      />

      <div>
        <Label className="text-xs">Fallbacks (em ordem de prioridade)</Label>
        <div className="space-y-2 mt-1">
          {conditions.fallbacks.map((fallback, index) => (
            <div key={index} className="flex items-center gap-1">
              <span className="text-xs text-neutral-400 w-4">{index + 1}.</span>
              <Select
                value={fallback}
                onValueChange={path => {
                  const newFallbacks = [...conditions.fallbacks];
                  newFallbacks[index] = path;
                  updateConditions({ fallbacks: newFallbacks });
                }}
              >
                <SelectTrigger className="h-8 flex-1">
                  <SelectValue placeholder="Selecione" />
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
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  const newFallbacks = conditions.fallbacks.filter((_, i) => i !== index);
                  updateConditions({ fallbacks: newFallbacks });
                }}
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

      <p className="text-xs text-neutral-400">
        Se o campo principal estiver vazio, será usado o próximo fallback disponível.
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
        <p className="text-xs text-neutral-400 mt-1">
          Use {'{campo}'} para referências. Operadores: + - * / ( )
        </p>
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
    </div>
  );
}

/**
 * Painel de configuração de campo
 */
export function FieldConfigPanel({ element, onUpdate }: FieldConfigPanelProps) {
  const { fieldConfig, label } = element;
  const [isLabelOpen, setIsLabelOpen] = useState(!!label?.enabled);

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
        <h4 className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
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
        <CompositeFieldConfig config={fieldConfig} onUpdate={updateFieldConfig} />
      )}
      {fieldConfig.type === 'conditional' && (
        <ConditionalFieldConfig config={fieldConfig} onUpdate={updateFieldConfig} />
      )}
      {fieldConfig.type === 'calculated' && (
        <CalculatedFieldConfig config={fieldConfig} onUpdate={updateFieldConfig} />
      )}

      <Separator />

      {/* Configuração de label */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
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
                placeholder={getFieldLabel(fieldConfig.dataPath || '')}
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
                    className="w-8 h-8 rounded border border-neutral-200"
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
