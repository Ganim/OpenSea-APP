'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import * as rbacService from '@/services/rbac/rbac.service';
import type {
    PermissionGroup,
    PermissionWithEffect,
    UserInGroup,
} from '@/types/rbac';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Shield, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function PermissionGroupsPage() {
  const [groups, setGroups] = useState<PermissionGroup[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<PermissionGroup[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isManagePermissionsOpen, setIsManagePermissionsOpen] = useState(false);
  const [selectedGroupForPermissions, setSelectedGroupForPermissions] =
    useState<PermissionGroup | null>(null);

  useEffect(() => {
    const loadGroups = async () => {
      try {
        console.log('[PermissionGroups] Carregando grupos...');
        const response = await rbacService.listPermissionGroups();
        console.log('[PermissionGroups] Resposta da API:', response);
        
        // A API pode retornar { data: [...] } ou diretamente um array ou { groups: [...] }
        let groupsData: PermissionGroup[] = [];
        const rawResponse = response as unknown as Record<string, unknown>;
        
        if (Array.isArray(response)) {
          groupsData = response;
        } else if (response?.data && Array.isArray(response.data)) {
          groupsData = response.data;
        } else if (rawResponse?.groups && Array.isArray(rawResponse.groups)) {
          // Caso o backend retorne { groups: [...] }
          groupsData = rawResponse.groups as PermissionGroup[];
        }
        
        console.log('[PermissionGroups] Grupos processados:', groupsData);
        setGroups(groupsData);
        setFilteredGroups(groupsData);
      } catch (error) {
        console.error('[PermissionGroups] Erro ao carregar grupos:', error);
        setGroups([]);
        setFilteredGroups([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadGroups();
  }, []);

  useEffect(() => {
    const q = searchQuery.toLowerCase();
    const filtered = (groups ?? []).filter(
      group =>
        group.name?.toLowerCase().includes(q) ||
        group.slug?.toLowerCase().includes(q) ||
        group.description?.toLowerCase().includes(q)
    );
    setFilteredGroups(filtered);
  }, [searchQuery, groups]);

  const handleManagePermissions = (group: PermissionGroup) => {
    setSelectedGroupForPermissions(group);
    setIsManagePermissionsOpen(true);
  };

  const { data: groupPermissions = [] } = useQuery<PermissionWithEffect[]>({
    queryKey: ['group-permissions', selectedGroupForPermissions?.id],
    queryFn: () =>
      selectedGroupForPermissions
        ? rbacService.listGroupPermissions(selectedGroupForPermissions.id)
        : Promise.resolve([]),
    enabled: !!selectedGroupForPermissions,
  });

  const { data: groupUsers = [] } = useQuery<UserInGroup[]>({
    queryKey: ['group-users', selectedGroupForPermissions?.id],
    queryFn: () =>
      selectedGroupForPermissions
        ? rbacService.listUsersByGroup(selectedGroupForPermissions.id)
        : Promise.resolve([]),
    enabled: !!selectedGroupForPermissions,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-linear-to-br from-purple-500 to-pink-600">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Grupos de Permissões</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie grupos e suas permissões
            </p>
          </div>
        </div>

        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Grupo
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar grupos por nome ou descrição..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {(filteredGroups ?? []).length > 0 ? (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {(filteredGroups ?? []).map(group => (
              <Card key={group.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{group.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {group.slug}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      Prioridade: {group.priority}
                    </Badge>
                  </div>

                  {group.description && (
                    <p className="text-sm text-muted-foreground">
                      {group.description}
                    </p>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => handleManagePermissions(group)}
                  >
                    <Shield className="mr-2 h-3 w-3" />
                    Gerenciar Permissões
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 rounded-lg border border-dashed">
            <p className="text-muted-foreground">
              {isLoading ? 'Carregando grupos...' : 'Nenhum grupo encontrado'}
            </p>
          </div>
        )}
      </div>

      <Dialog
        open={isManagePermissionsOpen}
        onOpenChange={setIsManagePermissionsOpen}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Gerenciar Permissões - {selectedGroupForPermissions?.name}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="permissions" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="permissions">
                Permissões ({groupPermissions.length})
              </TabsTrigger>
              <TabsTrigger value="users">
                Usuários ({groupUsers.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="permissions" className="space-y-4">
              {groupPermissions.length > 0 ? (
                <div className="space-y-2">
                  {groupPermissions.map(perm => (
                    <div
                      key={perm.id}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div>
                        <p className="font-medium">{perm.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {perm.description}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {perm.effect === 'allow' ? '✓' : '✗'}{' '}
                        {perm.effect.toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhuma permissão atribuída
                </p>
              )}
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              {groupUsers.length > 0 ? (
                <div className="space-y-2">
                  {groupUsers.map(user => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div>
                        <p className="font-medium">{user.username}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhum usuário neste grupo
                </p>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsManagePermissionsOpen(false)}
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
