'use client';

import { AuthBackground } from '@/components/ui/auth-background';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/contexts/auth-context';
import { translateError } from '@/lib/error-messages';
import { logger } from '@/lib/logger';
import { authService } from '@/services';
import { useForm } from '@tanstack/react-form';
import {
  ChevronLeft,
  ChevronRight,
  Lock,
  Mail,
  Sparkles,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type LoginStep = 'identifier' | 'password';
type LoginMode = 'password' | 'magic-link';

interface LoginFormData {
  identifier: string;
  password: string;
}

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<LoginStep>('identifier');
  const [loginMode, setLoginMode] = useState<LoginMode>('password');
  const [error, setError] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false);

  const form = useForm({
    defaultValues: {
      identifier: '',
      password: '',
    } as LoginFormData,
    onSubmit: async ({ value }: { value: LoginFormData }) => {
      setError('');

      try {
        const result = await login({
          email: value.identifier,
          password: value.password,
        });
        if (!result.redirected) {
          // Super admins vão direto para o Central
          if (result.isSuperAdmin) {
            router.push('/central');
            return;
          }

          // Se o backend já auto-selecionou o tenant, vai direto para o dashboard
          if (result.autoSelectedTenant) {
            router.push('/');
            return;
          }

          // Se tem 0 ou 2+ tenants, vai para a página de seleção
          router.push('/select-tenant');
        }
      } catch (err: unknown) {
        setError(translateError(err));
        logger.error('Erro no login', err instanceof Error ? err : undefined);
      }
    },
  });

  const handleIdentifierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = form.getFieldValue('identifier');

    if (!value || value.length < 3) {
      setError('Digite um identificador válido');
      return;
    }

    setError('');
    setIdentifier(value);

    if (loginMode === 'magic-link') {
      handleMagicLinkRequest(value);
    } else {
      setCurrentStep('password');
    }
  };

  const handleMagicLinkRequest = async (identifierValue: string) => {
    setError('');
    setIsSendingMagicLink(true);

    try {
      await authService.requestMagicLink(identifierValue);
      setMagicLinkSent(true);
    } catch (err: unknown) {
      // Always show success message to prevent user enumeration
      setMagicLinkSent(true);
      logger.error(
        'Erro ao solicitar magic link',
        err instanceof Error ? err : undefined
      );
    } finally {
      setIsSendingMagicLink(false);
    }
  };

  const handleBack = () => {
    setCurrentStep('identifier');
    setError('');
    form.setFieldValue('password', '');
  };

  const switchToMagicLink = () => {
    setLoginMode('magic-link');
    setCurrentStep('identifier');
    setError('');
    setMagicLinkSent(false);
    form.setFieldValue('password', '');
  };

  const switchToPassword = () => {
    setLoginMode('password');
    setCurrentStep('identifier');
    setError('');
    setMagicLinkSent(false);
  };

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
              Entre na sua conta
            </p>
          </div>

          {/* Login Card */}
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            <CardContent className="p-6 sm:p-8">
              <form
                onSubmit={
                  currentStep === 'identifier'
                    ? handleIdentifierSubmit
                    : e => {
                        e.preventDefault();
                        e.stopPropagation();
                        form.handleSubmit();
                      }
                }
                className="space-y-6"
              >
                {/* Error message */}
                {error && (
                  <div className="p-4 rounded-2xl bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/30 animate-in fade-in slide-in-from-top-2 duration-200">
                    <p className="text-sm text-rose-600 dark:text-rose-400 text-center">
                      {error}
                    </p>
                  </div>
                )}

                {/* Magic Link Success */}
                {magicLinkSent && loginMode === 'magic-link' && (
                  <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="p-4 rounded-2xl bg-violet-500/10 dark:bg-violet-500/20 border border-violet-500/30">
                      <div className="flex items-center gap-3 mb-2">
                        <Mail className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                        <p className="text-sm font-medium text-violet-700 dark:text-violet-300">
                          Link enviado!
                        </p>
                      </div>
                      <p className="text-sm text-violet-600 dark:text-violet-400">
                        Se o identificador estiver cadastrado, um email foi
                        enviado com o link de acesso. Verifique sua caixa de
                        entrada.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={switchToPassword}
                      className="w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-medium text-center"
                    >
                      Entrar com senha
                    </button>
                  </div>
                )}

                {/* Normal flow (not magic link sent) */}
                {!(magicLinkSent && loginMode === 'magic-link') && (
                  <>
                    {/* Step indicator */}
                    {loginMode === 'password' && (
                      <div className="flex items-center justify-center gap-2 mb-6">
                        <div
                          className={`h-1.5 w-12 rounded-full transition-all duration-300 ${
                            currentStep === 'identifier'
                              ? 'bg-blue-600 dark:bg-blue-400'
                              : 'bg-gray-300 dark:bg-gray-700'
                          }`}
                        />
                        <div
                          className={`h-1.5 w-12 rounded-full transition-all duration-300 ${
                            currentStep === 'password'
                              ? 'bg-blue-600 dark:bg-blue-400'
                              : 'bg-gray-300 dark:bg-gray-700'
                          }`}
                        />
                      </div>
                    )}

                    {/* Step 1: Identifier */}
                    {currentStep === 'identifier' && (
                      <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                        <form.Field name="identifier">
                          {field => (
                            <div className="space-y-2">
                              <Label htmlFor="identifier">Identificador</Label>
                              <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-white/40 z-10 pointer-events-none" />
                                <Input
                                  id="identifier"
                                  type="text"
                                  placeholder="Email, CPF ou Matrícula"
                                  value={field.state.value}
                                  onChange={e =>
                                    field.handleChange(e.target.value)
                                  }
                                  onBlur={field.handleBlur}
                                  autoFocus
                                  className="pl-12"
                                />
                              </div>
                            </div>
                          )}
                        </form.Field>

                        {loginMode === 'password' && (
                          <>
                            <Button type="submit" className="w-full" size="lg">
                              Continuar
                              <ChevronRight className="w-5 h-5 ml-2" />
                            </Button>

                            <button
                              type="button"
                              onClick={switchToMagicLink}
                              className="w-full flex items-center justify-center gap-2 text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors font-medium"
                            >
                              <Sparkles className="w-4 h-4" />
                              Entrar com link mágico
                            </button>
                          </>
                        )}

                        {loginMode === 'magic-link' && (
                          <>
                            <Button
                              type="submit"
                              className="w-full bg-violet-600 hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-700 text-white"
                              size="lg"
                              disabled={isSendingMagicLink}
                            >
                              {isSendingMagicLink ? (
                                'Enviando...'
                              ) : (
                                <>
                                  <Mail className="w-5 h-5 mr-2" />
                                  Enviar link de acesso
                                </>
                              )}
                            </Button>

                            <button
                              type="button"
                              onClick={switchToPassword}
                              className="w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-medium text-center"
                            >
                              Entrar com senha
                            </button>
                          </>
                        )}
                      </div>
                    )}

                    {/* Step 2: Password */}
                    {currentStep === 'password' && loginMode === 'password' && (
                      <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                        {/* Show identifier */}
                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/50 shadow-sm">
                          <User className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                          <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 truncate font-medium">
                            {identifier}
                          </span>
                          <button
                            type="button"
                            onClick={handleBack}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                        </div>

                        <form.Field name="password">
                          {field => (
                            <div className="space-y-2">
                              <Label htmlFor="password">Senha</Label>
                              <PasswordInput
                                id="password"
                                placeholder="••••••••"
                                value={field.state.value}
                                onChange={e =>
                                  field.handleChange(e.target.value)
                                }
                                onBlur={field.handleBlur}
                                autoFocus
                                iconLeft={
                                  <Lock className="w-5 h-5 text-gray-500 dark:text-white/40" />
                                }
                              />
                            </div>
                          )}
                        </form.Field>

                        {/* Forgot password + Magic link */}
                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={switchToMagicLink}
                            className="flex items-center gap-1.5 text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors font-medium"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            Link mágico
                          </button>
                          <Link
                            href="/forgot-password"
                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-medium"
                          >
                            Esqueceu a senha?
                          </Link>
                        </div>

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
                            disabled={isLoading}
                            size="lg"
                          >
                            {isLoading ? 'Entrando...' : 'Entrar'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthBackground>
  );
}
