/**
 * OpenSea OS - Permission Group Edit Page
 * Página de edição de um grupo de permissões
 */

'use client';

import { PageActionBar } from '@/components/layout/page-action-bar';
import {
  PageBody,
  PageHeader,
  PageLayout,
} from '@/components/layout/page-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { logger } from '@/lib/logger';
import { showErrorToast, showSuccessToast } from '@/lib/toast-utils';
import { cn } from '@/lib/utils';
import * as rbacService from '@/services/rbac/rbac.service';
import type { AllPermissionsResponse, PermissionGroup } from '@/types/rbac';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ChevronDown,
  ChevronRight,
  Save,
  Search,
  Shield,
  Settings,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

export default function PermissionGroupEditPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const groupId = params.id as string;

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#DC2626');

  // Permission states
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set()
  );
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set()
  );
  const [searchPermission, setSearchPermission] = useState('');

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const { data: group, isLoading: groupLoading } = useQuery<PermissionGroup>({
    queryKey: ['permission-groups', groupId],
    queryFn: async () => {
      return await rbacService.getPermissionGroupById(groupId);
    },
    enabled: !!groupId,
  });

  const { data: groupPermissions = [] } = useQuery({
    queryKey: ['group-permissions', groupId],
    queryFn: async () => {
      const permissions = await rbacService.listGroupPermissions(groupId);
      return permissions.map(p => p.code);
    },
    enabled: !!groupId,
  });

  const { data: allPermissionsData, isLoading: permissionsLoading } =
    useQuery<AllPermissionsResponse>({
      queryKey: ['all-permissions-structured'],
      queryFn: async () => {
        try {
          return await rbacService.listAllPermissions();
        } catch (error) {
          logger.error(
            'Error fetching all permissions',
            error instanceof Error ? error : undefined
          );
          return { permissions: [], total: 0, modules: [] };
        }
      },
    });

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  useEffect(() => {
    if (group) {
      setName(group.name);
      setDescription(group.description || '');
      setColor(group.color || '#DC2626');
    }
  }, [group?.id, group?.name, group?.description, group?.color]);

  useEffect(() => {
    if (
      groupPermissions.length > 0 ||
      (group && groupPermissions.length === 0)
    ) {
      setSelectedPermissions(new Set(groupPermissions));
    }
  }, [groupPermissions, group?.id]);

  // ============================================================================
  // COMPUTED
  // ============================================================================

  const permissionCodeToId = useMemo(() => {
    const map = new Map<string, string>();
    if (!allPermissionsData?.permissions) return map;

    allPermissionsData.permissions.forEach(moduleData => {
      Object.values(moduleData.resources).forEach(resourceData => {
        resourceData.permissions.forEach(perm => {
          map.set(perm.code, perm.id);
        });
      });
    });

    return map;
  }, [allPermissionsData]);

  const permissionsStructure = useMemo(() => {
    if (!allPermissionsData?.permissions) return [];

    return allPermissionsData.permissions
      .map(moduleData => {
        const filteredResources = Object.entries(moduleData.resources)
          .map(([resourceName, resourceData]) => {
            const filteredPermissions = resourceData.permissions.filter(
              perm => {
                if (!searchPermission) return true;
                const search = searchPermission.toLowerCase();
                return (
                  perm.name.toLowerCase().includes(search) ||
                  perm.code.toLowerCase().includes(search) ||
                  perm.action.toLowerCase().includes(search)
                );
              }
            );

            if (filteredPermissions.length === 0) return null;

            return {
              name: resourceName,
              description: resourceData.description,
              permissions: filteredPermissions.map(perm => ({
                ...perm,
                isActive: selectedPermissions.has(perm.code),
              })),
            };
          })
          .filter((r): r is NonNullable<typeof r> => r !== null);

        return {
          module: moduleData.module,
          description: moduleData.description,
          resources: filteredResources,
        };
      })
      .filter(module => module.resources.length > 0);
  }, [allPermissionsData, selectedPermissions, searchPermission]);

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  const updateMutation = useMutation({
    mutationFn: async () => {
      // 1. Atualizar dados do grupo
      await rbacService.updatePermissionGroup(groupId, {
        name,
        description: description || null,
        color,
      });

      // 2. Atualizar permissões
      const currentPermissions = new Set(groupPermissions);
      const permissionsToAdd = Array.from(selectedPermissions).filter(
        code => !currentPermissions.has(code)
      );
      const permissionsToRemove = Array.from(currentPermissions).filter(
        code => !selectedPermissions.has(code)
      );

      // Adicionar novas permissões em bulk
      if (permissionsToAdd.length > 0) {
        for (const permissionCode of permissionsToAdd) {
          const parts = permissionCode.split('.');
          if (parts.length < 1 || parts.length > 4) {
            throw new Error(
              `Código de permissão inválido: "${permissionCode}"`
            );
          }
        }

        const chunkSize = 500;
        for (let i = 0; i < permissionsToAdd.length; i += chunkSize) {
          const chunk = permissionsToAdd.slice(i, i + chunkSize);
          await rbacService.addPermissionsToGroupBulk(
            groupId,
            chunk.map(code => ({ permissionCode: code, effect: 'allow' }))
          );
        }
      }

      // Remover permissões
      for (const permissionCode of permissionsToRemove) {
        const permissionId = permissionCodeToId.get(permissionCode);
        if (!permissionId) {
          throw new Error(
            `ID da permissão não encontrado para: "${permissionCode}"`
          );
        }
        await rbacService.removePermissionFromGroup(groupId, permissionId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['permission-groups', groupId],
      });
      queryClient.invalidateQueries({
        queryKey: ['permission-group-details', groupId],
      });
      queryClient.invalidateQueries({
        queryKey: ['group-permissions', groupId],
      });
      showSuccessToast('Grupo atualizado com sucesso');
      router.push(`/admin/permission-groups/${groupId}`);
    },
    onError: error => {
      showErrorToast({
        title: 'Erro ao atualizar grupo',
        description:
          error instanceof Error ? error.message : 'Erro desconhecido',
      });
    },
  });

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSubmit = () => {
    updateMutation.mutate();
  };

  const handleToggleModule = (module: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(module)) {
        next.delete(module);
      } else {
        next.add(module);
      }
      return next;
    });
  };

  const handleTogglePermission = useCallback(
    (permissionCode: string, isChecked: boolean) => {
      const parts = permissionCode.split('.');
      if (parts.length < 3) {
        showErrorToast({
          title: 'Código de permissão inválido',
          description: `"${permissionCode}" não segue o formato module.resource.action`,
        });
        return;
      }

      setSelectedPermissions(prev => {
        const next = new Set(prev);
        if (isChecked) {
          next.add(permissionCode);
        } else {
          next.delete(permissionCode);
        }
        return next;
      });
    },
    []
  );

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (groupLoading || permissionsLoading) {
    return (
      <PageLayout>
        <PageHeader>
          <Skeleton className="h-9 w-72" />
          <Skeleton className="h-24 w-full" />
        </PageHeader>
        <PageBody>
          <Skeleton className="h-96 w-full" />
        </PageBody>
      </PageLayout>
    );
  }

  if (!group) {
    return (
      <PageLayout>
        <PageBody>
          <Card className="bg-white/5 p-12 text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">
              Grupo não encontrado
            </h2>
            <p className="text-muted-foreground mb-6">
              O grupo de permissões que você está procurando não existe ou foi
              removido.
            </p>
            <Button onClick={() => router.push('/admin/permission-groups')}>
              Voltar para Grupos
            </Button>
          </Card>
        </PageBody>
      </PageLayout>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <PageLayout>
      <PageHeader>
        <PageActionBar
          breadcrumbItems={[
            { label: 'Administração', href: '/admin' },
            {
              label: 'Grupos de Permissões',
              href: '/admin/permission-groups',
            },
            {
              label: group.name,
              href: `/admin/permission-groups/${groupId}`,
            },
            { label: 'Editar' },
          ]}
          buttons={[
            {
              id: 'save',
              title: updateMutation.isPending ? 'Salvando...' : 'Salvar',
              icon: Save,
              onClick: handleSubmit,
            },
          ]}
        />

        {/* Title Card */}
        <Card className="bg-white/5 p-5">
          <div className="flex items-start gap-5">
            <div
              className={cn(
                'flex h-14 w-14 items-center justify-center rounded-xl shrink-0',
                !color && 'bg-linear-to-br from-purple-500 to-pink-600'
              )}
              style={
                color
                  ? {
                      background: `linear-gradient(to bottom right, ${color}, ${color}CC)`,
                    }
                  : undefined
              }
            >
              <Shield className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold tracking-tight">
                Editar {group.name}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                As alterações neste grupo afetam {group.usersCount ?? 0} usuário
                {(group.usersCount ?? 0) !== 1 ? 's' : ''}.
              </p>
            </div>
          </div>
        </Card>
      </PageHeader>

      <PageBody>
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-10 mb-4">
            <TabsTrigger value="info" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Informações
            </TabsTrigger>
            <TabsTrigger
              value="permissions"
              className="flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              Permissões ({selectedPermissions.size})
            </TabsTrigger>
          </TabsList>

          {/* Tab: Informações */}
          <TabsContent value="info" className="space-y-4">
            <Card className="bg-white/5 p-6 w-full space-y-6">
              {/* Nome + Cor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Grupo *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ex: Administrador"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Cor do Grupo</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      id="color"
                      type="color"
                      value={color}
                      onChange={e => setColor(e.target.value)}
                      className="w-12 h-9 cursor-pointer p-0.5"
                    />
                    <Input
                      type="text"
                      value={color}
                      onChange={e => setColor(e.target.value)}
                      placeholder="#DC2626"
                      className="font-mono text-xs flex-1"
                    />
                  </div>
                </div>
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Descreva as responsabilidades deste grupo..."
                  rows={3}
                />
              </div>
            </Card>
          </TabsContent>

          {/* Tab: Permissões */}
          <TabsContent value="permissions" className="space-y-4">
            <Card className="bg-white/5 p-6 w-full space-y-4">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Permissões do Grupo
                </h3>
                <p className="text-sm text-muted-foreground">
                  Marque as permissões que deseja atribuir a este grupo.
                </p>
              </div>

              {/* Buscar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar permissão..."
                  value={searchPermission}
                  onChange={e => setSearchPermission(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Lista de Permissões */}
              {permissionsStructure.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhuma permissão encontrada</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {permissionsStructure.map(moduleGroup => (
                    <div
                      key={moduleGroup.module}
                      className="border rounded-lg overflow-hidden bg-linear-to-r from-slate-100 dark:from-slate-800 to-transparent"
                    >
                      {/* Cabeçalho do Módulo */}
                      <div
                        className="flex items-center justify-between px-3 py-2.5 cursor-pointer hover:bg-muted/30 transition-colors"
                        onClick={() => handleToggleModule(moduleGroup.module)}
                      >
                        <div className="flex items-center gap-2">
                          {expandedModules.has(moduleGroup.module) ? (
                            <ChevronDown className="h-4 w-4 shrink-0" />
                          ) : (
                            <ChevronRight className="h-4 w-4 shrink-0" />
                          )}
                          <span className="font-semibold text-sm capitalize">
                            {moduleGroup.module}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="secondary" className="text-xs">
                            {moduleGroup.resources.reduce(
                              (acc, res) =>
                                acc +
                                res.permissions.filter(p => p.isActive).length,
                              0
                            )}
                            /
                            {moduleGroup.resources.reduce(
                              (acc, res) => acc + res.permissions.length,
                              0
                            )}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-7"
                            onClick={e => {
                              e.stopPropagation();
                              const allPerms = moduleGroup.resources.flatMap(
                                r => r.permissions
                              );
                              const allActive = allPerms.every(p => p.isActive);
                              allPerms.forEach(perm =>
                                handleTogglePermission(perm.code, !allActive)
                              );
                            }}
                          >
                            {moduleGroup.resources
                              .flatMap(r => r.permissions)
                              .every(p => p.isActive)
                              ? 'Desmarcar'
                              : 'Marcar Todos'}
                          </Button>
                        </div>
                      </div>

                      {/* Conteúdo do Módulo */}
                      {expandedModules.has(moduleGroup.module) && (
                        <div className="border-t divide-y">
                          {moduleGroup.resources.map(resource => (
                            <div key={resource.name}>
                              {/* Cabeçalho do Recurso */}
                              <div className="flex justify-between items-center bg-muted/30 px-4 py-2 border-b">
                                <div>
                                  <h4 className="font-medium text-sm capitalize">
                                    {resource.name}
                                  </h4>
                                  {resource.description && (
                                    <p className="text-xs text-muted-foreground">
                                      {resource.description}
                                    </p>
                                  )}
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs"
                                  onClick={() => {
                                    const allActive =
                                      resource.permissions.every(
                                        p => p.isActive
                                      );
                                    resource.permissions.forEach(perm =>
                                      handleTogglePermission(
                                        perm.code,
                                        !allActive
                                      )
                                    );
                                  }}
                                >
                                  {resource.permissions.every(p => p.isActive)
                                    ? 'Desmarcar'
                                    : 'Marcar Todos'}
                                </Button>
                              </div>

                              {/* Grid de Permissões */}
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 p-3">
                                {resource.permissions.map(perm => (
                                  <div
                                    key={perm.id}
                                    className={cn(
                                      'flex items-center gap-2 p-2 rounded-lg transition-colors border',
                                      perm.isActive
                                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-600/20'
                                        : 'border-slate-200 dark:border-slate-600 bg-slate-600/20'
                                    )}
                                  >
                                    <Checkbox
                                      id={perm.id}
                                      checked={perm.isActive}
                                      onCheckedChange={checked =>
                                        handleTogglePermission(
                                          perm.code,
                                          checked as boolean
                                        )
                                      }
                                      disabled={perm.isDeprecated}
                                    />
                                    <label
                                      htmlFor={perm.id}
                                      className="flex-1 text-xs cursor-pointer"
                                    >
                                      <p
                                        className={cn(
                                          'font-medium',
                                          perm.isActive &&
                                            'text-emerald-700 dark:text-emerald-400'
                                        )}
                                      >
                                        {perm.name}
                                        {perm.isDeprecated && (
                                          <Badge
                                            variant="outline"
                                            className="text-xs ml-1"
                                          >
                                            deprecated
                                          </Badge>
                                        )}
                                      </p>
                                      <p className="text-xs text-muted-foreground font-mono">
                                        {perm.action}
                                      </p>
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </PageBody>
    </PageLayout>
  );
}
