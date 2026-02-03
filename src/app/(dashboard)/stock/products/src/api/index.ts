/**
 * OpenSea OS - Products API Module
 */

// Query Keys
export { productKeys, type ProductFilters, type ProductQueryKey } from './keys';

// Queries
export {
  useListProducts,
  type ListProductsParams,
  type ListProductsResponse,
  type ListProductsOptions,
} from './list-products.query';

export { useGetProduct, type GetProductOptions } from './get-product.query';

// Mutations
export {
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  type CreateProductData,
  type CreateProductOptions,
  type UpdateProductVariables,
  type UpdateProductOptions,
  type DeleteProductOptions,
} from './mutations';
