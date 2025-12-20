'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import * as rbacService from '@/services/rbac/rbac.service';
import type { Permission } from '@/types/rbac';
import { Plus, Search, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [filteredPermissions, setFilteredPermissions] = useState<Permission[]>(
    []
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        const response = await rbacService.listPermissions();
        setPermissions(response.data);
        setFilteredPermissions(response.data);
      } catch (error) {
        console.error('Erro ao carregar permissões:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPermissions();
  }, []);

  useEffect(() => {
    const q = searchQuery.toLowerCase();
    const filtered = permissions.filter(
      perm =>
        perm.name?.toLowerCase().includes(q) ||
        perm.code?.toLowerCase().includes(q) ||
        perm.description?.toLowerCase().includes(q) ||
        perm.module?.toLowerCase().includes(q)
    );
    setFilteredPermissions(filtered);
  }, [searchQuery, permissions]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 to-cyan-600">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Permissões</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie permissões de acesso
            </p>
          </div>
        </div>

        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Permissão
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, código ou módulo..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {filteredPermissions.length > 0 ? (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredPermissions.map(perm => (
              <Card key={perm.id} className="p-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">{perm.name}</h3>
                  <p className="text-sm text-muted-foreground">{perm.code}</p>
                  {perm.description && (
                    <p className="text-sm">{perm.description}</p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 rounded-lg border border-dashed">
            <p className="text-muted-foreground">
              {isLoading ? 'Carregando...' : 'Nenhuma permissão encontrada'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
