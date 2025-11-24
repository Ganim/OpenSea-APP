# Plano de Abstração de Componentes - Sistema OpenSea

## Objetivo

Abstrair todos os componentes específicos de templates em componentes genéricos e reutilizáveis que possam ser utilizados em todo o sistema para gerenciar qualquer entidade (templates, produtos, variantes, itens, pedidos, etc.).

## ⚠️ REGRAS OBRIGATÓRIAS

1. **NÃO ALTERAR O DESIGN VISUAL** - Manter exatamente o mesmo visual que já existe
2. **NÃO ALTERAR FUNCIONALIDADES** - Todas as funcionalidades devem funcionar exatamente como antes
3. **MANTER COMPORTAMENTOS** - Todos os comportamentos interativos devem permanecer idênticos
4. **PRESERVAR UX** - A experiência do usuário deve ser exatamente a mesma

## Princípios de Design

- **Clean Code**: Código limpo, legível e bem documentado
- **SOLID**: Seguir princípios SOLID para máxima manutenibilidade
- **DRY**: Não repetir código, reutilizar ao máximo
- **Separation of Concerns**: Separação clara de responsabilidades
- **Type Safety**: TypeScript rigoroso em todos os componentes
- **Composition over Inheritance**: Favorecer composição de componentes

## Arquitetura de Componentes

### 1. Componentes de Formulário

#### 1.1 DynamicFormField
**Localização**: `src/components/shared/forms/dynamic-form-field.tsx`

**Propósito**: Renderizar campos de formulário dinamicamente com base em configuração

**Interface**:
```typescript
interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'number' | 'textarea' | 'date' | 'select' | 'switch' | 'checkbox' | 'file' | 'color';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: Array<{ label: string; value: string | number }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (value: any) => boolean | string;
  };
  description?: string;
  defaultValue?: any;
  className?: string;
}

interface DynamicFormFieldProps {
  config: FormFieldConfig;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}
```

**Funcionalidades**:
- Renderização condicional baseada no tipo
- Validação integrada
- Mensagens de erro customizadas
- Suporte a disabled/required
- Integração com React Hook Form

#### 1.2 AttributeManager
**Localização**: `src/components/shared/forms/attribute-manager.tsx`

**Propósito**: Gerenciar atributos dinâmicos (chave-valor)

**Interface**:
```typescript
interface AttributeConfig {
  singular: string;      // "Atributo"
  plural: string;        // "Atributos"
  keyLabel: string;      // "Chave"
  valueLabel: string;    // "Valor"
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  maxAttributes?: number;
  allowDuplicateKeys?: boolean;
}

interface AttributeManagerProps {
  value: Array<{ key: string; value: string }>;
  onChange: (attributes: Array<{ key: string; value: string }>) => void;
  config: AttributeConfig;
  disabled?: boolean;
  error?: string;
}
```

**Funcionalidades**:
- Adicionar/remover atributos
- Auto-geração de keys únicos
- Validação de duplicatas (opcional)
- Limite de atributos (opcional)
- Suporte a disabled

#### 1.3 EntityForm
**Localização**: `src/components/shared/forms/entity-form.tsx`

**Propósito**: Formulário genérico para qualquer entidade

**Interface**:
```typescript
interface FormSection {
  title?: string;
  description?: string;
  fields: FormFieldConfig[];
}

interface FormTab {
  id: string;
  label: string;
  icon?: React.ComponentType;
  sections: FormSection[];
  attributes?: AttributeConfig; // Para seções com atributos dinâmicos
}

interface EntityFormConfig {
  entity: string;           // "Template", "Produto", etc.
  tabs?: FormTab[];         // Se usar abas
  sections?: FormSection[]; // Se não usar abas
  onSubmit: (data: any) => Promise<void>;
  defaultValues?: any;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  loading?: boolean;
}

interface EntityFormProps {
  config: EntityFormConfig;
  ref?: React.Ref<EntityFormRef>;
}

interface EntityFormRef {
  submit: () => Promise<void>;
  getData: () => any;
  reset: () => void;
  setFieldValue: (name: string, value: any) => void;
}
```

**Funcionalidades**:
- Suporte a abas e seções
- Integração com DynamicFormField
- Integração com AttributeManager
- Validação completa
- Loading states
- Expõe métodos via ref
- Change detection para otimização

### 2. Componentes de Visualização

#### 2.1 EntityViewer
**Localização**: `src/components/shared/viewers/entity-viewer.tsx`

**Propósito**: Visualizar entidade em modo leitura

