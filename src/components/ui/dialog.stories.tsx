import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from './button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';

const meta = {
  title: 'UI/Dialog',
  component: Dialog,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Abrir diálogo</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar perfil</DialogTitle>
          <DialogDescription>
            Atualize suas informações cadastrais. Pressione Salvar quando
            terminar.
          </DialogDescription>
        </DialogHeader>
        <div className="text-sm">Conteúdo do formulário aqui.</div>
        <DialogFooter>
          <Button variant="outline">Cancelar</Button>
          <Button>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const DestructiveConfirmation: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Padrão obrigatório (CLAUDE.md §7): toda ação destrutiva usa VerifyActionPinModal. Aqui mostramos a estética destrutiva (rose) sobre o invólucro Dialog para demonstrar o look — para o uso real, sempre use VerifyActionPinModal em components/modals.',
      },
    },
  },
  render: () => (
    <Dialog defaultOpen>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-rose-600 dark:text-rose-400">
            Excluir 3 produtos?
          </DialogTitle>
          <DialogDescription>
            Esta ação não pode ser desfeita. Os produtos selecionados serão
            removidos permanentemente, junto com suas variantes e histórico de
            movimentação.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
          Use sempre <code>VerifyActionPinModal</code> em produção (PIN
          obrigatório).
        </div>
        <DialogFooter>
          <Button variant="outline">Cancelar</Button>
          <Button variant="destructive">
            <Trash2 className="size-4" />
            Excluir definitivamente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const WithLoading: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Salvando alterações...</DialogTitle>
            <DialogDescription>
              Aguarde enquanto sincronizamos com o servidor.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-6">
            <div className="size-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </div>
        </DialogContent>
      </Dialog>
    );
  },
};

export const FullscreenOnMobile: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
    docs: {
      description: {
        story:
          'Variante `fullscreenOnMobile` — o modal ocupa a tela inteira em telas <sm, mantendo layout normal em sm+. Útil para wizards e formulários longos.',
      },
    },
  },
  render: () => (
    <Dialog defaultOpen>
      <DialogContent fullscreenOnMobile className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Wizard de admissão</DialogTitle>
          <DialogDescription>
            Etapa 1 de 5 — Dados pessoais do colaborador.
          </DialogDescription>
        </DialogHeader>
        <div className="text-sm">
          Conteúdo do passo (em mobile ocupa a tela inteira).
        </div>
        <DialogFooter>
          <Button variant="outline">Voltar</Button>
          <Button>Próximo</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
