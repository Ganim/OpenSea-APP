'use client';

/**
 * OpenSea OS - /hr/crachas queries
 *
 * Re-exports the hook-shaped query helpers from `@/hooks/hr/use-crachas`
 * so route-level code has a single import surface (mirror pattern of other
 * HR entity routes).
 */

export {
  useBadgesInfinite,
  CRACHAS_QUERY_KEY,
  type UseBadgesInfiniteParams,
} from '@/hooks/hr/use-crachas';
