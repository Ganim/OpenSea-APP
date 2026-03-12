'use client';

import { GlassBadge } from '@/components/central/glass-badge';
import { GlassButton } from '@/components/central/glass-button';
import { GlassInput } from '@/components/central/glass-input';
import {
  GlassTable,
  GlassTableBody,
  GlassTableCell,
  GlassTableHead,
  GlassTableHeader,
  GlassTableRow,
} from '@/components/central/glass-table';
import { useAdminTenants } from '@/hooks/admin/use-admin';
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Plus,
  Search,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

const statusVariants: Record<
  string,
  'success' | 'warning' | 'error' | 'default'
> = {
  ACTIVE: 'success',
  INACTIVE: 'warning',
  SUSPENDED: 'error',
};

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: 'ACTIVE', label: 'Ativas' },
  { value: 'INACTIVE', label: 'Inativas' },
  { value: 'SUSPENDED', label: 'Suspensas' },
];

export default function TenantsListPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(null);

  // Debounce search input
  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1); // Reset to first page on search
    }, 300);
  }, []);

  // Reset page on status filter change
  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const { data, isLoading } = useAdminTenants(
    page,
    20,
    debouncedSearch || undefined,
    statusFilter || undefined
  );

  const tenants = data?.tenants ?? [];

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight central-text">
            Empresas
          </h1>
          <p className="central-text-muted text-lg mt-1">
            Gerencie todas as empresas do sistema
          </p>
        </div>
        <Link href="/central/tenants/new">
          <GlassButton variant="primary" className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Empresa
          </GlassButton>
        </Link>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 max-w-md">
          <GlassInput
            placeholder="Buscar por nome ou slug..."
            value={searchInput}
            onChange={e => handleSearchChange(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 central-text-muted" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-lg central-glass-strong border border-[rgb(var(--central-border)/0.15)] central-text text-sm outline-none focus:ring-2 focus:ring-[rgb(var(--os-blue-500)/0.3)] transition-all appearance-none cursor-pointer bg-transparent"
          >
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {(debouncedSearch || statusFilter) && (
            <GlassButton
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchInput('');
                setDebouncedSearch('');
                setStatusFilter('');
                setPage(1);
              }}
              className="gap-1"
            >
              <X className="h-3 w-3" />
              Limpar
            </GlassButton>
          )}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div
              key={i}
              className="h-16 rounded-xl central-glass-subtle animate-pulse"
            />
          ))}
        </div>
      ) : (
        <GlassTable>
          <GlassTableHeader>
            <GlassTableRow>
              <GlassTableHead>Empresa</GlassTableHead>
              <GlassTableHead>Slug</GlassTableHead>
              <GlassTableHead>Status</GlassTableHead>
              <GlassTableHead>Criado em</GlassTableHead>
              <GlassTableHead className="w-[80px]">Ações</GlassTableHead>
            </GlassTableRow>
          </GlassTableHeader>
          <GlassTableBody>
            {tenants.map(tenant => (
              <GlassTableRow key={tenant.id}>
                <GlassTableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl central-accent-blue central-accent-gradient border border-[rgb(var(--os-blue-500)/0.3)]">
                      <Building2 className="h-5 w-5 central-accent-text" />
                    </div>
                    <span className="font-medium central-text">
                      {tenant.name}
                    </span>
                  </div>
                </GlassTableCell>
                <GlassTableCell>
                  <span className="central-text-muted font-mono text-sm">
                    {tenant.slug}
                  </span>
                </GlassTableCell>
                <GlassTableCell>
                  <GlassBadge
                    variant={statusVariants[tenant.status] ?? 'default'}
                  >
                    {tenant.status}
                  </GlassBadge>
                </GlassTableCell>
                <GlassTableCell>
                  <span className="central-text-muted">
                    {new Date(tenant.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </GlassTableCell>
                <GlassTableCell>
                  <Link href={`/central/tenants/${tenant.id}`}>
                    <GlassButton variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </GlassButton>
                  </Link>
                </GlassTableCell>
              </GlassTableRow>
            ))}
            {tenants.length === 0 && (
              <GlassTableRow>
                <GlassTableCell colSpan={5} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <Building2 className="h-12 w-12 central-text-subtle" />
                    <p className="central-text-subtle">
                      {debouncedSearch || statusFilter
                        ? 'Nenhuma empresa encontrada com os filtros aplicados'
                        : 'Nenhuma empresa encontrada'}
                    </p>
                  </div>
                </GlassTableCell>
              </GlassTableRow>
            )}
          </GlassTableBody>
        </GlassTable>
      )}

      {/* Pagination */}
      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm central-text-muted">
            {data.meta.total} empresas no total • Página {page} de{' '}
            {data.meta.totalPages}
          </p>
          <div className="flex gap-2">
            <GlassButton
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </GlassButton>
            <GlassButton
              variant="secondary"
              size="sm"
              disabled={page >= data.meta.totalPages}
              onClick={() => setPage(p => p + 1)}
              className="gap-2"
            >
              Próximo
              <ChevronRight className="h-4 w-4" />
            </GlassButton>
          </div>
        </div>
      )}
    </div>
  );
}
