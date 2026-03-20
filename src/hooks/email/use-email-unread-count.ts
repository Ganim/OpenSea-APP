'use client';

import { TOOLS_PERMISSIONS } from '@/config/rbac/permission-codes';
import { useTenant } from '@/contexts/tenant-context';
import { usePermissions } from '@/hooks/use-permissions';
import { emailService } from '@/services/email';
import { useQueries, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

/**
 * Lightweight hook that returns the total unread email count across all accounts.
 * Uses a long staleTime (60s) to avoid excessive queries.
 * Returns 0 if no accounts or not loaded yet.
 */
export function useEmailUnreadCount(): number {
  const { currentTenant } = useTenant();
  const { hasPermission } = usePermissions();
  const canList = hasPermission(TOOLS_PERMISSIONS.EMAIL_ACCOUNTS.ACCESS);
  const canRead = hasPermission(TOOLS_PERMISSIONS.EMAIL_MESSAGES.ACCESS);

  // Step 1: Fetch accounts (only when tenant is selected)
  const accountsQuery = useQuery({
    queryKey: ['email', 'accounts'],
    queryFn: () => emailService.listAccounts(),
    enabled: canList && !!currentTenant,
    staleTime: 60_000,
  });

  const accountIds = useMemo(
    () => accountsQuery.data?.data.map(a => a.id) ?? [],
    [accountsQuery.data]
  );

  // Step 2: Fetch folders for each account (reuses existing cache)
  const folderQueries = useQueries({
    queries: accountIds.map(accountId => ({
      queryKey: ['email', 'folders', accountId],
      queryFn: () => emailService.listFolders(accountId),
      enabled: canRead,
      staleTime: 60_000,
    })),
  });

  // Step 3: Sum unread across all folders of all accounts
  return useMemo(() => {
    let total = 0;
    for (const query of folderQueries) {
      if (query.data?.data) {
        for (const folder of query.data.data) {
          total += folder.unreadMessages;
        }
      }
    }
    return total;
  }, [folderQueries]);
}

/**
 * Returns a map of accountId -> total unread count for each account.
 * Useful for the sidebar to show per-account badges.
 */
export function useEmailAccountUnreadCounts(): Record<string, number> {
  const { currentTenant } = useTenant();
  const { hasPermission } = usePermissions();
  const canList = hasPermission(TOOLS_PERMISSIONS.EMAIL_ACCOUNTS.ACCESS);
  const canRead = hasPermission(TOOLS_PERMISSIONS.EMAIL_MESSAGES.ACCESS);

  const accountsQuery = useQuery({
    queryKey: ['email', 'accounts'],
    queryFn: () => emailService.listAccounts(),
    enabled: canList && !!currentTenant,
    staleTime: 60_000,
  });

  const accounts = accountsQuery.data?.data ?? [];

  const folderQueries = useQueries({
    queries: accounts.map(account => ({
      queryKey: ['email', 'folders', account.id],
      queryFn: () => emailService.listFolders(account.id),
      enabled: canRead,
      staleTime: 60_000,
    })),
  });

  return useMemo(() => {
    const counts: Record<string, number> = {};
    accounts.forEach((account, idx) => {
      const folders = folderQueries[idx]?.data?.data;
      if (folders) {
        counts[account.id] = folders.reduce(
          (sum, f) => sum + f.unreadMessages,
          0
        );
      }
    });
    return counts;
  }, [accounts, folderQueries]);
}
