'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { showErrorToast, showSuccessToast } from '@/lib/toast-utils';
import { logger } from '@/lib/logger';
import * as rbacService from '@/services/rbac/rbac.service';
import type {
  AllPermissionsResponse,
  PermissionGroup,
  PermissionItemSimple,
  PermissionWithEffect,
} from '@/types/rbac';
import { CheckCheck, ChevronRight, Loader2, Shield } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

/** Map common actions to PT-BR labels; fallback capitalizes the raw action */
const ACTION_LABELS: Record<string, string> = {
  create: 'Criar',
  read: 'Visualizar',
  update: 'Editar',
  delete: 'Excluir',
  list: 'Listar',
  manage: 'Gerenciar',
  export: 'Exportar',
  import: 'Importar',
  view: 'Visualizar',
  send: 'Enviar',
  approve: 'Aprovar',
  reject: 'Rejeitar',
  cancel: 'Cancelar',
  process: 'Processar',
  generate: 'Gerar',
  assign: 'Atribuir',
  remove: 'Remover',
  configure: 'Configurar',
  scan: 'Escanear',
  register: 'Registrar',
  transfer: 'Transferir',
  print: 'Imprimir',
  upload: 'Upload',
  download: 'Download',
  search: 'Buscar',
  restore: 'Restaurar',
  close: 'Fechar',
  reopen: 'Reabrir',
  complete: 'Completar',
  deliver: 'Entregar',
  return: 'Devolver',
  execute: 'Executar',
  preview: 'Visualizar',
  broadcast: 'Transmitir',
  set: 'Definir',
  pay: 'Pagar',
  release: 'Liberar',
  revoke: 'Revogar',
  terminate: 'Encerrar',
  comment: 'Comentar',
  request: 'Solicitar',
  schedule: 'Agendar',
  adjust: 'Ajustar',
  count: 'Contar',
  bulk: 'Em massa',
};

function getActionLabel(action: string): string {
  if (ACTION_LABELS[action]) return ACTION_LABELS[action];
  // Fallback: capitalize and replace dashes with spaces
  return action.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

interface ManagePermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: PermissionGroup | null;
  onSuccess: () => void;
}

