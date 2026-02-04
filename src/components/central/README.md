# Central Panel - Glassmorphism Design System

Sistema de design exclusivo para o painel administrativo Central do OpenSea, implementando o estilo **glassmorphism** (efeito de vidro).

## 🎨 Características Visuais

### Background Animado

- Gradientes dinâmicos com cores vibrantes
- 5 esferas flutuantes com animação pulse
- Cores: Azul, Roxo, Rosa, Ciano e Âmbar
- Grid pattern sutil para profundidade

### Glassmorphism

Todos os componentes seguem os princípios do glassmorphism:

- **Transparência**: Fundos semi-transparentes (10-20% opacidade)
- **Blur**: Efeito de desfoque no backdrop (backdrop-blur)
- **Bordas**: Bordas sutis e translúcidas
- **Saturação**: Cores mais saturadas no fundo (backdrop-saturate)
- **Sombras**: Sombras suaves para profundidade

## 📦 Componentes Disponíveis

### Componentes Base

#### `GlassCard`

Card com efeito glassmorphism. Ideal para conteúdo destacado.

```tsx
import { GlassCard } from '@/components/central';

<GlassCard variant="gradient" hover blur="md">
  {/* Conteúdo */}
</GlassCard>;
```

**Props:**

- `variant`: 'default' | 'darker' | 'lighter' | 'gradient'
- `blur`: 'sm' | 'md' | 'lg' | 'xl'
- `hover`: boolean (efeito de hover)

#### `GlassContainer`

Container para agrupar conteúdo com glassmorphism.

```tsx
import { GlassContainer } from '@/components/central';

<GlassContainer variant="medium">{/* Conteúdo */}</GlassContainer>;
```

**Props:**

- `variant`: 'subtle' | 'medium' | 'strong'

#### `GlassButton`

Botão com efeito glassmorphism.

```tsx
import { GlassButton } from '@/components/central';

<GlassButton variant="primary" size="md" isLoading={false}>
  Clique aqui
</GlassButton>;
```

**Props:**

- `variant`: 'primary' | 'secondary' | 'ghost' | 'danger'
- `size`: 'sm' | 'md' | 'lg'
- `isLoading`: boolean

#### `GlassInput`

Input com efeito glassmorphism.

```tsx
import { GlassInput } from '@/components/central';

<GlassInput
  placeholder="Digite algo..."
  icon={<Search className="h-4 w-4" />}
/>;
```

#### `GlassBadge`

Badge com efeito glassmorphism.

```tsx
import { GlassBadge } from '@/components/central';

<GlassBadge variant="success">Ativo</GlassBadge>;
```

**Props:**

- `variant`: 'success' | 'warning' | 'error' | 'info' | 'default'

### Componentes Especializados

#### `StatCard`

Card de estatística com gradientes e animações.

```tsx
import { StatCard } from '@/components/central';
import { Building2 } from 'lucide-react';

<StatCard
  label="Total de Empresas"
  value={50}
  icon={Building2}
  color="blue"
  trend={{ value: 12, isPositive: true }}
  isLoading={false}
/>;
```

**Props:**

- `color`: 'blue' | 'purple' | 'pink' | 'amber' | 'green' | 'cyan'
- `trend`: { value: number, isPositive: boolean } (opcional)

#### `GlassTable`

Sistema completo de tabelas com glassmorphism.

```tsx
import {
  GlassTable,
  GlassTableHeader,
  GlassTableBody,
  GlassTableRow,
  GlassTableHead,
  GlassTableCell,
} from '@/components/central';

<GlassTable>
  <GlassTableHeader>
    <GlassTableRow>
      <GlassTableHead>Nome</GlassTableHead>
      <GlassTableHead>Status</GlassTableHead>
    </GlassTableRow>
  </GlassTableHeader>
  <GlassTableBody>
    <GlassTableRow>
      <GlassTableCell>Empresa A</GlassTableCell>
      <GlassTableCell>Ativo</GlassTableCell>
    </GlassTableRow>
  </GlassTableBody>
</GlassTable>;
```

#### `AnimatedBackground`

Background animado com esferas e gradientes.

```tsx
import { AnimatedBackground } from '@/components/central';

<AnimatedBackground />;
```

