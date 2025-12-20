export const apiConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3333',
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
  // Me (Profile)
  ME: {
    GET: '/v1/me',
    UPDATE: '/v1/me',
    UPDATE_EMAIL: '/v1/me/email',
    UPDATE_USERNAME: '/v1/me/username',
    UPDATE_PASSWORD: '/v1/me/password',
    DELETE: '/v1/me',
  },
  // Sessions
  SESSIONS: {
    LIST_MY: '/v1/sessions',
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
    GET_BY_ROLE: (role: string) => `/v1/users/role/${role}`,
    GET_ONLINE: '/v1/users/online',
    CREATE: '/v1/users',
    UPDATE_EMAIL: (userId: string) => `/v1/users/${userId}/email`,
    UPDATE_USERNAME: (userId: string) => `/v1/users/${userId}/username`,
    UPDATE_PASSWORD: (userId: string) => `/v1/users/${userId}/password`,
    UPDATE_ROLE: (userId: string) => `/v1/users/${userId}/role`,
    UPDATE_PROFILE: (userId: string) => `/v1/users/${userId}`,
    DELETE: (userId: string) => `/v1/users/${userId}`,
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
  },
  // Stock - Items
  ITEMS: {
    LIST: '/v1/items',
    GET: (itemId: string) => `/v1/items/${itemId}`,
    DELETE: (itemId: string) => `/v1/items/${itemId}`,
    ENTRY: '/v1/items/entry',
    EXIT: '/v1/items/exit',
    TRANSFER: '/v1/items/transfer',
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
  // Stock - Locations
  LOCATIONS: {
    LIST: '/v1/locations',
    GET: (id: string) => `/v1/locations/${id}`,
    CREATE: '/v1/locations',
    UPDATE: (id: string) => `/v1/locations/${id}`,
    DELETE: (id: string) => `/v1/locations/${id}`,
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
  // Health
  HEALTH: '/health',
} as const;
