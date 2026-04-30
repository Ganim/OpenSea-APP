import type { Meta, StoryObj } from '@storybook/react';
import { useId, useMemo, useState } from 'react';
import { FileText, MapPin, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PageBody, PageLayout } from '@/components/layout/page-layout';
import { PageHeader } from '@/components/shared/page-header';
import { CollapsibleSection } from '@/components/shared/forms/collapsible-section';

/**
 * Synthetic page-level template that demonstrates the canonical
 * "entity create/edit form page" composition (e.g. `customers/new`,
 * `products/[id]/edit`). There is NO real component called
 * EntityFormPageTemplate — agents/devs should reproduce this layout
 * when scaffolding a new standalone form page.
 *
 * Composition:
 *
 * ```
 * PageHeader (icon + gradient + actions: Cancel + Salvar)
 * PageLayout
 *   PageBody
 *     CollapsibleSection (Dados pessoais)
 *     CollapsibleSection (Endereço)
 *     CollapsibleSection (Observações)
 * ```
 */

const meta = {
  title: 'Pages/EntityFormPageTemplate',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `Template **sintético** (sem componente correspondente) — demonstra a composição canônica de uma página de formulário de criação/edição de entidade (CLAUDE.md §9 + UI Quality Bar — \`CollapsibleSection\` para grupos de campos).

Cada story representa um estado real (default, editing, errors, submitting, sections colapsadas, mobile).`,
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

interface FormState {
  nome: string;
  documento: string;
  email: string;
  telefone: string;
  cep: string;
  logradouro: string;
  numero: string;
  cidade: string;
  uf: string;
  observacoes: string;
}

const EMPTY_FORM: FormState = {
  nome: '',
  documento: '',
  email: '',
  telefone: '',
  cep: '',
  logradouro: '',
  numero: '',
  cidade: '',
  uf: '',
  observacoes: '',
};

const FILLED_FORM: FormState = {
  nome: 'Maria Souza',
  documento: '123.456.789-00',
  email: 'maria.souza@example.com',
  telefone: '(11) 98888-7777',
  cep: '01310-100',
  logradouro: 'Avenida Paulista',
  numero: '1578',
  cidade: 'São Paulo',
  uf: 'SP',
  observacoes: 'Cliente VIP. Entregas preferencialmente no período da manhã.',
};

const UF_OPTIONS = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
];

interface FieldProps {
  label: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  inputMode?: 'text' | 'email' | 'tel' | 'numeric' | 'decimal';
  placeholder?: string;
  autoComplete?: string;
}

const TextField = ({
  label,
  required,
  error,
  disabled,
  value,
  onChange,
  type = 'text',
  inputMode,
  placeholder,
  autoComplete,
}: FieldProps) => {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label}
        {required && (
          <span className="text-rose-500" aria-hidden="true">
            *
          </span>
        )}
      </Label>
      <Input
        id={id}
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <p id={errorId} className="text-sm text-rose-500">
          {error}
        </p>
      )}
    </div>
  );
};

interface UfSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
}

const UfSelect = ({
  value,
  onChange,
  disabled,
  required,
  error,
}: UfSelectProps) => {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        UF
        {required && (
          <span className="text-rose-500" aria-hidden="true">
            *
          </span>
        )}
      </Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger
          id={id}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
        >
          <SelectValue placeholder="Selecione" />
        </SelectTrigger>
        <SelectContent>
          {UF_OPTIONS.map(uf => (
            <SelectItem key={uf} value={uf}>
              {uf}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p id={errorId} className="text-sm text-rose-500">
          {error}
        </p>
      )}
    </div>
  );
};

interface ObservacoesFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const ObservacoesField = ({
  value,
  onChange,
  disabled,
}: ObservacoesFieldProps) => {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>Observações</Label>
      <Textarea
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Anote informações úteis sobre o cliente"
        rows={4}
      />
    </div>
  );
};

interface ActionBarProps {
  submitting?: boolean;
}

const ActionBar = ({ submitting }: ActionBarProps) => (
  <>
    <Button size="sm" variant="outline" disabled={submitting}>
      Cancelar
    </Button>
    <Button size="sm" disabled={submitting}>
      {submitting ? 'Salvando...' : 'Salvar'}
    </Button>
  </>
);

type TemplateState =
  | 'default'
  | 'editing'
  | 'errors'
  | 'submitting'
  | 'collapsed';

interface TemplateProps {
  state?: TemplateState;
}

