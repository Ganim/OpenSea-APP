'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NavigationWizardDialog } from '@/components/ui/navigation-wizard-dialog';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { showErrorToast, showSuccessToast } from '@/lib/toast-utils';
import { logger } from '@/lib/logger';
import * as rbacService from '@/services/rbac/rbac.service';
import type {
  AllPermissionsResponse,
  PermissionGroup,
  PermissionWithEffect,
} from '@/types/rbac';
import { ChevronsDownUp, ChevronsUpDown, Loader2, Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  MATRIX_TABS,
  getActionChipLabel,
  getResourceGroups,
  mapActionToStandard,
  type MatrixTab,
  type StandardAction,
} from '../config/permission-matrix-config';
import { PermissionGroupHeader } from '../components/permission-group-header';
import { PermissionResourceCard } from '../components/permission-resource-card';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ManagePermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: PermissionGroup | null;
  onSuccess: () => void;
}

/** Maps action → Set of permission codes for a given resource */
type ActionCodeMap = Map<string, Set<string>>;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

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
  const [searchQuery, setSearchQuery] = useState('');
  const [allExpanded, setAllExpanded] = useState(false);

  // ─── Load data ──────────────────────────────────────────────────────
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
      setSearchQuery('');
      setAllExpanded(false);
    }
  }, [isOpen, group, loadData]);

  // ─── Build enriched tabs (static config + auto-generated resources) ──
  const { enrichedTabs, resourceActionMaps, selectedCounts, totalCounts } =
    useMemo(() => {
      if (!allPermissions)
        return {
          enrichedTabs: MATRIX_TABS,
          resourceActionMaps: {} as Record<string, ActionCodeMap[]>,
          selectedCounts: {} as Record<string, number>,
          totalCounts: {} as Record<string, number>,
        };

      // Step 1: Index all backend codes by backendKey → action → codes
      const codesByBackendResource = new Map<
        string,
        Map<string, Set<string>>
      >();

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
            const action = mapActionToStandard(perm.action);
            if (!actionMap.has(action)) {
              actionMap.set(action, new Set());
            }
            actionMap.get(action)!.add(perm.code);
          }
        }
      }

      // Step 2: Find which backend resources are already mapped in config
      const mappedBackendKeys = new Set<string>();
      for (const tab of MATRIX_TABS) {
        for (const resource of tab.resources) {
          for (const br of resource.backendResources) {
            mappedBackendKeys.add(br);
          }
        }
      }

      // Step 3: Build a module→tab lookup and collect unmapped resources
      const moduleToTabId: Record<string, string> = {};
      for (const tab of MATRIX_TABS) {
        // Map module prefixes to tab ids
        for (const resource of tab.resources) {
          for (const br of resource.backendResources) {
            const modulePart = br.split('.')[0];
            if (!moduleToTabId[modulePart]) {
              moduleToTabId[modulePart] = tab.id;
            }
          }
        }
      }
      // Explicit mappings for modules that share tabs
      moduleToTabId['esocial'] = moduleToTabId['esocial'] ?? 'hr';

      // Group unmapped backend resources by tab
      const unmappedByTab: Record<
        string,
        Array<{
          label: string;
          group: string;
          backendResources: string[];
          availableActions: StandardAction[];
        }>
      > = {};

      for (const [backendKey, actionMap] of codesByBackendResource) {
        if (mappedBackendKeys.has(backendKey)) continue;

        const parts = backendKey.split('.');
        const modulePart = parts[0];
        const resourcePart = parts.slice(1).join('.');
        const tabId = moduleToTabId[modulePart];
        if (!tabId) continue; // truly orphaned — shouldn't happen

        // Auto-generate a resource entry
        const label = resourcePart
          .replace(/-/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase());

        if (!unmappedByTab[tabId]) unmappedByTab[tabId] = [];
        unmappedByTab[tabId].push({
          label,
          group: 'Outros',
          backendResources: [backendKey],
          availableActions: [...actionMap.keys()] as StandardAction[],
        });
      }

      // Step 4: Create enriched tabs (original + auto-generated resources)
      const enriched: MatrixTab[] = MATRIX_TABS.map(tab => {
        const extra = unmappedByTab[tab.id];
        if (!extra || extra.length === 0) return tab;
        return {
          ...tab,
          resources: [...tab.resources, ...extra],
        };
      });

      // Step 5: Build action-code maps and counts using enriched tabs
      const allMaps: Record<string, ActionCodeMap[]> = {};
      const selCounts: Record<string, number> = {};
      const totCounts: Record<string, number> = {};

      for (const tab of enriched) {
        const maps: ActionCodeMap[] = [];
        let tabTotal = 0;
        let tabSelected = 0;

        for (const resource of tab.resources) {
          const actionCodes: ActionCodeMap = new Map();

          for (const br of resource.backendResources) {
            const backendMap = codesByBackendResource.get(br);
            if (!backendMap) continue;
            for (const [action, codes] of backendMap) {
              if (!actionCodes.has(action)) {
                actionCodes.set(action, new Set());
              }
              for (const code of codes) {
                actionCodes.get(action)!.add(code);
              }
            }
          }

          // Count ALL actions present (not just availableActions)
          for (const action of resource.availableActions) {
            const codes = actionCodes.get(action);
            if (!codes) continue;
            for (const code of codes) {
              tabTotal++;
              if (selectedCodes.has(code)) tabSelected++;
            }
          }

          maps.push(actionCodes);
        }

        allMaps[tab.id] = maps;
        selCounts[tab.id] = tabSelected;
        totCounts[tab.id] = tabTotal;
      }

      return {
        enrichedTabs: enriched,
        resourceActionMaps: allMaps,
        selectedCounts: selCounts,
        totalCounts: totCounts,
      };
    }, [allPermissions, selectedCodes]);

  // ─── Toggle handlers ────────────────────────────────────────────────

  const handleToggleCode = useCallback((code: string) => {
    setSelectedCodes(prev => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }, []);

  const handleBulkToggle = useCallback(
    (codes: string[], forceState: boolean) => {
      setSelectedCodes(prev => {
        const next = new Set(prev);
        for (const code of codes) {
          if (forceState) next.add(code);
          else next.delete(code);
        }
        return next;
      });
    },
    []
  );

  /** Collect all codes for a given tab */
  const getTabCodes = useCallback(
    (tabId: string): string[] => {
      const maps = resourceActionMaps[tabId];
      const tab = enrichedTabs.find(t => t.id === tabId);
      if (!maps || !tab) return [];
      const codes: string[] = [];
      tab.resources.forEach((resource, idx) => {
        for (const action of resource.availableActions) {
          const actionCodes = maps[idx]?.get(action);
          if (actionCodes) codes.push(...actionCodes);
        }
      });
      return codes;
    },
    [resourceActionMaps, enrichedTabs]
  );

  /** Collect all codes for a group within the active tab */
  const getGroupCodes = useCallback(
    (groupName: string): string[] => {
      const maps = resourceActionMaps[activeTab];
      const tab = enrichedTabs.find(t => t.id === activeTab);
      if (!maps || !tab) return [];
      const codes: string[] = [];
      tab.resources.forEach((resource, idx) => {
        if (resource.group !== groupName) return;
        for (const action of resource.availableActions) {
          const actionCodes = maps[idx]?.get(action);
          if (actionCodes) codes.push(...actionCodes);
        }
      });
      return codes;
    },
    [activeTab, resourceActionMaps, enrichedTabs]
  );

  /** Collect all codes for a specific resource */
  const getResourceCodes = useCallback(
    (resourceIdx: number): string[] => {
      const maps = resourceActionMaps[activeTab];
      const tab = enrichedTabs.find(t => t.id === activeTab);
      if (!maps || !tab) return [];
      const resource = tab.resources[resourceIdx];
      const codes: string[] = [];
      for (const action of resource.availableActions) {
        const actionCodes = maps[resourceIdx]?.get(action);
        if (actionCodes) codes.push(...actionCodes);
      }
      return codes;
    },
    [activeTab, resourceActionMaps, enrichedTabs]
  );

  // ─── Save (diff-based) ─────────────────────────────────────────────

  const handleSave = async () => {
    if (!group) return;
    setIsSaving(true);

    try {
      const toAdd = [...selectedCodes].filter(c => !currentCodes.has(c));
      const toRemove = [...currentCodes].filter(c => !selectedCodes.has(c));

      if (toAdd.length > 0) {
        await rbacService.addPermissionsToGroupBulk(
          group.id,
          toAdd.map(code => ({ permissionCode: code, effect: 'allow' }))
        );
      }

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

  // ─── Active tab config ─────────────────────────────────────────────

  const activeTabConfig = useMemo(
    () => enrichedTabs.find(t => t.id === activeTab),
    [activeTab, enrichedTabs]
  );

  const groups = useMemo(
    () => (activeTabConfig ? getResourceGroups(activeTabConfig) : []),
    [activeTabConfig]
  );

  // ─── Search filter ──────────────────────────────────────────────────

  const normalizedSearch = searchQuery.toLowerCase().trim();

  const matchesSearch = useCallback(
    (resource: (typeof MATRIX_TABS)[0]['resources'][0]) => {
      if (!normalizedSearch) return true;
      if (resource.label.toLowerCase().includes(normalizedSearch)) return true;
      // Match on action labels
      for (const action of resource.availableActions) {
        if (getActionChipLabel(action).toLowerCase().includes(normalizedSearch))
          return true;
      }
      // Match on backend resource code
      for (const br of resource.backendResources) {
        if (br.toLowerCase().includes(normalizedSearch)) return true;
      }
      return false;
    },
    [normalizedSearch]
  );

  // ─── Nav badge color ────────────────────────────────────────────────

  function getBadgeClass(tabId: string) {
    const selected = selectedCounts[tabId] ?? 0;
    const total = totalCounts[tabId] ?? 0;
    if (total === 0 || selected === 0) {
      return 'bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-white/40';
    }
    if (selected === total) {
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400';
    }
    return 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400';
  }

  // ─── Build NavigationWizardDialog sections ──────────────────────────

  const navSections = useMemo(
    () =>
      enrichedTabs.map(tab => {
        const Icon = tab.icon;
        const selected = selectedCounts[tab.id] ?? 0;
        const total = totalCounts[tab.id] ?? 0;

        return {
          id: tab.id,
          label: tab.label,
          icon: <Icon className="h-4 w-4" />,
          description: `${tab.resources.length} recursos`,
          badge: !isLoading ? (
            <span
              className={cn(
                'text-[11px] font-medium tabular-nums rounded-full px-2 py-0.5',
                getBadgeClass(tab.id)
              )}
            >
              {selected}/{total}
            </span>
          ) : undefined,
        };
      }),
    [enrichedTabs, selectedCounts, totalCounts, isLoading]
  );

  if (!group) return null;

  // ─── Total across all modules ───────────────────────────────────────

  const totalSelected = Object.values(selectedCounts).reduce(
    (a, b) => a + b,
    0
  );
  const totalAll = Object.values(totalCounts).reduce((a, b) => a + b, 0);

  // ─── Render ─────────────────────────────────────────────────────────

  return (
    <NavigationWizardDialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) onClose();
      }}
      title="Permissões"
      subtitle={`Grupo: ${group.name}`}
      sections={navSections}
      activeSection={activeTab}
      onSectionChange={id => {
        setActiveTab(id);
        setSearchQuery('');
      }}
      variant="detailed"
      isPending={isSaving}
      footer={
        <>
          <div className="flex-1 text-xs text-muted-foreground tabular-nums">
            Total: {totalSelected} / {totalAll} permissões
          </div>
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
        </>
      }
    >
      <TooltipProvider delayDuration={300}>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-0">
            {/* Search + Actions bar */}
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={`Buscar em ${activeTabConfig?.label ?? ''}...`}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-2.5 text-xs gap-1.5"
                onClick={() => setAllExpanded(prev => !prev)}
              >
                {allExpanded ? (
                  <>
                    <ChevronsDownUp className="h-3.5 w-3.5" />
                    Recolher
                  </>
                ) : (
                  <>
                    <ChevronsUpDown className="h-3.5 w-3.5" />
                    Expandir
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-2.5 text-xs"
                onClick={() => handleBulkToggle(getTabCodes(activeTab), false)}
                disabled={isSaving}
              >
                Limpar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-2.5 text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                onClick={() => handleBulkToggle(getTabCodes(activeTab), true)}
                disabled={isSaving}
              >
                Ativar tudo
              </Button>
            </div>

            {/* Groups + Resources */}
            {groups.map(groupName => {
              const groupResources = activeTabConfig!.resources
                .map((r, idx) => ({ resource: r, idx }))
                .filter(({ resource }) => resource.group === groupName)
                .filter(({ resource }) => matchesSearch(resource));

              if (groupResources.length === 0) return null;

              const groupCodes = getGroupCodes(groupName);
              const allGroupActive =
                groupCodes.length > 0 &&
                groupCodes.every(c => selectedCodes.has(c));

              return (
                <div key={groupName}>
                  <PermissionGroupHeader
                    label={groupName}
                    resourceCount={groupResources.length}
                    onActivateAll={() =>
                      handleBulkToggle(groupCodes, !allGroupActive)
                    }
                    allActive={allGroupActive}
                    disabled={isSaving}
                  />

                  {groupResources.map(({ resource, idx }) => {
                    const actionCodeMap =
                      resourceActionMaps[activeTab]?.[idx] ?? new Map();

                    return (
                      <PermissionResourceCard
                        key={resource.backendResources.join(',')}
                        label={resource.label}
                        actions={resource.availableActions}
                        actionCodeMap={actionCodeMap}
                        selectedCodes={selectedCodes}
                        onToggleCode={handleToggleCode}
                        onActivateAll={() =>
                          handleBulkToggle(getResourceCodes(idx), true)
                        }
                        onClearAll={() =>
                          handleBulkToggle(getResourceCodes(idx), false)
                        }
                        disabled={isSaving}
                        defaultExpanded={allExpanded}
                        searchQuery={normalizedSearch}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </TooltipProvider>
    </NavigationWizardDialog>
  );
}
