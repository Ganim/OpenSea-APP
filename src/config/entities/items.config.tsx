/**
 * Items Entity Configuration
 * Configuração completa da entidade Item para componentes genéricos
 */

import type {
  EntityFormConfig,
  EntityViewerConfig,
  MultiViewModalConfig,
} from '@/types/entity-config';

// Configuração do formulário de Item
export const itemFormConfig: EntityFormConfig = {
  entity: 'Item',
  onSubmit: async data => {
    console.log('Submitting item data:', data);
    // Implementar lógica de submissão
  },
  tabs: [
    {
      id: 'basic',
      label: 'Informações Básicas',
      sections: [
        {
          title: 'Informações Gerais',
          description: 'Dados básicos do item',
          fields: [
            {
              name: 'serialNumber',
              label: 'Número de Série',
              type: 'text',
              placeholder: 'Ex: SN-123456789',
              required: true,
            },
            {
              name: 'variantId',
              label: 'Variante',
              type: 'text',
              placeholder: 'ID da variante',
              required: true,
            },
            {
              name: 'condition',
              label: 'Condição',
              type: 'select',
              options: [
                { value: 'new', label: 'Novo' },
                { value: 'used', label: 'Usado' },
                { value: 'refurbished', label: 'Recondicionado' },
                { value: 'damaged', label: 'Danificado' },
              ],
              required: true,
            },
          ],
        },
        {
          title: 'Localização',
          description: 'Onde o item está armazenado',
          fields: [
            {
              name: 'warehouse',
              label: 'Armazém',
              type: 'text',
              placeholder: 'Ex: Armazém Central',
            },
            {
              name: 'shelf',
              label: 'Prateleira',
              type: 'text',
              placeholder: 'Ex: A1-B2',
            },
            {
              name: 'bin',
              label: 'Compartimento',
              type: 'text',
              placeholder: 'Ex: C3',
            },
          ],
        },
      ],
    },
    {
      id: 'status',
      label: 'Status',
      sections: [
        {
          title: 'Informações de Status',
          fields: [
            {
              name: 'status',
              label: 'Status',
              type: 'select',
              options: [
                { value: 'available', label: 'Disponível' },
                { value: 'reserved', label: 'Reservado' },
                { value: 'sold', label: 'Vendido' },
                { value: 'in_transit', label: 'Em Trânsito' },
                { value: 'returned', label: 'Devolvido' },
              ],
              required: true,
            },
            {
              name: 'isDefective',
              label: 'Defeituoso',
              type: 'switch',
              description: 'Marcar se o item possui defeito',
            },
            {
              name: 'defectDescription',
              label: 'Descrição do Defeito',
              type: 'textarea',
              placeholder: 'Descreva o defeito...',
            },
          ],
        },
      ],
    },
    {
      id: 'dates',
      label: 'Datas',
      sections: [
        {
          title: 'Datas Importantes',
          fields: [
            {
              name: 'receivedDate',
              label: 'Data de Recebimento',
              type: 'date',
            },
            {
              name: 'expiryDate',
              label: 'Data de Validade',
              type: 'date',
              description: 'Se aplicável',
            },
            {
              name: 'lastInspectedDate',
              label: 'Última Inspeção',
              type: 'date',
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
          fields: [],
        },
      ],
    },
  ],
};

// Configuração do visualizador de Item
export const itemViewerConfig = (data: any): EntityViewerConfig => ({
  entity: 'Item',
  data,
  sections: [
    {
      title: 'Informações Básicas',
      fields: [
        {
          label: 'Número de Série',
          value: data.serialNumber,
          type: 'text',
        },
        {
          label: 'Variante',
          value: data.variantId,
          type: 'text',
        },
        {
          label: 'Condição',
          value: data.condition,
          type: 'badge',
        },
      ],
    },
    {
      title: 'Localização',
      fields: [
        {
          label: 'Armazém',
          value: data.warehouse,
          type: 'text',
        },
        {
          label: 'Prateleira',
          value: data.shelf,
          type: 'text',
        },
        {
          label: 'Compartimento',
          value: data.bin,
          type: 'text',
        },
      ],
    },
    {
      title: 'Status',
      fields: [
        {
          label: 'Status',
          value: data.status,
          type: 'badge',
        },
        {
          label: 'Defeituoso',
          value: data.isDefective,
          type: 'badge',
        },
        {
          label: 'Descrição do Defeito',
          value: data.defectDescription,
          type: 'text',
        },
      ],
    },
    {
      title: 'Datas',
      fields: [
        {
          label: 'Recebimento',
          value: data.receivedDate,
          type: 'text',
          render: value =>
            value ? new Date(value).toLocaleDateString('pt-BR') : '-',
        },
        {
          label: 'Validade',
          value: data.expiryDate,
          type: 'text',
          render: value =>
            value ? new Date(value).toLocaleDateString('pt-BR') : '-',
        },
        {
          label: 'Última Inspeção',
          value: data.lastInspectedDate,
          type: 'text',
          render: value =>
            value ? new Date(value).toLocaleDateString('pt-BR') : '-',
        },
      ],
    },
    {
      title: 'Atributos Personalizados',
      fields: [
        {
          label: 'Atributos',
          value: data.attributes,
          type: 'custom',
          render: value => {
            if (!value || typeof value !== 'object') return '-';
            const attrs = Object.entries(value);
            if (attrs.length === 0) return 'Nenhum atributo';
            return (
              <div className="space-y-1">
                {attrs.map(([key, val]) => (
                  <div key={key} className="text-sm">
                    <span className="font-medium">{key}:</span> {String(val)}
                  </div>
                ))}
              </div>
            );
          },
        },
      ],
    },
  ],
});

// Configuração do modal multi-visualização de Item
export const itemMultiViewConfig: MultiViewModalConfig = {
  entity: 'Item',
  entityPlural: 'Items',
  items: [],
  activeId: null,
  onActiveChange: () => {},
  onClose: () => {},
  onCloseAll: () => {},
  viewerConfig: itemViewerConfig,
  formConfig: () => itemFormConfig,
};

// Helper functions
export function getItemFormData(data: any) {
  return {
    serialNumber: data.serialNumber || '',
    variantId: data.variantId || '',
    condition: data.condition || 'new',
    warehouse: data.warehouse || '',
    shelf: data.shelf || '',
    bin: data.bin || '',
    status: data.status || 'available',
    isDefective: data.isDefective || false,
    defectDescription: data.defectDescription || '',
    receivedDate: data.receivedDate || '',
    expiryDate: data.expiryDate || '',
    lastInspectedDate: data.lastInspectedDate || '',
    attributes: data.attributes || {},
  };
}

export function getItemViewData(data: any) {
  return {
    ...data,
  };
}
