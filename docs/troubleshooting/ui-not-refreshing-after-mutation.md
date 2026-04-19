# UI não atualiza após mutation (CRUD)

**Sintoma:** usuário cria/edita/deleta um item, a API retorna 200, mas a listagem/detail na tela **não reflete** a mudança. F5 pode ou não resolver. Às vezes a página trava após F5.

Este bug é **sistêmico** no OpenSea. Reporta em múltiplas páginas (products, employees, users, teams, etc.). Se você está encontrando num módulo novo, provavelmente é o mesmo padrão. Este doc lista as causas e a ordem de investigação.

---

## Causas conhecidas (em ordem de frequência)

### 1. `|| []` fallback em `listFn` / `getFn`

**Causa-raiz #1 no projeto.** Quando o token expira, a API retorna um objeto de erro no lugar do shape esperado. Se o hook faz `response.products || []`, o erro vira silenciosamente um array vazio, React Query cacheia esse vazio, e **nunca tenta de novo**. Usuário vê página em branco sem erro.

**Fix:** sempre acessar campos diretamente, deixar o erro propagar.

```ts
// ❌ Silent failure
listFn: async () => (await service.list()).items || [],

// ✅ Error propagates, React Query retries
listFn: async () => {
  const response = await service.list();
  return response.items;
},
```

Ver `patterns/frontend-patterns.md` §1 para detalhes.

### 2. Faltou invalidar query após create/update/delete

Hook de mutation precisa invalidar a listagem para ela refetchar. Se esqueceu, criação aparece só depois de navegar fora e voltar.

```ts
const mutation = useMutation({
  mutationFn: service.create,
  onSuccess: () => {
    qc.invalidateQueries({ queryKey: ENTITY_KEYS.LIST(filters) });
  },
});
```

**Exceção crítica:** se o hook usa `onMutate` com optimistic update (padrão DnD), **não** use `invalidateQueries` em `onSuccess`/`onSettled` — vai causar snap-back. Ver `patterns/dnd-optimistic-update-pattern.md`.

### 3. Upload de foto/arquivo não dispara invalidate da entidade-pai

Sintoma canônico: "foto do funcionário não aparece após upload". O upload endpoint é storage, não HR. Se o hook de upload não invalida a query da entidade-pai, o avatar mostrado não atualiza.

**Fix:** no hook de upload, também invalidar a entidade-pai:

```ts
onSuccess: () => {
  qc.invalidateQueries({ queryKey: STORAGE_KEYS.FILES });
  qc.invalidateQueries({ queryKey: HR_EMPLOYEES.DETAIL(employeeId) }); // ←
},
```

### 4. Subentidade criada mas parent query não re-busca

Ex: "ao adicionar variante, não aparece de imediato". A mutation de criar variante invalida `VARIANTS_LIST`, mas a tela mostra `PRODUCT_DETAIL` que embute variantes inline. A invalidate correta depende de qual query o componente está consumindo.

**Fix:** invalidar TODAS as queries que contêm essa entidade embedded.

```ts
onSuccess: () => {
  qc.invalidateQueries({ queryKey: VARIANTS_KEYS.LIST(productId) });
  qc.invalidateQueries({ queryKey: PRODUCTS_KEYS.DETAIL(productId) }); // ← parent
},
```

### 5. Soft-delete filter ausente no backend

Sintoma: "quantidade mostra registros já deletados". A repository query não filtra `deletedAt: null`.

**Fix no backend:** todo query de listagem precisa `where: { tenantId, deletedAt: null }`. Ver `OpenSea-API/docs/patterns/repository-pattern.md` e `OpenSea-APP/docs/guides/developer-golden-rules.md` rule #4.

### 6. `setQueriesData` sem guard crasha o update

Específico de optimistic update: `setQueriesData` com key prefix encontra TODAS as queries que começam com essa key, inclusive as sem `.cards`/`.items`. Se o callback não tem guard, crasha.

```ts
// ❌ TypeError
old => {
  if (!old) return old;
  return { ...old, cards: old.cards.filter(...) }; // old.cards pode ser undefined
}

// ✅ Guard
old => {
  if (!old?.cards) return old;
  return { ...old, cards: old.cards.filter(...) };
}
```

### 7. Hydration mismatch (Next.js SSR)

Sintoma: F5 dá "interface travada", às vezes deslogado. Diff entre HTML do servidor e render do cliente.

**Diagnóstico:** abrir DevTools Console e procurar `Hydration failed`. Causas comuns:

- `window`, `document`, `navigator` usado fora de `useEffect`
- `Date.now()` ou `Math.random()` no render
- Conteúdo condicional baseado em `localStorage`

**Fix:** guardar com `typeof window !== 'undefined'` ou mover para `useEffect`/`useClientState` hook.

---

## Ordem de investigação recomendada

Quando encontrar UI não atualizando:

1. **Verificar Network tab** — a mutation retornou 200? Se não, é problema backend/auth.
2. **Verificar se há `|| []` ou `|| null`** no `listFn`/`getFn` do hook → causa #1.
3. **Verificar `onSuccess` da mutation** — invalida a query certa? → causa #2.
4. **Verificar se é query embedded** — a tela mostra parent com children inline? → causa #4.
5. **Verificar no backend** — repository filtra `deletedAt: null`? → causa #5.
6. **Se for DnD**, consultar `patterns/dnd-optimistic-update-pattern.md`.
7. **Se F5 quebra/desloga**, é hydration → causa #7.

---

## Bugs históricos resolvidos (referência)

- Products: variante/item não aparecendo após criação → invalidate parent DETAIL
- Employees: foto não aparecendo após upload → invalidate HR_EMPLOYEES.DETAIL
- Admin/Users: Username não atualizando → invalidate USERS.DETAIL
- Admin/Teams: novo membro não aparecendo → invalidate TEAMS.DETAIL
- Kanban: snap-back após drop → `patterns/dnd-optimistic-update-pattern.md`

Se um novo bug de "UI não atualiza" bater nesse padrão, **adicionar aqui** a causa + fix.
