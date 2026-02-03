/**
 * OpenSea OS - Tag Detail Page
 * Página de detalhes de uma tag específica
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Tag } from '@/types/stock';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Tag as TagIcon } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

export default function TagDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tagId = params.id as string;

  const { data: tag, isLoading } = useQuery<Tag>({
    queryKey: ['tags', tagId],
    queryFn: async () => {
      const response = await fetch(`/api/v1/tags/${tagId}`);
      const data = await response.json();
      return data.tag;
    },
  });

  const handleBack = () => {
    router.push('/stock/tags');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!tag) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-12 text-center">
          <TagIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-2">Tag não encontrada</h2>
          <p className="text-muted-foreground mb-6">
            A tag que você está procurando não existe ou foi removida.
          </p>
          <Button onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Tags
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen from-purple-50 via-gray-50 to-pink-50 dark:from-gray-900 dark:via-slate-900 dark:to-slate-800 px-6">
      <div className="max-w-8xl flex items-center gap-4 mb-2">
        <Button variant="ghost" size={'sm'} onClick={handleBack}>
          <ArrowLeft className="h-5 w-5" />
          Voltar para Tags
        </Button>
      </div>

      <div className="max-w-8xl mx-auto space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-lg"
              style={{
                backgroundColor: tag.color || '#6B7280',
              }}
            >
              <TagIcon className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight">{tag.name}</h1>
              {tag.description && (
                <p className="text-muted-foreground text-sm">
                  {tag.description}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {tag.description && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Descrição
                </h3>
                <p className="mt-1 text-sm">{tag.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {tag.color && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Cor
                  </h3>
                  <div className="mt-1 flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="text-sm">{tag.color}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={() => router.push(`/stock/tags/${tagId}/edit`)}>
                Editar Tag
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
