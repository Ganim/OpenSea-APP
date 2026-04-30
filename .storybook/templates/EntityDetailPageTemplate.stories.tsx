import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import {
  AlertTriangle,
  Building2,
  Calendar,
  Mail,
  MapPin,
  Phone,
  Save,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  PageBody,
  PageHeader as PageHeaderShell,
  PageLayout,
} from '@/components/layout/page-layout';
import { PageActionBar } from '@/components/layout/page-action-bar';
import { PageHeader } from '@/components/shared/page-header';
import { DetailSkeleton } from '@/components/shared/loading-skeletons';

/**
 * Synthetic page-level template that demonstrates the canonical
 * "entity detail" composition documented in CLAUDE.md §9
 * (Detail/Edit Pages — Visual Patterns). There is NO real component
 * called EntityDetailPageTemplate — devs/agents should reproduce this
 * layout when scaffolding a new detail or edit page.
 */

const meta = {
  title: 'Pages/EntityDetailPageTemplate',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `Template **sintético** (sem componente correspondente) — demonstra a composição canônica de páginas de detalhe/edição (CLAUDE.md §9):

\`\`\`
PageLayout
  PageHeader (PageActionBar com breadcrumb + ações)
  PageBody
    Identity Card (bg-white/5 p-5)
    Tabs (grid-cols-N h-12 mb-4)
      Form Card (bg-white/5 py-2 overflow-hidden)
        ModuleCard (bg-white dark:bg-slate-800/60 border border-border)
\`\`\`

Cada story representa um estado real (default, editing, loading, error, mobile).`,
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

// ============================================================================
// MOCK DATA
// ============================================================================

const mockCustomer = {
  name: 'João da Silva',
  type: 'Pessoa Física',
  document: '123.456.789-00',
  email: 'joao.silva@exemplo.com.br',
  phone: '(11) 98765-4321',
  address: 'Rua das Flores, 123 - Vila Mariana',
  city: 'São Paulo',
  state: 'SP',
  zipCode: '04101-300',
  createdAt: 'Cliente desde 14/03/2024',
  notes:
    'Cliente recorrente desde 2024. Prefere atendimento por WhatsApp. Pagamento em boleto.',
};

const breadcrumbItems = [
  { label: 'Vendas', href: '/sales' },
  { label: 'Clientes', href: '/sales/customers' },
  { label: mockCustomer.name },
];

// ============================================================================
// SHARED PIECES
// ============================================================================

function IdentityCard() {
  return (
    <Card className="bg-white/5 p-5">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl shadow-lg bg-linear-to-br from-blue-500 to-indigo-600">
          <User className="h-7 w-7 text-white" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground">{mockCustomer.type}</p>
          <h2 className="text-xl font-bold truncate">{mockCustomer.name}</h2>
          <p className="text-sm text-muted-foreground">
            {mockCustomer.createdAt}
          </p>
        </div>
      </div>
    </Card>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon
        className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0"
        aria-hidden="true"
      />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  );
}

function FormField({
  id,
  label,
  defaultValue,
  type = 'text',
  readOnly = false,
}: {
  id: string;
  label: string;
  defaultValue: string;
  type?: string;
  readOnly?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        defaultValue={defaultValue}
        readOnly={readOnly}
        aria-readonly={readOnly}
      />
    </div>
  );
}

function ViewTabContent() {
  const fullAddress = `${mockCustomer.address}, ${mockCustomer.city} - ${mockCustomer.state}, ${mockCustomer.zipCode}`;
  return (
    <Card className="bg-white/5 py-2 overflow-hidden">
      <div className="px-6 py-4 space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-foreground" aria-hidden="true" />
            <div>
              <h3 className="text-base font-semibold">Dados do Cliente</h3>
              <p className="text-sm text-muted-foreground">
                Informações de identificação e contato
              </p>
            </div>
          </div>
          <div className="border-b border-border" />
        </div>

        <div className="w-full rounded-xl border border-border bg-white p-6 dark:bg-slate-800/60">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoRow icon={Mail} label="E-mail" value={mockCustomer.email} />
            <InfoRow icon={Phone} label="Telefone" value={mockCustomer.phone} />
            <InfoRow icon={MapPin} label="Endereço" value={fullAddress} />
            <InfoRow
              icon={Building2}
              label="Documento"
              value={mockCustomer.document}
            />
            <InfoRow
              icon={Calendar}
              label="Cliente desde"
              value={mockCustomer.createdAt}
            />
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">Observações</p>
            <p className="text-sm whitespace-pre-wrap">{mockCustomer.notes}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

function EditTabContent() {
  return (
    <Card className="bg-white/5 py-2 overflow-hidden">
      <div className="px-6 py-4 space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-foreground" aria-hidden="true" />
            <div>
              <h3 className="text-base font-semibold">Dados do Cliente</h3>
              <p className="text-sm text-muted-foreground">
                Edite as informações de identificação e contato
              </p>
            </div>
          </div>
          <div className="border-b border-border" />
        </div>

        <div className="w-full rounded-xl border border-border bg-white p-6 dark:bg-slate-800/60">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              id="customer-name"
              label="Nome completo"
              defaultValue={mockCustomer.name}
            />
            <FormField
              id="customer-document"
              label="CPF"
              defaultValue={mockCustomer.document}
            />
            <FormField
              id="customer-email"
              label="E-mail"
              type="email"
              defaultValue={mockCustomer.email}
            />
            <FormField
              id="customer-phone"
              label="Telefone"
              type="tel"
              defaultValue={mockCustomer.phone}
            />
            <FormField
              id="customer-address"
              label="Endereço"
              defaultValue={mockCustomer.address}
            />
            <FormField
              id="customer-zip"
              label="CEP"
              defaultValue={mockCustomer.zipCode}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

function DetailTabs({ editing = false }: { editing?: boolean }) {
  return (
    <Tabs defaultValue="info" className="w-full">
      <TabsList className="grid w-full grid-cols-4 h-12 mb-4">
        <TabsTrigger value="info">Geral</TabsTrigger>
        <TabsTrigger value="address">Endereço</TabsTrigger>
        <TabsTrigger value="history">Histórico</TabsTrigger>
        <TabsTrigger value="documents">Documentos</TabsTrigger>
      </TabsList>

      <TabsContent value="info" className="space-y-6">
        {editing ? <EditTabContent /> : <ViewTabContent />}
      </TabsContent>

      <TabsContent value="address" className="space-y-6">
        <Card className="bg-white/5 py-2 overflow-hidden">
          <div className="px-6 py-4">
            <div className="w-full rounded-xl border border-border bg-white p-6 dark:bg-slate-800/60">
              <p className="text-sm text-muted-foreground">
                {mockCustomer.address}, {mockCustomer.city} -{' '}
                {mockCustomer.state}, {mockCustomer.zipCode}
              </p>
            </div>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="history" className="space-y-6">
        <Card className="bg-white/5 py-2 overflow-hidden">
          <div className="px-6 py-4">
            <div className="w-full rounded-xl border border-border bg-white p-6 dark:bg-slate-800/60">
              <p className="text-sm text-muted-foreground">
                Nenhuma negociação registrada nos últimos 90 dias.
              </p>
            </div>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="documents" className="space-y-6">
        <Card className="bg-white/5 py-2 overflow-hidden">
          <div className="px-6 py-4">
            <div className="w-full rounded-xl border border-border bg-white p-6 dark:bg-slate-800/60">
              <p className="text-sm text-muted-foreground">
                Nenhum documento anexado.
              </p>
            </div>
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <Card className="p-12 text-center">
      <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/30 flex items-center justify-center mx-auto mb-4">
        <AlertTriangle className="w-8 h-8 text-rose-500" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold mb-2">
        Não foi possível carregar o cliente
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Ocorreu uma falha ao buscar os dados. Verifique sua conexão e tente
        novamente.
      </p>
      <Button variant="outline" onClick={onRetry}>
        Tentar novamente
      </Button>
    </Card>
  );
}

// ============================================================================
// RENDERERS (one per state — no inline hooks per project lint rules)
// ============================================================================

function DefaultRender() {
  return (
    <div className="bg-background min-h-screen">
      <PageHeader
        title={mockCustomer.name}
        description="Detalhes do cliente"
        icon={<User />}
        gradient="from-blue-500 to-indigo-600"
        showBackButton={false}
      />
      <PageLayout className="px-8 py-6">
        <PageHeaderShell>
          <PageActionBar
            breadcrumbItems={breadcrumbItems}
            actions={
              <>
                <Button
                  size="sm"
                  variant="destructive"
                  aria-label="Excluir cliente"
                >
                  <Trash2 className="size-4" aria-hidden="true" /> Excluir
                </Button>
                <Button size="sm" aria-label="Salvar alterações do cliente">
                  <Save className="size-4" aria-hidden="true" /> Salvar
                </Button>
              </>
            }
          />
        </PageHeaderShell>
        <PageBody>
          <IdentityCard />
          <DetailTabs editing={false} />
        </PageBody>
      </PageLayout>
    </div>
  );
}

function EditingRender() {
  const [name, setName] = useState(mockCustomer.name);
  return (
    <div className="bg-background min-h-screen">
      <PageHeader
        title={name}
        description="Editando cliente"
        icon={<User />}
        gradient="from-blue-500 to-indigo-600"
        showBackButton={false}
      />
      <PageLayout className="px-8 py-6">
        <PageHeaderShell>
          <PageActionBar
            breadcrumbItems={breadcrumbItems}
            actions={
              <>
                <Button
                  size="sm"
                  variant="outline"
                  aria-label="Cancelar edição"
                >
                  <X className="size-4" aria-hidden="true" /> Cancelar
                </Button>
                <Button size="sm" aria-label="Salvar alterações do cliente">
                  <Save className="size-4" aria-hidden="true" /> Salvar
                </Button>
              </>
            }
          />
        </PageHeaderShell>
        <PageBody>
          {/* Live identity card mirroring the name field */}
          <Card className="bg-white/5 p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl shadow-lg bg-linear-to-br from-blue-500 to-indigo-600">
                <User className="h-7 w-7 text-white" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <Label htmlFor="identity-name" className="text-xs">
                  Nome do cliente
                </Label>
                <Input
                  id="identity-name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  {mockCustomer.createdAt}
                </p>
              </div>
            </div>
          </Card>
          <DetailTabs editing />
        </PageBody>
      </PageLayout>
    </div>
  );
}

function LoadingRender() {
  return (
    <div className="bg-background min-h-screen">
      <PageHeader
        title="Cliente"
        description="Carregando detalhes…"
        icon={<User />}
        gradient="from-blue-500 to-indigo-600"
        showBackButton={false}
      />
      <PageLayout className="px-8 py-6">
        <PageHeaderShell>
          <PageActionBar breadcrumbItems={breadcrumbItems} />
        </PageHeaderShell>
        <PageBody>
          <DetailSkeleton />
        </PageBody>
      </PageLayout>
    </div>
  );
}

function ErrorRender() {
  const [retryCount, setRetryCount] = useState(0);
  return (
    <div className="bg-background min-h-screen">
      <PageHeader
        title="Cliente"
        description="Falha ao carregar"
        icon={<User />}
        gradient="from-blue-500 to-indigo-600"
        showBackButton={false}
      />
      <PageLayout className="px-8 py-6">
        <PageHeaderShell>
          <PageActionBar breadcrumbItems={breadcrumbItems} />
        </PageHeaderShell>
        <PageBody>
          <ErrorState onRetry={() => setRetryCount(c => c + 1)} />
          <p className="sr-only" aria-live="polite">
            Tentativas: {retryCount}
          </p>
        </PageBody>
      </PageLayout>
    </div>
  );
}

// ============================================================================
// STORIES
// ============================================================================

export const Default: Story = { render: () => <DefaultRender /> };

export const Editing: Story = { render: () => <EditingRender /> };

export const Loading: Story = { render: () => <LoadingRender /> };

export const Error: Story = { render: () => <ErrorRender /> };

export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: () => <DefaultRender />,
};
