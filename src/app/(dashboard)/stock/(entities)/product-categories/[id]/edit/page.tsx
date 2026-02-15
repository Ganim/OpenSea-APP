/**
 * Edit Category Page
 * Página de edição de categoria - seguindo padrão template/[id]/edit
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  useCategories,
  useCategory,
  useDeleteCategory,
  useReorderCategories,
  useUpdateCategory,
} from '@/hooks/stock/use-categories';
import { logger } from '@/lib/logger';
import type { Category, UpdateCategoryRequest } from '@/types/stock';
import { FolderTree, Save, Trash2, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { use, useEffect, useMemo, useRef, useState } from 'react';
import { PiFolderOpenDuotone } from 'react-icons/pi';
import { toast } from 'sonner';
import {
  SortableCategoryList,
  type SortableCategoryListRef,
} from '../../src/components/sortable-category-list';

export default function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id: categoryId } = use(params);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const {
    data: categoryData,
    isLoading: isLoadingCategory,
    error,
    refetch,
  } = useCategory(categoryId);
  const category = categoryData?.category;

  const { data: categoriesData } = useCategories();
  const categories = useMemo(
    () => categoriesData?.categories || [],
    [categoriesData]
  );
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();
  const reorderMutation = useReorderCategories();
  const subcategorySortableRef = useRef<SortableCategoryListRef>(null);

  // ============================================================================
  // FORM STATE
  // ============================================================================

  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [parentId, setParentId] = useState('none');
  const [isActive, setIsActive] = useState(true);

  // ============================================================================
  // COMPUTED
  // ============================================================================

  const subcategories = useMemo(
    () => categories.filter((c: Category) => c.parentId === categoryId),
    [categories, categoryId]
  );

  const availableParents = useMemo(
    () =>
      categories.filter((c: Category) => {
        if (c.id === categoryId) return false;
        let current = c;
        while (current.parentId) {
          if (current.parentId === categoryId) return false;
          const parent = categories.find(
            (cat: Category) => cat.id === current.parentId
          );
          if (!parent) break;
          current = parent;
        }
        return true;
      }),
    [categories, categoryId]
  );

  // ============================================================================
  // SYNC FORM WITH DATA
  // ============================================================================

  useEffect(() => {
    if (category) {
      setName(category.name || '');
      setDescription(category.description || '');
      setIconUrl(category.iconUrl || '');
      setParentId(category.parentId || 'none');
      setIsActive(category.isActive ?? true);
    }
  }, [category]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    try {
      setIsLoading(true);
      const data: UpdateCategoryRequest = {
        name: name.trim(),
        description: description.trim() || undefined,
        iconUrl: iconUrl.trim() || null,
        parentId: parentId === 'none' ? undefined : parentId || undefined,
        isActive,
      };

      await updateCategoryMutation.mutateAsync({
        id: categoryId,
        data,
      });

      toast.success('Categoria atualizada com sucesso!');
      router.push(`/stock/product-categories/${categoryId}`);
    } catch (error) {
      logger.error(
        'Erro ao atualizar categoria',
        error instanceof Error ? error : undefined
      );
      const message =
        error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error('Erro ao atualizar categoria', { description: message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      await deleteCategoryMutation.mutateAsync(categoryId);
      toast.success('Categoria excluída com sucesso!');
      router.push('/stock/product-categories');
    } catch (error) {
      logger.error(
        'Erro ao deletar categoria',
        error instanceof Error ? error : undefined
      );
      const message =
        error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error('Erro ao deletar categoria', { description: message });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  // ============================================================================
  // HEADER BUTTONS
  // ============================================================================

  const actionButtons: HeaderButton[] = useMemo(
    () => [
      {
        id: 'delete-category',
        title: 'Excluir',
        icon: Trash2,
        onClick: handleDeleteClick,
        variant: 'destructive' as const,
        disabled: isLoading || isDeleting,
      },
      {
        id: 'cancel-edit',
        title: 'Cancelar',
        icon: X,
        onClick: () => router.push(`/stock/product-categories/${categoryId}`),
        variant: 'outline' as const,
      },
      {
        id: 'save-category',
        title: isLoading ? 'Salvando...' : 'Salvar',
        icon: Save,
        onClick: () => handleSubmit(),
        variant: 'default' as const,
        disabled: isLoading || isDeleting || !name.trim(),
      },
    ],
    [isLoading, isDeleting, name, router, categoryId]
  );

  // ============================================================================
  // LOADING / ERROR / NOT FOUND
  // ============================================================================

  if (isLoadingCategory) {
    return (
      <PageLayout>
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'Estoque', href: '/stock' },
              { label: 'Categorias', href: '/stock/product-categories' },
              { label: '...' },
              { label: 'Editar' },
            ]}
          />
          <Header title="Carregando..." />
        </PageHeader>
        <PageBody>
          <GridLoading count={2} layout="list" size="md" />
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
            { label: 'Editar' },
          ]}
          buttons={actionButtons}
        />

        <Header
          title="Editar Categoria"
          description={`Editando: ${category.name}`}
        />
      </PageHeader>

      <PageBody>
        {/* Entity Banner */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/95 dark:bg-white/5 border border-gray-200 dark:border-white/10">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-purple-600 shadow-lg overflow-hidden">
            {category.iconUrl ? (
              <Image
                src={category.iconUrl}
                alt={category.name}
                width={28}
                height={28}
                className="h-7 w-7 object-contain brightness-0 invert"
                unoptimized
                onError={e => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <PiFolderOpenDuotone className="h-7 w-7 text-white" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Editando categoria</p>
            <h1 className="text-xl font-bold">{category.name}</h1>
          </div>
        </div>

        {/* Form */}
        <Card className="p-6 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">
                  Nome <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Nome da categoria"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Descrição da categoria"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div className="grid gap-2">
                  <Label htmlFor="iconUrl">URL do Ícone (SVG)</Label>
                  <Input
                    id="iconUrl"
                    placeholder="https://exemplo.com/icone.svg"
                    value={iconUrl}
                    onChange={e => setIconUrl(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Preview do Ícone</Label>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-slate-600 to-slate-800 overflow-hidden">
                    {iconUrl ? (
                      <Image
                        src={iconUrl}
                        alt="Preview"
                        width={24}
                        height={24}
                        className="h-6 w-6 object-contain brightness-0 invert"
                        unoptimized
                        onError={e => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <PiFolderOpenDuotone className="h-6 w-6 text-white" />
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="parentId">Categoria Pai</Label>
                <Select value={parentId} onValueChange={setParentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria pai" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma (raiz)</SelectItem>
                    {availableParents.map(parent => (
                      <SelectItem key={parent.id} value={parent.id}>
                        {parent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={checked => setIsActive(checked as boolean)}
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  Categoria ativa
                </Label>
              </div>
            </div>
          </form>
        </Card>

        {/* Subcategories Section */}
        {subcategories.length > 0 && (
          <Card className="p-6 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FolderTree className="h-5 w-5" />
                Subcategorias ({subcategories.length})
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (subcategorySortableRef.current) {
                    reorderMutation.mutate(
                      subcategorySortableRef.current.getReorderedItems()
                    );
                  }
                }}
              >
                Salvar Ordem
              </Button>
            </div>
            <SortableCategoryList
              ref={subcategorySortableRef}
              items={subcategories}
            />
          </Card>
        )}
      </PageBody>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a categoria &ldquo;{category.name}
              &rdquo;? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
}
