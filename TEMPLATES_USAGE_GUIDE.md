# Guia de Uso - Módulo Templates Reorganizado

## Resumo Rápido

O módulo de templates foi reorganizado para melhor aderência aos princípios SOLID. Agora segue este padrão:

```
templates/
├── components/      → Componentes React
├── constants/       → Valores constantes (unitLabels)
├── types/          → Interfaces TypeScript
├── utils/          → Funções puras e reutilizáveis
├── page.tsx        → Listagem
└── [id]/page.tsx   → Detalhes
```

## Importações Corretas

### ✅ Para Usar TemplateViewer

```typescript
// Em page.tsx ou outro arquivo dentro de /templates
import { TemplateViewer } from './components';

// Em arquivo fora de /templates (ex: multi-view-modal.tsx)
import { TemplateViewer } from '@/app/(dashboard)/stock/assets/templates/components';

// Usar
<TemplateViewer 
  template={template}
  showEditButton={true}
  onSave={handleSave}
/>
```

### ✅ Para Usar getUnitLabel

```typescript
// Em page.tsx ou template-viewer.tsx
import { getUnitLabel } from './constants';

// Usar
const label = getUnitLabel(template.unitOfMeasure);
// Resultado: "Unidades", "Quilogramas", etc.
```

### ✅ Para Usar Utils

```typescript
// Em page.tsx
import { countTemplateAttributes, formatTemplateInfo } from './utils';

// Usar
const info = formatTemplateInfo(template);
// Resultado: { attributesCount: 5, hasCareInstructions: true, subtitle: '...' }
```

### ✅ Para Usar Types

```typescript
// Em template-viewer.tsx ou components
import type { TemplateViewerProps } from '../types';

// Usar
export function TemplateViewer(props: TemplateViewerProps) { ... }
```

## Não Fazer (❌ Antigos Padrões)

```typescript
// ❌ NÃO importar de /components/stock
import { TemplateViewer } from '@/components/stock/template-viewer';

// ❌ NÃO definir unitLabels localmente
const unitLabels: Record<string, string> = {
  UNITS: 'Unidades',
  // ... etc
};

// ❌ NÃO usar type UnitOfMeasure com apenas 3 valores
export type UnitOfMeasure = 'UNITS' | 'KILOGRAMS' | 'METERS';
```

## Casos de Uso Comuns

### 1. Exibir Lista de Templates

```typescript
import { TemplateViewer } from './components';
import { getUnitLabel } from './constants';
import { countTemplateAttributes } from './utils';

export function TemplatesPage() {
  return (
    <div>
      {templates.map(template => (
        <Card key={template.id}>
          <h3>{template.name}</h3>
          <p>Unit: {getUnitLabel(template.unitOfMeasure)}</p>
          <p>Attributes: {countTemplateAttributes(template)}</p>
        </Card>
      ))}
    </div>
  );
}
```

### 2. Editar Template

```typescript
import { TemplateViewer } from './components';

export function TemplateDetailPage({ templateId }: { templateId: string }) {
  const [template] = useQuery(/* ... */);
  
  return (
    <TemplateViewer
      template={template}
      showEditButton={true}
      onSave={async (data) => {
        await api.updateTemplate(templateId, data);
      }}
    />
  );
}
```

### 3. Validar Template

```typescript
import { isValidTemplate } from './utils';

const template = await api.getTemplate(id);
if (!isValidTemplate(template)) {
  toast.error('Template inválido');
  return;
}
```

### 4. Verificar Atributos de Cuidados

```typescript
import { hasCareInstructions } from './utils';

if (hasCareInstructions(template)) {
  showCareInstructionsSection(template.careInstructions);
}
```

### 5. Formatar Info para Exibição

```typescript
import { formatTemplateInfo } from './utils';

const info = formatTemplateInfo(template);
// Resultado:
// {
//   attributesCount: 5,
//   hasCareInstructions: true,
//   subtitle: "5 atributos definidos com cuidados"
// }

return <p>{info.subtitle}</p>;
```

## Adicionando Novas Funcionalidades

### Adicionar Nova Unidade de Medida

1. Atualizar `src/types/stock.ts`:
```typescript
export type UnitOfMeasure = 
  | '...' 
  | 'MEU_NOVO_UNIT';  // ← Adicionar aqui
```

2. Adicionar label em `constants/unit-labels.ts`:
```typescript
export const UNIT_LABELS: Record<UnitOfMeasure, string> = {
  // ... existentes
  MEU_NOVO_UNIT: 'Meu Novo Unit',
};
```

3. Pronto! Usa `getUnitLabel('MEU_NOVO_UNIT')` em qualquer lugar

