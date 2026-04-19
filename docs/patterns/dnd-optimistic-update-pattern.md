# DnD Optimistic Update Pattern

**Status:** Vivo. Padrão definitivo pra drag-and-drop com optimistic update no OpenSea.

Combina a receita geral (tasks, calendar) com os 6 fixes específicos que tornaram o Kanban estável.

---

## O Problema: Snap-Back após Drop

Quando uma mutation do TanStack Query tem `onSettled` ou `onSuccess` que chama `invalidateQueries`, o React Query faz refetch da lista. Se o backend retorna dados "stale" — mesmo que o DB esteja correto — o refetch sobrescreve o optimistic update com dados antigos, fazendo o item "voltar" à posição original.

**Sintoma:** primeiro drag funciona, drags seguintes falham (snap-back).

**Causa raiz:** o refetch retorna dados stale que sobrescrevem o cache otimista. Consistente nesse projeto (possível issue de connection pooling, read replica, ou timing do Prisma).

---

## A Regra de Ouro

> **Nunca** use `onSettled` nem `onSuccess` com `invalidateQueries`/`refetchQueries` em hooks que têm `onMutate` com optimistic update. O optimistic update **é** a fonte de verdade. O DB persiste corretamente (confirmado por F5).

---

## Estrutura Correta de um Hook DnD

```typescript
export function useMoveCard(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ cardId, data }) => cardsService.move(boardId, cardId, data),

    // 1. ANTES da mutation: atualiza cache otimisticamente
    onMutate: async ({ cardId, data }) => {
      await qc.cancelQueries({ queryKey: CARD_QUERY_KEYS.CARDS(boardId) });

      const previousQueries = qc.getQueriesData<CardsResponse>({
        queryKey: CARD_QUERY_KEYS.CARDS(boardId),
      });

      qc.setQueriesData<CardsResponse>(
        { queryKey: CARD_QUERY_KEYS.CARDS(boardId) },
        old => {
          if (!old?.cards) return old; // GUARD CRÍTICO (ver abaixo)
          // lógica de atualização...
          return { ...old, cards: updatedCards };
        }
      );

      return { previousQueries };
    },

    // 2. EM CASO DE ERRO: rollback
    onError: (_, __, context) => {
      if (context?.previousQueries) {
        for (const [key, data] of context.previousQueries) {
          qc.setQueryData(key, data);
        }
      }
    },

    // 3. SEM onSettled/onSuccess com invalidation
    // ❌ onSettled: () => qc.invalidateQueries(...)  — CAUSA SNAP-BACK
    // ❌ onSuccess: () => qc.invalidateQueries(...)  — CAUSA SNAP-BACK
  });
}
```

---

## Guard Crítico: `if (!old?.cards)`

`setQueriesData` com query key como `['task-cards', boardId]` faz **prefix matching** — encontra TODAS as queries que começam com essa key:

- `['task-cards', boardId, { limit: 100 }]` → tem `.cards` ✅
- `['task-cards', boardId]` → pode não ter `.cards` ❌

Sem guard, o callback recebe `old` sem `.cards` e crasha em `old.cards.find(...)`.

```typescript
// ❌ ERRADO — crasha
old => {
  if (!old) return old;
  const cards = old.cards; // TypeError!
};

// ✅ CORRETO
old => {
  if (!old?.cards) return old;
  // seguro acessar old.cards
};
```

Aplicar em **todos** os hooks com `setQueriesData`: `useMoveCard`, `useUpdateCard`, `useDeleteCard`, `useUpdateCalendarEvent`, `useDeleteCalendarEvent`, etc.

---

## Hooks Corrigidos (referência)

### Tasks (Kanban/Calendar/List)

| Hook                | Arquivo                      | Fix                                                       |
| ------------------- | ---------------------------- | --------------------------------------------------------- |
| `useMoveCard`       | `hooks/tasks/use-cards.ts`   | Removido `onSettled`, guard `!old?.cards`                 |
| `useUpdateCard`     | `hooks/tasks/use-cards.ts`   | Removido `onSettled`, guard `!old?.cards`                 |
| `useDeleteCard`     | `hooks/tasks/use-cards.ts`   | Guard `!old?.cards`                                       |
| `useUpdateColumn`   | `hooks/tasks/use-columns.ts` | `onMutate` + `onError`, removido `onSuccess` invalidation |
| `useDeleteColumn`   | `hooks/tasks/use-columns.ts` | `onMutate` + `onError`, `onSettled` só para cards query   |
| `useReorderColumns` | `hooks/tasks/use-columns.ts` | Removido `onSettled`                                      |

### Calendar

| Hook                     | Arquivo                                 | Fix                  |
| ------------------------ | --------------------------------------- | -------------------- |
| `useUpdateCalendarEvent` | `hooks/calendar/use-calendar-events.ts` | Removido `onSettled` |
| `useDeleteCalendarEvent` | `hooks/calendar/use-calendar-events.ts` | Removido `onSettled` |

`useCreateCalendarEvent` **mantém** `onSettled` porque cria evento temporário com `id: temp-${Date.now()}` que precisa ser substituído pelo ID real do servidor.

---

## Backend: Reindex após Move

O backend faz `reindexColumnPositions` após cada move para evitar gaps/duplicatas:

