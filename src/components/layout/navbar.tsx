/**
 * Navbar Component
 * Barra de navegação flutuante principal
 */

'use client';

import { NotificationsPanel } from '@/components/shared/notifications-panel';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { PrintQueuePanel } from '@/core/print-queue';
import { motion } from 'framer-motion';
import { Crown, Grid3x3, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { UserDropdown } from './user-dropdown';

interface NavbarProps {
  onMenuOpen: () => void;
}

export function Navbar({ onMenuOpen }: NavbarProps) {
  const { isSuperAdmin } = useAuth();

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-[1600px]"
    >
      <div className="backdrop-blur-xl bg-white/90 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl shadow-lg px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900 dark:text-white">
              OpenSea
            </span>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {isSuperAdmin && (
              <Link href="/central">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-xl gap-2 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300"
                >
                  <Crown className="w-4 h-4" />
                  Central
                </Button>
              </Link>
            )}
            <PrintQueuePanel />
            <NotificationsPanel />

            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl"
              onClick={onMenuOpen}
              aria-label="Abrir menu de navegacao"
            >
              <Grid3x3 className="w-5 h-5" />
            </Button>

            <UserDropdown />
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
