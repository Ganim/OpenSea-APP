'use client';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  EntityFormConfig,
  EntityFormRef,
  FormSection,
  FormTab,
} from '@/types/entity-config';
import { Loader2 } from 'lucide-react';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { AttributeManager } from './attribute-manager';
import { DynamicFormField } from './dynamic-form-field';

interface EntityFormProps {
  config: EntityFormConfig;
}

/**
 * Formulário genérico e reutilizável para qualquer entidade
 * Suporta tabs, seções, campos dinâmicos, atributos e validação
 * Expõe métodos via ref para controle externo
 */
export const EntityForm = forwardRef<EntityFormRef, EntityFormProps>(
  ({ config }, ref) => {
    const {
      entity,
      tabs,
      sections,
      onSubmit,
      defaultValues: defaultValuesProp,
      submitLabel = 'Salvar',
      cancelLabel = 'Cancelar',
      onCancel,
      loading = false,
    } = config;

    // Usa referência estável para evitar recriar objeto vazio em cada render
    const emptyRef = useRef<Record<string, any>>({});
    const effectiveDefaultValues =
      defaultValuesProp !== undefined ? defaultValuesProp : emptyRef.current;

    // Estado do formulário
    const [formData, setFormData] = useState<Record<string, any>>(
      effectiveDefaultValues
    );
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Atualiza formData quando defaultValues mudar (evita loop com objeto vazio instável)
    useEffect(() => {
      setFormData(effectiveDefaultValues);
    }, [defaultValuesProp]);

    // Atualiza campo do formulário
    const handleFieldChange = (name: string, value: any) => {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));

      // Limpa erro do campo ao editar
      if (errors[name]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    };

    // Valida formulário
    const validateForm = (): boolean => {
      const newErrors: Record<string, string> = {};

      // Valida campos de seções (sem tabs)
      if (sections) {
        sections.forEach(section => {
          section.fields.forEach(field => {
            if (field.required && !formData[field.name]) {
              newErrors[field.name] = `${field.label} é obrigatório`;
            }

            // Validação customizada
            if (field.validation?.custom && formData[field.name]) {
              const result = field.validation.custom(formData[field.name]);
              if (result !== true) {
                newErrors[field.name] =
                  typeof result === 'string' ? result : 'Valor inválido';
              }
            }
          });
        });
      }

      // Valida campos de tabs
      if (tabs) {
        tabs.forEach(tab => {
          tab.sections.forEach(section => {
            section.fields.forEach(field => {
              if (field.required && !formData[field.name]) {
                newErrors[field.name] = `${field.label} é obrigatório`;
              }

              // Validação customizada
              if (field.validation?.custom && formData[field.name]) {
                const result = field.validation.custom(formData[field.name]);
                if (result !== true) {
                  newErrors[field.name] =
                    typeof result === 'string' ? result : 'Valor inválido';
                }
              }
            });
          });
        });
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    // Submete formulário
    const handleSubmit = async () => {
      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);
      try {
        await onSubmit(formData);
      } catch (error) {
        console.error('Erro ao submeter formulário:', error);
      } finally {
        setIsSubmitting(false);
      }
    };

    // Reseta formulário
    const handleReset = () => {
      setFormData(effectiveDefaultValues);
      setErrors({});
    };

    // Expõe métodos via ref
    useImperativeHandle(ref, () => ({
      submit: handleSubmit,
      getData: () => formData,
      reset: handleReset,
      setFieldValue: handleFieldChange,
    }));

    // Renderiza seção
    const renderSection = (section: FormSection) => (
      <div key={section.title} className="space-y-4">
        {section.title && (
          <div>
            <h3 className="text-lg font-semibold">{section.title}</h3>
            {section.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {section.description}
              </p>
            )}
          </div>
        )}
        <div className="space-y-4">
          {section.fields.map(field => (
            <DynamicFormField
              key={field.name}
              config={field}
              value={formData[field.name]}
              onChange={value => handleFieldChange(field.name, value)}
              error={errors[field.name]}
            />
          ))}
        </div>
      </div>
    );

    // Renderiza tab com atributos
    const renderAttributeTab = (tab: FormTab) => (
      <TabsContent value={tab.id} className="space-y-6">
        {tab.sections.map((section: FormSection, idx: number) => (
          <div key={`${tab.id}-section-${idx}`}>{renderSection(section)}</div>
        ))}
        {tab.attributes && (
          <AttributeManager
            value={formData[`${tab.id}Attributes`] || []}
            onChange={attrs => handleFieldChange(`${tab.id}Attributes`, attrs)}
            config={tab.attributes}
            error={errors[`${tab.id}Attributes`]}
          />
        )}
      </TabsContent>
    );

    // Renderiza formulário sem tabs
    if (!tabs || tabs.length === 0) {
      return (
        <div className="space-y-6">
          {sections?.map((section, idx) => (
            <div key={`section-${idx}`}>{renderSection(section)}</div>
          ))}

          <div className="flex items-center gap-2 pt-4">
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading || isSubmitting}
              className="min-w-[100px]"
            >
              {(loading || isSubmitting) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {submitLabel}
            </Button>

            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading || isSubmitting}
              >
                {cancelLabel}
              </Button>
            )}
          </div>
        </div>
      );
    }

    // Renderiza formulário com tabs
    return (
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
          <div key={tab.id}>{renderAttributeTab(tab)}</div>
        ))}

        <div className="flex items-center gap-2 pt-6">
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading || isSubmitting}
            className="min-w-[100px]"
          >
            {(loading || isSubmitting) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {submitLabel}
          </Button>

          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading || isSubmitting}
            >
              {cancelLabel}
            </Button>
          )}
        </div>
      </Tabs>
    );
  }
);

EntityForm.displayName = 'EntityForm';
