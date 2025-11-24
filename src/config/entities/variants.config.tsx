/**
 * Variants Entity Configuration
 * Configuração completa da entidade Variant para componentes genéricos
 */

import type {
  EntityFormConfig,
  EntityViewerConfig,
  MultiViewModalConfig,
} from '@/types/entity-config';

// Configuração do formulário de Variant
export const variantFormConfig: EntityFormConfig = {
  entity: 'Variant',
  onSubmit: async data => {
    console.log('Submitting variant data:', data);
    // Implementar lógica de submissão
  },
  tabs: [
    {
      id: 'basic',
      label: 'Informações Básicas',
      sections: [
        {
          title: 'Informações Gerais',
          description: 'Dados básicos da variante',
          fields: [
            {
              name: 'name',
              label: 'Nome da Variante',
              type: 'text',
              placeholder: 'Digite o nome da variante',
              required: true,
              description: 'Nome único da variante',
              validation: {
                custom: value => {
                  if (!value || value.length < 3) {
                    return 'Nome deve ter no mínimo 3 caracteres';
                  }
                  return true;
                },
              },
            },
            {
              name: 'sku',
              label: 'SKU',
              type: 'text',
              placeholder: 'Ex: VAR-001-RED',
              required: true,
              description: 'Código único da variante',
            },
            {
              name: 'productId',
              label: 'Produto',
              type: 'text',
              placeholder: 'ID do produto',
              required: true,
            },
          ],
        },
        {
          title: 'Opções da Variante',
          description: 'Defina as características específicas',
          fields: [
            {
              name: 'color',
              label: 'Cor',
              type: 'text',
              placeholder: 'Ex: Vermelho',
            },
            {
              name: 'size',
              label: 'Tamanho',
              type: 'select',
              options: [
                { value: 'xs', label: 'XS' },
                { value: 's', label: 'S' },
                { value: 'm', label: 'M' },
                { value: 'l', label: 'L' },
                { value: 'xl', label: 'XL' },
                { value: 'xxl', label: 'XXL' },
              ],
            },
            {
              name: 'material',
              label: 'Material',
              type: 'text',
              placeholder: 'Ex: Algodão',
            },
          ],
        },
      ],
    },
    {
      id: 'pricing',
      label: 'Preço',
      sections: [
        {
          title: 'Informações de Preço',
          fields: [
            {
              name: 'priceAdjustment',
              label: 'Ajuste de Preço',
              type: 'number',
              placeholder: '0.00',
              description:
                'Valor adicional ou desconto em relação ao produto base',
            },
            {
              name: 'compareAtPrice',
              label: 'Preço Comparativo',
              type: 'number',
              placeholder: '0.00',
              description: 'Preço original para mostrar desconto',
            },
          ],
        },
      ],
    },
    {
      id: 'inventory',
      label: 'Estoque',
      sections: [
        {
          title: 'Controle de Estoque',
          fields: [
            {
              name: 'quantity',
              label: 'Quantidade',
              type: 'number',
              placeholder: '0',
              required: true,
            },
            {
              name: 'weight',
              label: 'Peso (kg)',
              type: 'number',
              placeholder: '0.00',
            },
            {
              name: 'available',
              label: 'Disponível',
              type: 'switch',
              description: 'Variante disponível para venda',
            },
          ],
        },
      ],
    },
    {
      id: 'attributes',
      label: 'Atributos',
      sections: [
        {
          title: 'Atributos Personalizados',
          fields: [
            {
              name: 'attributes',
              label: 'Atributos',
              type: 'text',
            },
          ],
        },
      ],
    },
  ],
};

// Configuração do visualizador de Variant
export const variantViewerConfig = (data: any): EntityViewerConfig => ({
  entity: 'Variant',
  data,
  sections: [
    {
      title: 'Informações Básicas',
      fields: [
        {
          label: 'Nome',
          value: data.name,
          type: 'text',
        },
        {
          label: 'SKU',
          value: data.sku,
          type: 'text',
        },
        {
          label: 'Produto',
          value: data.productId,
          type: 'text',
        },
      ],
    },
    {
      title: 'Opções',
      fields: [
        {
          label: 'Cor',
          value: data.color,
          type: 'text',
        },
        {
          label: 'Tamanho',
          value: data.size,
          type: 'text',
        },
        {
          label: 'Material',
          value: data.material,
          type: 'text',
        },
      ],
    },
    {
      title: 'Preço',
      fields: [
        {
          label: 'Ajuste de Preço',
          value: data.priceAdjustment,
          type: 'text',
          render: value => `R$ ${Number(value).toFixed(2)}`,
        },
        {
          label: 'Preço Comparativo',
          value: data.compareAtPrice,
          type: 'text',
          render: value => `R$ ${Number(value).toFixed(2)}`,
        },
      ],
    },
    {
      title: 'Estoque',
      fields: [
        {
          label: 'Quantidade',
          value: data.quantity,
          type: 'text',
        },
        {
          label: 'Peso',
          value: data.weight,
          type: 'text',
          render: value => `${Number(value).toFixed(2)} kg`,
        },
        {
          label: 'Disponível',
          value: data.available,
          type: 'badge',
          render: value => (value ? 'Sim' : 'Não'),
        },
      ],
    },
    {
      title: 'Atributos Personalizados',
      fields: [
        {
          label: 'Atributos',
          value: data.attributes,
          type: 'text',
        },
      ],
    },
  ],
});

// Configuração do modal multi-visualização de Variant
export const variantMultiViewConfig: MultiViewModalConfig = {
  entity: 'Variant',
  entityPlural: 'Variants',
  items: [],
  activeId: null,
  onActiveChange: () => {},
  onClose: () => {},
  onCloseAll: () => {},
  viewerConfig: variantViewerConfig,
  formConfig: () => variantFormConfig,
};

// Helper functions
export function getVariantFormData(data: any) {
  return {
    name: data.name || '',
    sku: data.sku || '',
    productId: data.productId || '',
    color: data.color || '',
    size: data.size || '',
    material: data.material || '',
    priceAdjustment: data.priceAdjustment || 0,
    compareAtPrice: data.compareAtPrice || 0,
    quantity: data.quantity || 0,
    weight: data.weight || 0,
    available: data.available !== undefined ? data.available : true,
    attributes: data.attributes || {},
  };
}

export function getVariantViewData(data: any) {
  return {
    ...data,
    priceAdjustment: data.priceAdjustment || 0,
    compareAtPrice: data.compareAtPrice || 0,
    quantity: data.quantity || 0,
    weight: data.weight || 0,
  };
}
