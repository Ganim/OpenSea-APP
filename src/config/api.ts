export const apiConfig = {
  // Usa 127.0.0.1 como fallback para evitar problemas com IPv6 no Windows
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:3333',
  timeout: 30000, // Aumentado de 10s para 30s
  headers: {
    'Content-Type': 'application/json',
  },
};

export const authConfig = {
  tokenKey: 'auth_token',
  refreshTokenKey: 'refresh_token',
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/v1/auth/login/password',
    REGISTER: '/v1/auth/register/password',
    SEND_PASSWORD_RESET: '/v1/auth/send/password',
    RESET_PASSWORD: '/v1/auth/reset/password',
  },
  // Auth - Force Password Reset
  FORCE_PASSWORD_RESET: {
    REQUEST: (userId: string) => `/v1/users/${userId}/force-password-reset`,
  },
  // Me (Profile)
  ME: {
    GET: '/v1/me',
    UPDATE: '/v1/me',
    UPDATE_EMAIL: '/v1/me/email',
    UPDATE_USERNAME: '/v1/me/username',
    UPDATE_PASSWORD: '/v1/me/password',
    DELETE: '/v1/me',
    // Employee
    EMPLOYEE: '/v1/me/employee',
    // Audit Logs
    AUDIT_LOGS: '/v1/me/audit-logs',
    // Permissions
    PERMISSIONS: '/v1/me/permissions',
    GROUPS: '/v1/me/groups',
  },
  // Sessions
  SESSIONS: {
    LIST_MY: '/v1/sessions/me',
    LIST_USER: (userId: string) => `/v1/sessions/user/${userId}`,
    LIST_USER_BY_DATE: (userId: string) =>
      `/v1/sessions/user/${userId}/by-date`,
    LIST_ACTIVE: '/v1/sessions/active',
    REFRESH: '/v1/sessions/refresh',
    LOGOUT: '/v1/sessions/logout',
    REVOKE: (sessionId: string) => `/v1/sessions/${sessionId}/revoke`,
    EXPIRE: (sessionId: string) => `/v1/sessions/${sessionId}/expire`,
  },
  // Users
  USERS: {
    LIST: '/v1/users',
    GET: (userId: string) => `/v1/users/${userId}`,
    GET_BY_EMAIL: (email: string) => `/v1/users/email/${email}`,
    GET_BY_USERNAME: (username: string) => `/v1/users/username/${username}`,
    GET_ONLINE: '/v1/users/online',
    CREATE: '/v1/users',
    UPDATE_EMAIL: (userId: string) => `/v1/users/${userId}/email`,
    UPDATE_USERNAME: (userId: string) => `/v1/users/${userId}/username`,
    UPDATE_PASSWORD: (userId: string) => `/v1/users/${userId}/password`,
    UPDATE_PROFILE: (userId: string) => `/v1/users/${userId}`,
    DELETE: (userId: string) => `/v1/users/${userId}`,
  },
  // HR - Companies
  COMPANIES: {
    LIST: '/v1/hr/companies',
    GET: (id: string) => `/v1/hr/companies/${id}`,
    CREATE: '/v1/hr/companies',
    UPDATE: (id: string) => `/v1/hr/companies/${id}`,
    DELETE: (id: string) => `/v1/hr/companies/${id}`,
    CHECK_CNPJ: '/v1/hr/companies/check-cnpj',
  },
  // Stock - Products
  PRODUCTS: {
    LIST: '/v1/products',
    GET: (productId: string) => `/v1/products/${productId}`,
    CREATE: '/v1/products',
    UPDATE: (productId: string) => `/v1/products/${productId}`,
    DELETE: (productId: string) => `/v1/products/${productId}`,
  },
  // Stock - Variants
  VARIANTS: {
    LIST: '/v1/variants',
    GET: (id: string) => `/v1/variants/${id}`,
    CREATE: '/v1/variants',
    UPDATE: (id: string) => `/v1/variants/${id}`,
    DELETE: (id: string) => `/v1/variants/${id}`,
    BY_PRODUCT: (productId: string) => `/v1/products/${productId}/variants`,
  },
  // Stock - Items
  ITEMS: {
    LIST: '/v1/items',
    GET: (itemId: string) => `/v1/items/${itemId}`,
    DELETE: (itemId: string) => `/v1/items/${itemId}`,
    BY_VARIANT: (variantId: string) => `/v1/items/by-variant/${variantId}`,
    BY_PRODUCT: (productId: string) => `/v1/items/by-product/${productId}`,
    ENTRY: '/v1/items/entry',
    EXIT: '/v1/items/exit',
    TRANSFER: '/v1/items/transfer',
    BATCH_TRANSFER: '/v1/items/batch-transfer',
    LOCATION_HISTORY: (itemId: string) =>
      `/v1/items/${itemId}/location-history`,
  },
  // Stock - Item Movements
  ITEM_MOVEMENTS: {
    LIST: '/v1/item-movements',
  },
  // Stock - Categories
  CATEGORIES: {
    LIST: '/v1/categories',
    GET: (id: string) => `/v1/categories/${id}`,
    CREATE: '/v1/categories',
    UPDATE: (id: string) => `/v1/categories/${id}`,
    DELETE: (id: string) => `/v1/categories/${id}`,
    REORDER: '/v1/categories/reorder',
  },
  // Stock - Manufacturers
  MANUFACTURERS: {
    LIST: '/v1/manufacturers',
    GET: (id: string) => `/v1/manufacturers/${id}`,
    CREATE: '/v1/manufacturers',
    UPDATE: (id: string) => `/v1/manufacturers/${id}`,
    DELETE: (id: string) => `/v1/manufacturers/${id}`,
  },
  // Stock - Suppliers
  SUPPLIERS: {
    LIST: '/v1/suppliers',
    GET: (id: string) => `/v1/suppliers/${id}`,
    CREATE: '/v1/suppliers',
    UPDATE: (id: string) => `/v1/suppliers/${id}`,
    DELETE: (id: string) => `/v1/suppliers/${id}`,
  },
  // Stock - Tags
  TAGS: {
    LIST: '/v1/tags',
    GET: (id: string) => `/v1/tags/${id}`,
    CREATE: '/v1/tags',
    UPDATE: (id: string) => `/v1/tags/${id}`,
    DELETE: (id: string) => `/v1/tags/${id}`,
  },
  // Stock - Templates
  TEMPLATES: {
    LIST: '/v1/templates',
    GET: (id: string) => `/v1/templates/${id}`,
    CREATE: '/v1/templates',
    UPDATE: (id: string) => `/v1/templates/${id}`,
    DELETE: (id: string) => `/v1/templates/${id}`,
  },
  // Stock - Purchase Orders
  PURCHASE_ORDERS: {
    LIST: '/v1/purchase-orders',
    GET: (id: string) => `/v1/purchase-orders/${id}`,
    CREATE: '/v1/purchase-orders',
    UPDATE_STATUS: (id: string) => `/v1/purchase-orders/${id}/status`,
  },
  // Stock - Volumes
  VOLUMES: {
    LIST: '/v1/volumes',
    GET: (id: string) => `/v1/volumes/${id}`,
    CREATE: '/v1/volumes',
    UPDATE: (id: string) => `/v1/volumes/${id}`,
    DELETE: (id: string) => `/v1/volumes/${id}`,
    ADD_ITEM: (id: string) => `/v1/volumes/${id}/items`,
    REMOVE_ITEM: (volumeId: string, itemId: string) =>
      `/v1/volumes/${volumeId}/items/${itemId}`,
    CLOSE: (id: string) => `/v1/volumes/${id}/close`,
    REOPEN: (id: string) => `/v1/volumes/${id}/reopen`,
    DELIVER: (id: string) => `/v1/volumes/${id}/deliver`,
    RETURN: (id: string) => `/v1/volumes/${id}/return`,
    ROMANEIO: (id: string) => `/v1/volumes/${id}/romaneio`,
    SCAN: '/v1/volumes/scan',
  },
  // Stock - Serialized Labels
  SERIALIZED_LABELS: {
    LIST: '/v1/serialized-labels',
    GET: (code: string) => `/v1/serialized-labels/${code}`,
    GENERATE: '/v1/serialized-labels/generate',
    LINK: (code: string) => `/v1/serialized-labels/${code}/link`,
    VOID: (code: string) => `/v1/serialized-labels/${code}/void`,
  },
  // Stock - Labels Generation
  LABELS: {
    GENERATE: '/v1/labels/generate',
  },
  // Stock - Movements (Extended)
  MOVEMENTS: {
    LIST: '/v1/item-movements',
    HISTORY: '/v1/movements/history',
    PRODUCT_HISTORY: (productId: string) =>
      `/v1/products/${productId}/movements`,
    VARIANT_HISTORY: (variantId: string) =>
      `/v1/variants/${variantId}/movements`,
    BIN_HISTORY: (binId: string) => `/v1/bins/${binId}/movements`,
    PENDING_APPROVAL: '/v1/movements/pending-approval',
    APPROVE: (id: string) => `/v1/movements/${id}/approve`,
    REJECT: (id: string) => `/v1/movements/${id}/reject`,
    APPROVE_BATCH: '/v1/movements/approve/batch',
  },
  // Stock - Inventory Cycles
  INVENTORY: {
    CYCLES_LIST: '/v1/inventory-cycles',
    CYCLES_GET: (id: string) => `/v1/inventory-cycles/${id}`,
    CYCLES_CREATE: '/v1/inventory-cycles',
    CYCLES_START: (id: string) => `/v1/inventory-cycles/${id}/start`,
    CYCLES_COMPLETE: (id: string) => `/v1/inventory-cycles/${id}/complete`,
    CYCLES_COUNTS: (id: string) => `/v1/inventory-cycles/${id}/counts`,
    COUNT_SUBMIT: (countId: string) => `/v1/inventory-counts/${countId}/count`,
    COUNT_ADJUST: (countId: string) => `/v1/inventory-counts/${countId}/adjust`,
  },
  // Stock - Import
  IMPORT: {
    VALIDATE: '/v1/import/validate',
    PRODUCTS: '/v1/import/products',
    VARIANTS: '/v1/import/variants',
    ITEMS: '/v1/import/items',
    TEMPLATE: (type: string) => `/v1/import/templates/${type}`,
    VARIANTS_BATCH: '/v1/variants/batch',
    ITEMS_ENTRY_BATCH: '/v1/items/entry/batch',
    ITEMS_TRANSFER_BATCH: '/v1/items/transfer/batch',
  },
  // Stock - Scan
  SCAN: {
    SINGLE: '/v1/scan',
    BATCH: '/v1/scan/batch',
  },
  // Stock - Analytics & Dashboard
  ANALYTICS: {
    STOCK_SUMMARY: '/v1/analytics/stock-summary',
    MOVEMENTS_SUMMARY: '/v1/analytics/movements-summary',
    ABC_CURVE: '/v1/analytics/abc-curve',
    STOCK_TURNOVER: '/v1/analytics/stock-turnover',
    DASHBOARD: '/v1/dashboard/stock',
  },
  // Sales - Customers
  CUSTOMERS: {
    LIST: '/v1/customers',
    GET: (id: string) => `/v1/customers/${id}`,
    CREATE: '/v1/customers',
    UPDATE: (id: string) => `/v1/customers/${id}`,
    DELETE: (id: string) => `/v1/customers/${id}`,
  },
  // Sales - Sales Orders
  SALES_ORDERS: {
    LIST: '/v1/sales-orders',
    GET: (id: string) => `/v1/sales-orders/${id}`,
    CREATE: '/v1/sales-orders',
    UPDATE_STATUS: (id: string) => `/v1/sales-orders/${id}/status`,
    CANCEL: (id: string) => `/v1/sales-orders/${id}/cancel`,
    DELETE: (id: string) => `/v1/sales-orders/${id}`,
  },
  // Sales - Comments
  COMMENTS: {
    LIST: (salesOrderId: string) => `/v1/comments/${salesOrderId}`,
    GET: (commentId: string) => `/v1/comments/comment/${commentId}`,
    CREATE: '/v1/comments',
    UPDATE: (commentId: string) => `/v1/comments/${commentId}`,
    DELETE: (commentId: string) => `/v1/comments/${commentId}`,
  },
  // Sales - Variant Promotions
  VARIANT_PROMOTIONS: {
    LIST: '/v1/variant-promotions',
    GET: (id: string) => `/v1/variant-promotions/${id}`,
    CREATE: '/v1/variant-promotions',
    UPDATE: (id: string) => `/v1/variant-promotions/${id}`,
    DELETE: (id: string) => `/v1/variant-promotions/${id}`,
  },
  // Sales - Item Reservations
  ITEM_RESERVATIONS: {
    LIST: '/v1/item-reservations',
    GET: (id: string) => `/v1/item-reservations/${id}`,
    CREATE: '/v1/item-reservations',
    RELEASE: (id: string) => `/v1/item-reservations/${id}/release`,
  },
  // Sales - Notification Preferences
  NOTIFICATION_PREFERENCES: {
    LIST: '/v1/notification-preferences',
    GET: (id: string) => `/v1/notification-preferences/${id}`,
    LIST_USER: (userId: string) =>
      `/v1/notification-preferences/user/${userId}`,
    CREATE: '/v1/notification-preferences',
    UPDATE: (id: string) => `/v1/notification-preferences/${id}`,
    DELETE: (id: string) => `/v1/notification-preferences/${id}`,
  },
  // RBAC - Permissions
  RBAC: {
    PERMISSIONS: {
      LIST: '/v1/rbac/permissions',
      LIST_ALL: '/v1/rbac/permissions/all',
      GET: (id: string) => `/v1/rbac/permissions/${id}`,
      GET_BY_CODE: (code: string) => `/v1/rbac/permissions/code/${code}`,
      CREATE: '/v1/rbac/permissions',
      UPDATE: (id: string) => `/v1/rbac/permissions/${id}`,
      DELETE: (id: string) => `/v1/rbac/permissions/${id}`,
    },
    GROUPS: {
      LIST: '/v1/rbac/permission-groups',
      GET: (id: string) => `/v1/rbac/permission-groups/${id}`,
      CREATE: '/v1/rbac/permission-groups',
      UPDATE: (id: string) => `/v1/rbac/permission-groups/${id}`,
      DELETE: (id: string) => `/v1/rbac/permission-groups/${id}`,
      PERMISSIONS: (groupId: string) =>
        `/v1/rbac/permission-groups/${groupId}/permissions`,
      PERMISSIONS_BULK: (groupId: string) =>
        `/v1/rbac/permission-groups/${groupId}/permissions/bulk`,
      REMOVE_PERMISSION: (groupId: string, code: string) =>
        `/v1/rbac/permission-groups/${groupId}/permissions/${code}`,
      USERS: (groupId: string) => `/v1/rbac/permission-groups/${groupId}/users`,
    },
    USERS: {
      GROUPS: (userId: string) => `/v1/rbac/users/${userId}/groups`,
      REMOVE_GROUP: (userId: string, groupId: string) =>
        `/v1/rbac/users/${userId}/groups/${groupId}`,
      PERMISSIONS: (userId: string) => `/v1/rbac/users/${userId}/permissions`,
    },
  },
  // Audit Logs
  AUDIT: {
    LIST: '/v1/audit-logs',
    HISTORY: (entity: string, entityId: string) =>
      `/v1/audit-logs/history/${entity}/${entityId}`,
    ROLLBACK_PREVIEW: (entity: string, entityId: string) =>
      `/v1/audit-logs/rollback/preview/${entity}/${entityId}`,
    COMPARE: (entity: string, entityId: string) =>
      `/v1/audit-logs/compare/${entity}/${entityId}`,
  },
  // Tenants
  TENANTS: {
    LIST_MY: '/v1/auth/tenants',
    SELECT: '/v1/auth/select-tenant',
  },
  // Admin
  ADMIN: {
    DASHBOARD: '/v1/admin/dashboard',
    TENANTS: {
      LIST: '/v1/admin/tenants',
      GET: (id: string) => `/v1/admin/tenants/${id}`,
      CREATE: '/v1/admin/tenants',
      UPDATE: (id: string) => `/v1/admin/tenants/${id}`,
      DELETE: (id: string) => `/v1/admin/tenants/${id}`,
      CHANGE_STATUS: (id: string) => `/v1/admin/tenants/${id}/status`,
      CHANGE_PLAN: (id: string) => `/v1/admin/tenants/${id}/plan`,
      FEATURE_FLAGS: (id: string) => `/v1/admin/tenants/${id}/feature-flags`,
      USERS: (id: string) => `/v1/admin/tenants/${id}/users`,
      CREATE_USER: (id: string) => `/v1/admin/tenants/${id}/users`,
      REMOVE_USER: (id: string, userId: string) =>
        `/v1/admin/tenants/${id}/users/${userId}`,
    },
    PLANS: {
      LIST: '/v1/admin/plans',
      GET: (id: string) => `/v1/admin/plans/${id}`,
      CREATE: '/v1/admin/plans',
      UPDATE: (id: string) => `/v1/admin/plans/${id}`,
      DELETE: (id: string) => `/v1/admin/plans/${id}`,
      SET_MODULES: (id: string) => `/v1/admin/plans/${id}/modules`,
    },
  },
  // Health
  HEALTH: '/health',
} as const;