```typescript
async reindexColumnPositions(columnId: string): Promise<void> {
  const cards = await prisma.card.findMany({
    where: { columnId, deletedAt: null },
    orderBy: [
      { position: 'asc' },
      { updatedAt: 'desc' }, // tiebreaker para posições iguais
    ],
    select: { id: true },
  });
  if (cards.length === 0) return;
  await prisma.$transaction(
    cards.map((card, index) =>
      prisma.card.update({
        where: { id: card.id },
        data: { position: index },
      }),
    ),
  );
}
```

O `updatedAt: 'desc'` garante que o card recém-movido tem prioridade quando dois cards têm a mesma posição.

---

## Frontend: Splice-and-Reindex (Move Card)

Optimistic update para mover cards entre colunas:

```typescript
onMutate: async ({ cardId, data }) => {
  const srcColumnId = movedCard.columnId;
  const dstColumnId = data.columnId;
  const dstPosition = data.position;

  const srcCards = cards
    .filter(c => c.columnId === srcColumnId && c.id !== cardId)
    .sort((a, b) => a.position - b.position);

  const dstCards =
    srcColumnId === dstColumnId
      ? srcCards
      : cards
          .filter(c => c.columnId === dstColumnId && c.id !== cardId)
          .sort((a, b) => a.position - b.position);

  const updatedCard = {
    ...movedCard,
    columnId: dstColumnId,
    position: dstPosition,
  };
  dstCards.splice(dstPosition, 0, updatedCard);

  const positionMap = new Map();
  srcCards.forEach((c, i) =>
    positionMap.set(c.id, { columnId: srcColumnId, position: i })
  );
  dstCards.forEach((c, i) =>
    positionMap.set(c.id, { columnId: dstColumnId, position: i })
  );

  return {
    ...old,
    cards: cards.map(c => {
      const update = positionMap.get(c.id);
      return update ? { ...c, ...update } : c;
    }),
  };
};
```

---

## Kanban: 6 Root Causes Found & Fixed (histórico Mar 2026)

Durante a estabilização do Kanban (após várias tentativas), estas 6 causas foram identificadas e corrigidas. Serve de checklist pra debugging futuro:

1. **useEffect sync loop** — substituído por pattern `optimisticCards ?? cards`.
2. **Async onMutate** — criado `useMoveCardLocal` (fire-and-forget, sem onMutate).
3. **Cache flash** — `qc.setQueriesData` para escrever optimistic state no cache RQ.
4. **Empty column detection** — `multiContainerCollision` + `useDroppable` por coluna.
5. **React 19 batching stale ref** — `latestOptimisticRef` atualizado **dentro** do callback `setOptimisticCards(prev => ...)`.
6. **Visual snap-back após drop** — causa: `setOptimisticCards(null)` em `handleDragEnd` dispara re-render do child **antes** do parent receber cache atualizado do TanStack Query. Fix: manter optimistic state vivo, limpar só após `qc.refetchQueries()` resolver no `onSettled` por-mutação.

### Pattern do Fix #6

```typescript
// NÃO limpar optimistic state imediatamente em handleDragEnd.
// Em vez disso: manter vivo e limpar após refetch concluir.
moveCard.mutate(
  { cardId, data: { columnId, position } },
  {
    onSettled: () => {
      qc.refetchQueries({ queryKey: CARD_QUERY_KEYS.CARDS(boardId) }).then(
        () => {
          setOptimisticCards(null);
          latestOptimisticRef.current = null;
        }
      );
    },
  }
);
```

### Arquitetura Kanban (referência)

- `handleDragStart` → snapshot `displayCards` para optimistic state + ref.
- `handleDragOver` → move card entre colunas via `setOptimisticCards(prev => ...)`, atualiza `latestOptimisticRef` **dentro** do callback (sobrevive ao batching do React).
- `handleDragEnd` → monta array final, mantém optimistic state vivo, dispara mutation, limpa após refetch.
- `handleDragCancel` → limpa tudo imediatamente (revert).
- Column reorder usa mesmo pattern: `setOptimisticColumns` vivo até board refetch.

### Arquivos envolvidos

- `kanban-view.tsx` — lógica DnD inteira.
- `use-cards.ts` — hook `useMoveCardLocal` (fire-and-forget).

### Validação (Playwright)

- Cross-column card move ✅ (sem snap-back)
- Move to empty column ✅
- Server persistence ✅ (API retorna 200, dados corretos após reload)

---

## Checklist — Novos Hooks DnD

1. [ ] `onMutate` com `cancelQueries` + save previous + optimistic update
2. [ ] Guard `if (!old?.entities)` no callback do `setQueriesData`
3. [ ] `onError` com rollback do estado anterior
4. [ ] **Sem** `onSettled`/`onSuccess` com `invalidateQueries`
5. [ ] Backend faz reindex atômico (Prisma `$transaction`) após cada operação
6. [ ] Tiebreaker (`updatedAt: 'desc'`) no `orderBy` do reindex

---

## Quando MANTER invalidation

- `useCreateColumn` / `useCreateCard` — sem optimistic update (ID vem do servidor)
- `useCreateCalendarEvent` — cria com ID temp, precisa refetch pra ID real
- `useDeleteColumn.onSettled` — só invalida query de CARDS (query de BOARD já tem optimistic)
- Hooks sem `onMutate` (share, unshare, etc.) — sem optimistic, dependem de refetch

---

## Toast Pattern no DnD

- **Sucesso:** sem toast — a atualização visual imediata (optimistic) é feedback suficiente.
- **Erro:** `toast.error('Mensagem descritiva')` + rollback automático via `onError`.
