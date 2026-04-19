# Criando uma Nova Listing Page

**Skill dedicada:** `new-page` (invocar via `/new-page` ou Skill tool). Este doc explica o layout e os patterns que a skill produz — útil para entender **o que** cada peça faz.

---

## Anatomia de uma listing page canônica

```
OpenSea-APP/src/app/(dashboard)/(modules)/<mod>/<entity>/
├── page.tsx                      (rota — usa <EntityList>)
├── [id]/
│   ├── page.tsx                  (detail — usa PageLayout + PageActionBar)
│   └── edit/
│       └── page.tsx              (edit — usa PageLayout + PageActionBar + Form Card)
└── src/
    ├── components/
    │   ├── <entity>-grid.tsx     (EntityGrid específico)
    │   ├── create-<entity>-wizard.tsx   (StepWizardDialog)
    │   └── <entity>-row.tsx      (opcional, se custom)
    ├── hooks/
    │   └── use-<entity>s.ts      (useInfiniteQuery + filters)
    ├── services/
    │   └── <entity>s.service.ts  (fetch wrappers)
    └── types/
        └── <entity>.types.ts     (types frontend espelhando Zod backend)
```

---

## Regras inegociáveis (golden rules)

Estas **bloqueiam** merge. Origem: `guides/developer-golden-rules.md` e `patterns/frontend-patterns.md`.

1. **`useInfiniteQuery`** — nunca `useQuery` para listagens. Nunca paginação tradicional.
2. **`EntityGrid`** com filtros em `toolbarStart` — nunca Card separado com filtros acima.
3. **Destrutivas usam `VerifyActionPinModal`** — nunca `confirm()` ou `ConfirmDialog`.
4. **Permissão por visibilidade** — esconder elementos sem permissão (nunca disable).
5. **Navegar para `/entity/[id]`** ao clicar no item — sem modal de view.
6. **Edit page:** `PageLayout > PageActionBar (Delete+Save) > Identity Card > Form Card`.
7. **Cor destrutiva = Rose** (`-600`) — não Red.
8. **Context menu order:** Base (View, Edit) | Custom (Rename, Duplicate) | Destructive (Delete).
9. **Wizard modal para create/edit** — nunca página `/new` standalone.
10. **Textos em português formal com acentuação.** Loading = `GridLoading`, error = `GridError`.

---

## Hook pattern: `useInfiniteQuery`

```ts
export function useWarehouses(filters: WarehouseFilters) {
  return useInfiniteQuery({
    queryKey: WAREHOUSES_KEYS.LIST(filters),
    queryFn: async ({ pageParam = 0 }) => {
      const response = await warehousesService.list({
        ...filters,
        skip: pageParam,
        take: 20,
      });
      return response; // { items, total, nextCursor } — NUNCA `|| []`
    },
    getNextPageParam: last => last.nextCursor,
    initialPageParam: 0,
  });
}
```

**Proibido:** `return response.items || []`. Silent failure (ver troubleshooting/ui-not-refreshing-after-mutation.md §1).

---

## EntityGrid pattern

```tsx
<EntityGrid
  data={warehouses}
  isLoading={isLoading}
  error={error}
  onRowClick={warehouse => router.push(`/stock/warehouses/${warehouse.id}`)}
  toolbarStart={
    <>
      <FilterDropdown label="Status" options={STATUS_OPTIONS} {...} />
      <FilterDropdown label="Tipo" options={TYPE_OPTIONS} {...} />
      <CountBadge count={total} />
    </>
  }
  sentinelRef={sentinelRef}  // IntersectionObserver para infinite scroll
>
  <EntityGrid.Column field="name">Nome</EntityGrid.Column>
  <EntityGrid.Column field="type">Tipo</EntityGrid.Column>
  <EntityGrid.ContextMenu>
    <ContextMenuItem icon={Eye} onClick={handleView}>Visualizar</ContextMenuItem>
    <ContextMenuItem icon={Edit} onClick={handleEdit}>Editar</ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuItem icon={Trash} variant="destructive" onClick={handleDelete}>Excluir</ContextMenuItem>
  </EntityGrid.ContextMenu>
</EntityGrid>
```

---

## Create/Edit Wizard

