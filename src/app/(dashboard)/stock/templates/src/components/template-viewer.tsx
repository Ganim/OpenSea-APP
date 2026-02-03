/**
 * Template Viewer Component
 * Componente reutilizável para visualização de templates
 * Exibe todos os campos incluindo: mask, placeholder, unitOfMeasure, enablePrint, enableView
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { InfoField } from '@/components/shared/info-field';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Template, TemplateAttribute, UnitOfMeasure } from '@/types/stock';
import { Calendar, Layers, Pencil, RefreshCcwDot } from 'lucide-react';
import {
  MdPrint,
  MdPrintDisabled,
  MdVisibility,
  MdVisibilityOff,
} from 'react-icons/md';
import { GrObjectGroup } from 'react-icons/gr';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { getUnitLabel } from '../constants/unit-labels';
import {
  ATTRIBUTE_TYPE_LABELS,
  type TemplateFormData,
} from '../types/templates.types';
import { TemplateForm, type TemplateFormRef } from './template-form';

export interface TemplateViewerProps {
  template: Template;
  showHeader?: boolean;
  showEditButton?: boolean;
  className?: string;
  availableTemplates?: Template[];
  onTemplateChange?: (templateId: string) => void;
  onSave?: (data: {
    name: string;
    iconUrl?: string;
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

  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'edit' && showEditButton) {
      setIsEditMode(true);
    }
  }, [searchParams, showEditButton]);

  const productAttributes = template.productAttributes as Record<
    string,
    TemplateAttribute
  > | null;
  const variantAttributes = template.variantAttributes as Record<
    string,
    TemplateAttribute
  > | null;
  const itemAttributes = template.itemAttributes as Record<
    string,
    TemplateAttribute
  > | null;

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleSaveEdit = () => {
    if (formRef.current) {
      formRef.current.submit();
    }
  };

  const handleCancel = () => {
    setIsEditMode(false);
  };

  const handleFormSubmit = async (data: TemplateFormData) => {
    if (onSave) {
      try {
        setIsSaving(true);
        await onSave({
          name: data.name,
          iconUrl: data.iconUrl,
          unitOfMeasure: data.unitOfMeasure as UnitOfMeasure,
          productAttributes: data.productAttributes || {},
          variantAttributes: data.variantAttributes || {},
          itemAttributes: data.itemAttributes || {},
        });
        setIsEditMode(false);
      } catch (error) {
        console.error('Erro ao salvar:', error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Renderiza um atributo individual
  const renderAttribute = (key: string, attr: TemplateAttribute) => (
    <div
      key={key}
      className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-medium">{attr.label}</h4>
        </div>
        <div className="flex items-center gap-1">
          <TooltipProvider>
            {/* Required badge */}
            <Badge
              variant={attr.required ? 'destructive' : 'secondary'}
              className="text-xs"
            >
              {attr.required ? 'Obrigatório' : 'Opcional'}
            </Badge>

            {/* Print indicator */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={`p-2 rounded-full ${
                    attr.enablePrint
                      ? 'text-white bg-linear-to-br from-blue-500 to-cyan-500 shadow-sm'
                      : 'text-gray-400 bg-gray-100 dark:bg-gray-800'
                  }`}
                >
                  {attr.enablePrint ? (
                    <MdPrint className="h-3.5 w-3.5" />
                  ) : (
                    <MdPrintDisabled className="h-3.5 w-3.5" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {attr.enablePrint ? 'Imprime na etiqueta' : 'Não imprime'}
              </TooltipContent>
            </Tooltip>

            {/* View indicator */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={`p-2 rounded-full ${
                    attr.enableView
                      ? 'text-white bg-linear-to-br from-emerald-500 to-green-600 shadow-sm'
                      : 'text-gray-400 bg-gray-100 dark:bg-gray-800'
                  }`}
                >
                  {attr.enableView ? (
                    <MdVisibility className="h-3.5 w-3.5" />
                  ) : (
                    <MdVisibilityOff className="h-3.5 w-3.5" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {attr.enableView ? 'Visível' : 'Oculto'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
        <InfoField
          label="Tipo"
          value={ATTRIBUTE_TYPE_LABELS[attr.type] || attr.type}
        />
        {attr.unitOfMeasure && (
          <InfoField label="Unidade" value={attr.unitOfMeasure} />
        )}
        {attr.mask && <InfoField label="Máscara" value={attr.mask} />}
        {attr.placeholder && (
          <InfoField label="Placeholder" value={attr.placeholder} />
        )}
        {attr.defaultValue !== undefined && attr.defaultValue !== '' && (
          <InfoField
            label="Valor Padrão"
            value={
              attr.type === 'boolean'
                ? attr.defaultValue
                  ? 'Sim'
                  : 'Não'
                : String(attr.defaultValue)
            }
          />
        )}
      </div>

      {/* Descrição */}
      {attr.description && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-muted-foreground mb-0.5">Descrição</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {attr.description}
          </p>
        </div>
      )}

      {/* Opções (para select) */}
      {attr.type === 'select' && attr.options && attr.options.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-muted-foreground mb-2">Opções</p>
          <div className="flex flex-wrap gap-1.5">
            {attr.options.map((option, idx) => (
              <Badge key={idx} variant="outline">
                {option}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Renderiza seção de atributos
  const renderAttributesSection = (
    title: string,
    attributes: Record<string, TemplateAttribute> | null,
    iconColor: string
  ) => (
    <div className="w-full p-6 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <Layers className={`w-5 h-5 ${iconColor}`} />
        <h2 className="text-lg font-semibold">{title}</h2>
        {attributes && Object.keys(attributes).length > 0 && (
          <Badge variant="secondary" className="ml-auto">
            {Object.keys(attributes).length} atributos
          </Badge>
        )}
      </div>

      {!attributes || Object.keys(attributes).length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Nenhum atributo configurado.
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(attributes).map(([key, attr]) =>
            renderAttribute(key, attr)
          )}
        </div>
      )}
    </div>
  );

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
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-slate-600 to-slate-800 overflow-hidden">
                {template.iconUrl ? (
                  <img
                    src={template.iconUrl}
                    alt={template.name}
                    className="h-6 w-6 object-contain brightness-0 invert"
                    onError={e => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <GrObjectGroup className="h-5 w-5 text-white" />
                )}
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
          onSubmit={handleFormSubmit}
        />
      ) : (
        <>
          {showHeader && !showEditButton && (
            <div className="mb-6 px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-slate-600 to-slate-800 overflow-hidden">
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
                  {productAttributes &&
                    Object.keys(productAttributes).length > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {Object.keys(productAttributes).length}
                      </Badge>
                    )}
                </TabsTrigger>
                <TabsTrigger value="variant" className="gap-2">
                  <Layers className="w-4 h-4" />
                  Variantes
                  {variantAttributes &&
                    Object.keys(variantAttributes).length > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {Object.keys(variantAttributes).length}
                      </Badge>
                    )}
                </TabsTrigger>
                <TabsTrigger value="item" className="gap-2">
                  <Layers className="w-4 h-4" />
                  Itens
                  {itemAttributes && Object.keys(itemAttributes).length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {Object.keys(itemAttributes).length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="product" className="w-full space-y-4 mt-6 pb-6">
              {renderAttributesSection(
                'Atributos de Produtos',
                productAttributes,
                'text-blue-500'
              )}
            </TabsContent>

            <TabsContent value="variant" className="w-full space-y-4 mt-6 pb-6">
              {renderAttributesSection(
                'Atributos de Variantes',
                variantAttributes,
                'text-purple-500'
              )}
            </TabsContent>

            <TabsContent value="item" className="w-full space-y-4 mt-6 pb-6">
              {renderAttributesSection(
                'Atributos de Itens',
                itemAttributes,
                'text-green-500'
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
