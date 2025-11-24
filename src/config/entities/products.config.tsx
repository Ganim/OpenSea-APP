/**
 * Products Entity Configuration
 * Configuração completa da entidade Product para componentes genéricos
 */

import type {
  EntityFormConfig,
  EntityViewerConfig,
  MultiViewModalConfig,
} from '@/types/entity-config';

// Configuração do formulário de Product
export const productFormConfig: EntityFormConfig = {
  entity: 'Product',
  onSubmit: async data => {
    console.log('Submitting product data:', data);
    // Implementar lógica de submissão
  },
  tabs: [
    {
      id: 'basic',
      label: 'Informações Básicas',
      sections: [
        {
          title: 'Informações Gerais',
          description: 'Dados básicos do produto',
          fields: [
            {
              name: 'name',
              label: 'Nome do Produto',
              type: 'text',
              placeholder: 'Digite o nome do produto',
              required: true,
              description: 'Nome único do produto',
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
              placeholder: 'Ex: PROD-001',
              required: true,
              description: 'Código único de identificação do produto',
            },
            {
              name: 'description',
              label: 'Descrição',
              type: 'textarea',
              placeholder: 'Descreva o produto...',
            },
            {
              name: 'category',
              label: 'Categoria',
              type: 'select',
              placeholder: 'Selecione uma categoria',
              options: [
                { value: 'electronics', label: 'Eletrônicos' },
                { value: 'clothing', label: 'Vestuário' },
                { value: 'food', label: 'Alimentos' },
                { value: 'books', label: 'Livros' },
                { value: 'toys', label: 'Brinquedos' },
              ],
            },
          ],
        },
        {
          title: 'Precificação',
          description: 'Informações de preço e custo',
          fields: [
            {
              name: 'price',
              label: 'Preço de Venda',
              type: 'number',
              placeholder: '0.00',
              required: true,
              validation: {
                custom: value => {
                  if (value <= 0) {
                    return 'Preço deve ser maior que zero';
                  }
                  return true;
                },
              },
            },
            {
              name: 'cost',
              label: 'Custo',
              type: 'number',
              placeholder: '0.00',
            },
            {
              name: 'taxable',
              label: 'Tributável',
              type: 'switch',
              description: 'Produto sujeito a impostos',
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
              name: 'trackInventory',
              label: 'Rastrear Estoque',
              type: 'switch',
              description: 'Ativar controle de estoque para este produto',
            },
            {
              name: 'quantity',
              label: 'Quantidade',
              type: 'number',
              placeholder: '0',
            },
            {
              name: 'minQuantity',
              label: 'Quantidade Mínima',
              type: 'number',
              placeholder: '0',
              description: 'Alerta quando estoque atingir este nível',
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
          description: 'Adicione atributos customizados para este produto',
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

// Configuração do visualizador de Product
export const productViewerConfig = (data: any): EntityViewerConfig => ({
  entity: 'Product',
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
          label: 'Descrição',
          value: data.description,
          type: 'text',
        },
        {
          label: 'Categoria',
          value: data.category,
          type: 'text',
        },
      ],
    },
    {
      title: 'Precificação',
      fields: [
        {
          label: 'Preço',
          value: data.price,
          type: 'text',
          render: value => `R$ ${Number(value).toFixed(2)}`,
        },
        {
          label: 'Custo',
          value: data.cost,
          type: 'text',
          render: value => `R$ ${Number(value).toFixed(2)}`,
        },
        {
          label: 'Tributável',
          value: data.taxable,
          type: 'badge',
          render: value => (value ? 'Sim' : 'Não'),
        },
      ],
    },
    {
      title: 'Estoque',
      fields: [
        {
          label: 'Rastrear Estoque',
          value: data.trackInventory,
          type: 'badge',
          render: value => (value ? 'Sim' : 'Não'),
        },
        {
          label: 'Quantidade',
          value: data.quantity,
          type: 'text',
        },
        {
          label: 'Quantidade Mínima',
          value: data.minQuantity,
          type: 'text',
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

// Configuração do modal multi-visualização de Product
export const productMultiViewConfig: MultiViewModalConfig = {
  entity: 'Product',
  entityPlural: 'Products',
  items: [],
  activeId: null,
  onActiveChange: () => {},
  onClose: () => {},
  onCloseAll: () => {},
  viewerConfig: productViewerConfig,
  formConfig: () => productFormConfig,
};

// Helper functions
export function getProductFormData(data: any) {
  return {
    name: data.name || '',
    sku: data.sku || '',
    description: data.description || '',
    category: data.category || '',
    price: data.price || 0,
    cost: data.cost || 0,
    taxable: data.taxable || false,
    trackInventory: data.trackInventory || false,
    quantity: data.quantity || 0,
    minQuantity: data.minQuantity || 0,
    attributes: data.attributes || {},
  };
}

export function getProductViewData(data: any) {
  return {
    ...data,
    price: data.price || 0,
    cost: data.cost || 0,
    quantity: data.quantity || 0,
    minQuantity: data.minQuantity || 0,
  };
}
