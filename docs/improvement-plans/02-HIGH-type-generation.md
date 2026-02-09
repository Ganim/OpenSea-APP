# ALTA: Auto-Gerar Types do Backend Swagger

**Status**: Types mantidos manualmente em src/types/ (1.721+ linhas em stock.ts)
**Meta**: Types gerados automaticamente do Swagger do backend
**Esforco**: ~4h

---

## Problema

- Types em `src/types/` sao mantidos manualmente
- `stock.ts` tem 1.721 linhas de types manuais
- Risco de drift entre frontend e backend
- Trabalho duplicado a cada nova feature
- Ja existe `npm run api:update` mas usa `swagger-typescript-api` para gerar client, nao types isolados

## Solucao Existente

O projeto ja tem:

```json
"api:update": "npx swagger-typescript-api generate --path ./swagger/swagger.json --output ./swagger/ --name api.ts"
```

Mas gera um client completo, nao types individuais.

## Plano de Acao

### Opcao A: Melhorar o swagger-typescript-api existente (Recomendado)

#### Passo 1: Exportar Swagger do backend (~30min)

```bash
# No backend, gerar swagger.json
cd OpenSea-API
curl http://localhost:3333/docs/json > ../OpenSea-APP/swagger/swagger.json
```

#### Passo 2: Gerar types com separacao (~1h)

Atualizar script para gerar types separados:

```json
{
  "api:types": "npx swagger-typescript-api generate --path ./swagger/swagger.json --output ./src/types/generated/ --name api-types.ts --no-client --type-prefix Api"
}
```

Flags importantes:

- `--no-client` - gera apenas types, sem client HTTP
- `--type-prefix Api` - previne conflito de nomes

#### Passo 3: Mapear types gerados para types locais (~1h)

```typescript
// src/types/stock/product.types.ts
import type {
  ApiProduct,
  ApiCreateProductRequest,
} from '@/types/generated/api-types';

// Re-export com nomes limpos
export type Product = ApiProduct;
export type CreateProductData = ApiCreateProductRequest;

// Extensoes locais (campos calculados, etc.)
export interface ProductWithStats extends Product {
  variantCount?: number; // campo calculado no frontend
}
```

#### Passo 4: Validacao em CI (~30min)

Adicionar ao CI:

```yaml
- name: Validate API types
  run: |
    npm run api:types
    git diff --exit-code src/types/generated/
    # Falha se types gerados mudaram (backend mudou mas frontend nao atualizou)
```

### Opcao B: Usar openapi-typescript (alternativa mais leve)

```bash
npm install -D openapi-typescript
```

```json
{
  "api:types": "npx openapi-typescript ./swagger/swagger.json -o ./src/types/generated/api.d.ts"
}
```

Gera types nativos TypeScript sem runtime, muito leve.

### Passo 5: Workflow de atualizacao (~1h)

```
1. Backend faz mudanca no schema
2. Backend roda `npm run build` (gera Swagger atualizado)
3. Frontend copia swagger.json
4. Frontend roda `npm run api:types`
5. Frontend ajusta tipos locais se necessario
6. CI valida que tudo esta sincronizado
```

**Script de automacao:**

```json
{
  "api:sync": "curl -s http://localhost:3333/docs/json > swagger/swagger.json && npm run api:types && echo 'Types updated!'"
}
```

## Consideracoes

- NAO remover types locais imediatamente - manter como wrapper
- Types gerados sao read-only (nao editar manualmente)
- Campos calculados no frontend ficam em types locais que extendem os gerados
- Enums podem precisar de mapeamento manual (backend pode usar strings, frontend pode querer enum)

## Checklist

- [ ] Swagger JSON exportado do backend
- [ ] Script `api:types` gerando types automaticamente
- [ ] Types locais importando dos gerados
- [ ] CI validando sincronia
- [ ] Documentacao do workflow atualizada
