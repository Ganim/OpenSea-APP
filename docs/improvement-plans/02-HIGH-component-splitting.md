# ALTA: Quebrar Componentes Grandes

**Status**: entity-form.tsx (653 linhas), api-client.ts (465 linhas), stock.ts (1.721 linhas)
**Meta**: Nenhum arquivo com mais de 300 linhas (exceto types)
**Esforco**: ~6h

---

## Problema

Componentes muito grandes sao dificeis de:

- Navegar e entender
- Testar unitariamente
- Manter sem conflitos de merge
- Memoizar corretamente

## Plano de Acao

### 1. entity-form.tsx (653 linhas -> ~4 arquivos) - 2h

**Estrutura proposta:**

```
src/core/forms/components/
  entity-form.tsx              (principal - ~150 linhas)
  entity-form-field.tsx        (renderizacao de campos - ~120 linhas)
  entity-form-section.tsx      (renderizacao de secoes - ~80 linhas)
  entity-form-tabs.tsx         (gerenciamento de tabs - ~80 linhas)
  entity-form-validation.ts   (logica de validacao - ~60 linhas)
  entity-form.types.ts         (interfaces e types - ~80 linhas)
```

**Passos:**

1. Extrair `EntityFormField` - componente puro que renderiza um campo
2. Extrair `EntityFormSection` - renderiza um grupo de campos
3. Extrair `EntityFormTabs` - gerencia navegacao entre tabs
4. Extrair `validateForm()` - funcao pura de validacao
5. Mover types para arquivo separado
6. `entity-form.tsx` orquestra os sub-componentes

**Beneficios:**

- `EntityFormField` pode ser memoizado com `React.memo`
- Validacao pode ser testada isoladamente
- Types reutilizaveis em outros forms

### 2. api-client.ts (465 linhas -> ~3 arquivos) - 2h

**Estrutura proposta:**

```
src/lib/
  api-client.ts              (classe principal - ~150 linhas)
  api-client-auth.ts         (token management + refresh - ~120 linhas)
  api-client-error.ts        (error parsing + enrichment - ~80 linhas)
  api-client.types.ts        (interfaces - ~40 linhas)
```

**Passos:**

1. Extrair `TokenManager` - classe para gerenciar tokens
   - `getToken()`, `setToken()`, `clearTokens()`
   - `refreshToken()` com deduplicacao
   - Eventos de mudanca de token
2. Extrair `parseApiError()` - funcao pura de parsing de erros
3. `ApiClient` usa `TokenManager` por composicao

**Beneficios:**

- TokenManager testavel isoladamente
- Error parsing testavel isoladamente
- ApiClient fica mais enxuto

### 3. stock.ts types (1.721 linhas -> ~6 arquivos) - 1h

**Estrutura proposta:**

```
src/types/stock/
  index.ts                   (re-exports)
  product.types.ts           (Product, ProductFormData, etc.)
  variant.types.ts           (Variant, VariantFormData, etc.)
  item.types.ts              (Item, ItemStatus, ItemMovement, etc.)
  warehouse.types.ts         (Warehouse, Zone, Bin, etc.)
  category.types.ts          (Category, Tag, etc.)
  template.types.ts          (Template, LabelTemplate, etc.)
```

**Passos:**

1. Criar diretorio `src/types/stock/`
2. Mover cada grupo de types para seu arquivo
3. Criar `index.ts` com re-exports
4. Atualizar imports (path alias mantem `@/types/stock`)

### 4. Hook Factory para CRUD repetitivo - 1h

Os 16+ hooks de stock repetem o mesmo pattern. Criar factory:

```typescript
// src/hooks/create-crud-hooks.ts
export function createCrudHooks<T>(config: {
  entityName: string;
  queryKey: string;
  service: CrudService<T>;
}) {
  return {
    useList: () => useQuery({ queryKey: [config.queryKey], ... }),
    useGet: (id: string) => useQuery({ queryKey: [config.queryKey, id], ... }),
    useCreate: () => useMutation({ ... }),
    useUpdate: () => useMutation({ ... }),
    useDelete: () => useMutation({ ... }),
  };
}

// Uso:
export const productHooks = createCrudHooks<Product>({
  entityName: 'Product',
  queryKey: 'products',
  service: productsService,
});
```

## Checklist

- [ ] entity-form.tsx < 200 linhas
- [ ] api-client.ts < 200 linhas
- [ ] stock.ts dividido em 6+ arquivos
- [ ] Hook factory criado e usado em pelo menos 3 hooks
- [ ] Todos os imports atualizados
- [ ] Testes passando apos split
