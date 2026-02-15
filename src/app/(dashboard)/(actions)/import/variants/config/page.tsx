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
  Package,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { FieldConfigList } from '../../_shared/components/field-config-list';
import { getEntityFields } from '../../_shared/config/entity-definitions';
import {
  useProductsWithTemplates,
  useTemplateDetails,
  type ProductWithTemplate,
} from '../../_shared/hooks/use-reference-data';
import type {
  ImportConfig,
  ImportFieldConfig,
  StoredImportConfig,
} from '../../_shared/types';

// Storage keys
const STORAGE_KEY = 'opensea-import-configs';
const ACTIVE_CONFIG_KEY = 'opensea-import-active-config';

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

// Create config for variant import (based on product's template)
function createConfigForProduct(
  product: ProductWithTemplate,
  variantAttributes?: Record<
    string,
    { type?: string; label?: string; options?: string[]; required?: boolean }
  >
): ImportConfig {
  const baseFields = getEntityFields('variants');

  // Filter out productId from base fields (it will be fixed)
  const filteredBaseFields = baseFields.filter(f => f.key !== 'productId');

  // Create base field configs
  const fields: ImportFieldConfig[] = filteredBaseFields.map(
    (field, index) => ({
      key: field.key,
      label: field.label,
      customLabel: undefined,
      enabled: field.required,
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
        type: attrConfig.type === 'select' ? 'select' : 'text',
        required: attrConfig.required || false,
        options: attrConfig.options?.map(opt => ({ value: opt, label: opt })),
      });
    });
  }

  return {
    entityType: 'variants',
    templateId: product.templateId,
    templateName: product.template?.name,
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
  const [config, setConfig] = useState<ImportConfig | null>(null);
  const [savedConfigs, setSavedConfigs] = useState<VariantStoredConfig[]>([]);
  const [activeConfigId, setActiveConfigId] = useState<string | null>(null);
  const [configName, setConfigName] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch products with their templates
  const { data: products, isLoading: isLoadingProducts } =
    useProductsWithTemplates();

  // Get selected product
  const selectedProduct = useMemo(() => {
    if (!selectedProductId || !products) return null;
    return products.find(p => p.id === selectedProductId) || null;
  }, [selectedProductId, products]);

  // Fetch template details for selected product
  const { data: templateDetails, isLoading: isLoadingTemplate } =
    useTemplateDetails(selectedProduct?.templateId);

  // Build reference data for dropdowns (empty for variants - no FK fields in config)
  const referenceData = useMemo(
    () => ({
      templates: [],
      suppliers: [],
      manufacturers: [],
      categories: [],
      products: [],
      variants: [],
      locations: [],
    }),
    []
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
    if (selectedProduct && templateDetails) {
      setConfig(
        createConfigForProduct(
          selectedProduct,
          templateDetails.variantAttributes
        )
      );
    } else if (selectedProduct && !selectedProduct.templateId) {
      // Product has no template
      setConfig(createConfigForProduct(selectedProduct));
    }
  }, [selectedProduct, templateDetails]);

  // Count of custom attributes from template
  const customAttributeCount = useMemo(() => {
    if (!templateDetails?.variantAttributes) return 0;
    return Object.keys(templateDetails.variantAttributes).length;
  }, [templateDetails]);

  // Handle product selection
  const handleProductChange = (productId: string) => {
    setSelectedProductId(productId);
    // Clear active config since we're starting fresh
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
    if (!config || !selectedProductId || !selectedProduct) return;

    const stored = getStoredConfigs() as VariantStoredConfig[];
    const id = generateId();
    const name =
      configName.trim() ||
      `${selectedProduct.name} - ${new Date().toLocaleDateString('pt-BR')}`;

    const storedConfig: VariantStoredConfig = {
      id,
      name,
      entityType: 'variants',
      productId: selectedProductId,
      productName: selectedProduct.name,
      templateId: selectedProduct.templateId,
      templateName: templateDetails?.name,
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
    if (selectedProduct) {
      setConfig(
        createConfigForProduct(
          selectedProduct,
          templateDetails?.variantAttributes
        )
      );
      setActiveConfigId(null);
      saveActiveConfigId(null);
    }
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
        productId: selectedProductId,
        productName: selectedProduct?.name,
        templateId: selectedProduct?.templateId,
        templateName: templateDetails?.name,
      })
    );

    router.push('/import/variants/sheets');
  };

  // Loading state
  if (isLoadingProducts || !isInitialized) {
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
            onClick: () => router.push('/import/variants'),
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
                Todas as variantes importadas serao vinculadas a este produto
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

            {selectedProduct && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/30">
                <Layers className="w-4 h-4 text-purple-500" />
                <span className="text-sm">
                  <span className="text-muted-foreground">
                    Variantes para:{' '}
                  </span>
                  <span className="font-medium text-purple-500">
                    {selectedProduct.name}
                  </span>
                </span>
              </div>
            )}
          </div>

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
              <span>Selecione um produto para continuar</span>
            </div>
          )}

          {selectedProductId && isLoadingTemplate && (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
              <span>Carregando atributos do template...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Field Configuration (only show if product selected) */}
      {selectedProductId && config && !isLoadingTemplate && (
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
                  Salve para reutilizar com este produto
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-sm">Nome da configuracao</Label>
                  <Input
                    value={configName}
                    onChange={e => setConfigName(e.target.value)}
                    placeholder={`${selectedProduct?.name} - Variantes`}
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
                    <span className="text-muted-foreground">Produto</span>
                    <span className="font-medium truncate max-w-[150px]">
                      {selectedProduct?.name}
                    </span>
                  </div>
                  {templateDetails && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Template</span>
                      <span className="font-medium">
                        {templateDetails.name}
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
