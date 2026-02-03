'use client';

import { useCallback, useMemo, useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';

import { Header } from '@/components/layout/header';
import {
  PageBody,
  PageHeader,
  PageLayout,
} from '@/components/layout/page-layout';
import { SearchBar } from '@/components/layout/search-bar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pagination } from '../../_shared/components/pagination';
import { useItemsPaginated } from '@/hooks/stock/use-items';
import type { ItemExtended, ItemsQuery } from '@/types/stock';

function resolveItemName(item: ItemExtended) {
  const templateName =
    typeof item.attributes?.templateName === 'string'
      ? item.attributes.templateName
      : typeof item.attributes?.template === 'string'
        ? item.attributes.template
        : undefined;
  const parts = [templateName, item.productName, item.variantName].filter(
    Boolean
  ) as string[];

  return parts.length > 0 ? parts.join(' / ') : 'Item sem identificação';
}

function resolveLocation(item: ItemExtended) {
  return item.bin?.address || item.resolvedAddress || '-';
}

function resolveUnit(item: ItemExtended) {
  const attributes = item.attributes || {};
  const unitCandidates = [
    attributes.unitOfMeasure,
    attributes.unit,
    attributes.unidade,
    attributes.uom,
  ];

  return unitCandidates.find(value => typeof value === 'string') as
    | string
    | undefined;
}

function formatAttributeValue(value: unknown) {
  if (value === null || value === undefined) return '-';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function renderAttributes(attributes: Record<string, unknown>) {
  const entries = Object.entries(attributes || {});

  if (entries.length === 0) {
    return <span className="text-muted-foreground">-</span>;
  }

  const visible = entries.slice(0, 3);
  const remaining = entries.length - visible.length;

  return (
    <div className="flex flex-wrap gap-1">
      {visible.map(([key, value]) => (
        <Badge key={key} variant="secondary" className="text-xs">
          {key}: {formatAttributeValue(value)}
        </Badge>
      ))}
      {remaining > 0 && (
        <Badge variant="outline" className="text-xs">
          +{remaining}
        </Badge>
      )}
    </div>
  );
}

export default function StockOverviewListPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');

  const query: ItemsQuery = useMemo(
    () => ({
      page,
      limit,
      search: search || undefined,
      sortBy: 'entryDate',
      sortOrder: 'desc',
    }),
    [page, limit, search]
  );

  const { data, isLoading, error, refetch, isFetching } = useItemsPaginated(
    query
  );

  const items = data?.items ?? [];
  const pagination = data?.pagination;

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <PageLayout>
      <PageHeader>
        <Header
          title="Listagem de Estoque"
          description="Visão consolidada de todos os itens com localização, quantidades e atributos personalizados."
          buttons={[
            {
              id: 'refresh',
              title: 'Atualizar',
              icon: RefreshCw,
              onClick: handleRefresh,
              variant: 'outline',
            },
          ]}
        />
      </PageHeader>

      <PageBody>
        <Card className="border-gray-200/60 dark:border-white/10">
          <CardContent className="p-4 sm:p-6 space-y-4">
            <SearchBar
              value={search}
              placeholder="Buscar por código, produto, variante ou atributos..."
              onSearch={value => {
                setSearch(value);
                setPage(1);
              }}
              onClear={() => {
                setSearch('');
                setPage(1);
              }}
            />

            {isLoading ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                Carregando itens...
              </div>
            ) : error ? (
              <div className="text-sm text-red-500">
                Não foi possível carregar a listagem. Tente novamente.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-xl border border-gray-200/70 dark:border-white/10 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/80 dark:bg-white/5">
                        <TableHead className="w-[160px]">Código</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead className="w-[180px]">Localização</TableHead>
                        <TableHead className="w-[160px]">
                          Quantidade
                        </TableHead>
                        <TableHead>Atributos personalizados</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center">
                            <div className="py-10 text-sm text-muted-foreground">
                              Nenhum item encontrado.
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        items.map(item => {
                          const unit = resolveUnit(item);
                          const quantityLabel = unit
                            ? `${item.currentQuantity} ${unit}`
                            : `${item.currentQuantity}`;

                          return (
                            <TableRow key={item.id}>
                              <TableCell className="font-mono text-sm">
                                {item.fullCode || item.uniqueCode || '-'}
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-medium text-gray-900 dark:text-white">
                                    {resolveItemName(item)}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {item.productCode || item.variantSku || ''}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm text-gray-700 dark:text-gray-200">
                                  {resolveLocation(item)}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="text-sm">
                                    {quantityLabel}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell>
                                {renderAttributes(item.attributes || {})}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>

                {pagination && (
                  <Pagination
                    pagination={pagination}
                    onPageChange={setPage}
                    onLimitChange={value => {
                      setLimit(value);
                      setPage(1);
                    }}
                  />
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {isFetching && !isLoading && (
          <div className="flex items-center justify-center text-xs text-muted-foreground gap-2">
            <Loader2 className="w-3 h-3 animate-spin" />
            Atualizando lista...
          </div>
        )}
      </PageBody>
    </PageLayout>
  );
}
