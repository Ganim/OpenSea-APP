'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useAuth } from '@/contexts/auth-context';
import { useCentralTheme } from '@/contexts/central-theme-context';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  ChevronDown,
  Crown,
  LogOut,
  Menu,
  Moon,
  Sun,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { GlassButton } from './glass-button';
import { GlassContainer } from './glass-container';
import { sidebarItems } from './central-sidebar';

export function CentralNavbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useCentralTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  // Close mobile menu on navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <nav className="h-20 px-6 flex items-center justify-between relative z-50">
        {/* Glass effect background */}
        <div className="absolute inset-0 border-b central-glass" />

        <div className="relative z-10 flex items-center gap-4">
          {/* Hamburger menu - mobile only */}
          <GlassButton
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden"
            aria-label="Abrir menu de navegação"
          >
            <Menu className="h-5 w-5" />
          </GlassButton>

          <Link href="/central" className="flex items-center gap-3 group">
            <div className="p-2 rounded-xl central-accent-amber central-accent-gradient group-hover:opacity-80 transition-all">
              <Crown className="h-6 w-6 central-accent-text" />
            </div>
            <div className="hidden sm:block">
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
            className="gap-2 hidden sm:inline-flex"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao app
          </GlassButton>

          <div className="relative" ref={dropdownRef}>
            <GlassButton
              variant="secondary"
              size="sm"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="gap-2 min-w-[48px] sm:min-w-[180px] justify-between"
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg central-glass-subtle">
                  <User className="h-3.5 w-3.5" />
                </div>
                <span className="text-sm truncate max-w-[120px] hidden sm:inline">
                  {user?.email}
                </span>
              </div>
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform hidden sm:block',
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

      {/* Mobile navigation drawer */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent
          side="left"
          className="w-72 central-glass-strong border-r border-[rgb(var(--central-border)/0.15)] p-0"
        >
          <SheetHeader className="p-6 pb-4">
            <SheetTitle className="flex items-center gap-3 central-text">
              <div className="p-2 rounded-xl central-accent-amber central-accent-gradient">
                <Crown className="h-5 w-5 central-accent-text" />
              </div>
              <span className="font-bold text-lg">OpenSea Central</span>
            </SheetTitle>
          </SheetHeader>

          <div className="px-4 space-y-2">
            {sidebarItems.map(item => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/central' && pathname?.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium central-transition',
                    isActive
                      ? 'central-glass central-text shadow-lg'
                      : 'central-text-muted hover:central-text hover:bg-[rgb(var(--glass-bg)/var(--glass-bg-opacity))]'
                  )}
                >
                  <div
                    className={cn(
                      'p-2 rounded-lg',
                      isActive ? 'central-glass' : 'central-glass-subtle'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                  </div>
                  <span>{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[rgb(var(--color-primary))]" />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[rgb(var(--central-border)/0.15)]">
            <button
              onClick={() => {
                router.push('/select-tenant');
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm central-text-muted hover:central-text central-transition hover:bg-[rgb(var(--glass-bg)/var(--glass-bg-opacity))]"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao app
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
