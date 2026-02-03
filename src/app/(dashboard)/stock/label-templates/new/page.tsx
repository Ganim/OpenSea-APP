/**
 * New Label Template Page
 * Página para criar um novo template de etiqueta
 * Oferece duas opções de editor: Simples (recomendado) e Avançado (GrapesJS)
 */

'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type {
  LabelEditorSaveData,
  SimpleLabelSaveData,
} from '@/core/print-queue/editor';
import { LabelEditor, SimpleLabelEditor } from '@/core/print-queue/editor';
import { useCreateLabelTemplate } from '@/hooks/stock/use-label-templates';
import { ArrowLeft, Blocks, PenLine, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

type EditorMode = 'select' | 'simple' | 'advanced';

/**
 * Tela de seleção de editor
 */
function EditorSelector({
  onSelect,
  onCancel,
}: {
  onSelect: (mode: 'simple' | 'advanced') => void;
  onCancel: () => void;
}) {
  return (
    <div className="h-full flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-8">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Criar Novo Template</h1>
          <p className="text-muted-foreground">
            Escolha como você quer criar seu template de etiqueta
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Editor Simplificado */}
          <Card
            className="cursor-pointer transition-all hover:shadow-lg hover:border-primary group"
            onClick={() => onSelect('simple')}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="flex items-center justify-center gap-2">
                Editor Simplificado
                <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
                  Recomendado
                </span>
              </CardTitle>
              <CardDescription>
                Comece com um template pronto e personalize
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Templates prontos para usar
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Clique nos campos para substituir
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Interface simples e intuitiva
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Ideal para maioria dos casos
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Editor Avançado */}
          <Card
            className="cursor-pointer transition-all hover:shadow-lg hover:border-primary group"
            onClick={() => onSelect('advanced')}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
                <Blocks className="w-8 h-8 text-slate-600 dark:text-slate-400" />
              </div>
              <CardTitle className="flex items-center justify-center gap-2">
                Editor Avançado
                <span className="text-xs bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">
                  Complexo
                </span>
              </CardTitle>
              <CardDescription>
                Crie layouts do zero com drag-and-drop
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Controle total do layout
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Arraste e solte elementos
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Edição de CSS avançada
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Para layouts muito específicos
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Button variant="ghost" onClick={onCancel}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Templates
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function NewLabelTemplatePage() {
  const router = useRouter();
  const [editorMode, setEditorMode] = useState<EditorMode>('select');
  const { mutateAsync: createTemplate, isPending } = useCreateLabelTemplate();

  // Handler para salvar do editor avançado (GrapesJS)
  const handleAdvancedSave = useCallback(
    async (data: LabelEditorSaveData) => {
      try {
        await createTemplate({
          name: data.name,
          description: data.description,
          width: data.width,
          height: data.height,
          grapesJsData: data.grapesJsData,
          compiledHtml: data.compiledHtml,
          compiledCss: data.compiledCss,
        });
        router.push('/stock/label-templates');
      } catch (error) {
        console.error('Failed to create template:', error);
      }
    },
    [createTemplate, router]
  );

  // Handler para salvar do editor simplificado
  const handleSimpleSave = useCallback(
    async (data: SimpleLabelSaveData) => {
      try {
        // Criar um grapesJsData mínimo válido para o editor simples
        // Armazena o HTML/CSS original para permitir edição futura
        const simpleEditorData = JSON.stringify({
          editorType: 'simple',
          version: 1,
          html: data.html,
          css: data.css,
        });

        await createTemplate({
          name: data.name,
          description: data.description,
          width: data.width,
          height: data.height,
          grapesJsData: simpleEditorData,
          compiledHtml: data.html,
          compiledCss: data.css,
        });
        router.push('/stock/label-templates');
      } catch (error) {
        console.error('Failed to create template:', error);
      }
    },
    [createTemplate, router]
  );

  const handleCancel = useCallback(() => {
    if (editorMode === 'select') {
      router.push('/stock/label-templates');
    } else {
      setEditorMode('select');
    }
  }, [editorMode, router]);

  // Tela de seleção de editor
  if (editorMode === 'select') {
    return (
      <div className="h-[calc(100vh-4rem)]">
        <EditorSelector
          onSelect={setEditorMode}
          onCancel={() => router.push('/stock/label-templates')}
        />
      </div>
    );
  }

  // Editor simplificado
  if (editorMode === 'simple') {
    return (
      <div className="h-[calc(100vh-4rem)]">
        <SimpleLabelEditor onSave={handleSimpleSave} onCancel={handleCancel} />
      </div>
    );
  }

  // Editor avançado (GrapesJS)
  return (
    <div className="h-[calc(100vh-4rem)]">
      <LabelEditor
        onSave={handleAdvancedSave}
        onCancel={handleCancel}
        initialWidth={60}
        initialHeight={40}
      />
    </div>
  );
}
