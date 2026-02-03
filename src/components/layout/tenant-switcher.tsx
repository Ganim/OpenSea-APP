'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTenant } from '@/contexts/tenant-context';
import { Building2, ChevronDown, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function TenantSwitcher() {
  const router = useRouter();
  const { currentTenant, tenants, selectTenant } = useTenant();

  if (!currentTenant) return null;

  const handleSwitch = async (tenantId: string) => {
    if (tenantId === currentTenant.id) return;
    await selectTenant(tenantId);
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 max-w-[200px]">
          <Building2 className="h-4 w-4 shrink-0" />
          <span className="truncate">{currentTenant.name}</span>
          <ChevronDown className="h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[240px]">
        <DropdownMenuLabel>Trocar empresa</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {tenants.map(tenant => (
          <DropdownMenuItem
            key={tenant.id}
            onClick={() => handleSwitch(tenant.id)}
            className="gap-2"
          >
            <Building2 className="h-4 w-4 shrink-0" />
            <span className="truncate flex-1">{tenant.name}</span>
            {tenant.id === currentTenant.id && (
              <Check className="h-4 w-4 shrink-0 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/select-tenant')}>
          Ver todas as empresas
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
