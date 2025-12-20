/**
 * OpenSea OS - User Detail Page
 * Página de detalhes de um usuário específico
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { usersService } from '@/services/auth/users.service';
import type { User } from '@/types/auth';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Mail, Shield, Users } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { getRoleBadgeVariant } from '../src/constants';

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['users', userId],
    queryFn: async () => {
      const response = await usersService.getUser(userId);
      return response.user;
    },
  });

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleBack = () => {
    router.push('/admin/users');
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-12 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-2">
            Usuário não encontrado
          </h2>
          <p className="text-muted-foreground mb-6">
            O usuário que você está procurando não existe ou foi removido.
          </p>
          <Button onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Usuários
          </Button>
        </Card>
      </div>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  const roleBadgeVariant = getRoleBadgeVariant(user.role);

  return (
    <div className="min-h-screen from-blue-50 via-gray-50 to-cyan-50 dark:from-gray-900 dark:via-slate-900 dark:to-slate-800 px-6">
      {/* Header com botão voltar */}
      <div className="max-w-4xl mx-auto mb-6">
        <Button variant="ghost" size="sm" onClick={handleBack} className="mb-4">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Voltar para Usuários
        </Button>

        {/* Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 to-cyan-600">
              <Users className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {user.username}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto">
        <Card className="backdrop-blur-xl bg-white/40 dark:bg-white/5 border-gray-200/50 dark:border-white/10 p-8">
          <div className="space-y-8">
            {/* Basic Information */}
            <div>
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Informações Básicas
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Username
                  </Label>
                  <p className="mt-2 font-medium">{user.username}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <p className="mt-2 font-medium">{user.email}</p>
                </div>

                {user.profile?.name && (
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Nome Completo
                    </Label>
                    <p className="mt-2 font-medium">
                      {user.profile.name} {user.profile.surname || ''}
                    </p>
                  </div>
                )}

                <div>
                  <Label className="text-sm text-muted-foreground flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Papel
                  </Label>
                  <div className="mt-2">
                    <Badge
                      variant={
                        roleBadgeVariant as
                          | 'destructive'
                          | 'default'
                          | 'secondary'
                      }
                    >
                      {user.role === 'ADMIN'
                        ? 'Administrador'
                        : user.role === 'MANAGER'
                          ? 'Gerente'
                          : 'Usuário'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata */}
            {(user.createdAt || user.updatedAt) && (
              <div>
                <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Histórico
                </h2>
                <div className="grid grid-cols-2 gap-6 text-sm">
                  {user.createdAt && (
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Criado em
                      </Label>
                      <p className="mt-1">
                        {new Date(user.createdAt).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  )}
                  {user.updatedAt && (
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Última atualização
                      </Label>
                      <p className="mt-1">
                        {new Date(user.updatedAt).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
