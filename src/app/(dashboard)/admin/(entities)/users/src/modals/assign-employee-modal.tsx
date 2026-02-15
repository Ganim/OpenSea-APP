'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { employeesService } from '@/services/hr/employees.service';
import type { Employee } from '@/types/hr';
import type { User } from '@/types/auth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, UserCheck } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface AssignEmployeeModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUser: User | null;
}

export function AssignEmployeeModal({
  isOpen,
  onOpenChange,
  selectedUser,
}: AssignEmployeeModalProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isLinking, setIsLinking] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['unlinked-employees', search],
    queryFn: async () => {
      const response = await employeesService.listEmployees({
        unlinked: true,
        search: search || undefined,
        perPage: 20,
      });
      return response.employees;
    },
    enabled: isOpen,
  });

  const employees = data ?? [];

  const handleLink = async (employee: Employee) => {
    if (!selectedUser) return;
    setIsLinking(true);
    try {
      await employeesService.linkUserToEmployee(employee.id, selectedUser.id);
      toast.success(`Funcionário ${employee.fullName} vinculado com sucesso`);
      queryClient.invalidateQueries({ queryKey: ['unlinked-employees'] });
      queryClient.invalidateQueries({ queryKey: ['user-employee-links'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onOpenChange(false);
    } catch {
      toast.error('Erro ao vincular funcionário');
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <UserCheck className="h-5 w-5" />
            Vincular Funcionário - {selectedUser?.username}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Buscar funcionário por nome, matrícula ou CPF..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : employees.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {employees.map(emp => (
                <Card
                  key={emp.id}
                  className="flex items-center justify-between p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{emp.fullName}</p>
                    <p className="text-xs text-muted-foreground">
                      {emp.registrationNumber} &middot; {emp.cpf}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleLink(emp)}
                    disabled={isLinking}
                  >
                    Vincular
                  </Button>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center border rounded-lg border-dashed">
              Nenhum funcionário sem vínculo encontrado
            </p>
          )}
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
