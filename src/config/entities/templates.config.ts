import {
  EntityFormConfig,
  EntityViewerConfig,
  MultiViewModalConfig,
} from '@/types/entity-config';
import { Template } from '@/types/stock';

/**
 * Configuração do formulário de Template
 * Define campos, validações e estrutura de abas
 */
export const createTemplateFormConfig = (
  template?: Template,
  onSubmit?: (data: any) => Promise<void>,
  onCancel?: () => void
): EntityFormConfig => ({
  entity: 'Template',
  tabs: [
    {
      id: 'geral',
      label: 'Geral',
      sections: [
        {
          title: 'Informações Básicas',
          description: 'Defina o nome e identificação do template',
          fields: [
            {
              name: 'name',
              label: 'Nome do Template',
              type: 'text',
              required: true,
              placeholder: 'Digite o nome do template',
              validation: {
                min: 3,
                custom: (value: string) => {
                  if (value && value.length < 3) {
                    return 'Nome deve ter pelo menos 3 caracteres';
                  }
                  return true;
                },
              },
            },
          ],
        },
      ],
    },
    {
      id: 'produto',
      label: 'Produto',
      sections: [],
      attributes: {
        singular: 'Atributo do Produto',
        plural: 'Atributos do Produto',
        keyLabel: 'Chave',
        valueLabel: 'Valor',
        keyPlaceholder: 'ex: Material',
        valuePlaceholder: 'ex: Algodão',
      },
    },
    {
      id: 'variante',
      label: 'Variante',
      sections: [],
      attributes: {
        singular: 'Atributo da Variante',
        plural: 'Atributos da Variante',
        keyLabel: 'Chave',
        valueLabel: 'Valor',
        keyPlaceholder: 'ex: Cor',
        valuePlaceholder: 'ex: Azul',
      },
    },
    {
      id: 'item',
      label: 'Item',
      sections: [],
      attributes: {
        singular: 'Atributo do Item',
        plural: 'Atributos do Item',
        keyLabel: 'Chave',
        valueLabel: 'Valor',
        keyPlaceholder: 'ex: Lote',
        valuePlaceholder: 'ex: L001',
      },
    },
  ],
  defaultValues: template
    ? {
        name: template.name,
        produtoAttributes: objectToArray(template.productAttributes),
        varianteAttributes: objectToArray(template.variantAttributes),
        itemAttributes: objectToArray(template.itemAttributes),
      }
    : {
        name: '',
        produtoAttributes: [],
        varianteAttributes: [],
        itemAttributes: [],
      },
  onSubmit: onSubmit || (async () => {}),
  onCancel,
  submitLabel: template ? 'Salvar Alterações' : 'Criar Template',
  cancelLabel: 'Cancelar',
});

/**
 * Configuração do visualizador de Template
 * Define como os dados são exibidos
 */
export const createTemplateViewerConfig = (
  template: Template
): EntityViewerConfig => {
  const productAttrs = objectToArray(template.productAttributes);
  const variantAttrs = objectToArray(template.variantAttributes);
  const itemAttrs = objectToArray(template.itemAttributes);

  return {
    entity: 'Template',
    data: template,
    tabs: [
      {
        id: 'geral',
        label: 'Geral',
        sections: [
          {
            title: 'Informações Básicas',
            fields: [
              { label: 'Nome', value: template.name },
              {
                label: 'Criado em',
                value: new Date(template.createdAt).toLocaleDateString('pt-BR'),
                type: 'date',
              },
            ],
          },
        ],
      },
      {
        id: 'produto',
        label: 'Produto',
        sections: [
          {
            title: 'Atributos do Produto',
            fields:
              productAttrs.length > 0
                ? productAttrs.map(attr => ({
                    label: attr.key,
                    value: attr.value,
                  }))
                : [{ label: '', value: 'Nenhum atributo definido' }],
          },
        ],
      },
      {
        id: 'variante',
        label: 'Variante',
        sections: [
          {
            title: 'Atributos da Variante',
            fields:
              variantAttrs.length > 0
                ? variantAttrs.map(attr => ({
                    label: attr.key,
                    value: attr.value,
                  }))
                : [{ label: '', value: 'Nenhum atributo definido' }],
          },
        ],
      },
      {
        id: 'item',
        label: 'Item',
        sections: [
          {
            title: 'Atributos do Item',
            fields:
              itemAttrs.length > 0
                ? itemAttrs.map(attr => ({
                    label: attr.key,
                    value: attr.value,
                  }))
                : [{ label: '', value: 'Nenhum atributo definido' }],
          },
        ],
      },
    ],
    allowEdit: true,
    editLabel: 'Editar',
  };
};

/**
 * Configuração do modal multi-visualização de Templates
 */
export const createTemplateModalConfig = (
  items: Template[],
  activeId: string | null,
  callbacks: {
    onActiveChange: (id: string) => void;
    onClose: (id: string) => void;
    onCloseAll: () => void;
    onSearch?: (query: string) => Promise<Template[]>;
    onSelect?: (template: Template) => void;
    onSave?: (id: string, data: any) => Promise<void>;
    onDelete?: (id: string) => Promise<void>;
  }
): MultiViewModalConfig<Template> => ({
  entity: 'Template',
  entityPlural: 'Templates',
  items,
  activeId,
  onActiveChange: callbacks.onActiveChange,
  onClose: callbacks.onClose,
  onCloseAll: callbacks.onCloseAll,
  viewerConfig: (template: Template) => createTemplateViewerConfig(template),
  formConfig: (template: Template) =>
    createTemplateFormConfig(
      template,
      callbacks.onSave
        ? data => callbacks.onSave!(template.id, data)
        : undefined
    ),
  compareEnabled: true,
  compareConfig: {
    maxItems: 3,
    fields: [
      'name',
      'productAttributes',
      'variantAttributes',
      'itemAttributes',
    ],
  },
  searchEnabled: Boolean(callbacks.onSearch && callbacks.onSelect),
  searchConfig:
    callbacks.onSearch && callbacks.onSelect
      ? {
          onSearch: callbacks.onSearch,
          onSelect: callbacks.onSelect,
          placeholder: 'Buscar templates...',
        }
      : undefined,
  onSave: callbacks.onSave,
  onDelete: callbacks.onDelete,
});

// ==================== HELPER FUNCTIONS ====================

/**
 * Converte objeto de atributos para array
 */
function objectToArray(
  obj: Record<string, unknown> | undefined
): Array<{ key: string; value: string }> {
  if (!obj) return [];
  return Object.entries(obj).map(([key, value]) => ({
    key,
    value: String(value),
  }));
}

/**
 * Converte array de atributos para objeto
 */
export function arrayToObject(
  arr: Array<{ key: string; value: string }>
): Record<string, unknown> {
  return arr.reduce(
    (acc, { key, value }) => {
      if (key) {
        acc[key] = value;
      }
      return acc;
    },
    {} as Record<string, unknown>
  );
}

/**
 * Formata dados do formulário para envio à API
 */
export function formatTemplateFormData(formData: any) {
  return {
    name: formData.name,
    productAttributes: arrayToObject(formData.produtoAttributes || []),
    variantAttributes: arrayToObject(formData.varianteAttributes || []),
    itemAttributes: arrayToObject(formData.itemAttributes || []),
  };
}
