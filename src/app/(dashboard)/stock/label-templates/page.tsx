/**
 * Label Templates Page
 * Página de gerenciamento de templates de etiquetas
 */

'use client';

import { Header } from '@/components/layout/header';
import { PageLayout } from '@/components/layout/page-layout';
import { SearchBar } from '@/components/layout/search-bar';
import type { HeaderButton } from '@/components/layout/types/header.types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import type { LabelTemplate } from '@/core/print-queue/editor';
import { LABEL_SIZE_PRESETS } from '@/core/print-queue/editor';
import { useLabelTemplateCrud } from '@/hooks/stock/use-label-templates';
import {
  Copy,
  Edit,
  FileText,
  MoreVertical,
  Plus,
  Printer,
  Tag,
  Trash2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

export default function LabelTemplatesPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] =
    useState<LabelTemplate | null>(null);

  // Debounce search para não fazer requisições a cada tecla
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { templates, isLoading, remove, duplicate, isDeleting, isDuplicating } =
    useLabelTemplateCrud({
      search: debouncedSearch || undefined,
      includeSystem: true,
    });

  // Separar templates do sistema e customizados
  const systemTemplates = useMemo(
    () => templates.filter(t => t.isSystem),
    [templates]
  );
  const customTemplates = useMemo(
    () => templates.filter(t => !t.isSystem),
    [templates]
  );

  const handleCreateNew = useCallback(() => {
    router.push('/stock/label-templates/new');
  }, [router]);

  const handleEdit = useCallback(
    (template: LabelTemplate) => {
      router.push(`/stock/label-templates/${template.id}/edit`);
    },
    [router]
  );

  const handleView = useCallback(
    (template: LabelTemplate) => {
      router.push(`/stock/label-templates/${template.id}`);
    },
    [router]
  );

  const handleDuplicate = useCallback(
    async (template: LabelTemplate) => {
      await duplicate(template.id, `${template.name} (Cópia)`);
    },
    [duplicate]
  );

  const handleDeleteClick = useCallback((template: LabelTemplate) => {
    setTemplateToDelete(template);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!templateToDelete) return;
    await remove(templateToDelete.id);
    setDeleteDialogOpen(false);
    setTemplateToDelete(null);
  }, [templateToDelete, remove]);

  const headerButtons: HeaderButton[] = useMemo(
    () => [
      {
        id: 'create-template',
        title: 'Novo Template',
        icon: Plus,
        onClick: handleCreateNew,
        variant: 'default',
      },
    ],
    [handleCreateNew]
  );

  const renderTemplateCard = (template: LabelTemplate) => {
    const sizePreset = LABEL_SIZE_PRESETS.find(
      p => p.width === template.width && p.height === template.height
    );

    return (
      <Card
        key={template.id}
        className="group hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => handleView(template)}
      >
        <CardContent className="p-4">
          {/* Preview/Thumbnail */}
          <div className="aspect-video bg-muted rounded-md mb-3 flex items-center justify-center overflow-hidden">
            {template.thumbnailUrl ? (
              <img
                src={template.thumbnailUrl}
                alt={template.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center text-muted-foreground">
                <Tag className="w-8 h-8 mb-2" />
                <span className="text-xs">
                  {template.width}mm x {template.height}mm
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">{template.name}</h3>
              {template.description && (
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {template.description}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={template.isSystem ? 'secondary' : 'outline'}>
                  {template.isSystem ? 'Sistema' : 'Customizado'}
                </Badge>
                {sizePreset && (
                  <Badge variant="outline" className="text-xs">
                    {sizePreset.name}
                  </Badge>
                )}
              </div>
            </div>

            {/* Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={e => {
                    e.stopPropagation();
                    handleView(template);
                  }}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Visualizar
                </DropdownMenuItem>
                {!template.isSystem && (
                  <DropdownMenuItem
                    onClick={e => {
                      e.stopPropagation();
                      handleEdit(template);
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={e => {
                    e.stopPropagation();
                    handleDuplicate(template);
                  }}
                  disabled={isDuplicating}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicar
                </DropdownMenuItem>
                {!template.isSystem && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={e => {
                        e.stopPropagation();
                        handleDeleteClick(template);
                      }}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <PageLayout backgroundVariant="none" maxWidth="full" spacing="gap-8">
      <Header
        title="Templates de Etiqueta"
        description="Gerencie os templates para impressão de etiquetas"
        buttons={headerButtons}
      />

      <SearchBar
        placeholder="Buscar templates..."
        value={search}
        onSearch={setSearch}
        showClear
        size="md"
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="aspect-video rounded-md mb-3" />
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Templates do Sistema */}
          {systemTemplates.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Printer className="w-5 h-5" />
                Templates do Sistema
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {systemTemplates.map(renderTemplateCard)}
              </div>
            </div>
          )}

          {/* Templates Customizados */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Templates Customizados
              {customTemplates.length > 0 && (
                <Badge variant="secondary">{customTemplates.length}</Badge>
              )}
            </h2>
            {customTemplates.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Tag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold mb-2">
                    Nenhum template customizado
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Crie um novo template ou duplique um template do sistema
                  </p>
                  <Button onClick={handleCreateNew}>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Template
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {customTemplates.map(renderTemplateCard)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Template</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o template &quot;
              {templateToDelete?.name}&quot;? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
