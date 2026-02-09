'use client';

/**
 * Label Studio - QR Code Config Panel
 * Painel de configuração de QR Code
 */

import React, { useState } from 'react';
import type { QRCodeElement, QRCodeConfig } from '../studio-types';
import { getFieldLabel } from '../elements/FieldElementRenderer';
import { FieldPickerModal } from '../components/FieldPickerModal';
import { useEditorStore } from '../stores/editorStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronRight, Braces } from 'lucide-react';

interface QRCodeConfigPanelProps {
  element: QRCodeElement;
  onUpdate: (updates: Partial<QRCodeElement>) => void;
}

export function QRCodeConfigPanel({
  element,
  onUpdate,
}: QRCodeConfigPanelProps) {
  const { qrConfig } = element;
  const [fieldPickerOpen, setFieldPickerOpen] = useState(false);
  const [urlParamPickerOpen, setUrlParamPickerOpen] = useState(false);
  const [insertModalOpen, setInsertModalOpen] = useState(false);
  const dynamicCategories = useEditorStore(s => s.dynamicAttributeCategories);

  const updateConfig = (updates: Partial<QRCodeConfig>) => {
    onUpdate({ qrConfig: { ...qrConfig, ...updates } });
  };

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        QR Code
      </h4>

      {/* Tipo de conteúdo */}
      <div>
        <Label className="text-xs">Tipo de conteúdo</Label>
        <Select
          value={qrConfig.contentType}
          onValueChange={v =>
            updateConfig({ contentType: v as QRCodeConfig['contentType'] })
          }
        >
          <SelectTrigger className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="field">Campo de dados</SelectItem>
            <SelectItem value="composite">Composto (template)</SelectItem>
            <SelectItem value="url">URL</SelectItem>
            <SelectItem value="vcard">vCard</SelectItem>
            <SelectItem value="custom">Texto livre</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Configuração por tipo */}
      {qrConfig.contentType === 'field' && (
        <div>
          <Label className="text-xs">Campo</Label>
          <Button
            variant="outline"
            className="w-full justify-between h-8 font-normal"
            onClick={() => setFieldPickerOpen(true)}
          >
            <span className="truncate text-sm">
              {qrConfig.dataPath
                ? getFieldLabel(qrConfig.dataPath, undefined, dynamicCategories)
                : 'Selecionar campo...'}
            </span>
            <ChevronRight className="h-3 w-3 shrink-0 text-slate-400" />
          </Button>
          {qrConfig.dataPath && (
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              {qrConfig.dataPath}
            </p>
          )}
          <FieldPickerModal
            open={fieldPickerOpen}
            onOpenChange={setFieldPickerOpen}
            onSelect={v => updateConfig({ dataPath: v })}
            currentValue={qrConfig.dataPath}
          />
        </div>
      )}

      {qrConfig.contentType === 'composite' && (
        <div>
          <Label className="text-xs">Template</Label>
          <Textarea
            value={qrConfig.template || ''}
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
            onInsert={text => {
              const current = qrConfig.template || '';
              updateConfig({ template: current + text });
            }}
            title="Inserir Campo no Template"
          />
        </div>
      )}

      {qrConfig.contentType === 'url' && (
        <div className="space-y-2">
          <div>
            <Label className="text-xs">URL base</Label>
            <Input
              value={qrConfig.urlBase || ''}
              onChange={e => updateConfig({ urlBase: e.target.value })}
              placeholder="https://example.com/item/"
              className="h-8"
            />
          </div>
          <div>
            <Label className="text-xs">Parâmetro (campo de dados)</Label>
            <Button
              variant="outline"
              className="w-full justify-between h-8 font-normal"
              onClick={() => setUrlParamPickerOpen(true)}
            >
              <span className="truncate text-sm">
                {qrConfig.urlParam
                  ? getFieldLabel(qrConfig.urlParam, undefined, dynamicCategories)
                  : 'Selecionar campo...'}
              </span>
              <ChevronRight className="h-3 w-3 shrink-0 text-slate-400" />
            </Button>
            {qrConfig.urlParam && (
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                {qrConfig.urlParam}
              </p>
            )}
            <FieldPickerModal
              open={urlParamPickerOpen}
              onOpenChange={setUrlParamPickerOpen}
              onSelect={v => updateConfig({ urlParam: v })}
              currentValue={qrConfig.urlParam}
            />
          </div>
        </div>
      )}

      {qrConfig.contentType === 'vcard' && (
        <div className="space-y-2">
          <div>
            <Label className="text-xs">Nome</Label>
            <Input
              value={qrConfig.vcard?.name || ''}
              onChange={e =>
                updateConfig({
                  vcard: {
                    name: e.target.value,
                    phone: qrConfig.vcard?.phone,
                    email: qrConfig.vcard?.email,
                  },
                })
              }
              placeholder="Nome Completo"
              className="h-8"
            />
          </div>
          <div>
            <Label className="text-xs">Telefone</Label>
            <Input
              value={qrConfig.vcard?.phone || ''}
              onChange={e =>
                updateConfig({
                  vcard: {
                    name: qrConfig.vcard?.name || '',
                    phone: e.target.value,
                    email: qrConfig.vcard?.email,
                  },
                })
              }
              placeholder="+55 11 99999-9999"
              className="h-8"
            />
          </div>
          <div>
            <Label className="text-xs">Email</Label>
            <Input
              value={qrConfig.vcard?.email || ''}
              onChange={e =>
                updateConfig({
                  vcard: {
                    name: qrConfig.vcard?.name || '',
                    phone: qrConfig.vcard?.phone,
                    email: e.target.value,
                  },
                })
              }
              placeholder="email@example.com"
              className="h-8"
            />
          </div>
        </div>
      )}

      {qrConfig.contentType === 'custom' && (
        <div>
          <Label className="text-xs">Texto</Label>
          <Textarea
            value={qrConfig.template || ''}
            onChange={e => updateConfig({ template: e.target.value })}
            placeholder="Texto livre para QR Code"
            className="h-16"
          />
        </div>
      )}

      {/* Nível de correção de erros */}
      <div>
        <Label className="text-xs">Correção de erros</Label>
        <Select
          value={qrConfig.errorCorrectionLevel}
          onValueChange={v =>
            updateConfig({
              errorCorrectionLevel: v as QRCodeConfig['errorCorrectionLevel'],
            })
          }
        >
          <SelectTrigger className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="L">Low (~7%)</SelectItem>
            <SelectItem value="M">Medium (~15%)</SelectItem>
            <SelectItem value="Q">Quartile (~25%)</SelectItem>
            <SelectItem value="H">High (~30%)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cores */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">Cor módulos</Label>
          <div className="flex items-center gap-1">
            <input
              type="color"
              value={qrConfig.moduleColor}
              onChange={e => updateConfig({ moduleColor: e.target.value })}
              className="w-8 h-8 rounded border border-slate-200"
            />
          </div>
        </div>
        <div>
          <Label className="text-xs">Cor fundo</Label>
          <div className="flex items-center gap-1">
            <input
              type="color"
              value={qrConfig.backgroundColor}
              onChange={e => updateConfig({ backgroundColor: e.target.value })}
              className="w-8 h-8 rounded border border-slate-200"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default QRCodeConfigPanel;
