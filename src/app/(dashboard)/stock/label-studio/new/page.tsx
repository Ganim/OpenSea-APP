'use client';

/**
 * Label Studio - Nova Etiqueta (Página de Teste)
 * Esta página é usada para testar o novo editor Label Studio
 */

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LabelStudioEditor } from '@/core/print-queue/editor';
import type { LabelStudioTemplate } from '@/core/print-queue/editor';
import { toast } from 'sonner';

export default function NewLabelStudioPage() {
  const router = useRouter();

  const handleSave = useCallback(
    (template: LabelStudioTemplate, name: string, description: string) => {
      // Por enquanto, apenas logamos o template
      console.log('Template salvo:', { template, name, description });

      // Exibir toast de sucesso
      toast.success('Template criado com sucesso!', {
        description: `${name} (${template.width}×${template.height}mm)`,
      });

      // TODO: Implementar salvamento via API
      // const response = await api.createLabelTemplate({
      //   name,
      //   description,
      //   width: template.width,
      //   height: template.height,
      //   grapesJsData: JSON.stringify(template), // Usamos o mesmo campo, mas com version: 2
      // });
    },
    []
  );

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Label Studio
          </h1>
          <p className="text-xs text-neutral-500">
            Editor de etiquetas (versão de teste)
          </p>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1">
        <LabelStudioEditor
          initialWidth={60}
          initialHeight={40}
          templateName="Nova Etiqueta"
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
