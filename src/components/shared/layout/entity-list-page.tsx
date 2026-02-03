/**
 * @deprecated Use os componentes PageLayout, PageHeader, PageActionBar e Header
 * de '@/components/layout' no lugar. Este componente será removido em versão futura.
 * Referência: stock/templates/page.tsx
 */
'use client';

import {
  PageHeader,
  PageHeaderConfig,
} from '@/components/shared/layout/page-header';
import { ReactNode } from 'react';

export interface EntityListPageConfig<T> {
  // Cabe\u00e7alho
  title: string;
  description?: string;
  entityName: string; // "Template", "Produto", etc.
  entityNamePlural: string; // "Templates", "Produtos", etc.

  // URLs
  newItemUrl?: string;
  backUrl?: string;

  // Header actions
  pageHeaderConfig?: Partial<PageHeaderConfig>;

  // Conte\u00fado
  children: ReactNode;
}

interface EntityListPageProps<T> {
  config: EntityListPageConfig<T>;
}

/**
 * Template completo de p\u00e1gina de listagem de entidades
 * Fornece estrutura padronizada com PageHeader e conte\u00fado
 * Facilita a cria\u00e7\u00e3o de novas p\u00e1ginas de listagem
 */
export function EntityListPage<T>({ config }: EntityListPageProps<T>) {
  const { title, description, children, pageHeaderConfig } = config;

  const finalPageHeaderConfig: PageHeaderConfig = {
    title,
    description,
    ...pageHeaderConfig,
  };

  return (
    <div className="flex-col flex gap-4">
      <PageHeader config={finalPageHeaderConfig} />
      {children}
    </div>
  );
}
