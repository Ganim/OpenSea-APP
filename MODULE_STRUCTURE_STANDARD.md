# 📋 Padrão de Estrutura de Módulos - OpenSea OS

## Visão Geral

Este documento descreve o padrão de organização e estruturação de módulos no projeto OpenSea OS. O módulo de **Templates** serve como exemplo de referência para implementar novos módulos seguindo os princípios SOLID.

---

## 🏗️ Estrutura de Diretórios

```
assets/
├── templates/                          # Nome do módulo (singular)
│   ├── src/                           # Toda a lógica centralizada
│   │   ├── components/                # Componentes React reutilizáveis
│   │   │   ├── template-form.tsx      # Componente de formulário
│   │   │   ├── template-viewer.tsx    # Componente de visualização
│   │   │   └── index.ts               # Exportações
│   │   │
│   │   ├── constants/                 # Valores constantes
│   │   │   ├── unit-labels.ts         # Mapeamentos e valores constantes
│   │   │   └── index.ts               # Exportações
│   │   │
│   │   ├── config/                    # Configurações da entidade
│   │   │   ├── templates.config.ts    # Config completa da entidade
│   │   │   └── index.ts               # Exportações
│   │   │
│   │   ├── modals/                    # Componentes de modal/diálogo
│   │   │   ├── view-modal.tsx         # Modal de visualização
│   │   │   ├── create-modal.tsx       # Modal de criação
│   │   │   ├── edit-modal.tsx         # Modal de edição
│   │   │   ├── delete-confirm-modal.tsx
│   │   │   ├── duplicate-confirm-modal.tsx
│   │   │   └── index.ts               # Exportações
│   │   │
│   │   ├── types/                     # Definições de tipos TypeScript
│   │   │   ├── templates.types.ts     # Interfaces do módulo
│   │   │   └── index.ts               # Exportações
│   │   │
│   │   ├── utils/                     # Funções utilitárias
│   │   │   ├── template.utils.ts      # Funções puras
│   │   │   ├── templates.crud.ts      # Operações CRUD isoladas
│   │   │   └── index.ts               # Exportações
│   │   │
│   │   └── index.ts                   # Exportação raiz do módulo
│   │
│   ├── page.tsx                       # Página principal (listagem)
│   └── [id]/
│       └── page.tsx                   # Página de detalhes
```

---

## 📂 Descrição de Cada Diretório

### 1. **components/**

**Responsabilidade:** Componentes React reutilizáveis e específicos do módulo.

**Características:**
- Componentes sem lógica de negócio complexa
- Props bem tipadas
- Re-exportados via `index.ts`

**Exemplo:**
```tsx
// components/template-form.tsx
export function TemplateForm({ template, onSubmit }: TemplateFormProps) {
  // Renderização do formulário
}

// components/index.ts
export { TemplateForm, type TemplateFormRef } from './template-form';
export { TemplateViewer } from './template-viewer';
```

---

### 2. **constants/**

**Responsabilidade:** Valores constantes, mapeamentos e configurações estáticas.

**Características:**
- Valores que não mudam durante a execução
- Mapeamentos (ex: unit-labels)
- Funções helper para acessar constantes

**Exemplo:**
```tsx
// constants/unit-labels.ts
export const UNIT_LABELS: Record<UnitOfMeasure, string> = {
  UNITS: 'Unidades',
  KILOGRAMS: 'Quilogramas',
  // ...
};

export function getUnitLabel(unit: UnitOfMeasure): string {
  return UNIT_LABELS[unit] || unit;
}
```

---

### 3. **config/**

**Responsabilidade:** Configuração completa da entidade para operações CRUD.

**Características:**
- Define metadata do módulo
- Configurações de API
- Permissões e features
- Ações e comportamentos

**Exemplo:**
```tsx
// config/templates.config.ts
export const templatesConfig = defineEntityConfig<Template>()({
  name: 'Template',
  api: { baseUrl: '/api/v1/templates' },
  permissions: { view: 'templates.view' },
  features: { create: true, edit: true, delete: true },
  // ... mais configurações
});
```

---

### 4. **modals/**

**Responsabilidade:** Componentes de modal/diálogo para ações da UI.

**Características:**
- Um modal por arquivo
- Props claras e específicas
- Gerenciamento de estado do modal

