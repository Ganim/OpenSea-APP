'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  GripVertical,
  ChevronDown,
  Type,
  Hash,
  Calendar,
  Mail,
  List,
  Link,
  ToggleLeft,
  Asterisk,
} from 'lucide-react';
import type { ImportFieldConfig, FieldOption } from '../types';
import { cn } from '@/lib/utils';

// ============================================
// SORTABLE FIELD ITEM
// ============================================

interface SortableFieldItemProps {
  field: ImportFieldConfig;
  referenceOptions?: FieldOption[];
  onToggle: () => void;
  onUpdate: (updates: Partial<ImportFieldConfig>) => void;
}

function SortableFieldItem({
  field,
  referenceOptions,
  onToggle,
  onUpdate,
}: SortableFieldItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.key });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getTypeIcon = () => {
    switch (field.type) {
      case 'text':
        return <Type className="w-4 h-4" />;
      case 'number':
        return <Hash className="w-4 h-4" />;
      case 'date':
        return <Calendar className="w-4 h-4" />;
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'select':
        return <List className="w-4 h-4" />;
      case 'reference':
        return <Link className="w-4 h-4" />;
      case 'boolean':
        return <ToggleLeft className="w-4 h-4" />;
      default:
        return <Type className="w-4 h-4" />;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'border rounded-lg bg-background',
        isDragging && 'opacity-50 shadow-lg',
        !field.enabled && 'opacity-60 bg-muted/50'
      )}
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center gap-3 p-3">
          {/* Drag handle */}
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </button>

          {/* Checkbox */}
          <Checkbox
            checked={field.enabled}
            onCheckedChange={onToggle}
            disabled={field.required}
          />

          {/* Type icon */}
          <div className="text-muted-foreground">{getTypeIcon()}</div>

          {/* Field info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium truncate">
                {field.customLabel || field.label}
              </span>
              {field.required && <Asterisk className="w-3 h-3 text-red-500" />}
            </div>
            <span className="text-xs text-muted-foreground">{field.key}</span>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-1">
            {field.required && (
              <Badge variant="destructive" className="text-xs">
                Obrigatório
              </Badge>
            )}
            {field.type === 'reference' && (
              <Badge variant="secondary" className="text-xs">
                Referência
              </Badge>
            )}
            {field.defaultValue !== undefined && (
              <Badge variant="outline" className="text-xs">
                Padrão
              </Badge>
            )}
          </div>

          {/* Expand button */}
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              <ChevronDown
                className={cn(
                  'w-4 h-4 transition-transform',
                  isOpen && 'rotate-180'
                )}
              />
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent>
          <div className="px-3 pb-3 pt-0 border-t">
            <div className="grid grid-cols-2 gap-4 mt-3">
              {/* Custom Label */}
              <div className="space-y-1">
                <Label className="text-xs">Título Personalizado</Label>
                <Input
                  value={field.customLabel || ''}
                  onChange={e =>
                    onUpdate({ customLabel: e.target.value || undefined })
                  }
                  placeholder={field.label}
                  className="h-8 text-sm"
                />
              </div>

              {/* Default Value */}
              {field.type === 'select' ? (
                <div className="space-y-1">
                  <Label className="text-xs">Valor Padrão</Label>
                  <Select
                    value={field.defaultValue?.toString() || '__none__'}
                    onValueChange={value =>
                      onUpdate({
                        defaultValue: value === '__none__' ? undefined : value,
                      })
                    }
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Nenhum</SelectItem>
                      {field.options?.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : field.type === 'reference' && referenceOptions ? (
                <div className="space-y-1">
                  <Label className="text-xs">Valor Padrão</Label>
                  <Select
                    value={field.defaultValue?.toString() || '__none__'}
                    onValueChange={value =>
                      onUpdate({
                        defaultValue: value === '__none__' ? undefined : value,
                      })
                    }
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Nenhum</SelectItem>
                      {referenceOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : field.type === 'boolean' ? (
                <div className="space-y-1">
                  <Label className="text-xs">Valor Padrão</Label>
                  <Select
                    value={
                      field.defaultValue === true
                        ? 'true'
                        : field.defaultValue === false
                          ? 'false'
                          : '__none__'
                    }
                    onValueChange={value =>
                      onUpdate({
                        defaultValue:
                          value === '__none__' ? undefined : value === 'true',
                      })
                    }
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Nenhum</SelectItem>
                      <SelectItem value="true">Sim</SelectItem>
                      <SelectItem value="false">Não</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-1">
                  <Label className="text-xs">Valor Padrão</Label>
                  <Input
                    type={field.type === 'number' ? 'number' : 'text'}
                    value={field.defaultValue?.toString() || ''}
                    onChange={e =>
                      onUpdate({
                        defaultValue:
                          field.type === 'number'
                            ? parseFloat(e.target.value) || undefined
                            : e.target.value || undefined,
                      })
                    }
                    placeholder="Valor padrão..."
                    className="h-8 text-sm"
                  />
                </div>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

interface FieldConfigListProps {
  fields: ImportFieldConfig[];
  referenceData?: Record<string, FieldOption[]>;
  onToggleField: (fieldKey: string) => void;
  onUpdateField: (
    fieldKey: string,
    updates: Partial<ImportFieldConfig>
  ) => void;
  onReorderFields: (fromIndex: number, toIndex: number) => void;
}

export function FieldConfigList({
  fields,
  referenceData = {},
  onToggleField,
  onUpdateField,
  onReorderFields,
}: FieldConfigListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex(f => f.key === active.id);
      const newIndex = fields.findIndex(f => f.key === over.id);
      onReorderFields(oldIndex, newIndex);
    }
  };

  const enabledCount = fields.filter(f => f.enabled).length;
  const requiredCount = fields.filter(f => f.required).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Configuração de Campos</CardTitle>
            <CardDescription>
              Selecione, ordene e personalize os campos para importação
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{enabledCount} campos selecionados</Badge>
            <Badge variant="secondary">{requiredCount} obrigatórios</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={fields.map(f => f.key)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {fields
                .sort((a, b) => a.order - b.order)
                .map(field => (
                  <SortableFieldItem
                    key={field.key}
                    field={field}
                    referenceOptions={
                      field.referenceEntity
                        ? referenceData[field.referenceEntity]
                        : undefined
                    }
                    onToggle={() => onToggleField(field.key)}
                    onUpdate={updates => onUpdateField(field.key, updates)}
                  />
                ))}
            </div>
          </SortableContext>
        </DndContext>
      </CardContent>
    </Card>
  );
}
