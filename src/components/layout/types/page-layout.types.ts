import type { ReactNode } from 'react';

/**
 * Tamanho máximo do conteúdo
 */
export type PageMaxWidth = 'sm' | 'md' | 'lg' | 'xl' | 'full';

/**
 * Espaçamento entre seções
 */
export type PageSpacing =
  | 'gap-2'
  | 'gap-3'
  | 'gap-4'
  | 'gap-5'
  | 'gap-6'
  | 'gap-8';

/**
 * Variante de fundo da página
 */
export type PageBackgroundVariant =
  | 'none'
  | 'default'
  | 'subtle'
  | 'gradient'
  | (string & {});

/**
 * Propriedades do componente PageLayout
 */
export interface PageLayoutProps {
  /** Conteúdo da página */
  children: ReactNode;
  /** Espaçamento entre itens */
  spacing?: PageSpacing;
  /** Variante de fundo (ignorada quando 'none') */
  backgroundVariant?: PageBackgroundVariant;
  /** Largura máxima do conteúdo */
  maxWidth?: PageMaxWidth;
  /** Classes Tailwind customizadas para o container externo */
  className?: string;
}

/**
 * Propriedades do componente PageHeader
 */
export interface PageHeaderProps {
  /** Conteúdo do cabeçalho da página */
  children: ReactNode;
  /** Espaçamento entre itens */
  spacing?: PageSpacing;
  /** Classes Tailwind customizadas para o container externo */
  className?: string;
}

/**
 * Propriedades do componente PageBody
 */
export interface PageBodyProps {
  /** Conteúdo da página */
  children: ReactNode;
  /** Espaçamento entre itens */
  spacing?: PageSpacing;
  /** Classes Tailwind customizadas para o container externo */
  className?: string;
  /** Classes Tailwind customizadas para o wrapper interno */
}
