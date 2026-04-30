import type { Meta, StoryObj } from '@storybook/react';
import { useMemo, useState } from 'react';
import { Filter, Package, Plus, Trash2, Upload } from 'lucide-react';
import { mockProducts, type MockProduct } from '@/__fixtures__';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PageBody, PageLayout } from '@/components/layout/page-layout';
import { SearchBar } from '@/components/layout/search-bar';
import { EntityGrid } from '@/components/shared/grid/entity-grid';
import { PageHeader } from '@/components/shared/page-header';

/**
 * Synthetic page-level template that demonstrates the canonical
 * `entity-list-layout-pattern.md` composition. There is NO real component
 * called EntityListPageTemplate — agents/devs should reproduce this layout
 * when scaffolding a new listing page.
 */

const meta = {
  title: 'Pages/EntityListPageTemplate',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `Template **sintético** (sem componente correspondente) — demonstra a composição canônica do padrão entity-list-layout-pattern.md:

\`\`\`
PageLayout
  PageHeader (icon + gradient + actions)
  PageBody
    SearchBar
    EntityGrid (com renderGridItem/renderListItem)
    SelectionToolbar (quando hasSelection)
\`\`\`

Use como referência ao criar páginas de listagem de novos módulos. Cada story representa um estado real (default, loading, empty, error, with-filters, with-selection, mobile, dark).`,
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

const formatBRL = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

const renderGridItem = (item: MockProduct, isSelected: boolean) => (
  <Card
    className={`p-4 cursor-pointer transition ${
      isSelected ? 'ring-2 ring-primary' : ''
    }`}
  >
    <div className="aspect-square w-full bg-muted rounded-lg mb-3 flex items-center justify-center">
      <Package className="w-8 h-8 text-muted-foreground" />
    </div>
    <div className="space-y-1">
      <h3 className="font-semibold text-sm truncate">{item.name}</h3>
      <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
      <p className="text-sm font-bold">{formatBRL(item.price)}</p>
    </div>
  </Card>
);

const renderListItem = (item: MockProduct, isSelected: boolean) => (
  <Card
    className={`p-3 flex items-center gap-4 cursor-pointer transition ${
      isSelected ? 'ring-2 ring-primary' : ''
    }`}
  >
    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center shrink-0">
      <Package className="w-5 h-5 text-muted-foreground" />
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="font-semibold text-sm truncate">{item.name}</h3>
      <p className="text-xs text-muted-foreground">
        SKU: {item.sku} • {formatBRL(item.price)}
      </p>
    </div>
  </Card>
);

const GridLoadingMock = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    {Array.from({ length: 8 }).map((_, i) => (
      <Card key={i} className="p-4 animate-pulse">
        <div className="aspect-square w-full bg-muted rounded-lg mb-3" />
        <div className="h-4 bg-muted rounded w-3/4 mb-2" />
        <div className="h-3 bg-muted rounded w-1/2 mb-2" />
        <div className="h-4 bg-muted rounded w-1/3" />
      </Card>
    ))}
  </div>
);

const GridErrorMock = ({ message }: { message: string }) => (
  <Card className="p-12 text-center">
    <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/30 flex items-center justify-center mx-auto mb-4">
      <Package className="w-8 h-8 text-rose-500" />
    </div>
    <h3 className="text-lg font-semibold mb-2">
      Não foi possível carregar os produtos
    </h3>
    <p className="text-sm text-muted-foreground mb-4">{message}</p>
    <Button variant="outline">Tentar novamente</Button>
  </Card>
);

const SelectionToolbar = ({
  count,
  onClear,
}: {
  count: number;
  onClear: () => void;
}) => (
  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 rounded-2xl border border-border bg-card p-3 shadow-2xl flex items-center gap-3">
    <span className="text-sm font-medium px-2">{count} selecionado(s)</span>
    <Button size="sm" variant="destructive">
      <Trash2 className="size-4" /> Excluir
    </Button>
    <Button size="sm" variant="outline" onClick={onClear}>
      Cancelar
    </Button>
  </div>
);

type State = 'default' | 'loading' | 'empty' | 'error' | 'with-filters';

const Template = ({
  state = 'default',
  selectionCount = 0,
}: {
  state?: State;
  selectionCount?: number;
}) => {
  const [search, setSearch] = useState('');
  const allItems = useMemo(() => mockProducts(12), []);
  const items = state === 'default' || state === 'with-filters' ? allItems : [];
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(allItems.slice(0, selectionCount).map(i => i.id))
  );

  return (
    <div className="bg-background min-h-screen">
      <PageHeader
        title="Produtos"
        description="Catálogo da empresa"
        icon={<Package />}
        gradient="from-blue-500 to-indigo-600"
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
          <SearchBar
            value={search}
            onSearch={setSearch}
            placeholder="Buscar produtos..."
          />
          {state === 'with-filters' && (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <Filter className="size-4" /> Status: Ativos
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="size-4" /> Categoria: Roupas
              </Button>
            </div>
          )}
          {state === 'loading' ? (
            <GridLoadingMock />
          ) : state === 'error' ? (
            <GridErrorMock message="Falha ao carregar produtos. Verifique sua conexão." />
          ) : (
            <EntityGrid
              items={items}
              renderGridItem={renderGridItem}
              renderListItem={renderListItem}
              selectedIds={selectedIds}
              emptyMessage="Nenhum produto cadastrado"
              emptyIcon={<Package className="w-8 h-8" />}
              onItemClick={(id, e) => {
                if (e.metaKey || e.ctrlKey) {
                  setSelectedIds(prev => {
                    const next = new Set(prev);
                    if (next.has(id)) {
                      next.delete(id);
                    } else {
                      next.add(id);
                    }
                    return next;
                  });
                } else {
                  setSelectedIds(new Set([id]));
                }
              }}
              onClearSelection={() => setSelectedIds(new Set())}
            />
          )}
        </PageBody>
      </PageLayout>
      {selectedIds.size > 0 && (
        <SelectionToolbar
          count={selectedIds.size}
          onClear={() => setSelectedIds(new Set())}
        />
      )}
    </div>
  );
};

export const Default: Story = { render: () => <Template state="default" /> };
export const Loading: Story = { render: () => <Template state="loading" /> };
export const Empty: Story = { render: () => <Template state="empty" /> };
export const Error: Story = { render: () => <Template state="error" /> };
export const WithFilters: Story = {
  render: () => <Template state="with-filters" />,
};
export const WithSelection: Story = {
  render: () => <Template state="default" selectionCount={3} />,
};
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: () => <Template state="default" />,
};
export const Dark: Story = {
  globals: { theme: 'dark' },
  render: () => <Template state="default" />,
};
