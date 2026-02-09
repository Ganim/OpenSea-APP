# ALTA: Reforcar ESLint e Eliminar `any` Types

**Status**: Regras criticas desligadas, 20+ `any` types
**Meta**: ESLint strict, zero `any` em componentes principais
**Esforco**: ~8h

---

## Problema

O `eslint.config.mjs` desabilita regras importantes:

- `@typescript-eslint/no-explicit-any: off` - permite `any` sem restricao
- `react-hooks/exhaustive-deps: off` - deps faltando em useEffect causa bugs
- `jsx-a11y/alt-text: off` - imagens sem alt text
- `@typescript-eslint/no-unused-vars: off` - variaveis nao usadas acumulam

## Plano de Acao

### Passo 1: Audit de `any` types (~1h)

```bash
# Contar ocorrencias
grep -rn ": any" src/ --include="*.ts" --include="*.tsx" | grep -v node_modules | grep -v ".spec." | wc -l
grep -rn "as any" src/ --include="*.ts" --include="*.tsx" | grep -v node_modules | wc -l
```

Arquivos conhecidos com `any`:

- `src/core/forms/components/entity-form.tsx` (~15 ocorrencias)
- `src/contexts/auth-context.tsx`
- `src/lib/api-client.ts`
- `src/types/stock.ts` (tem `eslint-disable no-explicit-any`)

### Passo 2: Corrigir `any` types (~4h)

#### entity-form.tsx (prioridade 1)

```typescript
// ANTES:
const control = useForm({ ... }) as any;
(field as any).onChange(value);

// DEPOIS:
// Usar generics corretamente:
const control = useForm<T>({ ... });
// Usar type narrowing:
if ('onChange' in field) field.onChange(value);
```

Patterns comuns de correcao:

| Pattern `any`            | Correcao                                               |
| ------------------------ | ------------------------------------------------------ |
| `(error as any).message` | `(error as Error).message` ou type guard               |
| `data as any`            | `data as ProductFormData` (tipo correto)               |
| `field as any`           | Generic constraint `T extends Record<string, unknown>` |
| `Record<string, any>`    | `Record<string, unknown>`                              |
| `(...args: any[])`       | `(...args: unknown[])`                                 |

#### auth-context.tsx

```typescript
// ANTES:
(userError as Error & { status?: number }).status

// DEPOIS:
interface ApiErrorLike { status?: number; message?: string }
function isApiError(e: unknown): e is ApiErrorLike { ... }
```

#### api-client.ts

```typescript
// ANTES:
catch (error: any) { ... }

// DEPOIS:
catch (error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown error';
}
```

### Passo 3: Habilitar regras ESLint gradualmente (~2h)

**Fase A - Warnings (sem quebrar CI):**

```javascript
// eslint.config.mjs
rules: {
  '@typescript-eslint/no-explicit-any': 'warn',      // warn primeiro
  '@typescript-eslint/no-unused-vars': 'warn',
  'react-hooks/exhaustive-deps': 'warn',
  'jsx-a11y/alt-text': 'warn',
}
```

**Fase B - Errors (apos corrigir warnings):**

```javascript
rules: {
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/no-unused-vars': ['error', {
    argsIgnorePattern: '^_',
    varsIgnorePattern: '^_',
  }],
  'react-hooks/exhaustive-deps': 'error',
  'jsx-a11y/alt-text': 'error',
}
```

### Passo 4: Configurar pre-commit hook (~1h)

```bash
# Instalar husky + lint-staged
npm install --save-dev husky lint-staged

# Configurar package.json:
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{css,json,md}": ["prettier --write"]
  }
}
```

Isso garante que novos commits sempre passem pelo lint.

## Regras a MANTER desligadas

Estas regras devem continuar off por serem do React Compiler e nao aplicaveis:

- `react-hooks/incompatible-library` - falsos positivos
- `react-hooks/set-state-in-effect` - patterns legitimos no projeto
- `react-hooks/purity` - muito restritivo para o uso atual
- `react-hooks/immutability` - idem
- `react-hooks/preserve-manual-memoization` - idem

## Checklist

- [ ] Zero `any` em api-client.ts
- [ ] Zero `any` em auth-context.tsx
- [ ] < 5 `any` em entity-form.tsx (com justificativa)
- [ ] `no-explicit-any: warn` habilitado
- [ ] `exhaustive-deps: warn` habilitado
- [ ] `no-unused-vars: warn` habilitado
- [ ] Pre-commit hook configurado (husky + lint-staged)
