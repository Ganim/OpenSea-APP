/**
 * View Label Template Page
 * Página para visualizar um template de etiqueta
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import type { LabelEditorSaveData } from '@/core/print-queue/editor';
import { LabelEditor, LABEL_SIZE_PRESETS } from '@/core/print-queue/editor';
import {
  useLabelTemplate,
  useDuplicateLabelTemplate,
} from '@/hooks/stock/use-label-templates';
import { ArrowLeft, Copy, Edit, Tag } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback } from 'react';

export default function ViewLabelTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.id as string;

  const { data, isLoading, error } = useLabelTemplate(templateId);
  const { mutateAsync: duplicateTemplate, isPending: isDuplicating } =
    useDuplicateLabelTemplate();

  const template = data?.template;

  const handleBack = useCallback(() => {
    router.push('/stock/label-templates');
  }, [router]);

  const handleEdit = useCallback(() => {
    router.push(`/stock/label-templates/${templateId}/edit`);
  }, [router, templateId]);

  const handleDuplicate = useCallback(async () => {
    if (!template) return;
    const result = await duplicateTemplate({
      id: templateId,
      newName: `${template.name} (Cópia)`,
    });
    if (result?.template?.id) {
      router.push(`/stock/label-templates/${result.template.id}/edit`);
    }
  }, [duplicateTemplate, templateId, template, router]);

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
            Voltar para Templates
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
            <LabelEditor template={template} readOnly />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
