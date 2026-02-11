/**
 * Filters Bar Component
 * Barra de filtros para logs de auditoria
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, Search, X } from 'lucide-react';
import { useState } from 'react';
import type {
  AuditAction,
  AuditEntity,
  AuditModule,
  AuditLogFilters,
} from '../types';
import { ACTION_LABELS, ENTITY_LABELS, MODULE_LABELS } from '../constants';

interface FiltersBarProps {
  filters: AuditLogFilters;
  onFiltersChange: (filters: AuditLogFilters) => void;
  onClearFilters: () => void;
}

export const FiltersBar: React.FC<FiltersBarProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFilterChange = (
    key: keyof AuditLogFilters,
    value: string | undefined
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const hasActiveFilters = Object.values(filters).some(
    value => value !== undefined && value !== ''
  );

  return (
    <Card className="p-4 bg-white/50 dark:bg-white/5 border-gray-200/50 dark:border-white/10">
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
            <Input
              type="text"
              placeholder="Buscar nos logs..."
              value={(filters as { search?: string }).search || ''}
              onChange={e =>
                handleFilterChange(
                  'search' as keyof AuditLogFilters,
                  e.target.value
                )
              }
              className="pl-10"
            />
          </div>
          <Button
            variant={showAdvanced ? 'default' : 'outline'}
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Filtros
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" onClick={onClearFilters} className="gap-2">
              <X className="w-4 h-4" />
              Limpar
            </Button>
          )}
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-gray-200/50 dark:border-white/10">
            {/* Module */}
            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Módulo
              </label>
              <Select
                value={filters.module || 'all'}
                onValueChange={value =>
                  handleFilterChange(
                    'module',
                    value === 'all' ? undefined : value
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os módulos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os módulos</SelectItem>
                  {Object.entries(MODULE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Entity */}
            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Entidade
              </label>
              <Select
                value={filters.entity || 'all'}
                onValueChange={value =>
                  handleFilterChange(
                    'entity',
                    value === 'all' ? undefined : value
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as entidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as entidades</SelectItem>
                  {Object.entries(ENTITY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Action */}
            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Ação
              </label>
              <Select
                value={filters.action || 'all'}
                onValueChange={value =>
                  handleFilterChange(
                    'action',
                    value === 'all' ? undefined : value
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as ações" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as ações</SelectItem>
                  {Object.entries(ACTION_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Entity ID */}
            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                ID da Entidade
              </label>
              <Input
                type="text"
                placeholder="ID específico..."
                value={filters.entityId || ''}
                onChange={e => handleFilterChange('entityId', e.target.value)}
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Data Inicial
              </label>
              <Input
                type="datetime-local"
                value={filters.startDate || ''}
                onChange={e => handleFilterChange('startDate', e.target.value)}
              />
            </div>

            {/* End Date */}
            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Data Final
              </label>
              <Input
                type="datetime-local"
                value={filters.endDate || ''}
                onChange={e => handleFilterChange('endDate', e.target.value)}
              />
            </div>

            {/* User ID */}
            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                ID do Usuário
              </label>
              <Input
                type="text"
                placeholder="ID do usuário..."
                value={filters.userId || ''}
                onChange={e => handleFilterChange('userId', e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
