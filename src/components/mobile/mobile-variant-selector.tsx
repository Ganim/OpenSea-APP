'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useDebounce } from '@/hooks/use-debounce';
import { ColorPatternSwatch } from '@/components/shared/color-pattern-swatch';
import {
  ArrowLeft,
  ChevronDown,
  Check,
  Loader2,
  Search,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// Types
// ============================================

export type VariantPattern =
  | 'SOLID'
  | 'STRIPED'
  | 'PLAID'
  | 'PRINTED'
  | 'GRADIENT'
  | 'JACQUARD'
  | null;

export interface VariantOption {
  id: string;
  name: string;
  productId: string;
  productName: string;
  templateId: string | null;
  templateName: string | null;
  manufacturerName: string | null;
  reference: string | null;
  colorHex: string | null;
  secondaryColorHex: string | null;
  pattern: VariantPattern;
  sku: string | null;
  /** Template · Produto · Variante */
  fullLabel: string;
  /** Fabricante · Referência (subtitle) */
  subtitle: string;
}

interface ApiVariantProductInfo {
  productId: string;
  productName: string;
  templateId: string | null;
  templateName: string | null;
  manufacturerId: string | null;
  manufacturerName: string | null;
}

interface ApiVariantWithProduct {
  id: string;
  name: string;
  productId: string;
  sku?: string;
  reference?: string;
  colorHex?: string;
  secondaryColorHex?: string | null;
  pattern?: string | null;
  product?: ApiVariantProductInfo;
}

interface ListVariantsResponse {
  variants: ApiVariantWithProduct[];
  meta: { total: number; page: number; limit: number; pages: number };
}

// ============================================
// API mapping
// ============================================

function mapApiToVariantOption(v: ApiVariantWithProduct): VariantOption {
  const templateName = v.product?.templateName ?? null;
  const templateId = v.product?.templateId ?? null;
  const productName = v.product?.productName ?? '';
  const manufacturerName = v.product?.manufacturerName ?? null;
  const reference = v.reference || null;

  const fullLabel =
    [templateName, productName, v.name].filter(Boolean).join(' · ') || v.name;

  const subtitle = [manufacturerName, reference ? `Ref: ${reference}` : null]
    .filter(Boolean)
    .join(' · ');

  return {
    id: v.id,
    name: v.name,
    productId: v.productId,
    productName,
    templateId,
    templateName,
    manufacturerName,
    reference,
    colorHex: v.colorHex || null,
    secondaryColorHex: v.secondaryColorHex || null,
    pattern: (v.pattern as VariantPattern) || null,
    sku: v.sku || null,
    fullLabel,
    subtitle,
  };
}

// ============================================
// Hook — server-side debounced search
// ============================================

const SEARCH_LIMIT = 50;

export function useVariantSearch(rawSearch: string, enabled: boolean) {
  const debounced = useDebounce(rawSearch.trim(), 250);

  return useQuery({
    queryKey: ['mobile', 'variant-search', debounced],
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    queryFn: async (): Promise<VariantOption[]> => {
      const params = new URLSearchParams();
      params.set('page', '1');
      params.set('limit', String(SEARCH_LIMIT));
      params.set('includeProduct', 'true');
      params.set('onlyActive', 'true');
      if (debounced) params.set('search', debounced);

      const response = await apiClient.get<ListVariantsResponse>(
        `/v1/variants?${params.toString()}`
      );
      return response.variants.map(mapApiToVariantOption);
    },
  });
}

// ============================================
// Trigger (closed state) — used inline in forms
// ============================================

export interface MobileVariantSelectorTriggerProps {
  value: VariantOption | null;
  onClick: () => void;
  onClear?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function MobileVariantSelectorTrigger({
  value,
  onClick,
  onClear,
  disabled,
  placeholder = 'Selecionar variante...',
}: MobileVariantSelectorTriggerProps) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onClick()}
      disabled={disabled}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors',
        value
          ? 'border-indigo-500/30 bg-indigo-500/5'
          : 'border-slate-700/50 bg-slate-800/60',
        disabled && 'opacity-50'
      )}
    >
      <ColorPatternSwatch
        colorHex={value?.colorHex}
        secondaryColorHex={value?.secondaryColorHex}
        pattern={value?.pattern}
        size="md"
      />
      <div className="min-w-0 flex-1">
        {value ? (
          <>
            <p className="truncate text-sm font-medium text-slate-100">
              {value.fullLabel}
            </p>
            {value.subtitle && (
              <p className="truncate text-[11px] text-slate-500">
                {value.subtitle}
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-slate-400">{placeholder}</p>
        )}
      </div>
      {value && onClear ? (
        <span
          role="button"
          tabIndex={0}
          onClick={e => {
            e.stopPropagation();
            e.preventDefault();
            onClear();
          }}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.stopPropagation();
              e.preventDefault();
              onClear();
            }
          }}
          className="shrink-0 p-1 text-slate-500 active:text-slate-300"
        >
          <X className="h-4 w-4" />
        </span>
      ) : (
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
      )}
    </button>
  );
}

