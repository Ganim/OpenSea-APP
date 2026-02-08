'use client';

/**
 * Label Studio - Barcode Config Panel
 * Painel de configuração de código de barras
 */

import React, { useState } from 'react';
import type { BarcodeElement, BarcodeConfig } from '../studio-types';
import { getFieldLabel } from '../elements/FieldElementRenderer';
import { FieldPickerModal } from '../components/FieldPickerModal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronRight, Braces } from 'lucide-react';

interface BarcodeConfigPanelProps {
  element: BarcodeElement;
  onUpdate: (updates: Partial<BarcodeElement>) => void;
}

export function BarcodeConfigPanel({ element, onUpdate }: BarcodeConfigPanelProps) {
  const { barcodeConfig } = element;
  const [fieldPickerOpen, setFieldPickerOpen] = useState(false);
  const [insertModalOpen, setInsertModalOpen] = useState(false);

  const updateConfig = (updates: Partial<BarcodeConfig>) => {
    onUpdate({ barcodeConfig: { ...barcodeConfig, ...updates } });
  };

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        Código de Barras
      </h4>

      {/* Fonte do valor */}
      <div>
        <Label className="text-xs">Fonte do valor</Label>
        <Select
          value={barcodeConfig.source}
          onValueChange={v => updateConfig({ source: v as BarcodeConfig['source'] })}
        >
          <SelectTrigger className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="field">Campo de dados</SelectItem>
            <SelectItem value="custom">Valor fixo</SelectItem>
            <SelectItem value="composite">Composto (template)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Configuração por fonte */}
      {barcodeConfig.source === 'field' && (
        <div>
          <Label className="text-xs">Campo</Label>
          <Button
            variant="outline"
            className="w-full justify-between h-8 font-normal"
            onClick={() => setFieldPickerOpen(true)}
          >
            <span className="truncate text-sm">
              {barcodeConfig.dataPath ? getFieldLabel(barcodeConfig.dataPath) : 'Selecionar campo...'}
            </span>
            <ChevronRight className="h-3 w-3 shrink-0 text-slate-400" />
          </Button>
          {barcodeConfig.dataPath && (
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{barcodeConfig.dataPath}</p>
          )}
          <FieldPickerModal
            open={fieldPickerOpen}
            onOpenChange={setFieldPickerOpen}
            onSelect={v => updateConfig({ dataPath: v })}
            currentValue={barcodeConfig.dataPath}
          />
        </div>
      )}

      {barcodeConfig.source === 'custom' && (
        <div>
          <Label className="text-xs">Valor</Label>
          <Input
            value={barcodeConfig.customValue || ''}
            onChange={e => updateConfig({ customValue: e.target.value })}
            placeholder="123456789"
            className="h-8"
          />
        </div>
      )}

      {barcodeConfig.source === 'composite' && (
        <div>
          <Label className="text-xs">Template</Label>
          <Textarea
            value={barcodeConfig.template || ''}
            onChange={e => updateConfig({ template: e.target.value })}
            placeholder="{product.code}-{variant.sku}"
            className="h-16 text-sm font-mono"
          />
          <div className="flex justify-end mt-1">
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
          <FieldPickerModal
            open={insertModalOpen}
            onOpenChange={setInsertModalOpen}
            onSelect={() => {}}
            insertMode
            onInsert={(text) => {
              const current = barcodeConfig.template || '';
              updateConfig({ template: current + text });
            }}
            title="Inserir Campo no Template"
          />
        </div>
      )}

      {/* Formato */}
      <div>
        <Label className="text-xs">Formato</Label>
        <Select
          value={barcodeConfig.format}
          onValueChange={v => updateConfig({ format: v as BarcodeConfig['format'] })}
        >
          <SelectTrigger className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CODE128">CODE128 (alfanumérico)</SelectItem>
            <SelectItem value="CODE39">CODE39</SelectItem>
            <SelectItem value="EAN13">EAN-13</SelectItem>
            <SelectItem value="EAN8">EAN-8</SelectItem>
            <SelectItem value="UPC">UPC</SelectItem>
            <SelectItem value="ITF">ITF</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Opções visuais */}
      <div className="flex items-center justify-between">
        <Label className="text-xs">Mostrar texto</Label>
        <Switch
          checked={barcodeConfig.showText}
          onCheckedChange={v => updateConfig({ showText: v })}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">Cor barras</Label>
          <div className="flex items-center gap-1">
            <input
              type="color"
              value={barcodeConfig.barColor}
              onChange={e => updateConfig({ barColor: e.target.value })}
              className="w-8 h-8 rounded border border-slate-200"
            />
          </div>
        </div>
        <div>
          <Label className="text-xs">Cor fundo</Label>
          <div className="flex items-center gap-1">
            <input
              type="color"
              value={barcodeConfig.backgroundColor}
              onChange={e => updateConfig({ backgroundColor: e.target.value })}
              className="w-8 h-8 rounded border border-slate-200"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default BarcodeConfigPanel;
