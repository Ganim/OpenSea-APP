'use client';

import { Header } from '@/components/layout/header';
import { PageLayout } from '@/components/layout/page-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Box,
  Check,
  Layers,
  LayoutTemplate,
  ListTree,
  RotateCcw,
  Save,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { FieldConfigList } from '../../../_shared/components/field-config-list';
import { getEntityFields } from '../../../_shared/config/entity-definitions';
import {
  useTemplatesWithAttributes,
  useVariantsWithDetails,
  type TemplateWithAttributes,
  type VariantWithDetails,
} from '../../../_shared/hooks/use-reference-data';
import type {
  ImportConfig,
  ImportFieldConfig,
  StoredImportConfig,
} from '../../../_shared/types';

// Storage keys
const STORAGE_KEY = 'opensea-import-configs';
const ACTIVE_CONFIG_KEY = 'opensea-import-active-config';
const ALL_VARIANTS_VALUE = '__ALL__';

// Helper functions for localStorage
function getStoredConfigs(): StoredImportConfig[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveStoredConfigs(configs: StoredImportConfig[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
}

function getActiveConfigId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(ACTIVE_CONFIG_KEY);
    if (!stored) return null;
    const activeConfigs: Record<string, string> = JSON.parse(stored);
    return activeConfigs['items'] || null;
  } catch {
    return null;
  }
}

function saveActiveConfigId(configId: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    const stored = localStorage.getItem(ACTIVE_CONFIG_KEY);
    const activeConfigs: Record<string, string | null> = stored
      ? JSON.parse(stored)
      : {};
    if (configId) {
      activeConfigs['items'] = configId;
    } else {
      delete activeConfigs['items'];
    }
    localStorage.setItem(ACTIVE_CONFIG_KEY, JSON.stringify(activeConfigs));
  } catch {
    // Ignore
  }
}

