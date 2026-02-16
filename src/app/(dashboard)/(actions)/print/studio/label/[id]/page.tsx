/**
 * Print Studio - View Label Template
 * Página para visualizar um template de etiqueta
 */

'use client';

import { GridLoading } from '@/components/handlers/grid-loading';
import { PageActionBar } from '@/components/layout/page-action-bar';
import {
  PageBody,
  PageHeader,
  PageLayout,
} from '@/components/layout/page-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LabelStudioEditor,
  buildSamplePreviewData,
  useEditorStore,
} from '@/core/print-queue/editor';
import type { LabelStudioTemplate } from '@/core/print-queue/editor';
import { TestPrintModal } from '@/core/print-queue/components/test-print-modal';
import { useLabelTemplate } from '@/hooks/stock/use-label-templates';
import {
  Calendar,
  Clock,
  Download,
  Edit,
  Eye,
  EyeOff,
  Printer,
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

  const [showPreview, setShowPreview] = useState(true);
  const [testPrintOpen, setTestPrintOpen] = useState(false);

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
    const timer = setTimeout(() => {
      if (showPreview) {
        useEditorStore.getState().setPreviewData(buildSamplePreviewData());
      } else {
        useEditorStore.getState().setPreviewData(null);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [showPreview, studioTemplate]);

  const handleEdit = useCallback(() => {
    router.push(`/print/studio/label/${templateId}/edit`);
  }, [router, templateId]);

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

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoading) {
    return (
      <PageLayout>
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[{ label: 'Label Studio', href: '/print/studio' }]}
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
            breadcrumbItems={[{ label: 'Label Studio', href: '/print/studio' }]}
          />
        </PageHeader>
        <PageBody>
          <Card className="bg-white/5 p-12 text-center">
            <Tag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">
              Template não encontrado
            </h2>
            <p className="text-muted-foreground mb-6">
              O template que você está procurando não existe ou foi removido.
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
      id: 'export',
      title: 'Exportar',
      icon: Download,
      onClick: handleExport,
      variant: 'outline' as const,
    },
    ...(isStudioTemplate
      ? [
          {
            id: 'test-print',
            title: 'Imprimir Teste',
            icon: Printer,
            onClick: () => setTestPrintOpen(true),
            variant: 'outline' as const,
          },
        ]
      : []),
    ...(!template.isSystem
      ? [
          {
            id: 'edit',
            title: 'Editar',
            icon: Edit,
            onClick: handleEdit,
          },
        ]
      : []),
  ];

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <PageLayout>
      <PageHeader>
        <PageActionBar
          breadcrumbItems={[
            { label: 'Label Studio', href: '/print/studio' },
            { label: template.name },
          ]}
          buttons={actionButtons}
        />

        {/* Identity Card */}
        <Card className="bg-white/5 p-5">
          <div className="flex items-start gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl shrink-0 bg-linear-to-br from-blue-500 to-cyan-600">
              <Tag className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">
                  {template.name}
                </h1>
                <Badge variant={template.isSystem ? 'secondary' : 'outline'}>
                  {template.isSystem ? 'Sistema' : 'Customizado'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {template.description ||
                  `${template.width}mm x ${template.height}mm`}
              </p>
            </div>
            <div className="flex flex-col gap-2 shrink-0 text-sm">
              {template.createdAt && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span>
                    {new Date(template.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
              {template.updatedAt && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span>
                    {new Date(template.updatedAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </PageHeader>

      <PageBody className="space-y-6">
        {/* Preview do Template */}
        <Card className="p-4 sm:p-6 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
          <CardHeader className="p-0 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg uppercase font-semibold">
                Preview do Template
              </CardTitle>
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
            </div>
          </CardHeader>
          <CardContent className="p-0">
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
      </PageBody>

      {/* Test Print Modal */}
      {studioTemplate && (
        <TestPrintModal
          open={testPrintOpen}
          onOpenChange={setTestPrintOpen}
          template={studioTemplate}
        />
      )}
    </PageLayout>
  );
}
