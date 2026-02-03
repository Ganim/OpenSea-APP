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
  ArrowLeft,
  ArrowRight,
  Check,
  RotateCcw,
  Save,
  Trash2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { ENTITY_DEFINITIONS, getBasePath } from '../config/entity-definitions';
import { useImportConfig } from '../hooks/use-import-config';
import { useAllReferenceData } from '../hooks/use-reference-data';
import type { ImportEntityType } from '../types';
import { FieldConfigList } from './field-config-list';

interface EntityConfigPageProps {
  entityType: ImportEntityType;
  backgroundVariant?: 'default' | 'purple' | 'blue' | 'slate' | 'none';
}

export function EntityConfigPage({
  entityType,
  backgroundVariant = 'purple',
}: EntityConfigPageProps) {
  const router = useRouter();
  const [configName, setConfigName] = useState('');

  const entityDef = ENTITY_DEFINITIONS[entityType];
  const basePath = getBasePath(entityType);

  const {
    config,
    isLoading,
    savedConfigs,
    activeConfigId,
    saveConfig,
    loadConfig,
    resetConfig,
    deleteConfig,
    updateField,
    reorderFields,
    toggleField,
  } = useImportConfig(entityType);

  // Determine which reference data we need
  const referenceTypes: Array<
    | 'templates'
    | 'suppliers'
    | 'manufacturers'
    | 'categories'
    | 'products'
    | 'variants'
    | 'locations'
  > = [];
  entityDef?.fields.forEach(field => {
    if (field.referenceEntity) {
      const refType = field.referenceEntity as (typeof referenceTypes)[number];
      if (!referenceTypes.includes(refType)) {
        referenceTypes.push(refType);
      }
    }
  });

  const { data: referenceData } = useAllReferenceData(referenceTypes);

  const handleSaveConfig = () => {
    if (!config) return;
    const name =
      configName.trim() || `Config ${new Date().toLocaleDateString('pt-BR')}`;
    saveConfig(config, name);
    toast.success('Configuracao salva com sucesso!');
    setConfigName('');
  };

  const handleLoadConfig = (id: string) => {
    loadConfig(id);
    toast.success('Configuracao carregada!');
  };

  const handleDeleteConfig = (id: string) => {
    deleteConfig(id);
    toast.success('Configuracao excluida!');
  };

  const handleContinue = () => {
    if (config) {
      sessionStorage.setItem(
        `import-${entityType}-config`,
        JSON.stringify(config)
      );
    }
    router.push(`${basePath}/sheets`);
  };

  if (isLoading || !config || !entityDef) {
    return (
      <PageLayout backgroundVariant={backgroundVariant} maxWidth="full">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout backgroundVariant={backgroundVariant} maxWidth="full">
      <Header
        title={`Configurar Importacao de ${entityDef.labelPlural}`}
        description="Defina quais campos serao importados e suas propriedades"
        buttons={[
          {
            id: 'back',
            title: 'Voltar',
            icon: ArrowLeft,
            variant: 'outline',
            onClick: () => router.push(basePath),
          },
          {
            id: 'continue',
            title: 'Continuar',
            icon: ArrowRight,
            onClick: handleContinue,
          },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main config */}
        <div className="lg:col-span-2">
          <FieldConfigList
            fields={config.fields}
            referenceData={referenceData}
            onToggleField={toggleField}
            onUpdateField={updateField}
            onReorderFields={reorderFields}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Save config */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Salvar Configuracao</CardTitle>
              <CardDescription>
                Salve esta configuracao para reutilizar depois
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label className="text-sm">Nome da configuracao</Label>
                <Input
                  value={configName}
                  onChange={e => setConfigName(e.target.value)}
                  placeholder="Ex: Importacao Padrao"
                />
              </div>
              <Button className="w-full" onClick={handleSaveConfig}>
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
            </CardContent>
          </Card>

          {/* Load saved config */}
          {savedConfigs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Configuracoes Salvas
                </CardTitle>
                <CardDescription>
                  Carregue uma configuracao anterior
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
                      <div className="flex items-center gap-2">
                        {isActive && (
                          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{saved.name}</p>
                            {isActive && (
                              <Badge
                                variant="default"
                                className="text-xs py-0 px-1.5"
                              >
                                Em uso
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(saved.updatedAt).toLocaleDateString(
                              'pt-BR'
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
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
                onClick={resetConfig}
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
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Campos com padrao
                  </span>
                  <span className="font-medium">
                    {
                      config.fields.filter(f => f.defaultValue !== undefined)
                        .length
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
