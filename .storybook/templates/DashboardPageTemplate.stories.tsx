import type { Meta, StoryObj } from '@storybook/react';
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Boxes,
  CalendarClock,
  History,
  Layers,
  Package,
  Plus,
  Printer,
  Repeat,
  RotateCcw,
  TrendingUp,
  Upload,
  Warehouse,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PageBody, PageLayout } from '@/components/layout/page-layout';
import { PageHeader } from '@/components/shared/page-header';
import { StatsCard } from '@/components/shared/stats-card';

/**
 * Synthetic page-level template that demonstrates the canonical
 * "module dashboard / home page" composition (e.g. stock home, hr home,
 * finance home). There is NO real component called DashboardPageTemplate —
 * agents/devs should reproduce this layout when scaffolding a new module
 * landing page.
 */

const meta = {
  title: 'Pages/DashboardPageTemplate',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `Template **sintético** (sem componente correspondente) — demonstra a composição canônica de uma página inicial de módulo:

\`\`\`
PageLayout
  PageHeader (icon + gradient + actions)
  PageBody
    Stats grid (4 StatsCards)
    Atalhos rápidos (cards clicáveis com ícone + descrição)
    Atividade recente (lista de movimentações)
    Alertas (cards de risco)
\`\`\`

Use como referência ao criar páginas iniciais de novos módulos. Cada story representa um estado real (default, empty, loading, error, mobile).`,
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

type State = 'default' | 'empty' | 'loading' | 'error';

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  hoverBg: string;
}

const quickActions: QuickAction[] = [
  {
    id: 'create-product',
    label: 'Cadastrar produto',
    description: 'Adicione um novo produto ao catálogo',
    icon: Plus,
    gradient: 'from-blue-500 to-indigo-600',
    hoverBg: 'hover:bg-blue-50 dark:hover:bg-blue-500/10',
  },
  {
    id: 'import',
    label: 'Importar planilha',
    description: 'Importe produtos em massa via XLSX',
    icon: Upload,
    gradient: 'from-amber-500 to-orange-600',
    hoverBg: 'hover:bg-amber-50 dark:hover:bg-amber-500/10',
  },
  {
    id: 'print-labels',
    label: 'Imprimir etiquetas',
    description: 'Gere etiquetas para itens selecionados',
    icon: Printer,
    gradient: 'from-violet-500 to-purple-600',
    hoverBg: 'hover:bg-violet-50 dark:hover:bg-violet-500/10',
  },
  {
    id: 'low-stock',
    label: 'Alertas de estoque baixo',
    description: 'Revise itens próximos do mínimo',
    icon: AlertTriangle,
    gradient: 'from-rose-500 to-red-600',
    hoverBg: 'hover:bg-rose-50 dark:hover:bg-rose-500/10',
  },
  {
    id: 'history',
    label: 'Histórico de movimentações',
    description: 'Entradas, saídas e transferências',
    icon: History,
    gradient: 'from-slate-500 to-slate-600',
    hoverBg: 'hover:bg-slate-50 dark:hover:bg-slate-500/10',
  },
  {
    id: 'count',
    label: 'Iniciar contagem',
    description: 'Realize um inventário de armazém',
    icon: Boxes,
    gradient: 'from-emerald-500 to-teal-600',
    hoverBg: 'hover:bg-emerald-50 dark:hover:bg-emerald-500/10',
  },
];

interface RecentMovement {
  id: string;
  kind: 'entrada' | 'saida' | 'transferencia';
  product: string;
  quantity: number;
  user: string;
  timestamp: string;
}

const recentMovements: RecentMovement[] = [
  {
    id: 'mv-1',
    kind: 'entrada',
    product: 'Camiseta Polo Algodão M',
    quantity: 48,
    user: 'Carla Mendes',
    timestamp: 'Há 12 min',
  },
  {
    id: 'mv-2',
    kind: 'saida',
    product: 'Tênis Esportivo Pro 42',
    quantity: 6,
    user: 'João Pereira',
    timestamp: 'Há 38 min',
  },
  {
    id: 'mv-3',
    kind: 'transferencia',
    product: 'Mochila Trekking 30L',
    quantity: 12,
    user: 'Roberta Silva',
    timestamp: 'Há 1 h',
  },
  {
    id: 'mv-4',
    kind: 'entrada',
    product: 'Caneca Cerâmica 350ml',
    quantity: 240,
    user: 'Carla Mendes',
    timestamp: 'Há 2 h',
  },
  {
    id: 'mv-5',
    kind: 'saida',
    product: 'Notebook 14" SSD 512GB',
    quantity: 3,
    user: 'Diego Almeida',
    timestamp: 'Há 3 h',
  },
];

interface StockAlert {
  id: string;
  kind: 'critico' | 'validade' | 'critico';
  title: string;
  description: string;
  badge: string;
  badgeClass: string;
  icon: React.ElementType;
}

