'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, X, Search, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { CardIntegration, IntegrationType } from '@/types/tasks';
import { INTEGRATION_CONFIG } from '@/types/tasks';
import { IntegrationSearchModal } from './integration-search-modal';

import { customersService } from '@/services/sales/customers.service';
import { productsService } from '@/services/stock/products.service';
import { departmentsService } from '@/services/hr/departments.service';
import { calendarEventsService } from '@/services/calendar/calendar-events.service';

interface IntegrationLinkerProps {
  integrations: CardIntegration[];
  onAdd: (type: IntegrationType, entityId: string, entityLabel: string) => void;
  onRemove: (integrationId: string) => void;
}

interface SearchResult {
  id: string;
  label: string;
}

const INTEGRATION_TYPES = Object.keys(INTEGRATION_CONFIG) as IntegrationType[];

async function searchEntities(
  type: IntegrationType,
  search: string
): Promise<SearchResult[]> {
  switch (type) {
    case 'CUSTOMER': {
      const response = await customersService.listCustomers();
      const filtered = search
        ? response.customers.filter(c =>
            c.name.toLowerCase().includes(search.toLowerCase())
          )
        : response.customers;
      return filtered.slice(0, 10).map(c => ({ id: c.id, label: c.name }));
    }
    case 'PRODUCT': {
      const response = await productsService.list({
        search: search || undefined,
        limit: 10,
      });
      return response.products.map(p => ({ id: p.id, label: p.name }));
    }
    case 'DEPARTMENT': {
      const response = await departmentsService.listDepartments({
        search: search || undefined,
        perPage: 10,
      });
      return response.departments.map(d => ({ id: d.id, label: d.name }));
    }
    case 'CALENDAR_EVENT': {
      const now = new Date();
      const startDate = new Date(now.getTime() - 30 * 86400000).toISOString();
      const endDate = new Date(now.getTime() + 90 * 86400000).toISOString();
      const response = await calendarEventsService.list({
        startDate,
        endDate,
        search: search || undefined,
        limit: 10,
      });
      return response.events.map(e => ({ id: e.id, label: e.title }));
    }
    default:
      return [];
  }
}

