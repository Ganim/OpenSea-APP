/**
 * OpenSea OS - /hr/crachas route API
 *
 * Route-collocated thin wrapper that re-exports the `crachasService.list`
 * fetcher under an intention-revealing name. Keeping this here (instead of
 * calling `crachasService.list` directly from the page) matches the pattern
 * used by `employees.api.ts` and other HR entity routes, and keeps the page
 * free of cross-module service imports.
 *
 * Backend contract (plan 05-04):
 *   GET /v1/hr/crachas?departmentId=&rotationStatus=&search=&page=&pageSize=
 *     → 200 { items: BadgeListRow[], total, page, pageSize, pages }
 *
 * `rotationStatus` is one of 'active' | 'recent' | 'never' and is derived
 * server-side from `qrTokenSetAt` age — never re-derive on the client.
 */

import { crachasService } from '@/services/hr/crachas.service';
import type { ListCrachasParams, ListCrachasResponse } from '@/types/hr';

export const crachasApi = {
  async list(params: ListCrachasParams): Promise<ListCrachasResponse> {
    return crachasService.list(params);
  },
};

export type { ListCrachasParams, ListCrachasResponse };
