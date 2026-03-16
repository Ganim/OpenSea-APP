'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

/** Converte qualquer texto para Title Case (primeira letra de cada palavra maiúscula, compatível com acentos) */
function toTitleCase(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export interface BreadcrumbItemData {
  label: string;
  href?: string;
}

interface PageBreadcrumbProps {
  items: BreadcrumbItemData[];
}

export function PageBreadcrumb({ items }: PageBreadcrumbProps) {
  const allItems: BreadcrumbItemData[] = [
    { label: 'Início', href: '/' },
    ...items,
  ];

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;

          if (isLast) {
            return (
              <BreadcrumbItem key={item.href + item.label}>
                <BreadcrumbPage>{toTitleCase(item.label)}</BreadcrumbPage>
              </BreadcrumbItem>
            );
          }

          return (
            <Fragment key={item.href + item.label}>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={item.href ?? '#'}>{toTitleCase(item.label)}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
