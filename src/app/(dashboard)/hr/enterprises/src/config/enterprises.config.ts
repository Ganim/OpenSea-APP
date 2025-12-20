import type { Enterprise } from '@/types/hr';
import { Building2 } from 'lucide-react';

interface ColumnConfig {
  key: string;
  label: string;
  width: number;
  sortable: boolean;
  filterable: boolean;
  render: (value: string | number | null | undefined) => string;
}

interface ActionsConfig {
  canCreate: boolean;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canDuplicate: boolean;
}

interface EnterprisesConfigType {
  entity: {
    name: string;
    namePlural: string;
    icon: typeof Building2;
  };
  columns: ColumnConfig[];
  actions: ActionsConfig;
  display: {
    labels: {
      searchPlaceholder: string;
      emptyStateTitle: string;
      emptyStateDescription: string;
    };
  };
}

export const enterprisesConfig: EnterprisesConfigType = {
  entity: {
    name: 'Empresa',
    namePlural: 'Empresas',
    icon: Building2,
  },
  columns: [
    {
      key: 'legalName',
      label: 'Razão Social',
      width: 300,
      sortable: true,
      filterable: true,
      render: (value: string | number | null | undefined) =>
        String(value ?? ''),
    },
    {
      key: 'cnpj',
      label: 'CNPJ',
      width: 150,
      sortable: true,
      filterable: true,
      render: (value: string | number | null | undefined) => {
        const cnpj = String(value ?? '');
        return cnpj.replace(
          /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
          '$1.$2.$3/$4-$5'
        );
      },
    },
    {
      key: 'taxRegime',
      label: 'Regime Tributário',
      width: 180,
      sortable: true,
      filterable: true,
      render: (value: string | number | null | undefined) =>
        String(value ?? '—'),
    },
    {
      key: 'city',
      label: 'Cidade',
      width: 180,
      sortable: true,
      filterable: true,
      render: (value: string | number | null | undefined) =>
        String(value ?? '—'),
    },
    {
      key: 'state',
      label: 'Estado',
      width: 100,
      sortable: true,
      filterable: true,
      render: (value: string | number | null | undefined) =>
        String(value ?? '—'),
    },
    {
      key: 'phone',
      label: 'Telefone',
      width: 150,
      sortable: false,
      filterable: true,
      render: (value: string | number | null | undefined) =>
        String(value ?? '—'),
    },
    {
      key: 'createdAt',
      label: 'Data de Criação',
      width: 160,
      sortable: true,
      filterable: false,
      render: (value: string | number | null | undefined) => {
        const date = new Date(String(value ?? ''));
        return date.toLocaleDateString('pt-BR');
      },
    },
  ],
  actions: {
    canCreate: true,
    canView: true,
    canEdit: true,
    canDelete: true,
    canDuplicate: true,
  },
  display: {
    labels: {
      searchPlaceholder: 'Buscar empresa por razão social, CNPJ ou cidade...',
      emptyStateTitle: 'Nenhuma empresa encontrada',
      emptyStateDescription:
        'Comece a criar a primeira empresa ou ajuste seus filtros',
    },
  },
};
