'use client';

import { AuthBackground } from '@/components/ui/auth-background';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/contexts/auth-context';
import { useTenant } from '@/contexts/tenant-context';
import { translateError } from '@/lib/error-messages';
import {
  getSavedAccounts,
  removeAccount,
  type SavedAccount,
} from '@/lib/saved-accounts';
import {
  ChevronLeft,
  ChevronRight,
  Lock,
  Plus,
  UserPlus,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function FastLoginPage() {
  const { login, isLoading } = useAuth();
  const { refreshTenants, selectTenant } = useTenant();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<SavedAccount | null>(
    null
  );
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [sessionExpired, setSessionExpired] = useState(false);

  // Carrega contas após hidratação e redireciona se não há
  useEffect(() => {
    setIsMounted(true);
    const accounts = getSavedAccounts();
    setSavedAccounts(accounts);

    // Verifica se veio de uma sessão expirada
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('session') === 'expired') {
        setSessionExpired(true);
        // Remove o parâmetro da URL
        window.history.replaceState({}, '', '/fast-login');
      }
    }

    if (accounts.length === 0) {
      router.replace('/login');
    }
  }, [router]);

  const handleSelectAccount = (account: SavedAccount) => {
    setSelectedAccount(account);
    setPassword('');
    setError('');
  };

  const handleBack = () => {
    setSelectedAccount(null);
    setPassword('');
    setError('');
  };

  const handleRemoveAccount = (e: React.MouseEvent, identifier: string) => {
    e.stopPropagation();
    removeAccount(identifier);
    const updated = getSavedAccounts();
    setSavedAccounts(updated);

    // Se removeu a conta selecionada, volta para a lista
    if (selectedAccount?.identifier === identifier) {
      setSelectedAccount(null);
    }

    // Se não há mais contas, redireciona para login
    if (updated.length === 0) {
      router.replace('/login');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount || !password) return;

    setError('');

    try {
      const result = await login({
        email: selectedAccount.identifier,
        password,
      });
      if (!result.redirected) {
        // Super admins vão direto para o dashboard
        if (result.isSuperAdmin) {
          router.push('/');
          return;
        }

        // Busca os tenants do usuário
        const tenantsList = await refreshTenants();

        if (tenantsList.length === 1) {
          // Se só tem um tenant, seleciona automaticamente
          await selectTenant(tenantsList[0].id);
          router.push('/');
        } else {
          // Se tem 0 ou 2+ tenants, vai para a página de seleção
          router.push('/select-tenant');
        }
      }
    } catch (err: unknown) {
      setError(translateError(err));
      console.error('Erro no login:', err);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatLastLogin = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays} dias atrás`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  // Se não há contas, mostra loading (vai redirecionar)
  if (!isMounted || savedAccounts.length === 0) {
    return (
      <AuthBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-gray-500">Carregando...</div>
        </div>
      </AuthBackground>
    );
  }

  return (
    <AuthBackground>
      <ThemeToggle />

      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500 to-blue-600 shadow-2xl shadow-blue-600/40 mb-4">
              <span className="text-3xl">🌊</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              OpenSea
            </h1>
            <p className="text-gray-600 dark:text-white/60">
              {selectedAccount
                ? 'Digite sua senha'
                : 'Selecione uma conta para continuar'}
            </p>
          </div>

          {/* Card */}
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            <CardContent className="p-6 sm:p-8">
              {/* Session expired message */}
              {sessionExpired && (
                <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 animate-in fade-in slide-in-from-top-2 duration-200 mb-6">
                  <p className="text-sm text-amber-600 dark:text-amber-400 text-center">
                    Sua sessão expirou. Por favor, faça login novamente.
                  </p>
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="p-4 rounded-2xl bg-red-500/10 dark:bg-red-500/20 border border-red-500/30 animate-in fade-in slide-in-from-top-2 duration-200 mb-6">
                  <p className="text-sm text-red-600 dark:text-red-400 text-center">
                    {error}
                  </p>
                </div>
              )}

              {/* Account Selection */}
              {!selectedAccount && (
                <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                  {savedAccounts.map(account => (
                    <button
                      key={account.id}
                      type="button"
                      onClick={() => handleSelectAccount(account)}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl border border-gray-200 hover:border-blue-300 dark:border-gray-700 bg-blue-100/30 hover:bg-blue-100/60 dark:hover:bg-blue-800/50 dark:bg-blue-800/30 transition-all duration-200 group cursor-pointer"
                    >
                      <Avatar className="h-12 w-12 ring-2 ring-gray-100 dark:ring-blue-600">
                        <AvatarImage src={account.avatarUrl || undefined} />
                        <AvatarFallback className="bg-blue-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400 text-sm font-semibold">
                          {getInitials(account.displayName)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 text-left min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                          {account.displayName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {account.identifier}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                          Último acesso: {formatLastLogin(account.lastLoginAt)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={e =>
                            handleRemoveAccount(
                              e as React.MouseEvent,
                              account.identifier
                            )
                          }
                          onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              // Call remove without the event parameter for keyboard
                              const mockEvent = {
                                preventDefault: () => {},
                              } as React.MouseEvent;
                              handleRemoveAccount(
                                mockEvent,
                                account.identifier
                              );
                            }
                          }}
                          className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
                          title="Remover conta"
                          aria-label="Remover conta"
                        >
                          <X className="w-4 h-4" />
                        </span>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      </div>
                    </button>
                  ))}

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white dark:bg-gray-900 px-3 text-gray-500 dark:text-gray-400">
                        ou
                      </span>
                    </div>
                  </div>

                  {/* Other options */}
                  <Link
                    href="/login"
                    className="w-full flex items-center gap-4 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200"
                  >
                    <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <Plus className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        Usar outra conta
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Entrar com uma conta diferente
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </Link>

                  <Link
                    href="/register"
                    className="w-full flex items-center gap-4 p-4 rounded-2xl border border-dashed border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200"
                  >
                    <div className="h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                      <UserPlus className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        Criar nova conta
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Cadastre-se no OpenSea
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </Link>
                </div>
              )}

              {/* Password Entry */}
              {selectedAccount && (
                <form
                  onSubmit={handleLogin}
                  className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300"
                >
                  {/* Selected account info */}
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/50">
                    <Avatar className="h-12 w-12 ring-2 ring-blue-200 dark:ring-blue-800">
                      <AvatarImage
                        src={selectedAccount.avatarUrl || undefined}
                      />
                      <AvatarFallback className="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-sm font-semibold">
                        {getInitials(selectedAccount.displayName)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">
                        {selectedAccount.displayName}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {selectedAccount.identifier}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleBack}
                      className="p-2 rounded-full text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Password field */}
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-white/40 z-10 pointer-events-none" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        autoFocus
                        className="pl-12"
                      />
                    </div>
                  </div>

                  {/* Forgot password */}
                  <div className="text-right">
                    <Link
                      href="/forgot-password"
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-medium"
                    >
                      Esqueceu a senha?
                    </Link>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      className="flex-1"
                      size="lg"
                    >
                      <ChevronLeft className="w-5 h-5 mr-2" />
                      Voltar
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={isLoading || !password}
                      size="lg"
                    >
                      {isLoading ? 'Entrando...' : 'Entrar'}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthBackground>
  );
}