### Adicionar Nova Função Utilitária

1. Criar em `utils/template.utils.ts`:
```typescript
export function minhaNovaFuncao(template: Template): boolean {
  return template.name.length > 10;
}
```

2. Exportar em `utils/index.ts`:
```typescript
export { minhaNovaFuncao };
```

3. Usar em qualquer lugar:
```typescript
import { minhaNovaFuncao } from './utils';
const result = minhaNovaFuncao(template);
```

### Adicionar Nova Prop ao TemplateViewer

1. Atualizar interface em `types/templates.types.ts`:
```typescript
export interface TemplateViewerProps {
  template: Template;
  showHeader?: boolean;
  showEditButton?: boolean;
  minhaNovaProps?: boolean;  // ← Adicionar
}
```

2. Usar no componente `components/template-viewer.tsx`:
```typescript
export function TemplateViewer({
  template,
  showHeader = false,
  showEditButton = false,
  minhaNovaProps = false,  // ← Receber
}: TemplateViewerProps) {
  // Usar minhaNovaProps
}
```

3. Usar no page:
```typescript
<TemplateViewer
  template={template}
  minhaNovaProps={true}
/>
```

## Estrutura de Arquivos por Responsabilidade

### components/ - Componentes React (Renderização)
- ✅ Renderizar UI
- ✅ Gerenciar estado local (useState)
- ✅ Receber props tipadas
- ✅ Emitir eventos
- ❌ Chamar API
- ❌ Lógica complexa de negócio
- ❌ Importar muitos tipos

**Exemplo:** `template-viewer.tsx`

### constants/ - Valores Constantes
- ✅ Exportar valores fixos
- ✅ Fornecer funções getter
- ✅ Mapear enums para strings
- ❌ Fazer cálculos
- ❌ Importar componentes
- ❌ Ter lógica complexa

**Exemplo:** `unit-labels.ts`

### types/ - Interfaces e Types
- ✅ Definir interfaces
- ✅ Definir types
- ✅ Extend tipos existentes
- ❌ Ter implementações
- ❌ Ter valores
- ❌ Ser executável

**Exemplo:** `templates.types.ts`

### utils/ - Funções Puras
- ✅ Funções puras (mesmo input → mesmo output)
- ✅ Transformações de dados
- ✅ Validações
- ✅ Reutilizável
- ❌ React hooks
- ❌ Renderizar
- ❌ Chamar API

**Exemplo:** `template.utils.ts`

## Testes

Para testar as funções utilitárias:

```typescript
import { 
  countTemplateAttributes,
  hasCareInstructions,
  isValidTemplate,
  cleanTemplateData
} from './utils';

describe('Template Utils', () => {
  it('countTemplateAttributes deve contar corretamente', () => {
    const template = {
      productAttributes: { attr1: {}, attr2: {} },
      variantAttributes: { var1: {} },
      itemAttributes: {},
    };
    expect(countTemplateAttributes(template as any)).toBe(3);
  });

  it('isValidTemplate deve validar corretamente', () => {
    expect(isValidTemplate(validTemplate)).toBe(true);
    expect(isValidTemplate(invalidTemplate)).toBe(false);
  });
});
```

## Troubleshooting

### ❌ "Cannot find module '@/components/stock/template-viewer'"
```
Solução: Use './components' se estiver dentro de /templates
         Ou '@/app/(dashboard)/stock/assets/templates/components'
```

### ❌ "unitLabels is not defined"
```
Solução: Import getUnitLabel de './constants'
         Use getUnitLabel(unit) em vez de unitLabels[unit]
```

### ❌ "Type 'string' is not assignable to type 'UnitOfMeasure'"
```
Solução: Certifique-se que UnitOfMeasure em stock.ts inclui 31 valores
         Ou use 'as UnitOfMeasure' se tiver certeza do valor
```

### ❌ "Circular dependency detected"
```
Solução: Evite imports entre components/utils/constants sem necessidade
         Use apenas imports unidirecionais
```

## Checklist Final

- ✅ Todos os imports foram atualizados?
- ✅ `unitLabels` foi removido do page.tsx?
- ✅ Arquivos antigos em `/components/stock/template-*` foram deletados?
- ✅ Build compila sem erros?
- ✅ TypeScript sem warnings?
- ✅ ESLint sem problemas?

## Dúvidas?

Consulte os documentos:
- `TEMPLATES_REORGANIZATION_SUMMARY.md` - O que mudou
- `TEMPLATES_STRUCTURE_GUIDE.md` - Como está organizado
- Este arquivo - Como usar

