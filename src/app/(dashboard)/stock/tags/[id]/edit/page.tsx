/**
 * Edit Tag Page
 * Página de edição de tag
 */

'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { PageHeader } from '@/components/stock/page-header';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useDeleteTag, useUpdateTag } from '@/hooks/stock/use-stock-other';
import type { Tag, UpdateTagRequest } from '@/types/stock';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function EditTagPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id: tagId } = use(params);

  const { data: tag, isLoading: isLoadingTag } = useQuery<Tag>({
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

  // Carregar dados da tag quando disponível
  useEffect(() => {
    if (tag) {
      setName(tag.name || '');
      setDescription(tag.description || '');
      setColor(tag.color || '#3B82F6');
    }
  }, [tag]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      console.error('Erro ao atualizar tag:', error);
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
      console.error('Erro ao deletar tag:', error);
      const message =
        error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error('Erro ao deletar tag', { description: message });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (isLoadingTag) {
    return (
      <ProtectedRoute requiredPermission="stock.tags.update">
        <div className="container mx-auto px-4 py-8">
          <Card className="p-8">
            <div className="flex items-center justify-center">
              <p className="text-muted-foreground">Carregando tag...</p>
            </div>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  if (!tag) {
    return (
      <ProtectedRoute requiredPermission="stock.tags.update">
        <div className="container mx-auto px-4 py-8">
          <Card className="p-8">
            <div className="flex items-center justify-center">
              <p className="text-red-500">Tag não encontrada</p>
            </div>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  const presetColors = [
    '#EF4444', // red
    '#F59E0B', // amber
    '#10B981', // green
    '#3B82F6', // blue
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#6B7280', // gray
    '#14B8A6', // teal
    '#F97316', // orange
    '#06B6D4', // cyan
  ];

  return (
    <ProtectedRoute requiredPermission="stock.tags.update">
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="Editar Tag"
          description="Atualize as informações da tag"
        />

        <Card className="mt-6 p-6">
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

            <div className="flex justify-between pt-4">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading || isDeleting}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  disabled={isLoading || isDeleting || !name.trim()}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>

              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteClick}
                disabled={isLoading || isDeleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir Tag
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a tag "{tag.name}"? Esta ação não
              pode ser desfeita.
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
    </ProtectedRoute>
  );
}
