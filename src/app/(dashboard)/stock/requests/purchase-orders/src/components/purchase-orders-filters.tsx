import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { PurchaseOrderStatus } from '@/types/stock';
import { Search, X } from 'lucide-react';
import { STATUS_OPTIONS } from '../constants';

interface PurchaseOrdersFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: PurchaseOrderStatus | 'all';
  onStatusChange: (value: PurchaseOrderStatus | 'all') => void;
  supplierId: string;
  onSupplierChange: (value: string) => void;
  suppliers: Array<{ id: string; name: string }>;
  hasFilters: boolean;
  onResetFilters: () => void;
}

export function PurchaseOrdersFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  supplierId,
  onSupplierChange,
  suppliers,
  hasFilters,
  onResetFilters,
}: PurchaseOrdersFiltersProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por número, fornecedor..."
              value={search}
              onChange={e => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <Select
            value={status}
            onValueChange={v =>
              onStatusChange(v as PurchaseOrderStatus | 'all')
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Supplier Filter */}
          <Select
            value={supplierId || 'all'}
            onValueChange={v => onSupplierChange(v === 'all' ? '' : v)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Fornecedor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Fornecedores</SelectItem>
              {suppliers.map(supplier => (
                <SelectItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Reset */}
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              className="shrink-0"
            >
              <X className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
