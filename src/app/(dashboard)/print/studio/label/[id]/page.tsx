/**
 * Print Studio - View Label Template
 * Página para visualizar um template de etiqueta
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  LABEL_SIZE_PRESETS,
  LabelStudioEditor,
  buildSamplePreviewData,
  useEditorStore,
} from '@/core/print-queue/editor';
import type { LabelStudioTemplate } from '@/core/print-queue/editor';
import {
  useLabelTemplate,
  useDuplicateLabelTemplate,
} from '@/hooks/stock/use-label-templates';
import {
  ArrowLeft,
  Copy,
  Download,
  Edit,
  Eye,
  EyeOff,
  Tag,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

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

export default function ViewLabelTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.id as string;

  const { data, isLoading, error } = useLabelTemplate(templateId);
  const { mutateAsync: duplicateTemplate, isPending: isDuplicating } =
    useDuplicateLabelTemplate();

  const [showPreview, setShowPreview] = useState(true);

  const template = data?.template;

  const isStudioTemplate = useMemo(() => {
    return isLabelStudioTemplate(template?.grapesJsData);
  }, [template?.grapesJsData]);

  const studioTemplate = useMemo(() => {
    if (!template || !isStudioTemplate) return null;
    return extractLabelStudioTemplate(template.grapesJsData);
  }, [template, isStudioTemplate]);

  // Toggle preview data (mock data in field elements)
  useEffect(() => {
    if (!studioTemplate) return;
    // Small delay to ensure store is initialized after LabelStudioEditor mounts
    const timer = setTimeout(() => {
      if (showPreview) {
        useEditorStore.getState().setPreviewData(buildSamplePreviewData());
      } else {
        useEditorStore.getState().setPreviewData(null);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [showPreview, studioTemplate]);

  const handleBack = useCallback(() => {
    router.push('/print/studio');
  }, [router]);

  const handleEdit = useCallback(() => {
    router.push(`/print/studio/label/${templateId}/edit`);
  }, [router, templateId]);

  const handleDuplicate = useCallback(async () => {
    if (!template) return;
    const result = await duplicateTemplate({
      id: templateId,
      newName: `${template.name} (Cópia)`,
    });
    if (result?.template?.id) {
      router.push(`/print/studio/label/${result.template.id}/edit`);
    }
  }, [duplicateTemplate, templateId, template, router]);

  const handleExport = useCallback(() => {
    if (!template) return;
    try {
      const exportData = {
        exportVersion: 1,
        exportedAt: new Date().toISOString(),
        template: {
          name: template.name,
          description: template.description || '',
          width: template.width,
          height: template.height,
          grapesJsData: template.grapesJsData,
        },
      };
      const json = JSON.stringify(exportData, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${template.name}.label.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Template exportado com sucesso!');
    } catch {
      toast.error('Erro ao exportar template');
    }
  }, [template]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-12 text-center">
          <Tag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-2">
            Template não encontrado
          </h2>
          <p className="text-muted-foreground mb-6">
            O template que você está procurando não existe ou foi removido.
          </p>
          <Button onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Studio
          </Button>
        </Card>
      </div>
    );
  }

  const sizePreset = LABEL_SIZE_PRESETS.find(
    p => p.width === template.width && p.height === template.height
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {template.name}
              {template.isSystem && <Badge variant="secondary">Sistema</Badge>}
            </h1>
            {template.description && (
              <p className="text-muted-foreground">{template.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isStudioTemplate && (
            <Button
              variant={showPreview ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? (
                <EyeOff className="w-4 h-4 mr-2" />
              ) : (
                <Eye className="w-4 h-4 mr-2" />
              )}
              {showPreview ? 'Ocultar Preview' : 'Preview'}
            </Button>
          )}
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button
            variant="outline"
            onClick={handleDuplicate}
            disabled={isDuplicating}
          >
            <Copy className="w-4 h-4 mr-2" />
            {isDuplicating ? 'Duplicando...' : 'Duplicar'}
          </Button>
          {!template.isSystem && (
            <Button onClick={handleEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          )}
        </div>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informações do Template</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Dimensões</p>
              <p className="font-medium">
                {template.width}mm x {template.height}mm
              </p>
            </div>
            {sizePreset && (
              <div>
                <p className="text-sm text-muted-foreground">Tamanho</p>
                <p className="font-medium">{sizePreset.name}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Tipo</p>
              <p className="font-medium">
                {template.isSystem ? 'Sistema' : 'Customizado'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Criado em</p>
              <p className="font-medium">
                {new Date(template.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Preview do Template</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[500px]">
            {isStudioTemplate && studioTemplate ? (
              <LabelStudioEditor
                template={studioTemplate}
                templateName={template.name}
                className="h-full"
                readOnly
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>Preview não disponível para este tipo de template</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
