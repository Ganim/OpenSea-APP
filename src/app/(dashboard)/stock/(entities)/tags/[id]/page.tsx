/**
 * OpenSea OS - Tag Detail Page
 * Página de detalhes de uma tag específica
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
import { Card } from '@/components/ui/card';
import type { Tag } from '@/types/stock';
import { useQuery } from '@tanstack/react-query';
import { Edit, Tag as TagIcon } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useMemo } from 'react';

export default function TagDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tagId = params.id as string;

  const {
    data: tag,
    isLoading,
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

  // ============================================================================
  // HEADER BUTTONS
  // ============================================================================

  const actionButtons: HeaderButton[] = useMemo(
    () => [
      {
        id: 'edit-tag',
        title: 'Editar',
        icon: Edit,
        onClick: () => router.push(`/stock/tags/${tagId}/edit`),
        variant: 'default' as const,
      },
    ],
    [router, tagId]
  );

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
              { label: 'Tags', href: '/stock/tags' },
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
          ]}
          buttons={actionButtons}
        />

        {/* Tag Identity */}
        <div className="flex items-center gap-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-xl"
            style={{ backgroundColor: tag.color || '#6B7280' }}
          >
            <TagIcon className="h-7 w-7 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">{tag.name}</h1>
            {tag.description && (
              <p className="text-muted-foreground text-sm">{tag.description}</p>
            )}
          </div>
        </div>
      </PageHeader>

      <PageBody>
        <Card className="p-6">
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
          </div>
        </Card>
      </PageBody>
    </PageLayout>
  );
}
