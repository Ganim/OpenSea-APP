'use client';

/**
 * Print Studio - Edit Label Template
 * Página de edição de etiqueta com Label Studio Editor
 */

import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';
import { Skeleton } from '@/components/ui/skeleton';
import type { LabelStudioSaveData } from '@/core/print-queue/editor';
import { LabelStudioEditor, useEditorStore } from '@/core/print-queue/editor';
import type { LabelStudioTemplate } from '@/core/print-queue/editor';
import {
  useLabelTemplate,
  useUpdateLabelTemplate,
} from '@/hooks/stock/use-label-templates';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { PiPencilSimpleLineDuotone } from 'react-icons/pi';

/**
 * Detecta se o template foi criado com o Label Studio
 */
function isLabelStudioTemplate(grapesJsData: string | undefined): boolean {
  if (!grapesJsData) return false;
  try {
    const parsed = JSON.parse(grapesJsData);
    return parsed.editorType === 'label-studio' || parsed.version === 2;
  } catch {
    return false;
  }
}

/**
 * Extrai o template do Label Studio
 */
function extractLabelStudioTemplate(
  grapesJsData: string
): LabelStudioTemplate | null {
  try {
    const parsed = JSON.parse(grapesJsData);
    if (parsed.editorType === 'label-studio' || parsed.version === 2) {
      return {
        version: 2,
        width: parsed.width,
        height: parsed.height,
        canvas: parsed.canvas,
        elements: parsed.elements,
        category: parsed.category,
        entityType: parsed.entityType,
      };
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

export default function EditLabelStudioPage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.id as string;

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading, error } = useLabelTemplate(templateId);
  const { mutateAsync: updateTemplate, isPending } = useUpdateLabelTemplate();

  const template = data?.template;

  // Store state
  const templateName = useEditorStore(s => s.templateName);
  const setTemplateName = useEditorStore(s => s.setTemplateName);

  // Detectar tipo de editor e extrair template
  const isLabelStudio = useMemo(() => {
    return isLabelStudioTemplate(template?.grapesJsData);
  }, [template?.grapesJsData]);

  const labelStudioTemplate = useMemo(() => {
    if (!template || !isLabelStudio) return null;
    return extractLabelStudioTemplate(template.grapesJsData);
  }, [template, isLabelStudio]);

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
        await updateTemplate({
          id: templateId,
          data: {
            name: data.name,
            description: data.description,
            width: data.width,
            height: data.height,
            grapesJsData,
          },
        });
        router.push('/print/studio');
      } catch (error) {
        logger.error(
          'Failed to update template',
          error instanceof Error ? error : undefined
        );
      }
    },
    [updateTemplate, templateId, router]
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

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <Skeleton className="w-64 h-8 mb-4 mx-auto" />
          <Skeleton className="w-96 h-96" />
        </div>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">
            Template não encontrado
          </h2>
          <p className="text-muted-foreground mb-4">
            O template que você está tentando editar não existe ou foi removido.
          </p>
          <Button variant="ghost" onClick={() => router.push('/print/studio')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Studio
          </Button>
        </div>
      </div>
    );
  }

  if (template.isSystem) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Template do Sistema</h2>
          <p className="text-muted-foreground mb-4">
            Templates do sistema não podem ser editados. Você pode duplicá-lo
            para criar uma versão customizada.
          </p>
          <Button variant="ghost" onClick={() => router.push('/print/studio')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Studio
          </Button>
        </div>
      </div>
    );
  }

  // Not a Label Studio template
  if (!isLabelStudio || !labelStudioTemplate) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Template incompatível</h2>
          <p className="text-muted-foreground mb-4">
            Este template não foi criado com o Label Studio e não pode ser
            editado aqui.
          </p>
          <Button variant="ghost" onClick={() => router.push('/print/studio')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Studio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] overflow-hidden">
      {/* Page Header */}
      <div className="flex items-center justify-between px-4 py-2 mb-4">
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
            template={labelStudioTemplate}
            templateId={templateId}
            templateName={template.name}
            templateDescription={template.description || ''}
            onSave={handleSave}
            isSaving={isPending}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
}
