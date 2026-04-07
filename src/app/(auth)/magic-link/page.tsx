'use client';

import { AuthBackground } from '@/components/ui/auth-background';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { authConfig } from '@/config/api';
import { authService } from '@/services';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function MagicLinkContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setError('Link inválido ou ausente.');
      return;
    }

    authService
      .verifyMagicLink(token)
      .then(response => {
        setStatus('success');

        // Save tokens to localStorage (authService already called setToken/setRefreshToken)
        if (response.token) {
          localStorage.setItem(authConfig.tokenKey, response.token);
        }
        if (response.refreshToken) {
          localStorage.setItem(
            authConfig.refreshTokenKey,
            response.refreshToken
          );
        }
        if (response.sessionId) {
          localStorage.setItem('session_id', response.sessionId);
        }

        // Handle routing like normal login
        if (response.tenant) {
          localStorage.setItem('selected_tenant_id', response.tenant.id);
          window.dispatchEvent(
            new CustomEvent('tenant-refreshed', { detail: response.tenant })
          );
          setTimeout(() => router.push('/'), 1500);
        } else if (response.user?.isSuperAdmin) {
          setTimeout(() => router.push('/central'), 1500);
        } else {
          setTimeout(() => router.push('/select-tenant'), 1500);
        }
      })
      .catch(err => {
        setStatus('error');
        const message =
          err?.message || err?.data?.message || 'Link inválido ou expirado.';
        setError(message);
      });
  }, [token, router]);

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
            <p className="text-gray-600 dark:text-white/60">Link mágico</p>
          </div>

          {/* Status Card */}
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col items-center text-center space-y-4">
                {status === 'loading' && (
                  <>
                    <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin" />
                    <div>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        Verificando link...
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Aguarde enquanto validamos seu acesso.
                      </p>
                    </div>
                  </>
                )}

                {status === 'success' && (
                  <>
                    <CheckCircle className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        Acesso autorizado!
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Redirecionando...
                      </p>
                    </div>
                  </>
                )}

                {status === 'error' && (
                  <>
                    <XCircle className="w-12 h-12 text-rose-600 dark:text-rose-400" />
                    <div>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        Falha na verificação
                      </p>
                      <p className="text-sm text-rose-600 dark:text-rose-400 mt-1">
                        {error}
                      </p>
                    </div>

                    <Link href="/login">
                      <Button variant="outline" size="lg" className="mt-4">
                        Voltar ao login
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthBackground>
  );
}

export default function MagicLinkPage() {
  return (
    <Suspense
      fallback={
        <AuthBackground>
          <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        </AuthBackground>
      }
    >
      <MagicLinkContent />
    </Suspense>
  );
}
