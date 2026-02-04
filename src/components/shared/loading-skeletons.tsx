/**
 * OpenSea - Loading Skeletons
 * Componentes reutilizáveis para estados de carregamento
 */

'use client';

import { Skeleton } from '@/components/ui/skeleton';

interface GridLoadingProps {
  count?: number;
  columns?: 1 | 2 | 3 | 4;
  height?: string;
}

/**
 * Skeleton para grid de itens (produtos, templates, etc)
 */
export function GridLoading({
  count = 9,
  columns = 3,
  height = 'h-64',
}: GridLoadingProps) {
  const gridClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };

  return (
    <div className={`grid ${gridClass[columns]} gap-4 w-full`}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={`${height} rounded-lg`} />
      ))}
    </div>
  );
}

interface ListLoadingProps {
  count?: number;
  height?: string;
}

/**
 * Skeleton para lista de itens
 */
export function ListLoading({ count = 5, height = 'h-12' }: ListLoadingProps) {
  return (
    <div className="space-y-2 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={`${height} rounded`} />
      ))}
    </div>
  );
}

interface TableLoadingProps {
  rows?: number;
  columns?: number;
}

/**
 * Skeleton para tabela
 */
export function TableLoading({ rows = 8, columns = 5 }: TableLoadingProps) {
  return (
    <div className="w-full border border-gray-200 rounded">
      {/* Cabeçalho */}
      <div className="flex border-b border-gray-200 bg-gray-50 p-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`header-${i}`} className="h-6 flex-1 mr-4" />
        ))}
      </div>

      {/* Linhas */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={`row-${rowIdx}`}
          className="flex border-b border-gray-200 p-4"
        >
          {Array.from({ length: columns }).map((_, colIdx) => (
            <Skeleton
              key={`cell-${rowIdx}-${colIdx}`}
              className="h-6 flex-1 mr-4"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton para página inteira
 */
export function PageSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Título */}
      <div className="space-y-2">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-6 w-96" />
      </div>

      {/* Filtros/Ações */}
      <div className="flex gap-2">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-24" />
      </div>

      {/* Grid de conteúdo */}
      <GridLoading count={9} columns={3} />
    </div>
  );
}

/**
 * Skeleton para card individual
 */
export function CardSkeleton({ withImage = true }: { withImage?: boolean }) {
  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      {withImage && <Skeleton className="w-full h-48" />}

      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />

        <div className="flex gap-2 pt-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton para formulário
 */
export function FormSkeleton({ fieldCount = 6 }: { fieldCount?: number }) {
  return (
    <div className="space-y-4 w-full max-w-2xl">
      {Array.from({ length: fieldCount }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}

      <div className="flex gap-2 pt-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

/**
 * Skeleton para detalhe de página
 */
export function DetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="space-y-2">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-6 w-96" />
      </div>

      {/* Abas/Navegação */}
      <div className="flex gap-4 border-b border-gray-200">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Conteúdo */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