### Layout Components

#### `CentralNavbar`

Navbar com glassmorphism, dropdown e navegação.

#### `CentralSidebar`

Sidebar com glassmorphism e indicadores de página ativa.

## 🎨 Paleta de Cores

### Gradientes Principais

- **Azul**: `from-blue-500/20 to-blue-600/20`
- **Roxo**: `from-purple-500/20 to-purple-600/20`
- **Rosa**: `from-pink-500/20 to-pink-600/20`
- **Âmbar**: `from-amber-500/20 to-amber-600/20`
- **Verde**: `from-green-500/20 to-green-600/20`
- **Ciano**: `from-cyan-500/20 to-cyan-600/20`

### Background Base

- Fundo: `bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900`
- Overlays: Gradientes com 20% de opacidade

## 📁 Estrutura de Arquivos

```
components/central/
├── index.ts                    # Exports centralizados
├── animated-background.tsx     # Background animado
├── glass-card.tsx             # Card base
├── glass-container.tsx        # Container base
├── glass-button.tsx           # Botão
├── glass-input.tsx            # Input
├── glass-badge.tsx            # Badge
├── glass-table.tsx            # Sistema de tabelas
├── stat-card.tsx              # Card de estatísticas
├── central-navbar.tsx         # Navbar
└── central-sidebar.tsx        # Sidebar
```

## 🚀 Páginas Implementadas

### Dashboard (`/central`)

- 3 cards principais de estatísticas
- 2 cards de atividade e métricas rápidas
- 1 card de gráfico de crescimento
- Totalmente responsivo

### Empresas (`/central/tenants`)

- Busca com glassmorphism
- Tabela com efeito de vidro
- Paginação estilizada
- Estado vazio customizado

### Planos (`/central/plans`)

- Grid responsivo de cards
- Cards com gradientes por tier
- Hover effects
- Estado vazio customizado

## 🎯 Princípios de Design

1. **Consistência**: Todos os componentes seguem o mesmo padrão visual
2. **Hierarquia**: Uso de transparência e blur para criar profundidade
3. **Feedback Visual**: Animações suaves em hover e interações
4. **Legibilidade**: Texto branco com opacidade variável para contraste
5. **Performance**: Animações otimizadas com CSS nativo

## 🔧 Customização

### Adicionar Nova Cor de Gradiente

```tsx
// Em qualquer componente
const myGradient = 'from-indigo-500/20 to-indigo-600/20';

<div className={`bg-gradient-to-br ${myGradient}`}>{/* Conteúdo */}</div>;
```

### Criar Nova Variante de Card

```tsx
<GlassCard
  className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20"
  hover
>
  {/* Conteúdo customizado */}
</GlassCard>
```

## 💡 Boas Práticas

1. **Use variantes adequadas**: Escolha a variante de blur e transparência apropriada para cada contexto
2. **Evite sobreposição excessiva**: Limite o número de layers com glassmorphism
3. **Mantenha contraste**: Use texto branco com opacidade adequada (80-90% para texto principal, 60-70% para secundário)
4. **Aproveite hover effects**: Adicione `hover` prop nos cards clicáveis
5. **Combine com gradientes**: Use gradientes sutis para destacar elementos importantes

## 🎨 Inspiração

O design foi inspirado em dashboards modernos com glassmorphism:

- Channel Analytics (métricas e gráficos)
- Smart Home Dashboards (cards e controles)
- Banking Dashboards (dados e visualizações)

## ✅ Funcionalidades Mantidas

Todas as funcionalidades existentes foram preservadas:

- ✅ Autenticação e autorização
- ✅ Listagem de empresas com busca e paginação
- ✅ Listagem de planos com filtros
- ✅ Dashboard com estatísticas em tempo real
- ✅ Navegação entre páginas
- ✅ Estados de loading
- ✅ Estados vazios
- ✅ Responsividade

## 🚀 Próximos Passos

- [ ] Adicionar gráficos interativos (Chart.js ou Recharts)
- [ ] Implementar dark/light mode toggle
- [ ] Criar mais variações de cores
- [ ] Adicionar animações de entrada (framer-motion)
- [ ] Implementar skeleton loading com glassmorphism
- [ ] Criar componente de notificações com glassmorphism
