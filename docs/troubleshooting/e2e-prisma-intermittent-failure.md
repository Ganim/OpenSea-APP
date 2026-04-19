# E2E tests failing intermittently (Prisma 7 + PrismaPg schema isolation)

**Sintoma:** `prisma db push` falha intermitentemente ao criar schemas isolados pra testes E2E. Erro típico:

```
P1014: The underlying table for model 'volumes' does not exist
```

**Impacto histórico:** 79 de 81 E2E test files afetados — só `health-check` passava consistentemente.

Este bug é **blocking** para validação E2E e aparece/desaparece sem padrão claro. Está no backlog ativo (`memory/active_work.md`) para fix dedicado.

---

## Setup atual

- `prisma/vitest-setup-e2e.ts` cria schema único por test file
- Roda `prisma db push --accept-data-loss` para criar tabelas
- Executa os testes contra aquele schema
- Dropa o schema no teardown

## Causa raiz conhecida

1. `prisma db push` **succeeds** e cria 262 tables no test schema.
2. Verification query confirma (`Tenants table exists: true`).
3. **Mas** o singleton Prisma client em `src/lib/prisma.ts` não conecta ao test schema.
4. O `PrismaPg` driver adapter recebe o schema via option `{ schema }`, mas **não usa de forma confiável**.

**Por que é intermitente:** às vezes o adapter pega o schema (tests pass), às vezes cai no `public` (tests fail com "table does not exist").

---

## Abordagens já tentadas (todas falharam)

| Abordagem                                    | Resultado                                  |
| -------------------------------------------- | ------------------------------------------ |
| `PrismaPg({ connectionString }, { schema })` | Tables existem mas adapter às vezes ignora |
| `pg.Pool` com `options: { search_path }`     | TypeError — não suportado pelo pg driver   |
| Pool `connect` event com `SET search_path`   | Connection hangs, timeout                  |
| `process.env.DATABASE_URL` com `?schema=xxx` | PrismaPg não honra schema no URL           |

---

## Workarounds que funcionaram temporariamente

Durante a sessão HR fase 5-6 (2026-04-16), 91 E2E tests passaram 100% sem o bug se manifestar. Dois commits acompanharam:

- `9d57bf36` — seed E2E adiciona permissions novas (`hr.contract-templates.*`, `hr.contracts.*`, `hr.salary.*`, `hr.one-on-ones.*`). Admin-test: 1017→1031 perms.
- `baa7183c` — gate `@fastify/rate-limit` + `loginBruteforceGuard` em test env. Resolve HTTP 429 em testes que autenticam muitos users.

**Dúvida:** esses fixes RESOLVEM o bug ou só MASCARAM. Precisa investigação dedicada.

---

## Próximas abordagens a testar

1. **Forçar search_path na connection string**
   ```
   postgresql://...?options=-csearch_path%3Dtest_schema
   ```
2. **Custom PrismaPg wrapper** que faz override do schema em toda query.
3. **`prisma migrate deploy`** com shadow database URL configurado.
4. **Rodar em public schema** com transaction-based isolation (BEGIN → test → ROLLBACK).
5. **Downgrade PrismaPg** para versão que trata schema option corretamente.
6. **Abrir issue no Prisma GitHub** — pode ser bug conhecido em 7.4.0.

---

## Arquivos-chave

- `prisma/vitest-setup-e2e.ts` — setup E2E (cria schema, db push)
- `src/lib/prisma.ts` — singleton Prisma client (extrai schema do URL)
- `vitest.e2e.config.ts` — config E2E vitest

---

## Diagnóstico em nova sessão

Se os E2E estão falhando:

1. Rodar 1 test file isolado: `npm run test:e2e -- tests/e2e/stock/list-products.spec.ts`. Se passar, o bug pode estar mascarado.
2. Rodar 3-5 test files em paralelo. Se falhar em alguns, é o bug de schema isolation.
3. Verificar logs do setup E2E — o `db push` está succeeding? O schema está sendo criado?
4. `SELECT current_schema()` no client Prisma — está retornando test schema ou `public`?

Se o sintoma mudar significativamente do descrito acima, atualizar este doc com os novos dados.
