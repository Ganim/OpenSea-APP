/**
 * User Dropdown Component
 * Dropdown com informações e ações do usuário
 */

'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/auth-context';
import { LogOut, Moon, Settings, Sun, Users } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';

export function UserDropdown() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }, [logout]);

  const toggleTheme = useCallback(
    (e: Event) => {
      e.preventDefault();
      setTheme(theme === 'dark' ? 'light' : 'dark');
    },
    [theme, setTheme]
  );

  const userName = useMemo(
    () => user?.profile?.name || user?.username || 'Usuário',
    [user]
  );

  const userEmail = useMemo(
    () => user?.email || 'email@example.com',
    [user]
  );

  const userInitial = useMemo(
    () =>
      user?.profile?.name?.charAt(0) || user?.username?.charAt(0) || 'U',
    [user]
  );

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="rounded-xl h-10 px-2 gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>{userInitial}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={22}
        className="w-64 backdrop-blur-xl bg-white/90 dark:bg-white/5 border-gray-200 dark:border-white/10 p-2"
      >
        <DropdownMenuLabel className="px-3 py-2">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {userName}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {userEmail}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-2" />

        <DropdownMenuItem
          className="px-3 py-3 cursor-pointer rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          onClick={() => router.push('/profile')}
        >
          <Users className="w-5 h-5 mr-3" />
          <span className="text-sm font-medium">Perfil</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="px-3 py-3 cursor-pointer rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          onClick={() => router.push('/settings')}
        >
          <Settings className="w-5 h-5 mr-3" />
          <span className="text-sm font-medium">Configurações</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-2" />

        <DropdownMenuItem
          onSelect={toggleTheme}
          className="px-3 py-3 cursor-pointer rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center w-full">
            <div className="w-5 h-5 mr-3">
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </div>
            <span className="text-sm font-medium">
              {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
            </span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-2" />

        <DropdownMenuItem
          className="px-3 py-3 cursor-pointer rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400 transition-colors"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span className="text-sm font-medium">Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
