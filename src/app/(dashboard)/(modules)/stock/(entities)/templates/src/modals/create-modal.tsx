'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { TemplatePreset } from '@/data/template-presets';
import type { CreateTemplateRequest, Template, TemplateAttributes, UnitOfMeasure } from '@/types/stock';
import { LayoutTemplateIcon } from 'lucide-react';
import { useState } from 'react';
import { PresetGrid } from '../components/preset-grid';
import { PresetPreview } from '../components/preset-preview';
import { QuickCreateForm } from '../components/quick-create-form';

type ModalState = 'grid' | 'preview' | 'manual';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSubmitting: boolean;
  onSubmit: (data: Partial<Template>) => Promise<void>;
  /** Key para forçar re-render/reset do formulário */
  formKey?: number;
  /** Trigger para focar no primeiro campo */
  focusTrigger?: number;
}

/**
 * Converte atributos do preset (tipo data/template-presets)
 * para o formato TemplateAttributes esperado pela API.
 */
function convertPresetAttributes(
  attrs: Record<string, { name: string; type: string; required?: boolean; options?: string[]; unit?: string }>
): TemplateAttributes {
  const result: TemplateAttributes = {};
  for (const [key, attr] of Object.entries(attrs)) {
    const typeMap: Record<string, string> = {
      text: 'string',
      number: 'number',
      select: 'select',
      boolean: 'boolean',
      date: 'date',
    };
    result[key] = {
      label: attr.name,
      type: (typeMap[attr.type] || attr.type) as 'string' | 'number' | 'boolean' | 'date' | 'select',
      required: attr.required || false,
      ...(attr.options && attr.options.length > 0 ? { options: attr.options } : {}),
    };
  }
  return result;
}

export function CreateModal({
  isOpen,
  onClose,
  isSubmitting,
  onSubmit,
}: CreateModalProps) {
  const [state, setState] = useState<ModalState>('grid');
  const [selectedPreset, setSelectedPreset] = useState<TemplatePreset | null>(null);

  const handleClose = () => {
    setState('grid');
    setSelectedPreset(null);
    onClose();
  };

  const handleSelectPreset = (preset: TemplatePreset) => {
    setSelectedPreset(preset);
    setState('preview');
  };

  const handleConfirmPreset = async (preset: TemplatePreset) => {
    const data: Partial<Template> & CreateTemplateRequest = {
      name: preset.name,
      unitOfMeasure: preset.unitOfMeasure,
      productAttributes: convertPresetAttributes(preset.productAttributes),
      variantAttributes: convertPresetAttributes(preset.variantAttributes),
      itemAttributes: convertPresetAttributes(preset.itemAttributes),
      specialModules: preset.specialModules,
    };
    await onSubmit(data);
    handleClose();
  };

  const handleManualSubmit = async (formData: { name: string; unitOfMeasure: UnitOfMeasure }) => {
    const data: Partial<Template> & CreateTemplateRequest = {
      name: formData.name,
      unitOfMeasure: formData.unitOfMeasure,
    };
    await onSubmit(data);
    handleClose();
  };

  const titleMap: Record<ModalState, string> = {
    grid: 'Novo Template',
    preview: 'Pré-visualização',
    manual: 'Novo Template Manual',
  };

  const descriptionMap: Record<ModalState, string> = {
    grid: 'Escolha um template pré-configurado ou crie um do zero.',
    preview: 'Confira os atributos do template antes de adicionar.',
    manual: 'Configure um template com nome e unidade de medida.',
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && handleClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden [&>button]:hidden">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-lg font-semibold">
            <div className="flex gap-3 items-center">
              <div className="flex items-center justify-center text-white shrink-0 bg-linear-to-br from-purple-500 to-pink-600 p-2 rounded-lg">
                <LayoutTemplateIcon className="h-5 w-5" />
              </div>
              {titleMap[state]}
            </div>
          </DialogTitle>
          <DialogDescription>{descriptionMap[state]}</DialogDescription>
        </DialogHeader>

        <div className="py-2">
          {state === 'grid' && (
            <PresetGrid
              onSelectPreset={handleSelectPreset}
              onManualCreate={() => setState('manual')}
            />
          )}

          {state === 'preview' && selectedPreset && (
            <PresetPreview
              preset={selectedPreset}
              onBack={() => setState('grid')}
              onConfirm={handleConfirmPreset}
            />
          )}

          {state === 'manual' && (
            <QuickCreateForm
              onBack={() => setState('grid')}
              onSubmit={handleManualSubmit}
            />
          )}
        </div>

        {isSubmitting && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center rounded-lg">
            <p className="text-sm text-muted-foreground animate-pulse">
              Criando template...
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
