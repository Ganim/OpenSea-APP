'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Columns3,
  Factory,
  Loader2,
  Palette,
  Printer,
  RefreshCw,
  Slash,
  X,
} from 'lucide-react';

import { Header } from '@/components/layout/header';
import {
  PageBody,
  PageHeader,
  PageLayout,
} from '@/components/layout/page-layout';
import { SearchBar } from '@/components/layout/search-bar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FilterDropdown } from '@/components/ui/filter-dropdown';
import type { FilterOption } from '@/components/ui/filter-dropdown';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pagination } from '../../_shared/components/pagination';
import { useItems } from '@/hooks/stock/use-items';
import { useManufacturers, useTemplates } from '@/hooks/stock';
import {
  formatQuantity,
  formatUnitOfMeasure,
  getUnitAbbreviation,
} from '@/helpers/formatters';
import type { Item } from '@/types/stock';
import type { Template, TemplateAttribute } from '@/types/stock';
import { cn } from '@/lib/utils';

// IDs for optional fixed columns
const COL_FABRICANTE = '_fabricante';
const COL_LOCALIZACAO = '_localizacao';
const COL_QUANTIDADE = '_quantidade';

const OPTIONAL_FIXED_COLUMNS: FilterOption[] = [
  { id: COL_FABRICANTE, label: 'Fabricante' },
  { id: COL_LOCALIZACAO, label: 'Localização' },
  { id: COL_QUANTIDADE, label: 'Quantidade' },
];

const DEFAULT_OPTIONAL_FIXED = [
  COL_FABRICANTE,
  COL_LOCALIZACAO,
  COL_QUANTIDADE,
];

function resolveItemName(item: Item) {
  const parts = [item.templateName, item.productName, item.variantName].filter(
    Boolean
  ) as string[];
  const name = parts.length > 0 ? parts.join(' ') : 'Item sem identificação';
  const sku = item.variantSku;
  return sku ? `${name} - ${sku}` : name;
}

