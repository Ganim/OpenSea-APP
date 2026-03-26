/**
 * OpenSea OS - Geofence Zones Entity Config
 */

import { HR_PERMISSIONS } from '@/config/rbac/permission-codes';
import { defineEntityConfig } from '@/core/types';
import type { GeofenceZone } from '@/types/hr';
import { Copy, Edit, Eye, MapPin, Plus, Trash2 } from 'lucide-react';

export const geofenceZonesConfig = defineEntityConfig<GeofenceZone>()({
  // ======================== IDENTIFICAÇÃO ========================
  name: 'GeofenceZone',
  namePlural: 'GeofenceZones',
  slug: 'geofence-zones',
  description: 'Gerenciamento de zonas de geofencing para controle de ponto',
  icon: MapPin,

  // ======================== API ========================
  api: {
    baseUrl: '/api/v1/hr/geofence-zones',
    queryKey: 'geofence-zones',
    queryKeys: {
      list: ['geofence-zones'],
      detail: (id: string) => ['geofence-zones', id],
    },
    endpoints: {
      list: '/v1/hr/geofence-zones',
      get: '/v1/hr/geofence-zones/:id',
      create: '/v1/hr/geofence-zones',
      update: '/v1/hr/geofence-zones/:id',
      delete: '/v1/hr/geofence-zones/:id',
    },
  },

  // ======================== ROTAS ========================
  routes: {
    list: '/hr/geofence-zones',
    detail: '/hr/geofence-zones/:id',
    create: '/hr/geofence-zones/new',
    edit: '/hr/geofence-zones/:id/edit',
  },

  // ======================== DISPLAY ========================
  display: {
    icon: MapPin,
    color: 'teal',
    gradient: 'from-teal-500 to-emerald-600',
    titleField: 'name',
    subtitleField: 'address',
    imageField: undefined,
    labels: {
      singular: 'Zona de Geofencing',
      plural: 'Zonas de Geofencing',
      createButton: 'Nova Zona',
      editButton: 'Editar',
      deleteButton: 'Excluir',
      emptyState: 'Nenhuma zona de geofencing encontrada',
      searchPlaceholder: 'Buscar zonas por nome ou endereço...',
    },
    badgeFields: [],
    metaFields: [
      {
        field: 'createdAt',
        label: 'Criado em',
        format: 'date',
      },
    ],
  },

  // ======================== GRID/LISTA ========================
  grid: {
    defaultView: 'grid',
    columns: {
      sm: 1,
      md: 2,
      lg: 3,
      xl: 4,
    },
    showViewToggle: true,
    enableDragSelection: true,
    selectable: true,
    searchableFields: ['name', 'address'],
    defaultSort: {
      field: 'name',
      direction: 'asc',
    },
    pageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
  },

  // ======================== FORMULÁRIO ========================
  form: {
    sections: [
      {
        id: 'basic',
        title: 'Informações Básicas',
        description: '',
        fields: [
          {
            name: 'name',
            label: 'Nome da Zona',
            type: 'text',
            required: true,
            placeholder: 'Ex: Sede Principal, Filial Centro',
            colSpan: 2,
            description: '',
          },
          {
            name: 'latitude',
            label: 'Latitude',
            type: 'number',
            required: true,
            placeholder: 'Ex: -23.5505',
            colSpan: 1,
            description: '',
          },
          {
            name: 'longitude',
            label: 'Longitude',
            type: 'number',
            required: true,
            placeholder: 'Ex: -46.6333',
            colSpan: 1,
            description: '',
          },
          {
            name: 'radiusMeters',
            label: 'Raio (metros)',
            type: 'number',
            required: false,
            placeholder: 'Ex: 200',
            colSpan: 1,
            description: '',
          },
          {
            name: 'address',
            label: 'Endereço',
            type: 'text',
            required: false,
            placeholder: 'Endereço da zona',
            colSpan: 1,
            description: '',
          },
        ],
        columns: 2,
      },
    ],
    defaultColumns: 2,
    validateOnBlur: true,
    showRequiredIndicator: true,
  },

  // ======================== PERMISSÕES ========================
  permissions: {
    view: HR_PERMISSIONS.TIME_CONTROL.ACCESS,
    create: HR_PERMISSIONS.TIME_CONTROL.ACCESS,
    update: HR_PERMISSIONS.TIME_CONTROL.ACCESS,
    delete: HR_PERMISSIONS.TIME_CONTROL.ACCESS,
    export: HR_PERMISSIONS.TIME_CONTROL.EXPORT,
    import: HR_PERMISSIONS.TIME_CONTROL.ACCESS,
  },

  // ======================== FEATURES ========================
  features: {
    create: true,
    edit: true,
    delete: true,
    duplicate: true,
    softDelete: false,
    export: false,
    import: false,
    search: true,
    filters: true,
    sort: true,
    pagination: false,
    selection: true,
    multiSelect: true,
    batchOperations: true,
    favorite: false,
    archive: false,
    auditLog: true,
    versioning: false,
    realtime: false,
  },

  // ======================== AÇÕES ========================
  actions: {
    header: [
      {
        id: 'create',
        label: 'Nova Zona',
        icon: Plus,
        variant: 'default',
        permission: HR_PERMISSIONS.TIME_CONTROL.ACCESS,
        onClick: () => {},
      },
    ],
    item: [
      {
        id: 'view',
        label: 'Visualizar',
        icon: Eye,
        onClick: () => {},
        permission: HR_PERMISSIONS.TIME_CONTROL.ACCESS,
      },
      {
        id: 'edit',
        label: 'Editar',
        icon: Edit,
        onClick: () => {},
        permission: HR_PERMISSIONS.TIME_CONTROL.ACCESS,
      },
      {
        id: 'duplicate',
        label: 'Duplicar',
        icon: Copy,
        onClick: () => {},
        permission: HR_PERMISSIONS.TIME_CONTROL.ACCESS,
      },
      {
        id: 'delete',
        label: 'Excluir',
        icon: Trash2,
        onClick: () => {},
        permission: HR_PERMISSIONS.TIME_CONTROL.ACCESS,
        confirm: true,
        confirmTitle: 'Excluir Zona de Geofencing',
        confirmMessage:
          'Tem certeza que deseja excluir esta zona de geofencing?',
      },
    ],
    batch: [
      {
        id: 'delete',
        label: 'Excluir Selecionados',
        icon: Trash2,
        onClick: () => {},
        variant: 'destructive',
        permission: HR_PERMISSIONS.TIME_CONTROL.ACCESS,
        confirm: true,
        confirmTitle: 'Excluir Zonas',
        confirmMessage: 'Tem certeza que deseja excluir as zonas selecionadas?',
      },
    ],
  },
});

export default geofenceZonesConfig;
