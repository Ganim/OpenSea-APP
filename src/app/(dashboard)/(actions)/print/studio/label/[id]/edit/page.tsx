'use client';

/**
 * Print Studio - Edit Label Template
 * Página de edição de etiqueta com Label Studio Editor
 */

import { GridLoading } from '@/components/handlers/grid-loading';
import { PageActionBar } from '@/components/layout/page-action-bar';
import {
  PageBody,
  PageHeader,
  PageLayout,
} from '@/components/layout/page-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type {
  LabelStudioSaveData,
  LabelStudioTemplate,
} from '@/core/print-queue/editor';
import { useEditorStore } from '@/core/print-queue/editor';
import {
  useLabelTemplate,
  useUpdateLabelTemplate,
} from '@/hooks/stock/use-label-templates';
import { logger } from '@/lib/logger';
import { Loader2, Save, Tag } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoading) {
    return (
      <PageLayout>
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'Label Studio', href: '/print/studio' },
              { label: 'Editar' },
            ]}
          />
        </PageHeader>
        <PageBody>
          <GridLoading count={3} layout="list" size="md" />
        </PageBody>
      </PageLayout>
    );
  }

  if (error || !template) {
    return (
      <PageLayout>
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'Label Studio', href: '/print/studio' },
              { label: 'Editar' },
            ]}
          />
        </PageHeader>
        <PageBody>
          <Card className="bg-white/5 p-12 text-center">
            <Tag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">
              Template não encontrado
            </h2>
            <p className="text-muted-foreground mb-6">
              O template que você está tentando editar não existe ou foi
              removido.
            </p>
            <Button onClick={() => router.push('/print/studio')}>
              Voltar para Studio
            </Button>
          </Card>
        </PageBody>
      </PageLayout>
    );
  }

  if (template.isSystem) {
    return (
      <PageLayout>
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'Label Studio', href: '/print/studio' },
              { label: template.name },
            ]}
          />
        </PageHeader>
        <PageBody>
          <Card className="bg-white/5 p-12 text-center">
            <Tag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">Template do Sistema</h2>
            <p className="text-muted-foreground mb-6">
              Templates do sistema não podem ser editados. Você pode duplicá-lo
              para criar uma versão customizada.
            </p>
            <Button onClick={() => router.push('/print/studio')}>
              Voltar para Studio
            </Button>
          </Card>
        </PageBody>
      </PageLayout>
    );
  }

  // Not a Label Studio template
  if (!isLabelStudio || !labelStudioTemplate) {
    return (
      <PageLayout>
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'Label Studio', href: '/print/studio' },
              { label: template.name },
            ]}
          />
        </PageHeader>
        <PageBody>
          <Card className="bg-white/5 p-12 text-center">
            <Tag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">
              Template incompatível
            </h2>
            <p className="text-muted-foreground mb-6">
              Este template não foi criado com o Label Studio e não pode ser
              editado aqui.
            </p>
            <Button onClick={() => router.push('/print/studio')}>
              Voltar para Studio
            </Button>
          </Card>
        </PageBody>
      </PageLayout>
    );
  }

  const actionButtons = [
    {
      id: 'save',
      title: isPending ? 'Salvando...' : 'Salvar',
      icon: Save,
      onClick: handleHeaderSave,
      disabled: isPending,
    },
  ];

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <PageLayout className="flex flex-col h-[calc(100dvh-10rem)] overflow-hidden">
      <PageHeader>
        <PageActionBar
          breadcrumbItems={[
            { label: 'Label Studio', href: '/print/studio' },
            { label: template.name, href: `/print/studio/label/${templateId}` },
            { label: 'Editar' },
          ]}
          buttons={actionButtons}
        />

        {/* Editable Title */}
        <div className="py-2">
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
      </PageHeader>

      <PageBody className="flex-1 min-h-0 pb-3 overflow-hidden">
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
      </PageBody>
    </PageLayout>
  );
}
