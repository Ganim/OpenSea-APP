'use client';

import { UserAvatar } from '@/components/shared/user-avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useUpdateProfile } from '@/hooks/use-me';
import { translateError } from '@/lib/error-messages';
import type { User } from '@/types/auth';
import {
  Calendar,
  Loader2,
  Mail,
  MapPin,
  Save,
  User as UserIcon,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface ProfileTabProps {
  user: User | null;
}

export function ProfileTab({ user }: ProfileTabProps) {
  const updateProfile = useUpdateProfile();

  const [formData, setFormData] = useState({
    name: user?.profile?.name || '',
    surname: user?.profile?.surname || '',
    location: user?.profile?.location || '',
    bio: user?.profile?.bio || '',
  });

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync(formData);
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(translateError(message));
    }
  };

  const displayName = user?.profile?.name
    ? `${user.profile.name}${user.profile.surname ? ` ${user.profile.surname}` : ''}`
    : user?.username || 'Usuário';

  return (
    <div className="space-y-6">
      {/* Avatar Card */}
      <Card className="p-6 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <UserAvatar
            name={user?.profile?.name}
            surname={user?.profile?.surname}
            email={user?.email}
            avatarUrl={user?.profile?.avatarUrl}
            size="xl"
          />
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {displayName}
            </h2>
            <p className="text-gray-600 dark:text-white/60">{user?.email}</p>
            {user?.username && (
              <p className="text-sm text-gray-500 dark:text-white/40">
                @{user.username}
              </p>
            )}
          </div>
          {/* Account Info */}
          <div className="flex flex-col gap-2 text-sm flex-shrink-0">
            <div className="flex items-center gap-2 text-gray-600 dark:text-white/60">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span>
                Conta criada em{' '}
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('pt-BR')
                  : 'N/A'}
              </span>
            </div>
            {user?.lastLoginAt && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-white/60">
                <Calendar className="w-4 h-4 text-amber-500" />
                <span>
                  Último login em{' '}
                  {new Date(user.lastLoginAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Profile Form */}
      <Card className="p-6 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Informações Pessoais
            </h3>
            <p className="text-sm text-gray-500 dark:text-white/50">
              Atualize suas informações de perfil
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={updateProfile.isPending}
            className="bg-linear-to-r from-blue-500 to-purple-600 text-white"
          >
            {updateProfile.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Salvar Alterações
          </Button>
        </div>

        <Separator className="my-4" />

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  value={formData.name}
                  onChange={e =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="pl-10"
                  placeholder="Seu nome"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="surname">Sobrenome</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="surname"
                  value={formData.surname}
                  onChange={e =>
                    setFormData({ ...formData, surname: e.target.value })
                  }
                  className="pl-10"
                  placeholder="Seu sobrenome"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="pl-10 bg-gray-50 dark:bg-white/5"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-white/40">
                O email não pode ser alterado por aqui
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Localização</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="location"
                  value={formData.location}
                  onChange={e =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="pl-10"
                  placeholder="Cidade, Estado"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Biografia</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={e => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Conte um pouco sobre você..."
              rows={4}
              className="resize-none"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