**Interface**:
```typescript
interface ViewFieldConfig {
  label: string;
  value: any;
  type?: 'text' | 'date' | 'badge' | 'list' | 'custom';
  render?: (value: any) => React.ReactNode;
  className?: string;
}

interface ViewSection {
  title?: string;
  fields: ViewFieldConfig[];
}

interface ViewTab {
  id: string;
  label: string;
  icon?: React.ComponentType;
  sections: ViewSection[];
}

interface EntityViewerConfig {
  entity: string;
  data: any;
  tabs?: ViewTab[];
  sections?: ViewSection[];
  layout?: 'card' | 'list' | 'grid';
  onEdit?: () => void;
  editLabel?: string;
  allowEdit?: boolean;
}

interface EntityViewerProps {
  config: EntityViewerConfig;
  mode?: 'view' | 'edit';
  onModeChange?: (mode: 'view' | 'edit') => void;
  formConfig?: EntityFormConfig; // Para modo edit
}
```

**Funcionalidades**:
- Múltiplos layouts (card, list, grid)
- Suporte a abas e seções
- Renderização customizada de campos
- Modo de edição inline
- Integração com EntityForm para edição

### 3. Componentes de Modal

#### 3.1 MultiViewModal
**Localização**: `src/components/shared/modals/multi-view-modal.tsx`

**Propósito**: Modal versátil com múltiplos modos de visualização

**Interface**:
```typescript
interface MultiViewModalConfig<T = any> {
  entity: string;                    // "Template", "Produto", etc.
  entityPlural: string;              // "Templates", "Produtos", etc.
  items: T[];                        // Entidades abertas
  activeId: string | null;           // ID da entidade ativa
  onActiveChange: (id: string) => void;
  onClose: (id: string) => void;
  onCloseAll: () => void;
  
  // Configuração de visualização
  viewerConfig: (item: T) => EntityViewerConfig;
  formConfig: (item: T) => EntityFormConfig;
  
  // Modo de comparação
  compareEnabled?: boolean;
  compareConfig?: {
    maxItems?: number;
    fields?: string[]; // Campos a comparar
  };
  
  // Busca
  searchEnabled?: boolean;
  searchConfig?: {
    onSearch: (query: string) => Promise<T[]>;
    onSelect: (item: T) => void;
    placeholder?: string;
    renderResult?: (item: T) => React.ReactNode;
  };
  
  // Callbacks
  onSave?: (id: string, data: any) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

interface MultiViewModalProps<T> {
  config: MultiViewModalConfig<T>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
```

**Funcionalidades**:
- Modo single view
- Modo compare (até N itens)
- Modo grid/overview
- Busca integrada
- Tabs para entidades abertas
- Dropdown para seleção de entidade
- Edição inline
- Salvamento com change detection

### 4. Componentes de Página

#### 4.1 EntityCard
**Localização**: `src/components/shared/cards/entity-card.tsx`

**Interface**:
```typescript
interface EntityCardConfig<T = any> {
  entity: T;
  title: string;
  subtitle?: string;
  description?: string;
  badges?: Array<{ label: string; variant?: string }>;
  actions?: Array<{
    label: string;
    icon?: React.ComponentType;
    onClick: (entity: T) => void;
    variant?: 'default' | 'destructive' | 'outline' | 'ghost';
  }>;
  onSelect?: (entity: T) => void;
  selected?: boolean;
  renderFooter?: (entity: T) => React.ReactNode;
}
```

#### 4.2 EntityGrid
**Localização**: `src/components/shared/grids/entity-grid.tsx`

**Interface**:
```typescript
interface EntityGridConfig<T = any> {
  entities: T[];
  loading?: boolean;
  error?: string;
  renderCard: (entity: T) => React.ReactNode;
  emptyState?: {
    title: string;
    description?: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
  onLoadMore?: () => void;
  hasMore?: boolean;
}
```

#### 4.3 PageHeader
**Localização**: `src/components/shared/layout/page-header.tsx`

**Interface**:
```typescript
interface PageHeaderConfig {
  title: string;
  description?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  actions?: Array<{
    label: string;
    icon?: React.ComponentType;
    onClick: () => void;
    variant?: 'default' | 'outline';
  }>;
  filters?: React.ReactNode;
}
```

#### 4.4 SearchSection
**Localização**: `src/components/shared/search/search-section.tsx`

**Interface**:
```typescript
interface SearchSectionConfig {
  placeholder: string;
  onSearch: (query: string) => void;
  filters?: Array<{
    name: string;
    label: string;
    type: 'select' | 'checkbox' | 'date-range';
    options?: Array<{ label: string; value: string }>;
  }>;
  onFilterChange?: (filters: Record<string, any>) => void;
  showAdvanced?: boolean;
}
```

