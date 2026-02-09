# BAIXA: Melhorias Extras

**Itens "nice to have" para quando as prioridades maiores estiverem resolvidas**
**Esforco total**: ~20h

---

## 1. Storage Constants (~1h)

### Problema

Magic strings para localStorage keys espalhadas pelo codigo:

```typescript
localStorage.getItem('auth_token');
localStorage.getItem('refresh_token');
localStorage.getItem('selected_tenant_id');
```

### Solucao

```typescript
// src/lib/storage-keys.ts
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  SELECTED_TENANT: 'selected_tenant_id',
  THEME: 'theme',
  CENTRAL_THEME: 'central-theme',
  SAVED_ACCOUNTS: 'saved_accounts',
  SESSION_ID: 'session_id',
} as const;
```

Buscar e substituir em todos os arquivos.

---

## 2. Storybook (~8h)

### Objetivo

Documentar componentes visuais, facilitar desenvolvimento isolado.

### Setup

```bash
npx storybook@latest init --type nextjs
```

### Componentes prioritarios para Storybook

1. `EntityCard` (todas as variantes: grid, list, badges, footer types)
2. `EntityGrid` (grid view, list view, selection states)
3. `EntityForm` (diferentes configs de fields)
4. `Button` (todas as variantes e tamanhos)
5. Glass components (glass-card, glass-button, glass-input)
6. `GridLoading` e `GridError`

### Beneficios

- Design review sem rodar app inteira
- Testes visuais automatizados
- Documentacao viva dos componentes

---

## 3. Optimistic Updates no React Query (~4h)

### Onde aplicar

- Delete de items (remover da lista imediatamente)
- Toggle de status (ativo/inativo)
- Rename (atualizar nome imediatamente)

### Exemplo

```typescript
const deleteProduct = useMutation({
  mutationFn: (id: string) => productsService.deleteProduct(id),
  onMutate: async id => {
    await queryClient.cancelQueries({ queryKey: ['products'] });
    const previous = queryClient.getQueryData(['products']);
    queryClient.setQueryData(['products'], (old: Product[]) =>
      old.filter(p => p.id !== id)
    );
    return { previous };
  },
  onError: (err, id, context) => {
    queryClient.setQueryData(['products'], context?.previous);
    toast.error('Erro ao excluir produto');
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['products'] });
  },
});
```

---

## 4. Error Tracking com Sentry (~2h)

### Estado Atual

Logger.ts ja tem TODOs para Sentry:

```typescript
// TODO: Sentry integration
```

### Setup

```bash
npx @sentry/wizard@latest -i nextjs
```

### Integracao com logger

```typescript
// src/lib/logger.ts
import * as Sentry from '@sentry/nextjs';

export const logger = {
  error(message: string, context?: Record<string, unknown>) {
    console.error(message, context);
    Sentry.captureException(new Error(message), { extra: context });
  },
};
```

---

## 5. PWA / Offline Support (~4h)

### Objetivo

App funciona offline com dados cached.

### Setup

```bash
npm install next-pwa
```

```typescript
// next.config.ts
import withPWA from 'next-pwa';

export default withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
})(nextConfig);
```

### Cache Strategy

- API responses cached com stale-while-revalidate
- Mutations enfileiradas offline, enviadas ao reconectar
- Manifest.json para install prompt

---

## 6. HttpOnly Cookies para Tokens (~3h)

### Problema

JWT em localStorage vulneravel a XSS.

### Solucao

Requer mudanca no backend:

1. Backend seta token como httpOnly cookie
2. Frontend nao acessa token diretamente
3. Cookies enviados automaticamente com requests
4. Refresh via cookie endpoint

### Impacto

- `api-client.ts` nao precisa mais gerenciar Authorization header
- `auth-context.tsx` simplifica (nao monitora localStorage)
- Cross-tab sync funciona nativamente (cookies compartilhados)
- **Requer mudanca significativa no backend**

---

## 7. i18n Basico (~4h)

### Problema

Strings hardcoded em portugues/ingles misturados.

### Opcao Rapida (next-intl)

```bash
npm install next-intl
```

```typescript
// messages/pt-BR.json
{
  "common": {
    "save": "Salvar",
    "cancel": "Cancelar",
    "delete": "Excluir",
    "loading": "Carregando..."
  },
  "products": {
    "title": "Produtos",
    "createNew": "Novo Produto"
  }
}
```

### Abordagem Gradual

1. Criar arquivo de mensagens com strings existentes
2. Substituir strings nos componentes shared (Button labels, etc.)
3. Substituir strings nas pages gradualmente
4. NAO traduzir tudo de uma vez - fazer por modulo

---

## Checklist Geral

- [ ] Storage constants extraidas
- [ ] Storybook configurado com 6+ historias
- [ ] Optimistic updates em pelo menos 3 mutations
- [ ] Sentry integrado e reportando erros
- [ ] PWA configurado (manifest + service worker)
- [ ] i18n basico nas strings comuns