**Exemplo:**
```tsx
// modals/create-modal.tsx
export function CreateModal({ isOpen, onClose, onSubmit }: CreateModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {/* Conteúdo do modal */}
    </Dialog>
  );
}
```

---

### 5. **types/**

**Responsabilidade:** Definições de tipos e interfaces TypeScript.

**Características:**
- Interfaces específicas do módulo
- Tipos para props de componentes
- Tipos para dados do módulo

**Exemplo:**
```tsx
// types/templates.types.ts
export interface TemplateFormProps {
  template?: Template;
  onSubmit: (data: TemplateFormData) => Promise<void>;
}

export interface TemplateFormData {
  name: string;
  unitOfMeasure: UnitOfMeasure;
  // ...
}
```

---

### 6. **utils/**

**Responsabilidade:** Funções puras e operações isoladas.

**Características:**
- `template.utils.ts`: Funções de manipulação de dados (puras)
- `templates.crud.ts`: Operações CRUD isoladas
- Sem dependências de React ou componentes

**Exemplo:**
```tsx
// utils/template.utils.ts
export function countTemplateAttributes(template: Template): number {
  return (
    Object.keys(template.productAttributes || {}).length +
    Object.keys(template.variantAttributes || {}).length +
    Object.keys(template.itemAttributes || {}).length
  );
}

// utils/templates.crud.ts
export async function createTemplate(data: Partial<Template>): Promise<Template> {
  return templatesService.createTemplate(data).then(r => r.template);
}
```

---

## 🔄 Fluxo de Imports

### Estrutura de imports recomendada:

```tsx
// ✅ BOM: Importar do src/ (raiz do módulo)
import {
  templatesConfig,
  getUnitLabel,
  ViewModal,
  createTemplate,
  TemplateViewer,
} from './src';

// ❌ EVITAR: Importar de subpastas diretamente
import { templatesConfig } from './src/config/templates.config';
import { getUnitLabel } from './src/constants/unit-labels';
```

### Arquivo raiz `src/index.ts`:

Centraliza e exporta todos os símbolos do módulo:

```tsx
// src/index.ts
export { templatesConfig } from './config/templates.config';
export { UNIT_LABELS, getUnitLabel } from './constants/unit-labels';
export { TemplateForm } from './components/template-form';
export { TemplateViewer } from './components/template-viewer';
export { ViewModal, CreateModal, EditModal, /* ... */ } from './modals';
export { createTemplate, updateTemplate, deleteTemplate } from './utils';
// ... mais exports
```

---

## 🎯 Princípios SOLID Aplicados

### Single Responsibility Principle (SRP)
- ✅ Cada arquivo tem uma única responsabilidade
- ✅ Componentes renderizam, utils calculam, configs definem

### Open/Closed Principle (OCP)
- ✅ Fácil adicionar novas constantes sem modificar código existente
- ✅ Fácil adicionar novos modais sem quebrar os antigos

### Liskov Substitution Principle (LSP)
- ✅ Componentes podem ser substituídos se respeitarem as interfaces
- ✅ Props bem definidas garantem contrato

### Interface Segregation Principle (ISP)
- ✅ Props específicas para cada componente
- ✅ Interfaces granulares (não um mega-objeto props)

### Dependency Inversion Principle (DIP)
- ✅ Componentes dependem de tipos, não implementações
- ✅ Utils não dependem de componentes React

---

## 📋 Checklist para Criar um Novo Módulo

Ao criar um novo módulo, siga este checklist:

### Estrutura
- [ ] Criar pasta `src/` dentro do módulo
- [ ] Criar subpastas: `components/`, `constants/`, `config/`, `modals/`, `types/`, `utils/`
- [ ] Criar `index.ts` em cada subpasta
- [ ] Criar `src/index.ts` raiz

### Padrão de Código
- [ ] Usar `'use client'` apenas em componentes
- [ ] Documentar responsabilidade em comentários de cabeçalho
- [ ] Tipagem completa com TypeScript
- [ ] Sem `any` ou `unknown` desnecessários
- [ ] Imports/exports limpos via `index.ts`

### SOLID
- [ ] Cada arquivo/pasta tem UM propósito claro
- [ ] Funções puras em `utils/`
- [ ] Componentes sem lógica de negócio pesada
- [ ] Tipos bem definidos
- [ ] Separação de concerns respeitada

