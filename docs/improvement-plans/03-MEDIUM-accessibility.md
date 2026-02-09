# MEDIA: Melhorias de Acessibilidade

**Status**: Base boa (Radix-ui), mas gaps em ARIA, contrast, keyboard
**Meta**: WCAG 2.1 Level AA nos fluxos principais
**Esforco**: ~6h

---

## Estado Atual

**Bom:**

- Radix-ui como base (focus management, ARIA roles automaticos)
- Focus rings definidos no design system
- Disabled states tratados
- `data-slot` attributes em componentes

**Gaps:**

- Botoes icon-only sem `aria-label`
- Erros de form nao linkados via `aria-describedby`
- Sem skip links
- EntityGrid drag-select nao acessivel por teclado
- Color contrast nao testado
- Imagens sem alt text (regra desligada no ESLint)

## Plano de Acao

### 1. Botoes Icon-Only (~1h)

Buscar todos os botoes que usam apenas icone:

```tsx
// ANTES:
<Button variant="ghost" size="icon">
  <Grid3x3 className="h-4 w-4" />
</Button>

// DEPOIS:
<Button variant="ghost" size="icon" aria-label="Alternar visualizacao">
  <Grid3x3 className="h-4 w-4" />
</Button>
```

Componentes a verificar:

- [ ] Header buttons (todos os pages)
- [ ] Navbar icons
- [ ] Theme toggle
- [ ] Search clear button
- [ ] Modal close button
- [ ] Pagination arrows

### 2. Form Error Association (~1.5h)

```tsx
// ANTES:
<input id="name" />;
{
  errors.name && <span className="text-red-500">{errors.name}</span>;
}

// DEPOIS:
<input
  id="name"
  aria-describedby={errors.name ? 'name-error' : undefined}
  aria-invalid={!!errors.name}
/>;
{
  errors.name && (
    <span id="name-error" role="alert" className="text-red-500">
      {errors.name}
    </span>
  );
}
```

Implementar no `EntityFormField` (propaga para todos os forms automaticamente).

### 3. Skip Navigation Link (~30min)

```tsx
// src/app/(dashboard)/layout.tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-blue-600 focus:rounded"
>
  Pular para o conteudo principal
</a>

// Em cada PageLayout:
<main id="main-content" tabIndex={-1}>
  {children}
</main>
```

### 4. Keyboard Navigation no EntityGrid (~1.5h)

```tsx
// Adicionar ao EntityGrid:
- Arrow keys para navegar entre items
- Space/Enter para selecionar
- Shift+Arrow para multi-select
- Home/End para primeiro/ultimo item
- Escape para deselecionar

// Implementacao:
const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
  switch (e.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      e.preventDefault();
      focusNextItem();
      break;
    case 'ArrowLeft':
    case 'ArrowUp':
      e.preventDefault();
      focusPreviousItem();
      break;
    case ' ':
    case 'Enter':
      e.preventDefault();
      toggleSelection(focusedId);
      break;
    case 'Escape':
      clearSelection();
      break;
  }
}, [focusedId]);
```

### 5. Color Contrast Audit (~1h)

Usar ferramenta automatizada:

```bash
# Instalar axe-core para testes
npm install -D @axe-core/playwright
```

```typescript
// tests/a11y/contrast.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('products page passes accessibility checks', async ({ page }) => {
  await page.goto('/stock/products');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});
```

Cores a verificar manualmente:

- [ ] `--color-foreground-subtle` vs `--color-background` (light mode)
- [ ] `--color-foreground-subtle` vs `--color-background` (dark mode)
- [ ] Badge text colors vs badge backgrounds
- [ ] Placeholder text vs input background

### 6. Alt Text em Imagens (~30min)

Reabilitar regra ESLint:

```javascript
'jsx-a11y/alt-text': 'warn',
```

Corrigir todos os `<img>` sem alt:

```tsx
// Decorativas:
<img src="..." alt="" role="presentation" />

// Informativas:
<img src={product.image} alt={`Foto do produto ${product.name}`} />
```

## Checklist

- [ ] Zero botoes icon-only sem aria-label
- [ ] Erros de form associados com aria-describedby
- [ ] Skip link implementado
- [ ] EntityGrid navegavel por teclado
- [ ] Audit de contraste passa (WCAG AA)
- [ ] `jsx-a11y/alt-text: warn` habilitado
- [ ] Teste E2E de acessibilidade com axe-core