const stockAlerts: StockAlert[] = [
  {
    id: 'al-1',
    kind: 'critico',
    title: 'Estoque crítico — Tênis Esportivo Pro 42',
    description: 'Apenas 4 unidades restantes (mínimo: 20).',
    badge: 'Crítico',
    badgeClass:
      'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
    icon: AlertTriangle,
  },
  {
    id: 'al-2',
    kind: 'validade',
    title: 'Validade próxima — Iogurte Natural 200g',
    description: '38 unidades vencem em 7 dias (lote L-2026-04-99).',
    badge: 'Validade',
    badgeClass:
      'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    icon: CalendarClock,
  },
  {
    id: 'al-3',
    kind: 'critico',
    title: 'Estoque crítico — Caneca Cerâmica 350ml',
    description: 'Apenas 9 unidades restantes (mínimo: 50).',
    badge: 'Crítico',
    badgeClass:
      'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
    icon: AlertTriangle,
  },
];

const movementIcon: Record<RecentMovement['kind'], React.ElementType> = {
  entrada: ArrowDownLeft,
  saida: ArrowUpRight,
  transferencia: Repeat,
};

const movementColor: Record<RecentMovement['kind'], string> = {
  entrada:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  saida: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  transferencia:
    'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
};

const movementLabel: Record<RecentMovement['kind'], string> = {
  entrada: 'Entrada',
  saida: 'Saída',
  transferencia: 'Transferência',
};

const StatsLoadingMock = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <Card key={i} className="p-4 animate-pulse">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-muted rounded w-2/3" />
            <div className="h-7 bg-muted rounded w-1/2" />
            <div className="h-3 bg-muted rounded w-1/3" />
          </div>
          <div className="w-12 h-12 bg-muted rounded-2xl" />
        </div>
      </Card>
    ))}
  </div>
);

const StatsErrorMock = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) => (
  <Card className="p-8 text-center">
    <div className="w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-950/30 flex items-center justify-center mx-auto mb-3">
      <AlertTriangle className="w-7 h-7 text-rose-500" />
    </div>
    <h3 className="text-base font-semibold mb-1">
      Não foi possível carregar as estatísticas
    </h3>
    <p className="text-sm text-muted-foreground mb-4">{message}</p>
    <Button variant="outline" size="sm" onClick={onRetry}>
      <RotateCcw className="size-4" /> Tentar novamente
    </Button>
  </Card>
);

const SectionLoadingList = () => (
  <div className="space-y-2">
    {Array.from({ length: 5 }).map((_, i) => (
      <div
        key={i}
        className="h-14 rounded-xl bg-muted/60 animate-pulse"
        aria-hidden="true"
      />
    ))}
  </div>
);

const SectionLoadingGrid = ({ items = 6 }: { items?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: items }).map((_, i) => (
      <Card key={i} className="p-5 animate-pulse">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded w-2/3" />
            <div className="h-3 bg-muted rounded w-full" />
          </div>
        </div>
      </Card>
    ))}
  </div>
);

