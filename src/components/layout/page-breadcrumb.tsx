'use client';

import { Fragment, useState } from 'react';
import Link from 'next/link';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';

/** Converte qualquer texto para Title Case (primeira letra de cada palavra maiúscula, compatível com acentos) */
/**
 * Converts text to title case while preserving:
 * - All-caps words (acronyms like EPI, RH, CIPA)
 * - Portuguese prepositions/articles in lowercase (de, do, da, dos, das, e, ou, a, o, as, os, em, no, na, nos, nas, por, para, com)
 */
function toTitleCase(text: string): string {
  const lowerCaseWords = new Set([
    'de',
    'do',
    'da',
    'dos',
    'das',
    'e',
    'ou',
    'a',
    'o',
    'as',
    'os',
    'em',
    'no',
    'na',
    'nos',
    'nas',
    'por',
    'para',
    'com',
  ]);

  return text
    .split(' ')
    .map((word, index) => {
      // Preserve all-caps words (acronyms like EPI, RH, CIPA)
      if (
        word.length >= 2 &&
        word === word.toUpperCase() &&
        /^[A-ZÀ-Ú]+$/.test(word)
      ) {
        return word;
      }
      // Keep Portuguese prepositions/articles lowercase (except if first word)
      if (index > 0 && lowerCaseWords.has(word.toLowerCase())) {
        return word.toLowerCase();
      }
      // Title case the word
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
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
  const isMobile = useIsMobile();
  const allItems: BreadcrumbItemData[] = [
    { label: 'Início', href: '/' },
    ...items,
  ];

  if (isMobile) {
    return <MobileBreadcrumb items={allItems} />;
  }

  return <DesktopBreadcrumb items={allItems} />;
}

function DesktopBreadcrumb({ items }: { items: BreadcrumbItemData[] }) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

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

function MobileBreadcrumb({ items }: { items: BreadcrumbItemData[] }) {
  const [open, setOpen] = useState(false);
  const currentPage = items[items.length - 1];

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
        >
          <span className="text-muted-foreground">...</span>
          <ChevronRightIcon className="size-3.5" />
          <span className="text-foreground font-semibold">
            {toTitleCase(currentPage.label)}
          </span>
        </button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Navegação</DrawerTitle>
          <DrawerDescription>Caminho até a página atual</DrawerDescription>
        </DrawerHeader>
        <nav className="flex flex-col gap-1 px-4 pb-6">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <div key={item.href + item.label} className="flex flex-col">
                {isLast ? (
                  <span
                    className="text-foreground bg-accent rounded-md px-3 py-2.5 text-sm font-semibold"
                    style={{ paddingLeft: `${index * 16 + 12}px` }}
                  >
                    {toTitleCase(item.label)}
                  </span>
                ) : (
                  <DrawerClose asChild>
                    <Link
                      href={item.href ?? '#'}
                      className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-md px-3 py-2.5 text-sm transition-colors"
                      style={{ paddingLeft: `${index * 16 + 12}px` }}
                      onClick={() => setOpen(false)}
                    >
                      {toTitleCase(item.label)}
                    </Link>
                  </DrawerClose>
                )}
              </div>
            );
          })}
        </nav>
      </DrawerContent>
    </Drawer>
  );
}
