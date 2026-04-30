import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './card';

const meta = {
  title: 'UI/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Pedido #4521</CardTitle>
        <CardDescription>Cliente: Maria Silva</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          3 itens • R$ 289,90 • Aguardando pagamento
        </p>
      </CardContent>
    </Card>
  ),
};

export const WithFooterActions: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Aprovar férias</CardTitle>
        <CardDescription>Solicitação de João Pedro</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">15/06/2026 a 30/06/2026 (15 dias)</p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" size="sm">
          Recusar
        </Button>
        <Button size="sm">Aprovar</Button>
      </CardFooter>
    </Card>
  ),
};

export const Minimal: Story = {
  render: () => (
    <Card className="w-80 px-5">
      <p className="text-sm">Card minimalista, sem header/footer.</p>
    </Card>
  ),
};

export const InGrid: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 w-[640px]">
      {[1, 2, 3, 4].map(n => (
        <Card key={n}>
          <CardHeader>
            <CardTitle>Card #{n}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Conteúdo de exemplo.
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  ),
};

export const Dark: Story = {
  globals: { theme: 'dark' },
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Pedido #4521</CardTitle>
        <CardDescription>Tema escuro</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">3 itens • R$ 289,90</p>
      </CardContent>
    </Card>
  ),
};