const QuickActionsGrid = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {quickActions.map(action => {
      const Icon = action.icon;
      return (
        <button
          key={action.id}
          type="button"
          aria-label={action.label}
          className="text-left rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Card
            className={`p-5 h-full bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10 transition-all group ${action.hoverBg}`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-xl bg-linear-to-br ${action.gradient} flex items-center justify-center shrink-0`}
              >
                <Icon className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5 flex items-center gap-2">
                  {action.label}
                  <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </h3>
                <p className="text-xs text-gray-600 dark:text-white/60">
                  {action.description}
                </p>
              </div>
            </div>
          </Card>
        </button>
      );
    })}
  </div>
);

const RecentActivityList = () => (
  <Card className="p-0 overflow-hidden">
    <ul className="divide-y divide-border" aria-label="Movimentações recentes">
      {recentMovements.map(mv => {
        const Icon = movementIcon[mv.kind];
        return (
          <li
            key={mv.id}
            className="flex items-center gap-3 px-5 py-3 hover:bg-muted/40 transition"
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${movementColor[mv.kind]}`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {movementLabel[mv.kind]} — {mv.product}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {mv.quantity} un. • {mv.user} • {mv.timestamp}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  </Card>
);

const AlertsList = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {stockAlerts.map(alert => {
      const Icon = alert.icon;
      return (
        <Card key={alert.id} className="p-5">
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${alert.badgeClass}`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${alert.badgeClass}`}
                >
                  {alert.badge}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                {alert.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                {alert.description}
              </p>
            </div>
          </div>
        </Card>
      );
    })}
  </div>
);

const SectionTitle = ({
  title,
  description,
}: {
  title: string;
  description?: string;
}) => (
  <div>
    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
      {title}
    </h2>
    {description && (
      <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
    )}
  </div>
);

const EmptyBlock = ({
  icon: Icon,
  title,
  description,
  ctaLabel,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  ctaLabel?: string;
}) => (
  <Card className="p-10 text-center">
    <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
      <Icon className="w-7 h-7 text-muted-foreground" aria-hidden="true" />
    </div>
    <h3 className="text-base font-semibold mb-1">{title}</h3>
    <p className="text-sm text-muted-foreground mb-4">{description}</p>
    {ctaLabel && (
      <Button size="sm">
        <Plus className="size-4" /> {ctaLabel}
      </Button>
    )}
  </Card>
);

const Template = ({ state = 'default' }: { state?: State }) => {
  const handleRetry = () => {
    // synthetic retry — story-only
  };

  return (
    <div className="bg-background min-h-screen">
      <PageHeader
        title="Estoque"
        description="Visão geral do módulo de estoque"
        icon={<Package />}
        gradient="from-emerald-500 to-emerald-600"
        showBackButton={false}
        actions={
          <>
            <Button size="sm" variant="outline">
              <Upload className="size-4" /> Importar
            </Button>
            <Button size="sm">
              <Plus className="size-4" /> Novo produto
            </Button>
          </>
        }
      />
      <PageLayout className="px-8 py-6">
        <PageBody>
          {/* Stats grid */}
          {state === 'loading' ? (
            <StatsLoadingMock />
          ) : state === 'error' ? (
            <StatsErrorMock
              message="Falha ao buscar métricas. Verifique sua conexão e tente novamente."
              onRetry={handleRetry}
            />
          ) : state === 'empty' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                label="Produtos cadastrados"
                value="0"
                icon={<Package />}
                gradient="from-blue-500 to-indigo-600"
              />
              <StatsCard
                label="Variantes ativas"
                value="0"
                icon={<Layers />}
                gradient="from-violet-500 to-purple-600"
              />
              <StatsCard
                label="Itens em estoque"
                value="0"
                icon={<Warehouse />}
                gradient="from-emerald-500 to-teal-600"
              />
              <StatsCard
                label="Movimentações hoje"
                value="0"
                icon={<TrendingUp />}
                gradient="from-amber-500 to-orange-600"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                label="Produtos cadastrados"
                value="1.247"
                icon={<Package />}
                gradient="from-blue-500 to-indigo-600"
                trend={{ value: 5, isPositive: true }}
              />
              <StatsCard
                label="Variantes ativas"
                value="3.581"
                icon={<Layers />}
                gradient="from-violet-500 to-purple-600"
                trend={{ value: 12, isPositive: true }}
              />
              <StatsCard
                label="Itens em estoque"
                value="28.439"
                icon={<Warehouse />}
                gradient="from-emerald-500 to-teal-600"
                trend={{ value: 2, isPositive: false }}
              />
              <StatsCard
                label="Movimentações hoje"
                value="156"
                icon={<TrendingUp />}
                gradient="from-amber-500 to-orange-600"
              />
            </div>
          )}

          {/* Atalhos rápidos */}
          <section className="space-y-4" aria-labelledby="atalhos-title">
            <SectionTitle
              title="Atalhos rápidos"
              description="Acesse as ações mais comuns do módulo"
            />
            <div id="atalhos-title" className="sr-only">
              Atalhos rápidos
            </div>
            {state === 'loading' ? (
              <SectionLoadingGrid items={6} />
            ) : state === 'empty' ? (
              <EmptyBlock
                icon={Package}
                title="Nenhum produto cadastrado ainda"
                description="Comece cadastrando seu primeiro produto ou importe sua base existente via planilha."
                ctaLabel="Cadastrar primeiro produto"
              />
            ) : (
              <QuickActionsGrid />
            )}
          </section>

          {/* Atividade recente */}
          <section className="space-y-4" aria-labelledby="atividade-title">
            <SectionTitle
              title="Atividade recente"
              description="Últimas movimentações registradas no estoque"
            />
            <div id="atividade-title" className="sr-only">
              Atividade recente
            </div>
            {state === 'loading' ? (
              <SectionLoadingList />
            ) : state === 'empty' ? (
              <EmptyBlock
                icon={History}
                title="Nenhuma movimentação registrada"
                description="As entradas, saídas e transferências aparecerão aqui assim que forem efetuadas."
              />
            ) : (
              <RecentActivityList />
            )}
          </section>

          {/* Alertas */}
          <section className="space-y-4" aria-labelledby="alertas-title">
            <SectionTitle
              title="Alertas"
              description="Itens que precisam da sua atenção agora"
            />
            <div id="alertas-title" className="sr-only">
              Alertas
            </div>
            {state === 'loading' ? (
              <SectionLoadingGrid items={3} />
            ) : state === 'empty' ? (
              <EmptyBlock
                icon={AlertTriangle}
                title="Nenhum alerta no momento"
                description="Quando houver estoque crítico ou validade próxima, os itens aparecerão aqui."
              />
            ) : (
              <AlertsList />
            )}
          </section>
        </PageBody>
      </PageLayout>
    </div>
  );
};

export const Default: Story = { render: () => <Template state="default" /> };
export const Empty: Story = { render: () => <Template state="empty" /> };
export const Loading: Story = { render: () => <Template state="loading" /> };
export const Error: Story = { render: () => <Template state="error" /> };
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: () => <Template state="default" />,
};