export function IntegrationLinker({
  integrations,
  onAdd,
  onRemove,
}: IntegrationLinkerProps) {
  const [open, setOpen] = useState(false);
  const [modalType, setModalType] = useState<IntegrationType | null>(null);
  const [typeSearch, setTypeSearch] = useState('');
  const [selectedType, setSelectedType] = useState<IntegrationType | null>(
    null
  );
  const [entitySearch, setEntitySearch] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filteredTypes = INTEGRATION_TYPES.filter(type => {
    const config = INTEGRATION_CONFIG[type];
    return config.label.toLowerCase().includes(typeSearch.toLowerCase());
  });

  // Reset state when popover closes
  useEffect(() => {
    if (!open) {
      setSelectedType(null);
      setTypeSearch('');
      setEntitySearch('');
      setResults([]);
      setIsLoading(false);
    }
  }, [open]);

  // Auto-focus search input when entering search mode
  useEffect(() => {
    if (selectedType) {
      // Small delay so the DOM updates before focusing
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [selectedType]);

  const doSearch = useCallback(async (type: IntegrationType, term: string) => {
    setIsLoading(true);
    try {
      const data = await searchEntities(type, term);
      setResults(data);
    } catch {
      toast.error('Erro ao buscar registros. Tente novamente.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Trigger initial search when type is selected
  useEffect(() => {
    if (selectedType) {
      doSearch(selectedType, '');
    }
  }, [selectedType, doSearch]);

  // Debounced search on entity search term change
  useEffect(() => {
    if (!selectedType) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      doSearch(selectedType, entitySearch);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [entitySearch, selectedType, doSearch]);

  function handleTypeClick(type: IntegrationType) {
    const config = INTEGRATION_CONFIG[type];

    if (config.interaction === 'modal') {
      setOpen(false);
      setTypeSearch('');
      setModalType(type);
      return;
    }

    setSelectedType(type);
    setEntitySearch('');
    setResults([]);
  }

  function handleResultClick(result: SearchResult) {
    if (!selectedType) return;
    onAdd(selectedType, result.id, result.label);
    setOpen(false);
  }

  function handleBack() {
    setSelectedType(null);
    setEntitySearch('');
    setResults([]);
  }

  return (
    <div className="space-y-1.5">
      {/* Existing integrations */}
      {integrations.map(integration => {
        const config = INTEGRATION_CONFIG[integration.type];
        return (
          <div
            key={integration.id}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs group"
            style={{
              backgroundColor: `hsl(${config.color} / 0.08)`,
              border: `1px solid hsl(${config.color} / 0.2)`,
            }}
          >
            <span className="shrink-0">{config.icon}</span>
            <span className="truncate flex-1" title={integration.entityLabel}>
              {integration.entityLabel}
            </span>
            <button
              type="button"
              className="shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity"
              onClick={() => onRemove(integration.id)}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        );
      })}

      {/* Add button */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              'w-full flex items-center justify-center gap-1 rounded-md py-1 text-xs',
              'border border-dashed border-muted-foreground/30 text-muted-foreground',
              'hover:border-primary hover:text-primary transition-colors'
            )}
          >
            <Plus className="h-3 w-3" />
            Vincular
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-2 z-[60]" align="start">
          {selectedType ? (
            /* ── Search view ── */
            <div>
              {/* Header with back button */}
              <div className="flex items-center gap-1.5 mb-2">
                <button
                  type="button"
                  className="shrink-0 p-0.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  onClick={handleBack}
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                </button>
                <span className="text-xs font-medium truncate">
                  Buscar {INTEGRATION_CONFIG[selectedType].label}
                </span>
              </div>

              {/* Search input */}
              <div className="relative mb-2">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  value={entitySearch}
                  onChange={e => setEntitySearch(e.target.value)}
                  placeholder="Digite para buscar..."
                  className="h-7 text-xs pl-7"
                />
              </div>

              {/* Results */}
              <div className="max-h-48 overflow-y-auto space-y-0.5">
                {isLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                ) : results.length > 0 ? (
                  results.map(result => (
                    <button
                      key={result.id}
                      type="button"
                      className="w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-muted transition-colors text-left"
                      onClick={() => handleResultClick(result)}
                    >
                      <span className="shrink-0">
                        {INTEGRATION_CONFIG[selectedType].icon}
                      </span>
                      <span className="truncate">{result.label}</span>
                    </button>
                  ))
                ) : (
                  <p className="text-[10px] text-muted-foreground px-2 py-2 text-center">
                    Nenhum resultado encontrado
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* ── Type list view ── */
            <div>
              <div className="relative mb-2">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={typeSearch}
                  onChange={e => setTypeSearch(e.target.value)}
                  placeholder="Buscar tipo..."
                  className="h-7 text-xs pl-7"
                />
              </div>
              <div className="space-y-0.5 max-h-48 overflow-y-auto">
                {filteredTypes.map(type => {
                  const config = INTEGRATION_CONFIG[type];
                  return (
                    <button
                      key={type}
                      type="button"
                      className="w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-muted transition-colors"
                      onClick={() => handleTypeClick(type)}
                    >
                      <span>{config.icon}</span>
                      <span>{config.label}</span>
                    </button>
                  );
                })}
                {filteredTypes.length === 0 && (
                  <p className="text-[10px] text-muted-foreground px-2 py-2">
                    Nenhum tipo encontrado
                  </p>
                )}
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* Modal-based integration search */}
      {modalType && (
        <IntegrationSearchModal
          open={!!modalType}
          onOpenChange={isOpen => {
            if (!isOpen) setModalType(null);
          }}
          type={modalType}
          onSelect={(entityId, entityLabel) => {
            onAdd(modalType, entityId, entityLabel);
            setModalType(null);
          }}
        />
      )}
    </div>
  );
}