## Configuração de Entidades

### Estrutura de Configuração

**Localização**: `src/config/entities/`

Cada entidade terá um arquivo de configuração:
- `templates.config.ts`
- `products.config.ts`
- `variants.config.ts`
- `items.config.ts`
- `orders.config.ts`

**Exemplo - templates.config.ts**:
```typescript
import { EntityFormConfig, EntityViewerConfig, MultiViewModalConfig } from '@/types/entity-config';
import { Template } from '@/types/stock';

// Configuração do formulário
export const templateFormConfig: (template?: Template) => EntityFormConfig = (template) => ({
  entity: 'Template',
  tabs: [
    {
      id: 'geral',
      label: 'Geral',
      sections: [
        {
          title: 'Informações Básicas',
          fields: [
            {
              name: 'name',
              label: 'Nome do Template',
              type: 'text',
              required: true,
              placeholder: 'Digite o nome do template'
            },
            {
              name: 'description',
              label: 'Descrição',
              type: 'textarea',
              placeholder: 'Descrição opcional'
            }
          ]
        }
      ]
    },
    {
      id: 'produto',
      label: 'Produto',
      sections: [],
      attributes: {
        singular: 'Atributo do Produto',
        plural: 'Atributos do Produto',
        keyLabel: 'Chave',
        valueLabel: 'Valor'
      }
    },
    {
      id: 'variante',
      label: 'Variante',
      sections: [],
      attributes: {
        singular: 'Atributo da Variante',
        plural: 'Atributos da Variante',
        keyLabel: 'Chave',
        valueLabel: 'Valor'
      }
    },
    {
      id: 'item',
      label: 'Item',
      sections: [],
      attributes: {
        singular: 'Atributo do Item',
        plural: 'Atributos do Item',
        keyLabel: 'Chave',
        valueLabel: 'Valor'
      }
    }
  ],
  defaultValues: template || {
    name: '',
    description: '',
    productAttributes: [],
    variantAttributes: [],
    itemAttributes: []
  },
  submitLabel: template ? 'Salvar Alterações' : 'Criar Template',
  cancelLabel: 'Cancelar'
});

// Configuração do viewer
export const templateViewerConfig: (template: Template) => EntityViewerConfig = (template) => ({
  entity: 'Template',
  data: template,
  tabs: [
    {
      id: 'geral',
      label: 'Geral',
      sections: [
        {
          title: 'Informações Básicas',
          fields: [
            { label: 'Nome', value: template.name },
            { label: 'Descrição', value: template.description || 'Sem descrição' }
          ]
        }
      ]
    },
    {
      id: 'produto',
      label: 'Produto',
      sections: [
        {
          title: 'Atributos do Produto',
          fields: template.productAttributes.map(attr => ({
            label: attr.key,
            value: attr.value
          }))
        }
      ]
    },
    {
      id: 'variante',
      label: 'Variante',
      sections: [
        {
          title: 'Atributos da Variante',
          fields: template.variantAttributes.map(attr => ({
            label: attr.key,
            value: attr.value
          }))
        }
      ]
    },
    {
      id: 'item',
      label: 'Item',
      sections: [
        {
          title: 'Atributos do Item',
          fields: template.itemAttributes.map(attr => ({
            label: attr.key,
            value: attr.value
          }))
        }
      ]
    }
  ],
  allowEdit: true,
  editLabel: 'Editar'
});

// Configuração do modal
export const templateModalConfig: (items: Template[], activeId: string | null, callbacks: any) => MultiViewModalConfig<Template> = (items, activeId, callbacks) => ({
  entity: 'Template',
  entityPlural: 'Templates',
  items,
  activeId,
  onActiveChange: callbacks.onActiveChange,
  onClose: callbacks.onClose,
  onCloseAll: callbacks.onCloseAll,
  viewerConfig: templateViewerConfig,
  formConfig: templateFormConfig,
  compareEnabled: true,
  compareConfig: {
    maxItems: 3,
    fields: ['name', 'productAttributes', 'variantAttributes', 'itemAttributes']
  },
  searchEnabled: true,
  searchConfig: {
    onSearch: callbacks.onSearch,
    onSelect: callbacks.onSelect,
    placeholder: 'Buscar templates...'
  },
  onSave: callbacks.onSave,
  onDelete: callbacks.onDelete
});
```

## Hooks Genéricos

