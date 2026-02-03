/**
 * SearchSection Component
 * Seção de busca e filtros para páginas de estoque
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Filter, Search, X } from 'lucide-react';
import { useCallback, useState } from 'react';

interface SearchSectionProps {
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  filters?: React.ReactNode;
  activeFiltersCount?: number;
}

export function SearchSection({
  searchPlaceholder = 'Buscar...',
  onSearch,
  filters,
  activeFiltersCount = 0,
}: SearchSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      onSearch?.(value);
    },
    [onSearch]
  );

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    onSearch?.('');
  }, [onSearch]);

  return (
    <div className="space-y-4 mb-8">
      {/* Busca */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400 z-10 pointer-events-none" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={e => handleSearchChange(e.target.value)}
            className="pl-12 pr-10 h-12 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200 dark:border-gray-700 rounded-xl"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Botão de Filtros */}
        {filters && (
          <Button
            variant="outline"
            size="default"
            onClick={() => setShowFilters(!showFilters)}
            className="relative h-12 px-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200 dark:border-gray-700 rounded-xl"
          >
            <Filter className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Filtros</span>
            {activeFiltersCount > 0 && (
              <Badge
                variant="default"
                className="ml-2 h-5 min-w-5 flex items-center justify-center rounded-full bg-blue-500 text-white text-xs px-1.5"
              >
                {activeFiltersCount}
              </Badge>
            )}
            {showFilters ? (
              <ChevronUp className="w-4 h-4 ml-2" />
            ) : (
              <ChevronDown className="w-4 h-4 ml-2" />
            )}
          </Button>
        )}
      </div>

      {/* Seção de Filtros Colapsável */}
      <AnimatePresence>
        {showFilters && filters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
              {filters}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
