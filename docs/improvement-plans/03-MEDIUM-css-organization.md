# MEDIA: Organizar CSS e Design Tokens

**Status**: globals.css com 1.297 linhas, duplicacao entre temas
**Meta**: CSS modularizado, sem duplicacao
**Esforco**: ~4h

---

## Problema

`globals.css` tem 1.297 linhas com tudo misturado:

- Tokens primitivos (cores)
- Tokens semanticos (temas)
- Tokens de componente (botao, card, modal)
- Utilitarios (glassmorphism, animacoes)
- Overrides de componentes (scrollbar, calendar)

## Plano de Acao

### Passo 1: Mapear secoes do globals.css (~30min)

```
Linha 1-100:     Tailwind imports + base reset
Linha 100-300:   Tokens primitivos (cores RGB)
Linha 300-500:   Tokens semanticos (light theme)
Linha 500-700:   Tokens semanticos (dark theme)
Linha 700-850:   Tokens dark-blue theme (central)
Linha 850-1000:  Tokens de componente
Linha 1000-1150: Glassmorphism utilities
Linha 1150-1297: Animacoes + overrides
```

### Passo 2: Dividir em arquivos (~2h)

**Estrutura proposta:**

```
src/styles/
  globals.css              (imports + base reset - ~50 linhas)
  tokens/
    primitives.css         (cores RGB base - ~100 linhas)
    semantic-light.css     (tema light - ~100 linhas)
    semantic-dark.css      (tema dark - ~100 linhas)
    semantic-dark-blue.css (tema central - ~80 linhas)
    components.css         (botao, card, modal tokens - ~100 linhas)
  utilities/
    glassmorphism.css      (glass classes - ~80 linhas)
    animations.css         (keyframes + classes - ~100 linhas)
    overrides.css          (scrollbar, calendar, etc - ~80 linhas)
```

**globals.css final:**

```css
@import 'tailwindcss';

/* Design System Tokens */
@import './tokens/primitives.css';
@import './tokens/semantic-light.css';
@import './tokens/semantic-dark.css';
@import './tokens/semantic-dark-blue.css';
@import './tokens/components.css';

/* Utilities */
@import './utilities/glassmorphism.css';
@import './utilities/animations.css';
@import './utilities/overrides.css';

/* Base Reset */
* { ... }
body { ... }
```

### Passo 3: Remover duplicacao (~1h)

Tokens duplicados entre light e dark:

```css
/* ANTES - duplicado: */
:root {
  --glass-blur: 16px;
}
.dark {
  --glass-blur: 16px; /* mesmo valor! */
}

/* DEPOIS - definir apenas uma vez: */
:root {
  --glass-blur: 16px;
}
.dark {
  /* glass-blur herda de :root */
}
```

Identificar e remover:

- [ ] Valores identicos entre :root e .dark
- [ ] Valores identicos entre .dark e .dark-blue
- [ ] Variaveis definidas mas nunca usadas

### Passo 4: Documentar tokens (~30min)

Adicionar comentarios estruturados:

```css
/* ============================================
 * PRIMITIVE TOKENS
 * Base color scales - do NOT use directly in components
 * Use semantic tokens instead
 * ============================================ */

/* Gray Scale (Neutral) */
--os-gray-50: 249 250 251;
/* ... */
```

## Consideracoes

- Tailwind v4 suporta `@import` nativamente
- Testar que todos os temas continuam funcionando apos split
- Verificar que HMR funciona com CSS modularizado
- `next-env.d.ts` pode precisar de update

## Checklist

- [ ] globals.css < 60 linhas (apenas imports + reset)
- [ ] 8+ arquivos CSS organizados por responsabilidade
- [ ] Zero duplicacao de valores entre temas
- [ ] Todos os temas funcionando (light, dark, dark-blue)
- [ ] HMR funciona normalmente
- [ ] Build passa sem erros
