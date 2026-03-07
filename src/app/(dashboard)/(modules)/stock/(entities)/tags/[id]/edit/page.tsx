/**
 * Edit Tag Page
 * Página de edição de tag
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
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useDeleteTag, useUpdateTag } from '@/hooks/stock/use-stock-other';
import { logger } from '@/lib/logger';
import type { Tag, UpdateTagRequest } from '@/types/stock';
import { useQuery } from '@tanstack/react-query';
import { Save, Tag as TagIcon, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

export default function EditTagPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id: tagId } = use(params);

  const {
    data: tag,
    isLoading: isLoadingTag,
    error,
    refetch,
  } = useQuery<Tag>({
    queryKey: ['tags', tagId],
    queryFn: async () => {
      const response = await fetch(`/api/v1/tags/${tagId}`);
      const data = await response.json();
      return data.tag;
    },
  });
  const updateTagMutation = useUpdateTag();
  const deleteTagMutation = useDeleteTag();

  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3B82F6');

  useEffect(() => {
    if (tag) {
      setName(tag.name || '');
      setDescription(tag.description || '');
      setColor(tag.color || '#3B82F6');
    }
  }, [tag]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    try {
      setIsLoading(true);
      const data: UpdateTagRequest = {
        name: name.trim(),
        description: description.trim() || undefined,
        color: color || undefined,
      };

      await updateTagMutation.mutateAsync({
        id: tagId,
        data,
      });

      toast.success('Tag atualizada com sucesso!');
      router.push(`/stock/tags/${tagId}`);
    } catch (error) {
      logger.error(
        'Failed to update tag',
        error instanceof Error ? error : new Error(String(error)),
        { tagId }
      );
      const message =
        error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error('Erro ao atualizar tag', { description: message });
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
      await deleteTagMutation.mutateAsync(tagId);
      toast.success('Tag excluída com sucesso!');
      router.push('/stock/tags');
    } catch (error) {
      logger.error(
        'Failed to delete tag',
        error instanceof Error ? error : new Error(String(error)),
        { tagId }
      );
      const message =
        error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error('Erro ao deletar tag', { description: message });
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
        id: 'delete-tag',
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
        onClick: () => router.push(`/stock/tags/${tagId}`),
        variant: 'outline' as const,
      },
      {
        id: 'save-tag',
        title: isLoading ? 'Salvando...' : 'Salvar',
        icon: Save,
        onClick: () => handleSubmit(),
        variant: 'default' as const,
        disabled: isLoading || isDeleting || !name.trim(),
      },
    ],
    [isLoading, isDeleting, name, router, tagId]
  );

  const presetColors = [
    '#EF4444',
    '#F59E0B',
    '#10B981',
    '#3B82F6',
    '#8B5CF6',
    '#EC4899',
    '#6B7280',
    '#14B8A6',
    '#F97316',
    '#06B6D4',
  ];

  // ============================================================================
  // LOADING / ERROR / NOT FOUND
  // ============================================================================

  if (isLoadingTag) {
    return (
      <PageLayout>
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'Estoque', href: '/stock' },
              { label: 'Tags', href: '/stock/tags' },
              { label: '...' },
              { label: 'Editar' },
            ]}
          />
          <Header title="Carregando..." />
        </PageHeader>
        <PageBody>
          <GridLoading count={1} layout="list" size="md" />
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
              { label: 'Tags', href: '/stock/tags' },
            ]}
          />
          <Header title="Erro" />
        </PageHeader>
        <PageBody>
          <GridError
            type="server"
            title="Erro ao carregar tag"
            message="Ocorreu um erro ao tentar carregar os dados da tag."
            action={{
              label: 'Tentar Novamente',
              onClick: () => void refetch(),
            }}
          />
        </PageBody>
      </PageLayout>
    );
  }

  if (!tag) {
    return (
      <PageLayout>
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'Estoque', href: '/stock' },
              { label: 'Tags', href: '/stock/tags' },
            ]}
          />
          <Header title="Tag não encontrada" />
        </PageHeader>
        <PageBody>
          <GridError
            type="not-found"
            title="Tag não encontrada"
            message="A tag que você está procurando não existe ou foi removida."
            action={{
              label: 'Voltar para Tags',
              onClick: () => router.push('/stock/tags'),
            }}
            icon={TagIcon}
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
            { label: 'Tags', href: '/stock/tags' },
            { label: tag.name, href: `/stock/tags/${tagId}` },
            { label: 'Editar' },
          ]}
          buttons={actionButtons}
        />

        <Header title="Editar Tag" description={`Editando: ${tag.name}`} />
      </PageHeader>

      <PageBody>
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
                  placeholder="Nome da tag"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Descrição da tag"
                  rows={3}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="color">Cor</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="color"
                    type="color"
                    value={color}
                    onChange={e => setColor(e.target.value)}
                    className="h-12 w-24 cursor-pointer"
                  />
                  <div className="flex flex-wrap gap-2">
                    {presetColors.map(presetColor => (
                      <button
                        key={presetColor}
                        type="button"
                        onClick={() => setColor(presetColor)}
                        className="h-8 w-8 rounded border-2 transition-all hover:scale-110"
                        style={{
                          backgroundColor: presetColor,
                          borderColor:
                            color === presetColor ? '#000' : 'transparent',
                        }}
                        title={presetColor}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Código da cor: {color}
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <Label className="mb-2 block">Pré-visualização</Label>
                <div className="flex items-center gap-2">
                  <div
                    className="h-8 w-8 rounded"
                    style={{ backgroundColor: color }}
                  />
                  <span
                    className="rounded-full px-3 py-1 text-sm font-medium"
                    style={{
                      backgroundColor: color + '20',
                      color: color,
                      border: `1px solid ${color}40`,
                    }}
                  >
                    {name || 'Nome da Tag'}
                  </span>
                </div>
              </div>
            </div>
          </form>
        </Card>
      </PageBody>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a tag &ldquo;{tag.name}&rdquo;?
              Esta ação não pode ser desfeita.
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
