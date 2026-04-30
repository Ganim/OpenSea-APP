import type { Meta, StoryObj } from '@storybook/react';
import {
  DollarSign,
  Package,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import { StatsCard } from './stats-card';

const meta = {
  title: 'Shared/StatsCard',
  component: StatsCard,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    label: 'Receita do mês',
    value: 'R$ 142.890,00',
    icon: <DollarSign />,
    gradient: 'from-emerald-500 to-teal-600',
  },
} satisfies Meta<typeof StatsCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  decorators: [
    Story => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

export const WithTrendUp: Story = {
  decorators: [
    Story => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
  args: {
    trend: { value: 12.4, isPositive: true },
    icon: <TrendingUp />,
  },
};

export const WithTrendDown: Story = {
  decorators: [
    Story => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
  args: {
    label: 'Cancelamentos',
    value: '34',
    trend: { value: 8.2, isPositive: false },
    icon: <TrendingDown />,
    gradient: 'from-rose-500 to-red-600',
  },
};

export const InGrid: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-background">
      <StatsCard
        label="Receita"
        value="R$ 142.890"
        icon={<DollarSign />}
        gradient="from-emerald-500 to-teal-600"
      />
      <StatsCard
        label="Funcionários"
        value="48"
        icon={<Users />}
        gradient="from-blue-500 to-indigo-600"
      />
      <StatsCard
        label="Pedidos"
        value="1.284"
        trend={{ value: 12.4, isPositive: true }}
        icon={<ShoppingCart />}
        gradient="from-violet-500 to-purple-600"
      />
      <StatsCard
        label="Estoque"
        value="3.421 itens"
        trend={{ value: 2.1, isPositive: false }}
        icon={<Package />}
        gradient="from-amber-500 to-orange-600"
      />
    </div>
  ),
};

export const Dark: Story = {
  globals: { theme: 'dark' },
  decorators: [
    Story => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
  args: {
    trend: { value: 12.4, isPositive: true },
    icon: <TrendingUp />,
  },
};
