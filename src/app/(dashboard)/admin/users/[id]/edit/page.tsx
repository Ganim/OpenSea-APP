/**
 * OpenSea OS - Edit User Page
 * Página de edição de usuário
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/core/components/confirm-dialog';
import { showErrorToast, showSuccessToast } from '@/lib/toast-utils';
import { usersService } from '@/services/auth/users.service';
import type { User } from '@/types/auth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Save,
  Trash2,
  User as UserIcon,
  Users,
  X,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const userId = params.id as string;

  // States
  const [editForm, setEditForm] = useState({
    email: '',
    username: '',
    name: '',
    surname: '',
  });
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const {
    data: user,
    isLoading,
    refetch: refetchUser,
  } = useQuery<User>({
    queryKey: ['users', userId],
    queryFn: async () => {
      const response = await usersService.getUser(userId);
      return response.user;
    },
    enabled: !!userId,
  });

  // Initialize edit form when user loads
  useEffect(() => {
    if (user) {
      setEditForm({
        email: user.email || '',
        username: user.username || '',
        name: user.profile?.name || '',
        surname: user.profile?.surname || '',
      });
    }
  }, [user]);

  // Track changes
  useEffect(() => {
    if (user) {
      const changed =
        editForm.email !== (user.email || '') ||
        editForm.username !== (user.username || '') ||
        editForm.name !== (user.profile?.name || '') ||
        editForm.surname !== (user.profile?.surname || '');
      setHasChanges(changed);
    }
  }, [editForm, user]);

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  const updateUserMutation = useMutation({
    mutationFn: async () => {
      // Atualizar email se mudou
      if (user && editForm.email !== user.email) {
        await usersService.updateUserEmail(userId, { email: editForm.email });
      }
      // Atualizar username se mudou
      if (user && editForm.username !== user.username) {
        await usersService.updateUserUsername(userId, {
          username: editForm.username,
        });
      }
      // Atualizar profile se mudou
      if (
        user &&
        (editForm.name !== user.profile?.name ||
          editForm.surname !== user.profile?.surname)
      ) {
        await usersService.updateUserProfile(userId, {
          name: editForm.name,
          surname: editForm.surname,
        });
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      await refetchUser();
      showSuccessToast('Usuário atualizado com sucesso');
      router.push(`/admin/users/${userId}`);
    },
    onError: error => {
      showErrorToast({
        title: 'Erro ao atualizar usuário',
        description:
          error instanceof Error ? error.message : 'Erro desconhecido',
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async () => {
      await usersService.deleteUser(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showSuccessToast('Usuário excluído com sucesso');
      router.push('/admin/users');
    },
    onError: error => {
      showErrorToast({
        title: 'Erro ao excluir usuário',
        description:
          error instanceof Error ? error.message : 'Erro desconhecido',
      });
      setConfirmDeleteOpen(false);
    },
  });

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleBack = () => {
    router.push(`/admin/users/${userId}`);
  };

  const handleCancel = () => {
    if (user) {
      setEditForm({
        email: user.email || '',
        username: user.username || '',
        name: user.profile?.name || '',
        surname: user.profile?.surname || '',
      });
    }
    router.push(`/admin/users/${userId}`);
  };

  const handleSave = () => {
    updateUserMutation.mutate();
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoading) {
    return (
      <div className="min-h-screen px-6 py-6">
        <div className="mx-auto space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen px-6 py-6">
        <div className="mx-auto">
          <Card className="p-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">
              Usuário não encontrado
            </h2>
            <p className="text-muted-foreground mb-6">
              O usuário que você está procurando não existe ou foi removido.
            </p>
            <Button onClick={() => router.push('/admin/users')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Usuários
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen from-blue-50 via-gray-50 to-cyan-50 dark:from-gray-900 dark:via-slate-900 dark:to-slate-800 px-6 py-6">
      <div className="mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmDeleteOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={updateUserMutation.isPending || !hasChanges}
            >
              <Save className="h-4 w-4 mr-2" />
              {updateUserMutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>

        {/* Title Section */}
        <Card className="p-4 sm:p-6">
          <div className="flex gap-4 sm:flex-row items-center sm:gap-6">
            <div className="flex items-center justify-center h-10 w-10 md:h-16 md:w-16 rounded-lg bg-linear-to-br from-blue-500 to-cyan-600 shrink-0">
              <UserIcon className="md:h-8 md:w-8 text-white" />
            </div>
            <div className="flex justify-between flex-1 gap-4 flex-row items-center">
              <div>
                <h1 className="text-lg sm:text-3xl font-bold tracking-tight">
                  Editar Usuário
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {user.username} • {user.email}
                </p>
              </div>
              {hasChanges && (
                <Badge
                  variant="secondary"
                  className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"
                >
                  Alterações não salvas
                </Badge>
              )}
            </div>
          </div>
        </Card>

        {/* Form */}
        <Card className="p-4 sm:p-6 w-full">
          <h3 className="text-lg uppercase font-semibold mb-6 flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Dados Pessoais
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Username */}
            <div className="space-y-2">
              <Label
                htmlFor="username"
                className="text-xs uppercase text-muted-foreground"
              >
                Username <span className="text-destructive">*</span>
              </Label>
              <Input
                id="username"
                value={editForm.username}
                onChange={e =>
                  setEditForm({ ...editForm, username: e.target.value })
                }
                placeholder="Digite o username"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-xs uppercase text-muted-foreground"
              >
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={editForm.email}
                onChange={e =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
                placeholder="Digite o email"
              />
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-xs uppercase text-muted-foreground"
              >
                Nome
              </Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={e =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                placeholder="Digite o nome"
              />
            </div>

            {/* Surname */}
            <div className="space-y-2">
              <Label
                htmlFor="surname"
                className="text-xs uppercase text-muted-foreground"
              >
                Sobrenome
              </Label>
              <Input
                id="surname"
                value={editForm.surname}
                onChange={e =>
                  setEditForm({ ...editForm, surname: e.target.value })
                }
                placeholder="Digite o sobrenome"
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Delete User Confirm Dialog */}
      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Excluir Usuário"
        description={`Tem certeza que deseja excluir o usuário "${user.username}"? Esta ação não pode ser desfeita.`}
        onConfirm={() => deleteUserMutation.mutate()}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="destructive"
        isLoading={deleteUserMutation.isPending}
      />
    </div>
  );
}
