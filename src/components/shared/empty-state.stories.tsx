import type { Meta, StoryObj } from '@storybook/react';
import { Package } from 'lucide-react';
import { EmptyState } from './empty-state';

const meta = {
  title: 'Shared/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    icon: <Package />,
    title: 'Nenhum produto cadastrado',
    description: 'Comece criando seu primeiro produto para vê-lo listado aqui.',
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithAction: Story = {
  args: {
    actionLabel: 'Criar primeiro produto',
    onAction: () => alert('Criar clicked'),
  },
};

export const Dark: Story = {
  globals: { theme: 'dark' },
  args: {
    actionLabel: 'Criar primeiro produto',
    onAction: () => alert('Criar clicked'),
  },
};

export const ShortText: Story = {
  args: {
    title: 'Sem dados',
    description: 'Ainda não há registros para exibir.',
  },
};