### useEntityCRUD
**Localização**: `src/hooks/shared/use-entity-crud.ts`

```typescript
interface UseEntityCRUDConfig<T> {
  entityKey: string;           // 'templates', 'products', etc.
  service: {
    getAll: () => Promise<T[]>;
    getById: (id: string) => Promise<T>;
    create: (data: Partial<T>) => Promise<T>;
    update: (id: string, data: Partial<T>) => Promise<T>;
    delete: (id: string) => Promise<void>;
  };
}

export function useEntityCRUD<T>(config: UseEntityCRUDConfig<T>) {
  // React Query hooks genéricos
  const useList = () => useQuery({ ... });
  const useGet = (id: string) => useQuery({ ... });
  const useCreate = () => useMutation({ ... });
  const useUpdate = () => useMutation({ ... });
  const useDelete = () => useMutation({ ... });
  
  return {
    useList,
    useGet,
    useCreate,
    useUpdate,
    useDelete
  };
}
```

### useMultiSelect
**Localização**: `src/hooks/shared/use-multi-select.ts`

```typescript
export function useMultiSelect<T extends { id: string }>(items: T[]) {
  const [selected, setSelected] = useState<string[]>([]);
  
  const toggle = (id: string) => { ... };
  const selectAll = () => { ... };
  const clearAll = () => { ... };
  const isSelected = (id: string) => { ... };
  const getSelected = () => items.filter(item => selected.includes(item.id));
  
  return {
    selected,
    toggle,
    selectAll,
    clearAll,
    isSelected,
    getSelected,
    selectedCount: selected.length
  };
}
```

### useModal
**Localização**: `src/hooks/shared/use-modal.ts`

```typescript
interface UseModalConfig<T extends { id: string }> {
  maxOpenItems?: number;
}

export function useModal<T extends { id: string }>(config?: UseModalConfig<T>) {
  const [openItems, setOpenItems] = useState<T[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const open = (item: T) => { ... };
  const close = (id: string) => { ... };
  const closeAll = () => { ... };
  const setActive = (id: string) => { ... };
  const isOpen = (id: string) => { ... };
  
  return {
    openItems,
    activeId,
    open,
    close,
    closeAll,
    setActive,
    isOpen
  };
}
```

### useFormValidation
**Localização**: `src/hooks/shared/use-form-validation.ts`

```typescript
export function useFormValidation(config: EntityFormConfig) {
  // Validação genérica baseada em config
  // Integração com React Hook Form
  // Retorna errors, validate, etc.
}
```

## Estrutura de Tipos

**Localização**: `src/types/entity-config.ts`

```typescript
// Exportar todas as interfaces mencionadas acima
export type {
  FormFieldConfig,
  AttributeConfig,
  EntityFormConfig,
  EntityFormRef,
  ViewFieldConfig,
  EntityViewerConfig,
  MultiViewModalConfig,
  EntityCardConfig,
  EntityGridConfig,
  PageHeaderConfig,
  SearchSectionConfig
};
```

## Plano de Implementação

### Fase 1: Componentes Base (Prioridade MÁXIMA)
**Tempo estimado**: 2-3 dias

1. ✅ **DynamicFormField** - Campo de formulário dinâmico
2. ✅ **AttributeManager** - Gerenciador de atributos
3. ✅ **EntityForm** - Formulário genérico
4. ✅ **EntityViewer** - Visualizador genérico
5. ✅ **MultiViewModal** - Modal multi-visualização

**Critério de Sucesso**: Todos os componentes base criados e testados isoladamente

### Fase 2: Componentes de Suporte
**Tempo estimado**: 1-2 dias

6. ✅ **EntityCard** - Card de entidade
7. ✅ **EntityGrid** - Grid de entidades
8. ✅ **PageHeader** - Cabeçalho de página
9. ✅ **SearchSection** - Seção de busca

**Critério de Sucesso**: Componentes de suporte integrados e funcionais

### Fase 3: Hooks e Utilitários
**Tempo estimado**: 1 dia

- Criar hooks genéricos (useEntityCRUD, useMultiSelect, useModal, useFormValidation)
- Criar utilitários de validação e formatação
- Criar tipos TypeScript compartilhados

**Critério de Sucesso**: Hooks testados e documentados

### Fase 4: Configurações de Entidades
**Tempo estimado**: 1 dia

- Criar `templates.config.ts` completo
- Criar estrutura base para outras entidades
- Documentar padrão de configuração

**Critério de Sucesso**: Configuração de templates completa e funcional

### Fase 5: Migração de Templates
**Tempo estimado**: 2-3 dias

