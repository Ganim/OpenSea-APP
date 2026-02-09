# MEDIA: Otimizacoes de Performance

**Status**: Libs pesadas carregadas sincronamente, falta memoizacao, sem bundle analysis
**Meta**: Bundle principal < 300KB gzip, lazy load de features pesadas
**Esforco**: ~6h

---

## Problemas Identificados

1. **Libs pesadas carregadas sincronamente**: GrapesJS (~300KB), @react-pdf (~400KB), recharts (~200KB)
2. **Falta memoizacao**: EntityForm nao usa `React.memo`, renderizacoes desnecessarias
3. **Sem bundle analyzer**: Nao sabemos o tamanho real dos chunks
4. **localStorage acessado sem cache**: Token verificado a cada render

## Plano de Acao

### 1. Dynamic Imports para Libs Pesadas (~2h)

#### Print Studio (GrapesJS + PDF)

```typescript
// ANTES:
import { LabelStudioEditor } from '@/core/print-queue/editor';

// DEPOIS:
import dynamic from 'next/dynamic';
const LabelStudioEditor = dynamic(
  () => import('@/core/print-queue/editor').then(m => m.LabelStudioEditor),
  { ssr: false, loading: () => <GridLoading count={1} layout="grid" /> }
);
```

#### Charts (recharts)

```typescript
const AnalyticsChart = dynamic(() => import('@/components/analytics/chart'), {
  ssr: false,
});
```

#### PDF Generation

```typescript
const PDFGenerator = dynamic(
  () => import('@/core/print-queue/utils/studio-pdf-renderer'),
  { ssr: false }
);
```

**Impacto**: ~900KB removido do bundle principal.

### 2. Memoizacao de Componentes (~1.5h)

#### EntityForm

```typescript
// Wrap com memo
export const EntityForm = React.memo(
  React.forwardRef<EntityFormRef, EntityFormProps>((props, ref) => {
    // ...
  })
);

// Memoizar renderField
const MemoizedField = React.memo(({ field, value, onChange }) => {
  // ...
});
```

#### Render functions em pages

```typescript
// ANTES (recria funcao a cada render):
const renderGridCard = (item: Product, isSelected: boolean) => { ... };

// DEPOIS (memoiza):
const renderGridCard = useCallback((item: Product, isSelected: boolean) => {
  // ...
}, [/* deps */]);
```

### 3. Bundle Analyzer (~30min)

```bash
npm install -D @next/bundle-analyzer
```

```typescript
// next.config.ts
import withBundleAnalyzer from '@next/bundle-analyzer';

const config = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(nextConfig);

export default config;
```

```json
{
  "analyze": "ANALYZE=true npm run build"
}
```

### 4. React Query Otimizacoes (~1h)

#### Invalidacao mais cirurgica

```typescript
// ANTES (invalida TODOS os products):
queryClient.invalidateQueries({ queryKey: ['products'] });

// DEPOIS (invalida apenas a lista, nao o detalhe):
queryClient.invalidateQueries({ queryKey: ['products', 'list'] });
// E atualiza o cache do item especifico:
queryClient.setQueryData(['products', id], updatedProduct);
```

#### Prefetching em hover

```typescript
// Prefetch dados ao passar o mouse sobre um link
const prefetchProduct = useCallback((id: string) => {
  queryClient.prefetchQuery({
    queryKey: ['products', id],
    queryFn: () => productsService.getProduct(id),
    staleTime: 5 * 60 * 1000,
  });
}, [queryClient]);

<Link onMouseEnter={() => prefetchProduct(item.id)} ... />
```

### 5. Token Cache (~1h)

```typescript
// ANTES: localStorage.getItem('auth_token') a cada render
// DEPOIS: Cache em memoria com invalidacao

class TokenCache {
  private token: string | null = null;
  private lastCheck = 0;
  private TTL = 1000; // 1s cache

  getToken(): string | null {
    const now = Date.now();
    if (now - this.lastCheck > this.TTL) {
      this.token = localStorage.getItem('auth_token');
      this.lastCheck = now;
    }
    return this.token;
  }

  invalidate() {
    this.token = null;
    this.lastCheck = 0;
  }
}
```

## Checklist

- [ ] GrapesJS lazy-loaded (dynamic import)
- [ ] @react-pdf lazy-loaded
- [ ] recharts lazy-loaded
- [ ] Bundle analyzer configurado
- [ ] EntityForm memoizado
- [ ] Render functions memoizadas com useCallback
- [ ] React Query com invalidacao cirurgica
- [ ] Token cache implementado
- [ ] Build < 300KB gzip (main chunk)