function formatAttributeValue(value: unknown): string {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

interface DynamicColumn {
  id: string;
  label: string;
  level: 'product' | 'variant' | 'item';
  key: string;
}

function buildDynamicColumns(
  items: Item[],
  templates: Template[]
): DynamicColumn[] {
  const templateIds = new Set(
    items.map(i => i.templateId).filter(Boolean) as string[]
  );
  const columns: DynamicColumn[] = [];
  const seen = new Set<string>();

  for (const template of templates) {
    if (!templateIds.has(template.id)) continue;
    const levels: Array<{
      level: 'product' | 'variant' | 'item';
      attrs?: Record<string, TemplateAttribute>;
    }> = [
      { level: 'product', attrs: template.productAttributes },
      { level: 'variant', attrs: template.variantAttributes },
      { level: 'item', attrs: template.itemAttributes },
    ];
    for (const { level, attrs } of levels) {
      if (!attrs) continue;
      for (const [key, def] of Object.entries(attrs)) {
        const colId = `${level}:${key}`;
        if (seen.has(colId)) continue;
        seen.add(colId);
        columns.push({ id: colId, label: def.label || key, level, key });
      }
    }
  }
  return columns;
}

function getDefaultVisibleColumns(
  items: Item[],
  templates: Template[]
): string[] {
  const templateIds = new Set(
    items.map(i => i.templateId).filter(Boolean) as string[]
  );
  const visible = [...DEFAULT_OPTIONAL_FIXED];
  const seen = new Set<string>();

  for (const template of templates) {
    if (!templateIds.has(template.id)) continue;
    const levels: Array<{
      level: string;
      attrs?: Record<string, TemplateAttribute>;
    }> = [
      { level: 'product', attrs: template.productAttributes },
      { level: 'variant', attrs: template.variantAttributes },
      { level: 'item', attrs: template.itemAttributes },
    ];
    for (const { level, attrs } of levels) {
      if (!attrs) continue;
      for (const [key, def] of Object.entries(attrs)) {
        const colId = `${level}:${key}`;
        if (seen.has(colId)) continue;
        seen.add(colId);
        if (def.enableView) visible.push(colId);
      }
    }
  }
  return visible;
}

function getDynamicValue(item: Item, col: DynamicColumn): string {
  let value: unknown;
  if (col.level === 'product') value = item.productAttributes?.[col.key];
  else if (col.level === 'variant') value = item.variantAttributes?.[col.key];
  else value = item.attributes?.[col.key];
  return formatAttributeValue(value);
}

/** Group items by unit of measure key (raw value or '_none'). */
function groupByUnit(items: Item[]): Map<string, Item[]> {
  const groups = new Map<string, Item[]>();
  for (const item of items) {
    const key = item.templateUnitOfMeasure || '_none';
    const list = groups.get(key);
    if (list) list.push(item);
    else groups.set(key, [item]);
  }
  return groups;
}

/** Build an HTML table for a group of items sharing the same unit. */
function buildGroupTable(groupItems: Item[], unitKey: string): string {
  const abbr = unitKey === '_none' ? '' : getUnitAbbreviation(unitKey);
  const unitLabel = abbr || (unitKey === '_none' ? '' : unitKey);

  const rows = groupItems
    .map(item => {
      const name = [item.templateName, item.productName, item.variantName]
        .filter(Boolean)
        .join(' ');
      const sku = item.variantSku ? ` - ${item.variantSku}` : '';
      const code = item.fullCode || item.uniqueCode || '';
      const loc =
        item.bin?.address ||
        item.resolvedAddress ||
        item.lastKnownAddress ||
        '';
      const qty = item.currentQuantity;
      const manufacturer = item.manufacturerName || '';
      return `<tr>
        <td>${name}${sku}</td>
        <td style="font-family:monospace;font-size:11px">${code}</td>
        <td>${manufacturer}</td>
        <td>${loc}</td>
        <td style="text-align:right">${qty}${unitLabel ? ` ${unitLabel}` : ''}</td>
      </tr>`;
    })
    .join('');

  const total =
    Math.round(groupItems.reduce((s, i) => s + i.currentQuantity, 0) * 1000) /
    1000;

  return `<table>
  <thead><tr><th>Item</th><th>Código</th><th>Fabricante</th><th>Localização</th><th style="text-align:right">Quantidade</th></tr></thead>
  <tbody>${rows}</tbody>
  <tfoot><tr><td colspan="4">Total</td><td style="text-align:right">${total}${unitLabel ? ` ${unitLabel}` : ''}</td></tr></tfoot>
</table>`;
}

/** Opens a print window with items grouped by unit of measure. */
function printItems(itemsToPrint: Item[]) {
  const groups = groupByUnit(itemsToPrint);

  let tables: string;

  if (groups.size <= 1) {
    // Single unit (or no items) — one table, no subtitle
    const [unitKey, groupItems] = [...groups.entries()][0] ?? ['_none', []];
    tables = buildGroupTable(groupItems, unitKey);
  } else {
    // Multiple units — one table per unit with a subtitle
    tables = [...groups.entries()]
      .map(([unitKey, groupItems]) => {
        const abbr = unitKey === '_none' ? '' : getUnitAbbreviation(unitKey);
        const label = abbr || unitKey;
        const subtitle = label
          ? `<h2 style="font-size:15px;margin:24px 0 8px">${formatUnitOfMeasure(unitKey)} — ${groupItems.length} ite${groupItems.length === 1 ? 'm' : 'ns'}</h2>`
          : `<h2 style="font-size:15px;margin:24px 0 8px">Sem unidade — ${groupItems.length} ite${groupItems.length === 1 ? 'm' : 'ns'}</h2>`;
        return subtitle + buildGroupTable(groupItems, unitKey);
      })
      .join('');
  }

  const html = `<!DOCTYPE html>
<html><head><title>Listagem de Estoque</title>
<style>
  body{font-family:system-ui,sans-serif;padding:24px;font-size:13px}
  h1{font-size:18px;margin-bottom:4px}
  h2{page-break-before:auto}
  .meta{color:#666;margin-bottom:16px;font-size:12px}
  table{width:100%;border-collapse:collapse;margin-bottom:8px}
  th,td{border:1px solid #ddd;padding:6px 10px;text-align:left}
  th{background:#f5f5f5;font-weight:600}
  tfoot td{font-weight:600;background:#f9f9f9}
</style>
</head><body>
<h1>Listagem de Estoque</h1>
<p class="meta">${itemsToPrint.length} ite${itemsToPrint.length === 1 ? 'm' : 'ns'} &bull; Impresso em ${new Date().toLocaleString('pt-BR')}</p>
${tables}
<script>window.onload=function(){window.print()}<\/script>
</body></html>`;

  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}

export default function StockOverviewListPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [visibleColumns, setVisibleColumns] = useState<string[] | null>(null);
  const [selectedManufacturers, setSelectedManufacturers] = useState<string[]>(
    []
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data, isLoading, error, refetch, isFetching } = useItems();

  const { data: templates = [] } = useTemplates();
  const { data: manufacturersData } = useManufacturers();

  const allItems: Item[] = data?.items ?? [];

  const manufacturerOptions: FilterOption[] = useMemo(
    () =>
      (manufacturersData?.manufacturers ?? []).map(m => ({
        id: m.name,
        label: m.name,
      })),
    [manufacturersData]
  );

  // Client-side search filtering
  const searchedItems = useMemo(() => {
    if (!search.trim()) return allItems;
    const s = search.toLowerCase().trim();
    return allItems.filter(item => {
      const name = resolveItemName(item).toLowerCase();
      const code = (item.fullCode || item.uniqueCode || '').toLowerCase();
      const manufacturer = (item.manufacturerName || '').toLowerCase();
      const location = (
        item.bin?.address ||
        item.resolvedAddress ||
        item.lastKnownAddress ||
        ''
      ).toLowerCase();
      const batch = (item.batchNumber || '').toLowerCase();
      return (
        name.includes(s) ||
        code.includes(s) ||
        manufacturer.includes(s) ||
        location.includes(s) ||
        batch.includes(s)
      );
    });
  }, [allItems, search]);

  // Client-side manufacturer filtering
  const filteredItems = useMemo(
    () =>
      selectedManufacturers.length === 0
        ? searchedItems
        : searchedItems.filter(item =>
            item.manufacturerName
              ? selectedManufacturers.includes(item.manufacturerName)
              : false
          ),
    [searchedItems, selectedManufacturers]
  );

  // Client-side pagination
  const totalFiltered = filteredItems.length;
  const totalPages = Math.ceil(totalFiltered / limit) || 1;

  const items = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredItems.slice(start, start + limit);
  }, [filteredItems, page, limit]);

  const pagination = useMemo(
    () => ({
      total: totalFiltered,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    }),
    [totalFiltered, page, limit, totalPages]
  );

  const dynamicColumns = useMemo(
    () => buildDynamicColumns(filteredItems, templates),
    [filteredItems, templates]
  );

  const defaultVisible = useMemo(
    () => getDefaultVisibleColumns(filteredItems, templates),
    [filteredItems, templates]
  );

  const activeColumns = visibleColumns ?? defaultVisible;

  const columnOptions: FilterOption[] = useMemo(
    () => [
      ...OPTIONAL_FIXED_COLUMNS,
      ...dynamicColumns.map(c => ({ id: c.id, label: c.label })),
    ],
    [dynamicColumns]
  );

  const activeDynamicColumns = useMemo(
    () => dynamicColumns.filter(c => activeColumns.includes(c.id)),
    [dynamicColumns, activeColumns]
  );

  const showFabricante = activeColumns.includes(COL_FABRICANTE);
  const showLocalizacao = activeColumns.includes(COL_LOCALIZACAO);
  const showQuantidade = activeColumns.includes(COL_QUANTIDADE);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // --- Selection ---
  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleRowClick = useCallback(
    (item: Item) => {
      // Delay single-click to distinguish from double-click
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      clickTimerRef.current = setTimeout(() => {
        toggleSelection(item.id);
      }, 200);
    },
    [toggleSelection]
  );

  const handleRowDoubleClick = useCallback(
    (item: Item) => {
      // Cancel the pending single-click
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
        clickTimerRef.current = null;
      }
      if (item.productId) {
        router.push(`/stock/products/${item.productId}`);
      }
    },
    [router]
  );

  // --- Selection summary (search across all items, not just current page) ---
  const selectedItems = useMemo(
    () => allItems.filter(i => selectedIds.has(i.id)),
    [allItems, selectedIds]
  );

  const selectionSummary = useMemo(() => {
    if (selectedItems.length === 0) return null;
    const total = selectedItems.reduce((s, i) => s + i.currentQuantity, 0);
    const rounded = Math.round(total * 1000) / 1000;
    // Try to find common unit among selected items
    const units = new Set(
      selectedItems
        .map(i => i.templateUnitOfMeasure)
        .filter(Boolean) as string[]
    );
    const unitAbbr = units.size === 1 ? getUnitAbbreviation([...units][0]) : '';
    return {
      count: selectedItems.length,
      total: rounded,
      unitAbbr,
    };
  }, [selectedItems]);

  const totalCols =
    2 +
    (showFabricante ? 1 : 0) +
    (showLocalizacao ? 1 : 0) +
    (showQuantidade ? 1 : 0) +
    activeDynamicColumns.length;

  return (
    <PageLayout>
      <PageHeader>
        <Header
          title="Listagem de Estoque"
          description="Visão consolidada de todos os itens com localização, quantidades e atributos personalizados."
          buttons={[
            {
              id: 'print-all',
              title: 'Imprimir',
              icon: Printer,
              onClick: () => printItems(filteredItems),
              variant: 'outline',
            },
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

            <div className="flex items-center justify-between">
              <FilterDropdown
                label="Fabricante"
                icon={Factory}
                options={manufacturerOptions}
                selected={selectedManufacturers}
                onSelectionChange={value => {
                  setSelectedManufacturers(value);
                  setPage(1);
                }}
                activeColor="violet"
                searchPlaceholder="Buscar fabricante..."
                emptyText="Nenhum fabricante encontrado."
              />
              <FilterDropdown
                label="Colunas"
                icon={Columns3}
                options={columnOptions}
                selected={activeColumns}
                onSelectionChange={setVisibleColumns}
                activeColor="blue"
                searchPlaceholder="Buscar coluna..."
              />
            </div>

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
                        <TableHead className="w-14">Cor</TableHead>
                        <TableHead>Item</TableHead>
                        {showFabricante && (
                          <TableHead className="w-[180px]">
                            Fabricante
                          </TableHead>
                        )}
                        {showLocalizacao && (
                          <TableHead className="w-[180px]">
                            Localização
                          </TableHead>
                        )}
                        {showQuantidade && (
                          <TableHead className="w-40">Quantidade</TableHead>
                        )}
                        {activeDynamicColumns.map(col => (
                          <TableHead key={col.id}>{col.label}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={totalCols}
                            className="text-center"
                          >
                            <div className="py-10 text-sm text-muted-foreground">
                              Nenhum item encontrado.
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        items.map(item => {
                          const unitAbbr = getUnitAbbreviation(
                            item.templateUnitOfMeasure
                          );
                          const qtyLabel = unitAbbr
                            ? `${formatQuantity(item.currentQuantity)} ${unitAbbr}`
                            : formatQuantity(item.currentQuantity);

                          const hasBin =
                            item.bin?.zone?.id && item.bin?.zone?.warehouseId;

                          const isSelected = selectedIds.has(item.id);

                          return (
                            <TableRow
                              key={item.id}
                              className={cn(
                                'cursor-pointer transition-colors',
                                isSelected &&
                                  'bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/15',
                                !isSelected &&
                                  'hover:bg-gray-50 dark:hover:bg-white/5'
                              )}
                              onClick={() => handleRowClick(item)}
                              onDoubleClick={() => handleRowDoubleClick(item)}
                            >
                              {/* Cor */}
                              <TableCell>
                                {item.variantColorHex ? (
                                  <div
                                    className="h-8 w-12 rounded border border-gray-200 dark:border-slate-700"
                                    style={{
                                      backgroundColor: item.variantColorHex,
                                    }}
                                    title={item.variantColorHex}
                                  />
                                ) : (
                                  <div
                                    className="flex items-center gap-1 text-muted-foreground h-8 w-12 justify-center"
                                    title="Cor não definida"
                                  >
                                    <Palette className="h-4 w-4" />
                                    <Slash className="h-3 w-3" />
                                  </div>
                                )}
                              </TableCell>

                              {/* Item */}
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-medium text-gray-900 dark:text-white">
                                    {resolveItemName(item)}
                                  </span>
                                  <span className="text-xs font-mono text-muted-foreground">
                                    {item.fullCode || item.uniqueCode || ''}
                                  </span>
                                </div>
                              </TableCell>

                              {/* Fabricante */}
                              {showFabricante && (
                                <TableCell>
                                  <span className="text-sm text-gray-700 dark:text-gray-200">
                                    {item.manufacturerName || '-'}
                                  </span>
                                </TableCell>
                              )}

                              {/* Localização */}
                              {showLocalizacao && (
                                <TableCell>
                                  {hasBin ? (
                                    <Link
                                      href={`/stock/locations/${item.bin!.zone!.warehouseId}/zones/${item.bin!.zone!.id}?highlight=${item.bin!.id}`}
                                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                      onClick={e => e.stopPropagation()}
                                    >
                                      {item.bin!.address ||
                                        item.resolvedAddress ||
                                        '-'}
                                    </Link>
                                  ) : (
                                    <span className="text-sm text-gray-700 dark:text-gray-200">
                                      {item.resolvedAddress ||
                                        item.lastKnownAddress ||
                                        '-'}
                                    </span>
                                  )}
                                </TableCell>
                              )}

                              {/* Quantidade */}
                              {showQuantidade && (
                                <TableCell>
                                  <Badge
                                    variant="secondary"
                                    className="text-sm"
                                  >
                                    {qtyLabel}
                                  </Badge>
                                </TableCell>
                              )}

                              {/* Colunas dinâmicas */}
                              {activeDynamicColumns.map(col => (
                                <TableCell key={col.id} className="text-sm">
                                  {getDynamicValue(item, col)}
                                </TableCell>
                              ))}
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>

                <Pagination
                  pagination={pagination}
                  onPageChange={setPage}
                  onLimitChange={value => {
                    setLimit(value);
                    setPage(1);
                  }}
                />
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

        {/* Floating selection bar */}
        {selectionSummary && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <div className="flex items-center gap-4 px-5 py-3 rounded-xl border border-blue-200 dark:border-blue-500/30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-lg">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {selectionSummary.count}{' '}
                {selectionSummary.count === 1 ? 'item' : 'itens'}
              </span>
              <span className="text-sm text-muted-foreground">
                Total:{' '}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {selectionSummary.total.toLocaleString('pt-BR', {
                    maximumFractionDigits: 3,
                  })}
                  {selectionSummary.unitAbbr
                    ? ` ${selectionSummary.unitAbbr}`
                    : ''}
                </span>
              </span>
              <div className="w-px h-5 bg-gray-200 dark:bg-gray-700" />
              <Button
                size="sm"
                variant="default"
                className="gap-1.5"
                onClick={() => printItems(selectedItems)}
              >
                <Printer className="w-3.5 h-3.5" />
                Imprimir seleção
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="gap-1 text-muted-foreground"
                onClick={clearSelection}
              >
                <X className="w-3.5 h-3.5" />
                Limpar
              </Button>
            </div>
          </div>
        )}
      </PageBody>
    </PageLayout>
  );
}
