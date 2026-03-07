'use client';

import { FileManager } from '@/components/storage';
import { useAuth } from '@/contexts/auth-context';

export function AttachmentsTab() {
  const { user } = useAuth();

  return (
    <FileManager entityType="user" entityId={user?.id} className="h-[600px]" />
  );
}
