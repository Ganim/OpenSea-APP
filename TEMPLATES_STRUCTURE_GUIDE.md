# Estrutura do Módulo Templates - Organização SOLID

```
src/app/(dashboard)/stock/assets/templates/
│
├── page.tsx                          # Listagem de templates
│   ├── Imports: 
│   │   ├── TemplateViewer (components)
│   │   ├── getUnitLabel (constants)
│   │   └── Outras dependências da page
│   └── Responsabilidade: Renderizar grid/lista de templates
│
├── [id]/
│   └── page.tsx                      # Página de detalhes
│       ├── Imports:
│       │   ├── TemplateViewer (components)
│       │   └── templatesService (services)
│       └── Responsabilidade: Exibir e editar template específico
│
├── components/
│   │
│   ├── template-form.tsx             # Formulário de criação/edição
│   │   ├── Responsabilidade única: Gerenciar estado do formulário
│   │   ├── Exports: TemplateForm, TemplateFormRef
│   │   ├── Props: template?, onSubmit
│   │   └── Não faz: Chamadas à API, navegação
│   │
│   ├── template-viewer.tsx           # Visualizador de template
│   │   ├── Responsabilidade única: Renderizar template
│   │   ├── Imports: getUnitLabel (constants)
│   │   ├── Exports: TemplateViewer, TemplateViewerProps
│   │   ├── Props: template, showHeader?, showEditButton?
│   │   └── Modo: Leitura ou Edição (inline)
│   │
│   └── index.ts                      # Exportações centralizadas
│       ├── export { TemplateForm }
│       ├── export { TemplateViewer }
│       └── export type { TemplateViewerProps }
│
├── constants/
│   │
│   ├── unit-labels.ts                # Mapeamento de unidades
│   │   ├── Responsabilidade: Fornecer labels de unidades
│   │   ├── Exports: UNIT_LABELS (Record)
│   │   ├── Exports: getUnitLabel() (função)
│   │   └── Valores: 31 unidades diferentes
│   │
│   └── index.ts                      # Exportações centralizadas
│       ├── export { UNIT_LABELS }
│       └── export { getUnitLabel }
│
├── types/
│   │
│   ├── templates.types.ts            # Interfaces do módulo
│   │   ├── Responsabilidade: Definir tipos TypeScript
│   │   ├── Exports: TemplateFormProps
│   │   ├── Exports: TemplateFormData
│   │   ├── Exports: TemplateViewerProps
│   │   ├── Exports: MultiViewModalProps
│   │   └── Exports: TemplateSelectionContext
│   │
│   └── index.ts                      # Exportações centralizadas
│       ├── export type { TemplateFormProps }
│       ├── export type { TemplateFormData }
│       ├── export type { TemplateViewerProps }
│       ├── export type { MultiViewModalProps }
│       └── export type { TemplateSelectionContext }
│
└── utils/
    │
    ├── template.utils.ts             # Funções utilitárias
    │   ├── Responsabilidade: Fornecer lógica pura
    │   ├── Exports: countTemplateAttributes()
    │   ├── Exports: hasCareInstructions()
    │   ├── Exports: formatTemplateInfo()
    │   ├── Exports: cleanTemplateData()
    │   └── Exports: isValidTemplate()
    │
    └── index.ts                      # Exportações centralizadas
        ├── export { countTemplateAttributes }
        ├── export { hasCareInstructions }
        ├── export { formatTemplateInfo }
        ├── export { cleanTemplateData }
        └── export { isValidTemplate }
```

## Fluxo de Imports

### ✅ Imports Corretos (Novos)

```typescript
// Em page.tsx
import { TemplateViewer } from './components';
import { getUnitLabel } from './constants';

// Em [id]/page.tsx
import { TemplateViewer } from '../components';

// Em multi-view-modal.tsx (stock/components)
import { TemplateViewer } from '@/app/(dashboard)/stock/assets/templates/components';

// Em template-viewer.tsx
import { getUnitLabel } from '../constants';
```

### ❌ Imports Evitados (Antigos)

