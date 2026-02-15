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
  Check,
  Layers,
  LayoutTemplate,
  ListTree,
  Package,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { FieldConfigList } from '../../../_shared/components/field-config-list';
import { getEntityFields } from '../../../_shared/config/entity-definitions';
import {
  useProductsWithTemplates,
  useTemplateDetails,
  useTemplatesWithAttributes,
  type ProductWithTemplate,
  type TemplateWithAttributes,
} from '../../../_shared/hooks/use-reference-data';
import type {
  ImportConfig,
  ImportFieldConfig,
  StoredImportConfig,
} from '../../../_shared/types';

// Storage keys
const STORAGE_KEY = 'opensea-import-configs';
const ACTIVE_CONFIG_KEY = 'opensea-import-active-config';
const ALL_PRODUCTS_VALUE = '__ALL__';

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
    return activeConfigs['variants'] || null;
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
      activeConfigs['variants'] = configId;
    } else {
      delete activeConfigs['variants'];
    }
    localStorage.setItem(ACTIVE_CONFIG_KEY, JSON.stringify(activeConfigs));
  } catch {
    // Ignore
  }
}

function generateId(): string {
  return `config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Extended stored config for variants (includes productId)
interface VariantStoredConfig extends StoredImportConfig {
  productId?: string;
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

// Create config for variant import (based on product's template or generic)
function createConfigForVariants(
  product: ProductWithTemplate | null,
  variantAttributes?: Record<
    string,
    { type?: string; label?: string; options?: string[]; required?: boolean }
  >,
  includeProductField = false,
  templateInfo?: { id: string; name: string }
): ImportConfig {
  const baseFields = getEntityFields('variants');

  // Filter out productId if not needed (when specific product is selected)
  const filteredBaseFields = includeProductField
    ? baseFields
    : baseFields.filter(f => f.key !== 'productId');

  // Create base field configs
  const fields: ImportFieldConfig[] = filteredBaseFields.map(
    (field, index) => ({
      key: field.key,
      label: field.label,
      customLabel: undefined,
      enabled: field.required || field.key === 'productId',
      order: index,
      type: field.type,
      required: field.required,
      defaultValue: field.defaultValue,
      options: field.options,
      referenceEntity: field.referenceEntity as 'products' | undefined,
      referenceDisplayField: field.referenceDisplayField,
      minLength: field.validation?.minLength,
      maxLength: field.validation?.maxLength,
      min: field.validation?.min,
      max: field.validation?.max,
      pattern: field.validation?.pattern,
      patternMessage: field.validation?.patternMessage,
    })
  );

  // Add template variant attributes as fields
  if (variantAttributes) {
    let order = fields.length;
    Object.entries(variantAttributes).forEach(([key, attrConfig]) => {
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
    entityType: 'variants',
    templateId: templateInfo?.id || product?.templateId,
    templateName: templateInfo?.name || product?.template?.name,
    fields,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export default function VariantsConfigPage() {
  const router = useRouter();

  // State
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null
  );
  const [config, setConfig] = useState<ImportConfig | null>(null);
  const [savedConfigs, setSavedConfigs] = useState<VariantStoredConfig[]>([]);
  const [activeConfigId, setActiveConfigId] = useState<string | null>(null);
  const [configName, setConfigName] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch products with their templates
  const { data: products, isLoading: isLoadingProducts } =
    useProductsWithTemplates();

  // Fetch all templates with attributes (for "Todos" mode)
  const { data: templates, isLoading: isLoadingTemplates } =
    useTemplatesWithAttributes();

  // Check if "Todos" is selected
  const isAllProducts = selectedProductId === ALL_PRODUCTS_VALUE;

  // Get selected product
  const selectedProduct = useMemo(() => {
    if (!selectedProductId || isAllProducts || !products) return null;
    return products.find(p => p.id === selectedProductId) || null;
  }, [selectedProductId, products, isAllProducts]);

  // Get selected template (for "Todos" mode)
  const selectedTemplate = useMemo(() => {
    if (!selectedTemplateId || !templates) return null;
    return templates.find(t => t.id === selectedTemplateId) || null;
  }, [selectedTemplateId, templates]);

  // Fetch template details for selected product (when not in "Todos" mode)
  const { data: templateDetails, isLoading: isLoadingTemplate } =
    useTemplateDetails(selectedProduct?.templateId);

  // Build reference data for dropdowns
  const referenceData = useMemo(
    () => ({
      templates: [],
      suppliers: [],
      manufacturers: [],
      categories: [],
      products: (products || []).map(p => ({ value: p.id, label: p.name })),
      variants: [],
      locations: [],
    }),
    [products]
  );

  // Load saved configs and active config on mount
  useEffect(() => {
    const stored = getStoredConfigs() as VariantStoredConfig[];
    const variantConfigs = stored.filter(c => c.entityType === 'variants');
    setSavedConfigs(variantConfigs);

    const activeId = getActiveConfigId();
    setActiveConfigId(activeId);

    setIsInitialized(true);
  }, []);

  // When product or template changes, update config
  useEffect(() => {
    if (isAllProducts) {
      // Generic config with productId field included
      if (selectedTemplate) {
        // "Todos" mode with a specific template selected
        setConfig(
          createConfigForVariants(
            null,
            selectedTemplate.variantAttributes,
            true,
            { id: selectedTemplate.id, name: selectedTemplate.name }
          )
        );
      } else {
        // "Todos" mode without template
        setConfig(createConfigForVariants(null, undefined, true));
      }
    } else if (selectedProduct && templateDetails) {
      setConfig(
        createConfigForVariants(
          selectedProduct,
          templateDetails.variantAttributes
        )
      );
    } else if (selectedProduct && !selectedProduct.templateId) {
      // Product has no template
      setConfig(createConfigForVariants(selectedProduct));
    }
  }, [selectedProduct, templateDetails, isAllProducts, selectedTemplate]);

  // Count of custom attributes from template
  const customAttributeCount = useMemo(() => {
    if (isAllProducts && selectedTemplate?.variantAttributes) {
      return Object.keys(selectedTemplate.variantAttributes).length;
    }
    if (!templateDetails?.variantAttributes) return 0;
    return Object.keys(templateDetails.variantAttributes).length;
  }, [templateDetails, isAllProducts, selectedTemplate]);

  // Handle product selection
  const handleProductChange = (productId: string) => {
    setSelectedProductId(productId);
    // Clear template selection when changing product
    setSelectedTemplateId(null);
    // Clear active config since we're starting fresh
    setActiveConfigId(null);
    saveActiveConfigId(null);
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
    if (!config || !selectedProductId) return;

    const stored = getStoredConfigs() as VariantStoredConfig[];
    const id = generateId();
    const templateName = isAllProducts
      ? selectedTemplate?.name
      : templateDetails?.name;
    const name =
      configName.trim() ||
      (isAllProducts
        ? `Todos os Produtos${templateName ? ` (${templateName})` : ''} - ${new Date().toLocaleDateString('pt-BR')}`
        : `${selectedProduct?.name} - ${new Date().toLocaleDateString('pt-BR')}`);

    const storedConfig: VariantStoredConfig = {
      id,
      name,
      entityType: 'variants',
      productId: isAllProducts ? ALL_PRODUCTS_VALUE : selectedProductId,
      productName: isAllProducts ? 'Todos os Produtos' : selectedProduct?.name,
      templateId: isAllProducts
        ? selectedTemplate?.id
        : selectedProduct?.templateId,
      templateName: templateName,
      fields: config.fields,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [...stored, storedConfig];
    saveStoredConfigs(updated);
    setSavedConfigs(updated.filter(c => c.entityType === 'variants'));

    setActiveConfigId(id);
    saveActiveConfigId(id);
    setConfig({ ...config, name, updatedAt: new Date() });

    toast.success('Configuracao salva!');
    setConfigName('');
  };

  // Load config
  const handleLoadConfig = (id: string) => {
    const stored = getStoredConfigs() as VariantStoredConfig[];
    const found = stored.find(c => c.id === id);

    if (found && found.productId) {
      setSelectedProductId(found.productId);
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
      (updated as VariantStoredConfig[]).filter(
        c => c.entityType === 'variants'
      )
    );

    if (activeConfigId === id) {
      setActiveConfigId(null);
      saveActiveConfigId(null);
    }

    toast.success('Configuracao excluida!');
  };

  // Reset config
  const handleResetConfig = () => {
    if (isAllProducts) {
      if (selectedTemplate) {
        setConfig(
          createConfigForVariants(
            null,
            selectedTemplate.variantAttributes,
            true,
            { id: selectedTemplate.id, name: selectedTemplate.name }
          )
        );
      } else {
        setConfig(createConfigForVariants(null, undefined, true));
      }
    } else if (selectedProduct) {
      setConfig(
        createConfigForVariants(
          selectedProduct,
          templateDetails?.variantAttributes
        )
      );
    }
    setActiveConfigId(null);
    saveActiveConfigId(null);
  };

  // Continue to sheets
  const handleContinue = () => {
    if (!config || !selectedProductId) {
      toast.error('Selecione um produto primeiro');
      return;
    }

    // Save to session for sheets page
    sessionStorage.setItem(
      'import-variants-config',
      JSON.stringify({
        ...config,
        productId: isAllProducts ? null : selectedProductId,
        productName: isAllProducts
          ? 'Todos os Produtos'
          : selectedProduct?.name,
        templateId: isAllProducts
          ? selectedTemplate?.id
          : selectedProduct?.templateId,
        templateName: isAllProducts
          ? selectedTemplate?.name
          : templateDetails?.name,
        isAllProducts,
      })
    );

    router.push('/import/stock/variants/sheets');
  };

  // Loading state
  if (isLoadingProducts || isLoadingTemplates || !isInitialized) {
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
        title="Configurar Importacao de Variantes"
        description="Selecione o produto e configure os campos"
        buttons={[
          {
            id: 'back',
            title: 'Voltar',
            icon: ArrowLeft,
            variant: 'outline',
            onClick: () => router.push('/import/stock/variants'),
          },
          {
            id: 'continue',
            title: 'Continuar',
            icon: ArrowRight,
            onClick: handleContinue,
            disabled: !selectedProductId || !config,
          },
        ]}
      />

      {/* Step 1: Product Selection */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
              1
            </div>
            <div>
              <CardTitle className="text-base">Selecionar Produto</CardTitle>
              <CardDescription>
                Escolha um produto especifico ou importe para varios produtos
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <Select
                value={selectedProductId || undefined}
                onValueChange={handleProductChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Escolha um produto..." />
                </SelectTrigger>
                <SelectContent>
                  {/* "Todos" option first */}
                  <SelectItem value={ALL_PRODUCTS_VALUE}>
                    <div className="flex items-center gap-2">
                      <ListTree className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">Todos os Produtos</span>
                      <Badge variant="secondary" className="ml-2 text-xs">
                        Especificar na planilha
                      </Badge>
                    </div>
                  </SelectItem>
                  <div className="h-px bg-border my-1" />
                  {products?.map(product => (
                    <SelectItem key={product.id} value={product.id}>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        <span>{product.name}</span>
                        {product.code && (
                          <span className="text-muted-foreground text-xs">
                            ({product.code})
                          </span>
                        )}
                        {product.template && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {product.template.name}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedProductId && (
              <div
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg border',
                  isAllProducts
                    ? 'bg-blue-500/10 border-blue-500/30'
                    : 'bg-purple-500/10 border-purple-500/30'
                )}
              >
                {isAllProducts ? (
                  <>
                    <ListTree className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">
                      <span className="text-muted-foreground">Modo: </span>
                      <span className="font-medium text-blue-500">
                        Varios Produtos
                      </span>
                    </span>
                  </>
                ) : (
                  <>
                    <Layers className="w-4 h-4 text-purple-500" />
                    <span className="text-sm">
                      <span className="text-muted-foreground">
                        Variantes para:{' '}
                      </span>
                      <span className="font-medium text-purple-500">
                        {selectedProduct?.name}
                      </span>
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Info messages */}
          {isAllProducts && (
            <div className="mt-4 flex items-center gap-2 text-sm text-blue-500">
              <AlertCircle className="w-4 h-4" />
              <span>
                O campo &quot;Produto&quot; sera incluido na planilha para voce
                especificar o produto de cada variante
              </span>
            </div>
          )}

          {/* Template selector for "Todos" mode */}
          {isAllProducts && (
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
                        {template.variantAttributes &&
                          Object.keys(template.variantAttributes).length >
                            0 && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              {Object.keys(template.variantAttributes).length}{' '}
                              atributos
                            </Badge>
                          )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTemplate && (
                <div className="flex items-center gap-2 text-sm">
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
            </div>
          )}

          {/* Template info */}
          {selectedProduct && templateDetails && (
            <div className="mt-4 flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span className="text-muted-foreground">Template:</span>
              <span className="font-medium">{templateDetails.name}</span>
              {customAttributeCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {customAttributeCount} atributos personalizados
                </Badge>
              )}
            </div>
          )}

          {selectedProduct && !selectedProduct.templateId && (
            <div className="mt-4 flex items-center gap-2 text-sm text-amber-500">
              <AlertCircle className="w-4 h-4" />
              <span>Este produto nao tem template associado</span>
            </div>
          )}

          {!selectedProductId && (
            <div className="mt-4 flex items-center gap-2 text-sm text-amber-500">
              <AlertCircle className="w-4 h-4" />
              <span>
                Selecione um produto ou &quot;Todos&quot; para continuar
              </span>
            </div>
          )}

          {selectedProductId && !isAllProducts && isLoadingTemplate && (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
              <span>Carregando atributos do template...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Field Configuration (only show if product selected) */}
      {selectedProductId && config && (isAllProducts || !isLoadingTemplate) && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main config */}
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
                      isAllProducts
                        ? 'Todos os Produtos - Variantes'
                        : `${selectedProduct?.name} - Variantes`
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
                    Configuracoes salvas para variantes
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
                              {saved.productName} -{' '}
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
                      {isAllProducts ? 'Varios Produtos' : 'Produto Especifico'}
                    </span>
                  </div>
                  {!isAllProducts && selectedProduct && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Produto</span>
                      <span className="font-medium truncate max-w-[150px]">
                        {selectedProduct?.name}
                      </span>
                    </div>
                  )}
                  {(templateDetails || selectedTemplate) && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Template</span>
                      <span className="font-medium">
                        {isAllProducts
                          ? selectedTemplate?.name
                          : templateDetails?.name}
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
    </PageLayout>
  );
}