### Qualidade
- [ ] ESLint sem erros
- [ ] Prettier formatado
- [ ] Build sem problemas
- [ ] Nenhum `console.log` em produção
- [ ] Documentação de tipos em interfaces complexas

---

## 🚀 Exemplo: Integrando um Novo Módulo

```tsx
// Em page.tsx do módulo
import {
  templatesConfig,
  ViewModal,
  CreateModal,
  EditModal,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from './src';

export default function ModulePage() {
  const crud = useEntityCrud<Template>({
    entityName: 'Template',
    createFn: createTemplate,
    updateFn: updateTemplate,
    deleteFn: deleteTemplate,
  });

  return (
    <>
      {/* Renderizar modais */}
      <ViewModal
        isOpen={isOpen}
        onClose={onClose}
        template={template}
      />
      {/* Resto da página */}
    </>
  );
}
```

---

## 📚 Mapeamento de Responsabilidades

| Arquivo | Responsabilidade | Exemplo |
|---------|------------------|---------|
| `components/*.tsx` | Renderizar UI | `<TemplateForm />` |
| `constants/*.ts` | Valores estáticos | `UNIT_LABELS` |
| `config/*.ts` | Metadata da entidade | `templatesConfig` |
| `modals/*.tsx` | Diálogos/Modals | `<ViewModal />` |
| `types/*.ts` | Definições de tipo | `TemplateFormProps` |
| `utils/*.ts` | Lógica pura | `countTemplateAttributes()` |
| `services/` | Chamadas API | `templatesService.getTemplate()` |
| `page.tsx` | Orquestração | Juntar tudo junto |

---

## ✨ Boas Práticas

### 1. **Documentação Clara**
```tsx
/**
 * Template View Modal
 * Renderiza modal para visualização de um template específico
 * 
 * Responsabilidade única: Exibir dados do template em modal
 */
export function ViewModal({ isOpen, onClose, template }: ViewModalProps) {
  // ...
}
```

### 2. **Tipos Bem Definidos**
```tsx
// ✅ BOM
interface TemplateFormProps {
  template?: Template;
  onSubmit: (data: TemplateFormData) => Promise<void>;
}

// ❌ RUIM
interface TemplateFormProps {
  props: any;
}
```

### 3. **Índices Centralizados**
```tsx
// ✅ BOM: Importar do índice
import { TemplateViewer, ViewModal, createTemplate } from './src';

// ❌ RUIM: Importar espalhado
import { TemplateViewer } from './src/components';
import { ViewModal } from './src/modals';
import { createTemplate } from './src/utils/templates.crud';
```

### 4. **Separação de Concerns**
```tsx
// ✅ BOM
// utils/templates.crud.ts - Apenas lógica
export async function createTemplate(data: Partial<Template>) {
  return await api.post('/templates', data);
}

// modals/create-modal.tsx - Apenas renderização
export function CreateModal({ onSubmit }: CreateModalProps) {
  return <Dialog>{/* UI */}</Dialog>;
}

// ❌ RUIM: Misturar lógica com renderização
export function CreateModal() {
  const handleCreate = async () => {
    // Lógica CRUD aqui
    const response = await api.post('/templates', data);
  };
  return <Dialog>{/* UI */}</Dialog>;
}
```

---

## 🔗 Referências

- **Exemplo Completo:** `/src/app/(dashboard)/stock/assets/templates/`
- **SOLID Principles:** Implementados em todo o módulo
- **TypeScript Strict:** Todas as análises tipadas

---

## ❓ FAQ

**P: Por que separar CRUD em arquivo específico?**
R: Facilita reutilização, testes e manutenção. Funções puras são testáveis sem React.

**P: Preciso criar os 6 diretórios mesmo que não use modais?**
R: Adapte conforme necessário, mas mantenha a estrutura base (components, types, utils).

**P: Posso colocar múltiplos componentes em um arquivo?**
R: Não. Um componente = um arquivo. Isso segue o SRP.

**P: Onde vai a lógica de negócio complexa?**
R: Em `utils/`. Mantenha componentes focados em renderização.

**P: E chamadas de API?**
R: Via `services/` fora do módulo (em `/src/services/`). O CRUD no módulo orquestra essas chamadas.

---

**Última Atualização:** 7 de dezembro de 2025  
**Status:** Padrão Estabelecido e Validado  
**Exemplo de Referência:** Templates Module
