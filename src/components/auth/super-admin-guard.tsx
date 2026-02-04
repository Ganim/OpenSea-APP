'use client';

import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export function SuperAdminGuard({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated, isSuperAdmin } = useAuth();
  const router = useRouter();
  const [mounted] = useState(typeof window !== 'undefined');

  useEffect(() => {
    if (!isLoading && isAuthenticated && !isSuperAdmin) {
      router.replace('/');
    }
    if (!isLoading && !isAuthenticated) {
      router.replace('/fast-login');
    }
  }, [isLoading, isAuthenticated, isSuperAdmin, router]);

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated || !isSuperAdmin) {
    return null;
  }

  return <>{children}</>;
}
