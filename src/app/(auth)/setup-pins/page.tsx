'use client';

import { AuthBackground } from '@/components/ui/auth-background';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useSetAccessPin, useSetActionPin } from '@/hooks/use-pins';
import { translateError } from '@/lib/error-messages';
import { KeyRound, Lock, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Step = 'access' | 'action' | 'done';

export default function SetupPinsPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('access');
  const [currentPassword, setCurrentPassword] = useState('');
  const [accessPin, setAccessPin] = useState('');
  const [accessPinConfirm, setAccessPinConfirm] = useState('');
  const [actionPin, setActionPin] = useState('');
  const [actionPinConfirm, setActionPinConfirm] = useState('');
  const [error, setError] = useState('');

  const setAccessPinMutation = useSetAccessPin();
  const setActionPinMutation = useSetActionPin();

  const handleSetAccessPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (accessPin !== accessPinConfirm) {
      setError('Os PINs de acesso não coincidem.');
      return;
    }

    try {
      await setAccessPinMutation.mutateAsync({
        currentPassword,
        newAccessPin: accessPin,
      });
      setStep('action');
      setAccessPin('');
      setAccessPinConfirm('');
    } catch (err) {
      setError(translateError(err));
    }
  };

  const handleSetActionPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (actionPin !== actionPinConfirm) {
      setError('Os PINs de ação não coincidem.');
      return;
    }

    try {
      await setActionPinMutation.mutateAsync({
        currentPassword,
        newActionPin: actionPin,
      });
      setStep('done');
      // Redirect after brief delay
      setTimeout(() => {
        router.push('/select-tenant');
      }, 1500);
    } catch (err) {
      setError(translateError(err));
    }
  };

  return (
    <AuthBackground>
      <ThemeToggle />

      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500 to-blue-600 shadow-2xl shadow-blue-600/40 mb-4">
              <span className="text-3xl">{step === 'done' ? '✅' : '🔐'}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {step === 'done' ? 'PINs Configurados!' : 'Configurar PINs'}
            </h1>
            <p className="text-gray-600 dark:text-white/60">
              {step === 'access' &&
                'Primeiro, configure seu PIN de Acesso (6 dígitos)'}
              {step === 'action' &&
                'Agora, configure seu PIN de Ação (4 dígitos)'}
              {step === 'done' &&
                'Seus PINs foram configurados com sucesso. Redirecionando...'}
            </p>
          </div>

          {/* Progress indicator */}
          {step !== 'done' && (
            <div className="flex items-center justify-center gap-2 mb-6">
              <div
                className={`h-2 w-16 rounded-full ${step === 'access' ? 'bg-blue-500' : 'bg-green-500'}`}
              />
              <div
                className={`h-2 w-16 rounded-full ${step === 'action' ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-700'}`}
              />
            </div>
          )}

          {step !== 'done' && (
            <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
              <CardContent className="p-6 sm:p-8">
                {error && (
                  <div className="p-4 rounded-2xl bg-red-500/10 dark:bg-red-500/20 border border-red-500/30 animate-in fade-in slide-in-from-top-2 duration-200 mb-6">
                    <p className="text-sm text-red-600 dark:text-red-400 text-center">
                      {error}
                    </p>
                  </div>
                )}

                {/* Step 1: Access PIN */}
                {step === 'access' && (
                  <form onSubmit={handleSetAccessPin} className="space-y-6">
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/50">
                      <KeyRound className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                          PIN de Acesso
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Usado para login rápido no lugar da senha
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Senha Atual</Label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-white/40 z-10 pointer-events-none" />
                        <Input
                          id="currentPassword"
                          type="password"
                          placeholder="Digite sua senha"
                          value={currentPassword}
                          onChange={e => setCurrentPassword(e.target.value)}
                          autoFocus
                          className="pl-12"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Novo PIN de Acesso (6 dígitos)</Label>
                      <div className="flex justify-center">
                        <InputOTP
                          maxLength={6}
                          value={accessPin}
                          onChange={setAccessPin}
                        >
                          <InputOTPGroup>
                            <InputOTPSlot index={0} masked />
                            <InputOTPSlot index={1} masked />
                            <InputOTPSlot index={2} masked />
                            <InputOTPSlot index={3} masked />
                            <InputOTPSlot index={4} masked />
                            <InputOTPSlot index={5} masked />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Confirmar PIN de Acesso</Label>
                      <div className="flex justify-center">
                        <InputOTP
                          maxLength={6}
                          value={accessPinConfirm}
                          onChange={setAccessPinConfirm}
                        >
                          <InputOTPGroup>
                            <InputOTPSlot index={0} masked />
                            <InputOTPSlot index={1} masked />
                            <InputOTPSlot index={2} masked />
                            <InputOTPSlot index={3} masked />
                            <InputOTPSlot index={4} masked />
                            <InputOTPSlot index={5} masked />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={
                        setAccessPinMutation.isPending ||
                        !currentPassword ||
                        accessPin.length !== 6 ||
                        accessPinConfirm.length !== 6
                      }
                    >
                      {setAccessPinMutation.isPending
                        ? 'Salvando...'
                        : 'Continuar'}
                    </Button>
                  </form>
                )}

                {/* Step 2: Action PIN */}
                {step === 'action' && (
                  <form onSubmit={handleSetActionPin} className="space-y-6">
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/50">
                      <Shield className="w-5 h-5 text-amber-500" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                          PIN de Ação
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Usado para autorizar ações sensíveis no sistema
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Novo PIN de Ação (4 dígitos)</Label>
                      <div className="flex justify-center">
                        <InputOTP
                          maxLength={4}
                          value={actionPin}
                          onChange={setActionPin}
                          autoFocus
                        >
                          <InputOTPGroup>
                            <InputOTPSlot index={0} masked />
                            <InputOTPSlot index={1} masked />
                            <InputOTPSlot index={2} masked />
                            <InputOTPSlot index={3} masked />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Confirmar PIN de Ação</Label>
                      <div className="flex justify-center">
                        <InputOTP
                          maxLength={4}
                          value={actionPinConfirm}
                          onChange={setActionPinConfirm}
                        >
                          <InputOTPGroup>
                            <InputOTPSlot index={0} masked />
                            <InputOTPSlot index={1} masked />
                            <InputOTPSlot index={2} masked />
                            <InputOTPSlot index={3} masked />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={
                        setActionPinMutation.isPending ||
                        actionPin.length !== 4 ||
                        actionPinConfirm.length !== 4
                      }
                    >
                      {setActionPinMutation.isPending
                        ? 'Salvando...'
                        : 'Finalizar'}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AuthBackground>
  );
}
