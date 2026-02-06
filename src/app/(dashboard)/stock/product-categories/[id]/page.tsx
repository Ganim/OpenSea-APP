/**
 * OpenSea OS - Product Category Detail Page
 * Página de detalhes de uma categoria de produto com layout de tabs
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EntityCard, EntityContextMenu, EntityGrid } from '@/core';
import { categoriesConfig } from '@/config/entities/categories.config';
import { useCategories, useCategory } from '@/hooks/stock/use-categories';
import type { Category } from '@/types/stock';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ArrowLeft,
  Calendar,
  Edit,
  FolderTree,
  Hash,
  Package,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { PiFolderOpenDuotone } from 'react-icons/pi';

export default function ProductCategoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.id as string;

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const { data: categoryData, isLoading } = useCategory(categoryId);
  const category = categoryData?.category;

  const { data: allCategoriesData } = useCategories();
  const allCategories = useMemo(
    () => allCategoriesData?.categories || [],
    [allCategoriesData]
  );

  const subcategories = useMemo(
    () => allCategories.filter(c => c.parentId === categoryId),
    [allCategories, categoryId]
  );

  const parentCategory = useMemo(
    () =>
      category?.parentId
        ? allCategories.find(c => c.id === category.parentId)
        : null,
    [allCategories, category]
  );

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleBack = () => {
    router.push('/stock/product-categories');
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return 'N/A';
    try {
      return format(new Date(date), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
        locale: ptBR,
      });
    } catch {
      return 'Data inválida';
    }
  };

  // ============================================================================
  // SUBCATEGORY CARD RENDERERS
  // ============================================================================

  const renderSubcategoryGridCard = (item: Category) => {
    return (
      <EntityContextMenu
        itemId={item.id}
        onView={ids => {
          if (ids.length === 1)
            router.push(`/stock/product-categories/${ids[0]}`);
        }}
        onEdit={ids => {
          if (ids.length === 1)
            router.push(`/stock/product-categories/${ids[0]}/edit`);
        }}
      >
        <EntityCard
          id={item.id}
          variant="grid"
          title={item.name}
          subtitle={`${item.childrenCount || 0} subcategorias · ${item.productCount || 0} produtos`}
          thumbnail={item.iconUrl || undefined}
          thumbnailFallback={
            <PiFolderOpenDuotone className="w-6 h-6 text-white" />
          }
          iconBgColor="bg-gradient-to-br from-blue-500 to-purple-600"
          badges={[
            {
              label: item.isActive ? 'Ativa' : 'Inativa',
              variant: item.isActive ? 'default' : 'secondary',
            },
          ]}
          clickable={true}
          onClick={() => router.push(`/stock/product-categories/${item.id}`)}
          createdAt={item.createdAt}
          updatedAt={item.updatedAt}
        >
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 h-10">
            {item.description || 'Sem descrição'}
          </p>
        </EntityCard>
      </EntityContextMenu>
    );
  };

  const renderSubcategoryListCard = (item: Category) => {
    return (
      <EntityContextMenu
        itemId={item.id}
        onView={ids => {
          if (ids.length === 1)
            router.push(`/stock/product-categories/${ids[0]}`);
        }}
        onEdit={ids => {
          if (ids.length === 1)
            router.push(`/stock/product-categories/${ids[0]}/edit`);
        }}
      >
        <EntityCard
          id={item.id}
          variant="list"
          title={item.name}
          subtitle={`${item.childrenCount || 0} subcategorias · ${item.productCount || 0} produtos`}
          thumbnail={item.iconUrl || undefined}
          thumbnailFallback={
            <PiFolderOpenDuotone className="w-5 h-5 text-white" />
          }
          iconBgColor="bg-gradient-to-br from-blue-500 to-purple-600"
          badges={[
            {
              label: item.isActive ? 'Ativa' : 'Inativa',
              variant: item.isActive ? 'default' : 'secondary',
            },
          ]}
          clickable={true}
          onClick={() => router.push(`/stock/product-categories/${item.id}`)}
          createdAt={item.createdAt}
          updatedAt={item.updatedAt}
        >
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {item.description || 'Sem descrição'}
          </p>
        </EntityCard>
      </EntityContextMenu>
    );
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoading) {
    return (
      <div className="min-h-screen px-6">
        <div className="max-w-8xl flex items-center justify-between mb-4">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="max-w-8xl mx-auto space-y-6">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen px-6">
        <Card className="max-w-8xl mx-auto p-12 text-center">
          <PiFolderOpenDuotone className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-2">
            Categoria não encontrada
          </h2>
          <p className="text-muted-foreground mb-6">
            A categoria que você está procurando não existe ou foi removida.
          </p>
          <Button onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Categorias
          </Button>
        </Card>
      </div>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen px-6">
      {/* Header */}
      <div className="max-w-8xl flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-5 w-5" />
          Voltar para Categorias
        </Button>
        <Button
          size="sm"
          onClick={() =>
            router.push(`/stock/product-categories/${categoryId}/edit`)
          }
        >
          <Edit className="h-4 w-4" />
          Editar
        </Button>
      </div>

      {/* Content */}
      <div className="max-w-8xl mx-auto space-y-6">
        {/* Category Identity */}
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
            {category.iconUrl ? (
              <img
                src={category.iconUrl}
                alt=""
                className="h-8 w-8 object-contain brightness-0 invert"
                onError={e => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <PiFolderOpenDuotone className="h-7 w-7 text-white" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">
                {category.name}
              </h1>
              <Badge variant={category.isActive ? 'default' : 'secondary'}>
                {category.isActive ? 'Ativa' : 'Inativa'}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm font-mono">
              {category.slug}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="details" className="w-full">
          <TabsList>
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="subcategories">
              Subcategorias ({subcategories.length})
            </TabsTrigger>
            <TabsTrigger value="products">
              Produtos ({category.productCount || 0})
            </TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="mt-4">
            <Card className="p-6">
              <div className="grid gap-6">
                {/* Description */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Descrição
                  </h3>
                  <p className="mt-1 text-sm">
                    {category.description || 'Sem descrição'}
                  </p>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Hash className="h-3 w-3" />
                      Ordem
                    </h3>
                    <p className="mt-1 text-sm">{category.displayOrder || 0}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <FolderTree className="h-3 w-3" />
                      Subcategorias
                    </h3>
                    <p className="mt-1 text-sm">
                      {category.childrenCount || 0}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      Produtos
                    </h3>
                    <p className="mt-1 text-sm">{category.productCount || 0}</p>
                  </div>

                  {parentCategory && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Categoria Pai
                      </h3>
                      <Button
                        variant="link"
                        className="mt-0 p-0 h-auto text-sm"
                        onClick={() =>
                          router.push(
                            `/stock/product-categories/${parentCategory.id}`
                          )
                        }
                      >
                        {parentCategory.name}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Icon URL */}
                {category.iconUrl && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Ícone
                    </h3>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-slate-600 to-slate-800 overflow-hidden">
                        <img
                          src={category.iconUrl}
                          alt="Ícone"
                          className="h-6 w-6 object-contain brightness-0 invert"
                          onError={e => {
                            (e.target as HTMLImageElement).style.display =
                              'none';
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground font-mono truncate max-w-[400px]">
                        {category.iconUrl}
                      </span>
                    </div>
                  </div>
                )}

                {/* Dates */}
                <div className="border-t pt-4 grid gap-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Criado em: {formatDate(category.createdAt)}</span>
                  </div>
                  {category.updatedAt && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Atualizado em: {formatDate(category.updatedAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Subcategories Tab */}
          <TabsContent value="subcategories" className="mt-4">
            {subcategories.length > 0 ? (
              <EntityGrid
                config={categoriesConfig}
                items={subcategories}
                renderGridItem={renderSubcategoryGridCard}
                renderListItem={renderSubcategoryListCard}
                isLoading={false}
                isSearching={false}
                showSorting={false}
              />
            ) : (
              <Card className="p-12 text-center">
                <FolderTree className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-1">
                  Nenhuma subcategoria
                </h3>
                <p className="text-sm text-muted-foreground">
                  Esta categoria não possui subcategorias.
                </p>
              </Card>
            )}
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="mt-4">
            <Card className="p-12 text-center">
              <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-1">
                Produtos da categoria
              </h3>
              <p className="text-sm text-muted-foreground">
                {category.productCount || 0} produtos vinculados a esta
                categoria.
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
