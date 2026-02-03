/**
 * OpenSea OS - Products Module
 */

// API (queries, mutations, keys)
export * from './api';

// Components
export * from './components';

// Modals
export * from './modals';

// Types
export * from './types/products.types';

// Utils
export * from './utils/products.crud';
export * from './utils/products.utils';

// Config
export const productsConfig = {
  name: 'Produto',
  namePlural: 'Produtos',
  slug: 'products',
};
