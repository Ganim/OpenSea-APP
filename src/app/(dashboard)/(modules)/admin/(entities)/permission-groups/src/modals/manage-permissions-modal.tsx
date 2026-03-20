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
  PermissionWithEffect,
} from '@/types/rbac';
import { ChevronRight, Loader2, Shield } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  MATRIX_TABS,
  STANDARD_ACTIONS,
  mapActionToStandard,
  type StandardAction,
} from '../config/permission-matrix-config';
import { ModuleTabList } from '../components/module-tab-list';
import {
  PermissionMatrixTable,
  type ResourcePermissionMap,
} from '../components/permission-matrix-table';

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
  const [activeTab, setActiveTab] = useState(MATRIX_TABS[0].id);
  const [showUnmapped, setShowUnmapped] = useState(false);

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

  // ---------------------------------------------------------------------------
  // Build permission maps for matrix
  // ---------------------------------------------------------------------------

  const { permissionMaps, selectedCounts, totalCounts, unmappedCodes } =
    useMemo(() => {
      if (!allPermissions)
        return {
          permissionMaps: {} as Record<string, ResourcePermissionMap[]>,
          selectedCounts: {} as Record<string, number>,
          totalCounts: {} as Record<string, number>,
          unmappedCodes: [] as string[],
        };

    // Build a map: "module.resource" → { action → Set<code> }
    const codesByBackendResource = new Map<string, Map<string, Set<string>>>();

    for (const moduleGroup of allPermissions.permissions) {
      const moduleLower = moduleGroup.module.toLowerCase();
      for (const [resourceKey, resourceGroup] of Object.entries(
        moduleGroup.resources
      )) {
        const backendKey = `${moduleLower}.${resourceKey}`;
        if (!codesByBackendResource.has(backendKey)) {
          codesByBackendResource.set(backendKey, new Map());
        }
        const actionMap = codesByBackendResource.get(backendKey)!;
        for (const perm of resourceGroup.permissions) {
          const standardAction = mapActionToStandard(perm.action);
          if (!actionMap.has(standardAction)) {
            actionMap.set(standardAction, new Set());
          }
          actionMap.get(standardAction)!.add(perm.code);
        }
      }
    }

    // For each tab, build ResourcePermissionMap[] and counts
    const allPermMaps: Record<string, ResourcePermissionMap[]> = {};
    const selCounts: Record<string, number> = {};
    const totCounts: Record<string, number> = {};

    for (const tab of MATRIX_TABS) {
      const maps: ResourcePermissionMap[] = [];
      let tabTotal = 0;
      let tabSelected = 0;

      tab.resources.forEach((resource, idx) => {
        const actionCodes = {} as Record<StandardAction, Set<string>>;
        for (const action of STANDARD_ACTIONS) {
          actionCodes[action] = new Set();
        }

        // Collect codes from all backend resources mapped to this visual resource
        for (const br of resource.backendResources) {
          const actionMap = codesByBackendResource.get(br);
          if (!actionMap) continue;
          for (const [action, codes] of actionMap) {
            const stdAction = action as StandardAction;
            for (const code of codes) {
              actionCodes[stdAction].add(code);
            }
          }
        }

        // Count totals
        let resourceTotal = 0;
        let resourceSelected = 0;
        for (const action of resource.availableActions) {
          for (const code of actionCodes[action]) {
            resourceTotal++;
            if (selectedCodes.has(code)) resourceSelected++;
          }
        }
        tabTotal += resourceTotal;
        tabSelected += resourceSelected;

        maps.push({ resourceIndex: idx, actionCodes });
      });

      allPermMaps[tab.id] = maps;
      selCounts[tab.id] = tabSelected;
      totCounts[tab.id] = tabTotal;
    }

    // Collect all mapped codes across all tabs
    const mappedCodes = new Set<string>();
    for (const tab of MATRIX_TABS) {
      const maps = allPermMaps[tab.id];
      if (!maps) continue;
      for (const pm of maps) {
        const resource = tab.resources[pm.resourceIndex];
        for (const action of resource.availableActions) {
          for (const code of pm.actionCodes[action]) {
            mappedCodes.add(code);
          }
        }
      }
    }

    // Collect all API codes and find unmapped ones
    const allApiCodes: string[] = [];
    for (const moduleGroup of allPermissions.permissions) {
      for (const [, resourceGroup] of Object.entries(moduleGroup.resources)) {
        for (const perm of resourceGroup.permissions) {
          allApiCodes.push(perm.code);
        }
      }
    }

    const unmapped = allApiCodes.filter(c => !mappedCodes.has(c));

    return {
      permissionMaps: allPermMaps,
      selectedCounts: selCounts,
      totalCounts: totCounts,
      unmappedCodes: unmapped,
    };
  }, [allPermissions, selectedCodes]);

  // ---------------------------------------------------------------------------
  // Derived values
  // ---------------------------------------------------------------------------

  const allCodesCount = useMemo(() => {
    return (
      Object.values(totalCounts).reduce((sum, n) => sum + n, 0) +
      unmappedCodes.length
    );
  }, [totalCounts, unmappedCodes]);

  const activeTabConfig = useMemo(
    () => MATRIX_TABS.find(t => t.id === activeTab),
    [activeTab]
  );

  // ---------------------------------------------------------------------------
  // Toggle handlers
  // ---------------------------------------------------------------------------

  const handleToggleCodes = useCallback(
    (codes: string[], forceState?: boolean) => {
      setSelectedCodes(prev => {
        const next = new Set(prev);
        if (forceState === true) {
          codes.forEach(c => next.add(c));
        } else if (forceState === false) {
          codes.forEach(c => next.delete(c));
        } else {
          // Toggle: if all selected, deselect; otherwise select all
          const allSelected = codes.every(c => next.has(c));
          if (allSelected) {
            codes.forEach(c => next.delete(c));
          } else {
            codes.forEach(c => next.add(c));
          }
        }
        return next;
      });
    },
    []
  );

  const handleToggleCode = useCallback((code: string) => {
    setSelectedCodes(prev => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }, []);

  // ---------------------------------------------------------------------------
  // Tab-level select all / clear all
  // ---------------------------------------------------------------------------

  const handleSelectAllInTab = useCallback(() => {
    const maps = permissionMaps[activeTab];
    if (!maps) return;
    const tab = MATRIX_TABS.find(t => t.id === activeTab);
    if (!tab) return;
    const codes: string[] = [];
    maps.forEach(pm => {
      const resource = tab.resources[pm.resourceIndex];
      for (const action of resource.availableActions) {
        pm.actionCodes[action].forEach(c => codes.push(c));
      }
    });
    handleToggleCodes(codes, true);
  }, [activeTab, permissionMaps, handleToggleCodes]);

  const handleClearAllInTab = useCallback(() => {
    const maps = permissionMaps[activeTab];
    if (!maps) return;
    const tab = MATRIX_TABS.find(t => t.id === activeTab);
    if (!tab) return;
    const codes: string[] = [];
    maps.forEach(pm => {
      const resource = tab.resources[pm.resourceIndex];
      for (const action of resource.availableActions) {
        pm.actionCodes[action].forEach(c => codes.push(c));
      }
    });
    handleToggleCodes(codes, false);
  }, [activeTab, permissionMaps, handleToggleCodes]);

  // ---------------------------------------------------------------------------
  // Save changes (diff-based)
  // ---------------------------------------------------------------------------

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
      <DialogContent className="max-w-6xl h-[85vh] flex flex-col p-0">
        {/* Header */}
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
              {selectedCodes.size} de {allCodesCount} permissões selecionadas
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Body */}
        {isLoading ? (
          <div className="flex-1 flex overflow-hidden">
            {/* Skeleton left sidebar */}
            <div className="w-[52px] sm:w-[180px] shrink-0 border-r border-border py-4 pl-4 pr-3 space-y-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2.5 rounded-lg px-3 py-2.5">
                  <div className="h-4 w-4 rounded bg-muted animate-pulse" />
                  <div className="flex-1 space-y-1 hidden sm:block">
                    <div className="h-3.5 w-20 rounded bg-muted animate-pulse" />
                    <div className="h-2.5 w-10 rounded bg-muted animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
            {/* Skeleton right area */}
            <div className="flex-1 py-4 pr-4 space-y-3 px-3">
              {/* Header skeleton */}
              <div className="space-y-1 pb-3">
                <div className="h-5 w-32 rounded bg-muted animate-pulse" />
                <div className="h-3.5 w-48 rounded bg-muted animate-pulse" />
              </div>
              {/* Table header skeleton */}
              <div className="flex gap-1 pb-2">
                <div className="h-3 w-[220px] rounded bg-muted animate-pulse" />
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-3 w-[72px] rounded bg-muted animate-pulse" />
                ))}
              </div>
              {/* Table rows skeleton */}
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-1 py-1.5">
                  <div className="h-4 w-[220px] rounded bg-muted animate-pulse" />
                  {Array.from({ length: 8 }).map((_, j) => (
                    <div key={j} className="h-4 w-[72px] flex items-center justify-center">
                      <div className="h-4 w-4 rounded bg-muted animate-pulse" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            {/* Left: Module tabs */}
            <div className="py-4 pl-4">
              <ModuleTabList
                tabs={MATRIX_TABS}
                activeTabId={activeTab}
                onTabChange={setActiveTab}
                selectedCounts={selectedCounts}
                totalCounts={totalCounts}
              />
            </div>

            {/* Right: Matrix */}
            <div className="flex-1 flex flex-col overflow-hidden py-4 pr-4">
              {/* Right panel header */}
              <div className="flex items-center justify-between px-3 pb-3 shrink-0">
                <div>
                  <h3 className="text-base font-semibold">
                    {activeTabConfig?.label}
                  </h3>
                  <p className="text-sm text-muted-foreground tabular-nums">
                    {selectedCounts[activeTab] ?? 0} de{' '}
                    {totalCounts[activeTab] ?? 0} permissões ativas neste módulo
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAllInTab}
                  >
                    Selecionar tudo
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearAllInTab}
                  >
                    Limpar tudo
                  </Button>
                </div>
              </div>

              {/* Table */}
              <div className="flex-1 overflow-y-auto">
                <PermissionMatrixTable
                  resources={activeTabConfig?.resources ?? []}
                  permissionMaps={permissionMaps[activeTab] ?? []}
                  selectedCodes={selectedCodes}
                  onToggleCode={handleToggleCode}
                  onToggleCodes={handleToggleCodes}
                />

                {/* Unmapped permissions overflow */}
                {unmappedCodes.length > 0 && (
                  <div className="mt-3 border-t border-border pt-3">
                    <Collapsible
                      open={showUnmapped}
                      onOpenChange={setShowUnmapped}
                    >
                      <CollapsibleTrigger className="flex items-center gap-2 w-full px-3 py-2 text-sm text-muted-foreground hover:bg-muted/30 rounded-lg transition-colors">
                        <ChevronRight
                          className={cn(
                            'h-4 w-4 transition-transform',
                            showUnmapped && 'rotate-90'
                          )}
                        />
                        Outras permissões ({unmappedCodes.length})
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="grid grid-cols-2 gap-1 px-3 py-2">
                          {unmappedCodes.map(code => (
                            <label
                              key={code}
                              className="flex items-center gap-2 py-1 px-2 rounded hover:bg-muted/30 cursor-pointer text-sm"
                            >
                              <Checkbox
                                checked={selectedCodes.has(code)}
                                onCheckedChange={() => handleToggleCode(code)}
                                className="h-3.5 w-3.5"
                              />
                              <span className="truncate text-xs">{code}</span>
                            </label>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t shrink-0">
          <div className="flex items-center justify-between w-full">
            <p className="text-xs text-muted-foreground">
              Dica: Clique no ícone → para selecionar toda a linha, ou ↓ para
              toda a coluna
            </p>
            <div className="flex items-center gap-2">
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
                  'Salvar Permissões'
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
