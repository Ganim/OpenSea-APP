/**
 * Template Viewer Component
 * Componente reutilizável para visualização de templates
 * Responsabilidade única: Renderizar detalhes do template em modo leitura ou edição
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Template, UnitOfMeasure } from '@/types/stock';
import {
  Calendar,
  Layers,
  LayoutTemplate,
  Pencil,
  RefreshCcwDot,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { getUnitLabel } from '../constants/unit-labels';
import { TemplateForm, type TemplateFormRef } from './template-form';

interface AttributeDefinition {
  label: string;
  type: string;
  required: boolean;
  options?: string[];
}

export interface TemplateViewerProps {
  template: Template;
  showHeader?: boolean;
  showEditButton?: boolean;
  className?: string;
  // Props para dropdown de seleção
  availableTemplates?: Template[];
  onTemplateChange?: (templateId: string) => void;
  // Props para edição inline
  onSave?: (data: {
    name: string;
    unitOfMeasure: UnitOfMeasure;
    productAttributes: Record<string, unknown>;
    variantAttributes: Record<string, unknown>;
    itemAttributes: Record<string, unknown>;
  }) => Promise<void>;
  isModal?: boolean;
}

export function TemplateViewer({
  template,
  showHeader = false,
  showEditButton = false,
  className = '',
  availableTemplates,
  onTemplateChange,
  onSave,
  isModal = true,
}: TemplateViewerProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const formRef = useRef<TemplateFormRef>(null);
  const searchParams = useSearchParams();

  // Verificar se deve entrar em modo de edição baseado no parâmetro da URL
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'edit' && showEditButton) {
      setIsEditMode(true);
    }
  }, [searchParams, showEditButton]);

  const productAttributes = template.productAttributes as Record<
    string,
    AttributeDefinition
  > | null;
  const variantAttributes = template.variantAttributes as Record<
    string,
    AttributeDefinition
  > | null;
  const itemAttributes = template.itemAttributes as Record<
    string,
    AttributeDefinition
  > | null;

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleSaveEdit = () => {
    // Aciona o método submit do TemplateForm via ref
    if (formRef.current) {
      formRef.current.submit();
    }
  };

  const handleCancel = () => {
    setIsEditMode(false);
  };

  return (
    <div className={className}>
      {/* Mini Header com nome e botão editar */}
      {showEditButton && (
        <div
          className={`px-4 py-4 flex items-center justify-between sticky top-0 z-10 mb-2 ${
            isModal
              ? 'bg-white dark:bg-gray-800 border-b dark:border-gray-700'
              : ''
          }`}
        >
          {availableTemplates && onTemplateChange ? (
            <Select value={template.id} onValueChange={onTemplateChange}>
              <SelectTrigger className="w-auto border border-gray-800! shadow-none hover:border hover:border-gray-300 dark:hover:border-gray-700! cursor-pointer bg-gray-800! px-4 py-1 h-auto gap-2 rounded-lg transition-colors">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {template.name}
                </h2>
              </SelectTrigger>
              <SelectContent>
                {availableTemplates.map(t => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-purple-500 to-pink-600">
                <LayoutTemplate className="h-5 w-5 text-white" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold">{template.name}</h1>
                  <Badge variant="default" className="text-xs">
                    {getUnitLabel(template.unitOfMeasure)}
                  </Badge>
                </div>
                <div className="flex items-center justify-end gap-4 text-xs">
                  {template.createdAt && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-blue-500" />
                      Criado em{' '}
                      {new Date(template.createdAt).toLocaleDateString()}
                    </span>
                  )}
                  {template.updatedAt &&
                    template.updatedAt !== template.createdAt && (
                      <span className="flex items-center gap-1">
                        <RefreshCcwDot className="h-3 w-3 text-yellow-500" />
                        Atualizado em{' '}
                        {new Date(template.updatedAt).toLocaleDateString()}
                      </span>
                    )}
                </div>
              </div>
            </div>
          )}
          {isEditMode ? (
            <div className="flex items-center gap-2 shrink-0 ml-4">
              <Button
                onClick={handleCancel}
                size="sm"
                variant="outline"
                className="gap-2"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveEdit}
                size="sm"
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isSaving}
              >
                {isSaving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleEdit}
              size="sm"
              className="gap-2 shrink-0 ml-4 bg-slate-600 hover:bg-slate-700 text-white shadow-sm"
            >
              <Pencil className="w-4 h-4" />
              Editar
            </Button>
          )}
        </div>
      )}

      {/* Modo de Edição ou Visualização */}
      {isEditMode ? (
        <TemplateForm
          ref={formRef}
          template={template}
          onSubmit={async data => {
            if (onSave) {
              try {
                setIsSaving(true);
                await onSave(data);
                setIsEditMode(false);
              } catch (error) {
                console.error('Erro ao salvar:', error);
              } finally {
                setIsSaving(false);
              }
            }
          }}
        />
      ) : (
        <>
          {showHeader && !showEditButton && (
            <div className="mb-6 px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-purple-500 to-pink-600">
                  <LayoutTemplate className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">{template.name}</h1>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-blue-500" />
                  Criado em{' '}
                  {new Date(template.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </p>
            </div>
          )}

          <Tabs defaultValue="product" className="w-full">
            <div className="mt-4">
              <TabsList className="grid w-full grid-cols-3 h-12">
                <TabsTrigger value="product" className="gap-2">
                  <Layers className="w-4 h-4" />
                  Produtos
                </TabsTrigger>
                <TabsTrigger value="variant" className="gap-2">
                  <Layers className="w-4 h-4" />
                  Variantes
                </TabsTrigger>
                <TabsTrigger value="item" className="gap-2">
                  <Layers className="w-4 h-4" />
                  Itens
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab: Atributos de Produtos */}
            <TabsContent value="product" className="space-y-4 mt-6 pb-6">
              <div className="p-6 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                  <Layers className="w-5 h-5 text-blue-500" />
                  <h2 className="text-lg font-semibold">
                    Atributos de Produtos
                  </h2>
                </div>

                {!productAttributes ||
                Object.keys(productAttributes).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum atributo de produto configurado.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(productAttributes).map(([key, attr]) => (
                      <div
                        key={key}
                        className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Rótulo
                            </p>
                            <p className="font-medium">{attr.label}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Tipo
                            </p>
                            <p className="font-medium capitalize">
                              {attr.type}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Status
                            </p>
                            <p
                              className={`font-medium ${
                                attr.required
                                  ? 'text-red-600 dark:text-red-400'
                                  : 'text-green-600 dark:text-green-400'
                              }`}
                            >
                              {attr.required ? 'Obrigatório' : 'Opcional'}
                            </p>
                          </div>
                          {attr.type === 'select' && attr.options && (
                            <div className="col-span-full">
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                Opções
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {attr.options.map((option, idx) => (
                                  <span
                                    key={idx}
                                    className="px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                                  >
                                    {option}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Tab: Atributos de Variantes */}
            <TabsContent value="variant" className="space-y-4 mt-6 px-6 pb-6">
              <div className="p-6 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                  <Layers className="w-5 h-5 text-purple-500" />
                  <h2 className="text-lg font-semibold">
                    Atributos de Variantes
                  </h2>
                </div>

                {!variantAttributes ||
                Object.keys(variantAttributes).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum atributo de variante configurado.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(variantAttributes).map(([key, attr]) => (
                      <div
                        key={key}
                        className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Rótulo
                            </p>
                            <p className="font-medium">{attr.label}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Tipo
                            </p>
                            <p className="font-medium capitalize">
                              {attr.type}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Status
                            </p>
                            <p
                              className={`font-medium ${
                                attr.required
                                  ? 'text-red-600 dark:text-red-400'
                                  : 'text-green-600 dark:text-green-400'
                              }`}
                            >
                              {attr.required ? 'Obrigatório' : 'Opcional'}
                            </p>
                          </div>
                          {attr.type === 'select' && attr.options && (
                            <div className="col-span-full">
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                Opções
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {attr.options.map((option, idx) => (
                                  <span
                                    key={idx}
                                    className="px-3 py-1 rounded-full text-sm bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300"
                                  >
                                    {option}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Tab: Atributos de Itens */}
            <TabsContent value="item" className="space-y-4 mt-6 px-6 pb-6">
              <div className="p-6 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                  <Layers className="w-5 h-5 text-green-500" />
                  <h2 className="text-lg font-semibold">Atributos de Itens</h2>
                </div>

                {!itemAttributes || Object.keys(itemAttributes).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum atributo de item configurado.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(itemAttributes).map(([key, attr]) => (
                      <div
                        key={key}
                        className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Rótulo
                            </p>
                            <p className="font-medium">{attr.label}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Tipo
                            </p>
                            <p className="font-medium capitalize">
                              {attr.type}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Status
                            </p>
                            <p
                              className={`font-medium ${
                                attr.required
                                  ? 'text-red-600 dark:text-red-400'
                                  : 'text-green-600 dark:text-green-400'
                              }`}
                            >
                              {attr.required ? 'Obrigatório' : 'Opcional'}
                            </p>
                          </div>
                          {attr.type === 'select' && attr.options && (
                            <div className="col-span-full">
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                Opções
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {attr.options.map((option, idx) => (
                                  <span
                                    key={idx}
                                    className="px-3 py-1 rounded-full text-sm bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                                  >
                                    {option}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
