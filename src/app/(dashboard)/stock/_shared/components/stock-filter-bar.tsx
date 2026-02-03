'use client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { templatesService, categoriesService } from '@/services/stock';
import type { Template, Category, ProductStatus } from '@/types/stock';
import { useQuery } from '@tanstack/react-query';
import { Boxes, Folder, LayoutTemplate, X } from 'lucide-react';
import { useMemo } from 'react';

// ============================================
// PRODUCTS FILTER BAR
// ============================================

export interface ProductsFilters {
  templateId?: string;
  categoryId?: string;
  status?: ProductStatus;
}

interface ProductsFilterBarProps {
  filters: ProductsFilters;
  onFiltersChange: (filters: ProductsFilters) => void;
  showTemplate?: boolean;
  showCategory?: boolean;
  showStatus?: boolean;
  className?: string;
}

export function ProductsFilterBar({
  filters,
  onFiltersChange,
  showTemplate = true,
  showCategory = true,
  showStatus = true,
  className,
}: ProductsFilterBarProps) {
  // Fetch templates
  const { data: templatesData } = useQuery({
    queryKey: ['templates-filter'],
    queryFn: async () => {
      try {
        const response = await templatesService.listTemplates();
        return response?.templates ?? [];
      } catch (error) {
        console.error('Error fetching templates:', error);
        return [];
      }
    },
    enabled: showTemplate,
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories-filter'],
    queryFn: async () => {
      try {
        const response = await categoriesService.listCategories();
        return response?.categories ?? [];
      } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
      }
    },
    enabled: showCategory,
  });

  const templates = useMemo(() => templatesData || [], [templatesData]);
  const categories = useMemo(() => categoriesData || [], [categoriesData]);

  const handleTemplateChange = (value: string) => {
    onFiltersChange({
      ...filters,
      templateId: value === 'all' ? undefined : value,
    });
  };

  const handleCategoryChange = (value: string) => {
    onFiltersChange({
      ...filters,
      categoryId: value === 'all' ? undefined : value,
    });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value === 'all' ? undefined : (value as ProductStatus),
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters =
    filters.templateId || filters.categoryId || filters.status;

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className || ''}`}>
      {showTemplate && (
        <div className="flex items-center gap-2">
          <LayoutTemplate className="h-4 w-4 text-muted-foreground" />
          <Select
            value={filters.templateId || 'all'}
            onValueChange={handleTemplateChange}
          >
            <SelectTrigger className="w-[200px] h-10">
              <SelectValue placeholder="Todos os templates" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os templates</SelectItem>
              {templates.map((template: Template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {showCategory && (
        <div className="flex items-center gap-2">
          <Folder className="h-4 w-4 text-muted-foreground" />
          <Select
            value={filters.categoryId || 'all'}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger className="w-[200px] h-10">
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories.map((category: Category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {showStatus && (
        <div className="flex items-center gap-2">
          <Boxes className="h-4 w-4 text-muted-foreground" />
          <Select
            value={filters.status || 'all'}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="w-[160px] h-10">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="ACTIVE">Ativo</SelectItem>
              <SelectItem value="INACTIVE">Inativo</SelectItem>
              <SelectItem value="ARCHIVED">Arquivado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="h-10 px-3 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4 mr-1" />
          Limpar
        </Button>
      )}
    </div>
  );
}

// ============================================
// VARIANTS FILTER BAR
// ============================================

export interface VariantsFilters {
  productId?: string;
  minPrice?: number;
  maxPrice?: number;
  hasStock?: boolean;
}

interface VariantsFilterBarProps {
  filters: VariantsFilters;
  onFiltersChange: (filters: VariantsFilters) => void;
  showProduct?: boolean;
  showPrice?: boolean;
  showStock?: boolean;
  className?: string;
}

export function VariantsFilterBar({
  filters,
  onFiltersChange,
  showStock = true,
  className,
}: VariantsFilterBarProps) {
  const handleStockChange = (value: string) => {
    onFiltersChange({
      ...filters,
      hasStock: value === 'all' ? undefined : value === 'true',
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = filters.productId || filters.hasStock !== undefined;

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className || ''}`}>
      {showStock && (
        <div className="flex items-center gap-2">
          <Boxes className="h-4 w-4 text-muted-foreground" />
          <Select
            value={
              filters.hasStock === undefined ? 'all' : String(filters.hasStock)
            }
            onValueChange={handleStockChange}
          >
            <SelectTrigger className="w-[180px] h-10">
              <SelectValue placeholder="Estoque" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="true">Com estoque</SelectItem>
              <SelectItem value="false">Sem estoque</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="h-10 px-3 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4 mr-1" />
          Limpar
        </Button>
      )}
    </div>
  );
}

// ============================================
// ITEMS FILTER BAR
// ============================================

export interface ItemsFilters {
  variantId?: string;
  locationId?: string;
  warehouseId?: string;
  status?: string;
  volumeId?: string;
}

interface ItemsFilterBarProps {
  filters: ItemsFilters;
  onFiltersChange: (filters: ItemsFilters) => void;
  showStatus?: boolean;
  showVolume?: boolean;
  className?: string;
}

export function ItemsFilterBar({
  filters,
  onFiltersChange,
  showStatus = true,
  showVolume = true,
  className,
}: ItemsFilterBarProps) {
  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value === 'all' ? undefined : value,
    });
  };

  const handleVolumeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      volumeId: value === 'all' ? undefined : value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = filters.status || filters.volumeId;

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className || ''}`}>
      {showStatus && (
        <div className="flex items-center gap-2">
          <Boxes className="h-4 w-4 text-muted-foreground" />
          <Select
            value={filters.status || 'all'}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="w-[160px] h-10">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="AVAILABLE">Disponível</SelectItem>
              <SelectItem value="RESERVED">Reservado</SelectItem>
              <SelectItem value="SOLD">Vendido</SelectItem>
              <SelectItem value="DAMAGED">Danificado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {showVolume && (
        <div className="flex items-center gap-2">
          <Select
            value={filters.volumeId ? 'in_volume' : 'all'}
            onValueChange={handleVolumeChange}
          >
            <SelectTrigger className="w-[180px] h-10">
              <SelectValue placeholder="Volume" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="in_volume">Em volume</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="h-10 px-3 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4 mr-1" />
          Limpar
        </Button>
      )}
    </div>
  );
}