Usar `StepWizardDialog` (linear 2-3 steps) ou `NavigationWizardDialog` (sections):

```tsx
<StepWizardDialog
  open={open}
  onOpenChange={setOpen}
  steps={[
    { label: 'Identificação', component: <StepIdentity form={form} /> },
    { label: 'Detalhes', component: <StepDetails form={form} /> },
    { label: 'Confirmação', component: <StepConfirm values={form.values} /> },
  ]}
  onFinish={values => mutation.mutate(values)}
/>
```

**Proibido:** criar página standalone `/warehouses/new`. Se existe, converter pra wizard modal e apagar a página.

---

## Delete com PIN

```tsx
<VerifyActionPinModal
  open={deleteOpen}
  onOpenChange={setDeleteOpen}
  title={`Excluir armazém ${warehouse.name}`}
  description="Esta ação não pode ser desfeita. Confirme com seu PIN."
  onSuccess={() => deleteMutation.mutate(warehouse.id)}
/>
```

---

## Edit page layout

```tsx
<PageLayout>
  <PageActionBar
    left={<Breadcrumb items={[...]} />}
    right={
      <>
        <Button variant="outline" onClick={handleDelete} className="bg-rose-50 text-rose-700">
          Excluir
        </Button>
        <Button onClick={handleSubmit}>Salvar</Button>
      </>
    }
  />

  <IdentityCard entity={warehouse} />

  <CollapsibleSection icon={Info} title="Dados Gerais" subtitle="Nome, descrição, tipo">
    <FormField name="name" label="Nome" />
    <FormField name="description" label="Descrição" />
    <FormField name="type" label="Tipo" />
  </CollapsibleSection>

  <CollapsibleSection icon={MapPin} title="Localização" subtitle="Endereço e coordenadas">
    ...
  </CollapsibleSection>
</PageLayout>
```

---

## Permission gating

Esconder (não desabilitar) elementos sem permissão:

```tsx
{
  hasPermission('stock.warehouses.register') && (
    <Button onClick={() => setCreateOpen(true)}>Novo Armazém</Button>
  );
}

{
  hasPermission('stock.warehouses.remove') && (
    <ContextMenuItem onClick={handleDelete}>Excluir</ContextMenuItem>
  );
}
```

---

## Textos e acentuação

- "Excluir" (não "Delete")
- "Adicionar" ou "Cadastrar" (não "Create" / "Add")
- "Editar" (não "Edit")
- "Não encontrado" (com til!)
- Todos os labels, placeholders, mensagens: **português formal** com acentuação correta
- Loading: `GridLoading` (padrão). Error: `GridError` com mensagem em PT

---

## data-testid anchors

Obrigatório pra E2E Playwright. Padrão:

```
<entity>-page
<entity>-search
<entity>-filter-<field>
<entity>-count
<entity>-tabs (se houver)
<entity>-grid
<entity>-row-{id}
<entity>-action-edit-{id}
<entity>-action-delete-{id}
```

---

## Fluxo de uso da skill

```
/new-page
↓
Skill pergunta: módulo, nome da entidade, campos principais, filtros
↓
Skill gera: page.tsx, [id]/page.tsx, [id]/edit/page.tsx, hook, wizard, types, service
↓
Você revisa, conecta ao backend (se entity já existe no API), e:
  - npm run dev
  - Valida fluxo: listagem → view → edit → delete → create
  - npm run test:e2e -- tests/e2e/<entity>
↓
Commit atômico:
  feat(<mod>): add <entity> listing page
```

---

## Referências

- `patterns/frontend-patterns.md` — regras completas de código frontend
- `patterns/ux-rules.md` — regras de UX (PIN, wizard, badges, spacing, etc.)
- `patterns/entity-list-layout-pattern.md` — EntityGrid em detalhe
- `patterns/page-layout-pattern.md` — PageLayout + PageActionBar
- `patterns/form-validation-pattern.md` — validação Zod + form
- `patterns/react-query-hooks-pattern.md` — hooks com React Query
- `guides/developer-golden-rules.md` — 20 regras universais
- `guides/navigation-map.md` — rotas e navegação
- `troubleshooting/ui-not-refreshing-after-mutation.md` — bug canônico de hooks
