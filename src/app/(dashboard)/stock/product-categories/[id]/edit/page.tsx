/**
 * Edit Category Page
 * Página de edição de categoria - seguindo padrão template/[id]/edit
 */

'use client';

import { logger } from '@/lib/logger';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  useCategories,
  useCategory,
  useDeleteCategory,
  useReorderCategories,
  useUpdateCategory,
} from '@/hooks/stock/use-categories';
import type { Category, UpdateCategoryRequest } from '@/types/stock';
import { ArrowLeft, FolderTree, Save, Trash2 } from 'lucide-react';
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

  const { data: categoryData, isLoading: isLoadingCategory } =
    useCategory(categoryId);
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

  const handleBack = () => {
    router.push(`/stock/product-categories/${categoryId}`);
  };

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
  // LOADING / NOT FOUND
  // ============================================================================

  if (isLoadingCategory) {
    return (
      <div className="min-h-screen px-6">
        <div className="max-w-8xl flex items-center justify-between mb-6">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-40" />
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
          <Button onClick={() => router.push('/stock/product-categories')}>
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
      {/* Header - Back + Save */}
      <div className="max-w-8xl flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-5 w-5" />
          Voltar
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteClick}
            disabled={isLoading || isDeleting}
          >
            <Trash2 className="h-4 w-4" />
            Excluir
          </Button>
          <Button
            size="sm"
            onClick={() => handleSubmit()}
            disabled={isLoading || isDeleting || !name.trim()}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {isLoading ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </div>
      </div>

      <div className="max-w-8xl mx-auto space-y-6">
        {/* Entity Banner */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800/50 dark:to-gray-800/50 border border-gray-200 dark:border-gray-700">
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
        <Card className="p-6">
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
          <Card className="p-6">
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
      </div>

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
    </div>
  );
}
