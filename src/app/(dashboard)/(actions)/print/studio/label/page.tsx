'use client';

/**
 * Print Studio - Nova Etiqueta
 * Página de criação de nova etiqueta com Label Studio Editor
 */

import { Button } from '@/components/ui/button';
import type {
  LabelStudioSaveData,
  LabelStudioTemplate,
} from '@/core/print-queue/editor';
import { useEditorStore } from '@/core/print-queue/editor';
import { useCreateLabelTemplate } from '@/hooks/stock/use-label-templates';
import { logger } from '@/lib/logger';
import { labelTemplatesService } from '@/services/stock/label-templates.service';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PiPencilSimpleLineDuotone } from 'react-icons/pi';

// Dynamic import para LabelStudioEditor (GrapesJS pesado ~300KB)
const LabelStudioEditor = dynamic(
  () =>
    import('@/core/print-queue/editor').then(mod => ({
      default: mod.LabelStudioEditor,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-full flex items-center justify-center bg-muted/10">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Carregando editor...</p>
        </div>
      </div>
    ),
  }
);

/**
 * Gera thumbnail do template via DOM offscreen e envia ao backend
 */
async function generateAndUploadThumbnail(
  templateId: string,
  studioTemplate: LabelStudioTemplate,
) {
  const { toPng } = await import('html-to-image');
  const { StudioLabelRenderer } = await import(
    '@/core/print-queue/components/studio-label-renderer'
  );
  const { createRoot } = await import('react-dom/client');

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  document.body.appendChild(container);

  const root = createRoot(container);
  root.render(
    React.createElement(StudioLabelRenderer, {
      template: studioTemplate,
      scale: 2,
    }),
  );

  await new Promise(resolve => setTimeout(resolve, 500));

  const renderedEl = container.firstElementChild as HTMLElement;
  if (!renderedEl) {
    root.unmount();
    container.remove();
    return;
  }

  const dataUrl = await toPng(renderedEl, { quality: 0.9, pixelRatio: 1 });
  root.unmount();
  container.remove();

  const res = await fetch(dataUrl);
  const blob = await res.blob();
  await labelTemplatesService.updateThumbnail(templateId, blob, 'thumbnail.png');
}

export default function NewLabelStudioPage() {
  const router = useRouter();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const { mutateAsync: createTemplate, isPending } = useCreateLabelTemplate();

  // Store state
  const templateName = useEditorStore(s => s.templateName);
  const setTemplateName = useEditorStore(s => s.setTemplateName);

  // Focus title input when editing
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  const handleSave = useCallback(
    async (data: LabelStudioSaveData) => {
      try {
        const grapesJsData = JSON.stringify({
          editorType: 'label-studio',
          ...data.studioTemplate,
        });
        const result = await createTemplate({
          name: data.name,
          description: data.description,
          width: data.width,
          height: data.height,
          grapesJsData,
        });

        // Generate thumbnail in background after creation
        if (result?.template?.id) {
          generateAndUploadThumbnail(
            result.template.id,
            data.studioTemplate,
          ).catch(err =>
            logger.error(
              'Failed to generate thumbnail',
              err instanceof Error ? err : undefined,
            ),
          );
        }

        router.push('/print/studio');
      } catch (error) {
        logger.error(
          'Failed to create template',
          error instanceof Error ? error : undefined
        );
      }
    },
    [createTemplate, router]
  );

  // Handler para o botão salvar do header
  const handleHeaderSave = useCallback(() => {
    const state = useEditorStore.getState();
    handleSave({
      name: state.templateName,
      description: state.templateDescription,
      width: state.canvasWidth,
      height: state.canvasHeight,
      studioTemplate: state.toJSON(),
    });
  }, [handleSave]);

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (!templateName.trim()) {
      setTemplateName('Nova Etiqueta');
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditingTitle(false);
    }
    if (e.key === 'Escape') {
      setIsEditingTitle(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] overflow-hidden ">
      {/* Page Header */}
      <div className="flex items-center justify-between px-4 py-2 mb-4 ">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/print/studio')}
            className="gap-2 text-slate-600 dark:text-slate-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Label Studio
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleHeaderSave}
            disabled={isPending}
            className="gap-2"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Salvar
          </Button>
        </div>
      </div>

      {/* Editable Title */}
      <div className="px-4 py-2 mb-4">
        {isEditingTitle ? (
          <input
            ref={titleInputRef}
            value={templateName}
            onChange={e => setTemplateName(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            className="text-3xl font-semibold bg-transparent border-none outline-none text-slate-900 dark:text-slate-100 w-full"
            placeholder="Nome da etiqueta"
          />
        ) : (
          <button
            onClick={() => setIsEditingTitle(true)}
            className="group cursor-pointer flex items-end gap-4 text-3xl font-semibold text-slate-900 dark:text-white transition-colors text-left"
            title="Clique para editar o nome"
          >
            {templateName || 'Nova Etiqueta'}
            <div className="text-sm text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              <PiPencilSimpleLineDuotone className="h-6 w-6" />
            </div>
          </button>
        )}
      </div>

      {/* Editor Card */}
      <div className="flex-1 p-3 overflow-hidden">
        <div className="h-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
          <LabelStudioEditor
            initialWidth={60}
            initialHeight={40}
            templateName={templateName}
            onSave={handleSave}
            isSaving={isPending}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
}