function generateId(): string {
  return `config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Extended stored config for items (includes variantId)
interface ItemStoredConfig extends StoredImportConfig {
  variantId?: string;
  variantName?: string;
  productName?: string;
}

// Map template attribute type to import field type
function mapTemplateTypeToFieldType(
  templateType: string
): ImportFieldConfig['type'] {
  switch (templateType) {
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'date':
      return 'date';
    case 'select':
      return 'select';
    case 'string':
    default:
      return 'text';
  }
}

// Create config for item import
function createConfigForItems(
  variant: VariantWithDetails | null,
  itemAttributes?: Record<
    string,
    { type?: string; label?: string; options?: string[]; required?: boolean }
  >,
  includeVariantField = false,
  templateInfo?: { id: string; name: string }
): ImportConfig {
  const baseFields = getEntityFields('items');

  // Filter out variantId if not needed (when specific variant is selected)
  const filteredBaseFields = includeVariantField
    ? baseFields
    : baseFields.filter(f => f.key !== 'variantId');

  // Create base field configs
  const fields: ImportFieldConfig[] = filteredBaseFields.map(
    (field, index) => ({
      key: field.key,
      label: field.label,
      customLabel: undefined,
      enabled: field.required || field.key === 'variantId',
      order: index,
      type: field.type,
      required: field.required,
      defaultValue: field.defaultValue,
      options: field.options,
      referenceEntity: field.referenceEntity as
        | 'variants'
        | 'locations'
        | undefined,
      referenceDisplayField: field.referenceDisplayField,
      minLength: field.validation?.minLength,
      maxLength: field.validation?.maxLength,
      min: field.validation?.min,
      max: field.validation?.max,
      pattern: field.validation?.pattern,
      patternMessage: field.validation?.patternMessage,
    })
  );

  // Add template item attributes as fields
  if (itemAttributes) {
    let order = fields.length;
    Object.entries(itemAttributes).forEach(([key, attrConfig]) => {
      fields.push({
        key: `attributes.${key}`,
        label: attrConfig.label || key,
        customLabel: attrConfig.label,
        enabled: attrConfig.required || false,
        order: order++,
        type: mapTemplateTypeToFieldType(attrConfig.type || 'string'),
        required: attrConfig.required || false,
        options: attrConfig.options?.map(opt => ({ value: opt, label: opt })),
      });
    });
  }

  return {
    entityType: 'items',
    templateId: templateInfo?.id || variant?.templateId,
    templateName: templateInfo?.name || variant?.templateName,
    fields,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export default function ItemsConfigPage() {
  const router = useRouter();

  // State
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null
  );
  const [config, setConfig] = useState<ImportConfig | null>(null);
  const [savedConfigs, setSavedConfigs] = useState<ItemStoredConfig[]>([]);
  const [activeConfigId, setActiveConfigId] = useState<string | null>(null);
  const [configName, setConfigName] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [variantSearchOpen, setVariantSearchOpen] = useState(false);

  // Fetch variants with full details
  const { data: variants, isLoading: isLoadingVariants } =
    useVariantsWithDetails();

  // Fetch all templates with attributes
  const { data: templates, isLoading: isLoadingTemplates } =
    useTemplatesWithAttributes();

  // Check if "Todos" is selected
  const isAllVariants = selectedVariantId === ALL_VARIANTS_VALUE;

  // Get selected variant
  const selectedVariant = useMemo(() => {
    if (!selectedVariantId || isAllVariants || !variants) return null;
    return variants.find(v => v.id === selectedVariantId) || null;
  }, [selectedVariantId, variants, isAllVariants]);

  // Get selected template (for "Todos" mode or from variant)
  const selectedTemplate = useMemo(() => {
    if (isAllVariants && selectedTemplateId && templates) {
      return templates.find(t => t.id === selectedTemplateId) || null;
    }
    if (selectedVariant?.templateId && templates) {
      return templates.find(t => t.id === selectedVariant.templateId) || null;
    }
    return null;
  }, [selectedTemplateId, selectedVariant, templates, isAllVariants]);

  // Build reference data for dropdowns
  const referenceData = useMemo(
    () => ({
      templates: [],
      suppliers: [],
      manufacturers: [],
      categories: [],
      products: [],
      variants:
        variants?.map(v => ({
          value: v.id,
          label: `${v.productName} - ${v.name}`,
        })) || [],
      locations: [],
    }),
    [variants]
  );

  // Load saved configs and active config on mount
  useEffect(() => {
    const stored = getStoredConfigs() as ItemStoredConfig[];
    const itemConfigs = stored.filter(c => c.entityType === 'items');
    setSavedConfigs(itemConfigs);

    const activeId = getActiveConfigId();
    setActiveConfigId(activeId);

    setIsInitialized(true);
  }, []);

  // When variant or template changes, update config
  useEffect(() => {
    if (isAllVariants) {
      if (selectedTemplate) {
        setConfig(
          createConfigForItems(null, selectedTemplate.itemAttributes, true, {
            id: selectedTemplate.id,
            name: selectedTemplate.name,
          })
        );
      } else {
        setConfig(createConfigForItems(null, undefined, true));
      }
    } else if (selectedVariant && selectedTemplate) {
      setConfig(
        createConfigForItems(selectedVariant, selectedTemplate.itemAttributes)
      );
    } else if (selectedVariant) {
      setConfig(createConfigForItems(selectedVariant));
    }
  }, [selectedVariant, selectedTemplate, isAllVariants]);

  // Count of custom attributes from template
  const customAttributeCount = useMemo(() => {
    if (!selectedTemplate?.itemAttributes) return 0;
    return Object.keys(selectedTemplate.itemAttributes).length;
  }, [selectedTemplate]);

  // Handle variant selection
  const handleVariantSelect = (variantId: string) => {
    setSelectedVariantId(variantId);
    setSelectedTemplateId(null);
    setActiveConfigId(null);
    saveActiveConfigId(null);
    setVariantSearchOpen(false);
  };

  // Handle template selection (for "Todos" mode)
  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId === '__NONE__' ? null : templateId);
    setActiveConfigId(null);
    saveActiveConfigId(null);
  };

  // Field operations
  const toggleField = (fieldKey: string) => {
    if (!config) return;
    const field = config.fields.find(f => f.key === fieldKey);
    if (field?.required) return;

    const updatedFields = config.fields.map(f =>
      f.key === fieldKey ? { ...f, enabled: !f.enabled } : f
    );
    setConfig({ ...config, fields: updatedFields, updatedAt: new Date() });
  };

  const updateField = (
    fieldKey: string,
    updates: Partial<ImportFieldConfig>
  ) => {
    if (!config) return;
    const updatedFields = config.fields.map(f =>
      f.key === fieldKey ? { ...f, ...updates } : f
    );
    setConfig({ ...config, fields: updatedFields, updatedAt: new Date() });
  };

  const reorderFields = (fromIndex: number, toIndex: number) => {
    if (!config) return;
    const fields = [...config.fields];
    const [removed] = fields.splice(fromIndex, 1);
    fields.splice(toIndex, 0, removed);
    const updatedFields = fields.map((f, i) => ({ ...f, order: i }));
    setConfig({ ...config, fields: updatedFields, updatedAt: new Date() });
  };

  // Save config
  const handleSaveConfig = () => {
    if (!config || !selectedVariantId) return;

    const stored = getStoredConfigs() as ItemStoredConfig[];
    const id = generateId();
    const templateName = selectedTemplate?.name;
    const name =
      configName.trim() ||
      (isAllVariants
        ? `Todos${templateName ? ` (${templateName})` : ''} - ${new Date().toLocaleDateString('pt-BR')}`
        : `${selectedVariant?.productName} - ${selectedVariant?.name} - ${new Date().toLocaleDateString('pt-BR')}`);

    const storedConfig: ItemStoredConfig = {
      id,
      name,
      entityType: 'items',
      variantId: isAllVariants ? ALL_VARIANTS_VALUE : selectedVariantId,
      variantName: isAllVariants ? 'Todas as Variantes' : selectedVariant?.name,
      productName: selectedVariant?.productName,
      templateId: selectedTemplate?.id,
      templateName: templateName,
      fields: config.fields,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [...stored, storedConfig];
    saveStoredConfigs(updated);
    setSavedConfigs(updated.filter(c => c.entityType === 'items'));

    setActiveConfigId(id);
    saveActiveConfigId(id);
    setConfig({ ...config, name, updatedAt: new Date() });

    toast.success('Configuracao salva!');
    setConfigName('');
  };

  // Load config
  const handleLoadConfig = (id: string) => {
    const stored = getStoredConfigs() as ItemStoredConfig[];
    const found = stored.find(c => c.id === id);

    if (found && found.variantId) {
      setSelectedVariantId(found.variantId);
      setSelectedTemplateId(found.templateId || null);
      setConfig({
        entityType: found.entityType,
        templateId: found.templateId,
        templateName: found.templateName,
        fields: found.fields,
        name: found.name,
        createdAt: new Date(found.createdAt),
        updatedAt: new Date(found.updatedAt),
      });
      setActiveConfigId(id);
      saveActiveConfigId(id);
      toast.success('Configuracao carregada!');
    }
  };

  // Delete config
  const handleDeleteConfig = (id: string) => {
    const stored = getStoredConfigs();
    const updated = stored.filter(c => c.id !== id);
    saveStoredConfigs(updated);
    setSavedConfigs(
      (updated as ItemStoredConfig[]).filter(c => c.entityType === 'items')
    );

    if (activeConfigId === id) {
      setActiveConfigId(null);
      saveActiveConfigId(null);
    }

    toast.success('Configuracao excluida!');
  };

  // Reset config
  const handleResetConfig = () => {
    if (isAllVariants) {
      if (selectedTemplate) {
        setConfig(
          createConfigForItems(null, selectedTemplate.itemAttributes, true, {
            id: selectedTemplate.id,
            name: selectedTemplate.name,
          })
        );
      } else {
        setConfig(createConfigForItems(null, undefined, true));
      }
    } else if (selectedVariant) {
      setConfig(
        createConfigForItems(selectedVariant, selectedTemplate?.itemAttributes)
      );
    }
    setActiveConfigId(null);
    saveActiveConfigId(null);
  };

  // Continue to sheets
  const handleContinue = () => {
    if (!config || !selectedVariantId) {
      toast.error('Selecione uma variante primeiro');
      return;
    }

    sessionStorage.setItem(
      'import-items-config',
      JSON.stringify({
        ...config,
        variantId: isAllVariants ? null : selectedVariantId,
        variantName: isAllVariants
          ? 'Todas as Variantes'
          : selectedVariant?.name,
        productName: selectedVariant?.productName,
        templateId: selectedTemplate?.id,
        templateName: selectedTemplate?.name,
        isAllVariants,
      })
    );

    router.push('/import/stock/items/sheets');
  };

  // Generate search text for variant
  const getVariantSearchText = (v: VariantWithDetails) => {
    const parts = [
      v.name,
      v.productName,
      v.reference,
      v.sku,
      v.templateName,
      v.manufacturerName,
      v.productCode,
    ].filter(Boolean);
    return parts.join(' ');
  };

  // Loading state
  if (isLoadingVariants || isLoadingTemplates || !isInitialized) {
    return (
      <PageLayout backgroundVariant="none" maxWidth="full">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout backgroundVariant="none" maxWidth="full">
      <Header
        title="Configurar Importacao de Items"
        description="Selecione a variante e configure os campos"
        buttons={[
          {
            id: 'back',
            title: 'Voltar',
            icon: ArrowLeft,
            variant: 'outline',
            onClick: () => router.push('/import/stock/items'),
          },
          {
            id: 'continue',
            title: 'Continuar',
            icon: ArrowRight,
            onClick: handleContinue,
            disabled: !selectedVariantId || !config,
          },
        ]}
      />

      {/* Step 1: Variant Selection */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
              1
            </div>
            <div>
              <CardTitle className="text-base">Selecionar Variante</CardTitle>
              <CardDescription>
                Escolha uma variante especifica ou importe para varias variantes
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            <div className="flex-1">
              {/* Custom variant search button */}
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
                onClick={() => setVariantSearchOpen(true)}
              >
                <Search className="w-4 h-4 mr-2 text-muted-foreground" />
                {selectedVariantId ? (
                  isAllVariants ? (
                    <span className="flex items-center gap-2">
                      <ListTree className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">Todas as Variantes</span>
                    </span>
                  ) : (
                    <span className="flex flex-col items-start">
                      <span className="text-xs text-muted-foreground">
                        {selectedVariant?.templateName}{' '}
                        {selectedVariant?.productName}{' '}
                        {selectedVariant?.manufacturerName &&
                          `- ${selectedVariant.manufacturerName}`}
                      </span>
                      <span className="font-medium">
                        {selectedVariant?.name}
                        {selectedVariant?.reference &&
                          ` - (${selectedVariant.reference})`}
                      </span>
                    </span>
                  )
                ) : (
                  <span className="text-muted-foreground">
                    Buscar variante...
                  </span>
                )}
              </Button>
            </div>

            {selectedVariantId && (
              <div
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg border',
                  isAllVariants
                    ? 'bg-blue-500/10 border-blue-500/30'
                    : 'bg-green-500/10 border-green-500/30'
                )}
              >
                {isAllVariants ? (
                  <>
                    <ListTree className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">
                      <span className="text-muted-foreground">Modo: </span>
                      <span className="font-medium text-blue-500">
                        Varias Variantes
                      </span>
                    </span>
                  </>
                ) : (
                  <>
                    <Box className="w-4 h-4 text-green-500" />
                    <span className="text-sm">
                      <span className="text-muted-foreground">
                        Items para:{' '}
                      </span>
                      <span className="font-medium text-green-500">
                        {selectedVariant?.name}
                      </span>
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Info messages */}
          {isAllVariants && (
            <div className="mt-4 flex items-center gap-2 text-sm text-blue-500">
              <AlertCircle className="w-4 h-4" />
              <span>
                O campo &quot;Variante&quot; sera incluido na planilha para voce
                especificar a variante de cada item
              </span>
            </div>
          )}

          {/* Template selector for "Todos" mode */}
          {isAllVariants && (
            <div className="mt-4 space-y-2">
              <Label className="text-sm font-medium">
                Template para atributos personalizados (opcional)
              </Label>
              <Select
                value={selectedTemplateId || '__NONE__'}
                onValueChange={handleTemplateChange}
              >
                <SelectTrigger className="w-full max-w-md">
                  <SelectValue placeholder="Selecione um template..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__NONE__">
                    <span className="text-muted-foreground">Sem template</span>
                  </SelectItem>
                  <div className="h-px bg-border my-1" />
                  {templates?.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center gap-2">
                        <LayoutTemplate className="w-4 h-4" />
                        <span>{template.name}</span>
                        {template.itemAttributes &&
                          Object.keys(template.itemAttributes).length > 0 && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              {Object.keys(template.itemAttributes).length}{' '}
                              atributos
                            </Badge>
                          )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Template info */}
          {selectedTemplate && (
            <div className="mt-4 flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span className="text-muted-foreground">Template:</span>
              <span className="font-medium">{selectedTemplate.name}</span>
              {customAttributeCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {customAttributeCount} atributos personalizados
                </Badge>
              )}
            </div>
          )}

          {!selectedVariantId && (
            <div className="mt-4 flex items-center gap-2 text-sm text-amber-500">
              <AlertCircle className="w-4 h-4" />
              <span>
                Selecione uma variante ou &quot;Todos&quot; para continuar
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Field Configuration */}
      {selectedVariantId && config && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    2
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      Configurar Campos
                    </CardTitle>
                    <CardDescription>
                      Habilite e configure os campos que serao importados
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <FieldConfigList
                  fields={config.fields}
                  referenceData={referenceData}
                  onToggleField={toggleField}
                  onUpdateField={updateField}
                  onReorderFields={reorderFields}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Save config */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Salvar Configuracao</CardTitle>
                <CardDescription>
                  Salve para reutilizar posteriormente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-sm">Nome da configuracao</Label>
                  <Input
                    value={configName}
                    onChange={e => setConfigName(e.target.value)}
                    placeholder={
                      isAllVariants
                        ? 'Todos - Items'
                        : `${selectedVariant?.productName} - ${selectedVariant?.name} - Items`
                    }
                  />
                </div>
                <Button className="w-full" onClick={handleSaveConfig}>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
              </CardContent>
            </Card>

            {/* Saved configs */}
            {savedConfigs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Configuracoes Salvas
                  </CardTitle>
                  <CardDescription>
                    Configuracoes salvas para items
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {savedConfigs.map(saved => {
                    const isActive = saved.id === activeConfigId;
                    return (
                      <div
                        key={saved.id}
                        className={cn(
                          'flex items-center justify-between p-2 rounded-lg border',
                          isActive
                            ? 'border-primary bg-primary/10'
                            : 'bg-muted/50'
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {isActive && (
                            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground shrink-0">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm truncate">
                                {saved.name}
                              </p>
                              {isActive && (
                                <Badge
                                  variant="default"
                                  className="text-xs py-0 px-1.5 shrink-0"
                                >
                                  Em uso
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {saved.productName && `${saved.productName} - `}
                              {saved.variantName} -{' '}
                              {new Date(saved.updatedAt).toLocaleDateString(
                                'pt-BR'
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          {!isActive && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLoadConfig(saved.id)}
                            >
                              Usar
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteConfig(saved.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Reset */}
            <Card>
              <CardContent className="pt-6">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleResetConfig}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Resetar para Padrao
                </Button>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Resumo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Modo</span>
                    <span className="font-medium">
                      {isAllVariants
                        ? 'Varias Variantes'
                        : 'Variante Especifica'}
                    </span>
                  </div>
                  {!isAllVariants && selectedVariant && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Produto</span>
                        <span className="font-medium truncate max-w-[150px]">
                          {selectedVariant.productName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Variante</span>
                        <span className="font-medium truncate max-w-[150px]">
                          {selectedVariant.name}
                        </span>
                      </div>
                    </>
                  )}
                  {selectedTemplate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Template</span>
                      <span className="font-medium">
                        {selectedTemplate.name}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Campos habilitados
                    </span>
                    <span className="font-medium">
                      {config.fields.filter(f => f.enabled).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Campos obrigatorios
                    </span>
                    <span className="font-medium">
                      {config.fields.filter(f => f.required).length}
                    </span>
                  </div>
                  {customAttributeCount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Atributos personalizados
                      </span>
                      <span className="font-medium">
                        {customAttributeCount}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Variant Search Dialog */}
      <Dialog open={variantSearchOpen} onOpenChange={setVariantSearchOpen}>
        <DialogContent className="sm:max-w-[600px] p-0">
          <DialogHeader className="px-4 pt-4 pb-2">
            <DialogTitle className="text-base flex items-center gap-2">
              <Layers className="w-5 h-5" />
              Selecionar Variante
            </DialogTitle>
          </DialogHeader>
          <Command className="border-t">
            <CommandInput
              placeholder="Buscar por template, produto, fabricante, variante, referencia..."
              autoFocus
            />
            <CommandList className="max-h-[400px]">
              <CommandEmpty>Nenhuma variante encontrada.</CommandEmpty>
              <CommandGroup>
                {/* "Todos" option */}
                <CommandItem
                  value="__all__ todos todas variantes"
                  onSelect={() => handleVariantSelect(ALL_VARIANTS_VALUE)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Check
                      className={cn(
                        'h-4 w-4',
                        selectedVariantId === ALL_VARIANTS_VALUE
                          ? 'opacity-100'
                          : 'opacity-0'
                      )}
                    />
                    <ListTree className="w-4 h-4 text-blue-500" />
                    <div>
                      <span className="font-medium">Todas as Variantes</span>
                      <Badge variant="secondary" className="ml-2 text-xs">
                        Especificar na planilha
                      </Badge>
                    </div>
                  </div>
                </CommandItem>
                <div className="h-px bg-border my-1" />
                {/* Variant options */}
                {variants?.map(variant => (
                  <CommandItem
                    key={variant.id}
                    value={getVariantSearchText(variant)}
                    onSelect={() => handleVariantSelect(variant.id)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-start gap-2 w-full">
                      <Check
                        className={cn(
                          'h-4 w-4 mt-1',
                          selectedVariantId === variant.id
                            ? 'opacity-100'
                            : 'opacity-0'
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {variant.templateName && (
                            <span className="bg-muted px-1.5 py-0.5 rounded">
                              {variant.templateName}
                            </span>
                          )}
                          <span>{variant.productName}</span>
                          {variant.manufacturerName && (
                            <span className="text-muted-foreground/70">
                              {variant.manufacturerName}
                            </span>
                          )}
                        </div>
                        <div className="font-medium">
                          {variant.name}
                          {variant.reference && (
                            <span className="text-muted-foreground font-normal">
                              {' '}
                              - ({variant.reference})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