- ✅ Migrar página de listagem de templates
- Migrar página de criação de templates
- Migrar página de edição de templates
- Migrar modal de visualização de templates

**Critério de Sucesso**: Todas as páginas de templates usando componentes genéricos, sem alteração visual ou funcional

### Fase 6: Testes e Validação
**Tempo estimado**: 1-2 dias

- Testar todos os fluxos de templates
- Validar design (deve ser idêntico)
- Validar funcionalidades (devem funcionar exatamente igual)
- Validar performance
- Corrigir bugs encontrados

**Critério de Sucesso**: Sistema de templates 100% funcional com componentes genéricos

### Fase 7: Extensão para Outras Entidades (FUTURO)
**Tempo estimado**: Por entidade, 1-2 dias

- Criar configuração para produtos
- Migrar páginas de produtos
- Repetir para variantes, itens, pedidos, etc.

## Checklist de Validação

### Design Visual
- [ ] Cores idênticas ao original
- [ ] Espaçamentos idênticos ao original
- [ ] Fontes e tamanhos idênticos ao original
- [ ] Bordas e sombras idênticas ao original
- [ ] Animações e transições idênticas ao original
- [ ] Responsividade mantida
- [ ] Dark mode funcionando

### Funcionalidades
- [ ] Todos os botões funcionam
- [ ] Todos os formulários salvam corretamente
- [ ] Validações funcionam
- [ ] Mensagens de erro aparecem
- [ ] Loading states funcionam
- [ ] Modal abre e fecha corretamente
- [ ] Tabs funcionam
- [ ] Busca funciona
- [ ] Comparação funciona
- [ ] Edição inline funciona
- [ ] Salvamento com change detection funciona

### Performance
- [ ] Sem rerenders desnecessários
- [ ] Sem memory leaks
- [ ] Carregamento rápido
- [ ] Scroll suave

### Código
- [ ] TypeScript rigoroso (sem `any`)
- [ ] Componentes documentados
- [ ] Testes unitários (se aplicável)
- [ ] Sem código duplicado
- [ ] Seguindo princípios SOLID
- [ ] Code review aprovado

### Acessibilidade
- [ ] Navegação por teclado funciona
- [ ] Labels adequados
- [ ] ARIA attributes corretos
- [ ] Contraste adequado

## Próximos Passos

1. ✅ **FASE 1 COMPLETA** - Todos os componentes base implementados
2. ✅ **FASE 2 COMPLETA** - Componentes de suporte implementados  
3. ✅ **FASE 3 COMPLETA** - Hooks e utilitários implementados (conforme necessário)
4. ✅ **FASE 4 COMPLETA** - Configurações de entidades criadas
5. ✅ **FASE 5 COMPLETA** - Templates migrados para componentes genéricos
6. **PRÓXIMO**: Validação completa e testes finais
7. **FUTURO**: Extensão para outras entidades (produtos, variantes, etc.)

## Observações Importantes

### Sobre Change Detection
O sistema atual já implementa change detection no salvamento. Isso deve ser mantido nos componentes genéricos para evitar chamadas desnecessárias à API.

### Sobre forwardRef
Os formulários devem usar forwardRef e useImperativeHandle para expor métodos aos componentes pais, permitindo controle externo do submit.

### Sobre Validação
A validação deve ser declarativa através de config, mas permitir validação customizada quando necessário.

### Sobre Flexibilidade
Os componentes devem ser flexíveis o suficiente para cobrir casos especiais, mas opinativos o suficiente para manter consistência.

### Sobre Performance
Usar React.memo, useMemo e useCallback onde apropriado. Evitar rerenders desnecessários.

### Sobre Testes
Idealmente, cada componente genérico deve ter testes unitários, mas isso não é bloqueante para MVP.

## Conclusão

Este plano transforma o sistema atual de componentes específicos de templates em uma arquitetura genérica e reutilizável que pode ser aplicada a qualquer entidade do sistema. 

A abstração permitirá:
- ✅ **Redução de código duplicado**
- ✅ **Manutenção mais fácil**
- ✅ **Consistência visual e funcional**
- ✅ **Velocidade de desenvolvimento de novas features**
- ✅ **Escalabilidade do sistema**

Mantendo absolutamente intactos:
- ✅ **Design visual**
- ✅ **Funcionalidades**
- ✅ **Comportamentos**
- ✅ **Experiência do usuário**

---

**Documento criado em**: 18 de novembro de 2025  
**Versão**: 1.0  
**Status**: ✅ Implementação concluída - Aguardando validação final
