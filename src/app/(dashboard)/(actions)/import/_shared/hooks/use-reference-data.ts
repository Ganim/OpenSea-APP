'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { FieldOption } from '../types';

// Types for API responses
interface BaseEntity {
  id: string;
  name: string;
  [key: string]: unknown;
}

interface ListResponse<T> {
  [key: string]: T[];
}

// ============================================
// API FETCHERS
// ============================================

async function fetchTemplates(): Promise<FieldOption[]> {
  const response =
    await apiClient.get<ListResponse<BaseEntity>>('/v1/templates');
  const templates = response.templates || [];
  return templates.map(t => ({
    value: t.id,
    label: t.name,
  }));
}

async function fetchSuppliers(): Promise<FieldOption[]> {
  const response =
    await apiClient.get<ListResponse<BaseEntity>>('/v1/suppliers');
  const suppliers = response.suppliers || [];
  return suppliers.map(s => ({
    value: s.id,
    label: s.name,
  }));
}

async function fetchManufacturers(): Promise<FieldOption[]> {
  const response =
    await apiClient.get<ListResponse<BaseEntity>>('/v1/manufacturers');
  const manufacturers = response.manufacturers || [];
  return manufacturers.map(m => ({
    value: m.id,
    label: m.name,
  }));
}

async function fetchCategories(): Promise<FieldOption[]> {
  const response =
    await apiClient.get<ListResponse<BaseEntity>>('/v1/categories');
  const categories = response.categories || [];
  return categories.map(c => ({
    value: c.id,
    label: c.name,
  }));
}

interface ProductWithTemplate {
  id: string;
  name: string;
  code?: string;
  templateId?: string;
  template?: {
    id: string;
    name: string;
  };
}

async function fetchProducts(): Promise<FieldOption[]> {
  const response =
    await apiClient.get<ListResponse<BaseEntity>>('/v1/products');
  const products = response.products || [];
  return products.map(p => ({
    value: p.id,
    label: p.name,
  }));
}

async function fetchProductsWithTemplates(): Promise<ProductWithTemplate[]> {
  const response = await apiClient.get<{ products: ProductWithTemplate[] }>(
    '/v1/products'
  );
  return response.products || [];
}

async function fetchVariants(): Promise<FieldOption[]> {
  const response =
    await apiClient.get<
      ListResponse<{ id: string; name: string; sku?: string }>
    >('/v1/variants');
  const variants = response.variants || [];
  return variants.map(v => ({
    value: v.id,
    label: v.sku ? `${v.name} (${v.sku})` : v.name,
  }));
}

async function fetchLocations(): Promise<FieldOption[]> {
  const response =
    await apiClient.get<
      ListResponse<{ id: string; code: string; name?: string }>
    >('/v1/locations');
  const locations = response.locations || [];
  return locations.map(l => ({
    value: l.id,
    label: l.name ? `${l.code} - ${l.name}` : l.code,
  }));
}

async function fetchBins(): Promise<FieldOption[]> {
  const response = await apiClient.get<{
    bins: Array<{
      id: string;
      address: string;
      isActive: boolean;
      isBlocked: boolean;
    }>;
  }>('/v1/bins');
  const bins = response.bins || [];
  // Filter only active and non-blocked bins
  return bins
    .filter(b => b.isActive && !b.isBlocked)
    .map(b => ({
      value: b.id,
      label: b.address,
    }));
}

// ============================================
// HOOKS
// ============================================

