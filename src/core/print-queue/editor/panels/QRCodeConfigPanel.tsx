'use client';

/**
 * Label Studio - QR Code Config Panel
 * Painel de configuração de QR Code
 */

import React from 'react';
import type { QRCodeElement, QRCodeConfig } from '../studio-types';
import { DATA_PATHS } from '../elements/FieldElementRenderer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

interface QRCodeConfigPanelProps {
  element: QRCodeElement;
  onUpdate: (updates: Partial<QRCodeElement>) => void;
}

export function QRCodeConfigPanel({ element, onUpdate }: QRCodeConfigPanelProps) {
  const { qrConfig } = element;

  const updateConfig = (updates: Partial<QRCodeConfig>) => {
    onUpdate({ qrConfig: { ...qrConfig, ...updates } });
  };

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
        QR Code
      </h4>

      {/* Tipo de conteúdo */}
      <div>
        <Label className="text-xs">Tipo de conteúdo</Label>
        <Select
          value={qrConfig.contentType}
          onValueChange={v => updateConfig({ contentType: v as QRCodeConfig['contentType'] })}
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
          <Select
            value={qrConfig.dataPath || ''}
            onValueChange={v => updateConfig({ dataPath: v })}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Selecione um campo" />
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
            <Select
              value={qrConfig.urlParam || ''}
              onValueChange={v => updateConfig({ urlParam: v })}
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Selecione um campo" />
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
              className="w-8 h-8 rounded border border-neutral-200"
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
              className="w-8 h-8 rounded border border-neutral-200"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default QRCodeConfigPanel;
