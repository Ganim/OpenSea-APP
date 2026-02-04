'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  EntityFormConfig,
  EntityFormRef,
  EntityViewerConfig,
} from '@/types/entity-config';
import { Edit, Save, X } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { EntityForm } from '../forms/entity-form';

interface EntityViewerProps {
  config: EntityViewerConfig;
  mode?: 'view' | 'edit';
  onModeChange?: (mode: 'view' | 'edit') => void;
  formConfig?: EntityFormConfig;
  onSave?: (data: Record<string, unknown>) => Promise<void>;
}

/**
 * Componente para visualizar entidade em modo leitura
 * Suporta modo de edição inline com integração ao EntityForm
 */
export const EntityViewer: React.FC<EntityViewerProps> = ({
  config,
  mode: controlledMode,
  onModeChange,
  formConfig,
  onSave,
}) => {
  const {
    entity,
    data,
    tabs,
    sections,
    layout = 'card',
    onEdit,
    editLabel = 'Editar',
    allowEdit = false,
  } = config;

  const [internalMode, setInternalMode] = useState<'view' | 'edit'>('view');
  const formRef = useRef<EntityFormRef>(null);

  // Usa modo controlado se fornecido, senão usa interno
  const mode = controlledMode !== undefined ? controlledMode : internalMode;

  const handleModeChange = (newMode: 'view' | 'edit') => {
    if (onModeChange) {
      onModeChange(newMode);
    } else {
      setInternalMode(newMode);
    }
  };

  // Entra em modo de edição
  const handleEdit = () => {
    if (onEdit) {
      onEdit();
    }
    handleModeChange('edit');
  };

  // Cancela edição
  const handleCancel = () => {
    handleModeChange('view');
  };

  // Salva alterações
  const handleSave = async () => {
    if (formRef.current && onSave) {
      await formRef.current.submit();
    }
  };

  // Renderiza valor do campo
  const renderFieldValue = (field: Record<string, unknown>) => {
    const { value, type, render, className } = field;

    // Renderização customizada
    if (render && typeof render === 'function') {
      return render(value);
    }

    // Renderização por tipo
    switch (type) {
      case 'date':
        return new Date(value as string | number | Date).toLocaleDateString(
          'pt-BR'
        );

      case 'badge':
        return <Badge variant="outline">{value as React.ReactNode}</Badge>;

      case 'list':
        if (Array.isArray(value)) {
          return (
            <ul className="list-disc list-inside space-y-1">
              {(value as Array<React.ReactNode>).map((item, i) => (
                <li key={i} className="text-sm">
                  {item}
                </li>
              ))}
            </ul>
          );
        }
        return value as React.ReactNode;

      case 'text':
      default:
        return (
          <span className={className as string | undefined}>
            {(value as React.ReactNode) || '-'}
          </span>
        );
    }
  };

  // Renderiza seção
  const renderSection = (section: Record<string, unknown>) => {
    const title = section.title;
    const showTitle = Boolean(title);

    return (
      <div key={section.title as string} className="space-y-3">
        {showTitle && (
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {String(title)}
          </h3>
        )}
        <div
          className={layout === 'grid' ? 'grid grid-cols-2 gap-4' : 'space-y-3'}
        >
          {(section.fields as Array<Record<string, unknown>>).map(
            (field, index: number) => (
              <div key={index} className="space-y-1">
                <p className="text-sm font-medium">
                  {field.label as React.ReactNode}
                </p>
                <div className="text-sm text-muted-foreground">
                  {renderFieldValue(field)}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    );
  };

  // Modo de edição
  if (mode === 'edit' && formConfig) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b">
          <h2 className="text-lg font-semibold">Editando {entity}</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4 mr-1" />
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-1" />
              Salvar
            </Button>
          </div>
        </div>

        <EntityForm ref={formRef} config={formConfig} />
      </div>
    );
  }

  // Modo de visualização sem tabs
  if (!tabs || tabs.length === 0) {
    return (
      <div className="space-y-6">
        {allowEdit && (
          <div className="flex items-center justify-between pb-2 border-b">
            <h2 className="text-lg font-semibold">{entity}</h2>
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-1" />
              {editLabel}
            </Button>
          </div>
        )}

        {sections?.map(section =>
          renderSection(section as unknown as Record<string, unknown>)
        )}
      </div>
    );
  }

  // Modo de visualização com tabs
  return (
    <div className="space-y-4">
      {allowEdit && (
        <div className="flex items-center justify-between pb-2 border-b">
          <h2 className="text-lg font-semibold">{entity}</h2>
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-1" />
            {editLabel}
          </Button>
        </div>
      )}

      <Tabs defaultValue={tabs[0].id} className="w-full">
        <TabsList
          className="grid w-full"
          style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}
        >
          {tabs.map(tab => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center gap-2"
            >
              {tab.icon && <tab.icon className="h-4 w-4" />}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map(tab => (
          <TabsContent key={tab.id} value={tab.id} className="space-y-6">
            {tab.sections.map(section =>
              renderSection(section as unknown as Record<string, unknown>)
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
