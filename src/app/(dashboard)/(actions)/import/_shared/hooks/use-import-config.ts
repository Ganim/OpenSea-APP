'use client';

import { useState, useCallback, useEffect } from 'react';
import type {
  ImportConfig,
  ImportFieldConfig,
  StoredImportConfig,
  ImportEntityType,
} from '../types';
import { getEntityFields } from '../config/entity-definitions';

const STORAGE_KEY = 'opensea-import-configs';
const ACTIVE_CONFIG_KEY = 'opensea-import-active-config';

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateId(): string {
  return `config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

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

function getActiveConfigId(entityType: ImportEntityType): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(ACTIVE_CONFIG_KEY);
    if (!stored) return null;
    const activeConfigs: Record<string, string> = JSON.parse(stored);
    return activeConfigs[entityType] || null;
  } catch {
    return null;
  }
}

function saveActiveConfigId(
  entityType: ImportEntityType,
  configId: string | null
): void {
  if (typeof window === 'undefined') return;
  try {
    const stored = localStorage.getItem(ACTIVE_CONFIG_KEY);
    const activeConfigs: Record<string, string | null> = stored
      ? JSON.parse(stored)
      : {};
    if (configId) {
      activeConfigs[entityType] = configId;
    } else {
      delete activeConfigs[entityType];
    }
    localStorage.setItem(ACTIVE_CONFIG_KEY, JSON.stringify(activeConfigs));
  } catch {
    // Ignore errors
  }
}

// ============================================
// CREATE DEFAULT CONFIG
// ============================================

function createDefaultConfig(entityType: ImportEntityType): ImportConfig {
  const entityFields = getEntityFields(entityType);

  const fields: ImportFieldConfig[] = entityFields.map((field, index) => ({
    key: field.key,
    label: field.label,
    customLabel: undefined,
    enabled: field.required, // Apenas campos obrigatorios habilitados por padrao
    order: index,
    type: field.type,
    required: field.required,
    defaultValue: field.defaultValue,
    options: field.options,
    referenceEntity: field.referenceEntity as
      | ImportEntityType
      | 'templates'
      | 'manufacturers'
      | undefined,
    referenceDisplayField: field.referenceDisplayField,
    minLength: field.validation?.minLength,
    maxLength: field.validation?.maxLength,
    min: field.validation?.min,
    max: field.validation?.max,
    pattern: field.validation?.pattern,
    patternMessage: field.validation?.patternMessage,
  }));

  return {
    entityType,
    fields,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// ============================================
// HOOK
// ============================================

export function useImportConfig(entityType: ImportEntityType) {
  const [config, setConfig] = useState<ImportConfig | null>(null);
  const [savedConfigs, setSavedConfigs] = useState<StoredImportConfig[]>([]);
  const [activeConfigId, setActiveConfigId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar configs salvas do localStorage
  useEffect(() => {
    const stored = getStoredConfigs();
    setSavedConfigs(stored.filter(c => c.entityType === entityType));

    // Carregar ID da config ativa
    const activeId = getActiveConfigId(entityType);
    setActiveConfigId(activeId);

    setIsLoading(false);
  }, [entityType]);

  // Carregar ou criar config padrao (apenas na montagem ou quando entityType muda)
  useEffect(() => {
    const stored = getStoredConfigs();

    // Primeiro, tentar carregar a config ativa
    const activeId = getActiveConfigId(entityType);
    if (activeId) {
      const activeConfig = stored.find(c => c.id === activeId);
      if (activeConfig) {
        // Ensure required fields are always enabled (fix for old configs)
        const entityFields = getEntityFields(entityType);
        const fixedFields = activeConfig.fields.map(field => {
          const entityField = entityFields.find(ef => ef.key === field.key);
          // If field is required in entity definition, force it to be enabled
          if (entityField?.required && !field.enabled) {
            return { ...field, enabled: true, required: true };
          }
          return field;
        });

        setConfig({
          entityType: activeConfig.entityType,
          fields: fixedFields,
          name: activeConfig.name,
          createdAt: new Date(activeConfig.createdAt),
          updatedAt: new Date(activeConfig.updatedAt),
        });
        setActiveConfigId(activeId);
        return;
      }
    }

    // Se nao houver config ativa, criar uma padrao
    setConfig(createDefaultConfig(entityType));
    setActiveConfigId(null);
  }, [entityType]);

  // Salvar configuracao
  const saveConfig = useCallback(
    (newConfig: ImportConfig, name?: string) => {
      const stored = getStoredConfigs();
      const id = generateId();

      const storedConfig: StoredImportConfig = {
        id,
        name: name || `Configuracao ${new Date().toLocaleDateString('pt-BR')}`,
        entityType: newConfig.entityType,
        fields: newConfig.fields,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updated = [...stored, storedConfig];
      saveStoredConfigs(updated);
      setSavedConfigs(updated.filter(c => c.entityType === entityType));

      // Marcar como config ativa
      setActiveConfigId(id);
      saveActiveConfigId(entityType, id);

      setConfig({
        ...newConfig,
        name: storedConfig.name,
        updatedAt: new Date(),
      });

      return id;
    },
    [entityType]
  );

  // Carregar uma configuracao especifica
  const loadConfig = useCallback(
    (id: string): ImportConfig | null => {
      const stored = getStoredConfigs();
      const found = stored.find(c => c.id === id);

      if (found) {
        // Ensure required fields are always enabled (fix for old configs)
        const entityFields = getEntityFields(
          found.entityType as ImportEntityType
        );
        const fixedFields = found.fields.map(field => {
          const entityField = entityFields.find(ef => ef.key === field.key);
          // If field is required in entity definition, force it to be enabled
          if (entityField?.required && !field.enabled) {
            return { ...field, enabled: true, required: true };
          }
          return field;
        });

        const loadedConfig: ImportConfig = {
          entityType: found.entityType,
          fields: fixedFields,
          name: found.name,
          createdAt: new Date(found.createdAt),
          updatedAt: new Date(found.updatedAt),
        };
        setConfig(loadedConfig);

        // Marcar como config ativa
        setActiveConfigId(id);
        saveActiveConfigId(entityType, id);

        return loadedConfig;
      }
      return null;
    },
    [entityType]
  );

  // Resetar para configuracao padrao
  const resetConfig = useCallback(() => {
    setConfig(createDefaultConfig(entityType));
    setActiveConfigId(null);
    saveActiveConfigId(entityType, null);
  }, [entityType]);

  // Deletar configuracao
  const deleteConfig = useCallback(
    (id: string) => {
      const stored = getStoredConfigs();
      const updated = stored.filter(c => c.id !== id);
      saveStoredConfigs(updated);
      setSavedConfigs(updated.filter(c => c.entityType === entityType));

      // Se deletou a config ativa, limpar o estado
      if (activeConfigId === id) {
        setActiveConfigId(null);
        saveActiveConfigId(entityType, null);
      }
    },
    [entityType, activeConfigId]
  );

  // Atualizar um campo especifico
  const updateField = useCallback(
    (fieldKey: string, updates: Partial<ImportFieldConfig>) => {
      if (!config) return;

      const updatedFields = config.fields.map(field =>
        field.key === fieldKey ? { ...field, ...updates } : field
      );

      setConfig({
        ...config,
        fields: updatedFields,
        updatedAt: new Date(),
      });

      // Quando editar, nao e mais a config salva original
      // (a menos que o usuario salve novamente)
    },
    [config]
  );

  // Reordenar campos
  const reorderFields = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (!config) return;

      const fields = [...config.fields];
      const [removed] = fields.splice(fromIndex, 1);
      fields.splice(toIndex, 0, removed);

      // Atualizar order de todos os campos
      const updatedFields = fields.map((field, index) => ({
        ...field,
        order: index,
      }));

      setConfig({
        ...config,
        fields: updatedFields,
        updatedAt: new Date(),
      });
    },
    [config]
  );

  // Toggle habilitar/desabilitar campo
  const toggleField = useCallback(
    (fieldKey: string) => {
      if (!config) return;

      const field = config.fields.find(f => f.key === fieldKey);
      if (field?.required) return; // Nao pode desabilitar campo obrigatorio

      updateField(fieldKey, { enabled: !field?.enabled });
    },
    [config, updateField]
  );

  // Obter campos habilitados ordenados
  const getEnabledFields = useCallback((): ImportFieldConfig[] => {
    if (!config) return [];
    return config.fields
      .filter(f => f.enabled)
      .sort((a, b) => a.order - b.order);
  }, [config]);

  return {
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
    getEnabledFields,
  };
}
