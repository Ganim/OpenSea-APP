'use client';

import { useAuth } from '@/contexts/auth-context';
import { useCentralTheme } from '@/contexts/central-theme-context';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  ChevronDown,
  Crown,
  LogOut,
  Moon,
  Sun,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { GlassButton } from './glass-button';
import { GlassContainer } from './glass-container';

export function CentralNavbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useCentralTheme();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="h-20 px-6 flex items-center justify-between relative z-50">
      {/* Glass effect background */}
      <div className="absolute inset-0 backdrop-blur-xl border-b central-glass central-transition" />

      <div className="relative z-10 flex items-center gap-4">
        <Link href="/central" className="flex items-center gap-3 group">
          <div className="p-2 rounded-xl central-accent-amber central-accent-gradient group-hover:opacity-80 transition-all">
            <Crown className="h-6 w-6 central-accent-text" />
          </div>
          <div>
            <span className="font-bold text-lg block central-text">
              OpenSea Central
            </span>
            <span className="text-xs central-text-muted">
              Painel Administrativo
            </span>
          </div>
        </Link>
      </div>

      <div className="relative z-10 flex items-center gap-3">
        <GlassButton
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="gap-2"
          title={`Alternar para tema ${theme === 'dark-blue' ? 'claro' : 'azul escuro'}`}
        >
          {theme === 'dark-blue' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </GlassButton>

        <GlassButton
          variant="ghost"
          size="sm"
          onClick={() => router.push('/select-tenant')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao app
        </GlassButton>

        <div className="relative" ref={dropdownRef}>
          <GlassButton
            variant="secondary"
            size="sm"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="gap-2 min-w-[180px] justify-between"
          >
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg central-glass-subtle">
                <User className="h-3.5 w-3.5" />
              </div>
              <span className="text-sm truncate max-w-[120px]">
                {user?.email}
              </span>
            </div>
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform',
                isDropdownOpen && 'rotate-180'
              )}
            />
          </GlassButton>

          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56">
              <GlassContainer variant="strong" className="py-2 shadow-2xl">
                <button
                  onClick={() => {
                    router.push('/select-tenant');
                    setIsDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm central-transition flex items-center gap-2 central-text hover:bg-[rgb(var(--glass-bg)/var(--glass-bg-opacity))]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Selecionar empresa
                </button>

                <div className="h-px my-1 central-divider" />

                <button
                  onClick={() => {
                    logout();
                    setIsDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm central-transition flex items-center gap-2 text-[rgb(var(--color-destructive))] hover:bg-[rgb(var(--color-destructive)/0.1)]"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </button>
              </GlassContainer>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
