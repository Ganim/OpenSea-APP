/**
 * Manage Groups Modal
 * Renderiza modal para gerenciar grupos de um usuário
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Shield, X } from 'lucide-react';
import type { ManageGroupsModalProps } from '../types/users.types';

export function ManageGroupsModal({
  isOpen,
  onOpenChange,
  selectedUser,
  userGroups,
  availableGroups,
  onAssignGroup,
  onRemoveGroup,
  isLoading = false,
}: ManageGroupsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Shield className="h-5 w-5" />
            Gerenciar Grupos - {selectedUser?.username}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Assigned Groups */}
          <div>
            <h3 className="mb-3 text-sm font-medium">
              Grupos Atribuídos ({userGroups.length})
            </h3>
            {userGroups.length > 0 ? (
              <div className="space-y-2">
                {userGroups.map(({ group, expiresAt }) => {
                  const groupColor = group.color || '#8B5CF6';
                  return (
                    <div
                      key={group.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-linear-to-r from-slate-100 dark:from-slate-800 to-transparent"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                          style={{
                            background: `linear-gradient(to bottom right, ${groupColor}, ${groupColor}CC)`,
                          }}
                        >
                          <Shield className="h-5 w-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{group.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant="outline"
                              style={
                                group.color
                                  ? { borderColor: group.color }
                                  : undefined
                              }
                            >
                              Prioridade: {group.priority}
                            </Badge>
                            {expiresAt && (
                              <Badge variant="secondary">
                                Expira:{' '}
                                {new Date(expiresAt).toLocaleDateString(
                                  'pt-BR'
                                )}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemoveGroup(group.id)}
                        disabled={isLoading}
                        aria-label="Remover grupo"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center border rounded-lg border-dashed">
                Nenhum grupo atribuído
              </p>
            )}
          </div>

          {/* Available Groups */}
          <div className="border-t pt-4">
            <h3 className="mb-3 text-sm font-medium">Grupos Disponíveis</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {availableGroups
                .filter(
                  group => !userGroups.some(ug => ug.group.id === group.id)
                )
                .map(group => {
                  const groupColor = group.color || '#8B5CF6';
                  return (
                    <div
                      key={group.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-linear-to-r from-slate-100 dark:from-slate-800 to-transparent"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                          style={{
                            background: `linear-gradient(to bottom right, ${groupColor}, ${groupColor}CC)`,
                          }}
                        >
                          <Shield className="h-5 w-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{group.name}</p>
                          {group.description && (
                            <p className="text-sm text-muted-foreground truncate">
                              {group.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAssignGroup(group.id)}
                        disabled={isLoading}
                      >
                        Atribuir
                      </Button>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