```typescript
// NÃO fazer mais:
import { TemplateViewer } from '@/components/stock/template-viewer';
import { TemplateForm } from '@/components/stock/template-form';

// NÃO adicionar unitLabels em:
// - page.tsx (usar getUnitLabel)
// - template-viewer.tsx (usar getUnitLabel)
// - product-detail-modal.tsx (usar getUnitLabel)
```

## Padrão de Responsabilidade Única

### Components (template-form.tsx)
```
Responsabilidade: Gerenciar estado e renderizar UI do formulário
├── Pode: useState, useRef, useEffect
├── Pode: Render UI com React components
├── Pode: Validação básica de UI
├── NÃO pode: Chamar API
├── NÃO pode: Navigar
├── NÃO pode: Gerenciar múltiplos templates
└── NÃO pode: Formatações de dados
```

### Constants (unit-labels.ts)
```
Responsabilidade: Fornecer mapeamento de valores
├── Pode: Exportar constantes
├── Pode: Fornecer funções getter
├── NÃO pode: Fazer cálculos complexos
├── NÃO pode: Importar componentes
└── NÃO pode: Fazer side effects
```

### Utils (template.utils.ts)
```
Responsabilidade: Fornecer lógica pura e reutilizável
├── Pode: Funções puras
├── Pode: Transformações de dados
├── Pode: Validações
├── NÃO pode: React hooks
├── NÃO pode: Renderizar UI
└── NÃO pode: Chamar API
```

### Types (templates.types.ts)
```
Responsabilidade: Definir interfaces e tipos
├── Pode: Interfaces
├── Pode: Types
├── Pode: Extend de tipos existentes
├── NÃO pode: Implementações
├── NÃO pode: Valores
└── NÃO pode: Funções
```

## Como Adicionar Novas Funcionalidades

### 1. Nova Unidade de Medida
```typescript
// 1. Atualizar em src/types/stock.ts
export type UnitOfMeasure = '...' | 'NOVA_UNIDADE';

// 2. Adicionar em constants/unit-labels.ts
export const UNIT_LABELS: Record<UnitOfMeasure, string> = {
  // ... existentes
  NOVA_UNIDADE: 'Nova Unidade',
};
```

### 2. Nova Props para TemplateViewer
```typescript
// 1. Adicionar em types/templates.types.ts
export interface TemplateViewerProps {
  // ... existentes
  minhaNovaProps?: boolean;
}

// 2. Usar em components/template-viewer.tsx
export function TemplateViewer({
  // ... existentes
  minhaNovaProps = false,
}: TemplateViewerProps) { ... }
```

### 3. Nova Função Utilitária
```typescript
// 1. Adicionar em utils/template.utils.ts
export function minhaNovaFuncao(template: Template): string {
  return '...';
}

// 2. Exportar em utils/index.ts
export { minhaNovaFuncao };

// 3. Usar
import { minhaNovaFuncao } from './utils';
```

## Checklist para Manutenção

- ✅ Constantes espalhadas? Centralizar em `constants/`
- ✅ Tipos repetidos? Centralizar em `types/`
- ✅ Lógica em componentes? Extrair para `utils/`
- ✅ Imports de `/components/stock/template-*`? Atualizar para local
- ✅ unitLabels embutido? Usar `getUnitLabel()` function
- ✅ Responsabilidade única? Verificar se arquivo não faz muito

## Benefícios Conquistados

| Aspecto | Antes | Depois |
|---------|-------|--------|
| Localização de unitLabels | 4 arquivos | 1 arquivo |
| Localização de tipos | Espalhado | `types/` centralizado |
| Localização de utils | Inexistente | `utils/` centralizado |
| Localização de componentes | `/components/stock/` | `/assets/templates/components/` |
| Arquivos não utilizados | 1 (template-detail-modal) | 0 |
| Duplicação de código | Alta | Baixa |
| Testabilidade | Baixa | Alta |
| Manutenibilidade | Difícil | Fácil |
| Conformidade SOLID | Baixa | Alta |