const Template = ({ state = 'default' }: TemplateProps) => {
  const initialValues = useMemo<FormState>(() => {
    if (state === 'editing' || state === 'submitting' || state === 'errors') {
      return FILLED_FORM;
    }
    return EMPTY_FORM;
  }, [state]);

  const [form, setForm] = useState<FormState>(initialValues);
  const isSubmitting = state === 'submitting';

  const errors = useMemo<Partial<Record<keyof FormState, string>>>(() => {
    if (state !== 'errors') return {};
    return {
      email: 'Informe um e-mail válido',
      cep: 'CEP não encontrado. Verifique e tente novamente.',
    };
  }, [state]);

  const update = (key: keyof FormState) => (value: string) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const isEditing = state === 'editing' || state === 'submitting';
  const sectionsCollapsed = state === 'collapsed';

  return (
    <div className="bg-background min-h-screen">
      <PageHeader
        title={isEditing ? 'Editar cliente' : 'Novo cliente'}
        description={
          isEditing
            ? 'Atualize os dados do cadastro'
            : 'Preencha os dados para cadastrar um novo cliente'
        }
        icon={<UserPlus />}
        gradient="from-emerald-500 to-teal-600"
        showBackButton={false}
        actions={<ActionBar submitting={isSubmitting} />}
      />
      <PageLayout className="px-8 py-6">
        <PageBody>
          <CollapsibleSection
            icon={UserPlus}
            title="Dados pessoais"
            subtitle="Informações de identificação do cliente"
            accent="violet"
            defaultOpen
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                label="Nome"
                required
                disabled={isSubmitting}
                value={form.nome}
                onChange={update('nome')}
                placeholder="Nome completo"
                autoComplete="name"
              />
              <TextField
                label="CPF / CNPJ"
                required
                disabled={isSubmitting}
                value={form.documento}
                onChange={update('documento')}
                placeholder="000.000.000-00"
                inputMode="numeric"
              />
              <TextField
                label="Email"
                required
                disabled={isSubmitting}
                error={errors.email}
                value={form.email}
                onChange={update('email')}
                type="email"
                inputMode="email"
                placeholder="cliente@exemplo.com"
                autoComplete="email"
              />
              <TextField
                label="Telefone"
                disabled={isSubmitting}
                value={form.telefone}
                onChange={update('telefone')}
                type="tel"
                inputMode="tel"
                placeholder="(00) 00000-0000"
                autoComplete="tel"
              />
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            icon={MapPin}
            title="Endereço"
            subtitle="Endereço principal de cobrança e entrega"
            accent="sky"
            defaultOpen={!sectionsCollapsed}
          >
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="md:col-span-2">
                <TextField
                  label="CEP"
                  required
                  disabled={isSubmitting}
                  error={errors.cep}
                  value={form.cep}
                  onChange={update('cep')}
                  placeholder="00000-000"
                  inputMode="numeric"
                  autoComplete="postal-code"
                />
              </div>
              <div className="md:col-span-3">
                <TextField
                  label="Logradouro"
                  required
                  disabled={isSubmitting}
                  value={form.logradouro}
                  onChange={update('logradouro')}
                  placeholder="Rua, avenida, travessa..."
                  autoComplete="address-line1"
                />
              </div>
              <div>
                <TextField
                  label="Número"
                  disabled={isSubmitting}
                  value={form.numero}
                  onChange={update('numero')}
                  placeholder="123"
                  inputMode="numeric"
                />
              </div>
              <div className="md:col-span-4">
                <TextField
                  label="Cidade"
                  required
                  disabled={isSubmitting}
                  value={form.cidade}
                  onChange={update('cidade')}
                  placeholder="Cidade"
                  autoComplete="address-level2"
                />
              </div>
              <div className="md:col-span-2">
                <UfSelect
                  value={form.uf}
                  onChange={update('uf')}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            icon={FileText}
            title="Observações"
            subtitle="Notas internas (opcional)"
            accent="amber"
            defaultOpen={!sectionsCollapsed}
          >
            <ObservacoesField
              value={form.observacoes}
              onChange={update('observacoes')}
              disabled={isSubmitting}
            />
          </CollapsibleSection>
        </PageBody>
      </PageLayout>
    </div>
  );
};

const DefaultRender = () => <Template state="default" />;
const EditingRender = () => <Template state="editing" />;
const WithErrorsRender = () => <Template state="errors" />;
const SubmittingRender = () => <Template state="submitting" />;
const CollapsedRender = () => <Template state="collapsed" />;
const MobileRender = () => <Template state="default" />;

export const Default: Story = { render: () => <DefaultRender /> };
export const Editing: Story = { render: () => <EditingRender /> };
export const WithErrors: Story = { render: () => <WithErrorsRender /> };
export const Submitting: Story = { render: () => <SubmittingRender /> };
export const CollapsedSections: Story = {
  render: () => <CollapsedRender />,
};
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: () => <MobileRender />,
};
