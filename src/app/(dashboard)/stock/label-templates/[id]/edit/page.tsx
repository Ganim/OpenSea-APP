/**
 * Edit Label Template Page
 * Página para editar um template de etiqueta existente
 * Detecta automaticamente se foi criado com editor simples ou avançado
 */

'use client';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type {
  LabelEditorSaveData,
  SimpleLabelSaveData,
} from '@/core/print-queue/editor';
import { LabelEditor, SimpleLabelEditor } from '@/core/print-queue/editor';
import type { LabelTemplatePreset } from '@/core/print-queue/editor';
import {
  useLabelTemplate,
  useUpdateLabelTemplate,
} from '@/hooks/stock/use-label-templates';
import { ArrowLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';

/**
 * Detecta se o template foi criado com o editor simples
 */
function isSimpleEditorTemplate(grapesJsData: string | undefined): boolean {
  if (!grapesJsData) return false;
  try {
    const parsed = JSON.parse(grapesJsData);
    return parsed.editorType === 'simple';
  } catch {
    return false;
  }
}

/**
 * Extrai os dados do editor simples
 */
function extractSimpleEditorData(
  grapesJsData: string
): { html: string; css: string } | null {
  try {
    const parsed = JSON.parse(grapesJsData);
    if (parsed.editorType === 'simple') {
      return {
        html: parsed.html || '',
        css: parsed.css || '',
      };
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

export default function EditLabelTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.id as string;

  const { data, isLoading, error } = useLabelTemplate(templateId);
  const { mutateAsync: updateTemplate, isPending } = useUpdateLabelTemplate();

  const template = data?.template;

  // Detectar tipo de editor usado
  const isSimpleEditor = useMemo(() => {
    return isSimpleEditorTemplate(template?.grapesJsData);
  }, [template?.grapesJsData]);

  // Converter template para formato do editor simples se necessário
  const simpleEditorTemplate = useMemo((): LabelTemplatePreset | undefined => {
    if (!template || !isSimpleEditor) return undefined;

    const simpleData = extractSimpleEditorData(template.grapesJsData);
    if (!simpleData) return undefined;

    // Combinar HTML e CSS
    const fullHtml = simpleData.css
      ? `<style>${simpleData.css}</style>${simpleData.html}`
      : simpleData.html;

    return {
      id: template.id,
      name: template.name,
      description: template.description || '',
      category: 'product',
      width: template.width,
      height: template.height,
      html: fullHtml,
    };
  }, [template, isSimpleEditor]);

  // Handler para salvar do editor avançado (GrapesJS)
  const handleAdvancedSave = useCallback(
    async (data: LabelEditorSaveData) => {
      try {
        await updateTemplate({
          id: templateId,
          data: {
            name: data.name,
            description: data.description,
            width: data.width,
            height: data.height,
            grapesJsData: data.grapesJsData,
            compiledHtml: data.compiledHtml,
            compiledCss: data.compiledCss,
          },
        });
        router.push('/stock/label-templates');
      } catch (error) {
        console.error('Failed to update template:', error);
      }
    },
    [updateTemplate, templateId, router]
  );

  // Handler para salvar do editor simplificado
  const handleSimpleSave = useCallback(
    async (data: SimpleLabelSaveData) => {
      try {
        const simpleEditorData = JSON.stringify({
          editorType: 'simple',
          version: 1,
          html: data.html,
          css: data.css,
        });

        await updateTemplate({
          id: templateId,
          data: {
            name: data.name,
            description: data.description,
            width: data.width,
            height: data.height,
            grapesJsData: simpleEditorData,
            compiledHtml: data.html,
            compiledCss: data.css,
          },
        });
        router.push('/stock/label-templates');
      } catch (error) {
        console.error('Failed to update template:', error);
      }
    },
    [updateTemplate, templateId, router]
  );

  const handleCancel = useCallback(() => {
    router.push('/stock/label-templates');
  }, [router]);

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
          <Button
            variant="ghost"
            onClick={() => router.push('/stock/label-templates')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Templates
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
          <Button
            variant="ghost"
            onClick={() => router.push('/stock/label-templates')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Templates
          </Button>
        </div>
      </div>
    );
  }

  // Editor simplificado
  if (isSimpleEditor && simpleEditorTemplate) {
    return (
      <div className="h-[calc(100vh-4rem)]">
        <SimpleLabelEditor
          initialTemplate={simpleEditorTemplate}
          onSave={handleSimpleSave}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  // Editor avançado (GrapesJS)
  return (
    <div className="h-[calc(100vh-4rem)]">
      <LabelEditor
        template={template}
        onSave={handleAdvancedSave}
        onCancel={handleCancel}
      />
    </div>
  );
}
