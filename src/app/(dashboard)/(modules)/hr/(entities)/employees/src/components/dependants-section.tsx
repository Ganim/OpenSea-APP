'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { VerifyActionPinModal } from '@/components/modals/verify-action-pin-modal';
import type {
  CreateDependantData,
  EmployeeDependant,
  UpdateDependantData,
} from '@/types/hr';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Baby,
  Calendar,
  Edit,
  Heart,
  Loader2,
  Plus,
  Trash2,
  Users,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { translateError } from '@/lib/errors';
import {
  dependantsApi,
  dependantKeys,
} from '../api/dependants.api';
import { DependantModal } from '../modals/dependant-modal';

interface DependantsSectionProps {
  employeeId: string;
}

const RELATIONSHIP_LABELS: Record<string, string> = {
  SPOUSE: 'Cônjuge',
  CHILD: 'Filho(a)',
  STEPCHILD: 'Enteado(a)',
  PARENT: 'Pai/Mãe',
  OTHER: 'Outro',
};

function formatDate(date: string | undefined): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('pt-BR');
}

export function DependantsSection({ employeeId }: DependantsSectionProps) {
  const queryClient = useQueryClient();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<EmployeeDependant | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // ============================================================================
  // DATA
  // ============================================================================

  const { data: dependants = [], isLoading } = useQuery<EmployeeDependant[]>({
    queryKey: dependantKeys.list(employeeId),
    queryFn: () => dependantsApi.list(employeeId),
  });

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  const createMutation = useMutation({
    mutationFn: (data: CreateDependantData) =>
      dependantsApi.create(employeeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: dependantKeys.list(employeeId),
      });
      toast.success('Dependente adicionado com sucesso!');
      setIsCreateOpen(false);
    },
    onError: (error: Error) => {
      toast.error(translateError(error));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateDependantData;
    }) => dependantsApi.update(employeeId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: dependantKeys.list(employeeId),
      });
      toast.success('Dependente atualizado com sucesso!');
      setEditTarget(null);
    },
    onError: (error: Error) => {
      toast.error(translateError(error));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => dependantsApi.delete(employeeId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: dependantKeys.list(employeeId),
      });
      toast.success('Dependente removido com sucesso!');
      setDeleteTarget(null);
      setIsDeleteOpen(false);
    },
    onError: (error: Error) => {
      toast.error(translateError(error));
    },
  });

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleCreate = useCallback(
    (data: CreateDependantData | UpdateDependantData) => {
      createMutation.mutate(data as CreateDependantData);
    },
    [createMutation]
  );

  const handleEdit = useCallback(
    (data: CreateDependantData | UpdateDependantData) => {
      if (!editTarget) return;
      updateMutation.mutate({
        id: editTarget.id,
        data: data as UpdateDependantData,
      });
    },
    [editTarget, updateMutation]
  );

  const handleDeleteRequest = useCallback((id: string) => {
    setDeleteTarget(id);
    setIsDeleteOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget);
  }, [deleteTarget, deleteMutation]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Card className="p-4 sm:p-6 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg uppercase font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" />
          Dependentes
        </h3>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsCreateOpen(true)}
          className="gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Adicionar
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : dependants.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Users className="h-12 w-12 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">
            Nenhum dependente cadastrado
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Clique em &quot;Adicionar&quot; para registrar um dependente.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {dependants.map(dep => (
            <div
              key={dep.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-500/10 shrink-0">
                  {dep.relationship === 'CHILD' ||
                  dep.relationship === 'STEPCHILD' ? (
                    <Baby className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                  ) : dep.relationship === 'SPOUSE' ? (
                    <Heart className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                  ) : (
                    <Users className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm truncate">{dep.name}</p>
                    <Badge variant="secondary" className="text-xs">
                      {RELATIONSHIP_LABELS[dep.relationship] || dep.relationship}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDate(dep.birthDate)}
                    </span>
                    {dep.isIrrfDependant && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-sky-50 text-sky-700 dark:bg-sky-500/8 dark:text-sky-300 border-sky-200 dark:border-sky-500/20"
                      >
                        IRRF
                      </Badge>
                    )}
                    {dep.isSalarioFamilia && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-500/8 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/20"
                      >
                        Sal. Família
                      </Badge>
                    )}
                    {dep.hasDisability && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-amber-50 text-amber-700 dark:bg-amber-500/8 dark:text-amber-300 border-amber-200 dark:border-amber-500/20"
                      >
                        PcD
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setEditTarget(dep)}
                >
                  <Edit className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                  onClick={() => handleDeleteRequest(dep.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <DependantModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
        isSubmitting={createMutation.isPending}
      />

      {/* Edit Modal */}
      <DependantModal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSubmit={handleEdit}
        isSubmitting={updateMutation.isPending}
        dependant={editTarget}
      />

      {/* Delete Confirmation */}
      <VerifyActionPinModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeleteTarget(null);
        }}
        onSuccess={handleDeleteConfirm}
        title="Excluir Dependente"
        description="Digite seu PIN de ação para excluir este dependente. Esta ação não pode ser desfeita."
      />
    </Card>
  );
}
