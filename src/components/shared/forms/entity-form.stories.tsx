import type { Meta, StoryObj } from '@storybook/react';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import type { EntityFormConfig, EntityFormRef } from '@/types/entity-config';
import { EntityForm } from './entity-form';

const meta = {
  title: 'Shared/Forms/EntityForm',
  component: EntityForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'EntityForm genérico (config-driven). Recebe `config: EntityFormConfig` com `entity`, `sections` ou `tabs`, `defaultValues`, `onSubmit`, `loading`. Validação via `field.required` e `field.validation.custom`. Expõe ref com `submit/getData/reset/setFieldValue`.',
      },
    },
  },
} satisfies Meta<typeof EntityForm>;

export default meta;
type Story = StoryObj<typeof meta>;

const productSections: EntityFormConfig['sections'] = [
  {
    title: 'Dados básicos',
    description: 'Identificação do produto no catálogo',
    fields: [
      {
        name: 'name',
        label: 'Nome',
        type: 'text',
        placeholder: 'Camiseta Algodão Premium',
        required: true,
      },
      {
        name: 'sku',
        label: 'SKU',
        type: 'text',
        placeholder: 'CAM-001',
        required: true,
        description: 'Código único do produto.',
      },
      {
        name: 'description',
        label: 'Descrição',
        type: 'textarea',
        placeholder: 'Descrição detalhada do produto…',
      },
    ],
  },
  {
    title: 'Comercial',
    description: 'Preço e disponibilidade',
    fields: [
      {
        name: 'price',
        label: 'Preço (R$)',
        type: 'number',
        placeholder: '0,00',
        required: true,
      },
      {
        name: 'stock',
        label: 'Estoque inicial',
        type: 'number',
        placeholder: '0',
      },
      {
        name: 'active',
        label: 'Produto ativo',
        type: 'switch',
        defaultValue: true,
      },
    ],
  },
];

const wrap = (children: React.ReactNode) => (
  <div className="bg-background min-h-[600px] p-6">{children}</div>
);

const buildConfig = (
  overrides: Partial<EntityFormConfig> = {}
): EntityFormConfig => ({
  entity: 'Produto',
  sections: productSections,
  onSubmit: async data => {
    alert(`Submit: ${JSON.stringify(data, null, 2)}`);
  },
  submitLabel: 'Salvar',
  cancelLabel: 'Cancelar',
  ...overrides,
});

export const Default: Story = {
  render: () => wrap(<EntityForm config={buildConfig()} />),
};

export const Editing: Story = {
  render: () =>
    wrap(
      <EntityForm
        config={buildConfig({
          defaultValues: {
            name: 'Camiseta Algodão Premium',
            sku: 'CAM-001',
            description: 'Camiseta unissex 100% algodão.',
            price: 89.9,
            stock: 42,
            active: true,
          },
        })}
      />
    ),
};

export const Submitting: Story = {
  render: () => wrap(<EntityForm config={buildConfig({ loading: true })} />),
};

export const WithRefControl: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Demo do `EntityFormRef`: botão externo aciona `submit()` via ref, sem precisar de submit dentro do form.',
      },
    },
  },
  render: () => {
    const formRef = useRef<EntityFormRef>(null);
    return wrap(
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={() => formRef.current?.submit()}>
            Submit via ref
          </Button>
          <Button variant="outline" onClick={() => formRef.current?.reset()}>
            Reset via ref
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              formRef.current?.setFieldValue('name', 'Valor injetado')
            }
          >
            Set name field
          </Button>
        </div>
        <EntityForm ref={formRef} config={buildConfig()} />
      </div>
    );
  },
};

export const Dark: Story = {
  globals: { theme: 'dark' },
  render: () => wrap(<EntityForm config={buildConfig()} />),
};
