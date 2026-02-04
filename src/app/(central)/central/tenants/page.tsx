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
  Plus,
  Search,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const statusVariants: Record<
  string,
  'success' | 'warning' | 'error' | 'default'
> = {
  ACTIVE: 'success',
  INACTIVE: 'warning',
  SUSPENDED: 'error',
};

export default function TenantsListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { data, isLoading } = useAdminTenants(page, 20);

  const filteredTenants =
    data?.tenants.filter(
      t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.slug.toLowerCase().includes(search.toLowerCase())
    ) ?? [];

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

      {/* Search Bar */}
      <div className="max-w-md">
        <GlassInput
          placeholder="Buscar por nome ou slug..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          icon={<Search className="h-4 w-4" />}
        />
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
            {filteredTenants.map(tenant => (
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
            {filteredTenants.length === 0 && (
              <GlassTableRow>
                <GlassTableCell colSpan={5} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <Building2 className="h-12 w-12 central-text-subtle" />
                    <p className="central-text-subtle">
                      Nenhuma empresa encontrada
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
            {data.meta.total} empresas no total
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