// ============================================
// Search panel — rendered INSIDE the parent
// drawer to avoid portal + focus-trap conflicts
// ============================================

export interface MobileVariantSearchPanelProps {
  value: VariantOption | null;
  onSelect: (option: VariantOption) => void;
  onClose: () => void;
}

export function MobileVariantSearchPanel({
  value,
  onSelect,
  onClose,
}: MobileVariantSearchPanelProps) {
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading, isFetching } = useVariantSearch(search, true);

  const options = useMemo(() => data ?? [], [data]);

  // Auto-focus input when the panel mounts so the user can type
  // immediately. Small timeout gives the drawer time to finish any
  // in-flight animation before we steal focus.
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-950">
      <header
        data-vaul-no-drag
        className="flex h-12 shrink-0 items-center gap-3 border-b border-slate-800 bg-slate-900/95 px-4 backdrop-blur-sm"
      >
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 active:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="flex-1 truncate text-sm font-semibold text-slate-100">
          Selecionar Variante
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-slate-400 active:text-slate-200"
        >
          Fechar
        </button>
      </header>

      <div
        data-vaul-no-drag
        className="border-b border-slate-800 bg-slate-900 px-4 py-3"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome, produto, fabricante..."
            className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2.5 pl-10 pr-4 text-base text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          {(isLoading || isFetching) && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-500" />
          )}
        </div>
        {search.trim() && !isLoading && (
          <p className="mt-1.5 text-[11px] text-slate-600">
            {options.length} resultado{options.length !== 1 ? 's' : ''}
            {options.length === SEARCH_LIMIT
              ? ' · refine a busca para ver mais'
              : ''}
          </p>
        )}
      </div>

      <div
        data-vaul-no-drag
        className="flex-1 min-h-0 overflow-y-auto px-4 py-2"
      >
        {isLoading && options.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
          </div>
        ) : options.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500">
            {search.trim()
              ? 'Nenhuma variante encontrada'
              : 'Digite para buscar uma variante'}
          </div>
        ) : (
          <div className="space-y-1">
            {options.map(opt => {
              const isSelected = value?.id === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    onSelect(opt);
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors active:bg-slate-700/60',
                    isSelected
                      ? 'bg-indigo-500/10 border border-indigo-500/30'
                      : 'bg-slate-800/40'
                  )}
                >
                  <ColorPatternSwatch
                    colorHex={opt.colorHex}
                    secondaryColorHex={opt.secondaryColorHex}
                    pattern={opt.pattern}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-200">
                      {opt.fullLabel}
                    </p>
                    {opt.subtitle && (
                      <p className="truncate text-[11px] text-slate-500">
                        {opt.subtitle}
                      </p>
                    )}
                  </div>
                  {isSelected && (
                    <Check className="h-4 w-4 shrink-0 text-indigo-400" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
