'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateTenant } from '@/hooks/admin/use-admin';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

const STATUS_OPTIONS = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];

export default function NewTenantPage() {
  const router = useRouter();
  const createTenant = useCreateTenant();

  const [form, setForm] = useState({
    name: '',
    slug: '',
    logoUrl: '',
    status: 'ACTIVE',
  });

  const handleCreate = async () => {
    try {
      await createTenant.mutateAsync({
        name: form.name,
        slug: form.slug || undefined,
        logoUrl: form.logoUrl || undefined,
        status: form.status,
      });
      toast.success('Empresa criada com sucesso');
      router.push('/central/tenants');
    } catch {
      toast.error('Erro ao criar empresa');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/central/tenants">
          <Button variant="ghost" size="icon" aria-label="Voltar para empresas">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Nova Empresa</h1>
      </div>

      <Card className="max-w-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">Informacoes</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Nome da empresa"
            />
          </div>
          <div>
            <Label htmlFor="slug">Slug (opcional)</Label>
            <Input
              id="slug"
              value={form.slug}
              onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
              placeholder="Gerado automaticamente se vazio"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Identificador unico da empresa na URL. Sera gerado a partir do
              nome se deixado em branco.
            </p>
          </div>
          <div>
            <Label htmlFor="logoUrl">URL do Logo (opcional)</Label>
            <Input
              id="logoUrl"
              value={form.logoUrl}
              onChange={e => setForm(f => ({ ...f, logoUrl: e.target.value }))}
              placeholder="https://exemplo.com/logo.png"
            />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={form.status}
              onValueChange={v => setForm(f => ({ ...f, status: v }))}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(s => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <div className="flex justify-end max-w-2xl">
        <Button
          onClick={handleCreate}
          disabled={createTenant.isPending || !form.name.trim()}
          className="gap-2"
        >
          <Save className="h-4 w-4" /> Criar Empresa
        </Button>
      </div>
    </div>
  );
}
