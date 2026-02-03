'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { showErrorToast, showSuccessToast } from '@/lib/toast-utils';
import { cn } from '@/lib/utils';
import * as rbacService from '@/services/rbac/rbac.service';
import type { AllPermissionsResponse, PermissionGroup } from '@/types/rbac';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Save,
  Shield,
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
  const [priority, setPriority] = useState(100);

  // Permission states
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set()
  );
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set()
  );
  const [searchPermission, setSearchPermission] = useState('');

  // Query: Get group details
  const { data: group, isLoading: groupLoading } = useQuery<PermissionGroup>({
    queryKey: ['permission-groups', groupId],
    queryFn: async () => {
      return await rbacService.getPermissionGroupById(groupId);
    },
    enabled: !!groupId,
  });

  // Query: Get group permissions (codes only)
  const { data: groupPermissions = [] } = useQuery({
    queryKey: ['group-permissions', groupId],
    queryFn: async () => {
      const permissions = await rbacService.listGroupPermissions(groupId);
      const codes = permissions.map(p => p.code);
      console.log('📋 Group permissions loaded:', {
        permissionsCount: permissions.length,
        codes,
        firstPermission: permissions[0],
      });
      return codes;
    },
    enabled: !!groupId,
  });

  // Query: Get all available permissions
  const { data: allPermissionsData, isLoading: permissionsLoading } =
    useQuery<AllPermissionsResponse>({
      queryKey: ['all-permissions-structured'],
      queryFn: async () => {
        try {
          const result = await rbacService.listAllPermissions();
          return result;
        } catch (error) {
          console.error('❌ Error fetching all permissions:', error);
          return {
            permissions: [],
            total: 0,
            modules: [],
          };
        }
      },
    });

  // Initialize form when group data loads
  useEffect(() => {
    if (group) {
      setName(group.name);
      setDescription(group.description || '');
      setColor(group.color || '#DC2626');
      setPriority(group.priority);
    }
  }, [
    group?.id,
    group?.name,
    group?.description,
    group?.color,
    group?.priority,
  ]);

  // Initialize selected permissions when group permissions load
  useEffect(() => {
    if (
      groupPermissions.length > 0 ||
      (group && groupPermissions.length === 0)
    ) {
      setSelectedPermissions(new Set(groupPermissions));
    }
  }, [groupPermissions, group?.id]);

  // Build permission code to ID map
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

  // Build filtered permissions structure
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

  // Mutation: Update group details and permissions
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

      console.log('🔍 Permissions to add:', permissionsToAdd);
      console.log('🔍 Permissions to remove:', permissionsToRemove);

      // Adicionar novas permissões em bulk (até 500 por requisição)
      if (permissionsToAdd.length > 0) {
        console.log(
          `📦 Adding ${permissionsToAdd.length} permissions in bulk...`
        );

        // Validar formato de cada permissão
        for (const permissionCode of permissionsToAdd) {
          const parts = permissionCode.split('.');
          if (parts.length < 1 || parts.length > 4) {
            console.error('❌ Invalid permission code format:', permissionCode);
            throw new Error(
              `Código de permissão inválido: "${permissionCode}". Formato esperado: 1-4 partes separadas por ponto (ex: stock, stock.locations, stock.products.create, hr.employees.list.all)`
            );
          }
        }

        // Dividir em chunks de até 500 permissões
        const chunkSize = 500;
        for (let i = 0; i < permissionsToAdd.length; i += chunkSize) {
          const chunk = permissionsToAdd.slice(i, i + chunkSize);
          const permissionsData = chunk.map(code => ({
            permissionCode: code,
            effect: 'allow' as const,
          }));

          console.log(
            `🚀 Sending chunk ${i / chunkSize + 1} with ${permissionsData.length} permissions`
          );
          const result = await rbacService.addPermissionsToGroupBulk(
            groupId,
            permissionsData
          );
          console.log(`✅ Chunk result:`, result);
        }
      }

      // Remover permissões
      for (const permissionCode of permissionsToRemove) {
        // Converter código para ID
        const permissionId = permissionCodeToId.get(permissionCode);
        if (!permissionId) {
          console.error('❌ Permission ID not found for code:', permissionCode);
          throw new Error(
            `ID da permissão não encontrado para: "${permissionCode}"`
          );
        }

        console.log('➖ Removing permission:', {
          permissionCode,
          permissionId,
        });
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

  // Handlers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  const handleBack = () => {
    router.push(`/admin/permission-groups/${groupId}`);
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
      console.log('🔄 Toggle permission:', { permissionCode, isChecked });

      // Validar formato antes de adicionar
      const parts = permissionCode.split('.');
      if (parts.length < 3) {
        console.error('❌ Invalid permission code format:', permissionCode);
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

  // Loading state
  if (groupLoading || permissionsLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // Not found state
  if (!group) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-12 text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-2">Grupo não encontrado</h2>
          <p className="text-muted-foreground mb-6">
            O grupo de permissões que você está procurando não existe ou foi
            removido.
          </p>
          <Button onClick={() => router.push('/admin/permission-groups')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Grupos
          </Button>
        </Card>
      </div>
    );
  }

  // System group protection
  // if (group.isSystem) {
  //   return (
  //     <div className="container mx-auto p-6">
  //       <Card className="p-12 text-center">
  //         <Shield className="w-16 h-16 mx-auto mb-4 text-amber-500" />
  //         <h2 className="text-2xl font-semibold mb-2">
  //           Grupo de Sistema Protegido
  //         </h2>
  //         <p className="text-muted-foreground mb-6">
  //           Este é um grupo de sistema e não pode ser editado.
  //         </p>
  //         <Button onClick={handleBack}>
  //           <ArrowLeft className="mr-2 h-4 w-4" />
  //           Voltar aos Detalhes
  //         </Button>
  //       </Card>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen from-purple-50 via-gray-50 to-pink-50 dark:from-gray-900 dark:via-slate-900 dark:to-slate-800 px-6 py-6">
      <div className=" mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar aos Detalhes
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name || updateMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {updateMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>

        {/* Title Section */}
        <div className="flex items-center gap-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-lg"
            style={{ backgroundColor: color }}
          >
            <Shield className="h-7 w-7 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">
              Editar Grupo de Permissões
            </h1>
            <p className="text-muted-foreground text-sm">{group.slug}</p>
          </div>
          <Badge variant="secondary">
            Sistema: {group.isSystem ? 'Sim' : 'Não'}
          </Badge>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Informações do Grupo</TabsTrigger>
            <TabsTrigger value="permissions">
              Permissões ({Array.from(selectedPermissions).length})
            </TabsTrigger>
          </TabsList>

          {/* Tab: Informações do Grupo */}
          <TabsContent value="info" className="space-y-6">
            <Card className="p-6 space-y-6 w-full">
              <div className="space-y-4">
                {/* Name */}
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

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Descreva as responsabilidades..."
                    rows={3}
                  />
                </div>

                {/* Color */}
                <div className="space-y-2">
                  <Label htmlFor="color">Cor do Grupo</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      id="color"
                      type="color"
                      value={color}
                      onChange={e => setColor(e.target.value)}
                      className="w-20 h-10 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={color}
                      onChange={e => setColor(e.target.value)}
                      placeholder="#DC2626"
                      className="font-mono text-xs"
                    />
                    <div
                      className="w-10 h-10 rounded border"
                      style={{ backgroundColor: color }}
                    />
                  </div>
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridade</Label>
                  <Input
                    id="priority"
                    type="number"
                    value={priority}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Não pode ser alterada
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Tab: Permissões */}
          <TabsContent value="permissions" className="space-y-6">
            <Card className="p-6 space-y-4 w-full">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Permissões do Grupo
                </h3>
                <p className="text-sm text-muted-foreground">
                  Marque as permissões que deseja atribuir a este grupo
                </p>
              </div>

              {/* Search Input */}
              <div className="relative  bg-slate-700 rounded-md">
                <input
                  type="text"
                  placeholder="Buscar permissão..."
                  value={searchPermission}
                  onChange={e => setSearchPermission(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md text-sm"
                />
              </div>

              {/* Permissions List */}
              {permissionsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : permissionsStructure.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhuma permissão encontrada</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {permissionsStructure.map(moduleGroup => (
                    <div
                      key={moduleGroup.module}
                      className="border rounded-lg overflow-hidden"
                    >
                      {/* Module Header */}
                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900">
                        <button
                          type="button"
                          onClick={() => handleToggleModule(moduleGroup.module)}
                          className="flex items-center gap-2 text-left flex-1 hover:bg-muted/50 transition-colors rounded-md p-1 -m-1"
                        >
                          {expandedModules.has(moduleGroup.module) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                          <div>
                            <span className="font-semibold text-sm capitalize">
                              {moduleGroup.module}
                            </span>
                            {moduleGroup.description && (
                              <p className="text-xs text-muted-foreground">
                                {moduleGroup.description}
                              </p>
                            )}
                          </div>
                        </button>
                        <div className="flex items-center gap-2">
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
                              const allPermissionsInModule =
                                moduleGroup.resources.flatMap(
                                  r => r.permissions
                                );
                              const allActive = allPermissionsInModule.every(
                                p => p.isActive
                              );
                              allPermissionsInModule.forEach(perm =>
                                handleTogglePermission(perm.code, !allActive)
                              );
                            }}
                          >
                            {moduleGroup.resources
                              .flatMap(r => r.permissions)
                              .every(p => p.isActive)
                              ? 'Desmarcar Módulo'
                              : 'Marcar Módulo'}
                          </Button>
                        </div>
                      </div>

                      {/* Module Content */}
                      {expandedModules.has(moduleGroup.module) && (
                        <div className="border-t divide-y">
                          {moduleGroup.resources.map(resource => (
                            <div key={resource.name}>
                              {/* Resource Header */}
                              <div className="flex justify-between items-center bg-muted/30 px-4 py-2 border-b bg-slate-700 dark:bg-slate-800">
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
                                    ? 'Desmarcar Todos'
                                    : 'Marcar Todos'}
                                </Button>
                              </div>

                              {/* Permissions Grid */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-3">
                                {resource.permissions.map(perm => (
                                  <div
                                    key={perm.id}
                                    className={cn(
                                      'flex items-center gap-2 p-2 rounded-lg transition-colors border',
                                      perm.isActive
                                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-600/20'
                                        : 'border-slate-200 dark:border-slate-600'
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
      </div>
    </div>
  );
}
