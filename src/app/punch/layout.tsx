'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';

export default function PunchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-dvh bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
        {children}
      </div>
    </ProtectedRoute>
  );
}
