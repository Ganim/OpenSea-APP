/**
 * Variantes de layout para o GridLoading
 */
export type GridLoadingLayout = 'grid' | 'list' | 'compact';

/**
 * Tamanho dos skeletons
 */
export type SkeletonSize = 'sm' | 'md' | 'lg';

/**
 * Propriedades do componente GridLoading
 */
export interface GridLoadingProps {
  /** Quantidade de skeletons a renderizar */
  count?: number;
  /** Tipo de layout */
  layout?: GridLoadingLayout;
  /** Tamanho dos skeletons */
  size?: SkeletonSize;
  /** Classes Tailwind customizadas */
  className?: string;
  /** Classes para o container de grid */
  gridClassName?: string;
  /** Classes para cada skeleton */
  skeletonClassName?: string;
  /** Se deve mostrar animação de pulso */
  animated?: boolean;
  /** Espaçamento entre items */
  gap?: 'gap-2' | 'gap-3' | 'gap-4' | 'gap-6';
  /** Mensagem alternativa a mostrar junto com skeletons */
  message?: string;
}

/**
 * Configuração de dimensões para cada tamanho
 */
export interface SkeletonDimensions {
  height: string;
  cardHeight: string;
  gridCols: string;
  badgeHeight: string;
}
