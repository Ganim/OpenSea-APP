'use client';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type {
  GridLoadingProps,
  SkeletonDimensions,
} from './types/grid-loading.types';

/**
 * Componente GridLoading
 *
 * Renderiza um grid de skeletons para estados de carregamento.
 * Suporta múltiplos layouts: grid, list e compact.
 *
 * @example
 * <GridLoading
 *   count={9}
 *   layout="grid"
 *   size="md"
 *   animated={true}
 * />
 */
export function GridLoading({
  count = 9,
  layout = 'grid',
  size = 'md',
  className,
  gridClassName,
  skeletonClassName,
  animated = true,
  gap = 'gap-4',
  message,
}: GridLoadingProps) {
  // Dimensões para cada tamanho
  const dimensionsMap: Record<string, SkeletonDimensions> = {
    sm: {
      height: 'h-40',
      cardHeight: 'h-48',
      gridCols: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
      badgeHeight: 'h-6',
    },
    md: {
      height: 'h-48',
      cardHeight: 'h-60',
      gridCols: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
      badgeHeight: 'h-7',
    },
    lg: {
      height: 'h-64',
      cardHeight: 'h-80',
      gridCols: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      badgeHeight: 'h-8',
    },
  };

  const dimensions = dimensionsMap[size];

  // Configurações de layout
  const layoutConfig = {
    grid: {
      containerClasses: 'grid',
      gridClasses: dimensions.gridCols,
    },
    list: {
      containerClasses: 'flex flex-col',
      gridClasses: 'w-full',
    },
    compact: {
      containerClasses: 'grid',
      gridClasses: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6',
    },
  };

  const config = layoutConfig[layout];

  const renderGridSkeleton = () => (
    <Card className="overflow-hidden bg-white/50 dark:bg-white/5 border-gray-200/50 dark:border-white/10">
      <div className="p-4 space-y-3">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <Skeleton className={cn('h-6 w-3/4', !animated && 'animate-none')} />
          <Skeleton className={cn('h-4 w-1/2', !animated && 'animate-none')} />
        </div>

        {/* Image Skeleton */}
        <Skeleton
          className={cn(
            dimensions.cardHeight,
            'w-full rounded-lg',
            !animated && 'animate-none'
          )}
        />

        {/* Metadata Skeleton */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Skeleton
              className={cn(
                dimensions.badgeHeight,
                'w-16 rounded-full',
                !animated && 'animate-none'
              )}
            />
            <Skeleton
              className={cn(
                dimensions.badgeHeight,
                'w-16 rounded-full',
                !animated && 'animate-none'
              )}
            />
          </div>
          <Skeleton className={cn('h-3 w-full', !animated && 'animate-none')} />
          <Skeleton className={cn('h-3 w-2/3', !animated && 'animate-none')} />
        </div>
      </div>
    </Card>
  );

  const renderListSkeleton = () => (
    <Card className="overflow-hidden bg-white/50 dark:bg-white/5 border-gray-200/50 dark:border-white/10">
      <div className="p-4 flex gap-4">
        {/* Left Content */}
        <div className="shrink-0">
          <Skeleton
            className={cn(
              dimensions.height,
              'w-40 rounded-lg',
              !animated && 'animate-none'
            )}
          />
        </div>

        {/* Right Content */}
        <div className="flex-1 space-y-3">
          <Skeleton className={cn('h-6 w-2/3', !animated && 'animate-none')} />
          <Skeleton className={cn('h-4 w-full', !animated && 'animate-none')} />
          <Skeleton className={cn('h-4 w-3/4', !animated && 'animate-none')} />

          {/* Badges */}
          <div className="flex gap-2 pt-2">
            <Skeleton
              className={cn(
                dimensions.badgeHeight,
                'w-20 rounded-full',
                !animated && 'animate-none'
              )}
            />
            <Skeleton
              className={cn(
                dimensions.badgeHeight,
                'w-20 rounded-full',
                !animated && 'animate-none'
              )}
            />
          </div>

          {/* Metadata */}
          <div className="flex gap-4 pt-2">
            <Skeleton className={cn('h-3 w-24', !animated && 'animate-none')} />
            <Skeleton className={cn('h-3 w-24', !animated && 'animate-none')} />
          </div>
        </div>
      </div>
    </Card>
  );

  const renderCompactSkeleton = () => (
    <Card className="overflow-hidden bg-white/50 dark:bg-white/5 border-gray-200/50 dark:border-white/10">
      <div className="p-3 space-y-2">
        {/* Compact Image */}
        <Skeleton
          className={cn('h-24 w-full rounded-lg', !animated && 'animate-none')}
        />

        {/* Title */}
        <Skeleton className={cn('h-4 w-full', !animated && 'animate-none')} />

        {/* Badge */}
        <div className="flex gap-1">
          <Skeleton
            className={cn('h-5 w-12 rounded-full', !animated && 'animate-none')}
          />
        </div>
      </div>
    </Card>
  );

  const getSkeleton = () => {
    switch (layout) {
      case 'list':
        return renderListSkeleton();
      case 'compact':
        return renderCompactSkeleton();
      default:
        return renderGridSkeleton();
    }
  };

  return (
    <div className={className}>
      {/* Message (optional) */}
      {message && (
        <div className="mb-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
        </div>
      )}

      {/* Skeletons Grid */}
      <div
        className={cn(
          config.containerClasses,
          config.gridClasses,
          gap,
          gridClassName
        )}
      >
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className={skeletonClassName}>
            {getSkeleton()}
          </div>
        ))}
      </div>
    </div>
  );
}

export type {
  GridLoadingLayout,
  GridLoadingProps,
  SkeletonSize,
} from './types/grid-loading.types';
