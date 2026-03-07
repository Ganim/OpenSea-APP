/**
 * OpenSea OS - Product Category Detail Page
 * Página de detalhes de uma categoria de produto com layout de tabs
 */

'use client';

import { GridError } from '@/components/handlers/grid-error';
import { GridLoading } from '@/components/handlers/grid-loading';
import { Header } from '@/components/layout/header';
import { PageActionBar } from '@/components/layout/page-action-bar';
import {
  PageBody,
  PageHeader,
  PageLayout,
} from '@/components/layout/page-layout';
import type { HeaderButton } from '@/components/layout/types/header.types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { categoriesConfig } from '@/config/entities/categories.config';
import { EntityCard, EntityContextMenu, EntityGrid } from '@/core';
import { useCategories, useCategory } from '@/hooks/stock/use-categories';
import type { Category } from '@/types/stock';
import { Calendar, Clock, Edit, FolderTree, Hash, Package } from 'lucide-react';
import Image from 'next/image';
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

  const {
    data: categoryData,
    isLoading,
    error,
    refetch,
  } = useCategory(categoryId);
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

  // ============================================================================
  // HEADER BUTTONS
  // ============================================================================

  const actionButtons: HeaderButton[] = useMemo(
    () => [
      {
        id: 'edit-category',
        title: 'Editar',
        icon: Edit,
        onClick: () =>
          router.push(`/stock/product-categories/${categoryId}/edit`),
        variant: 'default' as const,
      },
    ],
    [router, categoryId]
  );

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
          iconBgColor="bg-linear-to-br from-blue-500 to-purple-600"
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
          iconBgColor="bg-linear-to-br from-blue-500 to-purple-600"
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
  // LOADING / ERROR / NOT FOUND
  // ============================================================================

  if (isLoading) {
    return (
      <PageLayout>
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'Estoque', href: '/stock' },
              { label: 'Categorias', href: '/stock/product-categories' },
            ]}
          />
          <Header title="Carregando..." />
        </PageHeader>
        <PageBody>
          <GridLoading count={3} layout="list" size="md" />
        </PageBody>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'Estoque', href: '/stock' },
              { label: 'Categorias', href: '/stock/product-categories' },
            ]}
          />
          <Header title="Erro" />
        </PageHeader>
        <PageBody>
          <GridError
            type="server"
            title="Erro ao carregar categoria"
            message="Ocorreu um erro ao tentar carregar os dados da categoria."
            action={{
              label: 'Tentar Novamente',
              onClick: () => void refetch(),
            }}
          />
        </PageBody>
      </PageLayout>
    );
  }

  if (!category) {
    return (
      <PageLayout>
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'Estoque', href: '/stock' },
              { label: 'Categorias', href: '/stock/product-categories' },
            ]}
          />
          <Header title="Categoria não encontrada" />
        </PageHeader>
        <PageBody>
          <GridError
            type="not-found"
            title="Categoria não encontrada"
            message="A categoria que você está procurando não existe ou foi removida."
            action={{
              label: 'Voltar para Categorias',
              onClick: () => router.push('/stock/product-categories'),
            }}
          />
        </PageBody>
      </PageLayout>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <PageLayout>
      <PageHeader>
        <PageActionBar
          breadcrumbItems={[
            { label: 'Estoque', href: '/stock' },
            { label: 'Categorias', href: '/stock/product-categories' },
            {
              label: category.name,
              href: `/stock/product-categories/${categoryId}`,
            },
          ]}
          buttons={actionButtons}
        />

        {/* Category Identity */}
        <Card className="bg-white/5 p-5">
          <div className="flex items-start gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-purple-600 overflow-hidden shrink-0">
              {category.iconUrl ? (
                <Image
                  src={category.iconUrl}
                  alt=""
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain brightness-0 invert"
                  unoptimized
                  onError={e => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <PiFolderOpenDuotone className="h-7 w-7 text-white" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">
                  {category.name}
                </h1>
                <Badge variant={category.isActive ? 'default' : 'secondary'}>
                  {category.isActive ? 'Ativa' : 'Inativa'}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm font-mono mt-0.5">
                {category.slug}
              </p>
              {category.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {category.description}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2 shrink-0 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span>
                  Criado em{' '}
                  {category.createdAt
                    ? new Date(category.createdAt).toLocaleDateString('pt-BR')
                    : '-'}
                </span>
              </div>
              {category.updatedAt && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 text-emerald-500" />
                  <span>
                    Atualizado em{' '}
                    {new Date(category.updatedAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
              {parentCategory && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FolderTree className="h-4 w-4 text-purple-500" />
                  <Button
                    variant="link"
                    className="p-0 h-auto text-sm text-muted-foreground hover:text-foreground"
                    onClick={() =>
                      router.push(
                        `/stock/product-categories/${parentCategory.id}`
                      )
                    }
                  >
                    Pai: {parentCategory.name}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      </PageHeader>

      <PageBody>
        {/* Tabs */}
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4 p-2 h-12">
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="subcategories">
              Subcategorias ({subcategories.length})
            </TabsTrigger>
            <TabsTrigger value="products">
              Produtos ({category.productCount || 0})
            </TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="w-full">
            <Card className="w-full p-6 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
              <div className="w-full grid gap-6">
                {/* Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Hash className="h-3 w-3" />
                      Ordem de Exibição
                    </h3>
                    <p className="mt-1 text-sm font-medium">
                      {category.displayOrder || 0}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <FolderTree className="h-3 w-3" />
                      Subcategorias
                    </h3>
                    <p className="mt-1 text-sm font-medium">
                      {category.childrenCount || 0}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      Produtos
                    </h3>
                    <p className="mt-1 text-sm font-medium">
                      {category.productCount || 0}
                    </p>
                  </div>
                </div>

                {/* Icon URL */}
                {category.iconUrl && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Ícone
                    </h3>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-slate-600 to-slate-800 overflow-hidden">
                        <Image
                          src={category.iconUrl}
                          alt="Ícone"
                          width={24}
                          height={24}
                          className="h-6 w-6 object-contain brightness-0 invert"
                          unoptimized
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
              </div>
            </Card>
          </TabsContent>

          {/* Subcategories Tab */}
          <TabsContent value="subcategories" className="w-full">
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
              <Card className="w-full p-12 text-center bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
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
          <TabsContent value="products" className="w-full">
            <Card className="w-full p-12 text-center bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
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
      </PageBody>
    </PageLayout>
  );
}
