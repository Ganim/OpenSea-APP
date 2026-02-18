/**
 * Finance Category Detail Page
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useFinanceCategory } from '@/hooks/finance';
import { FINANCE_CATEGORY_TYPE_LABELS } from '@/types/finance';
import { ArrowLeft, Edit, FolderTree, Trash } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';

export default function FinanceCategoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading } = useFinanceCategory(id);
  const category = data?.category;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="space-y-4 w-full max-w-2xl">
          <div className="h-8 bg-muted animate-pulse rounded" />
          <div className="h-64 bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-destructive">Categoria não encontrada.</p>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
      alert('Funcionalidade de exclusão será implementada');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/finance/categories">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Voltar para categorias
            </Button>
          </Link>
        </div>

        <div className="flex gap-2">
          {!category.isSystem && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="gap-2"
            >
              <Trash className="h-4 w-4 text-red-800" />
              Excluir
            </Button>
          )}

          <Link href={`/finance/categories/${id}/edit`}>
            <Button variant="outline" size="sm" className="gap-2">
              <Edit className="h-4 w-4 text-sky-500" />
              Editar
            </Button>
          </Link>
        </div>
      </div>

      {/* Category Info Card */}
      <Card className="p-4 sm:p-6">
        <div className="flex gap-4 sm:flex-row items-center sm:gap-6">
          <div
            className="flex items-center justify-center h-10 w-10 md:h-16 md:w-16 rounded-lg shrink-0"
            style={{
              backgroundColor: category.color || '#8b5cf6',
            }}
          >
            <FolderTree className="md:h-8 md:w-8 text-white" />
          </div>
          <div className="flex justify-between flex-1 gap-4 flex-row items-center">
            <div>
              <h1 className="text-lg sm:text-3xl font-bold tracking-tight">
                {category.name}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {FINANCE_CATEGORY_TYPE_LABELS[category.type]}
                {category.parentName &&
                  ` • Subcategoria de ${category.parentName}`}
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant={category.isActive ? 'success' : 'secondary'}>
                {category.isActive ? 'Ativa' : 'Inativa'}
              </Badge>
              {category.isSystem && <Badge variant="outline">Sistema</Badge>}
            </div>
          </div>
        </div>
      </Card>

      {/* Details Card */}
      <Card className="p-4 sm:p-6">
        <h2 className="text-lg font-semibold mb-4">Informações</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Nome</p>
            <p className="font-medium">{category.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Slug</p>
            <p className="font-medium font-mono text-sm">{category.slug}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Tipo</p>
            <p className="font-medium">
              {FINANCE_CATEGORY_TYPE_LABELS[category.type]}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              Ordem de Exibição
            </p>
            <p className="font-medium">{category.displayOrder}</p>
          </div>
          {category.parentName && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Categoria Pai
              </p>
              <p className="font-medium">{category.parentName}</p>
            </div>
          )}
          {category.childrenCount !== undefined &&
            category.childrenCount > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Subcategorias
                </p>
                <p className="font-medium">{category.childrenCount}</p>
              </div>
            )}
          {category.entryCount !== undefined && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Lançamentos Vinculados
              </p>
              <p className="font-medium">{category.entryCount}</p>
            </div>
          )}
        </div>

        {category.description && (
          <div className="mt-6">
            <p className="text-sm text-muted-foreground mb-1">Descrição</p>
            <p className="font-medium">{category.description}</p>
          </div>
        )}
      </Card>
    </div>
  );
}
