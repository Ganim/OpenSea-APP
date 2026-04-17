/**
 * Interactive Org Chart Page
 * Organograma interativo da estrutura organizacional
 */

'use client';

import { GridLoading } from '@/components/handlers/grid-loading';
import { PageActionBar } from '@/components/layout/page-action-bar';
import {
  PageBody,
  PageHeader,
  PageLayout,
} from '@/components/layout/page-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { departmentsService, employeesService } from '@/services/hr';
import type { Department, Employee } from '@/types/hr';
import { useQuery } from '@tanstack/react-query';
import {
  Building2,
  ChevronDown,
  ChevronRight,
  Crown,
  Minus,
  Plus,
  RotateCcw,
  Search,
  User,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useRef, useState } from 'react';

// ============================================================================
// TYPES
// ============================================================================

interface DepartmentNode {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  parentId?: string | null;
  managerId?: string | null;
  isActive: boolean;
  employeeCount: number;
  manager?: Employee | null;
  children: DepartmentNode[];
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function OrgChartPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch all departments
  const { data: departmentsData, isLoading: isLoadingDepts } = useQuery({
    queryKey: ['org-chart-departments'],
    queryFn: async () => {
      const response = await departmentsService.listDepartments({
        perPage: 100,
      });
      return response.departments;
    },
  });

