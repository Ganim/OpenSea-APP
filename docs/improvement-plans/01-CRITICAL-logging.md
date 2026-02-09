# CRITICO: Remover console.log e Padronizar Logging

**Status**: 15+ console.log em api-client.ts, outros em use-queue-printing.ts, studio-pdf-renderer.ts
**Meta**: Zero console.log em producao
**Esforco**: ~2-3h

---

## Problema

`console.log` em producao:

- Polui o devtools do browser
- Expoe informacoes internas (tokens, responses)
- Dificulta debugging real (noise)

## Logger Existente

O projeto ja tem um logger em `src/lib/logger.ts` que respeita NODE_ENV.
Basta substituir os `console.log` por chamadas ao logger.

## Plano de Acao

### Passo 1: Mapear todos os console.log (~30min)

```bash
# Encontrar todos os console.log no src/
grep -rn "console\.\(log\|warn\|error\|debug\|info\)" src/ --include="*.ts" --include="*.tsx" | grep -v node_modules | grep -v ".spec." | grep -v ".test."
```

Arquivos conhecidos:

- `src/lib/api-client.ts` (~15 ocorrencias)
- `src/core/print-queue/hooks/use-queue-printing.ts`
- `src/core/print-queue/utils/studio-pdf-renderer.ts`
- `src/app/(dashboard)/stock/manufacturers/page.tsx` (linhas 85, 95-97, 101, 111)
- `src/app/(dashboard)/stock/products/page.tsx` (linha 246)

### Passo 2: Substituir por logger (~1h)

**Regras de substituicao:**

| Antes                              | Depois                            | Quando               |
| ---------------------------------- | --------------------------------- | -------------------- |
| `console.log('[X] info:', data)`   | `logger.debug('[X] info:', data)` | Debugging temporario |
| `console.error('[X] error:', err)` | `logger.error('[X] error:', err)` | Erros reais          |
| `console.warn('[X] warning')`      | `logger.warn('[X] warning')`      | Avisos               |
| `console.log('TODO:', ...)`        | Remover completamente             | TODOs esquecidos     |

**api-client.ts** - substituir todas as chamadas:

```typescript
// ANTES:
console.log('[ApiClient] Token refreshed successfully');

// DEPOIS:
logger.debug('[ApiClient] Token refreshed successfully');
```

**manufacturers/page.tsx** - remover logs de debug:

```typescript
// REMOVER:
console.log('[Manufacturers] API response:', response);
console.log(
  '[Manufacturers] Total manufacturers (after filter):',
  manufacturers.length
);
console.log('[Manufacturers CRUD] Delete success callback for ID:', id);
```

**products/page.tsx** - remover TODO log:

```typescript
// REMOVER ou converter:
console.log('Move item:', item); // TODO: Implement
```

### Passo 3: Adicionar regra ESLint (~30min)

Adicionar ao `eslint.config.mjs`:

```javascript
rules: {
  'no-console': ['warn', { allow: ['warn', 'error'] }],
  // ... existing rules
}
```

Isso gera warnings para novos `console.log` mas permite `console.warn` e `console.error`.

### Passo 4: Verificar logger.ts (~30min)

Confirmar que `src/lib/logger.ts`:

- [ ] `logger.debug()` so imprime em development
- [ ] `logger.error()` imprime sempre (para monitoramento)
- [ ] `logger.warn()` imprime em dev + staging
- [ ] Nao imprime stack traces de erro inteiros em producao
- [ ] TODO: Integrar com Sentry (ja tem comment no codigo)

## Checklist

- [x] Zero `console.log` em `src/` (exceto em testes e logger.ts)
- [x] `no-console: warn` no ESLint
- [x] Logger respeita NODE_ENV
- [x] CI nao tem warnings de console.log
- [x] 246 console statements substituidos/removidos em 89 arquivos
- [x] `eslint-disable no-console` apenas em `logger.ts` (unico ponto de saida)
- [x] Lint, TypeScript e Prettier passam sem erros
