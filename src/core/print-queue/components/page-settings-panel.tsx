/**
 * Page Settings Panel
 * Configurações de página para impressão
 */

'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { usePrintQueue } from '../context/print-queue-context';
import type { PageSettings } from '../types';

interface PageSettingsPanelProps {
  className?: string;
}

export function PageSettingsPanel({ className }: PageSettingsPanelProps) {
  const { state, actions } = usePrintQueue();
  const settings = state.pageSettings;

  const handleChange = (updates: Partial<PageSettings>) => {
    actions.updatePageSettings(updates);
  };

  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
        Configuracoes de Pagina
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {/* Paper Size */}
        <div className="space-y-1.5">
          <Label htmlFor="paperSize" className="text-xs">
            Tamanho do Papel
          </Label>
          <Select
            value={settings.paperSize}
            onValueChange={value =>
              handleChange({ paperSize: value as PageSettings['paperSize'] })
            }
          >
            <SelectTrigger id="paperSize" className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A4">A4</SelectItem>
              <SelectItem value="LETTER">Carta</SelectItem>
              <SelectItem value="CUSTOM">Personalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Orientation */}
        <div className="space-y-1.5">
          <Label htmlFor="orientation" className="text-xs">
            Orientacao
          </Label>
          <Select
            value={settings.orientation}
            onValueChange={value =>
              handleChange({
                orientation: value as PageSettings['orientation'],
              })
            }
          >
            <SelectTrigger id="orientation" className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="portrait">Retrato</SelectItem>
              <SelectItem value="landscape">Paisagem</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Labels Per Row */}
        <div className="space-y-1.5">
          <Label htmlFor="labelsPerRow" className="text-xs">
            Etiquetas por Linha
          </Label>
          <Select
            value={String(settings.labelsPerRow)}
            onValueChange={value =>
              handleChange({
                labelsPerRow: parseInt(
                  value,
                  10
                ) as PageSettings['labelsPerRow'],
              })
            }
          >
            <SelectTrigger id="labelsPerRow" className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 coluna</SelectItem>
              <SelectItem value="2">2 colunas</SelectItem>
              <SelectItem value="3">3 colunas</SelectItem>
              <SelectItem value="4">4 colunas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Spacer */}
        <div />
      </div>

      {/* Margins */}
      <div className="space-y-2">
        <Label className="text-xs font-medium">Margens (mm)</Label>
        <div className="grid grid-cols-4 gap-2">
          <div className="space-y-1">
            <Label htmlFor="marginTop" className="text-[10px] text-gray-500">
              Superior
            </Label>
            <Input
              id="marginTop"
              type="number"
              min={0}
              max={50}
              value={settings.margins.top}
              onChange={e =>
                handleChange({
                  margins: {
                    ...settings.margins,
                    top: parseInt(e.target.value, 10) || 0,
                  },
                })
              }
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="marginRight" className="text-[10px] text-gray-500">
              Direita
            </Label>
            <Input
              id="marginRight"
              type="number"
              min={0}
              max={50}
              value={settings.margins.right}
              onChange={e =>
                handleChange({
                  margins: {
                    ...settings.margins,
                    right: parseInt(e.target.value, 10) || 0,
                  },
                })
              }
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="marginBottom" className="text-[10px] text-gray-500">
              Inferior
            </Label>
            <Input
              id="marginBottom"
              type="number"
              min={0}
              max={50}
              value={settings.margins.bottom}
              onChange={e =>
                handleChange({
                  margins: {
                    ...settings.margins,
                    bottom: parseInt(e.target.value, 10) || 0,
                  },
                })
              }
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="marginLeft" className="text-[10px] text-gray-500">
              Esquerda
            </Label>
            <Input
              id="marginLeft"
              type="number"
              min={0}
              max={50}
              value={settings.margins.left}
              onChange={e =>
                handleChange({
                  margins: {
                    ...settings.margins,
                    left: parseInt(e.target.value, 10) || 0,
                  },
                })
              }
              className="h-8 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Spacing */}
      <div className="space-y-2">
        <Label className="text-xs font-medium">Espacamento (mm)</Label>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label
              htmlFor="spacingHorizontal"
              className="text-[10px] text-gray-500"
            >
              Horizontal
            </Label>
            <Input
              id="spacingHorizontal"
              type="number"
              min={0}
              max={20}
              value={settings.labelSpacing.horizontal}
              onChange={e =>
                handleChange({
                  labelSpacing: {
                    ...settings.labelSpacing,
                    horizontal: parseInt(e.target.value, 10) || 0,
                  },
                })
              }
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label
              htmlFor="spacingVertical"
              className="text-[10px] text-gray-500"
            >
              Vertical
            </Label>
            <Input
              id="spacingVertical"
              type="number"
              min={0}
              max={20}
              value={settings.labelSpacing.vertical}
              onChange={e =>
                handleChange({
                  labelSpacing: {
                    ...settings.labelSpacing,
                    vertical: parseInt(e.target.value, 10) || 0,
                  },
                })
              }
              className="h-8 text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