export function useTemplates() {
  return useQuery({
    queryKey: ['import-reference', 'templates'],
    queryFn: fetchTemplates,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

export function useSuppliers() {
  return useQuery({
    queryKey: ['import-reference', 'suppliers'],
    queryFn: fetchSuppliers,
    staleTime: 5 * 60 * 1000,
  });
}

export function useManufacturers() {
  return useQuery({
    queryKey: ['import-reference', 'manufacturers'],
    queryFn: fetchManufacturers,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['import-reference', 'categories'],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000,
  });
}

export function useProducts() {
  return useQuery({
    queryKey: ['import-reference', 'products'],
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000,
  });
}

export function useProductsWithTemplates() {
  return useQuery({
    queryKey: ['import-reference', 'products-with-templates'],
    queryFn: fetchProductsWithTemplates,
    staleTime: 5 * 60 * 1000,
  });
}

// Export type for use elsewhere
export type { ProductWithTemplate };

export function useVariants() {
  return useQuery({
    queryKey: ['import-reference', 'variants'],
    queryFn: fetchVariants,
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================
// VARIANTS WITH FULL DETAILS FOR ITEMS IMPORT
// ============================================

export interface VariantWithDetails {
  id: string;
  name: string;
  sku?: string;
  reference?: string;
  productId: string;
  productName: string;
  productCode?: string;
  templateId?: string;
  templateName?: string;
  manufacturerName?: string;
}

async function fetchVariantsWithDetails(): Promise<VariantWithDetails[]> {
  // Fetch variants and products in parallel
  const [variantsResponse, productsResponse] = await Promise.all([
    apiClient.get<{
      variants: Array<{
        id: string;
        name: string;
        sku?: string;
        reference?: string;
        productId: string;
      }>;
    }>('/v1/variants'),
    apiClient.get<{
      products: Array<{
        id: string;
        name: string;
        code?: string;
        templateId?: string;
        template?: { id: string; name: string };
        manufacturer?: { id: string; name?: string; tradeName?: string };
      }>;
    }>('/v1/products'),
  ]);

  const variants = variantsResponse.variants || [];
  const products = productsResponse.products || [];

  // Create a map for quick product lookup
  const productMap = new Map(products.map(p => [p.id, p]));

  // Combine variant with product info
  return variants.map(v => {
    const product = productMap.get(v.productId);
    return {
      id: v.id,
      name: v.name,
      sku: v.sku,
      reference: v.reference,
      productId: v.productId,
      productName: product?.name || 'Produto Desconhecido',
      productCode: product?.code,
      templateId: product?.templateId,
      templateName: product?.template?.name,
      manufacturerName:
        product?.manufacturer?.tradeName || product?.manufacturer?.name,
    };
  });
}

export function useVariantsWithDetails() {
  return useQuery({
    queryKey: ['import-reference', 'variants-with-details'],
    queryFn: fetchVariantsWithDetails,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLocations() {
  return useQuery({
    queryKey: ['import-reference', 'locations'],
    queryFn: fetchLocations,
    staleTime: 5 * 60 * 1000,
  });
}

export function useBins() {
  return useQuery({
    queryKey: ['import-reference', 'bins'],
    queryFn: fetchBins,
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================
// TEMPLATE WITH ATTRIBUTES HOOK
// ============================================

interface TemplateAttributeConfig {
  type?: string;
  label?: string;
  options?: string[];
  required?: boolean;
}

interface TemplateWithAttributes {
  id: string;
  name: string;
  productAttributes?: Record<string, TemplateAttributeConfig>;
  variantAttributes?: Record<string, TemplateAttributeConfig>;
  itemAttributes?: Record<string, TemplateAttributeConfig>;
}

async function fetchTemplateDetails(
  templateId: string
): Promise<TemplateWithAttributes | null> {
  if (!templateId) return null;
  const response = await apiClient.get<{ template: TemplateWithAttributes }>(
    `/v1/templates/${templateId}`
  );
  return response.template || null;
}

export function useTemplateDetails(templateId: string | undefined) {
  return useQuery({
    queryKey: ['import-reference', 'template-details', templateId],
    queryFn: () => fetchTemplateDetails(templateId!),
    staleTime: 5 * 60 * 1000,
    enabled: !!templateId,
  });
}

// Get full templates list with attributes for config page
async function fetchTemplatesWithAttributes(): Promise<
  TemplateWithAttributes[]
> {
  const response = await apiClient.get<{ templates: TemplateWithAttributes[] }>(
    '/v1/templates'
  );
  return response.templates || [];
}

export function useTemplatesWithAttributes() {
  return useQuery({
    queryKey: ['import-reference', 'templates-with-attributes'],
    queryFn: fetchTemplatesWithAttributes,
    staleTime: 5 * 60 * 1000,
  });
}

// Export type for use elsewhere
export type { TemplateWithAttributes, TemplateAttributeConfig };

// ============================================
// GENERIC HOOK
// ============================================

type ReferenceType =
  | 'templates'
  | 'suppliers'
  | 'manufacturers'
  | 'categories'
  | 'products'
  | 'variants'
  | 'locations';

const FETCHERS: Record<ReferenceType, () => Promise<FieldOption[]>> = {
  templates: fetchTemplates,
  suppliers: fetchSuppliers,
  manufacturers: fetchManufacturers,
  categories: fetchCategories,
  products: fetchProducts,
  variants: fetchVariants,
  locations: fetchLocations,
};

export function useReferenceData(type: ReferenceType) {
  return useQuery({
    queryKey: ['import-reference', type],
    queryFn: FETCHERS[type],
    staleTime: 5 * 60 * 1000,
    enabled: !!type,
  });
}

// ============================================
// COMBINED HOOK FOR ALL REFERENCES
// ============================================

export function useAllReferenceData(requiredTypes: ReferenceType[]) {
  const templates = useTemplates();
  const suppliers = useSuppliers();
  const manufacturers = useManufacturers();
  const categories = useCategories();
  const products = useProducts();
  const variants = useVariants();
  const locations = useLocations();

  const data: Record<ReferenceType, FieldOption[]> = {
    templates: templates.data || [],
    suppliers: suppliers.data || [],
    manufacturers: manufacturers.data || [],
    categories: categories.data || [],
    products: products.data || [],
    variants: variants.data || [],
    locations: locations.data || [],
  };

  const isLoading = requiredTypes.some(type => {
    switch (type) {
      case 'templates':
        return templates.isLoading;
      case 'suppliers':
        return suppliers.isLoading;
      case 'manufacturers':
        return manufacturers.isLoading;
      case 'categories':
        return categories.isLoading;
      case 'products':
        return products.isLoading;
      case 'variants':
        return variants.isLoading;
      case 'locations':
        return locations.isLoading;
      default:
        return false;
    }
  });

  return { data, isLoading };
}
