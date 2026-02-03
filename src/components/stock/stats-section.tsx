/**
 * Stats Section Component
 * Seção de estatísticas expansível com cards
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, TrendingDown, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface StatCard {
  label: string;
  value: string | number;
  trend?: number;
  icon?: React.ReactNode;
}

interface StatsSectionProps {
  stats: StatCard[];
  defaultExpanded?: boolean;
}

export function StatsSection({
  stats,
  defaultExpanded = false,
}: StatsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="mb-8">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 mb-4 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <h2 className="text-lg font-semibold">Estatísticas</h2>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-6 backdrop-blur-xl bg-white/50 dark:bg-white/5 border-gray-200/50 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-200">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {stat.label}
                      </span>
                      {stat.icon && (
                        <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                          {stat.icon}
                        </div>
                      )}
                    </div>
                    <div className="flex items-end justify-between">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">
                        {stat.value}
                      </span>
                      {stat.trend !== undefined && (
                        <Badge
                          variant={stat.trend >= 0 ? 'default' : 'destructive'}
                          className={`${
                            stat.trend >= 0
                              ? 'bg-green-500 text-white'
                              : 'bg-red-500 text-white'
                          }`}
                        >
                          {stat.trend >= 0 ? (
                            <TrendingUp className="w-3 h-3 mr-1" />
                          ) : (
                            <TrendingDown className="w-3 h-3 mr-1" />
                          )}
                          {Math.abs(stat.trend)}%
                        </Badge>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
