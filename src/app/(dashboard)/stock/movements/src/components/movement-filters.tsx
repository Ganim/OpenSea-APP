'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { MovementType } from '@/types/stock';
import { X } from 'lucide-react';
import { MOVEMENT_TYPE_OPTIONS } from '../constants';
import type { DateRangeFilter } from '../types/movements.types';

interface MovementFiltersProps {
  movementType: MovementType | 'all';
  dateRange: DateRangeFilter;
  hasFilters: boolean;
  onMovementTypeChange: (value: MovementType | 'all') => void;
  onDateRangeChange: (value: DateRangeFilter) => void;
  onResetFilters: () => void;
}

export function MovementFilters({
  movementType,
  dateRange,
  hasFilters,
  onMovementTypeChange,
  onDateRangeChange,
  onResetFilters,
}: MovementFiltersProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {/* Type Filter */}
          <Select
            value={movementType}
            onValueChange={v => onMovementTypeChange(v as MovementType | 'all')}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              {MOVEMENT_TYPE_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date Range */}
          <Tabs
            value={dateRange}
            onValueChange={v => onDateRangeChange(v as DateRangeFilter)}
          >
            <TabsList>
              <TabsTrigger value="today">Hoje</TabsTrigger>
              <TabsTrigger value="week">7 dias</TabsTrigger>
              <TabsTrigger value="month">30 dias</TabsTrigger>
              <TabsTrigger value="all">Tudo</TabsTrigger>
            </TabsList>
          </Tabs>

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