  // Fetch all employees (for manager names + counts)
  const { data: employeesData, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ['org-chart-employees'],
    queryFn: async () => {
      const response = await employeesService.listEmployees({
        perPage: 100,
        status: 'ACTIVE',
      });
      return response.employees;
    },
  });

  // Build tree structure
  const tree = useMemo(() => {
    if (!departmentsData) return [];

    const employeesByDept = new Map<string, Employee[]>();
    const employeesById = new Map<string, Employee>();

    if (employeesData) {
      for (const emp of employeesData) {
        employeesById.set(emp.id, emp);
        if (emp.departmentId) {
          const list = employeesByDept.get(emp.departmentId) || [];
          list.push(emp);
          employeesByDept.set(emp.departmentId, list);
        }
      }
    }

    const nodeMap = new Map<string, DepartmentNode>();
    for (const dept of departmentsData) {
      nodeMap.set(dept.id, {
        id: dept.id,
        name: dept.name,
        code: dept.code,
        description: dept.description,
        parentId: dept.parentId,
        managerId: dept.managerId,
        isActive: dept.isActive,
        employeeCount:
          dept._count?.employees ?? (employeesByDept.get(dept.id)?.length || 0),
        manager: dept.managerId
          ? employeesById.get(dept.managerId) || null
          : null,
        children: [],
      });
    }

    const roots: DepartmentNode[] = [];
    for (const node of nodeMap.values()) {
      if (node.parentId && nodeMap.has(node.parentId)) {
        nodeMap.get(node.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }

    // Sort children alphabetically
    const sortChildren = (nodes: DepartmentNode[]) => {
      nodes.sort((a, b) => a.name.localeCompare(b.name));
      for (const n of nodes) sortChildren(n.children);
    };
    sortChildren(roots);

    return roots;
  }, [departmentsData, employeesData]);

  // Search filter — highlight matching nodes
  const matchingIds = useMemo(() => {
    if (!searchQuery.trim()) return new Set<string>();
    const q = searchQuery.toLowerCase();
    const ids = new Set<string>();

    const search = (nodes: DepartmentNode[]) => {
      for (const node of nodes) {
        if (
          node.name.toLowerCase().includes(q) ||
          node.code.toLowerCase().includes(q) ||
          node.manager?.fullName?.toLowerCase().includes(q)
        ) {
          ids.add(node.id);
          // Also add all ancestors
          let parentId = node.parentId;
          while (parentId) {
            ids.add(parentId);
            const parent = departmentsData?.find(d => d.id === parentId);
            parentId = parent?.parentId;
          }
        }
        search(node.children);
      }
    };
    search(tree);
    return ids;
  }, [searchQuery, tree, departmentsData]);

  // Collapse/expand
  const toggleCollapse = useCallback((nodeId: string) => {
    setCollapsedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback(() => setCollapsedNodes(new Set()), []);
  const collapseAll = useCallback(() => {
    if (!departmentsData) return;
    const allIds = new Set(departmentsData.map(d => d.id));
    setCollapsedNodes(allIds);
  }, [departmentsData]);

  // Zoom controls
  const zoomIn = useCallback(() => setZoom(z => Math.min(z + 0.15, 2)), []);
  const zoomOut = useCallback(() => setZoom(z => Math.max(z - 0.15, 0.3)), []);
  const resetZoom = useCallback(() => setZoom(1), []);

  // Navigation
  const handleDeptClick = useCallback(
    (deptId: string) => {
      router.push(`/hr/departments/${deptId}`);
    },
    [router]
  );

  const handleEmployeeClick = useCallback(
    (employeeId: string) => {
      router.push(`/hr/employees/${employeeId}`);
    },
    [router]
  );

  const isLoading = isLoadingDepts || isLoadingEmployees;

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <PageLayout data-testid="departments-org-chart-page">
      <PageHeader>
        <PageActionBar
          breadcrumbItems={[
            { label: 'RH', href: '/hr' },
            { label: 'Departamentos', href: '/hr/departments' },
            { label: 'Organograma' },
          ]}
        />
      </PageHeader>

      <PageBody>
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar departamento ou gestor..."
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={expandAll}
              className="h-9 px-2.5"
            >
              Expandir Tudo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={collapseAll}
              className="h-9 px-2.5"
            >
              Recolher Tudo
            </Button>
            <div className="h-6 w-px bg-border mx-1" />
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={zoomOut}
              title="Diminuir zoom"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground min-w-[3rem] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={zoomIn}
              title="Aumentar zoom"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={resetZoom}
              title="Redefinir zoom"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Chart Area */}
        {isLoading ? (
          <GridLoading count={3} layout="list" size="md" />
        ) : tree.length === 0 ? (
          <Card className="bg-white/5 p-12 text-center">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">
              Nenhum departamento encontrado
            </h2>
            <p className="text-muted-foreground mb-6">
              Cadastre departamentos para visualizar o organograma.
            </p>
            <Button onClick={() => router.push('/hr/departments')}>
              Ir para Departamentos
            </Button>
          </Card>
        ) : (
          <div
            ref={containerRef}
            className="overflow-auto rounded-xl border border-border bg-white/50 dark:bg-slate-900/50 p-8"
            style={{ minHeight: '500px' }}
          >
            <div
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'top left',
                transition: 'transform 0.2s ease',
              }}
            >
              <div className="flex flex-col items-center gap-0">
                {tree.map((root, idx) => (
                  <div key={root.id} className={idx > 0 ? 'mt-10' : ''}>
                    <OrgNode
                      department={root}
                      level={0}
                      collapsedNodes={collapsedNodes}
                      matchingIds={matchingIds}
                      searchActive={searchQuery.trim().length > 0}
                      onToggleCollapse={toggleCollapse}
                      onDeptClick={handleDeptClick}
                      onEmployeeClick={handleEmployeeClick}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </PageBody>
    </PageLayout>
  );
}

// ============================================================================
// ORG NODE COMPONENT
// ============================================================================

interface OrgNodeProps {
  department: DepartmentNode;
  level: number;
  collapsedNodes: Set<string>;
  matchingIds: Set<string>;
  searchActive: boolean;
  onToggleCollapse: (id: string) => void;
  onDeptClick: (id: string) => void;
  onEmployeeClick: (id: string) => void;
}

function OrgNode({
  department,
  level,
  collapsedNodes,
  matchingIds,
  searchActive,
  onToggleCollapse,
  onDeptClick,
  onEmployeeClick,
}: OrgNodeProps) {
  const isCollapsed = collapsedNodes.has(department.id);
  const hasChildren = department.children.length > 0;
  const isHighlighted = searchActive && matchingIds.has(department.id);
  const isDimmed = searchActive && !matchingIds.has(department.id);

  return (
    <div className="flex flex-col items-center">
      {/* Department Card */}
      <div
        className={`
          bg-white dark:bg-slate-800 border rounded-xl p-4 min-w-[220px] max-w-[280px]
          shadow-sm transition-all cursor-pointer
          hover:shadow-md hover:border-violet-300 dark:hover:border-violet-600
          ${isHighlighted ? 'border-violet-500 ring-2 ring-violet-500/30 shadow-violet-100 dark:shadow-violet-900/20' : 'border-border'}
          ${isDimmed ? 'opacity-40' : ''}
          ${!department.isActive ? 'opacity-60 border-dashed' : ''}
        `}
        onClick={() => onDeptClick(department.id)}
        title={`Clique para ver detalhes de ${department.name}`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`
              w-9 h-9 rounded-lg flex items-center justify-center shrink-0
              ${
                level === 0
                  ? 'bg-gradient-to-br from-violet-500 to-violet-600'
                  : level === 1
                    ? 'bg-gradient-to-br from-sky-500 to-sky-600'
                    : 'bg-gradient-to-br from-emerald-500 to-emerald-600'
              }
            `}
          >
            <Building2 className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{department.name}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Users className="h-3 w-3" />
              {department.employeeCount} funcionário
              {department.employeeCount !== 1 ? 's' : ''}
            </p>
          </div>
          {hasChildren && (
            <button
              onClick={e => {
                e.stopPropagation();
                onToggleCollapse(department.id);
              }}
              className="p-1 rounded-md hover:bg-muted/80 transition-colors shrink-0"
              title={isCollapsed ? 'Expandir' : 'Recolher'}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          )}
        </div>

        {/* Manager */}
        {department.manager && (
          <div
            className="mt-3 pt-3 border-t border-border/50 flex items-center gap-2 cursor-pointer hover:bg-muted/50 rounded-md -mx-1 px-1 py-0.5 transition-colors"
            onClick={e => {
              e.stopPropagation();
              onEmployeeClick(department.manager!.id);
            }}
            title={`Ver perfil de ${department.manager.fullName}`}
          >
            <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
              <Crown className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-xs truncate">
              {department.manager.fullName}
            </span>
          </div>
        )}

        {!department.manager && department.managerId && (
          <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0">
              <User className="h-3 w-3 text-muted-foreground" />
            </div>
            <span className="text-xs text-muted-foreground italic">
              Gestor não encontrado
            </span>
          </div>
        )}
      </div>

      {/* Connector Lines + Children */}
      {hasChildren && !isCollapsed && (
        <>
          {/* Vertical line from parent */}
          <div className="w-px h-6 bg-border" />

          {department.children.length === 1 ? (
            // Single child — straight line
            <OrgNode
              department={department.children[0]}
              level={level + 1}
              collapsedNodes={collapsedNodes}
              matchingIds={matchingIds}
              searchActive={searchActive}
              onToggleCollapse={onToggleCollapse}
              onDeptClick={onDeptClick}
              onEmployeeClick={onEmployeeClick}
            />
          ) : (
            // Multiple children — horizontal connector
            <div className="relative">
              {/* Horizontal bar */}
              <div className="flex items-start">
                {department.children.map((child, idx) => {
                  const isFirst = idx === 0;
                  const isLast = idx === department.children.length - 1;

                  return (
                    <div
                      key={child.id}
                      className={`flex flex-col items-center ${idx > 0 ? 'ml-8' : ''}`}
                    >
                      {/* Top connector: horizontal line + vertical drop */}
                      <div className="relative w-full flex justify-center">
                        {/* Horizontal connector line */}
                        <div
                          className={`absolute top-0 h-px bg-border ${
                            isFirst
                              ? 'left-1/2 right-0'
                              : isLast
                                ? 'left-0 right-1/2'
                                : 'left-0 right-0'
                          }`}
                          style={{
                            right: isFirst ? '-1rem' : isLast ? '50%' : '-1rem',
                            left: isFirst ? '50%' : isLast ? '-1rem' : '-1rem',
                          }}
                        />
                        {/* Vertical drop line */}
                        <div className="w-px h-6 bg-border" />
                      </div>

                      <OrgNode
                        department={child}
                        level={level + 1}
                        collapsedNodes={collapsedNodes}
                        matchingIds={matchingIds}
                        searchActive={searchActive}
                        onToggleCollapse={onToggleCollapse}
                        onDeptClick={onDeptClick}
                        onEmployeeClick={onEmployeeClick}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Collapsed indicator */}
      {hasChildren && isCollapsed && (
        <div className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
          <ChevronRight className="h-3 w-3" />
          {department.children.length} subdepartamento
          {department.children.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
