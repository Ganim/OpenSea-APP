/**
 * Template View Page
 * Página de visualização detalhada de um template
 */

'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { PageHeader } from '@/components/stock/page-header';
import { TemplateViewer } from '@/components/stock/template-viewer';
import { Button } from '@/components/ui/button';
import { useCreateTemplate, useTemplate } from '@/hooks/stock';
import type { CreateTemplateRequest } from '@/types/stock';
import { Copy, Edit } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { toast } from 'sonner';

export default function ViewTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id: templateId } = use(params);

  const { data: template, isLoading, error } = useTemplate(templateId);
  const createTemplateMutation = useCreateTemplate();

  const handleEdit = () => {
    router.push(`/stock/assets/templates/${templateId}/edit`);
  };

  const handleDuplicate = async () => {
    if (!template) return;

    try {
      const data: CreateTemplateRequest = {
        name: `${template.name} (Cópia)`,
        productAttributes: template.productAttributes || {},
        variantAttributes: template.variantAttributes || {},
        itemAttributes: template.itemAttributes || {},
      };

      const newTemplate = await createTemplateMutation.mutateAsync(data);
      toast.success('Template duplicado com sucesso!');
      router.push(`/stock/assets/templates/${newTemplate.id}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro desconhecido';
      const errorDetails = JSON.stringify(
        {
          error: message,
          templateId,
          templateName: template.name,
          timestamp: new Date().toISOString(),
        },
        null,
        2
      );

      toast.error('Erro ao duplicar template', {
        description: message,
        action: {
          label: 'Copiar erro',
          onClick: () => {
            navigator.clipboard.writeText(errorDetails);
            toast.success('Erro copiado para área de transferência');
          },
        },
      });
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute requiredRole="MANAGER">
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Carregando template...
            </p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !template) {
    return (
      <ProtectedRoute requiredRole="MANAGER">
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <p className="text-red-600 dark:text-red-400">
              Erro ao carregar template
            </p>
            <Button onClick={() => router.push('/stock/assets/templates')}>
              Voltar
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="MANAGER">
      <div className="pb-8">
        <PageHeader
          title={template.name}
          description={`Criado em ${new Date(template.createdAt).toLocaleDateString('pt-BR')}`}
          showBackButton={true}
          backUrl="/stock/assets/templates"
          buttons={[
            {
              icon: Copy,
              text: 'Duplicar',
              onClick: handleDuplicate,
              variant: 'outline',
            },
            {
              icon: Edit,
              text: 'Editar',
              onClick: handleEdit,
              variant: 'default',
            },
          ]}
        />

        <TemplateViewer template={template} />
      </div>
    </ProtectedRoute>
  );
}
