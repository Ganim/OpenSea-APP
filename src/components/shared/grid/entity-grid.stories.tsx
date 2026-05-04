import type { Meta, StoryObj } from '@storybook/react';
import { Package } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { mockProducts, type MockProduct } from '@/__fixtures__';
import { EntityGrid } from './entity-grid';

const meta = {
  title: 'Shared/Grid/EntityGrid',
  component: EntityGrid,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'EntityGrid genérico — exibe items em grid ou list com seleção múltipla, drag-to-select, context menu e toggle de view. Renderização do item delegada via `renderGridItem` / `renderListItem`. NÃO tem loading/error states embutidos: parent renderiza GridLoading/GridError separadamente (ver entity-list-layout-pattern.md).',
      },
    },
  },
} satisfies Meta<typeof EntityGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

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
      <p className="text-xs text-muted-foreground">
        Estoque: {item.stock} unidade(s)
      </p>
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
        SKU: {item.sku} • Estoque: {item.stock}
      </p>
    </div>
    <p className="text-sm font-bold whitespace-nowrap">
      {formatBRL(item.price)}
    </p>
  </Card>
);

const wrap = (children: React.ReactNode) => (
  <div className="bg-background min-h-[600px] p-6">{children}</div>
);

function DefaultDemo() {
  const items = useMemo(() => mockProducts(12), []);
  return wrap(
    <EntityGrid
      items={items}
      renderGridItem={renderGridItem}
      renderListItem={renderListItem}
    />
  );
}

export const Default: Story = {
  render: () => <DefaultDemo />,
};

function ListViewDemo() {
  const items = useMemo(() => mockProducts(8), []);
  return wrap(
    <EntityGrid
      items={items}
      renderGridItem={renderGridItem}
      renderListItem={renderListItem}
      defaultView="list"
    />
  );
}

export const ListView: Story = {
  render: () => <ListViewDemo />,
};

export const Empty: Story = {
  render: () =>
    wrap(
      <EntityGrid
        items={[]}
        renderGridItem={renderGridItem}
        renderListItem={renderListItem}
        emptyMessage="Nenhum produto encontrado"
        emptyIcon={<Package className="w-8 h-8" />}
      />
    ),
};

function WithSelectionDemo() {
  const items = useMemo(() => mockProducts(8), []);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set([items[0].id, items[2].id, items[4].id])
  );

  return wrap(
    <EntityGrid
      items={items}
      renderGridItem={renderGridItem}
      renderListItem={renderListItem}
      selectedIds={selectedIds}
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
  );
}

export const WithSelection: Story = {
  render: () => <WithSelectionDemo />,
};

export const SingleItem: Story = {
  render: () =>
    wrap(
      <EntityGrid
        items={mockProducts(1)}
        renderGridItem={renderGridItem}
        renderListItem={renderListItem}
      />
    ),
};

function DarkDemo() {
  const items = useMemo(() => mockProducts(8), []);
  return wrap(
    <EntityGrid
      items={items}
      renderGridItem={renderGridItem}
      renderListItem={renderListItem}
    />
  );
}

export const Dark: Story = {
  globals: { theme: 'dark' },
  render: () => <DarkDemo />,
};