export function ManagePermissionsModal({
  isOpen,
  onClose,
  group,
  onSuccess,
}: ManagePermissionsModalProps) {
  const [allPermissions, setAllPermissions] =
    useState<AllPermissionsResponse | null>(null);
  const [currentCodes, setCurrentCodes] = useState<Set<string>>(new Set());
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [openModules, setOpenModules] = useState<Set<string>>(new Set());

  // All permission codes (for counting)
  const allCodes = useMemo(() => {
    if (!allPermissions) return [];
    return allPermissions.permissions.flatMap(m =>
      Object.values(m.resources).flatMap(r => r.permissions.map(p => p.code))
    );
  }, [allPermissions]);

  // Load data when modal opens
  const loadData = useCallback(async () => {
    if (!group) return;
    setIsLoading(true);
    try {
      const [permissionsResponse, groupPermissions] = await Promise.all([
        rbacService.listAllPermissions(),
        rbacService.listGroupPermissions(group.id),
      ]);

      setAllPermissions(permissionsResponse);

      const codes = new Set(
        groupPermissions.map((p: PermissionWithEffect) => p.code)
      );
      setCurrentCodes(codes);
      setSelectedCodes(new Set(codes));
    } catch (error) {
      logger.error(
        'Erro ao carregar permissões',
        error instanceof Error ? error : undefined
      );
      showErrorToast({
        title: 'Erro ao carregar permissões',
        description: 'Não foi possível carregar as permissões do grupo.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [group]);

  useEffect(() => {
    if (isOpen && group) {
      loadData();
    }
  }, [isOpen, group, loadData]);

  // Toggle all permissions in a module
  const toggleAllInModule = (
    modulePermissions: PermissionItemSimple[],
    allModuleSelected: boolean
  ) => {
    setSelectedCodes(prev => {
      const next = new Set(prev);
      if (allModuleSelected) {
        modulePermissions.forEach(p => next.delete(p.code));
      } else {
        modulePermissions.forEach(p => next.add(p.code));
      }
      return next;
    });
  };

  // Toggle a single permission
  const togglePermission = (code: string) => {
    setSelectedCodes(prev => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  };

  // Toggle all permissions for a resource
  const toggleResource = (permissions: PermissionItemSimple[]) => {
    const codes = permissions.map(p => p.code);
    const allResourceSelected = codes.every(c => selectedCodes.has(c));

    setSelectedCodes(prev => {
      const next = new Set(prev);
      if (allResourceSelected) {
        codes.forEach(c => next.delete(c));
      } else {
        codes.forEach(c => next.add(c));
      }
      return next;
    });
  };

  // Toggle module open/close
  const toggleModule = (module: string) => {
    setOpenModules(prev => {
      const next = new Set(prev);
      if (next.has(module)) {
        next.delete(module);
      } else {
        next.add(module);
      }
      return next;
    });
  };

  // Save changes
  const handleSave = async () => {
    if (!group) return;
    setIsSaving(true);

    try {
      // Compute diff
      const toAdd = [...selectedCodes].filter(c => !currentCodes.has(c));
      const toRemove = [...currentCodes].filter(c => !selectedCodes.has(c));

      // Bulk add
      if (toAdd.length > 0) {
        await rbacService.addPermissionsToGroupBulk(
          group.id,
          toAdd.map(code => ({ permissionCode: code, effect: 'allow' }))
        );
      }

      // Remove one by one
      if (toRemove.length > 0) {
        await Promise.all(
          toRemove.map(code =>
            rbacService.removePermissionFromGroup(group.id, code)
          )
        );
      }

      showSuccessToast('Permissões atualizadas com sucesso');
      onSuccess();
      onClose();
    } catch (error) {
      logger.error(
        'Erro ao salvar permissões',
        error instanceof Error ? error : undefined
      );
      showErrorToast({
        title: 'Erro ao salvar permissões',
        description:
          error instanceof Error ? error.message : 'Erro desconhecido',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges =
    selectedCodes.size !== currentCodes.size ||
    [...selectedCodes].some(c => !currentCodes.has(c));

  if (!group) return null;

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle className="flex items-center gap-3">
            <div
              className={cn(
                'flex items-center justify-center text-white shrink-0 p-2 rounded-lg',
                !group.color && 'bg-linear-to-br from-purple-500 to-pink-600'
              )}
              style={
                group.color
                  ? {
                      background: `linear-gradient(to bottom right, ${group.color}, ${group.color}CC)`,
                    }
                  : undefined
              }
            >
              <Shield className="h-5 w-5" />
            </div>
            {group.name}
          </DialogTitle>
          {!isLoading && (
            <DialogDescription className="tabular-nums">
              {selectedCodes.size} de {allCodes.length} permissões selecionadas
            </DialogDescription>
          )}
        </DialogHeader>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-2">
              {allPermissions?.permissions.map(moduleGroup => {
                const isModuleOpen = openModules.has(moduleGroup.module);
                const resourceEntries = Object.entries(moduleGroup.resources);

                // Count selected in this module
                const allModulePermissions = resourceEntries.flatMap(
                  ([, r]) => r.permissions
                );
                const selectedInModule = allModulePermissions.filter(p =>
                  selectedCodes.has(p.code)
                ).length;
                const allModuleSelected =
                  allModulePermissions.length > 0 &&
                  allModulePermissions.every(p => selectedCodes.has(p.code));

                return (
                  <Collapsible
                    key={moduleGroup.module}
                    open={isModuleOpen}
                    onOpenChange={() => toggleModule(moduleGroup.module)}
                  >
                    <div className="flex items-center rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <CollapsibleTrigger className="flex items-center gap-2 flex-1 px-4 py-3">
                        <ChevronRight
                          className={cn(
                            'h-4 w-4 transition-transform shrink-0',
                            isModuleOpen && 'rotate-90'
                          )}
                        />
                        <span className="font-medium capitalize">
                          {moduleGroup.module}
                        </span>
                      </CollapsibleTrigger>
                      <div className="flex items-center gap-2 pr-2 shrink-0">
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {selectedInModule}/{allModulePermissions.length}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={e => {
                            e.stopPropagation();
                            toggleAllInModule(
                              allModulePermissions,
                              allModuleSelected
                            );
                          }}
                        >
                          <CheckCheck className="h-3.5 w-3.5 mr-1" />
                          {allModuleSelected ? 'Desmarcar' : 'Marcar todos'}
                        </Button>
                      </div>
                    </div>

                    <CollapsibleContent>
                      <div className="pl-6 pt-2 space-y-3">
                        {resourceEntries.map(([resourceKey, resourceGroup]) => {
                          const perms = resourceGroup.permissions;
                          const allResourceSelected = perms.every(p =>
                            selectedCodes.has(p.code)
                          );
                          const someResourceSelected =
                            !allResourceSelected &&
                            perms.some(p => selectedCodes.has(p.code));

                          return (
                            <div key={resourceKey} className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  checked={
                                    allResourceSelected
                                      ? true
                                      : someResourceSelected
                                        ? 'indeterminate'
                                        : false
                                  }
                                  onCheckedChange={() => toggleResource(perms)}
                                  className="h-4 w-4"
                                />
                                <span className="text-sm font-medium capitalize">
                                  {resourceKey}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {resourceGroup.description}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-1 pl-6">
                                {perms.map(perm => (
                                  <label
                                    key={perm.code}
                                    className="flex items-center gap-2 py-1 cursor-pointer hover:bg-muted/30 rounded px-2 -mx-2"
                                  >
                                    <Checkbox
                                      checked={selectedCodes.has(perm.code)}
                                      onCheckedChange={() =>
                                        togglePermission(perm.code)
                                      }
                                      className="h-3.5 w-3.5"
                                    />
                                    <span className="text-sm">
                                      {getActionLabel(perm.action)}
                                    </span>
                                    {perm.isDeprecated && (
                                      <span className="text-xs text-muted-foreground italic">
                                        (deprecated)
                                      </span>
                                    )}
                                  </label>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>
          </div>
        )}

        <DialogFooter className="px-6 py-4 border-t shrink-0 gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
