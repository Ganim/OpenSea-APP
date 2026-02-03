/**
 * OpenSea OS - Template Detail Page
 * Página de detalhes de um template específico com edição avançada
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { templatesService } from '@/services/stock';
import type { Template, UnitOfMeasure } from '@/types/stock';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, FileText } from 'lucide-react';
import { GrObjectGroup } from 'react-icons/gr';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { TemplateViewer } from '../src/components';

export default function TemplateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const templateId = params.id as string;

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const { data: template, isLoading } = useQuery<Template>({
    queryKey: ['templates', templateId],
    queryFn: async () => {
      const response = await templatesService.getTemplate(templateId);
      return response.template;
    },
  });

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleBack = () => {
    router.push('/stock/templates');
  };

  const handleSave = async (data: {
    name: string;
    iconUrl?: string;
    unitOfMeasure: UnitOfMeasure;
    productAttributes: Record<string, unknown>;
    variantAttributes: Record<string, unknown>;
    itemAttributes: Record<string, unknown>;
  }) => {
    try {
      await templatesService.updateTemplate(templateId, {
        name: data.name,
        iconUrl: data.iconUrl,
        unitOfMeasure: data.unitOfMeasure,
        productAttributes: data.productAttributes as any,
        variantAttributes: data.variantAttributes as any,
        itemAttributes: data.itemAttributes as any,
      });
      await queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Template atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar template:', error);
      toast.error('Erro ao salvar template');
      throw error;
    }
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-12 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
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

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen from-purple-50 via-gray-50 to-pink-50 dark:from-gray-900 dark:via-slate-900 dark:to-slate-800 px-6">
      {/* Header com botão voltar + ícone */}
      <div className="max-w-8xl flex items-center justify-between mb-4">
        <Button variant="ghost" size={'sm'} onClick={handleBack}>
          <ArrowLeft className="h-5 w-5" />
          Voltar para Templates
        </Button>

        <Button
          size={'sm'}
          onClick={() => router.push(`/stock/templates/${templateId}/edit`)}
        >
          Editar
        </Button>
      </div>

      {/* Content - Visualização apenas */}
      <div className="max-w-8xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-slate-600 to-slate-800 overflow-hidden">
            {template.iconUrl ? (
              <img
                src={template.iconUrl}
                alt={template.name}
                className="h-6 w-6 object-contain brightness-0 invert"
              />
            ) : (
              <GrObjectGroup className="h-5 w-5 text-white" />
            )}
          </div>
          <h1 className="text-xl font-bold">{template.name}</h1>
        </div>

        <TemplateViewer
          template={template}
          showHeader={false}
          showEditButton={false}
          onSave={handleSave}
          isModal={false}
        />
      </div>
    </div>
  );
}
